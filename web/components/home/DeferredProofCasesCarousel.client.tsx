"use client";

import dynamic from "next/dynamic";
import { useDeferredHydration } from "@/components/home/useDeferredHydration";

type ProofCaseItem = {
  title: string;
  setup: string;
  approach: string;
  outcome: string;
};

const ProofCasesCarousel = dynamic(
  () => import("@/components/home/ProofCasesCarousel.client"),
  { ssr: false }
);

export default function DeferredProofCasesCarousel({
  items,
  fallback,
}: {
  items: readonly ProofCaseItem[];
  fallback: React.ReactNode;
}) {
  const { mountRef, shouldHydrate } = useDeferredHydration({
    rootMargin: "280px 0px",
    fallbackDelayMs: 9000,
  });

  return <div ref={mountRef}>{shouldHydrate ? <ProofCasesCarousel items={items} /> : fallback}</div>;
}
