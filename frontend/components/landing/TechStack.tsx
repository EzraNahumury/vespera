"use client";

import LogoLoop from "@/components/ui/LogoLoop";
import {
  SiSolidity, SiNextdotjs, SiTypescript, SiTailwindcss,
  SiReact, SiWagmi, SiOpenzeppelin, SiIpfs,
} from "react-icons/si";
import { Brain, Hammer, Shield, Coins } from "lucide-react";

const techLogos = [
  { node: <Coins size={28} />,  title: "Celo",          href: "https://celo.org" },
  { node: <SiSolidity />,       title: "Solidity",      href: "https://soliditylang.org" },
  { node: <SiNextdotjs />,      title: "Next.js",       href: "https://nextjs.org" },
  { node: <SiTypescript />,     title: "TypeScript",    href: "https://typescriptlang.org" },
  { node: <SiTailwindcss />,    title: "Tailwind CSS",  href: "https://tailwindcss.com" },
  { node: <SiReact />,          title: "React",         href: "https://react.dev" },
  { node: <SiWagmi />,          title: "Wagmi",         href: "https://wagmi.sh" },
  { node: <SiOpenzeppelin />,   title: "OpenZeppelin",  href: "https://openzeppelin.com" },
  { node: <SiIpfs />,           title: "IPFS",          href: "https://ipfs.tech" },
  { node: <Brain size={28} />,  title: "Claude AI",     href: "https://anthropic.com" },
  { node: <Hammer size={28} />, title: "Foundry",       href: "https://getfoundry.sh" },
  { node: <Shield size={28} />, title: "Viem",          href: "https://viem.sh" },
];

const layers = [
  {
    label: "Blockchain",
    color: "#86EFAC",
    items: [
      { name: "Celo", desc: "EVM-compatible L1, mobile-first, sub-$0.01 gas" },
      { name: "Solidity 0.8.28", desc: "Smart contract language" },
      { name: "Foundry", desc: "Build, test, and deploy framework" },
      { name: "OpenZeppelin", desc: "ERC-721, AccessControl, ReentrancyGuard" },
    ],
  },
  {
    label: "Smart Contracts",
    color: "#4ADE80",
    items: [
      { name: "ArisanGroup", desc: "Core group logic: deposits, rotation, requests" },
      { name: "VotingEngine", desc: "Reputation-weighted voting + confidence routing" },
      { name: "Treasury", desc: "Multi-token escrow (USDC / USDT / CELO)" },
      { name: "ReputationRegistry", desc: "On-chain score 0–1000 across all groups" },
      { name: "BadgeNFT", desc: "Soulbound ERC-721 attestations" },
      { name: "GroupRegistry", desc: "Factory + directory of all groups" },
    ],
  },
  {
    label: "Frontend",
    color: "#FDE68A",
    items: [
      { name: "Next.js 15", desc: "App Router, server + client components" },
      { name: "TypeScript 5", desc: "Type-safe codebase" },
      { name: "Tailwind CSS 4", desc: "Utility-first styling" },
      { name: "Wagmi v2 + Viem", desc: "Wallet connection and contract reads/writes" },
      { name: "Lucide React", desc: "Icon library" },
    ],
  },
  {
    label: "AI Layer",
    color: "#C4B5FD",
    items: [
      { name: "Claude Sonnet", desc: "LLM powering Requester & Reviewer Agents" },
      { name: "Anthropic SDK", desc: "Server-side AI calls via Next.js API routes" },
      { name: "Multi-Agent", desc: "One Requester Agent + one Reviewer per member" },
      { name: "IPFS", desc: "Reasoning logs stored as CIDs via web3.storage" },
    ],
  },
];

export function TechStack() {
  return (
    <section id="stack" className="bg-[#F5F5F5] px-4 md:px-6 py-24 scroll-mt-20">
      <div className="max-w-[88rem] mx-auto">
        <div className="mb-12">
          <p className="text-black/50 text-sm mb-2">Architecture</p>
          <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight" style={{ letterSpacing: "-0.03em" }}>
            Built With
          </h2>
        </div>

        {/* LogoLoop */}
        <div className="mb-14 py-4" style={{ height: "80px", position: "relative", overflow: "hidden" }}>
          <LogoLoop
            logos={techLogos}
            speed={80}
            direction="left"
            logoHeight={32}
            gap={48}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#F5F5F5"
            ariaLabel="Technology stack"
          />
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {layers.map(({ label, color, items }) => (
            <div key={label} className="rounded-2xl bg-white p-7 border border-black/5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-black/50 text-sm font-medium uppercase tracking-wider">{label}</span>
              </div>
              <ul className="space-y-4">
                {items.map(({ name, desc }) => (
                  <li key={name} className="flex items-start gap-3">
                    <span className="text-xs font-mono px-2 py-1 rounded-md shrink-0 mt-0.5" style={{ backgroundColor: color, color: "#000" }}>
                      {name}
                    </span>
                    <span className="text-black/55 text-sm leading-relaxed">{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
