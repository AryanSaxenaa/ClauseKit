import type { ExtractionResult } from "@/types/contract";

const EXTRACTION_PROMPT = `Extract the following from this contract and return ONLY valid JSON, no markdown, no explanation:

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
- Look for payment schedules, deliverables, milestones, or phase-based payment descriptions.
- If no explicit USD amounts are found, distribute totalAmount evenly across milestones.
- If no clear milestones are found, create 2 generic milestones: "Project Start" (30%) and "Final Delivery" (70%).
- Always return at least 2 milestones, at most 5.
- Return the full structured object. Only return { "error": "..." } if you cannot identify ANY parties, amounts, or deliverables.`;

const DESCRIBE_PROMPT = `The user will describe a business deal in plain English. Extract a structured escrow plan from it and return ONLY valid JSON, no markdown, no explanation:

{
  "client": {
    "name": string,
    "role": "Client / Buyer / the party that pays"
  },
  "serviceProvider": {
    "name": string,
    "role": "Freelancer / Vendor / the party that delivers"
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
- Infer parties, amounts, and deliverables from the description. Use common sense for missing details.
- If amounts are mentioned, use them. If a total is mentioned without per-milestone breakdowns, distribute evenly.
- If no explicit amounts are given, create reasonable estimates based on the described scope.
- Always return at least 2 milestones, at most 5.
- Name parties generically if not provided (e.g. "Client", "Freelancer").
- Return the full structured object. Only return { "error": "..." } if the input is completely incomprehensible.`;

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
  text: string,
  model: string,
  prompt: string
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
              "You are a contract analysis assistant. Extract structured data including parties, payment schedules, and deliverables.",
          },
          {
            role: "user",
            content: `${prompt}\n\n---CONTRACT---\n${text}`,
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

async function extractWithRetry(
  text: string,
  prompt: string
): Promise<ExtractionResult> {
  try {
    return await callModel(text, "openrouter/owl-alpha", prompt);
  } catch {
    try {
      return await callModel(text, "openrouter/owl-alpha", prompt);
    } catch {
      try {
        return await callModel(
          text,
          "poolside/laguna-m.1:free",
          prompt
        );
      } catch {
        try {
          return await callModel(
            text,
            "baidu/cobuddy:free",
            prompt
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
}

export async function extractContractFromAI(
  contractText: string
): Promise<ExtractionResult> {
  return extractWithRetry(contractText, EXTRACTION_PROMPT);
}

export async function extractDealFromAI(
  dealText: string
): Promise<ExtractionResult> {
  return extractWithRetry(dealText, DESCRIBE_PROMPT);
}
