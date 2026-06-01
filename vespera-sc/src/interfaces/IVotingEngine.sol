// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IVotingEngine {
    /// @notice Open a vote for a pending withdrawal request, routed by the AI confidence score.
    /// @dev Callable only by an account holding AGENT_ROLE (the off-chain Requester Agent).
    /// @param group         the ArisanGroup holding the request
    /// @param requestId     the request id within that group
    /// @param confidenceBps AI confidence in basis points (0..10000)
    function initVote(address group, uint256 requestId, uint16 confidenceBps) external;
}
