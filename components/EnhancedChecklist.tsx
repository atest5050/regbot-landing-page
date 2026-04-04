// Changes summary:
// - Accordion expansion: rotating chevron, full quick-action row at top of expanded panel
// - Quick actions: "Mark as Done/To Do", "Complete Form with AI", "Remove" as pill buttons
// - Added onViewCompletedForm prop: shows "View Completed Form" button on AI-filled items
//   (appears in collapsed row and in expanded detail panel)
// - Added onRenewForm prop + renewal countdown badge (green/amber/red) in collapsed row
//   and "Renew Now" button in both collapsed and expanded panels.
// - Compliance Health indicator in the progress bar header: a small coloured dot (green
//   ≥80%, amber 50–79%, red <50%) next to the percentage, giving an instant at-a-glance
//   signal inside the checklist panel that reinforces the sidebar health score card.
// - Rule Change Alerts integration: new alertedFormIds prop (Set<string>) marks items whose
//   formId has an active rule-change alert with an amber "Updated" badge in the collapsed row
//   and a "Review" pill in the expanded quick-actions row.
// - onViewRuleAlert prop: called when user clicks "Review" on an alerted item; parent can
//   scroll to the "Recent Rule Changes" sidebar section. Falls back gracefully when absent.
// - AlertTriangle icon added for the "Updated" badge.
// - loadedBusiness prop: when a saved business is loaded, renders a header banner above the
//   Summary card showing the business name, location, a small SVG health ring, and form count.
// - Pro tier gating: isPro, monthlyFormsUsed, freeMonthlyLimit, onUpgradeClick props.
//   "Complete Form with AI" and "Complete All" show a locked state with upgrade CTA when
//   the Free monthly limit is reached. Pro users see no lock and no usage counter.
// - "Included with RegBot Pro" badge on renewal countdown badges and rule change alert badges,
//   reinforcing ongoing Pro value on every item that uses those features.
// - Crown and Lock icons added to lucide imports.

"use client";

import { useState, useMemo, Fragment } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  Trash2,
  Download,
  Calendar,
  StickyNote,
  FileText,
  CheckCheck,
  RotateCcw,
  X,
  DollarSign,
  Layers,
  Eye,
  RefreshCw,
  AlertTriangle,
  Lock,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChecklistItem, ChecklistStatus } from "@/lib/checklist";

