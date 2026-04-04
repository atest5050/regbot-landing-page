// Shared domain types for RegBot persistence layer.
// Imported by app/chat/page.tsx and lib/regbot-db.ts to avoid duplication.
//
// These types mirror the shape of their corresponding Supabase table rows
// (with camelCase instead of snake_case). The DB layer in regbot-db.ts
// handles the translation between the two.

import type { ChecklistItem } from "@/lib/checklist";
import type { CompletedFormEntry } from "@/lib/generateCompliancePacket";

// Re-export so callers only need to import from this file.
export type { ChecklistItem, CompletedFormEntry };

// ── SavedMessage ──────────────────────────────────────────────────────────────
// Serialisable subset of the chat Message type — omits the ephemeral UI fields
// (formClarify, formMap) that are only needed during an active AI response.
// Stored per-business so chat history is restored when switching businesses.

export interface SavedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// ── SavedBusiness ─────────────────────────────────────────────────────────────
// Represents a user's saved business profile. Stored in the `businesses` table.
// The `checklist` and `completedForms` fields are JSONB snapshots — they capture
// the state at the moment the user clicks "Save", not a live query.

export interface SavedBusiness {
  /** Composite string ID (matches localStorage format + Supabase TEXT PK). */
  id: string;
  name: string;
  location: string;
  /** ISO timestamp of the initial save. */
  savedAt: string;
  checklist: ChecklistItem[];
  completedForms?: CompletedFormEntry[];
  // ── Living Profile fields — recalculated on every save/load ──────────────
  /** Compliance health score 0–100 */
  healthScore?: number;
  /** Total checklist items at last save */
  totalForms?: number;
  /** Count of "done" checklist items at last save */
  completedFormsCount?: number;
  /** ISO timestamp of last save or load — shown as "Checked N days ago" */
  lastChecked?: string;
  // ── Business profile fields ───────────────────────────────────────────────
  /** Industry/business type slug (e.g. "food-truck", "restaurant", "retail") */
  businessType?: string;
  /** True when the business was added as a pre-existing entity (not created from chat flow). */
  isPreExisting?: boolean;
  /** Form IDs the user indicated this business already holds permits for. */
  existingPermits?: string[];
  /**
   * Per-business chat history — the messages the user has exchanged with RegPulse
   * while this business was active. Restored when switching back to the business.
   * Only the serialisable subset (id, role, content) is stored — UI-only fields
   * like formClarify and formMap are omitted.
   */
  chatHistory?: SavedMessage[];
  /**
   * Per-business notification preferences for renewal reminders.
   * Controls whether email and/or SMS reminders are sent for this business.
   * NULL/undefined means "use defaults" (email on, SMS off).
   */
  notificationPrefs?: NotificationPrefs;
  /**
   * Optional array of locations for multi-location businesses.
   * When present and non-empty, the active location's checklist / completedForms /
   * chatHistory / healthScore fields are used instead of the top-level ones.
   * NULL/undefined = single-location mode (fully backward-compatible).
   */
  locations?: BusinessLocation[];
}

// ── RuleAlert ─────────────────────────────────────────────────────────────────
// One alert per business per calendar month. Stored in the `rule_alerts` table.
// The composite TEXT primary key `{businessId}-{formId}-{YYYY-MM}` makes
// generation idempotent — re-running the generator for the same month is a no-op.

export interface RuleAlert {
  /** Composite ID: `{businessId}-{formId}-{YYYY-MM}` */
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  /** Form IDs affected — drives the amber "Updated" badge in EnhancedChecklist */
  affectedForms: string[];
  /** ISO date string YYYY-MM-DD */
  date: string;
  dismissed: boolean;
}

// ── BusinessLocation ──────────────────────────────────────────────────────────
// One physical location within a multi-location business.
// Stored as an element of SavedBusiness.locations (JSONB array).
//
// Backward compat: existing businesses have locations = undefined.
// When locations is present and non-empty, the active location's fields
// (checklist, completedForms, chatHistory, …) are used instead of the top-level
// business fields.

