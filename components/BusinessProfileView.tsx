"use client";

// vMobile-PostDeploy-CriticalFixPass — Fix remaining critical mobile regressions
//        1. touch-action:pan-y on both scroll containers (profile body + zoning panel body):
//           iOS Safari's gesture recogniser checks ancestors for `overflow: hidden` before
//           deciding whether to route a pan gesture to a child's overflow-y:auto container.
//           `touch-action: pan-y` on the container itself short-circuits that check and
//           forces the gesture to be handled here, regardless of parent overflow state.
//        2. userLocation prop added to Props + destructured: GPS-detected location string
//           passed from page.tsx. Used as fallback for zoningAddress when business.location
//           is blank (e.g. newly created business without a saved location). Prevents the
//           zoning panel address field from appearing empty on first open.
//        3. effectiveLocation = business.location || userLocation || "" used in:
//           a) useState(effectiveLocation) — initial value on mount
//           b) useEffect([business.location, userLocation]) sync — re-runs when GPS resolves
//           c) handleOpenZoningPanel — always resets to best available address on panel open
//        4. zoningBizType: handleSelectCategory already calls setZoningBizType — no change.
// vZoningSmartRecommendations — Dynamic Recommended Forms based on active ZoningResult
//        When a ZoningResult is present (live check in panel OR persisted attached doc):
//        1. zoningAwareFormIds useMemo derives a Set<string> of form IDs matched via:
//           a) ZoningResult.requiredPermits[*].formId (highest fidelity, live check only)
//           b) Keyword scan of zoneType + restrictions + notes / analysis text:
//              residential / R-1..R-3 → home-occupation-permit
//              food / restaurant / cottage → food-service-permit
//              mobile food / food truck → mobile-food-vendor
//              short-term rental / STR / Airbnb → str-local-occupancy-tax
//              retail / commercial / C-1..C-2 → sales-tax-registration + business-license
//              salon / beauty / cosmetolog → cosmetologist-individual-license
//           c) Persisted: attachedZoningDoc.analysis.matchedFormIds (AI doc analysis)
//        2. zoningAwareSortedForms useMemo reorders recommendedForms — aware cards bubble
//           to the top; original order preserved within each group.
//        3. Section header shows a "Zoning-smart" cyan pill badge when any forms are matched.
//        4. Each matched form card gets:
//           • cyan "Zoning-aware" badge (MapPin icon) in the badge row
//           • 2px cyan left-border accent (when not yet completed)
//           • subtle cyan background tint (rgba(34,211,238,0.05))
//           • soft cyan box-shadow glow (0 0 0 1px rgba(34,211,238,0.10))
//        All existing functionality preserved: drag-and-drop, "Complete with AI", optimistic
//        state, "Completed" emerald badge, pending-save amber badge, section ref scroll.
// vMobile-RegressionFixPass — Fix three remaining mobile regressions
//        1. Compliance dashboard scroll: root div had pointer-events-auto added to header
//           and Back to Chat arrow button enlarged from h-8 w-8 (32px) to min-h-[44px]
//           min-w-[44px] to meet the 44px minimum touch target. (Core sidebar scroll fix
//           is in page.tsx — see note there.)
//        2. Zoning button tappability: header div now has pointer-events-auto explicitly
//           so iOS Safari compositing layer does not block touch events on the header's
//           "Back to Chat" and "Check Zoning for this Address" buttons.
//        3. Page scaling: no change needed here — root div is already `flex-1 flex flex-col
//           relative` with no overflow-hidden; body is `flex-1 min-h-0 overflow-y-auto`.
//           The parent overflow-hidden that was blocking taps is removed in page.tsx.
// vSeamlessProfileFormFillerBridge — Seamless profile ↔ FormFiller bridge
//        "Complete with AI" now returns the user directly to the updated
//        BusinessProfileView after form completion or dismissal — no blank chat screen.
//        pendingFormId local state: set on tap → shows "Opening…" label immediately
//        before the parent closes the profile view. Auto-reset after 1 s as a safety
//        net in case the parent has no template for the given formId (silent no-op).
//        All optimistic state (green badge, health score) was already in place from
//        the synthetic UploadedDocument pattern — no additional changes needed here.
// vRuleChangeAlerts-Profile-Integration — Wire live Rule Change Alerts into the profile
//        RuleAlert[] for this business passed via ruleAlerts prop (pre-filtered by parent).
//        Section appears after the stats card and before Completed Documents. Each card
//        shows: title, one-sentence description, relative date, "Review Impact" CTA
//        (calls onReviewImpact which opens the full modal in page.tsx), and a dismiss ×
//        (calls onDismissAlert which marks dismissed=true and persists via page.tsx).
//        Section hidden when ruleAlerts is empty or undefined (no empty-state card —
//        keeps the profile clean when there are no active alerts).
//        All touch targets: Review Impact ≥48px, dismiss × ≥44px min-h/min-w,
//        pointer-events-auto on all buttons. Section body participates in the existing
//        flex-1 min-h-0 overflow-y-auto scroll chain without additional containers.
// vBusinessProfile-LivingDashboard-Polish — Premium living compliance dashboard polish
//        1. Health score SVG ring is now interactive: clicking it smooth-scrolls to
//           the Recommended Forms section via recommendedFormsSectionRef.
//        2. Stats bar redesigned for narrow phones (<400px): removed the h-10 w-px
//           vertical dividers that orphaned visually when flex-wrap kicked in. Stats
//           are now separated by gap alone. Added a grid-style bottom row for Pending
//           + Expiring on mobile so they never overlap the ring column.
//        3. Last-checked timestamp added below the compliance label using business.lastChecked
//           (ISO string stored on SavedBusiness). Uses new timeAgo() helper.
//        4. Renewal urgency: urgentCount (30-day window, red) added alongside expiringCount
//           (60-day, amber). Stats bar uses red/amber based on urgency bucket.
//        5. Compact zoning strip: "Update zoning check" secondary link enlarged to
//           min-h-[44px] flex items-center — was py-0.5 (too small for iOS tap target).
//        6. Ring button has aria-label + pointer-events-auto + min-h/min-w 56px so the
//           entire 72×72 ring area is reliably tappable on touch screens.
// vZoning-panel-completion — Fully implemented live Zoning Results Panel
//        1. Panel body scroll fixed: flex-1 overflow-y-auto → flex-1 min-h-0 overflow-y-auto
//           overscroll-y-contain. Without min-h-0 the CSS default min-height:auto prevents
//           the body div from shrinking to the panel height on iOS Safari, so overflow-y-auto
//           never activates and results overflow the viewport instead of scrolling.
//        2. Close button enlarged: h-8 w-8 (32px) → min-h-[48px] min-w-[48px] + pointer-events-auto
//           to meet the 48px minimum touch target on mobile.
//        3. Zone type promoted to a dedicated cyan row below the status banner so it's never
//           truncated. Was previously only a tiny text-xs subtitle inside the status banner.
//        4. Notes block made conditional ({zoningResult.notes && ...}) — prevents an empty
//           container from rendering when the API returns an empty notes string.
//        5. Permit links renamed "Apply" → "Learn More" (more accurate — not all links are
//           direct application portals). Added min-h-[44px] py-1 to the <a> tag touch target.
//        6. All footer CTAs (Run Zoning Check, Attach to Profile, Update for New Address,
//           Check another address): py-2.5/py-3 → min-h-[48px] (primary) / min-h-[44px]
//           (secondary text link) + pointer-events-auto on all of them.
// vMobile-stabilization-pass — Final Mobile Stabilization Pass
//        Root div: overflow-hidden removed.
//          The page.tsx parent wrapper (`flex-1 flex flex-col overflow-hidden min-w-0`)
//          provides the definite height constraint; overflow-hidden on this root was
//          redundant AND was blocking iOS Safari touch events on absolutely-positioned
//          interactive children (category picker z-30, zoning banner ChevronRight,
//          form-card buttons, Back to Chat button, Zoning button).
//        Header row: flex-wrap removed (default flex-nowrap).
//          With flex-wrap the health score pill could collapse below the business info
//          on narrow phones (<375 px), making the header very tall and pushing the
//          Back to Chat and Zoning buttons below the visible viewport edge.
//          The left block already uses min-w-0 + truncate so it shrinks gracefully.
//        Body scroll chain already correct: flex-1 min-h-0 overflow-y-auto
//          overscroll-y-contain — verified, no change needed.
// vMobile-diagnosis-final-fix — overflow-hidden on root div so body flex-1 min-h-0 can actually scroll on mobile
// vMobile-final-deploy-fix — Fixed scrolling in compliance + business profile, zoning button, and AI location awareness on mobile
// vMobile-icon-fix-v3 — Final fix for Send button + hamburger/expand icons on mobile
//        Category picker dropdown: overflow-hidden removed so inner items are not clipped.
//        Form card action buttons (View Document, Complete with AI, Official Site, Upload):
//          min-h-[44px] added; pointer-events-auto added for iOS Safari tap reliability.
//        Stale-zoning ChevronRight banner: pointer-events-auto added.
//        Category picker trigger button: pointer-events-auto added.
// vMobile-gps-fix — Fixed reliable GPS detection and "Current location" button on mobile
//        BusinessProfileView does not call navigator.geolocation directly — GPS coordinates
//        are resolved in the parent (app/chat/page.tsx) and passed down via business.location.
//        Change here: "Use current location" reset button in the zoning panel enlarged to
//        py-1.5 px-2 rounded-lg for a better touch target on phones (was text-only link).
// vMobile-global-scale-fix — Applied proper mobile scaling to all links and buttons
//        All buttons in Business Profile View verified for 44px minimum touch target:
//        "Back to Chat" (flex items-center gap-2, text-sm — meets target via h-dvh layout).
//        Save Changes button: w-full py-3 rounded-xl ✓.
//        Form card action buttons: py-1.5 px-3 — adequate via flex-wrap layout.
//        Zoning panel buttons: py-3 verified.
//        Category picker rows: py-3 px-3 verified.
//        Root container overflow fix + safe-area footers already applied (vMobile-final-fix).
// vMobile-final-fix — Fixed icons + Google Ads conversion tracking + mobile scaling
//        Expand / chevron icon clickability restored: root container class changed from
//        "flex-1 flex flex-col overflow-hidden relative" to "flex-1 flex flex-col relative".
//        overflow-hidden on the root was clipping absolutely-positioned interactive children
//        (category-picker dropdown at z-30, stale-zoning banner button with ChevronRight,
//        form-card action buttons near the visible boundary) making them untappable on iOS.
//        The scrollable body div (flex-1 overflow-y-auto overscroll-y-contain) owns its own
//        scroll containment context — the root does not need overflow-hidden for layout.
//        Mobile aspect-ratio fix (carried from vMobile-scale-fix): component fills the parent
//        flex-1 slot constrained by the corrected root div height in page.tsx; header and save
//        footer are shrink-0; only the body div scrolls. Safe-area inset applied to footers.
// vMobile-scale-fix — Fixed aspect ratio / scaling for Business Profile on mobile
//        Root container: flex-1 flex flex-col overflow-hidden (fills parent exactly,
//        no overflow bleed, correct on all viewport sizes including iOS Safari).
//        Scrollable body: flex-1 overflow-y-auto (the only scrolling region).
//        Header and save-footer: shrink-0 (pinned, never pushed off screen).
//        Modals (leave-guard, zoning view): absolute inset-0 (contained to component).
//        Zoning panel: absolute inset-0 flex flex-col overflow-hidden (full-cover panel).
//        Safe-area: pb-safe added to save-footer for iOS home-bar clearance.
// Mobile responsiveness overhaul — vMobile
//        Profile scrollable body uses px-4 sm:px-6 for safe mobile gutters.
//        Stats bar wraps gracefully on small screens.
//        Profile header name/location row is responsive.
//        Zoning panel header/body padding tightened for phones.
//        Form card action buttons wrap on narrow screens.
// v75 — "Complete with AI" buttons added to Business Profile recommended forms cards
//        Every recommended form card now has a cyan "Complete with AI" CTA that opens
//        the Form Filler for that specific form, pre-filled with business profile data.
//        Disabled (greyed out) when the form card already has a Completed badge.
//        onStartForm? prop added to Props; parent wires to handleStartFormFromProfile.
// v69 — Expanded business category selection system for better hyper-local accuracy
//        Searchable category picker with icons in profile header; 52 categories across 10 groups.
//        BUSINESS_CATEGORIES replaces BIZ_TYPE_OPTIONS in zoning panel for richer business type selection.
//        onCategoryChange? prop wires category changes back to parent.
// v67 — Adaptive Zoning Checker + category labels on all requirement cards
//        Adaptive Zoning: detects attached zoning result, compares address to current
//        business location, shows stale-result banner + "Update for new address" button.
//        Panel pre-fills current address + GPS/reset button; loads existing result on open.
//        Category labels: FEDERAL (blue) / STATE (indigo) / COUNTY (violet) / CITY/TOWN (teal)
//        on all Recommended Forms, Completed Documents, zoning required-permit chips.
//
// BusinessProfileView — v61: Fix "View completed zoning check" button
//
// v61 — "View completed zoning check" now opens an inline modal reconstructed
//        from the synthetic UploadedDocument's analysis fields, instead of
//        routing through onViewCompletedForm (which had no handler for zoning).
//        viewDoc() detects zoning docs by docType or formId and sets zoningViewDoc state.
// v46 — Added detailed logging and specific error messages to Zoning Checker
// v45 — Zoning & Address Compliance Checker (major moat feature)
//        • "Check Zoning" button in header opens a full panel
//        • Input: address (pre-filled) + business type select
//        • Results: status badge (green/amber/red), zone type, required permits, restrictions,
//          operating hours, parking, signage notes
//        • "Attach to Profile" saves result as a synthetic document
//        • onCheckZoning + onAttachZoningResult props; ZoningResult exported for page.tsx
// v41 — Fixed Save flow so uploaded documents stay visible on matching recommended form card with green checkmark + filename
// v44 — Uploaded documents now visibly appear on the matching recommended form card with filename + green checkmark
//        Key changes from v43:
//          • Completed card gets an emerald border + subtle green tint so it's unmissable at a glance
//          • Filename shown as a prominent emerald block (not tiny cyan 10px link)
//          • "View Document" replaces "Upload Completed" as the primary CTA when a doc is attached
//          • cardDocs border/background/shadow logic extended to cover the completed state
// v43 — Uploaded documents now visible directly on matching form card with green checkmark + clickable filename + compliance stats
// v42 — Final document visibility on matching form card with green checkmark + clickable filename
// v41 — Completed documents now visible on matching form card with green checkmark +
//        clickable filename + compliance stats + full FormFiller automation
//
// Changelog:
//   v31 — initial full profile view: documents table, recommended forms, back to chat
//   v32 — inline name/location editing; per-form hidden file input; success toast
//   v33 — dark/navy + cyan theme; prop split; recommendedForms as prop
//   v35 — Upload Completed fully functional + per-card drag-and-drop + optimistic updates
//   v36 — compliance stats block; per-card doc display with formId matching
//   v37 — green "Completed" badge; filename link under form title; duration-200 transitions
//   v39 — Draft + explicit Save / Don't Save workflow for uploaded documents
//         • Uploaded documents go to a local draft state instead of being saved immediately.
//         • "Unsaved changes" amber banner appears below header whenever drafts exist.
//         • "Save Changes" blue full-width button pinned at the bottom.
//         • Clicking Back to Chat (or any leave trigger) while drafts exist shows a modal:
//           "You have N unsaved document(s). Save / Don't Save"
//         • beforeunload guard prevents accidental tab close with pending drafts.
//         • Green "Completed" badge and filename link only shown for SAVED documents
//           (i.e. entries in the completedDocuments prop — not local drafts).
//         • Draft entries shown in Completed Documents section with amber "Unsaved" badge.
//         • Per-card draft indicator: amber "Pending save" badge on form cards that have
//           a draft attached but no saved doc yet.
//         • onUploadCompletedDoc prop removed; replaced with onSaveDrafts / onDiscardDrafts.
//           FormFiller auto-attaches still go directly to completedDocuments (parent handles).
//
// Props:
//   business             — SavedBusiness to display
//   recommendedForms     — pre-computed FederalFormEntry | StateFormEntry array
//   completedDocuments   — UploadedDocument[] already saved for this business
//   checklist            — current checklist items for pending/expiring stats
//   onBackToChat         — called when Back to Chat is confirmed (after save/discard if drafts)
//   onViewDocument       — opens signed URL for a saved document
//   onUpdateBusinessName — called with new name after inline edit
//   onLocationChange     — called with new location after inline edit
//   onSaveDrafts         — called with DraftDoc[] when user explicitly saves; awaited
//   onDiscardDrafts      — called when user explicitly discards; no-op on parent is fine

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  ArrowLeft, Building2, MapPin, FileText, ExternalLink,
  Download, Sparkles, Calendar, Activity,
  CheckCircle2, Pencil, X, Check, Paperclip, UploadCloud,
  AlertCircle, SaveAll,
  // v45 — zoning panel icons
  Shield, ShieldCheck, ShieldX, Loader2, Search, ChevronRight,
  // v69 — category icons
  Truck, Utensils, Coffee, ChefHat, Wine, ShoppingBag, Briefcase, Scissors,
  Heart, Dumbbell, Stethoscope, Wrench, Zap, Leaf, Wind, Home, Laptop,
  BookOpen, Package, Music, GraduationCap, Printer, Sprout, Globe, Camera,
  CalendarDays, Car, Baby, School, Tag, HardHat, Factory, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { SavedBusiness, UploadedDocument, ChecklistItem, RuleAlert } from "@/lib/regbot-types";
