/**
 * vespera-setup-groups.mjs
 *
 * One-time setup: buat N ArisanGroup di Celo mainnet dan distribusikan
 * 100 wallet ke dalamnya.
 *
 * Flow per group:
 *   1. Wallet pertama di slice panggil createGroup → jadi founding member
 *   2. Wallet pertama invite sisa member di slice-nya
 *   3. Setiap invited wallet panggil join
 *
 * Env:
 *   WALLET_BATCH_01_JSON..05_JSON   wallet batch dari secrets (wajib)
 *   DRY_RUN                         1=simulate saja (default 1)
 *   CONFIRM_MAINNET                 1=wajib untuk live run
 *   GROUP_COUNT                     jumlah group (default 7)
 *   MAX_MEMBERS                     max member per group (default 15)
 *   DEPOSIT_TOKEN                   ERC-20 deposit token (default: CELO mainnet)
 *   DEPOSIT_AMOUNT_CELO             deposit per round dalam CELO (default 0.01)
 *   ROUND_DURATION_SECONDS          durasi round dalam detik (default 3600)
 *   METADATA_URI_PREFIX             prefix URI metadata group
 *   TX_DELAY_MS                     delay antar tx dalam ms (default 2000)
 *   RPC_URL                         Celo RPC URL
 *   MIN_GAS_BALANCE_CELO            minimum CELO per wallet untuk gas (default 0.05)
 */

import {
  createPublicClient,
  createWalletClient,
  fallback,
  formatEther,
  http,
  parseEther,
} from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");

// --- Kontrak mainnet ---
const CELO_MAINNET_ID = 42220;
const CELO_TOKEN_MAINNET = "0x471EcE3750Da237f93B8E339c536989b8978a438";
const GROUP_REGISTRY = "0x493613949d63b63b02A58Ee899e9c6cd647Ae86b";

const rpcUrls = [
  process.env.RPC_URL ?? "https://forno.celo.org",
  "https://rpc.ankr.com/celo",
].filter(Boolean);

const transport = fallback(
  rpcUrls.map((url) => http(url, { timeout: 30_000 })),
  { rank: false, retryCount: 3, retryDelay: 1_000 },
);
const publicClient = createPublicClient({ chain: celo, transport });

// --- ABI ---
const GROUP_REGISTRY_ABI = [
  {
    type: "function", name: "createGroup", stateMutability: "nonpayable",
    inputs: [
      { name: "depositToken", type: "address" },
      { name: "depositAmount", type: "uint256" },
      { name: "maxMembers", type: "uint256" },
      { name: "roundDuration", type: "uint256" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [{ name: "group", type: "address" }],
  },
  {
    type: "function", name: "allGroups", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "address[]" }],
  },
];

const GROUP_ABI = [
  {
    type: "function", name: "invite", stateMutability: "nonpayable",
    inputs: [{ name: "invitee", type: "address" }], outputs: [],
  },
  {
    type: "function", name: "join", stateMutability: "nonpayable",
    inputs: [], outputs: [],
  },
];

// --- Config ---
function readBool(name, fallbackValue) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallbackValue;
  return ["1", "true", "yes", "y", "on"].includes(raw.toLowerCase());
}

function readInt(name, fallbackValue, { min = 0, max = Infinity } = {}) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallbackValue;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max)
    die(`${name} harus integer [${min}, ${max}]`);
  return n;
}

const DRY_RUN = readBool("DRY_RUN", true);
const CONFIRM_MAINNET = readBool("CONFIRM_MAINNET", false);
const GROUP_COUNT = readInt("GROUP_COUNT", 7, { min: 1, max: 50 });
const MAX_MEMBERS = readInt("MAX_MEMBERS", 15, { min: 2, max: 15 });
const DEPOSIT_TOKEN = process.env.DEPOSIT_TOKEN ?? CELO_TOKEN_MAINNET;
const DEPOSIT_AMOUNT = parseEther(process.env.DEPOSIT_AMOUNT_CELO ?? "0.01");
const ROUND_DURATION = BigInt(readInt("ROUND_DURATION_SECONDS", 3600, { min: 60 }));
const METADATA_URI_PREFIX = process.env.METADATA_URI_PREFIX ?? "ipfs://vespera-stress-group-";
const TX_DELAY_MS = readInt("TX_DELAY_MS", 2_000, { min: 0 });
const MIN_GAS_BALANCE = parseEther(process.env.MIN_GAS_BALANCE_CELO ?? "0.05");

// --- Helpers ---
function die(msg) {
  console.error(`[vespera-setup-groups] Error: ${msg}`);
  process.exit(1);
}

function info(msg) {
  console.log(`[vespera-setup-groups] ${msg}`);
}

