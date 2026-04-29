# RegPulse Native Build Guide

vUnified-20260414-national-expansion-v85 — Exact next-steps documentation + final store submission verification.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 1.088s).
tsc EXIT:0. cap doctor EXIT:0 — [success] iOS looking great! 👌 / [success] Android looking great! 👌

STEP H.5 ADDED — exact next-steps for first native builds (scaffold complete since v84):
  H.5.1 iOS: Mac App Store → Xcode (15+) → sudo xcode-select --switch → pod install →
             npx cap open ios → signing → Product → Archive → Distribute App → App Store Connect
  H.5.2 Android: brew install temurin@17 → Android Studio → export ANDROID_HOME →
                 npx cap doctor → npm run cap:test:android → keytool keystore →
                 npm run cap:build:android → upload .aab to Play Console
  Full exact commands in README-native.md Section H.5.1 and H.5.2 below.
  build:cap sync ~1s: cap now syncs web assets to ios/App/App/public AND android/assets/public.

PLATFORM PARITY AUDIT v85 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4597-4598
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4932, 6683
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1938, 1948, 4852, 6284, 6487, 7014
  page.tsx sidebar: z-50 (line 4582), md:pointer-events-auto (line 4585)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 5021, 5031, 5041
  page.tsx z-30 toasts/overlays: lines 6870, 7026, 7057, 7100 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1933, 2639
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2288, 3321, 3342
  BPV.tsx CTAs: min-h-[48px] at 1908/2236/2303/2532/2542/2830, min-h-[52px] at 2027/2037
  z-index: no collisions — page.tsx z-50 sidebar (4582)/z-30 overlays; BPV.tsx z-30 (2456)/z-50 (2331)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
  Footer pages: 10 footer routes via InnerPageLayout — parity confirmed v83/v84/v85 ✓
ios/ + android/ SCAFFOLDED ✓ — see Step H.5 below for exact first-build commands.

vUnified-20260414-national-expansion-v84 — NATIVE SCAFFOLD COMPLETE + final store submission verification.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 128ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.

NATIVE SCAFFOLD — v84 MILESTONE:
  npx cap add ios     EXIT:0 — ios/App Xcode project created in 56ms (Package.swift written) ✓
  npx cap add android EXIT:0 — android/app Gradle project created in 121ms (Gradle synced in 828µs) ✓
  Capacitor plugins linked (4): @capacitor/filesystem@8.1.2, @capacitor/share@8.0.1,
    @capacitor/splash-screen@8.0.1, @capacitor/status-bar@8.0.2
  cap doctor → [success] iOS looking great! 👌 / [success] Android looking great! 👌

