import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "RegBot saved me from a $2,000 fine on my cottage food setup. I had no idea I needed a separate county permit on top of the state registration. Found out in 2 minutes. Absolute lifesaver.",
    name: "Sarah K.",
    title: "Austin, TX · Home baker & Etsy seller",
    initials: "SK",
    color: "bg-blue-600",
  },
  {
    quote:
      "Food truck regulations in Chicago are a maze — commissary requirements, event permits, health inspection timelines. RegBot keeps track of all of it. It's like having a compliance person on staff.",
    name: "Marcus T.",
    title: "Chicago, IL · Food truck operator",
    initials: "MT",
    color: "bg-emerald-600",
  },
  {
    quote:
      "I didn't know I needed a city business license even for a service business I run from my laptop. RegBot flagged it before I got hit. For $9/month it's the most practical thing I spend money on.",
    name: "Priya M.",
    title: "San Jose, CA · Freelance bookkeeper",
    initials: "PM",
    color: "bg-violet-600",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Real businesses. Real results.
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Small business owners who stopped guessing and started growing.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, title, initials, color }) => (
            <Card
              key={name}
              className="border-slate-200 hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-8 flex flex-col gap-5">
                <StarRating />
                <blockquote className="text-sm text-slate-700 leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color} text-white text-xs font-bold`}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Disclaimer note */}
        <p className="mt-8 text-center text-xs text-slate-400">
          * Testimonials are representative of expected user experiences. Individual results may vary.
        </p>
      </div>
    </section>
  );
}
