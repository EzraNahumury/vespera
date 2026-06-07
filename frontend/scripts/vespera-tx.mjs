import {
  createPublicClient,
  createWalletClient,
  defineChain,
  fallback,
  formatUnits,
  http,
  isAddress,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const celo = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.RPC_URL ?? process.env.NEXT_PUBLIC_RPC_URL ?? "https://forno.celo.org",
        "https://rpc.ankr.com/celo",
      ],
    },
  },
  blockExplorers: { default: { name: "Celoscan", url: "https://celoscan.io" } },
});

const CONTRACTS = {
  agentRegistry:
    process.env.AGENT_REGISTRY_ADDRESS ??
    process.env.NEXT_PUBLIC_AGENT_REGISTRY ??
    "0x67aF4795C9C76677F252d1b60DA7b240DB3A7A10",
  groupRegistry:
    process.env.GROUP_REGISTRY_ADDRESS ??
    process.env.NEXT_PUBLIC_GROUP_REGISTRY ??
    "0x493613949d63b63b02A58Ee899e9c6cd647Ae86b",
  treasury:
    process.env.TREASURY_ADDRESS ??
    process.env.NEXT_PUBLIC_TREASURY ??
    "0x4D84DD953FCdecfD54eA50e4ce6Ea809D9f9DAbd",
  votingEngine:
    process.env.VOTING_ENGINE_ADDRESS ??
    process.env.NEXT_PUBLIC_VOTING_ENGINE ??
    "0xCa8C94Fb21C5d6b8f786e6d549dAb2a8Fe2f07f6",
};

