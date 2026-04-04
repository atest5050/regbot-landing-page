"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle2 } from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus]   = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setStatus("sending");

    // Simulate async send — replace with a real API route or Formspree endpoint.
    await new Promise((r) => setTimeout(r, 900));

    // In production: POST to /api/contact or a Formspree/Resend endpoint.
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-slate-900 mb-1">Message received!</p>
        <p className="text-sm text-slate-500">
          Thank you for reaching out. We will get back to you within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
        <Input
          placeholder="Bug report, feature request, general question…"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Tell us what's on your mind…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400 text-slate-800 resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong — please try emailing us directly at hello@regpulse.ai
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === "sending" || !email.trim() || !message.trim()}
      >
        <Send className="h-4 w-4 mr-2" />
        {status === "sending" ? "Sending…" : "Send Message"}
      </Button>

      <p className="text-[11px] text-slate-400 text-center">
        We never share your information with third parties.
      </p>
    </form>
  );
}
