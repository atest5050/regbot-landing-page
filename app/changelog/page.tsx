import InnerPageLayout from "@/components/landing/InnerPageLayout";

interface Release {
  version: string;
  date: string;
  tag: "new" | "improved" | "fix";
  changes: string[];
}

const releases: Release[] = [
  {
    version: "0.9.0",
    date: "April 2025",
    tag: "new",
    changes: [
      "Add Business modal: import pre-existing businesses with permit history and renewal dates auto-calculated",
      "Business switcher in the compliance dashboard sidebar — switch between all saved businesses in one click",
      "Active business context shown in the chat header so the scope of every conversation is always visible",
      "FormFiller: primary PDF auto-fill flow — downloads official government PDF, extracts AcroForm fields, fills them with your answers, and delivers the completed file for download",
      "FormFiller: pdf-fallback phase with a step-by-step manual completion guide when auto-fill is not possible",
      "Smart location sync: switching to a saved business automatically scopes the location, chat, and FormFiller to that business",
    ],
  },
  {
    version: "0.8.0",
    date: "March 2025",
    tag: "new",
    changes: [
      "RegPulse branding: full rebrand from RegBot, including new shield + EKG logomark with responsive stroke weight",
      "Responsive SVG logo: EKG line thickness scales with render size so the mark looks correct from 26 px to 64 px",
      "Google Analytics 4 with waitlist conversion event and UTM parameter attribution",
      "Testimonials section added to landing page with location-specific social proof",
      "ComparisonMatrix mobile layout: stacked feature cards on mobile, clean table on desktop",
    ],
  },
  {
    version: "0.7.0",
    date: "February 2025",
    tag: "new",
    changes: [
      "Supabase persistence: businesses, alerts, and monthly usage synced to the cloud for authenticated users",
      "Guest → authenticated migration: local data moves to Supabase on first sign-in without data loss",
      "Multi-business dashboard: save multiple business profiles and switch between them from the sidebar",
      "Compliance Health Score: SVG ring with colour-coded 0–100 score, pending item count, and expiring renewal count",
      "Upcoming Renewals section: all permit renewal dates surfaced with urgency colouring",
      "Rule Change Alerts: location-aware regulatory alerts generated per business per month",
    ],
  },
  {
    version: "0.6.0",
    date: "January 2025",
    tag: "improved",
    changes: [
      "County-level URL resolution for business licenses and home occupation permits in major FL counties, NYC boroughs, and Cook County IL",
      "GPS location parsing: handles unincorporated areas, full state names, and trailing whitespace from Nominatim",
      "isSbaFallback detection: disables the 'Official Site' button rather than linking to a generic SBA page when no local portal is known",
      "FormFiller: checkbox field type (Yes/No toggles) and OfficialFieldBadge cross-references",
      "Pro tier gating: Free tier capped at 3 AI form completions per month with upgrade CTA",
    ],
  },
  {
    version: "0.5.0",
    date: "December 2024",
    tag: "new",
    changes: [
      "FormFiller: guided Q&A session, field review summary, Stripe checkout for $5 completion fee",
      "50-state locale overrides for business-registration, fictitious-name, sales-tax-registration, food-service-permit, and mobile-food-vendor templates",
      "getSuggestedRenewalDate: location-specific renewal deadlines (e.g. Florida BTR always expires September 30)",
      "AI form completion queue: start all required forms in sequence with a single click",
      "Compliance packet PDF: download a branded summary of all completed forms with submission instructions",
    ],
  },
];

const tagStyles: Record<Release["tag"], string> = {
  new:      "bg-blue-50 text-blue-700 border border-blue-200",
  improved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  fix:      "bg-amber-50 text-amber-700 border border-amber-200",
};

export default function ChangelogPage() {
  return (
    <InnerPageLayout
      title="Changelog"
      subtitle="A running log of what ships in RegPulse — new features, improvements, and fixes."
    >
      <div className="space-y-10">
        {releases.map((rel) => (
          <div key={rel.version} className="relative pl-6 border-l-2 border-slate-100">
            {/* Version dot */}
            <span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-white ring-1 ring-blue-600" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">v{rel.version}</h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tagStyles[rel.tag]}`}>
                {rel.tag}
              </span>
              <span className="text-xs text-slate-400">{rel.date}</span>
            </div>

            {/* Changes */}
            <ul className="space-y-2">
              {rel.changes.map((change) => (
                <li key={change} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </InnerPageLayout>
  );
}
