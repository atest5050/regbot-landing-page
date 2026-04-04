// GA4 helper utilities.
//
// Usage:
//   import { gtagEvent } from "@/lib/gtag";
//   gtagEvent("waitlist_signup", { source: "homepage" });
//
// The measurement ID is read from NEXT_PUBLIC_GA4_ID at build time.
// If the env var is absent (local dev without analytics), all calls are
// silent no-ops — nothing throws, nothing logs.

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";

// Extend Window so TypeScript knows gtag exists after the script loads.
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
    dataLayer: unknown[];
  }
}

/** Fire a named GA4 event with optional parameters. Safe to call server-side
 *  (returns immediately when window or gtag is unavailable). */
export function gtagEvent(
  action: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (
    !GA_MEASUREMENT_ID ||
    typeof window === "undefined" ||
    typeof window.gtag !== "function"
  ) {
    return;
  }
  window.gtag("event", action, params);
}

/** Read UTM parameters from the current URL. Returns an object whose keys
 *  are always defined — missing params default to "(none)" / "(direct)" so
 *  GA4 reports stay readable. Call at submit time (not module load) so the
 *  URL search string is up-to-date for SPAs. */
export function getUtmParams(): {
  source: string;
  medium: string;
  campaign: string;
} {
  if (typeof window === "undefined") {
    return { source: "(direct)", medium: "(none)", campaign: "(none)" };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    source:   p.get("utm_source")   ?? "(direct)",
    medium:   p.get("utm_medium")   ?? "(none)",
    campaign: p.get("utm_campaign") ?? "(none)",
  };
}
