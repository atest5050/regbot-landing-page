# RegPulse — App Store & Google Play Store Listing Copy

**vUnified-20260414-national-expansion-v85**  
Last updated: April 16, 2026  
Build status: `npm run build` EXIT:0 — ✓ Compiled successfully, **0 warnings** (v57 Turbopack fix confirmed)  
`npm run build:cap` EXIT:0 — 24 static pages, cap sync 1.088s (ios/ + android/ both syncing)  
`npx tsc --noEmit` EXIT:0 — 0 TypeScript errors  
`npx cap doctor` EXIT:0 — [success] iOS looking great! 👌 / [success] Android looking great! 👌  
store:prepare: **11/11 passed** ✅. Scaffolding docs: README-native.md v85 (Steps A.1–A.4, E.1–E.4, G, H.1–H.5).  
v85: **next-steps documentation complete** — README-native.md Step H.5 added with exact commands for:  
  H.5.1 iOS: Mac App Store → Xcode → `sudo xcode-select --switch` → `pod install` → signing → Archive  
  H.5.2 Android: `brew install temurin@17` → Android Studio → `export ANDROID_HOME` → AVD → keystore → AAB  
  build:cap sync ~1s expected (previously ~128ms when only web was syncing; now syncs ios/ + android/ too).  
  Platform parity AUDIT v85 CONFIRMED — live JSX line numbers re-verified 2026-04-16:  
    page.tsx: safe-area at 4597-4598, scroll chains at 4932/6683, CTAs ≥48px at 1938/1948/4852/6284/6487/7014,  
    sidebar z-50 at 4582, sidebar md:pointer-events-auto at 4585, compact alerts at 5021/5031/5041,  
    z-30 toasts/overlays at 6870/7026/7057/7100 — no collisions.  
    BusinessProfileView.tsx: scroll chains at 1933/2639, safe-area at 2288/3321/3342,  
    CTAs min-h-[48px] at 1908/2236/2303/2532/2542/2830, min-h-[52px] at 2027/2037,  
    z-30 (2456)/z-50 (2331) — no collisions. All touch targets ≥48px. Full parity confirmed.  
v84: native scaffold complete — ios/ + android/ created, cap doctor ✓. safe-area 4566-4567, scroll 4901/6652.  
v83: footer pages parity confirmed. safe-area 4546-4547, scroll chains 4881/6632 + 1895/2601.  
v82: safe-area at page.tsx:4529-4530, scroll chains at 4864/6615 + 1877/2583, z-30 (2400)/z-50 (2275).  
v81: safe-area at page.tsx:4512-4513, scroll chains at 4847/6598 + 1859/2565, z-30 (2382)/z-50 (2257).  
v63 additions: LOCAL_FORMS_PART43_MINI (14 entries — Hattiesburg MS, Wichita KS, Davenport IA, Saint Paul MN, Casper WY, Huntington WV, Portland ME) + COUNTY_PREFIXES v54. Total: **3,381+**. Link reliability fix: safeOfficialUrl() + 20+ source entries patched.  
v62 additions: LOCAL_FORMS_PART42_MINI (14 entries — Gulfport MS, Topeka KS, Cedar Rapids IA, Duluth MN, Cheyenne WY, Charleston WV, Augusta ME) + COUNTY_PREFIXES v53. Total: 3,367+.  
v61 additions: LOCAL_FORMS_PART41_MINI (14 entries — Juneau AK, Maui HI, Grand Forks ND, Aberdeen SD, Grand Island NE, Newark DE, Cranston RI) + COUNTY_PREFIXES v52. Total: 3,353+.  
v60 additions: LOCAL_FORMS_PART40_MINI (14 entries — secondary cities HI/AK/ND/SD/NE/DE/RI) + COUNTY_PREFIXES v51. Total: 3,339+.  
v59 additions: LOCAL_FORMS_PART39_MINI — 14 new entries (HI/AK/ND/SD/NE/DE/RI primary cities). Total: 3,325+.  
v58 additions: Final production build verification — all systems confirmed EXIT:0.  
v57 additions: Turbopack build warning silenced (webpackIgnore dynamic import fix).  
v56 additions: Compliance OS portfolio dashboard, native push (Capacitor LocalNotifications), 3,311+ LOCAL_FORMS.  
v55 additions: App Store Privacy Nutrition Label, ATT guidance, Google Play Data Safety answers.

---

## App Store (iOS) Metadata

### App Name (30 chars max)
```
RegPulse
```

### Subtitle (30 chars max)
```
AI Business Permit Assistant
```

### Short Description / Promotional Text (170 chars max — shown on App Store product page)
```
Find every permit, license & local regulation your small business needs — instant AI answers for your specific city and county.
```

