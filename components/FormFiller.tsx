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
// --- v2 upgrades ---
// - Primary flow: when template.officialFormPdfUrl exists, clicking "Start" triggers an
//   attempt to download the PDF and extract its AcroForm fields via /api/form/extract.
//   If successful, FormFiller uses the extracted PDF fields for the Q&A session and fills
//   the native government PDF directly (no jsPDF recreation). The filled PDF downloads
//   immediately in skipPayment mode; in paid mode it's base64-saved to localStorage and
//   the payment-success page handles the final fill+download.
// - New "pdf-loading" phase: spinner while the extract API runs.
// - New "pdf-fallback" phase: shown when auto-fill is not possible (no AcroForm fields,
//   download failure, encrypted-only PDF, etc.). Shows the exact UX message specified,
//   with a blank form download button, the official portal link, and an option to proceed
//   with the guided Q&A using the predefined template fields instead.
// - Extracted PDF fields are normalised to FormField shape so the existing filling/summary
//   phases work unchanged. Extracted fields carry required=false (we don't know which
//   AcroForm fields the agency actually requires).
// - downloadFilledPdf(): calls /api/form/fill with the raw PDF bytes + field values,
//   receives the filled PDF, and triggers a browser download without page navigation.
// - Payment flow: when pdfBase64 is available, it's stored alongside formData in
//   localStorage (key: regbot_form_${formKey}__pdf) so payment-success can retrieve it.
//   If the localStorage write fails (quota exceeded), the flow falls back to jsPDF.

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight, ChevronLeft, CheckCircle, X,
  FileText, ExternalLink, CreditCard, Loader2, Lock, Download,
  AlertCircle,
} from "lucide-react";
import type { FormTemplate, FormField } from "@/lib/formTemplates";

// ── Extracted PDF field shape (returned by /api/form/extract) ─────────────────
interface ExtractedPdfField {
  name: string;          // Raw AcroForm field name (used as key when filling)
  label: string;         // Human-readable label derived from field name
  type: 'text' | 'checkbox' | 'select';
  options?: string[];
}

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
  /**
   * Pre-filled field values from a previous completion of this form.
   * Used when the user clicks "Renew Now" — seeds every field with the last
   * known answer so the user only needs to confirm/update changed values.
   */
  initialFormData?: Record<string, string>;
  /**
   * When true, the intro card shows a "Renewal Filing" banner indicating that
   * this form is being re-filed with pre-populated answers from the prior submission.
   */
  isRenewal?: boolean;
}

type FillerPhase =
  | "intro"
  | "pdf-loading"
  | "pdf-fallback"
  | "filling"
  | "summary"
  | "payment"
  | "redirecting";

