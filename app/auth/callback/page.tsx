"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your account…");

  useEffect(() => {
    const sb = createClient();
    let settled = false;

    const settle = (ok: boolean, msg: string) => {
      if (settled) return;
      settled = true;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
      setStatus(ok ? "success" : "error");
      setMessage(msg);
    };

    // Primary: listen for auth state change (covers implicit + PKCE flows)
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
        settle(true, "You're signed in! You can now return to the RegPulse app.");
      }
    });

    const params = new URLSearchParams(window.location.search);

    // OTP / token_hash flow — Supabase email confirmation and magic links
    const tokenHash = params.get("token_hash");
    const type = params.get("type") as "signup" | "magiclink" | "recovery" | "email" | "invite" | null;
    if (tokenHash && type) {
      sb.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error: e }) => {
        if (e) {
          settle(false, "Confirmation failed. The link may have expired — please try again.");
        } else {
          settle(true, "You're confirmed! Open the RegPulse app and sign in to continue.");
        }
      });
    }

    // PKCE code flow fallback
    const code = params.get("code");
    if (code && !tokenHash) {
      sb.auth.exchangeCodeForSession(code).then(({ error: e }) => {
        if (e) {
          settle(false, "Confirmation failed. The link may have expired — please try again.");
        } else {
          settle(true, "You're signed in! You can now return to the RegPulse app.");
        }
      });
    }

    // Existing session fallback
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        settle(true, "You're signed in! You can now return to the RegPulse app.");
      }
    });

    // 8-second safety net
    const safetyTimer = setTimeout(() => {
      settle(true, "If your link was valid, you're now confirmed. Open the RegPulse app to sign in.");
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      padding: "0 24px",
      background: "linear-gradient(135deg, #0B1E3F 0%, #0f2a55 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Logo mark */}
      <svg width="56" height="62" viewBox="0 0 100 110" fill="none" aria-hidden="true">
        <path d="M50 4 L88 18 L88 64 Q88 91 50 107 Q12 91 12 64 L12 18 Z" fill="#1e3a6e" />
        <path d="M50 9 L83 21 L83 64 Q83 88 50 103 Q17 88 17 64 L17 21 Z" fill="#162d58" />
        <path d="M30 57 L38 57 L41 63 L45 40 L51 74 L55 57 L70 57" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>
          {status === "loading" ? "Confirming…"
            : status === "success" ? "You're verified!"
            : "Something went wrong"}
        </div>
        <div style={{ fontSize: 14, color: "#94a3b8", maxWidth: 300 }}>
          {message}
        </div>
      </div>

      {status === "success" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <a
            href="regpulse://chat"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 12,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff", fontSize: 14, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Open RegPulse App
          </a>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0, maxWidth: 260 }}>
            If the app doesn't open, launch RegPulse from your home screen and sign in.
          </p>
        </div>
      )}

      {status === "loading" && (
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          border: "2.5px solid rgba(96,165,250,0.3)",
          borderTopColor: "#60a5fa",
          animation: "spin 0.8s linear infinite",
        }} />
      )}

      {status === "error" && (
        <a
          href="https://www.reg-bot.ai"
          style={{ fontSize: 13, color: "#60a5fa", textDecoration: "underline" }}
        >
          Go to RegPulse
        </a>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
