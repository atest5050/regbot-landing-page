// Changes summary:
// - Added 'checkbox' FieldType support: renders as a Yes / No toggle button pair.
//   Stored in formData as the string "Yes" or "No".
// - Added officialFieldName display: when a field has officialFieldName set, FormFiller
//   renders a small reference badge ("↗ SS-4 Line 1: Legal name of entity") directly
//   below the field label. This lets users cross-reference the real government document
//   while answering without leaving the app.
// - Intro phase: officialFormNumber badge + "Download Blank Form" button when PDF URL exists.
// - Intro phase: "Open Submission Portal" button always present.
// - Summary phase: "Open Official Submission Portal" link above the save/pay button.
// - All other logic (payment, queue, skipPayment, progress bar) unchanged.
// - SBA fallback fix: isSbaFallback() detects generic sba.gov URLs. When no locale-specific
//   portal URL exists (business-license in most states, home-occupation-permit), "Official
//   Site" button renders as a visible disabled button with label "Find Local Office" and an
//   informative tooltip "Check with your local county/city office" — replacing the silent
//   gray-out. The summary phase shows a matching informational row instead of an SBA link.
//   This prevents the button from ever directing users to a generic SBA page.
// - County-level URL support: The template received by FormFiller may now have a county-
//   specific submitPortalUrl (e.g. pbcgov.org for Palm Beach County business-license) set
//   by getLocaleFormTemplate() via the new countyUrls resolution. No code change needed
//   here — isSbaFallback() will correctly detect non-SBA county URLs as active links.

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight, ChevronLeft, CheckCircle, X,
  FileText, ExternalLink, CreditCard, Loader2, Lock, Download,
} from "lucide-react";
import type { FormTemplate, FormField } from "@/lib/formTemplates";

interface FormFillerProps {
  template: FormTemplate;
  location: string;
  onComplete: (formData: Record<string, string>, template: FormTemplate) => void;
  onDismiss: () => void;
  /**
   * Shown in the header when this form is part of a multi-form queue.
   * e.g. "Form 2 of 4"
   */
  queueLabel?: string;
  /**
   * When true, the payment step is skipped entirely.
   * Used in "Complete All Required Forms" mode — a single compliance packet
   * is generated at the end instead of per-form Stripe charges.
   */
  skipPayment?: boolean;
}

type FillerPhase = "intro" | "filling" | "summary" | "payment" | "redirecting";

