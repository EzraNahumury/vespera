import { useAccount } from "wagmi";
import { useAllGroups, useGroupsCount } from "../hooks/useGroups";
import { useReputation } from "../hooks/useReputation";
import { TIER_LABELS, TIER_COLORS, BADGE_LABELS } from "../lib/chain";
import { GroupCard } from "../components/app/GroupCard";
import { ReputationBadge } from "../components/app/ReputationBadge";

export function DashboardPage() {
  const { address } = useAccount();
  const { data: groups, isLoading: loadingGroups } = useAllGroups();
  const { data: repData } = useReputation(address);

  const score = repData?.[0]?.result ? Number(repData[0].result) : 0;
  const tier = repData?.[1]?.result !== undefined ? Number(repData[1].result) : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-10">
      <div className="max-w-[88rem] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-medium text-black tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Dashboard
          </h1>
          <p className="text-black/50 mt-1">Welcome to Vespera — your arisan, on-chain.</p>
        </div>

        {/* Reputation card */}
        {address && (
          <div className="mb-10 rounded-2xl bg-[#14532D] p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/60 text-sm mb-1">Your Reputation Score</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-medium text-white" style={{ letterSpacing: "-0.04em" }}>
                  {score}
                </span>
                <span className="text-white/50 text-lg mb-1">/ 1000</span>
              </div>
              <span
                className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: TIER_COLORS[tier], color: "#000" }}
              >
                {TIER_LABELS[tier]}
              </span>
            </div>
            {/* Progress bar */}
            <div className="flex-1 md:max-w-xs">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#86EFAC] transition-all duration-500"
                  style={{ width: `${score / 10}%` }}
                />
              </div>
              <p className="text-white/40 text-xs mt-2">
                {1000 - score} points to next tier
              </p>
            </div>
          </div>
        )}

        {/* Badges */}
        {address && (
          <div className="mb-10">
            <h2 className="text-black text-xl font-medium mb-4">Badges</h2>
            <div className="flex flex-wrap gap-3">
              {BADGE_LABELS.map((label, i) => (
                <ReputationBadge key={i} label={label} earned={false} />
              ))}
            </div>
          </div>
        )}

        {/* Groups */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-black text-xl font-medium">All Groups</h2>
            <a
              href="#create"
              className="inline-flex items-center gap-2 bg-[#86EFAC] text-black text-sm font-medium px-5 py-2 rounded-full hover:bg-[#4ADE80] transition-colors"
            >
              + New Group
            </a>
          </div>

          {loadingGroups ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-white/50 h-40 animate-pulse" />
              ))}
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(groups as `0x${string}`[]).map((addr) => (
                <GroupCard key={addr} address={addr} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-black/10 p-12 text-center">
              <p className="text-black/40 text-lg">No groups yet.</p>
              <p className="text-black/30 text-sm mt-1">Create the first arisan group on Vespera.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
