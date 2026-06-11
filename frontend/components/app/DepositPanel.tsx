"use client";
import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ArisanGroupABI } from "@/abis/ArisanGroup";
import { useDepositGate } from "@/hooks/useDepositGate";
import { useToast } from "@/components/ui/Toast";
import { Loader, AlertTriangle } from "lucide-react";

/**
 * Self-contained deposit control. The round's fixed amount is paid into the
 * group pot directly from the member's personal CREDIT balance — no ERC-20
 * approval. If the member doesn't hold enough credits, we point them at the
 * credit wallet to top up (deposit native CELO @ 1:1000) first.
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

  const { writeContract: deposit, data: dHash, isPending: dPending } = useWriteContract();
  const { isLoading: dConfirming, isSuccess: dDone } = useWaitForTransactionReceipt({ hash: dHash });

  // After deposit confirms, re-read the credit balance and confirm.
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
  function handleDeposit() {
    deposit({ address: group, abi: ArisanGroupABI, functionName: "deposit" }, { onError: txError });
  }

  const loading = gate.isLoading && gate.balance === undefined;

  return (
    <div className="space-y-3">
      {/* Balance row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-black/50">Your credits</span>
        {loading ? (
          <span className="h-4 w-24 rounded bg-black/5 animate-pulse" />
        ) : (
          <span className="font-medium text-black">
            {gate.balanceFmt !== undefined ? `${gate.balanceFmt} ${gate.symbol}` : "—"}
          </span>
        )}
      </div>

      {loading ? (
        <button disabled className={`${btn} bg-black/5 text-black/30`}>
          <Loader className={`${spin} animate-spin`} /> Checking credits…
        </button>
      ) : gate.insufficientBalance ? (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-600 text-xs leading-relaxed">
            Not enough credits. You need <strong>{depositFmt} {tokenLabel}</strong> to deposit this round — top up
            from your credit wallet (deposit CELO) first.
          </p>
        </div>
      ) : (
        <button onClick={handleDeposit} disabled={dPending || dConfirming || !gate.canDeposit}
          className={`${btn} bg-[#86EFAC] text-black hover:bg-[#4ADE80]`}>
          {(dPending || dConfirming) && <Loader className={`${spin} animate-spin`} />}
          {dPending ? "Confirm in wallet…" : dConfirming ? "Depositing…" : dDone ? "Deposited ✓" : "Deposit Now"}
        </button>
      )}

      {dHash && (
        <a href={`https://celoscan.io/tx/${dHash}`} target="_blank" rel="noopener noreferrer"
          className="block text-center text-xs text-black/40 hover:text-[#16A34A] transition-colors">
          View transaction on Celoscan ↗
        </a>
      )}
    </div>
  );
}
