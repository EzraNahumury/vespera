export type AgentType = "conservative" | "balanced" | "aggressive";

export interface AgentTypeConfig {
  id: AgentType;
  name: string;
  tagline: string;
  desc: string;
  traits: string[];
  color: string;
  bg: string;
  textColor: string;
  policyURI: string;
  risk: 1 | 2 | 3; // 1 = low, 2 = medium, 3 = high
}

export const AGENT_TYPES: AgentTypeConfig[] = [
  {
    id: "conservative",
    name: "Conservative",
    tagline: "Play it safe",
    desc: "Votes only when highly confident. Sets a higher approval bar — great for groups that value stability and consistency over flexibility.",
    traits: [
      "Requires ≥85% confidence to approve",
      "Votes against on borderline cases",
      "Flags suspicious patterns aggressively",
      "Prioritizes group safety over speed",
    ],
    color: "#86EFAC",
    bg: "#F0FDF4",
    textColor: "#14532D",
    policyURI: "ipfs://vespera-policy-conservative-v1",
    risk: 1,
  },
  {
    id: "balanced",
    name: "Balanced",
    tagline: "Default — recommended",
    desc: "Follows the protocol's standard confidence routing. Approves reasonable requests and rejects suspicious ones. Best for most users.",
    traits: [
      "Follows default confidence routing",
      "Approves fair requests, rejects bad ones",
      "Weighs both sides of the evidence",
      "Good participation = better reputation",
    ],
    color: "#FDE68A",
    bg: "#FFFBEB",
    textColor: "#92400E",
    policyURI: "ipfs://vespera-policy-balanced-v1",
    risk: 2,
  },
  {
    id: "aggressive",
    name: "Aggressive",
    tagline: "High risk, high reward",
    desc: "More likely to approve requests, even with lower confidence scores. Maximizes payouts but increases the chance of a bad actor slipping through.",
    traits: [
      "Approves at lower confidence thresholds",
      "Prioritizes group liquidity and speed",
      "Votes for more withdrawals",
      "Higher risk of approving bad actors",
    ],
    color: "#FCA5A5",
    bg: "#FFF1F2",
    textColor: "#9F1239",
    policyURI: "ipfs://vespera-policy-aggressive-v1",
    risk: 3,
  },
];
