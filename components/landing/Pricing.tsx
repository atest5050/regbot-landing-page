"use client";

import { useState } from "react";
import { Check } from "lucide-react";
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
      "Limited queries (5/month)",
      "City & state guidance",
      "Basic permit information",
      "Community resources",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    tagline: "For serious side hustlers",
    cta: "Start Pro Trial",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited questions",
      "Personalized checklists",
      "Law change alerts",
      "Saved chat history",
      "Direct links to official forms",
      "Priority email support",
    ],
  },
  {
    name: "Business",
    price: "$29",
    period: "/mo",
    tagline: "For growing operations",
    cta: "Start Business Trial",
    highlight: false,
    features: [
      "Everything in Pro",
      "Document analysis & review",
      "Multi-location support",
      "Team member access (up to 3)",
      "API access (coming soon)",
      "Priority support",
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
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Simple pricing. No surprises.
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Start free. Upgrade when you need more.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map(({ name, price, period, tagline, cta, highlight, badge, features }) => (
              <div
                key={name}
                className={cn(
                  "relative rounded-2xl border p-8 transition-shadow duration-200",
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
                  <p className={cn("mt-2 text-sm", highlight ? "text-blue-200" : "text-slate-500")}>
                    {tagline}
                  </p>
                </div>

                <Button
                  variant={highlight ? "emerald" : "outline"}
                  size="lg"
                  className={cn("w-full mb-7", !highlight && "border-slate-300 hover:border-blue-500 hover:text-blue-600")}
                  onClick={() => setModalOpen(true)}
                >
                  {cta}
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
            14-day Pro trial on all paid plans. Cancel anytime. No questions asked.
          </p>
        </div>
      </section>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
