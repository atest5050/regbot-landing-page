// Supabase Edge Function: send-renewal-reminders
//
// Scheduled daily at 09:00 UTC via pg_cron (see setup-cron.sql).
//
// Algorithm:
//   1. Query every business row, expanding the JSONB checklist.
//   2. For each checklist item with a renewalDate, compute daysLeft.
//   3. If daysLeft is exactly 60, 30, 7, or 1 — this is a reminder milestone.
//   4. Check renewal_reminder_log to skip already-sent reminders.
//   5. Look up the user's email (from auth.users) and notification prefs.
//   6. Send email via Resend and/or SMS via Twilio based on prefs.
//   7. Insert a row into renewal_reminder_log on success/failure.
//
// Environment variables (set in Supabase Dashboard → Functions → Secrets):
//   SUPABASE_URL              — Project URL (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY — Service role key (auto-injected)
//   RESEND_API_KEY            — Resend API key for email sending
//   TWILIO_ACCOUNT_SID        — Twilio account SID for SMS
//   TWILIO_AUTH_TOKEN         — Twilio auth token for SMS
//   TWILIO_FROM_NUMBER        — E.164 Twilio sender number, e.g. "+18005551234"
//   APP_URL                   — Public app URL, e.g. "https://app.regpulse.com"
//   FROM_EMAIL                — Sender address, e.g. "reminders@regpulse.com"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildRenewalEmail, buildRenewalSms } from "./email-template.ts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  text: string;
  formId?: string;
  status: string;
  renewalDate?: string;
}

interface NotificationPrefs {
  emailEnabled: boolean;
  smsEnabled: boolean;
  phone?: string;
}

interface BusinessRow {
  id: string;
  user_id: string;
  name: string;
  location: string;
  checklist: ChecklistItem[];
  notification_prefs: NotificationPrefs | null;
}

interface ProfileRow {
  id: string;
  phone: string | null;
}

