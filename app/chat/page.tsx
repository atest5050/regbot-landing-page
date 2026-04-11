// vMobile-final-fix — Fixed icons + Google Ads conversion tracking + mobile scaling
//        Send button clickability restored: root shell changed from h-dvh to
//        calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)).
//        body safe-area padding (from layout.tsx vMobile-scale-fix) + h-dvh caused the
//        flex container to overflow the body content area on iOS — the send button and
//        bottom form-card buttons fell below the tappable viewport edge on devices
//        with notch / home-bar (iPhone X+). Subtracting the insets from root height
//        makes it fit exactly within the body content area on every device; on desktop
//        and older iPhones where env() returns 0 the calc degenerates to h-dvh unchanged.
//        Input bar wrapper: relative z-10 ensures correct stacking above positioned ancestors.
// vMobile-scale-fix — Fixed aspect ratio / scaling for Business Profile on mobile
//        Outer shell: h-screen → h-dvh (avoids iOS Safari address-bar gap).
//        BusinessProfileView container: uses flex-1 overflow-hidden so the profile
//        fills the available viewport without overflowing or truncating on phones.
// v77 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES: str-local-occupancy-tax, farmers-market-vendor-license,
//        vape-smoke-shop-retail-license, door-to-door-solicitor-permit,
//        hair-braiding-natural-hair-license.
//        13 new LOCAL_FORMS: Omaha/Douglas NE, Baton Rouge LA, Birmingham/Jefferson AL,
//        Wichita/Sedgwick KS, Spokane WA, Tacoma/Pierce WA, Madison/Dane WI,
//        Riverside CA, San Bernardino CA, Bakersfield/Kern CA, Colorado Springs CO,
//        Anchorage AK, Greenville SC.
//        buildZoningSeed deepened: STR/vacation zones → occupancy tax pre-fill;
//        retail/commercial zones → vape shop and solicitor permit hints.
//        FIELD_SKIP_CONDITIONS: platformRemitsTax, vendorProductType, vapeProductTypes,
//        trainingHoursCompleted, trainingSchool, solicitorType.
// Mobile responsiveness overhaul — vMobile
//        Sidebar collapses to a slide-in drawer on mobile (< md breakpoint).
//        Hamburger menu button added to chat header for mobile navigation.
//        Chat messages, input area, and header all scale for small screens.
//        FormFiller and modals adjust padding/layout for phones.
// v76 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (painting-contractor-license, masonry-contractor-license,
//        commercial-pool-health-permit, cosmetologist-individual-license, towing-company-license)
//        13 new LOCAL_FORMS: Chandler AZ, Henderson NV, Irvine CA, Plano TX, Hialeah FL,
//        Fort Lauderdale FL, Chula Vista CA, Fremont CA, Gilbert AZ, Garland TX,
//        Springfield MO, Peoria IL, Yonkers/Westchester NY.
//        buildZoningSeed deepened: residential/commercial zone → form-specific pre-fills.
//        FIELD_SKIP_CONDITIONS: hasLifeguard, hasDrainCover, hasLeadCert, numVehicles, etc.
// v75 — "Complete with AI" buttons added to Business Profile recommended forms cards
//        handleStartFormFromProfile: closes profile view, resolves locale template for
//        the clicked form using the loaded business's location + county, and opens the
//        Form Filler pre-filled with current business profile data (name, location,
//        businessType, ownerName, EIN, phone, email from completedFormsByFormId).
//        onStartForm prop wired to <BusinessProfileView>.
//        Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration:
//        5 new FORM_TEMPLATES (funeral-home-license, pharmacy-permit,
//        social-worker-practice-license, real-estate-broker-license,
//        alcohol-catering-endorsement) +
//        13 new LOCAL_FORMS: Boise/Ada ID, Des Moines/Polk IA, Spokane WA, Winston-Salem NC,
//        Knoxville TN, Lexington KY, Albuquerque NM, Aurora CO, Anaheim CA,
//        Corpus Christi TX, Killeen TX, Beaumont TX, Santa Ana CA.
// v74 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (childcare-center-license, pool-spa-contractor-license,
//        landscape-contractor-license, security-guard-company-license, food-manufacturer-license) +
//        13 new LOCAL_FORMS: Reno/Washoe NV, Portland ME, Manchester NH, Tallahassee FL,
//        Pensacola FL, Huntsville AL, Savannah GA, Montgomery AL, Macon GA,
//        Sioux Falls SD, Modesto/Stanislaus CA, Salinas/Monterey CA, Lafayette LA.
// v73 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (plumbing-contractor-license, hvac-contractor-license,
//        pest-control-license, vehicle-repair-shop-license, roofing-contractor-license) +
//        13 new LOCAL_FORMS for metros: Syracuse NY, Grand Rapids MI, Fayetteville NC,
//        Akron OH, Fort Collins CO, Stockton CA, Cape Coral FL, Paterson NJ, Hampton VA,
//        Amarillo TX, Laredo TX, Oxnard/Ventura CA, Santa Cruz CA.
// v72 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (barbershop-cosmetology-salon-permit, tattoo-body-art-studio-permit,
//        electrical-contractor-license, pet-grooming-salon-license, commercial-kitchen-shared-permit) +
//        13 new LOCAL_FORMS for major metros (Boston MA, Seattle WA, Denver CO, Pittsburgh PA,
//        Cleveland OH, Detroit MI, Memphis TN, Salt Lake City UT, Providence RI, Omaha NE,
//        Milwaukee WI, Tulsa OK, Anchorage AK). buildZoningSeed deepened with zoneType keyword
//        mapping for commercial/residential/industrial zoning pre-fills.
// v71 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (notary-public-commission, auto-dealer-license,
//        charitable-solicitation-registration, food-truck-city-permit, event-alcohol-permit) +
//        11 new LOCAL_FORMS for mid-size metros (Jersey City NJ, Newark NJ, Rochester NY,
//        New Haven CT, Chattanooga TN, Little Rock AR, Columbia SC, Augusta GA,
//        Shreveport LA, Mobile AL, Jackson MS).
// v70 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (short-term-rental-permit, tobacco-retail-license,
//        food-facility-annual-renewal, massage-establishment-permit, secondhand-dealer-license) +
//        14 new LOCAL_FORMS for high-volume metros (Phoenix AZ, San Antonio TX, Nashville TN,
//        Indianapolis IN, Columbus OH, Jacksonville FL, Tampa city FL, Louisville KY, Buffalo NY,
//        Tucson AZ, El Paso TX, Austin/Travis TX, Sacramento CA, Portland OR, Virginia Beach VA).
//        Fixed zoningProfile extraction: raw?.zone_type (underscore) checked alongside raw?.zoneType.
//        New local forms auto-attach to the correct form card via onSaveDocument handler.
// v68 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (special-event-permit, outdoor-dining-permit, catering-license,
//        childcare-home-license, professional-license-registration) + 14 new LOCAL_FORMS for
//        underserved metros (Long Beach CA, Baltimore MD, Minneapolis MN, Raleigh/Wake NC,
//        Durham NC, New Orleans LA, Albuquerque NM, Tampa/Hillsborough FL, Fort Worth/Tarrant TX,
//        Norfolk VA, Des Moines/Polk IA, Boise/Ada ID, Knoxville/Knox TN, Lexington/Fayette KY).
//        No page.tsx logic changes required — FormFiller wiring already correct.
// v67 — Adaptive Zoning Checker + category labels on all requirement cards
//        BusinessProfileView now detects attached zoning results, compares addresses, and
//        shows an "Update for new address" banner when location changes. No page.tsx wiring
//        changes required — handleCheckZoning + handleAttachZoningResult already wire correctly.
// v66 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new guided wizard FORM_TEMPLATES (food-service-plan-review, employer-withholding-registration,
//        business-personal-property-tax, zoning-compliance-letter-request, health-dept-inspection-checklist)
//        + 15 new LOCAL_FORMS (Omaha, Baton Rouge, Birmingham, Wichita, Spokane, Tacoma, Madison WI,
//        Riverside CA, San Bernardino CA, Kern/Bakersfield CA, Colorado Springs, Anchorage, Greenville SC).
// v65 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new guided wizard FORM_TEMPLATES (building-permit, food-manager-certification,
//        resale-certificate, workers-comp-exemption, dba-county-registration) + 15 new LOCAL_FORMS.
// v64 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        7 new guided wizard FORM_TEMPLATES (temporary-food-vendor, cottage-food, liquor-license,
//        sign-permit, fire-inspection, alarm-permit, sidewalk-vending) + 15 new LOCAL_FORMS.
//        FormFiller now shows a variance suggestion callout when zoning is conditional/prohibited.
// v63 — Aggressive Form Assistant expansion for hyper-local regulations with more local forms + Zoning integration
//        FormFiller now receives zoningProfile extracted from attached zoning check document
//        so zone-aware fields are pre-seeded and a contextual advisory banner is shown.
// v62 — Expanded Form Assistant with more federal/state/local forms + improved PDF pre-filling
//        FormFiller now receives enriched businessProfile (ownerName, ein, phone, email)
//        derived from previously completed form data so new forms auto-fill more fields.
// v52 — Fixed build errors for Vercel deployment
// Changes summary:
// - Expanded manual location input to support ZIP, "City, ST", and "City, Full State Name"
// - Added STATE_NAME_TO_ABBREV map for better full-state parsing
// - Added basic county detection using CITY_TO_COUNTY map and Zippopotam data
// - Location display and API calls now include detected county when available
// - "Save to Checklist" button hidden on initial intro message (id "1")
// - Added completedFormsByFormId state: tracks every completed form (single + queue)
//   so "View Completed Form" button in EnhancedChecklist always has data to show.
// - handleFormComplete now stores completed form data for all completions, not just queue.
// - handleViewCompletedForm: shows PacketScreen for a single completed form from checklist.
// - handleLoadBusiness restores completedFormsByFormId from saved data.
// - handleSaveBusiness uses completedFormsByFormId as fallback for single-form completions.
// - GPS state normalization fix: Nominatim sometimes returns full state name instead of
//   abbreviation (when ISO3166-2-lvl4 is absent). Now normalizes via STATE_NAME_TO_ABBREV
//   so userLocation always uses 2-letter state code and locale overrides fire correctly.
// - GPS unincorporated-area fix: Nominatim address parsing now tries hamlet/suburb/
//   neighbourhood fields in addition to city/town/village. When no city-level name is
//   found (e.g. unincorporated Palm Beach County ZIP 33411), the county name is used as
//   the location display so userLocation becomes "Palm Beach County, FL 33411" rather
//   than "Unknown City, FL 33411". detectedCounty is still set independently.
// - GPS trimming fix: All values derived from Nominatim (city, state, zip, county) are
//   trimmed to prevent trailing whitespace from breaking parseStateFromLocation's regex.
// - County-aware template resolution: handleStartForm and handleStartAllForms now pass
//   detectedCounty as the third argument to getLocaleFormTemplate(). This enables county-level
//   URL matching (e.g. Palm Beach County → pbcgov.org for business-license) before falling
//   back to state-level and finally the base SBA template. This eliminates the "Find Local
//   Office" gray-out for users whose county has a known portal.
// - isSbaUrl helper added: PacketScreen "Submit Online" button is hidden (not rendered)
//   when the template's portal URL is the generic SBA fallback, preventing broken SBA links
//   in the compliance packet for city/county-level forms (business-license, home-occupation).
// - Compliance Health Score card: prominent sidebar card between the "Compliance Dashboard"
//   label and the checklist. Shows an SVG ring with colour-coded score (green ≥80%, amber
//   50–79%, red <50%), pending item count, and expiring renewal count. Clicking the card
//   scrolls to the checklist; clicking the renewal count scrolls to the renewals section.
// - healthScore useMemo: recalculates from live checklist state on every render, including
//   after handleLoadBusiness, so returning users immediately see their current posture.
// - Upcoming Renewals: now shows ALL items with a renewalDate (removed 90-day cutoff);
//   urgency colouring (red/amber/green) still applied; section ref added for scroll targeting.
// - renewalsSectionRef: allows health card to scroll directly to the renewals list.
// - useMemo + Activity icon added to imports.
// - Rule Change Alerts: RuleAlert interface, ALERTS_KEY localStorage, loadAlerts/saveAlerts,
//   buildAlertCopy (location-aware alert copy), generateMockAlertForBusiness (picks the
//   highest-priority form from a saved business's checklist and generates one realistic
//   alert per business per month using getRuleChangeTopics from formTemplates.ts).
// - ruleAlerts state: loaded from localStorage on mount; new alerts generated whenever
//   savedBusinesses changes and a business has no existing alert.
// - alertedFormIds useMemo: Set<string> of form IDs with active (non-dismissed) alerts;
//   passed to EnhancedChecklist so affected items get an amber "Updated" badge.
// - alertsSectionRef + dismissAlert callback.
// - "Recent Rule Changes" sidebar section: amber-accented cards, one per active alert,
//   each with business name, title, one-sentence description, date, "Review Impact" button
//   (scrolls to checklist), and dismiss ×.
// - Zap icon added to imports.
// - getRuleChangeTopics added to formTemplates import.
// - Saved Business Living Profile: SavedBusiness extended with healthScore?, totalForms?,
//   completedFormsCount?, lastChecked?. handleSaveBusiness now calculates and persists
//   these fields at save time. handleLoadBusiness restores them; loadedBusiness state
//   tracks the currently active profile so the checklist header can display it.
// - loadedBusiness state + setLoadedBusiness: records the last-loaded SavedBusiness so
//   EnhancedChecklist can show a "[Name] — [Location]" header with a health ring.
// - calcBizProfile helper: computes healthScore, totalForms, completedFormsCount from a
//   checklist + completedForms array — single source of truth for save and pill rendering.
// - relativeDate helper: converts an ISO date string to a human-readable age
//   ("Checked today", "Checked 3 days ago", "Checked 2 months ago").
// - My Businesses pills redesigned as rich profile cards: small colour-coded health dot,
//   "X/Y forms" count, relative last-checked date, soft amber or red highlight when
//   health score is low (<50%) or an active rule-change alert exists for the business.
// - BusinessCard sub-component: self-contained pill renderer that derives alert state
//   from ruleAlerts and urgency from stored healthScore.
// - Supabase auth integration: email/password and magic-link sign-in via a compact
//   collapsible panel in the sidebar header. Auth state drives save/load routing:
//   authenticated users → Supabase; guests → localStorage (unchanged behaviour).
// - SavedBusiness, RuleAlert, MonthlyUsage types moved to lib/regbot-types.ts.
// - All localStorage helpers replaced by DB-agnostic functions from lib/regbot-db.ts
//   (localLoad*, localSave*, dbLoad*, dbSave*, syncGuestDataToSupabase).
// - Auth useEffect: calls getSession() on mount; subscribes to onAuthStateChange.
//   SIGNED_IN event triggers syncGuestDataToSupabase then reloads from Supabase.
//   SIGNED_OUT falls back to localStorage.
// - handleSaveBusiness made async; calls dbSaveBusiness (Supabase + localStorage cache).
// - handleLoadBusiness stamps lastChecked in Supabase via dbSaveBusiness.
// - Monthly usage tracked in profiles table for auth users; localStorage for guests.
// - isPro loaded from profiles.is_pro on mount (defaults true for MVP).
// - Auth UI: compact sign-in/sign-up/magic-link panel between brand header and location.
//   Shows sync status when authenticated; collapsible form for guests.
// - Pro tier gating: isPro state (default true; toggleable in brand header for MVP).
//   FREE_MONTHLY_LIMIT = 3 AI form completions/month tracked in localStorage.
//   handleStartForm + handleStartAllForms check the gate; handleFormComplete increments.
//   Non-Pro users see the limit counter and upgrade CTA in the checklist. Pro users see
//   a Crown badge in the brand header, "Pro" label on business pills, and no upsell banners.
// - PacketScreen Pro upsell updated: full 6-benefit list with correct $19/mo pricing.
// - Pro upsell banner in sidebar: shown only for non-Pro users above My Businesses.
//   Lists top three differentiating benefits and links to upgrade.
// - Button cleanup: per-bullet "Complete Form with AI" buttons removed from chat responses.
//   "Save to Checklist" button removed (auto-save via extractAndAddToChecklist handles this).
//   "Complete All Required Forms with AI" is now shown whenever ≥1 form is identified
//   (was ≥2), so there is always one clear CTA at the bottom of an actionable response.
//   Individual form actions live exclusively in the EnhancedChecklist sidebar.
//
// ── RETENTION DRIVER: Saved Business Living Profile ────────────────────────────────────
// The living profile turns every saved business into a persistent compliance dashboard:
//
// 1. SINGLE SOURCE OF TRUTH — Users see their business's health score, forms progress,
//    and last-checked date the moment they return. No re-running the AI chat required.
//    This makes RegBot the place users go first when they think about compliance.
//
// 2. PORTFOLIO EFFECT — When a user has 2–3 saved businesses, each with different health
//    scores and upcoming renewals, the sidebar becomes a compliance portfolio. Managing
//    multiple businesses without RegBot becomes unthinkable — high switching cost.
//
// 3. URGENCY SIGNALLING — Businesses with low health or active alerts get a soft colour
//    highlight in the pill list, drawing attention without nagging. Users instinctively
//    click the red/amber pill to fix the problem, deepening engagement.
//
// 4. TEMPORAL ANCHORING — "Checked 14 days ago" creates a sense that the profile is
//    live and perishable. Users feel compelled to check in again before the data goes
//    stale, creating a natural weekly re-engagement loop.
//
// Future (Supabase): replace localStorage with a `businesses` table row that includes
// health_score, total_forms, completed_forms_count, and last_checked columns. A daily
// cron job re-scores each business from its completed_forms rows and pushes updated
// health scores to the dashboard, keeping profiles accurate even when users are away.
// ─────────────────────────────────────────────────────────────────────────────────────────
//
// ── PRO TIER VALUE PROPOSITION ($19/mo) ──────────────────────────────────────────────────
// Six concrete differentiators that justify the monthly price for a small business owner:
//
// 1. UNLIMITED AI FORM COMPLETIONS — Free tier is capped at 3/month. Most small businesses
//    have 4–7 required filings. Hitting the cap mid-checklist is a natural conversion moment:
//    the user has already invested time and is one click from finishing — the path of least
//    resistance is upgrading, not abandoning.
//
// 2. AUTOMATIC RENEWAL FILING ASSISTANCE — Pro pre-fills renewal forms with data from the
//    original filing. This alone saves 20-40 minutes per renewal and eliminates the risk of
//    forgetting a detail. Users who experience this once are extremely unlikely to churn —
//    they have no system to replicate it outside RegBot.
//
// 3. QUARTERLY COMPLIANCE CHECK-IN PDF — A branded, shareable PDF of health score, upcoming
//    renewals, and rule changes, delivered every 90 days. This is the artifact the user
//    emails to their accountant, landlord, or business partner — external sharing creates
//    viral distribution and the report becomes a tangible deliverable justifying the fee.
//
// 4. PRIORITY SUPPORT — "Priority response from our team" is low-cost for the team and
//    high-perceived-value for small business owners who are used to being ignored by software
//    companies. It creates trust and dramatically reduces churn from confused users.
//
// 5. RULE CHANGE ALERTS — Free users see the alert feature exists but can't access all
//    details or get email push notifications. Pro users get every alert plus the monthly
//    email digest. The fear of missing a compliance change that incurs a penalty is a more
//    powerful retention driver than any positive feature.
//
// 6. AD-FREE, EARLY ACCESS — Remove future upsell prompts the moment the user is Pro.
//    Zero cognitive friction. Combined with early access to new jurisdictions, Pro users feel
//    like insiders — building identity-level loyalty, not just transactional retention.
// ─────────────────────────────────────────────────────────────────────────────────────────
//
// ── RETENTION DRIVER: Compliance Health Score ────────────────────────────────────────────
// The health score creates persistent value visibility for RegBot Pro subscribers:
//
// 1. ANXIETY REDUCTION LOOP — Users see a concrete risk number (e.g. "47% compliant")
//    every time they open the sidebar. This creates urgency without nagging, and makes
//    RegBot feel indispensable rather than optional.
//
// 2. PROGRESS REINFORCEMENT — Each completed form visibly bumps the ring from red → amber
//    → green. The colour transition is a dopamine trigger that rewards engagement and drives
//    users to complete the full checklist before cancelling their subscription.
//
// 3. RENEWAL STICKINESS — Once renewal dates are tracked, users have a concrete reason to
//    keep the subscription active: the app warns them before costly penalties. Cancelling =
//    losing that safety net (and the score drops back to unknown).
//
// 4. LOAD-BUSINESS RECALCULATION — Returning users immediately see their current compliance
//    posture without re-running the AI chat. This "instant value" moment reduces churn from
//    users who forget what they have accomplished.
// ─────────────────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect, useCallback, useMemo, Fragment } from "react";
import Link from "next/link"; // v22 — Forms Library full-page link
import {
  Send, MapPin, FileText, Layers,
  CheckCircle2, Loader2, CheckCheck, Sparkles,
  Briefcase, ChevronRight, ChevronDown, Download, ExternalLink,
  Bell, BellOff, Activity, Zap, Crown, Lock, Plus, Trash2, Upload,
  LogIn, LogOut, Mail, KeyRound, UserPlus, X as XIcon,
  FolderOpen, // v20 — Forms Library Section
  Menu, // vMobile — hamburger for mobile sidebar toggle
} from "lucide-react";
import AddBusinessModal from "@/components/AddBusinessModal";
import AddLocationModal from "@/components/AddLocationModal";
import NotificationPrefsModal from "@/components/NotificationPrefsModal";
import DocumentUploadButton, { type AnalysisResult, type AttachResult } from "@/components/DocumentUploadButton";
import DocumentAnalysisCard, { type MatchedItem } from "@/components/DocumentAnalysisCard";
import FormsLibrary, { saveBusinessContext } from "@/components/FormsLibrary"; // v20 — Forms Library Section
import BusinessProfileView, { type DraftDoc, type ZoningResult } from "@/components/BusinessProfileView"; // v31 — Business Profile View
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormFiller from "@/components/FormFiller";
import { RegPulseIcon } from "@/components/RegPulseLogo";
import EnhancedChecklist from "@/components/EnhancedChecklist";
import type { ChecklistItem } from "@/components/EnhancedChecklist";
import { getLocaleFormTemplate, getSuggestedRenewalDate, getRuleChangeTopics, parseStateFromLocation, getRecommendedForms, ALL_FORMS, isFederalForm, isStateForm } from "@/lib/formTemplates";
import type { FormTemplate, FederalFormEntry, StateFormEntry } from "@/lib/formTemplates";
import type { CompletedFormEntry } from "@/lib/generateCompliancePacket";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { SavedBusiness, SavedMessage, RuleAlert, MonthlyUsage, NotificationPrefs, UploadedDocument, BusinessLocation } from "@/lib/regbot-types";
import {
  localLoadBusinesses, localSaveBusiness,
  localLoadAlerts, localSaveAlerts,
  localLoadMonthlyUsage, localSaveMonthlyUsage,
  dbLoadBusinesses, dbSaveBusiness, dbDeleteBusiness, dbSaveNotificationPrefs, dbSaveDocument,
  dbLoadDocuments,
  dbLoadAlerts, dbSaveAlerts,
  dbLoadMonthlyUsage, dbSaveMonthlyUsage, dbLoadIsPro,
  syncGuestDataToSupabase,
  getCurrentMonthKey,
} from "@/lib/regbot-db";

