// vUnified-20260414-national-expansion-v19 — Full store-ready manifest:
//   - Expanded description with App Store-compliant copy (≤255 chars short_description).
//   - Added related_applications stubs for iOS App Store + Google Play (fill in IDs post-submission).
//   - Confirmed screenshots array paths match scripts/store-assets-check.js required asset list.
//   - Added prefer_related_applications: false — PWA install takes priority on web.
//   - lang, orientation, categories, id fields finalized for store submission.
// vUnified-20260414-national-expansion-v17 — Store-ready manifest polish:
//   - Added screenshots array (portrait + wide) for PWA install UI and App Store reference.
//   - Added categories, orientation, lang, and related_applications stubs.
//   - Screenshots reference public/screenshots/ path — create actual PNGs before store submission.
//   - Privacy policy URL added for App Store / Play Store metadata requirement.
// vUnified-20260414-national-expansion-v14 — PWA manifest (initial). Auto-served at /manifest.webmanifest.
import { MetadataRoute } from 'next';

// v52: required for Next.js static export (output:'export' / Capacitor build) —
// manifest content is fully static so force-static is correct; this pre-renders
// the /manifest.webmanifest endpoint at build time into the out/ static export.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // ── App identity ────────────────────────────────────────────────────────────
    name: 'RegPulse',
    short_name: 'RegPulse',
    // vUnified-20260414-national-expansion-v19: App Store-compliant description (≤255 chars for short store blurb).
    // Full long description (up to 4000 chars) goes in App Store Connect / Play Console directly.
    description:
      'AI-powered business compliance assistant — instantly find permits, licenses, and local regulations ' +
      'for your city and county. Built for small businesses, food trucks, contractors, and side hustlers.',

    // ── Display and behavior ────────────────────────────────────────────────────
    // id: canonical app identity; matches bundle ID com.regpulse.app for disambiguation.
    id: '/chat',
    start_url: '/chat',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0B1E3F',
    orientation: 'portrait-primary',
    lang: 'en-US',
    categories: ['business', 'productivity', 'utilities'],

    // vUnified-20260414-national-expansion-v19: prefer_related_applications: false — PWA install
    // takes priority on web. Native apps are listed as related but not preferred over the PWA.
    prefer_related_applications: false,

    // vUnified-20260414-national-expansion-v19: related_applications — fill in store IDs after
    // first submission. Leave as stubs until Apple/Google assigns IDs.
    // iOS App Store ID format: id + numeric ID from App Store Connect.
    // Android Play Store ID: applicationId from build.gradle.
    related_applications: [
      {
        platform: 'itunes',
        url: 'https://apps.apple.com/app/regpulse/id000000000',
        id: 'com.regpulse.app',
      },
      {
        platform: 'play',
        url: 'https://play.google.com/store/apps/details?id=com.regpulse.app',
        id: 'com.regpulse.app',
      },
    ],

    // ── Icons ───────────────────────────────────────────────────────────────────
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],

    // ── Screenshots ─────────────────────────────────────────────────────────────
    // vUnified-20260414-national-expansion-v17/v19: screenshots for PWA install dialog and store metadata.
    // Run `npm run store:prepare` to verify these assets exist before submission.
    // Portrait (phone):   1170×2532 px — iPhone 14 Pro native resolution (used for iOS App Store)
    // Portrait (Android): 1080×1920 px — standard Android phone screenshot
    // Wide (tablet):      2048×1536 px — iPad / Android tablet
    screenshots: [
      {
        src: '/screenshots/screenshot-chat-portrait.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/screenshots/screenshot-form-portrait.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/screenshots/screenshot-profile-portrait.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/screenshots/screenshot-chat-wide.png',
        sizes: '2048x1536',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  };
}
