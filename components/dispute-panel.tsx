"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@/providers/wallet-provider";
import {
  useStartDispute,
  useResolveDispute,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import type { EscrowRequestResponse } from "@trustless-work/escrow";
import { Textarea } from "@/components/ui/textarea";

const disputeSchema = z.object({
  reason: z
    .string()
    .min(10, "Dispute reason must be at least 10 characters")
    .max(500, "Dispute reason must be under 500 characters"),
});

type DisputeForm = z.infer<typeof disputeSchema>;

interface DisputePanelProps {
  contractId: string;
  contractText: string;
  milestoneIndex: number;
  milestoneDescription: string;
  milestoneAmount: number;
  disputeResolver: string;
  serviceProvider: string;
  approver: string;
}

type DisputeStep =
  | "idle"
  | "entering-reason"
  | "starting-dispute"
  | "signing-start"
  | "sending-start"
  | "disputed"
  | "resolving"
  | "signing-resolve"
  | "sending-resolve"
  | "resolved"
  | "error";

interface DisputeResolution {
  resolution: string;
  releaseToProvider: number;
  releaseToClient: number;
  reasoning: string;
}

export function DisputePanel({
  contractId,
  contractText,
  milestoneIndex,
  milestoneDescription,
  milestoneAmount,
  disputeResolver,
  serviceProvider,
  approver,
}: DisputePanelProps) {
  const { address, signTransaction } = useWallet();
  const isResolver = address === disputeResolver;
  const { startDispute } = useStartDispute();
  const { resolveDispute } = useResolveDispute();
  const { sendTransaction } = useSendTransaction();

  const [step, setStep] = useState<DisputeStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<DisputeResolution | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DisputeForm>({
    resolver: zodResolver(disputeSchema),
  });

  const onStartDispute = async (data: DisputeForm) => {
    if (!address) return;

    try {
      setStep("starting-dispute");
      setError(null);

      const response: EscrowRequestResponse = await startDispute(
        {
          contractId,
          signer: address,
          milestoneIndex: milestoneIndex.toString(),
        },
        "multi-release"
      );

      if (response.status !== "SUCCESS" || !response.unsignedTransaction) {
        throw new Error("Failed to build dispute transaction");
      }

      setStep("signing-start");
      const signedXdr = await signTransaction(response.unsignedTransaction);

      setStep("sending-start");
      const txResponse = await sendTransaction(signedXdr);

      if (txResponse.status !== "SUCCESS") {
        throw new Error(
          (txResponse as { message?: string }).message || "Dispute start failed"
        );
      }

      setStep("disputed");

      try {
        const res = await fetch("/api/resolve-dispute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractText,
            disputeReason: data.reason,
            disputedAmount: milestoneAmount,
            milestoneDescription,
          }),
        });
        const aiResult = await res.json();
        setResolution(aiResult);
      } catch {
        setResolution({
          resolution: "Could not process dispute automatically.",
          releaseToProvider: milestoneAmount / 2,
          releaseToClient: milestoneAmount / 2,
          reasoning: "Default 50/50 split.",
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Dispute failed";
      setError(message);
      setStep("error");
    }
  };

  const handleResolveDispute = async () => {
    if (!address || !resolution) return;

    try {
      setStep("resolving");
      setError(null);

      const clientAmount = Math.round(resolution.releaseToClient);
      const providerAmount = Math.round(resolution.releaseToProvider);

      const response: EscrowRequestResponse = await resolveDispute(
        {
          contractId,
          disputeResolver: address,
          milestoneIndex: milestoneIndex.toString(),
          distributions: [{ address: approver, amount: clientAmount }],
        },
        "multi-release"
      );

      if (response.status !== "SUCCESS" || !response.unsignedTransaction) {
        throw new Error("Failed to build resolution transaction");
      }

      setStep("signing-resolve");
      const signedXdr = await signTransaction(response.unsignedTransaction);

      setStep("sending-resolve");
      const txResponse = await sendTransaction(signedXdr);

      if (txResponse.status !== "SUCCESS") {
        throw new Error(
          (txResponse as { message?: string }).message || "Resolution failed"
        );
      }

      setStep("resolved");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Resolution failed";
      setError(message);
      setStep("error");
    }
  };

  const isBusy = ["starting-dispute", "signing-start", "sending-start", "resolving", "signing-resolve", "sending-resolve"].includes(step);

  return (
    <div className="border border-black/5 bg-white p-6">
      <h3 className="text-[11px] font-nothing tracking-widest text-black/50 mb-4 uppercase">
        Dispute Resolution
      </h3>

      {step === "idle" && (
        <button
          onClick={() => setStep("entering-reason")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-nothing tracking-wide border border-black/10 text-black/60 hover:text-red-600 hover:border-red-300 transition-all"
        >
          Raise Dispute
        </button>
      )}

      {step === "entering-reason" && (
        <form onSubmit={handleSubmit(onStartDispute)} className="space-y-3">
          <Textarea
            {...register("reason")}
            placeholder="Describe the dispute reason..."
            rows={3}
            className="border-black/10 text-black placeholder:text-black/20 text-sm focus:border-red-400 focus:ring-red-400/20 resize-y"
          />
          {errors.reason && (
            <p className="text-xs text-red-600">{errors.reason.message}</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-nothing tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Start On-Chain Dispute
            </button>
            <button
              type="button"
              onClick={() => setStep("idle")}
              className="px-4 py-2 text-xs text-black/40 hover:text-black tracking-wide transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isBusy && (
        <div className="flex items-center gap-2 text-black/40">
          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-nothing tracking-wide">
            {step.startsWith("starting") || step.startsWith("resolving") ? "Building transaction..." :
             step.includes("signing") ? "Sign with wallet..." :
             step.includes("sending") ? "Broadcasting..." : ""}
          </span>
        </div>
      )}

      {step === "disputed" && resolution && (
        <div className="space-y-4">
          <div className="border border-amber-200 bg-amber-50 p-4 space-y-2">
            <span className="inline-block text-[10px] font-nothing tracking-widest text-amber-700 border border-amber-200 bg-amber-100 px-1.5 py-0.5 uppercase">
              Disputed On-Chain
            </span>
            <p className="text-sm text-amber-900 font-medium">
              AI Recommendation: {resolution.resolution}
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              {resolution.reasoning}
            </p>
            <div className="flex gap-4 text-xs font-medium">
              <span className="text-green-700">
                Release ${resolution.releaseToProvider} to provider
              </span>
              <span className="text-red-700">
                Return ${resolution.releaseToClient} to client
              </span>
            </div>
          </div>

          {isResolver ? (
            <div className="flex gap-3">
              <button
                onClick={handleResolveDispute}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-nothing tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Resolve On-Chain
              </button>
              <button
                onClick={() => setStep("idle")}
                className="px-4 py-2 text-xs text-black/40 hover:text-black tracking-wide transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="border border-black/5 bg-zinc-50 p-3">
              <p className="text-xs text-black/40 font-nothing tracking-wide">
                Pending resolution by platform dispute resolver.
              </p>
              <p className="text-[10px] text-black/20 mt-1">
                The neutral third-party resolver ({disputeResolver.slice(0, 6)}...{disputeResolver.slice(-4)}) must sign the on-chain resolution.
              </p>
            </div>
          )}
        </div>
      )}

      {step === "resolved" && (
        <div className="border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-nothing tracking-wide text-green-700">
            Dispute resolved on-chain
          </p>
          <p className="text-xs text-green-600 mt-1">
            Funds distributed according to the resolution.
          </p>
        </div>
      )}

      {step === "error" && (
        <div className="space-y-3">
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={() => {
              setStep("idle");
              setError(null);
            }}
            className="text-xs text-black/40 hover:text-black tracking-wide transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
