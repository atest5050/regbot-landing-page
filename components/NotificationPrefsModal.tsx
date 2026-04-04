"use client";

// NotificationPrefsModal — per-business renewal reminder settings.
//
// Shows two toggles:
//   • Email reminders  — uses the user's account email; always available.
//   • SMS reminders    — requires a phone number in E.164 format.
//
// Reminders fire at 60, 30, 7, and 1 days before each permit's renewal date.
// The Edge Function (send-renewal-reminders) reads these prefs from
// businesses.notification_prefs and respects them on every daily run.

import { useState } from "react";
import { X, Mail, MessageSquare, Bell, BellOff, Phone } from "lucide-react";
import type { NotificationPrefs } from "@/lib/regbot-types";

interface Props {
  businessName: string;
  /** Current saved prefs. Pass undefined for a business that hasn't set prefs yet. */
  currentPrefs?: NotificationPrefs;
  /** Account email — shown as read-only so the user knows which address gets mail. */
  userEmail?: string;
  onSave: (prefs: NotificationPrefs) => void;
  onClose: () => void;
}

const DEFAULT_PREFS: NotificationPrefs = {
  emailEnabled: true,
  smsEnabled: false,
  phone: "",
};

const REMINDER_MILESTONES = ["60 days", "30 days", "7 days", "1 day"] as const;

export default function NotificationPrefsModal({
  businessName,
  currentPrefs,
  userEmail,
  onSave,
  onClose,
}: Props) {
  const initial = currentPrefs ?? DEFAULT_PREFS;
  const [emailEnabled, setEmailEnabled] = useState(initial.emailEnabled);
  const [smsEnabled,   setSmsEnabled]   = useState(initial.smsEnabled);
  const [phone,        setPhone]        = useState(initial.phone ?? "");
  const [phoneError,   setPhoneError]   = useState<string | null>(null);
  const [saving,       setSaving]       = useState(false);

  /** Validate E.164 format: starts with + followed by 7–15 digits. */
  function validatePhone(value: string): boolean {
    return /^\+[1-9]\d{6,14}$/.test(value.trim());
  }

  const handleSave = async () => {
    if (smsEnabled) {
      if (!phone.trim()) {
        setPhoneError("Enter a phone number to enable SMS reminders.");
        return;
      }
      if (!validatePhone(phone)) {
        setPhoneError("Use E.164 format, e.g. +14155552671");
        return;
      }
    }
    setPhoneError(null);
    setSaving(true);
    const prefs: NotificationPrefs = {
      emailEnabled,
      smsEnabled,
      phone: smsEnabled ? phone.trim() : (phone.trim() || undefined),
    };
    onSave(prefs);
    setSaving(false);
    onClose();
  };

  const anyEnabled = emailEnabled || smsEnabled;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Renewal Reminders</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">{businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Milestone info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-blue-800 mb-1.5">When reminders are sent</p>
            <div className="flex flex-wrap gap-1.5">
              {REMINDER_MILESTONES.map(m => (
                <span
                  key={m}
                  className="inline-block text-[11px] font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-2 py-0.5"
                >
                  {m} before
                </span>
              ))}
            </div>
          </div>

          {/* Email toggle */}
          <div className={`rounded-xl border p-4 transition-colors ${
            emailEnabled ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  emailEnabled ? "bg-blue-100" : "bg-slate-100"
                }`}>
                  <Mail className={`h-4 w-4 ${emailEnabled ? "text-blue-600" : "text-slate-400"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Email reminders</p>
                  {userEmail ? (
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{userEmail}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-0.5">Sent to your account email</p>
                  )}
                </div>
              </div>
              {/* Toggle switch */}
              <button
                role="switch"
                aria-checked={emailEnabled}
                onClick={() => setEmailEnabled(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  emailEnabled ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  emailEnabled ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>

          {/* SMS toggle */}
          <div className={`rounded-xl border p-4 transition-colors ${
            smsEnabled ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"
          }`}>
            <div className="flex items-center justify-between mb-0">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  smsEnabled ? "bg-green-100" : "bg-slate-100"
                }`}>
                  <MessageSquare className={`h-4 w-4 ${smsEnabled ? "text-green-600" : "text-slate-400"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">SMS reminders</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Short text message to your phone</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={smsEnabled}
                onClick={() => { setSmsEnabled(v => !v); setPhoneError(null); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                  smsEnabled ? "bg-green-600" : "bg-slate-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  smsEnabled ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>

            {/* Phone input — slide in when SMS is enabled */}
            {smsEnabled && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setPhoneError(null); }}
                    placeholder="+14155552671"
                    className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                      phoneError
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-slate-200 focus:ring-blue-100 focus:border-blue-400"
                    }`}
                  />
                </div>
                {phoneError ? (
                  <p className="mt-1 text-[11px] text-red-600">{phoneError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Include country code, e.g. +1 for US/Canada
                  </p>
                )}
              </div>
            )}
          </div>

          {/* All-off note */}
          {!anyEnabled && (
            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <BellOff className="h-4 w-4 shrink-0" />
              <p className="text-xs">No reminders will be sent for this business.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
