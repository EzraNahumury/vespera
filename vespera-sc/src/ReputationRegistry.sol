// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IReputationRegistry} from "./interfaces/IReputationRegistry.sol";
import {IGroupRegistry} from "./interfaces/IGroupRegistry.sol";
import {IBadgeNFT} from "./interfaces/IBadgeNFT.sol";
import {VesperaTypes, VesperaConstants} from "./libraries/VesperaTypes.sol";

/// @title ReputationRegistry
/// @notice Per-account reputation (0..1000) aggregated across all groups. Stores raw counters
///         written by registered groups (deposits, joins, penalties) and by the VotingEngine
///         (vote participation), and derives the score on-chain using the README weights
///         (40% deposit / 20% voting / 15% quality / 10% tenure / 10% badges / 5% penalties).
///         Auto-mints reputation badges when thresholds are crossed.
contract ReputationRegistry is IReputationRegistry, Ownable {
    struct Rep {
        uint64 onTimeDeposits;
        uint64 totalDeposits;
        uint64 votesCast;
        uint64 votesEligible;
        uint64 voteAgreements;
        uint64 tenureStart; // timestamp of first group join (0 = never joined)
        uint32 penalties; // cross-group penalty points
        uint32 activeGroups; // number of groups joined (for Cross-Group Veteran)
    }

    IBadgeNFT public immutable badgeNFT;
    IGroupRegistry public groupRegistry;
    address public votingEngine;

    mapping(address account => Rep) private _rep;

    event GroupRegistrySet(address indexed groupRegistry);
    event VotingEngineSet(address indexed votingEngine);
    event DepositRecorded(address indexed account, bool onTime);
    event GroupJoinRecorded(address indexed account, uint32 activeGroups);
    event PenaltyRecorded(address indexed account, uint256 points);
    event VoteParticipationRecorded(address indexed account, bool didVote, bool agreed);

    error NotRegisteredGroup();
    error NotVotingEngine();
    error ZeroAddress();

    modifier onlyRegisteredGroup() {
        if (address(groupRegistry) == address(0) || !groupRegistry.isRegisteredGroup(msg.sender)) {
            revert NotRegisteredGroup();
        }
        _;
    }

    modifier onlyVotingEngine() {
        if (msg.sender != votingEngine) revert NotVotingEngine();
        _;
    }

    constructor(address admin, address badge) Ownable(admin) {
        if (badge == address(0)) revert ZeroAddress();
        badgeNFT = IBadgeNFT(badge);
    }

    // --- Admin ---------------------------------------------------------------

    function setGroupRegistry(address registry) external onlyOwner {
        if (registry == address(0)) revert ZeroAddress();
        groupRegistry = IGroupRegistry(registry);
        emit GroupRegistrySet(registry);
    }

    function setVotingEngine(address engine) external onlyOwner {
        if (engine == address(0)) revert ZeroAddress();
        votingEngine = engine;
        emit VotingEngineSet(engine);
    }

    // --- Writers -------------------------------------------------------------

    function recordDeposit(address account, bool onTime) external onlyRegisteredGroup {
        Rep storage r = _rep[account];
        r.totalDeposits += 1;
        if (onTime) r.onTimeDeposits += 1;
        emit DepositRecorded(account, onTime);
        _checkBadges(account);
    }

    function recordGroupJoin(address account) external onlyRegisteredGroup {
        Rep storage r = _rep[account];
        if (r.tenureStart == 0) r.tenureStart = uint64(block.timestamp);
        r.activeGroups += 1;
        emit GroupJoinRecorded(account, r.activeGroups);
        _checkBadges(account);
    }

    function recordPenalty(address account, uint256 points) external onlyRegisteredGroup {
        _rep[account].penalties += uint32(points);
        emit PenaltyRecorded(account, points);
    }

    function recordVoteParticipation(address account, bool didVote, bool agreed) external onlyVotingEngine {
        Rep storage r = _rep[account];
        r.votesEligible += 1;
        if (didVote) r.votesCast += 1;
        if (agreed) r.voteAgreements += 1;
        emit VoteParticipationRecorded(account, didVote, agreed);
        _checkBadges(account);
    }

    // --- Scoring -------------------------------------------------------------

    /// @inheritdoc IReputationRegistry
    function scoreOf(address account) public view returns (uint256) {
        Rep storage r = _rep[account];
        uint256 max = VesperaConstants.MAX_SCORE;

        uint256 dep = r.totalDeposits == 0 ? 0 : (uint256(r.onTimeDeposits) * max) / r.totalDeposits;
        uint256 vot = r.votesEligible == 0 ? 0 : (uint256(r.votesCast) * max) / r.votesEligible;
        uint256 qual = r.votesCast == 0 ? 0 : (uint256(r.voteAgreements) * max) / r.votesCast;

        uint256 ten;
        if (r.tenureStart != 0) {
            uint256 elapsed = block.timestamp - r.tenureStart;
            ten = elapsed >= VesperaConstants.TENURE_FULL
                ? max
                : (elapsed * max) / VesperaConstants.TENURE_FULL;
        }

        uint256 badges = badgeNFT.balanceOf(account);
        uint256 bdg = badges >= VesperaConstants.BADGE_TYPES
            ? max
            : (badges * max) / VesperaConstants.BADGE_TYPES;

        uint256 pen = r.penalties >= VesperaConstants.PENALTY_CAP
            ? 0
            : max - (uint256(r.penalties) * max) / VesperaConstants.PENALTY_CAP;

        return (
            dep * VesperaConstants.W_DEPOSIT + vot * VesperaConstants.W_VOTING
                + qual * VesperaConstants.W_QUALITY + ten * VesperaConstants.W_TENURE
                + bdg * VesperaConstants.W_BADGE + pen * VesperaConstants.W_PENALTY
        ) / VesperaConstants.BPS;
    }

    /// @notice Tier: 0 Bronze (0-250), 1 Silver (251-500), 2 Gold (501-750), 3 Platinum (751-1000).
    function tierOf(address account) external view returns (uint8) {
        uint256 s = scoreOf(account);
        if (s > 750) return 3;
        if (s > 500) return 2;
        if (s > 250) return 1;
        return 0;
    }

    function getRep(address account) external view returns (Rep memory) {
        return _rep[account];
    }

    // --- Badges --------------------------------------------------------------

    function _checkBadges(address account) private {
        Rep storage r = _rep[account];

        if (
            r.onTimeDeposits >= VesperaConstants.CONSISTENT_PAYER_DEPOSITS
                && !badgeNFT.hasBadge(account, VesperaTypes.BadgeType.ConsistentPayer)
        ) {
            badgeNFT.mint(account, VesperaTypes.BadgeType.ConsistentPayer);
        }

        if (
            r.votesCast >= VesperaConstants.TRUSTED_MIN_VOTES
                && uint256(r.voteAgreements) * 100 >= uint256(r.votesCast) * VesperaConstants.TRUSTED_AGREEMENT_PCT
                && !badgeNFT.hasBadge(account, VesperaTypes.BadgeType.TrustedMember)
        ) {
            badgeNFT.mint(account, VesperaTypes.BadgeType.TrustedMember);
        }

        if (
            r.tenureStart != 0 && block.timestamp - r.tenureStart >= VesperaConstants.DISPUTE_FREE_TENURE
                && r.penalties == 0 && !badgeNFT.hasBadge(account, VesperaTypes.BadgeType.DisputeFree)
        ) {
            badgeNFT.mint(account, VesperaTypes.BadgeType.DisputeFree);
        }

        if (
            r.activeGroups >= VesperaConstants.VETERAN_GROUPS
                && !badgeNFT.hasBadge(account, VesperaTypes.BadgeType.CrossGroupVeteran)
        ) {
            badgeNFT.mint(account, VesperaTypes.BadgeType.CrossGroupVeteran);
        }
    }
}
