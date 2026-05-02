"use client";

import Link from "next/link";

type MarketItem = {
  key: string;
  title: string;
  teaser: string;
  heading: string;
  imageSrc: string;
  imageAlt: string;
  imageContain?: boolean;
  copy: string;
  copySecondary: string;
  ctaHref: string;
  ctaLabel: string;
};

const CITY_LINKS = [
  { label: "Aurich", href: "/immobilienmakler-aurich" },
  { label: "Emden", href: "/immobilienmakler-emden" },
  { label: "Norden", href: "/immobilienmakler-norden" },
  { label: "Leer", href: "/immobilienmakler-leer" },
  { label: "Wittmund", href: "/immobilienmakler-wittmund" },
  { label: "Friedeburg", href: "/immobilienmakler-friedeburg" },
] as const;

const ITEMS: readonly MarketItem[] = [
  {
    key: "markt-aurich",
    title: "Immobilienbewertung Aurich",
    teaser: "Marktwert realistisch einordnen lassen.",
    heading: "Immobilienbewertung Aurich",
    imageSrc: "/images/why/verkaufen.webp",
    imageAlt: "Immobilienbewertung Aurich mit regionaler Wohnimmobilie und Marktumfeld",
    copy: "Marktwert realistisch einordnen lassen.",
    copySecondary:
      "Während Immobilien in zentralen Lagen von Aurich häufig eine stabile Nachfrage verzeichnen, können Preise und Vermarktungszeiten in anderen Regionen deutlich variieren.",
    ctaHref: "/immobilienbewertung-aurich",
    ctaLabel: "Immobilienbewertung Aurich",
  },
  {
    key: "preise-aurich",
    title: "Immobilienpreise Aurich",
    teaser: "Durchschnittliche Kaufpreise und Preisentwicklung der letzten Jahre.",
    heading: "Immobilienpreise Aurich",
    imageSrc: "/images/why/marktgerechte_preisstrategie.webp",
    imageAlt: "Immobilienpreise Aurich mit fundierter Preisstrategie und Marktanalyse",
    copy: "Durchschnittliche Kaufpreise und Preisentwicklung der letzten Jahre.",
    copySecondary:
      "Auch Faktoren wie Baujahr, Zustand, Grundstücksgröße und energetischer Standard beeinflussen den tatsächlichen Marktwert erheblich.",
    ctaHref: "/immobilienpreise-aurich",
    ctaLabel: "Immobilienpreise Aurich",
  },
  {
    key: "preisunterschiede",
    title: "Regionale Preisunterschiede",
    teaser: "Preisunterschiede zwischen Städten, Gemeinden und ländlichen Lagen.",
    heading: "Regionale Preisunterschiede",
    imageSrc: "/images/regions/ostfriesland-karte.webp",
    imageAlt: "Regionale Preisunterschiede zwischen Aurich und Ostfriesland auf einer Übersichtskarte",
    imageContain: true,
    copy: "Preisunterschiede zwischen Städten, Gemeinden und ländlichen Lagen.",
    copySecondary:
      "Der Immobilienmarkt in Aurich und ganz Ostfriesland entwickelt sich je nach Lage deutlich unterschiedlich.",
    ctaHref: "/regionen-ostfriesland",
    ctaLabel: "Regionen Ostfriesland",
  },
  {
    key: "vergleichsdaten",
    title: "Immobilienpreise Ostfriesland",
    teaser: "Lokale Preisberichte für Aurich, Emden, Norden, Leer und Wittmund.",
    heading: "Immobilienpreise Ostfriesland",
    imageSrc: "/images/why/reichweite.webp",
    imageAlt: "Vergleichsdaten aus der Region mit digitaler Marktübersicht und Reichweite",
    copy: "Lokale Preisberichte für Aurich, Emden, Norden, Leer und Wittmund.",
    copySecondary:
      "Frisia Immobilien analysiert regelmäßig aktuelle Verkaufsdaten, Vergleichsobjekte und Preisentwicklungen im regionalen Immobilienmarkt sowie aktuelle Immobilienpreise in Aurich und Ostfriesland.",
    ctaHref: "/immobilienpreise",
    ctaLabel: "Immobilienpreise ansehen",
  },
] as const;

export default function RegionalMarktInteractive() {
  return (
    <div className="relative max-w-6xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-11rem] top-[-4.25rem] z-0 hidden h-[24rem] w-[38rem] max-w-none bg-[url('/images/regions/ostfriesland-karte.webp')] bg-contain bg-left-top bg-no-repeat opacity-[0.09] md:block"
      />

      <div className="relative z-10">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
          REGIONALER IMMOBILIENMARKT
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-[2.45rem]">
          Der Immobilienmarkt in Aurich & Ostfriesland
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(28rem,0.9fr)] lg:items-stretch">
          <div className="flex flex-col">
            <div className="max-w-[74ch] space-y-4 text-[1.02rem] leading-[1.78] text-[color:var(--color-graphite)]">
              <p>Der Immobilienmarkt in Aurich und ganz Ostfriesland entwickelt sich je nach Lage deutlich unterschiedlich.</p>
              <p>
                Während Immobilien in zentralen Lagen von Aurich häufig eine stabile Nachfrage verzeichnen, können
                Preise und Vermarktungszeiten in anderen Regionen deutlich variieren.
              </p>
              <p>
                Auch Faktoren wie Baujahr, Zustand, Grundstücksgröße und energetischer Standard beeinflussen den
                tatsächlichen Marktwert erheblich.
              </p>
              <p>
                Frisia Immobilien analysiert regelmäßig aktuelle Verkaufsdaten, Vergleichsobjekte und Preisentwicklungen
                im regionalen Immobilienmarkt sowie aktuelle Immobilienpreise in Aurich und Ostfriesland.
              </p>
              <p>Diese Daten bilden die Grundlage für eine realistische Immobilienbewertung und eine fundierte Verkaufsstrategie.</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-[0.82rem] font-medium text-[color:var(--color-graphite)]">
              {CITY_LINKS.map((city) => (
                <Link
                  key={city.label}
                  href={city.href}
                  className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1"
                >
                  {city.label}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <p className="mb-5 text-[0.98rem] leading-[1.6] text-[color:var(--color-graphite)]">
                Wie liegt deine Immobilie aktuell im Markt?
              </p>
              <a
                href="#immobilienbewertung"
                className="inline-flex items-center rounded-xl bg-[color:var(--color-navy)] px-5 py-2.5 text-[0.9rem] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Marktwert jetzt einordnen
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:h-full">
            {ITEMS.map((item, idx) => (
              <Link
                key={item.key}
                href={item.ctaHref}
                className={`flex min-h-[10rem] flex-col justify-between rounded-2xl border bg-[color:var(--color-navy)] p-5 text-white ${
                  idx === 0
                    ? "border-[color:var(--color-brass)] ring-2 ring-[color:var(--color-brass)]/35 shadow-sm"
                    : "border-white/10"
                }`}
              >
                <span>
                  <span className="block text-[1.02rem] font-semibold leading-[1.35]">{item.title}</span>
                  <span className="mt-2 block text-[0.92rem] leading-[1.58] text-white/78">{item.teaser}</span>
                </span>
                <span className="mt-4 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white/88">
                  {item.ctaLabel}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
