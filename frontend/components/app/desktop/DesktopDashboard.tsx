"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAllGroups } from "@/hooks/useGroups";
import { useMyGroups } from "@/hooks/useMyGroups";
import { useReputation } from "@/hooks/useReputation";
import { filterGroups, groupCounts, GROUP_FILTERS, type GroupFilterMode } from "@/lib/groupFilter";
import { GroupCard } from "@/components/app/GroupCard";
import { ReputationGauge } from "@/components/ui/ReputationGauge";
import { PageContainer, PageHeader, SectionLabel, ButtonLink } from "@/components/ui/primitives";
import { Search, Plus, Users, Wallet, Star, ChevronRight } from "lucide-react";
import Link from "next/link";

const quickActions = [
  { label: "Create a Group", sub: "Start a new arisan", href: "/app/create", icon: Wallet },
  { label: "Browse Groups", sub: "Join an existing group", href: "/app/groups", icon: Users },
  { label: "My Reputation", sub: "Score & badges", href: "/app/reputation", icon: Star },
];

export function DesktopDashboard() {
  const { address, isConnected } = useAccount();
  const { data: groups, isLoading } = useAllGroups();
  const { data: repData } = useReputation(address);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "az" | "za">("default");
  const [filterMode, setFilterMode] = useState<GroupFilterMode>("all");

  const score = repData?.[0]?.result ? Number(repData[0].result) : 0;

  const allGroups = (groups as `0x${string}`[] | undefined) ?? [];
  const { rel } = useMyGroups(allGroups);
  const counts = groupCounts(allGroups, rel);
  const scoped = filterGroups(allGroups, rel, filterMode);
  const searched = query ? scoped.filter(a => a.toLowerCase().includes(query.toLowerCase())) : scoped;
  const filtered = sort === "default" ? searched
    : [...searched].sort((a, b) => (sort === "az" ? a.localeCompare(b) : b.localeCompare(a)));

  return (
    <PageContainer>
      <PageHeader title="Dashboard" subtitle="Welcome to Vespera — your arisan, on-chain." />

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 mb-10 items-start">
        {/* Reputation gauge */}
        {isConnected && address && (
          <Link href="/app/reputation" className="transition-transform hover:scale-[1.01]">
            <ReputationGauge score={score} size={340} />
          </Link>
        )}

        {/* Quick actions */}
        <div>
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map(({ label, sub, href, icon: Icon }) => (
              <Link key={href} href={href}
                className="bg-white rounded-2xl card-shadow p-5 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-xl bg-[#86EFAC]/25 flex items-center justify-center mb-3 group-hover:bg-[#86EFAC] transition-colors">
                  <Icon className="w-5 h-5 text-[#14532D]" />
                </div>
                <p className="font-semibold text-black text-sm">{label}</p>
                <p className="text-black/40 text-xs mt-0.5">{sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-black text-xl font-semibold shrink-0">All Groups</h2>
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="w-4 h-4 text-black/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search address…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#86EFAC] transition-colors"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as "default" | "az" | "za")}
            className="rounded-xl border border-black/[0.08] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#86EFAC] shrink-0"
          >
            <option value="default">Default</option>
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
          </select>
          <ButtonLink href="/app/create" className="shrink-0 !py-2.5">
            <Plus className="w-4 h-4" /> New
          </ButtonLink>
        </div>
      </div>

      {/* Created / Joined / All filter — needs a wallet to classify */}
      {isConnected && (
        <div className="inline-flex bg-black/[0.05] rounded-xl p-1 gap-1 mb-4">
          {GROUP_FILTERS.map(({ mode, label }) => (
            <button key={mode} onClick={() => setFilterMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filterMode === mode ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"
              }`}>
              {label} <span className="text-black/30 font-medium">{counts[mode]}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="rounded-2xl bg-white card-shadow h-24 animate-pulse" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(addr => <GroupCard key={addr} address={addr} />)}
        </div>
      ) : filterMode !== "all" && counts[filterMode] === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 text-center">
          <div className="text-4xl mb-3">{filterMode === "created" ? "🏗️" : "🤝"}</div>
          <p className="font-semibold text-black/70">
            {filterMode === "created" ? "You haven't created any groups yet." : "You haven't joined any groups yet."}
          </p>
          <p className="text-black/40 text-sm mt-1 mb-5">
            {filterMode === "created" ? "Start your own arisan." : "Browse groups and join one you're invited to."}
          </p>
          <ButtonLink href={filterMode === "created" ? "/app/create" : "/app/groups"}>
            {filterMode === "created" ? <><Plus className="w-4 h-4" /> Create Group</> : "Browse Groups"}
          </ButtonLink>
        </div>
      ) : allGroups.length > 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 text-center">
          <p className="text-black/40">No groups match &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow p-14 text-center">
          <div className="text-5xl mb-4">🏦</div>
          <p className="font-semibold text-black/70">No groups yet</p>
          <p className="text-black/40 text-sm mt-1 mb-5">Create the first arisan group on Vespera.</p>
          <ButtonLink href="/app/create"><Plus className="w-4 h-4" /> Create Group</ButtonLink>
        </div>
      )}
    </PageContainer>
  );
}
