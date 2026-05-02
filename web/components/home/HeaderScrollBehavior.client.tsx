"use client";

import { useEffect } from "react";

const MIN_SCROLL_TO_HIDE = 96;
const SCROLL_DELTA = 6;

export default function HeaderScrollBehavior() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header='true']");
    const mobileMenu = document.querySelector<HTMLDetailsElement>("[data-site-mobile-menu='true']");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;
    let hidden = false;

    const setHidden = (nextHidden: boolean) => {
      if (hidden === nextHidden) return;
      hidden = nextHidden;
      header.style.transform = nextHidden ? "translateY(-100%)" : "translateY(0)";
    };

    const shouldStayVisible = () =>
      window.scrollY <= MIN_SCROLL_TO_HIDE ||
      Boolean(mobileMenu?.open) ||
      Boolean(document.activeElement && header.contains(document.activeElement));

    const update = () => {
      ticking = false;
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (shouldStayVisible()) {
        setHidden(false);
        lastY = currentY;
        return;
      }

      if (Math.abs(delta) < SCROLL_DELTA) return;

      setHidden(delta > 0);
      lastY = currentY;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    const showHeader = () => setHidden(false);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    header.addEventListener("focusin", showHeader);
    mobileMenu?.addEventListener("toggle", showHeader);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      header.removeEventListener("focusin", showHeader);
      mobileMenu?.removeEventListener("toggle", showHeader);
      header.style.transform = "";
    };
  }, []);

  return null;
}
