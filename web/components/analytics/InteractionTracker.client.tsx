"use client";

import { useEffect } from "react";
import { hasAnalyticsConsent } from "@/lib/consent";

type TrackingPayload = Record<string, unknown>;

type WindowWithTracking = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
};

function track(event: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;
  const w = window as WindowWithTracking;
  const data = { event, ...payload };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(data);
  if (typeof w.gtag === "function") {
    w.gtag("event", event, payload);
  }
}

export default function InteractionTracker() {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const onClick = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement | null;
      const trackNode = target?.closest<HTMLElement>("[data-track]");
      if (!trackNode) return;
      const eventName = trackNode.dataset.track;
      if (!eventName) return;
      track(eventName, {
        label: trackNode.dataset.trackLabel ?? "",
        location: trackNode.dataset.trackLocation ?? "",
        href: trackNode.getAttribute("href") ?? "",
      });
    };

    const onLeadEvent = (evt: Event) => {
      const custom = evt as CustomEvent<TrackingPayload>;
      const detail = custom.detail ?? {};
      const eventName = typeof detail.event === "string" ? detail.event : "lead_event";
      const payload = { ...detail };
      delete payload.event;
      track(eventName, payload);
    };

    const leadSection = document.getElementById("bewertung");
    if (leadSection && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              track("lead_section_view");
              observer?.disconnect();
            }
          });
        },
        { threshold: 0.35 },
      );
    }

    if (leadSection && observer) observer.observe(leadSection);

    document.addEventListener("click", onClick);
    window.addEventListener("frisia:lead", onLeadEvent as EventListener);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("frisia:lead", onLeadEvent as EventListener);
      observer?.disconnect();
    };
  }, []);

  return null;
}
