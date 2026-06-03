"use client";
import { useAccount } from "wagmi";
import { useReputation } from "@/hooks/useReputation";
import { TIER_LABELS, TIER_COLORS, BADGE_LABELS } from "@/lib/chain";
import { Shield } from "lucide-react";
import { ReputationGauge } from "@/components/ui/ReputationGauge";

const TIER_BG = ["#1A0F00", "#111318", "#1A1400", "#001A0A"];
const BADGE_DESCS = [
  "Make 12+ on-time deposits",
  "Reach ≥80% vote agreement rate",
  "Found a group with ≥5 active members",
  "Stay 6 months without a penalty",
  "Be active in 3+ groups simultaneously",
];

function ReputationContent() {
  const { address, isConnected } = useAccount();
  const { data } = useReputation(address);
  const score = data?.[0]?.result ? Number(data[0].result) : 0;
  const tier = data?.[1]?.result !== undefined ? Number(data[1].result) : 0;

  if (!isConnected) return (
    <div className="flex-1 flex items-center justify-center p-10">
      <p className="text-black/50 text-lg">Connect your wallet to view your reputation.</p>
    </div>
  );

  return (
    <div className="px-4 md:px-6 py-10 max-w-[88rem] mx-auto w-full">
      <h1 className="text-4xl font-medium text-black mb-10" style={{ letterSpacing: "-0.03em" }}>
        Reputation
      </h1>

      {/* Top section: gauge + tier cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Gauge */}
        <div className="flex justify-center lg:justify-start">
          <ReputationGauge score={score} size={340} />
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-2 gap-3 content-start">
          {TIER_LABELS.map((label, i) => {
            const active = tier === i;
            return (
              <div
                key={label}
                className="rounded-2xl p-5 border-2 transition-all duration-200"
                style={{
                  backgroundColor: active ? TIER_BG[i] : "#fff",
                  borderColor: active ? TIER_COLORS[i] : "transparent",
                  boxShadow: active ? `0 0 20px ${TIER_COLORS[i]}33` : undefined,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full mb-3 flex items-center justify-center"
                  style={{ backgroundColor: TIER_COLORS[i] }}
                >
                  {active && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-pulse" />
                  )}
                </div>
                <p
                  className="font-medium text-sm"
                  style={{ color: active ? TIER_COLORS[i] : "#000" }}
                >
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: active ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}>
                  {[0,251,501,751][i]}–{[250,500,750,1000][i]} pts
                </p>
                {active && (
                  <p className="text-xs mt-2 font-medium" style={{ color: TIER_COLORS[i] }}>
                    ← Current tier
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="rounded-2xl bg-white border border-black/5 p-6 mb-6">
        <h2 className="text-black font-medium mb-5">Score Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: "Deposit Consistency", weight: 40, score: score * 0.4 },
            { label: "Voting Participation", weight: 20, score: score * 0.2 },
            { label: "Vote Quality", weight: 15, score: score * 0.15 },
            { label: "Group Tenure", weight: 10, score: score * 0.1 },
            { label: "Badge Count", weight: 10, score: score * 0.1 },
            { label: "Cross-Group Penalties", weight: 5, score: score * 0.05 },
          ].map(({ label, weight, score: sub }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-black/60">{label}</span>
                <span className="font-medium text-black">{weight}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(sub / (weight * 10)) * 100}%`,
                    backgroundColor: TIER_COLORS[tier],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Soulbound Badges */}
      <h2 className="text-black text-xl font-medium mb-4">Soulbound Badges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BADGE_LABELS.map((label, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-5 border border-black/5 flex items-center gap-4 hover:border-black/10 transition-colors"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            >
              <Shield className="w-5 h-5 text-black/25" />
            </div>
            <div>
              <p className="font-medium text-black text-sm">{label}</p>
              <p className="text-black/35 text-xs mt-0.5 leading-relaxed">{BADGE_DESCS[i]}</p>
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
