// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {VesperaTypes} from "../libraries/VesperaTypes.sol";

interface IBadgeNFT {
    /// @notice Mint a soulbound badge of `badgeType` to `to`. No-op-safe: reverts if already owned.
    function mint(address to, VesperaTypes.BadgeType badgeType) external returns (uint256 tokenId);

    /// @notice Whether `account` already holds a badge of `badgeType`.
    function hasBadge(address account, VesperaTypes.BadgeType badgeType) external view returns (bool);

    /// @notice Total badges held by an account (ERC-721 balance).
    function balanceOf(address account) external view returns (uint256);
}
