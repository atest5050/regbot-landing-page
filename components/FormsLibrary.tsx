"use client";

// FormsLibrary — v24: Large-Scale Forms Library UI Upgrade
//
// Handles the now-large library (50 states + county/city LOCAL_FORMS).
//
// Changelog:
//   v20 — initial Forms Library section in sidebar
//   v21 — localStorage download tracking + Downloaded badge
//   v22 — fullPage prop, responsive grid, larger cards
//   v23 — no UI changes (STATE_FORMS_EXPANDED data only)
//   v24 — State filter dropdown, xl:grid-cols-4, state/locality badges, tab counts
//   v25 — Learn More link fix; Upload Completed Document attach-mode flow
//   v26 — Smart Form Recommendations; saveBusinessContext; sidebar teaser
//   v27 — Federal forms audit; added W-4, W-9, 1023, 1023-EZ, DOT; 8 industry forms
//   v28 — Consistent ALL CAPS jurisdiction badges across all three render contexts
//         • categoryLabel() now returns ALL CAPS (e.g. "FEDERAL", "STATE", "LOCAL")
//         • JURISDICTION_BADGE_CLS: single shared class string for shape/size/weight
//         • Recommended section badge changed from rounded-full/text-[10px] to match
//           the main grid and sidebar (rounded-md/text-[9px]/px-1.5 py-0.5)
//         • Color scheme locked: FEDERAL→blue, STATE→indigo, LOCAL→violet
//         Fix: categoryLabel guards undefined .category (FormTemplate wizard entries
//         in ALL_FORMS have no .category field); recommendedEntries now pre-filtered
//         through isFederalForm || isStateForm so wizard entries never reach render.
//   v29 — Fix Missing EIN Application (SS-4) in Forms Library
//         Root cause was in lib/formTemplates.ts, not here: FORM_TEMPLATES was
//         spread last in ALL_FORMS, overwriting FederalFormEntry for 'ein-application'
//         with a FormTemplate that has no .category → isFederalForm() returned false
//         → filtered out of library grid and recommendedEntries entirely.
//         Fix: reversed ALL_FORMS spread order — FORM_TEMPLATES first (lowest
//         precedence), typed library collections on top. No changes needed here
//         since the existing recommendedEntries filter (isFederalForm || isStateForm)
//         already correctly excludes uncategorised FormTemplate entries.
//
// Props:
//   compact  — condensed single-column layout for the sidebar collapsible section
//   fullPage — full-page layout with state filter, 4-col grid, larger cards

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Download, ExternalLink, X, Check, ChevronDown, Sparkles, Paperclip } from "lucide-react";
import {
  ALL_FORMS,
  isFederalForm,
  isStateForm,
  markFormAsDownloaded,
  getDownloadedFormIds,
  getRecommendedForms,
  type FederalFormEntry,
  type StateFormEntry,
} from "@/lib/formTemplates";

// ── Types ─────────────────────────────────────────────────────────────────────

type LibraryEntry = FederalFormEntry | StateFormEntry;
type CategoryFilter = "all" | "federal" | "state" | "local";

// v26 — Business context stored in localStorage so the /forms page can read it
// without prop-drilling through a server component boundary.
const BUSINESS_CTX_KEY = "regbot_business_ctx";

export interface BusinessContext {
  businessType?: string;
  state?: string;   // 2-letter abbreviation
  county?: string;
  isNewBusiness?: boolean;
}

/** Write business context from chat page so /forms page recommendations work. */
export function saveBusinessContext(ctx: BusinessContext): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(BUSINESS_CTX_KEY, JSON.stringify(ctx)); } catch { /* ignore */ }
}

function loadBusinessContext(): BusinessContext {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(BUSINESS_CTX_KEY);
    return raw ? (JSON.parse(raw) as BusinessContext) : {};
  } catch { return {}; }
}

interface Props {
  /** Condensed single-column layout for sidebar display. */
  compact?: boolean;
  /**
   * v22/v24 — Full-page mode: state filter, xl:grid-cols-4, larger cards, bigger text.
   * Takes precedence over compact when both are set.
   */
  fullPage?: boolean;
  /** v26 — Optional business context for "Recommended for You" section (fullPage only). */
  businessType?: string;
  state?: string;
  county?: string;
  isNewBusiness?: boolean;
  /**
   * v32 — If provided, recommended form cards show a paperclip "Upload Completed"
   * button that triggers a file picker and calls this with the picked file + form ID.
   */
  onUploadCompletedDoc?: (file: File, formId: string) => void;
}

