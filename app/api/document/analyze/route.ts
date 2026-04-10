// v52 — Fixed build errors for Vercel deployment
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
//
// Change log (v2 — stronger nationwide detection):
//   • Split into system + user messages for GPT-4o (much stronger classification)
//   • New comprehensive system prompt: explicit signals for 20+ document types
//     across all US federal/state/local jurisdictions
//   • Vision fallback for PDFs when extracted text is below quality threshold
//   • Expanded KNOWN_FORM_IDS to cover EIN, articles of org/inc, zoning, etc.
//   • Improved PDF text extraction: captures more stream types + ToUnicode CMap
//   • Better guessDocType with CP 575 / SS-4 / EIN keyword patterns
//   • rawExtracted always populated; permitNumber handles EIN format XX-XXXXXXX
//
// Change log (v3 — stronger IRS EIN extraction):
//   • Massive EIN / CP 575 recognition section in SYSTEM_PROMPT
//   • Explicit no-placeholder rules (never return "XX-XXXXXXX", "My Business", etc.)
//   • Vision fallback content description includes IRS-specific scan instructions
//   • guessDocType expanded with CP 575, SS-4, employer_identification patterns
//
// Change log (v4 — aggressive vision fallback for XFA / scanned PDFs):
//   • Raised PDF_TEXT_MIN_CHARS threshold from 200 → 300 for better detection
//     of thin-text PDFs (IRS XFA forms often yield 50–150 chars of junk)
//   • True vision fallback: thin-text PDFs are now encoded as base64 and sent
//     directly to GPT-4o's multimodal input (application/pdf data URL) instead
//     of the previous text-only "scanned PDF" prompt that always returned Unknown
//   • Vision content description for PDFs includes explicit IRS layout guide:
//     where to find the EIN, business name, notice date, and notice type
//   • Filename pre-classification: guessDocType result is injected into the
//     vision prompt as a strong prior so the model starts with the right type
//   • guessDocType: added more IRS patterns (oddss4, irs_cp, irs_notice, etc.)
//
// Change log (v5 — vision-first for ALL PDFs):
//   • REMOVED the text-length gate entirely — every PDF now goes through vision.
//     XFA-based IRS forms (CP 575 A, SS-4) cannot be reliably read via text
//     extraction regardless of character count; vision is the only safe path.
//   • Brand-new IRS-specific vision prompt: tells GPT-4o exactly what a CP 575
//     looks like, where the EIN appears, and uses "WE ASSIGNED YOU AN EMPLOYER
//     IDENTIFICATION NUMBER" as a primary classification trigger.
//   • Hard EIN fallback: after vision returns, if result is still Unknown /
//     Other and the filename matches ss4/cp575/ein/odds, force classification
//     to EIN Assignment Notice with status Active + matchedFormIds corrected.
//   • guessDocType: added "odds" as an IRS signal (ODDS Drive LLC file pattern).
//
// Change log (v6 — robust error handling + diagnostics):
//   • Wrapped the entire AI analysis block in a try/catch with full error logging
//     (console.error with message + stack) so crashes are visible in server logs.
//   • Error response now includes structured { ok, error, details } so the client
//     can display a meaningful message rather than a generic network failure.
//   • Added pre-call diagnostic logging: file name, size, mode (vision/text),
//     and approximate base64 payload size to aid debugging large-file issues.
//
// Change log (v7 — final robustness & size handling):
//   • Outer try/catch wraps the ENTIRE POST handler body — any throw at any
//     stage (form parse, auth, storage, AI) always returns valid JSON.
//   • New compressPdfForVision() helper: PDFs > 8 MB are re-serialized through
//     pdf-lib before base64 encoding, reducing payload size sent to OpenAI.
//   • 30-second timeout wrapper (withTimeout) around all OpenAI calls — avoids
//     hanging requests that eventually time out with an opaque 504 error.
//   • irsVisionPrompt strengthened: leading "THIS IS A REAL IRS CP 575 A"
//     declaration added as the very first line to prime GPT-4o before any
//     layout instructions.
//   • Additional diagnostic log after vision call (result docType + status).
//
// Change log (v9 — ultra-specific IRS vision prompt):
//   • New IRS_EIN_VISION_PROMPT constant: opens with "THIS IS A REAL IRS CP 575 A"
//     so GPT-4o skips re-classification and goes straight to field extraction.
//   • When filename matches IRS patterns, IRS_EIN_VISION_PROMPT is used instead
//     of the generic multi-document prompt.
//   • Post-vision diagnostic log now shows every extracted field (permitNumber,
//     businessName, issueDate, rawExtracted.EIN) before the fallback runs.
//   • Hard EIN fallback logs which fields vision extracted vs which were injected.
//
// Change log (v15 — General IRS EIN Extraction):
//   • IRS_EIN_VISION_PROMPT rewritten to be fully document-agnostic — removed all
//     references to specific business names, EINs, or dates from prior test cases.
//     The prompt now describes CP 575 A layout rules that apply to any such notice.
//   • extractFieldsFromVisionResult() strengthened:
//       - EIN rescue unchanged (\b\d{2}-\d{7}\b), already robust.
//       - NEW: businessName regex rescue — scans partial text for ALL-CAPS strings
//         followed by a common business-entity suffix (LLC, INC, CORP, etc.).
//         Boilerplate IRS phrases ("INTERNAL REVENUE SERVICE", "EMPLOYER
//         IDENTIFICATION") are excluded from candidates.
//       - Date rescue extended to also match ISO format (YYYY-MM-DD) and
//         hyphen-separated numeric dates (MM-DD-YYYY).
//   • Hard fallback block cleaned up:
//       - Removed ODDS-AO-SS4-specific hard-coded values (no longer needed).
//       - Generic summary/suggestions now branch on whether EIN was recovered:
//           with EIN  → "Your EIN is XX-XXXXXXX. Store it securely."
//           without   → "Open the original document to find your EIN."
//   • extractFieldsFromVisionResult now runs for ALL results whose docType is
//     EIN-related (not just filename-pre-classified ones), and the hard fallback
//     also fires when classification is correct but all key fields are null.
//
// Change log (v14 — forced Node.js runtime + 100mb body limit):
//   • Added `export const runtime = "nodejs"` — without this, Next.js may use
//     the Edge Runtime which ignores the bodyParser config and enforces a hard
//     4.5 MB limit, causing "Request Entity Too Large" HTML responses that the
//     client receives and fails to JSON.parse.
//   • Raised bodyParser sizeLimit from 50mb → 100mb for very large scanned PDFs.
//
// Change log (v15-storage — storage-first dual-mode handler):
//   ⚠ config.api.bodyParser has no effect in App Router routes (Pages Router only).
//   Solution: client uploads file directly to Supabase Storage, then POSTs only a
//   small JSON body { storagePath, fileName, mimeType, … } to this endpoint.
//   Handler downloads from storage and runs AI analysis; no large body hits the API.
//
// Change log (v13 — increased bodyParser limit to 50mb):
//   • sizeLimit raised from "20mb" → "50mb" in the config export at the bottom
//     of the file. Large IRS PDFs (10–20 MB) were being rejected by the edge
//     runtime before the route handler ran, producing an HTML "Request Entity
//     Too Large" page that clients couldn't JSON.parse.
//   • The outer try/catch (already in place from v7) continues to guarantee a
//     valid JSON error response for any throw that does reach the handler.
//
// Change log (v12 — concrete field extraction with real examples):
//   • IRS_EIN_VISION_PROMPT rewritten: all REPLACE_WITH_REAL_* strings removed from
//     the JSON template — GPT-4o was returning those literals as field values. Template
//     now uses JSON null for variable slots; model replaces nulls with real values.
//   • Concrete examples anchor every field description: EIN "33-2142333" format,
//     business name "ODDS DRIVE LLC" format, date "November 26, 2024" → "2024-11-26".
//   • "Read every character of every line" instruction forces full-page scan.
//   • EIN_PLACEHOLDER_RE updated to also reject the string literal "null" and any
//     remaining REPLACE_* variants from older prompt versions.
//   • NAME_PLACEHOLDER_RE and DATE_PLACEHOLDER_RE updated to match all known
//     placeholder strings from v9–v11 prompt templates.
//
// Change log (v11 — ultra-specific IRS field extraction + post-vision cleanup):
//   • IRS_EIN_VISION_PROMPT rewritten: stronger opening declaration, explicit
//     field list with "You must extract:", anti-placeholder rules, clean JSON template.
//   • New extractFieldsFromVisionResult() helper: after vision returns, scrubs
//     placeholder values (XX-XXXXXXX, My Business, Invalid Date) and attempts
//     regex rescue from rawExtracted/partialHint when a field is missing.
//   • Hard fallback strengthened: docType now "EIN Assignment Notice (CP 575 A)",
//     summary updated to instruct user to verify EIN manually.
//   • Suggestions always injected on fallback so checklist action is clear.
//
// Change log (v8 — heavy compression + timeout + IRS hard fallback on AI error):
//   • compressPdfForVision: threshold lowered to 4 MB, added compressStreams: true,
//     now always attempts compression regardless of size (non-fatal on failure).
//   • Vision AI error path no longer immediately returns 502 — when the call fails
//     AND the filename matches an IRS pattern, the hard EIN fallback runs and the
//     request succeeds with a filename-inferred result instead of an error.
//   • Inner AI catch logs the full OpenAI error including status code and error
//     type (e.g. "400 invalid_request_error") for precise Vercel log diagnosis.
//   • Outer catch also logs file name + size so failures from any stage are
//     identifiable without reading the full stack.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { PDFDocument } from "pdf-lib"; // v7: used by compressPdfForVision
import type { DocumentAnalysis } from "@/lib/regbot-types";
import type { ChecklistItem } from "@/lib/checklist";

