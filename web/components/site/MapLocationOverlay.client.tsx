"use client";

import { useState } from "react";

type MapLocationOverlayProps = {
  publicLocation: string;
};

function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.35 6-11a6 6 0 1 0-12 0c0 5.65 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export default function MapLocationOverlay({ publicLocation }: MapLocationOverlayProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/92 px-5 py-2.5 text-sm font-medium text-[color:var(--color-navy)] shadow-[0_10px_24px_rgba(15,23,42,0.10)] backdrop-blur-sm transition-colors hover:bg-white"
        aria-label={`Lagehinweis ${publicLocation} ausblenden`}
      >
        <PinIcon className="h-4 w-4 text-[color:var(--color-brackish)]" />
        <span>{publicLocation}</span>
        <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-navy)]/8 text-[0.8rem] leading-none text-[color:var(--color-navy)]">
          ×
        </span>
      </button>
    </div>
  );
}
