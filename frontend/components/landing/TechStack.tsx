"use client";

import { Shield, Zap, Brain, Award, Users, Coins } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Fully On-Chain & Transparent",
    description:
      "Every deposit, rotation, and payout is recorded on Celo. No middlemen, no hidden fees — just trustless smart contracts anyone can verify.",
    accent: "#86EFAC",
    accentText: "#14532D",
    tag: "Trustless",
  },
  {
    icon: Brain,
    title: "AI-Powered Fair Voting",
    description:
      "Claude AI agents evaluate each withdrawal request objectively. One Requester Agent drafts the case; one Reviewer Agent audits it — bias removed.",
    accent: "#C4B5FD",
    accentText: "#4C1D95",
    tag: "Claude AI",
  },
  {
    icon: Award,
    title: "Soulbound Reputation Score",
    description:
      "Your on-chain reputation (0–1000) travels with your wallet across every group. Good behavior earns badges; bad actors lose voting weight automatically.",
    accent: "#FDE68A",
    accentText: "#78350F",
    tag: "Reputation",
  },
  {
    icon: Zap,
    title: "Sub-$0.01 Gas Fees",
    description:
      "Built on Celo — a mobile-first L1 designed for real-world payments. Every transaction costs less than a cent, making micro-savings practical for everyone.",
    accent: "#86EFAC",
    accentText: "#14532D",
    tag: "Celo L1",
  },
  {
    icon: Coins,
    title: "Multi-Token Escrow",
    description:
      "Groups can save in CELO, USDC, or USDT. Funds are locked in a non-custodial Treasury contract — only released when the group reaches consensus.",
    accent: "#FDE68A",
    accentText: "#78350F",
    tag: "DeFi",
  },
  {
    icon: Users,
    title: "Built for Communities",
    description:
      "From family groups to professional guilds — Vespera fits any arisan format. Customizable cycles, member caps, and invite-only access keep your circle tight.",
    accent: "#C4B5FD",
    accentText: "#4C1D95",
    tag: "Social",
  },
];

export function TechStack() {
  return (
    <section id="features" className="bg-[#F5F5F5] px-4 md:px-6 py-24 scroll-mt-20">
      <div className="max-w-[88rem] mx-auto">

        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="text-black/45 text-sm font-medium mb-3 uppercase tracking-widest">Why Vespera</p>
          <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight" style={{ letterSpacing: "-0.03em" }}>
            Everything your arisan<br className="hidden sm:block" /> needs, on-chain.
          </h2>
          <p className="text-black/50 text-lg mt-4 leading-relaxed">
            We combined DeFi infrastructure, AI fairness, and community-first design so you can run a rotating savings group with total confidence.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, accent, accentText, tag }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl border border-black/[0.06] p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Icon + Tag row */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: accent + "33" }}
                >
                  <Icon className="w-6 h-6" style={{ color: accentText }} />
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: accent + "40", color: accentText }}
                >
                  {tag}
                </span>
              </div>

              {/* Text */}
              <h3 className="text-base font-semibold text-black mb-2 leading-snug">{title}</h3>
              <p className="text-sm text-black/50 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
