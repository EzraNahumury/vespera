"use client";

import { useState } from "react";
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/chain";
import { AgentRegistryABI } from "@/abis/AgentRegistry";
import { AGENT_TYPES, AgentType } from "@/lib/agentTypes";
import {
  Shield, Zap, Scale, LogOut, ChevronRight,
  Check, Loader, Info, GitBranch, ExternalLink, Copy
} from "lucide-react";

const agentIcons = { conservative: Shield, balanced: Scale, aggressive: Zap };
const riskLabel = ["", "Low Risk", "Medium Risk", "High Risk"];
const riskColor = ["", "text-[#14532D] bg-[#F0FDF4]", "text-[#92400E] bg-[#FFFBEB]", "text-[#9F1239] bg-[#FFF1F2]"];

export function DesktopSettings() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [activeSection, setActiveSection] = useState<"agent" | "about" | "account">("agent");
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

  const navItems = [
    { id: "agent" as const, label: "AI Agent", icon: Shield },
    { id: "account" as const, label: "Account", icon: Info },
    { id: "about" as const, label: "About Vespera", icon: ExternalLink },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] px-6 py-10">
      <div className="max-w-[88rem] mx-auto">
        <h1 className="text-4xl font-medium text-black mb-10" style={{ letterSpacing: "-0.03em" }}>Settings</h1>

        <div className="grid grid-cols-4 gap-6 items-start">

          {/* Sidebar */}
          <nav className="col-span-1 rounded-2xl bg-white card-shadow p-2 sticky top-24">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                  activeSection === id
                    ? "bg-[#86EFAC] text-black"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}

            {isConnected && (
              <div className="mt-2 pt-2 border-t border-black/5">
                <button
                  onClick={() => disconnect()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Disconnect Wallet
                </button>
              </div>
            )}
          </nav>

          {/* Content */}
          <div className="col-span-3 space-y-4">

            {/* ── AI Agent ── */}
            {activeSection === "agent" && (
              <div className="rounded-2xl bg-white card-shadow p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-medium text-black mb-2">AI Agent Type</h2>
                  <p className="text-black/50 text-sm leading-relaxed max-w-xl">
                    Your agent persona determines how your AI Reviewer votes on withdrawal requests in groups you&apos;re a member of. This is stored on-chain via AgentRegistry.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {AGENT_TYPES.map((agent) => {
                    const Icon = agentIcons[agent.id];
                    const isSelected = selectedAgent === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`text-left rounded-2xl p-5 border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-black shadow-sm"
                            : "border-black/5 hover:border-black/15"
                        }`}
                        style={{ backgroundColor: isSelected ? agent.bg : "#fff" }}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: agent.color }}
                          >
                            <Icon className="w-5 h-5 text-black" />
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Name + risk */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-black">{agent.name}</h3>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskColor[agent.risk]}`}>
                          {riskLabel[agent.risk]}
                        </span>
                        <p className="text-black/50 text-xs mt-3 leading-relaxed">{agent.tagline}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Selected detail */}
                {(() => {
                  const agent = AGENT_TYPES.find(a => a.id === selectedAgent)!;
                  const Icon = agentIcons[agent.id];
                  return (
                    <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: agent.bg, borderLeft: `4px solid ${agent.color}` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-5 h-5" style={{ color: agent.textColor }} />
                        <h4 className="font-medium" style={{ color: agent.textColor }}>{agent.name} Agent</h4>
                      </div>
                      <p className="text-sm leading-relaxed mb-4 text-black/65">{agent.desc}</p>
                      <ul className="space-y-1.5">
                        {agent.traits.map(t => (
                          <li key={t} className="flex items-center gap-2 text-sm">
                            <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: agent.color }}>
                              <Check className="w-2.5 h-2.5 text-black" />
                            </span>
                            <span className="text-black/60">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                <button
                  onClick={handleSaveAgent}
                  disabled={!isConnected || isPending || isConfirming}
                  className="flex items-center gap-2 bg-[#86EFAC] text-black font-medium px-7 py-3 rounded-xl hover:bg-[#4ADE80] transition-colors disabled:opacity-50"
                >
                  {(isPending || isConfirming) && <Loader className="w-4 h-4 animate-spin" />}
                  {isPending ? "Confirm in wallet…" : isConfirming ? "Saving…" : isSuccess ? "Saved ✓" : "Save Agent Config"}
                </button>
              </div>
            )}

            {/* ── Account ── */}
            {activeSection === "account" && (
              <div className="rounded-2xl bg-white card-shadow p-8">
                <h2 className="text-2xl font-medium text-black mb-6">Account</h2>

                {isConnected && address ? (
                  <div className="space-y-4">
                    {/* Wallet */}
                    <div className="rounded-2xl bg-[#F2F2F7] p-5">
                      <p className="text-xs text-black/40 uppercase tracking-wider mb-2">Connected Wallet</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-black text-sm">{address}</span>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 text-xs text-black/50 hover:text-black transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Links */}
                    <a
                      href={`https://celoscan.io/address/${address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl bg-[#F2F2F7] p-5 hover:bg-black/5 transition-colors"
                    >
                      <span className="text-sm text-black/70">View on Celoscan</span>
                      <ExternalLink className="w-4 h-4 text-black/30" />
                    </a>

                    <a
                      href="/app/reputation"
                      className="flex items-center justify-between rounded-2xl bg-[#F2F2F7] p-5 hover:bg-black/5 transition-colors"
                    >
                      <span className="text-sm text-black/70">View Reputation & Badges</span>
                      <ChevronRight className="w-4 h-4 text-black/30" />
                    </a>

                    <div className="pt-4 border-t border-black/5">
                      <button
                        onClick={() => disconnect()}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#86EFAC]/10 border border-[#86EFAC] p-6 text-center">
                    <p className="text-black font-medium">No wallet connected.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── About ── */}
            {activeSection === "about" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white card-shadow p-8">
                  <h2 className="text-2xl font-medium text-black mb-2">About Vespera</h2>
                  <p className="text-black/50 text-sm leading-relaxed max-w-xl">
                    Vespera is a decentralized rotating savings (arisan) protocol built on the Celo blockchain, powered by multi-agent AI and on-chain reputation.
                  </p>
                </div>

                {/* Info cards */}
                {[
                  {
                    title: "Protocol",
                    items: [
                      { label: "Chain", value: "Celo Mainnet (chainId 42220)" },
                      { label: "Contracts", value: "7 Solidity contracts, OpenZeppelin" },
                      { label: "AI", value: "Claude Sonnet 4.6 via Anthropic SDK" },
                      { label: "Version", value: "v1.0.0 — Hackathon Build" },
                    ],
                  },
                  {
                    title: "Deployed Contracts",
                    items: [
                      { label: "GroupRegistry",      value: "0x493613...e86b" },
                      { label: "VotingEngine",        value: "0xCa8C94...07f6" },
                      { label: "Treasury",            value: "0x4D84DD...Dabd" },
                      { label: "ReputationRegistry",  value: "0xd6EE8f...521" },
                      { label: "AgentRegistry",       value: "0x67aF47...A10" },
                      { label: "BadgeNFT",            value: "0x4d5AcB...410" },
                    ],
                  },
                ].map(({ title, items }) => (
                  <div key={title} className="rounded-2xl bg-white card-shadow p-6">
                    <p className="text-xs text-black/40 uppercase tracking-wider mb-4">{title}</p>
                    <ul className="space-y-3">
                      {items.map(({ label, value }) => (
                        <li key={label} className="flex items-center justify-between text-sm">
                          <span className="text-black/50">{label}</span>
                          <span className="font-mono text-black/80 text-xs">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Links */}
                <div className="rounded-2xl bg-white card-shadow p-6 space-y-2">
                  {[
                    { label: "GitHub Repository", href: "https://github.com/EzraNahumury/vespera", icon: GitBranch },
                    { label: "View on Celoscan", href: "https://celoscan.io", icon: ExternalLink },
                  ].map(({ label, href, icon: Icon }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-black/40" />
                        <span className="text-sm text-black/70">{label}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-black/25" />
                    </a>
                  ))}
                </div>

                <p className="text-black/30 text-xs text-center pt-2">
                  © 2026 Vespera · Built for Celo Hackathon
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
