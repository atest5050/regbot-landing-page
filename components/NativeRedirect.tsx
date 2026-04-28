// vUnified-20260414-national-expansion-v103 — Onboarding-aware native redirect.
//
// This client component is the Layer-2 fallback for the native redirect.
// Layer 1 is the synchronous inline <script> in app/layout.tsx <head>.
// In Capacitor builds (IS_CAPACITOR_BUILD=true), this component is never rendered
// because HomePage skips LandingPage entirely — this file is only active in web builds.
//
// v103 FIX: Added localStorage check before redirecting. First-time native users
// (rp_onboarded_v1 not set) must NOT be redirected — NativeGate handles them on the
// root route (splash → OnboardingFlow → /chat/). Only returning users are redirected.
//
// Detection order mirrors the <head> script exactly:
//   1. window.Capacitor.isNativePlatform() — Capacitor bridge (primary)
//   2. window.location.protocol === 'capacitor:' — iOS URL scheme (secondary)
//   3. window.webkit.messageHandlers.bridge — WKWebView bridge API (tertiary)

"use client";

import { useEffect } from "react";

export default function NativeRedirect() {
  useEffect(() => {
    try {
      const w = window as {
        Capacitor?: { isNativePlatform?: () => boolean };
        webkit?: { messageHandlers?: { bridge?: unknown } };
      };

      const isNative =
        w.Capacitor?.isNativePlatform?.() === true ||
        window.location.protocol === "capacitor:" ||
        !!(w.webkit?.messageHandlers?.bridge);

      if (isNative) {
        // vUnified-20260414-national-expansion-v103 — Only redirect returning users.
        // First-time users stay on root so NativeGate can show splash + OnboardingFlow.
        const onboarded = !!localStorage.getItem("rp_onboarded_v1");
        if (!onboarded) return;
        const p = window.location.pathname;
        if (p !== "/chat" && p !== "/chat/") {
          window.location.replace("/chat/");
        }
      }
    } catch { /* ignore — never block landing page render on web */ }
  }, []);

  return null;
}
