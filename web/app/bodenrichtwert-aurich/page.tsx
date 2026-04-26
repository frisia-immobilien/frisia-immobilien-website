import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Bodenrichtwert Aurich",
  description:
    "Bodenrichtwert in Aurich verstehen: Was er aussagt, wo seine Grenzen liegen und warum er den Marktwert eines Grundstücks nicht allein bestimmt.",
  path: "/bodenrichtwert-aurich",
  keywords: [
    "bodenrichtwert aurich",
    "bodenrichtwerte aurich",
    "grundstückspreise aurich",
    "grundstück wert aurich",
  ],
});

export default function BodenrichtwertAurichPage() {
  return (
    <EditorialPageTemplate
      slug="bodenrichtwert-aurich"
      eyebrow="Bodenrichtwert Aurich"
      h1="Bodenrichtwert in Aurich"
      intro="Der Bodenrichtwert ist ein wichtiger Orientierungswert, aber nicht mit dem tatsächlichen Marktwert eines konkreten Grundstücks gleichzusetzen. Für Eigentümer ist diese Unterscheidung entscheidend."
      imageAlt="Bodenrichtwert in Aurich"
      sections={[
        {
          title: "Was der Bodenrichtwert leisten kann",
          body: [
            "Der Bodenrichtwert liefert eine standardisierte Orientierung für bestimmte Lagen und Gebiete. Er kann helfen, Preisrelationen im Markt besser zu verstehen.",
            "Er ersetzt jedoch keine konkrete Bewertung eines einzelnen Grundstücks.",
          ],
        },
        {
          title: "Wo die Grenzen liegen",
          body: [
            "Ein Grundstück kann trotz gleichem Richtwert deutlich im Marktwert abweichen, etwa durch Zuschnitt, Bebaubarkeit, Erschließung oder Mikrostandort.",
            "Für einen realistischen Verkaufspreis sollten Bodenrichtwert und tatsächliche Marktsituation deshalb zusammen betrachtet werden.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/grundstueckspreise-aurich", label: "Grundstückspreise Aurich" },
        { href: "/immobilienmarkt-aurich", label: "Immobilienmarkt Aurich" },
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
      ]}
    />
  );
}
