// vUnified-20260414-national-expansion-v82 — /faq dedicated page.
//   New page: replaces /#faq anchor link with a full standalone route.
//   Platform parity: InnerPageLayout handles safe-area, scroll chains, touch targets.
//   tsc EXIT:0 confirmed. No layout changes to existing pages.

import InnerPageLayout from "@/components/landing/InnerPageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";

const faqs = [
  {
    category: "About RegPulse",
    items: [
      {
        q: "What is RegPulse?",
        a: "RegPulse is an AI-powered compliance co-pilot for small businesses. It answers hyper-local questions about permits, licenses, zoning, health codes, and labor rules — for your exact city and business type — and generates personalized compliance checklists backed by primary government sources.",
      },
      {
        q: "Who is RegPulse built for?",
        a: "Small business owners, solo operators, side hustlers, freelancers, food truck operators, home bakers, Etsy sellers, retail shop owners, consultants, and anyone who runs a business and needs to understand what permits, licenses, and compliance requirements apply to them. If you've ever Googled \"do I need a business license for [city]\" at 11 pm, RegPulse was built for you.",
      },
      {
        q: "Is RegPulse real legal advice?",
        a: "No — and we'll always tell you that upfront. RegPulse gives you research, context, and actionable next steps grounded in real laws and ordinances, but it does not create an attorney-client relationship and is not a substitute for legal advice from a licensed attorney. We cite every source so you can verify independently and always tell you when a situation requires professional legal counsel.",
      },
    ],
  },
  {
    category: "How It Works",
    items: [
      {
        q: "How does RegPulse know my local regulations?",
        a: "RegPulse combines AI with a regularly maintained database of city, county, and state regulations across the US. Every answer shows you the source — specific laws, ordinances, and official program pages — so you can verify directly with your local government agency.",
      },
      {
        q: "How is RegPulse different from just asking ChatGPT?",
        a: "RegPulse is purpose-built for compliance: it understands jurisdictional differences, knows which clarifying questions to ask about your business type, links to primary government sources, and is explicitly designed to avoid hallucinating legal information. It also maintains your business profile and checklist across sessions — ChatGPT can't do that. General AI is a calculator; RegPulse is a compliance specialist.",
      },
      {
        q: "What does the AI Form Filler do?",
        a: "The Form Filler pre-populates official government PDFs using your saved business profile data. It downloads the official form, extracts the form fields, fills them with your answers, and delivers the completed file. When auto-fill isn't possible, it generates a step-by-step manual completion guide. You review, sign, and submit — RegPulse does the preparation work.",
      },
      {
        q: "How accurate is the information?",
        a: "We strive for high accuracy by citing primary sources (city codes, state statutes, official agency pages) and flagging uncertainty explicitly. However, regulations change frequently and vary by jurisdiction. Always verify requirements directly with the relevant government agency before submitting applications or paying fees. We are a research and productivity tool — not an authoritative legal or government source.",
      },
    ],
  },
  {
    category: "Coverage and Availability",
    items: [
      {
        q: "What kinds of businesses does RegPulse support?",
        a: "Home-based businesses, cottage food and food trucks, Etsy and handmade sellers, freelancers and consultants, retail, service businesses, event vendors, personal trainers, childcare providers, and more. Coverage is expanding weekly — if your industry isn't listed, try asking anyway. You may be surprised.",
      },
      {
        q: "What if my city isn't covered yet?",
        a: "Enter your location and RegPulse will give you state-level guidance and flag what needs local verification. We add new jurisdictions every week — you can request yours through the chat interface. We currently have detailed coverage for 3,381+ city/county pairs across all 50 states.",
      },
      {
        q: "Does RegPulse cover federal regulations?",
        a: "Yes. In addition to city and state requirements, RegPulse can explain federal requirements that apply to your business — including FTC rules, ADA compliance basics, OSHA requirements for small employers, and federal tax registration (EIN, sales tax nexus). Federal guidance is combined with your local requirements in a single checklist.",
      },
    ],
  },
  {
    category: "Platform and Devices",
    items: [
      {
        q: "Can I use RegPulse on my phone?",
        a: "Yes. RegPulse is fully mobile-optimized and works on iOS Safari, Android Chrome, and as a native Capacitor app. Use it in line at the permit office, on a job site, or anywhere the compliance questions come up. All touch targets meet 48px accessibility guidelines and the interface is designed for one-handed use.",
      },
      {
        q: "Is there an app I can install?",
        a: "RegPulse works as a Progressive Web App (PWA) — you can add it to your home screen on iOS and Android without downloading from an app store. Native iOS and Android apps (via Capacitor) are coming to the App Store and Google Play. Join the waitlist to get notified when they launch.",
      },
      {
        q: "Does it work offline?",
        a: "Saved compliance checklists and business profiles are available offline. Real-time AI compliance questions require an internet connection. Push notifications for renewal reminders work through Capacitor's LocalNotifications — even when the app is in the background.",
      },
    ],
  },
  {
    category: "Pricing and Account",
    items: [
      {
        q: "Is there a free plan?",
        a: "Yes. The Free plan includes 3 AI form completions per month, city and state permit guidance, and a saved compliance checklist. No credit card required to start.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. All paid plans are month-to-month and can be cancelled anytime from your account settings — no questions asked. If you cancel before the end of a billing period, you retain access until the period ends.",
      },
      {
        q: "How do I delete my account and data?",
        a: "Email support@reg-bot.ai to request account deletion. All personal data, business profiles, and form history will be deleted within 30 days. You can also request a copy of your data before deletion.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <InnerPageLayout
      title="Frequently Asked Questions"
      subtitle="Everything you need to know before you start — and answers to the questions we hear most."
    >
      {/* Category sections */}
      <div className="space-y-12 mb-16">
        {faqs.map(({ category, items }) => (
          <section key={category}>
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              {category}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {items.map(({ q, a }, i) => (
                <AccordionItem key={i} value={`${category}-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 leading-relaxed">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      {/* Still have questions */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 px-8 py-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 mb-4">
          <MessageSquare className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Still have questions?</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-md mx-auto">
          Ask RegPulse directly — it's free to start. Or reach our support team at{" "}
          <a href="mailto:support@reg-bot.ai" className="text-blue-600 hover:underline">
            support@reg-bot.ai
          </a>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors pointer-events-auto"
          >
            Ask RegPulse <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors pointer-events-auto"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </InnerPageLayout>
  );
}
