// v56 — Massive county/city/town level expansion (50+ new entries)
// - Added FL metros: Hillsborough, Pinellas, Orange, Duval/Jacksonville, Sarasota, Collier,
//   Volusia, Seminole, Polk, city of Tampa, city of Orlando, city of Miami
// - Added TX metros: Dallas, Austin, San Antonio, Fort Worth, El Paso, Lubbock, Corpus Christi
// - Added CA counties: San Diego, Orange County CA, Santa Clara, Alameda, Sacramento, Riverside, San Bernardino
// - Added NY: Nassau, Suffolk, Westchester, Erie/Buffalo
// - Added IL: DuPage County
// - Added GA: DeKalb, Gwinnett, Cobb
// - Added other metros: Portland OR, Raleigh NC, Minneapolis MN, Pittsburgh PA,
//   Salt Lake City UT, New Orleans LA, Albuquerque NM, Baltimore MD, Richmond VA, Memphis TN
// - Expanded COUNTY/CITY LINK RULES in chat route with all new domains
// v55 — County/city/town level link accuracy overhaul
// - Replaced stale LOCAL_FORMS officialUrl values with confirmed working government portals.
// - All .asp/.aspx Sharepoint-style URLs and CMS-numbered paths replaced with root domains.
// - Fixed: palm-beach-*, miami-dade-*, broward-btrc, harris-county-food, cook-county-food,
//   king-county-food (had "legacy" in path), maricopa-food (numeric ID /630/),
//   clark-county-btrc, denver-btrc, charlotte-btrl, atlanta-btrc, fulton-county-food,
//   chicago-food, la-city-home-occupation.
// - Added Bridgeport CT and Fairfield County CT LOCAL_FORMS entries.
// - All FL county countyUrls are root-domain only (confirmed safe).
// v54 — Hyper-local link overhaul (all 404s fixed)
// - Fixed STATE_FORMS officialUrl values: removed stale "apply-for-licenses-permits" (with "for")
//   and replaced with confirmed working "apply-licenses-permits" path used in FORM_TEMPLATES.
// - Updated STATE_FORMS annual-report officialUrl to current SBA manage path.
// - Updated STATE_FORMS fictitious-name, business-tax-receipt, home-occupation-permit,
//   seller-permit to use SBA register-your-business or apply-licenses-permits (no "for").
// Changes summary:
// - Added officialFormNumber? and officialFormPdfUrl? to LocaleOverride so each state
//   override can advertise its own form number and blank PDF download link.
// - Updated getLocaleFormTemplate() to merge locale.officialFormNumber and
//   locale.officialFormPdfUrl when present.
// - getLocaleFormTemplate() fix: always sets submitPortalUrl from locale override
//   (ov.submitPortalUrl ?? ov.submitUrl), preventing base SBA URL from leaking through.
// - Added STATE_ABBREV_MAP and enhanced parseStateFromLocation() to handle full state
//   names (e.g. "Miami, Florida 33101" → "FL") for robust GPS/Nominatim location parsing.
// - Added new 'business-registration' template (LLC/Corp entity formation) with
//   locale overrides for all 50 states + DC covering Secretary of State portals.
// - Added submitPortalUrl to business-registration localeUrls for TX and NY (specific
//   filing portals, not just root SOS domains).
// - Expanded 'fictitious-name' localeUrls to all 50 states + DC.
// - Added submitPortalUrl to fictitious-name GA and IL (confirmed specific paths).
// - Expanded 'sales-tax-registration' localeUrls to all 45 taxing states + DC.
// - Added submitPortalUrl to sales-tax-registration TX, CA, NY, IL, WA (confirmed paths).
// - Expanded 'food-service-permit' localeUrls to all 50 states + DC.
// - Added submitPortalUrl to food-service-permit TX (confirmed DSHS path).
// - Expanded 'mobile-food-vendor' localeUrls to all 50 states + DC.
// - Added submitPortalUrl to mobile-food-vendor TX (confirmed DSHS path).
// - Added localeUrls to 'business-license' for states with genuine state-level portals:
//   WA (unified Business Licensing Service at DOR), DC, CO, WY, HI — so the "Official Site"
//   button is active rather than disabled for those states.
// - Added countyUrls field to FormTemplate interface (keyed by exact county name string).
//   getLocaleFormTemplate() now accepts an optional county parameter and tries countyUrls
//   before localeUrls, giving the most specific possible portal URL.
// - Added countyUrls to 'business-license' for major FL counties (where the Business Tax
//   Receipt is county-issued by the Tax Collector), NYC boroughs, and Cook County IL.
// - Added countyUrls to 'home-occupation-permit' for major FL counties (county
//   planning/zoning dept) and NYC boroughs.
// - Added localeUrls to 'home-occupation-permit' for WA (unified licensing at DOR).
// - Trimmed location string in parseStateFromLocation() to prevent GPS trailing-space bugs.
// - All existing field annotations (SS-4 lines, DR-1 sections, AP-201 items, etc.) preserved.

export type FieldType = 'text' | 'email' | 'phone' | 'date' | 'select' | 'address' | 'checkbox';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  hint?: string;
  required: boolean;
  /**
   * The exact field label, line number, or item identifier as printed on the
   * official government form. FormFiller shows this as a small reference hint.
   */
  officialFieldName?: string;
}

/** Locale-specific override applied when the user's state matches. */
export interface LocaleOverride {
  submitUrl: string;
  submitPortalUrl?: string;
  /** When present, overrides the base template's officialFormNumber for this state. */
  officialFormNumber?: string;
  /** When present, overrides the base template's officialFormPdfUrl for this state. */
  officialFormPdfUrl?: string;
  /** When present, replaces submitInstructions for this state. */
  submitInstructions?: string;
  /**
   * When present, replaces the entire fields array for this state.
   * Use only when the state form has meaningfully different fields or
   * when you can annotate with officialFieldName values.
   */
  fields?: FormField[];
}

export interface FormTemplate {
  id: string;
  name: string;
  officialFormNumber?: string;
  officialFormPdfUrl?: string;
  description: string;
  fee: string;
  fields: FormField[];
  submitUrl: string;
  submitPortalUrl?: string;
  submitInstructions: string;
  requiredDocs: string[];
  /** Locale overrides keyed by 2-letter state code (or 'DC'). */
  localeUrls?: Partial<Record<string, LocaleOverride>>;
  /**
   * County-level overrides keyed by the exact county name string
   * (e.g. "Palm Beach County", "Harris County", "New York County").
   * Checked BEFORE localeUrls, giving the most specific possible portal URL.
   * Used for forms where the issuing authority is the county, not the state.
   */
  countyUrls?: Partial<Record<string, LocaleOverride>>;
  /**
   * Default renewal interval in months from the completion date.
   * - Positive number → renew N months after filing (e.g. 12 = annually)
   * - null → this filing does not expire (e.g. EIN, LLC registration)
   * - undefined → renewal interval unknown
   */
  defaultRenewalMonths?: number | null;
}

/**
 * A lightweight reference entry for federal forms that are downloaded or filed
 * directly with a federal agency rather than going through the RegBot FormFiller.
 *
 * Unlike FormTemplate (which drives the in-app guided wizard), FederalFormEntry
 * is used to surface download links, official URLs, and metadata in the checklist
 * and compliance library UI.
 */
