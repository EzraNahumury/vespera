// Engine DAU + tx Vespera (cron) — BENAR & ANDAL untuk SC baru (model kredit).
// ===========================================================================
// Aksi inti tiap wallet aktif = Treasury.deposit{value} (beli kredit). Ini:
//   - interaksi NYATA ke Treasury (0xe0F5…) → muncul di kontrak + sebagai DAU/tx,
//   - TIDAK butuh keanggotaan group / join-window (yang rapuh),
//   - murah (cuma gas; value jadi creditBalance yang RECOVERABLE via Treasury.withdraw).
//
// Pola "organik" agar natural & 24 run/hari tidak bentrok (deterministik per
// (tanggal, jam), tanpa state file):
//   - Cohort harian: DAU_TARGET wallet unik aktif/hari (dipilih per tanggal, berotasi).
//   - Circadian: tiap wallet cohort dapat "jam utama" berbobot → hanya tx di jamnya.
//   - Tiap wallet aktif: TX_MIN..TX_MAX kali Treasury.deposit.
//
// Wallet: dari env VESPERA_DAU_WALLETS (JSON {wallets:[...]}) di CI, atau file
// vespera-dau-wallets.json lokal. Prefund gas dari funder (opsional, jika key diset).
//
//   node scripts/vespera-dau-cron.mjs
//   DRY_RUN=1 node scripts/vespera-dau-cron.mjs        # simulasi, tanpa kirim tx
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient, createWalletClient, http, fallback,
  parseEther, formatEther,
} from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ── Konfigurasi ────────────────────────────────────────────────────────────
const DRY = ["1", "true", "yes"].includes((process.env.DRY_RUN ?? "").toLowerCase());
const num = (v, d) => (v === undefined || v === "" ? d : Number(v));
const TREASURY = (process.env.TREASURY_ADDRESS ?? process.env.NEXT_PUBLIC_TREASURY ??
  "0xe0F543010FbAc613a6550E19Da6a680173Cf9009");
const DAU_TARGET = num(process.env.DAU_TARGET, 20);   // wallet unik aktif/hari
const TX_MIN = num(process.env.TX_MIN, 4);
const TX_MAX = num(process.env.TX_MAX, 10);
const BUY_VALUE = parseEther(process.env.BUY_VALUE_CELO ?? "0.0002"); // CELO → kredit per tx
const MIN_GAS_RESERVE = parseEther(process.env.MIN_GAS_RESERVE ?? "0.01");
const CONCURRENCY = num(process.env.CONCURRENCY, 6);
// Prefund (opsional): funder top-up wallet aktif yang saldonya di bawah MIN ke TARGET.
const FUNDER_KEY = (process.env.FUNDER_PRIVATE_KEY ?? "").trim();
const PREFUND_MIN = parseEther(process.env.PREFUND_MIN_CELO ?? "0.02");
const PREFUND_TARGET = parseEther(process.env.PREFUND_TARGET_CELO ?? "0.04");

const RPCS = (process.env.RPC_URL ? [process.env.RPC_URL] : [
  "https://forno.celo.org", "https://rpc.ankr.com/celo",
]);
const transport = fallback(RPCS.map((u) => http(u)));
const pc = createPublicClient({ chain: celo, transport });

const TREASURY_ABI = [
  { type: "function", name: "deposit", inputs: [], outputs: [], stateMutability: "payable" },
  { type: "function", name: "creditBalance", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
];

function log(m) { console.log(`[vespera-dau] ${m}`); }
const short = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;

// ── Muat wallet ─────────────────────────────────────────────────────────────
function loadWallets() {
  const raw = process.env.VESPERA_DAU_WALLETS?.trim();
  let json;
  if (raw) {
    json = JSON.parse(raw);
  } else {
    const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "vespera-dau-wallets.json");
    json = JSON.parse(readFileSync(file, "utf8"));
  }
  const list = Array.isArray(json) ? json : json.wallets;
  if (!Array.isArray(list) || !list.length) throw new Error("VESPERA_DAU_WALLETS / file kosong atau tidak valid.");
  return list.map((w, i) => {
    const account = privateKeyToAccount(w.privateKey);
    if (account.address.toLowerCase() !== (w.address ?? account.address).toLowerCase())
      throw new Error(`wallet #${w.index ?? i}: privateKey tidak cocok dengan address`);
    return { index: w.index ?? i + 1, address: account.address, privateKey: w.privateKey };
  });
}

// ── PRNG deterministik + circadian (port dari engine organik) ───────────────
const CIRCADIAN = [
  0.80, 0.70, 0.50, 0.35, 0.25, 0.20, 0.20, 0.15, 0.15, 0.20, 0.30, 0.50,
  0.70, 0.85, 1.00, 0.95, 0.85, 0.75, 0.70, 0.60, 0.55, 0.60, 0.70, 0.80,
];
function seedFrom(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return (h ^= h >>> 16) >>> 0;
}
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffled(arr, rng) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pickHour(rng) { const total = CIRCADIAN.reduce((s, w) => s + w, 0); let r = rng() * total; for (let h = 0; h < 24; h++) { r -= CIRCADIAN[h]; if (r <= 0) return h; } return 23; }

