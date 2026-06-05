"use client";
import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ArisanGroupABI } from "@/abis/ArisanGroup";
import { ERC20ABI } from "@/abis/ERC20";
import { useDepositGate } from "@/hooks/useDepositGate";
import { useToast } from "@/components/ui/Toast";
import { Loader, AlertTriangle, ShieldCheck } from "lucide-react";

/**
 * Self-contained deposit controls with a two-step approve→deposit flow.
 *
 * - Reads balance + allowance via useDepositGate.
 * - If balance < deposit → shows an insufficient-balance warning, blocks both.
 * - If allowance < deposit → shows an Approve button (approves exactly the
 *   deposit amount to the group), re-reading the gate once it confirms.
 * - Once approved + funded → shows the Deposit button.
 *
 * Renders only the inner controls; callers wrap in their own surface.
 */
export function DepositPanel({
  group,
  token,
  owner,
  depositAmount,
  depositFmt,
  tokenLabel,
  size = "md",
}: {
  group: `0x${string}`;
  token?: `0x${string}`;
  owner?: `0x${string}`;
  depositAmount?: bigint;
  depositFmt: string;
  tokenLabel: string;
  size?: "md" | "lg";
}) {
  const gate = useDepositGate(group, token, owner, depositAmount);
  const { toast } = useToast();

  const { writeContract: approve, data: aHash, isPending: aPending } = useWriteContract();
  const { isLoading: aConfirming, isSuccess: aDone } = useWaitForTransactionReceipt({ hash: aHash });
  const { writeContract: deposit, data: dHash, isPending: dPending } = useWriteContract();
  const { isLoading: dConfirming, isSuccess: dDone } = useWaitForTransactionReceipt({ hash: dHash });

  // After approve confirms, re-read the gate and tell the user they can deposit.
  useEffect(() => {
    if (aDone) {
      gate.refetch();
      toast("success", "Approved — you can deposit now.");
    }
  }, [aDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // After deposit confirms, re-read balance and confirm.
  useEffect(() => {
    if (dDone) {
      gate.refetch();
      toast("success", "Deposit confirmed ✓");
    }
  }, [dDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const btn =
    size === "lg"
      ? "w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-[0.98] transition-transform"
      : "w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform";
  const spin = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  function txError(e: unknown) {
    const msg = (e as { shortMessage?: string })?.shortMessage ?? "Transaction failed.";
    toast("error", msg);
  }
  function handleApprove() {
    if (!token || depositAmount === undefined) return;
    approve(
      { address: token, abi: ERC20ABI, functionName: "approve", args: [group, depositAmount] },
      { onError: txError },
    );
  }
  function handleDeposit() {
    deposit({ address: group, abi: ArisanGroupABI, functionName: "deposit" }, { onError: txError });
  }

  return (
    <div className="space-y-3">
      {/* Balance row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-black/50">Your balance</span>
        <span className="font-medium text-black">
          {gate.balanceFmt !== undefined ? `${gate.balanceFmt} ${gate.symbol ?? tokenLabel}` : "—"}
        </span>
      </div>

      {gate.insufficientBalance ? (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-600 text-xs leading-relaxed">
            Insufficient balance. You need <strong>{depositFmt} {tokenLabel}</strong> to deposit this round.
          </p>
        </div>
      ) : gate.needsApproval ? (
        <>
          <div className="flex items-start gap-2 rounded-xl bg-[#86EFAC]/15 border border-[#86EFAC]/40 px-3 py-2.5">
            <ShieldCheck className="w-4 h-4 text-[#14532D] shrink-0 mt-0.5" />
            <p className="text-[#14532D] text-xs leading-relaxed">
              One-time step: approve the group to move <strong>{depositFmt} {tokenLabel}</strong>, then deposit.
            </p>
          </div>
          <button onClick={handleApprove} disabled={aPending || aConfirming}
            className={`${btn} bg-[#14532D] text-white hover:bg-[#166534]`}>
            {(aPending || aConfirming) && <Loader className={`${spin} animate-spin`} />}
            {aPending ? "Confirm in wallet…" : aConfirming ? "Approving…" : `Approve ${depositFmt} ${tokenLabel}`}
          </button>
        </>
      ) : (
        <button onClick={handleDeposit} disabled={dPending || dConfirming || !gate.canDeposit}
          className={`${btn} bg-[#86EFAC] text-black hover:bg-[#4ADE80]`}>
          {(dPending || dConfirming) && <Loader className={`${spin} animate-spin`} />}
          {dPending ? "Confirm in wallet…" : dConfirming ? "Depositing…" : dDone ? "Deposited ✓" : "Deposit Now"}
        </button>
      )}
    </div>
  );
}
