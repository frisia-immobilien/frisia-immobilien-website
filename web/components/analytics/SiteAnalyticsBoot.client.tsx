"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { CONSENT_UPDATED_EVENT, hasAnalyticsConsent } from "@/lib/consent";

const GoogleAnalytics = dynamic(() => import("@/components/analytics/GoogleAnalytics.client"), {
  ssr: false,
});

const InteractionTracker = dynamic(() => import("@/components/analytics/InteractionTracker.client"), {
  ssr: false,
});

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

  if (!analyticsEnabled) return null;

  return (
    <>
      <GoogleAnalytics />
      <InteractionTracker />
    </>
  );
}
