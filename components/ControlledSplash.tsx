// vUnified-20260414-national-expansion-v137 — GPU compositing: will-change:all on container
//   + -webkit-transform-style:preserve-3d on container + rpc-shield-wrap + ring divs for WKWebView
//   compositor layer promotion. Strongest available GPU hints on every animated element.
//   Duration contract: navigating splash 30ms (page.tsx prop, v129+), launch 1200ms unchanged.
//
// ControlledSplash: full RegPulse shield (4-layer gradient + specular highlights) + pulsing
//   background rings + animated cyan EKG wave. No wordmark. No loading dots. No debug text.
//   Identical visual to AppSplashOverlay SplashContent except without wordmark/dots.
//
// CSS animation names use rpc-* prefix to avoid collision with rps89-* in AppSplashOverlay.
// SVG filter/gradient IDs use rpc-* prefix for the same reason.
//
// Timer flow (no cleanup return — fires unconditionally on WKWebView cold launch):
//   Mount → internal timer starts (duration ms) → fade out (400ms CSS transition) → onHide().
//   Total time from mount to onHide: duration + 400ms.
//   firedRef guard: onHide is called exactly ONCE regardless of re-renders.
//
// Duration contract:
//   1200ms — initial app launch (NativeApp, passed explicitly from app/page.tsx)
//   30ms   — Pro/Business navigation splash after auth (v129, reduced from 50ms)
//
// visible prop: when false returns null immediately (parent controls mount via conditional).
//   The internal timer still fires — onHide is called regardless. For NativeApp, visible is
//   always true when mounted (parent conditionally renders this component).
//
// GPU compositing: translateZ(0), willChange:opacity, backfaceVisibility:hidden on container.
//   Shield wrap: will-change:transform, backface-visibility:hidden + static drop-shadow.
//   Pulsing rings: will-change:transform, backface-visibility:hidden.
//   No per-frame drop-shadow filter animation (CPU raster path on WKWebView — v107 finding).

"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface ControlledSplashProps {
  /** When false, component immediately returns null (parent controls mount via conditional). */
  visible: boolean;
  /** Called after the internal timer fires and the 400ms fade completes. Fired exactly once. */
  onHide: () => void;
  /** ms before fade starts. 1200ms for launch, 800ms for navigation. Default 1200ms. */
  duration?: number;
}

export default function ControlledSplash({ visible, onHide, duration = 1200 }: ControlledSplashProps) {
  const [fading, setFading] = useState(false);
  // Always call latest onHide even if prop changes across renders
  const onHideRef = useRef(onHide);
  useEffect(() => { onHideRef.current = onHide; }, [onHide]);
  // Guard: onHide fires exactly once — prevents double-fire if parent re-renders during fade
  const firedRef = useRef(false);

  console.log("[v120][ControlledSplash] render — visible:", visible, "fading:", fading, "duration:", duration);

  // vUnified-20260414-national-expansion-v120 — No cleanup return. Fires unconditionally.
  // cleanup return caused silent timer cancellation on WKWebView lifecycle events (v109 finding).
  // firedRef guards both timeouts: outer prevents double setFading, inner prevents double onHide.
  // onHide fires AFTER the 400ms CSS fade so the splash is fully transparent before navigation
  // starts. NativeApp.handleNavSplashHide adds an additional 50ms delay before window.location
  // to let React commit the final frame before WKWebView starts the page transition.
  useEffect(() => {
    console.log("[v120][ControlledSplash] timer started — duration:", duration);
    setTimeout(() => {
      if (firedRef.current) return; // guard: prevents double setFading on unexpected re-fire
      console.log("[v120][ControlledSplash] timer fired — fade started");
      setFading(true);
      setTimeout(() => {
        if (firedRef.current) return;
        firedRef.current = true;
        console.log("[v120][ControlledSplash] fade done — calling onHide");
        onHideRef.current();
      }, 400);
    }, duration);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentional, no deps, no cleanup

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        background: "radial-gradient(ellipse at 50% 38%, #0d2450 0%, #0b1830 48%, #060e1c 100%)",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s ease-out",
        pointerEvents: fading ? "none" : "auto",
        // vUnified-20260414-national-expansion-v120 — Strengthened GPU compositing.
        // will-change: transform + opacity → dedicated compositor layer for both properties.
        // translateZ(0) forces layer promotion on WKWebView (same as v107 AppSplashOverlay fix).
        // vUnified-20260414-national-expansion-v122 — strongest GPU compositing hints.
        // will-change:all → compositor layer for every animatable property.
        // translateZ(0) + preserve-3d → force separate compositor layer on WKWebView.
        willChange: "all",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        WebkitTransformStyle: "preserve-3d",
      }}
    >
      <ShieldContent />
      {/* vUnified-20260414-national-expansion-v137 — debug: version label on splash */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: "max(28px,env(safe-area-inset-bottom,28px))", left: 0, right: 0, textAlign: "center", color: "rgba(34,211,238,0.45)", fontSize: 10, fontFamily: "ui-monospace,'SF Mono',monospace", pointerEvents: "none" }}>
        v149
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ShieldContent — full shield + rings + EKG (no wordmark, no loading dots)
// Geometry and gradients mirror AppSplashOverlay SplashContent exactly.
// All CSS animation / SVG IDs use rpc-* prefix to avoid rps89-* collision.
// ─────────────────────────────────────────────────────────────────────────────

