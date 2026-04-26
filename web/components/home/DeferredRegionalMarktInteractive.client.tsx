"use client";

import dynamic from "next/dynamic";
import { useDeferredHydration } from "@/components/home/useDeferredHydration";

const RegionalMarktInteractive = dynamic(
  () => import("@/components/home/RegionalMarktInteractive.client"),
  { ssr: false }
);

export default function DeferredRegionalMarktInteractive({
  fallback,
}: {
  fallback: React.ReactNode;
}) {
  const { mountRef, shouldHydrate } = useDeferredHydration({
    rootMargin: "320px 0px",
    fallbackDelayMs: 9000,
  });

  return <div ref={mountRef}>{shouldHydrate ? <RegionalMarktInteractive /> : fallback}</div>;
}
