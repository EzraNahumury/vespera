"use client";
import { useAccount } from "wagmi";
import { useReputation } from "@/hooks/useReputation";
import { TIER_LABELS, TIER_COLORS, BADGE_LABELS } from "@/lib/chain";
import { Shield } from "lucide-react";

function ReputationContent() {
  const { address, isConnected } = useAccount();
  const { data } = useReputation(address);
  const score = data?.[0]?.result ? Number(data[0].result) : 0;
  const tier = data?.[1]?.result !== undefined ? Number(data[1].result) : 0;

  if (!isConnected) return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="text-center">
        <p className="text-black/50 text-lg">Connect your wallet to view your reputation.</p>
      </div>
    </div>
  );

  return (
    <div className="px-6 py-10 max-w-[88rem] mx-auto w-full">
      <h1 className="text-4xl font-medium text-black mb-8" style={{ letterSpacing: "-0.03em" }}>Reputation</h1>

      {/* Score card */}
      <div className="rounded-2xl bg-[#14532D] p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-white/50 text-sm mb-2">Your Score</p>
            <div className="flex items-end gap-3">
              <span className="text-7xl font-medium text-white" style={{ letterSpacing: "-0.04em" }}>{score}</span>
              <span className="text-white/40 text-xl mb-2">/ 1000</span>
            </div>
            <span className="inline-block mt-3 text-sm font-medium px-4 py-1.5 rounded-full" style={{ backgroundColor: TIER_COLORS[tier], color: "#000" }}>
              {TIER_LABELS[tier]}
            </span>
          </div>
          <div className="flex-1 md:max-w-xs">
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-[#86EFAC] transition-all duration-700" style={{ width: `${score / 10}%` }} />
            </div>
            <p className="text-white/30 text-sm mt-2">{1000 - score} points to next tier</p>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {TIER_LABELS.map((label, i) => (
          <div key={label} className={`rounded-2xl p-5 border-2 transition-colors ${tier === i ? "border-black/20" : "border-transparent"} bg-white`}>
            <div className="w-8 h-8 rounded-full mb-3" style={{ backgroundColor: TIER_COLORS[i] }} />
            <p className="font-medium text-black">{label}</p>
            <p className="text-black/40 text-xs mt-1">{[0,251,501,751][i]}–{[250,500,750,1000][i]} pts</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <h2 className="text-black text-xl font-medium mb-4">Soulbound Badges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGE_LABELS.map((label, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 border border-black/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-black/30" />
            </div>
            <div>
              <p className="font-medium text-black text-sm">{label}</p>
              <p className="text-black/30 text-xs mt-0.5">Not yet earned</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReputationPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 md:pb-0">
      <ReputationContent />
    </div>
  );
}
