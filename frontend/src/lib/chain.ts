import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";

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

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [celo.id]: http(import.meta.env.VITE_RPC_URL ?? "https://forno.celo.org"),
  },
});

export const CONTRACTS = {
  agentRegistry: import.meta.env.VITE_AGENT_REGISTRY as `0x${string}`,
  badgeNFT: import.meta.env.VITE_BADGE_NFT as `0x${string}`,
  reputationRegistry: import.meta.env.VITE_REPUTATION_REGISTRY as `0x${string}`,
  treasury: import.meta.env.VITE_TREASURY as `0x${string}`,
  votingEngine: import.meta.env.VITE_VOTING_ENGINE as `0x${string}`,
  groupRegistry: import.meta.env.VITE_GROUP_REGISTRY as `0x${string}`,
} as const;

// Known allowed stablecoins on Celo mainnet
export const TOKENS = {
  CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438" as `0x${string}`,
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`,
  USDT: "0x617f3112bf5397D0467D315cC709EF968D9ba546" as `0x${string}`,
} as const;

export const TOKEN_LABELS: Record<string, string> = {
  [TOKENS.CELO]: "CELO",
  [TOKENS.USDC]: "USDC",
  [TOKENS.USDT]: "USDT",
};

export const TIER_LABELS = ["Bronze", "Silver", "Gold", "Platinum"] as const;
export const TIER_COLORS = ["#CD7F32", "#C0C0C0", "#FFD700", "#E5E4E2"] as const;

export const BADGE_LABELS = [
  "Consistent Payer",
  "Trusted Member",
  "Group Founder",
  "Dispute-Free",
  "Cross-Group Veteran",
] as const;
