import type { ExtractionResult } from "@/types/contract";

const EXTRACTION_PROMPT = `Extract the following from this service contract and return ONLY valid JSON, no markdown, no explanation:

{
  "client": {
    "name": string,
    "role": "Client / Buyer / Party A (as named in contract)"
  },
  "serviceProvider": {
    "name": string,
    "role": "Freelancer / Vendor / Party B (as named in contract)"
  },
  "totalAmount": number,
  "currency": "USDC",
  "milestones": [
    {
      "id": number,
      "title": string,
      "description": string,
      "amount": number,
      "condition": string
    }
  ]
}

Rules:
- If no explicit USD amounts are found, distribute totalAmount evenly across milestones.
- If no milestones are found, create 2 generic milestones: "Project Start" (30%) and "Final Delivery" (70%).
- Always return at least 2 milestones, at most 5.
- If the contract is not a service agreement, return { "error": "Not a service contract" }`;

interface AIResponse {
  client?: { name: string; role: string };
  serviceProvider?: { name: string; role: string };
  totalAmount?: number;
  currency?: string;
  milestones?: {
    id: number;
    title: string;
    description: string;
    amount: number;
    condition: string;
  }[];
  error?: string;
}

async function callModel(
  contractText: string,
  model: string
): Promise<ExtractionResult> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://clausekit.app",
        "X-Title": "ClauseKit",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a contract analysis assistant. Extract structured data from service contracts. Return only valid JSON.",
          },
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\n---CONTRACT---\n${contractText}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`OpenRouter returned ${response.status} for ${model}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${model}`);

  const parsed: AIResponse = JSON.parse(content);

  if (parsed.error) return { error: parsed.error };

  if (!parsed.client || !parsed.serviceProvider || !parsed.milestones) {
    return { error: "Incomplete extraction — missing required fields" };
  }

  return {
    client: parsed.client,
    serviceProvider: parsed.serviceProvider,
    totalAmount: parsed.totalAmount ?? 0,
    currency: parsed.currency ?? "USDC",
    milestones: parsed.milestones.map((m, i) => ({
      id: m.id ?? i + 1,
      title: m.title ?? `Milestone ${i + 1}`,
      description: m.description ?? "",
      amount: m.amount ?? 0,
      condition: m.condition ?? "",
    })),
  };
}

export async function extractContractFromAI(
  contractText: string
): Promise<ExtractionResult> {
  // Primary: owl-alpha with one retry
  try {
    return await callModel(contractText, "openrouter/owl-alpha");
  } catch {
    try {
      return await callModel(contractText, "openrouter/owl-alpha");
    } catch {
      // Fallback: ring-2.6-1t (free via OpenRouter)
      try {
        return await callModel(
          contractText,
          "inclusionai/ring-2.6-1t:free"
        );
      } catch {
        return {
          error:
            "AI extraction failed. Please check your API keys and try again.",
        };
      }
    }
  }
}
