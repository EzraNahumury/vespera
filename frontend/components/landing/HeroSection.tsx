import { ArrowRight } from "lucide-react";
import Link from "next/link";

const ecosystem = [
  { name: "Celo", style: { fontFamily: "Georgia, serif", fontWeight: 700, letterSpacing: "-0.02em", fontSize: "15px" } },
  { name: "MENTO", style: { fontFamily: "Arial, sans-serif", fontWeight: 900, letterSpacing: "0.08em", fontSize: "13px" } },
  { name: "Uniswap", style: { fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, letterSpacing: "0.01em", fontSize: "15px", fontStyle: "italic" as const } },
  { name: "USDC", style: { fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.12em", fontSize: "13px" } },
  { name: "Valora", style: { fontFamily: "'Palatino','Book Antiqua',serif", fontWeight: 400, letterSpacing: "-0.01em", fontSize: "16px" } },
  { name: "Aave", style: { fontFamily: "'Impact','Arial Narrow',sans-serif", fontWeight: 400, letterSpacing: "0.04em", fontSize: "14px" } },
  { name: "Chainlink", style: { fontFamily: "Verdana, sans-serif", fontWeight: 700, letterSpacing: "-0.03em", fontSize: "13px" } },
];

export function HeroSection() {
  return (
    <div className="flex-1 px-6 pt-20 pb-6 flex items-end">
      <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "calc(100vh - 96px)" }}>
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#86EFAC]/10 z-[1]" />
        <div className="relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
          <h1 className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4" style={{ letterSpacing: "-0.04em" }}>
            Trustless Arisan,<br />On-Chain.
          </h1>
          <p className="text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed">
            AI-governed rotating savings on Celo. Deposit USDC, USDT, or CELO — every payout is validated by multi-agent AI and enforced by smart contracts.
          </p>
          <Link href="/app" className="inline-flex items-center gap-3 bg-[#86EFAC] text-black text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-[#4ADE80] transition-colors duration-200">
            Start a Group
            <span className="bg-black rounded-full p-2"><ArrowRight className="w-5 h-5 text-[#86EFAC]" /></span>
          </Link>
          <div className="mt-24 w-full max-w-md overflow-hidden">
            <div className="marquee-track">
              {[...ecosystem, ...ecosystem].map((item, i) => (
                <span key={i} className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={item.style}>{item.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
