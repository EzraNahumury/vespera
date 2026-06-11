"use client";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { TreasuryABI } from "@/abis/Treasury";
import { CONTRACTS, CREDIT_DECIMALS, CREDIT_SYMBOL } from "@/lib/chain";

/**
 * Gates an ArisanGroup deposit: reads the member's personal CREDIT balance in
 * the Treasury and compares it with the round's fixed deposit (in credits).
 *
 * Credits are minted by depositing native CELO (1 CELO = 1000 credits) and live
 * independently of any group, so there is no ERC-20 approval step anymore — the
 * group simply debits the member's credit balance when they deposit.
 *
 * @param group     the ArisanGroup (unused for reads; kept for signature parity)
 * @param _token    legacy deposit-token label (ignored — credits are unit-less)
 * @param owner     the connected member
 * @param required  the depositAmount in credits (raw 18-decimal bigint)
 */
export function useDepositGate(
  group?: `0x${string}`,
  _token?: `0x${string}`,
  owner?: `0x${string}`,
  required?: bigint,
) {
  const enabled = !!owner;
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.treasury,
    abi: TreasuryABI,
    functionName: "creditBalance",
    args: owner ? [owner] : undefined,
    query: { enabled },
  });

  const balance = data as bigint | undefined;
  const ready = balance !== undefined && required !== undefined;
  const insufficientBalance = ready ? balance! < required! : false;
  const canDeposit = ready ? !insufficientBalance : false;

  const balanceFmt = balance !== undefined ? formatUnits(balance, CREDIT_DECIMALS) : undefined;

  return {
    balance,
    balanceFmt,
    symbol: CREDIT_SYMBOL,
    decimals: CREDIT_DECIMALS,
    needsApproval: false, // credits never need an allowance
    insufficientBalance,
    canDeposit,
    isLoading,
    refetch,
  };
}