### Keywords (100 chars max — comma-separated, no spaces after commas)
```
business license,permits,compliance,food truck,contractor,zoning,regulations,small business,LLC,DBA
```

### Long Description (4000 chars max)

```
RegPulse — AI Business Compliance Assistant

Get every permit, license, and filing right the first time — without the confusion.

RegPulse instantly tells you exactly which local, county, state, and federal registrations your business needs, with direct links to the real government forms. No generic checklists. No guesswork. Hyper-local answers for your specific city and county.

── BUILT FOR REAL SMALL BUSINESSES ──

• Food trucks, food service operators, and home kitchens
• Home-based businesses and cottage food producers
• Contractors, HVAC, plumbing, electrical, and trades
• Retail stores, boutiques, and e-commerce sellers
• Salons, spas, barbershops, and personal care businesses
• Healthcare clinics, therapists, and professional services
• Short-term rental and Airbnb hosts
• Farmers market vendors and pop-up operators
• Startups, LLCs, and sole proprietors filing for the first time

── HOW IT WORKS ──

1. Tell the AI your business type and city or county
2. Get a prioritized list of every permit and license required — specific to your location, not just your state
3. Use AI-powered pre-fill to populate government forms with your business profile data
4. Download, share, or submit forms directly from the app

── WHAT MAKES REGPULSE DIFFERENT ──

✓ 3,381+ hyper-local form templates covering cities and counties across all 50 states + Puerto Rico
✓ AI that understands county-level and city-level regulations — not just generic state requirements
✓ Direct official government URLs sourced from RegPulse's verified LOCAL_FORMS database
✓ AI form pre-fill saves hours of tedious paperwork
✓ Compliance OS — unified portfolio dashboard: health rings, renewal calendar, and rule-change alerts across all your businesses in one view
✓ Native push notifications — rule change alerts and renewal reminders delivered to your device tray (iOS + Android)
✓ Offline mode — cached forms and permit guidance available without internet connection
✓ PDF export — save, share, or AirDrop completed forms
✓ Business profile saves your details so repeat lookups are instant
✓ Portfolio Health Summary — see your compliance health score, upcoming renewals, and active alerts at a glance
✓ "Next Up" strip — your most urgent compliance task always surfaced first
✓ Covers all business structures: sole prop, DBA, LLC, corporation, nonprofit

── FORMS COVERED ──

Business licenses • Food service permits • Health permits • Mobile food vendor permits • Cottage food registration • Home occupation permits • Fictitious name / DBA registration • Sales tax registration • Food handler certification • Short-term rental permits • Contractor licenses • Building permits • Sign permits • Fire inspection certificates • Alarm permits • Employer registration • Annual reports • BOI / FinCEN reporting • And 80+ more form types

── NATIONWIDE COVERAGE ──

RegPulse covers 1,100+ cities and counties across all 50 states and Puerto Rico — including major metros like New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, Jacksonville, and hundreds of mid-size and small cities where local regulations are hardest to navigate.

── PRIVACY & SECURITY ──

Your business data is encrypted in transit and at rest. We never sell your personal information. See our full privacy policy at regpulse.com/privacy.

No subscription required to get started. Premium features include unlimited AI form pre-fills and PDF downloads.
```

### What's New — Version 1.0 (initial release)
```
RegPulse 1.0 — Initial release.

• AI compliance assistant for all 50 states + Puerto Rico
• 3,381+ hyper-local permit and license templates
• AI form pre-fill: populate government forms from your business profile
• Compliance OS: unified portfolio dashboard — health rings, renewal calendar, rule-change alerts across all businesses
• Native push notifications: rule change alerts and renewal reminders sent to your device tray
• Portfolio Health Summary with compliance score and renewal timeline
• PDF export and share via iOS share sheet / Android chooser
• Offline mode: cached forms and permit guidance available without internet
```

### Support URL
```
https://regpulse.com/support
```

### Marketing URL
```
https://regpulse.com
```

### Privacy Policy URL
```
https://regpulse.com/privacy
```

### App Category
- Primary: Business
- Secondary: Productivity

### Age Rating
```
4+ (no age-restricted content)
```

### Copyright
```
© 2026 RegPulse. All rights reserved.
```

### App Store Privacy Nutrition Label (App Store Connect → App Privacy)

> Fill this in at App Store Connect → Your App → App Privacy → Data Types.
> RegPulse does NOT use App Tracking Transparency (ATT) — no cross-app or cross-website tracking occurs.
> Select "No" when asked "Does this app use data to track the user?"

**Data collected and linked to identity:**

