"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { WalletButton } from "@/components/ui/WalletButton";
import { Home, Link2, Wallet, Star, Settings } from "lucide-react";

const navItems = [
  { href: "/app",            label: "Dashboard",  icon: Home     },
  { href: "/app/groups",     label: "Groups",     icon: Link2    },
  { href: "/app/create",     label: "New Group",  icon: Wallet   },
  { href: "/app/reputation", label: "Reputation", icon: Star     },
  { href: "/app/settings",   label: "Settings",   icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-[#F5F5F5]/90 backdrop-blur border-b border-black/5 px-6 py-4">
        <div className="max-w-[88rem] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoIcon className="w-6 h-6 text-black" />
            <span className="text-xl font-medium tracking-tight text-black">Vespera</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-[#86EFAC] text-black"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <WalletButton className="bg-[#86EFAC] text-black text-sm font-medium px-5 py-2 rounded-full hover:bg-[#4ADE80] transition-colors" />
        </div>
      </header>

      {/* Page content — extra bottom padding on mobile for floating nav */}
      <main className="flex-1 pb-28 md:pb-0">{children}</main>

      {/* Mobile floating pill nav */}
      <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 bg-white rounded-full px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  active ? "bg-[#86EFAC]" : "hover:bg-black/5"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-black" : "text-black/40"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