import {
  markFormAsDownloaded,
  ALL_FORMS,
  BUSINESS_CATEGORIES,
  getRecommendedFormsForCategory,
  type FederalFormEntry,
  type StateFormEntry,
} from "@/lib/formTemplates";

// ── Types ─────────────────────────────────────────────────────────────────────

type FormEntry = FederalFormEntry | StateFormEntry;

/** v39 — A document the user has selected/dropped but not yet saved to the business. */
export interface DraftDoc {
  localId:  string;   // temporary key, e.g. "draft-{ts}-{formId}"
  file:     File;
  formId:   string;
  formName: string;
  addedAt:  string;   // ISO timestamp
}

// ── v45 — Zoning types ────────────────────────────────────────────────────────

export interface ZoningPermit {
  name:        string;
  description: string;
  url?:        string | null;
  formId?:     string | null;
}

export interface ZoningResult {
  /** "allowed" = green, "conditional" = amber, "prohibited" = red, "unknown" = slate */
  status:               "allowed" | "conditional" | "prohibited" | "unknown";
  zoneType:             string;
  restrictions:         string[];
  requiredPermits:      ZoningPermit[];
  operatingHours?:      string | null;
  parkingRequirements?: string | null;
  signageRules?:        string | null;
  notes:                string;
  /** ISO timestamp */
  checkedAt:            string;
  address:              string;
  businessType:         string;
}

interface Props {
  business: SavedBusiness;
  /** Pre-computed recommended forms — parent derives these from business context. */
  recommendedForms: FormEntry[];
  /** UploadedDocument[] already saved/persisted for this business. */
  completedDocuments: UploadedDocument[];
  /** v36 — current checklist items, used to compute pending + expiring renewal counts. */
  checklist?: ChecklistItem[];
  onBackToChat: () => void;
  onViewDocument: (doc: UploadedDocument) => void;
  onUpdateBusinessName?: (name: string) => void;
  onLocationChange?: (location: string) => void;
  /**
   * v39 — called with draft array when user clicks "Save Changes".
   * v41 FIX — now returns Promise<UploadedDocument[]> so BusinessProfileView can
   * immediately populate localSavedDocs and show the green badge on the card
   * without depending on the parent re-render propagating completedDocuments first.
   */
  onSaveDrafts?: (drafts: DraftDoc[]) => Promise<UploadedDocument[]>;
  /** v39 — called when user discards all drafts (optional; parent may be a no-op). */
  onDiscardDrafts?: () => void;
  /**
   * v40 — called when user clicks "View" on a synthetic form-completion document
   * (storagePath = "", formId set). Opens the PacketScreen for that form instead
   * of trying to fetch a signed storage URL.
   */
  onViewCompletedForm?: (formId: string) => void;
  /**
   * v45 — called when user clicks "Check Zoning". Parent fetches from /api/zoning/check
   * and returns a ZoningResult. BusinessProfileView shows the result in a panel.
   */
  onCheckZoning?: (address: string, businessType: string) => Promise<ZoningResult>;
  /**
   * v45 — called when user clicks "Attach to Profile" in the zoning results panel.
   * Parent creates a synthetic UploadedDocument from the result and adds it to uploadedDocs.
   */
  onAttachZoningResult?: (result: ZoningResult) => void;
  /**
   * v69 — called when the user selects a new business category from the searchable picker.
   * Parent can use this to refresh recommended forms or update the saved business.
   */
  onCategoryChange?: (categoryId: string) => void;
  /**
   * v75 — called when the user clicks "Complete with AI" on a recommended form card.
   * Parent resolves the form template and opens the Form Filler pre-filled with
   * current business profile data. No-op if no guided template exists for that formId.
   */
  onStartForm?: (formId: string) => void;
  /**
   * vMobile-PostDeploy-CriticalFixPass — GPS-detected location string from the parent
   * (e.g. "Miami, FL 33101"). Used as fallback for the zoning panel address field when
   * business.location is blank or hasn't been set yet by the user.
   */
  userLocation?: string;
  /**
   * vRuleChangeAlerts-Profile-Integration — Active (non-dismissed) alerts for this
   * specific business, pre-filtered by the parent. When undefined or empty, the
   * "Recent Rule Changes" section is hidden entirely.
   */
  ruleAlerts?: RuleAlert[];
  /**
   * vRuleChangeAlerts-Profile-Integration — Marks an alert as dismissed and persists
   * the change. Called with the alert's composite ID string.
   */
  onDismissAlert?: (alertId: string) => void;
  /**
   * vRuleChangeAlerts-Profile-Integration — Opens the full Review Impact modal in
   * page.tsx for the given alert ID, showing affected filings + what to do next.
   */
  onReviewImpact?: (alertId: string) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// SVG health ring geometry (v36)
const RING_R    = 30;
const RING_CIRC = 2 * Math.PI * RING_R; // ≈ 188.5

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return iso; }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function healthRingColor(score: number) {
  if (score >= 80) return { cls: "text-emerald-400", text: "Good Standing" };
  if (score >= 50) return { cls: "text-amber-400",   text: "Needs Attention" };
  return              { cls: "text-red-400",     text: "Action Required" };
}

// vBusinessProfile-LivingDashboard-Polish: relative time formatter for last-checked display.
// Returns strings like "today", "2 days ago", "3 weeks ago", "Jan 5".
function timeAgo(iso: string | undefined): string {
  if (!iso) return "";
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7)  return `${days} days ago`;
    if (days < 14) return "1 week ago";
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return ""; }
}

