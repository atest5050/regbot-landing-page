// v285: explicit CORS for WKWebView cross-origin fetch.
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  let body: { pdfBase64?: unknown; fieldValues?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { pdfBase64, fieldValues } = body;
  if (
    typeof pdfBase64 !== 'string' ||
    !pdfBase64 ||
    typeof fieldValues !== 'object' ||
    fieldValues === null ||
    Array.isArray(fieldValues)
  ) {
    return NextResponse.json({ error: 'pdfBase64 and fieldValues required' }, { status: 400 });
  }

  const values = fieldValues as Record<string, string>;
  const pdfBytes = Buffer.from(pdfBase64, 'base64');

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  } catch {
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 422 });
  }

  const form = pdfDoc.getForm();

  for (const [fieldName, value] of Object.entries(values)) {
    if (!value) continue;
    try {
      const field = form.getField(fieldName);
      if (field instanceof PDFTextField) {
        field.setText(value);
      } else if (field instanceof PDFCheckBox) {
        const isChecked = value.toLowerCase() === 'yes' || value === 'true' || value === '1';
        if (isChecked) field.check();
        else field.uncheck();
      }
      // PDFDropdown / PDFOptionList / PDFRadioGroup — skip (complex, leave blank)
    } catch {
      // Field not found or read-only — skip silently
    }
  }

  let filledBytes: Uint8Array;
  try {
    filledBytes = await pdfDoc.save();
  } catch {
    return NextResponse.json({ error: 'Failed to save filled PDF' }, { status: 500 });
  }

  const filledBase64 = Buffer.from(filledBytes).toString('base64');
  return NextResponse.json({ filledPdfBase64: filledBase64 });
}
