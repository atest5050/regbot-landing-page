// POST /api/iap/notifications
//
// Receives Apple App Store Server Notifications (V2).
// Apple sends a signed JWS payload when subscription events occur:
//   DID_RENEW, EXPIRED, DID_FAIL_TO_RENEW, REVOKE, REFUND, etc.
//
// Configure in App Store Connect → App → App Store Server Notifications:
//   Production URL: https://www.reg-bot.ai/api/iap/notifications
//   Sandbox URL:    https://www.reg-bot.ai/api/iap/notifications
//
// The payload is a JSON object with a `signedPayload` JWS field.
// We decode it (trusting Apple's signature on the notification), extract
// the originalTransactionId, look up the linked user, and update is_pro.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

interface NotificationPayload {
  notificationType?: string;
  subtype?:          string;
  data?: {
    signedTransactionInfo?: string;
    signedRenewalInfo?:     string;
    environment?:           string;
    appAppleId?:            number;
    bundleId?:              string;
  };
}

interface TransactionInfo {
  originalTransactionId?: string;
  transactionId?:         string;
  productId?:             string;
  expiresDate?:           number;
  revocationDate?:        number;
  bundleId?:              string;
  appAccountToken?:       string;
}

function decodeJWSPayload<T>(jws: string): T | null {
  try {
    const parts = jws.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

// Notification types that indicate an active subscription
const ACTIVE_TYPES   = new Set(['SUBSCRIBED', 'DID_RENEW', 'OFFER_REDEEMED']);
// Notification types that indicate the subscription ended
const INACTIVE_TYPES = new Set(['EXPIRED', 'REVOKE', 'REFUND', 'DID_FAIL_TO_RENEW']);

export async function POST(req: NextRequest) {
  let body: { signedPayload?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body.signedPayload) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const notification = decodeJWSPayload<NotificationPayload>(body.signedPayload);
  if (!notification) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const notifType = notification.notificationType ?? '';
  const txJWS     = notification.data?.signedTransactionInfo;
  if (!txJWS) {
    // Acknowledge but nothing to do
    return NextResponse.json({ ok: true });
  }

  const txInfo = decodeJWSPayload<TransactionInfo>(txJWS);
  if (!txInfo?.originalTransactionId) {
    return NextResponse.json({ ok: true });
  }

  const admin = adminClient();

  // Look up the user who made the original purchase
  const { data: txRow } = await admin
    .from('iap_transactions')
    .select('user_id')
    .eq('original_transaction_id', txInfo.originalTransactionId)
    .single();

  // If we have no record, try matching via appAccountToken (Supabase user UUID)
  let userId: string | null = txRow?.user_id ?? null;
  if (!userId && txInfo.appAccountToken) {
    userId = txInfo.appAccountToken;
  }
  if (!userId) {
    return NextResponse.json({ ok: true });
  }

  const now = Date.now();

  // ── Update iap_transactions record ─────────────────────────────────────────
  await admin.from('iap_transactions').upsert(
    {
      user_id:                userId,
      transaction_id:         txInfo.transactionId ?? txInfo.originalTransactionId,
      original_transaction_id: txInfo.originalTransactionId,
      product_id:             txInfo.productId ?? 'com.regpulse.app.pro_monthly',
      expires_date:           txInfo.expiresDate    ? new Date(txInfo.expiresDate).toISOString()    : null,
      revocation_date:        txInfo.revocationDate ? new Date(txInfo.revocationDate).toISOString() : null,
      notification_type:      notifType,
    },
    { onConflict: 'original_transaction_id' },
  );

  // ── Update is_pro based on notification type ───────────────────────────────
  if (ACTIVE_TYPES.has(notifType)) {
    await admin.from('profiles').update({ is_pro: true }).eq('id', userId);
  } else if (INACTIVE_TYPES.has(notifType)) {
    // Only set false if the subscription is genuinely expired/revoked
    const expired = !txInfo.expiresDate || txInfo.expiresDate <= now;
    if (expired) {
      await admin.from('profiles').update({ is_pro: false }).eq('id', userId);
    }
  }

  return NextResponse.json({ ok: true });
}
