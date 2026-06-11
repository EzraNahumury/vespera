"use client";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { TreasuryABI } from "@/abis/Treasury";
import { CONTRACTS, CREDIT_DECIMALS } from "@/lib/chain";

/**
 * Reads a group's pooled CREDIT balance held in the Treasury.
 * ArisanGroup.requestWithdrawal reverts with InsufficientPot when the
 * requested amount exceeds this — so the UI gates against it.
 *
 * @param group    the ArisanGroup address
 * @param _token   legacy deposit-token label (ignored — pot is in credits)
 * @param decimals credit decimals for the formatted display (default 18)
 */
export function useTreasuryPot(group?: `0x${string}`, _token?: `0x${string}`, decimals = CREDIT_DECIMALS) {
  const enabled = !!group;
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.treasury,
    abi: TreasuryABI,
    functionName: "balanceOf",
    args: group ? [group] : undefined,
    query: { enabled },
  });

  const pot = data as bigint | undefined;
  const potFmt = pot !== undefined ? formatUnits(pot, decimals) : undefined;
  return { pot, potFmt, isLoading, refetch };
}
