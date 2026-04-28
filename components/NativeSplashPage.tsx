// vUnified-20260414-national-expansion-v96 — Root route forces custom splash + onboarding
// on native iOS launch (no landing page ever shown).
//
// This component is dynamically imported (ssr: false) into app/page.tsx.
// It runs 100% client-side — never in SSR or SSG output.
//
// Native detection uses three independent signals (same order as layout.tsx inline script):
//   1. NEXT_PUBLIC_IS_CAPACITOR build flag — set at compile time; reliable from frame 0
//   2. window.Capacitor.isNativePlatform() — Capacitor bridge (primary runtime check)
//   3. window.location.protocol === 'capacitor:' — iOS URL scheme (secondary)
//   4. window.webkit.messageHandlers.bridge — WKWebView API (tertiary, belt-and-suspenders)
//
// On native:
//   - AppSplashOverlay (z-[400]) is visible immediately from mount
//   - Auth bootstrap + 2 s min-timer run in parallel
//   - When both complete: OnboardingFlow (z-[300]) shown for first-time users
//   - After onboarding: sets sessionStorage 'rp_skip_splash' so /chat skips its own
//     2 s timer (prevents double-splash UX), then navigates to /chat/
//   - Returning users (already onboarded): sets skip flag, navigates to /chat/
//
// On web: returns null immediately — zero impact on landing page rendering or SEO.

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import AppSplashOverlay from "@/components/AppSplashOverlay";
import OnboardingFlow, { type OnboardingTier } from "@/components/OnboardingFlow";

// ── Build-time native flag ────────────────────────────────────────────────────
// True in the Capacitor static bundle (npm run build:cap → CAPACITOR_BUILD=true).
// Evaluated at compile time by Next.js — zero runtime overhead.
const IS_CAPACITOR_BUILD = process.env.NEXT_PUBLIC_IS_CAPACITOR === "true";

function detectNativeRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as {
    Capacitor?: { isNativePlatform?: () => boolean };
    webkit?: { messageHandlers?: { bridge?: unknown } };
  };
  return (
    w.Capacitor?.isNativePlatform?.() === true ||     // Capacitor bridge
    window.location.protocol === "capacitor:" ||       // iOS URL scheme
    !!(w.webkit?.messageHandlers?.bridge)              // WKWebView messageHandler API
  );
}

export default function NativeSplashPage() {
  // isNative is true from frame 0 in the cap bundle (build flag).
  // In web builds, falls back to runtime detection (always false for real browsers).
  const isNative = IS_CAPACITOR_BUILD || detectNativeRuntime();

  const [splashVisible,     setSplashVisible]     = useState(true);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  // Two-flag race: both authDone AND minTimerDone must be set before splash hides.
  const splashReadyRef = useRef<{ authDone: boolean; minTimerDone: boolean }>({
    authDone:     false,
    minTimerDone: false,
  });
  // Captures auth User synchronously so checkSplashReady reads correct value.
  const userForOnboardingRef = useRef<User | null>(null);

  // ── Splash dismiss logic ──────────────────────────────────────────────────
  const checkSplashReady = useCallback(() => {
    if (!splashReadyRef.current.authDone || !splashReadyRef.current.minTimerDone) return;

    const onboarded = !!localStorage.getItem("rp_onboarded_v1");
    setSplashVisible(false);
    const u = userForOnboardingRef.current;

    if (!onboarded && !u) {
      // First-time unauthenticated — show tier selection here on the root route.
      setOnboardingVisible(true);
    } else {
      // Returning or already signed-in user — go straight to the main app.
      if (!onboarded && u) localStorage.setItem("rp_onboarded_v1", "1");
      // Signal /chat to skip its own 2 s splash (user has already seen the animation).
      sessionStorage.setItem("rp_skip_splash", "1");
      window.location.replace("/chat/");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2 s minimum display timer ─────────────────────────────────────────────
  useEffect(() => {
    if (!isNative) return;
    const t = setTimeout(() => {
      splashReadyRef.current.minTimerDone = true;
      checkSplashReady();
    }, 2000);
    return () => clearTimeout(t);
  }, [isNative, checkSplashReady]);

  // ── Auth bootstrap ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isNative) return;
    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }) => {
      userForOnboardingRef.current = session?.user ?? null;
      splashReadyRef.current.authDone = true;
      checkSplashReady();
    });
  }, [isNative, checkSplashReady]);

  // ── Onboarding completion handler ─────────────────────────────────────────
  const handleOnboardingComplete = useCallback((tier: OnboardingTier) => {
    localStorage.setItem("rp_onboarded_v1", "1");
    setOnboardingVisible(false);
    // Signal /chat/ to skip the second splash animation (user already saw it here).
    sessionStorage.setItem("rp_skip_splash", "1");
    // Navigate to the main app. Pro tier: pass flag so chat page can trigger upgrade.
    window.location.replace(tier === "pro" ? "/chat/?tier=pro" : "/chat/");
  }, []);

  // Not native → render nothing; landing page shows normally for web/SEO.
  if (!isNative) return null;

  return (
    <>
      {/* Animated shield + EKG splash (z-[400]) — visible from first React paint */}
      <AppSplashOverlay visible={splashVisible} />

      {/* Free/Pro/Business tier selection (z-[300]) — shown after splash fades */}
      <OnboardingFlow visible={onboardingVisible} onComplete={handleOnboardingComplete} />

      {/* Dark navy base layer (z-[1]) — fills any gap between native launch screen
          and the web layer; prevents any white flash during WKWebView loading.   */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(ellipse at 50% 38%, #0d2450 0%, #0b1830 48%, #060e1c 100%)",
        }}
      />
    </>
  );
}
