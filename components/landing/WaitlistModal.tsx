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
import { CheckCircle, Shield, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const { error: supabaseError } = await supabase
        .from("waitlist")
        .insert({ 
          email: email.trim().toLowerCase() 
        });

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        
        if (supabaseError.code === "23505") {
          setError("This email is already on the waitlist. Thank you!");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose(open: boolean) {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
        setError("");
      }, 300);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
              <DialogTitle className="text-center text-2xl font-semibold">
                Get Early Access
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600 mt-2">
                Join hundreds of small business owners on the waitlist.<br />
                First 1,000 members get free lifetime access.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="text-base h-12"
                disabled={loading}
              />

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm justify-center bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base"
                disabled={loading || !email.trim()}
              >
                {loading ? "Adding you to the list..." : "Join the Waitlist – Get Early Access"}
              </Button>

              <p className="text-center text-xs text-slate-400">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        ) : (
          <div className="py-10 text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-slate-900">
                You're on the list!
              </h3>
              <p className="text-slate-600">
                We'll notify you as soon as early access opens.<br />
                Thank you for joining RegBot!
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={() => handleClose(false)}
              className="mt-4"
            >
              Close Window
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}