"use client";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { TreasuryABI } from "@/abis/Treasury";
import { CONTRACTS } from "@/lib/chain";

/**
 * Reads a group's pooled balance held in the Treasury for a given token.
 * ArisanGroup.requestWithdrawal reverts with InsufficientPot when the
 * requested amount exceeds this — so the UI gates against it.
 *
 * @param group  the ArisanGroup address
 * @param token  the depositToken
 * @param decimals token decimals for the formatted display (default 18)
 */
export function useTreasuryPot(group?: `0x${string}`, token?: `0x${string}`, decimals = 18) {
  const enabled = !!group && !!token;
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.treasury,
    abi: TreasuryABI,
    functionName: "balanceOf",
    args: group && token ? [group, token] : undefined,
    query: { enabled },
  });

  const pot = data as bigint | undefined;
  const potFmt = pot !== undefined ? formatUnits(pot, decimals) : undefined;
  return { pot, potFmt, isLoading, refetch };
}
