import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { CORE_REGIONS, REGION_LANDING_EXAMPLES, SITE_URL } from "@/lib/regions";
import {
  createBreadcrumbListJsonLd,
  createFAQPageJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Immobilienmakler in der Region Ostfriesland",
  description:
    "Übersicht regionaler Landingpages für Immobilienmakler, Immobilienbewertung und Immobilienverkauf in Aurich, Emden, Leer, Wittmund, Norden und Ostfriesland.",
  path: "/regionen-ostfriesland",
  keywords: [
    "immobilienmakler ostfriesland",
    "immobilienmakler aurich",
    "immobilienbewertung ostfriesland",
    "haus verkaufen ostfriesland",
  ],
});

const hubFaq = [
  {
    question: "Warum gibt es regionale Landingpages?",
    answer:
      "Weil sich Nachfrage, Preisniveau und Vermarktungsdauer je nach Lage unterscheiden. Regionale Seiten helfen Eigentümern bei einer realistischen Einordnung.",
  },
  {
    question: "Für welche Orte ist Frisia Immobilien aktiv?",
    answer:
      "Frisia Immobilien begleitet Eigentümer in Aurich und ganz Ostfriesland, unter anderem in Emden, Leer, Wittmund und Norden.",
  },
];

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/regionen-ostfriesland", [
  { name: "Startseite", item: SITE_URL },
  { name: "Regionen Ostfriesland", item: `${SITE_URL}/regionen-ostfriesland` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/regionen-ostfriesland",
  name: "Immobilienmakler in der Region Ostfriesland",
  description:
    "Hub-Seite für regionale Immobilien-Landingpages von Frisia Immobilien in Aurich, Emden, Leer, Wittmund, Norden und Ostfriesland.",
  type: "CollectionPage",
});

const faqJsonLd = createFAQPageJsonLd("/regionen-ostfriesland", hubFaq);

export default function RegionenOstfrieslandPage() {
  return (
    <main className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />

      <section className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
          Regionen Ostfriesland
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-[1.14] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
          Regionale Immobilienseiten für Aurich und Ostfriesland
        </h1>
        <p className="mt-6 max-w-4xl text-lg leading-[1.65] text-[color:var(--color-graphite)]">
          Diese Hub-Seite bündelt regionale Immobilien-Landingpages für Eigentümer. So findest du schnell die passende
          Seite für Maklersuche, Immobilienbewertung, Immobilienverkauf und Preisorientierung im regionalen Markt.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {CORE_REGIONS.map((region) => (
            <span
              key={region}
              className="rounded-full border border-[color:var(--color-brass)]/35 bg-[color:var(--color-section)] px-4 py-1.5 text-sm text-[color:var(--color-navy)]"
            >
              {region}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
            Hub-Struktur für regionale Landingpages
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-[1.75] text-[color:var(--color-graphite)]">
            Diese Struktur ist auf skalierbare regionale Seiten ausgelegt. Beispiel-URLs zeigen das Muster für
            zukünftige Standort- und Intent-Seiten.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REGION_LANDING_EXAMPLES.map((slug) => (
              <article key={slug} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
                <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">/{slug}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-graphite)]">
                  Regionale Landingpage mit eigener H1-Struktur, FAQ und Local-Schema.
                </p>
                <Link
                  href={`/regionen-ostfriesland/${slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-[color:var(--color-navy)] underline underline-offset-4"
                >
                  Seite öffnen
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
          Häufige Fragen zur Regionen-Struktur
        </h2>
        <div className="mt-6 space-y-4">
          {hubFaq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
              <h3 className="text-xl font-semibold leading-[1.4] text-[color:var(--color-navy)]">{item.question}</h3>
              <p className="mt-2 text-base leading-[1.7] text-[color:var(--color-graphite)]">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
