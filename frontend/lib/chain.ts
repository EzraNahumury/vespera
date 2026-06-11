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
  agentRegistry: (process.env.NEXT_PUBLIC_AGENT_REGISTRY ?? "0x0f4afA3e8297e817B3Aa638cd592a46961ac7228") as `0x${string}`,
  badgeNFT: (process.env.NEXT_PUBLIC_BADGE_NFT ?? "0x1995408F84a41Bc81Ec748b6b0718e30f65A5fB2") as `0x${string}`,
  reputationRegistry: (process.env.NEXT_PUBLIC_REPUTATION_REGISTRY ?? "0x7f4a0C69c3699e7d89bdB527f9e0048Da137b6aF") as `0x${string}`,
  treasury: (process.env.NEXT_PUBLIC_TREASURY ?? "0xe0F543010FbAc613a6550E19Da6a680173Cf9009") as `0x${string}`,
  votingEngine: (process.env.NEXT_PUBLIC_VOTING_ENGINE ?? "0x760674315E3c1eA8665a756155C6602e547E788A") as `0x${string}`,
  groupRegistry: (process.env.NEXT_PUBLIC_GROUP_REGISTRY ?? "0xD5D1a4713B8774783CFe33Bb2c68655Dc53036f0") as `0x${string}`,
} as const;

// --- In-game credits ------------------------------------------------------
// Deposits/withdrawals no longer move ERC-20 tokens. Users deposit native CELO
// into the Treasury and receive internal "credits" at a fixed 1:1000 rate
// (Voxel-style). Credits are an 18-decimal quantity: 1 CELO -> 1000.0 credits.
export const CREDIT_PER_CELO = BigInt(1000);
export const CREDIT_DECIMALS = 18;
export const CREDIT_SYMBOL = "CR";

/** Wei of native CELO -> credits (18-decimal). */
export const celoToCredits = (celoWei: bigint) => celoWei * CREDIT_PER_CELO;
/** Credits (18-decimal) -> wei of native CELO. */
export const creditsToCelo = (credits: bigint) => credits / CREDIT_PER_CELO;

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
