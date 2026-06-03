import { useReadContract } from "wagmi";
import { CONTRACTS } from "../lib/chain";
import { GroupRegistryABI } from "../abis/GroupRegistry";

export function useAllGroups() {
  return useReadContract({
    address: CONTRACTS.groupRegistry,
    abi: GroupRegistryABI,
    functionName: "allGroups",
  });
}

export function useGroupsCount() {
  return useReadContract({
    address: CONTRACTS.groupRegistry,
    abi: GroupRegistryABI,
    functionName: "groupsCount",
  });
}
