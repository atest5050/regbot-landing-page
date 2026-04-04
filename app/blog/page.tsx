import InnerPageLayout from "@/components/landing/InnerPageLayout";
import WaitlistModal from "@/components/landing/WaitlistModal";

// Server component — WaitlistModal needs client interactivity, so isolate it.
import BlogCTA from "./BlogCTA";

const upcomingTopics = [
  "The 7 permits food trucks forget (and what happens when they do)",
  "Cottage food laws by state: a complete 2025 guide",
  "DBA vs LLC vs Sole Proprietor — what actually matters for local compliance",
  "Why your city's business license is not the same as your state registration",
  "The hidden renewal calendar: permits most small businesses let lapse",
  "How to read a zoning code without a law degree",
  "Sales tax registration: which states require it for online sellers",
  "Home-based business permits: what your HOA can (and can't) do",
];

export default function BlogPage() {
  return (
    <InnerPageLayout
      title="RegPulse Blog"
      subtitle="Plain-English guides on permits, compliance, and running a business by the rules."
    >
      {/* Coming soon card */}
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-8 py-12 text-center mb-12">
        <p className="text-4xl mb-4">✍️</p>
        <h2 className="text-xl font-bold text-slate-900 mb-2">First posts dropping soon</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
          We are writing in-depth, city-specific guides to the compliance questions real small
          business owners actually Google at 11 pm. Join the waitlist to get them in your inbox
          the moment they publish.
        </p>
        <BlogCTA />
      </div>

      {/* Upcoming topics */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Topics on the way</h2>
        <ul className="space-y-3">
          {upcomingTopics.map((topic) => (
            <li key={topic} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {topic}
            </li>
          ))}
        </ul>
      </section>
    </InnerPageLayout>
  );
}
