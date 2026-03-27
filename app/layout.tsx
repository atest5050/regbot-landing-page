import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RegBot — Your Neighborhood Compliance Co-Pilot",
  description:
    "RegBot is your AI co-pilot for hyper-local permits, zoning, health codes, and compliance. Ask in plain English and get accurate, sourced answers with checklists and next steps.",
  keywords: [
    "business compliance",
    "permits",
    "zoning",
    "small business",
    "regulations",
    "AI assistant",
    "cottage food",
    "home business",
  ],
  openGraph: {
    title: "RegBot — Stop Guessing Your Local Regulations",
    description:
      "AI-powered compliance co-pilot for small businesses, freelancers, and side hustlers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans">{children}</body>
    </html>
  );
}