function short(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function txUrl(hash) {
  return `https://celoscan.io/tx/${hash}`;
}

async function sleep(ms) {
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
}

function walletFor(account) {
  return createWalletClient({ account, chain: celo, transport });
}

async function send(label, account, params, gasLimit = 3_000_000n) {
  // Simulate to catch reverts early before submitting
  try {
    await publicClient.simulateContract({
      ...params,
      account: account.address,
    });
  } catch (err) {
    info(`${label}: SKIP — ${err.shortMessage ?? err.message ?? String(err)}`);
    return null;
  }

  if (DRY_RUN) {
    info(`${label}: dry-run ok`);
    return null;
  }

  let hash;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Use writeContract directly with explicit gas — simulateContract gas estimate
      // is unreliable on Celo (returns too low for contract-deploying calls)
      hash = await walletFor(account).writeContract({ ...params, gas: gasLimit });
      break;
    } catch (err) {
      if (attempt === 3) throw err;
      info(`${label}: tx error attempt ${attempt}/3 — retry in 3s`);
      await sleep(3_000);
    }
  }

  const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  info(`${label}: confirmed gasUsed=${receipt.gasUsed} ${txUrl(hash)}`);
  await sleep(TX_DELAY_MS);
  return hash;
}

// --- Load wallets ---
function loadAllWallets() {
  const batchNums = ["01", "02", "03", "04", "05"];
  const all = [];

  for (const num of batchNums) {
    const raw =
      process.env[`WALLET_BATCH_${num}_JSON`] ??
      process.env[`VESPERA_WALLET_BATCH_${num}_JSON`];
    if (!raw?.trim()) continue;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      die(`JSON tidak valid di WALLET_BATCH_${num}_JSON: ${e.message}`);
    }
    if (!Array.isArray(parsed.wallets))
      die(`WALLET_BATCH_${num}_JSON tidak punya array wallets`);

    for (const w of parsed.wallets) {
      if (!/^0x[0-9a-fA-F]{64}$/.test(w.privateKey ?? ""))
        die(`wallet di batch-${num} punya privateKey tidak valid`);
      const account = privateKeyToAccount(w.privateKey);
      if (account.address.toLowerCase() !== (w.address ?? "").toLowerCase())
        die(`batch-${num}: privateKey dan address tidak cocok`);
      all.push(account);
    }
  }

  if (!all.length)
    die("tidak ada wallet terload — set WALLET_BATCH_01_JSON sampai WALLET_BATCH_05_JSON");
  return all;
}

// Bagi wallet ke N group, distribusi se-merata mungkin
function distributeWallets(wallets, groupCount, maxMembers) {
  const groups = [];
  let offset = 0;

  for (let i = 0; i < groupCount && offset < wallets.length; i++) {
    const remaining = groupCount - i;
    const walletsLeft = wallets.length - offset;
    const size = Math.min(maxMembers, Math.ceil(walletsLeft / remaining));
    if (size < 2) {
      // Sisanya masuk ke group terakhir jika muat
      if (groups.length && groups[groups.length - 1].length < maxMembers) {
        const extra = wallets.slice(offset);
        groups[groups.length - 1].push(...extra.slice(0, maxMembers - groups[groups.length - 1].length));
      }
      break;
    }
    groups.push(wallets.slice(offset, offset + size));
    offset += size;
  }

  return groups;
}

async function checkGasBalances(wallets) {
  info(`cek CELO balance ${wallets.length} wallet untuk gas...`);
  const low = [];
  for (const account of wallets) {
    const bal = await publicClient.getBalance({ address: account.address });
    if (bal < MIN_GAS_BALANCE) {
      low.push(`${short(account.address)}: ${formatEther(bal)} CELO`);
    }
  }
  if (low.length) {
    info(`PERINGATAN: ${low.length} wallet di bawah ${formatEther(MIN_GAS_BALANCE)} CELO:`);
    for (const l of low) info(`  ${l}`);
    if (!DRY_RUN) die("fund wallet dulu sebelum jalankan live setup");
  }
}

