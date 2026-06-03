"use client";
import { useAccount } from "wagmi";
import { useAllGroups } from "@/hooks/useGroups";
import { useReputation } from "@/hooks/useReputation";
import { GroupCard } from "@/components/app/GroupCard";
import { ReputationGauge } from "@/components/ui/ReputationGauge";
import Link from "next/link";

export function DesktopDashboard() {
  const { address, isConnected } = useAccount();
  const { data: groups, isLoading } = useAllGroups();
  const { data: repData } = useReputation(address);

  const score = repData?.[0]?.result ? Number(repData[0].result) : 0;
  const tier = repData?.[1]?.result !== undefined ? Number(repData[1].result) : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-10">
      <div className="max-w-[88rem] mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-medium text-black tracking-tight" style={{ letterSpacing: "-0.03em" }}>Dashboard</h1>
          <p className="text-black/50 mt-1">Welcome to Vespera — your arisan, on-chain.</p>
        </div>

        {isConnected && address && (
          <div className="mb-10 flex justify-start">
            <Link href="/app/reputation">
              <ReputationGauge score={score} size={320} />
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-black text-xl font-medium">All Groups</h2>
          <Link href="/app/create" className="inline-flex items-center gap-2 bg-[#86EFAC] text-black text-sm font-medium px-5 py-2 rounded-full hover:bg-[#4ADE80] transition-colors">
            + New Group
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="rounded-2xl bg-white/50 h-40 animate-pulse" />)}
          </div>
        ) : groups && (groups as `0x${string}`[]).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(groups as `0x${string}`[]).map(addr => <GroupCard key={addr} address={addr} />)}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-black/10 p-16 text-center">
            <p className="text-black/40 text-lg">No groups yet.</p>
            <p className="text-black/30 text-sm mt-1">Create the first arisan group on Vespera.</p>
            <Link href="/app/create" className="inline-block mt-4 bg-[#86EFAC] text-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#4ADE80] transition-colors">
              Create Group
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