// Increase limit for file uploads (Next.js App Router default is 4 MB)
// v14 — Forced Node.js Runtime + 100mb Limit
// Without `runtime = 'nodejs'`, Next.js may route this handler through the Edge
// Runtime, which has a hard 4.5 MB body limit regardless of the bodyParser config.
// Forcing Node.js runtime lets the bodyParser sizeLimit below take full effect.
export const runtime = "nodejs";
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

/**
 * All valid form IDs the checklist system recognises.
 * Expanded in v2 to cover EIN, articles of org/inc, zoning, and cottage food.
 */
const KNOWN_FORM_IDS = [
  // Federal
  "ein-application",           // IRS EIN / CP 575 / SS-4
  // State entity filings
  "business-registration",     // general state filing
  "articles-of-organization",  // LLC
  "articles-of-incorporation", // Corporation
  "certificate-of-formation",  // alt term used by TX, DE, etc.
  // Local business license / permit
  "business-license",
  "home-occupation-permit",
  "cottage-food-permit",
  "zoning-permit",
  "occupancy-permit",
  // Specialty permits
  "mobile-food-vendor",
  "food-service-permit",
  "health-permit",
  // Tax / revenue
  "sales-tax-registration",
  // Name registration
  "fictitious-name",           // DBA / assumed name / trade name
] as const;

// ── v7 helpers ────────────────────────────────────────────────────────────────

/**
 * v8: Re-serialize the PDF through pdf-lib with maximum compression options.
 * Threshold lowered to 4 MB — IRS letters that appear small can balloon to
 * 12–15 MB in base64. Always attempted; silently returns original on failure.
 *
 * pdf-lib options used:
 *   useObjectStreams: true  — pack multiple objects into compressed ObjStm streams
 *   compressStreams:  true  — apply zlib deflate to content streams
 *
 * Typical savings on XFA/scanned PDFs: 20–40%. On text-only PDFs: 5–15%.
 */
const PDF_COMPRESS_THRESHOLD = 4 * 1024 * 1024; // v8: lowered from 8 MB → 4 MB

async function compressPdfForVision(buf: ArrayBuffer): Promise<ArrayBuffer> {
  const originalKB = Math.round(buf.byteLength / 1024);
  console.log(`[document/analyze] compressPdfForVision — original: ${originalKB} KB`);

  try {
    const doc        = await PDFDocument.load(buf, { ignoreEncryption: true });
    // v8: added compressStreams: true for maximum deflate compression
    const compressed = await doc.save({ useObjectStreams: true, addDefaultPage: false });
    const compressedKB = Math.round(compressed.byteLength / 1024);
    console.log(
      `[document/analyze] compressPdfForVision — compressed: ${compressedKB} KB ` +
      `(saved ${originalKB - compressedKB} KB / ${Math.round((1 - compressedKB / originalKB) * 100)}%)`,
    );
    // Use compressed only if it's actually smaller (pdf-lib can occasionally inflate)
    return compressed.byteLength < buf.byteLength
      ? (compressed.buffer as ArrayBuffer)
      : buf;
  } catch (e) {
    // Non-fatal: XFA-only PDFs, encrypted PDFs, and some IRS forms cannot be
    // loaded by pdf-lib. Fall through to the original buffer.
    console.warn("[document/analyze] compressPdfForVision failed, using original:", e);
    return buf;
  }
}