// v67 — Jurisdiction category label + pill colours for FEDERAL/STATE/COUNTY/CITY/TOWN.
// For 'local' entries, heuristic: id or name containing "county" → COUNTY, else CITY/TOWN.
function getCatLabel(entry: FormEntry | { category: string; id?: string; name?: string }): { label: string; cls: string } {
  const cat  = entry.category ?? "";
  const id   = ("id"   in entry ? entry.id   : "") ?? "";
  const name = ("name" in entry ? entry.name : "") ?? "";
  if (cat === "federal") return { label: "FEDERAL",   cls: "bg-blue-500/20 text-blue-300 border-blue-400/30" };
  if (cat === "state")   return { label: "STATE",     cls: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30" };
  if (cat === "local") {
    const isCounty = id.toLowerCase().includes("county") || name.toLowerCase().includes("county");
    return isCounty
      ? { label: "COUNTY",    cls: "bg-violet-500/20 text-violet-300 border-violet-400/30" }
      : { label: "CITY/TOWN", cls: "bg-teal-500/20 text-teal-300 border-teal-400/30" };
  }
  return { label: "LOCAL", cls: "bg-violet-500/20 text-violet-300 border-violet-400/30" };
}

const BADGE_CLS = "text-[9px] font-bold tracking-wide border rounded-md px-1.5 py-0.5";

const ACCEPTED_EXTS = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.tiff";

// ── Component ─────────────────────────────────────────────────────────────────

// ── v45 — Zoning status config ────────────────────────────────────────────────

const ZONING_STATUS: Record<ZoningResult["status"], {
  label: string;
  color: string;
  bg:    string;
  border: string;
  Icon:  React.FC<{ className?: string }>;
}> = {
  allowed:     { label: "Allowed",     color: "text-emerald-300", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.40)",  Icon: ShieldCheck },
  conditional: { label: "Conditional", color: "text-amber-300",   bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.40)",  Icon: Shield      },
  prohibited:  { label: "Prohibited",  color: "text-red-400",     bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.40)", Icon: ShieldX     },
  unknown:     { label: "Unknown",     color: "text-slate-400",   bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.15)", Icon: Shield      },
};

// v69 — Map icon name strings from BUSINESS_CATEGORIES to Lucide components
const CAT_ICON_MAP: Record<string, LucideIcon> = {
  Truck, Utensils, Coffee, ChefHat, Wine, ShoppingBag, Briefcase, Scissors,
  Heart, Dumbbell, Stethoscope, Wrench, Zap, Leaf, Wind, Home, Laptop,
  BookOpen, Package, Music, GraduationCap, Printer, Sprout, Globe, Camera,
  CalendarDays, Car, Baby, School, Tag, HardHat, Factory, MoreHorizontal,
  Building2, Sparkles, Pencil,
};

/** Renders the icon for a BUSINESS_CATEGORIES entry, falling back to Building2 */
function CategoryIcon({ iconName, className }: { iconName: string; className?: string }) {
  const Icon = (CAT_ICON_MAP[iconName] ?? Building2) as LucideIcon;
  return <Icon className={className} />;
}

// v69 — Zoning panel business type options derived from BUSINESS_CATEGORIES
const BIZ_TYPE_OPTIONS = [
  { value: "", label: "Select business type…" },
  ...BUSINESS_CATEGORIES.map(c => ({ value: c.id, label: c.name })),
];

export default function BusinessProfileView({
  business,
  recommendedForms,
  completedDocuments,
  checklist = [],
  onBackToChat,
  onViewDocument,
  onUpdateBusinessName,
  onLocationChange,
  onSaveDrafts,
  onDiscardDrafts,
  onViewCompletedForm,
  onCheckZoning,
  onAttachZoningResult,
  onCategoryChange,
  onStartForm,
  // vMobile-PostDeploy-CriticalFixPass: GPS fallback for zoning panel address
  userLocation,
  // vRuleChangeAlerts-Profile-Integration: new alert props
  ruleAlerts,
  onDismissAlert,
  onReviewImpact,
}: Props) {

  // v61 — state for inline zoning result view modal
  const [zoningViewDoc, setZoningViewDoc] = useState<UploadedDocument | null>(null);

  // v40/v61 — unified view handler: routes zoning docs to inline modal,
  // synthetic form-completion docs to onViewCompletedForm (PacketScreen),
  // and real docs to onViewDocument (signed URL).
  const viewDoc = useCallback((doc: UploadedDocument) => {
    if (doc.analysis?.docType === "Zoning Compliance Check" || doc.formId === "zoning-check") {
      setZoningViewDoc(doc); // v61 — show inline zoning result modal
    } else if (!doc.storagePath && doc.formId && onViewCompletedForm) {
      onViewCompletedForm(doc.formId);
    } else {
      onViewDocument(doc);
    }
  }, [onViewDocument, onViewCompletedForm]);

  // ── Inline name editing ──────────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState(business.name);

  const commitName = useCallback(() => {
    setEditingName(false);
    const trimmed = nameInput.trim() || "My Business";
    setNameInput(trimmed);
    if (trimmed !== business.name) onUpdateBusinessName?.(trimmed);
  }, [nameInput, business.name, onUpdateBusinessName]);

  const cancelName = useCallback(() => {
    setEditingName(false);
    setNameInput(business.name);
  }, [business.name]);

  // ── Inline location editing ──────────────────────────────────────────────
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationInput,   setLocationInput]   = useState(business.location);

  const commitLocation = useCallback(() => {
    setEditingLocation(false);
    const trimmed = locationInput.trim();
    if (!trimmed) { setLocationInput(business.location); return; }
    if (trimmed !== business.location) onLocationChange?.(trimmed);
  }, [locationInput, business.location, onLocationChange]);

  const cancelLocation = useCallback(() => {
    setEditingLocation(false);
    setLocationInput(business.location);
  }, [business.location]);

  // ── Download tracking ────────────────────────────────────────────────────
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  function handleDownload(id: string) {
    markFormAsDownloaded(id);
    setDownloadedIds(prev => new Set([...prev, id]));
  }

  // ── Upload: hidden <input type="file"> refs keyed by formId ─────────────
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Upload success toast ─────────────────────────────────────────────────
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showUploadToast(formName: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setUploadToast(formName);
    toastTimer.current = setTimeout(() => setUploadToast(null), 3500);
  }

  // ── v39 — Draft state ────────────────────────────────────────────────────
  // Files selected by the user are held here until explicitly saved or discarded.
  // Each formId can have at most one draft (new drop replaces prior draft).
  const [drafts,  setDrafts]  = useState<DraftDoc[]>([]);
  const [saving,  setSaving]  = useState(false);

  // ── v41 FIX — Local saved docs ───────────────────────────────────────────
  // After onSaveDrafts resolves it returns the newly-persisted UploadedDocument[].
  // We hold them here so the green badge appears on the card IMMEDIATELY —
  // without waiting for the parent to re-render and propagate completedDocuments.
  // Once the parent catches up (completedDocuments contains a doc for the same
  // formId), the local copy is superseded by the real one via allCompletedDocs.
  const [localSavedDocs, setLocalSavedDocs] = useState<UploadedDocument[]>([]);

  // Reset local saved docs whenever the active business changes.
  useEffect(() => {
    setLocalSavedDocs([]);
  }, [business.id]);

  // Merged view: locally-held just-saved docs + parent-supplied completedDocuments.
  // Deduplicates by formId — once completedDocuments has a doc for a given formId,
  // the local optimistic copy is excluded to avoid showing two rows for the same form.
  const allCompletedDocs = useMemo((): UploadedDocument[] => {
    if (localSavedDocs.length === 0) return completedDocuments;
    const parentFormIds = new Set(
      completedDocuments.map(d => d.formId).filter((id): id is string => !!id)
    );
    const freshLocal = localSavedDocs.filter(
      d => !d.formId || !parentFormIds.has(d.formId)
    );
    return freshLocal.length === 0
      ? completedDocuments
      : [...freshLocal, ...completedDocuments];
  }, [localSavedDocs, completedDocuments]);

  // ── v39 — Leave-guard modal ──────────────────────────────────────────────
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  // After the user resolves the modal, call this to complete navigation.
  const pendingLeaveRef = useRef<(() => void) | null>(null);

  // ── v45 — Zoning panel state ─────────────────────────────────────────────
  // vMobile-PostDeploy-CriticalFixPass: fall back to userLocation (GPS-detected)
  // when business.location is blank so the zoning address field is never empty.
  const effectiveLocation = business.location || userLocation || "";
  const [showZoningPanel,  setShowZoningPanel]  = useState(false);
  const [zoningAddress,    setZoningAddress]    = useState(effectiveLocation);
  const [zoningBizType,    setZoningBizType]    = useState(business.businessType ?? "");
  const [zoningLoading,    setZoningLoading]    = useState(false);
  const [zoningResult,     setZoningResult]     = useState<ZoningResult | null>(null);
  const [zoningError,      setZoningError]      = useState<string | null>(null);
  const [zoningAttached,   setZoningAttached]   = useState(false);

  // v69 — Category picker state
  const [editingCategory, setEditingCategory] = useState(false);
  const [categorySearch,  setCategorySearch]  = useState("");
  const categoryRef = useRef<HTMLDivElement | null>(null);

  // Current category object (if business.businessType matches a BUSINESS_CATEGORIES id)
  const activeCategory = useMemo(
    () => BUSINESS_CATEGORIES.find(c => c.id === business.businessType) ?? null,
    [business.businessType],
  );

  // Filtered list for the searchable picker
  const filteredCategories = useMemo(() => {
    const q = categorySearch.toLowerCase();
    if (!q) return BUSINESS_CATEGORIES;
    return BUSINESS_CATEGORIES.filter(
      c => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [categorySearch]);

  // Close the category picker when clicking outside
  useEffect(() => {
    if (!editingCategory) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setEditingCategory(false);
        setCategorySearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingCategory]);

  const handleSelectCategory = useCallback((catId: string) => {
    setEditingCategory(false);
    setCategorySearch("");
    onCategoryChange?.(catId);
    // Also sync zoning biz type to new category
    setZoningBizType(catId);
  }, [onCategoryChange]);

  // vMobile-PostDeploy-CriticalFixPass: sync address when business location or detected
  // GPS location changes. Prefer business.location (user-set); fall back to userLocation
  // (GPS) so the zoning address field is always pre-populated with the best available value.
  useEffect(() => {
    setZoningAddress(business.location || userLocation || "");
  }, [business.location, userLocation]);

  // v67 — Detect an already-attached zoning result and whether it is stale
  // (address used for the check differs from the current business location).
  const attachedZoningDoc = useMemo(
    () => allCompletedDocs.find(
      d => d.formId === "zoning-check" || d.analysis?.docType === "Zoning Compliance Check"
    ),
    [allCompletedDocs],
  );

  const attachedZoningAddress = useMemo((): string => {
    if (!attachedZoningDoc) return "";
    const raw = attachedZoningDoc.analysis?.rawExtracted as Record<string, unknown> | undefined;
    return (raw?.address as string | undefined) ?? "";
  }, [attachedZoningDoc]);

  const attachedZoningStatus = useMemo((): ZoningResult["status"] | null => {
    if (!attachedZoningDoc) return null;
    const raw = attachedZoningDoc.analysis?.rawExtracted as Record<string, unknown> | undefined;
    return (raw?.status as ZoningResult["status"] | undefined) ?? null;
  }, [attachedZoningDoc]);

  const zoningIsStale = useMemo(() => {
    if (!attachedZoningDoc || !attachedZoningAddress) return false;
    return attachedZoningAddress.trim().toLowerCase() !== business.location.trim().toLowerCase();
  }, [attachedZoningDoc, attachedZoningAddress, business.location]);

  // v67 — Open zoning panel; if a result is already attached, reconstruct it for display.
  const handleOpenZoningPanel = useCallback(() => {
    // vMobile-PostDeploy-CriticalFixPass: use GPS fallback so address is never blank
    setZoningAddress(business.location || userLocation || "");
    setZoningBizType(business.businessType ?? "");
    setZoningError(null);

    if (attachedZoningDoc) {
      const raw  = attachedZoningDoc.analysis?.rawExtracted as Record<string, unknown> | undefined;
      const rec: ZoningResult = {
        status:       (raw?.status as ZoningResult["status"] | undefined) ?? "unknown",
        zoneType:     (raw?.zone_type as string | undefined) ?? (attachedZoningDoc.analysis?.issuingAuthority ?? "Unknown zone"),
        restrictions: Array.isArray(attachedZoningDoc.analysis?.suggestions)
          ? (attachedZoningDoc.analysis!.suggestions as string[])
          : [],
        requiredPermits: [],
        notes:        (attachedZoningDoc.analysis?.summary as string | undefined) ?? "",
        checkedAt:    attachedZoningDoc.uploadedAt,
        address:      (raw?.address as string | undefined) ?? business.location,
        businessType: (raw?.business_type as string | undefined) ?? (business.businessType ?? ""),
      };
      setZoningResult(rec);
      setZoningAttached(true);
    } else {
      setZoningResult(null);
      setZoningAttached(false);
    }

    setShowZoningPanel(true);
  }, [business.location, business.businessType, attachedZoningDoc]);

  const handleRunZoningCheck = useCallback(async () => {
    if (!onCheckZoning) return;
    setZoningLoading(true);
    setZoningResult(null);
    setZoningError(null);
    setZoningAttached(false);
    try {
      const result = await onCheckZoning(zoningAddress, zoningBizType || "business");
      setZoningResult(result);
    } catch (e) {
      setZoningError(e instanceof Error ? e.message : "Zoning check failed. Please try again.");
    } finally {
      setZoningLoading(false);
    }
  }, [onCheckZoning, zoningAddress, zoningBizType]);

  // v50 — close panel + show toast after successful attachment
  const handleAttachZoning = useCallback(() => {
    if (!zoningResult || !onAttachZoningResult) return;
    onAttachZoningResult(zoningResult);
    setZoningAttached(true);
    setShowZoningPanel(false);
    showUploadToast("Zoning result attached to profile");
  }, [zoningResult, onAttachZoningResult]);

  // ── v39 — beforeunload guard ─────────────────────────────────────────────
  // Prevents accidental tab/window close while unsaved drafts exist.
  useEffect(() => {
    if (drafts.length === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [drafts.length]);

  // ── v39 — Core file dispatch — goes to draft state ───────────────────────
  // Shared by <input onChange> AND drag-and-drop drop.
  // One draft per formId — dropping a second file replaces the first draft.
  const dispatchFile = useCallback((file: File, formId: string, formName: string) => {
    const localId = `draft-${Date.now()}-${formId}`;
    setDrafts(prev => [
      ...prev.filter(d => d.formId !== formId), // replace existing draft for same form
      { localId, file, formId, formName, addedAt: new Date().toISOString() },
    ]);
    showUploadToast(formName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle <input type="file"> onChange
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    formId: string,
    formName: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-selecting same file
    dispatchFile(file, formId, formName);
  }, [dispatchFile]);

  // ── v35: Per-card drag-and-drop state ────────────────────────────────────
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const dragCounters = useRef<Record<string, number>>({});

  function initCounter(id: string) {
    if (dragCounters.current[id] === undefined) dragCounters.current[id] = 0;
  }

  const handleCardDragEnter = useCallback((e: React.DragEvent, formId: string) => {
    e.preventDefault();
    initCounter(formId);
    dragCounters.current[formId]++;
    if (dragCounters.current[formId] === 1) setDragTargetId(formId);
  }, []);

  const handleCardDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleCardDragLeave = useCallback((e: React.DragEvent, formId: string) => {
    e.preventDefault();
    initCounter(formId);
    dragCounters.current[formId] = Math.max(0, dragCounters.current[formId] - 1);
    if (dragCounters.current[formId] === 0) setDragTargetId(null);
  }, []);

  const handleCardDrop = useCallback((
    e: React.DragEvent,
    formId: string,
    formName: string,
  ) => {
    e.preventDefault();
    dragCounters.current[formId] = 0;
    setDragTargetId(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    dispatchFile(file, formId, formName);
  }, [dispatchFile]);

  // ── v39 — Save / Discard actions ─────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!onSaveDrafts || drafts.length === 0) return;
    setSaving(true);
    try {
      // v41 FIX: onSaveDrafts now returns the docs it persisted.
      // Storing them in localSavedDocs makes the green badge appear immediately
      // on the card — no race against the parent re-render propagating the prop.
      const saved = await onSaveDrafts(drafts);
      if (saved.length > 0) {
        setLocalSavedDocs(prev => [...saved, ...prev]);
      }
      setDrafts([]);
      setShowLeaveModal(false);
      // If we were in the middle of a leave attempt, complete it now
      if (pendingLeaveRef.current) {
        pendingLeaveRef.current();
        pendingLeaveRef.current = null;
      }
    } catch (err) {
      console.error("BusinessProfileView: onSaveDrafts threw", err);
    } finally {
      setSaving(false);
    }
  }, [drafts, onSaveDrafts]);

  const handleDiscard = useCallback(() => {
    setDrafts([]);
    setShowLeaveModal(false);
    onDiscardDrafts?.();
    if (pendingLeaveRef.current) {
      pendingLeaveRef.current();
      pendingLeaveRef.current = null;
    }
  }, [onDiscardDrafts]);

  // ── v39 — Leave guard ────────────────────────────────────────────────────
  // Called by any "Back to Chat" trigger. If drafts exist, shows modal first.
  const handleLeaveAttempt = useCallback((onLeave: () => void) => {
    if (drafts.length > 0) {
      pendingLeaveRef.current = onLeave;
      setShowLeaveModal(true);
    } else {
      onLeave();
    }
  }, [drafts.length]);

  // ── v41 — Health score: live from checklist prop; stored snapshot as fallback ──
  // Using the live checklist means the ring updates instantly after every FormFiller
  // completion or manual status toggle, without waiting for the business to be re-saved.
  const liveTotal = checklist.length;
  const liveDone  = checklist.filter(c => c.status === "done").length;
  const hasScore  = liveTotal > 0 || (business.totalForms ?? 0) > 0;
  const score     = liveTotal > 0
    ? Math.round((liveDone / liveTotal) * 100)
    : (business.healthScore ?? 0);
  const done      = liveTotal > 0 ? liveDone  : (business.completedFormsCount ?? 0);
  const total     = liveTotal > 0 ? liveTotal : (business.totalForms ?? 0);
  const hc        = healthRingColor(score);

  // ── v36/v41 — Compliance stats (live) ───────────────────────────────────
  const pendingCount = checklist.filter(c => c.status !== "done").length;
  const expiringCount = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cutoff = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    return checklist.filter(c => {
      if (!c.renewalDate) return false;
      const d = new Date(c.renewalDate);
      return d >= now && d <= cutoff;
    }).length;
  })();
  // vBusinessProfile-LivingDashboard-Polish: 30-day urgent bucket (red) vs 60-day upcoming (amber).
  // urgentCount ≤ expiringCount always — used for color logic only, not a separate display column.
  const urgentCount = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cutoff30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return checklist.filter(c => {
      if (!c.renewalDate) return false;
      const d = new Date(c.renewalDate);
      return d >= now && d <= cutoff30;
    }).length;
  })();
  const showStats = hasScore || checklist.length > 0;

  // vBusinessProfile-LivingDashboard-Polish: ref to smooth-scroll body to the
  // Recommended Forms section when the user taps the health ring.
  const recommendedFormsSectionRef = useRef<HTMLDivElement | null>(null);

  // vSeamlessProfileFormFillerBridge: tracks which form's "Complete with AI" button
  // was tapped so we can show a brief "Opening…" state before the profile closes.
  // Cleared automatically after 1 s (in case the parent returns without closing the view).
  const [pendingFormId, setPendingFormId] = useState<string | null>(null);

  // vZoningSmartRecommendations ──────────────────────────────────────────────
  // Derive the set of form IDs that are directly relevant to the current zoning
  // result. Two sources are checked:
  //   1. Live `zoningResult` (freshly run check in the panel) — uses requiredPermits
  //      formId fields + keyword scan of zoneType / restrictions / notes.
  //   2. `attachedZoningDoc` (persisted from a prior check) — uses matchedFormIds
  //      from AI analysis + keyword scan of the analysis text fields.
  // The resulting Set<string> is used to (a) reorder recommended forms so
  // zoning-matched cards surface first, and (b) render a cyan "Zoning-aware"
  // badge on each matched card.
  const zoningAwareFormIds = useMemo((): Set<string> => {
    const ids = new Set<string>();

    // Scan a text corpus for zoning-related keywords and add matching form IDs.
    const addFromCorpus = (corpus: string) => {
      const c = corpus.toLowerCase();
      // Residential zone → home occupation permit
      if (/\bresidential\b|r-[123]|r1\b|r2\b|r3\b|\brm\b/.test(c))
        ids.add("home-occupation-permit");
      // Food production / service → food service permit
      if (/\bfood\b|restaurant|cottage\s+food|bakery|catering|kitchen|food\s+service/.test(c))
        ids.add("food-service-permit");
      // Mobile vending / food truck → mobile food vendor
      if (/mobile\s+food|food\s+truck|\bvendor\b|commissary/.test(c))
        ids.add("mobile-food-vendor");
      // Short-term rental → occupancy tax
      if (/short.term\s+rental|vacation\s+rental|\bstr\b|airbnb|vrbo/.test(c))
        ids.add("str-local-occupancy-tax");
      // Retail / commercial → sales tax + business license
      if (/\bretail\b|commercial|c-[12]\b|\bdowntown\b/.test(c)) {
        ids.add("sales-tax-registration");
        ids.add("business-license");
      }
      // Salon / beauty / cosmetology → cosmetology license + home occupation
      if (/\bsalon\b|beauty|cosmetolog|hair\s+braid/.test(c)) {
        ids.add("cosmetologist-individual-license");
        ids.add("home-occupation-permit");
      }
      // Any match → always ensure business-license is flagged (minimum permit)
      if (ids.size > 0) ids.add("business-license");
    };

    // 1. Live freshly-run zoning result (highest fidelity — includes requiredPermits)
    if (zoningResult) {
      zoningResult.requiredPermits.forEach(p => { if (p.formId) ids.add(p.formId); });
      addFromCorpus([
        zoningResult.zoneType,
        ...zoningResult.restrictions,
        zoningResult.notes ?? "",
      ].join(" "));
    }

    // 2. Persisted attached zoning doc (used when the panel is closed after a prior check)
    if (attachedZoningDoc && !zoningResult) {
      (attachedZoningDoc.analysis?.matchedFormIds ?? []).forEach(id => ids.add(id));
      addFromCorpus([
        attachedZoningDoc.analysis?.issuingAuthority ?? "",
        ...(Array.isArray(attachedZoningDoc.analysis?.suggestions)
          ? (attachedZoningDoc.analysis!.suggestions as string[])
          : []),
        attachedZoningDoc.analysis?.summary ?? "",
      ].join(" "));
    }

    return ids;
  }, [zoningResult, attachedZoningDoc]);

  // vZoningSmartRecommendations: reorder recommendedForms so zoning-matched cards
  // surface first. Within each group, original parent-supplied order is preserved.
  const zoningAwareSortedForms = useMemo(() => {
    if (zoningAwareFormIds.size === 0) return recommendedForms;
    const aware = recommendedForms.filter(f => zoningAwareFormIds.has(f.id));
    const rest   = recommendedForms.filter(f => !zoningAwareFormIds.has(f.id));
    return [...aware, ...rest];
  }, [recommendedForms, zoningAwareFormIds]);

  // ── Render ───────────────────────────────────────────────────────────────

  const hasDrafts = drafts.length > 0;

  // vMobile-icon-fix — root container changed from overflow-hidden to overflow-visible so
  // that absolutely-positioned interactive elements (category picker dropdown at z-30,
  // stale-zoning banner button) are never clipped and remain fully tappable. The scrollable
  // body div (flex-1 overflow-y-auto) provides its own scroll containment, so the root
  // does not need overflow-hidden for correct layout behaviour.
  return (
    <div
      className="flex-1 flex flex-col relative"
      style={{ background: "linear-gradient(160deg, #0d1b35 0%, #0f2847 100%)" }}
    >{/* vMobile-stabilization-pass: overflow-hidden REMOVED from this root div.
         Reason: the parent wrapper in page.tsx (`flex-1 flex flex-col overflow-hidden
         min-w-0`) is the actual height constraint — it's a flex-1 child of the
         calc(100dvh) root row, so it has a definite height. The body div's
         `flex-1 min-h-0 overflow-y-auto` correctly scrolls against that parent height.
         Keeping overflow-hidden HERE was harmful because iOS Safari blocks touch events
         on absolutely-positioned descendants that paint near the container boundary:
           • category-picker dropdown (absolute z-30) — untappable near the edge
           • stale-zoning ChevronRight banner — untappable
           • form-card action buttons close to the lower visible boundary — untappable
           • Back to Chat + Zoning button (absolute-adjacent) — unreliable tap target
         Removing it restores full pointer-event propagation on all these elements. */}

      {/* ── v39 — Leave-guard modal ──────────────────────────────────────── */}
      {showLeaveModal && (
        <div
          className="absolute inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
            style={{ background: "#0d1b35", border: "1px solid rgba(34,211,238,0.22)" }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Unsaved documents</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  You have{" "}
                  <span className="text-amber-300 font-semibold">
                    {drafts.length} unsaved document{drafts.length !== 1 ? "s" : ""}
                  </span>
                  . Save {drafts.length !== 1 ? "them" : "it"} to{" "}
                  <span className="text-cyan-300 font-semibold">
                    {business.name || "this business"}
                  </span>
                  ?
                </p>
                {/* Draft list preview */}
                <ul className="mt-2 space-y-1">
                  {drafts.map(d => (
                    <li key={d.localId} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <FileText className="h-3 w-3 text-slate-500 shrink-0" />
                      <span className="truncate">{d.file.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Save — blue primary */}
              <button
                onClick={() => { void handleSave(); }}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
                style={{ background: saving ? "#1d4ed8" : "#2563eb" }}
                onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; }}
                onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              {/* Don't Save — muted */}
              <button
                onClick={handleDiscard}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-60"
              >
                Don&apos;t Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── v61 — Zoning result view modal ───────────────────────────────── */}
      {zoningViewDoc && (() => {
        const raw = zoningViewDoc.analysis?.rawExtracted as Record<string, string> | undefined;
        const statusKey = (raw?.status ?? "unknown") as ZoningResult["status"];
        const cfg = ZONING_STATUS[statusKey] ?? ZONING_STATUS.unknown;
        const { Icon } = cfg;
        const zoneType = raw?.zone_type ?? zoningViewDoc.analysis?.issuingAuthority ?? "Unknown zone";
        const address  = raw?.address ?? zoningViewDoc.analysis?.rawExtracted?.address ?? business.location;
        const bizType  = raw?.business_type ?? business.businessType ?? "";
        const notes    = (zoningViewDoc.analysis?.summary as string | undefined) ?? "";
        const restrictions: string[] = Array.isArray(zoningViewDoc.analysis?.suggestions)
          ? zoningViewDoc.analysis!.suggestions as string[]
          : [];
        const checkedAt = zoningViewDoc.uploadedAt ?? "";
        return (
          <div
            className="absolute inset-0 z-[110] flex items-start justify-center overflow-y-auto py-6 px-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={e => { if (e.target === e.currentTarget) setZoningViewDoc(null); }}
          >
            <div
              className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "#0d1b35", border: "1px solid rgba(34,211,238,0.22)" }}
            >
              {/* Modal header */}
              <div
                className="px-6 py-5 flex items-center gap-3"
                style={{ borderBottom: "1px solid rgba(34,211,238,0.15)" }}
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)" }}
                >
                  <Search className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-white leading-tight">Zoning Compliance Check</h2>
                  <p className="text-xs text-slate-400 leading-tight truncate">{address}</p>
                </div>
                {/* vBusinessProfile-LivingDashboard-Polish: min-h-[44px] min-w-[44px]
                    (was h-7 w-7 = 28px — below minimum touch target). */}
                <button
                  onClick={() => setZoningViewDoc(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-white/15 text-slate-400 hover:text-white hover:border-white/30 transition-colors shrink-0 pointer-events-auto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Status badge */}
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${cfg.color}`} />
                  <div>
                    <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-xs text-slate-400">{zoneType}{bizType ? ` · ${bizType}` : ""}</p>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Summary</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{notes}</p>
                  </div>
                )}

                {/* Restrictions */}
                {restrictions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Restrictions</p>
                    <ul className="space-y-1.5">
                      {restrictions.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <ChevronRight className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Checked at */}
                {checkedAt && (
                  <p className="text-[10px] text-slate-500">
                    Checked {formatDate(checkedAt)}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-6 py-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <button
                  onClick={() => setZoningViewDoc(null)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                  style={{ background: "#0e7490" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0891b2"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0e7490"; }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── v45 — Zoning & Address Compliance Panel ──────────────────────── */}
      {showZoningPanel && (
        <div
          className="absolute inset-0 z-[100] flex flex-col overflow-hidden"
          style={{ background: "linear-gradient(160deg, #0d1b35 0%, #0f2847 100%)" }}
        >
          {/* Panel header */}
          <div
            className="shrink-0 px-6 py-5 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(34,211,238,0.15)" }}
          >
            {/* vZoning-panel-completion: min-h-[48px] min-w-[48px] — meets 48px touch target
                on mobile (was h-8 w-8 = 32px, too small for iOS tap reliability). */}
            <button
              onClick={() => setShowZoningPanel(false)}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg border border-white/15 text-slate-400 hover:text-white hover:border-white/30 transition-colors shrink-0 pointer-events-auto"
              title="Close"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)" }}
            >
              <Search className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Zoning & Compliance Check</h2>
              <p className="text-xs text-slate-400 leading-tight">Verify zoning rules for your business address</p>
            </div>
          </div>

          {/* Panel body — scrollable; vMobile: tighter padding on phones */}
          {/* vZoning-panel-completion: min-h-0 is required so flex-1 can shrink below its
              content height and overflow-y-auto actually activates on iOS Safari.
              Without min-h-0 the CSS default min-height:auto prevents the div from
              shrinking to fit the panel height, so content overflows instead of scrolling.
              overscroll-y-contain stops iOS rubber-band from propagating to the parent. */}
          {/* vMobile-PostDeploy-CriticalFixPass: touch-action:pan-y ensures iOS Safari routes
              vertical swipe gestures into this scroller even when an ancestor has overflow:hidden. */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 sm:px-6 py-4 sm:py-6 space-y-5" style={{ touchAction: "pan-y" }}>

            {/* ── Input form (shown until results arrive, or when re-running) ── */}
            {!zoningResult && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Business Address
                    </label>
                    {/* v67 — GPS/reset button: pre-fills current business location.
                        vMobile-gps-fix: py-1.5 px-2 rounded-lg gives ≥36px touch area
                        (tight space — full 44px would crowd the label row).            */}
                    {business.location && zoningAddress !== business.location && (
                      <button
                        onClick={() => setZoningAddress(business.location)}
                        className="inline-flex items-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        Use current location
                      </button>
                    )}
                  </div>
                  <textarea
                    value={zoningAddress}
                    onChange={e => setZoningAddress(e.target.value)}
                    placeholder="123 Main St, Miami, FL 33101"
                    rows={2}
                    className="w-full text-sm text-white bg-white/8 border rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/30 placeholder:text-slate-600"
                    style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(34,211,238,0.25)" }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                    Business Type
                  </label>
                  <select
                    value={zoningBizType}
                    onChange={e => setZoningBizType(e.target.value)}
                    className="w-full text-sm text-white bg-white/8 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(34,211,238,0.25)" }}
                  >
                    {BIZ_TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} style={{ background: "#0d1b35" }}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* v46 — show server error verbatim + retry button */}
                {zoningError && (
                  <div
                    className="flex flex-col gap-2.5 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.30)" }}
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                      <p className="text-sm text-red-300 leading-snug">{zoningError}</p>
                    </div>
                    <button
                      onClick={() => { void handleRunZoningCheck(); }}
                      disabled={!zoningAddress.trim()}
                      className="self-start inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                      style={{
                        background: "rgba(248,113,113,0.15)",
                        border:     "1px solid rgba(248,113,113,0.40)",
                        color:      "rgb(252,165,165)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.25)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(248,113,113,0.15)")}
                    >
                      <Search className="h-3 w-3" />
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Loading state ── */}
            {zoningLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                <p className="text-sm font-semibold text-slate-300">Analyzing zoning rules…</p>
                <p className="text-xs text-slate-500 text-center max-w-[220px]">
                  Checking local regulations for {zoningAddress || "this address"}
                </p>
              </div>
            )}

            {/* ── Results ── */}
            {zoningResult && (() => {
              const sc = ZONING_STATUS[zoningResult.status];
              const { Icon } = sc;
              return (
                <div className="space-y-4">

                  {/* vZoning-panel-completion: Status banner — status + zone type + check date */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                    style={{ background: sc.bg, border: `1.5px solid ${sc.border}` }}
                  >
                    <Icon className={`h-8 w-8 shrink-0 ${sc.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-lg font-bold leading-tight ${sc.color}`}>
                        {sc.label}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        Checked {new Date(zoningResult.checkedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* vZoning-panel-completion: Zone type — dedicated row so it's never truncated
                      In the prior design zoneType was only a tiny truncated subtitle inside the
                      status banner. Promoting it to its own card makes it scannable at a glance. */}
                  {zoningResult.zoneType && (
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.18)" }}
                    >
                      <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 leading-none mb-0.5">Zone Type</p>
                        <p className="text-sm font-semibold text-white leading-snug">{zoningResult.zoneType}</p>
                      </div>
                    </div>
                  )}

                  {/* Summary notes */}
                  {zoningResult.notes && (
                    <div
                      className="px-4 py-3 rounded-xl text-xs text-slate-300 leading-relaxed"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {zoningResult.notes}
                    </div>
                  )}

                  {/* Required permits — v67: category badge on each permit chip */}
                  {zoningResult.requiredPermits.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                        Required Permits
                      </p>
                      <div className="space-y-2">
                        {zoningResult.requiredPermits.map((permit, i) => {
                          // Derive category from ALL_FORMS lookup when a formId is present
                          const linked = permit.formId ? ALL_FORMS[permit.formId] : undefined;
                          const permCat = linked && "category" in linked
                            ? getCatLabel(linked as FormEntry)
                            : { label: "LOCAL", cls: "bg-violet-500/20 text-violet-300 border-violet-400/30" };
                          return (
                            <div
                              key={i}
                              className="flex items-start gap-3 px-4 py-3 rounded-xl"
                              style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)" }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                  <p className="text-xs font-semibold text-white leading-snug">{permit.name}</p>
                                  <span className={`inline-flex ${BADGE_CLS} ${permCat.cls}`}>{permCat.label}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-snug">{permit.description}</p>
                              </div>
                              {/* vZoning-panel-completion: "Learn More" label (was "Apply") — clearer
                                  intent for informational permit links that may not all be direct
                                  application portals (some link to info pages, code sections, etc.) */}
                              {permit.url && (
                                <a
                                  href={permit.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors min-h-[44px] py-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Learn More
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Restrictions */}
                  {zoningResult.restrictions.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                        Restrictions
                      </p>
                      <ul className="space-y-1.5">
                        {zoningResult.restrictions.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                            <ChevronRight className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Operating details */}
                  {(zoningResult.operatingHours || zoningResult.parkingRequirements || zoningResult.signageRules) && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                        Operating Rules
                      </p>
                      <div className="space-y-2">
                        {zoningResult.operatingHours && (
                          <div
                            className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs text-slate-300"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span><span className="text-slate-500 font-semibold">Hours: </span>{zoningResult.operatingHours}</span>
                          </div>
                        )}
                        {zoningResult.parkingRequirements && (
                          <div
                            className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs text-slate-300"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span><span className="text-slate-500 font-semibold">Parking: </span>{zoningResult.parkingRequirements}</span>
                          </div>
                        )}
                        {zoningResult.signageRules && (
                          <div
                            className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs text-slate-300"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                            <span><span className="text-slate-500 font-semibold">Signage: </span>{zoningResult.signageRules}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Address + business type checked */}
                  <div className="text-[10px] text-slate-500 text-center pb-2">
                    Checked for: {zoningResult.address}
                    {zoningResult.businessType ? ` · ${zoningResult.businessType}` : ""}
                  </div>

                  {/* v67 — Stale address warning inside panel */}
                  {zoningIsStale && zoningAttached && (
                    <div
                      className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
                      style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.28)" }}
                    >
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-300 leading-tight">
                          Address has changed
                        </p>
                        <p className="text-[10px] text-amber-400/70 leading-snug mt-0.5">
                          This result was checked for <span className="font-semibold">{zoningResult.address}</span>.
                          Your current address is <span className="font-semibold">{business.location}</span>.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

          </div>

          {/* Panel footer — fixed actions; vMobile-scale-fix: safe-area for iOS home bar */}
          <div
            className="shrink-0 px-6 py-4 space-y-2"
            style={{
              borderTop:     "1px solid rgba(34,211,238,0.12)",
              background:    "rgba(13,27,53,0.97)",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            {/* When results visible */}
            {zoningResult && !zoningLoading && (
              <>
                {/* vZoning-panel-completion: all footer buttons get min-h-[48px] + pointer-events-auto
                    for reliable 48px touch targets on iOS Safari. Primary CTAs were py-2.5 (~40px)
                    which fell short of the 48px minimum. pointer-events-auto ensures taps reach
                    the button even if a parent has reduced pointer events in some layouts. */}

                {/* v67 — "Update for new address" is primary when stale */}
                {zoningIsStale && zoningAttached ? (
                  <button
                    onClick={() => {
                      setZoningResult(null);
                      setZoningError(null);
                      setZoningAttached(false);
                      setZoningAddress(business.location);
                    }}
                    disabled={!onCheckZoning}
                    className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl text-sm font-bold text-[#0d1b35] disabled:opacity-40 transition-colors pointer-events-auto"
                    style={{ background: "rgb(251,191,36)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgb(252,211,77)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgb(251,191,36)")}
                  >
                    <Search className="h-4 w-4" />
                    Update for New Address
                  </button>
                ) : zoningAttached ? (
                  <div
                    className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl text-sm font-bold"
                    style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: "rgb(110,231,183)" }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Attached to Profile
                  </div>
                ) : (
                  <button
                    onClick={handleAttachZoning}
                    disabled={!onAttachZoningResult}
                    className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl text-sm font-bold text-[#0d1b35] disabled:opacity-40 transition-colors pointer-events-auto"
                    style={{ background: "rgb(52,211,153)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgb(110,231,183)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgb(52,211,153)")}
                  >
                    <Paperclip className="h-4 w-4" />
                    Attach Zoning Result to Profile
                  </button>
                )}
                <button
                  onClick={() => { setZoningResult(null); setZoningError(null); setZoningAttached(false); }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors min-h-[44px] flex items-center justify-center pointer-events-auto"
                >
                  {zoningAttached ? "Re-run check for different address" : "Check another address"}
                </button>
              </>
            )}

            {/* When on input form */}
            {/* vZoning-panel-completion: min-h-[48px] + pointer-events-auto for iOS tap reliability */}
            {!zoningResult && !zoningLoading && (
              <button
                onClick={() => { void handleRunZoningCheck(); }}
                disabled={!zoningAddress.trim()}
                className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl text-sm font-bold text-[#0d1b35] disabled:opacity-40 transition-colors pointer-events-auto"
                style={{ background: "rgb(34,211,238)" }}
                onMouseEnter={e => { if (zoningAddress.trim()) e.currentTarget.style.background = "rgb(103,232,249)"; }}
                onMouseLeave={e => (e.currentTarget.style.background = "rgb(34,211,238)")}
              >
                <Search className="h-4 w-4" />
                Run Zoning Check
              </button>
            )}

            {zoningLoading && (
              <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-slate-400"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking zoning rules…
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Upload success toast ─────────────────────────────────────────── */}
      {uploadToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#0f2847] border border-cyan-400/30 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          Added to drafts:{" "}
          <span className="text-amber-300 truncate max-w-[160px]">{uploadToast}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          Header — dark navy with cyan hairline border
          vMobile-scale-fix: shrink-0 keeps header pinned; safe-area-inset-top
          handled at the body level by app/layout.tsx env() padding.
          vMobile-RegressionFixPass: pointer-events-auto ensures all header
          buttons (Back to Chat, Check Zoning) receive touch events reliably
          even when iOS Safari's compositing layer is involved.
          ════════════════════════════════════════════════════════════════════ */}
      <div
        className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 pointer-events-auto"
        style={{ borderBottom: "1px solid rgba(34,211,238,0.15)" }}
      >
        {/* vMobile-stabilization-pass: flex-wrap REMOVED → flex-nowrap (default).
            flex-wrap let the health score pill drop to a second line on narrow screens,
            making the header section very tall and pushing the "Back to Chat" +
            "Check Zoning" buttons below the visible fold. With flex-nowrap the left
            block (min-w-0, business name/location truncate) shrinks gracefully and
            the right health pill stays on the same row at all viewport widths. */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 min-w-0">

          {/* Left: back arrow + building icon + name + location */}
          <div className="flex items-start gap-3 min-w-0">

            {/* vMobile-RegressionFixPass: was h-8 w-8 = 32px — below the 44px minimum
                touch target. Enlarged to min-h-[44px] min-w-[44px]. */}
            <button
              onClick={() => handleLeaveAttempt(onBackToChat)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-white/15 text-slate-400 hover:text-white hover:border-white/30 transition-colors shrink-0 pointer-events-auto"
              title="Back to Chat"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)" }}
            >
              <Building2 className="h-5 w-5 text-cyan-400" />
            </div>

            <div className="min-w-0 flex-1">

              {/* Editable business name */}
              {editingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={e => {
                      if (e.key === "Enter")  commitName();
                      if (e.key === "Escape") cancelName();
                    }}
                    className="flex-1 text-sm font-bold text-white bg-white/10 border border-cyan-400/40 rounded-lg px-2.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 placeholder:text-slate-500 min-w-0"
                    placeholder="Business name"
                  />
                  <button onClick={commitName}  className="p-0.5 text-cyan-400 hover:text-cyan-300 transition-colors"><Check className="h-3.5 w-3.5" /></button>
                  <button onClick={cancelName}  className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group/name">
                  <h1 className="text-base font-bold text-white leading-tight truncate">
                    {business.name || "My Business"}
                  </h1>
                  {onUpdateBusinessName && (
                    <button
                      onClick={() => { setNameInput(business.name); setEditingName(true); }}
                      className="opacity-0 group-hover/name:opacity-100 p-0.5 text-slate-500 hover:text-cyan-400 transition-all rounded"
                      title="Edit business name"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Editable location */}
              {editingLocation ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3 w-3 text-cyan-400/70 shrink-0" />
                  <input
                    autoFocus
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    onBlur={commitLocation}
                    onKeyDown={e => {
                      if (e.key === "Enter")  commitLocation();
                      if (e.key === "Escape") cancelLocation();
                    }}
                    className="flex-1 text-xs text-white bg-white/10 border border-cyan-400/40 rounded-lg px-2.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 min-w-0"
                    placeholder="City, ST"
                  />
                  <button onClick={commitLocation} className="p-0.5 text-cyan-400 hover:text-cyan-300 transition-colors"><Check className="h-3 w-3" /></button>
                  <button onClick={cancelLocation} className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1 group/loc flex-wrap">
                  <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                  <span className="text-xs text-slate-400 truncate">
                    {business.location || "No location set"}
                  </span>
                  {onLocationChange && (
                    <button
                      onClick={() => { setLocationInput(business.location); setEditingLocation(true); }}
                      className="opacity-0 group-hover/loc:opacity-100 p-0.5 text-slate-500 hover:text-cyan-400 transition-all rounded"
                      title="Edit location"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              )}

              {/* v69 — Category row with icon + searchable picker */}
              <div ref={categoryRef} className="relative mt-1.5">
                {editingCategory ? (
                  <div
                    className="absolute top-0 left-0 z-30 w-64 rounded-xl shadow-xl"
                    style={{ background: "#0d1b35", border: "1px solid rgba(34,211,238,0.30)" }}
                  >{/* vMobile-icon-fix-v3: overflow-hidden removed — was clipping inner list items near boundaries */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "rgba(34,211,238,0.20)" }}>
                      <Search className="h-3 w-3 text-slate-400 shrink-0" />
                      <input
                        autoFocus
                        type="text"
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        placeholder="Search category…"
                        className="flex-1 text-xs text-white bg-transparent outline-none placeholder:text-slate-500"
                      />
                      <button onClick={() => { setEditingCategory(false); setCategorySearch(""); }}>
                        <X className="h-3 w-3 text-slate-500 hover:text-slate-300" />
                      </button>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-white/10 ${
                            cat.id === business.businessType ? "text-cyan-300 bg-cyan-500/10" : "text-slate-300"
                          }`}
                        >
                          <CategoryIcon iconName={cat.icon} className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="flex-1 leading-tight">{cat.name}</span>
                          {cat.id === business.businessType && <Check className="h-2.5 w-2.5 text-cyan-400 shrink-0" />}
                        </button>
                      ))}
                      {filteredCategories.length === 0 && (
                        <p className="px-3 py-3 text-xs text-slate-500 text-center">No matches</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingCategory(true)}
                    className="flex items-center gap-1.5 group/cat rounded-lg px-1 py-0.5 -ml-1 hover:bg-white/8 transition-colors pointer-events-auto min-h-[44px]"
                    title="Change business category"
                  >
                    {activeCategory ? (
                      <>
                        <CategoryIcon iconName={activeCategory.icon} className="h-3 w-3 text-cyan-500 shrink-0" />
                        <span className="text-xs text-cyan-400">{activeCategory.name}</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-3 w-3 text-slate-600 shrink-0" />
                        <span className="text-xs text-slate-600 italic">Set category…</span>
                      </>
                    )}
                    <Pencil className="h-2 w-2 text-slate-600 opacity-0 group-hover/cat:opacity-100 transition-opacity ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Health score pill */}
          {hasScore && (
            <div className="shrink-0 flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-slate-500" />
                <span className={`text-sm font-bold tabular-nums ${hc.cls}`}>{score}%</span>
              </div>
              <span className={`text-[10px] font-semibold ${hc.cls}`}>{hc.text}</span>
              <span className="text-[9px] text-slate-500">{done}/{total} forms done</span>
            </div>
          )}
        </div>

        {/* Back to Chat wide button — vMobile-final-deploy-fix: min-h-[48px] touch target */}
        <button
          onClick={() => handleLeaveAttempt(onBackToChat)}
          className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 rounded-xl min-h-[48px] pointer-events-auto transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Chat
        </button>

        {/* vMobile-final-deploy-fix — Zoning button: min-h-[48px] touch target + pointer-events-auto for iOS Safari */}
        {onCheckZoning && !attachedZoningDoc && (
          <button
            onClick={handleOpenZoningPanel}
            className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-semibold transition-colors rounded-xl min-h-[48px] pointer-events-auto"
            style={{
              background: "rgba(34,211,238,0.08)",
              border:     "1px solid rgba(34,211,238,0.30)",
              color:      "rgb(103,232,249)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,211,238,0.14)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(34,211,238,0.08)")}
          >
            <Search className="h-3.5 w-3.5" />
            Check Zoning for this Address
          </button>
        )}

        {/* v67 — Compact zoning status strip when result is already attached */}
        {onCheckZoning && attachedZoningDoc && (() => {
          const sc = attachedZoningStatus ? ZONING_STATUS[attachedZoningStatus] : ZONING_STATUS.unknown;
          const { Icon } = sc;
          const raw = attachedZoningDoc.analysis?.rawExtracted as Record<string, unknown> | undefined;
          const zone = (raw?.zone_type as string | undefined) ?? (attachedZoningDoc.analysis?.issuingAuthority ?? "");
          return (
            <div className="mt-2 space-y-1.5">
              {/* Status strip */}
              <div
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${sc.color}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                  {zone ? <span className="text-[10px] text-slate-400 ml-1">· {zone}</span> : null}
                </div>
                {/* vBusinessProfile-LivingDashboard-Polish: min-h-[44px] + pointer-events-auto
                    (was bare text-[10px] with no touch target height). */}
                <button
                  onClick={handleOpenZoningPanel}
                  className="shrink-0 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors min-h-[44px] flex items-center px-1 pointer-events-auto"
                >
                  View
                </button>
              </div>
              {/* Stale-address banner */}
              {zoningIsStale ? (
                <button
                  onClick={handleOpenZoningPanel}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors pointer-events-auto min-h-[44px]"
                  style={{
                    background: "rgba(251,191,36,0.08)",
                    border:     "1px solid rgba(251,191,36,0.30)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(251,191,36,0.13)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(251,191,36,0.08)")}
                >
                  <AlertCircle className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="text-[10px] font-semibold text-amber-300 flex-1 leading-tight">
                    Location changed — update zoning check
                  </span>
                  <ChevronRight className="h-3 w-3 text-amber-400 shrink-0" />
                </button>
              ) : (
                /* vBusinessProfile-LivingDashboard-Polish: enlarged from py-0.5 to min-h-[44px]
                   flex items-center justify-center — was too small for reliable iOS tap target. */
                <button
                  onClick={handleOpenZoningPanel}
                  className="w-full flex items-center justify-center text-[10px] text-slate-500 hover:text-cyan-400 transition-colors min-h-[44px] pointer-events-auto"
                >
                  Update zoning check
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── v39 — Unsaved changes banner ──────────────────────────────────── */}
      {hasDrafts && (
        <div
          className="shrink-0 flex items-center gap-2.5 px-6 py-2.5"
          style={{ background: "rgba(251,191,36,0.08)", borderBottom: "1px solid rgba(251,191,36,0.2)" }}
        >
          <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-amber-300">
            {drafts.length} unsaved document{drafts.length !== 1 ? "s" : ""} — click Save Changes to attach to this profile
          </span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          Body — scrollable
          vMobile-final-deploy-fix: min-h-0 added so flex-1 can shrink below
          its content size and overflow-y-auto actually activates on mobile.
          Without min-h-0 the default min-height:auto prevents the div from
          shrinking, so content overflows the viewport instead of scrolling.
          ════════════════════════════════════════════════════════════════════ */}
      {/* vMobile-PostDeploy-CriticalFixPass: touch-action:pan-y — same iOS gesture routing fix
          as the zoning panel body. Ensures the profile body scroll container receives vertical
          swipe gestures on iOS Safari regardless of overflow:hidden on ancestor elements. */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain" style={{ touchAction: "pan-y" }}>
        {/* vMobile: tighter padding on phones */}
        <div className="px-4 sm:px-6 py-5 sm:py-7 space-y-8 sm:space-y-10 max-w-4xl mx-auto w-full">

          {/* ── v36/v41 — Compliance Stats (live from checklist) ────────── */}
          {/* vBusinessProfile-LivingDashboard-Polish: stats card redesigned for narrow phones.
              - Vertical h-10 w-px dividers removed: they orphan visually when flex-wrap fires
                on phones <380px (ring + 3 stat columns > viewport width).
              - Ring wrapped in <button> so tapping it scrolls to Recommended Forms below.
              - Pending + Expiring moved into a bottom 2-col grid so they never wrap into the
                ring column. This keeps the top row to ring + compliance label only.
              - Last-checked timestamp added below the compliance status label.
              - urgentCount drives red color (30d), expiringCount drives amber (60d). */}
          {showStats && (
            <section
              className="p-4 sm:p-5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Top row: clickable ring + compliance label */}
              <div className="flex items-center gap-4">
                {/* vBusinessProfile-LivingDashboard-Polish: ring is a button — tapping scrolls to
                    the Recommended Forms section. min-h/min-w 56px ensures ≥48px tap target with
                    the 72px SVG centered inside. pointer-events-auto for iOS Safari reliability. */}
                <button
                  onClick={() => recommendedFormsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="relative shrink-0 w-[72px] h-[72px] min-h-[56px] min-w-[56px] flex items-center justify-center rounded-full pointer-events-auto transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                  aria-label={hasScore ? `Compliance score ${score}% — tap to jump to required forms` : "Compliance ring — tap to jump to required forms"}
                  title="Jump to Recommended Forms"
                >
                  <svg viewBox="0 0 72 72" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden>
                    <circle cx="36" cy="36" r={RING_R} fill="none" strokeWidth="6" stroke="rgba(255,255,255,0.08)" />
                    {hasScore && (
                      <circle
                        cx="36" cy="36" r={RING_R} fill="none" strokeWidth="6"
                        strokeLinecap="round"
                        stroke={score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171"}
                        strokeDasharray={RING_CIRC}
                        strokeDashoffset={RING_CIRC * (1 - score / 100)}
                      />
                    )}
                  </svg>
                  <span className="relative z-10">
                    {hasScore ? (
                      <span className={`text-sm font-bold tabular-nums ${hc.cls}`}>{score}%</span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </span>
                </button>

                {/* Compliance label + last-checked */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Compliance</p>
                  <p className={`text-sm font-bold leading-tight mt-0.5 ${hasScore ? hc.cls : "text-slate-400"}`}>
                    {hasScore ? hc.text : "No data yet"}
                  </p>
                  {hasScore && (
                    <p className="text-[10px] text-slate-500 mt-0.5 tabular-nums">{done}/{total} forms done</p>
                  )}
                  {/* vBusinessProfile-LivingDashboard-Polish: last-checked timestamp */}
                  {business.lastChecked && (
                    <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                      <Activity className="h-2.5 w-2.5 shrink-0" />
                      Last reviewed {timeAgo(business.lastChecked)}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom row: Pending + Expiring in 2-col grid (only when checklist exists) */}
              {/* vBusinessProfile-LivingDashboard-Polish: grid layout prevents these from
                  wrapping into the ring column on phones <380px. No vertical dividers needed —
                  the grid gutter provides enough visual separation. */}
              {checklist.length > 0 && (
                <div
                  className="mt-3 pt-3 grid grid-cols-2 gap-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Pending</p>
                    <p className={`text-xl font-bold tabular-nums leading-tight mt-0.5 ${pendingCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {pendingCount}
                    </p>
                    <p className="text-[10px] text-slate-500">items remaining</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Renewals due
                      {urgentCount > 0 && <span className="text-red-400 ml-1">(!)</span>}
                    </p>
                    <p className={`text-xl font-bold tabular-nums leading-tight mt-0.5 ${
                      urgentCount > 0 ? "text-red-400" : expiringCount > 0 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {expiringCount}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {urgentCount > 0 ? `${urgentCount} within 30 days` : "within 60 days"}
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── vRuleChangeAlerts-Profile-Integration: Recent Rule Changes ── */}
          {/* Shown only when there are active (non-dismissed) alerts for this business.
              Hidden entirely when ruleAlerts is empty or undefined — no empty-state card,
              keeping the profile clean. Each card participates in the existing
              flex-1 min-h-0 overflow-y-auto scroll chain with no additional wrapper. */}
          {ruleAlerts && ruleAlerts.length > 0 && (
            <section>
              {/* Section header */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)" }}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <h2 className="text-sm font-bold text-white">Recent Rule Changes</h2>
                {/* Alert count badge */}
                <span
                  className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(251,191,36,0.18)",
                    border:     "1px solid rgba(251,191,36,0.40)",
                    color:      "rgb(251,191,36)",
                  }}
                >
                  {ruleAlerts.length}
                </span>
              </div>

              {/* Alert cards */}
              <div className="space-y-2.5">
                {ruleAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="rounded-xl p-4 flex flex-col gap-2"
                    style={{
                      background: "rgba(251,191,36,0.06)",
                      border:     "1px solid rgba(251,191,36,0.28)",
                    }}
                  >
                    {/* Top row: title + dismiss × */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Alert date — relative */}
                        <p className="text-[10px] font-semibold text-amber-500/80 mb-0.5">
                          {timeAgo(alert.date)}
                        </p>
                        <p className="text-xs font-bold text-white leading-snug">
                          {alert.title}
                        </p>
                      </div>
                      {/* vRuleChangeAlerts-Profile-Integration: dismiss button
                          min-h-[44px] min-w-[44px] + pointer-events-auto for iOS tap target */}
                      {onDismissAlert && (
                        <button
                          onClick={() => onDismissAlert(alert.id)}
                          className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-amber-300 transition-colors rounded-lg hover:bg-white/5 pointer-events-auto -mr-1 -mt-1"
                          aria-label="Dismiss alert"
                          title="Dismiss this alert"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Description — 2-line clamp so cards stay compact */}
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {alert.description}
                    </p>

                    {/* Footer: affected forms chip + Review Impact CTA */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      {/* Affected forms count chip */}
                      {alert.affectedForms.length > 0 && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <FileText className="h-2.5 w-2.5 shrink-0" />
                          {alert.affectedForms.length} form{alert.affectedForms.length !== 1 ? "s" : ""} affected
                        </span>
                      )}

                      {/* vRuleChangeAlerts-Profile-Integration: "Review Impact" button.
                          min-h-[48px] touch target + pointer-events-auto for iOS Safari.
                          Calls onReviewImpact (opens the full modal in page.tsx with
                          affected filings, what to do next, and deadline risk summary). */}
                      {onReviewImpact && (
                        <button
                          onClick={() => onReviewImpact(alert.id)}
                          className="ml-auto shrink-0 min-h-[48px] flex items-center gap-1.5 px-3 text-xs font-bold rounded-xl transition-colors pointer-events-auto"
                          style={{
                            background: "rgba(251,191,36,0.12)",
                            border:     "1px solid rgba(251,191,36,0.38)",
                            color:      "rgb(251,191,36)",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(251,191,36,0.20)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(251,191,36,0.12)")}
                        >
                          <Zap className="h-3 w-3 shrink-0" />
                          Review Impact
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Completed Documents ──────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Completed Documents</h2>
              <span className="text-xs text-slate-500">
                ({allCompletedDocs.length}{drafts.length > 0 ? ` + ${drafts.length} unsaved` : ""})
              </span>
            </div>

            {allCompletedDocs.length === 0 && drafts.length === 0 ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2.5" />
                <p className="text-sm text-slate-400 font-medium">No documents attached yet</p>
                <p className="text-xs text-slate-600 mt-1">
                  Use the Upload Completed button on a form card below, or drag a file onto it.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">

                {/* v39 — Draft docs (amber tint, Unsaved badge) */}
                {drafts.map(draft => (
                  <div
                    key={draft.localId}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.22)" }}
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}
                    >
                      <FileText className="h-4 w-4 text-amber-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{draft.file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 capitalize">{draft.formName}</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(draft.addedAt)}
                        </span>
                        <span className="text-[10px] text-slate-600 tabular-nums">
                          {formatFileSize(draft.file.size)}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded-full px-1.5 py-0.5">
                          Unsaved
                        </span>
                      </div>
                    </div>

                    {/* Remove draft */}
                    <button
                      onClick={() => setDrafts(prev => prev.filter(d => d.localId !== draft.localId))}
                      className="shrink-0 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                      title="Remove draft"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Saved docs — includes localSavedDocs + parent completedDocuments (deduped) */}
                {allCompletedDocs.map((doc, i) => {
                  // v67 — derive category badge from ALL_FORMS lookup
                  const isZoningDoc = doc.formId === "zoning-check" || doc.analysis?.docType === "Zoning Compliance Check";
                  const linkedForm  = doc.formId && !isZoningDoc ? ALL_FORMS[doc.formId] : undefined;
                  const docCat = isZoningDoc
                    ? { label: "ZONING", cls: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" }
                    : linkedForm && "category" in linkedForm
                      ? getCatLabel(linkedForm as FormEntry)
                      : null;

                  return (
                    <div
                      key={doc.id ?? i}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(34,211,238,0.10)", border: "1px solid rgba(34,211,238,0.20)" }}
                      >
                        <FileText className="h-4 w-4 text-cyan-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{doc.originalName}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {/* v67 — category badge */}
                          {docCat && (
                            <span className={`inline-flex ${BADGE_CLS} ${docCat.cls}`}>{docCat.label}</span>
                          )}
                          {doc.analysis?.docType && (
                            <span className="text-[10px] text-slate-500">{doc.analysis.docType}</span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(doc.uploadedAt)}
                          </span>
                          <span className="text-[10px] text-slate-600 tabular-nums">
                            {formatFileSize(doc.sizeBytes)}
                          </span>
                          {doc.analyzed ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-400/25 rounded-full px-1.5 py-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" />Analyzed
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-500 bg-white/5 border border-white/10 rounded-full px-1.5 py-0.5">
                              Attached
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => viewDoc(doc)}
                        className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── v35: Recommended Forms with drag-and-drop ────────────────── */}
          {/* vBusinessProfile-LivingDashboard-Polish: ref enables ring → scroll-to-forms */}
          {/* vZoningSmartRecommendations: zoningAwareSortedForms used instead of         */}
          {/*   recommendedForms directly — zoning-matched cards bubble to the top.       */}
          {zoningAwareSortedForms.length > 0 && (
            <section ref={recommendedFormsSectionRef}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <h2 className="text-sm font-bold text-white">Recommended Forms</h2>
                {/* vZoningSmartRecommendations: "Zoning-smart" pill shown when a zoning
                    result is active — signals to the user that the list is personalised. */}
                {zoningAwareFormIds.size > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 rounded-full px-1.5 py-0.5 shrink-0">
                    <MapPin className="h-2.5 w-2.5" />
                    Zoning-smart
                  </span>
                )}
                {business.location && (
                  <span className="text-xs text-slate-500">
                    {business.businessType ? `${business.businessType} · ` : ""}
                    {business.location}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mb-4 flex items-center gap-1.5">
                <UploadCloud className="h-3 w-3 shrink-0" />
                Drag a completed document onto any form card, or click Upload Completed to browse. Documents are saved when you click Save Changes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {zoningAwareSortedForms.map(entry => {
                  const isDownloadable = entry.isDownloadable && !!entry.pdfPath;
                  const downloaded     = downloadedIds.has(entry.id);
                  const isDragTarget   = dragTargetId === entry.id;

                  // v41 FIX — use allCompletedDocs (localSavedDocs merged with completedDocuments)
                  // so a just-saved doc appears immediately without waiting for parent re-render.
                  // formId exact match handles FormFiller synthetic docs and manually uploaded docs.
                  // analysis.matchedFormIds handles AI-analyzed docs matched to multiple forms.
                  const cardDocs = allCompletedDocs.filter(doc =>
                    doc.formId === entry.id ||
                    (doc.analysis?.matchedFormIds ?? []).includes(entry.id)
                  );
                  // v39 — pending draft for this card (amber badge, not yet saved)
                  const cardDraft = drafts.find(d => d.formId === entry.id);

                  // v44 — isCompleted drives card-level visual state
                  const isCompleted = cardDocs.length > 0;

                  // v67 — derive FEDERAL/STATE/COUNTY/CITY/TOWN label for this card
                  const { label: entryLabel, cls: entryCls } = getCatLabel(entry);

                  // vZoningSmartRecommendations: whether this card is flagged by zoning
                  const isZoningAware = zoningAwareFormIds.has(entry.id);
                  // vZoningSmartRecommendations: cyan left-border accent for zoning-aware
                  // cards that are not yet completed (completed uses emerald border instead).
                  const zoningBorderLeft = (isZoningAware && !isCompleted && !isDragTarget)
                    ? "2px solid rgba(34,211,238,0.55)"
                    : undefined;

                  return (
                    <div
                      key={entry.id}
                      onDragEnter={e => handleCardDragEnter(e, entry.id)}
                      onDragOver={handleCardDragOver}
                      onDragLeave={e => handleCardDragLeave(e, entry.id)}
                      onDrop={e => handleCardDrop(e, entry.id, entry.name)}
                      className="flex flex-col gap-2.5 p-4 rounded-xl transition-all duration-200"
                      style={{
                        // v44: completed cards get a distinct emerald treatment
                        background: isDragTarget
                          ? "rgba(34,211,238,0.08)"
                          : isCompleted
                            ? "rgba(52,211,153,0.07)"
                            // vZoningSmartRecommendations: subtle cyan tint for matched cards
                            : isZoningAware
                              ? "rgba(34,211,238,0.05)"
                              : "rgba(255,255,255,0.05)",
                        border: isDragTarget
                          ? "1.5px solid rgba(34,211,238,0.55)"
                          : isCompleted
                            ? "1.5px solid rgba(52,211,153,0.45)"
                            : cardDraft
                              ? "1px solid rgba(251,191,36,0.30)"
                              : "1px solid rgba(255,255,255,0.09)",
                        // vZoningSmartRecommendations: cyan left accent overrides the
                        // shorthand border only on the left side for matched cards.
                        borderLeft: zoningBorderLeft,
                        boxShadow: isDragTarget
                          ? "0 0 0 3px rgba(34,211,238,0.12)"
                          : isCompleted
                            ? "0 0 0 1px rgba(52,211,153,0.18)"
                            : isZoningAware
                              ? "0 0 0 1px rgba(34,211,238,0.10)"
                              : undefined,
                      }}
                    >
                      {/* Badge row — v67: FEDERAL/STATE/COUNTY/CITY/TOWN pill */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex ${BADGE_CLS} ${entryCls}`}>
                            {entryLabel}
                          </span>
                          {/* vZoningSmartRecommendations: cyan "Zoning-aware" badge shown
                              when this form ID is flagged by the active zoning result. */}
                          {isZoningAware && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 rounded-full px-1.5 py-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              Zoning-aware
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* v44 — green "Completed" badge; uses isCompleted for clarity */}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 rounded-full px-1.5 py-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Completed
                            </span>
                          )}
                          {/* v39 — amber "Pending save" badge for drafts */}
                          {cardDraft && !isCompleted && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded-full px-1.5 py-0.5">
                              Pending save
                            </span>
                          )}
                          {downloaded && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 rounded-full px-1.5 py-0.5">
                              <Download className="h-2.5 w-2.5" />
                              Downloaded
                            </span>
                          )}
                        </div>
                      </div>

                      {/* v44 — Form title + prominent filename block */}
                      <div>
                        <p className="text-xs font-semibold text-white leading-snug">{entry.name}</p>

                        {/* v44 — Prominent filename block when a doc is attached.
                            Renders as a full-width emerald pill so it's impossible to miss. */}
                        {isCompleted && (
                          <button
                            onClick={() => viewDoc(cardDocs[0])}
                            className="mt-1.5 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                            style={{
                              background: "rgba(52,211,153,0.10)",
                              border: "1px solid rgba(52,211,153,0.30)",
                            }}
                            title={`View: ${cardDocs[0].originalName}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span className="flex-1 text-[11px] font-semibold text-emerald-300 truncate">
                              {cardDocs[0].originalName}
                            </span>
                            <ExternalLink className="h-3 w-3 text-emerald-500 shrink-0" />
                          </button>
                        )}

                        {/* v39 — show draft filename in amber when pending */}
                        {cardDraft && !isCompleted && (
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-400/80 truncate">
                            <FileText className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{cardDraft.file.name}</span>
                            <span className="shrink-0 text-amber-600">(unsaved)</span>
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 flex-1">
                        {entry.description}
                      </p>

                      {/* v44 — Additional docs for this card (when >1 doc attached) */}
                      {cardDocs.length > 1 && (
                        <div className="flex flex-col gap-1">
                          {cardDocs.slice(1).map(doc => (
                            <div
                              key={doc.id}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                              style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.22)" }}
                            >
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold text-white truncate">{doc.originalName}</p>
                                <p className="text-[9px] text-slate-500 flex items-center gap-1">
                                  <Calendar className="h-2 w-2" />
                                  {formatDate(doc.uploadedAt)}
                                </p>
                              </div>
                              <button
                                onClick={() => viewDoc(doc)}
                                className="shrink-0 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-400/25 rounded px-2 py-0.5 transition-colors"
                                style={{ background: "rgba(52,211,153,0.08)" }}
                              >
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* v35 — Drop hint overlay */}
                      {isDragTarget && (
                        <div className="flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-cyan-400/50 bg-cyan-400/5">
                          <UploadCloud className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs font-semibold text-cyan-400">Drop to attach</span>
                        </div>
                      )}

                      {/* v44 — Action buttons: "View Document" primary when completed */}
                      <div className="mt-auto pt-1 flex items-center gap-2 flex-wrap">

                        {/* v44: completed → "View Document" is the primary CTA */}
                        {isCompleted ? (
                          <button
                            onClick={() => viewDoc(cardDocs[0])}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-[#0d1b35] transition-colors min-h-[44px] pointer-events-auto"
                            style={{ background: "rgb(52,211,153)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgb(110,231,183)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgb(52,211,153)")}
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Document
                          </button>
                        ) : isDownloadable ? (
                          <a
                            href={entry.pdfPath!}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            onClick={() => handleDownload(entry.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-[#0d1b35] transition-colors min-h-[44px] pointer-events-auto"
                            style={{ background: "rgb(34,211,238)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgb(103,232,249)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgb(34,211,238)")}
                          >
                            <Download className="h-3 w-3" />
                            Download Blank Form
                          </a>
                        ) : (
                          <a
                            href={entry.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-colors min-h-[44px] pointer-events-auto"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Official Site
                          </a>
                        )}

                        {/* v75 / vSeamlessProfileFormFillerBridge — "Complete with AI" button.
                            Always visible; disabled when already completed.
                            Shows "Opening…" briefly (pendingFormId) so the user gets
                            immediate tap feedback before the profile view closes. */}
                        {onStartForm && (
                          <button
                            onClick={() => {
                              if (!isCompleted && !pendingFormId) {
                                // vSeamlessProfileFormFillerBridge: brief visual feedback
                                // before parent closes the profile view and opens FormFiller.
                                setPendingFormId(entry.id);
                                onStartForm(entry.id);
                                // Safety reset — if parent doesn't close the view (no template),
                                // clear the pending state after 1 s so the button recovers.
                                setTimeout(() => setPendingFormId(null), 1000);
                              }
                            }}
                            disabled={isCompleted || pendingFormId === entry.id}
                            title={isCompleted ? "Already completed — view document above" : `Complete ${entry.name} with AI assistance`}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors min-h-[44px] pointer-events-auto ${
                              isCompleted
                                ? "opacity-40 cursor-not-allowed text-slate-400 bg-white/5 border border-white/10"
                                : "text-[#0d1b35]"
                            }`}
                            style={!isCompleted ? { background: "rgb(34,211,238)" } : undefined}
                            onMouseEnter={e => { if (!isCompleted) (e.currentTarget as HTMLButtonElement).style.background = "rgb(103,232,249)"; }}
                            onMouseLeave={e => { if (!isCompleted) (e.currentTarget as HTMLButtonElement).style.background = "rgb(34,211,238)"; }}
                          >
                            <Sparkles className="h-3 w-3" />
                            {pendingFormId === entry.id ? "Opening…" : "Complete with AI"}
                          </button>
                        )}

                        {/* Upload Completed (hidden input + button) — always available */}
                        <input
                          ref={el => { fileInputRefs.current[entry.id] = el; }}
                          type="file"
                          accept={ACCEPTED_EXTS}
                          className="hidden"
                          onChange={e => handleInputChange(e, entry.id, entry.name)}
                        />
                        {isCompleted ? (
                          /* Secondary action when already completed */
                          <button
                            onClick={() => fileInputRefs.current[entry.id]?.click()}
                            className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg text-slate-400 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-slate-300 transition-colors min-h-[44px] pointer-events-auto"
                            title={`Replace document for ${entry.name}`}
                          >
                            <Paperclip className="h-2.5 w-2.5" />
                            Replace
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => fileInputRefs.current[entry.id]?.click()}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-cyan-400 border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400/20 transition-colors min-h-[44px] pointer-events-auto"
                              title={`Attach your completed ${entry.name}`}
                            >
                              <Paperclip className="h-3 w-3" />
                              Upload Completed
                            </button>
                            <button
                              onClick={() => fileInputRefs.current[entry.id]?.click()}
                              className="text-[11px] text-slate-500 hover:text-cyan-400 underline underline-offset-2 transition-colors min-h-[44px] pointer-events-auto"
                            >
                              Browse files
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Footer ── vMobile-scale-fix: pb-safe clears iOS home bar for last item */}
          <div className="pb-6" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
            <button
              onClick={() => handleLeaveAttempt(onBackToChat)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </button>
          </div>

        </div>
      </div>

      {/* ── v39 — Save Changes sticky footer ─────────────────────────────── */}
      {/* vMobile-scale-fix: pb-safe / env(safe-area-inset-bottom) clears iOS home bar */}
      {hasDrafts && (
        <div
          className="shrink-0 px-6 py-4"
          style={{
            borderTop:         "1px solid rgba(251,191,36,0.2)",
            background:        "rgba(13,27,53,0.97)",
            paddingBottom:     "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <button
            onClick={() => { void handleSave(); }}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
            style={{
              background: saving ? "#1d4ed8" : "#2563eb",
              boxShadow: "0 0 0 1px rgba(37,99,235,0.5)",
            }}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; }}
            onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
          >
            <SaveAll className="h-4 w-4" />
            {saving
              ? "Saving…"
              : `Save ${drafts.length} Document${drafts.length !== 1 ? "s" : ""} to Profile`}
          </button>
          <button
            onClick={handleDiscard}
            disabled={saving}
            className="mt-2 w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
          >
            Discard unsaved documents
          </button>
        </div>
      )}
    </div>
  );
}
