// v60 — Real PDF pre-filling engine with actual government form templates
// generateFormPdf.ts — jsPDF fallback when native AcroForm fill is unavailable.
// Returns a base64 string (no side-effects) so the caller can upload to Storage,
// trigger a browser download, and attach to the business profile.
// Upgraded in v60:
// - Returns base64 string instead of saving directly (caller owns the download)
// - Rich two-column field layout with labelled boxes and filled values
// - Section grouping using FORM_STEP_SECTIONS from FormFiller
// - "Prepared by RegPulse" stamp block on page 1
// - Official field name hints rendered in smaller type below each value
// - All brand colors updated to RegPulse navy/cyan palette

import type { FormTemplate } from './formTemplates';
import {
  PDF_COLORS, setFill, setColor, setStroke,
  renderPageHeader, textBlock, addPageNumbers,
} from './pdf';

// ── Brand overrides for v60 navy/cyan palette ─────────────────────────────────
const NAVY  = [11,  30,  63]  as [number, number, number];
const CYAN  = [0,   194, 203] as [number, number, number];
const LIGHT_NAVY = [11, 30, 63] as [number, number, number];

// ── Section groups — mirrors FORM_STEP_SECTIONS in FormFiller.tsx ─────────────
// Used here to render divider headers in the PDF for each named section.
const PDF_SECTION_GROUPS: Record<string, Array<{ label: string; fieldIds: string[] }>> = {
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

function getSectionForField(formId: string, fieldId: string): string | null {
  const sections = PDF_SECTION_GROUPS[formId];
  if (!sections) return null;
  for (const s of sections) {
    if (s.fieldIds.includes(fieldId)) return s.label;
  }
  return null;
}

/**
 * v60 — Generates a high-quality structured PDF for the given form + answers.
 * Returns the raw base64 string (no `data:` prefix) so the caller can:
 *   - Upload to Supabase Storage
 *   - Trigger a browser download via triggerPdfDownload()
 *   - Pass to onComplete() for profile attachment
 */
export async function generateFormPdf(
  template: FormTemplate,
  formData: Record<string, string>,
  location: string,
): Promise<string> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const margin   = 18;
  const pageW    = doc.internal.pageSize.getWidth();
  const pageH    = doc.internal.pageSize.getHeight();
  const contentW = pageW - margin * 2;

  const brand   = 'RegPulse — Compliance Co-Pilot';
  const rightHdr = location ? `Prepared for: ${location}` : 'RegPulse Form Summary';

  const newPage = () => {
    doc.addPage();
    renderPageHeader(doc, pageW, margin, brand, rightHdr);
    return 30;
  };

  const tb = (text: string, x: number, y: number, maxW: number, lineH?: number) =>
    textBlock(doc, newPage, text, x, y, maxW, lineH);

  // ── Page 1 Header ─────────────────────────────────────────────────────────────
  renderPageHeader(doc, pageW, margin, brand, rightHdr);
  let y = 30;

  // ── Form title + badge ────────────────────────────────────────────────────────
  setColor(doc, NAVY);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(template.name, contentW - 35) as string[];
  doc.text(titleLines, margin, y);

  if (template.officialFormNumber) {
    const badgeX = pageW - margin - 30;
    setFill(doc, NAVY);
    doc.roundedRect(badgeX, y - 5, 30, 8, 1.5, 1.5, 'F');
    setColor(doc, [255, 255, 255]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(template.officialFormNumber, badgeX + 15, y, { align: 'center' });
  }

  y += titleLines.length * 8 + 1;

  // ── Subtitle metadata row ─────────────────────────────────────────────────────
  setColor(doc, PDF_COLORS.mutedText);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Government Filing Fee: ${template.fee}   ·   Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, margin, y);
  y += 5;

  const descLines = doc.splitTextToSize(template.description, contentW) as string[];
  setColor(doc, PDF_COLORS.mutedText);
  doc.setFontSize(8.5);
  y = tb(descLines.join(' '), margin, y, contentW, 5);
  y += 3;

  // ── Divider ───────────────────────────────────────────────────────────────────
  setStroke(doc, CYAN);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  doc.setLineWidth(0.2);
  y += 8;

  // ── "Prepared by RegPulse" stamp block ────────────────────────────────────────
  setFill(doc, [11, 30, 63] as [number, number, number]);
  doc.roundedRect(margin, y, contentW, 14, 2, 2, 'F');
  setColor(doc, [255, 255, 255]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Completed with RegPulse AI Form Filler', margin + 5, y + 6);
  setColor(doc, CYAN);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Review all answers before submitting. Verify accuracy with official agency sources.', margin + 5, y + 11);
  y += 20;

  // ── Fields — grouped by section ───────────────────────────────────────────────
  let lastSection: string | null = null;

  for (const field of template.fields) {
    const value = formData[field.id];
    if (!value && !field.required) continue; // skip empty optional fields

    const section = getSectionForField(template.id, field.id);

    // Section header divider
    if (section && section !== lastSection) {
      if (y > 240) y = newPage();
      y += 2;
      setFill(doc, [11, 30, 63] as [number, number, number]);
      doc.rect(margin, y, contentW, 6, 'F');
      setColor(doc, [255, 255, 255]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(section.toUpperCase(), margin + 3, y + 4.2);
      y += 9;
      lastSection = section;
    }

    if (y > 248) y = newPage();

    // Field label row
    setColor(doc, LIGHT_NAVY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(field.label, margin + 2, y);
    if (field.officialFieldName) {
      setColor(doc, PDF_COLORS.faintGray);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'italic');
      doc.text(`(${field.officialFieldName})`, margin + 2 + doc.getTextWidth(field.label) + 2, y);
    }
    y += 4;

    // Value box
    const displayValue = value || '— not provided —';
    const valLines = doc.splitTextToSize(displayValue, contentW - 8) as string[];
    const boxH = Math.max(7, valLines.length * 5 + 4);

    if (y + boxH > 265) y = newPage();

    setFill(doc, value ? [248, 250, 252] as [number, number, number] : [255, 255, 255]);
    setStroke(doc, value ? [203, 213, 225] as [number, number, number] : [226, 232, 240] as [number, number, number]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, boxH, 1, 1, 'FD');

    if (value) {
      setColor(doc, PDF_COLORS.darkText);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
    } else {
      setColor(doc, PDF_COLORS.faintGray);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
    }
    doc.text(valLines, margin + 3, y + 5);
    y += boxH + 4;
  }

  y += 4;
  if (y > 240) y = newPage();
  setStroke(doc, [203, 213, 225] as [number, number, number]);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Required Documents ────────────────────────────────────────────────────────
  if (template.requiredDocs.length > 0) {
    if (y > 230) y = newPage();
    setFill(doc, NAVY);
    doc.rect(margin, y, contentW, 6, 'F');
    setColor(doc, [255, 255, 255]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('REQUIRED SUPPORTING DOCUMENTS', margin + 3, y + 4.2);
    y += 10;

    for (const reqDoc of template.requiredDocs) {
      if (y > 265) y = newPage();
      setColor(doc, CYAN);
      doc.circle(margin + 2, y - 1, 0.8, 'F');
      setColor(doc, PDF_COLORS.darkText);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      y = tb(reqDoc, margin + 6, y, contentW - 8, 5);
      y += 2;
    }
    y += 4;
  }

  // ── Submission Instructions ───────────────────────────────────────────────────
  if (y > 230) y = newPage();
  setFill(doc, NAVY);
  doc.rect(margin, y, contentW, 6, 'F');
  setColor(doc, [255, 255, 255]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBMISSION INSTRUCTIONS', margin + 3, y + 4.2);
  y += 10;

  setColor(doc, PDF_COLORS.darkText);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  y = tb(template.submitInstructions, margin, y, contentW, 5);
  y += 4;

  const portalUrl = template.submitPortalUrl ?? template.submitUrl;
  if (portalUrl && !portalUrl.includes('sba.gov')) {
    setColor(doc, NAVY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Official Portal: ', margin, y);
    setColor(doc, [0, 100, 200]);
    doc.setFont('helvetica', 'normal');
    y = tb(portalUrl, margin + 28, y, contentW - 30, 5);
    y += 2;
  }
  y += 6;

  // ── Disclaimer ────────────────────────────────────────────────────────────────
  if (y > 248) y = newPage();
  const disclaimerH = 20;
  setFill(doc, [241, 245, 249] as [number, number, number]);
  setStroke(doc, [203, 213, 225] as [number, number, number]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, disclaimerH, 2, 2, 'FD');

  setColor(doc, PDF_COLORS.faintGray);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  const discText =
    'This document was generated by RegPulse as a completion aid and reference only. ' +
    'It does not constitute legal, tax, or professional advice. Always verify all information ' +
    'with official government sources and consult a licensed attorney or compliance professional ' +
    'before submitting any government filing.';
  const discLines = doc.splitTextToSize(discText, contentW - 8) as string[];
  doc.text(discLines, margin + 4, y + 5);

  // ── Page numbers ──────────────────────────────────────────────────────────────
  addPageNumbers(
    doc,
    pageW,
    margin,
    'RegPulse — Not legal advice. Verify with official government sources.',
  );

  // v60: return base64 string (no data: prefix) instead of saving directly.
  // The caller (FormFiller or handleFormComplete) owns the download + upload.
  const dataUri = doc.output('datauristring') as string;
  return dataUri.split(',')[1] ?? '';
}

/**
 * Convenience wrapper: generates the PDF and triggers a browser download.
 * Keeps backward compatibility for callers that just want the file saved locally.
 */
export async function generateAndDownloadFormPdf(
  template: FormTemplate,
  formData: Record<string, string>,
  location: string,
): Promise<string> {
  const base64 = await generateFormPdf(template, formData, location);

  // Trigger download in the browser
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_regpulse.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  return base64;
}
