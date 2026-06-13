# @vespera/sdk

TypeScript SDK for the **Vespera** arisan (ROSCA) protocol on **Celo** — a trustless, AI-governed rotating savings protocol where members pool stablecoins, take turns receiving payouts, and build on-chain reputation.

This package ships the on-chain building blocks so you can read and write Vespera contracts from any TypeScript app:

- **Typed contract ABIs** (`as const`, ready for [viem](https://viem.sh) / [wagmi](https://wagmi.sh) inference)
- **Live Celo mainnet addresses** for every protocol contract
- **Celo chain definition** (`defineChain`)
- **Agent policy metadata** (conservative / balanced / aggressive) and reputation tier + badge labels

It is **framework-free** — `viem` is the only peer dependency.

## Install

```bash
npm install @vespera/sdk viem
```

## Usage

### Read a group's deposit token

```ts
import { createPublicClient, http } from "viem";
import { celo, CONTRACTS, GroupRegistryABI, ArisanGroupABI } from "@vespera/sdk";

const client = createPublicClient({ chain: celo, transport: http() });

// List every group ever created
const groups = await client.readContract({
  address: CONTRACTS.groupRegistry,
  abi: GroupRegistryABI,
  functionName: "allGroups",
});

// Inspect the first group's deposit token
const token = await client.readContract({
  address: groups[0],
  abi: ArisanGroupABI,
  functionName: "depositToken",
});
```

### Resolve a token label

```ts
import { TOKENS, TOKEN_LABELS } from "@vespera/sdk";

TOKEN_LABELS[TOKENS.USDC]; // "USDC"
```

### Use agent policy presets

```ts
import { AGENT_TYPES } from "@vespera/sdk";

const balanced = AGENT_TYPES.find((a) => a.id === "balanced");
balanced?.policyURI; // "ipfs://vespera-policy-balanced-v1"
```

## Exports

| Export | Description |
| --- | --- |
| `celo` | Celo mainnet chain (chainId `42220`) |
| `CONTRACTS` | Protocol contract addresses (agentRegistry, badgeNFT, reputationRegistry, treasury, votingEngine, groupRegistry) |
| `TOKENS` / `TOKEN_LABELS` | Supported deposit tokens (CELO, USDC, USDT) and their labels |
| `TIER_LABELS` / `TIER_COLORS` | Reputation tiers (Bronze → Platinum) |
| `BADGE_LABELS` | BadgeNFT achievement labels |
| `AGENT_TYPES` / `AgentType` / `AgentTypeConfig` | AI agent policy presets |
| `*ABI` | `AgentRegistryABI`, `ArisanGroupABI`, `BadgeNFTABI`, `ERC20ABI`, `GroupRegistryABI`, `ReputationRegistryABI`, `TreasuryABI`, `VotingEngineABI` |

## Network

Vespera is live on **Celo mainnet only** (chainId `42220`). Contract addresses in `CONTRACTS` are the production deployment.

## License

[MIT](./LICENSE)
