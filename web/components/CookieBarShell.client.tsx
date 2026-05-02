"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const CookieBar = lazy(() => import("@/components/CookieBar.client"));

export default function CookieBarShell() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [openSettingsSignal, setOpenSettingsSignal] = useState(0);

  useEffect(() => {
    if (shouldLoad) return;

    const loadAfterInteraction = () => {
      setShouldLoad(true);
    };

    const openSettings = () => {
      setShouldLoad(true);
      setOpenSettingsSignal((value) => value + 1);
    };

    window.addEventListener("pointerdown", loadAfterInteraction, { passive: true, once: true });
    window.addEventListener("keydown", loadAfterInteraction, { passive: true, once: true });
    window.addEventListener("touchstart", loadAfterInteraction, { passive: true, once: true });
    window.addEventListener("frisia:open-cookie-settings", openSettings as EventListener);

    return () => {
      window.removeEventListener("pointerdown", loadAfterInteraction);
      window.removeEventListener("keydown", loadAfterInteraction);
      window.removeEventListener("touchstart", loadAfterInteraction);
      window.removeEventListener("frisia:open-cookie-settings", openSettings as EventListener);
    };
  }, [shouldLoad]);

  return shouldLoad ? (
    <Suspense fallback={null}>
      <CookieBar openSettingsSignal={openSettingsSignal} />
    </Suspense>
  ) : null;
}
