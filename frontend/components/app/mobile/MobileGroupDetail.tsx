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
import { Loader2, CheckCircle2, XCircle, ChevronLeft, Clock3, UserPlus } from "lucide-react";
import Link from "next/link";

type Tab = "overview" | "deposit" | "vote";

export function MobileGroupDetail({ address }: { address: `0x${string}` }) {
  const { address: wallet } = useAccount();
  const [tab, setTab] = useState<Tab>("overview");
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
  const maxMembers  = data?.[1]?.result ? Number(data[1].result) : 0;
  const token       = data?.[2]?.result as `0x${string}` | undefined;
  const depositAmt  = data?.[3]?.result as bigint | undefined;
  const round       = data?.[4]?.result ? Number(data[4].result) : 1;
  const requestId   = data?.[5]?.result ? Number(data[5].result) : 0;
  const members     = data?.[6]?.result as `0x${string}`[] | undefined;
  const creator     = data?.[7]?.result as `0x${string}` | undefined;
  const isMember    = memberCheck?.[0]?.result as boolean | undefined;
  const isInvited   = memberCheck?.[1]?.result as boolean | undefined;
  const isCreator   = !!creator && !!wallet && creator.toLowerCase() === wallet.toLowerCase();
  const canJoin     = !!isInvited && !isMember;

  const { data: tokenDecimals } = useReadContract({
    address: token, abi: ERC20ABI, functionName: "decimals", query: { enabled: !!token },
  });
  const decimals    = tokenDecimals !== undefined ? Number(tokenDecimals) : 18;
  const tokenLabel  = token ? (TOKEN_LABELS[token] ?? "token") : "—";
  const depositFmt  = depositAmt ? formatUnits(depositAmt, decimals) : "—";
  const fillPct     = memberCount && maxMembers ? (memberCount / maxMembers) * 100 : 0;

  const { writeContract: reqW, data: wHash, isPending: wPending } = useWriteContract();
  const { isLoading: wConfirm, isSuccess: wDone } = useWaitForTransactionReceipt({ hash: wHash });
  const { writeContract: castVote, isPending: voting } = useWriteContract();
  const { writeContract: finalizeVote, data: fHash, isPending: fPending } = useWriteContract();
  const { isLoading: fConfirm, isSuccess: fDone } = useWaitForTransactionReceipt({ hash: fHash });
  const { writeContract: invite, data: iHash, isPending: iPending } = useWriteContract();
  const { isLoading: iConfirm, isSuccess: iDone } = useWaitForTransactionReceipt({ hash: iHash });
  const { writeContract: join, data: jHash, isPending: jPending } = useWriteContract();
  const { isLoading: jConfirm, isSuccess: jDone } = useWaitForTransactionReceipt({ hash: jHash });

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

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "deposit",  label: "Deposit" },
    { id: "vote",     label: `Vote${requestId ? " 🔴" : ""}` },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F2F7" }}>

      {/* Back nav */}
      <div className="flex items-center gap-1 px-2 pt-3 pb-0">
        <Link href="/app" className="flex items-center gap-0.5 text-[#16A34A] font-medium px-2 py-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Groups</span>
        </Link>
      </div>

      {/* Title */}
      <div className="px-4 pb-3">
        <h1 className="text-2xl font-bold text-black tracking-tight">Group Detail</h1>
        <p className="text-xs text-black/35 font-mono mt-0.5">{address.slice(0,10)}…{address.slice(-8)}</p>
      </div>

      {/* Stats grid */}
      <div className="px-4 mb-4 grid grid-cols-2 gap-2.5">
        {[
          { label: "Members",  value: `${memberCount} / ${maxMembers}` },
          { label: "Round",    value: `#${round}` },
          { label: "Deposit",  value: `${depositFmt} ${tokenLabel}` },
          { label: "Request",  value: requestId ? `#${requestId} active` : "None" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl card-shadow px-4 py-3.5">
            <p className="text-xs text-black/40 mb-0.5">{label}</p>
            <p className="font-semibold text-black text-sm">{value}</p>
          </div>
        ))}
        {/* Fill bar spanning both cols */}
        <div className="col-span-2 bg-white rounded-2xl card-shadow px-4 py-3">
          <div className="flex justify-between text-xs text-black/40 mb-1.5">
            <span>Group capacity</span>
            <span>{Math.round(fillPct)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
            <div className="h-full rounded-full bg-[#86EFAC] transition-all" style={{ width: `${fillPct}%` }} />
          </div>
        </div>
      </div>

      {/* Segmented control */}
      <div className="px-4 mb-4">
        <div className="bg-black/8 rounded-xl p-1 flex gap-1" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                tab === t.id
                  ? "bg-white text-black shadow-sm"
                  : "text-black/50"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">

        {/* ── Overview tab ── */}
        {tab === "overview" && (
          <div>
            {canJoin && (
              <div className="bg-[#86EFAC]/15 border border-[#86EFAC] rounded-2xl px-4 py-4 mb-4">
                <p className="font-semibold text-black text-sm mb-1">You&apos;re invited 🎉</p>
                <p className="text-xs text-black/55 mb-3">Join to start depositing and voting.</p>
                <button
                  onClick={() => join({ address, abi: ArisanGroupABI, functionName: "join" })}
                  disabled={jPending || jConfirm}
                  className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-semibold py-3 rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  {(jPending || jConfirm) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {jPending ? "Confirm…" : jConfirm ? "Joining…" : jDone ? "Joined ✓" : "Join Group"}
                </button>
              </div>
            )}
            {isCreator && (
              <div className="bg-white rounded-2xl card-shadow px-4 py-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-4 h-4 text-black/40" />
                  <p className="font-semibold text-black text-sm">Invite Member</p>
                </div>
                <input
                  type="text"
                  placeholder="0x… (comma-separate for multiple)"
                  value={inviteAddr}
                  onChange={e => setInviteAddr(e.target.value)}
                  className="w-full bg-[#F2F2F7] rounded-xl px-3 py-3 text-sm font-mono text-black outline-none placeholder:text-black/25 mb-2"
                />
                <button
                  onClick={handleInvite}
                  disabled={iPending || iConfirm || !canInvite}
                  className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-semibold py-3 rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  {(iPending || iConfirm) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {iPending ? "Confirm…" : iConfirm ? "Inviting…" : iDone ? "Invited ✓" : validInvites.length > 1 ? `Invite ${validInvites.length}` : "Send Invite"}
                </button>
              </div>
            )}
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">Members</p>
            <div className="bg-white rounded-2xl card-shadow overflow-hidden divide-y divide-black/[0.06]">
              {members?.length ? members.map((m, i) => (
                <div key={m} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#86EFAC]/30 flex items-center justify-center text-xs font-bold text-[#14532D] shrink-0">
                    {i + 1}
                  </div>
                  <span className="font-mono text-sm text-black/70 flex-1 truncate">{m.slice(0,8)}…{m.slice(-6)}</span>
                  {m.toLowerCase() === wallet?.toLowerCase() && (
                    <span className="text-xs bg-[#86EFAC] text-black px-2 py-0.5 rounded-full font-medium shrink-0">you</span>
                  )}
                </div>
              )) : (
                <div className="px-4 py-6 text-center text-sm text-black/35">Loading members…</div>
              )}
            </div>
          </div>
        )}

        {/* ── Deposit tab ── */}
        {tab === "deposit" && (
          <div className="space-y-4">
            {isMember ? (
              <>
                <div className="bg-white rounded-2xl card-shadow px-5 py-5">
                  <p className="text-xs text-black/40 mb-1">Fixed deposit this round</p>
                  <p className="text-3xl font-bold text-black mb-4">{depositFmt} <span className="text-lg font-medium text-black/50">{tokenLabel}</span></p>
                  <DepositPanel group={address} token={token} owner={wallet} depositAmount={depositAmt} depositFmt={depositFmt} tokenLabel={tokenLabel} size="lg" />
                </div>

                {!requestId && (
                  <div className="bg-white rounded-2xl card-shadow overflow-hidden">
                    <div className="px-4 pt-5 pb-3 border-b border-black/[0.06]">
                      <p className="font-semibold text-black text-sm">Request Withdrawal</p>
                      <p className="text-xs text-black/40 mt-0.5">Submit a request for this round</p>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex items-center bg-[#F2F2F7] rounded-xl overflow-hidden">
                        <span className="text-black/30 text-sm pl-3 shrink-0">{tokenLabel}</span>
                        <input type="number" inputMode="decimal" placeholder="0.00" value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          className="flex-1 px-3 py-3.5 text-sm text-black bg-transparent outline-none placeholder:text-black/25" />
                      </div>
                      <input type="text" placeholder="Reason for withdrawal"
                        value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)}
                        className="w-full bg-[#F2F2F7] rounded-xl px-3 py-3.5 text-sm text-black outline-none placeholder:text-black/25" />
                    </div>
                    <div className="px-4 pb-4">
                      <button onClick={() => reqW({ address, abi: ArisanGroupABI, functionName: "requestWithdrawal", args: [parseUnits(withdrawAmount||"0",18), withdrawReason] })}
                        disabled={wPending || wConfirm || !withdrawAmount || !withdrawReason}
                        className="w-full flex items-center justify-center gap-2 bg-[#14532D] text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform">
                        {(wPending || wConfirm) && <Loader2 className="w-4 h-4 animate-spin" />}
                        {wPending ? "Confirm…" : wConfirm ? "Submitting…" : wDone ? "Submitted ✓" : "Submit Request"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl card-shadow px-5 py-8 text-center">
                <p className="text-black/40 text-sm">You are not a member of this group.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Vote tab ── */}
        {tab === "vote" && (
          requestId > 0 && isMember ? (
            <div className="bg-[#14532D] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock3 className="w-4 h-4 text-[#86EFAC]" />
                <span className="text-[#86EFAC] text-sm font-semibold">Vote Active</span>
              </div>
              <h3 className="text-white text-xl font-bold mb-1">Request #{requestId}</h3>
              <p className="text-white/50 text-sm mb-1 leading-relaxed">
                AI has validated this request. Your vote is weighted by your reputation score.
              </p>
              <VoteStatus group={address} requestId={requestId} />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => castVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "castVote", args: [address, BigInt(requestId), true] })}
                  disabled={voting}
                  className="flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-bold py-4 rounded-2xl active:scale-[0.97] transition-transform disabled:opacity-50">
                  <CheckCircle2 className="w-5 h-5" strokeWidth={2} /> Approve
                </button>
                <button onClick={() => castVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "castVote", args: [address, BigInt(requestId), false] })}
                  disabled={voting}
                  className="flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-4 rounded-2xl active:scale-[0.97] transition-transform disabled:opacity-50">
                  <XCircle className="w-5 h-5" strokeWidth={2} /> Reject
                </button>
              </div>
              <button onClick={() => finalizeVote({ address: CONTRACTS.votingEngine, abi: VotingEngineABI, functionName: "finalize", args: [address, BigInt(requestId)] })}
                disabled={fPending || fConfirm}
                className="w-full mt-3 flex items-center justify-center gap-2 border border-white/20 text-white/80 font-semibold py-3 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50 text-sm">
                {(fPending || fConfirm) && <Loader2 className="w-4 h-4 animate-spin" />}
                {fPending ? "Confirm…" : fConfirm ? "Finalizing…" : fDone ? "Finalized ✓" : "Finalize Vote"}
              </button>
              <p className="text-white/35 text-xs mt-2 text-center">Anyone can finalize once the window closes or quorum is reached.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl card-shadow px-5 py-10 text-center">
              <div className="text-3xl mb-3">🗳️</div>
              <p className="font-medium text-black/50 text-sm">No active vote</p>
              <p className="text-xs text-black/30 mt-1">Votes appear here when a withdrawal is requested</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