// ── State metadata ─────────────────────────────────────────────────────────────
// Maps the 2-letter ID prefix used in STATE_FORMS_ALL_50 to display info.
// Used to derive state abbreviation badges and to power the state filter dropdown.

interface StateInfo { abbrev: string; name: string; }

const STATE_PREFIX_MAP: Record<string, StateInfo> = {
  al: { abbrev: "AL", name: "Alabama" },
  ak: { abbrev: "AK", name: "Alaska" },
  az: { abbrev: "AZ", name: "Arizona" },
  ar: { abbrev: "AR", name: "Arkansas" },
  ca: { abbrev: "CA", name: "California" },
  co: { abbrev: "CO", name: "Colorado" },
  ct: { abbrev: "CT", name: "Connecticut" },
  de: { abbrev: "DE", name: "Delaware" },
  dc: { abbrev: "DC", name: "District of Columbia" },
  fl: { abbrev: "FL", name: "Florida" },
  ga: { abbrev: "GA", name: "Georgia" },
  hi: { abbrev: "HI", name: "Hawaii" },
  id: { abbrev: "ID", name: "Idaho" },
  il: { abbrev: "IL", name: "Illinois" },
  in: { abbrev: "IN", name: "Indiana" },
  ia: { abbrev: "IA", name: "Iowa" },
  ks: { abbrev: "KS", name: "Kansas" },
  ky: { abbrev: "KY", name: "Kentucky" },
  la: { abbrev: "LA", name: "Louisiana" },
  me: { abbrev: "ME", name: "Maine" },
  md: { abbrev: "MD", name: "Maryland" },
  ma: { abbrev: "MA", name: "Massachusetts" },
  mi: { abbrev: "MI", name: "Michigan" },
  mn: { abbrev: "MN", name: "Minnesota" },
  ms: { abbrev: "MS", name: "Mississippi" },
  mo: { abbrev: "MO", name: "Missouri" },
  mt: { abbrev: "MT", name: "Montana" },
  ne: { abbrev: "NE", name: "Nebraska" },
  nv: { abbrev: "NV", name: "Nevada" },
  nh: { abbrev: "NH", name: "New Hampshire" },
  nj: { abbrev: "NJ", name: "New Jersey" },
  nm: { abbrev: "NM", name: "New Mexico" },
  ny: { abbrev: "NY", name: "New York" },
  nc: { abbrev: "NC", name: "North Carolina" },
  nd: { abbrev: "ND", name: "North Dakota" },
  oh: { abbrev: "OH", name: "Ohio" },
  ok: { abbrev: "OK", name: "Oklahoma" },
  or: { abbrev: "OR", name: "Oregon" },
  pa: { abbrev: "PA", name: "Pennsylvania" },
  ri: { abbrev: "RI", name: "Rhode Island" },
  sc: { abbrev: "SC", name: "South Carolina" },
  sd: { abbrev: "SD", name: "South Dakota" },
  tn: { abbrev: "TN", name: "Tennessee" },
  tx: { abbrev: "TX", name: "Texas" },
  ut: { abbrev: "UT", name: "Utah" },
  vt: { abbrev: "VT", name: "Vermont" },
  va: { abbrev: "VA", name: "Virginia" },
  wa: { abbrev: "WA", name: "Washington" },
  wv: { abbrev: "WV", name: "West Virginia" },
  wi: { abbrev: "WI", name: "Wisconsin" },
  wy: { abbrev: "WY", name: "Wyoming" },
};

