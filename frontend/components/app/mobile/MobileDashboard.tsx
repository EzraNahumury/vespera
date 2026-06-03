"use client";
import { useAccount } from "wagmi";
import { useAllGroups } from "@/hooks/useGroups";
import { useReputation } from "@/hooks/useReputation";
import { GroupCard } from "@/components/app/GroupCard";
import { ReputationGauge } from "@/components/ui/ReputationGauge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function MobileDashboard() {
  const { address, isConnected } = useAccount();
  const { data: groups, isLoading } = useAllGroups();
  const { data: repData } = useReputation(address);

  const score = repData?.[0]?.result ? Number(repData[0].result) : 0;
  const tier = repData?.[1]?.result !== undefined ? Number(repData[1].result) : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Reputation gauge hero */}
      {isConnected && address ? (
        <div className="flex justify-center pt-4 pb-2 px-4">
          <Link href="/app/reputation" className="w-full">
            <ReputationGauge score={score} size={400} />
          </Link>
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
