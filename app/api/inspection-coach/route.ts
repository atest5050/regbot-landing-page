// POST /api/inspection-coach
//
// Simulates a regulatory inspection for a business and returns a structured
// risk report. Used by the AI Pre-Inspection Coach modal.
//
// Request body (JSON):
//   businessName  — business name
//   businessType  — e.g. "Restaurant", "Retail Store"
//   location      — city/state string
//   inspectionType — "health" | "fire" | "building" | "general"
//   answers       — Record<string, "yes" | "no" | "unknown"> (question id → answer)
//
// Returns:
//   { ok: true, questions?: Question[], report?: InspectionReport }

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { verifyPro } from "@/lib/supabase/verify-pro";
import type { InspectionQuestion, InspectionRiskItem, InspectionReport } from "./types";
export type { InspectionQuestion, InspectionRiskItem, InspectionReport } from "./types";

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
    const body = await req.json() as {
      businessName?: string;
      businessType?: string;
      location?: string;
      inspectionType?: string;
      answers?: Record<string, string>;
      mode?: "questions" | "report";
    };

    const {
      businessName  = "the business",
      businessType  = "small business",
      location      = "Unknown location",
      inspectionType = "general",
      answers,
      mode = "questions",
    } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "OpenAI API key not configured" }, { status: 500, headers: CORS });
    }

    const openai = new OpenAI({ apiKey });

    if (mode === "questions") {
      // Return the checklist questions for the chosen inspection type
      const prompt = `You are a regulatory compliance expert. Generate exactly 10 yes/no inspection checklist questions for a ${inspectionType} inspection of a ${businessType} in ${location}.

Each question should be something an inspector would literally look for or ask. Cover the most common violation categories for this inspection type.

Return ONLY a JSON array:
[
  { "id": "q1", "text": "Question text here?", "category": "Category name", "weight": "critical" | "major" | "minor" },
  ...
]

Weight guide:
- critical: Violation causes immediate closure or is a health/safety risk
- major: Violation results in a written warning or fine
- minor: Correction expected before next inspection`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 600,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = response.choices[0]?.message?.content?.trim() ?? "[]";
      let questions: InspectionQuestion[];
      try {
        const match = raw.match(/\[[\s\S]*\]/);
        questions = JSON.parse(match?.[0] ?? raw);
      } catch {
        return NextResponse.json({ ok: false, error: "Failed to parse questions" }, { status: 500, headers: CORS });
      }

      return NextResponse.json({ ok: true, questions }, { headers: CORS });
    }

    // mode === "report" — evaluate answers and generate risk report
    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ ok: false, error: "No answers provided" }, { status: 400, headers: CORS });
    }

    const answersText = Object.entries(answers)
      .map(([id, ans]) => `${id}: ${ans}`)
      .join("\n");

    const prompt = `You are a strict regulatory inspector evaluating a simulated ${inspectionType} inspection for ${businessName}, a ${businessType} in ${location}.

The business answered these inspection questions (yes = compliant, no = non-compliant, unknown = uncertain):

${answersText}

Generate a risk assessment report. Return ONLY this JSON:
{
  "score": <0-100 integer>,
  "grade": "A" | "B" | "C" | "D" | "F",
  "summary": "2-sentence overall assessment",
  "readyToPass": true | false,
  "risks": [
    {
      "severity": "critical" | "warning" | "pass",
      "area": "Area/category name",
      "issue": "Specific issue or compliant note",
      "recommendation": "Concrete action to take"
    }
  ],
  "topPriorities": ["Priority 1 action", "Priority 2 action", "Priority 3 action"]
}

Grade scale: A=90-100, B=80-89, C=70-79, D=60-69, F=<60
Include up to 8 risk items. Always include passes for "yes" answers.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 700,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    let report: InspectionReport;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      report = JSON.parse(match?.[0] ?? raw);
    } catch {
      return NextResponse.json({ ok: false, error: "Failed to parse report" }, { status: 500, headers: CORS });
    }

    return NextResponse.json({ ok: true, report }, { headers: CORS });

  } catch (err) {
    console.error("[inspection-coach] error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500, headers: CORS });
  }
}
