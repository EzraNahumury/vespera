// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ITreasury {
    /// @notice Deposit native CELO and receive personal credits at `creditPerCelo` (1 CELO = 1000).
    ///         Open to anyone — no group membership required.
    function deposit() external payable;

    /// @notice Redeem `credits` from the caller's personal balance back to native CELO.
    function withdraw(uint256 credits) external;

    /// @notice Move `amount` credits from `from`'s personal balance into the calling group's escrow.
    /// @dev Caller must be a registered group. This is a member "payment" into the group pot.
    function payFromCredits(address from, uint256 amount) external;

    /// @notice Release escrowed credits for `group` into `to`'s personal balance. VotingEngine only.
    function release(address group, address to, uint256 amount) external;

    /// @notice Escrow (pot) credit balance held for a group.
    function balanceOf(address group) external view returns (uint256);

    /// @notice Personal credit balance of a user.
    function creditBalance(address user) external view returns (uint256);

    /// @notice Credits minted per 1 CELO deposited.
    function creditPerCelo() external view returns (uint256);
}
