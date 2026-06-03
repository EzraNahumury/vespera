---
name: project-vespera
description: Vespera — AI-governed arisan protocol on Celo. User is the FE dev; SC dibuat oleh teman. Jangan push FE ke GitHub kecuali diminta.
metadata:
  type: project
---

Vespera adalah decentralized arisan (rotating savings) protocol di Celo. Dibuat tim, user handle FE saja.

**Why:** Celo dipilih karena EVM-compatible, mobile-first, gas bisa dibayar pakai stablecoin, dan aligned dengan misi financial inclusion komunitas Indonesia.

**How to apply:** User adalah FE dev. Jangan ubah SC. Jangan push FE ke GitHub kecuali diminta eksplisit.

## Lokasi
- Path: `/Users/maco/Documents/Developer/Hackathon/celo/vespera/`
- GitHub: https://github.com/EzraNahumury/vespera
- SC path: `vespera-sc/` (Foundry, dibuat oleh teman)
- FE path: `frontend/` (Vite + React, dikerjakan user)

## Status (per 2026-06-02)
- [x] README dibuat dan di-push ke GitHub
- [x] SC pulled dari GitHub (7 contracts, Foundry)
- [x] Landing page scaffold (Vite + React + Tailwind, tema hijau muda)
- [x] Landing page di-rebrand ke Vespera (dari template Halo)
- [ ] App pages (dashboard, groups, voting, reputation)
- [ ] Web3 integration (Wagmi + Viem)
- [ ] AI agent integration (Claude API)
- [ ] Testnet deployment (Celo Alfajores)

## Tech Stack — FE
| Layer | Teknologi |
|-------|-----------|
| Framework | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS 3 |
| Icons | lucide-react |
| Web3 | Viem + Wagmi + RainbowKit (planned) |
| Wallet | MetaMask, Valora, Coinbase Wallet |
| AI | Claude (claude-sonnet-4-6) via Anthropic SDK (planned) |

## Warna tema
- Primary green: `#86EFAC`
- Hover green: `#4ADE80`
- Dark green card: `#14532D`
- Background: `#F5F5F5`

## SC Summary (dibuat teman, jangan diubah)
7 contracts (Foundry, Solidity 0.8.28):
1. AgentRegistry — binding wallet ke AI agent config
2. ArisanGroup — core logic: deposit, withdraw request, cycle rotation
3. BadgeNFT — soulbound ERC-721, 5 tipe badge
4. GroupRegistry — factory + direktori grup (5–15 members)
5. ReputationRegistry — skor 0–1000, 4 tier (Bronze/Silver/Gold/Platinum)
6. Treasury — multi-token escrow (USDm/USDC/USDT), CEI pattern
7. VotingEngine — reputation-weighted voting, confidence routing (AI agent push via AGENT_ROLE)

## Key contract mechanics (penting untuk FE)
- Deposit token: USDm / USDC / USDT (bukan CELO)
- Group size: 5–15 members
- Confidence routing: <50% auto-reject | 50-84% normal (60% quorum, 24h) | ≥85% fast-track (30% quorum, 12h)
- Vote weight = reputation score + 1
- Badges: ConsistentPayer, TrustedMember, GroupFounder, DisputeFree, CrossGroupVeteran
- VotingEngine punya AGENT_ROLE — hanya AI agent yang bisa call initVote()
