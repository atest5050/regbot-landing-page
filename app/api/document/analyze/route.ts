// POST /api/document/analyze
//
// Accepts a multipart/form-data upload with these fields:
//   file          — the document (PDF or image)
//   businessId    — active business ID (for Storage path scoping)
//   businessName  — used in AI prompt for context
//   location      — e.g. "Miami, FL" — used in AI prompt for context
//   checklist     — JSON string of ChecklistItem[] for matching
//
// Returns:
//   { ok: true, storagePath, analysis: DocumentAnalysis }
//   or { ok: false, error: string }
//
// Storage: if SUPABASE_SERVICE_ROLE_KEY is set, the file is persisted to
//   Supabase Storage at business-documents/{userId}/{businessId}/{ts}-{name}.
//   For unauthenticated / guest users the file is analyzed but NOT stored.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import type { DocumentAnalysis } from "@/lib/regbot-types";
import type { ChecklistItem } from "@/lib/checklist";

// Increase limit for file uploads (Next.js App Router default is 4 MB)
export const maxDuration = 60; // seconds — AI calls can be slow
export const dynamic = "force-dynamic";

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCEPTED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/tiff",
]);

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

const KNOWN_FORM_IDS = [
  "business-license",
  "business-registration",
  "fictitious-name",
  "ein-application",
  "mobile-food-vendor",
  "food-service-permit",
  "sales-tax-registration",
  "home-occupation-permit",
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Attempt to extract human-readable text from a raw PDF byte buffer.
 * Works for digital PDFs that have embedded text streams (not scanned images).
 * Returns an empty string for scanned-only PDFs.
 */
function extractPdfText(buffer: Uint8Array): string {
  const raw = Buffer.from(buffer).toString("latin1");
  const texts: string[] = [];

  // Find all BT ... ET blocks (PDF text object blocks)
  const btEtRe = /BT\s([\s\S]*?)ET/g;
  let m: RegExpExecArray | null;
  while ((m = btEtRe.exec(raw)) !== null) {
    const block = m[1];
    // Extract literal strings in parentheses used by Tj/TJ/Tf operators
    const strRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
    let sm: RegExpExecArray | null;
    while ((sm = strRe.exec(block)) !== null) {
      const t = sm[1]
        .replace(/\\n/g, " ")
        .replace(/\\r/g, " ")
        .replace(/\\t/g, " ")
        .replace(/\\\\/g, "\\")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .trim();
      if (t.length > 1) texts.push(t);
    }
  }

  // Also grab hex strings <DEADBEEF> — less common but present in some PDFs
  const hexRe = /<([0-9A-Fa-f]{4,})>/g;
  while ((m = hexRe.exec(raw)) !== null) {
    const hex = m[1];
    // Only process even-length hex sequences (each pair = 1 byte)
    if (hex.length % 2 !== 0) continue;
    let decoded = "";
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.slice(i, i + 2), 16);
      if (code > 31 && code < 127) decoded += String.fromCharCode(code);
    }
    if (decoded.length > 2) texts.push(decoded.trim());
  }

  return texts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Build the AI analysis prompt given document content and business context.
 */
