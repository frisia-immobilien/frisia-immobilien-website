"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CONSENT_UPDATED_EVENT, hasAnalyticsConsent } from "@/lib/consent";

const InteractionTracker = dynamic(
  () => import("@/components/analytics/InteractionTracker.client"),
  { ssr: false }
);
const LeadAnchorFocusBridge = dynamic(
  () => import("@/components/home/LeadAnchorFocus.client"),
  { ssr: false }
);

const TRACKING_IDLE_DELAY_MS = 3500;

export default function HomeClientBoot() {
  const [shouldLoadTracker, setShouldLoadTracker] = useState(false);
  const [shouldMountLeadFocusBridge, setShouldMountLeadFocusBridge] = useState(false);

  useEffect(() => {
    const syncLeadAnchorBridge = () => {
      if (window.location.hash === "#bewertung") {
        setShouldMountLeadFocusBridge(true);
      }
    };

    syncLeadAnchorBridge();
    window.addEventListener("hashchange", syncLeadAnchorBridge);
    return () => window.removeEventListener("hashchange", syncLeadAnchorBridge);
  }, []);

  useEffect(() => {
    if (shouldLoadTracker) return;

    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const cleanupTimers = () => {
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
      if (idleHandle !== null) window.cancelIdleCallback?.(idleHandle);
    };

    const requestTrackerLoad = () => {
      if (!hasAnalyticsConsent()) return;
      cleanupTimers();
      setShouldLoadTracker(true);
    };

    const scheduleTrackerLoad = () => {
      if (!hasAnalyticsConsent()) return;
      cleanupTimers();
      timeoutHandle = window.setTimeout(requestTrackerLoad, TRACKING_IDLE_DELAY_MS);

      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(requestTrackerLoad, { timeout: TRACKING_IDLE_DELAY_MS });
      }
    };

    const onConsentUpdated = (event: Event) => {
      const consentEvent = event as CustomEvent<{ analytics?: boolean }>;
      if (!consentEvent.detail?.analytics) return;
      scheduleTrackerLoad();
    };

    if (hasAnalyticsConsent()) {
      scheduleTrackerLoad();
    }

    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated as EventListener);

    return () => {
      cleanupTimers();
      window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated as EventListener);
    };
  }, [shouldLoadTracker]);

  return (
    <>
      {shouldMountLeadFocusBridge ? <LeadAnchorFocusBridge /> : null}
      {shouldLoadTracker ? <InteractionTracker /> : null}
    </>
  );
}
