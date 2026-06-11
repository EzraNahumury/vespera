"use client";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, TOKENS, CREDIT_SYMBOL } from "@/lib/chain";
import { GroupRegistryABI } from "@/abis/GroupRegistry";
import { PageContainer, PageHeader, Card, Button, ButtonLink } from "@/components/ui/primitives";
import { CheckCircle, Loader } from "lucide-react";

// Deposits are denominated in in-game credits now; the on-chain depositToken
// field is just a free-form label, so we pass a fixed marker address.
const DEPOSIT_LABEL = TOKENS.CELO;

export function DesktopCreateGroup() {
  const { isConnected } = useAccount();
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
      args: [DEPOSIT_LABEL, parseUnits(amount, 18), BigInt(maxMembers), BigInt(Number(roundDays) * 86400), metaURI],
    });
  }

  const inputCls = "w-full rounded-xl border border-black/[0.08] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[#86EFAC] transition-colors";
  const segBtn = (active: boolean) => `flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active ? "bg-[#86EFAC] text-black" : "bg-black/[0.05] text-black/60 hover:bg-black/[0.08]"}`;

  return (
    <PageContainer>
      <PageHeader title="Create Group" subtitle="Start a new arisan group on Celo." />

      {!isConnected ? (
        <div className="rounded-2xl bg-[#86EFAC]/15 border border-[#86EFAC] p-10 text-center">
          <p className="text-black font-semibold text-lg">Connect your wallet to create a group.</p>
        </div>
      ) : isSuccess ? (
        <div className="rounded-2xl bg-[#14532D] p-10 text-center card-shadow">
          <CheckCircle className="w-14 h-14 text-[#86EFAC] mx-auto mb-4" />
          <p className="text-white text-2xl font-bold">Group Created!</p>
          <p className="text-white/50 mt-1 mb-6">Your arisan group is now live on Celo.</p>
          <ButtonLink href="/app" className="!rounded-full">Go to Dashboard</ButtonLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Form */}
          <Card className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Deposit Amount ({CREDIT_SYMBOL})</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 100" className={inputCls} />
              <p className="text-xs text-black/40 mt-1.5">Per-round deposit in credits. Members top up credits with CELO (1 CELO = 1000 {CREDIT_SYMBOL}).</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Max Members <span className="text-black/40 font-normal">(5–15)</span></label>
              <input type="number" min="5" max="15" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Round Duration</label>
              <div className="flex gap-2">
                {["7","30","90"].map(d => (
                  <button key={d} onClick={() => setRoundDays(d)} className={segBtn(roundDays === d)}>{d} days</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Group Name <span className="text-black/40 font-normal">(optional)</span></label>
              <input type="text" value={metaURI} onChange={e => setMetaURI(e.target.value)} placeholder="My Arisan Group" className={inputCls} />
            </div>
            <Button fullWidth onClick={handleCreate} disabled={isPending || isConfirming || !amount}>
              {(isPending || isConfirming) && <Loader className="w-4 h-4 animate-spin" />}
              {isPending ? "Confirm in wallet…" : isConfirming ? "Creating…" : "Create Group"}
            </Button>
          </Card>

          {/* Info card */}
          <div className="rounded-2xl bg-[#14532D] p-8 text-white card-shadow">
            <h3 className="text-xl font-semibold mb-4">How groups work</h3>
            <ul className="space-y-3 text-white/70 text-sm">
              <li>① Create a group with a fixed per-round deposit in credits</li>
              <li>② Invite 5–15 members to join your group</li>
              <li>③ Every member deposits each round</li>
              <li>④ One member requests withdrawal per round</li>
              <li>⑤ AI validates the request in &lt;10 seconds</li>
              <li>⑥ Members vote — weighted by reputation score</li>
              <li>⑦ Treasury releases funds if vote passes</li>
            </ul>
            <div className="mt-6 pt-6 border-t border-white/10 space-y-1">
              <p className="text-white/40 text-xs">Confidence ≥85% → fast-track (30% quorum, 12h)</p>
              <p className="text-white/40 text-xs">Confidence 50–84% → normal (60% quorum, 24h)</p>
              <p className="text-white/40 text-xs">Confidence &lt;50% → auto-rejected</p>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
