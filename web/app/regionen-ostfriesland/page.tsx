import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import RegionHub from "@/components/seo/RegionHub";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import { buildPageMetadata } from "@/lib/metadata";
import { getRegionHubData } from "@/lib/seo/getRegionHubData";
import { buildRegionHubSchemas } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = buildPageMetadata({
  title: "Immobilienpreise und Immobilienmakler Ostfriesland",
  description:
    "Regionale Orientierung für Immobilienpreise, Immobilienbewertung und Immobilienverkauf in Ostfriesland: Aurich, Emden, Leer, Wittmund, Wilhelmshaven und Friesland.",
  path: "/regionen-ostfriesland",
  keywords: [
    "immobilienpreise ostfriesland",
    "immobilienmakler ostfriesland",
    "immobilienbewertung ostfriesland",
    "haus verkaufen ostfriesland",
    "immobilie verkaufen ostfriesland",
    "immobilienmarkt ostfriesland",
    "frisia immobilien ostfriesland",
  ],
});

export default async function RegionenOstfrieslandPage() {
  const data = await getRegionHubData();
  const schemaItems = data.locations
    .filter((location) => location.indexable)
    .slice(0, 100)
    .map((location) => ({
      name: location.location_label,
      url: `${SITE_URL}/immobilienpreise-${location.location_slug}`,
      locationType: location.location_type,
      landkreis: location.landkreis,
      lat: location.lat,
      lng: location.lng,
    }));
  const schemas = buildRegionHubSchemas(schemaItems);

  return (
    <main id="main-content" className="bg-white">
      {schemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
      <section
        className="relative isolate overflow-hidden bg-[#F4F2EC] md:hidden"
        aria-label="Regionen Ostfriesland"
      >
        <div className="relative h-[clamp(410px,calc(100svh-17rem),470px)] overflow-hidden">
          <Image
            src="/images/ostfriesland-regionen-hero.webp"
            alt="Ruhige Drohnenaufnahme einer typischen Wohnlage in Ostfriesland"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={45}
            className="object-cover object-[64%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.18)_38%,rgba(255,255,255,0)_74%)]" />

          <div className="relative z-10 px-[1.65rem] pt-9">
            <div className="relative isolate max-w-[20rem]">
              <div className="pointer-events-none absolute -inset-x-3 -inset-y-4 -z-10 bg-[linear-gradient(105deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0)_75%,rgba(255,255,255,0)_100%)] blur-[1px]" />
              <p className="max-w-[16rem] text-[0.66rem] font-semibold uppercase leading-[1.65] tracking-[0.22em] text-[color:var(--color-navy)]/78">
                Regionen Ostfriesland
              </p>
              <div className="mt-6 max-w-[11.5ch] font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,8.6vw,2.25rem)] leading-[0.98] tracking-normal text-[color:var(--color-navy)]">
                Immobilienpreise und Immobilienmakler in Ostfriesland
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-[1.65rem] pb-4 pt-5">
          <p className="max-w-[22rem] border-l-[5px] border-[color:var(--color-brass)] pl-5 text-[0.76rem] leading-[1.42] text-[color:var(--color-graphite)]">
            Von Aurich über Emden und Leer bis Wittmund: Hier findest du den passenden Einstieg für Marktpreise,
            Immobilienbewertung und Verkauf in deiner Region.
          </p>

          <div className="mt-5 grid grid-cols-[1.25fr_1fr] gap-2.5">
            <a
              href="#regionen"
              className="inline-flex min-h-[3.75rem] items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-4 py-3 text-center text-[1rem] font-semibold leading-tight text-white shadow-[0_18px_40px_-28px_rgba(27,48,64,0.78)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              Region auswählen
            </a>
            <Link
              href="/immobilienbewertung-aurich"
              className="inline-flex min-h-[3.75rem] items-center justify-center rounded-xl border border-[color:var(--color-brass)]/55 bg-white px-[0.55rem] py-2.5 text-center text-[clamp(0.8rem,3.55vw,0.93rem)] font-semibold leading-tight text-[color:var(--color-navy)] shadow-[0_16px_46px_-36px_rgba(27,48,64,0.55)] transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              Immobilie bewerten
            </Link>
          </div>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-1 text-[0.6rem] font-semibold leading-none text-[color:var(--color-navy)]">
            {["Marktdaten", "Orte & Ortsteile", "Bewertung & Verkauf"].map((item) => (
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
      </section>

      <section
        className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block"
        aria-label="Regionen Ostfriesland"
      >
        <Image
          src="/images/ostfriesland-regionen-hero.webp"
          alt="Ruhige Drohnenaufnahme einer typischen Wohnlage in Ostfriesland"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={45}
          className="z-0 object-cover object-[64%_center] md:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.74)_28%,rgba(255,255,255,0.32)_48%,rgba(255,255,255,0.04)_70%,rgba(255,255,255,0)_92%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-[1] h-36 bg-[linear-gradient(0deg,rgba(255,255,255,0.66)_0%,rgba(255,255,255,0)_100%)]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(86svh-4rem)] w-full max-w-[1440px] items-center px-5 py-16 sm:px-8 md:py-18 lg:min-h-[calc(88svh-4rem)] lg:px-12">
          <div className="w-full max-w-[820px]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Regionen Ostfriesland
            </p>
            <h1 className="mt-5 max-w-[58rem] font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,6.4vw,5.05rem)] leading-[1.02] text-[color:var(--color-navy)]">
              Immobilienpreise und Immobilienmakler in Ostfriesland
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-[43rem] text-[1.08rem] leading-[1.7] text-[color:var(--color-navy)] md:text-[1.3rem]">
              Von Aurich über Emden und Leer bis Wittmund: Hier findest du den passenden Einstieg für Marktpreise,
              Immobilienbewertung und Verkauf in deiner Region.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#regionen"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-28px_rgba(27,48,64,0.78)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Region auswählen
              </a>
              <Link
                href="/immobilienbewertung-aurich"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/86 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] shadow-[0_16px_46px_-36px_rgba(27,48,64,0.55)] backdrop-blur transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Immobilie bewerten
              </Link>
            </div>

            <ul className="mt-7 flex max-w-3xl flex-col gap-3 text-[0.96rem] font-semibold leading-[1.35] text-[color:var(--color-navy)] sm:flex-row sm:flex-wrap sm:gap-x-6">
              {["Regionale Marktdaten", "Orte und Ortsteile", "Bewertung, Preise und Verkauf"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-navy)] text-[0.72rem] leading-none"
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <AurichHeroLinks />
      <div id="regionen" className="scroll-mt-20 pt-[25px]">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-8 sm:px-6">
          <div className="border-l-4 border-[color:var(--color-brass)]/35 pl-5 md:pl-7">
            <h2 className="text-[1.45rem] font-semibold leading-tight text-[color:var(--color-navy)] md:text-[1.75rem]">
              Region auswählen und Marktpreise einsehen
            </h2>
            <p className="mt-3 max-w-[58rem] text-[1.05rem] leading-[1.7] text-[color:var(--color-graphite)] md:text-[1.18rem]">
              Für jede Region erhältst du aktuelle Immobilienpreise, Entwicklungen und eine fundierte Einordnung für
              deinen Verkauf.
            </p>
          </div>
        </div>
        <RegionHub data={data} />
      </div>
    </main>
  );
}
