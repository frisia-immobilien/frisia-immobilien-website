import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Wohnungspreise Aurich",
  description:
    "Wohnungspreise in Aurich einordnen: Lage, Größe, Zustand, Hausgeld und Nachfrage sauber bewerten für Verkauf oder Marktanalyse.",
  path: "/wohnungspreise-aurich",
  keywords: [
    "wohnungspreise aurich",
    "wohnungswert aurich",
    "wohnung verkaufen aurich",
    "immobilienpreise aurich",
  ],
});

export default function WohnungspreiseAurichPage() {
  return (
    <EditorialPageTemplate
      slug="wohnungspreise-aurich"
      eyebrow="Wohnungspreise Aurich"
      h1="Wohnungspreise in Aurich"
      intro="Wohnungspreise in Aurich werden nicht nur durch Lage und Wohnfläche bestimmt. Auch Zuschnitt, Gebäudezustand, Energieeffizienz und die Qualität der Eigentümergemeinschaft spielen eine wichtige Rolle."
      imageAlt="Wohnungspreise in Aurich"
      sections={[
        {
          title: "Was bei Wohnungen besonders zählt",
          body: [
            "Bei Eigentumswohnungen sind Faktoren wie Baujahr, Zustand des Gemeinschaftseigentums, Balkon, Stellplatz und Hausgeld oft preistreibend oder preisdämpfend.",
            "Für eine belastbare Einordnung reicht es deshalb nicht, nur den Quadratmeterpreis der Umgebung zu betrachten.",
          ],
        },
        {
          title: "Wie ein marktfähiger Preis entsteht",
          body: [
            "Ein marktfähiger Wohnungspreis entsteht aus der Kombination von regionalen Vergleichsobjekten und der konkreten Objektqualität.",
            "Gerade bei Wohnungen ist eine saubere Preisstrategie wichtig, weil Käufer stark auf Details und Folgekosten achten.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
        { href: "/immobilien-aurich", label: "Immobilien Aurich" },
      ]}
    />
  );
}
