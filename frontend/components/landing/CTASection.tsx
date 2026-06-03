import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-[#F5F5F5] px-4 md:px-6 py-16">
      <div className="max-w-[88rem] mx-auto">
        <div className="rounded-3xl bg-[#14532D] px-8 md:px-14 py-14 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 overflow-hidden relative">

          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#86EFAC]/5 pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#4ADE80]/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="text-[#86EFAC] text-sm font-medium">Live on Celo Mainnet</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-medium text-white leading-tight mb-3" style={{ letterSpacing: "-0.03em" }}>
              Ready to start your<br className="hidden md:block" /> arisan on-chain?
            </h2>
            <p className="text-white/50 text-base max-w-md">
              Create your first group in minutes. No middleman, no trust required — just you, your members, and the blockchain.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/app/create"
              className="inline-flex items-center gap-3 bg-[#86EFAC] text-black font-medium pl-7 pr-2 py-2.5 rounded-full hover:bg-[#4ADE80] transition-all duration-200 hover:shadow-lg hover:shadow-green-900/30 text-base"
            >
              Create Group
              <span className="bg-black rounded-full p-2">
                <ArrowRight className="w-4 h-4 text-[#86EFAC]" />
              </span>
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center bg-white/10 text-white font-medium px-7 py-2.5 rounded-full hover:bg-white/15 transition-colors duration-200 text-base border border-white/10"
            >
              Explore App
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
