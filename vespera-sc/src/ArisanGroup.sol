// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ITreasury} from "./interfaces/ITreasury.sol";
import {IReputationRegistry} from "./interfaces/IReputationRegistry.sol";
import {IBadgeNFT} from "./interfaces/IBadgeNFT.sol";
import {VesperaTypes, VesperaConstants} from "./libraries/VesperaTypes.sol";

/// @title ArisanGroup
/// @notice Core per-group contract: members, fixed-amount deposit rounds, withdrawal requests and
///         payout execution. One fixed deposit token per group (set at creation). Rotation is
///         enforced per cycle: a member can only receive one payout until everyone has had a turn.
///         State transitions for requests are driven by the VotingEngine.
contract ArisanGroup {
    // --- Immutable wiring ----------------------------------------------------
    address public immutable groupRegistry;
    ITreasury public immutable treasury;
    IReputationRegistry public immutable reputation;
    IBadgeNFT public immutable badge;
    address public immutable votingEngine;
    address public immutable agentRegistry;

    address public immutable creator;
    address public immutable depositToken;
    uint256 public immutable depositAmount;
    uint256 public immutable maxMembers;
    uint256 public immutable roundDuration;

    // --- Members -------------------------------------------------------------
    address[] private _members;
    mapping(address => bool) public isMember;
    mapping(address => bool) public invited; // wallet addresses the creator has invited

    // --- Rounds --------------------------------------------------------------
    uint256 public currentRound = 1;
    mapping(uint256 round => uint64 deadline) public roundDeadline;
    mapping(uint256 round => mapping(address => bool)) public depositedInRound;

    // --- Rotation (cycle) ----------------------------------------------------
    uint256 public cycle; // increments when every member has received once
    uint256 public payoutsThisCycle;
    mapping(uint256 cycle => mapping(address => bool)) public receivedInCycle;

    // --- Requests ------------------------------------------------------------
    struct Request {
        address requester;
        uint256 amount;
        string reasonURI;
        uint256 round;
        VesperaTypes.RequestStatus status;
    }

    uint256 public nextRequestId = 1;
    uint256 public activeRequestId; // 0 = none in flight
    mapping(uint256 => Request) private _requests;

    bool private _founderMinted;
    bool private _bootstrapped;

    // --- Events --------------------------------------------------------------
    event MemberInvited(address indexed invitee, address indexed by);
    event MemberJoined(address indexed member, uint256 memberCount);
    event Deposited(uint256 indexed round, address indexed member, uint256 amount, bool onTime);
    event WithdrawalRequested(
        uint256 indexed requestId, address indexed requester, uint256 amount, string reasonURI, uint256 round
    );
    event RequestVoting(uint256 indexed requestId);
    event RequestExecuted(uint256 indexed requestId, address indexed requester, uint256 amount);
    event RequestRejected(uint256 indexed requestId);
    event RoundAdvanced(uint256 indexed round, uint64 deadline);
    event CycleCompleted(uint256 indexed cycle);
    event FounderBadgeMinted(address indexed creator);

    // --- Errors --------------------------------------------------------------
    error OnlyVotingEngine();
    error OnlyGroupRegistry();
    error OnlyCreator();
    error AlreadyBootstrapped();
    error AlreadyMember();
    error NotInvited();
    error ZeroAddress();
    error GroupFull();
    error NotMember();
    error AlreadyDeposited();
    error RequestInFlight();
    error InvalidAmount();
    error AlreadyReceivedThisCycle();
    error InsufficientPot();
    error BadRequestState();

    modifier onlyVotingEngine() {
        if (msg.sender != votingEngine) revert OnlyVotingEngine();
        _;
    }

    modifier onlyGroupRegistry() {
        if (msg.sender != groupRegistry) revert OnlyGroupRegistry();
        _;
    }

    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }

    constructor(
        address groupRegistry_,
        address treasury_,
        address reputation_,
        address badge_,
        address votingEngine_,
        address agentRegistry_,
        address creator_,
        address depositToken_,
        uint256 depositAmount_,
        uint256 maxMembers_,
        uint256 roundDuration_
    ) {
        groupRegistry = groupRegistry_;
        treasury = ITreasury(treasury_);
        reputation = IReputationRegistry(reputation_);
        badge = IBadgeNFT(badge_);
        votingEngine = votingEngine_;
        agentRegistry = agentRegistry_;
        creator = creator_;
        depositToken = depositToken_;
        depositAmount = depositAmount_;
        maxMembers = maxMembers_;
        roundDuration = roundDuration_;
        roundDeadline[1] = uint64(block.timestamp + roundDuration_);
    }

    // --- Bootstrap (factory only) -------------------------------------------

    /// @notice Called once by the GroupRegistry right after registration to seat the founder.
    function bootstrap(address founder) external onlyGroupRegistry {
        if (_bootstrapped) revert AlreadyBootstrapped();
        _bootstrapped = true;
        _addMember(founder);
    }

    // --- Membership ----------------------------------------------------------

    /// @notice Creator invites a wallet address. The invitee must then call `join()` to accept.
    function invite(address invitee) public onlyCreator {
        if (invitee == address(0)) revert ZeroAddress();
        if (isMember[invitee]) revert AlreadyMember();
        invited[invitee] = true;
        emit MemberInvited(invitee, msg.sender);
    }

    /// @notice Invite several wallet addresses at once.
    function inviteBatch(address[] calldata invitees) external onlyCreator {
        for (uint256 i; i < invitees.length; i++) {
            invite(invitees[i]);
        }
    }

    /// @notice Accept an invitation and become a member. Invite-gated (private group).
    function join() external {
        if (isMember[msg.sender]) revert AlreadyMember();
        if (!invited[msg.sender]) revert NotInvited();
        if (_members.length >= maxMembers) revert GroupFull();
        invited[msg.sender] = false; // consume the invite
        _addMember(msg.sender);
        _maybeMintFounder();
    }

    function _addMember(address account) private {
        isMember[account] = true;
        _members.push(account);
        reputation.recordGroupJoin(account);
        emit MemberJoined(account, _members.length);
    }

    function _maybeMintFounder() private {
        if (!_founderMinted && _members.length >= VesperaConstants.FOUNDER_MEMBERS) {
            _founderMinted = true;
            badge.mint(creator, VesperaTypes.BadgeType.GroupFounder);
            emit FounderBadgeMinted(creator);
        }
    }

    // --- Deposits ------------------------------------------------------------

    /// @notice Deposit this round's fixed amount. Caller must first approve the Treasury.
    function deposit() external {
        if (!isMember[msg.sender]) revert NotMember();
        uint256 round = currentRound;
        if (depositedInRound[round][msg.sender]) revert AlreadyDeposited();

        depositedInRound[round][msg.sender] = true;
        bool onTime = block.timestamp <= roundDeadline[round];
        treasury.deposit(depositToken, msg.sender, depositAmount);
        reputation.recordDeposit(msg.sender, onTime);
        emit Deposited(round, msg.sender, depositAmount, onTime);
    }

    // --- Withdrawal requests -------------------------------------------------

    /// @notice Submit a withdrawal request. Emits WithdrawalRequested for the off-chain agent.
    function requestWithdrawal(uint256 amount, string calldata reasonURI) external returns (uint256 id) {
        if (!isMember[msg.sender]) revert NotMember();
        if (activeRequestId != 0) revert RequestInFlight();
        if (amount == 0) revert InvalidAmount();
        if (receivedInCycle[cycle][msg.sender]) revert AlreadyReceivedThisCycle();
        if (amount > treasury.balanceOf(address(this), depositToken)) revert InsufficientPot();

        id = nextRequestId++;
        _requests[id] = Request({
            requester: msg.sender,
            amount: amount,
            reasonURI: reasonURI,
            round: currentRound,
            status: VesperaTypes.RequestStatus.Pending
        });
        activeRequestId = id;
        emit WithdrawalRequested(id, msg.sender, amount, reasonURI, currentRound);
    }

    // --- VotingEngine callbacks ---------------------------------------------

    function markVoting(uint256 requestId) external onlyVotingEngine {
        Request storage r = _requests[requestId];
        if (r.status != VesperaTypes.RequestStatus.Pending) revert BadRequestState();
        r.status = VesperaTypes.RequestStatus.Voting;
        emit RequestVoting(requestId);
    }

    function markExecuted(uint256 requestId) external onlyVotingEngine {
        Request storage r = _requests[requestId];
        if (r.status != VesperaTypes.RequestStatus.Voting) revert BadRequestState();
        r.status = VesperaTypes.RequestStatus.Executed;
        activeRequestId = 0;

        receivedInCycle[cycle][r.requester] = true;
        payoutsThisCycle += 1;
        if (payoutsThisCycle >= _members.length) {
            emit CycleCompleted(cycle);
            cycle += 1;
            payoutsThisCycle = 0;
        }
        _advanceRound();
        emit RequestExecuted(requestId, r.requester, r.amount);
    }

    function markRejected(uint256 requestId) external onlyVotingEngine {
        Request storage r = _requests[requestId];
        if (
            r.status != VesperaTypes.RequestStatus.Pending
                && r.status != VesperaTypes.RequestStatus.Voting
        ) revert BadRequestState();
        r.status = VesperaTypes.RequestStatus.Rejected;
        activeRequestId = 0;
        emit RequestRejected(requestId);
    }

    function _advanceRound() private {
        currentRound += 1;
        uint64 deadline = uint64(block.timestamp + roundDuration);
        roundDeadline[currentRound] = deadline;
        emit RoundAdvanced(currentRound, deadline);
    }

    // --- Views ---------------------------------------------------------------

    function getRequest(uint256 requestId)
        external
        view
        returns (address requester, uint256 amount, address token, VesperaTypes.RequestStatus status)
    {
        Request storage r = _requests[requestId];
        return (r.requester, r.amount, depositToken, r.status);
    }

    function getRequestDetails(uint256 requestId) external view returns (Request memory) {
        return _requests[requestId];
    }

    function getMembers() external view returns (address[] memory) {
        return _members;
    }

    function memberCount() external view returns (uint256) {
        return _members.length;
    }
}
