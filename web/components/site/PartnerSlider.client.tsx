"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import type { WebsitePartner } from "@/lib/partners";

type PartnerSliderProps = {
  partners: WebsitePartner[];
};

const PARTNER_FALLBACK_IMAGE = "/images/maklerhaus/buero1.webp";
const AUTO_SLIDE_INTERVAL_MS = 4200;
const PARTNER_TEXT_MAX_LENGTH = 175;

function limitPartnerText(text: string) {
  const normalized = text.trim();
  const characters = Array.from(normalized);
  if (characters.length <= PARTNER_TEXT_MAX_LENGTH) return normalized;

  const excerpt = characters.slice(0, PARTNER_TEXT_MAX_LENGTH - 3).join("").trimEnd();
  const lastSpace = excerpt.lastIndexOf(" ");
  const cleanExcerpt = lastSpace > 90 ? excerpt.slice(0, lastSpace) : excerpt;
  return `${cleanExcerpt}...`;
}

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {direction === "previous" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

export default function PartnerSlider({ partners }: PartnerSliderProps) {
  const visiblePartners = useMemo(() => partners.filter((partner) => partner.active), [partners]);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = visiblePartners.length > 0 ? activeIndex % visiblePartners.length : 0;

  const activePartner = visiblePartners[safeActiveIndex] ?? visiblePartners[0];

  useEffect(() => {
    if (visiblePartners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visiblePartners.length);
    }, AUTO_SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [visiblePartners.length]);

  if (!activePartner) return null;

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + visiblePartners.length) % visiblePartners.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % visiblePartners.length);
  }

  return (
    <section
      aria-label="Partner von Frisia Immobilien"
      className="relative overflow-hidden bg-[#f4f2ec] py-10 sm:py-18 lg:py-22"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase leading-6 tracking-[0.16em] text-[color:var(--color-brackish)]">
              Partnernetzwerk
            </p>
            <h2 className="mt-3 max-w-[11.5ch] font-[family-name:var(--font-playfair)] text-[clamp(2.2rem,4.55vw,4.35rem)] font-normal leading-[1.02] text-[color:var(--color-navy)]">
              Gute Verbindungen. Klare Abläufe.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-[color:var(--color-graphite)] sm:text-lg">
            Ausgewählte Partner ergänzen unsere Arbeit dort, wo Reichweite, Vorbereitung,
            Bewertung, Baukompetenz oder rechtliche Abwicklung zählen.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Vorherigen Partner anzeigen"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-brass)]/35 bg-white text-[color:var(--color-navy)] shadow-[0_14px_40px_rgba(27,48,64,0.08)] transition hover:border-[color:var(--color-navy)] hover:bg-[color:var(--color-navy)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              onClick={goToPrevious}
            >
              <ArrowIcon direction="previous" />
            </button>
            <button
              type="button"
              aria-label="Naechsten Partner anzeigen"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-brass)]/35 bg-white text-[color:var(--color-navy)] shadow-[0_14px_40px_rgba(27,48,64,0.08)] transition hover:border-[color:var(--color-navy)] hover:bg-[color:var(--color-navy)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              onClick={goToNext}
            >
              <ArrowIcon direction="next" />
            </button>
            <div className="ml-2 text-sm font-semibold text-[color:var(--color-brackish)]">
              {String(safeActiveIndex + 1).padStart(2, "0")} / {String(visiblePartners.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        <div className="relative min-h-[620px] sm:min-h-[650px] lg:min-h-[660px]">
          {visiblePartners.map((partner, index) => {
            const isActive = index === safeActiveIndex;
            const partnerText = limitPartnerText(partner.text);
            return (
              <article
                key={partner.key}
                aria-hidden={!isActive}
                aria-live={isActive ? "polite" : "off"}
                className={`absolute inset-0 grid grid-rows-[auto_1fr] overflow-hidden rounded-[22px] border border-[color:var(--color-brass)]/25 bg-white shadow-[0_24px_80px_rgba(27,48,64,0.12)] transition duration-700 ease-out sm:rounded-[28px] ${
                  isActive
                    ? "pointer-events-auto translate-x-0 opacity-100"
                    : "pointer-events-none translate-x-8 opacity-0"
                }`}
              >
                <div className="relative flex h-[170px] items-center justify-center overflow-hidden bg-white px-5 py-5 sm:h-[220px] sm:px-8 sm:py-7 lg:h-[240px] lg:px-9 lg:py-8">
                  <img
                    key={partner.imageUrl}
                    src={partner.imageUrl}
                    alt=""
                    className={`block h-auto w-auto max-h-[130px] max-w-[86%] object-contain object-center transition-opacity duration-[1200ms] ease-out sm:max-h-[165px] lg:max-h-[185px] ${
                      isActive ? "opacity-100" : "opacity-80"
                    }`}
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.src.endsWith(PARTNER_FALLBACK_IMAGE)) return;
                      image.src = PARTNER_FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="flex min-h-0 flex-col justify-between gap-4 p-5 sm:p-7 lg:p-8">
                  <div>
                    <p className="text-xs font-semibold uppercase leading-6 tracking-[0.16em] text-[color:var(--color-brackish)]">
                      Partner
                    </p>
                    <h3 className="mt-2 break-words font-[family-name:var(--font-playfair)] text-[clamp(1.75rem,3.2vw,2.75rem)] font-normal leading-[1.06] text-[color:var(--color-navy)]">
                      {partner.name}
                    </h3>
                    <p className="mt-3 text-[0.94rem] leading-[1.55] text-[color:var(--color-graphite)] sm:mt-4 sm:text-base sm:leading-7">
                      {partnerText}
                    </p>
                  </div>
                  {partner.websiteUrl ? (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener"
                      className="mt-5 inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-[color:var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] focus-visible:ring-offset-2 sm:min-h-11 sm:px-6 sm:py-3"
                    >
                      Website öffnen
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-wrap gap-x-3 gap-y-3 overflow-visible px-4 pb-2 sm:px-6">
        {visiblePartners.map((partner, index) => (
          <button
            key={partner.key}
            type="button"
            aria-label={`${partner.name} anzeigen`}
            aria-current={index === safeActiveIndex}
            className={`max-w-full rounded-full border px-4 py-2 text-sm font-semibold transition ${
              index === safeActiveIndex
                ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                : "border-[color:var(--color-brass)]/30 bg-white text-[color:var(--color-navy)] hover:border-[color:var(--color-navy)]"
            }`}
            onClick={() => setActiveIndex(index)}
          >
            {partner.name}
          </button>
        ))}
      </div>
    </section>
  );
}
