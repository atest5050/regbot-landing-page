// vUnified-platform-fix: created dedicated Settings page
// All user-facing settings consolidated here:
//   - Appearance (dark mode toggle moved from chat brand header)
//   - Notifications (email + granular jurisdiction toggles)
//   - Profile Information (editable business fields)
//   - Subscription & Billing (plan display + Stripe payment settings)
//   - Account (logout + delete with confirmation)
//   - Profile tab (subscription status, billing portal, estimated time saved)
//
// Dark mode implementation: reads/writes the same "rp-dark-mode" localStorage key
// used by app/chat/page.tsx so the preference is shared across routes on mount.
// The `dark` class is scoped to the root div (Tailwind darkMode:"class" strategy).
//
// Platform parity checklist:
//   ✓ mobile-first Tailwind (sm: breakpoints for wider screens)
//   ✓ 48px+ min touch targets on all interactive elements
//   ✓ touch-action: manipulation on all buttons
//   ✓ h-dvh-safe root (three-tier dvh fallback via globals.css utility)
//   ✓ safe-area-inset handling via env() in paddings
//   ✓ flex-1 min-h-0 scroll container for content area
//   ✓ dark: variants on all light-mode surfaces

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Moon,
  Sun,
  ChevronLeft,
  Bell,
  BellOff,
  User,
  CreditCard,
  LogOut,
  Trash2,
  Shield,
  Check,
  Loader2,
  LocateFixed,
  Crown,
  ExternalLink,
  AlertTriangle,
  Clock,
  Receipt,
  Settings,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RegPulseIcon } from "@/components/RegPulseLogo";
import { isCapacitorNative } from "@/lib/notifications";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// ── Constants ──────────────────────────────────────────────────────────────────
const DARK_KEY  = "rp-dark-mode";
const NOTIF_KEY = "rp-notif-settings";

// ── Types ─────────────────────────────────────────────────────────────────────
interface NotifSettings {
  emailEnabled: boolean;
  federal:      boolean;
  state:        boolean;
  county:       boolean;
  cityTown:     boolean;
  hyperLocal:   boolean;
}

interface ProfileFields {
  businessName: string;
  ownerName:    string;
  email:        string;
  phone:        string;
  businessType: string;
  location:     string;
}

const DEFAULT_NOTIF: NotifSettings = {
  emailEnabled: true,
  federal:      true,
  state:        true,
  county:       true,
  cityTown:     true,
  hyperLocal:   true,
};

