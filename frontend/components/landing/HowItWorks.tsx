"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import ScrollStack, { ScrollStackItem } from "@/components/ui/ScrollStack";

const steps = [
  {
    number: "01",
    title: "Create a Group",
    desc: "Deploy an ArisanGroup contract via GroupRegistry. Set deposit token, fixed amount, max members (5–15), and round duration.",
    bg: "#86EFAC",
    text: "#000",
    tag: "On-chain",
  },
  {
    number: "02",
    title: "Invite & Deposit",
    desc: "Invite members by wallet address. Each member deposits a fixed amount every round into the Treasury escrow on Celo.",
    bg: "#14532D",
    text: "#fff",
    tag: "Treasury",
  },
  {
    number: "03",
    title: "Request Withdrawal",
    desc: "Submit a withdrawal request with a reason. The Requester AI Agent (Claude) validates it in under 10 seconds.",
    bg: "#4ADE80",
    text: "#000",
    tag: "AI Agent",
  },
  {
    number: "04",
    title: "AI Confidence Routing",
    desc: "≥85% → fast-track (30% quorum, 12h). 50–84% → normal vote (60% quorum, 24h). Below 50% → auto-rejected.",
    bg: "#166534",
    text: "#fff",
    tag: "Routing",
  },
  {
    number: "05",
    title: "Members Vote",
    desc: "Reviewer Agents cast on-chain votes independently. Vote weight = reputation score + 1.",
    bg: "#86EFAC",
    text: "#000",
    tag: "Voting",
  },
  {
    number: "06",
    title: "Payout Released",
    desc: "Quorum met → VotingEngine triggers Treasury to release funds directly to the requester. Instant and immutable.",
    bg: "#14532D",
    text: "#fff",
    tag: "Payout",
  },
];

const confidence = [
  { range: "≥ 85%",  label: "Fast-Track",  sub: "30% quorum · 12h window",  color: "#86EFAC", bg: "rgba(134,239,172,0.12)" },
  { range: "50–84%", label: "Normal Vote", sub: "60% quorum · 24h window",  color: "#FDE68A", bg: "rgba(253,230,138,0.12)" },
  { range: "< 50%",  label: "Auto-Reject", sub: "No vote · Reason to IPFS", color: "#FCA5A5", bg: "rgba(252,165,165,0.12)" },
];

function SectionHeader() {
  return (
    <div className="max-w-[88rem] mx-auto px-4 md:px-6 pt-24 pb-10">
      <span className="inline-block text-xs font-medium text-[#4ADE80] bg-[#14532D] px-3 py-1 rounded-full mb-4">
        Step by step
      </span>
      <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
        How Vespera Works
      </h2>
      <p className="text-black/50 text-base max-w-lg leading-relaxed">
        From group creation to payout — every step is on-chain, AI-validated, and governed by reputation.
      </p>
    </div>
  );
}

function ConfidenceRouting() {
  return (
    <div className="max-w-[88rem] mx-auto px-4 md:px-6 pb-24">
      <div className="rounded-3xl bg-[#0f2d1a] p-7 md:p-10 border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider">AI Confidence Routing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {confidence.map(({ range, label, sub, color, bg }) => (
            <div key={label} className="rounded-2xl p-5 border border-white/5" style={{ backgroundColor: bg }}>
              <span className="text-3xl font-medium tracking-tight" style={{ color, letterSpacing: "-0.02em" }}>{range}</span>
              <p className="text-white font-medium mt-2 mb-1">{label}</p>
              <p className="text-white/40 text-xs leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile: numbered timeline ─── */
function MobileSteps() {
  return (
    <div className="max-w-[88rem] mx-auto px-4 pb-10">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-black/10" />

        <div className="space-y-4 pl-14">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Circle */}
              <div
                className="absolute -left-14 top-4 w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium shrink-0 border-4 border-[#F5F5F5]"
                style={{ backgroundColor: step.bg, color: step.text }}
              >
                {i + 1}
              </div>

              <div className="rounded-2xl bg-white p-5 border border-black/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-black font-medium">{step.title}</h3>
                  <span className="text-xs text-black/40 bg-black/5 px-2 py-0.5 rounded-full">{step.tag}</span>
                </div>
                <p className="text-black/55 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop: ScrollStack ─── */
function DesktopSteps() {
  return (
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
              className="h-full min-h-64 p-10 md:p-14 flex flex-col justify-between"
              style={{ backgroundColor: step.bg, color: step.text }}
            >
              <div className="flex items-start justify-between">
                <span className="text-6xl font-medium font-mono opacity-20" style={{ letterSpacing: "-0.04em" }}>
                  {step.number}
                </span>
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(0,0,0,0.12)", color: step.text }}
                >
                  {step.tag}
                </span>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-medium mb-4" style={{ letterSpacing: "-0.03em" }}>
                  {step.title}
                </h3>
                <p className="text-lg leading-relaxed opacity-70 max-w-2xl">{step.desc}</p>
              </div>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </div>
  );
}

export function HowItWorks() {
  const isMobile = useIsMobile();

  return (
    <section id="how" className="bg-[#F5F5F5] scroll-mt-20">
      <SectionHeader />
      {isMobile ? <MobileSteps /> : <DesktopSteps />}
      <ConfidenceRouting />
    </section>
  );
}
