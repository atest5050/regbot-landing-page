// vUnified-20260428-final-ship-lock-v283 — Fresh Capacitor bundle via build:cap; CORS middleware; SW v157/v144/v144.
// v196: all capture-phase listeners, updateBtnRect, captureDiv, bodyDelegate, and scroll/resize
// rect-posting removed. Navigation driven exclusively by React onClick → bridge postMessage.
// React's synthetic onClick fires only on clean UIKit-validated taps — scroll drags never trigger it.
//
// v147 failure analysis — "window capture-phase attached but overlay never appears":
//   Root cause confirmed: iOS UIKit gesture recognizer pipeline operates ABOVE the
//   WKWebView JS thread. Even capture-phase window/document listeners (the earliest
//   possible JS interception point) never receive an event that UIKit consumed at the
//   native layer. touchstart, pointerdown, and capture-phase variants ALL fail because
//   they are raw touch events — dispatched before UIKit decides whether the gesture
//   is a system gesture (Control Center, home-swipe, back-forward nav).
//
//   The exception: React's synthetic onClick. It is generated from UIKit's own
//   UITapGestureRecognizer AFTER full tap recognition — NOT from raw touch events.
//   iOS dispatches a synthetic click event back into WKWebView after UIKit decides
//   the gesture was a tap. This event IS delivered to JS reliably.
//
// v149 FIX — native WKScriptMessageHandler bridge + React onClick:
//   1. ViewController.swift registers WKScriptMessageHandler "regpulse". JS calls:
//      window.webkit.messageHandlers.regpulse.postMessage({ action: "startFreeTier" })
//      Native handler writes localStorage + evaluateJavaScript("window.location.replace('/chat/')").
//   2. Start Free button gets a React onClick handler that: (a) calls the native bridge
//      if available, (b) calls doFreeTier() as JS fallback.
//   3. All v147 capture-phase listeners retained as belt-and-suspenders.
//   4. allowsBackForwardNavigationGestures=false + scrollView.bounces=false set in
//      ViewController.swift to eliminate competing gesture recognizers.
//
// v140 failure analysis — "app backgrounding to home screen" (new symptom):
//   Root cause: navigation fires (window.location.replace) WHILE user's finger is still down.
//   WKWebView tears down the JS context mid-gesture. iOS sees an ongoing PointerEvent with no
//   handler → interprets the remaining touch as the system home-swipe gesture → app backgrounds.
//
// v141 FIX — three-layer change:
//   1. setPointerCapture(e.pointerId) on pointerdown — captures the pointer to the button element.
//      Even after JS context teardown, the captured pointer is NOT processed as a system gesture.
//      This is the correct W3C API for "I own this touch, system must not claim it."
//
//   2. Remove mounted + entered state machine — every state update creates a React render cycle
//      where opacity briefly passes through 0 on some concurrent-mode interleaving. Removed
//      entirely: wrapper is always rendered; visibility is CSS opacity driven by visible prop only.
//      No transition on the wrapper (was "opacity 0.55s ease-out") — no animated opacity window.
//
//   3. 7-handler stack with passive:false on ALL events replaced by single onPointerDown React
//      prop + one DOM backup pointerdown listener. Fewer preventDefault() calls = less interference
//      with WKWebView gesture recognizer. touch-action:none on button tells the browser not to
//      run its own gesture processing on this element at all.
//
// v134 finding: DOM .onclick + addEventListener (touchend/click) STILL not firing on physical
// iPhone WKWebView. Taps were "ignored or triggering Control Center" — the iOS system gesture
// recognizer for Control Center (swipe-down-from-top-right) was competing with WKWebView's
// touch-action:pan-y gesture recognizer on the scrollable tier cards container. Neither fired.
//
// v137 FIX:
//   1. TiersScreen scrollable div: touch-action:pan-y → touch-action:manipulation.
//      manipulation = panning + pinch-zoom, but disables double-tap-zoom. Critically, it
//      does NOT exclusively own vertical pan gestures the way pan-y does — WKWebView still
//      generates click/pointer events without the 300ms delay or gesture competition.
//   2. Four CSP-safe handler layers: onclick + touchend(passive:true) + click + pointerup.
//      pointerup (Pointer Events API, iOS 13+) fires independently of touch-action processing
//      and before the browser decides if the gesture was a scroll.
//   3. MutationObserver: watches document.body for the button appearing/disappearing after
//      any React reconciliation cycle re-renders TierCard and replaces the DOM node.
//
// v126 — ROOT CAUSE FIXED: service worker cache miss.
//
//   v119–v125 root cause identified: window.location.href = '/chat/?t=...&skip=1&force=1'
//   used a URL with query params. The service worker's networkFirstWithFallback uses
//   cache.match(request) with EXACT URL key — so '/chat/?t=1234567890&skip=1' is a cache
//   MISS on fresh install. The SW's catch block falls back to cache.match('/') which returns
//   out/index.html (the root NativeApp). NativeApp remounts with phase='splash' → loop.
//   The returning-user path uses window.location.replace('/chat/') — clean URL, cache HIT.
//
//   v126 FIX: navigate to '/chat/' with NO query params, using window.location.replace()
//   exactly matching the returning-user path that has always worked. Skip signal is carried
//   via localStorage (written synchronously before navigation) + sessionStorage belt-and-suspenders.
//   layout.tsx Layer 0 script reads localStorage on /chat/ before any React module loads.
//
//   Pro/Business: still uses onComplete → auth screen → NativeApp phase machine. Unaffected.
//   useRouter REMOVED — no longer needed after removing all navigation from this component.
// v102 base: Email/password + TOTP MFA only (no federated auth) + Stripe checkout for Pro/Business.
//
// OnboardingFlow: full-screen overlay (z-[300]) shown once per device, immediately after
// the AppSplashOverlay fades out for unauthenticated first-time users.
//
// Two internal phases, navigated in sequence:
//
//   "tiers"  — Three clear plan cards: Free / Pro / Business.
//              Free → completes onboarding immediately (enters app as guest).
//              Pro / Business → transitions to "auth" phase so user can create an account.
//
//   "auth"   — Full-screen auth: email + password signup/signin only.
//              On successful signin, checks for TOTP MFA factor. If found, transitions
//              to "mfa" sub-phase for 6-digit TOTP verification before completing.
//              On success the parent's onAuthStateChange listener fires and also calls
//              the onComplete callback so the overlay is dismissed from both paths.
//
// Persistence:
//   localStorage key "rp_onboarded_v1" is written by the parent (ChatPage) on onComplete.
//   This component only fires onComplete; it does not touch localStorage directly.
//
// Platform Parity Mandate:
//   - paddingTop / paddingBottom: env(safe-area-inset-*) on the outermost wrapper
//   - All CTA buttons: min-h-[48px], touch-action:manipulation, pointer-events-auto
//   - Scrollable tier list: flex-1 min-h-0 overflow-y-auto overscroll-y-contain
//   - Desktop: max-w-lg centered card layout, full bleed on mobile

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type OnboardingTier = "free" | "pro" | "business";
type Phase = "tiers" | "auth";
type AuthMode = "signup" | "signin";

