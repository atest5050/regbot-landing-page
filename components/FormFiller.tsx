// v60 — Real PDF pre-filling engine with actual government form templates
// Changes from v59:
// - Added onSaveDocument prop: called with (filename, base64) after PDF generation so the
//   parent (chat/page.tsx) can attach the completed file to the active business profile and
//   show it on the matching form card with a green "Completed" badge and the real filename.
// - generateFormPdf (jsPDF) is now the universal fallback: if native AcroForm fill succeeds
//   it is used; otherwise the structured jsPDF PDF is generated automatically — the user
//   always gets a downloadable filled PDF, never just a "Save Form" with no output.
// - handleSaveOrPay unified: single async path that (1) attempts native fill, (2) falls back
//   to jsPDF, (3) triggers download, (4) calls onSaveDocument, (5) calls onComplete.
// - Summary CTA always reads "Generate & Download Filled PDF" to signal real output.
// - All v59 features preserved: section progress bar, profile auto-fill, skip conditions,
//   renewal mode, payment flow, queue mode, PDF extract flow, OfficialFieldBadge.

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight, ChevronLeft, CheckCircle, X,
  FileText, ExternalLink, CreditCard, Loader2, Lock, Download,
  AlertCircle, Sparkles,
} from "lucide-react";
import type { FormTemplate, FormField } from "@/lib/formTemplates";
import { generateFormPdf } from "@/lib/generateFormPdf";

// ── Extracted PDF field shape (returned by /api/form/extract) ─────────────────
interface ExtractedPdfField {
  name: string;          // Raw AcroForm field name (used as key when filling)
  label: string;         // Human-readable label derived from field name
  type: 'text' | 'checkbox' | 'select';
  options?: string[];
}