// SavedBusiness is now imported from lib/regbot-types.ts

/** Calculates the living-profile stats from the current checklist + completed forms. */
function calcBizProfile(
  checklist: ChecklistItem[],
  completedForms?: CompletedFormEntry[],
): { healthScore: number; totalForms: number; completedFormsCount: number } {
  const total     = checklist.length;
  const done      = checklist.filter(i => i.status === "done").length;
  const score     = total > 0 ? Math.round((done / total) * 100) : 0;
  // completedForms from the AI filler may include forms not in the checklist list,
  // so use the larger of the two counts as the "total forms" denominator.
  const formTotal = Math.max(total, (completedForms?.length ?? 0));
  return {
    healthScore:        score,
    totalForms:         formTotal,
    completedFormsCount: done,
  };
}

/**
 * Returns a human-readable age for an ISO date string.
 * e.g. "today", "3 days ago", "2 months ago"
 */
function relativeDate(isoString: string): string {
  const then  = new Date(isoString);
  const now   = new Date();
  const days  = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (days === 0)  return "today";
  if (days === 1)  return "yesterday";
  if (days < 30)   return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 mo ago";
  if (months < 12)  return `${months} mo ago`;
  return `${Math.floor(months / 12)}yr ago`;
}

// RuleAlert is now imported from lib/regbot-types.ts

// ── Alert copy builder (location-aware) ───────────────────────────────────────
// Converts a topic string + form + location into a realistic one-sentence alert.
//
// EXAMPLE COPY — Food Truck:
//   "Palm Beach County updated commissary kitchen inspection requirements for mobile
//    food vendors. Ensure your commissary agreement is with a currently licensed
//    facility and maintain updated commissary logs on file during all operations."
//
// EXAMPLE COPY — Home Bakery:
//   "Florida raised the cottage food gross annual sales limit to $75,000.
//    If your home-based food business was approaching the previous $50,000 cap,
//    you may now operate at a higher volume without transitioning to a full
//    commercial food permit."

function buildAlertCopy(
  formId: string,
  location: string,
  topic: string,
): { title: string; description: string } {
  const state = parseState(location);

  if (formId === "mobile-food-vendor") {
    if (topic.includes("commissary")) {
      return {
        title: "Commissary Kitchen Requirement Update",
        description: state === "FL"
          ? "Florida updated commissary kitchen licensing requirements for mobile food vendors. Confirm your commissary agreement is with a currently licensed facility — unannounced inspections may verify this on-site."
          : "Your local health department updated commissary kitchen documentation requirements for food trucks. Keep your commissary agreement current and on the vehicle during all operations.",
      };
    }
    if (topic.includes("operating zone") || topic.includes("vending district") || topic.includes("zone map")) {
      return {
        title: "Permitted Operating Zone Update",
        description: "Your city or county updated the map of zones where mobile food vendors may operate. Review the current permitted list before booking your next event or regular stop to avoid citations.",
      };
    }
    if (topic.includes("AB 626") || topic.includes("microenterprise") || topic.includes("home kitchen")) {
      return {
        title: "CA Microenterprise Home Kitchen Permits Expanded",
        description: "California AB 626 microenterprise home kitchen (MEHKO) permits are now available in additional counties. If you cook from home, you may qualify for a permit that eliminates the commissary kitchen requirement.",
      };
    }
    if (topic.includes("NYC") || topic.includes("license cap")) {
      return {
        title: "NYC Mobile Food Vendor License Cap Legislation",
        description: "New York City is expanding the number of available mobile food vendor licenses. New licenses may become available in your borough — check the NYC Consumer & Worker Protection site for application windows.",
      };
    }
    return {
      title: "Mobile Food Vendor Permit Rules Updated",
      description: `Your ${state ?? "local"} jurisdiction updated mobile food vendor permit requirements. Review the latest rules to confirm your current setup remains compliant before your next renewal date.`,
    };
  }

  if (formId === "food-service-permit") {
    if (topic.includes("DBPR") || (state === "FL" && topic.includes("inspection"))) {
      return {
        title: "Florida DBPR Inspection Fee Schedule Updated",
        description: "Florida DBPR updated annual food service establishment inspection fees effective the next fiscal year. Review your current permit tier to confirm the correct renewal amount before your next filing date.",
      };
    }
    if (topic.includes("allergen") || topic.includes("labeling")) {
      return {
        title: "Allergen Labeling Requirements Tightened",
        description: "Updated rules now require clearer menu labeling for all nine major food allergens. Restaurants and catering businesses should update menus, staff training materials, and any printed packaging accordingly.",
      };
    }
    if (topic.includes("CalCode") || (state === "CA" && topic.includes("standards"))) {
      return {
        title: "California Retail Food Facility Standards Updated",
        description: "California updated CalCode retail food facility standards. Key changes affect temperature logging requirements, handwashing station placement, and equipment sanitation records for all food service operations.",
      };
    }
    if (topic.includes("Article 81") || topic.includes("NYC Health")) {
      return {
        title: "NYC Health Code Article 81 Amendment",
        description: "New York City updated Health Code Article 81 food service requirements. The amendment clarifies letter grading procedures and expands required food handler training documentation for establishments with 10+ employees.",
      };
    }
    if (topic.includes("Cook County") || topic.includes("ordinance")) {
      return {
        title: "Cook County Food Establishment Ordinance Updated",
        description: "Cook County updated its food establishment ordinance affecting inspection frequency and permit tiers. Review your current classification to ensure your renewal filing reflects any reclassification.",
      };
    }
    return {
      title: "Food Service Permit Requirements Updated",
      description: `Your ${state ?? "local"} health department updated food service establishment standards. Confirm your facility's current practices align with the latest inspection criteria before your next renewal.`,
    };
  }

  if (formId === "home-occupation-permit") {
    if (topic.includes("cottage food") || topic.includes("sales limit")) {
      return {
        title: "Cottage Food Sales Limit Increased",
        description: state === "FL"
          ? "Florida raised the cottage food gross annual sales limit to $75,000. Home-based food businesses approaching the previous $50,000 cap may now operate at a higher volume without transitioning to a commercial food permit."
          : "Your state updated cottage food gross sales limits for home-based food producers. Review the new threshold to understand when a commercial kitchen license becomes required for your business.",
      };
    }
    if (topic.includes("AB 2374") || topic.includes("zoning protection")) {
      return {
        title: "CA Home-Based Business Zoning Protections Expanded",
        description: "California AB 2374 expanded home occupation permit protections. Local zoning agencies may no longer impose certain restrictions on home businesses operating without customer visits or exterior modifications.",
      };
    }
    if (topic.includes("parking")) {
      return {
        title: "Home Occupation Parking Rules Updated",
        description: "Your municipality updated parking restrictions for home-based businesses that receive client visits. Review the current allowed vehicle count and appointment scheduling rules to avoid zoning complaints.",
      };
    }
    return {
      title: "Home Occupation Permit Requirements Updated",
      description: `Your ${state ?? "local"} jurisdiction updated home occupation permit rules. Review the current rules for signage, customer visits, and employee limits to confirm your home business remains compliant.`,
    };
  }

  if (formId === "business-license") {
    if (topic.includes("BTR") || (state === "FL" && topic.includes("fee"))) {
      return {
        title: "Business Tax Receipt Fee Schedule Updated",
        description: "The county Business Tax Receipt (BTR) fee schedule was updated for the upcoming fiscal year. Verify the new fee amount before submitting your annual BTR renewal to avoid underpayment and potential late penalties.",
      };
    }
    if (topic.includes("Measure ULA") || topic.includes("gross receipts") || topic.includes("tier")) {
      return {
        title: "Business License Fee Tier Updated",
        description: "Your city updated gross receipts-based business license fee tiers. Businesses with revenue over certain thresholds may see a rate change — review your current tier before the next renewal cycle.",
      };
    }
    if (topic.includes("B&O") || state === "WA") {
      return {
        title: "Washington B&O Tax Rate Adjusted",
        description: "Washington State updated Business & Occupation (B&O) tax rates for certain service and retail classifications. Review your current B&O classification to confirm you are filing at the correct rate.",
      };
    }
    return {
      title: "Business License Renewal Terms Updated",
      description: `Your ${state ?? "local"} jurisdiction updated business license requirements or fee amounts. Review the updated terms and confirm your business classification is still accurate before your next renewal.`,
    };
  }

  if (formId === "sales-tax-registration") {
    if (topic.includes("remote seller") || topic.includes("nexus")) {
      return {
        title: "Economic Nexus Rules Updated",
        description: state === "TX"
          ? "Texas Comptroller updated remote seller economic nexus guidance. Businesses with over $500,000 in Texas sales must collect and remit sales tax — confirm your current filing frequency and nexus status."
          : "Your state updated economic nexus thresholds for remote sellers. Review whether recent sales volume changes affect your sales tax collection and remittance obligations.",
      };
    }
    if (topic.includes("district") && state === "CA") {
      return {
        title: "California District Sales Tax Rate Change",
        description: "One or more California district sales tax rates changed in your jurisdiction. Verify your point-of-sale system is collecting the correct combined rate to avoid underpayment penalties.",
      };
    }
    if (topic.includes("digital goods") || topic.includes("SaaS")) {
      return {
        title: "Digital Goods Taxability Rules Updated",
        description: "Your state updated taxability rules for digital products and SaaS services. Businesses selling software, digital downloads, or subscriptions should review the updated guidance to confirm correct tax collection.",
      };
    }
    if (topic.includes("commercial rent") && state === "FL") {
      return {
        title: "Florida Commercial Rent Sales Tax Rate Reduced",
        description: "Florida reduced the sales tax rate on commercial rentals. If your business pays rent on commercial property, you may be entitled to a lower rate — verify the current rate with your landlord or accountant.",
      };
    }
    return {
      title: "Sales Tax Compliance Rule Updated",
      description: `Your state updated sales tax regulations that may affect your filing obligations. Review the latest guidance to confirm your current collection and remittance practices remain compliant.`,
    };
  }

  if (formId === "business-registration") {
    if (topic.includes("FinCEN") || topic.includes("BOI") || topic.includes("beneficial ownership")) {
      return {
        title: "FinCEN BOI Reporting Deadline Update",
        description: "The federal Beneficial Ownership Information (BOI) reporting rule requires most LLCs and corporations to disclose ownership details to FinCEN. Confirm your entity's filing status to avoid civil penalties of up to $500 per day.",
      };
    }
    if (topic.includes("annual report") || topic.includes("fee")) {
      return {
        title: "Annual Report Fee Updated",
        description: `Your state Secretary of State updated annual report fees for LLCs and corporations. Verify the new amount before filing your next annual report to avoid late fees or potential administrative dissolution.`,
      };
    }
    return {
      title: "Business Entity Filing Requirements Updated",
      description: `Your state updated requirements for business entity maintenance. Review your registered agent information and annual report status to confirm your entity remains in good standing.`,
    };
  }

  if (formId === "fictitious-name") {
    if (topic.includes("publication")) {
      return {
        title: "DBA Publication Requirement Update",
        description: "Some counties updated their DBA fictitious name publication requirements. Verify whether your county still requires newspaper publication of new DBA registrations and confirm the list of approved outlets.",
      };
    }
    return {
      title: "Fictitious Name Filing Rules Updated",
      description: `Your ${state ?? "local"} jurisdiction updated DBA registration rules. Confirm your fictitious name is current and renewal requirements haven't changed since your original filing.`,
    };
  }

  return {
    title: "Local Regulatory Update",
    description: "A recent regulatory update in your area may affect this business filing. Review the current requirements with your local agency to confirm ongoing compliance.",
  };
}

// ── Mock alert generator ───────────────────────────────────────────────────────
// For MVP: generates one realistic alert per saved business based on its forms
// and location. In production this is replaced by a Supabase Edge Function cron
// (see comment block below).
//
// FUTURE: SUPABASE EDGE FUNCTION + pg_cron FOR REAL RULE CHANGE DETECTION
// ──────────────────────────────────────────────────────────────────────────────
//   Edge Function: supabase/functions/scan-rule-changes/index.ts
//   Schedule: first day of each month at 10:00 UTC via pg_cron
//     select cron.schedule('rule-change-scan', '0 10 1 * *',
//       $$select net.http_post(
//         url     := 'https://<project>.supabase.co/functions/v1/scan-rule-changes',
//         headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
//       )$$
//     );
//
//   Inside the edge function, for each active user + their saved businesses:
//     1. Fetch businesses with completed_forms from the DB.
//     2. For each unique (form_id, state, county) combination, query a rule-change
//        feed (e.g. a curated JSON file hosted on Supabase Storage, updated monthly
//        by the RegBot team, or a third-party regulatory API like RegulationRoom).
//     3. If a change is detected for a form_id + jurisdiction the user has filed,
//        insert a row into a `rule_alerts` table:
//          create table rule_alerts (
//            id           uuid primary key default gen_random_uuid(),
//            user_id      uuid references auth.users not null,
//            business_id  uuid references businesses(id) on delete cascade,
//            form_id      text not null,
//            title        text not null,
//            description  text not null,
//            effective_date date,
//            source_url   text,
//            dismissed    boolean default false,
//            created_at   timestamptz default now()
//          );
//     4. Send an in-app notification (Supabase Realtime push) and a summary email:
//          Subject: "📋 New compliance update for [Business Name]"
//          Body: "[Title] — [Description] — Click to review your [Form Name] status."
//
//   This replaces the localStorage mock with real, curated regulatory intelligence
//   and turns RegBot into a true ongoing compliance guardian.
// ──────────────────────────────────────────────────────────────────────────────

const ALERT_PRIORITY_FORMS = [
  "mobile-food-vendor", "food-service-permit", "home-occupation-permit",
  "business-license", "business-registration", "sales-tax-registration",
  "fictitious-name",
] as const;

function generateMockAlertForBusiness(biz: SavedBusiness): RuleAlert | null {
  // Collect all known form IDs from this business
  const formIdSet = new Set<string>();
  biz.checklist.forEach(i => { if (i.formId) formIdSet.add(i.formId); });
  biz.completedForms?.forEach(e => formIdSet.add(e.template.id));
  if (formIdSet.size === 0) return null;

  // Pick the highest-priority form that this business has
  const chosenFormId =
    ALERT_PRIORITY_FORMS.find(id => formIdSet.has(id)) ?? [...formIdSet][0];

  // Get location-aware topics from formTemplates
  const topics = getRuleChangeTopics(chosenFormId, biz.location);
  if (topics.length === 0) return null;

  const { title, description } = buildAlertCopy(chosenFormId, biz.location, topics[0]);

  // ID includes year+month so a new alert can be generated monthly
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return {
    id:            `${biz.id}-${chosenFormId}-${monthKey}`,
    businessId:    biz.id,
    businessName:  biz.name,
    title,
    description,
    affectedForms: [chosenFormId],
    date:          now.toISOString().slice(0, 10),
    dismissed:     false,
  };
}

// ── Pro tier ──────────────────────────────────────────────────────────────────
// isPro is loaded from profiles.is_pro on mount for authenticated users.
// Defaults to true for guests (full-access during MVP beta).
// In production: set is_pro = true in the profiles table after Stripe confirms payment.

/** Maximum AI form completions per calendar month for Free tier users. */
const FREE_MONTHLY_LIMIT = 3;

// getCurrentMonthKey, localLoadMonthlyUsage, localSaveMonthlyUsage,
// dbLoadMonthlyUsage, dbSaveMonthlyUsage are all imported from lib/regbot-db.ts.

// localLoadBusinesses, localSaveBusiness, dbLoadBusinesses, dbSaveBusiness
// are all imported from lib/regbot-db.ts.

// ── ZIP → display string (fast local lookup) ──────────────────────────────────

const ZIP_LOOKUP: Record<string, string> = {
  "06825": "Bridgeport, CT 06825",   "06611": "Trumbull, CT 06611",
  "06830": "Greenwich, CT 06830",    "06901": "Stamford, CT 06901",
  "06510": "New Haven, CT 06510",    "06103": "Hartford, CT 06103",
  "06902": "Stamford, CT 06902",
  "33410": "Palm Beach Gardens, FL 33410", "33418": "Palm Beach Gardens, FL 33418",
  "33411": "Royal Palm Beach, FL 33411",   "33401": "West Palm Beach, FL 33401",
  "33301": "Fort Lauderdale, FL 33301",    "33139": "Miami Beach, FL 33139",
  "33101": "Miami, FL 33101",              "32801": "Orlando, FL 32801",
  "33601": "Tampa, FL 33601",
  "10001": "New York, NY 10001",     "11201": "Brooklyn, NY 11201",
  "60601": "Chicago, IL 60601",      "90001": "Los Angeles, CA 90001",
  "94102": "San Francisco, CA 94102","77001": "Houston, TX 77001",
  "73301": "Austin, TX 73301",       "30301": "Atlanta, GA 30301",
  "30303": "Atlanta, GA 30303",      "98101": "Seattle, WA 98101",
  "02101": "Boston, MA 02101",       "85001": "Phoenix, AZ 85001",
  "80201": "Denver, CO 80201",       "89101": "Las Vegas, NV 89101",
  "19101": "Philadelphia, PA 19101", "48201": "Detroit, MI 48201",
  "55401": "Minneapolis, MN 55401",  "63101": "St. Louis, MO 63101",
  "80901": "Colorado Springs, CO 80901", "84101": "Salt Lake City, UT 84101",
  "84111": "Salt Lake City, UT 84111",   "97201": "Portland, OR 97201",
  "35203": "Birmingham, AL 35203",   "99501": "Anchorage, AK 99501",
  "85281": "Tempe, AZ 85281",        "72201": "Little Rock, AR 72201",
  "95814": "Sacramento, CA 95814",   "19801": "Wilmington, DE 19801",
  "20001": "Washington, DC 20001",   "96813": "Honolulu, HI 96813",
  "83702": "Boise, ID 83702",        "62701": "Springfield, IL 62701",
  "46204": "Indianapolis, IN 46204", "50309": "Des Moines, IA 50309",
  "66101": "Kansas City, KS 66101",  "40202": "Louisville, KY 40202",
  "70112": "New Orleans, LA 70112",  "04101": "Portland, ME 04101",
  "21201": "Baltimore, MD 21201",    "49503": "Grand Rapids, MI 49503",
  "39201": "Jackson, MS 39201",      "64101": "Kansas City, MO 64101",
  "59601": "Helena, MT 59601",       "68102": "Omaha, NE 68102",
  "89501": "Reno, NV 89501",         "03101": "Manchester, NH 03101",
  "07102": "Newark, NJ 07102",       "87101": "Albuquerque, NM 87101",
  "14201": "Buffalo, NY 14201",      "27601": "Raleigh, NC 27601",
  "58501": "Bismarck, ND 58501",     "44113": "Cleveland, OH 44113",
  "73102": "Oklahoma City, OK 73102","15201": "Pittsburgh, PA 15201",
  "02901": "Providence, RI 02901",   "29201": "Columbia, SC 29201",
  "57501": "Pierre, SD 57501",       "37201": "Nashville, TN 37201",
  "75201": "Dallas, TX 75201",       "78201": "San Antonio, TX 78201",
  "79401": "Lubbock, TX 79401",      "05401": "Burlington, VT 05401",
  "23219": "Richmond, VA 23219",     "25301": "Charleston, WV 25301",
  "53202": "Milwaukee, WI 53202",    "82001": "Cheyenne, WY 82001",
};

// ── State name → 2-letter abbreviation ───────────────────────────────────────

const STATE_NAME_TO_ABBREV: Record<string, string> = {
  "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
  "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
  "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
  "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
  "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
  "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
  "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
  "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
  "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
  "wisconsin": "WI", "wyoming": "WY", "district of columbia": "DC",
};

