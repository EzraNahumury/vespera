import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, defineChain, fallback, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const CELO_MAINNET_ID = 42220;
const DEFAULT_LIMIT = 10;
const DEFAULT_MAX_LIMIT = 25;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const txScript = path.join(scriptDir, "vespera-tx.mjs");
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

function die(message) {
  console.error(`[vespera-wallet-batch] Error: ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`[vespera-wallet-batch] ${message}`);
}

function short(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function normalizePrivateKey(value, name) {
  let key = String(value ?? "").trim();
  const assignment = key.match(/^(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=\s*(.+)$/);
  if (assignment) key = assignment[1].trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  if (!key.startsWith("0x")) key = `0x${key}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
    die(`${name} must be a 32-byte hex private key, with or without 0x.`);
  }
  return key;
}

function batchLabelFromEnv() {
  return process.env.WALLET_BATCH?.trim() || process.env.WALLET_BATCH_FILE?.trim() || "secret";
}

function loadWalletBatchSource() {
  const rawJson = process.env.WALLET_BATCH_JSON ?? process.env.VESPERA_WALLET_BATCH_JSON;
  if (rawJson?.trim()) {
    return {
      source: `secret JSON (${batchLabelFromEnv()})`,
      wallets: parseWalletBatch(rawJson, "WALLET_BATCH_JSON"),
    };
  }

  const base64Json = process.env.WALLET_BATCH_JSON_BASE64 ?? process.env.VESPERA_WALLET_BATCH_JSON_BASE64;
  if (base64Json?.trim()) {
    let decoded;
    try {
      decoded = Buffer.from(base64Json.trim(), "base64").toString("utf8");
    } catch (err) {
      die(`failed to decode WALLET_BATCH_JSON_BASE64: ${err.message}`);
    }
    return {
      source: `base64 secret JSON (${batchLabelFromEnv()})`,
      wallets: parseWalletBatch(decoded, "WALLET_BATCH_JSON_BASE64"),
    };
  }

  const file = batchFileFromEnv();
  return {
    source: path.relative(frontendDir, file),
    wallets: loadWalletBatchFile(file),
  };
}

function batchFileFromEnv() {
  const explicit = process.env.WALLET_BATCH_FILE?.trim();
  if (explicit) return resolveWalletFile(explicit);

  const batch = process.env.WALLET_BATCH?.trim();
  if (!batch) die("WALLET_BATCH is required for batch mode.");
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

function parseWalletBatch(raw, source) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    die(`failed to parse ${source}: ${err.message}`);
  }

  if (!Array.isArray(parsed.wallets)) die("wallet batch JSON must contain a wallets array.");

  return parsed.wallets.map((wallet, position) => {
    if (!isAddress(wallet.address ?? "")) {
      die(`wallet at position ${position} has an invalid address.`);
    }
    const privateKey = normalizePrivateKey(
      wallet.privateKey,
      `wallet ${wallet.index ?? position + 1} privateKey`,
    );
    const account = privateKeyToAccount(privateKey);
    if (account.address.toLowerCase() !== wallet.address.toLowerCase()) {
      die(`wallet ${wallet.index ?? position + 1} privateKey does not match its address.`);
    }
    return {
      index: Number.isInteger(Number(wallet.index)) ? Number(wallet.index) : position + 1,
      address: wallet.address,
      privateKey,
    };
  });
}

function loadWalletBatchFile(file) {
  try {
    return parseWalletBatch(readFileSync(file, "utf8"), path.relative(frontendDir, file));
  } catch (err) {
    die(`failed to read ${path.relative(frontendDir, file)}: ${err.message}`);
  }
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

async function main() {
  await assertCeloMainnet();

  const { source, wallets } = loadWalletBatchSource();
  const selected = selectWallets(wallets);
  if (!selected.length) die("selected wallet slice is empty.");

  const continueOnError = readBool("CONTINUE_ON_ERROR", false);
  const action = process.env.ACTION ?? "auto";
  const dryRun = readBool("DRY_RUN", true);

  info(
    `${dryRun ? "dry-run" : "live"} ${action} for ${selected.length}/${wallets.length} wallet(s) from ${source}`,
  );
  info(`range: first=${selected[0].index}:${short(selected[0].address)} last=${selected[selected.length - 1].index}:${short(selected[selected.length - 1].address)}`);

  let failed = 0;
  for (const wallet of selected) {
    info(`wallet #${wallet.index} ${short(wallet.address)}: starting`);
    const result = spawnSync(process.execPath, [txScript], {
      cwd: frontendDir,
      stdio: "inherit",
      env: {
        ...process.env,
        PRIVATE_KEY: wallet.privateKey,
        SIGNER_ADDRESS: "",
      },
    });

    if (result.status !== 0) {
      failed += 1;
      info(`wallet #${wallet.index} ${short(wallet.address)}: failed with exit ${result.status}`);
      if (!continueOnError) process.exit(result.status ?? 1);
    } else {
      info(`wallet #${wallet.index} ${short(wallet.address)}: done`);
    }
  }

  if (failed) die(`${failed} wallet(s) failed.`);
  info("batch complete");
}

main().catch((err) => die(err.shortMessage ?? err.message ?? String(err)));
