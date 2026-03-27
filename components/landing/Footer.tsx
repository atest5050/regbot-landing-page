import { Shield } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "FAQ", "Changelog"],
  Company: ["About", "Blog", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Disclaimer"],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">RegBot</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Your neighborhood compliance co-pilot for small businesses,
              freelancers, and side hustlers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
                {group}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 text-center sm:text-left max-w-lg">
            RegBot provides informational assistance only. Nothing on this site
            constitutes legal advice. Always verify with official government
            sources or a licensed attorney.
          </p>
          <p className="text-xs text-slate-600 shrink-0">
            © {new Date().getFullYear()} RegBot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
