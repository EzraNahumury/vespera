const steps = [
  {
    number: "01",
    title: "Create a Group",
    desc: "Deploy an ArisanGroup smart contract via GroupRegistry. Set deposit token (USDC/USDT/CELO), amount, max members (5–15), and round duration.",
  },
  {
    number: "02",
    title: "Invite & Deposit",
    desc: "Creator invites members by wallet address. Each member deposits a fixed amount every round into the Treasury escrow contract.",
  },
  {
    number: "03",
    title: "Request Withdrawal",
    desc: "When it's your turn, submit a withdrawal request with a reason. The Requester AI Agent validates it in under 10 seconds.",
  },
  {
    number: "04",
    title: "AI Confidence Routing",
    desc: "Score ≥85% → fast-track (30% quorum, 12h). Score 50–84% → normal vote (60% quorum, 24h). Score <50% → auto-rejected.",
  },
  {
    number: "05",
    title: "Members Vote",
    desc: "Reviewer AI Agents (one per member) independently reason and cast on-chain votes. Vote weight = reputation score + 1.",
  },
  {
    number: "06",
    title: "Payout Released",
    desc: "Once quorum and majority are met, VotingEngine triggers Treasury to release stablecoins directly to the requester's wallet.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-[#F5F5F5] px-4 md:px-6 py-24 scroll-mt-20">
      <div className="max-w-[88rem] mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-black/50 text-sm mb-2">Step by step</p>
          <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight" style={{ letterSpacing: "-0.03em" }}>
            How Vespera Works
          </h2>
        </div>

        {/* Steps — desktop: 3 col grid, mobile: stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5 rounded-3xl overflow-hidden">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-[#F5F5F5] p-7 md:p-8 hover:bg-white transition-colors duration-200"
            >
              <span className="text-[#86EFAC] text-sm font-medium font-mono mb-4 block">{step.number}</span>
              <h3 className="text-black text-xl font-medium mb-3 leading-snug">{step.title}</h3>
              <p className="text-black/55 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Confidence routing visual */}
        <div className="mt-8 rounded-2xl bg-[#14532D] p-7 md:p-10">
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
