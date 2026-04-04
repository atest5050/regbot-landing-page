// Changes summary:
// - Original: single horizontally-scrollable table on all screen sizes.
// - Mobile (below md): replaced table with stacked feature cards. Each card shows the
//   feature name, RegPulse's value prominently highlighted in a blue-tinted top band,
//   then the three competitor values below in a compact grid. Avoids any horizontal
//   scroll on small screens.
// - Desktop (md and up): original clean table retained; RegPulse column highlighted in
//   blue header + blue-50 row tint; alternating row shading; rounded card container.
// - Footer tagline preserved and already present from prior session.
// - No changes to data, icons, section heading, or app/page.tsx needed.

import { CheckCircle2, XCircle } from "lucide-react";

const rows: {
  feature: string;
  regbot: { text: string; positive: boolean | "neutral" };
  legalzoom: string;
  mycorporation: string;
  genericAi: string;
}[] = [
  {
    feature: "Hyper-local accuracy (city + county)",
    regbot: { text: "Excellent", positive: true },
    legalzoom: "Limited",
    mycorporation: "Limited",
    genericAi: "Poor",
  },
  {
    feature: "AI fills real government forms",
    regbot: { text: "Yes", positive: true },
    legalzoom: "Limited / Extra cost",
    mycorporation: "No",
    genericAi: "No",
  },
  {
    feature: "Renewal reminders & alerts",
    regbot: { text: "Yes", positive: true },
    legalzoom: "No",
    mycorporation: "No",
    genericAi: "No",
  },
  {
    feature: "Compliance Health Score",
    regbot: { text: "Yes", positive: true },
    legalzoom: "No",
    mycorporation: "No",
    genericAi: "No",
  },
  {
    feature: "Ongoing rule change alerts",
    regbot: { text: "Yes", positive: true },
    legalzoom: "No",
    mycorporation: "No",
    genericAi: "No",
  },
  {
    feature: "Price for ongoing use",
    regbot: { text: "$19/mo", positive: "neutral" },
    legalzoom: "$79–$299+ per service",
    mycorporation: "High per filing",
    genericAi: "Free but unreliable",
  },
  {
    feature: "Best for",
    regbot: { text: "Running the business daily", positive: true },
    legalzoom: "Forming the business",
    mycorporation: "Forming the business",
    genericAi: "Quick generic answers",
  },
];

// ── Shared helpers ────────────────────────────────────────────────────────────

function RegPulseValue({ value }: { value: (typeof rows)[0]["regbot"] }) {
  if (value.positive === true) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {value.text}
      </span>
    );
  }
  if (value.positive === "neutral") {
    return (
      <span className="text-sm font-semibold text-blue-700">{value.text}</span>
    );
  }
  return <span className="text-sm text-slate-600">{value.text}</span>;
}

function CompetitorText({ text }: { text: string }) {
  const isNegative = text === "No" || text === "Poor";
  if (isNegative) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-slate-400">
        <XCircle className="h-4 w-4 text-slate-300 shrink-0" />
        {text}
      </span>
    );
  }
  return <span className="text-sm text-slate-500">{text}</span>;
}

// ── Mobile card (shown below md) ─────────────────────────────────────────────

function FeatureCard({ row }: { row: (typeof rows)[0] }) {
  return (
    <div className="rounded-xl ring-1 ring-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Feature name */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {row.feature}
        </p>
      </div>

      {/* RegPulse value — prominent top band */}
      <div className="px-4 py-3 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
          RegPulse
        </span>
        <RegPulseValue value={row.regbot} />
      </div>

      {/* Competitor grid */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        {(
          [
            { label: "LegalZoom", value: row.legalzoom },
            { label: "MyCorp", value: row.mycorporation },
            { label: "Generic AI", value: row.genericAi },
          ] as const
        ).map(({ label, value }) => (
          <div key={label} className="px-2 py-3 flex flex-col items-center gap-1 text-center">
            <span className="text-[10px] font-medium text-slate-400 leading-none">
              {label}
            </span>
            <CompetitorText text={value} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Desktop table cell ────────────────────────────────────────────────────────

function CompetitorCell({ text }: { text: string }) {
  return (
    <td className="px-4 py-5 text-center">
      <CompetitorText text={text} />
    </td>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ComparisonMatrix() {
  return (
    <section className="bg-slate-50 py-20 border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            How We Compare
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">
            Why Small Businesses Choose RegPulse
          </h2>
        </div>

        {/* ── Mobile: stacked cards (hidden on md+) ── */}
        <div className="md:hidden space-y-3">
          {rows.map((row) => (
            <FeatureCard key={row.feature} row={row} />
          ))}
        </div>

        {/* ── Desktop: table (hidden below md) ── */}
        <div className="hidden md:block overflow-x-auto rounded-2xl shadow-sm ring-1 ring-slate-200">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-5 text-left text-sm font-medium text-slate-500 min-w-[200px]">
                  Feature
                </th>
                <th className="px-6 py-5 text-center min-w-[150px] bg-blue-600">
                  <span className="text-sm font-semibold text-white">RegPulse</span>
                </th>
                <th className="px-4 py-5 text-center text-sm font-medium text-slate-500 min-w-[140px]">
                  LegalZoom
                </th>
                <th className="px-4 py-5 text-center text-sm font-medium text-slate-500 min-w-[150px]">
                  MyCorporation
                </th>
                <th className="px-4 py-5 text-center text-sm font-medium text-slate-500 min-w-[130px]">
                  Generic AI
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-slate-100 last:border-none ${
                    i % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">
                    {row.feature}
                  </td>
                  <td className="px-6 py-5 text-center bg-blue-50/70">
                    <RegPulseValue value={row.regbot} />
                  </td>
                  <CompetitorCell text={row.legalzoom} />
                  <CompetitorCell text={row.mycorporation} />
                  <CompetitorCell text={row.genericAi} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer tagline */}
        <p className="text-center text-sm text-slate-500 mt-8 leading-relaxed">
          RegPulse is built for small businesses that need to{" "}
          <span className="font-medium text-slate-700">
            stay compliant every day
          </span>
          , not just file paperwork once.
        </p>
      </div>
    </section>
  );
}
