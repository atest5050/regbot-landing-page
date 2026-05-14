"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FormsLibrary from "@/components/FormsLibrary";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

const DARK_KEY = "rp-dark-mode";

function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  try { return !!(window as unknown as Record<string, unknown>).Capacitor; } catch { return false; }
}

export default function FormsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsDarkMode(localStorage.getItem(DARK_KEY) === "1");
    setIsNative(isCapacitorNative());
  }, []);

  // Native iOS: strip web Navbar/Footer and use a compact mobile header
  if (isNative) {
    return (
      <div
        className={`min-h-dvh flex flex-col${isDarkMode ? " dark" : ""}`}
        style={{ background: isDarkMode ? "#0a121c" : "#f8fafc" }}
      >
        {/* Compact native header */}
        <div
          style={{
            paddingTop: "env(safe-area-inset-top)",
            background: isDarkMode ? "#0f1823" : "#ffffff",
            borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: `calc(env(safe-area-inset-top) + 12px) 16px 12px`,
          }}
        >
          <Link
            href="/chat"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              color: "#3b82f6", fontWeight: 600, fontSize: 15,
              textDecoration: "none", minHeight: 44, padding: "8px 4px",
            }}
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <FileText size={18} color={isDarkMode ? "#60a5fa" : "#3b82f6"} />
            <span style={{ fontWeight: 700, fontSize: 17, color: isDarkMode ? "#f1f5f9" : "#0f172a" }}>
              Forms Library
            </span>
          </div>
          {/* spacer to balance the Back button */}
          <div style={{ width: 52 }} />
        </div>

        {/* Disclaimer strip */}
        <div style={{
          margin: "12px 16px 0",
          borderRadius: 12,
          background: isDarkMode ? "rgba(251,191,36,0.1)" : "#fffbeb",
          border: `1px solid ${isDarkMode ? "rgba(251,191,36,0.25)" : "#fde68a"}`,
          padding: "10px 14px",
          fontSize: 12,
          color: isDarkMode ? "#fbbf24" : "#92400e",
          lineHeight: 1.5,
        }}>
          <strong>Heads up:</strong> Form availability varies by state and locality. Always verify with the issuing agency.
        </div>

        {/* Forms Library body — full width, no extra horizontal padding */}
        <main style={{ flex: 1, paddingBottom: "env(safe-area-inset-bottom)", background: isDarkMode ? "#0a121c" : "#f8fafc" }}>
          <div style={{ maxWidth: "100%", padding: "0 0 24px" }}>
            <FormsLibrary fullPage />
          </div>
        </main>
      </div>
    );
  }

  // Web: standard layout with Navbar/Footer
  return (
    <div className={`min-h-dvh flex flex-col${isDarkMode ? " dark" : ""} bg-white dark:bg-[#0a121c]`}>
      <Navbar />

      <div className="bg-gradient-to-b from-slate-50 dark:from-[#0f1823] to-white dark:to-[#0a121c] pt-28 pb-10 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 mb-5">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
            Forms Library
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Browse, download, and track the federal and state compliance forms your business needs — all in one place.
          </p>
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

      <main className="flex-1 bg-white dark:bg-[#0a121c]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-5 py-3 text-sm text-amber-800 dark:text-amber-300 leading-relaxed mb-8">
            <strong>Heads up:</strong> Form availability and requirements vary by state and locality.
            Always verify current requirements with the issuing government agency before filing.
          </div>
          <FormsLibrary fullPage />
        </div>
      </main>

      <Footer />
    </div>
  );
}
