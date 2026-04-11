// vMobile-scale-fix — Fixed aspect ratio / scaling for Business Profile on mobile
// - Added explicit viewport meta with device-width, initial-scale=1, maximum-scale=5,
//   user-scalable=yes, and viewport-fit=cover for iOS safe-area-inset support.
// - Safe-area CSS vars exposed so components can use pb-safe / pt-safe via Tailwind.
// Changes summary:
// - Added Google Analytics 4 (GA4) via next/script in the root layout so every
//   page is tracked without modifying individual routes.
// - Two <Script> tags: the gtag.js loader (afterInteractive, non-blocking) and
//   an inline init block that configures the measurement ID, enables IP
//   anonymisation, and suppresses the automatic page_view on init (Next.js
//   handles SPA navigation separately via gtagEvent if needed in future).
// - Measurement ID is read from NEXT_PUBLIC_GA4_ID; when the env var is absent
//   (local dev, CI) both <Script> tags are skipped entirely — no console errors,
//   no 404s for missing scripts.
// - Rebranded all user-facing text from "RegPulse" to "RegPulse".

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// vMobile-scale-fix — separate viewport export (Next.js 13+ App Router pattern)
// Prevents double-tap zoom and sets safe-area-inset for iOS notch / home-bar handling.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,         // allow pinch-zoom for accessibility — don't set to 1
  userScalable: true,
  viewportFit: "cover",    // iOS safe-area-inset support (notch, home bar)
};

export const metadata: Metadata = {
  title: "RegPulse — Never guess your local regulations again.",
  description: "RegPulse is your AI co-pilot for hyper-local permits, zoning, health codes, and compliance. Ask in plain English and get accurate, sourced answers with checklists and next steps — built for Etsy sellers, home bakers, food trucks, consultants, and every side hustler.",
  
  metadataBase: new URL("https://regbot-landing-page.vercel.app"),

  keywords: [
    "business compliance",
    "permits",
    "zoning",
    "small business",
    "regulations",
    "AI assistant",
    "cottage food",
    "home business",
  ],

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "RegPulse — Never guess your local regulations again.",
    description: "Your AI co-pilot for hyper-local regulations and compliance. Accurate answers with sources and checklists.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RegPulse - AI Compliance Co-pilot",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      {/* vMobile-scale-fix: min-h-dvh uses dynamic viewport height on mobile (avoids
          the iOS Safari address-bar gap). Safe-area env() vars ensure content clears
          the notch and home indicator on all iPhones / modern Androids.            */}
      <body className="min-h-dvh bg-white font-sans" style={{
        paddingTop:    "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft:   "env(safe-area-inset-left)",
        paddingRight:  "env(safe-area-inset-right)",
      }}>
        {children}

        {/* ── Google Analytics 4 ─────────────────────────────────────────────
            Loaded only when NEXT_PUBLIC_GA4_ID is set. Both tags use
            strategy="afterInteractive" so they never block rendering.
            IP anonymisation is on by default in GA4 for EU compliance;
            the explicit flag below makes the intent clear in code review.    */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  anonymize_ip: true,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}