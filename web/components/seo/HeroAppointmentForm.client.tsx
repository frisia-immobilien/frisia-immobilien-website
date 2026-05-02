"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

type SubmitState = "idle" | "submitting" | "success" | "error";

type HeroAppointmentFormProps = {
  locationLabel: string;
  displayLocationLabel?: string;
  displayLocationPhrase?: string;
  locationSlug: string;
};

function FieldIcon({ type }: { type: "home" | "user" | "mail" | "phone" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-5 w-5">
      {type === "home" ? (
        <>
          <path {...common} d="M5 15 16 6l11 9" />
          <path {...common} d="M8 14v12h16V14" />
          <path {...common} d="M13 26v-7h6v7" />
        </>
      ) : null}
      {type === "user" ? (
        <>
          <circle {...common} cx="16" cy="11" r="5" />
          <path {...common} d="M7 27c2-6 6-9 9-9s7 3 9 9" />
        </>
      ) : null}
      {type === "mail" ? (
        <>
          <path {...common} d="M6 9h20v14H6z" />
          <path {...common} d="m6 10 10 8 10-8" />
        </>
      ) : null}
      {type === "phone" ? (
        <path {...common} d="M10 6h4l2 6-3 2c1.6 3.2 3.8 5.4 7 7l2-3 6 2v4c0 2-1.5 3-3 3C14 27 5 18 5 7c0-1.5 1-3 3-3" />
      ) : null}
    </svg>
  );
}

function FormField({
  icon,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  icon: "home" | "user" | "mail" | "phone";
  name: string;
  type?: string;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <label className="flex min-h-10 items-center gap-3 rounded-lg border border-[color:var(--color-brass)]/25 bg-white px-3 text-xs text-[color:var(--color-graphite)] focus-within:border-[color:var(--color-navy)]">
      <span className="shrink-0 text-[color:var(--color-navy)]">
        <FieldIcon type={icon} />
      </span>
      <span className="sr-only">{placeholder}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2 text-xs text-[color:var(--color-navy)] outline-none placeholder:text-[color:var(--color-graphite)]/85"
      />
    </label>
  );
}

export default function HeroAppointmentForm({ locationLabel, displayLocationLabel, displayLocationPhrase, locationSlug }: HeroAppointmentFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const visibleLocation = displayLocationLabel ?? locationLabel;
  const visibleLocationPhrase = displayLocationPhrase ?? `in ${visibleLocation}`;

  useEffect(() => {
    if (submitState !== "success" || !message) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMessage(null);
        setSubmitState("idle");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [message, submitState]);

  function closeSuccessOverlay() {
    setMessage(null);
    setSubmitState("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitState("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/lead/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: String(formData.get("address") ?? ""),
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          website: String(formData.get("website") ?? ""),
          locationLabel,
          locationSlug,
          originUrl: window.location.href,
        }),
      });

      const data = (await response.json().catch(() => null)) as { success?: boolean; error?: string; message?: string } | null;

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.error || "Die Anfrage konnte gerade nicht übertragen werden.");
      }

      form.reset();
      setSubmitState("success");
      setMessage(
        data.message ||
          "Wir haben deine Anfrage erhalten und melden uns zeitnah bei dir, um einen passenden Termin zu vereinbaren.",
      );
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "Die Anfrage konnte gerade nicht übertragen werden.");
    }
  }

  const isSubmitting = submitState === "submitting";
  const successOverlay =
    submitState === "success" && message && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-[rgba(13,31,45,0.76)] px-5 py-8 backdrop-blur-[3px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-success-title"
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
                id="appointment-success-title"
                className="mt-5 font-[family-name:var(--font-playfair)] text-[1.9rem] leading-tight text-[color:var(--color-navy)] sm:text-[2.3rem]"
              >
                Terminanfrage erfolgreich gesendet
              </h2>
              <p className="mt-4 text-[1.02rem] leading-[1.65] text-[color:var(--color-graphite)]">
                {message}
              </p>
              <button
                type="button"
                onClick={closeSuccessOverlay}
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
              >
                Schließen
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {successOverlay}

      <aside className="w-full max-w-[366px] justify-self-center rounded-[1.15rem] border border-white/70 bg-white/92 p-4 shadow-[0_28px_90px_-58px_rgba(27,48,64,0.65)] backdrop-blur md:p-5 lg:justify-self-end">
        <h2 className="text-center text-base font-semibold leading-snug text-[color:var(--color-navy)]">
          Persönlichen Bewertungstermin vereinbaren
        </h2>
        <p className="mt-[15px] text-center text-xs leading-5 text-[color:var(--color-graphite)]">
          Vor-Ort-Bewertung deiner Immobilie {visibleLocationPhrase} – individuell und fundiert
        </p>
        <p className="mt-[15px] text-center text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brackish)]">
          Termin meist kurzfristig möglich
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <FormField icon="home" name="address" placeholder="Adresse der Immobilie" autoComplete="street-address" />
          <FormField icon="user" name="name" placeholder="Dein Name" autoComplete="name" />
          <FormField icon="mail" name="email" type="email" placeholder="E-Mail-Adresse" autoComplete="email" />
          <FormField icon="phone" name="phone" type="tel" placeholder="Telefonnummer" autoComplete="tel" />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex min-h-10 w-full items-center justify-center rounded-lg bg-[color:var(--color-navy)] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_14px_34px_-26px_rgba(27,48,64,0.75)] transition-colors hover:bg-[color:var(--color-brackish)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Wird übertragen ..." : "Termin zur Immobilienbewertung anfragen"}
          </button>
        </form>

        <p className="mt-3 text-center text-[0.65rem] leading-4 text-[color:var(--color-graphite)]">
          Mit dem Absenden dürfen wir dich zur Terminanfrage kontaktieren. Details stehen in der{" "}
          <Link href="/recht/datenschutz" className="underline underline-offset-2">
            Datenschutzerklärung
          </Link>
          .
        </p>

        {message && submitState === "error" ? (
          <p
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-[0.72rem] font-medium leading-5 text-red-900"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}

        <p className="mt-4 text-center text-[0.7rem] font-medium leading-5 text-[color:var(--color-graphite)]">
          Unverbindlich · Persönlich vor Ort · Kein Verkaufsdruck
        </p>
      </aside>
    </>
  );
}
