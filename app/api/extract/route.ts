import { NextResponse } from "next/server";
import { extractContractFromAI, extractDealFromAI } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { text, mode } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Contract text is required" },
        { status: 400 }
      );
    }

    const truncated = text.slice(0, 50000);
    const result =
      mode === "describe"
        ? await extractDealFromAI(truncated)
        : await extractContractFromAI(truncated);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Extraction failed. Please try again." },
      { status: 500 }
    );
  }
}
