"use client";

import { useEffect, useRef, useState } from "react";

type DeferredHydrationOptions = {
  rootMargin: string;
  fallbackDelayMs?: number;
  hashTargets?: readonly string[];
};

export function useDeferredHydration({
  rootMargin,
  fallbackDelayMs = 0,
  hashTargets = [],
}: DeferredHydrationOptions) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [shouldHydrate, setShouldHydrate] = useState(false);

  useEffect(() => {
    if (shouldHydrate) return;

    const node = mountRef.current;
    if (!node) {
      const frame = window.requestAnimationFrame(() => {
        setShouldHydrate(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    let observer: IntersectionObserver | null = null;
    let fallbackTimer: number | null = null;

    const triggerHydration = () => {
      setShouldHydrate(true);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      observer?.disconnect();
    };

    const syncHashHydration = () => {
      if (!hashTargets.includes(window.location.hash)) return;
      triggerHydration();
    };

    syncHashHydration();
    if (hashTargets.length > 0 && window.location.hash && hashTargets.includes(window.location.hash)) {
      return;
    }

    if (fallbackDelayMs > 0) {
      fallbackTimer = window.setTimeout(triggerHydration, fallbackDelayMs);
    }

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          triggerHydration();
        },
        { rootMargin }
      );

      observer.observe(node);
    } else {
      triggerHydration();
    }

    if (hashTargets.length > 0) {
      window.addEventListener("hashchange", syncHashHydration);
    }

    return () => {
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      observer?.disconnect();
      if (hashTargets.length > 0) {
        window.removeEventListener("hashchange", syncHashHydration);
      }
    };
  }, [fallbackDelayMs, hashTargets, rootMargin, shouldHydrate]);

  return { mountRef, shouldHydrate };
}
