# Vespera

**Vespera** is a decentralized, AI-governed rotating savings protocol built natively on the **Celo** blockchain. It reimagines Indonesia's centuries-old *Arisan* tradition — a rotating savings group — as a transparent, trustless, on-chain coordination system powered by multi-agent LLM reasoning.

> *"Vespera"* — from Latin, meaning *evening star* — a symbol of community gathering, trust, and light in the dark.

---

## The Problem

Traditional Arisan groups suffer from three core issues:

1. **Trust** — "Whose turn is it really?" is decided by whoever shouts loudest
2. **Transparency** — funds are held by one person, with no audit trail
3. **Fairness** — withdrawal priority is subjective and prone to favoritism

Vespera solves all three with on-chain evidence, AI validation, and reputation-weighted governance.

---

## How It Works

A group of 5–15 members each deposits a fixed amount per round. One member per round receives the full pot — but only if:

1. An **AI Requester Agent** pre-validates the request (deposit history, reputation, reason plausibility)
2. **AI Reviewer Agents** (one per member) independently reason and vote on-chain
3. The **VotingEngine** tallies reputation-weighted votes and routes to fast-track or normal quorum

Everything — reasoning, votes, payouts — is immutable and auditable on Celo.

---

## Architecture Overview

```
vespera/
├── contracts/          # Solidity smart contracts (Hardhat + Foundry)
│   ├── AgentRegistry.sol
│   ├── GroupRegistry.sol
│   ├── BadgeNFT.sol
│   ├── ReputationRegistry.sol
│   ├── VotingEngine.sol
│   ├── Treasury.sol
│   └── ArisanGroup.sol
├── frontend/           # Next.js 15 — responsive web + mobile UI
│   ├── app/
│   │   ├── api/        # Route handlers (AI agents + chain interactions)
│   │   └── (app)/      # Authenticated dashboard pages
│   ├── components/
│   │   ├── web/        # Desktop-optimized components
│   │   └── mobile/     # Mobile-optimized components
│   └── lib/
│       ├── ai/         # LLM client, prompts, output schemas
│       └── chain/      # Viem/Wagmi wrappers, contract ABIs
├── scripts/            # Deploy, setup, test scripts
└── docs/               # Architecture diagrams, contract specs
```

---

## Tech Stack

### Blockchain
| Component | Technology |
|-----------|------------|
| Chain | **Celo** (EVM-compatible L1) |
| Language | **Solidity** ^0.8.20 |
| Framework | **Hardhat** + **Foundry** |
| Tokens | **CELO** (native/gas) + **USDm**, **USDC**, **USDT** (stablecoin deposits) |
| Standards | **ERC-20** (USDm/USDC/USDT deposits), ERC-721 (BadgeNFT soulbound), ERC-1155 optional |

#### Supported Tokens
| Token | Name | Standard | Role |
|-------|------|----------|------|
| **USDm** | Mento Dollar | ERC-20 | Stablecoin deposit |
| **USDC** | USD Coin | ERC-20 | Stablecoin deposit |
| **USDT** | Tether USD | ERC-20 | Stablecoin deposit |
| **CELO** | Celo Native Token | Native (ERC-20-compatible) | Gas / native |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | **Next.js 15** (App Router) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** |
| Animations | **GSAP** + **Lenis** |
| Web3 SDK | **Viem** + **Wagmi** + **RainbowKit** |
| Wallet | MetaMask, Valora, Coinbase Wallet |
| Deployment | **Vercel** |

### AI Layer
| Component | Technology |
|-----------|------------|
| LLM | **Claude** (claude-sonnet-4-6) via Anthropic SDK |
| Architecture | Multi-agent (Requester + Reviewer Agents) |
| Transport | Next.js API Route Handlers (server-side) |
| Reasoning log | **IPFS** via web3.storage |

---

## Smart Contracts

### 1. `AgentRegistry`
Binds user wallet addresses to their AI agent configuration and voting persona policies.

### 2. `GroupRegistry`
Factory contract for creating and indexing all Arisan groups. Acts as a global directory.

### 3. `BadgeNFT` (ERC-721 Soulbound)
Non-transferable attestation NFTs minted automatically when reputation thresholds are hit:
- **Consistent Payer** — 12+ on-time deposits
- **Trusted Member** — ≥80% vote agreement rate
- **Group Founder** — founded a group with ≥5 active members
- **Dispute-Free** — 6 months without a challenge
- **Cross-Group Veteran** — active in 3+ groups simultaneously

### 4. `ReputationRegistry`
Per-account reputation scores (0–1000) across all groups. Score breakdown:
| Factor | Weight |
|--------|--------|
| Deposit consistency | 40% |
| Voting participation | 20% |
| Vote quality (agreement) | 15% |
| Group tenure | 10% |
| Badge count | 10% |
| Cross-group penalties | 5% |

