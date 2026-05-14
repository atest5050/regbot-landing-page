// Returns a plain-English, layman-friendly explanation of a compliance checklist item.
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
    const { text, businessType, state } = await request.json() as {
      text?: string;
      businessType?: string;
      state?: string;
    };

    if (!text?.trim()) {
      return Response.json({ error: "Missing text" }, { status: 400, headers: CORS });
    }

    const context = [
      businessType ? `Business type: ${businessType}` : null,
      state ? `State: ${state}` : null,
    ].filter(Boolean).join(", ");

    const message = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role:    "user",
        content: `You are a friendly compliance advisor explaining things to a first-time small business owner who has no legal background.

Explain this compliance requirement in 2-3 plain sentences that anyone can understand. No jargon. Be warm and reassuring.${context ? `\n\nContext: ${context}` : ""}

Requirement: "${text.trim()}"

Keep it under 60 words. Start directly with the explanation — no preamble like "This means" or "Sure!".`,
      }],
    });

    const explanation = (message.content[0] as { type: string; text?: string }).text?.trim() ?? "";

    return Response.json({ ok: true, explanation }, { headers: CORS });
  } catch (error) {
    console.error("[checklist/explain]", error);
    return Response.json({ ok: false, error: "Failed to generate explanation" }, { status: 500, headers: CORS });
  }
}
