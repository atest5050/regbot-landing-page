// Static stub — temporarily replaces app/api/*/route.ts during Capacitor builds.
// scripts/cap-build.js swaps this in before `next build` (output:'export') and
// restores the originals in a finally block. The Capacitor app never calls these
// stubs at runtime — it uses NEXT_PUBLIC_API_BASE_URL (the live Vercel deployment).
export const dynamic = 'force-static';

const msg = { error: 'API routes are server-side only. Use NEXT_PUBLIC_API_BASE_URL.' };
export async function GET()    { return Response.json(msg, { status: 503 }); }
export async function POST()   { return Response.json(msg, { status: 503 }); }
export async function PUT()    { return Response.json(msg, { status: 503 }); }
export async function PATCH()  { return Response.json(msg, { status: 503 }); }
export async function DELETE() { return Response.json(msg, { status: 503 }); }
