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
    <div className="flex-1 px-3 md:px-4 pt-16 md:pt-20 pb-3 md:pb-4 flex">
      <div className="relative w-full rounded-[28px] overflow-hidden flex items-center" style={{ minHeight: "calc(100vh - 88px)" }}>
        {/* Animated green aurora background */}
        <Aurora />
        <DotGrid />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[88rem] mx-auto px-6 md:px-12 py-12">
          <div className="max-w-2xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur border border-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
              Built on Celo — Mainnet Live
            </span>

            <h1 className="text-white text-5xl md:text-7xl font-semibold leading-[1.02] mb-5" style={{ letterSpacing: "-0.04em" }}>
              Trustless Arisan,
              <br />
              <span className="bg-gradient-to-r from-[#86EFAC] via-[#4ADE80] to-[#16A34A] bg-clip-text text-transparent">
                On-Chain.
              </span>
            </h1>

            <p className="text-white/60 text-base md:text-xl max-w-lg mb-9 leading-relaxed">
              AI-governed rotating savings on Celo. Deposit USDC, USDT, or CELO — every payout is validated by multi-agent AI and enforced by smart contracts.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link href="/app" className="group inline-flex items-center gap-3 bg-[#86EFAC] text-black text-base font-semibold pl-7 pr-2 py-2.5 rounded-full hover:bg-[#4ADE80] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(134,239,172,0.35)]">
                Launch App
                <span className="bg-black rounded-full p-2 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4 text-[#86EFAC]" />
                </span>
              </Link>
              <a href="#how" className="inline-flex items-center bg-white/[0.06] backdrop-blur border border-white/10 text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-white/[0.12] transition-colors duration-200">
                How it works
              </a>
            </div>

            {/* Glass stat chips */}
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/[0.05] backdrop-blur border border-white/10 rounded-2xl px-4 py-3.5">
                  <Icon className="w-4 h-4 text-[#86EFAC] mb-2" />
                  <p className="text-white text-xl font-semibold" style={{ letterSpacing: "-0.02em" }}>{value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
