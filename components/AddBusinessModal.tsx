"use client";

/**
 * Mobile responsiveness overhaul — vMobile
 * - Overlay: px-4 already set; modal uses max-w-lg which fits narrow phones.
 * - "Existing Business" tab body: px-6 → px-4 sm:px-6, py-5 unchanged.
 * - "Starting New" tab body: px-6 → px-4 sm:px-6.
 *
 * AddBusinessModal
 *
 * Two-tab modal for adding businesses to the RegPulse compliance dashboard:
 *
 * "Starting New" tab  — guides the user to start a chat and save from there.
 * "Existing Business" tab — form: name, location, industry, existing permits.
 *   Selected permits are added as "in-progress" items (v61: changed from "done" to
 *   prevent false 100% health scores on unverified pre-existing claims). Renewal dates
 *   are pre-calculated from getSuggestedRenewalDate(). The business is saved immediately
 *   and set as the active business profile.
 *
 * Props:
 *   onAdd   — called with the fully built SavedBusiness; parent handles persistence.
 *   onClose — called when the modal should close (× button or Cancel).
 *   onStartChat — called when the user clicks "Start Chat" in the "Starting New" tab.
 */

import { useState } from "react";
import { X as XIcon, Building2, MessageSquare, CheckCircle2, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLocaleFormTemplate, getSuggestedRenewalDate } from "@/lib/formTemplates";
import type { SavedBusiness } from "@/lib/regbot-types";
import type { ChecklistItem } from "@/lib/checklist";

// ── Industry definitions ──────────────────────────────────────────────────────

interface Industry {
  value: string;
  label: string;
  permitIds: string[];
}

const INDUSTRIES: Industry[] = [
  {
    value: "food-truck",
    label: "Food Truck / Mobile Food Vendor",
    permitIds: ["mobile-food-vendor", "food-service-permit", "business-license", "business-registration"],
  },
  {
    value: "restaurant",
    label: "Restaurant / Food Service",
    permitIds: ["food-service-permit", "business-license", "business-registration", "sales-tax-registration"],
  },
  {
    value: "home-based",
    label: "Home-Based Business",
    permitIds: ["home-occupation-permit", "business-license", "fictitious-name", "business-registration"],
  },
  {
    value: "retail",
    label: "Retail Store",
    permitIds: ["business-license", "business-registration", "sales-tax-registration", "fictitious-name"],
  },
  {
    value: "ecommerce",
    label: "Online / E-commerce",
    permitIds: ["business-registration", "ein-application", "sales-tax-registration"],
  },
  {
    value: "services",
    label: "Service Business (Consulting, Freelance)",
    permitIds: ["business-registration", "fictitious-name", "ein-application"],
  },
  {
    value: "construction",
    label: "Construction / Contractor",
    permitIds: ["business-license", "business-registration", "ein-application"],
  },
  {
    value: "healthcare",
    label: "Healthcare / Wellness",
    permitIds: ["business-license", "business-registration", "ein-application"],
  },
  {
    value: "other",
    label: "Other",
    permitIds: ["business-license", "business-registration"],
  },
];

// ── Permit display labels ─────────────────────────────────────────────────────

const PERMIT_LABELS: Record<string, string> = {
  "mobile-food-vendor":    "Mobile Food Vendor Permit",
  "food-service-permit":   "Food Service / Health Permit",
  "business-license":      "Business License (City/County)",
  "business-registration": "Business Entity Registration (LLC/Corp/DBA)",
  "sales-tax-registration":"Sales Tax Registration",
  "fictitious-name":       "Fictitious Name / DBA Registration",
  "home-occupation-permit":"Home Occupation Permit",
  "ein-application":       "Federal Employer ID Number (EIN)",
};

// ── Props ────────────────────────────────────────────────────────────────────

