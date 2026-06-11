"use client";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits, formatEther } from "viem";
import { TreasuryABI } from "@/abis/Treasury";
import { usePersonalCredits } from "@/hooks/usePersonalCredits";
import { useToast } from "@/components/ui/Toast";
import {
  CONTRACTS,
  CREDIT_DECIMALS,
  CREDIT_SYMBOL,
  celoToCredits,
  creditsToCelo,
} from "@/lib/chain";
import { Loader, ArrowDownToLine, ArrowUpFromLine, Wallet } from "lucide-react";

/**
 * Personal credit wallet. Credits are the in-game currency: deposit native CELO
 * to mint credits at 1:1000, redeem credits back to CELO any time. This works
 * independently of any group — you can hold a credit balance before joining one
 * (the new deposit rule). Group deposits then debit this balance.
 */
export function CreditWallet() {
  const { address } = useAccount();
  const { toast } = useToast();
  const credits = usePersonalCredits(address);
  const { data: native, refetch: refetchNative } = useBalance({ address });

  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess: done } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (done) {
      toast("success", mode === "deposit" ? "Credits topped up ✓" : "Withdrawn to CELO ✓");
      credits.refetch();
      refetchNative();
      setAmount("");
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // Parse the input for the active mode and derive the conversion preview.
  let preview = "";
  let parsedOk = false;
  try {
    if (amount.trim() !== "" && Number(amount) > 0) {
      if (mode === "deposit") {
        const wei = parseEther(amount);
        preview = `≈ ${formatEther(celoToCredits(wei))} ${CREDIT_SYMBOL}`;
        parsedOk = wei > BigInt(0);
      } else {
        const c = parseUnits(amount, CREDIT_DECIMALS);
        preview = `≈ ${formatEther(creditsToCelo(c))} CELO`;
        parsedOk = c > BigInt(0) && (credits.credits === undefined || c <= credits.credits);
      }
    }
  } catch {
    parsedOk = false;
  }

  function submit() {
    const onError = (e: unknown) =>
      toast("error", (e as { shortMessage?: string })?.shortMessage ?? "Transaction failed.");
    try {
      if (mode === "deposit") {
        writeContract(
          { address: CONTRACTS.treasury, abi: TreasuryABI, functionName: "deposit", value: parseEther(amount) },
          { onError },
        );
      } else {
        writeContract(
          {
            address: CONTRACTS.treasury,
            abi: TreasuryABI,
            functionName: "withdraw",
            args: [parseUnits(amount, CREDIT_DECIMALS)],
          },
          { onError },
        );
      }
    } catch {
      toast("error", "Invalid amount.");
    }
  }

  const tab = (m: "deposit" | "withdraw", label: string, Icon: typeof ArrowDownToLine) => (
    <button
      onClick={() => { setMode(m); setAmount(""); }}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        mode === m ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl card-shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-black/40" />
        <h2 className="text-black text-lg font-semibold">Credit Wallet</h2>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl bg-[#86EFAC]/15 border border-[#86EFAC]/40 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-[#14532D]/60 mb-1">Your credits</p>
          <p className="text-lg font-bold text-[#14532D] leading-none">
            {credits.creditsFmt !== undefined ? `${credits.creditsFmt} ${CREDIT_SYMBOL}` : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-black/[0.03] border border-black/[0.06] px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-black/40 mb-1">Wallet CELO</p>
          <p className="text-lg font-bold text-black leading-none">
            {native ? `${Number(formatEther(native.value)).toFixed(4)}` : "—"}
          </p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex bg-black/[0.05] rounded-xl p-1 gap-1 mb-3">
        {tab("deposit", "Top up", ArrowDownToLine)}
        {tab("withdraw", "Cash out", ArrowUpFromLine)}
      </div>

      <input
        type="number"
        inputMode="decimal"
        placeholder={mode === "deposit" ? "Amount in CELO" : `Amount in ${CREDIT_SYMBOL}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-xl border border-black/[0.08] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[#86EFAC] transition-colors"
      />
      <p className="text-xs text-black/40 mt-1.5 mb-3 min-h-4">
        {preview || (mode === "deposit" ? "1 CELO = 1000 credits" : "1000 credits = 1 CELO")}
      </p>

      <button
        onClick={submit}
        disabled={isPending || confirming || !parsedOk}
        className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform bg-[#14532D] text-white hover:bg-[#166534]"
      >
        {(isPending || confirming) && <Loader className="w-4 h-4 animate-spin" />}
        {isPending
          ? "Confirm in wallet…"
          : confirming
            ? mode === "deposit" ? "Topping up…" : "Withdrawing…"
            : mode === "deposit" ? "Deposit CELO" : "Withdraw to CELO"}
      </button>

      {hash && (
        <a
          href={`https://celoscan.io/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-black/40 hover:text-[#16A34A] transition-colors mt-2"
        >
          View transaction on Celoscan ↗
        </a>
      )}
    </div>
  );
}
