"use client";

// vUnified-platform-fix: RegPulseLoader — animated miniature RegPulse shield + EKG wave
// Replaces the Loader2 spinner in the chat message-loading bubble.
// Shield path and EKG polyline points match RegPulseLogo.tsx exactly.
// The EKG wave is drawn with a CSS stroke-dasharray scan animation (1.6 s cycle).

export function RegPulseLoader({ size = 18 }: { size?: number }) {
  const h = Math.round(size * 1.1);
  // Approximate total polyline segment length in the 100×110 viewBox:
  // (30→38)=8, (38→41,57→63)≈6.7, (41→45,63→40)≈23.3, (45→51,40→74)≈34.5,
  // (51→55,74→57)≈17.5, (55→70)=15  →  total ≈ 105; use 110 for margin.
  const ekgLen = 110;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <style>{`
        @keyframes rpl-shield-pulse {
          0%, 100% { fill-opacity: 0.10; }
          50%       { fill-opacity: 0.24; }
        }
        @keyframes rpl-ekg-scan {
          0%   { stroke-dashoffset: ${ekgLen};  opacity: 0.5; }
          55%  { stroke-dashoffset: 0;          opacity: 1;   }
          100% { stroke-dashoffset: -${ekgLen}; opacity: 0.5; }
        }
        .rpl-shield-fill {
          animation: rpl-shield-pulse 1.6s ease-in-out infinite;
        }
        .rpl-ekg-wave {
          stroke-dasharray: ${ekgLen};
          animation: rpl-ekg-scan 1.6s ease-in-out infinite;
        }
      `}</style>

      {/* Shield body — matches RegPulseLogo.tsx path exactly */}
      <path
        className="rpl-shield-fill"
        d="M50 6 L88 20 L88 54 C88 76 70 96 50 104 C30 96 12 76 12 54 L12 20 Z"
        fill="#2563eb"
        fillOpacity="0.10"
        stroke="#2563eb"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* EKG wave — animated scan, matches RegPulseLogo.tsx polyline exactly */}
      <polyline
        className="rpl-ekg-wave"
        points="30,57 38,57 41,63 45,40 51,74 55,57 70,57"
        stroke="#22d3ee"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
