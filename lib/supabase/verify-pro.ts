/**
 * Server-side Pro access verification.
 *
 * Works for both web (cookie-based session) and Capacitor iOS (Bearer token).
 * Returns the user and is_pro flag, or null if the caller is unauthenticated / not Pro.
 */
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export interface ProCheckResult {
  userId: string;
  isPro: boolean;
}

export interface AuthResult {
  userId: string;
}

/**
 * Verify that the request comes from an authenticated user (Pro or not).
 *
 * Auth resolution order:
 *   1. Cookie-based session (Next.js web).
 *   2. `Authorization: Bearer <token>` header (Capacitor iOS).
 *
 * Returns null if the caller is unauthenticated.
 */
export async function verifyAuth(req: NextRequest): Promise<AuthResult | null> {
  const admin = adminClient();

  // ── 1. Try cookie-based session (web) ──────────────────────────────────────
  try {
    const cookieClient = await createServerClient();
    const { data: { user: cookieUser } } = await cookieClient.auth.getUser();
    if (cookieUser) return { userId: cookieUser.id };
  } catch (_) {}

  // ── 2. Try Bearer token (Capacitor iOS) ───────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const { data: { user: tokenUser }, error } = await admin.auth.getUser(token);
    if (error || !tokenUser) return null;
    return { userId: tokenUser.id };
  } catch (_) {
    return null;
  }
}

/**
 * Verify that the request comes from an authenticated Pro subscriber.
 *
 * Auth resolution order:
 *   1. Cookie-based session (Next.js web — `createClient()` reads cookies).
 *   2. `Authorization: Bearer <token>` header (Capacitor iOS — no cookie jar).
 *
 * Returns null if the caller is unauthenticated or not a Pro subscriber.
 */
export async function verifyPro(req: NextRequest): Promise<ProCheckResult | null> {
  const admin = adminClient();

  // ── 1. Try cookie-based session (web) ──────────────────────────────────────
  try {
    const cookieClient = await createServerClient();
    const { data: { user: cookieUser } } = await cookieClient.auth.getUser();
    if (cookieUser) {
      const { data: profile } = await admin
        .from('profiles')
        .select('is_pro')
        .eq('id', cookieUser.id)
        .single();
      return { userId: cookieUser.id, isPro: profile?.is_pro === true };
    }
  } catch (_) {}

  // ── 2. Try Bearer token (Capacitor iOS) ───────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const { data: { user: tokenUser }, error } = await admin.auth.getUser(token);
    if (error || !tokenUser) return null;
    const { data: profile } = await admin
      .from('profiles')
      .select('is_pro')
      .eq('id', tokenUser.id)
      .single();
    return { userId: tokenUser.id, isPro: profile?.is_pro === true };
  } catch (_) {
    return null;
  }
}