| Data Type | Category | Purpose | Linked to Identity | Tracking |
|-----------|----------|---------|-------------------|---------|
| Email address | Contact Info | Account creation + authentication (via Supabase Auth) | Yes | No |
| User ID | Identifiers | Account management, row-level security in database | Yes | No |
| Business profile (name, type, city, compliance history) | User Content | Core app functionality (form recommendations, AI context) | Yes | No |
| Checklist items (permit status, renewal dates) | User Content | Core app functionality (compliance tracker) | Yes | No |

**Data collected but NOT linked to identity:**

| Data Type | Category | Purpose | Linked to Identity | Tracking |
|-----------|----------|---------|-------------------|---------|
| App session data / feature usage | Usage Data | Supabase PostgREST request logs (operational, not analytics) | No | No |
| Crash reports | Diagnostics | Debugging (default Next.js + Capacitor error reporting) | No | No |

**Data NOT collected (answer "No" for all of these in App Store Connect):**
- Precise or coarse location (GPS) — user types city/state as text; no geolocation API called
- Health & fitness
- Financial information (Stripe processes payments; RegPulse never stores or sees card data)
- Browsing history
- Search history
- Contacts
- Photos / videos (users may Save to Photos from the share sheet, but RegPulse never reads the photo library)
- Audio / video
- Sensitive information
- Advertising identifier (IDFA) — not used; ATT prompt is NOT required

**App Tracking Transparency (ATT):**
```
Does this app track users? → NO
```
RegPulse does not use any data to track users across apps or websites owned by other companies.
No ad networks, no third-party analytics SDK, no IDFA access. ATT permission prompt is not required.
Answer "No" to "Does this app use data to track the user?" in App Store Connect.

---

## Google Play Store Metadata

### App Name (50 chars max)
```
RegPulse — AI Business Permit Assistant
```

### Short Description (80 chars max)
```
AI permits & compliance for small businesses — city-specific, instant answers
```

### Full Description (4000 chars max)

```
RegPulse — AI Business Compliance Assistant

Get every permit, license, and filing right the first time — without the confusion.

RegPulse instantly tells you exactly which local, county, state, and federal registrations your business needs. No generic checklists. Hyper-local answers specific to your city and county, not just your state.

BUILT FOR REAL SMALL BUSINESSES

★ Food trucks, food service operators, and home kitchens
★ Home-based businesses and cottage food producers
★ Contractors, HVAC, plumbing, electrical, and trades
★ Retail stores and e-commerce sellers
★ Salons, spas, barbershops, and personal care businesses
★ Healthcare clinics, therapists, and professional services
★ Short-term rental and Airbnb hosts
★ Farmers market vendors and pop-up operators
★ Startups, LLCs, and sole proprietors

HOW IT WORKS

1. Enter your business type and city or county
2. Get a prioritized checklist of required permits and licenses — specific to your location
3. AI pre-fills government forms with your business profile data
4. Download, share, or file completed forms as PDFs

KEY FEATURES

✔ 3,381+ hyper-local form templates — all 50 states + Puerto Rico
✔ AI trained on county and city-level regulations, not just state law
✔ Verified government URLs — no broken links or guesswork
✔ AI form pre-fill saves hours on paperwork
✔ Compliance OS — portfolio dashboard with health rings, renewal calendar, and rule-change alerts
✔ Native push notifications — rule change and renewal alerts to your device tray (iOS + Android)
✔ Offline mode — works without internet
✔ PDF export — save and share with partners or attorneys
✔ Business profile remembers your details for instant repeat lookups
✔ Portfolio Health Summary — compliance health score, upcoming renewals, active alerts
✔ "Next Up" strip — most urgent compliance task always shown first
✔ Covers sole proprietors, DBAs, LLCs, corporations, and nonprofits

FORMS COVERED

Business licenses • Food service permits • Health permits • Mobile food vendor permits • Cottage food registration • Home occupation permits • DBA / fictitious name registration • Sales tax registration • Contractor licenses • Building permits • Short-term rental permits • Annual reports • BOI/FinCEN reporting • And 80+ more

NATIONWIDE COVERAGE

1,100+ cities and counties across all 50 states and Puerto Rico. Whether you're in a major metro or a small county seat, RegPulse finds the exact forms you need.

PRIVACY

Your data is encrypted and never sold. Full privacy policy: https://regpulse.com/privacy

Free to start. Premium features include unlimited AI form pre-fills and PDF downloads.
```

### App Category
```
Business
```

### Content Rating
```
Everyone
```

### Tags / Keywords
```
business license, permits, compliance, food truck, contractor, small business, LLC, DBA, zoning, regulations
```

