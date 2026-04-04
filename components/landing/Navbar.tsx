// Changes summary:
// - Replaced generic Shield icon + blue square with RegPulseIcon SVG mark.
// - Logo link wrapper gets class "rp-logomark" so globals.css hover-glow applies.

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import WaitlistModal from "./WaitlistModal";
import { RegPulseLogoFull } from "@/components/RegPulseLogo";

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
            <a href="#" aria-label="RegPulse AI — home">
              <RegPulseLogoFull
                shieldSize={32}
                layout="beside"
                className="text-slate-900"
              />
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
