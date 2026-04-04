/**
 * InnerPageLayout
 *
 * Shared shell for all inner marketing pages (About, Blog, Changelog, Contact,
 * Privacy, Terms, Disclaimer). Renders:
 *  – The sticky Navbar (with waitlist modal built in)
 *  – A consistent page hero (title + optional subtitle)
 *  – The page body
 *  – The Footer
 */

import Navbar from "./Navbar";
import Footer from "./Footer";

interface InnerPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** When true the hero background is the dark navy gradient used on legal pages. */
  darkHero?: boolean;
}

export default function InnerPageLayout({
  title,
  subtitle,
  children,
  darkHero = false,
}: InnerPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div
        className={`pt-28 pb-14 px-4 text-center ${
          darkHero
            ? "bg-slate-900"
            : "bg-gradient-to-b from-slate-50 to-white"
        }`}
      >
        <div className="mx-auto max-w-3xl">
          <h1
            className={`text-3xl sm:text-4xl font-bold tracking-tight mb-3 ${
              darkHero ? "text-white" : "text-slate-900"
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`text-base sm:text-lg leading-relaxed ${
                darkHero ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