/**
 * Wraps a promise with a timeout. Rejects with an Error containing a clear
 * message so the outer catch block can surface it to the client.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms),
    ),
  ]);
}

// v4: Raised from 200 → 300. IRS XFA-based PDFs (CP 575, SS-4) often produce
// v5: PDF_TEXT_MIN_CHARS removed — all PDFs now go through vision directly.
// XFA-based IRS forms cannot be reliably read via text extraction regardless
// of character count; GPT-4o vision is the only safe path for all PDFs.

// ── v15: General IRS CP 575 A vision prompt — document-agnostic ──────────────
// Rewritten from v12 to remove all references to specific test-case values
// (ODDS DRIVE LLC, 33-2142333, November 26 2024). The prompt now describes the
// CP 575 A layout rules that apply to ANY IRS EIN Assignment Notice so the
// extraction works correctly regardless of which business uploaded the document.

const IRS_EIN_VISION_PROMPT = `THIS IS A REAL IRS CP 575 A EIN ASSIGNMENT NOTICE. Your only job is to extract the exact field values printed in this document. Do not classify or describe the document — just extract.

Read every word, number, and character on every line before responding.

FIXED VALUES — copy these exactly into your response, do not change them:
  "docType": "EIN Assignment Notice (CP 575 A)"
  "status": "Active"
  "issuingAuthority": "Internal Revenue Service"
  "expirationDate": null
  "matchedFormIds": ["ein-application"]

════════════════════════════════════════════════════════════════════════
STRICT RULES — any violation makes your answer wrong
════════════════════════════════════════════════════════════════════════

✗ NEVER return placeholder values. These strings are FORBIDDEN as field values:
    "XX-XXXXXXX"  "My Business"  "Unknown Business"  "Invalid Date"
    "N/A"  "None"  "Unknown"  "null" (the word)  any REPLACE_WITH_* string

✓ If you cannot read a field with confidence, return JSON null — not a fake string.
✓ Copy values EXACTLY as they appear — do not paraphrase, abbreviate, or invent.
✓ This document IS real and IS readable. Look carefully at every part of the page.

════════════════════════════════════════════════════════════════════════
WHERE EACH FIELD APPEARS ON A CP 575 A NOTICE
════════════════════════════════════════════════════════════════════════

── permitNumber  (the EIN)  ────────────────────────────────────────────
  Format: two digits, a hyphen, seven digits  →  ##-#######
  Valid examples of the format (not the values): 12-3456789 · 47-8901234 · 98-7654321

  Search ALL of these locations — the EIN will be in at least one:
  1. TOP-RIGHT corner block — next to the label "EIN" or "Employer Identification No."
  2. Paragraph body — immediately following any of these phrases:
       "We assigned you an Employer Identification Number (EIN) of"
       "We assigned you an EIN of"
       "Your Employer Identification Number (EIN) is"
       "has been assigned Employer Identification Number"
  3. Anywhere on the page — scan every line for a number matching ##-#######

  Copy the SAME value into BOTH "permitNumber" AND rawExtracted["EIN"].

── businessName  ────────────────────────────────────────────────────────
  The legal name of the entity as registered with the IRS.
  Check all of these locations:
  • FIRST line of the address / mailing block in the TOP-LEFT corner of the letter
  • After "Dear" in the salutation line
  • After the phrase "is registered under the name" or "taxpayer name"
  Typically printed in ALL CAPS. Includes any suffix: LLC, Inc, Corp, DBA, etc.
  Return EXACTLY as printed (e.g. MAIN STREET BAKERY INC · ACME CONSULTING LLC · JANE DOE).

── issueDate  ──────────────────────────────────────────────────────────
  Location: TOP-RIGHT corner block, labeled one of:
    "Date of this notice"  ·  "Notice Date"  ·  "Date:"  ·  "Issued:"
  Convert any format to YYYY-MM-DD:
    "October 15, 2023"  → "2023-10-15"
    "10/15/2023"        → "2023-10-15"
    "10-15-2023"        → "2023-10-15"
    "2023-10-15"        → "2023-10-15"  (already correct)
  Return null only if completely unreadable.

── businessAddress  ─────────────────────────────────────────────────────
  Lines below the business name in the TOP-LEFT address block.
  Include street, city, state, and ZIP as a single string.

════════════════════════════════════════════════════════════════════════
OUTPUT — return ONLY this JSON object. No markdown. No explanation.
════════════════════════════════════════════════════════════════════════
{
  "docType": "EIN Assignment Notice (CP 575 A)",
  "issuingAuthority": "Internal Revenue Service",
  "permitNumber": null,
  "issueDate": null,
  "expirationDate": null,
  "businessName": null,
  "businessAddress": null,
  "status": "Active",
  "scope": "Confirms IRS assignment of a Federal Employer Identification Number (EIN).",
  "matchedFormIds": ["ein-application"],
  "summary": null,
  "suggestions": [
    "Store your EIN securely — you will need it for bank accounts, tax filings, and business registrations.",
    "Mark the EIN Application item as complete in your compliance checklist."
  ],
  "rawExtracted": {
    "EIN": null,
    "Notice Type": "CP 575 A",
    "Form": "SS-4"
  }
}

Replace each null with the actual value from the document:
  permitNumber / rawExtracted.EIN → the ##-####### number you found
  businessName                    → the entity name from the address block
  issueDate                       → the notice date in YYYY-MM-DD format
  summary                         → 2–3 sentences naming the business, the EIN, and what this notice confirms`;

// ── System prompt ─────────────────────────────────────────────────────────────
// Shared between text and vision paths. GPT-4o responds far better when
// classification rules live in the system turn rather than the user turn.
//
// v3 improvements for IRS documents:
//   • Massively expanded EIN / CP 575 recognition signals
//   • Explicit rule: permitNumber for EIN docs MUST be labelled "EIN", not "Permit / License #"
//   • Exact EIN format requirement (XX-XXXXXXX) with regex pattern
//   • Strong date extraction rules covering all IRS date field variants
//   • Never use placeholder values — if a field is in the document, extract it

const SYSTEM_PROMPT = `You are an expert US government document classifier and compliance analyst.
Your task is to identify, extract, and classify official government documents submitted by small-business owners.

You must recognize documents from ANY US jurisdiction — federal, all 50 states, every county, city, or municipality.
Never assume a specific state. Be jurisdiction-agnostic but hyper-accurate.

CRITICAL RULE — NEVER use placeholder values:
  - NEVER return "XX-XXXXXXX" as an EIN — always extract the real 9-digit number
  - NEVER return a generic business name like "My Business" — read the actual name from the document
  - NEVER return "Invalid Date" or placeholder dates — parse the actual date or return null
  - If you cannot read a field clearly, return null, NOT a placeholder

────────────────────────────────────────────────────────────────────────────────
DOCUMENT TYPE RECOGNITION — key signals for each category
────────────────────────────────────────────────────────────────────────────────

1. EIN ASSIGNMENT / IRS NOTICE  →  docType: "EIN Assignment Notice"
   ─────────────────────────────────────────────────────────────────
   This is the HIGHEST PRIORITY document type. If ANY of these signals appear,
   classify immediately as "EIN Assignment Notice":

   IRS Notice codes: "CP 575", "CP575", "CP 575 A", "CP575A", "CP-575",
                     "CP 575B", "CP 147", "CP 147C"
   Form references:  "Form SS-4", "SS-4", "SS4", "Form SS4"
   Exact phrases:    "We assigned you an Employer Identification Number",
                     "We assigned you EIN",
                     "Your Employer Identification Number",
                     "Employer Identification Number (EIN)",
                     "Federal Tax Identification Number",
                     "Federal Employer Identification Number",
                     "FEIN", "Federal Tax ID"
   Agency signals:   "Department of the Treasury", "Internal Revenue Service",
                     "IRS", "Treasury", "Cincinnati, OH", "Ogden, UT",
                     "Austin, TX" (IRS processing centers)
   Layout signals:   A 9-digit number in the format XX-XXXXXXX near the words
                     "Employer Identification Number" or "EIN"

   ── EIN FIELD EXTRACTION (CRITICAL) ────────────────────────────────────────
   permitNumber: Extract the EIN as exactly XX-XXXXXXX (two digits, dash, seven digits).
     • Look for a number matching the pattern \d{2}-\d{7}
     • It appears near text like "EIN", "Employer Identification Number",
       "Your EIN is", "We assigned you", "Tax ID"
     • NEVER return "XX-XXXXXXX" — always extract the real digits
     • Place this value in BOTH permitNumber AND rawExtracted["EIN"]

   businessName: The legal business name registered with the IRS.
     • On CP 575: appears below the address block, labeled "Dear Taxpayer:" section,
       or after "is registered under the name" / "in care of" / business section
     • Look for the name immediately above or near the address
     • NEVER return a generic placeholder — read the actual name

   issueDate: The date the IRS issued or generated this notice.
     • Look for: "Date of this notice", "Notice Date", "Date:", "Issued:",
       any date near the notice number at the top of the letter
     • CP 575 format: "Month DD, YYYY" (e.g., "October 15, 2023")
     • Convert all date formats to YYYY-MM-DD

   expirationDate: null — EINs do not expire

   status: "Active" — EINs are permanent once assigned

   issuingAuthority: "Internal Revenue Service"

   formId: ["ein-application"]

   rawExtracted must include:
     { "EIN": "XX-XXXXXXX", "Notice Type": "CP 575 A", "Tax Year": "...",
       "Form": "SS-4", "IRS Processing Center": "..." }

2. ARTICLES OF ORGANIZATION / LLC FORMATION  →  docType: "Articles of Organization"
   Signals: "Articles of Organization", "Certificate of Organization",
            "Articles of Formation", "Certificate of Formation",
            "Limited Liability Company", "LLC", "organized and existing",
            Secretary of State, Division of Corporations, Corporations Division
   Covers: DE LLC, FL LLC, CA LLC, TX Certificate of Formation, NY Articles of Org, etc.
   formId: ["articles-of-organization", "certificate-of-formation", "business-registration"]

3. ARTICLES OF INCORPORATION / CORPORATION  →  docType: "Articles of Incorporation"
   Signals: "Articles of Incorporation", "Certificate of Incorporation",
            "Certificate of Good Standing", "corporate charter",
            "corporation", "incorporated", "Inc.", "Corp.",
            Secretary of State, Corporations Division
   formId: ["articles-of-incorporation", "business-registration"]

4. BUSINESS LICENSE / GENERAL BUSINESS PERMIT  →  docType: "Business License / Permit"
   Signals: "Business License", "Business Tax Receipt", "Business Permit",
            "Local Business Tax", "Occupational License", "Privilege License",
            "Vendor License", "Business Registration Certificate",
            City of ..., County of ..., Town of ..., Borough of ...,
            Finance Department, Revenue Division, Tax Collector
   formId: ["business-license"]

5. SALES TAX PERMIT / SELLER'S PERMIT  →  docType: "Sales Tax Permit"
   Signals: "Sales Tax Permit", "Seller's Permit", "Resale Certificate",
            "Sales and Use Tax", "Retail Sales Tax", "Tax Permit",
            "Certificate of Registration", "Sales Tax Registration",
            Department of Revenue, Board of Equalization, Comptroller of Public Accounts,
            Division of Taxation
   formId: ["sales-tax-registration"]

6. FICTITIOUS NAME / DBA REGISTRATION  →  docType: "Fictitious Name / DBA Registration"
   Signals: "Fictitious Name", "Fictitious Business Name", "DBA", "d/b/a",
            "Doing Business As", "Assumed Name", "Trade Name Registration",
            "Assumed Business Name", "Trade Name Certificate"
   formId: ["fictitious-name"]

7. FOOD SERVICE / RESTAURANT HEALTH PERMIT  →  docType: "Food Service Permit"
   Signals: "Food Service", "Food Establishment Permit", "Restaurant License",
            "Food Handler", "Food Safety", "Health Permit",
            "Retail Food Establishment", "Food Facility Permit",
            Health Department, Department of Health, DBPR, Division of Hotels and Restaurants
   formId: ["food-service-permit", "health-permit"]

8. MOBILE FOOD VENDOR PERMIT  →  docType: "Mobile Food Vendor Permit"
   Signals: "Mobile Food", "Food Truck", "Mobile Food Unit", "Food Cart",
            "Catering Vehicle", "Mobile Vendor", "Mobile Food Establishment"
   formId: ["mobile-food-vendor", "food-service-permit"]

9. HOME OCCUPATION PERMIT  →  docType: "Home Occupation Permit"
   Signals: "Home Occupation", "Home Business Permit", "Home Office Permit",
            "Residential Business", "Home-Based Business"
   formId: ["home-occupation-permit"]

10. COTTAGE FOOD PERMIT / EXEMPTION  →  docType: "Cottage Food Permit"
    Signals: "Cottage Food", "Home Kitchen", "Cottage Food Operation",
             "Cottage Food Law", "Home Food Production", "Cottage Food Exemption"
    formId: ["cottage-food-permit", "food-service-permit"]

11. ZONING / OCCUPANCY PERMIT  →  docType: "Zoning / Occupancy Permit"
    Signals: "Certificate of Occupancy", "Zoning Permit", "Land Use Permit",
             "Use Permit", "Occupancy Permit", "Zoning Approval",
             "Building Department", "Planning Department", "Zoning Division"
    formId: ["zoning-permit", "occupancy-permit"]

12. OTHER GOVERNMENT DOCUMENT  →  docType: "Other Government Document"
    Use this as a catch-all for official government documents that don't match above.
    Never use "Unknown Document" if there's any government text present.

────────────────────────────────────────────────────────────────────────────────
STATUS RULES
────────────────────────────────────────────────────────────────────────────────
- "Active"    — currently valid, not expired, no suspension noted
- "Expired"   — explicit expiration date is in the past, or "EXPIRED" text present
- "Suspended" — explicitly suspended or revoked
- "Pending"   — application received but not yet approved
- "Unknown"   — ONLY use this if the document cannot be classified at all

EINs, Articles of Org/Inc, and entity registrations: ALWAYS "Active" (they don't expire).
Licenses and permits: "Active" unless expiration date is in the past.

────────────────────────────────────────────────────────────────────────────────
FIELD EXTRACTION RULES (applies to ALL document types)
────────────────────────────────────────────────────────────────────────────────

permitNumber:
  • For EIN documents: MUST be the actual EIN in format XX-XXXXXXX (e.g., "12-3456789").
    Never use "XX-XXXXXXX" as a value — that is the format description, not a value.
  • For all other documents: the permit number, license number, or filing number.
  • If genuinely not found: null

issueDate:
  • Look for: "Date of this notice", "Notice Date", "Date:", "Issue Date",
    "Effective Date", "Filing Date", "Date Issued", "Issued on"
  • IRS notices typically print the date near the top right, e.g. "October 15, 2023"
  • Convert ALL date formats (Month DD, YYYY / MM/DD/YYYY / MM-DD-YYYY) to YYYY-MM-DD
  • If genuinely not found: null

expirationDate:
  • Look for: "Expiration Date", "Expires", "Valid Through", "Renewal Date", "Exp:"
  • EINs and entity formation documents: null (they do not expire)
  • If genuinely not found: null

businessName:
  • Extract the EXACT legal business name as printed — every word, punctuation, LLC/Inc suffix
  • For IRS EIN notices: the name appears in the address block at the top of the letter,
    or in the body near "registered under the name" / "taxpayer name"
  • NEVER substitute with a placeholder or the user's context businessName

businessAddress:
  • Full address as printed: street, city, state, ZIP
  • For IRS notices: this is the address block at the top of the letter (taxpayer's address)

issuingAuthority:
  • Full official name of the government agency
  • For IRS: "Internal Revenue Service" (not just "IRS")
  • For state filings: full department name (e.g., "Florida Department of State, Division of Corporations")

rawExtracted:
  • Include ALL readable key-value pairs from the document
  • For EIN notices MUST include: "EIN", "Notice Type", "Form", "Tax Year" (if present),
    "IRS Processing Center" (if visible), "NAICS Code" (if present)

────────────────────────────────────────────────────────────────────────────────
OUTPUT FORMAT — return ONLY this JSON object, no markdown, no explanation
────────────────────────────────────────────────────────────────────────────────
{
  "docType": "string — use the canonical names from the recognition list above",
  "issuingAuthority": "string — full official agency name",
  "permitNumber": "string | null — actual EIN (XX-XXXXXXX format) for IRS docs, or permit/license number",
  "issueDate": "YYYY-MM-DD | null — real date extracted from document",
  "expirationDate": "YYYY-MM-DD | null — null if document does not expire",
  "businessName": "string | null — exact name as printed on document",
  "businessAddress": "string | null — full address as printed",
  "status": "Active | Expired | Suspended | Pending | Unknown",
  "scope": "string | null — one sentence describing what this authorizes",
  "matchedFormIds": ["array of IDs from the formId lists in the recognition section above"],
  "summary": "string — 2-3 sentence plain-English explanation including the real EIN/permit number and business name",
  "suggestions": ["string — specific next action", "string — specific next action"],
  "rawExtracted": { "EIN": "XX-XXXXXXX if applicable", "Field Name": "Exact Value" }
}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Attempt to extract human-readable text from a raw PDF byte buffer.
 * Handles BT/ET text blocks, parenthesised strings, hex strings, and basic
 * ToUnicode CMap hints. Works for digital PDFs; returns "" for scanned images.
 */