async function main() {
  if (!DRY_RUN && !CONFIRM_MAINNET) {
    die("live mainnet setup butuh CONFIRM_MAINNET=1");
  }

  const chainId = await publicClient.getChainId();
  if (chainId !== CELO_MAINNET_ID) {
    die(`menolak: RPC chain ${chainId}, expected Celo mainnet ${CELO_MAINNET_ID}`);
  }

  info(`mode: ${DRY_RUN ? "DRY-RUN" : "LIVE"} di Celo mainnet`);
  info(`config: groups=${GROUP_COUNT} max_members=${MAX_MEMBERS} deposit=${formatEther(DEPOSIT_AMOUNT)} CELO round=${ROUND_DURATION}s delay=${TX_DELAY_MS}ms`);

  const wallets = loadAllWallets();
  info(`loaded ${wallets.length} wallet`);

  const groups = distributeWallets(wallets, GROUP_COUNT, MAX_MEMBERS);
  info(`distribusi ${wallets.length} wallet ke ${groups.length} group:`);
  for (let i = 0; i < groups.length; i++) {
    info(`  group-${i + 1}: ${groups[i].length} member, creator=${short(groups[i][0].address)}`);
  }

  // Cek balance gas untuk semua creator + invited wallet
  if (!DRY_RUN) {
    await checkGasBalances(wallets);
  }

  // Cek group yang sudah ada
  const existingGroups = await publicClient.readContract({
    address: GROUP_REGISTRY,
    abi: GROUP_REGISTRY_ABI,
    functionName: "allGroups",
  });
  if (existingGroups.length > 0) {
    info(`PERINGATAN: ${existingGroups.length} group sudah ada di GroupRegistry:`);
    for (const g of existingGroups) info(`  ${g}`);
    if (!DRY_RUN) {
      info("Script akan buat group baru di atas yang sudah ada. Ctrl+C untuk batalkan.");
      await sleep(5_000);
    }
  }

  const createdGroups = [];

  for (let i = 0; i < groups.length; i++) {
    const members = groups[i];
    const creator = members[0];
    const invited = members.slice(1);
    const groupNum = i + 1;
    const metadataURI = `${METADATA_URI_PREFIX}${groupNum}`;

    info(`\n=== Group ${groupNum}/${groups.length} — ${members.length} member ===`);
    info(`creator: ${short(creator.address)}`);

    // 1. Buat group (deploy ArisanGroup — needs high gas)
    await send(`createGroup-${groupNum}`, creator, {
      address: GROUP_REGISTRY,
      abi: GROUP_REGISTRY_ABI,
      functionName: "createGroup",
      args: [DEPOSIT_TOKEN, DEPOSIT_AMOUNT, BigInt(MAX_MEMBERS), ROUND_DURATION, metadataURI],
    }, 5_000_000n);

    let groupAddress = null;
    if (!DRY_RUN) {
      const allGroups = await publicClient.readContract({
        address: GROUP_REGISTRY,
        abi: GROUP_REGISTRY_ABI,
        functionName: "allGroups",
      });
      groupAddress = allGroups[allGroups.length - 1];
      info(`group-${groupNum} address: ${groupAddress}`);
      createdGroups.push({ groupNum, address: groupAddress, memberCount: members.length });
    } else {
      info(`group-${groupNum} address: [dry-run — tidak dibuat]`);
      createdGroups.push({ groupNum, address: null, memberCount: members.length });
    }

    // 2. Invite semua member
    for (let j = 0; j < invited.length; j++) {
      const invitee = invited[j];
      if (groupAddress) {
        await send(
          `group-${groupNum} invite ${j + 1}/${invited.length} ${short(invitee.address)}`,
          creator,
          { address: groupAddress, abi: GROUP_ABI, functionName: "invite", args: [invitee.address] },
          300_000n,
        );
      } else {
        info(`group-${groupNum} invite ${short(invitee.address)}: dry-run skip`);
      }
    }

    // 3. Setiap invited wallet join
    for (let j = 0; j < invited.length; j++) {
      const member = invited[j];
      if (groupAddress) {
        await send(
          `group-${groupNum} join ${j + 1}/${invited.length} ${short(member.address)}`,
          member,
          { address: groupAddress, abi: GROUP_ABI, functionName: "join" },
          300_000n,
        );
      } else {
        info(`group-${groupNum} join ${short(member.address)}: dry-run skip`);
      }
    }
  }

  // === Summary ===
  info("\n=== SETUP SELESAI ===");
  const liveGroups = createdGroups.filter((g) => g.address);

  if (liveGroups.length) {
    info(`Group berhasil dibuat: ${liveGroups.length}`);
    for (const g of liveGroups) {
      info(`  Group ${g.groupNum}: ${g.address} (${g.memberCount} member)`);
    }

    const allowlist = liveGroups.map((g) => g.address).join(",");
    info(`\n--- Set GitHub Actions Variables ini ---`);
    info(`VESPERA_GROUP_ALLOWLIST = ${allowlist}`);
    info(`(biarkan VESPERA_GROUP_ADDRESS kosong agar auto-scan semua group)`);

    // Simpan ke file lokal
    const walletsDir = path.join(frontendDir, "wallets");
    if (!existsSync(walletsDir)) mkdirSync(walletsDir, { recursive: true });
    const outPath = path.join(walletsDir, "groups.json");
    writeFileSync(outPath, JSON.stringify({ groups: liveGroups }, null, 2), "utf8");
    info(`\nDisimpan ke wallets/groups.json`);
  } else if (DRY_RUN) {
    info(`Dry-run selesai — ${groups.length} group akan dibuat saat live`);
    info("Set DRY_RUN=0 dan CONFIRM_MAINNET=1 untuk run live.");
  }
}

main().catch((err) => {
  console.error(`[vespera-setup-groups] Fatal: ${err.shortMessage ?? err.message ?? String(err)}`);
  process.exit(1);
});
