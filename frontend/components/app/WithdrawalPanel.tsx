"use client";
import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { ArisanGroupABI } from "vespera-sdk";
import { useTreasuryPot } from "@/hooks/useTreasuryPot";
import { useToast } from "@/components/ui/Toast";
import { Loader, AlertTriangle } from "lucide-react";

/**
 * Self-contained withdrawal-request controls with a pot gate.
 *
 * ArisanGroup.requestWithdrawal reverts when amount > the group's treasury
 * pot (InsufficientPot) — e.g. requesting before anyone deposited. This panel
 * reads the pot, blocks an over-pot request up front, validates amount/reason,
 * and surfaces success/failure via toast (the old inline flow failed silently).
 */
export function WithdrawalPanel({
  group,
  token,
  decimals,
  tokenLabel,
  size = "md",
}: {
  group: `0x${string}`;
  token?: `0x${string}`;
  decimals: number;
  tokenLabel: string;
  size?: "md" | "lg";
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const pot = useTreasuryPot(group, token, decimals);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess: done } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (done) {
      toast("success", "Withdrawal request submitted ✓");
      pot.refetch();
      setAmount("");
      setReason("");
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  let parsed = BigInt(0);
  try { parsed = parseUnits(amount || "0", decimals); } catch { parsed = BigInt(0); }
  const exceedsPot = pot.pot !== undefined && parsed > pot.pot;
  const amountValid = amount.trim() !== "" && parsed > BigInt(0);
  const reasonValid = reason.trim() !== "";
  const canSubmit = amountValid && reasonValid && !exceedsPot;

  const inputCls =
    "w-full rounded-xl border border-black/[0.08] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[#86EFAC] transition-colors";
  const btn =
    size === "lg"
      ? "w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-[0.98] transition-transform"
      : "w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform";
  const spin = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  function submit() {
    writeContract(
      { address: group, abi: ArisanGroupABI, functionName: "requestWithdrawal", args: [parsed, reason] },
      { onError: (e) => toast("error", (e as { shortMessage?: string })?.shortMessage ?? "Request failed.") },
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-black/50">Group pot</span>
        <span className="font-medium text-black">
          {pot.potFmt !== undefined ? `${pot.potFmt} ${tokenLabel}` : "—"}
        </span>
      </div>

      <input type="number" inputMode="decimal" placeholder={`Amount (${tokenLabel})`} value={amount}
        onChange={e => setAmount(e.target.value)} className={inputCls} />
      <input type="text" placeholder="Reason (text or IPFS URI)" value={reason}
        onChange={e => setReason(e.target.value)} className={inputCls} />

      {exceedsPot && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-600 text-xs leading-relaxed">
            Amount exceeds the group pot ({pot.potFmt} {tokenLabel}). Members must deposit before this much can be withdrawn.
          </p>
        </div>
      )}

      <button onClick={submit} disabled={isPending || confirming || !canSubmit}
        className={`${btn} bg-[#14532D] text-white hover:bg-[#166534]`}>
        {(isPending || confirming) && <Loader className={`${spin} animate-spin`} />}
        {isPending ? "Confirm in wallet…" : confirming ? "Submitting…" : "Request Withdrawal"}
      </button>

      {hash && (
        <a href={`https://celoscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer"
          className="block text-center text-xs text-black/40 hover:text-[#16A34A] transition-colors">
          View transaction on Celoscan ↗
        </a>
      )}
    </div>
  );
}