export interface OnboardingFlowProps {
  /** Set to false by parent to trigger fade-out + unmount. */
  visible: boolean;
  /** Called when the user completes onboarding — parent writes localStorage + hides overlay. */
  onComplete: (tier: OnboardingTier) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier definitions
// ─────────────────────────────────────────────────────────────────────────────

const TIERS: Array<{
  id:        OnboardingTier;
  name:      string;
  price:     string;
  tag:       string;
  tagline:   string;
  features:  string[];
  cta:       string;
  highlight: boolean;
  badge?:    string;
}> = [
  {
    id:       "free",
    name:     "Free",
    price:    "$0",
    tag:      "Forever free",
    tagline:  "Start with essential compliance guidance.",
    features: [
      "3 AI compliance chats / month",
      "Basic regulatory overview",
      "Permit checklist preview",
    ],
    cta:       "Start Free",
    highlight: false,
  },
  {
    id:       "pro",
    name:     "Pro",
    price:    "$19",
    tag:      "/ month",
    tagline:  "Everything you need to stay fully compliant.",
    badge:    "Most Popular",
    features: [
      "Unlimited AI compliance chats",
      "Full Form Filler + PDF generation",
      "Business Profile + zoning checker",
      "Document analysis + change alerts",
      "Compliance calendar + renewal reminders",
    ],
    cta:       "Get Pro",
    highlight: true,
  },
  {
    id:       "business",
    name:     "Business",
    price:    "Custom",
    tag:      "Contact us",
    tagline:  "Enterprise compliance for growing teams.",
    features: [
      "Everything in Pro",
      "Team seats + role management",
      "Advanced portfolio analytics",
      "Priority support + onboarding",
      "Custom integrations",
    ],
    cta:       "Get Business",
    highlight: false,
  },
];

// vUnified-20260414-national-expansion-v209 — native bridge types (startFreeTier removed).
declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        regpulse?: { postMessage: (msg: Record<string, unknown>) => void };
      };
    };
    // __rpNavigating: set true by doFreeTier and by native evaluateJavaScript storage block.
    __rpNavigating?: boolean;
    // __rpNativeLocked: set true synchronously before bridge.postMessage — guards re-renders.
    __rpNativeLocked?: boolean;
  }
}


