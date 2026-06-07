/**
 * Generate N wallets and split into batch JSON files.
 *
 * Usage:
 *   node scripts/generate-wallet-batches.mjs
 *
 * Env:
 *   WALLET_COUNT      - total wallets to generate (default 100)
 *   BATCH_SIZE        - wallets per batch file (default 20)
 *   OUT_DIR           - output directory (default frontend/wallets)
 *   FORMAT            - "file" = write .json files, "secret" = print GitHub secret commands (default "file")
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");

const WALLET_COUNT = Math.max(1, Number(process.env.WALLET_COUNT ?? "100"));
const BATCH_SIZE   = Math.max(1, Number(process.env.BATCH_SIZE   ?? "20"));
const OUT_DIR      = process.env.OUT_DIR ?? path.join(frontendDir, "wallets");
const FORMAT       = (process.env.FORMAT ?? "file").toLowerCase();

function info(msg) { console.log(`[generate-wallet-batches] ${msg}`); }

function generateWallets(count) {
  const wallets = [];
  for (let i = 0; i < count; i++) {
    const privateKey = generatePrivateKey();
    const account   = privateKeyToAccount(privateKey);
    wallets.push({ index: i + 1, address: account.address, privateKey });
  }
  return wallets;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function main() {
  info(`generating ${WALLET_COUNT} wallets in batches of ${BATCH_SIZE}`);

  const wallets = generateWallets(WALLET_COUNT);
  const batches  = chunk(wallets, BATCH_SIZE);

  if (FORMAT === "secret") {
    // Print GitHub CLI commands to set Actions secrets
    info("GitHub CLI secret commands (run these manually):\n");
    batches.forEach((batch, i) => {
      const batchNum  = String(i + 1).padStart(2, "0");
      const secretName = `VESPERA_WALLET_BATCH_${batchNum}_JSON`;
      const json       = JSON.stringify({ wallets: batch });
      // Print to stderr so stdout can be piped; private keys only shown here
      process.stderr.write(`\ngh secret set ${secretName} --body '${json}'\n`);
    });
    info(`\nADDRESSES (no private keys):`);
    wallets.forEach((w) => info(`  #${w.index}: ${w.address}`));
    return;
  }

  // Write to files
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const addressSummary = [];

  batches.forEach((batch, i) => {
    const batchNum  = String(i + 1).padStart(2, "0");
    const fileName  = `batch-${batchNum}.json`;
    const filePath  = path.join(OUT_DIR, fileName);

    if (existsSync(filePath)) {
      info(`SKIP ${fileName} — already exists (delete manually to regenerate)`);
      return;
    }

    // File with private keys — never commit this
    writeFileSync(filePath, JSON.stringify({ wallets: batch }, null, 2), "utf8");
    info(`wrote ${fileName} (${batch.length} wallets)`);

    batch.forEach((w) => addressSummary.push(`batch-${batchNum} #${w.index}: ${w.address}`));
  });

  // Write address-only summary (safe to commit)
  const summaryPath = path.join(OUT_DIR, "addresses.txt");
  writeFileSync(summaryPath, addressSummary.join("\n") + "\n", "utf8");
  info(`wrote addresses.txt (no private keys)`);

  info("\nDONE. Next steps:");
  info("  1. Add wallets/ to .gitignore (private keys!)");
  info("  2. Upload each batch-XX.json as GitHub Actions secret VESPERA_WALLET_BATCH_XX_JSON");
  info("  3. Delete local batch-XX.json files after uploading");
  info("  4. Run fund-wallet-batch workflow to top up each batch");
}

main();
