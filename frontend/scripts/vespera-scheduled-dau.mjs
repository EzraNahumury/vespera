import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_BATCHES = ["01", "02", "03", "04", "05"];
const DEFAULT_START_DATE = "2026-06-08";
const DEFAULT_END_DATE = "2026-06-22";
const DEFAULT_SLOT_MINUTES = 15;
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const walletBatchScript = path.join(scriptDir, "vespera-wallet-batch.mjs");
const fundBatchScript = path.join(scriptDir, "vespera-fund-batch.mjs");

function die(message) {
  console.error(`[vespera-scheduled-dau] Error: ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`[vespera-scheduled-dau] ${message}`);
}

function readBool(name, fallbackValue) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallbackValue;
  return ["1", "true", "yes", "y", "on"].includes(raw.toLowerCase());
}

function readInt(name, fallbackValue, { min = 1 } = {}) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallbackValue;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min) die(`${name} must be an integer >= ${min}.`);
  return n;
}

function parseDateOnly(value, name) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) die(`${name} must use YYYY-MM-DD.`);
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day, ordinal: Date.UTC(year, month - 1, day) / 86_400_000 };
}

function jakartaNow() {
  const now = process.env.DAU_NOW ? new Date(process.env.DAU_NOW) : new Date();
  if (Number.isNaN(now.getTime())) die("DAU_NOW must be a valid date/time when set.");
  const shifted = new Date(now.getTime() + JAKARTA_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

function dateKey(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function dateOrdinal(parts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day) / 86_400_000;
}

function parseBatches() {
  const raw = process.env.DAU_BATCHES ?? DEFAULT_BATCHES.join(",");
  const batches = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => String(Number(s.replace(/^batch-/, "").replace(/\.json$/, ""))).padStart(2, "0"));
  if (!batches.length) die("DAU_BATCHES cannot be empty.");
  for (const batch of batches) {
    if (!/^\d{2}$/.test(batch)) die(`invalid DAU_BATCHES entry "${batch}".`);
  }
  return [...new Set(batches)];
}

function hash32(input) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let state = hash32(seed) || 1;
  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 0x100000000;
  };
}

function shuffled(values, seed) {
  const out = [...values];
  const rand = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function batchForDay(dayIndex, batches) {
  if (dayIndex === 0) return batches[0];

  const seed = process.env.DAU_RANDOM_SEED ?? "vespera-mainnet-dau";
  let previous = batches[0];
  let cursor = 1;
  let cycle = 0;

  while (true) {
    const order = shuffled(batches, `${seed}:${cycle}`);
    if (order.length > 1 && order[0] === previous) {
      [order[0], order[1]] = [order[1], order[0]];
    }

    if (dayIndex < cursor + order.length) return order[dayIndex - cursor];
    previous = order[order.length - 1];
    cursor += order.length;
    cycle += 1;
  }
}

function secretForBatch(batch) {
  const names = [
    `WALLET_BATCH_${batch}_JSON`,
    `VESPERA_WALLET_BATCH_${batch}_JSON`,
    `WALLET_BATCH_${Number(batch)}_JSON`,
    `VESPERA_WALLET_BATCH_${Number(batch)}_JSON`,
  ];
  for (const name of names) {
    const value = process.env[name];
    if (value?.trim()) return { name, value };
  }
  die(`missing wallet JSON secret env for batch ${batch}. Expected WALLET_BATCH_${batch}_JSON from the workflow.`);
}

function parseWalletCount(raw, batch) {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.wallets)) die(`wallet batch ${batch} JSON must contain a wallets array.`);
    return parsed.wallets.length;
  } catch (err) {
    die(`failed to parse wallet JSON for batch ${batch}: ${err.message}`);
  }
}

function slotRange(walletCount, slotIndex, slotsPerDay) {
  const start = Math.floor((walletCount * slotIndex) / slotsPerDay);
  const end = Math.floor((walletCount * (slotIndex + 1)) / slotsPerDay);
  return { offset: start, limit: end - start };
}

async function main() {
  const dryRun = readBool("DRY_RUN", true);
  const confirmMainnet = readBool("CONFIRM_MAINNET", false);
  if (!dryRun && !confirmMainnet) {
    die("live scheduled mainnet runs require CONFIRM_MAINNET=1.");
  }

  const start = parseDateOnly(process.env.DAU_START_DATE ?? DEFAULT_START_DATE, "DAU_START_DATE");
  const end = parseDateOnly(process.env.DAU_END_DATE ?? DEFAULT_END_DATE, "DAU_END_DATE");
  if (end.ordinal < start.ordinal) die("DAU_END_DATE must be on or after DAU_START_DATE.");

  const now = jakartaNow();
  const todayOrdinal = dateOrdinal(now);
  const today = dateKey(now);
  if (todayOrdinal < start.ordinal) {
    info(`skip ${today}: before DAU_START_DATE ${process.env.DAU_START_DATE ?? DEFAULT_START_DATE}`);
    return;
  }
  if (todayOrdinal > end.ordinal) {
    info(`skip ${today}: after DAU_END_DATE ${process.env.DAU_END_DATE ?? DEFAULT_END_DATE}`);
    return;
  }

  const slotMinutes = readInt("DAU_SLOT_MINUTES", DEFAULT_SLOT_MINUTES, { min: 1 });
  if (1440 % slotMinutes !== 0) die("DAU_SLOT_MINUTES must divide 1440 evenly.");
  const slotsPerDay = 1440 / slotMinutes;
  const minuteOfDay = now.hour * 60 + now.minute;
  const slotIndex = Math.floor(minuteOfDay / slotMinutes);

  const batches = parseBatches();
  const dayIndex = todayOrdinal - start.ordinal;

  info(
    `${dryRun ? "dry-run" : "live"} scheduled DAU ${today} Asia/Jakarta day=${dayIndex} slot=${slotIndex + 1}/${slotsPerDay} batches=${batches.join(",")}`,
  );

  let anyRan = false;
  let failed = 0;

  for (const batch of batches) {
    const secret = secretForBatch(batch);
    const walletCount = parseWalletCount(secret.value, batch);
    const { offset, limit } = slotRange(walletCount, slotIndex, slotsPerDay);

    if (limit <= 0) {
      info(`batch=${batch} slot=${slotIndex + 1}: no wallets this slot, skip`);
      continue;
    }

    info(`batch=${batch} offset=${offset} limit=${limit}: starting`);
    anyRan = true;

    const preFund = readBool("DAU_PREFUND", true);
    const hasFunderKey = Boolean(
      process.env.FUNDER_PRIVATE_KEY || process.env.VESPERA_FUNDER_PRIVATE_KEY,
    );
    if (preFund && hasFunderKey) {
      info(`batch=${batch} offset=${offset} limit=${limit}: pre-funding`);
      const fundResult = spawnSync(process.execPath, [fundBatchScript], {
        cwd: frontendDir,
        stdio: "inherit",
        env: {
          ...process.env,
          WALLET_BATCH: batch,
          WALLET_BATCH_JSON: secret.value,
          WALLET_OFFSET: String(offset),
          WALLET_LIMIT: String(limit),
          MAX_WALLETS_PER_RUN: process.env.MAX_WALLETS_PER_RUN ?? "100",
        },
      });

      if (fundResult.status !== 0) {
        failed += 1;
        info(`batch=${batch}: pre-fund failed with exit ${fundResult.status}`);
        if (!readBool("CONTINUE_ON_ERROR", true)) process.exit(fundResult.status ?? 1);
        continue;
      }
    } else if (preFund) {
      info(`batch=${batch}: pre-fund skipped (VESPERA_FUNDER_PRIVATE_KEY/FUNDER_PRIVATE_KEY is not set)`);
    }

    const result = spawnSync(process.execPath, [walletBatchScript], {
      cwd: frontendDir,
      stdio: "inherit",
      env: {
        ...process.env,
        WALLET_BATCH: batch,
        WALLET_BATCH_JSON: secret.value,
        WALLET_OFFSET: String(offset),
        WALLET_LIMIT: String(limit),
        CONTINUE_ON_ERROR: process.env.CONTINUE_ON_ERROR ?? "1",
        MAX_WALLETS_PER_RUN: process.env.MAX_WALLETS_PER_RUN ?? "100",
      },
    });

    if (result.status !== 0) {
      failed += 1;
      info(`batch=${batch}: failed with exit ${result.status}`);
      if (!readBool("CONTINUE_ON_ERROR", true)) process.exit(result.status ?? 1);
    } else {
      info(`batch=${batch}: done`);
    }
  }

  if (!anyRan) info("slot has no wallets across all batches; nothing to run");
  if (failed > 0) process.exit(1);
}

main().catch((err) => die(err.shortMessage ?? err.message ?? String(err)));
