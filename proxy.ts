// vUnified-20260428-final-ship-lock-v284: CORS proxy for all /api/* routes.
//
// WHY THIS EXISTS:
//   The Capacitor iOS app (WKWebView, origin: RegPulse://app) calls the live Vercel
//   deployment at https://regbot-landing-page.vercel.app/api/chat (and other API routes)
//   via the NEXT_PUBLIC_API_BASE_URL env var. WKWebView enforces standard browser CORS
//   policy — without these response headers the browser blocks every cross-origin
//   response and the catch block fires ("Sorry, I had trouble responding").
//
//   This middleware runs as a Vercel Edge Function and adds CORS headers to:
//     - All OPTIONS preflight requests (returns 204 immediately)
//     - All /api/* responses (passes through to the real route handler)
//
//   The next.config.ts headers() config is belt-and-suspenders; this middleware handles
//   the preflight case correctly since headers() does not intercept OPTIONS requests.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age':       '86400',
};

export function proxy(request: NextRequest) {
  // Handle CORS preflight — return 204 immediately so the real route is not invoked.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // All other requests — forward to route handler and inject CORS headers into response.
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  // Only intercept API routes — leave all other pages untouched.
  matcher: '/api/:path*',
};
