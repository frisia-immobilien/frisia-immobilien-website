"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore, useState } from "react";
import { CONSENT_UPDATED_EVENT, hasAnalyticsConsent } from "@/lib/consent";

const GoogleAnalytics = dynamic(() => import("@/components/analytics/GoogleAnalytics.client"), {
  ssr: false,
});

const InteractionTracker = dynamic(() => import("@/components/analytics/InteractionTracker.client"), {
  ssr: false,
});

const ANALYTICS_IDLE_DELAY_MS = 4500;

function subscribeToConsent(callback: () => void) {
  window.addEventListener(CONSENT_UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CONSENT_UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getAnalyticsConsentSnapshot() {
  return hasAnalyticsConsent();
}

function getServerConsentSnapshot() {
  return false;
}

export default function SiteAnalyticsBoot() {
  const analyticsEnabled = useSyncExternalStore(
    subscribeToConsent,
    getAnalyticsConsentSnapshot,
    getServerConsentSnapshot,
  );
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled || shouldLoadAnalytics) return;

    let idleHandle: number | null = null;
    const timeoutHandle = window.setTimeout(() => {
      setShouldLoadAnalytics(true);
    }, ANALYTICS_IDLE_DELAY_MS);

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(
        () => {
          window.clearTimeout(timeoutHandle);
          setShouldLoadAnalytics(true);
        },
        { timeout: ANALYTICS_IDLE_DELAY_MS },
      );
    }

    return () => {
      window.clearTimeout(timeoutHandle);
      if (idleHandle !== null) window.cancelIdleCallback?.(idleHandle);
    };
  }, [analyticsEnabled, shouldLoadAnalytics]);

  if (!analyticsEnabled || !shouldLoadAnalytics) return null;

  return (
    <>
      <GoogleAnalytics />
      <InteractionTracker />
    </>
  );
}
