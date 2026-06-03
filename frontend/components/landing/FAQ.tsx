import Link from "next/link";

const faqs = [
  {
    q: "What is Vespera?",
    a: "Vespera is a decentralized rotating savings protocol on Celo. It digitalizes the Indonesian arisan tradition — a group savings system where members take turns receiving pooled funds — making it transparent, trustless, and AI-governed.",
  },
  {
    q: "How does the AI validation work?",
    a: "When a member submits a withdrawal request, an off-chain Requester Agent (Claude) analyzes deposit consistency, reputation score, and reason plausibility — returning a confidence score that routes the request to fast-track vote, normal vote, or auto-rejection.",
  },
  {
    q: "What tokens can I deposit?",
    a: "USDC, USDT, and CELO on the Celo mainnet. Each group is configured with a single deposit token set at creation time.",
  },
  {
    q: "What is the reputation system?",
    a: "Every wallet has a score from 0 to 1000: deposit consistency (40%), voting participation (20%), vote quality (15%), group tenure (10%), badge count (10%), cross-group penalties (5%). Your score is your vote weight.",
  },
  {
    q: "What are soulbound badges?",
    a: "Non-transferable ERC-721 NFTs minted automatically at milestones: Consistent Payer (12+ on-time deposits), Trusted Member (≥80% vote agreement), Group Founder, Dispute-Free (6 months clean), Cross-Group Veteran (3+ groups).",
  },
  {
    q: "Is Vespera safe?",
    a: "Contracts use OpenZeppelin standards, CEI pattern on Treasury to prevent reentrancy, and all funds are held in escrow — only released by VotingEngine after quorum passes. Deployed and verified on Celo mainnet.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-[#F5F5F5] px-4 md:px-6 py-24 scroll-mt-20">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left sticky */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <span className="inline-block text-xs font-medium text-[#4ADE80] bg-[#14532D] px-3 py-1 rounded-full mb-5">
              Questions
            </span>
            <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight mb-5" style={{ letterSpacing: "-0.03em" }}>
              Frequently Asked
            </h2>
            <p className="text-black/50 text-base leading-relaxed mb-8">
              Everything you need to know about Vespera before joining your first arisan group on-chain.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 text-sm font-medium text-black/60 hover:text-black transition-colors"
            >
              Still have questions? Launch the app →
            </Link>
          </div>

          {/* Right accordion */}
          <div className="lg:col-span-3 space-y-2">
            {faqs.map(({ q, a }, i) => (
              <details
                key={q}
                className="group rounded-2xl bg-white border border-black/5 hover:border-black/10 transition-colors duration-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-5 gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-black/25 shrink-0 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-medium text-black">{q}</span>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center shrink-0 transition-all duration-200 group-open:bg-[#86EFAC] group-open:rotate-45">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <div className="pl-9">
                    <p className="text-black/55 text-sm leading-relaxed">{a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
