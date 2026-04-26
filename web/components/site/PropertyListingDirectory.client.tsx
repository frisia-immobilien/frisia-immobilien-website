"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { getGermanPropertyTypeLabel } from "@/lib/property-labels";
import type { PropertyListItem } from "@/lib/propstack";

type PropertyListingDirectoryProps = {
  items: PropertyListItem[];
};

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

function formatNumber(value: number | null) {
  if (value === null) return "k. A.";
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);
}

function formatPublicLocation(zipCode: string | null, city: string) {
  return [zipCode, city].filter(Boolean).join(" ");
}

function resolveTypeLabel(item: PropertyListItem) {
  return getGermanPropertyTypeLabel(item.rsCategory, item.rsType);
}

function resolveMarketingLabel(item: PropertyListItem) {
  if (item.marketingType === "RENT") return "Miete";
  if (item.marketingType === "BUY") return "Kauf";
  return "Angebot";
}

function isNonEmptyString(value: string | null): value is string {
  return Boolean(value);
}

function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.35 6-11a6 6 0 1 0-12 0c0 5.65 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function getPriceLabel(item: PropertyListItem) {
  return item.priceLabel;
}

export default function PropertyListingDirectory({ items }: PropertyListingDirectoryProps) {
  const cityOptions = useMemo(
    () => [...new Set(items.map((item) => item.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de-DE")),
    [items],
  );
  const initialCity = "";
  const marketingOptions = useMemo(() => {
    const labels = [...new Set(items.map(resolveMarketingLabel).filter(isNonEmptyString))];
    const order = ["Kauf", "Miete"];
    return labels.sort((a, b) => {
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
      }
      return a.localeCompare(b, "de-DE");
    });
  }, [items]);
  const initialMarketing = "";
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedMarketing, setSelectedMarketing] = useState(initialMarketing);
  const [selectedType, setSelectedType] = useState<string>("");
  const deferredCity = useDeferredValue(selectedCity);
  const deferredMarketing = useDeferredValue(selectedMarketing);
  const deferredType = useDeferredValue(selectedType);

  const typeOptions = useMemo(() => {
    const source = items.filter((item) => {
      const matchesCity = !deferredCity || item.city === deferredCity;
      const matchesMarketing = !deferredMarketing || resolveMarketingLabel(item) === deferredMarketing;
      return matchesCity && matchesMarketing;
    });
    return [...new Set(source.map(resolveTypeLabel).filter(isNonEmptyString))].sort((a, b) => a.localeCompare(b, "de-DE"));
  }, [deferredCity, deferredMarketing, items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesCity = !deferredCity || item.city === deferredCity;
        const matchesMarketing = !deferredMarketing || resolveMarketingLabel(item) === deferredMarketing;
        const matchesType = !deferredType || resolveTypeLabel(item) === deferredType;
        return matchesCity && matchesMarketing && matchesType;
      }),
    [deferredCity, deferredMarketing, deferredType, items],
  );
  const featuredItem = filteredItems[0] ?? null;
  const remainingItems = featuredItem ? filteredItems.slice(1) : [];

  return (
    <div id="immobilien-filter" className="mt-10 scroll-mt-24">
      <div className="rounded-[2rem] border border-[color:var(--color-brass)]/20 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start">
          <div className="flex flex-col">
            <label htmlFor="city-filter" className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
              Ort
            </label>
            <div className="mt-2 relative">
              <input
                id="city-filter"
                list="city-filter-options"
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                placeholder={initialCity || "Ort wählen"}
                className="min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/70 focus:border-[color:var(--color-brackish)]"
              />
              <datalist id="city-filter-options">
                {cityOptions.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
              Kauf / Miete
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedMarketing("")}
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  !selectedMarketing
                    ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                    : "border-[color:var(--color-brass)]/24 bg-white text-[color:var(--color-navy)] hover:bg-[color:var(--color-section)]"
                }`}
              >
                Alle
              </button>
              {marketingOptions.map((marketing) => (
                <button
                  key={marketing}
                  type="button"
                  onClick={() => {
                    setSelectedMarketing(marketing);
                    setSelectedType("");
                  }}
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedMarketing === marketing
                      ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                      : "border-[color:var(--color-brass)]/24 bg-white text-[color:var(--color-navy)] hover:bg-[color:var(--color-section)]"
                  }`}
                >
                  {marketing}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
              Objektart
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedType("")}
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  !selectedType
                    ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                    : "border-[color:var(--color-brass)]/24 bg-white text-[color:var(--color-navy)] hover:bg-[color:var(--color-section)]"
                }`}
              >
                Alle
              </button>
              {typeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedType === type
                      ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                      : "border-[color:var(--color-brass)]/24 bg-white text-[color:var(--color-navy)] hover:bg-[color:var(--color-section)]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-transparent" aria-hidden="true">
              Aktion
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedCity(initialCity);
                setSelectedMarketing(initialMarketing);
                setSelectedType("");
              }}
              className="mt-2 inline-flex min-h-12 items-center justify-center rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-section)]"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="mt-10 space-y-8">
          {featuredItem ? (
            <article className="group overflow-hidden rounded-[2.4rem] border border-[color:var(--color-brass)]/25 bg-white shadow-[0_26px_90px_rgba(15,23,42,0.08)]">
              <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.82fr)]">
                <Link
                  href={`/immobilien-aurich/${featuredItem.slug}`}
                  className="relative block min-h-[19rem] overflow-hidden bg-[color:var(--color-section)]/55 sm:min-h-[27rem] lg:min-h-[36rem]"
                >
                  {featuredItem.imageUrl ? (
                    <Image
                      src={featuredItem.imageUrl}
                      alt={featuredItem.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(10,23,37,0.45)] via-transparent to-transparent" />
                  <div className="absolute left-5 top-5 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                    <span className="rounded-full bg-white/94 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-navy)] shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                      {featuredItem.scope === "aurich" ? "Aurich" : "Umgebung"}
                    </span>
                    <span className="rounded-full bg-[color:var(--color-navy)]/94 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                      {resolveTypeLabel(featuredItem)}
                    </span>
                  </div>
                  <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white sm:inset-x-6 sm:bottom-6">
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/16 px-4 py-2 text-[0.92rem] font-medium backdrop-blur-sm">
                      <PinIcon className="h-4 w-4 shrink-0" />
                      <span>{formatPublicLocation(featuredItem.zipCode, featuredItem.city)}</span>
                    </p>
                    <span className="rounded-full border border-white/22 bg-[color:var(--color-brackish)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)]">
                      Aktuell
                    </span>
                  </div>
                </Link>

                <div className="flex flex-col justify-between bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fa_100%)] p-6 sm:p-8 lg:p-10">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                      Aktuellster Eintrag
                    </p>
                    <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-[2.3rem] leading-[1.02] tracking-[-0.02em] text-[color:var(--color-navy)] sm:text-[2.8rem]">
                      <Link href={`/immobilien-aurich/${featuredItem.slug}`}>{featuredItem.title}</Link>
                    </h2>
                    <p className="mt-4 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                      {resolveMarketingLabel(featuredItem)} · {resolveTypeLabel(featuredItem)}
                    </p>
                    {featuredItem.excerpt ? (
                      <p className="mt-5 text-[1rem] leading-[1.8] text-[color:var(--color-graphite)]">
                        {featuredItem.excerpt}
                      </p>
                    ) : null}

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-[color:var(--color-brass)]/16 bg-white/92 p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-brackish)]">Wohnfläche</p>
                        <p className="mt-1 text-[1.05rem] font-semibold text-[color:var(--color-navy)]">
                          {formatMetric(featuredItem.livingSpace, "m²") ?? "k. A."}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-[color:var(--color-brass)]/16 bg-white/92 p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-brackish)]">Grundstück</p>
                        <p className="mt-1 text-[1.05rem] font-semibold text-[color:var(--color-navy)]">
                          {formatMetric(featuredItem.plotArea, "m²") ?? "k. A."}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-[color:var(--color-brass)]/16 bg-white/92 p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-brackish)]">Zimmer</p>
                        <p className="mt-1 text-[1.05rem] font-semibold text-[color:var(--color-navy)]">
                          {formatNumber(featuredItem.numberOfRooms)}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-[color:var(--color-brass)]/16 bg-white/92 p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-brackish)]">Baujahr</p>
                        <p className="mt-1 text-[1.05rem] font-semibold text-[color:var(--color-navy)]">
                          {featuredItem.constructionYear ? String(featuredItem.constructionYear) : "k. A."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-5 border-t border-[color:var(--color-brass)]/16 pt-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                        {getPriceLabel(featuredItem)}
                      </p>
                      <p className="mt-2 font-[family-name:var(--font-playfair)] text-[2rem] leading-none text-[color:var(--color-navy)]">
                        {formatPropertyPrice(featuredItem)}
                      </p>
                    </div>
                    <Link
                      href={`/immobilien-aurich/${featuredItem.slug}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
                    >
                      Mehr erfahren
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          {remainingItems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {remainingItems.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[2rem] border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(15,23,42,0.09)]"
                >
                  <Link href={`/immobilien-aurich/${item.slug}`} className="block">
                    <div className="relative aspect-[16/11] bg-[color:var(--color-section)]/55">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : null}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(10,23,37,0.52)] to-transparent" />
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/92 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-navy)] shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
                          {item.scope === "aurich" ? "Aurich" : "Umgebung"}
                        </span>
                        <span className="rounded-full bg-[color:var(--color-navy)]/92 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
                          {resolveTypeLabel(item)}
                        </span>
                      </div>
                      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-white">
                        <div>
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/74">
                            {getPriceLabel(item)}
                          </p>
                          <p className="mt-1 font-[family-name:var(--font-playfair)] text-[1.55rem] leading-none text-white">
                            {formatPropertyPrice(item)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-6">
                    <h2 className="min-h-[4.2rem] font-[family-name:var(--font-playfair)] text-[1.8rem] leading-[1.16] text-[color:var(--color-navy)]">
                      <Link href={`/immobilien-aurich/${item.slug}`}>{item.title}</Link>
                    </h2>
                    <p className="mt-3 inline-flex items-center gap-2 text-[0.96rem] text-[color:var(--color-graphite)]">
                      <PinIcon className="h-4 w-4 shrink-0 text-[color:var(--color-brackish)]" />
                      <span>{formatPublicLocation(item.zipCode, item.city)}</span>
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-3 rounded-[1.5rem] bg-[color:var(--color-section)]/55 p-4 text-sm text-[color:var(--color-graphite)]">
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
                        <p className="mt-1 font-semibold text-[color:var(--color-navy)]">{formatNumber(item.numberOfRooms)}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t border-[color:var(--color-brass)]/12 pt-5">
                      <Link
                        href={`/immobilien-aurich/${item.slug}`}
                        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
                      >
                        Mehr erfahren
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-10 rounded-[2rem] border border-[color:var(--color-brass)]/25 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-10">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] text-[color:var(--color-navy)]">
            Keine Treffer mit dieser Kombination
          </h2>
          <p className="mt-4 max-w-[65ch] text-[1rem] leading-[1.75] text-[color:var(--color-graphite)]">
            Für den gewählten Ort, die Vermarktungsart oder die Objektart liegen aktuell keine aktiven Immobilien vor.
            Du kannst die Filter zurücksetzen oder eine andere Kombination wählen.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setSelectedCity(initialCity);
                setSelectedMarketing(initialMarketing);
                setSelectedType("");
              }}
              className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
            >
              Filter zurücksetzen
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCity("");
                setSelectedMarketing("");
                setSelectedType("");
              }}
              className="inline-flex items-center justify-center rounded-xl border border-[color:var(--color-brass)]/40 px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-section)]"
            >
              Alle Orte anzeigen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