export type { ChecklistItem, ChecklistStatus };

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  items: ChecklistItem[];
  onUpdate: (id: string, changes: Partial<ChecklistItem>) => void;
  onDelete: (id: string) => void;
  /**
   * Called when the user clicks "Complete Form with AI" on an item.
   * The parent should look up the form template by item.formId and open FormFiller.
   */
  onStartForm?: (item: ChecklistItem) => void;
  /**
   * Called when the user clicks "View Completed Form" on an AI-filled item.
   * The parent should look up the completed form data by formId and open PacketScreen.
   */
  onViewCompletedForm?: (formId: string) => void;
  /** Deletes every item — parent handles actual persistence. */
  onResetAll?: () => void;
  /** Marks every non-done item as done. */
  onMarkAllDone?: () => void;
  /** Deletes all items with status === "done". */
  onClearCompleted?: () => void;
  /**
   * Called when the user confirms "Clear All Business Data".
   * Clears checklist, completed forms, chat history, and renewal dates for the active business.
   * Parent handles the actual DB write and state reset.
   */
  onClearAll?: () => void;
  /**
   * Called when user clicks "Complete All Forms" in the dashboard header.
   * Receives the array of formIds from incomplete checklist items that have one.
   * Parent resolves them to templates and starts the multi-form queue.
   */
  onCompleteAllForms?: (formIds: string[]) => void;
  /**
   * Called when user clicks "Renew Now" on an item with a renewalDate.
   * Same signature as onStartForm — parent opens FormFiller for the formId.
   */
  onRenewForm?: (item: ChecklistItem) => void;
  /**
   * Set of form IDs that have an active rule-change alert. Items whose
   * formId appears in this set get an amber "Updated" badge and a "Review" button.
   */
  alertedFormIds?: Set<string>;
  /**
   * Called when user clicks "Review" on an alerted item.
   * Parent can scroll to the "Recent Rule Changes" sidebar section.
   */
  onViewRuleAlert?: (formId: string) => void;
  /**
   * When a saved business is loaded into the session, pass its profile here to show
   * a header banner above the Summary card with the business name, location, health
   * score ring, and form completion count.
   */
  loadedBusiness?: {
    name: string;
    location: string;
    healthScore?: number;
    totalForms?: number;
    completedFormsCount?: number;
  };
  /**
   * Whether the current user has an active Pro subscription.
   * When false and monthlyFormsUsed >= freeMonthlyLimit, form completion buttons
   * display a locked state with an upgrade CTA. Defaults to true.
   */
  isPro?: boolean;
  /** How many AI form completions have been used in the current calendar month. */
  monthlyFormsUsed?: number;
  /** The Free-tier monthly cap. Defaults to 3 if not provided. */
  freeMonthlyLimit?: number;
  /**
   * Called when the user clicks the upgrade CTA in a locked form button.
   * Parent can scroll to the upgrade banner or open a purchase flow.
   */
  onUpgradeClick?: () => void;
  /**
   * When provided, renders a "Upload Document" button below the bulk actions.
   * The parent opens the DocumentUploadButton / full upload flow when called.
   */
  onUploadDocument?: () => void;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ChecklistStatus,
  { label: string; Icon: React.FC<{ className?: string }>; textColor: string; dotColor: string; ringColor: string }
