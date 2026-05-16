import { NextResponse } from "next/server";

const RESOLVE_PROMPT = `You are a dispute resolution assistant. Read the original contract terms and the dispute reason, then render a fair resolution.

Return ONLY valid JSON with this structure:
{
  "resolution": string (brief explanation of your decision, ≤300 chars),
  "releaseToProvider": number (amount in USDC to release to the service provider),
  "releaseToClient": number (amount in USDC to return to the client),
  "reasoning": string (legal basis from the contract terms, ≤200 chars)
}

Rules:
- The total of releaseToProvider + releaseToClient must equal the disputedAmount.
- Base your decision on the contract clauses provided.
- If the contract is unclear, favor a 50/50 split.`;

export async function POST(request: Request) {
  let disputedAmount = 1;
  try {
    const {
      contractText,
      disputeReason,
      disputedAmount: rawAmount,
      milestoneDescription,
    } = await request.json();
    disputedAmount = Number(rawAmount) || 1;

    if (!contractText || !disputeReason) {
      return NextResponse.json(
        { error: "Contract text and dispute reason are required" },
        { status: 400 }
      );
    }

    const truncated = contractText.slice(0, 30000);

    async function callModel(model: string): Promise<string> {
      const key = process.env.OPENROUTER_API_KEY;
      if (!key) throw new Error("OPENROUTER_API_KEY not configured");
      const res = await fetch(
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
                  "You are a dispute resolution assistant for escrow contracts. Return only valid JSON.",
              },
              {
                role: "user",
                content: `Original Contract:\n${truncated}\n\nDisputed Milestone: ${milestoneDescription || "N/A"}\nAmount in dispute: ${disputedAmount || "unknown"} USDC\n\nDispute Reason: ${disputeReason}\n\n${RESOLVE_PROMPT}`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        }
      );
      if (!res.ok) throw new Error(`OpenRouter returned ${res.status} for ${model}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error(`Empty response from ${model}`);
      return content;
    }

    let content: string;
    try {
      content = await callModel("openrouter/owl-alpha");
    } catch {
      try {
        content = await callModel("openrouter/owl-alpha");
      } catch {
        try {
          content = await callModel("poolside/laguna-m.1:free");
        } catch {
          content = await callModel("baidu/cobuddy:free");
        }
      }
    }

    const result = JSON.parse(content);

    if (
      typeof result.resolution !== "string" ||
      typeof result.releaseToProvider !== "number" ||
      typeof result.releaseToClient !== "number"
    ) {
      throw new Error("Incomplete AI response");
    }

    result.releaseToProvider = Math.round(result.releaseToProvider);
    result.releaseToClient = Math.round(result.releaseToClient);

    return NextResponse.json(result);
  } catch {
    const half = Math.round(disputedAmount / 2);
    return NextResponse.json(
      {
        resolution: "Unable to process dispute automatically.",
        releaseToProvider: half,
        releaseToClient: half,
        reasoning: "Default 50/50 split due to processing error.",
      },
      { status: 200 }
    );
  }
}
