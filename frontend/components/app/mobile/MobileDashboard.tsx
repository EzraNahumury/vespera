"use client";
import { useAccount } from "wagmi";
import { useAllGroups } from "@/hooks/useGroups";
import { useReputation } from "@/hooks/useReputation";
import { TIER_LABELS, TIER_COLORS, BADGE_LABELS } from "@/lib/chain";
import { GroupCard } from "@/components/app/GroupCard";
import { Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

export function MobileDashboard() {
  const { address, isConnected } = useAccount();
  const { data: groups, isLoading } = useAllGroups();
  const { data: repData } = useReputation(address);

  const score = repData?.[0]?.result ? Number(repData[0].result) : 0;
  const tier = repData?.[1]?.result !== undefined ? Number(repData[1].result) : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Reputation hero */}
      {isConnected && address ? (
        <div className="bg-[#14532D] px-5 pt-6 pb-8">
          <p className="text-white/50 text-xs mb-1">Your Reputation</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-5xl font-medium text-white" style={{ letterSpacing: "-0.04em" }}>{score}</span>
            <span className="text-white/40 mb-1">/ 1000</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
            <div className="h-full rounded-full bg-[#86EFAC] transition-all" style={{ width: `${score / 10}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: TIER_COLORS[tier], color: "#000" }}>
              {TIER_LABELS[tier]}
            </span>
            <span className="text-white/30 text-xs">{1000 - score} pts to next tier</span>
          </div>
          {/* Badges row */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {BADGE_LABELS.map((label, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                <Shield className="w-3 h-3" />{label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#86EFAC] px-5 py-6">
          <p className="text-black text-lg font-medium">Welcome to Vespera</p>
          <p className="text-black/60 text-sm mt-1">Connect your wallet to get started.</p>
        </div>
      )}

      <div className="px-4 pt-5 space-y-5">
        {/* New group CTA */}
        <Link href="/app/create" className="flex items-center justify-between bg-[#86EFAC] rounded-2xl px-5 py-4">
          <div>
            <p className="text-black font-medium">Start a Group</p>
            <p className="text-black/60 text-sm">Create your arisan on Celo</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black/60" />
        </Link>

        {/* Groups list */}
        <div>
          <p className="text-black/50 text-xs font-medium uppercase tracking-wider mb-3">All Groups</p>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-2xl bg-white h-24 animate-pulse" />)}</div>
          ) : groups && (groups as `0x${string}`[]).length > 0 ? (
            <div className="space-y-3">
              {(groups as `0x${string}`[]).map(addr => <GroupCard key={addr} address={addr} />)}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-black/10 p-8 text-center">
              <p className="text-black/40">No groups yet</p>
              <p className="text-black/25 text-sm mt-1">Be the first to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
