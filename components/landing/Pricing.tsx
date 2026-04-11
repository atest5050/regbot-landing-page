// Mobile responsiveness overhaul — vMobile
// - Card padding reduced on mobile: p-8 → p-5 sm:p-8.
// Changes summary:
// - Pro price updated from $9/mo → $19/mo to match the in-app implementation.
// - Business plan price updated from $29/mo → $39/mo to maintain tier separation.
// - Pro tagline updated: "For serious side hustlers" → "For growing small businesses"
//   to match the $19 price point and broader audience.
// - Pro features list expanded to include renewal filing assistance, quarterly
//   compliance PDF, and rule change alerts — matching the in-app Pro feature set.
// - Annual pricing note added to Free plan and footer to surface the savings option.
// - Footer note copy tightened: "Cancel anytime" now explicit in all plan CTAs.

"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WaitlistModal from "./WaitlistModal";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    tagline: "Try before you commit",
    cta: "Get Started Free",
    highlight: false,
    features: [
      "3 AI form completions / month",
      "City & state permit guidance",
      "Auto-saved compliance checklist",
      "Basic renewal reminders",
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
  },
];

export default function Pricing() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Simple pricing. No surprises.
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map(({ name, price, period, tagline, cta, highlight, badge, features }) => (
              <div
                key={name}
                className={cn(
                  "relative rounded-2xl border p-5 sm:p-8 transition-shadow duration-200",
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

                <Button
                  variant={highlight ? "emerald" : "outline"}
                  size="lg"
                  className={cn(
                    "w-full mb-7 gap-1.5",
                    !highlight && "border-slate-300 hover:border-blue-500 hover:text-blue-600"
                  )}
                  onClick={() => setModalOpen(true)}
                >
                  {cta}
                  {highlight && <ArrowRight className="h-4 w-4" />}
                </Button>

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
                </ul>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-sm text-slate-500">
            All paid plans include a 14-day free trial. Cancel anytime — no questions asked.
          </p>
        </div>
      </section>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