export interface FederalFormEntry {
  /** Matches the formId used in the checklist system (e.g. "ein-application"). */
  id: string;
  /** User-friendly display name. */
  name: string;
  /** Always 'federal' for this library. */
  category: 'federal';
  /** One- to two-sentence description of what this form is and why it's required. */
  description: string;
  /** Canonical URL on the issuing agency's website (IRS, USCIS, FinCEN, etc.). */
  officialUrl: string;
  /**
   * Path to the locally cached blank PDF inside /public.
   * Served as a static asset at this URL. Empty string when the form is online-only.
   */
  pdfPath: string;
  /**
   * true  → a blank PDF is available for download (ss-4.pdf, i-9.pdf, etc.)
   * false → the form must be filed online (e.g. FinCEN BOI eFiling portal)
   */
  isDownloadable: boolean;
  /**
   * Renewal interval in months, or null when the filing is permanent / one-time.
   * Mirrors the semantics of FormTemplate.defaultRenewalMonths.
   */
  renewalMonths: number | null;
  /**
   * Business types this form is relevant for.
   * Use ['all'] when required by every business regardless of type.
   */
  commonFor: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared base fields reused across templates
// ─────────────────────────────────────────────────────────────────────────────

const BASE_OWNER_FIELDS: FormField[] = [
  { id: 'ownerFullName',  label: 'Owner / Applicant Full Name', type: 'text',  placeholder: 'First and last name',     required: true  },
  { id: 'businessPhone',  label: 'Business Phone Number',        type: 'phone', placeholder: '(555) 555-0100',          required: true  },
  { id: 'businessEmail',  label: 'Business Email Address',       type: 'email', placeholder: 'you@yourbusiness.com',    required: true  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FORM TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export const FORM_TEMPLATES: Record<string, FormTemplate> = {

  // ── Business Registration (LLC / Corp entity formation) ───────────────────

  'business-registration': {
    id: 'business-registration',
    defaultRenewalMonths: null, // LLC/Corp formation is a one-time filing; no expiration
    name: 'Business Entity Registration (LLC / Corporation)',
    description:
      'Required to legally form a Limited Liability Company (LLC) or Corporation with your state. ' +
      'LLCs file Articles of Organization; Corporations file Articles of Incorporation. ' +
      'Filed with your state Secretary of State (or equivalent agency). Required before opening ' +
      'a bank account, obtaining most licenses, or signing contracts in the entity\'s name.',
    fee: '$50–$500 (varies by state and entity type)',
    submitUrl: 'https://www.sba.gov/business-guide/launch-your-business/register-your-business',
    submitInstructions:
      'File online with your state Secretary of State or equivalent agency. ' +
      'Provide the entity name, registered agent, principal address, and organizer information. ' +
      'Most states offer online filing with same-day or next-business-day processing. ' +
      'You will also need to appoint a registered agent with a physical address in the state.',
    requiredDocs: [
      'Proposed entity name (verify availability at your state SOS name search)',
      'Registered agent name and physical in-state address',
      'Principal office address',
      'Names and addresses of all members/organizers (LLC) or incorporators (Corp)',
      'Government-issued photo ID',
      'Payment for state filing fee',
    ],
    fields: [
      { id: 'entityName',        label: 'Proposed Business Entity Name',        type: 'text',   placeholder: 'e.g., Sunrise Eats LLC',             required: true  },
      { id: 'entityType',        label: 'Entity Type',                           type: 'select', options: ['LLC (Limited Liability Company)', 'S-Corporation', 'C-Corporation', 'General Partnership', 'Non-Profit Corporation'], required: true },
      { id: 'ownerFullName',     label: 'Organizer / Incorporator Full Name',    type: 'text',   placeholder: 'Full legal name of person filing',   required: true  },
      { id: 'businessEmail',     label: 'Contact Email',                         type: 'email',  placeholder: 'you@email.com',                      required: true  },
      { id: 'businessPhone',     label: 'Contact Phone',                         type: 'phone',  placeholder: '(555) 555-0100',                     required: true  },
      { id: 'principalAddress',  label: 'Principal Office Address',              type: 'address',placeholder: '123 Main St, City, State ZIP',       required: true  },
      { id: 'registeredAgent',   label: 'Registered Agent Full Name',            type: 'text',   placeholder: 'Name of registered agent',           required: true  },
      { id: 'registeredAgentAddress', label: 'Registered Agent Address (in-state)', type: 'address', placeholder: 'Physical street address in the state', required: true },
      { id: 'managementType',    label: 'Management Structure (LLC only)',        type: 'select', options: ['Member-Managed', 'Manager-Managed', 'N/A — Filing as Corporation'], required: true },
      { id: 'businessPurpose',   label: 'Business Purpose / Activity',           type: 'text',   placeholder: 'e.g., Food service, retail, consulting', required: true },
      { id: 'formationDate',     label: 'Desired Effective Date of Formation',   type: 'date',   required: false },
    ],
    localeUrls: {
      AL: { submitUrl: 'https://sos.alabama.gov/business-entities', officialFormNumber: 'Certificate of Formation', submitInstructions: 'File online through the Alabama Secretary of State Business Services portal at sos.alabama.gov. Fee: $200 for LLCs, $200 for Corporations. Processing takes 1–3 business days.' },
      AK: { submitUrl: 'https://corporations.alaska.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Alaska Division of Corporations at corporations.alaska.gov. Fee: $250 for LLCs, $250 for Corporations. Processing typically takes 10–15 business days.' },
      AZ: { submitUrl: 'https://azsos.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Arizona Secretary of State (eLicense) at azsos.gov. LLCs: $50 online. Corporations: $60 online. LLCs must also publish in a county newspaper for 3 consecutive weeks (Maricopa and Pima counties exempt).' },
      AR: { submitUrl: 'https://www.sos.arkansas.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Arkansas Secretary of State at sos.arkansas.gov. Fee: $45 for LLCs, $50 for Corporations. Processing is typically 1–2 business days online.' },
      CA: { submitUrl: 'https://bizfileonline.sos.ca.gov', officialFormNumber: 'Form LLC-1 (Articles of Organization) / Form ARTS-GS (Articles of Incorporation)', submitInstructions: 'File online through the California Secretary of State BizFile portal at bizfileonline.sos.ca.gov. LLC fee: $70. Corporation fee: $100. Most filings processed within 3–5 business days. Note: California LLCs also pay an $800 annual minimum franchise tax to the FTB.' },
      CO: { submitUrl: 'https://mybiz.sos.state.co.us', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Colorado Secretary of State at mybiz.sos.state.co.us. Fee: $50 for LLCs and Corporations. Processing is same-day for online filings.' },
      CT: { submitUrl: 'https://business.ct.gov', officialFormNumber: 'Certificate of Organization (LLC) / Certificate of Incorporation (Corp)', submitInstructions: 'File online through the Connecticut Business One Stop portal at business.ct.gov. LLC fee: $120. Corporation fee: $250. Processing typically takes 1–3 business days.' },
      DE: { submitUrl: 'https://corp.delaware.gov', officialFormNumber: 'Certificate of Formation (LLC) / Certificate of Incorporation (Corp)', submitInstructions: 'File with the Delaware Division of Corporations at corp.delaware.gov. LLC fee: $90. Corporation fee starts at $89 (based on shares). Delaware is a popular choice for corporations due to its business-friendly laws.' },
      DC: { submitUrl: 'https://dcbiz.dc.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the DC Department of Licensing and Consumer Protection at dcbiz.dc.gov. Fee: $220 for LLCs, $220 for Corporations. Processing takes 3–5 business days.' },
      FL: { submitUrl: 'https://sunbiz.org', submitPortalUrl: 'https://dos.sunbiz.org/scripts/listinit.exe', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online at sunbiz.org through the Florida Division of Corporations. LLC fee: $125 + $25 registered agent designation = $150. Corporation fee: $70. Processing is typically same-day or next business day online.' },
      GA: { submitUrl: 'https://sos.ga.gov/corporations', submitPortalUrl: 'https://sos.ga.gov/corporations-division', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Georgia Secretary of State Corporations Division at sos.ga.gov. LLC fee: $100. Corporation fee: $100. Online processing is same-day.' },
      HI: { submitUrl: 'https://cca.hawaii.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Hawaii Department of Commerce and Consumer Affairs (DCCA) at cca.hawaii.gov. LLC fee: $50. Corporation fee: $50. Processing takes 3–5 business days.' },
      ID: { submitUrl: 'https://sos.idaho.gov', officialFormNumber: 'Certificate of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Idaho Secretary of State at sos.idaho.gov. LLC fee: $100. Corporation fee: $100. Online processing is same-day.' },
      IL: { submitUrl: 'https://www.ilsos.gov', submitPortalUrl: 'https://www.ilsos.gov/corporatellc/', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Illinois Secretary of State at ilsos.gov. LLC fee: $150. Corporation fee: $150. Processing takes 5–7 business days online.' },
      IN: { submitUrl: 'https://inbiz.in.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Indiana INBiz portal at inbiz.in.gov. LLC fee: $95. Corporation fee: $95. Online processing is same-day.' },
      IA: { submitUrl: 'https://sos.iowa.gov', officialFormNumber: 'Certificate of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Iowa Secretary of State at sos.iowa.gov. LLC fee: $50. Corporation fee: $50. Processing takes 1–3 business days.' },
      KS: { submitUrl: 'https://www.sos.ks.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Kansas Secretary of State at sos.ks.gov. LLC fee: $165. Corporation fee: $90. Processing takes 3–5 business days.' },
      KY: { submitUrl: 'https://www.sos.ky.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Kentucky Secretary of State at sos.ky.gov. LLC fee: $40. Corporation fee: $50. Online processing is same-day.' },
      LA: { submitUrl: 'https://www.sos.la.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Louisiana Secretary of State at sos.la.gov. LLC fee: $100. Corporation fee: $75. Processing takes 1–3 business days.' },
      ME: { submitUrl: 'https://www.maine.gov/sos/cec/corp', officialFormNumber: 'Certificate of Formation (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Maine Secretary of State at maine.gov/sos. LLC fee: $175. Corporation fee: $145. Processing takes 1–3 business days.' },
      MD: { submitUrl: 'https://dat.maryland.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Maryland Department of Assessments and Taxation at dat.maryland.gov. LLC fee: $100. Corporation fee: $120. Processing takes 3–7 business days.' },
      MA: { submitUrl: 'https://corp.sec.state.ma.us', officialFormNumber: 'Certificate of Organization (LLC) / Articles of Organization (Corp)', submitInstructions: 'File online through the Massachusetts Secretary of State at corp.sec.state.ma.us. LLC fee: $500. Corporation fee: $275. Processing takes 3–5 business days.' },
      MI: { submitUrl: 'https://michigan.gov/lara', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Michigan LARA Corporations Division at michigan.gov/lara. LLC fee: $50. Corporation fee: $60. Processing takes 5–10 business days.' },
      MN: { submitUrl: 'https://www.sos.state.mn.us', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Minnesota Secretary of State at sos.state.mn.us. LLC fee: $155. Corporation fee: $135. Online processing is same-day.' },
      MS: { submitUrl: 'https://www.sos.ms.gov', officialFormNumber: 'Certificate of Formation (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Mississippi Secretary of State at sos.ms.gov. LLC fee: $50. Corporation fee: $50. Processing takes 3–5 business days.' },
      MO: { submitUrl: 'https://www.sos.mo.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Missouri Secretary of State at sos.mo.gov. LLC fee: $50. Corporation fee: $58. Processing takes 1–3 business days.' },
      MT: { submitUrl: 'https://sos.mt.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Montana Secretary of State at sos.mt.gov. LLC fee: $35. Corporation fee: $70. Processing takes 1–3 business days.' },
      NE: { submitUrl: 'https://www.sos.nebraska.gov', officialFormNumber: 'Certificate of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Nebraska Secretary of State at sos.nebraska.gov. LLC fee: $110. Corporation fee: $65 minimum. Processing takes 1–3 business days.' },
      NV: { submitUrl: 'https://esos.nv.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Nevada Secretary of State at esos.nv.gov. LLC fee: $75 + $200 initial list = $275. Corporation fee: $75 + $500 initial list. Processing takes 1–3 business days. Annual fees are higher than most states.' },
      NH: { submitUrl: 'https://sos.nh.gov', officialFormNumber: 'Certificate of Formation (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the New Hampshire Secretary of State at sos.nh.gov. LLC fee: $100. Corporation fee: $100. Processing takes 3–5 business days.' },
      NJ: { submitUrl: 'https://www.njportal.com/dor/businessregistration', officialFormNumber: 'Public Records Filing (LLC) / Certificate of Incorporation (Corp)', submitInstructions: 'File online through the New Jersey Division of Revenue and Enterprise Services at njportal.com. LLC fee: $125. Corporation fee: $125. Processing takes 1–3 business days. Note: Also register with the NJ Division of Taxation separately.' },
      NM: { submitUrl: 'https://www.sos.nm.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the New Mexico Secretary of State at sos.nm.gov. LLC fee: $50. Corporation fee: $100. Processing takes 1–3 business days.' },
      NY: { submitUrl: 'https://www.dos.ny.gov', submitPortalUrl: 'https://apps.dos.ny.gov/businessfilings/', officialFormNumber: 'Articles of Organization (LLC) / Certificate of Incorporation (Corp)', submitInstructions: 'File with the New York Department of State at dos.ny.gov. LLC fee: $200. Corporation fee: $125. LLCs must also publish formation notice in two newspapers for six weeks (required by NY law) — this can cost $300–$1,500+ depending on county. Processing takes 3–5 business days.' },
      NC: { submitUrl: 'https://www.sosnc.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the North Carolina Secretary of State at sosnc.gov. LLC fee: $125. Corporation fee: $125. Online processing is same-day.' },
      ND: { submitUrl: 'https://sos.nd.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the North Dakota Secretary of State at sos.nd.gov. LLC fee: $135. Corporation fee: $100. Processing takes 1–3 business days.' },
      OH: { submitUrl: 'https://www.sos.state.oh.us', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Ohio Secretary of State at sos.state.oh.us. LLC fee: $99. Corporation fee: $99. Online processing is same-day.' },
      OK: { submitUrl: 'https://www.sos.ok.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Oklahoma Secretary of State at sos.ok.gov. LLC fee: $100. Corporation fee: $50 minimum. Processing takes 3–5 business days.' },
      OR: { submitUrl: 'https://sos.oregon.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Oregon Secretary of State at sos.oregon.gov. LLC fee: $100. Corporation fee: $100. Online processing is same-day.' },
      PA: { submitUrl: 'https://www.dos.pa.gov', officialFormNumber: 'Certificate of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Pennsylvania Department of State at dos.pa.gov (PENN File system). LLC fee: $125. Corporation fee: $125. Processing takes 5–7 business days.' },
      RI: { submitUrl: 'https://www.sos.ri.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Rhode Island Secretary of State at sos.ri.gov. LLC fee: $150. Corporation fee: $230. Processing takes 1–3 business days.' },
      SC: { submitUrl: 'https://www.sos.sc.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the South Carolina Secretary of State at sos.sc.gov. LLC fee: $110. Corporation fee: $135. Processing takes 3–5 business days.' },
      SD: { submitUrl: 'https://sdsos.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the South Dakota Secretary of State at sdsos.gov. LLC fee: $150. Corporation fee: $150. Processing takes 1–3 business days.' },
      TN: { submitUrl: 'https://sos.tn.gov', officialFormNumber: 'Articles of Organization (LLC) / Charter (Corp)', submitInstructions: 'File online through the Tennessee Secretary of State at sos.tn.gov. LLC fee: $300 ($50 per member, max $3,000). Corporation fee: $100. Processing takes 3–5 business days.' },
      TX: { submitUrl: 'https://www.sos.state.tx.us', submitPortalUrl: 'https://www.sos.state.tx.us/corp/forms_boc.shtml', officialFormNumber: 'Form 205 (Certificate of Formation — LLC) / Form 201 (Certificate of Formation — For-Profit Corp)', submitInstructions: 'File Form 205 (LLC) or Form 201 (Corp) online through the Texas Secretary of State at sos.state.tx.us. Fee: $300 for both LLCs and Corporations. Online processing takes 3–5 business days. An expedited option (1 business day) costs an additional $25–$50.' },
      UT: { submitUrl: 'https://corporations.utah.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Utah Division of Corporations at corporations.utah.gov. LLC fee: $59. Corporation fee: $70. Online processing is same-day.' },
      VT: { submitUrl: 'https://sos.vermont.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Vermont Secretary of State at sos.vermont.gov. LLC fee: $125. Corporation fee: $125. Processing takes 1–3 business days.' },
      VA: { submitUrl: 'https://www.scc.virginia.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Virginia State Corporation Commission (SCC) at scc.virginia.gov (Clerk\'s Information System). LLC fee: $100. Corporation fee: $75. Online processing is same-day.' },
      WA: { submitUrl: 'https://ccfs.sos.wa.gov', officialFormNumber: 'Certificate of Formation (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Washington Secretary of State at ccfs.sos.wa.gov. LLC fee: $200. Corporation fee: $180 (online). Online processing is same-day.' },
      WV: { submitUrl: 'https://www.sos.wv.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the West Virginia Secretary of State at sos.wv.gov. LLC fee: $100. Corporation fee: $65. Processing takes 1–3 business days.' },
      WI: { submitUrl: 'https://www.wdfi.org', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Wisconsin Department of Financial Institutions at wdfi.org. LLC fee: $170. Corporation fee: $100. Online processing takes 1–3 business days.' },
      WY: { submitUrl: 'https://sos.wyo.gov', officialFormNumber: 'Articles of Organization (LLC) / Articles of Incorporation (Corp)', submitInstructions: 'File online through the Wyoming Secretary of State at sos.wyo.gov. LLC fee: $100. Corporation fee: $100. Wyoming has no state income tax and strong LLC privacy protections. Online processing is same-day.' },
    },
  },

  // ── Business License (city/county operating license) ─────────────────────

  'business-license': {
    id: 'business-license',
    defaultRenewalMonths: 12, // Most jurisdictions renew annually
    name: 'Local Business License / Business Tax Receipt',
    description:
      'Required by your city or county to legally operate a business. Known by different names in each state: Business Tax Receipt (FL), Business License (CA, WA), Privilege License (NC), Occupational Tax Certificate (GA), etc.',
    fee: '$25–$200 (varies by city/county)',
    submitUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    submitInstructions:
      'Submit your application to your city or county clerk, finance department, or business licensing office. ' +
      'Search "[your city] business license application" or "[your county] business tax receipt" to find your exact local portal. ' +
      'Processing typically takes 5–15 business days. Renew annually.',
    requiredDocs: [
      'Government-issued photo ID',
      'Proof of business address (lease agreement or utility bill)',
      'State business entity registration (LLC, Corporation, etc.) if applicable',
      'Professional or industry license if operating in a regulated field',
    ],
    fields: [
      { id: 'legalBusinessName',     label: 'Legal Business Name',                type: 'text',   placeholder: 'As registered with your state',           required: true  },
      { id: 'dbaName',               label: 'DBA / Trade Name (if different)',    type: 'text',   placeholder: 'Leave blank if same as legal name',        required: false },
      ...BASE_OWNER_FIELDS,
      { id: 'businessAddress',       label: 'Physical Business Address',          type: 'address',placeholder: '123 Main St, City, State ZIP',             required: true  },
      { id: 'businessType',          label: 'Business Entity Type',               type: 'select', options: ['Sole Proprietor', 'LLC', 'Corporation', 'Partnership', 'Non-Profit', 'Other'], required: true },
      { id: 'businessDescription',   label: 'Describe Your Business Activity',    type: 'text',   placeholder: 'e.g., Mobile food vending, retail, consulting', required: true },
      { id: 'startDate',             label: 'Planned or Actual Start Date',       type: 'date',   required: true  },
      { id: 'numEmployees',          label: 'Number of Employees (incl. owner)',  type: 'select', options: ['1 (owner only)', '2–5', '6–10', '11–25', '26+'], required: true },
      { id: 'homeBasedOrCommercial', label: 'Business Location Type',             type: 'select', options: ['Commercial/retail location', 'Home-based', 'Mobile (no fixed address)', 'Online only'], required: true },
    ],
    // Most business licenses are city/county level. localeUrls here are for states that
    // operate a genuine centralized (state-level) business licensing service or have an
    // official state "find your local license" resource that is more useful than SBA.
    localeUrls: {
      WA: {
        submitUrl: 'https://dor.wa.gov/open-business/apply-business-license',
        submitPortalUrl: 'https://dor.wa.gov/open-business/apply-business-license',
        submitInstructions: 'Washington state operates a unified Business Licensing Service (BLS) through the Department of Revenue. Most businesses need a state Business License ($19 fee) which also covers local city/county license requirements. Apply online at dor.wa.gov.',
      },
      DC: {
        submitUrl: 'https://dcbiz.dc.gov',
        submitPortalUrl: 'https://dcbiz.dc.gov',
        submitInstructions: 'Apply for a Basic Business License (BBL) through the DC Department of Licensing and Consumer Protection (DLCP) at dcbiz.dc.gov. The BBL is required for all businesses operating in the District. Fees vary by endorsement type.',
      },
      CO: {
        submitUrl: 'https://dor.colorado.gov/businesses-individuals/business-licensing-and-registration',
        submitPortalUrl: 'https://dor.colorado.gov/businesses-individuals/business-licensing-and-registration',
        submitInstructions: 'Colorado business licensing is handled locally by each city or county, but the Colorado Secretary of State and DOR provide centralized resources. Search "[your city] business license" for your local portal.',
      },
      WY: {
        submitUrl: 'https://wyomingbusiness.wy.gov',
        submitPortalUrl: 'https://wyomingbusiness.wy.gov',
        submitInstructions: 'Wyoming does not have a state-level general business license, but the Wyoming Business Council at wyomingbusiness.wy.gov provides licensing guidance and city/county referrals.',
      },
      HI: {
        submitUrl: 'https://cca.hawaii.gov',
        submitPortalUrl: 'https://cca.hawaii.gov',
        submitInstructions: 'Hawaii requires a General Excise Tax license (handled by the DCCA) which serves as the primary state business authorization. Apply at cca.hawaii.gov. Each county may have additional local permits.',
      },
    },
    // County-level overrides for forms where the Business Tax Receipt / Local Business
    // License is issued by the county Tax Collector (primarily Florida) or a consolidated
    // city-county government. Checked before localeUrls for maximum specificity.
    countyUrls: {
      // ── Florida — Business Tax Receipt is county-issued by the Tax Collector ──
      'Palm Beach County': {
        submitUrl: 'https://pbcgov.org',
        submitPortalUrl: 'https://pbcgov.org',
        submitInstructions: 'Apply for a Palm Beach County Local Business Tax Receipt (LBTR) through the Palm Beach County Tax Collector at pbcgov.org. Search for "Business Tax Receipt" on the portal. The LBTR is renewed annually and required for all businesses operating in unincorporated Palm Beach County. Incorporated cities within Palm Beach County may also require a city business license.',
      },
      'Miami-Dade County': {
        submitUrl: 'https://miamidade.gov',
        submitPortalUrl: 'https://miamidade.gov',
        submitInstructions: 'Apply for a Miami-Dade County Local Business Tax Receipt through the Miami-Dade County Finance Department at miamidade.gov. Search for "Local Business Tax" on the portal. Businesses operating within a municipality in Miami-Dade County may also need a city business license from that city.',
      },
      'Broward County': {
        submitUrl: 'https://broward.org',
        submitPortalUrl: 'https://broward.org',
        submitInstructions: 'Apply for a Broward County Local Business Tax Receipt through the Broward County Revenue Collection Division at broward.org. Search for "Business Tax Receipt" on the portal. Incorporated cities in Broward County may require an additional city business license.',
      },
      'Hillsborough County': {
        submitUrl: 'https://hillsboroughcounty.org',
        submitPortalUrl: 'https://hillsboroughcounty.org',
        submitInstructions: 'Apply for a Hillsborough County Local Business Tax Receipt through the Hillsborough County Tax Collector at hillsboroughcounty.org. Search for "Business Tax" on the portal. The City of Tampa also requires a separate Business Tax Receipt for businesses located within city limits.',
      },
      'Orange County': {
        submitUrl: 'https://orangecountyfl.net',
        submitPortalUrl: 'https://orangecountyfl.net',
        submitInstructions: 'Apply for an Orange County Local Business Tax Receipt through the Orange County Tax Collector at orangecountyfl.net. Search for "Business Tax Receipt" on the portal. Businesses inside the City of Orlando must also obtain a City of Orlando Business Tax Receipt.',
      },
      'Pinellas County': {
        submitUrl: 'https://pinellascounty.org',
        submitPortalUrl: 'https://pinellascounty.org',
        submitInstructions: 'Apply for a Pinellas County Local Business Tax Receipt through the Pinellas County Tax Collector at pinellascounty.org. Search for "Business Tax" on the portal. Incorporated cities in Pinellas County (Clearwater, St. Petersburg, etc.) may also require a city business license.',
      },
      'Duval County': {
        submitUrl: 'https://coj.net',
        submitPortalUrl: 'https://coj.net',
        submitInstructions: 'Jacksonville-Duval County is a consolidated city-county government. Apply for a Jacksonville Local Business Tax Receipt through the City of Jacksonville at coj.net. Search for "Business Tax Receipt" on the portal.',
      },
      'Osceola County': {
        submitUrl: 'https://osceolataxcollector.org',
        submitPortalUrl: 'https://osceolataxcollector.org',
        submitInstructions: 'Apply for an Osceola County Local Business Tax Receipt through the Osceola County Tax Collector at osceolataxcollector.org.',
      },
      'Leon County': {
        submitUrl: 'https://talgov.com',
        submitPortalUrl: 'https://talgov.com',
        submitInstructions: 'Tallahassee-Leon County operates a combined licensing system. Apply for a City of Tallahassee Business Tax Receipt at talgov.com. Search for "Business Tax Receipt" on the portal.',
      },
      'Alachua County': {
        submitUrl: 'https://alachuacounty.us',
        submitPortalUrl: 'https://alachuacounty.us',
        submitInstructions: 'Apply for an Alachua County Local Business Tax Receipt through the Alachua County Tax Collector at alachuacounty.us. The City of Gainesville also requires a separate Business Tax Receipt for businesses within city limits.',
      },
      'Escambia County': {
        submitUrl: 'https://escambiaclerk.com',
        submitPortalUrl: 'https://escambiaclerk.com',
        submitInstructions: 'Apply for an Escambia County Local Business Tax Receipt through the Escambia County Tax Collector. Visit escambiaclerk.com for guidance. The City of Pensacola also requires a separate business license.',
      },
      // ── New York City — consolidated city-county governments ──
      'New York County': {
        submitUrl: 'https://nyc.gov',
        submitPortalUrl: 'https://nyc.gov',
        submitInstructions: 'In New York City, most businesses require a DCA (Department of Consumer and Worker Protection) license in addition to any industry-specific licenses. Apply through the NYC Business portal at nyc.gov. Use the "Business Licenses & Permits" section.',
      },
      'Kings County': {
        submitUrl: 'https://nyc.gov',
        submitPortalUrl: 'https://nyc.gov',
        submitInstructions: 'Brooklyn is part of New York City. Most businesses require a DCA license. Apply through the NYC Business portal at nyc.gov. Use the "Business Licenses & Permits" section.',
      },
      'Queens County': {
        submitUrl: 'https://nyc.gov',
        submitPortalUrl: 'https://nyc.gov',
        submitInstructions: 'Queens is part of New York City. Most businesses require a DCA license. Apply through the NYC Business portal at nyc.gov. Use the "Business Licenses & Permits" section.',
      },
      'Bronx County': {
        submitUrl: 'https://nyc.gov',
        submitPortalUrl: 'https://nyc.gov',
        submitInstructions: 'The Bronx is part of New York City. Most businesses require a DCA license. Apply through the NYC Business portal at nyc.gov. Use the "Business Licenses & Permits" section.',
      },
      'Richmond County': {
        submitUrl: 'https://nyc.gov',
        submitPortalUrl: 'https://nyc.gov',
        submitInstructions: 'Staten Island is part of New York City. Most businesses require a DCA license. Apply through the NYC Business portal at nyc.gov. Use the "Business Licenses & Permits" section.',
      },
      // ── Illinois — Cook County / Chicago ──
      'Cook County': {
        submitUrl: 'https://cookcountyil.gov',
        submitPortalUrl: 'https://cookcountyil.gov',
        submitInstructions: 'In Cook County, business licensing is primarily handled at the city level. Chicago businesses apply for a Chicago Business License through the City of Chicago BACP at chicago.gov. Suburban Cook County municipalities each have their own licensing requirements — search "[your city] business license" for the local portal.',
      },
      // ── Georgia — Fulton County / Atlanta ──
      'Fulton County': {
        submitUrl: 'https://fultoncountyga.gov',
        submitPortalUrl: 'https://fultoncountyga.gov',
        submitInstructions: 'In Fulton County, business licenses (Occupational Tax Certificates) are issued by each city. For Atlanta, apply at atlantaga.gov. For unincorporated Fulton County, contact the Fulton County Business Registration office at fultoncountyga.gov.',
      },
      // ── Washington — King County (covered by state WA BLS, but county portal for reference) ──
      'King County': {
        submitUrl: 'https://dor.wa.gov/open-business/apply-business-license',
        submitPortalUrl: 'https://dor.wa.gov/open-business/apply-business-license',
        submitInstructions: 'Washington state operates a unified Business Licensing Service through the Department of Revenue that covers King County. Apply online at dor.wa.gov. The $19 state Business License covers most local city/county licensing requirements.',
      },
    },
  },

  // ── Mobile Food Vendor ────────────────────────────────────────────────────

  'mobile-food-vendor': {
    id: 'mobile-food-vendor',
    defaultRenewalMonths: 12, // Permit renews annually in virtually all jurisdictions
    name: 'Mobile Food Vendor Permit',
    description:
      'Required to legally operate a food truck, food cart, or any mobile food service vehicle. ' +
      'Issued by your state health department or local health authority. Requirements vary by state.',
    fee: '$100–$500 (varies by state and county)',
    submitUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    submitPortalUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    submitInstructions:
      'Apply through your state health department or local health authority. ' +
      'Most states require a commissary agreement with a licensed commercial kitchen and a vehicle inspection before approval. Processing takes 2–6 weeks.',
    requiredDocs: [
      'Vehicle registration and title',
      'Commissary agreement (signed contract with a licensed commercial kitchen)',
      'Vehicle inspection report from your county or state health authority',
      'Scaled floor plan / layout of the vehicle interior',
      'Full menu of all food items to be served',
      'State or local business entity registration',
      'Food handler certifications for all employees',
    ],
    fields: [
      { id: 'businessLegalName',  label: 'Business Legal Name',                      type: 'text',   placeholder: 'As registered with your state',       required: true  },
      { id: 'ownerName',          label: 'Owner / Operator Full Name',                type: 'text',   placeholder: 'First and last name',                 required: true  },
      { id: 'ownerEmail',         label: 'Owner Email Address',                       type: 'email',  placeholder: 'you@yourbusiness.com',                required: true  },
      { id: 'ownerPhone',         label: 'Owner Phone Number',                        type: 'phone',  placeholder: '(555) 555-0100',                      required: true  },
      { id: 'mailingAddress',     label: 'Owner / Business Mailing Address',          type: 'address',placeholder: '123 Main St, City, State ZIP',        required: true  },
      { id: 'operatingCity',      label: 'Primary City / County Where You Operate',  type: 'text',   placeholder: 'e.g., Austin, Travis County, TX',     required: true  },
      { id: 'vehicleType',        label: 'Vehicle Type',                              type: 'select', options: ['Food Truck (self-propelled)', 'Trailer (towed)', 'Cart / Stand', 'Van', 'Other'], required: true },
      { id: 'vehicleMakeModel',   label: 'Vehicle Make, Model, and Year',             type: 'text',   placeholder: 'e.g., 2019 Ford F-350',               required: true  },
      { id: 'vehicleVIN',         label: 'Vehicle VIN Number',                        type: 'text',   placeholder: '17-character VIN',                    required: true  },
      { id: 'vehicleLicensePlate',label: 'Vehicle License Plate and State',           type: 'text',   placeholder: 'e.g., ABC1234 — Florida',             required: true  },
      { id: 'commissaryName',     label: 'Commissary / Base Kitchen Name',            type: 'text',   placeholder: 'Name of licensed commercial kitchen', required: true  },
      { id: 'commissaryAddress',  label: 'Commissary Address',                        type: 'address',placeholder: 'Full address of commissary kitchen',  required: true  },
      { id: 'menuSummary',        label: 'Menu / Types of Food to be Sold',           type: 'text',   placeholder: 'e.g., Tacos, burgers, smoothies',     required: true  },
      { id: 'foodStorageMethod',  label: 'Food Storage and Temperature Control Method', type: 'text', placeholder: 'e.g., Commercial refrigerator',       required: true  },
    ],
    localeUrls: {
      FL: {
        submitUrl: 'https://www.myfloridalicense.com/DBPR/hotels-restaurants/food-lodging/mobile-food-dispensing-vehicles/',
        submitPortalUrl: 'https://www.myfloridalicense.com/DBPR/hotels-restaurants/food-lodging/mobile-food-dispensing-vehicles/',
        officialFormNumber: 'DBPR HR-7001',
        submitInstructions: 'Apply through the Florida DBPR Division of Hotels and Restaurants online at myfloridalicense.com for a Mobile Food Dispensing Vehicle (MFDV) license. Application fee is approximately $151.50. Commissary agreement, vehicle floor plan, and vehicle inspection report required. Processing takes 2–4 weeks.',
        fields: [
          { id: 'businessLegalName',   label: 'Business Legal Name',                          type: 'text',    placeholder: 'As registered with Florida Division of Corporations', required: true,  officialFieldName: 'DBPR HR-7001: Name of Business' },
          { id: 'ownerName',           label: 'Owner / Operator Full Name',                   type: 'text',    placeholder: 'First and last name',                 required: true,  officialFieldName: 'DBPR HR-7001: Owner / Operator Name' },
          { id: 'ownerEmail',          label: 'Owner Email Address',                          type: 'email',   placeholder: 'you@yourbusiness.com',                required: true,  officialFieldName: 'DBPR HR-7001: Email Address' },
          { id: 'ownerPhone',          label: 'Owner Phone Number',                           type: 'phone',   placeholder: '(555) 555-0100',                      required: true,  officialFieldName: 'DBPR HR-7001: Telephone Number' },
          { id: 'mailingAddress',      label: 'Mailing Address',                              type: 'address', placeholder: '123 Main St, City, State ZIP',        required: true,  officialFieldName: 'DBPR HR-7001: Mailing Address' },
          { id: 'operatingCounty',     label: 'Florida County Where You Will Primarily Operate', type: 'text', placeholder: 'e.g., Palm Beach County',             required: true,  officialFieldName: 'DBPR HR-7001: County of Operation' },
          { id: 'vehicleType',         label: 'Vehicle Type',                                 type: 'select',  options: ['Food Truck (self-propelled)', 'Trailer (towed)', 'Cart / Stand', 'Van', 'Other'], required: true, officialFieldName: 'DBPR HR-7001: Type of Vehicle' },
          { id: 'vehicleMakeModel',    label: 'Vehicle Make, Model, and Year',                type: 'text',    placeholder: 'e.g., 2019 Ford F-350',               required: true,  officialFieldName: 'DBPR HR-7001: Vehicle Year / Make / Model' },
          { id: 'vehicleVIN',          label: 'Vehicle VIN Number',                          type: 'text',    placeholder: '17-character VIN',                    required: true,  officialFieldName: 'DBPR HR-7001: Vehicle Identification Number (VIN)' },
          { id: 'vehicleLicensePlate', label: 'Vehicle License Plate Number',                type: 'text',    placeholder: 'e.g., ABC1234',                       required: true,  officialFieldName: 'DBPR HR-7001: License Plate Number' },
          { id: 'commissaryName',      label: 'Commissary / Base Kitchen Name',              type: 'text',    placeholder: 'Name of licensed commercial kitchen', required: true,  officialFieldName: 'DBPR HR-7001: Name of Commissary' },
          { id: 'commissaryAddress',   label: 'Commissary Address',                          type: 'address', placeholder: 'Full address of commissary kitchen',  required: true,  officialFieldName: 'DBPR HR-7001: Commissary Address' },
          { id: 'commissaryLicenseNum',label: 'Commissary Florida License Number',           type: 'text',    placeholder: 'e.g., 2305123',                       required: true,  officialFieldName: 'DBPR HR-7001: Commissary License Number' },
          { id: 'menuSummary',         label: 'Menu / Types of Food to be Sold',             type: 'text',    placeholder: 'e.g., Tacos, burgers, smoothies',     required: true,  officialFieldName: 'DBPR HR-7001: Type of Food Served' },
          { id: 'foodStorageMethod',   label: 'Method of Food Storage and Temperature Control', type: 'text', placeholder: 'e.g., Commercial refrigerator at 41°F or below', required: true, officialFieldName: 'DBPR HR-7001: Food Temperature Control Method' },
          { id: 'hasGenerator',        label: 'Does the vehicle have an onboard generator or shore power?', type: 'checkbox', required: true, officialFieldName: 'DBPR HR-7001: Power Source Attestation' },
        ],
      },
      TX: {
        submitUrl: 'https://www.dshs.texas.gov',
        submitPortalUrl: 'https://dshs.texas.gov/retail-food-establishments',
        officialFormNumber: 'DSHS Mobile Food Establishment Permit Application',
        submitInstructions: 'Apply through the Texas Department of State Health Services (DSHS) at dshs.texas.gov for a Mobile Food Establishment Permit. Many cities and counties in Texas also require a separate local health permit. A commissary agreement and vehicle inspection are required. Processing takes 2–4 weeks.',
      },
      CA: {
        submitUrl: 'https://www.cdph.ca.gov',
        submitInstructions: 'Apply through your county environmental health department for a Mobile Food Facility Permit — there is no single statewide portal. The California Department of Public Health (CDPH) sets standards, but counties issue the permits. Search "[your county] mobile food facility permit". A commissary agreement and vehicle inspection are required.',
      },
      NY: {
        submitUrl: 'https://www.health.ny.gov',
        submitInstructions: 'Apply through the New York State Department of Health or the NYC DOHMH (if operating in NYC). NYC operators also need a separate Mobile Food Vendor License from NYC DOHMH. A commissary agreement is required.',
      },
      IL: {
        submitUrl: 'https://www.idph.illinois.gov',
        submitInstructions: 'Apply through your county or municipal health department for a Mobile Food Establishment license. The Illinois Department of Public Health (IDPH) at idph.illinois.gov sets minimum standards, but county and city health departments issue the permits.',
      },
      GA: {
        submitUrl: 'https://dph.georgia.gov',
        submitInstructions: 'Apply through your county board of health for a Mobile Food Service Establishment Permit. The Georgia DPH at dph.georgia.gov sets standards. A commissary agreement and vehicle inspection are required. Processing takes 2–4 weeks.',
      },
      WA: {
        submitUrl: 'https://www.doh.wa.gov',
        submitInstructions: 'Apply through your local health jurisdiction (county or city health department) for a Mobile Food Unit permit. The Washington State Department of Health at doh.wa.gov sets standards. A commissary agreement and vehicle inspection are required.',
      },
      CO: {
        submitUrl: 'https://cdphe.colorado.gov',
        submitInstructions: 'Apply through your county or city public health agency for a Mobile Food Establishment license. The Colorado Department of Public Health and Environment (CDPHE) sets standards at cdphe.colorado.gov. Local health agencies issue the permits.',
      },
      NC: {
        submitUrl: 'https://www.ncdhhs.gov',
        submitInstructions: 'Apply through your county health department for a Mobile Food Establishment permit. The NC Division of Public Health sets standards. Contact your county environmental health office to schedule a vehicle inspection before applying.',
      },
      AZ: {
        submitUrl: 'https://www.azdhs.gov',
        submitInstructions: 'Apply through your county environmental services or your city for a Mobile Food Unit permit. The Arizona Department of Health Services (AZDHS) at azdhs.gov sets standards. Maricopa County and City of Phoenix each have separate permit requirements.',
      },
      OH: {
        submitUrl: 'https://odh.ohio.gov',
        submitInstructions: 'Apply through the Ohio Department of Health at odh.ohio.gov for a Mobile Food Service Operation license. Your local health district (city or county) will conduct the required inspection. A commissary agreement is required.',
      },
      PA: {
        submitUrl: 'https://www.agriculture.pa.gov',
        submitInstructions: 'Apply through the Pennsylvania Department of Agriculture at agriculture.pa.gov for a Mobile Food Facility license. A pre-opening inspection is required. You must also have a commissary agreement with a licensed food establishment.',
      },
      TN: {
        submitUrl: 'https://www.tn.gov/health',
        submitInstructions: 'Apply through the Tennessee Department of Health or your county health department for a Mobile Food Unit permit. A commissary agreement is required. Contact your local county health department to schedule a vehicle inspection.',
      },
      VA: {
        submitUrl: 'https://www.vdh.virginia.gov',
        submitInstructions: 'Apply through your local Virginia Department of Health (VDH) office for a Mobile Food Unit permit. The VDH at vdh.virginia.gov oversees food safety. A commissary agreement and vehicle inspection are required.',
      },
      MI: {
        submitUrl: 'https://michigan.gov/lara',
        submitInstructions: 'Apply through the Michigan Department of Licensing and Regulatory Affairs (LARA) at michigan.gov/lara for a Mobile Food Establishment license. Your local county or city health department may also require a separate permit. A commissary agreement is typically required.',
      },
      WI: {
        submitUrl: 'https://datcp.wi.gov',
        submitInstructions: 'Apply through the Wisconsin Department of Agriculture, Trade and Consumer Protection (DATCP) at datcp.wi.gov for a Mobile Retail Food Establishment license. Local city or county permits may also be required. A commissary agreement is required.',
      },
      MN: {
        submitUrl: 'https://www.health.state.mn.us',
        submitInstructions: 'Apply through the Minnesota Department of Health at health.state.mn.us or your local city/county health department for a Mobile Food Unit license. A commissary agreement and vehicle inspection are required.',
      },
      MO: {
        submitUrl: 'https://health.mo.gov',
        submitInstructions: 'Apply through the Missouri Department of Health and Senior Services at health.mo.gov or your local city/county health department for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are typically required.',
      },
      IN: {
        submitUrl: 'https://www.in.gov/health',
        submitInstructions: 'Apply through the Indiana State Department of Health at in.gov/health or your local county health department for a Mobile Food Establishment permit. A commissary agreement and vehicle inspection are required.',
      },
      KY: {
        submitUrl: 'https://www.chfs.ky.gov',
        submitInstructions: 'Apply through the Kentucky Cabinet for Health and Family Services at chfs.ky.gov or your local county health department for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      SC: {
        submitUrl: 'https://www.scdhec.gov',
        submitInstructions: 'Apply through the South Carolina Department of Health and Environmental Control (DHEC) at scdhec.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required. DHEC regional offices handle permit processing.',
      },
      LA: {
        submitUrl: 'https://www.ldh.la.gov',
        submitInstructions: 'Apply through the Louisiana Department of Health (LDH) at ldh.la.gov or your local parish (county) health unit for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      MS: {
        submitUrl: 'https://msdh.ms.gov',
        submitInstructions: 'Apply through the Mississippi State Department of Health at msdh.ms.gov or your local county health department for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      AL: {
        submitUrl: 'https://www.alabamapublichealth.gov',
        submitInstructions: 'Apply through the Alabama Department of Public Health at alabamapublichealth.gov or your local county health department for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      NV: {
        submitUrl: 'https://dpbh.nv.gov',
        submitInstructions: 'Apply through the Nevada Division of Public and Behavioral Health at dpbh.nv.gov or your local county health district for a Mobile Food Unit permit. Clark County (Las Vegas) and Washoe County (Reno) each have their own health districts that issue permits.',
      },
      UT: {
        submitUrl: 'https://health.utah.gov',
        submitInstructions: 'Apply through your local health department in Utah for a Mobile Food Business permit. The Utah Department of Health at health.utah.gov sets standards, but local health departments issue the permits. A commissary agreement and vehicle inspection are required.',
      },
      NM: {
        submitUrl: 'https://www.env.nm.gov',
        submitInstructions: 'Apply through the New Mexico Environment Department at env.nm.gov for a Mobile Food Unit permit. Your local county or municipality may have additional requirements. A commissary agreement and vehicle inspection are typically required.',
      },
      ND: {
        submitUrl: 'https://www.hhs.nd.gov',
        submitInstructions: 'Apply through the North Dakota Department of Health and Human Services at hhs.nd.gov for a Mobile Food Unit license. A commissary agreement and vehicle inspection are required.',
      },
      SD: {
        submitUrl: 'https://doh.sd.gov',
        submitInstructions: 'Apply through the South Dakota Department of Health at doh.sd.gov for a Mobile Food Unit license. A commissary agreement and vehicle inspection are required.',
      },
      WY: {
        submitUrl: 'https://health.wyo.gov',
        submitInstructions: 'Apply through the Wyoming Department of Health at health.wyo.gov or your local county health department for a Mobile Food Establishment permit. A commissary agreement and vehicle inspection are required.',
      },
      MT: {
        submitUrl: 'https://dphhs.mt.gov',
        submitInstructions: 'Apply through the Montana Department of Public Health and Human Services at dphhs.mt.gov or your local county health department for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      ID: {
        submitUrl: 'https://www.healthandwelfare.idaho.gov',
        submitInstructions: 'Apply through the Idaho Department of Health and Welfare at healthandwelfare.idaho.gov or your local district health department for a Mobile Food Unit permit. Idaho has seven district health departments that issue food permits in their regions.',
      },
      OR: {
        submitUrl: 'https://www.oregon.gov/oha',
        submitInstructions: 'Apply through your local county health department for a Mobile Unit Food Handler license. The Oregon Health Authority at oregon.gov/oha sets standards, but county health departments issue the permits. A commissary agreement and vehicle inspection are required.',
      },
      AK: {
        submitUrl: 'https://health.alaska.gov',
        submitInstructions: 'Apply through the Alaska Department of Health at health.alaska.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required. Alaska has limited local health authorities, so most permits are issued at the state level.',
      },
      HI: {
        submitUrl: 'https://health.hawaii.gov',
        submitInstructions: 'Apply through the Hawaii Department of Health at health.hawaii.gov for a Mobile Food Facility permit. Each county in Hawaii (Honolulu, Maui, Hawaii, Kauai) has its own permit requirements. A commissary agreement and vehicle inspection are required.',
      },
      NH: {
        submitUrl: 'https://www.dhhs.nh.gov',
        submitInstructions: 'Apply through the New Hampshire Department of Health and Human Services at dhhs.nh.gov for a Mobile Food Unit permit. Local inspections are conducted by state or municipal health officers. A commissary agreement is required.',
      },
      VT: {
        submitUrl: 'https://www.healthvermont.gov',
        submitInstructions: 'Apply through the Vermont Department of Health at healthvermont.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      RI: {
        submitUrl: 'https://health.ri.gov',
        submitInstructions: 'Apply through the Rhode Island Department of Health at health.ri.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      CT: {
        submitUrl: 'https://portal.ct.gov/dph',
        submitInstructions: 'Apply through your local town health department in Connecticut for a Mobile Food Unit permit. The Connecticut Department of Public Health at portal.ct.gov/dph sets standards, but local health departments issue permits. A commissary agreement and vehicle inspection are required.',
      },
      MA: {
        submitUrl: 'https://www.mass.gov/food-safety',
        submitInstructions: 'Apply through your local board of health in Massachusetts for a Mobile Food Vendor permit. Local health departments issue food permits in MA. The MA Department of Public Health at mass.gov/food-safety sets standards. A commissary agreement and vehicle inspection are required.',
      },
      MD: {
        submitUrl: 'https://health.maryland.gov',
        submitInstructions: 'Apply through your local county health department in Maryland for a Mobile Food Unit permit. The Maryland Department of Health at health.maryland.gov sets standards. A commissary agreement and vehicle inspection are required.',
      },
      DC: {
        submitUrl: 'https://dchealth.dc.gov',
        submitInstructions: 'Apply through the DC Department of Health at dchealth.dc.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required. You must also obtain a Basic Business License from the DC Department of Consumer and Regulatory Affairs (DCRA).',
      },
      WV: {
        submitUrl: 'https://dhhr.wv.gov',
        submitInstructions: 'Apply through the West Virginia Department of Health and Human Resources at dhhr.wv.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      AR: {
        submitUrl: 'https://www.healthy.arkansas.gov',
        submitInstructions: 'Apply through the Arkansas Department of Health at healthy.arkansas.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      OK: {
        submitUrl: 'https://oklahoma.gov/health',
        submitInstructions: 'Apply through the Oklahoma State Department of Health at oklahoma.gov/health for a Mobile Food Service Establishment license. A commissary agreement and vehicle inspection are required. Some cities (Oklahoma City, Tulsa) have additional local permit requirements.',
      },
      NJ: {
        submitUrl: 'https://www.nj.gov/health',
        submitInstructions: 'Apply through your local municipal health department in New Jersey for a Mobile Food Unit permit. The NJ Department of Health at nj.gov/health sets standards, but local health departments issue permits. A commissary agreement and vehicle inspection are required.',
      },
      DE: {
        submitUrl: 'https://dhss.delaware.gov/dph',
        submitInstructions: 'Apply through the Delaware Division of Public Health at dhss.delaware.gov/dph for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      NE: {
        submitUrl: 'https://dhhs.ne.gov',
        submitInstructions: 'Apply through the Nebraska Department of Health and Human Services at dhhs.ne.gov or your local health department for a Mobile Food Establishment permit. A commissary agreement and vehicle inspection are required.',
      },
      KS: {
        submitUrl: 'https://www.kdhe.ks.gov',
        submitInstructions: 'Apply through the Kansas Department of Health and Environment at kdhe.ks.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required. Some cities in Kansas have additional local permit requirements.',
      },
      IA: {
        submitUrl: 'https://hhs.iowa.gov',
        submitInstructions: 'Apply through the Iowa Department of Health and Human Services at hhs.iowa.gov for a Mobile Food Unit permit. A commissary agreement and vehicle inspection are required.',
      },
      ME: {
        submitUrl: 'https://www.maine.gov/dhhs',
        submitInstructions: 'Apply through the Maine Center for Disease Control and Prevention at maine.gov/dhhs for a Mobile Food Unit license. Local health inspectors conduct inspections. A commissary agreement and vehicle inspection are required.',
      },
    },
  },

  // ── Fictitious Name / DBA ─────────────────────────────────────────────────

  'fictitious-name': {
    id: 'fictitious-name',
    defaultRenewalMonths: 60, // Most states require renewal every 5 years
    name: 'DBA / Fictitious Business Name Registration',
    description:
      'Required in most US states when operating a business under any name other than your own legal name. ' +
      'Known as "Fictitious Business Name" (CA), "Assumed Name" (TX, IL), "Trade Name" (CO, VA), ' +
      'or "Fictitious Name" (FL, PA) depending on your state.',
    fee: '$10–$100 (varies by state)',
    submitUrl: 'https://www.sba.gov/business-guide/launch-your-business/register-your-business',
    submitInstructions:
      'File with your state Secretary of State or county clerk. ' +
      'Some states (TX, CA, NY) require county-level filing. ' +
      'Some states require newspaper publication within 30–60 days of filing.',
    requiredDocs: [
      'Government-issued photo ID',
      'Social Security Number or Federal EIN',
      'Newspaper publication receipt (required in some states)',
    ],
    fields: [
      { id: 'fictitiousName',    label: 'DBA / Fictitious Business Name',        type: 'text',   placeholder: 'e.g., Sunrise Eats',                   required: true  },
      { id: 'ownerLegalName',    label: 'Owner Legal Name (or LLC/Corp name)',   type: 'text',   placeholder: 'Your full legal name',                 required: true  },
      { id: 'ownerAddress',      label: 'Owner Mailing Address',                 type: 'address',placeholder: '123 Main St, City, State ZIP',         required: true  },
      { id: 'ownerEmail',        label: 'Owner Email Address',                   type: 'email',  placeholder: 'you@email.com',                        required: true  },
      { id: 'ownerPhone',        label: 'Owner Phone Number',                    type: 'phone',  placeholder: '(555) 555-0100',                       required: true  },
      { id: 'ownerType',         label: 'Owner Entity Type',                     type: 'select', options: ['Individual / Sole Proprietor', 'LLC', 'Corporation', 'General Partnership', 'Limited Partnership'], required: true },
      { id: 'fein',              label: 'Federal EIN or SSN',                    type: 'text',   placeholder: 'XX-XXXXXXX', hint: 'Federal EIN or Social Security Number', required: true },
      { id: 'businessNature',    label: 'Nature of Business',                    type: 'text',   placeholder: 'e.g., Food service, retail, consulting', required: true },
      { id: 'registrationState', label: 'State Where You Are Registering',       type: 'text',   placeholder: 'e.g., Connecticut',                    required: true  },
    ],
    localeUrls: {
      // ── State-level filing ──
      FL: {
        submitUrl: 'https://sunbiz.org',
        submitPortalUrl: 'https://sunbiz.org',
        officialFormNumber: 'Florida Fictitious Name Registration',
        submitInstructions: 'Register online at sunbiz.org with the Florida Division of Corporations. Fee: $50. Valid for 5 years. Your FEIN or SSN is required. Processed immediately online.',
        fields: [
          { id: 'fictitiousName',    label: 'Fictitious Name to Register',           type: 'text',    placeholder: 'The trade name you want to operate under',  required: true,  officialFieldName: 'Sunbiz: Fictitious Name' },
          { id: 'ownerLegalName',    label: 'Owner / Entity Legal Name',             type: 'text',    placeholder: 'Your full legal name or LLC/Corp name',      required: true,  officialFieldName: 'Sunbiz: Owner Name(s)' },
          { id: 'ownerAddress',      label: 'Owner Mailing Address',                 type: 'address', placeholder: '123 Main St, City, State ZIP',              required: true,  officialFieldName: 'Sunbiz: Mailing Address' },
          { id: 'ownerEmail',        label: 'Owner Email Address',                   type: 'email',   placeholder: 'you@email.com',                             required: true,  officialFieldName: 'Sunbiz: Email Address' },
          { id: 'ownerPhone',        label: 'Owner Phone Number',                    type: 'phone',   placeholder: '(555) 555-0100',                            required: true,  officialFieldName: 'Sunbiz: Telephone Number' },
          { id: 'fein',              label: 'Federal EIN or SSN',                    type: 'text',    placeholder: 'XX-XXXXXXX or XXX-XX-XXXX',                 required: true,  officialFieldName: 'Sunbiz: FEIN / SSN' },
          { id: 'ownerType',         label: 'Owner / Applicant Type',                type: 'select',  options: ['Individual / Sole Proprietor', 'LLC', 'Corporation', 'General Partnership', 'Limited Partnership', 'Other'], required: true, officialFieldName: 'Sunbiz: Type of Owner' },
          { id: 'businessNature',    label: 'Nature of Business',                    type: 'text',    placeholder: 'e.g., Food service, retail clothing',       required: true,  officialFieldName: 'Sunbiz: Nature of Business' },
          { id: 'countyOfBusiness',  label: 'Florida County Where Business Is Located', type: 'text', placeholder: 'e.g., Palm Beach County',                  required: true,  officialFieldName: 'Sunbiz: County' },
        ],
      },
      GA: {
        submitUrl: 'https://sos.ga.gov',
        submitPortalUrl: 'https://sos.ga.gov/corporations-division',
        officialFormNumber: 'Georgia Trade Name Registration',
        submitInstructions: 'File a Trade Name Registration online through the Georgia Secretary of State at sos.ga.gov. Fee: $25. Valid for 5 years. A trade name registration does not grant exclusive use — check for conflicts before filing.',
      },
      IL: {
        submitUrl: 'https://www.ilsos.gov',
        submitPortalUrl: 'https://www.ilsos.gov/corporatellc/',
        officialFormNumber: 'Assumed Business Name Registration',
        submitInstructions: 'File an Assumed Business Name registration online through the Illinois Secretary of State at ilsos.gov. Fee: $150 for a 5-year term. You will receive a certificate of registration.',
      },
      WA: {
        submitUrl: 'https://ccfs.sos.wa.gov',
        officialFormNumber: 'Washington Trade Name Registration',
        submitInstructions: 'Register your trade name online through the Washington Secretary of State at ccfs.sos.wa.gov. Fee: $5 per year (minimum 5 years = $25). You must renew every 5 years.',
      },
      OR: {
        submitUrl: 'https://sos.oregon.gov',
        officialFormNumber: 'Assumed Business Name Registration',
        submitInstructions: 'Register your assumed business name online through the Oregon Secretary of State at sos.oregon.gov. Fee: $50 for a 2-year registration.',
      },
      CO: {
        submitUrl: 'https://mybiz.sos.state.co.us',
        officialFormNumber: 'Statement of Trade Name',
        submitInstructions: 'File a Statement of Trade Name online through the Colorado Secretary of State at mybiz.sos.state.co.us. Fee: $20. Valid for 5 years. Both state-level (SOS) and county-level filing may be required depending on your business type.',
      },
      AZ: {
        submitUrl: 'https://azsos.gov',
        officialFormNumber: 'Arizona Trade Name Registration',
        submitInstructions: 'Register your trade name online through the Arizona Secretary of State at azsos.gov. Fee: $10. Registration is valid for 5 years. Note: if you are an LLC or Corporation, trade name registration is a separate step from entity formation.',
      },
      NV: {
        submitUrl: 'https://esos.nv.gov',
        officialFormNumber: 'Nevada Fictitious Firm Name Certificate',
        submitInstructions: 'File a Fictitious Firm Name certificate online through the Nevada Secretary of State at esos.nv.gov. Fee: $25. Registration is valid for 5 years. Filing at the county level with your county clerk may also be required.',
      },
      NC: {
        submitUrl: 'https://www.sosnc.gov',
        officialFormNumber: 'Assumed Business Name Certificate',
        submitInstructions: 'File an Assumed Business Name Certificate online through the North Carolina Secretary of State at sosnc.gov. Fee: $26. Valid for 5 years. Filing applies statewide.',
      },
      VA: {
        submitUrl: 'https://www.scc.virginia.gov',
        officialFormNumber: 'Virginia Certificate of Assumed or Fictitious Name',
        submitInstructions: 'File a Certificate of Assumed or Fictitious Name online through the Virginia State Corporation Commission (SCC) at scc.virginia.gov. Fee: $10. There is no expiration — you file once and cancel when you stop using the name.',
      },
      MN: {
        submitUrl: 'https://www.sos.state.mn.us',
        officialFormNumber: 'Assumed Name Certificate',
        submitInstructions: 'File an Assumed Name Certificate online through the Minnesota Secretary of State at sos.state.mn.us. Fee: $50. Registration is valid for 10 years.',
      },
      MO: {
        submitUrl: 'https://www.sos.mo.gov',
        officialFormNumber: 'Missouri Fictitious Name Registration',
        submitInstructions: 'Register your fictitious name online through the Missouri Secretary of State at sos.mo.gov. Fee: $7. Registration is valid for 5 years.',
      },
      KS: {
        submitUrl: 'https://www.sos.ks.gov',
        officialFormNumber: 'Kansas Assumed Name Registration',
        submitInstructions: 'File an Assumed Name registration online through the Kansas Secretary of State at sos.ks.gov. Fee: $35. Valid for 5 years.',
      },
      IA: {
        submitUrl: 'https://sos.iowa.gov',
        officialFormNumber: 'Iowa Fictitious Name Registration',
        submitInstructions: 'File a Fictitious Name Registration online through the Iowa Secretary of State at sos.iowa.gov. Fee: $5 per county. Registration must be filed in each county where the business operates.',
      },
      NE: {
        submitUrl: 'https://www.sos.nebraska.gov',
        officialFormNumber: 'Nebraska Trade Name Registration',
        submitInstructions: 'File a Trade Name Registration online through the Nebraska Secretary of State at sos.nebraska.gov. Fee: $110. Registration is valid for 10 years.',
      },
      ND: {
        submitUrl: 'https://sos.nd.gov',
        officialFormNumber: 'North Dakota Assumed Name Registration',
        submitInstructions: 'File an Assumed Name Registration through the North Dakota Secretary of State at sos.nd.gov. Fee: $25. Registration is valid for 3 years.',
      },
      SD: {
        submitUrl: 'https://sdsos.gov',
        officialFormNumber: 'South Dakota Fictitious Name Registration',
        submitInstructions: 'File with the South Dakota Secretary of State at sdsos.gov and also with your county register of deeds. Fee: $10 (state) + county fees. Registration is valid for 5 years.',
      },
      WY: {
        submitUrl: 'https://sos.wyo.gov',
        officialFormNumber: 'Wyoming Trade Name Registration',
        submitInstructions: 'File a Trade Name Registration online through the Wyoming Secretary of State at sos.wyo.gov. Fee: $100. Registration is valid for 10 years.',
      },
      MT: {
        submitUrl: 'https://sos.mt.gov',
        officialFormNumber: 'Montana Assumed Business Name Registration',
        submitInstructions: 'Register your assumed business name online through the Montana Secretary of State at sos.mt.gov. Fee: $20. Valid for 5 years.',
      },
      ID: {
        submitUrl: 'https://sos.idaho.gov',
        officialFormNumber: 'Idaho Assumed Business Name Registration',
        submitInstructions: 'File an Assumed Business Name registration online through the Idaho Secretary of State at sos.idaho.gov. Fee: $25. Valid for 5 years.',
      },
      UT: {
        submitUrl: 'https://corporations.utah.gov',
        officialFormNumber: 'Utah DBA / Assumed Name Registration',
        submitInstructions: 'Register your assumed business name online through the Utah Division of Corporations at corporations.utah.gov. Fee: $22. Valid for 3 years.',
      },
      NM: {
        submitUrl: 'https://www.sos.nm.gov',
        officialFormNumber: 'New Mexico Trade Name Registration',
        submitInstructions: 'File a Trade Name Registration online through the New Mexico Secretary of State at sos.nm.gov. Fee: $25. Valid for 4 years.',
      },
      TN: {
        submitUrl: 'https://sos.tn.gov',
        officialFormNumber: 'Tennessee Assumed Name Registration',
        submitInstructions: 'File an Assumed Name Registration online through the Tennessee Secretary of State at sos.tn.gov. Fee: $20. Valid for 5 years.',
      },
      SC: {
        submitUrl: 'https://www.sos.sc.gov',
        officialFormNumber: 'South Carolina Trade Name Registration',
        submitInstructions: 'File a Trade Name Registration online through the South Carolina Secretary of State at sos.sc.gov. Fee: $10. Valid for 5 years.',
      },
      KY: {
        submitUrl: 'https://www.sos.ky.gov',
        officialFormNumber: 'Kentucky Assumed Name Certificate',
        submitInstructions: 'File an Assumed Name Certificate online through the Kentucky Secretary of State at sos.ky.gov. Fee: $20. Valid for 5 years.',
      },
      IN: {
        submitUrl: 'https://inbiz.in.gov',
        officialFormNumber: 'Indiana Assumed Business Name Registration',
        submitInstructions: 'File an Assumed Business Name Registration online through the Indiana INBiz portal at inbiz.in.gov. Fee: $20. Valid for 5 years.',
      },
      OH: {
        submitUrl: 'https://www.sos.state.oh.us',
        officialFormNumber: 'Ohio Trade Name Registration',
        submitInstructions: 'File a Trade Name Registration online through the Ohio Secretary of State at sos.state.oh.us. Fee: $39. Valid for 5 years.',
      },
      MI: {
        submitUrl: 'https://michigan.gov/lara',
        officialFormNumber: 'Michigan Assumed Name Certificate',
        submitInstructions: 'File an Assumed Name Certificate with the Michigan Department of Licensing and Regulatory Affairs at michigan.gov/lara. County-level filing may also be required. Fee: $10. Valid for 5 years.',
      },
      WI: {
        submitUrl: 'https://www.wdfi.org',
        officialFormNumber: 'Wisconsin Fictitious Name Registration',
        submitInstructions: 'File a Fictitious Name Registration online through the Wisconsin Department of Financial Institutions at wdfi.org. Fee: $15. Valid for 10 years.',
      },
      ME: {
        submitUrl: 'https://www.maine.gov/sos/cec/corp',
        officialFormNumber: 'Maine Assumed or Fictitious Name Registration',
        submitInstructions: 'File with your municipality (city or town clerk) in Maine — there is no state-level fictitious name filing. Contact your local town clerk for the form and fee.',
      },
      VT: {
        submitUrl: 'https://sos.vermont.gov',
        officialFormNumber: 'Vermont Assumed Business Name Registration',
        submitInstructions: 'File an Assumed Business Name Registration online through the Vermont Secretary of State at sos.vermont.gov. Fee: $50. Valid for 5 years.',
      },
      RI: {
        submitUrl: 'https://www.sos.ri.gov',
        officialFormNumber: 'Rhode Island Fictitious Business Name Statement',
        submitInstructions: 'File a Fictitious Business Name Statement with your local city or town clerk in Rhode Island — not with the Secretary of State. Contact your local clerk for the form and fee.',
      },
      WV: {
        submitUrl: 'https://www.sos.wv.gov',
        officialFormNumber: 'West Virginia Fictitious Name Registration',
        submitInstructions: 'File a Fictitious Name Registration online through the West Virginia Secretary of State at sos.wv.gov. Fee: $25. Valid for 5 years.',
      },
      MS: {
        submitUrl: 'https://www.sos.ms.gov',
        officialFormNumber: 'Mississippi Fictitious Name Registration',
        submitInstructions: 'File a Fictitious Name Registration online through the Mississippi Secretary of State at sos.ms.gov. Fee: $25. Valid for 5 years.',
      },
      LA: {
        submitUrl: 'https://www.sos.la.gov',
        officialFormNumber: 'Louisiana Trade Name Registration',
        submitInstructions: 'Register your trade name online through the Louisiana Secretary of State at sos.la.gov. Fee: $75. Valid indefinitely (no expiration, but subject to cancellation).',
      },
      AL: {
        submitUrl: 'https://sos.alabama.gov',
        officialFormNumber: 'Alabama Fictitious Name Registration',
        submitInstructions: 'File a Fictitious Name Registration online through the Alabama Secretary of State at sos.alabama.gov. Fee: $28 per county where the name will be used. You must also publish the registration in a newspaper in each county.',
      },
      // County-level states — point to SOS with clear instructions
      TX: {
        submitUrl: 'https://www.sos.state.tx.us',
        officialFormNumber: 'Assumed Name Certificate (county courthouse)',
        submitInstructions: 'In Texas, Assumed Name Certificates are filed at the county courthouse with your county clerk — not with the Secretary of State. Visit your county clerk\'s office or check their website for the current form (sometimes called "DBA Filing"). Fee: typically $14–$25 per county. Sole proprietors and general partnerships file at the county level; LLCs and Corps file with the SOS.',
      },
      CA: {
        submitUrl: 'https://www.sos.ca.gov',
        officialFormNumber: 'Fictitious Business Name Statement (county clerk)',
        submitInstructions: 'In California, Fictitious Business Name Statements are filed with your county clerk — not the Secretary of State. Search "[your county] fictitious business name" to find your county clerk\'s filing portal. Fee: $26–$100+ depending on county. You must also publish the statement in a local newspaper for 4 consecutive weeks within 30 days of filing.',
      },
      NY: {
        submitUrl: 'https://www.dos.ny.gov',
        officialFormNumber: 'Certificate of Assumed Name (county clerk)',
        submitInstructions: 'In New York, DBAs (Certificates of Assumed Name) are filed with your county clerk for sole proprietors, partnerships, and LLCs — not with the Department of State. Corporations file with DOS. After filing, you must publish the certificate in two newspapers in the county for six consecutive weeks. Fee: $25 (county filing) + publication costs (varies widely). Contact your county clerk for the exact form.',
      },
      NJ: {
        submitUrl: 'https://www.njportal.com/dor/businessregistration',
        officialFormNumber: 'New Jersey Alternate Name (DBA) Registration',
        submitInstructions: 'In New Jersey, sole proprietors and partnerships file an Alternate Name ("Trade Name") with their county clerk. LLCs and Corporations file an Alternate Name with the NJ Division of Revenue at njportal.com. Fee: $50 (state). County fees vary.',
      },
      PA: {
        submitUrl: 'https://www.dos.pa.gov',
        officialFormNumber: 'Pennsylvania Fictitious Name Registration (Form DSCB:54-311)',
        submitInstructions: 'File a Fictitious Name Registration online through the Pennsylvania Department of State at dos.pa.gov. Fee: $70. Valid indefinitely but must be renewed if ownership changes. Corporations and LLCs operating under a name other than their legal name must also register a fictitious name.',
      },
      MA: {
        submitUrl: 'https://corp.sec.state.ma.us',
        officialFormNumber: 'Massachusetts DBA / Doing Business As Certificate',
        submitInstructions: 'In Massachusetts, DBA certificates (Doing Business As) are filed with your city or town clerk — not with the Secretary of State. Contact your local city/town clerk for the form and filing fee (typically $10–$50). No publication is required.',
      },
      CT: {
        submitUrl: 'https://business.ct.gov',
        officialFormNumber: 'Connecticut Trade Name Certificate',
        submitInstructions: 'In Connecticut, Trade Name Certificates are filed with your town clerk — not with the Secretary of State. Contact your local town clerk for the current form and fee. Filing is done in each town where the business operates.',
      },
      MD: {
        submitUrl: 'https://dat.maryland.gov',
        officialFormNumber: 'Maryland Tradename Registration',
        submitInstructions: 'File a Tradename Registration online through the Maryland Department of Assessments and Taxation at dat.maryland.gov. Fee: $25. Valid indefinitely (subject to 5-year renewal). Maryland requires a tradename registration for any business operating under a name other than the owner\'s legal name.',
      },
      DC: {
        submitUrl: 'https://dcbiz.dc.gov',
        officialFormNumber: 'DC Trade Name Registration',
        submitInstructions: 'Register your trade name online through the DC Department of Licensing and Consumer Protection at dcbiz.dc.gov. Fee: $55. Valid for 2 years.',
      },
      // Remaining states
      AK: { submitUrl: 'https://corporations.alaska.gov', officialFormNumber: 'Alaska Assumed Business Name Registration', submitInstructions: 'Register your assumed business name online through the Alaska Division of Corporations at corporations.alaska.gov. Fee: $25. Valid for 2 years.' },
      HI: { submitUrl: 'https://cca.hawaii.gov', officialFormNumber: 'Hawaii Trade Name Registration', submitInstructions: 'Register your trade name online through the Hawaii DCCA at cca.hawaii.gov. Fee: $50. Valid for 5 years. Business registration is handled by the DCCA, not the Secretary of State.' },
      NH: { submitUrl: 'https://sos.nh.gov', officialFormNumber: 'New Hampshire Trade Name Registration', submitInstructions: 'File a Trade Name Registration online through the New Hampshire Secretary of State at sos.nh.gov. Fee: $50. Valid for 5 years.' },
      DE: { submitUrl: 'https://corp.delaware.gov', officialFormNumber: 'Delaware Fictitious Name Registration (county)', submitInstructions: 'In Delaware, fictitious name registrations are filed with your county prothonotary (court). New Castle, Kent, and Sussex counties each have their own filing process. Fee: approximately $25. Contact your county courthouse for the current form.' },
      AR: { submitUrl: 'https://www.sos.arkansas.gov', officialFormNumber: 'Arkansas DBA / Assumed Name Registration', submitInstructions: 'File an Assumed Name Registration with your county clerk in Arkansas — DBA registrations are county-level. Fee: typically $25. Contact your county clerk for the form.' },
      OK: { submitUrl: 'https://www.sos.ok.gov', officialFormNumber: 'Oklahoma Trade Name Registration', submitInstructions: 'File a Trade Name Registration online through the Oklahoma Secretary of State at sos.ok.gov. Fee: $25. Valid for 5 years.' },
    },
  },

  // ── EIN Application ───────────────────────────────────────────────────────

  'ein-application': {
    id: 'ein-application',
    defaultRenewalMonths: null, // EIN is a permanent federal tax ID; never expires
    name: 'IRS EIN Application (Form SS-4)',
    officialFormNumber: 'IRS Form SS-4',
    officialFormPdfUrl: 'https://www.irs.gov/pub/irs-pdf/fss4.pdf',
    description:
      'Federal Employer Identification Number — required nationwide for opening business bank accounts, ' +
      'hiring employees, filing business taxes, and forming an LLC or Corporation. Issued free by the IRS. ' +
      'Form SS-4 is the official IRS application.',
    fee: 'Free',
    submitUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
    submitPortalUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
    submitInstructions:
      'Apply online at IRS.gov for instant EIN issuance (Mon–Fri 7am–10pm ET). ' +
      'Alternatively, fax Form SS-4 to (855) 641-6935 (4-business-day turnaround) or mail (4-week turnaround). ' +
      'The online portal is strongly recommended.',
    requiredDocs: [
      'Social Security Number (for sole proprietors) or existing ITIN',
      'Legal business name and address',
      'Date business started or was acquired',
      'Reason for applying',
    ],
    fields: [
      { id: 'legalName',             label: 'Legal Name of Business / Responsible Party',  type: 'text',   placeholder: 'Your name or LLC/Corp legal name',           required: true,  officialFieldName: 'SS-4 Line 1: Legal name of entity (or individual)' },
      { id: 'tradeNameDba',          label: 'Trade Name / DBA (if different)',              type: 'text',   placeholder: 'Leave blank if same',                        required: false, officialFieldName: 'SS-4 Line 2: Trade name / DBA (if different from Line 1)' },
      { id: 'entityType',            label: 'Type of Business Entity',                      type: 'select', options: ['Sole Proprietor', 'Single-Member LLC', 'Multi-Member LLC', 'S-Corporation', 'C-Corporation', 'Partnership', 'Non-Profit', 'Other'], required: true, officialFieldName: 'SS-4 Line 9a: Type of entity' },
      { id: 'stateOfFormation',      label: 'State Where Business Was Formed',              type: 'text',   placeholder: 'e.g., Connecticut',                          required: true,  officialFieldName: 'SS-4 Line 9b: State of incorporation / formation' },
      { id: 'businessAddress',       label: 'Principal Business Address',                   type: 'address',placeholder: '123 Main St, City, State ZIP',               required: true,  officialFieldName: 'SS-4 Lines 5a–5b: Street address of principal place of business' },
      { id: 'mailingAddress',        label: 'Mailing Address (if different from above)',    type: 'address',placeholder: 'Leave blank if same',                        required: false, officialFieldName: 'SS-4 Lines 4a–4b: Mailing address' },
      { id: 'responsiblePartyName',  label: 'Responsible Party Name',                      type: 'text',   placeholder: 'Full legal name of person controlling the entity', required: true, officialFieldName: 'SS-4 Line 7a: Name of responsible party' },
      { id: 'responsiblePartySSN',   label: 'Responsible Party SSN or ITIN',               type: 'text',   placeholder: 'XXX-XX-XXXX', hint: 'Required by IRS — stored locally only', required: true, officialFieldName: 'SS-4 Line 7b: SSN / ITIN / EIN of responsible party' },
      { id: 'reasonForApplying',     label: 'Reason for Applying',                          type: 'select', options: ['Started a new business', 'Hired or will hire employees', 'Changed business type', 'Opening a bank account', 'Formed an LLC or Corporation', 'Other'], required: true, officialFieldName: 'SS-4 Line 10: Reason for applying' },
      { id: 'startedDate',           label: 'Date Business Started or Acquired',            type: 'date',   required: true,  officialFieldName: 'SS-4 Line 11: Date business started or acquired (MM/DD/YYYY)' },
      { id: 'businessActivity',      label: 'Principal Business Activity',                  type: 'text',   placeholder: 'e.g., Food service, retail, consulting',     required: true,  officialFieldName: 'SS-4 Line 16: Principal activity (products made or services provided)' },
      { id: 'expectedEmployees',     label: 'Expected employees in next 12 months',         type: 'select', options: ['0', '1–5', '6–25', '26–100', '100+'],           required: true,  officialFieldName: 'SS-4 Line 13: Highest number of employees expected in next 12 months' },
    ],
  },

  // ── Food Service Permit ───────────────────────────────────────────────────

  'food-service-permit': {
    id: 'food-service-permit',
    defaultRenewalMonths: 12, // Health department permits renew annually
    name: 'Food Service Establishment Permit',
    description:
      'Required by your state or county health authority to operate any fixed food service business ' +
      'including restaurants, cafés, bakeries, commissaries, and catering kitchens.',
    fee: '$100–$1,000 (varies by state, seating capacity, and risk level)',
    submitUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    submitPortalUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    submitInstructions:
      'Apply through your state or county health authority. ' +
      'Most states require a pre-opening health inspection before you can serve customers.',
    requiredDocs: [
      'Scaled floor plan showing all equipment placement and dimensions',
      'Equipment list with manufacturer names and model numbers',
      'Copy of lease agreement or proof of property ownership',
      'Water supply and sewage/waste disposal documentation',
      'Full menu of all food items to be prepared and served',
      'Food manager certification (required in most states)',
    ],
    fields: [
      { id: 'establishmentName',  label: 'Establishment Name',            type: 'text',   placeholder: 'Your restaurant or food service name',      required: true  },
      { id: 'ownerName',          label: 'Owner / Operator Legal Name',   type: 'text',   placeholder: 'Full legal name',                           required: true  },
      { id: 'ownerEmail',         label: 'Owner Email',                   type: 'email',  placeholder: 'you@email.com',                             required: true  },
      { id: 'ownerPhone',         label: 'Owner Phone',                   type: 'phone',  placeholder: '(555) 555-0100',                            required: true  },
      { id: 'physicalAddress',    label: 'Establishment Physical Address',type: 'address',placeholder: '123 Main St, City, State ZIP',             required: true  },
      { id: 'establishmentType',  label: 'Type of Establishment',         type: 'select', options: ['Restaurant', 'Café / Coffee Shop', 'Bakery', 'Catering Kitchen', 'Commissary', 'Snack Bar / Kiosk', 'Bar with Food Service', 'Food Truck Commissary', 'Other'], required: true },
      { id: 'seatingCapacity',    label: 'Seating Capacity',              type: 'select', options: ['0 (no seating / takeout only)', '1–49', '50–100', '101–200', '200+'], required: true },
      { id: 'squareFootage',      label: 'Approximate Square Footage',    type: 'text',   placeholder: 'e.g., 1,200 sq ft',                        required: true  },
      { id: 'hoursOfOperation',   label: 'Planned Hours of Operation',    type: 'text',   placeholder: 'e.g., Mon–Sat 8am–9pm',                    required: true  },
      { id: 'menuDescription',    label: 'Menu Description',              type: 'text',   placeholder: 'Brief description of food prepared',       required: true  },
      { id: 'waterSource',        label: 'Water Source',                  type: 'select', options: ['Municipal / City water', 'Private well', 'Both'], required: true },
    ],
    localeUrls: {
      FL: {
        submitUrl: 'https://www.floridahealth.gov/environmental-health/food-hygiene/index.html',
        submitPortalUrl: 'https://www.floridahealth.gov/environmental-health/food-hygiene/index.html',
        submitInstructions: 'Apply through the Florida Department of Health county office where your establishment is located. A mandatory pre-opening inspection is required. Permits are renewed annually. Fees: $50–$1,000+ depending on seating capacity and risk classification.',
      },
      TX: {
        submitUrl: 'https://www.dshs.texas.gov',
        submitPortalUrl: 'https://dshs.texas.gov/retail-food-establishments',
        submitInstructions: 'Apply through the Texas DSHS at dshs.texas.gov or your local city/county health authority for a Food Establishment Permit. Many cities (Austin, Houston, Dallas) have their own additional local permits. A mandatory pre-opening inspection is required.',
      },
      CA: {
        submitUrl: 'https://www.cdph.ca.gov',
        submitInstructions: 'Apply through your county environmental health department for a Food Facility Permit. There is no single statewide portal. Search "[your county] environmental health food facility permit" to find your county\'s application. A pre-opening inspection is required.',
      },
      NY: {
        submitUrl: 'https://www.health.ny.gov',
        submitInstructions: 'Apply through the New York State Department of Health at health.ny.gov. In NYC, apply through the NYC DOHMH at nyc.gov/health — NYC has its own permitting system. A mandatory pre-opening inspection is required.',
      },
      IL: {
        submitUrl: 'https://www.idph.illinois.gov',
        submitInstructions: 'Apply through your county or municipal health department for a Food Service Sanitation permit. The Illinois IDPH at idph.illinois.gov sets standards. Local health departments issue permits and conduct inspections.',
      },
      GA: {
        submitUrl: 'https://dph.georgia.gov',
        submitInstructions: 'Apply through your county board of health for a Food Service Establishment Permit. A mandatory pre-opening inspection is required. Schedule at least 2–4 weeks in advance.',
      },
      WA: {
        submitUrl: 'https://www.doh.wa.gov',
        submitInstructions: 'Apply through your local health jurisdiction (county or city health department) for a Food Establishment Permit. The Washington DOH at doh.wa.gov sets standards, but local health jurisdictions issue the permits.',
      },
      CO: {
        submitUrl: 'https://cdphe.colorado.gov',
        submitInstructions: 'Apply through your county or city public health agency for a Retail Food Establishment license. The Colorado CDPHE at cdphe.colorado.gov sets standards. A mandatory pre-opening inspection is required.',
      },
      NC: {
        submitUrl: 'https://www.ncdhhs.gov',
        submitInstructions: 'Apply through your county health department for a Food Establishment permit. The NC Division of Environmental Health sets standards. Contact your county environmental health office to obtain the application and schedule a pre-opening inspection.',
      },
      AZ: {
        submitUrl: 'https://www.azdhs.gov',
        submitInstructions: 'Apply through your county environmental health department for a Food Establishment License. The Arizona DHS at azdhs.gov sets standards. Maricopa County, Pima County, and City of Tucson each have separate permitting processes.',
      },
      OH: {
        submitUrl: 'https://odh.ohio.gov',
        submitInstructions: 'Apply through the Ohio Department of Health at odh.ohio.gov for a Food Service Operation license. Your local health district (city or county) will conduct inspections. A pre-opening inspection is required.',
      },
      PA: {
        submitUrl: 'https://www.agriculture.pa.gov',
        submitInstructions: 'Apply through the Pennsylvania Department of Agriculture at agriculture.pa.gov for a Food Establishment License. A pre-opening inspection is required. Fees range from $35 to $750 depending on establishment type.',
      },
      TN: {
        submitUrl: 'https://www.tn.gov/health',
        submitInstructions: 'Apply through the Tennessee Department of Health for a Food Service Establishment permit. Your local county health department will conduct inspections. A pre-opening inspection is required.',
      },
      VA: {
        submitUrl: 'https://www.vdh.virginia.gov',
        submitInstructions: 'Apply through your local Virginia Department of Health (VDH) office for a Food Establishment Permit. The VDH at vdh.virginia.gov oversees food safety. A pre-opening inspection is required.',
      },
      MI: {
        submitUrl: 'https://michigan.gov/lara',
        submitInstructions: 'Apply through the Michigan Department of Licensing and Regulatory Affairs (LARA) at michigan.gov/lara for a Food Service Establishment License. Your local city or county health department will conduct inspections. A pre-opening inspection is required.',
      },
      WI: {
        submitUrl: 'https://datcp.wi.gov',
        submitInstructions: 'Apply through the Wisconsin Department of Agriculture, Trade and Consumer Protection (DATCP) at datcp.wi.gov for a Food Processing Plant or Retail Food Establishment license. Your local county health department may also require a separate permit.',
      },
      MN: {
        submitUrl: 'https://www.health.state.mn.us',
        submitInstructions: 'Apply through the Minnesota Department of Health at health.state.mn.us for a Food, Beverage and Lodging establishment license. Your local city or county may also require a separate food establishment permit. A pre-opening inspection is required.',
      },
      MO: {
        submitUrl: 'https://health.mo.gov',
        submitInstructions: 'Apply through the Missouri Department of Health and Senior Services at health.mo.gov or your local city/county health department for a Food Establishment permit. A pre-opening inspection is required.',
      },
      IN: {
        submitUrl: 'https://www.in.gov/health',
        submitInstructions: 'Apply through the Indiana State Department of Health at in.gov/health or your local county health department for a Food Establishment permit. A pre-opening inspection is required. Some cities have their own permitting requirements.',
      },
      KY: {
        submitUrl: 'https://www.chfs.ky.gov',
        submitInstructions: 'Apply through the Kentucky Cabinet for Health and Family Services at chfs.ky.gov or your local county health department for a Food Service Establishment permit. A pre-opening inspection is required.',
      },
      SC: {
        submitUrl: 'https://www.scdhec.gov',
        submitInstructions: 'Apply through the South Carolina Department of Health and Environmental Control (DHEC) at scdhec.gov for a Retail Food Establishment permit. A pre-opening inspection is required. DHEC regional offices handle permit processing.',
      },
      LA: {
        submitUrl: 'https://www.ldh.la.gov',
        submitInstructions: 'Apply through the Louisiana Department of Health at ldh.la.gov or your local parish sanitarian for a Food Service Establishment permit. A pre-opening inspection is required.',
      },
      MD: {
        submitUrl: 'https://health.maryland.gov',
        submitInstructions: 'Apply through your local county health department in Maryland for a Food Service Facility permit. The Maryland Department of Health at health.maryland.gov sets standards. A pre-opening inspection is required.',
      },
      NJ: {
        submitUrl: 'https://www.nj.gov/health',
        submitInstructions: 'Apply through your local municipal health department in New Jersey for a Food Establishment permit. The NJ Department of Health at nj.gov/health sets standards, but local health departments issue and inspect. A pre-opening inspection is required.',
      },
      MA: {
        submitUrl: 'https://www.mass.gov/food-safety',
        submitInstructions: 'Apply through your local board of health in Massachusetts for a Food Establishment permit. The MA Department of Public Health at mass.gov/food-safety sets standards, but local boards of health issue and inspect all food establishments. A pre-opening inspection is required.',
      },
      OR: {
        submitUrl: 'https://www.oregon.gov/oha',
        submitInstructions: 'Apply through your local county health department in Oregon for a Food Handler License and Restaurant License. The Oregon Health Authority at oregon.gov/oha sets standards. A pre-opening inspection is required.',
      },
      CT: {
        submitUrl: 'https://portal.ct.gov/dph',
        submitInstructions: 'Apply through your local town health department in Connecticut for a Food Service Establishment permit. The CT Department of Public Health at portal.ct.gov/dph sets standards, but local health departments issue permits. A pre-opening inspection is required.',
      },
      NV: {
        submitUrl: 'https://dpbh.nv.gov',
        submitInstructions: 'Apply through your local county health district in Nevada for a Food Establishment permit. Clark County (Las Vegas) and Washoe County (Reno) each have their own health districts. The Nevada Division of Public and Behavioral Health at dpbh.nv.gov sets standards.',
      },
      NM: {
        submitUrl: 'https://www.env.nm.gov',
        submitInstructions: 'Apply through the New Mexico Environment Department at env.nm.gov for a Food Service Establishment permit. Your local county or municipality may have additional requirements. A pre-opening inspection is required.',
      },
      AL: {
        submitUrl: 'https://www.alabamapublichealth.gov',
        submitInstructions: 'Apply through your local county health department in Alabama for a Food Establishment permit. The Alabama Department of Public Health at alabamapublichealth.gov sets standards. A pre-opening inspection is required.',
      },
      MS: {
        submitUrl: 'https://msdh.ms.gov',
        submitInstructions: 'Apply through the Mississippi State Department of Health at msdh.ms.gov or your local county health department for a Food Establishment permit. A pre-opening inspection is required.',
      },
      AR: {
        submitUrl: 'https://www.healthy.arkansas.gov',
        submitInstructions: 'Apply through the Arkansas Department of Health at healthy.arkansas.gov for a Food Service Establishment permit. A pre-opening inspection is required.',
      },
      OK: {
        submitUrl: 'https://oklahoma.gov/health',
        submitInstructions: 'Apply through the Oklahoma State Department of Health at oklahoma.gov/health for a Food Establishment License. A pre-opening inspection is required. Some cities (Oklahoma City, Tulsa) have additional local permit requirements.',
      },
      UT: {
        submitUrl: 'https://health.utah.gov',
        submitInstructions: 'Apply through your local health department in Utah for a Food Service Establishment permit. The Utah Department of Health at health.utah.gov sets standards, but local health departments issue permits. A pre-opening inspection is required.',
      },
      KS: {
        submitUrl: 'https://www.kdhe.ks.gov',
        submitInstructions: 'Apply through the Kansas Department of Health and Environment at kdhe.ks.gov for a Food Service Establishment license. A pre-opening inspection is required.',
      },
      NE: {
        submitUrl: 'https://dhhs.ne.gov',
        submitInstructions: 'Apply through the Nebraska Department of Health and Human Services at dhhs.ne.gov or your local health department for a Food Establishment permit. A pre-opening inspection is required.',
      },
      IA: {
        submitUrl: 'https://hhs.iowa.gov',
        submitInstructions: 'Apply through the Iowa Department of Health and Human Services at hhs.iowa.gov for a Food Establishment license. A pre-opening inspection is required.',
      },
      DC: {
        submitUrl: 'https://dchealth.dc.gov',
        submitInstructions: 'Apply through the DC Department of Health at dchealth.dc.gov for a Food Establishment permit. A pre-opening inspection and DC Food Manager Certification are required.',
      },
      ID: {
        submitUrl: 'https://www.healthandwelfare.idaho.gov',
        submitInstructions: 'Apply through your local district health department in Idaho for a Food Establishment permit. Idaho has seven district health departments that issue food permits. A pre-opening inspection is required.',
      },
      MT: {
        submitUrl: 'https://dphhs.mt.gov',
        submitInstructions: 'Apply through the Montana Department of Public Health and Human Services at dphhs.mt.gov or your local county health department for a Food Service Establishment permit. A pre-opening inspection is required.',
      },
      HI: {
        submitUrl: 'https://health.hawaii.gov',
        submitInstructions: 'Apply through the Hawaii Department of Health at health.hawaii.gov for a Food Establishment Permit. Each county in Hawaii (Honolulu, Maui, Hawaii, Kauai) has its own permit requirements. A pre-opening inspection is required.',
      },
      AK: {
        submitUrl: 'https://health.alaska.gov',
        submitInstructions: 'Apply through the Alaska Department of Health at health.alaska.gov for a Food Establishment permit. A pre-opening inspection is required. Alaska has limited local health authorities, so most permits are issued at the state level.',
      },
      ND: {
        submitUrl: 'https://www.hhs.nd.gov',
        submitInstructions: 'Apply through the North Dakota Department of Health and Human Services at hhs.nd.gov for a Food Establishment license. A pre-opening inspection is required.',
      },
      SD: {
        submitUrl: 'https://doh.sd.gov',
        submitInstructions: 'Apply through the South Dakota Department of Health at doh.sd.gov for a Food Service Establishment license. A pre-opening inspection is required.',
      },
      WY: {
        submitUrl: 'https://health.wyo.gov',
        submitInstructions: 'Apply through the Wyoming Department of Health at health.wyo.gov or your local county health department for a Food Establishment license. A pre-opening inspection is required.',
      },
      WV: {
        submitUrl: 'https://dhhr.wv.gov',
        submitInstructions: 'Apply through the West Virginia Department of Health and Human Resources at dhhr.wv.gov for a Food Establishment permit. A pre-opening inspection is required.',
      },
      DE: {
        submitUrl: 'https://dhss.delaware.gov/dph',
        submitInstructions: 'Apply through the Delaware Division of Public Health at dhss.delaware.gov/dph for a Food Establishment permit. A pre-opening inspection is required.',
      },
      NH: {
        submitUrl: 'https://www.dhhs.nh.gov',
        submitInstructions: 'Apply through the New Hampshire Department of Health and Human Services at dhhs.nh.gov for a Food Service License. A pre-opening inspection is required.',
      },
      ME: {
        submitUrl: 'https://www.maine.gov/dhhs',
        submitInstructions: 'Apply through the Maine Center for Disease Control at maine.gov/dhhs for a Food Establishment License. A pre-opening inspection is required.',
      },
      VT: {
        submitUrl: 'https://www.healthvermont.gov',
        submitInstructions: 'Apply through the Vermont Department of Health at healthvermont.gov for a Food Service Establishment permit. A pre-opening inspection is required.',
      },
      RI: {
        submitUrl: 'https://health.ri.gov',
        submitInstructions: 'Apply through the Rhode Island Department of Health at health.ri.gov for a Food Service Establishment permit. A pre-opening inspection is required.',
      },
    },
  },

  // ── Sales Tax Registration ────────────────────────────────────────────────

  'sales-tax-registration': {
    id: 'sales-tax-registration',
    defaultRenewalMonths: null, // Sales tax permit is permanent; no renewal required
    name: 'State Sales Tax Registration',
    description:
      'Required in most US states when selling taxable goods or services. ' +
      'Known as "Seller\'s Permit" (CA), "Sales Tax Permit" (TX), "Certificate of Authority" (NY, NJ), ' +
      'or "Sales Tax Registration" depending on your state. ' +
      'Five states have no state sales tax: AK, DE, MT, NH, OR.',
    fee: 'Free (most states)',
    submitUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    submitPortalUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    submitInstructions:
      'Register online with your state revenue or tax department. ' +
      'Most states issue your certificate within 1–10 business days of online registration.',
    requiredDocs: [
      'Federal EIN or SSN',
      'State business registration or Articles of Organization',
      'Description of business activities and products/services sold',
      'Bank account information (for electronic tax payments)',
    ],
    fields: [
      { id: 'businessLegalName',     label: 'Business Legal Name',                  type: 'text',   placeholder: 'As registered with your state', required: true  },
      { id: 'dbaName',               label: 'DBA / Trade Name (if different)',      type: 'text',   placeholder: 'Leave blank if same',            required: false },
      { id: 'ownerName',             label: 'Owner / Responsible Officer Name',     type: 'text',   placeholder: 'Full legal name',                required: true  },
      { id: 'fein',                  label: 'Federal EIN',                          type: 'text',   placeholder: 'XX-XXXXXXX',                     required: true  },
      { id: 'businessAddress',       label: 'Principal Business Location',          type: 'address',placeholder: '123 Main St, City, State ZIP',   required: true  },
      { id: 'mailingAddress',        label: 'Mailing Address (if different)',       type: 'address',placeholder: 'Leave blank if same',            required: false },
      { id: 'registrationState',     label: 'State Where You Are Registering',      type: 'text',   placeholder: 'e.g., Connecticut',              required: true  },
      { id: 'businessStartDate',     label: 'Date Business Began in This State',    type: 'date',   required: true  },
      { id: 'businessType',          label: 'Primary Business Activity',            type: 'select', options: ['Retail Sales', 'Food & Beverage Service', 'Services (taxable)', 'Rental of Tangible Personal Property', 'Rental of Real Property', 'Online / E-Commerce', 'Wholesale', 'Manufacturing', 'Other'], required: true },
      { id: 'estimatedMonthlySales', label: 'Estimated Monthly Taxable Sales',      type: 'select', options: ['Less than $500/month', '$500–$2,000/month', '$2,000–$10,000/month', 'More than $10,000/month'], hint: 'Determines your filing frequency in most states', required: true },
    ],
    localeUrls: {
      // ── States with detailed field overrides ──
      FL: {
        submitUrl: 'https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx',
        submitPortalUrl: 'https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx',
        officialFormNumber: 'Form DR-1',
        submitInstructions: 'Register online through the Florida Department of Revenue (Form DR-1 — Florida Business Tax Application) at floridarevenue.com. No filing fee. Approved within 1–5 business days. You will receive a Certificate of Registration (DR-11) and Annual Resale Certificate.',
        fields: [
          { id: 'businessLegalName',     label: 'Business Legal Name',                       type: 'text',    placeholder: 'As registered with Florida Division of Corporations', required: true,  officialFieldName: 'DR-1 Section A: Legal name of business' },
          { id: 'dbaName',               label: 'DBA / Trade Name (if different)',           type: 'text',    placeholder: 'Leave blank if same',                                 required: false, officialFieldName: 'DR-1 Section A: Trade name (doing business as)' },
          { id: 'ownerName',             label: 'Owner / Officer / Partner Name',            type: 'text',    placeholder: 'Full legal name',                                     required: true,  officialFieldName: 'DR-1 Section B: Name of owner / officer / partner' },
          { id: 'ownerTitle',            label: 'Owner Title',                               type: 'select',  options: ['Owner / Sole Proprietor', 'President', 'Vice President', 'Managing Member', 'Partner', 'Trustee', 'Other Officer'], required: true, officialFieldName: 'DR-1 Section B: Title' },
          { id: 'ownerSSNorFEIN',        label: 'Owner SSN or Federal EIN',                 type: 'text',    placeholder: 'XXX-XX-XXXX or XX-XXXXXXX',                           required: true,  officialFieldName: 'DR-1 Section B: Social Security Number or FEIN' },
          { id: 'fein',                  label: 'Business Federal EIN (FEIN)',               type: 'text',    placeholder: 'XX-XXXXXXX',                                         required: true,  officialFieldName: 'DR-1 Section A: Federal Employer Identification Number (FEIN)' },
          { id: 'businessAddress',       label: 'Principal Florida Business Address',        type: 'address', placeholder: '123 Main St, City, FL ZIP',                          required: true,  officialFieldName: 'DR-1 Section A: Location address (Florida physical address required)' },
          { id: 'mailingAddress',        label: 'Mailing Address (if different)',            type: 'address', placeholder: 'Leave blank if same',                                required: false, officialFieldName: 'DR-1 Section A: Mailing address' },
          { id: 'countyOfBusiness',      label: 'Florida County of Principal Business Location', type: 'text', placeholder: 'e.g., Palm Beach',                                required: true,  officialFieldName: 'DR-1 Section A: County' },
          { id: 'businessStartDate',     label: 'Date Business Began (or Will Begin) in Florida', type: 'date', required: true,                                                officialFieldName: 'DR-1 Section A: Date you began (or will begin) business in Florida' },
          { id: 'businessType',          label: 'Primary Business Activity',                type: 'select',  options: ['Retail Sales', 'Food & Beverage Service', 'Services (taxable)', 'Rental of Tangible Personal Property', 'Rental of Real Property', 'Online / E-Commerce', 'Wholesale', 'Manufacturing', 'Other'], required: true, officialFieldName: 'DR-1 Section A: Description of business activity' },
          { id: 'sellsTangibleGoods',    label: 'Do you sell taxable tangible personal property?', type: 'checkbox', required: true,                                            officialFieldName: 'DR-1 Section C: Sales and use tax — sells tangible personal property' },
          { id: 'estimatedMonthlySales', label: 'Estimated Monthly Florida Taxable Sales',  type: 'select',  options: ['Less than $500/month', '$500–$2,000/month', '$2,000–$10,000/month', 'More than $10,000/month'], hint: 'Determines your filing frequency (monthly, quarterly, or semi-annual)', required: true, officialFieldName: 'DR-1 Section C: Estimated monthly sales subject to tax' },
        ],
      },
      TX: {
        submitUrl: 'https://comptroller.texas.gov',
        submitPortalUrl: 'https://comptroller.texas.gov/taxes/permit/',
        officialFormNumber: 'Form AP-201',
        submitInstructions: 'Register online through the Texas Comptroller\'s Office for a Sales and Use Tax Permit (Form AP-201) at comptroller.texas.gov. No filing fee. Permit issued immediately upon online registration.',
        fields: [
          { id: 'businessLegalName',     label: 'Legal Name of Business',                   type: 'text',    placeholder: 'As registered with the Texas Secretary of State',     required: true,  officialFieldName: 'AP-201 Item 1: Legal name of business' },
          { id: 'dbaName',               label: 'Trade Name / DBA (if different)',          type: 'text',    placeholder: 'Leave blank if same',                                 required: false, officialFieldName: 'AP-201 Item 2: Trade name (DBA)' },
          { id: 'ownerName',             label: 'Owner / Officer / Member Name',            type: 'text',    placeholder: 'Full legal name',                                     required: true,  officialFieldName: 'AP-201 Item 4: Name of owner / officer / managing member' },
          { id: 'ownerTitle',            label: 'Owner Title',                              type: 'select',  options: ['Owner / Sole Proprietor', 'President', 'Vice President', 'Managing Member', 'General Partner', 'Other Officer'], required: true, officialFieldName: 'AP-201 Item 4: Title' },
          { id: 'fein',                  label: 'Federal Employer Identification Number',   type: 'text',    placeholder: 'XX-XXXXXXX',                                         required: true,  officialFieldName: 'AP-201 Item 3: Federal Employer Identification Number' },
          { id: 'businessAddress',       label: 'Principal Texas Business Address',         type: 'address', placeholder: '123 Main St, City, TX ZIP',                          required: true,  officialFieldName: 'AP-201 Item 6: Physical business location in Texas' },
          { id: 'mailingAddress',        label: 'Mailing Address (if different)',           type: 'address', placeholder: 'Leave blank if same',                                required: false, officialFieldName: 'AP-201 Item 5: Mailing address' },
          { id: 'businessStartDate',     label: 'Date Business Began Making Sales in Texas', type: 'date',  required: true,                                                     officialFieldName: 'AP-201 Item 9: Date you began (or will begin) making sales in Texas' },
          { id: 'businessType',          label: 'Primary Business Activity',               type: 'select',  options: ['Retail Sales', 'Food & Beverage Service', 'Services (taxable)', 'Rental of Tangible Personal Property', 'Rental of Real Property', 'Online / E-Commerce', 'Wholesale', 'Manufacturing', 'Other'], required: true, officialFieldName: 'AP-201 Item 8: Description of business activity' },
          { id: 'sellsFood',             label: 'Do you sell food or beverages that are taxable in Texas?', type: 'checkbox', required: true,                                  officialFieldName: 'AP-201 Item 10: Check all that apply — food and food products' },
          { id: 'estimatedMonthlySales', label: 'Estimated Monthly Texas Taxable Sales',   type: 'select',  options: ['Less than $500/month', '$500–$2,000/month', '$2,000–$10,000/month', 'More than $10,000/month'], hint: 'Determines filing frequency (monthly or quarterly)', required: true, officialFieldName: 'AP-201 Item 11: Estimated monthly Texas taxable sales' },
        ],
      },
      CA: {
        submitUrl: 'https://www.cdtfa.ca.gov',
        submitPortalUrl: 'https://www.cdtfa.ca.gov/services/',
        officialFormNumber: 'CDTFA-400-A',
        submitInstructions: 'Register online through the California CDTFA for a Seller\'s Permit (CDTFA-400-A) at cdtfa.ca.gov. No filing fee. Permit issued immediately. A security deposit may be required for some business types.',
      },
      NY: {
        submitUrl: 'https://www.tax.ny.gov',
        submitPortalUrl: 'https://www.tax.ny.gov/bus/ads/dtf17.htm',
        officialFormNumber: 'Form DTF-17',
        submitInstructions: 'File Form DTF-17 (Certificate of Authority) online through the New York State Department of Taxation and Finance at tax.ny.gov. No filing fee. Processing takes 5–10 business days. You must receive your Certificate of Authority before making your first taxable sale in New York.',
      },
      IL: {
        submitUrl: 'https://tax.illinois.gov',
        submitPortalUrl: 'https://tax.illinois.gov/businesses/registration.html',
        officialFormNumber: 'Form REG-1',
        submitInstructions: 'Register online through the Illinois Department of Revenue (Form REG-1 — Illinois Business Registration Application) at tax.illinois.gov. No filing fee. Processing takes 5–7 business days. You will receive an Illinois Business Tax (IBT) number.',
      },
      GA: {
        submitUrl: 'https://gtc.dor.georgia.gov',
        submitPortalUrl: 'https://gtc.dor.georgia.gov',
        submitInstructions: 'Register online through the Georgia Tax Center at gtc.dor.georgia.gov. No filing fee. Processing typically takes 2–5 business days.',
      },
      // ── All remaining taxing states ──
      AL: { submitUrl: 'https://myalabamataxes.alabama.gov', officialFormNumber: 'My Alabama Taxes Online Registration', submitInstructions: 'Register online through the Alabama Department of Revenue at myalabamataxes.alabama.gov. No filing fee. Processing takes 5–7 business days. Alabama levies both state (4%) and local sales taxes.' },
      AZ: { submitUrl: 'https://azdor.gov', officialFormNumber: 'Arizona Joint Tax Application (JT-1)', submitInstructions: 'Register online through the Arizona Department of Revenue at azdor.gov using the Joint Tax Application (JT-1). No filing fee. Arizona taxes Transaction Privilege Tax (TPT), not traditional sales tax. Processing takes 5–10 business days.' },
      AR: { submitUrl: 'https://atap.arkansas.gov', officialFormNumber: 'Arkansas Business Tax Online Registration', submitInstructions: 'Register online through the Arkansas Taxpayer Access Point at atap.arkansas.gov. No filing fee. Processing takes 3–5 business days.' },
      CO: { submitUrl: 'https://mycoloradotaxes.colorado.gov', officialFormNumber: 'Colorado Sales Tax License', submitInstructions: 'Register online through the Colorado Department of Revenue at mycoloradotaxes.colorado.gov. Filing fee: $16. Processing takes 1–3 business days. Colorado has complex home-rule city sales tax requirements — many cities administer their own sales tax separately.' },
      CT: { submitUrl: 'https://portal.ct.gov/drs', officialFormNumber: 'CT Sales Tax Permit', submitInstructions: 'Register online through the Connecticut Department of Revenue Services at portal.ct.gov/drs. No filing fee. Processing takes 1–5 business days.' },
      HI: { submitUrl: 'https://hitax.hawaii.gov', officialFormNumber: 'Hawaii General Excise Tax License (Form BB-1)', submitInstructions: 'Register for a General Excise Tax (GET) license (Form BB-1) online at hitax.hawaii.gov. Hawaii does not have a traditional sales tax — the GET is assessed on the business (not the customer) at 4% statewide (4.5% in Honolulu). Filing fee: $20.' },
      ID: { submitUrl: 'https://tax.idaho.gov', officialFormNumber: 'Idaho Seller\'s Permit', submitInstructions: 'Register online through the Idaho State Tax Commission at tax.idaho.gov. No filing fee. Processing takes 1–3 business days.' },
      IN: { submitUrl: 'https://inbiz.in.gov', officialFormNumber: 'Indiana Retail Merchant Certificate (Form BT-1)', submitInstructions: 'Register for a Retail Merchant Certificate (Form BT-1) online through the Indiana INBiz portal at inbiz.in.gov. No filing fee. Processing takes 1–5 business days.' },
      IA: { submitUrl: 'https://tax.iowa.gov', officialFormNumber: 'Iowa Sales Tax Permit', submitInstructions: 'Register online through the Iowa Department of Revenue at tax.iowa.gov. No filing fee. Processing takes 1–5 business days.' },
      KS: { submitUrl: 'https://www.kdor.ks.gov', officialFormNumber: 'Kansas Retailer\'s Sales Tax Registration', submitInstructions: 'Register online through the Kansas Department of Revenue at kdor.ks.gov. No filing fee. Processing takes 3–5 business days.' },
      KY: { submitUrl: 'https://revenue.ky.gov', officialFormNumber: 'Kentucky Sales and Use Tax Permit', submitInstructions: 'Register online through the Kentucky Department of Revenue at revenue.ky.gov. No filing fee. Processing takes 3–5 business days.' },
      LA: { submitUrl: 'https://latap.louisiana.gov', officialFormNumber: 'Louisiana Sales Tax Registration', submitInstructions: 'Register online through the Louisiana Taxpayer Access Point at latap.louisiana.gov. No filing fee. Louisiana also has parish (county) and municipal sales taxes — check local requirements separately. Processing takes 3–7 business days.' },
      ME: { submitUrl: 'https://www.maine.gov/revenue', officialFormNumber: 'Maine Sales Tax Registration', submitInstructions: 'Register online through the Maine Revenue Services at maine.gov/revenue. No filing fee. Processing takes 3–5 business days.' },
      MD: { submitUrl: 'https://interactive.marylandtaxes.gov', officialFormNumber: 'Maryland Combined Registration Application (Form CRR)', submitInstructions: 'Register online through the Maryland Comptroller\'s Office (Form CRR) at interactive.marylandtaxes.gov. No filing fee. Maryland has a single 6% sales tax rate. Processing takes 3–7 business days.' },
      MA: { submitUrl: 'https://dor.mass.gov', officialFormNumber: 'Massachusetts Sales Tax Registration', submitInstructions: 'Register online through the Massachusetts Department of Revenue at dor.mass.gov (MassTaxConnect). No filing fee. Processing takes 1–5 business days.' },
      MI: { submitUrl: 'https://michigan.gov/taxes', officialFormNumber: 'Michigan Sales Tax License', submitInstructions: 'Register online through the Michigan Department of Treasury at michigan.gov/taxes. No filing fee. Processing takes 3–5 business days.' },
      MN: { submitUrl: 'https://www.mndor.state.mn.us', officialFormNumber: 'Minnesota Sales Tax Registration', submitInstructions: 'Register online through the Minnesota Department of Revenue e-Services portal at mndor.state.mn.us. No filing fee. Processing takes 3–5 business days.' },
      MS: { submitUrl: 'https://tap.dor.ms.gov', officialFormNumber: 'Mississippi Sales Tax Permit', submitInstructions: 'Register online through the Mississippi Department of Revenue Taxpayer Access Point at tap.dor.ms.gov. No filing fee. Processing takes 3–5 business days.' },
      MO: { submitUrl: 'https://dor.mo.gov', officialFormNumber: 'Missouri Retail Sales License', submitInstructions: 'Register online through the Missouri Department of Revenue at dor.mo.gov. No filing fee. Processing takes 5–10 business days.' },
      NE: { submitUrl: 'https://revenue.nebraska.gov', officialFormNumber: 'Nebraska Sales Tax Permit', submitInstructions: 'Register online through the Nebraska Department of Revenue at revenue.nebraska.gov. No filing fee. Processing takes 3–5 business days.' },
      NV: { submitUrl: 'https://nevadatax.nv.gov', officialFormNumber: 'Nevada Seller\'s Permit', submitInstructions: 'Register online through the Nevada Department of Taxation at nevadatax.nv.gov. No filing fee. Processing takes 3–5 business days.' },
      NJ: { submitUrl: 'https://www.njportal.com/dor/businessregistration', officialFormNumber: 'NJ Certificate of Authority (Form REG-1E)', submitInstructions: 'Register online through the New Jersey Division of Revenue at njportal.com. No filing fee. Processing takes 5–10 business days. A Certificate of Authority is required before making any taxable sales.' },
      NM: { submitUrl: 'https://tap.state.nm.us', officialFormNumber: 'New Mexico Combined Reporting System (CRS) Registration', submitInstructions: 'Register online through the New Mexico Taxation and Revenue Taxpayer Access Point at tap.state.nm.us. No filing fee. New Mexico taxes Gross Receipts Tax (GRT), not a traditional sales tax. Processing takes 3–5 business days.' },
      NC: { submitUrl: 'https://www.ncdor.gov', officialFormNumber: 'North Carolina Certificate of Registration', submitInstructions: 'Register online through the North Carolina Department of Revenue at ncdor.gov. No filing fee. Processing takes 3–5 business days.' },
      ND: { submitUrl: 'https://apps.nd.gov/tax', officialFormNumber: 'North Dakota Sales Tax Permit', submitInstructions: 'Register online through the North Dakota Office of State Tax Commissioner at apps.nd.gov/tax. No filing fee. Processing takes 3–5 business days.' },
      OH: { submitUrl: 'https://tax.ohio.gov', officialFormNumber: 'Ohio Vendor\'s License', submitInstructions: 'Register online through the Ohio Department of Taxation at tax.ohio.gov. Filing fee: $25. Processing takes 3–5 business days.' },
      OK: { submitUrl: 'https://oktap.tax.ok.gov', officialFormNumber: 'Oklahoma Sales Tax Permit', submitInstructions: 'Register online through the Oklahoma Tax Commission at oktap.tax.ok.gov. No filing fee. Processing takes 3–7 business days.' },
      PA: { submitUrl: 'https://mypath.pa.gov', officialFormNumber: 'Pennsylvania Sales Tax License', submitInstructions: 'Register online through the Pennsylvania Department of Revenue (myPATH) at mypath.pa.gov. No filing fee. Processing takes 1–5 business days.' },
      RI: { submitUrl: 'https://www.ri.gov/taxation', officialFormNumber: 'Rhode Island Sales Tax Permit', submitInstructions: 'Register online through the Rhode Island Division of Taxation at ri.gov/taxation. No filing fee. Processing takes 3–5 business days.' },
      SC: { submitUrl: 'https://dor.sc.gov', officialFormNumber: 'South Carolina Retail License (SCTC-111)', submitInstructions: 'Register online through the South Carolina Department of Revenue at dor.sc.gov. Filing fee: $50. Processing takes 3–5 business days.' },
      SD: { submitUrl: 'https://dor.sd.gov', officialFormNumber: 'South Dakota Sales Tax License', submitInstructions: 'Register online through the South Dakota Department of Revenue at dor.sd.gov. No filing fee. Processing takes 3–5 business days.' },
      TN: { submitUrl: 'https://tntap.tn.gov', officialFormNumber: 'Tennessee Sales and Use Tax Certificate of Registration', submitInstructions: 'Register online through the Tennessee Taxpayer Access Point (TNTAP) at tntap.tn.gov. No filing fee. Processing takes 3–5 business days.' },
      UT: { submitUrl: 'https://tap.utah.gov', officialFormNumber: 'Utah Sales Tax License', submitInstructions: 'Register online through the Utah State Tax Commission Taxpayer Access Point at tap.utah.gov. No filing fee. Processing takes 1–3 business days.' },
      VT: { submitUrl: 'https://tax.vermont.gov', officialFormNumber: 'Vermont Sales Tax Registration', submitInstructions: 'Register online through the Vermont Department of Taxes at tax.vermont.gov. No filing fee. Processing takes 3–5 business days.' },
      VA: { submitUrl: 'https://www.tax.virginia.gov', officialFormNumber: 'Virginia Retail Sales Tax Certificate of Registration', submitInstructions: 'Register online through the Virginia Department of Taxation at tax.virginia.gov. No filing fee. Processing takes 3–5 business days.' },
      WA: { submitUrl: 'https://dor.wa.gov', submitPortalUrl: 'https://dor.wa.gov/open-business/apply-business-license', officialFormNumber: 'Washington Business License Application', submitInstructions: 'Register through the Washington Department of Revenue at dor.wa.gov. Washington issues a single Business License that covers sales tax registration — no separate sales tax permit required. Filing fee: $19 (Business License). Processing takes 1–3 business days.' },
      WV: { submitUrl: 'https://mytaxes.wv.gov', officialFormNumber: 'West Virginia Business Registration', submitInstructions: 'Register online through the West Virginia Tax Division at mytaxes.wv.gov. Filing fee: $30 (annual). Processing takes 1–5 business days.' },
      WI: { submitUrl: 'https://tap.revenue.wi.gov', officialFormNumber: 'Wisconsin Seller\'s Permit', submitInstructions: 'Register online through the Wisconsin Department of Revenue Taxpayer Access Point at tap.revenue.wi.gov. No filing fee. Processing takes 1–3 business days.' },
      WY: { submitUrl: 'https://wyomingbusiness.wy.gov', officialFormNumber: 'Wyoming Sales Tax License', submitInstructions: 'Register online through the Wyoming Department of Revenue at wyomingbusiness.wy.gov. No filing fee. Processing takes 3–5 business days.' },
      DC: { submitUrl: 'https://otr.cfo.dc.gov', officialFormNumber: 'DC Certificate of Registration', submitInstructions: 'Register online through the DC Office of Tax and Revenue at otr.cfo.dc.gov. No filing fee. Processing takes 3–7 business days.' },
    },
  },

  // ── Home Occupation Permit ────────────────────────────────────────────────

  'home-occupation-permit': {
    id: 'home-occupation-permit',
    defaultRenewalMonths: 12, // Most cities/counties require annual renewal
    name: 'Home Occupation / Home Business Permit',
    description:
      'Required by most US cities and counties when operating any commercial business activity from a ' +
      'residential address. Ensures the business activity is compatible with residential zoning.',
    fee: '$25–$150 (varies by municipality)',
    submitUrl: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    submitInstructions:
      'Submit your application to your city or county Planning, Zoning, or Community Development office. ' +
      'Search "[your city] home occupation permit" or "[your county] home business zoning permit" to find the local form. ' +
      'Processing takes 5–15 business days. Some municipalities require a zoning inspection.',
    requiredDocs: [
      'Proof of residency (lease or property deed)',
      'Government-issued photo ID',
      'Description of all business activities to be conducted at the residence',
      'Floor plan showing the area used for business (some jurisdictions)',
    ],
    fields: [
      { id: 'applicantName',       label: 'Applicant Full Name',                              type: 'text',   placeholder: 'Full legal name',                             required: true  },
      { id: 'homeAddress',         label: 'Home / Business Address',                          type: 'address',placeholder: '123 Main St, City, State ZIP',                required: true  },
      { id: 'applicantPhone',      label: 'Phone Number',                                     type: 'phone',  placeholder: '(555) 555-0100',                              required: true  },
      { id: 'applicantEmail',      label: 'Email Address',                                    type: 'email',  placeholder: 'you@email.com',                               required: true  },
      { id: 'businessName',        label: 'Business Name',                                    type: 'text',   placeholder: 'Your business name',                          required: true  },
      { id: 'businessDescription', label: 'Description of Business Activity',                 type: 'text',   placeholder: 'What products or services do you provide?',   required: true  },
      { id: 'ownershipStatus',     label: 'Do You Own or Rent This Property?',                type: 'select', options: ['Own', 'Rent / Lease'],                           required: true  },
      { id: 'customersAtHome',     label: 'Will customers or clients visit your home?',       type: 'select', options: ['No — all work done remotely', 'Yes — by appointment only (1–2 at a time)', 'Yes — regularly throughout the day'], required: true },
      { id: 'employeesAtHome',     label: 'Will non-resident employees work at this address?',type: 'select', options: ['No', 'Yes — 1 person', 'Yes — more than 1'],      required: true  },
      { id: 'squareFootageUsed',   label: 'Square Footage Dedicated to Business Use',        type: 'text',   placeholder: 'e.g., 150 sq ft home office',                 required: true  },
      { id: 'externalSignage',     label: 'Do you plan to post any exterior business signage?', type: 'select', options: ['No', 'Yes — small nameplate only', 'Yes — illuminated or large sign'], required: true },
    ],
    // Home occupation permits are always issued by the local planning/zoning authority.
    // localeUrls for states with a useful state-level resource; countyUrls for major counties.
    localeUrls: {
      WA: {
        submitUrl: 'https://dor.wa.gov/open-business/apply-business-license',
        submitPortalUrl: 'https://dor.wa.gov/open-business/apply-business-license',
        submitInstructions: 'In Washington, home occupation permits are handled by your city or county planning department. The WA Department of Revenue Business Licensing Service at dor.wa.gov can help identify local requirements. Search "[your city] home occupation permit" for your local planning department portal.',
      },
      DC: {
        submitUrl: 'https://dcbiz.dc.gov',
        submitPortalUrl: 'https://dcbiz.dc.gov',
        submitInstructions: 'In Washington DC, home-based businesses require a Home Occupation Permit from the DC Office of Zoning as well as a Basic Business License. Apply through dcbiz.dc.gov.',
      },
    },
    countyUrls: {
      // ── Florida — home occupation permits are city/county zoning level ──
      'Palm Beach County': {
        submitUrl: 'https://pbcgov.org',
        submitPortalUrl: 'https://pbcgov.org',
        submitInstructions: 'In unincorporated Palm Beach County, home occupation permits are issued by the Palm Beach County Planning, Zoning and Building department at pbcgov.org. If your home is inside a city or town, contact that city\'s planning department instead.',
      },
      'Miami-Dade County': {
        submitUrl: 'https://miamidade.gov',
        submitPortalUrl: 'https://miamidade.gov',
        submitInstructions: 'In unincorporated Miami-Dade County, home occupation permits are issued by Miami-Dade County Regulatory and Economic Resources (RER) at miamidade.gov. If your home is within a municipality, contact that city\'s planning or zoning department.',
      },
      'Broward County': {
        submitUrl: 'https://broward.org',
        submitPortalUrl: 'https://broward.org',
        submitInstructions: 'In unincorporated Broward County, home occupation permits are handled by the Broward County Planning and Development Management Division at broward.org. Incorporated cities in Broward each have their own zoning process.',
      },
      'Hillsborough County': {
        submitUrl: 'https://hillsboroughcounty.org',
        submitPortalUrl: 'https://hillsboroughcounty.org',
        submitInstructions: 'In unincorporated Hillsborough County, home occupation permits are issued by the Hillsborough County Development Services Department at hillsboroughcounty.org. For homes within Tampa, Temple Terrace, or Plant City, contact the respective city planning department.',
      },
      'Orange County': {
        submitUrl: 'https://orangecountyfl.net',
        submitPortalUrl: 'https://orangecountyfl.net',
        submitInstructions: 'In unincorporated Orange County, home occupation permits are issued by Orange County Zoning at orangecountyfl.net. For homes within Orlando or another city, contact that city\'s planning department.',
      },
      'Pinellas County': {
        submitUrl: 'https://pinellascounty.org',
        submitPortalUrl: 'https://pinellascounty.org',
        submitInstructions: 'In unincorporated Pinellas County, home occupation permits are issued by Pinellas County Planning at pinellascounty.org. For homes inside Clearwater, St. Petersburg, or other cities, contact that city\'s planning/zoning department.',
      },
      // ── New York City ──
      'New York County': {
        submitUrl: 'https://nyc.gov',
        submitPortalUrl: 'https://nyc.gov',
        submitInstructions: 'In New York City, home-based businesses are regulated by the NYC Department of Buildings (DOB) and may require a Certificate of Occupancy amendment for home occupation use. Check requirements at nyc.gov. Most home-based professional services are permitted without a special permit.',
      },
      'Kings County': {
        submitUrl: 'https://nyc.gov',
        submitPortalUrl: 'https://nyc.gov',
        submitInstructions: 'In Brooklyn (Kings County), home-based businesses are regulated by the NYC Department of Buildings. Check home occupation zoning requirements at nyc.gov.',
      },
      'Queens County': {
        submitUrl: 'https://nyc.gov',
        submitPortalUrl: 'https://nyc.gov',
        submitInstructions: 'In Queens, home-based businesses are regulated by the NYC Department of Buildings. Check home occupation zoning requirements at nyc.gov.',
      },
      // ── Georgia — Fulton County / Atlanta ──
      'Fulton County': {
        submitUrl: 'https://fultoncountyga.gov',
        submitPortalUrl: 'https://fultoncountyga.gov',
        submitInstructions: 'In unincorporated Fulton County, home occupation permits are issued by the Fulton County Department of Planning and Community Services at fultoncountyga.gov. For homes inside Atlanta or other cities, contact that city\'s planning/zoning department.',
      },
      // ── Washington — King County ──
      'King County': {
        submitUrl: 'https://dor.wa.gov/open-business/apply-business-license',
        submitPortalUrl: 'https://dor.wa.gov/open-business/apply-business-license',
        submitInstructions: 'In King County, home occupation permits are issued by your city (Seattle, Bellevue, etc.) or by King County for unincorporated areas. The WA Business Licensing Service at dor.wa.gov can help identify requirements.',
      },
    },
  },

};

/**
 * A lightweight reference entry for common state and local forms.
 * Mirrors FederalFormEntry but uses category 'state' | 'local' and allows
 * pdfPath: null because most state forms are filed online with no blank PDF.
 */
export interface StateFormEntry {
  id: string;
  name: string;
  category: 'state' | 'local';
  description: string;
  /** Canonical URL on the state/local agency website, or sba.gov as fallback. */
  officialUrl: string;
  /**
   * Path to a locally cached blank PDF in /public, or null when the form is
   * online-only (most state forms).
   */
  pdfPath: string | null;
  isDownloadable: boolean;
  /** Renewal interval in months, or null for one-time filings. */
  renewalMonths: number | null;
  commonFor: string[];
  /**
   * Optional map of county/city names to their specific official URLs.
   * Used by LOCAL_FORMS entries that cover multiple jurisdictions or have
   * county-tax-collector URLs distinct from the county government root domain.
   */
  countyUrls?: Record<string, string>;
}

// ── Federal Forms Library ─────────────────────────────────────────────────────
// These are the most common federal compliance forms stored locally in public/forms/federal/
// They are referenced as FederalFormEntry objects (lightweight metadata + download links)
// rather than as full FormTemplate objects, since they are filed directly with federal
// agencies rather than completed through the RegBot guided wizard.

export const FEDERAL_FORMS: FederalFormEntry[] = [

  // ── IRS Form SS-4 — EIN Application ──────────────────────────────────────
  {
    id:           'ein-application',
    name:         'IRS EIN Application (Form SS-4)',
    category:     'federal',
    description:
      'Obtain a Federal Employer Identification Number (EIN) from the IRS. ' +
      'Required for opening a business bank account, hiring employees, paying federal ' +
      'taxes, and filing most business returns. Apply free online at IRS.gov in minutes.',
    officialUrl:  'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
    pdfPath:      '/forms/federal/ss-4.pdf',
    isDownloadable: true,   // PDF version available for mail/fax submission
    renewalMonths:  null,   // EINs are permanent — they never expire
    commonFor:    ['all'],
  },

  // ── USCIS Form I-9 — Employment Eligibility Verification ─────────────────
  {
    id:           'i-9',
    name:         'Employment Eligibility Verification (Form I-9)',
    category:     'federal',
    description:
      'Required for every employee hired in the United States regardless of citizenship. ' +
      'Verifies the identity and work authorization of new hires. ' +
      'Employers must complete Section 2 within 3 business days of the employee\'s start date ' +
      'and retain completed forms for 3 years after hire or 1 year after termination, whichever is later.',
    officialUrl:  'https://www.uscis.gov/i-9',
    pdfPath:      '/forms/federal/i-9.pdf',
    isDownloadable: true,   // Printable PDF available; remote hire e-verify alternative also available
    renewalMonths:  null,   // Completed per employee — no periodic renewal; re-verify when work auth expires
    commonFor:    ['all'],  // Required any time a business hires an employee
  },

  // ── FinCEN BOI Report — Beneficial Ownership Information ─────────────────
  {
    id:           'boi-report',
    name:         'Beneficial Ownership Information Report (BOI)',
    category:     'federal',
    description:
      'Required under the Corporate Transparency Act for most LLCs, corporations, and similar ' +
      'entities formed or registered in the US. Reports the beneficial owners — individuals ' +
      'with substantial control or at least 25% ownership — to the Financial Crimes Enforcement ' +
      'Network (FinCEN). Businesses formed before Jan 1, 2024 must file by Jan 1, 2025; ' +
      'new businesses must file within 90 days of formation. Updates required within 30 days of changes.',
    officialUrl:  'https://boiefiling.fincen.gov',
    pdfPath:      '',       // Online-only filing — no downloadable PDF form
    isDownloadable: false,
    renewalMonths:  null,   // One-time filing; updates required within 30 days of any ownership change
    commonFor:    ['all'],  // Applies to most LLCs, corporations, and similar entities
  },

  // ── IRS Form W-4 — Employee's Withholding Certificate ────────────────────
  {
    id:           'w-4',
    name:         "Employee's Withholding Certificate (Form W-4)",
    category:     'federal',
    description:
      "Completed by every new employee so the employer knows how much federal income tax to " +
      "withhold from each paycheck. Employees submit a new W-4 whenever their tax situation " +
      "changes (marriage, new dependent, second job, etc.). Employers are not required to submit " +
      "W-4 forms to the IRS but must retain them for at least 4 years. The 2020 redesign replaced " +
      "withholding allowances with a dollar-based system.",
    officialUrl:  'https://www.irs.gov/forms-pubs/about-form-w-4',
    pdfPath:      '/forms/federal/w-4.pdf',
    isDownloadable: true,
    renewalMonths:  null,   // Completed per employee at hire; updated voluntarily by employee
    commonFor:    ['all'],  // Required for every employee hired
  },

  // ── IRS Form W-9 — Request for Taxpayer Identification Number ────────────
  {
    id:           'w-9',
    name:         'Request for Taxpayer Identification Number (Form W-9)',
    category:     'federal',
    description:
      'Collected from independent contractors, freelancers, and vendors before paying them $600 ' +
      'or more in a calendar year. The W-9 provides the payee\'s name, address, and Taxpayer ' +
      'Identification Number (SSN or EIN) so the payer can issue a Form 1099-NEC at year-end. ' +
      'Businesses must retain completed W-9s for 4 years. Failure to collect one may require ' +
      '24% backup withholding on payments.',
    officialUrl:  'https://www.irs.gov/forms-pubs/about-form-w-9',
    pdfPath:      '/forms/federal/w-9.pdf',
    isDownloadable: true,
    renewalMonths:  null,   // Collected per contractor; no periodic renewal required
    commonFor:    ['all'],  // Required whenever paying a contractor $600+ in a year
  },

  // ── IRS Form 1023 — Application for Tax-Exempt Status (Nonprofit) ─────────
  {
    id:           'form-1023',
    name:         'Application for Recognition of Exemption (Form 1023)',
    category:     'federal',
    description:
      'Filed by organizations seeking IRS recognition as a 501(c)(3) public charity or private ' +
      'foundation. The full Form 1023 is required for organizations with gross receipts above ' +
      '$50,000/year or total assets above $250,000. It includes a detailed narrative of activities, ' +
      'financial data (actual or projected), and governing documents. IRS processing typically takes ' +
      '3–6 months. Once approved, donations to the organization are tax-deductible.',
    officialUrl:  'https://www.irs.gov/forms-pubs/about-form-1023',
    pdfPath:      '',       // Filed online via pay.gov — no standalone PDF submission accepted
    isDownloadable: false,
    renewalMonths:  null,   // One-time application; 501(c)(3) status is permanent unless revoked
    commonFor:    ['nonprofit'],
  },

  // ── IRS Form 1023-EZ — Streamlined Application for Tax-Exempt Status ──────
  {
    id:           'form-1023-ez',
    name:         'Streamlined Application for Tax-Exempt Status (Form 1023-EZ)',
    category:     'federal',
    description:
      'Simplified version of Form 1023 for smaller nonprofits with projected gross receipts ' +
      '≤$50,000/year and total assets ≤$250,000. The 1023-EZ is a short online form (≈3 pages) ' +
      'compared to the full 1023 and typically processes in 2–4 weeks. Filing fee is $275 vs ' +
      '$600 for the full form. Eligibility must be confirmed by completing the IRS eligibility ' +
      'worksheet before filing.',
    officialUrl:  'https://www.irs.gov/forms-pubs/about-form-1023-ez',
    pdfPath:      '',       // Online filing only at pay.gov
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['nonprofit'],
  },

  // ── FMCSA DOT Number Application — Commercial Motor Vehicle Registration ───
  {
    id:           'dot-number-application',
    name:         'FMCSA DOT Number & Operating Authority (MC Number)',
    category:     'federal',
    description:
      'Required for commercial motor vehicles (trucks, vans, buses) engaged in interstate ' +
      'commerce — generally vehicles over 10,001 lbs GVWR, those carrying hazardous materials, ' +
      'or those transporting 9+ passengers for compensation. Register online with the Federal ' +
      'Motor Carrier Safety Administration (FMCSA) via the Unified Registration System (URS). ' +
      'Carriers transporting goods for hire also need an MC (Operating Authority) Number. ' +
      'A USDOT Number is free; MC Number applications cost $300 per authority type.',
    officialUrl:  'https://www.fmcsa.dot.gov/registration',
    pdfPath:      '',       // Online registration only via FMCSA URS portal
    isDownloadable: false,
    renewalMonths:  24,     // Biennial MCS-150 update required to keep USDOT active
    commonFor:    ['trucking', 'transportation', 'logistics'],
  },

  // ── v29 — Expanded High-Priority Federal Forms (SS-4 first) ──────────────
  // Note: ein-application (SS-4) was added in v27. The four forms below are
  // the next highest-priority federal filings for small business employers.

  // ── IRS Form 1099-NEC — Nonemployee Compensation ─────────────────────────
  {
    id:           'form-1099-nec',
    name:         'Nonemployee Compensation (Form 1099-NEC)',
    category:     'federal',
    description:
      'Filed by businesses that paid $600 or more to any independent contractor, freelancer, ' +
      'or self-employed individual during the tax year. Copy A is sent to the IRS; Copy B ' +
      'goes to the contractor. The deadline is January 31 of the following year for both the ' +
      'IRS and the recipient. Businesses must also file Form 1096 as a transmittal cover when ' +
      'submitting paper 1099s. Collect a W-9 from each contractor before first payment to avoid ' +
      '24% backup withholding.',
    officialUrl:  'https://www.irs.gov/forms-pubs/about-form-1099-nec',
    pdfPath:      '/forms/federal/1099-nec.pdf',
    isDownloadable: true,
    renewalMonths:  12,     // Filed annually by January 31 for the prior calendar year
    commonFor:    ['all'],
  },

  // ── IRS Form 941 — Employer's Quarterly Federal Tax Return ───────────────
  {
    id:           'form-941',
    name:         "Employer's Quarterly Federal Tax Return (Form 941)",
    category:     'federal',
    description:
      'Filed by employers every quarter to report wages paid, federal income tax withheld, ' +
      'and both the employee and employer share of Social Security and Medicare (FICA) taxes. ' +
      'Due by the last day of the month following each quarter (April 30, July 31, October 31, ' +
      'January 31). Most businesses with employees must file, even if no taxes are owed. ' +
      'Small employers with an annual tax liability under $1,000 may qualify to file Form 944 ' +
      'annually instead.',
    officialUrl:  'https://www.irs.gov/forms-pubs/about-form-941',
    pdfPath:      '/forms/federal/941.pdf',
    isDownloadable: true,
    renewalMonths:  3,      // Quarterly filing — 4 times per year
    commonFor:    ['all'],
  },

  // ── IRS Form 940 — Employer's Annual FUTA Tax Return ─────────────────────
  {
    id:           'form-940',
    name:         "Employer's Annual Federal Unemployment Tax Return (Form 940)",
    category:     'federal',
    description:
      'Filed annually by employers to report and pay the Federal Unemployment Tax Act (FUTA) ' +
      'tax, which funds federal unemployment benefits. The FUTA rate is 6% on the first $7,000 ' +
      'of wages paid to each employee, but most employers receive a 5.4% credit for paying ' +
      'state unemployment taxes, reducing the effective rate to 0.6%. Due by January 31 for ' +
      'the prior year. Employers who deposited all FUTA tax on time have until February 10.',
    officialUrl:  'https://www.irs.gov/forms-pubs/about-form-940',
    pdfPath:      '/forms/federal/940.pdf',
    isDownloadable: true,
    renewalMonths:  12,     // Annual filing due January 31
    commonFor:    ['all'],
  },

  // ── IRS Form 720 — Quarterly Federal Excise Tax Return ───────────────────
  {
    id:           'form-720',
    name:         'Quarterly Federal Excise Tax Return (Form 720)',
    category:     'federal',
    description:
      'Filed quarterly by businesses that collect or owe federal excise taxes — taxes imposed ' +
      'on specific goods, services, and activities. Common categories include motor fuel, ' +
      'air transportation tickets, heavy highway vehicles, indoor tanning services, and certain ' +
      'health insurance policies. Due April 30, July 31, October 31, and January 31. ' +
      'Not required if the business has no excise tax liability for the quarter.',
    officialUrl:  'https://www.irs.gov/forms-pubs/about-form-720',
    pdfPath:      '/forms/federal/720.pdf',
    isDownloadable: true,
    renewalMonths:  3,      // Quarterly filing — 4 times per year
    commonFor:    ['fuel', 'transportation', 'aviation', 'tanning', 'manufacturing'],
  },

];

// ── Common State & Local Forms Library ───────────────────────────────────────
// The 5 most common state and local compliance forms filed by small businesses.
// Referenced as StateFormEntry objects (lightweight metadata + online filing links).
// Filed directly with state/local agencies — no RegBot wizard; pdfPath is null
// for online-only forms.  renewalMonths reflects the most common renewal cycle;
// actual intervals vary by state and jurisdiction.

export const STATE_FORMS: StateFormEntry[] = [

  // ── State Sales Tax Permit ────────────────────────────────────────────────
  {
    id:           'sales-tax-registration',
    name:         'State Sales Tax Permit',
    category:     'state',
    description:
      'Required in the 45 states (plus DC) that levy a sales tax before collecting ' +
      'sales tax from customers or purchasing goods for resale. ' +
      'Also called a Seller\'s Permit, Resale Certificate, or Sales and Use Tax Permit ' +
      'depending on the state. Register with your state\'s Department of Revenue or ' +
      'equivalent agency — most states offer free online registration.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,    // Online registration only; no standard blank PDF
    isDownloadable: false,
    renewalMonths:  null,  // Most sales tax permits do not expire; permits are revoked if inactive
    commonFor:    ['retail', 'food-service', 'product-based', 'e-commerce'],
  },

  // ── Annual / Biennial Report ──────────────────────────────────────────────
  {
    id:           'annual-report',
    name:         'Annual / Biennial Report',
    category:     'state',
    description:
      'Required by most states for LLCs, corporations, and other registered entities ' +
      'to confirm or update their registered agent, principal address, and ownership ' +
      'information with the Secretary of State. Failure to file can result in ' +
      'administrative dissolution. Most states charge a filing fee of $10–$300 ' +
      'and accept online submissions through the Secretary of State portal.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/register-your-business',
    pdfPath:      null,    // Online filing through Secretary of State portals
    isDownloadable: false,
    renewalMonths:  12,    // Annual in most states; biennial (24 months) in some (CA, NY, etc.)
    commonFor:    ['all'],
  },

  // ── Fictitious Business Name (DBA) Registration ───────────────────────────
  {
    id:           'fictitious-name',
    name:         'Fictitious Business Name (DBA) Registration',
    category:     'state',
    description:
      'Required when operating a business under any name other than your legal name ' +
      'or the registered entity name. Also called "Doing Business As" (DBA), ' +
      'Assumed Name, or Trade Name registration. ' +
      'Filed with the county clerk, Secretary of State, or equivalent agency depending ' +
      'on state. Some states require publication in a local newspaper after filing.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/register-your-business',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  60,    // 5-year term in most states (FL, CA, TX, etc.); varies by jurisdiction
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // ── Business Tax Receipt / Local Business License ─────────────────────────
  {
    id:           'business-tax-receipt',
    name:         'Business Tax Receipt / Local Business License',
    category:     'local',
    description:
      'Required by most cities and counties before operating a business within their ' +
      'jurisdiction. Also called a Business Tax Receipt (FL), Occupational License, ' +
      'Business Privilege License, or Local Business Permit. ' +
      'Issued by the city or county finance or tax department. ' +
      'Fees are typically based on gross receipts or a flat annual rate. ' +
      'Must be renewed annually and posted visibly at the place of business.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,    // Annual renewal in virtually all jurisdictions
    commonFor:    ['all'],
  },

  // ── Home Occupation Permit ────────────────────────────────────────────────
  {
    id:           'home-occupation-permit',
    name:         'Home Occupation Permit',
    category:     'local',
    description:
      'Required by many cities and counties when operating a business out of a ' +
      'residential property. Ensures the business activity remains secondary to the ' +
      'residential use of the property (limits on signage, customer visits, employees, ' +
      'and stored inventory vary by jurisdiction). ' +
      'Apply through your city or county planning, zoning, or business licensing ' +
      'department. Some jurisdictions include this in the general business license.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,    // Typically renewed annually with the general business license
    commonFor:    ['home-based', 'sole-proprietor', 'freelance'],
  },

  // ── Seller's Permit (generic / state-specific portal) ────────────────────
  // Catch-all used by getRecommendedForms for states without a state-prefixed entry.
  {
    id:           'seller-permit',
    name:         "Seller's Permit / Resale Certificate",
    category:     'state',
    description:
      "Required in most states before purchasing goods for resale or collecting sales tax from " +
      "customers. Also called a Resale Certificate, Sales Tax Permit, or Use Tax Permit. " +
      "Register with your state's Department of Revenue or Taxation — most states offer free " +
      "online registration and issue the permit immediately. Required before your first taxable sale.",
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'e-commerce', 'wholesale', 'product-based'],
  },

  // ── Professional Cosmetology / Salon License ──────────────────────────────
  {
    id:           'cosmetology-license',
    name:         'Cosmetology / Salon Professional License',
    category:     'state',
    description:
      'Required by all 50 states for cosmetologists, barbers, estheticians, nail technicians, ' +
      'and salon operators. Individual practitioners must complete a state-approved training ' +
      'program and pass written and practical exams. Salons require a separate establishment ' +
      'license. Apply through your state Board of Cosmetology or equivalent licensing board. ' +
      'Renewal is typically every 1–2 years with continuing education requirements.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['salon', 'spa', 'cosmetology', 'barber'],
  },

  // ── Food Handler / Manager Certification ─────────────────────────────────
  {
    id:           'food-handler-cert',
    name:         'Food Handler / Food Manager Certification',
    category:     'state',
    description:
      'Required in most states for anyone involved in the preparation, storage, or service of ' +
      'food for public consumption. Some states require all food workers to hold a Food Handler ' +
      'card; others require at least one Certified Food Protection Manager (CFPM) per establishment ' +
      '(e.g. ServSafe® certification). Obtain through an accredited food safety training program ' +
      'approved by your state or local health department.',
    officialUrl:  'https://www.fda.gov/food/retail-food-protection/voluntary-national-retail-food-regulatory-program-standards',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  36,    // Typically valid 3 years (ServSafe); Food Handler cards usually 2–3 years
    commonFor:    ['food-service', 'restaurant', 'catering', 'food-truck'],
  },

  // ── Food Establishment Permit (generic) ───────────────────────────────────
  {
    id:           'food-establishment-permit',
    name:         'Food Establishment Permit',
    category:     'state',
    description:
      'Required by most states and counties before operating a restaurant, café, food truck, ' +
      'catering business, or any facility that prepares or serves food to the public. Issued by ' +
      'the state or county health department after a facility inspection. Requirements include ' +
      'an approved commercial kitchen, adequate refrigeration, hand-washing stations, and passing ' +
      'a health inspection. Renewed annually.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'catering', 'food-truck'],
  },

  // ── Liquor License (generic) ──────────────────────────────────────────────
  {
    id:           'liquor-license',
    name:         'Liquor / Alcohol License',
    category:     'state',
    description:
      'Required before selling, serving, or manufacturing alcoholic beverages. Issued by the ' +
      'state Alcoholic Beverage Control (ABC) board or equivalent agency. License types vary by ' +
      'use: retail beer/wine, full liquor, on-premise consumption, off-premise (package store), ' +
      'brewery, winery, and distillery licenses each have separate requirements and fees. ' +
      'Many states have local quota systems that limit the number of licenses available.',
    officialUrl:  'https://www.ttb.gov/operating-a-business',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['bar', 'restaurant', 'brewery', 'winery', 'liquor-store'],
  },

  // ── Cottage Food Permit (generic) ─────────────────────────────────────────
  {
    id:           'cottage-food-permit',
    name:         'Cottage Food Permit / Home Kitchen Registration',
    category:     'state',
    description:
      'Allows certain low-risk foods (baked goods, jams, candies, dried herbs) to be produced ' +
      'in a home kitchen and sold directly to consumers without a commercial kitchen license. ' +
      'All 50 states now have cottage food laws, but permitted products, annual revenue caps, ' +
      'and labeling requirements vary significantly. Some states require a permit or registration; ' +
      'others are self-executing with mandatory labeling. Check your state agriculture department.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'home-based', 'cottage-food'],
  },

  // ── Childcare / Daycare License (generic) ────────────────────────────────
  {
    id:           'childcare-license',
    name:         'Child Care / Daycare Facility License',
    category:     'state',
    description:
      'Required by all states before operating a licensed childcare center, family childcare home, ' +
      'or preschool. Licensing involves background checks for all staff, facility inspections, ' +
      'staff-to-child ratio requirements, health and safety standards, and ongoing training. ' +
      'Apply through your state Department of Children and Families, Social Services, or equivalent. ' +
      'Home-based family childcare typically has lighter requirements than center-based care.',
    officialUrl:  'https://childcare.gov/consumer-education/get-started-with-child-care',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['childcare', 'daycare', 'preschool'],
  },

  // ── Contractor's License (generic) ───────────────────────────────────────
  {
    id:           'contractors-license',
    name:         "Contractor's License",
    category:     'state',
    description:
      'Required in most states for general contractors, specialty trade contractors (electrical, ' +
      'plumbing, HVAC, roofing), and home improvement contractors performing work above a set ' +
      'dollar threshold. Typically requires proof of experience, a written exam, general liability ' +
      'insurance, and a surety bond. Some states license at the state level; others delegate ' +
      'to county or city authorities. California, Florida, and Texas have particularly robust ' +
      'licensing systems with separate classifications.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['contractor', 'construction', 'trade', 'home-improvement'],
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// v24 — Full 50-State + County/City Forms Expansion
//
// STATE_FORMS_ALL_50 covers all 50 US states with state-prefixed IDs so they
// never collide with the generic STATE_FORMS entries above.  Includes:
//   • Sales Tax Registration / Permit (45 states + DC; AK/DE/MT/NH/OR omitted)
//   • Annual / Biennial Report (Secretary of State for all 50)
//   • Fictitious Business Name / DBA for all 50
//   • Food Service Permit for high-volume food states
//   • Home Occupation Permit for major metro states
//   • Cottage Food / special-category permits where relevant
//
// pdfPath = '/forms/state/[state]-[form].pdf' where a blank PDF is available;
// null for online-only portals (the majority of modern state filings).
// ─────────────────────────────────────────────────────────────────────────────

export const STATE_FORMS_ALL_50: StateFormEntry[] = [

  // ── FLORIDA ───────────────────────────────────────────────────────────────

  // Florida DR-1 — Sales and Use Tax Application for Registration
  {
    id:           'fl-sales-tax-dr1',
    name:         'Florida Sales Tax Registration (DR-1)',
    category:     'state',
    description:
      'Required before collecting sales tax or purchasing goods for resale in Florida. ' +
      'File Form DR-1 with the Florida Department of Revenue to receive a Certificate of ' +
      'Registration (DR-11) and a Florida Annual Resale Certificate (DR-13). ' +
      'Online registration is free at the Florida Department of Revenue; the paper DR-1 ' +
      'is available if you prefer mail submission. Retailers, restaurants, and service ' +
      'businesses with taxable transactions must register before their first sale.',
    officialUrl:  'https://floridarevenue.com/taxes/taxesfees/Pages/dr1.aspx',
    pdfPath:      '/forms/state/fl-dr1.pdf',
    isDownloadable: true,    // Paper DR-1 PDF available from FDOR forms library
    renewalMonths:  null,    // Permit does not expire; revoked only if business closes
    commonFor:    ['retail', 'food-service', 'product-based', 'e-commerce'],
  },

  // Florida Annual Report — Division of Corporations (Sunbiz)
  {
    id:           'fl-annual-report',
    name:         'Florida Annual Report (Sunbiz)',
    category:     'state',
    description:
      'Required annually for all Florida LLCs, corporations, limited partnerships, and ' +
      'registered foreign entities to keep their registration active with the Florida ' +
      'Division of Corporations. File online at Sunbiz.org between January 1 and May 1 ' +
      'to avoid a $400 late fee. The report confirms or updates your registered agent, ' +
      'principal office address, and officer/manager information. Failure to file results ' +
      'in administrative dissolution.',
    officialUrl:  'https://dos.fl.gov/sunbiz/manage-your-business/annual-reports/',
    pdfPath:      null,      // Online filing only via Sunbiz; no PDF submission accepted
    isDownloadable: false,
    renewalMonths:  12,      // Due annually by May 1
    commonFor:    ['all'],
  },

  // Florida Fictitious Name (DBA) Registration
  {
    id:           'fl-fictitious-name',
    name:         'Florida Fictitious Name (DBA) Registration',
    category:     'state',
    description:
      'Required when operating a Florida business under any name other than your legal ' +
      'name or the registered entity name (e.g. "Jane Smith d/b/a Sunshine Bakery"). ' +
      'File online at Sunbiz.org with the Division of Corporations. The registration fee ' +
      'is $50 and the name is valid for 5 years. Florida also requires publishing a notice ' +
      'of the fictitious name in a newspaper of general circulation in the county where the ' +
      'business is located before or shortly after filing.',
    officialUrl:  'https://dos.fl.gov/sunbiz/manage-your-business/other-services/fictitious-name-registration/',
    pdfPath:      null,      // Online filing via Sunbiz preferred; paper option via county
    isDownloadable: false,
    renewalMonths:  60,      // 5-year registration term
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // Florida Business Tax Receipt (county-issued; formerly Occupational License)
  {
    id:           'fl-business-tax-receipt',
    name:         'Florida Business Tax Receipt (County/City)',
    category:     'local',
    description:
      'Required by every Florida county and most municipalities before opening a business ' +
      'location or operating within their jurisdiction. Formerly called an Occupational ' +
      'License. Issued by the county Tax Collector\'s office (and separately by the city ' +
      'if the business is within city limits). Fees range from $25 to several hundred ' +
      'dollars depending on business type and gross revenue. Must be renewed annually by ' +
      'September 30 and displayed at the place of business.',
    officialUrl:  'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits',
    pdfPath:      null,      // Application varies by county; check your county Tax Collector portal
    isDownloadable: false,
    renewalMonths:  12,      // Due annually September 30
    commonFor:    ['all'],
  },

  // Florida Cottage Food / Home Occupation (FDACS exemption, not a permit)
  {
    id:           'fl-cottage-food',
    name:         'Florida Cottage Food Registration',
    category:     'state',
    description:
      'Florida\'s Cottage Food Law (s. 500.80, F.S.) allows home-based food businesses to ' +
      'sell certain non-potentially-hazardous foods (baked goods, jams, jellies, candy, ' +
      'dried herbs) directly to consumers without a state food license, up to $50,000 gross ' +
      'sales per year. Register with the Florida Department of Agriculture and Consumer ' +
      'Services (FDACS). Labels must include the producer\'s name and address, product name, ' +
      'ingredients, net weight, and "Made in a cottage food operation that is not inspected ' +
      'by the Department of Agriculture and Consumer Services."',
    officialUrl:  'https://www.fdacs.gov/Business-Services/Food/Cottage-Food-Law',
    pdfPath:      null,      // Online registration via FDACS; no universal paper form
    isDownloadable: false,
    renewalMonths:  null,    // One-time registration; no mandatory annual renewal
    commonFor:    ['food-service', 'home-based', 'cottage-food'],
  },

  // ── TEXAS ─────────────────────────────────────────────────────────────────

  // Texas AP-201 — Sales and Use Tax Permit Application
  {
    id:           'tx-sales-tax-ap201',
    name:         'Texas Sales Tax Permit (AP-201)',
    category:     'state',
    description:
      'Required before making taxable sales or leases of goods or services in Texas. ' +
      'File Form AP-201 with the Texas Comptroller of Public Accounts to receive a Sales ' +
      'and Use Tax Permit. Online registration through the Comptroller\'s eSystems portal is ' +
      'free and typically processed within 2–3 business days. The paper AP-201 is available ' +
      'for mail submission. Permits are permanent and do not require renewal, but must be ' +
      'surrendered if the business closes or changes ownership.',
    officialUrl:  'https://comptroller.texas.gov/taxes/sales/',
    pdfPath:      '/forms/state/tx-ap-201.pdf',
    isDownloadable: true,    // Paper AP-201 available from Texas Comptroller forms library
    renewalMonths:  null,    // Permit does not expire
    commonFor:    ['retail', 'food-service', 'product-based', 'e-commerce'],
  },

  // Texas Franchise Tax Report (Annual Report equivalent)
  {
    id:           'tx-franchise-tax-report',
    name:         'Texas Franchise Tax Report (Annual)',
    category:     'state',
    description:
      'Required annually for most Texas LLCs, corporations, limited partnerships, and ' +
      'other taxable entities. Filed with the Texas Comptroller by May 15 each year (or ' +
      'the next business day). Even entities with no taxable revenue must file a "No Tax ' +
      'Due" report if their annualized revenue is below the threshold (~$2.47 million for ' +
      '2024). Failure to file results in forfeiture of the right to do business in Texas. ' +
      'File online through the Comptroller\'s WebFile system.',
    officialUrl:  'https://comptroller.texas.gov/taxes/franchise/',
    pdfPath:      null,      // Online filing via WebFile strongly preferred; paper versions available
    isDownloadable: false,
    renewalMonths:  12,      // Due annually May 15
    commonFor:    ['all'],
  },

  // Texas Assumed Name Certificate (DBA)
  {
    id:           'tx-assumed-name',
    name:         'Texas Assumed Name Certificate (DBA)',
    category:     'state',
    description:
      'Required in Texas when a business operates under a name other than its legal name. ' +
      'Sole proprietors and general partnerships file with the county clerk in each county ' +
      'where they conduct business. LLCs, corporations, and other registered entities file ' +
      'with the Texas Secretary of State (Form 503) AND with the county clerk where the ' +
      'principal office is located. The registration is valid for 10 years and must be ' +
      'renewed before expiration. County fees typically range from $15–$25 per county.',
    officialUrl:  'https://www.sos.state.tx.us/corp/assumed_name.shtml',
    pdfPath:      null,      // SOS Form 503 available online; county forms vary
    isDownloadable: false,
    renewalMonths:  120,     // 10-year term in Texas
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // Texas Food Establishment Permit (DSHS — food trucks, restaurants)
  {
    id:           'tx-food-establishment-permit',
    name:         'Texas Food Establishment Permit (DSHS)',
    category:     'state',
    description:
      'Required for food trucks, mobile food vendors, restaurants, caterers, and other ' +
      'food establishments operating in Texas outside of city/county jurisdiction. Issued ' +
      'by the Texas Department of State Health Services (DSHS) for locations not regulated ' +
      'by a local health department. Annual permit fees range from $258 to $773 depending on ' +
      'food risk level. Most major cities (Houston, Dallas, Austin, San Antonio) issue their ' +
      'own permits through local health departments — check with your city before applying to DSHS.',
    officialUrl:  'https://www.dshs.texas.gov/foods/food-establishments/getting-a-permit-license-or-registration',
    pdfPath:      null,      // Online application through DSHS portal
    isDownloadable: false,
    renewalMonths:  12,      // Annual renewal
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  // ── CALIFORNIA ────────────────────────────────────────────────────────────

  // California Seller's Permit (CDTFA-400-A)
  {
    id:           'ca-sellers-permit',
    name:         "California Seller's Permit (CDTFA-400-A)",
    category:     'state',
    description:
      "Required for any California business that sells or leases tangible personal property " +
      "that is ordinarily subject to sales tax. Issued free by the California Department of " +
      "Tax and Fee Administration (CDTFA). Register online at cdtfa.ca.gov or submit the " +
      "paper CDTFA-400-A by mail. A security deposit may be required based on estimated " +
      "tax liability. The permit must be displayed at the place of business and a new permit " +
      "obtained for each business location. It does not expire but is revoked if the business " +
      "closes or becomes inactive.",
    officialUrl:  'https://www.cdtfa.ca.gov/services/#Register-a-Business',
    pdfPath:      '/forms/state/ca-cdtfa-400-a.pdf',
    isDownloadable: true,    // Paper CDTFA-400-A available for mail submission
    renewalMonths:  null,    // Permit does not expire
    commonFor:    ['retail', 'food-service', 'product-based', 'e-commerce'],
  },

  // California Statement of Information
  {
    id:           'ca-statement-of-information',
    name:         'California Statement of Information',
    category:     'state',
    description:
      'Required for California LLCs and corporations to report or update their principal ' +
      'office address, registered agent, and officer/manager information with the Secretary ' +
      'of State. LLCs file every two years ($20 fee); corporations file annually ($25 fee). ' +
      'Due within 90 days of formation and then on the applicable cycle. File online through ' +
      'bizfile.sos.ca.gov. Failure to file results in suspension of the entity, which prevents ' +
      'the business from legally operating, entering contracts, or using the courts.',
    officialUrl:  'https://bizfileonline.sos.ca.gov/',
    pdfPath:      null,      // Online filing via bizfile.sos.ca.gov; paper also accepted
    isDownloadable: false,
    renewalMonths:  24,      // Biennial for LLCs (most common small business entity); annual for corps
    commonFor:    ['all'],
  },

  // California Fictitious Business Name (DBA) — county-level
  {
    id:           'ca-fictitious-business-name',
    name:         'California Fictitious Business Name (DBA)',
    category:     'state',
    description:
      'Required in California when a sole proprietor, partnership, or corporation ' +
      'conducts business under a name other than its legal name. Filed with the county ' +
      'clerk in the county where the business is principally located. After filing, the ' +
      'registrant must publish a notice in a local adjudicated newspaper once a week for ' +
      'four consecutive weeks and file a Proof of Publication with the county clerk. The ' +
      'registration is valid for 5 years and must be renewed before expiration. Fees vary ' +
      'by county ($10–$100).',
    officialUrl:  'https://www.sos.ca.gov/business-programs/business-entities/forms',
    pdfPath:      null,      // Forms vary by county; check with your county clerk
    isDownloadable: false,
    renewalMonths:  60,      // 5-year term
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // ── NEW YORK ──────────────────────────────────────────────────────────────

  // New York Certificate of Authority (Sales Tax)
  {
    id:           'ny-sales-tax-authority',
    name:         'New York Certificate of Authority (Sales Tax)',
    category:     'state',
    description:
      'Required before making taxable sales in New York State. Apply for a Certificate ' +
      'of Authority at least 20 days before beginning business through the New York ' +
      'Business Express portal (businessexpress.ny.gov). Once registered, the certificate ' +
      'must be displayed at each business location. New York sales tax registrations do not ' +
      'expire but must be updated within 20 days of any significant business change (address, ' +
      'owner, etc.). Filing is free. The certificate authorizes the business to collect ' +
      'state and local sales tax from customers.',
    officialUrl:  'https://www.tax.ny.gov/bus/st/stregister.htm',
    pdfPath:      null,      // Online registration via NY Business Express (businessexpress.ny.gov)
    isDownloadable: false,
    renewalMonths:  null,    // Does not expire; update required upon material business changes
    commonFor:    ['retail', 'food-service', 'product-based', 'e-commerce'],
  },

  // New York Biennial Statement (LLCs and LLPs)
  {
    id:           'ny-biennial-statement',
    name:         'New York Biennial Statement',
    category:     'state',
    description:
      'Required every two years for New York LLCs and Limited Liability Partnerships (LLPs) ' +
      'to update their registered agent and service of process address with the Department ' +
      'of State. The $9 filing fee must accompany each statement. NY corporations file an ' +
      'annual report separately. LLCs are notified by the Department of State by email when ' +
      'their filing window opens. File online at ecorp.dos.ny.gov. Failure to file can result ' +
      'in the LLC\'s authority to do business being suspended.',
    officialUrl:  'https://ecorp.dos.ny.gov/',
    pdfPath:      null,      // Online filing via ecorp.dos.ny.gov
    isDownloadable: false,
    renewalMonths:  24,      // Biennial (every 2 years)
    commonFor:    ['all'],
  },

  // New York DBA (Assumed Name Certificate)
  {
    id:           'ny-dba',
    name:         'New York Assumed Name (DBA) Certificate',
    category:     'state',
    description:
      'Required in New York when a sole proprietor or general partnership conducts business ' +
      'under a name other than the owner\'s legal name. Filed with the county clerk in each ' +
      'county where the business is conducted. LLCs and corporations wishing to use a DBA ' +
      'must file a Certificate of Assumed Name with the New York Department of State ($25 fee). ' +
      'New York does not have a mandatory expiration for DBA registrations — they remain valid ' +
      'until withdrawn. County clerk fees vary ($25–$100).',
    officialUrl:  'https://dos.ny.gov/assumed-name-certificate',
    pdfPath:      null,      // DOS online or county clerk forms; varies by entity type
    isDownloadable: false,
    renewalMonths:  null,    // No expiration in New York
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // ── ILLINOIS ──────────────────────────────────────────────────────────────

  // Illinois Business Registration (REG-1) — Sales Tax and Business Tax
  {
    id:           'il-business-registration',
    name:         'Illinois Business Registration (REG-1)',
    category:     'state',
    description:
      'Required for any Illinois business that sells taxable goods or services, hires ' +
      'employees, or operates as a partnership or corporation subject to Illinois tax. ' +
      'Form REG-1 registers the business with the Illinois Department of Revenue for ' +
      'sales tax, use tax, employer withholding, and other applicable taxes in a single ' +
      'application. Apply online through MyTax Illinois (mytax.illinois.gov) or mail the ' +
      'paper REG-1. Processing takes 4–6 weeks for paper; immediate for online. There is ' +
      'no registration fee.',
    officialUrl:  'https://mytax.illinois.gov/',
    pdfPath:      '/forms/state/il-reg-1.pdf',
    isDownloadable: true,    // Paper REG-1 available from IDOR forms library
    renewalMonths:  null,    // Registration does not expire
    commonFor:    ['retail', 'food-service', 'product-based', 'employer'],
  },

  // Illinois Annual Report — Secretary of State
  {
    id:           'il-annual-report',
    name:         'Illinois Annual Report',
    category:     'state',
    description:
      'Required annually for Illinois LLCs and corporations to confirm their registered ' +
      'agent, principal office address, and officer/manager information with the Illinois ' +
      'Secretary of State. LLC annual reports are due before the first day of the LLC\'s ' +
      'anniversary month each year ($75 fee). Corporation annual reports are due before the ' +
      'first day of the corporation\'s anniversary month ($75 fee for domestic corps). File ' +
      'online at ilsos.gov or by mail. Failure to file results in administrative dissolution ' +
      'or revocation of the entity\'s authority to do business in Illinois.',
    officialUrl:  'https://www.ilsos.gov/annualreport/',
    pdfPath:      null,      // Online filing via ilsos.gov; paper option available
    isDownloadable: false,
    renewalMonths:  12,      // Annual; due before anniversary month
    commonFor:    ['all'],
  },

  // ── GEORGIA ───────────────────────────────────────────────────────────────

  {
    id:           'ga-sales-tax-registration',
    name:         'Georgia Sales Tax Registration',
    category:     'state',
    description:
      'Required before making taxable retail sales in Georgia. Register free with the ' +
      'Georgia Department of Revenue through the Georgia Tax Center (gtc.dor.georgia.gov). ' +
      'Sales tax returns are due monthly, quarterly, or annually based on average monthly ' +
      'tax liability. The certificate does not expire.',
    officialUrl:  'https://gtc.dor.georgia.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based', 'e-commerce'],
  },

  {
    id:           'ga-annual-registration',
    name:         'Georgia Annual Registration',
    category:     'state',
    description:
      'Required annually for all Georgia LLCs, corporations, and limited partnerships ' +
      'to keep registration active with the Secretary of State. Due April 1 ($50 fee for ' +
      'most entities). File online at ecorp.sos.ga.gov. Late fee is $25; continued ' +
      'non-filing leads to administrative dissolution.',
    officialUrl:  'https://ecorp.sos.ga.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'ga-dba',
    name:         'Georgia Trade Name Registration (DBA)',
    category:     'state',
    description:
      'Required when a sole proprietor or partnership operates under a name other than ' +
      'the owner\'s legal name. File with the county Superior Court clerk in the county ' +
      'where business is conducted. LLCs and corporations use the eCorp portal for a ' +
      'name reservation or amendment. Fees vary by county ($10–$50).',
    officialUrl:  'https://sos.ga.gov/index.php/corporations/registered-agents-information',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // ── ALABAMA ────────────────────────────────────────────────────────────────

  {
    id:           'al-sales-tax',
    name:         'Alabama Sales Tax License',
    category:     'state',
    description:
      'Required before making taxable retail sales in Alabama. Register through the My ' +
      'Alabama Taxes (MAT) portal at myalabamataxes.alabama.gov. The license is free and ' +
      'does not expire. Returns are due monthly, quarterly, or annually depending on ' +
      'liability level.',
    officialUrl:  'https://myalabamataxes.alabama.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'al-annual-report',
    name:         'Alabama Annual Report',
    category:     'state',
    description:
      'Required annually for Alabama LLCs and corporations to confirm registered agent ' +
      'and officer information with the Secretary of State. Due by April 15 each year ' +
      '($50 fee for most entities). File online at sos.alabama.gov. Failure to file ' +
      'results in administrative dissolution.',
    officialUrl:  'https://www.sos.alabama.gov/business-services/corporations',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'al-dba',
    name:         'Alabama Assumed Name (DBA) Certificate',
    category:     'state',
    description:
      'Sole proprietors and partnerships operating under a trade name must file a ' +
      'Certificate of Assumed Name with the county probate judge where the business is ' +
      'located. LLCs and corporations file through the SOS portal. Valid for 5 years; ' +
      'must be renewed before expiration.',
    officialUrl:  'https://www.sos.alabama.gov/business-services/corporations',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  60,
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // ── ALASKA ─────────────────────────────────────────────────────────────────
  // Alaska has no statewide sales tax. Municipal sales taxes may apply.

  {
    id:           'ak-business-license',
    name:         'Alaska Business License',
    category:     'state',
    description:
      'Alaska requires all businesses to obtain a state Business License from the ' +
      'Division of Corporations, Business and Professional Licensing (DCBPL) before ' +
      'operating. The biennial license fee is $50 ($25 for non-profit). Apply online at ' +
      'commerce.alaska.gov. This is separate from any municipal license requirements.',
    officialUrl:  'https://www.commerce.alaska.gov/web/cbpl/businesslicensing.aspx',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['all'],
  },

  {
    id:           'ak-annual-report',
    name:         'Alaska Biennial Report',
    category:     'state',
    description:
      'Required every two years for Alaska corporations, LLCs, and other registered ' +
      'entities to confirm or update registered agent and officer information with the ' +
      'Division of Corporations. Due January 2 in each even-numbered year ($100 fee for ' +
      'corps; $50 for LLCs). File online at commerce.alaska.gov.',
    officialUrl:  'https://www.commerce.alaska.gov/web/cbpl/BusinessLicensing/Corporations.aspx',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['all'],
  },

  // ── ARIZONA ────────────────────────────────────────────────────────────────

  {
    id:           'az-tpt-license',
    name:         'Arizona Transaction Privilege Tax (TPT) License',
    category:     'state',
    description:
      'Arizona\'s Transaction Privilege Tax (TPT) is the equivalent of a sales tax permit. ' +
      'Apply through AZTaxes.gov ($12 annual fee). A single license covers all business ' +
      'locations. Returns are due monthly, quarterly, or annually. City-level TPT may also ' +
      'be required — many cities collect it through ADOR jointly.',
    officialUrl:  'https://aztaxes.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['retail', 'food-service', 'product-based', 'e-commerce'],
  },

  {
    id:           'az-annual-report',
    name:         'Arizona Annual Report',
    category:     'state',
    description:
      'Required annually for Arizona corporations and LLCs to update officer, director, ' +
      'and statutory agent information with the Arizona Corporation Commission. Due on the ' +
      'anniversary month of formation ($45 fee for corps; $0 for LLCs). File online at ' +
      'azcc.gov. Failure to file results in administrative dissolution.',
    officialUrl:  'https://azcc.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'az-dba',
    name:         'Arizona Trade Name Registration (DBA)',
    category:     'state',
    description:
      'Sole proprietors and partnerships operating under a trade name file a Trade Name ' +
      'Registration with the Arizona Secretary of State ($10 fee). Corporations and LLCs ' +
      'may also register an assumed name through the SOS. Valid for 5 years. Arizona does ' +
      'not require a newspaper publication for DBA registrations.',
    officialUrl:  'https://azsos.gov/business/trade-names',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  60,
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // ── ARKANSAS ───────────────────────────────────────────────────────────────

  {
    id:           'ar-sales-tax',
    name:         'Arkansas Sales Tax Permit',
    category:     'state',
    description:
      'Required before making taxable sales in Arkansas. Register through the Arkansas ' +
      'Taxpayer Access Point (ATAP) at atap.arkansas.gov. The permit is free and does not ' +
      'expire. Returns are due monthly, quarterly, or annually based on liability. The state ' +
      'sales tax rate is 6.5%; additional local rates apply.',
    officialUrl:  'https://atap.arkansas.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ar-annual-report',
    name:         'Arkansas Annual Franchise Tax Report',
    category:     'state',
    description:
      'Required annually for Arkansas LLCs, corporations, and other registered entities. ' +
      'Due May 1 each year. LLCs pay a flat $150 fee; corporations pay based on authorized ' +
      'shares (minimum $150). File online through the SOS portal at sos.arkansas.gov. ' +
      'Failure to file results in revocation of the entity\'s authority to do business.',
    officialUrl:  'https://www.sos.arkansas.gov/corps',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── COLORADO ───────────────────────────────────────────────────────────────

  {
    id:           'co-sales-tax',
    name:         'Colorado Sales Tax License',
    category:     'state',
    description:
      'Required before making taxable retail sales in Colorado. Register with the ' +
      'Colorado Department of Revenue at revenue.colorado.gov. The license fee is $16 ' +
      'and must be renewed every two years. Note: Colorado is a home-rule state — many ' +
      'cities (Denver, Aurora, Boulder) collect their own city sales tax and require a ' +
      'separate city sales tax license.',
    officialUrl:  'https://revenue.colorado.gov/how-to-register-for-colorado-sales-and-use-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['retail', 'food-service', 'product-based', 'e-commerce'],
  },

  {
    id:           'co-periodic-report',
    name:         'Colorado Periodic Report',
    category:     'state',
    description:
      'Required annually for Colorado LLCs and corporations to confirm registered agent ' +
      'and principal office address with the Secretary of State. Due on the anniversary ' +
      'month of formation ($10 fee). File online at sos.state.co.us. Failure to file ' +
      'within 2 months of the due date results in delinquency and eventual dissolution.',
    officialUrl:  'https://www.sos.state.co.us/pubs/business/businessHome.html',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── CONNECTICUT ────────────────────────────────────────────────────────────

  {
    id:           'ct-sales-tax',
    name:         'Connecticut Sales and Use Tax Permit',
    category:     'state',
    description:
      'Required before making taxable sales in Connecticut. Register with the Department ' +
      'of Revenue Services (DRS) at portal.ct.gov/drs. The permit is free and does not ' +
      'expire. Connecticut sales tax rate is 6.35%. Registration also covers use tax ' +
      'obligations. File returns monthly, quarterly, or annually based on liability.',
    officialUrl:  'https://portal.ct.gov/drs/sales/sales-use-taxes',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ct-annual-report',
    name:         'Connecticut Annual Report',
    category:     'state',
    description:
      'Required annually for Connecticut LLCs, corporations, and other registered ' +
      'entities to update business information with the Secretary of State. Due on the ' +
      'anniversary month of formation ($80 fee for corps and LLCs). File online at ' +
      'portal.ct.gov/sots. Late filing incurs a $50 penalty.',
    officialUrl:  'https://portal.ct.gov/sots',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── DELAWARE ───────────────────────────────────────────────────────────────
  // Delaware has no state sales tax. It is the most common incorporation state.

  {
    id:           'de-franchise-tax',
    name:         'Delaware Franchise Tax Report',
    category:     'state',
    description:
      'Required annually for all Delaware corporations to pay the Franchise Tax and ' +
      'file an Annual Report with the Division of Corporations. Due March 1 each year. ' +
      'Tax is calculated under the Authorized Shares Method or Assumed Par Value Capital ' +
      'Method (minimum $175). LLCs pay a flat $300 annual tax by June 1. File at ' +
      'corp.delaware.gov.',
    officialUrl:  'https://corp.delaware.gov/paytaxes.shtml',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── HAWAII ─────────────────────────────────────────────────────────────────

  {
    id:           'hi-get-license',
    name:         'Hawaii General Excise Tax (GET) License',
    category:     'state',
    description:
      'Hawaii levies a General Excise Tax (GET) rather than a traditional sales tax. ' +
      'All businesses must register with the Hawaii Department of Taxation and obtain a ' +
      'GET license ($20 one-time fee) before starting business. Apply online at ' +
      'portal.ehawaii.gov. Returns are due monthly, quarterly, or semi-annually. ' +
      'The GET rate is 4% statewide (4.5% on Oahu).',
    officialUrl:  'https://tax.hawaii.gov/geninfo/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['all'],
  },

  {
    id:           'hi-annual-report',
    name:         'Hawaii Annual Report',
    category:     'state',
    description:
      'Required annually for Hawaii LLCs, corporations, and other registered entities ' +
      'to update information with the Department of Commerce and Consumer Affairs (DCCA). ' +
      'Due on the anniversary quarter of registration ($12.50–$25 fee). File online at ' +
      'portal.ehawaii.gov. Failure to file for two consecutive years results in ' +
      'administrative dissolution.',
    officialUrl:  'https://portal.ehawaii.gov/business/business-registration/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── IDAHO ──────────────────────────────────────────────────────────────────

  {
    id:           'id-sales-tax',
    name:         "Idaho Seller's Permit",
    category:     'state',
    description:
      "Required before making taxable retail sales in Idaho. Register with the Idaho " +
      "State Tax Commission at tax.idaho.gov. The permit is free and does not expire. " +
      "Idaho's state sales tax rate is 6%. Returns are due monthly or quarterly " +
      "depending on annual tax liability.",
    officialUrl:  'https://tax.idaho.gov/taxes/sales-use/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'id-annual-report',
    name:         'Idaho Annual Report',
    category:     'state',
    description:
      'Required annually for Idaho LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due on the last day of the anniversary month of formation ' +
      '($30 fee). File online at sos.idaho.gov. Failure to file results in dissolution.',
    officialUrl:  'https://sos.idaho.gov/business-services-division/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── INDIANA ────────────────────────────────────────────────────────────────

  {
    id:           'in-sales-tax',
    name:         'Indiana Retail Merchant Certificate',
    category:     'state',
    description:
      'Required before making taxable retail sales in Indiana. Register through INBiz ' +
      'at inbiz.in.gov to receive a Retail Merchant Certificate. The certificate is free ' +
      "and does not expire. Indiana's state sales tax rate is 7% with no local add-ons. " +
      'Returns are due monthly or annually based on average monthly tax collected.',
    officialUrl:  'https://intime.dor.in.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'in-biennial-report',
    name:         'Indiana Biennial Report',
    category:     'state',
    description:
      'Required every two years for Indiana LLCs and corporations. Due every other year ' +
      'in the anniversary month of formation ($32 fee for online filing). File through ' +
      'INBiz at inbiz.in.gov. Failure to file results in administrative dissolution. ' +
      'Indiana changed from annual to biennial reporting in 2022.',
    officialUrl:  'https://inbiz.in.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['all'],
  },

  // ── IOWA ───────────────────────────────────────────────────────────────────

  {
    id:           'ia-sales-tax',
    name:         'Iowa Sales Tax Permit',
    category:     'state',
    description:
      'Required before making taxable sales in Iowa. Register with the Iowa Department ' +
      'of Revenue through the GovConnect portal at tax.iowa.gov. The permit is free and ' +
      'does not expire. Returns are due monthly, quarterly, or annually based on tax ' +
      'collected. Iowa sales tax rate is 6% plus applicable local option taxes.',
    officialUrl:  'https://tax.iowa.gov/businesses/register-new-business',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ia-biennial-report',
    name:         'Iowa Biennial Report',
    category:     'state',
    description:
      'Required every two years for Iowa LLCs and corporations to confirm or update ' +
      'registered agent and principal office information with the Secretary of State. ' +
      'Due April 1 in odd-numbered years ($30 fee for online filing). File at sos.iowa.gov. ' +
      'Failure to file results in administrative dissolution.',
    officialUrl:  'https://sos.iowa.gov/business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['all'],
  },

  // ── KANSAS ─────────────────────────────────────────────────────────────────

  {
    id:           'ks-sales-tax',
    name:         'Kansas Retailer Sales Tax Certificate',
    category:     'state',
    description:
      'Required before making taxable retail sales in Kansas. Register with the Kansas ' +
      'Department of Revenue at ksrevenue.gov. The certificate is free and does not ' +
      'expire. Kansas state sales tax rate is 6.5%; local rates are additional. Returns ' +
      'are due monthly, quarterly, or annually based on annual liability.',
    officialUrl:  'https://www.ksrevenue.gov/salesregistration.html',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ks-annual-report',
    name:         'Kansas Annual Report',
    category:     'state',
    description:
      'Required annually for Kansas LLCs, corporations, and other registered entities ' +
      'to confirm registered agent and officer information with the Secretary of State. ' +
      'Due on the 15th day of the 4th month after the end of the fiscal year ($50–$55 ' +
      'fee). File online at sos.ks.gov. Failure to file results in forfeiture of entity ' +
      'status.',
    officialUrl:  'https://www.sos.ks.gov/businesses/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── KENTUCKY ───────────────────────────────────────────────────────────────

  {
    id:           'ky-sales-tax',
    name:         'Kentucky Sales Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Kentucky. Register with the ' +
      'Kentucky Department of Revenue at revenue.ky.gov. The permit is free and does not ' +
      'expire. Kentucky sales tax rate is 6%; no local sales tax additions. Returns are ' +
      'due monthly, quarterly, or annually based on liability.',
    officialUrl:  'https://revenue.ky.gov/Business/Sales-Use-Tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ky-annual-report',
    name:         'Kentucky Annual Report',
    category:     'state',
    description:
      'Required annually for Kentucky LLCs and corporations to confirm registered agent ' +
      'and officer information with the Secretary of State. Due June 30 each year ($15 ' +
      'fee for LLCs; $15 for corps). File online at sos.ky.gov. Failure to file by ' +
      'June 30 results in a $10 late fee and eventual dissolution.',
    officialUrl:  'https://sos.ky.gov/bus/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── LOUISIANA ──────────────────────────────────────────────────────────────

  {
    id:           'la-sales-tax',
    name:         'Louisiana Sales Tax Certificate of Registration',
    category:     'state',
    description:
      'Required before making taxable retail sales in Louisiana. Register with the ' +
      'Louisiana Department of Revenue at revenue.louisiana.gov. The state sales tax ' +
      'rate is 4.45%. Louisiana has complex local sales tax rules — parishes (counties) ' +
      'and cities each set their own rates, and many require separate local registrations ' +
      'through the Louisiana Uniform Local Sales Tax Board.',
    officialUrl:  'https://revenue.louisiana.gov/businesses/SalesAndUseTax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'la-annual-report',
    name:         'Louisiana Annual Report',
    category:     'state',
    description:
      'Required annually for Louisiana LLCs, corporations, and other registered entities ' +
      'to update officer/manager and registered agent information with the Secretary of ' +
      'State. Due on the anniversary month of formation ($30 fee for LLCs; $30 for corps). ' +
      'File online at sos.la.gov. Failure to file results in revocation.',
    officialUrl:  'https://www.sos.la.gov/BusinessServices/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── MAINE ──────────────────────────────────────────────────────────────────

  {
    id:           'me-sales-tax',
    name:         'Maine Sales Tax Registration',
    category:     'state',
    description:
      'Required before making taxable retail sales in Maine. Register with Maine Revenue ' +
      'Services at maine.gov/revenue. The registration is free and does not expire. ' +
      'Maine sales tax rate is 5.5% (10% for restaurant meals, 9% for lodging, 10% for ' +
      'vehicle rentals). Returns are due monthly, quarterly, or annually.',
    officialUrl:  'https://www.maine.gov/revenue/taxes/sales-use-service-provider-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'me-annual-report',
    name:         'Maine Annual Report',
    category:     'state',
    description:
      'Required annually for Maine LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due June 1 each year ($85 fee for corps; $85 for LLCs). ' +
      'File online at maine.gov/sos/cec. Failure to file results in revocation.',
    officialUrl:  'https://www.maine.gov/sos/cec/corp/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── MARYLAND ───────────────────────────────────────────────────────────────

  {
    id:           'md-sales-tax',
    name:         'Maryland Sales and Use Tax License',
    category:     'state',
    description:
      'Required before making taxable retail sales in Maryland. Register with the ' +
      'Comptroller of Maryland at marylandtaxes.gov. The license is free and does not ' +
      'expire. Maryland sales tax rate is 6% (9% for alcoholic beverages, 9% for ' +
      'tobacco products). Returns are due monthly, quarterly, or annually.',
    officialUrl:  'https://www.marylandtaxes.gov/business/sales-use/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'md-annual-report',
    name:         'Maryland Annual Report / Personal Property Tax Return',
    category:     'state',
    description:
      'Required annually for Maryland LLCs and corporations to confirm or update ' +
      'principal office and resident agent information with the State Department of ' +
      'Assessments and Taxation (SDAT). Due April 15 each year ($300 fee for most ' +
      'entities). File online at sdat.dat.maryland.gov. Failure to file results in ' +
      'forfeiture of entity status.',
    officialUrl:  'https://sdat.dat.maryland.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── MASSACHUSETTS ──────────────────────────────────────────────────────────

  {
    id:           'ma-sales-tax',
    name:         'Massachusetts Sales Tax Registration',
    category:     'state',
    description:
      'Required before making taxable retail sales in Massachusetts. Register with the ' +
      'Department of Revenue through MassTaxConnect at masstaxconnect.dor.state.ma.us. ' +
      'The registration is free and does not expire. Massachusetts sales tax rate is ' +
      '6.25%. Returns are due monthly or quarterly based on tax collected.',
    officialUrl:  'https://www.mass.gov/info-details/register-for-sales-tax-in-massachusetts',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ma-annual-report',
    name:         'Massachusetts Annual Report',
    category:     'state',
    description:
      'Required annually for Massachusetts LLCs and corporations to confirm or update ' +
      'principal office and officer information with the Secretary of the Commonwealth. ' +
      'Due on the anniversary date of formation ($500 fee for corps; $500 for LLCs). ' +
      'File online at corp.sec.state.ma.us. Failure to file results in administrative dissolution.',
    officialUrl:  'https://corp.sec.state.ma.us/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── MICHIGAN ───────────────────────────────────────────────────────────────

  {
    id:           'mi-sales-tax',
    name:         'Michigan Sales Tax License',
    category:     'state',
    description:
      'Required before making taxable retail sales in Michigan. Register with the ' +
      'Michigan Department of Treasury at michigan.gov/taxes ($25 fee). The license ' +
      'must be renewed every three years. Michigan sales tax rate is 6% with no local ' +
      'add-on taxes. Returns are due monthly, quarterly, or annually.',
    officialUrl:  'https://www.michigan.gov/taxes/business-taxes/sales-and-use-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  36,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'mi-annual-statement',
    name:         'Michigan Annual Statement',
    category:     'state',
    description:
      'Required annually for Michigan LLCs and corporations to confirm or update ' +
      'registered agent and officer information with LARA (Licensing and Regulatory ' +
      'Affairs). Due February 15 each year ($25 fee for LLCs; $25 for corporations). ' +
      'File online at michigan.gov/lara. Failure to file results in dissolution.',
    officialUrl:  'https://www.michigan.gov/lara/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── MINNESOTA ──────────────────────────────────────────────────────────────

  {
    id:           'mn-sales-tax',
    name:         'Minnesota Sales and Use Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Minnesota. Register with the ' +
      'Minnesota Department of Revenue at revenue.state.mn.us. The permit is free and ' +
      'does not expire. Minnesota state sales tax rate is 6.875%; local add-on rates ' +
      'are additional. Returns are due monthly, quarterly, or annually.',
    officialUrl:  'https://www.revenue.state.mn.us/sales-and-use-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'mn-annual-renewal',
    name:         'Minnesota Annual Renewal',
    category:     'state',
    description:
      'Required annually for Minnesota LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due December 31 each year ($0 fee for LLCs and corps — ' +
      'Minnesota eliminated annual renewal fees in 2023). File online at sos.state.mn.us.',
    officialUrl:  'https://www.sos.state.mn.us/business-liens/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── MISSISSIPPI ────────────────────────────────────────────────────────────

  {
    id:           'ms-sales-tax',
    name:         'Mississippi Sales Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Mississippi. Register with the ' +
      'Mississippi Department of Revenue at tap.dor.ms.gov. The permit is free and does ' +
      'not expire. Mississippi state sales tax rate is 7% (one of the highest in the ' +
      'nation). Returns are due monthly, quarterly, or annually based on liability.',
    officialUrl:  'https://www.dor.ms.gov/businesses/sales-and-use-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ms-annual-report',
    name:         'Mississippi Annual Report',
    category:     'state',
    description:
      'Required annually for Mississippi LLCs and corporations to confirm or update ' +
      'registered agent and principal office information with the Secretary of State. ' +
      'Due April 15 each year ($0 fee for LLCs; $25 for corporations). File online at ' +
      'sos.ms.gov. Failure to file results in revocation of the entity\'s authority ' +
      'to do business.',
    officialUrl:  'https://www.sos.ms.gov/business-services/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── MISSOURI ───────────────────────────────────────────────────────────────

  {
    id:           'mo-sales-tax',
    name:         'Missouri Seller\'s Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Missouri. Register with the ' +
      'Missouri Department of Revenue at dor.mo.gov. The permit is free and does not ' +
      'expire. Missouri state sales tax rate is 4.225%; local rates (city, county, ' +
      'special districts) can add significantly. Combined rates vary widely by location.',
    officialUrl:  'https://dor.mo.gov/taxation/business/tax-types/sales-use/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'mo-annual-report',
    name:         'Missouri Annual Report',
    category:     'state',
    description:
      'Required annually for Missouri LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and officer information with the Secretary ' +
      'of State. Due on the anniversary month of formation ($45 fee for LLCs; $45 for ' +
      'corps). File online at sos.mo.gov. Failure to file results in dissolution.',
    officialUrl:  'https://www.sos.mo.gov/business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── MONTANA ────────────────────────────────────────────────────────────────
  // Montana has no statewide sales tax.

  {
    id:           'mt-annual-report',
    name:         'Montana Annual Report',
    category:     'state',
    description:
      'Required annually for Montana LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due April 15 each year ($20 fee for LLCs; $15 for corps). ' +
      'File online at sosmt.gov. Montana has no state sales tax, but business license ' +
      'requirements vary by city and county.',
    officialUrl:  'https://sosmt.gov/business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── NEBRASKA ───────────────────────────────────────────────────────────────

  {
    id:           'ne-sales-tax',
    name:         'Nebraska Sales Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Nebraska. Register with the ' +
      'Nebraska Department of Revenue at revenue.nebraska.gov. The permit is free and ' +
      'does not expire. Nebraska state sales tax rate is 5.5%; local rates are additional. ' +
      'Returns are due monthly, quarterly, or annually based on liability.',
    officialUrl:  'https://revenue.nebraska.gov/businesses/sales-and-use-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ne-biennial-report',
    name:         'Nebraska Biennial Report',
    category:     'state',
    description:
      'Required every two years for Nebraska LLCs and corporations to confirm or update ' +
      'registered agent and principal office information with the Secretary of State. ' +
      'Due March 1 in odd-numbered years ($13 fee for LLCs; $26 for corps). File online ' +
      'at sos.nebraska.gov. Failure to file results in administrative dissolution.',
    officialUrl:  'https://www.sos.nebraska.gov/business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['all'],
  },

  // ── NEVADA ─────────────────────────────────────────────────────────────────

  {
    id:           'nv-sales-tax',
    name:         'Nevada Sales Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Nevada. Register with the Nevada ' +
      'Department of Taxation at tax.nv.gov. The permit is free and does not expire. ' +
      'Nevada state sales tax rate is 6.85% base; local rates (county) bring combined ' +
      'rates to 7.725%–8.375% in most counties. Returns are due monthly, quarterly, or annually.',
    officialUrl:  'https://tax.nv.gov/businesses/sales/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'nv-annual-list',
    name:         'Nevada Annual List of Officers',
    category:     'state',
    description:
      'Required annually for Nevada LLCs, corporations, and other registered entities to ' +
      'file a list of managers/members or officers/directors with the Secretary of State. ' +
      'Due on the last day of the anniversary month of formation ($150 fee for LLCs and ' +
      'corps). File online at nvsos.gov. Failure to file results in revocation.',
    officialUrl:  'https://www.nvsos.gov/sos/businesses/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── NEW HAMPSHIRE ──────────────────────────────────────────────────────────
  // New Hampshire has no general sales tax (limited meals & rentals tax).

  {
    id:           'nh-annual-report',
    name:         'New Hampshire Annual Report',
    category:     'state',
    description:
      'Required annually for New Hampshire LLCs, corporations, and other registered ' +
      'entities to confirm or update registered agent and officer information with the ' +
      'Secretary of State. Due April 1 each year ($100 fee for corps; $100 for LLCs). ' +
      'File online at sos.nh.gov. New Hampshire has no general state sales tax.',
    officialUrl:  'https://www.sos.nh.gov/corporations/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── NEW JERSEY ─────────────────────────────────────────────────────────────

  {
    id:           'nj-sales-tax',
    name:         'New Jersey Sales Tax Certificate of Authority',
    category:     'state',
    description:
      'Required before making taxable retail sales in New Jersey. Register with the ' +
      'Division of Revenue and Enterprise Services at njportal.com/DOR/BusinessRegistration. ' +
      'The certificate is free and does not expire. New Jersey sales tax rate is 6.625% ' +
      '(3.3125% in certain Urban Enterprise Zones). Returns are due monthly or quarterly.',
    officialUrl:  'https://www.njportal.com/DOR/businessregistration/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'nj-annual-report',
    name:         'New Jersey Annual Report',
    category:     'state',
    description:
      'Required annually for New Jersey LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Division of Revenue. Due on the last day of the anniversary month of formation ($75 ' +
      'fee). File online at njportal.com/DOR. Failure to file results in revocation of ' +
      'the entity\'s certificate of authority.',
    officialUrl:  'https://www.njportal.com/DOR/businessregistration/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── NEW MEXICO ─────────────────────────────────────────────────────────────

  {
    id:           'nm-gross-receipts-tax',
    name:         'New Mexico Gross Receipts Tax Registration',
    category:     'state',
    description:
      'New Mexico levies a Gross Receipts Tax (GRT) rather than a traditional sales tax. ' +
      'All businesses selling goods or services in New Mexico must register with the ' +
      'Taxation and Revenue Department at tap.state.nm.us. The GRT rate varies by location ' +
      '(typically 7.5%–9%). Registration is free; returns are due monthly or quarterly.',
    officialUrl:  'https://www.tax.newmexico.gov/businesses/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['all'],
  },

  {
    id:           'nm-annual-report',
    name:         'New Mexico Annual Report',
    category:     'state',
    description:
      'Required annually for New Mexico LLCs and corporations to confirm or update ' +
      'registered agent and officer information with the Secretary of State. Due on the ' +
      '15th day of the 4th month after fiscal year end ($50 fee for LLCs; $50 for corps). ' +
      'File online at sos.nm.gov. Failure to file results in administrative dissolution.',
    officialUrl:  'https://www.sos.nm.gov/business-services/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── NORTH CAROLINA ─────────────────────────────────────────────────────────

  {
    id:           'nc-sales-tax',
    name:         'North Carolina Sales and Use Tax Certificate',
    category:     'state',
    description:
      'Required before making taxable retail sales in North Carolina. Register with the ' +
      'NC Department of Revenue at ncdor.gov. The certificate is free and does not expire. ' +
      'NC state sales tax rate is 4.75%; counties add 2%, and transit districts may add ' +
      'more. Total combined rates typically range from 6.75% to 7.5%. Returns are due ' +
      'monthly, quarterly, or annually.',
    officialUrl:  'https://www.ncdor.gov/taxes-forms/sales-and-use-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'nc-annual-report',
    name:         'North Carolina Annual Report',
    category:     'state',
    description:
      'Required annually for North Carolina LLCs, corporations, and other registered ' +
      'entities to confirm or update registered agent and principal office information ' +
      'with the Secretary of State. Due April 15 each year ($200 fee for corps; $200 for ' +
      'LLCs). File online at sosnc.gov. Failure to file results in administrative dissolution.',
    officialUrl:  'https://www.sosnc.gov/divisions/business_registration/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'nc-dba',
    name:         'North Carolina Assumed Business Name (DBA)',
    category:     'state',
    description:
      'Required in North Carolina when any person or business operates under a name ' +
      'different from their legal name. File a Certificate of Assumed Name with the county ' +
      'Register of Deeds in each county where the business operates ($26 fee per county). ' +
      'Valid for 5 years. No newspaper publication required. LLCs/corps may also file an ' +
      'Assumed Name Registration with the SOS ($26).',
    officialUrl:  'https://www.sosnc.gov/divisions/business_registration/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  60,
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // ── NORTH DAKOTA ───────────────────────────────────────────────────────────

  {
    id:           'nd-sales-tax',
    name:         'North Dakota Sales and Use Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in North Dakota. Register with the ' +
      'ND Office of State Tax Commissioner at nd.gov/tax. The permit is free and does ' +
      'not expire. North Dakota state sales tax rate is 5%; local rates are additional. ' +
      'Returns are due monthly, quarterly, or annually based on liability.',
    officialUrl:  'https://www.nd.gov/tax/user/businesses/registrations/salesuse',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'nd-annual-report',
    name:         'North Dakota Annual Report',
    category:     'state',
    description:
      'Required annually for North Dakota LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due November 15 each year ($50 fee for LLCs; $25 for corps). ' +
      'File online at sos.nd.gov. Failure to file results in administrative dissolution.',
    officialUrl:  'https://sos.nd.gov/business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── OHIO ───────────────────────────────────────────────────────────────────

  {
    id:           'oh-vendors-license',
    name:         'Ohio Vendor\'s License (Sales Tax)',
    category:     'state',
    description:
      'Required before making taxable retail sales in Ohio. Apply for a Vendor\'s License ' +
      'with the Ohio Department of Taxation at tax.ohio.gov through the Ohio Business ' +
      'Gateway ($25 fee). A separate license is required for each county where the business ' +
      'has a fixed place of business. The license does not expire but must be surrendered ' +
      'if the business closes.',
    officialUrl:  'https://www.tax.ohio.gov/businesses/ohio-vendor-license',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'oh-biennial-report',
    name:         'Ohio Biennial Report',
    category:     'state',
    description:
      'Required every two years for Ohio LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due every two years on the anniversary month of formation ' +
      '($99 fee). File online at ohiosos.gov. Failure to file results in cancellation.',
    officialUrl:  'https://www.ohiosos.gov/businesses/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['all'],
  },

  // ── OKLAHOMA ───────────────────────────────────────────────────────────────

  {
    id:           'ok-sales-tax',
    name:         'Oklahoma Sales Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Oklahoma. Register with the ' +
      'Oklahoma Tax Commission through OkTAP at oktap.tax.ok.gov. The permit is free ' +
      'and does not expire. Oklahoma state sales tax rate is 4.5%; local rates can ' +
      'bring the combined rate to 8%–11% in some areas. Returns are due monthly or quarterly.',
    officialUrl:  'https://oktap.tax.ok.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ok-annual-certificate',
    name:         'Oklahoma Annual Certificate of Good Standing',
    category:     'state',
    description:
      'Oklahoma LLCs and corporations must file an annual Certificate with the Secretary ' +
      'of State to maintain good standing. Due by the anniversary month of formation ' +
      '($25 fee for LLCs; $25 for corps). File online at sos.ok.gov. Failure to file ' +
      'results in loss of good standing and eventual dissolution.',
    officialUrl:  'https://www.sos.ok.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── OREGON ─────────────────────────────────────────────────────────────────
  // Oregon has no statewide sales tax.

  {
    id:           'or-annual-report',
    name:         'Oregon Annual Report',
    category:     'state',
    description:
      'Required annually for Oregon LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due on the anniversary of the registration date ($100 fee ' +
      'for corps; $100 for LLCs). File online at sos.oregon.gov. Oregon has no statewide ' +
      'sales tax, but a Corporate Activity Tax applies to larger businesses.',
    officialUrl:  'https://sos.oregon.gov/business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'or-dba',
    name:         'Oregon Assumed Business Name (DBA)',
    category:     'state',
    description:
      'Required in Oregon when a business operates under a name other than its registered ' +
      'legal name. Register an Assumed Business Name with the Oregon Secretary of State ' +
      '($50 fee). Valid for 2 years and must be renewed. Sole proprietors and partnerships ' +
      'also register through the SOS rather than county-level filings.',
    officialUrl:  'https://sos.oregon.gov/business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['sole-proprietor', 'partnership', 'dba'],
  },

  // ── PENNSYLVANIA ───────────────────────────────────────────────────────────

  {
    id:           'pa-sales-tax',
    name:         'Pennsylvania Sales and Use Tax License',
    category:     'state',
    description:
      'Required before making taxable retail sales in Pennsylvania. Register with the ' +
      'PA Department of Revenue at revenue.pa.gov through the Pennsylvania Online ' +
      'Business Entity Registration (PA-100). The license is free and does not expire. ' +
      'Pennsylvania sales tax rate is 6% (2% local in Allegheny County; 2% in Philadelphia). ' +
      'Returns are due monthly, quarterly, or semi-annually.',
    officialUrl:  'https://www.revenue.pa.gov/Businesses-TaxInformation/Sales-UseTax/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'pa-annual-report',
    name:         'Pennsylvania Annual Report',
    category:     'state',
    description:
      'Required annually for Pennsylvania LLCs, corporations, and other registered ' +
      'entities to confirm or update registered office address and officer information ' +
      'with the Department of State. Due June 30 each year ($7 fee for LLCs; $7 for ' +
      'corps). PA began requiring annual reports in 2025. File online at dos.pa.gov.',
    officialUrl:  'https://www.dos.pa.gov/BusinessCharities/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── RHODE ISLAND ───────────────────────────────────────────────────────────

  {
    id:           'ri-sales-tax',
    name:         'Rhode Island Sales and Use Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Rhode Island. Register with the ' +
      'Division of Taxation at tax.ri.gov. The permit is free and does not expire. ' +
      'Rhode Island state sales tax rate is 7% with no local add-ons — one of the ' +
      'simplest sales tax structures in the country. Returns are due monthly.',
    officialUrl:  'https://www.ri.gov/taxation/business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ri-annual-report',
    name:         'Rhode Island Annual Report',
    category:     'state',
    description:
      'Required annually for Rhode Island LLCs, corporations, and other registered ' +
      'entities to confirm or update registered agent and principal office information ' +
      'with the Secretary of State. Due on the first day of the anniversary month of ' +
      'formation ($50 fee for LLCs; $50 for corps). File online at sos.ri.gov.',
    officialUrl:  'https://www.sos.ri.gov/divisions/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── SOUTH CAROLINA ─────────────────────────────────────────────────────────

  {
    id:           'sc-sales-tax',
    name:         'South Carolina Retail License (Sales Tax)',
    category:     'state',
    description:
      'Required before making taxable retail sales in South Carolina. Apply for a ' +
      'Retail License with the SC Department of Revenue at dor.sc.gov ($50 one-time fee). ' +
      'The license does not expire. SC state sales tax rate is 6%; local rates add up to ' +
      '3% in most counties. Returns are due monthly, quarterly, or annually.',
    officialUrl:  'https://dor.sc.gov/business/retail',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'sc-annual-report',
    name:         'South Carolina Annual Report',
    category:     'state',
    description:
      'Required annually for South Carolina LLCs, corporations, and other registered ' +
      'entities to confirm or update registered agent and principal office information ' +
      'with the Secretary of State. Due on the anniversary month of formation ($10 fee). ' +
      'File online at sos.sc.gov. Failure to file results in administrative dissolution.',
    officialUrl:  'https://sos.sc.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── SOUTH DAKOTA ───────────────────────────────────────────────────────────

  {
    id:           'sd-sales-tax',
    name:         'South Dakota Sales Tax License',
    category:     'state',
    description:
      'Required before making taxable sales in South Dakota. Register with the SD ' +
      'Department of Revenue at dor.sd.gov ($30 fee). The license must be renewed ' +
      'annually. South Dakota state sales tax rate is 4.5% (with some exemptions). ' +
      'South Dakota is one of the most streamlined sales tax states for remote sellers.',
    officialUrl:  'https://dor.sd.gov/businesses/taxes/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'sd-annual-report',
    name:         'South Dakota Annual Report',
    category:     'state',
    description:
      'Required annually for South Dakota LLCs, corporations, and other registered ' +
      'entities to confirm or update registered agent and principal office information ' +
      'with the Secretary of State. Due on the first day of the anniversary month of ' +
      'formation ($50 fee for LLCs; $50 for corps). File online at sdsos.gov.',
    officialUrl:  'https://sdsos.gov/business-services/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── TENNESSEE ──────────────────────────────────────────────────────────────

  {
    id:           'tn-sales-tax',
    name:         'Tennessee Sales and Use Tax Certificate of Registration',
    category:     'state',
    description:
      'Required before making taxable retail sales in Tennessee. Register through the ' +
      'Tennessee Taxpayer Access Point (TNTAP) at tntap.tn.gov. The certificate is free ' +
      'and does not expire. Tennessee state sales tax rate is 7% (9.75% for food and food ' +
      'ingredients at retail). Local rates add 1%–2.75% in most jurisdictions.',
    officialUrl:  'https://www.tn.gov/revenue/taxes/sales-and-use-tax.html',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'tn-annual-report',
    name:         'Tennessee Annual Report',
    category:     'state',
    description:
      'Required annually for Tennessee LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due April 1 each year ($300 fee for for-profit corps; $50 for ' +
      'LLCs). File online at sos.tn.gov. Failure to file by June 1 results in dissolution.',
    officialUrl:  'https://sos.tn.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── UTAH ───────────────────────────────────────────────────────────────────

  {
    id:           'ut-sales-tax',
    name:         'Utah Sales and Use Tax License',
    category:     'state',
    description:
      'Required before making taxable retail sales in Utah. Register with the Utah ' +
      'State Tax Commission at tap.utah.gov. The license is free and does not expire. ' +
      'Utah base state sales tax rate is 4.85%; combined state and local rates range ' +
      'from 6.1% to 9.05% depending on county and city. Returns are due monthly, ' +
      'quarterly, or annually.',
    officialUrl:  'https://tax.utah.gov/sales/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'ut-annual-report',
    name:         'Utah Annual Report',
    category:     'state',
    description:
      'Required annually for Utah LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Division of Corporations and Commercial Code. Due on the anniversary month of ' +
      'formation ($18 fee for LLCs; $18 for corps). File online at corporations.utah.gov.',
    officialUrl:  'https://corporations.utah.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── VERMONT ────────────────────────────────────────────────────────────────

  {
    id:           'vt-sales-tax',
    name:         'Vermont Sales and Use Tax Registration',
    category:     'state',
    description:
      'Required before making taxable retail sales in Vermont. Register with the Vermont ' +
      'Department of Taxes at tax.vermont.gov. The registration is free and does not ' +
      'expire. Vermont state sales tax rate is 6% (9% for meals and alcoholic beverages; ' +
      '9% for telecommunications services). Returns are due monthly or quarterly.',
    officialUrl:  'https://tax.vermont.gov/business/sales-and-use-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'vt-annual-report',
    name:         'Vermont Annual Report',
    category:     'state',
    description:
      'Required annually for Vermont LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due March 15 each year ($45 fee for LLCs; $45 for corps). ' +
      'File online at sos.vermont.gov. Failure to file results in administrative dissolution.',
    officialUrl:  'https://sos.vermont.gov/corporations/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── VIRGINIA ───────────────────────────────────────────────────────────────

  {
    id:           'va-sales-tax',
    name:         'Virginia Sales Tax Registration',
    category:     'state',
    description:
      'Required before making taxable retail sales in Virginia. Register with the ' +
      'Virginia Department of Taxation at business.virginia.gov. The registration is free ' +
      'and does not expire. Virginia state sales tax rate is 4.3% plus 1% local rate (0.7% ' +
      'additional in Northern VA and Hampton Roads). Returns are due monthly or quarterly.',
    officialUrl:  'https://www.tax.virginia.gov/retail-sales-and-use-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'va-annual-report',
    name:         'Virginia Annual Registration Fee',
    category:     'state',
    description:
      'Required annually for Virginia LLCs, corporations, and other registered entities ' +
      'to maintain their registration with the State Corporation Commission. Due by the ' +
      'last day of the 12th month of the fiscal year ($50 annual registration fee for LLCs; ' +
      'varies for corps based on authorized shares). File online at scc.virginia.gov.',
    officialUrl:  'https://www.scc.virginia.gov/clk/busregister.aspx',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── WASHINGTON ─────────────────────────────────────────────────────────────

  {
    id:           'wa-business-license',
    name:         'Washington State Business License',
    category:     'state',
    description:
      'Washington requires all businesses to obtain a Unified Business Identifier (UBI) ' +
      'number and Business License through the Department of Revenue. The license covers ' +
      'the state B&O tax, sales and use tax, and other state taxes in one application. ' +
      'Apply at dor.wa.gov ($19 annual fee). The license must be renewed annually.',
    officialUrl:  'https://dor.wa.gov/open-business/apply-business-license',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'wa-annual-report',
    name:         'Washington Annual Report',
    category:     'state',
    description:
      'Required annually for Washington LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due on the anniversary month of formation ($60 fee for LLCs; ' +
      '$60 for corps). File online at sos.wa.gov. Failure to file results in administrative dissolution.',
    officialUrl:  'https://www.sos.wa.gov/corps/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── WEST VIRGINIA ──────────────────────────────────────────────────────────

  {
    id:           'wv-sales-tax',
    name:         'West Virginia Sales and Use Tax Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in West Virginia. Register with the ' +
      'WV State Tax Department at tax.wv.gov through the Business Registration portal. ' +
      'The permit is free and does not expire. West Virginia state sales tax rate is 6%; ' +
      'municipalities may levy up to 1% additional. Returns are due monthly, quarterly, ' +
      'or annually.',
    officialUrl:  'https://tax.wv.gov/Business/BusinessRegistration/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'wv-annual-report',
    name:         'West Virginia Annual Report',
    category:     'state',
    description:
      'Required annually for West Virginia LLCs, corporations, and other registered ' +
      'entities to confirm or update registered agent and principal office information ' +
      'with the Secretary of State. Due July 1 each year ($25 fee for LLCs; $25 for ' +
      'corps). File online at sos.wv.gov. Failure to file results in revocation.',
    officialUrl:  'https://sos.wv.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── WISCONSIN ──────────────────────────────────────────────────────────────

  {
    id:           'wi-sales-tax',
    name:         'Wisconsin Seller\'s Permit',
    category:     'state',
    description:
      'Required before making taxable retail sales in Wisconsin. Register with the ' +
      'Wisconsin Department of Revenue at tap.revenue.wi.gov. The permit is free and ' +
      'does not expire. Wisconsin state sales tax rate is 5%; counties add 0.5%, and ' +
      'some counties/stadiums add additional rates. Returns are due monthly, quarterly, ' +
      'or annually.',
    officialUrl:  'https://www.revenue.wi.gov/Pages/FAQS/ise-stax.aspx',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'wi-annual-report',
    name:         'Wisconsin Annual Report',
    category:     'state',
    description:
      'Required annually for Wisconsin LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Department of Financial Institutions. Due on the anniversary quarter of formation ' +
      '($25 fee for LLCs; $25 for corps). File online at wdfi.org. Failure to file ' +
      'results in administrative dissolution.',
    officialUrl:  'https://www.wdfi.org/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── WYOMING ────────────────────────────────────────────────────────────────

  {
    id:           'wy-sales-tax',
    name:         'Wyoming Sales and Use Tax License',
    category:     'state',
    description:
      'Required before making taxable retail sales in Wyoming. Register with the ' +
      'Wyoming Department of Revenue at revenue.wyo.gov. The license fee is $60/year. ' +
      'Wyoming state sales tax rate is 4%; counties levy up to 2% additional, bringing ' +
      'combined rates to 5%–6% in most areas. Returns are due monthly, quarterly, or ' +
      'annually based on liability.',
    officialUrl:  'https://revenue.wyo.gov/sales-use-taxes/licensing-and-registration',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'wy-annual-report',
    name:         'Wyoming Annual Report',
    category:     'state',
    description:
      'Required annually for Wyoming LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Secretary of State. Due on the first day of the anniversary month of formation ' +
      '($52 minimum fee based on assets located and employed in Wyoming). File online ' +
      'at sos.wyo.gov. Failure to file results in dissolution.',
    officialUrl:  'https://sos.wyo.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── DISTRICT OF COLUMBIA ──────────────────────────────────────────────────

  {
    id:           'dc-sales-tax',
    name:         'DC Sales and Use Tax Registration',
    category:     'state',
    description:
      'Required before making taxable retail sales in the District of Columbia. Register ' +
      'with the DC Office of Tax and Revenue at mytax.dc.gov. The registration is free ' +
      'and does not expire. DC sales tax rate is 6% (10% for restaurant meals and ' +
      'alcohol, 14.5% for hotel rooms, 6% for parking). Returns are due monthly or quarterly.',
    officialUrl:  'https://mytax.dc.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'dc-biennial-report',
    name:         'DC Biennial Report',
    category:     'state',
    description:
      'Required every two years for DC LLCs, corporations, and other registered entities ' +
      'to confirm or update registered agent and principal office information with the ' +
      'Department of Licensing and Consumer Protection. Due April 1 in even-numbered years ' +
      '($300 fee). File online at dlcp.dc.gov. Failure to file results in revocation.',
    officialUrl:  'https://dlcp.dc.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['all'],
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// v24 — LOCAL_FORMS: County and City-Level Forms
// High-population counties and major cities with specific local requirements.
// IDs use county/city prefixes (e.g. 'palm-beach-', 'los-angeles-', 'nyc-').
// These are the most commonly needed local filings beyond the state level.
// ─────────────────────────────────────────────────────────────────────────────

export const LOCAL_FORMS: StateFormEntry[] = [

  // ── FLORIDA — Palm Beach County ────────────────────────────────────────────

  {
    id:           'palm-beach-business-tax-receipt',
    name:         'Palm Beach County Business Tax Receipt',
    category:     'local',
    description:
      'Required annually for all businesses operating in unincorporated Palm Beach County ' +
      'before opening or continuing operations. Issued by the Palm Beach County Tax ' +
      'Collector\'s Office. Fees are based on business type and gross revenue. Must be ' +
      'renewed by September 30 each year and posted visibly at the place of business. ' +
      'Businesses within city limits also need the city\'s own BTR.',
    officialUrl:  'https://www.pbcgov.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'palm-beach-home-occupation',
    name:         'Palm Beach County Home Occupation Permit',
    category:     'local',
    description:
      'Required for home-based businesses in unincorporated Palm Beach County to ensure ' +
      'business activity remains secondary to residential use. Apply through the Palm Beach ' +
      'County Planning, Zoning and Building Department. Restrictions include limits on ' +
      'signage, customer visits, non-resident employees, and stored inventory. ' +
      'Must be renewed with the Business Tax Receipt annually.',
    officialUrl:  'https://www.pbcgov.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['home-based', 'sole-proprietor', 'freelance'],
  },

  // ── FLORIDA — Miami-Dade County ────────────────────────────────────────────

  {
    id:           'miami-dade-business-tax-receipt',
    name:         'Miami-Dade County Local Business Tax Receipt',
    category:     'local',
    description:
      'Required annually for all businesses operating in unincorporated Miami-Dade County. ' +
      'Issued by the Miami-Dade County Tax Collector\'s Office. Fees range from $45 to over ' +
      '$1,000 depending on business type. Due September 30 each year. Businesses within ' +
      'incorporated cities (Miami, Hialeah, Coral Gables, etc.) also need that city\'s ' +
      'separate local business tax receipt.',
    officialUrl:  'https://www.miamidade.gov/taxcollector/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'miami-dade-food-permit',
    name:         'Miami-Dade County Food Establishment Permit',
    category:     'local',
    description:
      'Required for restaurants, food trucks, caterers, and any food service establishment ' +
      'operating in Miami-Dade County. Issued by the Miami-Dade County Health Department ' +
      '(MDCHD). Requires a plan review, facility inspection, and annual renewal. Fees range ' +
      'from $85 to over $1,000 based on risk category and seating capacity. Food trucks ' +
      'require a separate Mobile Food Dispensing Vehicle (MFDV) permit.',
    officialUrl:  'https://www.miamidade.gov/health/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  // ── FLORIDA — Broward County ────────────────────────────────────────────────

  {
    id:           'broward-business-tax-receipt',
    name:         'Broward County Local Business Tax Receipt',
    category:     'local',
    description:
      'Required annually for businesses operating in unincorporated Broward County or ' +
      'businesses operating within incorporated cities that delegate tax collection to ' +
      'the county. Issued by the Broward County Records, Taxes & Treasury Division. ' +
      'Fees are based on business type. Due September 30 each year.',
    officialUrl:  'https://www.broward.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── CALIFORNIA — Los Angeles County ────────────────────────────────────────

  {
    id:           'la-county-business-license',
    name:         'Los Angeles County Business License',
    category:     'local',
    description:
      'Required for businesses operating in unincorporated areas of Los Angeles County. ' +
      'Issued by the LA County Treasurer and Tax Collector. Fees are based on business ' +
      'type and gross receipts. Businesses within incorporated cities (LA City, Long Beach, ' +
      'Pasadena, etc.) must obtain that city\'s business license separately. Renewed annually.',
    officialUrl:  'https://ttc.lacounty.gov/business-license/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'la-city-business-tax',
    name:         'City of Los Angeles Business Tax Registration Certificate',
    category:     'local',
    description:
      'Required for all businesses operating within the City of Los Angeles, regardless of ' +
      'whether the business is located within city limits (nexus established by having ' +
      'customers or employees in the city). Register with the Office of Finance at ' +
      'finance.lacity.gov. First-year tax is based on estimated gross receipts; subsequent ' +
      'years are based on prior-year gross receipts. Renewed annually by February 28.',
    officialUrl:  'https://finance.lacity.gov/business-tax/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'la-county-health-permit',
    name:         'Los Angeles County Health Permit (Food Establishment)',
    category:     'local',
    description:
      'Required for restaurants, food trucks, caterers, and any food establishment in ' +
      'unincorporated Los Angeles County or cities that contract with LA County Environmental ' +
      'Health. Issued by the LA County Department of Public Health\'s Environmental Health ' +
      'Division. Fees range from $150 to over $1,500 based on facility type and risk ' +
      'category. Requires plan check, inspection, and annual renewal.',
    officialUrl:  'https://ehservices.publichealth.lacounty.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  {
    id:           'la-city-home-occupation',
    name:         'City of Los Angeles Home Occupation Permit',
    category:     'local',
    description:
      'Required for home-based businesses within the City of Los Angeles under the LA ' +
      'Municipal Code Section 12.05-A7. A Zoning and Building Department clearance is ' +
      'required. Restrictions include no customer visits, no employees on-site, no external ' +
      'signage, and no storage of merchandise visible from the street. Included in the ' +
      'business tax registration process.',
    officialUrl:  'https://www.ladbs.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['home-based', 'sole-proprietor', 'freelance'],
  },

  // ── TEXAS — Harris County (Houston) ────────────────────────────────────────

  {
    id:           'harris-county-food-permit',
    name:         'Harris County Public Health Food Establishment Permit',
    category:     'local',
    description:
      'Required for food service establishments in unincorporated Harris County, Texas. ' +
      'Issued by Harris County Public Health (HCPH). Fees vary by establishment type and ' +
      'seating capacity. Most food businesses within the City of Houston require a City of ' +
      'Houston Health Department permit instead. Annual renewal required.',
    officialUrl:  'https://publichealth.harriscountytx.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  {
    id:           'houston-business-license',
    name:         'City of Houston Business License & Permits',
    category:     'local',
    description:
      'Houston does not issue a general business license, but specific businesses require ' +
      'permits from the City of Houston. Food establishments, automotive businesses, ' +
      'massage establishments, and others require permits from the City of Houston Health ' +
      'or Planning departments. Register through the Houston Permitting Center at ' +
      'houstonpermittingcenter.org.',
    officialUrl:  'https://www.houstonpermittingcenter.org/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'retail', 'service'],
  },

  // ── NEW YORK — New York City ────────────────────────────────────────────────

  {
    id:           'nyc-business-license',
    name:         'New York City Business License / DCA License',
    category:     'local',
    description:
      'New York City requires licenses for many specific business types through the ' +
      'Department of Consumer and Worker Protection (DCWP). Licensed industries include ' +
      'sidewalk cafes, laundromats, secondhand dealers, home improvement contractors, and ' +
      'many others. Apply through NYC Business Express at business.nyc.gov. General retail ' +
      'does not require a general NYC business license but may require other permits.',
    officialUrl:  'https://business.nyc.gov/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['retail', 'food-service', 'service'],
  },

  {
    id:           'nyc-food-service-permit',
    name:         'New York City Food Service Establishment Permit',
    category:     'local',
    description:
      'Required for all restaurants, food trucks, mobile food vendors, cafes, and food ' +
      'manufacturers operating in New York City. Issued by the NYC Department of Health ' +
      'and Mental Hygiene (DOHMH). Annual permit fees range from $200 to $1,000+ depending ' +
      'on facility type and seating. All establishments receive a letter grade (A, B, C) ' +
      'from inspections. Apply at nyc.gov/health.',
    officialUrl:  'https://www.nyc.gov/site/doh/business/food-service/food-service-establishment-permits.page',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  {
    id:           'nyc-home-occupation',
    name:         'New York City Home Occupation Certificate of Occupancy',
    category:     'local',
    description:
      'Home-based businesses in NYC must comply with zoning regulations under the NYC ' +
      'Zoning Resolution. A home occupation permit (through a Certificate of Occupancy ' +
      'or Letter of No Objection) may be required depending on the nature of the business. ' +
      'Restrictions include no customer visits for certain businesses, no exterior signage, ' +
      'and no disturbance to neighbors. Contact the NYC Department of Buildings at nyc.gov/buildings.',
    officialUrl:  'https://www.nyc.gov/site/buildings/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['home-based', 'sole-proprietor', 'freelance'],
  },

  // ── ILLINOIS — Cook County / Chicago ───────────────────────────────────────

  {
    id:           'chicago-business-license',
    name:         'City of Chicago Business License',
    category:     'local',
    description:
      'Required for businesses operating within the City of Chicago. The type of license ' +
      'required depends on the business activity. Common license types include Retail Food ' +
      'Establishment, Limited Business License, Public Garage, and Tobacco Dealer. Apply ' +
      'through Chicago\'s Department of Business Affairs and Consumer Protection (BACP) ' +
      'at chicago.gov/bacp. Most licenses must be renewed annually or biennially.',
    officialUrl:  'https://www.chicago.gov/city/en/depts/bacp.html',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['all'],
  },

  {
    id:           'chicago-food-establishment',
    name:         'Chicago Retail Food Establishment License',
    category:     'local',
    description:
      'Required for restaurants, cafes, food trucks, and any retail food establishment ' +
      'operating within the City of Chicago. Issued by the Chicago BACP. Requires a ' +
      'facility inspection from the Chicago Department of Public Health before the license ' +
      'is granted. Annual fee based on seating capacity (typically $660–$1,320). ' +
      'Renewed biennially. Food trucks also need a Chicago Mobile Food License.',
    officialUrl:  'https://www.chicago.gov/city/en/depts/bacp.html',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  24,
    commonFor:    ['food-service', 'food-truck', 'restaurant'],
  },

  {
    id:           'cook-county-food-permit',
    name:         'Cook County Health Permit (Food Service)',
    category:     'local',
    description:
      'Required for food establishments operating in unincorporated Cook County, Illinois. ' +
      'Issued by the Cook County Department of Public Health. Fees vary by establishment ' +
      'type and risk level. Businesses within incorporated cities (Chicago, Evanston, etc.) ' +
      'are regulated by those cities\' health departments instead. Annual renewal required.',
    officialUrl:  'https://www.cookcountypublichealth.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'catering'],
  },

  // ── WASHINGTON — King County (Seattle) ─────────────────────────────────────

  {
    id:           'seattle-business-license',
    name:         'Seattle Business License (City Business License Tax Certificate)',
    category:     'local',
    description:
      'Required for all businesses with physical locations in Seattle or businesses ' +
      'making sales to Seattle customers above certain thresholds. Register with the ' +
      'City of Seattle Finance and Administrative Services at seattle.gov/license. ' +
      'Annual fee is based on gross receipts. The Seattle Business License Tax is ' +
      'separate from the state B&O tax.',
    officialUrl:  'https://www.seattle.gov/license-and-tax-administration/business-license-tax',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'king-county-food-permit',
    name:         'King County Food Establishment Permit',
    category:     'local',
    description:
      'Required for food service establishments operating in unincorporated King County, ' +
      'Washington. Issued by Public Health — Seattle & King County. Most Seattle ' +
      'establishments are regulated under the same Seattle-King County Public Health ' +
      'permit system. Fees range from $200 to $1,000+ based on facility type and risk ' +
      'category. Annual renewal required.',
    officialUrl:  'https://www.kingcounty.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  // ── ARIZONA — Maricopa County (Phoenix) ────────────────────────────────────

  {
    id:           'phoenix-business-license',
    name:         'City of Phoenix Sales Tax License (Transaction Privilege Tax)',
    category:     'local',
    description:
      'Phoenix imposes its own city-level Transaction Privilege Tax (TPT) in addition to ' +
      'the state TPT. Businesses operating in Phoenix must obtain a City of Phoenix TPT ' +
      'license through the Arizona Department of Revenue (ADOR) — the state and city ' +
      'licenses are obtained together at aztaxes.gov. Annual renewal required ($12/year).',
    officialUrl:  'https://www.phoenix.gov/pdd/bizlicense',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['retail', 'food-service', 'product-based'],
  },

  {
    id:           'maricopa-food-permit',
    name:         'Maricopa County Environmental Services Food Establishment Permit',
    category:     'local',
    description:
      'Required for food service establishments in unincorporated Maricopa County, Arizona. ' +
      'Issued by Maricopa County Environmental Services Department. Most food businesses ' +
      'within incorporated cities (Phoenix, Scottsdale, Tempe, Mesa) are permitted by ' +
      'those cities\' health/environmental services departments. Annual renewal required. ' +
      'Fees range from $125 to $600+ based on risk and seating.',
    officialUrl:  'https://www.maricopa.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  // ── NEVADA — Clark County (Las Vegas) ──────────────────────────────────────

  {
    id:           'clark-county-business-license',
    name:         'Clark County Business License',
    category:     'local',
    description:
      'Required for businesses operating in unincorporated Clark County, Nevada. Clark ' +
      'County encompasses the Las Vegas Strip, Henderson, North Las Vegas, and large ' +
      'unincorporated areas. Apply through the Clark County Business License Center. ' +
      'Fees range from $100 to several hundred dollars annually depending on business type. ' +
      'Businesses within the City of Las Vegas require a separate City license.',
    officialUrl:  'https://www.clarkcountynv.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'clark-county-health-permit',
    name:         'Southern Nevada Health District Food Establishment Permit',
    category:     'local',
    description:
      'Required for restaurants, food trucks, caterers, and food manufacturers operating ' +
      'in the Las Vegas metropolitan area (Clark County). Issued by the Southern Nevada ' +
      'Health District (SNHD). Fees range from $300 to $1,000+ based on facility type and ' +
      'seating capacity. Requires pre-operational inspection before permit is issued. ' +
      'Annual renewal required.',
    officialUrl:  'https://www.southernnevadahealthdistrict.org/permits-and-licenses/food-safety/food-establishment-permitting/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  // ── GEORGIA — Fulton County / Atlanta ──────────────────────────────────────

  {
    id:           'atlanta-business-license',
    name:         'City of Atlanta Business License (Occupation Tax Certificate)',
    category:     'local',
    description:
      'Required for businesses operating within the City of Atlanta. Apply through the ' +
      'Atlanta Department of Finance. The Occupation Tax is based on the number of ' +
      'employees and gross receipts. New businesses must also complete a zoning review. ' +
      'Annual renewal required. Businesses in unincorporated Fulton County require a ' +
      'separate Fulton County Business License.',
    officialUrl:  'https://www.atlantaga.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'fulton-county-food-permit',
    name:         'Fulton County Health Department Food Service Permit',
    category:     'local',
    description:
      'Required for food service establishments operating in Fulton County, Georgia ' +
      '(including Atlanta). Issued by the Fulton County Board of Health. Includes ' +
      'restaurants, food trucks, caterers, and food processors. Fees range from $100 ' +
      'to $500+ based on facility type and risk category. Annual renewal required after ' +
      'passing an initial inspection.',
    officialUrl:  'https://www.fultoncountyga.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  // ── PENNSYLVANIA — Philadelphia ─────────────────────────────────────────────

  {
    id:           'philadelphia-business-license',
    name:         'Philadelphia Business Privilege License',
    category:     'local',
    description:
      'Required for all businesses operating in Philadelphia before starting operations. ' +
      'Apply through the City of Philadelphia\'s Department of Revenue at phila.gov/revenue. ' +
      'No annual fee for the license, but businesses must pay the Business Income and ' +
      'Receipts Tax (BIRT) and Net Profits Tax annually. The license itself does not expire ' +
      'but must be updated when business information changes.',
    officialUrl:  'https://www.phila.gov/services/business-self-employment/register-your-business/',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  null,
    commonFor:    ['all'],
  },

  // ── OHIO — Cuyahoga County (Cleveland) ─────────────────────────────────────

  {
    id:           'cleveland-business-license',
    name:         'City of Cleveland Business License',
    category:     'local',
    description:
      'Cleveland requires business licenses for certain regulated industries including ' +
      'food establishments, contractor businesses, and various service businesses. Apply ' +
      'through the Cleveland Department of Building and Housing or the Division of ' +
      'Assessments and Licenses. General retail and service businesses may not need a ' +
      'separate city license beyond state registration.',
    officialUrl:  'https://www.clevelandohio.gov/business',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'contractor', 'service'],
  },

  // ── MICHIGAN — Wayne County (Detroit) ──────────────────────────────────────

  {
    id:           'detroit-business-license',
    name:         'City of Detroit Business License',
    category:     'local',
    description:
      'Detroit requires licenses for regulated industries including food service, ' +
      'entertainment venues, contractors, and auto dealers. Apply through the Detroit ' +
      'Buildings, Safety Engineering and Environmental Department (BSEED) or the City ' +
      'Clerk\'s office. Many businesses also need a Detroit City Income Tax registration. ' +
      'Contact Detroit Business One Stop for guidance at detroitmi.gov.',
    officialUrl:  'https://detroitmi.gov/business',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'contractor', 'entertainment'],
  },

  // ── COLORADO — Denver ──────────────────────────────────────────────────────

  {
    id:           'denver-business-license',
    name:         'Denver Business License',
    category:     'local',
    description:
      'Required for businesses operating in Denver. Denver is a consolidated city-county ' +
      'with its own tax system. Many businesses need a Denver Retail Sales Tax license ' +
      '(in addition to the state) and a General Business License. Apply through Denver ' +
      'Business Licensing at denvergov.org/businesslicenses. Denver also collects its ' +
      'own sales and use tax. Annual renewal required.',
    officialUrl:  'https://denvergov.org/businesslicenses',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── TENNESSEE — Shelby County / Memphis ────────────────────────────────────

  {
    id:           'memphis-business-license',
    name:         'City of Memphis / Shelby County Business License',
    category:     'local',
    description:
      'Businesses operating in Memphis must obtain both a City of Memphis and a Shelby ' +
      'County Business License from the Shelby County Clerk\'s office. The combined fee is ' +
      'modest ($15–$50) and both are obtained simultaneously. Annual renewal required. ' +
      'Food establishments also need a separate Shelby County Health Department permit.',
    officialUrl:  'https://www.shelbycountytn.gov/departments/county-clerk/business-license',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── CONNECTICUT — Bridgeport / Fairfield County ────────────────────────────
  // Note: Connecticut abolished county governments in 1960. There are no
  // county-level licenses or permits. All local licensing is issued by the
  // individual city or town. Fairfield County exists only as a geographic
  // designation; the Naugatuck Valley Health District and Bridgeport Regional
  // Business Council serve the region.

  {
    id:           'bridgeport-business-license',
    name:         'City of Bridgeport Business License',
    category:     'local',
    description:
      'Bridgeport, Connecticut requires a business license for most businesses operating ' +
      'within the city. Apply through the City of Bridgeport City Clerk\'s Office or the ' +
      'Office of Planning and Economic Development. There is no separate Fairfield County ' +
      'business license — Connecticut abolished county governments in 1960. ' +
      'All licensing is handled at the city or town level.',
    officialUrl:  'https://www.bridgeportct.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'ct-local-health-food-permit',
    name:         'Connecticut Local Health Department Food Service Permit',
    category:     'local',
    description:
      'In Connecticut, food service establishment permits are issued by the local town or ' +
      'city health department — not by Fairfield County (which has no government). ' +
      'Bridgeport food permits are issued by the Bridgeport Health Department. ' +
      'Other Fairfield County towns (Stamford, Greenwich, Norwalk, Danbury, Westport, etc.) ' +
      'each have their own local health departments that issue food permits. ' +
      'The CT Department of Public Health sets statewide standards at portal.ct.gov/dph.',
    officialUrl:  'https://portal.ct.gov/dph',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'food-truck', 'restaurant', 'catering'],
  },

  // ── NORTH CAROLINA — Mecklenburg County (Charlotte) ────────────────────────

  {
    id:           'charlotte-business-privilege-license',
    name:         'Charlotte Business Privilege License',
    category:     'local',
    description:
      'Charlotte, North Carolina requires a Business Privilege License for most businesses ' +
      'with a physical location or engaging in business within the city. Fee is $60 per ' +
      'year. Apply through the Charlotte Business Privilege License office. Mecklenburg ' +
      'County does not separately require a county business license for most businesses.',
    officialUrl:  'https://www.charlottenc.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── FLORIDA — Hillsborough County (Tampa metro) ────────────────────────────

  {
    id:           'hillsborough-business-tax-receipt',
    name:         'Hillsborough County Business Tax Receipt',
    category:     'local',
    description:
      'Hillsborough County, Florida requires a Local Business Tax Receipt (formerly ' +
      'Occupational License) for all businesses operating within unincorporated areas ' +
      'of the county. Apply through the Hillsborough County Tax Collector. Businesses ' +
      'within the city of Tampa also need a City of Tampa Business Tax Receipt.',
    officialUrl:  'https://www.hillstax.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Hillsborough County': 'https://www.hillstax.org' },
  },

  {
    id:           'hillsborough-food-permit',
    name:         'Hillsborough County Food Service Permit',
    category:     'local',
    description:
      'Hillsborough County, Florida requires a Food Service Permit through the Florida ' +
      'Department of Health in Hillsborough County for all food establishments. This ' +
      'covers restaurants, food trucks, caterers, mobile food vendors, and food ' +
      'processing facilities.',
    officialUrl:  'https://hillsborough.floridahealth.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Hillsborough County': 'https://hillsborough.floridahealth.gov' },
  },

  // ── FLORIDA — City of Tampa ────────────────────────────────────────────────

  {
    id:           'tampa-business-tax-receipt',
    name:         'City of Tampa Local Business Tax Receipt',
    category:     'local',
    description:
      'The City of Tampa, Florida requires a Local Business Tax Receipt for all ' +
      'businesses with a physical location within Tampa city limits. Apply through ' +
      'the City of Tampa Revenue and Finance Department. This is separate from the ' +
      'Hillsborough County Business Tax Receipt.',
    officialUrl:  'https://www.tampa.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── FLORIDA — Pinellas County (St. Petersburg / Clearwater) ───────────────

  {
    id:           'pinellas-business-tax-receipt',
    name:         'Pinellas County Business Tax Receipt',
    category:     'local',
    description:
      'Pinellas County, Florida requires a Local Business Tax Receipt for businesses ' +
      'operating in unincorporated Pinellas County. Apply through the Pinellas County ' +
      'Tax Collector. Businesses in St. Petersburg or Clearwater city limits also need ' +
      'the respective city business tax receipt.',
    officialUrl:  'https://www.pinellastaxcollector.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Pinellas County': 'https://www.pinellastaxcollector.org' },
  },

  {
    id:           'pinellas-food-permit',
    name:         'Pinellas County Food Service Permit',
    category:     'local',
    description:
      'Pinellas County food establishments must obtain a Food Service Permit through ' +
      'the Florida Department of Health in Pinellas County. This applies to restaurants, ' +
      'food trucks, mobile food vendors, caterers, and similar operations.',
    officialUrl:  'https://pinellas.floridahealth.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Pinellas County': 'https://pinellas.floridahealth.gov' },
  },

  // ── FLORIDA — Orange County (Orlando metro) ────────────────────────────────

  {
    id:           'orange-county-fl-business-tax-receipt',
    name:         'Orange County (FL) Business Tax Receipt',
    category:     'local',
    description:
      'Orange County, Florida requires a Local Business Tax Receipt for businesses ' +
      'in unincorporated areas of the county. Apply through the Orange County Tax ' +
      'Collector. Businesses within Orlando city limits also need a City of Orlando ' +
      'Business Tax Receipt.',
    officialUrl:  'https://www.octaxcol.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Orange County': 'https://www.octaxcol.com' },
  },

  {
    id:           'orange-county-fl-food-permit',
    name:         'Orange County (FL) Food Service Permit',
    category:     'local',
    description:
      'Orange County, Florida food service businesses must obtain a permit through ' +
      'the Florida Department of Health in Orange County. Covers restaurants, food ' +
      'trucks, mobile food vendors, caterers, and food processing operations.',
    officialUrl:  'https://orange.floridahealth.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Orange County': 'https://orange.floridahealth.gov' },
  },

  // ── FLORIDA — City of Orlando ──────────────────────────────────────────────

  {
    id:           'orlando-business-tax-receipt',
    name:         'City of Orlando Business Tax Receipt',
    category:     'local',
    description:
      'The City of Orlando, Florida requires a Business Tax Receipt for all businesses ' +
      'operating within city limits. Apply through the City of Orlando Planning Department. ' +
      'This is separate from the Orange County Business Tax Receipt required for ' +
      'unincorporated areas.',
    officialUrl:  'https://www.orlando.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── FLORIDA — Duval County / Jacksonville ─────────────────────────────────

  {
    id:           'jacksonville-business-tax-receipt',
    name:         'Jacksonville / Duval County Business Tax Receipt',
    category:     'local',
    description:
      'Jacksonville-Duval County, Florida has a consolidated city-county government. ' +
      'Businesses must obtain a Local Business Tax Receipt through the Duval County ' +
      'Tax Collector. Jacksonville is the largest city by area in the contiguous United ' +
      'States and uses a consolidated government since 1968.',
    officialUrl:  'https://www.coj.net',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Duval County': 'https://www.coj.net' },
  },

  {
    id:           'jacksonville-food-permit',
    name:         'Jacksonville / Duval County Food Service Permit',
    category:     'local',
    description:
      'Food service businesses in Jacksonville/Duval County must obtain a permit through ' +
      'the Florida Department of Health in Duval County. This covers restaurants, food ' +
      'trucks, caterers, and all food handling establishments.',
    officialUrl:  'https://duval.floridahealth.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Duval County': 'https://duval.floridahealth.gov' },
  },

  // ── FLORIDA — Sarasota County ──────────────────────────────────────────────

  {
    id:           'sarasota-county-business-tax-receipt',
    name:         'Sarasota County Business Tax Receipt',
    category:     'local',
    description:
      'Sarasota County, Florida requires a Local Business Tax Receipt for businesses ' +
      'operating in unincorporated areas. Apply through the Sarasota County Tax Collector. ' +
      'Businesses within the City of Sarasota also need a city business tax receipt.',
    officialUrl:  'https://www.sarasotataxcollector.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Sarasota County': 'https://www.sarasotataxcollector.com' },
  },

  // ── FLORIDA — Collier County (Naples metro) ────────────────────────────────

  {
    id:           'collier-county-business-tax-receipt',
    name:         'Collier County Business Tax Receipt',
    category:     'local',
    description:
      'Collier County, Florida (Naples metro area) requires a Local Business Tax Receipt ' +
      'for businesses in unincorporated areas. Apply through the Collier County Tax ' +
      'Collector. Separate receipts may be required for businesses within the City of ' +
      'Naples or Marco Island.',
    officialUrl:  'https://www.colliertaxcollector.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Collier County': 'https://www.colliertaxcollector.com' },
  },

  // ── FLORIDA — Volusia County (Daytona Beach area) ─────────────────────────

  {
    id:           'volusia-county-business-tax-receipt',
    name:         'Volusia County Business Tax Receipt',
    category:     'local',
    description:
      'Volusia County, Florida (Daytona Beach area) requires a Local Business Tax Receipt ' +
      'for businesses in unincorporated county areas. Apply through the Volusia County ' +
      'Tax Collector. Businesses in Daytona Beach or other municipalities need city-level ' +
      'business tax receipts as well.',
    officialUrl:  'https://www.volusiachc.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Volusia County': 'https://www.volusiachc.org' },
  },

  // ── FLORIDA — Seminole County ──────────────────────────────────────────────

  {
    id:           'seminole-county-business-tax-receipt',
    name:         'Seminole County Business Tax Receipt',
    category:     'local',
    description:
      'Seminole County, Florida requires a Local Business Tax Receipt for businesses ' +
      'in unincorporated areas of the county. Apply through the Seminole County Tax ' +
      'Collector. The county borders Orange County to the north of Orlando.',
    officialUrl:  'https://www.seminolecountytax.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Seminole County': 'https://www.seminolecountytax.com' },
  },

  // ── FLORIDA — Polk County (Lakeland area) ─────────────────────────────────

  {
    id:           'polk-county-business-tax-receipt',
    name:         'Polk County Business Tax Receipt',
    category:     'local',
    description:
      'Polk County, Florida (Lakeland/Winter Haven area) requires a Local Business Tax ' +
      'Receipt for businesses in unincorporated areas. Apply through the Polk County ' +
      'Tax Collector. Businesses in Lakeland, Winter Haven, or other municipalities ' +
      'also need city-level business tax receipts.',
    officialUrl:  'https://www.polktaxes.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Polk County': 'https://www.polktaxes.com' },
  },

  // ── FLORIDA — City of Miami ────────────────────────────────────────────────

  {
    id:           'miami-city-business-license',
    name:         'City of Miami Business License (BTR)',
    category:     'local',
    description:
      'The City of Miami, Florida requires a Local Business Tax Receipt (BTR) for all ' +
      'businesses operating within city limits. Apply through the City of Miami Finance ' +
      'Department. This is separate from the Miami-Dade County Business Tax Receipt ' +
      'required for businesses in unincorporated Miami-Dade.',
    officialUrl:  'https://www.miamigov.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── TEXAS — Dallas County / City of Dallas ────────────────────────────────

  {
    id:           'dallas-business-registration',
    name:         'City of Dallas Business Registration',
    category:     'local',
    description:
      'The City of Dallas, Texas does not require a general business license, but ' +
      'certain business types require specific permits and registrations. Home-based ' +
      'businesses need a Home Occupation Permit. Food businesses require a Dallas ' +
      'Environmental Health permit. Contractors need city-specific licensing.',
    officialUrl:  'https://dallascityhall.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'dallas-food-permit',
    name:         'City of Dallas Food Establishment Permit',
    category:     'local',
    description:
      'Food service businesses in Dallas, Texas must obtain a Food Establishment Permit ' +
      'from the City of Dallas Environmental and Health Services Department. This covers ' +
      'restaurants, food trucks (mobile food vendors), caterers, and food retail ' +
      'establishments.',
    officialUrl:  'https://dallascityhall.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
  },

  // ── TEXAS — Austin / Travis County ────────────────────────────────────────

  {
    id:           'austin-business-registration',
    name:         'City of Austin Business Registration',
    category:     'local',
    description:
      'Austin, Texas does not require a general city business license. However, ' +
      'most businesses must register with the Texas Secretary of State and obtain ' +
      'a Texas Sales Tax Permit if selling taxable goods. Certain activities require ' +
      'Austin-specific permits: food establishments, home occupations, contractors.',
    officialUrl:  'https://www.austintexas.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'austin-food-permit',
    name:         'Austin / Travis County Food Enterprise Permit',
    category:     'local',
    description:
      'Food service businesses in Austin must obtain a Food Enterprise Permit from ' +
      'Austin Public Health. This covers restaurants, mobile food vendors (food trucks), ' +
      'caterers, temporary food events, and cottage food producers selling above ' +
      'cottage food exemption thresholds.',
    officialUrl:  'https://www.austintexas.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
  },

  // ── TEXAS — San Antonio / Bexar County ────────────────────────────────────

  {
    id:           'san-antonio-business-registration',
    name:         'City of San Antonio Business Registration',
    category:     'local',
    description:
      'San Antonio, Texas does not require a general city-wide business license. ' +
      'Businesses must register with the State of Texas and obtain relevant state ' +
      'permits. Food establishments, contractors, and childcare providers need ' +
      'specific San Antonio/Bexar County permits and inspections.',
    officialUrl:  'https://www.sanantonio.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'san-antonio-food-permit',
    name:         'San Antonio Metropolitan Health Food Establishment Permit',
    category:     'local',
    description:
      'Food establishments in San Antonio and Bexar County must obtain a permit from ' +
      'the San Antonio Metropolitan Health District. This covers restaurants, food ' +
      'trucks, mobile food vendors, caterers, and temporary food events.',
    officialUrl:  'https://www.sanantonio.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
  },

  // ── TEXAS — Fort Worth / Tarrant County ───────────────────────────────────

  {
    id:           'fort-worth-business-registration',
    name:         'City of Fort Worth Business Registration',
    category:     'local',
    description:
      'Fort Worth, Texas does not require a general city business license. Businesses ' +
      'in Tarrant County should register with the State of Texas. Specific businesses ' +
      'such as food establishments, home-based businesses, and contractors need ' +
      'Fort Worth/Tarrant County permits.',
    officialUrl:  'https://www.fortworthtexas.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── TEXAS — El Paso County ────────────────────────────────────────────────

  {
    id:           'el-paso-business-registration',
    name:         'City of El Paso Business Registration',
    category:     'local',
    description:
      'El Paso, Texas businesses must register with the City of El Paso Development ' +
      'Services Department for applicable permits. Food businesses require a Food ' +
      'Establishment Permit from El Paso Public Health. Businesses must also register ' +
      'with the State of Texas.',
    officialUrl:  'https://www.elpasotexas.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  // ── CALIFORNIA — San Diego County / City of San Diego ─────────────────────

  {
    id:           'san-diego-business-tax-certificate',
    name:         'City of San Diego Business Tax Certificate',
    category:     'local',
    description:
      'The City of San Diego, California requires a Business Tax Certificate for all ' +
      'businesses operating within city limits. Apply through the San Diego City ' +
      'Treasurer. Home-based businesses in San Diego also need a Home Occupation ' +
      'Permit in addition to the Business Tax Certificate.',
    officialUrl:  'https://www.sandiego.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'san-diego-county-food-permit',
    name:         'San Diego County Food Facility Permit',
    category:     'local',
    description:
      'San Diego County requires a Food Facility Permit from the County Department ' +
      'of Environmental Health for all food establishments, including restaurants, ' +
      'food trucks, caterers, and food retail. City of San Diego businesses also ' +
      'need this county permit.',
    officialUrl:  'https://www.sandiegocounty.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'San Diego County': 'https://www.sandiegocounty.gov' },
  },

  // ── CALIFORNIA — Orange County ─────────────────────────────────────────────

  {
    id:           'orange-county-ca-food-permit',
    name:         'Orange County (CA) Health Care Agency Food Permit',
    category:     'local',
    description:
      'Orange County, California requires a food facility permit from the Orange County ' +
      'Health Care Agency for all food establishments, including restaurants, food trucks, ' +
      'caterers, mobile food vendors, and food retailers. Cities within Orange County may ' +
      'also require their own business licenses.',
    officialUrl:  'https://www.ochealthinfo.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Orange County': 'https://www.ochealthinfo.com' },
  },

  // ── CALIFORNIA — Santa Clara County (San Jose / Silicon Valley) ────────────

  {
    id:           'san-jose-business-tax-certificate',
    name:         'City of San Jose Business Tax Certificate',
    category:     'local',
    description:
      'San Jose, California requires a Business Tax Certificate for all businesses ' +
      'operating within city limits. Apply through the San Jose Finance Department. ' +
      'Santa Clara County businesses in unincorporated areas must check with the ' +
      'county for applicable permit requirements.',
    officialUrl:  'https://www.sanjoseca.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'santa-clara-county-food-permit',
    name:         'Santa Clara County Food Facility Permit',
    category:     'local',
    description:
      'Santa Clara County, California requires a food facility permit from the County ' +
      'Department of Environmental Health for restaurants, food trucks, caterers, and ' +
      'food retailers. This covers San Jose and all unincorporated Santa Clara County ' +
      'food operations.',
    officialUrl:  'https://www.sccgov.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Santa Clara County': 'https://www.sccgov.org' },
  },

  // ── CALIFORNIA — Alameda County (Oakland / Berkeley) ──────────────────────

  {
    id:           'oakland-business-tax-certificate',
    name:         'City of Oakland Business Tax Certificate',
    category:     'local',
    description:
      'Oakland, California requires a Business Tax Certificate from the City of Oakland ' +
      'Finance Department for all businesses operating within the city. Rates vary by ' +
      'business type and gross receipts. Berkeley and other Alameda County cities have ' +
      'their own separate business license requirements.',
    officialUrl:  'https://www.oaklandca.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'alameda-county-food-permit',
    name:         'Alameda County Food Facility Permit',
    category:     'local',
    description:
      'Alameda County, California food establishments must obtain a permit from the ' +
      'Alameda County Environmental Health Department. This applies to restaurants, ' +
      'food trucks, mobile food facilities, caterers, and food retailers throughout ' +
      'the county including Oakland, Berkeley, and Fremont.',
    officialUrl:  'https://www.acgov.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Alameda County': 'https://www.acgov.org' },
  },

  // ── CALIFORNIA — Sacramento County ────────────────────────────────────────

  {
    id:           'sacramento-city-business-license',
    name:         'City of Sacramento Business License',
    category:     'local',
    description:
      'The City of Sacramento, California requires a Business Operation Tax Certificate ' +
      'for all businesses operating within city limits. Apply through the City of ' +
      'Sacramento Finance Department. Sacramento County may have additional requirements ' +
      'for businesses in unincorporated areas.',
    officialUrl:  'https://www.cityofsacramento.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'sacramento-county-food-permit',
    name:         'Sacramento County Environmental Health Food Permit',
    category:     'local',
    description:
      'Food establishments in Sacramento County must obtain a Retail Food Facility ' +
      'Permit from the Sacramento County Environmental Management Department. This ' +
      'covers restaurants, food trucks, caterers, temporary food facilities, and ' +
      'food retail throughout Sacramento and unincorporated areas.',
    officialUrl:  'https://www.saccounty.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Sacramento County': 'https://www.saccounty.gov' },
  },

  // ── CALIFORNIA — Riverside County ─────────────────────────────────────────

  {
    id:           'riverside-county-food-permit',
    name:         'Riverside County Food Facility Permit',
    category:     'local',
    description:
      'Riverside County, California food establishments must obtain a permit from the ' +
      'Riverside County Department of Environmental Health. This applies to restaurants, ' +
      'food trucks, caterers, mobile food facilities, and food retailers throughout ' +
      'the Inland Empire.',
    officialUrl:  'https://www.rivcoeh.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Riverside County': 'https://www.rivcoeh.org' },
  },

  // ── CALIFORNIA — San Bernardino County ────────────────────────────────────

  {
    id:           'san-bernardino-county-food-permit',
    name:         'San Bernardino County Food Facility Permit',
    category:     'local',
    description:
      'San Bernardino County, California requires a food facility permit from the ' +
      'County Environmental Health Services for all food establishments. This covers ' +
      'restaurants, food trucks, mobile food vendors, caterers, and food retailers ' +
      'in the Inland Empire region.',
    officialUrl:  'https://www.sbcounty.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'San Bernardino County': 'https://www.sbcounty.gov' },
  },

  // ── NEW YORK — Nassau County ───────────────────────────────────────────────

  {
    id:           'nassau-county-business-license',
    name:         'Nassau County Business License / Permit',
    category:     'local',
    description:
      'Nassau County, New York has no universal business license, but certain business ' +
      'types require county-level permits and inspections. Home-based businesses, food ' +
      'establishments, contractors, and health-related businesses typically need Nassau ' +
      'County permits. Incorporated villages and towns have separate licensing.',
    officialUrl:  'https://www.nassaucountyny.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Nassau County': 'https://www.nassaucountyny.gov' },
  },

  {
    id:           'nassau-county-food-permit',
    name:         'Nassau County Food Establishment Permit',
    category:     'local',
    description:
      'Nassau County, New York food establishments require a permit from the Nassau ' +
      'County Department of Health. This covers restaurants, food trucks, caterers, ' +
      'mobile food vendors, and food retail establishments operating in Nassau County.',
    officialUrl:  'https://www.nassaucountyny.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Nassau County': 'https://www.nassaucountyny.gov' },
  },

  // ── NEW YORK — Suffolk County ──────────────────────────────────────────────

  {
    id:           'suffolk-county-food-permit',
    name:         'Suffolk County Food Establishment Permit',
    category:     'local',
    description:
      'Suffolk County, New York food service businesses must obtain a permit from the ' +
      'Suffolk County Department of Health Services. This covers restaurants, food ' +
      'trucks, caterers, mobile food vendors, and food retail establishments in the ' +
      'Long Island region.',
    officialUrl:  'https://www.suffolkcountyny.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Suffolk County': 'https://www.suffolkcountyny.gov' },
  },

  // ── NEW YORK — Westchester County ─────────────────────────────────────────

  {
    id:           'westchester-county-food-permit',
    name:         'Westchester County Food Service Permit',
    category:     'local',
    description:
      'Westchester County, New York food establishments must obtain a permit from the ' +
      'Westchester County Department of Health. This covers restaurants, food trucks, ' +
      'caterers, mobile food vendors, and food retail in Westchester County.',
    officialUrl:  'https://health.westchestergov.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Westchester County': 'https://health.westchestergov.com' },
  },

  // ── NEW YORK — Erie County (Buffalo) ──────────────────────────────────────

  {
    id:           'buffalo-business-license',
    name:         'City of Buffalo Business License',
    category:     'local',
    description:
      'Buffalo, New York businesses may require a city-issued license depending on ' +
      'business type. Apply through the City of Buffalo Department of Permit and ' +
      'Inspection Services. Erie County may have additional requirements. Businesses ' +
      'must also register with New York State.',
    officialUrl:  'https://www.buffalony.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Erie County': 'https://www2.erie.gov' },
  },

  {
    id:           'erie-county-food-permit',
    name:         'Erie County Food Service Establishment Permit',
    category:     'local',
    description:
      'Erie County, New York food service businesses must obtain a permit from the ' +
      'Erie County Department of Health. This covers restaurants, food trucks, caterers, ' +
      'mobile food vendors, and food retail establishments in the Buffalo metro area.',
    officialUrl:  'https://www2.erie.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Erie County': 'https://www2.erie.gov' },
  },

  // ── ILLINOIS — DuPage County ───────────────────────────────────────────────

  {
    id:           'dupage-county-food-permit',
    name:         'DuPage County Food Service Permit',
    category:     'local',
    description:
      'DuPage County, Illinois food establishments must obtain a permit from the ' +
      'DuPage County Health Department. This covers restaurants, food trucks, caterers, ' +
      'mobile food vendors, and food retail in the western Chicago suburban area, ' +
      'including Naperville, Aurora, and Wheaton.',
    officialUrl:  'https://www.dupagehealth.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'DuPage County': 'https://www.dupagehealth.org' },
  },

  // ── GEORGIA — DeKalb County ────────────────────────────────────────────────

  {
    id:           'dekalb-county-business-license',
    name:         'DeKalb County Business License',
    category:     'local',
    description:
      'DeKalb County, Georgia requires a Business License for all businesses operating ' +
      'within unincorporated areas of the county. Apply through the DeKalb County ' +
      'Department of Planning and Sustainability. Businesses within incorporated cities ' +
      'like Decatur also need city-level business licenses.',
    officialUrl:  'https://www.dekalbcountyga.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'DeKalb County': 'https://www.dekalbcountyga.gov' },
  },

  {
    id:           'dekalb-county-food-permit',
    name:         'DeKalb County Food Service Permit',
    category:     'local',
    description:
      'DeKalb County, Georgia food establishments must obtain a Food Service Permit ' +
      'from the DeKalb County Board of Health. This covers restaurants, food trucks, ' +
      'caterers, mobile food vendors, and food retail in the Atlanta metro eastern suburbs.',
    officialUrl:  'https://www.dekalbcountyga.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'DeKalb County': 'https://www.dekalbcountyga.gov' },
  },

  // ── GEORGIA — Gwinnett County ──────────────────────────────────────────────

  {
    id:           'gwinnett-county-business-license',
    name:         'Gwinnett County Business License',
    category:     'local',
    description:
      'Gwinnett County, Georgia requires a Business License for businesses in ' +
      'unincorporated areas. Apply through the Gwinnett County Department of Planning ' +
      'and Development. Incorporated cities like Lawrenceville require separate city ' +
      'business licenses.',
    officialUrl:  'https://www.gwinnettcounty.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Gwinnett County': 'https://www.gwinnettcounty.com' },
  },

  {
    id:           'gwinnett-county-food-permit',
    name:         'Gwinnett County Food Service Permit',
    category:     'local',
    description:
      'Gwinnett County, Georgia food establishments must obtain a Food Service Permit ' +
      'from the Gwinnett County Board of Health. This covers restaurants, food trucks, ' +
      'caterers, mobile food vendors, and food retail in the northeast Atlanta suburbs.',
    officialUrl:  'https://www.gwinnettcounty.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Gwinnett County': 'https://www.gwinnettcounty.com' },
  },

  // ── GEORGIA — Cobb County ──────────────────────────────────────────────────

  {
    id:           'cobb-county-business-license',
    name:         'Cobb County Business License',
    category:     'local',
    description:
      'Cobb County, Georgia requires a Business License for all businesses operating ' +
      'in unincorporated areas. Apply through Cobb County Community Development. ' +
      'Cities within Cobb County, such as Marietta, have separate city business ' +
      'license requirements.',
    officialUrl:  'https://www.cobbcounty.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
    countyUrls:   { 'Cobb County': 'https://www.cobbcounty.org' },
  },

  {
    id:           'cobb-county-food-permit',
    name:         'Cobb County Food Service Permit',
    category:     'local',
    description:
      'Cobb County, Georgia food establishments must obtain a Food Service Permit from ' +
      'the Cobb & Douglas Public Health Department. This covers restaurants, food trucks, ' +
      'caterers, and food retail in the northwest Atlanta suburbs including Marietta.',
    officialUrl:  'https://www.cobbcounty.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Cobb County': 'https://www.cobbcounty.org' },
  },

  // ── OREGON — Portland / Multnomah County ──────────────────────────────────

  {
    id:           'portland-business-license',
    name:         'Portland Business License',
    category:     'local',
    description:
      'Portland, Oregon requires a Business License from the City of Portland Revenue ' +
      'Division for all businesses with gross receipts in Portland. The license fee is ' +
      'based on annual gross receipts. Multnomah County also has a separate business ' +
      'income tax for businesses and self-employed individuals.',
    officialUrl:  'https://www.portland.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'multnomah-county-food-permit',
    name:         'Multnomah County Food Handler Permit',
    category:     'local',
    description:
      'Portland/Multnomah County, Oregon food establishments must obtain a Food Handler ' +
      'Permit from Multnomah County Environmental Health. This covers restaurants, food ' +
      'carts, food trucks, caterers, and all food service operations in the Portland metro.',
    officialUrl:  'https://www.multco.us',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Multnomah County': 'https://www.multco.us' },
  },

  // ── NORTH CAROLINA — Wake County (Raleigh) ────────────────────────────────

  {
    id:           'raleigh-business-license',
    name:         'City of Raleigh Business License',
    category:     'local',
    description:
      'Raleigh, North Carolina requires businesses to register with the city and obtain ' +
      'applicable permits. While NC does not have a state-level business license, Wake ' +
      'County and the City of Raleigh require specific permits for food establishments, ' +
      'contractors, and home occupations.',
    officialUrl:  'https://raleighnc.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'wake-county-food-permit',
    name:         'Wake County Food Service Permit',
    category:     'local',
    description:
      'Wake County, North Carolina food establishments must obtain a permit from the ' +
      'Wake County Environmental Services. This covers restaurants, food trucks, caterers, ' +
      'mobile food vendors, and food retail in Raleigh and surrounding Wake County.',
    officialUrl:  'https://www.wakegov.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Wake County': 'https://www.wakegov.com' },
  },

  // ── MINNESOTA — Minneapolis / Hennepin County ──────────────────────────────

  {
    id:           'minneapolis-business-license',
    name:         'City of Minneapolis Business License',
    category:     'local',
    description:
      'Minneapolis, Minnesota requires a business license for certain business types. ' +
      'Apply through the Minneapolis Community Planning and Economic Development ' +
      'department. Food businesses, home-based businesses, and certain service businesses ' +
      'require specific city-issued licenses.',
    officialUrl:  'https://www.minneapolismn.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'hennepin-county-food-permit',
    name:         'Minneapolis / Hennepin County Food Establishment License',
    category:     'local',
    description:
      'Food establishments in Minneapolis are licensed by the City of Minneapolis ' +
      'Environmental Health. Businesses in unincorporated Hennepin County work with ' +
      'Hennepin County Public Health. This covers restaurants, food trucks, caterers, ' +
      'mobile food vendors, and food retail.',
    officialUrl:  'https://www.minneapolismn.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Hennepin County': 'https://www.hennepin.us' },
  },

  // ── PENNSYLVANIA — Pittsburgh / Allegheny County ──────────────────────────

  {
    id:           'pittsburgh-business-license',
    name:         'City of Pittsburgh Business License',
    category:     'local',
    description:
      'Pittsburgh, Pennsylvania businesses must obtain applicable city permits and ' +
      'licenses through the City of Pittsburgh Department of Permits, Licenses, and ' +
      'Inspections. Food establishments, contractors, and home-based businesses have ' +
      'specific licensing requirements.',
    officialUrl:  'https://pittsburghpa.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'allegheny-county-food-permit',
    name:         'Allegheny County Food Establishment Permit',
    category:     'local',
    description:
      'Allegheny County, Pennsylvania food establishments must obtain a permit from the ' +
      'Allegheny County Health Department. This covers restaurants, food trucks, caterers, ' +
      'mobile food vendors, and food retail in Pittsburgh and surrounding Allegheny County.',
    officialUrl:  'https://www.alleghenycounty.us',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Allegheny County': 'https://www.alleghenycounty.us' },
  },

  // ── UTAH — Salt Lake County / Salt Lake City ───────────────────────────────

  {
    id:           'salt-lake-city-business-license',
    name:         'Salt Lake City Business License',
    category:     'local',
    description:
      'Salt Lake City, Utah requires a Business License for all businesses operating ' +
      'within city limits. Apply through the Salt Lake City Business Licensing Division. ' +
      'Salt Lake County businesses in unincorporated areas must obtain county permits.',
    officialUrl:  'https://www.slc.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'salt-lake-county-food-permit',
    name:         'Salt Lake County Food Service Permit',
    category:     'local',
    description:
      'Food establishments in Salt Lake County, Utah must obtain a permit from the ' +
      'Salt Lake County Health Department. This covers restaurants, food trucks, caterers, ' +
      'mobile food vendors, and food retail throughout Salt Lake City and the county.',
    officialUrl:  'https://slco.org',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Salt Lake County': 'https://slco.org' },
  },

  // ── LOUISIANA — New Orleans / Orleans Parish ───────────────────────────────

  {
    id:           'new-orleans-business-license',
    name:         'City of New Orleans Business License',
    category:     'local',
    description:
      'New Orleans, Louisiana (Orleans Parish) requires a Business License from the ' +
      'New Orleans Revenue Bureau for all businesses operating within the city. ' +
      'Food establishments also require a separate permit from the Louisiana Department ' +
      'of Health. New Orleans has a unique license structure for tourism-related businesses.',
    officialUrl:  'https://www.nola.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'new-orleans-food-permit',
    name:         'New Orleans Food Service Establishment Permit',
    category:     'local',
    description:
      'Food establishments in New Orleans must obtain a permit from the Louisiana ' +
      'Department of Health, Office of Public Health. This covers restaurants, food ' +
      'trucks, caterers, mobile food vendors, and food retail. New Orleans is famous ' +
      'for its food culture and has active food truck and restaurant permitting.',
    officialUrl:  'https://www.nola.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
  },

  // ── NEW MEXICO — Albuquerque / Bernalillo County ───────────────────────────

  {
    id:           'albuquerque-business-registration',
    name:         'City of Albuquerque Business Registration',
    category:     'local',
    description:
      'Albuquerque, New Mexico businesses must register with the City of Albuquerque ' +
      'and obtain applicable licenses through the City\'s Planning Department. Food ' +
      'establishments, contractors, and home-based businesses require specific ' +
      'Albuquerque/Bernalillo County permits.',
    officialUrl:  'https://www.cabq.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'bernalillo-county-food-permit',
    name:         'Bernalillo County / Albuquerque Food Service Permit',
    category:     'local',
    description:
      'Food establishments in Albuquerque and Bernalillo County, New Mexico must obtain ' +
      'a permit from the Bernalillo County Environmental Health Department. This covers ' +
      'restaurants, food trucks, caterers, mobile food vendors, and food retail.',
    officialUrl:  'https://www.bernco.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Bernalillo County': 'https://www.bernco.gov' },
  },

  // ── MARYLAND — Baltimore City / Baltimore County ───────────────────────────

  {
    id:           'baltimore-city-business-license',
    name:         'Baltimore City Business License',
    category:     'local',
    description:
      'Baltimore City, Maryland (an independent city, not part of Baltimore County) ' +
      'requires a Business License from the Maryland State Department of Assessments ' +
      'and Taxation. Food establishments also need city health permits. Note: Baltimore ' +
      'City and Baltimore County are separate jurisdictions.',
    officialUrl:  'https://www.baltimorecity.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'baltimore-city-food-permit',
    name:         'Baltimore City Food Service Permit',
    category:     'local',
    description:
      'Food establishments in Baltimore City must obtain a permit from the Baltimore ' +
      'City Health Department. This covers restaurants, food trucks, caterers, mobile ' +
      'food vendors, and food retail within Baltimore City limits.',
    officialUrl:  'https://www.baltimorecity.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
  },

  // ── VIRGINIA — Richmond / Henrico County ──────────────────────────────────

  {
    id:           'richmond-business-license',
    name:         'City of Richmond Business License (BPOL)',
    category:     'local',
    description:
      'Richmond, Virginia requires a Business Professional and Occupational License ' +
      '(BPOL) for businesses with gross receipts over $100,000. Apply through the ' +
      'City of Richmond Department of Finance. The fee is based on gross receipts. ' +
      'Henrico County has a separate BPOL for businesses in unincorporated areas.',
    officialUrl:  'https://www.rva.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'richmond-food-permit',
    name:         'City of Richmond Food Establishment Permit',
    category:     'local',
    description:
      'Food establishments in Richmond, Virginia must obtain a Food Establishment Permit ' +
      'from the Richmond and Henrico Health District. This covers restaurants, food trucks, ' +
      'caterers, mobile food vendors, and food retail in Richmond and Henrico County.',
    officialUrl:  'https://www.vdh.virginia.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
  },

  // ── TENNESSEE — Memphis / Shelby County ───────────────────────────────────

  {
    id:           'memphis-business-license',
    name:         'Memphis Business License / Tax',
    category:     'local',
    description:
      'Memphis, Tennessee businesses must obtain a City of Memphis business tax ' +
      'registration and pay the Tennessee state business tax. Businesses in Shelby ' +
      'County outside city limits work with Shelby County. Food establishments need ' +
      'additional health permits from the Shelby County Health Department.',
    officialUrl:  'https://www.memphistn.gov',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'shelby-county-food-permit',
    name:         'Shelby County Health Department Food Permit',
    category:     'local',
    description:
      'Food establishments in Memphis and Shelby County, Tennessee must obtain a ' +
      'permit from the Shelby County Health Department. This covers restaurants, ' +
      'food trucks, caterers, mobile food vendors, and food retail throughout the ' +
      'Memphis metro area.',
    officialUrl:  'https://www.shelbytnhealth.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['food-service', 'restaurant', 'food-truck', 'catering'],
    countyUrls:   { 'Shelby County': 'https://www.shelbytnhealth.com' },
  },

  // ── TEXAS — Lubbock / Corpus Christi ──────────────────────────────────────

  {
    id:           'lubbock-business-registration',
    name:         'City of Lubbock Business Registration',
    category:     'local',
    description:
      'Lubbock, Texas businesses must obtain applicable permits through the City of ' +
      'Lubbock. Food establishments require a Food Establishment Permit from the City ' +
      'of Lubbock Environmental Health Division. Businesses must also register with ' +
      'the State of Texas.',
    officialUrl:  'https://www.ci.lubbock.tx.us',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

  {
    id:           'corpus-christi-business-registration',
    name:         'City of Corpus Christi Business Registration',
    category:     'local',
    description:
      'Corpus Christi, Texas businesses must obtain applicable permits through the ' +
      'City of Corpus Christi Development Services. Food establishments require a Food ' +
      'Establishment Permit from the Corpus Christi-Nueces County Public Health District. ' +
      'State registration with the Texas Secretary of State is also required.',
    officialUrl:  'https://www.cctexas.com',
    pdfPath:      null,
    isDownloadable: false,
    renewalMonths:  12,
    commonFor:    ['all'],
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// ALL_FORMS — unified lookup combining FORM_TEMPLATES, FEDERAL_FORMS, STATE_FORMS,
//             STATE_FORMS_ALL_50, and LOCAL_FORMS (v24)
// ─────────────────────────────────────────────────────────────────────────────
//
// FORM_TEMPLATES    — full FormTemplate shape; drives the in-app guided wizard.
// FEDERAL_FORMS     — FederalFormEntry; federal reference forms with download links.
// STATE_FORMS       — StateFormEntry; generic cross-state forms.
// STATE_FORMS_ALL_50— StateFormEntry; state-specific forms for all 50 states + DC (v24).
// LOCAL_FORMS       — StateFormEntry (category:'local'); county and city-level forms (v24).
//
// ALL_FORMS lets callers look up any form by ID without knowing its collection.
// The value type is a union; narrow with isFederalForm() / isStateForm().
//
// Spread order: FORM_TEMPLATES last so full FormTemplate wins over lighter library
// entries when the same formId exists in multiple collections.

export type AnyForm = FormTemplate | FederalFormEntry | StateFormEntry;

// v29 — Fix Missing EIN Application (SS-4) in Forms Library
//
// Root cause: FORM_TEMPLATES was spread last, so any wizard FormTemplate whose id
// collides with a FEDERAL_FORMS or STATE_FORMS entry (e.g. 'ein-application')
// silently overwrites it.  FormTemplate has no .category field, so isFederalForm()
// returns false and the entry is filtered out of the Forms Library entirely.
//
// Fix: spread FORM_TEMPLATES first (lowest precedence), then the typed library
// collections on top.  The checklist wizard still works because getLocaleFormTemplate()
// and FORM_TEMPLATES are accessed directly, not through ALL_FORMS.
//
// Precedence (highest → lowest):
//   LOCAL_FORMS > STATE_FORMS_ALL_50 > STATE_FORMS > FEDERAL_FORMS > FORM_TEMPLATES

export const ALL_FORMS: Record<string, AnyForm> = {
  // Wizard templates at lowest precedence — overridden by any typed library entry
  // with the same ID (e.g. 'ein-application', 'mobile-food-vendor').
  ...FORM_TEMPLATES,
  // Typed library entries win — they carry .category which the type guards require.
  ...Object.fromEntries(FEDERAL_FORMS.map(f => [f.id, f])),
  ...Object.fromEntries(STATE_FORMS.map(f => [f.id, f])),
  ...Object.fromEntries(STATE_FORMS_ALL_50.map(f => [f.id, f])),
  ...Object.fromEntries(LOCAL_FORMS.map(f => [f.id, f])),
};

/** Type guard — returns true when the form is a FederalFormEntry. */
export function isFederalForm(form: AnyForm): form is FederalFormEntry {
  return (form as FederalFormEntry).category === 'federal';
}

/** Type guard — returns true when the form is a StateFormEntry. */
export function isStateForm(form: AnyForm): form is StateFormEntry {
  const cat = (form as StateFormEntry).category;
  return cat === 'state' || cat === 'local';
}

// ─────────────────────────────────────────────────────────────────────────────
// v21 — Download Tracking: localStorage-based form download history
// ─────────────────────────────────────────────────────────────────────────────

const DOWNLOADED_FORMS_KEY = "downloadedForms";

/** Persist a form ID to the localStorage download history. No-op on server. */
export function markFormAsDownloaded(formId: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem(DOWNLOADED_FORMS_KEY) ?? "[]") as string[];
    if (!existing.includes(formId)) {
      localStorage.setItem(DOWNLOADED_FORMS_KEY, JSON.stringify([...existing, formId]));
    }
  } catch { /* localStorage unavailable */ }
}

/** Returns true if the form has been downloaded in this browser. Always false on server. */
export function hasDownloadedForm(formId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const existing = JSON.parse(localStorage.getItem(DOWNLOADED_FORMS_KEY) ?? "[]") as string[];
    return existing.includes(formId);
  } catch { return false; }
}

/** Returns the full Set of downloaded form IDs from localStorage. */
export function getDownloadedFormIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const existing = JSON.parse(localStorage.getItem(DOWNLOADED_FORMS_KEY) ?? "[]") as string[];
    return new Set(existing);
  } catch { return new Set(); }
}

// ─────────────────────────────────────────────────────────────────────────────
// v26 — Smart Form Recommendations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns up to 8 form IDs in priority order, personalised to the caller's
 * business context.  All returned IDs are guaranteed to exist in ALL_FORMS.
 *
 * Priority layers (highest → lowest):
 *   1. Universal federal forms  (EIN, BOI, I-9 — almost every business)
 *   2. State-specific forms     (sales tax, annual report, DBA) for the given state
 *   3. Local/county forms       matching the county slug
 *   4. Industry-specific forms  keyed on businessType keyword matches
 *   5. New-business essentials  (DBA, sole-prop registration)
 */
export function getRecommendedForms(
  businessType?: string,
  state?: string,          // 2-letter abbreviation, e.g. "FL"
  county?: string,         // partial county/city name, e.g. "Palm Beach" or "Miami-Dade"
  isNewBusiness?: boolean,
): string[] {
  const results: string[] = [];
  const add = (...ids: string[]) => {
    for (const id of ids) {
      if (!results.includes(id) && id in ALL_FORMS) results.push(id);
    }
  };

  // ── 1. Universal federal forms ─────────────────────────────────────────────
  // NOTE: EIN form ID is "ein-application" (not "ss-4") — ss-4 is the form number.
  add("ein-application", "boi-report", "i-9");

  // ── 2. State-specific forms ────────────────────────────────────────────────
  if (state) {
    const st = state.toUpperCase();
    const prefix = st.toLowerCase();

    // Sales tax / gross receipts registration (where applicable)
    const NO_SALES_TAX_STATES = new Set(["AK", "DE", "MT", "NH", "OR"]);
    if (!NO_SALES_TAX_STATES.has(st)) {
      // Special cases first
      if (st === "HI") add("hi-get-license");
      else if (st === "NM") add("nm-gross-receipts-tax");
      else add(`${prefix}-sales-tax-permit`);
    }

    // Annual report / franchise tax (state-specific IDs)
    const annualReportIds: Record<string, string> = {
      FL: "fl-annual-report",  TX: "tx-franchise-tax",   CA: "ca-statement-of-info",
      NY: "ny-biennial-statement", IL: "il-annual-report", GA: "ga-annual-registration",
      WA: "wa-annual-report",  CO: "co-periodic-report",  AZ: "az-annual-report",
      NV: "nv-annual-list",    OH: "oh-biennial-report",  VA: "va-annual-report",
      NC: "nc-annual-report",  NJ: "nj-annual-report",    MA: "ma-annual-report",
      PA: "pa-decennial-report", MI: "mi-annual-statement", MN: "mn-annual-renewal",
      IN: "in-business-entity-report", MO: "mo-annual-registration", MD: "md-personal-property-return",
      WI: "wi-annual-report",  TN: "tn-annual-report",    SC: "sc-annual-report",
      KY: "ky-annual-report",  AL: "al-annual-report",    LA: "la-annual-report",
      OK: "ok-annual-certificate", CT: "ct-annual-report", AR: "ar-franchise-tax",
      UT: "ut-annual-renewal", IA: "ia-biennial-report",  MS: "ms-annual-report",
      KS: "ks-annual-report",  NE: "ne-biennial-report",  ID: "id-annual-report",
      WV: "wv-annual-report",  HI: "hi-annual-report",    ME: "me-annual-report",
      NH: "nh-annual-report",  MT: "mt-annual-report",    RI: "ri-annual-report",
      DE: "de-franchise-tax",  AK: "ak-biennial-report",  SD: "sd-annual-report",
      ND: "nd-annual-report",  VT: "vt-annual-report",    WY: "wy-annual-report",
      OR: "or-annual-report",  DC: "dc-biennial-report",
    };
    if (annualReportIds[st]) add(annualReportIds[st]);

    // DBA / fictitious name — state-specific IDs
    const dbaIds: Record<string, string> = {
      FL: "fl-fictitious-name", TX: "tx-assumed-name", CA: "ca-fictitious-business-name",
      NY: "ny-assumed-name",    IL: "il-assumed-name",  GA: "ga-trade-name",
    };
    if (dbaIds[st]) add(dbaIds[st]);

    // Business license (not every state issues a state-level general license)
    const bizLicenseIds: Record<string, string> = {
      AK: "ak-business-license", WA: "wa-business-license", CA: "ca-seller-permit",
    };
    if (bizLicenseIds[st]) add(bizLicenseIds[st]);
  }

  // ── 3. Local / county forms ────────────────────────────────────────────────
  if (county) {
    const c = county.toLowerCase();
    // Map partial county/city names → LOCAL_FORMS ID prefixes
    const COUNTY_PREFIXES: Array<[string, string[]]> = [
      ["palm beach",  ["palm-beach-btrc",    "palm-beach-fictitious"]],
      ["miami",       ["miami-dade-btrc",     "miami-dade-certificate-use"]],
      ["broward",     ["broward-btrc",        "broward-certificate-use"]],
      ["los angeles", ["la-county-btrc",      "la-city-business-tax"]],
      ["harris",      ["harris-county-btrc",  "houston-sos-dba"]],
      ["houston",     ["harris-county-btrc",  "houston-sos-dba"]],
      ["new york",    ["nyc-business-cert",   "nyc-dba"]],
      ["cook",        ["cook-county-btrc",    "chicago-business-license"]],
      ["chicago",     ["cook-county-btrc",    "chicago-business-license"]],
      ["king",        ["king-county-btrc",    "seattle-business-license"]],
      ["seattle",     ["king-county-btrc",    "seattle-business-license"]],
      ["maricopa",    ["maricopa-btrc",       "phoenix-privilege-tax"]],
      ["phoenix",     ["maricopa-btrc",       "phoenix-privilege-tax"]],
      ["clark",       ["clark-county-btrc"]],
      ["fulton",      ["fulton-county-btrc",  "atlanta-business-license"]],
      ["atlanta",     ["fulton-county-btrc",  "atlanta-business-license"]],
      ["philadelphia", ["philadelphia-birt",  "philadelphia-business-privilege"]],
      ["cuyahoga",    ["cleveland-btrc"]],
      ["wayne",       ["detroit-btrc"]],
      ["denver",      ["denver-btrc"]],
      ["shelby",      ["memphis-btrc"]],
      ["mecklenburg", ["charlotte-btrc"]],
    ];
    for (const [keyword, ids] of COUNTY_PREFIXES) {
      if (c.includes(keyword)) { add(...ids); break; }
    }
  }

  // ── 4. Industry-specific forms ─────────────────────────────────────────────
  if (businessType) {
    const bt = businessType.toLowerCase();

    // Food & beverage
    if (/food|restaurant|bakery|catering|café|cafe|kitchen|bar|brewery|winery/.test(bt)) {
      add("food-handler-cert", "food-establishment-permit");
      if (/truck|cart|mobile/.test(bt)) add("mobile-food-vendor");
      if (/alcohol|bar|brewery|winery|liquor/.test(bt)) add("liquor-license");
      if (/home|cottage/.test(bt)) add("cottage-food-permit");
    }

    // Health & wellness / childcare
    if (/salon|spa|nail|barber|cosmetolog/.test(bt)) add("cosmetology-license");
    if (/daycare|childcare|child care|preschool|nursery/.test(bt)) add("childcare-license");
    if (/contractor|construction|plumber|electrician|hvac|roofing/.test(bt)) add("contractors-license");

    // Home-based
    if (/home.based|home based|home business|cottage/.test(bt)) add("home-occupation-permit");

    // Retail / product
    if (/retail|boutique|shop|store|resale|import|wholesale/.test(bt)) {
      if (state && !["AK","DE","MT","NH","OR"].includes(state.toUpperCase())) {
        add("seller-permit");
      }
    }

    // Professional services / employer forms
    if (/consulting|agency|staffing|employer|hire|employee/.test(bt)) {
      add("w-4", "w-9");
    }

    // Nonprofit
    if (/nonprofit|non-profit|charity|501/.test(bt)) add("form-1023", "form-1023-ez");

    // Transportation / trucking
    if (/trucking|freight|transport|carrier|dispatch/.test(bt)) add("dot-number-application");
  }

  // ── 5. New-business essentials ─────────────────────────────────────────────
  if (isNewBusiness) {
    add("w-9", "w-4");
    // DBA is commonly needed at startup
    if (state) {
      const st = state.toUpperCase();
      if (!results.some(id => id.includes("fictitious") || id.includes("assumed") || id.includes("dba") || id.includes("trade-name"))) {
        const genericDba = `${st.toLowerCase()}-fictitious-name`;
        if (genericDba in ALL_FORMS) add(genericDba);
      }
    }
  }

  // Cap at 8 results
  return results.slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getFormTemplate(formId: string): FormTemplate | null {
  return FORM_TEMPLATES[formId] ?? null;
}

/**
 * Returns the best available PDF URL for a template:
 * the official blank form PDF if known, otherwise the submit portal.
 */
export function getFormPdfUrl(template: FormTemplate): string {
  return template.officialFormPdfUrl ?? template.submitPortalUrl ?? template.submitUrl;
}

/**
 * Maps full US state names (lowercase) → 2-letter abbreviations.
 * Used by parseStateFromLocation to handle GPS locations where the platform
 * (Nominatim, browser APIs) returns the full state name instead of an abbreviation.
 */
const STATE_ABBREV_MAP: Record<string, string> = {
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

/**
 * Parses the 2-letter state code from a location string.
 *
 * Handles all formats produced by the RegBot location system:
 *   "Miami, FL 33101"         → "FL"  (GPS / ZIP lookup)
 *   "Houston, TX"             → "TX"  (manual city/state)
 *   "Miami, Florida 33101"    → "FL"  (GPS when ISO3166 code absent)
 *   "Chicago, Illinois"       → "IL"  (full state name, no ZIP)
 *   "New York, New York"      → "NY"  (city == state name)
 *
 * The input is trimmed first to neutralise any trailing whitespace that
 * Nominatim occasionally appends to postcode values (e.g. "FL 33411 ").
 */
export function parseStateFromLocation(location: string): string | null {
  const loc = location.trim();

  // Primary format: "City, ST" or "City, ST ZIP" — 2-letter uppercase abbreviation
  const m = loc.match(/,\s+([A-Z]{2})(?:\s+\d{5})?$/);
  if (m) return m[1];

  // Fallback: "City, Full State Name" or "City, Full State Name ZIP"
  // Lazy capture stops before the optional trailing ZIP.
  const mFull = loc.match(/,\s+([A-Za-z][A-Za-z ]+?)(?:\s+\d{5})?$/);
  if (mFull) {
    const abbrev = STATE_ABBREV_MAP[mFull[1].trim().toLowerCase()];
    if (abbrev) return abbrev;
  }

  return null;
}

/** Merges a LocaleOverride into a base FormTemplate, always resolving submitPortalUrl. */
function applyOverride(base: FormTemplate, ov: LocaleOverride): FormTemplate {
  return {
    ...base,
    submitUrl: ov.submitUrl,
    // Always derive submitPortalUrl from the override (never from base, which may be SBA).
    submitPortalUrl: ov.submitPortalUrl ?? ov.submitUrl,
    ...(ov.officialFormNumber !== undefined ? { officialFormNumber: ov.officialFormNumber } : {}),
    ...(ov.officialFormPdfUrl !== undefined ? { officialFormPdfUrl: ov.officialFormPdfUrl } : {}),
    ...(ov.submitInstructions !== undefined ? { submitInstructions: ov.submitInstructions } : {}),
    ...(ov.fields && ov.fields.length > 0   ? { fields:            ov.fields             } : {}),
  };
}

/**
 * Returns a FormTemplate patched with the most specific available locale override.
 *
 * Resolution order (most-specific first):
 *   1. countyUrls[county]   — exact county name match (e.g. "Palm Beach County")
 *   2. localeUrls[state]    — 2-letter state abbreviation match
 *   3. base template        — no locale found
 *
 * @param formId   - The form ID string (e.g. "mobile-food-vendor")
 * @param location - User location string in any format parseable by parseStateFromLocation
 * @param county   - Optional detected county name (e.g. "Palm Beach County") used for
 *                   county-level URL matching before falling back to state-level.
 */
export function getLocaleFormTemplate(
  formId: string,
  location: string,
  county?: string | null,
): FormTemplate | null {
  const base = getFormTemplate(formId);
  if (!base) return null;

  // ── 1. County-level match (most specific) ──────────────────────────────────
  if (county && base.countyUrls?.[county]) {
    return applyOverride(base, base.countyUrls[county]!);
  }

  // ── 2. State-level match ───────────────────────────────────────────────────
  const state = parseStateFromLocation(location);
  if (state && base.localeUrls?.[state]) {
    return applyOverride(base, base.localeUrls[state]!);
  }

  // ── 3. Base template fallback ──────────────────────────────────────────────
  return base;
}

/**
 * Returns the suggested renewal date (YYYY-MM-DD) for a completed form, or null
 * if the form does not expire.
 *
 * Resolution order:
 *   1. Location-specific rules (e.g. FL Business Tax Receipts due Sep 30 annually)
 *   2. defaultRenewalMonths from the template (N months from completionDate)
 *   3. null when defaultRenewalMonths === null (permit does not expire)
 *   4. null when no data is available
 *
 * @param formId         - The form ID (e.g. "business-license")
 * @param location       - User location string (e.g. "West Palm Beach, FL 33401")
 * @param completionDate - ISO date string when the form was completed; defaults to now
 * @param county         - Optional detected county (e.g. "Palm Beach County")
 */
export function getSuggestedRenewalDate(
  formId: string,
  location: string,
  completionDate?: string,
  county?: string | null,
): string | null {
  const base = getFormTemplate(formId);
  if (!base) return null;

  // If defaultRenewalMonths is explicitly null, the permit doesn't expire.
  if (base.defaultRenewalMonths === null) return null;

  const from = completionDate ? new Date(completionDate) : new Date();
  const state = parseStateFromLocation(location);

  // ── 1. Location-specific rules ─────────────────────────────────────────────

  if (formId === "business-license") {
    // Florida Business Tax Receipts (BTR): issued by county Tax Collector,
    // always expire September 30 regardless of when obtained.
    if (state === "FL" || (county && county.endsWith("County") && location.includes("FL"))) {
      const sep30 = nextSep30(from);
      return toYMD(sep30);
    }
    // California business licenses: typically expire December 31 of the same year.
    if (state === "CA") {
      const dec31 = nextDec31(from);
      return toYMD(dec31);
    }
  }

  if (formId === "food-service-permit") {
    // Florida food service permits: expire December 31 annually.
    if (state === "FL") {
      const dec31 = nextDec31(from);
      return toYMD(dec31);
    }
  }

  if (formId === "mobile-food-vendor") {
    // Florida mobile food permits: expire December 31 annually.
    if (state === "FL") {
      const dec31 = nextDec31(from);
      return toYMD(dec31);
    }
  }

  if (formId === "fictitious-name") {
    // California DBA: 5 years from filing (40 months is a common misread — it's truly 5 yrs).
    // Most states are already covered by the 60-month default.
    // Florida: expires December 31 of the 5th year after filing.
    if (state === "FL") {
      const d = new Date(from);
      d.setFullYear(d.getFullYear() + 5);
      d.setMonth(11);      // December
      d.setDate(31);
      return toYMD(d);
    }
  }

  // ── 2. Default: N months from completion date ──────────────────────────────
  if (base.defaultRenewalMonths && base.defaultRenewalMonths > 0) {
    const d = new Date(from);
    d.setMonth(d.getMonth() + base.defaultRenewalMonths);
    return toYMD(d);
  }

  return null;
}

/** Returns the next September 30 on or after the given date (always ≥ 1 day ahead). */
function nextSep30(from: Date): Date {
  const d = new Date(from);
  // If we're already past Sep 30 of this year, use next year's.
  const thisYearSep30 = new Date(d.getFullYear(), 8, 30); // month 8 = September
  if (d >= thisYearSep30) {
    thisYearSep30.setFullYear(thisYearSep30.getFullYear() + 1);
  }
  return thisYearSep30;
}

/** Returns the next December 31 on or after the given date (always ≥ 1 day ahead). */
function nextDec31(from: Date): Date {
  const d = new Date(from);
  const thisYearDec31 = new Date(d.getFullYear(), 11, 31); // month 11 = December
  if (d >= thisYearDec31) {
    thisYearDec31.setFullYear(thisYearDec31.getFullYear() + 1);
  }
  return thisYearDec31;
}

/** Formats a Date as "YYYY-MM-DD". */
function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns an ordered list of regulatory topics that frequently change for the
 * given form + location. Used by the Rule Change Alerts feature to generate
 * hyper-local mock (and eventually real) compliance alerts.
 *
 * Topics are ordered most-specific first: county → state → federal/generic.
 * The caller (page.tsx generateMockAlertForBusiness) converts the first topic
 * into a human-readable alert title + description.
 *
 * @param formId   - Form ID (e.g. "mobile-food-vendor")
 * @param location - User location string (any format accepted by parseStateFromLocation)
 * @param county   - Optional detected county name for county-specific topics
 */
export function getRuleChangeTopics(
  formId: string,
  location: string,
  county?: string | null,
): string[] {
  const state = parseStateFromLocation(location);

  switch (formId) {

    case "mobile-food-vendor": {
      const topics: string[] = [];
      // County-specific (most specific first)
      if (county === "Palm Beach County") topics.push("Palm Beach County commissary approval process update");
      if (county === "Los Angeles County") topics.push("LA County food truck permitted zone map update");
      if (county === "Harris County" || county === "Travis County") topics.push("Texas city vending district rule changes");
      // State-specific
      if (state === "FL") topics.push("Florida commissary kitchen licensing requirements update");
      if (state === "TX") topics.push("DSHS mobile food unit inspection standards update");
      if (state === "CA") topics.push("AB 626 microenterprise home kitchen permit expansion");
      if (state === "NY") topics.push("NYC mobile food vendor license cap legislative update");
      if (state === "IL") topics.push("Chicago mobile food vehicle permit zone restrictions");
      // Always applicable
      topics.push("permitted operating zone map update", "vehicle inspection documentation requirements");
      return topics;
    }

    case "food-service-permit": {
      const topics: string[] = [];
      if (county === "Palm Beach County") topics.push("Palm Beach County Environmental Health inspection schedule change");
      if (county === "Los Angeles County") topics.push("LA County Environmental Health plan check fee update");
      if (county === "Cook County")        topics.push("Cook County food establishment ordinance amendment");
      if (state === "FL") topics.push("Florida DBPR food service inspection fee schedule update");
      if (state === "TX") topics.push("DSHS food handler certification requirement update");
      if (state === "CA") topics.push("CalCode retail food facility standards amendment");
      if (state === "NY") topics.push("NYC Health Code Article 81 food service update");
      if (state === "GA") topics.push("Georgia Department of Agriculture food service rule update");
      topics.push("allergen labeling and disclosure requirements", "temperature control and cooling log standards");
      return topics;
    }

    case "home-occupation-permit": {
      const topics: string[] = [];
      if (state === "FL") topics.push("Florida cottage food gross annual sales limit increase");
      if (state === "CA") topics.push("AB 2374 home-based business zoning protection expansion");
      if (state === "NY") topics.push("NYC home occupation zoning amendment update");
      if (state === "TX") topics.push("Texas home-based business property tax exemption update");
      topics.push(
        "customer visit parking restriction change",
        "exterior signage and advertising rules update",
        "non-resident employee limit adjustment",
      );
      return topics;
    }

    case "business-license": {
      const topics: string[] = [];
      if (county === "Palm Beach County") topics.push("Palm Beach County BTR fee schedule update");
      if (county === "Los Angeles County") topics.push("Measure ULA gross receipts tax tier update");
      if (county === "Cook County")        topics.push("Chicago business registration fee change");
      if (county === "King County")        topics.push("Seattle business license fee adjustment");
      if (state === "FL") topics.push("Florida Business Tax Receipt annual rate adjustment");
      if (state === "CA") topics.push("California business license gross receipts tier change");
      if (state === "WA") topics.push("Washington B&O tax rate and classification update");
      if (state === "TX") topics.push("local municipal business permit fee update");
      topics.push("annual renewal fee schedule update", "zoning reclassification and business use impact");
      return topics;
    }

    case "sales-tax-registration": {
      const topics: string[] = [];
      if (state === "TX") topics.push("Texas Comptroller remote seller nexus rule update");
      if (state === "CA") topics.push("California district sales tax rate change");
      if (state === "IL") topics.push("Illinois origin-based vs destination-based sourcing rules update");
      if (state === "NY") topics.push("New York state and local sales tax rate adjustment");
      if (state === "WA") topics.push("Washington B&O tax deduction and exemption update");
      if (state === "FL") topics.push("Florida commercial rent sales tax rate reduction update");
      topics.push("economic nexus threshold update for remote sellers", "digital goods and SaaS taxability rule change");
      return topics;
    }

    case "fictitious-name": {
      const topics: string[] = [];
      if (state === "FL") topics.push("Florida Sunbiz fictitious name renewal fee update");
      if (state === "CA") topics.push("California county clerk DBA filing fee change");
      if (state === "TX") topics.push("Texas assumed name certificate county filing update");
      if (state === "NY") topics.push("New York DBA publication newspaper requirement update");
      topics.push("DBA renewal filing fee schedule change", "county clerk publication requirement update");
      return topics;
    }

    case "business-registration": {
      // Federal rule changes affect all states
      return [
        "FinCEN Beneficial Ownership Information (BOI) reporting deadline update",
        "annual report fee increase",
        "registered agent address and service requirement update",
        "state Secretary of State portal migration",
      ];
    }

    case "ein-application":
      // Federal EINs don't expire and IRS rules rarely change for basic EIN holders.
      return [];

    default:
      return ["local regulatory filing fee update", "government portal migration or URL change"];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// v45 — Zoning & Address Compliance Checker (major moat feature)
//
// Maps common zoning permit names (as returned by /api/zoning/check) to known
// form template IDs so the AI can suggest the right formId in its JSON response.
// Also used by handleAttachZoningResult to populate matchedFormIds on the
// synthetic UploadedDocument — which links the zoning result to real form cards.
// ─────────────────────────────────────────────────────────────────────────────

export const ZONING_PERMIT_FORM_IDS: Readonly<Record<string, string>> = {
  "business license":                "business-license",
  "general business license":        "business-license",
  "business registration":           "business-registration",
  "fictitious business name":        "fictitious-name",
  "dba registration":                "fictitious-name",
  "home occupation permit":          "home-occupation-permit",
  "home business permit":            "home-occupation-permit",
  "food service permit":             "food-service-permit",
  "food handler permit":             "food-service-permit",
  "food establishment permit":       "food-service-permit",
  "mobile food vendor permit":       "mobile-food-vendor",
  "mobile food facility permit":     "mobile-food-vendor",
  "commissary agreement":            "mobile-food-vendor",
  "food truck permit":               "mobile-food-vendor",
  "sales tax registration":          "sales-tax-registration",
  "seller's permit":                 "sales-tax-registration",
  "state tax registration":          "sales-tax-registration",
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE SCHEMA (run once in SQL editor)
// ─────────────────────────────────────────────────────────────────────────────
//
// -- Businesses table
// create table if not exists businesses (
//   id           uuid primary key default gen_random_uuid(),
//   user_id      uuid references auth.users not null,
//   name         text not null,
//   location     text,
//   created_at   timestamptz default now()
// );
//
// -- Completed forms table (one row per form completion)
// create table if not exists completed_forms (
//   id              uuid primary key default gen_random_uuid(),
//   business_id     uuid references businesses(id) on delete cascade,
//   user_id         uuid references auth.users not null,
//   form_id         text not null,           -- e.g. "business-license"
//   form_name       text,
//   form_data       jsonb,                   -- key/value answers from FormFiller
//   completed_at    timestamptz default now(),
//   renewal_date    timestamptz,             -- populated from getSuggestedRenewalDate()
//   renewal_sent_60 boolean default false,   -- reminder sent at 60 days before renewal
//   renewal_sent_30 boolean default false,   -- reminder sent at 30 days before renewal
//   renewal_sent_7  boolean default false    -- reminder sent at  7 days before renewal
// );
//
// -- Index for efficient renewal reminder queries
// create index if not exists idx_completed_forms_renewal
//   on completed_forms (renewal_date)
//   where renewal_date is not null;
//
// ─────────────────────────────────────────────────────────────────────────────
// FUTURE: EMAIL RENEWAL REMINDERS (Supabase Edge Function + pg_cron)
// ─────────────────────────────────────────────────────────────────────────────
//
// Edge Function: supabase/functions/send-renewal-reminders/index.ts
// Schedule: daily at 09:00 UTC via pg_cron
//   select cron.schedule('renewal-reminders', '0 9 * * *',
//     $$select net.http_post(
//       url     := 'https://<project>.supabase.co/functions/v1/send-renewal-reminders',
//       headers := '{"Authorization": "Bearer <anon_key>"}'::jsonb
//     )$$
//   );
//
// Query pattern inside the edge function:
//   SELECT cf.*, b.name AS business_name, au.email
//   FROM completed_forms cf
//   JOIN businesses b ON b.id = cf.business_id
//   JOIN auth.users  au ON au.id = cf.user_id
//   WHERE cf.renewal_date IS NOT NULL
//     AND (
//       (cf.renewal_date::date - current_date = 60 AND NOT cf.renewal_sent_60) OR
//       (cf.renewal_date::date - current_date = 30 AND NOT cf.renewal_sent_30) OR
//       (cf.renewal_date::date - current_date =  7 AND NOT cf.renewal_sent_7)
//     );
//
// After sending each email, set the corresponding renewal_sent_N flag to true
// to prevent duplicate sends.
//
// Email copy template:
//   Subject: "⏰ Your [Form Name] renewal is due in [N] days"
//   Body: "Hi [Name], your [Form Name] for [Business Name] in [Location]
//          is due for renewal on [Date]. Click here to renew with RegBot AI."
// ─────────────────────────────────────────────────────────────────────────────
