import { ReactNode } from "react";
import { LogoIcon } from "../LogoIcon";
import { WalletButton } from "../WalletButton";
import { LayoutDashboard, Users, Plus, Star } from "lucide-react";

const navItems = [
  { href: "#app", label: "Dashboard", icon: LayoutDashboard },
  { href: "#app/groups", label: "Groups", icon: Users },
  { href: "#create", label: "New Group", icon: Plus },
  { href: "#app/reputation", label: "Reputation", icon: Star },
];

export function AppShell({ children }: { children: ReactNode }) {
  const hash = window.location.hash;

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-[#F5F5F5]/90 backdrop-blur border-b border-black/5 px-6 py-4">
        <div className="max-w-[88rem] mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <LogoIcon className="w-6 h-6 text-black" />
            <span className="text-xl font-medium tracking-tight text-black">Vespera</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  hash === href
                    ? "bg-[#86EFAC] text-black"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </a>
            ))}
          </nav>

          <WalletButton className="bg-[#86EFAC] text-black text-sm font-medium px-5 py-2 rounded-full hover:bg-[#4ADE80] transition-colors" />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-black/5 flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              hash === href ? "text-black" : "text-black/40"
            }`}
          >
            <Icon className={`w-5 h-5 ${hash === href ? "text-black" : ""}`} />
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
