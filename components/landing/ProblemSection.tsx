import { Search, DollarSign, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const problems = [
  {
    icon: Search,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    title: "The Google Rabbit Hole",
    body: "You've spent hours digging through outdated PDFs on your county website. Half the links are broken. The other half contradict each other. You still don't know if you're even allowed to operate.",
  },
  {
    icon: DollarSign,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    title: "Lawyers Are a Luxury",
    body: "A simple zoning question shouldn't cost $300/hr. But winging it could mean a fine, a shutdown, or starting over. There has to be a better way.",
  },
  {
    icon: Bell,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    title: "Rules Change Without Warning",
    body: "Your city updated its cottage food rules last spring. You found out when it almost cost you your license. Staying current shouldn't be a full-time job.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            The compliance maze shouldn&apos;t be your problem.
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            But for most small business owners, it is. Here&apos;s what that
            looks like.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map(({ icon: Icon, iconColor, iconBg, title, body }) => (
            <Card
              key={title}
              className="border-slate-200 hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-8">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} mb-5`}
                >
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
