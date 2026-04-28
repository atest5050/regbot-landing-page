// vUnified-platform-fix: Forms Library now fully dark when opened from Settings or directly
// - Converted to a client component so it reads the shared "rp-dark-mode" localStorage key
//   and applies the `.dark` class to the root div — exactly the same pattern as chat/page.tsx
//   and settings/page.tsx — activating all dark: variants inside FormsLibrary.tsx.
// - FormsLibrary.tsx already has full dark: variant coverage added in this session;
//   this page just needs to supply the `.dark` ancestor for those variants to activate.
// - metadata export removed from here (moved to a separate layout/metadata file below)
//   because Next.js App Router does not allow metadata exports in "use client" components.

"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormsLibrary from "@/components/FormsLibrary";
import { FileText } from "lucide-react";
import Link from "next/link";

const DARK_KEY = "rp-dark-mode";

export default function FormsPage() {
  // vUnified-platform-fix: read the shared dark-mode preference so the forms
  // page respects whatever theme the user set in Settings / chat.
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem(DARK_KEY) === "1");
  }, []);

  return (
    // vUnified-platform-fix: `.dark` class on root activates dark: variants in FormsLibrary
    <div className={`min-h-dvh flex flex-col${isDarkMode ? " dark" : ""} bg-white dark:bg-[#0a121c]`}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-slate-50 dark:from-[#0f1823] to-white dark:to-[#0a121c] pt-28 pb-10 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          {/* Icon badge */}
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 mb-5">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
            Forms Library
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Browse, download, and track the federal and state compliance forms your business needs — all in one place.
          </p>

          {/* Back to chat CTA */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 min-h-[44px] py-3 px-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              ← Back to compliance assistant
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 bg-white dark:bg-[#0a121c]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

          {/* Info strip */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-5 py-3 text-sm text-amber-800 dark:text-amber-300 leading-relaxed mb-8">
            <strong>Heads up:</strong> Form availability and requirements vary by state and locality.
            Always verify current requirements with the issuing government agency before filing.
          </div>

          {/* Forms Library — fullPage variant; dark: variants activate from root `.dark` class */}
          <FormsLibrary fullPage />
        </div>
      </main>

      <Footer />
    </div>
  );
}
