# RegPulse Privacy Policy

**Last updated:** April 14, 2026  
**Effective date:** April 14, 2026

RegPulse ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use the RegPulse application (web, iOS, Android) and related services.

---

## 1. Information We Collect

### 1.1 Information You Provide Directly
- **Business profile information**: business name, business type, owner/operator name, business location (city, state, county).
- **Chat messages and queries**: questions and compliance-related requests you submit to the AI assistant.
- **Account credentials**: email address and password (when creating an account via Supabase Auth).
- **Payment information**: billing name and card details, processed securely through Stripe. RegPulse never stores raw card numbers or CVVs.

### 1.2 Information Collected Automatically
- **Usage data**: pages visited, features used, session duration, button clicks, and form completions — collected via Google Analytics 4 (GA4).
- **Device and browser information**: operating system, browser type and version, device type (mobile/tablet/desktop), screen resolution.
- **IP address**: collected by Vercel hosting infrastructure and by GA4 (with IP anonymization enabled). Not stored by RegPulse directly.
- **Service worker / cache state**: anonymous flags stored in your browser's local cache for offline functionality. No personal data is stored in the service worker cache.

### 1.3 Information We Do NOT Collect
- We do not collect Social Security Numbers, government-issued ID numbers, or tax identification numbers.
- We do not access your device camera, microphone, location services, or contacts.
- We do not track your activity across third-party websites or apps.

---

## 2. How We Use Your Information

We use your information solely to:

- Provide AI-powered compliance recommendations tailored to your business location and type.
- Pre-fill government permit and license application forms with your business profile data.
- Improve the accuracy and geographic coverage of our LOCAL_FORMS database (using fully anonymized, aggregated data only).
- Process and manage payments for premium features via Stripe.
- Send transactional emails related to your account (password resets, form completion confirmations, renewal reminders) — only if you have an account and have not opted out.
- Detect, investigate, and prevent fraudulent or unauthorized use of the service.
- Comply with applicable legal obligations.

We do **not** use your data for advertising, behavioral profiling, or sale to data brokers.

---

## 3. Data Sharing

We do not sell, rent, or trade your personal information. We share data only with the following service providers under strict data processing agreements:

