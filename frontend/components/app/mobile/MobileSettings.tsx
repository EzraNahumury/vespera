"use client";
import { useState } from "react";
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/chain";
import { AgentRegistryABI } from "@/abis/AgentRegistry";
import { AGENT_TYPES, AgentType } from "@/lib/agentTypes";
import { Check, Loader2, Copy, ChevronRight, ExternalLink, LogOut, GitBranch, Shield, Zap, Scale } from "lucide-react";
import Link from "next/link";

const agentIcons = { conservative: Shield, balanced: Scale, aggressive: Zap };
const riskBadge = ["", "Low Risk", "Moderate", "High Risk"];
const riskStyle = [
  "",
  "bg-[#DCFCE7] text-[#14532D]",
  "bg-[#FEF9C3] text-[#92400E]",
  "bg-[#FFE4E6] text-[#9F1239]",
];

export function MobileSettings() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("balanced");
  const [copied, setCopied] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function handleSaveAgent() {
    const config = AGENT_TYPES.find(a => a.id === selectedAgent)!;
    writeContract({
      address: CONTRACTS.agentRegistry,
      abi: AgentRegistryABI,
      functionName: "setAgent",
      args: [address!, config.policyURI],
    });
  }

  function handleCopy() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: "#F2F2F7" }}>
      {/* Large title */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-black tracking-tight">Settings</h1>
      </div>

      <div className="px-4 space-y-6">

        {/* ── Account ── */}
        <div>
          <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">Account</p>
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-black/[0.06]">
            {isConnected && address ? (
              <>
                {/* Wallet address row */}
                <button onClick={handleCopy} className="w-full flex items-center gap-3 px-4 py-4 active:bg-black/5 transition-colors text-left">
                  <div className="w-10 h-10 rounded-full bg-[#86EFAC] flex items-center justify-center text-lg shrink-0">
                    👛
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">Connected Wallet</p>
                    <p className="text-xs font-mono text-black/40 truncate mt-0.5">{address.slice(0,8)}…{address.slice(-6)}</p>
                  </div>
                  <div className={`shrink-0 ${copied ? "text-[#16A34A]" : "text-black/30"}`}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </div>
                </button>

                <a href={`https://celoscan.io/address/${address}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between px-4 py-4 active:bg-black/5 transition-colors">
                  <span className="text-sm text-black/70">View on Celoscan</span>
                  <ExternalLink className="w-4 h-4 text-black/25" />
                </a>

                <Link href="/app/reputation"
                  className="flex items-center justify-between px-4 py-4 active:bg-black/5 transition-colors">
                  <span className="text-sm text-black/70">Reputation & Badges</span>
                  <ChevronRight className="w-4 h-4 text-black/25" />
                </Link>
              </>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-black/40">No wallet connected</p>
              </div>
            )}
          </div>
        </div>

        {/* ── AI Agent ── */}
        <div>
          <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">AI Agent Persona</p>
          <p className="text-xs text-black/40 leading-relaxed mb-3 px-1">
            Determines how your AI Reviewer votes on withdrawals. Stored on-chain via AgentRegistry.
          </p>

          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-black/[0.06] mb-3">
            {AGENT_TYPES.map((agent) => {
              const Icon = agentIcons[agent.id];
              const isSelected = selectedAgent === agent.id;
              return (
                <button key={agent.id} onClick={() => setSelectedAgent(agent.id)}
                  className="w-full flex items-center gap-4 px-4 py-4 active:bg-black/5 transition-colors text-left">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: agent.color }}>
                    <Icon className="w-5 h-5 text-black" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-black">{agent.name}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${riskStyle[agent.risk]}`}>
                        {riskBadge[agent.risk]}
                      </span>
                    </div>
                    <p className="text-xs text-black/40 leading-relaxed">{agent.tagline}</p>
                    {/* Traits when selected */}
                    {isSelected && (
                      <ul className="mt-2 space-y-1">
                        {agent.traits.map(t => (
                          <li key={t} className="flex items-center gap-1.5 text-xs text-black/55">
                            <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: agent.color }}>
                              <Check className="w-2 h-2 text-black" strokeWidth={2.5} />
                            </span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={handleSaveAgent} disabled={!isConnected || isPending || isConfirming}
            className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-bold py-4 rounded-2xl text-sm disabled:opacity-50 active:scale-[0.98] transition-transform">
            {(isPending || isConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Confirm in wallet…" : isConfirming ? "Saving…" : isSuccess ? "Saved ✓" : "Save Agent Config"}
          </button>
        </div>

        {/* ── About ── */}
        <div>
          <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1">About</p>
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-black/[0.06]">
            {[
              { label: "Protocol",  value: "Vespera v1.0.0" },
              { label: "Chain",     value: "Celo Mainnet" },
              { label: "Contracts", value: "7 Solidity" },
              { label: "AI Model",  value: "Claude Sonnet 4.6" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-black/55">{label}</span>
                <span className="text-sm font-medium text-black">{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-black/[0.06] mt-3">
            {[
              { label: "GitHub", href: "https://github.com/EzraNahumury/vespera", icon: GitBranch },
              { label: "Celoscan", href: "https://celoscan.io", icon: ExternalLink },
            ].map(({ label, href, icon: Icon }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer"
                className="flex items-center justify-between px-4 py-4 active:bg-black/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-black/35" />
                  <span className="text-sm text-black/70">{label}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-black/20" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Logout ── */}
        {isConnected && (
          <div>
            <div className="bg-white rounded-2xl overflow-hidden">
              <button onClick={() => disconnect()}
                className="w-full flex items-center gap-3 px-4 py-4 active:bg-red-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-semibold text-red-500">Disconnect Wallet</span>
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-black/25 pt-2">© 2026 Vespera · Celo Hackathon</p>
      </div>
    </div>
  );
}
