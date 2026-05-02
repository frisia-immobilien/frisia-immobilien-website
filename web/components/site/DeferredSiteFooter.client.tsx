"use client";

import { lazy, Suspense } from "react";
import { useDeferredHydration } from "@/components/home/useDeferredHydration";

const SiteFooter = lazy(() => import("@/components/site/SiteFooter"));

export default function DeferredSiteFooter() {
  const { mountRef, shouldHydrate } = useDeferredHydration({
    rootMargin: "260px 0px",
  });

  return (
    <div ref={mountRef} className="min-h-px">
      {shouldHydrate ? (
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      ) : null}
    </div>
  );
}
