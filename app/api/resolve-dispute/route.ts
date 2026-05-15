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
  try {
    const {
      contractText,
      disputeReason,
      disputedAmount,
      milestoneDescription,
    } = await request.json();

    if (!contractText || !disputeReason) {
      return NextResponse.json(
        { error: "Contract text and dispute reason are required" },
        { status: 400 }
      );
    }

    const truncated = contractText.slice(0, 30000);

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
          model: "openrouter/owl-alpha",
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

    if (!response.ok) {
      throw new Error(`OpenRouter returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        resolution: "Unable to process dispute automatically.",
        releaseToProvider: 0,
        releaseToClient: 0,
        reasoning: "Default 50/50 split due to processing error.",
      },
      { status: 200 }
    );
  }
}