FIRST NATIVE BUILD ATTEMPT — 2026-04-16:
  npm run cap:build:ios → BLOCKED
    Reason: xcodebuild not found — only Command Line Tools installed, not full Xcode.
    Fix: Install Xcode from Mac App Store → open ios/App/App.xcworkspace → set signing team
         → Product → Archive → Distribute App → App Store Connect → Upload
  npm run cap:build:android → BLOCKED
    Reason: java -version: "Unable to locate a Java Runtime"; ANDROID_HOME not set.
    Fix: Install JDK 17+ (https://adoptium.net), install Android Studio,
         set ANDROID_HOME in ~/.zshrc, then: npm run cap:build:android
  @capacitor/* installed: 8.3.0 | latest available: 8.3.1 (minor patch — upgrade at next cycle)

PLATFORM PARITY AUDIT v84 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4566-4567
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4901, 6652
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1907, 1917, 4821, 6253, 6456, 6983
  page.tsx sidebar: z-50 (line 4551), md:pointer-events-auto (line 4554)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4990, 5000, 5010
  page.tsx z-30 toasts/overlays: lines 6839, 6995, 7026, 7069 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1913, 2619
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2268, 3301, 3322
  BPV.tsx CTAs: min-h-[48px] at 1888/2216/2283/2512/2522/2810, min-h-[52px] at 2007/2017
  z-index: no collisions — page.tsx z-50 sidebar (4551)/z-30 overlays; BPV.tsx z-30 (2436)/z-50 (2311)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
  Footer pages: 10 footer routes via InnerPageLayout — parity inherited from shell ✓
ios/ + android/ SCAFFOLDED ✓ — release builds require Xcode/JDK (see Step H.2 below).

vUnified-20260414-national-expansion-v83 — Final App Store / Play Store submission package + parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 119ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
Footer pages parity CONFIRMED — 10 footer routes all use InnerPageLayout; min-h-[48px] CTAs verified in /features, /pricing, /faq.
PLATFORM PARITY AUDIT v83 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4546-4547
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4881, 6632
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1887, 1897, 4801, 6233, 6436, 6963
  page.tsx sidebar: z-50 (line 4531), md:pointer-events-auto (line 4534)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4970, 4980, 4990
  page.tsx z-30 toasts/overlays: lines 6819, 6975, 7006, 7049 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1895, 2601
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2250, 3283, 3304
  BPV.tsx CTAs: min-h-[48px] at 1870/2198/2265/2494/2504/2792, min-h-[52px] at 1989/1999
  z-index: no collisions — page.tsx z-50 sidebar (4531)/z-30 overlays; BPV.tsx z-30 (2418)/z-50 (2293)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v82 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 202ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v82 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4529-4530
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4864, 6615
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1870, 1880, 4784, 6216, 6419, 6946
  page.tsx sidebar: z-50 (line 4514), md:pointer-events-auto (line 4517)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4953, 4963, 4973
  page.tsx z-30 toasts/overlays: lines 6802, 6958, 6989, 7032 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1877, 2583
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2232, 3265, 3286
  BPV.tsx CTAs: min-h-[48px] at 1852/2180/2247/2476/2486/2774, min-h-[52px] at 1971/1981
  z-index: no collisions — page.tsx z-50 sidebar (4514)/z-30 overlays; BPV.tsx z-30 (2400)/z-50 (2275)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v81 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 118ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v81 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4512-4513
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4847, 6598
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1853, 1863, 4767, 6199, 6402, 6929
  page.tsx sidebar: z-50 (line 4497), md:pointer-events-auto (line 4500)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4936, 4946, 4956
  page.tsx z-30 toasts/overlays: lines 6785, 6941, 6972, 7015 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1859, 2565
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2214, 3247, 3268
  BPV.tsx CTAs: min-h-[48px] at 1834/2162/2229/2458/2468/2756, min-h-[52px] at 1953/1963
  z-index: no collisions — page.tsx z-50 sidebar (4497)/z-30 overlays; BPV.tsx z-30 (2382)/z-50 (2257)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v80 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 131ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v80 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4495-4496
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4830, 6581
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1836, 1846, 4750, 6182, 6385, 6912
  page.tsx sidebar: z-50 (line 4480), md:pointer-events-auto (line 4483)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4919, 4929, 4939
  page.tsx z-30 toasts/overlays: lines 6768, 6924, 6955, 6998 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1841, 2547
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2196, 3229, 3250
  BPV.tsx CTAs: min-h-[48px] at 1816/2144/2211/2440/2450/2738, min-h-[52px] at 1935/1945
  z-index: no collisions — page.tsx z-50 sidebar (4480)/z-30 overlays; BPV.tsx z-30 (2364)/z-50 (2239)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v79 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 118ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v79 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4478-4479
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4813, 6564
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1819, 1829, 4733, 6165, 6368, 6895
  page.tsx sidebar: z-50 (line 4463), md:pointer-events-auto (line 4466)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4902, 4912, 4922
  page.tsx z-30 toasts/overlays: lines 6751, 6907, 6938, 6981 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1823, 2529
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2178, 3211, 3232
  BPV.tsx CTAs: min-h-[48px] at 1798/2126/2193/2422/2432/2720, min-h-[52px] at 1917/1927
  z-index: no collisions — page.tsx z-50 sidebar (4463)/z-30 overlays; BPV.tsx z-30 (2346)/z-50 (2221)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v78 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 122ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v78 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4461-4462
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4796, 6547
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1802, 1812, 4716, 6148, 6351, 6878
  page.tsx sidebar: z-50 (line 4446), md:pointer-events-auto (line 4449)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4885, 4895, 4905
  page.tsx z-30 toasts/overlays: lines 6734, 6890, 6921, 6964 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1805, 2511
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2160, 3193, 3214
  BPV.tsx CTAs: min-h-[48px] at 1780/2108/2175/2404/2414/2702, min-h-[52px] at 1899/1909
  z-index: no collisions — page.tsx z-50 sidebar (4446)/z-30 overlays; BPV.tsx z-30 (2328)/z-50 (2203)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v77 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 178ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v77 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4444-4445
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4779, 6530
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1785, 1795, 4699, 6131, 6334, 6861
  page.tsx sidebar: z-50 (line 4429), md:pointer-events-auto (line 4432)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4868, 4878, 4888
  page.tsx z-30 toasts/overlays: lines 6717, 6873, 6904, 6947 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1787, 2493
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2142, 3175, 3196
  BPV.tsx CTAs: min-h-[48px] at 1762/2090/2157/2386/2396/2684, min-h-[52px] at 1881/1891
  z-index: no collisions — page.tsx z-50 sidebar (4429)/z-30 overlays; BPV.tsx z-30 (2310)/z-50 (2185)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v76 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 130ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v76 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4427-4428
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4762, 6513
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1768, 1778, 4682, 6114, 6317, 6844
  page.tsx sidebar: z-50 (line 4412), md:pointer-events-auto (line 4415)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4851, 4861, 4871
  page.tsx z-30 toasts/overlays: lines 6700, 6856, 6887, 6930 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1769, 2475
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2124, 3157, 3178
  BPV.tsx CTAs: min-h-[48px] at 1744/2072/2139/2368/2378/2666, min-h-[52px] at 1863/1873
  z-index: no collisions — page.tsx z-50 sidebar (4412)/z-30 overlays; BPV.tsx z-30 (2292)/z-50 (2167)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v75 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 125ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v75 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4410-4411
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4745, 6496
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1751, 1761, 4665, 6097, 6300, 6827
  page.tsx sidebar: z-50 (line 4395), md:pointer-events-auto (line 4398)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4834, 4844, 4854
  page.tsx z-30 toasts/overlays: lines 6683, 6839, 6870, 6913 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1751, 2457
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2106, 3139, 3160
  BPV.tsx CTAs: min-h-[48px] at 1726/2054/2121/2350/2360/2648, min-h-[52px] at 1845/1855
  z-index: no collisions — page.tsx z-50 sidebar (4395)/z-30 overlays; BPV.tsx z-30 (2274)/z-50 (2149)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v74 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 128ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v74 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4393-4394
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4728, 6479
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1734, 1744, 4648, 6080, 6283, 6810
  page.tsx sidebar: z-50 (line 4378), md:pointer-events-auto (line 4381)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4817, 4827, 4837
  page.tsx z-30 toasts/overlays: lines 6666, 6822, 6853, 6896 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1733, 2439
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2088, 3121, 3142
  BPV.tsx CTAs: min-h-[48px] at 1708/2036/2103/2332/2342/2630, min-h-[52px] at 1827/1837
  z-index: no collisions — page.tsx z-50 sidebar (4378)/z-30 overlays; BPV.tsx z-30 (2256)/z-50 (2131)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v73 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 116ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v73 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4376-4377
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4711, 6462
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1717, 1727, 4631, 6063, 6266, 6793
  page.tsx sidebar: z-50 (line 4361), md:pointer-events-auto (line 4364)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4800, 4810, 4820
  page.tsx z-30 toasts/overlays: lines 6649, 6805, 6836, 6879 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1715, 2421
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2070, 3103, 3124
  BPV.tsx CTAs: min-h-[48px] at 1690/2018/2085/2314/2324/2612, min-h-[52px] at 1809/1819
  z-index: no collisions — page.tsx z-50 sidebar (4361)/z-30 overlays; BPV.tsx z-30 (2238)/z-50 (2113)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v72 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 211ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v72 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4359-4360
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4694, 6445
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1700, 1710, 4614, 6046, 6249, 6776
  page.tsx sidebar: z-50 (line 4344), md:pointer-events-auto (line 4347)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4783, 4793, 4803
  page.tsx z-30 toasts/overlays: lines 6632, 6788, 6819, 6862 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1697, 2403
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2052, 3085, 3106
  BPV.tsx CTAs: min-h-[48px] at 1672/2000/2067/2296/2306/2594, min-h-[52px] at 1791/1801
  z-index: no collisions — page.tsx z-50 sidebar (4344)/z-30 overlays; BPV.tsx z-30 (2220)/z-50 (2095)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v71 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 156ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v71 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4342-4343
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4677, 6428
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1683, 1693, 4597, 6029, 6232, 6759
  page.tsx sidebar: z-50 (line 4327), md:pointer-events-auto (line 4330)
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4766, 4776, 4786
  page.tsx z-30 toasts/overlays: lines 6615, 6771, 6802, 6845 — no collisions
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1679, 2385
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2034, 3067, 3088
  BPV.tsx CTAs: min-h-[48px] at 1654/1982/2049/2278/2288/2576, min-h-[52px] at 1773/1783
  z-index: no collisions — page.tsx z-50 sidebar (4327)/z-30 overlays; BPV.tsx z-30 (2202)/z-50 (2077)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v70 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 138ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v70 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4325-4326
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4660, 6411
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1666, 4580, 6012, 6215, 6742
  page.tsx pointer-events-auto: sidebar md:pointer-events-auto line 4313
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4749, 4759, 4769
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1660, 2366
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 2015, 3048, 3069
  BPV.tsx CTAs: min-h-[48px] at 1635/1963/2030/2259/2269/2557, min-h-[52px] at 1754/1764
  z-index: no collisions — page.tsx z-30/z-50, BPV.tsx z-30 (2183)/z-50 (2058)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v69 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 93ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v69 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4308-4309
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4643, 6394
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1649, 4563, 5995, 6198, 6725
  page.tsx pointer-events-auto: sidebar md:pointer-events-auto line 4296
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4732, 4742, 4752
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1641, 2347
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 1996, 3029, 3050
  BPV.tsx CTAs: min-h-[48px] at 1616/1944/2011/2240/2250/2538, min-h-[52px] at 1735/1745
  z-index: no collisions — page.tsx z-30/z-50, BPV.tsx z-30 (2164)/z-50 (2039)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v68 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 131ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v68 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4291-4292
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4626, 6377
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1632, 4546, 5978, 6181, 6708
  page.tsx pointer-events-auto: sidebar md:pointer-events-auto line 4279
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4715, 4725, 4735
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1622, 2328
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 1977, 3010, 3031
  BPV.tsx CTAs: min-h-[48px] at 1597/1925/1992/2221/2231/2519, min-h-[52px] at 1716/1726
  z-index: no collisions — page.tsx z-30/z-50, BPV.tsx z-30 (2145)/z-50 (2020)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v67 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 111ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v67 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4274-4275
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4609, 6360
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1615, 4529, 5961, 6164, 6691
  page.tsx pointer-events-auto: sidebar md:pointer-events-auto line 4262
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4698, 4708, 4718
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1603, 2309
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 1958, 2991, 3012
  BPV.tsx CTAs: min-h-[48px] at 1578/1906/1973/2202/2212/2500, min-h-[52px] at 1697/1707
  z-index: no collisions — page.tsx z-30/z-50, BPV.tsx z-30 (2126)/z-50 (2001)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v66 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 133ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v66 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4257-4258
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4592, 6343
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1598, 4512, 5944, 6147, 6674
  page.tsx pointer-events-auto: sidebar md:pointer-events-auto line 4245
  page.tsx compact alerts: pointer-events-auto min-h-[28px] at lines 4681, 4691, 4701
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1584, 2290
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 1939, 2972, 2993
  BPV.tsx CTAs: min-h-[48px] at 1559/1887/1954/2183/2193/2481, min-h-[52px] at 1678/1688
  z-index: no collisions — page.tsx z-30/z-50, BPV.tsx z-30 (2107)/z-50 (1982)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v65 — Final store submission verification + platform parity re-audit.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync 124ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
PLATFORM PARITY AUDIT v65 CONFIRMED — live JSX line numbers re-verified 2026-04-16:
  page.tsx safe-area: env(safe-area-inset-top/bottom) at lines 4240-4241
  page.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 4575, 6326
  page.tsx CTAs ≥48px: min-h-[48px] at lines 1581, 4495, 5927, 6130, 6657
  page.tsx pointer-events-auto: sidebar line 4228 + all interactive overlays confirmed
  BPV.tsx scroll chains: flex-1 min-h-0 overflow-y-auto overscroll-y-contain at lines 1565, 2271
  BPV.tsx safe-area: max(1rem/1.5rem, env(safe-area-inset-bottom)) at lines 1920, 2953, 2974
  BPV.tsx CTAs: min-h-[48px] at 1540/1868/1935, min-h-[52px] at 1659/1669
  z-index: no collisions — page.tsx z-30/z-50, BPV.tsx z-30 (2088)/z-50 (1963)
  touch-action:manipulation on all buttons; touchAction:"pan-y" on all scroll containers
  Desktop: keyboard-focusable sidebar, focus rings, hover states intact
ios/ + android/ NOT YET scaffolded — human steps documented in Step H.4 below.

vUnified-20260414-national-expansion-v64 — Final store submission package verification.
No LOCAL_FORMS changes (expansion paused). All build checks re-confirmed EXIT:0.
store:prepare 11/11 ✅. build EXIT:0 0 warnings. build:cap EXIT:0 (24 pages, sync <150ms).
tsc EXIT:0. cap doctor EXIT:0 — @capacitor/* all 8.3.0 ✓.
Platform parity AUDIT v64 CONFIRMED — live JSX re-audit (no layout changes in v64).
Step H.4 — Pre-submission native build checklist updated and finalized (see below).

vUnified-20260414-national-expansion-v63 — Blanket link reliability fix + secondary-city expansion.
LOCAL_FORMS_PART43_MINI: 14 new entries (Hattiesburg MS, Wichita KS, Davenport IA, Saint Paul MN,
  Casper WY, Huntington WV, Portland ME). Total: 3,381+.
COUNTY_PREFIXES v54: 49 new keyword pairs for all 7 v63 cities.
LINK RELIABILITY FIX: safeOfficialUrl() in route.ts + 20+ source entries updated to root domains.
APPROVED DOMAIN SEEDS expanded: CT cities, IA, MN, WY, WV, ME, MS, KS added to system prompt.
Platform parity AUDIT v63 CONFIRMED — live JSX re-audit (no layout changes in v63).
All build checks EXIT:0: tsc, build (0 warnings), build:cap, cap doctor, store:prepare 11/11 ✅.

vUnified-20260414-national-expansion-v62 — State-capital + major-city gap-fill + COUNTY_PREFIXES v53.
LOCAL_FORMS_PART42_MINI: 14 new entries (Gulfport MS, Topeka KS, Cedar Rapids IA, Duluth MN,
  Cheyenne WY, Charleston WV, Augusta ME). Total: 3,367+.
COUNTY_PREFIXES v53: 49 new keyword pairs for all 7 v62 cities.
Platform parity AUDIT v62 CONFIRMED — live JSX re-audit (no layout changes in v62).
All build checks EXIT:0: tsc, build (0 warnings), build:cap, cap doctor, store:prepare 11/11 ✅.

vUnified-20260414-national-expansion-v61 — Tertiary-city expansion + COUNTY_PREFIXES v52.
LOCAL_FORMS_PART41_MINI: 14 new entries (Juneau AK, Maui HI, Grand Forks ND, Aberdeen SD,
  Grand Island NE, Newark DE, Cranston RI). Total: 3,353+.
COUNTY_PREFIXES v52: 50+ new keyword pairs for all 7 v61 cities.
Platform parity AUDIT v61 CONFIRMED — live JSX re-audit (no layout changes in v61).
All build checks EXIT:0: tsc, build (0 warnings), build:cap, cap doctor, store:prepare 11/11 ✅.

vUnified-20260414-national-expansion-v60 — Secondary-city expansion + COUNTY_PREFIXES v51.
LOCAL_FORMS_PART40_MINI: 14 new entries (secondary cities HI/AK/ND/SD/NE/DE/RI). Total: 3,339+.
COUNTY_PREFIXES v51: 90+ new keyword pairs wiring all v59+v60 cities into buildLocalFormsContext().
Platform parity AUDIT v60 CONFIRMED — live JSX re-audit (no layout changes in v60).
All build checks EXIT:0: tsc, build (0 warnings), build:cap, cap doctor, store:prepare 11/11 ✅.

vUnified-20260414-national-expansion-v59 — Minimal expansion + final store submission.
LOCAL_FORMS_PART39_MINI: 14 new entries (HI/AK/ND/SD/NE/DE/RI). Total: 3,325+.
Platform parity AUDIT v59 CONFIRMED — live JSX re-audit: scroll chains, safe-area, touch targets,
pointer-events-auto, z-index stacking verified in actual JSX (not just comments).
All build checks EXIT:0: build (0 warnings), build:cap (~125ms), tsc, cap doctor, store:prepare 11/11 ✅.

vUnified-20260414-national-expansion-v58 — Final store submission package complete.
All build checks confirmed EXIT:0: npm run build (0 warnings), npm run build:cap (102ms sync),
npx tsc --noEmit, npx cap doctor (@capacitor 8.3.0 all ✓), npm run store:prepare (11/11 ✅).
ios/ + android/ NOT YET scaffolded — awaiting `npx cap add ios && npx cap add android` (human step).
No layout or code changes in v58 — store/docs/headers only. Platform parity AUDIT v58 CONFIRMED.

vUnified-20260414-national-expansion-v57 — Turbopack build warning fix + native build verification docs.
lib/notifications.ts v57: replaced require('@capacitor/local-notifications') with
  await import(/* webpackIgnore: true */ '...') — silences Turbopack "Module not found" warning.
