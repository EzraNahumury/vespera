# Vespera E2E — Alfajores testnet verification

Functional, end-to-end proof that the Vespera protocol **and** the transaction automation
actually work — run entirely on **Celo Alfajores testnet** with throwaway, faucet-funded
wallets. **Never touches mainnet. No real funds. No production metrics.**

It runs one complete arisan lifecycle and asserts the payout happened:

```
create group → invite + join members → everyone deposits → one member requests withdrawal
→ agent initVote (fast-track 85%) → members castVote FOR → finalize → assert Executed + payout
```

## Files
- `frontend/scripts/vespera-e2e-testnet.mjs` — the driver (viem).
- `.github/workflows/vespera-e2e-testnet.yml` — CI: deploys a fresh instance to Alfajores, then runs the driver.

Both are isolated and testnet-only. The mainnet workflow (`vespera-transactions.yml`), the
contracts, and the app are not modified.

---

## A. Run it from GitHub Actions (recommended)

### One-time setup
1. Create a **brand-new** wallet (e.g. in MetaMask). This is a *testnet* wallet — never use a key that holds real assets.
2. Get free test CELO: https://faucet.celo.org (paste the address; ~1–2 CELO is plenty).
3. In the repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `ALFAJORES_FUNDER_KEY`
   - Value: that wallet's private key (`0x…`, 64 hex chars). **Testnet key only.**

### Run
- **Actions** tab → **Vespera E2E (Alfajores testnet)** → **Run workflow**.
- Optional inputs: `members` (5–15, default 5), `deposit_celo` (default `0.02`).
- Watch the logs. Last line `PASS — …` means the whole flow worked. Any failure prints `FAIL: <reason>`.
- The generated throwaway wallets are saved as the **`e2e-wallets`** artifact on the run.

---

## B. Run it locally

```bash
# from repo root
# 1. deploy a fresh instance to Alfajores (needs foundry + a faucet-funded key)
cd vespera-sc
PRIVATE_KEY=0x<your_testnet_key> \
  forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://alfajores-forno.celo-testnet.org --broadcast --skip-simulation -vvv
# note the printed GroupRegistry / VotingEngine / Treasury / AgentRegistry addresses

# 2. run the lifecycle
cd ../frontend
npm ci
ALFAJORES_FUNDER_KEY=0x<your_testnet_key> \
GROUP_REGISTRY_ADDRESS=0x... \
VOTING_ENGINE_ADDRESS=0x... \
TREASURY_ADDRESS=0x... \
AGENT_REGISTRY_ADDRESS=0x... \
MEMBERS=5 DEPOSIT_CELO=0.02 \
  node scripts/vespera-e2e-testnet.mjs
```

On Windows PowerShell, set each var with `$env:NAME="value"` on its own line, then run `node scripts/vespera-e2e-testnet.mjs`.

---

## Safety rails
- The driver calls `getChainId()` and **refuses to run unless connected to Alfajores (44787)**.
- The funder key must be a 32-byte hex testnet key; the script aborts otherwise.
- All member wallets are generated fresh per run and are disposable — the saved
  `e2e-wallets.json` holds testnet-only keys. Do not reuse them on mainnet.

## Tuning
| Env / input    | Default | Notes                                              |
|----------------|---------|----------------------------------------------------|
| `MEMBERS`      | 5       | Clamped to protocol bounds [5, 15].                |
| `DEPOSIT_CELO` | 0.02    | Per-round deposit. Pot = members × deposit.        |
| `FUND_CELO`    | 0.2     | Test CELO sent to each wallet (gas + deposit).     |
| `RPC_URL`      | Alfajores forno | Override the testnet RPC if needed.        |

Funder needs roughly `members × FUND_CELO` test CELO (e.g. 5 × 0.2 = 1 CELO) plus a little for deploy + agent gas.
