// POST /api/zoning/check
//
// v45 — Zoning & Address Compliance Checker (major moat feature)
// v46 — Added detailed logging and specific error messages to Zoning Checker
// v47 — Fixed Anthropic client initialization with proper apiKey
// v48 — Switched to claude-3-haiku-20240307 (available on most keys)
// v49 — Switched to most stable Haiku model + key prefix logging
// v50 — Updated to current stable model claude-haiku-4-5-20251001 (per Claude Console)
//
// Accepts: { address: string; businessType: string }
// Returns: { ok: true; result: ZoningResult } | { ok: false; error: string; details?: string }
//
// Model: claude-sonnet-4-6 (latest capable Sonnet) for structured JSON generation.
// The AI returns a structured zoning analysis: status, zone type, required
// permits (with known form IDs), restrictions, and operating-hour / parking /
// signage notes.

import { NextResponse } from "next/server";
import Anthropic, { APIError } from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a US zoning and small-business compliance expert.
When given a business address and type, return a JSON object describing the likely
zoning compliance situation. Respond with valid JSON only — no markdown, no text
outside the JSON object. Be realistic, specific, and actionable.`;

const USER_TEMPLATE = (address: string, businessType: string) => `
Analyze zoning compliance for this US business:
  Address:       ${address}
  Business Type: ${businessType}

Return this exact JSON (no other text):
{
  "status": "allowed" | "conditional" | "prohibited" | "unknown",
  "zoneType": "<descriptive zone label, e.g. Mixed-Use Commercial MU-1, Residential R-2, C-1 Commercial>",
  "restrictions": ["<specific restriction>"],
  "requiredPermits": [
    {
      "name": "<permit name>",
      "description": "<what it covers>",
      "url": "<official gov URL if known, else null>",
      "formId": "<one of: business-license | home-occupation-permit | food-service-permit | mobile-food-vendor | sales-tax-registration | business-registration | fictitious-name | null>"
    }
  ],
  "operatingHours": "<hour restriction string, e.g. 'No operations before 7 AM or after 10 PM' or null>",
  "parkingRequirements": "<parking requirement string or null>",
  "signageRules": "<signage restriction string or null>",
  "notes": "<2-3 sentence plain-English summary with key action items>"
}

