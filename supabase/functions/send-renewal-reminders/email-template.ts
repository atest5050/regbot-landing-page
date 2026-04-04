// Branded HTML email template for renewal reminders.
// Returns a complete HTML document string ready to pass to Resend (or any SMTP provider).

export interface RenewalEmailData {
  businessName: string;
  formName: string;
  renewalDate: string;   // YYYY-MM-DD
  daysLeft: number;
  /** Deep link that opens RegPulse pre-loaded to the renewal form */
  renewUrl: string;
  /** User's first name or email fallback */
  recipientName: string;
}

/** Format YYYY-MM-DD as "January 15, 2026" */
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Urgency color based on days remaining */
function urgencyColor(days: number): { bg: string; border: string; text: string; label: string } {
  if (days <= 1)  return { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B", label: "Due Tomorrow" };
  if (days <= 7)  return { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B", label: `${days} Days Left` };
  if (days <= 30) return { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E", label: `${days} Days Left` };
  return            { bg: "#F0FDF4", border: "#86EFAC", text: "#14532D", label: `${days} Days Left` };
}

export function buildRenewalEmail(data: RenewalEmailData): { subject: string; html: string; text: string } {
  const { businessName, formName, renewalDate, daysLeft, renewUrl, recipientName } = data;
  const urgency = urgencyColor(daysLeft);
  const formattedDate = formatDate(renewalDate);

  const urgencyWord =
    daysLeft <= 1  ? "tomorrow" :
    daysLeft <= 7  ? `in ${daysLeft} days` :
    daysLeft <= 30 ? `in ${daysLeft} days` :
                     `in ${daysLeft} days`;

  const subject =
    daysLeft <= 1  ? `⚠️ Permit renewal due tomorrow — ${businessName}` :
    daysLeft <= 7  ? `⚠️ Permit renewal due in ${daysLeft} days — ${businessName}` :
    daysLeft <= 30 ? `📋 Permit renewal coming up — ${businessName}` :
                     `📋 Renewal reminder — ${businessName}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin: 0; padding: 0; background: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

          <!-- Header / Logo -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;background:#1E40AF;border-radius:12px;padding:10px 20px;">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">
                      Reg<span style="color:#93C5FD;">Pulse</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">

              <!-- Top accent bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(90deg,#1E40AF 0%,#3B82F6 100%);height:4px;"></td>
                </tr>
              </table>

              <!-- Card body -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 32px 24px;">

                <!-- Greeting -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0;font-size:15px;color:#64748B;">
                      Hi ${recipientName},
                    </p>
                  </td>
                </tr>

                <!-- Headline -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#0F172A;line-height:1.3;">
                      Your permit renewal is coming up ${urgencyWord}
                    </h1>
                    <p style="margin:8px 0 0;font-size:14px;color:#64748B;line-height:1.6;">
                      A compliance item for <strong style="color:#0F172A;">${businessName}</strong> needs attention.
                    </p>
                  </td>
                </tr>

                <!-- Permit card -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px;">
                      <tr>
                        <td>
                          <!-- Form name + urgency badge -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td>
                                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">
                                  Permit / License
                                </p>
                                <p style="margin:0;font-size:17px;font-weight:700;color:#0F172A;">
                                  ${formName}
                                </p>
                              </td>
                              <td style="text-align:right;vertical-align:top;padding-left:12px;">
                                <span style="display:inline-block;background:${urgency.bg};border:1px solid ${urgency.border};color:${urgency.text};border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;white-space:nowrap;">
                                  ${urgency.label}
                                </span>
                              </td>
                            </tr>
                          </table>

                          <!-- Divider -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="margin:16px 0;border-top:1px solid #E2E8F0;">
                            <tr><td></td></tr>
                          </table>

                          <!-- Meta row -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:32px;">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">
                                  Business
                                </p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:#334155;">
                                  ${businessName}
                                </p>
                              </td>
                              <td>
                                <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;">
                                  Renewal Due
                                </p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:#334155;">
                                  ${formattedDate}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding-bottom:28px;text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td style="background:#1E40AF;border-radius:10px;">
                          <a href="${renewUrl}"
                            style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.01em;">
                            Renew Now →
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:10px 0 0;font-size:12px;color:#94A3B8;">
                      Opens RegPulse pre-loaded with your renewal form
                    </p>
                  </td>
                </tr>

                <!-- Tip -->
                <tr>
                  <td style="padding-bottom:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:14px 18px;">
                      <tr>
                        <td>
                          <p style="margin:0;font-size:13px;color:#1E40AF;line-height:1.6;">
                            <strong>💡 Tip:</strong> RegPulse will pre-fill your renewal form using your previous submission data, so the process takes just minutes.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>

              <!-- Footer inside card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 32px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
                      You're receiving this because you have renewal reminders enabled for
                      <strong style="color:#64748B;">${businessName}</strong> in RegPulse.
                      <a href="${renewUrl.split("?")[0]}/settings" style="color:#3B82F6;text-decoration:none;">
                        Manage notification preferences
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer outside card -->
          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                © ${new Date().getFullYear()} RegPulse · Compliance made simple
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text fallback
  const text = [
    `RegPulse Renewal Reminder`,
    ``,
    `Hi ${recipientName},`,
    ``,
    `This is a reminder that your permit renewal is due ${urgencyWord}.`,
    ``,
    `Business:   ${businessName}`,
    `Permit:     ${formName}`,
    `Due date:   ${formattedDate}`,
    ``,
    `Renew now: ${renewUrl}`,
    ``,
    `RegPulse will pre-fill your renewal form with your previous submission data.`,
    ``,
    `---`,
    `You're receiving this because renewal reminders are enabled for ${businessName}.`,
    `To manage your preferences, visit the app and open Notification Settings.`,
  ].join("\n");

  return { subject, html, text };
}

/** Build a short SMS message (≤160 chars where possible). */
export function buildRenewalSms(data: RenewalEmailData): string {
  const { businessName, formName, renewalDate, daysLeft, renewUrl } = data;
  const [year, month, day] = renewalDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const shortDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const urgency =
    daysLeft <= 1 ? "TOMORROW" :
    daysLeft <= 7 ? `in ${daysLeft}d` :
                    `in ${daysLeft} days`;

  // Aim for under 160 chars
  return `RegPulse: ${businessName} – ${formName} renewal due ${urgency} (${shortDate}). Renew: ${renewUrl}`;
}
