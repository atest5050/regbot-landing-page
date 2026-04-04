import InnerPageLayout from "@/components/landing/InnerPageLayout";
import { Shield, Users, MapPin, Zap } from "lucide-react";

const values = [
  {
    icon: Shield,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Accuracy over speed",
    body: "Every answer RegPulse gives is grounded in the actual local ordinance, state statute, or federal regulation — not a generic summary. We flag uncertainty honestly and always tell you when to consult an attorney.",
  },
  {
    icon: MapPin,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Hyper-local by design",
    body: "A food truck permit in Austin looks nothing like one in Chicago. RegPulse was built from the ground up to understand city-level, county-level, and state-level differences — because your business operates in one specific place.",
  },
  {
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Built for the people lawyers ignore",
    body: "Solo operators, side hustlers, home bakers, and micro-businesses can't afford a compliance attorney. We exist to close that gap — giving every small business owner the same quality of guidance that enterprise companies pay thousands for.",
  },
  {
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Transparent AI",
    body: "We show you exactly which law or ordinance each answer is based on so you can verify independently. AI should empower, not replace, human judgment — especially when fines or permits are on the line.",
  },
];

export default function AboutPage() {
  return (
    <InnerPageLayout
      title="About RegPulse"
      subtitle="We built the compliance co-pilot we wish existed when we were running small businesses ourselves."
    >
      {/* Mission */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Our mission</h2>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed mb-4">
            Navigating local business regulations is one of the most underestimated challenges in
            entrepreneurship. Which permits do you actually need? In which order? At what cost? The
            answer differs county by county, city by city — and it changes every year.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            RegPulse was created to give every small business owner — whether you run a food truck,
            an Etsy shop, a home bakery, or a freelance consultancy — access to the same caliber of
            compliance guidance that well-funded companies get from in-house legal teams.
          </p>
          <p className="text-slate-600 leading-relaxed">
            We do this through a combination of AI-powered hyper-local research, curated government
            data, and plain-English explanations that treat you as an intelligent adult who simply
            hasn't had time to read thousands of pages of city code.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-slate-900 mb-6">What we believe</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {values.map(({ icon: Icon, color, bg, title, body }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-4`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer strip */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-6 py-4 text-sm text-amber-800 leading-relaxed">
        <strong>A note on limitations:</strong> RegPulse is an AI tool, not a law firm. Our
        information is a starting point, not a final answer. Always verify requirements with the
        issuing government agency and consult a licensed attorney for legal advice specific to your
        situation.
      </div>
    </InnerPageLayout>
  );
}
