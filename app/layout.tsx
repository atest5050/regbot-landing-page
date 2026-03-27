import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RegBot — Never guess your local regulations again.",
  description: "RegBot is your AI co-pilot for hyper-local permits, zoning, health codes, and compliance. Ask in plain English and get accurate, sourced answers with checklists and next steps — built for Etsy sellers, home bakers, food trucks, consultants, and every side hustler.",
  
  metadataBase: new URL("https://regbot-landing-page.vercel.app"),

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

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "RegBot — Never guess your local regulations again.",
    description: "Your AI co-pilot for hyper-local regulations and compliance. Accurate answers with sources and checklists.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RegBot - AI Compliance Co-pilot",
      },
    ],
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