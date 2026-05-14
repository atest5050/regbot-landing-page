import InnerPageLayout from "@/components/landing/InnerPageLayout";

const EFFECTIVE_DATE = "May 7, 2026";

export default function PrivacyPage() {
  return (
    <InnerPageLayout
      title="Privacy Policy"
      subtitle={`Last updated: ${EFFECTIVE_DATE}`}
      darkHero
    >
      <div className="prose prose-slate prose-sm max-w-none [&_h2]:text-slate-900 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-slate-600 [&_p]:leading-relaxed [&_ul]:text-slate-600 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

        <p>
          RegPulse (reg-bot.ai) is an AI-powered compliance co-pilot for small businesses.
          This Privacy Policy explains what information we collect, how we use it, who we
          share it with, and your rights as a user.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>
            <strong>Account and profile data:</strong> email address, password (hashed),
            business name, business type, street address, city, state, ZIP code, EIN,
            owner name, phone number, and other information you voluntarily enter.
          </li>
          <li>
            <strong>Coarse location:</strong> when you grant permission, we use your
            device&apos;s GPS to detect your approximate city and state so we can surface
            jurisdiction-specific compliance requirements. We do not store raw GPS
            coordinates — only the resolved city/state string.
          </li>
          <li>
            <strong>Uploaded documents and photos:</strong> you may upload permit documents,
            licenses, and photos of your business premises for AI-powered compliance
            analysis. These files are processed by our AI providers (see Sharing below)
            and, for authenticated users, stored in your private Supabase Storage bucket.
          </li>
          <li>
            <strong>Chat and form content:</strong> messages you send and form responses
            you submit are processed to generate compliance guidance and pre-fill forms.
            Chat history is stored per-session for context and may be saved to your
            account if you are signed in.
          </li>
          <li>
            <strong>Technical data:</strong> device type, operating system, IP address,
            and crash logs — used for security, fraud prevention, and improving reliability.
          </li>
          <li>
            <strong>Payment data:</strong> subscription and payment processing is handled
            entirely by Stripe. We never see or store your card number, CVV, or full
            billing address.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Deliver AI-powered, hyper-local compliance guidance tailored to your business type and jurisdiction</li>
          <li>Store your business profile and compliance checklist so they persist across sessions and devices</li>
          <li>Send renewal reminder emails and SMS notifications when permits are approaching expiration (only if you enable this)</li>
          <li>Analyze uploaded documents and photos to identify compliance status and risks</li>
          <li>Process your Pro subscription via Stripe</li>
          <li>Improve the service using anonymized, aggregated analytics</li>
          <li>Respond to support requests</li>
        </ul>

        <h2>Sharing and Third-Party Services</h2>
        <p>We share data only with the service providers necessary to operate RegPulse. We do not sell your data and do not use advertising or tracking SDKs.</p>
        <ul>
          <li>
            <strong>Anthropic (Claude):</strong> processes chat messages, compliance questions,
            and renewal reminder content generation. Data is sent per-request; Anthropic does
            not train on your data under our API agreement.
          </li>
          <li>
            <strong>OpenAI (GPT-4o):</strong> processes uploaded documents and photos for
            compliance analysis, and powers the AI Pre-Inspection Coach. Data is sent
            per-request; OpenAI does not train on API data by default.
          </li>
          <li>
            <strong>Supabase:</strong> stores your account, business profile, compliance
            checklist, uploaded documents, and chat history. Data is encrypted at rest and
            in transit.
          </li>
          <li>
            <strong>Stripe:</strong> processes subscription payments. Stripe&apos;s privacy
            policy governs payment data. We store only your Stripe customer ID and
            subscription status.
          </li>
          <li>
            <strong>Twilio:</strong> sends SMS renewal reminder notifications to the phone
            number you provide, if you enable SMS alerts.
          </li>
          <li>
            <strong>Resend:</strong> delivers transactional emails, including renewal reminders
            and account confirmation messages.
          </li>
        </ul>

        <h2>Location Data</h2>
        <p>
          We request access to your device&apos;s location solely to detect your city and state for
          compliance jurisdiction matching. The raw GPS coordinates are never transmitted to our
          servers or stored. You may deny location permission at any time — the app will prompt
          you to enter your location manually instead.
        </p>

        <h2>Photos and Documents</h2>
        <p>
          Photos taken or selected for the Photo Compliance Scan feature are sent directly
          to OpenAI for analysis and are not stored on our servers after the analysis completes.
          Documents you upload (PDFs, images of permits) are stored in your private, access-controlled
          Supabase Storage bucket and are not accessible by other users.
        </p>

        <h2>Data Retention and Deletion</h2>
        <ul>
          <li>Your data is retained for as long as your account is active.</li>
          <li>
            You may request complete deletion of your account and all associated data at any
            time by emailing{" "}
            <a href="mailto:support@reg-bot.ai" className="text-blue-600 hover:underline">
              support@reg-bot.ai
            </a>
            . Requests are processed within 30 days.
          </li>
          <li>Payment records may be retained longer where required by law or Stripe&apos;s policies.</li>
        </ul>

        <h2>Your Rights</h2>
        <p>
          Depending on your jurisdiction you may have the right to access, correct, port, or
          delete your personal data, and to opt out of certain processing. To exercise any of
          these rights email{" "}
          <a href="mailto:support@reg-bot.ai" className="text-blue-600 hover:underline">
            support@reg-bot.ai
          </a>
          . We comply with CCPA/CPRA (California), GDPR (EU/UK), and applicable US state
          privacy laws.
        </p>

        <h2>Children</h2>
        <p>
          RegPulse is not directed at children under 13 and we do not knowingly collect data
          from anyone under 13. If you believe a child has provided us personal information,
          contact us immediately.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy as we add features. Material changes will be communicated
          via in-app notice or email. Continued use after the effective date constitutes
          acceptance of the updated policy.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:support@reg-bot.ai" className="text-blue-600 hover:underline">
            support@reg-bot.ai
          </a>
        </p>

      </div>

      {/* App Store Privacy Nutrition Label */}
      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          App Store Privacy Nutrition Label Summary
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Use these answers when completing App Privacy in App Store Connect.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 font-semibold text-slate-700">Data Type</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-700">Collected</th>
                <th className="text-left py-2 pr-4 font-semibold text-slate-700">Linked to You</th>
                <th className="text-left py-2 font-semibold text-slate-700">Used for Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["Email address", "Yes", "Yes", "No"],
                ["User ID", "Yes", "Yes", "No"],
                ["Name / phone number", "Yes (optional)", "Yes", "No"],
                ["Business profile data", "Yes", "Yes", "No"],
                ["Coarse location (city/state)", "Yes", "Yes", "No"],
                ["Photos (compliance scan)", "Yes (user-initiated)", "Yes", "No"],
                ["Uploaded documents", "Yes (user-initiated)", "Yes", "No"],
                ["User content (chat, forms)", "Yes", "Yes", "No"],
                ["App interactions / usage", "Yes", "No", "No"],
                ["Crash data", "Yes", "No", "No"],
                ["Precise GPS coordinates", "No", "—", "—"],
                ["Financial info (card numbers)", "No", "—", "—"],
                ["Health data", "No", "—", "—"],
                ["Contacts", "No", "—", "—"],
              ].map(([type, collected, linked, tracking]) => (
                <tr key={type}>
                  <td className="py-2 pr-4">{type}</td>
                  <td className="py-2 pr-4">{collected}</td>
                  <td className="py-2 pr-4">{linked}</td>
                  <td className="py-2">{tracking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-1 text-xs text-slate-500">
          <p><strong>Does this app track users?</strong> No — answer &ldquo;No&rdquo; to &ldquo;Does this app use data to track the user?&rdquo; in App Store Connect. ATT prompt is not required.</p>
          <p><strong>Location permission purpose string:</strong> &ldquo;RegPulse uses your location to identify the compliance requirements for your city and state. GPS coordinates are never stored.&rdquo;</p>
        </div>
      </div>

      {/* Google Play Data Safety */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Google Play Data Safety Summary
        </h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li><strong>Data encrypted in transit:</strong> Yes (TLS)</li>
          <li><strong>Data encrypted at rest:</strong> Yes (Supabase / AES-256)</li>
          <li><strong>User can request data deletion:</strong> Yes — email support@reg-bot.ai</li>
          <li><strong>Data collected:</strong> Email, User ID, name, phone (optional), business profile, coarse location, uploaded files (user-initiated), chat/form content, app interactions, crash logs</li>
          <li><strong>Third-party data sharing:</strong> Anthropic (AI), OpenAI (AI), Supabase (auth/db/storage), Stripe (payments), Twilio (SMS), Resend (email)</li>
          <li><strong>Data used to track users across apps or websites:</strong> No</li>
          <li><strong>Data sold to third parties:</strong> No</li>
        </ul>
      </div>
    </InnerPageLayout>
  );
}