// ── Business profile hint — lightweight shape for auto-fill ───────────────────
export interface BusinessProfileHint {
  name?: string;
  location?: string;
  businessType?: string;
  ownerName?: string;
  ein?: string;
  phone?: string;
  email?: string;
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
  /**
   * v59 — Business profile hint for auto-filling known fields.
   * When provided, field IDs matching the PROFILE_FIELD_MAP are seeded automatically.
   */
  businessProfile?: BusinessProfileHint | null;
  /**
   * v60 — Called after the filled PDF is generated and downloaded.
   * Receives the filename and raw base64 string so the parent can:
   *   - Attach the PDF to the active business profile
   *   - Update the matching form card with a "Completed" badge + filename
   *   - Optionally upload to Supabase Storage
   */
  onSaveDocument?: (filename: string, base64: string) => void;
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

// ── Profile field map — maps form field IDs to BusinessProfileHint keys ───────
// When a form field ID appears here, it is seeded from the corresponding profile
// value (when available) before the user starts the Q&A session.
const PROFILE_FIELD_MAP: Record<string, keyof BusinessProfileHint> = {
  // Business name fields
  businessName:       'name',
  legalName:          'name',
  fictitiousName:     'name',  // pre-fill as a starting point; user may override
  // Address / location fields
  businessAddress:    'location',
  principalAddress:   'location',
  physicalAddress:    'location',
  businessLocation:   'location',
  homeAddress:        'location',
  // Business type
  businessType:       'businessType',
  // Owner
  ownerFullName:      'ownerName',
  ownerName:          'ownerName',
  responsiblePartyName: 'ownerName',
  // EIN
  fein:               'ein',
  ein:                'ein',
  // Contact
  businessPhone:      'phone',
  businessEmail:      'email',
};

// ── Form step sections — groups field IDs into named sections per form ─────────
// Used to display "Section Name — Question N of M" progress during the Q&A phase.
// Fields not listed in any section fall through to "Details".
const FORM_STEP_SECTIONS: Record<string, Array<{ label: string; fieldIds: string[] }>> = {
  'business-registration': [
    { label: 'Entity Details',       fieldIds: ['entityType', 'businessName', 'businessPurpose', 'numMembers'] },
    { label: 'Principal Address',    fieldIds: ['principalAddress', 'registeredAgentName', 'registeredAgentAddress'] },
    { label: 'Contact Information',  fieldIds: ['ownerFullName', 'businessEmail', 'businessPhone'] },
  ],
  'business-license': [
    { label: 'Business Details',     fieldIds: ['businessName', 'businessType', 'homeBasedOrCommercial', 'openingDate'] },
    { label: 'Location',             fieldIds: ['businessAddress'] },
    { label: 'Owner Information',    fieldIds: ['ownerFullName', 'businessPhone', 'businessEmail'] },
    { label: 'Operations',           fieldIds: ['numEmployees', 'businessDescription'] },
  ],
  'fictitious-name': [
    { label: 'Fictitious Name',      fieldIds: ['fictitiousName', 'businessType', 'businessAddress'] },
    { label: 'Owner Information',    fieldIds: ['ownerFullName', 'ownerAddress', 'fein'] },
  ],
  'ein-application': [
    { label: 'Legal Entity',         fieldIds: ['legalName', 'tradeNameDBA', 'entityType', 'stateOfFormation', 'formationDate'] },
    { label: 'Business Location',    fieldIds: ['businessAddress', 'mailingAddress', 'county'] },
    { label: 'Business Activity',    fieldIds: ['businessPurpose', 'primaryActivity', 'numEmployees', 'firstWageDate', 'taxYearEnd'] },
    { label: 'Responsible Party',    fieldIds: ['responsiblePartyName', 'responsiblePartySSN', 'responsiblePartyTitle'] },
  ],
  'mobile-food-vendor': [
    { label: 'Vehicle Information',  fieldIds: ['vehicleVIN', 'vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleLicensePlate'] },
    { label: 'Business & Owner',     fieldIds: ['businessName', 'ownerName', 'mailingAddress', 'businessPhone'] },
    { label: 'Operations',           fieldIds: ['foodTypes', 'operatingHours', 'operatingArea'] },
    { label: 'Commissary',           fieldIds: ['commissaryName', 'commissaryAddress', 'commissaryLicenseNumber'] },
    { label: 'Insurance & Permits',  fieldIds: ['driverLicenseNumber', 'insuranceCarrier', 'insurancePolicyNumber', 'insuranceExpiry'] },
  ],
  'food-service-permit': [
    { label: 'Establishment Info',   fieldIds: ['businessName', 'physicalAddress', 'ownerName'] },
    { label: 'Operations',           fieldIds: ['seatingCapacity', 'foodServiceType', 'openingDate', 'operatingHours'] },
    { label: 'Contact & Owner',      fieldIds: ['businessPhone', 'businessEmail', 'ownerAddress'] },
  ],
  'sales-tax-registration': [
    { label: 'Business Information', fieldIds: ['businessName', 'businessAddress', 'fein', 'businessType'] },
    { label: 'Owner Details',        fieldIds: ['ownerName', 'ownerAddress'] },
    { label: 'Sales Activity',       fieldIds: ['businessDescription', 'startDate', 'estimatedMonthlySales', 'sellsPhysicalGoods'] },
  ],
  'home-occupation-permit': [
    { label: 'Property & Owner',     fieldIds: ['ownerFullName', 'homeAddress', 'ownershipType', 'ownerPhone'] },
    { label: 'Business Details',     fieldIds: ['businessName', 'businessType', 'businessDescription'] },
    { label: 'Operations',           fieldIds: ['clientVisits', 'nonResidentEmployees', 'externalSigns', 'equipmentOrVehicles', 'storageOfInventory'] },
  ],
};

// ── Conditional skip rules — field ID → condition that returns true = skip ────
// When a condition returns true, that field is skipped during the Q&A phase.
type SkipCondition = (formData: Record<string, string>) => boolean;
const FIELD_SKIP_CONDITIONS: Record<string, SkipCondition> = {
  // EIN: skip "first wage date" if no employees
  firstWageDate: (d) => {
    const emp = (d.numEmployees ?? "").toLowerCase();
    return emp === "0" || emp === "none" || emp === "no";
  },
  // Business license: skip home business description if not home-based
  homeBusinessDescription: (d) =>
    d.homeBasedOrCommercial !== undefined &&
    d.homeBasedOrCommercial !== "Home-based",
  // Home occupation: skip client visits for online-only
  clientVisits: (d) =>
    d.businessType !== undefined &&
    d.businessType.toLowerCase().includes("online"),
  // Mobile food vendor: skip commissary fields if business says no commissary needed
  commissaryLicenseNumber: (d) =>
    (d.commissaryName ?? "").trim().length === 0,
};

// ── Section helpers ───────────────────────────────────────────────────────────
function getSectionForField(formId: string, fieldId: string): string | null {
  const sections = FORM_STEP_SECTIONS[formId];
  if (!sections) return null;
  for (const s of sections) {
    if (s.fieldIds.includes(fieldId)) return s.label;
  }
  return null;
}

function getSectionIndexForField(formId: string, fieldId: string): number {
  const sections = FORM_STEP_SECTIONS[formId];
  if (!sections) return 0;
  const idx = sections.findIndex(s => s.fieldIds.includes(fieldId));
  return Math.max(0, idx);
}

function getTotalSections(formId: string): number {
  return FORM_STEP_SECTIONS[formId]?.length ?? 1;
}

// ── Profile auto-fill helper ─────────────────────────────────────────────────
// Returns a partial formData pre-seeded from the business profile hint.
function buildProfileSeed(
  fields: FormField[],
  profile: BusinessProfileHint | null | undefined,
): Record<string, string> {
  if (!profile) return {};
  const seed: Record<string, string> = {};
  for (const field of fields) {
    const profileKey = PROFILE_FIELD_MAP[field.id];
    if (!profileKey) continue;
    const value = profile[profileKey];
    if (value && typeof value === "string" && value.trim().length > 0) {
      seed[field.id] = value.trim();
    }
  }
  return seed;
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
function toFormField(f: ExtractedPdfField): FormField {
  return {
    id: f.name,
    label: f.label,
    type: f.type === 'checkbox' ? 'checkbox' : f.type === 'select' ? 'select' : 'text',
    options: f.options,
    required: false,
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
  businessProfile,
  onSaveDocument,
}: FormFillerProps) {
  const [phase, setPhase] = useState<FillerPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Seed formData: priority = initialFormData (renewal) > profile auto-fill > empty
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (initialFormData && Object.keys(initialFormData).length > 0) return initialFormData;
    return buildProfileSeed(template.fields, businessProfile);
  });

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // PDF primary flow state
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedPdfField[] | null>(null);
  const [pdfLoadError, setPdfLoadError] = useState<string>("");
  const [fillingPdf, setFillingPdf] = useState(false);

