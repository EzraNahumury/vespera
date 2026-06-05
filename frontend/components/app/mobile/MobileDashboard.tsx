"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAllGroups } from "@/hooks/useGroups";
import { useMyGroups } from "@/hooks/useMyGroups";
import { useReputation } from "@/hooks/useReputation";
import { filterGroups, GROUP_FILTERS, type GroupFilterMode } from "@/lib/groupFilter";
import { GroupCard } from "@/components/app/GroupCard";
import { ReputationGauge } from "@/components/ui/ReputationGauge";
import { SectionLabel, ListCard, ButtonLink } from "@/components/ui/primitives";
import { ChevronRight, Plus, Search, Wallet, Users, Star } from "lucide-react";
import Link from "next/link";

const quickActions = [
  { label: "Create a Group", sub: "Start a new arisan", href: "/app/create", icon: Wallet },
  { label: "Browse Groups", sub: "Join an existing group", href: "/app/groups", icon: Users },
  { label: "My Reputation", sub: "View score & badges", href: "/app/reputation", icon: Star },
];

export function MobileDashboard() {
  const { address, isConnected } = useAccount();
  const { data: groups, isLoading } = useAllGroups();
  const { data: repData } = useReputation(address);
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<GroupFilterMode>("all");

  const score = repData?.[0]?.result ? Number(repData[0].result) : 0;
  const allGroups = (groups as `0x${string}`[] | undefined) ?? [];
  const { rel } = useMyGroups(allGroups);
  const scoped = filterGroups(allGroups, rel, filterMode);
  const groupList = query ? scoped.filter(a => a.toLowerCase().includes(query.toLowerCase())) : scoped;

  return (
    <div className="min-h-screen animate-fade-up" style={{ backgroundColor: "var(--bg)" }}>
      {/* Large title */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-3xl font-bold text-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>Home</h1>
      </div>

      {/* Gauge / connect prompt */}
      {isConnected && address ? (
        <div className="px-4 mb-6">
          <Link href="/app/reputation" className="block">
            <ReputationGauge score={score} size={500} />
          </Link>
        </div>
      ) : (
        <div className="mx-4 mb-6 rounded-2xl bg-[#86EFAC]/20 border border-[#86EFAC]/30 px-5 py-6">
          <p className="font-semibold text-[#14532D]">Connect your wallet</p>
          <p className="text-sm text-[#14532D]/60 mt-0.5">to start using Vespera</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 mb-6">
        <SectionLabel>Quick Actions</SectionLabel>
        <ListCard>
          {quickActions.map(({ label, sub, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-4 px-4 py-3.5 active:bg-black/5 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#86EFAC]/25 flex items-center justify-center shrink-0">
                <Icon className="w-[18px] h-[18px] text-[#14532D]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black">{label}</p>
                <p className="text-xs text-black/40 mt-0.5">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-black/20 shrink-0" />
            </Link>
          ))}
        </ListCard>
      </div>

      {/* Groups */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <SectionLabel className="mb-0 px-0">All Groups</SectionLabel>
          <Link href="/app/create" className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
            <Plus className="w-3.5 h-3.5" /> New
          </Link>
        </div>

        {isConnected && allGroups.length > 0 && (
          <div className="flex bg-black/[0.05] rounded-xl p-1 gap-1 mb-3">
            {GROUP_FILTERS.map(({ mode, label }) => (
              <button key={mode} onClick={() => setFilterMode(mode)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  filterMode === mode ? "bg-white text-black shadow-sm" : "text-black/50"
                }`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {allGroups.length > 0 && (
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-black/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by address…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none placeholder:text-black/25 card-shadow"
            />
          </div>
        )}

        {isLoading ? (
          <ListCard>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-black/5 rounded animate-pulse w-3/4" />
                  <div className="h-2.5 bg-black/5 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </ListCard>
        ) : groupList.length > 0 ? (
          <div className="space-y-3">
            {groupList.map(addr => <GroupCard key={addr} address={addr} />)}
          </div>
        ) : allGroups.length > 0 ? (
          <div className="bg-white rounded-2xl card-shadow px-4 py-8 text-center">
            <p className="text-sm text-black/40">No groups match &ldquo;{query}&rdquo;.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl card-shadow px-4 py-10 text-center">
            <div className="text-4xl mb-3">🏦</div>
            <p className="font-semibold text-black/60 text-sm">No groups yet</p>
            <p className="text-xs text-black/35 mt-1 mb-4">Create the first arisan on Celo</p>
            <ButtonLink href="/app/create" className="!rounded-full"><Plus className="w-4 h-4" /> Create Group</ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
