import { ArrowRight, Users, Brain, Star } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "7", label: "Smart Contracts" },
  { value: "0–1000", label: "Reputation Score" },
  { value: "<10s", label: "AI Validation" },
  { value: "5–15", label: "Members per Group" },
];

const features = [
  {
    icon: Users,
    title: "Savings that compound",
    desc: "Deposit USDC, USDT, or CELO each round. The pot grows — AI and your peers decide together who receives it.",
    bg: "linear-gradient(135deg,#86EFAC 0%,#4ADE80 60%,#16A34A 100%)",
    text: "#000",
    span: "lg:col-span-2",
  },
  {
    icon: Brain,
    title: "AI-validated every time.",
    desc: "Requester Agent scores your withdrawal in <10s. Reviewer Agents cast independent on-chain votes.",
    bg: "#14532D",
    text: "#fff",
    span: "",
  },
  {
    icon: Star,
    title: "Reputation is everything.",
    desc: "Score 0–1000 from deposits, votes, and badges. Higher score = heavier vote weight in every decision.",
    bg: "#14532D",
    text: "#fff",
    span: "",
  },
];

export function InfoSection() {
  return (
    <section id="about" className="bg-[#F5F5F5] px-4 md:px-6 py-24 scroll-mt-20">
      <div className="max-w-[88rem] mx-auto">

        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-end">
          <div>
            <span className="inline-block text-xs font-medium text-[#4ADE80] bg-[#14532D] px-3 py-1 rounded-full mb-5">
              Protocol
            </span>
            <h2 className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8" style={{ letterSpacing: "-0.03em" }}>
              Meet Vespera.
            </h2>
            <Link
              href="/app"
              className="inline-flex items-center gap-3 bg-[#86EFAC] text-black text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-[#4ADE80] transition-all duration-200 hover:shadow-lg hover:shadow-green-200"
            >
              Launch App
              <span className="bg-black rounded-full p-2">
                <ArrowRight className="w-4 h-4 text-[#86EFAC]" />
              </span>
            </Link>
          </div>
          <p className="text-black/60 text-xl md:text-2xl leading-relaxed">
            A decentralized arisan protocol where AI agents validate every withdrawal and on-chain reputation determines voting weight.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="rounded-2xl bg-white border border-black/5 px-5 py-4 hover:border-[#86EFAC] transition-colors duration-200">
              <p className="text-2xl md:text-3xl font-medium text-black mb-0.5" style={{ letterSpacing: "-0.03em" }}>{value}</p>
              <p className="text-xs text-black/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map(({ icon: Icon, title, desc, bg, text, span }) => (
            <div
              key={title}
              className={`${span} rounded-2xl min-h-64 flex flex-col justify-between p-7 group cursor-default`}
              style={{ background: bg, color: text }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
              >
                <Icon className="w-5 h-5" style={{ color: text }} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-medium leading-snug mb-3" style={{ letterSpacing: "-0.02em" }}>
                  {title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed" style={{ opacity: 0.65 }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
