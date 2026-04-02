// ── Shared checklist types + DB row mapping ───────────────────────────────────
// Used by: EnhancedChecklist.tsx, app/chat/page.tsx, app/api/checklist/route.ts

export type ChecklistStatus = "todo" | "in-progress" | "done" | "blocked";

/** The UI-facing shape used everywhere in the frontend. */
export interface ChecklistItem {
  id: string;
  text: string;
  fee?: string;
  status: ChecklistStatus;
  dueDate?: string;       // YYYY-MM-DD (local calendar date)
  notes?: string;
  completedVia?: string;  // e.g. "RegBot AI Form Filler"
  formId?: string;        // if set → "Complete Form" button is shown
  createdAt: string;      // ISO timestamp
  /** Suggested renewal/expiration date (YYYY-MM-DD). Set when formId is known and the
   *  form has a defaultRenewalMonths value. Drives the Upcoming Renewals sidebar section
   *  and the countdown badge in EnhancedChecklist. */
  renewalDate?: string;
}

/** The raw Supabase DB row shape (snake_case). */
export interface DbChecklistItem {
  id: string;
  user_id: string;
  text: string;
  fee: string | null;
  status: string;
  due_date: string | null;
  notes: string | null;
  completed_via: string | null;
  completed_at: string | null;
  form_id: string | null;
  created_at: string;
}

/** Converts a Supabase DB row → UI ChecklistItem. */
export function fromDb(row: DbChecklistItem): ChecklistItem {
  return {
    id: row.id,
    text: row.text,
    fee: row.fee ?? undefined,
    status: (row.status as ChecklistStatus) ?? "todo",
    // due_date is stored as timestamptz; we only need the YYYY-MM-DD part for the date picker
    dueDate: row.due_date ? row.due_date.slice(0, 10) : undefined,
    notes: row.notes ?? undefined,
    completedVia: row.completed_via ?? undefined,
    formId: row.form_id ?? undefined,
    createdAt: row.created_at,
  };
}

/** Converts a UI ChecklistItem → Supabase insert/update payload (omits id/user_id/created_at). */
export function toDb(item: Partial<ChecklistItem>): Partial<DbChecklistItem> {
  const out: Partial<DbChecklistItem> = {};
  if (item.text       !== undefined) out.text          = item.text;
  if (item.fee        !== undefined) out.fee           = item.fee ?? null;
  if (item.status     !== undefined) out.status        = item.status;
  if (item.dueDate    !== undefined) out.due_date      = item.dueDate ? `${item.dueDate}T00:00:00Z` : null;
  if (item.notes      !== undefined) out.notes         = item.notes ?? null;
  if (item.completedVia !== undefined) out.completed_via = item.completedVia ?? null;
  if (item.formId  !== undefined) out.form_id      = item.formId ?? null;
  if (item.status  !== undefined) out.completed_at = item.status === 'done' ? new Date().toISOString() : null;
  return out;
}
