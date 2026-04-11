// vMobile-global-scale-fix — Applied proper mobile scaling to all links and buttons
//   "See how it works" secondary link: added inline-flex items-center min-h-[44px] py-3 px-2
//   so it meets the 44 px minimum touch target on phones without changing its visual appearance.
// Changes summary:
// - Headline rewritten to lead with pain + relief, more punchy and scannable.
// - Subheadline condensed from a long list to two focused benefit sentences.
// - "No spam. Unsubscribe anytime." trust micro-copy added directly under the
//   primary CTA button so the reassurance is visible without opening the modal.
// - Eyebrow badge updated to include a count and urgency signal.
// - Trust signal row reordered: waitlist count first (social proof), then
//   "No credit card" and "Cancel anytime" to reduce friction.

"use client";

import { useState } from "react";
import { ArrowRight, Users, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WaitlistModal from "./WaitlistModal";

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative gradient-hero pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Subtle dot-grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #2563EB 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="mb-6 flex justify-center">
            <Badge variant="default" className="gap-1.5 px-4 py-1.5 text-xs font-medium">
              <Star className="h-3 w-3 fill-current" />
              Early access open — 500+ business owners already in
            </Badge>
          </div>

          {/* Headline — Option C */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
            Stop guessing local rules.{" "}
            <span className="text-gradient">
              Get the exact permits your business needs.
            </span>
          </h1>

          {/* Subheadline — tight, two sentences */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            RegPulse gives food trucks, home bakers, Etsy sellers, and side
            hustlers hyper-local permit checklists and AI-filled government forms
            — without lawyers, PDFs, or rabbit holes.
          </p>

          {/* Primary CTA + micro-trust */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              size="xl"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-100"
            >
              Join the Waitlist – Get Early Access
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-slate-300" />
              No spam. Unsubscribe anytime.
            </p>
          </div>

          {/* Secondary CTA — vMobile-global-scale-fix: inline-flex + min-h-[44px] + py-3
              gives a proper 44 px touch target without changing the visual text style.    */}
          <div className="mt-1 flex justify-center">
            <a
              href="#demo"
              className="inline-flex items-center min-h-[44px] py-3 px-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              See how it works ↓
            </a>
          </div>

          {/* Social proof row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-500 shrink-0" />
              500+ on the waitlist
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span>No credit card required</span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span>Free to start</span>
          </div>
        </div>
      </section>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
