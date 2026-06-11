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
import { SectionLabel, ListCard, ButtonLink } from "@/components/ui/primitives";
import { ChevronRight, Plus, Search, Wallet, Users, Star, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    label: "Create a Group",
    sub: "Start a new arisan",
    href: "/app/create",
    icon: Wallet,
    gradient: "from-[#14532D] to-[#166534]",
    iconBg: "bg-[#22c55e]/20",
    iconColor: "text-[#86EFAC]",
  },
  {
    label: "Browse Groups",
    sub: "Join an existing group",
    href: "/app/groups",
    icon: Users,
    gradient: "from-[#1e3a5f] to-[#1e40af]",
    iconBg: "bg-blue-400/20",
    iconColor: "text-blue-300",
  },
  {
    label: "My Reputation",
    sub: "View score & badges",
    href: "/app/reputation",
    icon: Star,
    gradient: "from-[#78350f] to-[#92400e]",
    iconBg: "bg-amber-400/20",
    iconColor: "text-amber-300",
  },
];

function truncateAddress(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export function MobileDashboard() {
  const { address, isConnected } = useAccount();
  const { data: groups, isLoading } = useAllGroups();
  const { data: repData } = useReputation(address);
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<GroupFilterMode>("all");

  const score = repData?.[0]?.result ? Number(repData[0].result) : 0;
  const allGroups = (groups as `0x${string}`[] | undefined) ?? [];
  const { rel } = useMyGroups(allGroups);
  const counts = groupCounts(allGroups, rel);
  const scoped = filterGroups(allGroups, rel, filterMode);
  const groupList = query ? scoped.filter(a => a.toLowerCase().includes(query.toLowerCase())) : scoped;

  return (
    <div className="min-h-screen animate-fade-up" style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden px-4 pt-5 pb-6 mb-2">
        {/* gradient blobs */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-[#86EFAC]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-[#4ADE80]/20 blur-2xl pointer-events-none" />

        <div className="relative">
          {isConnected && address ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
                <span className="text-xs font-medium text-black/40">Connected</span>
                <span className="ml-auto text-xs font-mono font-medium text-black/50 bg-black/5 px-2.5 py-0.5 rounded-full">
                  {truncateAddress(address)}
                </span>
              </div>
              <h1 className="text-[2rem] font-bold text-black tracking-tight leading-none mb-1" style={{ letterSpacing: "-0.025em" }}>
                Welcome back
              </h1>
              <p className="text-sm text-black/40">Your arisan dashboard</p>

              {/* Stats row */}
              <div className="flex gap-2 mt-4">
                <Link href="/app/reputation" className="flex-1 bg-white rounded-2xl card-shadow px-3.5 py-3 flex items-center gap-2.5 active:scale-[0.97] transition-transform">
                  <div className="w-8 h-8 rounded-xl bg-[#86EFAC]/25 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#14532D]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-black/40 leading-none mb-0.5">Reputation</p>
                    <p className="text-sm font-bold text-black leading-none">{score}<span className="text-xs font-normal text-black/40"> pts</span></p>
                  </div>
                </Link>
                <Link href="/app/groups" className="flex-1 bg-white rounded-2xl card-shadow px-3.5 py-3 flex items-center gap-2.5 active:scale-[0.97] transition-transform">
                  <div className="w-8 h-8 rounded-xl bg-[#86EFAC]/25 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#14532D]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-black/40 leading-none mb-0.5">Groups</p>
                    <p className="text-sm font-bold text-black leading-none">{allGroups.length}<span className="text-xs font-normal text-black/40"> total</span></p>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-[#14532D] to-[#166534] rounded-2xl px-5 py-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#86EFAC]" />
                <span className="text-xs font-semibold text-[#86EFAC] uppercase tracking-widest">Get Started</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight leading-snug mb-1">Connect your wallet</h1>
              <p className="text-sm text-white/60 mb-4">to start using Vespera on Celo</p>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 text-xs text-white/70">
                <div className="w-2 h-2 rounded-full bg-[#86EFAC] animate-pulse" />
                Waiting for connection…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reputation gauge (connected only) */}
      {isConnected && address && (
        <div className="px-4 mb-5">
          <Link href="/app/reputation" className="block active:scale-[0.99] transition-transform">
            <ReputationGauge score={score} size={500} />
          </Link>
        </div>
      )}

      {/* ── Credit Wallet ── */}
      {isConnected && (
        <div className="px-4 mb-6">
          <SectionLabel>Credit Wallet</SectionLabel>
          <CreditWallet />
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="px-4 mb-6">
        <SectionLabel>Quick Actions</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {quickActions.map(({ label, sub, href, icon: Icon, gradient, iconBg, iconColor }) => (
            <Link
              key={href}
              href={href}
              className={`bg-gradient-to-r ${gradient} rounded-2xl px-4 py-4 flex items-center gap-4 active:scale-[0.97] transition-all shadow-sm`}
            >
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/50 mt-0.5">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── All Groups ── */}
      <div className="px-4 pb-8">
        <div className="flex items-center justify-between mb-2 px-1">
          <SectionLabel className="mb-0 px-0">All Groups</SectionLabel>
          <Link href="/app/create" className="flex items-center gap-1 text-xs font-semibold text-[#16A34A] bg-[#86EFAC]/20 px-2.5 py-1 rounded-full">
            <Plus className="w-3 h-3" /> New
          </Link>
        </div>

        {isConnected && allGroups.length > 0 && (
          <div className="flex bg-black/[0.05] rounded-xl p-1 gap-1 mb-3">
            {GROUP_FILTERS.map(({ mode, label }) => (
              <button key={mode} onClick={() => setFilterMode(mode)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  filterMode === mode ? "bg-white text-black shadow-sm" : "text-black/50"
                }`}>
                {label} <span className="text-black/30 font-medium">{counts[mode]}</span>
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
              className="w-full bg-white rounded-xl pl-9 pr-4 py-3 text-sm outline-none placeholder:text-black/25 card-shadow focus:ring-2 focus:ring-[#86EFAC]/50 transition-shadow"
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
        ) : filterMode !== "all" && counts[filterMode] === 0 ? (
          <div className="bg-white rounded-2xl card-shadow px-4 py-10 text-center">
            <div className="text-4xl mb-3">{filterMode === "created" ? "🏗️" : "🤝"}</div>
            <p className="font-semibold text-black/60 text-sm">
              {filterMode === "created" ? "No groups created yet" : "No groups joined yet"}
            </p>
            <p className="text-xs text-black/35 mt-1 mb-4">
              {filterMode === "created" ? "Start your own arisan" : "Join one you're invited to"}
            </p>
            <ButtonLink href={filterMode === "created" ? "/app/create" : "/app/groups"} className="!rounded-full">
              {filterMode === "created" ? <><Plus className="w-4 h-4" /> Create Group</> : "Browse Groups"}
            </ButtonLink>
          </div>
        ) : allGroups.length > 0 ? (
          <div className="bg-white rounded-2xl card-shadow px-4 py-8 text-center">
            <p className="text-sm text-black/40">No groups match &ldquo;{query}&rdquo;.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl card-shadow px-4 py-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#86EFAC]/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-[#14532D]" />
            </div>
            <p className="font-semibold text-black text-sm">No groups yet</p>
            <p className="text-xs text-black/35 mt-1 mb-5">Create the first arisan on Celo</p>
            <ButtonLink href="/app/create" className="!rounded-full">
              <Plus className="w-4 h-4" /> Create Group
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
