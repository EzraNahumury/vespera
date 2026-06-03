import { useReadContracts } from "wagmi";
import { CONTRACTS } from "../lib/chain";
import { ReputationRegistryABI } from "../abis/ReputationRegistry";

export function useReputation(address?: `0x${string}`) {
  return useReadContracts({
    contracts: [
      {
        address: CONTRACTS.reputationRegistry,
        abi: ReputationRegistryABI,
        functionName: "scoreOf",
        args: address ? [address] : undefined,
      },
      {
        address: CONTRACTS.reputationRegistry,
        abi: ReputationRegistryABI,
        functionName: "tierOf",
        args: address ? [address] : undefined,
      },
    ],
    query: { enabled: !!address },
  });
}
