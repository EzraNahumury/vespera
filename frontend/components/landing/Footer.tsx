import { LogoIcon } from "@/components/ui/LogoIcon";
import Link from "next/link";

const contracts = [
  { name: "GroupRegistry", addr: "0x4936...e86b" },
  { name: "VotingEngine",  addr: "0xCa8C...07f6" },
  { name: "Treasury",      addr: "0x4D84...Dabd" },
  { name: "ReputationRegistry", addr: "0xd6EE...521" },
];

export function Footer() {
  return (
    <footer className="bg-[#F5F5F5] px-4 md:px-6 pt-16 pb-10 border-t border-black/8">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <LogoIcon className="w-7 h-7 text-black" />
              <span className="text-xl font-medium text-black">Vespera</span>
            </div>
            <p className="text-black/50 text-sm leading-relaxed">
              Trustless arisan for everyone, powered by Celo and multi-agent AI.
            </p>
          </div>

          {/* App */}
          <div>
            <p className="text-black/40 text-xs font-medium uppercase tracking-wider mb-4">App</p>
            <ul className="space-y-2.5">
              {[
                { label: "Dashboard", href: "/app" },
                { label: "Create Group", href: "/app/create" },
                { label: "Reputation", href: "/app/reputation" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-black/60 hover:text-black transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Protocol */}
          <div>
            <p className="text-black/40 text-xs font-medium uppercase tracking-wider mb-4">Protocol</p>
            <ul className="space-y-2.5">
              {[
                { label: "How it Works", href: "#how" },
                { label: "Built With", href: "#stack" },
                { label: "FAQ", href: "#faq" },
                { label: "GitHub", href: "https://github.com/EzraNahumury/vespera" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="text-sm text-black/60 hover:text-black transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contracts */}
          <div>
            <p className="text-black/40 text-xs font-medium uppercase tracking-wider mb-4">Contracts (Celo)</p>
            <ul className="space-y-2.5">
              {contracts.map(({ name, addr }) => (
                <li key={name} className="flex flex-col">
                  <span className="text-xs font-medium text-black/70">{name}</span>
                  <span className="text-xs font-mono text-black/35">{addr}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-8 border-t border-black/8">
          <p className="text-black/35 text-xs">© 2026 Vespera. Built for Celo Hackathon.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
            <span className="text-black/40 text-xs">Celo Mainnet — Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
