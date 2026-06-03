"use client";

import { useState } from "react";
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/chain";
import { AgentRegistryABI } from "@/abis/AgentRegistry";
import { AGENT_TYPES, AgentType } from "@/lib/agentTypes";
import {
  Shield, Zap, Scale, LogOut, ExternalLink,
  Check, Loader, Copy, ChevronRight, GitBranch
} from "lucide-react";

const agentIcons = { conservative: Shield, balanced: Scale, aggressive: Zap };
const riskLabel = ["", "Low Risk", "Medium Risk", "High Risk"];
const riskColor = [
  "",
  "text-[#14532D] bg-[#DCFCE7]",
  "text-[#92400E] bg-[#FEF9C3]",
  "text-[#9F1239] bg-[#FFE4E6]",
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
    <div className="min-h-screen bg-[#F5F5F5] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-black/5 px-5 pt-5 pb-4 sticky top-16 z-10">
        <h1 className="text-2xl font-medium text-black" style={{ letterSpacing: "-0.02em" }}>Settings</h1>
      </div>

      <div className="px-4 pt-5 space-y-6">

        {/* ── Account ── */}
        <div>
          <p className="text-xs text-black/40 uppercase tracking-widest mb-3 px-1">Account</p>
          <div className="rounded-2xl bg-white border border-black/5 overflow-hidden">
            {isConnected && address ? (
              <>
                {/* Wallet address */}
                <div className="px-5 py-4 border-b border-black/5">
                  <p className="text-xs text-black/40 mb-1">Connected Wallet</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-black/70 truncate">
                      {address.slice(0, 10)}…{address.slice(-8)}
                    </span>
                    <button onClick={handleCopy} className="shrink-0 p-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
                      {copied
                        ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                        : <Copy className="w-3.5 h-3.5 text-black/50" />
                      }
                    </button>
                  </div>
                </div>

                {/* Celoscan */}
                <a
                  href={`https://celoscan.io/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-5 py-4 border-b border-black/5 active:bg-black/5"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-black/30" />
                    <span className="text-sm text-black/70">View on Celoscan</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-black/20" />
                </a>

                {/* Reputation */}
                <a
                  href="/app/reputation"
                  className="flex items-center justify-between px-5 py-4 active:bg-black/5"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-black/30" />
                    <span className="text-sm text-black/70">Reputation & Badges</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-black/20" />
                </a>
              </>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-black/40 text-sm">No wallet connected</p>
              </div>
            )}
          </div>
        </div>

        {/* ── AI Agent ── */}
        <div>
          <p className="text-xs text-black/40 uppercase tracking-widest mb-3 px-1">AI Agent</p>
          <p className="text-xs text-black/40 leading-relaxed mb-4 px-1">
            Your agent persona determines how your AI Reviewer votes on withdrawal requests. Stored on-chain via AgentRegistry.
          </p>

          <div className="space-y-3 mb-4">
            {AGENT_TYPES.map((agent) => {
              const Icon = agentIcons[agent.id];
              const isSelected = selectedAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                    isSelected ? "border-black bg-white shadow-sm" : "border-transparent bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: agent.color }}
                    >
                      <Icon className="w-5 h-5 text-black" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-base font-medium text-black">{agent.name}</h3>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskColor[agent.risk]}`}>
                        {riskLabel[agent.risk]}
                      </span>
                      <p className="text-xs text-black/45 mt-2 leading-relaxed">{agent.tagline}</p>
                    </div>
                  </div>

                  {/* Traits — show when selected */}
                  {isSelected && (
                    <ul className="mt-4 space-y-1.5 pl-15 border-t border-black/5 pt-3">
                      {agent.traits.map(t => (
                        <li key={t} className="flex items-center gap-2 text-xs text-black/50">
                          <span
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: agent.color }}
                          >
                            <Check className="w-2 h-2 text-black" />
                          </span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSaveAgent}
            disabled={!isConnected || isPending || isConfirming}
            className="w-full flex items-center justify-center gap-2 bg-[#86EFAC] text-black font-medium py-4 rounded-2xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50"
          >
            {(isPending || isConfirming) && <Loader className="w-4 h-4 animate-spin" />}
            {isPending ? "Confirm in wallet…" : isConfirming ? "Saving…" : isSuccess ? "Saved ✓" : "Save Agent Config"}
          </button>
        </div>

        {/* ── About ── */}
        <div>
          <p className="text-xs text-black/40 uppercase tracking-widest mb-3 px-1">About</p>
          <div className="rounded-2xl bg-white border border-black/5 overflow-hidden">
            {[
              { label: "Protocol", value: "Vespera v1.0.0" },
              { label: "Chain", value: "Celo Mainnet" },
              { label: "Contracts", value: "7 Solidity contracts" },
              { label: "AI", value: "Claude Sonnet 4.6" },
            ].map(({ label, value }, i, arr) => (
              <div key={label} className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-black/5" : ""}`}>
                <span className="text-sm text-black/50">{label}</span>
                <span className="text-sm font-medium text-black">{value}</span>
              </div>
            ))}
          </div>

          {/* External links */}
          <div className="rounded-2xl bg-white border border-black/5 overflow-hidden mt-3">
            {[
              { label: "GitHub", href: "https://github.com/EzraNahumury/vespera", icon: GitBranch },
              { label: "Celoscan", href: "https://celoscan.io", icon: ExternalLink },
            ].map(({ label, href, icon: Icon }, i, arr) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between px-5 py-4 active:bg-black/5 ${i < arr.length - 1 ? "border-b border-black/5" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-black/30" />
                  <span className="text-sm text-black/70">{label}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-black/20" />
              </a>
            ))}
          </div>
        </div>

        {/* ── Danger ── */}
        <div>
          <p className="text-xs text-black/40 uppercase tracking-widest mb-3 px-1">Danger Zone</p>
          <div className="rounded-2xl bg-white border border-black/5 overflow-hidden">
            <button
              onClick={() => disconnect()}
              className="w-full flex items-center gap-3 px-5 py-4 text-red-500 active:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Disconnect Wallet</span>
            </button>
          </div>
        </div>

        <p className="text-black/25 text-xs text-center pb-4">
          © 2026 Vespera · Celo Hackathon
        </p>

      </div>
    </div>
  );
}
