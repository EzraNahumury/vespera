"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { VotingEngineABI } from "@/abis/VotingEngine";
import { CONTRACTS } from "@/lib/chain";

function fmtRemaining(secs: number) {
  if (secs <= 0) return "Voting closed";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m ${s}s left`;
  return `${s}s left`;
}

/**
 * Live vote progress for an active request: quorum bar, for/against weight,
 * and a countdown to the voting deadline. Styled for a dark background.
 */
export function VoteStatus({ group, requestId }: { group: `0x${string}`; requestId: number }) {
  const { data } = useReadContract({
    address: CONTRACTS.votingEngine,
    abi: VotingEngineABI,
    functionName: "getVote",
    args: [group, BigInt(requestId)],
    query: { refetchInterval: 15000 },
  });

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data) return null;

  const v = data as readonly unknown[];
  const quorumBps = Number(v[4]);
  const deadline = Number(v[5]);
  const fastTrack = Boolean(v[6]);
  const total = Number(v[10] as bigint);
  const forN = Number(v[8] as bigint);
  const againstN = Number(v[9] as bigint);

  const pct = (n: number) => (total > 0 ? Math.min(100, (n / total) * 100) : 0);
  const forPct = pct(forN);
  const againstPct = pct(againstN);
  const quorumPct = total > 0 ? Math.min(100, (quorumBps / 10000) * 100) : 0;
  const remaining = deadline - now;

  return (
    <div className="mt-5 mb-5">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-white/60">
          {fastTrack ? "Fast-track" : "Standard"} · {quorumBps / 100}% quorum
        </span>
        <span className={remaining <= 0 ? "text-[#FCA5A5]" : "text-[#86EFAC]"}>
          {fmtRemaining(remaining)}
        </span>
      </div>

      {/* Weight bar with quorum marker */}
      <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div className="absolute left-0 top-0 h-full bg-[#86EFAC]" style={{ width: `${forPct}%` }} />
        <div className="absolute top-0 h-full bg-[#FCA5A5]" style={{ left: `${forPct}%`, width: `${againstPct}%` }} />
      </div>
      {/* Quorum line */}
      <div className="relative h-0">
        <div className="absolute -top-2.5 w-0.5 h-2.5 bg-white/70" style={{ left: `${quorumPct}%` }} title="Quorum" />
      </div>

      <div className="flex items-center justify-between text-xs mt-3">
        <span className="text-[#86EFAC]">For: {forN}</span>
        <span className="text-white/40">Eligible: {total}</span>
        <span className="text-[#FCA5A5]">Against: {againstN}</span>
      </div>
    </div>
  );
}
