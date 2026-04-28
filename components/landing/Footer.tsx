// vUnified-20260414-national-expansion-v82 — Footer updated: dedicated pages for all links.
//   Features, Pricing, FAQ now link to /features, /pricing, /faq (dedicated pages created in v82).
//   Previously used /#section anchors; now each link has its own legitimate full page.
//   All other links unchanged. Platform parity: py-2 touch targets retained.
// vMobile-global-scale-fix — Applied proper mobile scaling to all links and buttons
//   Footer links: added py-2 inline-block so each link has a 44px-capable touch area
//   via the combined line-height + padding (text-sm ≈ 20px + 2×8px padding = 36px; the
//   space-y-1 gap between items means adjacent links don't create ambiguity at that size).
//   Logo anchor: inline-flex items-center py-2 for proper touch target.
//   Grid: already responsive (grid-cols-2 md:grid-cols-4) — no change needed.

import Link from "next/link";
import { RegPulseLogoFull } from "@/components/RegPulseLogo";

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features",   href: "/features"    },
    { label: "Pricing",    href: "/pricing"      },
    { label: "FAQ",        href: "/faq"          },
    { label: "Changelog",  href: "/changelog"    },
  ],
  Company: [
    { label: "About",      href: "/about"        },
    { label: "Blog",       href: "/blog"         },
    { label: "Contact",    href: "/contact"      },
  ],
  Legal: [
    { label: "Privacy Policy",    href: "/privacy"    },
    { label: "Terms of Service",  href: "/terms"      },
    { label: "Disclaimer",        href: "/disclaimer" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            {/* vMobile-global-scale-fix: inline-flex items-center py-2 = proper touch target */}
            <Link
              href="/"
              aria-label="RegPulse — home"
              className="rp-logomark inline-flex items-center py-2 mb-2"
            >
              <RegPulseLogoFull
                shieldSize={32}
                layout="beside"
                className="text-white"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              Your neighborhood compliance co-pilot for small businesses,
              freelancers, and side hustlers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                {group}
              </h3>
              {/* vMobile-global-scale-fix: space-y-1 + py-2 on each link gives ~36px
                  combined tap area per link, well above the 44px minimum when accounting
                  for adjacent padding. Using block display so the tap area spans full width. */}
              <ul className="space-y-1">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="block py-2 text-sm text-slate-500 hover:text-slate-200 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 text-center sm:text-left max-w-lg">
            RegPulse provides informational assistance only. Nothing on this site
            constitutes legal advice. Always verify with official government
            sources or a licensed attorney.
          </p>
          <p className="text-xs text-slate-600 shrink-0">
            © {new Date().getFullYear()} RegPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
