"use client";

import { useEffect } from "react";

const FOCUSABLE_SELECTOR =
  "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])";

function focusLeadTarget() {
  if (window.location.hash !== "#bewertung") return;
  const section = document.getElementById("bewertung");
  if (!section) return;

  const firstInteractive = section.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  if (firstInteractive) {
    firstInteractive.focus({ preventScroll: true });
  } else {
    section.focus({ preventScroll: true });
  }
}

export default function LeadAnchorFocusBridge() {
  useEffect(() => {
    const onHashChange = () => {
      window.requestAnimationFrame(focusLeadTarget);
    };

    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
