import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Immobilienpreise Ostfriesland",
  description:
    "Immobilienpreise in Ostfriesland: regionale Preisunterschiede zwischen Aurich, Emden, Leer, Wittmund und weiteren Teilmärkten strukturiert einordnen.",
  path: "/immobilienpreise-ostfriesland",
  keywords: [
    "immobilienpreise ostfriesland",
    "hauspreise ostfriesland",
    "immobilienmarkt ostfriesland",
    "immobilienbewertung ostfriesland",
  ],
});

export default function ImmobilienpreiseOstfrieslandPage() {
  return (
    <EditorialPageTemplate
      slug="immobilienpreise-ostfriesland"
      eyebrow="Immobilienpreise Ostfriesland"
      h1="Immobilienpreise in Ostfriesland"
      intro="Zwischen Aurich, Emden, Leer, Wittmund, Norden und ländlicheren Teilmärkten bestehen teils deutliche Unterschiede bei Nachfrage, Preisniveau und Vermarktungsgeschwindigkeit."
      imageAlt="Immobilienpreise in Ostfriesland"
      sections={[
        {
          title: "Warum regionale Unterschiede so stark sind",
          body: [
            "Preisunterschiede entstehen nicht nur zwischen Städten, sondern oft schon zwischen einzelnen Mikrolagen. Infrastruktur, Lagequalität, Objektzustand und Käuferstruktur wirken direkt auf den erzielbaren Marktpreis.",
            "Für Eigentümer reicht deshalb ein pauschaler Durchschnittswert nicht aus, wenn eine realistische Verkaufsentscheidung getroffen werden soll.",
          ],
        },
        {
          title: "Wie Frisia Immobilien die Lage einordnet",
          body: [
            "Frisia Immobilien verbindet regionale Vergleichsdaten mit konkreter Objektanalyse, damit Preisrahmen und Verkaufsstrategie belastbar werden.",
            "Das ist besonders wichtig, wenn eine Immobilie in einem Markt liegt, der sich von Aurich deutlich unterscheidet.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/regionen-ostfriesland", label: "Regionen Ostfriesland" },
        { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
      ]}
    />
  );
}
