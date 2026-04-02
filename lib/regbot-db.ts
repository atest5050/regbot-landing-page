// RegBot persistence layer.
//
// Every exported function accepts an optional `db` (Supabase browser client)
// and an optional `userId`. When both are present, data is read from / written
// to Supabase. When either is absent (guest / unauthenticated mode), the
// function falls back to the localStorage keys used by the original MVP.
//
// This "write-through" pattern means:
//   - Guests get the full feature set via localStorage.
//   - On sign-in, guest data is migrated to Supabase once.
//   - All subsequent writes go to Supabase; localStorage is kept in sync as an
//     offline cache so the UI stays fast on slow connections.
//
// The Supabase client is always the browser client from lib/supabase/client.ts.
// Server-side operations (Edge Functions) use lib/supabase/server.ts instead.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedBusiness, RuleAlert, MonthlyUsage } from "@/lib/regbot-types";

// ── localStorage keys (unchanged from MVP) ────────────────────────────────────

const BUSINESSES_KEY  = "regbot_businesses_v1";
const ALERTS_KEY      = "regbot_rule_alerts_v1";
const PRO_USAGE_KEY   = "regbot_pro_usage_v1";

// ── Month key helper ──────────────────────────────────────────────────────────

export function getCurrentMonthKey(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

// ── localStorage helpers (used as fallback + offline cache) ───────────────────

export function localLoadBusinesses(): SavedBusiness[] {
  try {
    const raw = localStorage.getItem(BUSINESSES_KEY);
    return raw ? (JSON.parse(raw) as SavedBusiness[]) : [];
  } catch { return []; }
}

export function localSaveBusiness(biz: SavedBusiness): void {
  try {
    const existing = localLoadBusinesses().filter(b => b.id !== biz.id);
    localStorage.setItem(BUSINESSES_KEY, JSON.stringify([biz, ...existing]));
  } catch {}
}

export function localLoadAlerts(): RuleAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? (JSON.parse(raw) as RuleAlert[]) : [];
  } catch { return []; }
}

export function localSaveAlerts(alerts: RuleAlert[]): void {
  try { localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts)); } catch {}
}

export function localLoadMonthlyUsage(): number {
  try {
    const raw = localStorage.getItem(PRO_USAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as MonthlyUsage;
    return data.month === getCurrentMonthKey() ? data.count : 0;
  } catch { return 0; }
}

export function localSaveMonthlyUsage(count: number): void {
  try {
    localStorage.setItem(PRO_USAGE_KEY, JSON.stringify({
      month: getCurrentMonthKey(),
      count,
    }));
  } catch {}
}

// ── DB ↔ domain type mappers ──────────────────────────────────────────────────

// Supabase row shapes (snake_case). Keeping these local avoids depending on a
// generated `Database` type until the project has `supabase gen types` set up.

interface BusinessRow {
  id: string;
  user_id: string;
  name: string;
  location: string;
  checklist: SavedBusiness["checklist"];
  completed_forms: NonNullable<SavedBusiness["completedForms"]>;
  health_score: number | null;
  total_forms: number | null;
  completed_forms_count: number | null;
  saved_at: string;
  last_checked: string | null;
  created_at: string;
  updated_at: string;
}

interface AlertRow {
  id: string;
  user_id: string;
  business_id: string | null;
  business_name: string;
  title: string;
  description: string;
  affected_forms: string[];
  date: string;
  dismissed: boolean;
}

interface ProfileRow {
  id: string;
  is_pro: boolean;
  usage_month: string | null;
  usage_count: number;
}

function rowToBusiness(row: BusinessRow): SavedBusiness {
  return {
    id:                  row.id,
    name:                row.name,
    location:            row.location,
    savedAt:             row.saved_at,
    checklist:           row.checklist ?? [],
    completedForms:      row.completed_forms?.length ? row.completed_forms : undefined,
    healthScore:         row.health_score ?? undefined,
    totalForms:          row.total_forms ?? undefined,
    completedFormsCount: row.completed_forms_count ?? undefined,
    lastChecked:         row.last_checked ?? undefined,
  };
}

function businessToRow(
  biz: SavedBusiness,
  userId: string,
): Omit<BusinessRow, "created_at"> {
  return {
    id:                    biz.id,
    user_id:               userId,
    name:                  biz.name,
    location:              biz.location,
    checklist:             biz.checklist,
    completed_forms:       biz.completedForms ?? [],
    health_score:          biz.healthScore ?? null,
    total_forms:           biz.totalForms ?? null,
    completed_forms_count: biz.completedFormsCount ?? null,
    saved_at:              biz.savedAt,
    last_checked:          biz.lastChecked ?? null,
    updated_at:            new Date().toISOString(),
  };
}

function rowToAlert(row: AlertRow): RuleAlert {
  return {
    id:            row.id,
    businessId:    row.business_id ?? "",
    businessName:  row.business_name,
    title:         row.title,
    description:   row.description,
    affectedForms: row.affected_forms ?? [],
    date:          row.date,
    dismissed:     row.dismissed,
  };
}

function alertToRow(alert: RuleAlert, userId: string): Omit<AlertRow, never> {
  return {
    id:             alert.id,
    user_id:        userId,
    business_id:    alert.businessId || null,
    business_name:  alert.businessName,
    title:          alert.title,
    description:    alert.description,
    affected_forms: alert.affectedForms,
    date:           alert.date,
    dismissed:      alert.dismissed,
  };
}

// ── Businesses ────────────────────────────────────────────────────────────────

/**
 * Load all saved businesses for a user.
 * Supabase when authenticated, localStorage when guest.
 */
export async function dbLoadBusinesses(
  db: SupabaseClient | null,
  userId: string | null,
): Promise<SavedBusiness[]> {
  if (db && userId) {
    const { data, error } = await db
      .from("businesses")
      .select("*")
      .eq("user_id", userId)
      .order("saved_at", { ascending: false });
    if (error) {
      console.error("[regbot-db] loadBusinesses:", error.message);
      return localLoadBusinesses(); // graceful degradation
    }
    const businesses = (data as BusinessRow[]).map(rowToBusiness);
    // Keep localStorage in sync as offline cache
    try {
      localStorage.setItem(BUSINESSES_KEY, JSON.stringify(businesses));
    } catch {}
    return businesses;
  }
  return localLoadBusinesses();
}

/**
 * Upsert a single business (create or update by ID).
 * Writes to both Supabase and localStorage.
 */
export async function dbSaveBusiness(
  db: SupabaseClient | null,
  userId: string | null,
  biz: SavedBusiness,
): Promise<void> {
  // Always write to localStorage (offline cache / guest fallback)
  localSaveBusiness(biz);

  if (db && userId) {
    const row = businessToRow(biz, userId);
    const { error } = await db
      .from("businesses")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error("[regbot-db] saveBusiness:", error.message);
      // localStorage write above is the fallback; no throw needed
    }
  }
}