function ShieldContent() {
  // Shield rendered at 112px — matches AppSplashOverlay
  const size     = 112;
  const h        = Math.round(size * 1.1);  // 123px — maintains 100:110 viewBox ratio
  // EKG stroke weight formula mirrors AppSplashOverlay / RegPulseLogo.tsx exactly
  const sw       = Math.max(3.5, Math.min(7.0, size * 0.13)); // 7.0 at 112px
  const wideSD   = +(sw * 0.75).toFixed(1);  // corona blur radius → 5.3
  const tightSD  = +(sw * 0.28).toFixed(1);  // inner glow radius  → 2.0
  const coronaOp = Math.min(0.68, 0.48 + sw * 0.028).toFixed(2); // → 0.68

  return (
    <>
      {/* ── CSS keyframes — rpc-* prefix avoids collision with rps89-* ──────── */}
      <style>{`
        @keyframes rpc-ring-a {
          0%   { transform: scale(0.88); opacity: 0.50; }
          50%  { transform: scale(1.14); opacity: 0.12; }
          100% { transform: scale(0.88); opacity: 0.50; }
        }
        @keyframes rpc-ring-b {
          0%   { transform: scale(1.00); opacity: 0.28; }
          50%  { transform: scale(1.30); opacity: 0.06; }
          100% { transform: scale(1.00); opacity: 0.28; }
        }
        @keyframes rpc-ekg-scan {
          0%   { stroke-dashoffset: 110;  opacity: 0.55; }
          55%  { stroke-dashoffset: 0;    opacity: 1.00; }
          100% { stroke-dashoffset: -110; opacity: 0.55; }
        }
        @keyframes rpc-enter {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1.00); }
        }
        .rpc-ring-a {
          animation: rpc-ring-a 2.4s ease-in-out infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
        .rpc-ring-b {
          animation: rpc-ring-b 2.4s ease-in-out 0.7s infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
        .rpc-shield-wrap {
          filter: drop-shadow(0 0 14px rgba(34,211,238,0.20));
          will-change: transform, opacity;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          -webkit-transform-style: preserve-3d;
          transform: translateZ(0);
          animation: rpc-enter 0.75s ease-out both;
        }
        .rpc-ekg-path {
          stroke-dasharray: 110;
          animation: rpc-ekg-scan 1.9s ease-in-out infinite;
        }
      `}</style>

      {/* ── Pulsing rings behind the shield — same dimensions as AppSplashOverlay ── */}
      {/* vUnified-20260414-national-expansion-v123 — GPU hints on every animated element */}
      <div
        className="rpc-ring-a"
        style={{
          position: "absolute",
          width: 234,
          height: 258,
          borderRadius: "50%",
          border: "1.5px solid rgba(34,211,238,0.38)",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitTransformStyle: "preserve-3d",
        }}
      />
      <div
        className="rpc-ring-b"
        style={{
          position: "absolute",
          width: 188,
          height: 208,
          borderRadius: "50%",
          border: "1px solid rgba(34,211,238,0.20)",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitTransformStyle: "preserve-3d",
        }}
      />

      {/* ── Shield + EKG — glowing wrapper ───────────────────────────────────── */}
      <div className="rpc-shield-wrap">
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
            {/* Shield gradient layers — mirrors AppSplashOverlay / RegPulseLogo.tsx exactly */}
            <linearGradient id="rpc-r1" x1="12" y1="4" x2="88" y2="107" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#90b4d8" />
              <stop offset="28%"  stopColor="#5f86be" />
              <stop offset="65%"  stopColor="#2c5080" />
              <stop offset="100%" stopColor="#182e56" />
            </linearGradient>
            <linearGradient id="rpc-r2" x1="17" y1="9" x2="83" y2="103" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#496ba0" />
              <stop offset="55%"  stopColor="#213c68" />
              <stop offset="100%" stopColor="#101e40" />
            </linearGradient>
            <linearGradient id="rpc-r3" x1="21" y1="13" x2="79" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#324e76" />
              <stop offset="100%" stopColor="#0c1c3a" />
            </linearGradient>

            {/* Shield ambient halo — same blur/color as AppSplashOverlay */}
            <filter
              id="rpc-halo"
              x="-18"
              y="-14"
              width="136"
              height="138"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.18  0 0 0 0 0.36  0 0 0 0 0.66  0 0 0 0.28 0"
                result="halo"
              />
              <feMerge>
                <feMergeNode in="halo" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* EKG neon glow — two-layer: wide corona + tight inner — same as AppSplashOverlay */}
            <filter
              id="rpc-ekg"
              x="0"
              y="0"
              width="100"
              height="110"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation={wideSD} result="wide" />
              <feColorMatrix
                in="wide"
                type="matrix"
                values={`0 0 0 0 0.04  0 0 0 0 0.82  0 0 0 0 0.88  0 0 0 ${coronaOp} 0`}
                result="corona"
              />
              <feGaussianBlur in="SourceGraphic" stdDeviation={tightSD} result="tight" />
              <feMerge>
                <feMergeNode in="corona" />
                <feMergeNode in="tight" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shield body — 4 gradient layers + specular highlights */}
          <path
            d="M50 4 L88 18 L88 64 Q88 91 50 107 Q12 91 12 64 L12 18 Z"
            fill="url(#rpc-r1)"
            filter="url(#rpc-halo)"
          />
          <path
            d="M50 9 L83 21 L83 64 Q83 88 50 103 Q17 88 17 64 L17 21 Z"
            fill="url(#rpc-r2)"
          />
          <path
            d="M50 13 L79 24 L79 64 Q79 86 50 100 Q21 86 21 64 L21 24 Z"
            fill="url(#rpc-r3)"
          />
          <path
            d="M50 17 L75 27 L75 64 Q75 84 50 97 Q25 84 25 64 L25 27 Z"
            fill="#0b1628"
          />
          <line
            x1="50" y1="4" x2="88" y2="18"
            stroke="rgba(255,255,255,0.42)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <line
            x1="50" y1="4" x2="12" y2="18"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* Animated EKG — scan animation, neon cyan glow */}
          <path
            className="rpc-ekg-path"
            d="M30 57 L38 57 L41 63 L45 40 L51 74 L55 57 L70 57"
            fill="none"
            stroke="#22d3ee"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#rpc-ekg)"
          />
        </svg>
      </div>
    </>
  );
}