function generateFormKey(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── OfficialFieldBadge ────────────────────────────────────────────────────────
// Shows the official government form field reference (line number, section, etc.)
// as a small muted label beneath the question so users can cross-reference.

function OfficialFieldBadge({ name }: { name: string }) {
  return (
    <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 mb-2 font-mono leading-tight">
      <span className="text-slate-300">↗</span>
      {name}
    </p>
  );
}

// ── CheckboxField ─────────────────────────────────────────────────────────────
// Renders a Yes / No toggle for boolean questions. Stores "Yes" or "No" in formData.

function CheckboxField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {(["Yes", "No"] as const).map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            value === opt
              ? opt === "Yes"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-slate-400 bg-slate-100 text-slate-700"
              : "border-slate-200 hover:border-slate-300 text-slate-600"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── SBA fallback detection ────────────────────────────────────────────────────
// Returns true when a URL is the generic SBA fallback, meaning no locale-specific
// portal is known for this form. In that case the "Official Site" button is disabled
// rather than sending users to a generic federal small-business page.

function isSbaFallback(url: string | undefined): boolean {
  return !url || url.startsWith("https://www.sba.gov");
}

export default function FormFiller({
  template,
  location,
  onComplete,
  onDismiss,
  queueLabel,
  skipPayment,
}: FormFillerProps) {
  const [phase, setPhase] = useState<FillerPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentField: FormField | undefined = template.fields[currentIndex];
  const requiredFields = template.fields.filter(f => f.required);
  const progress = Math.round((currentIndex / template.fields.length) * 100);

  useEffect(() => {
    if (phase === "filling" && currentField) {
      setCurrentAnswer(formData[currentField.id] ?? "");
      setFieldError("");
      // Don't auto-focus for checkbox or select — keyboard input irrelevant
      if (currentField.type !== "select" && currentField.type !== "checkbox") {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  }, [currentIndex, phase]);

  // ── Filling helpers ──────────────────────────────────────────────────────
  const commitCurrentAnswer = () => {
    if (!currentField) return;
    setFormData(prev => ({ ...prev, [currentField.id]: currentAnswer.trim() }));
  };

  const handleNext = () => {
    if (!currentField) return;
    if (currentField.required && !currentAnswer.trim()) {
      setFieldError("This field is required.");
      return;
    }
    commitCurrentAnswer();
    setFieldError("");
    if (currentIndex < template.fields.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setFormData(prev => ({ ...prev, [currentField.id]: currentAnswer.trim() }));
      setPhase("summary");
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      commitCurrentAnswer();
      setCurrentIndex(i => i - 1);
    }
  };

  const handleSkip = () => {
    if (currentField?.required) return;
    setFormData(prev => ({ ...prev, [currentField!.id]: "" }));
    if (currentIndex < template.fields.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setPhase("summary");
    }
  };

  const handleEditField = (index: number) => {
    setCurrentIndex(index);
    setPhase("filling");
  };

  // ── Payment ──────────────────────────────────────────────────────────────
  const handleInitiatePayment = async () => {
    setPaymentError("");
    setPhase("redirecting");

    const formKey = generateFormKey();

    const payload = { formId: template.id, formData, location };
    try {
      localStorage.setItem(`regbot_form_${formKey}`, JSON.stringify(payload));
    } catch {
      setPaymentError("Could not save form data. Please disable private browsing and try again.");
      setPhase("payment");
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: template.id,
          formName: template.name,
          formKey,
        }),
      });

      if (!res.ok) throw new Error("Checkout session creation failed");
      const { url } = await res.json();
      if (!url) throw new Error("No checkout URL returned");

      onComplete(formData, template);
      window.location.href = url;
    } catch {
      localStorage.removeItem(`regbot_form_${formKey}`);
      setPaymentError("Could not connect to payment processor. Please check your connection and try again.");
      setPhase("payment");
    }
  };

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    const rawPortalUrl = template.submitPortalUrl ?? template.submitUrl;
    const portalUrl    = isSbaFallback(rawPortalUrl) ? null : rawPortalUrl;

    return (
      <div className="border-t bg-white">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">
                  {queueLabel ? queueLabel : "Form Assistant"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 leading-tight">{template.name}</p>
                  {template.officialFormNumber && (
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 shrink-0">
                      {template.officialFormNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-4">{template.description}</p>

          <div className={`grid gap-2 mb-4 ${skipPayment ? "grid-cols-2" : "grid-cols-3"}`}>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Gov. Filing Fee</p>
              <p className="font-semibold text-slate-800 text-sm">{template.fee}</p>
            </div>
            {!skipPayment && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Completion Fee</p>
                <p className="font-semibold text-blue-600 text-sm">$5.00</p>
              </div>
            )}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Questions</p>
              <p className="font-semibold text-slate-800 text-sm">
                {template.fields.length} ({requiredFields.length} required)
              </p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
              Documents You Will Need
            </p>
            <ul className="space-y-1">
              {template.requiredDocs.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700">
            {skipPayment ? (
              <>
                <strong>How it works:</strong> Answer {template.fields.length} questions and review
                your answers. Your filled form is included in your compliance packet — government
                filing fees are paid separately to the issuing agency.
              </>
            ) : (
              <>
                <strong>How it works:</strong> Answer {template.fields.length} questions, review your
                answers, then pay a one-time $5 RegBot completion fee. Your filled PDF downloads
                automatically — government filing fees are paid separately to the issuing agency.
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => setPhase("filling")}>
              Start — {template.fields.length} Questions
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            {template.officialFormPdfUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={template.officialFormPdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Blank Form
                </a>
              </Button>
            )}
            {portalUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Official Site
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Check with your local county/city office — filing location varies by jurisdiction"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Find Local Office
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── FILLING ──────────────────────────────────────────────────────────────
  if (phase === "filling" && currentField) {
    return (
      <div className="border-t bg-white">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">
              Question {currentIndex + 1} of {template.fields.length}
            </span>
            <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mb-4">
            {/* Field label */}
            <label className="block text-sm font-semibold text-slate-800 mb-0.5">
              {currentField.label}
              {!currentField.required && (
                <span className="ml-2 text-xs font-normal text-slate-400">(optional)</span>
              )}
            </label>

            {/* Official form cross-reference badge */}
            {currentField.officialFieldName && (
              <OfficialFieldBadge name={currentField.officialFieldName} />
            )}

            {/* Freeform hint */}
            {currentField.hint && (
              <p className="text-xs text-slate-500 mb-2">{currentField.hint}</p>
            )}

            {/* ── Input rendering by type ── */}
            {currentField.type === "checkbox" ? (
              <CheckboxField
                value={currentAnswer}
                onChange={v => setCurrentAnswer(v)}
              />
            ) : currentField.type === "select" ? (
              <div className="grid gap-2">
                {currentField.options?.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCurrentAnswer(opt)}
                    className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                      currentAnswer === opt
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                ref={inputRef}
                type={
                  currentField.type === "email" ? "email"
                  : currentField.type === "phone" ? "tel"
                  : currentField.type === "date" ? "date"
                  : "text"
                }
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleNext()}
                placeholder={currentField.placeholder ?? ""}
                className={fieldError ? "border-red-400" : ""}
              />
            )}

            {fieldError && <p className="text-red-500 text-xs mt-1">{fieldError}</p>}
          </div>

          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <Button className="flex-1" onClick={handleNext}>
              {currentIndex < template.fields.length - 1 ? (
                <><span>Next</span><ChevronRight className="h-4 w-4 ml-1" /></>
              ) : (
                "Review My Answers"
              )}
            </Button>
            {!currentField.required && (
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-slate-400 text-xs">
                Skip
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  if (phase === "summary") {
    const rawPortalUrl = template.submitPortalUrl ?? template.submitUrl;
    const portalUrl    = isSbaFallback(rawPortalUrl) ? null : rawPortalUrl;

    return (
      <div className="border-t bg-white max-h-[420px] overflow-y-auto">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate-900">Review Your Answers</p>
            <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-0 mb-5 border rounded-xl overflow-hidden">
            {template.fields.map((field, i) => (
              <div
                key={field.id}
                className="flex items-start justify-between px-4 py-2.5 border-b last:border-none bg-white hover:bg-slate-50 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">{field.label}</p>
                  {field.officialFieldName && (
                    <p className="text-[10px] font-mono text-slate-300 leading-tight mb-0.5">
                      {field.officialFieldName}
                    </p>
                  )}
                  <p className="text-sm text-slate-800 truncate">
                    {formData[field.id] || (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleEditField(i)}
                  className="text-xs text-blue-600 hover:underline shrink-0 pt-0.5"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800">
            <strong>Submission:</strong> {template.submitInstructions}
          </div>

          {/* Direct link to submission portal */}
          {portalUrl ? (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg py-2 mb-4 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              Open Official Submission Portal
            </a>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg py-2 mb-4">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              Check with your local county/city office — filing portal varies by jurisdiction
            </div>
          )}

          {skipPayment ? (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => onComplete(formData, template)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {queueLabel ? "Save & Continue →" : "Save Form ✓"}
            </Button>
          ) : (
            <Button className="w-full" onClick={() => setPhase("payment")}>
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Download — $5 fee
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── PAYMENT CONFIRMATION ─────────────────────────────────────────────────
  if (phase === "payment") {
    return (
      <div className="border-t bg-white">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="font-semibold text-slate-900">Confirm & Download</p>
            <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border rounded-xl overflow-hidden mb-4">
            <div className="bg-slate-50 px-4 py-3 border-b">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Order Summary</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">
                  RegBot Form Completion — {template.name.split("(")[0].trim()}
                </span>
                <span className="font-semibold text-slate-900">$5.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Includes: PDF generation, submission instructions, field review</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 pt-1 border-t mt-2">
                <span>Government filing fee ({template.fee}) — paid separately to agency</span>
              </div>
            </div>
            <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
              <span className="text-white font-semibold text-sm">Total due today</span>
              <span className="text-white font-bold text-lg">$5.00</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            Secure payment via Stripe. Your card details are never stored by RegBot.
          </div>

          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
              {paymentError}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPhase("summary")}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleInitiatePayment}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay $5 and Download PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── REDIRECTING ──────────────────────────────────────────────────────────
  if (phase === "redirecting") {
    return (
      <div className="border-t bg-white">
        <div className="max-w-2xl mx-auto p-5 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="font-semibold text-slate-800 mb-1">Redirecting to secure checkout...</p>
          <p className="text-sm text-slate-500">
            You will be returned here automatically after payment.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
