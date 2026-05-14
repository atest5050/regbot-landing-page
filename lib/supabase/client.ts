import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// navigator.locks throws NotFoundError on capacitor:// scheme in WKWebView.
// Replace it with a simple in-memory Promise queue that gives the same
// sequential-execution guarantee without touching the Web Locks API.
const _lockMap = new Map<string, Promise<unknown>>();
function capLock<T>(name: string, _timeout: number, fn: () => Promise<T>): Promise<T> {
  const chain = (_lockMap.get(name) ?? Promise.resolve()).then(fn, fn) as Promise<T>;
  _lockMap.set(name, chain.then(() => {}, () => {}));
  return chain;
}

// Module-level singleton — prevents "Multiple GoTrueClient instances" warning
// and the resulting navigator.locks NotFoundError when navigating between pages.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any, any, any> | null = null;

// Browser-side Supabase client — safe to use in Client Components
// Usage: const supabase = createClient()
export function createClient() {
  if (_client) return _client;
  // @supabase/ssr uses cookie-based storage for PKCE verifiers. Cookies are unreliable
  // on capacitor://app (custom scheme), causing "PKCE code verifier not found" errors.
  // Use plain supabase-js with localStorage for native Capacitor builds.
  if (typeof window !== "undefined" && window.location.protocol === "capacitor:") {
    _client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: "pkce",
          storage: window.localStorage,
          // Separate key namespace avoids finding a stale session from @supabase/ssr
          // (which uses cookies). Without this, GoTrueClient tries to refresh the old
          // session on init, which hangs exchangeCodeForSession via initializePromise.
          storageKey: "sb-cap",
          // navigator.locks throws NotFoundError on capacitor:// — use in-memory queue
          lock: capLock,
        },
      }
    );
    return _client;
  }
  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _client;
}
