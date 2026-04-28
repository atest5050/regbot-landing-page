// vUnified-20260414-national-expansion-v117 — AppSplashOverlay retained for NativeGate (web build)
//   and /chat/ page safety. NativeApp (IS_CAPACITOR_BUILD=true) now uses ControlledSplash instead.
//
//   v117: No functional changes to AppSplashOverlay. Debug text updated to v117.
//   Deprecation: AppSplashOverlay is no longer used in NativeApp. It remains active in:
//     - NativeGate (web build native detection path)
//     - /chat/ page (AppSplashOverlay with 8000ms safety for returning users)
//
//   9000ms safety remains as belt-and-suspenders for /chat/ page:
//   - /chat/ page: 8000ms safety fires → visible=false → mounted=false at 8700ms → 9000ms no-op.
// v107 — iOS hardware acceleration + animation fixes:
//   - Added will-change/translateZ(0)/backface-visibility on container + rings → GPU compositing.
//   - Removed rps89-shield-glow filter animation (per-frame drop-shadow → CPU raster → blur).
//     Replaced with static filter: drop-shadow(0 0 14px rgba(34,211,238,0.20)) on .rps89-shield-wrap.
//   - Simplified rps89-enter: removed translateY(18px) → pure scale(0.94→1) + opacity.
//     translateY combined with WKWebView sub-pixel rounding caused the "bouncing" artifact.
//
// v101 base: Critical CSS-independence fix.
//
// AppSplashOverlay: web-layer animated splash rendered above everything (z-[400]).
//
// v101 ROOT CAUSE FIX: All positioning on the container div and inner elements moved from
// Tailwind CSS classes to inline `style` props. Tailwind classes require the external CSS
// bundle to load before they take effect (~100-500ms on WKWebView local filesystem). Inline
// styles are applied by the browser during HTML parsing — before any CSS file is fetched.
// This eliminates the blank WKWebView-background window between HTML parse and CSS load.
//
// Flow before v101 (BROKEN):
//   HTML parsed → AppSplashOverlay div is unstyled (no position:fixed, no z-index)
//   WKWebView background (#0B1E3F) shows through → blank dark screen visible
//   CSS bundle loads (~100-500ms later) → overlay suddenly becomes fullscreen
//
// Flow after v101 (FIXED):
//   HTML parsed → AppSplashOverlay div has position:fixed; inset:0; z-index:400 (inline)
//   Overlay covers 100% of screen immediately — WKWebView background never visible
//   React hydrates → CSS bundle loads → animations play (rps89-enter, ekg, rings, dots)
//
// Platform Parity:
//   - safe-area-inset-bottom respected in loading dot position
//   - pointer-events:none during fade-out so underlying UI is immediately interactive
//   - No images, no network deps — fully self-contained SVG + CSS

"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface AppSplashOverlayProps {
  /** Set to false when auth bootstrap + min-display timer complete. Triggers fade-out. */
  visible: boolean;
}