// ── City → County (fast local lookup) ────────────────────────────────────────

const CITY_TO_COUNTY: Record<string, string> = {
  // Florida
  "palm beach gardens": "Palm Beach County", "west palm beach": "Palm Beach County",
  "royal palm beach": "Palm Beach County",   "boca raton": "Palm Beach County",
  "delray beach": "Palm Beach County",       "boynton beach": "Palm Beach County",
  "fort lauderdale": "Broward County",       "hollywood": "Broward County",
  "pompano beach": "Broward County",         "miami beach": "Miami-Dade County",
  "miami": "Miami-Dade County",              "hialeah": "Miami-Dade County",
  "coral gables": "Miami-Dade County",       "orlando": "Orange County",
  "kissimmee": "Osceola County",             "tampa": "Hillsborough County",
  "st. petersburg": "Pinellas County",       "clearwater": "Pinellas County",
  "jacksonville": "Duval County",            "tallahassee": "Leon County",
  "gainesville": "Alachua County",           "pensacola": "Escambia County",
  // Texas
  "lubbock": "Lubbock County",               "houston": "Harris County",
  "austin": "Travis County",                 "dallas": "Dallas County",
  "san antonio": "Bexar County",             "fort worth": "Tarrant County",
  "arlington": "Tarrant County",             "plano": "Collin County",
  "frisco": "Collin County",                 "mckinney": "Collin County",
  "el paso": "El Paso County",               "amarillo": "Potter County",
  "waco": "McLennan County",                 "corpus christi": "Nueces County",
  "laredo": "Webb County",                   "irving": "Dallas County",
  "garland": "Dallas County",               "grand prairie": "Dallas County",
  // California
  "los angeles": "Los Angeles County",       "long beach": "Los Angeles County",
  "glendale": "Los Angeles County",          "pasadena": "Los Angeles County",
  "torrance": "Los Angeles County",          "san francisco": "San Francisco County",
  "san jose": "Santa Clara County",          "santa clara": "Santa Clara County",
  "sunnyvale": "Santa Clara County",         "san diego": "San Diego County",
  "chula vista": "San Diego County",         "sacramento": "Sacramento County",
  "fresno": "Fresno County",                 "bakersfield": "Kern County",
  "anaheim": "Orange County",               "santa ana": "Orange County",
  "irvine": "Orange County",                "oakland": "Alameda County",
  "berkeley": "Alameda County",             "fremont": "Alameda County",
  "riverside": "Riverside County",           "san bernardino": "San Bernardino County",
  // New York
  "new york": "New York County",             "brooklyn": "Kings County",
  "queens": "Queens County",                 "bronx": "Bronx County",
  "staten island": "Richmond County",        "buffalo": "Erie County",
  "rochester": "Monroe County",             "yonkers": "Westchester County",
  "syracuse": "Onondaga County",             "albany": "Albany County",
  // Illinois
  "chicago": "Cook County",                  "aurora": "Kane County",
  "rockford": "Winnebago County",            "springfield": "Sangamon County",
  "joliet": "Will County",                   "naperville": "DuPage County",
  "peoria": "Peoria County",                 "elgin": "Kane County",
  // Georgia
  "atlanta": "Fulton County",                "augusta": "Richmond County",
  "columbus": "Muscogee County",             "savannah": "Chatham County",
  "athens": "Clarke County",                 "macon": "Bibb County",
  // Other high-traffic cities
  "seattle": "King County",                  "spokane": "Spokane County",
  "phoenix": "Maricopa County",             "tucson": "Pima County",
  "tempe": "Maricopa County",               "scottsdale": "Maricopa County",
  "mesa": "Maricopa County",                "chandler": "Maricopa County",
  "denver": "Denver County",                "colorado springs": "El Paso County",
  "cleveland": "Cuyahoga County",           "toledo": "Lucas County",
  "cincinnati": "Hamilton County",          "philadelphia": "Philadelphia County",
  "pittsburgh": "Allegheny County",         "boston": "Suffolk County",
  "nashville": "Davidson County",           "memphis": "Shelby County",
  "las vegas": "Clark County",              "henderson": "Clark County",
  "portland": "Multnomah County",           "minneapolis": "Hennepin County",
  "st. louis": "St. Louis County",          "kansas city": "Jackson County",
  "detroit": "Wayne County",               "grand rapids": "Kent County",
  "indianapolis": "Marion County",          "milwaukee": "Milwaukee County",
  "louisville": "Jefferson County",         "new orleans": "Orleans Parish",
  "baltimore": "Baltimore City",            "charlotte": "Mecklenburg County",
  "raleigh": "Wake County",                 "durham": "Durham County",
  "columbia": "Richland County",            "bridgeport": "Fairfield County",
  "stamford": "Fairfield County",           "new haven": "New Haven County",
  "hartford": "Hartford County",            "trumbull": "Fairfield County",
  "greenwich": "Fairfield County",          "richmond": "Richmond City",
  "honolulu": "Honolulu County",            "anchorage": "Anchorage Municipality",
  "boise": "Ada County",                    "salt lake city": "Salt Lake County",
  "albuquerque": "Bernalillo County",       "flagstaff": "Coconino County",
  "omaha": "Douglas County",               "lincoln": "Lancaster County",
  "birmingham": "Jefferson County",         "montgomery": "Montgomery County",
  "little rock": "Pulaski County",          "jackson": "Hinds County",
  "providence": "Providence County",        "manchester": "Hillsborough County",
  "newark": "Essex County",                 "jersey city": "Hudson County",
  "wilmington": "New Castle County",        "washington": "District of Columbia",
};

// ── Hyper-local form filtering ────────────────────────────────────────────────

function parseState(location: string): string | null {
  const m = location.match(/,\s+([A-Z]{2})(?:\s+\d{5})?$/);
  return m ? m[1] : null;
}

/** Returns true when a URL is the generic SBA fallback (no locale-specific portal known). */
function isSbaUrl(url: string | undefined): boolean {
  return !url || url.startsWith("https://www.sba.gov");
}

const FORM_EXCLUSIONS: Record<string, Set<string>> = {
  "sales-tax-registration": new Set(["AK", "DE", "MT", "NH", "OR"]),
};

function filterFormsByLocation(formIds: string[], location: string): string[] {
  const state = parseState(location);
  const seen  = new Set<string>();
  const out: string[] = [];
  for (const id of formIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (state && FORM_EXCLUSIONS[id]?.has(state)) continue;
    out.push(id);
  }
  return out;
}

const KNOWN_FORM_IDS = new Set([
  "business-license", "business-registration", "fictitious-name", "ein-application",
  "mobile-food-vendor", "food-service-permit",
  "sales-tax-registration", "home-occupation-permit",
]);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  formClarify?: { question: string; options: string[] } | null;
  formMap?: string[] | null;
}

// ── Welcome message (used as the default when no chat history exists) ─────────

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "- Welcome to RegPulse — your AI compliance co-pilot for permits, zoning, health codes, and local business regulations. [Learn More](https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits)\n" +
    "- Tell me what kind of business you are starting or operating and I will provide a tailored compliance checklist for your location. [Learn More](https://www.sba.gov/business-guide)",
};

/** Convert saved messages back to the full Message type (UI-only fields default to undefined). */
function toMessages(saved: SavedMessage[]): Message[] {
  return saved.map(m => ({ id: m.id, role: m.role, content: m.content }));
}

/** Strip UI-only fields before persisting. */
function toSavedMessages(msgs: Message[]): SavedMessage[] {
  return msgs.map(m => ({ id: m.id, role: m.role, content: m.content }));
}

// ── BulletLine ────────────────────────────────────────────────────────────────

const LINK_RE    = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
const FORM_ID_RE = /\s*%%([a-zA-Z][a-zA-Z0-9-]*)%%\s*/i;

function extractMarkerFromLine(text: string): { formId: string | null; displayText: string } {
  const hit = FORM_ID_RE.exec(text);
  if (!hit) return { formId: null, displayText: text };
  return {
    formId:      hit[1].toLowerCase(),
    displayText: (text.slice(0, hit.index) + text.slice(hit.index + hit[0].length)).trim(),
  };
}

