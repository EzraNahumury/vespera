"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAllGroups } from "@/hooks/useGroups";
import { useMyGroups } from "@/hooks/useMyGroups";
import { useReputation } from "@/hooks/useReputation";
import { filterGroups, groupCounts, GROUP_FILTERS, type GroupFilterMode } from "@/lib/groupFilter";
import { GroupCard } from "@/components/app/GroupCard";
import { CreditWallet } from "@/components/app/CreditWallet";
import { ReputationGauge } from "@/components/ui/ReputationGauge";
import { SectionLabel, ButtonLink } from "@/components/ui/primitives";
import { Search, Plus, Users, Wallet, Star, TrendingUp, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    label: "Create a Group",
    sub: "Start a new arisan on-chain",
    href: "/app/create",
    icon: Wallet,
    gradient: "from-[#14532D] to-[#166534]",
    glow: "shadow-[0_4px_24px_rgba(74,222,128,0.25)]",
    iconBg: "bg-[#4ADE80]/20",
    iconColor: "text-[#86EFAC]",
  },
  {
    label: "Browse Groups",
    sub: "Discover & join existing groups",
    href: "/app/groups",
    icon: Users,
    gradient: "from-[#1e3a5f] to-[#1e40af]",
    glow: "shadow-[0_4px_24px_rgba(96,165,250,0.25)]",
    iconBg: "bg-blue-400/20",
    iconColor: "text-blue-300",
  },
  {
    label: "My Reputation",
    sub: "Track your score & badges",
    href: "/app/reputation",
    icon: Star,
    gradient: "from-[#78350f] to-[#92400e]",
    glow: "shadow-[0_4px_24px_rgba(251,191,36,0.25)]",
    iconBg: "bg-amber-400/20",
    iconColor: "text-amber-300",
  },
];

function truncateAddress(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

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
    <div className="min-h-screen animate-fade-up" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl lg:max-w-[72rem] mx-auto px-4 md:px-6 py-8 md:py-10">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14532D] via-[#166534] to-[#15803d] px-8 py-8 mb-8 shadow-xl">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-[#4ADE80]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-[#86EFAC]/15 blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-[#22c55e]/10 blur-2xl pointer-events-none" />

          <div className="relative flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              {isConnected && address ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#86EFAC] shadow-[0_0_8px_#86EFAC]" />
                    <span className="text-xs font-semibold text-[#86EFAC]/80 uppercase tracking-widest">Live on Celo</span>
                    <span className="ml-2 text-xs font-mono text-white/40 bg-white/10 px-2.5 py-0.5 rounded-full">
                      {truncateAddress(address)}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-white tracking-tight leading-none mb-2" style={{ letterSpacing: "-0.025em" }}>
                    Welcome back
                  </h1>
                  <p className="text-base text-white/50 mb-6">Your arisan, on-chain — powered by Vespera.</p>

                  {/* Stat pills */}
                  <div className="flex items-center gap-3">
                    <Link href="/app/reputation"
                      className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-2.5 transition-colors group">
                      <TrendingUp className="w-4 h-4 text-[#86EFAC]" />
                      <div>
                        <p className="text-[10px] text-white/40 leading-none mb-0.5">Reputation</p>
                        <p className="text-sm font-bold text-white leading-none">{score} pts</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 ml-1 group-hover:text-white/50 transition-colors" />
                    </Link>
                    <Link href="/app/groups"
                      className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-2.5 transition-colors group">
                      <Users className="w-4 h-4 text-[#86EFAC]" />
                      <div>
                        <p className="text-[10px] text-white/40 leading-none mb-0.5">Groups</p>
                        <p className="text-sm font-bold text-white leading-none">{allGroups.length} total</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 ml-1 group-hover:text-white/50 transition-colors" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-[#86EFAC]" />
                    <span className="text-xs font-semibold text-[#86EFAC] uppercase tracking-widest">Get Started</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white tracking-tight leading-none mb-2" style={{ letterSpacing: "-0.025em" }}>
                    Arisan, on-chain.
                  </h1>
                  <p className="text-base text-white/50">Connect your wallet to start using Vespera on Celo.</p>
                </>
              )}
            </div>

            {/* Reputation gauge — right side */}
            {isConnected && address && (
              <Link href="/app/reputation"
                className="shrink-0 hover:scale-[1.02] transition-transform hidden lg:block">
                <ReputationGauge score={score} size={260} />
              </Link>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-10">
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map(({ label, sub, href, icon: Icon, gradient, glow, iconBg, iconColor }) => (
              <Link
                key={href}
                href={href}
                className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 ${glow} group`}
              >
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <p className="font-semibold text-white text-base mb-1">{label}</p>
                <p className="text-white/45 text-xs leading-relaxed">{sub}</p>
                <div className="flex items-center gap-1 mt-4 text-xs text-white/30 group-hover:text-white/60 transition-colors">
                  <span>Open</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Credit Wallet ── */}
        {isConnected && (
          <div className="mb-10 max-w-md">
            <SectionLabel>Credit Wallet</SectionLabel>
            <CreditWallet />
          </div>
        )}

        {/* ── Groups Section ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-black text-xl font-bold tracking-tight" style={{ letterSpacing: "-0.01em" }}>All Groups</h2>
            <p className="text-xs text-black/40 mt-0.5">{allGroups.length} arisan group{allGroups.length !== 1 ? "s" : ""} on Vespera</p>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative flex-1 sm:flex-none sm:w-56">
              <Search className="w-4 h-4 text-black/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search address…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full rounded-xl border border-black/[0.08] bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#86EFAC] focus:ring-2 focus:ring-[#86EFAC]/20 transition-all"
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
            <ButtonLink href="/app/create" className="shrink-0 !py-2.5 !rounded-xl">
              <Plus className="w-4 h-4" /> New Group
            </ButtonLink>
          </div>
        </div>

        {/* Created / Joined / All filter */}
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
            <div className="w-16 h-16 rounded-2xl bg-[#86EFAC]/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-[#14532D]" />
            </div>
            <p className="font-semibold text-black/70 text-base mb-1">No groups yet</p>
            <p className="text-black/40 text-sm mb-6">Create the first arisan group on Vespera.</p>
            <ButtonLink href="/app/create" className="!rounded-full">
              <Plus className="w-4 h-4" /> Create Group
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
