import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createWebPageJsonLd } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Cookie-Hinweise",
  description:
    "Cookie-Hinweise und Einwilligungsinformationen für frisia-immobilien.de der Frisia Immobilien GmbH.",
  path: "/recht/cookies",
  keywords: ["cookie hinweise frisia immobilien", "cookie einwilligung aurich", "frisia immobilien cookies"],
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/recht/cookies", [
  { name: "Startseite", item: SITE_URL },
  { name: "Rechtliche Hinweise", item: `${SITE_URL}/recht` },
  { name: "Cookie-Hinweise", item: `${SITE_URL}/recht/cookies` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/recht/cookies",
  name: "Cookie-Hinweise",
  description:
    "Hinweise zu Cookies, lokaler Speicherung und Einwilligungen auf frisia-immobilien.de.",
});

export default function CookiesPage() {
  return (
    <main className="bg-white text-[color:var(--color-graphite)]">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <section className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
            Cookie-Hinweise
          </h1>

          <div className="mt-8 space-y-7 text-[1.02rem] leading-[1.75]">
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">1. Allgemeines</h2>
              <p className="mt-2">
                Diese Website verwendet Cookies bzw. lokale Speichertechnologien, um den Betrieb der Seite
                sicherzustellen und Ihre Einstellungen zu speichern.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                2. Technisch notwendige Speicherung
              </h2>
              <p className="mt-2">
                Notwendige Cookies/Einträge sind für die technische Funktion der Website erforderlich und können nicht
                deaktiviert werden.
              </p>
              <p className="mt-2">
                Aktuell wird für die Speicherung Ihrer Cookie-Auswahl ein lokaler Speichereintrag verwendet:
                <br />
                <strong>Name:</strong> <code>frisia_cookie_consent_v1</code>
                <br />
                <strong>Zweck:</strong> Speicherung Ihrer Einwilligungsentscheidung
                <br />
                <strong>Dauer:</strong> bis zur Löschung im Browser oder bis Sie die Einstellung ändern
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">3. Optionale Kategorien</h2>
              <p className="mt-2">
                Optionale Kategorien (z. B. Analyse) werden nur verarbeitet, wenn Sie diese aktiv freigeben.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">4. Rechtsgrundlagen</h2>
              <p className="mt-2">
                Rechtsgrundlage für notwendige Technologien ist § 25 Abs. 2 TDDDG i. V. m. Art. 6 Abs. 1 lit. f DSGVO.
                Für optionale Kategorien erfolgt die Verarbeitung nur auf Grundlage Ihrer Einwilligung nach § 25 Abs. 1
                TDDDG i. V. m. Art. 6 Abs. 1 lit. a DSGVO.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">5. Speicherdauer</h2>
              <p className="mt-2">
                Die Speicherdauer richtet sich nach Zweck und technischer Notwendigkeit. Ihre Cookie-Auswahl wird lokal
                gespeichert, damit sie bei einem erneuten Besuch berücksichtigt wird.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">6. Einwilligung ändern / widerrufen</h2>
              <p className="mt-2">
                Sie können Ihre Auswahl jederzeit über den Link „Cookie-Einstellungen ändern“ im Footer anpassen und
                neu speichern.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
