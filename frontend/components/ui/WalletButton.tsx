"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useToast } from "@/components/ui/Toast";

export function WalletButton({ className }: { className?: string }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  if (isConnected && address) {
    return (
      <button
        onClick={() => { disconnect(); toast("info", "Wallet disconnected"); }}
        className={className}
        title="Disconnect"
      >
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }
  return (
    <button
      onClick={() =>
        connect(
          { connector: injected() },
          {
            onSuccess: () => toast("success", "Wallet connected"),
            onError: (e) => toast("error", e.message || "Failed to connect wallet"),
          }
        )
      }
      className={className}
    >
      Connect Wallet
    </button>
  );
}
