import { ArrowRight } from "lucide-react";

export function UseCasesSection() {
  return (
    <section className="bg-[#F5F5F5] px-6 py-24">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left column */}
        <div className="md:pr-12 md:pt-2">
          <p className="text-black/60 text-sm mb-2">Vespera in Practice</p>
          <h2
            className="text-5xl md:text-6xl font-medium leading-none mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Use cases
          </h2>
          <p className="text-black/60 text-base leading-relaxed max-w-sm">
            Vespera works for any rotating savings group — from family circles and community pools to workplace savings clubs. Anyone with a Celo wallet can participate.
          </p>
        </div>

        {/* Right column: video card */}
        <div className="relative rounded-3xl overflow-hidden min-h-[720px]">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
              type="video/mp4"
            />
          </video>

          {/* Green tint */}
          <div className="absolute inset-0 bg-[#86EFAC]/10" />

          {/* Overlay content */}
          <div className="relative z-10 p-10 md:p-12">
            <h3
              className="text-4xl md:text-5xl font-medium leading-tight mb-5"
              style={{ letterSpacing: "-0.03em" }}
            >
              Community Groups
            </h3>
            <p className="text-black/70 text-base max-w-md mb-8 leading-relaxed">
              Bring your arisan group on-chain. Each member deposits USDm, USDC, or USDT every round. When it's your turn, AI validates your request and your group votes — all transparent, all immutable.
            </p>

            <a
              href="#"
              className="group inline-flex items-center gap-3 text-black font-medium text-base"
            >
              <span className="w-9 h-9 rounded-full bg-[#86EFAC] flex items-center justify-center group-hover:bg-[#4ADE80] transition-colors">
                <ArrowRight className="w-4 h-4 text-black" />
              </span>
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
