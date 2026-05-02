'use client';

import { useEffect, useRef } from "react";

type ResultEvent =
  | "result_page_opened"
  | "price_range_seen"
  | "primary_cta_clicked"
  | "callback_cta_clicked"
  | "manual_review_seen"
  | "trust_block_seen"
  | "result_page_abandoned"
  | "email_link_opened";

type Props = {
  token: string;
  manualReview?: boolean;
};

function postEvent(token: string, eventType: ResultEvent) {
  if (!token) return;

  const payload = JSON.stringify({ token, eventType });

  if (eventType === "result_page_abandoned" && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon(
      "/api/lead/result-event",
      new Blob([payload], { type: "application/json" }),
    );
    return;
  }

  void fetch("/api/lead/result-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: eventType === "result_page_abandoned",
  }).catch(() => {
    // Tracking darf die Ergebnisseite nie stören.
  });
}

export default function LeadResultTrackingClient({ token, manualReview = false }: Props) {
  const seen = useRef(new Set<ResultEvent>());
  const clickedCta = useRef(false);

  useEffect(() => {
    const trackOnce = (eventType: ResultEvent) => {
      if (seen.current.has(eventType)) return;
      seen.current.add(eventType);
      postEvent(token, eventType);
    };

    trackOnce("result_page_opened");

    const params = new URLSearchParams(window.location.search);
    if (params.get("utm_source") === "email" || params.get("quelle") === "email") {
      trackOnce("email_link_opened");
    }

    if (manualReview) {
      trackOnce("manual_review_seen");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target.id === "price-range-section") trackOnce("price_range_seen");
          if (entry.target.id === "vertrauen") trackOnce("trust_block_seen");
        }
      },
      { threshold: 0.35 },
    );

    const priceRange = document.getElementById("price-range-section");
    const trustBlock = document.getElementById("vertrauen");
    if (priceRange) observer.observe(priceRange);
    if (trustBlock) observer.observe(trustBlock);

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-lead-event]") : null;
      const eventType = target?.dataset.leadEvent as ResultEvent | undefined;
      if (!eventType) return;
      clickedCta.current = true;
      postEvent(token, eventType);
    };

    const onPageHide = () => {
      if (!clickedCta.current) {
        postEvent(token, "result_page_abandoned");
      }
    };

    document.addEventListener("click", onClick);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [manualReview, token]);

  return null;
}
