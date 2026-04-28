// vUnified-20260414-national-expansion-v82 — /pricing dedicated page.
//   New page: replaces /#pricing anchor link with a full standalone route.
//   Platform parity: InnerPageLayout handles safe-area, scroll chains.
//   "use client" required for WaitlistModal useState. tsc EXIT:0 confirmed.

"use client";

import { useState } from "react";
import InnerPageLayout from "@/components/landing/InnerPageLayout";
import WaitlistModal from "@/components/landing/WaitlistModal";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    tagline: "Try before you commit",
    cta: "Get Started Free",
    highlight: false,
    href: "/chat",
    features: [
      "3 AI form completions / month",
      "City & state permit guidance",
      "Auto-saved compliance checklist",
      "Basic renewal reminders",
    ],
    notIncluded: [
      "Unlimited form completions",
      "Rule change alerts",
      "Compliance Health Score",
      "Auto-renewal filing",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    tagline: "For growing small businesses",
    cta: "Join Waitlist – Start Pro",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited AI form completions",
      "Automatic renewal filing (pre-filled)",
      "Quarterly Compliance Check-in PDF",
      "Rule change alerts for your permits",
      "Compliance Health Score dashboard",
      "Saved business living profiles",
      "Priority support",
    ],
    notIncluded: [],
  },
  {
    name: "Business",
    price: "$39",
    period: "/mo",
    tagline: "For multi-location operations",
    cta: "Join Waitlist – Go Business",
    highlight: false,
    features: [
      "Everything in Pro",
      "Up to 5 business profiles",
      "Team member access (up to 3)",
      "Document analysis & review",
      "Shareable compliance reports",
      "Dedicated account support",
    ],
    notIncluded: [],
  },
];

const faqItems = [
  {
    q: "Is the Free plan really free — no credit card?",
    a: "Yes. The Free plan requires no credit card. You get 3 AI form completions per month and full access to city/state permit guidance.",
  },
  {
    q: "What counts as an AI form completion?",
    a: "Each time RegPulse pre-fills a government form PDF (or generates a step-by-step manual guide for a form) counts as one completion. Browsing compliance information, updating your checklist, and chatting with the AI do not count.",
  },
  {
    q: "Can I switch plans or cancel anytime?",
    a: "Yes. Upgrade, downgrade, or cancel anytime from your account settings. If you cancel, you retain access through the end of your current billing period.",
  },
  {
    q: "Is there an annual billing option?",
    a: "Pro annual billing is $179/year — that's $14.92/month, saving you about two months compared to monthly billing. Annual billing is available at checkout.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you are not satisfied within the first 14 days of a paid plan, email support@reg-bot.ai and we will issue a full refund, no questions asked.",
  },
];

export default function PricingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <InnerPageLayout
        title="Simple, Transparent Pricing"
        subtitle="Start free. Upgrade when you're ready. Cancel anytime — no questions asked."
      >
        {/* Pricing cards */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map(({ name, price, period, tagline, cta, highlight, badge, features, notIncluded, href }) => (
              <div
                key={name}
                className={cn(
                  "relative rounded-2xl border p-6 transition-shadow duration-200",
                  highlight
                    ? "border-blue-500 bg-blue-600 shadow-xl shadow-blue-100 md:-translate-y-2"
                    : "border-slate-200 bg-white hover:shadow-md"
                )}
              >
                {badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className={cn("text-sm font-medium mb-1", highlight ? "text-blue-200" : "text-slate-500")}>
                    {name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-4xl font-bold tracking-tight", highlight ? "text-white" : "text-slate-900")}>
                      {price}
                    </span>
                    <span className={cn("text-sm", highlight ? "text-blue-200" : "text-slate-400")}>
                      {period}
                    </span>
                  </div>
                  {highlight && (
                    <p className="text-xs text-blue-200 mt-1">or $179/yr — save 2 months</p>
                  )}
                  <p className={cn("mt-2 text-sm", highlight ? "text-blue-200" : "text-slate-500")}>
                    {tagline}
                  </p>
                </div>

                {href ? (
                  <Link
                    href={href}
                    className={cn(
                      "w-full mb-7 min-h-[48px] inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors pointer-events-auto",
                      "border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700"
                    )}
                  >
                    {cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => setModalOpen(true)}
                    className={cn(
                      "w-full mb-7 min-h-[48px] inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors pointer-events-auto",
                      highlight
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700"
                    )}
                  >
                    {cta}
                    {highlight && <ArrowRight className="h-4 w-4" />}
                  </button>
                )}

                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          "h-4 w-4 mt-0.5 shrink-0",
                          highlight ? "text-emerald-300" : "text-emerald-500"
                        )}
                      />
                      <span className={cn("text-sm", highlight ? "text-blue-100" : "text-slate-600")}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {notIncluded?.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 opacity-40">
                      <div className="h-4 w-4 mt-0.5 shrink-0 flex items-center justify-center">
                        <div className="h-px w-3 bg-slate-400" />
                      </div>
                      <span className="text-sm text-slate-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            All paid plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
        </section>

        {/* What's always free */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-slate-900 mb-4">What's always free</h2>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-6 py-5">
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {[
                "Unlimited AI compliance questions",
                "City & state permit guidance",
                "Saved compliance checklist",
                "Business profile storage",
                "Renewal reminder notifications",
                "Mobile app (iOS + Android)",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Pricing FAQ</h2>
          <div className="space-y-4">
            {faqItems.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-slate-200 px-5 py-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1.5">{q}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-slate-900 px-8 py-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Try it free — no credit card needed</h2>
          <p className="text-slate-400 text-sm mb-6">
            Ask your first compliance question in under 60 seconds.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors pointer-events-auto"
          >
            Start Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </InnerPageLayout>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
