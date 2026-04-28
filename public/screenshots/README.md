# RegPulse Store Screenshots

Place real PNG screenshots here before App Store / Play Store submission.

## Required files

| Filename | Size | Platform | Notes |
|----------|------|----------|-------|
| `screenshot-chat-portrait.png`    | 1170×2532 px | iOS (iPhone 14 Pro) | Chat interface |
| `screenshot-form-portrait.png`    | 1170×2532 px | iOS (iPhone 14 Pro) | Form fill / AI pre-fill |
| `screenshot-profile-portrait.png` | 1170×2532 px | iOS (iPhone 14 Pro) | Business profile view |
| `screenshot-chat-wide.png`        | 2048×1536 px | iPad / tablet        | Chat interface landscape |

## How to capture

1. Run the app on iOS Simulator (iPhone 14 Pro): `npm run cap:test:ios`
2. In Simulator: **File → Take Screenshot** (⌘S) — saves to Desktop
3. Rename and move to this directory
4. For iPad screenshots: switch simulator to iPad Pro 12.9" and repeat

## Required icons (place in `public/`)

| Filename | Size | Notes |
|----------|------|-------|
| `icon-1024x1024.png`        | 1024×1024 px | iOS App Store — **no alpha channel**, no rounded corners |
| `play-feature-graphic.png`  | 1024×500 px  | Google Play Store feature graphic |
| `web-app-manifest-512x512.png` | 512×512 px | PWA + Android adaptive icon (maskable) |
| `web-app-manifest-192x192.png` | 192×192 px | PWA install icon |
| `apple-touch-icon.png`      | 180×180 px   | iOS home screen shortcut |

Run `npm run store:prepare` to validate all assets are present and correctly sized.

---
*vUnified-20260414-national-expansion-v19*
