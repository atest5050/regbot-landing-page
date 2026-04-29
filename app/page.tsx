// vUnified-20260428-v285-production-lock — chunk clean; CORS in every route; Info.plist fix.
// v276 ROOT CAUSE + FIX:
//   Every approach to window.location.replace('/chat/') caused SIGKILL 9 on physical iOS
//   because WKWebView terminates the web content process during document navigation when
//   the gesture-unwind pipeline has not fully resolved — regardless of deferral strategy.
//   FIX: eliminate navigation entirely. Button sets window.__rpStartFreeTriggered = true.
//   NativeApp useEffect watcher detects the flag (clean macrotask, no gesture lineage),
//   writes rp_ flags, then calls setShowChat(true). React renders <ChatPage /> directly
//   on the same document — zero window.location.replace, zero SIGKILL 9.
//
// v120 — Final chat handoff lock: immediate rp_skip_splash
//   hide via useLayoutEffect + dark base layer prevents white flash during fade.
//
// v119 ROOT CAUSE IDENTIFIED:
//   NativeApp returned ONLY <ControlledSplash> in phase='navigating' (no base layer behind it).
//   When ControlledSplash faded to opacity=0, the body background (white by default in Next.js
//   static export) showed through during the 400ms CSS transition. window.location.replace was
//   then called, but the 400ms gap between opacity=0 and navigation completing produced a visible
//   white flash. On /chat/, rp_skip_splash was checked in useEffect (post-paint) so AppSplashOverlay
//   was visible for at least one frame before hiding.
//
// v120 FIX:
//   1. NativeApp always renders a dark navy base layer (z-1) regardless of phase. When
//      ControlledSplash fades to opacity=0 the dark base layer shows through → no white flash.
//      React renders the base layer in the same commit as the phase change → zero gap.
//   2. handleNavSplashHide adds 50ms delay before window.location.replace to let React commit
//      the opacity=0 frame cleanly before WKWebView starts navigation.
//   3. /chat/page.tsx uses useLayoutEffect for rp_skip_splash: fires synchronously before first
//      paint → setSplashVisible(false) is committed before the browser paints → AppSplashOverlay
//      is at opacity=0 from the very first pixel → chat content immediately visible.
//
// NativeApp routing (v120):
//   Mount → phase='splash' → ControlledSplash 1200ms + dark base → handleLaunchSplashHide()
//     → isOnboarded=true  → rp_skip_splash + window.location('/chat/')
//     → isOnboarded=false → setPhase('onboarding') → FirstTimeOnboarding (+ dark base behind)
//   "Start Free": handleOnboardingComplete('free') → rp_onboarded_v1 + rp_skip_splash written
//     → setPhase('navigating') → ControlledSplash 800ms + dark base → handleNavSplashHide()
//     → 50ms → window.location('/chat/') — AppSplashOverlay hidden before first paint via
//     useLayoutEffect in /chat/.
//   No AppSplashOverlay in NativeApp. AppSplashOverlay retained for NativeGate (web build).
//
// Web deployment (Vercel): IS_CAPACITOR_BUILD=false → NativeGate renders null pre-paint.

"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import AppSplashOverlay from "@/components/AppSplashOverlay";
import OnboardingFlow, { type OnboardingTier } from "@/components/OnboardingFlow";
// vUnified-20260414-national-expansion-v141 — FirstTimeOnboarding removed from NativeApp path.
// NativeApp now renders OnboardingFlow directly (no wrapper layer, no extra state machine).
// ControlledSplash removed from NativeApp in v136 — first-time path uses no splash
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
import NativeRedirect from "@/components/NativeRedirect";
import ChatPage from "@/app/chat/page";

// vUnified-20260414-national-expansion-v276 — NativeApp renders OnboardingFlow or ChatPage directly.
// Free tier: button sets flag → useEffect watcher → setShowChat(true) → <ChatPage /> rendered
// in-place. Zero window.location.replace for free tier — eliminates SIGKILL 9 permanently.

// ── Build-time native flag ────────────────────────────────────────────────────
// Evaluated at compile time by Next.js — zero runtime overhead.
// true  → cap build (npm run build:cap): NEXT_PUBLIC_IS_CAPACITOR=true.
// false → web build (npm run build): renders LandingPage for Vercel / browsers.
const IS_CAPACITOR_BUILD = process.env.NEXT_PUBLIC_IS_CAPACITOR === "true";

