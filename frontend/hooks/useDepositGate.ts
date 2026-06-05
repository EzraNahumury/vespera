"use client";
import { useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { ERC20ABI } from "@/abis/ERC20";

/**
 * Gates an ArisanGroup deposit: reads the member's token balance + the
 * allowance granted to the group, then derives whether they need to approve,
 * whether they hold enough, and whether deposit is unblocked.
 *
 * One multicall (balanceOf + allowance + decimals + symbol). All comparisons
 * use raw bigints, so token decimals don't affect correctness — decimals are
 * only used to format the display string.
 *
 * @param group    the ArisanGroup (spender + transferFrom target)
 * @param token    the depositToken (ERC-20)
 * @param owner    the connected member
 * @param required the depositAmount (raw bigint, as stored on-chain)
 */
export function useDepositGate(
  group?: `0x${string}`,
  token?: `0x${string}`,
  owner?: `0x${string}`,
  required?: bigint,
) {
  const enabled = !!group && !!token && !!owner;
  const { data, isLoading, refetch } = useReadContracts({
    contracts: enabled
      ? [
          { address: token, abi: ERC20ABI, functionName: "balanceOf" as const, args: [owner] },
          { address: token, abi: ERC20ABI, functionName: "allowance" as const, args: [owner, group] },
          { address: token, abi: ERC20ABI, functionName: "decimals" as const },
          { address: token, abi: ERC20ABI, functionName: "symbol" as const },
        ]
      : [],
    query: { enabled },
  });

  const balance = data?.[0]?.result as bigint | undefined;
  const allowance = data?.[1]?.result as bigint | undefined;
  const decimals = data?.[2]?.result !== undefined ? Number(data[2].result) : undefined;
  const symbol = data?.[3]?.result as string | undefined;

  const ready = balance !== undefined && allowance !== undefined && required !== undefined;
  const needsApproval = ready ? allowance! < required! : false;
  const insufficientBalance = ready ? balance! < required! : false;
  const canDeposit = ready ? !needsApproval && !insufficientBalance : false;

  const balanceFmt =
    balance !== undefined && decimals !== undefined ? formatUnits(balance, decimals) : undefined;

  return {
    balance,
    balanceFmt,
    allowance,
    decimals,
    symbol,
    needsApproval,
    insufficientBalance,
    canDeposit,
    isLoading,
    refetch,
  };
}
