import type { ExtractedContract, EditableMilestone } from "@/types/contract";
import type { InitializeMultiReleaseEscrowPayload } from "@trustless-work/escrow/types";

const USDC_TRUSTLINE_ADDRESS =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

export function buildMultiReleasePayload(
  extracted: ExtractedContract,
  milestones: EditableMilestone[],
  clientWallet: string,
  platformAddress: string
): InitializeMultiReleaseEscrowPayload {
  return {
    signer: clientWallet,
    title: `ClauseKit Escrow \u2014 ${extracted.client.name} \u00d7 ${extracted.serviceProvider.name}`,
    description: `Auto-generated from uploaded contract between ${extracted.client.name} and ${extracted.serviceProvider.name}`,
    engagementId: `ck-${Date.now()}`,
    roles: {
      approver: clientWallet,
      serviceProvider: milestones[0]?.receiver || clientWallet,
      releaseSigner: clientWallet,
      disputeResolver: platformAddress,
      platformAddress: platformAddress,
    },
    milestones: milestones.map((m) => ({
      description: `${m.title}: ${m.description}`.slice(0, 200),
      amount: Math.round(m.amount),
      receiver: m.receiver,
    })),
    platformFee: 0,
    trustline: {
      symbol: "USDC",
      address: USDC_TRUSTLINE_ADDRESS,
    },
  };
}

export function aiMilestonesToEditable(
  extracted: ExtractedContract,
  serviceProviderWallet: string
): EditableMilestone[] {
  return extracted.milestones.map((m) => ({
    ...m,
    receiver: serviceProviderWallet,
  }));
}
