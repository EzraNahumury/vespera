"use client";
import { useReadContracts, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/chain";
import { GroupRegistryABI, ArisanGroupABI } from "vespera-sdk";

export type GroupRel = { created: boolean; joined: boolean };

/**
 * Classifies each group in `groups` relative to the connected wallet:
 * created-by-me and/or joined-by-me. The registry has no per-creator index,
 * so we read groupCreator(group) + isMember(group, wallet) for each one in a
 * single multicall (creator reads first, then member reads).
 *
 * Returns a lookup keyed by lowercased group address.
 */
export function useMyGroups(groups?: `0x${string}`[]) {
  const { address } = useAccount();
  const list = groups ?? [];
  const enabled = !!address && list.length > 0;

  const { data, isLoading } = useReadContracts({
    contracts: enabled
      ? [
          ...list.map(g => ({
            address: CONTRACTS.groupRegistry,
            abi: GroupRegistryABI,
            functionName: "groupCreator" as const,
            args: [g] as const,
          })),
          ...list.map(g => ({
            address: g,
            abi: ArisanGroupABI,
            functionName: "isMember" as const,
            args: [address!] as const,
          })),
        ]
      : [],
    query: { enabled },
  });

  const n = list.length;
  const rel: Record<string, GroupRel> = {};
  list.forEach((g, i) => {
    const creator = data?.[i]?.result as `0x${string}` | undefined;
    const member = data?.[n + i]?.result as boolean | undefined;
    rel[g.toLowerCase()] = {
      created: !!creator && !!address && creator.toLowerCase() === address.toLowerCase(),
      joined: !!member,
    };
  });

  return { rel, isLoading };
}
