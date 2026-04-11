// vMobile-global-scale-fix — Applied proper mobile scaling to all links and buttons
//   "Back to compliance assistant" link: added min-h-[44px] inline-flex items-center py-3 px-3
//   so it meets the 44px minimum touch target on phones.
//   min-h-screen → min-h-dvh: avoids iOS Safari address-bar gap on full-viewport layout.
// app/forms/page.tsx — v22: Full Dedicated Forms Library Page
//
// A standalone public route at /forms that renders the complete Forms Library
// with a responsive card grid, search, and category filtering.
//
// Layout: custom shell (Navbar + Footer) with a wider max-w-6xl body to
// accommodate the 2–3 column card grid — wider than InnerPageLayout's max-w-3xl.
//
// Uses FormsLibrary with fullPage={true} for the larger card variant.
// Download tracking (v21) works via the shared localStorage helpers.

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormsLibrary from "@/components/FormsLibrary";
import { FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Forms Library — RegPulse",
  description:
    "Browse and download blank federal and state business compliance forms — SS-4, I-9, BOI report, sales tax registration, annual report, and more.",
};

export default function FormsPage() {
  return (
    // vMobile-global-scale-fix: min-h-dvh instead of min-h-screen (avoids iOS address-bar gap)
    <div className="min-h-dvh flex flex-col bg-white">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-slate-50 to-white pt-28 pb-10 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          {/* Icon badge */}
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 mb-5">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Forms Library
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            Browse, download, and track the federal and state compliance forms your business needs — all in one place.
          </p>

          {/* Back to chat CTA — vMobile-global-scale-fix: min-h-[44px] touch target */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 min-h-[44px] py-3 px-3 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
            >
              ← Back to compliance assistant
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

          {/* Info strip */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-3 text-sm text-amber-800 leading-relaxed mb-8">
            <strong>Heads up:</strong> Form availability and requirements vary by state and locality.
            Always verify current requirements with the issuing government agency before filing.
          </div>

          {/* Forms Library — fullPage variant */}
          <FormsLibrary fullPage />
        </div>
      </main>

      <Footer />
    </div>
  );
}
