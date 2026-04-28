"use client";
// vUnified-20260414-national-expansion-v26 — Notification scheduling delegated to lib/notifications.ts.
//        requestNotifPermission / scheduleUpcomingRenewalNotifications replace inline Notification code.
//        onScheduleAll prop removed (no longer needed — handled by notifications.ts utility).
// vUnified-20260414-national-expansion-v25 — Compliance Calendar + "What to Fix This Month"
// Compact sidebar component surfacing upcoming renewals from allRenewals
// (ChecklistItem.renewalDate + LOCAL_FORMS.renewalMonths) grouped by urgency:
//   Overdue · This Month (0-30d) · Next Month (31-60d)
// Features:
//   • One-tap "Renew Now" links → officialUrl for each renewal item
//   • Web Notifications API scheduling (browser-native, no extra package required)
//   • "Enable Reminders" CTA → NotificationPrefsModal or browser Notification.requestPermission()
//   • "Prefs" link defers to onOpenNotificationPrefs prop (wired to NotificationPrefsModal in page.tsx)
// Platform: touch targets ≥32px (sidebar compact mode); pointer-events-auto on all interactive elements.
// Dark mode: slate/blue/amber/red tints with dark: variants throughout.
// Capacitor note: @capacitor/local-notifications is NOT installed (not in package.json as of v25).
//   Browser Notification API is used instead; it works in PWA mode and Capacitor WKWebView/WebView
//   (iOS 16.4+/Android Chrome 120+). On older WebViews the API is present but permission may be denied
//   silently — this is handled gracefully by showing the "denied" state without crashing.
// EXIT:0 confirmed.

import { useMemo, useState, useEffect } from "react";
import {
  Bell, Calendar, CheckCircle2, ExternalLink, AlertCircle, Clock,
} from "lucide-react";
import type { ChecklistItem } from "@/lib/checklist";
import type { SavedBusiness } from "@/lib/regbot-types";
import {
  getNotifPermission,
  requestNotifPermission,
  scheduleUpcomingRenewalNotifications,
} from "@/lib/notifications"; // v26 — centralized notification utility

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RenewalRow {
  biz: SavedBusiness;
  item: ChecklistItem;
  daysLeft: number;
  formName: string;
}

