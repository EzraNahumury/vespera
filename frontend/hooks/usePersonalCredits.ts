"use client";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { TreasuryABI } from "@/abis/Treasury";
import { CONTRACTS, CREDIT_DECIMALS } from "@/lib/chain";

/**
 * Reads a user's PERSONAL credit balance in the Treasury (independent of any
 * group). Used by the credit wallet — top up (deposit CELO) and cash out
 * (withdraw credits back to CELO). Available even before joining a group.
 */
export function usePersonalCredits(user?: `0x${string}`) {
  const enabled = !!user;
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.treasury,
    abi: TreasuryABI,
    functionName: "creditBalance",
    args: user ? [user] : undefined,
    query: { enabled },
  });

  const credits = data as bigint | undefined;
  const creditsFmt = credits !== undefined ? formatUnits(credits, CREDIT_DECIMALS) : undefined;
  return { credits, creditsFmt, isLoading, refetch };
}