Tiers: **Bronze** (0–250) → **Silver** (251–500) → **Gold** (501–750) → **Platinum** (751–1000)

### 5. `VotingEngine`
Withdrawal voting with reputation-weighted tally. Confidence-based routing:
| Confidence | Route | Quorum | Window |
|------------|-------|--------|--------|
| ≥85% | Fast-track | 30% | 12 hours |
| 50–84% | Normal vote | 60% | 24 hours |
| <50% | Auto-reject | — | — |

### 6. `Treasury`
Multi-token escrow contract holding deposits in **USDm**, **USDC**, or **USDT**. Funds can only be released by `VotingEngine` after quorum is met. Implements CEI (Checks-Effects-Interactions) pattern to prevent reentrancy.

### 7. `ArisanGroup`
Core per-group contract. Manages members, deposit rounds, withdrawal requests, and payout execution. Wired to all other contracts.

---

## AI Agent Flow

### Withdrawal Request (end-to-end)

```
User submits request (amount + reason)
        ↓
ArisanGroup.requestWithdrawal() — emits WithdrawalRequested
        ↓
Requester Agent (server-side, <10s)
  • Checks deposit consistency
  • Looks up reputation score
  • Scores reason plausibility (LLM)
  • Returns confidence score (0–1) + reasoning
        ↓
Confidence routing (VotingEngine.initVote())
        ↓
Reviewer Agents (one per member, parallel)
  • Each agent reads group history + member policy
  • Independently reasons about the request
  • Casts on-chain vote (weighted by reputation)
        ↓
VotingEngine.finalize() — after deadline or quorum
        ↓
Treasury.release() → stablecoin (USDm / USDC / USDT) transferred to requester
```

---

## Frontend: Web + Mobile

Vespera ships a single Next.js app that adapts to both desktop and mobile:

- **Web view** — full dashboard with group analytics, voting timeline, reputation graph
- **Mobile view** — bottom-nav layout optimized for one-handed use, Valora wallet deeplinks

Key pages:
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/app/dashboard` | Group overview + active rounds |
| `/app/groups/[id]` | Group detail: members, deposits, history |
| `/app/withdraw` | Submit + track withdrawal requests |
| `/app/reputation` | Personal reputation + badge showcase |
| `/app/vote/[id]` | Active vote detail + AI reasoning display |

---

## Celo-Specific Features

- **Gas payable in stablecoins** — fee abstraction lets members pay gas in USDm / USDC / USDT instead of holding CELO
- **Phone number mapping** — Celo's SocialConnect protocol for wallet discovery by phone
- **Valora wallet support** — deeplinks for mobile-native payment UX
- **Low fees** — sub-$0.01 transactions, viable for small recurring deposits

---

## Getting Started

### Prerequisites
- Node.js 20+
- Git

### Install
```bash
git clone https://github.com/<your-org>/vespera
cd vespera
```

### Smart Contracts
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network celo-alfajores
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in contract addresses and API keys
npm run dev
```

---

## Environment Variables

```env
# Celo
NEXT_PUBLIC_CELO_RPC=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CHAIN_ID=44787

# Contract Addresses (filled after deploy)
NEXT_PUBLIC_AGENT_REGISTRY=
NEXT_PUBLIC_GROUP_REGISTRY=
NEXT_PUBLIC_BADGE_NFT=
NEXT_PUBLIC_REPUTATION_REGISTRY=
NEXT_PUBLIC_VOTING_ENGINE=
NEXT_PUBLIC_TREASURY=

# AI
ANTHROPIC_API_KEY=

# IPFS
WEB3_STORAGE_TOKEN=
```

---

## Deployment Targets

| Environment | Network | RPC |
|-------------|---------|-----|
| Local dev | Hardhat node | http://localhost:8545 |
| Testnet | Celo Alfajores | https://alfajores-forno.celo-testnet.org |
| Mainnet | Celo Mainnet | https://forno.celo.org |

---

## Roadmap

- [x] Architecture design
- [x] README
- [ ] Smart contract implementation (7 contracts)
- [ ] Hardhat deploy scripts
- [ ] Frontend scaffold (Next.js + Wagmi)
- [ ] AI agent integration (Claude API)
- [ ] Web UI — dashboard, groups, voting
- [ ] Mobile UI — responsive layout + Valora support
- [ ] Testnet deployment (Alfajores)
- [ ] End-to-end testing
- [ ] Mainnet deployment

---

## License

MIT

---

*Vespera — trustless arisan for everyone.*
