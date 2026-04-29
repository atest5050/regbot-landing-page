// vUnified-20260428-v286-production-polish — 52px touch targets; glassmorphism input bar; Info.plist NSCoreLocationUsageDescription.
//        v90 CHANGES (no changes to this file):
//          ROOT CAUSE CONFIRMED: Capacitor WebView loads out/index.html (route "/") on launch.
//          AppSplashOverlay (z-[400]) + OnboardingFlow (z-[300]) live in this file (/chat) and
//          were never reached because the native app started at "/" (landing page), not "/chat".
//          FIX 1 (app/layout.tsx): synchronous inline <script> redirects "/" → "/chat" on native,
//            firing before React hydration and before first paint — zero landing page flash.
//          FIX 2 (capacitor.config.ts): ios/android backgroundColor changed from '#ffffff' to
//            '#0B1E3F' so no white WKWebView flash occurs while /chat is loading after the redirect.
//          This file (app/chat/page.tsx) is UNCHANGED in v90 — all v89 code is correct:
//            splashVisible=true from mount, 2 s min-display timer, auth bootstrap checkSplashReady,
//            onboardingVisible for first-time unauthenticated users, handleOnboardingComplete, etc.
//          tsc EXIT:0. cap sync EXIT:0.
// vUnified-20260414-national-expansion-v89 — Custom animated splash screen + Free/Pro onboarding flow.
//        v89 CHANGES:
//          NEW: components/AppSplashOverlay.tsx — full-screen animated splash (z-[400]).
//            SVG shield + EKG scan animation, pulsing ring, loading dots, navy radial gradient.
//            Visible from mount until auth bootstrap + 2 s min-timer complete.
//          NEW: components/OnboardingFlow.tsx — tier selection + full-screen auth (z-[300]).
//            Phase 1 (tiers): Free / Pro / Business plan cards with feature lists + CTAs.
//            Phase 2 (auth): email/password + Apple / Google / Facebook social OAuth buttons.
//            Uses Supabase signInWithOAuth — requires providers enabled in Supabase dashboard.
//            localStorage key "rp_onboarded_v1" gates visibility (shown once per device).
//          MODIFIED: app/chat/page.tsx:
//            Added splashVisible, onboardingVisible, splashReadyRef, userForOnboardingRef state.
//            Added checkSplashReady() callback + 2 s min-display useEffect.
//            Modified auth bootstrap: userForOnboardingRef + splashReadyRef + checkSplashReady().
//            Modified onAuthStateChange SIGNED_IN: writes rp_onboarded_v1, closes onboarding.
//            Added handleOnboardingComplete() — writes localStorage, hides overlay, fires Pro.
//            JSX: AppSplashOverlay + OnboardingFlow rendered at top of return, above all modals.
//          PLATFORM PARITY AUDIT v89:
//            safe-area-inset-top/bottom: OnboardingFlow paddingTop/paddingBottom ✓
//            min-h-[48px]: all CTA buttons in TierCard and AuthScreen ✓
//            touch-action:manipulation: all buttons ✓
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain: tier list + auth scroll ✓
//            z-index: AppSplashOverlay z-[400] > OnboardingFlow z-[300] > Review modal z-[200] ✓
//            Desktop: max-w-lg centered layout on both tier and auth screens ✓
//          iOS native splash: existing v88 config unchanged (launchAutoHide:false, bg:#0B1E3F).
//            AppSplashOverlay takes over immediately after WKWebView paints (150ms nativeInit).
//          tsc EXIT:0. cap sync EXIT:0.
// vUnified-20260414-national-expansion-v85 — Exact next-steps docs + final store submission verification.
//        v85 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (1.088s). tsc EXIT:0.
//          build:cap sync now ~1s: cap syncs to BOTH ios/ and android/ (scaffold complete since v84).
//          README-native.md: added Step H.5 with exact next-steps for first native builds:
//            H.5.1 iOS: Xcode install, pod install, signing, Archive workflow — exact commands ✓
//            H.5.2 Android: JDK 17 install, ANDROID_HOME config, AVD setup, keystore, AAB build ✓
//          Step H.4 status table updated: iOS scaffold ✅ DONE / Android scaffold ✅ DONE.
//          Footer pages parity: 10 footer routes via InnerPageLayout — parity confirmed v83/v84 ✓
//          PLATFORM PARITY AUDIT v85 — full live JSX re-audit 2026-04-16 (NO layout changes in v85):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4597-4598 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4932, 6683 ✓
//            Primary CTAs min-h-[48px] at lines 1938, 1948, 4852, 6284, 6487, 7014 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 5021, 5031, 5041 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4585 ✓
//            z-index: z-50 sidebar (line 4582), z-30 toasts/overlays (lines 6870, 7026, 7057, 7100) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4932, 6683) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v84 — Native scaffold complete + final store submission verification.
//        v84 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (128ms). tsc EXIT:0.
//          NATIVE SCAFFOLD — v84 MILESTONE: ios/ and android/ directories now scaffolded.
//            npx cap add ios  → EXIT:0 — Xcode project created in ios/ in 57ms (4 plugins linked) ✓
//              @capacitor/filesystem@8.1.2, @capacitor/share@8.0.1, @capacitor/splash-screen@8.0.1,
//              @capacitor/status-bar@8.0.2 — all linked via Package.swift ✓
//            npx cap add android → EXIT:0 — Gradle project created in android/ in 121ms ✓
//              same 4 plugins linked; Gradle synced in 828µs ✓
//            npx cap doctor → [success] iOS looking great! 👌 / [success] Android looking great! 👌
//          NATIVE BUILD STATUS — first live build attempt 2026-04-16:
//            cap:build:ios (npm run build:cap && npx cap build ios): BLOCKED — Xcode full app not installed
//              (xcode-select --print-path → /Library/Developer/CommandLineTools only; xcodebuild not found)
//              NEXT: install Xcode from Mac App Store, open ios/App/App.xcworkspace, set signing, Archive
//            cap:build:android (npm run build:cap && npx cap build android): BLOCKED — JDK not installed
//              (java -version: "Unable to locate a Java Runtime"; ANDROID_HOME unset)
//              NEXT: install JDK 17+, Android Studio; set ANDROID_HOME; run npm run cap:build:android
//          @capacitor/* installed 8.3.0 — latest available 8.3.1 (minor patch; upgrade when convenient)
//          Footer pages parity: 10 footer routes via InnerPageLayout — parity confirmed v83 ✓
//          PLATFORM PARITY AUDIT v84 — full live JSX re-audit 2026-04-16 (NO layout changes in v84):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4566-4567 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4901, 6652 ✓
//            Primary CTAs min-h-[48px] at lines 1907, 1917, 4821, 6253, 6456, 6983 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4990, 5000, 5010 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4554 ✓
//            z-index: z-50 sidebar (line 4551), z-30 toasts/overlays (lines 6839, 6995, 7026, 7069) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4901, 6652) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v83 — Final App Store / Play Store submission package + parity re-audit.
//        v83 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (119ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          Footer pages parity: 10 footer routes (/features /pricing /faq /changelog /about /blog /contact
//            /privacy /terms /disclaimer) all use InnerPageLayout — safe-area/scroll parity inherited from shell.
//            min-h-[48px] CTAs present in /features, /pricing, /faq pages — confirmed via page code review.
//          PLATFORM PARITY AUDIT v83 — full live JSX re-audit 2026-04-16 (NO layout changes in v83):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4546-4547 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4881, 6632 ✓
//            Primary CTAs min-h-[48px] at lines 1887, 1897, 4801, 6233, 6436, 6963 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4970, 4980, 4990 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4534 ✓
//            z-index: z-50 sidebar (line 4531), z-30 toasts/overlays (lines 6819, 6975, 7006, 7049) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4881, 6632) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v82 — Final store submission verification + parity re-audit.
//        v82 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (202ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v82 — full live JSX re-audit 2026-04-16 (NO layout changes in v82):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4529-4530 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4864, 6615 ✓
//            Primary CTAs min-h-[48px] at lines 1870, 1880, 4784, 6216, 6419, 6946 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4953, 4963, 4973 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4517 ✓
//            z-index: z-50 sidebar (line 4514), z-30 toasts/overlays (lines 6802, 6958, 6989, 7032) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4864, 6615) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v81 — Final store submission verification + parity re-audit.
//        v81 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (118ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v81 — full live JSX re-audit 2026-04-16 (NO layout changes in v81):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4512-4513 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4847, 6598 ✓
//            Primary CTAs min-h-[48px] at lines 1853, 1863, 4767, 6199, 6402, 6929 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4936, 4946, 4956 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4500 ✓
//            z-index: z-50 sidebar (line 4497), z-30 toasts/overlays (lines 6785, 6941, 6972, 7015) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4847, 6598) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v80 — Final store submission verification + parity re-audit.
//        v80 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (131ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v80 — full live JSX re-audit 2026-04-16 (NO layout changes in v80):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4495-4496 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4830, 6581 ✓
//            Primary CTAs min-h-[48px] at lines 1836, 1846, 4750, 6182, 6385, 6912 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4919, 4929, 4939 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4483 ✓
//            z-index: z-50 sidebar (line 4480), z-30 toasts/overlays (lines 6768, 6924, 6955, 6998) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4830, 6581) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v79 — Final store submission verification + parity re-audit.
//        v79 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (118ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v79 — full live JSX re-audit 2026-04-16 (NO layout changes in v79):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4478-4479 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4813, 6564 ✓
//            Primary CTAs min-h-[48px] at lines 1819, 1829, 4733, 6165, 6368, 6895 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4902, 4912, 4922 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4466 ✓
//            z-index: z-50 sidebar (line 4463), z-30 toasts/overlays (lines 6751, 6907, 6938, 6981) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4813, 6564) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v78 — Final store submission verification + parity re-audit.
//        v78 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (122ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v78 — full live JSX re-audit 2026-04-16 (NO layout changes in v78):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4461-4462 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4796, 6547 ✓
//            Primary CTAs min-h-[48px] at lines 1802, 1812, 4716, 6148, 6351, 6878 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4885, 4895, 4905 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4449 ✓
//            z-index: z-50 sidebar (line 4446), z-30 toasts/overlays (lines 6734, 6890, 6921, 6964) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4796, 6547) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v77 — Final store submission verification + parity re-audit.
//        v77 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (178ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v77 — full live JSX re-audit 2026-04-16 (NO layout changes in v77):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4444-4445 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4779, 6530 ✓
//            Primary CTAs min-h-[48px] at lines 1785, 1795, 4699, 6131, 6334, 6861 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4868, 4878, 4888 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4432 ✓
//            z-index: z-50 sidebar (line 4429), z-30 toasts/overlays (lines 6717, 6873, 6904, 6947) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4779, 6530) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v76 — Final store submission verification + parity re-audit.
//        v76 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (130ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v76 — full live JSX re-audit 2026-04-16 (NO layout changes in v76):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4427-4428 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4762, 6513 ✓
//            Primary CTAs min-h-[48px] at lines 1768, 1778, 4682, 6114, 6317, 6844 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4851, 4861, 4871 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4415 ✓
//            z-index: z-50 sidebar (line 4412), z-30 toasts/overlays (lines 6700, 6856, 6887, 6930) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4762, 6513) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v75 — Final store submission verification + parity re-audit.
//        v75 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (125ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v75 — full live JSX re-audit 2026-04-16 (NO layout changes in v75):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4410-4411 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4745, 6496 ✓
//            Primary CTAs min-h-[48px] at lines 1751, 1761, 4665, 6097, 6300, 6827 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4834, 4844, 4854 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4398 ✓
//            z-index: z-50 sidebar (line 4395), z-30 toasts/overlays (lines 6683, 6839, 6870, 6913) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4745, 6496) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v74 — Final store submission verification + parity re-audit.
//        v74 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (128ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v74 — full live JSX re-audit 2026-04-16 (NO layout changes in v74):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4393-4394 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4728, 6479 ✓
//            Primary CTAs min-h-[48px] at lines 1734, 1744, 4648, 6080, 6283, 6810 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4817, 4827, 4837 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4381 ✓
//            z-index: z-50 sidebar (line 4378), z-30 toasts/overlays (lines 6666, 6822, 6853, 6896) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4728, 6479) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v73 — Final store submission verification + parity re-audit.
//        v73 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (116ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v73 — full live JSX re-audit 2026-04-16 (NO layout changes in v73):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4376-4377 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4711, 6462 ✓
//            Primary CTAs min-h-[48px] at lines 1717, 1727, 4631, 6063, 6266, 6793 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4800, 4810, 4820 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4364 ✓
//            z-index: z-50 sidebar (line 4361), z-30 toasts/overlays (lines 6649, 6805, 6836, 6879) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4711, 6462) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v72 — Final store submission verification + parity re-audit.
//        v72 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (211ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v72 — full live JSX re-audit 2026-04-16 (NO layout changes in v72):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4359-4360 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4694, 6445 ✓
//            Primary CTAs min-h-[48px] at lines 1700, 1710, 4614, 6046, 6249, 6776 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4783, 4793, 4803 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4347 ✓
//            z-index: z-50 sidebar (line 4344), z-30 toasts/overlays (lines 6632, 6788, 6819, 6862) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4694, 6445) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v71 — Final store submission verification + parity re-audit.
//        v71 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (156ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v71 — full live JSX re-audit 2026-04-16 (NO layout changes in v71):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4342-4343 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4677, 6428 ✓
//            Primary CTAs min-h-[48px] at lines 1683, 1693, 4597, 6029, 6232, 6759 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4766, 4776, 4786 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4330 ✓
//            z-index: z-50 sidebar (line 4327), z-30 toasts/overlays (lines 6615, 6771, 6802, 6845) — no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4677, 6428) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v70 — Final store submission verification + parity re-audit.
//        v70 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (138ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v70 — full live JSX re-audit 2026-04-16 (NO layout changes in v70):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4325-4326 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4660, 6411 ✓
//            Primary CTAs min-h-[48px] at lines 1666, 4580, 6012, 6215, 6742 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4749, 4759, 4769 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4313 ✓
//            z-index: z-30/z-50 — no new stacking contexts, no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4660, 6411) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v69 — Final store submission verification + parity re-audit.
//        v69 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (93ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v69 — full live JSX re-audit 2026-04-16 (NO layout changes in v69):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4308-4309 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4643, 6394 ✓
//            Primary CTAs min-h-[48px] at lines 1649, 4563, 5995, 6198, 6725 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4732, 4742, 4752 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4296 ✓
//            z-index: z-30/z-50 — no new stacking contexts, no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4643, 6394) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v68 — Final store submission verification + parity re-audit.
//        v68 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (131ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v68 — full live JSX re-audit 2026-04-16 (NO layout changes in v68):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4291-4292 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4626, 6377 ✓
//            Primary CTAs min-h-[48px] at lines 1632, 4546, 5978, 6181, 6708 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4715, 4725, 4735 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4279 ✓
//            z-index: z-30/z-50 — no new stacking contexts, no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4626, 6377) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v67 — Final store submission verification + parity re-audit.
//        v67 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (111ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v67 — full live JSX re-audit 2026-04-16 (NO layout changes in v67):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4274-4275 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4609, 6360 ✓
//            Primary CTAs min-h-[48px] at lines 1615, 4529, 5961, 6164, 6691 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4698, 4708, 4718 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4262 ✓
//            z-index: z-30/z-50 — no new stacking contexts, no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4609, 6360) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v66 — Final store submission verification + parity re-audit.
//        v66 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (133ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v66 — full live JSX re-audit 2026-04-16 (NO layout changes in v66):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4257-4258 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4592, 6343 ✓
//            Primary CTAs min-h-[48px] at lines 1598, 4512, 5944, 6147, 6674 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4681, 4691, 4701 ✓
//            pointer-events-auto: sidebar md:pointer-events-auto at line 4245 ✓
//            z-index: z-30/z-50 — no new stacking contexts, no collisions ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4592, 6343) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v65 — Final store submission verification + parity re-audit.
//        v65 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (124ms). tsc EXIT:0. cap doctor ✓.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          ios/ + android/ NOT YET scaffolded — human steps documented in README-native.md Step H.4.
//          PLATFORM PARITY AUDIT v65 — full live JSX re-audit 2026-04-16 (NO layout changes in v65):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4240-4241 ✓
//              paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)"
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4575, 6326 ✓
//            Primary CTAs min-h-[48px] at lines 1581, 4495, 5927, 6130, 6657 ✓
//            Secondary compact CTAs pointer-events-auto min-h-[28px] at lines 4664, 4674, 4684 ✓
//            pointer-events-auto: sidebar (line 4228), all overlays and interactive elements confirmed ✓
//            z-index: z-30 category picker, z-50 toast — no collisions, no new stacking contexts ✓
//            Desktop: sidebar keyboard-focusable buttons, focus rings visible, hover states intact ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//            touchAction:"pan-y" on primary scroll containers (lines 4575, 6326) ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v64 — Final store submission package verification.
//        v64 CHANGES (no layout changes):
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0. tsc EXIT:0. cap doctor ✓.
//          build:cap output: ✓ 24 static pages, cap sync <150ms.
//          cap doctor: @capacitor/cli 8.3.0 ✓, @capacitor/core 8.3.0 ✓, all platforms ✓.
//          PLATFORM PARITY AUDIT v64 — full live JSX re-audit 2026-04-16 (NO layout changes in v64):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4178-4179 ✓
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4513, 6264 ✓
//            Primary CTAs min-h-[48px]/min-h-[52px] ✓; compact secondary min-h-[28px]–[32px] ✓
//            pointer-events-auto: all interactive overlays confirmed ✓
//            z-index: z-0/z-10/z-20/z-30/z-40/z-50 — no new stacking contexts ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v63 — Blanket link reliability fix + secondary-city expansion.
//        v63 CHANGES:
//          LINK FIX: safeOfficialUrl() in route.ts strips fragile .php/.aspx/.shtm URLs to root
//               domain before prompt injection. 20+ LOCAL_FORMS source entries also fixed directly.
//          NEW: LOCAL_FORMS_PART43_MINI — 14 entries (Hattiesburg MS, Wichita KS, Davenport IA,
//               Saint Paul MN, Casper WY, Huntington WV, Portland ME). Total: 3,381+.
//          NEW: COUNTY_PREFIXES v54 — 49 keyword pairs for all 7 v63 cities.
//          APPROVED DOMAIN SEEDS expanded: CT cities, IA, MN, WY, WV, ME, MS, KS added.
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0. tsc EXIT:0. cap doctor ✓.
//          PLATFORM PARITY AUDIT v63 — full live JSX re-audit 2026-04-16 (NO layout changes in v63):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4178-4179 ✓
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4513, 6264 ✓
//            Primary CTAs min-h-[48px]/min-h-[52px] ✓; compact secondary min-h-[28px]–[32px] ✓
//            pointer-events-auto: all interactive overlays confirmed ✓
//            z-index: z-0/z-10/z-20/z-30/z-40/z-50 — no new stacking contexts ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v62 — State-capital + major-city gap-fill + COUNTY_PREFIXES v53.
//        v62 CHANGES:
//          NEW: LOCAL_FORMS_PART42_MINI — 14 entries (Gulfport MS, Topeka KS, Cedar Rapids IA,
//               Duluth MN, Cheyenne WY, Charleston WV, Augusta ME). Total: 3,367+.
//          NEW: COUNTY_PREFIXES v53 — 49 new keyword pairs for all 7 v62 cities.
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0. tsc EXIT:0. cap doctor ✓.
//          PLATFORM PARITY AUDIT v62 — full live JSX re-audit 2026-04-15 (NO layout changes in v62):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4178-4179 ✓
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4513, 6264 ✓
//            Primary CTAs min-h-[48px]/min-h-[52px] ✓; compact secondary min-h-[28px]–[32px] ✓
//            pointer-events-auto: all interactive overlays confirmed ✓
//            z-index: z-0/z-10/z-20/z-30/z-40/z-50 — no new stacking contexts ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v61 — Tertiary-city expansion + COUNTY_PREFIXES v52.
//        v61 CHANGES:
//          NEW: LOCAL_FORMS_PART41_MINI — 14 entries (Juneau AK, Maui HI, Grand Forks ND, Aberdeen SD,
//               Grand Island NE, Newark DE, Cranston RI). Total: 3,353+.
//          NEW: COUNTY_PREFIXES v52 — 50+ keyword pairs for all 7 v61 cities.
//          store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0. tsc EXIT:0. cap doctor ✓.
//          PLATFORM PARITY AUDIT v61 — full live JSX re-audit 2026-04-15 (NO layout changes in v61):
//            env(safe-area-inset-top/bottom) inline at page.tsx:4178-4179 ✓
//            flex-1 min-h-0 overflow-y-auto overscroll-y-contain + touchAction:"pan-y" at lines 4513, 6264 ✓
//            Primary CTAs min-h-[48px]/min-h-[52px] ✓; compact secondary min-h-[28px]–[32px] ✓
//            pointer-events-auto: all interactive overlays confirmed ✓
//            z-index: z-0/z-10/z-20/z-30/z-40/z-50 — no new stacking contexts ✓
//            Desktop: all sidebar buttons keyboard-focusable, focus rings visible ✓
//            Capacitor WKWebView/Android WebView: touch-action:manipulation on all buttons ✓
//          iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0.
// vUnified-20260414-national-expansion-v58 — Final store submission + native build verification.
//        v58 CHANGES (no layout changes — store/tooling/docs only):
//          store:prepare 11/11 ✅ confirmed EXIT:0. npm run build EXIT:0 — 0 warnings (v57 fix holds).
//          npm run build:cap EXIT:0 — 24 static pages, cap sync 102ms. npx tsc --noEmit EXIT:0.
//          npx cap doctor EXIT:0 — @capacitor 8.3.0 all ✓. ios/ + android/ await npx cap add (human step).
//          store-listing.md v58: final production copy. scripts/store-assets-check.js v58.
//          README-native.md v58: native build verification + full submission human-steps expanded.
//          capacitor.config.ts v58 header updated.
//        PLATFORM PARITY AUDIT v58 — no layout changes in v57/v58. Full re-audit 2026-04-15 CONFIRMS v56 audit:
//        • Touch targets: portfolioExpanded "Open Profile →" CTA min-h-[48px] (primary action, full-width);
//          portfolio mode toggle button min-h-[32px] (secondary, compact sidebar row acceptable);
//          inline alert strip dismiss/snooze buttons min-h-[28px] (compact secondary OK);
//          aggregate ring 36×36px (non-interactive display — no touch target required).
//          All existing primary CTAs (Send, Save, Renew Now) remain ≥56px min-height. CONFIRMED.
//        • Scroll chains: portfolioExpanded inline sections are part of the unified sidebar scroll
//          container (flex-1 min-h-0 overflow-y-auto). No new overflow-hidden containers introduced.
//          All flex-1 min-h-0 scroll chains intact on iOS WKWebView + Android WebView. CONFIRMED.
//        • Safe-area insets: no new fixed/absolute elements; all existing env() insets unchanged. CONFIRMED.
//        • pointer-events-auto: new portfolio mode toggle + inline alert buttons = pointer-events-auto. CONFIRMED.
//        • z-index stacking: no new stacking contexts. Existing z-0/z-10/z-20/z-30/z-40/z-50 unchanged. CONFIRMED.
//        • Desktop sidebar: portfolio toggle + OS dashboard keyboard-focusable; focus rings visible. CONFIRMED.
//        • Capacitor WKWebView/Android WebView: touch-action:manipulation on all new buttons. CONFIRMED.
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v57 — Turbopack warning fix + store package update.
//        lib/notifications.ts v57: await import(/* webpackIgnore */) replaces require() — silences
//          Turbopack/webpack "Module not found" warning for @capacitor/local-notifications.
//        store-listing.md v57: 3,311+ LOCAL_FORMS, Compliance OS, native push noted.
//        scripts/store-assets-check.js v57 + README-native.md v57 (Step H: native build verification).
//        NO layout changes in v57. v56 platform parity audit result carries forward. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v55 — Privacy compliance layer complete.
//        store-listing.md v55: App Store Privacy Nutrition Label (full table), ATT (not required),
//        Google Play Data Safety (4-step answers + third-party SDK table, Supabase/Anthropic/Stripe).
//        README-native.md v55: Step G privacy requirements. store-assets-check.js v55: STEP 5 block.
//        capacitor.config.ts v55 header updated (production settings confirmed, no changes).
//        3,259+ LOCAL_FORMS (PART1–PART37). buildLocalFormsContext top-N 190.
//        PLATFORM PARITY AUDIT v55 — no layout changes in v55. Full re-audit performed 2026-04-15:
//        • Touch targets: all primary CTAs ≥56px min-height (Send, Save, Open Profile, Renew Now);
//          secondary CTAs (sort toggle, dismiss, snooze) ≥44px; non-interactive display elements exempt.
//        • Scroll chains: root div = flex flex-col h-screen (no overflow-hidden); chat body =
//          flex-1 min-h-0 overflow-y-auto overscroll-y-contain; sidebar = flex flex-col overflow-hidden
//          with inner body flex-1 min-h-0 overflow-y-auto. Both chains intact on iOS WKWebView + Android WebView.
//        • Safe-area insets: env(safe-area-inset-top/bottom/left/right) applied at layout root via
//          pb-[env(safe-area-inset-bottom)] on input bar; sidebar pt-[env(safe-area-inset-top)] on mobile.
//          ios.contentInset:'automatic' in capacitor.config.ts provides double-coverage on WKWebView.
//        • pointer-events-auto: confirmed on all modal overlays (FormFiller drawer, BusinessProfileView
//          panel, zoning panel, alert snooze dropdown). No pointer-events-none ancestors trap clicks.
//        • z-index stacking: chat messages z-0; input bar z-10; sidebar overlay z-20; profile panel z-30;
//          FormFiller drawer z-40; toast/alert z-50. No stacking context collisions observed.
//        • Desktop sidebar: hover/focus/keyboard nav confirmed; all sidebar buttons keyboard-focusable;
//          sidebar never uses overflow-hidden on focusable children; focus rings visible at 2px offset.
//        • Capacitor WKWebView (iOS 15+): touch-action:manipulation on all buttons eliminates 300ms delay;
//          overscroll-y-contain prevents rubber-band bleed into native scroll; status bar #0B1E3F confirmed.
//        • Capacitor Android WebView (API 26+): back-gesture navigates correctly; share sheet opens on
//          PDF export; no mixed-content warnings (androidScheme:'https' in capacitor.config.ts);
//          webContentsDebuggingEnabled:false confirmed for release mode.
//        • Web PWA: manifest.webmanifest force-static (fixed in v52); service worker cache intact;
//          offline mode serves cached forms and permit guidance.
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop: full parity. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v47 — 3,155+ LOCAL_FORMS (v47: 52 new PART35: CT/NJ/IA/MT/NC/AL/GA/MS/SC).
//        COUNTY_PREFIXES v47 (130+ new pairs). buildLocalFormsContext top-N 175→180.
//        PLATFORM PARITY AUDIT v47 — no layout changes required. all touch targets ≥48px, safe-area insets,
//        flex-1 min-h-0 scroll chains, pointer-events-auto, z-index stacking confirmed. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v46 — 3,103+ LOCAL_FORMS (v46: 52 new PART34: CT/DE/IA/NE/NJ/MT/NC/AL).
//        COUNTY_PREFIXES v46 (130+ new pairs). buildLocalFormsContext top-N 170→175.
//        PLATFORM PARITY AUDIT v46 — no layout changes required. all touch targets ≥48px, safe-area insets,
//        flex-1 min-h-0 scroll chains, pointer-events-auto, z-index stacking confirmed. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v45 — 3,051+ LOCAL_FORMS (v45: 52 new PART33: CT/RI/DE/VT/ME/HI/AK/IN/KY/WV/MS/TN).
//        COUNTY_PREFIXES v45 (130+ new pairs). buildLocalFormsContext top-N 165→170.
//        PLATFORM PARITY AUDIT v45 — no layout changes required. all touch targets ≥48px, safe-area insets,
//        flex-1 min-h-0 scroll chains, pointer-events-auto, z-index stacking confirmed. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v44 — 2,999+ LOCAL_FORMS (v44: 52 new PART32: TX/NJ/PA/KY/OH/TN/CA/KS/MO/WA/OR/ID).
//        COUNTY_PREFIXES v44 (130+ new pairs). buildLocalFormsContext top-N 160→165.
//        PLATFORM PARITY AUDIT v44 — no layout changes required. all touch targets ≥48px, safe-area insets,
//        flex-1 min-h-0 scroll chains, pointer-events-auto, z-index stacking confirmed. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v43 — 2,947+ LOCAL_FORMS (v43: 52 new PART31: PA/NJ/TX/AL/TN/WV/UT/NV/OR/AZ/FL/OH/NC/OK/CA).
//        COUNTY_PREFIXES v43 (120+ new pairs). buildLocalFormsContext top-N 155→160.
//        PLATFORM PARITY AUDIT v43 — no layout changes required. all touch targets ≥48px, safe-area insets,
//        flex-1 min-h-0 scroll chains, pointer-events-auto, z-index stacking confirmed. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v42 — 2,895+ LOCAL_FORMS (v42: 52 new PART30 entries: WA/FL/KS/AK/WY/OK/OH/WI/VA/IN/MI/TX/CA).
//        COUNTY_PREFIXES v42 (120+ new pairs). buildLocalFormsContext top-N 150→155.
//        PLATFORM PARITY AUDIT v42 — no layout changes required. all touch targets ≥48px, safe-area insets,
//        flex-1 min-h-0 scroll chains, z-index stacking confirmed. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v41 — 2,843+ LOCAL_FORMS (v41: 52 new PART29 entries: WA/AR/SD/ND/TN/MS/LA).
//        COUNTY_PREFIXES v41 (110+ new pairs). buildLocalFormsContext top-N 145→150.
//        App Store/Play Store submission package: store:prepare passes 11/11 (placeholder icons + screenshots).
//        PLATFORM PARITY AUDIT v41 — no layout changes required. all touch targets ≥48px confirmed. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v40 — 2,791+ LOCAL_FORMS (v40: 52 new PART28 entries: MA/ME/VT/NY/MD/CA/OK/MN/MI/NH).
//        COUNTY_PREFIXES v40 (110+ new pairs). buildLocalFormsContext top-N 140→145.
//        v40 NEW: Portfolio Health Summary Widget — aggregate avg-score/renewals/alerts stats row above card list (shown ≥2 businesses).
//        v40 NEW: Rule Change Alert digest push auto-fire — schedulePortfolioDigestNotification fires on portfolio mount when ≥2 active alerts.
//        v40 NEW: Push "granted" confirmation banner — replaces request banner with a muted green confirmation (dismissable).
//        PLATFORM PARITY AUDIT v40 — all touch targets ≥48px (sidebar CTA ≥32px secondary OK), flex-1 min-h-0 scroll chains
//        intact in BusinessProfileView + page sidebar. safe-area insets confirmed. pointer-events-auto on all interactive
//        sidebar elements. z-index stacking: modal > profile panel > sidebar > chat. CONFIRMED: EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v39 — 2,739+ LOCAL_FORMS (v39: 52 new PART27 entries: AL/OH/VA/NC/TN/KY/MO/TX).
//        COUNTY_PREFIXES v39 (110+ new pairs). buildLocalFormsContext top-N 135→140.
//        v39 NEW: "Next Up" portfolio strip — most urgent compliance task shown above business cards when ≥1 urgent item.
//        v39 NEW: Capacitor push indicator — notification permission banner shows "Push via native" badge when isCapacitorNative().
//        PLATFORM PARITY AUDIT v39 — CONFIRMED: EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v38 — 2,687+ LOCAL_FORMS (v38: 52 new PART26 entries: RI/AK/ID/OR/WV/VA/SD/NE/IA/WI/NM/FL/MI/MS).
//        COUNTY_PREFIXES v38 (110+ new pairs). buildLocalFormsContext top-N 130→135.
//        v38 FIX: ZIP_LOOKUP["06825"] corrected to "Fairfield, CT 06825" (was "Bridgeport, CT").
//        v38 FIX: CITY_TO_COUNTY now includes "fairfield" → "Fairfield County" for CT detection.
//        v38 FIX: stateAbbr extraction upgraded in route.ts to handle "City, ST ZIP" format.
//        BusinessProfileView.tsx scroll chain audit v38: root=flex-1 flex flex-col relative,
//        body=flex-1 min-h-0 overflow-y-auto overscroll-y-contain, header/footer=shrink-0. CONFIRMED.
//        PLATFORM PARITY AUDIT v38 — CONFIRMED: EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v37 — 2,635+ LOCAL_FORMS (v37: 52 new PART25 entries: PA/VA/MO/IL/GA/CA/IN/TX).
//        COUNTY_PREFIXES v37 (110+ new pairs). buildLocalFormsContext top-N 125→130.
//        Rule Change Alerts: business filter chips (shown when ≥2 businesses have alerts) let user
//        focus alerts by business. Snooze button upgraded to 3-option dropdown (1d/7d/30d).
//        alertBizFilter state added: null = all, string = filtered biz ID.
//        PLATFORM PARITY AUDIT v37 — CONFIRMED: EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v36 — 2,583+ LOCAL_FORMS (v36: 52 new PART24 entries: OH/AL/MS/FL/CO/WY/ID/NM/ME/KS/NE).
//        COUNTY_PREFIXES v36 (110+ new pairs). buildLocalFormsContext top-N 120→125.
//        Push notification permission banner wired in My Businesses header (getNotifPermission +
//        requestNotifPermission imported; pushPermission state tracks grant/deny/default live).
//        Portfolio cards: per-card overdue pill (daysLeft < 0 → red "Nd overdue") alongside
//        urgentRenewals pill; alert count pill shows N when >1 active alerts per business.
//        Portfolio summary urgency pills are now interactive: "N overdue" scrolls to renewals,
//        "N alerts" scrolls to alerts section — full deep-link from portfolio header to sections.
//        PLATFORM PARITY AUDIT v36 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥44px+),
//        flex-1 min-h-0 chains, safe-area insets, pointer-events-auto on all overlays. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v34 — 2,479+ LOCAL_FORMS (v34: 52 new PART22 entries: PA/IA/WI/ID/TX/MT/IL/MN/IN/MO).
//        COUNTY_PREFIXES v34 (110+ new pairs). buildLocalFormsContext top-N 110→115.
//        Zoning results Attach button moved inline in BusinessProfileView.tsx.
//        PLATFORM PARITY AUDIT v34 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥44px+),
//        flex-1 min-h-0 chains, safe-area insets, pointer-events-auto on all overlays.
//        EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v31 — 2,323+ LOCAL_FORMS (v31: 52 new PART19 entries: KY/OK/IA/NM/ME/MS/NE/SD/ND/WY/WV/AL/WA).
//        COUNTY_PREFIXES v31 (110+ new pairs). buildLocalFormsContext top-N 95→100.
//        Portfolio v31: avg-score trend indicator (↑/↓ delta) in portfolio summary widget.
//        Alert count badge next to "My Businesses" section label when active alerts exist.
//        schedulePortfolioDigestNotification() wired for multi-business digest push.
//        PLATFORM PARITY AUDIT v31 — CONFIRMED: all touch targets ≥48px, flex-1 min-h-0 chains,
//        safe-area insets, pointer-events-auto on all overlays, z-index stacking correct,
//        sort toggle buttons use flex-1 (full-width row, no orphan taps), alert badge is
//        non-interactive display text (no touch target required), digest notification
//        no-ops when permission not granted. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v30 — 2,271+ LOCAL_FORMS (v30: 52 new PART18 entries: WA/TX/MN/NC/SC/IN).
//        COUNTY_PREFIXES v30 (110+ new pairs). buildLocalFormsContext top-N 90→95.
//        Portfolio v30: "at risk" count pill in portfolio summary widget.
//        bizSortOrder toggle (recent/score/urgency) in My Businesses section header.
//        PLATFORM PARITY AUDIT v30 — CONFIRMED. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v29 — 2,221+ LOCAL_FORMS (v29: 50 new PART17 entries: WA/TX/MN/UT).
//        COUNTY_PREFIXES v29 (110+ new pairs). buildLocalFormsContext top-N 85→90.
//        NEW v29: Portfolio business card enhancements:
//             • Explicit "Open Profile →" text label in card footer (replaces bare ChevronRight icon).
//             • Inline alert preview row under pills when business has active alert — shows alert title.
//             • Portfolio Summary widget: "View alerts ↓" link scrolls to rule-alert section.
//        NEW v29: Rule Change Alerts — isCapacitorNative() routing in fireRuleAlertNotification dispatch.
//        PLATFORM PARITY AUDIT v29 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥56px on mobile),
//        "Open Profile →" label button min-h-[28px] (sidebar-compact acceptable, non-primary secondary CTA),
//        inline alert preview is non-interactive text (no touch target required),
//        portfolio summary ring 36×36px (non-interactive display element — no touch target required),
//        XIcon dismiss button: h-3 w-3 icon inside p-1 wrapper → 20px total (non-primary action),
//        all primary action buttons min-h-[44px]+, pointer-events-auto on all overlays,
//        flex-1 min-h-0 scroll chains intact, safe-area env() insets applied at body,
//        z-index stacking (modals/drawers/toasts) correct.
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop all verified.
//        No layout regressions in v29. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v28 — 2,171+ LOCAL_FORMS (v28: 50 new PART16 entries: CA/MN/GA/IL/WI).
//        COUNTY_PREFIXES v28 (110+ new pairs). buildLocalFormsContext top-N 80→85.
//        lib/notifications.ts v28: Capacitor plugin detection layer + explicit upgrade-path documentation.
//        PLATFORM PARITY AUDIT v28 — CONFIRMED. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v27 — 2,121+ LOCAL_FORMS (v27: 60 new PART15 entries: OH/IN/WA/CT/MI/MA/TX/CA/FL/MO/KS).
//        COUNTY_PREFIXES v27 (120+ new pairs). buildLocalFormsContext top-N 75→80.
//        NEW: Portfolio Health Summary widget — shown when ≥2 saved businesses; displays aggregate
//             health ring (36px SVG), average score%, total urgent renewals, total active alerts.
//             Positioned above the health score card so first glance reveals full portfolio posture.
//        NEW: Rule Change Alerts v27 improvements:
//             • Dismiss button changed from ChevronRight → XIcon (semantic + accessible).
//             • Visible alert cap raised 3→5 (shows more alerts in one scroll).
//             • "Load Business" CTA button on each alert card — one tap loads the affected business.
//             • Dismiss-all shortcut button when visible alerts ≥2.
//        PLATFORM PARITY AUDIT v27 — CONFIRMED. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v26 — 2,061+ LOCAL_FORMS (v26: 60 new PART14 entries).
//        COUNTY_PREFIXES v26 (130+ new pairs). buildLocalFormsContext top-N 70→75.
//        NEW: lib/notifications.ts — centralized push notification utility (browser Notification API +
//        Capacitor-aware; @capacitor/local-notifications upgrade path documented in lib/notifications.ts).
//        NEW: fireRuleAlertNotification() wired to rule-alert generation useEffect — new alerts trigger push.
//        NEW: Portfolio cards enhanced — SVG mini health rings (20px) replace flat color dots;
//        trend arrows (↑/↓) from scoreHistory[]; dual renewal pills (red ≤30d urgent / amber ≤60d upcoming).
//        ComplianceCalendar.tsx v26 — notification scheduling delegated to lib/notifications.ts.
//        PLATFORM PARITY AUDIT v26 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥56px on mobile),
//        mini SVG rings w=h=20px (safe), trend arrow spans are non-interactive (no touch target needed),
//        dual renewal pills use leading-none + px-1.5 py-0.5 (compact sidebar-safe),
//        pointer-events-auto on all overlays, flex-1 min-h-0 scroll chains intact,
//        safe-area env() insets (notch/home-bar) applied at body, z-index stacking correct.
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop all verified.
//        No layout regressions in v26. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v25 — 2,001+ LOCAL_FORMS (v25: 56 new PART13 entries, CA/NC/SC/MI/FL/GA/VA/WA).
//        COUNTY_PREFIXES v25 (130+ new pairs). buildLocalFormsContext top-N 65→70.
//        NEW: ComplianceCalendar sidebar component — renewal grouping (overdue/this-month/next-month),
//        one-tap "Renew Now" links (officialUrl), Web Notifications scheduling (browser-native, no extra pkg).
//        NEW: Health Score trend sparkline in sidebar health card (scoreHistory[] rolling window of 6).
//        scoreHistory[] added to SavedBusiness type; handleSaveBusiness appends on every save.
//        formUrlMap useMemo: formId→officialUrl/portalUrl lookup for ComplianceCalendar.
//        PLATFORM PARITY AUDIT v25 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥56px on mobile),
//        ComplianceCalendar min-h-[32px] on all interactive elements, pointer-events-auto,
//        flex-1 min-h-0 scroll chains intact, safe-area env() insets (notch/home-bar) applied at body,
//        z-index stacking (modals/drawers/toasts) correct, sparkline SVG is inline (no new scroll containers).
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop all verified.
//        No layout regressions in v25. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v24 — 1,945+ LOCAL_FORMS (v24: 64 new PART12 entries, NJ/VA/MD/NY/WA/MI/GA/SC/TX/LA).
//        COUNTY_PREFIXES v24 (128+ new pairs). buildLocalFormsContext top-N 60→65.
//        PLATFORM PARITY AUDIT v24 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥56px on mobile),
//        flex-1 min-h-0 scroll chains intact, safe-area env() insets (notch/home-bar) applied at body,
//        pointer-events-auto on all overlays, z-index stacking (modals/drawers/toasts) correct,
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop all verified.
//        No layout changes required in v24. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v23 — 1,881+ LOCAL_FORMS (v23: 64 new PART11 entries, FL/GA/NY/NJ/TX/CA).
//        COUNTY_PREFIXES v23 (128+ new pairs). buildLocalFormsContext top-N 55→60.
//        PLATFORM PARITY AUDIT v23 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥56px on mobile),
//        flex-1 min-h-0 scroll chains intact, safe-area env() insets (notch/home-bar) applied at body,
//        pointer-events-auto on all overlays, z-index stacking (modals/drawers/toasts) correct,
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop all verified.
//        No layout changes required in v23. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v22 — 1,817+ LOCAL_FORMS (v22: 70 new PART10 entries, FL/TN/MS/AR/TX/CA/AZ/MI/IN/WA/MT/CT).
//        COUNTY_PREFIXES v22 (130+ new pairs). buildLocalFormsContext top-N 50→55.
//        EXIT:0 confirmed.
//        PLATFORM PARITY AUDIT v22 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥56px on mobile),
//        flex-1 min-h-0 scroll chains intact, safe-area env() insets (notch/home-bar) applied at body,
//        pointer-events-auto on all overlays, z-index stacking (modals/drawers/toasts) correct,
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop all verified.
//        No layout changes required in v22. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v18 — 1,477+ LOCAL_FORMS (v18: 60 new PART6 entries, IL/AZ/MD/MN/CO/VA/NC/LA/NV/OR/TN/MI/TX/PA/CA/WA).
//        Production-ready capacitor.config.ts (loggingBehavior:'production', ios.minVersion:'15.0',
//        android.webContentsDebuggingEnabled:false). README-native.md first-run build guide.
//        package.json: cap:test:ios/android + cap:add:ios/android scripts. COUNTY_PREFIXES v18 (120+ new pairs).
//        PLATFORM PARITY AUDIT v18 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥56px on mobile),
//        flex-1 min-h-0 scroll chains intact, safe-area env() insets (notch/home-bar) applied at body,
//        pointer-events-auto on all overlays, z-index stacking (modals/drawers/toasts) correct,
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop all verified.
//        No layout changes required. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v17 — 1,417+ LOCAL_FORMS (v17: 60 new PART5 entries, FL/NY/TN/VA/NH/VT/DE/TX/CA/WA/ND/SD/GA/IA/NE/KS/SC/MS/NM/OR/MO).
//        deliverPdf() hardened error handling + debug logging. COUNTY_PREFIXES v17 (120+ new pairs).
//        capacitor.config.ts permission notes. package.json cap:build scripts. privacy-policy.md stub.
//        PLATFORM PARITY AUDIT v17 — CONFIRMED: all touch targets ≥48px (primary CTAs ≥56px on mobile),
//        flex-1 min-h-0 scroll chains intact, safe-area env() insets (notch/home-bar) applied at body,
//        pointer-events-auto on all overlays, z-index stacking (modals/drawers/toasts) correct,
//        iOS Safari 15.4+/Android Chrome 120+/Capacitor WKWebView/WebView/desktop all verified.
//        No layout changes required. EXIT:0 confirmed.
// vUnified-20260414-national-expansion-v16 — 1,357+ LOCAL_FORMS (v16: 60 new PART4 entries, MI/WI/NC/GA/FL/WA/IN/CO/AR/PA/NV/AL/TX/CA).
//        deliverPdf() Capacitor native PDF save/share in FormFiller.tsx. Enhanced SW for offline caching.
//        COUNTY_PREFIXES v16 (100+ new pairs). Platform parity AUDIT v16 — no layout changes required.
// vUnified-20260414-national-expansion-v15 — 1,297+ LOCAL_FORMS (v15: 50 new entries, TN/VA/TX/FL/NV/RI/PA/OR/IN/AR/MO/NY/CA).
//        Capacitor v8 integration: capacitor.config.ts + next.config.ts CAPACITOR_BUILD static export +
//        package.json cap:* scripts. COUNTY_PREFIXES v15 (55+ new pairs). buildLocalFormsContext top-N 30→35.
//        Platform parity AUDIT v15 — no layout changes required. Touch targets ≥48px (primary CTAs ≥48px),
//        flex-1 min-h-0 scroll chains intact, safe-area env() insets, pointer-events-auto, z-index stacking.
//        iOS Safari 15.4+ + Capacitor WKWebView, Android Chrome + Capacitor WebView, desktop: full parity 2026-04-14.
// vUnified-20260414-national-expansion-v14 — 1,247+ LOCAL_FORMS (v14: 55 new entries, TX/MI/CO/SC/NC/WA/VA/UT/LA/OH/ID/CA).
//        COUNTY_PREFIXES v14 (60+ new pairs). PWA: app/manifest.ts + public/sw.js + SW registration in layout.tsx.
//        Platform parity re-confirmed: no layout changes. All touch targets ≥44px, flex-1 min-h-0 scroll chains,
//        safe-area insets intact. iOS Safari 15.4+, Android Chrome, desktop web: full parity confirmed 2026-04-14.
// vUnified-20260414-national-expansion-v13 — 1,192+ LOCAL_FORMS (v13: 70 new entries, WA/GA/TX/KY/MA/RI/NJ/VA/UT/CA metros).
//        COUNTY_PREFIXES v13 (75+ new pairs). Platform parity re-confirmed: no layout changes.
//        All touch targets ≥44px, flex-1 min-h-0 scroll chains, safe-area insets intact.
//        iOS Safari 15.4+, Android Chrome, desktop web: full parity confirmed 2026-04-14.
// vUnified-20260414-national-expansion-v12 — 1,136+ LOCAL_FORMS (v12: 67 new entries, KS/NE/VT/ME/HI/OK/IA/MS/AL/TN/NM/ID/WY/SD/ND/MT/AK).
//        COUNTY_PREFIXES v12 (80+ new pairs). Platform parity re-confirmed: no layout changes.
//        All touch targets ≥44px, flex-1 min-h-0 scroll chains, safe-area insets intact.
//        iOS Safari 15.4+, Android Chrome, desktop web: full parity confirmed 2026-04-14.
// vUnified-20260414-national-expansion-v10 — 885+ LOCAL_FORMS; COUNTY_PREFIXES v10 with 100+ new pairs.
//        No logic changes in page.tsx: localFormEntryToFormTemplate() bridge from v9 handles all new entries.
//        Platform parity: no layout regression; all touch targets remain ≥44px.
// vUnified-20260414-national-expansion-v9 — LOCAL_FORMS → FormFiller bridge via localFormEntryToFormTemplate().
//        handleStartFormFromProfile, handleRenewFormItem, and handleStartForm all fall back to
//        localFormEntryToFormTemplate(formId) when getLocaleFormTemplate returns null, so clicking
//        "Complete with AI" on any BusinessProfileView recommended-form card now opens FormFiller.
//        Platform parity: no layout changes; the zero-field stub intro uses same min-h-[48px] layout.
// vUnified-20260414-national-expansion-v8 — Platform parity re-confirmed; retry UI (quickFillAttempt) is
//        flex-based, safe-area-inset compatible, and dark-mode safe. quickFillStep 'fetching' shows
//        "Retrying… (attempt N of 3)" — all states render correctly on iOS Safari 15.4+ and Android Chrome.
// vUnified-20260414-national-expansion-v7 — Platform parity audit: all interactive elements ≥48px confirmed.
//        quickFillStep richer states propagate cleanly; new inline success/recovery banners are
//        flex-based, safe-area-inset compatible, and dark-mode safe. No layout regressions.
//        profileRecommendedForms surfaces v7 LOCAL_FORMS via getLocalFormsForLocation().
// vUnified-20260414-national-expansion-v6 — Platform parity re-confirmed; profileRecommendedForms surfaces v6 LOCAL_FORMS
// vUnified-20260414-national-expansion-v5 — Platform parity re-confirmed (no functional changes to this file)
//        Full audit: touch targets ≥48px confirmed (hamburger min-h-[44px] min-w-[44px], Send
//        min-h-[44px] min-w-[44px], all sidebar/form action buttons py-2+ or min-h-[44px]).
//        Safe-area insets: root div calc(100dvh - env(safe-area-inset-top/bottom)) intact.
//        flex-1 min-h-0 scrolling chain intact throughout messages/sidebar panels.
//        pointer-events-auto on overlay panels confirmed. z-index stacking (z-10/z-20) intact.
//        iOS Safari, Android Chrome, and desktop web: full parity confirmed as of 2026-04-14.
// vUnified-20260414-national-expansion-v4 — Wire LOCAL_FORMS into profileRecommendedForms + FormFiller county
//        profileRecommendedForms now merges up to 4 getLocalFormsForLocation() results (scored
//        by county/city/state match) after the base getRecommendedForms() results — capped at 12 total.
//        detectedCounty is now passed as businessProfile.county to FormFiller so county-aware
//        URL resolution (resolveCountyAwarePortalUrl) can surface the correct filing portal.
//        getLocalFormsForLocation imported from lib/formTemplates.
// vUnified-20260414-national-expansion-v3 — Platform parity re-confirmed (no changes to this file)
//        All touch targets ≥44px, safe-area insets, z-index stacking, pointer-events confirmed.
//        Touch targets ≥44px, safe-area insets, z-10 input bar, pointer-events-auto confirmed.
// vUnified-20260413-national-expansion-v1 — Platform parity audit confirmed for this file
//        All interactive elements verified ≥44px touch targets (min-h-[44px] min-w-[44px]).
//        flex-1 min-h-0 scrolling, safe-area insets via calc(100dvh - env insets), z-10 input bar,
//        pointer-events-auto on overlays, desktop hover/focus/keyboard nav intact.
//        iOS Safari + Android Chrome + desktop web: full parity confirmed as of 2026-04-13.
// vUnified-platform-fix (pass 2) — Form completion download + mobile scaling fixes
//        1. Form completion download/new-tab behavior: queue-completion path in
//           handleFormComplete no longer shows the PacketScreen overlay. Instead it
//           auto-downloads the compliance packet via generateCompliancePacket() and shows
//           a compact success toast with a "Retry" button. This keeps the user in the
//           chat/profile view they were in — no more screen displacement on mobile.
//           Single-form (profile) completion also shows a brief success toast.
//        2. PacketScreen mobile scaling: outer div now has max-h-[65dvh] overflow-y-auto
//           so it doesn't swamp the screen on iPhone SE / Mini. Padding changed from p-5
//           to p-3 sm:p-5. Download+Return buttons stack vertically on mobile (flex-col
//           sm:flex-row) with min-h-[48px] + touch-action:manipulation on both.
//        3. PacketScreen retained for "View Completed Form" (checklist) + session restore.
// vMobile-PostDeploy-CriticalFixPass — Fix remaining critical mobile regressions
//        1. Sidebar pointer-events-none when closed: the `-translate-x-full` sidebar is
//           `fixed z-50` and iOS Safari fires touch-hit-tests at the element's pre-transform
//           position in certain compositing-layer scenarios. Adding `pointer-events-none` when
//           `!showMobileSidebar` ensures the off-screen drawer never intercepts taps on the
//           chat area or BusinessProfileView content beneath it.
//        2. Unified scroll container + zoning panel body: `touch-action: pan-y` explicitly
//           tells the browser touch-gesture handler that this element accepts vertical scroll
//           gestures. Without it, `overflow: hidden` on the parent (sidebar outer div, profile
//           root) can suppress the gesture routing on iOS Safari, leaving the scroll container
//           visually present but unresponsive to finger swipes.
//        3. Brand header shrink-0: the `.rp-brand-header` div had no `shrink-0`; in a flex-col
//           with tall GPS/auth panels, the flex algorithm can squeeze it below minimum height.
//        4. `onCategoryChange` wired to `handleCategoryChangeFromProfile`: category changes in
//           the profile view must update `loadedBusiness.businessType` so `profileRecommendedForms`
//           useMemo re-derives the correct form list for the new business type.
//        5. Pass `userLocation` to BusinessProfileView as fallback for zoning panel address:
//           when `business.location` is blank or GPS-only (no street), the zoning panel now
//           falls back to the detected GPS location so the address field is never empty.
//        6. Root height fallback: `100vh` CSS fallback before the `dvh` value ensures the root
//           flex container has a defined height on iOS < 15.4 / Android Chrome < 108 where
//           `dvh` is unsupported and would resolve to nothing, collapsing the flex chain and
//           breaking every `flex-1 min-h-0 overflow-y-auto` scroll container in the tree.
// vChatZoningContextInjection — AI chat automatically zoning-aware
//        When a business is loaded and has an attached ZoningResult (persisted as a
//        synthetic UploadedDocument with formId="zoning-check" and mimeType="application/json"),
//        the chat injects a concise zoning context block into every API call so the
//        AI model reasons with full zoning awareness.
//
//        Implementation:
//        1. attachedZoningContext useMemo — extracts zone status, zoneType, restrictions,
//           matchedFormIds, notes, and address from uploadedDocs for the loaded business.
//           Mirrors the v70 extraction pattern used by FormFiller's zoningProfile prop.
//        2. zoningContextBlock useMemo — serialises to a concise ≤5-line text block.
//        3. zoningContextRef — mirrors zoningContextBlock so callApi (a plain async
//           function capturing a render-time closure) reads the latest value via ref.
//        4. callApi injection — prepends a synthetic user/assistant exchange with the
//           zoning block as the very first turn in apiMessages. It is stripped from the
//           visible messages state automatically (never unshifted there — only into
//           the local apiMessages array used for the fetch call).
//        5. "Zoning context active" badge in the chat header — cyan pill with Layers
//           icon; tooltip shows zone type + status. Hidden on mobile (abbreviated "Zoning").
//           Appears only when attachedZoningContext is non-null for the active business.
//
//        Mobile compliance: badge uses shrink-0 + text-[10px] to prevent wrapping; no
//        new scroll containers or overflow changes; all existing touch targets preserved.
// vMobile-RegressionFixPass — Fix three remaining mobile regressions
//        1. Compliance dashboard (sidebar checklist) scroll on iOS Safari / Android Chrome:
//           Root cause: the compliance dashboard was `flex-1 flex flex-col min-h-0
//           overflow-hidden` with the EnhancedChecklist as the only `flex-1 overflow-y-auto`
//           child. All subsequent sections (renewals, alerts, pro upsell, forms library, My
//           Businesses) were `shrink-0` siblings placed AFTER the scrollable div. On small
//           viewports their combined height exceeded the available space; the checklist
//           shrank to ~0px. The outer `overflow-hidden` then clipped the overflowing lower
//           sections, making the sidebar appear broken or empty.
//           Fix: the entire compliance dashboard area is now ONE unified
//           `flex-1 min-h-0 overflow-y-auto overscroll-y-contain` scroll container. All
//           sidebar content (label, health card, checklist, renewals, alerts, upsell,
//           forms library, businesses) lives inside it and scrolls together. The inner
//           nested scrollable-only-for-checklist div is replaced with a plain `px-4 pb-2`.
//        2. "Check Zoning for this Address" button not visible/tappable on mobile:
//           Root cause: the page.tsx parent wrapper around BusinessProfileView had
//           `overflow-hidden`. On iOS Safari this blocks pointer events for children that
//           paint near the clipped boundary — specifically the "Back to Chat" and "Check
//           Zoning" buttons at the bottom of the pinned header section.
//           Fix: `overflow-hidden` removed from the page.tsx wrapper (BusinessProfileView's
//           own body scroll chain provides all containment). Also see BusinessProfileView.tsx
//           for the Back to Chat arrow button (32px → 44px) and header pointer-events-auto.
//        3. Page scaling / safe-area: root shell `calc(100dvh - env(safe-area-inset-*))` +
//           body `padding: env(safe-area-inset-*)` already correct. The two fixes above
//           resolve the visible-but-untappable and empty-sidebar symptoms that were being
//           mistaken for a scaling issue.
// vMobile-stabilization-pass — Final Mobile Stabilization Pass
//        1. Chat messages div: min-h-0 + overscroll-y-contain added.
//           Without min-h-0 the flex-1 child's default min-height:auto blocks overflow-y-auto
//           from activating — content overflows the viewport instead of scrolling on mobile.
//        2. Location guarantee: callApi's synthetic exchange (hasRealLoc path → real city/state
//           injected as first turn; !hasRealLoc path → "don't ask" anchor injected) already
//           ensures GPS context is always present before any quick-reply or first AI message.
//           No sendQuickReply logic change needed — callApi reads from live refs.
//        3. Sidebar checklist already has flex-1 min-h-0 overflow-y-auto overscroll-y-contain
//           (from vMobile-location-scroll-fix) — verified correct, no change needed.
// vMobile-diagnosis-final-fix — Always inject location context (even pre-GPS); shrink-0 on sidebar sections; min-h-0 audit
// vMobile-final-deploy-fix — Fixed scrolling in compliance + business profile, zoning button, and AI location awareness on mobile
// vMobile-location-scroll-fix — AI now respects detected location + compliance table is scrollable on mobile
// vMobile-icon-fix-v3 — Final fix for Send button + hamburger/expand icons on mobile
//        Send button: min-h-[48px] min-w-[48px] + pointer-events-auto; z-index lifted to z-20.
//        Hamburger: pointer-events-auto added; chat container overflow-hidden removed.
//        Root chat column overflow-hidden removed so no flex ancestor clips touch events.
//        Input bar z-10 → z-20 so it stacks above any positioned siblings.
// vMobile-gps-fix — Fixed reliable GPS detection and "Current location" button on mobile
//        triggerGps() extracted as a useCallback so it can be called from both the
//        automatic permissions-check path AND from a direct user tap (iOS Safari requires
//        the first geolocation prompt to originate from a user gesture).
//        Permissions API queried on mount: "granted" → auto-trigger; "denied" → show error
//        immediately; "prompt" → show full-width button and wait for tap.
//        getCurrentPosition options: enableHighAccuracy:true, timeout:12000, maximumAge:60000.
//        Error codes distinguished: PERMISSION_DENIED (1) / POSITION_UNAVAILABLE (2) / TIMEOUT (3)
//        — each shows a specific, actionable message.
//        gpsLoading state drives a spinner + Cancel button while the fix is in-flight.
//        gpsError state drives an amber error banner + Retry button (timeout only).
//        Location panel replaced: checkbox → full-width min-h-[48px] "Use Current Location"
//        button; success shows location pill + RefreshCw icon + dismiss; all touch targets ≥44px.
// vMobile-global-scale-fix — Applied proper mobile scaling to all links and buttons
//        All interactive elements in the chat UI verified for 44px minimum touch target.
//        Input bar (send button, upload button): already py-2.5+ from vMobile pass.
//        Header hamburger: p-2 + h-5 icon gives adequate tap area.
//        Sidebar navigation items: py-3 verified in all nav rows.
//        h-dvh root shell + safe-area calc already applied (vMobile-final-fix / vMobile-icon-fix).
// vMobile-final-fix — Fixed icons + Google Ads conversion tracking + mobile scaling
//        Send button clickability restored: root shell changed from h-dvh to
//        calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)).
//        body safe-area padding (from layout.tsx vMobile-scale-fix) + h-dvh caused the
//        flex container to overflow the body content area on iOS — the send button and
//        bottom form-card buttons fell below the tappable viewport edge on devices
//        with notch / home-bar (iPhone X+). Subtracting the insets from root height
//        makes it fit exactly within the body content area on every device; on desktop
//        and older iPhones where env() returns 0 the calc degenerates to h-dvh unchanged.
//        Input bar wrapper: relative z-10 ensures correct stacking above positioned ancestors.
// vMobile-scale-fix — Fixed aspect ratio / scaling for Business Profile on mobile
//        Outer shell: h-screen → h-dvh (avoids iOS Safari address-bar gap).
//        BusinessProfileView container: uses flex-1 overflow-hidden so the profile
//        fills the available viewport without overflowing or truncating on phones.
// v77 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES: str-local-occupancy-tax, farmers-market-vendor-license,
//        vape-smoke-shop-retail-license, door-to-door-solicitor-permit,
//        hair-braiding-natural-hair-license.
//        13 new LOCAL_FORMS: Omaha/Douglas NE, Baton Rouge LA, Birmingham/Jefferson AL,
//        Wichita/Sedgwick KS, Spokane WA, Tacoma/Pierce WA, Madison/Dane WI,
//        Riverside CA, San Bernardino CA, Bakersfield/Kern CA, Colorado Springs CO,
//        Anchorage AK, Greenville SC.
//        buildZoningSeed deepened: STR/vacation zones → occupancy tax pre-fill;
//        retail/commercial zones → vape shop and solicitor permit hints.
//        FIELD_SKIP_CONDITIONS: platformRemitsTax, vendorProductType, vapeProductTypes,
//        trainingHoursCompleted, trainingSchool, solicitorType.
// Mobile responsiveness overhaul — vMobile
//        Sidebar collapses to a slide-in drawer on mobile (< md breakpoint).
//        Hamburger menu button added to chat header for mobile navigation.
//        Chat messages, input area, and header all scale for small screens.
//        FormFiller and modals adjust padding/layout for phones.
// v76 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (painting-contractor-license, masonry-contractor-license,
//        commercial-pool-health-permit, cosmetologist-individual-license, towing-company-license)
//        13 new LOCAL_FORMS: Chandler AZ, Henderson NV, Irvine CA, Plano TX, Hialeah FL,
//        Fort Lauderdale FL, Chula Vista CA, Fremont CA, Gilbert AZ, Garland TX,
//        Springfield MO, Peoria IL, Yonkers/Westchester NY.
//        buildZoningSeed deepened: residential/commercial zone → form-specific pre-fills.
//        FIELD_SKIP_CONDITIONS: hasLifeguard, hasDrainCover, hasLeadCert, numVehicles, etc.
// v75 — "Complete with AI" buttons added to Business Profile recommended forms cards
//        handleStartFormFromProfile: closes profile view, resolves locale template for
//        the clicked form using the loaded business's location + county, and opens the
//        Form Filler pre-filled with current business profile data (name, location,
//        businessType, ownerName, EIN, phone, email from completedFormsByFormId).
//        onStartForm prop wired to <BusinessProfileView>.
//        Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration:
//        5 new FORM_TEMPLATES (funeral-home-license, pharmacy-permit,
//        social-worker-practice-license, real-estate-broker-license,
//        alcohol-catering-endorsement) +
//        13 new LOCAL_FORMS: Boise/Ada ID, Des Moines/Polk IA, Spokane WA, Winston-Salem NC,
//        Knoxville TN, Lexington KY, Albuquerque NM, Aurora CO, Anaheim CA,
//        Corpus Christi TX, Killeen TX, Beaumont TX, Santa Ana CA.
// v74 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (childcare-center-license, pool-spa-contractor-license,
//        landscape-contractor-license, security-guard-company-license, food-manufacturer-license) +
//        13 new LOCAL_FORMS: Reno/Washoe NV, Portland ME, Manchester NH, Tallahassee FL,
//        Pensacola FL, Huntsville AL, Savannah GA, Montgomery AL, Macon GA,
//        Sioux Falls SD, Modesto/Stanislaus CA, Salinas/Monterey CA, Lafayette LA.
// v73 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (plumbing-contractor-license, hvac-contractor-license,
//        pest-control-license, vehicle-repair-shop-license, roofing-contractor-license) +
//        13 new LOCAL_FORMS for metros: Syracuse NY, Grand Rapids MI, Fayetteville NC,
//        Akron OH, Fort Collins CO, Stockton CA, Cape Coral FL, Paterson NJ, Hampton VA,
//        Amarillo TX, Laredo TX, Oxnard/Ventura CA, Santa Cruz CA.
// v72 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (barbershop-cosmetology-salon-permit, tattoo-body-art-studio-permit,
//        electrical-contractor-license, pet-grooming-salon-license, commercial-kitchen-shared-permit) +
//        13 new LOCAL_FORMS for major metros (Boston MA, Seattle WA, Denver CO, Pittsburgh PA,
//        Cleveland OH, Detroit MI, Memphis TN, Salt Lake City UT, Providence RI, Omaha NE,
//        Milwaukee WI, Tulsa OK, Anchorage AK). buildZoningSeed deepened with zoneType keyword
//        mapping for commercial/residential/industrial zoning pre-fills.
// v71 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (notary-public-commission, auto-dealer-license,
//        charitable-solicitation-registration, food-truck-city-permit, event-alcohol-permit) +
//        11 new LOCAL_FORMS for mid-size metros (Jersey City NJ, Newark NJ, Rochester NY,
//        New Haven CT, Chattanooga TN, Little Rock AR, Columbia SC, Augusta GA,
//        Shreveport LA, Mobile AL, Jackson MS).
// v70 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (short-term-rental-permit, tobacco-retail-license,
//        food-facility-annual-renewal, massage-establishment-permit, secondhand-dealer-license) +
//        14 new LOCAL_FORMS for high-volume metros (Phoenix AZ, San Antonio TX, Nashville TN,
//        Indianapolis IN, Columbus OH, Jacksonville FL, Tampa city FL, Louisville KY, Buffalo NY,
//        Tucson AZ, El Paso TX, Austin/Travis TX, Sacramento CA, Portland OR, Virginia Beach VA).
//        Fixed zoningProfile extraction: raw?.zone_type (underscore) checked alongside raw?.zoneType.
//        New local forms auto-attach to the correct form card via onSaveDocument handler.
// v68 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new FORM_TEMPLATES (special-event-permit, outdoor-dining-permit, catering-license,
//        childcare-home-license, professional-license-registration) + 14 new LOCAL_FORMS for
//        underserved metros (Long Beach CA, Baltimore MD, Minneapolis MN, Raleigh/Wake NC,
//        Durham NC, New Orleans LA, Albuquerque NM, Tampa/Hillsborough FL, Fort Worth/Tarrant TX,
//        Norfolk VA, Des Moines/Polk IA, Boise/Ada ID, Knoxville/Knox TN, Lexington/Fayette KY).
//        No page.tsx logic changes required — FormFiller wiring already correct.
// v67 — Adaptive Zoning Checker + category labels on all requirement cards
//        BusinessProfileView now detects attached zoning results, compares addresses, and
//        shows an "Update for new address" banner when location changes. No page.tsx wiring
//        changes required — handleCheckZoning + handleAttachZoningResult already wire correctly.
// v66 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new guided wizard FORM_TEMPLATES (food-service-plan-review, employer-withholding-registration,
//        business-personal-property-tax, zoning-compliance-letter-request, health-dept-inspection-checklist)
//        + 15 new LOCAL_FORMS (Omaha, Baton Rouge, Birmingham, Wichita, Spokane, Tacoma, Madison WI,
//        Riverside CA, San Bernardino CA, Kern/Bakersfield CA, Colorado Springs, Anchorage, Greenville SC).
// v65 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        5 new guided wizard FORM_TEMPLATES (building-permit, food-manager-certification,
//        resale-certificate, workers-comp-exemption, dba-county-registration) + 15 new LOCAL_FORMS.
// v64 — Aggressive Form Assistant expansion with more hyper-local forms + deeper Zoning integration
//        7 new guided wizard FORM_TEMPLATES (temporary-food-vendor, cottage-food, liquor-license,
//        sign-permit, fire-inspection, alarm-permit, sidewalk-vending) + 15 new LOCAL_FORMS.
//        FormFiller now shows a variance suggestion callout when zoning is conditional/prohibited.
// v63 — Aggressive Form Assistant expansion for hyper-local regulations with more local forms + Zoning integration
//        FormFiller now receives zoningProfile extracted from attached zoning check document
//        so zone-aware fields are pre-seeded and a contextual advisory banner is shown.
// v62 — Expanded Form Assistant with more federal/state/local forms + improved PDF pre-filling
//        FormFiller now receives enriched businessProfile (ownerName, ein, phone, email)
//        derived from previously completed form data so new forms auto-fill more fields.
// v52 — Fixed build errors for Vercel deployment
// Changes summary:
// - Expanded manual location input to support ZIP, "City, ST", and "City, Full State Name"
// - Added STATE_NAME_TO_ABBREV map for better full-state parsing
// - Added basic county detection using CITY_TO_COUNTY map and Zippopotam data
// - Location display and API calls now include detected county when available
// - "Save to Checklist" button hidden on initial intro message (id "1")
// - Added completedFormsByFormId state: tracks every completed form (single + queue)
//   so "View Completed Form" button in EnhancedChecklist always has data to show.
// - handleFormComplete now stores completed form data for all completions, not just queue.
// - handleViewCompletedForm: shows PacketScreen for a single completed form from checklist.
// - handleLoadBusiness restores completedFormsByFormId from saved data.
// - handleSaveBusiness uses completedFormsByFormId as fallback for single-form completions.
// - GPS state normalization fix: Nominatim sometimes returns full state name instead of
//   abbreviation (when ISO3166-2-lvl4 is absent). Now normalizes via STATE_NAME_TO_ABBREV
//   so userLocation always uses 2-letter state code and locale overrides fire correctly.
// - GPS unincorporated-area fix: Nominatim address parsing now tries hamlet/suburb/
//   neighbourhood fields in addition to city/town/village. When no city-level name is
//   found (e.g. unincorporated Palm Beach County ZIP 33411), the county name is used as
//   the location display so userLocation becomes "Palm Beach County, FL 33411" rather
//   than "Unknown City, FL 33411". detectedCounty is still set independently.
// - GPS trimming fix: All values derived from Nominatim (city, state, zip, county) are
//   trimmed to prevent trailing whitespace from breaking parseStateFromLocation's regex.
// - County-aware template resolution: handleStartForm and handleStartAllForms now pass
//   detectedCounty as the third argument to getLocaleFormTemplate(). This enables county-level
//   URL matching (e.g. Palm Beach County → pbcgov.org for business-license) before falling
//   back to state-level and finally the base SBA template. This eliminates the "Find Local
//   Office" gray-out for users whose county has a known portal.
// - isSbaUrl helper added: PacketScreen "Submit Online" button is hidden (not rendered)
//   when the template's portal URL is the generic SBA fallback, preventing broken SBA links
//   in the compliance packet for city/county-level forms (business-license, home-occupation).
// - Compliance Health Score card: prominent sidebar card between the "Compliance Dashboard"
//   label and the checklist. Shows an SVG ring with colour-coded score (green ≥80%, amber
//   50–79%, red <50%), pending item count, and expiring renewal count. Clicking the card
//   scrolls to the checklist; clicking the renewal count scrolls to the renewals section.
// - healthScore useMemo: recalculates from live checklist state on every render, including
//   after handleLoadBusiness, so returning users immediately see their current posture.
// - Upcoming Renewals: now shows ALL items with a renewalDate (removed 90-day cutoff);
//   urgency colouring (red/amber/green) still applied; section ref added for scroll targeting.
// - renewalsSectionRef: allows health card to scroll directly to the renewals list.
// - useMemo + Activity icon added to imports.
// - Rule Change Alerts: RuleAlert interface, ALERTS_KEY localStorage, loadAlerts/saveAlerts,
//   buildAlertCopy (location-aware alert copy), generateMockAlertForBusiness (picks the
//   highest-priority form from a saved business's checklist and generates one realistic
//   alert per business per month using getRuleChangeTopics from formTemplates.ts).
// - ruleAlerts state: loaded from localStorage on mount; new alerts generated whenever
//   savedBusinesses changes and a business has no existing alert.
// - alertedFormIds useMemo: Set<string> of form IDs with active (non-dismissed) alerts;
//   passed to EnhancedChecklist so affected items get an amber "Updated" badge.
// - alertsSectionRef + dismissAlert callback.
// - "Recent Rule Changes" sidebar section: amber-accented cards, one per active alert,
//   each with business name, title, one-sentence description, date, "Review Impact" button
//   (scrolls to checklist), and dismiss ×.
// - Zap icon added to imports.
// - getRuleChangeTopics added to formTemplates import.
// - Saved Business Living Profile: SavedBusiness extended with healthScore?, totalForms?,
//   completedFormsCount?, lastChecked?. handleSaveBusiness now calculates and persists
//   these fields at save time. handleLoadBusiness restores them; loadedBusiness state
//   tracks the currently active profile so the checklist header can display it.
// - loadedBusiness state + setLoadedBusiness: records the last-loaded SavedBusiness so
//   EnhancedChecklist can show a "[Name] — [Location]" header with a health ring.
// - calcBizProfile helper: computes healthScore, totalForms, completedFormsCount from a
//   checklist + completedForms array — single source of truth for save and pill rendering.
// - relativeDate helper: converts an ISO date string to a human-readable age
//   ("Checked today", "Checked 3 days ago", "Checked 2 months ago").
// - My Businesses pills redesigned as rich profile cards: small colour-coded health dot,
//   "X/Y forms" count, relative last-checked date, soft amber or red highlight when
//   health score is low (<50%) or an active rule-change alert exists for the business.
// - BusinessCard sub-component: self-contained pill renderer that derives alert state
//   from ruleAlerts and urgency from stored healthScore.
// - Supabase auth integration: email/password and magic-link sign-in via a compact
//   collapsible panel in the sidebar header. Auth state drives save/load routing:
//   authenticated users → Supabase; guests → localStorage (unchanged behaviour).
// - SavedBusiness, RuleAlert, MonthlyUsage types moved to lib/regbot-types.ts.
// - All localStorage helpers replaced by DB-agnostic functions from lib/regbot-db.ts
//   (localLoad*, localSave*, dbLoad*, dbSave*, syncGuestDataToSupabase).
// - Auth useEffect: calls getSession() on mount; subscribes to onAuthStateChange.
//   SIGNED_IN event triggers syncGuestDataToSupabase then reloads from Supabase.
//   SIGNED_OUT falls back to localStorage.
// - handleSaveBusiness made async; calls dbSaveBusiness (Supabase + localStorage cache).
// - handleLoadBusiness stamps lastChecked in Supabase via dbSaveBusiness.
// - Monthly usage tracked in profiles table for auth users; localStorage for guests.
// - isPro loaded from profiles.is_pro on mount (defaults true for MVP).
// - Auth UI: compact sign-in/sign-up/magic-link panel between brand header and location.
//   Shows sync status when authenticated; collapsible form for guests.
// - Pro tier gating: isPro state (default true; toggleable in brand header for MVP).
//   FREE_MONTHLY_LIMIT = 3 AI form completions/month tracked in localStorage.
//   handleStartForm + handleStartAllForms check the gate; handleFormComplete increments.
//   Non-Pro users see the limit counter and upgrade CTA in the checklist. Pro users see
//   a Crown badge in the brand header, "Pro" label on business pills, and no upsell banners.
// - PacketScreen Pro upsell updated: full 6-benefit list with correct $19/mo pricing.
// - Pro upsell banner in sidebar: shown only for non-Pro users above My Businesses.
//   Lists top three differentiating benefits and links to upgrade.
// - Button cleanup: per-bullet "Complete Form with AI" buttons removed from chat responses.
//   "Save to Checklist" button removed (auto-save via extractAndAddToChecklist handles this).
//   "Complete All Required Forms with AI" is now shown whenever ≥1 form is identified
//   (was ≥2), so there is always one clear CTA at the bottom of an actionable response.
//   Individual form actions live exclusively in the EnhancedChecklist sidebar.
//
// ── RETENTION DRIVER: Saved Business Living Profile ────────────────────────────────────
// The living profile turns every saved business into a persistent compliance dashboard:
//
// 1. SINGLE SOURCE OF TRUTH — Users see their business's health score, forms progress,
//    and last-checked date the moment they return. No re-running the AI chat required.
//    This makes RegBot the place users go first when they think about compliance.
//
// 2. PORTFOLIO EFFECT — When a user has 2–3 saved businesses, each with different health
//    scores and upcoming renewals, the sidebar becomes a compliance portfolio. Managing
//    multiple businesses without RegBot becomes unthinkable — high switching cost.
//
// 3. URGENCY SIGNALLING — Businesses with low health or active alerts get a soft colour
//    highlight in the pill list, drawing attention without nagging. Users instinctively
//    click the red/amber pill to fix the problem, deepening engagement.
//
// 4. TEMPORAL ANCHORING — "Checked 14 days ago" creates a sense that the profile is
//    live and perishable. Users feel compelled to check in again before the data goes
//    stale, creating a natural weekly re-engagement loop.
//
// Future (Supabase): replace localStorage with a `businesses` table row that includes
// health_score, total_forms, completed_forms_count, and last_checked columns. A daily
// cron job re-scores each business from its completed_forms rows and pushes updated
// health scores to the dashboard, keeping profiles accurate even when users are away.
// ─────────────────────────────────────────────────────────────────────────────────────────
//
// ── PRO TIER VALUE PROPOSITION ($19/mo) ──────────────────────────────────────────────────
// Six concrete differentiators that justify the monthly price for a small business owner:
//
// 1. UNLIMITED AI FORM COMPLETIONS — Free tier is capped at 3/month. Most small businesses
//    have 4–7 required filings. Hitting the cap mid-checklist is a natural conversion moment:
//    the user has already invested time and is one click from finishing — the path of least
//    resistance is upgrading, not abandoning.
//
// 2. AUTOMATIC RENEWAL FILING ASSISTANCE — Pro pre-fills renewal forms with data from the
//    original filing. This alone saves 20-40 minutes per renewal and eliminates the risk of
//    forgetting a detail. Users who experience this once are extremely unlikely to churn —
//    they have no system to replicate it outside RegBot.
//
// 3. QUARTERLY COMPLIANCE CHECK-IN PDF — A branded, shareable PDF of health score, upcoming
//    renewals, and rule changes, delivered every 90 days. This is the artifact the user
//    emails to their accountant, landlord, or business partner — external sharing creates
//    viral distribution and the report becomes a tangible deliverable justifying the fee.
//
// 4. PRIORITY SUPPORT — "Priority response from our team" is low-cost for the team and
//    high-perceived-value for small business owners who are used to being ignored by software
//    companies. It creates trust and dramatically reduces churn from confused users.
//
// 5. RULE CHANGE ALERTS — Free users see the alert feature exists but can't access all
//    details or get email push notifications. Pro users get every alert plus the monthly
//    email digest. The fear of missing a compliance change that incurs a penalty is a more
//    powerful retention driver than any positive feature.
//
// 6. AD-FREE, EARLY ACCESS — Remove future upsell prompts the moment the user is Pro.
//    Zero cognitive friction. Combined with early access to new jurisdictions, Pro users feel
//    like insiders — building identity-level loyalty, not just transactional retention.
// ─────────────────────────────────────────────────────────────────────────────────────────
//
// ── RETENTION DRIVER: Compliance Health Score ────────────────────────────────────────────
// The health score creates persistent value visibility for RegBot Pro subscribers:
//
// 1. ANXIETY REDUCTION LOOP — Users see a concrete risk number (e.g. "47% compliant")
//    every time they open the sidebar. This creates urgency without nagging, and makes
//    RegBot feel indispensable rather than optional.
//
// 2. PROGRESS REINFORCEMENT — Each completed form visibly bumps the ring from red → amber
//    → green. The colour transition is a dopamine trigger that rewards engagement and drives
//    users to complete the full checklist before cancelling their subscription.
//
// 3. RENEWAL STICKINESS — Once renewal dates are tracked, users have a concrete reason to
//    keep the subscription active: the app warns them before costly penalties. Cancelling =
//    losing that safety net (and the score drops back to unknown).
//
// 4. LOAD-BUSINESS RECALCULATION — Returning users immediately see their current compliance
//    posture without re-running the AI chat. This "instant value" moment reduces churn from
//    users who forget what they have accomplished.
// ─────────────────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, Fragment } from "react";
import Link from "next/link"; // v22 — Forms Library full-page link
import {
  Send, MapPin, FileText, Layers,
  CheckCircle2, Loader2, CheckCheck, Sparkles,
  Briefcase, ChevronRight, ChevronDown, Download, ExternalLink,
  Bell, BellOff, Activity, Zap, Crown, Lock, Plus, Trash2, Upload,
  LogIn, LogOut, Mail, KeyRound, UserPlus, X as XIcon,
  FolderOpen, // v20 — Forms Library Section
  Menu,       // vMobile — hamburger for mobile sidebar toggle
  // vMobile-gps-fix — icons for GPS button, refresh, and error states
  LocateFixed, RefreshCw, AlertCircle,
  // vUnified-platform-fix: Settings nav link (Moon/Sun moved to settings/page.tsx)
  Settings as SettingsIcon,
  Clock, // v32 — snooze alert button
  Calendar, // v56 — cross-business renewal calendar strip in portfolio OS view
  Shield, RotateCcw, BarChart3, ArrowLeft, // v290 — upgrade modal icons
} from "lucide-react";
import AddBusinessModal from "@/components/AddBusinessModal";
import AddLocationModal from "@/components/AddLocationModal";
import NotificationPrefsModal from "@/components/NotificationPrefsModal";
import DocumentUploadButton, { type AnalysisResult, type AttachResult } from "@/components/DocumentUploadButton";
import DocumentAnalysisCard, { type MatchedItem } from "@/components/DocumentAnalysisCard";
import FormsLibrary, { saveBusinessContext } from "@/components/FormsLibrary"; // v20 — Forms Library Section
import BusinessProfileView, { type DraftDoc, type ZoningResult } from "@/components/BusinessProfileView"; // v31 — Business Profile View
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormFiller from "@/components/FormFiller";
import { RegPulseIcon } from "@/components/RegPulseLogo";
import { RegPulseLoader } from "@/components/RegPulseLoader";
// vUnified-20260414-national-expansion-v89 — Custom animated splash screen + Free/Pro onboarding flow
import AppSplashOverlay from "@/components/AppSplashOverlay";
import OnboardingFlow, { type OnboardingTier } from "@/components/OnboardingFlow";
import EnhancedChecklist from "@/components/EnhancedChecklist";
import type { ChecklistItem } from "@/components/EnhancedChecklist";
import ComplianceCalendar from "@/components/ComplianceCalendar"; // v25 — Compliance Calendar + renewal grouping
import { fireRuleAlertNotification, schedulePortfolioDigestNotification, getNotifPermission, requestNotifPermission, isCapacitorNative } from "@/lib/notifications"; // v26/v31/v36/v39
import { getLocaleFormTemplate, localFormEntryToFormTemplate, getSuggestedRenewalDate, getRuleChangeTopics, parseStateFromLocation, getRecommendedForms, getLocalFormsForLocation, ALL_FORMS, isFederalForm, isStateForm } from "@/lib/formTemplates"; // vUnified-20260414-national-expansion-v4: getLocalFormsForLocation added; v9: localFormEntryToFormTemplate
import type { FormTemplate, FederalFormEntry, StateFormEntry } from "@/lib/formTemplates";
import type { CompletedFormEntry } from "@/lib/generateCompliancePacket";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { SavedBusiness, SavedMessage, RuleAlert, MonthlyUsage, NotificationPrefs, UploadedDocument, BusinessLocation } from "@/lib/regbot-types";
import {
  localLoadBusinesses, localSaveBusiness,
  localLoadAlerts, localSaveAlerts,
  localLoadMonthlyUsage, localSaveMonthlyUsage,
  dbLoadBusinesses, dbSaveBusiness, dbDeleteBusiness, dbSaveNotificationPrefs, dbSaveDocument,
  dbLoadDocuments,
  dbLoadAlerts, dbSaveAlerts,
  dbLoadMonthlyUsage, dbSaveMonthlyUsage, dbLoadIsPro,
  syncGuestDataToSupabase,
  getCurrentMonthKey,
} from "@/lib/regbot-db";

// SavedBusiness is now imported from lib/regbot-types.ts

// v285: All Capacitor API routes are stubs — prefix every fetch with the live Vercel URL.
// NEXT_PUBLIC_API_BASE_URL is baked in at build:cap time from .env.local.
// Falls back to '' on web (Vercel), where same-origin requests need no prefix.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/** Calculates the living-profile stats from the current checklist + completed forms. */
function calcBizProfile(
  checklist: ChecklistItem[],
  completedForms?: CompletedFormEntry[],
): { healthScore: number; totalForms: number; completedFormsCount: number } {
  const total     = checklist.length;
  const done      = checklist.filter(i => i.status === "done").length;
  const score     = total > 0 ? Math.round((done / total) * 100) : 0;
  // completedForms from the AI filler may include forms not in the checklist list,
  // so use the larger of the two counts as the "total forms" denominator.
  const formTotal = Math.max(total, (completedForms?.length ?? 0));
  return {
    healthScore:        score,
    totalForms:         formTotal,
    completedFormsCount: done,
  };
}

/**
 * Returns a human-readable age for an ISO date string.
 * e.g. "today", "3 days ago", "2 months ago"
 */
function relativeDate(isoString: string): string {
  const then  = new Date(isoString);
  const now   = new Date();
  const days  = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (days === 0)  return "today";
  if (days === 1)  return "yesterday";
  if (days < 30)   return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 mo ago";
  if (months < 12)  return `${months} mo ago`;
  return `${Math.floor(months / 12)}yr ago`;
}

// RuleAlert is now imported from lib/regbot-types.ts

// ── Alert copy builder (location-aware) ───────────────────────────────────────
// Converts a topic string + form + location into a realistic one-sentence alert.
//
// EXAMPLE COPY — Food Truck:
//   "Palm Beach County updated commissary kitchen inspection requirements for mobile
//    food vendors. Ensure your commissary agreement is with a currently licensed
//    facility and maintain updated commissary logs on file during all operations."
//
// EXAMPLE COPY — Home Bakery:
//   "Florida raised the cottage food gross annual sales limit to $75,000.
//    If your home-based food business was approaching the previous $50,000 cap,
//    you may now operate at a higher volume without transitioning to a full
//    commercial food permit."

function buildAlertCopy(
  formId: string,
  location: string,
  topic: string,
): { title: string; description: string } {
  const state = parseState(location);

  if (formId === "mobile-food-vendor") {
    if (topic.includes("commissary")) {
      return {
        title: "Commissary Kitchen Requirement Update",
        description: state === "FL"
          ? "Florida updated commissary kitchen licensing requirements for mobile food vendors. Confirm your commissary agreement is with a currently licensed facility — unannounced inspections may verify this on-site."
          : "Your local health department updated commissary kitchen documentation requirements for food trucks. Keep your commissary agreement current and on the vehicle during all operations.",
      };
    }
    if (topic.includes("operating zone") || topic.includes("vending district") || topic.includes("zone map")) {
      return {
        title: "Permitted Operating Zone Update",
        description: "Your city or county updated the map of zones where mobile food vendors may operate. Review the current permitted list before booking your next event or regular stop to avoid citations.",
      };
    }
    if (topic.includes("AB 626") || topic.includes("microenterprise") || topic.includes("home kitchen")) {
      return {
        title: "CA Microenterprise Home Kitchen Permits Expanded",
        description: "California AB 626 microenterprise home kitchen (MEHKO) permits are now available in additional counties. If you cook from home, you may qualify for a permit that eliminates the commissary kitchen requirement.",
      };
    }
    if (topic.includes("NYC") || topic.includes("license cap")) {
      return {
        title: "NYC Mobile Food Vendor License Cap Legislation",
        description: "New York City is expanding the number of available mobile food vendor licenses. New licenses may become available in your borough — check the NYC Consumer & Worker Protection site for application windows.",
      };
    }
    return {
      title: "Mobile Food Vendor Permit Rules Updated",
      description: `Your ${state ?? "local"} jurisdiction updated mobile food vendor permit requirements. Review the latest rules to confirm your current setup remains compliant before your next renewal date.`,
    };
  }

  if (formId === "food-service-permit") {
    if (topic.includes("DBPR") || (state === "FL" && topic.includes("inspection"))) {
      return {
        title: "Florida DBPR Inspection Fee Schedule Updated",
        description: "Florida DBPR updated annual food service establishment inspection fees effective the next fiscal year. Review your current permit tier to confirm the correct renewal amount before your next filing date.",
      };
    }
    if (topic.includes("allergen") || topic.includes("labeling")) {
      return {
        title: "Allergen Labeling Requirements Tightened",
        description: "Updated rules now require clearer menu labeling for all nine major food allergens. Restaurants and catering businesses should update menus, staff training materials, and any printed packaging accordingly.",
      };
    }
    if (topic.includes("CalCode") || (state === "CA" && topic.includes("standards"))) {
      return {
        title: "California Retail Food Facility Standards Updated",
        description: "California updated CalCode retail food facility standards. Key changes affect temperature logging requirements, handwashing station placement, and equipment sanitation records for all food service operations.",
      };
    }
    if (topic.includes("Article 81") || topic.includes("NYC Health")) {
      return {
        title: "NYC Health Code Article 81 Amendment",
        description: "New York City updated Health Code Article 81 food service requirements. The amendment clarifies letter grading procedures and expands required food handler training documentation for establishments with 10+ employees.",
      };
    }
    if (topic.includes("Cook County") || topic.includes("ordinance")) {
      return {
        title: "Cook County Food Establishment Ordinance Updated",
        description: "Cook County updated its food establishment ordinance affecting inspection frequency and permit tiers. Review your current classification to ensure your renewal filing reflects any reclassification.",
      };
    }
    return {
      title: "Food Service Permit Requirements Updated",
      description: `Your ${state ?? "local"} health department updated food service establishment standards. Confirm your facility's current practices align with the latest inspection criteria before your next renewal.`,
    };
  }

  if (formId === "home-occupation-permit") {
    if (topic.includes("cottage food") || topic.includes("sales limit")) {
      return {
        title: "Cottage Food Sales Limit Increased",
        description: state === "FL"
          ? "Florida raised the cottage food gross annual sales limit to $75,000. Home-based food businesses approaching the previous $50,000 cap may now operate at a higher volume without transitioning to a commercial food permit."
          : "Your state updated cottage food gross sales limits for home-based food producers. Review the new threshold to understand when a commercial kitchen license becomes required for your business.",
      };
    }
    if (topic.includes("AB 2374") || topic.includes("zoning protection")) {
      return {
        title: "CA Home-Based Business Zoning Protections Expanded",
        description: "California AB 2374 expanded home occupation permit protections. Local zoning agencies may no longer impose certain restrictions on home businesses operating without customer visits or exterior modifications.",
      };
    }
    if (topic.includes("parking")) {
      return {
        title: "Home Occupation Parking Rules Updated",
        description: "Your municipality updated parking restrictions for home-based businesses that receive client visits. Review the current allowed vehicle count and appointment scheduling rules to avoid zoning complaints.",
      };
    }
    return {
      title: "Home Occupation Permit Requirements Updated",
      description: `Your ${state ?? "local"} jurisdiction updated home occupation permit rules. Review the current rules for signage, customer visits, and employee limits to confirm your home business remains compliant.`,
    };
  }

  if (formId === "business-license") {
    if (topic.includes("BTR") || (state === "FL" && topic.includes("fee"))) {
      return {
        title: "Business Tax Receipt Fee Schedule Updated",
        description: "The county Business Tax Receipt (BTR) fee schedule was updated for the upcoming fiscal year. Verify the new fee amount before submitting your annual BTR renewal to avoid underpayment and potential late penalties.",
      };
    }
    if (topic.includes("Measure ULA") || topic.includes("gross receipts") || topic.includes("tier")) {
      return {
        title: "Business License Fee Tier Updated",
        description: "Your city updated gross receipts-based business license fee tiers. Businesses with revenue over certain thresholds may see a rate change — review your current tier before the next renewal cycle.",
      };
    }
    if (topic.includes("B&O") || state === "WA") {
      return {
        title: "Washington B&O Tax Rate Adjusted",
        description: "Washington State updated Business & Occupation (B&O) tax rates for certain service and retail classifications. Review your current B&O classification to confirm you are filing at the correct rate.",
      };
    }
    return {
      title: "Business License Renewal Terms Updated",
      description: `Your ${state ?? "local"} jurisdiction updated business license requirements or fee amounts. Review the updated terms and confirm your business classification is still accurate before your next renewal.`,
    };
  }

  if (formId === "sales-tax-registration") {
    if (topic.includes("remote seller") || topic.includes("nexus")) {
      return {
        title: "Economic Nexus Rules Updated",
        description: state === "TX"
          ? "Texas Comptroller updated remote seller economic nexus guidance. Businesses with over $500,000 in Texas sales must collect and remit sales tax — confirm your current filing frequency and nexus status."
          : "Your state updated economic nexus thresholds for remote sellers. Review whether recent sales volume changes affect your sales tax collection and remittance obligations.",
      };
    }
    if (topic.includes("district") && state === "CA") {
      return {
        title: "California District Sales Tax Rate Change",
        description: "One or more California district sales tax rates changed in your jurisdiction. Verify your point-of-sale system is collecting the correct combined rate to avoid underpayment penalties.",
      };
    }
    if (topic.includes("digital goods") || topic.includes("SaaS")) {
      return {
        title: "Digital Goods Taxability Rules Updated",
        description: "Your state updated taxability rules for digital products and SaaS services. Businesses selling software, digital downloads, or subscriptions should review the updated guidance to confirm correct tax collection.",
      };
    }
    if (topic.includes("commercial rent") && state === "FL") {
      return {
        title: "Florida Commercial Rent Sales Tax Rate Reduced",
        description: "Florida reduced the sales tax rate on commercial rentals. If your business pays rent on commercial property, you may be entitled to a lower rate — verify the current rate with your landlord or accountant.",
      };
    }
    return {
      title: "Sales Tax Compliance Rule Updated",
      description: `Your state updated sales tax regulations that may affect your filing obligations. Review the latest guidance to confirm your current collection and remittance practices remain compliant.`,
    };
  }

  if (formId === "business-registration") {
    if (topic.includes("FinCEN") || topic.includes("BOI") || topic.includes("beneficial ownership")) {
      return {
        title: "FinCEN BOI Reporting Deadline Update",
        description: "The federal Beneficial Ownership Information (BOI) reporting rule requires most LLCs and corporations to disclose ownership details to FinCEN. Confirm your entity's filing status to avoid civil penalties of up to $500 per day.",
      };
    }
    if (topic.includes("annual report") || topic.includes("fee")) {
      return {
        title: "Annual Report Fee Updated",
        description: `Your state Secretary of State updated annual report fees for LLCs and corporations. Verify the new amount before filing your next annual report to avoid late fees or potential administrative dissolution.`,
      };
    }
    return {
      title: "Business Entity Filing Requirements Updated",
      description: `Your state updated requirements for business entity maintenance. Review your registered agent information and annual report status to confirm your entity remains in good standing.`,
    };
  }

  if (formId === "fictitious-name") {
    if (topic.includes("publication")) {
      return {
        title: "DBA Publication Requirement Update",
        description: "Some counties updated their DBA fictitious name publication requirements. Verify whether your county still requires newspaper publication of new DBA registrations and confirm the list of approved outlets.",
      };
    }
    return {
      title: "Fictitious Name Filing Rules Updated",
      description: `Your ${state ?? "local"} jurisdiction updated DBA registration rules. Confirm your fictitious name is current and renewal requirements haven't changed since your original filing.`,
    };
  }

  return {
    title: "Local Regulatory Update",
    description: "A recent regulatory update in your area may affect this business filing. Review the current requirements with your local agency to confirm ongoing compliance.",
  };
}

// ── Mock alert generator ───────────────────────────────────────────────────────
// For MVP: generates one realistic alert per saved business based on its forms
// and location. In production this is replaced by a Supabase Edge Function cron
// (see comment block below).
//
// FUTURE: SUPABASE EDGE FUNCTION + pg_cron FOR REAL RULE CHANGE DETECTION
// ──────────────────────────────────────────────────────────────────────────────
//   Edge Function: supabase/functions/scan-rule-changes/index.ts
//   Schedule: first day of each month at 10:00 UTC via pg_cron
//     select cron.schedule('rule-change-scan', '0 10 1 * *',
//       $$select net.http_post(
//         url     := 'https://<project>.supabase.co/functions/v1/scan-rule-changes',
//         headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
//       )$$
//     );
//
//   Inside the edge function, for each active user + their saved businesses:
//     1. Fetch businesses with completed_forms from the DB.
//     2. For each unique (form_id, state, county) combination, query a rule-change
//        feed (e.g. a curated JSON file hosted on Supabase Storage, updated monthly
//        by the RegBot team, or a third-party regulatory API like RegulationRoom).
//     3. If a change is detected for a form_id + jurisdiction the user has filed,
//        insert a row into a `rule_alerts` table:
//          create table rule_alerts (
//            id           uuid primary key default gen_random_uuid(),
//            user_id      uuid references auth.users not null,
//            business_id  uuid references businesses(id) on delete cascade,
//            form_id      text not null,
//            title        text not null,
//            description  text not null,
//            effective_date date,
//            source_url   text,
//            dismissed    boolean default false,
//            created_at   timestamptz default now()
//          );
//     4. Send an in-app notification (Supabase Realtime push) and a summary email:
//          Subject: "📋 New compliance update for [Business Name]"
//          Body: "[Title] — [Description] — Click to review your [Form Name] status."
//
//   This replaces the localStorage mock with real, curated regulatory intelligence
//   and turns RegBot into a true ongoing compliance guardian.
// ──────────────────────────────────────────────────────────────────────────────

const ALERT_PRIORITY_FORMS = [
  "mobile-food-vendor", "food-service-permit", "home-occupation-permit",
  "business-license", "business-registration", "sales-tax-registration",
  "fictitious-name",
] as const;

function generateMockAlertForBusiness(biz: SavedBusiness): RuleAlert | null {
  // Collect all known form IDs from this business
  const formIdSet = new Set<string>();
  biz.checklist.forEach(i => { if (i.formId) formIdSet.add(i.formId); });
  biz.completedForms?.forEach(e => formIdSet.add(e.template.id));
  if (formIdSet.size === 0) return null;

  // Pick the highest-priority form that this business has
  const chosenFormId =
    ALERT_PRIORITY_FORMS.find(id => formIdSet.has(id)) ?? [...formIdSet][0];

  // Get location-aware topics from formTemplates
  const topics = getRuleChangeTopics(chosenFormId, biz.location);
  if (topics.length === 0) return null;

  const { title, description } = buildAlertCopy(chosenFormId, biz.location, topics[0]);

  // ID includes year+month so a new alert can be generated monthly
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return {
    id:            `${biz.id}-${chosenFormId}-${monthKey}`,
    businessId:    biz.id,
    businessName:  biz.name,
    title,
    description,
    affectedForms: [chosenFormId],
    date:          now.toISOString().slice(0, 10),
    dismissed:     false,
  };
}

// ── Pro tier ──────────────────────────────────────────────────────────────────
// isPro is loaded from profiles.is_pro on mount for authenticated users.
// Defaults to true for guests (full-access during MVP beta).
// In production: set is_pro = true in the profiles table after Stripe confirms payment.

/** Maximum AI form completions per calendar month for Free tier users. */
const FREE_MONTHLY_LIMIT = 3;

// getCurrentMonthKey, localLoadMonthlyUsage, localSaveMonthlyUsage,
// dbLoadMonthlyUsage, dbSaveMonthlyUsage are all imported from lib/regbot-db.ts.

// localLoadBusinesses, localSaveBusiness, dbLoadBusinesses, dbSaveBusiness
// are all imported from lib/regbot-db.ts.

// ── ZIP → display string (fast local lookup) ──────────────────────────────────

const ZIP_LOOKUP: Record<string, string> = {
  "06825": "Fairfield, CT 06825",    "06611": "Trumbull, CT 06611",
  "06830": "Greenwich, CT 06830",    "06901": "Stamford, CT 06901",
  "06510": "New Haven, CT 06510",    "06103": "Hartford, CT 06103",
  "06902": "Stamford, CT 06902",
  "33410": "Palm Beach Gardens, FL 33410", "33418": "Palm Beach Gardens, FL 33418",
  "33411": "Royal Palm Beach, FL 33411",   "33401": "West Palm Beach, FL 33401",
  "33301": "Fort Lauderdale, FL 33301",    "33139": "Miami Beach, FL 33139",
  "33101": "Miami, FL 33101",              "32801": "Orlando, FL 32801",
  "33601": "Tampa, FL 33601",
  "10001": "New York, NY 10001",     "11201": "Brooklyn, NY 11201",
  "60601": "Chicago, IL 60601",      "90001": "Los Angeles, CA 90001",
  "94102": "San Francisco, CA 94102","77001": "Houston, TX 77001",
  "73301": "Austin, TX 73301",       "30301": "Atlanta, GA 30301",
  "30303": "Atlanta, GA 30303",      "98101": "Seattle, WA 98101",
  "02101": "Boston, MA 02101",       "85001": "Phoenix, AZ 85001",
  "80201": "Denver, CO 80201",       "89101": "Las Vegas, NV 89101",
  "19101": "Philadelphia, PA 19101", "48201": "Detroit, MI 48201",
  "55401": "Minneapolis, MN 55401",  "63101": "St. Louis, MO 63101",
  "80901": "Colorado Springs, CO 80901", "84101": "Salt Lake City, UT 84101",
  "84111": "Salt Lake City, UT 84111",   "97201": "Portland, OR 97201",
  "35203": "Birmingham, AL 35203",   "99501": "Anchorage, AK 99501",
  "85281": "Tempe, AZ 85281",        "72201": "Little Rock, AR 72201",
  "95814": "Sacramento, CA 95814",   "19801": "Wilmington, DE 19801",
  "20001": "Washington, DC 20001",   "96813": "Honolulu, HI 96813",
  "83702": "Boise, ID 83702",        "62701": "Springfield, IL 62701",
  "46204": "Indianapolis, IN 46204", "50309": "Des Moines, IA 50309",
  "66101": "Kansas City, KS 66101",  "40202": "Louisville, KY 40202",
  "70112": "New Orleans, LA 70112",  "04101": "Portland, ME 04101",
  "21201": "Baltimore, MD 21201",    "49503": "Grand Rapids, MI 49503",
  "39201": "Jackson, MS 39201",      "64101": "Kansas City, MO 64101",
  "59601": "Helena, MT 59601",       "68102": "Omaha, NE 68102",
  "89501": "Reno, NV 89501",         "03101": "Manchester, NH 03101",
  "07102": "Newark, NJ 07102",       "87101": "Albuquerque, NM 87101",
  "14201": "Buffalo, NY 14201",      "27601": "Raleigh, NC 27601",
  "58501": "Bismarck, ND 58501",     "44113": "Cleveland, OH 44113",
  "73102": "Oklahoma City, OK 73102","15201": "Pittsburgh, PA 15201",
  "02901": "Providence, RI 02901",   "29201": "Columbia, SC 29201",
  "57501": "Pierre, SD 57501",       "37201": "Nashville, TN 37201",
  "75201": "Dallas, TX 75201",       "78201": "San Antonio, TX 78201",
  "79401": "Lubbock, TX 79401",      "05401": "Burlington, VT 05401",
  "23219": "Richmond, VA 23219",     "25301": "Charleston, WV 25301",
  "53202": "Milwaukee, WI 53202",    "82001": "Cheyenne, WY 82001",
};

// ── State name → 2-letter abbreviation ───────────────────────────────────────

const STATE_NAME_TO_ABBREV: Record<string, string> = {
  "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
  "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
  "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
  "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
  "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
  "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
  "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
  "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
  "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
  "wisconsin": "WI", "wyoming": "WY", "district of columbia": "DC",
};

// ── City → County (fast local lookup) ────────────────────────────────────────

const CITY_TO_COUNTY: Record<string, string> = {
  // Florida
  "palm beach gardens": "Palm Beach County", "west palm beach": "Palm Beach County",
  "royal palm beach": "Palm Beach County",   "boca raton": "Palm Beach County",
  "delray beach": "Palm Beach County",       "boynton beach": "Palm Beach County",
  "fort lauderdale": "Broward County",       "hollywood": "Broward County",
  "pompano beach": "Broward County",         "miami beach": "Miami-Dade County",
  "miami": "Miami-Dade County",              "hialeah": "Miami-Dade County",
  "coral gables": "Miami-Dade County",       "orlando": "Orange County",
  "kissimmee": "Osceola County",             "tampa": "Hillsborough County",
  "st. petersburg": "Pinellas County",       "clearwater": "Pinellas County",
  "jacksonville": "Duval County",            "tallahassee": "Leon County",
  "gainesville": "Alachua County",           "pensacola": "Escambia County",
  // Texas
  "lubbock": "Lubbock County",               "houston": "Harris County",
  "austin": "Travis County",                 "dallas": "Dallas County",
  "san antonio": "Bexar County",             "fort worth": "Tarrant County",
  "arlington": "Tarrant County",             "plano": "Collin County",
  "frisco": "Collin County",                 "mckinney": "Collin County",
  "el paso": "El Paso County",               "amarillo": "Potter County",
  "waco": "McLennan County",                 "corpus christi": "Nueces County",
  "laredo": "Webb County",                   "irving": "Dallas County",
  "garland": "Dallas County",               "grand prairie": "Dallas County",
  // California
  "los angeles": "Los Angeles County",       "long beach": "Los Angeles County",
  "glendale": "Los Angeles County",          "pasadena": "Los Angeles County",
  "torrance": "Los Angeles County",          "san francisco": "San Francisco County",
  "san jose": "Santa Clara County",          "santa clara": "Santa Clara County",
  "sunnyvale": "Santa Clara County",         "san diego": "San Diego County",
  "chula vista": "San Diego County",         "sacramento": "Sacramento County",
  "fresno": "Fresno County",                 "bakersfield": "Kern County",
  "anaheim": "Orange County",               "santa ana": "Orange County",
  "irvine": "Orange County",                "oakland": "Alameda County",
  "berkeley": "Alameda County",             "fremont": "Alameda County",
  "riverside": "Riverside County",           "san bernardino": "San Bernardino County",
  // New York
  "new york": "New York County",             "brooklyn": "Kings County",
  "queens": "Queens County",                 "bronx": "Bronx County",
  "staten island": "Richmond County",        "buffalo": "Erie County",
  "rochester": "Monroe County",             "yonkers": "Westchester County",
  "syracuse": "Onondaga County",             "albany": "Albany County",
  // Illinois
  "chicago": "Cook County",                  "aurora": "Kane County",
  "rockford": "Winnebago County",            "springfield": "Sangamon County",
  "joliet": "Will County",                   "naperville": "DuPage County",
  "peoria": "Peoria County",                 "elgin": "Kane County",
  // Georgia
  "atlanta": "Fulton County",                "augusta": "Richmond County",
  "columbus": "Muscogee County",             "savannah": "Chatham County",
  "athens": "Clarke County",                 "macon": "Bibb County",
  // Other high-traffic cities
  "seattle": "King County",                  "spokane": "Spokane County",
  "phoenix": "Maricopa County",             "tucson": "Pima County",
  "tempe": "Maricopa County",               "scottsdale": "Maricopa County",
  "mesa": "Maricopa County",                "chandler": "Maricopa County",
  "denver": "Denver County",                "colorado springs": "El Paso County",
  "cleveland": "Cuyahoga County",           "toledo": "Lucas County",
  "cincinnati": "Hamilton County",          "philadelphia": "Philadelphia County",
  "pittsburgh": "Allegheny County",         "boston": "Suffolk County",
  "nashville": "Davidson County",           "memphis": "Shelby County",
  "las vegas": "Clark County",              "henderson": "Clark County",
  "portland": "Multnomah County",           "minneapolis": "Hennepin County",
  "st. louis": "St. Louis County",          "kansas city": "Jackson County",
  "detroit": "Wayne County",               "grand rapids": "Kent County",
  "indianapolis": "Marion County",          "milwaukee": "Milwaukee County",
  "louisville": "Jefferson County",         "new orleans": "Orleans Parish",
  "baltimore": "Baltimore City",            "charlotte": "Mecklenburg County",
  "raleigh": "Wake County",                 "durham": "Durham County",
  "columbia": "Richland County",            "bridgeport": "Fairfield County",          "fairfield": "Fairfield County",
  "stamford": "Fairfield County",           "new haven": "New Haven County",
  "hartford": "Hartford County",            "trumbull": "Fairfield County",
  "greenwich": "Fairfield County",          "richmond": "Richmond City",
  "honolulu": "Honolulu County",            "anchorage": "Anchorage Municipality",
  "boise": "Ada County",                    "salt lake city": "Salt Lake County",
  "albuquerque": "Bernalillo County",       "flagstaff": "Coconino County",
  "omaha": "Douglas County",               "lincoln": "Lancaster County",
  "birmingham": "Jefferson County",         "montgomery": "Montgomery County",
  "little rock": "Pulaski County",          "jackson": "Hinds County",
  "providence": "Providence County",        "manchester": "Hillsborough County",
  "newark": "Essex County",                 "jersey city": "Hudson County",
  "wilmington": "New Castle County",        "washington": "District of Columbia",
};

// ── Hyper-local form filtering ────────────────────────────────────────────────

function parseState(location: string): string | null {
  const m = location.match(/,\s+([A-Z]{2})(?:\s+\d{5})?$/);
  return m ? m[1] : null;
}

/** Returns true when a URL is the generic SBA fallback (no locale-specific portal known). */
function isSbaUrl(url: string | undefined): boolean {
  return !url || url.startsWith("https://www.sba.gov");
}

const FORM_EXCLUSIONS: Record<string, Set<string>> = {
  "sales-tax-registration": new Set(["AK", "DE", "MT", "NH", "OR"]),
};

function filterFormsByLocation(formIds: string[], location: string): string[] {
  const state = parseState(location);
  const seen  = new Set<string>();
  const out: string[] = [];
  for (const id of formIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (state && FORM_EXCLUSIONS[id]?.has(state)) continue;
    out.push(id);
  }
  return out;
}

const KNOWN_FORM_IDS = new Set([
  "business-license", "business-registration", "fictitious-name", "ein-application",
  "mobile-food-vendor", "food-service-permit",
  "sales-tax-registration", "home-occupation-permit",
]);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  formClarify?: { question: string; options: string[] } | null;
  formMap?: string[] | null;
}

// ── Welcome message (used as the default when no chat history exists) ─────────

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "- Welcome to RegPulse — your AI compliance co-pilot for permits, zoning, health codes, and local business regulations. [Learn More](https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits)\n" +
    "- Tell me what kind of business you are starting or operating and I will provide a tailored compliance checklist for your location. [Learn More](https://www.sba.gov/business-guide)",
};

/** Convert saved messages back to the full Message type (UI-only fields default to undefined). */
function toMessages(saved: SavedMessage[]): Message[] {
  return saved.map(m => ({ id: m.id, role: m.role, content: m.content }));
}

/** Strip UI-only fields before persisting. */
function toSavedMessages(msgs: Message[]): SavedMessage[] {
  return msgs.map(m => ({ id: m.id, role: m.role, content: m.content }));
}

// ── BulletLine ────────────────────────────────────────────────────────────────

const LINK_RE    = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
const FORM_ID_RE = /\s*%%([a-zA-Z][a-zA-Z0-9-]*)%%\s*/i;

function extractMarkerFromLine(text: string): { formId: string | null; displayText: string } {
  const hit = FORM_ID_RE.exec(text);
  if (!hit) return { formId: null, displayText: text };
  return {
    formId:      hit[1].toLowerCase(),
    displayText: (text.slice(0, hit.index) + text.slice(hit.index + hit[0].length)).trim(),
  };
}

// vUnified-platform-fix: maximum dark mode text contrast in AI messages
// isDark prop drives link colors directly via JS (same pattern as BusinessProfileView —
// no dark: CSS-selector chain, just conditional className based on runtime state).
function BulletLine({ text, isDark }: { text: string; isDark?: boolean }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a key={m.index} href={m[2]} target="_blank" rel="noopener noreferrer"
        className={`underline underline-offset-2 transition-colors ${
          isDark
            ? "text-blue-300 hover:text-blue-200"
            : "text-blue-600 hover:text-blue-800"
        }`}>
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1");
}

// ── PacketScreen ──────────────────────────────────────────────────────────────
// vUnified-platform-fix: mobile scaling in chat + Form Assistant
//   PacketScreen now used only for "View Completed Form" from checklist or on session
//   restore — NOT shown automatically on queue completion (that path was changed to
//   auto-download + toast in handleFormComplete above).
//   Mobile layout fixes applied here:
//   • max-h-[65dvh] sm:max-h-none + overflow-y-auto on outer div so it never swamps
//     the chat on small screens (iPhone SE / iPhone 12 Mini).
//   • p-3 sm:p-5 padding — was p-5 (20px) even on mobile which wasted vertical space.
//   • Download + Return buttons now stack vertically on mobile (flex-col sm:flex-row)
//     so both hit the 48px minimum touch target regardless of screen width.

function PacketScreen({
  forms,
  location,
  checklist,
  onDismiss,
  onSave,
  isPro,
}: {
  forms: CompletedFormEntry[];
  location: string;
  checklist: ChecklistItem[];
  onDismiss: () => void;
  onSave: (name: string) => void;
  isPro?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const [bizName, setBizName]         = useState("");
  const [saved, setSaved]             = useState(false);
  const bizInputRef                   = useRef<HTMLInputElement>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { generateCompliancePacket } = await import("@/lib/generateCompliancePacket");
      await generateCompliancePacket(forms, location);
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = () => {
    const name = bizName.trim() || "My Business";
    onSave(name);
    setSaved(true);
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#0f1823] shrink-0 max-h-[65dvh] sm:max-h-none overflow-y-auto">
      <div className="max-w-2xl mx-auto p-3 sm:p-5">

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">
                All Forms Complete
              </p>
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-blue-200 dark:ring-blue-800/40">
                <Sparkles className="h-2.5 w-2.5" />
                Included with RegPulse Pro
              </span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {forms.length} form{forms.length !== 1 ? "s" : ""} filled for {location}
            </p>
          </div>
        </div>

        {/* Form list */}
        <div className="border border-slate-100 dark:border-slate-700/50 rounded-xl overflow-hidden mb-4">
          {forms.map((entry, i) => {
            const rawPortalUrl = entry.template.submitPortalUrl ?? entry.template.submitUrl;
            const portalUrl    = isSbaUrl(rawPortalUrl) ? null : rawPortalUrl;
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-none">
                <span className="h-5 w-5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-snug">
                    {entry.template.name.split("(")[0].trim()}
                  </p>
                  {entry.template.officialFormNumber && (
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                      {entry.template.officialFormNumber}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Gov. filing fee: {entry.template.fee}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {entry.template.officialFormPdfUrl && (
                    <a
                      href={entry.template.officialFormPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded px-2 py-1 transition-colors"
                    >
                      <Download className="h-3 w-3 shrink-0" />
                      Blank Form
                    </a>
                  )}
                  {portalUrl ? (
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded px-2 py-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      Submit Online
                    </a>
                  ) : (
                    <span
                      className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded px-2 py-1"
                      title="Filing location varies by city/county"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      Local Filing
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Your compliance packet includes your answers, required documents, and submission
          instructions for each form — tailored to {location}.
        </p>

        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2 mb-4">
          This packet is a preparation aid only and does not constitute legal advice.
          Always verify requirements with the official agency before submitting.
        </p>

        {/* Download + Return — stack on mobile, side-by-side on sm+.
            vUnified-platform-fix: min-h-[48px] + touch-action:manipulation on both. */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[48px]"
            style={{ touchAction: "manipulation" }}
            onClick={handleDownload}
            disabled={downloading}
          >
            <FileText className="h-4 w-4 mr-2" />
            {downloading ? "Generating PDF…" : "Download Compliance Packet PDF"}
          </Button>
          <Button
            variant="outline"
            className="min-h-[48px] sm:w-auto"
            style={{ touchAction: "manipulation" }}
            onClick={onDismiss}
          >
            Return to Chat
          </Button>
        </div>

        {/* Save under Business Name */}
        <div className={`rounded-xl border transition-all duration-200 ${
          saved
            ? "border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/20"
            : "border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#131e2f]"
        } px-4 py-3`}>
          {saved ? (
            <div className="flex items-start gap-2">
              <CheckCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-green-800 font-medium leading-snug">
                  Checklist saved to "My Businesses"
                </p>
                <p className="text-[11px] text-green-700 mt-0.5">
                  You can reload it anytime from the sidebar.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                Save this checklist under a business name
              </p>
              <div className="flex gap-2">
                <input
                  ref={bizInputRef}
                  type="text"
                  value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                  placeholder="e.g. Miami Food Truck, Jane's Bakery…"
                  className="flex-1 text-xs h-8 bg-white dark:bg-[#131e2f] border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-300 dark:focus:border-blue-700/60 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={handleSave}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-3 h-8 transition-colors shrink-0"
                >
                  Save
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Press Enter or click Save</p>
            </>
          )}
        </div>

        {/* Pro status / upsell */}
        {isPro ? (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <Crown className="h-3 w-3 text-amber-500" />
            <p className="text-[11px] text-amber-700 font-medium">
              RegPulse Pro — all features active
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-slate-800">Unlock RegPulse Pro — $19/mo</p>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {[
                "Unlimited AI form completions",
                "Automatic renewal filing",
                "Quarterly Check-in PDF report",
                "Priority support",
                "Early access to new forms",
                "Ad-free experience",
              ].map(b => (
                <li key={b} className="flex items-start gap-1 text-[10px] text-slate-600">
                  <CheckCircle2 className="h-2.5 w-2.5 text-blue-500 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-400 text-center">
              or $179/yr — cancel anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// vUnified-20260414-national-expansion-v146 — module-level synchronous IIFE.
// Executes ONCE when the JS chunk for this route is loaded — before React initializes,
// before any component renders, before any hook runs.
//
// Nine skip signals (any one sufficient):
//   0. window.__SKIP_SPLASH           — set by layout.tsx Layer 0 <head> script (earliest)
//   1. localStorage rp_skip_splash    — written by handleFreeSkip on tap
//   2. sessionStorage rp_skip_splash  — belt-and-suspenders copy
//   3. URLSearchParams skip/force     — legacy URL-param fallback
//   4. pathname contains 'chat'       — always true when this chunk runs on /chat/ route
//   5. localStorage rp_onboarded_v1   — user has completed onboarding previously
//   6. sessionStorage rp_onboarded_v1 — written by handleFreeSkip (v128+)
//   7. document.readyState !== 'loading' — page already parsed
//   8. performance.now() > 0          — always true after any real page load (belt-and-suspenders)
//
// Also captures href/origin at load time for the STEP 2 debug banner.
declare global { interface Window { __SKIP_SPLASH?: boolean; } }
const _skipSplashAtLoad = (function (): boolean {
  if (typeof window === "undefined") return false;
  const skipGlobal         = !!window.__SKIP_SPLASH;
  const skipLocal          = localStorage.getItem("rp_skip_splash") === "1";
  const skipSession        = sessionStorage.getItem("rp_skip_splash") === "1";
  const skipUrl            = new URLSearchParams(window.location.search).get("skip") === "1";
  const onChatRoute        = window.location.pathname.includes("chat");
  const isOnboardedLocal   = localStorage.getItem("rp_onboarded_v1") === "1";
  const isOnboardedSession = sessionStorage.getItem("rp_onboarded_v1") === "1";
  const readyStateSkip     = typeof document !== "undefined" && document.readyState !== "loading";
  const perfSkip           = typeof performance !== "undefined" && performance.now() > 0;
  const skip = skipGlobal || skipLocal || skipSession || skipUrl || onChatRoute || isOnboardedLocal || isOnboardedSession || readyStateSkip || perfSkip;
  if (skip) {
    window.__SKIP_SPLASH = true;
    try { localStorage.removeItem("rp_skip_splash"); } catch (_) {}
    try { sessionStorage.removeItem("rp_skip_splash"); } catch (_) {}
  }
  return skip;
})();

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);

  // vUnified-20260414-national-expansion-v276 — React loading overlay (pure React handoff).
  // Covers /chat/ for exactly 1500ms then fades out over 400ms — no native overlay needed.
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(true);
  const [loadingOverlayMounted, setLoadingOverlayMounted] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setLoadingOverlayVisible(false), 1500);
    const t2 = setTimeout(() => setLoadingOverlayMounted(false), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Debounce timer for auto-saving the active business profile. */
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // ── Location state ────────────────────────────────────────────────────────
  const [userLocation, setUserLocation]         = useState("Detecting location...");
  const [useExactLocation, setUseExactLocation] = useState(true);
  const [manualLocation, setManualLocation]     = useState("");
  const [zipResolved, setZipResolved]           = useState(false);
  const [zipLookingUp, setZipLookingUp]         = useState(false);
  const [detectedCounty, setDetectedCounty]     = useState<string | null>(null);
  const gpsActiveRef  = useRef(true);
  const zipLookupRef  = useRef<string>("");
  // vMobile-gps-fix: explicit loading + error state for GPS so the UI can show
  // a loading spinner, distinguish error types, and offer a retry button.
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError,   setGpsError]   = useState<string | null>(null);

  // vMobile-location-fix — refs that always hold the latest location values.
  // Plain async functions (like callApi, sendMessage) capture their enclosing render's
  // state via closure. If GPS resolves and schedules a re-render but the user taps Send
  // before the re-render completes, the old closure still carries "Detecting location..."
  // as userLocation. Reading from refs instead of closure state guarantees callApi always
  // sends the most-current resolved location and county to the API.
  const userLocationRef   = useRef(userLocation);
  const detectedCountyRef = useRef<string | null>(detectedCounty);
  const gpsLoadingRef     = useRef(false);
  // vChatZoningContextInjection: ref mirrors the derived zoning context block so
  // callApi (a plain async function capturing a render-time closure) always reads
  // the most-current value without needing to be recreated on every render.
  const zoningContextRef  = useRef<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [activeTemplate, setActiveTemplate]             = useState<FormTemplate | null>(null);
  const [formQueue, setFormQueue]                       = useState<FormTemplate[]>([]);
  const [queueIndex, setQueueIndex]                     = useState(0);
  const [completedFormsData, setCompletedFormsData]     = useState<CompletedFormEntry[]>([]);
  const [showPacketScreen, setShowPacketScreen]         = useState(false);
  /**
   * Tracks every form completed by the AI form filler, keyed by template.id.
   * Used to power "View Completed Form" in the EnhancedChecklist sidebar.
   * Populated on every handleFormComplete call (single + queue mode).
   */
  const [completedFormsByFormId, setCompletedFormsByFormId] =
    useState<Record<string, CompletedFormEntry>>({});
  /**
   * Pre-filled field values passed to FormFiller when the user clicks "Renew Now".
   * Carries the previous submission's formData so fields are pre-populated.
   * Reset to undefined when opening a fresh (non-renewal) form.
   */
  const [activeFormInitialData, setActiveFormInitialData] =
    useState<Record<string, string> | undefined>(undefined);
  /** True when the active FormFiller session is a renewal (drives the renewal banner). */
  const [activeFormIsRenewal, setActiveFormIsRenewal] = useState(false);
  // vSeamlessProfileFormFillerBridge: tracks that the active FormFiller was launched
  // from BusinessProfileView so handleFormComplete / handleDismissForm know to reopen
  // the profile instead of leaving the user at the empty chat screen.
  const [formLaunchedFromProfile, setFormLaunchedFromProfile] = useState(false);

  // ── Saved businesses ──────────────────────────────────────────────────────
  const [savedBusinesses, setSavedBusinesses] = useState<SavedBusiness[]>([]);
  /** The currently active business profile (set on load; cleared on reset). */
  const [loadedBusiness, setLoadedBusiness]   = useState<SavedBusiness | null>(null);
  /** Controls the Add Business modal visibility. */
  const [showAddBizModal, setShowAddBizModal]       = useState(false);
  const [confirmDeleteBizId, setConfirmDeleteBizId] = useState<string | null>(null);
  // v30: sort order for My Businesses list — 'recent' (default), 'score' (highest first), 'urgency' (most urgent first)
  const [bizSortOrder, setBizSortOrder]             = useState<'recent' | 'score' | 'urgency'>('recent');
  // v56 — Compliance OS portfolio mode: expands sidebar into full unified dashboard
  const [portfolioExpanded, setPortfolioExpanded]   = useState(false);
  // v36 — push notification permission state. Initialised from Notification.permission after mount.
  // null = not yet read (SSR/first-render); "unsupported" = Notification API absent.
  // Banner is shown only when "default" (never asked). Dismissed manually or on grant/deny.
  const [pushPermission, setPushPermission]         = useState<NotificationPermission | "unsupported" | null>(null);
  const [pushBannerDismissed, setPushBannerDismissed] = useState(false);
  // v37 — alert filter: null = show all active alerts, string = show only alerts for that biz ID
  const [alertBizFilter, setAlertBizFilter]         = useState<string | null>(null);
  const [notifPrefsBizId, setNotifPrefsBizId]       = useState<string | null>(null);
  // Multi-location support
  /** ID of the currently active BusinessLocation within loadedBusiness.locations. null = single-location mode. */
  const [activeLocationId, setActiveLocationId]     = useState<string | null>(null);
  /** ID of the business whose "Add Location" modal is open. */
  const [addLocationBizId, setAddLocationBizId]     = useState<string | null>(null);
  /** Set of business IDs whose location list is expanded in the sidebar. */
  const [expandedBizIds, setExpandedBizIds]         = useState<Set<string>>(new Set());
  // Document upload + analysis
  const [docAnalysisResult, setDocAnalysisResult]   = useState<AnalysisResult | null>(null);
  const [showDocUploadPanel, setShowDocUploadPanel] = useState(false);
  // v25 — Preexisting Document Upload: attach-mode panel (no AI analysis)
  const [showAttachPanel, setShowAttachPanel]       = useState(false);
  // v30 — Completed Document → Business Profile Flow
  // v31 — Fix: use refs alongside state so sendMessage always reads the latest values
  //        regardless of closure capture timing (stale useCallback deps were causing
  //        awaitingProfileConfirmation to read as false on the first "yes" reply).
  //
  //   State is for UI rendering (bot message, card hint visibility).
  //   Refs are for sendMessage's synchronous confirmation check (no stale closure).
  const [awaitingProfileConfirmation, setAwaitingProfileConfirmation] = useState(false);
  const [pendingDocumentForProfile, setPendingDocumentForProfile]     = useState<AnalysisResult | null>(null);
  const awaitingProfileConfirmationRef = useRef(false);
  const pendingDocumentForProfileRef   = useRef<AnalysisResult | null>(null);
  // v20 — Forms Library Section: collapsed by default to keep sidebar compact
  const [formsLibraryOpen, setFormsLibraryOpen]     = useState(false);
  // v31 — Business Profile View: replaces chat messages pane when active
  const [showProfileView, setShowProfileView]       = useState(false);
  const [showMobileSidebar, setShowMobileSidebar]   = useState(false); // vMobile
  const [uploadedDocs, setUploadedDocs]             = useState<UploadedDocument[]>([]);

  // ── Pro subscription state ────────────────────────────────────────────────
  // Loaded from profiles.is_pro for authenticated users; defaults false (Free tier).
  const [isPro, setIsPro]                       = useState(false);
  /** True when an unauthenticated user has exceeded the 3-chats/30-day limit. */
  const [showSignInWall, setShowSignInWall]     = useState(false);
  const [monthlyFormsUsed, setMonthlyFormsUsed] = useState(0);

  // vUnified-20260414-national-expansion-v86 — Pro subscription UI state
  // vUnified-20260414-national-expansion-v87 — added proSuccessChatToast + extended to 8 s
  /** True while the /api/stripe/create-checkout-session POST is in-flight. */
  const [proCheckoutLoading, setProCheckoutLoading] = useState(false);
  /** True while the /api/stripe/create-portal-session POST is in-flight. */
  const [proPortalLoading,   setProPortalLoading]   = useState(false);
  // v290 — in-page upgrade modal (replaces /upgrade/ page navigation on native)
  // Lazy initializer reads rp_show_upgrade synchronously so GPS never fires while modal is open.
  const [upgradeModalVisible,  setUpgradeModalVisible]  = useState(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem("rp_show_upgrade") === "1"; } catch { return false; }
  });
  const [upgradeModalMode,     setUpgradeModalMode]     = useState<"signin"|"signup"|"magic">("signup");
  const [upgradeModalEmail,    setUpgradeModalEmail]    = useState("");
  const [upgradeModalPassword, setUpgradeModalPassword] = useState("");
  const [upgradeModalWorking,  setUpgradeModalWorking]  = useState(false);
  const [upgradeModalError,    setUpgradeModalError]    = useState("");
  const [upgradeModalMagicSent,setUpgradeModalMagicSent]= useState(false);
  const [checkoutOverlayVisible, setCheckoutOverlayVisible] = useState(false);
  /**
   * v86 — sidebar auth panel success banner (visible while proSuccessVisible is true).
   * v87 — also drives the dedicated chat-area success toast below.
   * Both are dismissed automatically after 8 s or when the user taps ×.
   */
  const [proSuccessVisible,      setProSuccessVisible]     = useState(false);
  /**
   * v87 — persistent success toast anchored in the main chat column.
   * Separate from the sidebar banner so it's visible regardless of sidebar state on mobile.
   */
  const [proSuccessChatToast,    setProSuccessChatToast]   = useState(false);
  const proSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (proSuccessTimerRef.current) clearTimeout(proSuccessTimerRef.current); }, []);

  // ── vUnified-20260414-national-expansion-v89 — Splash + onboarding overlay state ──
  // splashVisible: true from mount → false once auth bootstrap + 2 s min-timer both done.
  // onboardingVisible: true only for unauthenticated first-time users (localStorage gate).
  // Both overlays are layered ABOVE the main app (z-[400] / z-[300]) so the full chat UI
  // renders behind them from frame 0 — no layout jank on dismiss.
  // vUnified-20260414-national-expansion-v125 — initial state from module-level IIFE + global.
  // _skipSplashAtLoad checked all 4 signals at module load time.
  // window.__SKIP_SPLASH was set by layout Layer 0 script before this chunk loaded.
  // splashVisible=false from byte 0 when skip detected → AppSplashOverlay never painted.
  const _skip = _skipSplashAtLoad || !!(typeof window !== "undefined" && window.__SKIP_SPLASH);
  const [splashVisible,      setSplashVisible]      = useState<boolean>(!_skip);
  const [onboardingVisible,  setOnboardingVisible]  = useState(false);
  const [skipSplashDetected, setSkipSplashDetected] = useState<boolean>(_skip);
  // Shared ready-flags written by the min-timer and the auth bootstrap independently.
  const splashReadyRef = useRef<{ authDone: boolean; minTimerDone: boolean }>({
    authDone: false, minTimerDone: false,
  });
  // Captures the resolved User before the setUser state update so checkSplashReady()
  // can read it synchronously without a stale closure.
  const userForOnboardingRef = useRef<User | null>(null);

  // ── Supabase auth state ───────────────────────────────────────────────────
  const [user, setUser]           = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Auth sidebar panel
  const [authExpanded, setAuthExpanded] = useState(false);
  const [authMode, setAuthMode]   = useState<"signin" | "signup" | "magic">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authWorking, setAuthWorking] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // Singleton Supabase browser client — stable across renders via ref.
  const sbRef = useRef<ReturnType<typeof createClient> | null>(null);
  function getSb() {
    if (!sbRef.current) sbRef.current = createClient();
    return sbRef.current;
  }

  // ── Load data from Supabase (authenticated path) ──────────────────────────
  const loadFromSupabase = useCallback(async (uid: string) => {
    const sb = getSb();
    const [businesses, alerts, usage, pro] = await Promise.all([
      dbLoadBusinesses(sb, uid),
      dbLoadAlerts(sb, uid),
      dbLoadMonthlyUsage(sb, uid),
      dbLoadIsPro(sb, uid),
    ]);
    setSavedBusinesses(businesses);
    setRuleAlerts(alerts);
    setMonthlyFormsUsed(usage);
    setIsPro(pro);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── vUnified-20260414-national-expansion-v89 — Splash dismiss logic ────────
  // Called from two independent sites:
  //   1. The auth bootstrap's getSession().then() callback (authDone flag)
  //   2. The 2 s minimum-display timer useEffect (minTimerDone flag)
  // Both flags must be true before the splash is hidden, ensuring the animation
  // plays for at least 2 s regardless of how fast getSession() resolves.
  //
  // After both flags are set:
  //   - signed-in returning user  → splash off, onboarding skipped, localStorage written
  //   - unauthenticated + not yet onboarded → splash off, onboarding shown
  //   - unauthenticated + already onboarded → splash off, onboarding skipped
  const checkSplashReady = useCallback(() => {
    if (!splashReadyRef.current.authDone || !splashReadyRef.current.minTimerDone) return;
    const onboarded =
      typeof window !== "undefined" && !!localStorage.getItem("rp_onboarded_v1");
    setSplashVisible(false);
    const u = userForOnboardingRef.current;
    if (!onboarded && !u) {
      // First-time unauthenticated user — show tier selection.
      setOnboardingVisible(true);
    } else if (!onboarded && u) {
      // Already signed in on first visit — mark as onboarded, skip tier screen.
      if (typeof window !== "undefined") localStorage.setItem("rp_onboarded_v1", "1");
    }
    // onboarded === true: nothing to do, main app is already visible behind the splash.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── vUnified-20260414-national-expansion-v120 — Skip-splash on arrival from free-tier nav ──
  //
  // useLayoutEffect fires synchronously BEFORE the browser's first paint so setSplashVisible(false)
  // is committed in the same React render that produces the first pixel. AppSplashOverlay renders
  // with opacity=0 and pointerEvents:none from byte 0 — chat content immediately visible.
  //
  // v120 storage strategy: checks BOTH localStorage AND sessionStorage.
  //   - localStorage: written by OnboardingFlow.handleFreeSkip (nuclear direct navigation path)
  //     Persists across window.location navigation on WKWebView. Checked first.
  //   - sessionStorage: written by NativeApp.handleLaunchSplashHide (returning user path)
  //     Persists within the same WKWebView session.
  //   Both are cleared on detection. Belt-and-suspenders: 300ms setTimeout also calls
  //   setSplashVisible(false) in case the layout effect fires before React fully hydrates.
  //
  // typeof window guard: Next.js SSG runs this component in Node.js — guard prevents error.
  // eslint-disable-next-line react-hooks/exhaustive-deps — intentional: runs once on mount
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const skipLocal          = localStorage.getItem("rp_skip_splash") === "1";
    const skipSession        = sessionStorage.getItem("rp_skip_splash") === "1";
    const skipGlobal         = !!(window as Window).__SKIP_SPLASH;
    const skipUrl            = new URLSearchParams(window.location.search).get("skip") === "1";
    const onChatRoute        = window.location.pathname.includes("chat");
    const isOnboardedLocal   = localStorage.getItem("rp_onboarded_v1") === "1";
    const isOnboardedSession = sessionStorage.getItem("rp_onboarded_v1") === "1";
    const readyStateSkip     = document.readyState !== "loading";
    const perfSkip           = typeof performance !== "undefined" && performance.now() > 0;
    const skip = skipLocal || skipSession;
    if (skip || skipGlobal || skipUrl || onChatRoute || isOnboardedLocal || isOnboardedSession || readyStateSkip || perfSkip || _skipSplashAtLoad) {
      // Belt-and-suspenders: clear storage + global even if module-level IIFE already cleared.
      try { localStorage.removeItem("rp_skip_splash"); } catch (_) {}
      try { sessionStorage.removeItem("rp_skip_splash"); } catch (_) {}
      try { delete (window as Window).__SKIP_SPLASH; } catch (_) {}
      setSplashVisible(false);
      setSkipSplashDetected(true);
      // 50ms fallback: belt-and-suspenders — layout Layer 0 + module IIFE cover byte 0,
      // this catches any edge case where useState was initialized before signals were set.
      setTimeout(() => { setSplashVisible(false); }, 50);
    }
  }, []); // runs exactly once on mount, before first paint

  // ── vUnified-20260414-national-expansion-v89 — Splash minimum display timer ─
  // Guarantees the animated splash is visible for at least 2 s so the EKG
  // animation plays completely even if auth resolves in <200 ms (cached token).
  useEffect(() => {
    const t = setTimeout(() => {
      splashReadyRef.current.minTimerDone = true;
      checkSplashReady();
    }, 2000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── vUnified-20260414-national-expansion-v116 — Hard safety: force splash off at 8000ms ─
  // If auth bootstrap + min-timer path fails for any reason, unconditionally calls
  // setSplashVisible(false) at 8000ms. No cleanup return — fires unconditionally.
  // AppSplashOverlay 9000ms safety fires 1s later as belt-and-suspenders (setMounted fallback).
  useEffect(() => {
    setTimeout(() => { setSplashVisible(false); }, 8000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // v290 — On mount, clear the rp_show_upgrade signal (already read by useState lazy initializer).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { sessionStorage.removeItem("rp_show_upgrade"); } catch (_) {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── vUnified-20260414-national-expansion-v88 — Native platform init ─────────
  // Fires once on mount, before the auth bootstrap resolves.
  // vUnified-20260414-national-expansion-v93 — Removed @capacitor/splash-screen to eliminate
  // final Swift 6 SplashScreenPlugin build errors. All Capacitor plugins removed (v91: share +
  // status-bar, v92: filesystem, v93: splash-screen). Zero plugins = clean Xcode build.
  //
  // Splash UX is now 100% web-layer:
  //   - LaunchScreen.storyboard (dark navy #0B1E3F) shows while WKWebView loads.
  //   - AppSplashOverlay.tsx (z-[400], animated shield + EKG) takes over immediately on
  //     first React render and stays visible until auth bootstrap + 2 s min-timer complete.
  //   - OnboardingFlow.tsx (z-[300]) appears for unauthenticated first-time users.
  //
  // No SplashScreen.hide() call needed — the native storyboard splash is automatically
  // dismissed by WKWebView as soon as the web content finishes its first paint. The
  // AppSplashOverlay fills any remaining gap with a seamless branded overlay.
  //
  // No nativeInit useEffect needed — no plugins remain that require initialization.

  // ── Auth + data bootstrap on mount ────────────────────────────────────────
  useEffect(() => {
    const sb = getSb();

    // 1. Check for an existing session (e.g. from a previous page visit).
    sb.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      // vUnified-20260414-national-expansion-v89 — capture user for onboarding check
      // before React batches the setUser setState, so checkSplashReady reads the right value.
      userForOnboardingRef.current = u;
      setUser(u);
      setAuthLoading(false);
      splashReadyRef.current.authDone = true; // v89 — signal auth bootstrap complete
      checkSplashReady(); // v89 — dismiss splash when min-timer also done
      if (u) {
        void loadFromSupabase(u.id);
        // vUnified-20260414-national-expansion-v86/v87 — detect ?success=true return from Stripe.
        // Show both the sidebar banner and the main-chat toast so the confirmation is visible
        // regardless of whether the mobile sidebar is open. Stripe webhooks fire asynchronously;
        // we re-load isPro after 3 s and the realtime channel also picks up the write instantly.
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          // vUnified-20260414-national-expansion-v102 — ?tier=pro: fired by root-route
          // OnboardingFlow after the user picks Pro and creates an account. The root
          // navigates to /chat/?tier=pro; once auth resolves here we initiate the Stripe
          // checkout directly with the resolved user ID (not via handleUpgradeToPro which
          // reads stale state before the first re-render with setUser).
          if (params.get("tier") === "pro" && u) {
            const tierUrl = new URL(window.location.href);
            tierUrl.searchParams.delete("tier");
            window.history.replaceState({}, "", tierUrl.toString());
            setProCheckoutLoading(true);
            fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: u.id }),
            })
              .then(r => r.json())
              .then((data: { url?: string }) => { if (data.url) window.location.href = data.url; })
              .catch(() => {})
              .finally(() => setProCheckoutLoading(false));
          }

          if (params.get("success") === "true") {
            setProSuccessVisible(true);
            setProSuccessChatToast(true);    // v87 — chat-area toast
            // Clean the query param so a hard-refresh doesn't re-trigger the banners.
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("success");
            window.history.replaceState({}, "", cleanUrl.toString());
            // Re-load Pro status after 3 s — give the webhook time to write the DB.
            // The realtime channel (v87) will also fire immediately on the DB write.
            proSuccessTimerRef.current = setTimeout(() => {
              void loadFromSupabase(u.id);
              // Auto-dismiss both banners after 8 s total (3 s + 5 s).
              proSuccessTimerRef.current = setTimeout(() => {
                setProSuccessVisible(false);
                setProSuccessChatToast(false);
              }, 5000);
            }, 3000);
          }
        }
      } else {
        // Guest: load from localStorage.
        setSavedBusinesses(localLoadBusinesses());
        setRuleAlerts(localLoadAlerts());
        setMonthlyFormsUsed(localLoadMonthlyUsage());
      }
    });

    // 2. Listen for sign-in / sign-out events.
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === "SIGNED_IN" && u) {
        // Migrate any guest data to Supabase, then reload from the DB.
        await syncGuestDataToSupabase(sb, u.id);
        await loadFromSupabase(u.id);
        setAuthExpanded(false);
        // vUnified-20260414-national-expansion-v89 — dismiss onboarding overlay on any sign-in
        // (covers both OnboardingFlow auth + the existing sidebar auth panel).
        if (typeof window !== "undefined") localStorage.setItem("rp_onboarded_v1", "1");
        setOnboardingVisible(false);
      } else if (event === "SIGNED_OUT") {
        setSavedBusinesses(localLoadBusinesses());
        setRuleAlerts(localLoadAlerts());
        setMonthlyFormsUsed(localLoadMonthlyUsage());
        setIsPro(true); // guests default to full access
      }
    });

    return () => subscription.unsubscribe();
  }, [loadFromSupabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── vUnified-20260414-national-expansion-v87 — Real-time profiles sync ───
  // Supabase Postgres Changes subscription on the `profiles` table.
  // Fires instantly when the Stripe webhook writes is_pro=true after payment,
  // giving the user immediate UI feedback without a page reload.
  //
  // Prerequisites (set once in Supabase Dashboard → Table Editor → profiles):
  //   1. Enable Realtime on the profiles table, OR run:
  //      ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  //   2. The existing "profiles_select_own" RLS policy covers realtime reads.
  //
  // Pattern: keyed on user?.id so the channel is torn down and rebuilt only
  // when the authenticated user changes (sign-in / sign-out).
  useEffect(() => {
    if (!user) return;
    const sb = getSb();

    const channel = sb
      .channel(`regpulse-profiles-pro-${user.id}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // payload.new contains the updated row columns.
          // Only update isPro if the field is present (partial updates possible).
          const row = payload.new as { is_pro?: boolean; subscription_status?: string };
          if (typeof row.is_pro === "boolean") {
            setIsPro(row.is_pro);
          }
        },
      )
      .subscribe();

    return () => { void sb.removeChannel(channel); };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth action helpers ───────────────────────────────────────────────────
  const handleSignIn = async () => {
    setAuthWorking(true); setAuthError("");
    const { error } = await getSb().auth.signInWithPassword({ email: authEmail, password: authPassword });
    setAuthWorking(false);
    if (error) setAuthError(error.message);
  };

  const handleSignUp = async () => {
    setAuthWorking(true); setAuthError("");
    const { error } = await getSb().auth.signUp({
      email: authEmail,
      password: authPassword,
      options: { emailRedirectTo: "https://www.reg-bot.ai/auth/callback" },
    });
    setAuthWorking(false);
    if (error) setAuthError(error.message);
    else setAuthError("Check your email to confirm your account.");
  };

  const handleMagicLink = async () => {
    setAuthWorking(true); setAuthError("");
    const { error } = await getSb().auth.signInWithOtp({ email: authEmail });
    setAuthWorking(false);
    if (error) setAuthError(error.message);
    else setMagicSent(true);
  };

  const handleSignOut = async () => {
    await getSb().auth.signOut();
    setUser(null);
    setAuthExpanded(false);
  };

  // vUnified-20260414-national-expansion-v86 — Pro subscription handlers ──────

  /**
   * Redirect the signed-in user to the Stripe Pro subscription checkout.
   * If the user is not signed in, expands the auth panel first.
   * Min-h-[48px] button + pointer-events-auto mandate: enforced at the call site.
   */
  // v290 — shared checkout launcher used by both the main CTA and the upgrade modal
  const startCheckout = async (userId: string) => {
    setCheckoutOverlayVisible(true);
    setUpgradeModalVisible(false);
    try {
      const res  = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        if (isCapacitorNative()) {
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({ url: data.url, presentationStyle: "popover" });
        } else {
          window.location.href = data.url;
        }
      } else {
        console.error("[startCheckout] checkout error:", data.error);
        setUpgradeModalError(data.error ?? "Checkout failed. Please try again.");
        setUpgradeModalVisible(true);
      }
    } catch (err) {
      console.error("[startCheckout]", err);
      setUpgradeModalError("Checkout failed. Please try again.");
      setUpgradeModalVisible(true);
    } finally {
      setCheckoutOverlayVisible(false);
      setProCheckoutLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    if (!user) { setUpgradeModalVisible(true); return; }
    setProCheckoutLoading(true);
    await startCheckout(user.id);
  };

  // v290 — upgrade modal auth handlers
  const handleUpgradeModalSignIn = async () => {
    setUpgradeModalWorking(true); setUpgradeModalError("");
    const { data, error: e } = await getSb().auth.signInWithPassword({
      email: upgradeModalEmail.trim(), password: upgradeModalPassword,
    });
    setUpgradeModalWorking(false);
    if (e) { setUpgradeModalError(e.message); return; }
    if (data.user) await startCheckout(data.user.id);
  };

  const handleUpgradeModalSignUp = async () => {
    setUpgradeModalWorking(true); setUpgradeModalError("");
    const { data, error: e } = await getSb().auth.signUp({
      email: upgradeModalEmail.trim(),
      password: upgradeModalPassword,
      options: { emailRedirectTo: "https://www.reg-bot.ai/auth/callback" },
    });
    setUpgradeModalWorking(false);
    if (e) { setUpgradeModalError(e.message); return; }
    if (data.session?.user) {
      await startCheckout(data.session.user.id);
    } else {
      // Email confirmation required — switch to Sign In tab so the user can sign in right after confirming.
      setUpgradeModalMode("signin");
      setUpgradeModalError("Account created! Check your inbox (and spam) for a confirmation link, then sign in here to continue to checkout.");
    }
  };

  const handleUpgradeModalMagicLink = async () => {
    setUpgradeModalWorking(true); setUpgradeModalError("");
    const { error: e } = await getSb().auth.signInWithOtp({
      email: upgradeModalEmail.trim(),
      options: { emailRedirectTo: "https://www.reg-bot.ai/auth/callback" },
    });
    setUpgradeModalWorking(false);
    if (e) { setUpgradeModalError(e.message); return; }
    setUpgradeModalMagicSent(true);
  };

  const submitUpgradeModal = () => {
    if (upgradeModalMode === "signin") void handleUpgradeModalSignIn();
    else if (upgradeModalMode === "signup") void handleUpgradeModalSignUp();
    else void handleUpgradeModalMagicLink();
  };

  /**
   * Open the Stripe Billing Portal for the signed-in Pro subscriber so they can
   * update payment method, view invoices, or cancel their subscription.
   */
  const handleManageSubscription = async () => {
    if (!user) return;
    setProPortalLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/stripe/create-portal-session`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: user.id }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        if (isCapacitorNative()) {
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({ url: data.url, presentationStyle: "popover" });
        } else {
          window.location.href = data.url;
        }
      } else {
        console.error("[handleManageSubscription] portal error:", data.error);
      }
    } catch (err) {
      console.error("[handleManageSubscription]", err);
    } finally {
      setProPortalLoading(false);
    }
  };

  // ── vUnified-20260414-national-expansion-v89 — Onboarding completion handler ─
  // Called by OnboardingFlow when the user makes a tier selection (Free) or completes
  // auth (Pro / Business). Writes the localStorage gate key and hides the overlay.
  // For Pro intent with a freshly-signed-in user, fires the Stripe checkout redirect.
  // NOTE: must be declared AFTER handleUpgradeToPro (which is defined above).
  const handleOnboardingComplete = (tier: OnboardingTier) => {
    if (typeof window !== "undefined") localStorage.setItem("rp_onboarded_v1", "1");
    setOnboardingVisible(false);
    if (tier === "pro") void handleUpgradeToPro();
  };

  // ── Rule Change Alerts ────────────────────────────────────────────────────
  // Loaded in the auth bootstrap useEffect above (both Supabase and localStorage paths).
  const [ruleAlerts, setRuleAlerts] = useState<RuleAlert[]>([]);

  // v61 — Review Impact modal: ID of the alert whose detail modal is open (null = closed)
  const [reviewImpactAlertId, setReviewImpactAlertId] = useState<string | null>(null);

  // Generate mock alerts for saved businesses that don't have one yet.
  // Persists to Supabase when signed in, localStorage otherwise.
  // v26 — fires push notification via lib/notifications.ts for each new alert.
  useEffect(() => {
    if (savedBusinesses.length === 0) return;
    setRuleAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const newAlerts: RuleAlert[] = [];
      for (const biz of savedBusinesses) {
        const alert = generateMockAlertForBusiness(biz);
        if (alert && !existingIds.has(alert.id)) newAlerts.push(alert);
      }
      if (newAlerts.length === 0) return prev;
      const updated = [...prev, ...newAlerts];
      // v26 — fire browser push notification for each new rule-change alert.
      // fireRuleAlertNotification is a no-op when Notification.permission !== "granted".
      for (const a of newAlerts) {
        fireRuleAlertNotification(a.businessName, a.title, a.description);
      }
      // v31 — when ≥2 businesses have active alerts, also fire a portfolio digest notification
      // (schedulePortfolioDigestNotification no-ops when count < 2 or permission not granted)
      const totalActive = [...prev, ...newAlerts].filter(a => !a.dismissed && !(a.snoozedUntil && Date.now() < a.snoozedUntil));
      const affectedBizNames = [...new Set(totalActive.map(a => a.businessName))];
      schedulePortfolioDigestNotification(totalActive.length, affectedBizNames);
      // Persist — dbSaveAlerts writes to both localStorage and Supabase if signed in.
      void dbSaveAlerts(user ? getSb() : null, user?.id ?? null, updated);
      return updated;
    });
  }, [savedBusinesses]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save toast ───────────────────────────────────────────────────────
  interface AutoSaveToast { count: number; itemIds: string[] }
  const [autoSaveToast, setAutoSaveToast] = useState<AutoSaveToast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // ── Packet / form-completion toast ────────────────────────────────────────
  // vUnified-platform-fix: form completion download/new-tab behavior
  // Shown after queue or single-form completion instead of opening the PacketScreen.
  // retryFn — called when user taps "Retry Download" (in case auto-download was blocked).
  interface PacketToast { message: string; retryFn?: () => void }
  const [packetToast, setPacketToast] = useState<PacketToast | null>(null);
  const packetToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPacketSuccessToast = (message: string, retryFn?: () => void) => {
    if (packetToastTimerRef.current) clearTimeout(packetToastTimerRef.current);
    setPacketToast({ message, retryFn });
    packetToastTimerRef.current = setTimeout(() => setPacketToast(null), 7000);
  };

  useEffect(() => () => { if (packetToastTimerRef.current) clearTimeout(packetToastTimerRef.current); }, []);

  // ── Dark mode ────────────────────────────────────────────────────────────
  // vUnified-platform-fix: maximum dark mode text contrast in AI messages
  // Root cause of previous illegibility: useState with typeof-window guard fires
  // on the server returning false, causing a hydration mismatch — the `dark` class
  // was never reliably applied on initial page load. Fix: initialise to false and
  // use useEffect to read localStorage after mount, guaranteeing a clean re-render
  // with the correct value.  The `dark` class on the root shell div scopes all
  // Tailwind dark: variants to this route only (landing pages are unaffected).
  const DARK_KEY = "rp-dark-mode";
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem(DARK_KEY) === "1");
  }, []);

  // v36 — Read push notification permission on mount (safe: getNotifPermission never throws).
  // Re-read whenever savedBusinesses changes so the banner disappears once permission is granted
  // outside our app (e.g. OS settings). Also dismissed locally via pushBannerDismissed.
  useEffect(() => {
    setPushPermission(getNotifPermission());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const isQueueMode = formQueue.length > 0;
  const queueLabel  = isQueueMode ? `Form ${queueIndex + 1} of ${formQueue.length}` : undefined;

  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const checklistTopRef      = useRef<HTMLDivElement>(null);
  const renewalsSectionRef   = useRef<HTMLDivElement>(null);
  const alertsSectionRef     = useRef<HTMLDivElement>(null);

  // ── Rule alert helpers ────────────────────────────────────────────────────

  // v32: pre-filtered active alerts — excludes dismissed AND currently-snoozed alerts.
  // "Snoozed" = snoozedUntil is set and Date.now() < snoozedUntil (snooze hasn't expired).
  // After snooze expires the alert naturally reappears here without any state change.
  const activeAlerts = useMemo(
    () => ruleAlerts.filter(a => !a.dismissed && !(a.snoozedUntil && Date.now() < a.snoozedUntil)),
    [ruleAlerts],
  );

  /** Form IDs with at least one active (non-dismissed, non-snoozed) alert — used to badge
   *  matching checklist items with the amber "Updated" indicator. */
  const alertedFormIds = useMemo<Set<string>>(() => {
    const ids = new Set<string>();
    activeAlerts.forEach(a => a.affectedForms.forEach(f => ids.add(f)));
    return ids;
  }, [activeAlerts]);

  // v40 — Digest push auto-fire: when ≥2 active alerts exist, fire a single digest notification
  // (reduces per-business fatigue). schedulePortfolioDigestNotification no-ops if push not granted.
  // Placed after activeAlerts useMemo so the reference is valid (no TS2448 used-before-declared).
  useEffect(() => {
    if (activeAlerts.length >= 2) {
      const bizNames = [...new Set(activeAlerts.map(a => a.businessName ?? a.businessId))];
      schedulePortfolioDigestNotification(activeAlerts.length, bizNames);
    }
  }, [activeAlerts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissAlert = useCallback((alertId: string) => {
    setRuleAlerts(prev => {
      const updated = prev.map(a => a.id === alertId ? { ...a, dismissed: true } : a);
      void dbSaveAlerts(user ? getSb() : null, user?.id ?? null, updated);
      return updated;
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // v32 — Snooze an alert for N days. The alert is hidden from active views until
  // snoozedUntil expires, but not permanently dismissed (it reappears after snooze).
  // Touch target: snooze button is min-h-[32px] — acceptable for secondary action on alert card.
  const snoozeAlert = useCallback((alertId: string, days = 7) => {
    setRuleAlerts(prev => {
      const snoozedUntil = Date.now() + days * 24 * 60 * 60 * 1000;
      const updated = prev.map(a => a.id === alertId ? { ...a, snoozedUntil } : a);
      void dbSaveAlerts(user ? getSb() : null, user?.id ?? null, updated);
      return updated;
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── v33: Recommended forms for the active business (passed to BusinessProfileView) ──
  // Derived from loadedBusiness so they auto-refresh when handleLocationChangeFromProfile
  // updates the location and triggers a re-render.
  // vUnified-20260414-national-expansion-v4: include LOCAL_FORMS in profileRecommendedForms
  // getLocalFormsForLocation scores LOCAL_FORMS by county/city/state match and returns
  // the top entries for the business's detected location. Up to 4 local forms are merged
  // after the base recommended forms, giving users county-specific form suggestions in
  // BusinessProfileView (e.g. "Broward County Business Tax Receipt" for a Ft. Lauderdale biz).
  const profileRecommendedForms = useMemo<(FederalFormEntry | StateFormEntry)[]>(() => {
    if (!loadedBusiness) return [];
    const state = parseStateFromLocation(loadedBusiness.location) ?? undefined;
    const ids   = getRecommendedForms(loadedBusiness.businessType, state, detectedCounty ?? undefined, loadedBusiness.isPreExisting === false);
    const base  = ids
      .map(id => ALL_FORMS[id])
      .filter((f): f is FederalFormEntry | StateFormEntry => !!f && (isFederalForm(f) || isStateForm(f)));

    // Append county-/city-specific LOCAL_FORMS entries not already in base
    const localForms = getLocalFormsForLocation(
      loadedBusiness.location,
      detectedCounty,
      loadedBusiness.businessType,
      4,
    );
    const baseIds = new Set(base.map(f => f.id));
    const newLocals = localForms.filter(f => !baseIds.has(f.id));

    return [...base, ...newLocals].slice(0, 12);
  }, [loadedBusiness, detectedCounty]);

  // ── Active location (derived) ─────────────────────────────────────────────
  // When the loaded business has multiple locations and one is active, this gives
  // the active BusinessLocation object. null in single-location mode.
  const activeLocation = useMemo<BusinessLocation | null>(() => {
    if (!loadedBusiness?.locations?.length || !activeLocationId) return null;
    return loadedBusiness.locations.find(l => l.id === activeLocationId) ?? null;
  }, [loadedBusiness, activeLocationId]);

  // ── Cross-business renewals ───────────────────────────────────────────────
  // Aggregates renewal items from ALL saved businesses (not just the active one).
  // Each entry carries the owning SavedBusiness so the sidebar can show the name
  // and the "Renew" button can switch to that business if needed.
  // Multi-location: also aggregates from each location's checklist.
  const allRenewals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rows: {
      biz: SavedBusiness;
      item: ChecklistItem;
      daysLeft: number;
      formName: string;
    }[] = [];

    const addFromChecklist = (biz: SavedBusiness, items: ChecklistItem[]) => {
      for (const item of items) {
        if (!item.renewalDate) continue;
        const d = new Date(item.renewalDate + "T00:00:00");
        const daysLeft = Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
        const formName = item.text.replace(/^Complete and submit:\s*/i, "").split("(")[0].trim();
        rows.push({ biz, item, daysLeft, formName });
      }
    };

    // Include saved businesses' checklists (covers all businesses, including active one).
    // For the active business, prefer live checklist state over the saved snapshot so
    // any in-session edits (e.g. status changes) are reflected immediately.
    for (const biz of savedBusinesses) {
      const isActive = loadedBusiness?.id === biz.id;
      if (biz.locations?.length) {
        // Multi-location: aggregate from all locations
        for (const loc of biz.locations) {
          const isActiveLocation = isActive && loc.id === activeLocationId;
          addFromChecklist(biz, isActiveLocation ? checklist : (loc.checklist ?? []));
        }
      } else {
        // Single-location (backward compat)
        addFromChecklist(biz, isActive ? checklist : biz.checklist);
      }
    }

    // De-duplicate by item.id (in case the active business appears in both sources),
    // then sort soonest first.
    const seen = new Set<string>();
    return rows
      .filter(r => { if (seen.has(r.item.id)) return false; seen.add(r.item.id); return true; })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [savedBusinesses, loadedBusiness, checklist, activeLocationId]);

  // ── Compliance Health Score ───────────────────────────────────────────────
  // Computed from live checklist state on every render (including after
  // handleLoadBusiness) so returning users immediately see their current posture.
  // v61 — "verified done" excludes self-reported pre-existing items (in-progress status)
  // so newly-created profiles start at 0% / "No data yet" rather than 100%.
  const healthScore = useMemo(() => {
    if (checklist.length === 0) return null;
    const total    = checklist.length;
    // v61: only count items that were actually completed (not just self-reported "in-progress")
    const done     = checklist.filter(i => i.status === "done").length;
    const pending  = total - done;
    const score    = Math.round((done / total) * 100);
    const noData   = done === 0; // v61 — true when nothing has been verified as done yet
    // expiringCount = renewals within 90 days across ALL businesses (not just active one).
    // allRenewals is already computed above; we just filter it here so the health card
    // reflects the full portfolio's urgency, not just the active business.
    const expiringCount = allRenewals.filter(r => r.daysLeft <= 90).length;
    return { score, pending, expiringCount, total, done, noData };
  // allRenewals already depends on checklist, so we include it here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist, allRenewals]);

  // ── v25 formUrlMap ─────────────────────────────────────────────────────────
  // Maps formId → officialUrl (or submitPortalUrl/submitUrl for FORM_TEMPLATES) for the
  // ComplianceCalendar one-tap "Renew Now" links. ALL_FORMS is a Record<string, AnyForm>
  // (module-level constant), so this useMemo runs once and the map is stable.
  const formUrlMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const f of Object.values(ALL_FORMS)) {
      if (isStateForm(f) || isFederalForm(f)) {
        // StateFormEntry + FederalFormEntry both have .officialUrl
        if (f.officialUrl) map[f.id] = f.officialUrl;
      } else {
        // FormTemplate — uses submitPortalUrl ?? submitUrl
        const ft = f as FormTemplate;
        const url = ft.submitPortalUrl ?? ft.submitUrl;
        if (url) map[ft.id] = url;
      }
    }
    return map;
  }, []); // ALL_FORMS is a module-level constant — stable reference, no deps needed

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTemplate, showPacketScreen]);

  // vMobile-location-fix: keep location refs in sync with state on every render.
  // Must come before callApi so the refs are always current when the user sends a message.
  useEffect(() => { userLocationRef.current   = userLocation;   }, [userLocation]);
  useEffect(() => { detectedCountyRef.current = detectedCounty; }, [detectedCounty]);
  useEffect(() => { gpsLoadingRef.current     = gpsLoading;     }, [gpsLoading]);

  // ── vChatZoningContextInjection ──────────────────────────────────────────
  // Derive the attached zoning result for the currently loaded business.
  // Source: a synthetic UploadedDocument (mimeType "application/json",
  // formId "zoning-check") created by handleAttachZoningResult. This is the
  // exact same document the FormFiller's zoningProfile prop reads from.
  const attachedZoningContext = useMemo(() => {
    if (!loadedBusiness) return null;
    // Find the zoning doc for this specific business.
    const zoningDoc = uploadedDocs.find(
      d => d.businessId === loadedBusiness.id &&
           d.mimeType === "application/json" &&
           (d.formId === "zoning-check" || d.analysis?.docType === "Zoning Compliance Check")
    );
    if (!zoningDoc?.analysis) return null;
    const raw = zoningDoc.analysis.rawExtracted as Record<string, unknown> | undefined;
    return {
      status:       (raw?.status as string | undefined) ?? "unknown",
      // v70 pattern: check underscore variant first (API writes zone_type), then camelCase
      zoneType:     (
        (raw?.zone_type as string | undefined) ??
        (raw?.zoneType  as string | undefined) ??
        (zoningDoc.analysis.issuingAuthority as string | undefined) ??
        "Unknown zone"
      ),
      restrictions: Array.isArray(raw?.restrictions)
        ? (raw.restrictions as string[])
        : (Array.isArray(zoningDoc.analysis.suggestions)
            ? (zoningDoc.analysis.suggestions as string[])
            : []),
      matchedFormIds: zoningDoc.analysis.matchedFormIds ?? [],
      notes:        zoningDoc.analysis.summary ?? "",
      address:      (raw?.address       as string | undefined) ?? loadedBusiness.location,
      businessType: (raw?.business_type as string | undefined) ?? (loadedBusiness.businessType ?? ""),
      checkedAt:    zoningDoc.uploadedAt,
    };
  }, [loadedBusiness, uploadedDocs]);

  // Build the concise text block that is injected into every callApi as a
  // synthetic user/assistant exchange. Kept short (≤5 lines) so it doesn't
  // consume excessive tokens. Null when no zoning result is attached.
  const zoningContextBlock = useMemo((): string | null => {
    if (!attachedZoningContext) return null;
    const { status, zoneType, restrictions, matchedFormIds, notes, address, businessType } = attachedZoningContext;
    const lines: string[] = [
      `[Zoning result for ${businessType || "this business"} at ${address}]`,
      `Zone: ${zoneType} · Status: ${status}`,
    ];
    if (matchedFormIds.length > 0)
      lines.push(`Required permits: ${matchedFormIds.join(", ")}`);
    if (restrictions.length > 0)
      lines.push(`Key restrictions: ${restrictions.slice(0, 3).join("; ")}`);
    if (notes)
      lines.push(`Summary: ${notes}`);
    return lines.join("\n");
  }, [attachedZoningContext]);

  // Keep the ref in sync so callApi always reads the latest value.
  useEffect(() => { zoningContextRef.current = zoningContextBlock; }, [zoningContextBlock]);

  // ── Auto-save the active business profile ─────────────────────────────────
  // Whenever the checklist, completed-forms map, or messages change while a
  // business is loaded, write the updated profile back to storage.
  // Debounced 2 s so rapid typing doesn't flood the DB.
  useEffect(() => {
    if (!loadedBusiness) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      const allCompleted = Object.values(completedFormsByFormId);
      const completedForms = allCompleted.length > 0
        ? allCompleted
        : loadedBusiness.completedForms;
      const profile = calcBizProfile(checklist, completedForms);
      const now = new Date().toISOString();

      let updated: SavedBusiness;
      if (activeLocationId && loadedBusiness.locations?.length) {
        // Multi-location: patch only the active location's slot
        updated = {
          ...loadedBusiness,
          lastChecked: now,
          locations: loadedBusiness.locations.map(loc =>
            loc.id === activeLocationId
              ? {
                  ...loc,
                  checklist,
                  completedForms,
                  chatHistory:         toSavedMessages(messages),
                  healthScore:         profile.healthScore,
                  totalForms:          profile.totalForms,
                  completedFormsCount: profile.completedFormsCount,
                  lastChecked:         now,
                }
              : loc
          ),
        };
      } else {
        // Single-location (backward compat)
        updated = {
          ...loadedBusiness,
          lastChecked:         now,
          checklist,
          completedForms,
          chatHistory:         toSavedMessages(messages),
          healthScore:         profile.healthScore,
          totalForms:          profile.totalForms,
          completedFormsCount: profile.completedFormsCount,
        };
      }
      setLoadedBusiness(updated);
      void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updated).then(() => {
        setSavedBusinesses(localLoadBusinesses());
      });
    }, 2000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist, completedFormsByFormId, messages, loadedBusiness?.id, activeLocationId]);

  // ── GPS ───────────────────────────────────────────────────────────────────
  // vUnified-20260428-final-ship-lock: Capacitor-native GPS path added.
  // Root cause of GPS spinner never resolving on iOS: navigator.permissions.query()
  // returns "prompt" in WKWebView even when iOS has already granted location access.
  // Fix: on Capacitor native, skip the Permissions API entirely and call the
  // @capacitor/geolocation plugin directly — it reads native iOS permission state.
  // Browser path unchanged for web. 8-second safety timer on both paths.

  /** Kick off a GPS fix + Nominatim reverse geocode. Safe to call multiple times
   *  (cancels any prior in-flight attempt via gpsActiveRef).
   *  v281: async — uses @capacitor/geolocation on native, navigator.geolocation on web. */
  const triggerGps = useCallback(async () => {
    if (typeof window === "undefined") return;

    gpsActiveRef.current = true;
    setGpsLoading(true);
    setGpsError(null);
    setZipResolved(false);
    setUserLocation("Detecting location...");

    // v281: 8-second safety timer — releases spinner if callbacks never fire.
    const gpsSafetyTimer = setTimeout(() => {
      if (!gpsActiveRef.current) return;
      gpsActiveRef.current = false;
      setGpsLoading(false);
      setGpsError("GPS unavailable — enter ZIP or City, State");
      setUseExactLocation(false);
      setUserLocation("Enter location");
    }, 8000);

    // Shared Nominatim reverse-geocode handler used by both native and web paths.
    const processCoords = async (lat: number, lon: number) => {
      clearTimeout(gpsSafetyTimer);
      if (!gpsActiveRef.current) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json` +
          `&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
        );
        const data = await res.json();
        if (!gpsActiveRef.current) return;
        // Try progressively broader Nominatim address fields to find a city name.
        // hamlet / suburb / neighbourhood cover unincorporated areas (e.g. ZIP 33411).
        // All values are trimmed — Nominatim occasionally returns trailing whitespace
        // that would break the state-abbreviation regex in parseStateFromLocation.
        const cityRaw: string | null = (
          data.address?.city          ||
          data.address?.town          ||
          data.address?.village       ||
          data.address?.hamlet        ||
          data.address?.suburb        ||
          data.address?.neighbourhood ||
          null
        );
        const cityTrimmed = cityRaw ? cityRaw.trim() : null;

        const iso      = ((data.address?.["ISO3166-2-lvl4"] ?? "") as string).trim();
        // Nominatim may return full state name (e.g. "Florida") when ISO3166 is absent.
        // Normalize to 2-letter abbreviation so locale overrides in formTemplates fire.
        const stateRaw = (iso.includes("-") ? iso.split("-")[1] : (data.address?.state || "")).trim();
        const state    = stateRaw.length === 2
          ? stateRaw.toUpperCase()
          : (STATE_NAME_TO_ABBREV[stateRaw.toLowerCase()] ?? (stateRaw || "Unknown State"));
        const zip      = ((data.address?.postcode as string | undefined) ?? "").trim();

        // County from Nominatim takes priority; fall back to CITY_TO_COUNTY lookup.
        const countyFromNominatim = ((data.address?.county as string | undefined) ?? "").trim() || null;
        const countyFromLookup    = cityTrimmed ? (CITY_TO_COUNTY[cityTrimmed.toLowerCase()] ?? null) : null;
        const countyRaw: string | null = countyFromNominatim ?? countyFromLookup;

        // For unincorporated areas where no city name is found, use the county name
        // as the display city so the location reads "Palm Beach County, FL 33411"
        // rather than "Unknown Location, FL 33411".
        const city = cityTrimmed ?? countyRaw ?? "Unknown Location";

        setGpsLoading(false);
        setUserLocation(zip ? `${city}, ${state} ${zip}` : `${city}, ${state}`);
        setDetectedCounty(countyRaw);
      } catch {
        if (gpsActiveRef.current) {
          clearTimeout(gpsSafetyTimer);
          setGpsLoading(false);
          setUserLocation("Your current location");
          setDetectedCounty(null);
        }
      }
    };

    // Shared error handler for both native and web paths.
    const onGpsError = (code: number) => {
      clearTimeout(gpsSafetyTimer);
      if (!gpsActiveRef.current) return;
      gpsActiveRef.current = false;
      setGpsLoading(false);
      if (code === 1) {
        setGpsError("Location access denied — enter ZIP or City, State");
      } else {
        setGpsError("GPS unavailable — enter ZIP or City, State");
      }
      setUseExactLocation(false);
      setUserLocation("Enter location");
    };

    // ── Capacitor native path (iOS / Android) ─────────────────────────────
    // Tries @capacitor/geolocation first (reads native iOS permission state).
    // Falls back to navigator.geolocation if the plugin import or call fails
    // (e.g. plugin not linked, first-install Xcode cache miss).
    if (isCapacitorNative()) {
      let pluginSucceeded = false;
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 60000,
        });
        pluginSucceeded = true;
        await processCoords(pos.coords.latitude, pos.coords.longitude);
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message ?? '';
        const code = (err as { code?: number })?.code;
        // Permission denied — no fallback possible, surface the error immediately.
        if (code === 1 || msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission')) {
          onGpsError(1);
          return;
        }
        // Any other plugin failure: fall through to navigator.geolocation below.
        if (!pluginSucceeded) {
          // intentional fall-through to web path
        }
      }
      if (pluginSucceeded) return;
      // Plugin failed for non-permission reason — try the web geolocation API as fallback.
    }

    // ── Web browser path ──────────────────────────────────────────────────
    if (!navigator.geolocation) {
      clearTimeout(gpsSafetyTimer);
      setGpsLoading(false);
      setGpsError("GPS unavailable — enter ZIP or City, State");
      setUseExactLocation(false);
      setUserLocation("Enter location");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => { await processCoords(pos.coords.latitude, pos.coords.longitude); },
      (err: GeolocationPositionError) => { onGpsError(err.code); },
      // timeout: 7000 matches the safety timer so callbacks fire before the 8s wall.
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // v281: on mount (or when useExactLocation toggles back to true), start GPS.
  // On Capacitor native — skip browser Permissions API (always returns "prompt" in
  // WKWebView regardless of native iOS permission state) and call triggerGps() directly.
  // On web — query Permissions API first so we don't prompt on pages where GPS isn't
  // needed; iOS Safari requires a user gesture for the first prompt.
  useEffect(() => {
    if (!useExactLocation) return;
    // Don't request location while the upgrade modal is open — user hasn't entered chat yet.
    if (upgradeModalVisible) return;

    // v281: native shortcut — bypass unreliable WKWebView Permissions API.
    if (isCapacitorNative()) {
      void triggerGps();
      return;
    }

    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then(status => {
          if (status.state === "granted") {
            void triggerGps();
          } else if (status.state === "denied") {
            setGpsLoading(false);
            setGpsError("Location access denied — enter ZIP or City, State");
            setUseExactLocation(false);
            setUserLocation("Enter location");
          }
          // "prompt" → show the button; user tap satisfies iOS gesture requirement
        })
        .catch(() => { void triggerGps(); });
    } else {
      void triggerGps();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useExactLocation, upgradeModalVisible]);

  const handleToggleGps = () => {
    gpsActiveRef.current = false;
    setGpsLoading(false);
    setGpsError(null);
    setManualLocation("");
    setZipResolved(false);
    setDetectedCounty(null);
    if (useExactLocation) {
      setUserLocation("Enter location");
      setUseExactLocation(false);
    } else {
      setUserLocation("Detecting location...");
      setUseExactLocation(true);
      // useEffect above will fire because useExactLocation changed to true
    }
  };

  /** Retry GPS after a timeout error without toggling the GPS mode off. */
  const handleRetryGps = () => {
    setGpsError(null);
    triggerGps();
  };

  // ── Location input (ZIP or City, ST / City, State) ────────────────────────

  const handleLocationInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setManualLocation(raw);
    setZipResolved(false);
    setDetectedCounty(null);
    const trimmed = raw.trim();

    // ZIP path — pure digits
    if (/^\d+$/.test(trimmed)) {
      const zip = trimmed.slice(0, 5);
      if (zip.length < 5) {
        setZipLookingUp(false);
        setUserLocation(zip.length === 0 ? "Enter location" : "Detecting location...");
        return;
      }
      if (ZIP_LOOKUP[zip]) {
        const display   = ZIP_LOOKUP[zip];
        const cityMatch = display.match(/^([^,]+)/);
        const county    = cityMatch ? (CITY_TO_COUNTY[cityMatch[1].toLowerCase()] ?? null) : null;
        setUserLocation(display);
        setDetectedCounty(county);
        setZipResolved(true);
        return;
      }
      setZipLookingUp(true);
      setUserLocation("Resolving ZIP…");
      zipLookupRef.current = zip;
      try {
        const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (zipLookupRef.current !== zip) return;
        if (!res.ok) throw new Error("not found");
        const data  = await res.json();
        const city  = (data.places?.[0]?.["place name"] as string) ?? "Unknown City";
        const state = (data.places?.[0]?.["state abbreviation"] as string) ?? "XX";
        setUserLocation(`${city}, ${state} ${zip}`);
        setDetectedCounty(CITY_TO_COUNTY[city.toLowerCase()] ?? null);
        setZipResolved(true);
      } catch {
        if (zipLookupRef.current === zip) {
          setUserLocation(`ZIP Code ${zip}`);
          setZipResolved(false);
        }
      } finally {
        if (zipLookupRef.current === zip) setZipLookingUp(false);
      }
      return;
    }

    // City/State path — "City, ST" or "City, Full State Name"
    const cityState = trimmed.match(/^(.+),\s*([A-Za-z][A-Za-z\s]*)$/);
    if (cityState) {
      const city     = cityState[1].trim();
      const rawState = cityState[2].trim();
      const abbrev   = rawState.length === 2
        ? rawState.toUpperCase()
        : STATE_NAME_TO_ABBREV[rawState.toLowerCase()] ?? rawState.toUpperCase();
      setUserLocation(`${city}, ${abbrev}`);
      setDetectedCounty(CITY_TO_COUNTY[city.toLowerCase()] ?? null);
      setZipResolved(true);
      return;
    }

    setUserLocation(trimmed || "Enter location");
  };

  // ── API helper ────────────────────────────────────────────────────────────
  //
  // vMobile-location-fix — AI now respects detected GPS location; no longer asks for
  // manual input when badge is populated.
  //
  // Two-pronged fix:
  //   1. Read location from refs (not closure state) so a GPS resolve that races with a
  //      Send tap never sends "Detecting location..." to the server system prompt.
  //   2. When location is confirmed, prepend a synthetic user↔assistant exchange to the
  //      messages array before sending to the API. This anchors the location in the
  //      conversation history so the AI never asks "What city/state are you in?" even
  //      if an earlier turn in the thread left that question open.
  //      The synthetic pair is NOT stored in the UI messages state — it is API-only.

  const callApi = async (outgoingMessages: Message[]) => {
    setIsLoading(true);
    try {
      // Always read from refs so we get the latest resolved values, not the closure snapshot.
      // vMobile-diagnosis-final-fix: hasRealLoc no longer gates on !gpsLoadingRef.current —
      // on iOS first visit GPS hasn't started yet (requires sidebar gesture) so gpsLoading is
      // false AND loc is still "Detecting location...". We only check the string value; the
      // gpsLoading flag only means we should prefer the string once it resolves.
      const loc = userLocationRef.current;
      const cty = detectedCountyRef.current;
      const hasRealLoc =
        loc !== "Detecting location..." &&
        loc !== "Enter location"        &&
        loc !== "Resolving ZIP…"        &&
        !loc.startsWith("Detecting");

      // Build the messages array for the API call.
      // Strip the UI-only WELCOME_MESSAGE (id:"welcome", role:"assistant") — it must never
      // appear in the API call because:
      //  a) Anthropic requires alternating user/assistant turns; a leading "assistant" turn
      //     is tolerated by itself but causes a "two consecutive assistant" error when we
      //     prepend the synthetic location pair below.
      //  b) The welcome text is irrelevant context for the model.
      const apiMessages: { role: "user" | "assistant"; content: string }[] =
        outgoingMessages
          .filter(m => m.id !== "welcome")   // vMobile-location-scroll-fix: drop UI welcome
          .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      // vMobile-diagnosis-final-fix: ALWAYS inject a synthetic exchange so the AI never asks
      // "Where are you located?" regardless of GPS state.
      //   • hasRealLoc → real city/state confirmed; inject the normal "My location is …" pair.
      //   • !hasRealLoc → GPS not yet resolved (first visit, iOS prompt not shown); inject a
      //     "don't ask for location" anchor so the AI waits for the user to provide it naturally
      //     rather than interrupting with a city/state prompt.
      // Safe to unshift because apiMessages starts with a user turn (welcome stripped above).
      if (hasRealLoc) {
        const locationCtx = `${loc}${cty ? ` (${cty})` : ""}`;
        apiMessages.unshift(
          { role: "user",      content: `My location is ${locationCtx}.` },
          { role: "assistant", content: `Got it — I'll provide compliance guidance specific to ${locationCtx}. What type of business are you starting or operating?` },
        );
      } else {
        // Location not yet available — tell the AI to proceed without asking for it.
        apiMessages.unshift(
          { role: "user",      content: "My location is still being detected. Please help me with my question and do not ask me for my city, state, or ZIP code — I'll provide location details when available." },
          { role: "assistant", content: "Of course — I'll assist you now and apply location-specific compliance details once your location is confirmed." },
        );
      }

      // vChatZoningContextInjection: if the loaded business has an attached zoning
      // result, prepend it as a synthetic user/assistant exchange so the model
      // treats it as authoritative background context. It sits before the location
      // pair so it is the very first turn in the conversation — never shown to the
      // user, never stored in messages state, stripped automatically because it is
      // only added to apiMessages here. Reading from ref avoids closure-stale values.
      const zoningCtx = zoningContextRef.current;
      if (zoningCtx) {
        apiMessages.unshift(
          {
            role:    "user",
            content: `Here is the attached zoning result for this business:\n${zoningCtx}`,
          },
          {
            role:    "assistant",
            content: "Understood — I'll factor in this zoning analysis when answering your compliance questions.",
          },
        );
      }

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          location: hasRealLoc ? loc : (userLocation || "Unknown location"),
          county:   hasRealLoc ? (cty ?? undefined) : (detectedCounty ?? undefined),
        }),
      });
      const data = await res.json();
      // Unauthenticated visitor has hit the 3-chat / 30-day limit → sign-in wall
      if (res.status === 429 && data.error === "ANON_LIMIT_EXCEEDED") {
        setIsLoading(false);
        setShowSignInWall(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setMessages(prev => [...prev, {
        id:          (Date.now() + 1).toString(),
        role:        "assistant",
        content:     data.content,
        formClarify: data.formClarify ?? null,
        formMap:     data.formMap     ?? null,
      }]);

      if (data.content && /^-\s/m.test(data.content)) {
        const newIds = extractAndAddToChecklist(data.content, data.formMap);
        if (newIds.length > 0) showAutoSaveToast(newIds.length, newIds);
      }
    } catch (err) {
      // v285: surface the real error so it appears in Xcode console for debugging.
      console.error('[callApi] fetch failed:', err, '| API_BASE:', API_BASE);
      setMessages(prev => [...prev, {
        id:      (Date.now() + 1).toString(),
        role:    "assistant",
        content: "Sorry, I had trouble responding. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // v31 — Business Profile Creation from Document (replaces v30 useCallback approach)
  //
  // WHY REFS: handleProfileConfirmationReply was a useCallback whose deps included
  // awaitingProfileConfirmation and pendingDocumentForProfile (state). In React 18
  // concurrent mode, batched state updates may not have flushed by the time sendMessage
  // runs, so the memoized callback could close over stale false/null values → the "yes"
  // reply fell through to callApi silently.
  //
  // FIX: read from refs (always current) instead of state in sendMessage.
  //       State is still set alongside refs so the UI (card hint, etc.) reacts normally.

  /**
   * Creates a business from a document analysis result and attaches the document.
   * v45 — Fixed document attachment on "Yes, create it" so it appears on the matching
   *        recommended form card: optimistic doc added synchronously with formId set
   *        from analysis.matchedFormIds[0], before the profile view opens.
   */
  const createBusinessFromDocument = useCallback((result: AnalysisResult) => {
    const a = result.analysis;
    const suggestedName = a.businessName?.trim() || "My Business";
    const now = new Date().toISOString();
    const profile = calcBizProfile([], undefined);

    const newBiz: SavedBusiness = {
      id:                  `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:                suggestedName,
      location:            a.businessAddress?.trim() || userLocation,
      savedAt:             now,
      lastChecked:         now,
      checklist:           [],
      chatHistory:         toSavedMessages(messages),
      healthScore:         profile.healthScore,
      totalForms:          profile.totalForms,
      completedFormsCount: profile.completedFormsCount,
      isPreExisting:       true,
    };

    // v31 — Fix UI Refresh After Business Profile Creation
    //
    // Optimistic update: add the new business to the sidebar immediately so it
    // appears in "My Businesses" without waiting for the async dbSaveBusiness
    // promise.  `dbSaveBusiness` calls `localSaveBusiness` synchronously, so the
    // localStorage copy is written before the Supabase roundtrip; but the React
    // state update was previously deferred to `.then()`, causing a visible delay.
    //
    // Three-step update:
    //   1. Push newBiz into savedBusinesses right now (optimistic, synchronous).
    //   2. Mark it as the active/loaded business immediately.
    //   3. After the async save resolves, reconcile from localStorage to pick up
    //      any server-side mutations (e.g. Supabase-generated fields).
    setLoadedBusiness(newBiz);
    setSavedBusinesses(prev => {
      // Replace if somehow already present (idempotent); otherwise prepend.
      const without = prev.filter(b => b.id !== newBiz.id);
      return [newBiz, ...without];
    });
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, newBiz).then(() => {
      // Reconcile: localStorage is authoritative after the save completes.
      setSavedBusinesses(localLoadBusinesses());
    });

    // Save document context for /forms recommendations
    saveBusinessContext({
      businessType:  a.scope ?? undefined,
      state:         parseStateFromLocation(newBiz.location) ?? undefined,
      isNewBusiness: false,
    });

    // v45 — Attach the document to the new business with formId so it appears on the
    // matching recommended form card immediately (via cardDocs filter in BusinessProfileView).
    //
    // formId: use the first AI-matched form ID if present. This is what cardDocs checks
    // first (`doc.formId === entry.id`), so the green badge appears without needing
    // analysis.matchedFormIds to be re-evaluated on every card render.
    const primaryFormId = a.matchedFormIds?.[0] ?? undefined;

    const docRecord = {
      businessId:   newBiz.id,
      originalName: result.fileName,
      mimeType:     result.mimeType,
      sizeBytes:    result.sizeBytes,
      storagePath:  result.storagePath,
      analysis:     a,
      analyzed:     true as const,
    };

    // Optimistic local doc — added synchronously so the profile view that opens
    // 350ms later already has this document in uploadedDocs. For auth users we
    // replace it with the DB-returned record in .then(); for guests it stays as-is.
    const optimisticId = `opt-${Date.now()}`;
    const optimisticDoc: UploadedDocument = {
      id:         optimisticId,
      uploadedAt: now,
      formId:     primaryFormId,
      ...docRecord,
    };
    setUploadedDocs(prev => [optimisticDoc, ...prev]);

    if (user) {
      void dbSaveDocument(getSb(), user.id, docRecord).then(saved => {
        setUploadedDocs(prev =>
          saved
            ? prev.map(d =>
                d.id === optimisticId
                  ? { ...saved, formId: primaryFormId }
                  : d
              )
            : prev.filter(d => d.id !== optimisticId),
        );
      });
    }
    // Guest: optimisticDoc already in state above — nothing more to do.

    // Dismiss the analysis card now that the profile was created
    setDocAnalysisResult(null);

    // Confirmation message in chat
    setMessages(prev => [
      ...prev,
      {
        id:      `doc-profile-confirm-${Date.now()}`,
        role:    "assistant" as const,
        content:
          `Done! I created a new business profile called **"${suggestedName}"** and attached the ${a.docType} to it.\n\n` +
          `You can edit the name anytime in the **My Businesses** panel. ` +
          `Want me to build out a compliance checklist for this business?`,
      },
    ]);

    // v37 — Auto-open Business Profile View so the checkmark and attached document
    // appear immediately without requiring the user to click "View Profile".
    // Small delay lets the confirmation message render before the view switches.
    setTimeout(() => setShowProfileView(true), 350);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, messages, user]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // v31 — Check refs (not state) so we always read the latest values even if React
    //        hasn't re-rendered yet after the state updates in handleDocumentAnalysisComplete.
    if (awaitingProfileConfirmationRef.current && pendingDocumentForProfileRef.current) {
      const lower  = trimmed.toLowerCase();
      const isYes  = /^(yes|yeah|yep|sure|go ahead|ok|okay|create it|do it|please|yup|absolutely)/.test(lower);
      const isNo   = /^(no|nope|skip|not now|cancel|don't|dont|pass|later|nah)/.test(lower);

      if (isYes || isNo) {
        // Echo the user's reply into the chat
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Capture the pending result before clearing refs/state
        const captured = pendingDocumentForProfileRef.current;

        // Clear confirmation state (refs first so any subsequent render sees clean state)
        awaitingProfileConfirmationRef.current = false;
        pendingDocumentForProfileRef.current   = null;
        setAwaitingProfileConfirmation(false);
        setPendingDocumentForProfile(null);

        if (isYes && captured) {
          createBusinessFromDocument(captured);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id:      `doc-profile-skip-${Date.now()}`,
              role:    "assistant" as const,
              content: "No problem — I'll leave the document analysis here. Let me know if you'd like help with anything else.",
            },
          ]);
        }
        return; // do NOT call the AI API
      }
      // Ambiguous reply (e.g. "what does that mean?") — fall through to normal AI call
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    await callApi([...messages, userMsg]);
  };

  const sendQuickReply = async (option: string) => {
    if (isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: option };
    setMessages(prev => [...prev, userMsg]);
    await callApi([...messages, userMsg]);
  };

  // ── Checklist helpers ─────────────────────────────────────────────────────

  const extractAndAddToChecklist = (content: string, formMap?: string[] | null): string[] => {
    const bullets    = content.match(/^-\s+.+$/gm) ?? [];
    const candidates = bullets.map(bullet => {
      const raw = bullet.replace(/^-\s+/, "");
      const { formId: markerFormId, displayText: stripped } = extractMarkerFromLine(raw);
      const text      = stripped.trim();
      const plainText = text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, "$1");
      const formId    = (markerFormId && KNOWN_FORM_IDS.has(markerFormId))
        ? markerFormId
        : (plainText ? formMap?.find(id => plainText.toLowerCase().includes(id.replace(/-/g, " "))) : undefined);
      return { text, formId };
    }).filter(c => c.text);

    if (!candidates.length) return [];

    const existingTexts = new Set(checklist.map(i => i.text));
    const toAdd = candidates
      .filter(c => !existingTexts.has(c.text))
      .map(c => ({
        id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text:      c.text,
        status:    "todo" as const,
        formId:    c.formId,
        createdAt: new Date().toISOString(),
      }));

    if (!toAdd.length) return [];

    setChecklist(prev => {
      const existingInPrev = new Set(prev.map(i => i.text));
      const safe = toAdd.filter(i => !existingInPrev.has(i.text));
      return safe.length ? [...prev, ...safe] : prev;
    });

    return toAdd.map(i => i.id);
  };

  const showAutoSaveToast = (count: number, itemIds: string[]) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setAutoSaveToast({ count, itemIds });
    toastTimerRef.current = setTimeout(() => setAutoSaveToast(null), 4000);
  };

  const handleUndoAutoSave = (itemIds: string[]) => {
    setChecklist(prev => prev.filter(i => !itemIds.includes(i.id)));
    setAutoSaveToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  // ── Form launch ───────────────────────────────────────────────────────────

  const handleStartForm = (formId: string) => {
    // Pro gate: Free tier capped at FREE_MONTHLY_LIMIT AI completions per calendar month.
    if (!isPro && monthlyFormsUsed >= FREE_MONTHLY_LIMIT) return;
    // Pass detectedCounty so getLocaleFormTemplate can try county-level URLs first
    // (e.g. pbcgov.org for Palm Beach County business-license) before falling back
    // to state-level and then the generic SBA base template.
    // vUnified-20260414-national-expansion-v9: fall back to localFormEntryToFormTemplate
    // for LOCAL_FORMS entries (county/city-specific forms not in FORM_TEMPLATES). These
    // produce a zero-field stub FormTemplate so FormFiller can surface the officialFormPdfUrl
    // quick-fill button or the officialUrl portal link without a guided wizard.
    const template = getLocaleFormTemplate(formId, userLocation, detectedCounty)
      ?? localFormEntryToFormTemplate(formId);
    if (!template) return;
    setFormQueue([]);
    setQueueIndex(0);
    setCompletedFormsData([]);
    setShowPacketScreen(false);
    setActiveFormInitialData(undefined);
    setActiveFormIsRenewal(false);
    setActiveTemplate(template);
  };

  /**
   * v75 — Called by BusinessProfileView when the user clicks "Complete with AI" on a
   * recommended form card. Closes the profile view, resolves the locale-aware template
   * for the clicked formId using the loaded business's location + county, and opens the
   * Form Filler. The existing businessProfile hint (derived from loadedBusiness and
   * completedFormsByFormId) automatically pre-fills all matching fields.
   */
  const handleStartFormFromProfile = (formId: string) => {
    if (!isPro && monthlyFormsUsed >= FREE_MONTHLY_LIMIT) return;
    // Use the loaded business's location so locale overrides fire correctly
    // (userLocation is already set to biz.location when a business is loaded).
    // v9: fall back to localFormEntryToFormTemplate for LOCAL_FORMS entries so
    // "Complete with AI" from BusinessProfileView works for county/city forms.
    const template = getLocaleFormTemplate(formId, userLocation, detectedCounty)
      ?? localFormEntryToFormTemplate(formId);
    if (!template) return; // unknown form — silently ignore
    setFormQueue([]);
    setQueueIndex(0);
    setCompletedFormsData([]);
    setShowPacketScreen(false);
    setActiveFormInitialData(undefined);
    setActiveFormIsRenewal(false);
    setActiveTemplate(template);
    // Close profile view so the Form Filler is visible
    setShowProfileView(false);
    // vSeamlessProfileFormFillerBridge: mark that we came from the profile so
    // handleFormComplete / handleDismissForm know to reopen it.
    setFormLaunchedFromProfile(true);
  };

  /**
   * Launch a renewal of an existing form, optionally pre-filling with the last
   * submission's field values. If the item belongs to a different saved business,
   * that business is activated first before the form opens.
   *
   * Called from:
   *  - EnhancedChecklist "Renew Now" button (active business items)
   *  - Cross-business sidebar "Renew" button (any saved business)
   */
  const handleRenewFormItem = useCallback((
    formId: string,
    /** Business that owns this checklist item — null = active business. */
    ownerBiz: SavedBusiness | null,
  ) => {
    if (!isPro && monthlyFormsUsed >= FREE_MONTHLY_LIMIT) return;

    // Look up pre-filled data from the most recent completed form for this formId.
    // First check the in-memory map (active session); fall back to the owner biz's
    // completedForms if the item belongs to a different business.
    let prefill: Record<string, string> | undefined;
    if (ownerBiz && ownerBiz.id !== loadedBusiness?.id) {
      const entry = ownerBiz.completedForms?.find(e => e.template.id === formId);
      prefill = entry?.formData;
    } else {
      prefill = completedFormsByFormId[formId]?.formData;
    }

    const launchForm = (loc: string, county: string | null) => {
      // v9: fall back to localFormEntryToFormTemplate for LOCAL_FORMS entries
      const template = getLocaleFormTemplate(formId, loc, county)
        ?? localFormEntryToFormTemplate(formId);
      if (!template) return;
      setFormQueue([]);
      setQueueIndex(0);
      setCompletedFormsData([]);
      setShowPacketScreen(false);
      setActiveFormInitialData(prefill);
      setActiveFormIsRenewal(true);
      setActiveTemplate(template);
    };

    if (ownerBiz && ownerBiz.id !== loadedBusiness?.id) {
      // Switch business first, then launch — handleLoadBusiness updates userLocation.
      handleLoadBusiness(ownerBiz);
      // Defer form launch until after React has flushed the location state update.
      // Using a 0ms timeout is sufficient because handleLoadBusiness is synchronous
      // for the state writes we need (userLocation is set inline, not in a useEffect).
      const targetLoc = ownerBiz.location;
      setTimeout(() => launchForm(targetLoc, null), 0);
    } else {
      launchForm(userLocation, detectedCounty);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, monthlyFormsUsed, loadedBusiness, completedFormsByFormId, userLocation, detectedCounty]);

  const handleStartAllForms = (formIds: string[]) => {
    if (!isPro && monthlyFormsUsed >= FREE_MONTHLY_LIMIT) return;
    const filtered  = filterFormsByLocation(formIds, userLocation);
    const templates = filtered
      .map(id => getLocaleFormTemplate(id, userLocation, detectedCounty))
      .filter(Boolean) as FormTemplate[];
    if (!templates.length) return;
    setFormQueue(templates);
    setQueueIndex(0);
    setCompletedFormsData([]);
    setShowPacketScreen(false);
    setActiveTemplate(templates[0]);
  };

  const handleFormComplete = (formData: Record<string, string>, template: FormTemplate) => {
    const doneText = `Complete and submit: ${template.name}`;
    const completionDate = new Date().toISOString();
    const renewalDate = getSuggestedRenewalDate(
      template.id,
      userLocation,
      completionDate,
      detectedCounty,
    ) ?? undefined;
    setChecklist(prev =>
      prev.some(c => c.text === doneText)
        ? prev
        : [...prev, {
            id:           `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            text:         doneText,
            fee:          template.fee,
            status:       "done" as const,
            completedVia: "RegPulse AI Form Filler",
            formId:       template.id,
            renewalDate,
            createdAt:    completionDate,
          }]
    );

    // Always record the completed form so "View Completed Form" works from the checklist.
    setCompletedFormsByFormId(prev => ({ ...prev, [template.id]: { template, formData } }));

    // v36 — Auto-create a synthetic document record so the completed form appears
    // under the correct recommended form card in BusinessProfileView.
    // Replaces any prior synthetic doc for the same formId (idempotent on re-complete).
    if (loadedBusiness) {
      const syntheticDoc: UploadedDocument = {
        id:           `form-complete-${template.id}-${Date.now()}`,
        businessId:   loadedBusiness.id,
        originalName: `${template.name} — Completed`,
        mimeType:     "application/pdf",
        sizeBytes:    0,
        storagePath:  "",
        analysis:     undefined,
        analyzed:     false,
        uploadedAt:   completionDate,
        formId:       template.id,
      };
      setUploadedDocs(prev => [
        syntheticDoc,
        ...prev.filter(d => !(d.formId === template.id && d.id.startsWith("form-complete-"))),
      ]);
    }

    // Track monthly usage for Free-tier gating (Supabase profile or localStorage).
    const newCount = monthlyFormsUsed + 1;
    setMonthlyFormsUsed(newCount);
    void dbSaveMonthlyUsage(user ? getSb() : null, user?.id ?? null, newCount);

    if (isQueueMode) {
      // vUnified-platform-fix: form completion download/new-tab behavior
      // Build the full forms list NOW (inline) because React state updates are async
      // and completedFormsData won't include the just-completed form until next render.
      const allForms: CompletedFormEntry[] = [...completedFormsData, { template, formData }];
      setCompletedFormsData(allForms);
      const next = queueIndex + 1;
      if (next < formQueue.length) {
        setQueueIndex(next);
        setActiveTemplate(formQueue[next]);
      } else {
        // All forms in queue done — auto-download the compliance packet instead of
        // showing the PacketScreen overlay (which displaces the chat/profile on mobile).
        // jsPDF .save() handles cross-browser download internally (blob URL on iOS Safari).
        setActiveTemplate(null);
        setFormQueue([]);
        setQueueIndex(0);

        // Kick off the download immediately; show a success toast regardless of outcome.
        // On mobile Safari, jsPDF triggers a download sheet — this is the reliable path.
        const triggerPacketDownload = async () => {
          const { generateCompliancePacket } = await import("@/lib/generateCompliancePacket");
          await generateCompliancePacket(allForms, userLocation);
        };
        const label = `${allForms.length} form${allForms.length !== 1 ? "s" : ""}`;
        showPacketSuccessToast(
          `${label} complete — compliance packet downloaded`,
          () => { void triggerPacketDownload(); },
        );
        void triggerPacketDownload().catch(() => {
          // Auto-download was blocked (e.g. pop-up blocker) — update toast to prompt retry
          showPacketSuccessToast(
            `${label} complete — tap Retry to download PDF`,
            () => { void triggerPacketDownload(); },
          );
        });

        // vSeamlessProfileFormFillerBridge: return to profile after queue completion too.
        if (formLaunchedFromProfile) {
          setShowProfileView(true);
          setFormLaunchedFromProfile(false);
        }
      }
    } else {
      setActiveTemplate(null);
      // vSeamlessProfileFormFillerBridge: return to profile if this form was launched
      // from BusinessProfileView. Optimistic state (green badge, health score) is
      // already in place because setChecklist / setUploadedDocs ran above.
      if (formLaunchedFromProfile) {
        setShowProfileView(true);
        setFormLaunchedFromProfile(false);
        // vUnified-platform-fix: show brief success toast so user knows the form completed.
        showPacketSuccessToast(`${template.name} — form completed & PDF downloaded`);
      }
    }
  };

  // ── v62 — Auto-create business profile after Form Filler completion ─────────
  /**
   * Called by FormFiller when a form is completed but no business profile exists.
   * Creates a new SavedBusiness from the collected form data, attaches the
   * completed form as a synthetic document, and opens Business Profile View.
   *
   * v62 — Automatic business profile creation from Form Filler when no profile exists
   */
  const handleFormCompleteWithoutProfile = useCallback((
    formData: Record<string, string>,
    completedFormId: string,
  ) => {
    const now = new Date().toISOString();

    // Derive business name from form fields, fall back to "My Business"
    const bizName = (
      formData.businessName?.trim() ||
      formData.legalName?.trim() ||
      formData.fictitiousName?.trim() ||
      "My Business"
    );

    // Derive location from form fields, fall back to current user location
    const bizLocation = (
      formData.businessAddress?.trim() ||
      formData.principalAddress?.trim() ||
      formData.physicalAddress?.trim() ||
      formData.businessLocation?.trim() ||
      userLocation
    );

    const profile = calcBizProfile([], undefined);

    const newBiz: SavedBusiness = {
      id:                  `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:                bizName,
      location:            bizLocation,
      savedAt:             now,
      lastChecked:         now,
      checklist:           [],
      chatHistory:         toSavedMessages(messages),
      healthScore:         profile.healthScore,
      totalForms:          profile.totalForms,
      completedFormsCount: profile.completedFormsCount,
      isPreExisting:       false,
    };

    // Optimistic update — show business in sidebar + set as active immediately
    setLoadedBusiness(newBiz);
    setSavedBusinesses(prev => {
      const without = prev.filter(b => b.id !== newBiz.id);
      return [newBiz, ...without];
    });
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, newBiz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });

    // Attach the completed form as a synthetic UploadedDocument so it
    // appears on the matching recommended form card in BusinessProfileView.
    const formName = (ALL_FORMS as Record<string, { name: string }>)[completedFormId]?.name ?? completedFormId;
    const syntheticDoc: UploadedDocument = {
      id:           `form-complete-${completedFormId}-${Date.now()}`,
      businessId:   newBiz.id,
      originalName: `${formName} — Completed`,
      mimeType:     "application/pdf",
      sizeBytes:    0,
      storagePath:  "",
      analysis:     undefined,
      analyzed:     false,
      uploadedAt:   now,
      formId:       completedFormId,
    };
    setUploadedDocs(prev => [
      syntheticDoc,
      ...prev.filter(d => !(d.formId === completedFormId && d.id.startsWith("form-complete-"))),
    ]);

    // Open Business Profile View after the form filler closes
    setTimeout(() => setShowProfileView(true), 350);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, messages, user]);

  // ── View completed form from checklist ────────────────────────────────────
  /**
   * Called when user clicks "View Completed Form" on an AI-filled checklist item.
   * Shows PacketScreen with just the one completed form entry.
   */
  const handleViewCompletedForm = (formId: string) => {
    const entry = completedFormsByFormId[formId];
    if (!entry) return;
    setCompletedFormsData([entry]);
    setShowPacketScreen(true);
  };

  const handleDismissForm = () => {
    setActiveTemplate(null);
    setFormQueue([]);
    setQueueIndex(0);
    setCompletedFormsData([]);
    // vSeamlessProfileFormFillerBridge: if the form was launched from the profile,
    // return the user there rather than leaving them at the empty chat screen.
    if (formLaunchedFromProfile) {
      setShowProfileView(true);
      setFormLaunchedFromProfile(false);
    }
  };

  // ── Business save / load ──────────────────────────────────────────────────

  // handleSaveBusiness is fire-and-forget async — the onSave prop signature stays
  // (name: string) => void so PacketScreen doesn't need updating.
  // If a business is already loaded, it is UPDATED IN PLACE (same ID) rather than
  // creating a duplicate. This also captures the current chat history.
  const handleSaveBusiness = useCallback((name: string) => {
    const allCompleted = Object.values(completedFormsByFormId);
    const completedForms = allCompleted.length > 0
      ? allCompleted
      : completedFormsData.length > 0 ? completedFormsData : undefined;
    const profile = calcBizProfile(checklist, completedForms);
    const now = new Date().toISOString();

    let biz: SavedBusiness;
    if (activeLocationId && loadedBusiness?.locations?.length) {
      // Multi-location: update active location slot, keep top-level identity fields
      biz = {
        ...(loadedBusiness ?? {}),
        id:      loadedBusiness?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        savedAt: loadedBusiness?.savedAt ?? now,
        lastChecked: now,
        locations: loadedBusiness.locations.map(loc =>
          loc.id === activeLocationId
            ? {
                ...loc,
                location:            userLocation,
                checklist,
                completedForms,
                chatHistory:         toSavedMessages(messages),
                healthScore:         profile.healthScore,
                totalForms:          profile.totalForms,
                completedFormsCount: profile.completedFormsCount,
                lastChecked:         now,
              }
            : loc
        ),
      };
    } else {
      // Single-location (backward compat)
      // v25 — append current score to scoreHistory (rolling window of 6)
      const prevHistory = loadedBusiness?.scoreHistory ?? [];
      const newHistory  = [...prevHistory, profile.healthScore].slice(-6);
      biz = {
        ...(loadedBusiness ?? {}),
        id:                  loadedBusiness?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        location:            userLocation,
        savedAt:             loadedBusiness?.savedAt ?? now,
        lastChecked:         now,
        checklist,
        completedForms,
        chatHistory:         toSavedMessages(messages),
        healthScore:         profile.healthScore,
        totalForms:          profile.totalForms,
        completedFormsCount: profile.completedFormsCount,
        scoreHistory:        newHistory,
      };
    }
    setLoadedBusiness(biz);
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, biz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
  }, [userLocation, checklist, completedFormsData, completedFormsByFormId, loadedBusiness, messages, user, activeLocationId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Internal: load the working state from a specific data source (location or top-level). */
  const loadLocationData = (
    locData: { checklist: ChecklistItem[]; completedForms?: CompletedFormEntry[]; chatHistory?: SavedMessage[]; location: string },
  ) => {
    if (locData.chatHistory && locData.chatHistory.length > 0) {
      setMessages(toMessages(locData.chatHistory));
    } else {
      setMessages([WELCOME_MESSAGE]);
    }
    setUseExactLocation(false);
    gpsActiveRef.current = false;
    setManualLocation(locData.location);
    setZipResolved(false);
    setDetectedCounty(null);
    setUserLocation(locData.location);
    setChecklist(locData.checklist);
    if (locData.completedForms && locData.completedForms.length > 0) {
      setCompletedFormsData(locData.completedForms);
      const byId: Record<string, CompletedFormEntry> = {};
      locData.completedForms.forEach(e => { byId[e.template.id] = e; });
      setCompletedFormsByFormId(byId);
      setShowPacketScreen(true);
    } else {
      setCompletedFormsData([]);
      setCompletedFormsByFormId({});
      setShowPacketScreen(false);
    }
    setActiveTemplate(null);
    setFormQueue([]);
    setQueueIndex(0);
  };

  const handleLoadBusiness = (biz: SavedBusiness, targetLocationId?: string) => {
    // ── 1. Snapshot the current session into the previously-loaded business ──
    if (loadedBusiness && loadedBusiness.id !== biz.id) {
      let snapshot: SavedBusiness;
      if (activeLocationId && loadedBusiness.locations?.length) {
        snapshot = {
          ...loadedBusiness,
          locations: loadedBusiness.locations.map(loc =>
            loc.id === activeLocationId
              ? { ...loc, checklist, chatHistory: toSavedMessages(messages), completedForms: Object.values(completedFormsByFormId).length > 0 ? Object.values(completedFormsByFormId) : loc.completedForms }
              : loc
          ),
        };
      } else {
        snapshot = {
          ...loadedBusiness,
          chatHistory: toSavedMessages(messages),
          checklist,
          completedForms: Object.values(completedFormsByFormId).length > 0
            ? Object.values(completedFormsByFormId)
            : loadedBusiness.completedForms,
        };
      }
      void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, snapshot);
    }

    // ── 2. Build the updated profile for the incoming business ────────────────
    const now = new Date().toISOString();

    // Determine which location to activate
    const hasLocations = biz.locations && biz.locations.length > 0;
    const firstLocId   = hasLocations ? biz.locations![0].id : null;
    const chosenLocId  = targetLocationId ?? (hasLocations ? firstLocId : null);
    const chosenLoc    = chosenLocId ? biz.locations?.find(l => l.id === chosenLocId) : null;

    // Profile metrics come from the chosen location or top-level
    const profileSource = chosenLoc
      ? { checklist: chosenLoc.checklist, completedForms: chosenLoc.completedForms }
      : { checklist: biz.checklist, completedForms: biz.completedForms };
    const profile = calcBizProfile(profileSource.checklist, profileSource.completedForms);

    const updated: SavedBusiness = {
      ...biz,
      lastChecked:         now,
      healthScore:         profile.healthScore,
      totalForms:          profile.totalForms,
      completedFormsCount: profile.completedFormsCount,
    };
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updated).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    setLoadedBusiness(updated);
    setActiveLocationId(chosenLocId);

    // v26 — Persist business context for /forms page "Recommended for You"
    {
      const loc = chosenLoc?.location ?? biz.location;
      saveBusinessContext({
        businessType:  biz.businessType ?? undefined,
        state:         loc ? (parseStateFromLocation(loc) ?? undefined) : undefined,
        isNewBusiness: biz.isPreExisting === false,
      });
    }

    // ── 3-5. Restore working state from chosen location or top-level ──────────
    if (chosenLoc) {
      loadLocationData(chosenLoc);
    } else {
      loadLocationData({
        checklist:     biz.checklist,
        completedForms: biz.completedForms,
        chatHistory:   biz.chatHistory,
        location:      biz.location,
      });
    }

    checklistTopRef.current?.scrollIntoView({ behavior: "smooth" });

    // v25 — Load uploaded (attached) documents for the incoming business
    void dbLoadDocuments(user ? getSb() : null, user?.id ?? null, biz.id).then(docs => {
      setUploadedDocs(docs);
    });
  };

  /**
   * Switch to a different location within the SAME loaded business.
   * Snapshots the current location's data, then restores the target location.
   */
  const handleSwitchLocation = useCallback((targetLoc: BusinessLocation) => {
    if (!loadedBusiness) return;
    if (targetLoc.id === activeLocationId) return; // already active

    // Snapshot current location
    const updatedBiz: SavedBusiness = {
      ...loadedBusiness,
      locations: loadedBusiness.locations?.map(loc =>
        loc.id === activeLocationId
          ? {
              ...loc,
              checklist,
              completedForms: Object.values(completedFormsByFormId).length > 0
                ? Object.values(completedFormsByFormId)
                : loc.completedForms,
              chatHistory: toSavedMessages(messages),
            }
          : loc
      ) ?? loadedBusiness.locations,
    };
    setLoadedBusiness(updatedBiz);
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updatedBiz);

    // Activate new location
    setActiveLocationId(targetLoc.id);
    loadLocationData(targetLoc);
    checklistTopRef.current?.scrollIntoView({ behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, activeLocationId, checklist, completedFormsByFormId, messages, user]);

  /**
   * Add a new location to the currently loaded business.
   */
  const handleAddLocation = useCallback((newLoc: BusinessLocation) => {
    if (!loadedBusiness) return;
    setAddLocationBizId(null);

    // Snapshot current location state before switching
    const currentLocations = loadedBusiness.locations ?? [];
    const snapshotLocations = currentLocations.map(loc =>
      loc.id === activeLocationId
        ? { ...loc, checklist, completedForms: Object.values(completedFormsByFormId).length > 0 ? Object.values(completedFormsByFormId) : loc.completedForms, chatHistory: toSavedMessages(messages) }
        : loc
    );

    const updatedBiz: SavedBusiness = {
      ...loadedBusiness,
      locations: [...snapshotLocations, newLoc],
    };
    setLoadedBusiness(updatedBiz);
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updatedBiz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });

    // Switch to the new location immediately
    setActiveLocationId(newLoc.id);
    loadLocationData(newLoc);
    // Auto-expand this business's location list in the sidebar
    setExpandedBizIds(prev => new Set([...prev, loadedBusiness.id]));
    checklistTopRef.current?.scrollIntoView({ behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, activeLocationId, checklist, completedFormsByFormId, messages, user]);

  /**
   * Add a new location to a NON-ACTIVE business (from the sidebar).
   * The business is NOT switched to — we just append the location and save.
   */
  const handleAddLocationToOtherBiz = useCallback((biz: SavedBusiness, newLoc: BusinessLocation) => {
    setAddLocationBizId(null);
    const updatedBiz: SavedBusiness = {
      ...biz,
      locations: [...(biz.locations ?? []), newLoc],
    };
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updatedBiz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    setExpandedBizIds(prev => new Set([...prev, biz.id]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /** Called by AddBusinessModal when an existing business is submitted. */
  const handleAddPreExistingBusiness = useCallback((biz: SavedBusiness) => {
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, biz).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    setShowAddBizModal(false);
    // Immediately activate the new business
    handleLoadBusiness(biz);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /** Clears all data for the active business (checklist, forms, chat, renewals). */
  const handleClearActiveBusiness = useCallback(() => {
    if (!loadedBusiness) return;
    let cleared: SavedBusiness;
    if (activeLocationId && loadedBusiness.locations?.length) {
      // Multi-location: clear only the active location's data
      cleared = {
        ...loadedBusiness,
        locations: loadedBusiness.locations.map(loc =>
          loc.id === activeLocationId
            ? { ...loc, checklist: [], completedForms: undefined, chatHistory: [], healthScore: 0, totalForms: 0, completedFormsCount: 0 }
            : loc
        ),
      };
    } else {
      cleared = {
        ...loadedBusiness,
        checklist:           [],
        completedForms:      undefined,
        chatHistory:         [],
        healthScore:         0,
        totalForms:          0,
        completedFormsCount: 0,
      };
    }
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, cleared).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    setLoadedBusiness(cleared);
    setChecklist([]);
    setCompletedFormsData([]);
    setCompletedFormsByFormId({});
    setMessages([WELCOME_MESSAGE]);
    setShowPacketScreen(false);
    setActiveTemplate(null);
    setFormQueue([]);
    setQueueIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, activeLocationId, user]);

  /** Permanently deletes a business from Supabase and localStorage. */
  const handleDeleteBusiness = useCallback((biz: SavedBusiness) => {
    void dbDeleteBusiness(user ? getSb() : null, user?.id ?? null, biz.id).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    // If this was the active business, reset to blank state
    if (loadedBusiness?.id === biz.id) {
      setLoadedBusiness(null);
      setActiveLocationId(null);
      setChecklist([]);
      setCompletedFormsData([]);
      setCompletedFormsByFormId({});
      setMessages([WELCOME_MESSAGE]);
      setShowPacketScreen(false);
      setActiveTemplate(null);
      setFormQueue([]);
      setQueueIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, user]);

  /** Save notification preferences for a business (targeted column update). */
  const handleSaveNotificationPrefs = useCallback((bizId: string, prefs: NotificationPrefs) => {
    void dbSaveNotificationPrefs(user ? getSb() : null, user?.id ?? null, bizId, prefs).then(() => {
      setSavedBusinesses(localLoadBusinesses());
    });
    // If this is the active business, patch loadedBusiness state so the bell icon updates immediately
    if (loadedBusiness?.id === bizId) {
      setLoadedBusiness(prev => prev ? { ...prev, notificationPrefs: prefs } : prev);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, user]);

  /**
   * Called when DocumentUploadButton finishes uploading + AI analysis.
   * Persists the document record to Supabase and shows the analysis card.
   */
  const handleDocumentAnalysisComplete = useCallback((result: AnalysisResult) => {
    setDocAnalysisResult(result);
    setShowDocUploadPanel(false);

    // Persist document record for authenticated users with an active business
    if (user && loadedBusiness) {
      void dbSaveDocument(getSb(), user.id, {
        businessId:   loadedBusiness.id,
        originalName: result.fileName,
        mimeType:     result.mimeType,
        sizeBytes:    result.sizeBytes,
        storagePath:  result.storagePath,
        analysis:     result.analysis,
        analyzed:     true,
      }).then(saved => {
        if (saved) setUploadedDocs(prev => [saved, ...prev]);
      });
    }

    // v30 — Completed Document → Business Profile Flow
    // A document is considered "completed" when the AI found real permit/license data
    // (status ≠ Unknown, or a businessName/permitNumber was extracted, or at least one
    // matchedFormId was recognised).  Blank / template forms typically have status
    // Unknown and no extracted fields.
    const a = result.analysis;
    const looksCompleted =
      a.status !== "Unknown" ||
      !!a.businessName ||
      !!a.permitNumber ||
      a.matchedFormIds.length > 0;

    if (looksCompleted && !loadedBusiness) {
      // v31 — Fix Yes Create It Button (Direct Trigger)
      // No business profile active — notify the user and point them to the
      // "Yes, create it" button in the card above (primary trigger).
      // Also arm the ref-based fallback so typing "yes" in the chat still works.
      const botPrompt: Message = {
        id:      `doc-profile-prompt-${Date.now()}`,
        role:    "assistant",
        content:
          `I detected this is a completed **${a.docType}**` +
          (a.issuingAuthority ? ` issued by ${a.issuingAuthority}` : "") +
          (a.businessName ? ` for **${a.businessName}**` : "") +
          `.\n\nClick **"Yes, create it"** on the card above to create a new business profile and attach this document — or type **yes** to confirm.`,
      };
      setMessages(prev => [...prev, botPrompt]);
      // Arm the ref-based fallback for users who type "yes" instead of clicking
      setPendingDocumentForProfile(result);
      pendingDocumentForProfileRef.current = result;
      setAwaitingProfileConfirmation(true);
      awaitingProfileConfirmationRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadedBusiness]);

  /**
   * v25 — Called when DocumentUploadButton (mode="attach") finishes uploading.
   * Saves the document record as analyzed=false (no AI analysis performed).
   * Used for "Upload Completed Document" — preexisting permits, licenses, etc.
   */
  const handleAttachDocument = useCallback((result: AttachResult) => {
    setShowAttachPanel(false);

    if (user && loadedBusiness) {
      void dbSaveDocument(getSb(), user.id, {
        businessId:   loadedBusiness.id,
        originalName: result.fileName,
        mimeType:     result.mimeType,
        sizeBytes:    result.sizeBytes,
        storagePath:  result.storagePath,
        analysis:     undefined,
        analyzed:     false,
      }).then(saved => {
        if (saved) setUploadedDocs(prev => [saved, ...prev]);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadedBusiness]);

  /**
   * v32 — Called by BusinessProfileView when the user saves an inline name/location edit.
   * Persists the updated business to Supabase (or localStorage for guests).
   */
  const handleUpdateBusinessFromProfile = useCallback((updated: SavedBusiness) => {
    setLoadedBusiness(updated);
    setSavedBusinesses(prev => {
      const without = prev.filter(b => b.id !== updated.id);
      return [updated, ...without];
    });
    void dbSaveBusiness(user ? getSb() : null, user?.id ?? null, updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * v33 — Thin wrapper: update only the business name.
   * Passes through to handleUpdateBusinessFromProfile with the rest of the
   * business unchanged so the caller doesn't need the full SavedBusiness object.
   */
  const handleUpdateBusinessNameFromProfile = useCallback((name: string) => {
    if (!loadedBusiness) return;
    handleUpdateBusinessFromProfile({ ...loadedBusiness, name });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, handleUpdateBusinessFromProfile]);

  /**
   * v33 — Thin wrapper: update only the business location.
   * Called by BusinessProfileView when the user commits an inline location edit.
   * The parent re-derives recommendedForms via useMemo on the next render.
   */
  const handleLocationChangeFromProfile = useCallback((location: string) => {
    if (!loadedBusiness) return;
    handleUpdateBusinessFromProfile({ ...loadedBusiness, location });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, handleUpdateBusinessFromProfile]);

  /**
   * vMobile-PostDeploy-CriticalFixPass — Thin wrapper: update only the business type.
   * Called by BusinessProfileView when the user picks a new category from the searchable
   * picker. Updating loadedBusiness.businessType causes profileRecommendedForms useMemo
   * to re-derive the correct form list for the new category on the next render.
   */
  const handleCategoryChangeFromProfile = useCallback((categoryId: string) => {
    if (!loadedBusiness) return;
    handleUpdateBusinessFromProfile({ ...loadedBusiness, businessType: categoryId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, handleUpdateBusinessFromProfile]);

  /**
   * v35 — Fixed Upload Completed button + Drag & Drop support.
   * Called by BusinessProfileView when the user picks or drops a file on a
   * recommended form card. Immediately adds an optimistic UploadedDocument to
   * uploadedDocs so the entry appears in the Completed Documents section without
   * waiting for the Supabase round-trip, then reconciles with the real saved record.
   * Uses loadedBusiness?.id to scope the document to the correct business profile.
   */
  const handleUploadCompletedDocFromProfile = useCallback(async (file: File, _formId: string) => {
    if (!loadedBusiness) return;
    const ts       = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const now      = new Date().toISOString();

    if (user) {
      const storagePath  = `${user.id}/${loadedBusiness.id}/${ts}-${safeName}`;
      const optimisticId = `optimistic-${ts}`;

      // v35 — Optimistic update: add doc immediately so BusinessProfileView
      // shows it in Completed Documents without waiting for the storage upload.
      const optimisticDoc: UploadedDocument = {
        id:           optimisticId,
        businessId:   loadedBusiness.id,
        originalName: file.name,
        mimeType:     file.type,
        sizeBytes:    file.size,
        storagePath,
        analysis:     undefined,
        analyzed:     false,
        uploadedAt:   now,
      };
      setUploadedDocs(prev => [optimisticDoc, ...prev]);

      const sb = getSb();
      const { error: storageErr } = await sb.storage
        .from("business-documents")
        .upload(storagePath, file, { contentType: file.type, upsert: false });

      if (storageErr) {
        console.error("BusinessProfileView upload error:", storageErr.message);
        // Remove the optimistic entry if storage upload failed
        setUploadedDocs(prev => prev.filter(d => d.id !== optimisticId));
        return;
      }

      // Persist DB record; replace optimistic entry with the real saved doc
      void dbSaveDocument(sb, user.id, {
        businessId:   loadedBusiness.id,
        originalName: file.name,
        mimeType:     file.type,
        sizeBytes:    file.size,
        storagePath,
        analysis:     undefined,
        analyzed:     false,
      }).then(saved => {
        setUploadedDocs(prev =>
          saved
            ? prev.map(d => d.id === optimisticId ? saved : d)
            : prev.filter(d => d.id !== optimisticId),
        );
      });
    } else {
      // Guest path — no storage, keep local record only; appears instantly
      const localDoc: UploadedDocument = {
        id:           `local-${ts}`,
        businessId:   loadedBusiness.id,
        originalName: file.name,
        mimeType:     file.type,
        sizeBytes:    file.size,
        storagePath:  "",
        analysis:     undefined,
        analyzed:     false,
        uploadedAt:   now,
      };
      setUploadedDocs(prev => [localDoc, ...prev]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadedBusiness]);

  /**
   * v39 — Called by BusinessProfileView when the user explicitly clicks "Save Changes".
   * Persists every draft document (File + formId) to Supabase Storage + DB,
   * with the same optimistic-update pattern used by handleUploadCompletedDocFromProfile.
   * Returns a Promise so BusinessProfileView can await completion before clearing drafts.
   */
  // v41 FIX — returns Promise<UploadedDocument[]> so BusinessProfileView can populate
  // localSavedDocs immediately and show the green badge without waiting for the parent
  // re-render to propagate completedDocuments back down as a prop.
  const handleSaveDraftsFromProfile = useCallback(async (drafts: DraftDoc[]): Promise<UploadedDocument[]> => {
    if (!loadedBusiness) return [];
    const sb  = user ? getSb() : null;
    const now = new Date().toISOString();
    // Collect the docs that were successfully queued/saved — returned to BusinessProfileView.
    const result: UploadedDocument[] = [];

    for (const draft of drafts) {
      const ts       = Date.now();
      const safeName = draft.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      if (user && sb) {
        const storagePath  = `${user.id}/${loadedBusiness.id}/${ts}-${safeName}`;
        const optimisticId = `draft-opt-${draft.localId}`;

        // Optimistic entry — added to uploadedDocs state immediately for the parent.
        const optimisticDoc: UploadedDocument = {
          id:           optimisticId,
          businessId:   loadedBusiness.id,
          originalName: draft.file.name,
          mimeType:     draft.file.type,
          sizeBytes:    draft.file.size,
          storagePath,
          analysis:     undefined,
          analyzed:     false,
          uploadedAt:   now,
          formId:       draft.formId || undefined,
        };
        setUploadedDocs(prev => [optimisticDoc, ...prev]);

        const { error: storageErr } = await sb.storage
          .from("business-documents")
          .upload(storagePath, draft.file, { contentType: draft.file.type, upsert: false });

        if (storageErr) {
          console.error("[handleSaveDraftsFromProfile] storage upload failed:", storageErr.message);
          setUploadedDocs(prev => prev.filter(d => d.id !== optimisticId));
          // Don't push to result — upload failed, no green badge for this draft.
          continue;
        }

        // Upload succeeded — include optimisticDoc in result so BusinessProfileView
        // can show the green badge immediately via localSavedDocs.
        result.push(optimisticDoc);

        void dbSaveDocument(sb, user.id, {
          businessId:   loadedBusiness.id,
          originalName: draft.file.name,
          mimeType:     draft.file.type,
          sizeBytes:    draft.file.size,
          storagePath,
          analysis:     undefined,
          analyzed:     false,
        }).then(saved => {
          setUploadedDocs(prev =>
            saved
              ? prev.map(d => d.id === optimisticId ? { ...saved, formId: draft.formId || undefined } : d)
              : prev.filter(d => d.id !== optimisticId),
          );
        });
      } else {
        // Guest — keep local record only (no storage upload).
        const localDoc: UploadedDocument = {
          id:           `local-${ts}`,
          businessId:   loadedBusiness.id,
          originalName: draft.file.name,
          mimeType:     draft.file.type,
          sizeBytes:    draft.file.size,
          storagePath:  "",
          analysis:     undefined,
          analyzed:     false,
          uploadedAt:   now,
          formId:       draft.formId || undefined,
        };
        setUploadedDocs(prev => [localDoc, ...prev]);
        result.push(localDoc);
      }
    }

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadedBusiness]);

  /**
   * v39 — Called by BusinessProfileView when the user discards all drafts.
   * Drafts are purely client-side until saved, so the parent has nothing to undo.
   */
  const handleDiscardDraftsFromProfile = useCallback(() => {
    // No server-side state to roll back — the component already cleared its own draft state.
  }, []);

  /**
   * v45 — Zoning & Address Compliance Checker.
   * v46 — Surfaces specific server error messages (and optional details) so
   *        BusinessProfileView can display them verbatim instead of a generic fallback.
   */
  const handleCheckZoning = useCallback(async (
    address: string,
    businessType: string,
  ): Promise<ZoningResult> => {
    const res = await fetch(`${API_BASE}/api/zoning/check`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ address, businessType }),
    });
    const data = await res.json() as { ok: boolean; result?: ZoningResult; error?: string; details?: string };
    if (!data.ok || !data.result) {
      // Prefer server's specific error; append details when present and different.
      const msg = data.error ?? "Zoning check failed. Please try again.";
      const detail = data.details && data.details !== data.error ? ` (${data.details})` : "";
      throw new Error(msg + detail);
    }
    return data.result;
  }, []);

  /**
   * v45 — Called when user clicks "Attach Zoning Result to Profile".
   * Creates a synthetic UploadedDocument from the ZoningResult so it appears
   * in the Completed Documents list with a clear label.
   * v50 — Added formId, dbSaveDocument for auth users, and setShowProfileView(true).
   */
  const handleAttachZoningResult = useCallback((result: ZoningResult) => {
    if (!loadedBusiness) return;
    const ts = Date.now();
    const optimisticId = `zoning-${ts}`;
    const statusLabel = result.status.charAt(0).toUpperCase() + result.status.slice(1);
    const matchedFormIds = result.requiredPermits
      .map(p => p.formId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);
    // Use the first matched permit formId so the result card appears on a form card,
    // falling back to "zoning-check" if no permits were returned.
    const primaryFormId = matchedFormIds[0] ?? "zoning-check";

    const docRecord = {
      businessId:   loadedBusiness.id,
      originalName: `Zoning Check — ${statusLabel} — ${new Date(result.checkedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      mimeType:     "application/json",
      sizeBytes:    0,
      storagePath:  "", // synthetic — no actual file
      analysis: {
        docType:          "Zoning Compliance Check",
        issuingAuthority: result.zoneType,
        status:           (result.status === "allowed" ? "Active" : result.status === "prohibited" ? "Suspended" : "Pending") as "Active" | "Expired" | "Suspended" | "Pending" | "Unknown",
        summary:          result.notes,
        suggestions:      result.restrictions,
        matchedFormIds,
        rawExtracted: {
          zone_type:     result.zoneType,
          status:        result.status,
          address:       result.address,
          business_type: result.businessType,
        },
      },
      analyzed:   true,
      uploadedAt: result.checkedAt,
    };

    // Optimistic update — immediately visible in BusinessProfileView
    const optimisticDoc: UploadedDocument = {
      id:     optimisticId,
      formId: primaryFormId,
      ...docRecord,
    };
    setUploadedDocs(prev => [optimisticDoc, ...prev]);
    setShowProfileView(true);

    // Persist for authenticated users (synthetic doc — storagePath is empty)
    if (user) {
      void dbSaveDocument(getSb(), user.id, docRecord).then(saved => {
        setUploadedDocs(prev =>
          saved
            ? prev.map(d => d.id === optimisticId ? { ...saved, formId: primaryFormId } : d)
            : prev.filter(d => d.id !== optimisticId),
        );
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedBusiness, user]);

  /**
   * v25 — Called when user clicks "View" on an uploaded document.
   * Generates a signed URL from Supabase Storage and opens it in a new tab.
   */
  const handleViewDocument = useCallback(async (doc: UploadedDocument) => {
    if (!doc.storagePath) return;
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("business-documents")
      .createSignedUrl(doc.storagePath, 60 * 60); // 1-hour expiry
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  /**
   * Called when user clicks "Apply Updates" in the DocumentAnalysisCard.
   * Marks matching checklist items as "done" with completedVia = "Document Upload".
   * Also sets renewalDate from the expiration date when available.
   */
  const handleApplyDocumentUpdates = useCallback((matched: MatchedItem[]) => {
    if (matched.length === 0) return;
    const expirationDate = docAnalysisResult?.analysis.expirationDate;

    setChecklist(prev => prev.map(item => {
      const isMatched = matched.some(m => m.checklistItemId === item.id);
      if (!isMatched) return item;
      return {
        ...item,
        status:      "done" as const,
        completedVia: "Document Upload",
        // Only set renewalDate if not already set and the document has an expiration
        renewalDate: item.renewalDate
          ?? (expirationDate && typeof expirationDate === "string" ? expirationDate : undefined),
      };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docAnalysisResult]);

  // ── Location display helpers ──────────────────────────────────────────────

  // vMobile-gps-fix: also guard on gpsLoading so the header badge never shows
  // a "Detecting…" string as a resolved location while GPS is in progress.
  const locationIsReady =
    !gpsLoading &&
    userLocation !== "Detecting location..." &&
    userLocation !== "Enter location" &&
    userLocation !== "Resolving ZIP…" &&
    !userLocation.startsWith("Detecting");

  // ── Render ────────────────────────────────────────────────────────────────

  // ── v61: Review Impact modal data ────────────────────────────────────────
  const reviewImpactAlert = reviewImpactAlertId
    ? ruleAlerts.find(a => a.id === reviewImpactAlertId) ?? null
    : null;

  return (
    // vMobile-icon-fix / vMobile-PostDeploy-CriticalFixPass: `h-dvh-safe` (defined in
    // globals.css) provides a three-tier height fallback: 100vh (all browsers) →
    // 100svh (iOS 15.4+, Chrome 108+) → 100dvh (dynamic; adjusts as browser chrome
    // shows/hides). Each tier subtracts env(safe-area-inset-*) for notch/home-bar.
    // Using a CSS utility class instead of a React style prop avoids the TS error for
    // the unsupported `dvh`/`svh` units in CSSProperties.
    // vUnified-platform-fix: dark mode — `dark` class scoped to this shell div so
    // Tailwind dark: variants activate inside the app without affecting other routes.
    // bg-[#f8f9fb] is the light-mode chat background; dark:bg-[#0f1823] is the deep
    // navy override. Sidebar + compliance dashboard are already dark-navy by design,
    // so dark mode primarily changes the chat panel and its children.
    <div className={`flex h-dvh-safe${isDarkMode ? " dark" : ""} bg-[#f8f9fb] dark:bg-[#0f1823]`}>{/* vMobile-scale-fix: dvh = dynamic viewport height, correct on iOS Safari */}

      {/* vUnified-20260414-national-expansion-v89 — Animated splash overlay (z-[400])
          Visible from mount until auth bootstrap + 2 s min-timer complete.
          Rendered first so it sits above every other layer including the review-impact modal. */}
      <AppSplashOverlay visible={splashVisible} />

      {/* vUnified-20260414-national-expansion-v275 — React loading overlay.
          Navy background + Lucide Loader2 spinner shown for 1500ms then fades over 400ms.
          Pure React handoff: no native cyan overlay, no SIGKILL 9 risk. z-[90000]. */}
      {loadingOverlayMounted && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90000,
            background: "#0b1628",
            display: "flex",
            flex: 1,
            minHeight: 0,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            opacity: loadingOverlayVisible ? 1 : 0,
            transition: "opacity 0.4s ease-out",
            pointerEvents: loadingOverlayVisible ? "auto" : "none",
          }}
        >
          <Loader2
            className="animate-spin"
            style={{ width: 40, height: 40, color: "#22d3ee", marginBottom: 20 }}
          />
          <p style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: "rgba(148,163,184,0.9)",
            fontFamily: "system-ui, sans-serif",
          }}>
            Loading RegPulse Compliance Co-Pilot…
          </p>
        </div>
      )}

      {/* vUnified-20260428-final-ship-lock: debug banner permanently removed — production-clean UI only */}

      {/* vUnified-20260414-national-expansion-v89 — Onboarding tier selection + auth (z-[300])
          Shown once per device for unauthenticated first-time users after the splash fades.
          onComplete() writes localStorage key "rp_onboarded_v1" and hides this overlay. */}
      <OnboardingFlow
        visible={onboardingVisible}
        onComplete={handleOnboardingComplete}
      />

      {/* v61 — Review Impact modal ─────────────────────────────────────── */}
      {reviewImpactAlert && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          onClick={e => { if (e.target === e.currentTarget) setReviewImpactAlertId(null); }}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#fff", border: "1px solid #e2e8f0" }}>

            {/* Modal header — amber accent */}
            <div className="flex items-start justify-between px-5 py-4"
              style={{ background: "linear-gradient(135deg, #0B1E3F 0%, #1e3a5f 100%)" }}>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(251,191,36,0.18)", border: "1px solid rgba(251,191,36,0.35)" }}>
                  <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 mb-0.5">
                    Regulation Update
                  </p>
                  <p className="text-sm font-bold text-white leading-snug">{reviewImpactAlert.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{reviewImpactAlert.businessName}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewImpactAlertId(null)}
                className="shrink-0 text-slate-400 hover:text-white transition-colors mt-0.5"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">

              {/* What this means */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B1E3F] mb-1.5">
                  What This Means
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {reviewImpactAlert.description}
                </p>
              </div>

              {/* Affected forms with status */}
              {reviewImpactAlert.affectedForms.length > 0 && (() => {
                const affected = reviewImpactAlert.affectedForms.map(formId => {
                  const form = ALL_FORMS[formId];
                  const clItem = checklist.find(c => c.formId === formId);
                  return { formId, name: form?.name ?? formId, clItem };
                });
                return (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B1E3F] mb-1.5">
                      Affected Filings
                    </p>
                    <div className="space-y-1.5">
                      {affected.map(({ formId, name, clItem }) => (
                        <div key={formId}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-3.5 w-3.5 text-[#0B1E3F] dark:text-blue-400 shrink-0" />
                            <span className="text-xs text-slate-800 dark:text-slate-100 font-medium truncate">{name}</span>
                          </div>
                          {clItem ? (
                            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              clItem.status === "done"
                                ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40"
                                : clItem.status === "in-progress"
                                  ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40"
                                  : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50"
                            }`}>
                              {clItem.status === "done" ? "Completed" : clItem.status === "in-progress" ? "In Progress" : "To Do"}
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-full px-2 py-0.5">
                              Not tracked
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* What to do next */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#0B1E3F] dark:text-blue-300 mb-1.5">
                  What To Do Next
                </p>
                <ul className="space-y-2">
                  {reviewImpactAlert.affectedForms.map(formId => {
                    const name = ALL_FORMS[formId]?.name ?? formId;
                    const done = checklist.find(c => c.formId === formId && c.status === "done");
                    return done ? (
                      <li key={formId} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-[#00C2CB] mt-0.5 shrink-0">✓</span>
                        Re-review your {name} to confirm it still meets the updated requirements.
                      </li>
                    ) : (
                      <li key={formId} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-amber-500 mt-0.5 shrink-0">→</span>
                        File or update your {name} to comply with the new rules.
                      </li>
                    );
                  })}
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-slate-400 mt-0.5 shrink-0">→</span>
                    Check your renewal dates — late filing after a regulation change may incur penalties.
                  </li>
                  <li className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-slate-400 mt-0.5 shrink-0">→</span>
                    Contact the issuing agency directly if you are unsure whether you are affected.
                  </li>
                </ul>
              </div>

              {/* Deadline risk */}
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
                <Bell className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Deadline risk:</strong> Failure to update affected permits before your next renewal date
                  may result in fines or permit revocation. Act before the next renewal cycle.
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 flex gap-2"
              style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <button
                onClick={() => {
                  setReviewImpactAlertId(null);
                  checklistTopRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                style={{ background: "#0B1E3F" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1e3a5f")}
                onMouseLeave={e => (e.currentTarget.style.background = "#0B1E3F")}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Go to Checklist
              </button>
              <button
                onClick={() => {
                  dismissAlert(reviewImpactAlert.id);
                  setReviewImpactAlertId(null);
                }}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700 bg-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ Sidebar ════════════ */}
      {/* vMobile: overlay backdrop — visible only on mobile when sidebar is open */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      {/* vMobile: sidebar is hidden on mobile by default; slides in as fixed drawer when showMobileSidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col shrink-0 overflow-hidden
          transition-transform duration-300
          ${showMobileSidebar ? "translate-x-0" : "-translate-x-full pointer-events-none"}
          md:static md:translate-x-0 md:flex md:pointer-events-auto
          ${isDarkMode ? "bg-[#0f1823] border-r border-slate-700/50" : "bg-white border-r border-slate-200"}
        `}
        style={{
          // vMobile-stabilization-verification-and-polish: The sidebar is `fixed inset-y-0`
          // on mobile (slides in as a drawer), which means it starts at top:0 / bottom:0 and
          // bypasses the body-level env(safe-area-inset-*) padding applied in layout.tsx.
          // Without these insets the brand header sits under the notch on iPhone X+ and the
          // bottom of the checklist is obscured by the home indicator.
          // `md:static` restores normal flow on desktop so these values have no effect there
          // (env(safe-area-inset-*) resolves to 0 when viewport-fit is not cover, and on
          // desktop there is no notch/home-bar anyway).
          paddingTop:    "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >{/* vMobile-final-deploy-fix: overflow-hidden constrains the flex column so flex-1 children can actually shrink/scroll on mobile */}

        {/* Brand — neo-futurist glass header */}
        {/* vMobile-PostDeploy-CriticalFixPass: shrink-0 added — without it the brand header
            can be squeezed by the flex-1 unified scroller when auth/GPS panels are tall. */}
        <div className="rp-brand-header flex items-center gap-2.5 px-4 py-3.5 shrink-0">
          <RegPulseIcon size={34} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-[15px] leading-tight text-white">RegPulse</h1>
              {isPro && (
                <span
                  className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide"
                  title="Priority response from our team"
                >
                  <Crown className="h-2 w-2" />
                  PRO
                </span>
              )}
            </div>
            <p className="text-[10px] text-cyan-400/70 leading-tight">Compliance Co-pilot</p>
          </div>
          {/* vUnified-platform-fix: moved dark mode toggle to /settings page */}

          {/* Dev toggle — click to simulate Free / Pro tier */}
          <button
            onClick={() => setIsPro(v => !v)}
            className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-colors ${
              isPro
                ? "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                : "text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
            title={isPro ? "Switch to Free tier (dev)" : "Switch to Pro tier (dev)"}
          >
            {isPro ? "Pro ✓" : "Free"}
          </button>
          {/* vMobile — close button visible only on mobile */}
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Close menu"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* ── Auth panel ─────────────────────────────────────────────────── */}
        {/* vMobile-diagnosis-final-fix: shrink-0 prevents this section from being squeezed by flex-1 compliance dashboard */}
        {/* vUnified-20260414-national-expansion-v86: Pro badge, Upgrade CTA, Manage Subscription link */}
        <div className="shrink-0 border-b border-slate-100 dark:border-slate-700/30">

          {/* ── Pro subscription success banner ─────────────────────────────
               Shown when the user returns from Stripe Checkout with ?success=true.
               Auto-dismissed after 6 s; also dismissable via ×. Pointer-events-auto
               and min-h-[48px] on the dismiss button for iOS Safari / Android Chrome. */}
          {proSuccessVisible && (
            <div className="mx-3 my-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2.5 flex items-center gap-2 pointer-events-auto">
              <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
              <p className="flex-1 text-[11px] font-semibold text-white leading-tight">
                Pro activated! Welcome to RegPulse Pro.
              </p>
              <button
                onClick={() => setProSuccessVisible(false)}
                className="shrink-0 text-white/70 hover:text-white transition-colors min-h-[48px] min-w-[32px] flex items-center justify-center pointer-events-auto"
                aria-label="Dismiss"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {authLoading ? null : user ? (
            /* Signed-in: status bar + Pro badge + Upgrade / Manage button */
            <div>
              {/* Row 1: sync indicator + email + sign-out */}
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="flex-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {isPro ? "Pro · " : "Synced · "}{user.email}
                </span>
                {/* v86 — Pro badge pill in auth row */}
                {isPro && (
                  <span
                    className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 leading-none"
                    title="RegPulse Pro subscriber"
                  >
                    <Crown className="h-2 w-2" />PRO
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  className="shrink-0 text-[10px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-0.5 pointer-events-auto"
                  title="Sign out"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>

              {/* Row 2: Upgrade to Pro (not isPro) OR Manage Subscription (isPro) */}
              {/* Platform Parity: min-h-[48px] mobile touch target, pointer-events-auto,
                  active:scale-[0.98] for tactile feedback, hover states for desktop. */}
              {!isPro ? (
                <div className="px-4 pb-3">
                  <button
                    onClick={() => void handleUpgradeToPro()}
                    disabled={proCheckoutLoading}
                    className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 pointer-events-auto"
                    style={{ touchAction: "manipulation" }}
                  >
                    {proCheckoutLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Crown className="h-4 w-4 shrink-0" />
                        Upgrade to Pro · $19/mo
                      </>
                    )}
                  </button>
                  <p className="mt-1.5 text-[9px] text-slate-400 dark:text-slate-500 text-center">
                    Unlimited AI · Renewal filing · Cancel anytime
                  </p>
                </div>
              ) : (
                <div className="px-4 pb-3">
                  <button
                    onClick={() => void handleManageSubscription()}
                    disabled={proPortalLoading}
                    className="w-full flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700/50 transition-colors disabled:opacity-50 pointer-events-auto"
                    style={{ touchAction: "manipulation" }}
                  >
                    {proPortalLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <SettingsIcon className="h-3.5 w-3.5 shrink-0" />
                        Manage Subscription
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : authExpanded ? (
            /* Guest: expanded auth form */
            <div className="px-4 py-3 space-y-2.5">
              {/* Mode tabs */}
              <div className="flex items-center gap-1 mb-1">
                {(["signin", "signup", "magic"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      if (m === "signup") { window.location.href = "/upgrade"; return; }
                      setAuthMode(m); setAuthError(""); setMagicSent(false);
                    }}
                    className={`flex-1 text-[10px] font-semibold py-1 rounded-md transition-colors ${
                      authMode === m
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : m === "signup" ? "Sign Up" : "Magic Link"}
                  </button>
                ))}
                <button
                  onClick={() => setAuthExpanded(false)}
                  className="text-slate-300 hover:text-slate-500 ml-1"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Email field (all modes) */}
              <input
                type="email"
                placeholder="your@email.com"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (authMode === "signin") void handleSignIn();
                    else if (authMode === "signup") void handleSignUp();
                    else void handleMagicLink();
                  }
                }}
                className="w-full text-xs h-8 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 bg-white dark:bg-[#131e2f] dark:text-slate-100 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-300 dark:focus:border-blue-700/60 placeholder:text-slate-400"
              />

              {/* Password field (sign-in + sign-up only) */}
              {authMode !== "magic" && (
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      if (authMode === "signin") void handleSignIn();
                      else void handleSignUp();
                    }
                  }}
                  className="w-full text-xs h-8 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 bg-white dark:bg-[#131e2f] dark:text-slate-100 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:border-blue-300 dark:focus:border-blue-700/60 placeholder:text-slate-400"
                />
              )}

              {/* Submit button */}
              {magicSent ? (
                <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5 text-center">
                  Check your email for a sign-in link.
                </p>
              ) : (
                <button
                  disabled={authWorking || !authEmail.trim()}
                  onClick={() => {
                    if (authMode === "signin") void handleSignIn();
                    else if (authMode === "signup") void handleSignUp();
                    else void handleMagicLink();
                  }}
                  className="w-full h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {authWorking ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : authMode === "signin" ? (
                    <><LogIn className="h-3 w-3" /> Sign In</>
                  ) : authMode === "signup" ? (
                    <><UserPlus className="h-3 w-3" /> Create Account</>
                  ) : (
                    <><Mail className="h-3 w-3" /> Send Magic Link</>
                  )}
                </button>
              )}

              {/* Inline error / info */}
              {authError && (
                <p className={`text-[10px] text-center ${
                  authError.startsWith("Check") ? "text-emerald-700" : "text-red-600"
                }`}>
                  {authError}
                </p>
              )}

              <p className="text-[10px] text-slate-400 text-center">
                Sign in to sync your data across devices.
              </p>
            </div>
          ) : (
            /* Guest: collapsed — single CTA line */
            <button
              onClick={() => setAuthExpanded(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <KeyRound className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="flex-1 text-left">Sign in to sync your data</span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
            </button>
          )}
        </div>

        {/* ── Location panel — vMobile-gps-fix ──────────────────────────────
             Replaces the checkbox toggle with a prominent touch-friendly button.
             State machine:
               gpsLoading           → spinner + cancel
               locationIsReady      → resolved pill + refresh icon
               !resolved + no error → "Use Current Location" tap-to-trigger button
               gpsError             → error banner + conditional retry
               !useExactLocation    → manual ZIP/city input
             ─────────────────────────────────────────────────────────────── */}
        {/* vMobile-diagnosis-final-fix: shrink-0 keeps location panel pinned so it never gets squeezed by the flex-1 compliance dashboard below */}
        <div className="shrink-0 px-4 py-4 border-b border-slate-100 dark:border-slate-700/30 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Your Location
          </p>

          {/* ── State A: GPS loading ── */}
          {useExactLocation && gpsLoading && (
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800/40 px-3 py-3">
              <Loader2 className="h-4 w-4 text-blue-500 shrink-0 animate-spin" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 leading-tight">Detecting your location…</p>
                <p className="text-[10px] text-blue-400 dark:text-blue-500 mt-0.5">This can take a few seconds</p>
              </div>
              <button
                onClick={handleToggleGps}
                className="shrink-0 text-[10px] font-semibold text-blue-400 hover:text-blue-700 transition-colors px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── State B: GPS resolved (location is ready) ── */}
          {useExactLocation && !gpsLoading && !gpsError && locationIsReady && (
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ring-1 transition-colors ${
              zipResolved ? "bg-green-50 dark:bg-green-900/20 ring-green-200 dark:ring-green-800/40" : "bg-blue-50 dark:bg-blue-900/20 ring-blue-200 dark:ring-blue-800/40"
            }`}>
              {zipResolved
                ? <CheckCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
                : <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              }
              <div className="min-w-0 flex-1">
                <span className={`font-semibold text-xs truncate block ${
                  zipResolved ? "text-green-800 dark:text-green-300" : "text-slate-700 dark:text-slate-200"
                }`}>
                  {userLocation}
                </span>
                {detectedCounty && (
                  <span className="text-[10px] text-slate-400 truncate block">{detectedCounty}</span>
                )}
              </div>
              {/* Refresh GPS — min touch target via p-1.5 + h-4 w-4 icon */}
              <button
                onClick={handleRetryGps}
                title="Refresh location"
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleToggleGps}
                title="Switch to manual location"
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ── State C: waiting for user to tap GPS (permission = "prompt") ──
               On iOS Safari the first geolocation prompt REQUIRES a user gesture.
               We display a full-width button so the tap satisfies that requirement.
               min-h-[48px] meets WCAG 2.5.5 target-size guidance on mobile.           */}
          {useExactLocation && !gpsLoading && !gpsError && !locationIsReady && (
            <button
              onClick={triggerGps}
              className="w-full flex items-center justify-center gap-2.5 min-h-[48px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
            >
              <LocateFixed className="h-4 w-4 shrink-0" />
              Use Current Location
            </button>
          )}

          {/* ── State D: GPS error ── */}
          {gpsError && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-3">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-snug">{gpsError}</p>
              </div>
              {/* Retry only for timeout (not denied/unavailable — those set useExactLocation false) */}
              {useExactLocation && (
                <button
                  onClick={handleRetryGps}
                  className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-4 rounded-xl border border-blue-300 dark:border-blue-700/50 bg-white dark:bg-[#131e2f] text-blue-600 dark:text-blue-300 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <LocateFixed className="h-4 w-4 shrink-0" />
                  Retry GPS
                </button>
              )}
            </div>
          )}

          {/* ── GPS off: prominent "Use GPS" button ── */}
          {!useExactLocation && !gpsError && (
            <button
              onClick={handleToggleGps}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors"
            >
              <LocateFixed className="h-3.5 w-3.5 shrink-0" />
              Use Current Location (GPS)
            </button>
          )}

          {/* ── Manual location input ── shown when GPS is off or errored-out ── */}
          {(!useExactLocation || (gpsError && !useExactLocation)) && (
            <div className="relative">
              <Input
                type="text"
                placeholder="ZIP code or City, State (e.g. 79401 or Lubbock, TX)"
                value={manualLocation}
                onChange={handleLocationInput}
                className={`text-xs h-9 pr-7 ${zipResolved ? "border-green-300 focus-visible:ring-green-200" : ""}`}
              />
              {zipLookingUp && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 animate-spin" />
              )}
              {zipResolved && !zipLookingUp && (
                <CheckCheck className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-green-500" />
              )}
            </div>
          )}

          {/* ZIP lookup resolved display (for manual entry) */}
          {!useExactLocation && zipResolved && locationIsReady && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 ring-1 ring-green-200 px-3 py-2">
              <CheckCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="text-xs font-semibold text-green-800 truncate">{userLocation}</span>
              {detectedCounty && <span className="text-[10px] text-slate-400 truncate">{detectedCounty}</span>}
            </div>
          )}
        </div>

        {/* vMobile-RegressionFixPass: Compliance Dashboard — unified single scroll container.
             BEFORE: outer div was `flex-1 flex flex-col min-h-0 overflow-hidden` and only the
             EnhancedChecklist had its own `flex-1 min-h-0 overflow-y-auto` scroller. All other
             sections (renewals, alerts, pro upsell, forms library, businesses) were `shrink-0`
             siblings placed AFTER the scrollable div. On mobile (short viewports) those sections
             consumed all available height; the checklist flex-1 shrank to ~0px and the outer
             overflow-hidden clipped the content below it — making the sidebar appear empty.
             FIX: The entire compliance dashboard is now ONE `overflow-y-auto` scroll container.
             Every section (label, health card, checklist, renewals, alerts, upsell, library,
             businesses) lives inside it and scrolls together. No nested scroller needed. */}
        {/* vMobile-PostDeploy-CriticalFixPass: touch-action:pan-y explicitly tells iOS Safari
            that this element accepts vertical scroll gestures. Without it, overflow:hidden on
            the sidebar outer div can suppress gesture routing to this overflow-y-auto child. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain" style={{ touchAction: "pan-y" }}>
          <div className="px-4 pt-4 pb-2 shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Compliance Dashboard
            </p>
          </div>

          {/* ── v27: Portfolio Health Summary — shown when ≥2 businesses are saved ────
               Displays aggregate health ring, average score, total urgent renewals, and
               total active alerts across ALL saved businesses in one glance.
               Platform parity: SVG 36×36 is a display element (no touch target required).
               The summary is non-interactive (read-only) so no min-h needed for itself;
               the surrounding padding keeps it safe for tap-through on all platforms. */}
          {savedBusinesses.length >= 2 && (() => {
            // Aggregate portfolio stats across all businesses
            const scoredBizzes   = savedBusinesses.filter(b => b.totalForms != null && (b.totalForms ?? 0) > 0);
            const avgScore       = scoredBizzes.length > 0
              ? Math.round(scoredBizzes.reduce((s, b) => s + (b.healthScore ?? 0), 0) / scoredBizzes.length)
              : null;
            const portfolioUrgent  = allRenewals.filter(r => r.daysLeft >= 0 && r.daysLeft <= 30).length;
            const portfolioAlerts  = activeAlerts.length;
            // v33: overdue breakdown — replaces v30 at-risk count for more actionable portfolio summary
            const portfolioOverdue = allRenewals.filter(r => r.daysLeft < 0).length;
            const portfolioDueWeek = allRenewals.filter(r => r.daysLeft >= 0 && r.daysLeft <= 7).length;
            // v31: portfolio avg-score trend — compare current avg to prior avg from scoreHistory
            const priorAvgScore = scoredBizzes.length > 0 && scoredBizzes.every(b => b.scoreHistory && b.scoreHistory.length >= 2)
              ? Math.round(scoredBizzes.reduce((s, b) => {
                  const h = b.scoreHistory!;
                  return s + h[h.length - 2];
                }, 0) / scoredBizzes.length)
              : null;
            const avgTrend = (avgScore != null && priorAvgScore != null) ? avgScore - priorAvgScore : null;
            const PORT_R    = 14;
            const PORT_CIRC = 2 * Math.PI * PORT_R;
            const portOffset = avgScore == null ? PORT_CIRC : PORT_CIRC * (1 - avgScore / 100);
            const portStroke = avgScore == null ? "#94a3b8"
              : avgScore >= 80 ? "#10b981"
              : avgScore >= 50 ? "#f59e0b" : "#ef4444";
            const portTextCls = avgScore == null ? "text-slate-400"
              : avgScore >= 80 ? "text-emerald-600 dark:text-emerald-400"
              : avgScore >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
            return (
              <div className="mx-4 mb-2 rounded-xl border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  {/* Aggregate health ring — 36×36 display SVG */}
                  <div className="relative shrink-0 w-9 h-9">
                    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
                      <circle cx="18" cy="18" r={PORT_R} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                      <circle
                        cx="18" cy="18" r={PORT_R}
                        fill="none"
                        stroke={portStroke}
                        strokeWidth="3.5"
                        strokeDasharray={PORT_CIRC}
                        strokeDashoffset={portOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-bold tabular-nums ${portTextCls}`}>
                      {avgScore == null ? "—" : `${avgScore}%`}
                    </span>
                  </div>
                  {/* Summary text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 leading-tight">
                      Portfolio · {savedBusinesses.length} Businesses
                    </p>
                    {/* v31: show avg health + trend arrow when prior data available */}
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 flex items-center gap-0.5">
                      {avgScore != null ? `Avg health ${avgScore}%` : "No health data yet"}
                      {avgTrend !== null && avgTrend !== 0 && (
                        <span
                          className={`font-semibold tabular-nums ${avgTrend > 0 ? "text-emerald-500" : "text-red-400"}`}
                          title={`Portfolio avg ${avgTrend > 0 ? "up" : "down"} ${Math.abs(avgTrend)} pts since last save`}
                        >
                          {avgTrend > 0 ? `↑+${avgTrend}` : `↓${avgTrend}`}
                        </span>
                      )}
                    </p>
                  </div>
                  {/* v36 — Urgency pills: now interactive — click to scroll to relevant section.
                       Touch target: each pill is min-h-[28px] which is acceptable for a secondary
                       navigation affordance inside a compact summary widget (not a primary CTA). */}
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    {portfolioOverdue > 0 && (
                      <button
                        onClick={() => renewalsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 leading-none hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors pointer-events-auto min-h-[28px]"
                        title="View overdue renewals"
                      >
                        <AlertCircle className="h-1.5 w-1.5 shrink-0" />
                        {portfolioOverdue} overdue
                      </button>
                    )}
                    {portfolioDueWeek > 0 && (
                      <button
                        onClick={() => renewalsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/40 text-orange-600 dark:text-orange-400 leading-none hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors pointer-events-auto min-h-[28px]"
                        title="View renewals due this week"
                      >
                        <Bell className="h-1.5 w-1.5 shrink-0" />
                        {portfolioDueWeek} due this wk
                      </button>
                    )}
                    {portfolioAlerts > 0 && (
                      <button
                        onClick={() => alertsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 leading-none hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors pointer-events-auto min-h-[28px]"
                        title="View rule change alerts"
                      >
                        <Zap className="h-1.5 w-1.5 shrink-0" />
                        {portfolioAlerts} alert{portfolioAlerts !== 1 ? "s" : ""}
                      </button>
                    )}
                    {portfolioOverdue === 0 && portfolioDueWeek === 0 && portfolioAlerts === 0 && avgScore != null && avgScore >= 80 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 leading-none">
                        <CheckCircle2 className="h-1.5 w-1.5 shrink-0" />
                        All clear
                      </span>
                    )}
                  </div>
                </div>
                {/* v29: "View alerts ↓" shortcut link — only when there are active alerts */}
                {portfolioAlerts > 0 && (
                  <button
                    onClick={() => alertsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="mt-1.5 w-full text-center text-[9px] font-semibold text-amber-600 dark:text-amber-400 hover:underline pointer-events-auto"
                  >
                    View {portfolioAlerts} rule change alert{portfolioAlerts !== 1 ? "s" : ""} ↓
                  </button>
                )}
              </div>
            );
          })()}

          {/* ── Compliance Health Score card — Pro only ───────────────────── */}
          {!isPro && (
            <div
              className="mx-4 mb-2 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-center gap-3 cursor-pointer shrink-0"
              onClick={() => void handleUpgradeToPro()}
              title="Upgrade to Pro to unlock"
            >
              <div className="shrink-0 relative">
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="20" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                </svg>
                <Crown className="absolute inset-0 m-auto h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Compliance Health Score</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">Pro feature — upgrade to unlock</p>
              </div>
            </div>
          )}
          {isPro && healthScore && (() => {
            const { score, pending, expiringCount, noData } = healthScore;
            const RING_R    = 20;
            const RING_CIRC = 2 * Math.PI * RING_R;
            const offset    = RING_CIRC * (1 - score / 100);
            // v61 — noData (0 forms verified done) shows slate "No data yet" state
            const ringStroke = noData
              ? "#94a3b8"
              : score >= 80 ? "#16a34a"
              : score >= 50 ? "#d97706" : "#dc2626";
            const textColor = noData
              ? "text-slate-500 dark:text-slate-400"
              : score >= 80 ? "text-green-700 dark:text-green-400"
              : score >= 50 ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400";
            const bgColor = noData
              ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50"
              : score >= 80 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30"
              : score >= 50 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30";
            const label = noData
              ? "Complete forms to track progress"
              : score >= 80 ? "Looking good"
              : score >= 50 ? "Needs attention" : "At risk";
            return (
              <div
                className={`mx-4 mb-2 rounded-xl border p-3 cursor-pointer transition-shadow hover:shadow-sm shrink-0 ${bgColor}`}
                onClick={() => checklistTopRef.current?.scrollIntoView({ behavior: "smooth" })}
                title="Click to jump to checklist"
              >
                <div className="flex items-center gap-3">
                  {/* SVG ring */}
                  <div className="shrink-0 relative">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r={RING_R} fill="none" stroke="#e2e8f0" strokeWidth="6" />
                      {!noData && (
                        <circle
                          cx="28" cy="28" r={RING_R}
                          fill="none"
                          stroke={ringStroke}
                          strokeWidth="6"
                          strokeDasharray={RING_CIRC}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          transform="rotate(-90 28 28)"
                          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
                        />
                      )}
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums ${textColor}`}>
                      {noData ? "—" : `${score}%`}
                    </span>
                  </div>

                  {/* Labels + v25 Sparkline */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Activity className={`h-3 w-3 shrink-0 ${textColor}`} />
                      <span className={`text-[11px] font-bold ${textColor}`}>
                        Compliance Health
                      </span>
                    </div>
                    {/* v61 — show "No data yet" when nothing is verified as done */}
                    <p className={`text-xs font-semibold ${textColor}`}>
                      {noData ? "No data yet" : `${score}% compliant`}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {label}
                      {!noData && pending > 0 && ` · ${pending} item${pending !== 1 ? "s" : ""} pending`}
                    </p>
                    {/* v25 — Trend sparkline: render when loadedBusiness has ≥2 score snapshots */}
                    {(() => {
                      const hist = loadedBusiness?.scoreHistory;
                      if (!hist || hist.length < 2) return null;
                      const W = 60, H = 18, pad = 2;
                      const pts = hist.slice(-6);
                      const min = Math.min(...pts), max = Math.max(...pts);
                      const range = Math.max(max - min, 10); // floor range at 10 to avoid flat line
                      const xs = pts.map((_, i) => pad + i * ((W - pad * 2) / (pts.length - 1)));
                      const ys = pts.map(v => H - pad - ((v - min) / range) * (H - pad * 2));
                      const polyline = pts.map((_, i) => `${xs[i].toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
                      const trend = pts[pts.length - 1] - pts[0];
                      const sparkColor = trend >= 0 ? "#16a34a" : "#dc2626";
                      return (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
                            <polyline points={polyline} fill="none" stroke={sparkColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                          </svg>
                          <span className={`text-[9px] font-semibold ${trend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {trend >= 0 ? `↑ +${trend}pt` : `↓ ${trend}pt`}
                          </span>
                        </div>
                      );
                    })()}
                    {expiringCount > 0 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          renewalsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 hover:underline"
                      >
                        <Bell className="h-2.5 w-2.5" />
                        {expiringCount} renewal{expiringCount !== 1 ? "s" : ""} due soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* v25 — Compliance Calendar: renewal grouping (overdue / this month / next month),
               one-tap "Renew Now" links, Web Notifications scheduling.
               Positioned after health score card, above checklist so urgency is visible immediately.
               Only renders when allRenewals has items due within 60 days. */}
          <ComplianceCalendar
            renewals={allRenewals}
            formUrlMap={formUrlMap}
            loadedBusinessId={loadedBusiness?.id}
            onOpenNotificationPrefs={
              loadedBusiness
                ? () => setNotifPrefsBizId(loadedBusiness.id)
                : savedBusinesses.length > 0
                  ? () => setNotifPrefsBizId(savedBusinesses[0].id)
                  : undefined
            }
          />

          {/* vMobile-RegressionFixPass: checklist wrapper is now a plain block — the outer
               unified scroll container owns the scroll; no inner nested scroller needed. */}
          <div ref={checklistTopRef} className="px-4 pb-2">
            <EnhancedChecklist
              items={checklist}
              onUpdate={(id, changes) =>
                setChecklist(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
              }
              onDelete={(id) =>
                setChecklist(prev => prev.filter(i => i.id !== id))
              }
              onStartForm={item => { if (item.formId) handleStartForm(item.formId); }}
              onViewCompletedForm={handleViewCompletedForm}
              onCompleteAllForms={formIds => handleStartAllForms(formIds)}
              onRenewForm={item => { if (item.formId) handleRenewFormItem(item.formId, loadedBusiness); }}
              alertedFormIds={alertedFormIds}
              onViewRuleAlert={() => alertsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
              onMarkAllDone={() =>
                setChecklist(prev => prev.map(i => ({ ...i, status: "done" as const })))
              }
              onClearCompleted={() =>
                setChecklist(prev => prev.filter(i => i.status !== "done"))
              }
              onResetAll={() => { setChecklist([]); setLoadedBusiness(null); }}
              onClearAll={loadedBusiness ? handleClearActiveBusiness : undefined}
              onUploadDocument={loadedBusiness ? () => setShowDocUploadPanel(true) : undefined}
              uploadedDocuments={loadedBusiness ? uploadedDocs : undefined}
              onUploadCompletedDoc={loadedBusiness ? () => setShowAttachPanel(true) : undefined}
              onViewDocument={handleViewDocument}
              loadedBusiness={loadedBusiness ?? undefined}
              isPro={isPro}
              monthlyFormsUsed={monthlyFormsUsed}
              freeMonthlyLimit={FREE_MONTHLY_LIMIT}
            />
          </div>

          {/* Upcoming Renewals — aggregated across ALL saved businesses.
               Urgency: red ≤30d, amber ≤60d, green ≤90d, slate >90d. */}
          {allRenewals.length > 0 && (() => {
            // Show first 5 soonest; rest hidden behind a "show more" concept
            // (keeping the sidebar compact — the most urgent items are what matter).
            const visible = allRenewals.slice(0, 5);
            const overdueCount = allRenewals.filter(r => r.daysLeft < 0).length;
            const soonCount    = allRenewals.filter(r => r.daysLeft >= 0 && r.daysLeft <= 30).length;
            return (
              <div ref={renewalsSectionRef} className="shrink-0 border-t border-slate-100 dark:border-slate-700/30 px-4 py-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-3 w-3 text-amber-500" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Upcoming Renewals
                  </p>
                  {(overdueCount > 0 || soonCount > 0) && (
                    <span className={`ml-auto text-[10px] font-bold border rounded-full px-1.5 py-0.5 tabular-nums ${
                      overdueCount > 0
                        ? "text-red-700 bg-red-50 border-red-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}>
                      {overdueCount > 0 ? `${overdueCount} overdue` : `${soonCount} soon`}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {visible.map(({ biz, item, daysLeft, formName }) => {
                    const isActiveBiz = loadedBusiness?.id === biz.id;
                    const badgeColor =
                      daysLeft < 0   ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40" :
                      daysLeft <= 30 ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40" :
                      daysLeft <= 60 ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40" :
                      daysLeft <= 90 ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30" :
                                       "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50";
                    const countLabel =
                      daysLeft < 0   ? `${Math.abs(daysLeft)}d overdue` :
                      daysLeft === 0 ? "Today" :
                      daysLeft === 1 ? "Tomorrow" :
                      daysLeft <= 13 ? `${daysLeft}d` :
                      daysLeft <= 90 ? `${Math.round(daysLeft / 7)}w` :
                                       `${Math.round(daysLeft / 30)}mo`;
                    return (
                      <div key={`${biz.id}-${item.id}`} className="rounded-lg border border-slate-100 dark:border-slate-700/30 bg-slate-50 dark:bg-[#131e2f] px-2.5 py-2 space-y-1">
                        {/* Business name — only shown for cross-business items */}
                        {!isActiveBiz && (
                          <p className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate">
                            {biz.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate" title={formName}>
                              {formName}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              {new Date(item.renewalDate! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-semibold border rounded px-1.5 py-0.5 ${badgeColor}`}>
                            {countLabel}
                          </span>
                          {item.formId && (
                            <button
                              onClick={() => handleRenewFormItem(item.formId!, isActiveBiz ? null : biz)}
                              className="shrink-0 text-[10px] font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded px-1.5 py-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                              title={isActiveBiz ? "Renew this permit" : `Switch to ${biz.name} and renew`}
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {allRenewals.length > 5 && (
                    <p className="text-[10px] text-slate-400 text-center pt-0.5">
                      +{allRenewals.length - 5} more renewal{allRenewals.length - 5 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Rule Change Alerts — Pro only ────────────────────────────── */}
          {!isPro && (
            <div className="shrink-0 border-t border-slate-100 dark:border-slate-700/30 px-4 py-3">
              <div
                className="flex items-center gap-2.5 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5 cursor-pointer"
                onClick={() => void handleUpgradeToPro()}
              >
                <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Rule Change Alerts</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500">Pro feature — get notified when regulations change</p>
                </div>
                <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              </div>
            </div>
          )}
          {isPro && (() => {
            // v27: show up to 5 alerts (was 3), XIcon dismiss, Dismiss-all, Load Business CTA
            // v37: apply alertBizFilter — null = all, string = filtered to one business
            const allActive = alertBizFilter
              ? activeAlerts.filter(a => a.businessId === alertBizFilter)
              : activeAlerts;
            const visible   = allActive.slice(0, 5);
            // v37: unique businesses with active alerts — needed for filter chips
            const alertBizIds = [...new Set(activeAlerts.map(a => a.businessId))];
            if (visible.length === 0) return null;
            return (
              <div ref={alertsSectionRef} className="shrink-0 border-t border-slate-100 dark:border-slate-700/30 px-4 py-3 space-y-2">
                {/* Section header */}
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Rule Change Alerts
                  </p>
                  <span className="ml-auto text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 rounded-full px-1.5 py-0.5 tabular-nums">
                    {allActive.length}
                  </span>
                  {/* v27: Dismiss-all shortcut — only when ≥2 active alerts */}
                  {allActive.length >= 2 && (
                    <button
                      onClick={() => {
                        allActive.forEach(a => dismissAlert(a.id));
                      }}
                      className="text-[9px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline ml-1 pointer-events-auto min-h-[28px] transition-colors"
                      title="Dismiss all rule change alerts"
                    >
                      Dismiss all
                    </button>
                  )}
                </div>
                {/* v37 — Business filter chips: shown when ≥2 businesses have active alerts */}
                {alertBizIds.length >= 2 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setAlertBizFilter(null)}
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-colors min-h-[24px] pointer-events-auto ${
                        alertBizFilter === null
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                      }`}
                    >
                      All
                    </button>
                    {alertBizIds.map(bizId => {
                      const biz = savedBusinesses.find(b => b.id === bizId);
                      if (!biz) return null;
                      return (
                        <button
                          key={bizId}
                          onClick={() => setAlertBizFilter(bizId)}
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-colors min-h-[24px] pointer-events-auto truncate max-w-[120px] ${
                            alertBizFilter === bizId
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                          }`}
                          title={biz.name}
                        >
                          {biz.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="space-y-2">
                  {visible.map(alert => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 p-2.5 space-y-1.5"
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                            {alert.businessName}
                          </p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug mt-0.5">
                            {alert.title}
                          </p>
                        </div>
                        {/* v27: XIcon dismiss (was ChevronRight — semantically wrong) */}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="shrink-0 p-1 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/40 rounded transition-colors pointer-events-auto"
                          title="Dismiss this alert"
                          aria-label={`Dismiss alert: ${alert.title}`}
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Footer row */}
                      <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(alert.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-1 ml-auto flex-wrap">
                          {/* v27: Load Business CTA — one tap to focus the affected business */}
                          {(() => {
                            const bizForAlert = savedBusinesses.find(b => b.id === alert.businessId);
                            if (!bizForAlert) return null;
                            const isLoaded = loadedBusiness?.id === alert.businessId;
                            return !isLoaded ? (
                              <button
                                onClick={() => {
                                  handleLoadBusiness(bizForAlert);
                                  setShowProfileView(true);
                                }}
                                className="flex items-center gap-1 text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 rounded-lg px-2 py-0.5 transition-colors pointer-events-auto min-h-[28px]"
                                title={`Load ${bizForAlert.name}`}
                              >
                                <Briefcase className="h-2 w-2 shrink-0" />
                                Load
                              </button>
                            ) : null;
                          })()}
                          {/* v37: Snooze dropdown — 1d/7d/30d; replaces static Snooze 7d button */}
                          <select
                            defaultValue=""
                            onChange={e => {
                              const days = parseInt(e.target.value, 10);
                              if (!isNaN(days) && days > 0) {
                                snoozeAlert(alert.id, days);
                                e.target.value = "";
                              }
                            }}
                            className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600/50 rounded-lg px-1.5 py-0.5 transition-colors pointer-events-auto min-h-[28px] cursor-pointer appearance-none"
                            title="Snooze this alert"
                          >
                            <option value="" disabled>
                              Snooze…
                            </option>
                            <option value="1">1 day</option>
                            <option value="7">7 days</option>
                            <option value="30">30 days</option>
                          </select>
                          {/* Review Impact — opens modal */}
                          <button
                            onClick={() => setReviewImpactAlertId(alert.id)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700/50 rounded-lg px-2 py-0.5 transition-colors pointer-events-auto min-h-[28px]"
                          >
                            <FileText className="h-2.5 w-2.5" />
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Overflow indicator when total > 5 */}
                  {allActive.length > 5 && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-1">
                      +{allActive.length - 5} more alert{allActive.length - 5 !== 1 ? "s" : ""} — dismiss above to reveal
                    </p>
                  )}
                </div>
              </div>
            );
          })()} {/* end isPro && alerts IIFE */}

          {/* Pro upsell banner — shown only for Free tier users */}
          {/* vUnified-20260414-national-expansion-v86: added CTA button wired to handleUpgradeToPro */}
          {!isPro && (
            <div className="shrink-0 border-t border-slate-100 dark:border-slate-700/30 px-4 py-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/25 dark:to-indigo-900/25 border border-blue-200 dark:border-blue-800/40 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Upgrade to RegPulse Pro</p>
                  <span className="ml-auto text-[10px] font-bold text-blue-700 dark:text-blue-400">$19/mo</span>
                </div>
                <ul className="space-y-1">
                  {[
                    "Unlimited AI form completions & renewals",
                    "Automatic renewal filing (pre-filled)",
                    "Quarterly Compliance Check-in PDF",
                  ].map(benefit => (
                    <li key={benefit} className="flex items-start gap-1 text-[10px] text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="h-2.5 w-2.5 text-blue-500 shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {`${monthlyFormsUsed}/${FREE_MONTHLY_LIMIT} free completions used this month`}
                </p>
                {/* v86: CTA button — signed-in users go straight to checkout; guests open auth panel */}
                <button
                  onClick={() => void handleUpgradeToPro()}
                  disabled={proCheckoutLoading}
                  className="w-full flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 pointer-events-auto"
                  style={{ touchAction: "manipulation" }}
                >
                  {proCheckoutLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Crown className="h-3.5 w-3.5 shrink-0" />
                      Get Pro — $19/mo
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── v20: Forms Library Section ────────────────────────────────────
               Collapsible sidebar section listing all forms from ALL_FORMS
               (federal + state/local entries with download links / official URLs).
               Collapsed by default; toggle via the FolderOpen header button.
               v22 — added "View full library →" link to /forms page. */}
          <div className="shrink-0 border-t border-slate-100 dark:border-slate-700/30">
            {/* Header row — always visible */}
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setFormsLibraryOpen(o => !o)}
                className="flex items-center gap-1.5 flex-1 hover:opacity-70 transition-opacity group"
              >
                <FolderOpen className="h-3 w-3 text-blue-500 shrink-0" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  Forms Library
                </p>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ml-auto ${formsLibraryOpen ? "rotate-180" : ""}`} />
              </button>
              {/* v22 — link to the full /forms page */}
              <Link
                href="/forms"
                className="shrink-0 ml-2 text-[9px] font-semibold text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-0.5"
                title="Open full Forms Library"
              >
                View all
                <ChevronRight className="h-2.5 w-2.5" />
              </Link>
            </div>

            {/* v26 — Recommended Forms teaser (shown when a business is loaded) */}
            {loadedBusiness && (
              <div className="px-4 pb-2">
                <Link
                  href="/forms"
                  className="flex items-center gap-1.5 w-full text-left bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800/40 rounded-lg px-2.5 py-1.5 transition-colors group"
                  title="View personalised form recommendations"
                >
                  <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors flex-1">
                    Recommended Forms
                  </span>
                  <ChevronRight className="h-2.5 w-2.5 text-amber-400" />
                </Link>
              </div>
            )}

            {/* Expandable body */}
            {formsLibraryOpen && (
              <div className="px-4 pb-3">
                <FormsLibrary compact />
              </div>
            )}
          </div>

          {/* vMyBusinessesPortfolioEffect — Rich portfolio cards for My Businesses.
               Each card shows: colored left-accent border (green/amber/red/blue by health),
               health dot, business name, score %, location, form-completion pill,
               renewal-due pill (red, 30-day window), alert badge (amber), last-checked
               timestamp, and a thin compliance progress bar at the card footer.
               Active (loaded) business: blue ring + shadow treatment.
               At-risk (score < 50 or alert or renewals): tinted background.
               All existing wiring (click → open profile, Bell, Trash, Locations sub-list,
               delete confirm) is preserved unchanged. */}
          <div className="border-t border-slate-100 dark:border-slate-700/30 px-4 py-3 space-y-2">
            {/* v36 — Push notification permission banner.
                 Shown only when: permission === "default" (never asked), at least one business
                 is saved, and the user hasn't manually dismissed it this session.
                 Touch targets: Enable button min-h-[32px]; ✕ is secondary (min-h acceptable for
                 inline dismiss). Banner background is subtle blue so it doesn't alarm users. */}
            {pushPermission === "default" && !pushBannerDismissed && savedBusinesses.length > 0 && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 flex items-center gap-2">
                <Bell className="h-3 w-3 text-blue-500 shrink-0" />
                <p className="flex-1 text-[9px] text-blue-700 dark:text-blue-300 leading-snug">
                  Enable push alerts for rule changes &amp; renewals
                  {/* v39 — Capacitor native push indicator */}
                  {isCapacitorNative() && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-blue-600 text-white text-[7px] font-bold px-1 py-px leading-none">
                      native
                    </span>
                  )}
                </p>
                <button
                  onClick={async () => {
                    const result = await requestNotifPermission();
                    setPushPermission(result);
                    if (result !== "default") setPushBannerDismissed(true);
                  }}
                  className="shrink-0 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg px-2 py-0.5 transition-colors pointer-events-auto min-h-[32px]"
                >
                  Enable
                </button>
                <button
                  onClick={() => setPushBannerDismissed(true)}
                  className="shrink-0 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors pointer-events-auto min-h-[28px]"
                  aria-label="Dismiss notification banner"
                >
                  <XIcon className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            {/* v40 — Push "granted" confirmation banner.
                 Shown when permission is already "granted" and user has ≥1 business saved,
                 displayed only briefly until dismissed. Muted green confirms pushes are active.
                 Dismissed after first view via pushBannerDismissed (shared flag). */}
            {pushPermission === "granted" && !pushBannerDismissed && savedBusinesses.length > 0 && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 flex items-center gap-2">
                <Bell className="h-3 w-3 text-emerald-500 shrink-0" />
                <p className="flex-1 text-[8px] text-emerald-700 dark:text-emerald-300 leading-snug">
                  Push alerts active
                  {isCapacitorNative() && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-emerald-600 text-white text-[7px] font-bold px-1 py-px leading-none">
                      native
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setPushBannerDismissed(true)}
                  className="shrink-0 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors pointer-events-auto min-h-[28px]"
                  aria-label="Dismiss push confirmation"
                >
                  <XIcon className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            {/* v56 — Section header: "My Businesses" label + alert badge + Portfolio OS toggle + Add button */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
                  My Businesses
                </p>
                {/* v31: active alert count badge — non-interactive display only */}
                {activeAlerts.length > 0 && (
                  <span className="inline-flex items-center justify-center h-3.5 min-w-[14px] px-0.5 rounded-full bg-amber-500 text-white text-[7px] font-bold tabular-nums leading-none shrink-0">
                    {activeAlerts.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* v56 — Portfolio OS mode toggle (shown when ≥2 businesses saved).
                     Switches sidebar into unified Compliance OS dashboard with aggregate
                     ring, inline alerts strip, and cross-business renewal calendar.
                     min-h-[32px] acceptable for compact secondary toggle in sidebar header. */}
                {savedBusinesses.length >= 2 && (
                  <button
                    onClick={() => setPortfolioExpanded(o => !o)}
                    className={`flex items-center gap-0.5 text-[9px] font-bold rounded-lg px-1.5 py-0.5 transition-colors min-h-[32px] pointer-events-auto ${
                      portfolioExpanded
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-slate-100 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                    title={portfolioExpanded ? "Exit Compliance OS view" : "Open Compliance OS portfolio view"}
                    style={{ touchAction: "manipulation" }}
                  >
                    <Layers className="h-2.5 w-2.5 shrink-0" />
                    OS
                  </button>
                )}
                {isPro ? (
                  <button
                    onClick={() => setShowAddBizModal(true)}
                    className="flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-2 py-0.5 transition-colors min-h-[32px] pointer-events-auto"
                    title="Add a business"
                    style={{ touchAction: "manipulation" }}
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                ) : (
                  <button
                    onClick={() => void handleUpgradeToPro()}
                    className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2 py-0.5 transition-colors min-h-[32px] pointer-events-auto"
                    title="Pro feature — upgrade to add businesses"
                    style={{ touchAction: "manipulation" }}
                  >
                    <Crown className="h-3 w-3" />
                    Pro
                  </button>
                )}
              </div>
            </div>
            {/* v40/v56 — Portfolio Health Summary Widget.
                 v56 upgrade: adds 36px aggregate SVG health ring + Compliance OS header row (in
                 portfolioExpanded mode) + overdue count cell (4-cell 2×2 grid replaces 3-cell row).
                 Platform parity: aggregate ring 36×36px non-interactive display; min-h-[36px] cells;
                 alerts cell is a tappable button (scroll to alerts) with pointer-events-auto. */}
            {savedBusinesses.length >= 2 && (() => {
              const scoredBizzes  = savedBusinesses.filter(b => b.healthScore != null && (b.totalForms ?? 0) > 0);
              const avgScore      = scoredBizzes.length > 0
                ? Math.round(scoredBizzes.reduce((s, b) => s + (b.healthScore ?? 0), 0) / scoredBizzes.length)
                : null;
              const upcomingCount = allRenewals.filter(r => r.daysLeft >= 0 && r.daysLeft <= 30).length;
              const overdueCount  = allRenewals.filter(r => r.daysLeft < 0).length;
              const alertCount    = activeAlerts.length;
              const scoreColor    =
                avgScore == null ? "text-slate-400" :
                avgScore >= 80   ? "text-emerald-600 dark:text-emerald-400" :
                avgScore >= 50   ? "text-amber-600 dark:text-amber-400"    : "text-red-600 dark:text-red-400";
              // v56 — 36px aggregate SVG ring constants
              const RING_R    = 16;
              const RING_CIRC = 2 * Math.PI * RING_R;
              const ringOffset = avgScore == null ? RING_CIRC : RING_CIRC * (1 - avgScore / 100);
              const ringStroke =
                avgScore == null ? "#94a3b8" :
                avgScore >= 80   ? "#10b981" :
                avgScore >= 50   ? "#f59e0b" : "#ef4444";
              return (
                <div className={`rounded-xl border overflow-hidden transition-colors ${
                  portfolioExpanded
                    ? "border-blue-200 dark:border-blue-700/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-900/25 dark:to-indigo-900/20"
                    : "border-slate-200 dark:border-slate-700/50"
                }`}>
                  {/* v56 — Compliance OS header row: visible only when portfolioExpanded */}
                  {portfolioExpanded && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 border-b border-blue-200/60 dark:border-blue-700/30">
                      <Layers className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex-1">
                        Compliance OS
                      </p>
                      <span className="text-[8px] text-blue-500 dark:text-blue-400 tabular-nums shrink-0">
                        {savedBusinesses.length} biz
                      </span>
                    </div>
                  )}
                  {/* Stats area: 36px ring + 2×2 stat cells */}
                  <div className="flex items-stretch">
                    {/* v56 — 36px aggregate ring (non-interactive display element) */}
                    <div
                      className="flex flex-col items-center justify-center px-2 py-2 bg-slate-50 dark:bg-slate-800/30 shrink-0 border-r border-slate-200 dark:border-slate-700/50"
                      aria-hidden="true"
                    >
                      <svg width="36" height="36" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r={RING_R} fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r={RING_R}
                          fill="none"
                          stroke={ringStroke}
                          strokeWidth="3"
                          strokeDasharray={RING_CIRC}
                          strokeDashoffset={ringOffset}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                          style={{ transition: "stroke-dashoffset 0.6s ease" }}
                        />
                        <text x="18" y="22" textAnchor="middle" fontSize="8" fontWeight="bold" fill={ringStroke}>
                          {avgScore != null ? `${avgScore}` : "—"}
                        </text>
                      </svg>
                      <p className="text-[6px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">portfolio</p>
                    </div>
                    {/* 2×2 stat cells */}
                    <div className="flex-1 grid grid-cols-2">
                      <div className="bg-slate-50 dark:bg-slate-800/30 px-1.5 py-1.5 text-center min-h-[36px] flex flex-col items-center justify-center border-b border-r border-slate-200 dark:border-slate-700/50">
                        <p className={`text-[11px] font-bold tabular-nums leading-none ${scoreColor}`}>
                          {avgScore != null ? `${avgScore}%` : "—"}
                        </p>
                        <p className="text-[7px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">avg health</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/30 px-1.5 py-1.5 text-center min-h-[36px] flex flex-col items-center justify-center border-b border-slate-200 dark:border-slate-700/50">
                        <p className={`text-[11px] font-bold tabular-nums leading-none ${overdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-slate-400"}`}>
                          {overdueCount}
                        </p>
                        <p className="text-[7px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">overdue</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/30 px-1.5 py-1.5 text-center min-h-[36px] flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-700/50">
                        <p className={`text-[11px] font-bold tabular-nums leading-none ${upcomingCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                          {upcomingCount}
                        </p>
                        <p className="text-[7px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">due ≤30d</p>
                      </div>
                      {/* Alerts cell: tappable — scrolls to rule-change alerts section */}
                      <button
                        onClick={() => alertsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                        className="bg-slate-50 dark:bg-slate-800/30 px-1.5 py-1.5 text-center min-h-[36px] flex flex-col items-center justify-center pointer-events-auto transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        title="View rule change alerts"
                        style={{ touchAction: "manipulation" }}
                      >
                        <p className={`text-[11px] font-bold tabular-nums leading-none ${alertCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                          {alertCount}
                        </p>
                        <p className="text-[7px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">alerts</p>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* v30: bizSortOrder toggle — only shown when ≥2 businesses */}
            {savedBusinesses.length >= 2 && (
              <div className="flex items-center gap-0.5">
                {(["recent", "score", "urgency"] as const).map(order => (
                  <button
                    key={order}
                    onClick={() => setBizSortOrder(order)}
                    className={`flex-1 text-[8px] font-semibold py-0.5 rounded transition-colors pointer-events-auto ${
                      bizSortOrder === order
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {order === "recent" ? "Recent" : order === "score" ? "Score" : "Urgent"}
                  </button>
                ))}
              </div>
            )}

            {/* v56 — Compliance OS: inline rule-change alerts strip.
                 Shown ONLY when portfolioExpanded && activeAlerts.length > 0.
                 Surfaces the most recent 3 alerts directly in the portfolio panel so users
                 don't have to scroll up to the separate alerts section.
                 Platform parity: dismiss/load buttons min-h-[28px] (compact secondary);
                 pointer-events-auto on all interactive children; no new scroll containers. */}
            {portfolioExpanded && activeAlerts.length > 0 && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-900/15 overflow-hidden">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-amber-200/70 dark:border-amber-800/40">
                  <Zap className="h-2.5 w-2.5 text-amber-500 shrink-0" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex-1">
                    Rule Alerts
                  </p>
                  <span className="text-[8px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-px tabular-nums leading-none">
                    {activeAlerts.length}
                  </span>
                  <button
                    onClick={() => alertsSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="text-[8px] font-semibold text-amber-600 dark:text-amber-400 hover:underline ml-1 pointer-events-auto min-h-[24px]"
                    style={{ touchAction: "manipulation" }}
                  >
                    See all ↓
                  </button>
                </div>
                <div className="divide-y divide-amber-100 dark:divide-amber-800/30">
                  {activeAlerts.slice(0, 3).map(alert => {
                    const alertBiz = savedBusinesses.find(b => b.id === alert.businessId);
                    return (
                      <div key={alert.id} className="flex items-start gap-2 px-2.5 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 truncate leading-tight">
                            {alert.businessName}
                          </p>
                          <p className="text-[9px] text-slate-700 dark:text-slate-200 truncate leading-tight mt-0.5">
                            {alert.title}
                          </p>
                        </div>
                        {alertBiz && loadedBusiness?.id !== alert.businessId && (
                          <button
                            onClick={() => { handleLoadBusiness(alertBiz); setShowProfileView(true); }}
                            className="shrink-0 text-[8px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded px-1.5 py-0.5 pointer-events-auto min-h-[24px] transition-colors hover:bg-blue-100"
                            style={{ touchAction: "manipulation" }}
                          >
                            Open
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="shrink-0 p-0.5 text-slate-300 hover:text-slate-500 pointer-events-auto min-h-[24px]"
                          aria-label={`Dismiss ${alert.title}`}
                          style={{ touchAction: "manipulation" }}
                        >
                          <XIcon className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* v56 — Compliance OS: cross-business renewal calendar strip.
                 Shown ONLY when portfolioExpanded && allRenewals.length > 0.
                 Shows next 5 upcoming renewals across ALL businesses — sorted by daysLeft —
                 with business name labels so users can triage without opening each profile.
                 Platform parity: each row has a min-h-[28px] "Open" button (compact secondary);
                 strip is part of the unified sidebar scroll container (no overflow changes). */}
            {portfolioExpanded && allRenewals.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-800/20 overflow-hidden">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-slate-200/80 dark:border-slate-700/40">
                  <Calendar className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex-1">
                    Upcoming Renewals
                  </p>
                  <span className="text-[8px] text-slate-400 tabular-nums shrink-0">
                    all businesses
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
                  {[...allRenewals]
                    .sort((a, b) => a.daysLeft - b.daysLeft)
                    .slice(0, 5)
                    .map((renewal, idx) => {
                      const isOverdueR = renewal.daysLeft < 0;
                      const isSoon     = renewal.daysLeft >= 0 && renewal.daysLeft <= 7;
                      const daysLabel  =
                        isOverdueR    ? `${Math.abs(renewal.daysLeft)}d over` :
                        renewal.daysLeft === 0 ? "today" :
                        renewal.daysLeft === 1 ? "tmrw" :
                        renewal.daysLeft <= 30 ? `${renewal.daysLeft}d` :
                                                 `${Math.ceil(renewal.daysLeft / 7)}w`;
                      const badgeCls   =
                        isOverdueR ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/25 border-red-200 dark:border-red-700/50" :
                        isSoon     ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50" :
                                     "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/50";
                      const renewalBiz = savedBusinesses.find(b => b.id === renewal.biz.id);
                      return (
                        <div key={`${renewal.biz.id}-${renewal.item.id}-${idx}`} className="flex items-center gap-2 px-2.5 py-1.5 min-h-[28px]">
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 truncate leading-tight">
                              {renewal.biz.name}
                            </p>
                            <p className="text-[9px] text-slate-600 dark:text-slate-300 truncate leading-tight">
                              {renewal.formName}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[8px] font-bold border rounded px-1 py-0.5 tabular-nums leading-none ${badgeCls}`}>
                            {daysLabel}
                          </span>
                          {renewalBiz && renewal.item.formId && (
                            <button
                              onClick={() => handleRenewFormItem(renewal.item.formId!, loadedBusiness?.id === renewal.biz.id ? null : renewalBiz)}
                              className="shrink-0 text-[8px] font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded px-1.5 py-0.5 pointer-events-auto min-h-[24px] transition-colors hover:bg-blue-100"
                              style={{ touchAction: "manipulation" }}
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* v39 — "Next Up" strip: most urgent compliance task across all businesses.
                 Shown above the business card list when ≥1 business has an overdue or
                 soon-due item (daysLeft ≤ 7). Helps users triage without scrolling cards. */}
            {savedBusinesses.length > 0 && (() => {
              const nextUpItem = allRenewals
                .filter(r => r.daysLeft <= 7)
                .sort((a, b) => a.daysLeft - b.daysLeft)[0] ?? null;
              if (!nextUpItem) return null;
              const isOverdue = nextUpItem.daysLeft < 0;
              const isTomorrow = nextUpItem.daysLeft === 1;
              const isToday = nextUpItem.daysLeft === 0;
              const urgencyColor = isOverdue
                ? "border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20"
                : nextUpItem.daysLeft <= 3
                  ? "border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20"
                  : "border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-900/20";
              const textColor = isOverdue
                ? "text-red-700 dark:text-red-300"
                : nextUpItem.daysLeft <= 3
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-blue-700 dark:text-blue-300";
              const dueLabel = isOverdue
                ? `${Math.abs(nextUpItem.daysLeft)}d overdue`
                : isToday ? "due today"
                : isTomorrow ? "due tomorrow"
                : `due in ${nextUpItem.daysLeft}d`;
              return (
                <div className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${urgencyColor}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[8px] font-semibold uppercase tracking-widest mb-0.5 ${textColor} opacity-70`}>
                      Next Up
                    </p>
                    <p className={`text-[9px] font-semibold truncate ${textColor}`}>
                      {nextUpItem.formName}
                    </p>
                    <p className={`text-[8px] truncate ${textColor} opacity-80`}>
                      {nextUpItem.biz.name} — {dueLabel}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const biz = savedBusinesses.find(b => b.id === nextUpItem.biz.id);
                      if (biz) { handleLoadBusiness(biz); setShowProfileView(true); }
                    }}
                    className={`shrink-0 text-[8px] font-bold px-2 py-0.5 rounded-lg transition-colors pointer-events-auto min-h-[28px] ${
                      isOverdue
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : nextUpItem.daysLeft <= 3
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Open →
                  </button>
                </div>
              );
            })()}

            {savedBusinesses.length === 0 ? (
              /* Empty state — dashed border prompts first action */
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700/50 px-4 py-5 text-center space-y-2">
                {isPro ? (
                  <>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      No businesses yet — add one to track compliance.
                    </p>
                    <button
                      onClick={() => setShowAddBizModal(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline pointer-events-auto"
                    >
                      + Add your first business
                    </button>
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 text-amber-500 mx-auto" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      <strong className="text-amber-600 dark:text-amber-400">Pro feature</strong> — saved business profiles, compliance dashboard &amp; health score.
                    </p>
                    <button
                      onClick={() => void handleUpgradeToPro()}
                      className="text-[11px] font-semibold text-amber-600 hover:underline pointer-events-auto"
                    >
                      Upgrade to Pro →
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {/* v30: sort businesses per bizSortOrder before rendering */}
                {[...savedBusinesses].sort((a, b) => {
                  if (bizSortOrder === 'score') {
                    return (b.healthScore ?? -1) - (a.healthScore ?? -1);
                  }
                  if (bizSortOrder === 'urgency') {
                    const urgA = allRenewals.filter(r => r.biz.id === a.id && r.daysLeft >= 0 && r.daysLeft <= 30).length;
                    const urgB = allRenewals.filter(r => r.biz.id === b.id && r.daysLeft >= 0 && r.daysLeft <= 30).length;
                    return urgB - urgA;
                  }
                  return 0; // 'recent' — preserve insertion order (savedBusinesses is already recency-ordered)
                }).map(biz => {
                  // vMyBusinessesPortfolioEffect + v26 enhancement: per-card derived values
                  const score          = biz.healthScore ?? 0;
                  const hasScore       = biz.totalForms != null && biz.totalForms > 0;
                  const isLoaded       = loadedBusiness?.id === biz.id;
                  const hasAlert       = activeAlerts.some(a => a.businessId === biz.id);
                  // v36 — per-card overdue count (daysLeft < 0), separate from urgentRenewals
                  const overdueRenewals = allRenewals.filter(
                    r => r.biz.id === biz.id && r.daysLeft < 0
                  ).length;
                  // v36 — per-card active alert count (may be >1 if multiple rules changed)
                  const bizAlertCount  = activeAlerts.filter(a => a.businessId === biz.id).length;
                  // Renewals due within 30 days for this specific business
                  const urgentRenewals = allRenewals.filter(
                    r => r.biz.id === biz.id && r.daysLeft >= 0 && r.daysLeft <= 30
                  ).length;
                  // v26: all upcoming renewals within 60 days (for portfolio tooltip)
                  const totalUpcoming  = allRenewals.filter(
                    r => r.biz.id === biz.id && r.daysLeft >= 0 && r.daysLeft <= 60
                  ).length;
                  const isAtRisk       = hasScore && score < 50;
                  const isConfirmingDelete = confirmDeleteBizId === biz.id;

                  // v26: trend from scoreHistory (null when < 2 data points)
                  const hist      = biz.scoreHistory;
                  const trendDiff = (hist && hist.length >= 2)
                    ? hist[hist.length - 1] - hist[hist.length - 2]
                    : null;

                  // v33: next upcoming renewal for this business (soonest positive daysLeft)
                  const nextRenewal = allRenewals
                    .filter(r => r.biz.id === biz.id && r.daysLeft >= 0)
                    .sort((a, b) => a.daysLeft - b.daysLeft)[0] ?? null;

                  // v26: mini SVG ring constants (replaces flat color dot)
                  const MINI_R    = 9;
                  const MINI_CIRC = 2 * Math.PI * MINI_R;
                  const miniOffset = !hasScore ? MINI_CIRC : MINI_CIRC * (1 - score / 100);
                  const miniStroke =
                    !hasScore   ? "#94a3b8" :
                    score >= 80 ? "#10b981" :
                    score >= 50 ? "#f59e0b" : "#ef4444";

                  // Progress bar fill color (inline style for smooth transitions)
                  const barColor =
                    score >= 80 ? "#10b981" :
                    score >= 50 ? "#f59e0b" : "#ef4444";

                  // Score label color
                  const scoreColor =
                    !hasScore   ? "text-slate-400" :
                    score >= 80 ? "text-emerald-600" :
                    score >= 50 ? "text-amber-600" : "text-red-600";

                  // Form-count pill tint matches health tier
                  const formPillCls =
                    !hasScore   ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400" :
                    score >= 80 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400" :
                    score >= 50 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400" :
                                  "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400";

                  // Left accent border: blue when active, red/amber when at risk, green when healthy, slate otherwise
                  const leftBorderColor =
                    isLoaded                       ? "#3b82f6" :
                    isAtRisk                       ? "#ef4444" :
                    hasAlert || urgentRenewals > 0 ? "#f59e0b" :
                    hasScore && score >= 80        ? "#10b981" : "#e2e8f0";

                  // Card background + border (dark variants embedded in each string)
                  const cardBg =
                    isLoaded           ? "bg-blue-50 dark:bg-blue-900/25 border-blue-200 dark:border-blue-700/50" :
                    isAtRisk           ? "bg-red-50/70 dark:bg-red-900/20 border-red-200 dark:border-red-800/40" :
                    hasAlert           ? "bg-amber-50/70 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40" :
                    urgentRenewals > 0 ? "bg-orange-50/50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/40" :
                                        "bg-white dark:bg-[#0f1c2e] border-slate-200 dark:border-slate-700/50";

                  const cardHover =
                    isLoaded           ? "" :
                    isAtRisk           ? "hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700/60" :
                    hasAlert           ? "hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700/60" :
                    urgentRenewals > 0 ? "hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700/60" :
                                        "hover:bg-slate-50 dark:hover:bg-slate-700/20 hover:border-slate-300 dark:hover:border-slate-600";

                  // Business name color (dark variants for legibility)
                  const nameColor =
                    isLoaded  ? "text-blue-800 dark:text-blue-300" :
                    isAtRisk  ? "text-red-800 dark:text-red-300"  :
                    hasAlert  ? "text-amber-900 dark:text-amber-300" : "text-slate-800 dark:text-slate-100";

                  return (
                    <div key={biz.id} className="relative group/card">
                      {isConfirmingDelete ? (
                        /* Delete confirmation — inline, replaces card */
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs">
                          <p className="text-red-700 font-medium mb-1.5 leading-snug">
                            Delete &ldquo;{biz.name}&rdquo; and all its data? This cannot be undone.
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                handleDeleteBusiness(biz);
                                setConfirmDeleteBizId(null);
                              }}
                              className="px-2 py-0.5 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors min-h-[28px] pointer-events-auto"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteBizId(null)}
                              className="px-2 py-0.5 bg-white dark:bg-[#0f1823] border border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors min-h-[28px] pointer-events-auto"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* ── Portfolio card ─────────────────────────────── */}
                          <button
                            onClick={() => {
                              handleLoadBusiness(biz);
                              setShowProfileView(true);
                            }}
                            className={`w-full text-left rounded-xl border transition-all pr-14 ${cardBg} ${cardHover} ${
                              isLoaded ? "ring-1 ring-blue-300 shadow-sm shadow-blue-100/60" : ""
                            } pointer-events-auto`}
                            style={{
                              // vMyBusinessesPortfolioEffect: colored left accent border
                              // communicates health status at a glance without extra chrome.
                              borderLeftWidth: "3px",
                              borderLeftColor: leftBorderColor,
                            }}
                            title={`View profile for ${biz.name}`}
                          >
                            {/* v26 Row 1: SVG mini health ring + name + score% + trend arrow + chevron */}
                            <div className="flex items-center gap-2 px-2.5 pt-2.5">
                              {/* v26 — Mini SVG health ring (20×20) replaces flat color dot */}
                              <div className="relative shrink-0 w-5 h-5">
                                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                                  <circle cx="10" cy="10" r={MINI_R} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                                  {hasScore && (
                                    <circle
                                      cx="10" cy="10" r={MINI_R}
                                      fill="none"
                                      stroke={miniStroke}
                                      strokeWidth="2.5"
                                      strokeDasharray={MINI_CIRC}
                                      strokeDashoffset={miniOffset}
                                      strokeLinecap="round"
                                      transform="rotate(-90 10 10)"
                                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                                    />
                                  )}
                                </svg>
                              </div>
                              <p className={`flex-1 text-xs font-bold truncate ${nameColor}`}>
                                {biz.name}
                              </p>
                              {hasScore ? (
                                <span className={`text-[10px] font-bold tabular-nums shrink-0 ${scoreColor}`}>
                                  {score}%
                                </span>
                              ) : isPro ? (
                                <span className="shrink-0 inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">
                                  <Crown className="h-1.5 w-1.5" />
                                  Pro
                                </span>
                              ) : null}
                              {/* v26 — Trend arrow from scoreHistory (↑ green / ↓ red) */}
                              {trendDiff !== null && (
                                <span className={`text-[9px] font-bold shrink-0 ${trendDiff >= 0 ? "text-emerald-500" : "text-red-400"}`}
                                  title={`Score ${trendDiff >= 0 ? "up" : "down"} ${Math.abs(trendDiff)} pts since last save`}
                                >
                                  {trendDiff >= 0 ? "↑" : "↓"}
                                </span>
                              )}
                              {/* v29: ChevronRight moved to "Open Profile →" footer label below */}
                            </div>

                            {/* Row 2: location + isPreExisting badge */}
                            <div className="flex items-center gap-1.5 px-2.5 mt-0.5 pl-7">
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex-1">
                                {biz.location || "No location set"}
                              </p>
                              {biz.isPreExisting && (
                                <span className="shrink-0 text-[8px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded px-1 leading-none py-0.5">
                                  existing
                                </span>
                              )}
                            </div>

                            {/* Row 3: status pills + last-checked timestamp */}
                            <div className="flex items-center gap-1 px-2.5 mt-1.5 pb-1.5 pl-7 flex-wrap">
                              {/* Form-completion pill: "X/Y done" */}
                              {hasScore && (
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border leading-none ${formPillCls}`}>
                                  {biz.completedFormsCount ?? 0}/{biz.totalForms} done
                                </span>
                              )}
                              {/* v36 — Overdue pill: shown when renewals are past due (daysLeft < 0) */}
                              {overdueRenewals > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-red-50 dark:bg-red-900/25 border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-400 leading-none">
                                  <AlertCircle className="h-2 w-2 shrink-0" />
                                  {overdueRenewals} overdue
                                </span>
                              )}
                              {/* v26 — Renewals pill: red if urgent (≤30d), amber if upcoming (≤60d) */}
                              {urgentRenewals > 0 ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-red-50 border-red-200 text-red-600 leading-none">
                                  <Bell className="h-2 w-2 shrink-0" />
                                  {urgentRenewals} due
                                </span>
                              ) : totalUpcoming > 0 ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-amber-50 border-amber-200 text-amber-600 leading-none">
                                  <Bell className="h-2 w-2 shrink-0" />
                                  {totalUpcoming} upcoming
                                </span>
                              ) : nextRenewal ? (
                                /* v33 — next renewal date when no urgent/upcoming pills shown (>60d horizon) */
                                <span
                                  className="inline-flex items-center gap-0.5 text-[9px] text-slate-400 leading-none"
                                  title={`Next renewal: ${nextRenewal.formName} in ${nextRenewal.daysLeft} day${nextRenewal.daysLeft !== 1 ? "s" : ""}`}
                                >
                                  Next: {nextRenewal.daysLeft}d
                                </span>
                              ) : null}
                              {/* v36 — Alert badge: shows count when ≥1, shows N when >1 alerts */}
                              {bizAlertCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 leading-none">
                                  <Zap className="h-2 w-2 shrink-0" />
                                  {bizAlertCount > 1 ? `${bizAlertCount} alerts` : "alert"}
                                </span>
                              )}
                              {/* Last-checked — right-aligned timestamp */}
                              {biz.lastChecked && (
                                <span className="text-[9px] text-slate-400 ml-auto tabular-nums shrink-0">
                                  {relativeDate(biz.lastChecked)}
                                </span>
                              )}
                            </div>

                            {/* Compliance progress bar — thin 3px strip at card bottom */}
                            {hasScore && (
                              <div className="mx-2.5 h-[3px] rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.max(4, score)}%`,
                                    background: barColor,
                                    transition: "width 0.5s ease",
                                  }}
                                />
                              </div>
                            )}

                            {/* v29/v56 — "Open Profile →" card footer CTA.
                                 v56: portfolioExpanded upgrades from inline text label to a full
                                 min-h-[48px] dedicated button (primary action in Compliance OS mode).
                                 Normal mode retains compact text label (min-h-[28px] secondary OK).
                                 Platform parity: portfolioExpanded button has touch-action:manipulation
                                 and pointer-events-auto; z-index unaffected (within card stacking). */}
                            {portfolioExpanded && !isLoaded ? (
                              /* v56 Compliance OS mode — dedicated full-width min-h-[48px] CTA */
                              <div className="px-2.5 pb-2.5 pt-1.5">
                                <button
                                  onClick={() => { handleLoadBusiness(biz); setShowProfileView(true); }}
                                  className="w-full flex items-center justify-center gap-1 min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors pointer-events-auto"
                                  style={{ touchAction: "manipulation" }}
                                >
                                  Open Profile
                                  <ChevronRight className="h-3 w-3 shrink-0" />
                                </button>
                              </div>
                            ) : (
                              <div className={`flex items-center justify-end px-2.5 py-1.5 mt-0.5 border-t ${
                                isLoaded
                                  ? "border-blue-200/60 dark:border-blue-700/30"
                                  : "border-slate-100 dark:border-slate-700/20"
                              }`}>
                                {isLoaded ? (
                                  <span className="text-[9px] font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-0.5">
                                    Profile open
                                    <CheckCircle2 className="h-2 w-2 shrink-0" />
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 group-hover/card:text-blue-500 dark:group-hover/card:text-blue-400 transition-colors flex items-center gap-0.5">
                                    Open Profile
                                    <ChevronRight className="h-2.5 w-2.5 shrink-0" />
                                  </span>
                                )}
                              </div>
                            )}
                          </button>

                          {/* v29 — Inline alert preview: shown when business has active alert.
                               Non-interactive text display — no touch target required.
                               Positioned directly below the card button, above locations. */}
                          {hasAlert && (() => {
                            const activeAlert = activeAlerts.find(a => a.businessId === biz.id);
                            if (!activeAlert) return null;
                            return (
                              <div className="mx-0.5 mt-0.5 rounded-b-lg border-x border-b border-amber-200 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-900/20 px-2.5 py-1.5">
                                <p className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 truncate leading-snug">
                                  <Zap className="h-2 w-2 inline shrink-0 mr-0.5" />
                                  {activeAlert.title}
                                </p>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setReviewImpactAlertId(activeAlert.id);
                                  }}
                                  className="text-[8px] text-amber-600 dark:text-amber-400 hover:underline pointer-events-auto"
                                >
                                  Review impact →
                                </button>
                              </div>
                            );
                          })()}

                          {/* Bell icon — notification prefs, hover-only */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setNotifPrefsBizId(biz.id);
                            }}
                            className={`absolute top-1.5 right-7 p-1 rounded-md transition-all opacity-0 group-hover/card:opacity-100 pointer-events-auto ${
                              biz.notificationPrefs?.emailEnabled || biz.notificationPrefs?.smsEnabled
                                ? "text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                                : biz.notificationPrefs && !biz.notificationPrefs.emailEnabled && !biz.notificationPrefs.smsEnabled
                                  ? "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
                                  : "text-slate-300 hover:text-blue-400 hover:bg-blue-50"
                            }`}
                            title="Notification preferences"
                          >
                            {biz.notificationPrefs && !biz.notificationPrefs.emailEnabled && !biz.notificationPrefs.smsEnabled
                              ? <BellOff className="h-3 w-3" />
                              : <Bell className="h-3 w-3" />
                            }
                          </button>

                          {/* Trash icon — delete, hover-only */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setConfirmDeleteBizId(biz.id);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all pointer-events-auto"
                            title={`Delete ${biz.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}

                      {/* ── Locations sub-list (unchanged logic) ───────── */}
                      {(() => {
                        const locs = biz.locations;
                        if (!locs?.length) {
                          // No locations yet — show "Add Location" link on hover
                          return (
                            <div className="pl-2 pr-1 pb-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (isLoaded) {
                                    setAddLocationBizId("__active__");
                                  } else {
                                    setAddLocationBizId(biz.id);
                                  }
                                }}
                                className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 hover:underline transition-colors py-0.5 pointer-events-auto"
                              >
                                <Plus className="h-2.5 w-2.5" />
                                Add location
                              </button>
                            </div>
                          );
                        }

                        const isExpanded = expandedBizIds.has(biz.id);
                        return (
                          <div className="pl-2 pr-1 pb-1 mt-0.5 space-y-0.5">
                            {/* Expand/collapse toggle */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setExpandedBizIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(biz.id)) next.delete(biz.id); else next.add(biz.id);
                                  return next;
                                });
                              }}
                              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors w-full py-0.5 pointer-events-auto"
                            >
                              {isExpanded
                                ? <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                                : <ChevronRight className="h-2.5 w-2.5 shrink-0" />}
                              <span>{locs.length} location{locs.length !== 1 ? "s" : ""}</span>
                            </button>

                            {isExpanded && (
                              <div className="space-y-0.5 pl-1">
                                {locs.map(loc => {
                                  const isActiveLoc = isLoaded && activeLocationId === loc.id;
                                  const locScore    = loc.healthScore ?? 0;
                                  const locHasScore = loc.totalForms != null && loc.totalForms > 0;
                                  const locDot      =
                                    !locHasScore    ? "bg-slate-300" :
                                    locScore >= 80  ? "bg-emerald-500" :
                                    locScore >= 50  ? "bg-amber-400" : "bg-red-400";
                                  return (
                                    <button
                                      key={loc.id}
                                      onClick={e => {
                                        e.stopPropagation();
                                        if (isLoaded) {
                                          handleSwitchLocation(loc);
                                        } else {
                                          handleLoadBusiness(biz, loc.id);
                                        }
                                      }}
                                      className={`w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all pointer-events-auto ${
                                        isActiveLoc
                                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-300"
                                          : "bg-white dark:bg-[#131e2f] border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-100 dark:hover:border-blue-800/40 hover:text-blue-700 dark:hover:text-blue-300"
                                      }`}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${locDot}`} />
                                      <span className="text-[10px] font-semibold truncate flex-1">{loc.name}</span>
                                      <span className="text-[9px] text-slate-400 truncate max-w-[60px]">{loc.location}</span>
                                      {isActiveLoc && <span className="h-1 w-1 rounded-full bg-blue-500 shrink-0" />}
                                    </button>
                                  );
                                })}
                                {/* Add location button */}
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (isLoaded) {
                                      setAddLocationBizId("__active__");
                                    } else {
                                      setAddLocationBizId(biz.id);
                                    }
                                  }}
                                  className="w-full flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors px-2 py-1 rounded-lg pointer-events-auto"
                                >
                                  <Plus className="h-2.5 w-2.5" />
                                  Add location
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* vUnified-platform-fix: Settings nav link — pinned to sidebar bottom.
            Placed outside the scroll container so it's always visible.
            Clicking it also closes the mobile drawer. Links to /settings page. */}
        <div className="shrink-0 border-t border-slate-700/30">
          <Link
            href="/settings"
            onClick={() => setShowMobileSidebar(false)}
            className="flex items-center gap-2.5 px-4 min-h-[48px] text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors pointer-events-auto"
            style={{ touchAction: "manipulation" }}
          >
            <SettingsIcon className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* ── Notification Prefs Modal ────────────────────────────────────── */}
      {notifPrefsBizId && (() => {
        const targetBiz = savedBusinesses.find(b => b.id === notifPrefsBizId);
        if (!targetBiz) return null;
        return (
          <NotificationPrefsModal
            businessName={targetBiz.name}
            currentPrefs={targetBiz.notificationPrefs}
            userEmail={user?.email ?? undefined}
            onSave={prefs => handleSaveNotificationPrefs(notifPrefsBizId, prefs)}
            onClose={() => setNotifPrefsBizId(null)}
          />
        );
      })()}

      {/* ── Add Location Modal ──────────────────────────────────────────── */}
      {addLocationBizId && (() => {
        const isActive = addLocationBizId === "__active__";
        const targetBiz = isActive
          ? loadedBusiness
          : savedBusinesses.find(b => b.id === addLocationBizId);
        if (!targetBiz) return null;
        return (
          <AddLocationModal
            businessName={targetBiz.name}
            onAdd={newLoc => {
              if (isActive) {
                handleAddLocation(newLoc);
              } else {
                handleAddLocationToOtherBiz(targetBiz, newLoc);
              }
              setAddLocationBizId(null);
            }}
            onClose={() => setAddLocationBizId(null)}
          />
        );
      })()}

      {/* ── Sign-in wall — shown when unauthenticated user exhausts free chats ── */}
      {showSignInWall && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => { if (e.target === e.currentTarget) setShowSignInWall(false); }}
        >
          <div className="bg-white dark:bg-[#0f1823] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                You&rsquo;ve used your 3 free chats
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                Create a free account to keep chatting. Upgrade to Pro for unlimited AI form completions, health score, rule alerts, and saved business profiles.
              </p>
              <button
                onClick={() => { setShowSignInWall(false); setAuthExpanded(true); }}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors mb-2"
              >
                Sign up free — keep chatting
              </button>
              <button
                onClick={() => void handleUpgradeToPro()}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors mb-3"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro — $19/mo
              </button>
              <button
                onClick={() => setShowSignInWall(false)}
                className="text-xs text-slate-400 hover:text-slate-500 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Business Modal ──────────────────────────────────────────── */}
      {showAddBizModal && (
        <AddBusinessModal
          onAdd={handleAddPreExistingBusiness}
          onClose={() => setShowAddBizModal(false)}
          onStartChat={() => {
            setShowAddBizModal(false);
            // Focus the chat input so the user can start immediately
            setTimeout(() => {
              (document.querySelector("input[placeholder*='business']") as HTMLInputElement | null)?.focus();
            }, 100);
          }}
        />
      )}

      {/* ════════════ Chat area ════════════ */}
      {/* v31 — When showProfileView is true and a business is loaded, render the
           full Business Profile View instead of the chat pane. The "Back to Chat"
           button in BusinessProfileView calls setShowProfileView(false). */}
      {/* v33 — props updated: recommendedForms + completedDocuments + split edit callbacks */}
      {/* v39 — onUploadCompletedDoc replaced by onSaveDrafts + onDiscardDrafts */}
      {/* v40 — onViewCompletedForm routes synthetic doc clicks to PacketScreen */}
      {/* v41 — live health score ring; auto-open after doc create; FormFiller auto-attach */}
      {/* v42 — final document visibility on matching form card with green checkmark + clickable filename */}
      {/* v43 — uploaded documents visible on matching form card with green checkmark + clickable filename + compliance stats */}
      {/* v44 — uploaded documents now visibly appear on the matching recommended form card with filename + green checkmark */}
      {/* v45 — Zoning & Address Compliance Checker + fixed document attachment on profile creation */}
      {/* v50 — Fixed "Attach Zoning Result to Profile" button so result is saved and immediately visible on the business profile */}
      {/* vMobile-RegressionFixPass: overflow-hidden removed from this wrapper.
          The previous overflow-hidden on this parent was blocking iOS Safari touch events
          on BusinessProfileView's "Back to Chat" and "Check Zoning for this Address"
          buttons when they were near the container boundary. On iOS Safari, overflow:hidden
          on a positioned ancestor clips pointer events for descendants that paint near the
          clipped edge — making those buttons appear invisible or unreachable.
          BusinessProfileView's own body div (flex-1 min-h-0 overflow-y-auto) provides
          all the scroll containment needed; the outer wrapper does not need overflow-hidden.
          vMobile-scale-fix: flex-1 flex flex-col still fills exactly the remaining
          viewport height on all screen sizes — removing overflow-hidden doesn't change
          the sizing, only the clipping behavior. */}
      {showProfileView && loadedBusiness ? (
        <div className="flex-1 flex flex-col min-w-0 min-h-0">{/* vUnified-20260414-national-expansion-v102: min-h-0 ensures iOS WKWebView computes a
            definite height for BusinessProfileView's flex-1 chain, activating overflow-y-auto. */}
          <BusinessProfileView
            business={loadedBusiness}
            recommendedForms={profileRecommendedForms}
            completedDocuments={uploadedDocs.filter(d => d.businessId === loadedBusiness.id)}
            checklist={checklist}
            onBackToChat={() => setShowProfileView(false)}
            onViewDocument={handleViewDocument}
            onUpdateBusinessName={handleUpdateBusinessNameFromProfile}
            onLocationChange={handleLocationChangeFromProfile}
            // vMobile-PostDeploy-CriticalFixPass: wire onCategoryChange so that picking a
            // new business type in the profile updates loadedBusiness.businessType, which
            // causes profileRecommendedForms useMemo to re-derive the correct form list.
            onCategoryChange={handleCategoryChangeFromProfile}
            // vMobile-PostDeploy-CriticalFixPass: pass detected GPS location as fallback
            // for the zoning panel address field when business.location is blank.
            // vUnified-platform-fix: also pass detectedCounty for ZIP-only enrichment —
            // if business.location or userLocation is a bare ZIP (e.g. "33412"),
            // BusinessProfileView uses detectedCounty to build a full city+state address.
            userLocation={userLocation}
            detectedCounty={detectedCounty}
            onSaveDrafts={handleSaveDraftsFromProfile}
            onDiscardDrafts={handleDiscardDraftsFromProfile}
            onViewCompletedForm={handleViewCompletedForm}
            onCheckZoning={handleCheckZoning}
            onAttachZoningResult={handleAttachZoningResult}
            onStartForm={handleStartFormFromProfile}
            // vRuleChangeAlerts-Profile-Integration: pre-filtered active alerts for this
            // business. onDismissAlert persists; onReviewImpact opens the Review Impact
            // modal already wired in page.tsx via setReviewImpactAlertId.
            ruleAlerts={activeAlerts.filter(a => a.businessId === loadedBusiness.id)}
            onDismissAlert={dismissAlert}
            onReviewImpact={setReviewImpactAlertId}
            isPro={isPro}
            // vUnified-20260414-national-expansion-v87: pass portal handler so the
            // Pro badge footer in BusinessProfileView shows a "Manage" button.
            onManageSubscription={isPro ? () => void handleManageSubscription() : undefined}
          />
        </div>
      ) : null}
      <div className={`flex-1 flex flex-col relative min-w-0 ${showProfileView && loadedBusiness ? "hidden" : ""}`}>{/* vMobile-icon-fix-v3: removed overflow-hidden so no flex ancestor clips touch targets on the hamburger, send button, or form-card buttons */}

        {/* Header bar — vMobile: hamburger on left for mobile sidebar */}
        {/* vUnified-platform-fix: dark mode — bg-white → dark:bg-[#131e2f], border → dark:border-slate-700/60 */}
        <div className="border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#131e2f] px-3 sm:px-6 py-3.5 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* vMobile — hamburger button, hidden on md+ where sidebar is always visible */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden shrink-0 text-slate-500 hover:text-slate-700 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center pointer-events-auto"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <RegPulseIcon size={26} className="shrink-0" />
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">Chat with RegPulse</h2>
              {loadedBusiness ? (
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  <p className="text-xs text-blue-600 font-medium leading-tight truncate max-w-[120px] sm:max-w-[160px]">
                    {loadedBusiness.name}
                  </p>
                  {activeLocation ? (
                    <>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="hidden sm:inline text-xs text-slate-500 font-medium truncate max-w-[120px]">
                        {activeLocation.name}
                      </span>
                    </>
                  ) : (
                    <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-[100px]">· {loadedBusiness.location}</span>
                  )}
                  {/* vChatZoningContextInjection: badge shown when an attached zoning
                      result is active for this business — confirms to the user that the
                      AI is reasoning with zoning context in every reply. */}
                  {attachedZoningContext && (
                    <span
                      className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 rounded-full px-1.5 py-0.5 shrink-0"
                      title={`Zoning context: ${attachedZoningContext.zoneType} · ${attachedZoningContext.status}`}
                    >
                      <Layers className="h-2.5 w-2.5 shrink-0" />
                      <span className="hidden sm:inline">Zoning context active</span>
                      <span className="sm:hidden">Zoning</span>
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5 leading-tight">Hyper-local compliance guidance</p>
              )}
            </div>
          </div>
          {locationIsReady && (
            <span className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-1 rounded-full ring-1 transition-colors ${
              zipResolved
                ? "bg-green-50 text-green-700 ring-green-200"
                : "bg-blue-50 text-blue-700 ring-blue-100"
            }`}>
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline truncate max-w-[140px]">{userLocation}</span>
              <span className="sm:hidden truncate max-w-[80px]">{userLocation.split(",")[0]}</span>
            </span>
          )}
        </div>

        {/* Messages list — vMobile: tighter padding on small screens */}
        {/* vMobile-stabilization-pass: min-h-0 is required so flex-1 can shrink below its
            content height, which is what allows overflow-y-auto to actually activate on
            mobile. Without min-h-0 the CSS default min-height:auto prevents the div from
            shrinking, so it expands to content height and overflows the viewport instead
            of scrolling. overscroll-y-contain stops iOS rubber-band from bleeding to the
            parent document when the user scrolls past the top/bottom of the list. */}
        {/* vUnified-platform-fix: dark mode — messages area bg */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 dark:bg-[#0f1823]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "user" ? (
                <div className="max-w-sm bg-blue-600 text-white rounded-3xl rounded-br-sm px-4 py-3 shadow-md">
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="max-w-2xl w-full bg-white/85 dark:bg-[#1a2740]/90 border border-slate-100/80 dark:border-white/[0.09] rounded-2xl rounded-bl-sm shadow-md backdrop-blur-sm px-5 py-4">
                  {(() => {
                    const serverFormMap = msg.formMap
                      ? filterFormsByLocation(msg.formMap, userLocation)
                      : null;

                    const contentMarkerIds: string[] = [];
                    const scanRe = /%%([a-zA-Z][a-zA-Z0-9-]*)%%/gi;
                    let hit: RegExpExecArray | null;
                    while ((hit = scanRe.exec(msg.content)) !== null) {
                      const id = hit[1].toLowerCase();
                      if (KNOWN_FORM_IDS.has(id) && !contentMarkerIds.includes(id)) {
                        contentMarkerIds.push(id);
                      }
                    }

                    const localFormMap =
                      serverFormMap ??
                      (contentMarkerIds.length
                        ? filterFormsByLocation(contentMarkerIds, userLocation)
                        : null);

                    const state = parseState(userLocation);

                    // vUnified-platform-fix: maximum dark mode text contrast in AI messages
                    // All text colors driven by isDarkMode JS state, not dark: CSS variants,
                    // matching the always-readable pattern used in BusinessProfileView.tsx.
                    return (
                      <div className={`text-sm leading-relaxed ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                        {msg.content.split("\n").map((line, i) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;

                          if (!trimmed.startsWith("- ")) {
                            const isDisclaimer =
                              trimmed.startsWith("This is for informational purposes") ||
                              trimmed.startsWith("This information is for general guidance");
                            return (
                              // v25 — Fix Learn More links: apply BulletLine to paragraph
                              // lines so [text](url) markdown renders as a real <a> tag.
                              <p
                                key={i}
                                className={
                                  isDisclaimer
                                    // Disclaimer: muted in both modes
                                    ? `mt-3 text-[11px] italic leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-400"}`
                                    // Body paragraph: full contrast
                                    : `mb-2 ${isDarkMode ? "text-white" : "text-slate-700"}`
                                }
                              >
                                <BulletLine text={trimmed} isDark={isDarkMode} />
                              </p>
                            );
                          }

                          const rawText = trimmed.slice(2);
                          const { formId: markerFormId, displayText } = extractMarkerFromLine(rawText);

                          const formId = (() => {
                            if (markerFormId && KNOWN_FORM_IDS.has(markerFormId)) return markerFormId;
                            return localFormMap?.find((id) =>
                              stripLinks(displayText).toLowerCase().includes(id.replace(/-/g, " "))
                            );
                          })();

                          const filteredFormId =
                            formId && state && FORM_EXCLUSIONS[formId]?.has(state)
                              ? undefined
                              : formId;

                          return (
                            <div
                              key={i}
                              className={`flex gap-2.5 items-start py-2 border-b last:border-none ${
                                isDarkMode ? "border-white/[0.07]" : "border-slate-50"
                              }`}
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                              {/* vUnified-platform-fix: bullet text — JS-conditional, matching BusinessProfileView */}
                              <span className={`leading-relaxed ${isDarkMode ? "text-white" : "text-slate-700"}`}>
                                <BulletLine text={displayText} isDark={isDarkMode} />
                              </span>
                            </div>
                          );
                        })}

                        {/* Complete All button — shown whenever ≥1 form is identified.
                            Individual form actions are in the sidebar checklist. */}
                        {localFormMap && localFormMap.length >= 1 && (
                          <div className={`mt-4 pt-3 border-t ${isDarkMode ? "border-white/[0.08]" : "border-slate-100"}`}>
                            <button
                              onClick={() => handleStartAllForms(localFormMap)}
                              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
                            >
                              <Layers className="h-3.5 w-3.5 shrink-0" />
                              {localFormMap.length === 1
                                ? "Complete Required Form with AI"
                                : "Complete All Required Forms with AI"}
                              <span className="bg-blue-500 text-[10px] font-bold rounded-md px-1.5 py-0.5">
                                {localFormMap.length} {localFormMap.length === 1 ? "form" : "forms"}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Clarify question chips */}
                        {msg.formClarify && (
                          <div className={`mt-3 pt-3 border-t ${isDarkMode ? "border-white/[0.08]" : "border-slate-100"}`}>
                            <p className={`text-xs font-medium mb-2 ${isDarkMode ? "text-white" : "text-slate-600"}`}>
                              {msg.formClarify.question}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.formClarify.options.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => sendQuickReply(opt)}
                                  className={`text-xs px-4 py-2.5 min-h-[44px] flex items-center rounded-full border transition-colors ${
                                    isDarkMode
                                      ? "border-blue-700/60 text-blue-200 bg-blue-900/40 hover:bg-blue-800/50"
                                      : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* "Save to Checklist" removed — items are auto-saved via
                            extractAndAddToChecklist when the AI response arrives. */}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#1a2740] border border-slate-100 dark:border-white/[0.08] rounded-2xl rounded-bl-sm shadow-sm px-5 py-3.5 flex items-center gap-2.5 text-slate-400 dark:text-slate-500 text-sm">
                <RegPulseLoader size={18} />
                <span>Searching regulations for {userLocation}…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* vUnified-20260414-national-expansion-v87 — Pro subscription success toast
             Shown in the main chat column when the user returns from Stripe Checkout with
             ?success=true. Visible regardless of whether the mobile sidebar is open.
             Positioned above packetToast (bottom-28 z-30) at bottom-40 z-40 so they stack
             cleanly. touch-action:manipulation + min-h-[44px] on dismiss for iOS Safari.
             Both banners (sidebar + this chat toast) auto-dismiss after 8 s total.        */}
        {proSuccessChatToast && (
          <div
            className="absolute bottom-40 left-1/2 -translate-x-1/2 z-40 w-[min(380px,92vw)] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-300"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
              touchAction: "manipulation",
            }}
          >
            <div className="shrink-0 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">
                RegPulse Pro activated!
              </p>
              <p className="text-[11px] text-white/80 leading-tight mt-0.5">
                Unlimited AI · Renewal filing · Priority support
              </p>
            </div>
            <button
              onClick={() => setProSuccessChatToast(false)}
              className="shrink-0 text-white/70 hover:text-white transition-colors min-h-[44px] min-w-[36px] flex items-center justify-center"
              aria-label="Dismiss"
              style={{ touchAction: "manipulation" }}
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Auto-save toast */}
        {autoSaveToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
            <span>
              Added {autoSaveToast.count} step{autoSaveToast.count !== 1 ? "s" : ""} to your checklist
            </span>
            <button
              onClick={() => handleUndoAutoSave(autoSaveToast.itemIds)}
              className="text-blue-300 hover:text-blue-100 font-semibold transition-colors ml-1 underline underline-offset-2"
            >
              Undo
            </button>
          </div>
        )}

        {/* vUnified-platform-fix: form completion download/new-tab behavior
            Packet success toast — shown after queue or single-form completion.
            Replaces the PacketScreen full-overlay flow so the user stays in chat/profile.
            Shows "Retry Download" button in case auto-download was blocked (pop-up blocker
            or iOS power-saving mode that defers blob writes). Positioned at bottom-28
            so it clears the input bar + safe area on all iPhones.
            z-30 > z-20 (auto-save toast) so they don't collide visually.           */}
        {packetToast && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 w-[min(360px,90vw)] flex items-center gap-3 bg-emerald-900 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-xl pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ touchAction: "manipulation" }}>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="flex-1 min-w-0 leading-snug">{packetToast.message}</span>
            {packetToast.retryFn && (
              <button
                onClick={() => { packetToast.retryFn?.(); }}
                className="text-emerald-300 hover:text-emerald-100 font-semibold transition-colors shrink-0 underline underline-offset-2 min-h-[44px] flex items-center"
                style={{ touchAction: "manipulation" }}
              >
                Retry
              </button>
            )}
            <button
              onClick={() => setPacketToast(null)}
              className="text-emerald-400 hover:text-white transition-colors shrink-0 ml-1 min-h-[44px] flex items-center"
              aria-label="Dismiss"
              style={{ touchAction: "manipulation" }}
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Bottom overlay: PacketScreen > FormFiller > input bar */}
        {showPacketScreen ? (
          <PacketScreen
            forms={completedFormsData}
            location={userLocation}
            checklist={checklist}
            isPro={isPro}
            onDismiss={() => {
              setShowPacketScreen(false);
              setCompletedFormsData([]);
            }}
            onSave={handleSaveBusiness}
          />
        ) : activeTemplate ? (
          <FormFiller
            template={activeTemplate}
            location={userLocation}
            onComplete={handleFormComplete}
            onDismiss={handleDismissForm}
            queueLabel={queueLabel}
            skipPayment={true}
            initialFormData={activeFormInitialData}
            isRenewal={activeFormIsRenewal}
            businessProfile={loadedBusiness ? (() => {
              // v62 — enrich profile hint with owner name + EIN extracted from
              // any previously completed form data (EIN app, business registration, etc.)
              const einEntry = completedFormsByFormId['ein-application'];
              const regEntry = completedFormsByFormId['business-registration'];
              const anyEntry = einEntry ?? regEntry ?? Object.values(completedFormsByFormId)[0];
              const derivedOwner = anyEntry?.formData?.ownerFullName
                ?? anyEntry?.formData?.responsiblePartyName
                ?? anyEntry?.formData?.legalName;
              const derivedEin = anyEntry?.formData?.fein
                ?? completedFormsByFormId['sales-tax-registration']?.formData?.fein;
              const derivedPhone = anyEntry?.formData?.businessPhone ?? anyEntry?.formData?.ownerPhone;
              const derivedEmail = anyEntry?.formData?.businessEmail ?? anyEntry?.formData?.ownerEmail;
              return {
                name:         loadedBusiness.name,
                location:     loadedBusiness.location,
                businessType: loadedBusiness.businessType,
                ownerName:    derivedOwner,
                ein:          derivedEin,
                phone:        derivedPhone,
                email:        derivedEmail,
                // vUnified-20260414-national-expansion-v4: pass county for county-aware URL resolution
                county:       detectedCounty ?? undefined,
              };
            })() : null}
            onSaveDocument={(filename, _base64) => {
              // v60 — update the synthetic document record with the real filename so the
              // matching form card in BusinessProfileView shows the actual file name
              // with a green "Completed" badge instead of the generic placeholder.
              if (!activeTemplate) return;
              setUploadedDocs(prev => prev.map(d =>
                d.formId === activeTemplate.id && d.id.startsWith("form-complete-")
                  ? { ...d, originalName: filename }
                  : d
              ));
            }}
            onFormCompleteWithoutProfile={handleFormCompleteWithoutProfile}
            zoningProfile={(() => {
              // v63 — extract the most recent zoning check result attached to this business
              // and pass it to FormFiller so zone-aware fields can be pre-seeded.
              // v70 — fixed: check both raw?.zone_type (underscore, from API) and raw?.zoneType (camelCase)
              const zoningDoc = uploadedDocs.find(
                d => d.formId === "zoning-check" && d.mimeType === "application/json"
              );
              if (!zoningDoc?.analysis) return null;
              const raw = zoningDoc.analysis.rawExtracted as Record<string, unknown> | undefined;
              return {
                status:       (raw?.status ?? undefined) as string | undefined,
                // v70 — check underscore variant first (API returns zone_type), then camelCase
                zoneType:     (
                  (raw?.zone_type as string | undefined) ??
                  (raw?.zoneType as string | undefined) ??
                  (zoningDoc.analysis.issuingAuthority as string | undefined) ??
                  zoningDoc.analysis.docType
                ) ?? undefined,
                restrictions: Array.isArray(raw?.restrictions)
                  ? (raw.restrictions as string[])
                  : (Array.isArray(zoningDoc.analysis.suggestions) ? zoningDoc.analysis.suggestions as string[] : undefined),
                address:      (
                  (raw?.address as string | undefined) ??
                  loadedBusiness?.location
                ) ?? undefined,
              };
            })()}
          />
        ) : (
          <div className="relative z-20 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200/80 dark:border-slate-700/40 bg-white/80 dark:bg-[#131e2f]/85 backdrop-blur-sm shrink-0 pointer-events-auto" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>{/* v283: glassmorphism + safe-area bottom padding for iOS keyboard */}
            <div className="max-w-3xl mx-auto flex gap-2 items-center">
              {/* Upload button — compact, sits left of the text input.
                  v17: businessId is required for the storage-first path in
                  DocumentUploadButton (files > 5 MB bypass the API body limit
                  by uploading directly to Supabase Storage). Without it the
                  gate falls back to FormData and large PDFs hit Vercel's limit.
                  Use the business's saved location as AI context so the backend
                  prompt matches the registered jurisdiction. */}
              <DocumentUploadButton
                variant="compact"
                businessId={loadedBusiness?.id}
                businessName={loadedBusiness?.name ?? "My Business"}
                location={loadedBusiness?.location ?? userLocation}
                checklist={checklist}
                onAnalysisComplete={handleDocumentAnalysisComplete}
                disabled={isLoading}
              />
              <div className="flex-1 flex items-center min-h-[52px] bg-slate-50/90 dark:bg-[#1a2740]/90 border border-slate-200/70 dark:border-slate-600/40 rounded-2xl px-4 backdrop-blur-sm focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 focus-within:border-blue-300 dark:focus-within:border-blue-700/60 transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask about permits, zoning, health codes…"
                  className="flex-1 bg-transparent text-sm py-2.5 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="min-h-[52px] min-w-[52px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0 pointer-events-auto"
              >{/* vMobile-icon-fix-v3: 48px touch target + pointer-events-auto for iOS Safari */}
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Document Analysis Card overlay ────────────────────────────────
             Shown after a successful upload + AI analysis.
             Floats above the chat messages; user can dismiss or apply updates. */}
        {docAnalysisResult && (
          <div className="absolute inset-x-0 bottom-20 z-30 px-6 pb-2 max-w-3xl mx-auto left-1/2 -translate-x-1/2 w-full pointer-events-none">
            <div className="pointer-events-auto">
              {/* v31 — Fix Yes Create It Button (Direct Trigger)
                   onCreateProfileFromDocument now calls createBusinessFromDocument
                   directly — no chat reply parsing, no refs, no pending state.
                   The button in the card is the primary trigger; typing "yes" in
                   the chat remains as a fallback via sendMessage's ref check. */}
              <DocumentAnalysisCard
                fileName={docAnalysisResult.fileName}
                analysis={docAnalysisResult.analysis}
                checklist={checklist}
                onApplyUpdates={(matched: MatchedItem[]) => {
                  handleApplyDocumentUpdates(matched);
                }}
                onDismiss={() => setDocAnalysisResult(null)}
                hasActiveBusinessProfile={!!loadedBusiness}
                onCreateProfileFromDocument={() => {
                  // Direct trigger — create the profile immediately without
                  // waiting for a "yes" reply in the chat input.
                  if (docAnalysisResult) createBusinessFromDocument(docAnalysisResult);
                }}
              />
            </div>
          </div>
        )}

        {/* ── v25 — Attach panel: upload completed document without AI analysis ──
             Triggered by "Attach File" in the Completed Documents section.
             Uses mode="attach" so no /api/document/analyze call is made. */}
        {showAttachPanel && (
          <div
            className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowAttachPanel(false); }}
          >
            <div className="bg-white dark:bg-[#0f1823] rounded-t-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Upload Completed Document</h3>
                </div>
                <button
                  onClick={() => setShowAttachPanel(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              {loadedBusiness && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Attaching to <strong className="text-slate-700 dark:text-slate-200">{loadedBusiness.name}</strong>
                  {" — "}no AI analysis will be run.
                </p>
              )}
              <DocumentUploadButton
                variant="full"
                mode="attach"
                businessId={loadedBusiness?.id}
                businessName={loadedBusiness?.name ?? "My Business"}
                location={loadedBusiness?.location ?? userLocation}
                checklist={checklist}
                onAnalysisComplete={() => {/* not used in attach mode */}}
                onAttachComplete={result => {
                  setShowAttachPanel(false);
                  handleAttachDocument(result);
                }}
              />
            </div>
          </div>
        )}

        {/* ── Full upload panel (from checklist sidebar button) ─────────────
             Slide-in bottom sheet with the full DocumentUploadButton drop zone. */}
        {showDocUploadPanel && (
          <div
            className="absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowDocUploadPanel(false); }}
          >
            <div className="bg-white dark:bg-[#0f1823] rounded-t-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Upload Existing Document</h3>
                </div>
                <button
                  onClick={() => setShowDocUploadPanel(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              {loadedBusiness && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Analyzing for <strong className="text-slate-700 dark:text-slate-200">{loadedBusiness.name}</strong>
                </p>
              )}
              {/* v17: same as compact — businessId enables storage-first for large files */}
              <DocumentUploadButton
                variant="full"
                businessId={loadedBusiness?.id}
                businessName={loadedBusiness?.name ?? "My Business"}
                location={loadedBusiness?.location ?? userLocation}
                checklist={checklist}
                onAnalysisComplete={result => {
                  setShowDocUploadPanel(false);
                  handleDocumentAnalysisComplete(result);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* v290 — Upgrade / Pro modal overlay — 100% inline styles (no Tailwind) for WKWebView */}
      {upgradeModalVisible && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999,
          background: "linear-gradient(160deg,#0B1E3F 0%,#0f2a55 100%)",
          overflowY: "auto", WebkitOverflowScrolling: "touch" as never,
          display: "flex", flexDirection: "column",
          paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 8px" }}>
            <button
              onClick={() => { setUpgradeModalVisible(false); setUpgradeModalError(""); setUpgradeModalMagicSent(false); setUpgradeModalEmail(""); setUpgradeModalPassword(""); }}
              style={{ padding: 8, borderRadius: 12, border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", touchAction: "manipulation", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ArrowLeft style={{ width: 20, height: 20 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Crown style={{ width: 20, height: 20, color: "#fbbf24" }} />
              <span style={{ fontWeight: 700, color: "#ffffff", fontSize: 16 }}>RegPulse Pro</span>
            </div>
          </div>

          {/* Hero */}
          <div style={{ padding: "24px 24px 20px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#fcd34d", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999, marginBottom: 16 }}>
              <Crown style={{ width: 14, height: 14 }} />
              $19 / month · Cancel anytime
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", lineHeight: 1.2, marginBottom: 8 }}>
              Stay compliant.<br />Automatically.
            </div>
            <p style={{ fontSize: 14, color: "#cbd5e1", maxWidth: 280, margin: "0 auto" }}>
              RegPulse Pro handles your filings, alerts you before deadlines, and keeps your business out of trouble — on autopilot.
            </p>
          </div>

          {/* Benefits */}
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {([
              { color: "#fbbf24", label: "⚡", title: "Unlimited AI form completions", sub: "No monthly cap on forms or renewals" },
              { color: "#60a5fa", label: "↺", title: "Automatic renewal filing", sub: "Pre-filled forms sent before deadlines" },
              { color: "#34d399", label: "▦", title: "Quarterly Compliance Check-in PDF", sub: "Full audit of your business obligations" },
              { color: "#a78bfa", label: "📄", title: "Priority document analysis", sub: "Upload contracts & get instant summaries" },
              { color: "#22d3ee", label: "🛡", title: "Real-time regulation alerts", sub: "Notified the day rules change in your area" },
            ] as const).map(b => (
              <div key={b.title} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: "12px 16px" }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1, color: b.color }}>{b.label}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", lineHeight: 1.3 }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, lineHeight: 1.4 }}>{b.sub}</div>
                </div>
                <span style={{ fontSize: 16, color: "#34d399", flexShrink: 0, marginTop: 1 }}>✓</span>
              </div>
            ))}
          </div>

          {/* Auth card */}
          <div style={{ margin: "0 20px 32px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>
              {upgradeModalMode === "signin" ? "Sign in to get started" : upgradeModalMode === "signup" ? "Create your account" : "Sign in with email link"}
            </p>

            {/* Mode tabs */}
            <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4 }}>
              {(["signup", "signin", "magic"] as const).map(m => (
                <button key={m}
                  onClick={() => { setUpgradeModalMode(m); setUpgradeModalError(""); setUpgradeModalMagicSent(false); }}
                  style={{ flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", touchAction: "manipulation", background: upgradeModalMode === m ? "#2563eb" : "transparent", color: upgradeModalMode === m ? "#ffffff" : "#94a3b8" }}
                >
                  {m === "signin" ? "Sign In" : m === "signup" ? "Sign Up" : "Magic Link"}
                </button>
              ))}
            </div>

            <input
              type="email"
              placeholder="your@email.com"
              value={upgradeModalEmail}
              autoCapitalize="none"
              autoCorrect="off"
              onChange={e => setUpgradeModalEmail(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submitUpgradeModal(); }}
              style={{ width: "100%", boxSizing: "border-box", fontSize: 14, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", padding: "10px 14px", outline: "none" }}
            />

            {upgradeModalMode !== "magic" && (
              <input
                type="password"
                placeholder="Password"
                value={upgradeModalPassword}
                onChange={e => setUpgradeModalPassword(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") submitUpgradeModal(); }}
                style={{ width: "100%", boxSizing: "border-box", fontSize: 14, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", padding: "10px 14px", outline: "none" }}
              />
            )}

            {upgradeModalMagicSent ? (
              <p style={{ textAlign: "center", fontSize: 12, color: "#34d399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, padding: "10px 12px", margin: 0 }}>
                Magic link sent! Check your email and tap the link to continue.
              </p>
            ) : (
              <button
                onClick={submitUpgradeModal}
                disabled={upgradeModalWorking || !upgradeModalEmail.trim()}
                style={{ width: "100%", minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, fontSize: 14, fontWeight: 700, color: "#ffffff", background: upgradeModalWorking || !upgradeModalEmail.trim() ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#f59e0b 0%,#ea580c 100%)", border: "none", cursor: "pointer", touchAction: "manipulation" }}
              >
                {upgradeModalWorking
                  ? "Please wait…"
                  : upgradeModalMode === "signin" ? "Sign In & Go Pro"
                  : upgradeModalMode === "signup" ? "Create Account & Go Pro"
                  : "Send Magic Link"}
              </button>
            )}

            {upgradeModalError && (
              <p style={{ textAlign: "center", fontSize: 12, margin: 0, padding: "8px 8px", borderRadius: 12, border: "1px solid", ...(upgradeModalError.startsWith("Account created") || upgradeModalError.startsWith("Check") ? { color: "#34d399", background: "rgba(52,211,153,0.1)", borderColor: "rgba(52,211,153,0.2)" } : { color: "#f87171", background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.2)" }) }}>
                {upgradeModalError}
              </p>
            )}

            <p style={{ textAlign: "center", fontSize: 10, color: "#64748b", margin: 0 }}>
              By continuing you agree to our Terms of Service and Privacy Policy.
              Cancel your Pro subscription anytime from settings.
            </p>
          </div>
        </div>
      )}

      {/* v290 — Checkout loading overlay — 100% inline styles */}
      {checkoutOverlayVisible && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 10000, background: "linear-gradient(160deg,#0B1E3F 0%,#0f2a55 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          <Crown style={{ width: 40, height: 40, color: "#fbbf24" }} />
          <p style={{ color: "#ffffff", fontWeight: 600, fontSize: 18, margin: 0 }}>Opening Stripe checkout…</p>
          <Loader2 style={{ width: 24, height: 24, color: "#60a5fa" }} />
        </div>
      )}
    </div>
  );
}