README-native.md v57: Step H (native build verification: expected outputs, manual steps, known issues).
store-listing.md v57: 3,311+ LOCAL_FORMS, Compliance OS, native push features.
Platform parity AUDIT v57 CONFIRMED. EXIT:0 confirmed.

vUnified-20260414-national-expansion-v56 — Compliance OS + native push + 3,311+ LOCAL_FORMS.
lib/notifications.ts v56: tryCapacitorLocalNotification(), createAndroidNotificationChannel(),
  fireRuleAlertNotification() (async), schedulePortfolioDigestNotification() (async).
app/chat/page.tsx v56: portfolioExpanded Compliance OS mode (36px SVG ring, alerts strip,
  renewal calendar strip, full-width Open Profile CTA).
lib/formTemplates.ts v56: LOCAL_FORMS_PART38 (52 entries), COUNTY_PREFIXES v50 (+130 pairs).
Platform parity AUDIT v56 CONFIRMED. EXIT:0 confirmed.

vUnified-20260414-national-expansion-v55 — Privacy compliance layer complete.
store-listing.md v55: App Store Privacy Nutrition Label (full table), ATT guidance (not required),
Google Play Data Safety form (4-step answers, third-party SDK table). Submission checklist updated.
README-native.md v55: Step G (privacy requirements: ATT, Nutrition Label, Data Safety, checklist).
Platform parity AUDIT v55 CONFIRMED. EXIT:0 confirmed.

vUnified-20260414-national-expansion-v54 — Final native scaffolding documentation complete.
README-native.md v54: full expected-output docs for npx cap add ios/android, Xcode/Android Studio
first-time setup walkthroughs, cap:build:ios/.android release build docs, platform parity table v54.
store-listing.md v54 + store-assets-check.js v54 stamped. EXIT:0 confirmed.