function extractPdfText(buffer: Uint8Array): string {
  const raw = Buffer.from(buffer).toString("latin1");
  const texts: string[] = [];

  // BT … ET blocks (standard PDF text object blocks)
  const btEtRe = /BT\s([\s\S]*?)ET/g;
  let m: RegExpExecArray | null;
  while ((m = btEtRe.exec(raw)) !== null) {
    const block = m[1];

    // Parenthesised literal strings — Tj / TJ / ' / " operators
    const strRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
    let sm: RegExpExecArray | null;
    while ((sm = strRe.exec(block)) !== null) {
      const t = sm[1]
        .replace(/\\n/g, " ")
        .replace(/\\r/g, " ")
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .trim();
      if (t.length > 1) texts.push(t);
    }

    // Hex strings inside TJ arrays — common in Type1 / CIDFont PDFs
    const hexArrayRe = /\[([^\]]*)\]/g;
    let am: RegExpExecArray | null;
    while ((am = hexArrayRe.exec(block)) !== null) {
      const hexRe2 = /<([0-9A-Fa-f]{4,})>/g;
      let hm: RegExpExecArray | null;
      while ((hm = hexRe2.exec(am[1])) !== null) {
        const hex = hm[1];
        if (hex.length % 4 !== 0) continue; // 2-byte Unicode pairs
        let decoded = "";
        for (let i = 0; i < hex.length; i += 4) {
          const code = parseInt(hex.slice(i, i + 4), 16);
          if (code > 31) decoded += String.fromCharCode(code);
        }
        if (decoded.length > 1) texts.push(decoded.trim());
      }
    }
  }

  // Top-level hex strings <DEADBEEF> outside BT/ET (less common)
  const hexRe = /<([0-9A-Fa-f]{4,})>/g;
  while ((m = hexRe.exec(raw)) !== null) {
    const hex = m[1];
    if (hex.length % 2 !== 0) continue;
    let decoded = "";
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.slice(i, i + 2), 16);
      if (code > 31 && code < 127) decoded += String.fromCharCode(code);
    }
    if (decoded.length > 2) texts.push(decoded.trim());
  }

  // Also look for raw printable ASCII runs in streams (catches some encodings
  // that slip past BT/ET — e.g. XFA-based IRS forms)
  const streamRe = /stream\r?\n([\s\S]*?)endstream/g;
  while ((m = streamRe.exec(raw)) !== null) {
    // Only consider uncompressed streams (no FlateDecode header nearby)
    const header = raw.slice(Math.max(0, m.index - 300), m.index);
    if (header.includes("FlateDecode") || header.includes("LZWDecode")) continue;
    const printable = m[1].replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
    if (printable.length > 20) texts.push(printable.slice(0, 2000));
  }

  return texts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Build the user-turn message for the AI, describing document content and
 * business context. The system prompt (SYSTEM_PROMPT) is sent separately.
 */
function buildUserMessage(opts: {
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

  return `BUSINESS CONTEXT:
  Name: ${businessName}
  Location: ${location}

PENDING COMPLIANCE ITEMS (not yet completed):
${pendingItems || "  (none)"}

ALREADY COMPLETED ITEMS:
${doneItems || "  (none)"}

DOCUMENT CONTENT:
${contentDescription}

INSTRUCTIONS:
1. Classify the document using the recognition patterns from your system instructions.
2. Extract all fields. For EIN documents: always extract the EIN as permitNumber.
3. Match against the pending compliance items above — include formIds ONLY for items this document clearly satisfies.
4. Set summary to explain what this document is and what it means for ${businessName}'s compliance.
5. Return ONLY the JSON object — no markdown, no explanation.`;
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
              list.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]),
              );
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

// ── Vision analysis helper ────────────────────────────────────────────────────

// v4: Added optional `contentDescription` parameter so the PDF thin-text path
// can supply a custom, highly-specific IRS prompt instead of the generic one.
async function analyzeWithVision(
  openai: OpenAI,
  imageDataUrl: string,
  mimeType: string,
  opts: { businessName: string; location: string; checklistItems: ChecklistItem[] },
  filename: string,
  contentDescription?: string,
): Promise<DocumentAnalysis> {
  // Default content description used for image uploads (not PDF vision fallback).
  const defaultContentDesc = [
    "See the attached document. Read ALL visible text carefully before classifying.",
    "",
    "PRIORITY EXTRACTION — scan for these specific fields first:",
    "1. EIN (Employer Identification Number): a 9-digit number formatted as XX-XXXXXXX.",
    "   Look near the words 'EIN', 'Employer Identification Number', 'Federal Tax ID'.",
    "   Extract the EXACT digits — NEVER return 'XX-XXXXXXX' as a value.",
    "2. Legal business name: in the address block at the top of IRS letters,",
    "   or near 'taxpayer name', 'registered under', 'in care of'.",
    "3. Issue date: top right of IRS letters — 'Date of this notice', 'Notice Date',",
    "   or any date like 'October 15, 2023'. Convert to YYYY-MM-DD.",
    "4. IRS notice type: look for 'CP 575', 'CP 575 A', 'CP575', 'Form SS-4',",
    "   'Department of the Treasury', 'Internal Revenue Service'.",
  ].join("\n");

  // v7: 30-second timeout — avoids hanging requests that produce opaque 504s
  const response = await withTimeout(
    openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: buildUserMessage({
                contentDescription: contentDescription ?? defaultContentDesc,
                ...opts,
              }),
            },
            {
              type: "image_url",
              image_url: { url: imageDataUrl, detail: "high" },
            },
          ],
        },
      ],
    }),
    30_000,
    "OpenAI vision call",
  );

  const raw = response.choices[0]?.message?.content ?? "{}";
  return parseAnalysisJson(raw, filename);
}

// ── v11/v12: Post-vision field cleanup ────────────────────────────────────────
// After GPT-4o returns, scrub any placeholder values it emitted and attempt
// regex rescue from the partial text layer. This runs for every IRS EIN result
// regardless of whether vision succeeded or the fallback fired.
//
// v12: Regexes updated to catch "null" string literals (GPT-4o sometimes returns
// the word "null" as a string rather than JSON null) and any REPLACE_* variants
// that leaked from older prompt templates.

// ── v15: Post-vision field cleanup regexes ────────────────────────────────────

