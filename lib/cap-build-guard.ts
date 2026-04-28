// vUnified-20260414-national-expansion-v52 — Capacitor static export build guard.
//
// In output:'export' (Capacitor/cap build) mode, Next.js calls GET handlers once at build
// time so it can pre-render them as static files. These API routes are server-side only —
// the Capacitor app calls NEXT_PUBLIC_API_BASE_URL (the live Vercel deployment) for all API
// requests and never uses the static copies of these routes.
//
// Usage in each GET handler that has dynamic/auth behaviour:
//
//   import { capBuildGuard } from '@/lib/cap-build-guard';
//   export async function GET(req: NextRequest) {
//     const g = capBuildGuard();  if (g) return g;
//     // ... real handler code
//   }
//
// On Vercel (CAPACITOR_BUILD is unset): capBuildGuard() returns null → real handler runs.
// During cap build (CAPACITOR_BUILD=true):  returns 503 immediately → no auth/DB calls.

export function capBuildGuard(): Response | null {
  if (process.env.CAPACITOR_BUILD === 'true') {
    return Response.json(
      {
        error: 'This API route is not served from the Capacitor static bundle. '
             + 'Set NEXT_PUBLIC_API_BASE_URL to your Vercel deployment URL.',
        capacitorBuild: true,
      },
      { status: 503 }
    );
  }
  return null;
}
