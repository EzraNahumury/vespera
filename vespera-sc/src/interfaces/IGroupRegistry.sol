// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IGroupRegistry {
    /// @notice True if `group` was deployed by this factory and is trusted by shared contracts.
    function isRegisteredGroup(address group) external view returns (bool);
}
