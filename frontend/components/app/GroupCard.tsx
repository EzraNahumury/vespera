"use client";
import { useReadContracts } from "wagmi";
import { ArisanGroupABI } from "@/abis/ArisanGroup";
import { TOKEN_LABELS } from "@/lib/chain";
import { Users } from "lucide-react";
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
    ],
  });

  const memberCount = data?.[0]?.result ? Number(data[0].result) : 0;
  const maxMembers = data?.[1]?.result ? Number(data[1].result) : 0;
  const token = data?.[2]?.result as `0x${string}` | undefined;
  const depositAmount = data?.[3]?.result as bigint | undefined;
  const currentRound = data?.[4]?.result ? Number(data[4].result) : 1;

  const tokenLabel = token ? (TOKEN_LABELS[token] ?? "ERC-20") : "—";
  const amount = depositAmount ? formatUnits(depositAmount, 18) : "—";

  return (
    <Link href={`/app/groups/${address}`} className="block rounded-2xl bg-white p-6 hover:shadow-md transition-shadow border border-black/5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-[#86EFAC] flex items-center justify-center">
          <Users className="w-5 h-5 text-black" />
        </div>
        <span className="text-xs text-black/40 font-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>
      </div>
      <div className="space-y-1 mb-4">
        {[
          { label: "Members", value: `${memberCount} / ${maxMembers}` },
          { label: "Deposit", value: `${amount} ${tokenLabel}` },
          { label: "Round", value: `#${currentRound}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-black/50">{label}</span>
            <span className="font-medium text-black">{value}</span>
          </div>
        ))}
      </div>
      {memberCount > 0 && maxMembers > 0 && (
        <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
          <div className="h-full rounded-full bg-[#86EFAC]" style={{ width: `${(memberCount / maxMembers) * 100}%` }} />
        </div>
      )}
    </Link>
  );
}
