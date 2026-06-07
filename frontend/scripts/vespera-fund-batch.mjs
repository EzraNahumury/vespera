import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  fallback,
  formatEther,
  http,
  isAddress,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const CELO_MAINNET_ID = 42220;
const DEFAULT_LIMIT = 10;
const DEFAULT_MAX_LIMIT = 25;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const walletsDir = path.join(frontendDir, "wallets");

const celo = defineChain({
  id: CELO_MAINNET_ID,
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

const transport = fallback(
  celo.rpcUrls.default.http.filter(Boolean).map((url) => http(url, { timeout: 30_000 })),
  { rank: false, retryCount: 2, retryDelay: 500 },
);
const publicClient = createPublicClient({ chain: celo, transport });

function readBool(name, fallbackValue) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallbackValue;
  return ["1", "true", "yes", "y", "on"].includes(raw.toLowerCase());
}

function readInt(name, fallbackValue, { min = 0 } = {}) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallbackValue;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min) die(`${name} must be an integer >= ${min}.`);
  return n;
}

function readCelo(name, fallbackValue) {
  const raw = (process.env[name] ?? fallbackValue).trim();
  if (!/^\d+(?:\.\d+)?$/.test(raw)) die(`${name} must be a non-negative CELO amount.`);
  return parseEther(raw);
}

