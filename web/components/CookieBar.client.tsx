"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  applyGoogleConsentMode,
  dispatchConsentUpdated,
  readConsentFromStorage,
  writeConsentToStorage,
} from "@/lib/consent";

export default function CookieBar({ openSettingsSignal = 0 }: { openSettingsSignal?: number }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const storedConsent = hydrated ? readConsentFromStorage() : null;
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [forcedVisible, setForcedVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOverride, setAnalyticsOverride] = useState<boolean | null>(null);

  const visible = hydrated && (forcedVisible || (ready && !storedConsent && !dismissed));
  const analytics = analyticsOverride ?? Boolean(storedConsent?.analytics);

  const openCookieSettings = useCallback(() => {
    const current = readConsentFromStorage();
    setReady(true);
    setDismissed(false);
    setAnalyticsOverride(Boolean(current?.analytics));
    setForcedVisible(true);
    setSettingsOpen(true);
  }, []);

  useEffect(() => {
    const existing = readConsentFromStorage();
    applyGoogleConsentMode(Boolean(existing?.analytics));

    let revealTimer: number | null = null;
    let idleHandle: number | null = null;
    let interactionTriggered = false;

    const reveal = () => {
      if (interactionTriggered) return;
      interactionTriggered = true;
      revealTimer = window.setTimeout(() => {
        setReady(true);
      }, 2500);
    };

    const revealOnInteraction = () => {
      reveal();
      window.removeEventListener("pointerdown", revealOnInteraction);
      window.removeEventListener("keydown", revealOnInteraction);
      window.removeEventListener("touchstart", revealOnInteraction);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(() => {
        window.addEventListener("pointerdown", revealOnInteraction, { passive: true });
        window.addEventListener("keydown", revealOnInteraction, { passive: true });
        window.addEventListener("touchstart", revealOnInteraction, { passive: true });
      }, { timeout: 3500 });
    }

    const idleFallbackHandle = window.setTimeout(() => {
      window.addEventListener("pointerdown", revealOnInteraction, { passive: true });
      window.addEventListener("keydown", revealOnInteraction, { passive: true });
      window.addEventListener("touchstart", revealOnInteraction, { passive: true });
    }, 3500);

    const openSettings = () => openCookieSettings();

    window.addEventListener("frisia:open-cookie-settings", openSettings as EventListener);
    return () => {
      if (revealTimer !== null) window.clearTimeout(revealTimer);
      if (idleHandle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }
      window.clearTimeout(idleFallbackHandle);
      window.removeEventListener("pointerdown", revealOnInteraction);
      window.removeEventListener("keydown", revealOnInteraction);
      window.removeEventListener("touchstart", revealOnInteraction);
      window.removeEventListener("frisia:open-cookie-settings", openSettings as EventListener);
    };
  }, [openCookieSettings]);

  useEffect(() => {
    if (openSettingsSignal <= 0) return;
    const handle = window.setTimeout(openCookieSettings, 0);
    return () => window.clearTimeout(handle);
  }, [openSettingsSignal, openCookieSettings]);

  const acceptNecessary = () => {
    writeConsentToStorage({ choice: "necessary", analytics: false });
    applyGoogleConsentMode(false);
    dispatchConsentUpdated(false);
    setDismissed(true);
    setForcedVisible(false);
    setAnalyticsOverride(false);
    setSettingsOpen(false);
  };

  const acceptAll = () => {
    writeConsentToStorage({ choice: "all", analytics: true });
    applyGoogleConsentMode(true);
    dispatchConsentUpdated(true);
    setDismissed(true);
    setForcedVisible(false);
    setAnalyticsOverride(true);
    setSettingsOpen(false);
  };

  const saveSettings = () => {
    writeConsentToStorage({ choice: "custom", analytics });
    applyGoogleConsentMode(analytics);
    dispatchConsentUpdated(analytics);
    setDismissed(true);
    setForcedVisible(false);
    setSettingsOpen(false);
  };

  if (!hydrated || !visible || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 z-[90] isolate pointer-events-auto border-t border-[color:var(--color-brass)]/20 bg-white/95 text-[color:var(--color-graphite)] shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur"
      role="dialog"
      aria-label="Cookie-Einstellungen"
      aria-modal="false"
    >
      <div className="relative mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl text-[0.82rem] leading-[1.55]">
            <p>
              Diese Website verwendet Cookies, um die Funktion der Seite sicherzustellen und die Nutzung anonym zu
              analysieren.
            </p>
            <p className="mt-1">
              Sie können selbst entscheiden, welche Kategorien Sie zulassen möchten. Weitere Informationen finden Sie
              in unserer{" "}
              <Link href="/recht/datenschutz" className="underline underline-offset-4">
                Datenschutzerklärung
              </Link>
              {" "}und in den{" "}
              <Link href="/recht/cookies" className="underline underline-offset-4">
                Cookie-Hinweisen
              </Link>
              .
            </p>
            <p className="mt-1">
              Sie können Ihre Einwilligung jederzeit über „Cookie-Einstellungen ändern“ im Footer widerrufen oder
              anpassen.
            </p>
          </div>

          <div className="relative z-[1] flex flex-wrap items-center gap-2 md:justify-end">
            <div className="flex flex-nowrap items-center gap-2">
              <button
                type="button"
                onClick={acceptNecessary}
                className="pointer-events-auto inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-[#1B3040] px-4 py-2 text-sm font-semibold text-white"
              >
                Nur notwendige Cookies
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="pointer-events-auto inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-[color:var(--color-navy)] bg-white/90 px-4 py-2 text-sm font-semibold text-[color:var(--color-navy)]"
              >
                Alle akzeptieren
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className="pointer-events-auto inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-[color:var(--color-brass)]/30 bg-white/90 px-4 py-2 text-sm font-semibold text-[color:var(--color-graphite)]"
            >
              Einstellungen
            </button>
          </div>
        </div>

        {settingsOpen ? (
          <div className="mt-3 rounded-xl border border-[color:var(--color-brass)]/30 bg-white/90 px-4 py-3 backdrop-blur">
            <h2 className="mb-3 text-base font-semibold text-[color:var(--color-navy)]">
              Cookie-Einstellungen
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="block font-semibold">Notwendige Cookies (immer aktiv)</span>
                  <span className="block text-xs text-[color:var(--color-graphite)]/85">
                    Diese Cookies sind erforderlich, damit die Website technisch funktioniert.
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="relative inline-flex h-12 w-14 items-center rounded-full bg-[color:var(--color-navy)]/85"
                >
                  <span className="ml-7 inline-block h-5 w-5 rounded-full bg-white shadow-sm" />
                </span>
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="block font-semibold">Analyse-Cookies (anonymisiert)</span>
                  <span className="block text-xs text-[color:var(--color-graphite)]/85">
                    Diese Cookies helfen uns zu verstehen, wie Besucher die Website nutzen.
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analytics}
                  aria-label="Analyse-Cookies umschalten"
                  onClick={() => setAnalyticsOverride(!analytics)}
                  className={`relative inline-flex h-12 w-14 cursor-pointer items-center rounded-full transition-colors ${
                    analytics ? "bg-[color:var(--color-navy)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      analytics ? "translate-x-8" : "translate-x-1.5"
                    }`}
                  />
                </button>
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={saveSettings}
                  className="mt-2 inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-[#1B3040] px-4 py-2 text-sm font-semibold text-white"
                >
                  Einstellungen speichern
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
