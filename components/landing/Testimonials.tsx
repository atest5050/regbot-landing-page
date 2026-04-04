// Changes summary:
// - Full rewrite of the prior Testimonials component (which used @/components/ui/card,
//   had 3 personas, no waitlist CTA, and was placed after FeaturesSection).
// - Now "use client" for the WaitlistModal state toggle.
// - Section title changed to "What Early Users Are Saying" per spec.
// - Four testimonials with the requested personas: food truck owner, home baker,
//   Etsy seller, general side hustler — each focused on a concrete pain-relief moment.
// - Cards use plain divs (ring-1, rounded-xl, shadow-sm) consistent with
//   ComparisonMatrix styling — no @/components/ui/card dependency.
// - Responsive grid: 1 col mobile → 2 col sm → 2 col md → grid auto-fit up to 4 cards.
//   Practically: 1 col < sm, 2 col sm–lg, then a centered 2×2 or 4-across on xl.
//   Using grid-cols-1 sm:grid-cols-2 with max-w-4xl so the 4-card layout stays tight.
// - Each card: five-star rating row, italic blockquote, avatar initial circle + name/role.
// - Bottom strip: "Join 500+ small business owners" count + waitlist CTA button.
// - Placed in app/page.tsx immediately after <ComparisonMatrix /> and before
//   <FeaturesSection /> (moved from its prior position after FeaturesSection).

"use client";

import { useState } from "react";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaitlistModal from "./WaitlistModal";

const testimonials: {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}[] = [
  {
    quote:
      "I had no idea I needed a separate county health permit on top of my city mobile vendor license. RegPulse caught it in two minutes. Saved me from a shutdown during my busiest weekend.",
    name: "Marcus T.",
    role: "Food Truck Owner · Chicago, IL",
    initials: "MT",
    color: "bg-emerald-600",
  },
  {
    quote:
      "Cottage food rules are different in every county and they change constantly. RegPulse told me exactly which labels and permits I needed — and sent me a reminder when my annual registration was due.",
    name: "Sarah K.",
    role: "Home Baker · Austin, TX",
    initials: "SK",
    color: "bg-blue-600",
  },
  {
    quote:
      "I'd been selling on Etsy for two years and had no idea I owed city business tax on top of state sales tax. RegPulse walked me through the exact filings for my zip code. Total game changer.",
    name: "Priya M.",
    role: "Etsy Seller · Portland, OR",
    initials: "PM",
    color: "bg-violet-600",
  },
  {
    quote:
      "RegPulse is like having a compliance expert in your pocket. I used to dread the \"am I actually legal?\" question every time I took on a new client. Now I just check RegPulse.",
    name: "Devon R.",
    role: "Freelance Designer · Nashville, TN",
    initials: "DR",
    color: "bg-amber-600",
  },
];

function StarRow() {
  return (
    <div className="flex gap-0.5" aria-label="5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6">
          {/* Heading */}
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Social Proof
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              What Early Users Are Saying
            </h2>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {testimonials.map(({ quote, name, role, initials, color }) => (
              <div
                key={name}
                className="flex flex-col gap-4 rounded-xl ring-1 ring-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <StarRow />

                <blockquote className="flex-1 text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-white text-xs font-bold`}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-slate-500">
              Join{" "}
              <span className="font-semibold text-slate-700">
                500+ small business owners
              </span>{" "}
              on the waitlist — free to start.
            </p>
            <Button
              size="lg"
              className="gap-2 shadow-sm"
              onClick={() => setModalOpen(true)}
            >
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-slate-400">No spam. No credit card required.</p>
          </div>

          {/* Fine print */}
          <p className="mt-8 text-center text-[11px] text-slate-300 leading-relaxed">
            Testimonials are representative of expected user experiences. Individual results may vary.
          </p>
        </div>
      </section>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
