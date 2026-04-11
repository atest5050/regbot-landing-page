// vMobile-global-scale-fix — Applied proper mobile scaling to all links and buttons
//        All FormFiller interactive elements verified for 44px minimum touch target:
//        Option buttons: px-4 py-2.5 rounded-lg ✓ (text-sm + 2×10px = ≥44px).
//        Yes/No radio buttons: flex-1 px-4 py-2.5 ✓.
//        Navigation buttons (Next / Back / Submit): already py-3+ from vMobile pass ✓.
//        Mobile-first padding already applied across intro, question, summary, and packet screens.
// v77 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (str-local-occupancy-tax, farmers-market-vendor-license,
//        vape-smoke-shop-retail-license, door-to-door-solicitor-permit,
//        hair-braiding-natural-hair-license).
//        13 new LOCAL_FORMS: Omaha/Douglas NE, Baton Rouge LA, Birmingham/Jefferson AL,
//        Wichita/Sedgwick KS, Spokane WA, Tacoma/Pierce WA, Madison/Dane WI,
//        Riverside CA, San Bernardino CA, Bakersfield/Kern CA, Colorado Springs CO,
//        Anchorage AK, Greenville/Greenville SC.
//        FIELD_SKIP_CONDITIONS: platformRemitsTax, vendorProductType, vapeProductTypes,
//        hasDisplayRestrictions, solicitorType, trainingHoursCompleted.
//        buildZoningSeed deepened: STR zones → occupancy tax pre-fill;
//        commercial zones → vape/smoke shop and solicitor permit hints.
// Mobile responsiveness overhaul — vMobile
//        All FormFiller phases now use mobile-first padding (p-3 sm:p-5).
//        Intro, question, summary, and packet screens are full-width on phones.
//        Button rows wrap gracefully; option grids and review lists scroll on small screens.
// v76 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (painting-contractor-license, masonry-contractor-license,
//        commercial-pool-health-permit, cosmetologist-individual-license,
//        towing-company-license).
//        13 new LOCAL_FORMS: Chandler AZ, Henderson NV, Irvine CA, Plano TX, Hialeah FL,
//        Fort Lauderdale FL, Chula Vista CA, Fremont CA, Gilbert AZ, Garland TX,
//        Springfield MO, Peoria IL, Yonkers/Westchester NY.
//        FIELD_SKIP_CONDITIONS expanded for pool health and towing forms.
//        buildZoningSeed deepened: residential zone → home-based form pre-fills;
//        commercial zone → pool/salon/towing compliance pre-fills.
// v75 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (funeral-home-license, pharmacy-permit,
//        social-worker-practice-license, real-estate-broker-license,
//        alcohol-catering-endorsement).
//        13 new LOCAL_FORMS: Boise/Ada ID, Des Moines/Polk IA, Spokane WA, Winston-Salem NC,
//        Knoxville TN, Lexington KY, Albuquerque NM, Aurora CO, Anaheim CA,
//        Corpus Christi TX, Killeen TX, Beaumont TX, Santa Ana CA.
//        FIELD_SKIP_CONDITIONS expanded for funeral home and pharmacy fields.
// v74 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (childcare-center-license, pool-spa-contractor-license,
//        landscape-contractor-license, security-guard-company-license, food-manufacturer-license)
//        13 new LOCAL_FORMS: Reno/Washoe NV, Portland ME, Manchester NH, Tallahassee FL,
//        Pensacola FL, Huntsville AL, Savannah GA, Montgomery AL, Macon GA,
//        Sioux Falls SD, Modesto/Stanislaus CA, Salinas/Monterey CA, Lafayette LA.
//        FIELD_SKIP_CONDITIONS expanded for childcare capacity, food manufacturer facility.
// v73 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (plumbing-contractor-license, hvac-contractor-license,
//        pest-control-license, vehicle-repair-shop-license, roofing-contractor-license)
//        13 new LOCAL_FORMS for metros: Syracuse/Onondaga NY, Grand Rapids/Kent MI,
//        Fayetteville/Cumberland NC, Akron/Summit OH, Fort Collins/Larimer CO,
//        Stockton/San Joaquin CA, Cape Coral/Lee FL, Paterson/Passaic NJ, Hampton VA,
//        Amarillo/Potter TX, Laredo/Webb TX, Oxnard/Ventura CA, Santa Cruz CA.
//        FIELD_SKIP_CONDITIONS expanded for trades (numBays, hasEnvironmentalCompliance, etc.)
// v72 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (barbershop-cosmetology-salon-permit, tattoo-body-art-studio-permit,
//        electrical-contractor-license, pet-grooming-salon-license, commercial-kitchen-shared-permit)
//        13 new LOCAL_FORMS for major metros (Boston MA, Seattle WA, Denver CO, Pittsburgh PA,
//        Cleveland OH, Detroit MI, Memphis TN, Salt Lake City UT, Providence RI, Omaha NE,
//        Milwaukee WI, Tulsa OK, Anchorage AK). Deepened Zoning integration: buildZoningSeed
//        now maps zoneType keywords to recommended form pre-fills and zoningComplianceConfirmed
//        values for cosmetology, electrical, and pet-care permits.
// v71 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (notary-public-commission, auto-dealer-license,
//        charitable-solicitation-registration, food-truck-city-permit, event-alcohol-permit)
//        11 new LOCAL_FORMS for mid-size metros (Jersey City NJ, Newark NJ, Rochester NY,
//        New Haven CT, Chattanooga TN, Little Rock AR, Columbia SC, Augusta GA,
//        Shreveport LA, Mobile AL, Jackson MS)
// v70 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (short-term-rental-permit, tobacco-retail-license,
//        food-facility-annual-renewal, massage-establishment-permit, secondhand-dealer-license).
//        Deepened Zoning integration: buildZoningSeed now pre-fills propertyAddress, proposedBusinessUse,
//        and zoningComplianceConfirmed from attached zoning result. New category-aware skip conditions
//        (strType, hasBond, willBuyFromPublic). PROFILE_FIELD_MAP gets physicalAddress + numBedrooms.
// v69 — Expanded business category selection system for better hyper-local accuracy
//        Category-aware FIELD_SKIP_CONDITIONS: skip food/liquor/childcare fields based on businessType.
// v68 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (special-event-permit, outdoor-dining-permit, catering-license,
//        childcare-home-license, professional-license-registration). 14 new LOCAL_FORMS for
//        underserved metros. Expanded FIELD_SKIP_CONDITIONS for all new forms.
// v66 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (food-service-plan-review, employer-withholding-registration,
//        business-personal-property-tax, zoning-compliance-letter-request, health-dept-inspection-checklist).
//        Expanded FIELD_SKIP_CONDITIONS for all new forms.
// v65 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_STEP_SECTIONS (building-permit, food-manager-certification, resale-certificate,
//        workers-comp-exemption, dba-county-registration). Expanded PROFILE_FIELD_MAP +
//        FIELD_SKIP_CONDITIONS for all new forms.
// v64 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        7 new FORM_STEP_SECTIONS (temporary-food-vendor, cottage-food, liquor-license,
//        sign-permit, fire-inspection, alarm-permit, sidewalk-vending).
//        Zoning variance suggestion callout: when zoningProfile.status is conditional/prohibited
//        and the current form is not already the variance form, show an advisory chip.
// v63 — Aggressive Form Assistant expansion for hyper-local regulations with more local forms + Zoning integration
//        zoningProfile prop pre-populates zone-aware fields (zone type, zoning status)
//        New FORM_STEP_SECTIONS for zoning-variance-application + commissary-agreement-worksheet
// v62 — Expanded Form Assistant with more federal/state/local forms + improved PDF pre-filling
//        Automatic business profile creation from Form Filler when no profile exists
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

