// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title VesperaTypes
/// @notice Shared enums used across the Vespera protocol.
library VesperaTypes {
    /// @notice Lifecycle of a withdrawal request inside an ArisanGroup.
    enum RequestStatus {
        None, // 0 - does not exist
        Pending, // 1 - created, awaiting AI confidence + vote init
        Voting, // 2 - vote is live in the VotingEngine
        Executed, // 3 - approved and paid out
        Rejected // 4 - auto-rejected or voted down
    }

    /// @notice Lifecycle of a vote inside the VotingEngine.
    enum VoteStatus {
        None, // 0 - not initialised
        Active, // 1 - accepting votes
        Passed, // 2 - quorum met, majority for (transient before execution)
        Rejected, // 3 - failed quorum/majority or auto-rejected
        Executed // 4 - payout released
    }

    /// @notice Soulbound badge categories (README: BadgeNFT).
    enum BadgeType {
        ConsistentPayer, // 0 - 12+ on-time deposits
        TrustedMember, // 1 - >=80% vote agreement (min sample)
        GroupFounder, // 2 - founded a group with >=5 active members
        DisputeFree, // 3 - 6 months without a penalty
        CrossGroupVeteran // 4 - active in 3+ groups simultaneously
    }
}

/// @title VesperaConstants
/// @notice Protocol-wide tunables. Values mirror the README spec exactly.
library VesperaConstants {
    uint256 internal constant BPS = 10_000;

    // --- Confidence routing (VotingEngine) ---
    uint16 internal constant MIN_CONFIDENCE_BPS = 5_000; // < 50% => auto-reject
    uint16 internal constant FAST_TRACK_CONFIDENCE_BPS = 8_500; // >= 85% => fast-track

    // --- Quorum (as bps of total eligible reputation weight) ---
    uint16 internal constant FAST_TRACK_QUORUM_BPS = 3_000; // 30%
    uint16 internal constant NORMAL_QUORUM_BPS = 6_000; // 60%

    // --- Voting windows ---
    uint64 internal constant FAST_TRACK_WINDOW = 12 hours;
    uint64 internal constant NORMAL_WINDOW = 24 hours;

    // --- Reputation (0..1000) ---
    uint256 internal constant MAX_SCORE = 1_000;

    // Factor weights in bps, must sum to BPS (40/20/15/10/10/5).
    uint256 internal constant W_DEPOSIT = 4_000;
    uint256 internal constant W_VOTING = 2_000;
    uint256 internal constant W_QUALITY = 1_500;
    uint256 internal constant W_TENURE = 1_000;
    uint256 internal constant W_BADGE = 1_000;
    uint256 internal constant W_PENALTY = 500;

    uint256 internal constant TENURE_FULL = 365 days; // tenure that yields full marks
    uint256 internal constant PENALTY_CAP = 20; // penalty points that zero the penalty factor
    uint256 internal constant BADGE_TYPES = 5; // owning all 5 badges yields full badge marks

    // --- Badge thresholds ---
    uint256 internal constant CONSISTENT_PAYER_DEPOSITS = 12;
    uint256 internal constant TRUSTED_MIN_VOTES = 5;
    uint256 internal constant TRUSTED_AGREEMENT_PCT = 80;
    uint256 internal constant DISPUTE_FREE_TENURE = 180 days;
    uint256 internal constant VETERAN_GROUPS = 3;
    uint256 internal constant FOUNDER_MEMBERS = 5;

    // --- Group bounds (README: 5-15 members) ---
    uint256 internal constant MIN_MEMBERS = 5;
    uint256 internal constant MAX_MEMBERS = 15;
}
