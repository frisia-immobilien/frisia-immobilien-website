"use client";

import dynamic from "next/dynamic";
import { useDeferredHydration } from "@/components/home/useDeferredHydration";

const TestimonialsCarousel = dynamic(
  () => import("@/components/home/TestimonialsCarousel.client"),
  { ssr: false }
);

export default function DeferredTestimonialsCarousel({
  fallback,
}: {
  fallback: React.ReactNode;
}) {
  const { mountRef, shouldHydrate } = useDeferredHydration({
    rootMargin: "320px 0px",
    fallbackDelayMs: 9000,
  });

  return <div ref={mountRef}>{shouldHydrate ? <TestimonialsCarousel /> : fallback}</div>;
}
