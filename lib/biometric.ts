"use client";

/**
 * Biometric auth + secure session storage for RegPulse.
 *
 * Platform behaviour:
 *   Native (iOS / Android) — uses @aparajita/capacitor-biometric-auth for
 *   Face ID / Touch ID / fingerprint and @capacitor/preferences for Keychain /
 *   Keystore-backed storage of the Supabase refresh token.
 *
 *   Web — returns graceful no-ops so the rest of the app compiles and runs
 *   without any changes; biometric prompt is simply skipped on desktop.
 */

import type { Session } from "@supabase/supabase-js";

// ── Storage keys ──────────────────────────────────────────────────────────────
const REFRESH_KEY    = "rp_bio_refresh";
const ACCESS_KEY     = "rp_bio_access";
const EMAIL_KEY      = "rp_bio_email";
const ENROLLED_KEY   = "rp_bio_enrolled";   // "1" when user has opted in

// ── Lazy imports (native only) ────────────────────────────────────────────────

async function getPreferences() {
  const { Preferences } = await import("@capacitor/preferences");
  return Preferences;
}

async function getBiometricAuth() {
  const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
  return BiometricAuth;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True when running inside a Capacitor native shell (iOS or Android). */
function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform?.();
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns true when the device supports biometric auth AND the user has
 * previously opted in. Call this on app start to decide whether to show
 * the biometric prompt instead of the email screen.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const [Preferences, BiometricAuth] = await Promise.all([
      getPreferences(),
      getBiometricAuth(),
    ]);
    const { value: enrolled } = await Preferences.get({ key: ENROLLED_KEY });
    if (enrolled !== "1") return false;
    const { isAvailable } = await BiometricAuth.checkBiometry();
    return isAvailable;
  } catch {
    return false;
  }
}

/**
 * Prompt the biometric authenticator. Returns true on success, false on
 * failure or cancellation. The caller should fall back to the email screen
 * when this returns false.
 */
export async function promptBiometric(reason = "Sign in to RegPulse"): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const BiometricAuth = await getBiometricAuth();
    await BiometricAuth.authenticate({ reason, cancelTitle: "Use Email Instead" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Persist the Supabase session so it can be restored after a biometric unlock.
 * Also records the user's email for display in the prompt.
 * Call this immediately after a successful sign-in.
 */
export async function storeSession(session: Session, email?: string): Promise<void> {
  if (!isNative()) return;
  try {
    const Preferences = await getPreferences();
    await Promise.all([
      Preferences.set({ key: REFRESH_KEY, value: session.refresh_token }),
      Preferences.set({ key: ACCESS_KEY,  value: session.access_token }),
      Preferences.set({ key: ENROLLED_KEY, value: "1" }),
      ...(email ? [Preferences.set({ key: EMAIL_KEY, value: email })] : []),
    ]);
  } catch {
    // Non-fatal — user will just see the email screen next time
  }
}

/**
 * Retrieve the stored tokens so the caller can call supabase.auth.setSession().
 * Returns null when nothing is stored.
 */
export async function retrieveStoredSession(): Promise<{ accessToken: string; refreshToken: string } | null> {
  if (!isNative()) return null;
  try {
    const Preferences = await getPreferences();
    const [{ value: refresh }, { value: access }] = await Promise.all([
      Preferences.get({ key: REFRESH_KEY }),
      Preferences.get({ key: ACCESS_KEY }),
    ]);
    if (!refresh) return null;
    return { refreshToken: refresh, accessToken: access ?? "" };
  } catch {
    return null;
  }
}

/**
 * Return the email stored at enrolment time (shown in the biometric prompt UI).
 */
export async function getStoredEmail(): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const Preferences = await getPreferences();
    const { value } = await Preferences.get({ key: EMAIL_KEY });
    return value;
  } catch {
    return null;
  }
}

/**
 * Wipe all stored biometric data. Call when the user explicitly signs out.
 */
export async function clearBiometricSession(): Promise<void> {
  if (!isNative()) return;
  try {
    const Preferences = await getPreferences();
    await Promise.all([
      Preferences.remove({ key: REFRESH_KEY }),
      Preferences.remove({ key: ACCESS_KEY }),
      Preferences.remove({ key: EMAIL_KEY }),
      Preferences.remove({ key: ENROLLED_KEY }),
    ]);
  } catch {
    // Ignore
  }
}
