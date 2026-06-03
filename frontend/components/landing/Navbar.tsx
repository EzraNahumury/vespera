"use client";
import Link from "next/link";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { WalletButton } from "@/components/ui/WalletButton";

const navLinks = [
  { label: "How it Works", href: "/#how" },
  { label: "Groups", href: "/app/groups" },
  { label: "Reputation", href: "/app/reputation" },
  { label: "Docs", href: "/#docs" },
];

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
      <div className="flex items-center justify-between max-w-[88rem] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="w-7 h-7 text-black" />
          <span className="text-2xl font-medium tracking-tight text-black">Vespera</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <Link key={href} href={href} className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200">
              {label}
            </Link>
          ))}
        </div>
        <WalletButton className="bg-[#86EFAC] text-black text-base font-medium px-7 py-2.5 rounded-full hover:bg-[#4ADE80] transition-colors duration-200" />
      </div>
    </nav>
  );
}