function buildAnalysisPrompt(opts: {
  contentDescription: string;
  businessName: string;
  location: string;
  checklistItems: ChecklistItem[];
}): string {
  const { contentDescription, businessName, location, checklistItems } = opts;

  const pendingItems = checklistItems
    .filter((i) => i.status !== "done")
    .map((i) => `  - ${i.text}${i.formId ? ` [formId: ${i.formId}]` : ""}`)
    .join("\n");

  const doneItems = checklistItems
    .filter((i) => i.status === "done")
    .map((i) => `  - ${i.text}${i.formId ? ` [formId: ${i.formId}]` : ""}`)
    .join("\n");

  return `You are a US business compliance document analyzer.

BUSINESS CONTEXT:
  Name: ${businessName}
  Location: ${location}

PENDING CHECKLIST ITEMS (not yet completed):
${pendingItems || "  (none)"}

ALREADY COMPLETED ITEMS:
${doneItems || "  (none)"}

DOCUMENT CONTENT:
${contentDescription}

TASK:
Analyze the document and return a JSON object with EXACTLY this structure (no markdown, no explanation, only the JSON):

{
  "docType": "Human-readable document type (e.g., 'Business License', 'Food Service Permit', 'EIN Confirmation', 'Fictitious Name Registration')",
  "issuingAuthority": "Full name of issuing agency (e.g., 'Miami-Dade County Tax Collector', 'IRS', 'Florida DBPR')",
  "permitNumber": "Exact permit/license/EIN number as printed, or null",
  "issueDate": "YYYY-MM-DD or null",
  "expirationDate": "YYYY-MM-DD, null if does not expire, or null if unknown",
  "businessName": "Business name as printed on document, or null",
  "businessAddress": "Full address as printed, or null",
  "status": "Active | Expired | Suspended | Pending | Unknown",
  "scope": "What this document authorizes (1 sentence), or null",
  "matchedFormIds": ["Only IDs from this exact list that this document satisfies: business-license, business-registration, fictitious-name, ein-application, mobile-food-vendor, food-service-permit, sales-tax-registration, home-occupation-permit"],
  "summary": "2-3 sentence plain-English summary of what was found and what it means for ${businessName}",
  "suggestions": ["Specific next action 1", "Specific next action 2"],
  "rawExtracted": { "Field Name": "Extracted Value" }
}

MATCHING RULES:
- Only include formIds in matchedFormIds when the document CLEARLY satisfies that compliance requirement
- An EIN confirmation letter satisfies "ein-application"
- A city/county general business license satisfies "business-license"
- An LLC/Corp filing certificate satisfies "business-registration"
- A DBA/fictitious name filing satisfies "fictitious-name"
- A food handler's / restaurant health permit satisfies "food-service-permit"
- A mobile food vendor / food truck permit satisfies "mobile-food-vendor"
- A sales tax permit / seller's permit satisfies "sales-tax-registration"
- A home occupation permit satisfies "home-occupation-permit"
- If the document is unclear or unrelated to compliance, set matchedFormIds to []

Return ONLY the JSON object. No markdown fences. No explanation.`;
}

// ── Supabase auth helper ──────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
            try {
              list.forEach(({ name, value, options }) => cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]));
            } catch { /* Server Component context */ }
          },
        },
      },
    );
    const { data: { user } } = await supabase.auth.getUser();
    return { supabase, user };
  } catch {
    return { supabase: null, user: null };
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse multipart form data ────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const fileEntry = formData.get("file");
  if (!fileEntry || !(fileEntry instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }

  const file         = fileEntry;
  const businessId   = (formData.get("businessId")   as string | null) ?? "";
  const businessName = (formData.get("businessName")  as string | null) ?? "Unknown Business";
  const location     = (formData.get("location")      as string | null) ?? "";
  const checklistRaw = (formData.get("checklist")     as string | null) ?? "[]";

  let checklistItems: ChecklistItem[] = [];
  try {
    checklistItems = JSON.parse(checklistRaw) as ChecklistItem[];
  } catch { /* use empty array */ }

  // ── 2. Validate file ────────────────────────────────────────────────────────
  const mimeType = file.type || "application/octet-stream";
  if (!ACCEPTED_MIME.has(mimeType)) {
    return NextResponse.json(
      { ok: false, error: `Unsupported file type: ${mimeType}. Please upload a PDF or image.` },
      { status: 400 },
    );
  }

  const fileBytes = await file.arrayBuffer();
  if (fileBytes.byteLength > MAX_FILE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File too large (max 20 MB)" },
      { status: 400 },
    );
  }

  // ── 3. Get authenticated user (optional — analysis works without auth) ──────
  const { supabase, user } = await getAuthenticatedUser();

  // ── 4. Upload to Supabase Storage (authenticated users only) ─────────────
  let storagePath = "";
  if (supabase && user && businessId) {
    const ts       = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    storagePath    = `${user.id}/${businessId}/${ts}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("business-documents")
      .upload(storagePath, fileBytes, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      // Non-fatal — continue with analysis even if storage fails
      console.error("[document/analyze] storage upload failed:", uploadError.message);
      storagePath = "";
    }
  }

  // ── 5. Prepare content for the AI ──────────────────────────────────────────
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let analysis: DocumentAnalysis;

  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType.startsWith("image/");

  try {
    if (isImage) {
      // ── Vision path: send image directly to GPT-4o ──────────────────────
      const base64 = Buffer.from(fileBytes).toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: buildAnalysisPrompt({
                  contentDescription: "See the attached image of the compliance document.",
                  businessName,
                  location,
                  checklistItems,
                }),
              },
              {
                type: "image_url",
                image_url: { url: dataUrl, detail: "high" },
              },
            ],
          },
        ],
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      analysis = parseAnalysisJson(raw, file.name);

    } else if (isPdf) {
      // ── PDF path: extract text + pass to GPT-4o ─────────────────────────
      const pdfText = extractPdfText(new Uint8Array(fileBytes));
      const contentDesc = pdfText.length > 100
        ? `PDF text content (${pdfText.length} characters extracted):\n\n${pdfText.slice(0, 6000)}`
        : `PDF text extraction yielded minimal content (likely a scanned document). ` +
          `Filename: "${file.name}". Size: ${Math.round(fileBytes.byteLength / 1024)} KB. ` +
          `Please analyze based on available context and filename.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: buildAnalysisPrompt({
              contentDescription: contentDesc,
              businessName,
              location,
              checklistItems,
            }),
          },
        ],
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      analysis = parseAnalysisJson(raw, file.name);

    } else {
      return NextResponse.json({ ok: false, error: "Unsupported file type" }, { status: 400 });
    }
  } catch (err) {
    console.error("[document/analyze] AI error:", err);
    return NextResponse.json(
      { ok: false, error: "AI analysis failed. Please try again." },
      { status: 502 },
    );
  }

  // ── 6. Validate matched form IDs (allow only known IDs) ────────────────────
  analysis.matchedFormIds = analysis.matchedFormIds.filter(
    (id): id is typeof KNOWN_FORM_IDS[number] => (KNOWN_FORM_IDS as readonly string[]).includes(id),
  );

  // ── 7. Return result ────────────────────────────────────────────────────────
  return NextResponse.json({
    ok: true,
    storagePath,
    analysis,
    fileName: file.name,
    mimeType,
    sizeBytes: fileBytes.byteLength,
  });
}

