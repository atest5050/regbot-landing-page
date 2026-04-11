// vMobile-global-scale-fix — Applied proper mobile scaling to all links and buttons
//   Desktop nav links: added py-2 px-1 so they have a tappable height even at sm breakpoints.
//   Logo anchor: added py-2 inline-flex items-center for a proper touch target.
//   Mobile menu links already had py-2.5 (adequate); hamburger button keeps p-2.
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
            {/* Logo — vMobile-global-scale-fix: inline-flex + py-2 gives 44px touch target */}
            <a
              href="#"
              aria-label="RegPulse AI — home"
              className="rp-logomark inline-flex items-center py-2"
            >
              <RegPulseLogoFull
                shieldSize={32}
                layout="beside"
                className="text-slate-900"
              />
            </a>

            {/* Nav links — hidden on mobile.
                vMobile-global-scale-fix: py-2 px-1 gives adequate touch height on tablets
                where md breakpoint makes these visible at smaller touch screen sizes. */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="inline-flex items-center py-2 px-1 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right side: CTA + hamburger */}
            <div className="flex items-center gap-2">
              {/* vMobile-global-scale-fix: Button size="sm" renders ≥36px; the h-16 header
                  provides implicit touch height. On mobile this is replaced by the hamburger. */}
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="shadow-none min-h-[44px]"
              >
                Get Early Access
              </Button>

              {/* Hamburger — mobile only.
                  p-2 + h-5 w-5 icon = ~44px touch target on most devices.            */}
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen(v => !v)}
              >
                {menuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu — links already have py-2.5 which meets 44px min      */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-sm">
            <nav className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors min-h-[44px] flex items-center"
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
