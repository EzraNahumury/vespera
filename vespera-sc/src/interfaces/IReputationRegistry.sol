// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IReputationRegistry {
    /// @notice Current reputation score for an account (0..1000).
    function scoreOf(address account) external view returns (uint256);

    /// @notice Record a deposit event. `onTime` drives deposit-consistency scoring.
    function recordDeposit(address account, bool onTime) external;

    /// @notice Record that an account joined a group (sets tenure, bumps active-group count).
    function recordGroupJoin(address account) external;

    /// @notice Apply cross-group penalty points to an account.
    function recordPenalty(address account, uint256 points) external;

    /// @notice Record a member's participation in a finalised vote.
    /// @param didVote whether the member cast a vote
    /// @param agreed  whether their vote matched the final outcome
    function recordVoteParticipation(address account, bool didVote, bool agreed) external;
}