interface AddBusinessModalProps {
  onAdd: (biz: SavedBusiness) => void;
  onClose: () => void;
  onStartChat: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AddBusinessModal({ onAdd, onClose, onStartChat }: AddBusinessModalProps) {
  const [tab, setTab] = useState<"new" | "existing">("existing");

  // Form state
  const [bizName, setBizName]       = useState("");
  const [location, setLocation]     = useState("");
  const [industry, setIndustry]     = useState<string>("");
  const [selectedPermits, setSelectedPermits] = useState<Set<string>>(new Set());
  const [nameError, setNameError]   = useState("");
  const [locError, setLocError]     = useState("");
  const [saving, setSaving]         = useState(false);

  // Suggested permit IDs from selected industry
  const industryPermitIds: string[] =
    INDUSTRIES.find(i => i.value === industry)?.permitIds ?? [];

  // When industry changes, auto-check all its permits
  const handleIndustryChange = (val: string) => {
    setIndustry(val);
    const ids = INDUSTRIES.find(i => i.value === val)?.permitIds ?? [];
    setSelectedPermits(new Set(ids));
  };

  const togglePermit = (id: string) => {
    setSelectedPermits(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // All permit IDs to show: union of industry suggestions + always-visible core set
  const ALL_PERMIT_IDS = [
    "mobile-food-vendor",
    "food-service-permit",
    "business-license",
    "business-registration",
    "sales-tax-registration",
    "fictitious-name",
    "home-occupation-permit",
    "ein-application",
  ];
  // Show industry suggestions first, then the rest
  const displayPermitIds = [
    ...industryPermitIds,
    ...ALL_PERMIT_IDS.filter(id => !industryPermitIds.includes(id)),
  ];

  const handleSubmit = () => {
    let valid = true;
    if (!bizName.trim()) { setNameError("Business name is required."); valid = false; }
    else setNameError("");
    if (!location.trim()) { setLocError("Location is required."); valid = false; }
    else setLocError("");
    if (!valid) return;

    setSaving(true);

    const now      = new Date().toISOString();
    const locStr   = location.trim();
    const permitIds = [...selectedPermits];

    // Build checklist items from selected permits
    const checklist: ChecklistItem[] = permitIds.map(formId => {
      const tpl = getLocaleFormTemplate(formId, locStr);
      const renewalDate = getSuggestedRenewalDate(formId, locStr, now) ?? undefined;
      return {
        id:          `pre-${formId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text:        tpl ? tpl.name : (PERMIT_LABELS[formId] ?? formId),
        fee:         tpl?.fee,
        // v61 — use "in-progress" instead of "done" so self-reported permits don't
        // inflate the health score to 100%. User can mark as done after verifying.
        status:      "in-progress" as const,
        formId,
        createdAt:   now,
        renewalDate,
        completedVia: "Self-reported — verify with issuing agency and update status",
      };
    });

    const totalForms = checklist.length;
    // v61 — items are now "in-progress"; verified done is 0 until user confirms them
    const doneForms  = 0;
    const healthScore = 0;

    const biz: SavedBusiness = {
      id:                  `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:                bizName.trim(),
      location:            locStr,
      savedAt:             now,
      lastChecked:         now,
      checklist,
      completedForms:      undefined,
      healthScore,
      totalForms,
      completedFormsCount: doneForms,
      businessType:        industry || undefined,
      isPreExisting:       true,
      existingPermits:     permitIds,
    };

    setSaving(false);
    onAdd(biz);
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Add a Business</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(["existing", "new"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "existing" ? "Existing Business" : "Starting New"}
            </button>
          ))}
        </div>

        {/* ── "Starting New" tab ─────────────────────────────────────────────── */}
        {tab === "new" && (
          <div className="px-4 sm:px-6 py-6 space-y-4">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <MessageSquare className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  Use the AI chat to build your checklist
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tell RegPulse what kind of business you are starting and where, and it will
                  generate a hyper-local compliance checklist. Once your forms are identified,
                  save the checklist under your business name.
                </p>
              </div>
            </div>

            <ol className="space-y-3 pl-1">
              {[
                "Describe your business and location in the chat",
                "RegPulse will list all required permits and forms",
                'Complete forms with AI, then click "Save" to create your profile',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <Button
              className="w-full"
              onClick={() => { onClose(); onStartChat(); }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start a New Chat
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* ── "Existing Business" tab ───────────────────────────────────────── */}
        {tab === "existing" && (
          <div className="px-4 sm:px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Miami Food Truck, Jane's Bakery"
                value={bizName}
                onChange={e => setBizName(e.target.value)}
                className={nameError ? "border-red-400" : ""}
              />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location <span className="text-red-500">*</span>
                </span>
              </label>
              <Input
                placeholder="City, ST or ZIP (e.g. Austin, TX or 78201)"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className={locError ? "border-red-400" : ""}
              />
              {locError && <p className="text-red-500 text-xs mt-1">{locError}</p>}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Industry / Business Type
              </label>
              <select
                value={industry}
                onChange={e => handleIndustryChange(e.target.value)}
                className="w-full text-sm h-9 border border-slate-200 rounded-lg px-3 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-slate-700"
              >
                <option value="">Select your industry…</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
              {industry && (
                <p className="text-[10px] text-blue-600 mt-1">
                  ✓ Pre-selected common permits for this business type — adjust as needed
                </p>
              )}
            </div>

            {/* Existing Permits */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Permits / Registrations You Already Have
                </label>
                <span className="text-[10px] text-slate-400">
                  {selectedPermits.size} selected
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                These will be added to your compliance checklist as <strong>completed</strong> items
                with renewal dates. Verify they are current with the issuing agency.
              </p>
              <div className="space-y-1.5 rounded-xl border border-slate-100 overflow-hidden">
                {displayPermitIds.map(id => {
                  const isSuggested = industryPermitIds.includes(id);
                  const isChecked   = selectedPermits.has(id);
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors border-b border-slate-50 last:border-none ${
                        isChecked ? "bg-blue-50" : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermit(id)}
                        className="accent-blue-600 h-3.5 w-3.5 shrink-0"
                      />
                      <span className="flex-1 text-xs text-slate-700 leading-snug">
                        {PERMIT_LABELS[id] ?? id}
                      </span>
                      {isSuggested && (
                        <span className="shrink-0 text-[9px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1 py-0.5">
                          suggested
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
              <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-amber-600" />
              Selected permits will be marked as <strong>Done</strong> with suggested renewal dates.
              RegPulse will alert you before they expire. Always verify status with the issuing agency.
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                ) : (
                  <><Building2 className="h-4 w-4 mr-2" /> Add Business</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
