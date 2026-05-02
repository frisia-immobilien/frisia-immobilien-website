"use client";

import { lazy, Suspense } from "react";
import { useDeferredHydration } from "@/components/home/useDeferredHydration";

const HomeBelowFold = lazy(() => import("@/components/home/HomeBelowFold.client"));

const BELOW_FOLD_HASH_TARGETS = [
  "#prozess-test",
  "#warum-beauftragen",
  "#warum-frisia",
  "#regionaler-immobilienmarkt",
  "#faq",
] as const;

export default function DeferredHomeBelowFold() {
  const { mountRef, shouldHydrate } = useDeferredHydration({
    rootMargin: "180px 0px",
    hashTargets: BELOW_FOLD_HASH_TARGETS,
  });

  return (
    <div ref={mountRef} className="min-h-px">
      {shouldHydrate ? (
        <Suspense fallback={null}>
          <HomeBelowFold />
        </Suspense>
      ) : null}
    </div>
  );
}
