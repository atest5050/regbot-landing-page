// Changes summary (v6 — responsive stroke weight):
//
// ROOT CAUSE OF DISTORTION
// ─────────────────────────
// SVG strokeWidth is expressed in viewBox units (our viewBox is 100×110).
// A fixed strokeWidth=5.5 renders as:
//   5.5 / 100 × 26px = 1.43px  (chat header — barely visible)
//   5.5 / 100 × 34px = 1.87px  (sidebar)
//   5.5 / 100 × 60px = 3.30px  (hero — too heavy)
//
// The proportion to the shield is IDENTICAL at every size, which means the
// EKG always looks the same weight relative to the shield — and the glow
// filter makes it look bloated at small sizes because the corona radius is
// also a fixed viewBox-unit value.
//
// THE FIX — responsive stroke + glow
// ────────────────────────────────────
// strokeWidth is now computed as:  Math.max(2.5, Math.min(7, size × 0.13))
//
//   size=26  →  sw=3.4  →  3.4/100×26 = 0.88px  (crisp, light)
//   size=32  →  sw=4.2  →  4.2/100×32 = 1.34px  (clean, readable)
//   size=34  →  sw=4.4  →  4.4/100×34 = 1.50px
//   size=36  →  sw=4.7  →  4.7/100×36 = 1.69px
//   size=60  →  sw=7.0  →  7.0/100×60 = 4.20px  (bold, hero-weight)
//
// This produces a stroke that is PROPORTIONALLY THINNER at smaller sizes,
// which is exactly what looks correct to the eye.
//
// Glow filter stdDeviation scales with strokeWidth:
//   wide corona:  sw × 0.75   (4→2.5 at 26px, →5.2 at 60px)
//   tight glow:   sw × 0.28   (4→0.9 at 26px, →1.8 at 60px)
// Smaller shields get a tighter, more precise neon edge; larger shields
// get a more prominent halo.
//
// FILTER ID UNIQUENESS
// ─────────────────────
// The EKG filter uses size-derived IDs so each rendered size gets its own
// correctly-tuned filter. Shield gradients + halo share fixed IDs (they're
// identical across all sizes, so the browser reusing the first definition
// causes no visual difference).
//
// EKG PATH (symmetric, centered, final)
// ───────────────────────────────────────
// Interior: y=17–97 (span 80), centre y=57. Amplitude ±17 units.
// Horizontal: active zone x=41–55, flanked by flat sections x=30–41 and x=55–70.
// Visual centre of active zone ≈ x=48, close to shield midpoint x=50.
//
//   M30 57   flat left entry (inside interior, ~5 units from left wall at y=57)
//   L38 57 → baseline continues
//   L41 63   P-Q dip  (6 units DOWN — subtle pre-spike step)
//   L45 40   QRS peak (17 units ABOVE baseline y=57 → y=40; 23 units from top)
//   L51 74   S-wave   (17 units BELOW baseline y=57 → y=74; 23 units from bottom)
//   L55 57   return to baseline
//   L70 57   flat right tail
//
// Peak and trough are ±17 units from baseline — true amplitude symmetry.
// Top clearance: y=40 − y=17 = 23 units. Bottom: y=97 − y=74 = 23 units.
//
// Exports (unchanged interface — no changes needed in placement files):
//   RegPulseIcon(size)                    — shield + EKG, no text
//   RegPulseLogoFull(shieldSize, layout)  — shield + "RegPulse" + "AI"

"use client";

import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Stroke-weight formula
// ─────────────────────────────────────────────────────────────────────────────

