import { ArrowRight } from "lucide-react";

export function InfoSection() {
  return (
    <section className="bg-[#F5F5F5] px-6 py-24">
      <div className="max-w-[88rem] mx-auto">
        {/* Row 1: heading + description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          <div>
            <h2
              className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8"
              style={{ letterSpacing: "-0.03em" }}
            >
              Meet Vespera.
            </h2>
            <button className="inline-flex items-center gap-3 bg-[#86EFAC] text-black text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-[#4ADE80] transition-colors duration-200">
              How it works
              <span className="bg-black rounded-full p-2">
                <ArrowRight className="w-4 h-4 text-[#86EFAC]" />
              </span>
            </button>
          </div>

          <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
            Vespera is a decentralized arisan protocol where AI agents validate every withdrawal and on-chain reputation determines voting weight.
          </p>
        </div>

        {/* Row 2: 4-col card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 — spans 2 cols, green gradient */}
          <div
            className="lg:col-span-2 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #86EFAC 0%, #4ADE80 50%, #16A34A 100%)",
            }}
          >
            <div className="p-7 min-h-80 flex flex-col justify-between">
              <h3
                className="text-black text-2xl font-medium leading-snug"
                style={{ letterSpacing: "-0.02em" }}
              >
                Savings that compound
              </h3>
              <p className="text-black/70 text-base max-w-xs">
                Deposit USDm, USDC, or USDT each round. The pot grows — and when it's your turn, AI and your peers decide together.
              </p>
            </div>
          </div>

          {/* Card 2 — dark green */}
          <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundColor: "#14532D" }}>
            <h3 className="text-white text-2xl font-medium" style={{ letterSpacing: "-0.02em" }}>
              AI-validated
              <br />
              every time.
            </h3>
            <p className="text-white/60 text-base">
              A Requester Agent scores your withdrawal in under 10 seconds. Reviewer Agents — one per member — cast independent on-chain votes.
            </p>
          </div>

          {/* Card 3 — dark green */}
          <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between" style={{ backgroundColor: "#14532D" }}>
            <h3 className="text-white text-2xl font-medium" style={{ letterSpacing: "-0.02em" }}>
              Reputation
              <br />
              is everything.
            </h3>
            <p className="text-white/60 text-base">
              On-time deposits, vote participation, and badges build your score (0–1000). Higher score means more weight in every vote.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
