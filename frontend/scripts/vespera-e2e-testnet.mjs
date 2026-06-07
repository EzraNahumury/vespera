// Vespera end-to-end FUNCTIONAL verification — ALFAJORES TESTNET ONLY.
//
// Proves the protocol + transaction automation actually work, end to end, against a
// FRESH instance of the contracts deployed to Celo Alfajores (chainId 44787). It does
// NOT touch mainnet, uses throwaway test wallets funded with free faucet CELO, and runs
// ONE full arisan lifecycle:
//
//   create group -> invite + join members -> everyone deposits -> one member requests a
//   withdrawal -> agent initVote (fast-track) -> members castVote FOR -> finalize -> assert
//   the payout executed.
//
// This is a functional/load test of a handful of ephemeral wallets in a single group. It is
// deliberately NOT a tool for minting many persistent wallets to inflate activity metrics.
//
// Hard safety rail: refuses to run on any chain other than Alfajores (44787).
//
// Required env:
//   ALFAJORES_FUNDER_KEY   - 0x-prefixed key of a faucet-funded testnet wallet. Becomes
//                            deployer/admin/agent (holds AGENT_ROLE). NEVER a mainnet key.
//   GROUP_REGISTRY_ADDRESS, VOTING_ENGINE_ADDRESS, TREASURY_ADDRESS, AGENT_REGISTRY_ADDRESS
//                          - addresses from the Alfajores deploy step.
// Optional env:
//   RPC_URL                - default https://alfajores-forno.celo-testnet.org
//   MEMBERS                - group size, clamped to [5, 15] (protocol bounds). Default 5.
//   DEPOSIT_CELO           - per-round deposit in CELO. Default "0.02".
//   FUND_CELO              - CELO sent to each ephemeral wallet for gas + deposit. Default "0.2".
//   WALLETS_OUT            - path to write the generated test wallets. Default "e2e-wallets.json".

import { writeFileSync } from "node:fs";
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  parseEther,
} from "viem";
import { celoAlfajores } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const ALFAJORES_ID = 44787;
const CELO_TOKEN = "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9"; // CELO ERC-20 adapter on Alfajores

// Built-in chain carries Celo's tx serializers/fee handling; only the RPC is overridable.
const alfajores = celoAlfajores;
const RPC = process.env.RPC_URL ?? alfajores.rpcUrls.default.http[0];

const ADDR = {
  groupRegistry: req("GROUP_REGISTRY_ADDRESS"),
  votingEngine: req("VOTING_ENGINE_ADDRESS"),
  treasury: req("TREASURY_ADDRESS"),
  agentRegistry: req("AGENT_REGISTRY_ADDRESS"),
};

const MEMBERS = clamp(Number(process.env.MEMBERS ?? "5"), 5, 15);
const DEPOSIT = parseEther(process.env.DEPOSIT_CELO ?? "0.02");
const FUND = parseEther(process.env.FUND_CELO ?? "0.2");
const WALLETS_OUT = process.env.WALLETS_OUT ?? "e2e-wallets.json";

// ---- ABIs (only what the lifecycle needs) ----------------------------------
const GROUP_REGISTRY_ABI = [
  { type: "function", name: "createGroup", stateMutability: "nonpayable",
    inputs: [
      { name: "depositToken", type: "address" }, { name: "depositAmount", type: "uint256" },
      { name: "maxMembers", type: "uint256" }, { name: "roundDuration", type: "uint256" },
      { name: "metadataURI", type: "string" },
    ], outputs: [{ name: "group", type: "address" }] },
  { type: "function", name: "allGroups", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
];
const GROUP_ABI = [
  { type: "function", name: "invite", stateMutability: "nonpayable", inputs: [{ name: "invitee", type: "address" }], outputs: [] },
  { type: "function", name: "join", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "deposit", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "requestWithdrawal", stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }, { name: "reasonURI", type: "string" }], outputs: [{ name: "id", type: "uint256" }] },
  { type: "function", name: "activeRequestId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getRequest", stateMutability: "view", inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [{ name: "requester", type: "address" }, { name: "amount", type: "uint256" }, { name: "token", type: "address" }, { name: "status", type: "uint8" }] },
];
const VOTING_ABI = [
  { type: "function", name: "initVote", stateMutability: "nonpayable",
    inputs: [{ name: "group", type: "address" }, { name: "requestId", type: "uint256" }, { name: "confidenceBps", type: "uint16" }], outputs: [] },
  { type: "function", name: "castVote", stateMutability: "nonpayable",
    inputs: [{ name: "group", type: "address" }, { name: "requestId", type: "uint256" }, { name: "support", type: "bool" }], outputs: [] },
  { type: "function", name: "finalize", stateMutability: "nonpayable",
    inputs: [{ name: "group", type: "address" }, { name: "requestId", type: "uint256" }], outputs: [] },
];
const ERC20_ABI = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
];