// ── Alerts ────────────────────────────────────────────────────────────────────

/**
 * Load all rule alerts for a user.
 * Supabase when authenticated, localStorage when guest.
 */
export async function dbLoadAlerts(
  db: SupabaseClient | null,
  userId: string | null,
): Promise<RuleAlert[]> {
  if (db && userId) {
    const { data, error } = await db
      .from("rule_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error) {
      console.error("[regbot-db] loadAlerts:", error.message);
      return localLoadAlerts();
    }
    const alerts = (data as AlertRow[]).map(rowToAlert);
    try { localSaveAlerts(alerts); } catch {}
    return alerts;
  }
  return localLoadAlerts();
}

/**
 * Persist the full alerts array.
 * Uses upsert so new alerts are inserted and dismissed flags are updated.
 */
export async function dbSaveAlerts(
  db: SupabaseClient | null,
  userId: string | null,
  alerts: RuleAlert[],
): Promise<void> {
  localSaveAlerts(alerts);

  if (db && userId && alerts.length > 0) {
    const rows = alerts.map(a => alertToRow(a, userId));
    const { error } = await db
      .from("rule_alerts")
      .upsert(rows, { onConflict: "id" });
    if (error) {
      console.error("[regbot-db] saveAlerts:", error.message);
    }
  }
}

// ── Monthly usage (Pro gate) ──────────────────────────────────────────────────

/**
 * Load the current month's AI form completion count.
 * Uses profiles.usage_month + profiles.usage_count for authenticated users,
 * localStorage for guests.
 */
export async function dbLoadMonthlyUsage(
  db: SupabaseClient | null,
  userId: string | null,
): Promise<number> {
  if (db && userId) {
    const { data, error } = await db
      .from("profiles")
      .select("usage_month, usage_count")
      .eq("id", userId)
      .single();
    if (error || !data) {
      return localLoadMonthlyUsage();
    }
    const row = data as Pick<ProfileRow, "usage_month" | "usage_count">;
    return row.usage_month === getCurrentMonthKey() ? row.usage_count : 0;
  }
  return localLoadMonthlyUsage();
}

/**
 * Persist the monthly usage count for the current calendar month.
 */
export async function dbSaveMonthlyUsage(
  db: SupabaseClient | null,
  userId: string | null,
  count: number,
): Promise<void> {
  localSaveMonthlyUsage(count);

  if (db && userId) {
    const { error } = await db
      .from("profiles")
      .update({ usage_month: getCurrentMonthKey(), usage_count: count })
      .eq("id", userId);
    if (error) {
      console.error("[regbot-db] saveMonthlyUsage:", error.message);
    }
  }
}

/**
 * Load the Pro subscription status for the current user.
 * Returns true by default (MVP: everyone is Pro) until billing is wired.
 */
export async function dbLoadIsPro(
  db: SupabaseClient | null,
  userId: string | null,
): Promise<boolean> {
  if (db && userId) {
    const { data, error } = await db
      .from("profiles")
      .select("is_pro")
      .eq("id", userId)
      .single();
    if (error || !data) return true; // fail-open during MVP
    return (data as Pick<ProfileRow, "is_pro">).is_pro;
  }
  return true; // guests get full access for MVP
}

// ── Guest → Supabase migration ────────────────────────────────────────────────

/**
 * Called once on first sign-in (SIGNED_IN auth event).
 * Moves any businesses and alerts currently in localStorage into Supabase,
 * avoiding duplicates by upserting on ID.
 */
export async function syncGuestDataToSupabase(
  db: SupabaseClient,
  userId: string,
): Promise<void> {
  const businesses = localLoadBusinesses();
  const alerts     = localLoadAlerts();

  if (businesses.length > 0) {
    const rows = businesses.map(b => businessToRow(b, userId));
    const { error } = await db
      .from("businesses")
      .upsert(rows, { onConflict: "id" });
    if (error) {
      console.error("[regbot-db] syncBusinesses:", error.message);
    }
  }

  if (alerts.length > 0) {
    const rows = alerts.map(a => alertToRow(a, userId));
    const { error } = await db
      .from("rule_alerts")
      .upsert(rows, { onConflict: "id" });
    if (error) {
      console.error("[regbot-db] syncAlerts:", error.message);
    }
  }

  // Also sync monthly usage
  const count = localLoadMonthlyUsage();
  if (count > 0) {
    await dbSaveMonthlyUsage(db, userId, count);
  }
}
