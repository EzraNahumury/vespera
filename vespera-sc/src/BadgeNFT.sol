// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {VesperaTypes} from "./libraries/VesperaTypes.sol";
import {IGroupRegistry} from "./interfaces/IGroupRegistry.sol";

/// @title BadgeNFT
/// @notice Soulbound (non-transferable) ERC-721 attestations. Minted by the ReputationRegistry
///         (reputation badges) and by registered ArisanGroups (the Founder badge). One badge per
///         (account, type).
contract BadgeNFT is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    IGroupRegistry public groupRegistry;
    uint256 private _nextId = 1;

    mapping(uint256 tokenId => VesperaTypes.BadgeType) public badgeTypeOf;
    mapping(address account => mapping(VesperaTypes.BadgeType => bool)) private _hasBadge;

    event BadgeMinted(address indexed to, VesperaTypes.BadgeType indexed badgeType, uint256 tokenId);
    event GroupRegistrySet(address indexed groupRegistry);

    error SoulboundNonTransferable();
    error NotAuthorizedMinter();
    error BadgeAlreadyOwned();

    constructor(address admin) ERC721("Vespera Badge", "VESP-BADGE") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Set the group registry used to authorise group-originated mints (Founder badge).
    function setGroupRegistry(address registry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        groupRegistry = IGroupRegistry(registry);
        emit GroupRegistrySet(registry);
    }

    /// @notice Mint a soulbound badge to `to`. Reverts if already owned.
    /// @dev Authorised callers: MINTER_ROLE (ReputationRegistry) or any registered group.
    function mint(address to, VesperaTypes.BadgeType badgeType) external returns (uint256 tokenId) {
        bool authorized = hasRole(MINTER_ROLE, msg.sender)
            || (address(groupRegistry) != address(0) && groupRegistry.isRegisteredGroup(msg.sender));
        if (!authorized) revert NotAuthorizedMinter();
        if (_hasBadge[to][badgeType]) revert BadgeAlreadyOwned();

        tokenId = _nextId++;
        _hasBadge[to][badgeType] = true;
        badgeTypeOf[tokenId] = badgeType;
        _mint(to, tokenId);
        emit BadgeMinted(to, badgeType, tokenId);
    }

    function hasBadge(address account, VesperaTypes.BadgeType badgeType) external view returns (bool) {
        return _hasBadge[account][badgeType];
    }

    // --- Soulbound enforcement ---------------------------------------------

    /// @dev Allow mint (from == 0) and burn (to == 0); block any wallet-to-wallet transfer.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address from) {
        from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) revert SoulboundNonTransferable();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
