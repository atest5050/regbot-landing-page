// Changes summary:
// - Replaced generic Shield icon + blue square with RegPulseIcon SVG mark.
// - Logo link wrapper gets class "rp-logomark" so globals.css hover-glow applies.
// Mobile responsiveness overhaul — vMobile
// - Added hamburger toggle (Menu/X icon) visible only on mobile.
// - Mobile dropdown menu slides open below the header with nav links + CTA.

"use client";

import { useState, useEffect } from "react";
import { Menu, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaitlistModal from "./WaitlistModal";
import { RegPulseLogoFull } from "@/components/RegPulseLogo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing",  href: "#pricing"  },
  { label: "FAQ",      href: "#faq"      },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
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
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right side: CTA + hamburger */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="shadow-none"
              >
                Get Early Access
              </Button>

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen(v => !v)}
              >
                {menuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-sm">
            <nav className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <WaitlistModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
