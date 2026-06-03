"use client";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, TOKENS, TOKEN_LABELS } from "@/lib/chain";
import { GroupRegistryABI } from "@/abis/GroupRegistry";
import { CheckCircle, Loader } from "lucide-react";
import Link from "next/link";

const TOKEN_OPTIONS = Object.entries(TOKENS).map(([k, v]) => ({ label: k, value: v as `0x${string}` }));

export function DesktopCreateGroup() {
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
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-10">
      <div className="max-w-[88rem] mx-auto">
        <h1 className="text-4xl font-medium text-black mb-2" style={{ letterSpacing: "-0.03em" }}>Create Group</h1>
        <p className="text-black/50 mb-10">Start a new arisan group on Celo.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Form */}
          {!isConnected ? (
            <div className="rounded-2xl bg-[#86EFAC]/20 border border-[#86EFAC] p-10 text-center col-span-full">
              <p className="text-black font-medium text-lg">Connect your wallet to create a group.</p>
            </div>
          ) : isSuccess ? (
            <div className="rounded-2xl bg-[#14532D] p-10 text-center col-span-full">
              <CheckCircle className="w-14 h-14 text-[#86EFAC] mx-auto mb-4" />
              <p className="text-white text-2xl font-medium">Group Created!</p>
              <p className="text-white/50 mt-1">Your arisan group is now live on Celo.</p>
              <Link href="/app" className="inline-block mt-6 bg-[#86EFAC] text-black px-8 py-3 rounded-full font-medium hover:bg-[#4ADE80] transition-colors">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-white p-8 space-y-6 border border-black/5">
                {/* Token */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Deposit Token</label>
                  <div className="flex gap-2">
                    {TOKEN_OPTIONS.map(({ label, value }) => (
                      <button key={value} onClick={() => setToken(value)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${token === value ? "bg-[#86EFAC] text-black" : "bg-black/5 text-black/60 hover:bg-black/10"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Deposit Amount ({TOKEN_LABELS[token]})</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 10"
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC] transition-colors" />
                </div>
                {/* Max members */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Max Members <span className="text-black/40">(5–15)</span></label>
                  <input type="number" min="5" max="15" value={maxMembers} onChange={e => setMaxMembers(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC] transition-colors" />
                </div>
                {/* Round duration */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Round Duration (days)</label>
                  <div className="flex gap-2">
                    {["7","30","90"].map(d => (
                      <button key={d} onClick={() => setRoundDays(d)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${roundDays === d ? "bg-[#86EFAC] text-black" : "bg-black/5 text-black/60 hover:bg-black/10"}`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Group Name <span className="text-black/40">(optional)</span></label>
                  <input type="text" value={metaURI} onChange={e => setMetaURI(e.target.value)} placeholder="My Arisan Group"
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-[#86EFAC] transition-colors" />
                </div>
                <button onClick={handleCreate} disabled={isPending || isConfirming || !amount}
                  className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-3.5 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50">
                  {(isPending || isConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                  {isPending ? "Confirm in wallet…" : isConfirming ? "Creating…" : "Create Group"}
                </button>
              </div>

              {/* Info card */}
              <div className="rounded-2xl bg-[#14532D] p-8 text-white">
                <h3 className="text-xl font-medium mb-4">How groups work</h3>
                <ul className="space-y-3 text-white/70 text-sm">
                  <li>① Create a group with fixed deposit amount and token</li>
                  <li>② Invite 5–15 members to join your group</li>
                  <li>③ Every member deposits each round</li>
                  <li>④ One member requests withdrawal per round</li>
                  <li>⑤ AI validates the request in &lt;10 seconds</li>
                  <li>⑥ Members vote — weighted by reputation score</li>
                  <li>⑦ Treasury releases funds if vote passes</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/40 text-xs">Confidence ≥85% → fast-track (30% quorum, 12h)</p>
                  <p className="text-white/40 text-xs mt-1">Confidence 50–84% → normal (60% quorum, 24h)</p>
                  <p className="text-white/40 text-xs mt-1">Confidence &lt;50% → auto-rejected</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