function generateFormKey(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── OfficialFieldBadge ────────────────────────────────────────────────────────
function OfficialFieldBadge({ name }: { name: string }) {
  return (
    <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 mb-2 font-mono leading-tight">
      <span className="text-slate-300">↗</span>
      {name}
    </p>
  );
}

// ── CheckboxField ─────────────────────────────────────────────────────────────
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
function isSbaFallback(url: string | undefined): boolean {
  return !url || url.startsWith("https://www.sba.gov");
}

// ── Normalise ExtractedPdfField → FormField ───────────────────────────────────
// So the existing filling/summary phases work unchanged.
function toFormField(f: ExtractedPdfField): FormField {
  return {
    id: f.name,
    label: f.label,
    type: f.type === 'checkbox' ? 'checkbox' : f.type === 'select' ? 'select' : 'text',
    options: f.options,
    required: false,  // Don't know which fields are required on the actual PDF
  };
}

// ── Download a filled PDF from base64 ────────────────────────────────────────
function triggerPdfDownload(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FormFiller({
  template,
  location,
  onComplete,
  onDismiss,
  queueLabel,
  skipPayment,
  initialFormData,
  isRenewal,
}: FormFillerProps) {
  const [phase, setPhase] = useState<FillerPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  // Seed formData from initialFormData so renewal pre-fills all previous answers.
  const [formData, setFormData] = useState<Record<string, string>>(initialFormData ?? {});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // PDF primary flow state
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedPdfField[] | null>(null);
  const [pdfLoadError, setPdfLoadError] = useState<string>("");
  const [fillingPdf, setFillingPdf] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Active fields: extracted PDF fields (primary) or predefined template fields (fallback)
  const activeFields: FormField[] = extractedFields
    ? extractedFields.map(toFormField)
    : template.fields;

  const currentField: FormField | undefined = activeFields[currentIndex];
  const requiredFields = activeFields.filter(f => f.required);
  const progress = Math.round((currentIndex / activeFields.length) * 100);

  // Whether we're in the native PDF fill flow
  const hasPdfFill = pdfBase64 !== null && extractedFields !== null;

  useEffect(() => {
    if (phase === "filling" && currentField) {
      setCurrentAnswer(formData[currentField.id] ?? "");
      setFieldError("");
      if (currentField.type !== "select" && currentField.type !== "checkbox") {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  }, [currentIndex, phase]);

  // ── PDF extraction ────────────────────────────────────────────────────────
  const tryExtractPdf = async () => {
    setPhase("pdf-loading");
    try {
      const res = await fetch("/api/form/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl: template.officialFormPdfUrl }),
      });
      if (!res.ok) throw new Error(`Extract API returned ${res.status}`);
      const data = await res.json() as
        | { canAutoFill: true; fields: ExtractedPdfField[]; pdfBase64: string }
        | { canAutoFill: false; reason: string };

      if (data.canAutoFill && data.fields.length > 0) {
        setExtractedFields(data.fields);
        setPdfBase64(data.pdfBase64);
        setCurrentIndex(0);
        setPhase("filling");
      } else {
        setPdfLoadError(
          (data as { canAutoFill: false; reason: string }).reason ?? "no_fields"
        );
        setPhase("pdf-fallback");
      }
    } catch {
      setPdfLoadError("network_error");
      setPhase("pdf-fallback");
    }
  };

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
    if (currentIndex < activeFields.length - 1) {
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
    if (currentIndex < activeFields.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setPhase("summary");
    }
  };

  const handleEditField = (index: number) => {
    setCurrentIndex(index);
    setPhase("filling");
  };

  // ── Native PDF fill + download ────────────────────────────────────────────
  const downloadFilledPdf = async (): Promise<boolean> => {
    if (!pdfBase64) return false;
    setFillingPdf(true);
    try {
      const res = await fetch("/api/form/fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64, fieldValues: formData }),
      });
      if (!res.ok) return false;
      const { filledPdfBase64 } = await res.json() as { filledPdfBase64: string };
      const filename = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_filled.pdf`;
      triggerPdfDownload(filledPdfBase64, filename);
      return true;
    } catch {
      return false;
    } finally {
      setFillingPdf(false);
    }
  };

  // ── Payment ──────────────────────────────────────────────────────────────
  const handleInitiatePayment = async () => {
    setPaymentError("");
    setPhase("redirecting");

    const formKey = generateFormKey();
    const payload = { formId: template.id, formData, location };
    try {
      localStorage.setItem(`regbot_form_${formKey}`, JSON.stringify(payload));
      // Stash the raw PDF bytes so payment-success can fill natively
      if (pdfBase64) {
        localStorage.setItem(`regbot_form_${formKey}__pdf`, pdfBase64);
      }
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
      const { url } = await res.json() as { url: string };
      if (!url) throw new Error("No checkout URL returned");

      onComplete(formData, template);
      window.location.href = url;
    } catch {
      localStorage.removeItem(`regbot_form_${formKey}`);
      localStorage.removeItem(`regbot_form_${formKey}__pdf`);
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

          {isRenewal && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-3">
              <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-800">
                <strong>Renewal filing</strong> — your previous answers have been pre-filled.
                Review each field and update anything that has changed since your last submission.
              </p>
            </div>
          )}
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

          {template.officialFormPdfUrl ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700">
              {skipPayment ? (
                <>
                  <strong>How it works:</strong> Answer {template.fields.length} questions and review
                  your answers. RegPulse will attempt to fill the official government PDF directly.
                  Your completed form is included in your compliance packet — government filing fees
                  are paid separately to the issuing agency.
                </>
              ) : (
                <>
                  <strong>How it works:</strong> Answer {template.fields.length} questions, review
                  your answers, then pay a one-time $5 RegPulse completion fee. RegPulse will attempt
                  to fill the official government PDF directly and download it — government filing fees
                  are paid separately to the issuing agency.
                </>
              )}
            </div>
          ) : (
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
                  answers, then pay a one-time $5 RegPulse completion fee. Your filled PDF downloads
                  automatically — government filing fees are paid separately to the issuing agency.
                </>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={template.officialFormPdfUrl ? tryExtractPdf : () => setPhase("filling")}
            >
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

  // ── PDF LOADING ───────────────────────────────────────────────────────────
  if (phase === "pdf-loading") {
    return (
      <div className="border-t bg-white">
        <div className="max-w-2xl mx-auto p-5 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="font-semibold text-slate-800 mb-1">Fetching the official form…</p>
          <p className="text-sm text-slate-500">
            Downloading the latest PDF from the government source and reading its fields.
          </p>
        </div>
      </div>
    );
  }

  // ── PDF FALLBACK ──────────────────────────────────────────────────────────
  if (phase === "pdf-fallback") {
    const rawPortalUrl = template.submitPortalUrl ?? template.submitUrl;
    const portalUrl    = isSbaFallback(rawPortalUrl) ? null : rawPortalUrl;

    return (
      <div className="border-t bg-white">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 leading-tight">Can&apos;t auto-fill this form</p>
                <p className="text-xs text-slate-500 mt-0.5">{template.name}</p>
              </div>
            </div>
            <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-900 leading-relaxed">
            <p className="mb-3">
              We couldn&apos;t auto-fill this form inside the app. Some government forms are designed
              to only be submitted through their official website or use a format that can&apos;t be
              filled programmatically.
            </p>
            <p className="font-semibold mb-2">Here&apos;s the simplest way to finish and submit it:</p>
            <ol className="space-y-2.5 list-none">
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
                <span>
                  <strong>Download the blank form</strong> — We&apos;ve already prepared it for you.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
                <span>Open the downloaded PDF on your computer.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">3</span>
                <span>Copy your answers from the chat above and paste them into the form.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">4</span>
                <span>
                  Save the completed form and submit it directly on the official government website.
                </span>
              </li>
            </ol>

            {portalUrl && (
              <div className="mt-3 pt-3 border-t border-amber-300">
                <p className="text-xs font-semibold text-amber-800 mb-1">Official submission link:</p>
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 underline underline-offset-2 break-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {portalUrl}
                </a>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 mb-4 italic">
            Would you like me to walk you through the exact fields you need to fill, or answer any
            questions while you complete it?
          </p>

          <div className="flex gap-2 flex-wrap">
            {template.officialFormPdfUrl && (
              <Button asChild className="flex-1">
                <a href={template.officialFormPdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download Blank Form
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Walk through using predefined template fields
                setExtractedFields(null);
                setPdfBase64(null);
                setCurrentIndex(0);
                setPhase("filling");
              }}
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              Walk Me Through the Fields
            </Button>
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
              Question {currentIndex + 1} of {activeFields.length}
              {hasPdfFill && (
                <span className="ml-2 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                  PDF Auto-Fill
                </span>
              )}
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
            <label className="block text-sm font-semibold text-slate-800 mb-0.5">
              {currentField.label}
              {!currentField.required && (
                <span className="ml-2 text-xs font-normal text-slate-400">(optional)</span>
              )}
            </label>

            {currentField.officialFieldName && (
              <OfficialFieldBadge name={currentField.officialFieldName} />
            )}

            {currentField.hint && (
              <p className="text-xs text-slate-500 mb-2">{currentField.hint}</p>
            )}

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
              {currentIndex < activeFields.length - 1 ? (
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

    const handleSaveOrPay = async () => {
      if (skipPayment) {
        if (hasPdfFill) {
          await downloadFilledPdf();
        }
        onComplete(formData, template);
      } else {
        setPhase("payment");
      }
    };

    return (
      <div className="border-t bg-white max-h-[420px] overflow-y-auto">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-slate-900">Review Your Answers</p>
              {hasPdfFill && (
                <p className="text-xs text-green-600 mt-0.5">
                  ✓ RegPulse will fill the official government PDF with these answers
                </p>
              )}
            </div>
            <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-0 mb-5 border rounded-xl overflow-hidden">
            {activeFields.map((field, i) => (
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

          <Button
            className={`w-full ${skipPayment ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            onClick={handleSaveOrPay}
            disabled={fillingPdf}
          >
            {fillingPdf ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating filled PDF…</>
            ) : skipPayment ? (
              hasPdfFill ? (
                <><Download className="h-4 w-4 mr-2" />{queueLabel ? "Download & Continue →" : "Download Filled PDF ✓"}</>
              ) : (
                <><CheckCircle className="h-4 w-4 mr-2" />{queueLabel ? "Save & Continue →" : "Save Form ✓"}</>
              )
            ) : (
              <><CreditCard className="h-4 w-4 mr-2" />Proceed to Download — $5 fee</>
            )}
          </Button>
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
                  RegPulse Form Completion — {template.name.split("(")[0].trim()}
                </span>
                <span className="font-semibold text-slate-900">$5.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  Includes: {hasPdfFill ? "Filled government PDF download" : "PDF generation"}, submission instructions, field review
                </span>
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
            Secure payment via Stripe. Your card details are never stored by RegPulse.
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
