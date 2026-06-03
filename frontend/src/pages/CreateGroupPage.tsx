import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, TOKENS, TOKEN_LABELS } from "../lib/chain";
import { GroupRegistryABI } from "../abis/GroupRegistry";
import { CheckCircle, Loader } from "lucide-react";

const TOKEN_OPTIONS = Object.entries(TOKENS).map(([k, v]) => ({ label: k, value: v }));

export function CreateGroupPage() {
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
      args: [
        token,
        parseUnits(amount, 18),
        BigInt(maxMembers),
        BigInt(Number(roundDays) * 86400),
        metaURI,
      ],
    });
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-10">
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl font-medium text-black mb-2" style={{ letterSpacing: "-0.03em" }}>
          Create Group
        </h1>
        <p className="text-black/50 mb-10">Start a new arisan group on Celo.</p>

        {!isConnected ? (
          <div className="rounded-2xl bg-[#86EFAC]/20 border border-[#86EFAC] p-6 text-center">
            <p className="text-black font-medium">Connect your wallet to create a group.</p>
          </div>
        ) : isSuccess ? (
          <div className="rounded-2xl bg-[#14532D] p-8 text-center">
            <CheckCircle className="w-12 h-12 text-[#86EFAC] mx-auto mb-3" />
            <p className="text-white text-xl font-medium">Group Created!</p>
            <p className="text-white/50 text-sm mt-1">Your arisan group is now live on Celo.</p>
            <a href="#" className="inline-block mt-6 bg-[#86EFAC] text-black px-6 py-2.5 rounded-full font-medium hover:bg-[#4ADE80] transition-colors">
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 space-y-6 border border-black/5">
            {/* Deposit Token */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Deposit Token</label>
              <div className="flex gap-2">
                {TOKEN_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setToken(value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      token === value
                        ? "bg-[#86EFAC] text-black"
                        : "bg-black/5 text-black/60 hover:bg-black/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Amount */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Deposit Amount ({TOKEN_LABELS[token] ?? token.slice(0, 6)})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-black text-sm focus:outline-none focus:border-[#86EFAC] transition-colors"
              />
            </div>

            {/* Max Members */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Max Members <span className="text-black/40">(5–15)</span>
              </label>
              <input
                type="number"
                min="5"
                max="15"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-black text-sm focus:outline-none focus:border-[#86EFAC] transition-colors"
              />
            </div>

            {/* Round Duration */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Round Duration (days)</label>
              <input
                type="number"
                min="1"
                value={roundDays}
                onChange={(e) => setRoundDays(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-black text-sm focus:outline-none focus:border-[#86EFAC] transition-colors"
              />
            </div>

            {/* Metadata URI */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Group Name / Metadata URI <span className="text-black/40">(optional)</span>
              </label>
              <input
                type="text"
                value={metaURI}
                onChange={(e) => setMetaURI(e.target.value)}
                placeholder="ipfs://... or group name"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-black text-sm focus:outline-none focus:border-[#86EFAC] transition-colors"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={isPending || isConfirming || !amount}
              className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-3.5 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {isPending ? "Confirm in wallet…" : "Creating…"}
                </>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
