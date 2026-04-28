// vUnified-20260428-final-ship-lock-v284 — GPS fallback fix; CORS deployed. Cache bump v158/v145/v145.
// vUnified-20260414-national-expansion-v130 — fire-and-forget SW unregister. v7.
// vUnified-20260414-national-expansion-v129 — SW unregister before navigate. v6.
// vUnified-20260414-national-expansion-v128 — '/chat/index.html' added. v5.
// vUnified-20260414-national-expansion-v127 — navigation interception removed. v4.
// vUnified-20260414-national-expansion-v126 — '/chat/' trailing slash. v3.
// vUnified-20260414-national-expansion-v16 — Enhanced SW: cache-first for static assets,
//   network-first for pages, cache-then-network for PDF API responses.

const CACHE_NAME = 'regpulse-v158';
const STATIC_CACHE = 'regpulse-static-v145';
const PDF_CACHE = 'regpulse-pdf-v145';

// Static asset patterns to cache on install.
// '/chat/' with trailing slash matches Next.js trailingSlash:true static export output.
// '/chat/index.html' belt-and-suspenders for WKWebView bare-file-path resolution.
const PRECACHE_URLS = [
  '/',
  '/chat/',
  '/chat/index.html',
  '/manifest.webmanifest',
];

// ── Install: precache shell routes ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Precache failures are non-fatal — skip routes that 404 at install time
      })
    )
  );
});

// ── Activate: purge old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const keep = [CACHE_NAME, STATIC_CACHE, PDF_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))
      )
    ).then(() => clients.claim())
  );
});

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests; let cross-origin pass through
  if (url.origin !== self.location.origin) {
    return;
  }

  // PDF fill/extract API — cache successful responses for offline re-download
  if (url.pathname.startsWith('/api/form/fill') || url.pathname.startsWith('/api/form/extract')) {
    event.respondWith(networkFirstWithPdfCache(request));
    return;
  }

  // Static assets (_next/static) — cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigation requests — let fall through to native WKWebView handling.
  // vUnified-20260414-national-expansion-v127: DO NOT intercept navigation requests.
  // fetch() from SW context fails for capacitor:// custom URL scheme (Apple limitation —
  // WKURLSchemeHandler does not handle SW fetch() calls). Prior networkFirstWithFallback
  // would throw → catch → cache.match('/') → out/index.html → NativeApp loop.
  if (request.mode === 'navigate') {
    return; // pass through — WKWebView serves from bundle natively
  }

  // Everything else — pass through
});

// ── Strategy helpers ──────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Return offline page if available, otherwise a minimal 503
    const offlineFallback = await cache.match('/');
    return offlineFallback || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithPdfCache(request) {
  const cache = await caches.open(PDF_CACHE);
  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      // Cache POST responses by cloning with a GET-like cache key
      const cacheKey = new Request(request.url + '?' + Date.now(), { method: 'GET' });
      // Only cache if response is JSON (API response) — skip large binaries cached inline
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        cache.put(cacheKey, response.clone());
      }
    }
    return response;
  } catch {
    // Network failed — return most recent cached response for this endpoint if any
    const keys = await cache.keys();
    const match = keys.reverse().find((k) => k.url.startsWith(request.url));
    if (match) return cache.match(match);
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
}
