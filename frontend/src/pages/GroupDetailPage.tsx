import { useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ArisanGroupABI } from "../abis/ArisanGroup";
import { TOKEN_LABELS, CONTRACTS } from "../lib/chain";
import { VotingEngineABI } from "../abis/VotingEngine";
import { useState } from "react";
import { Loader, CheckCircle, XCircle, Users, Clock } from "lucide-react";

export function GroupDetailPage({ address }: { address: `0x${string}` }) {
  const { address: wallet } = useAccount();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");

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

  const { data: memberData } = useReadContracts({
    contracts: wallet
      ? [{ address, abi: ArisanGroupABI, functionName: "isMember" as const, args: [wallet] }]
      : [],
    query: { enabled: !!wallet },
  });

  const memberCount = data?.[0]?.result ? Number(data[0].result) : 0;
  const maxMembers = data?.[1]?.result ? Number(data[1].result) : 0;
  const token = data?.[2]?.result as `0x${string}` | undefined;
  const depositAmount = data?.[3]?.result as bigint | undefined;
  const currentRound = data?.[4]?.result ? Number(data[4].result) : 1;
  const activeRequestId = data?.[5]?.result ? Number(data[5].result) : 0;
  const members = data?.[6]?.result as `0x${string}`[] | undefined;
  const isMember = memberData?.[0]?.result as boolean | undefined;

  const tokenLabel = token ? (TOKEN_LABELS[token] ?? "token") : "—";
  const depositAmountFmt = depositAmount ? formatUnits(depositAmount, 18) : "—";

  const { writeContract: deposit, data: depositHash, isPending: depositing } = useWriteContract();
  const { isLoading: depositConfirming, isSuccess: depositDone } = useWaitForTransactionReceipt({ hash: depositHash });

  const { writeContract: requestWithdraw, data: withdrawHash, isPending: withdrawing } = useWriteContract();
  const { isLoading: withdrawConfirming, isSuccess: withdrawDone } = useWaitForTransactionReceipt({ hash: withdrawHash });

  const { writeContract: castVote, isPending: voting } = useWriteContract();

  function handleDeposit() {
    deposit({ address, abi: ArisanGroupABI, functionName: "deposit" });
  }

  function handleWithdraw() {
    if (!withdrawAmount || !withdrawReason) return;
    requestWithdraw({
      address,
      abi: ArisanGroupABI,
      functionName: "requestWithdrawal",
      args: [parseUnits(withdrawAmount, 18), withdrawReason],
    });
  }

  function handleVote(support: boolean) {
    if (!activeRequestId) return;
    castVote({
      address: CONTRACTS.votingEngine,
      abi: VotingEngineABI,
      functionName: "castVote",
      args: [address, BigInt(activeRequestId), support],
    });
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-10 pb-24 md:pb-10">
      <div className="max-w-[88rem] mx-auto">
        <div className="mb-2 text-black/40 text-sm font-mono">{address}</div>
        <h1 className="text-4xl font-medium text-black mb-8" style={{ letterSpacing: "-0.03em" }}>
          Group Detail
        </h1>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Members", value: `${memberCount} / ${maxMembers}` },
            { label: "Round", value: `#${currentRound}` },
            { label: "Deposit", value: `${depositAmountFmt} ${tokenLabel}` },
            { label: "Active Request", value: activeRequestId ? `#${activeRequestId}` : "None" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white p-5 border border-black/5">
              <p className="text-black/40 text-xs mb-1">{label}</p>
              <p className="text-black font-medium text-lg">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deposit card */}
          {isMember && (
            <div className="rounded-2xl bg-white p-7 border border-black/5">
              <h2 className="text-black text-xl font-medium mb-4">Deposit This Round</h2>
              <p className="text-black/50 text-sm mb-5">
                Fixed deposit: <strong>{depositAmountFmt} {tokenLabel}</strong>
              </p>
              <button
                onClick={handleDeposit}
                disabled={depositing || depositConfirming}
                className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-3 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50"
              >
                {(depositing || depositConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                {depositing ? "Confirm in wallet…" : depositConfirming ? "Depositing…" : depositDone ? "Deposited ✓" : "Deposit"}
              </button>
            </div>
          )}

          {/* Withdrawal request */}
          {isMember && !activeRequestId && (
            <div className="rounded-2xl bg-white p-7 border border-black/5">
              <h2 className="text-black text-xl font-medium mb-4">Request Withdrawal</h2>
              <div className="space-y-3 mb-5">
                <input
                  type="number"
                  placeholder={`Amount (${tokenLabel})`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC]"
                />
                <input
                  type="text"
                  placeholder="Reason (text or IPFS URI)"
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC]"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || withdrawConfirming || !withdrawAmount || !withdrawReason}
                className="w-full flex items-center justify-center gap-2 bg-[#14532D] text-white font-medium py-3 rounded-xl hover:bg-[#166534] transition-colors disabled:opacity-50"
              >
                {(withdrawing || withdrawConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                {withdrawing ? "Confirm in wallet…" : withdrawConfirming ? "Submitting…" : withdrawDone ? "Submitted ✓" : "Request Withdrawal"}
              </button>
            </div>
          )}

          {/* Voting panel */}
          {activeRequestId > 0 && isMember && (
            <div className="rounded-2xl bg-[#14532D] p-7">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#86EFAC]" />
                <p className="text-[#86EFAC] text-sm font-medium">Vote Active</p>
              </div>
              <h2 className="text-white text-xl font-medium mb-2">Request #{activeRequestId}</h2>
              <p className="text-white/50 text-sm mb-6">
                An AI Requester Agent has validated this request. Cast your vote.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(true)}
                  disabled={voting}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-3 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={voting}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Members list */}
          <div className="rounded-2xl bg-white p-7 border border-black/5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-black/40" />
              <h2 className="text-black text-xl font-medium">Members</h2>
            </div>
            {members && members.length > 0 ? (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li key={m} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-black/70">{m.slice(0, 8)}…{m.slice(-6)}</span>
                    {m.toLowerCase() === wallet?.toLowerCase() && (
                      <span className="text-xs bg-[#86EFAC] text-black px-2 py-0.5 rounded-full">you</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black/30 text-sm">Loading members…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
