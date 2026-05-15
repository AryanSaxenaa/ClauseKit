"use client";

import { useWallet } from "@/providers/wallet-provider";

export function WalletConnect() {
  const { address, isConnecting, isTestnet, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-black/60 border border-black/5 px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        {!isTestnet && (
          <span className="text-[10px] font-nothing tracking-widest text-red-600 border border-red-200 bg-red-50 px-1.5 py-0.5">
            Switch to Testnet
          </span>
        )}
        <button
          onClick={disconnect}
          className="text-[10px] text-black/30 hover:text-red-600 tracking-wide transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-nothing tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