function die(message) {
  console.error(`[vespera-fund-batch] Error: ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`[vespera-fund-batch] ${message}`);
}

function short(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function txUrl(hash) {
  return `${celo.blockExplorers.default.url}/tx/${hash}`;
}

function batchFileFromEnv() {
  const explicit = process.env.WALLET_BATCH_FILE?.trim();
  if (explicit) return resolveWalletFile(explicit);

  const batch = process.env.WALLET_BATCH?.trim();
  if (!batch) die("WALLET_BATCH is required.");
  if (!/^(?:batch-)?\d{1,2}(?:\.json)?$/.test(batch)) {
    die('WALLET_BATCH must look like "1", "01", "batch-01", or "batch-01.json".');
  }

  const n = Number(batch.replace(/^batch-/, "").replace(/\.json$/, ""));
  if (!Number.isInteger(n) || n < 1) die("WALLET_BATCH must be >= 1.");
  return resolveWalletFile(`batch-${String(n).padStart(2, "0")}.json`);
}

function resolveWalletFile(fileName) {
  const resolved = path.resolve(walletsDir, fileName);
  if (!resolved.startsWith(`${walletsDir}${path.sep}`)) {
    die("wallet batch file must stay inside frontend/wallets.");
  }
  if (!existsSync(resolved)) die(`wallet batch file not found: ${path.relative(frontendDir, resolved)}`);
  return resolved;
}

function loadWalletBatch(file) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    die(`failed to read ${path.relative(frontendDir, file)}: ${err.message}`);
  }

  if (!Array.isArray(parsed.wallets)) die("wallet batch JSON must contain a wallets array.");

  return parsed.wallets.map((wallet, position) => {
    if (!isAddress(wallet.address ?? "")) {
      die(`wallet at position ${position} has an invalid address.`);
    }
    return {
      index: Number.isInteger(Number(wallet.index)) ? Number(wallet.index) : position + 1,
      address: wallet.address,
    };
  });
}

function selectWallets(wallets) {
  const indexes = (process.env.WALLET_INDEXES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (indexes.length) {
    const maxLimit = readInt("MAX_WALLETS_PER_RUN", DEFAULT_MAX_LIMIT, { min: 1 });
    const wanted = new Set(indexes.map((s) => {
      const n = Number(s);
      if (!Number.isInteger(n) || n < 1) die("WALLET_INDEXES must be comma-separated positive integers.");
      return n;
    }));
    const selected = wallets.filter((wallet) => wanted.has(wallet.index));
    if (selected.length > maxLimit) die(`WALLET_INDEXES selected ${selected.length} wallet(s), exceeding MAX_WALLETS_PER_RUN ${maxLimit}.`);
    return selected;
  }

  const offset = readInt("WALLET_OFFSET", 0, { min: 0 });
  const limit = readInt("WALLET_LIMIT", DEFAULT_LIMIT, { min: 1 });
  const maxLimit = readInt("MAX_WALLETS_PER_RUN", DEFAULT_MAX_LIMIT, { min: 1 });
  if (limit > maxLimit) die(`WALLET_LIMIT ${limit} exceeds MAX_WALLETS_PER_RUN ${maxLimit}.`);
  return wallets.slice(offset, offset + limit);
}

async function assertCeloMainnet() {
  const chainId = await publicClient.getChainId();
  if (chainId !== CELO_MAINNET_ID) {
    die(`refusing to run: RPC is chain ${chainId}, expected Celo mainnet ${CELO_MAINNET_ID}.`);
  }
}

function loadFunderAccount(optional) {
  const key =
    process.env.FUNDER_PRIVATE_KEY ??
    process.env.VESPERA_FUNDER_PRIVATE_KEY ??
    process.env.PRIVATE_KEY;
  if (!key) {
    if (optional) return null;
    die("FUNDER_PRIVATE_KEY is required when DRY_RUN=0.");
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) die("FUNDER_PRIVATE_KEY must be a 0x-prefixed 32-byte hex string.");
  return privateKeyToAccount(key);
}

async function main() {
  await assertCeloMainnet();

  const dryRun = readBool("DRY_RUN", true);
  const confirmMainnet = readBool("CONFIRM_MAINNET", false);
  if (!dryRun && !confirmMainnet) {
    die("live mainnet funding requires CONFIRM_MAINNET=1.");
  }

  const minBalance = readCelo("MIN_BALANCE_CELO", "0.02");
  const targetBalance = readCelo("TARGET_BALANCE_CELO", "0.05");
  const maxTopup = readCelo("MAX_TOPUP_CELO", "0.05");
  if (targetBalance <= minBalance) die("TARGET_BALANCE_CELO must be greater than MIN_BALANCE_CELO.");
  if (maxTopup <= 0n) die("MAX_TOPUP_CELO must be greater than 0.");

  const batchFile = batchFileFromEnv();
  const wallets = loadWalletBatch(batchFile);
  const selected = selectWallets(wallets);
  if (!selected.length) die("selected wallet slice is empty.");

  const funder = loadFunderAccount(dryRun);
  const walletClient = funder ? createWalletClient({ account: funder, chain: celo, transport }) : null;

  info(
    `${dryRun ? "dry-run" : "live"} funding plan for ${selected.length}/${wallets.length} wallet(s) from ${path.relative(frontendDir, batchFile)}`,
  );
  if (funder) info(`funder=${short(funder.address)}`);
  info(`min=${formatEther(minBalance)} CELO target=${formatEther(targetBalance)} CELO max-topup=${formatEther(maxTopup)} CELO`);

  const plan = [];
  for (const wallet of selected) {
    const balance = await publicClient.getBalance({ address: wallet.address });
    if (balance >= minBalance) {
      info(`wallet #${wallet.index} ${short(wallet.address)}: skip balance=${formatEther(balance)} CELO`);
      continue;
    }

    const needed = targetBalance - balance;
    const amount = needed > maxTopup ? maxTopup : needed;
    plan.push({ wallet, balance, amount });
    info(
      `wallet #${wallet.index} ${short(wallet.address)}: top up ${formatEther(amount)} CELO (balance=${formatEther(balance)})`,
    );
  }

  const total = plan.reduce((sum, item) => sum + item.amount, 0n);
  info(`planned transfer total=${formatEther(total)} CELO`);

  if (!plan.length) {
    info("nothing to fund");
    return;
  }

  if (!funder) {
    info("dry-run without funder key: skipped funder balance check and transactions");
    return;
  }

  const funderBalance = await publicClient.getBalance({ address: funder.address });
  if (funderBalance < total) {
    die(`funder has ${formatEther(funderBalance)} CELO, planned topups need ${formatEther(total)} CELO plus gas.`);
  }

  if (dryRun) {
    info(`dry-run: funder balance=${formatEther(funderBalance)} CELO; no transactions sent`);
    return;
  }

  for (const item of plan) {
    const hash = await walletClient.sendTransaction({
      to: item.wallet.address,
      value: item.amount,
    });
    info(`wallet #${item.wallet.index} ${short(item.wallet.address)}: submitted ${txUrl(hash)}`);
    await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
    info(`wallet #${item.wallet.index} ${short(item.wallet.address)}: confirmed`);
  }

  info("funding complete");
}

main().catch((err) => die(err.shortMessage ?? err.message ?? String(err)));
