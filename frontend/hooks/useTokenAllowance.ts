"use client";
import { useReadContract } from "wagmi";
import { ERC20ABI } from "@/abis/ERC20";

/**
 * Reads the ERC-20 allowance an owner has granted to a spender.
 * Returns the raw allowance (bigint) plus refetch — used after an approve
 * tx confirms to re-check whether the deposit is now unblocked.
 */
export function useTokenAllowance(
  token?: `0x${string}`,
  owner?: `0x${string}`,
  spender?: `0x${string}`,
) {
  const enabled = !!token && !!owner && !!spender;
  const { data, isLoading, refetch } = useReadContract({
    address: token,
    abi: ERC20ABI,
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    query: { enabled },
  });

  return { allowance: data as bigint | undefined, isLoading, refetch };
}
