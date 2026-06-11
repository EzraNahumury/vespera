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
///   CREDIT_PER_CELO - credits minted per 1 CELO deposited (default 1000, Voxel-style)
///   LIQUIDITY_CELO  - native CELO (wei) to seed as withdrawal headroom (default 0)
///
/// Deposits are native CELO @ 1:`creditPerCelo` into a personal in-game credit balance — no
/// ERC-20 deposit tokens, no approvals. Gas is paid in native CELO by default.
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

        // 6. Configure the credit conversion rate (native CELO -> in-game credits).
        uint256 rate = vm.envOr("CREDIT_PER_CELO", uint256(1000));
        if (rate != treasury.creditPerCelo()) {
            treasury.setCreditPerCelo(rate);
        }

        // 7. Optionally seed CELO withdrawal liquidity (headroom for rounding).
        uint256 liquidity = vm.envOr("LIQUIDITY_CELO", uint256(0));
        if (liquidity != 0) {
            treasury.fundLiquidity{value: liquidity}();
            console2.log("Seeded liquidity:  ", liquidity);
        }

        vm.stopBroadcast();

        console2.log("creditPerCelo:     ", rate);

        console2.log("AgentRegistry:     ", address(agentRegistry));
        console2.log("BadgeNFT:          ", address(badge));
        console2.log("ReputationRegistry:", address(reputation));
        console2.log("Treasury:          ", address(treasury));
        console2.log("VotingEngine:      ", address(voting));
        console2.log("GroupRegistry:     ", address(registry));
        console2.log("Admin:             ", admin);
        console2.log("Agent (AGENT_ROLE):", agent);
    }

    /// @notice Read PRIVATE_KEY tolerating a missing "0x" prefix.
    function _loadPrivateKey() internal view returns (uint256) {
        string memory raw = vm.envString("PRIVATE_KEY");
        bytes memory b = bytes(raw);
        bool has0x = b.length >= 2 && b[0] == 0x30 && (b[1] == 0x78 || b[1] == 0x58);
        return vm.parseUint(has0x ? raw : string.concat("0x", raw));
    }
}