const REQUEST_STATUS = ["None", "Pending", "Voting", "Executed", "Rejected"];

// ---- helpers ---------------------------------------------------------------
function req(name) {
  const v = process.env[name];
  if (!v || !/^0x[0-9a-fA-F]{40}$/.test(v)) die(`${name} must be a valid 0x address (got "${v ?? ""}").`);
  return v;
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo)); }
function die(msg) { console.error(`\n[e2e] FAIL: ${msg}`); process.exit(1); }
function log(msg) { console.log(`[e2e] ${msg}`); }
function short(a) { return `${a.slice(0, 6)}..${a.slice(-4)}`; }

const transport = http(RPC, { timeout: 30_000 });
const publicClient = createPublicClient({ chain: alfajores, transport });

function walletFor(account) { return createWalletClient({ account, chain: alfajores, transport }); }

async function send(label, account, params) {
  const { request } = await publicClient.simulateContract({ ...params, account: account.address });
  const hash = await walletFor(account).writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  log(`${label}: ${alfajores.blockExplorers.default.url}/tx/${hash}`);
  return hash;
}

async function main() {
  // --- guard: testnet only ---
  const chainId = await publicClient.getChainId();
  if (chainId !== ALFAJORES_ID) die(`refusing to run: connected to chain ${chainId}, expected Alfajores ${ALFAJORES_ID}.`);

  const funderKey = process.env.ALFAJORES_FUNDER_KEY;
  if (!funderKey || !/^0x[0-9a-fA-F]{64}$/.test(funderKey)) die("ALFAJORES_FUNDER_KEY must be a 0x 32-byte hex key (testnet only).");
  const funder = privateKeyToAccount(funderKey);

  const funderBal = await publicClient.readContract({ address: CELO_TOKEN, abi: ERC20_ABI, functionName: "balanceOf", args: [funder.address] });
  log(`Alfajores OK. funder=${short(funder.address)} balance=${formatEther(funderBal)} CELO`);
  const needed = FUND * BigInt(MEMBERS);
  if (funderBal < needed) die(`funder needs ~${formatEther(needed)} CELO to fund ${MEMBERS} wallets; has ${formatEther(funderBal)}. Top up at https://faucet.celo.org`);

  // --- 1. generate ephemeral test wallets (keep raw keys so we can persist them) ---
  const keys = Array.from({ length: MEMBERS }, () => generatePrivateKey());
  const accounts = keys.map((k) => privateKeyToAccount(k));
  writeFileSync(WALLETS_OUT, JSON.stringify(
    { note: "ALFAJORES TESTNET THROWAWAY WALLETS — do not reuse on mainnet", chainId: ALFAJORES_ID,
      wallets: accounts.map((a, i) => ({ address: a.address, privateKey: keys[i] })) },
    null, 2,
  ));
  log(`generated ${MEMBERS} ephemeral wallets -> ${WALLETS_OUT}`);

  // --- 2. fund each wallet with native CELO (also credits the CELO ERC-20 balance) ---
  const funderWallet = walletFor(funder);
  for (const a of accounts) {
    const hash = await funderWallet.sendTransaction({ to: a.address, value: FUND });
    await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  }
  log(`funded ${MEMBERS} wallets with ${formatEther(FUND)} CELO each`);

  const creator = accounts[0];
  const requester = accounts[1];
  const others = accounts.slice(1); // invited (creator is auto-seated)

  // --- 3. create group (creator becomes founding member) ---
  await send(`createGroup (size ${MEMBERS})`, creator, {
    address: ADDR.groupRegistry, abi: GROUP_REGISTRY_ABI, functionName: "createGroup",
    args: [CELO_TOKEN, DEPOSIT, BigInt(MEMBERS), 3600n, "ipfs://vespera-e2e-test"],
  });
  const groups = await publicClient.readContract({ address: ADDR.groupRegistry, abi: GROUP_REGISTRY_ABI, functionName: "allGroups" });
  const group = groups[groups.length - 1];
  log(`group = ${group}`);

  // --- 4. invite + join the rest ---
  for (const a of others) await send(`invite ${short(a.address)}`, creator, { address: group, abi: GROUP_ABI, functionName: "invite", args: [a.address] });
  for (const a of others) await send(`join ${short(a.address)}`, a, { address: group, abi: GROUP_ABI, functionName: "join", args: [] });

  // --- 5. every member approves Treasury then deposits this round ---
  for (const a of accounts) {
    await send(`approve ${short(a.address)}`, a, { address: CELO_TOKEN, abi: ERC20_ABI, functionName: "approve", args: [ADDR.treasury, DEPOSIT] });
    await send(`deposit ${short(a.address)}`, a, { address: group, abi: GROUP_ABI, functionName: "deposit", args: [] });
  }

  // --- 6. one member requests a withdrawal of one share ---
  await send(`requestWithdrawal by ${short(requester.address)}`, requester, {
    address: group, abi: GROUP_ABI, functionName: "requestWithdrawal", args: [DEPOSIT, "ipfs://vespera-e2e-request"],
  });
  const requestId = await publicClient.readContract({ address: group, abi: GROUP_ABI, functionName: "activeRequestId" });
  log(`requestId = ${requestId}`);

  // --- 7. agent opens the vote at fast-track confidence (>=85%) ---
  await send(`initVote @8500bps`, funder, { address: ADDR.votingEngine, abi: VOTING_ABI, functionName: "initVote", args: [group, requestId, 8500] });

  // --- 8. all non-requester members vote FOR (reaches 30% fast-track quorum) ---
  for (const a of accounts) {
    if (a.address.toLowerCase() === requester.address.toLowerCase()) continue;
    await send(`castVote FOR ${short(a.address)}`, a, { address: ADDR.votingEngine, abi: VOTING_ABI, functionName: "castVote", args: [group, requestId, true] });
  }

  // --- 9. finalize (quorum reached -> early settle, no 12h wait) ---
  const balBefore = await publicClient.readContract({ address: CELO_TOKEN, abi: ERC20_ABI, functionName: "balanceOf", args: [requester.address] });
  await send(`finalize`, funder, { address: ADDR.votingEngine, abi: VOTING_ABI, functionName: "finalize", args: [group, requestId] });

  // --- 10. assert payout executed ---
  const reqData = await publicClient.readContract({ address: group, abi: GROUP_ABI, functionName: "getRequest", args: [requestId] });
  const status = Number(reqData[3]);
  const balAfter = await publicClient.readContract({ address: CELO_TOKEN, abi: ERC20_ABI, functionName: "balanceOf", args: [requester.address] });
  const delta = balAfter - balBefore;

  log("");
  log(`request status: ${REQUEST_STATUS[status]} (${status})`);
  log(`requester balance delta: +${formatEther(delta)} CELO`);

  if (status !== 3) die(`expected Executed(3), got ${REQUEST_STATUS[status]}(${status}).`);
  if (delta < DEPOSIT) die(`payout not received: delta ${formatEther(delta)} < deposit ${formatEther(DEPOSIT)}.`);

  log("");
  log("PASS — full deposit -> request -> initVote -> castVote -> finalize -> payout verified on Alfajores.");
}

main().catch((e) => die(e.shortMessage ?? e.message ?? String(e)));
