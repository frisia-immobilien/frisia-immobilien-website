"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getGermanPropertyTypeLabel } from "@/lib/property-labels";
import type { PropertyListItem } from "@/lib/propstack";

function formatCurrency(value: number | null, priceOnInquiry: boolean) {
  if (priceOnInquiry || value === null) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPropertyPrice(item: PropertyListItem) {
  const value = formatCurrency(item.price, item.priceOnInquiry);
  if (value === "Preis auf Anfrage" || item.pricePeriod !== "month") return value;
  return `${value} / Monat`;
}

function formatMetric(value: number | null, suffix: string) {
  if (value === null) return null;
  return `${new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value)} ${suffix}`;
}

function formatPublicLocation(zipCode: string | null, city: string) {
  return [zipCode, city].filter(Boolean).join(" ");
}

function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.35 6-11a6 6 0 1 0-12 0c0 5.65 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"}
      />
    </svg>
  );
}

type PropertyRecommendationRailProps = {
  items: PropertyListItem[];
};

export default function PropertyRecommendationRail({ items }: PropertyRecommendationRailProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const updatePages = () => {
      const firstCard = scroller.querySelector<HTMLElement>("[data-rail-card]");
      if (!firstCard) {
        setPageCount(1);
        setActivePage(0);
        return;
      }

      const cardWidth = firstCard.offsetWidth;
      const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap || window.getComputedStyle(scroller).gap || "0");
      const step = Math.max(cardWidth + gap, 1);
      const maxPage = Math.max(0, Math.ceil((scroller.scrollWidth - scroller.clientWidth) / step));
      const currentPage = Math.min(maxPage, Math.max(0, Math.round(scroller.scrollLeft / step)));

      setPageCount(maxPage + 1);
      setActivePage(currentPage);
    };

    updatePages();
    scroller.addEventListener("scroll", updatePages, { passive: true });
    window.addEventListener("resize", updatePages);

    return () => {
      scroller.removeEventListener("scroll", updatePages);
      window.removeEventListener("resize", updatePages);
    };
  }, [items]);

  const scrollToPage = (page: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const firstCard = scroller.querySelector<HTMLElement>("[data-rail-card]");
    if (!firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap || window.getComputedStyle(scroller).gap || "0");
    const step = firstCard.offsetWidth + gap;

    scroller.scrollTo({
      left: page * step,
      behavior: "smooth",
    });
  };

  const handleStep = (direction: "prev" | "next") => {
    const nextPage = direction === "prev" ? Math.max(0, activePage - 1) : Math.min(pageCount - 1, activePage + 1);
    scrollToPage(nextPage);
  };

  if (items.length === 0) return null;

  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[color:var(--color-section)] py-14 sm:py-16">
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="relative rounded-[2.25rem] border border-[color:var(--color-brass)]/18 bg-white px-5 py-8 shadow-[0_22px_70px_rgba(15,23,42,0.06)] sm:px-7 sm:py-10">
          <div className="flex flex-col gap-5 border-b border-[color:var(--color-brass)]/12 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                Weitere Immobilien
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.04] tracking-[-0.02em] text-[color:var(--color-navy)] sm:text-[2.65rem]">
                Weitere passende Objekte aus Aurich und Umgebung
              </h2>
            </div>

            <Link
              href="/immobilien-aurich"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[color:var(--color-navy)]/18 bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)] shadow-[0_12px_26px_rgba(15,23,42,0.06)] transition-colors hover:bg-[color:var(--color-section)]"
            >
              Alle anzeigen
            </Link>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-end gap-4">
              <p className="text-sm font-semibold text-[color:var(--color-navy)]">
                {String(activePage + 1).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}
              </p>
            </div>

            <div className="mt-6">
              <div className="overflow-hidden">
                <div className="overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        data-rail-card
                        className="group flex min-h-[29rem] w-[19.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-[2rem] border border-[color:var(--color-brass)]/18 bg-white shadow-[0_18px_54px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:w-[22rem]"
                      >
                        <Link href={`/immobilien-aurich/${item.slug}`} className="block">
                          <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--color-section)]/55">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                sizes="(max-width: 640px) 78vw, 22rem"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              />
                            ) : null}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(10,23,37,0.56)] to-transparent" />
                            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                              <span className="rounded-full bg-white/92 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-navy)] shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
                                {item.scope === "aurich" ? "Aurich" : "Umgebung"}
                              </span>
                              <span className="rounded-full bg-[color:var(--color-navy)]/92 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
                                {getGermanPropertyTypeLabel(item.rsCategory, item.rsType)}
                              </span>
                            </div>
                            <div className="absolute inset-x-4 bottom-4">
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/76">{item.priceLabel}</p>
                              <p className="mt-1 font-[family-name:var(--font-playfair)] text-[1.45rem] leading-none text-white">
                                {formatPropertyPrice(item)}
                              </p>
                            </div>
                          </div>
                        </Link>

                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                          <h3 className="min-h-[5.8rem] line-clamp-3 font-[family-name:var(--font-playfair)] text-[1.5rem] leading-[1.14] text-[color:var(--color-navy)]">
                            <Link href={`/immobilien-aurich/${item.slug}`}>{item.title}</Link>
                          </h3>

                          <p className="mt-3 inline-flex items-center gap-2 text-[0.95rem] text-[color:var(--color-graphite)]">
                            <PinIcon className="h-4 w-4 shrink-0 text-[color:var(--color-brackish)]" />
                            <span>{formatPublicLocation(item.zipCode, item.city)}</span>
                          </p>

                          <div className="mt-5 grid grid-cols-3 gap-3 rounded-[1.45rem] bg-[color:var(--color-section)]/88 p-4 text-sm text-[color:var(--color-graphite)]">
                            <div>
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-brackish)]">Wohnfl.</p>
                              <p className="mt-1 font-semibold text-[color:var(--color-navy)]">{formatMetric(item.livingSpace, "m²") ?? "k. A."}</p>
                            </div>
                            <div>
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-brackish)]">Grundst.</p>
                              <p className="mt-1 font-semibold text-[color:var(--color-navy)]">{formatMetric(item.plotArea, "m²") ?? "k. A."}</p>
                            </div>
                            <div>
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-brackish)]">Zimmer</p>
                              <p className="mt-1 font-semibold text-[color:var(--color-navy)]">
                                {item.numberOfRooms ? new Intl.NumberFormat("de-DE").format(item.numberOfRooms) : "k. A."}
                              </p>
                            </div>
                          </div>

                          <div className="mt-auto pt-6">
                            <Link
                              href={`/immobilien-aurich/${item.slug}`}
                              className="inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
                            >
                              Mehr erfahren
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-4 flex items-center justify-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => handleStep("prev")}
                disabled={activePage === 0}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-brass)]/22 bg-white text-[color:var(--color-navy)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-colors hover:bg-[color:var(--color-section)] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Vorherige Immobilien"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                onClick={() => handleStep("next")}
                disabled={activePage >= pageCount - 1}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-brass)]/22 bg-white text-[color:var(--color-navy)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-colors hover:bg-[color:var(--color-section)] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Nächste Immobilien"
              >
                <Chevron direction="right" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollToPage(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activePage ? "w-7 bg-[color:var(--color-navy)]" : "w-2.5 bg-[color:var(--color-brass)]/28 hover:bg-[color:var(--color-brass)]/50"}`}
                  aria-label={`Zu Seite ${index + 1}`}
                  aria-pressed={index === activePage}
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden lg:block">
            <button
              type="button"
              onClick={() => handleStep("prev")}
              disabled={activePage === 0}
              className="pointer-events-auto absolute left-0 top-1/2 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-brass)]/22 bg-white text-[color:var(--color-navy)] shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition-colors hover:bg-[color:var(--color-section)] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Vorherige Immobilien"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => handleStep("next")}
              disabled={activePage >= pageCount - 1}
              className="pointer-events-auto absolute right-0 top-1/2 inline-flex h-14 w-14 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-brass)]/22 bg-white text-[color:var(--color-navy)] shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition-colors hover:bg-[color:var(--color-section)] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Nächste Immobilien"
            >
              <Chevron direction="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
