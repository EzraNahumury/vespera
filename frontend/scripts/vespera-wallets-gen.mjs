// Generator 100 wallet BARU khusus project Vespera (terpisah dari fleet lain).
// Output:
//   frontend/vespera-dau-wallets.json         → {wallets:[{index,address,privateKey}]}  (RAHASIA, gitignored)
//   frontend/vespera-dau-wallets.public.json  → [{index,address}]                        (aman di-commit/lihat)
//
// Untuk CI: isi file rahasia jadi GitHub secret VESPERA_DAU_WALLETS.
//
//   node scripts/vespera-wallets-gen.mjs              # default 100
//   WALLET_COUNT=50 node scripts/vespera-wallets-gen.mjs
//
// Idempotent: jika file rahasia sudah ada, TIDAK menimpa (hapus manual utk regen).
import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const SECRET_FILE = path.join(frontendDir, "vespera-dau-wallets.json");
const PUBLIC_FILE = path.join(frontendDir, "vespera-dau-wallets.public.json");
const COUNT = Math.max(1, Number(process.env.WALLET_COUNT ?? "100"));

function info(m) { console.log(`[vespera-wallets-gen] ${m}`); }

if (existsSync(SECRET_FILE)) {
  info(`SKIP — ${path.basename(SECRET_FILE)} sudah ada. Hapus manual untuk regenerasi (private key tidak ditimpa).`);
  process.exit(0);
}

const wallets = [];
for (let i = 0; i < COUNT; i++) {
  const privateKey = generatePrivateKey();
  const { address } = privateKeyToAccount(privateKey);
  wallets.push({ index: i + 1, address, privateKey });
}

writeFileSync(SECRET_FILE, JSON.stringify({ wallets }, null, 2), "utf8");
writeFileSync(
  PUBLIC_FILE,
  JSON.stringify(wallets.map(({ index, address }) => ({ index, address })), null, 2),
  "utf8",
);

info(`dibuat ${wallets.length} wallet BARU`);
info(`rahasia : ${SECRET_FILE}  (gitignored — jangan commit)`);
info(`publik  : ${PUBLIC_FILE}`);
info("");
info("Langkah berikutnya:");
info("  1. Set GitHub secret:  gh secret set VESPERA_DAU_WALLETS < frontend/vespera-dau-wallets.json -R EzraNahumury/vespera");
info("  2. Fund wallet (gas):  node scripts/vespera-dau-cron.mjs  (punya step prefund dari funder)");
