"use client";
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useState } from "react";
import { ArisanGroupABI } from "@/abis/ArisanGroup";
import { VotingEngineABI } from "@/abis/VotingEngine";
import { TOKEN_LABELS, CONTRACTS } from "@/lib/chain";
import { Loader, CheckCircle, XCircle, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";

export function MobileGroupDetail({ address }: { address: `0x${string}` }) {
  const { address: wallet } = useAccount();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [tab, setTab] = useState<"info"|"deposit"|"vote">("info");

  const { data } = useReadContracts({
    contracts: [
      { address, abi: ArisanGroupABI, functionName: "memberCount" },
      { address, abi: ArisanGroupABI, functionName: "maxMembers" },
      { address, abi: ArisanGroupABI, functionName: "depositToken" },
      { address, abi: ArisanGroupABI, functionName: "depositAmount" },
      { address, abi: ArisanGroupABI, functionName: "currentRound" },
      { address, abi: ArisanGroupABI, functionName: "activeRequestId" },
      { address, abi: ArisanGroupABI, functionName: "getMembers" },
    ],
  });
  const { data: memberCheck } = useReadContracts({
    contracts: wallet ? [{ address, abi: ArisanGroupABI, functionName: "isMember" as const, args: [wallet] }] : [],
    query: { enabled: !!wallet },
  });

  const memberCount = data?.[0]?.result ? Number(data[0].result) : 0;
  const maxMembers = data?.[1]?.result ? Number(data[1].result) : 0;
  const token = data?.[2]?.result as `0x${string}` | undefined;
  const depositAmount = data?.[3]?.result as bigint | undefined;
  const currentRound = data?.[4]?.result ? Number(data[4].result) : 1;
  const activeRequestId = data?.[5]?.result ? Number(data[5].result) : 0;
  const members = data?.[6]?.result as `0x${string}`[] | undefined;
  const isMember = memberCheck?.[0]?.result as boolean | undefined;

  const tokenLabel = token ? (TOKEN_LABELS[token] ?? "token") : "—";
  const depositFmt = depositAmount ? formatUnits(depositAmount, 18) : "—";

  const { writeContract: deposit, data: dHash, isPending: dPending } = useWriteContract();
  const { isLoading: dConfirming, isSuccess: dDone } = useWaitForTransactionReceipt({ hash: dHash });
  const { writeContract: requestW, data: wHash, isPending: wPending } = useWriteContract();
  const { isLoading: wConfirming, isSuccess: wDone } = useWaitForTransactionReceipt({ hash: wHash });
  const { writeContract: castVote, isPending: voting } = useWriteContract();

  const tabs = [
    { id: "info" as const, label: "Info" },
    { id: "deposit" as const, label: "Deposit" },
    { id: "vote" as const, label: `Vote${activeRequestId ? " 🔴" : ""}` },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <div className="bg-[#F5F5F5] px-4 pt-4 pb-0 flex items-center gap-3 sticky top-16 z-10 border-b border-black/5">
        <Link href="/app" className="p-2 rounded-xl hover:bg-black/5 transition-colors">
          <ChevronLeft className="w-5 h-5 text-black" />
        </Link>
        <div>
          <h1 className="text-base font-medium text-black">Group Detail</h1>
          <p className="text-xs text-black/40 font-mono">{address.slice(0,10)}…</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-[#14532D] px-5 py-5 grid grid-cols-2 gap-3">
        {[
          { label: "Members", value: `${memberCount} / ${maxMembers}` },
          { label: "Round", value: `#${currentRound}` },
          { label: "Deposit", value: `${depositFmt} ${tokenLabel}` },
          { label: "Request", value: activeRequestId ? `#${activeRequestId}` : "None" },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-white/40 text-xs">{label}</p>
            <p className="text-white font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/5 bg-white">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t.id ? "text-black border-b-2 border-black" : "text-black/40"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-5">
        {/* Info tab */}
        {tab === "info" && (
          <div>
            <p className="text-black/50 text-xs font-medium uppercase tracking-wider mb-3">Members</p>
            {members?.length ? (
              <ul className="space-y-2">
                {members.map(m => (
                  <li key={m} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                    <span className="font-mono text-sm text-black/70">{m.slice(0,8)}…{m.slice(-6)}</span>
                    {m.toLowerCase() === wallet?.toLowerCase() && <span className="text-xs bg-[#86EFAC] text-black px-2 py-0.5 rounded-full">you</span>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-black/30 text-sm">Loading members…</p>}
          </div>
        )}

        {/* Deposit tab */}
        {tab === "deposit" && isMember && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5">
              <p className="text-black/50 text-sm mb-1">Amount to deposit</p>
              <p className="text-black text-2xl font-medium">{depositFmt} {tokenLabel}</p>
            </div>
            <button onClick={() => deposit({ address, abi: ArisanGroupABI, functionName: "deposit" })}
              disabled={dPending || dConfirming}
              className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-4 rounded-2xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50">
              {(dPending || dConfirming) && <Loader className="w-4 h-4 animate-spin" />}
              {dPending ? "Confirm…" : dConfirming ? "Depositing…" : dDone ? "Deposited ✓" : "Deposit Now"}
            </button>

            {!activeRequestId && (
              <div className="rounded-2xl bg-white p-5 space-y-3">
                <p className="text-black font-medium">Request Withdrawal</p>
                <input type="number" placeholder={`Amount (${tokenLabel})`} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC]" />
                <input type="text" placeholder="Reason" value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC]" />
                <button onClick={() => requestW({ address, abi: ArisanGroupABI, functionName: "requestWithdrawal", args: [parseUnits(withdrawAmount||"0",18), withdrawReason] })}
                  disabled={wPending || wConfirming || !withdrawAmount || !withdrawReason}
                  className="w-full flex items-center justify-center gap-2 bg-[#14532D] text-white font-medium py-3 rounded-xl disabled:opacity-50">
                  {(wPending || wConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                  {wPending ? "Confirm…" : wConfirming ? "Submitting…" : wDone ? "Submitted ✓" : "Request Withdrawal"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vote tab */}
        {tab === "vote" && (
          activeRequestId > 0 && isMember ? (
            <div className="rounded-2xl bg-[#14532D] p-6">
              <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-[#86EFAC]" /><p className="text-[#86EFAC] text-sm font-medium">Vote Active</p></div>
              <h2 className="text-white text-xl font-medium mb-2">Request #{activeRequestId}</h2>
              <p className="text-white/50 text-sm mb-6">AI has validated this request. Your vote is weighted by your reputation score.</p>
              <div className="flex gap-3">
                <button onClick={() => castVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "castVote", args: [address, BigInt(activeRequestId), true] })}
                  disabled={voting} className="flex-1 flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-4 rounded-2xl disabled:opacity-50">
                  <CheckCircle className="w-5 h-5" /> Approve
                </button>
                <button onClick={() => castVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "castVote", args: [address, BigInt(activeRequestId), false] })}
                  disabled={voting} className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-medium py-4 rounded-2xl disabled:opacity-50">
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-black/10 p-8 text-center">
              <p className="text-black/40">No active vote right now.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
