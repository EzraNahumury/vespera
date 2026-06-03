import { useReadContracts } from "wagmi";
import { ArisanGroupABI } from "../../abis/ArisanGroup";
import { TOKEN_LABELS } from "../../lib/chain";
import { Users } from "lucide-react";
import { formatUnits } from "viem";

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

  const memberCount = data?.[0]?.result ? Number(data[0].result) : "—";
  const maxMembers = data?.[1]?.result ? Number(data[1].result) : "—";
  const token = data?.[2]?.result as `0x${string}` | undefined;
  const depositAmount = data?.[3]?.result as bigint | undefined;
  const currentRound = data?.[4]?.result ? Number(data[4].result) : "—";

  const tokenLabel = token ? (TOKEN_LABELS[token] ?? "ERC-20") : "—";
  const amount = depositAmount ? formatUnits(depositAmount, 18) : "—";

  return (
    <a
      href={`#group/${address}`}
      className="block rounded-2xl bg-white p-6 hover:shadow-md transition-shadow border border-black/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-[#86EFAC] flex items-center justify-center">
          <Users className="w-5 h-5 text-black" />
        </div>
        <span className="text-xs text-black/40 font-mono">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-black/50">Members</span>
          <span className="font-medium text-black">{memberCount} / {maxMembers}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-black/50">Deposit</span>
          <span className="font-medium text-black">{amount} {tokenLabel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-black/50">Round</span>
          <span className="font-medium text-black">#{currentRound}</span>
        </div>
      </div>

      {/* Member fill bar */}
      {typeof memberCount === "number" && typeof maxMembers === "number" && (
        <div className="mt-4 h-1.5 rounded-full bg-black/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#86EFAC]"
            style={{ width: `${(memberCount / maxMembers) * 100}%` }}
          />
        </div>
      )}
    </a>
  );
}
