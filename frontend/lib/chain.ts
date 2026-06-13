import { http, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { celo } from "vespera-sdk";

// Protocol data (chain, addresses, tokens, labels) now lives in the published
// vespera-sdk package. Re-exported here so existing "@/lib/chain" imports keep
// working while the single source of truth is the SDK.
export {
  celo,
  CONTRACTS,
  TOKENS,
  TOKEN_LABELS,
  TIER_LABELS,
  TIER_COLORS,
  BADGE_LABELS,
} from "vespera-sdk";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

// App-specific wagmi wiring stays local. The transport honors NEXT_PUBLIC_RPC_URL
// so a custom RPC still overrides the SDK chain's default forno endpoint.
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
