"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type DifferentiationItem = {
  key: string;
  title: string;
  teaser: string;
  heading: string;
  imageSrc: string;
  imageAlt: string;
  copy: string;
  copySecondary?: string;
  bullets: readonly string[];
  closing?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

const ITEMS: readonly DifferentiationItem[] = [
  {
    key: "werte",
    title: "Das Frisia Prinzip",
    imageSrc: "/images/why/frisia_alte-werte.png",
    imageAlt: "Das Frisia Prinzip mit klassischen Werten und persönlicher Verantwortung",
    teaser: "Klassische Werte, klare Abläufe und persönliche Verantwortung.",
    heading: "Das Frisia Prinzip",
    copy: "Neben moderner Technik zählen für uns ebenfalls klassische Werte.",
    copySecondary:
      "Ein Immobilienverkauf ist Vertrauenssache. Deshalb arbeiten wir mit klaren Abläufen, verlässlicher Kommunikation und persönlicher Verantwortung.",
    bullets: [
      "Pünktlichkeit und Verlässlichkeit im gesamten Verkaufsprozess",
      "Klare Absprachen und transparente Entscheidungen",
      "Persönliche Begleitung statt anonymem Maklerprozess",
      "Verantwortung gegenüber Eigentümern und Käufern",
    ],
    closing: "Bei Frisia Immobilien zählt noch das Wort – genauso wie der Handschlag.",
  },
  {
    key: "reichweite",
    title: "Reichweite",
    imageSrc: "/images/why/reichweite.png",
    imageAlt: "Reichweite über Immobilienportale und regionale Netzwerke",
    teaser: "Sichtbarkeit über führende Portale und regionale Kanäle.",
    heading: "Reichweite",
    copy: "Damit eine Immobilie den passenden Käufer findet, ist Reichweite entscheidend. Frisia Immobilien nutzt – neben eigenen Suchkunden-Datenbanken – die führenden Immobilienportale und digitale Vermarktungskanäle in Deutschland.",
    copySecondary:
      "Immobilien werden gezielt auf den größten Plattformen präsentiert und erreichen so eine hohe Zahl qualifizierter Interessenten.",
    bullets: [
      "Präsentation auf ImmobilienScout24",
      "Vermarktung über Kleinanzeigen und weitere Portale",
      "Gezielte Ansprache regionaler Käufer",
      "Strukturierte Interessentenqualifikation",
    ],
    closing: "So erreicht jede Immobilie die Käufer, für die sie wirklich passt.",
  },
  {
    key: "technik",
    title: "Vermarktung",
    imageSrc: "/images/why/vermarktung.png",
    imageAlt: "Vermarktung einer Immobilie mit moderner Technik",
    teaser: "Moderne Technologie und professionelle Aufbereitung für starke Marktpräsenz.",
    heading: "Vermarktung",
    copy: "Für eine erfolgreiche Vermarktung nutzen wir moderne Technologien und professionelle Aufbereitung der Immobilie.",
    copySecondary:
      "Digitale Systeme unterstützen die strukturierte Vermarktung und sorgen für transparente Abläufe für Eigentümer und Interessenten.",
    bullets: [
      "Drohnenaufnahmen und professionelle Immobilienfotografie",
      "LiDAR-gestütztes Grundriss-Aufmaß und digitale Exposés",
      "Automatisierte Vermarktungsprozesse über Propstack",
      "KI-unterstützte Kommunikation und Terminorganisation",
      "Erreichbarkeit auch außerhalb der Bürozeiten",
    ],
    ctaHref: "#immobilienbewertung",
    ctaLabel: "Mehr über unsere Vermarktung",
  },
  {
    key: "verkaufen",
    title: "Verkaufen",
    imageSrc: "/images/why/verkaufen.png",
    imageAlt: "Immobilie verkaufen mit Frisia Immobilien in Aurich und Ostfriesland",
    teaser: "Fundierte Bewertung und klare Strategie für einen geordneten Verkaufsprozess.",
    heading: "Verkaufen",
    copy: "Der Verkauf einer Immobilie beginnt mit einer fundierten Bewertung und einer klaren Strategie. Frisia Immobilien begleitet Eigentümer strukturiert durch den gesamten Verkaufsprozess – von der Marktanalyse bis zum Notartermin.",
    copySecondary:
      "Als Immobilienmakler und Sachverständigenbüro verbinden wir Bewertung, Preisstrategie und Vermarktung zu einem geordneten Ablauf.",
    bullets: [
      "Fundierte Immobilienbewertung als Grundlage für den Verkauf",
      "Klare Preisstrategie auf Basis regionaler Marktdaten",
      "Strukturierte Besichtigungen und qualifizierte Käuferauswahl",
      "Verhandlung und Begleitung bis zum Notartermin",
    ],
    ctaHref: "#immobilienbewertung",
    ctaLabel: "Bewertung anfragen",
  },
  {
    key: "kaufen",
    title: "Kaufen",
    imageSrc: "/images/why/kaufen.png",
    imageAlt: "Immobilie kaufen mit Frisia Immobilien in Aurich und Ostfriesland",
    teaser: "Strukturierte Begleitung bei Suche, Auswahl und Kaufentscheidung.",
    heading: "Kaufen",
    copy: "Der Kauf einer Immobilie ist eine der wichtigsten Entscheidungen im Leben. Frisia Immobilien begleitet Käufer bei der Suche, Bewertung und Entscheidung für die passende Immobilie im regionalen Markt. Vom ersten Telefonat bis zur Übergabe.",
    copySecondary:
      "Durch unsere Marktkenntnis in Aurich und ganz Ostfriesland erkennen Käufer frühzeitig realistische Preise und nachhaltige Werte.",
    bullets: [
      "Zugang zu geprüften Immobilienangeboten",
      "Einschätzung von Marktpreis und Lagequalität",
      "Begleitung bei Besichtigung und Entscheidungsfindung",
      "Unterstützung bis zum erfolgreichen Kaufabschluss",
    ],
    ctaHref: "/immobilien-aurich",
    ctaLabel: "Immobilien entdecken",
  },
];

