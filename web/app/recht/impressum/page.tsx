import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createWebPageJsonLd } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Impressum",
  description: "Impressum der Frisia Immobilien GmbH, Oldersumer Straße 150, 26605 Aurich.",
  path: "/recht/impressum",
  keywords: ["impressum frisia immobilien", "frisia immobilien gmbh aurich", "oldersumer straße 150 aurich"],
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/recht/impressum", [
  { name: "Startseite", item: SITE_URL },
  { name: "Rechtliche Hinweise", item: `${SITE_URL}/recht` },
  { name: "Impressum", item: `${SITE_URL}/recht/impressum` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/recht/impressum",
  name: "Impressum",
  description: "Impressum der Frisia Immobilien GmbH mit allen Pflichtangaben zum Standort in Aurich.",
});

export default function ImpressumPage() {
  return (
    <main className="bg-white text-[color:var(--color-graphite)]">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <section className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
            Impressum
          </h1>

          <div className="mt-8 space-y-7 text-[1.02rem] leading-[1.75]">
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">Angaben gemäß § 5 DDG</h2>
              <p className="mt-2">
                Frisia Immobilien GmbH
                <br />
                Oldersumer Straße 150
                <br />
                26605 Aurich
                <br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                GmbH-Angaben (§ 35a GmbHG)
              </h2>
              <p className="mt-2">
                Frisia Immobilien GmbH
                <br />
                Geschäftsführer: Sebastian Munzig
                <br />
                Sitz der Gesellschaft: Aurich
                <br />
                Registergericht: Amtsgericht Aurich
                <br />
                Handelsregister: HRB 207975
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">Kontakt</h2>
              <p className="mt-2">
                Telefon: 04941 986770-0
                <br />
                E-Mail: info@frisia-immobilien.de
                <br />
                Web: frisia-immobilien.de
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                Aufsichtsbehörde (Immobilienmakler gemäß GewO)
              </h2>
              <p className="mt-2">
                Industrie- und Handelskammer für Ostfriesland und Papenburg
                <br />
                Ringstraße 4, 26721 Emden
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">Umsatzsteuer</h2>
              <p className="mt-2">
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: derzeit nicht angegeben.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">Redaktionell verantwortlich</h2>
              <p className="mt-2">
                Frisia Immobilien GmbH
                <br />
                Oldersumer Straße 150, 26605 Aurich
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                Hinweis nach § 36 VSBG (Schlichtungsstelle)
              </h2>
              <p className="mt-2">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                <br />
                https://ec.europa.eu/consumers/odr
              </p>
              <p className="mt-2">
                Die Frisia Immobilien GmbH ist nicht verpflichtet und nicht bereit, an
                Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                Hinweis zur Vertraulichkeit (E-Mail)
              </h2>
              <p className="mt-2">
                Der Inhalt einer E-Mail ist vertraulich und ausschließlich für den bezeichneten Empfänger bestimmt.
                Wenn Sie nicht der vorgesehene Empfänger sind, ist jede Kenntnisnahme, Weitergabe, Speicherung oder
                Veröffentlichung des Inhalts unzulässig. Bitte informieren Sie den Absender und löschen Sie die
                Nachricht vollständig.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">Haftung für Inhalte</h2>
              <p className="mt-2">
                Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
                und Aktualität der Inhalte übernehmen wir keine Gewähr.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">Haftung für Links</h2>
              <p className="mt-2">
                Diese Website enthält Links zu externen Websites Dritter. Auf deren Inhalte haben wir keinen Einfluss.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">Urheberrecht</h2>
              <p className="mt-2">
                Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
                Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
