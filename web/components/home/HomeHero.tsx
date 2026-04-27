import Image from "next/image";
import type { AnchorHTMLAttributes, ReactNode } from "react";

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
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#EEF2F4]"
      aria-label="Startbereich"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero/haus-verkaufen-aurich.webp"
          alt="Hausverkauf in Aurich mit regionaler Immobilienberatung"
          title="Haus verkaufen in Aurich"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 92vw, 1440px"
          quality={35}
          className="object-cover object-[62%_50%] md:object-[58%_50%]"
        />

        <div className="absolute inset-0 bg-white/2" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.58)_0%,rgba(255,255,255,0.22)_34%,rgba(255,255,255,0.03)_66%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/18 to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1380px] items-center px-6 pb-14 pt-18 sm:px-8 md:pb-18 md:pt-20">
          <div className="relative max-w-[720px]">
            <div
              aria-hidden="true"
              className="absolute -inset-x-6 -inset-y-7 rounded-[1.75rem] bg-[linear-gradient(90deg,rgba(255,255,255,0.76)_0%,rgba(255,255,255,0.58)_58%,rgba(255,255,255,0.12)_100%)] shadow-[0_26px_90px_-74px_rgba(27,48,64,0.75)] backdrop-blur-[1.5px] md:-inset-x-8 md:-inset-y-8"
            />
            <div className="relative">
            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Immobilienmakler
            </p>
            <h1 className="mt-4 max-w-[12ch] font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] tracking-normal text-[color:var(--color-navy)]">
              Immobilie verkaufen in Aurich & Ostfriesland
            </h1>
            <div className="mt-6 h-1.5 w-32 bg-[color:var(--color-brass)]" aria-hidden="true" />
            <p className="mt-6 max-w-[720px] text-[1.14rem] leading-[1.62] text-[color:var(--color-graphite)] md:text-[1.32rem]">
              Mit klarer Preisstrategie und
              <br />
              strukturierter Vorgehensweise.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="#immobilienbewertung"
                className="inline-flex min-h-13 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-3.5 text-[1rem] font-semibold text-white shadow-[0_18px_45px_-28px_rgba(27,48,64,0.9)] transition-colors hover:bg-[#24465B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                data-track="hero_primary_cta_click"
                data-track-label="immobilie_bewerten"
                data-track-location="hero"
              >
                Immobilie bewerten
              </Link>
              <Link
                href="/immobilie-verkaufen-aurich"
                className="inline-flex min-h-13 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/55 bg-white/72 px-7 py-3.5 text-[1rem] font-semibold text-[color:var(--color-navy)] shadow-[0_18px_55px_-42px_rgba(27,48,64,0.65)] backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                data-track="hero_secondary_cta_click"
                data-track-label="verkauf_planen"
                data-track-location="hero"
              >
                Verkauf planen
              </Link>
            </div>

            <p className="mt-3 max-w-[760px] text-[0.9rem] font-medium leading-[1.55] text-[color:var(--color-navy)]/78">
              Fundierte Bewertung · Geprüfte Käufer · Rechtssicherer Abschluss
              <br />
              DEKRA-zertifizierter Sachverständiger für Immobilienbewertung
            </p>
            </div>
          </div>

        </div>
      </div>

      <Link
        href="#immobilienbewertung"
        aria-label="Zur Immobilienbewertung scrollen"
        className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-[color:var(--color-navy)]/55 transition-colors hover:text-[color:var(--color-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] md:inline-flex"
      >
        <span className="flex h-[42px] w-[24px] items-start justify-center rounded-full border-[2px] border-current p-1">
          <span className="mt-0.5 h-[9px] w-[4px] rounded-full bg-current" />
        </span>
        <span
          aria-hidden="true"
          className="h-[8px] w-[8px] rotate-45 border-b-[2px] border-r-[2px] border-current"
        />
      </Link>
    </section>
  );
}
