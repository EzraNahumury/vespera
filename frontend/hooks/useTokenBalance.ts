"use client";
import { useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { ERC20ABI } from "@/abis/ERC20";

/**
 * Reads an ERC-20 balance + metadata for an account.
 * Returns raw balance (bigint), token decimals/symbol, and a display string.
 * Reusable across deposit gating, dashboards, settings, etc.
 */
export function useTokenBalance(token?: `0x${string}`, owner?: `0x${string}`) {
  const enabled = !!token && !!owner;
  const { data, isLoading, refetch } = useReadContracts({
    contracts: enabled
      ? [
          { address: token, abi: ERC20ABI, functionName: "balanceOf" as const, args: [owner] },
          { address: token, abi: ERC20ABI, functionName: "decimals" as const },
          { address: token, abi: ERC20ABI, functionName: "symbol" as const },
        ]
      : [],
    query: { enabled },
  });

  const balance = (data?.[0]?.result as bigint | undefined) ?? undefined;
  const decimals = data?.[1]?.result !== undefined ? Number(data[1].result) : undefined;
  const symbol = data?.[2]?.result as string | undefined;
  const formatted =
    balance !== undefined && decimals !== undefined ? formatUnits(balance, decimals) : undefined;

  return { balance, decimals, symbol, formatted, isLoading, refetch };
}