// ── Pool konkurensi sederhana ───────────────────────────────────────────────
async function pool(items, limit, worker) {
  const results = []; let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; try { results[idx] = { ok: true, v: await worker(items[idx], idx) }; } catch (e) { results[idx] = { ok: false, e }; } }
  });
  await Promise.all(runners);
  return results;
}

async function sendTx(wc, params) {
  let gas;
  try { gas = (await pc.estimateContractGas({ ...params, account: wc.account.address })) * 120n / 100n; } catch { gas = 200000n; }
  let hash;
  for (let a = 1; a <= 3; a++) {
    try { hash = await wc.writeContract({ ...params, gas }); break; }
    catch (e) { if (a === 3) throw e; await new Promise((r) => setTimeout(r, 2500)); }
  }
  await pc.waitForTransactionReceipt({ hash, confirmations: 1 });
  return hash;
}

// ── Main ────────────────────────────────────────────────────────────────────
const now = new Date();
const dateKey = now.toISOString().slice(0, 10);
const hourNow = now.getUTCHours();
const rng = mulberry32(seedFrom(dateKey));

const all = loadWallets();
const dauTarget = Math.min(DAU_TARGET, all.length);
const cohort = shuffled(all, rng).slice(0, dauTarget);
const active = cohort.map((w) => ({ w, hour: pickHour(rng) })).filter((a) => a.hour === hourNow).map((a) => a.w);

log(`${dateKey} ${String(hourNow).padStart(2, "0")}:00 UTC · cohort ${dauTarget} (DAU) · aktif jam ini ${active.length} wallet${DRY ? " · DRY" : ""} · Treasury ${short(TREASURY)}`);
if (active.length === 0) { log("Jam sepi untuk cohort — tidak ada aksi."); process.exit(0); }

// Prefund opsional dari funder
if (FUNDER_KEY && !DRY) {
  const funder = privateKeyToAccount(FUNDER_KEY.startsWith("0x") ? FUNDER_KEY : "0x" + FUNDER_KEY);
  const fwc = createWalletClient({ account: funder, chain: celo, transport });
  let funded = 0;
  for (const w of active) {
    const bal = await pc.getBalance({ address: w.address });
    if (bal < PREFUND_MIN) {
      const topUp = PREFUND_TARGET - bal;
      const fbal = await pc.getBalance({ address: funder.address });
      if (fbal < topUp + parseEther("0.005")) { log(`funder ${short(funder.address)} menipis — prefund dihentikan`); break; }
      try { const h = await fwc.sendTransaction({ to: w.address, value: topUp }); await pc.waitForTransactionReceipt({ hash: h, confirmations: 1 }); funded++; }
      catch (e) { log(`prefund #${w.index} gagal: ${e.shortMessage ?? e.message}`); }
    }
  }
  if (funded) log(`prefund: ${funded} wallet di-top-up dari funder`);
} else if (!FUNDER_KEY) {
  log("prefund dilewati (FUNDER_PRIVATE_KEY tidak diset) — wallet pakai saldo yang ada");
}

const stat = { wallets: 0, tx: 0, skipped: 0, errors: 0 };
const gasPrice = await pc.getGasPrice();
const gasPerTx = 90000n * gasPrice;

const results = await pool(active, CONCURRENCY, async (w) => {
  const account = privateKeyToAccount(w.privateKey);
  const wc = createWalletClient({ account, chain: celo, transport });
  const txCount = TX_MIN + Math.floor(Math.random() * (TX_MAX - TX_MIN + 1));
  let done = 0;
  for (let t = 0; t < txCount; t++) {
    const bal = await pc.getBalance({ address: w.address });
    if (bal < MIN_GAS_RESERVE + gasPerTx + BUY_VALUE) { stat.skipped++; break; }
    if (DRY) { stat.tx++; done++; continue; }
    await sendTx(wc, { address: TREASURY, abi: TREASURY_ABI, functionName: "deposit", value: BUY_VALUE });
    stat.tx++; done++;
  }
  if (done > 0) { stat.wallets++; log(`#${w.index} ${short(w.address)} → ${done}/${txCount} tx beli-kredit`); }
});

results.forEach((r, i) => { if (!r.ok) { stat.errors++; log(`#${active[i].index} ${short(active[i].address)} ERROR: ${r.e?.shortMessage ?? r.e?.message}`); } });

log(`selesai · wallet_aktif=${stat.wallets} (DAU) · tx=${stat.tx} · skipped=${stat.skipped} · errors=${stat.errors}`);
if (stat.wallets === 0 && stat.errors > 0) process.exit(1);
