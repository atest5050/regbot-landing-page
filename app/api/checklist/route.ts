// v285: explicit CORS for WKWebView cross-origin fetch.
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toDb, fromDb } from "@/lib/checklist";
import type { DbChecklistItem } from "@/lib/checklist";

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// ── Helper: get authenticated user or return 401 ──────────────────────────────
async function getAuthedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase: null, user: null };
  return { supabase, user };
}

// ── GET /api/checklist ─────────────────────────────────────────────────────────
// Returns all checklist items for the authenticated user, ordered by created_at.
export async function GET() {
  const { supabase, user } = await getAuthedClient();
  if (!supabase || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("checklist_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("checklist GET error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ items: (data as DbChecklistItem[]).map(fromDb) });
}

// ── POST /api/checklist ────────────────────────────────────────────────────────
// Creates a new checklist item. user_id is injected server-side (never trusted from client).
export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthedClient();
  if (!supabase || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const dbPayload = {
    user_id: user.id,      // always set server-side
    ...toDb(body),
  };

  const { data, error } = await supabase
    .from("checklist_items")
    .insert(dbPayload)
    .select()
    .single();

  if (error) {
    console.error("checklist POST error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ item: fromDb(data as DbChecklistItem) }, { status: 201 });
}

// ── PATCH /api/checklist?id=<uuid> ────────────────────────────────────────────
// Updates specific fields on a checklist item. RLS ensures only the owner can update.
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await getAuthedClient();
  if (!supabase || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json();
  const dbPayload = toDb(body);

  const { data, error } = await supabase
    .from("checklist_items")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("checklist PATCH error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ item: fromDb(data as DbChecklistItem) });
}

// ── DELETE /api/checklist?id=<uuid> ───────────────────────────────────────────
// Deletes a checklist item. RLS ensures only the owner can delete.
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await getAuthedClient();
  if (!supabase || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("checklist DELETE error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
