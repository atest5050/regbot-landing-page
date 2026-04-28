// vUnified-20260414-national-expansion-v82 — /features dedicated page.
//   New page: replaces /#features anchor link with a full standalone route.
//   Platform parity: InnerPageLayout handles safe-area, scroll chains, touch targets.
//   tsc EXIT:0 confirmed. No layout changes to existing pages.

import InnerPageLayout from "@/components/landing/InnerPageLayout";
import Link from "next/link";
import {
  MessageSquare,
  ClipboardList,
  FileSearch,
  Bell,
  Scale,
  MapPin,
  Smartphone,
  RefreshCw,
  FileText,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const coreFeatures = [
  {
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Instant Local Answers",
    description:
      "Ask about permits, licenses, zoning, health codes, or labor rules — for your exact city and business type. No generic answers. No outdated PDFs.",
    detail:
      "RegPulse understands that a food truck permit in Austin looks nothing like one in Chicago. Every answer is scoped to your city and county, not just your state.",
  },
  {
    icon: ClipboardList,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Personalized Compliance Checklists",
    description:
      "Get a step-by-step compliance checklist built for your business, with direct links to official forms, filing deadlines, and fee amounts.",
    detail:
      "The checklist updates automatically as regulations change. Each item links to the official government page so you always go to the source.",
  },
  {
    icon: FileSearch,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "AI Form Filler",
    description:
      "RegPulse pre-fills government forms using your saved business profile — download the completed PDF in seconds, ready to review and sign.",
    detail:
      "Works with hundreds of official government PDFs. Supports both AcroForm auto-fill and step-by-step guided completion when auto-fill isn't available.",
  },
  {
    icon: Bell,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Law Change Alerts",
    description:
      "RegPulse monitors the ordinances that affect your business. Get a heads-up when something changes — before it becomes your problem.",
    detail:
      "Push notifications (via Capacitor on mobile) and email alerts ensure you never miss a permit renewal, fee increase, or new requirement in your jurisdiction.",
  },
  {
    icon: Scale,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "Honest, Sourced Answers",
    description:
      "Every answer includes the relevant law, ordinance, or regulation it's based on — so you can verify yourself. We always flag when you need a real attorney.",
    detail:
      "We do not fabricate citations or government portal URLs. When we're uncertain, we say so explicitly. Honesty over false confidence — always.",
  },
  {
    icon: BarChart3,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "Compliance Health Score",
    description:
      "Your business compliance dashboard shows an at-a-glance health score, upcoming renewal deadlines, and outstanding items — all in one place.",
    detail:
      "The health score aggregates checklist completion, renewal status, and outstanding permits into a single number so you know exactly where you stand.",
  },
  {
    icon: MapPin,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Multi-jurisdiction Support",
    description:
      "Run a business across multiple cities or states? RegPulse handles up to 5 business profiles, each with their own local ruleset and checklist.",
    detail:
      "Switch between businesses in one click. Each profile remembers its location, industry type, saved forms, and compliance status independently.",
  },
  {
    icon: Smartphone,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Mobile-First, PWA + Native",
    description:
      "Use RegPulse on any device — fully optimized for iOS Safari, Android Chrome, and Capacitor native apps. Works offline for saved checklists.",
    detail:
      "Built as a Progressive Web App with Capacitor integration. Native push notifications, safe-area insets, and 48px touch targets across every screen.",
  },
  {
    icon: RefreshCw,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "Auto-Renewal Filing",
    description:
      "For Pro users, RegPulse pre-fills your renewal applications automatically when deadlines approach — so renewals are never an afterthought.",
    detail:
      "Combines your saved business profile data with the latest form version from the government agency. Available for 400+ permit types across 200+ jurisdictions.",
  },
  {
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "Document Review",
    description:
      "Upload a lease, vendor contract, or permit application. RegPulse flags potential issues, explains the jargon, and tells you what to ask before you sign.",
    detail:
      "Particularly useful for commercial lease review, vendor agreements, and joint-venture contracts where compliance clauses are buried in legal boilerplate.",
  },
];

const platformRow = [
  { label: "iOS Safari 15.4+", check: true },
  { label: "Android Chrome 120+", check: true },
  { label: "Desktop (all browsers)", check: true },
  { label: "PWA (installable)", check: true },
  { label: "Capacitor native app", check: true },
  { label: "Offline (saved checklists)", check: true },
];

export default function FeaturesPage() {
  return (
    <InnerPageLayout
      title="Features"
      subtitle="Everything a small business owner needs to stay compliant, stay open, and stop worrying about what they missed."
    >
      {/* Core feature grid */}
      <section className="mb-16">
        <div className="grid sm:grid-cols-2 gap-6">
          {coreFeatures.map(({ icon: Icon, color, bg, title, description, detail }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg} mb-4`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">{description}</p>
              <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-200 pt-3">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform parity strip */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Works everywhere you work</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {platformRow.map(({ label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-sm text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we don't do */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-slate-900 mb-4">What RegPulse is not</h2>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-6 py-5 text-sm text-amber-900 leading-relaxed space-y-2">
          <p><strong>Not a law firm.</strong> RegPulse is an informational tool. Nothing we generate constitutes legal advice or creates an attorney-client relationship. Always verify requirements with your local government and consult a licensed attorney for high-stakes decisions.</p>
          <p><strong>Not a filing service.</strong> We prepare forms and guide you through the process, but you submit your applications directly to the relevant government agency.</p>
          <p><strong>Not a replacement for your accountant.</strong> For tax strategy, entity structure, and financial compliance, work with a licensed CPA.</p>
        </div>
      </section>

      {/* CTA strip */}
      <div className="rounded-2xl bg-slate-900 px-8 py-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Ready to stop guessing about permits?</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Start free — no credit card required. Ask your first compliance question in under 60 seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors pointer-events-auto"
          >
            Try RegPulse Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl border border-white/20 hover:border-white/40 text-white text-sm font-medium transition-colors pointer-events-auto"
          >
            See Pricing
          </Link>
        </div>
      </div>
    </InnerPageLayout>
  );
}
