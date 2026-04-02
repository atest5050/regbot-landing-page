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

// ── MonthlyUsage ──────────────────────────────────────────────────────────────
// Free-tier monthly AI form completion counter.
// Stored in profiles.usage_month + profiles.usage_count (Supabase) or
// localStorage key "regbot_pro_usage_v1" (guest mode).

export interface MonthlyUsage {
  /** "YYYY-MM" — counter resets when this changes. */
  month: string;
  count: number;
}
