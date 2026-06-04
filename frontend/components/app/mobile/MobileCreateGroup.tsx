"use client";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, TOKENS, TOKEN_LABELS } from "@/lib/chain";
import { GroupRegistryABI } from "@/abis/GroupRegistry";
import { CheckCircle2, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

const TOKEN_OPTIONS = Object.entries(TOKENS).map(([k, v]) => ({ label: k, value: v as `0x${string}` }));
const MEMBER_OPTIONS = [5, 7, 10, 12, 15];
const DURATION_OPTIONS = [{ label: "1 week", days: 7 }, { label: "30 days", days: 30 }, { label: "90 days", days: 90 }];

export function MobileCreateGroup() {
  const { isConnected } = useAccount();
  const [token, setToken] = useState<`0x${string}`>(TOKENS.CELO);
  const [amount, setAmount] = useState("");
  const [maxMembers, setMaxMembers] = useState(10);
  const [roundDays, setRoundDays] = useState(30);
  const [metaURI, setMetaURI] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function handleCreate() {
    if (!amount) return;
    writeContract({
      address: CONTRACTS.groupRegistry,
      abi: GroupRegistryABI,
      functionName: "createGroup",
      args: [token, parseUnits(amount, 18), BigInt(maxMembers), BigInt(roundDays * 86400), metaURI],
    });
  }

  if (isSuccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F2F2F7" }}>
      <div className="w-20 h-20 rounded-full bg-[#86EFAC] flex items-center justify-center mb-5 shadow-lg shadow-green-200">
        <CheckCircle2 className="w-10 h-10 text-[#14532D]" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-black mb-2">Group Created!</h2>
      <p className="text-black/50 text-sm mb-8">Your arisan is now live on Celo.</p>
      <Link href="/app" className="bg-[#86EFAC] text-black font-semibold px-8 py-3 rounded-full text-base">
        Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F2F7" }}>
      {/* Back header */}
      <div className="flex items-center gap-2 px-2 pt-3 pb-1">
        <Link href="/app" className="flex items-center gap-0.5 text-[#16A34A] font-medium px-2 py-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Home</span>
        </Link>
      </div>

      <div className="px-4 pb-2">
        <h1 className="text-3xl font-bold text-black tracking-tight">New Group</h1>
        <p className="text-sm text-black/45 mt-1">Deploy an arisan group on Celo</p>
      </div>

      {!isConnected ? (
        <div className="mx-4 mt-4 bg-white rounded-2xl card-shadow px-5 py-8 text-center">
          <p className="text-black font-semibold">Connect wallet to continue</p>
        </div>
      ) : (
        <div className="px-4 space-y-5 mt-4 pb-8">

          {/* Token */}
          <div>
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">Deposit Token</p>
            <div className="bg-white rounded-2xl card-shadow overflow-hidden divide-y divide-black/[0.06]">
              {TOKEN_OPTIONS.map(({ label, value }) => (
                <button key={value} onClick={() => setToken(value)}
                  className="w-full flex items-center justify-between px-4 py-4 active:bg-black/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      token === value ? "bg-[#86EFAC] text-[#14532D]" : "bg-[#F2F2F7] text-black/50"}`}>
                      {label[0]}
                    </div>
                    <span className={`font-medium text-sm ${token === value ? "text-black" : "text-black/60"}`}>{label}</span>
                  </div>
                  {token === value && (
                    <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">
              Deposit Amount <span className="normal-case font-normal">({TOKEN_LABELS[token] ?? "token"} per round)</span>
            </p>
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="flex items-center px-4">
                <span className="text-black/30 text-lg font-medium mr-2">{token === TOKENS.USDC || token === TOKENS.USDT ? "$" : "𝐶"}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 py-4 text-xl font-semibold text-black bg-transparent outline-none placeholder:text-black/20"
                />
                <span className="text-black/40 text-sm font-medium">{TOKEN_LABELS[token]}</span>
              </div>
            </div>
          </div>

          {/* Max members */}
          <div>
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">Max Members</p>
            <div className="flex gap-2">
              {MEMBER_OPTIONS.map(n => (
                <button key={n} onClick={() => setMaxMembers(n)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    maxMembers === n
                      ? "bg-[#14532D] text-white shadow-sm"
                      : "bg-white text-black/50 active:bg-black/5"
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Round duration */}
          <div>
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">Round Duration</p>
            <div className="bg-white rounded-2xl card-shadow overflow-hidden divide-y divide-black/[0.06]">
              {DURATION_OPTIONS.map(({ label, days }) => (
                <button key={days} onClick={() => setRoundDays(days)}
                  className="w-full flex items-center justify-between px-4 py-4 active:bg-black/5 transition-colors">
                  <span className={`font-medium text-sm ${roundDays === days ? "text-black" : "text-black/55"}`}>{label}</span>
                  {roundDays === days && (
                    <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Group name */}
          <div>
            <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">Group Name <span className="normal-case font-normal">(optional)</span></p>
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <input
                type="text"
                value={metaURI}
                onChange={e => setMetaURI(e.target.value)}
                placeholder="My Arisan Group"
                className="w-full px-4 py-4 text-sm text-black bg-transparent outline-none placeholder:text-black/25"
              />
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleCreate} disabled={isPending || isConfirming || !amount}
            className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-bold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-[0.98] transition-transform shadow-sm shadow-green-200">
            {(isPending || isConfirming) && <Loader2 className="w-5 h-5 animate-spin" />}
            {isPending ? "Confirm in wallet…" : isConfirming ? "Creating group…" : "Create Group"}
          </button>
        </div>
      )}
    </div>
  );
}
