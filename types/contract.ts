export interface ExtractedParty {
  name: string;
  role: string;
}

export interface ExtractedMilestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  condition: string;
}

export interface ExtractedContract {
  client: ExtractedParty;
  serviceProvider: ExtractedParty;
  totalAmount: number;
  currency: string;
  milestones: ExtractedMilestone[];
}

export interface ExtractionError {
  error: string;
}

export type ExtractionResult = ExtractedContract | ExtractionError;

export function isExtractionError(
  result: ExtractionResult
): result is ExtractionError {
  return "error" in result;
}

export interface EditableMilestone extends ExtractedMilestone {
  receiver: string;
}

export interface DeployState {
  step: "idle" | "deploying" | "signing" | "sending" | "success" | "error";
  contractId: string | null;
  error: string | null;
}