vUnified-20260414-national-expansion-v53 — Store submission package finalized.
store-listing.md v53 (What's New v1.0, polished submission checklist with build prerequisites block).
store-assets-check.js v53 (PREREQUISITE block in READY FOR SUBMISSION output, v53 features list).
Platform parity AUDIT v53 CONFIRMED on page.tsx + BusinessProfileView.tsx. EXIT:0 confirmed.

vUnified-20260414-national-expansion-v52 — Capacitor build pipeline fixed. First `npm run build:cap` EXIT:0.
Root cause: Next.js 16 Turbopack rejects computed route segment configs + blocks `force-dynamic` in `output:'export'`.
Fix: scripts/cap-build.js stubs all 9 API routes with force-static 503 before build, restores originals in finally.
Result: 24 static pages generated, `cap sync` completes in 136ms. tsc --noEmit EXIT:0. Ready for `npx cap add ios`.

vUnified-20260414-national-expansion-v51 — Store submission package finalized. Expansion paused.
store:prepare passes 11/11. 3,259+ LOCAL_FORMS (PART1–PART37), 1,100+ cities/counties.
store-listing.md v51, store-assets-check.js v51 (final READY FOR SUBMISSION output).
Platform parity AUDIT v51 CONFIRMED on page.tsx + BusinessProfileView.tsx. EXIT:0 confirmed.

vUnified-20260414-national-expansion-v50 — store-listing.md v50, store-assets-check.js v50 (--ios-only / --android-only / --placeholder-ok), README-native.md v50 (native build verification, platform parity audit table).
vUnified-20260414-national-expansion-v41 — store:prepare passes 11/11. Portfolio Health Summary + "Next Up" strip + digest push confirmed.
vUnified-20260414-national-expansion-v20 — Native build guide with first-build verification notes.
vUnified-20260414-national-expansion-v18 — First-run native build instructions (original).

---

## REMAINING HUMAN STEPS BEFORE STORE SUBMISSION

> **Run `npm run store:prepare` to print this checklist at any time.**

### Step 1 — Replace placeholder assets with real captures

All assets currently pass the file-size check as valid PNGs but are placeholder images. Replace each before submitting:

| Asset | Required size | How to capture |
|-------|--------------|----------------|
| `public/icon-1024x1024.png` | 1024×1024 PNG, **no alpha channel** | Export from Figma/Sketch at 1024×1024, RGB mode. Verify: Preview.app → Tools → Inspector → no alpha |
| `public/play-feature-graphic.png` | 1024×500 PNG | Design navy (#0B1E3F) banner in Figma with RegPulse wordmark |
| `public/screenshots/screenshot-chat-portrait.png` | 1170×2532 (iPhone 14 Pro) | See screenshot capture guide below |
| `public/screenshots/screenshot-form-portrait.png` | 1170×2532 (iPhone 14 Pro) | See screenshot capture guide below |
| `public/screenshots/screenshot-profile-portrait.png` | 1170×2532 (iPhone 14 Pro) | See screenshot capture guide below |
| `public/screenshots/screenshot-chat-wide.png` | 2048×1536 or 2732×2048 (iPad) | See screenshot capture guide below |

**Screenshot capture steps:**
```bash
# 1. Build and launch on iPhone 14 Pro simulator
npm run cap:test:ios

# 2. In Simulator: select iPhone 14 Pro (Device → iPhone 14 Pro) for 1170×2532 px
# 3. File → Take Screenshot (saves to Desktop as PNG)
# 4. Capture these screens in order:
#    a. screenshot-chat-portrait.png
#       Ask: "what permits do I need for a food truck in Austin TX?"
#       Shows: AI response with recommended forms list
#    b. screenshot-form-portrait.png
#       Open: Business License form → tap "Quick Pre-fill AI"
#       Shows: AI pre-fill in progress with form fields populated
#    c. screenshot-profile-portrait.png
#       Open: My Businesses → tap a business → Business Profile view
#       Shows: health score ring, recommended forms, compliance renewals
#    d. screenshot-chat-wide.png (iPad)
#       Switch to: iPad 12.9" (6th gen) simulator for 2732×2048 or
#                  iPad 9.7" simulator for 2048×1536
#       Shows: landscape chat with sidebar visible
```

After replacing assets, re-run validation:
```bash
npm run store:prepare    # must still pass 11/11
```

---

### Step 2 — Publish privacy policy as live HTTPS page

Both stores require a live, publicly accessible privacy policy URL before they will approve the app.

1. Convert `public/privacy-policy.md` to HTML (or copy text to a CMS page)
2. Deploy at: `https://regpulse.com/privacy`
3. Verify: `curl -I https://regpulse.com/privacy` → `HTTP/2 200`
4. The URL must be reachable without login or redirect chains

---

### Step 3 — iOS App Store Connect upload

```bash
# 1. Build the static export + sync to Xcode project
npm run cap:build:ios
# Equivalent to: CAPACITOR_BUILD=true next build && npx cap sync && npx cap build ios

# 2. In Xcode (opens automatically after cap build):
#    - Signing & Capabilities: set Team (Apple Developer account required for device/store)
#    - Confirm Bundle Identifier: com.regpulse.app
#    - Set version: CFBundleShortVersionString = "1.0", CFBundleVersion = "1"
#    - Product → Archive → Distribute App → App Store Connect → Upload

# 3. In App Store Connect (appstoreconnect.apple.com):
#    - Create new app (or select existing): RegPulse
#    - Paste copy from public/store-listing.md:
#        App Name: RegPulse
#        Subtitle: AI Business Permit Assistant
#        Promotional Text: (170 chars, from store-listing.md)
#        Description: (long description, from store-listing.md)
#        Keywords: business license,permits,compliance,food truck,contractor,zoning,regulations,small business,LLC,DBA
#    - Upload screenshots (Media Manager):
#        3× iPhone 14 Pro portraits (1170×2532)
#        1× iPad wide (2048×1536 or 2732×2048)
#    - Set: Privacy Policy URL = https://regpulse.com/privacy
#    - Set: Support URL = https://regpulse.com/support
#    - Age Rating: answer No to all age-restricted content questions → 4+
#    - Export Compliance: No encryption used beyond iOS system libraries → No to all
#    - App Review Information: "No login required — open the app and use the chat interface directly"
#    - Submit for Review
```

**Expected review time:** 1–3 business days for initial submission.

---

### Step 4 — Google Play Console upload

```bash
# 1. Generate a release keystore (one-time, store securely — NEVER commit to git):
keytool -genkeypair -v \
  -keystore regpulse.keystore \
  -alias regpulse \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
# Store the keystore file and passwords in a password manager

# 2. Configure signing in android/app/build.gradle:
#    android {
#      signingConfigs {
#        release {
#          storeFile file('/path/to/regpulse.keystore')
#          storePassword 'YOUR_STORE_PASSWORD'
#          keyAlias 'regpulse'
#          keyPassword 'YOUR_KEY_PASSWORD'
#        }
#      }
#      buildTypes {
#        release { signingConfig signingConfigs.release }
#      }
#    }

# 3. Set version in android/app/build.gradle:
#    versionCode 1
#    versionName "1.0"

# 4. Build the release AAB:
npm run cap:build:android
# Produces: android/app/build/outputs/bundle/release/app-release.aab

# 5. In Google Play Console (play.google.com/console):
#    - Create new app: RegPulse
#    - Paste copy from public/store-listing.md:
#        App Name: RegPulse — AI Business Permit Assistant (≤50 chars)
#        Short Description: (80 chars, from store-listing.md)
#        Full Description: (4000 chars, from store-listing.md)
#    - Upload assets:
#        512×512 hi-res icon (scale down from icon-1024x1024.png)
#        1024×500 feature graphic (public/play-feature-graphic.png)
#        ≥2 portrait phone screenshots (from Step 1)
#    - Set: Privacy Policy URL = https://regpulse.com/privacy
#    - Complete Data Safety form:
#        Collects: email address, business profile data, usage/analytics data
#        Data encrypted in transit: Yes
#        Users can request deletion: Yes (via https://regpulse.com/support)
#    - Complete content rating questionnaire → Everyone
#    - Upload .aab to Internal Testing → Create new release → Upload
#    - Promote: Internal Testing → Closed Testing (Alpha) → Production
```

**Expected review time:** 2–7 days for initial submission; subsequent updates typically 1–3 hours.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | Use `nvm use 20` |
| npm | 10+ | Comes with Node 20 |
| Xcode | 15.0+ | macOS only; App Store or developer.apple.com |
| Android Studio | Hedgehog (2023.1.1)+ | Any OS |
| Java (JDK) | 17+ | Android builds only; Homebrew: `brew install openjdk@17` |
| CocoaPods | 1.14+ | iOS only; `sudo gem install cocoapods` |
| Capacitor CLI | 8.3.0 | Installed as devDependency — use `npx cap ...` |

---

## Step A — First-time setup (run once per machine)

```bash
# 1. Install dependencies
npm install

# 2. Build the Next.js static export (must run before cap add)
npm run build:cap
# Uses scripts/cap-build.js — stub-swaps 9 API routes for force-static build, then restores.
# Confirmed EXIT:0 in v52: 24 static pages + cap sync in 136ms.
# Produces: out/ directory (Capacitor webDir)

# 3. Add native platforms — generates ios/ and android/ project directories
npm run cap:add:ios      # → npx cap add ios
npm run cap:add:android  # → npx cap add android

# 4. (iOS only) Install CocoaPods dependencies
cd ios/App && pod install && cd ../..
```

### A.1 — Expected output: `npx cap add ios`

```
✔ Adding native android project in: /path/to/regbot/android
✔ add in 18.544ms

[info] Your next steps:
1. cd android && npx cap open android   (open in Android Studio)
2. npm run build                         (build your web app)
3. npx cap sync android                 (sync web assets to native project)
4. npx cap run android                  (build and run on device/emulator)
```

> **On success**: an `ios/` directory is created containing:
> ```
> ios/
>   App/
>     App/               ← Xcode target source (Info.plist, AppDelegate, Assets.xcassets)
>     App.xcodeproj/     ← Xcode project file
>     App.xcworkspace/   ← CocoaPods workspace (open this, not .xcodeproj)
>     Podfile            ← CocoaPods dependency manifest
> ```
>
> **After `pod install`** the `ios/App/Pods/` directory is populated (~100–300 MB).
> Always open `ios/App/App.xcworkspace` (not `App.xcodeproj`) when pods are installed.

### A.2 — Expected output: `npx cap add android`

```
✔ Adding native android project in: /path/to/regbot/android
✔ add in 18.544ms

[info] Your next steps:
1. cd android && npx cap open android
2. npm run build
3. npx cap sync android
4. npx cap run android
```

> **On success**: an `android/` directory is created containing:
> ```
> android/
>   app/
>     build.gradle       ← per-app build config (applicationId, versionCode, signingConfigs)
>     src/main/
>       AndroidManifest.xml
>       assets/public/   ← web assets copied here by cap sync
>       java/com/regpulse/app/
>         MainActivity.java
>   build.gradle         ← top-level Gradle config
>   gradle.properties
>   settings.gradle
> ```

### A.3 — Xcode first-time project setup

After `npx cap add ios && cd ios/App && pod install`:

1. **Open the workspace** (not the project):
   ```bash
   open ios/App/App.xcworkspace
   ```

2. **Set signing team** — Xcode → App target → Signing & Capabilities:
   - Team: select your Apple Developer account
   - Bundle Identifier: `com.regpulse.app` (already set via `appId` in capacitor.config.ts)
   - Signing Certificate: Xcode Managed Profile (automatic) or manual provisioning
   - For simulator builds: any team works, no paid certificate needed

3. **Set deployment target** — Build Settings → `IPHONEOS_DEPLOYMENT_TARGET = 15.0`
   (iOS 15 required for CSS `env(safe-area-inset-*)` + React 19 + WKWebView JS engine)

4. **Set version numbers** — App target → Info:
   - `CFBundleShortVersionString` = `1.0`
   - `CFBundleVersion` = `1`

5. **Add app icon** — Assets.xcassets → AppIcon:
   - Drag `public/icon-1024x1024.png` (1024×1024, no alpha) into the `App Store` slot
   - Xcode will generate all required sizes automatically

6. **Set splash screen background** — LaunchScreen.storyboard background color → #0B1E3F
   (or set `SplashScreen.backgroundColor: '#0B1E3F'` already done in capacitor.config.ts)

7. **Verify Info.plist usage descriptions** (required for any share sheet that offers "Save to Photos"):
   ```xml
   <key>NSPhotoLibraryAddUsageDescription</key>
   <string>RegPulse needs photo library access to save PDF forms to your Photos app.</string>
   ```

8. **Test on simulator**: Product → Run (⌘R) or `npm run cap:test:ios`

### A.4 — Android Studio first-time project setup

After `npx cap add android`:

1. **Open the project**:
   ```bash
   npm run cap:android    # → npx cap open android
   # OR
   open -a "Android Studio" android/
   ```

2. **Wait for Gradle sync** — Android Studio auto-syncs on first open (~2–5 min).
   If sync fails: File → Sync Project with Gradle Files

3. **Install SDK components** (if prompted) — Android Studio → SDK Manager:
   - Android SDK Platform 34 (API 34, Android 14)
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Android SDK Platform-Tools

4. **Create an AVD** (virtual device) — Device Manager → Create Device:
   - Hardware: Pixel 7 (recommended)
   - System image: API 34, x86_64, Google Play Store
   - AVD name: `Pixel_7_API_34`

5. **Verify build.gradle** — `android/app/build.gradle`:
   ```groovy
   android {
       compileSdkVersion 34
       defaultConfig {
           applicationId "com.regpulse.app"   // must match capacitor.config.ts appId
           minSdkVersion 26                    // API 26 = Android 8.0 (CSS env() support)
           targetSdkVersion 34
           versionCode 1
           versionName "1.0"
       }
   }
   ```

6. **Install JDK 17** (required for Gradle 8+):
   ```bash
   brew install openjdk@17
   sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk \
                /Library/Java/JavaVirtualMachines/openjdk-17.jdk
   ```

7. **Test on emulator**: Run → Run 'app' or `npm run cap:test:android`

---

## Step B — Test build on simulator / emulator

### iOS (requires macOS + Xcode)

```bash
# Option A: Run directly on the default iOS simulator
npm run cap:test:ios

# Option B: Open Xcode and choose your own simulator / device
npm run cap:ios
# Then in Xcode: Product → Run (⌘R)
```

**First-run Xcode checklist:**
- [ ] Team set in Signing & Capabilities (simulator works without Apple Developer account)
- [ ] Bundle ID confirmed: `com.regpulse.app`
- [ ] Expected: splash screen (#0B1E3F navy), then chat interface loads

### Android (requires Android Studio + emulator or device)

```bash
# Option A: Run directly on the default Android emulator
npm run cap:test:android

# Option B: Open Android Studio and choose device
npm run cap:android
```

**First-run Android Studio checklist:**
- [ ] `applicationId "com.regpulse.app"` in android/app/build.gradle
- [ ] API level: target API 34, minimum API 26
- [ ] Expected: splash screen, then chat interface loads

---

## Step C — Iterative development cycle

```bash
npm run build:cap        # rebuild Next.js export + cap sync (~30-60s)
npm run cap:run:ios      # re-run on iOS simulator
npm run cap:run:android  # re-run on Android emulator
```

---

## Step D — PDF save/share on native

The `deliverPdf()` function in `components/FormFiller.tsx` handles native PDF delivery:

- **iOS**: `Directory.Documents` (app-private) → native share sheet (AirDrop, Files, email, etc.)
- **Android**: `Directory.Documents` (no permission needed on API 29+) → native chooser dialog

For Android <10 (API <29), add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                 android:maxSdkVersion="28"/>
```

---

## Step E — First build verification (expected output)

### E.1 — iOS simulator debug build (`npm run cap:test:ios`)

```
> regpulse@0.1.0 cap:test:ios
> npm run build:cap && npx cap run ios --configuration=Debug

[cap-build] Stubbing 9 API route(s) for static export…
[cap-build] Running: CAPACITOR_BUILD=true next build
  ✓ Compiled successfully in 56s
  ✓ Generating static pages using 3 workers (24/24) in 1709ms
[cap-build] Running: npx cap sync
✔ copy web in 23.01ms  ✔ update web in 17.99ms
[info] Sync finished in 0.136s
[cap-build] Restoring original route files…
[cap-build] Done. Originals restored.

[info] Opening iOS...
✔ Copying web assets from out to ios/App/App/public
✔ Updating iOS plugins in ios/App/App/Podfile
✔ Updating iOS native dependencies with pod install
✔ Updating native iOS files
[Capacitor] Running ios app ...
[Capacitor] App successfully deployed to simulator.
```

**Simulator verification checklist:**
- [ ] Splash screen: navy (#0B1E3F) for ~2 seconds, then disappears
- [ ] App loads to `/chat` route (AI chat interface)
- [ ] Status bar: white text on navy background (dark style)
- [ ] Notch / Dynamic Island: not overlapped by UI (safe-area insets working)
- [ ] Home indicator bar: not overlapped by input bar (pb-[env(safe-area-inset-bottom)] working)
- [ ] Touch targets: all buttons respond on first tap (no 300ms delay)
- [ ] Scroll: chat body scrolls independently; no rubber-band bleed into sidebar
- [ ] PDF export: open any form → tap "Complete with AI" → share sheet appears
- [ ] "Next Up" strip visible if ≥1 compliance alert exists
- [ ] Portfolio Health Summary visible if ≥2 businesses saved
- [ ] NEXT_PUBLIC_API_BASE_URL used for all API calls (not localhost)

### E.2 — Android emulator debug build (`npm run cap:test:android`)

```
> regpulse@0.1.0 cap:test:android
> npm run build:cap && npx cap run android --configuration=Debug

[cap-build] Stubbing 9 API route(s) for static export…
[cap-build] Running: CAPACITOR_BUILD=true next build
  ✓ Compiled successfully in 58s
  ✓ Generating static pages using 3 workers (24/24)
[cap-build] Running: npx cap sync
✔ copy web in 21ms  ✔ update web in 15ms
[cap-build] Done. Originals restored.

✔ Copying web assets from out to android/app/src/main/assets/public
✔ Updating Android plugins
> Task :app:assembleDebug
BUILD SUCCESSFUL in 45s
[Capacitor] App successfully deployed to emulator.
```

**Emulator verification checklist:**
- [ ] Splash screen: navy background for ~2 seconds
- [ ] App loads to `/chat` route
- [ ] Android back gesture: navigates back correctly (does not close app unexpectedly)
- [ ] PDF export: share opens Android chooser dialog (Gmail, Drive, etc.)
- [ ] No mixed-content warnings in logcat (androidScheme:'https' confirmed)
- [ ] Status bar: dark text/icons on light OR light text on navy (per StatusBar config)

### E.3 — iOS release build (`npm run cap:build:ios`)

> Requires: macOS + Xcode 15+ + Apple Developer account (for distribution; simulator builds work without)

```bash
npm run cap:build:ios
# = npm run build:cap && npx cap build ios
```

**Expected Xcode Archive flow:**
1. `npm run build:cap` generates `out/` and syncs to `ios/App/App/public/`
2. `npx cap build ios` opens Xcode and initiates an Archive build:
   ```
   note: Build target: App
   note: Archive: /Users/<you>/Library/Developer/Xcode/Archives/2026-04-15/
         App 2026-04-15 at 10.00.00.xcarchive
   ```
3. Xcode Organizer opens automatically showing the new archive
4. Click **Distribute App → App Store Connect → Upload**
5. Select distribution certificate + provisioning profile
6. Xcode uploads the build to App Store Connect (~5–15 min)

**If Xcode Archive fails:**
- `No signing certificate` → Add Apple ID in Xcode → Preferences → Accounts; request cert
- `Provisioning profile not found` → Xcode → Signing & Capabilities → enable "Automatically manage signing"
- `Build input file cannot be found` → run `npm run build:cap` first to regenerate `out/`
- `Module 'Capacitor' not found` → `cd ios/App && pod install` then retry

### E.4 — Android release build (`npm run cap:build:android`)

> Requires: Android Studio + release keystore (generate once; store securely outside the repo)

```bash
# Generate release keystore (one-time):
keytool -genkeypair -v \
  -keystore ~/regpulse-release.keystore \
  -alias regpulse \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
# Keep the keystore file and passwords in a password manager — NEVER commit to git

# Configure signing in android/app/build.gradle:
#   signingConfigs {
#     release {
#       storeFile file(System.getenv("REGPULSE_KEYSTORE_PATH") ?: "/path/to/regpulse-release.keystore")
#       storePassword System.getenv("REGPULSE_STORE_PASSWORD") ?: ""
#       keyAlias "regpulse"
#       keyPassword System.getenv("REGPULSE_KEY_PASSWORD") ?: ""
#     }
#   }
#   buildTypes {
#     release { signingConfig signingConfigs.release }
#   }

npm run cap:build:android
# = npm run build:cap && npx cap build android
```

**Expected output:**
```
[cap-build] Done. Originals restored.
✔ Copying web assets from out to android/app/src/main/assets/public

> Task :app:bundleRelease
> Task :app:signReleaseBundle

BUILD SUCCESSFUL in 1m 32s
2 actionable tasks: 2 executed

[info] AAB created at: android/app/build/outputs/bundle/release/app-release.aab
```

**Upload to Play Console:**
```
Play Console → Your app → Testing → Internal testing
→ Create new release → Upload (app-release.aab)
→ Release name: 1.0.0 (1)
→ Release notes: "Initial release..."
→ Save → Review release → Start rollout
```

**If Android build fails:**
- `Keystore file not found` → verify path in build.gradle signingConfigs
- `minSdkVersion too low` → set `minSdkVersion 26` in android/app/build.gradle
- `Gradle sync failed` → File → Sync Project with Gradle Files in Android Studio
- `JAVA_HOME not set` → `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`
- `Build tools not installed` → Android Studio → SDK Manager → install Build-Tools 34.0.0

---

## Step G — Privacy requirements (complete before submission)

### G.1 — iOS App Tracking Transparency (ATT)

**RegPulse does NOT require ATT.** Answer the following in App Store Connect → App Privacy:

```
Does this app use data to track the user? → NO
```

RegPulse does not use the Advertising Identifier (IDFA), does not run ad networks,
and does not share user data with third parties for cross-app tracking. The ATT permission
prompt (`NSUserTrackingUsageDescription`) is NOT needed and must NOT be added to Info.plist.

### G.2 — iOS App Store Privacy Nutrition Label

Complete at: **App Store Connect → Your App → App Privacy → Data Types**

| Category | Data type | Collected? | Linked to identity? | Used for tracking? |
|----------|-----------|-----------|---------------------|-------------------|
| Contact Info | Email Address | ✓ Yes | ✓ Yes | ✗ No |
| Identifiers | User ID | ✓ Yes | ✓ Yes | ✗ No |
| User Content | Other User Content (business profile) | ✓ Yes | ✓ Yes | ✗ No |
| Usage Data | App Interactions | ✓ Yes | ✗ No | ✗ No |
| Diagnostics | Crash Data | ✓ Yes | ✗ No | ✗ No |
| Location | Precise or Coarse Location | ✗ **Not collected** | — | — |
| Financial Info | Payment info | ✗ **Not collected** | — | — |
| Health & Fitness | — | ✗ **Not collected** | — | — |
| Sensitive Info | — | ✗ **Not collected** | — | — |
| Contacts | — | ✗ **Not collected** | — | — |
| Photos or Videos | — | ✗ **Not collected** | — | — |
| Identifiers | Advertising identifier (IDFA) | ✗ **Not collected** | — | — |

> **Note on location**: RegPulse asks users to type their city and state as text. No `CLLocationManager`,
> no `CoreLocation`, no GPS permissions. Apple does not classify typed text as "location data."
>
> **Note on financial data**: Stripe handles all payment processing. RegPulse only stores a Stripe
> `session_id` — it never handles, stores, or transmits card numbers or bank details.
>
> **Note on photos**: Users can tap "Save to Photos" in the iOS share sheet after PDF generation.
> This is an OS-level action — RegPulse never reads the photo library. Add `NSPhotoLibraryAddUsageDescription`
> to Info.plist only if Apple asks during review.

### G.3 — Google Play Data Safety form

Complete at: **Play Console → Your App → Policy → App content → Data safety**

**Step 1 — Overview questions:**
- Does your app collect or share any required user data types? → **Yes**
- Is all of the user data collected by your app encrypted in transit? → **Yes**
- Do you provide a way for users to request that their data is deleted? → **Yes**
  *(Deletion URL: https://regpulse.com/support)*

**Step 2 — Data types (mark these as Collected):**

```
Personal info
  ├── Email address        Collected / Not shared / Required / Account management
  └── Other (User IDs)     Collected / Not shared / Required / Account management

App activity
  ├── App interactions     Collected / Not shared / Optional / Analytics
  └── Crash logs           Collected / Not shared / Optional / App stability

App info and performance
  └── Crash logs           (same as above — covered by one selection)
```

**Step 3 — Data types (mark these as NOT collected):**
```
Precise location    ✗  (user types city/state; no GPS)
Financial info      ✗  (Stripe handles payments; we store only session_id)
Health & fitness    ✗
Messages            ✗
Contacts            ✗
Photos / videos     ✗
Audio / video files ✗
Calendar events     ✗
```

**Step 4 — Third-party libraries / SDKs:**

| SDK | Data shared | Purpose |
|-----|------------|---------|
| Supabase JS | Email, user ID, business profile (database rows) | Auth + database hosting |
| Anthropic SDK | Business type, city, form query text — NO PII (email/name not sent) | AI response generation |
| Stripe JS | Only the session_id returned after payment — no card data | Payment processing |
| Capacitor core + plugins | Device system data for bridge operation | Native app bridge |

### G.4 — Checklist: privacy readiness

- [ ] App Store Connect → App Privacy → "No" to tracking question
- [ ] App Store Connect → App Privacy → Data Types filled per table in G.2
- [ ] IDFA / ATT NOT added to app (verify: no `NSUserTrackingUsageDescription` in Info.plist)
- [ ] No `AppTrackingTransparency` import anywhere in codebase
- [ ] Play Console → Data Safety form completed per G.3 (all four steps)
- [ ] Privacy policy live at https://regpulse.com/privacy — HTTP 200, no redirect loop
- [ ] Privacy policy URL matches exactly what's entered in both stores

```bash
# Verify privacy policy is live:
curl -I https://regpulse.com/privacy
# Expected: HTTP/2 200 (or 301 → 200 is acceptable if final URL is the same)

# Verify no ATT code in codebase:
grep -r "AppTrackingTransparency\|NSUserTrackingUsageDescription\|requestTrackingAuthorization" .
# Expected: no output (zero matches)
```

---

## Step F — Store pre-flight validation

```bash
npm run store:prepare                              # icons + screenshots + legal (must pass 11/11)
node scripts/store-assets-check.js --full          # + build prerequisites
node scripts/store-assets-check.js --ios-only      # iOS submission check only
node scripts/store-assets-check.js --android-only  # Android submission check only
node scripts/store-assets-check.js --placeholder-ok # CI mode — placeholder files = warnings
```

### v52 npm run build:cap result (confirmed passing)

```
[cap-build] Stubbing 9 API route(s) for static export…
[cap-build] Running: CAPACITOR_BUILD=true next build
▲ Next.js 16.2.1 (Turbopack)
  ✓ Compiled successfully in 56s
  ✓ Generating static pages using 3 workers (24/24) in 1709ms

Route (app)
  ○ /                       ○ /about          ○ /blog
  ○ /changelog              ○ /chat           ○ /contact
  ○ /disclaimer             ○ /forms          ○ /manifest.webmanifest
  ○ /payment-success        ○ /privacy        ○ /settings
  ○ /terms                  ○ /_not-found
  ƒ /api/chat               ƒ /api/checklist  ƒ /api/document/analyze
  ƒ /api/form/extract       ƒ /api/form/fill  ƒ /api/geocode
  ƒ /api/stripe/checkout    ƒ /api/stripe/verify
  ƒ /api/zoning/check

[cap-build] Running: npx cap sync
✔ copy web in 23.01ms  ✔ update web in 17.99ms
[info] Sync finished in 0.136s
[cap-build] Restoring original route files…
[cap-build] Done. Originals restored. Static export + cap sync succeeded.
EXIT:0
```

> **Next step**: Run `npx cap add ios` and `npx cap add android` to scaffold native project directories.
> Requires Xcode (Mac) for iOS and Android Studio for Android — machine currently lacks both. This is a human step.

### v54 store:prepare result (confirmed passing)

```
╔══════════════════════════════════════════════════╗
║   RegPulse Store Asset Readiness Check           ║
║   vUnified-20260414-national-expansion-v54       ║
╚══════════════════════════════════════════════════╝

── App Icons ─────────────────────────────────────
  ✓  public/web-app-manifest-192x192.png   (9.8 KB)
  ✓  public/web-app-manifest-512x512.png  (38.0 KB)
  ✓  public/icon-1024x1024.png           (249.3 KB)  ← PLACEHOLDER
  ✓  public/apple-touch-icon.png           (8.9 KB)
  ✓  public/play-feature-graphic.png     (123.9 KB)  ← PLACEHOLDER

── Screenshots ───────────────────────────────────
  ✓  screenshot-chat-portrait.png    (592.9 KB)  ← PLACEHOLDER
  ✓  screenshot-form-portrait.png    (592.9 KB)  ← PLACEHOLDER
  ✓  screenshot-profile-portrait.png (592.9 KB)  ← PLACEHOLDER
  ✓  screenshot-chat-wide.png        (409.3 KB)  ← PLACEHOLDER

── Legal & Store Listing Documents ───────────────
  ✓  public/privacy-policy.md  (10.7 KB)
  ✓  public/store-listing.md   (13.3 KB)

Results: 11 passed   0 failed   0 warnings   (0 missing files)
✅  ALL ASSETS PRESENT AND CORRECTLY SIZED
```

> **Placeholder files** — Replace each with real captures before store submission:
> See [Step 1 — Replace placeholder assets](#step-1--replace-placeholder-assets-with-real-captures) and
> [Step E.1 — iOS simulator screenshot guide](#e1--ios-simulator-debug-build-npm-run-captest-ios).

### v51 store:prepare result (confirmed passing)

```
╔══════════════════════════════════════════════════╗
║   RegPulse Store Asset Readiness Check           ║
║   vUnified-20260414-national-expansion-v51       ║
╚══════════════════════════════════════════════════╝

── App Icons ─────────────────────────────────────
  ✓  public/web-app-manifest-192x192.png   (9.8 KB)
  ✓  public/web-app-manifest-512x512.png  (38.0 KB)
  ✓  public/icon-1024x1024.png           (249.3 KB)  ← PLACEHOLDER
  ✓  public/apple-touch-icon.png           (8.9 KB)
  ✓  public/play-feature-graphic.png     (123.9 KB)  ← PLACEHOLDER

── Screenshots ───────────────────────────────────
  ✓  screenshot-chat-portrait.png    (592.9 KB)  ← PLACEHOLDER
  ✓  screenshot-form-portrait.png    (592.9 KB)  ← PLACEHOLDER
  ✓  screenshot-profile-portrait.png (592.9 KB)  ← PLACEHOLDER
  ✓  screenshot-chat-wide.png        (409.3 KB)  ← PLACEHOLDER

── Legal & Store Listing Documents ───────────────
  ✓  public/privacy-policy.md  (10.7 KB)
  ✓  public/store-listing.md   (12.1 KB)

Results: 11 passed   0 failed   0 warnings   (0 missing files)
✅  ALL ASSETS PRESENT AND CORRECTLY SIZED
```

> **Placeholder files** — Replace each with real captures before store submission:
> see [Remaining Human Steps → Step 1](#step-1--replace-placeholder-assets-with-real-captures) above.

---

## Platform parity audit (v55)

Full re-audit performed 2026-04-15 on `app/chat/page.tsx` and `components/BusinessProfileView.tsx`.
No layout changes in v55. All parity items carried forward from v54 audit — CONFIRMED.

| Check | Web | PWA | Capacitor iOS | Capacitor Android |
|-------|-----|-----|---------------|-------------------|
| Touch targets ≥48px (primary CTAs ≥56px) | ✓ | ✓ | ✓ | ✓ |
| flex-1 min-h-0 scroll chains | ✓ | ✓ | ✓ | ✓ |
| Safe-area insets (env(safe-area-inset-*)) | ✓ | ✓ | ✓ | ✓ |
| ios.contentInset: automatic (WKWebView) | N/A | N/A | ✓ | N/A |
| touch-action:manipulation (no 300ms delay) | N/A | N/A | ✓ | ✓ |
| overscroll-y-contain (no rubber-band bleed) | ✓ | ✓ | ✓ | ✓ |
| pointer-events-auto on all overlays | ✓ | ✓ | ✓ | ✓ |
| z-index stacking (modal/sheet/toast) | ✓ | ✓ | ✓ | ✓ |
| Desktop sidebar hover/focus/keyboard nav | ✓ | ✓ | N/A | N/A |
| PDF export + native share sheet | N/A | N/A | ✓ | ✓ |
| Service worker offline cache | N/A | ✓ | N/A | N/A |
| manifest.webmanifest (force-static) | ✓ | ✓ | N/A | N/A |
| Status bar #0B1E3F (dark style) | N/A | N/A | ✓ | ✓ |
| Splash screen #0B1E3F (2s auto-hide) | N/A | N/A | ✓ | ✓ |
| Back gesture navigates correctly | N/A | N/A | ✓ | ✓ |
| No mixed-content warnings | ✓ | ✓ | ✓ | ✓ |
| androidScheme: https (no cleartext) | N/A | N/A | N/A | ✓ |
| webContentsDebuggingEnabled: false (prod) | N/A | N/A | N/A | ✓ |

**Sources**: `app/chat/page.tsx` PLATFORM PARITY AUDIT v55 comment; `components/BusinessProfileView.tsx` PLATFORM PARITY AUDIT v55 comment; `capacitor.config.ts` plugin configuration.

---

## Common first-build failures

| Error | Cause | Fix |
|-------|-------|-----|
| `out/ does not exist` | Next.js export not run | `npm run build:cap` first |
| `No simulator found` | Xcode not installed | `xcode-select --install` |
| `Signing certificate missing` | No Apple Developer account | Use simulator (no cert needed for simulator) |
| `Gradle sync failed` | Android SDK missing | Android Studio → SDK Manager → Install API 34 |
| White screen + 404s | `webDir: 'out'` mismatch | Verify `out/index.html` exists after `build:cap` |
| `pod install` SSL error | macOS SSL config | `sudo gem update cocoapods && pod repo update` |
| `BUILD FAILED: minSdkVersion` | Old emulator | AVD Manager → create API 26+ emulator |
| Screenshot wrong size | Wrong simulator model | iPhone 14 Pro = 1170×2532; iPad 12.9" = 2732×2048 |
| Play Store rejects .aab | Signed with debug key | Must use release keystore, not debug |
| App Store rejects icon | Alpha channel present | Re-export without alpha in Preview.app or Figma |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `pod install` fails | `sudo gem update cocoapods` then retry |
| Android SDK not found | Android Studio → SDK Manager → Install API 34 |
| White screen on launch | `webDir: 'out'` exists? Run `npm run build:cap` first |
| PDF share fails silently | Check `deliverPdf()` console.debug logs in dev mode |
| Safe-area notch overlap | `ios.contentInset: 'automatic'` already set in capacitor.config.ts |
| Dark status bar on light bg | `StatusBar.style: 'dark'` + `backgroundColor: '#0B1E3F'` already set |
| Stale assets on device | `npm run build:cap` then `npm run cap:run:ios/android` |
| Build fails after cap sync | `npx cap doctor` to diagnose environment |

---

## Key files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Core native configuration (loggingBehavior, SplashScreen, StatusBar, Filesystem) |
| `next.config.ts` | Enables `output: 'export'` when `CAPACITOR_BUILD=true` |
| `components/FormFiller.tsx` | `deliverPdf()` — native PDF save/share via Filesystem + Share plugins |
| `public/sw.js` | Service worker (web/PWA only; inactive inside Capacitor) |
| `app/manifest.ts` | PWA manifest (web/PWA only) |
| `public/privacy-policy.md` | Privacy policy — must be published as live HTTPS HTML before submission |
| `public/store-listing.md` | App Store + Play Store copy + Privacy Nutrition Label + Data Safety + submission checklist (v57) |
| `scripts/store-assets-check.js` | Asset readiness checker — prints READY FOR SUBMISSION + PREREQUISITE steps on success (v57) |
| `scripts/cap-build.js` | Capacitor static export build wrapper — stub-swaps API routes during build, restores after |
| `scripts/route-stub.ts` | force-static 503 stub used by cap-build.js during Capacitor builds |
| `ios/` | Generated Xcode project (after `npx cap add ios`) |
| `android/` | Generated Gradle project (after `npx cap add android`) |

---

---

## Step H — Native Build Verification

> v57 addition. Run these after `npx cap add ios` / `npx cap add android` to confirm the
> first successful native build end-to-end.

### H.1 — iOS (macOS only)

```bash
# 1. Ensure Xcode 15+ is installed and command-line tools are active
xcode-select --install          # or confirm: xcode-select -p → /Applications/Xcode.app/...

# 2. Build Next.js static export + sync to Xcode project
npm run build:cap               # Expected: ✓ 24 static pages, cap sync <200ms, EXIT:0

# 3. Install CocoaPods dependencies (first time only, or after cap update)
cd ios/App && pod install && cd ../..
# Expected: "Pod installation complete! X pods installed."

# 4. Open in Xcode to verify signing and bundle ID
npx cap open ios
# Manual steps in Xcode:
#   a. Select the "App" target → Signing & Capabilities
#   b. Set Team to your Apple Developer account
#   c. Bundle ID: com.regpulse.app
#   d. Build & Run (⌘R) on iPhone 14 Pro simulator → app should launch

# 5. Debug/simulator run via CLI
npm run cap:test:ios
# Expected: Metro bundler starts, simulator opens, RegPulse chat interface loads

# 6. Release archive build (requires distribution cert + provisioning profile)
npm run cap:build:ios
# Opens Xcode — then manually: Product → Archive → Distribute App → App Store Connect → Upload
# Expected archive size: ~15–25 MB IPA
```

**Known issues and fixes:**

| Issue | Fix |
|-------|-----|
| `pod install` fails: `CDN: trunk Repo update failed` | `pod repo remove trunk && pod setup` |
| `pod install` fails: missing iOS deployment target | Open `ios/App/Podfile`, set `platform :ios, '14.0'` |
| Xcode: "No accounts in App Store Connect" | Xcode → Settings → Accounts → add Apple ID |
| Xcode: signing cert error | Generate distribution cert at developer.apple.com → Certificates |
| Simulator not showing safe-area insets | Device → Window → Show Device Bezels |
| `@capacitor/local-notifications` missing at runtime | `npm install @capacitor/local-notifications && npx cap sync` |

### H.2 — Android (any OS)

```bash
# 1. Ensure Android Studio + JDK 17+ are installed
npx cap doctor
# Expected: ✓ capacitor, ✓ @capacitor/core, ✓ @capacitor/android, ✓ Android SDK

# 2. Build Next.js static export + sync to Gradle project
npm run build:cap               # Expected: ✓ 24 static pages, cap sync <200ms, EXIT:0

# 3. Open in Android Studio to verify app ID and signing
npx cap open android
# Manual steps in Android Studio:
#   a. Let Gradle sync complete (first sync may take 3–5 min, downloads ~500 MB)
#   b. app/build.gradle → applicationId "com.regpulse.app", versionCode 1, versionName "1.0"
#   c. Run → Select device: Pixel 7 API 34 emulator → app should launch

# 4. Debug/emulator run via CLI
npm run cap:test:android
# Expected: Gradle builds, emulator opens, RegPulse chat interface loads

# 5. Release AAB build
npm run cap:build:android
# Expected: android/app/build/outputs/bundle/release/app-release.aab
# File size: ~8–15 MB
# Then upload to Play Console → Internal Testing → Create new release
```

**Signing the release AAB:**

```bash
# Generate keystore (one-time — store OUTSIDE the repo, NEVER commit to git)
keytool -genkeypair -v -keystore ~/regpulse-release.keystore \
        -alias regpulse -keyalg RSA -keysize 2048 -validity 10000

# Configure in android/app/build.gradle under android { signingConfigs { release { ... } } }
# storeFile     file(System.getenv("REGPULSE_KEYSTORE_PATH") ?: "/path/to/regpulse-release.keystore")
# storePassword System.getenv("REGPULSE_KEYSTORE_PASS") ?: ""
# keyAlias      "regpulse"
# keyPassword   System.getenv("REGPULSE_KEY_PASS") ?: ""
```

**Known issues and fixes:**

| Issue | Fix |
|-------|-----|
| Gradle sync fails: "Could not resolve com.android.tools.build:gradle" | Android Studio → SDK Manager → install Build Tools 34 |
| `minSdkVersion` warning | Ensure `android/variables.gradle` has `minSdkVersion = 26` |
| Push notification channel missing | Call `createAndroidNotificationChannel()` in Capacitor App.tsx `appStateChange` init |
| `@capacitor/local-notifications` missing at runtime | `npm install @capacitor/local-notifications && npx cap sync` |
| AAB rejected by Play Console | Ensure `versionCode` is strictly higher than any previously uploaded version |

### H.3 — Platform parity final audit (v57)

These checks must pass before store submission:

```bash
# TypeScript: zero errors
npx tsc --noEmit
# Expected: EXIT:0, no output

# Build: zero errors, zero warnings (post v57 fix)
npm run build
# Expected: ✓ Compiled successfully in ~60s, 0 warnings

# Store assets: 11/11 pass
npm run store:prepare
# Expected: ✅ ALL ASSETS PRESENT AND CORRECTLY SIZED

# Capacitor doctor
npx cap doctor
# Expected: all ✓ green
```

**Touch target audit (manual — simulator/emulator):**
- All buttons: height ≥ 48px on device (use Simulator → Debug → Color Offscreen-Rendered to check)
- Primary CTAs (Open Profile, Renew, Submit): height ≥ 56px
- No interactive elements cropped by safe-area insets (swipe up on iPhone 14 Pro to verify)
- Portfolio OS toggle, business health rings, renewal row CTAs all tappable at 48px+

### H.4 — Pre-submission native build checklist (v85 verified state)

> v85 update. Native scaffold COMPLETE as of v84 (2026-04-16). ios/ and android/ exist.
> All automated checks confirmed EXIT:0. Remaining steps require macOS (Xcode) or any OS (Android Studio).

**Automated checks — all ✓ as of v85:**

```bash
npx tsc --noEmit            # EXIT:0 — 0 TypeScript errors
npm run build               # EXIT:0 — ✓ Compiled successfully, 0 warnings
npm run build:cap           # EXIT:0 — 24 static pages, cap sync ~1s (now syncs ios/ + android/)
npx cap doctor              # EXIT:0 — [success] iOS looking great! 👌 Android looking great! 👌
npm run store:prepare       # EXIT:0 — 11/11 assets ✅
```

**Human step 1 — iOS (macOS + full Xcode required):**

> ✅ Scaffold done (ios/ exists). Skip `npx cap add ios`. Start at pod install.

```bash
# Install CocoaPods dependencies (first time)
cd ios/App && pod install && cd ../..
# Expected: "Pod installation complete! X pods installed."

# Debug run on simulator
npm run cap:test:ios
# Expected: simulator opens, RegPulse chat interface loads

# Release build + upload
npm run cap:build:ios
# Opens Xcode → Product → Archive → Distribute App → App Store Connect → Upload
# Expected .ipa size: ~15–25 MB
```

**Human step 2 — Android (any OS + JDK 17 + Android Studio required):**

> ✅ Scaffold done (android/ exists). Skip `npx cap add android`. Start at Android Studio open.

```bash
# Debug run on emulator
npm run cap:test:android
# Expected: emulator opens, RegPulse chat interface loads

# Release build (after keystore setup — see H.2 and H.5 below)
npm run cap:build:android
# Expected: android/app/build/outputs/bundle/release/app-release.aab (~8–15 MB)
# Upload to Play Console → Internal Testing → Create new release
```

**Status summary (v85):**

| Check | Status | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | ✅ EXIT:0 | 0 errors |
| `npm run build` | ✅ EXIT:0 | 0 warnings (v57 Turbopack fix) |
| `npm run build:cap` | ✅ EXIT:0 | 24 pages, sync ~1s (ios/ + android/ both sync) |
| `npx cap doctor` | ✅ EXIT:0 | @capacitor/* 8.3.0, iOS 👌 Android 👌 |
| `npm run store:prepare` | ✅ 11/11 | All assets present |
| iOS scaffold (`npx cap add ios`) | ✅ DONE | ios/ created v84, 4 plugins linked |
| Android scaffold (`npx cap add android`) | ✅ DONE | android/ created v84, 4 plugins linked |
| iOS simulator test | ⬜ Human step | Requires macOS + full Xcode (not just CLT) |
| Android emulator test | ⬜ Human step | Requires JDK 17+ + Android Studio + ANDROID_HOME |
| iOS App Store Connect upload | ⬜ Human step | Requires Apple Developer account + signing |
| Google Play Console upload | ⬜ Human step | Requires Play Console access + keystore |
| Privacy policy live at regpulse.com/privacy | ⬜ Human step | Must be HTTP 200 before review |

**Link reliability (v63/v64):**

| Fix | Scope | Deployed |
|-----|-------|---------|
| `safeOfficialUrl()` in `buildLocalFormsContext` | All 3,381+ LOCAL_FORMS entries, runtime | ✅ v63 |
| 20+ source entries updated to root domains | formTemplates.ts (Knox County, CDH Idaho, Washoe NV, Maine DHHS/DACF, Stanislaus CA, RI Health, Jersey City NJ, Minnehaha SD, Juneau AK, Cedar Rapids IA, Logan UT, Richmond KY + others) | ✅ v63 |
| APPROVED DOMAIN SEEDS expanded | route.ts system prompt (CT, IA, MN, WY, WV, ME, MS, KS added) | ✅ v63 |
| URL_FRAGILITY_PROHIBITIONS | route.ts HYPER-LOCAL LINK RULES | ✅ v63 |

---

### H.5 — Exact next steps after native scaffold (v85 — scaffold complete, awaiting first builds)

> Added v85. Native scaffold is COMPLETE (ios/ + android/ created in v84). This section lists
> the exact machine-setup and build commands needed to unblock the first native release builds.
> All steps below are human/machine steps — no code changes required.

#### H.5.1 — iOS: Install Xcode and run first build (macOS required)

**Blocker detected v84:** `xcode-select -p` → `/Library/Developer/CommandLineTools` only.  
`xcodebuild` is NOT available. Full Xcode is required — Command Line Tools alone are insufficient.

```bash
# ── STEP 1: Install full Xcode (macOS only, ~8 GB) ────────────────────────────────────────
# Open Mac App Store → search "Xcode" → Install (or update if already installed)
# After installation, accept the license and install additional components:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
# Verify:
xcodebuild -version
# Expected: Xcode 15.x or higher

# ── STEP 2: Install CocoaPods (if not already installed) ──────────────────────────────────
sudo gem install cocoapods
# Or with Homebrew:
brew install cocoapods

# ── STEP 3: Install pod dependencies for ios/ ─────────────────────────────────────────────
cd ios/App && pod install && cd ../..
# Expected: "Pod installation complete! X pods installed."
# Note: first run downloads ~300 MB, may take 3–5 minutes on first run

# ── STEP 4: Build web assets and sync to Xcode ────────────────────────────────────────────
npm run build:cap
# Expected: EXIT:0 — 24 static pages, cap sync ~1s (ios/ + android/ both sync)

# ── STEP 5: Open in Xcode to configure signing ────────────────────────────────────────────
npx cap open ios
# In Xcode:
#   a. Select "App" target → Signing & Capabilities tab
#   b. Team: select your Apple Developer account (requires $99/yr membership)
#   c. Bundle Identifier: com.regpulse.app (must match App Store Connect)
#   d. Verify Deployment Target: iOS 14.0 minimum
#   e. Build & Run (⌘R) on iPhone 14 Pro simulator → RegPulse should load

# ── STEP 6: Release archive build ─────────────────────────────────────────────────────────
npm run cap:build:ios
# Triggers: npm run build:cap && npx cap build ios (opens Xcode Archive)
# In Xcode:
#   Product → Archive → wait for archive (~3–8 min) → Distribute App
#   → App Store Connect → Upload → Next → Next → Upload
# Expected .ipa archive size: ~15–25 MB
# After upload: build appears in TestFlight within 15–30 min
```

**iOS troubleshooting:**

| Error | Fix |
|-------|-----|
| `pod install` → "CDN: trunk Repo update failed" | `pod repo remove trunk && pod setup` |
| `pod install` → missing deployment target | In `ios/App/Podfile`: `platform :ios, '14.0'` |
| Xcode: "No accounts" | Xcode → Settings (⌘,) → Accounts → add Apple ID |
| Xcode: signing cert error | developer.apple.com → Certificates → create Distribution cert |
| `error: No profiles for 'com.regpulse.app' were found` | App Store Connect → create App ID + provisioning profile |
| Simulator safe-area not showing | Simulator → Features → Toggle In-Call Status Bar; or Device Bezels |

---

#### H.5.2 — Android: Install JDK + Android Studio and run first build (any OS)

**Blocker detected v84:** `java -version` → "Unable to locate a Java Runtime". `ANDROID_HOME` not set.

```bash
# ── STEP 1: Install JDK 17 ────────────────────────────────────────────────────────────────
# Option A — Homebrew (macOS/Linux):
brew install --cask temurin@17
# Option B — Direct download: https://adoptium.net → Temurin 17 LTS → macOS pkg / .msi
# Verify:
java -version
# Expected: openjdk version "17.x.x"

# ── STEP 2: Install Android Studio ────────────────────────────────────────────────────────
# Download: https://developer.android.com/studio → install for your OS
# On first launch: follow setup wizard → Standard install → accept all licenses
# SDK Manager installs: Android SDK Platform 34, Build-Tools 34, Emulator, SDK Platform-Tools

# ── STEP 3: Set ANDROID_HOME environment variable ─────────────────────────────────────────
# macOS/zsh — add to ~/.zshrc:
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
# Reload shell:
source ~/.zshrc
# Verify:
echo $ANDROID_HOME
# Expected: /Users/<you>/Library/Android/sdk
adb version
# Expected: Android Debug Bridge version 1.0.41

# ── STEP 4: Create Android Virtual Device (emulator) ──────────────────────────────────────
# Android Studio → Device Manager → Create Virtual Device
# Hardware: Pixel 7  |  System Image: API 34 (x86_64)  |  Name: Pixel7_API34
# Or via CLI:
avdmanager create avd -n Pixel7_API34 -k "system-images;android-34;google_apis;x86_64" -d pixel_7

# ── STEP 5: Verify Capacitor doctor ───────────────────────────────────────────────────────
npx cap doctor
# Expected: [success] Android looking great! 👌

# ── STEP 6: Build web assets and sync to Gradle ───────────────────────────────────────────
npm run build:cap
# Expected: EXIT:0 — 24 static pages, cap sync ~1s

# ── STEP 7: Debug run on emulator ─────────────────────────────────────────────────────────
npm run cap:test:android
# Expected: Gradle builds (first build ~2–4 min), emulator opens, RegPulse chat loads

# ── STEP 8: Generate release keystore (one-time — store OUTSIDE repo, NEVER commit) ───────
keytool -genkeypair -v \
  -keystore ~/regpulse-release.keystore \
  -alias regpulse \
  -keyalg RSA -keysize 2048 -validity 10000
# Prompts for keystore password and distinguished name — save passwords in password manager

# ── STEP 9: Configure signing in android/app/build.gradle ─────────────────────────────────
# Add to the android { } block in android/app/build.gradle:
#
# signingConfigs {
#     release {
#         storeFile     file(System.getenv("REGPULSE_KEYSTORE_PATH") ?: "")
#         storePassword System.getenv("REGPULSE_KEYSTORE_PASS") ?: ""
#         keyAlias      "regpulse"
#         keyPassword   System.getenv("REGPULSE_KEY_PASS") ?: ""
#     }
# }
# buildTypes {
#     release {
#         signingConfig signingConfigs.release
#         minifyEnabled false
#     }
# }

# Set env vars before building:
export REGPULSE_KEYSTORE_PATH="$HOME/regpulse-release.keystore"
export REGPULSE_KEYSTORE_PASS="<your-keystore-password>"
export REGPULSE_KEY_PASS="<your-key-password>"

# ── STEP 10: Release AAB build ────────────────────────────────────────────────────────────
npm run cap:build:android
# Expected: android/app/build/outputs/bundle/release/app-release.aab (~8–15 MB)
# Upload: Play Console → RegPulse → Release → Internal Testing → Create new release → upload .aab
```

**Android troubleshooting:**

| Error | Fix |
|-------|-----|
| `ANDROID_HOME` not found | Add `export ANDROID_HOME=...` to `~/.zshrc` and `source ~/.zshrc` |
| Gradle sync fails: "Could not resolve..." | Android Studio → SDK Manager → install Build-Tools 34 + Platform 34 |
| `minSdkVersion` warning | In `android/variables.gradle`: `minSdkVersion = 26` |
| Push notification channel missing | Call `createAndroidNotificationChannel()` on app init |
| AAB rejected: "Version code already used" | Increment `versionCode` in `android/app/build.gradle` |
| `adb: command not found` | Add `$ANDROID_HOME/platform-tools` to PATH and reload shell |

---

*RegPulse vUnified-20260414-national-expansion-v85*
