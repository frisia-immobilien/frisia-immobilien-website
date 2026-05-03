import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createWebPageJsonLd } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Datenschutz",
  description:
    "Datenschutzerklärung der Frisia Immobilien GmbH für frisia-immobilien.de mit Informationen zu Kontakt, Formularen und Cookies.",
  path: "/recht/datenschutz",
  keywords: ["datenschutz frisia immobilien", "datenschutzerklärung immobilienmakler aurich", "cookies datenschutz frisia"],
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/recht/datenschutz", [
  { name: "Startseite", item: SITE_URL },
  { name: "Rechtliche Hinweise", item: `${SITE_URL}/recht` },
  { name: "Datenschutz", item: `${SITE_URL}/recht/datenschutz` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/recht/datenschutz",
  name: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung der Frisia Immobilien GmbH mit Informationen zur Datenverarbeitung auf frisia-immobilien.de.",
});

export default function DatenschutzPage() {
  return (
    <main className="bg-white text-[color:var(--color-graphite)]">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <section className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
            Datenschutzerklärung
          </h1>

          <div className="mt-8 space-y-7 text-[1.02rem] leading-[1.75]">
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">1. Verantwortlicher</h2>
              <p className="mt-2">
                Frisia Immobilien GmbH
                <br />
                Oldersumer Straße 150
                <br />
                26605 Aurich
                <br />
                E-Mail: info@frisia-immobilien.de
                <br />
                Telefon: 04941 986770-0
                <br />
                Website: frisia-immobilien.de
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                2. Datenschutzbeauftragter
              </h2>
              <p className="mt-2">
                Ein Datenschutzbeauftragter ist derzeit nicht benannt. Bei Fragen zum Datenschutz erreichen Sie uns
                unter den oben genannten Kontaktdaten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">3. Allgemeine Hinweise</h2>
              <p className="mt-2">
                Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Personenbezogene Daten verarbeiten wir nur,
                soweit dies zur Bereitstellung einer funktionsfähigen Website, unserer Inhalte und Leistungen
                erforderlich ist.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">4. Server-Logfiles</h2>
              <p className="mt-2">
                Beim Aufruf dieser Website werden technisch erforderliche Daten (z. B. IP-Adresse, Datum/Uhrzeit,
                aufgerufene Seite, Browser/OS) verarbeitet, um die Website stabil und sicher bereitzustellen.
              </p>
              <p className="mt-2">
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Betriebssicherheit).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">5. Kontaktaufnahme</h2>
              <p className="mt-2">
                Wenn Sie uns per Telefon, E-Mail oder Formular kontaktieren, verarbeiten wir Ihre Angaben zur
                Bearbeitung der Anfrage und für den Fall von Anschlussfragen.
              </p>
              <p className="mt-2">
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. f
                DSGVO.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                6. Immobilienbewertung / Lead-Formular
              </h2>
              <p className="mt-2">
                Im Rahmen der Immobilienbewertung verarbeiten wir die von Ihnen angegebenen Objekt- und Kontaktdaten, um
                eine Einordnung vorzunehmen und Sie hierzu zu kontaktieren.
              </p>
              <p className="mt-2">
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Soweit eine Einwilligung abgefragt wird (z. B.
                E-Mail-Versand), erfolgt die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                7. Versand von E-Mails (Dienstleister)
              </h2>
              <p className="mt-2">
                Für CRM-Verarbeitung, Kontaktverwaltung, Aufgaben, Kontaktbenachrichtigungen und den Versand von
                Bewertungslinks nutzen wir Propstack. Hierbei werden E-Mail-Adresse und inhaltliche Versanddaten
                verarbeitet.
              </p>
              <p className="mt-2">
                Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Anfragebearbeitung) sowie Art. 6 Abs. 1 lit. f DSGVO
                (effiziente und nachvollziehbare Kommunikation).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                8. Datenbank / Hosting technischer Daten
              </h2>
              <p className="mt-2">
                Zur Verarbeitung von Bewertungs- und Lead-Daten nutzen wir eine PostgreSQL-Datenbank-Infrastruktur.
                Dabei werden die von Ihnen eingegebenen Daten ausschließlich zur Bearbeitung Ihrer Anfrage verarbeitet.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">
                9. Cookies und lokale Speicherung
              </h2>
              <p className="mt-2">
                Wir verwenden technisch notwendige Speichermechanismen (z. B. zur Cookie-Einwilligung). Optionale
                Kategorien werden nur mit Ihrer Auswahl aktiviert.
              </p>
              <p className="mt-2">
                Details finden Sie in den{" "}
                <Link href="/recht/cookies" className="underline underline-offset-4">
                  Cookie-Hinweisen
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">10. Rechtsgrundlagen</h2>
              <p className="mt-2">
                Soweit nicht anders angegeben, verarbeiten wir Daten auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
                (Vertrag/Vorvertrag), Art. 6 Abs. 1 lit. c DSGVO (rechtliche Pflichten), Art. 6 Abs. 1 lit. f DSGVO
                (berechtigte Interessen) oder Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">11. Speicherdauer</h2>
              <p className="mt-2">
                Personenbezogene Daten werden gelöscht, sobald der Zweck der Speicherung entfällt und keine gesetzlichen
                Aufbewahrungspflichten entgegenstehen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">12. Empfänger und Drittlandtransfer</h2>
              <p className="mt-2">
                Eine Weitergabe erfolgt nur, soweit sie zur technischen Bereitstellung unserer Leistungen erforderlich
                ist (z. B. Hosting, E-Mail-Dienstleister) oder wir hierzu gesetzlich verpflichtet sind. Bei einzelnen
                Diensten kann eine Verarbeitung außerhalb der EU/des EWR nicht ausgeschlossen werden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">13. Ihre Rechte</h2>
              <p className="mt-2">
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und
                Datenübertragbarkeit nach Maßgabe der Art. 15 bis 21 DSGVO.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">14. Widerruf von Einwilligungen</h2>
              <p className="mt-2">
                Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Die
                Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[color:var(--color-navy)]">15. Beschwerderecht</h2>
              <p className="mt-2">
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer
                personenbezogenen Daten zu beschweren.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
