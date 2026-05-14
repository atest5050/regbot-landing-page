// POST /api/photo-compliance
//
// Accepts a multipart/form-data upload:
//   photo         — image file (JPEG/PNG/HEIC from camera)
//   businessName  — business name for context
//   location      — city/state for jurisdiction context
//   businessType  — business type for context
//
// Uses GPT-4o vision to scan the photo and identify compliance issues,
// missing signage, safety hazards, code violations, or expired permits.
//
// Returns:
//   { ok: true, findings: ComplianceFinding[] }
//   or { ok: false, error: string }

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { verifyPro } from "@/lib/supabase/verify-pro";
import type { ComplianceFinding, PhotoComplianceResult } from "./types";
export type { ComplianceFinding, PhotoComplianceResult } from "./types";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const proCheck = await verifyPro(req);
  if (!proCheck) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401, headers: CORS });
  }
  if (!proCheck.isPro) {
    return NextResponse.json({ ok: false, error: "Pro subscription required" }, { status: 403, headers: CORS });
  }

  try {
    const formData = await req.formData();
    const photo        = formData.get("photo") as File | null;
    const businessName = (formData.get("businessName") as string) || "the business";
    const location     = (formData.get("location") as string) || "Unknown location";
    const businessType = (formData.get("businessType") as string) || "small business";

    if (!photo) {
      return NextResponse.json({ ok: false, error: "No photo provided" }, { status: 400, headers: CORS });
    }

    if (!photo.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "File must be an image" }, { status: 400, headers: CORS });
    }

    const maxBytes = 5 * 1024 * 1024;
    if (photo.size > maxBytes) {
      return NextResponse.json({ ok: false, error: "Image must be under 5 MB" }, { status: 400, headers: CORS });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "OpenAI API key not configured" }, { status: 500, headers: CORS });
    }

    const openai = new OpenAI({ apiKey });

    const buffer = await photo.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = photo.type === "image/heic" ? "image/jpeg" : photo.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const systemPrompt = `You are a licensed business compliance inspector with expertise in health codes, fire safety, ADA requirements, signage regulations, food safety, and local business licensing across all US jurisdictions.

Analyze the provided photo of a business premises and identify any visible compliance issues, violations, safety hazards, or missing required items.

Respond ONLY with a JSON object in this exact format:
{
  "overallStatus": "compliant" | "issues-found",
  "summary": "One sentence overall assessment",
  "findings": [
    {
      "severity": "critical" | "warning" | "info" | "pass",
      "category": "Category name (e.g. Fire Safety, ADA, Signage, Food Safety)",
      "description": "Specific observation",
      "action": "What to do to fix it (omit for pass items)"
    }
  ]
}

Severity guide:
- critical: Immediate action required — could result in fines, closure, or safety risk
- warning: Should be addressed soon — potential violation
- info: Best practice suggestion or minor observation
- pass: Visibly compliant — note what looks good

Include 3-6 findings. Always include at least one "pass" if anything looks good.`;

    const userPrompt = `Please inspect this photo from ${businessName}, a ${businessType} located in ${location}.

Identify any visible compliance concerns including but not limited to:
- Required signage (exit signs, no smoking, capacity limits, health permits)
- Fire safety (extinguishers, clear exits, sprinklers)
- ADA accessibility (ramps, door width, accessible signage)
- Health/sanitation (cleanliness, food storage, handwashing)
- Electrical safety (exposed wiring, panel access)
- General safety hazards (trip hazards, blocked exits, spills)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    let parsed: { overallStatus: string; summary: string; findings: ComplianceFinding[] };

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Failed to parse AI response" },
        { status: 500, headers: CORS },
      );
    }

    const result: PhotoComplianceResult = {
      ok: true,
      overallStatus: (parsed.overallStatus as PhotoComplianceResult["overallStatus"]) ?? "issues-found",
      summary: parsed.summary ?? "Inspection complete.",
      findings: (parsed.findings ?? []).slice(0, 8),
    };

    return NextResponse.json(result, { headers: CORS });

  } catch (err) {
    console.error("[photo-compliance] error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500, headers: CORS },
    );
  }
}
