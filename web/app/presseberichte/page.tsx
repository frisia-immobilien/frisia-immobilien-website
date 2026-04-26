import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Presseberichte über Frisia Immobilien",
  description:
    "Presseberichte über Frisia Immobilien in Aurich: Einordnung, Wahrnehmung und regionale Marktpräsenz in Ostfriesland.",
  path: "/presseberichte",
  keywords: [
    "presse frisia immobilien",
    "immobilienmakler aurich presse",
    "frisia immobilien ostfriesland",
  ],
});

export default function PresseberichtePage() {
  return (
    <EditorialPageTemplate
      slug="presseberichte"
      eyebrow="Presse"
      h1="Presseberichte über Frisia Immobilien"
      intro="Diese Seite bündelt die Pressepräsenz von Frisia Immobilien. Im Vordergrund stehen regionale Sichtbarkeit, Marktkompetenz und eine klare Einordnung der Leistungen im Immobilienmarkt von Aurich und Ostfriesland."
      imageAlt="Presseberichte über Frisia Immobilien"
      sections={[
        {
          title: "Regionale Wahrnehmung",
          body: [
            "Presseberichte stärken die öffentliche Einordnung von Frisia Immobilien als regionale Adresse für strukturierte Immobilienbewertung und Verkaufsbegleitung.",
            "Besonders relevant sind Beiträge, die Marktkompetenz, lokale Verankerung und die Arbeitsweise im Eigentümergeschäft nachvollziehbar machen.",
          ],
        },
        {
          title: "Einordnung für Eigentümer",
          body: [
            "Für Eigentümer schaffen Presseerwähnungen zusätzlichen Vertrauensaufbau, wenn sie die Rolle von Frisia als verlässlichen Partner im regionalen Markt bestätigen.",
            "Für konkrete Anfragen bleibt der direkte Kontakt oder die strukturierte Immobilienbewertung der sinnvollste nächste Schritt.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/unternehmensmeldungen", label: "Unternehmensmeldungen" },
        { href: "/immobilienmakler-aurich", label: "Immobilienmakler Aurich" },
        { href: "/kontakt", label: "Presse- und Kontaktanfrage" },
      ]}
    />
  );
}
