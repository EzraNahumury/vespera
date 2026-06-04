"use client";

import { ReactNode } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { celo } from "@/lib/chain";
import { AlertTriangle } from "lucide-react";

/**
 * Prompts the user to switch to Celo when their wallet is on the wrong network.
 * Assumes a connected wallet (render inside WalletGuard).
 */
export function NetworkGuard({ children }: { children: ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  if (isConnected && chainId !== celo.id) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center rounded-2xl bg-white border border-black/5 p-10">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-[#92400E]" />
          </div>
          <h2 className="text-2xl font-medium text-black mb-2" style={{ letterSpacing: "-0.02em" }}>
            Wrong network
          </h2>
          <p className="text-black/50 text-sm leading-relaxed mb-7">
            Vespera runs on Celo. Switch your wallet to the Celo network to continue.
          </p>
          <button
            onClick={() => switchChain({ chainId: celo.id })}
            className="bg-[#86EFAC] text-black font-medium px-7 py-3 rounded-full hover:bg-[#4ADE80] transition-colors"
          >
            Switch to Celo
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
