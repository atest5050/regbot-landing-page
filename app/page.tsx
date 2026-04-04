// Changes summary:
// - FinalCTA component added between FAQ and Footer — creates a strong closing
//   conversion moment after the user has read through the full page.
// - Testimonials moved to immediately after ComparisonMatrix and before FeaturesSection
//   so social proof appears while the competitive argument is fresh in the reader's mind.
// - Page flow is now:
//     Hero → ProblemSection → DemoTeaser → ComparisonMatrix →
//     Testimonials → FeaturesSection → Pricing → FAQ → FinalCTA → Footer
// - Hero, Pricing, and FinalCTA all have the same WaitlistModal trigger so the
//   user can convert at any point in the scroll without hunting for a CTA.

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import DemoTeaser from "@/components/landing/DemoTeaser";
import ComparisonMatrix from "@/components/landing/ComparisonMatrix";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hook — pain + relief, primary CTA */}
        <Hero />
        {/* 2. Problem — three vivid pain points that validate the reader's experience */}
        <ProblemSection />
        {/* 3. Solution demo — show, don't just tell */}
        <DemoTeaser />
        {/* 4. Competitive differentiation — why RegBot vs alternatives */}
        <ComparisonMatrix />
        {/* 5. Social proof — validate the argument while competitive contrast is fresh */}
        <Testimonials />
        {/* 6. Features — the full capability set */}
        <FeaturesSection />
        {/* 7. Pricing — simple, transparent, remove the final objection */}
        <Pricing />
        {/* 8. FAQ — handle hesitations before they become exit clicks */}
        <FAQ />
        {/* 9. Final CTA — last chance to convert before the footer */}
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
