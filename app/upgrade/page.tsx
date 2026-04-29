"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { isCapacitorNative } from "@/lib/notifications";
import {
  Crown, CheckCircle2, Loader2, ArrowLeft, Shield, Zap, FileText,
  RotateCcw, BarChart3, LogIn, UserPlus, Mail,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const PRO_BENEFITS = [
  { icon: <Zap className="h-4 w-4 text-amber-400" />, title: "Unlimited AI form completions", sub: "No monthly cap on forms or renewals" },
  { icon: <RotateCcw className="h-4 w-4 text-blue-400" />, title: "Automatic renewal filing", sub: "Pre-filled forms sent before deadlines" },
  { icon: <BarChart3 className="h-4 w-4 text-emerald-400" />, title: "Quarterly Compliance Check-in PDF", sub: "Full audit of your business obligations" },
  { icon: <FileText className="h-4 w-4 text-violet-400" />, title: "Priority document analysis", sub: "Upload contracts & get instant summaries" },
  { icon: <Shield className="h-4 w-4 text-cyan-400" />, title: "Real-time regulation alerts", sub: "Notified the day rules change in your area" },
];

export default function UpgradePage() {
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const sb = createClient();

  // If already signed in, go straight to checkout
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        void startCheckout(data.session.user.id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCheckout = async (userId: string) => {
    setCheckingOut(true);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!data.url) throw new Error(data.error ?? "No checkout URL returned");
      if (isCapacitorNative()) {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: data.url, presentationStyle: "popover" });
      } else {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed. Please try again.");
      setCheckingOut(false);
    }
  };

  const handleSignIn = async () => {
    setWorking(true); setError("");
    const { data, error: e } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setWorking(false);
    if (e) { setError(e.message); return; }
    if (data.user) void startCheckout(data.user.id);
  };

  const handleSignUp = async () => {
    setWorking(true); setError("");
    const { data, error: e } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: "https://www.reg-bot.ai/auth/callback" },
    });
    setWorking(false);
    if (e) { setError(e.message); return; }
    // Sign-up auto-confirms in some Supabase projects; try checkout if session exists
    if (data.session?.user) {
      void startCheckout(data.session.user.id);
    } else {
      setError("Account created! Check your email to confirm, then sign in to continue.");
    }
  };

  const handleMagicLink = async () => {
    setWorking(true); setError("");
    const { error: e } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: "https://www.reg-bot.ai/auth/callback" },
    });
    setWorking(false);
    if (e) { setError(e.message); return; }
    setMagicSent(true);
  };

  const submit = () => {
    if (mode === "signin") void handleSignIn();
    else if (mode === "signup") void handleSignUp();
    else void handleMagicLink();
  };

  const rootStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(160deg,#0B1E3F 0%,#0f2a55 100%)",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch" as never,
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
  };

  if (checkingOut) {
    return (
      <div style={rootStyle} className="flex flex-col items-center justify-center gap-4">
        <Crown className="h-10 w-10 text-amber-400 animate-pulse" />
        <p className="text-white font-semibold text-lg">Opening Stripe checkout…</p>
        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div style={rootStyle} className="flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={() => { window.history.length > 1 ? window.history.back() : window.location.href = "/chat"; }}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          style={{ touchAction: "manipulation" }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-400" />
          <span className="font-bold text-white text-base">RegPulse Pro</span>
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 pt-6 pb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <Crown className="h-3.5 w-3.5" />
          $19 / month · Cancel anytime
        </div>
        <h1 className="text-2xl font-extrabold text-white leading-tight mb-2">
          Stay compliant.<br />Automatically.
        </h1>
        <p className="text-sm text-slate-300 max-w-xs mx-auto">
          RegPulse Pro handles your filings, alerts you before deadlines, and
          keeps your business out of trouble — on autopilot.
        </p>
      </div>

      {/* Benefits */}
      <div className="px-5 space-y-2.5 mb-6">
        {PRO_BENEFITS.map(b => (
          <div key={b.title}
            className="flex items-start gap-3 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3">
            <div className="mt-0.5 shrink-0">{b.icon}</div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{b.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{b.sub}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 ml-auto" />
          </div>
        ))}
      </div>

      {/* Auth Card */}
      <div className="mx-5 mb-8 bg-white/[0.07] border border-white/10 rounded-3xl p-5 space-y-4">
        <p className="text-center text-sm font-semibold text-white">
          {mode === "signin" ? "Sign in to get started" : mode === "signup" ? "Create your account" : "Sign in with email link"}
        </p>

        {/* Mode tabs */}
        <div className="flex gap-1.5 bg-white/[0.06] rounded-xl p-1">
          {(["signup", "signin", "magic"] as const).map(m => (
            <button key={m}
              onClick={() => { setMode(m); setError(""); setMagicSent(false); }}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                mode === m ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              {m === "signin" ? "Sign In" : m === "signup" ? "Sign Up" : "Magic Link"}
            </button>
          ))}
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          autoCapitalize="none"
          autoCorrect="off"
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") submit(); }}
          className="w-full text-sm rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-slate-500 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
        />

        {/* Password */}
        {mode !== "magic" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
            className="w-full text-sm rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-slate-500 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        )}

        {/* Submit */}
        {magicSent ? (
          <p className="text-center text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-3 py-2.5">
            Magic link sent! Check your email and tap the link to continue.
          </p>
        ) : (
          <button
            onClick={submit}
            disabled={working || !email.trim()}
            className="w-full min-h-[52px] flex items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg"
            style={{ touchAction: "manipulation" }}
          >
            {working ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              <><LogIn className="h-4 w-4" /> Sign In & Go Pro</>
            ) : mode === "signup" ? (
              <><UserPlus className="h-4 w-4" /> Create Account & Go Pro</>
            ) : (
              <><Mail className="h-4 w-4" /> Send Magic Link</>
            )}
          </button>
        )}

        {error && (
          <p className={`text-center text-xs px-2 py-2 rounded-xl border ${
            error.startsWith("Account created") || error.startsWith("Check")
              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
              : "text-red-400 bg-red-400/10 border-red-400/20"
          }`}>
            {error}
          </p>
        )}

        <p className="text-center text-[10px] text-slate-500">
          By continuing you agree to our Terms of Service and Privacy Policy.
          Cancel your Pro subscription anytime from settings.
        </p>
      </div>
    </div>
  );
}
