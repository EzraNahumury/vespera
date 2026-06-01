// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IVotingEngine} from "./interfaces/IVotingEngine.sol";
import {IArisanGroup} from "./interfaces/IArisanGroup.sol";
import {IReputationRegistry} from "./interfaces/IReputationRegistry.sol";
import {ITreasury} from "./interfaces/ITreasury.sol";
import {IGroupRegistry} from "./interfaces/IGroupRegistry.sol";
import {VesperaTypes, VesperaConstants} from "./libraries/VesperaTypes.sol";

/// @title VotingEngine
/// @notice Reputation-weighted withdrawal voting with AI-confidence routing.
///         - `initVote` is gated by AGENT_ROLE: the off-chain Requester Agent computes a
///           confidence score and pushes it on-chain (a documented trusted oracle).
///         - < 50% confidence auto-rejects; 50-84% => normal vote (60% quorum / 24h);
///           >= 85% => fast-track (30% quorum / 12h).
///         - The requester is excluded from the eligible weight and cannot vote.
///         - Weight per voter = reputation score + 1 (so fresh members still count).
contract VotingEngine is IVotingEngine, AccessControl, ReentrancyGuard {
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

    IReputationRegistry public immutable reputation;
    ITreasury public immutable treasury;
    IGroupRegistry public groupRegistry;

    struct VoteData {
        address requester;
        address token;
        uint256 amount;
        uint16 confidenceBps;
        uint16 quorumBps;
        uint64 deadline;
        bool fastTrack;
        VesperaTypes.VoteStatus status;
        uint256 weightFor;
        uint256 weightAgainst;
        uint256 totalEligibleWeight;
        mapping(address => bool) hasVoted;
        mapping(address => bool) support;
    }

    mapping(bytes32 voteKey => VoteData) private _votes;

    event GroupRegistrySet(address indexed groupRegistry);
    event VoteInitialized(
        address indexed group,
        uint256 indexed requestId,
        bool fastTrack,
        uint16 quorumBps,
        uint64 deadline,
        uint256 totalEligibleWeight
    );
    event VoteAutoRejected(address indexed group, uint256 indexed requestId, uint16 confidenceBps);
    event VoteCast(
        address indexed group, uint256 indexed requestId, address indexed voter, bool support, uint256 weight
    );
    event VoteFinalized(
        address indexed group, uint256 indexed requestId, bool passed, uint256 weightFor, uint256 weightAgainst
    );

    error NotRegisteredGroup();
    error InvalidRequestState();
    error InvalidConfidence();
    error AlreadyInitialized();
    error VoteNotActive();
    error VotingClosed();
    error VotingStillOpen();
    error NotMember();
    error RequesterCannotVote();
    error AlreadyVoted();
    error ZeroAddress();

    constructor(address admin, address reputation_, address treasury_) {
        if (reputation_ == address(0) || treasury_ == address(0)) revert ZeroAddress();
        reputation = IReputationRegistry(reputation_);
        treasury = ITreasury(treasury_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function setGroupRegistry(address registry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (registry == address(0)) revert ZeroAddress();
        groupRegistry = IGroupRegistry(registry);
        emit GroupRegistrySet(registry);
    }

    // --- Vote lifecycle ------------------------------------------------------

    /// @inheritdoc IVotingEngine
    function initVote(address group, uint256 requestId, uint16 confidenceBps)
        external
        onlyRole(AGENT_ROLE)
    {
        if (address(groupRegistry) == address(0) || !groupRegistry.isRegisteredGroup(group)) {
            revert NotRegisteredGroup();
        }
        if (confidenceBps > VesperaConstants.BPS) revert InvalidConfidence();

        (address requester, uint256 amount, address token, VesperaTypes.RequestStatus status) =
            IArisanGroup(group).getRequest(requestId);
        if (status != VesperaTypes.RequestStatus.Pending) revert InvalidRequestState();

        VoteData storage v = _votes[_key(group, requestId)];
        if (v.status != VesperaTypes.VoteStatus.None) revert AlreadyInitialized();

        v.requester = requester;
        v.token = token;
        v.amount = amount;
        v.confidenceBps = confidenceBps;

        // < 50% confidence => auto-reject, no vote opened.
        if (confidenceBps < VesperaConstants.MIN_CONFIDENCE_BPS) {
            v.status = VesperaTypes.VoteStatus.Rejected;
            IArisanGroup(group).markRejected(requestId);
            emit VoteAutoRejected(group, requestId, confidenceBps);
            return;
        }

        bool fast = confidenceBps >= VesperaConstants.FAST_TRACK_CONFIDENCE_BPS;
        v.fastTrack = fast;
        v.quorumBps = fast ? VesperaConstants.FAST_TRACK_QUORUM_BPS : VesperaConstants.NORMAL_QUORUM_BPS;
        uint64 window = fast ? VesperaConstants.FAST_TRACK_WINDOW : VesperaConstants.NORMAL_WINDOW;
        v.deadline = uint64(block.timestamp) + window;
        v.totalEligibleWeight = _eligibleWeight(group, requester);
        v.status = VesperaTypes.VoteStatus.Active;

        IArisanGroup(group).markVoting(requestId);
        emit VoteInitialized(group, requestId, fast, v.quorumBps, v.deadline, v.totalEligibleWeight);
    }

    /// @notice Cast a reputation-weighted vote. One vote per member; requester excluded.
    function castVote(address group, uint256 requestId, bool support) external {
        VoteData storage v = _votes[_key(group, requestId)];
        if (v.status != VesperaTypes.VoteStatus.Active) revert VoteNotActive();
        if (block.timestamp > v.deadline) revert VotingClosed();
        if (!IArisanGroup(group).isMember(msg.sender)) revert NotMember();
        if (msg.sender == v.requester) revert RequesterCannotVote();
        if (v.hasVoted[msg.sender]) revert AlreadyVoted();

        uint256 weight = reputation.scoreOf(msg.sender) + 1;
        v.hasVoted[msg.sender] = true;
        v.support[msg.sender] = support;
        if (support) {
            v.weightFor += weight;
        } else {
            v.weightAgainst += weight;
        }
        emit VoteCast(group, requestId, msg.sender, support, weight);
    }

    /// @notice Tally and settle a vote. Permissionless: anyone may trigger once it can settle
    ///         (deadline passed, or quorum already reached for an early decision).
    function finalize(address group, uint256 requestId) external nonReentrant {
        VoteData storage v = _votes[_key(group, requestId)];
        if (v.status != VesperaTypes.VoteStatus.Active) revert VoteNotActive();

        uint256 quorumWeight = (v.totalEligibleWeight * v.quorumBps) / VesperaConstants.BPS;
        uint256 participation = v.weightFor + v.weightAgainst;
        bool quorumReached = v.totalEligibleWeight > 0 && participation >= quorumWeight;

        if (block.timestamp <= v.deadline && !quorumReached) revert VotingStillOpen();

        bool passed = quorumReached && v.weightFor > v.weightAgainst;

        // Set terminal-ish status before external calls (CEI + reentrancy guard).
        v.status = passed ? VesperaTypes.VoteStatus.Passed : VesperaTypes.VoteStatus.Rejected;
        _recordParticipation(group, _key(group, requestId), v.requester, passed);

        if (passed) {
            treasury.release(group, v.token, v.requester, v.amount);
            IArisanGroup(group).markExecuted(requestId);
            v.status = VesperaTypes.VoteStatus.Executed;
        } else {
            IArisanGroup(group).markRejected(requestId);
        }
        emit VoteFinalized(group, requestId, passed, v.weightFor, v.weightAgainst);
    }

    // --- Internal ------------------------------------------------------------

    function _eligibleWeight(address group, address requester) private view returns (uint256 total) {
        address[] memory members = IArisanGroup(group).getMembers();
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == requester) continue;
            total += reputation.scoreOf(members[i]) + 1;
        }
    }

    function _recordParticipation(address group, bytes32 key, address requester, bool passed) private {
        address[] memory members = IArisanGroup(group).getMembers();
        VoteData storage v = _votes[key];
        for (uint256 i = 0; i < members.length; i++) {
            address m = members[i];
            if (m == requester) continue;
            bool didVote = v.hasVoted[m];
            bool agreed = didVote && (v.support[m] == passed);
            reputation.recordVoteParticipation(m, didVote, agreed);
        }
    }

    function _key(address group, uint256 requestId) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(group, requestId));
    }

    // --- Views ---------------------------------------------------------------

    function getVote(address group, uint256 requestId)
        external
        view
        returns (
            address requester,
            address token,
            uint256 amount,
            uint16 confidenceBps,
            uint16 quorumBps,
            uint64 deadline,
            bool fastTrack,
            VesperaTypes.VoteStatus status,
            uint256 weightFor,
            uint256 weightAgainst,
            uint256 totalEligibleWeight
        )
    {
        VoteData storage v = _votes[_key(group, requestId)];
        return (
            v.requester,
            v.token,
            v.amount,
            v.confidenceBps,
            v.quorumBps,
            v.deadline,
            v.fastTrack,
            v.status,
            v.weightFor,
            v.weightAgainst,
            v.totalEligibleWeight
        );
    }

    function hasVoted(address group, uint256 requestId, address account) external view returns (bool) {
        return _votes[_key(group, requestId)].hasVoted[account];
    }
}
