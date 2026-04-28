// vUnified-20260414-national-expansion-v140 — FirstTimeOnboarding: nuclear inline styles, forced visibility.
//
// v136 finding: OnboardingFlow content invisible — solid dark blue — because OnboardingFlow's
//   internal `entered` state starts as `false` (opacity=0) and the 30ms setTimeout to set
//   entered=true races on WKWebView concurrent mode and was not committed. The debug label
//   "FIRST-TIME v136 — ONBOARDING DIRECT" was visible (bottom bar, zIndex:301) but the
//   OnboardingFlow container itself stayed at opacity:0.
//
// v137 FIX (two layers):
//   1. This wrapper div: position:fixed, inset:0, z-300, full navy background, flex, visible.
//      Provides a visible background + layout context independent of OnboardingFlow opacity.
//      Even if OnboardingFlow is still opacity:0 for any reason, the wrapper shows the navy BG.
//   2. OnboardingFlow: `entered` initialises to `visible` (true), not false.
//      opacity = visible && entered = 1 && 1 = 1 on first render. No timer dependency.
//
// handleComplete: writes storage flags + window.location.replace (no React state, no phase).
// Used ONLY when IS_CAPACITOR_BUILD=true and isOnboarded=false.

"use client";

import OnboardingFlow, { type OnboardingTier } from "@/components/OnboardingFlow";

export default function FirstTimeOnboarding() {
  console.log("[v140][FirstTimeOnboarding] render");

  function handleComplete(tier: OnboardingTier) {
    console.log("[v140][FirstTimeOnboarding] handleComplete — tier:", tier);
    try { localStorage.setItem("rp_onboarded_v1", "1"); } catch (_) {}
    try { sessionStorage.setItem("rp_skip_splash", "1"); } catch (_) {}
    try { sessionStorage.setItem("rp_onboarded_v1", "1"); } catch (_) {}
    // Clean URLs — no query params. Matches returning-user path that has always worked.
    // rp_onboarded_v1 + rp_skip_splash in localStorage are read by Layer 0 before React hydrates.
    window.location.replace(tier === "pro" ? "/chat/?tier=pro" : "/chat/");
  }

  return (
    // vUnified-20260414-national-expansion-v139 — nuclear inline styles.
    // Every visibility property explicitly set. No Tailwind dependency.
    // z-300 matches OnboardingFlow; this wrapper guarantees background+layout regardless of
    // OnboardingFlow's internal opacity. opacity:1 + visibility:visible prevents any
    // compositor or cascaded-style override from hiding this layer.
    <div
      style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0, left: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        pointerEvents: "auto",
        visibility: "visible",
        opacity: 1,
        background: "radial-gradient(ellipse at 50% 20%, #0d2450 0%, #0b1830 50%, #060e1c 100%)",
        willChange: "transform",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)" as React.CSSProperties["WebkitTransform"],
        WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
        backfaceVisibility: "hidden",
      }}
    >
      {/* Document-level dark background — shows through between boot layer fade and OnboardingFlow */}
      <style>{`html,body{background:radial-gradient(ellipse at 50% 38%,#0d2450 0%,#0b1830 48%,#0b1e3f 100%)!important;min-height:100%}`}</style>

      <OnboardingFlow visible={true} onComplete={handleComplete} />

      {/* vUnified-20260414-national-expansion-v140 — debug: first-time forced visibility confirmed */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 499,
          textAlign: "center",
          paddingTop: 4,
          paddingBottom: "max(4px, env(safe-area-inset-bottom, 4px))",
          background: "rgba(6,14,28,0.85)",
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "rgba(34,211,238,0.7)", fontSize: 10, fontFamily: "ui-monospace,'SF Mono',monospace", fontWeight: 700 }}>
          FIRST-TIME v140 — ONBOARDING FORCED
        </span>
      </div>
    </div>
  );
}
