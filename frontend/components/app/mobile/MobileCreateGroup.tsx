"use client";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, TOKENS, TOKEN_LABELS } from "@/lib/chain";
import { GroupRegistryABI } from "@/abis/GroupRegistry";
import { CheckCircle, Loader, ChevronLeft } from "lucide-react";
import Link from "next/link";

const TOKEN_OPTIONS = Object.entries(TOKENS).map(([k, v]) => ({ label: k, value: v as `0x${string}` }));

export function MobileCreateGroup() {
  const { isConnected } = useAccount();
  const [token, setToken] = useState<`0x${string}`>(TOKENS.CELO);
  const [amount, setAmount] = useState("");
  const [maxMembers, setMaxMembers] = useState("10");
  const [roundDays, setRoundDays] = useState("30");
  const [metaURI, setMetaURI] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function handleCreate() {
    if (!amount) return;
    writeContract({
      address: CONTRACTS.groupRegistry,
      abi: GroupRegistryABI,
      functionName: "createGroup",
      args: [token, parseUnits(amount, 18), BigInt(maxMembers), BigInt(Number(roundDays) * 86400), metaURI],
    });
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <div className="bg-[#F5F5F5] px-4 pt-4 pb-2 flex items-center gap-3 sticky top-16 z-10 border-b border-black/5">
        <Link href="/app" className="p-2 rounded-xl hover:bg-black/5 transition-colors">
          <ChevronLeft className="w-5 h-5 text-black" />
        </Link>
        <h1 className="text-xl font-medium text-black">New Group</h1>
      </div>

      <div className="px-4 pt-5">
        {!isConnected ? (
          <div className="rounded-2xl bg-[#86EFAC]/20 border border-[#86EFAC] p-6 text-center mt-4">
            <p className="text-black font-medium">Connect your wallet first.</p>
          </div>
        ) : isSuccess ? (
          <div className="rounded-2xl bg-[#14532D] p-8 text-center mt-4">
            <CheckCircle className="w-12 h-12 text-[#86EFAC] mx-auto mb-3" />
            <p className="text-white text-xl font-medium">Group Created!</p>
            <p className="text-white/50 text-sm mt-1">Your arisan is live on Celo.</p>
            <Link href="/app" className="inline-block mt-6 bg-[#86EFAC] text-black px-6 py-2.5 rounded-full font-medium">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-black/50 uppercase tracking-wider mb-2">Token</label>
              <div className="flex gap-2">
                {TOKEN_OPTIONS.map(({ label, value }) => (
                  <button key={value} onClick={() => setToken(value)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-colors ${token === value ? "bg-[#86EFAC] text-black" : "bg-white text-black/50"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-black/50 uppercase tracking-wider mb-2">
                Amount ({TOKEN_LABELS[token]})
              </label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 10"
                className="w-full rounded-2xl bg-white border border-black/5 px-4 py-4 text-base focus:outline-none focus:border-[#86EFAC]" />
            </div>

            <div>
              <label className="block text-xs font-medium text-black/50 uppercase tracking-wider mb-2">Max Members (5–15)</label>
              <div className="flex gap-2 flex-wrap">
                {[5,7,10,12,15].map(n => (
                  <button key={n} onClick={() => setMaxMembers(String(n))}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${maxMembers === String(n) ? "bg-[#86EFAC] text-black" : "bg-white text-black/50"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-black/50 uppercase tracking-wider mb-2">Round Duration</label>
              <div className="flex gap-2">
                {[{l:"7 days",v:"7"},{l:"30 days",v:"30"},{l:"90 days",v:"90"}].map(({l,v}) => (
                  <button key={v} onClick={() => setRoundDays(v)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${roundDays === v ? "bg-[#86EFAC] text-black" : "bg-white text-black/50"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-black/50 uppercase tracking-wider mb-2">Group Name (optional)</label>
              <input type="text" value={metaURI} onChange={e => setMetaURI(e.target.value)} placeholder="My Arisan Group"
                className="w-full rounded-2xl bg-white border border-black/5 px-4 py-4 text-base focus:outline-none focus:border-[#86EFAC]" />
            </div>

            <button onClick={handleCreate} disabled={isPending || isConfirming || !amount}
              className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-4 rounded-2xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50 mt-2">
              {(isPending || isConfirming) && <Loader className="w-4 h-4 animate-spin" />}
              {isPending ? "Confirm in wallet…" : isConfirming ? "Creating…" : "Create Group"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
