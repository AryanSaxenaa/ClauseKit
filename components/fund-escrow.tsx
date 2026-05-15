"use client";

import { useState } from "react";
import { useWallet } from "@/providers/wallet-provider";
import {
  useFundEscrow,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";

interface FundEscrowProps {
  contractId: string;
  totalAmount: number;
  balance: number;
  approverAddress: string;
  onFunded: () => void;
}

export function FundEscrow({
  contractId,
  totalAmount,
  balance,
  approverAddress,
  onFunded,
}: FundEscrowProps) {
  const { address, signTransaction } = useWallet();
  const { fundEscrow } = useFundEscrow();
  const { sendTransaction } = useSendTransaction();
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFunded = totalAmount > 0 && balance >= totalAmount;
  const isApprover = address === approverAddress;

  const handleFund = async () => {
    if (!address) return;

    try {
      setFunding(true);
      setError(null);

      const response = await fundEscrow({
        contractId,
        amount: totalAmount,
        signer: address,
      }, "multi-release");

      if (response.status !== "SUCCESS" || !response.unsignedTransaction) {
        throw new Error("Failed to build fund transaction");
      }

      const signedXdr = await signTransaction(response.unsignedTransaction);
      const txResponse = await sendTransaction(signedXdr);

      if (txResponse.status !== "SUCCESS") {
        throw new Error(
          (txResponse as { message?: string }).message || "Funding failed"
        );
      }

      onFunded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Funding failed");
    } finally {
      setFunding(false);
    }
  };

  return (
    <div className="border border-black/5 bg-white p-6">
      <h4 className="text-[11px] font-nothing tracking-widest text-black/50 mb-3 uppercase">
        Funding
      </h4>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs text-black/60">
          <span>Total required</span>
          <span className="font-nothing">{totalAmount} USDC</span>
        </div>
        <div className="flex justify-between text-xs text-black/60">
          <span>Current balance</span>
          <span className="font-nothing">{balance} USDC</span>
        </div>
      </div>

      {isFunded ? (
        <p className="text-xs text-green-600 font-nothing tracking-wide">
          Fully Funded
        </p>
      ) : isApprover ? (
        <button
          onClick={handleFund}
          disabled={funding}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-nothing tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
        >
          {funding ? "Funding..." : `Send ${totalAmount} USDC to Escrow`}
        </button>
      ) : (
        <p className="text-xs text-black/30 font-nothing tracking-wide">
          Connect as the approver to fund
        </p>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
