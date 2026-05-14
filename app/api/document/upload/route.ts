// POST /api/document/upload
//
// iOS-native upload proxy: the WKWebView sandbox loses XPC connections after the file
// picker closes, which causes CapacitorHttp binary fetch (File/Blob body) to time out.
// This route accepts a base64-encoded file + metadata, decodes it server-side, and uploads
// to Supabase Storage using the service role key — no client-side binary fetch needed.
//
// Request body (JSON):
//   base64      — base64-encoded file content (no data-URL prefix)
//   mimeType    — MIME type string
//   storagePath — full Supabase Storage object path (userId/businessId/filename)
//
// Auth: Bearer {supabase_access_token} in Authorization header (validates the caller owns
//       the storagePath userId prefix)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB decoded

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the token and get the user id
  const adminSb = adminClient();
  const { data: { user }, error: userErr } = await adminSb.auth.getUser(accessToken);
  if (userErr || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let body: { base64?: string; mimeType?: string; storagePath?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { base64, mimeType, storagePath } = body;
  if (!base64 || !storagePath) {
    return NextResponse.json({ error: "Missing base64 or storagePath" }, { status: 400 });
  }

  // Enforce storagePath ownership: must start with the authenticated user's id
  if (!storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
  }

  const contentType = mimeType || "application/octet-stream";
  const { error: storageErr } = await adminSb.storage
    .from("business-documents")
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (storageErr) {
    console.error("[upload-doc] storage error:", storageErr.message);
    return NextResponse.json({ error: storageErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
