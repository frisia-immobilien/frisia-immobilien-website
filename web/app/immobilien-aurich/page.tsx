import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import PropertyListingDirectory from "@/components/site/PropertyListingDirectory.client";
import AurichMarketTeaser from "@/components/sections/AurichMarketTeaser";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import { buildPageMetadata } from "@/lib/metadata";
import {
  PHONE_DISPLAY,
  PHONE_HREF,
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";
import { getImmobilienAurichListingResult } from "@/lib/propstack";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Immobilien in Aurich & Ostfriesland",
  description:
    "Immobilien in Aurich und Ostfriesland: aktuelle Angebote von Frisia Immobilien entdecken oder Suchauftrag anlegen.",
  path: "/immobilien-aurich",
  keywords: [
    "immobilien aurich",
    "haus kaufen aurich",
    "wohnung mieten aurich",
    "wohnung kaufen aurich",
    "immobilien ostfriesland",
    "immobilienmakler aurich",
  ],
});

export default async function ImmobilienAurichPage() {
  const listing = await getImmobilienAurichListingResult();
  const breadcrumbJsonLd = createBreadcrumbListJsonLd("/immobilien-aurich", [
    { name: "Startseite", item: "/" },
    { name: "Immobilien Aurich", item: "/immobilien-aurich" },
  ]);
  const webPageJsonLd = createWebPageJsonLd({
    path: "/immobilien-aurich",
    name: "Immobilien in Aurich & Ostfriesland",
    description:
      "Alle Immobilien, die aktuell von Frisia Immobilien vermarktet werden, mit direkter Kontaktmöglichkeit und Suchauftrag.",
    type: "CollectionPage",
  });
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${absoluteUrl("/immobilien-aurich")}#itemlist`,
    itemListElement: listing.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/immobilien-aurich/${item.slug}`),
      name: item.title,
    })),
  };

  return (
    <main className="bg-white">
      <Script id="immobilien-aurich-schema" type="application/ld+json">
        {JSON.stringify([breadcrumbJsonLd, webPageJsonLd, itemListJsonLd])}
      </Script>

      <MobileHeroSection
        eyebrow="Immobiliensuche"
        title={
          <>
            Immobilien in Aurich & Ostfriesland
          </>
        }
        description="Aktuelle Angebote von Frisia Immobilien und ein Suchauftrag, wenn gerade nichts Passendes dabei ist."
        imageSrc="/images/immobilien-aurich-hero-drohne.webp"
        imageAlt="Helle Drohnenaufnahme einer ruhigen Wohnlage in Aurich und Ostfriesland"
        imagePosition="64% center"
        imageQuality={45}
        primaryCta={{ href: "#immobilien-filter", label: "Immobilien entdecken" }}
        secondaryCta={{ href: "/suchauftrag", label: "Suchauftrag anlegen" }}
        trustItems={["Aktuelle Angebote", "Regional", "Direkt anfragbar"]}
      />

      <section
        className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block"
        aria-label="Immobilien in Aurich und Ostfriesland"
      >
        <Image
          src="/images/immobilien-aurich-hero-drohne.webp"
          alt="Helle Drohnenaufnahme einer ruhigen Wohnlage in Aurich und Ostfriesland"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={45}
          className="z-0 object-cover object-[64%_center] md:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.86)_35%,rgba(255,255,255,0.5)_60%,rgba(255,255,255,0.08)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-[1] h-36 bg-[linear-gradient(0deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0)_100%)]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(86svh-4rem)] w-full max-w-[1440px] items-center px-5 py-16 sm:px-8 md:py-18 lg:min-h-[calc(88svh-4rem)] lg:px-12">
          <div className="w-full max-w-[820px]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Immobiliensuche
            </p>
            <h1 className="mt-5 max-w-[58rem] font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,6.4vw,5.05rem)] leading-[1.02] text-[color:var(--color-navy)]">
              Immobilien in
              <span className="block">Aurich & Ostfriesland</span>
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-[43rem] text-[1.08rem] leading-[1.7] text-[color:var(--color-navy)] md:text-[1.3rem]">
              Aktuelle Angebote von Frisia Immobilien und ein Suchauftrag, wenn gerade nichts Passendes dabei ist.
              Ruhig vorsortiert, regional eingeordnet und direkt anfragbar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#immobilien-filter"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-28px_rgba(27,48,64,0.78)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Immobilien entdecken
              </a>
              <Link
                href="/suchauftrag"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/86 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] shadow-[0_16px_46px_-36px_rgba(27,48,64,0.55)] backdrop-blur transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Suchauftrag anlegen
              </Link>
            </div>

          </div>
        </div>
      </section>

      <section className="bg-white px-4 pb-16 pt-[25px] sm:px-6 lg:pb-20">
        <div className="mx-auto max-w-6xl">
        {listing.items.length > 0 ? (
          <PropertyListingDirectory items={listing.items} />
        ) : (
          <div className="mt-10 rounded-[2rem] border border-[color:var(--color-brass)]/25 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-10">
            <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] text-[color:var(--color-navy)]">
              Aktuell keine Immobilien in der öffentlichen Vermarktung
            </h2>
            <p className="mt-4 max-w-[65ch] text-[1rem] leading-[1.75] text-[color:var(--color-graphite)]">
              Lege dein Suchprofil an – wir melden uns, sobald eine passende Immobilie für dich verfügbar ist.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/suchauftrag"
                className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
              >
                Suchauftrag anlegen
              </Link>
              <a
                href={PHONE_HREF}
                className="inline-flex items-center justify-center rounded-xl border border-[color:var(--color-brass)]/40 px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-section)]"
              >
                Anrufen: {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        )}
        </div>
      </section>

      <AurichMarketTeaser />
    </main>
  );
}
