"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaitlistModal from "./WaitlistModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                RegBot
              </span>
            </a>

            {/* Nav links — hidden on mobile */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                FAQ
              </a>
            </nav>

            {/* CTA */}
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              className="shadow-none"
            >
              Get Early Access
            </Button>
          </div>
        </div>
      </header>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