  // v60 — generated PDF output (set after generation so we know a real file was produced)
  const [generatedFilename, setGeneratedFilename] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Active fields: extracted PDF fields (primary) or predefined template fields (fallback)
  // Apply skip conditions to filter out irrelevant fields based on current answers.
  const activeFields: FormField[] = useMemo(() => {
    const base = extractedFields ? extractedFields.map(toFormField) : template.fields;
    // When using native PDF fields, skip conditions don't apply (field IDs are AcroForm names)
    if (extractedFields) return base;
    return base.filter(f => {
      const condition = FIELD_SKIP_CONDITIONS[f.id];
      return !condition || !condition(formData);
    });
  }, [extractedFields, template.fields, formData]);

  const currentField: FormField | undefined = activeFields[currentIndex];
  const requiredFields = activeFields.filter(f => f.required);
  const progress = activeFields.length > 0
    ? Math.round(((currentIndex + 1) / activeFields.length) * 100)
    : 0;

  // Whether we're in the native PDF fill flow
  const hasPdfFill = pdfBase64 !== null && extractedFields !== null;

  // Section-aware progress label
  const currentSection = currentField
    ? getSectionForField(template.id, currentField.id)
    : null;
  const currentSectionIndex = currentField
    ? getSectionIndexForField(template.id, currentField.id)
    : 0;
  const totalSections = getTotalSections(template.id);

  // Count auto-filled fields from profile (for intro banner)
  const profileSeedCount = useMemo(() => {
    if (isRenewal || !businessProfile) return 0;
    const seed = buildProfileSeed(template.fields, businessProfile);
    return Object.keys(seed).length;
  }, [template.fields, businessProfile, isRenewal]);