const MAX_UINT256 =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
const GROUP_REGISTRY_ABI = [
  {
    type: "function",
    name: "allGroups",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRegisteredGroup",
    inputs: [{ name: "group", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
];

const ARISAN_GROUP_ABI = [
  { type: "function", name: "activeRequestId", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "currentRound", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "deposit", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "depositAmount", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "depositToken", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  {
    type: "function",
    name: "depositedInRound",
    inputs: [
      { name: "round", type: "uint256" },
      { name: "member", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  { type: "function", name: "getMembers", inputs: [], outputs: [{ name: "", type: "address[]" }], stateMutability: "view" },
  {
    type: "function",
    name: "getRequest",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [
      { name: "requester", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "token", type: "address" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isMember",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "requestWithdrawal",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "reasonURI", type: "string" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
  },
];

const VOTING_ENGINE_ABI = [
  { type: "function", name: "AGENT_ROLE", inputs: [], outputs: [{ name: "", type: "bytes32" }], stateMutability: "view" },
  {
    type: "function",
    name: "castVote",
    inputs: [
      { name: "group", type: "address" },
      { name: "requestId", type: "uint256" },
      { name: "support", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "finalize",
    inputs: [
      { name: "group", type: "address" },
      { name: "requestId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getVote",
    inputs: [
      { name: "group", type: "address" },
      { name: "requestId", type: "uint256" },
    ],
    outputs: [
      { name: "requester", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "confidenceBps", type: "uint16" },
      { name: "quorumBps", type: "uint16" },
      { name: "deadline", type: "uint64" },
      { name: "fastTrack", type: "bool" },
      { name: "status", type: "uint8" },
      { name: "weightFor", type: "uint256" },
      { name: "weightAgainst", type: "uint256" },
      { name: "totalEligibleWeight", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasVoted",
    inputs: [
      { name: "group", type: "address" },
      { name: "requestId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initVote",
    inputs: [
      { name: "group", type: "address" },
      { name: "requestId", type: "uint256" },
      { name: "confidenceBps", type: "uint16" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const AGENT_REGISTRY_ABI = [
  {
    type: "function",
    name: "setAgent",
    inputs: [
      { name: "agent", type: "address" },
      { name: "policyURI", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const ERC20_ABI = [
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "decimals", inputs: [], outputs: [{ name: "", type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
];

const action = (process.env.ACTION ?? "auto").toLowerCase();
const dryRun = readBool("DRY_RUN", true);
const autoDeposit = readBool("AUTO_DEPOSIT", false);
const autoInitVote = readBool("AUTO_INIT_VOTE", true);
const autoCastVote = readBool("AUTO_CAST_VOTE", true);
const autoFinalize = readBool("AUTO_FINALIZE", true);
const voteSupport = readBool("VOTE_SUPPORT", true);
const confidenceBps = Number(process.env.CONFIDENCE_BPS ?? "8500");
const maxGroups = Math.max(1, Number(process.env.MAX_GROUPS ?? "10"));

// --- Money guardrails for live mainnet runs ---
// GROUP_ALLOWLIST: comma-separated addresses. When set, only these groups are ever touched.
// MAX_AMOUNT: human token units. When set, any request whose amount exceeds it is skipped
//   (applies to initVote / castVote / finalize — the actions that can move escrowed funds).
const groupAllowlist = (process.env.GROUP_ALLOWLIST ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const maxAmountHuman = (process.env.MAX_AMOUNT ?? "").trim(); // "" = no cap

const transport = fallback(
  celo.rpcUrls.default.http.filter(Boolean).map((url) => http(url, { timeout: 30_000 })),
  { rank: false, retryCount: 2, retryDelay: 500 },
);

const publicClient = createPublicClient({ chain: celo, transport });
const account = loadAccount();
const signerAddress = account?.address ?? normalizeAddress(process.env.SIGNER_ADDRESS, "SIGNER_ADDRESS", !dryRun);
const walletClient = account
  ? createWalletClient({ account, chain: celo, transport })
  : null;

function readBool(name, fallbackValue) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallbackValue;
  return ["1", "true", "yes", "y", "on"].includes(raw.toLowerCase());
}

function loadAccount() {
  const pk = process.env.PRIVATE_KEY ?? process.env.VESPERA_TX_PRIVATE_KEY;
  if (!pk) return null;
  if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) die("PRIVATE_KEY must be a 0x-prefixed 32-byte hex string.");
  return privateKeyToAccount(pk);
}

function normalizeAddress(value, name, optional = false) {
  if (!value && optional) return undefined;
  if (!value || !isAddress(value)) die(`${name} must be a valid 0x address.`);
  return value;
}

function txUrl(hash) {
  return `${celo.blockExplorers.default.url}/tx/${hash}`;
}

function short(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function die(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`[vespera-tx] ${message}`);
}

async function assertCeloMainnet() {
  const chainId = await publicClient.getChainId();
  if (chainId !== celo.id) {
    die(`refusing to run: RPC is chain ${chainId}, expected Celo mainnet ${celo.id}.`);
  }
}

async function readTokenMeta(token) {
  const [symbol, decimals] = await Promise.all([
    publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: "symbol" }).catch(() => "TOKEN"),
    publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: "decimals" }).catch(() => 18),
  ]);
  return { symbol, decimals: Number(decimals) };
}

async function sendContract(label, params) {
  if (!signerAddress) die(`${label} needs PRIVATE_KEY or SIGNER_ADDRESS.`);

  let request;
  try {
    ({ request } = await publicClient.simulateContract({
      ...params,
      account: signerAddress,
    }));
  } catch (err) {
    info(`${label}: skipped (${err.shortMessage ?? err.message ?? String(err)})`);
    return null;
  }

  if (dryRun) {
    info(`${label}: dry-run simulation ok`);
    return null;
  }

  if (!walletClient) die(`${label} needs PRIVATE_KEY when DRY_RUN=0.`);
  const hash = await walletClient.writeContract(request);
  info(`${label}: submitted ${txUrl(hash)}`);
  await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  info(`${label}: confirmed`);
  return hash;
}

async function selectedGroups() {
  const explicit = process.env.GROUP_ADDRESS;
  if (explicit) {
    const addr = normalizeAddress(explicit, "GROUP_ADDRESS");
    if (groupAllowlist.length && !groupAllowlist.includes(addr.toLowerCase())) {
      die(`GROUP_ADDRESS ${addr} is not in GROUP_ALLOWLIST.`);
    }
    return [addr];
  }

  const groups = await publicClient.readContract({
    address: CONTRACTS.groupRegistry,
    abi: GROUP_REGISTRY_ABI,
    functionName: "allGroups",
  });
  const filtered = groupAllowlist.length
    ? groups.filter((g) => groupAllowlist.includes(g.toLowerCase()))
    : groups;
  return filtered.slice(0, maxGroups);
}

// Returns true when the request amount is within MAX_AMOUNT (or no cap is set). Logs and
// returns false when it exceeds the cap, so money actions can be skipped safely.
async function amountWithinCap(label, group, requestId) {
  if (!maxAmountHuman) return true;
  const [, amount, token] = await publicClient.readContract({
    address: group,
    abi: ARISAN_GROUP_ABI,
    functionName: "getRequest",
    args: [requestId],
  });
  const meta = await readTokenMeta(token);
  const cap = parseUnits(maxAmountHuman, meta.decimals);
  if (amount > cap) {
    info(
      `${label} ${short(group)} #${requestId}: skipped (amount ${formatUnits(amount, meta.decimals)} ${meta.symbol} exceeds MAX_AMOUNT ${maxAmountHuman})`,
    );
    return false;
  }
  return true;
}

async function assertRegistered(group) {
  const ok = await publicClient.readContract({
    address: CONTRACTS.groupRegistry,
    abi: GROUP_REGISTRY_ABI,
    functionName: "isRegisteredGroup",
    args: [group],
  });
  if (!ok) die(`${group} is not registered in GroupRegistry.`);
}

async function deposit(group) {
  if (!signerAddress) die("deposit needs PRIVATE_KEY or SIGNER_ADDRESS.");
  await assertRegistered(group);

  const [isMember, currentRound, token, amount] = await Promise.all([
    publicClient.readContract({ address: group, abi: ARISAN_GROUP_ABI, functionName: "isMember", args: [signerAddress] }),
    publicClient.readContract({ address: group, abi: ARISAN_GROUP_ABI, functionName: "currentRound" }),
    publicClient.readContract({ address: group, abi: ARISAN_GROUP_ABI, functionName: "depositToken" }),
    publicClient.readContract({ address: group, abi: ARISAN_GROUP_ABI, functionName: "depositAmount" }),
  ]);
  if (!isMember) {
    info(`deposit ${short(group)}: skipped (signer is not a member)`);
    return;
  }

  const alreadyDeposited = await publicClient.readContract({
    address: group,
    abi: ARISAN_GROUP_ABI,
    functionName: "depositedInRound",
    args: [currentRound, signerAddress],
  });
  if (alreadyDeposited) {
    info(`deposit ${short(group)}: skipped (already deposited in round ${currentRound})`);
    return;
  }

  const [meta, balance, allowance] = await Promise.all([
    readTokenMeta(token),
    publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: "balanceOf", args: [signerAddress] }),
    publicClient.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [signerAddress, CONTRACTS.treasury],
    }),
  ]);

  info(`deposit ${short(group)}: needs ${formatUnits(amount, meta.decimals)} ${meta.symbol}`);
  if (balance < amount) {
    info(`deposit ${short(group)}: skipped (balance ${formatUnits(balance, meta.decimals)} ${meta.symbol})`);
    return;
  }

  if (allowance < amount) {
    await sendContract(`approve ${meta.symbol} to Treasury`, {
      address: token,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.treasury, MAX_UINT256],
    });
  }

  await sendContract(`deposit round ${currentRound} for ${short(group)}`, {
    address: group,
    abi: ARISAN_GROUP_ABI,
    functionName: "deposit",
  });
}

async function requestWithdrawal(group) {
  const token = await publicClient.readContract({ address: group, abi: ARISAN_GROUP_ABI, functionName: "depositToken" });
  const meta = await readTokenMeta(token);
  const rawAmount = process.env.WITHDRAW_AMOUNT_WEI
    ? BigInt(process.env.WITHDRAW_AMOUNT_WEI)
    : parseUnits(process.env.WITHDRAW_AMOUNT ?? "0", meta.decimals);
  if (rawAmount <= 0n) die("request-withdrawal needs WITHDRAW_AMOUNT or WITHDRAW_AMOUNT_WEI.");

  await sendContract(`request withdrawal from ${short(group)}`, {
    address: group,
    abi: ARISAN_GROUP_ABI,
    functionName: "requestWithdrawal",
    args: [rawAmount, process.env.REASON_URI ?? "ipfs://vespera-automation-request"],
  });
}

async function initVote(group, requestId) {
  const role = await publicClient.readContract({
    address: CONTRACTS.votingEngine,
    abi: VOTING_ENGINE_ABI,
    functionName: "AGENT_ROLE",
  });
  const hasAgentRole = signerAddress
    ? await publicClient.readContract({
        address: CONTRACTS.votingEngine,
        abi: VOTING_ENGINE_ABI,
        functionName: "hasRole",
        args: [role, signerAddress],
      })
    : false;
  if (!hasAgentRole) {
    info(`initVote ${short(group)} #${requestId}: skipped (signer lacks AGENT_ROLE)`);
    return;
  }
  if (!(await amountWithinCap("initVote", group, requestId))) return;

  await sendContract(`init vote ${short(group)} #${requestId}`, {
    address: CONTRACTS.votingEngine,
    abi: VOTING_ENGINE_ABI,
    functionName: "initVote",
    args: [group, requestId, confidenceBps],
  });
}

async function castVote(group, requestId) {
  if (!signerAddress) die("cast-vote needs PRIVATE_KEY or SIGNER_ADDRESS.");
  const [request, isMember, hasVoted] = await Promise.all([
    publicClient.readContract({ address: group, abi: ARISAN_GROUP_ABI, functionName: "getRequest", args: [requestId] }),
    publicClient.readContract({ address: group, abi: ARISAN_GROUP_ABI, functionName: "isMember", args: [signerAddress] }),
    publicClient.readContract({
      address: CONTRACTS.votingEngine,
      abi: VOTING_ENGINE_ABI,
      functionName: "hasVoted",
      args: [group, requestId, signerAddress],
    }),
  ]);

  const requester = request[0];
  if (!isMember) {
    info(`castVote ${short(group)} #${requestId}: skipped (signer is not a member)`);
    return;
  }
  if (requester.toLowerCase() === signerAddress.toLowerCase()) {
    info(`castVote ${short(group)} #${requestId}: skipped (requester cannot vote)`);
    return;
  }
  if (hasVoted) {
    info(`castVote ${short(group)} #${requestId}: skipped (already voted)`);
    return;
  }
  if (!(await amountWithinCap("castVote", group, requestId))) return;

  await sendContract(`cast ${voteSupport ? "for" : "against"} vote ${short(group)} #${requestId}`, {
    address: CONTRACTS.votingEngine,
    abi: VOTING_ENGINE_ABI,
    functionName: "castVote",
    args: [group, requestId, voteSupport],
  });
}

async function finalize(group, requestId) {
  if (!(await amountWithinCap("finalize", group, requestId))) return;

  await sendContract(`finalize vote ${short(group)} #${requestId}`, {
    address: CONTRACTS.votingEngine,
    abi: VOTING_ENGINE_ABI,
    functionName: "finalize",
    args: [group, requestId],
  });
}

async function configureAgent() {
  const agent = normalizeAddress(process.env.AGENT_ADDRESS, "AGENT_ADDRESS");
  const policyURI = process.env.POLICY_URI ?? "ipfs://vespera-policy-balanced-v1";
  await sendContract(`configure agent ${short(agent)}`, {
    address: CONTRACTS.agentRegistry,
    abi: AGENT_REGISTRY_ABI,
    functionName: "setAgent",
    args: [agent, policyURI],
  });
}

async function autoGroup(group) {
  await assertRegistered(group);
  info(`checking group ${group}`);

  if (autoDeposit) await deposit(group);

  const activeRequestId = await publicClient.readContract({
    address: group,
    abi: ARISAN_GROUP_ABI,
    functionName: "activeRequestId",
  });
  if (activeRequestId === 0n) {
    info(`group ${short(group)}: no active request`);
    return;
  }

  const request = await publicClient.readContract({
    address: group,
    abi: ARISAN_GROUP_ABI,
    functionName: "getRequest",
    args: [activeRequestId],
  });
  const status = Number(request[3]);

  if (status === 1 && autoInitVote) await initVote(group, activeRequestId);
  if (status === 2 && autoCastVote) await castVote(group, activeRequestId);
  if (status === 2 && autoFinalize) await finalize(group, activeRequestId);
}

async function main() {
  await assertCeloMainnet();
  Object.entries(CONTRACTS).forEach(([name, address]) => normalizeAddress(address, name.toUpperCase()));
  if (confidenceBps < 0 || confidenceBps > 10_000) die("CONFIDENCE_BPS must be between 0 and 10000.");

  info(`${dryRun ? "dry-run" : "live"} mode on ${celo.name}`);
  info(`action=${action}${signerAddress ? ` signer=${signerAddress}` : ""}`);
  info(
    `guardrails: allowlist=${groupAllowlist.length ? `${groupAllowlist.length} group(s)` : "off (all groups)"}, max-amount=${maxAmountHuman || "off (uncapped)"}`,
  );
  if (!dryRun && !maxAmountHuman) {
    info("WARNING: live mode with no MAX_AMOUNT cap — withdrawals of any size can be actioned.");
  }

  if (!dryRun && !walletClient) die("DRY_RUN=0 requires PRIVATE_KEY.");

  if (action === "configure-agent") return configureAgent();

  const groups = await selectedGroups();
  if (groups.length === 0) {
    info("no groups found");
    return;
  }

  const group = normalizeAddress(process.env.GROUP_ADDRESS || groups[0], "GROUP_ADDRESS");
  const requestId = process.env.REQUEST_ID ? BigInt(process.env.REQUEST_ID) : undefined;

  if (action === "auto") {
    for (const g of groups) await autoGroup(g);
    return;
  }
  if (action === "deposit") return deposit(group);
  if (action === "request-withdrawal") return requestWithdrawal(group);
  if (action === "init-vote") return initVote(group, requestId ?? die("REQUEST_ID is required."));
  if (action === "cast-vote") return castVote(group, requestId ?? die("REQUEST_ID is required."));
  if (action === "finalize") return finalize(group, requestId ?? die("REQUEST_ID is required."));

  die(`unknown ACTION "${action}"`);
}

main().catch((err) => {
  console.error(err.shortMessage ?? err.message ?? err);
  process.exit(1);
});