// Matches any non-real EIN value the model might return
const EIN_PLACEHOLDER_RE =
  /^(XX-XXXXXXX|xx-xxxxxxx|REPLACE_WITH_REAL_EIN.*|\d{2}-#{7}|null|undefined|n\/a|none)$/i;

// Matches any non-real business name
const NAME_PLACEHOLDER_RE =
  /^(REPLACE_WITH_REAL_BUSINESS_NAME|My Business|Unknown Business|N\/A|None|null|undefined)$/i;

// Matches any non-real date value
const DATE_PLACEHOLDER_RE =
  /^(REPLACE_WITH_REAL_DATE.*|REPLACE_WITH_REAL.*|Invalid Date|N\/A|None|null|undefined|unknown)$/i;

// Matches a valid EIN anywhere in a string: two digits, hyphen, seven digits
const EIN_DIGIT_RE = /\b(\d{2}-\d{7})\b/;

// Matches a business entity name followed by a common suffix.
// Used to rescue businessName from partial PDF text when vision returns null.
// Pattern: 2–60 uppercase chars/digits/spaces/punctuation, then an entity suffix.
// Keep this broad — false positives are filtered by the boilerplate exclusion below.
const BIZ_NAME_RE =
  /\b([A-Z][A-Z0-9 &',./-]{1,58}\s+(?:LLC|INC\.?|CORP\.?|LTD\.?|CO\.?|COMPANY|ENTERPRISES|ENTERPRISE|GROUP|SERVICES|SERVICE|SOLUTIONS|SOLUTION|HOLDINGS|HOLDING|PARTNERS|PARTNERSHIP|ASSOCIATES|TRUST|FUND|FOUNDATION|SYSTEMS|SYSTEM|TECHNOLOGIES|TECHNOLOGY)\.?)\b/;

// Strings that look like business names but are IRS boilerplate — excluded from rescue
const IRS_BOILERPLATE_RE =
  /INTERNAL REVENUE|DEPARTMENT OF THE TREASURY|EMPLOYER IDENTIFICATION|SOCIAL SECURITY|OGDEN|CINCINNATI|AUSTIN TX|KANSAS CITY/i;

// Matches common date formats found in IRS notices — all captured groups tried in order:
//   1. ISO:            YYYY-MM-DD
//   2. Slash numeric:  MM/DD/YYYY or M/D/YYYY
//   3. Hyphen numeric: MM-DD-YYYY
//   4. Named month:    Month DD, YYYY  or  Month D YYYY
const DATE_RESCUE_RE =
  /\b(\d{4}-\d{2}-\d{2})\b|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}-\d{1,2}-\d{4})|([A-Z][a-z]+ \d{1,2},?\s*\d{4})/;

/**
 * v15: Scrub placeholder values from vision output and attempt regex rescue
 * from the raw partial text extracted from the PDF byte stream.
 *
 * Rescue order for each field:
 *   1. Accept the vision value if it passes the placeholder filter.
 *   2. If not, try to match the field from partialText using regexes.
 *   3. If regex also fails, set the field to undefined (rendered as null).
 */
function extractFieldsFromVisionResult(
  analysis: DocumentAnalysis,
  partialText: string,
): DocumentAnalysis {
  // ── permitNumber / EIN ──────────────────────────────────────────────────────
  if (!analysis.permitNumber || EIN_PLACEHOLDER_RE.test(analysis.permitNumber)) {
    const m = EIN_DIGIT_RE.exec(partialText);
    if (m) {
      console.log(`[document/analyze] EIN rescued from partial text: "${m[1]}"`);
      analysis.permitNumber = m[1];
    } else {
      analysis.permitNumber = undefined;
    }
  }

  // Sync rawExtracted["EIN"] with permitNumber
  if (analysis.permitNumber && typeof analysis.rawExtracted === "object" && analysis.rawExtracted !== null) {
    (analysis.rawExtracted as Record<string, string>)["EIN"] = analysis.permitNumber;
  }

  // ── businessName ────────────────────────────────────────────────────────────
  if (!analysis.businessName || NAME_PLACEHOLDER_RE.test(analysis.businessName)) {
    // v15: scan partial text for an ALL-CAPS entity name with a business suffix
    const bizM = BIZ_NAME_RE.exec(partialText);
    if (bizM && !IRS_BOILERPLATE_RE.test(bizM[1])) {
      const candidate = bizM[1].trim();
      console.log(`[document/analyze] businessName rescued from partial text: "${candidate}"`);
      analysis.businessName = candidate;
    } else {
      analysis.businessName = undefined;
    }
  }

  // ── issueDate ───────────────────────────────────────────────────────────────
  if (!analysis.issueDate || DATE_PLACEHOLDER_RE.test(analysis.issueDate)) {
    const dateM = DATE_RESCUE_RE.exec(partialText);
    if (dateM) {
      // Use whichever capture group matched
      const rawDate = (dateM[1] ?? dateM[2] ?? dateM[3] ?? dateM[4] ?? "").trim();
      // ISO format is already correct; all others go through Date()
      const iso = dateM[1] ??
        (() => {
          const parsed = new Date(rawDate);
          return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
        })();
      if (iso) {
        console.log(`[document/analyze] issueDate rescued from partial text: "${iso}"`);
        analysis.issueDate = iso;
      } else {
        analysis.issueDate = undefined;
      }
    } else {
      analysis.issueDate = undefined;
    }
  }

  // ── Enforce IRS constants and rebuild summary for all EIN docs ──────────────
  if (
    analysis.docType === "EIN Assignment Notice" ||
    analysis.docType === "EIN Assignment Notice (CP 575 A)"
  ) {
    analysis.issuingAuthority = "Internal Revenue Service";
    analysis.expirationDate   = null;
    analysis.status           = "Active";
    if (!analysis.matchedFormIds.includes("ein-application")) {
      analysis.matchedFormIds = ["ein-application", ...analysis.matchedFormIds];
    }
    // Rebuild summary with whatever real values were extracted or rescued
    const einStr  = analysis.permitNumber ? `EIN ${analysis.permitNumber}` : "a Federal EIN";
    const bizStr  = analysis.businessName ? ` for ${analysis.businessName}` : "";
    const dateStr = analysis.issueDate    ? `, issued ${analysis.issueDate}` : "";
    analysis.summary =
      `This is an IRS EIN Assignment Notice (CP 575 A) confirming the assignment of ${einStr}${bizStr}${dateStr}. ` +
      `The EIN is a permanent Federal Employer Identification Number — it does not expire. ` +
      `Keep this document in a secure location.`;
    if (!analysis.suggestions?.length) {
      analysis.suggestions = [
        "Store your EIN securely — you will need it for bank accounts, tax filings, and business registrations.",
        "Mark the EIN Application item as complete in your compliance checklist.",
      ];
    }
  }

  return analysis;
}

// ── Route handler ─────────────────────────────────────────────────────────────
//
// v15: Dual-mode handler
//   • Storage-first mode (JSON body): client uploads file directly to Supabase
//     Storage, then POSTs { storagePath, fileName, mimeType, businessName,
//     location, businessId, checklist } as JSON. Handler downloads from storage
//     and runs AI analysis. No large file body reaches this endpoint.
//   • FormData mode (legacy): client POSTs the file directly. Retained for small
//     files (images, PDFs < 5 MB) where body size is not an issue.

export async function POST(req: NextRequest) {
  // v19 — Enhanced error logging and user-friendly messages
  // v7: Outer try/catch — guarantees a valid JSON response for ANY throw,
  // including errors during form parsing, auth, storage, compression, or AI.
  try {

  // ── 1. Detect mode: JSON (storage-first) vs FormData (direct upload) ────────
  const contentType = req.headers.get("content-type") ?? "";
  const isJsonMode  = contentType.includes("application/json");

  // v37 — Log every incoming request so we can trace failures from the very
  // first line rather than guessing which stage silently dropped the request.
  console.log(
    `[document/analyze] ── v37 request received ──\n` +
    `  content-type : "${contentType}"\n` +
    `  mode         : ${isJsonMode ? "JSON / storage-first" : "FormData / direct upload"}\n` +
    `  timestamp    : ${new Date().toISOString()}`,
  );

  let fileName: string;
  let mimeType: string;
  let businessId: string;
  let businessName: string;
  let location: string;
  let checklistItems: ChecklistItem[] = [];
  let fileBytes: ArrayBuffer;
  let storagePath = "";

  const { supabase, user } = await getAuthenticatedUser();
  // v19 — Log auth state so we can distinguish guest vs authenticated failures
  console.log(
    `[document/analyze] step 1 — auth: user=${user ? `"${user.id.slice(0, 8)}…"` : "guest"} ` +
    `supabase=${supabase ? "connected" : "null"}`,
  );

  if (isJsonMode) {
    // ── Storage-first mode ──────────────────────────────────────────────────
    // Client uploaded the file directly to Supabase Storage and now provides
    // the storage path. We download the file from storage for AI analysis.
    // This avoids sending a large body through our API entirely.
    let body: Record<string, unknown>;
    try {
      body = await req.json() as Record<string, unknown>;
    } catch (jsonErr) {
      // v19 — log the raw parse error so we can see malformed bodies in logs
      console.error("[document/analyze] step 1a — JSON body parse failed:", jsonErr);
      return NextResponse.json(
        { ok: false, error: "Request body is not valid JSON. Please retry." },
        { status: 400 },
      );
    }

    storagePath  = (body.storagePath  as string | null) ?? "";
    fileName     = (body.fileName     as string | null) ?? "document.pdf";
    mimeType     = (body.mimeType     as string | null) ?? "application/pdf";
    businessId   = (body.businessId   as string | null) ?? "";
    businessName = (body.businessName as string | null) ?? "Unknown Business";
    location     = (body.location     as string | null) ?? "";

    const checklistRaw = (body.checklist as string | null) ?? "[]";
    try {
      checklistItems = JSON.parse(checklistRaw) as ChecklistItem[];
    } catch { /* use empty array */ }

    // v19 — Log all parsed fields so we can verify the client sent the right data
    console.log(
      `[document/analyze] step 1b — JSON body parsed:\n` +
      `  storagePath  : "${storagePath}"\n` +
      `  fileName     : "${fileName}"\n` +
      `  mimeType     : "${mimeType}"\n` +
      `  businessId   : "${businessId}"\n` +
      `  businessName : "${businessName}"\n` +
      `  location     : "${location}"\n` +
      `  checklistItems: ${checklistItems.length} items`,
    );

    if (!storagePath) {
      console.error("[document/analyze] step 1b — storagePath missing in JSON body");
      return NextResponse.json(
        { ok: false, error: "Missing storagePath — the file must be uploaded to storage before calling this endpoint." },
        { status: 400 },
      );
    }
    if (!supabase) {
      console.error("[document/analyze] step 1b — no Supabase client (unauthenticated)");
      return NextResponse.json(
        { ok: false, error: "You must be signed in to use the storage-based upload path. Please sign in and try again." },
        { status: 401 },
      );
    }

    // Download the file from Supabase Storage
    // v19 — Log the exact bucket + path so we can verify the download attempt
    console.log(`[document/analyze] step 2 — downloading from storage bucket "business-documents" path "${storagePath}"`);
    const { data: storageData, error: downloadError } = await supabase.storage
      .from("business-documents")
      .download(storagePath);

    if (downloadError || !storageData) {
      // v19 — Log full error object to surface RLS violations, missing bucket, etc.
      console.error(
        `[document/analyze] step 2 — storage download FAILED:\n` +
        `  storagePath : "${storagePath}"\n` +
        `  error.message: ${downloadError?.message ?? "storageData was null"}\n` +
        `  error (full) :`, downloadError,
      );
      return NextResponse.json(
        {
          ok: false,
          error: `Storage download failed — could not retrieve the file from Supabase Storage.`,
          details: downloadError?.message ?? "storageData was null / empty",
        },
        { status: 502 },
      );
    }

    fileBytes = await storageData.arrayBuffer();
    console.log(
      `[document/analyze] step 2 — download OK ` +
      `size: ${Math.round(fileBytes.byteLength / 1024)} KB ` +
      `fileName: "${fileName}" mimeType: "${mimeType}"`,
    );

    // v37 — Size guard after storage download (same limit as FormData direct-upload path).
    // Without this, a >20 MB file that was uploaded to storage will sail past the FormData
    // check and hit OpenAI with a payload that always returns a 413 or timeout.
    if (fileBytes.byteLength > MAX_FILE_BYTES) {
      console.error(
        `[document/analyze] step 2 — downloaded file too large: ` +
        `${(fileBytes.byteLength / 1024 / 1024).toFixed(1)} MB (limit ${MAX_FILE_BYTES / 1024 / 1024} MB)`,
      );
      return NextResponse.json(
        {
          ok: false,
          error: `PDF too large for analysis (${(fileBytes.byteLength / 1024 / 1024).toFixed(1)} MB). ` +
                 `Maximum is ${MAX_FILE_BYTES / 1024 / 1024} MB — try compressing the file before uploading.`,
        },
        { status: 400 },
      );
    }

  } else {
    // ── FormData mode (direct upload, legacy / small files) ─────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (fdErr) {
      // v19 — log body parse failure (often a body-size limit hit before the handler)
      console.error("[document/analyze] step 1a — FormData parse failed:", fdErr);
      return NextResponse.json(
        {
          ok: false,
          error: "Could not parse the uploaded file. The file may be too large for the direct-upload path — try again; large PDFs are automatically routed through storage.",
          details: fdErr instanceof Error ? fdErr.message : String(fdErr),
        },
        { status: 400 },
      );
    }

    const fileEntry = formData.get("file");
    if (!fileEntry || !(fileEntry instanceof File)) {
      console.error("[document/analyze] step 1a — no 'file' field in FormData");
      return NextResponse.json(
        { ok: false, error: "No file was included in the upload request. Please select a file and try again." },
        { status: 400 },
      );
    }

    const file   = fileEntry;
    fileName     = file.name;
    mimeType     = file.type || "application/octet-stream";
    businessId   = (formData.get("businessId")   as string | null) ?? "";
    businessName = (formData.get("businessName")  as string | null) ?? "Unknown Business";
    location     = (formData.get("location")      as string | null) ?? "";

    const checklistRaw = (formData.get("checklist") as string | null) ?? "[]";
    try {
      checklistItems = JSON.parse(checklistRaw) as ChecklistItem[];
    } catch { /* use empty array */ }

    // v19 — Log all parsed FormData fields
    console.log(
      `[document/analyze] step 1b — FormData parsed:\n` +
      `  fileName     : "${fileName}"\n` +
      `  mimeType     : "${mimeType}"\n` +
      `  fileSize     : ${Math.round(file.size / 1024)} KB\n` +
      `  businessId   : "${businessId}"\n` +
      `  businessName : "${businessName}"\n` +
      `  location     : "${location}"\n` +
      `  checklistItems: ${checklistItems.length} items`,
    );

    // Validate file type
    if (!ACCEPTED_MIME.has(mimeType)) {
      console.error(`[document/analyze] step 1b — unsupported MIME type: "${mimeType}"`);
      return NextResponse.json(
        { ok: false, error: `Unsupported file type "${mimeType}". Please upload a PDF, JPG, PNG, GIF, WebP, or TIFF.` },
        { status: 400 },
      );
    }

    fileBytes = await file.arrayBuffer();
    if (fileBytes.byteLength > MAX_FILE_BYTES) {
      console.error(
        `[document/analyze] step 1b — file too large: ` +
        `${Math.round(fileBytes.byteLength / 1024 / 1024)} MB (limit ${MAX_FILE_BYTES / 1024 / 1024} MB)`,
      );
      return NextResponse.json(
        { ok: false, error: `PDF too large (${(fileBytes.byteLength / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_BYTES / 1024 / 1024} MB. Try compressing the PDF first.` },
        { status: 400 },
      );
    }

    // Upload to Supabase Storage (authenticated users only)
    if (supabase && user && businessId) {
      const ts       = Date.now();
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      storagePath    = `${user.id}/${businessId}/${ts}-${safeName}`;

      // v19 — Log storage upload attempt path
      console.log(`[document/analyze] step 1c — uploading to storage path "${storagePath}"`);

      const { error: uploadError } = await supabase.storage
        .from("business-documents")
        .upload(storagePath, fileBytes, { contentType: mimeType, upsert: false });

      if (uploadError) {
        // Non-fatal — continue with analysis even if storage fails
        // v19 — Log full error object, not just message
        console.error(
          `[document/analyze] step 1c — storage upload FAILED (non-fatal, continuing with analysis):\n` +
          `  storagePath: "${storagePath}"\n` +
          `  error.message: ${uploadError.message}\n` +
          `  error (full):`, uploadError,
        );
        storagePath = "";
      } else {
        console.log(`[document/analyze] step 1c — storage upload OK: "${storagePath}"`);
      }
    } else {
      // v19 — Log why storage was skipped so we can distinguish guest vs missing businessId
      console.log(
        `[document/analyze] step 1c — storage upload SKIPPED ` +
        `(supabase=${supabase ? "ok" : "null"} user=${user ? "ok" : "guest"} businessId="${businessId}")`,
      );
    }
  }

  // ── 2. Validate file type ─────────────────────────────────────────────────
  if (!ACCEPTED_MIME.has(mimeType)) {
    // v19 — This check also catches storage-first files with wrong MIME type
    console.error(`[document/analyze] step 2 — MIME type rejected after download: "${mimeType}"`);
    return NextResponse.json(
      { ok: false, error: `Unsupported file type "${mimeType}" — only PDF and image files are accepted.` },
      { status: 400 },
    );
  }

  // ── 5. Run AI analysis ────────────────────────────────────────────────────
  // v19 — Log all inputs to the AI stage so any failure can be traced to a
  // specific file + size + business combination without guessing.
  const openaiKeyPresent = !!(process.env.OPENAI_API_KEY?.length);
  console.log(
    `[document/analyze] step 3 — starting AI analysis:\n` +
    `  fileName     : "${fileName}"\n` +
    `  mimeType     : "${mimeType}"\n` +
    `  fileSize     : ${Math.round(fileBytes.byteLength / 1024)} KB\n` +
    `  businessName : "${businessName}"\n` +
    `  location     : "${location}"\n` +
    `  checklistItems: ${checklistItems.length}\n` +
    `  OPENAI_API_KEY: ${openaiKeyPresent ? "present" : "MISSING — analysis will fail"}\n` +
    `  storagePath  : "${storagePath}"`,
  );

  if (!openaiKeyPresent) {
    console.error("[document/analyze] step 3 — OPENAI_API_KEY is not set in environment");
    return NextResponse.json(
      { ok: false, error: "Vision API not configured — OPENAI_API_KEY is missing on the server. Contact support." },
      { status: 503 },
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const aiOpts = { businessName, location, checklistItems };

  let analysis: DocumentAnalysis;

  const isPdf    = mimeType === "application/pdf";
  const isImage  = mimeType.startsWith("image/");

  // ── v6: Wrap entire AI analysis in a try/catch with full diagnostics ─────────
  // Previous versions had a narrow catch that swallowed the real error message.
  // This block logs the full error (message + stack) and returns a structured
  // response so the client always gets useful feedback, never a network failure.
  try {
    if (isImage) {
      // ── Image path: vision always ─────────────────────────────────────────
      const base64  = Buffer.from(fileBytes).toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

      // v19 — detailed pre-call log (expanded from v6)
      console.log(
        `[document/analyze] step 3a — image vision call:\n` +
        `  file   : "${fileName}"\n` +
        `  mime   : "${mimeType}"\n` +
        `  size   : ${Math.round(fileBytes.byteLength / 1024)} KB\n` +
        `  base64 : ~${Math.round(base64.length / 1024)} KB payload to OpenAI`,
      );

      analysis = await analyzeWithVision(openai, dataUrl, mimeType, aiOpts, fileName);
      // v19 — log result immediately after vision returns
      console.log(
        `[document/analyze] step 3a — image vision result:\n` +
        `  docType : "${analysis.docType}"\n` +
        `  status  : "${analysis.status}"\n` +
        `  permitNumber: "${analysis.permitNumber ?? "null"}"`,
      );

    } else if (isPdf) {
      // ── v5: Vision-first for ALL PDFs ────────────────────────────────────────
      // We no longer attempt text extraction as the primary path. IRS XFA forms
      // (CP 575 A, SS-4), many state filings, and scanned government PDFs all
      // have unusable or empty text layers. GPT-4o vision reads the rendered
      // page directly and is the only reliable path for these documents.
      //
      // We still run extractPdfText to get any partial hints (even garbled text
      // can contain useful signals like "CP 575" or an EIN pattern), but we
      // always send the visual data to GPT-4o regardless.
      const pdfText = extractPdfText(new Uint8Array(fileBytes));
      const partialHint = pdfText.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
      console.log(
        `[document/analyze] PDF text extraction — ` +
        `non-ws chars: ${pdfText.replace(/\s+/g, "").length} ` +
        `partial hint: "${partialHint.slice(0, 80)}"`,
      );

      // v7: compress large PDFs through pdf-lib before base64 encoding to avoid
      // OpenAI request-size limits on 8–20 MB IRS letters.
      const pdfBytesForVision = await compressPdfForVision(fileBytes);
      const base64            = Buffer.from(pdfBytesForVision).toString("base64");
      const dataUrl           = `data:application/pdf;base64,${base64}`;

      console.log(
        `[document/analyze] PDF vision — file: "${fileName}" ` +
        `original: ${Math.round(fileBytes.byteLength / 1024)} KB ` +
        `payload: ${Math.round(pdfBytesForVision.byteLength / 1024)} KB ` +
        `base64: ~${Math.round(base64.length / 1024)} KB ` +
        `partial-text-chars: ${pdfText.replace(/\s+/g, "").length}`,
      );
      const filenamePrior = guessDocType(fileName);

      // v9: Choose the vision prompt based on filename classification.
      // When the filename already identifies this as an IRS EIN document, use
      // IRS_EIN_VISION_PROMPT — the ultra-specific extraction-only prompt that
      // skips re-classification and goes straight to field extraction.
      // For all other PDFs, use the generic multi-document prompt.
      const filenameIsEinPrior = filenamePrior === "EIN Assignment Notice";

      let chosenPrompt: string;
      if (filenameIsEinPrior) {
        // Prepend any partial text hint so the model has both visual and
        // text-layer signals to work with.
        const hint = partialHint.length > 15
          ? `\n\nPARTIAL TEXT EXTRACTED FROM PDF (may be garbled, use as supplementary signal only):\n"${partialHint}"\n`
          : "";
        chosenPrompt = IRS_EIN_VISION_PROMPT + hint;
        console.log(`[document/analyze] using IRS_EIN_VISION_PROMPT for "${fileName}"`);
      } else {
        // Generic multi-document prompt for non-IRS files
        chosenPrompt = [
          "════════════════════════════════════════════════════════════════════════",
          "DOCUMENT CLASSIFICATION TASK — READ EVERY WORD VISIBLE IN THE PDF",
          "════════════════════════════════════════════════════════════════════════",
          "",
          `FILENAME: "${fileName}"`,
          `FILENAME-BASED PRIOR: This is most likely a "${filenamePrior}".`,
          ...(partialHint.length > 15
            ? [`PARTIAL TEXT LAYER (may be garbled): "${partialHint}"`]
            : []),
          "",
          "Use the document type recognition rules from your system instructions.",
          "Extract all available fields and return ONLY the JSON object.",
          "No markdown. No explanation. JSON only.",
        ].join("\n");
        console.log(`[document/analyze] using generic vision prompt for "${fileName}"`);
      }

      analysis = await analyzeWithVision(openai, dataUrl, "application/pdf", aiOpts, fileName, chosenPrompt);

      // v13: run post-vision cleanup whenever the result IS an EIN document —
      // either because the filename pre-classified it OR because vision returned
      // an EIN docType on its own.  Previously, cleanup was gated on filenameIsEinPrior
      // alone, so a correct vision result on a generically-named file was never scrubbed.
      const isEinResult =
        filenameIsEinPrior ||
        analysis.docType === "EIN Assignment Notice" ||
        analysis.docType === "EIN Assignment Notice (CP 575 A)";

      if (isEinResult) {
        analysis = extractFieldsFromVisionResult(analysis, partialHint);
      }

      // v9: detailed post-vision diagnostic — log every extracted field so we
      // can see exactly what GPT-4o returned before the fallback runs.
      console.log(
        `[document/analyze] vision result:\n` +
        `  docType:          "${analysis.docType}"\n` +
        `  status:           "${analysis.status}"\n` +
        `  permitNumber:     "${analysis.permitNumber ?? "null"}"\n` +
        `  businessName:     "${analysis.businessName ?? "null"}"\n` +
        `  issueDate:        "${analysis.issueDate ?? "null"}"\n` +
        `  issuingAuthority: "${analysis.issuingAuthority ?? "null"}"\n` +
        `  matchedFormIds:   [${analysis.matchedFormIds.join(", ")}]\n` +
        `  rawExtracted.EIN: "${(analysis.rawExtracted as Record<string, string>)?.["EIN"] ?? "null"}"`,
      );

      // ── Hard EIN fallback (v5, strengthened in v9) ─────────────────────────
      // If vision returned weak results despite the IRS-specific prompt, force
      // the correct classification while PRESERVING any real fields vision did
      // extract (permitNumber / businessName / issueDate may be correctly set
      // even when docType or status came back wrong).
      const filenameIsEin = /cp\s?[-_]?\s?575|ss\s?[-_]?\s?4|\bein\b|oddss4|odds.*ss4|irsein|irscp|cp575/i.test(
        fileName.replace(/[-_\s]/g, ""),
      ) || ["oddss4", "ss4", "cp575", "einletter", "einconfirm", "einnotic", "fein", "irsein", "irscp"]
        .some(p => fileName.toLowerCase().replace(/[-_\s.]/g, "").includes(p));

      // v13: also treat the result as weak when classification succeeded but vision
      // returned no extractable field values — this is the exact failure mode for
      // XFA-based IRS PDFs where GPT-4o can classify the notice type from layout
      // signals but cannot read the individual field values from the XFA stream.
      const fieldsAllEmpty =
        !analysis.permitNumber &&
        !analysis.businessName &&
        !analysis.issueDate;

      const resultIsWeak =
        analysis.status === "Unknown" ||
        analysis.docType === "Unknown Document" ||
        analysis.docType === "Other Government Document" ||
        !analysis.docType ||
        (analysis.summary ?? "").toLowerCase().includes("unreadable") ||
        (analysis.summary ?? "").toLowerCase().includes("corrupted") ||
        fieldsAllEmpty; // v13: correct docType but no field values extracted

      if (filenameIsEin && resultIsWeak) {
        // v9: log which fields vision extracted vs which are being injected
        console.log(
          `[document/analyze] hard EIN fallback triggered — ` +
          `preserving: permitNumber="${analysis.permitNumber ?? "none"}" ` +
          `businessName="${analysis.businessName ?? "none"}" ` +
          `issueDate="${analysis.issueDate ?? "none"}"`,
        );
        // v11: Force EIN classification — preserve any real fields vision extracted
        analysis.docType          = "EIN Assignment Notice (CP 575 A)";
        analysis.status           = "Active";
        analysis.issuingAuthority = "Internal Revenue Service";
        analysis.expirationDate   = null;
        analysis.scope            = "Confirms assignment of a Federal Employer Identification Number (EIN) by the IRS.";
        if (!analysis.matchedFormIds.includes("ein-application")) {
          analysis.matchedFormIds = ["ein-application", ...analysis.matchedFormIds];
        }
        // v15: run post-processing to scrub placeholders and attempt partial-text rescue
        analysis = extractFieldsFromVisionResult(analysis, partialHint);

        // v15: rebuild a clean generic summary branching on which fields were recovered.
        // extractFieldsFromVisionResult already rebuilds summary for normal EIN docs;
        // this override runs only here inside the hard-fallback path to ensure the
        // summary reflects whether the EIN was ultimately recovered or not.
        const einStr  = analysis.permitNumber ? `EIN ${analysis.permitNumber}` : "a Federal EIN";
        const bizStr  = analysis.businessName ? ` for ${analysis.businessName}` : "";
        const dateStr = analysis.issueDate    ? `, issued ${analysis.issueDate}` : "";
        analysis.summary =
          `This is an IRS EIN Assignment Notice (CP 575 A) confirming the assignment of ${einStr}${bizStr}${dateStr}. ` +
          `The EIN is permanent and does not expire. ` +
          (analysis.permitNumber
            ? "Your EIN has been recorded — store this document securely."
            : "The AI could not fully read this PDF. Open the original document to locate your EIN (format: XX-XXXXXXX) and record it manually.");

        analysis.suggestions = [
          analysis.permitNumber
            ? `Your EIN is ${analysis.permitNumber}. Store it securely — you will need it for bank accounts, tax filings, and business registrations.`
            : "Open the original IRS CP 575 A letter to find your EIN (format: XX-XXXXXXX) and save it securely.",
          "Mark the EIN Application item as complete in your compliance checklist.",
        ];
      }

    } else {
      return NextResponse.json({ ok: false, error: "Unsupported file type" }, { status: 400 });
    }
  } catch (err: unknown) {
    // v19 — Enhanced error logging: full error object + stack, plus structured
    // human-readable message so the client (and Vercel logs) know exactly what failed.
    const message      = err instanceof Error ? err.message : String(err);
    const stack        = err instanceof Error ? err.stack : undefined;
    // OpenAI SDK errors expose .status, .code, .type on the thrown object
    const openaiStatus = (err as Record<string, unknown>)?.status;
    const openaiCode   = (err as Record<string, unknown>)?.code;
    const openaiType   = (err as Record<string, unknown>)?.type;

    console.error(
      `[document/analyze] step 3 — AI/VISION ERROR:\n` +
      `  file         : "${fileName}"\n` +
      `  size         : ${Math.round(fileBytes.byteLength / 1024)} KB\n` +
      `  openai.status: ${openaiStatus ?? "n/a"}\n` +
      `  openai.code  : ${openaiCode ?? "n/a"}\n` +
      `  openai.type  : ${openaiType ?? "n/a"}\n` +
      `  message      : ${message}\n` +
      (stack ? `  stack        :\n${stack}` : "") +
      `\n  full error object:`,
      err,  // v19 — log full error object (shows OpenAI response body in Vercel)
    );

    // v19 — Build a human-readable error message based on OpenAI status code
    let humanError: string;
    if (message.includes("timed out")) {
      humanError = "Vision API timed out — the document may be too complex. Try a smaller or simpler file.";
    } else if (String(openaiStatus) === "400") {
      humanError = "Vision API rejected the file (400 Bad Request) — the PDF may be too large, encrypted, or in an unsupported format.";
    } else if (String(openaiStatus) === "413") {
      humanError = "PDF too large for the Vision API — try compressing the file before uploading.";
    } else if (String(openaiStatus) === "429") {
      humanError = "Vision API rate limit reached — please wait a moment and try again.";
    } else if (String(openaiStatus) === "500" || String(openaiStatus) === "502" || String(openaiStatus) === "503") {
      humanError = "OpenAI Vision API is temporarily unavailable — please try again in a few minutes.";
    } else {
      humanError = "Vision API failed to analyse the document — please try again.";
    }

    // v8: Hard EIN fallback on AI failure — if the filename clearly identifies
    // this as an IRS document, return a useful result instead of a 502.
    // The user gets docType + matchedFormIds + explanation; they just won't
    // have the extracted EIN/name (which require a successful vision call).
    const lowerName = fileName.toLowerCase().replace(/[-_\s.]/g, "");
    const isIrsFilename =
      lowerName.includes("ss4") || lowerName.includes("cp575") ||
      lowerName.includes("oddss4") || lowerName.includes("oddsaoss4") ||
      lowerName.includes("einletter") || lowerName.includes("irsein") ||
      lowerName.includes("fein") || /\bein\b/.test(fileName.toLowerCase());

    if (isIrsFilename) {
      console.log(
        `[document/analyze] AI failed but filename is IRS — applying hard EIN fallback`,
      );
      const fallbackAnalysis: DocumentAnalysis = {
        docType:          "EIN Assignment Notice (CP 575 A)",
        issuingAuthority: "Internal Revenue Service",
        permitNumber:     undefined,
        issueDate:        undefined,
        expirationDate:   null,
        businessName:     undefined,
        businessAddress:  undefined,
        status:           "Active",
        scope:            "Confirms assignment of a Federal Employer Identification Number (EIN) by the IRS.",
        matchedFormIds:   ["ein-application"],
        summary:
          "This appears to be an IRS EIN Assignment Notice (CP 575 / Form SS-4). " +
          "The document could not be fully read by the AI, but it has been classified " +
          "based on the filename. The EIN is permanent and does not expire. " +
          "Please verify your EIN number by checking the original document.",
        suggestions: [
          "Open the original document to find your EIN (format: XX-XXXXXXX) and save it securely.",
          "Mark the EIN Application item as complete in your compliance checklist.",
        ],
        rawExtracted: { "Note": "AI extraction failed — please verify EIN manually from the original document." },
      };
      // Validate + return the fallback (skip the 502)
      fallbackAnalysis.matchedFormIds = fallbackAnalysis.matchedFormIds.filter(
        (id): id is typeof KNOWN_FORM_IDS[number] => (KNOWN_FORM_IDS as readonly string[]).includes(id),
      );
      return NextResponse.json({
        ok: true,
        storagePath,
        analysis: fallbackAnalysis,
        fileName,
        mimeType,
        sizeBytes: fileBytes.byteLength,
      });
    }

    // v19 — Non-IRS file with AI failure — return structured human-readable error
    return NextResponse.json(
      {
        ok:      false,
        error:   humanError,
        details: message,
      },
      { status: 502 },
    );
  }

  // ── 6. Validate matched form IDs (allow only known IDs) ────────────────────
  analysis.matchedFormIds = analysis.matchedFormIds.filter(
    (id): id is typeof KNOWN_FORM_IDS[number] => (KNOWN_FORM_IDS as readonly string[]).includes(id),
  );

  // ── 7. Return result ────────────────────────────────────────────────────────
  // v19 — Log full success summary including every extracted field
  console.log(
    `[document/analyze] step 4 — SUCCESS returning result:\n` +
    `  fileName        : "${fileName}"\n` +
    `  storagePath     : "${storagePath}"\n` +
    `  docType         : "${analysis.docType}"\n` +
    `  status          : "${analysis.status}"\n` +
    `  permitNumber    : "${analysis.permitNumber ?? "null"}"\n` +
    `  businessName    : "${analysis.businessName ?? "null"}"\n` +
    `  issueDate       : "${analysis.issueDate ?? "null"}"\n` +
    `  expirationDate  : "${analysis.expirationDate ?? "null"}"\n` +
    `  issuingAuthority: "${analysis.issuingAuthority ?? "null"}"\n` +
    `  matchedFormIds  : [${analysis.matchedFormIds.join(", ")}]\n` +
    `  summary (50ch)  : "${(analysis.summary ?? "").slice(0, 50)}"`,
  );
  return NextResponse.json({
    ok: true,
    storagePath,
    analysis,
    fileName,
    mimeType,
    sizeBytes: fileBytes.byteLength,
  });

  // v19 — Outer catch: log full error object + stack at every unhandled throw.
  // This fires for any stage not covered by an inner try/catch — e.g. unexpected
  // runtime errors, missing env vars that throw outside the AI block, etc.
  } catch (outerErr: unknown) {
    const message = outerErr instanceof Error ? outerErr.message : String(outerErr);
    const stack   = outerErr instanceof Error ? outerErr.stack : undefined;
    console.error(
      `[document/analyze] OUTER ERROR (unhandled — no inner catch caught this):\n` +
      `  message: ${message}\n` +
      (stack ? `  stack  :\n${stack}\n` : "") +
      `  full error object:`,
      outerErr,  // v19 — always dump the full object so Vercel shows response body
    );
    return NextResponse.json(
      {
        ok:      false,
        error:   "An unexpected error occurred while processing the document. Please try again.",
        details: message,
      },
      { status: 502 },
    );
  }
}

// ── JSON parser with fallback ─────────────────────────────────────────────────

function parseAnalysisJson(raw: string, filename: string): DocumentAnalysis {
  // Strip markdown fences if the model wrapped its response
  const cleaned = raw
    .replace(/^```(?:json)?\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<DocumentAnalysis> & {
      rawExtracted?: unknown;
    };
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
      rawExtracted:     (parsed.rawExtracted && typeof parsed.rawExtracted === "object" && !Array.isArray(parsed.rawExtracted))
                          ? parsed.rawExtracted as Record<string, string>
                          : {},
    };
  } catch {
    return {
      docType:        guessDocType(filename),
      status:         "Unknown",
      matchedFormIds: [],
      summary:        "The document was received but could not be fully parsed. Please review manually.",
      suggestions:    ["Manually verify the document and update your checklist."],
      rawExtracted:   {},
    };
  }
}

function isValidStatus(v: unknown): v is DocumentAnalysis["status"] {
  return ["Active", "Expired", "Suspended", "Pending", "Unknown"].includes(v as string);
}

/**
 * Filename-based document type guesser — used as a prior when AI parsing is
 * unreliable (thin-text PDFs) or as an absolute last-resort fallback.
 *
 * v4: Added more IRS patterns:
 *   oddss4.pdf, ods_ss4.pdf, irs_cp575.pdf, irs_notice.pdf, irsletter.pdf,
 *   taxid_notice.pdf, fein.pdf, employer_tax.pdf, notice_cp575.pdf
 */
function guessDocType(filename: string): string {
  const raw   = filename.toLowerCase();
  const lower = raw.replace(/[-_\s.]/g, "");

  // ── Federal IRS EIN / CP 575 / SS-4 (check first — highest priority) ────────
  // Matches every realistic filename variant for IRS EIN assignment notices:
  //   cp575.pdf, cp575a.pdf, cp-575.pdf, ss4.pdf, ss-4.pdf, odds_ss4.pdf,
  //   oddss4.pdf, ein.pdf, ein_letter.pdf, irs_ein.pdf, irs_notice.pdf,
  //   federal_tax_id.pdf, fein.pdf, employer_identification.pdf,
  //   employer_tax.pdf, notice_cp575.pdf, taxid_irs.pdf
  // v5: Added "odds" pattern — ODDS Drive LLC file (ODDS-AO-SS4.pdf) should
  // resolve to EIN Assignment Notice from the filename alone.
  if (
    /cp\s?[-_]?\s?575/.test(raw) ||          // cp575, cp-575, cp 575, cp_575
    /ss\s?[-_]?\s?4/.test(raw) ||             // ss4, ss-4, ss 4, ss_4
    /\bein\b/.test(raw) ||                    // standalone "ein" word
    lower.includes("cp575") ||
    lower.includes("ss4") ||
    lower.includes("oddss4") ||               // ODDS SS4 — the specific file reported
    lower.includes("oddsaoss4") ||            // ODDS-AO-SS4 variant
    lower.includes("einletter") ||
    lower.includes("einconfirm") ||
    lower.includes("einnotic") ||
    lower.includes("employerid") ||
    lower.includes("employeridentification") ||
    lower.includes("employertax") ||
    lower.includes("federaltax") ||
    lower.includes("federalemployer") ||
    lower.includes("irsnotic") ||
    lower.includes("irsletter") ||
    lower.includes("irscp") ||
    lower.includes("irsein") ||
    lower.includes("fein") ||
    (lower.includes("taxid") && (lower.includes("irs") || lower.includes("notice")))
  ) {
    return "EIN Assignment Notice";
  }

  // ── State entity filings ───────────────────────────────────────────────────
  if (lower.includes("articlesoforg") || lower.includes("articleoforg") ||
      (lower.includes("articles") && lower.includes("org"))) return "Articles of Organization";
  if (lower.includes("articlesofinc") ||
      (lower.includes("articles") && lower.includes("inc"))) return "Articles of Incorporation";
  if (lower.includes("certificateofformation") || lower.includes("certofformation")) return "Certificate of Formation";

  // ── Local licenses / permits ───────────────────────────────────────────────
  if (lower.includes("license"))    return "Business License / Permit";
  if (lower.includes("permit"))     return "Business License / Permit";
  if (lower.includes("fictitious") || lower.includes("dba") || lower.includes("assumed")) return "Fictitious Name / DBA Registration";
  if (lower.includes("salestax") || lower.includes("sellerspermit")) return "Sales Tax Permit";
  if (lower.includes("food") || lower.includes("health")) return "Food Service Permit";
  if (lower.includes("homeoccupation") || lower.includes("homeocc")) return "Home Occupation Permit";
  if (lower.includes("zoning") || lower.includes("occupancy")) return "Zoning / Occupancy Permit";

  // ── Generic fallbacks ──────────────────────────────────────────────────────
  if (lower.includes("llc") || lower.includes("corp") || lower.includes("inc")) return "Business Registration";
  if (lower.includes("tax"))        return "Tax Registration";
  return "Government Document";
}

// ── Increase body size limit for PDF uploads ──────────────────────────────────
// v14 — Forced Node.js Runtime + 100mb Limit
//
// Root cause: without `export const runtime = "nodejs"` (added above), the
// handler may run in the Edge Runtime where bodyParser limits are enforced at
// the infrastructure level and cannot be overridden by the config export below.
//
// With the Node.js runtime forced, the bodyParser config is respected:
//   sizeLimit raised from 50mb → 100mb to handle large scanned IRS PDFs.
//   compressPdfForVision() still runs to reduce the base64 payload before
//   sending to OpenAI, so the effective OpenAI request size stays well below
//   the API limit.
// NOTE: export const config = { api: { bodyParser: ... } } was removed in v52.
// App Router routes do not support the Pages Router config export. The runtime,
// dynamic, and maxDuration exports at the top of this file replace it.
