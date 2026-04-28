// vUnified-20260414-national-expansion-v276 — Boot layer hidden on non-root pages:
//   html.rp-not-root #rp-boot{display:none!important} CSS + Layer 1 script adds rp-not-root class
//   to <html> on any page that is not the root ('/'), eliminating z-500 boot layer overlap with
//   AppSplashOverlay (z-400) on /chat/ and all other pages — the "blurry/bouncing shield" artifact.
//
// v106 base — Final aggressive root route fix for physical iPhone:
//   forces custom splash + onboarding on native launch (no blank blue screen).
//
// ROOT CAUSE of blank dark blue screen (v89–v105): Two separate failure modes converged:
//   A. JS bundle parse gap (2–4 s on physical iPhone): WKWebView renders the SSG HTML but the
//      React-driven AppSplashOverlay logo content has animation-fill-mode:both on .rps89-logo,
//      which starts the logo group at opacity:0. The background gradient IS visible immediately,
//      but it is indistinguishable from the WKWebView backgroundColor (#0B1E3F) to the user.
//      The rings and dots are faint (50%/30% opacity). Net effect: branded but "blank"-looking.
//   B. Pre-React gap: Even though the html{background:radial-gradient(...)} CSS is in <head>,
//      the AppSplashOverlay shield + EKG + wordmark require the .rps89-* CSS animation classes
//      (defined in a <style> tag inside the component) to render — which is correct in the SSG
//      HTML. BUT the entrance animation starts at opacity:0 and fades in over 0.75 s, so during
//      the JS parse window the content is invisible.
//
// v106 FIX — Native Boot Layer (zero-React, zero-JS dependency):
//   A DIRECT <div id="rp-boot"> is rendered in <body> for Capacitor builds (IS_CAPACITOR_BUILD=true).
//   It is server-rendered into the SSG HTML by Next.js at build time (process.env check is evaluated
//   at compile time). Contents: identical gradient + shield SVG + "RegPulse AI" wordmark + animated
//   dots — all visible from byte 0, before ANY JavaScript runs. z-index:500 (above AppSplashOverlay).
//
//   Once React hydrates (typically 2–4 s on physical iPhone), an afterInteractive <Script> fades
//   the boot layer out over 400 ms. By this time AppSplashOverlay's 0.75 s entrance animation is
//   complete, its animations are running, and the visual handoff is seamless.
//
//   Web deployment (Vercel): process.env.NEXT_PUBLIC_IS_CAPACITOR !== 'true' → no boot layer
//   rendered. Zero impact on landing page or web users.
//
// vUnified-20260414-national-expansion-v105 — No redirect from root for native users.
//   Layer 1 (inline script in <head>) restores opacity immediately for all native users.
//   NativeApp (app/page.tsx) owns all native routing for both returning and first-time users.
//   Returning users: 500ms splash → /chat/ with rp_skip_splash=1.
//   First-time users: 2s splash → OnboardingFlow → /chat/.
//
// vUnified-20260414-national-expansion-v104 — Splash background CSS in <head>, preserved
//   out/index.html SSG output (no bare redirect overwrite in cap-build.js).
//
// vUnified-20260414-national-expansion-v103 — Layer 1 checks rp_onboarded_v1 before redirect.
// vMobile-scale-fix — viewport meta, safe-area env() padding, h-dvh.
// vMobile-final-fix — Google Ads gtag.js in <head>.
// vUnified-platform-fix — updated favicon to shield + EKG SVG.

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
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
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
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "RegPulse — Never guess your local regulations again.",
    description: "Your AI co-pilot for hyper-local regulations and compliance. Accurate answers with sources and checklists.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "RegPulse - AI Compliance Co-pilot" }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // vUnified-20260414-national-expansion-v106 — Build-time native flag (server component).
  // Evaluated at compile time by Next.js — true for `npm run build:cap`, false for web builds.
  const isCapacitorBuild = process.env.NEXT_PUBLIC_IS_CAPACITOR === "true";

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* ── vUnified-20260414-national-expansion-v104 — Splash background CSS ──────────
            Pure CSS applied during HTML parsing, before ANY JavaScript or external CSS.
            Sets html background to the same radial gradient used by AppSplashOverlay.
            Eliminates the WKWebView background-color (#0B1E3F flat) gap.
            Web users: body { bg-white } from Tailwind overrides this once CSS bundle loads. */}
        <style dangerouslySetInnerHTML={{ __html:
          `html{margin:0;background:radial-gradient(ellipse at 50% 38%,#0d2450 0%,#0b1830 48%,#060e1c 100%)!important}html.rp-not-root #rp-boot{display:none!important}`
        }} />

        {/* ── vUnified-20260414-national-expansion-v153 — Layer 0: skip-splash + loop-break ──
            EARLIEST POSSIBLE: fires during HTML <head> parsing, before ANY JavaScript
            module loads, before React initializes, before chat/page.tsx chunk is fetched.

            v129 LOOP-BREAK STRENGTHENED: checks BOTH localStorage AND sessionStorage for
            rp_onboarded_v1. Also checks rp_skip_splash in both stores. Uses absolute URL
            (origin + '/chat/') matching OnboardingFlow.handleFreeSkip navigation.

            v127 LOOP-BREAK: if pathname==='/' AND rp_onboarded_v1 is set in localStorage,
            immediately redirect to '/chat/'. Breaks the SW-miss splash loop at the earliest
            possible point — even before NativeApp mounts — so phase='splash' never runs.

            Signals checked (any one sufficient):
              1. localStorage rp_skip_splash === '1'
              2. sessionStorage rp_skip_splash === '1'
              3. localStorage rp_onboarded_v1 === '1' (when on root path)
              4. sessionStorage rp_onboarded_v1 === '1' (when on root path)
              5. URLSearchParams force=1 fallback redirect */}
        <script
          dangerouslySetInnerHTML={{
            // vUnified-20260414-national-expansion-v140 — Layer 0 strengthened.
            // Pre-navigation blocker: immediately sets dark background on documentElement
            // via setProperty('important') so no white flash is visible regardless of what
            // CSS or React renders on top. Fires before ANY JavaScript, CSS, or React.
            __html: `(function(){
              try{
                var p=window.location.pathname;
                var qs=window.location.search;
                var origin=window.location.origin;
                var chatUrl=origin+'/chat/';
                var onRoot=(p==='/'||p===''||p==='/index.html');
                // v140: immediately darken html+body on every native page load — belt-and-suspenders
                // against any white flash before React or CSS hydrates.
                try{document.documentElement.style.setProperty('background','radial-gradient(ellipse at 50% 38%,#0d2450 0%,#0b1830 48%,#060e1c 100%)','important');}catch(_){}
                try{document.documentElement.style.setProperty('background-color','#060e1c','important');}catch(_){}
                if(onRoot){
                  var ob1=false,ob2=false;
                  try{ob1=localStorage.getItem('rp_onboarded_v1')==='1';}catch(_){}
                  try{ob2=sessionStorage.getItem('rp_onboarded_v1')==='1';}catch(_){}
                  if(ob1||ob2){window.location.replace(chatUrl);return;}
                }
                var skipUrl=(qs.indexOf('skip=1')!==-1)||(qs.indexOf('force=1')!==-1);
                var skipLocal=false,skipSession=false;
                try{skipLocal=localStorage.getItem('rp_skip_splash')==='1';}catch(_){}
                try{skipSession=sessionStorage.getItem('rp_skip_splash')==='1';}catch(_){}
                if(skipUrl||skipLocal||skipSession){
                  window.__SKIP_SPLASH=true;
                  try{localStorage.removeItem('rp_skip_splash');}catch(_){}
                  try{sessionStorage.removeItem('rp_skip_splash');}catch(_){}
                }
                if(qs.indexOf('force=1')!==-1){
                  if(p!=='/chat'&&p!=='/chat/'){window.location.replace(chatUrl);}
                }
              }catch(e){}
            })();`,
          }}
        />

        {/* ── vUnified-20260414-national-expansion-v106 — Layer 1: native detection ─────
            LAYER 1 (earliest possible): synchronous parser-blocking inline script.
            Fires during HTML parsing, BEFORE any CSS, BEFORE React hydrates.

            v106 change: opacity trick removed for native users — the native boot layer
            (z-500, rendered in <body> below) covers the screen from byte 0 without
            needing to hide the html element. Opacity trick kept for web only to prevent
            any theoretical FOUC during landing page hydration.

            Native detection order (same as app/page.tsx detectNativeRuntime()):
              1. window.Capacitor.isNativePlatform() — primary Capacitor bridge check.
              2. window.location.protocol === 'capacitor:' — iOS WKWebView URL scheme.
              3. href prefix capacitor:// or RegPulse:// — belt-and-suspenders.
              4. window.webkit.messageHandlers.bridge — WKWebView message handler API.

            No redirect from root or /chat/ — NativeApp in app/page.tsx owns all routing.
            Edge-case redirect only for unexpected deep-link paths.                        */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try{
                var n=false;
                var c=window.Capacitor;
                if(c&&typeof c.isNativePlatform==='function')n=c.isNativePlatform();
                if(!n)n=(window.location.protocol==='capacitor:');
                if(!n)try{var h=window.location.href;n=(h.indexOf('capacitor://')===0||h.indexOf('RegPulse://')===0);}catch(_){}
                if(!n)try{n=!!(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.bridge);}catch(_){}
                if(!n){
                  // Web browser only: opacity trick prevents any flash during landing page hydration.
                  // Native: no opacity trick needed — boot layer (z-500) covers screen from byte 0.
                  document.documentElement.style.opacity='0';
                  document.documentElement.style.opacity='';
                }
                if(n){
                  var p=window.location.pathname;
                  // Hide boot layer on all non-root pages (boot layer is root-only).
                  if(p!=='/'&&p!=='index.html'&&p!=='/index.html'){
                    document.documentElement.classList.add('rp-not-root');
                  }
                  // Edge case: redirect from unexpected deep-link paths.
                  // Root ('/', 'index.html') and /chat/ are handled by NativeApp (app/page.tsx).
                  if(p!=='/'&&p!=='index.html'&&p!=='/index.html'&&p!=='/chat'&&p!=='/chat/'){
                    window.location.replace('/chat/');
                  }
                }
              }catch(e){}
            })();`,
          }}
        />

        {/* ── Google Ads conversion tag ──────────────────────────────────────────────
            Server-rendered <script> tags so the global site tag fires on every page
            before any client JS runs. Required for Waitlist Signup conversion tracking.  */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18059886296"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18059886296');
            `,
          }}
        />
      </head>

      {/* vMobile-scale-fix: min-h-dvh uses dynamic viewport height on mobile.
          Safe-area env() vars ensure content clears notch and home indicator.  */}
      <body className="min-h-dvh bg-white font-sans" style={{
        paddingTop:    "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft:   "env(safe-area-inset-left)",
        paddingRight:  "env(safe-area-inset-right)",
      }}>
        {/* ── vUnified-20260414-national-expansion-v106 — Native Boot Layer ────────────
            ZERO-REACT, ZERO-JS dependency. Server-rendered into SSG HTML by Next.js at
            compile time (isCapacitorBuild is a build-time constant from process.env).

            WHY: AppSplashOverlay's .rps89-logo has animation-fill-mode:both which starts
            the logo group at opacity:0 for 750ms. During the JS bundle parse window
            (2–4 s on physical iPhone), the branded content is invisible — the gradient
            background is indistinguishable from WKWebView backgroundColor (#0B1E3F).

            THIS LAYER provides immediate, visible branded content (shield SVG + wordmark
            + animated dots) from the very first HTML byte, before ANY JavaScript runs.
            z-index:500 — above AppSplashOverlay (z-400) — guaranteed to be on top.

            REMOVAL: An afterInteractive <Script> below fades this layer out over 400ms
            once React hydrates. By that time the .rps89-enter animation (750ms) is
            complete and AppSplashOverlay's animated content matches this layer visually.
            The handoff is seamless — rings, EKG scan, and dots are all running.

            WEB BUILD (isCapacitorBuild=false): this block is NOT rendered — zero impact
            on the landing page or web users. Only in Capacitor static export.            */}
        {isCapacitorBuild && (
          <div
            id="rp-boot"
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 500,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(ellipse at 50% 38%, #0d2450 0%, #0b1830 48%, #060e1c 100%)",
              userSelect: "none",
              overflow: "hidden",
            }}
          >
            {/* Boot layer CSS animations — identical keyframes to AppSplashOverlay but
                scoped to #rp-boot so they don't conflict with rps89-* class animations. */}
            {/* vUnified-20260414-national-expansion-v139 — !important on boot layer background
                prevents any cascaded style from overriding the navy background during JS parse gap. */}
            <style dangerouslySetInnerHTML={{ __html: `
              #rp-boot{background:radial-gradient(ellipse at 50% 38%,#0d2450 0%,#0b1830 48%,#060e1c 100%)!important;opacity:1!important;visibility:visible!important;}
              @keyframes rpb-ring-a{0%{transform:scale(.88);opacity:.50}50%{transform:scale(1.14);opacity:.12}100%{transform:scale(.88);opacity:.50}}
              @keyframes rpb-ring-b{0%{transform:scale(1);opacity:.28}50%{transform:scale(1.30);opacity:.06}100%{transform:scale(1);opacity:.28}}
              @keyframes rpb-dot{0%,80%,100%{transform:scale(.55);opacity:.30}40%{transform:scale(1);opacity:.85}}
              #rp-boot .rpb-d1{animation:rpb-dot 1.4s ease-in-out 0s infinite}
              #rp-boot .rpb-d2{animation:rpb-dot 1.4s ease-in-out .2s infinite}
              #rp-boot .rpb-d3{animation:rpb-dot 1.4s ease-in-out .4s infinite}
            `}} />

            {/* Pulsing rings — same dimensions as AppSplashOverlay */}
            <div style={{ position: "absolute", width: 234, height: 258, borderRadius: "50%", border: "1.5px solid rgba(34,211,238,0.38)", animation: "rpb-ring-a 2.4s ease-in-out infinite" }} />
            <div style={{ position: "absolute", width: 188, height: 208, borderRadius: "50%", border: "1px solid rgba(34,211,238,0.20)", animation: "rpb-ring-b 2.4s ease-in-out 0.7s infinite" }} />

            {/* Shield SVG — same shape and gradients as AppSplashOverlay, no filter animations */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              <svg width="112" height="123" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: "block" }}>
                <defs>
                  <linearGradient id="rpb-r1" x1="12" y1="4" x2="88" y2="107" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#90b4d8" />
                    <stop offset="28%" stopColor="#5f86be" />
                    <stop offset="65%" stopColor="#2c5080" />
                    <stop offset="100%" stopColor="#182e56" />
                  </linearGradient>
                  <linearGradient id="rpb-r2" x1="17" y1="9" x2="83" y2="103" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#496ba0" />
                    <stop offset="55%" stopColor="#213c68" />
                    <stop offset="100%" stopColor="#101e40" />
                  </linearGradient>
                  <linearGradient id="rpb-r3" x1="21" y1="13" x2="79" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#324e76" />
                    <stop offset="100%" stopColor="#0c1c3a" />
                  </linearGradient>
                </defs>
                {/* Shield body layers — matching AppSplashOverlay exactly */}
                <path d="M50 4 L88 18 L88 64 Q88 91 50 107 Q12 91 12 64 L12 18 Z" fill="url(#rpb-r1)" />
                <path d="M50 9 L83 21 L83 64 Q83 88 50 103 Q17 88 17 64 L17 21 Z" fill="url(#rpb-r2)" />
                <path d="M50 13 L79 24 L79 64 Q79 86 50 100 Q21 86 21 64 L21 24 Z" fill="url(#rpb-r3)" />
                <path d="M50 17 L75 27 L75 64 Q75 84 50 97 Q25 84 25 64 L25 27 Z" fill="#0b1628" />
                <line x1="50" y1="4" x2="88" y2="18" stroke="rgba(255,255,255,0.42)" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="50" y1="4" x2="12" y2="18" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" strokeLinecap="round" />
                {/* EKG path — static (no dasharray animation); neon cyan fill */}
                <path d="M30 57 L38 57 L41 63 L45 40 L51 74 L55 57 L70 57" fill="none" stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              </svg>

              {/* Wordmark — system font, no web font dependency */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1, color: "#ffffff", fontFamily: "system-ui, sans-serif" }}>
                  RegPulse
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.22em", color: "#22d3ee", fontFamily: "system-ui, sans-serif" }}>
                  AI
                </span>
              </div>
            </div>

            {/* Loading dots — animated, matching AppSplashOverlay dot timing exactly */}
            <div style={{ position: "absolute", bottom: "max(52px, calc(env(safe-area-inset-bottom) + 32px))", display: "flex", alignItems: "center", gap: 8 }}>
              <div className="rpb-d1" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee" }} />
              <div className="rpb-d2" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee" }} />
              <div className="rpb-d3" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee" }} />
            </div>
          </div>
        )}

        {children}

        {/* ── vUnified-20260414-national-expansion-v106 — Remove boot layer after React hydrates ─
            afterInteractive fires once React has hydrated the page and the JS bundle is ready.
            By this point AppSplashOverlay's 0.75s entrance animation is complete (logo at opacity:1)
            and all CSS animations are running (EKG scan, ring pulse, dots). Fade the boot layer
            out over 400ms so the handoff to AppSplashOverlay is imperceptible to the user.
            On web builds (isCapacitorBuild=false): this script is not rendered — no-op.           */}
        {isCapacitorBuild && (
          <Script id="remove-boot" strategy="afterInteractive">
            {`
              (function(){
                var el = document.getElementById('rp-boot');
                if (!el) return;
                el.style.transition = 'opacity 0.4s ease-out';
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
                setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 450);
              })();
            `}
          </Script>
        )}

        {/* ── vUnified-20260414-national-expansion-v276 — free tier watcher moved to NativeApp ──
            v272–v275 used an afterInteractive Script here to detect window.__rpStartFreeTriggered
            and navigate via requestAnimationFrame + setTimeout(0). SIGKILL 9 persisted because
            window.location.replace triggers WKWebView document navigation regardless of deferral.
            v276 FIX: watcher moved back into React NativeApp useEffect — but now calls
            setShowChat(true) instead of window.location.replace. React renders <ChatPage />
            in-place on the same document. No navigation → no SIGKILL 9.                        */}

        {/* ── PWA Service Worker — vUnified-20260414-national-expansion-v16 ─────────────── */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `}
        </Script>

        {/* ── Google Analytics 4 ─────────────────────────────────────────────────────────
            Loaded only when NEXT_PUBLIC_GA4_ID is set. afterInteractive — never blocks rendering.
            IP anonymisation on by default in GA4; explicit flag makes intent clear in review.    */}
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
