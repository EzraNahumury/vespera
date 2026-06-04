"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { WalletButton } from "@/components/ui/WalletButton";
import { WalletGuard } from "@/components/app/WalletGuard";
import { Home, Users, Plus, Star, Settings } from "lucide-react";

const navItems = [
  { href: "/app",            label: "Home",       icon: Home     },
  { href: "/app/groups",     label: "Groups",     icon: Users    },
  { href: "/app/create",     label: "New",        icon: Plus     },
  { href: "/app/reputation", label: "Reputation", icon: Star     },
  { href: "/app/settings",   label: "Settings",   icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F2F2F7" }}>

      {/* ── Desktop top nav ── */}
      <header className="hidden md:block sticky top-0 z-30 border-b border-black/[0.08]"
        style={{ backgroundColor: "rgba(242,242,247,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-[88rem] mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2">
            <LogoIcon className="w-5 h-5 text-black" />
            <span className="text-base font-semibold tracking-tight text-black">Vespera</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  pathname === href || (href !== "/app" && pathname.startsWith(href))
                    ? "bg-[#86EFAC]/20 text-[#14532D]"
                    : "text-black/50 hover:text-black hover:bg-black/5"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          <WalletButton className="text-xs font-semibold bg-[#86EFAC] text-black px-4 py-1.5 rounded-full hover:bg-[#4ADE80] transition-colors" />
        </div>
      </header>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden sticky top-0 z-30 border-b border-black/[0.08]"
        style={{ backgroundColor: "rgba(242,242,247,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between px-4 h-12">
          <Link href="/" className="flex items-center gap-1.5">
            <LogoIcon className="w-5 h-5 text-black" />
            <span className="text-base font-semibold text-black">Vespera</span>
          </Link>
          <WalletButton className="text-xs font-semibold bg-[#86EFAC] text-black px-3 py-1 rounded-full" />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24 md:pb-0">
        <WalletGuard>{children}</WalletGuard>
      </main>

      {/* ── Mobile iOS-style bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.08]"
        style={{ backgroundColor: "rgba(242,242,247,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-stretch">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} aria-label={label}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 active:opacity-60 transition-opacity">
                {/* Plus button special style */}
                {href === "/app/create" ? (
                  <div className="w-10 h-10 rounded-full bg-[#86EFAC] flex items-center justify-center shadow-sm mb-0.5">
                    <Plus className="w-5 h-5 text-black" strokeWidth={2.5} />
                  </div>
                ) : (
                  <Icon className={`w-6 h-6 transition-colors ${active ? "text-[#16A34A]" : "text-black/35"}`}
                    strokeWidth={active ? 2.2 : 1.8} />
                )}
                <span className={`text-[10px] font-medium transition-colors ${
                  href === "/app/create" ? "text-[#16A34A]" :
                  active ? "text-[#16A34A]" : "text-black/35"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
