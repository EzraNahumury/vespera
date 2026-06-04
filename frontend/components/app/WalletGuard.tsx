"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet } from "lucide-react";

/**
 * Gates /app/* content behind a connected wallet.
 * Renders a connect prompt when no wallet is connected.
 */
export function WalletGuard({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isConnected } = useAccount();
  const { connect } = useConnect();

  // Avoid hydration mismatch — wallet state is client-only.
  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center rounded-2xl bg-white border border-black/5 p-10">
          <div className="w-14 h-14 rounded-2xl bg-[#86EFAC] flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-7 h-7 text-black" />
          </div>
          <h2 className="text-2xl font-medium text-black mb-2" style={{ letterSpacing: "-0.02em" }}>
            Connect your wallet
          </h2>
          <p className="text-black/50 text-sm leading-relaxed mb-7">
            Connect a wallet to access your groups, reputation, and settings on Vespera.
          </p>
          <button
            onClick={() => connect({ connector: injected() })}
            className="bg-[#86EFAC] text-black font-medium px-7 py-3 rounded-full hover:bg-[#4ADE80] transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
