// vUnified-20260414-national-expansion-v15 — Capacitor static export support added.
// When CAPACITOR_BUILD=true (set by "build:cap" script), Next.js switches to
// `output: 'export'` which generates the static `out/` directory that Capacitor
// packages into the iOS/Android native wrapper.
//
// Standard web build (Vercel / `next build`) — unchanged: SSR + API routes intact.
// Capacitor build (`npm run build:cap`) — static export: API calls must use
//   NEXT_PUBLIC_API_BASE_URL (set to the deployed Vercel URL) since API routes
//   are not included in a static export.
//
// images.unoptimized: true is required for Next.js static export (no image server).
// trailingSlash: true improves compatibility with native WebView file:// loading.

import type { NextConfig } from 'next';

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  // Static export for Capacitor builds; server-rendered for all other deployments.
  ...(isCapacitorBuild
    ? {
        output:        'export',
        trailingSlash: true,        // native WebViews prefer index.html in each directory
        images: { unoptimized: true }, // required: no image optimization server in static export
      }
    : {}),

  // vUnified-20260428-final-ship-lock: CORS headers for all /api/* routes.
  // Required so the Capacitor app (origin: capacitor://app) can call the Vercel-deployed
  // API. Without these headers, WKWebView blocks cross-origin fetch responses.
  // Only applied on server builds (not static export — Capacitor has no API server).
  ...(!isCapacitorBuild
    ? {
        headers: async () => [
          {
            source: '/api/:path*',
            headers: [
              { key: 'Access-Control-Allow-Origin',  value: '*' },
              { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
              { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
            ],
          },
        ],
      }
    : {}),

  // vUnified-20260414-national-expansion-v15: expose build mode to the client bundle
  // so API helpers can switch between relative (web) and absolute (native) URLs.
  env: {
    NEXT_PUBLIC_IS_CAPACITOR: isCapacitorBuild ? 'true' : 'false',
  },
};

export default nextConfig;