/** Returns EKG strokeWidth in viewBox units for a given shield render size. */
function ekgStroke(size: number): number {
  // Linear scale with hard clamps so tiny icons don't vanish and large
  // hero versions don't look cartoonish.
  return Math.max(2.5, Math.min(7.0, size * 0.13));
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG primitives — inline defs, rendered inside each <svg> element
// ─────────────────────────────────────────────────────────────────────────────

interface DefsProps {
  ekgFilterId: string;  // unique per stroke-weight bucket (e.g. "rp6-ekg-42")
  sw: number;           // strokeWidth in viewBox units
}

function Defs({ ekgFilterId, sw }: DefsProps) {
  // Glow radii scale with stroke weight so thin strokes get tight, precise
  // neon edges and thick strokes get a wider, more dramatic corona.
  const wideSD   = +(sw * 0.75).toFixed(1);
  const tightSD  = +(sw * 0.28).toFixed(1);
  const coronaOp = Math.min(0.68, 0.48 + sw * 0.028).toFixed(2);

  return (
    <defs>
      {/* ── Shield ring gradients (shared IDs — identical across all sizes) ── */}

      <linearGradient id="rp6-r1" x1="12" y1="4" x2="88" y2="107" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#90b4d8" />
        <stop offset="28%"  stopColor="#5f86be" />
        <stop offset="65%"  stopColor="#2c5080" />
        <stop offset="100%" stopColor="#182e56" />
      </linearGradient>

      <linearGradient id="rp6-r2" x1="17" y1="9" x2="83" y2="103" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#496ba0" />
        <stop offset="55%"  stopColor="#213c68" />
        <stop offset="100%" stopColor="#101e40" />
      </linearGradient>

      <linearGradient id="rp6-r3" x1="21" y1="13" x2="79" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#324e76" />
        <stop offset="100%" stopColor="#0c1c3a" />
      </linearGradient>

      {/* ── Shield ambient halo (shared ID) ─────────────────────────────── */}
      <filter id="rp6-halo" x="-18" y="-14" width="136" height="138"
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

      {/* ── EKG neon glow — unique ID per stroke-weight bucket ──────────────
          filterUnits="userSpaceOnUse" with full-viewBox bounds (0 0 100 110)
          ensures the corona is NEVER clipped regardless of render size.
          stdDeviation values scale with sw so:
            small icons → tight, crisp glow
            large icons → dramatic corona                                      */}
      <filter id={ekgFilterId}
        x="0" y="0" width="100" height="110"
        filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        {/* Wide corona */}
        <feGaussianBlur in="SourceGraphic" stdDeviation={wideSD} result="wide" />
        <feColorMatrix in="wide" type="matrix"
          values={`0 0 0 0 0.04  0 0 0 0 0.82  0 0 0 0 0.88  0 0 0 ${coronaOp} 0`}
          result="corona" />
        {/* Tight inner glow */}
        <feGaussianBlur in="SourceGraphic" stdDeviation={tightSD} result="tight" />
        <feMerge>
          <feMergeNode in="corona" />
          <feMergeNode in="tight" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function ShieldPaths() {
  return (
    <>
      <path d="M50 4 L88 18 L88 64 Q88 91 50 107 Q12 91 12 64 L12 18 Z"
        fill="url(#rp6-r1)" filter="url(#rp6-halo)" />
      <path d="M50 9 L83 21 L83 64 Q83 88 50 103 Q17 88 17 64 L17 21 Z"
        fill="url(#rp6-r2)" />
      <path d="M50 13 L79 24 L79 64 Q79 86 50 100 Q21 86 21 64 L21 24 Z"
        fill="url(#rp6-r3)" />
      {/* Deep navy interior */}
      <path d="M50 17 L75 27 L75 64 Q75 84 50 97 Q25 84 25 64 L25 27 Z"
        fill="#0b1628" />
      {/* Specular highlights at the top-center notch */}
      <line x1="50" y1="4"  x2="88" y2="18"
        stroke="rgba(255,255,255,0.42)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="50" y1="4"  x2="12" y2="18"
        stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" strokeLinecap="round" />
    </>
  );
}

interface EkgPathProps {
  ekgFilterId: string;
  sw: number;
}

function EkgPath({ ekgFilterId, sw }: EkgPathProps) {
  return (
    <path
      // Symmetric EKG centered at (x≈48, y=57):
      //   M30 57  flat left entry
      //   L38 57  → baseline
      //   L41 63  P-Q dip (6↓, subtle)
      //   L45 40  QRS peak (17↑ above y=57)
      //   L51 74  S-wave trough (17↓ below y=57) ← equal amplitude
      //   L55 57  return to baseline
      //   L70 57  flat right tail
      d="M30 57 L38 57 L41 63 L45 40 L51 74 L55 57 L70 57"
      fill="none"
      stroke="#22d3ee"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      filter={`url(#${ekgFilterId})`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RegPulseIcon — shield + EKG only
// Chat sidebar, chat header bar, bot message avatars
// ─────────────────────────────────────────────────────────────────────────────

export interface RegPulseIconProps {
  /** Rendered width in px. Height auto-scales at 1.1× (100:110 viewBox). */
  size?: number;
  className?: string;
}

export function RegPulseIcon({ size = 32, className = "" }: RegPulseIconProps) {
  const h  = Math.round(size * 1.1);
  const sw = ekgStroke(size);
  // Round sw to 1 decimal place, convert "4.2" → "42" for a valid XML ID.
  const ekgFilterId = `rp6-ekg-${sw.toFixed(1).replace(".", "")}`;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rp-icon-svg shrink-0 ${className}`.trim()}
      style={{ display: "block" }}
      role="img"
      aria-label="RegPulse"
    >
      <Defs ekgFilterId={ekgFilterId} sw={sw} />
      <ShieldPaths />
      <EkgPath ekgFilterId={ekgFilterId} sw={sw} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RegPulseLogoFull — shield + "RegPulse" + "AI" stacked wordmark
// Landing page: navbar, footer, demo teaser header
// ─────────────────────────────────────────────────────────────────────────────

export interface RegPulseLogoFullProps {
  /** Width of the shield in px. Text sizes scale proportionally. */
  shieldSize?: number;
  /** "beside" — horizontal (navbar, footer). "stacked" — vertical (hero). */
  layout?: "beside" | "stacked";
  className?: string;
}

export function RegPulseLogoFull({
  shieldSize = 36,
  layout = "beside",
  className = "",
}: RegPulseLogoFullProps) {
  const nameFs = Math.round(shieldSize * 0.54);
  const aiFs   = Math.round(shieldSize * 0.35);
  const aiMt   = Math.round(shieldSize * 0.05);

  if (layout === "stacked") {
    return (
      <div
        className={`rp-logomark flex flex-col items-center ${className}`.trim()}
        role="img"
        aria-label="RegPulse AI"
      >
        <RegPulseIcon size={shieldSize} />
        <span style={{ fontSize: nameFs, fontWeight: 700, letterSpacing: "-0.01em",
          lineHeight: 1.1, color: "inherit", marginTop: Math.round(shieldSize * 0.12) }}>
          RegPulse
        </span>
        <span style={{ fontSize: aiFs, fontWeight: 600, letterSpacing: "0.08em",
          color: "#22d3ee", marginTop: aiMt }}>
          AI
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rp-logomark flex items-center gap-2.5 ${className}`.trim()}
      role="img"
      aria-label="RegPulse AI"
    >
      <RegPulseIcon size={shieldSize} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontSize: nameFs, fontWeight: 700, letterSpacing: "-0.01em",
          color: "inherit" }}>
          RegPulse
        </span>
        <span style={{ fontSize: aiFs, fontWeight: 600, letterSpacing: "0.08em",
          color: "#22d3ee", marginTop: aiMt }}>
          AI
        </span>
      </div>
    </div>
  );
}
