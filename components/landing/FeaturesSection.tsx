import { MessageSquare, ClipboardList, FileSearch, Bell, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Instant Local Answers",
    description:
      "Ask about permits, licenses, zoning, health codes, or labor rules — for your exact city and business type. No generic answers. No outdated PDFs.",
  },
  {
    icon: ClipboardList,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Personalized Checklists",
    description:
      "Get a step-by-step compliance checklist built for your business, with direct links to official forms, filing deadlines, and fee amounts.",
  },
  {
    icon: FileSearch,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Document Review",
    description:
      "Upload a lease, vendor contract, or permit application. RegBot flags potential issues, explains the jargon, and tells you what to ask before you sign.",
  },
  {
    icon: Bell,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Law Change Alerts",
    description:
      "RegBot monitors the ordinances that affect your business. Get a heads-up when something changes — before it becomes your problem.",
  },
  {
    icon: Scale,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "Honest, Sourced Answers",
    description:
      "Every answer includes the relevant law, ordinance, or regulation it's based on — so you can verify yourself. And we always flag when you need a real attorney.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Everything you need to stay compliant and stay open.
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Built for the way small business owners actually work.
          </p>
        </div>

        {/* Feature grid — 2 cols on tablet, 3 on desktop, last card centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, bg, title, description }) => (
            <Card
              key={title}
              className="border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <CardContent className="p-7">
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg} mb-5`}
                >
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