export interface BusinessLocation {
  /** Stable unique ID — generated once on creation. */
  id: string;
  /** User-given label, e.g. "Downtown Route", "North County Markets". */
  name: string;
  /** Full address string, e.g. "Miami, FL 33101" */
  location: string;
  // Per-location compliance data (same shapes as the top-level SavedBusiness fields)
  checklist: ChecklistItem[];
  completedForms?: CompletedFormEntry[];
  chatHistory?: SavedMessage[];
  healthScore?: number;
  totalForms?: number;
  completedFormsCount?: number;
  /** ISO timestamp of last save/load — shown as "Checked N days ago" */
  lastChecked?: string;
  /** Per-location notification preferences (overrides business-level prefs) */
  notificationPrefs?: NotificationPrefs;
}

// ── DocumentAnalysis ──────────────────────────────────────────────────────────
// Structured output from the AI document analysis endpoint.
// Stored as JSONB in business_documents.analysis.

export interface DocumentAnalysis {
  /** Human-readable document type, e.g. "Business License", "Food Service Permit" */
  docType: string;
  /** Agency or jurisdiction that issued the document */
  issuingAuthority?: string;
  /** Permit or license number as printed on the document */
  permitNumber?: string;
  /** ISO date the document was issued (YYYY-MM-DD) */
  issueDate?: string;
  /** ISO date the document expires (YYYY-MM-DD); null = does not expire */
  expirationDate?: string | null;
  /** Business name as printed on the document */
  businessName?: string;
  /** Business address as printed on the document */
  businessAddress?: string;
  /** Active | Expired | Suspended | Pending | Unknown */
  status: "Active" | "Expired" | "Suspended" | "Pending" | "Unknown";
  /** What the permit authorizes (scope/category of activity) */
  scope?: string;
  /**
   * Form IDs from our templates that this document satisfies.
   * Subset of: business-license, business-registration, fictitious-name,
   * ein-application, mobile-food-vendor, food-service-permit,
   * sales-tax-registration, home-occupation-permit
   */
  matchedFormIds: string[];
  /** 2–3 sentence plain-English summary of what was found */
  summary: string;
  /** Suggested next actions for the user */
  suggestions: string[];
  /** Raw key-value pairs extracted from the document */
  rawExtracted: Record<string, string>;
}

// ── UploadedDocument ──────────────────────────────────────────────────────────
// Represents one file the user has uploaded for a business.
// Stored in the business_documents table + Supabase Storage bucket.

export interface UploadedDocument {
  id: string;
  businessId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  /** Supabase Storage path (within the 'business-documents' bucket) */
  storagePath: string;
  /** Signed or public URL for display/download */
  storageUrl?: string;
  analysis?: DocumentAnalysis;
  analyzed: boolean;
  uploadedAt: string;
}

// ── NotificationPrefs ─────────────────────────────────────────────────────────
// Per-business notification preferences. Stored as JSONB in businesses.notification_prefs.
// NULL in the DB means "use defaults" (email on, SMS off).

export interface NotificationPrefs {
  /** Send email reminders at 60/30/7/1 days before renewal. Default: true. */
  emailEnabled: boolean;
  /** Send SMS reminders at 60/30/7/1 days before renewal. Default: false. */
  smsEnabled: boolean;
  /**
   * E.164 phone number for SMS, e.g. "+14155552671".
   * Falls back to profiles.phone if absent. Only required when smsEnabled = true.
   */
  phone?: string;
}

// ── MonthlyUsage ──────────────────────────────────────────────────────────────
// Free-tier monthly AI form completion counter.
// Stored in profiles.usage_month + profiles.usage_count (Supabase) or
// localStorage key "regbot_pro_usage_v1" (guest mode).

export interface MonthlyUsage {
  /** "YYYY-MM" — counter resets when this changes. */
  month: string;
  count: number;
}
