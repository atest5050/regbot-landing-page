import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: newSignups } = await supabase
    .from('waitlist')
    .select('email, created_at')
    .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString())
    .order('created_at', { ascending: false })

  if (!newSignups || newSignups.length === 0) {
    return new Response('No new sign-ups today')
  }

  const emailHtml = `
    <h2>New RegPulse Waitlist Sign-ups</h2>
    <p><strong>${newSignups.length} new sign-up(s) in the last 24 hours</strong></p>
    <ul>
      ${newSignups.map(s => `<li>${s.email} — ${new Date(s.created_at).toLocaleString()}</li>`).join('')}
    </ul>
    <p><em>RegPulse Daily Report • noreply@reg-bot.ai</em></p>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: 'atestani56@gmail.com',
      subject: `RegPulse Waitlist — ${newSignups.length} new sign-up(s) today`,
      html: emailHtml,
    }),
  })

  return new Response('Daily report sent', { status: 200 })
})
