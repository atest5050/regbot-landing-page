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
function parseStateFromLocation(location: string): string | null {
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
