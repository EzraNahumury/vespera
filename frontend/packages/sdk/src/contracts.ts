import { defineChain } from "viem";

/** Celo mainnet (chainId 42220) — the only network Vespera is deployed on. */
export const celo = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo.org"] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://celoscan.io" },
  },
});

/** Live Vespera protocol contract addresses on Celo mainnet. */
export const CONTRACTS = {
  agentRegistry: "0x67aF4795C9C76677F252d1b60DA7b240DB3A7A10",
  badgeNFT: "0x4d5AcB5cDE12C0657C0D8aA4c3C8004196dB8410",
  reputationRegistry: "0xd6EE8f307B9564A6E0EA8Aa91b5A74Cb40a3F521",
  treasury: "0x4D84DD953FCdecfD54eA50e4ce6Ea809D9f9DAbd",
  votingEngine: "0xCa8C94Fb21C5d6b8f786e6d549dAb2a8Fe2f07f6",
  groupRegistry: "0x493613949d63b63b02A58Ee899e9c6cd647Ae86b",
} as const satisfies Record<string, `0x${string}`>;

/** Stablecoin / native token addresses accepted as group deposit tokens. */
export const TOKENS = {
  CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  USDT: "0x617f3112bf5397D0467D315cC709EF968D9ba546",
} as const satisfies Record<string, `0x${string}`>;

export const TOKEN_LABELS: Record<string, string> = {
  [TOKENS.CELO]: "CELO",
  [TOKENS.USDC]: "USDC",
  [TOKENS.USDT]: "USDT",
};

/** Reputation tier labels + display colors, indexed by on-chain tier (0-3). */
export const TIER_LABELS = ["Bronze", "Silver", "Gold", "Platinum"] as const;
export const TIER_COLORS = ["#CD7F32", "#C0C0C0", "#FFD700", "#E5E4E2"] as const;

/** BadgeNFT badge labels, indexed by badge id (0-4). */
export const BADGE_LABELS = [
  "Consistent Payer",
  "Trusted Member",
  "Group Founder",
  "Dispute-Free",
  "Cross-Group Veteran",
] as const;
