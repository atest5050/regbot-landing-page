// POST /api/iap/verify
//
// Verifies a StoreKit 2 signed transaction (JWS) from the native iOS layer,
// updates is_pro in the caller's profile, and records the transaction.
//
// Request body:
//   jwsRepresentation  — raw JWS string from StoreKit 2 (optional if restoring)
//   transactionId      — StoreKit transaction ID
//   productId          — IAP product ID (must be in ALLOWED_PRODUCTS)
//
// The JWS payload is decoded and its bundleId / productId are validated against
// known values. The on-device StoreKit 2 .verified status already provides
// cryptographic verification; we add business-logic validation here.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '@/lib/supabase/verify-pro';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const BUNDLE_ID       = 'com.regpulse.app';
const ALLOWED_PRODUCTS = new Set(['com.regpulse.app.pro_monthly']);

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

interface JWSPayload {
  bundleId?:              string;
  productId?:             string;
  transactionId?:         string;
  originalTransactionId?: string;
  purchaseDate?:          number;  // ms since epoch
  expiresDate?:           number;  // ms since epoch
  revocationDate?:        number;
  type?:                  string;
  environment?:           string;
}

function decodeJWSPayload(jws: string): JWSPayload | null {
  try {
    const parts = jws.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payloadJson) as JWSPayload;
  } catch {
    return null;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const caller = await verifyAuth(req);
  if (!caller) {
    return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401, headers: CORS });
  }

  let body: {
    jwsRepresentation?: string;
    transactionId?:     string;
    productId?:         string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400, headers: CORS });
  }

  const { jwsRepresentation, transactionId, productId: bodyProductId } = body;

  // ── Decode and validate the JWS payload ────────────────────────────────────
  let payload: JWSPayload = {};
  if (jwsRepresentation) {
    const decoded = decodeJWSPayload(jwsRepresentation);
    if (!decoded) {
      return NextResponse.json({ ok: false, error: 'Invalid JWS format' }, { status: 400, headers: CORS });
    }
    payload = decoded;

    if (payload.bundleId && payload.bundleId !== BUNDLE_ID) {
      return NextResponse.json({ ok: false, error: 'Bundle ID mismatch' }, { status: 400, headers: CORS });
    }
  }

  const effectiveProductId = payload.productId ?? bodyProductId;
  if (!effectiveProductId || !ALLOWED_PRODUCTS.has(effectiveProductId)) {
    return NextResponse.json({ ok: false, error: 'Unknown product ID' }, { status: 400, headers: CORS });
  }

  const effectiveTransactionId = payload.transactionId ?? payload.originalTransactionId ?? transactionId;
  if (!effectiveTransactionId) {
    return NextResponse.json({ ok: false, error: 'transactionId required' }, { status: 400, headers: CORS });
  }

  // ── Check subscription is not expired or revoked ───────────────────────────
  const now = Date.now();
  if (payload.revocationDate) {
    return NextResponse.json({ ok: false, error: 'Transaction revoked' }, { status: 402, headers: CORS });
  }
  const isActive = !payload.expiresDate || payload.expiresDate > now;

  const admin = adminClient();

  // ── Upsert the transaction record ──────────────────────────────────────────
  await admin.from('iap_transactions').upsert(
    {
      user_id:                caller.userId,
      transaction_id:         effectiveTransactionId,
      original_transaction_id: payload.originalTransactionId ?? effectiveTransactionId,
      product_id:             effectiveProductId,
      expires_date:           payload.expiresDate ? new Date(payload.expiresDate).toISOString() : null,
      jws_representation:     jwsRepresentation ?? null,
    },
    { onConflict: 'original_transaction_id' },
  );

  // ── Update is_pro ───────────────────────────────────────────────────────────
  await admin
    .from('profiles')
    .update({ is_pro: isActive })
    .eq('id', caller.userId);

  return NextResponse.json({ ok: true, isPro: isActive }, { headers: CORS });
}
