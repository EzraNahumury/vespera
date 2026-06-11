// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {Treasury} from "../src/Treasury.sol";
import {VotingEngine} from "../src/VotingEngine.sol";
import {GroupRegistry} from "../src/GroupRegistry.sol";
import {ArisanGroup} from "../src/ArisanGroup.sol";
import {VesperaTypes} from "../src/libraries/VesperaTypes.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract VesperaTest is Test {
    // Protocol
    AgentRegistry agentRegistry;
    BadgeNFT badge;
    ReputationRegistry reputation;
    Treasury treasury;
    VotingEngine voting;
    GroupRegistry registry;

    // A dummy ERC-20 used only as a free-form deposit-token *label* (no transfers happen).
    MockERC20 label;

    // Actors (plain wallet addresses — membership is invite-by-address on Celo)
    address admin = address(this);
    address agent = makeAddr("agent");
    address creator = makeAddr("creator"); // group creator / organiser
    address walletA = makeAddr("walletA");
    address walletB = makeAddr("walletB");
    address walletC = makeAddr("walletC");
    address walletD = makeAddr("walletD");

    // Amounts are denominated in in-game CREDITS, an 18-decimal quantity (1 CELO = 1000 credits).
    uint256 constant DEPOSIT = 100e18; // 100 credits per round
    uint256 constant ROUND = 7 days;

    function setUp() public {
        agentRegistry = new AgentRegistry();
        badge = new BadgeNFT(admin);
        reputation = new ReputationRegistry(admin, address(badge));
        treasury = new Treasury(admin);
        voting = new VotingEngine(admin, address(reputation), address(treasury));
        registry = new GroupRegistry(
            admin, address(treasury), address(reputation), address(badge), address(voting), address(agentRegistry)
        );

        // Wire shared contracts.
        treasury.setGroupRegistry(address(registry));
        treasury.setVotingEngine(address(voting));
        reputation.setGroupRegistry(address(registry));
        reputation.setVotingEngine(address(voting));
        voting.setGroupRegistry(address(registry));
        badge.setGroupRegistry(address(registry));
        badge.grantRole(badge.MINTER_ROLE(), address(reputation));
        voting.grantRole(voting.AGENT_ROLE(), agent);

        label = new MockERC20("Credit", "CR", 18);

        // Fund every wallet with credits: deal native CELO, then deposit 10 CELO -> 10_000 credits.
        address[5] memory ws = _wallets();
        for (uint256 i; i < ws.length; i++) {
            vm.deal(ws[i], 100 ether);
            vm.prank(ws[i]);
            treasury.deposit{value: 10 ether}();
        }
    }

    // --- Helpers -------------------------------------------------------------

    function _wallets() internal view returns (address[5] memory) {
        return [creator, walletA, walletB, walletC, walletD];
    }

    /// @dev Creator deploys the group, invites the four wallets, each accepts via join().
    function _newGroup() internal returns (ArisanGroup g) {
        vm.prank(creator);
        address ga = registry.createGroup(address(label), DEPOSIT, 5, ROUND, "ipfs://meta");
        g = ArisanGroup(ga);

        address[4] memory invitees = [walletA, walletB, walletC, walletD];
        vm.prank(creator);
        g.inviteBatch(_toDynamic(invitees));
        for (uint256 i; i < invitees.length; i++) {
            vm.prank(invitees[i]);
            g.join();
        }
    }

    function _toDynamic(address[4] memory fixedArr) internal pure returns (address[] memory out) {
        out = new address[](4);
        for (uint256 i; i < 4; i++) {
            out[i] = fixedArr[i];
        }
    }

    function _depositAll(ArisanGroup g) internal {
        address[5] memory ws = _wallets();
        for (uint256 i; i < ws.length; i++) {
            vm.prank(ws[i]);
            g.deposit();
        }
    }

    function _voteAllExcept(ArisanGroup g, uint256 requestId, address requester, bool support) internal {
        address[5] memory ws = _wallets();
        for (uint256 i; i < ws.length; i++) {
            if (ws[i] == requester) continue;
            vm.prank(ws[i]);
            voting.castVote(address(g), requestId, support);
        }
    }

    // --- Personal credit deposit / withdraw (the new core) -------------------

    function test_Deposit_NativeCelo_MintsCredits_AtOneToThousand() public {
        // The new rule: anyone can top up credits, even before joining any group.
        address newbie = makeAddr("newbie");
        vm.deal(newbie, 5 ether);
        vm.prank(newbie);
        treasury.deposit{value: 2 ether}();
        assertEq(treasury.creditBalance(newbie), 2000 ether); // 2 CELO -> 2000.0 credits
    }

    function test_Deposit_RevertsOnZeroValue() public {
        vm.deal(walletA, 1 ether);
        vm.prank(walletA);
        vm.expectRevert(Treasury.ZeroAmount.selector);
        treasury.deposit{value: 0}();
    }

    function test_Withdraw_RedeemsCreditsToCelo() public {
        address u = makeAddr("u");
        vm.deal(u, 10 ether);
        vm.prank(u);
        treasury.deposit{value: 3 ether}(); // 3000 credits
        assertEq(treasury.creditBalance(u), 3000 ether);

        uint256 balBefore = u.balance;
        vm.prank(u);
        treasury.withdraw(1000 ether); // 1000 credits -> 1 CELO

        assertEq(treasury.creditBalance(u), 2000 ether);
        assertEq(u.balance, balBefore + 1 ether);
    }

    function test_Withdraw_RevertsOnInsufficientCredits() public {
        uint256 tooMuch = treasury.creditBalance(walletA) + 1;
        vm.prank(walletA);
        vm.expectRevert(Treasury.InsufficientCredits.selector);
        treasury.withdraw(tooMuch);
    }

    // --- Group creation & membership ----------------------------------------

    function test_CreateGroup_SeatsCreatorAsMember() public {
        vm.prank(creator);
        address ga = registry.createGroup(address(label), DEPOSIT, 5, ROUND, "ipfs://meta");
        ArisanGroup g = ArisanGroup(ga);

        assertTrue(registry.isRegisteredGroup(ga));
        assertEq(registry.groupCreator(ga), creator);
        assertTrue(g.isMember(creator));
        assertEq(g.memberCount(), 1);
        assertEq(g.depositToken(), address(label));
        assertEq(g.currentRound(), 1);
    }

    function test_CreateGroup_RevertsOnBadMemberBounds() public {
        vm.prank(creator);
        vm.expectRevert(GroupRegistry.BadMemberBounds.selector);
        registry.createGroup(address(label), DEPOSIT, 4, ROUND, "x"); // < MIN_MEMBERS
        vm.prank(creator);
        vm.expectRevert(GroupRegistry.BadMemberBounds.selector);
        registry.createGroup(address(label), DEPOSIT, 16, ROUND, "x"); // > MAX_MEMBERS
    }

    function test_Invite_OnlyCreator() public {
        vm.prank(creator);
        address ga = registry.createGroup(address(label), DEPOSIT, 5, ROUND, "x");
        ArisanGroup g = ArisanGroup(ga);

        vm.prank(walletA); // not the creator
        vm.expectRevert(ArisanGroup.OnlyCreator.selector);
        g.invite(walletB);
    }

    function test_Join_RevertsIfNotInvited() public {
        vm.prank(creator);
        address ga = registry.createGroup(address(label), DEPOSIT, 5, ROUND, "x");
        ArisanGroup g = ArisanGroup(ga);

        vm.prank(walletA); // never invited
        vm.expectRevert(ArisanGroup.NotInvited.selector);
        g.join();
    }

    function test_FounderBadge_MintedAt5Members() public {
        ArisanGroup g = _newGroup();
        assertEq(g.memberCount(), 5);
        assertTrue(badge.hasBadge(creator, VesperaTypes.BadgeType.GroupFounder));
        assertEq(badge.balanceOf(creator), 1);
    }

    function test_Join_RevertsWhenFull() public {
        ArisanGroup g = _newGroup(); // 5 members, max 5
        address sixth = makeAddr("sixth");
        vm.prank(creator);
        g.invite(sixth);
        vm.prank(sixth);
        vm.expectRevert(ArisanGroup.GroupFull.selector);
        g.join();
    }

    // --- Group payment (debits personal credits) -----------------------------

    function test_Deposit_EscrowsAndScores() public {
        ArisanGroup g = _newGroup();
        uint256 creditsBefore = treasury.creditBalance(walletA);

        vm.prank(walletA);
        g.deposit();

        assertEq(treasury.balanceOf(address(g)), DEPOSIT);
        assertEq(treasury.creditBalance(walletA), creditsBefore - DEPOSIT);
        assertTrue(g.depositedInRound(1, walletA));
        // walletA: deposit 1/1 (400) + penalty-free (50) ~= 450 => Silver tier.
        uint256 s = reputation.scoreOf(walletA);
        assertApproxEqAbs(s, 450, 1);
        assertEq(reputation.tierOf(walletA), 1); // Silver
    }

    function test_Deposit_RevertsOnInsufficientCredits() public {
        // A non-full group whose fresh member never topped up credits cannot pay into the pot.
        vm.prank(creator);
        address ga = registry.createGroup(address(label), DEPOSIT, 5, ROUND, "x");
        ArisanGroup g = ArisanGroup(ga);

        address poor = makeAddr("poor");
        vm.prank(creator);
        g.invite(poor);
        vm.prank(poor);
        g.join();

        vm.prank(poor);
        vm.expectRevert(Treasury.InsufficientCredits.selector);
        g.deposit();
    }

    function test_Deposit_RevertsOnDoubleDepositSameRound() public {
        ArisanGroup g = _newGroup();
        vm.prank(walletA);
        g.deposit();
        vm.prank(walletA);
        vm.expectRevert(ArisanGroup.AlreadyDeposited.selector);
        g.deposit();
    }

    // --- Happy path: fast-track ---------------------------------------------

    function test_HappyPath_FastTrack_Payout() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);
        assertEq(treasury.balanceOf(address(g)), 5 * DEPOSIT);

        uint256 creatorCreditsBefore = treasury.creditBalance(creator);

        vm.prank(creator);
        uint256 id = g.requestWithdrawal(300e18, "medical");

        vm.prank(agent);
        voting.initVote(address(g), id, 9000); // >=85% => fast-track

        // Two of the four eligible voters approve -> well past 30% quorum.
        vm.prank(walletA);
        voting.castVote(address(g), id, true);
        vm.prank(walletB);
        voting.castVote(address(g), id, true);

        voting.finalize(address(g), id);

        // Payout released into the requester's personal credit balance.
        assertEq(treasury.creditBalance(creator), creatorCreditsBefore + 300e18);
        assertEq(treasury.balanceOf(address(g)), 5 * DEPOSIT - 300e18);

        (,,, VesperaTypes.RequestStatus st) = g.getRequest(id);
        assertEq(uint256(st), uint256(VesperaTypes.RequestStatus.Executed));
        assertEq(g.currentRound(), 2);
        assertEq(g.activeRequestId(), 0);
        assertTrue(g.receivedInCycle(0, creator));
    }

    // --- Normal vote ---------------------------------------------------------

    function test_NormalVote_Payout() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);

        vm.prank(walletA);
        uint256 id = g.requestWithdrawal(100e18, "rent");

        vm.prank(agent);
        voting.initVote(address(g), id, 7000); // 50-84% => normal (60% quorum)

        // Need >60% of eligible weight: 3 of 4 voters approve.
        vm.prank(creator);
        voting.castVote(address(g), id, true);
        vm.prank(walletB);
        voting.castVote(address(g), id, true);
        vm.prank(walletC);
        voting.castVote(address(g), id, true);

        voting.finalize(address(g), id);

        (,,, VesperaTypes.RequestStatus st) = g.getRequest(id);
        assertEq(uint256(st), uint256(VesperaTypes.RequestStatus.Executed));
    }

    // --- Auto-reject ---------------------------------------------------------

    function test_AutoReject_LowConfidence() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);

        vm.prank(creator);
        uint256 id = g.requestWithdrawal(100e18, "vague");

        vm.prank(agent);
        voting.initVote(address(g), id, 4000); // < 50% => auto-reject

        (,,, VesperaTypes.RequestStatus st) = g.getRequest(id);
        assertEq(uint256(st), uint256(VesperaTypes.RequestStatus.Rejected));
        assertEq(g.activeRequestId(), 0);
        assertEq(g.currentRound(), 1); // not advanced

        (,,,,,,, VesperaTypes.VoteStatus vst,,,) = voting.getVote(address(g), id);
        assertEq(uint256(vst), uint256(VesperaTypes.VoteStatus.Rejected));
    }

    // --- Voting guards -------------------------------------------------------

    function test_RequesterCannotVote() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);
        vm.prank(creator);
        uint256 id = g.requestWithdrawal(100e18, "x");
        vm.prank(agent);
        voting.initVote(address(g), id, 9000);

        vm.prank(creator);
        vm.expectRevert(VotingEngine.RequesterCannotVote.selector);
        voting.castVote(address(g), id, true);
    }

    function test_NonMemberCannotVote() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);
        vm.prank(creator);
        uint256 id = g.requestWithdrawal(100e18, "x");
        vm.prank(agent);
        voting.initVote(address(g), id, 9000);

        address stranger = makeAddr("stranger");
        vm.prank(stranger);
        vm.expectRevert(VotingEngine.NotMember.selector);
        voting.castVote(address(g), id, true);
    }

    function test_DoubleVoteReverts() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);
        vm.prank(creator);
        uint256 id = g.requestWithdrawal(100e18, "x");
        vm.prank(agent);
        voting.initVote(address(g), id, 9000);

        vm.prank(walletA);
        voting.castVote(address(g), id, true);
        vm.prank(walletA);
        vm.expectRevert(VotingEngine.AlreadyVoted.selector);
        voting.castVote(address(g), id, true);
    }

    function test_FinalizeTooEarly_Reverts_ThenRejectsAfterDeadline() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);
        vm.prank(creator);
        uint256 id = g.requestWithdrawal(100e18, "x");
        vm.prank(agent);
        voting.initVote(address(g), id, 7000); // normal: 60% quorum, 24h

        // Only one yes vote: below quorum.
        vm.prank(walletA);
        voting.castVote(address(g), id, true);

        vm.expectRevert(VotingEngine.VotingStillOpen.selector);
        voting.finalize(address(g), id);

        // After the 24h window, finalize settles as rejected (quorum never reached).
        vm.warp(block.timestamp + 24 hours + 1);
        voting.finalize(address(g), id);

        (,,, VesperaTypes.RequestStatus st) = g.getRequest(id);
        assertEq(uint256(st), uint256(VesperaTypes.RequestStatus.Rejected));
        assertEq(g.currentRound(), 1);
    }

    // --- Rotation ------------------------------------------------------------

    function test_Rotation_BlocksSecondPayoutSameCycle() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);

        vm.prank(creator);
        uint256 id = g.requestWithdrawal(100e18, "first");
        vm.prank(agent);
        voting.initVote(address(g), id, 9000);
        _voteAllExcept(g, id, creator, true);
        voting.finalize(address(g), id);

        // creator already received this cycle -> blocked.
        _depositAll(g); // round 2 deposits
        vm.prank(creator);
        vm.expectRevert(ArisanGroup.AlreadyReceivedThisCycle.selector);
        g.requestWithdrawal(100e18, "again");
    }

    // --- End-to-end: deposit CELO -> pay -> payout -> withdraw CELO ----------

    function test_FullRoundTrip_CeloToCreditsToPayoutToCelo() public {
        ArisanGroup g = _newGroup();
        _depositAll(g); // pot = 500 credits

        // walletA wins a 300-credit payout.
        vm.prank(walletA);
        uint256 id = g.requestWithdrawal(300e18, "celo payout");
        vm.prank(agent);
        voting.initVote(address(g), id, 9000);
        _voteAllExcept(g, id, walletA, true);
        voting.finalize(address(g), id);

        // The payout credits can be redeemed back to native CELO.
        uint256 balBefore = walletA.balance;
        vm.prank(walletA);
        treasury.withdraw(300e18); // 300 credits -> 0.3 CELO
        assertEq(walletA.balance, balBefore + 0.3 ether);
    }

    // --- Access control ------------------------------------------------------

    function test_AccessControl_InitVoteOnlyAgent() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);
        vm.prank(creator);
        uint256 id = g.requestWithdrawal(100e18, "x");

        vm.prank(walletA); // not AGENT_ROLE
        vm.expectRevert();
        voting.initVote(address(g), id, 9000);
    }

    function test_AccessControl_ReleaseOnlyVotingEngine() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);
        vm.prank(walletA);
        vm.expectRevert(Treasury.NotVotingEngine.selector);
        treasury.release(address(g), walletA, 1);
    }

    function test_AccessControl_PayFromCreditsOnlyRegisteredGroup() public {
        // A random address calling treasury.payFromCredits is not a registered group.
        vm.prank(walletA);
        vm.expectRevert(Treasury.NotRegisteredGroup.selector);
        treasury.payFromCredits(walletA, DEPOSIT);
    }

    function test_AccessControl_MarkVotingOnlyVotingEngine() public {
        ArisanGroup g = _newGroup();
        _depositAll(g);
        vm.prank(creator);
        uint256 id = g.requestWithdrawal(100e18, "x");
        vm.prank(walletA);
        vm.expectRevert(ArisanGroup.OnlyVotingEngine.selector);
        g.markVoting(id);
    }

    // --- Reputation badge: Consistent Payer ----------------------------------

    function test_ConsistentPayerBadge_After12Deposits() public {
        ArisanGroup g = _newGroup();
        address[5] memory ws = _wallets();

        // Run 12 rounds: everyone deposits, requester rotates, others approve.
        for (uint256 r; r < 12; r++) {
            _depositAll(g);
            address requester = ws[r % 5];
            vm.prank(requester);
            uint256 id = g.requestWithdrawal(50e18, "round");
            vm.prank(agent);
            voting.initVote(address(g), id, 9000);
            _voteAllExcept(g, id, requester, true);
            voting.finalize(address(g), id);
        }

        // Everyone made 12 on-time deposits -> Consistent Payer badge.
        assertTrue(badge.hasBadge(walletA, VesperaTypes.BadgeType.ConsistentPayer));
        assertTrue(badge.hasBadge(walletD, VesperaTypes.BadgeType.ConsistentPayer));
    }

    // --- Soulbound enforcement ----------------------------------------------

    function test_Badge_IsSoulbound() public {
        _newGroup(); // mints Founder badge to creator (tokenId 1)
        vm.prank(creator);
        vm.expectRevert(BadgeNFT.SoulboundNonTransferable.selector);
        badge.transferFrom(creator, walletA, 1);
    }
}
