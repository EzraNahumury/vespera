"use client";
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits, formatUnits, isAddress } from "viem";
import { useState } from "react";
import { ArisanGroupABI } from "@/abis/ArisanGroup";
import { VotingEngineABI } from "@/abis/VotingEngine";
import { TOKEN_LABELS, CONTRACTS } from "@/lib/chain";
import { VoteStatus } from "@/components/app/VoteStatus";
import { Loader, CheckCircle, XCircle, Users, Clock, ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

export function DesktopGroupDetail({ address }: { address: `0x${string}` }) {
  const { address: wallet } = useAccount();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [inviteAddr, setInviteAddr] = useState("");

  const { data } = useReadContracts({
    contracts: [
      { address, abi: ArisanGroupABI, functionName: "memberCount" },
      { address, abi: ArisanGroupABI, functionName: "maxMembers" },
      { address, abi: ArisanGroupABI, functionName: "depositToken" },
      { address, abi: ArisanGroupABI, functionName: "depositAmount" },
      { address, abi: ArisanGroupABI, functionName: "currentRound" },
      { address, abi: ArisanGroupABI, functionName: "activeRequestId" },
      { address, abi: ArisanGroupABI, functionName: "getMembers" },
      { address, abi: ArisanGroupABI, functionName: "creator" },
    ],
  });
  const { data: memberCheck } = useReadContracts({
    contracts: wallet ? [
      { address, abi: ArisanGroupABI, functionName: "isMember" as const, args: [wallet] },
      { address, abi: ArisanGroupABI, functionName: "invited" as const, args: [wallet] },
    ] : [],
    query: { enabled: !!wallet },
  });

  const memberCount = data?.[0]?.result ? Number(data[0].result) : 0;
  const maxMembers = data?.[1]?.result ? Number(data[1].result) : 0;
  const token = data?.[2]?.result as `0x${string}` | undefined;
  const depositAmount = data?.[3]?.result as bigint | undefined;
  const currentRound = data?.[4]?.result ? Number(data[4].result) : 1;
  const activeRequestId = data?.[5]?.result ? Number(data[5].result) : 0;
  const members = data?.[6]?.result as `0x${string}`[] | undefined;
  const creator = data?.[7]?.result as `0x${string}` | undefined;
  const isMember = memberCheck?.[0]?.result as boolean | undefined;
  const isInvited = memberCheck?.[1]?.result as boolean | undefined;
  const isCreator = !!creator && !!wallet && creator.toLowerCase() === wallet.toLowerCase();
  const canJoin = !!isInvited && !isMember;

  const tokenLabel = token ? (TOKEN_LABELS[token] ?? "token") : "—";
  const depositFmt = depositAmount ? formatUnits(depositAmount, 18) : "—";

  const { writeContract: deposit, data: dHash, isPending: dPending } = useWriteContract();
  const { isLoading: dConfirming, isSuccess: dDone } = useWaitForTransactionReceipt({ hash: dHash });
  const { writeContract: requestW, data: wHash, isPending: wPending } = useWriteContract();
  const { isLoading: wConfirming, isSuccess: wDone } = useWaitForTransactionReceipt({ hash: wHash });
  const { writeContract: castVote, isPending: voting } = useWriteContract();
  const { writeContract: finalizeVote, data: fHash, isPending: fPending } = useWriteContract();
  const { isLoading: fConfirming, isSuccess: fDone } = useWaitForTransactionReceipt({ hash: fHash });
  const { writeContract: invite, data: iHash, isPending: iPending } = useWriteContract();
  const { isLoading: iConfirming, isSuccess: iDone } = useWaitForTransactionReceipt({ hash: iHash });
  const { writeContract: join, data: jHash, isPending: jPending } = useWriteContract();
  const { isLoading: jConfirming, isSuccess: jDone } = useWaitForTransactionReceipt({ hash: jHash });

  const inviteList = inviteAddr.split(",").map(s => s.trim()).filter(Boolean);
  const validInvites = inviteList.filter(a => isAddress(a)) as `0x${string}`[];
  const canInvite = validInvites.length > 0 && validInvites.length === inviteList.length;
  function handleInvite() {
    if (validInvites.length === 1) {
      invite({ address, abi: ArisanGroupABI, functionName: "invite", args: [validInvites[0]] });
    } else {
      invite({ address, abi: ArisanGroupABI, functionName: "inviteBatch", args: [validInvites] });
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-10">
      <div className="max-w-[88rem] mx-auto">
        <Link href="/app" className="inline-flex items-center gap-2 text-black/50 hover:text-black text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-2 text-black/40 text-xs font-mono">{address}</div>
        <h1 className="text-4xl font-medium text-black mb-8" style={{ letterSpacing: "-0.03em" }}>Group Detail</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: "Members", value: `${memberCount} / ${maxMembers}` },
            { label: "Round", value: `#${currentRound}` },
            { label: "Deposit", value: `${depositFmt} ${tokenLabel}` },
            { label: "Active Request", value: activeRequestId ? `#${activeRequestId}` : "None" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white p-5 border border-black/5">
              <p className="text-black/40 text-xs mb-1">{label}</p>
              <p className="text-black font-medium text-lg">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left col: deposit + withdraw */}
          <div className="col-span-2 space-y-5">
            {canJoin && (
              <div className="rounded-2xl bg-[#86EFAC]/10 border border-[#86EFAC] p-7">
                <h2 className="text-black text-xl font-medium mb-2">You&apos;re invited 🎉</h2>
                <p className="text-black/60 text-sm mb-5">You&apos;ve been invited to this group. Join to start depositing and voting.</p>
                <button
                  onClick={() => join({ address, abi: ArisanGroupABI, functionName: "join" })}
                  disabled={jPending || jConfirming}
                  className="flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium px-7 py-3 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50"
                >
                  {(jPending || jConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                  {jPending ? "Confirm…" : jConfirming ? "Joining…" : jDone ? "Joined ✓" : "Join Group"}
                </button>
              </div>
            )}

            {wallet && !isMember && !canJoin && !isCreator && (
              <div className="rounded-2xl bg-white p-7 border border-black/5 text-center">
                <p className="text-black/50 text-sm">You&apos;re not a member of this group, and have no pending invite.</p>
              </div>
            )}

            {isCreator && (
              <div className="rounded-2xl bg-white p-7 border border-black/5">
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="w-4 h-4 text-black/40" />
                  <h2 className="text-black text-xl font-medium">Invite Member</h2>
                </div>
                <p className="text-black/50 text-sm mb-4">As the group founder, invite members by wallet address. Separate multiple addresses with commas.</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="0x… (comma-separate for multiple)"
                    value={inviteAddr}
                    onChange={e => setInviteAddr(e.target.value)}
                    className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#86EFAC]"
                  />
                  <button
                    onClick={handleInvite}
                    disabled={iPending || iConfirming || !canInvite}
                    className="flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium px-6 py-3 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50 shrink-0"
                  >
                    {(iPending || iConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                    {iPending ? "Confirm…" : iConfirming ? "Inviting…" : iDone ? "Invited ✓" : validInvites.length > 1 ? `Invite ${validInvites.length}` : "Invite"}
                  </button>
                </div>
              </div>
            )}

            {isMember && (
              <div className="rounded-2xl bg-white p-7 border border-black/5">
                <h2 className="text-black text-xl font-medium mb-3">Deposit This Round</h2>
                <p className="text-black/50 text-sm mb-4">Fixed deposit: <strong>{depositFmt} {tokenLabel}</strong></p>
                <button onClick={() => deposit({ address, abi: ArisanGroupABI, functionName: "deposit" })}
                  disabled={dPending || dConfirming}
                  className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-3 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50">
                  {(dPending || dConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                  {dPending ? "Confirm…" : dConfirming ? "Depositing…" : dDone ? "Deposited ✓" : "Deposit"}
                </button>
              </div>
            )}

            {isMember && !activeRequestId && (
              <div className="rounded-2xl bg-white p-7 border border-black/5">
                <h2 className="text-black text-xl font-medium mb-4">Request Withdrawal</h2>
                <div className="space-y-3 mb-4">
                  <input type="number" placeholder={`Amount (${tokenLabel})`} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC]" />
                  <input type="text" placeholder="Reason (text or IPFS URI)" value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC]" />
                </div>
                <button onClick={() => requestW({ address, abi: ArisanGroupABI, functionName: "requestWithdrawal", args: [parseUnits(withdrawAmount||"0",18), withdrawReason] })}
                  disabled={wPending || wConfirming || !withdrawAmount || !withdrawReason}
                  className="w-full flex items-center justify-center gap-2 bg-[#14532D] text-white font-medium py-3 rounded-xl hover:bg-[#166534] transition-colors disabled:opacity-50">
                  {(wPending || wConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                  {wPending ? "Confirm…" : wConfirming ? "Submitting…" : wDone ? "Submitted ✓" : "Request Withdrawal"}
                </button>
              </div>
            )}

            {activeRequestId > 0 && isMember && (
              <div className="rounded-2xl bg-[#14532D] p-7">
                <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-[#86EFAC]" /><p className="text-[#86EFAC] text-sm font-medium">Vote Active</p></div>
                <h2 className="text-white text-xl font-medium mb-2">Request #{activeRequestId}</h2>
                <p className="text-white/50 text-sm mb-1">AI has validated this request. Cast your reputation-weighted vote.</p>
                <VoteStatus group={address} requestId={activeRequestId} />
                <div className="flex gap-3">
                  <button onClick={() => castVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "castVote", args: [address, BigInt(activeRequestId), true] })}
                    disabled={voting} className="flex-1 flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-3 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => castVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "castVote", args: [address, BigInt(activeRequestId), false] })}
                    disabled={voting} className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
                <button onClick={() => finalizeVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "finalize", args: [address, BigInt(activeRequestId)] })}
                  disabled={fPending || fConfirming}
                  className="w-full mt-3 flex items-center justify-center gap-2 border border-white/20 text-white/80 font-medium py-2.5 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 text-sm">
                  {(fPending || fConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                  {fPending ? "Confirm…" : fConfirming ? "Finalizing…" : fDone ? "Finalized ✓" : "Finalize Vote"}
                </button>
                <p className="text-white/35 text-xs mt-2 text-center">Anyone can finalize once the voting window closes or quorum is reached.</p>
              </div>
            )}
          </div>

          {/* Right col: members */}
          <div className="rounded-2xl bg-white p-7 border border-black/5 h-fit">
            <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-black/40" /><h2 className="text-black text-xl font-medium">Members</h2></div>
            {members?.length ? (
              <ul className="space-y-2">
                {members.map(m => (
                  <li key={m} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-black/70">{m.slice(0,8)}…{m.slice(-6)}</span>
                    {m.toLowerCase() === wallet?.toLowerCase() && <span className="text-xs bg-[#86EFAC] text-black px-2 py-0.5 rounded-full">you</span>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-black/30 text-sm">Loading…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