// ── JSON parser with fallback ─────────────────────────────────────────────────

function parseAnalysisJson(raw: string, filename: string): DocumentAnalysis {
  // Strip markdown fences if the model wrapped its response
  const cleaned = raw
    .replace(/^```(?:json)?\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<DocumentAnalysis>;
    return {
      docType:          parsed.docType         ?? guessDocType(filename),
      issuingAuthority: parsed.issuingAuthority ?? undefined,
      permitNumber:     parsed.permitNumber     ?? undefined,
      issueDate:        parsed.issueDate        ?? undefined,
      expirationDate:   parsed.expirationDate   ?? undefined,
      businessName:     parsed.businessName     ?? undefined,
      businessAddress:  parsed.businessAddress  ?? undefined,
      status:           isValidStatus(parsed.status) ? parsed.status : "Unknown",
      scope:            parsed.scope            ?? undefined,
      matchedFormIds:   Array.isArray(parsed.matchedFormIds) ? parsed.matchedFormIds : [],
      summary:          parsed.summary          ?? "Document analyzed. Review the details below.",
      suggestions:      Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      rawExtracted:     (parsed.rawExtracted && typeof parsed.rawExtracted === "object")
                          ? parsed.rawExtracted as Record<string, string>
                          : {},
    };
  } catch {
    return {
      docType:       guessDocType(filename),
      status:        "Unknown",
      matchedFormIds: [],
      summary:       "The document was received but could not be fully parsed. Please review manually.",
      suggestions:   ["Manually verify the document and update your checklist."],
      rawExtracted:  {},
    };
  }
}

function isValidStatus(v: unknown): v is DocumentAnalysis["status"] {
  return ["Active", "Expired", "Suspended", "Pending", "Unknown"].includes(v as string);
}

function guessDocType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("license"))  return "Business License";
  if (lower.includes("permit"))   return "Permit";
  if (lower.includes("ein") || lower.includes("ss4")) return "EIN Confirmation";
  if (lower.includes("dba") || lower.includes("fictitious")) return "Fictitious Name Registration";
  if (lower.includes("llc") || lower.includes("corp") || lower.includes("inc")) return "Business Registration";
  if (lower.includes("tax"))      return "Tax Registration";
  if (lower.includes("food") || lower.includes("health")) return "Food Service Permit";
  return "Compliance Document";
}
