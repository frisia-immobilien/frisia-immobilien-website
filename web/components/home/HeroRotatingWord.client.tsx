"use client";

import { useEffect, useState } from "react";

const WORDS = [
  "Haus",
  "Wohnung",
  "Grundstück",
  "Ferienhaus",
  "Doppelhaushälfte",
  "Immobilie",
] as const;

const FINAL_WORD = "Immobilie";
const STEP_MS = 1700;

export default function HeroRotatingWord() {
  // SSR + no-JS + reduced-motion safe default: final SEO keyword is visible immediately.
  const [word, setWord] = useState<string>(FINAL_WORD);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let index = 0;

    const run = () => {
      if (cancelled) return;

      const next = WORDS[index];
      setWord(next);

      if (next === FINAL_WORD) return;

      index += 1;
      timer = setTimeout(run, STEP_MS);
    };

    // Start once after hydration, then stop permanently on "Immobilie".
    run();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <span
      className="inline-block min-w-[17ch] whitespace-nowrap align-baseline"
      aria-live="off"
    >
      {word}
    </span>
  );
}
