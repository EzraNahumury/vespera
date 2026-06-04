import { ArrowRight, Users, Brain, Star } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "7", label: "Smart Contracts" },
  { value: "0–1000", label: "Reputation Score" },
  { value: "<10s", label: "AI Validation" },
  { value: "5–15", label: "Members / Group" },
];

export function InfoSection() {
  return (
    <section id="about" className="bg-[#F5F5F5] px-4 md:px-6 py-24 scroll-mt-20">
      <div className="max-w-[88rem] mx-auto">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14 items-end">
          <div>
            <span className="inline-block text-xs font-semibold text-[#16A34A] bg-[#86EFAC]/25 px-3 py-1 rounded-full mb-5">
              Protocol
            </span>
            <h2 className="text-black text-4xl md:text-6xl font-semibold leading-[1.05] mb-7" style={{ letterSpacing: "-0.04em" }}>
              Meet Vespera.
            </h2>
            <Link
              href="/app"
              className="group inline-flex items-center gap-3 bg-[#86EFAC] text-black text-base font-semibold pl-7 pr-2 py-2.5 rounded-full hover:bg-[#4ADE80] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(134,239,172,0.4)]"
            >
              Launch App
              <span className="bg-black rounded-full p-2 group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4 text-[#86EFAC]" />
              </span>
            </Link>
          </div>
          <p className="text-black/55 text-xl md:text-2xl leading-relaxed">
            A decentralized arisan protocol where <span className="text-black font-medium">AI agents validate every withdrawal</span> and on-chain reputation determines voting weight.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {stats.map(({ value, label }) => (
            <div key={label} className="relative rounded-2xl bg-white card-shadow px-5 py-5 overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#86EFAC] to-[#16A34A] opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-3xl md:text-4xl font-semibold text-black mb-1" style={{ letterSpacing: "-0.03em" }}>{value}</p>
              <p className="text-xs text-black/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Bento feature grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          {/* Large green feature */}
          <div className="lg:col-span-1 lg:row-span-1 relative rounded-3xl p-8 min-h-72 flex flex-col justify-between overflow-hidden group"
            style={{ background: "linear-gradient(150deg,#86EFAC 0%,#4ADE80 55%,#16A34A 100%)" }}>
            <Users className="absolute -right-6 -bottom-6 w-44 h-44 text-black/[0.06]" strokeWidth={1} />
            <div className="relative w-11 h-11 rounded-2xl bg-black/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div className="relative">
              <h3 className="text-black text-2xl font-semibold leading-snug mb-2" style={{ letterSpacing: "-0.02em" }}>Savings that compound</h3>
              <p className="text-black/70 text-sm leading-relaxed">Deposit USDC, USDT, or CELO each round. The pot grows — AI and your peers decide together who receives it.</p>
            </div>
          </div>

          {/* Two dark features */}
          {[
            { icon: Brain, title: "AI-validated, every time", desc: "A Requester Agent scores your withdrawal in under 10 seconds. Reviewer Agents — one per member — cast independent on-chain votes." },
            { icon: Star, title: "Reputation is everything", desc: "Build a score from 0 to 1000 across deposits, votes, and badges. The higher your score, the heavier your vote weight." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="relative rounded-3xl p-8 min-h-72 flex flex-col justify-between overflow-hidden group" style={{ backgroundColor: "#14532D" }}>
              <Icon className="absolute -right-6 -bottom-6 w-44 h-44 text-white/[0.04]" strokeWidth={1} />
              <div className="relative w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#86EFAC]/20 transition-colors">
                <Icon className="w-5 h-5 text-[#86EFAC]" />
              </div>
              <div className="relative">
                <h3 className="text-white text-2xl font-semibold leading-snug mb-2" style={{ letterSpacing: "-0.02em" }}>{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
