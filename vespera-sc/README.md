# Vespera — Smart Contracts

On-chain layer for **Vespera**, an AI-governed rotating savings (Arisan) protocol on Celo.
Foundry project implementing the 7 contracts specified in the root project README.

## Deployed — Celo Mainnet (chainId 42220)

| Contract | Address |
|----------|---------|
| **GroupRegistry** (entry point) | [`0x493613949d63b63b02A58Ee899e9c6cd647Ae86b`](https://celoscan.io/address/0x493613949d63b63b02A58Ee899e9c6cd647Ae86b) |
| AgentRegistry | [`0x67aF4795C9C76677F252d1b60DA7b240DB3A7A10`](https://celoscan.io/address/0x67aF4795C9C76677F252d1b60DA7b240DB3A7A10) |
| BadgeNFT | [`0x4d5AcB5cDE12C0657C0D8aA4c3C8004196dB8410`](https://celoscan.io/address/0x4d5AcB5cDE12C0657C0D8aA4c3C8004196dB8410) |
| ReputationRegistry | [`0xd6EE8f307B9564A6E0EA8Aa91b5A74Cb40a3F521`](https://celoscan.io/address/0xd6EE8f307B9564A6E0EA8Aa91b5A74Cb40a3F521) |
| Treasury | [`0x4D84DD953FCdecfD54eA50e4ce6Ea809D9f9DAbd`](https://celoscan.io/address/0x4D84DD953FCdecfD54eA50e4ce6Ea809D9f9DAbd) |
| VotingEngine | [`0xCa8C94Fb21C5d6b8f786e6d549dAb2a8Fe2f07f6`](https://celoscan.io/address/0xCa8C94Fb21C5d6b8f786e6d549dAb2a8Fe2f07f6) |

- **Allowed deposit token:** CELO (`0x471EcE3750Da237f93B8E339c536989b8978a438`)
- **Admin / Agent (`AGENT_ROLE`):** `0x5Aea061d814A72de9EE9171bE86F45f48e1E2f5d`
- **Deploy cost:** ~1.49 CELO · machine-readable addresses in [`deployments/celo-mainnet.json`](deployments/celo-mainnet.json)

## Contracts

| Contract | Responsibility |
|----------|----------------|
| `AgentRegistry` | Binds a user wallet to its AI agent config (delegated key + persona policy URI). |
| `GroupRegistry` | Factory + directory. Deploys `ArisanGroup`s and whitelists them for the shared contracts. |
| `BadgeNFT` | Soulbound (non-transferable) ERC-721 reputation attestations. |
| `ReputationRegistry` | Per-account score (0–1000) from on-chain counters; auto-mints badges. |
| `VotingEngine` | AI-confidence-routed, reputation-weighted withdrawal voting. |
| `Treasury` | Multi-token escrow (USDm/USDC/USDT + CELO) released only by the `VotingEngine`. |
| `ArisanGroup` | Per-group core: invite-gated members, deposit rounds, withdrawal requests, payout + rotation. |

Shared interfaces live in `src/interfaces/`; enums, constants and the README's tunables in
`src/libraries/VesperaTypes.sol`.

## Membership (invite by wallet address)

Groups are private trust circles. The creator invites participants **by wallet address**
(`invite(address)` / `inviteBatch(address[])`); each invitee accepts by calling `join()`. There are
no named accounts — everything is keyed on the Celo wallet address.

## Lifecycle (step by step)

1. **Allow tokens** — admin allow-lists deposit tokens (CELO auto-detected per chain; stablecoins optional).
2. **Create group** — creator picks one token, fixed deposit amount, member cap (5–15) and round duration.
3. **Invite & join** — creator invites wallet addresses; each invitee accepts with `join()`.
4. **Deposit** — each round, members approve the Treasury and deposit the fixed amount into escrow.
5. **Request** — a member requests a withdrawal (amount + reason); rotation blocks anyone who already received in the current cycle.
6. **AI routing** — the off-chain agent scores confidence; `initVote` auto-rejects `<50%`, else opens a normal (60% quorum / 24h) or fast-track (≥85% → 30% / 12h) vote.
7. **Vote** — members cast reputation-weighted votes; the requester is excluded.
8. **Finalize** — once quorum is reached or the window closes, `finalize` pays the requester from escrow (if it passed) and advances the round.

Reputation (0–1000) and soulbound badges update automatically across all of the above.

## End-to-end flow

```
ArisanGroup.requestWithdrawal(amount, reasonURI)   // member, status=Pending
      ↓ (emits WithdrawalRequested)
off-chain Requester Agent computes confidence (0..10000)
      ↓
VotingEngine.initVote(group, requestId, confidenceBps)   // AGENT_ROLE only
      • <50%      → auto-reject
      • 50–84%    → normal vote   (60% quorum, 24h)
      • ≥85%      → fast-track     (30% quorum, 12h)
      ↓ (status=Voting)
VotingEngine.castVote(group, requestId, support)   // members, reputation-weighted, requester excluded
      ↓
VotingEngine.finalize(group, requestId)            // permissionless once settle-able
      ↓ if passed
Treasury.release(...) → tokens to requester; ArisanGroup advances round + rotation
```

## Key design decisions (resolving spec gaps)

These choices were made where the prose spec was ambiguous — see code NatSpec for detail:

1. **Invite-by-address membership.** Private group: only creator-invited wallets can `join()`.
2. **One deposit token per group**, fixed at creation and required to be Treasury-allowed. Accepted
   currencies: USDm/USDC/USDT and **CELO**. CELO is supported via its canonical ERC-20 adapter
   (`0x471EcE3750Da237f93B8E339c536989b8978a438` on mainnet) — native and ERC-20 balances are
   unified on Celo, so it flows through the same `approve` + `transferFrom` path as any token; no
   separate `payable`/`msg.value` code is needed. Avoids mixed-denomination pots.
3. **`SafeERC20`** for every token move — USDT returns no bool. Treasury also credits the *actually
   received* amount (fee-on-transfer safe) and uses CEI + a reentrancy guard.
4. **`initVote` is `AGENT_ROLE`-gated.** The off-chain agent's confidence is a trusted oracle input;
   access control is explicit and documented.
5. **Requester is excluded** from the eligible weight and cannot vote on their own request.
6. **Voter weight = reputation + 1** so fresh members still contribute to quorum.
7. **Badge minting** is on-chain: `ReputationRegistry` mints reputation badges on threshold crossings;
   `ArisanGroup` mints the Founder badge when a group reaches 5 members.
8. **Group authorization** flows through `GroupRegistry.isRegisteredGroup` — the factory is the single
   source of truth the shared contracts trust.

### Reputation score (0–1000)

Weighted exactly per the root README (40/20/15/10/10/5):

| Factor | Weight | Source |
|--------|--------|--------|
| Deposit consistency | 40% | on-time / total deposits |
| Voting participation | 20% | votes cast / eligible |
| Vote quality | 15% | votes agreeing with outcome / cast |
| Group tenure | 10% | time since first join (capped at 1 yr) |
| Badge count | 10% | `BadgeNFT.balanceOf` (5 badges = full) |
| Penalty (inverse) | 5% | full marks at zero penalties |

Tiers: Bronze 0–250 · Silver 251–500 · Gold 501–750 · Platinum 751–1000.

## Build & test

```bash
forge build
forge test            # 25 tests: full flow, invite gating, routing, rotation, access control, SafeERC20/USDT, CELO
forge test -vvv       # with traces
```

## Deploy

Config via `.env` (gitignored — copy from `.env.example`):

```
PRIVATE_KEY=0x...        # deployer = admin/owner of all contracts (0x prefix optional)
AGENT_ADDRESS=           # optional, granted AGENT_ROLE (default: deployer)
USDM_ADDRESS=            # optional stablecoins to allow
USDC_ADDRESS=
USDT_ADDRESS=
# CELO is auto-allowed by chain id (mainnet 42220 / Alfajores 44787) — no need to set it.
```

```bash
# 1. simulate (no transactions sent, free)
forge script script/Deploy.s.sol:Deploy --rpc-url https://forno.celo.org
# 2. broadcast for real
forge script script/Deploy.s.sol:Deploy --rpc-url https://forno.celo.org --broadcast
```

The script deploys all contracts in dependency order, wires the shared references, grants
`MINTER_ROLE`/`AGENT_ROLE`, and allow-lists tokens (CELO auto-detected per chain). Use the
Alfajores RPC `https://alfajores-forno.celo-testnet.org` for testnet.

## Notes / trust assumptions

- `block.timestamp` is used for round/vote deadlines (validator-manipulable by a few seconds —
  immaterial to 12h/24h windows).
- AI confidence (`initVote`) is an off-chain trusted input gated by `AGENT_ROLE`. Rotating/limiting
  that key is an operational concern.
- Reputation factors that need off-chain judgement (vote "agreement") are derived from on-chain vote
  outcomes, not free-form AI scores.
- The deployer holds admin/owner over every contract. For production, transfer ownership /
  `DEFAULT_ADMIN_ROLE` to a secure wallet and grant `AGENT_ROLE` to a dedicated agent key (revoking
  it from the deployer).
