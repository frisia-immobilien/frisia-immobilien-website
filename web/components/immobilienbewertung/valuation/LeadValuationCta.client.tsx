'use client';

import { useState, useTransition } from "react";

type Props = {
  token: string;
  phoneHref: string;
  emailHref: string;
  trackingEnabled?: boolean;
};

async function track(token: string, eventType: "cta_precise_valuation_click" | "callback_requested") {
  const response = await fetch("/api/lead/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, eventType }),
  });

  if (!response.ok) {
    throw new Error("Tracking fehlgeschlagen.");
  }
}

export default function LeadValuationCtaClient({
  token,
  phoneHref,
  emailHref,
  trackingEnabled = true,
}: Props) {
  const [callbackDone, setCallbackDone] = useState(false);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div id="genaue-bewertung" className="rounded-[2rem] border border-[color:var(--color-sand)]/70 bg-white p-7 shadow-[0_30px_80px_-60px_rgba(27,48,64,0.28)] sm:p-10">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
        Nächster Schritt
      </div>
      <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-[2.2rem] leading-[1.05] tracking-[-0.025em] text-[color:var(--color-navy)] sm:text-[3rem]">
        Den genauen Verkaufspreis legen wir gemeinsam strukturiert fest.
      </h2>
      <p className="mt-5 max-w-3xl text-[1rem] leading-[1.8] text-[color:var(--color-graphite)] sm:text-[1.06rem]">
        Eine persönliche Bewertung berücksichtigt Zustand, Mikrolage, Grundriss, Modernisierungen und die aktuelle Nachfrage im Detail. Genau dort holen wir die letzte Präzision heraus.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => {
            if (trackingEnabled) {
              void track(token, "cta_precise_valuation_click");
            }
            document.getElementById("kontakt-optionen")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)]"
        >
          Jetzt genaue Bewertung anfordern
        </button>

        <button
          type="button"
          disabled={pending || callbackDone}
          onClick={() => {
            startTransition(async () => {
              setCallbackError(null);
              try {
                if (trackingEnabled) {
                  await track(token, "callback_requested");
                }
                setCallbackDone(true);
              } catch (error) {
                setCallbackError(error instanceof Error ? error.message : "Rückruf konnte nicht gespeichert werden.");
              }
            });
          }}
          className={[
            "inline-flex items-center justify-center rounded-2xl border px-6 py-4 text-sm font-semibold transition",
            pending || callbackDone
              ? "border-[color:var(--color-sand)] bg-[color:var(--color-sand)]/35 text-[color:var(--color-graphite)]"
              : "border-[color:var(--color-navy)]/18 bg-white text-[color:var(--color-navy)] hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)]",
          ].join(" ")}
        >
          {callbackDone ? "Rückruf ist angefragt" : pending ? "Wird gespeichert …" : "Rückruf anfordern"}
        </button>
      </div>

      {callbackError ? (
        <p className="mt-4 text-sm text-red-700">{callbackError}</p>
      ) : callbackDone ? (
        <p className="mt-4 text-sm text-[color:var(--color-graphite)]">
          {trackingEnabled
            ? "Vielen Dank. Ihr Rückrufwunsch ist gespeichert und wird persönlich geprüft."
            : "Previewmodus: Hier würde der Rückrufwunsch gespeichert und intern weitergegeben."}
        </p>
      ) : null}

      <div
        id="kontakt-optionen"
        className="mt-10 grid gap-4 rounded-[1.6rem] bg-[color:var(--color-cream)]/72 p-5 sm:grid-cols-2 sm:p-6"
      >
        <a
          href={phoneHref}
          className="rounded-[1.4rem] border border-[color:var(--color-sand)]/70 bg-white px-5 py-5 text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brackish)]"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">Telefon</div>
          <div className="mt-3 font-[family-name:var(--font-playfair)] text-[1.9rem] leading-none">Direkt anrufen</div>
          <div className="mt-3 text-sm leading-[1.7] text-[color:var(--color-graphite)]">Wenn es schnell gehen soll, besprechen wir Lage, Zustand und Preisstrategie direkt am Telefon.</div>
        </a>
        <a
          href={emailHref}
          className="rounded-[1.4rem] border border-[color:var(--color-sand)]/70 bg-white px-5 py-5 text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brackish)]"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">E-Mail</div>
          <div className="mt-3 font-[family-name:var(--font-playfair)] text-[1.9rem] leading-none">Persönlich abstimmen</div>
          <div className="mt-3 text-sm leading-[1.7] text-[color:var(--color-graphite)]">Wenn Sie Unterlagen oder Zusatzinfos haben, können Sie die Bewertung auch schriftlich vertiefen.</div>
        </a>
      </div>
    </div>
  );
}