  useEffect(() => {
    if (phase === "filling" && currentField) {
      setCurrentAnswer(formData[currentField.id] ?? "");
      setFieldError("");
      if (currentField.type !== "select" && currentField.type !== "checkbox") {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  }, [currentIndex, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-apply skip conditions when formData changes — advance past now-skipped fields
  useEffect(() => {
    if (phase !== "filling") return;
    const field = activeFields[currentIndex];
    if (!field) return;
    // If current index is now out of bounds (fields array shrank), go to summary
    if (currentIndex >= activeFields.length) {
      setPhase("summary");
    }
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const updatedData = { ...formData, [currentField.id]: currentAnswer.trim() };
    setFormData(updatedData);
    setFieldError("");

    // Find next non-skipped field after this index
    let nextIndex = currentIndex + 1;
    while (nextIndex < activeFields.length) {
      const nextField = activeFields[nextIndex];
      const cond = FIELD_SKIP_CONDITIONS[nextField.id];
      if (!cond || !cond(updatedData)) break;
      nextIndex++;
    }

    if (nextIndex < activeFields.length) {
      setCurrentIndex(nextIndex);
    } else {
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

  // ── v60: unified PDF generation — native AcroForm fill → jsPDF fallback ──
  // Returns the base64 string on success, or null if both paths fail.
  const buildFilledPdf = async (): Promise<{ base64: string; filename: string } | null> => {
    const safeFilename = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_filled.pdf`;

    // 1. Try native AcroForm fill (only available after extract succeeded)
    if (pdfBase64) {
      try {
        const res = await fetch("/api/form/fill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64, fieldValues: formData }),
        });
        if (res.ok) {
          const { filledPdfBase64 } = await res.json() as { filledPdfBase64: string };
          if (filledPdfBase64) return { base64: filledPdfBase64, filename: safeFilename };
        }
      } catch { /* fall through */ }
    }

    // 2. jsPDF structured PDF fallback — always produces a downloadable output
    try {
      const base64 = await generateFormPdf(template, formData, location);
      if (base64) return { base64, filename: safeFilename };
    } catch { /* ignore */ }

    return null;
  };

  // ── Payment ──────────────────────────────────────────────────────────────
  const handleInitiatePayment = async () => {
    setPaymentError("");
    setPhase("redirecting");

    const formKey = generateFormKey();
    const payload = { formId: template.id, formData, location };
    try {
      localStorage.setItem(`regbot_form_${formKey}`, JSON.stringify(payload));
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
    const questionCount = activeFields.length;
    const requiredCount = requiredFields.length;

    return (
      <div className="border-t bg-white">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0B1E3F]/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-[#0B1E3F]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">
                  {queueLabel ? queueLabel : "Form Assistant"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 leading-tight">{template.name}</p>
                  {template.officialFormNumber && (
                    <span className="text-[10px] font-semibold text-[#0B1E3F] bg-[#0B1E3F]/10 border border-[#0B1E3F]/20 rounded px-1.5 py-0.5 shrink-0">
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

          {!isRenewal && profileSeedCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>{profileSeedCount} field{profileSeedCount !== 1 ? 's' : ''} auto-filled</strong> from your business profile.
                Just confirm or update each answer as you go.
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
                <p className="font-semibold text-[#00C2CB] text-sm">$5.00</p>
              </div>
            )}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Questions</p>
              <p className="font-semibold text-slate-800 text-sm">
                {questionCount} ({requiredCount} required)
              </p>
            </div>
          </div>

          {totalSections > 1 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                Form Sections
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(FORM_STEP_SECTIONS[template.id] ?? []).map((s, i) => (
                  <span
                    key={s.label}
                    className="text-[10px] font-medium px-2 py-1 rounded-full bg-[#0B1E3F]/8 text-[#0B1E3F] border border-[#0B1E3F]/15"
                  >
                    {i + 1}. {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
              Documents You Will Need
            </p>
            <ul className="space-y-1">
              {template.requiredDocs.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C2CB]" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          {template.officialFormPdfUrl ? (
            <div className="bg-[#0B1E3F]/5 border border-[#0B1E3F]/10 rounded-lg p-3 mb-4 text-xs text-[#0B1E3F]">
              {skipPayment ? (
                <>
                  <strong>How it works:</strong> Answer {questionCount} questions
                  {profileSeedCount > 0 ? ` (${profileSeedCount} pre-filled from your profile)` : ""} and
                  review your answers. RegPulse will attempt to fill the official government PDF directly.
                  Your completed form is included in your compliance packet — government filing fees are
                  paid separately to the issuing agency.
                </>
              ) : (
                <>
                  <strong>How it works:</strong> Answer {questionCount} questions, review your answers,
                  then pay a one-time $5 RegPulse completion fee. RegPulse will attempt to fill the
                  official government PDF directly and download it — government filing fees are paid
                  separately to the issuing agency.
                </>
              )}
            </div>
          ) : (
            <div className="bg-[#0B1E3F]/5 border border-[#0B1E3F]/10 rounded-lg p-3 mb-4 text-xs text-[#0B1E3F]">
              {skipPayment ? (
                <>
                  <strong>How it works:</strong> Answer {questionCount} questions
                  {profileSeedCount > 0 ? ` (${profileSeedCount} pre-filled from your profile)` : ""} and
                  review your answers. Your filled form is included in your compliance packet — government
                  filing fees are paid separately to the issuing agency.
                </>
              ) : (
                <>
                  <strong>How it works:</strong> Answer {questionCount} questions, review your answers,
                  then pay a one-time $5 RegPulse completion fee. Your filled PDF downloads automatically —
                  government filing fees are paid separately to the issuing agency.
                </>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-[#0B1E3F] hover:bg-[#0B1E3F]/90"
              onClick={template.officialFormPdfUrl ? tryExtractPdf : () => setPhase("filling")}
            >
              Start — {questionCount} Questions
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
          <Loader2 className="h-8 w-8 text-[#0B1E3F] animate-spin mx-auto mb-3" />
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
              <Button asChild className="flex-1 bg-[#0B1E3F] hover:bg-[#0B1E3F]/90">
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
    const isAutoFilled = !extractedFields && !!formData[currentField.id] &&
      !!PROFILE_FIELD_MAP[currentField.id] && !isRenewal;

    // Section-aware step label
    const stepLabel = currentSection
      ? `${currentSection} — Step ${currentSectionIndex + 1} of ${totalSections}`
      : `Question ${currentIndex + 1} of ${activeFields.length}`;

    return (
      <div className="border-t bg-white">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500">{stepLabel}</span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-400">
                Question {currentIndex + 1} of {activeFields.length}
              </span>
              {hasPdfFill && (
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                  PDF Auto-Fill
                </span>
              )}
            </div>
            <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section progress bar — segmented when sections exist */}
          {totalSections > 1 && !extractedFields ? (
            <div className="flex gap-0.5 mb-5 h-1.5">
              {(FORM_STEP_SECTIONS[template.id] ?? []).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    i < currentSectionIndex
                      ? "bg-[#00C2CB]"
                      : i === currentSectionIndex
                        ? "bg-[#0B1E3F]"
                        : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-[#0B1E3F] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {isAutoFilled && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-3">
              <Sparkles className="h-3 w-3 shrink-0" />
              Auto-filled from your profile — confirm or update below
            </div>
          )}

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
                        ? "border-[#0B1E3F] bg-[#0B1E3F]/5 text-[#0B1E3F] font-medium"
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
                className={`${fieldError ? "border-red-400" : ""} ${isAutoFilled ? "border-amber-300 bg-amber-50/30" : ""}`}
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
            <Button className="flex-1 bg-[#0B1E3F] hover:bg-[#0B1E3F]/90" onClick={handleNext}>
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
        // v60 — two-step: first click generates + downloads; second click (after confirmation) calls onComplete.
        if (generatedFilename) {
          // PDF already generated — user is confirming/continuing
          onComplete(formData, template);
          return;
        }
        setFillingPdf(true);
        try {
          const result = await buildFilledPdf();
          if (result) {
            triggerPdfDownload(result.base64, result.filename);
            setGeneratedFilename(result.filename);
            onSaveDocument?.(result.filename, result.base64);
            // Stay on summary to show confirmation — user clicks again to continue
          } else {
            // PDF generation failed entirely — fall through to onComplete anyway
            onComplete(formData, template);
          }
        } finally {
          setFillingPdf(false);
        }
      } else {
        setPhase("payment");
      }
    };

    const answeredCount = activeFields.filter(f => formData[f.id]?.trim()).length;
    const autoFilledCount = !isRenewal
      ? activeFields.filter(f => {
          const pk = PROFILE_FIELD_MAP[f.id];
          return pk && formData[f.id]?.trim();
        }).length
      : 0;

    return (
      <div className="border-t bg-white max-h-[480px] overflow-y-auto">
        <div className="max-w-2xl mx-auto p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-slate-900">Review &amp; Generate PDF</p>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <p className="text-xs text-slate-500">
                  {answeredCount} of {activeFields.length} fields completed
                </p>
                {autoFilledCount > 0 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {autoFilledCount} from profile
                  </p>
                )}
                <p className="text-xs text-[#0B1E3F] flex items-center gap-1 font-medium">
                  <Download className="h-3 w-3" />
                  {hasPdfFill ? "Official form — AcroForm fill" : "RegPulse structured PDF"}
                </p>
              </div>
            </div>
            <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-0 mb-5 border rounded-xl overflow-hidden">
            {activeFields.map((field, i) => {
              const sectionLabel = getSectionForField(template.id, field.id);
              const prevField = i > 0 ? activeFields[i - 1] : null;
              const prevSection = prevField ? getSectionForField(template.id, prevField.id) : null;
              const showSectionHeader = sectionLabel && sectionLabel !== prevSection;

              return (
                <div key={field.id}>
                  {showSectionHeader && (
                    <div className="px-4 py-1.5 bg-[#0B1E3F]/5 border-b">
                      <p className="text-[10px] font-semibold text-[#0B1E3F] uppercase tracking-widest">
                        {sectionLabel}
                      </p>
                    </div>
                  )}
                  <div className="flex items-start justify-between px-4 py-2.5 border-b last:border-none bg-white hover:bg-slate-50 gap-4">
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
                    {!generatedFilename && (
                      <button
                        onClick={() => handleEditField(i)}
                        className="text-xs text-[#00C2CB] hover:underline shrink-0 pt-0.5"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800">
            <strong>Submission:</strong> {template.submitInstructions}
          </div>

          {portalUrl ? (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#0B1E3F] bg-[#0B1E3F]/5 hover:bg-[#0B1E3F]/10 border border-[#0B1E3F]/15 rounded-lg py-2 mb-4 transition-colors"
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

          {/* v60 — green confirmation banner appears after PDF downloads */}
          {generatedFilename && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3 text-xs text-green-800">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold">PDF downloaded successfully</p>
                <p className="text-green-700 font-mono mt-0.5">{generatedFilename}</p>
              </div>
            </div>
          )}
          <Button
            className="w-full bg-[#0B1E3F] hover:bg-[#0B1E3F]/90"
            onClick={handleSaveOrPay}
            disabled={fillingPdf}
          >
            {fillingPdf ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating filled PDF…</>
            ) : generatedFilename ? (
              // After generation: button becomes "Continue" / "Done"
              <><CheckCircle className="h-4 w-4 mr-2" />{queueLabel ? "Save & Continue →" : "Done — Form Saved ✓"}</>
            ) : skipPayment ? (
              <><Download className="h-4 w-4 mr-2" />{queueLabel ? "Generate PDF & Continue →" : "Generate & Download Filled PDF"}</>
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
            <div className="bg-[#0B1E3F] px-4 py-3 flex justify-between items-center">
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
              className="flex-1 bg-[#0B1E3F] hover:bg-[#0B1E3F]/90"
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
          <Loader2 className="h-8 w-8 text-[#0B1E3F] animate-spin mx-auto mb-3" />
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
