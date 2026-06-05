"use client";
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits, formatUnits, isAddress } from "viem";
import { useState } from "react";
import { ArisanGroupABI } from "@/abis/ArisanGroup";
import { ERC20ABI } from "@/abis/ERC20";
import { VotingEngineABI } from "@/abis/VotingEngine";
import { TOKEN_LABELS, CONTRACTS } from "@/lib/chain";
import { VoteStatus } from "@/components/app/VoteStatus";
import { DepositPanel } from "@/components/app/DepositPanel";
import { PageContainer, Card, Button, Stat } from "@/components/ui/primitives";
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

  const { data: tokenDecimals } = useReadContract({
    address: token, abi: ERC20ABI, functionName: "decimals", query: { enabled: !!token },
  });
  const decimals = tokenDecimals !== undefined ? Number(tokenDecimals) : 18;
  const tokenLabel = token ? (TOKEN_LABELS[token] ?? "token") : "—";
  const depositFmt = depositAmount ? formatUnits(depositAmount, decimals) : "—";

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
    if (validInvites.length === 1) invite({ address, abi: ArisanGroupABI, functionName: "invite", args: [validInvites[0]] });
    else invite({ address, abi: ArisanGroupABI, functionName: "inviteBatch", args: [validInvites] });
  }

  const inputCls = "w-full rounded-xl border border-black/[0.08] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[#86EFAC] transition-colors";

  return (
    <PageContainer className="lg:!max-w-[80rem]">
      <Link href="/app" className="inline-flex items-center gap-2 text-black/50 hover:text-black text-sm mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <p className="text-black/40 text-xs font-mono mb-1">{address}</p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-8" style={{ letterSpacing: "-0.02em" }}>Group Detail</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Members" value={`${memberCount} / ${maxMembers}`} />
        <Stat label="Round" value={`#${currentRound}`} />
        <Stat label="Deposit" value={`${depositFmt} ${tokenLabel}`} />
        <Stat label="Active Request" value={activeRequestId ? `#${activeRequestId}` : "None"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {canJoin && (
            <div className="rounded-2xl bg-[#86EFAC]/15 border border-[#86EFAC] p-6">
              <h2 className="text-black text-xl font-semibold mb-2">You&apos;re invited 🎉</h2>
              <p className="text-black/60 text-sm mb-5">You&apos;ve been invited to this group. Join to start depositing and voting.</p>
              <Button onClick={() => join({ address, abi: ArisanGroupABI, functionName: "join" })} disabled={jPending || jConfirming}>
                {(jPending || jConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                {jPending ? "Confirm…" : jConfirming ? "Joining…" : jDone ? "Joined ✓" : "Join Group"}
              </Button>
            </div>
          )}

          {wallet && !isMember && !canJoin && !isCreator && (
            <Card><p className="text-black/50 text-sm text-center">You&apos;re not a member of this group, and have no pending invite.</p></Card>
          )}

          {isCreator && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="w-4 h-4 text-black/40" />
                <h2 className="text-black text-lg font-semibold">Invite Member</h2>
              </div>
              <p className="text-black/50 text-sm mb-4">As founder, invite members by wallet address. Separate multiple with commas.</p>
              <div className="flex gap-3">
                <input type="text" placeholder="0x… (comma-separate for multiple)" value={inviteAddr}
                  onChange={e => setInviteAddr(e.target.value)} className={`${inputCls} font-mono flex-1`} />
                <Button onClick={handleInvite} disabled={iPending || iConfirming || !canInvite} className="shrink-0">
                  {(iPending || iConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                  {iPending ? "Confirm…" : iConfirming ? "Inviting…" : iDone ? "Invited ✓" : validInvites.length > 1 ? `Invite ${validInvites.length}` : "Invite"}
                </Button>
              </div>
            </Card>
          )}

          {isMember && (
            <Card>
              <h2 className="text-black text-lg font-semibold mb-2">Deposit This Round</h2>
              <p className="text-black/50 text-sm mb-4">Fixed deposit: <strong className="text-black">{depositFmt} {tokenLabel}</strong></p>
              <DepositPanel group={address} token={token} owner={wallet} depositAmount={depositAmount} depositFmt={depositFmt} tokenLabel={tokenLabel} />
            </Card>
          )}

          {isMember && !activeRequestId && (
            <Card>
              <h2 className="text-black text-lg font-semibold mb-4">Request Withdrawal</h2>
              <div className="space-y-3 mb-4">
                <input type="number" placeholder={`Amount (${tokenLabel})`} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className={inputCls} />
                <input type="text" placeholder="Reason (text or IPFS URI)" value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)} className={inputCls} />
              </div>
              <Button variant="dark" fullWidth
                onClick={() => requestW({ address, abi: ArisanGroupABI, functionName: "requestWithdrawal", args: [parseUnits(withdrawAmount||"0",18), withdrawReason] })}
                disabled={wPending || wConfirming || !withdrawAmount || !withdrawReason}>
                {(wPending || wConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                {wPending ? "Confirm…" : wConfirming ? "Submitting…" : wDone ? "Submitted ✓" : "Request Withdrawal"}
              </Button>
            </Card>
          )}

          {activeRequestId > 0 && isMember && (
            <div className="rounded-2xl bg-[#14532D] p-6 card-shadow">
              <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-[#86EFAC]" /><p className="text-[#86EFAC] text-sm font-semibold">Vote Active</p></div>
              <h2 className="text-white text-xl font-semibold mb-2">Request #{activeRequestId}</h2>
              <p className="text-white/50 text-sm mb-1">AI has validated this request. Cast your reputation-weighted vote.</p>
              <VoteStatus group={address} requestId={activeRequestId} />
              <div className="flex gap-3">
                <button onClick={() => castVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "castVote", args: [address, BigInt(activeRequestId), true] })}
                  disabled={voting} className="flex-1 flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-semibold py-3 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => castVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "castVote", args: [address, BigInt(activeRequestId), false] })}
                  disabled={voting} className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
              <button onClick={() => finalizeVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "finalize", args: [address, BigInt(activeRequestId)] })}
                disabled={fPending || fConfirming}
                className="w-full mt-3 flex items-center justify-center gap-2 border border-white/20 text-white/80 font-medium py-2.5 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 text-sm">
                {(fPending || fConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                {fPending ? "Confirm…" : fConfirming ? "Finalizing…" : fDone ? "Finalized ✓" : "Finalize Vote"}
              </button>
              <p className="text-white/35 text-xs mt-2 text-center">Anyone can finalize once the window closes or quorum is reached.</p>
            </div>
          )}
        </div>

        {/* Members */}
        <Card className="h-fit">
          <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-black/40" /><h2 className="text-black text-lg font-semibold">Members</h2></div>
          {members?.length ? (
            <ul className="space-y-2.5">
              {members.map((m, i) => (
                <li key={m} className="flex items-center gap-3 text-sm">
                  <span className="w-7 h-7 rounded-full bg-[#86EFAC]/30 flex items-center justify-center text-xs font-bold text-[#14532D] shrink-0">{i + 1}</span>
                  <span className="font-mono text-black/70 flex-1 truncate">{m.slice(0,8)}…{m.slice(-6)}</span>
                  {m.toLowerCase() === wallet?.toLowerCase() && <span className="text-xs bg-[#86EFAC] text-black px-2 py-0.5 rounded-full font-medium">you</span>}
                </li>
              ))}
            </ul>
          ) : <p className="text-black/30 text-sm">Loading…</p>}
        </Card>
      </div>
    </PageContainer>
  );
}