> = {
  todo:          { label: "To Do",       Icon: Circle,       textColor: "text-slate-400", dotColor: "bg-slate-300", ringColor: "ring-slate-200"  },
  "in-progress": { label: "In Progress", Icon: Clock,        textColor: "text-blue-500",  dotColor: "bg-blue-500",  ringColor: "ring-blue-200"   },
  done:          { label: "Done",        Icon: CheckCircle2, textColor: "text-green-500", dotColor: "bg-green-500", ringColor: "ring-green-200"  },
  blocked:       { label: "Blocked",     Icon: AlertCircle,  textColor: "text-red-400",   dotColor: "bg-red-400",   ringColor: "ring-red-200"    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMinFee(fee?: string): number {
  if (!fee) return 0;
  if (/free/i.test(fee)) return 0;
  const match = fee.match(/\$([0-9,]+(?:\.[0-9]{1,2})?)/);
  return match ? parseFloat(match[1].replace(",", "")) : 0;
}

function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0)   return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff <= 7)  return `Due in ${diff}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Returns days until renewalDate (negative = overdue). */
function renewalDaysLeft(renewalDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(renewalDate + "T00:00:00");
  return Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
}

/** Returns Tailwind color classes for a renewal badge based on days remaining. */
function renewalBadgeColor(days: number): string {
  if (days < 0)   return "text-red-700 bg-red-50 border-red-200";
  if (days <= 30) return "text-red-700 bg-red-50 border-red-200";
  if (days <= 60) return "text-amber-700 bg-amber-50 border-amber-200";
  if (days <= 90) return "text-green-700 bg-green-50 border-green-200";
  return "text-slate-600 bg-slate-50 border-slate-200";
}

/** Returns Tailwind color classes for a Renew Now button based on days remaining. */
function renewButtonColor(days: number): string {
  if (days <= 30) return "text-red-700 bg-red-50 hover:bg-red-100 border-red-200";
  if (days <= 60) return "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200";
  if (days <= 90) return "text-green-700 bg-green-50 hover:bg-green-100 border-green-200";
  return "text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200";
}

/** Human-readable renewal countdown label. */
function renewalLabel(days: number): string {
  if (days < 0)   return `Renewal ${Math.abs(days)}d overdue`;
  if (days === 0) return "Renewal due today";
  if (days === 1) return "Renewal due tomorrow";
  if (days <= 90) return `Renews in ${days}d`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `Renews in ${weeks}w`;
  return `Renews in ${Math.round(days / 30)}mo`;
}

/** Returns Tailwind classes for the progress bar fill based on completion %. */
function progressBarColor(pct: number): string {
  if (pct === 0)   return "bg-slate-200";
  if (pct >= 70)   return "bg-green-500";
  if (pct >= 30)   return "bg-amber-400";
  return "bg-red-400";
}

/** Returns Tailwind text-color class for the % label. */
function progressTextColor(pct: number): string {
  if (pct === 0)   return "text-slate-400";
  if (pct >= 70)   return "text-green-600";
  if (pct >= 30)   return "text-amber-500";
  return "text-red-500";
}

// ── Inline link renderer ──────────────────────────────────────────────────────
// Parses [text](url) markdown in checklist item text and renders real <a> tags.

const ITEM_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

function renderItemText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  ITEM_LINK_RE.lastIndex = 0;
  while ((m = ITEM_LINK_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a
        key={m.index}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
      >
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (parts.length === 0) return text;
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

/** Strip markdown links to plain text (used for PDF export). */
function stripLinksToText(text: string): string {
  return text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1");
}

// ── Inline confirmation widget ────────────────────────────────────────────────
// A small "Are you sure? Yes / Cancel" UI rendered in-place so we avoid
// importing a Dialog component for three simple destructive actions.

interface ConfirmBarProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmBar({ message, onConfirm, onCancel }: ConfirmBarProps) {
  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs">
      <span className="text-red-700 font-medium">{message}</span>
      <div className="flex gap-1.5 ml-3 shrink-0">
        <button
          onClick={onConfirm}
          className="px-2 py-0.5 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EnhancedChecklist({
  items,
  onUpdate,
  onDelete,
  onStartForm,
  onViewCompletedForm,
  onResetAll,
  onMarkAllDone,
  onClearCompleted,
  onClearAll,
  onCompleteAllForms,
  onRenewForm,
  alertedFormIds,
  onViewRuleAlert,
  loadedBusiness,
  isPro = true,
  monthlyFormsUsed = 0,
  freeMonthlyLimit = 3,
  onUpgradeClick,
  onUploadDocument,
}: Props) {
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [sortBy, setSortBy]           = useState<"default" | "due-date" | "status">("default");
  // Which confirmation bar is open: "reset" | "clear-done" | "clear-all" | null
  const [confirmAction, setConfirmAction] = useState<"reset" | "clear-done" | "clear-all" | null>(null);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const doneCount = useMemo(() => items.filter(i => i.status === "done").length, [items]);
  const doneItems = useMemo(() => items.filter(i => i.status === "done"), [items]);
  const progress  = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  const { totalFees, hasFeeRanges } = useMemo(() => {
    const pending = items.filter(i => i.status !== "done");
    const total   = pending.reduce((sum, i) => sum + parseMinFee(i.fee), 0);
    const hasRanges = pending.some(
      i => i.fee && (i.fee.includes("–") || i.fee.includes("-") || /varies/i.test(i.fee))
    );
    return { totalFees: total, hasFeeRanges: hasRanges };
  }, [items]);

  // ── Sorted list ────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (sortBy === "due-date") {
      return [...items].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    }
    if (sortBy === "status") {
      const order: ChecklistStatus[] = ["blocked", "in-progress", "todo", "done"];
      return [...items].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
    }
    return items;
  }, [items, sortBy]);

  // ── Pro tier gate ──────────────────────────────────────────────────────────
  /** True when a Free user has consumed all monthly AI form completions. */
  const isFormLimited = !isPro && monthlyFormsUsed >= freeMonthlyLimit;

  // ── Dashboard action handlers ──────────────────────────────────────────────

  const handleMarkAllDone = () => {
    items.forEach(i => {
      if (i.status !== "done") onUpdate(i.id, { status: "done" });
    });
    onMarkAllDone?.();
  };

  const handleClearCompleted = () => {
    doneItems.forEach(i => onDelete(i.id));
    onClearCompleted?.();
    setConfirmAction(null);
  };

  const handleResetAll = () => {
    items.forEach(i => onDelete(i.id));
    onResetAll?.();
    setConfirmAction(null);
    setExpandedId(null);
  };

  const handleClearAll = () => {
    onClearAll?.();
    setConfirmAction(null);
    setExpandedId(null);
  };

  // ── PDF export ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("RegPulse — Compliance Checklist", 14, 17);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Exported ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      14, 25
    );

    // Summary
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    let y = 42;
    doc.text(`Progress: ${doneCount} of ${items.length} items complete (${progress}%)`, 14, y);
    y += 6;
    if (totalFees > 0) {
      doc.text(`Estimated remaining fees: $${totalFees.toFixed(0)}${hasFeeRanges ? "+" : ""}`, 14, y);
      y += 6;
    }
    y += 4;

    const statusLabel: Record<ChecklistStatus, string> = {
      todo: "[ ] To Do", "in-progress": "[>] In Progress", done: "[x] Done", blocked: "[!] Blocked",
    };

    for (const item of items) {
      if (y > 268) { doc.addPage(); y = 20; }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(statusLabel[item.status], 14, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const textLines = doc.splitTextToSize(stripLinksToText(item.text), 148);
      doc.text(textLines, 46, y);

      if (item.fee) {
        doc.setTextColor(37, 99, 235);
        doc.text(item.fee, 196, y, { align: "right" });
        doc.setTextColor(30, 41, 59);
      }
      y += textLines.length * 5 + 2;

      if (item.dueDate) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Due: ${new Date(item.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
          46, y
        );
        doc.setTextColor(30, 41, 59);
        y += 5;
      }

      if (item.notes) {
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const noteLines = doc.splitTextToSize(`Note: ${item.notes}`, 148);
        doc.text(noteLines, 46, y);
        doc.setTextColor(30, 41, 59);
        y += noteLines.length * 4 + 2;
      }

      if (item.completedVia) {
        doc.setFontSize(8);
        doc.setTextColor(22, 163, 74);
        doc.text(`>> ${item.completedVia}`, 46, y);
        doc.setTextColor(30, 41, 59);
        y += 5;
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, 196, y);
      y += 6;
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("RegPulse — Not legal advice. Verify requirements with official government sources.", 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: "right" });
    }

    doc.save("regpulse-checklist.pdf");
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex-1 bg-slate-50 border rounded-xl flex items-center justify-center p-6">
        <p className="text-xs text-slate-400 italic text-center leading-relaxed">
          Compliance items from the chat<br />will appear here
        </p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">

      {/* ── Loaded Business header banner ─────────────────────────────────── */}
      {loadedBusiness && (() => {
        const bScore = loadedBusiness.healthScore ?? 0;
        const ringColor = bScore >= 80 ? "#22c55e" : bScore >= 50 ? "#f59e0b" : "#ef4444";
        const circumference = 2 * Math.PI * 14; // r=14
        const offset = circumference - (bScore / 100) * circumference;
        const tf = loadedBusiness.totalForms ?? 0;
        const cf = loadedBusiness.completedFormsCount ?? 0;
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 shrink-0 flex items-center gap-3">
            {/* Mini SVG ring */}
            <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke={ringColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${offset}`}
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {loadedBusiness.name}
              </p>
              <p className="text-xs text-slate-500 truncate leading-tight">
                {loadedBusiness.location}
                {tf > 0 && <> &middot; {cf}/{tf} forms</>}
              </p>
            </div>
            <span
              className="text-xs font-bold shrink-0"
              style={{ color: ringColor }}
            >
              {bScore}%
            </span>
          </div>
        );
      })()}

      {/* ── Summary + Dashboard card ───────────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-3 space-y-3 shrink-0">

        {/* Progress header with inline health indicator */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-600">
              {doneCount} of {items.length} complete
            </span>
            <div className="flex items-center gap-1.5">
              {/* Health dot — colour mirrors the sidebar health score ring */}
              <span
                className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                  items.length === 0
                    ? "bg-slate-200"
                    : progress >= 80
                    ? "bg-green-500"
                    : progress >= 50
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
                title={
                  items.length === 0
                    ? "No items yet"
                    : progress >= 80
                    ? "Healthy — keep it up"
                    : progress >= 50
                    ? "Needs attention"
                    : "At risk — complete more items"
                }
              />
              <span className={`text-xs font-bold tabular-nums ${progressTextColor(progress)}`}>
                {progress}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressBarColor(progress)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Remaining fee total */}
        {totalFees > 0 && (
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
            <DollarSign className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="text-xs text-slate-600 flex-1">Est. remaining fees</span>
            <span className="text-xs font-bold text-blue-700">
              ${totalFees.toFixed(0)}{hasFeeRanges ? "+" : ""}
            </span>
          </div>
        )}

        {/* Dashboard action buttons */}
        {confirmAction === null ? (
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-1">
              {/* Mark All Done */}
              <button
                onClick={handleMarkAllDone}
                disabled={doneCount === items.length}
                className="flex flex-col items-center gap-1 px-1 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-center"
                title="Mark all items as done"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="text-[10px] leading-tight font-medium">Mark All<br />Done</span>
              </button>

              {/* Clear Completed */}
              <button
                onClick={() => doneItems.length > 0 && setConfirmAction("clear-done")}
                disabled={doneItems.length === 0}
                className="flex flex-col items-center gap-1 px-1 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-center"
                title="Remove all completed items"
              >
                <X className="h-3.5 w-3.5" />
                <span className="text-[10px] leading-tight font-medium">Clear<br />Completed</span>
              </button>

              {/* Reset Checklist */}
              <button
                onClick={() => setConfirmAction("reset")}
                className="flex flex-col items-center gap-1 px-1 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all text-center"
                title="Delete all items"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="text-[10px] leading-tight font-medium">Reset<br />All</span>
              </button>
            </div>

            {/* Clear All Business Data */}
            {onClearAll && (
              <button
                onClick={() => setConfirmAction("clear-all")}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all text-[10px] font-semibold"
                title="Clear all business data including forms and chat history"
              >
                <Trash2 className="h-3 w-3" />
                Clear All Business Data
              </button>
            )}
          </div>
        ) : confirmAction === "reset" ? (
          <ConfirmBar
            message="Delete all items?"
            onConfirm={handleResetAll}
            onCancel={() => setConfirmAction(null)}
          />
        ) : confirmAction === "clear-all" ? (
          <ConfirmBar
            message="Are you sure? This will permanently delete all data for this business."
            onConfirm={handleClearAll}
            onCancel={() => setConfirmAction(null)}
          />
        ) : (
          <ConfirmBar
            message={`Remove ${doneItems.length} completed item${doneItems.length !== 1 ? "s" : ""}?`}
            onConfirm={handleClearCompleted}
            onCancel={() => setConfirmAction(null)}
          />
        )}

        {/* "Complete All Forms" — shown when 1+ incomplete items have linked forms */}
        {(() => {
          const pendingFormIds = items
            .filter(i => i.formId && i.status !== 'done')
            .map(i => i.formId!);
          const uniquePending = [...new Set(pendingFormIds)];
          if (uniquePending.length < 1 || !onCompleteAllForms) return null;
          if (isFormLimited) {
            return (
              <button
                onClick={onUpgradeClick}
                className="w-full h-8 text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold rounded-md flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                title={`${monthlyFormsUsed}/${freeMonthlyLimit} free completions used — upgrade for unlimited`}
              >
                <Lock className="h-3 w-3" />
                Upgrade to Pro for Unlimited AI Forms
              </button>
            );
          }
          return (
            <div className="space-y-1">
              <Button
                className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={() => onCompleteAllForms(uniquePending)}
              >
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                Complete All Forms with AI
                <span className="ml-1.5 bg-blue-500 text-white text-[10px] font-bold rounded px-1.5 py-0.5">
                  {uniquePending.length}
                </span>
              </Button>
              {!isPro && (
                <p className="text-[10px] text-slate-400 text-center tabular-nums">
                  {monthlyFormsUsed}/{freeMonthlyLimit} free completions used this month
                </p>
              )}
            </div>
          );
        })()}

        {/* Upload Document button */}
        {onUploadDocument && (
          <button
            onClick={onUploadDocument}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-all text-[10px] font-semibold"
            title="Upload an existing permit or license document for AI analysis"
          >
            <Download className="h-3 w-3 rotate-180" />
            Upload Existing Document
          </button>
        )}

        {/* Sort + Export row */}
        <div className="flex items-center gap-1.5">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="flex-1 text-xs border rounded-lg px-2 py-1.5 bg-slate-50 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="default">Sort: Default</option>
            <option value="due-date">Sort: Due Date</option>
            <option value="status">Sort: Status</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs shrink-0"
            onClick={handleExport}
            title="Export checklist as PDF"
          >
            <Download className="h-3 w-3 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* ── Items list ────────────────────────────────────────────────────── */}
      <div className="overflow-y-auto flex-1 space-y-1.5 pr-0.5">
        {sorted.map(item => {
          const cfg = STATUS_CONFIG[item.status];
          const { Icon } = cfg;
          const isExpanded = expandedId === item.id;
          const isOverdue =
            item.dueDate &&
            item.status !== "done" &&
            new Date(item.dueDate + "T00:00:00") < new Date(new Date().setHours(0, 0, 0, 0));

          // Whether to show the "Complete Form" CTA on this item.
          // Visible when: the item was created from a form suggestion (has formId),
          // hasn't been completed yet, and the parent provided the onStartForm handler.
          const showCompleteFormCta =
            !!item.formId && item.status !== "done" && !!onStartForm;

          // Whether to show the "View Completed Form" button on this item.
          // Visible when: the item was filled by RegBot AI (has completedVia + formId)
          // and the parent provided the onViewCompletedForm handler.
          const showViewCompletedFormCta =
            !!item.completedVia && !!item.formId && !!onViewCompletedForm;

          // Renewal badge: show for ALL items that have a renewalDate.
          // Urgency: red ≤30d, amber ≤60d, green ≤90d, slate >90d.
          const renewalDays = item.renewalDate ? renewalDaysLeft(item.renewalDate) : null;
          const showRenewalBadge = renewalDays !== null;
          const showRenewCta     = showRenewalBadge && !!item.formId && !!onRenewForm;

          // Rule Change Alert badge: shown when this item's form has an active alert.
          const hasAlert     = !!item.formId && (alertedFormIds?.has(item.formId) ?? false);
          const showAlertCta = hasAlert && !!onViewRuleAlert;

          return (
            <div
              key={item.id}
              className={`rounded-xl border bg-white overflow-hidden transition-shadow ${
                isExpanded ? "shadow-md border-slate-300" : "border-slate-200 hover:shadow-sm hover:border-slate-300"
              } ${item.status === "done" ? "opacity-55" : ""}`}
            >
              {/* ── Collapsed row ─────────────────────────────────────── */}
              <div
                className="flex items-start gap-2.5 px-3 pt-3 pb-2.5 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                {/* Status icon — click toggles todo ↔ done without expanding */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onUpdate(item.id, { status: item.status === "done" ? "todo" : "done" });
                  }}
                  className={`mt-0.5 shrink-0 ${cfg.textColor} hover:scale-110 transition-transform`}
                  title={item.status === "done" ? "Mark as To Do" : "Mark as Done"}
                >
                  <Icon className="h-4 w-4" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-snug ${
                    item.status === "done" ? "line-through text-slate-400" : "text-slate-800 font-medium"
                  }`}>
                    {renderItemText(item.text)}
                  </p>

                  {/* Badge row */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {item.fee && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 font-medium">
                        {item.fee}
                      </span>
                    )}
                    {item.dueDate && (
                      <span className={`inline-flex items-center gap-0.5 text-[10px] rounded px-1.5 py-0.5 font-medium border ${
                        isOverdue
                          ? "text-red-700 bg-red-50 border-red-200"
                          : "text-slate-500 bg-slate-50 border-slate-200"
                      }`}>
                        <Calendar className="h-2.5 w-2.5" />
                        {formatDueDate(item.dueDate)}
                      </span>
                    )}
                    {/* "AI Filled" badge — shown when completed via RegBot form filler */}
                    {item.completedVia && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 font-medium">
                        ✦ AI Filled
                      </span>
                    )}
                    {/* Renewal countdown badge */}
                    {showRenewalBadge && renewalDays !== null && (
                      <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold border rounded px-1.5 py-0.5 ${renewalBadgeColor(renewalDays)}`}>
                        <RefreshCw className="h-2.5 w-2.5" />
                        {renewalLabel(renewalDays)}
                      </span>
                    )}
                    {/* "Included with Pro" badge — shown on renewal items for Pro users */}
                    {showRenewalBadge && isPro && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">
                        <Crown className="h-2 w-2" />
                        Pro
                      </span>
                    )}
                    {/* Rule change alert badge */}
                    {hasAlert && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Updated
                      </span>
                    )}
                    {/* "Included with Pro" badge — shown on alerted items for Pro users */}
                    {hasAlert && isPro && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">
                        <Crown className="h-2 w-2" />
                        Pro
                      </span>
                    )}
                    {item.notes && !isExpanded && (
                      <span title="Has notes">
                        <StickyNote className="h-3 w-3 text-slate-300" />
                      </span>
                    )}
                  </div>

                  {/*
                    "Complete Form with AI" CTA — visible in the collapsed row
                    whenever the item has a linked formId and isn't done.
                    Clicking it calls onStartForm without expanding the detail panel.
                  */}
                  {showCompleteFormCta && !isFormLimited && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onStartForm!(item);
                      }}
                      className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2 py-1 transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      Complete Form with AI
                      {!isPro && (
                        <span className="ml-0.5 tabular-nums text-blue-400">
                          ({monthlyFormsUsed}/{freeMonthlyLimit})
                        </span>
                      )}
                    </button>
                  )}
                  {showCompleteFormCta && isFormLimited && (
                    <button
                      onClick={e => { e.stopPropagation(); onUpgradeClick?.(); }}
                      className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 transition-colors"
                      title={`${monthlyFormsUsed}/${freeMonthlyLimit} free completions used — upgrade for unlimited`}
                    >
                      <Lock className="h-3 w-3" />
                      Upgrade to Pro
                    </button>
                  )}
                  {showViewCompletedFormCta && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onViewCompletedForm!(item.formId!);
                      }}
                      className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-2 py-1 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      View Completed Form
                    </button>
                  )}
                  {showRenewCta && renewalDays !== null && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onRenewForm!(item);
                      }}
                      className={`mt-2 flex items-center gap-1 text-[10px] font-semibold border rounded-lg px-2 py-1 transition-colors ${renewButtonColor(renewalDays)}`}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Renew Now
                    </button>
                  )}
                  {showAlertCta && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onViewRuleAlert!(item.formId!);
                      }}
                      className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg px-2 py-1 transition-colors"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Review Update
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dotColor}`} />
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* ── Expanded detail panel ──────────────────────────────── */}
              {isExpanded && (
                <div
                  className="px-3 pb-3 border-t border-slate-100 pt-3 space-y-3"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Quick action row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => onUpdate(item.id, { status: item.status === "done" ? "todo" : "done" })}
                      className={`flex items-center gap-1 text-[10px] font-semibold rounded-full px-2.5 py-1 border transition-colors ${
                        item.status === "done"
                          ? "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100"
                          : "text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      {item.status === "done" ? "Mark as To Do" : "Mark as Done"}
                    </button>

                    {showCompleteFormCta && !isFormLimited && (
                      <button
                        onClick={() => { setExpandedId(null); onStartForm!(item); }}
                        className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        Complete Form
                        {!isPro && (
                          <span className="text-blue-400 tabular-nums">
                            ({monthlyFormsUsed}/{freeMonthlyLimit})
                          </span>
                        )}
                      </button>
                    )}
                    {showCompleteFormCta && isFormLimited && (
                      <button
                        onClick={() => { setExpandedId(null); onUpgradeClick?.(); }}
                        className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 hover:bg-slate-100 transition-colors"
                        title={`${monthlyFormsUsed}/${freeMonthlyLimit} free completions used`}
                      >
                        <Lock className="h-3 w-3 shrink-0" />
                        Upgrade to Pro
                      </button>
                    )}
                    {showViewCompletedFormCta && (
                      <button
                        onClick={() => { setExpandedId(null); onViewCompletedForm!(item.formId!); }}
                        className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 hover:bg-green-100 transition-colors"
                      >
                        <Eye className="h-3 w-3 shrink-0" />
                        View Completed Form
                      </button>
                    )}
                    {showRenewCta && renewalDays !== null && (
                      <button
                        onClick={() => { setExpandedId(null); onRenewForm!(item); }}
                        className={`flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2.5 py-1 transition-colors ${renewButtonColor(renewalDays)}`}
                      >
                        <RefreshCw className="h-3 w-3 shrink-0" />
                        Renew Now
                      </button>
                    )}
                    {showAlertCta && (
                      <button
                        onClick={() => { setExpandedId(null); onViewRuleAlert!(item.formId!); }}
                        className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-300 rounded-full px-2.5 py-1 hover:bg-amber-100 transition-colors"
                      >
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        Review Update
                      </button>
                    )}

                    <button
                      onClick={() => { onDelete(item.id); setExpandedId(null); }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 rounded-full px-2.5 py-1 hover:bg-red-100 transition-colors ml-auto"
                    >
                      <Trash2 className="h-3 w-3 shrink-0" />
                      Remove
                    </button>
                  </div>

                  {/* Status + Due date selectors */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1 font-semibold uppercase tracking-wider">Status</label>
                      <select
                        value={item.status}
                        onChange={e => onUpdate(item.id, { status: e.target.value as ChecklistStatus })}
                        className="w-full text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1 font-semibold uppercase tracking-wider">Due Date</label>
                      <input
                        type="date"
                        value={item.dueDate ?? ""}
                        onChange={e => onUpdate(item.id, { dueDate: e.target.value || undefined })}
                        className="w-full text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Notes textarea */}
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1 font-semibold uppercase tracking-wider">Notes</label>
                    <textarea
                      value={item.notes ?? ""}
                      onChange={e => onUpdate(item.id, { notes: e.target.value || undefined })}
                      placeholder="Add private notes..."
                      rows={2}
                      className="w-full text-xs border rounded-lg px-2 py-1.5 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-slate-300"
                    />
                  </div>

                  {/* completedVia badge */}
                  {item.completedVia && (
                    <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      Completed via: {item.completedVia}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
