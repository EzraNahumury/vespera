"use client";
import Link from "next/link";
import { useState } from "react";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { WalletButton } from "@/components/ui/WalletButton";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it Works", href: "#how" },
  { label: "Built On",     href: "#stack" },
  { label: "Use Cases",    href: "#usecases" },
  { label: "FAQ",          href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 md:px-10 py-5">
        <div className="flex items-center justify-between max-w-[88rem] mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <LogoIcon className="w-7 h-7 text-white" />
            <span className="text-2xl font-semibold tracking-tight text-white">Vespera</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-sm text-white/60 hover:text-white font-medium transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <WalletButton className="bg-[#86EFAC] text-black text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#4ADE80] transition-colors duration-200" />
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-30 bg-white flex flex-col px-6 pt-20 pb-10 md:hidden">
          <button className="absolute top-5 right-5 p-2" onClick={() => setOpen(false)}>
            <X className="w-6 h-6 text-black" />
          </button>
          <div className="flex flex-col gap-6 mt-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-2xl font-medium text-black/80 hover:text-black transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="mt-auto">
            <Link href="/app" onClick={() => setOpen(false)}
              className="block w-full text-center bg-[#86EFAC] text-black font-medium px-7 py-3.5 rounded-full hover:bg-[#4ADE80] transition-colors">
              Launch App
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
