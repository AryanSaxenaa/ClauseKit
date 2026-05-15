"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { MilestonePreview } from "@/components/milestone-preview";
import { WalletConnect } from "@/components/wallet-connect";
import { EscrowDeploy } from "@/components/escrow-deploy";
import { useWallet } from "@/providers/wallet-provider";
import {
  buildMultiReleasePayload,
  aiMilestonesToEditable,
} from "@/lib/escrow-builder";
import type { ExtractedContract, EditableMilestone } from "@/types/contract";

const stellarAddressSchema = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar address — must start with G and be 56 characters");

export default function DeployPage() {
  const router = useRouter();
  const { address } = useWallet();
  const [extracted, setExtracted] = useState<ExtractedContract | null>(null);
  const [milestones, setMilestones] = useState<EditableMilestone[]>([]);
  const [serviceProviderWallet, setServiceProviderWallet] = useState("");
  const [contractId, setContractId] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("clausekit-extracted");
    if (!stored) {
      router.push("/");
      return;
    }
    const parsed: ExtractedContract = JSON.parse(stored);
    setExtracted(parsed);
    setMilestones(aiMilestonesToEditable(parsed, ""));
  }, [router]);

  const walletError = useMemo(() => {
    if (!serviceProviderWallet) return undefined;
    const result = stellarAddressSchema.safeParse(serviceProviderWallet);
    return result.success ? undefined : result.error.issues[0].message;
  }, [serviceProviderWallet]);

  const handleChangeMilestone = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleDeploySuccess = (id: string) => {
    localStorage.setItem("clausekit-contract-id", id);
    router.push(`/escrow/${id}`);
  };

  const handleDeployError = (err: string) => {
    setDeployError(err);
  };

  if (!extracted) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const platformAddress =
    process.env.NEXT_PUBLIC_PLATFORM_ADDRESS ||
    address ||
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

  const deployPayload = buildMultiReleasePayload(
    extracted,
    milestones,
    address || "",
    platformAddress
  );

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <header className="border-b border-black/5 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ClauseKit"
              width={28}
              height={28}
              className="w-6 h-6"
            />
            <div>
              <h1 className="!text-base font-nothing tracking-wide text-black">ClauseKit</h1>
              <p className="text-[10px] text-black/30 font-nothing tracking-widest -mt-0.5">Review & Deploy</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-8">
        <div>
          <h2 className="text-black !text-lg mb-2">Review Extracted Contract</h2>
          <p className="text-sm text-black/50">
            Edit milestones, amounts, and wallet addresses before deploying.
          </p>
        </div>

        <MilestonePreview
          extracted={extracted}
          milestones={milestones}
          onChangeMilestone={handleChangeMilestone}
          serviceProviderWallet={serviceProviderWallet}
          onChangeServiceProviderWallet={(w) => {
            setServiceProviderWallet(w);
            setMilestones((prev) =>
              prev.map((m) => ({ ...m, receiver: w }))
            );
          }}
          walletError={walletError}
        />

        {!contractId ? (
          <div className="flex flex-col items-center gap-6 pt-4">
            {!address && (
              <p className="text-sm text-black/50">
                Connect your wallet above to deploy the escrow.
              </p>
            )}
            {address && (
              <EscrowDeploy
                payload={deployPayload}
                onSuccess={handleDeploySuccess}
                onError={handleDeployError}
              />
            )}
            {deployError && (
              <p className="text-sm text-red-600">{deployError}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-black/40 font-nothing tracking-wide">
              Redirecting to escrow page...
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-black/5">
          <button
            onClick={() => {
              localStorage.removeItem("clausekit-extracted");
              localStorage.removeItem("clausekit-contract-text");
              router.push("/");
            }}
            className="text-xs text-black/40 hover:text-red-600 tracking-wide transition-colors"
          >
            ← Start New Contract
          </button>
          <a
            href="https://docs.trustlesswork.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-black/30 hover:text-red-600 tracking-wide transition-colors"
          >
            Trustless Work Docs
          </a>
        </div>
      </main>
    </div>
  );
}
