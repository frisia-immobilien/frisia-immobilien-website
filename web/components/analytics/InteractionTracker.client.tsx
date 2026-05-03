"use client";

import { useEffect } from "react";
import { FORM_SUBMIT_SUCCESS_EVENT } from "@/lib/analytics";
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

function textFromNode(node: HTMLElement) {
  return (node.textContent ?? "").replace(/\s+/g, " ").trim();
}

function pagePayload() {
  return {
    page_path: window.location.pathname,
    page_location: window.location.href,
  };
}

function semanticClickEvent(node: HTMLElement): { event: string; payload: TrackingPayload } | null {
  const href = node.getAttribute("href") ?? "";
  const label = node.dataset.trackLabel ?? "";
  const location = node.dataset.trackLocation ?? "";
  const linkText = textFromNode(node);
  const haystack = `${linkText} ${label} ${href}`.toLowerCase();
  const basePayload = {
    ...pagePayload(),
    label,
    location,
    link_text: linkText.slice(0, 140),
    link_url: href,
  };

  if (href.toLowerCase().startsWith("tel:")) {
    return {
      event: "phone_click",
      payload: {
        ...basePayload,
        phone_number: href.replace(/^tel:/i, ""),
      },
    };
  }

  if (
    haystack.includes("immobilie bewerten lassen") ||
    haystack.includes("immobilie_bewerten") ||
    haystack.includes("immobilienbewertung") ||
    haystack.includes("#bewertung") ||
    haystack.includes("#immobilienbewertung")
  ) {
    return {
      event: "valuation_cta_click",
      payload: {
        ...basePayload,
        cta_name: "Immobilie bewerten lassen",
      },
    };
  }

  if (haystack.includes("erstgespräch") || haystack.includes("erstgespraech")) {
    return {
      event: "initial_consultation_click",
      payload: {
        ...basePayload,
        cta_name: "Erstgespräch",
      },
    };
  }

  return null;
}

export default function InteractionTracker() {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const onClick = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement | null;
      const clickableNode = target?.closest<HTMLElement>("a, button, [role='button']");
      if (clickableNode) {
        const semanticEvent = semanticClickEvent(clickableNode);
        if (semanticEvent) {
          track(semanticEvent.event, semanticEvent.payload);
          return;
        }
      }

      const trackNode = target?.closest<HTMLElement>("[data-track]");
      if (!trackNode) return;
      const eventName = trackNode.dataset.track;
      if (!eventName) return;
      track(eventName, {
        ...pagePayload(),
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
      if (eventName === "lead_submit_success") {
        track("form_submit_success", {
          ...pagePayload(),
          form_name: "leadgenerator",
          form_context: "immobilienbewertung",
          ...payload,
        });
      }
      track(eventName, payload);
    };

    const onFormSubmitSuccess = (evt: Event) => {
      const custom = evt as CustomEvent<TrackingPayload>;
      track("form_submit_success", {
        ...pagePayload(),
        ...(custom.detail ?? {}),
      });
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
    window.addEventListener(FORM_SUBMIT_SUCCESS_EVENT, onFormSubmitSuccess as EventListener);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("frisia:lead", onLeadEvent as EventListener);
      window.removeEventListener(FORM_SUBMIT_SUCCESS_EVENT, onFormSubmitSuccess as EventListener);
      observer?.disconnect();
    };
  }, []);

  return null;
}
