// Zoning interpretation: accepts a ZoningResult and returns a plain-English AI summary.
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      zoneType?: string;
      status?: string;
      notes?: string;
      restrictions?: string[];
      requiredPermits?: Array<{ name: string; description?: string }>;
      businessType?: string;
    };

    const { zoneType, status, notes, restrictions, requiredPermits, businessType } = body;

    const prompt = [
      `You are a plain-English zoning advisor. A user just ran a zoning check for their ${businessType ?? "business"}.`,
      `Here are the results:`,
      `• Zone type: ${zoneType ?? "Unknown"}`,
      `• Compliance status: ${status ?? "Unknown"}`,
      notes ? `• Notes: ${notes}` : null,
      restrictions?.length ? `• Restrictions: ${restrictions.join("; ")}` : null,
      requiredPermits?.length
        ? `• Required permits: ${requiredPermits.map(p => p.name).join(", ")}`
        : null,
      ``,
      `Write a SHORT (3–5 sentence) plain-English summary for the business owner. Explain:`,
      `1. What this zoning status means for their business in simple terms`,
      `2. The most important thing they need to know or do next`,
      `3. Any key restrictions in plain language`,
      `Be friendly, direct, and action-oriented. No jargon.`,
    ].filter(Boolean).join("\n");

    const message = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages:   [{ role: "user", content: prompt }],
    });

    const interpretation = (message.content[0] as { type: string; text?: string }).text ?? "";

    return Response.json({ ok: true, interpretation }, { headers: CORS });
  } catch (error) {
    console.error("[zoning/interpret]", error);
    return Response.json({ ok: false, error: "Failed to interpret zoning result" }, { status: 500, headers: CORS });
  }
}
