import InnerPageLayout from "@/components/landing/InnerPageLayout";

const EFFECTIVE_DATE = "April 1, 2025";

export default function TermsPage() {
  return (
    <InnerPageLayout
      title="Terms of Service"
      subtitle={`Effective date: ${EFFECTIVE_DATE}`}
      darkHero
    >
      <div className="prose prose-slate prose-sm max-w-none [&_h2]:text-slate-900 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-slate-600 [&_p]:leading-relaxed [&_ul]:text-slate-600 [&_ul]:space-y-1.5 [&_li]:leading-relaxed">

        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of RegPulse
          (&ldquo;Service&rdquo;), operated by RegPulse (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing or using
          the Service you agree to be bound by these Terms. If you do not agree, do not use
          the Service.
        </p>

        <h2>1. Description of the service</h2>
        <p>
          RegPulse is an AI-powered compliance information tool that helps small business owners
          understand local permit requirements, generate compliance checklists, and prepare
          government form applications. The Service is for informational and productivity purposes
          only and does not constitute legal advice.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old and have the legal capacity to enter into a binding
          agreement to use the Service. By using RegPulse you represent that you meet these
          requirements.
        </p>

        <h2>3. Accounts</h2>
        <p>
          You may use RegPulse as a guest or by creating an authenticated account via email.
          You are responsible for maintaining the confidentiality of your credentials and for all
          activities that occur under your account. Notify us immediately at{" "}
          <a href="mailto:hello@regpulse.ai" className="text-blue-600 hover:underline">
            hello@regpulse.ai
          </a>{" "}
          if you suspect unauthorized access.
        </p>

        <h2>4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of any applicable regulation.</li>
          <li>Submit false, misleading, or fraudulent information into government forms.</li>
          <li>Attempt to reverse-engineer, scrape, or systematically extract data from the Service.</li>
          <li>Use the Service to harm, harass, or deceive other persons or entities.</li>
          <li>Interfere with or disrupt the integrity or performance of the Service.</li>
        </ul>

        <h2>5. Not legal advice</h2>
        <p>
          <strong>
            RegPulse provides informational assistance only. Nothing on this site or generated
            by the Service constitutes legal advice, legal opinion, or the practice of law.
          </strong>{" "}
          Compliance requirements vary by jurisdiction and change frequently. You should verify
          all information independently with the relevant government agency and consult a
          licensed attorney before making decisions based on information provided by the Service.
        </p>
        <p>
          We make no representation or warranty that information provided by the Service is
          accurate, complete, current, or applicable to your specific situation.
        </p>

        <h2>6. Fees and payment</h2>
        <p>
          Certain features of the Service require payment, including the $5 Form Completion fee
          and the RegPulse Pro subscription ($19/month or $179/year). All payments are processed
          by Stripe. By providing payment information you authorize us to charge the applicable
          fees. Fees are non-refundable except as required by law or as explicitly stated in
          our refund policy.
        </p>
        <p>
          Government filing fees are separate from RegPulse fees and are paid directly to the
          relevant government agency by you. RegPulse is not responsible for government fees.
        </p>

        <h2>7. Intellectual property</h2>
        <p>
          All content, design, code, and materials on RegPulse are the intellectual property of
          RegPulse or its licensors and are protected by copyright, trademark, and other laws.
          You may not reproduce, distribute, or create derivative works without our express
          written permission.
        </p>
        <p>
          Data you input into the Service (business name, location, form answers) remains yours.
          By submitting it you grant us a limited license to process it to provide the Service.
        </p>

        <h2>8. Disclaimer of warranties</h2>
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT. WE DO NOT WARRANT
          THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER
          HARMFUL COMPONENTS.
        </p>

        <h2>9. Limitation of liability</h2>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, REGPULSE AND ITS AFFILIATES, OFFICERS,
          EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE
          SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO
          YOU FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS
          PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless RegPulse and its affiliates from any claims,
          losses, liabilities, damages, costs, and expenses (including reasonable attorney&rsquo;s fees)
          arising out of your use of the Service, your violation of these Terms, or your violation
          of any rights of a third party.
        </p>

        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate your access to the Service at any time for any reason,
          including if we reasonably believe you have violated these Terms. You may stop using the
          Service at any time. Upon termination, provisions that by their nature should survive
          will survive, including Sections 5, 7, 8, 9, and 10.
        </p>

        <h2>12. Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of Florida, without regard to its
          conflict-of-laws principles. Any dispute arising under these Terms shall be resolved
          exclusively in the state or federal courts located in Palm Beach County, Florida, and
          you consent to personal jurisdiction in those courts.
        </p>

        <h2>13. Changes to these terms</h2>
        <p>
          We may update these Terms from time to time. We will notify registered users by email
          of material changes. Continued use of the Service after changes constitutes acceptance
          of the revised Terms.
        </p>

        <h2>14. Contact</h2>
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:legal@regpulse.ai" className="text-blue-600 hover:underline">
            legal@regpulse.ai
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