export default function OnboardingFlow({ visible, onComplete }: OnboardingFlowProps) {
  // vUnified-20260414-national-expansion-v270 — hooks declared first (rules of hooks compliant).
  // No isStartingFree state — button ONLY sets flag; NativeApp watcher handles everything else.

  // Guard layers retained — __rpNativeLocked is never set in v270 but kept for safety.
  if (typeof window !== "undefined" && window.__rpNativeLocked) return <></>;
  if (typeof window !== "undefined") {
    try { if (window.__rpNativeLocked) return <></>; } catch (_) {}
  }
  if (typeof window !== "undefined") {
    try { if (window.__rpNativeLocked) return null; } catch (_) {}
  }

  // Handler for Start Free tap — ONLY sets the global flag.
  // No DOM injection, no navigation, no localStorage, no setTimeout, no bridge.
  // NativeApp's setInterval watcher (clean macrotask context, no gesture lineage) handles
  // overlay injection + flag-writing + window.location.replace after gesture fully resolves.
  function handleStartFree(e: React.MouseEvent | React.TouchEvent | React.PointerEvent) {
    try { e.preventDefault(); e.stopPropagation(); } catch (_) {}
    try { (window as { __rpStartFreeTriggered?: boolean }).__rpStartFreeTriggered = true; } catch (_) {}
  }

  return (
    // vUnified-20260414-national-expansion-v185 — scroll fix.
    // ROOT CAUSE of non-scrollable plan cards on iOS WKWebView:
    //   outer container had touchAction:"none" which, per W3C Pointer Events spec, suppresses
    //   ALL touch handling for EVERY descendant — including the inner scroll container's
    //   touchAction:"manipulation". The browser intersection-resolves ancestor touch-actions,
    //   so none ∩ manipulation = none. The inner scroll never received the touch.
    // FIX: touchAction:"pan-y" on the outer allows vertical panning to propagate to the
    //   inner scroll container while still blocking horizontal swipes and pinch-zoom on the
    //   background overlay. pan-y ∩ manipulation = pan-y — vertical scroll works. ✓
    // Individual buttons retain touchAction:"manipulation" for tap + pinch, no double-tap-zoom.
    // GPU hints: translateZ(0), backfaceVisibility:hidden, willChange:transform.
    // No Tailwind classes — 100% inline styles, no class resolution dependency.
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: "100dvh",
        overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 20%, #0d2450 0%, #0b1830 50%, #060e1c 100%)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        pointerEvents: visible ? "auto" : "none",
        // v185 FIX: was "none" — blocked all descendant scroll. "pan-y" allows vertical
        // scroll in children while still preventing horizontal swipe on the overlay bg.
        touchAction: "pan-y",
        userSelect: "none",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)" as React.CSSProperties["WebkitTransform"],
        willChange: "transform",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12,
        paddingTop: 32, paddingBottom: 20, paddingLeft: 20, paddingRight: 20 }}>
        <MiniShield size={40} />
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
          color: "#ffffff", lineHeight: 1.1,
          fontFamily: "system-ui, sans-serif" }}>
          Choose Your Plan
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.9)", lineHeight: 1.4,
          fontFamily: "system-ui, sans-serif" }}>
          Start for free or unlock everything on day one.
        </p>
      </div>

      {/* ── Tier cards — fully inlined, no sub-components, all inline styles ── */}
      {/* vUnified-20260414-national-expansion-v185: scroll container.
          flex:1 min-h:0 gives this div all remaining vertical space after the fixed header/footer.
          overflowY:auto + -webkit-overflow-scrolling:touch = native momentum scroll on iOS.
          overscrollBehavior:contain stops pull-to-refresh and rubber-band from propagating up.
          touchAction:manipulation: pan-y ∩ manipulation = pan-y (vertical scroll allowed). */}
      <div id="rp-scroll-container-v190" style={{ flex: 1, minHeight: 0, overflowY: "auto",
        WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        overscrollBehavior: "contain" as React.CSSProperties["overscrollBehavior"],
        paddingLeft: 16, paddingRight: 16,
        paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
        paddingTop: 8,
        touchAction: "manipulation", pointerEvents: "auto" }}>
        <div style={{ maxWidth: 512, marginLeft: "auto", marginRight: "auto",
          display: "flex", flexDirection: "column", gap: 12 }}>

          {/* ── Free card ─────────────────────────────────────────────────────── */}
          <div style={{ position: "relative", borderRadius: 16,
            border: "1px solid rgba(51,65,85,0.6)",
            background: "rgba(11,22,40,0.75)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)", pointerEvents: "auto" }}>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, pointerEvents: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "flex-end", gap: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#e2e8f0",
                    lineHeight: 1,
                    fontFamily: "system-ui, sans-serif" }}>
                    Free
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(148,163,184,0.7)" }}>
                    Start with essential compliance guidance.
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", lineHeight: 1,
                    fontFamily: "system-ui, sans-serif" }}>
                    $0
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", marginLeft: 2 }}>
                    Forever free
                  </span>
                </div>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none",
                display: "flex", flexDirection: "column", gap: 6 }}>
                {["3 AI compliance chats / month", "Basic regulatory overview",
                  "Permit checklist preview"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ flexShrink: 0, fontSize: 12, color: "#64748b", marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: "rgba(203,213,225,0.85)", lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                id="start-free-btn-v269"
                data-rp-start-free="true"
                onPointerDown={handleStartFree}
                onClick={handleStartFree}
                onTouchEnd={handleStartFree}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 12, fontWeight: 600, minHeight: 52, minWidth: 52, fontSize: 14,
                  touchAction: "manipulation", pointerEvents: "auto", cursor: "pointer",
                  background: "rgba(51,65,85,0.6)", color: "#cbd5e1",
                  border: "1px solid rgba(71,85,105,0.8)",
                  fontFamily: "system-ui, sans-serif",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Start Free
              </button>
            </div>
          </div>

          {/* ── Pro card ──────────────────────────────────────────────────────── */}
          <div style={{ position: "relative", borderRadius: 16,
            border: "1.5px solid rgba(34,211,238,0.55)",
            background: "linear-gradient(145deg, rgba(13,36,80,0.95) 0%, rgba(11,22,40,0.98) 100%)",
            boxShadow: "0 0 32px rgba(34,211,238,0.12), 0 2px 12px rgba(0,0,0,0.4)" }}>
            <div style={{ position: "absolute", top: 0, right: 0,
              padding: "4px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase" as React.CSSProperties["textTransform"],
              borderBottomLeftRadius: 12,
              borderLeft: "1px solid rgba(34,211,238,0.3)",
              borderBottom: "1px solid rgba(34,211,238,0.3)",
              background: "rgba(34,211,238,0.18)", color: "#22d3ee" }}>
              Most Popular
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "flex-end", gap: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#22d3ee",
                    lineHeight: 1,
                    fontFamily: "system-ui, sans-serif" }}>
                    Pro
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(148,163,184,0.7)" }}>
                    Everything you need to stay fully compliant.
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", lineHeight: 1,
                    fontFamily: "system-ui, sans-serif" }}>
                    $19
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", marginLeft: 2 }}>
                    / month
                  </span>
                </div>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none",
                display: "flex", flexDirection: "column", gap: 6 }}>
                {["Unlimited AI compliance chats", "Full Form Filler + PDF generation",
                  "Business Profile + zoning checker", "Document analysis + change alerts",
                  "Compliance calendar + renewal reminders"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ flexShrink: 0, fontSize: 12, color: "#22d3ee", marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: "rgba(203,213,225,0.85)", lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onComplete("pro")}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 12, fontWeight: 600, minHeight: 48, fontSize: 14,
                  touchAction: "manipulation", pointerEvents: "auto", cursor: "pointer",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
                  color: "#0b1628", border: "none",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Get Pro
              </button>
            </div>
          </div>

          {/* ── Business card ─────────────────────────────────────────────────── */}
          <div style={{ position: "relative", borderRadius: 16,
            border: "1px solid rgba(251,191,36,0.22)",
            background: "rgba(11,22,40,0.75)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "flex-end", gap: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fbbf24",
                    lineHeight: 1,
                    fontFamily: "system-ui, sans-serif" }}>
                    Business
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(148,163,184,0.7)" }}>
                    Enterprise compliance for growing teams.
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", lineHeight: 1,
                    fontFamily: "system-ui, sans-serif" }}>
                    Custom
                  </span>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(251,191,36,0.7)" }}>
                    Contact us
                  </p>
                </div>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none",
                display: "flex", flexDirection: "column", gap: 6 }}>
                {["Everything in Pro", "Team seats + role management",
                  "Advanced portfolio analytics", "Priority support + onboarding",
                  "Custom integrations"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ flexShrink: 0, fontSize: 12, color: "#fbbf24", marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: "rgba(203,213,225,0.85)", lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onComplete("business")}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 12, fontWeight: 600, minHeight: 48, fontSize: 14,
                  touchAction: "manipulation", pointerEvents: "auto", cursor: "pointer",
                  background: "rgba(251,191,36,0.12)", color: "#fbbf24",
                  border: "1px solid rgba(251,191,36,0.35)",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                Get Business
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 12, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(100,116,139,0.8)" }}>
          Cancel anytime. No credit card required for Free tier.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthScreen
// ─────────────────────────────────────────────────────────────────────────────

function AuthScreen({
  pendingTier,
  onBack,
  onComplete,
  onSkip,
}: {
  pendingTier: OnboardingTier;
  onBack:      () => void;
  onComplete:  (tier: OnboardingTier) => void;
  onSkip:      () => void;
}) {
  const [authMode,        setAuthMode]        = useState<AuthMode>("signup");
  const [authPhase,       setAuthPhase]       = useState<"form" | "mfa">("form");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [authError,       setAuthError]       = useState("");
  const [authWorking,     setAuthWorking]     = useState(false);
  const [successMsg,      setSuccessMsg]      = useState("");
  const [mfaCode,         setMfaCode]         = useState("");
  const [mfaFactorId,     setMfaFactorId]     = useState("");
  const [mfaChallengeId,  setMfaChallengeId]  = useState("");
  const [mfaWorking,      setMfaWorking]      = useState(false);

  // Singleton client — shares session with the parent ChatPage client
  const [sb] = useState(() => createClient());

  const tierLabel = pendingTier === "pro" ? "Pro" : "Business";

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setAuthError("Please enter your email and password.");
      return;
    }
    setAuthWorking(true);
    setAuthError("");
    setSuccessMsg("");

    if (authMode === "signup") {
      const { error } = await sb.auth.signUp({ email: email.trim(), password });
      setAuthWorking(false);
      if (error) {
        setAuthError(error.message);
        return;
      }
      setSuccessMsg("Check your email to confirm your account.");
      // Allow them into the app — they can confirm later
      onComplete(pendingTier);
    } else {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setAuthWorking(false);
        setAuthError(error.message);
        return;
      }
      // Check for TOTP MFA factor — if enrolled, require verification before proceeding.
      const { data: factorsData } = await sb.auth.mfa.listFactors();
      const totpFactor = factorsData?.totp?.[0];
      if (totpFactor) {
        const { data: challengeData, error: challengeErr } = await sb.auth.mfa.challenge({ factorId: totpFactor.id });
        setAuthWorking(false);
        if (challengeErr || !challengeData) {
          setAuthError(challengeErr?.message ?? "MFA challenge failed.");
          return;
        }
        setMfaFactorId(totpFactor.id);
        setMfaChallengeId(challengeData.id);
        setMfaCode("");
        setAuthPhase("mfa");
      } else {
        setAuthWorking(false);
        onComplete(pendingTier);
      }
    }
  };

  const handleMfaVerify = async () => {
    if (mfaCode.length !== 6) {
      setAuthError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setMfaWorking(true);
    setAuthError("");
    const { error } = await sb.auth.mfa.verify({
      factorId:    mfaFactorId,
      challengeId: mfaChallengeId,
      code:        mfaCode,
    });
    setMfaWorking(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    onComplete(pendingTier);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (authPhase === "mfa") void handleMfaVerify();
      else void handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 pt-5 pb-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-xl text-slate-400 hover:text-white"
          style={{
            minWidth: 40, minHeight: 40,
            background: "rgba(51,65,85,0.4)",
            border: "1px solid rgba(71,85,105,0.5)",
            touchAction: "manipulation",
          }}
          aria-label="Back to plans"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 style={{
            fontSize: 20, fontWeight: 700, color: "#ffffff", lineHeight: 1.1,
            fontFamily: "system-ui, sans-serif",
          }}>
            {authPhase === "mfa"
              ? "Two-Factor Auth"
              : authMode === "signup"
              ? "Create Account"
              : "Sign In"}
          </h2>
          <p style={{ fontSize: 12, color: "rgba(148,163,184,0.8)" }}>
            {authPhase === "mfa"
              ? "Enter the code from your authenticator app"
              : authMode === "signup"
              ? `Get started with ${tierLabel}`
              : `Sign in to access ${tierLabel}`}
          </p>
        </div>
      </div>

      {/* Scrollable form content */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-5 pb-4"
        style={{ touchAction: "pan-y" }}
      >
        <div className="max-w-sm mx-auto flex flex-col gap-4 pt-1">

          {authPhase === "mfa" ? (
            /* ── MFA verification phase ── */
            <>
              <p style={{ fontSize: 13, color: "rgba(148,163,184,0.85)", lineHeight: 1.5 }}>
                Open your authenticator app and enter the 6-digit code for RegPulse.
              </p>

              {/* 6-digit code input */}
              <div className="space-y-1.5">
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.8)" }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl outline-none text-center tracking-widest"
                  style={{
                    minHeight: 56,
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "0.35em",
                    background: "rgba(15,24,36,0.7)",
                    border: "1px solid rgba(51,65,85,0.7)",
                    color: "#22d3ee",
                    caretColor: "#22d3ee",
                    fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  }}
                />
              </div>

              {authError && (
                <p style={{ fontSize: 12, color: "#f87171", lineHeight: 1.4 }}>{authError}</p>
              )}

              {/* Verify button */}
              <button
                onClick={() => void handleMfaVerify()}
                disabled={mfaWorking}
                className="w-full flex items-center justify-center rounded-xl font-semibold"
                style={{
                  minHeight: 52,
                  fontSize: 15,
                  touchAction: "manipulation",
                  pointerEvents: "auto",
                  cursor: mfaWorking ? "default" : "pointer",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
                  color: "#0b1628",
                  opacity: mfaWorking ? 0.7 : 1,
                  transition: "opacity 0.15s",
                  border: "none",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {mfaWorking ? "Verifying…" : "Verify & Continue"}
              </button>

              {/* Back link */}
              <div className="text-center">
                <button
                  onClick={() => { setAuthPhase("form"); setAuthError(""); setMfaCode(""); }}
                  style={{
                    fontSize: 12,
                    color: "rgba(100,116,139,0.75)",
                    touchAction: "manipulation",
                    minHeight: 36,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Back to sign in
                </button>
              </div>
            </>
          ) : (
            /* ── Email / password form phase ── */
            <>
              {/* Sign up / Sign in toggle */}
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(51,65,85,0.6)", background: "rgba(15,24,36,0.6)" }}
              >
                {(["signup", "signin"] as AuthMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setAuthMode(mode); setAuthError(""); setSuccessMsg(""); }}
                    className="flex-1 flex items-center justify-center font-semibold transition-colors"
                    style={{
                      minHeight: 44,
                      fontSize: 13,
                      touchAction: "manipulation",
                      background: authMode === mode
                        ? "rgba(34,211,238,0.14)"
                        : "transparent",
                      color: authMode === mode ? "#22d3ee" : "rgba(148,163,184,0.7)",
                      borderBottom: authMode === mode
                        ? "2px solid rgba(34,211,238,0.6)"
                        : "2px solid transparent",
                    }}
                  >
                    {mode === "signup" ? "Sign Up" : "Sign In"}
                  </button>
                ))}
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.8)" }}>
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: "rgba(100,116,139,0.7)" }}
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-xl pl-9 pr-4 outline-none"
                    style={{
                      minHeight: 48,
                      fontSize: 14,
                      background: "rgba(15,24,36,0.7)",
                      border: "1px solid rgba(51,65,85,0.7)",
                      color: "#e2e8f0",
                      caretColor: "#22d3ee",
                    }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.8)" }}>
                  Password
                </label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: "rgba(100,116,139,0.7)" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-xl pl-9 pr-11 outline-none"
                    style={{
                      minHeight: 48,
                      fontSize: 14,
                      background: "rgba(15,24,36,0.7)",
                      border: "1px solid rgba(51,65,85,0.7)",
                      color: "#e2e8f0",
                      caretColor: "#22d3ee",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      minWidth: 28, minHeight: 28,
                      color: "rgba(100,116,139,0.7)",
                      touchAction: "manipulation",
                    }}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error / success messages */}
              {authError && (
                <p style={{ fontSize: 12, color: "#f87171", lineHeight: 1.4 }}>{authError}</p>
              )}
              {successMsg && (
                <p style={{ fontSize: 12, color: "#34d399", lineHeight: 1.4 }}>{successMsg}</p>
              )}

              {/* Submit button */}
              <button
                onClick={() => void handleSubmit()}
                disabled={authWorking}
                className="w-full flex items-center justify-center rounded-xl font-semibold"
                style={{
                  minHeight: 52,
                  fontSize: 15,
                  touchAction: "manipulation",
                  pointerEvents: "auto",
                  cursor: authWorking ? "default" : "pointer",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
                  color: "#0b1628",
                  opacity: authWorking ? 0.7 : 1,
                  transition: "opacity 0.15s",
                  border: "none",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {authWorking
                  ? "Please wait…"
                  : authMode === "signup"
                  ? `Create Account & Get ${tierLabel}`
                  : `Sign In`}
              </button>

              {/* Skip link */}
              <div className="pt-1 pb-2 text-center">
                <button
                  onClick={onSkip}
                  className="text-center"
                  style={{
                    fontSize: 12,
                    color: "rgba(100,116,139,0.75)",
                    touchAction: "manipulation",
                    minHeight: 36,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Skip — continue with Free tier
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini shield (used in header of TiersScreen)
// ─────────────────────────────────────────────────────────────────────────────

function MiniShield({ size }: { size: number }) {
  const h  = Math.round(size * 1.1);
  const sw = Math.max(2.5, Math.min(7, size * 0.13));

  return (
    <svg width={size} height={h} viewBox="0 0 100 110" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rpob-r1" x1="12" y1="4" x2="88" y2="107" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#90b4d8" />
          <stop offset="65%"  stopColor="#2c5080" />
          <stop offset="100%" stopColor="#182e56" />
        </linearGradient>
        <linearGradient id="rpob-r2" x1="17" y1="9" x2="83" y2="103" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#496ba0" />
          <stop offset="100%" stopColor="#101e40" />
        </linearGradient>
        <filter id="rpob-ekg" x="0" y="0" width="100" height="110" filterUnits="userSpaceOnUse">
          <feGaussianBlur in="SourceGraphic" stdDeviation={+(sw * 0.6).toFixed(1)} result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0 0 0 0 0.04  0 0 0 0 0.82  0 0 0 0 0.88  0 0 0 0.55 0" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d="M50 4 L88 18 L88 64 Q88 91 50 107 Q12 91 12 64 L12 18 Z" fill="url(#rpob-r1)" />
      <path d="M50 9 L83 21 L83 64 Q83 88 50 103 Q17 88 17 64 L17 21 Z" fill="url(#rpob-r2)" />
      <path d="M50 17 L75 27 L75 64 Q75 84 50 97 Q25 84 25 64 L25 27 Z" fill="#0b1628" />
      <path
        d="M30 57 L38 57 L41 63 L45 40 L51 74 L55 57 L70 57"
        fill="none"
        stroke="#22d3ee"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#rpob-ekg)"
      />
    </svg>
  );
}

