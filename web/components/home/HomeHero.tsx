import Image from "next/image";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { preload } from "react-dom";
import HeroDivider from "@/components/site/HeroDivider";

function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export default function HomeHero() {
  const trustItems = ["Kostenfrei starten", "DEKRA-zertifizierte Bewertungskompetenz", "Persönlich aus Aurich"];
  const mobileTrustItems = ["Kostenfrei", "DEKRA-zertifiziert", "Persönlich aus Aurich"];

  preload("/images/hero/home-hero-kapitaenshaus-mobile-lcp.avif", {
    as: "image",
    fetchPriority: "high",
    media: "(max-width: 767px)",
    type: "image/avif",
  });

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-[#F4F2EC]"
      aria-label="Startbereich"
    >
      <div className="md:hidden">
        <div className="relative h-[clamp(410px,calc(100svh-17rem),470px)] overflow-hidden">
          <picture className="absolute inset-0">
            <source media="(max-width: 767px)" type="image/avif" srcSet="/images/hero/home-hero-kapitaenshaus-mobile-lcp.avif" />
            <source media="(max-width: 767px)" type="image/webp" srcSet="/images/hero/home-hero-kapitaenshaus-mobile-lcp.webp" />
            <img
              src="/images/hero/home-hero-kapitaenshaus-mobile-lcp.webp"
              alt="Hausverkauf in Aurich mit regionaler Immobilienberatung"
              title="Haus verkaufen in Aurich"
              width={900}
              height={1200}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              className="h-full w-full object-cover object-center"
            />
          </picture>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.18)_38%,rgba(255,255,255,0)_74%)]" />

          <div className="relative z-10 px-[1.65rem] pt-9">
            <div className="relative isolate max-w-[19rem]">
              <div className="pointer-events-none absolute -inset-x-3 -inset-y-4 -z-10 bg-[linear-gradient(105deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0)_75%,rgba(255,255,255,0)_100%)] blur-[1px]" />
              <p className="max-w-[16rem] text-[0.66rem] font-semibold uppercase leading-[1.65] tracking-[0.22em] text-[color:var(--color-navy)]/78">
                Immobilienmakler in Aurich & Ostfriesland
              </p>
              <div className="mt-6 max-w-[12ch] font-[family-name:var(--font-playfair)] text-[clamp(1.55rem,7.55vw,1.95rem)] leading-[0.98] tracking-normal text-[color:var(--color-navy)]">
                Immobilie
                <br />
                verkaufen
                <br />
                in Aurich &
                <br />
                Ostfriesland.
                <br />
                Mit klarem
                <br />
                Preis. Ohne
                <br />
                Unsicherheit.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-[1.65rem] pb-4 pt-5">
          <p className="max-w-[22rem] border-l-[5px] border-[color:var(--color-brass)] pl-5 text-[0.76rem] leading-[1.42] text-[color:var(--color-graphite)]">
            Frisia Immobilien bewertet deine Immobilie fundiert, ordnet den Markt realistisch ein und führt den Verkauf ruhig, klar und verbindlich bis zum Abschluss.
          </p>

          <div className="mt-5 grid grid-cols-[1.25fr_1fr] gap-2.5">
            <Link
              href="#immobilienbewertung"
              className="inline-flex min-h-[3.75rem] items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-4 py-3 text-center text-[1rem] font-semibold leading-tight text-white shadow-[0_18px_40px_-28px_rgba(27,48,64,0.78)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              data-track="hero_primary_cta_click"
              data-track-label="immobilie_bewerten"
              data-track-location="hero"
            >
              Kostenfreie Bewertung starten
            </Link>
            <Link
              href="tel:049419867700"
              className="inline-flex min-h-[3.75rem] flex-col items-center justify-center whitespace-nowrap rounded-xl border border-[color:var(--color-brass)]/55 bg-white px-[0.55rem] py-2.5 text-center font-semibold leading-tight text-[color:var(--color-navy)] shadow-[0_16px_46px_-36px_rgba(27,48,64,0.55)] transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              data-track="hero_secondary_cta_click"
              data-track-label="telefon"
              data-track-location="hero"
            >
              <span className="text-[clamp(0.65rem,2.84vw,0.78rem)]">Einfach kurz sprechen</span>
              <span className="mt-1 text-[clamp(0.8rem,3.55vw,0.93rem)]">04941 986770-0</span>
            </Link>
          </div>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-1 text-[0.6rem] font-semibold leading-none text-[color:var(--color-navy)]">
            {mobileTrustItems.map((item) => (
              <li key={item} className="flex items-center gap-1 whitespace-nowrap">
                <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border border-[color:var(--color-navy)]/70 text-[color:var(--color-navy)]">
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-2 w-2" fill="none">
                    <path d="m4 8 2.4 2.4L12 5.4" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hidden absolute inset-0 md:block" aria-hidden="true">
        <Image
          src="/images/hero/home-hero-kapitaenshaus-desktop.webp"
          alt="Hausverkauf in Aurich mit regionaler Immobilienberatung"
          title="Haus verkaufen in Aurich"
          fill
          sizes="(max-width: 767px) 1px, 100vw"
          quality={80}
          className="hidden object-cover object-[62%_50%] md:block md:object-center"
        />
        <div className="hidden absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.78)_34%,rgba(255,255,255,0.32)_62%,rgba(255,255,255,0)_86%)] md:block" />
        <div className="hidden absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0)_100%)] md:block" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto hidden min-h-[calc(100svh-4rem)] w-full max-w-[1500px] items-center px-8 py-20 md:flex">
          <div className="max-w-[880px]">
            <p className="text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Immobilienmakler in Aurich & Ostfriesland
            </p>
            <h1 className="mt-8 max-w-[12.8ch] font-[family-name:var(--font-playfair)] text-[clamp(2.7rem,5.8vw,5.9rem)] leading-[0.98] tracking-normal text-[color:var(--color-navy)]">
              Haus verkaufen in Aurich & Ostfriesland.
              <br />
              Mit klarem Preis. Ohne Unsicherheit.
            </h1>
            <HeroDivider className="mt-7 w-40" />
            <p className="mt-7 max-w-[560px] text-[1.28rem] leading-[1.72] text-[color:var(--color-graphite)]">
              Frisia Immobilien bewertet deine Immobilie fundiert, ordnet den Markt realistisch ein und führt den Verkauf ruhig, klar und verbindlich bis zum Abschluss.
            </p>

            <div className="mt-8 flex flex-row flex-wrap items-center gap-2.5">
              <Link
                href="#immobilienbewertung"
                className="inline-flex min-h-13 items-center justify-center rounded-lg bg-[color:var(--color-navy)] px-7 py-3.5 text-[1rem] font-semibold text-white shadow-[0_18px_45px_-28px_rgba(27,48,64,0.9)] transition-colors hover:bg-[#24465B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                data-track="hero_primary_cta_click"
                data-track-label="immobilie_bewerten"
                data-track-location="hero"
              >
                Kostenfreie Bewertung starten
              </Link>
              <Link
                href="tel:049419867700"
                className="inline-flex min-h-14 flex-col items-center justify-center rounded-lg border border-[color:var(--color-brass)]/55 bg-white/78 px-7 py-3 text-center font-semibold leading-tight text-[color:var(--color-navy)] shadow-[0_18px_55px_-42px_rgba(27,48,64,0.65)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                data-track="hero_secondary_cta_click"
                data-track-label="telefon"
                data-track-location="hero"
              >
                <span className="text-[0.9rem]">Einfach kurz sprechen</span>
                <span className="mt-1 text-[1rem]">04941 986770-0</span>
              </Link>
            </div>

            <ul className="mt-7 flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold leading-6 text-[color:var(--color-navy)]">
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[color:var(--color-navy)] text-[color:var(--color-navy)]">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none">
                      <path d="m4 8 2.4 2.4L12 5.4" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <Link
        href="#immobilienbewertung"
        aria-label="Zur Immobilienbewertung scrollen"
        className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-[color:var(--color-navy)]/55 transition-colors hover:text-[color:var(--color-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] md:inline-flex"
      >
        <span className="flex h-[30px] w-[18px] items-start justify-center rounded-full border-[1.5px] border-current p-[3px]">
          <span className="mt-[1px] h-[7px] w-[3px] rounded-full bg-current" />
        </span>
        <span
          aria-hidden="true"
          className="h-[6px] w-[6px] rotate-45 border-b-[1.5px] border-r-[1.5px] border-current"
        />
      </Link>
    </section>
  );
}