interface Props {
  /** Aggregated renewals — same shape as allRenewals in page.tsx */
  renewals: RenewalRow[];
  /** formId → officialUrl — computed once in page.tsx from LOCAL_FORMS + ALL_FORMS */
  formUrlMap: Record<string, string>;
  /** ID of the currently loaded/active business — highlights matching rows */
  loadedBusinessId?: string;
  /** Called when the user clicks the "Prefs" link — opens NotificationPrefsModal */
  onOpenNotificationPrefs?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysBadge(daysLeft: number): { label: string; cls: string } {
  if (daysLeft < 0)  return { label: `${Math.abs(daysLeft)}d overdue`, cls: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40" };
  if (daysLeft === 0) return { label: "Today",    cls: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40" };
  if (daysLeft === 1) return { label: "Tomorrow", cls: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40" };
  if (daysLeft <= 7)  return { label: `${daysLeft}d`,                  cls: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40" };
  if (daysLeft <= 14) return { label: `${daysLeft}d`,                  cls: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/40" };
  if (daysLeft <= 30) return { label: `${Math.ceil(daysLeft / 7)}w`,   cls: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/40" };
  return              { label: `${Math.ceil(daysLeft / 7)}w`,          cls: "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800/30 dark:border-slate-700/50" };
}

// ── ComplianceCalendar ────────────────────────────────────────────────────────

export default function ComplianceCalendar({
  renewals,
  formUrlMap,
  loadedBusinessId,
  onOpenNotificationPrefs,
}: Props) {
  // ── Notification permission state (delegated to lib/notifications.ts) ──
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    setNotifPermission(getNotifPermission());
  }, []);

  // ── Group renewals by urgency ────────────────────────────────────────────
  const grouped = useMemo(() => {
    const overdue: RenewalRow[] = [];
    const thisMonth: RenewalRow[] = [];
    const nextMonth: RenewalRow[] = [];
    for (const r of renewals) {
      if (r.daysLeft < 0)       overdue.push(r);
      else if (r.daysLeft <= 30) thisMonth.push(r);
      else if (r.daysLeft <= 60) nextMonth.push(r);
    }
    return { overdue, thisMonth, nextMonth };
  }, [renewals]);

  const totalUrgent = grouped.overdue.length + grouped.thisMonth.length;

  // ── Hide when nothing due within 60 days ────────────────────────────────
  if (renewals.length === 0 || (grouped.overdue.length + grouped.thisMonth.length + grouped.nextMonth.length) === 0) {
    return null;
  }

  // ── Web Notifications: request permission + schedule (v26 → lib/notifications.ts) ──
  const handleEnableReminders = async () => {
    const perm = await requestNotifPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      // Schedule upcoming renewal notifications (7-day window) via centralized utility.
      // Session-scoped setTimeout — intentional; stale timers cleared on page refresh.
      scheduleUpcomingRenewalNotifications(
        renewals.map(r => ({ formName: r.formName, bizName: r.biz.name, daysLeft: r.daysLeft })),
        7,
      );
    }
  };

  // ── Row renderer ────────────────────────────────────────────────────────
  const renderRow = (r: RenewalRow) => {
    const url      = r.item.formId ? formUrlMap[r.item.formId] : undefined;
    const isActive = r.biz.id === loadedBusinessId;
    const badge    = daysBadge(r.daysLeft);

    return (
      <div
        key={r.item.id}
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
          isActive
            ? "bg-blue-50/60 dark:bg-blue-900/15"
            : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
        }`}
      >
        {/* Form name + biz name */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">
            {r.formName}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{r.biz.name}</p>
        </div>

        {/* Days badge + Renew link */}
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] font-bold border rounded-full px-1.5 py-0.5 tabular-nums ${badge.cls}`}>
            {badge.label}
          </span>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center text-blue-500 hover:text-blue-700 transition-colors min-h-[32px] min-w-[28px] pointer-events-auto"
              title="Renew Now"
              aria-label={`Renew ${r.formName} online`}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="shrink-0 border-t border-slate-100 dark:border-slate-700/30 px-4 py-3 space-y-2">
      {/* ── Section header ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3 w-3 text-blue-500 shrink-0" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Compliance Calendar
        </p>
        {totalUrgent > 0 && (
          <span className="ml-auto text-[10px] font-bold border rounded-full px-1.5 py-0.5 tabular-nums text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40">
            {totalUrgent} urgent
          </span>
        )}
      </div>

      {/* ── Overdue group ─────────────────────────────────────────────────── */}
      {grouped.overdue.length > 0 && (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400 px-2">
            <AlertCircle className="h-2.5 w-2.5 shrink-0" />
            Overdue
          </p>
          {grouped.overdue.map(renderRow)}
        </div>
      )}

      {/* ── This Month group ──────────────────────────────────────────────── */}
      {grouped.thisMonth.length > 0 && (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 px-2">
            <Clock className="h-2.5 w-2.5 shrink-0" />
            This Month
          </p>
          {grouped.thisMonth.map(renderRow)}
        </div>
      )}

      {/* ── Next Month group (capped at 3 + overflow label) ─────────────── */}
      {grouped.nextMonth.length > 0 && (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2">
            <Calendar className="h-2.5 w-2.5 shrink-0" />
            Next Month
          </p>
          {grouped.nextMonth.slice(0, 3).map(renderRow)}
          {grouped.nextMonth.length > 3 && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 px-2">
              +{grouped.nextMonth.length - 3} more upcoming
            </p>
          )}
        </div>
      )}

      {/* ── Notification CTA row ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-0.5">
        {notifPermission === "default" && (
          <button
            onClick={handleEnableReminders}
            className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg px-2 py-1 transition-colors min-h-[32px] pointer-events-auto"
          >
            <Bell className="h-2.5 w-2.5 shrink-0" />
            Enable reminders
          </button>
        )}
        {notifPermission === "granted" && (
          <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
            Reminders on
          </span>
        )}
        {onOpenNotificationPrefs && (
          <button
            onClick={onOpenNotificationPrefs}
            className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:underline pointer-events-auto min-h-[28px]"
          >
            Prefs
          </button>
        )}
      </div>
    </div>
  );
}
