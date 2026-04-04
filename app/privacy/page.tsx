import InnerPageLayout from "@/components/landing/InnerPageLayout";

const EFFECTIVE_DATE = "April 1, 2025";

export default function PrivacyPage() {
  return (
    <InnerPageLayout
      title="Privacy Policy"
      subtitle={`Effective date: ${EFFECTIVE_DATE}`}
      darkHero
    >
      <div className="prose prose-slate prose-sm max-w-none [&_h2]:text-slate-900 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-slate-600 [&_p]:leading-relaxed [&_ul]:text-slate-600 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

        <p>
          RegPulse (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This
          Privacy Policy explains what information we collect, how we use it, and the choices
          you have. By using RegPulse you agree to the practices described here.
        </p>

        <h2>1. Information we collect</h2>
        <p><strong>Information you provide directly:</strong></p>
        <ul>
          <li>Email address when you join the waitlist or create an account.</li>
          <li>Business name, location, and industry when you save a business profile.</li>
          <li>Form answers you enter while completing government forms via the AI Form Filler.</li>
        </ul>
        <p><strong>Information collected automatically:</strong></p>
        <ul>
          <li>Location data (city, state, ZIP) from your browser&rsquo;s GPS or from a ZIP code or city you type manually. We do not store precise GPS coordinates.</li>
          <li>Usage events (pages visited, features used, conversion events) sent to Google Analytics 4 with IP anonymization enabled.</li>
          <li>Browser local storage for guest-mode data (checklist items, business profiles, form progress) that has not been synced to a cloud account.</li>
        </ul>
        <p><strong>Information we do not collect:</strong></p>
        <ul>
          <li>Payment card details — all payments are processed by Stripe directly. We receive only confirmation metadata.</li>
          <li>Social Security Numbers or Employer Identification Numbers entered in government forms. Form data is stored only in your browser or in your password-protected Supabase account.</li>
        </ul>

        <h2>2. How we use your information</h2>
        <ul>
          <li>To provide and improve the RegPulse service, including hyper-local compliance guidance tailored to your location and business type.</li>
          <li>To send product updates and compliance-related notifications if you have opted in.</li>
          <li>To analyze aggregate, anonymized usage patterns to prioritize features and fix bugs.</li>
          <li>To process payments via Stripe for the $5 Form Completion fee and Pro subscription.</li>
        </ul>
        <p>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>

        <h2>3. Data storage and security</h2>
        <p>
          Authenticated user data (business profiles, checklists, alerts) is stored in Supabase,
          a SOC 2 Type II–compliant cloud database provider. Data is encrypted at rest and in
          transit. Guest-mode data lives exclusively in your browser&rsquo;s local storage and is
          never sent to our servers unless you choose to create an account.
        </p>
        <p>
          No data storage system is 100% secure. We cannot guarantee absolute security, but we
          take reasonable precautions and will notify affected users promptly in the event of a
          breach affecting personal data.
        </p>

        <h2>4. Cookies and tracking</h2>
        <p>
          We use Google Analytics 4 with IP anonymization. GA4 sets first-party cookies to
          distinguish sessions. You can opt out via your browser&rsquo;s cookie settings or by
          installing the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google Analytics opt-out browser add-on
          </a>
          .
        </p>
        <p>
          We do not use advertising cookies, third-party tracking pixels, or behavioral
          retargeting scripts.
        </p>

        <h2>5. Third-party services</h2>
        <ul>
          <li><strong>Supabase</strong> — database and authentication. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy policy</a>.</li>
          <li><strong>Stripe</strong> — payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy policy</a>.</li>
          <li><strong>Google Analytics 4</strong> — aggregate usage analytics. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy policy</a>.</li>
          <li><strong>OpenStreetMap Nominatim</strong> — reverse geocoding for GPS location data. No personal data is stored by Nominatim; only coordinates are sent, and the response is processed locally.</li>
        </ul>

        <h2>6. Your rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal data at any time
          by emailing{" "}
          <a href="mailto:privacy@regpulse.ai" className="text-blue-600 hover:underline">
            privacy@regpulse.ai
          </a>
          . We will respond within 30 days. Authenticated users may also delete their account
          directly from account settings, which purges all associated data from Supabase.
        </p>
        <p>
          California residents have additional rights under CCPA. EU/EEA residents have rights
          under GDPR. Please contact us to exercise any applicable rights.
        </p>

        <h2>7. Children</h2>
        <p>
          RegPulse is not directed at children under 13. We do not knowingly collect personal
          information from children. If you believe a child has provided personal data, please
          contact us and we will delete it promptly.
        </p>

        <h2>8. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. When we do, we will update the effective
          date at the top. Continued use of RegPulse after changes constitutes acceptance of the
          revised policy. Material changes will be communicated via email to registered users.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions about this Privacy Policy? Email{" "}
          <a href="mailto:privacy@regpulse.ai" className="text-blue-600 hover:underline">
            privacy@regpulse.ai
          </a>{" "}
          or use the{" "}
          <a href="/contact" className="text-blue-600 hover:underline">
            contact form
          </a>
          .
        </p>
      </div>
    </InnerPageLayout>
  );
}
