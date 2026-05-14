"use client";

import { useState, useCallback } from "react";
import { ClipboardList, ChevronRight, X, Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import type { InspectionQuestion, InspectionReport } from "@/app/api/inspection-coach/types";
import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────

type InspectionType = "health" | "fire" | "building" | "general";
type Answer = "yes" | "no" | "unknown";
type Phase = "select" | "loading-questions" | "quiz" | "loading-report" | "report";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessType: string;
  location: string;
}

const INSPECTION_TYPES: Array<{ id: InspectionType; label: string; emoji: string; description: string }> = [
  { id: "health",   label: "Health / Food Safety",  emoji: "🍽️", description: "Food handling, sanitation, temperature logs" },
  { id: "fire",     label: "Fire Safety",            emoji: "🔥", description: "Extinguishers, exits, sprinklers, alarms" },
  { id: "building", label: "Building & Zoning",      emoji: "🏗️", description: "Occupancy, ADA, signage, electrical" },
  { id: "general",  label: "General Business",       emoji: "📋", description: "Licensing, permits, insurance, records" },
];

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-600 dark:text-green-400",
  B: "text-blue-600 dark:text-blue-400",
  C: "text-amber-600 dark:text-amber-400",
  D: "text-orange-600 dark:text-orange-400",
  F: "text-red-600 dark:text-red-400",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function InspectionCoach({ isOpen, onClose, businessName, businessType, location }: Props) {
  const [phase,          setPhase]          = useState<Phase>("select");
  const [inspectionType, setInspectionType] = useState<InspectionType>("general");
  const [questions,      setQuestions]      = useState<InspectionQuestion[]>([]);
  const [answers,        setAnswers]        = useState<Record<string, Answer>>({});
  const [currentQ,       setCurrentQ]       = useState(0);
  const [report,         setReport]         = useState<InspectionReport | null>(null);
  const [error,          setError]          = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("select");
    setQuestions([]);
    setAnswers({});
    setCurrentQ(0);
    setReport(null);
    setError(null);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (session?.access_token) return { Authorization: `Bearer ${session.access_token}` };
    } catch (_) {}
    return {};
  }, []);

  const startInspection = useCallback(async (type: InspectionType) => {
    setInspectionType(type);
    setPhase("loading-questions");
    setError(null);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api/inspection-coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ businessName, businessType, location, inspectionType: type, mode: "questions" }),
      });
      const data = await res.json() as { ok: boolean; questions?: InspectionQuestion[]; error?: string };
      if (!data.ok || !data.questions?.length) throw new Error(data.error ?? "No questions returned");
      setQuestions(data.questions);
      setAnswers({});
      setCurrentQ(0);
      setPhase("quiz");
    } catch (err) {
      setError(String(err));
      setPhase("select");
    }
  }, [businessName, businessType, location, getAuthHeader]);

  const answerQuestion = useCallback((id: string, ans: Answer) => {
    const next = { ...answers, [id]: ans };
    setAnswers(next);
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      // All answered — generate report
      void generateReport(next);
    }
  }, [answers, currentQ, questions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateReport = async (finalAnswers: Record<string, Answer>) => {
    setPhase("loading-report");
    setError(null);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api/inspection-coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ businessName, businessType, location, inspectionType, answers: finalAnswers, mode: "report" }),
      });
      const data = await res.json() as { ok: boolean; report?: InspectionReport; error?: string };
      if (!data.ok || !data.report) throw new Error(data.error ?? "No report returned");
      setReport(data.report);
      setPhase("report");
    } catch (err) {
      setError(String(err));
      setPhase("quiz");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center pointer-events-auto"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white dark:bg-[#0f1823] rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/15">
              <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Pre-Inspection Coach</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{businessName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Select phase ── */}
          {phase === "select" && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose an inspection type. I'll ask you 10 yes/no questions a real inspector would ask, then generate a risk report.
              </p>
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-xl px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}
              {INSPECTION_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => startInspection(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-slate-50/50 dark:bg-[#1a2740]/50 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-colors group min-h-[52px] pointer-events-auto"
                >
                  <span className="text-xl leading-none">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">{t.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{t.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* ── Loading questions ── */}
          {phase === "loading-questions" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Preparing your inspection checklist…</p>
            </div>
          )}

          {/* ── Quiz phase ── */}
          {phase === "quiz" && questions.length > 0 && (
            <div className="p-5 space-y-5">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Question {currentQ + 1} of {questions.length}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    questions[currentQ].weight === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                    questions[currentQ].weight === "major"    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                                                                "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                  }`}>{questions[currentQ].weight}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQ) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Category */}
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                {questions[currentQ].category}
              </p>

              {/* Question */}
              <p className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {questions[currentQ].text}
              </p>

              {/* Answer buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {(["yes", "no", "unknown"] as Answer[]).map(ans => (
                  <button
                    key={ans}
                    onClick={() => answerQuestion(questions[currentQ].id, ans)}
                    className={`min-h-[52px] rounded-xl text-sm font-semibold border transition-colors pointer-events-auto capitalize ${
                      ans === "yes"     ? "bg-green-600 hover:bg-green-700 text-white border-green-600" :
                      ans === "no"      ? "bg-red-600 hover:bg-red-700 text-white border-red-600" :
                                          "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {ans === "yes" ? "✓ Yes" : ans === "no" ? "✗ No" : "? Unsure"}
                  </button>
                ))}
              </div>

              {/* Skip back */}
              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ(q => q - 1)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  ← Previous question
                </button>
              )}
            </div>
          )}

          {/* ── Loading report ── */}
          {phase === "loading-report" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Generating your risk report…</p>
            </div>
          )}

          {/* ── Report phase ── */}
          {phase === "report" && report && (
            <div className="p-5 space-y-4">
              {/* Score card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-slate-50/50 dark:bg-[#1a2740]/50">
                <div className={`text-5xl font-black leading-none ${GRADE_COLORS[report.grade]}`}>
                  {report.grade}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {report.score}/100
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${report.readyToPass ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}`}>
                      {report.readyToPass ? "Ready to Pass" : "Needs Work"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>
                </div>
              </div>

              {/* Top priorities */}
              {report.topPriorities?.length > 0 && (
                <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-3.5 space-y-1.5">
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Top Priorities Before Inspection</p>
                  {report.topPriorities.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <span className="font-bold shrink-0">{i + 1}.</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk items */}
              <div className="space-y-2">
                {report.risks.map((r, i) => (
                  <div key={i} className={`rounded-xl px-3 py-2.5 border text-xs ${
                    r.severity === "critical" ? "bg-red-50 border-red-200/60 dark:bg-red-950/30 dark:border-red-800/40" :
                    r.severity === "warning"  ? "bg-amber-50 border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-800/40" :
                                                "bg-green-50 border-green-200/60 dark:bg-green-950/30 dark:border-green-800/40"
                  }`}>
                    <div className="flex items-start gap-2">
                      {r.severity === "pass"
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        : <AlertCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${r.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                      }
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{r.area}: </span>
                        <span className="text-slate-600 dark:text-slate-400">{r.issue}</span>
                        {r.recommendation && r.severity !== "pass" && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-500 italic">{r.recommendation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Run again */}
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors pointer-events-auto"
              >
                <Shield className="h-4 w-4" />
                Run Another Inspection
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
