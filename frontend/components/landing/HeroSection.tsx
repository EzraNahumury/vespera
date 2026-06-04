import { ArrowRight, ShieldCheck, Sparkles, Coins } from "lucide-react";
import Link from "next/link";
import { Aurora } from "@/components/ui/Aurora";
import { DotGrid } from "@/components/ui/DotGrid";

const stats = [
  { icon: ShieldCheck, label: "Smart Contracts", value: "7" },
  { icon: Sparkles, label: "AI Validation", value: "<10s" },
  { icon: Coins, label: "Stablecoins", value: "3" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Full-bleed animated green aurora */}
      <Aurora />
      <DotGrid />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[88rem] mx-auto px-6 md:px-10 pt-28 pb-16">
        <div className="max-w-2xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur border border-white/15 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-7">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
            Built on Celo — Mainnet Live
          </span>

          <h1 className="text-white text-5xl md:text-7xl font-semibold leading-[1.02] mb-6" style={{ letterSpacing: "-0.04em" }}>
            Trustless Arisan,
            <br />
            <span className="text-[#86EFAC]">On-Chain.</span>
          </h1>

          <p className="text-white/65 text-base md:text-xl max-w-lg mb-10 leading-relaxed">
            AI-governed rotating savings on Celo. Deposit USDC, USDT, or CELO — every payout is validated by multi-agent AI and enforced by smart contracts.
          </p>

          <div className="flex flex-wrap gap-3 mb-14">
            <Link href="/app" className="group inline-flex items-center gap-3 bg-[#86EFAC] text-black text-base font-semibold pl-7 pr-2 py-2.5 rounded-full hover:bg-[#4ADE80] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(134,239,172,0.4)]">
              Launch App
              <span className="bg-black rounded-full p-2 group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4 text-[#86EFAC]" />
              </span>
            </Link>
            <a href="#how" className="inline-flex items-center bg-white/[0.06] backdrop-blur border border-white/15 text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-white/[0.12] transition-colors duration-200">
              How it works
            </a>
          </div>

          {/* Glass stat chips */}
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/[0.06] backdrop-blur border border-white/10 rounded-2xl px-4 py-4 hover:bg-white/[0.1] transition-colors">
                <Icon className="w-5 h-5 text-[#86EFAC] mb-2.5" />
                <p className="text-white text-2xl font-semibold" style={{ letterSpacing: "-0.02em" }}>{value}</p>
                <p className="text-white/45 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/30">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