// Maps LOCAL_FORMS id prefixes to their parent state (for filter + badge).
// Key is the leading segment of the form ID before the first meaningful noun.
const LOCAL_ID_TO_STATE: Record<string, StateInfo & { locality: string }> = {
  "palm-beach":   { abbrev: "FL", name: "Florida",    locality: "Palm Beach Co." },
  "miami-dade":   { abbrev: "FL", name: "Florida",    locality: "Miami-Dade Co." },
  "broward":      { abbrev: "FL", name: "Florida",    locality: "Broward Co." },
  "la-county":    { abbrev: "CA", name: "California", locality: "LA County" },
  "la-city":      { abbrev: "CA", name: "California", locality: "Los Angeles" },
  "harris-county":{ abbrev: "TX", name: "Texas",      locality: "Harris Co." },
  "houston":      { abbrev: "TX", name: "Texas",      locality: "Houston" },
  "nyc":          { abbrev: "NY", name: "New York",   locality: "New York City" },
  "chicago":      { abbrev: "IL", name: "Illinois",   locality: "Chicago" },
  "cook-county":  { abbrev: "IL", name: "Illinois",   locality: "Cook Co." },
  "seattle":      { abbrev: "WA", name: "Washington", locality: "Seattle" },
  "king-county":  { abbrev: "WA", name: "Washington", locality: "King Co." },
  "phoenix":      { abbrev: "AZ", name: "Arizona",    locality: "Phoenix" },
  "maricopa":     { abbrev: "AZ", name: "Arizona",    locality: "Maricopa Co." },
  "clark-county": { abbrev: "NV", name: "Nevada",     locality: "Clark Co." },
  "atlanta":      { abbrev: "GA", name: "Georgia",    locality: "Atlanta" },
  "fulton-county":{ abbrev: "GA", name: "Georgia",    locality: "Fulton Co." },
  "philadelphia": { abbrev: "PA", name: "Pennsylvania",locality: "Philadelphia" },
  "cleveland":    { abbrev: "OH", name: "Ohio",       locality: "Cleveland" },
  "detroit":      { abbrev: "MI", name: "Michigan",   locality: "Detroit" },
  "denver":       { abbrev: "CO", name: "Colorado",   locality: "Denver" },
  "memphis":      { abbrev: "TN", name: "Tennessee",  locality: "Memphis" },
  "charlotte":    { abbrev: "NC", name: "North Carolina", locality: "Charlotte" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Collect only FederalFormEntry / StateFormEntry — skip full wizard FormTemplate entries. */
function getLibraryEntries(): LibraryEntry[] {
  return Object.values(ALL_FORMS).filter(
    (f): f is LibraryEntry => isFederalForm(f) || isStateForm(f),
  );
}

/**
 * Derive state info from a form entry's ID.
 * For STATE_FORMS_ALL_50 entries the ID starts with a 2-letter state prefix (e.g. "fl-").
 * For LOCAL_FORMS entries the ID starts with a locality prefix (e.g. "palm-beach-").
 * Returns null for federal forms and generic STATE_FORMS entries with no state prefix.
 */
function getEntryStateInfo(entry: LibraryEntry): (StateInfo & { locality?: string }) | null {
  if (isFederalForm(entry)) return null;

  const id = entry.id;

  // Try local prefix first (longer prefixes first to avoid partial matches)
  const sortedLocalKeys = Object.keys(LOCAL_ID_TO_STATE).sort((a, b) => b.length - a.length);
  for (const prefix of sortedLocalKeys) {
    if (id.startsWith(prefix + "-") || id === prefix) {
      return LOCAL_ID_TO_STATE[prefix];
    }
  }

  // Try 2-letter state prefix
  const twoLetter = id.slice(0, 2);
  if (STATE_PREFIX_MAP[twoLetter] && id[2] === "-") {
    return STATE_PREFIX_MAP[twoLetter];
  }

  return null;
}

/** Short label shown in the state/location badge on a card. */
function getStateBadgeLabel(entry: LibraryEntry): string | null {
  const info = getEntryStateInfo(entry);
  if (!info) return null;
  return (info as { locality?: string }).locality ?? info.abbrev;
}

/** Full state name used for search matching. */
function getEntryStateName(entry: LibraryEntry): string {
  return getEntryStateInfo(entry)?.name ?? "";
}

// v28 — ALL CAPS jurisdiction badge helpers
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for jurisdiction badge appearance.
// Used identically in: Recommended section · main grid · sidebar compact mode.
//
// Shape/size: text-[9px] font-bold tracking-wide border rounded-md px-1.5 py-0.5
// Colors:     FEDERAL → blue  |  STATE → indigo  |  LOCAL → violet
// Text:       always .toUpperCase() — never title case or lowercase

/**
 * Returns the jurisdiction label in ALL CAPS ("FEDERAL", "STATE", "LOCAL").
 * Guards against entries where .category is undefined — FormTemplate wizard
 * entries live in ALL_FORMS but lack the .category field; they should never
 * reach this function after the isFederalForm/isStateForm filter, but the
 * guard prevents a runtime crash if one slips through.
 */
function categoryLabel(entry: LibraryEntry): string {
  if (!entry.category) return "FORM";
  return entry.category.toUpperCase();
}

/**
 * Non-color Tailwind classes shared by every jurisdiction badge.
 * Apply alongside categoryBadgeClass() to get the full badge style.
 */
const JURISDICTION_BADGE_CLS =
  "text-[9px] font-bold tracking-wide border rounded-md px-1.5 py-0.5";

/** Color classes for the jurisdiction badge. FEDERAL=blue, STATE=indigo, LOCAL=violet. */
function categoryBadgeClass(category: string): string {
  switch (category) {
    case "federal": return "bg-blue-50 text-blue-700 border-blue-200";
    case "state":   return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "local":   return "bg-violet-50 text-violet-700 border-violet-200";
    default:        return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function stateBadgeClass(): string {
  // Neutral teal badge for state/locality labels
  return "bg-teal-50 text-teal-700 border-teal-200";
}

function renewalText(months: number): string {
  if (months === 12) return "Renews annually";
  if (months === 24) return "Renews biennially";
  if (months === 36) return "Renews every 3 yrs";
  if (months === 60) return "Renews every 5 yrs";
  if (months === 120) return "Renews every 10 yrs";
  return `Renews every ${months} mo`;
}

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: "all",     label: "All"     },
  { id: "federal", label: "Federal" },
  { id: "state",   label: "State"   },
  { id: "local",   label: "Local"   },
];

// Sorted list of states that appear in the library, for the dropdown.
const ALL_STATES_IN_LIBRARY: StateInfo[] = Object.values(STATE_PREFIX_MAP)
  .concat(
    Object.values(LOCAL_ID_TO_STATE).map(({ abbrev, name }) => ({ abbrev, name }))
  )
  .filter((v, i, arr) => arr.findIndex(x => x.abbrev === v.abbrev) === i)
  .sort((a, b) => a.name.localeCompare(b.name));

// ── Component ─────────────────────────────────────────────────────────────────

export default function FormsLibrary({
  compact = false,
  fullPage = false,
  businessType: propBusinessType,
  state: propState,
  county: propCounty,
  isNewBusiness: propIsNewBusiness,
  onUploadCompletedDoc,
}: Props) {
  const [search,        setSearch]        = useState("");
  const [category,      setCategory]      = useState<CategoryFilter>("all");
  // v24 — State filter (fullPage only)
  const [stateFilter,   setStateFilter]   = useState<string>("all");
  // v21 — Download Tracking: track downloaded form IDs in real-time
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(() => getDownloadedFormIds());
  // v32 — Keyed file input refs for per-form "Upload Completed" paperclip buttons
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // v26 — Merge prop context with localStorage context (props win if provided)
  const [savedCtx, setSavedCtx] = useState<BusinessContext>({});
  useEffect(() => { if (fullPage) setSavedCtx(loadBusinessContext()); }, [fullPage]);

  const bizType    = propBusinessType ?? savedCtx.businessType;
  const bizState   = propState        ?? savedCtx.state;
  const bizCounty  = propCounty       ?? savedCtx.county;
  const bizIsNew   = propIsNewBusiness ?? savedCtx.isNewBusiness;

  // v26 — Recommended form IDs (computed once context is resolved)
  const recommendedIds = useMemo(
    () => fullPage ? getRecommendedForms(bizType, bizState, bizCounty, bizIsNew) : [],
    [fullPage, bizType, bizState, bizCounty, bizIsNew],
  );

  // Resolved recommended entries — must be FederalFormEntry or StateFormEntry only.
  // ALL_FORMS also contains FormTemplate wizard entries (no .category field); filter
  // them out with isFederalForm/isStateForm to prevent categoryLabel crash.
  const recommendedEntries = useMemo(
    () =>
      recommendedIds
        .map(id => ALL_FORMS[id])
        .filter((f): f is FederalFormEntry | StateFormEntry =>
          !!f && (isFederalForm(f) || isStateForm(f))
        ),
    [recommendedIds],
  );

  const allEntries = useMemo(getLibraryEntries, []);

  // ── Filtering ─────────────────────────────────────────────────────────────
  // v24: search now also matches derived state name; state filter uses abbrev.

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allEntries.filter(entry => {
      // Category filter
      if (category !== "all" && entry.category !== category) return false;

      // v24 — State filter (only in fullPage mode; ignored in sidebar)
      if (fullPage && stateFilter !== "all") {
        const info = getEntryStateInfo(entry);
        if (!info || info.abbrev !== stateFilter) return false;
      }

      // Text search — name, description, state name
      if (!q) return true;
      const stateName = getEntryStateName(entry).toLowerCase();
      return (
        entry.name.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        stateName.includes(q)
      );
    });
  }, [allEntries, search, category, stateFilter, fullPage]);

  // Per-category counts (respects search + state filter, ignores category tab itself)
  const categoryCounts = useMemo(() => {
    const q = search.toLowerCase().trim();
    const counts: Record<CategoryFilter, number> = { all: 0, federal: 0, state: 0, local: 0 };
    for (const entry of allEntries) {
      // Apply search + state filter
      if (fullPage && stateFilter !== "all") {
        const info = getEntryStateInfo(entry);
        if (!info || info.abbrev !== stateFilter) continue;
      }
      if (q) {
        const stateName = getEntryStateName(entry).toLowerCase();
        const match =
          entry.name.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          stateName.includes(q);
        if (!match) continue;
      }
      counts.all++;
      if (entry.category === "federal") counts.federal++;
      else if (entry.category === "state") counts.state++;
      else if (entry.category === "local") counts.local++;
    }
    return counts;
  }, [allEntries, search, stateFilter, fullPage]);

  // ── Download handler (shared) ──────────────────────────────────────────────
  function handleDownload(id: string) {
    markFormAsDownloaded(id);
    setDownloadedIds(prev => new Set([...prev, id]));
  }

  // ── Full-page layout ───────────────────────────────────────────────────────
  if (fullPage) {
    return (
      // v24 — full-page variant: state filter, 4-col grid, prominent download CTA
      <div className="flex flex-col gap-6">

        {/* ── v26: Recommended for You ── */}
        {recommendedEntries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-700">Recommended for You</h2>
              {(bizType || bizState) && (
                <span className="text-xs text-slate-400">
                  Based on your{bizType ? ` ${bizType}` : ""}{bizState ? ` business in ${bizState}` : ""}
                </span>
              )}
            </div>
            {/* Horizontal scroll row */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {recommendedEntries.map(entry => {
                const downloaded = downloadedIds.has(entry.id);
                const isDownloadable = entry.isDownloadable && !!entry.pdfPath;
                const stateBadge = getStateBadgeLabel(entry);
                return (
                  <div
                    key={entry.id}
                    className="snap-start shrink-0 w-60 flex flex-col gap-2 bg-white rounded-xl border border-amber-200 shadow-sm p-4"
                  >
                    {/* v28 — unified jurisdiction badge (same class as grid + sidebar) */}
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex ${JURISDICTION_BADGE_CLS} ${categoryBadgeClass(entry.category)}`}>
                        {categoryLabel(entry)}
                      </span>
                      {stateBadge && (
                        <span className={`inline-flex ${JURISDICTION_BADGE_CLS} ${stateBadgeClass()}`}>
                          {stateBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">{entry.name}</p>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">{entry.description}</p>
                    <div className="flex gap-2 mt-auto pt-1">
                      {isDownloadable ? (
                        <a
                          href={entry.pdfPath!}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          onClick={() => handleDownload(entry.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          {downloaded ? <Check className="h-3 w-3" /> : <Download className="h-3 w-3" />}
                          {downloaded ? "Downloaded" : "Download"}
                        </a>
                      ) : (
                        <a
                          href={entry.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open Form
                        </a>
                      )}
                      {/* v32 — Upload Completed paperclip button */}
                      {onUploadCompletedDoc && (
                        <>
                          <button
                            title="Upload completed form"
                            onClick={() => fileInputRefs.current[entry.id]?.click()}
                            className="shrink-0 flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="file"
                            accept="application/pdf,image/*,.doc,.docx"
                            className="hidden"
                            ref={el => { fileInputRefs.current[entry.id] = el; }}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) { onUploadCompletedDoc(file, entry.id); }
                              e.target.value = "";
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Search + state filter row ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by form name, description, or state…"
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-slate-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* v24 — State filter dropdown */}
          <div className="relative shrink-0">
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="appearance-none w-full sm:w-48 pl-3 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors cursor-pointer"
              aria-label="Filter by state"
            >
              <option value="all">All States</option>
              {ALL_STATES_IN_LIBRARY.map(s => (
                <option key={s.abbrev} value={s.abbrev}>
                  {s.abbrev} — {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* ── Category tabs + result count ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                  category === tab.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs tabular-nums ${
                  category === tab.id ? "text-blue-200" : "text-slate-400"
                }`}>
                  {categoryCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          {/* v24 — result count */}
          <p className="text-sm text-slate-400 tabular-nums shrink-0">
            Showing <span className="font-semibold text-slate-600">{filtered.length}</span>{" "}
            of <span className="font-semibold text-slate-600">{allEntries.length}</span> forms
          </p>
        </div>

        {/* ── Form card grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm font-medium text-slate-500 mb-1">No forms match your filters.</p>
            <button
              onClick={() => { setSearch(""); setCategory("all"); setStateFilter("all"); }}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          // v24 — upgraded to xl:grid-cols-4
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(entry => {
              const stateBadge = getStateBadgeLabel(entry);
              const downloaded = downloadedIds.has(entry.id);
              const isDownloadable = entry.isDownloadable && !!entry.pdfPath;
              return (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 hover:border-blue-200 hover:shadow-md transition-all"
                >
                  {/* ── Name + badges row ── */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">
                      {entry.name}
                    </p>
                    {/* v28 — unified jurisdiction badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`${JURISDICTION_BADGE_CLS} ${categoryBadgeClass(entry.category)}`}>
                        {categoryLabel(entry)}
                      </span>
                      {/* v24 — state/locality badge */}
                      {stateBadge && (
                        <span className={`${JURISDICTION_BADGE_CLS} ${stateBadgeClass()}`}>
                          {stateBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Description ── */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                    {entry.description}
                  </p>

                  {/* ── Renewal info ── */}
                  {entry.renewalMonths !== null && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      {renewalText(entry.renewalMonths)}
                    </p>
                  )}

                  {/* ── Action area ── */}
                  <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
                    {isDownloadable ? (
                      // v24 — filled blue button for downloadable forms (more prominent)
                      <a
                        href={(entry as StateFormEntry).pdfPath ?? (entry as FederalFormEntry).pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleDownload(entry.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-3 py-1.5 transition-colors shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Form
                      </a>
                    ) : (
                      <a
                        href={entry.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Official Site
                      </a>
                    )}
                    {/* v21 — Downloaded badge */}
                    {downloaded && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                        <Check className="h-3 w-3" />
                        Downloaded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Sidebar / compact layout ───────────────────────────────────────────────
  // Kept intentionally simple: search + category tabs + compact cards.
  // No state filter (too wide for sidebar). State badge still shown on cards.

  return (
    <div className="flex flex-col gap-2">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search forms…"
          className="w-full pl-7 pr-7 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 placeholder:text-slate-400 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
              category === tab.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Result count — shown only when search/filter is active */}
      {(search || category !== "all") && (
        <p className="text-[10px] text-slate-400 tabular-nums">
          {filtered.length} form{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Form cards */}
      {filtered.length === 0 ? (
        <p className="text-[11px] text-slate-400 text-center py-3">No forms match your search.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(entry => {
            const stateBadge = getStateBadgeLabel(entry);
            const downloaded = downloadedIds.has(entry.id);
            const isDownloadable = entry.isDownloadable && !!entry.pdfPath;
            return (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {/* Name + category badge */}
                <div className="flex items-start justify-between gap-1.5">
                  <p className="text-[11px] font-semibold text-slate-800 leading-snug flex-1">
                    {entry.name}
                  </p>
                  {/* v28 — unified jurisdiction badge (matches grid + recommended) */}
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className={`${JURISDICTION_BADGE_CLS} ${categoryBadgeClass(entry.category)}`}>
                      {categoryLabel(entry)}
                    </span>
                    {/* v24 — state badge on sidebar cards too */}
                    {stateBadge && (
                      <span className={`${JURISDICTION_BADGE_CLS} ${stateBadgeClass()}`}>
                        {stateBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className={`text-[10px] text-slate-500 leading-snug ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
                  {entry.description}
                </p>

                {/* Renewal info */}
                {entry.renewalMonths !== null && (
                  <p className="text-[9px] text-slate-400">
                    {renewalText(entry.renewalMonths)}
                  </p>
                )}

                {/* Action button + Downloaded badge */}
                <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                  {isDownloadable ? (
                    <a
                      href={(entry as StateFormEntry).pdfPath ?? (entry as FederalFormEntry).pdfPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleDownload(entry.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-2 py-1 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Download Form
                    </a>
                  ) : (
                    <a
                      href={entry.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Official Site
                    </a>
                  )}
                  {/* v21 — Downloaded badge */}
                  {downloaded && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                      <Check className="h-2.5 w-2.5" />
                      Downloaded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