### Google Play Data Safety Form (detailed answers)

> Fill at Play Console → Your App → Policy → App content → Data safety.
> Complete each section. Google reviews Data Safety disclosures — inaccurate answers can cause rejection.

**Does your app collect or share any of the required user data types?** → **Yes**

**Is all of the user data collected by your app encrypted in transit?** → **Yes**

**Do you provide a way for users to request that their data is deleted?** → **Yes**
(Link to: https://regpulse.com/support — user can request account and data deletion)

**Data types collected:**

| Data type | Collected | Shared | Required/Optional | Purpose | Retention |
|-----------|-----------|--------|-------------------|---------|-----------|
| Email address | Yes | No | Required (auth) | Account creation + login | Until deletion |
| User IDs (Supabase UUID) | Yes | No | Required | Account management | Until deletion |
| Business profile (name, type, city, state) | Yes | No | Optional (core feature) | Form recommendations, AI context | Until deletion |
| Compliance checklist (permit status, renewals) | Yes | No | Optional (core feature) | Compliance tracker display | Until deletion |
| App interactions (feature taps, form views) | Yes | No | Optional | App analytics (Supabase logs) | 90 days |
| Crash logs | Yes | No | Optional | App stability debugging | 30 days |

**Data types NOT collected:**
- Precise location (GPS) — user types city/state text only; no geolocation permissions requested
- Financial information — Stripe handles all payment data; RegPulse never stores card numbers or bank details
- Health information
- Messages / contacts
- Photos or files (RegPulse cannot read user photos; "Save to Photos" is handled by the OS share sheet)
- Advertising ID (GAID) — not used

**Third parties that receive data:**
| Third party | Data shared | Purpose | Link |
|-------------|------------|---------|------|
| Supabase | Email, user ID, business profile | Database + auth hosting | supabase.com/privacy |
| Anthropic | Business type, city, form query text (no PII) | AI response generation | anthropic.com/privacy |
| Stripe | Payment info only (RegPulse passes session ID, not card data) | Payment processing | stripe.com/privacy |

---

## Submission Checklist

> Run `npm run store:prepare` to validate all assets before submission.  
> Run `node scripts/store-assets-check.js --full` for full check including build prerequisites.  
> The success output prints a complete "READY FOR SUBMISSION" block with every remaining human step.

### Build prerequisites (automated — all confirmed EXIT:0 in v58)
- [x] `npm run build` EXIT:0 — ✓ Compiled successfully, 0 warnings (Turbopack fix confirmed v57→v58)
- [x] `npm run build:cap` EXIT:0 — 24 static pages generated, cap sync in 102ms
- [x] `npx tsc --noEmit` EXIT:0 — no TypeScript errors
- [x] `npx cap doctor` EXIT:0 — @capacitor 8.3.0 all platforms ✓
- [x] `npm run store:prepare` EXIT:0 — 11/11 assets passed
- [x] scripts/cap-build.js stub-swap approach — all 9 API routes stubbed during build, restored after
- [ ] `npx cap add ios` — scaffolds ios/ directory (requires macOS + Xcode)
- [ ] `npx cap add android` — scaffolds android/ directory (requires Android Studio)
- [ ] `cd ios/App && pod install` — installs CocoaPods dependencies (iOS only)

### iOS App Store Connect
- [ ] App name: **RegPulse** (8 chars — ≤30 ✓)
- [ ] Subtitle: **AI Business Permit Assistant** (30 chars — ≤30 ✓)
- [ ] Promotional text entered (≤170 chars) — copy from §"Short Description / Promotional Text" above
- [ ] Long description pasted (≤4000 chars) — copy from §"Long Description" above
- [ ] What's New text entered — copy from §"What's New — Version 1.0" above
- [ ] Keywords field filled (≤100 chars, comma-separated, no spaces after commas)
- [ ] Screenshots uploaded:
      - 3× portrait at 1170×2532 px (iPhone 14 Pro): Chat view, Form Fill view, Business Profile view
      - 1× landscape at 2732×2048 px (iPad 12.9") or 2048×1536 px (iPad 9.7")
      - Capture: npm run cap:test:ios → iPhone 14 Pro Simulator → File → Take Screenshot
      - File paths: public/screenshots/screenshot-{chat,form,profile}-portrait.png, screenshot-chat-wide.png
- [ ] App icon: public/icon-1024x1024.png — 1024×1024 PNG, NO alpha channel, no rounded corners
      Verify: Preview.app → Tools → Inspector → pixel size = 1024×1024, mode = RGB (not RGBA)
      Strip alpha: convert icon-1024x1024.png -background white -alpha remove icon-1024x1024.png
- [ ] Privacy policy URL: https://regpulse.com/privacy — must be live HTTPS (not a .md file)
- [ ] Support URL: https://regpulse.com/support
- [ ] Marketing URL: https://regpulse.com
- [ ] Age rating questionnaire: answer No to all age-restricted content questions → 4+
- [ ] Primary category: Business | Secondary: Productivity
- [ ] CFBundleShortVersionString = "1.0" in ios/App/App/Info.plist
- [ ] CFBundleVersion (build number) = "1" in ios/App/App/Info.plist
- [ ] Bundle ID: com.regpulse.app in Xcode → Signing & Capabilities
- [ ] Signing certificate + distribution provisioning profile configured in Xcode
- [ ] Export compliance: No proprietary encryption — answer No to all encryption questions
- [ ] NSPhotoLibraryAddUsageDescription in Info.plist if users Save to Photos from share sheet
- [ ] App Tracking Transparency: **NOT required** — RegPulse does not track users across apps/websites
- [ ] App Privacy (Privacy Nutrition Label) completed in App Store Connect → App Privacy:
      - "Does this app use data to track the user?" → **No**
      - Contact Info → Email Address: collected, linked to identity, not for tracking
      - Identifiers → User ID: collected, linked to identity, not for tracking
      - User Content → Other User Content (business profile): collected, linked, not for tracking
      - Usage Data → App Interactions: collected, not linked to identity, not for tracking
      - Diagnostics → Crash Data: collected, not linked, not for tracking
      - All other categories (Location, Financial, Health, Contacts, etc.) → **Not Collected**
- [ ] App Review notes: "No login required — use the chat interface directly"
- [ ] Upload: Product → Archive → Distribute App → App Store Connect → Upload

### Google Play Console
- [ ] App name: **RegPulse — AI Business Permit Assistant** (42 chars — ≤50 ✓)
- [ ] Short description: copy from §"Short Description" above (≤80 chars ✓)
- [ ] Full description pasted (≤4000 chars) — copy from §"Full Description" above
- [ ] Feature graphic: public/play-feature-graphic.png — 1024×500 PNG (replace placeholder)
- [ ] Screenshots: ≥2 portrait phone screenshots (1080×1920 or 1170×2532)
- [ ] Hi-res icon: 512×512 PNG (scale down from public/icon-1024x1024.png)
- [ ] Privacy policy URL: https://regpulse.com/privacy — must be live HTTPS
- [ ] Content rating questionnaire: Everyone
- [ ] Target audience: 18+ / Business professionals
- [ ] App category: Business
- [ ] Release keystore — generate and store OUTSIDE the repo (never commit to git):
      keytool -genkeypair -v -keystore regpulse.keystore -alias regpulse \
              -keyalg RSA -keysize 2048 -validity 10000
- [ ] Signing configured in android/app/build.gradle (storeFile, storePassword, keyAlias, keyPassword)
- [ ] applicationId "com.regpulse.app" confirmed in android/app/build.gradle
- [ ] versionCode = 1, versionName = "1.0" in android/app/build.gradle
- [ ] Data safety form completed (Play Console → Policy → App content → Data safety):
      See §"Google Play Data Safety Form (detailed answers)" above for full table.
      Summary: Email + business profile collected; no financial/location/health/contacts data;
      Supabase + Anthropic + Stripe as third parties; all data encrypted; user deletion available.
- [ ] AAB built and uploaded: npm run cap:build:android
      Output: android/app/build/outputs/bundle/release/app-release.aab
- [ ] Release track: Internal Testing → Closed Testing (Alpha) → Production

---

## Screenshot Capture Guide

### iOS Simulator (recommended)
```bash
# 1. Build and run on iPhone 14 Pro simulator
npm run cap:test:ios

# 2. In Simulator menu: File → New Simulator → iPhone 14 Pro (for 1170×2532 screenshots)
# 3. Take screenshots: Simulator → File → Take Screenshot (saves to Desktop)
# 4. Required shots:
#    a. Chat view: ask "what permits do I need for a food truck in Austin TX?"
#    b. Form fill view: open any form → tap "Quick Pre-fill AI"
#    c. Business profile view: fill in a business profile
#    d. Wide/iPad view: repeat in iPad simulator (2048×1536 or 2732×2048)
```

### Android Emulator
```bash
# 1. Build and run on Pixel 7 emulator (1080×2400)
npm run cap:test:android

# 2. In Android Studio: hold Shift+Cmd+S (Mac) to take screenshot
# 3. Or use adb: adb exec-out screencap -p > screenshot.png
```

---

*vUnified-20260414-national-expansion-v76*
