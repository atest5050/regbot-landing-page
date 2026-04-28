// vUnified-20260414-national-expansion-v96 — Client-component shim for NativeSplashPage.
// next/dynamic with ssr:false must live in a 'use client' file.
// app/page.tsx (Server Component) imports this shim instead of using dynamic() directly.
"use client";

import dynamic from "next/dynamic";

const NativeSplashPage = dynamic(
  () => import("@/components/NativeSplashPage"),
  { ssr: false }
);

export default function NativeSplashPageLoader() {
  return <NativeSplashPage />;
}