export default function WhyFrisiaInteractive() {
  const [activeIndex, setActiveIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollLockRef = useRef<number | null>(null);
  const active = ITEMS[activeIndex];
  const isMobileAtStart = activeIndex === 0;
  const isMobileAtEnd = activeIndex === ITEMS.length - 1;

  const scrollMobileToIndex = (index: number) => {
    const container = mobileCarouselRef.current;
    if (!container) return;
    const target = container.children[index] as HTMLElement | undefined;
    if (!target) return;

    if (mobileScrollLockRef.current !== null) {
      window.clearTimeout(mobileScrollLockRef.current);
    }
    mobileScrollLockRef.current = window.setTimeout(() => {
      mobileScrollLockRef.current = null;
    }, 420);

    container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  const onPrev = () => setActiveIndex((i) => (i - 1 + ITEMS.length) % ITEMS.length);
  const onNext = () => setActiveIndex((i) => (i + 1) % ITEMS.length);
  const onMobilePrev = () => {
    if (isMobileAtStart) return;
    const nextIndex = activeIndex - 1;
    setActiveIndex(nextIndex);
    scrollMobileToIndex(nextIndex);
  };
  const onMobileNext = () => {
    if (isMobileAtEnd) return;
    const nextIndex = activeIndex + 1;
    setActiveIndex(nextIndex);
    scrollMobileToIndex(nextIndex);
  };
  const goTo = (index: number) => setActiveIndex(index);
  const goToMobile = (index: number) => {
    setActiveIndex(index);
    scrollMobileToIndex(index);
  };

  const onCardsScroll = () => {
    if (mobileScrollLockRef.current !== null) return;

    const container = mobileCarouselRef.current;
    if (!container) return;

    const slideWidth = container.clientWidth;
    if (!slideWidth) return;

    const nextIndex = Math.max(0, Math.min(ITEMS.length - 1, Math.round(container.scrollLeft / slideWidth)));

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <div className="max-w-6xl">
      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
        IMMOBILIENMAKLER OSTFRIESLAND
      </p>
      <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-[2.45rem]">
        Warum Frisia Immobilien?
      </h2>
      <p className="mt-6 max-w-[74ch] text-[1.02rem] leading-[1.78] text-[color:var(--color-graphite)]">
        Immobilienverkauf und Immobilienkauf im regionalen Markt von Aurich und ganz Ostfriesland – mit Erfahrung,
        moderner Technik und klaren Prinzipien.
      </p>

      <div className="mt-8 hidden gap-3 md:grid md:grid-cols-5" role="tablist" aria-label="Differenzierung desktop">
        {ITEMS.map((item, idx) => {
          const selected = idx === activeIndex;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => goTo(idx)}
              className={`relative rounded-2xl border px-4 py-4 text-left transition ${
                selected
                  ? "border-[color:var(--color-navy)] bg-white ring-2 ring-[color:var(--color-navy)]/15 shadow-sm"
                  : "border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <h3 className="text-[1rem] font-semibold leading-[1.4] text-[color:var(--color-navy)]">{item.title}</h3>
              <p className="mt-2 text-[0.92rem] leading-[1.58] text-[color:var(--color-graphite)]">{item.teaser}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5 md:hidden">
        {ITEMS.map((item, idx) => {
          const selected = idx === activeIndex;
          const mobileLabel = item.title === "Das Frisia Prinzip" ? "Frisia Prinzip" : item.title;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => goToMobile(idx)}
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.08em] transition ${
                selected
                  ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                  : "border-[color:var(--color-brass)]/25 bg-white text-[color:var(--color-brackish)]"
              }`}
            >
              {mobileLabel}
            </button>
          );
        })}
      </div>

      <div className="relative mt-8 rounded-3xl border border-[color:var(--color-brass)]/25 bg-white p-5 md:p-7">
        <div className="relative md:hidden">
          <div className="pointer-events-none absolute inset-x-1 top-1 z-20 aspect-square">
            {isMobileAtStart ? null : (
              <button
                type="button"
                onClick={onMobilePrev}
                aria-label="Vorheriges Feld"
                className="pointer-events-auto absolute left-0 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-start pl-3 text-[1.9rem] font-light text-white/92 [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
              >
                <span aria-hidden="true">‹</span>
              </button>
            )}
            {isMobileAtEnd ? null : (
              <button
                type="button"
                onClick={onMobileNext}
                aria-label="Nächstes Feld"
                className="pointer-events-auto absolute right-0 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-end pr-3 text-[1.9rem] font-light text-white/92 [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
              >
                <span aria-hidden="true">›</span>
              </button>
            )}
          </div>

          <div
            ref={mobileCarouselRef}
            onScroll={onCardsScroll}
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Warum Frisia - Carousel mobil"
          >
            {ITEMS.map((item) => (
              <article
                key={item.key}
                className="w-full shrink-0 snap-start"
              >
                <div className="p-1">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[color:var(--color-section)]/45">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 0vw"
                      quality={70}
                      className="object-cover"
                    />
                  </div>

                  <h3 className="mt-4 text-[1.42rem] font-semibold leading-[1.35] text-[color:var(--color-navy)]">
                    {item.heading}
                  </h3>
                  <p className="mt-4 text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">{item.copy}</p>
                  {item.copySecondary ? (
                    <p className="mt-3 text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">{item.copySecondary}</p>
                  ) : null}
                  <ul className="mt-5 space-y-3 text-[0.96rem] leading-[1.62] text-[color:var(--color-graphite)]">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <Image
                          src="/images/prozess/checkbox.webp"
                          alt=""
                          aria-hidden="true"
                          width={26}
                          height={26}
                          className="mt-0.5 h-6 w-6 shrink-0 object-contain"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {item.closing ? (
                    <p className="mt-5 text-[0.98rem] font-medium leading-[1.66] text-[color:var(--color-navy)]">{item.closing}</p>
                  ) : null}
                  {item.ctaHref && item.ctaLabel ? (
                    <div className="mt-7">
                      <Link
                        href={item.ctaHref}
                        className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white"
                      >
                        {item.ctaLabel}
                      </Link>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 md:hidden" aria-label="Navigation Kacheln">
          {ITEMS.map((item, idx) => (
            <button
              key={item.key}
              type="button"
              onClick={() => goToMobile(idx)}
              aria-label={`${item.title} anzeigen`}
              aria-current={idx === activeIndex ? "true" : undefined}
              className="flex h-12 w-12 items-center justify-center rounded-full"
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  idx === activeIndex ? "bg-[color:var(--color-navy)]" : "bg-[color:var(--color-brass)]/35"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onPrev}
          aria-label="Vorheriges Feld"
          className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-brass)]/30 bg-white text-[color:var(--color-navy)] shadow-sm md:flex"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Nächstes Feld"
          className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-brass)]/30 bg-white text-[color:var(--color-navy)] shadow-sm md:flex"
        >
          ›
        </button>

        <div className="hidden gap-7 md:grid md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[color:var(--color-section)]/45">
              <Image
                src={active.imageSrc}
                alt={active.imageAlt}
                width={900}
                height={1200}
                sizes="(max-width: 768px) 100vw, 40vw"
                quality={70}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-7">
            <h3 className="text-[1.42rem] font-semibold leading-[1.35] text-[color:var(--color-navy)] md:text-[1.58rem]">
              {active.heading}
            </h3>
            <p className="mt-4 text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">{active.copy}</p>
            {active.copySecondary ? (
              <p className="mt-3 text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">{active.copySecondary}</p>
            ) : null}
            <ul className="mt-5 space-y-3 text-[0.96rem] leading-[1.62] text-[color:var(--color-graphite)]">
              {active.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <Image
                    src="/images/prozess/checkbox.webp"
                    alt=""
                    aria-hidden="true"
                    width={26}
                    height={26}
                    className="mt-0.5 h-6 w-6 shrink-0 object-contain"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            {active.closing ? (
              <p className="mt-5 text-[0.98rem] font-medium leading-[1.66] text-[color:var(--color-navy)]">{active.closing}</p>
            ) : null}
            {active.ctaHref && active.ctaLabel ? (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={active.ctaHref}
                  className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white"
                >
                  {active.ctaLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
