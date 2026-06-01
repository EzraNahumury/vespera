// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IGroupRegistry} from "./interfaces/IGroupRegistry.sol";
import {ITreasury} from "./interfaces/ITreasury.sol";
import {ArisanGroup} from "./ArisanGroup.sol";
import {VesperaConstants} from "./libraries/VesperaTypes.sol";

/// @title GroupRegistry
/// @notice Factory + directory for ArisanGroups. Deploys each group, marks it registered (which
///         is how the shared contracts — Treasury, ReputationRegistry, BadgeNFT — authorise it),
///         and seats the creator as the founding member.
contract GroupRegistry is IGroupRegistry, Ownable {
    address public immutable treasury;
    address public immutable reputation;
    address public immutable badge;
    address public immutable votingEngine;
    address public immutable agentRegistry;

    mapping(address group => bool) public isRegisteredGroup;
    mapping(address group => address) public groupCreator;
    address[] private _groups;

    event GroupCreated(
        address indexed group,
        address indexed creator,
        address depositToken,
        uint256 depositAmount,
        uint256 maxMembers,
        uint256 roundDuration,
        string metadataURI
    );

    error TokenNotAllowed();
    error BadMemberBounds();
    error InvalidAmount();
    error InvalidDuration();
    error ZeroAddress();

    constructor(
        address admin,
        address treasury_,
        address reputation_,
        address badge_,
        address votingEngine_,
        address agentRegistry_
    ) Ownable(admin) {
        if (
            treasury_ == address(0) || reputation_ == address(0) || badge_ == address(0)
                || votingEngine_ == address(0) || agentRegistry_ == address(0)
        ) revert ZeroAddress();
        treasury = treasury_;
        reputation = reputation_;
        badge = badge_;
        votingEngine = votingEngine_;
        agentRegistry = agentRegistry_;
    }

    /// @notice Deploy a new ArisanGroup with a fixed deposit token (must be Treasury-allowed).
    function createGroup(
        address depositToken,
        uint256 depositAmount,
        uint256 maxMembers,
        uint256 roundDuration,
        string calldata metadataURI
    ) external returns (address group) {
        if (!ITreasury(treasury).isAllowedToken(depositToken)) revert TokenNotAllowed();
        if (maxMembers < VesperaConstants.MIN_MEMBERS || maxMembers > VesperaConstants.MAX_MEMBERS) {
            revert BadMemberBounds();
        }
        if (depositAmount == 0) revert InvalidAmount();
        if (roundDuration == 0) revert InvalidDuration();

        ArisanGroup g = new ArisanGroup(
            address(this),
            treasury,
            reputation,
            badge,
            votingEngine,
            agentRegistry,
            msg.sender,
            depositToken,
            depositAmount,
            maxMembers,
            roundDuration
        );
        group = address(g);

        // Register BEFORE bootstrap so the group's recordGroupJoin call passes onlyRegisteredGroup.
        isRegisteredGroup[group] = true;
        groupCreator[group] = msg.sender;
        _groups.push(group);

        g.bootstrap(msg.sender);

        emit GroupCreated(group, msg.sender, depositToken, depositAmount, maxMembers, roundDuration, metadataURI);
    }

    function allGroups() external view returns (address[] memory) {
        return _groups;
    }

    function groupsCount() external view returns (uint256) {
        return _groups.length;
    }
}