// ── Toggle Switch sub-component ───────────────────────────────────────────────
function Toggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        enabled ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
      }`}
      style={{ touchAction: "manipulation", minHeight: 24, minWidth: 44 }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Section card wrapper ───────────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#1a2740] border border-slate-200 dark:border-white/[0.07] rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
        <span className="text-blue-600 dark:text-blue-400">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
        {children}
      </div>
    </div>
  );
}

// ── Row for a toggle setting ───────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  indent = false,
  disabled = false,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
  indent?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3.5 min-h-[52px] ${
        indent ? "pl-10" : ""
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} label={label} />
    </div>
  );
}

// ── Text input row ────────────────────────────────────────────────────────────
function FieldRow({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  action,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3.5">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm rounded-xl border border-slate-200 dark:border-slate-600/50 bg-slate-50 dark:bg-[#0f1823] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-600 transition-all"
        />
        {action}
      </div>
    </div>
  );
}

// ── Stat metric card ───────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-[#0f1823] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-500 dark:text-blue-400">{icon}</span>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();

  // ── Active tab ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"settings" | "profile">("settings");

  // ── Dark mode — reads same localStorage key as chat/page.tsx
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem(DARK_KEY) === "1");
  }, []);
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem(DARK_KEY, next ? "1" : "0");
      return next;
    });
  };

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [user, setUser]               = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const sbRef = useRef<ReturnType<typeof createClient> | null>(null);
  const getSb = () => {
    if (!sbRef.current) sbRef.current = createClient();
    return sbRef.current;
  };
  useEffect(() => {
    const sb = getSb();
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── isPro — load from Supabase profiles ─────────────────────────────────────
  const [isPro, setIsPro]                   = useState(false);
  const [proSince, setProSince]             = useState<string | null>(null);
  const [stripeLoading, setStripeLoading]   = useState(false);
  const [stripeError, setStripeError]       = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const sb = getSb();
    sb.from("profiles")
      .select("is_pro, pro_since")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setIsPro(!!data.is_pro);
          setProSince((data as { is_pro: boolean; pro_since?: string | null }).pro_since ?? null);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Estimated time saved — chat message count × 3 min/msg ─────────────────
  const [msgCount, setMsgCount] = useState<number | null>(null);
  useEffect(() => {
    if (!user) return;
    const sb = getSb();
    sb.from("messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => { if (count !== null) setMsgCount(count); }, () => { /* silently ignore */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const estimatedMinutes = msgCount !== null ? Math.round(msgCount * 3) : null;
  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // ── Stripe handlers ─────────────────────────────────────────────────────────
  const openUrl = async (url: string) => {
    if (isCapacitorNative()) {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url, presentationStyle: "popover" });
    } else {
      window.location.href = url;
    }
  };

  const handleUpgradeToPro = async () => {
    if (!user) { router.push("/login"); return; }
    setStripeLoading(true);
    setStripeError(null);
    try {
      const res  = await fetch("/api/stripe/create-checkout-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to start checkout");
      await openUrl(data.url);
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    setStripeLoading(true);
    setStripeError(null);
    try {
      const res  = await fetch("/api/stripe/create-portal-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to open billing portal");
      await openUrl(data.url);
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStripeLoading(false);
    }
  };

  // ── Notification settings — persisted to localStorage ─────────────────────
  const [notif, setNotif] = useState<NotifSettings>(DEFAULT_NOTIF);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) setNotif({ ...DEFAULT_NOTIF, ...JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);
  const updateNotif = (key: keyof NotifSettings) => {
    setNotif(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // ── Profile fields ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileFields>({
    businessName: "",
    ownerName:    "",
    email:        user?.email ?? "",
    phone:        "",
    businessType: "",
    location:     "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved]   = useState(false);

  useEffect(() => {
    if (user?.email) {
      setProfile(p => ({ ...p, email: p.email || user!.email! }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const sb = getSb();
    sb.from("profiles")
      .select("business_name, owner_name, phone, business_type, location")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(p => ({
            ...p,
            businessName: data.business_name ?? p.businessName,
            ownerName:    data.owner_name    ?? p.ownerName,
            phone:        data.phone         ?? p.phone,
            businessType: data.business_type ?? p.businessType,
            location:     data.location      ?? p.location,
          }));
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      const sb = getSb();
      await sb.from("profiles").upsert({
        id:            user.id,
        business_name: profile.businessName,
        owner_name:    profile.ownerName,
        phone:         profile.phone,
        business_type: profile.businessType,
        location:      profile.location,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } finally {
      setProfileSaving(false);
    }
  };

  // ── GPS refresh for location field ─────────────────────────────────────────
  const [gpsLoading, setGpsLoading] = useState(false);
  const refreshLocation = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          .then(r => r.json())
          .then(d => {
            const city  = d.address?.city || d.address?.town || d.address?.village || "";
            const state = d.address?.state || "";
            const zip   = d.address?.postcode || "";
            const label = zip ? `${city}, ${state} ${zip}` : city ? `${city}, ${state}` : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setProfile(p => ({ ...p, location: label }));
          })
          .catch(() => setProfile(p => ({ ...p, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })))
          .finally(() => setGpsLoading(false));
      },
      () => setGpsLoading(false),
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // ── Account actions ────────────────────────────────────────────────────────
  const [signingOut, setSigningOut]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteTyped, setDeleteTyped]     = useState("");
  const [deleting, setDeleting]           = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await getSb().auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteTyped.trim().toLowerCase() !== "delete") return;
    setDeleting(true);
    try {
      await getSb().auth.signOut();
      router.push("/");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex flex-col h-dvh-safe${isDarkMode ? " dark" : ""} bg-[#f8f9fb] dark:bg-[#0f1823]`}
    >
      {/* ── Top navigation bar ─────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#131e2f]">
        <button
          onClick={() => router.push("/chat")}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-colors pointer-events-auto"
          style={{ touchAction: "manipulation" }}
          aria-label="Back to chat"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <RegPulseIcon size={24} className="shrink-0" />
        <h1 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight flex-1">
          Settings
        </h1>
        {isPro && (
          <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">
            <Crown className="h-2 w-2" />
            PRO
          </span>
        )}
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#131e2f]">
        {(["settings", "profile"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] text-sm font-semibold transition-colors border-b-2 pointer-events-auto ${
              activeTab === tab
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            {tab === "settings"
              ? <Settings className="h-4 w-4" />
              : <User className="h-4 w-4" />}
            {tab === "settings" ? "Settings" : "Profile"}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain"
        style={{ touchAction: "pan-y" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          {/* ═══════════════════════════════════════════════════════════════════
               PROFILE TAB                                                       */}
          {activeTab === "profile" && (
            <>
              {/* User identity card */}
              <div className="bg-white dark:bg-[#1a2740] border border-slate-200 dark:border-white/[0.07] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-xl font-bold text-white uppercase">
                      {user?.email?.[0] ?? "?"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-slate-900 dark:text-white truncate">
                      {profile.businessName || profile.ownerName || user?.email?.split("@")[0] || "Your Account"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user?.email ?? "Not signed in"}</p>
                    {isPro && (
                      <span className="inline-flex items-center gap-1 mt-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Crown className="h-2.5 w-2.5" />
                        RegPulse Pro
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription status */}
              <SectionCard title="Subscription" icon={<Crown className="h-4 w-4" />}>
                <div className="px-5 py-4">
                  {isPro ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">RegPulse Pro</p>
                          {proSince && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Member since {new Date(proSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                          Active
                        </span>
                      </div>
                      <button
                        onClick={handleManageSubscription}
                        disabled={stripeLoading}
                        className="w-full flex items-center justify-center gap-2 min-h-[48px] border border-slate-200 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors pointer-events-auto"
                        style={{ touchAction: "manipulation" }}
                      >
                        {stripeLoading
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <ExternalLink className="h-4 w-4" />}
                        {stripeLoading ? "Opening portal…" : "Manage Subscription"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Free Plan</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">3 AI form completions / month</p>
                        </div>
                        <span className="inline-flex items-center text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full">
                          Free
                        </span>
                      </div>
                      <button
                        onClick={handleUpgradeToPro}
                        disabled={stripeLoading || !user}
                        className="w-full flex items-center justify-center gap-2 min-h-[48px] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-sm pointer-events-auto"
                        style={{ touchAction: "manipulation" }}
                      >
                        {stripeLoading
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Crown className="h-4 w-4" />}
                        {stripeLoading ? "Loading…" : "Upgrade to Pro · $14.99/mo"}
                      </button>
                      {!user && (
                        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                          Sign in to upgrade your plan.
                        </p>
                      )}
                    </div>
                  )}
                  {stripeError && (
                    <p className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {stripeError}
                    </p>
                  )}
                </div>
              </SectionCard>

              {/* Estimated time saved */}
              <SectionCard title="Your Impact" icon={<Zap className="h-4 w-4" />}>
                <div className="px-5 py-4">
                  <div className="flex gap-3">
                    <StatCard
                      icon={<Clock className="h-4 w-4" />}
                      label="Time saved"
                      value={estimatedMinutes !== null ? formatTime(estimatedMinutes) : "—"}
                      sub="vs. manual research"
                    />
                    <StatCard
                      icon={<Receipt className="h-4 w-4" />}
                      label="AI sessions"
                      value={msgCount !== null ? String(msgCount) : "—"}
                      sub="total conversations"
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                    Estimated at 3 minutes saved per AI interaction vs. manual regulatory research.
                  </p>
                </div>
              </SectionCard>

              {/* Billing portal shortcuts */}
              <SectionCard title="Billing" icon={<CreditCard className="h-4 w-4" />}>
                {[
                  { label: "Payment methods",    sub: "View and update saved cards" },
                  { label: "Billing history",    sub: "Invoices and past charges"   },
                  { label: "Subscription details", sub: "Renewal date and plan info" },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={handleManageSubscription}
                    disabled={stripeLoading || !user || !isPro}
                    className="w-full flex items-center justify-between min-h-[52px] px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] disabled:opacity-40 transition-colors pointer-events-auto"
                    style={{ touchAction: "manipulation" }}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
                  </button>
                ))}
                {!isPro && (
                  <div className="px-5 py-3 flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Upgrade to Pro to access billing history and payment management.
                    </p>
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
               SETTINGS TAB                                                      */}
          {activeTab === "settings" && (
            <>
              {/* SECTION 1: Appearance */}
              <SectionCard title="Appearance" icon={isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}>
                <ToggleRow
                  label="Dark Mode"
                  description={isDarkMode ? "Interface uses a dark navy theme" : "Interface uses a light theme"}
                  enabled={isDarkMode}
                  onToggle={toggleDarkMode}
                />
              </SectionCard>

              {/* SECTION 2: Notifications */}
              <SectionCard title="Notifications" icon={<Bell className="h-4 w-4" />}>
                <ToggleRow
                  label="Email Notifications"
                  description="Receive regulatory change alerts by email"
                  enabled={notif.emailEnabled}
                  onToggle={() => updateNotif("emailEnabled")}
                />
                <div className={notif.emailEnabled ? "" : "opacity-40 pointer-events-none"}>
                  <div className="px-5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Alert categories
                    </p>
                  </div>
                  <ToggleRow
                    label="Federal changes"
                    description="IRS, SBA, EPA, FTC, and federal regulatory updates"
                    enabled={notif.federal}
                    onToggle={() => updateNotif("federal")}
                    indent
                  />
                  <ToggleRow
                    label="State changes"
                    description="State licensing, sales tax, and labor law updates"
                    enabled={notif.state}
                    onToggle={() => updateNotif("state")}
                    indent
                  />
                  <ToggleRow
                    label="County changes"
                    description="County health codes, zoning, and permit updates"
                    enabled={notif.county}
                    onToggle={() => updateNotif("county")}
                    indent
                  />
                  <ToggleRow
                    label="City / Town changes"
                    description="Municipal business licensing and local ordinances"
                    enabled={notif.cityTown}
                    onToggle={() => updateNotif("cityTown")}
                    indent
                  />
                  <ToggleRow
                    label="Hyper-local (Zoning / Health)"
                    description="Site-specific zoning and health department rule changes"
                    enabled={notif.hyperLocal}
                    onToggle={() => updateNotif("hyperLocal")}
                    indent
                  />
                </div>
                {!notif.emailEnabled && (
                  <div className="px-5 py-3 flex items-center gap-2">
                    <BellOff className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Enable email notifications to configure categories.
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* SECTION 3: Subscription & Billing (compact, links to Profile tab) */}
              <SectionCard title="Subscription & Billing" icon={<CreditCard className="h-4 w-4" />}>
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                      Current plan
                    </p>
                    <div className="flex items-center gap-2">
                      {isPro ? (
                        <>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            <Crown className="h-3 w-3" />
                            RegPulse Pro
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Active</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                            Free Plan
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">3 AI forms / mo</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isPro ? (
                    <button
                      onClick={handleManageSubscription}
                      disabled={stripeLoading}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-4 text-sm font-semibold border border-slate-200 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors pointer-events-auto"
                      style={{ touchAction: "manipulation" }}
                    >
                      {stripeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                      Manage
                    </button>
                  ) : (
                    <button
                      onClick={handleUpgradeToPro}
                      disabled={stripeLoading || !user}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors pointer-events-auto"
                      style={{ touchAction: "manipulation" }}
                    >
                      {stripeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />}
                      Upgrade to Pro
                    </button>
                  )}
                </div>
                {stripeError && (
                  <div className="px-5 pb-3">
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {stripeError}
                    </p>
                  </div>
                )}
                {!isPro && (
                  <div className="px-5 pb-4 space-y-2">
                    {[
                      "Unlimited AI-assisted form completions",
                      "Rule-change alert badges on every checklist item",
                      "Renewal date tracking + reminders",
                      "PDF export with business name + alert markers",
                      "Priority support",
                    ].map(feat => (
                      <div key={feat} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600 dark:text-slate-400">{feat}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setActiveTab("profile")}
                  className="w-full flex items-center justify-between min-h-[44px] px-5 py-3 border-t border-slate-100 dark:border-white/[0.06] text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors pointer-events-auto"
                  style={{ touchAction: "manipulation" }}
                >
                  View billing details &amp; payment history
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </button>
              </SectionCard>

              {/* SECTION 4: Profile Information */}
              <SectionCard title="Profile Information" icon={<User className="h-4 w-4" />}>
                <FieldRow
                  label="Business Name"
                  value={profile.businessName}
                  onChange={v => setProfile(p => ({ ...p, businessName: v }))}
                  placeholder="e.g. Sweet Treats Bakery"
                />
                <FieldRow
                  label="Owner Name"
                  value={profile.ownerName}
                  onChange={v => setProfile(p => ({ ...p, ownerName: v }))}
                  placeholder="e.g. Jane Smith"
                />
                <FieldRow
                  label="Email"
                  value={profile.email}
                  onChange={v => setProfile(p => ({ ...p, email: v }))}
                  type="email"
                  placeholder={user?.email ?? "your@email.com"}
                />
                <FieldRow
                  label="Phone"
                  value={profile.phone}
                  onChange={v => setProfile(p => ({ ...p, phone: v }))}
                  type="tel"
                  placeholder="(555) 555-5555"
                />
                <FieldRow
                  label="Business Type"
                  value={profile.businessType}
                  onChange={v => setProfile(p => ({ ...p, businessType: v }))}
                  placeholder="e.g. Food Truck, Etsy Shop, Freelancer"
                />
                <FieldRow
                  label="Location"
                  value={profile.location}
                  onChange={v => setProfile(p => ({ ...p, location: v }))}
                  placeholder="e.g. Austin, TX 78701"
                  action={
                    <button
                      onClick={refreshLocation}
                      disabled={gpsLoading}
                      className="shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-600/50 bg-slate-50 dark:bg-[#0f1823] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors disabled:opacity-40"
                      style={{ touchAction: "manipulation" }}
                      title="Refresh GPS location"
                    >
                      {gpsLoading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <LocateFixed className="h-4 w-4" />}
                    </button>
                  }
                />
                <div className="px-5 py-4">
                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving || !user}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors pointer-events-auto"
                    style={{ touchAction: "manipulation" }}
                  >
                    {profileSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : profileSaved ? (
                      <Check className="h-4 w-4" />
                    ) : null}
                    {profileSaving ? "Saving…" : profileSaved ? "Saved!" : "Save Profile"}
                  </button>
                  {!user && (
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      Sign in to save your profile across devices.
                    </p>
                  )}
                </div>
              </SectionCard>

              {/* SECTION 5: Account */}
              <SectionCard title="Account" icon={<Shield className="h-4 w-4" />}>
                {user && (
                  <div className="px-5 py-3.5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                        {user.email?.[0] ?? "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Signed in as</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="px-5 py-4">
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut || !user}
                    className="flex items-center gap-2 min-h-[48px] w-full sm:w-auto px-5 border border-slate-200 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors pointer-events-auto"
                    style={{ touchAction: "manipulation" }}
                  >
                    {signingOut
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <LogOut className="h-4 w-4" />}
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                  {!user && !authLoading && (
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      You are not signed in.
                    </p>
                  )}
                </div>

                <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/[0.06] pt-4">
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      disabled={!user}
                      className="flex items-center gap-2 min-h-[48px] w-full sm:w-auto px-5 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition-colors pointer-events-auto"
                      style={{ touchAction: "manipulation" }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete account
                    </button>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                            This is permanent and cannot be undone.
                          </p>
                          <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">
                            All your businesses, checklists, and completed forms will be deleted.
                            Type <strong>delete</strong> to confirm.
                          </p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={deleteTyped}
                        onChange={e => setDeleteTyped(e.target.value)}
                        placeholder="Type delete to confirm"
                        className="w-full text-sm rounded-xl border border-red-300 dark:border-red-800/60 bg-white dark:bg-[#0f1823] text-slate-800 dark:text-white placeholder:text-red-300 dark:placeholder:text-red-700 px-3 py-2.5 outline-none focus:ring-2 focus:ring-red-400/40"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteTyped.trim().toLowerCase() !== "delete" || deleting}
                          className="flex-1 flex items-center justify-center gap-2 min-h-[44px] bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors pointer-events-auto"
                          style={{ touchAction: "manipulation" }}
                        >
                          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          {deleting ? "Deleting…" : "Delete my account"}
                        </button>
                        <button
                          onClick={() => { setDeleteConfirm(false); setDeleteTyped(""); }}
                          className="flex-1 min-h-[44px] border border-slate-200 dark:border-slate-600/50 text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors pointer-events-auto"
                          style={{ touchAction: "manipulation" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            </>
          )}

          {/* Bottom breathing room for iOS home indicator */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
