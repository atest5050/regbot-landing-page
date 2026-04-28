#!/usr/bin/env node
/**
 * cap-build.js — Capacitor static export build wrapper
 *
 * Problem: Next.js 16 Turbopack requires ALL route segment configs (dynamic, runtime,
 * revalidate) to be static string literals. `force-dynamic` is explicitly blocked in
 * `output: 'export'` mode. Computed expressions are rejected by AST-level static analysis.
 *
 * Solution: Before building, replace every app/api route with a force-static stub that
 * returns 503. After the build (success or failure), restore the originals. The Capacitor
 * app never calls these routes at runtime — it uses NEXT_PUBLIC_API_BASE_URL instead.
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT     = path.resolve(__dirname, '..');
const API_DIR  = path.join(ROOT, 'app', 'api');
const STUB_SRC = path.join(__dirname, 'route-stub.ts');

// ── 1. Find all route.ts files under app/api/ ────────────────────────────────
function findRoutes(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRoutes(full));
    } else if (entry.name === 'route.ts') {
      results.push(full);
    }
  }
  return results;
}

const routes   = findRoutes(API_DIR);
const stub     = fs.readFileSync(STUB_SRC, 'utf8');
const backups  = new Map(); // file path → original content

// ── 2. Swap originals → stub ─────────────────────────────────────────────────
console.log(`[cap-build] Stubbing ${routes.length} API route(s) for static export…`);
for (const file of routes) {
  backups.set(file, fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, stub, 'utf8');
}

// ── 3. Build + sync ──────────────────────────────────────────────────────────
// vUnified-20260414-national-expansion-v104 — Removed out/index.html redirect replacement.
//
// ROOT CAUSE OF BLANK SCREEN (v97–v103): This script was replacing out/index.html with a
// bare window.location.replace('/chat/') redirect after every build. This discarded the
// carefully crafted NativeGate SSG HTML (AppSplashOverlay with inline styles, z-400) that
// was in out/index.html from the Next.js build. The bare redirect caused:
//   1. WKWebView loads root → bare HTML (no AppSplashOverlay, no content)
//   2. Script fires immediately → window.location.replace('/chat/')
//   3. WKWebView background (#0B1E3F) shows for 200–500ms during navigation
//   4. /chat/ loads → AppSplashOverlay finally appears
// Steps 2–4 were the "blank dark blue screen" on physical hardware.
//
// v104 FIX: Let out/index.html be the real Next.js SSG output (NativeGate HTML).
// With IS_CAPACITOR_BUILD=true (CAPACITOR_BUILD=true → next.config.ts sets
// NEXT_PUBLIC_IS_CAPACITOR='true' → IS_CAPACITOR_BUILD=true in app/page.tsx),
// out/index.html now contains:
//   - AppSplashOverlay (position:fixed, z-400, inline styles) → visible from byte 0
//   - Dark navy base layer (z-1) → fills any sub-pixel gap
//   - NO LandingPage content (IS_CAPACITOR_BUILD=true skips it)
//   - Layer 1 inline script: returning users → /chat/ immediately; first-time users →
//     stay on root, NativeGate shows animated splash + OnboardingFlow
//
// Web deployment (Vercel) is NOT affected — Vercel serves from .next/ (SSR).

let buildOk = false;
try {
  console.log('[cap-build] Running: CAPACITOR_BUILD=true next build');
  execSync('CAPACITOR_BUILD=true npx next build', {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, CAPACITOR_BUILD: 'true' },
  });

  // vUnified-20260414-national-expansion-v104 — No out/index.html replacement.
  // out/index.html now contains the NativeGate SSG HTML with AppSplashOverlay from byte 0.
  console.log('[cap-build] out/index.html preserved — NativeGate SSG HTML with AppSplashOverlay');

  console.log('[cap-build] Running: npx cap sync');
  execSync('npx cap sync', { cwd: ROOT, stdio: 'inherit' });

  buildOk = true;
} finally {
  // ── 4. Always restore originals ───────────────────────────────────────────
  console.log('[cap-build] Restoring original route files…');
  for (const [file, original] of backups) {
    fs.writeFileSync(file, original, 'utf8');
  }
  if (!buildOk) {
    console.error('[cap-build] Build FAILED. Originals restored. See errors above.');
    process.exit(1);
  } else {
    console.log('[cap-build] Done. Originals restored. Static export + cap sync succeeded.');
  }
}
