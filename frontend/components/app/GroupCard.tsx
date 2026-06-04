"use client";
import { useReadContracts } from "wagmi";
import { ArisanGroupABI } from "@/abis/ArisanGroup";
import { TOKEN_LABELS } from "@/lib/chain";
import { ChevronRight } from "lucide-react";
import { formatUnits } from "viem";
import Link from "next/link";

export function GroupCard({ address }: { address: `0x${string}` }) {
  const { data } = useReadContracts({
    contracts: [
      { address, abi: ArisanGroupABI, functionName: "memberCount" },
      { address, abi: ArisanGroupABI, functionName: "maxMembers" },
      { address, abi: ArisanGroupABI, functionName: "depositToken" },
      { address, abi: ArisanGroupABI, functionName: "depositAmount" },
      { address, abi: ArisanGroupABI, functionName: "currentRound" },
      { address, abi: ArisanGroupABI, functionName: "activeRequestId" },
    ],
  });

  const memberCount  = data?.[0]?.result ? Number(data[0].result) : 0;
  const maxMembers   = data?.[1]?.result ? Number(data[1].result) : 0;
  const token        = data?.[2]?.result as `0x${string}` | undefined;
  const depositAmt   = data?.[3]?.result as bigint | undefined;
  const currentRound = data?.[4]?.result ? Number(data[4].result) : 1;
  const hasRequest   = data?.[5]?.result ? Number(data[5].result) > 0 : false;

  const tokenLabel = token ? (TOKEN_LABELS[token] ?? "ERC-20") : "—";
  const amount     = depositAmt ? formatUnits(depositAmt, 18) : "—";
  const fillPct    = memberCount && maxMembers ? (memberCount / maxMembers) * 100 : 0;

  return (
    <Link href={`/app/groups/${address}`}
      className="block bg-white rounded-2xl overflow-hidden active:bg-black/[0.03] transition-colors"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.06)" }}>
      <div className="px-4 py-4 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-2xl bg-[#86EFAC] flex items-center justify-center shrink-0 text-xl">
          🏦
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="font-semibold text-black text-sm truncate">
              {address.slice(0, 6)}…{address.slice(-4)}
            </p>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {hasRequest && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
              <ChevronRight className="w-4 h-4 text-black/20" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-black/45">
            <span>{memberCount}/{maxMembers} members</span>
            <span className="w-0.5 h-0.5 rounded-full bg-black/20" />
            <span>{amount} {tokenLabel}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-black/20" />
            <span>Round #{currentRound}</span>
          </div>

          {/* Fill bar */}
          <div className="mt-2 h-1 rounded-full bg-black/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-[#86EFAC] transition-all duration-500"
              style={{ width: `${fillPct}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
