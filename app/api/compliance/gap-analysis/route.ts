// gap-analysis: AI-powered compliance gap detection.
// Takes business type + state + existing form IDs, returns missing required/recommended forms.
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

export interface GapItem {
  formId: string;
  name: string;
  reason: string;
  urgency: "required" | "recommended" | "conditional";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      businessType?: string;
      state?: string;
      city?: string;
      county?: string;
      isNewBusiness?: boolean;
      existingFormIds?: string[];
      businessName?: string;
    };

    const { businessType, state, city, county, isNewBusiness, existingFormIds = [], businessName } = body;

    if (!businessType && !state) {
      return Response.json({ ok: false, error: "businessType or state required" }, { status: 400, headers: CORS });
    }

    const locationStr = [city, county ? `${county} County` : null, state].filter(Boolean).join(", ");

    const prompt = `You are a compliance expert. A business needs a compliance gap analysis.

Business details:
- Name: ${businessName ?? "Unknown"}
- Type: ${businessType ?? "General business"}
- Location: ${locationStr || state || "Unknown"}
- New business: ${isNewBusiness ? "Yes" : "No / Pre-existing"}
- Forms/permits already tracked: ${existingFormIds.length > 0 ? existingFormIds.join(", ") : "None"}

Identify the TOP 6 compliance forms/permits this business is MOST LIKELY missing or needs but hasn't tracked yet.

Use ONLY these exact formIds (pick the most relevant):
- ein-application (Federal EIN from IRS)
- boi-report (Beneficial Ownership Information report)
- business-registration (LLC/Corp state registration)
- fictitious-name (DBA/Trade name registration)
- sales-tax-registration (State sales tax permit)
- annual-report (State annual/biennial report)
- business-license (Local business license)
- home-occupation-permit (Home-based business permit)
- food-service-permit (Food establishment permit)
- food-manager-certification (Food safety manager cert)
- cottage-food-registration (Cottage food/home kitchen)
- liquor-license-application (Alcohol license)
- contractor-license (General contractor license)
- cosmetologist-individual-license (Cosmetology license)
- massage-establishment-permit (Massage therapy license)
- childcare-center-license (Childcare facility license)
- short-term-rental-permit (Airbnb/vacation rental)
- fire-inspection-certificate (Fire safety inspection)
- sign-permit (Commercial signage)
- employer-withholding-registration (Payroll tax registration)
- workers-comp-exemption (Workers comp exemption)
- i-9 (Employment eligibility verification)
- resale-certificate (Resale/wholesale certificate)
- tattoo-body-art-studio-permit (Tattoo/piercing studio)
- auto-dealer-license (Vehicle dealer license)
- cannabis-retail-license (Cannabis dispensary)
- cannabis-cultivation-license (Cannabis cultivation)
- physician-medical-license (Doctor/MD license)
- dentist-dental-license (Dentist license)
- registered-nurse-license (RN license)
- mental-health-counselor-license (Therapist license)
- money-transmitter-license (Money transmission license)
- insurance-agent-license (Insurance producer license)
- mortgage-loan-originator-license (MLO/NMLS license)
- dot-number-application (DOT/MC number for trucking)

Exclude any formId already in the existing list: [${existingFormIds.join(", ")}]

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "gaps": [
    {
      "formId": "exact-form-id-from-list",
      "name": "Short display name",
      "reason": "One sentence explaining why this business specifically needs it.",
      "urgency": "required" | "recommended" | "conditional"
    }
  ]
}

Rules:
- urgency="required": legally required, business cannot legally operate without it
- urgency="recommended": strongly advisable, common for this business type
- urgency="conditional": only needed in certain circumstances (explain in reason)
- Only include forms that are genuinely relevant to THIS specific business type and location
- Max 6 items, ordered by urgency (required first)
- Do not include forms already in existingFormIds`;

    const message = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages:   [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text?: string }).text ?? "";

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    let parsed: { gaps: GapItem[] };
    try {
      parsed = JSON.parse(jsonStr) as { gaps: GapItem[] };
    } catch {
      return Response.json({ ok: false, error: "Failed to parse AI response" }, { status: 500, headers: CORS });
    }

    // Validate and sanitize
    const validUrgencies = new Set(["required", "recommended", "conditional"]);
    const gaps = (parsed.gaps ?? [])
      .filter(g => g.formId && g.name && g.reason && validUrgencies.has(g.urgency))
      .filter(g => !existingFormIds.includes(g.formId))
      .slice(0, 6);

    return Response.json({ ok: true, gaps }, { headers: CORS });
  } catch (error) {
    console.error("[compliance/gap-analysis]", error);
    return Response.json({ ok: false, error: "Gap analysis failed" }, { status: 500, headers: CORS });
  }
}
