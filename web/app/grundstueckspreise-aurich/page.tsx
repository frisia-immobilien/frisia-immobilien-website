import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Grundstückspreise Aurich",
  description:
    "Grundstückspreise in Aurich einordnen: Lage, Größe, Zuschnitt, Erschließung und Bebaubarkeit strukturiert bewerten.",
  path: "/grundstueckspreise-aurich",
  keywords: [
    "grundstückspreise aurich",
    "grundstueckspreise aurich",
    "bodenwert aurich",
    "grundstück verkaufen aurich",
  ],
});

export default function GrundstueckspreiseAurichPage() {
  return (
    <EditorialPageTemplate
      slug="grundstueckspreise-aurich"
      eyebrow="Grundstückspreise Aurich"
      h1="Grundstückspreise in Aurich"
      intro="Grundstückspreise in Aurich hängen stark von Lage, Zuschnitt, Erschließung und Bebaubarkeit ab. Schon kleine Unterschiede können den realistischen Marktpreis deutlich verändern."
      imageAlt="Grundstückspreise in Aurich"
      sections={[
        {
          title: "Welche Faktoren Grundstückspreise treiben",
          body: [
            "Bebauungsplan, Erschließungsgrad, Straßenanbindung und Grundstücksform wirken direkt auf die Nutzungsmöglichkeiten und damit auf den Marktwert.",
            "Hinzu kommen regionale Unterschiede innerhalb von Aurich sowie Abweichungen zwischen Wohn- und Mischlagen.",
          ],
        },
        {
          title: "Warum Durchschnittswerte nicht ausreichen",
          body: [
            "Ein pauschaler Durchschnittswert hilft bei Grundstücken nur begrenzt, weil die rechtlichen und tatsächlichen Nutzungsmöglichkeiten stark variieren können.",
            "Für Eigentümer ist deshalb eine strukturierte Einordnung entscheidend, bevor ein Angebotspreis festgelegt wird.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/bodenrichtwert-aurich", label: "Bodenrichtwert Aurich" },
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
        { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
      ]}
    />
  );
}