Apply these realistic zoning rules:
- Residential address + any food production / retail sales → conditional (needs home occupation permit; cottage food laws may apply)
- Food truck / mobile vendor anywhere → conditional (mobile food vendor permit + commissary agreement required; zone restrictions apply to where they can park)
- Restaurant / café in commercial or mixed-use zone → allowed (standard business license + food service permit)
- Home-based service business (consulting, tutoring, design) → conditional (home occupation permit; no more than 1–2 client visits/day; no exterior signage)
- Retail in downtown / commercial district → generally allowed with standard business license
- Light manufacturing in residential zone → prohibited
- Salon / beauty services at home → conditional (home occupation permit; limits on non-resident employees)
- Childcare / daycare at home → conditional (state childcare license + home occupation permit; fire/safety inspection required)
- Always include at least one permit in requiredPermits — minimum: business-license
- restrictions must be non-empty; include at least 1–2 specific applicable restrictions
`.trim();

// ── Classify an Anthropic APIError into a user-readable message ───────────────

function classifyAnthropicError(err: APIError): { error: string; details: string; status: number } {
  const status  = err.status ?? 500;
  const code    = (err as { error?: { type?: string } }).error?.type ?? "";
  const message = err.message ?? "";

  console.error("[zoning/check] Anthropic APIError:", {
    status,
    code,
    type:    err.name,
    message,
    headers: (err as { headers?: unknown }).headers,
  });

  if (status === 401 || message.includes("api_key") || message.includes("authentication")) {
    return {
      error:   "Anthropic API key is missing or invalid.",
      details: "Check that ANTHROPIC_API_KEY is set in your environment variables.",
      status:  500,
    };
  }
  if (status === 404 || message.includes("model") || message.includes("not found")) {
    return {
      error:   `Model "${MODEL}" was not found. The model name may be incorrect or access is restricted.`,
      details: message,
      status:  500,
    };
  }
  if (status === 429 || message.includes("rate_limit") || message.includes("rate limit")) {
    return {
      error:   "Anthropic rate limit reached. Please wait a moment and try again.",
      details: message,
      status:  429,
    };
  }
  if (status === 529 || message.includes("overloaded")) {
    return {
      error:   "Anthropic API is temporarily overloaded. Please try again in a few seconds.",
      details: message,
      status:  503,
    };
  }
  if (status >= 500) {
    return {
      error:   "Anthropic API returned a server error. Please try again.",
      details: message,
      status:  502,
    };
  }
  return {
    error:   `Zoning analysis failed (${status}).`,
    details: message,
    status:  500,
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const requestId = `zoning-${Date.now()}`;
  console.log(`[zoning/check] [${requestId}] Request received`);

  // ── 0. API key guard ────────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(`[zoning/check] [${requestId}] ANTHROPIC_API_KEY is missing`);
    return Response.json(
      {
        ok:      false,
        error:   "Anthropic API key is not configured.",
        details: "Please set ANTHROPIC_API_KEY in your .env.local file.",
      },
      { status: 500 },
    );
  }

  // v49 — log model + key prefix immediately after key guard so every request confirms which key is active
  console.log(`[zoning-check] Using model: claude-haiku-4-5-20251001 | Key prefix: ${process.env.ANTHROPIC_API_KEY?.slice(0, 12)}...`);

  // ── 1. Parse request body ───────────────────────────────────────────────────
  let body: { address?: string; businessType?: string };
  try {
    body = await req.json() as typeof body;
  } catch (parseErr) {
    console.error(`[zoning/check] [${requestId}] Body parse failed:`, parseErr);
    return NextResponse.json(
      { ok: false, error: "Invalid request body. Expected JSON with address and businessType." },
      { status: 400 },
    );
  }

  const address      = (body.address      ?? "").trim();
  const businessType = (body.businessType ?? "business").trim();

  console.log(`[zoning/check] [${requestId}] Parsed input:`, { address, businessType });

  if (!address) {
    console.warn(`[zoning/check] [${requestId}] Missing address — returning 400`);
    return NextResponse.json(
      { ok: false, error: "Address is required. Please enter a street address or city/state." },
      { status: 400 },
    );
  }

  // Sanity-check: address should look like it contains a US location
  if (address.length < 5) {
    console.warn(`[zoning/check] [${requestId}] Address too short: "${address}"`);
    return NextResponse.json(
      { ok: false, error: "Address is too short. Please enter a full street address or at least a city and state." },
      { status: 400 },
    );
  }

  // ── 2. Call Anthropic ────────────────────────────────────────────────────────
  console.log(`[zoning/check] [${requestId}] Calling Anthropic model="${MODEL}" max_tokens=1200`);
  const t0 = Date.now();

  let rawText: string;
  try {
    const response = await client.messages.create({
      model:      MODEL,
      max_tokens: 1200,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: "user", content: USER_TEMPLATE(address, businessType) }],
    });

    const elapsed = Date.now() - t0;
    console.log(`[zoning/check] [${requestId}] Anthropic responded in ${elapsed}ms`, {
      stop_reason:   response.stop_reason,
      input_tokens:  response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      content_types: response.content.map(c => c.type),
    });

    rawText = response.content[0].type === "text" ? response.content[0].text.trim() : "";

    if (!rawText) {
      console.error(`[zoning/check] [${requestId}] Empty response from model`);
      return NextResponse.json(
        { ok: false, error: "The zoning analysis returned an empty response. Please try again." },
        { status: 500 },
      );
    }
  } catch (err) {
    if (err instanceof APIError) {
      const classified = classifyAnthropicError(err);
      return NextResponse.json(
        { ok: false, error: classified.error, details: classified.details },
        { status: classified.status },
      );
    }
    // Unknown / network error
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[zoning/check] [${requestId}] Unexpected error calling Anthropic:`, err);
    return NextResponse.json(
      { ok: false, error: "Failed to reach the Anthropic API. Check your network or API key.", details: msg },
      { status: 500 },
    );
  }

  // ── 3. Strip accidental markdown fences ─────────────────────────────────────
  const cleanText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  console.log(`[zoning/check] [${requestId}] Raw model output (first 300 chars):`, cleanText.slice(0, 300));

  // ── 4. Parse JSON ────────────────────────────────────────────────────────────
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleanText);
  } catch (jsonErr) {
    console.error(`[zoning/check] [${requestId}] JSON parse failed:`, {
      error:   jsonErr instanceof Error ? jsonErr.message : String(jsonErr),
      preview: cleanText.slice(0, 400),
    });
    return NextResponse.json(
      {
        ok:      false,
        error:   "The zoning analysis returned an unreadable format. Please try again.",
        details: `JSON parse error: ${jsonErr instanceof Error ? jsonErr.message : String(jsonErr)}`,
      },
      { status: 500 },
    );
  }

  // ── 5. Basic shape validation ─────────────────────────────────────────────
  const validStatuses = ["allowed", "conditional", "prohibited", "unknown"] as const;
  const status = parsed.status as string | undefined;
  if (!status || !validStatuses.includes(status as typeof validStatuses[number])) {
    console.warn(`[zoning/check] [${requestId}] Unexpected status value: "${status}" — coercing to "unknown"`);
    parsed.status = "unknown";
  }

  if (!Array.isArray(parsed.restrictions))    parsed.restrictions    = [];
  if (!Array.isArray(parsed.requiredPermits)) parsed.requiredPermits = [];

  console.log(`[zoning/check] [${requestId}] Success:`, {
    status:          parsed.status,
    zoneType:        parsed.zoneType,
    permits:         (parsed.requiredPermits as unknown[]).length,
    restrictions:    (parsed.restrictions as unknown[]).length,
  });

  // ── 6. Return ───────────────────────────────────────────────────────────────
  return NextResponse.json({
    ok: true,
    result: {
      ...parsed,
      checkedAt:    new Date().toISOString(),
      address,
      businessType,
    },
  });
}
