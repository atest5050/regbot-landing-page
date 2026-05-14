// v285: explicit CORS for WKWebView cross-origin fetch.
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';
import { verifyPro } from '@/lib/supabase/verify-pro';
import { createHash } from 'crypto';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const FREE_MONTHLY_LIMIT = 5;

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  // ── Auth gate: Pro required for authenticated users; IP rate-limit for guests ─
  const proCheck = await verifyPro(req);

  if (proCheck) {
    // Authenticated user — must be Pro
    if (!proCheck.isPro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403, headers: CORS });
    }
  } else {
    // Guest — enforce monthly limit via IP hash
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';
    const salt = process.env.IP_HASH_SALT ?? 'rp-default-salt';
    const ipHash = createHash('sha256').update(ip + salt).digest('hex');

    const admin = adminClient();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await admin
      .from('anon_form_usage')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', startOfMonth.toISOString());

    if ((count ?? 0) >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        { error: 'Monthly free limit reached. Upgrade to Pro for unlimited form completions.' },
        { status: 429, headers: CORS },
      );
    }

    await admin.from('anon_form_usage').insert({ ip_hash: ipHash });
  }

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
