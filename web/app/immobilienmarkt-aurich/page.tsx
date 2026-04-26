import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Immobilienmarkt Aurich",
  description:
    "Immobilienmarkt Aurich: strukturierte Einordnung von Nachfrage, Preisniveau und Vermarktungsdynamik im regionalen Markt.",
  path: "/immobilienmarkt-aurich",
  keywords: [
    "immobilienmarkt aurich",
    "immobilienpreise aurich",
    "haus verkaufen aurich",
    "immobilienbewertung aurich",
  ],
});

export default function ImmobilienmarktAurichPage() {
  return (
    <EditorialPageTemplate
      slug="immobilienmarkt-aurich"
      eyebrow="Immobilienmarkt Aurich"
      h1="Immobilienmarkt in Aurich"
      intro="Der Immobilienmarkt in Aurich entwickelt sich nicht gleichmäßig. Nachfrage, Lagequalität, Objekttyp und Zustand beeinflussen Preisniveau und Vermarktungsdauer spürbar."
      imageAlt="Immobilienmarkt in Aurich"
      sections={[
        {
          title: "Was den Markt in Aurich prägt",
          body: [
            "In gewachsenen Wohnlagen und nachgefragten Teilbereichen von Aurich bleibt die Nachfrage nach guten Wohnimmobilien häufig stabil. In anderen Lagen reagieren Käufer sensibler auf Preis, Zustand und Energieeffizienz.",
            "Für Eigentümer ist deshalb entscheidend, die eigene Immobilie nicht abstrakt, sondern im konkreten regionalen Marktumfeld einzuordnen.",
          ],
        },
        {
          title: "Wofür diese Einordnung wichtig ist",
          body: [
            "Ein realistischer Blick auf den Immobilienmarkt in Aurich ist die Grundlage für einen belastbaren Preisrahmen und einen geordneten Verkaufsprozess.",
            "Wer Marktbewegung, Vergleichsobjekte und Zielgruppen sauber versteht, reduziert Preisfehler und unnötige Vermarktungszeit.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
        { href: "/immobilie-verkaufen-aurich", label: "Immobilie verkaufen Aurich" },
      ]}
    />
  );
}
