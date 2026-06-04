"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import Link from "next/link";

/* ──────────────────────────────────────────────────────────
 * Vespera shared UI primitives
 * Consistent spacing, radius, colors across all app pages.
 * ────────────────────────────────────────────────────────── */

/** Page wrapper — consistent max-width + responsive padding */
export function PageContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen ${className}`} style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl lg:max-w-[72rem] mx-auto px-4 md:px-6 py-6 md:py-10 animate-fade-up">
        {children}
      </div>
    </div>
  );
}

/** Page title + optional subtitle */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black" style={{ letterSpacing: "-0.02em" }}>
          {title}
        </h1>
        {subtitle && <p className="text-black/45 text-sm md:text-base mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Uppercase section label */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 px-1 ${className}`}>
      {children}
    </p>
  );
}

/** White card surface */
export function Card({ children, className = "", padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl card-shadow ${padded ? "p-5 md:p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}

/** Grouped list card (iOS-style rows with dividers) */
export function ListCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl card-shadow overflow-hidden divide-y divide-black/[0.06] ${className}`}>
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "dark" | "danger" | "ghost";
const variantClass: Record<ButtonVariant, string> = {
  primary:   "bg-[#86EFAC] text-black hover:bg-[#4ADE80] active:scale-[0.98]",
  secondary: "bg-black/[0.05] text-black hover:bg-black/[0.08] active:scale-[0.98]",
  dark:      "bg-[#14532D] text-white hover:bg-[#166534] active:scale-[0.98]",
  danger:    "bg-red-50 text-red-500 hover:bg-red-100 active:scale-[0.98]",
  ghost:     "text-black/60 hover:text-black hover:bg-black/5",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
}

/** Consistent button */
export function Button({ variant = "primary", fullWidth, className = "", children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-5 py-3 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantClass[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

/** Link styled as button */
export function ButtonLink({ href, variant = "primary", fullWidth, className = "", children }: { href: string; variant?: ButtonVariant; fullWidth?: boolean; className?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-5 py-3 transition-all duration-150 ${variantClass[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}

/** Stat tile */
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl card-shadow px-4 py-3.5">
      <p className="text-xs text-black/40 mb-0.5">{label}</p>
      <p className="font-semibold text-black text-base">{value}</p>
    </div>
  );
}
