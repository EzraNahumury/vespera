import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";

export const celo = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://forno.celo.org"] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://celoscan.io" },
  },
});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [celo.id]: http(process.env.NEXT_PUBLIC_RPC_URL ?? "https://forno.celo.org"),
  },
  ssr: true,
});

export const CONTRACTS = {
  agentRegistry: (process.env.NEXT_PUBLIC_AGENT_REGISTRY ?? "0x67aF4795C9C76677F252d1b60DA7b240DB3A7A10") as `0x${string}`,
  badgeNFT: (process.env.NEXT_PUBLIC_BADGE_NFT ?? "0x4d5AcB5cDE12C0657C0D8aA4c3C8004196dB8410") as `0x${string}`,
  reputationRegistry: (process.env.NEXT_PUBLIC_REPUTATION_REGISTRY ?? "0xd6EE8f307B9564A6E0EA8Aa91b5A74Cb40a3F521") as `0x${string}`,
  treasury: (process.env.NEXT_PUBLIC_TREASURY ?? "0x4D84DD953FCdecfD54eA50e4ce6Ea809D9f9DAbd") as `0x${string}`,
  votingEngine: (process.env.NEXT_PUBLIC_VOTING_ENGINE ?? "0xCa8C94Fb21C5d6b8f786e6d549dAb2a8Fe2f07f6") as `0x${string}`,
  groupRegistry: (process.env.NEXT_PUBLIC_GROUP_REGISTRY ?? "0x493613949d63b63b02A58Ee899e9c6cd647Ae86b") as `0x${string}`,
} as const;

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
