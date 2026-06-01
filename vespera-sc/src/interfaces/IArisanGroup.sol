// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {VesperaTypes} from "../libraries/VesperaTypes.sol";

interface IArisanGroup {
    /// @notice Read a withdrawal request. `token` is the group's fixed deposit token.
    function getRequest(uint256 requestId)
        external
        view
        returns (address requester, uint256 amount, address token, VesperaTypes.RequestStatus status);

    /// @notice Move a request from Pending -> Voting. VotingEngine only.
    function markVoting(uint256 requestId) external;

    /// @notice Move a request from Voting -> Executed and advance the round. VotingEngine only.
    function markExecuted(uint256 requestId) external;

    /// @notice Move a request to Rejected. VotingEngine only.
    function markRejected(uint256 requestId) external;

    function isMember(address account) external view returns (bool);

    function getMembers() external view returns (address[] memory);

    function memberCount() external view returns (uint256);

    function depositToken() external view returns (address);
}
