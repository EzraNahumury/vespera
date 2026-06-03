import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function UseCasesSection() {
  return (
    <section id="usecases" className="bg-[#F5F5F5] px-4 md:px-6 py-24 scroll-mt-20">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="md:pr-12 md:pt-2">
          <p className="text-black/60 text-sm mb-2">Vespera in Practice</p>
          <h2 className="text-5xl md:text-6xl font-medium leading-none mb-6" style={{ letterSpacing: "-0.04em" }}>
            Use cases
          </h2>
          <p className="text-black/60 text-base leading-relaxed max-w-sm mb-8">
            Vespera works for any rotating savings group — family circles, community pools, workplace savings clubs. Anyone with a Celo wallet can participate.
          </p>
          <div className="space-y-3">
            {[
              { title: "Family Arisan", desc: "Monthly family savings with transparent rotation" },
              { title: "Community Pool", desc: "Neighbourhood or social group savings" },
              { title: "Workplace Club", desc: "Colleague savings with on-chain accountability" },
              { title: "DeFi Treasury", desc: "DAO or protocol treasury rotation schemes" },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-black/5">
                <span className="w-2 h-2 rounded-full bg-[#86EFAC] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-black">{title}</p>
                  <p className="text-xs text-black/40">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden min-h-[600px] md:min-h-[720px]">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#86EFAC]/10" />
          <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-end">
            <h3 className="text-3xl md:text-5xl font-medium leading-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
              Community Groups
            </h3>
            <p className="text-black/70 text-sm md:text-base max-w-md mb-6 leading-relaxed">
              Bring your arisan on-chain. Deposits, votes, and payouts — all transparent, immutable, and AI-validated on Celo.
            </p>
            <Link href="/app" className="group inline-flex items-center gap-3 text-black font-medium text-base">
              <span className="w-9 h-9 rounded-full bg-[#86EFAC] flex items-center justify-center group-hover:bg-[#4ADE80] transition-colors">
                <ArrowRight className="w-4 h-4 text-black" />
              </span>
              Get started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