function BulletLine({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer"
        className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors">
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1");
}

// ── PacketScreen ──────────────────────────────────────────────────────────────

function PacketScreen({
  forms,
  location,
  checklist,
  onDismiss,
  onSave,
  isPro,
}: {
  forms: CompletedFormEntry[];
  location: string;
  checklist: ChecklistItem[];
  onDismiss: () => void;
  onSave: (name: string) => void;
  isPro?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const [bizName, setBizName]         = useState("");
  const [saved, setSaved]             = useState(false);
  const bizInputRef                   = useRef<HTMLInputElement>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { generateCompliancePacket } = await import("@/lib/generateCompliancePacket");
      await generateCompliancePacket(forms, location);
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = () => {
    const name = bizName.trim() || "My Business";
    onSave(name);
    setSaved(true);
  };

  return (
    <div className="border-t border-slate-200 bg-white shrink-0">
      <div className="max-w-2xl mx-auto p-5">

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                All Forms Complete
              </p>
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-blue-200">
                <Sparkles className="h-2.5 w-2.5" />
                Included with RegPulse Pro
              </span>
            </div>
            <p className="font-semibold text-slate-900 mt-0.5">
              {forms.length} form{forms.length !== 1 ? "s" : ""} filled for {location}
            </p>
          </div>
        </div>

        {/* Form list */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mb-4">
          {forms.map((entry, i) => {
            const rawPortalUrl = entry.template.submitPortalUrl ?? entry.template.submitUrl;
            const portalUrl    = isSbaUrl(rawPortalUrl) ? null : rawPortalUrl;
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-100 last:border-none">
                <span className="h-5 w-5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium leading-snug">
                    {entry.template.name.split("(")[0].trim()}
                  </p>
                  {entry.template.officialFormNumber && (
                    <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                      {entry.template.officialFormNumber}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">Gov. filing fee: {entry.template.fee}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {entry.template.officialFormPdfUrl && (
                    <a
                      href={entry.template.officialFormPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-medium text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded px-2 py-1 transition-colors"
                    >
                      <Download className="h-3 w-3 shrink-0" />
                      Blank Form
                    </a>
                  )}
                  {portalUrl ? (
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded px-2 py-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      Submit Online
                    </a>
                  ) : (
                    <span
                      className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded px-2 py-1"
                      title="Filing location varies by city/county"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      Local Filing
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Your compliance packet includes your answers, required documents, and submission
          instructions for each form — tailored to {location}.
        </p>

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          This packet is a preparation aid only and does not constitute legal advice.
          Always verify requirements with the official agency before submitting.
        </p>

        {/* Download + Return */}
        <div className="flex gap-2 mb-4">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleDownload}
            disabled={downloading}
          >
            <FileText className="h-4 w-4 mr-2" />
            {downloading ? "Generating PDF…" : "Download Compliance Packet PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Return to Chat
          </Button>
        </div>

        {/* Save under Business Name */}
        <div className={`rounded-xl border transition-all duration-200 ${
          saved ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"
        } px-4 py-3`}>
          {saved ? (
            <div className="flex items-start gap-2">
              <CheckCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-green-800 font-medium leading-snug">
                  Checklist saved to "My Businesses"
                </p>
                <p className="text-[11px] text-green-700 mt-0.5">
                  You can reload it anytime from the sidebar.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                Save this checklist under a business name
              </p>
              <div className="flex gap-2">
                <input
                  ref={bizInputRef}
                  type="text"
                  value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                  placeholder="e.g. Miami Food Truck, Jane's Bakery…"
                  className="flex-1 text-xs h-8 bg-white border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400 text-slate-800"
                />
                <button
                  onClick={handleSave}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-3 h-8 transition-colors shrink-0"
                >
                  Save
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Press Enter or click Save</p>
            </>
          )}
        </div>

        {/* Pro status / upsell */}
        {isPro ? (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <Crown className="h-3 w-3 text-amber-500" />
            <p className="text-[11px] text-amber-700 font-medium">
              RegPulse Pro — all features active
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-slate-800">Unlock RegPulse Pro — $19/mo</p>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {[
                "Unlimited AI form completions",
                "Automatic renewal filing",
                "Quarterly Check-in PDF report",
                "Priority support",
                "Early access to new forms",
                "Ad-free experience",
              ].map(b => (
                <li key={b} className="flex items-start gap-1 text-[10px] text-slate-600">
                  <CheckCircle2 className="h-2.5 w-2.5 text-blue-500 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-400 text-center">
              or $179/yr — cancel anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);

  /** Debounce timer for auto-saving the active business profile. */
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // ── Location state ────────────────────────────────────────────────────────
  const [userLocation, setUserLocation]         = useState("Detecting location...");
  const [useExactLocation, setUseExactLocation] = useState(true);
  const [manualLocation, setManualLocation]     = useState("");
  const [zipResolved, setZipResolved]           = useState(false);
  const [zipLookingUp, setZipLookingUp]         = useState(false);
  const [detectedCounty, setDetectedCounty]     = useState<string | null>(null);
  const gpsActiveRef  = useRef(true);
  const zipLookupRef  = useRef<string>("");

  // ── Form state ────────────────────────────────────────────────────────────
  const [activeTemplate, setActiveTemplate]             = useState<FormTemplate | null>(null);
  const [formQueue, setFormQueue]                       = useState<FormTemplate[]>([]);
  const [queueIndex, setQueueIndex]                     = useState(0);
  const [completedFormsData, setCompletedFormsData]     = useState<CompletedFormEntry[]>([]);
  const [showPacketScreen, setShowPacketScreen]         = useState(false);
  /**
   * Tracks every form completed by the AI form filler, keyed by template.id.
   * Used to power "View Completed Form" in the EnhancedChecklist sidebar.
   * Populated on every handleFormComplete call (single + queue mode).
   */
  const [completedFormsByFormId, setCompletedFormsByFormId] =
    useState<Record<string, CompletedFormEntry>>({});
  /**
   * Pre-filled field values passed to FormFiller when the user clicks "Renew Now".
   * Carries the previous submission's formData so fields are pre-populated.
   * Reset to undefined when opening a fresh (non-renewal) form.
   */
  const [activeFormInitialData, setActiveFormInitialData] =
    useState<Record<string, string> | undefined>(undefined);
  /** True when the active FormFiller session is a renewal (drives the renewal banner). */
  const [activeFormIsRenewal, setActiveFormIsRenewal] = useState(false);

  // ── Saved businesses ──────────────────────────────────────────────────────
  const [savedBusinesses, setSavedBusinesses] = useState<SavedBusiness[]>([]);
  /** The currently active business profile (set on load; cleared on reset). */
  const [loadedBusiness, setLoadedBusiness]   = useState<SavedBusiness | null>(null);
  /** Controls the Add Business modal visibility. */
  const [showAddBizModal, setShowAddBizModal]       = useState(false);
  const [confirmDeleteBizId, setConfirmDeleteBizId] = useState<string | null>(null);
  const [notifPrefsBizId, setNotifPrefsBizId]       = useState<string | null>(null);
  // Multi-location support
  /** ID of the currently active BusinessLocation within loadedBusiness.locations. null = single-location mode. */
  const [activeLocationId, setActiveLocationId]     = useState<string | null>(null);
  /** ID of the business whose "Add Location" modal is open. */
  const [addLocationBizId, setAddLocationBizId]     = useState<string | null>(null);
  /** Set of business IDs whose location list is expanded in the sidebar. */
  const [expandedBizIds, setExpandedBizIds]         = useState<Set<string>>(new Set());
  // Document upload + analysis
  const [docAnalysisResult, setDocAnalysisResult]   = useState<AnalysisResult | null>(null);
  const [showDocUploadPanel, setShowDocUploadPanel] = useState(false);
  // v25 — Preexisting Document Upload: attach-mode panel (no AI analysis)
  const [showAttachPanel, setShowAttachPanel]       = useState(false);
  // v30 — Completed Document → Business Profile Flow
  // v31 — Fix: use refs alongside state so sendMessage always reads the latest values
  //        regardless of closure capture timing (stale useCallback deps were causing
  //        awaitingProfileConfirmation to read as false on the first "yes" reply).
  //
  //   State is for UI rendering (bot message, card hint visibility).
  //   Refs are for sendMessage's synchronous confirmation check (no stale closure).
  const [awaitingProfileConfirmation, setAwaitingProfileConfirmation] = useState(false);
  const [pendingDocumentForProfile, setPendingDocumentForProfile]     = useState<AnalysisResult | null>(null);
  const awaitingProfileConfirmationRef = useRef(false);
  const pendingDocumentForProfileRef   = useRef<AnalysisResult | null>(null);
  // v20 — Forms Library Section: collapsed by default to keep sidebar compact
  const [formsLibraryOpen, setFormsLibraryOpen]     = useState(false);
  // v31 — Business Profile View: replaces chat messages pane when active
  const [showProfileView, setShowProfileView]       = useState(false);
  const [showMobileSidebar, setShowMobileSidebar]   = useState(false); // vMobile
  const [uploadedDocs, setUploadedDocs]             = useState<UploadedDocument[]>([]);

  // ── Pro subscription state ────────────────────────────────────────────────
  // Loaded from profiles.is_pro for authenticated users; defaults true for guests.
  const [isPro, setIsPro]                       = useState(true);
  const [monthlyFormsUsed, setMonthlyFormsUsed] = useState(0);

  // ── Supabase auth state ───────────────────────────────────────────────────
  const [user, setUser]           = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Auth sidebar panel
  const [authExpanded, setAuthExpanded] = useState(false);
  const [authMode, setAuthMode]   = useState<"signin" | "signup" | "magic">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authWorking, setAuthWorking] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // Singleton Supabase browser client — stable across renders via ref.
  const sbRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSb() {
    if (!sbRef.current) sbRef.current = createClient();
    return sbRef.current;
  }

  // ── Load data from Supabase (authenticated path) ──────────────────────────
  const loadFromSupabase = useCallback(async (uid: string) => {
    const sb = getSb();
    const [businesses, alerts, usage, pro] = await Promise.all([
      dbLoadBusinesses(sb, uid),
      dbLoadAlerts(sb, uid),
      dbLoadMonthlyUsage(sb, uid),
      dbLoadIsPro(sb, uid),
    ]);
    setSavedBusinesses(businesses);
    setRuleAlerts(alerts);
    setMonthlyFormsUsed(usage);
    setIsPro(pro);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth + data bootstrap on mount ────────────────────────────────────────
  useEffect(() => {
    const sb = getSb();

    // 1. Check for an existing session (e.g. from a previous page visit).
    sb.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setAuthLoading(false);
      if (u) {
        void loadFromSupabase(u.id);
      } else {
        // Guest: load from localStorage.
        setSavedBusinesses(localLoadBusinesses());
        setRuleAlerts(localLoadAlerts());
        setMonthlyFormsUsed(localLoadMonthlyUsage());
      }
    });

    // 2. Listen for sign-in / sign-out events.
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === "SIGNED_IN" && u) {
        // Migrate any guest data to Supabase, then reload from the DB.
        await syncGuestDataToSupabase(sb, u.id);
        await loadFromSupabase(u.id);
        setAuthExpanded(false);
      } else if (event === "SIGNED_OUT") {
        setSavedBusinesses(localLoadBusinesses());
        setRuleAlerts(localLoadAlerts());
        setMonthlyFormsUsed(localLoadMonthlyUsage());
        setIsPro(true); // guests default to full access
      }
    });

    return () => subscription.unsubscribe();
  }, [loadFromSupabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth action helpers ───────────────────────────────────────────────────
  const handleSignIn = async () => {
    setAuthWorking(true); setAuthError("");
    const { error } = await getSb().auth.signInWithPassword({ email: authEmail, password: authPassword });
    setAuthWorking(false);
    if (error) setAuthError(error.message);
  };

  const handleSignUp = async () => {
    setAuthWorking(true); setAuthError("");
    const { error } = await getSb().auth.signUp({ email: authEmail, password: authPassword });
    setAuthWorking(false);
    if (error) setAuthError(error.message);
    else setAuthError("Check your email to confirm your account.");
  };

  const handleMagicLink = async () => {
    setAuthWorking(true); setAuthError("");
    const { error } = await getSb().auth.signInWithOtp({ email: authEmail });
    setAuthWorking(false);
    if (error) setAuthError(error.message);
    else setMagicSent(true);
  };

  const handleSignOut = async () => {
    await getSb().auth.signOut();
    setUser(null);
    setAuthExpanded(false);
  };

  // ── Rule Change Alerts ────────────────────────────────────────────────────
  // Loaded in the auth bootstrap useEffect above (both Supabase and localStorage paths).
  const [ruleAlerts, setRuleAlerts] = useState<RuleAlert[]>([]);

  // v61 — Review Impact modal: ID of the alert whose detail modal is open (null = closed)
  const [reviewImpactAlertId, setReviewImpactAlertId] = useState<string | null>(null);

  // Generate mock alerts for saved businesses that don't have one yet.
  // Persists to Supabase when signed in, localStorage otherwise.
  useEffect(() => {
    if (savedBusinesses.length === 0) return;
    setRuleAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const newAlerts: RuleAlert[] = [];
      for (const biz of savedBusinesses) {
        const alert = generateMockAlertForBusiness(biz);
        if (alert && !existingIds.has(alert.id)) newAlerts.push(alert);
      }
      if (newAlerts.length === 0) return prev;
      const updated = [...prev, ...newAlerts];
      // Persist — dbSaveAlerts writes to both localStorage and Supabase if signed in.
      void dbSaveAlerts(user ? getSb() : null, user?.id ?? null, updated);
      return updated;
    });
  }, [savedBusinesses]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save toast ───────────────────────────────────────────────────────
  interface AutoSaveToast { count: number; itemIds: string[] }
  const [autoSaveToast, setAutoSaveToast] = useState<AutoSaveToast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const isQueueMode = formQueue.length > 0;
  const queueLabel  = isQueueMode ? `Form ${queueIndex + 1} of ${formQueue.length}` : undefined;

  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const checklistTopRef      = useRef<HTMLDivElement>(null);
  const renewalsSectionRef   = useRef<HTMLDivElement>(null);
  const alertsSectionRef     = useRef<HTMLDivElement>(null);

  // ── Rule alert helpers ────────────────────────────────────────────────────
  /** Form IDs with at least one active (non-dismissed) alert — used to badge
   *  matching checklist items with the amber "Updated" indicator. */
  const alertedFormIds = useMemo<Set<string>>(() => {
    const ids = new Set<string>();
    ruleAlerts.filter(a => !a.dismissed).forEach(a => a.affectedForms.forEach(f => ids.add(f)));
    return ids;
  }, [ruleAlerts]);

  const dismissAlert = useCallback((alertId: string) => {
    setRuleAlerts(prev => {
      const updated = prev.map(a => a.id === alertId ? { ...a, dismissed: true } : a);
      void dbSaveAlerts(user ? getSb() : null, user?.id ?? null, updated);
      return updated;
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── v33: Recommended forms for the active business (passed to BusinessProfileView) ──
  // Derived from loadedBusiness so they auto-refresh when handleLocationChangeFromProfile
  // updates the location and triggers a re-render.
  const profileRecommendedForms = useMemo<(FederalFormEntry | StateFormEntry)[]>(() => {
    if (!loadedBusiness) return [];
    const state = parseStateFromLocation(loadedBusiness.location) ?? undefined;
    const ids   = getRecommendedForms(loadedBusiness.businessType, state, undefined, loadedBusiness.isPreExisting === false);
    return ids
      .map(id => ALL_FORMS[id])
      .filter((f): f is FederalFormEntry | StateFormEntry => !!f && (isFederalForm(f) || isStateForm(f)));
  }, [loadedBusiness]);

  // ── Active location (derived) ─────────────────────────────────────────────
  // When the loaded business has multiple locations and one is active, this gives
  // the active BusinessLocation object. null in single-location mode.
  const activeLocation = useMemo<BusinessLocation | null>(() => {
    if (!loadedBusiness?.locations?.length || !activeLocationId) return null;
    return loadedBusiness.locations.find(l => l.id === activeLocationId) ?? null;
  }, [loadedBusiness, activeLocationId]);

  // ── Cross-business renewals ───────────────────────────────────────────────
  // Aggregates renewal items from ALL saved businesses (not just the active one).
  // Each entry carries the owning SavedBusiness so the sidebar can show the name
  // and the "Renew" button can switch to that business if needed.
  // Multi-location: also aggregates from each location's checklist.
  const allRenewals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rows: {
      biz: SavedBusiness;
      item: ChecklistItem;
      daysLeft: number;
      formName: string;
    }[] = [];

    const addFromChecklist = (biz: SavedBusiness, items: ChecklistItem[]) => {
      for (const item of items) {
        if (!item.renewalDate) continue;
        const d = new Date(item.renewalDate + "T00:00:00");
        const daysLeft = Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
        const formName = item.text.replace(/^Complete and submit:\s*/i, "").split("(")[0].trim();
        rows.push({ biz, item, daysLeft, formName });
      }
    };

    // Include saved businesses' checklists (covers all businesses, including active one).
    // For the active business, prefer live checklist state over the saved snapshot so
    // any in-session edits (e.g. status changes) are reflected immediately.
    for (const biz of savedBusinesses) {
      const isActive = loadedBusiness?.id === biz.id;
      if (biz.locations?.length) {
        // Multi-location: aggregate from all locations
        for (const loc of biz.locations) {
          const isActiveLocation = isActive && loc.id === activeLocationId;
          addFromChecklist(biz, isActiveLocation ? checklist : (loc.checklist ?? []));
        }
      } else {
        // Single-location (backward compat)
        addFromChecklist(biz, isActive ? checklist : biz.checklist);
      }
    }

    // De-duplicate by item.id (in case the active business appears in both sources),
    // then sort soonest first.
    const seen = new Set<string>();
    return rows
      .filter(r => { if (seen.has(r.item.id)) return false; seen.add(r.item.id); return true; })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [savedBusinesses, loadedBusiness, checklist, activeLocationId]);

  // ── Compliance Health Score ───────────────────────────────────────────────
  // Computed from live checklist state on every render (including after
  // handleLoadBusiness) so returning users immediately see their current posture.
  // v61 — "verified done" excludes self-reported pre-existing items (in-progress status)
  // so newly-created profiles start at 0% / "No data yet" rather than 100%.
  const healthScore = useMemo(() => {
    if (checklist.length === 0) return null;
    const total    = checklist.length;
    // v61: only count items that were actually completed (not just self-reported "in-progress")
    const done     = checklist.filter(i => i.status === "done").length;
    const pending  = total - done;
    const score    = Math.round((done / total) * 100);
    const noData   = done === 0; // v61 — true when nothing has been verified as done yet
    // expiringCount = renewals within 90 days across ALL businesses (not just active one).
    // allRenewals is already computed above; we just filter it here so the health card
    // reflects the full portfolio's urgency, not just the active business.
    const expiringCount = allRenewals.filter(r => r.daysLeft <= 90).length;
    return { score, pending, expiringCount, total, done, noData };
  // allRenewals already depends on checklist, so we include it here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist, allRenewals]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTemplate, showPacketScreen]);

  // ── Auto-save the active business profile ─────────────────────────────────
  // Whenever the checklist, completed-forms map, or messages change while a
  // business is loaded, write the updated profile back to storage.
  // Debounced 2 s so rapid typing doesn't flood the DB.
  useEffect(() => {
    if (!loadedBusiness) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      const allCompleted = Object.values(completedFormsByFormId);
      const completedForms = allCompleted.length > 0
        ? allCompleted
        : loadedBusiness.completedForms;
      const profile = calcBizProfile(checklist, completedForms);
      const now = new Date().toISOString();

      let updated: SavedBusiness;
      if (activeLocationId && loadedBusiness.locations?.length) {
        // Multi-location: patch only the active location's slot
        updated = {
          ...loadedBusiness,
          lastChecked: now,
          locations: loadedBusiness.locations.map(loc =>
            loc.id === activeLocationId
              ? {
                  ...loc,
                  checklist,
                  completedForms,
                  chatHistory:         toSavedMessages(messages),
                  healthScore:         profile.healthScore,
                  totalForms:          profile.totalForms,
                  completedFormsCount: profile.completedFormsCount,
                  lastChecked:         now,
                }
              : loc
          ),
        };
      } else {
        // Single-location (backward compat)
        updated = {
          ...loadedBusiness,
          lastChecked:         now,
          checklist,
          completedForms,
          chatHistory:         toSavedMessages(messages),
          healthScore:         profile.healthScore,
          totalForms:          profile.totalForms,
          completedFormsCount: profile.completedFormsCount,
        };
      }
      setLoadedBusiness(updated);
      void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updated).then(() => {
        setSavedBusinesses(localLoadBusinesses());
      });
    }, 2000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist, completedFormsByFormId, messages, loadedBusiness?.id, activeLocationId]);

  // ── GPS ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!useExactLocation || !navigator.geolocation) return;
    gpsActiveRef.current = true;
    setZipResolved(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (!gpsActiveRef.current) return;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json` +
            `&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          if (!gpsActiveRef.current) return;
          // Try progressively broader Nominatim address fields to find a city name.
          // hamlet / suburb / neighbourhood cover unincorporated areas (e.g. ZIP 33411).
          // All values are trimmed — Nominatim occasionally returns trailing whitespace
          // that would break the state-abbreviation regex in parseStateFromLocation.
          const cityRaw: string | null = (
            data.address?.city        ||
            data.address?.town        ||
            data.address?.village     ||
            data.address?.hamlet      ||
            data.address?.suburb      ||
            data.address?.neighbourhood ||
            null
          );
          const cityTrimmed = cityRaw ? cityRaw.trim() : null;

          const iso      = ((data.address?.["ISO3166-2-lvl4"] ?? "") as string).trim();
          // Nominatim may return full state name (e.g. "Florida") when ISO3166 is absent.
          // Normalize to 2-letter abbreviation so locale overrides in formTemplates fire.
          const stateRaw = (iso.includes("-") ? iso.split("-")[1] : (data.address?.state || "")).trim();
          const state    = stateRaw.length === 2
            ? stateRaw.toUpperCase()
            : (STATE_NAME_TO_ABBREV[stateRaw.toLowerCase()] ?? (stateRaw || "Unknown State"));
          const zip      = ((data.address?.postcode as string | undefined) ?? "").trim();

          // County from Nominatim takes priority; fall back to CITY_TO_COUNTY lookup.
          const countyFromNominatim = ((data.address?.county as string | undefined) ?? "").trim() || null;
          const countyFromLookup    = cityTrimmed ? (CITY_TO_COUNTY[cityTrimmed.toLowerCase()] ?? null) : null;
          const countyRaw: string | null = countyFromNominatim ?? countyFromLookup;

          // For unincorporated areas where no city name is found, use the county name
          // as the display city so the location reads "Palm Beach County, FL 33411"
          // rather than "Unknown Location, FL 33411".
          const city = cityTrimmed ?? countyRaw ?? "Unknown Location";

          setUserLocation(zip ? `${city}, ${state} ${zip}` : `${city}, ${state}`);
          setDetectedCounty(countyRaw);
        } catch {
          if (gpsActiveRef.current) { setUserLocation("Your current location"); setDetectedCounty(null); }
        }
      },
      () => { if (gpsActiveRef.current) { setUserLocation("Your current location"); setDetectedCounty(null); } }
    );
  }, [useExactLocation]);

  const handleToggleGps = () => {
    if (useExactLocation) {
      gpsActiveRef.current = false;
      setManualLocation("");
      setZipResolved(false);
      setDetectedCounty(null);
      setUserLocation("Enter location");
    } else {
      setManualLocation("");
      setZipResolved(false);
      setDetectedCounty(null);
      setUserLocation("Detecting location...");
    }
    setUseExactLocation(v => !v);
  };

  // ── Location input (ZIP or City, ST / City, State) ────────────────────────

  const handleLocationInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setManualLocation(raw);
    setZipResolved(false);
    setDetectedCounty(null);
    const trimmed = raw.trim();

    // ZIP path — pure digits
    if (/^\d+$/.test(trimmed)) {
      const zip = trimmed.slice(0, 5);
      if (zip.length < 5) {
        setZipLookingUp(false);
        setUserLocation(zip.length === 0 ? "Enter location" : "Detecting location...");
        return;
      }
      if (ZIP_LOOKUP[zip]) {
        const display   = ZIP_LOOKUP[zip];
        const cityMatch = display.match(/^([^,]+)/);
        const county    = cityMatch ? (CITY_TO_COUNTY[cityMatch[1].toLowerCase()] ?? null) : null;
        setUserLocation(display);
        setDetectedCounty(county);
        setZipResolved(true);
        return;
      }
      setZipLookingUp(true);
      setUserLocation("Resolving ZIP…");
      zipLookupRef.current = zip;
      try {
        const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (zipLookupRef.current !== zip) return;
        if (!res.ok) throw new Error("not found");
        const data  = await res.json();
        const city  = (data.places?.[0]?.["place name"] as string) ?? "Unknown City";
        const state = (data.places?.[0]?.["state abbreviation"] as string) ?? "XX";
        setUserLocation(`${city}, ${state} ${zip}`);
        setDetectedCounty(CITY_TO_COUNTY[city.toLowerCase()] ?? null);
        setZipResolved(true);
      } catch {
        if (zipLookupRef.current === zip) {
          setUserLocation(`ZIP Code ${zip}`);
          setZipResolved(false);
        }
      } finally {
        if (zipLookupRef.current === zip) setZipLookingUp(false);
      }
      return;
    }

    // City/State path — "City, ST" or "City, Full State Name"
    const cityState = trimmed.match(/^(.+),\s*([A-Za-z][A-Za-z\s]*)$/);
    if (cityState) {
      const city     = cityState[1].trim();
      const rawState = cityState[2].trim();
      const abbrev   = rawState.length === 2
        ? rawState.toUpperCase()
        : STATE_NAME_TO_ABBREV[rawState.toLowerCase()] ?? rawState.toUpperCase();
      setUserLocation(`${city}, ${abbrev}`);
      setDetectedCounty(CITY_TO_COUNTY[city.toLowerCase()] ?? null);
      setZipResolved(true);
      return;
    }

    setUserLocation(trimmed || "Enter location");
  };

  // ── API helper ────────────────────────────────────────────────────────────

  const callApi = async (outgoingMessages: Message[]) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoingMessages.map(m => ({ role: m.role, content: m.content })),
          location: userLocation,
          county:   detectedCounty ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setMessages(prev => [...prev, {
        id:          (Date.now() + 1).toString(),
        role:        "assistant",
        content:     data.content,
        formClarify: data.formClarify ?? null,
        formMap:     data.formMap     ?? null,
      }]);

      if (data.content && /^-\s/m.test(data.content)) {
        const newIds = extractAndAddToChecklist(data.content, data.formMap);
        if (newIds.length > 0) showAutoSaveToast(newIds.length, newIds);
      }
    } catch {
      setMessages(prev => [...prev, {
        id:      (Date.now() + 1).toString(),
        role:    "assistant",
        content: "Sorry, I had trouble responding. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // v31 — Business Profile Creation from Document (replaces v30 useCallback approach)
  //
  // WHY REFS: handleProfileConfirmationReply was a useCallback whose deps included
  // awaitingProfileConfirmation and pendingDocumentForProfile (state). In React 18
  // concurrent mode, batched state updates may not have flushed by the time sendMessage
  // runs, so the memoized callback could close over stale false/null values → the "yes"
  // reply fell through to callApi silently.
  //
  // FIX: read from refs (always current) instead of state in sendMessage.
  //       State is still set alongside refs so the UI (card hint, etc.) reacts normally.

  /**
   * Creates a business from a document analysis result and attaches the document.
   * v45 — Fixed document attachment on "Yes, create it" so it appears on the matching
   *        recommended form card: optimistic doc added synchronously with formId set
   *        from analysis.matchedFormIds[0], before the profile view opens.
   */
  const createBusinessFromDocument = useCallback((result: AnalysisResult) => {
    const a = result.analysis;
    const suggestedName = a.businessName?.trim() || "My Business";
    const now = new Date().toISOString();
    const profile = calcBizProfile([], undefined);

    const newBiz: SavedBusiness = {
      id:                  `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:                suggestedName,
      location:            a.businessAddress?.trim() || userLocation,
      savedAt:             now,
      lastChecked:         now,
      checklist:           [],
      chatHistory:         toSavedMessages(messages),
      healthScore:         profile.healthScore,
      totalForms:          profile.totalForms,
      completedFormsCount: profile.completedFormsCount,
      isPreExisting:       true,
    };

    // v31 — Fix UI Refresh After Business Profile Creation
    //
    // Optimistic update: add the new business to the sidebar immediately so it
    // appears in "My Businesses" without waiting for the async dbSaveBusiness
    // promise.  `dbSaveBusiness` calls `localSaveBusiness` synchronously, so the
    // localStorage copy is written before the Supabase roundtrip; but the React
    // state update was previously deferred to `.then()`, causing a visible delay.
    //
    // Three-step update:
    //   1. Push newBiz into savedBusinesses right now (optimistic, synchronous).
    //   2. Mark it as the active/loaded business immediately.
    //   3. After the async save resolves, reconcile from localStorage to pick up
    //      any server-side mutations (e.g. Supabase-generated fields).
    setLoadedBusiness(newBiz);
    setSavedBusinesses(prev => {
      // Replace if somehow already present (idempotent); otherwise prepend.
      const without = prev.filter(b => b.id !== newBiz.id);
      return [newBiz, ...without];
    });
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, newBiz).then(() => {
      // Reconcile: localStorage is authoritative after the save completes.
      setSavedBusinesses(localLoadBusinesses());
    });

    // Save document context for /forms recommendations
    saveBusinessContext({
      businessType:  a.scope ?? undefined,
      state:         parseStateFromLocation(newBiz.location) ?? undefined,
      isNewBusiness: false,
    });

    // v45 — Attach the document to the new business with formId so it appears on the
    // matching recommended form card immediately (via cardDocs filter in BusinessProfileView).
    //
    // formId: use the first AI-matched form ID if present. This is what cardDocs checks
    // first (`doc.formId === entry.id`), so the green badge appears without needing
    // analysis.matchedFormIds to be re-evaluated on every card render.
    const primaryFormId = a.matchedFormIds?.[0] ?? undefined;

    const docRecord = {
      businessId:   newBiz.id,
      originalName: result.fileName,
      mimeType:     result.mimeType,
      sizeBytes:    result.sizeBytes,
      storagePath:  result.storagePath,
      analysis:     a,
      analyzed:     true as const,
    };

    // Optimistic local doc — added synchronously so the profile view that opens
    // 350ms later already has this document in uploadedDocs. For auth users we
    // replace it with the DB-returned record in .then(); for guests it stays as-is.
    const optimisticId = `opt-${Date.now()}`;
    const optimisticDoc: UploadedDocument = {
      id:         optimisticId,
      uploadedAt: now,
      formId:     primaryFormId,
      ...docRecord,
    };
    setUploadedDocs(prev => [optimisticDoc, ...prev]);

    if (user) {
      void dbSaveDocument(getSb(), user.id, docRecord).then(saved => {
        setUploadedDocs(prev =>
          saved
            ? prev.map(d =>
                d.id === optimisticId
                  ? { ...saved, formId: primaryFormId }
                  : d
              )
            : prev.filter(d => d.id !== optimisticId),
        );
      });
    }
    // Guest: optimisticDoc already in state above — nothing more to do.

    // Dismiss the analysis card now that the profile was created
    setDocAnalysisResult(null);

    // Confirmation message in chat
    setMessages(prev => [
      ...prev,
      {
        id:      `doc-profile-confirm-${Date.now()}`,
        role:    "assistant" as const,
        content:
          `Done! I created a new business profile called **"${suggestedName}"** and attached the ${a.docType} to it.\n\n` +
          `You can edit the name anytime in the **My Businesses** panel. ` +
          `Want me to build out a compliance checklist for this business?`,
      },
    ]);

    // v37 — Auto-open Business Profile View so the checkmark and attached document
    // appear immediately without requiring the user to click "View Profile".
    // Small delay lets the confirmation message render before the view switches.
    setTimeout(() => setShowProfileView(true), 350);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, messages, user]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // v31 — Check refs (not state) so we always read the latest values even if React
    //        hasn't re-rendered yet after the state updates in handleDocumentAnalysisComplete.
    if (awaitingProfileConfirmationRef.current && pendingDocumentForProfileRef.current) {
      const lower  = trimmed.toLowerCase();
      const isYes  = /^(yes|yeah|yep|sure|go ahead|ok|okay|create it|do it|please|yup|absolutely)/.test(lower);
      const isNo   = /^(no|nope|skip|not now|cancel|don't|dont|pass|later|nah)/.test(lower);

      if (isYes || isNo) {
        // Echo the user's reply into the chat
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Capture the pending result before clearing refs/state
        const captured = pendingDocumentForProfileRef.current;

        // Clear confirmation state (refs first so any subsequent render sees clean state)
        awaitingProfileConfirmationRef.current = false;
        pendingDocumentForProfileRef.current   = null;
        setAwaitingProfileConfirmation(false);
        setPendingDocumentForProfile(null);

        if (isYes && captured) {
          createBusinessFromDocument(captured);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id:      `doc-profile-skip-${Date.now()}`,
              role:    "assistant" as const,
              content: "No problem — I'll leave the document analysis here. Let me know if you'd like help with anything else.",
            },
          ]);
        }
        return; // do NOT call the AI API
      }
      // Ambiguous reply (e.g. "what does that mean?") — fall through to normal AI call
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    await callApi([...messages, userMsg]);
  };

  const sendQuickReply = async (option: string) => {
    if (isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: option };
    setMessages(prev => [...prev, userMsg]);
    await callApi([...messages, userMsg]);
  };

  // ── Checklist helpers ─────────────────────────────────────────────────────

  const extractAndAddToChecklist = (content: string, formMap?: string[] | null): string[] => {
    const bullets    = content.match(/^-\s+.+$/gm) ?? [];
    const candidates = bullets.map(bullet => {
      const raw = bullet.replace(/^-\s+/, "");
      const { formId: markerFormId, displayText: stripped } = extractMarkerFromLine(raw);
      const text      = stripped.trim();
      const plainText = text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1");
      const formId    = (markerFormId && KNOWN_FORM_IDS.has(markerFormId))
        ? markerFormId
        : (plainText ? formMap?.find(id => plainText.toLowerCase().includes(id.replace(/-/g, " "))) : undefined);
      return { text, formId };
    }).filter(c => c.text);

    if (!candidates.length) return [];

    const existingTexts = new Set(checklist.map(i => i.text));
    const toAdd = candidates
      .filter(c => !existingTexts.has(c.text))
      .map(c => ({
        id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text:      c.text,
        status:    "todo" as const,
        formId:    c.formId,
        createdAt: new Date().toISOString(),
      }));

    if (!toAdd.length) return [];

    setChecklist(prev => {
      const existingInPrev = new Set(prev.map(i => i.text));
      const safe = toAdd.filter(i => !existingInPrev.has(i.text));
      return safe.length ? [...prev, ...safe] : prev;
    });

    return toAdd.map(i => i.id);
  };

  const showAutoSaveToast = (count: number, itemIds: string[]) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setAutoSaveToast({ count, itemIds });
    toastTimerRef.current = setTimeout(() => setAutoSaveToast(null), 4000);
  };

  const handleUndoAutoSave = (itemIds: string[]) => {
    setChecklist(prev => prev.filter(i => !itemIds.includes(i.id)));
    setAutoSaveToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  // ── Form launch ───────────────────────────────────────────────────────────

  const handleStartForm = (formId: string) => {
    // Pro gate: Free tier capped at FREE_MONTHLY_LIMIT AI completions per calendar month.
    if (!isPro && monthlyFormsUsed >= FREE_MONTHLY_LIMIT) return;
    // Pass detectedCounty so getLocaleFormTemplate can try county-level URLs first
    // (e.g. pbcgov.org for Palm Beach County business-license) before falling back
    // to state-level and then the generic SBA base template.
    const template = getLocaleFormTemplate(formId, userLocation, detectedCounty);
    if (!template) return;
    setFormQueue([]);
    setQueueIndex(0);
    setCompletedFormsData([]);
    setShowPacketScreen(false);
    setActiveFormInitialData(undefined);
    setActiveFormIsRenewal(false);
    setActiveTemplate(template);
  };

  /**
   * v75 — Called by BusinessProfileView when the user clicks "Complete with AI" on a
   * recommended form card. Closes the profile view, resolves the locale-aware template
   * for the clicked formId using the loaded business's location + county, and opens the
   * Form Filler. The existing businessProfile hint (derived from loadedBusiness and
   * completedFormsByFormId) automatically pre-fills all matching fields.
   */
  const handleStartFormFromProfile = (formId: string) => {
    if (!isPro && monthlyFormsUsed >= FREE_MONTHLY_LIMIT) return;
    // Use the loaded business's location so locale overrides fire correctly
    // (userLocation is already set to biz.location when a business is loaded).
    const template = getLocaleFormTemplate(formId, userLocation, detectedCounty);
    if (!template) return; // no guided wizard for this form — silently ignore
    setFormQueue([]);
    setQueueIndex(0);
    setCompletedFormsData([]);
    setShowPacketScreen(false);
    setActiveFormInitialData(undefined);
    setActiveFormIsRenewal(false);
    setActiveTemplate(template);
    // Close profile view so the Form Filler is visible
    setShowProfileView(false);
  };

  /**
   * Launch a renewal of an existing form, optionally pre-filling with the last
   * submission's field values. If the item belongs to a different saved business,
   * that business is activated first before the form opens.
   *
   * Called from:
   *  - EnhancedChecklist "Renew Now" button (active business items)
   *  - Cross-business sidebar "Renew" button (any saved business)
   */
  const handleRenewFormItem = useCallback((
    formId: string,
    /** Business that owns this checklist item — null = active business. */
    ownerBiz: SavedBusiness | null,
  ) => {
    if (!isPro && monthlyFormsUsed >= FREE_MONTHLY_LIMIT) return;

    // Look up pre-filled data from the most recent completed form for this formId.
    // First check the in-memory map (active session); fall back to the owner biz's
    // completedForms if the item belongs to a different business.
    let prefill: Record<string, string> | undefined;
    if (ownerBiz && ownerBiz.id !== loadedBusiness?.id) {
      const entry = ownerBiz.completedForms?.find(e => e.template.id === formId);
      prefill = entry?.formData;
    } else {
      prefill = completedFormsByFormId[formId]?.formData;
    }

    const launchForm = (loc: string, county: string | null) => {
      const template = getLocaleFormTemplate(formId, loc, county);
      if (!template) return;
      setFormQueue([]);
      setQueueIndex(0);
      setCompletedFormsData([]);
      setShowPacketScreen(false);
      setActiveFormInitialData(prefill);
      setActiveFormIsRenewal(true);
      setActiveTemplate(template);
    };

    if (ownerBiz && ownerBiz.id !== loadedBusiness?.id) {
      // Switch business first, then launch — handleLoadBusiness updates userLocation.
      handleLoadBusiness(ownerBiz);
      // Defer form launch until after React has flushed the location state update.
      // Using a 0ms timeout is sufficient because handleLoadBusiness is synchronous
      // for the state writes we need (userLocation is set inline, not in a useEffect).
      const targetLoc = ownerBiz.location;
      setTimeout(() => launchForm(targetLoc, null), 0);
    } else {
      launchForm(userLocation, detectedCounty);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, monthlyFormsUsed, loadedBusiness, completedFormsByFormId, userLocation, detectedCounty]);

  const handleStartAllForms = (formIds: string[]) => {
    if (!isPro && monthlyFormsUsed >= FREE_MONTHLY_LIMIT) return;
    const filtered  = filterFormsByLocation(formIds, userLocation);
    const templates = filtered
      .map(id => getLocaleFormTemplate(id, userLocation, detectedCounty))
      .filter(Boolean) as FormTemplate[];
    if (!templates.length) return;
    setFormQueue(templates);
    setQueueIndex(0);
    setCompletedFormsData([]);
    setShowPacketScreen(false);
    setActiveTemplate(templates[0]);
  };

  const handleFormComplete = (formData: Record<string, string>, template: FormTemplate) => {
    const doneText = `Complete and submit: ${template.name}`;
    const completionDate = new Date().toISOString();
    const renewalDate = getSuggestedRenewalDate(
      template.id,
      userLocation,
      completionDate,
      detectedCounty,
    ) ?? undefined;
    setChecklist(prev =>
      prev.some(c => c.text === doneText)
        ? prev
        : [...prev, {
            id:           `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            text:         doneText,
            fee:          template.fee,
            status:       "done" as const,
            completedVia: "RegPulse AI Form Filler",
            formId:       template.id,
            renewalDate,
            createdAt:    completionDate,
          }]
    );

    // Always record the completed form so "View Completed Form" works from the checklist.
    setCompletedFormsByFormId(prev => ({ ...prev, [template.id]: { template, formData } }));

    // v36 — Auto-create a synthetic document record so the completed form appears
    // under the correct recommended form card in BusinessProfileView.
    // Replaces any prior synthetic doc for the same formId (idempotent on re-complete).
    if (loadedBusiness) {
      const syntheticDoc: UploadedDocument = {
        id:           `form-complete-${template.id}-${Date.now()}`,
        businessId:   loadedBusiness.id,
        originalName: `${template.name} — Completed`,
        mimeType:     "application/pdf",
        sizeBytes:    0,
        storagePath:  "",
        analysis:     undefined,
        analyzed:     false,
        uploadedAt:   completionDate,
        formId:       template.id,
      };
      setUploadedDocs(prev => [
        syntheticDoc,
        ...prev.filter(d => !(d.formId === template.id && d.id.startsWith("form-complete-"))),
      ]);
    }

    // Track monthly usage for Free-tier gating (Supabase profile or localStorage).
    const newCount = monthlyFormsUsed + 1;
    setMonthlyFormsUsed(newCount);
    void dbSaveMonthlyUsage(user ? getSb() : null, user?.id ?? null, newCount);

    if (isQueueMode) {
      setCompletedFormsData(prev => [...prev, { template, formData }]);
      const next = queueIndex + 1;
      if (next < formQueue.length) {
        setQueueIndex(next);
        setActiveTemplate(formQueue[next]);
      } else {
        setActiveTemplate(null);
        setFormQueue([]);
        setQueueIndex(0);
        setShowPacketScreen(true);
      }
    } else {
      setActiveTemplate(null);
    }
  };

  // ── v62 — Auto-create business profile after Form Filler completion ─────────
  /**
   * Called by FormFiller when a form is completed but no business profile exists.
   * Creates a new SavedBusiness from the collected form data, attaches the
   * completed form as a synthetic document, and opens Business Profile View.
   *
   * v62 — Automatic business profile creation from Form Filler when no profile exists
   */
  const handleFormCompleteWithoutProfile = useCallback((
    formData: Record<string, string>,
    completedFormId: string,
  ) => {
    const now = new Date().toISOString();

    // Derive business name from form fields, fall back to "My Business"
    const bizName = (
      formData.businessName?.trim() ||
      formData.legalName?.trim() ||
      formData.fictitiousName?.trim() ||
      "My Business"
    );

    // Derive location from form fields, fall back to current user location
    const bizLocation = (
      formData.businessAddress?.trim() ||
      formData.principalAddress?.trim() ||
      formData.physicalAddress?.trim() ||
      formData.businessLocation?.trim() ||
      userLocation
    );

    const profile = calcBizProfile([], undefined);

    const newBiz: SavedBusiness = {
      id:                  `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:                bizName,
      location:            bizLocation,
      savedAt:             now,
      lastChecked:         now,
      checklist:           [],
      chatHistory:         toSavedMessages(messages),
      healthScore:         profile.healthScore,
      totalForms:          profile.totalForms,
      completedFormsCount: profile.completedFormsCount,
      isPreExisting:       false,
    };

    // Optimistic update — show business in sidebar + set as active immediately
    setLoadedBusiness(newBiz);
    setSavedBusinesses(prev => {
      const without = prev.filter(b => b.id !== newBiz.id);
      return [newBiz, ...without];
    });
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, newBiz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });

    // Attach the completed form as a synthetic UploadedDocument so it
    // appears on the matching recommended form card in BusinessProfileView.
    const formName = (ALL_FORMS as Record<string, { name: string }>)[completedFormId]?.name ?? completedFormId;
    const syntheticDoc: UploadedDocument = {
      id:           `form-complete-${completedFormId}-${Date.now()}`,
      businessId:   newBiz.id,
      originalName: `${formName} — Completed`,
      mimeType:     "application/pdf",
      sizeBytes:    0,
      storagePath:  "",
      analysis:     undefined,
      analyzed:     false,
      uploadedAt:   now,
      formId:       completedFormId,
    };
    setUploadedDocs(prev => [
      syntheticDoc,
      ...prev.filter(d => !(d.formId === completedFormId && d.id.startsWith("form-complete-"))),
    ]);

    // Open Business Profile View after the form filler closes
    setTimeout(() => setShowProfileView(true), 350);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, messages, user]);

  // ── View completed form from checklist ────────────────────────────────────
  /**
   * Called when user clicks "View Completed Form" on an AI-filled checklist item.
   * Shows PacketScreen with just the one completed form entry.
   */
  const handleViewCompletedForm = (formId: string) => {
    const entry = completedFormsByFormId[formId];
    if (!entry) return;
    setCompletedFormsData([entry]);
    setShowPacketScreen(true);
  };

  const handleDismissForm = () => {
    setActiveTemplate(null);
    setFormQueue([]);
    setQueueIndex(0);
    setCompletedFormsData([]);
  };

  // ── Business save / load ──────────────────────────────────────────────────

  // handleSaveBusiness is fire-and-forget async — the onSave prop signature stays
  // (name: string) => void so PacketScreen doesn't need updating.
  // If a business is already loaded, it is UPDATED IN PLACE (same ID) rather than
  // creating a duplicate. This also captures the current chat history.
  const handleSaveBusiness = useCallback((name: string) => {
    const allCompleted = Object.values(completedFormsByFormId);
    const completedForms = allCompleted.length > 0
      ? allCompleted
      : completedFormsData.length > 0 ? completedFormsData : undefined;
    const profile = calcBizProfile(checklist, completedForms);
    const now = new Date().toISOString();

    let biz: SavedBusiness;
    if (activeLocationId && loadedBusiness?.locations?.length) {
      // Multi-location: update active location slot, keep top-level identity fields
      biz = {
        ...(loadedBusiness ?? {}),
        id:      loadedBusiness?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        savedAt: loadedBusiness?.savedAt ?? now,
        lastChecked: now,
        locations: loadedBusiness.locations.map(loc =>
          loc.id === activeLocationId
            ? {
                ...loc,
                location:            userLocation,
                checklist,
                completedForms,
                chatHistory:         toSavedMessages(messages),
                healthScore:         profile.healthScore,
                totalForms:          profile.totalForms,
                completedFormsCount: profile.completedFormsCount,
                lastChecked:         now,
              }
            : loc
        ),
      };
    } else {
      // Single-location (backward compat)
      biz = {
        ...(loadedBusiness ?? {}),
        id:                  loadedBusiness?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        location:            userLocation,
        savedAt:             loadedBusiness?.savedAt ?? now,
        lastChecked:         now,
        checklist,
        completedForms,
        chatHistory:         toSavedMessages(messages),
        healthScore:         profile.healthScore,
        totalForms:          profile.totalForms,
        completedFormsCount: profile.completedFormsCount,
      };
    }
    setLoadedBusiness(biz);
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, biz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
  }, [userLocation, checklist, completedFormsData, completedFormsByFormId, loadedBusiness, messages, user, activeLocationId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Internal: load the working state from a specific data source (location or top-level). */
  const loadLocationData = (
    locData: { checklist: ChecklistItem[]; completedForms?: CompletedFormEntry[]; chatHistory?: SavedMessage[]; location: string },
  ) => {
    if (locData.chatHistory && locData.chatHistory.length > 0) {
      setMessages(toMessages(locData.chatHistory));
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
    setUseExactLocation(false);
    gpsActiveRef.current = false;
    setManualLocation(locData.location);
    setZipResolved(false);
    setDetectedCounty(null);
    setUserLocation(locData.location);
    setChecklist(locData.checklist);
    if (locData.completedForms && locData.completedForms.length > 0) {
      setCompletedFormsData(locData.completedForms);
      const byId: Record<string, CompletedFormEntry> = {};
      locData.completedForms.forEach(e => { byId[e.template.id] = e; });
      setCompletedFormsByFormId(byId);
      setShowPacketScreen(true);
    } else {
      setCompletedFormsData([]);
      setCompletedFormsByFormId({});
      setShowPacketScreen(false);
    }
    setActiveTemplate(null);
    setFormQueue([]);
    setQueueIndex(0);
  };

  const handleLoadBusiness = (biz: SavedBusiness, targetLocationId?: string) => {
    // ── 1. Snapshot the current session into the previously-loaded business ──
    if (loadedBusiness && loadedBusiness.id !== biz.id) {
      let snapshot: SavedBusiness;
      if (activeLocationId && loadedBusiness.locations?.length) {
        snapshot = {
          ...loadedBusiness,
          locations: loadedBusiness.locations.map(loc =>
            loc.id === activeLocationId
              ? { ...loc, checklist, chatHistory: toSavedMessages(messages), completedForms: Object.values(completedFormsByFormId).length > 0 ? Object.values(completedFormsByFormId) : loc.completedForms }
              : loc
          ),
        };
      } else {
        snapshot = {
          ...loadedBusiness,
          chatHistory: toSavedMessages(messages),
          checklist,
          completedForms: Object.values(completedFormsByFormId).length > 0
            ? Object.values(completedFormsByFormId)
            : loadedBusiness.completedForms,
        };
      }
      void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, snapshot);
    }

    // ── 2. Build the updated profile for the incoming business ────────────────
    const now = new Date().toISOString();

    // Determine which location to activate
    const hasLocations = biz.locations && biz.locations.length > 0;
    const firstLocId   = hasLocations ? biz.locations![0].id : null;
    const chosenLocId  = targetLocationId ?? (hasLocations ? firstLocId : null);
    const chosenLoc    = chosenLocId ? biz.locations?.find(l => l.id === chosenLocId) : null;

    // Profile metrics come from the chosen location or top-level
    const profileSource = chosenLoc
      ? { checklist: chosenLoc.checklist, completedForms: chosenLoc.completedForms }
      : { checklist: biz.checklist, completedForms: biz.completedForms };
    const profile = calcBizProfile(profileSource.checklist, profileSource.completedForms);

    const updated: SavedBusiness = {
      ...biz,
      lastChecked:         now,
      healthScore:         profile.healthScore,
      totalForms:          profile.totalForms,
      completedFormsCount: profile.completedFormsCount,
    };
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updated).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    setLoadedBusiness(updated);
    setActiveLocationId(chosenLocId);

    // v26 — Persist business context for /forms page "Recommended for You"
    {
      const loc = chosenLoc?.location ?? biz.location;
      saveBusinessContext({
        businessType:  biz.businessType ?? undefined,
        state:         loc ? (parseStateFromLocation(loc) ?? undefined) : undefined,
        isNewBusiness: biz.isPreExisting === false,
      });
    }

    // ── 3-5. Restore working state from chosen location or top-level ──────────
    if (chosenLoc) {
      loadLocationData(chosenLoc);
    } else {
      loadLocationData({
        checklist:     biz.checklist,
        completedForms: biz.completedForms,
        chatHistory:   biz.chatHistory,
        location:      biz.location,
      });
    }

    checklistTopRef.current?.scrollIntoView({ behavior: "smooth" });

    // v25 — Load uploaded (attached) documents for the incoming business
    void dbLoadDocuments(user ? getSb() : null, user?.id ?? null, biz.id).then(docs => {
      setUploadedDocs(docs);
    });
  };

  /**
   * Switch to a different location within the SAME loaded business.
   * Snapshots the current location's data, then restores the target location.
   */
  const handleSwitchLocation = useCallback((targetLoc: BusinessLocation) => {
    if (!loadedBusiness) return;
    if (targetLoc.id === activeLocationId) return; // already active

    // Snapshot current location
    const updatedBiz: SavedBusiness = {
      ...loadedBusiness,
      locations: loadedBusiness.locations?.map(loc =>
        loc.id === activeLocationId
          ? {
              ...loc,
              checklist,
              completedForms: Object.values(completedFormsByFormId).length > 0
                ? Object.values(completedFormsByFormId)
                : loc.completedForms,
              chatHistory: toSavedMessages(messages),
            }
          : loc
      ) ?? loadedBusiness.locations,
    };
    setLoadedBusiness(updatedBiz);
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updatedBiz);

    // Activate new location
    setActiveLocationId(targetLoc.id);
    loadLocationData(targetLoc);
    checklistTopRef.current?.scrollIntoView({ behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, activeLocationId, checklist, completedFormsByFormId, messages, user]);

  /**
   * Add a new location to the currently loaded business.
   */
  const handleAddLocation = useCallback((newLoc: BusinessLocation) => {
    if (!loadedBusiness) return;
    setAddLocationBizId(null);

    // Snapshot current location state before switching
    const currentLocations = loadedBusiness.locations ?? [];
    const snapshotLocations = currentLocations.map(loc =>
      loc.id === activeLocationId
        ? { ...loc, checklist, completedForms: Object.values(completedFormsByFormId).length > 0 ? Object.values(completedFormsByFormId) : loc.completedForms, chatHistory: toSavedMessages(messages) }
        : loc
    );

    const updatedBiz: SavedBusiness = {
      ...loadedBusiness,
      locations: [...snapshotLocations, newLoc],
    };
    setLoadedBusiness(updatedBiz);
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updatedBiz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });

    // Switch to the new location immediately
    setActiveLocationId(newLoc.id);
    loadLocationData(newLoc);
    // Auto-expand this business's location list in the sidebar
    setExpandedBizIds(prev => new Set([...prev, loadedBusiness.id]));
    checklistTopRef.current?.scrollIntoView({ behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, activeLocationId, checklist, completedFormsByFormId, messages, user]);

  /**
   * Add a new location to a NON-ACTIVE business (from the sidebar).
   * The business is NOT switched to — we just append the location and save.
   */
  const handleAddLocationToOtherBiz = useCallback((biz: SavedBusiness, newLoc: BusinessLocation) => {
    setAddLocationBizId(null);
    const updatedBiz: SavedBusiness = {
      ...biz,
      locations: [...(biz.locations ?? []), newLoc],
    };
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updatedBiz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    setExpandedBizIds(prev => new Set([...prev, biz.id]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /** Called by AddBusinessModal when an existing business is submitted. */
  const handleAddPreExistingBusiness = useCallback((biz: SavedBusiness) => {
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, biz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    setShowAddBizModal(false);
    // Immediately activate the new business
    handleLoadBusiness(biz);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /** Clears all data for the active business (checklist, forms, chat, renewals). */
  const handleClearActiveBusiness = useCallback(() => {
    if (!loadedBusiness) return;
    let cleared: SavedBusiness;
    if (activeLocationId && loadedBusiness.locations?.length) {
      // Multi-location: clear only the active location's data
      cleared = {
        ...loadedBusiness,
        locations: loadedBusiness.locations.map(loc =>
          loc.id === activeLocationId
            ? { ...loc, checklist: [], completedForms: undefined, chatHistory: [], healthScore: 0, totalForms: 0, completedFormsCount: 0 }
            : loc
        ),
      };
    } else {
      cleared = {
        ...loadedBusiness,
        checklist:           [],
        completedForms:      undefined,
        chatHistory:         [],
        healthScore:         0,
        totalForms:          0,
        completedFormsCount: 0,
      };
    }
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, cleared).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    setLoadedBusiness(cleared);
    setChecklist([]);
    setCompletedFormsData([]);
    setCompletedFormsByFormId({});
    setMessages([WELCOME_MESSAGE]);
    setShowPacketScreen(false);
    setActiveTemplate(null);
    setFormQueue([]);
    setQueueIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, activeLocationId, user]);

  /** Permanently deletes a business from Supabase and localStorage. */
  const handleDeleteBusiness = useCallback((biz: SavedBusiness) => {
    void dbDeleteBusiness(user ? getSb() : null, user?.id ?? null, biz.id).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    // If this was the active business, reset to blank state
    if (loadedBusiness?.id === biz.id) {
      setLoadedBusiness(null);
      setActiveLocationId(null);
      setChecklist([]);
      setCompletedFormsData([]);
      setCompletedFormsByFormId({});
      setMessages([WELCOME_MESSAGE]);
      setShowPacketScreen(false);
      setActiveTemplate(null);
      setFormQueue([]);
      setQueueIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, user]);

  /** Save notification preferences for a business (targeted column update). */
  const handleSaveNotificationPrefs = useCallback((bizId: string, prefs: NotificationPrefs) => {
    void dbSaveNotificationPrefs(user ? getSb() : null, user?.id ?? null, bizId, prefs).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    // If this is the active business, patch loadedBusiness state so the bell icon updates immediately
    if (loadedBusiness?.id === bizId) {
      setLoadedBusiness(prev => prev ? { ...prev, notificationPrefs: prefs } : prev);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, user]);

  /**
   * Called when DocumentUploadButton finishes uploading + AI analysis.
   * Persists the document record to Supabase and shows the analysis card.
   */
  const handleDocumentAnalysisComplete = useCallback((result: AnalysisResult) => {
    setDocAnalysisResult(result);
    setShowDocUploadPanel(false);

    // Persist document record for authenticated users with an active business
    if (user && loadedBusiness) {
      void dbSaveDocument(getSb(), user.id, {
        businessId:   loadedBusiness.id,
        originalName: result.fileName,
        mimeType:     result.mimeType,
        sizeBytes:    result.sizeBytes,
        storagePath:  result.storagePath,
        analysis:     result.analysis,
        analyzed:     true,
      }).then(saved => {
        if (saved) setUploadedDocs(prev => [saved, ...prev]);
      });
    }

    // v30 — Completed Document → Business Profile Flow
    // A document is considered "completed" when the AI found real permit/license data
    // (status ≠ Unknown, or a businessName/permitNumber was extracted, or at least one
    // matchedFormId was recognised).  Blank / template forms typically have status
    // Unknown and no extracted fields.
    const a = result.analysis;
    const looksCompleted =
      a.status !== "Unknown" ||
      !!a.businessName ||
      !!a.permitNumber ||
      a.matchedFormIds.length > 0;

    if (looksCompleted && !loadedBusiness) {
      // v31 — Fix Yes Create It Button (Direct Trigger)
      // No business profile active — notify the user and point them to the
      // "Yes, create it" button in the card above (primary trigger).
      // Also arm the ref-based fallback so typing "yes" in the chat still works.
      const botPrompt: Message = {
        id:      `doc-profile-prompt-${Date.now()}`,
        role:    "assistant",
        content:
          `I detected this is a completed **${a.docType}**` +
          (a.issuingAuthority ? ` issued by ${a.issuingAuthority}` : "") +
          (a.businessName ? ` for **${a.businessName}**` : "") +
          `.\n\nClick **"Yes, create it"** on the card above to create a new business profile and attach this document — or type **yes** to confirm.`,
      };
      setMessages(prev => [...prev, botPrompt]);
      // Arm the ref-based fallback for users who type "yes" instead of clicking
      setPendingDocumentForProfile(result);
      pendingDocumentForProfileRef.current = result;
      setAwaitingProfileConfirmation(true);
      awaitingProfileConfirmationRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadedBusiness]);

  /**
   * v25 — Called when DocumentUploadButton (mode="attach") finishes uploading.
   * Saves the document record as analyzed=false (no AI analysis performed).
   * Used for "Upload Completed Document" — preexisting permits, licenses, etc.
   */
  const handleAttachDocument = useCallback((result: AttachResult) => {
    setShowAttachPanel(false);

    if (user && loadedBusiness) {
      void dbSaveDocument(getSb(), user.id, {
        businessId:   loadedBusiness.id,
        originalName: result.fileName,
        mimeType:     result.mimeType,
        sizeBytes:    result.sizeBytes,
        storagePath:  result.storagePath,
        analysis:     undefined,
        analyzed:     false,
      }).then(saved => {
        if (saved) setUploadedDocs(prev => [saved, ...prev]);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadedBusiness]);

  /**
   * v32 — Called by BusinessProfileView when the user saves an inline name/location edit.
   * Persists the updated business to Supabase (or localStorage for guests).
   */
  const handleUpdateBusinessFromProfile = useCallback((updated: SavedBusiness) => {
    setLoadedBusiness(updated);
    setSavedBusinesses(prev => {
      const without = prev.filter(b => b.id !== updated.id);
      return [updated, ...without];
    });
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * v33 — Thin wrapper: update only the business name.
   * Passes through to handleUpdateBusinessFromProfile with the rest of the
   * business unchanged so the caller doesn't need the full SavedBusiness object.
   */
  const handleUpdateBusinessNameFromProfile = useCallback((name: string) => {
    if (!loadedBusiness) return;
    handleUpdateBusinessFromProfile({ ...loadedBusiness, name });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, handleUpdateBusinessFromProfile]);

  /**
   * v33 — Thin wrapper: update only the business location.
   * Called by BusinessProfileView when the user commits an inline location edit.
   * The parent re-derives recommendedForms via useMemo on the next render.
   */
  const handleLocationChangeFromProfile = useCallback((location: string) => {
    if (!loadedBusiness) return;
    handleUpdateBusinessFromProfile({ ...loadedBusiness, location });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, handleUpdateBusinessFromProfile]);

  /**
   * v35 — Fixed Upload Completed button + Drag & Drop support.
   * Called by BusinessProfileView when the user picks or drops a file on a
   * recommended form card. Immediately adds an optimistic UploadedDocument to
   * uploadedDocs so the entry appears in the Completed Documents section without
   * waiting for the Supabase round-trip, then reconciles with the real saved record.
   * Uses loadedBusiness?.id to scope the document to the correct business profile.
   */
  const handleUploadCompletedDocFromProfile = useCallback(async (file: File, _formId: string) => {
    if (!loadedBusiness) return;
    const ts       = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const now      = new Date().toISOString();

    if (user) {
      const storagePath  = `${user.id}/${loadedBusiness.id}/${ts}-${safeName}`;
      const optimisticId = `optimistic-${ts}`;

      // v35 — Optimistic update: add doc immediately so BusinessProfileView
      // shows it in Completed Documents without waiting for the storage upload.
      const optimisticDoc: UploadedDocument = {
        id:           optimisticId,
        businessId:   loadedBusiness.id,
        originalName: file.name,
        mimeType:     file.type,
        sizeBytes:    file.size,
        storagePath,
        analysis:     undefined,
        analyzed:     false,
        uploadedAt:   now,
      };
      setUploadedDocs(prev => [optimisticDoc, ...prev]);

      const sb = getSb();
      const { error: storageErr } = await sb.storage
        .from("business-documents")
        .upload(storagePath, file, { contentType: file.type, upsert: false });

      if (storageErr) {
        console.error("BusinessProfileView upload error:", storageErr.message);
        // Remove the optimistic entry if storage upload failed
        setUploadedDocs(prev => prev.filter(d => d.id !== optimisticId));
        return;
      }

      // Persist DB record; replace optimistic entry with the real saved doc
      void dbSaveDocument(sb, user.id, {
        businessId:   loadedBusiness.id,
        originalName: file.name,
        mimeType:     file.type,
        sizeBytes:    file.size,
        storagePath,
        analysis:     undefined,
        analyzed:     false,
      }).then(saved => {
        setUploadedDocs(prev =>
          saved
            ? prev.map(d => d.id === optimisticId ? saved : d)
            : prev.filter(d => d.id !== optimisticId),
        );
      });
    } else {
      // Guest path — no storage, keep local record only; appears instantly
      const localDoc: UploadedDocument = {
        id:           `local-${ts}`,
        businessId:   loadedBusiness.id,
        originalName: file.name,
        mimeType:     file.type,
        sizeBytes:    file.size,
        storagePath:  "",
        analysis:     undefined,
        analyzed:     false,
        uploadedAt:   now,
      };
      setUploadedDocs(prev => [localDoc, ...prev]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadedBusiness]);

  /**
   * v39 — Called by BusinessProfileView when the user explicitly clicks "Save Changes".
   * Persists every draft document (File + formId) to Supabase Storage + DB,
   * with the same optimistic-update pattern used by handleUploadCompletedDocFromProfile.
   * Returns a Promise so BusinessProfileView can await completion before clearing drafts.
   */
  // v41 FIX — returns Promise<UploadedDocument[]> so BusinessProfileView can populate
  // localSavedDocs immediately and show the green badge without waiting for the parent
  // re-render to propagate completedDocuments back down as a prop.
  const handleSaveDraftsFromProfile = useCallback(async (drafts: DraftDoc[]): Promise<UploadedDocument[]> => {
    if (!loadedBusiness) return [];
    const sb  = user ? getSb() : null;
    const now = new Date().toISOString();
    // Collect the docs that were successfully queued/saved — returned to BusinessProfileView.
    const result: UploadedDocument[] = [];

    for (const draft of drafts) {
      const ts       = Date.now();
      const safeName = draft.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      if (user && sb) {
        const storagePath  = `${user.id}/${loadedBusiness.id}/${ts}-${safeName}`;
        const optimisticId = `draft-opt-${draft.localId}`;

        // Optimistic entry — added to uploadedDocs state immediately for the parent.
        const optimisticDoc: UploadedDocument = {
          id:           optimisticId,
          businessId:   loadedBusiness.id,
          originalName: draft.file.name,
          mimeType:     draft.file.type,
          sizeBytes:    draft.file.size,
          storagePath,
          analysis:     undefined,
          analyzed:     false,
          uploadedAt:   now,
          formId:       draft.formId || undefined,
        };
        setUploadedDocs(prev => [optimisticDoc, ...prev]);

        const { error: storageErr } = await sb.storage
          .from("business-documents")
          .upload(storagePath, draft.file, { contentType: draft.file.type, upsert: false });

        if (storageErr) {
          console.error("[handleSaveDraftsFromProfile] storage upload failed:", storageErr.message);
          setUploadedDocs(prev => prev.filter(d => d.id !== optimisticId));
          // Don't push to result — upload failed, no green badge for this draft.
          continue;
        }

        // Upload succeeded — include optimisticDoc in result so BusinessProfileView
        // can show the green badge immediately via localSavedDocs.
        result.push(optimisticDoc);

        void dbSaveDocument(sb, user.id, {
          businessId:   loadedBusiness.id,
          originalName: draft.file.name,
          mimeType:     draft.file.type,
          sizeBytes:    draft.file.size,
          storagePath,
          analysis:     undefined,
          analyzed:     false,
        }).then(saved => {
          setUploadedDocs(prev =>
            saved
              ? prev.map(d => d.id === optimisticId ? { ...saved, formId: draft.formId || undefined } : d)
              : prev.filter(d => d.id !== optimisticId),
          );
        });
      } else {
        // Guest — keep local record only (no storage upload).
        const localDoc: UploadedDocument = {
          id:           `local-${ts}`,
          businessId:   loadedBusiness.id,
          originalName: draft.file.name,
          mimeType:     draft.file.type,
          sizeBytes:    draft.file.size,
          storagePath:  "",
          analysis:     undefined,
          analyzed:     false,
          uploadedAt:   now,
          formId:       draft.formId || undefined,
        };
        setUploadedDocs(prev => [localDoc, ...prev]);
        result.push(localDoc);
      }
    }

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadedBusiness]);

  /**
   * v39 — Called by BusinessProfileView when the user discards all drafts.
   * Drafts are purely client-side until saved, so the parent has nothing to undo.
   */
  const handleDiscardDraftsFromProfile = useCallback(() => {
    // No server-side state to roll back — the component already cleared its own draft state.
  }, []);

  /**
   * v45 — Zoning & Address Compliance Checker.
   * v46 — Surfaces specific server error messages (and optional details) so
   *        BusinessProfileView can display them verbatim instead of a generic fallback.
   */
  const handleCheckZoning = useCallback(async (
    address: string,
    businessType: string,
  ): Promise<ZoningResult> => {
    const res = await fetch("/api/zoning/check", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ address, businessType }),
    });
    const data = await res.json() as { ok: boolean; result?: ZoningResult; error?: string; details?: string };
    if (!data.ok || !data.result) {
      // Prefer server's specific error; append details when present and different.
      const msg = data.error ?? "Zoning check failed. Please try again.";
      const detail = data.details && data.details !== data.error ? ` (${data.details})` : "";
      throw new Error(msg + detail);
    }
    return data.result;
  }, []);

  /**
   * v45 — Called when user clicks "Attach Zoning Result to Profile".
   * Creates a synthetic UploadedDocument from the ZoningResult so it appears
   * in the Completed Documents list with a clear label.
   * v50 — Added formId, dbSaveDocument for auth users, and setShowProfileView(true).
   */
  const handleAttachZoningResult = useCallback((result: ZoningResult) => {
    if (!loadedBusiness) return;
    const ts = Date.now();
    const optimisticId = `zoning-${ts}`;
    const statusLabel = result.status.charAt(0).toUpperCase() + result.status.slice(1);
    const matchedFormIds = result.requiredPermits
      .map(p => p.formId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);
    // Use the first matched permit formId so the result card appears on a form card,
    // falling back to "zoning-check" if no permits were returned.
    const primaryFormId = matchedFormIds[0] ?? "zoning-check";

    const docRecord = {
      businessId:   loadedBusiness.id,
      originalName: `Zoning Check — ${statusLabel} — ${new Date(result.checkedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      mimeType:     "application/json",
      sizeBytes:    0,
      storagePath:  "", // synthetic — no actual file
      analysis: {
        docType:          "Zoning Compliance Check",
        issuingAuthority: result.zoneType,
        status:           (result.status === "allowed" ? "Active" : result.status === "prohibited" ? "Suspended" : "Pending") as "Active" | "Expired" | "Suspended" | "Pending" | "Unknown",
        summary:          result.notes,
        suggestions:      result.restrictions,
        matchedFormIds,
        rawExtracted: {
          zone_type:     result.zoneType,
          status:        result.status,
          address:       result.address,
          business_type: result.businessType,
        },
      },
      analyzed:   true,
      uploadedAt: result.checkedAt,
    };

    // Optimistic update — immediately visible in BusinessProfileView
    const optimisticDoc: UploadedDocument = {
      id:     optimisticId,
      formId: primaryFormId,
      ...docRecord,
    };
    setUploadedDocs(prev => [optimisticDoc, ...prev]);
    setShowProfileView(true);

    // Persist for authenticated users (synthetic doc — storagePath is empty)
    if (user) {
      void dbSaveDocument(getSb(), user.id, docRecord).then(saved => {
        setUploadedDocs(prev =>
          saved
            ? prev.map(d => d.id === optimisticId ? { ...saved, formId: primaryFormId } : d)
            : prev.filter(d => d.id !== optimisticId),
        );
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, user]);

  /**
   * v25 — Called when user clicks "View" on an uploaded document.
   * Generates a signed URL from Supabase Storage and opens it in a new tab.
   */
  const handleViewDocument = useCallback(async (doc: UploadedDocument) => {
    if (!doc.storagePath) return;
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("business-documents")
      .createSignedUrl(doc.storagePath, 60 * 60); // 1-hour expiry
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  /**
   * Called when user clicks "Apply Updates" in the DocumentAnalysisCard.
   * Marks matching checklist items as "done" with completedVia = "Document Upload".
   * Also sets renewalDate from the expiration date when available.
   */
  const handleApplyDocumentUpdates = useCallback((matched: MatchedItem[]) => {
    if (matched.length === 0) return;
    const expirationDate = docAnalysisResult?.analysis.expirationDate;

    setChecklist(prev => prev.map(item => {
      const isMatched = matched.some(m => m.checklistItemId === item.id);
      if (!isMatched) return item;
      return {
        ...item,
        status:      "done" as const,
        completedVia: "Document Upload",
        // Only set renewalDate if not already set and the document has an expiration
        renewalDate: item.renewalDate
          ?? (expirationDate && typeof expirationDate === "string" ? expirationDate : undefined),
      };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docAnalysisResult]);

  // ── Location display helpers ──────────────────────────────────────────────

  const locationIsReady =
    userLocation !== "Detecting location..." &&
    userLocation !== "Enter location" &&
    userLocation !== "Resolving ZIP…" &&
    !userLocation.startsWith("Detecting");

  // ── Render ────────────────────────────────────────────────────────────────

  // ── v61: Review Impact modal data ────────────────────────────────────────
  const reviewImpactAlert = reviewImpactAlertId
    ? ruleAlerts.find(a => a.id === reviewImpactAlertId) ?? null
    : null;

  return (
    // vMobile-icon-fix — root flex height subtracts body safe-area padding so the container
    // never overflows the body content area. Without this, body paddingTop + paddingBottom
    // (env(safe-area-inset-*)) + h-dvh > viewport: the send button / bottom form-card
    // buttons end up below the iOS viewport edge and become untappable.
    <div className="flex bg-[#f8f9fb]" style={{ height: "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))" }}>{/* vMobile-scale-fix: dvh = dynamic viewport height, correct on iOS Safari */}

      {/* v61 — Review Impact modal ─────────────────────────────────────── */}
      {reviewImpactAlert && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget) setReviewImpactAlertId(null); }}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#fff", border: "1px solid #e2e8f0" }}>

            {/* Modal header — amber accent */}
            <div className="flex items-start justify-between px-5 py-4"
              style={{ background: "linear-gradient(135deg, #0B1E3F 0%, #1e3a5f 100%)" }}>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(251,191,36,0.18)", border: "1px solid rgba(251,191,36,0.35)" }}>
                  <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 mb-0.5">
                    Regulation Update
                  </p>
                  <p className="text-sm font-bold text-white leading-snug">{reviewImpactAlert.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{reviewImpactAlert.businessName}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewImpactAlertId(null)}
                className="shrink-0 text-slate-400 hover:text-white transition-colors mt-0.5"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">

              {/* What this means */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B1E3F] mb-1.5">
                  What This Means
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {reviewImpactAlert.description}
                </p>
              </div>

              {/* Affected forms with status */}
              {reviewImpactAlert.affectedForms.length > 0 && (() => {
                const affected = reviewImpactAlert.affectedForms.map(formId => {
                  const form = ALL_FORMS[formId];
                  const clItem = checklist.find(c => c.formId === formId);
                  return { formId, name: form?.name ?? formId, clItem };
                });
                return (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B1E3F] mb-1.5">
                      Affected Filings
                    </p>
                    <div className="space-y-1.5">
                      {affected.map(({ formId, name, clItem }) => (
                        <div key={formId}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-3.5 w-3.5 text-[#0B1E3F] shrink-0" />
                            <span className="text-xs text-slate-800 font-medium truncate">{name}</span>
                          </div>
                          {clItem ? (
                            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              clItem.status === "done"
                                ? "text-green-700 bg-green-50 border-green-200"
                                : clItem.status === "in-progress"
                                  ? "text-amber-700 bg-amber-50 border-amber-200"
                                  : "text-slate-500 bg-slate-50 border-slate-200"
                            }`}>
                              {clItem.status === "done" ? "Completed" : clItem.status === "in-progress" ? "In Progress" : "To Do"}
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                              Not tracked
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* What to do next */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B1E3F] mb-1.5">
                  What To Do Next
                </p>
                <ul className="space-y-2">
                  {reviewImpactAlert.affectedForms.map(formId => {
                    const name = ALL_FORMS[formId]?.name ?? formId;
                    const done = checklist.find(c => c.formId === formId && c.status === "done");
                    return done ? (
                      <li key={formId} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-[#00C2CB] mt-0.5 shrink-0">✓</span>
                        Re-review your {name} to confirm it still meets the updated requirements.
                      </li>
                    ) : (
                      <li key={formId} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-amber-500 mt-0.5 shrink-0">→</span>
                        File or update your {name} to comply with the new rules.
                      </li>
                    );
                  })}
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-slate-400 mt-0.5 shrink-0">→</span>
                    Check your renewal dates — late filing after a regulation change may incur penalties.
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-slate-400 mt-0.5 shrink-0">→</span>
                    Contact the issuing agency directly if you are unsure whether you are affected.
                  </li>
                </ul>
              </div>

              {/* Deadline risk */}
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
                <Bell className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Deadline risk:</strong> Failure to update affected permits before your next renewal date
                  may result in fines or permit revocation. Act before the next renewal cycle.
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 flex gap-2"
              style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <button
                onClick={() => {
                  setReviewImpactAlertId(null);
                  checklistTopRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                style={{ background: "#0B1E3F" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1e3a5f")}
                onMouseLeave={e => (e.currentTarget.style.background = "#0B1E3F")}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Go to Checklist
              </button>
              <button
                onClick={() => {
                  dismissAlert(reviewImpactAlert.id);
                  setReviewImpactAlertId(null);
                }}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700 bg-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ Sidebar ════════════ */}
      {/* vMobile: overlay backdrop — visible only on mobile when sidebar is open */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      {/* vMobile: sidebar is hidden on mobile by default; slides in as fixed drawer when showMobileSidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col shrink-0
        border-r border-slate-200 bg-white
        transition-transform duration-300
        ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"}
        md:static md:translate-x-0 md:flex
      `}>

        {/* Brand — neo-futurist glass header */}
        <div className="rp-brand-header flex items-center gap-2.5 px-4 py-3.5">
          <RegPulseIcon size={34} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-[15px] leading-tight text-white">RegPulse</h1>
              {isPro && (
                <span
                  className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide"
                  title="Priority response from our team"
                >
                  <Crown className="h-2 w-2" />
                  PRO
                </span>
              )}
            </div>
            <p className="text-[10px] text-cyan-400/70 leading-tight">Compliance Co-pilot</p>
          </div>
          {/* Dev toggle — click to simulate Free / Pro tier */}
          <button
            onClick={() => setIsPro(v => !v)}
            className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-colors ${
              isPro
                ? "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                : "text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
            title={isPro ? "Switch to Free tier (dev)" : "Switch to Pro tier (dev)"}
          >
            {isPro ? "Pro ✓" : "Free"}
          </button>
          {/* vMobile — close button visible only on mobile */}
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Close menu"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* ── Auth panel ─────────────────────────────────────────────────── */}
        <div className="border-b border-slate-100">
          {authLoading ? null : user ? (
            /* Signed-in: compact status bar */
            <div className="flex items-center gap-2 px-4 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="flex-1 text-[10px] text-slate-500 truncate">
                Synced · {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="shrink-0 text-[10px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-0.5"
                title="Sign out"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          ) : authExpanded ? (
            /* Guest: expanded auth form */
            <div className="px-4 py-3 space-y-2.5">
              {/* Mode tabs */}
              <div className="flex items-center gap-1 mb-1">
                {(["signin", "signup", "magic"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setAuthMode(m); setAuthError(""); setMagicSent(false); }}
                    className={`flex-1 text-[10px] font-semibold py-1 rounded-md transition-colors ${
                      authMode === m
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : m === "signup" ? "Sign Up" : "Magic Link"}
                  </button>
                ))}
                <button
                  onClick={() => setAuthExpanded(false)}
                  className="text-slate-300 hover:text-slate-500 ml-1"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Email field (all modes) */}
              <input
                type="email"
                placeholder="your@email.com"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (authMode === "signin") void handleSignIn();
                    else if (authMode === "signup") void handleSignUp();
                    else void handleMagicLink();
                  }
                }}
                className="w-full text-xs h-8 border border-slate-200 rounded-lg px-3 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 placeholder:text-slate-400"
              />

              {/* Password field (sign-in + sign-up only) */}
              {authMode !== "magic" && (
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      if (authMode === "signin") void handleSignIn();
                      else void handleSignUp();
                    }
                  }}
                  className="w-full text-xs h-8 border border-slate-200 rounded-lg px-3 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 placeholder:text-slate-400"
                />
              )}

              {/* Submit button */}
              {magicSent ? (
                <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5 text-center">
                  Check your email for a sign-in link.
                </p>
              ) : (
                <button
                  disabled={authWorking || !authEmail.trim()}
                  onClick={() => {
                    if (authMode === "signin") void handleSignIn();
                    else if (authMode === "signup") void handleSignUp();
                    else void handleMagicLink();
                  }}
                  className="w-full h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {authWorking ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : authMode === "signin" ? (
                    <><LogIn className="h-3 w-3" /> Sign In</>
                  ) : authMode === "signup" ? (
                    <><UserPlus className="h-3 w-3" /> Create Account</>
                  ) : (
                    <><Mail className="h-3 w-3" /> Send Magic Link</>
                  )}
                </button>
              )}

              {/* Inline error / info */}
              {authError && (
                <p className={`text-[10px] text-center ${
                  authError.startsWith("Check") ? "text-emerald-700" : "text-red-600"
                }`}>
                  {authError}
                </p>
              )}

              <p className="text-[10px] text-slate-400 text-center">
                Sign in to sync your data across devices.
              </p>
            </div>
          ) : (
            /* Guest: collapsed — single CTA line */
            <button
              onClick={() => setAuthExpanded(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <KeyRound className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="flex-1 text-left">Sign in to sync your data</span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
            </button>
          )}
        </div>

        {/* Location panel */}
        <div className="px-4 py-4 border-b border-slate-100 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Your Location
          </p>

          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
            zipResolved
              ? "bg-green-50 ring-1 ring-green-200"
              : locationIsReady
                ? "bg-blue-50 ring-1 ring-blue-200"
                : "bg-slate-50 ring-1 ring-slate-200"
          }`}>
            {zipLookingUp ? (
              <Loader2 className="h-3.5 w-3.5 text-slate-400 shrink-0 animate-spin" />
            ) : zipResolved ? (
              <CheckCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
            ) : (
              <MapPin className={`h-3.5 w-3.5 shrink-0 ${locationIsReady ? "text-blue-500" : "text-slate-400"}`} />
            )}
            <div className="min-w-0">
              <span className={`font-medium text-xs truncate block ${
                zipResolved ? "text-green-800" : locationIsReady ? "text-slate-700" : "text-slate-400"
              }`}>
                {userLocation}
              </span>
              {detectedCounty && locationIsReady && (
                <span className="text-[10px] text-slate-400 truncate block">{detectedCounty}</span>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useExactLocation}
              onChange={handleToggleGps}
              className="accent-blue-600"
            />
            <span className="text-slate-500">Use current location (GPS)</span>
          </label>

          {!useExactLocation && (
            <div className="relative">
              <Input
                type="text"
                placeholder="ZIP code or City, State (e.g. 79401 or Lubbock, TX)"
                value={manualLocation}
                onChange={handleLocationInput}
                className={`text-xs h-8 pr-7 ${zipResolved ? "border-green-300 focus-visible:ring-green-200" : ""}`}
              />
              {zipLookingUp && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 animate-spin" />
              )}
              {zipResolved && !zipLookingUp && (
                <CheckCheck className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-green-500" />
              )}
            </div>
          )}
        </div>

        {/* Compliance Dashboard */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 pt-4 pb-2 shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Compliance Dashboard
            </p>
          </div>

          {/* ── Compliance Health Score card ──────────────────────────────── */}
          {healthScore && (() => {
            const { score, pending, expiringCount, noData } = healthScore;
            const RING_R    = 20;
            const RING_CIRC = 2 * Math.PI * RING_R;
            const offset    = RING_CIRC * (1 - score / 100);
            // v61 — noData (0 forms verified done) shows slate "No data yet" state
            const ringStroke = noData
              ? "#94a3b8"
              : score >= 80 ? "#16a34a"
              : score >= 50 ? "#d97706" : "#dc2626";
            const textColor = noData
              ? "text-slate-500"
              : score >= 80 ? "text-green-700"
              : score >= 50 ? "text-amber-700" : "text-red-700";
            const bgColor = noData
              ? "bg-slate-50 border-slate-200"
              : score >= 80 ? "bg-green-50 border-green-200"
              : score >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
            const label = noData
              ? "Complete forms to track progress"
              : score >= 80 ? "Looking good"
              : score >= 50 ? "Needs attention" : "At risk";
            return (
              <div
                className={`mx-4 mb-2 rounded-xl border p-3 cursor-pointer transition-shadow hover:shadow-sm shrink-0 ${bgColor}`}
                onClick={() => checklistTopRef.current?.scrollIntoView({ behavior: "smooth" })}
                title="Click to jump to checklist"
              >
                <div className="flex items-center gap-3">
                  {/* SVG ring */}
                  <div className="shrink-0 relative">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r={RING_R} fill="none" stroke="#e2e8f0" strokeWidth="6" />
                      {!noData && (
                        <circle
                          cx="28" cy="28" r={RING_R}
                          fill="none"
                          stroke={ringStroke}
                          strokeWidth="6"
                          strokeDasharray={RING_CIRC}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          transform="rotate(-90 28 28)"
                          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
                        />
                      )}
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums ${textColor}`}>
                      {noData ? "—" : `${score}%`}
                    </span>
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Activity className={`h-3 w-3 shrink-0 ${textColor}`} />
                      <span className={`text-[11px] font-bold ${textColor}`}>
                        Compliance Health
                      </span>
                    </div>
                    {/* v61 — show "No data yet" when nothing is verified as done */}
                    <p className={`text-xs font-semibold ${textColor}`}>
                      {noData ? "No data yet" : `${score}% compliant`}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      {label}
                      {!noData && pending > 0 && ` · ${pending} item${pending !== 1 ? "s" : ""} pending`}
                    </p>
                    {expiringCount > 0 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          renewalsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 hover:underline"
                      >
                        <Bell className="h-2.5 w-2.5" />
                        {expiringCount} renewal{expiringCount !== 1 ? "s" : ""} due soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <div ref={checklistTopRef} className="flex-1 overflow-y-auto px-4 pb-2">
            <EnhancedChecklist
              items={checklist}
              onUpdate={(id, changes) =>
                setChecklist(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
              }
              onDelete={(id) =>
                setChecklist(prev => prev.filter(i => i.id !== id))
              }
              onStartForm={item => { if (item.formId) handleStartForm(item.formId); }}
              onViewCompletedForm={handleViewCompletedForm}
              onCompleteAllForms={formIds => handleStartAllForms(formIds)}
              onRenewForm={item => { if (item.formId) handleRenewFormItem(item.formId, loadedBusiness); }}
              alertedFormIds={alertedFormIds}
              onViewRuleAlert={() => alertsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
              onMarkAllDone={() =>
                setChecklist(prev => prev.map(i => ({ ...i, status: "done" as const })))
              }
              onClearCompleted={() =>
                setChecklist(prev => prev.filter(i => i.status !== "done"))
              }
              onResetAll={() => { setChecklist([]); setLoadedBusiness(null); }}
              onClearAll={loadedBusiness ? handleClearActiveBusiness : undefined}
              onUploadDocument={loadedBusiness ? () => setShowDocUploadPanel(true) : undefined}
              uploadedDocuments={loadedBusiness ? uploadedDocs : undefined}
              onUploadCompletedDoc={loadedBusiness ? () => setShowAttachPanel(true) : undefined}
              onViewDocument={handleViewDocument}
              loadedBusiness={loadedBusiness ?? undefined}
              isPro={isPro}
              monthlyFormsUsed={monthlyFormsUsed}
              freeMonthlyLimit={FREE_MONTHLY_LIMIT}
            />
          </div>

          {/* Upcoming Renewals — aggregated across ALL saved businesses.
               Urgency: red ≤30d, amber ≤60d, green ≤90d, slate >90d. */}
          {allRenewals.length > 0 && (() => {
            // Show first 5 soonest; rest hidden behind a "show more" concept
            // (keeping the sidebar compact — the most urgent items are what matter).
            const visible = allRenewals.slice(0, 5);
            const overdueCount = allRenewals.filter(r => r.daysLeft < 0).length;
            const soonCount    = allRenewals.filter(r => r.daysLeft >= 0 && r.daysLeft <= 30).length;
            return (
              <div ref={renewalsSectionRef} className="shrink-0 border-t border-slate-100 px-4 py-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-3 w-3 text-amber-500" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Upcoming Renewals
                  </p>
                  {(overdueCount > 0 || soonCount > 0) && (
                    <span className={`ml-auto text-[10px] font-bold border rounded-full px-1.5 py-0.5 tabular-nums ${
                      overdueCount > 0
                        ? "text-red-700 bg-red-50 border-red-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}>
                      {overdueCount > 0 ? `${overdueCount} overdue` : `${soonCount} soon`}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {visible.map(({ biz, item, daysLeft, formName }) => {
                    const isActiveBiz = loadedBusiness?.id === biz.id;
                    const badgeColor =
                      daysLeft < 0   ? "text-red-700 bg-red-50 border-red-200" :
                      daysLeft <= 30 ? "text-red-700 bg-red-50 border-red-200" :
                      daysLeft <= 60 ? "text-amber-700 bg-amber-50 border-amber-200" :
                      daysLeft <= 90 ? "text-green-700 bg-green-50 border-green-200" :
                                       "text-slate-600 bg-slate-50 border-slate-200";
                    const countLabel =
                      daysLeft < 0   ? `${Math.abs(daysLeft)}d overdue` :
                      daysLeft === 0 ? "Today" :
                      daysLeft === 1 ? "Tomorrow" :
                      daysLeft <= 13 ? `${daysLeft}d` :
                      daysLeft <= 90 ? `${Math.round(daysLeft / 7)}w` :
                                       `${Math.round(daysLeft / 30)}mo`;
                    return (
                      <div key={`${biz.id}-${item.id}`} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 space-y-1">
                        {/* Business name — only shown for cross-business items */}
                        {!isActiveBiz && (
                          <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wide truncate">
                            {biz.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-slate-700 truncate" title={formName}>
                              {formName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(item.renewalDate! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-semibold border rounded px-1.5 py-0.5 ${badgeColor}`}>
                            {countLabel}
                          </span>
                          {item.formId && (
                            <button
                              onClick={() => handleRenewFormItem(item.formId!, isActiveBiz ? null : biz)}
                              className="shrink-0 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 hover:bg-blue-100 transition-colors"
                              title={isActiveBiz ? "Renew this permit" : `Switch to ${biz.name} and renew`}
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {allRenewals.length > 5 && (
                    <p className="text-[10px] text-slate-400 text-center pt-0.5">
                      +{allRenewals.length - 5} more renewal{allRenewals.length - 5 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Recent Rule Changes */}
          {(() => {
            const visible = ruleAlerts.filter(a => !a.dismissed).slice(0, 3);
            if (visible.length === 0) return null;
            return (
              <div ref={alertsSectionRef} className="shrink-0 border-t border-slate-100 px-4 py-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Rule Changes
                  </p>
                  <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5 tabular-nums">
                    {visible.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {visible.map(alert => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 space-y-1.5"
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-amber-600 truncate">
                            {alert.businessName}
                          </p>
                          <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
                            {alert.title}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
                          title="Dismiss this alert"
                        >
                          <ChevronRight className="h-3 w-3 rotate-0" />
                          {/* reuse × via text */}
                          <span className="sr-only">Dismiss</span>
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Footer row */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="text-[10px] text-slate-400">
                          {new Date(alert.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </span>
                        {/* v61 — opens Review Impact modal instead of just scrolling */}
                        <button
                          onClick={() => setReviewImpactAlertId(alert.id)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg px-2 py-0.5 transition-colors"
                        >
                          <FileText className="h-2.5 w-2.5" />
                          Review Impact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Pro upsell banner — shown only for Free tier users */}
          {!isPro && (
            <div className="shrink-0 border-t border-slate-100 px-4 py-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                  <p className="text-[11px] font-bold text-slate-800">Upgrade to RegPulse Pro</p>
                  <span className="ml-auto text-[10px] font-bold text-blue-700">$19/mo</span>
                </div>
                <ul className="space-y-1">
                  {[
                    "Unlimited AI form completions & renewals",
                    "Automatic renewal filing (pre-filled)",
                    "Quarterly Compliance Check-in PDF",
                  ].map(benefit => (
                    <li key={benefit} className="flex items-start gap-1 text-[10px] text-slate-600">
                      <CheckCircle2 className="h-2.5 w-2.5 text-blue-500 shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-400">
                  {`${monthlyFormsUsed}/${FREE_MONTHLY_LIMIT} free completions used this month`}
                </p>
              </div>
            </div>
          )}

          {/* ── v20: Forms Library Section ────────────────────────────────────
               Collapsible sidebar section listing all forms from ALL_FORMS
               (federal + state/local entries with download links / official URLs).
               Collapsed by default; toggle via the FolderOpen header button.
               v22 — added "View full library →" link to /forms page. */}
          <div className="shrink-0 border-t border-slate-100">
            {/* Header row — always visible */}
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setFormsLibraryOpen(o => !o)}
                className="flex items-center gap-1.5 flex-1 hover:opacity-70 transition-opacity group"
              >
                <FolderOpen className="h-3 w-3 text-blue-500 shrink-0" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                  Forms Library
                </p>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ml-auto ${formsLibraryOpen ? "rotate-180" : ""}`} />
              </button>
              {/* v22 — link to the full /forms page */}
              <Link
                href="/forms"
                className="shrink-0 ml-2 text-[9px] font-semibold text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-0.5"
                title="Open full Forms Library"
              >
                View all
                <ChevronRight className="h-2.5 w-2.5" />
              </Link>
            </div>

            {/* v26 — Recommended Forms teaser (shown when a business is loaded) */}
            {loadedBusiness && (
              <div className="px-4 pb-2">
                <Link
                  href="/forms"
                  className="flex items-center gap-1.5 w-full text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2.5 py-1.5 transition-colors group"
                  title="View personalised form recommendations"
                >
                  <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-amber-700 group-hover:text-amber-900 transition-colors flex-1">
                    Recommended Forms
                  </span>
                  <ChevronRight className="h-2.5 w-2.5 text-amber-400" />
                </Link>
              </div>
            )}

            {/* Expandable body */}
            {formsLibraryOpen && (
              <div className="px-4 pb-3">
                <FormsLibrary compact />
              </div>
            )}
          </div>

          {/* My Businesses — Living Profile cards */}
          <div className="shrink-0 border-t border-slate-100 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                My Businesses
              </p>
              <button
                onClick={() => setShowAddBizModal(true)}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2 py-0.5 transition-colors"
                title="Add a business"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            {savedBusinesses.length === 0 ? (
              <div className="text-center py-3 space-y-2">
                <p className="text-[11px] text-slate-400 italic">
                  No businesses yet — add one to get started.
                </p>
                <button
                  onClick={() => setShowAddBizModal(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  + Add your first business
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {savedBusinesses.map(biz => {
                  const score        = biz.healthScore ?? 0;
                  const hasScore     = biz.totalForms != null && biz.totalForms > 0;
                  const dotColor     = !hasScore   ? "bg-slate-300" :
                                       score >= 80  ? "bg-green-500" :
                                       score >= 50  ? "bg-amber-400" : "bg-red-400";
                  const isLoaded     = loadedBusiness?.id === biz.id;
                  const hasAlert     = ruleAlerts.some(a => a.businessId === biz.id && !a.dismissed);
                  const isUrgent     = hasScore && score < 50;
                  const cardBg       =
                    isLoaded  ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200" :
                    isUrgent  ? "bg-red-50 border-red-200 hover:bg-red-100" :
                    hasAlert  ? "bg-amber-50 border-amber-200 hover:bg-amber-100" :
                                "bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-200";
                  const nameColor    =
                    isLoaded  ? "text-blue-700" :
                    isUrgent  ? "text-red-700"  :
                    hasAlert  ? "text-amber-800" : "text-slate-700";

                  const isConfirmingDelete = confirmDeleteBizId === biz.id;

                  return (
                    <div key={biz.id} className="relative group/card">
                      {isConfirmingDelete ? (
                        /* Delete confirmation inline bar */
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs">
                          <p className="text-red-700 font-medium mb-1.5 leading-snug">
                            Delete &ldquo;{biz.name}&rdquo; and all its data? This cannot be undone.
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                handleDeleteBusiness(biz);
                                setConfirmDeleteBizId(null);
                              }}
                              className="px-2 py-0.5 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteBizId(null)}
                              className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* v31 — clicking the card loads the business AND shows profile view */}
                          <button
                            onClick={() => {
                              handleLoadBusiness(biz);
                              setShowProfileView(true);
                            }}
                            className={`w-full text-left rounded-xl border px-2.5 py-2 transition-all group pr-14 ${cardBg}`}
                            title={`View profile for ${biz.name}`}
                          >
                            {/* Row 1: icon + name + Pro badge + chevron */}
                            <div className="flex items-center gap-2">
                              {/* Health dot */}
                              <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
                              <p className={`flex-1 text-xs font-semibold truncate transition-colors ${nameColor}`}>
                                {biz.name}
                              </p>
                              {isPro && (
                                <span className="shrink-0 inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">
                                  <Crown className="h-1.5 w-1.5" />
                                  Pro
                                </span>
                              )}
                              <ChevronRight className={`h-3 w-3 shrink-0 transition-colors ${
                                isLoaded ? "text-blue-400" : "text-slate-300 group-hover:text-blue-400"
                              }`} />
                            </div>

                            {/* Row 2: location + type badge */}
                            <div className="flex items-center gap-1.5 mt-0.5 pl-4">
                              <p className="text-[10px] text-slate-400 truncate flex-1">
                                {biz.location}
                              </p>
                              {biz.isPreExisting && (
                                <span className="shrink-0 text-[9px] text-slate-400 bg-slate-100 border border-slate-200 rounded px-1 py-0.5">
                                  existing
                                </span>
                              )}
                            </div>

                            {/* Row 3: meta chips */}
                            <div className="flex items-center gap-1.5 mt-1.5 pl-4 flex-wrap">
                              {hasScore && (
                                <span className={`text-[10px] font-semibold tabular-nums ${
                                  score >= 80 ? "text-green-700" : score >= 50 ? "text-amber-700" : "text-red-700"
                                }`}>
                                  {score}% health
                                </span>
                              )}
                              {biz.totalForms != null && biz.totalForms > 0 && (
                                <span className="text-[10px] text-slate-400">
                                  · {biz.completedFormsCount ?? 0}/{biz.totalForms} forms
                                </span>
                              )}
                              {hasAlert && (
                                <span className="text-[10px] font-semibold text-amber-600">· alert</span>
                              )}
                              {biz.lastChecked && (
                                <span className="text-[10px] text-slate-400 ml-auto">
                                  {relativeDate(biz.lastChecked)}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Bell icon — opens notification prefs */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setNotifPrefsBizId(biz.id);
                            }}
                            className={`absolute top-1.5 right-7 p-1 rounded-md transition-all opacity-0 group-hover/card:opacity-100 ${
                              biz.notificationPrefs?.emailEnabled || biz.notificationPrefs?.smsEnabled
                                ? "text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                                : biz.notificationPrefs && !biz.notificationPrefs.emailEnabled && !biz.notificationPrefs.smsEnabled
                                  ? "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
                                  : "text-slate-300 hover:text-blue-400 hover:bg-blue-50"
                            }`}
                            title="Notification preferences"
                          >
                            {biz.notificationPrefs && !biz.notificationPrefs.emailEnabled && !biz.notificationPrefs.smsEnabled
                              ? <BellOff className="h-3 w-3" />
                              : <Bell className="h-3 w-3" />
                            }
                          </button>

                          {/* Trash icon — visible on hover */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setConfirmDeleteBizId(biz.id);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all"
                            title={`Delete ${biz.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}

                      {/* ── Locations sub-list ────────────────────────────── */}
                      {(() => {
                        const locs = biz.locations;
                        if (!locs?.length) {
                          // No locations yet — show "Add Location" link below card on hover
                          return (
                            <div className="pl-2 pr-1 pb-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (isLoaded) {
                                    setAddLocationBizId("__active__");
                                  } else {
                                    setAddLocationBizId(biz.id);
                                  }
                                }}
                                className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 hover:underline transition-colors py-0.5"
                              >
                                <Plus className="h-2.5 w-2.5" />
                                Add location
                              </button>
                            </div>
                          );
                        }

                        const isExpanded = expandedBizIds.has(biz.id);
                        return (
                          <div className="pl-2 pr-1 pb-1 mt-0.5 space-y-0.5">
                            {/* Toggle row */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setExpandedBizIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(biz.id)) next.delete(biz.id); else next.add(biz.id);
                                  return next;
                                });
                              }}
                              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors w-full py-0.5"
                            >
                              {isExpanded
                                ? <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                                : <ChevronRight className="h-2.5 w-2.5 shrink-0" />}
                              <span>{locs.length} location{locs.length !== 1 ? "s" : ""}</span>
                            </button>

                            {isExpanded && (
                              <div className="space-y-0.5 pl-1">
                                {locs.map(loc => {
                                  const isActiveLoc = isLoaded && activeLocationId === loc.id;
                                  const locScore = loc.healthScore ?? 0;
                                  const locHasScore = loc.totalForms != null && loc.totalForms > 0;
                                  const locDot = !locHasScore ? "bg-slate-300" :
                                                  locScore >= 80 ? "bg-green-500" :
                                                  locScore >= 50 ? "bg-amber-400" : "bg-red-400";
                                  return (
                                    <button
                                      key={loc.id}
                                      onClick={e => {
                                        e.stopPropagation();
                                        if (isLoaded) {
                                          handleSwitchLocation(loc);
                                        } else {
                                          handleLoadBusiness(biz, loc.id);
                                        }
                                      }}
                                      className={`w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                                        isActiveLoc
                                          ? "bg-blue-50 border-blue-200 text-blue-700"
                                          : "bg-white border-slate-100 text-slate-600 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700"
                                      }`}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${locDot}`} />
                                      <span className="text-[10px] font-semibold truncate flex-1">{loc.name}</span>
                                      <span className="text-[9px] text-slate-400 truncate max-w-[60px]">{loc.location}</span>
                                      {isActiveLoc && <span className="h-1 w-1 rounded-full bg-blue-500 shrink-0" />}
                                    </button>
                                  );
                                })}
                                {/* Add location button */}
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (isLoaded) {
                                      setAddLocationBizId("__active__");
                                    } else {
                                      setAddLocationBizId(biz.id);
                                    }
                                  }}
                                  className="w-full flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors px-2 py-1 rounded-lg"
                                >
                                  <Plus className="h-2.5 w-2.5" />
                                  Add location
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Notification Prefs Modal ────────────────────────────────────── */}
      {notifPrefsBizId && (() => {
        const targetBiz = savedBusinesses.find(b => b.id === notifPrefsBizId);
        if (!targetBiz) return null;
        return (
          <NotificationPrefsModal
            businessName={targetBiz.name}
            currentPrefs={targetBiz.notificationPrefs}
            userEmail={user?.email ?? undefined}
            onSave={prefs => handleSaveNotificationPrefs(notifPrefsBizId, prefs)}
            onClose={() => setNotifPrefsBizId(null)}
          />
        );
      })()}

      {/* ── Add Location Modal ──────────────────────────────────────────── */}
      {addLocationBizId && (() => {
        const isActive = addLocationBizId === "__active__";
        const targetBiz = isActive
          ? loadedBusiness
          : savedBusinesses.find(b => b.id === addLocationBizId);
        if (!targetBiz) return null;
        return (
          <AddLocationModal
            businessName={targetBiz.name}
            onAdd={newLoc => {
              if (isActive) {
                handleAddLocation(newLoc);
              } else {
                handleAddLocationToOtherBiz(targetBiz, newLoc);
              }
              setAddLocationBizId(null);
            }}
            onClose={() => setAddLocationBizId(null)}
          />
        );
      })()}

      {/* ── Add Business Modal ──────────────────────────────────────────── */}
      {showAddBizModal && (
        <AddBusinessModal
          onAdd={handleAddPreExistingBusiness}
          onClose={() => setShowAddBizModal(false)}
          onStartChat={() => {
            setShowAddBizModal(false);
            // Focus the chat input so the user can start immediately
            setTimeout(() => {
              (document.querySelector("input[placeholder*='business']") as HTMLInputElement | null)?.focus();
            }, 100);
          }}
        />
      )}

      {/* ════════════ Chat area ════════════ */}
      {/* v31 — When showProfileView is true and a business is loaded, render the
           full Business Profile View instead of the chat pane. The "Back to Chat"
           button in BusinessProfileView calls setShowProfileView(false). */}
      {/* v33 — props updated: recommendedForms + completedDocuments + split edit callbacks */}
      {/* v39 — onUploadCompletedDoc replaced by onSaveDrafts + onDiscardDrafts */}
      {/* v40 — onViewCompletedForm routes synthetic doc clicks to PacketScreen */}
      {/* v41 — live health score ring; auto-open after doc create; FormFiller auto-attach */}
      {/* v42 — final document visibility on matching form card with green checkmark + clickable filename */}
      {/* v43 — uploaded documents visible on matching form card with green checkmark + clickable filename + compliance stats */}
      {/* v44 — uploaded documents now visibly appear on the matching recommended form card with filename + green checkmark */}
      {/* v45 — Zoning & Address Compliance Checker + fixed document attachment on profile creation */}
      {/* v50 — Fixed "Attach Zoning Result to Profile" button so result is saved and immediately visible on the business profile */}
      {/* vMobile-scale-fix: flex-1 flex flex-col overflow-hidden ensures the profile view
          fills exactly the remaining viewport height on all screen sizes. On mobile the
          BusinessProfileView's own overflow-y-auto body handles scrolling internally —
          the outer container must NOT overflow so the sticky header/footer stay pinned. */}
      {showProfileView && loadedBusiness ? (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <BusinessProfileView
            business={loadedBusiness}
            recommendedForms={profileRecommendedForms}
            completedDocuments={uploadedDocs.filter(d => d.businessId === loadedBusiness.id)}
            checklist={checklist}
            onBackToChat={() => setShowProfileView(false)}
            onViewDocument={handleViewDocument}
            onUpdateBusinessName={handleUpdateBusinessNameFromProfile}
            onLocationChange={handleLocationChangeFromProfile}
            onSaveDrafts={handleSaveDraftsFromProfile}
            onDiscardDrafts={handleDiscardDraftsFromProfile}
            onViewCompletedForm={handleViewCompletedForm}
            onCheckZoning={handleCheckZoning}
            onAttachZoningResult={handleAttachZoningResult}
            onStartForm={handleStartFormFromProfile}
          />
        </div>
      ) : null}
      <div className={`flex-1 flex flex-col overflow-hidden relative ${showProfileView && loadedBusiness ? "hidden" : ""}`}>

        {/* Header bar — vMobile: hamburger on left for mobile sidebar */}
        <div className="border-b border-slate-200 bg-white px-3 sm:px-6 py-3.5 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* vMobile — hamburger button, hidden on md+ where sidebar is always visible */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden shrink-0 text-slate-500 hover:text-slate-700 transition-colors p-1"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <RegPulseIcon size={26} className="shrink-0" />
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 text-sm leading-tight">Chat with RegPulse</h2>
              {loadedBusiness ? (
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  <p className="text-xs text-blue-600 font-medium leading-tight truncate max-w-[120px] sm:max-w-[160px]">
                    {loadedBusiness.name}
                  </p>
                  {activeLocation ? (
                    <>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="hidden sm:inline text-xs text-slate-500 font-medium truncate max-w-[120px]">
                        {activeLocation.name}
                      </span>
                    </>
                  ) : (
                    <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-[100px]">· {loadedBusiness.location}</span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5 leading-tight">Hyper-local compliance guidance</p>
              )}
            </div>
          </div>
          {locationIsReady && (
            <span className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-1 rounded-full ring-1 transition-colors ${
              zipResolved
                ? "bg-green-50 text-green-700 ring-green-200"
                : "bg-blue-50 text-blue-700 ring-blue-100"
            }`}>
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline truncate max-w-[140px]">{userLocation}</span>
              <span className="sm:hidden truncate max-w-[80px]">{userLocation.split(",")[0]}</span>
            </span>
          )}
        </div>

        {/* Messages list — vMobile: tighter padding on small screens */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "user" ? (
                <div className="max-w-sm bg-blue-600 text-white rounded-3xl rounded-br-sm px-4 py-3 shadow-sm">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="max-w-2xl w-full bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm px-5 py-4">
                  {(() => {
                    const serverFormMap = msg.formMap
                      ? filterFormsByLocation(msg.formMap, userLocation)
                      : null;

                    const contentMarkerIds: string[] = [];
                    const scanRe = /%%([a-zA-Z][a-zA-Z0-9-]*)%%/gi;
                    let hit: RegExpExecArray | null;
                    while ((hit = scanRe.exec(msg.content)) !== null) {
                      const id = hit[1].toLowerCase();
                      if (KNOWN_FORM_IDS.has(id) && !contentMarkerIds.includes(id)) {
                        contentMarkerIds.push(id);
                      }
                    }

                    const localFormMap =
                      serverFormMap ??
                      (contentMarkerIds.length
                        ? filterFormsByLocation(contentMarkerIds, userLocation)
                        : null);

                    const state = parseState(userLocation);

                    return (
                      <div className="text-sm text-slate-800 leading-relaxed">
                        {msg.content.split("\n").map((line, i) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;

                          if (!trimmed.startsWith("- ")) {
                            const isDisclaimer =
                              trimmed.startsWith("This is for informational purposes") ||
                              trimmed.startsWith("This information is for general guidance");
                            return (
                              // v25 — Fix Learn More links: apply BulletLine to paragraph
                              // lines so [text](url) markdown renders as a real <a> tag.
                              <p
                                key={i}
                                className={
                                  isDisclaimer
                                    ? "mt-3 text-[11px] text-slate-400 italic leading-relaxed"
                                    : "mb-2 text-slate-700"
                                }
                              >
                                <BulletLine text={trimmed} />
                              </p>
                            );
                          }

                          const rawText = trimmed.slice(2);
                          const { formId: markerFormId, displayText } = extractMarkerFromLine(rawText);

                          const formId = (() => {
                            if (markerFormId && KNOWN_FORM_IDS.has(markerFormId)) return markerFormId;
                            return localFormMap?.find((id) =>
                              stripLinks(displayText).toLowerCase().includes(id.replace(/-/g, " "))
                            );
                          })();

                          const filteredFormId =
                            formId && state && FORM_EXCLUSIONS[formId]?.has(state)
                              ? undefined
                              : formId;

                          return (
                            <div
                              key={i}
                              className="flex gap-2.5 items-start py-2 border-b border-slate-50 last:border-none"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                              <span className="text-slate-700 leading-relaxed">
                                <BulletLine text={displayText} />
                              </span>
                            </div>
                          );
                        })}

                        {/* Complete All button — shown whenever ≥1 form is identified.
                            Individual form actions are in the sidebar checklist. */}
                        {localFormMap && localFormMap.length >= 1 && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => handleStartAllForms(localFormMap)}
                              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
                            >
                              <Layers className="h-3.5 w-3.5 shrink-0" />
                              {localFormMap.length === 1
                                ? "Complete Required Form with AI"
                                : "Complete All Required Forms with AI"}
                              <span className="bg-blue-500 text-[10px] font-bold rounded-md px-1.5 py-0.5">
                                {localFormMap.length} {localFormMap.length === 1 ? "form" : "forms"}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Clarify question chips */}
                        {msg.formClarify && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-xs font-medium text-slate-600 mb-2">
                              {msg.formClarify.question}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.formClarify.options.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => sendQuickReply(opt)}
                                  className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* "Save to Checklist" removed — items are auto-saved via
                            extractAndAddToChecklist when the AI response arrives. */}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm px-5 py-3.5 flex items-center gap-2.5 text-slate-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />
                <span>Searching regulations for {userLocation}…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Auto-save toast */}
        {autoSaveToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
            <span>
              Added {autoSaveToast.count} step{autoSaveToast.count !== 1 ? "s" : ""} to your checklist
            </span>
            <button
              onClick={() => handleUndoAutoSave(autoSaveToast.itemIds)}
              className="text-blue-300 hover:text-blue-100 font-semibold transition-colors ml-1 underline underline-offset-2"
            >
              Undo
            </button>
          </div>
        )}

        {/* Bottom overlay: PacketScreen > FormFiller > input bar */}
        {showPacketScreen ? (
          <PacketScreen
            forms={completedFormsData}
            location={userLocation}
            checklist={checklist}
            isPro={isPro}
            onDismiss={() => {
              setShowPacketScreen(false);
              setCompletedFormsData([]);
            }}
            onSave={handleSaveBusiness}
          />
        ) : activeTemplate ? (
          <FormFiller
            template={activeTemplate}
            location={userLocation}
            onComplete={handleFormComplete}
            onDismiss={handleDismissForm}
            queueLabel={queueLabel}
            skipPayment={true}
            initialFormData={activeFormInitialData}
            isRenewal={activeFormIsRenewal}
            businessProfile={loadedBusiness ? (() => {
              // v62 — enrich profile hint with owner name + EIN extracted from
              // any previously completed form data (EIN app, business registration, etc.)
              const einEntry = completedFormsByFormId['ein-application'];
              const regEntry = completedFormsByFormId['business-registration'];
              const anyEntry = einEntry ?? regEntry ?? Object.values(completedFormsByFormId)[0];
              const derivedOwner = anyEntry?.formData?.ownerFullName
                ?? anyEntry?.formData?.responsiblePartyName
                ?? anyEntry?.formData?.legalName;
              const derivedEin = anyEntry?.formData?.fein
                ?? completedFormsByFormId['sales-tax-registration']?.formData?.fein;
              const derivedPhone = anyEntry?.formData?.businessPhone ?? anyEntry?.formData?.ownerPhone;
              const derivedEmail = anyEntry?.formData?.businessEmail ?? anyEntry?.formData?.ownerEmail;
              return {
                name:         loadedBusiness.name,
                location:     loadedBusiness.location,
                businessType: loadedBusiness.businessType,
                ownerName:    derivedOwner,
                ein:          derivedEin,
                phone:        derivedPhone,
                email:        derivedEmail,
              };
            })() : null}
            onSaveDocument={(filename, _base64) => {
              // v60 — update the synthetic document record with the real filename so the
              // matching form card in BusinessProfileView shows the actual file name
              // with a green "Completed" badge instead of the generic placeholder.
              if (!activeTemplate) return;
              setUploadedDocs(prev => prev.map(d =>
                d.formId === activeTemplate.id && d.id.startsWith("form-complete-")
                  ? { ...d, originalName: filename }
                  : d
              ));
            }}
            onFormCompleteWithoutProfile={handleFormCompleteWithoutProfile}
            zoningProfile={(() => {
              // v63 — extract the most recent zoning check result attached to this business
              // and pass it to FormFiller so zone-aware fields can be pre-seeded.
              // v70 — fixed: check both raw?.zone_type (underscore, from API) and raw?.zoneType (camelCase)
              const zoningDoc = uploadedDocs.find(
                d => d.formId === "zoning-check" && d.mimeType === "application/json"
              );
              if (!zoningDoc?.analysis) return null;
              const raw = zoningDoc.analysis.rawExtracted as Record<string, unknown> | undefined;
              return {
                status:       (raw?.status ?? undefined) as string | undefined,
                // v70 — check underscore variant first (API returns zone_type), then camelCase
                zoneType:     (
                  (raw?.zone_type as string | undefined) ??
                  (raw?.zoneType as string | undefined) ??
                  (zoningDoc.analysis.issuingAuthority as string | undefined) ??
                  zoningDoc.analysis.docType
                ) ?? undefined,
                restrictions: Array.isArray(raw?.restrictions)
                  ? (raw.restrictions as string[])
                  : (Array.isArray(zoningDoc.analysis.suggestions) ? zoningDoc.analysis.suggestions as string[] : undefined),
                address:      (
                  (raw?.address as string | undefined) ??
                  loadedBusiness?.location
                ) ?? undefined,
              };
            })()}
          />
        ) : (
          <div className="relative z-10 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-white shrink-0">{/* vMobile: tighter padding on phones; z-10 ensures input bar is above any positioned ancestors (vMobile-icon-fix) */}
            <div className="max-w-3xl mx-auto flex gap-2 items-center">
              {/* Upload button — compact, sits left of the text input.
                  v17: businessId is required for the storage-first path in
                  DocumentUploadButton (files > 5 MB bypass the API body limit
                  by uploading directly to Supabase Storage). Without it the
                  gate falls back to FormData and large PDFs hit Vercel's limit.
                  Use the business's saved location as AI context so the backend
                  prompt matches the registered jurisdiction. */}
              <DocumentUploadButton
                variant="compact"
                businessId={loadedBusiness?.id}
                businessName={loadedBusiness?.name ?? "My Business"}
                location={loadedBusiness?.location ?? userLocation}
                checklist={checklist}
                onAnalysisComplete={handleDocumentAnalysisComplete}
                disabled={isLoading}
              />
              <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask about permits, zoning, health codes…"
                  className="flex-1 bg-transparent text-sm py-2.5 outline-none text-slate-800 placeholder:text-slate-400"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Document Analysis Card overlay ────────────────────────────────
             Shown after a successful upload + AI analysis.
             Floats above the chat messages; user can dismiss or apply updates. */}
        {docAnalysisResult && (
          <div className="absolute inset-x-0 bottom-20 z-30 px-6 pb-2 max-w-3xl mx-auto left-1/2 -translate-x-1/2 w-full pointer-events-none">
            <div className="pointer-events-auto">
              {/* v31 — Fix Yes Create It Button (Direct Trigger)
                   onCreateProfileFromDocument now calls createBusinessFromDocument
                   directly — no chat reply parsing, no refs, no pending state.
                   The button in the card is the primary trigger; typing "yes" in
                   the chat remains as a fallback via sendMessage's ref check. */}
              <DocumentAnalysisCard
                fileName={docAnalysisResult.fileName}
                analysis={docAnalysisResult.analysis}
                checklist={checklist}
                onApplyUpdates={(matched: MatchedItem[]) => {
                  handleApplyDocumentUpdates(matched);
                }}
                onDismiss={() => setDocAnalysisResult(null)}
                hasActiveBusinessProfile={!!loadedBusiness}
                onCreateProfileFromDocument={() => {
                  // Direct trigger — create the profile immediately without
                  // waiting for a "yes" reply in the chat input.
                  if (docAnalysisResult) createBusinessFromDocument(docAnalysisResult);
                }}
              />
            </div>
          </div>
        )}

        {/* ── v25 — Attach panel: upload completed document without AI analysis ──
             Triggered by "Attach File" in the Completed Documents section.
             Uses mode="attach" so no /api/document/analyze call is made. */}
        {showAttachPanel && (
          <div
            className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowAttachPanel(false); }}
          >
            <div className="bg-white rounded-t-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Upload Completed Document</h3>
                </div>
                <button
                  onClick={() => setShowAttachPanel(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              {loadedBusiness && (
                <p className="text-xs text-slate-500">
                  Attaching to <strong className="text-slate-700">{loadedBusiness.name}</strong>
                  {" — "}no AI analysis will be run.
                </p>
              )}
              <DocumentUploadButton
                variant="full"
                mode="attach"
                businessId={loadedBusiness?.id}
                businessName={loadedBusiness?.name ?? "My Business"}
                location={loadedBusiness?.location ?? userLocation}
                checklist={checklist}
                onAnalysisComplete={() => {/* not used in attach mode */}}
                onAttachComplete={result => {
                  setShowAttachPanel(false);
                  handleAttachDocument(result);
                }}
              />
            </div>
          </div>
        )}

        {/* ── Full upload panel (from checklist sidebar button) ─────────────
             Slide-in bottom sheet with the full DocumentUploadButton drop zone. */}
        {showDocUploadPanel && (
          <div
            className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowDocUploadPanel(false); }}
          >
            <div className="bg-white rounded-t-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Upload Existing Document</h3>
                </div>
                <button
                  onClick={() => setShowDocUploadPanel(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              {loadedBusiness && (
                <p className="text-xs text-slate-500">
                  Analyzing for <strong className="text-slate-700">{loadedBusiness.name}</strong>
                </p>
              )}
              {/* v17: same as compact — businessId enables storage-first for large files */}
              <DocumentUploadButton
                variant="full"
                businessId={loadedBusiness?.id}
                businessName={loadedBusiness?.name ?? "My Business"}
                location={loadedBusiness?.location ?? userLocation}
                checklist={checklist}
                onAnalysisComplete={result => {
                  setShowDocUploadPanel(false);
                  handleDocumentAnalysisComplete(result);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
