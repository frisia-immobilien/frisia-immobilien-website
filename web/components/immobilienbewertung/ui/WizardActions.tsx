"use client";

import React from "react";

type Props = {
  canGoBack: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
};

export function WizardActions({
  canGoBack,
  canGoNext,
  onBack,
  onNext,
  nextLabel = "Weiter",
}: Props) {
  return (
    <div className={canGoBack ? "mt-8 flex items-center justify-between gap-3" : "mt-8 flex items-center justify-end"}>
      {/* Zurück nur rendern, wenn es auch wirklich sinnvoll ist */}
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          Zurück
        </button>
      ) : null}

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className={[
          "rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-200",
          canGoNext
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "bg-slate-200 text-slate-500 cursor-not-allowed",
        ].join(" ")}
      >
        {nextLabel}
      </button>
    </div>
  );
}
