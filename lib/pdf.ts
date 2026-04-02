/**
 * Shared PDF layout primitives for RegBot.
 * Used by generateFormPdf.ts and generateCompliancePacket.ts to eliminate
 * duplicated jsPDF boilerplate, color constants, and common layout helpers.
 */
import type { jsPDF } from 'jspdf';

// ── Brand color palette (RGB) ─────────────────────────────────────────────────

export const PDF_COLORS = {
  brandBlue:  [37,  99,  235] as const,
  darkText:   [15,  23,  42]  as const,
  mutedText:  [71,  85,  105] as const,
  labelText:  [51,  65,  85]  as const,
  borderGray: [203, 213, 225] as const,
  bgLight:    [241, 245, 249] as const,
  bgBlue:     [239, 246, 255] as const,
  faintGray:  [100, 116, 139] as const,
  footerGray: [148, 163, 184] as const,
  white:      [255, 255, 255] as const,
} as const;

type RGB = readonly [number, number, number];

export const setFill   = (doc: jsPDF, [r, g, b]: RGB) => doc.setFillColor(r, g, b);
export const setColor  = (doc: jsPDF, [r, g, b]: RGB) => doc.setTextColor(r, g, b);
export const setStroke = (doc: jsPDF, [r, g, b]: RGB) => doc.setDrawColor(r, g, b);

// ── Header stripe ─────────────────────────────────────────────────────────────

/**
 * Renders the blue header stripe common to all RegBot PDFs.
 * Pass `title` to render a second row (used in multi-section compliance packets).
 */
export function renderPageHeader(
  doc: jsPDF,
  pageW: number,
  margin: number,
  brandName: string,
  rightText: string,
  title?: string,
  subtitle?: string,
) {
  const headerH = title ? 20 : 18;
  setFill(doc, PDF_COLORS.brandBlue);
  doc.rect(0, 0, pageW, headerH, 'F');
  setColor(doc, PDF_COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(brandName, margin, 9);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(rightText, pageW - margin, 9, { align: 'right' });
  if (title) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 16);
  }
  if (subtitle) {
    doc.text(subtitle, pageW - margin, 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  }
}

// ── Auto-wrapping text block with page-break ──────────────────────────────────

/**
 * Renders text that wraps to fit `maxW`. Adds a new page via `onNewPage` if
 * the block would overflow below y=270. Returns the new y position.
 */
export function textBlock(
  doc: jsPDF,
  onNewPage: () => number,  // called when a page break is needed; returns the y to continue from
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH = 5,
): number {
  const lines = doc.splitTextToSize(text, maxW) as string[];
  if (y + lines.length * lineH > 270) {
    y = onNewPage();
  }
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

// ── Page number footer ────────────────────────────────────────────────────────

export function addPageNumbers(
  doc: jsPDF,
  pageW: number,
  margin: number,
  footerLeft: string,
) {
  const count = doc.getNumberOfPages();
  for (let i = 1; i <= count; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    setColor(doc, PDF_COLORS.footerGray);
    doc.text(footerLeft, margin, 295);
    doc.text(`Page ${i} of ${count}`, pageW - margin, 295, { align: 'right' });
  }
}
