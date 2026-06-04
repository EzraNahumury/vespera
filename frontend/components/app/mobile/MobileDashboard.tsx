"use client";
import { useAccount } from "wagmi";
import { useAllGroups } from "@/hooks/useGroups";
import { useReputation } from "@/hooks/useReputation";
import { GroupCard } from "@/components/app/GroupCard";
import { ReputationGauge } from "@/components/ui/ReputationGauge";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export function MobileDashboard() {
  const { address, isConnected } = useAccount();
  const { data: groups, isLoading } = useAllGroups();
  const { data: repData } = useReputation(address);

  const score = repData?.[0]?.result ? Number(repData[0].result) : 0;
  const groupList = (groups as `0x${string}`[] | undefined) ?? [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F2F7" }}>

      {/* Large title */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-3xl font-bold text-black tracking-tight">Dashboard</h1>
      </div>

      {/* Gauge */}
      {isConnected && address ? (
        <div className="px-4 mb-5">
          <Link href="/app/reputation">
            <ReputationGauge score={score} size={500} />
          </Link>
        </div>
      ) : (
        <div className="mx-4 mb-5 rounded-2xl overflow-hidden bg-[#86EFAC]/20 border border-[#86EFAC]/30 px-5 py-6">
          <p className="font-semibold text-[#14532D]">Connect your wallet</p>
          <p className="text-sm text-[#14532D]/60 mt-0.5">to start using Vespera</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 mb-5">
        <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">Quick Actions</p>
        <div className="bg-white rounded-2xl overflow-hidden divide-y divide-black/[0.06]">
          {[
            { label: "Create a Group", sub: "Start a new arisan", href: "/app/create", icon: "💰" },
            { label: "Browse Groups",  sub: "Join an existing group", href: "/app/groups", icon: "👥" },
            { label: "My Reputation",  sub: "View score & badges", href: "/app/reputation", icon: "⭐️" },
          ].map(({ label, sub, href, icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-4 px-4 py-3.5 active:bg-black/5 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#F2F2F7] flex items-center justify-center text-lg shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black">{label}</p>
                <p className="text-xs text-black/40 mt-0.5">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-black/20 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-semibold text-black/40 uppercase tracking-widest">All Groups</p>
          <Link href="/app/create" className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-black/[0.06]">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-black/5 rounded animate-pulse w-3/4" />
                  <div className="h-2.5 bg-black/5 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : groupList.length > 0 ? (
          <div className="space-y-3">
            {groupList.map(addr => <GroupCard key={addr} address={addr} />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl px-4 py-10 text-center">
            <div className="text-4xl mb-3">🏦</div>
            <p className="font-medium text-black/60 text-sm">No groups yet</p>
            <p className="text-xs text-black/35 mt-1 mb-4">Create the first arisan on Celo</p>
            <Link href="/app/create"
              className="inline-flex items-center gap-1.5 bg-[#86EFAC] text-black text-sm font-semibold px-5 py-2 rounded-full">
              <Plus className="w-4 h-4" /> Create Group
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
