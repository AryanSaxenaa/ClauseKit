"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { WalletConnect } from "@/components/wallet-connect";
import { EscrowStatusBanner } from "@/components/escrow-status-banner";
import { FundEscrow } from "@/components/fund-escrow";
import { MilestoneCard } from "@/components/milestone-card";
import { ArrowUpRight } from "lucide-react";
import {
  useGetEscrowFromIndexerByContractIds,
  useGetMultipleEscrowBalances,
} from "@trustless-work/escrow/hooks";
import type { MultiReleaseEscrow } from "@trustless-work/escrow/types";

export default function EscrowPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId as string;

  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();
  const { getMultipleBalances } = useGetMultipleEscrowBalances();

  const [escrow, setEscrow] = useState<MultiReleaseEscrow | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const results = await getEscrowByContractIds({ contractIds: [contractId] });
      if (!results?.[0]) throw new Error("Escrow not found");
      setEscrow(results[0] as MultiReleaseEscrow);

      const balances = await getMultipleBalances({
        addresses: [contractId],
      });
      setBalance(balances?.[0]?.balance ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load escrow");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const viewerUrl = `https://viewer.trustlesswork.com/?id=${contractId}`;
  const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${contractId}`;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <p className="text-sm text-red-600">{error || "Escrow not found"}</p>
      </div>
    );
  }

  const totalAmount =
    (escrow as any).amount ||
    escrow.milestones?.reduce((sum: number, m: any) => sum + (m.amount || 0), 0) ||
    0;
  const roles = escrow.roles as MultiReleaseEscrow["roles"];
  const flags = (escrow as any).flags || {};
  const hasReleasedMilestones = escrow.milestones?.some((m: any) => m.flags?.released);

  // Determine status from flags and milestones for multi-release
  const escrowStatus =
    flags.disputed ? "inDispute"
    : flags.released ? "released"
    : flags.resolved ? "released"
    : hasReleasedMilestones ? "active"
    : balance >= totalAmount ? "funded"
    : "working";

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      {/* Nav */}
      <header className="border-b border-black/5 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="ClauseKit" width={28} height={28} className="w-6 h-6" />
            <div>
              <h1 className="!text-base font-nothing tracking-wide text-black">Escrow</h1>
              <button
                onClick={() => navigator.clipboard.writeText(contractId)}
                className="text-[10px] text-black/30 hover:text-red-600 font-nothing tracking-widest -mt-0.5 transition-colors text-left"
                title="Click to copy"
              >
                {contractId.slice(0, 8)}...{contractId.slice(-4)}
              </button>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-6">
        {/* Contract ID & Share */}
        <div className="border border-black/5 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-nothing tracking-widest text-black/30 uppercase">
              Contract ID
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="text-[10px] text-black/30 hover:text-red-600 font-nothing tracking-widest transition-colors"
            >
              Copy Link
            </button>
          </div>
          <code className="block text-xs text-black/60 font-mono break-all bg-zinc-50 px-3 py-2 border border-black/5">
            {contractId}
          </code>
          <p className="text-[10px] text-black/30 leading-relaxed">
            Share this URL with the service provider so they can connect their wallet and mark milestones as done.
          </p>
        </div>

        {/* External links */}
        <div className="flex items-center gap-4 text-xs text-black/30">
          <a
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 transition-colors inline-flex items-center gap-1"
          >
            Escrow Viewer <ArrowUpRight className="w-3 h-3" />
          </a>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600 transition-colors inline-flex items-center gap-1"
          >
            Stellar Explorer <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {/* Status banner */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <EscrowStatusBanner
              balance={balance}
              totalAmount={totalAmount}
              status={escrowStatus}
            />
          </div>
          <button
            onClick={fetchData}
            className="text-[10px] text-black/30 hover:text-red-600 font-nothing tracking-widest transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Fund escrow */}
        {!hasReleasedMilestones && (
          <FundEscrow
            contractId={contractId}
            totalAmount={totalAmount}
            balance={balance}
            approverAddress={roles.approver}
            onFunded={fetchData}
          />
        )}

        {/* Milestones */}
        <div>
          <h2 className="text-sm text-black/50 font-nothing tracking-widest mb-4 uppercase">
            Milestones
          </h2>
          <div className="space-y-3">
            {escrow.milestones?.map((milestone, i) => (
              <MilestoneCard
                key={i}
                index={i}
                milestone={milestone}
                contractId={contractId}
                roles={{
                  approver: roles.approver,
                  serviceProvider: (roles as any).serviceProvider,
                  releaseSigner: roles.releaseSigner,
                  disputeResolver: roles.disputeResolver,
                }}
                onRefresh={fetchData}
              />
            ))}
          </div>
        </div>

        {/* Back */}
        <div className="pt-4">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-black/30 hover:text-red-600 tracking-wide transition-colors"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}
