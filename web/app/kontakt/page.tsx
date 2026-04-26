import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import KontaktForm from "@/components/contact/KontaktForm.client";
import { buildPageMetadata } from "@/lib/metadata";
import {
  PHONE_E164,
  SITE_URL,
  createBreadcrumbListJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Kontakt Immobilienmakler Aurich",
  description:
    "Kontakt zu Frisia Immobilien in Aurich: telefonisch anrufen, Termin vereinbaren und die strukturierte Immobilienbewertung starten.",
  keywords: ["kontakt immobilienmakler aurich", "immobilienbewertung aurich", "immobilie verkaufen aurich"],
  path: "/kontakt",
  openGraphType: "website",
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/kontakt", [
  { name: "Startseite", item: SITE_URL },
  { name: "Kontakt", item: `${SITE_URL}/kontakt` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/kontakt",
  name: "Kontakt Immobilienmakler Aurich",
  description:
    "Kontaktseite von Frisia Immobilien in Aurich für Eigentümer, die eine Bewertung, Beratung oder Verkaufsbegleitung anfragen möchten.",
  type: "ContactPage",
});

export default function KontaktPage() {
  return (
    <main className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <section className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Kontakt</p>
        <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-[1.14] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
          Lass uns kurz über deine Immobilie sprechen.
        </h1>
        <p className="mt-5 max-w-[48rem] text-lg leading-[1.75] text-[color:var(--color-graphite)]">
          Beschreib kurz dein Anliegen. Zwei Sätze reichen – wir melden uns persönlich bei dir.
        </p>

        <div className="mt-8 grid gap-6">
          <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-6">
            <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">Direkt erreichbar</h2>
            <p className="mt-3 text-base leading-[1.75] text-[color:var(--color-graphite)]">
              Frisia Immobilien, Oldersumer Straße 150, 26605 Aurich.
            </p>
            <h3 className="mt-5 text-xl font-semibold text-[color:var(--color-navy)]">Kontaktwege</h3>
            <ul className="mt-3 space-y-2 text-base text-[color:var(--color-graphite)]">
              <li>
                <a href={`tel:${PHONE_E164}`} className="font-semibold underline underline-offset-4">04941 986770-0</a>
              </li>
              <li>
                <a href="mailto:info@frisia-immobilien.de" className="underline underline-offset-4">info@frisia-immobilien.de</a>
              </li>
            </ul>
          </article>
        </div>

        <KontaktForm />

        <aside className="mt-8 rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-6">
          <h4 className="text-lg font-semibold text-[color:var(--color-navy)]">Interne Verlinkung</h4>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-graphite)]">
            <li><Link href="/immobilienmakler-aurich" className="underline underline-offset-4">Immobilienmakler Aurich</Link></li>
            <li><Link href="/immobilienpreise-aurich" className="underline underline-offset-4">Immobilienpreise Aurich</Link></li>
            <li><Link href="/regionen-ostfriesland" className="underline underline-offset-4">Regionen Ostfriesland</Link></li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