// ── Runtime native detection (web builds only) ────────────────────────────────
// Belt-and-suspenders for the edge case where a native WKWebView loads the web
// build (Vercel URL opened in Capacitor WebView). Checks the same signals as the
// layout.tsx Layer 1 inline script.
function detectNativeRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as {
    Capacitor?: { isNativePlatform?: () => boolean };
    webkit?: { messageHandlers?: { bridge?: unknown } };
  };
  try {
    if (w.Capacitor?.isNativePlatform?.() === true) return true;
    if (window.location.protocol === "capacitor:") return true;
    const h = window.location.href;
    if (h.startsWith("capacitor://") || h.startsWith("RegPulse://")) return true;
    if (!!(w.webkit?.messageHandlers?.bridge)) return true;
  } catch (_) {}
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// NativeApp — Capacitor build controller (v141)
//
// vUnified-20260414-national-expansion-v141 — OnboardingFlow rendered directly, no wrapper.
//
// Root cause of v136 failure: OnboardingFlow `entered` state initialised to false →
//   opacity=0 on first render. 30ms setTimeout to set entered=true raced with WKWebView
//   concurrent-mode rendering and was not committed → content permanently invisible.
//   The debug label was visible (FirstTimeOnboarding bottom bar) but OnboardingFlow
//   was opacity=0 behind the navy background.
//
// v137 FIX:
//   1. FirstTimeOnboarding extracted to components/FirstTimeOnboarding.tsx — full inline
//      styles wrapper (z-300, flex, background) visible regardless of OnboardingFlow opacity.
//   2. OnboardingFlow.entered initialises to visible (true) → opacity=1 on first paint.
//   3. key={Date.now()} forces a fresh FirstTimeOnboarding mount on every NativeApp render
//      (prevents any stale React subtree from a previous hydration attempt).
//
// Used ONLY when IS_CAPACITOR_BUILD=true.
// ─────────────────────────────────────────────────────────────────────────────
function NativeApp() {
  // vUnified-20260414-national-expansion-v179 — hydration-safe isLocked pattern.
  // useState(false) ensures SSG output matches initial client render → no hydration mismatch.
  // useLayoutEffect syncs to real lock state before first paint.
  const [isLocked, setIsLocked] = useState(false);

  // vUnified-20260414-national-expansion-v276 — showChat drives the React state swap.
  // Starts false (matches SSG). Set to true by the flag watcher below — React then renders
  // <ChatPage /> directly on the same document, zero navigation, zero SIGKILL 9.
  const [showChat, setShowChat] = useState(false);

  useLayoutEffect(() => {
    const w = window as { __rpNativeLocked?: boolean; __rpNavigating?: boolean };
    const locked =
      !!w.__rpNativeLocked ||
      !!w.__rpNavigating ||
      !!localStorage.getItem("rp_onboarded_v1") ||
      !!sessionStorage.getItem("rp_onboarded_v1") ||
      !!sessionStorage.getItem("rp_skip_splash");
    if (locked) setIsLocked(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // vUnified-20260414-national-expansion-v276 — free tier flag watcher (React state swap).
  // Button in OnboardingFlow ONLY sets window.__rpStartFreeTriggered = true and exits.
  // This setInterval fires from a clean macrotask — zero lineage to the touch gesture.
  // On detection: writes rp_ flags, then calls setShowChat(true). React re-renders to
  // <ChatPage /> in-place. No window.location.replace → no WKWebView navigation → no SIGKILL 9.
  useEffect(() => {
    const id = setInterval(() => {
      const w = window as { __rpStartFreeTriggered?: boolean };
      if (!w.__rpStartFreeTriggered) return;
      w.__rpStartFreeTriggered = false;
      clearInterval(id);
      try { localStorage.setItem("rp_onboarded_v1", "1"); } catch (_) {}
      try { localStorage.setItem("rp_skip_splash", "1"); } catch (_) {}
      try { localStorage.setItem("rp_free_tier_started", "1"); } catch (_) {}
      try { sessionStorage.setItem("rp_skip_splash", "1"); } catch (_) {}
      try { sessionStorage.setItem("rp_onboarded_v1", "1"); } catch (_) {}
      setShowChat(true);
    }, 50);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // showChat checked first — renders ChatPage in-place, no navigation.
  if (showChat) return <ChatPage />;

  if (isLocked) {
    // Flat solid fill — covers screen while Layer 0 redirect to /chat/ fires.
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[100000]"
        style={{ background: "#0b1628" }}
      />
    );
  }

  // First-time user: render OnboardingFlow directly.
  // onComplete: Pro/Business — free tier handled by __rpStartFreeTriggered watcher above.
  // v290 FIX: no window.location.replace for Pro either. Write sessionStorage signal,
  // then setShowChat(true) so ChatPage mounts in-place and opens the upgrade modal.
  // Eliminates the WKWebView navigation that produced the blank navy screen.
  return (
    <OnboardingFlow
      key="onboarding-v285"
      visible={true}
      onComplete={(tier: OnboardingTier) => {
        if (tier === "free") return;
        try { localStorage.setItem("rp_onboarded_v1", "1"); } catch (_) {}
        try { localStorage.setItem("rp_skip_splash", "1"); } catch (_) {}
        try { sessionStorage.setItem("rp_skip_splash", "1"); } catch (_) {}
        try { sessionStorage.setItem("rp_onboarded_v1", "1"); } catch (_) {}
        if (tier === "pro") {
          try { sessionStorage.setItem("rp_show_upgrade", "1"); } catch (_) {}
        }
        setShowChat(true);
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NativeGate — web build native guard (unchanged from v105)
//
// Used ONLY when IS_CAPACITOR_BUILD=false (web/Vercel build). Handles the edge
// case where a native WKWebView loads the web build. Uses phase state machine:
//   - "splash": initial SSG state (AppSplashOverlay in HTML from byte 0)
//   - "native": confirmed native runtime → keeps splash, starts auth
//   - "web":    confirmed browser → removes cover before first paint
//
// useLayoutEffect fires BEFORE first browser paint, resolving the phase.
// Web users: never see the AppSplashOverlay (phase="web" set pre-paint).
// ─────────────────────────────────────────────────────────────────────────────
function NativeGate() {
  const [phase, setPhase] = useState<"splash" | "native" | "web">("splash");
  const [splashVisible, setSplashVisible] = useState(true);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  const splashReadyRef = useRef<{ authDone: boolean; minTimerDone: boolean }>({
    authDone: false, minTimerDone: false,
  });
  const userRef = useRef<User | null>(null);

  const checkReady = useCallback(() => {
    if (!splashReadyRef.current.authDone || !splashReadyRef.current.minTimerDone) return;
    const onboarded = !!localStorage.getItem("rp_onboarded_v1");
    setSplashVisible(false);
    if (!onboarded && !userRef.current) {
      setOnboardingVisible(true);
    } else {
      if (!onboarded && userRef.current) localStorage.setItem("rp_onboarded_v1", "1");
      sessionStorage.setItem("rp_skip_splash", "1");
      window.location.replace("/chat/");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // LAYER 2: fires BEFORE first browser paint — resolves phase before pixel 0.
  useLayoutEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (detectNativeRuntime()) {
      setPhase("native");
    } else {
      setPhase("web"); // web users: cover removed before first paint
    }
  }, []); // intentionally empty — runs once on mount, before first paint

  // LAYER 3: async auth + timer (runs after paint).
  useEffect(() => {
    if (!detectNativeRuntime()) return;

    const onboarded = !!localStorage.getItem("rp_onboarded_v1");
    const minWait = onboarded ? 500 : 2000;

    const t = setTimeout(() => {
      splashReadyRef.current.minTimerDone = true;
      checkReady();
    }, minWait);

    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }) => {
      userRef.current = session?.user ?? null;
      splashReadyRef.current.authDone = true;
      checkReady();
    });

    return () => clearTimeout(t);
  }, [checkReady]);

  const handleOnboardingComplete = useCallback((tier: OnboardingTier) => {
    localStorage.setItem("rp_onboarded_v1", "1");
    setOnboardingVisible(false);
    sessionStorage.setItem("rp_skip_splash", "1");
    window.location.replace(tier === "pro" ? "/chat/?tier=pro" : "/chat/");
  }, []);

  if (phase === "web") return null;

  return (
    <>
      <AppSplashOverlay visible={splashVisible} />
      <OnboardingFlow visible={onboardingVisible} onComplete={handleOnboardingComplete} />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background: "radial-gradient(ellipse at 50% 38%, #0d2450 0%, #0b1830 48%, #060e1c 100%)",
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LandingPage — web deployment only (Vercel / browser)
// ─────────────────────────────────────────────────────────────────────────────
function LandingPage() {
  return (
    <>
      {/* NativeRedirect: catches edge case where native WKWebView loads web build. */}
      <NativeRedirect />
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <DemoTeaser />
        <ComparisonMatrix />
        <Testimonials />
        <FeaturesSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root route
//
// vUnified-20260414-national-expansion-v120:
//   IS_CAPACITOR_BUILD=true → NativeApp only (no LandingPage, no NativeGate).
//     SSG HTML: boot layer (z-500) + ControlledSplash (z-400) + dark base (z-1) always present.
//     No AppSplashOverlay in NativeApp tree at any phase.
//
//   IS_CAPACITOR_BUILD=false → LandingPage + NativeGate.
//     NativeGate resolves to null before first paint for web browsers (phase="web").
//     Belt-and-suspenders for native WKWebView loading the web/Vercel build.
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  if (IS_CAPACITOR_BUILD) {
    // vUnified-20260414-national-expansion-v106 — NativeApp: simplified, no phase machine.
    // The native boot layer in layout.tsx (z-500) covers the screen from byte 0.
    // NativeApp renders AppSplashOverlay (z-400) unconditionally — no state condition
    // that could return null and break the SSG output.
    return <NativeApp />;
  }
  return (
    <>
      <LandingPage />
      <NativeGate />
    </>
  );
}
