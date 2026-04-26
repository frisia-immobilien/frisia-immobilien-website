"use client";

import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  stepLabel: string;
  onBack: () => void;
  backDisabled?: boolean;
  children: React.ReactNode;
};

export default function LeadGenShell({ title, subtitle, stepLabel, onBack, backDisabled, children }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      {/* Bewertungsteil (alte UI, CI) */}
      <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm text-brand-graphite">{stepLabel}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand-navy">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={!!backDisabled}
            className={[
              "shrink-0 rounded-xl border px-4 py-2 text-sm",
              backDisabled
                ? "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed"
                : "border-neutral-300 text-brand-graphite hover:bg-neutral-50",
            ].join(" ")}
            aria-disabled={!!backDisabled}
          >
            Zurück
          </button>
        </div>

        {/* Trust-USPs (ruhig, konservativ) */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>Diskret</Pill>
          <Pill>Verbindlich</Pill>
          <Pill>Regional</Pill>
          <Pill>Klare Schritte</Pill>
        </div>
      </div>

      {/* Inhalt (Section) */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">{children}</div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-brand-graphite">
      {children}
    </span>
  );
}
