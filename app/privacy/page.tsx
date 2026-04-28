// vUnified-20260414-national-expansion-v82 — /privacy updated with final App Store policy.
//   Updated: verbatim privacy policy content per v82 requirements.
//   Effective date updated to April 16, 2026.
//   CCPA/CPRA, GDPR, ATT, App Store Nutrition Label, Play Data Safety all documented.
//   tsc EXIT:0 confirmed. Platform parity via InnerPageLayout.

import InnerPageLayout from "@/components/landing/InnerPageLayout";

const EFFECTIVE_DATE = "April 16, 2026";

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
          This Privacy Policy explains how we collect, use, and protect your information.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>
            <strong>Account and profile data:</strong> email, business name, address, EIN, industry,
            city/state/ZIP (entered as text — we do not collect precise GPS location)
          </li>
          <li>
            <strong>Usage data:</strong> compliance checklist items, chat messages (temporary for context),
            completed forms
          </li>
          <li>
            <strong>Technical data:</strong> device type, IP address (for security and fraud prevention)
          </li>
        </ul>

        <p>
          We do <strong>not</strong> collect precise location, financial card details (Stripe processes
          payments), health data, contacts, photos, or any sensitive personal information beyond what
          you voluntarily provide.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Deliver AI-powered hyper-local compliance guidance</li>
          <li>Store your business profile and checklist for continuity across sessions</li>
          <li>Process payments securely via Stripe</li>
          <li>Improve the service (anonymized analytics)</li>
        </ul>

        <h2>Sharing and Third Parties</h2>
        <ul>
          <li>
            <strong>Anthropic Claude:</strong> processes chat messages you send
          </li>
          <li>
            <strong>Supabase:</strong> stores your profile and checklist
          </li>
          <li>
            <strong>Stripe:</strong> handles payments (we never see or store card numbers)
          </li>
        </ul>

        <p>
          We do not sell your data. We do not use tracking or advertising SDKs.
        </p>

        <h2>Data Retention and Your Rights</h2>
        <ul>
          <li>
            Data is kept while your account is active. You may request deletion at any time
            (processed within 30 days).
          </li>
          <li>
            You have the right to access, correct, or delete your data — email{" "}
            <a href="mailto:support@reg-bot.ai" className="text-blue-600 hover:underline">
              support@reg-bot.ai
            </a>.
          </li>
        </ul>

        <h2>Compliance</h2>
        <p>
          RegPulse complies with CCPA/CPRA, GDPR (where applicable), and provides accurate App
          Privacy Nutrition Label and Google Play Data Safety disclosures. We do not track users
          across apps or websites (ATT = No).
        </p>

        <h2>Contact</h2>
        <p>
          <a href="mailto:support@reg-bot.ai" className="text-blue-600 hover:underline">
            support@reg-bot.ai
          </a>
        </p>

      </div>

      {/* App Store compliance reference */}
      <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          App Store Privacy Nutrition Label Summary
        </h3>
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
                ["Business profile data", "Yes", "Yes", "No"],
                ["User content (chat, forms)", "Yes", "Yes", "No"],
                ["App interactions", "Yes", "No", "No"],
                ["Crash data", "Yes", "No", "No"],
                ["Precise location", "No", "—", "—"],
                ["Financial info (cards)", "No", "—", "—"],
                ["Health data", "No", "—", "—"],
                ["Contacts / photos", "No", "—", "—"],
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
        <p className="mt-4 text-xs text-slate-400">
          Does this app track users? <strong>No.</strong> ATT permission prompt is not required.
          Answer &ldquo;No&rdquo; to &ldquo;Does this app use data to track the user?&rdquo; in App Store Connect.
        </p>
      </div>

      {/* Google Play Data Safety */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Google Play Data Safety Summary
        </h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li><strong>Data encrypted in transit:</strong> Yes</li>
          <li><strong>User can request data deletion:</strong> Yes — email support@reg-bot.ai</li>
          <li><strong>Data collected:</strong> Email, User ID, business profile, app interactions, crash logs</li>
          <li>
            <strong>Third-party data sharing:</strong> Supabase (auth/db), Anthropic (AI processing),
            Stripe (payments)
          </li>
          <li><strong>Data used to track users across apps:</strong> No</li>
        </ul>
      </div>
    </InnerPageLayout>
  );
}
