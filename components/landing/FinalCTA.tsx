// Changes summary:
// - New component: closing CTA section placed between FAQ and Footer.
// - Uses a gradient background that echoes the hero, creating visual bookends.
// - Three concise benefit bullets reinforce the top three value drivers right
//   before the user decides to sign up or leave.
// - Primary CTA opens the existing WaitlistModal — no new state needed.
// - "No spam. Cancel anytime." micro-copy keeps friction low.
// - Fully responsive: stacks on mobile, side-by-side on md+.

"use client";

import { useState } from "react";
import { ArrowRight, RefreshCw, Activity, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaitlistModal from "./WaitlistModal";

const benefits = [
  {
    icon: Activity,
    text: "Know your compliance score before an inspector does.",
  },
  {
    icon: RefreshCw,
    text: "Never miss a permit renewal — automated reminders keep you covered.",
  },
  {
    icon: Zap,
    text: "Get alerted when local rules change, before they affect your business.",
  },
];

export default function FinalCTA() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="gradient-hero py-20 sm:py-28 border-t border-slate-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-12">
            {/* Left: copy */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
                Get started today
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Compliance shouldn&apos;t keep you up at night.
              </h2>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                Join 500+ small business owners who use RegBot to stay ahead of
                permits, deadlines, and rule changes — without lawyers or guesswork.
              </p>

              {/* Benefit list */}
              <ul className="mt-8 space-y-3">
                {benefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Icon className="h-3.5 w-3.5 text-blue-600" />
                    </span>
                    <span className="text-sm text-slate-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CTA card */}
            <div className="md:w-80 shrink-0">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-100/60 text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Join the waitlist
                </p>
                <p className="text-3xl font-bold text-slate-900 mb-1">Free to start</p>
                <p className="text-sm text-slate-400 mb-6">
                  First 1,000 members get free lifetime access
                </p>

                <Button
                  size="lg"
                  className="w-full gap-2 shadow-sm"
                  onClick={() => setModalOpen(true)}
                >
                  Join the Waitlist – Get Early Access
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="mt-4 text-xs text-slate-400">
                  No spam. No credit card. Cancel anytime.
                </p>

                {/* Mini social proof */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="flex -space-x-1.5">
                    {["bg-blue-500", "bg-emerald-500", "bg-violet-500"].map((c, i) => (
                      <span
                        key={i}
                        className={`h-5 w-5 rounded-full ${c} ring-2 ring-white`}
                      />
                    ))}
                  </span>
                  <span>500+ small business owners waiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
