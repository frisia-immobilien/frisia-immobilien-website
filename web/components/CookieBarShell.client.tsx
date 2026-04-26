"use client";

import dynamic from "next/dynamic";

const CookieBar = dynamic(() => import("@/components/CookieBar.client"), {
  ssr: false,
});

export default function CookieBarShell() {
  return <CookieBar />;
}
