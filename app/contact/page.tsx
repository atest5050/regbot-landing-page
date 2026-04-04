import InnerPageLayout from "@/components/landing/InnerPageLayout";
import ContactForm from "./ContactForm";
import { Mail, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <InnerPageLayout
      title="Contact Us"
      subtitle="Have a question, a feature request, or found a problem? We read every message."
    >
      <div className="grid sm:grid-cols-5 gap-10">

        {/* Left column — form */}
        <div className="sm:col-span-3">
          <h2 className="text-base font-semibold text-slate-900 mb-5">Send us a message</h2>
          <ContactForm />
        </div>

        {/* Right column — info */}
        <div className="sm:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Email us directly</h3>
            </div>
            <a
              href="mailto:hello@regpulse.ai"
              className="text-sm text-blue-600 hover:underline underline-offset-2"
            >
              hello@regpulse.ai
            </a>
            <p className="text-xs text-slate-400 mt-1">For general inquiries and partnership requests.</p>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Response time</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              We typically respond within 1–2 business days. Pro subscribers receive priority support.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Common topics</h3>
            </div>
            <ul className="space-y-1.5">
              {[
                "Bug reports or incorrect compliance information",
                "Feature suggestions",
                "Pro subscription questions",
                "Press or partnership inquiries",
                "Data or privacy questions",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-slate-500">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Not legal advice:</strong> RegPulse cannot provide
            legal counsel. For advice specific to your legal situation please consult a licensed
            attorney in your jurisdiction.
          </div>
        </div>
      </div>
    </InnerPageLayout>
  );
}
