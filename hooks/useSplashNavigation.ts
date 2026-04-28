// vUnified-20260414-national-expansion-v118 — Final splash polish: shield + fixed 1200ms/800ms
//   duration + no repeat loop.
//
// useSplashNavigation: hook for internal navigation with ControlledSplash transition.
//   Calling navigateWithSplash(href) sets showSplash=true → parent mounts ControlledSplash
//   (duration=800ms) → onSplashHide fires once → writes rp_skip_splash → window.location.replace.
//
// Guard: navigateWithSplash is a no-op if a navigation is already pending (pendingHref set).
//   This prevents double-splash if a tap fires twice (touch event coalescing on WKWebView).
//
// rp_skip_splash is written synchronously inside onSplashHide BEFORE window.location.replace
//   so /chat/ reads the flag on mount and skips its own AppSplashOverlay.
//
// Usage:
//   const { showSplash, navigateWithSplash, onSplashHide } = useSplashNavigation();
//   <button onClick={() => navigateWithSplash('/chat/')}>Start Free</button>
//   {showSplash && <ControlledSplash visible={true} onHide={onSplashHide} duration={800} />}

"use client";

import { useState, useCallback, useRef } from "react";

export function useSplashNavigation() {
  const [showSplash, setShowSplash] = useState(false);
  // Ref holds pending href — readable in onSplashHide closure without stale capture
  const pendingHref = useRef<string | null>(null);

  // vUnified-20260414-national-expansion-v118 — Guard: no-op if already pending.
  // WKWebView can fire touch events twice on rapid taps — guard prevents double-mount.
  const navigateWithSplash = useCallback((href: string) => {
    if (pendingHref.current !== null) {
      console.log("[v118][useSplashNavigation] navigateWithSplash ignored — already pending:", pendingHref.current);
      return;
    }
    console.log("[v118][useSplashNavigation] navigateWithSplash →", href);
    pendingHref.current = href;
    setShowSplash(true);
  }, []);

  // vUnified-20260414-national-expansion-v118 — Called once by ControlledSplash after fade.
  // Writes rp_skip_splash BEFORE navigating so /chat/ skips its AppSplashOverlay on mount.
  const onSplashHide = useCallback(() => {
    const href = pendingHref.current;
    console.log("[v118][useSplashNavigation] onSplashHide — navigating to:", href);
    setShowSplash(false);
    if (href) {
      try { sessionStorage.setItem("rp_skip_splash", "1"); } catch (_) {}
      window.location.replace(href);
    }
  }, []);

  return { showSplash, navigateWithSplash, onSplashHide };
}
