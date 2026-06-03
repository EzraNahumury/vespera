"use client";

import ScrollStack, { ScrollStackItem } from "@/components/ui/ScrollStack";

const steps = [
  {
    number: "01",
    title: "Create a Group",
    desc: "Deploy an ArisanGroup smart contract via GroupRegistry. Set deposit token (USDC / USDT / CELO), amount per round, max members (5–15), and round duration.",
    bg: "#86EFAC",
    text: "#000",
  },
  {
    number: "02",
    title: "Invite & Deposit",
    desc: "Creator invites members by wallet address. Each member deposits a fixed amount every round directly into the Treasury escrow contract on Celo.",
    bg: "#14532D",
    text: "#fff",
  },
  {
    number: "03",
    title: "Request Withdrawal",
    desc: "When it's your turn, submit a withdrawal request with a reason. The off-chain Requester AI Agent (Claude) validates it in under 10 seconds.",
    bg: "#4ADE80",
    text: "#000",
  },
  {
    number: "04",
    title: "AI Confidence Routing",
    desc: "≥85% confidence → fast-track (30% quorum, 12h). 50–84% → normal vote (60% quorum, 24h). Below 50% → auto-rejected, reason logged to IPFS.",
    bg: "#166534",
    text: "#fff",
  },
  {
    number: "05",
    title: "Members Vote",
    desc: "Reviewer AI Agents — one per member — independently reason and cast on-chain votes. Vote weight = reputation score + 1. Higher reputation = heavier vote.",
    bg: "#86EFAC",
    text: "#000",
  },
  {
    number: "06",
    title: "Payout Released",
    desc: "Once quorum and majority are met, VotingEngine triggers Treasury to release stablecoins directly to the requester's wallet. Immutable and instant.",
    bg: "#14532D",
    text: "#fff",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-[#F5F5F5] scroll-mt-20">
      <div className="max-w-[88rem] mx-auto px-4 md:px-6 pt-24 pb-8">
        <p className="text-black/50 text-sm mb-2">Step by step</p>
        <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
          How Vespera Works
        </h2>
        <p className="text-black/50 text-base max-w-lg">
          From group creation to payout — every step is on-chain, AI-validated, and governed by reputation.
        </p>
      </div>

      {/* ScrollStack — full viewport height */}
      <div style={{ height: "100vh", position: "relative" }}>
        <ScrollStack
          itemDistance={120}
          itemScale={0.04}
          itemStackDistance={24}
          stackPosition="15%"
          scaleEndPosition="8%"
          baseScale={0.88}
        >
          {steps.map((step) => (
            <ScrollStackItem key={step.number}>
              <div
                className="h-full min-h-64 p-8 md:p-12 flex flex-col justify-between"
                style={{ backgroundColor: step.bg, color: step.text }}
              >
                <span
                  className="text-5xl font-medium font-mono opacity-30"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {step.number}
                </span>
                <div>
                  <h3 className="text-2xl md:text-3xl font-medium mb-3" style={{ letterSpacing: "-0.02em" }}>
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed opacity-75 max-w-xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>

      {/* Confidence routing visual */}
      <div className="max-w-[88rem] mx-auto px-4 md:px-6 pb-24">
        <div className="rounded-2xl bg-[#14532D] p-7 md:p-10">
          <p className="text-white/60 text-sm mb-5">AI Confidence Routing</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { range: "≥ 85%", label: "Fast-Track", quorum: "30% quorum", window: "12 hour window", color: "#86EFAC" },
              { range: "50–84%", label: "Normal Vote", quorum: "60% quorum", window: "24 hour window", color: "#FDE68A" },
              { range: "< 50%", label: "Auto-Reject", quorum: "No vote opened", window: "Reason logged to IPFS", color: "#FCA5A5" },
            ].map(({ range, label, quorum, window, color }) => (
              <div key={label} className="rounded-xl bg-white/5 p-5">
                <span className="text-2xl font-medium" style={{ color }}>{range}</span>
                <p className="text-white font-medium mt-2">{label}</p>
                <p className="text-white/40 text-xs mt-1">{quorum}</p>
                <p className="text-white/40 text-xs">{window}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
