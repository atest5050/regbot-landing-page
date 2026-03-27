"use client";

import { useState } from "react";
import { ArrowRight, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WaitlistModal from "./WaitlistModal";

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative gradient-hero pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Subtle background pattern */}
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
              Now in early access — join 500+ business owners
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
            Never guess your{" "}
            <span className="text-gradient">local regulations</span> again.
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            RegBot is your AI co-pilot for hyper-local permits, zoning, health
            codes, and compliance. Ask in plain English and get accurate, sourced
            answers with checklists and next steps — built specifically for Etsy
            sellers, home bakers, food trucks, consultants, and every side
            hustler tired of drowning in bureaucracy.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto gap-2"
            >
              Join the Waitlist – Get Early Access
              <ArrowRight className="h-4 w-4" />
            </Button>
            <a
              href="#demo"
              className="text-sm text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              See how it works ↓
            </a>
          </div>

          {/* Trust signal */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-500" />
              500+ on the waitlist
            </span>
            <span className="text-slate-300">·</span>
            <span>No credit card required</span>
            <span className="text-slate-300">·</span>
            <span>Free to start</span>
          </div>
        </div>
      </section>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
