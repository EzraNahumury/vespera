import type { GroupRel } from "@/hooks/useMyGroups";

export type GroupFilterMode = "all" | "created" | "joined";

export const GROUP_FILTERS: { mode: GroupFilterMode; label: string }[] = [
  { mode: "all", label: "All" },
  { mode: "created", label: "Created" },
  { mode: "joined", label: "Joined" },
];

/** Filters a group list by the wallet's relationship (created / joined). */
export function filterGroups(
  groups: `0x${string}`[],
  rel: Record<string, GroupRel>,
  mode: GroupFilterMode,
): `0x${string}`[] {
  if (mode === "all") return groups;
  return groups.filter(g => {
    const r = rel[g.toLowerCase()];
    return mode === "created" ? !!r?.created : !!r?.joined;
  });
}

/** Counts per filter mode, for segment labels. */
export function groupCounts(groups: `0x${string}`[], rel: Record<string, GroupRel>) {
  let created = 0;
  let joined = 0;
  for (const g of groups) {
    const r = rel[g.toLowerCase()];
    if (r?.created) created++;
    if (r?.joined) joined++;
  }
  return { all: groups.length, created, joined };
}
