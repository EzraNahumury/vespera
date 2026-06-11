// Read-only privilege audit for Vespera mainnet contracts. No keys, no writes.
// Run: node frontend/verify-roles.mjs
import { createPublicClient, http, keccak256, toBytes } from "viem";

const OLD = "0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d"; // compromised
const NEW = "0x6d92A650aa91a42e0Abb3ff36FC6d2C5051e864B"; // intended new admin

const C = {
  VotingEngine: "0x760674315E3c1eA8665a756155C6602e547E788A",
  BadgeNFT: "0x1995408F84a41Bc81Ec748b6b0718e30f65A5fB2",
  GroupRegistry: "0xD5D1a4713B8774783CFe33Bb2c68655Dc53036f0",
  ReputationRegistry: "0x7f4a0C69c3699e7d89bdB527f9e0048Da137b6aF",
  Treasury: "0xe0F543010FbAc613a6550E19Da6a680173Cf9009",
};

const DEFAULT_ADMIN_ROLE = "0x" + "0".repeat(64);
const AGENT_ROLE = keccak256(toBytes("AGENT_ROLE"));
const MINTER_ROLE = keccak256(toBytes("MINTER_ROLE"));

const hasRoleAbi = [{
  type: "function", name: "hasRole", stateMutability: "view",
  inputs: [{ name: "role", type: "bytes32" }, { name: "account", type: "address" }],
  outputs: [{ type: "bool" }],
}];
const ownerAbi = [{
  type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }],
}];

const client = createPublicClient({ transport: http("https://forno.celo.org") });
const hasRole = (address, role, account) =>
  client.readContract({ address, abi: hasRoleAbi, functionName: "hasRole", args: [role, account] });
const ownerOf = (address) =>
  client.readContract({ address, abi: ownerAbi, functionName: "owner" });

const eq = (a, b) => a.toLowerCase() === b.toLowerCase();

console.log("=== Vespera mainnet privilege audit ===");
console.log("OLD (compromised):", OLD);
console.log("NEW (intended)   :", NEW);
console.log();

// AccessControl contracts
for (const [name, role, label] of [
  [C.VotingEngine, DEFAULT_ADMIN_ROLE, "VotingEngine.DEFAULT_ADMIN_ROLE"],
  [C.VotingEngine, AGENT_ROLE, "VotingEngine.AGENT_ROLE"],
  [C.BadgeNFT, DEFAULT_ADMIN_ROLE, "BadgeNFT.DEFAULT_ADMIN_ROLE"],
  [C.BadgeNFT, MINTER_ROLE, "BadgeNFT.MINTER_ROLE"],
]) {
  const [old_, new_] = await Promise.all([hasRole(name, role, OLD), hasRole(name, role, NEW)]);
  const flag = old_ ? "  <-- OLD STILL HAS IT" : "";
  console.log(`${label.padEnd(34)} OLD=${old_}  NEW=${new_}${flag}`);
}

// Ownable contracts
for (const [name, label] of [
  [C.GroupRegistry, "GroupRegistry.owner"],
  [C.ReputationRegistry, "ReputationRegistry.owner"],
  [C.Treasury, "Treasury.owner"],
]) {
  const o = await ownerOf(name);
  const who = eq(o, NEW) ? "NEW ok" : eq(o, OLD) ? "OLD STILL OWNER <--" : "other";
  console.log(`${label.padEnd(34)} owner=${o}  (${who})`);
}
