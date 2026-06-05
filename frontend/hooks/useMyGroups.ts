"use client";
import { useReadContracts, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/chain";
import { GroupRegistryABI } from "@/abis/GroupRegistry";

export type GroupRel = { created: boolean; joined: boolean };

/**
 * Classifies each group in `groups` relative to the connected wallet:
 * created-by-me and/or joined-by-me. The registry has no per-creator index,
 * so we read groupCreator(group) for each one via a single multicall.
 *
 * Returns a lookup keyed by lowercased group address.
 */
export function useMyGroups(groups?: `0x${string}`[]) {
  const { address } = useAccount();
  const list = groups ?? [];
  const enabled = !!address && list.length > 0;

  const { data, isLoading } = useReadContracts({
    contracts: enabled
      ? list.map(g => ({
          address: CONTRACTS.groupRegistry,
          abi: GroupRegistryABI,
          functionName: "groupCreator" as const,
          args: [g] as const,
        }))
      : [],
    query: { enabled },
  });

  const rel: Record<string, GroupRel> = {};
  list.forEach((g, i) => {
    const creator = data?.[i]?.result as `0x${string}` | undefined;
    rel[g.toLowerCase()] = {
      created: !!creator && !!address && creator.toLowerCase() === address.toLowerCase(),
      joined: false,
    };
  });

  return { rel, isLoading };
}
