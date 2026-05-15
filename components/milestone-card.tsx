"use client";

import { useState } from "react";
import { useWallet } from "@/providers/wallet-provider";
import {
  useChangeMilestoneStatus,
  useApproveMilestone,
  useReleaseFunds,
  useSendTransaction,
} from "@trustless-work/escrow/hooks";
import type { MultiReleaseMilestone } from "@trustless-work/escrow/types";

interface MilestoneCardProps {
  index: number;
  milestone: MultiReleaseMilestone;
  contractId: string;
  roles: {
    approver: string;
    serviceProvider: string;
    releaseSigner: string;
    disputeResolver: string;
  };
  onRefresh: () => void;
}

export function MilestoneCard({
  index,
  milestone,
  contractId,
  roles,
  onRefresh,
}: MilestoneCardProps) {
  const { address, signTransaction } = useWallet();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { approveMilestone } = useApproveMilestone();
  const { releaseFunds } = useReleaseFunds();
  const { sendTransaction } = useSendTransaction();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isServiceProvider = address === roles.serviceProvider;
  const isApprover = address === roles.approver;
  const isReleaseSigner = address === roles.releaseSigner;

  const status = milestone.status || "pending";
  const isDisputed = milestone.flags?.disputed;

  const exec = async (label: string, fn: () => Promise<{ status: string; unsignedTransaction?: string }>) => {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fn();
      if (res.status !== "SUCCESS" || !res.unsignedTransaction) {
        throw new Error(`Failed to build ${label} transaction`);
      }
      const signed = await signTransaction(res.unsignedTransaction);
      const tx = await sendTransaction(signed);
      if (tx.status !== "SUCCESS") {
        throw new Error((tx as { message?: string }).message || `${label} failed`);
      }
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : `${label} failed`);
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = (() => {
    if (isDisputed) return { label: "In Dispute", color: "text-red-600" };
    switch (status) {
      case "pending": return { label: "Pending", color: "text-black/40" };
      case "in_review": return { label: "In Review", color: "text-amber-600" };
      case "approved": return { label: "Approved", color: "text-green-600" };
      case "released": return { label: "Released", color: "text-green-700" };
      default: return { label: status, color: "text-black/40" };
    }
  })();

  return (
    <div className="border border-black/5 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-7 h-7 bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-[11px] font-nothing flex-shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-black font-medium truncate">
              {milestone.description}
            </p>
            <p className="text-xs text-black/40 mt-0.5 font-nothing">
              {milestone.amount} USDC
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-nothing tracking-widest whitespace-nowrap ${statusLabel.color}`}>
          {statusLabel.label}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {status === "pending" && isServiceProvider && !isDisputed && (
          <button
            onClick={() => exec("mark as done", () => changeMilestoneStatus({
              contractId,
              milestoneIndex: index.toString(),
              newStatus: "in_review",
              serviceProvider: address,
            }, "multi-release"))}
            disabled={busy}
            className="px-3 py-1.5 text-[10px] font-nothing tracking-wide border border-black/10 text-black/60 hover:text-red-600 hover:border-red-300 transition-all disabled:opacity-40"
          >
            Mark as Done
          </button>
        )}

        {status === "in_review" && isApprover && !isDisputed && (
          <button
            onClick={() => exec("approve", () => approveMilestone({
              contractId,
              milestoneIndex: index.toString(),
              approver: address,
            }, "multi-release"))}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-nothing tracking-wide bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40"
          >
            Approve Milestone
          </button>
        )}

        {status === "approved" && isReleaseSigner && !isDisputed && (
          <button
            onClick={() => exec("release funds", () => releaseFunds({
              contractId,
              milestoneIndex: index.toString(),
              releaseSigner: address,
            }, "multi-release"))}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-nothing tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            Release Funds
          </button>
        )}

        {!isServiceProvider && !isApprover && !isReleaseSigner && status !== "released" && !isDisputed && (
          <span className="text-[10px] text-black/30 font-nothing tracking-wide">
            Connect as a participant to act
          </span>
        )}

        {status === "released" && (
          <span className="text-[10px] text-green-600 font-nothing tracking-wide">
            Released
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
