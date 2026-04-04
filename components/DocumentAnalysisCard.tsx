"use client";

// DocumentAnalysisCard — shows structured AI analysis results after a document upload.
//
// Displays:
//   • Document type, issuing authority, permit number, status badge
//   • Key dates (issue / expiration) with urgency colouring
//   • Which checklist items were matched and will be marked done
//   • Missing / still-pending items from the business checklist
//   • Suggestions for next steps
//   • Expandable raw data section
//
// The parent is responsible for calling onApplyUpdates() which will:
//   - Set matching checklist items to status "done" with completedVia = "Document Upload"
//   - Update renewal dates from the expiration date if applicable

import { useState } from "react";
import {
  CheckCircle2, AlertCircle, Calendar, Building2, Hash,
  ChevronDown, ChevronRight, FileText, Info, X, RefreshCw,
} from "lucide-react";
import type { DocumentAnalysis } from "@/lib/regbot-types";
import type { ChecklistItem } from "@/lib/checklist";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MatchedItem {
  checklistItemId: string;
  checklistText: string;
  formId: string;
}

interface Props {
  fileName: string;
  analysis: DocumentAnalysis;
  /** All current checklist items — used to show which are matched vs. still pending */
  checklist: ChecklistItem[];
  /** Called when user clicks "Apply Updates" */
  onApplyUpdates: (matched: MatchedItem[]) => void;
  /** Called to dismiss/close the card */
  onDismiss: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: DocumentAnalysis["status"]) {
  const cfg = {
    Active:    { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-500"  },
    Expired:   { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    dot: "bg-red-500"    },
    Suspended: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  dot: "bg-amber-500"  },
    Pending:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
    Unknown:   { bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-600",  dot: "bg-slate-400"  },
  }[status] ?? { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", dot: "bg-slate-400" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function expirationColor(isoDate: string): string {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(isoDate + "T00:00:00");
  const days = Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
  if (days < 0)   return "text-red-600";
  if (days <= 30) return "text-red-600";
  if (days <= 90) return "text-amber-600";
  return "text-green-600";
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DocumentAnalysisCard({
  fileName,
  analysis,
  checklist,
  onApplyUpdates,
  onDismiss,
}: Props) {
  const [showRaw, setShowRaw]     = useState(false);
  const [applied, setApplied]     = useState(false);

  // ── Compute matched checklist items ────────────────────────────────────────
  // Find items in the current checklist whose formId is in analysis.matchedFormIds
  // and that are not already done.
  const matched: MatchedItem[] = checklist
    .filter(
      (item) =>
        item.formId &&
        analysis.matchedFormIds.includes(item.formId) &&
        item.status !== "done",
    )
    .map((item) => ({
      checklistItemId: item.id,
      checklistText:   item.text,
      formId:          item.formId!,
    }));

  // Already done items that match — show as "already covered"
  const alreadyDone = checklist.filter(
    (item) =>
      item.formId &&
      analysis.matchedFormIds.includes(item.formId) &&
      item.status === "done",
  );

  // Still-pending items NOT matched by this document
  const stillPending = checklist.filter(
    (item) =>
      item.status !== "done" &&
      (!item.formId || !analysis.matchedFormIds.includes(item.formId)),
  );

  const handleApply = () => {
    if (applied) return;
    setApplied(true);
    onApplyUpdates(matched);
  };

  const rawEntries = Object.entries(analysis.rawExtracted ?? {}).filter(([, v]) => v);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <FileText className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
              Document Analyzed
            </p>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {analysis.docType}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {statusBadge(analysis.status)}
          <button
            onClick={onDismiss}
            className="p-1 text-slate-300 hover:text-slate-500 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Key fields ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 space-y-2 border-b border-slate-100">
        {analysis.issuingAuthority && (
          <div className="flex items-start gap-2">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Issued by</span>
              <p className="text-xs text-slate-700">{analysis.issuingAuthority}</p>
            </div>
          </div>
        )}
        {analysis.permitNumber && (
          <div className="flex items-start gap-2">
            <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Permit / License #</span>
              <p className="text-xs text-slate-700 font-mono">{analysis.permitNumber}</p>
            </div>
          </div>
        )}
        {(analysis.issueDate || analysis.expirationDate) && (
          <div className="flex items-start gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex gap-4">
              {analysis.issueDate && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">Issued</span>
                  <p className="text-xs text-slate-700">{formatDate(analysis.issueDate)}</p>
                </div>
              )}
              {analysis.expirationDate && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">Expires</span>
                  <p className={`text-xs font-semibold ${expirationColor(analysis.expirationDate)}`}>
                    {formatDate(analysis.expirationDate)}
                  </p>
                </div>
              )}
              {analysis.expirationDate === null && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">Expires</span>
                  <p className="text-xs text-green-600 font-medium">Does not expire</p>
                </div>
              )}
            </div>
          </div>
        )}
        {analysis.scope && (
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Scope</span>
              <p className="text-xs text-slate-700">{analysis.scope}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Summary ────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-600 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* ── Checklist impact ───────────────────────────────────────────────── */}
      {(matched.length > 0 || alreadyDone.length > 0 || stillPending.length > 0) && (
        <div className="px-4 py-3 border-b border-slate-100 space-y-3">

          {/* Items that will be marked done */}
          {matched.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {applied ? "Marked as Done" : `Will Mark as Done (${matched.length})`}
              </p>
              <div className="space-y-1">
                {matched.map((m) => (
                  <div key={m.checklistItemId} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-700 leading-snug">{m.checklistText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already done items */}
          {alreadyDone.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Already Completed
              </p>
              <div className="space-y-1">
                {alreadyDone.map((item) => (
                  <div key={item.id} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-slate-300 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-400 line-through leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Still pending items */}
          {stillPending.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Still Needed
              </p>
              <div className="space-y-1">
                {stillPending.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start gap-1.5">
                    <AlertCircle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-snug">{item.text}</p>
                  </div>
                ))}
                {stillPending.length > 4 && (
                  <p className="text-[10px] text-slate-400 pl-4">+{stillPending.length - 4} more…</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Suggestions ────────────────────────────────────────────────────── */}
      {analysis.suggestions.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1.5">Suggested Next Steps</p>
          <ul className="space-y-1">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ChevronRight className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-snug">{s}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Raw extracted data (collapsible) ─────────────────────────────── */}
      {rawEntries.length > 0 && (
        <div className="border-b border-slate-100">
          <button
            onClick={() => setShowRaw(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <span>Raw Extracted Data ({rawEntries.length} fields)</span>
            {showRaw
              ? <ChevronDown className="h-3.5 w-3.5" />
              : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          {showRaw && (
            <div className="px-4 pb-3 grid grid-cols-1 gap-1">
              {rawEntries.map(([k, v]) => (
                <div key={k} className="flex gap-2 items-start">
                  <span className="text-[10px] font-semibold text-slate-400 w-32 shrink-0 pt-0.5 truncate">{k}</span>
                  <span className="text-[11px] text-slate-700 flex-1 break-words">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Footer actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
        <button
          onClick={onDismiss}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          Dismiss
        </button>
        {matched.length > 0 && (
          <button
            onClick={handleApply}
            disabled={applied}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              applied
                ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {applied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Applied!
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Apply Updates ({matched.length} item{matched.length !== 1 ? "s" : ""})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
