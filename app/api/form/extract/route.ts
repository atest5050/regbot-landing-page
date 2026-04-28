// v285: explicit CORS for WKWebView cross-origin fetch.
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList } from 'pdf-lib';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export interface ExtractedPdfField {
  name: string;
  label: string;
  type: 'text' | 'checkbox' | 'select';
  options?: string[];
}

/** Converts a raw AcroForm field name to a human-readable label.
 *  e.g. "topmostSubform[0].Page1[0].BusinessName[0]" → "Business Name"
 *       "topmostSubform[0].Page1[0].f1_01[0]"         → "" (generic, caller uses "Field N")
 */
function cleanFieldLabel(raw: string): string {
  const segments = raw.split('.');
  const last = segments[segments.length - 1];
  const withoutIndex = last.replace(/\[\d+\]$/, '');

  // Generic field IDs (f1_01, TextField3, etc.) — return empty so caller can use positional label
  if (/^[ft]\d/i.test(withoutIndex) || /^TextField/i.test(withoutIndex) || /^Field\d/i.test(withoutIndex)) {
    return '';
  }

  // Split camelCase and underscores → words
  return withoutIndex
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export async function POST(req: NextRequest) {
  let body: { pdfUrl?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { pdfUrl } = body;
  if (!pdfUrl || typeof pdfUrl !== 'string' || !pdfUrl.startsWith('http')) {
    return NextResponse.json({ error: 'pdfUrl required' }, { status: 400 });
  }

  // Download the PDF server-side (avoids browser CORS restrictions)
  let pdfBytes: ArrayBuffer;
  try {
    const response = await fetch(pdfUrl, {
      headers: { 'User-Agent': 'RegPulse/1.0 (form-completion-assistant)' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      return NextResponse.json({ canAutoFill: false, reason: 'download_failed' });
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      // Might be an HTML error page
      return NextResponse.json({ canAutoFill: false, reason: 'not_a_pdf' });
    }
    pdfBytes = await response.arrayBuffer();
  } catch {
    return NextResponse.json({ canAutoFill: false, reason: 'download_failed' });
  }

  // Parse and extract AcroForm fields
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  } catch {
    return NextResponse.json({ canAutoFill: false, reason: 'parse_failed' });
  }

  const form = pdfDoc.getForm();
  const rawFields = form.getFields();

  if (rawFields.length === 0) {
    return NextResponse.json({ canAutoFill: false, reason: 'no_fields' });
  }

  const fields: ExtractedPdfField[] = rawFields.map((field, i) => {
    const name = field.getName();
    const rawLabel = cleanFieldLabel(name);
    const label = rawLabel || `Field ${i + 1}`;

    if (field instanceof PDFCheckBox) {
      return { name, label, type: 'checkbox' } satisfies ExtractedPdfField;
    }

    if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
      let options: string[] = [];
      try {
        options = field instanceof PDFDropdown
          ? field.getOptions()
          : (field as PDFOptionList).getOptions();
      } catch { /* ignore */ }
      return { name, label, type: 'select', options } satisfies ExtractedPdfField;
    }

    // PDFTextField and anything else → text
    return { name, label, type: 'text' } satisfies ExtractedPdfField;
  });

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  return NextResponse.json({ canAutoFill: true, fields, pdfBase64 });
}
