"use client";

import { useState } from "react";
import { useWallet } from "@/providers/wallet-provider";
import {
  useInitializeEscrow,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import type { InitializeMultiReleaseEscrowPayload } from "@trustless-work/escrow/types";
import type { DeployState } from "@/types/contract";

interface EscrowDeployProps {
  payload: InitializeMultiReleaseEscrowPayload;
  onSuccess: (contractId: string) => void;
  onError: (error: string) => void;
}

export function EscrowDeploy({
  payload,
  onSuccess,
  onError,
}: EscrowDeployProps) {
  const { address, signTransaction } = useWallet();
  const { deployEscrow } = useInitializeEscrow();
  const { sendTransaction } = useSendTransaction();
  const [state, setState] = useState<DeployState>({
    step: "idle",
    contractId: null,
    error: null,
  });

  const handleDeploy = async () => {
    if (!address) {
      onError("Wallet not connected");
      return;
    }

    try {
      setState({ step: "deploying", contractId: null, error: null });

      const response = await deployEscrow(payload, "multi-release");

      if (response.status !== "SUCCESS" || !response.unsignedTransaction) {
        throw new Error("Failed to build transaction");
      }

      setState({ step: "signing", contractId: null, error: null });

      const signedXdr = await signTransaction(response.unsignedTransaction);

      setState({ step: "sending", contractId: null, error: null });

      const txResponse = await sendTransaction(signedXdr);

      if (txResponse.status !== "SUCCESS") {
        throw new Error(
          (txResponse as { message?: string }).message || "Transaction failed"
        );
      }

      const contractId =
        (txResponse as { contractId?: string }).contractId || "";
      if (!contractId) {
        throw new Error("No contract ID returned");
      }

      setState({ step: "success", contractId, error: null });
      onSuccess(contractId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Deploy failed";
      setState({ step: "error", contractId: null, error: message });
      onError(message);
    }
  };

  const isBusy = state.step === "deploying" || state.step === "signing" || state.step === "sending";
  const stepText =
    state.step === "idle" ? "Deploy Escrow" :
    state.step === "deploying" ? "Building transaction..." :
    state.step === "signing" ? "Sign with wallet..." :
    state.step === "sending" ? "Broadcasting to Stellar..." :
    state.step === "success" ? "Deployed!" :
    "Retry";

  return (
    <div className="w-full max-w-md mx-auto border border-black/5 bg-white p-6 flex flex-col items-center gap-3">
      <button
        onClick={handleDeploy}
        disabled={isBusy}
        className={`w-full inline-flex items-center justify-center gap-3 px-6 py-3 text-sm font-nothing tracking-wide transition-colors ${
          state.step === "error"
            ? "bg-red-600 text-white hover:bg-red-700"
            : state.step === "success"
            ? "bg-red-50 border border-red-200 text-red-600"
            : "bg-red-600 text-white hover:bg-red-700"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {state.step === "success" ? "Deployed" : stepText}
      </button>

      {isBusy && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-black/40 font-nothing tracking-wide">{stepText}</span>
        </div>
      )}

      {state.error && (
        <p className="text-xs text-red-600 text-center max-w-md">{state.error}</p>
      )}
    </div>
  );
}