// ── Zoning profile hint — extracted from an attached zoning check result ──────
// v63 — Used to pre-populate zone-aware fields in the guided wizard and show
//       a contextual advisory banner on the intro screen.
export interface ZoningProfileHint {
  /** "allowed" | "conditional" | "prohibited" | "unknown" */
  status?: string;
  zoneType?: string;
  restrictions?: string[];
  /** True when this zoning check is for the current business location */
  address?: string;
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
  /**
   * v62 — Called when a form is completed but no business profile exists yet.
   * The parent should create a new business profile, attach the completed form
   * as a synthetic document, and open the Business Profile View.
   */
  onFormCompleteWithoutProfile?: (formData: Record<string, string>, completedFormId: string) => void;
  /**
   * v63 — Zoning result extracted from the attached zoning check document.
   * When provided, zone-aware fields (currentZoneType, requestedVarianceType, etc.)
   * are pre-seeded and a contextual advisory banner is shown on the intro screen.
   */
  zoningProfile?: ZoningProfileHint | null;
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
  businessName:         'name',
  legalName:            'name',
  fictitiousName:       'name',  // pre-fill as a starting point; user may override
  entityName:           'name',
  entityLegalName:      'name',
  applicantLegalName:   'name',
  legalBusinessName:    'name',
  businessLegalName:    'name',
  payerBusinessName:    'name',
  establishmentName:    'name',
  // Address / location fields
  businessAddress:      'location',
  principalAddress:     'location',
  physicalAddress:      'location',
  businessLocation:     'location',
  homeAddress:          'location',
  homeBusinessAddress:  'location',
  operatingCity:        'location',
  // Business type
  businessType:         'businessType',
  licenseClassType:     'businessType',
  // Owner
  ownerFullName:        'ownerName',
  ownerName:            'ownerName',
  responsiblePartyName: 'ownerName',
  applicantName:        'ownerName',
  ownerLegalName:       'ownerName',
  // EIN
  fein:                 'ein',
  ein:                  'ein',
  payerFein:            'ein',
  // Contact
  businessPhone:        'phone',
  businessEmail:        'email',
  applicantPhone:       'phone',
  applicantEmail:       'email',
  ownerPhone:           'phone',
  ownerEmail:           'email',
  // v64 — additional mappings for new form types
  propertyAddress:      'location',
  installationAddress:  'location',
  premisesAddress:      'location',
  eventLocation:        'location',  // seed event location from business address as a hint
  vendorName:           'name',
  sellerName:           'name',
  contractorName:       'name',
  // v65 — additional mappings for new form types
  stateTaxId:           'ein',  // resale cert — EIN seeds state tax ID field as starting point
  projectAddress:       'location', // building permit — project address from business location
  // v70 — additional mappings for new form types (physicalAddress, propertyAddress already mapped above)
  // v77 — additional mappings for new form types
  marketAddress:    'location',  // farmers market vendor — seed market address from business location as hint
  trainingSchool:   'name',      // hair braiding — school name seeds from business name as hint
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
    { label: 'Property & Owner',     fieldIds: ['applicantName', 'ownerFullName', 'homeAddress', 'ownershipType', 'ownerPhone', 'applicantPhone', 'applicantEmail'] },
    { label: 'Business Details',     fieldIds: ['businessName', 'businessType', 'businessDescription', 'ownershipStatus'] },
    { label: 'Operations',           fieldIds: ['clientVisits', 'customersAtHome', 'nonResidentEmployees', 'employeesAtHome', 'externalSigns', 'externalSignage', 'equipmentOrVehicles', 'storageOfInventory', 'squareFootageUsed'] },
  ],
  // v77 — 5 new guided wizard forms
  'str-local-occupancy-tax': [
    { label: 'Property & Contact',    fieldIds: ['ownerFullName', 'businessEmail', 'businessPhone', 'propertyAddress', 'apnNumber'] },
    { label: 'Rental Details',        fieldIds: ['strType', 'existingLicenseNumber', 'platformsListed', 'platformRemitsTax'] },
    { label: 'Revenue & Insurance',   fieldIds: ['estimatedAnnualRevenue'] },
  ],
  'farmers-market-vendor-license': [
    { label: 'Vendor & Business',     fieldIds: ['businessName', 'ownerFullName', 'businessPhone', 'businessEmail', 'homeAddress'] },
    { label: 'Products & Market',     fieldIds: ['vendorProductType', 'marketName', 'marketAddress', 'operatingDays'] },
    { label: 'Existing Permits',      fieldIds: ['hasExistingLicense', 'existingLicenseNumber', 'liabilityInsurer', 'liabilityPolicyNum'] },
  ],
  'vape-smoke-shop-retail-license': [
    { label: 'Store & Owner',         fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Products & Compliance', fieldIds: ['vapeProductTypes', 'hasAgeVerification', 'hasDisplayRestrictions'] },
    { label: 'License Status',        fieldIds: ['existingLicenseNumber', 'isRenewal', 'liabilityInsurer'] },
  ],
  'door-to-door-solicitor-permit': [
    { label: 'Applicant & Business',  fieldIds: ['applicantLegalName', 'businessName', 'homeAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Activity Details',      fieldIds: ['vendorProductType', 'solicitorType', 'operatingArea'] },
    { label: 'Bond & Status',         fieldIds: ['hasCriminalHistory', 'bondAmount', 'vehicleLicensePlate', 'isRenewal'] },
  ],
  'hair-braiding-natural-hair-license': [
    { label: 'Applicant',             fieldIds: ['applicantLegalName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'License & Training',    fieldIds: ['licenseType', 'trainingHoursCompleted', 'trainingSchool', 'isRenewal'] },
    { label: 'History & Salon',       fieldIds: ['existingLicenseNumber', 'businessName', 'hasCriminalHistory'] },
  ],
  // v76 — 5 new guided wizard forms
  'painting-contractor-license': [
    { label: 'Contractor & Business',   fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License & Certification', fieldIds: ['licenseType', 'yearsExperience', 'hasCertification', 'hasLeadCert'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  'masonry-contractor-license': [
    { label: 'Contractor & Business',   fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Specialty & Experience',  fieldIds: ['licenseType', 'masonrySpecialty', 'yearsExperience', 'hasCertification'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  'commercial-pool-health-permit': [
    { label: 'Facility & Contact',      fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Pool Details',            fieldIds: ['facilityType', 'numPoolUnits', 'hasLifeguard', 'hasDrainCover', 'hasADACompliance'] },
    { label: 'Water Safety & Renewal',  fieldIds: ['waterTestFrequency', 'existingLicenseNumber'] },
  ],
  'cosmetologist-individual-license': [
    { label: 'Applicant',               fieldIds: ['applicantLegalName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'License & Status',        fieldIds: ['licenseType', 'existingLicenseNumber', 'isRenewal', 'hasCertification'] },
    { label: 'Employment & History',    fieldIds: ['businessName', 'hasCriminalHistory'] },
  ],
  'towing-company-license': [
    { label: 'Company & Owner',         fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Operations & Fleet',      fieldIds: ['licenseType', 'numVehicles', 'hasInsurancePerVehicle'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  // v75 — 5 new guided wizard forms
  'funeral-home-license': [
    { label: 'Business & Director',    fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Services & License',     fieldIds: ['facilityType', 'existingLicenseNumber', 'hasCrematorium'] },
    { label: 'Pre-Need & Insurance',   fieldIds: ['hasPreNeedLicense', 'liabilityInsurer', 'liabilityPolicyNum'] },
  ],
  'pharmacy-permit': [
    { label: 'Pharmacy & PIC',         fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License & DEA',          fieldIds: ['licenseType', 'existingLicenseNumber', 'hasCertification'] },
    { label: 'Controlled Substances',  fieldIds: ['hasControlledSubstances'] },
  ],
  'social-worker-practice-license': [
    { label: 'Practitioner & Practice',fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'License & Status',       fieldIds: ['licenseType', 'existingLicenseNumber', 'isRenewal', 'hasCriminalHistory'] },
    { label: 'Insurance',              fieldIds: ['liabilityInsurer', 'liabilityPolicyNum'] },
  ],
  'real-estate-broker-license': [
    { label: 'Broker & Business',      fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License & Experience',   fieldIds: ['licenseType', 'existingLicenseNumber', 'yearsExperience', 'hasCertification'] },
    { label: 'E&O Insurance',          fieldIds: ['liabilityInsurer', 'liabilityPolicyNum'] },
  ],
  'alcohol-catering-endorsement': [
    { label: 'Business & Owner',       fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Alcohol & Events',       fieldIds: ['existingLicenseNumber', 'alcoholTypes', 'estimatedAnnualRevenue'] },
    { label: 'Liquor Liability',       fieldIds: ['liabilityInsurer', 'liabilityPolicyNum'] },
  ],
  // v74 — 5 new guided wizard forms
  'childcare-center-license': [
    { label: 'Center & Director',       fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'License Type & Capacity', fieldIds: ['licenseType', 'maxCapacity', 'ageGroupServed', 'squareFootagePerChild'] },
    { label: 'Safety & Background',     fieldIds: ['hasBackgroundCheck', 'hasFirstAid'] },
  ],
  'pool-spa-contractor-license': [
    { label: 'Contractor & Business',   fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License & Experience',    fieldIds: ['licenseType', 'yearsExperience', 'hasCertification'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  'landscape-contractor-license': [
    { label: 'Business & Owner',        fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Services & Certification',fieldIds: ['licenseType', 'hasCertification', 'existingLicenseNumber'] },
    { label: 'Insurance',               fieldIds: ['liabilityInsurer', 'liabilityPolicyNum'] },
  ],
  'security-guard-company-license': [
    { label: 'Company & Owner',         fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Services & Credentials',  fieldIds: ['licenseType', 'existingLicenseNumber', 'hasCriminalHistory'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  'food-manufacturer-license': [
    { label: 'Business & Owner',        fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Products & Facility',     fieldIds: ['licenseType', 'facilityType', 'estimatedAnnualRevenue'] },
    { label: 'Labeling Compliance',     fieldIds: ['hasRequiredLabeling'] },
  ],
  // v73 — 5 new guided wizard forms
  'plumbing-contractor-license': [
    { label: 'Contractor & Business',   fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License & Experience',    fieldIds: ['licenseType', 'yearsExperience', 'hasCertification'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  'hvac-contractor-license': [
    { label: 'Contractor & Business',   fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License & Certification', fieldIds: ['licenseType', 'yearsExperience', 'hasCertification'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  'pest-control-license': [
    { label: 'Business & Owner',        fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Service Category',        fieldIds: ['licenseType', 'existingLicenseNumber', 'hasCriminalHistory'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  'vehicle-repair-shop-license': [
    { label: 'Shop & Owner',            fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Services & Facility',     fieldIds: ['facilityType', 'numBays', 'hasEnvironmentalCompliance'] },
    { label: 'Insurance',               fieldIds: ['liabilityInsurer', 'liabilityPolicyNum'] },
  ],
  'roofing-contractor-license': [
    { label: 'Contractor & Business',   fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License & Experience',    fieldIds: ['licenseType', 'yearsExperience', 'hasCertification'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  // v72 — 5 new guided wizard forms
  'barbershop-cosmetology-salon-permit': [
    { label: 'Salon & Owner',           fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Establishment Type',      fieldIds: ['licenseType', 'numChairs', 'numLicensedEmployees'] },
    { label: 'Renewal Status',          fieldIds: ['existingLicenseNumber'] },
  ],
  'tattoo-body-art-studio-permit': [
    { label: 'Studio & Owner',          fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Services & Staffing',     fieldIds: ['servicesOffered', 'numArtists'] },
    { label: 'Safety & Sterilization',  fieldIds: ['hasSterilizationEquipment', 'hasDisposableNeedles'] },
  ],
  'electrical-contractor-license': [
    { label: 'Contractor & Business',   fieldIds: ['applicantLegalName', 'businessName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License & Experience',    fieldIds: ['licenseType', 'yearsExperience', 'hasCertification'] },
    { label: 'Insurance & Bond',        fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'bondAmount'] },
  ],
  'pet-grooming-salon-license': [
    { label: 'Business & Owner',        fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Facility Type',           fieldIds: ['facilityType', 'numAnimalCapacity'] },
    { label: 'Facilities & Policy',     fieldIds: ['hasGroomingStations', 'hasOutdoorRuns', 'vaccinationPolicy'] },
  ],
  'commercial-kitchen-shared-permit': [
    { label: 'Facility & Owner',        fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Kitchen Details',         fieldIds: ['numKitchenUnits', 'hoursOfOperation', 'memberCount'] },
    { label: 'Equipment & Compliance',  fieldIds: ['hasHoodSystem', 'hasThreeCompartmentSink'] },
  ],
  // v71 — 5 new guided wizard forms
  'notary-public-commission': [
    { label: 'Applicant Info',        fieldIds: ['applicantLegalName', 'physicalAddress', 'businessPhone', 'businessEmail', 'county'] },
    { label: 'Commission Details',    fieldIds: ['notaryTerm', 'existingLicenseNumber', 'hasCriminalHistory'] },
    { label: 'Bond & Surety',         fieldIds: ['notaryBondCompany', 'bondAmount'] },
  ],
  'auto-dealer-license': [
    { label: 'Dealer Info',           fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Dealer & Lot Details',  fieldIds: ['dealerType', 'lotSquareFootage', 'hasCriminalHistory'] },
    { label: 'Bond & Insurance',      fieldIds: ['bondAmount', 'notaryBondCompany', 'liabilityInsurer', 'liabilityPolicyNum'] },
  ],
  'charitable-solicitation-registration': [
    { label: 'Organization Info',     fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Charitable Activity',   fieldIds: ['charitablePurpose', 'isExempt501c3', 'grossRevenuePriorYear'] },
    { label: 'Fundraising Details',   fieldIds: ['fundraisingGoal', 'usesProfessionalFundraiser'] },
  ],
  'food-truck-city-permit': [
    { label: 'Business & Owner',      fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Vehicle Details',       fieldIds: ['vehicleVIN', 'vehicleLicensePlate', 'vehicleMake', 'vehicleYear'] },
    { label: 'Vending Operations',    fieldIds: ['vendingZone', 'operatingHours', 'existingLicenseNumber'] },
  ],
  'event-alcohol-permit': [
    { label: 'Business & Contact',    fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Event Details',         fieldIds: ['eventDate', 'eventStartTime', 'eventEndTime', 'expectedAttendance', 'eventType'] },
    { label: 'Alcohol Details',       fieldIds: ['alcoholTypes', 'hasExistingLicense', 'existingLicenseNumber'] },
  ],
  // v70 — 5 new guided wizard forms
  'short-term-rental-permit': [
    { label: 'Property & Contact',      fieldIds: ['ownerFullName', 'businessEmail', 'businessPhone', 'propertyAddress', 'mailingAddress'] },
    { label: 'Rental Details',          fieldIds: ['strType', 'numBedrooms', 'maxOccupancy', 'platformsListed', 'isPrimaryResidence', 'estimatedNightsPerYear'] },
    { label: 'Insurance & Compliance',  fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'liabilityAmount'] },
  ],
  'tobacco-retail-license': [
    { label: 'Business & Owner',        fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Product & Business Type', fieldIds: ['tobaccoProductTypes', 'businessType'] },
    { label: 'License Status',          fieldIds: ['isRenewal', 'existingLicenseNumber'] },
  ],
  'food-facility-annual-renewal': [
    { label: 'Establishment Info',      fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Current Permit',          fieldIds: ['existingLicenseNumber', 'expirationDate', 'facilityType', 'seatingCapacity'] },
    { label: 'Certification & Changes', fieldIds: ['certificationNumber', 'hasChanges', 'changeDescription'] },
  ],
  'massage-establishment-permit': [
    { label: 'Business & Owner',        fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Facility Details',        fieldIds: ['numTherapists', 'numTreatmentRooms', 'servicesOffered'] },
    { label: 'Insurance & Zoning',      fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'zoningComplianceConfirmed'] },
  ],
  'secondhand-dealer-license': [
    { label: 'Business & Owner',        fieldIds: ['businessName', 'ownerFullName', 'physicalAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'Dealer Type',             fieldIds: ['dealerType', 'willBuyFromPublic'] },
    { label: 'Bond & Compliance',       fieldIds: ['hasBond', 'bondAmount'] },
  ],
  // v68 — 5 new guided wizard forms
  'special-event-permit': [
    { label: 'Business & Organizer',   fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Event Details',          fieldIds: ['eventType', 'eventDate', 'eventStartTime', 'eventEndTime', 'expectedAttendance'] },
    { label: 'Operations & Compliance',fieldIds: ['hasLiveMusic', 'hasAlcohol', 'hasTemporaryStructures'] },
  ],
  'outdoor-dining-permit': [
    { label: 'Business Info',          fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Seating Details',        fieldIds: ['seatingAreaType', 'numOutdoorSeats', 'squareFootage', 'hasEnclosure'] },
    { label: 'Compliance & Safety',    fieldIds: ['hasBarService', 'propertyOwnerConsent', 'hasHeaters'] },
  ],
  'catering-license': [
    { label: 'Business Info',          fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Catering Operations',    fieldIds: ['cateringType', 'vehicleCount', 'servesAlcohol'] },
    { label: 'Commissary & Staffing',  fieldIds: ['hasCommissary', 'commissaryName', 'commissaryAddress', 'commissaryLicenseNumber', 'foodManagerCertNumber'] },
  ],
  'childcare-home-license': [
    { label: 'Provider Info',          fieldIds: ['ownerFullName', 'businessName', 'homeAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Facility & Capacity',    fieldIds: ['licenseType', 'maxCapacity', 'ageGroupServed', 'squareFootagePerChild'] },
    { label: 'Certification & Safety', fieldIds: ['hasBackgroundCheck', 'hasFirstAid'] },
  ],
  'professional-license-registration': [
    { label: 'Applicant Info',         fieldIds: ['applicantLegalName', 'businessName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'License Details',        fieldIds: ['licenseType', 'stateOfIssuance'] },
    { label: 'Renewal Status',         fieldIds: ['isRenewal', 'existingLicenseNumber', 'expirationDate'] },
  ],
  // v66 — 5 new guided wizard forms
  'food-service-plan-review': [
    { label: 'Business Info',          fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Facility Details',       fieldIds: ['facilityType', 'seatingCapacity', 'squareFootage', 'openingDate'] },
    { label: 'Equipment & Systems',    fieldIds: ['hasGreaseTrap', 'waterHeaterCapacity', 'architectOrDesigner'] },
  ],
  'employer-withholding-registration': [
    { label: 'Business Info',          fieldIds: ['businessName', 'fein', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Entity & Ownership',     fieldIds: ['entityType', 'ownerFullName'] },
    { label: 'Payroll Details',        fieldIds: ['firstHireDate', 'numEmployees', 'payrollFrequency', 'businessType'] },
  ],
  'business-personal-property-tax': [
    { label: 'Business Info',          fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'fein'] },
    { label: 'Business Classification',fieldIds: ['businessType'] },
    { label: 'Asset Values',           fieldIds: ['equipmentValue', 'furnitureValue', 'leaseholdValue', 'inventoryValue', 'taxYear'] },
  ],
  'zoning-compliance-letter-request': [
    { label: 'Applicant & Property',   fieldIds: ['applicantLegalName', 'businessAddress', 'parcelNumber', 'currentZoneType'] },
    { label: 'Request Details',        fieldIds: ['proposedBusinessUse', 'purposeOfRequest'] },
    { label: 'Contact & Delivery',     fieldIds: ['businessPhone', 'businessEmail', 'deliveryPreference'] },
  ],
  'health-dept-inspection-checklist': [
    { label: 'Establishment Info',     fieldIds: ['businessName', 'businessAddress', 'ownerFullName', 'businessPhone'] },
    { label: 'Staff & Management',     fieldIds: ['hasCertifiedManager'] },
    { label: 'Facility Compliance',    fieldIds: ['hasHandwashingSinks', 'tempControlsWorking', 'hotHoldingTemp', 'noPestEvidence'] },
    { label: 'Food Safety',            fieldIds: ['foodFromApprovedSource', 'threeCompartmentSinkClean', 'sanitizerConcentration', 'personalHygieneCompliant', 'inspectionDate'] },
  ],
  // v65 — 5 new guided wizard forms
  'building-permit': [
    { label: 'Business & Contact',    fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Project Details',       fieldIds: ['workType', 'projectDescription', 'estimatedProjectCost', 'squareFootageAffected'] },
    { label: 'Contractor Info',       fieldIds: ['contractorName', 'contractorLicenseNumber', 'startDate'] },
  ],
  'food-manager-certification': [
    { label: 'Business Info',         fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone'] },
    { label: 'Certification Details', fieldIds: ['certProvider', 'examDate', 'certificationNumber', 'expirationDate'] },
    { label: 'Staffing',              fieldIds: ['numCertifiedManagers'] },
  ],
  'resale-certificate': [
    { label: 'Your Business',         fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'fein', 'stateTaxId'] },
    { label: 'Purchase Details',      fieldIds: ['businessType', 'goodsPurchased'] },
    { label: 'Supplier (Optional)',   fieldIds: ['sellerName', 'sellerAddress'] },
  ],
  'workers-comp-exemption': [
    { label: 'Business Info',         fieldIds: ['businessName', 'fein', 'businessAddress', 'businessPhone'] },
    { label: 'Exemption Details',     fieldIds: ['entityType', 'exemptionType', 'ownerFullName', 'ownerTitle', 'ownershipPercentage'] },
    { label: 'Employees',             fieldIds: ['numEmployees'] },
  ],
  'dba-county-registration': [
    { label: 'DBA Name & Owner',      fieldIds: ['fictitiousName', 'ownerFullName', 'entityType'] },
    { label: 'Business Address',      fieldIds: ['businessAddress', 'mailingAddress', 'county'] },
    { label: 'Contact & Operations',  fieldIds: ['businessPhone', 'businessEmail', 'businessType', 'requiresNewspaperPublication'] },
  ],
  // v64 — 7 new guided wizard forms
  'temporary-food-vendor-permit': [
    { label: 'Operator Info',         fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Event Details',         fieldIds: ['eventName', 'eventLocation', 'eventDates', 'foodTypes'] },
    { label: 'Food Handling',         fieldIds: ['foodPrepMethod', 'waterSource', 'foodManagerCert'] },
  ],
  'cottage-food-registration': [
    { label: 'Your Information',      fieldIds: ['businessName', 'ownerFullName', 'homeAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Products & Sales',      fieldIds: ['productTypes', 'salesChannels', 'estimatedAnnualRevenue'] },
    { label: 'Compliance',            fieldIds: ['hasRequiredLabeling'] },
  ],
  'liquor-license-application': [
    { label: 'Business & Owner',      fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail', 'fein'] },
    { label: 'License Details',       fieldIds: ['licenseType', 'premiseType', 'seatingCapacity', 'alcoholSalesPercent'] },
    { label: 'Security',              fieldIds: ['hasSecurityPlan'] },
  ],
  'sign-permit': [
    { label: 'Business & Location',   fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone'] },
    { label: 'Sign Specifications',   fieldIds: ['signType', 'signDimensions', 'signMaterial', 'isIlluminated', 'illuminationType'] },
    { label: 'Installation',          fieldIds: ['installerName'] },
  ],
  'fire-inspection-certificate': [
    { label: 'Business & Premises',   fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone'] },
    { label: 'Space Details',         fieldIds: ['squareFootage', 'occupancyType', 'maxOccupancy'] },
    { label: 'Fire Safety Systems',   fieldIds: ['hasSprinklers', 'hasFireAlarm', 'exitCount'] },
  ],
  'alarm-permit': [
    { label: 'Business Info',         fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone'] },
    { label: 'Alarm System',          fieldIds: ['alarmType', 'alarmCompany', 'alarmCompanyPhone'] },
    { label: 'Emergency Contacts',    fieldIds: ['emergencyContactName', 'emergencyContactPhone', 'emergencyContact2Name', 'emergencyContact2Phone'] },
  ],
  'sidewalk-vending-permit': [
    { label: 'Vendor Info',           fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'Vending Details',       fieldIds: ['vendingLocation', 'vendingType', 'operatingHours', 'cartDimensions'] },
    { label: 'Insurance',             fieldIds: ['hasLiabilityInsurance'] },
  ],
  // v63 — new hyper-local forms
  'zoning-variance-application': [
    { label: 'Applicant & Property',  fieldIds: ['applicantLegalName', 'propertyAddress', 'parcelNumber', 'currentZoneType'] },
    { label: 'Variance Details',      fieldIds: ['requestedVarianceType', 'proposedBusinessUse', 'hardshipJustification', 'neighborImpactStatement'] },
    { label: 'Contact',               fieldIds: ['ownerFullName', 'businessPhone', 'businessEmail'] },
  ],
  'commissary-agreement-worksheet': [
    { label: 'Your Food Truck',       fieldIds: ['businessName', 'ownerFullName', 'businessAddress', 'businessPhone'] },
    { label: 'Commissary Details',    fieldIds: ['commissaryName', 'commissaryAddress', 'commissaryLicenseNumber', 'commissaryContactName', 'commissaryPhone', 'commissaryServicesUsed'] },
    { label: 'Vehicle Info',          fieldIds: ['vehicleVIN', 'vehicleLicensePlate'] },
  ],
  // v62 — new forms
  'annual-report': [
    { label: 'Entity Information',   fieldIds: ['entityName', 'entityType', 'stateOfFormation'] },
    { label: 'Principal Address',    fieldIds: ['principalAddress', 'registeredAgentName', 'registeredAgentAddress'] },
    { label: 'Officer / Manager',    fieldIds: ['ownerFullName', 'ownerTitle', 'businessEmail', 'businessPhone'] },
    { label: 'Changes',              fieldIds: ['hasChanged'] },
  ],
  'boi-report': [
    { label: 'Reporting Company',    fieldIds: ['entityLegalName', 'entityTradeName', 'fein', 'formationState', 'principalAddress'] },
    { label: 'Beneficial Owner',     fieldIds: ['ownerFullName', 'ownerDateOfBirth', 'ownerAddress', 'ownerIdType', 'ownerIdNumber', 'ownerIdState'] },
    { label: 'Additional Details',   fieldIds: ['additionalOwners', 'isNewCompany'] },
  ],
  'contractor-license': [
    { label: 'Business & Applicant', fieldIds: ['applicantLegalName', 'ownerFullName', 'businessAddress', 'businessPhone', 'businessEmail'] },
    { label: 'License Details',      fieldIds: ['licenseClassType', 'yearsExperience', 'businessType', 'fein', 'hasPassedExam'] },
    { label: 'Insurance & Bond',     fieldIds: ['liabilityInsurer', 'liabilityPolicyNum', 'liabilityAmount', 'hasWorkersComp', 'bondAmount'] },
  ],
  'w9-collection': [
    { label: 'Contractor Info',      fieldIds: ['contractorLegalName', 'contractorBizName', 'contractorTaxClass', 'contractorAddress', 'contractorTIN'] },
    { label: 'Your Business',        fieldIds: ['payerBusinessName', 'payerFein'] },
    { label: 'Payment Details',      fieldIds: ['contractorStartDate', 'estimatedPayment'] },
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

  // v68 — new skip conditions

  // Catering: skip commissary details when not yet secured
  commissaryAddress: (d) =>
    (d.hasCommissary ?? "").startsWith("No"),

  // Catering: skip vehicle count for drop-off only (still relevant for drop-off, always show)
  vehicleCount: () => false, // always show — important for health dept compliance

  // Professional license: skip existing license number for new applications
  existingLicenseNumber: (d) =>
    d.isRenewal === "New application",

  // Professional license: skip expiration date for new applications
  // (expirationDate is already used in food-manager-cert; it can apply here too)

  // Outdoor dining: skip heaters question (always show — relevant for compliance)
  hasHeaters: () => false,

  // Childcare: skip square footage per child (always show — critical threshold)
  squareFootagePerChild: () => false,

  // v66 — new skip conditions

  // Food service plan review: skip grease trap capacity if no grease trap
  waterHeaterCapacity: (d) =>
    d.hasGreaseTrap === "No" || d.hasGreaseTrap === "false",

  // Business personal property tax: skip inventory value if state exempts inventory
  inventoryValue: (d) => {
    const addr = (d.businessAddress ?? "").toLowerCase();
    // Florida exempts inventory from TPP tax
    return addr.includes(", fl") || addr.includes(",fl") || addr.includes("florida");
  },

  // Zoning compliance letter: skip delivery preference (optional — always show)
  deliveryPreference: () => false,

  // Health dept inspection: skip hot-holding temp check for cold-only operations
  hotHoldingTemp: (d) => {
    const ft = (d.facilityType ?? "").toLowerCase();
    return ft.includes("cold") || ft.includes("produce") || ft.includes("market");
  },

  // v65 — new skip conditions

  // Building permit: skip contractor fields if owner-builder
  contractorLicenseNumber: (d) =>
    (d.contractorName ?? "").trim().length === 0 ||
    (d.contractorName ?? "").toLowerCase().includes("owner"),

  // Food manager cert: skip expiration date if not yet certified
  expirationDate: (d) =>
    (d.certificationNumber ?? "").trim().length === 0 && !d.examDate,

  // Resale cert: skip seller address (optional — only some states need per-seller cert)
  sellerAddress: (d) =>
    (d.sellerName ?? "").trim().length === 0,

  // Workers comp: skip ownership percentage for sole prop (always 100%)
  ownershipPercentage: (d) =>
    d.exemptionType === "Sole Proprietor (self only — no employees)",

  // DBA: skip mailing address if same as business
  mailingAddress: () => false, // always show — user can skip by leaving blank

  // DBA: skip newspaper publication field for most users
  requiresNewspaperPublication: () => false, // always show — important compliance info

  // v64 — new skip conditions

  // Temporary food vendor: skip water source for pre-packaged food only
  waterSource: (d) =>
    d.foodPrepMethod === "Pre-packaged / shelf-stable only (no on-site cooking)",

  // Temporary food vendor: skip food manager cert for pre-packaged only
  foodManagerCert: (d) =>
    d.foodPrepMethod === "Pre-packaged / shelf-stable only (no on-site cooking)",

  // Cottage food: skip annual revenue if not required (FYI field)
  estimatedAnnualRevenue: () => false, // always show — important threshold info

  // Liquor license: skip seating capacity for off-premise (retail) licenses
  seatingCapacity: (d) => {
    const lt = (d.licenseType ?? "").toLowerCase();
    return lt.includes("off-premise") || lt.includes("retail");
  },

  // Liquor license: skip security plan for retail (non-bar) premises
  hasSecurityPlan: (d) => {
    const pt = (d.premiseType ?? "").toLowerCase();
    return !pt.includes("bar") && !pt.includes("nightclub") && !pt.includes("club");
  },

  // Sign permit: skip illumination type if not illuminated
  illuminationType: (d) => d.isIlluminated !== "Yes",

  // Fire inspection: skip max occupancy for office/warehouse (calculated by inspector)
  maxOccupancy: () => false, // always show — applicant can leave blank if unknown

  // Alarm permit: skip 2nd emergency contact (optional)
  emergencyContact2Name:  () => false,
  emergencyContact2Phone: () => false,

  // v62 — new skip conditions

  // Annual report: skip change details if no changes reported
  registeredAgentAddress: (d) =>
    d.hasChanged === "No changes — confirming existing information",

  // BOI: skip company applicant section for pre-2024 entities
  isNewCompany: () => false, // always show this field so user can self-identify
  ownerIdState: (d) => !d.ownerIdType, // skip until ID type selected

  // Contractor: skip exam status if listed as exempt via reciprocal license
  hasPassedExam: () => false, // always show

  // Contractor: skip workers comp fields if sole owner exempt
  hasWorkersComp: () => false, // always show

  // W-9 collection: skip contractor start date (optional field)
  contractorStartDate: () => false, // optional — never forced-skipped

  // v77 — new skip conditions for STR occupancy tax, farmers market, vape, solicitor, hair braiding

  // STR occupancy tax: skip APN if platform remits all taxes
  apnNumber: (d) =>
    (d.platformRemitsTax ?? "").startsWith("Yes — platform collects"),

  // STR occupancy tax: always show platform remits tax — critical for compliance
  platformRemitsTax: () => false,

  // Farmers market: skip insurance details for first-time vendors (helpful guidance — always show)
  // liabilityInsurer already defined — always show (reuse)
  marketAddress: () => false, // always show — health dept needs exact market address
  operatingDays: () => false, // always show
  marketName:    () => false, // always show

  // Farmers market: skip existing license number if no prior licenses
  // (existingLicenseNumber already handled by isRenewal condition — reuse)

  // Farmers market: product type always shown — determines which health dept permits apply
  vendorProductType: () => false,

  // Vape shop: always show age verification and display restrictions — federal compliance required
  hasAgeVerification:   () => false,
  hasDisplayRestrictions: () => false,

  // Vape shop: products type always shown — determines which licenses apply
  vapeProductTypes: () => false,

  // Solicitor permit: skip vehicle plate for non-vehicle solicitors
  // (vehicleLicensePlate already exists — repurpose condition)

  // Solicitor: solicitor type always shown — determines permit category
  solicitorType: () => false,
  operatingArea: () => false, // always shown

  // Hair braiding: skip training hours and school for states that don't require training
  trainingHoursCompleted: (d) =>
    (d.licenseType ?? "").includes("No state license required"),

  trainingSchool: (d) =>
    (d.licenseType ?? "").includes("No state license required"),

  // Hair braiding: skip criminal history for states that don't require background check
  // (hasCriminalHistory already defined — keep existing condition)

  // v76 — new skip conditions for painting, masonry, pool health, cosmetologist, towing

  // Painting / masonry: skip lead cert for contractors who only work on new construction
  hasLeadCert: (d) =>
    (d.hasCertification ?? "").toLowerCase().includes("not required"),

  // Pool health permit: skip lifeguard field for private/residential facilities
  hasLifeguard: (d) =>
    (d.facilityType ?? "").toLowerCase().includes("private") ||
    (d.facilityType ?? "").toLowerCase().includes("residential"),

  // Pool health: drain cover is always required (VGB Act applies to all pools)
  hasDrainCover: () => false,

  // Pool health: ADA pool lift always shown — federal ADA requirement
  hasADACompliance: () => false,

  // Pool health: water test frequency always shown — core health dept question
  waterTestFrequency: () => false,

  // Pool health: numPoolUnits always shown
  numPoolUnits: () => false,

  // Masonry: specialty always shown
  masonrySpecialty: () => false,

  // Towing: skip numVehicles if licenseType is "Repo / repossession" (repo is different)
  numVehicles: (d) =>
    (d.licenseType ?? "").toLowerCase().includes("repo"),

  // Towing: skip per-vehicle insurance question if fleet policy selected
  hasInsurancePerVehicle: () => false, // always show — critical compliance question

  // v75 — new skip conditions for funeral home, pharmacy, social worker, real estate, alcohol catering

  // Funeral home: skip pre-need license question for facilities that only do body transport
  hasPreNeedLicense: (d) =>
    (d.facilityType ?? "").toLowerCase().includes("transport") ||
    (d.facilityType ?? "").toLowerCase().includes("cremation only"),

  // Funeral home: always show crematorium question — critical for facility classification
  hasCrematorium: () => false,

  // Pharmacy: skip controlled substances question only if DEA registration is explicitly "None / Not applicable"
  hasControlledSubstances: (d) =>
    (d.hasCertification ?? "").toLowerCase().includes("not applicable") ||
    (d.hasCertification ?? "").toLowerCase().includes("none"),

  // v74 — new skip conditions for childcare, pool/spa, landscape, security, food manufacturer

  // Childcare center: squareFootagePerChild always required — inspector checks this
  // (squareFootagePerChild already has a "() => false" rule in v68, reuse that)

  // Pool/spa: always show all fields — all critical for licensing

  // Landscape: skip pesticide license number if no pesticides used
  // (existingLicenseNumber skip already handled per isRenewal; add landscape-specific)
  // hasCertification always show for landscape — critical compliance question

  // Security: skip bond for alarm-monitoring-only companies in some states
  // (bondAmount already has existing skip rule from secondhand; leave as-is)

  // Food manufacturer: skip labeling compliance for cottage-food / direct-sale only
  hasRequiredLabeling: (d) =>
    d.facilityType === "Home kitchen — applying for home food manufacturer permit" &&
    (d.estimatedAnnualRevenue ?? "").replace(/[$,]/g, "").trim() === "",

  // estimatedAnnualRevenue: already defined in v64 as () => false — always show

  // v73 — new skip conditions for plumbing, hvac, pest-control, vehicle-repair, roofing

  // Plumbing / HVAC / Roofing: shared skip rules for contractor license trio
  // licenseType: always show (critical field)
  // yearsExperience: always show
  // All three use hasCertification — already defined in v72, no duplicate needed

  // Pest control: skip bond for businesses using only general-use pesticides (some states exempt)
  // hasCriminalHistory: already defined — always show

  // Vehicle repair: skip num bays for mobile-only services
  numBays: (d) =>
    (d.facilityType ?? "").toLowerCase().includes("mobile"),

  // Vehicle repair: always show environmental compliance — critical for inspection
  hasEnvironmentalCompliance: () => false,

  // Roofing / plumbing / hvac: skip bond if state doesn't require it
  // (bondAmount already has existing condition — leave it as-is, just show for all)

  // v72 — new skip conditions for cosmetology, tattoo, electrical, pet grooming, shared kitchen

  // Cosmetology: skip renewal license number for new establishments
  numLicensedEmployees: () => false, // always show — critical for inspections
  numChairs:            () => false, // always show

  // Tattoo: skip sterilization equipment question if mobile/home-visit only
  numArtists:           () => false, // always show

  // Electrical: skip exam status if license type is journeyman (they pass exam)
  hasCertification:     () => false, // always show — important disclosure

  // Electrical: skip bond for low-voltage only contractors (some states don't require)
  // bondAmount: already handled above — always show

  // Pet grooming: skip outdoor runs for mobile grooming
  hasOutdoorRuns: (d) =>
    d.facilityType === "Mobile pet grooming (van/trailer)",

  // Pet grooming: skip grooming stations for boarding-only kennel
  hasGroomingStations: (d) =>
    d.facilityType === "Dog / cat boarding kennel (overnight)",

  // Shared kitchen: skip member count (optional at application time)
  memberCount: () => false, // always show — helpful for health dept review

  // Shared kitchen: always show hood and sink questions — critical health dept fields
  hasHoodSystem:           () => false,
  hasThreeCompartmentSink: () => false,

  // v71 — new skip conditions for notary, auto-dealer, charitable, food-truck, event-alcohol

  // Notary: skip existing commission number for new applicants
  notaryTerm: () => false, // always show

  // Notary / auto-dealer: skip bond company if no bond required
  notaryBondCompany: (d) =>
    d.bondAmount === "N/A" || d.bondAmount === "0" || d.bondAmount === "",

  // Auto-dealer: skip lot size for wholesale-only dealers
  lotSquareFootage: (d) =>
    d.dealerType === "Wholesale (dealer-to-dealer only, no retail lot)",

  // Charitable: skip professional fundraiser question for small orgs
  usesProfessionalFundraiser: (d) => {
    const rev = parseFloat(d.grossRevenuePriorYear ?? "0");
    return !isNaN(rev) && rev < 5000;
  },

  // Event alcohol: skip existing license number for first-time applicants
  hasExistingLicense: () => false, // always show

  // Food truck city permit: vendingZone always shown; existingLicenseNumber skipped for new
  vendingZone: () => false, // always show

  // v70 — new skip conditions for STR, tobacco, food renewal, massage, secondhand

  // STR: skip mailing address if same as property (always show — user can skip by leaving blank)
  // mailingAddress: already defined above as () => false — always show

  // STR: skip estimated nights if entire home / non-primary (optional field)
  estimatedNightsPerYear: (d) =>
    d.isPrimaryResidence === "No — this is an investment/secondary property",

  // Tobacco: skip existing license number for new applications
  // (existingLicenseNumber already handled by v68 condition for professional-license)

  // Food renewal: skip change description if no changes
  changeDescription: (d) =>
    d.hasChanges === "No changes — all information is the same as last year",

  // Secondhand: skip bond amount if not bonded
  bondAmount: (d) =>
    d.hasBond === "No — not required for my business type" ||
    d.hasBond === "N/A — not a pawn shop",

  // Secondhand: skip bond question for online-only resellers (no physical location)
  hasBond: (d) =>
    d.dealerType === "Online reseller (eBay, Mercari, Facebook Marketplace)",

  // Massage: zoningComplianceConfirmed — always show (critical for permit approval)
  zoningComplianceConfirmed: () => false,

  // v69 — Category-aware skip conditions based on businessType (category id)

  // Skip liquor / alcohol fields for non-food/non-bar categories
  servesAlcohol: (d) => {
    const bt = (d.businessType ?? "").toLowerCase();
    // Only relevant for food service, catering, events — skip for office/service businesses
    return !bt.includes("food") && !bt.includes("restaurant") && !bt.includes("cafe") &&
           !bt.includes("bar") && !bt.includes("brewery") && !bt.includes("catering") &&
           !bt.includes("event") && !bt.includes("hotel");
  },

  // Skip outdoor seating fields for businesses that clearly operate indoors only
  hasOutdoorSeating: (d) => {
    const bt = (d.businessType ?? "").toLowerCase();
    return bt.includes("online") || bt.includes("ecommerce") || bt.includes("home-office") ||
           bt.includes("consulting") || bt.includes("accounting") || bt.includes("legal");
  },

  // Skip delivery/fleet fields for non-delivery / non-transport categories
  numDeliveryVehicles: (d) => {
    const bt = (d.businessType ?? "").toLowerCase();
    return !bt.includes("truck") && !bt.includes("delivery") && !bt.includes("catering") &&
           !bt.includes("freight") && !bt.includes("courier") && !bt.includes("transport");
  },

  // Skip childcare-specific fields for non-childcare categories
  ageGroupServed: (d) => {
    const bt = (d.businessType ?? "").toLowerCase();
    return !bt.includes("daycare") && !bt.includes("childcare") && !bt.includes("preschool") &&
           !bt.includes("after-school") && !bt.includes("child");
  },
}

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

// v63 — Zoning seed helper ────────────────────────────────────────────────────
// Pre-seeds zone-aware fields from a zoning check result attached to the business.
// v70 — Extended to pre-fill propertyAddress, proposedBusinessUse, and
//        zoningComplianceConfirmed for relevant permit forms (STR, massage, etc.)
// Only seeds fields that have not already been set by the profile seed.
function buildZoningSeed(
  zoningProfile: ZoningProfileHint | null | undefined,
  existingSeed: Record<string, string>,
): Record<string, string> {
  if (!zoningProfile) return existingSeed;
  const seed = { ...existingSeed };

  // Zone type → currentZoneType (zoning variance, compliance letter)
  if (zoningProfile.zoneType && !seed.currentZoneType) {
    seed.currentZoneType = zoningProfile.zoneType;
  }

  // Zoning address → propertyAddress (STR permit, zoning variance, compliance letter)
  if (zoningProfile.address && !seed.propertyAddress) {
    seed.propertyAddress = zoningProfile.address;
  }

  // v70 — Zoning status → zoningComplianceConfirmed (massage establishment permit)
  if (!seed.zoningComplianceConfirmed && zoningProfile.status) {
    if (zoningProfile.status === "allowed") {
      seed.zoningComplianceConfirmed = "Yes — zoning permits massage/personal care at this location";
    } else if (zoningProfile.status === "conditional") {
      seed.zoningComplianceConfirmed = "Yes — in a mixed-use commercial zone";
    } else if (zoningProfile.status === "prohibited") {
      seed.zoningComplianceConfirmed = "Unsure — need to verify with city/county planning";
    }
  }

  // v70 — Zoning address → businessAddress for forms that use businessAddress
  if (zoningProfile.address && !seed.businessAddress) {
    seed.businessAddress = zoningProfile.address;
  }

  // For variance type: suggest home occupation if zoning status is conditional/prohibited
  if (!seed.requestedVarianceType) {
    if (zoningProfile.status === "conditional") {
      seed.requestedVarianceType = "Special Exception / Conditional Use Permit";
    } else if (zoningProfile.status === "prohibited") {
      seed.requestedVarianceType = "Use Variance (use not permitted by right)";
    }
  }

  // v70 — Zoning restrictions → proposedBusinessUse hint (zoning compliance letter)
  if (!seed.proposedBusinessUse && zoningProfile.zoneType) {
    seed.proposedBusinessUse = zoningProfile.zoneType;
  }

  // v72 — Deeper zoning integration: map zoneType keywords to form-specific pre-fills

  // If zone is residential/home, pre-fill home-occupation related fields
  if (zoningProfile.zoneType) {
    const zt = zoningProfile.zoneType.toLowerCase();

    // Residential zoning → suggest home occupation type for relevant forms
    if ((zt.includes("residential") || zt.includes("r-1") || zt.includes("r-2") ||
         zt.includes("r-3") || zt.includes("r-sf") || zt.includes("single-family")) &&
        !seed.ownershipStatus) {
      seed.ownershipStatus = "Owner-occupied primary residence";
    }

    // Commercial zoning → pre-fill zoningComplianceConfirmed for cosmetology / tattoo / electrical
    if ((zt.includes("commercial") || zt.includes("c-1") || zt.includes("c-2") ||
         zt.includes("c-3") || zt.includes("b-2") || zt.includes("b-3") ||
         zt.includes("mixed-use") || zt.includes("mu")) && !seed.zoningComplianceConfirmed) {
      seed.zoningComplianceConfirmed = "Yes — commercial/mixed-use zoning permits this business use";
    }

    // Industrial / light industrial → pre-fill for shared kitchen and auto dealer
    if ((zt.includes("industrial") || zt.includes("i-1") || zt.includes("i-2") ||
         zt.includes("light industrial") || zt.includes("warehouse")) && !seed.zoningComplianceConfirmed) {
      seed.zoningComplianceConfirmed = "Yes — industrial/light industrial zone permits this business use";
    }
  }

  // v76 — Deeper zoning integration: residential → home-based pre-fills; commercial → pool/salon hints

  if (zoningProfile.zoneType) {
    const zt = zoningProfile.zoneType.toLowerCase();

    // Residential zones: pre-fill home occupation permit fields
    if ((zt.includes("residential") || zt.includes("r-1") || zt.includes("r-2") ||
         zt.includes("r-3") || zt.includes("r-sf") || zt.includes("single-family") ||
         zt.includes("r-a") || zt.includes("ag-residential")) && !seed.businessAddress) {
      seed.businessAddress = zoningProfile.address ?? "";
    }

    // Commercial / mixed-use zones: pre-fill pool facility compliance hint
    if ((zt.includes("commercial") || zt.includes("mixed-use") || zt.includes("c-1") ||
         zt.includes("c-2") || zt.includes("c-3")) && !seed.zoningComplianceConfirmed) {
      seed.zoningComplianceConfirmed = "Yes — commercial/mixed-use zoning permits this business use";
    }

    // Neighborhood commercial or B zones: suggest home-occupation for personal-service permits
    if ((zt.includes("neighborhood commercial") || zt.includes("n-c") ||
         zt.includes("b-1") || zt.includes("office")) && !seed.facilityType) {
      seed.facilityType = "Commercial — operating from a permanent commercial address";
    }
  }

  // v76 — Pre-fill zoning status as ADA compliance hint for pool permits
  if (zoningProfile.status === "allowed" && !seed.hasADACompliance) {
    seed.hasADACompliance = "Yes — ADA-compliant pool lift installed";
  }

  // v77 — Deeper zoning integration: STR zones → occupancy tax pre-fill;
  //        commercial/retail zones → vape shop and solicitor permit hints.
  if (zoningProfile.zoneType) {
    const zt = zoningProfile.zoneType.toLowerCase();

    // Short-term rental zones (vacation overlay, resort, STR district): pre-fill STR type
    if ((zt.includes("vacation") || zt.includes("resort") || zt.includes("str") ||
         zt.includes("tourist") || zt.includes("overlay")) && !seed.strType) {
      seed.strType = "Entire home / apartment";
    }

    // Retail / B-1 / neighborhood commercial: suggest farmer's market or vape shop compliance
    if ((zt.includes("retail") || zt.includes("b-1") || zt.includes("neighborhood commercial") ||
         zt.includes("strip commercial")) && !seed.vendorProductType) {
      seed.vendorProductType = "Other services or products";
    }

    // Pre-fill propertyAddress for STR occupancy tax from zoning address
    if (zoningProfile.address && !seed.propertyAddress) {
      seed.propertyAddress = zoningProfile.address;
    }

    // Transient/mobile zone (outdoor market, vending district): suggest solicitor type
    if ((zt.includes("market") || zt.includes("vending") || zt.includes("outdoor") ||
         zt.includes("festival")) && !seed.solicitorType) {
      seed.solicitorType = "Transient merchant (no fixed location)";
    }
  }

  // v72 — Pre-fill county from zoning address if county field is empty
  if (zoningProfile.address && !seed.county) {
    // Extract county hint from address (best-effort: look for ", County" or state suffix)
    const addrParts = zoningProfile.address.split(",").map(p => p.trim());
    if (addrParts.length >= 2) {
      // Use second-to-last segment as a city/county hint if it looks like a location name
      const locationHint = addrParts[addrParts.length - 2];
      if (locationHint && locationHint.length > 1 && !locationHint.match(/^\d{5}/)) {
        seed.county = locationHint;
      }
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
  onFormCompleteWithoutProfile,
  zoningProfile,
}: FormFillerProps) {
  const [phase, setPhase] = useState<FillerPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Seed formData: priority = initialFormData (renewal) > profile auto-fill > zoning pre-fill > empty
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (initialFormData && Object.keys(initialFormData).length > 0) return initialFormData;
    const profileSeed = buildProfileSeed(template.fields, businessProfile);
    return buildZoningSeed(zoningProfile, profileSeed);
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
        <div className="max-w-2xl mx-auto p-3 sm:p-5">
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

          {/* v63 — Zoning advisory banner: shown when a zoning result is attached */}
          {zoningProfile && zoningProfile.status && (
            <div className={`flex items-start gap-2 rounded-xl px-3 py-2 mb-3 border ${
              zoningProfile.status === "allowed"
                ? "bg-green-50 border-green-200"
                : zoningProfile.status === "conditional"
                ? "bg-amber-50 border-amber-200"
                : zoningProfile.status === "prohibited"
                ? "bg-red-50 border-red-200"
                : "bg-slate-50 border-slate-200"
            }`}>
              <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${
                zoningProfile.status === "allowed" ? "text-green-500"
                : zoningProfile.status === "conditional" ? "text-amber-500"
                : zoningProfile.status === "prohibited" ? "text-red-500"
                : "text-slate-400"
              }`} />
              <p className={`text-xs ${
                zoningProfile.status === "allowed" ? "text-green-800"
                : zoningProfile.status === "conditional" ? "text-amber-800"
                : zoningProfile.status === "prohibited" ? "text-red-800"
                : "text-slate-600"
              }`}>
                <strong>Zoning: {zoningProfile.zoneType ?? zoningProfile.status}</strong>
                {zoningProfile.status === "conditional" && " — Conditional use; a variance or special exception may be required."}
                {zoningProfile.status === "prohibited" && " — Business use not permitted by right; a use variance is likely required."}
                {zoningProfile.status === "allowed" && " — Business use is permitted in this zone. No variance needed."}
                {zoningProfile.restrictions && zoningProfile.restrictions.length > 0 && (
                  <span className="block mt-0.5 text-[10px] opacity-80">
                    Restrictions: {zoningProfile.restrictions.slice(0, 2).join("; ")}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* v64 — Zoning variance suggestion: shown when zoning is conditional/prohibited
                    and the user is NOT already in the variance form itself */}
          {zoningProfile &&
            (zoningProfile.status === "conditional" || zoningProfile.status === "prohibited") &&
            template.id !== "zoning-variance-application" && (
            <div className="flex items-center gap-2 bg-[#0B1E3F]/5 border border-[#0B1E3F]/20 rounded-xl px-3 py-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#0B1E3F] shrink-0" />
              <p className="text-[11px] text-[#0B1E3F] leading-snug">
                <strong>Variance may be required.</strong>{" "}
                Based on your zoning check, complete the{" "}
                <span className="underline underline-offset-2 font-semibold">
                  Zoning Variance / Special Exception Application
                </span>{" "}
                after this form. RegPulse can pre-fill it with your zone data.
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
        <div className="max-w-2xl mx-auto p-3 sm:p-5 text-center">
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
        <div className="max-w-2xl mx-auto p-3 sm:p-5">
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
        <div className="max-w-2xl mx-auto p-3 sm:p-5">
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

          {/* vMobile: button row wraps on narrow screens */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentIndex > 0 && (
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <Button className="flex-1 min-w-[120px] bg-[#0B1E3F] hover:bg-[#0B1E3F]/90" onClick={handleNext}>
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
          // PDF already generated — user is confirming/continuing.
          // v62 — if no business profile exists, trigger automatic profile creation.
          if (!businessProfile) {
            onFormCompleteWithoutProfile?.(formData, template.id);
          }
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
        <div className="max-w-2xl mx-auto p-3 sm:p-5">
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
        <div className="max-w-2xl mx-auto p-3 sm:p-5">
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
        <div className="max-w-2xl mx-auto p-3 sm:p-5 text-center">
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
