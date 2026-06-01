// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ITreasury {
    /// @notice Pull `amount` of `token` from `from` into escrow, credited to the calling group.
    /// @dev Caller must be a registered group. Returns the amount actually received
    ///      (handles fee-on-transfer tokens).
    function deposit(address token, address from, uint256 amount) external returns (uint256 received);

    /// @notice Release escrowed funds for `group`. Callable only by the VotingEngine.
    function release(address group, address token, address to, uint256 amount) external;

    /// @notice Escrow balance held for a group in a given token.
    function balanceOf(address group, address token) external view returns (uint256);

    /// @notice Whether a token is accepted as a deposit currency.
    function isAllowedToken(address token) external view returns (bool);
}
