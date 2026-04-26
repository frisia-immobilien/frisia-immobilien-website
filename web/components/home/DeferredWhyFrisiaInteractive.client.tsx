"use client";

import dynamic from "next/dynamic";
import { useDeferredHydration } from "@/components/home/useDeferredHydration";

const WhyFrisiaInteractive = dynamic(
  () => import("@/components/home/WhyFrisiaInteractive.client"),
  { ssr: false }
);

export default function DeferredWhyFrisiaInteractive({
  fallback,
}: {
  fallback: React.ReactNode;
}) {
  const { mountRef, shouldHydrate } = useDeferredHydration({
    rootMargin: "320px 0px",
    fallbackDelayMs: 9000,
  });

  return <div ref={mountRef}>{shouldHydrate ? <WhyFrisiaInteractive /> : fallback}</div>;
}
