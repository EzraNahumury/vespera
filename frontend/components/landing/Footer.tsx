import { LogoIcon } from "@/components/ui/LogoIcon";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const contracts = [
  { name: "GroupRegistry",       addr: "0x493...e86b", url: "https://celoscan.io/address/0x493613949d63b63b02A58Ee899e9c6cd647Ae86b" },
  { name: "VotingEngine",        addr: "0xCa8...07f6", url: "https://celoscan.io/address/0xCa8C94Fb21C5d6b8f786e6d549dAb2a8Fe2f07f6" },
  { name: "Treasury",            addr: "0x4D8...Dabd", url: "https://celoscan.io/address/0x4D84DD953FCdecfD54eA50e4ce6Ea809D9f9DAbd" },
  { name: "ReputationRegistry",  addr: "0xd6E...521",  url: "https://celoscan.io/address/0xd6EE8f307B9564A6E0EA8Aa91b5A74Cb40a3F521" },
];

const appLinks = [
  { label: "Dashboard",    href: "/app" },
  { label: "Create Group", href: "/app/create" },
  { label: "Groups",       href: "/app/groups" },
  { label: "Reputation",   href: "/app/reputation" },
];

const protocolLinks = [
  { label: "How it Works", href: "#how" },
  { label: "Built With",   href: "#stack" },
  { label: "Use Cases",    href: "#usecases" },
  { label: "FAQ",          href: "#faq" },
  { label: "GitHub",       href: "https://github.com/EzraNahumury/vespera", external: true },
];

export function Footer() {
  return (
    <footer className="bg-[#F5F5F5] px-4 md:px-6 pt-16 pb-10 border-t border-black/[0.06]">
      <div className="max-w-[88rem] mx-auto">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <LogoIcon className="w-7 h-7 text-black" />
              <span className="text-xl font-medium text-black">Vespera</span>
            </div>
            <p className="text-black/45 text-sm leading-relaxed mb-5">
              Trustless arisan for everyone, powered by Celo and multi-agent AI.
            </p>
            <div className="flex items-center gap-1.5 bg-[#14532D]/10 px-3 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="text-[#14532D] text-xs font-medium">Celo Mainnet Live</span>
            </div>
          </div>

          {/* App */}
          <div>
            <p className="text-black/35 text-xs font-medium uppercase tracking-widest mb-4">App</p>
            <ul className="space-y-2.5">
              {appLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-black/55 hover:text-black transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Protocol */}
          <div>
            <p className="text-black/35 text-xs font-medium uppercase tracking-widest mb-4">Protocol</p>
            <ul className="space-y-2.5">
              {protocolLinks.map(({ label, href, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="inline-flex items-center gap-1 text-sm text-black/55 hover:text-black transition-colors duration-150"
                  >
                    {label}
                    {external && <ExternalLink className="w-3 h-3 opacity-50" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contracts */}
          <div>
            <p className="text-black/35 text-xs font-medium uppercase tracking-widest mb-4">Contracts</p>
            <ul className="space-y-3">
              {contracts.map(({ name, addr, url }) => (
                <li key={name}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col hover:opacity-80 transition-opacity"
                  >
                    <span className="text-xs font-medium text-black/70 group-hover:text-black transition-colors">{name}</span>
                    <span className="text-xs font-mono text-black/30">{addr}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-8 border-t border-black/[0.06]">
          <p className="text-black/30 text-xs">
            © 2026 Vespera · Built for Celo Hackathon
          </p>
          <p className="text-black/25 text-xs">
            Smart contracts auditable on{" "}
            <a href="https://celoscan.io" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-black/50 transition-colors">
              Celoscan
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
