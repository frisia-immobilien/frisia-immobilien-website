"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { hasAnalyticsConsent } from "@/lib/consent";

const GA_MEASUREMENT_ID = "G-CWXHCEWKE5";
const GA4_READY_EVENT = "frisia:ga4-ready";

type WindowWithGtag = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  frisiaGa4Debug?: {
    measurementId: string;
    initialized: boolean;
    libraryReady: boolean;
    pageViewsQueued: number;
    lastPagePath?: string;
  };
};

function ensureGtag() {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const w = window as WindowWithGtag;
  w.dataLayer = w.dataLayer ?? [];
  w.gtag =
    w.gtag ??
    function gtag() {
      // GA gtag.js expects the original arguments object in the queue.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer?.push(arguments);
    };

  if (!w.frisiaGa4Debug?.initialized) {
    w.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
      personalization_storage: "denied",
      security_storage: "granted",
    });
    w.gtag("set", "ads_data_redaction", true);
    w.gtag("js", new Date());
    w.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
  }

  w.frisiaGa4Debug = {
    measurementId: GA_MEASUREMENT_ID,
    initialized: true,
    libraryReady: Boolean(w.frisiaGa4Debug?.libraryReady),
    pageViewsQueued: w.frisiaGa4Debug?.pageViewsQueued ?? 0,
    lastPagePath: w.frisiaGa4Debug?.lastPagePath,
  };
}

function sendPageView(pagePath: string) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  ensureGtag();
  const w = window as WindowWithGtag;
  if (typeof w.gtag !== "function") return;

  w.gtag("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });

  w.frisiaGa4Debug = {
    measurementId: GA_MEASUREMENT_ID,
    initialized: true,
    libraryReady: Boolean(w.frisiaGa4Debug?.libraryReady),
    pageViewsQueued: (w.frisiaGa4Debug?.pageViewsQueued ?? 0) + 1,
    lastPagePath: pagePath,
  };
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const lastPagePathRef = useRef<string | null>(null);

  useEffect(() => {
    ensureGtag();
  }, []);

  useEffect(() => {
    const pagePath = `${window.location.pathname}${window.location.search}`;
    if (lastPagePathRef.current === pagePath) return;
    sendPageView(pagePath);
    lastPagePathRef.current = pagePath;
  }, [pathname]);

  return (
    <Script
      id="frisia-ga4-library"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
      onReady={() => {
        const w = window as WindowWithGtag;
        w.frisiaGa4Debug = {
          measurementId: GA_MEASUREMENT_ID,
          initialized: Boolean(w.frisiaGa4Debug?.initialized),
          libraryReady: true,
          pageViewsQueued: w.frisiaGa4Debug?.pageViewsQueued ?? 0,
          lastPagePath: w.frisiaGa4Debug?.lastPagePath,
        };
        window.dispatchEvent(new Event(GA4_READY_EVENT));
      }}
    />
  );
}
