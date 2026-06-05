"use client";
import { useReadContracts } from "wagmi";
import { CONTRACTS, BADGE_LABELS } from "@/lib/chain";
import { BadgeNFTABI } from "@/abis/BadgeNFT";

/**
 * Reads soulbound-badge ownership for every badge type for the given account.
 * Returns one boolean result per BADGE_LABELS entry (same order).
 */
export function useBadges(address?: `0x${string}`) {
  return useReadContracts({
    contracts: address
      ? BADGE_LABELS.map((_, i) => ({
          address: CONTRACTS.badgeNFT,
          abi: BadgeNFTABI,
          functionName: "hasBadge" as const,
          args: [address, i] as const,
        }))
      : [],
    query: { enabled: !!address },
  });
}
