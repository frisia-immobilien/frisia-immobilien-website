"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { shouldBypassTurnstileForLocalDev } from "@/lib/turnstile";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible" | "invisible";
          appearance?: "always" | "execute" | "interaction-only";
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  website: string;
};

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

type KontaktFormProps = {
  id?: string;
  heading?: string;
  intro?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  trustItems?: readonly string[];
  context?: string;
};

export default function KontaktForm({
  id = "kontaktformular",
  heading = "Persönlich anfragen",
  intro = "Beschreib kurz dein Anliegen. Zwei Sätze reichen – wir melden uns persönlich bei dir.",
  messageLabel = "Nachricht *",
  messagePlaceholder = "z.B.: Ich überlege, meine Immobilie zu verkaufen und möchte wissen, was sie aktuell wert ist.",
  submitLabel = "Nachricht senden – wir melden uns persönlich",
  successTitle = "Nachricht eingegangen",
  successMessage = "Vielen Dank. Deine Nachricht ist bei uns eingegangen. Wir melden uns zeitnah persönlich bei dir.",
  trustItems = ["Persönliche Rückmeldung", "Vertraulich", "Unverbindlich"],
  context = "Kontaktanfrage Website",
}: KontaktFormProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const captchaBypassed = shouldBypassTurnstileForLocalDev(siteKey);
  const captchaEnabled = Boolean(siteKey) && !captchaBypassed;

  const [form, setForm] = useState<FormState>(INITIAL);
  const [captchaToken, setCaptchaToken] = useState("");
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const introParagraphs = useMemo(
    () => intro.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean),
    [intro],
  );

  const canSubmit = useMemo(() => {
    if (status === "sending") return false;
    if (!form.firstName || !form.lastName || !form.email || !form.message) return false;
    if (captchaEnabled && !captchaToken) return false;
    return true;
  }, [captchaEnabled, captchaToken, form, status]);

  const initTurnstile = useCallback(() => {
    if (!captchaEnabled || widgetId || !widgetRef.current) return;
    if (!window.turnstile) return;

    try {
      const id = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token: string) => {
          setCaptchaToken(token);
          setCaptchaError("");
        },
        "expired-callback": () => setCaptchaToken(""),
        "error-callback": () => {
          setCaptchaToken("");
          setCaptchaError("Captcha konnte nicht geladen werden. Bitte Seite neu laden.");
        },
      });
      setWidgetId(id);
      setCaptchaReady(true);
      setCaptchaError("");
    } catch {
      setCaptchaReady(false);
      setCaptchaError("Captcha konnte nicht initialisiert werden. Bitte Seite neu laden.");
    }
  }, [captchaEnabled, siteKey, widgetId]);

  useEffect(() => {
    if (!captchaEnabled || widgetId || !scriptLoaded) return;

    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (window.turnstile && widgetRef.current && !widgetId) {
        initTurnstile();
        window.clearInterval(timer);
      }
      if (tries >= 20) {
        window.clearInterval(timer);
        if (!window.turnstile) {
          setCaptchaError("Captcha-Skript wurde blockiert. Bitte Content-Blocker prüfen.");
        }
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [captchaEnabled, initTurnstile, scriptLoaded, widgetId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("sending");
    setErrorMessage("");

    const response = await fetch("/api/contact/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        captchaToken,
        originUrl: window.location.href,
        context,
      }),
    });

    const data = (await response.json()) as { success?: boolean; error?: string };
    if (!response.ok || !data.success) {
      setStatus("error");
      setErrorMessage(data.error || "Senden fehlgeschlagen.");
      if (widgetId && window.turnstile) {
        window.turnstile.reset(widgetId);
        setCaptchaToken("");
      }
      return;
    }

    setStatus("success");
    setForm(INITIAL);
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
      setCaptchaToken("");
    }
  }

  function closeSuccessOverlay() {
    setStatus("idle");
  }

  return (
    <>
      {status === "success" ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(13,31,45,0.68)] px-5 py-8 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kontakt-success-title"
          onClick={closeSuccessOverlay}
        >
          <div
            className="w-full max-w-[38rem] rounded-[2rem] border border-white/70 bg-white px-6 py-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-10 sm:py-9"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl font-semibold text-emerald-800">
              ✓
            </p>
            <h2
              id="kontakt-success-title"
              className="mt-5 font-[family-name:var(--font-playfair)] text-[1.9rem] leading-tight text-[color:var(--color-navy)] sm:text-[2.3rem]"
            >
              {successTitle}
            </h2>
            <p className="mt-4 text-[1.02rem] leading-[1.65] text-[color:var(--color-graphite)]">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={closeSuccessOverlay}
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
            >
              Schließen
            </button>
          </div>
        </div>
      ) : null}

      <section id={id} className="scroll-mt-24 rounded-[1.75rem] border border-[color:var(--color-brass)]/32 bg-[#EEF1F3] p-7 shadow-[0_28px_80px_rgba(15,23,42,0.13)] md:p-10">
      {captchaEnabled ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          onLoad={() => setScriptLoaded(true)}
          onError={() => setCaptchaError("Captcha-Skript konnte nicht geladen werden.")}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr] lg:gap-8">
        <div className="relative overflow-hidden lg:min-h-[18rem]">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-[1.15] text-[color:var(--color-navy)] md:text-4xl">
            {heading}
          </h2>
          <div className="mt-4 max-w-[46ch] space-y-4 text-base leading-[1.8] text-[color:var(--color-navy)]/82">
            {introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Image
            src="/images/frisia/frisia_f.webp"
            alt=""
            width={520}
            height={520}
            sizes="(max-width: 1024px) 0px, 360px"
            className="pointer-events-none absolute bottom-0 left-0 hidden h-auto w-[27.5rem] -translate-x-[30%] opacity-20 lg:block"
            aria-hidden="true"
          />
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 rounded-[1.4rem] border border-[color:var(--color-navy)]/10 bg-white p-5 shadow-[0_24px_65px_rgba(15,23,42,0.12)] sm:p-6">
          <p className="text-xs font-semibold text-[color:var(--color-graphite)]/90">* Pflichtfeld</p>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            value={form.website}
            onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--color-navy)]">Vorname *</span>
              <input
                type="text"
                name="firstName"
                required
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                className="h-11 border-0 border-b-2 border-[color:var(--color-navy)]/55 bg-transparent px-0 text-base text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/72 focus:border-[color:var(--color-navy)]"
                placeholder="Max"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--color-navy)]">Nachname *</span>
              <input
                type="text"
                name="lastName"
                required
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                className="h-11 border-0 border-b-2 border-[color:var(--color-navy)]/55 bg-transparent px-0 text-base text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/72 focus:border-[color:var(--color-navy)]"
                placeholder="Mustermann"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--color-navy)]">E-Mail *</span>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="h-11 border-0 border-b-2 border-[color:var(--color-navy)]/55 bg-transparent px-0 text-base text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/72 focus:border-[color:var(--color-navy)]"
                placeholder="name@beispiel.de"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--color-navy)]">Telefon (optional)</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="h-11 border-0 border-b-2 border-[color:var(--color-navy)]/55 bg-transparent px-0 text-base text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/72 focus:border-[color:var(--color-navy)]"
                placeholder="04941 986770-0"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[color:var(--color-navy)]">{messageLabel}</span>
            <textarea
              name="message"
              rows={8}
              required
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="min-h-[13rem] resize-y rounded-xl border-2 border-[color:var(--color-navy)]/45 bg-white p-4 text-base text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/72 focus:border-[color:var(--color-navy)]"
              placeholder={messagePlaceholder}
            />
          </label>

          {captchaEnabled ? (
            <div className="h-[55px] max-w-[320px] overflow-hidden rounded-xl bg-white">
              <div ref={widgetRef} id="turnstile-widget" className="min-h-[65px]" />
            </div>
          ) : null}
          {captchaEnabled && !captchaReady ? (
            <p className="text-xs text-[color:var(--color-graphite)]/80">
              Captcha wird geladen …
            </p>
          ) : null}
          {captchaError ? (
            <p className="text-xs text-red-700">{captchaError}</p>
          ) : null}

          <p className="text-xs leading-[1.6] text-[color:var(--color-graphite)]">
            Mit dem Absenden erklärst du dich mit der Verarbeitung deiner Angaben zur Kontaktaufnahme einverstanden.
            Details findest du in unserer{" "}
            <Link href="/recht/datenschutz" className="underline underline-offset-4">
              Datenschutzerklärung
            </Link>
            .
          </p>

          <div className="pt-5">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex rounded-xl bg-[color:var(--color-navy)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] disabled:cursor-not-allowed disabled:bg-[color:var(--color-navy)]/72 disabled:text-white"
            >
              {status === "sending" ? "Wird gesendet..." : submitLabel}
            </button>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[color:var(--color-navy)]">
              {trustItems.map((item) => (
                <span key={item}>✓ {item}</span>
              ))}
            </div>
          </div>

          {status === "error" ? (
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          ) : null}
        </form>
      </div>
      </section>
    </>
  );
}
