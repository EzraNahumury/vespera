// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {Treasury} from "../src/Treasury.sol";
import {VotingEngine} from "../src/VotingEngine.sol";
import {GroupRegistry} from "../src/GroupRegistry.sol";

/// @notice Deploys the full Vespera protocol and wires every shared contract.
///
/// Required env:
///   PRIVATE_KEY     - deployer key (becomes admin/owner of all contracts)
/// Optional env:
///   AGENT_ADDRESS   - off-chain Requester Agent signer granted AGENT_ROLE (default: deployer)
///   USDM_ADDRESS    - Mento Dollar; allowed as a deposit token if set
///   USDC_ADDRESS    - USD Coin;     allowed as a deposit token if set
///   USDT_ADDRESS    - Tether USD;   allowed as a deposit token if set
///   CELO_ADDRESS    - override the CELO ERC-20 adapter address. Optional: on Celo mainnet
///                     (42220) and Alfajores (44787) it is auto-detected, so CELO is always
///                     allowed as a deposit token. CELO is the native coin but exposes a full
///                     ERC-20 interface at that address (native and ERC-20 balances are unified),
///                     so deposits flow through approve + transferFrom — no payable path needed.
///                     Gas is paid in native CELO by default.
///
/// Example:
///   forge script script/Deploy.s.sol:Deploy --rpc-url $CELO_RPC --broadcast
contract Deploy is Script {
    function run() external {
        uint256 pk = _loadPrivateKey();
        address admin = vm.addr(pk);
        address agent = vm.envOr("AGENT_ADDRESS", admin);

        vm.startBroadcast(pk);

        // 1. Leaf contracts (no forward dependencies).
        AgentRegistry agentRegistry = new AgentRegistry();
        BadgeNFT badge = new BadgeNFT(admin);
        ReputationRegistry reputation = new ReputationRegistry(admin, address(badge));
        Treasury treasury = new Treasury(admin);

        // 2. VotingEngine depends on reputation + treasury.
        VotingEngine voting = new VotingEngine(admin, address(reputation), address(treasury));

        // 3. GroupRegistry (factory) depends on everything above.
        GroupRegistry registry = new GroupRegistry(
            admin,
            address(treasury),
            address(reputation),
            address(badge),
            address(voting),
            address(agentRegistry)
        );

        // 4. Wire shared contracts to recognise the factory / voting engine.
        treasury.setGroupRegistry(address(registry));
        treasury.setVotingEngine(address(voting));
        reputation.setGroupRegistry(address(registry));
        reputation.setVotingEngine(address(voting));
        voting.setGroupRegistry(address(registry));
        badge.setGroupRegistry(address(registry));

        // 5. Roles: ReputationRegistry mints reputation badges; agent opens votes.
        badge.grantRole(badge.MINTER_ROLE(), address(reputation));
        voting.grantRole(voting.AGENT_ROLE(), agent);

        // 6. Allow deposit tokens. Stablecoins if their addresses are provided; CELO is
        //    auto-detected per chain (overridable via CELO_ADDRESS).
        _allowIfSet(treasury, "USDM_ADDRESS");
        _allowIfSet(treasury, "USDC_ADDRESS");
        _allowIfSet(treasury, "USDT_ADDRESS");
        address celo = vm.envOr("CELO_ADDRESS", _defaultCelo());
        if (celo != address(0)) {
            treasury.allowToken(celo, true);
            console2.log("Allowed CELO:      ", celo);
        }

        vm.stopBroadcast();

        console2.log("AgentRegistry:     ", address(agentRegistry));
        console2.log("BadgeNFT:          ", address(badge));
        console2.log("ReputationRegistry:", address(reputation));
        console2.log("Treasury:          ", address(treasury));
        console2.log("VotingEngine:      ", address(voting));
        console2.log("GroupRegistry:     ", address(registry));
        console2.log("Admin:             ", admin);
        console2.log("Agent (AGENT_ROLE):", agent);
    }

    function _allowIfSet(Treasury treasury, string memory key) internal {
        address token = vm.envOr(key, address(0));
        if (token != address(0)) {
            treasury.allowToken(token, true);
            console2.log("Allowed token:     ", token);
        }
    }

    /// @notice Canonical CELO ERC-20 adapter for the current chain (0 if unknown).
    function _defaultCelo() internal view returns (address) {
        if (block.chainid == 42220) return 0x471EcE3750Da237f93B8E339c536989b8978a438; // Celo mainnet
        if (block.chainid == 44787) return 0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9; // Alfajores
        return address(0);
    }

    /// @notice Read PRIVATE_KEY tolerating a missing "0x" prefix.
    function _loadPrivateKey() internal view returns (uint256) {
        string memory raw = vm.envString("PRIVATE_KEY");
        bytes memory b = bytes(raw);
        bool has0x = b.length >= 2 && b[0] == 0x30 && (b[1] == 0x78 || b[1] == 0x58);
        return vm.parseUint(has0x ? raw : string.concat("0x", raw));
    }
}