export default function AppSplashOverlay({ visible }: AppSplashOverlayProps) {
  // Keep the DOM node mounted through the CSS fade-out (650 ms) before unmounting.
  const [mounted, setMounted] = useState(true);

  // v112 debug: log every render.
  console.log("[v117][AppSplashOverlay] render — visible:", visible, "mounted:", mounted);

  useEffect(() => {
    console.log("[v117][AppSplashOverlay] [visible] effect — visible:", visible);
    if (visible) {
      setMounted(true);
    } else {
      console.log("[v117][AppSplashOverlay] visible=false → 700ms fade-out started");
      const t = setTimeout(() => {
        console.log("[v117][AppSplashOverlay] 700ms done → setMounted(false)");
        setMounted(false);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [visible]);

  // vUnified-20260414-national-expansion-v112 — 9000ms safety restored (safe: no remount loop).
  // For NativeApp first-time: splashVisible=false fires immediately → mounted=false at 700ms.
  // For /chat/ page: 8000ms chat safety fires first → visible=false → mounted=false at 8700ms.
  // In both cases, setMounted(false) here at 9000ms is a no-op. No cleanup — must fire.
  useEffect(() => {
    console.log("[v117][AppSplashOverlay] 9000ms safety timer started");
    setTimeout(() => {
      console.log("[v117][AppSplashOverlay] 9000ms safety fired — setMounted(false)");
      setMounted(false);
    }, 9000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    console.log("[v117][AppSplashOverlay] not mounted → returning null");
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        // vUnified-20260414-national-expansion-v101 — ALL positioning is inline (not Tailwind).
        // Inline styles are applied during HTML parsing, before any CSS file loads.
        // This guarantees the overlay covers the screen from the very first browser frame.
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 38%, #0d2450 0%, #0b1830 48%, #060e1c 100%)",
        transition: "opacity 0.65s ease-out",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        willChange: "opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <SplashContent />
      {/* v112 debug text — visible on device for on-screen state inspection */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "max(18px, calc(env(safe-area-inset-bottom) + 6px))",
          left: 0,
          right: 0,
          textAlign: "center",
          color: "rgba(255,255,255,0.55)",
          fontSize: 11,
          letterSpacing: "0.08em",
          fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', monospace",
          pointerEvents: "none",
        }}
      >
        DEBUG: SPLASH v117 - visible={String(visible)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SplashContent — all animation keyframes + logo + dots
// ─────────────────────────────────────────────────────────────────────────────

function SplashContent() {
  // Shield rendered at 112 px — large enough to show all detail at 3× retina
  const size      = 112;
  const h         = Math.round(size * 1.1);   // 123 px — maintains 100:110 viewBox ratio
  // EKG stroke weight formula mirrors ekgStroke() in RegPulseLogo.tsx
  const sw        = Math.max(3.5, Math.min(7.0, size * 0.13)); // → 7.0 at 112 px
  const wideSD    = +(sw * 0.75).toFixed(1);  // corona blur radius
  const tightSD   = +(sw * 0.28).toFixed(1);  // inner glow radius
  const coronaOp  = Math.min(0.68, 0.48 + sw * 0.028).toFixed(2); // opacity of cyan corona

  return (
    <>
      {/* ── CSS animation keyframes ────────────────────────────────────────── */}
      <style>{`
        @keyframes rps89-ring-a {
          0%   { transform: scale(0.88); opacity: 0.50; }
          50%  { transform: scale(1.14); opacity: 0.12; }
          100% { transform: scale(0.88); opacity: 0.50; }
        }
        @keyframes rps89-ring-b {
          0%   { transform: scale(1.00); opacity: 0.28; }
          50%  { transform: scale(1.30); opacity: 0.06; }
          100% { transform: scale(1.00); opacity: 0.28; }
        }
        @keyframes rps89-ekg-scan {
          0%   { stroke-dashoffset: 110;  opacity: 0.55; }
          55%  { stroke-dashoffset: 0;    opacity: 1.00; }
          100% { stroke-dashoffset: -110; opacity: 0.55; }
        }
        @keyframes rps89-enter {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1.00); }
        }
        @keyframes rps89-dot {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.30; }
          40%            { transform: scale(1.00); opacity: 0.85; }
        }
        .rps89-logo {
          animation: rps89-enter 0.75s ease-out both;
        }
        .rps89-shield-wrap {
          filter: drop-shadow(0 0 14px rgba(34,211,238,0.20));
          will-change: transform;
          backface-visibility: hidden;
        }
        .rps89-ekg-path {
          stroke-dasharray: 110;
          animation: rps89-ekg-scan 1.9s ease-in-out infinite;
        }
        .rps89-dot1 { animation: rps89-dot 1.4s ease-in-out 0.00s infinite; }
        .rps89-dot2 { animation: rps89-dot 1.4s ease-in-out 0.20s infinite; }
        .rps89-dot3 { animation: rps89-dot 1.4s ease-in-out 0.40s infinite; }
      `}</style>

      {/* ── Pulsing rings behind the shield ──────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          width: 234, height: 258,
          borderRadius: "50%",
          border: "1.5px solid rgba(34,211,238,0.38)",
          animation: "rps89-ring-a 2.4s ease-in-out infinite",
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 188, height: 208,
          borderRadius: "50%",
          border: "1px solid rgba(34,211,238,0.20)",
          animation: "rps89-ring-b 2.4s ease-in-out 0.7s infinite",
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      />

      {/* ── Logo group (shield + wordmark) ───────────────────────────────── */}
      <div className="rps89-logo" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        {/* Shield + EKG — glowing wrapper */}
        <div className="rps89-shield-wrap">
          <svg
            width={size}
            height={h}
            viewBox="0 0 100 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ display: "block" }}
          >
            <defs>
              {/* Shield gradient layers — mirrors RegPulseLogo.tsx exactly */}
              <linearGradient id="rps89-r1" x1="12" y1="4" x2="88" y2="107" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#90b4d8" />
                <stop offset="28%"  stopColor="#5f86be" />
                <stop offset="65%"  stopColor="#2c5080" />
                <stop offset="100%" stopColor="#182e56" />
              </linearGradient>
              <linearGradient id="rps89-r2" x1="17" y1="9" x2="83" y2="103" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#496ba0" />
                <stop offset="55%"  stopColor="#213c68" />
                <stop offset="100%" stopColor="#101e40" />
              </linearGradient>
              <linearGradient id="rps89-r3" x1="21" y1="13" x2="79" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#324e76" />
                <stop offset="100%" stopColor="#0c1c3a" />
              </linearGradient>

              {/* Shield ambient halo */}
              <filter id="rps89-halo" x="-18" y="-14" width="136" height="138"
                filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feColorMatrix in="blur" type="matrix"
                  values="0 0 0 0 0.18  0 0 0 0 0.36  0 0 0 0 0.66  0 0 0 0.28 0"
                  result="halo" />
                <feMerge>
                  <feMergeNode in="halo" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* EKG neon glow — scaled corona for large render */}
              <filter id="rps89-ekg" x="0" y="0" width="100" height="110"
                filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceGraphic" stdDeviation={wideSD} result="wide" />
                <feColorMatrix in="wide" type="matrix"
                  values={`0 0 0 0 0.04  0 0 0 0 0.82  0 0 0 0 0.88  0 0 0 ${coronaOp} 0`}
                  result="corona" />
                <feGaussianBlur in="SourceGraphic" stdDeviation={tightSD} result="tight" />
                <feMerge>
                  <feMergeNode in="corona" />
                  <feMergeNode in="tight" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Shield body — 4 gradient layers + specular highlights */}
            <path d="M50 4 L88 18 L88 64 Q88 91 50 107 Q12 91 12 64 L12 18 Z"
              fill="url(#rps89-r1)" filter="url(#rps89-halo)" />
            <path d="M50 9 L83 21 L83 64 Q83 88 50 103 Q17 88 17 64 L17 21 Z"
              fill="url(#rps89-r2)" />
            <path d="M50 13 L79 24 L79 64 Q79 86 50 100 Q21 86 21 64 L21 24 Z"
              fill="url(#rps89-r3)" />
            <path d="M50 17 L75 27 L75 64 Q75 84 50 97 Q25 84 25 64 L25 27 Z"
              fill="#0b1628" />
            <line x1="50" y1="4"  x2="88" y2="18"
              stroke="rgba(255,255,255,0.42)" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="50" y1="4"  x2="12" y2="18"
              stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" strokeLinecap="round" />

            {/* Animated EKG — scan animation, neon cyan glow */}
            <path
              className="rps89-ekg-path"
              d="M30 57 L38 57 L41 63 L45 40 L51 74 L55 57 L70 57"
              fill="none"
              stroke="#22d3ee"
              strokeWidth={sw}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#rps89-ekg)"
            />
          </svg>
        </div>

        {/* Wordmark — system font, no web font load */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1,
            color: "#ffffff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}>
            RegPulse
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "#22d3ee",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}>
            AI
          </span>
        </div>
      </div>

      {/* ── Loading dots ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          gap: 8,
          bottom: "max(52px, calc(env(safe-area-inset-bottom) + 32px))",
        }}
      >
        <div className="rps89-dot1" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee" }} />
        <div className="rps89-dot2" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee" }} />
        <div className="rps89-dot3" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee" }} />
      </div>
    </>
  );
}
