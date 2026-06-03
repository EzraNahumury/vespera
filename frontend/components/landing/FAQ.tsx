const faqs = [
  {
    q: "What is Vespera?",
    a: "Vespera is a decentralized rotating savings protocol built on the Celo blockchain. It digitalizes the Indonesian arisan tradition — a group savings system where members take turns receiving the pooled funds — making it transparent, trustless, and AI-governed.",
  },
  {
    q: "How does the AI validation work?",
    a: "When a member submits a withdrawal request, an off-chain Requester Agent (powered by Claude) analyzes the request — checking deposit consistency, reputation score, and reason plausibility — and returns a confidence score. This score determines whether the request goes to fast-track vote, normal vote, or is auto-rejected.",
  },
  {
    q: "What tokens can I deposit?",
    a: "Vespera supports USDC, USDT, and CELO on the Celo mainnet. Each group is configured with a single deposit token set at creation.",
  },
  {
    q: "What is the reputation system?",
    a: "Every wallet has a reputation score from 0 to 1000 calculated from: deposit consistency (40%), voting participation (20%), vote quality (15%), group tenure (10%), badge count (10%), and cross-group penalties (5%). Your score determines the weight of your vote.",
  },
  {
    q: "What are soulbound badges?",
    a: "Badges are non-transferable ERC-721 NFTs automatically minted when you hit certain milestones: Consistent Payer (12+ on-time deposits), Trusted Member (≥80% vote agreement), Group Founder (group with ≥5 members), Dispute-Free (6 months no penalties), Cross-Group Veteran (active in 3+ groups).",
  },
  {
    q: "Is Vespera safe?",
    a: "Smart contracts use OpenZeppelin standards, the CEI (Checks-Effects-Interactions) pattern on Treasury to prevent reentrancy, and all funds are held in escrow — only released by VotingEngine after quorum passes.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-[#F5F5F5] px-4 md:px-6 py-24 scroll-mt-20">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div className="md:sticky md:top-24">
            <p className="text-black/50 text-sm mb-2">Questions</p>
            <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight mb-6" style={{ letterSpacing: "-0.03em" }}>
              Frequently Asked
            </h2>
            <p className="text-black/50 text-base leading-relaxed max-w-sm">
              Everything you need to know about Vespera before joining your first arisan group on-chain.
            </p>
          </div>

          {/* Right: accordion */}
          <div className="divide-y divide-black/8">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                  <span className="text-base font-medium text-black">{q}</span>
                  <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center shrink-0 transition-transform group-open:rotate-45 group-open:bg-[#86EFAC]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-black/55 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
