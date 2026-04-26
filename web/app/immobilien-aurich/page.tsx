import Link from "next/link";
import Script from "next/script";
import PropertyListingDirectory from "@/components/site/PropertyListingDirectory.client";
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
    <main className="bg-[color:var(--color-section)]">
      <Script id="immobilien-aurich-schema" type="application/ld+json">
        {JSON.stringify([breadcrumbJsonLd, webPageJsonLd, itemListJsonLd])}
      </Script>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-8 rounded-[2.4rem] border border-[color:var(--color-brass)]/20 bg-white px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:px-10 lg:py-11">
          <div>
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
              Immobiliensuche
            </p>
            <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-playfair)] text-[2.35rem] leading-[1.08] tracking-[-0.02em] text-[color:var(--color-navy)] sm:text-[3.25rem]">
              Immobilien in Aurich & Ostfriesland
            </h1>
            <p className="mt-6 max-w-[64ch] text-[1.05rem] leading-[1.85] text-[color:var(--color-graphite)]">
              Hier findest du alle Immobilien, die aktuell von Frisia Immobilien vermarktet werden.
              Alle Angebote sind auf dem neuesten Stand und werden laufend aktualisiert.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-[color:var(--color-brass)]/18 bg-[color:var(--color-section)]/50 p-5">
            <div className="flex flex-col gap-3">
              <a
                href="#immobilien-filter"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[color:var(--color-navy)]/20 bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-section)]"
              >
                Immobilien entdecken
              </a>
              <div className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                <span className="h-px flex-1 bg-[color:var(--color-brass)]/22" />
                oder
                <span className="h-px flex-1 bg-[color:var(--color-brass)]/22" />
              </div>
              <Link
                href="/suchauftrag"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
              >
                Suchauftrag anlegen
              </Link>
            </div>
            <p className="mt-4 text-sm leading-[1.7] text-[color:var(--color-graphite)]">
              Neue Immobilien automatisch erhalten - passend zu deiner Suche.
            </p>
          </div>
        </div>

        {listing.items.length > 0 ? (
          <PropertyListingDirectory items={listing.items} />
        ) : (
          <div className="mt-10 rounded-[2rem] border border-[color:var(--color-brass)]/25 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-10">
            <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] text-[color:var(--color-navy)]">
              Aktuell keine Immobilien in Vermarktung
            </h2>
            <p className="mt-4 max-w-[65ch] text-[1rem] leading-[1.75] text-[color:var(--color-graphite)]">
              In Propstack liegen derzeit keine Immobilien mit dem Status Vermarktung vor. Wenn du ein konkretes
              Suchprofil hast, melden wir passende Immobilien direkt.
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
      </section>
    </main>
  );
}
