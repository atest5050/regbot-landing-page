// Changes summary:
// - New component: "Why Small Businesses Choose RegBot" comparative matrix.
//   Inserted between DemoTeaser and FeaturesSection on the landing page.
// - Table compares RegBot against LegalZoom, MyCorporation, and Generic AI across
//   7 dimensions: local accuracy, AI form filling, renewal reminders, health score,
//   rule change alerts, pricing, and best-fit use case.
// - RegBot column is visually distinguished with a blue header and a subtle blue-50
//   background on every row so the eye lands on it first.
// - Responsive: horizontally scrollable on mobile so the table never breaks layout.
// - Alternating row shading added for readability without visual weight.
// - Section uses a neutral slate-50 background band to visually separate it from
//   the sections above and below.

import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

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

function CompetitorCell({ text }: { text: string }) {
  const isNo = text === "No" || text === "Poor";
  return (
    <td className="px-4 py-5 text-center">
      {isNo ? (
        <span className="inline-flex items-center justify-center gap-1 text-sm text-slate-400">
          <XCircle className="h-4 w-4 text-slate-300 shrink-0" />
          {text}
        </span>
      ) : (
        <span className="text-sm text-slate-500">{text}</span>
      )}
    </td>
  );
}

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
            Why Small Businesses Choose RegBot
          </h2>
        </div>

        {/* Table — scrolls horizontally on small screens */}
        <div className="overflow-x-auto rounded-2xl shadow-sm ring-1 ring-slate-200">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="border-b border-slate-200">
                {/* Feature column */}
                <th className="px-6 py-5 text-left text-sm font-medium text-slate-500 min-w-[200px]">
                  Feature
                </th>
                {/* RegBot column — highlighted */}
                <th className="px-6 py-5 text-center min-w-[150px] bg-blue-600">
                  <span className="text-sm font-semibold text-white">RegBot</span>
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
                  {/* Feature label */}
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">
                    {row.feature}
                  </td>

                  {/* RegBot cell — always blue-50 tint */}
                  <td className="px-6 py-5 text-center bg-blue-50/70">
                    {row.regbot.positive === true ? (
                      <span className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-green-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {row.regbot.text}
                      </span>
                    ) : row.regbot.positive === "neutral" ? (
                      <span className="text-sm font-semibold text-blue-700">
                        {row.regbot.text}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-600">{row.regbot.text}</span>
                    )}
                  </td>

                  <CompetitorCell text={row.legalzoom} />
                  <CompetitorCell text={row.mycorporation} />
                  <CompetitorCell text={row.genericAi} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-500 mt-8 leading-relaxed">
          RegBot is built for small businesses that need to{" "}
          <span className="font-medium text-slate-700">
            stay compliant every day
          </span>
          , not just file paperwork once.
        </p>
      </div>
    </section>
  );
}