/** Days-before milestones that trigger reminders */
const REMINDER_MILESTONES = [60, 30, 7, 1] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(isoDate: string): number {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00Z");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function envRequired(key: string): string {
  const val = Deno.env.get(key);
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

// ── Email sender (Resend) ─────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  apiKey: string;
  fromEmail: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `RegPulse <${opts.fromEmail}>`,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── SMS sender (Twilio) ───────────────────────────────────────────────────────

async function sendSms(opts: {
  to: string;
  body: string;
  accountSid: string;
  authToken: string;
  from: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${opts.accountSid}/Messages.json`;
    const params = new URLSearchParams({
      To: opts.to,
      From: opts.from,
      Body: opts.body,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${opts.accountSid}:${opts.authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Twilio ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Allow manual POST trigger as well as pg_cron GET
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verify authorization header matches service role key
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (authHeader !== `Bearer ${serviceKey}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseUrl  = envRequired("SUPABASE_URL");
  const serviceRole  = envRequired("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey    = Deno.env.get("RESEND_API_KEY") ?? "";
  const twilioSid    = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
  const twilioToken  = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
  const twilioFrom   = Deno.env.get("TWILIO_FROM_NUMBER") ?? "";
  const appUrl       = Deno.env.get("APP_URL") ?? "https://app.regpulse.com";
  const fromEmail    = Deno.env.get("FROM_EMAIL") ?? "reminders@regpulse.com";

  // Service-role client — bypasses RLS so we can read all businesses
  const db = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false },
  });

  const stats = { checked: 0, sent: 0, skipped: 0, errors: 0 };

  try {
    // ── 1. Load all businesses with checklist + notification prefs ────────────
    const { data: businesses, error: bizErr } = await db
      .from("businesses")
      .select("id, user_id, name, location, checklist, notification_prefs");

    if (bizErr) throw new Error(`businesses query: ${bizErr.message}`);
    if (!businesses || businesses.length === 0) {
      return Response.json({ message: "No businesses found", stats });
    }

    // ── 2. Load all profiles (phone numbers) ─────────────────────────────────
    const { data: profiles } = await db
      .from("profiles")
      .select("id, phone");
    const profileMap = new Map<string, ProfileRow>(
      (profiles ?? []).map((p: ProfileRow) => [p.id, p]),
    );

    // ── 3. Load all user emails from auth.users via admin API ─────────────────
    // auth.admin.listUsers() returns paginated results — fetch all pages
    const emailMap = new Map<string, string>();
    const nameMap  = new Map<string, string>();
    let page = 1;
    let perPage = 1000;
    while (true) {
      const { data: usersPage, error: usersErr } = await db.auth.admin.listUsers({
        page,
        perPage,
      });
      if (usersErr || !usersPage?.users?.length) break;
      for (const u of usersPage.users) {
        if (u.email) {
          emailMap.set(u.id, u.email);
          // Derive a first name from the email local part for the greeting
          const firstName = (u.user_metadata?.full_name as string | undefined)
            ?? u.email.split("@")[0];
          nameMap.set(u.id, firstName);
        }
      }
      if (usersPage.users.length < perPage) break;
      page++;
    }

    // ── 4. Check already-sent reminders for today's milestones ───────────────
    // Load the reminder log for the next 61 days to avoid redundant queries
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const horizon = new Date(today.getTime() + 61 * 86_400_000);
    const { data: logRows } = await db
      .from("renewal_reminder_log")
      .select("business_id, checklist_item_id, renewal_date, days_before, channel")
      .gte("renewal_date", today.toISOString().slice(0, 10))
      .lte("renewal_date", horizon.toISOString().slice(0, 10))
      .eq("success", true);

    // Build a Set of already-sent keys for O(1) lookup
    const sentKeys = new Set<string>(
      (logRows ?? []).map(
        (r: { business_id: string; checklist_item_id: string; renewal_date: string; days_before: number; channel: string }) =>
          `${r.business_id}|${r.checklist_item_id}|${r.renewal_date}|${r.days_before}|${r.channel}`,
      ),
    );

    // ── 5. Process each business ──────────────────────────────────────────────
    for (const biz of businesses as BusinessRow[]) {
      stats.checked++;

      const userEmail = emailMap.get(biz.user_id);
      if (!userEmail) continue; // no email on record — skip

      const profile  = profileMap.get(biz.user_id);
      const prefs: NotificationPrefs = biz.notification_prefs ?? {
        emailEnabled: true,
        smsEnabled: false,
      };

      for (const item of (biz.checklist ?? [])) {
        if (!item.renewalDate || item.status === "done") continue;

        const daysLeft = daysUntil(item.renewalDate);

        // Only fire on exact milestone days
        if (!(REMINDER_MILESTONES as readonly number[]).includes(daysLeft)) continue;

        const formName = item.text.replace(/\[.*?\]\(.*?\)/g, "$1").replace(/\s+/g, " ").trim();
        const renewUrl = `${appUrl}/chat?business=${encodeURIComponent(biz.id)}&form=${encodeURIComponent(item.formId ?? "")}&action=renew`;

        const emailData = {
          businessName: biz.name,
          formName,
          renewalDate: item.renewalDate,
          daysLeft,
          renewUrl,
          recipientName: nameMap.get(biz.user_id) ?? userEmail,
        };

        // ── Email channel ────────────────────────────────────────────────────
        if (prefs.emailEnabled && resendKey) {
          const emailKey = `${biz.id}|${item.id}|${item.renewalDate}|${daysLeft}|email`;
          if (sentKeys.has(emailKey)) {
            stats.skipped++;
          } else {
            const { subject, html, text } = buildRenewalEmail(emailData);
            const result = await sendEmail({ to: userEmail, subject, html, text, apiKey: resendKey, fromEmail });

            await db.from("renewal_reminder_log").insert({
              user_id:           biz.user_id,
              business_id:       biz.id,
              checklist_item_id: item.id,
              form_id:           item.formId ?? "",
              form_name:         formName,
              renewal_date:      item.renewalDate,
              days_before:       daysLeft,
              channel:           "email",
              success:           result.ok,
              error_message:     result.ok ? null : result.error,
            });

            if (result.ok) {
              sentKeys.add(emailKey);
              stats.sent++;
            } else {
              stats.errors++;
              console.error(`[email] ${biz.id}/${item.id}: ${result.error}`);
            }
          }
        }

        // ── SMS channel ──────────────────────────────────────────────────────
        const smsPhone = prefs.phone ?? profile?.phone ?? null;
        if (prefs.smsEnabled && smsPhone && twilioSid && twilioToken && twilioFrom) {
          const smsKey = `${biz.id}|${item.id}|${item.renewalDate}|${daysLeft}|sms`;
          if (sentKeys.has(smsKey)) {
            stats.skipped++;
          } else {
            const smsBody = buildRenewalSms(emailData);
            const result  = await sendSms({
              to:         smsPhone,
              body:       smsBody,
              accountSid: twilioSid,
              authToken:  twilioToken,
              from:       twilioFrom,
            });

            await db.from("renewal_reminder_log").insert({
              user_id:           biz.user_id,
              business_id:       biz.id,
              checklist_item_id: item.id,
              form_id:           item.formId ?? "",
              form_name:         formName,
              renewal_date:      item.renewalDate,
              days_before:       daysLeft,
              channel:           "sms",
              success:           result.ok,
              error_message:     result.ok ? null : result.error,
            });

            if (result.ok) {
              sentKeys.add(smsKey);
              stats.sent++;
            } else {
              stats.errors++;
              console.error(`[sms] ${biz.id}/${item.id}: ${result.error}`);
            }
          }
        }
      }
    }

    console.log("[send-renewal-reminders] done", stats);
    return Response.json({ ok: true, stats });

  } catch (err) {
    console.error("[send-renewal-reminders] fatal:", err);
    return Response.json({ ok: false, error: String(err), stats }, { status: 500 });
  }
});