| Service Provider | Purpose | Data Shared | Policy |
|-----------------|---------|-------------|--------|
| **Anthropic** | Claude AI API — processes your compliance queries | Chat messages, business location/type | [anthropic.com/privacy](https://www.anthropic.com/privacy) |
| **Stripe** | Payment processing | Billing name, card details | [stripe.com/privacy](https://stripe.com/privacy) |
| **Supabase** | Database (user accounts, saved form data) | Account email, business profile, form responses | [supabase.com/privacy](https://supabase.com/privacy) |
| **Vercel** | Application hosting and edge delivery | Server request logs (IP, URL, timestamp) | [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy) |
| **Google Analytics 4** | Anonymized usage analytics | Anonymized usage events, device type | [policies.google.com/privacy](https://policies.google.com/privacy) |

We may disclose personal information to law enforcement or government authorities when required by applicable law or a valid legal process, or to protect the rights, safety, and security of RegPulse, its users, or the public.

---

## 4. Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Account and business profile data | Retained until you request deletion or your account is inactive for 24 months |
| Chat history | Retained for 12 months, then automatically purged |
| Completed form data | Retained for 36 months to support renewal reminders |
| Payment records | Retained for 7 years as required by financial regulations |
| Analytics data (GA4) | 14 months (Google's default retention period) |
| Server access logs (Vercel) | 30 days |

To request early deletion of your data, contact us at **privacy@regpulse.com**.

---

## 5. Cookies and Tracking Technologies

We use the following cookies and storage mechanisms:

- **Session cookies**: maintain your login session. Expire when you close the browser.
- **Preference cookies**: store your selected business type and location for faster future sessions.
- **Google Analytics cookies** (`_ga`, `_gid`): anonymized usage tracking. Expire after 2 years / 24 hours respectively.
- **Service worker cache**: stores static assets and API responses for offline use. Contains no personal data.

You may disable cookies in your browser settings. Disabling analytics cookies will not affect core app functionality. Disabling session cookies will prevent you from staying logged in.

We do **not** use cross-site tracking cookies, fingerprinting, or advertising pixels.

---

## 6. Data Security

We implement industry-standard security measures including:

- **Encryption in transit**: all data transmitted between the app and our servers uses TLS 1.2+.
- **Encryption at rest**: Supabase encrypts stored data at the database level using AES-256.
- **Access controls**: database access is restricted to authenticated service accounts; no direct public access.
- **Stripe PCI compliance**: all payment processing is handled by Stripe's PCI DSS Level 1 certified infrastructure.

No method of transmission over the internet is 100% secure. We cannot guarantee absolute security, but we are committed to protecting your data using best-practice methods.

---

## 7. Children's Privacy

RegPulse is intended for business owners and operators aged 18 and older. We do not knowingly collect personal information from anyone under 18. If you believe we have inadvertently collected data from a minor, please contact us at **privacy@regpulse.com** and we will promptly delete it.

---

## 8. California Privacy Rights (CCPA / CPRA)

If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA):

- **Right to Know**: request a copy of the personal information we have collected about you in the past 12 months, including the categories, sources, business purpose, and third parties with whom it was shared.
- **Right to Delete**: request deletion of your personal information, subject to certain legal exceptions.
- **Right to Correct**: request correction of inaccurate personal information we hold about you.
- **Right to Opt-Out of Sale or Sharing**: we do **not** sell or share your personal information for cross-context behavioral advertising. No opt-out is required.
- **Right to Limit Use of Sensitive Personal Information**: we do not collect sensitive personal information as defined by CPRA (e.g., government IDs, precise geolocation, financial account credentials).
- **Right to Non-Discrimination**: exercising your CCPA rights will not result in denial of service, different prices, or different quality of service.

**To exercise your California rights**, submit a verifiable consumer request to **privacy@regpulse.com** with the subject line "California Privacy Request." We will respond within 45 days as required by law.

**Categories of personal information collected** (past 12 months):
- Identifiers (email address, name)
- Commercial information (payment history)
- Internet activity (usage analytics, chat queries)
- Geolocation data (city/state provided by you — not GPS-derived)

We have not sold or shared personal information for cross-context behavioral advertising in the past 12 months.

---

## 9. European Privacy Rights (GDPR)

If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, the General Data Protection Regulation (GDPR) and applicable national laws give you the following rights:

- **Right of Access** (Art. 15): obtain a copy of your personal data we process.
- **Right to Rectification** (Art. 16): correct inaccurate or incomplete personal data.
- **Right to Erasure / "Right to be Forgotten"** (Art. 17): request deletion of your personal data where there is no overriding legitimate interest for us to retain it.
- **Right to Restriction of Processing** (Art. 18): request that we limit how we process your data in certain circumstances.
- **Right to Data Portability** (Art. 20): receive your personal data in a structured, machine-readable format.
- **Right to Object** (Art. 21): object to processing based on legitimate interests or for direct marketing purposes.
- **Right to withdraw consent**: where we rely on consent as a legal basis, you may withdraw it at any time without affecting the lawfulness of prior processing.

**Lawful bases for processing**:
- **Contract performance**: processing necessary to provide the RegPulse service you requested.
- **Legitimate interests**: analytics and fraud prevention.
- **Legal obligation**: retaining financial records as required by law.
- **Consent**: sending optional marketing communications (where applicable).

RegPulse is operated from the United States. By using the service, you acknowledge that your data may be transferred to and processed in the United States, which may not offer the same level of data protection as your country of residence. We rely on Standard Contractual Clauses (SCCs) for international data transfers from the EEA.

**To exercise your GDPR rights**, contact our Data Protection contact at **privacy@regpulse.com**. You also have the right to lodge a complaint with your local supervisory authority.

---

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by posting a prominent notice within the app and updating the "Last updated" date above. Continued use of RegPulse after changes take effect constitutes acceptance of the revised policy. For significant changes affecting how we use your data, we will request your explicit consent where required by law.

---

## 11. Contact Us

For privacy inquiries, data requests, or to report a concern:

**RegPulse**  
Email: **privacy@regpulse.com**  
Website: [regpulse.com](https://regpulse.com)

For EU/UK data protection matters:  
Email: **dpo@regpulse.com** (Data Protection contact)

---

*RegPulse vUnified-20260414-national-expansion-v19 — Privacy Policy finalized for App Store / Play Store submission. Legal review required before public distribution.*
