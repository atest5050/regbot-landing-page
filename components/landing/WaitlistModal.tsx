"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Shield } from "lucide-react";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    // TODO: Replace with Supabase insert
    // const supabase = createClient()
    // await supabase.from('waitlist').insert({ email, created_at: new Date().toISOString() })
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulated delay

    setLoading(false);
    setSubmitted(true);
  }

  function handleClose(open: boolean) {
    onOpenChange(open);
    // Reset state after close animation
    if (!open) {
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 300);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Get Early Access
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500">
                Join 500+ small business owners on the waitlist. Free forever
                for the first 1,000 members.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-2 space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="text-base"
              />
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? "Joining…" : "Join the Waitlist – Get Early Access"}
              </Button>
              <p className="text-center text-xs text-slate-400">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                You&apos;re on the list!
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                We&apos;ll send you an invite as soon as your spot opens up.
                Keep building.
              </p>
            </div>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
