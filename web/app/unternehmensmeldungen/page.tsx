import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Unternehmensmeldungen von Frisia Immobilien",
  description:
    "Aktuelle Unternehmensmeldungen von Frisia Immobilien in Aurich: Einblicke in Entwicklung, Positionierung und regionale Marktaktivität.",
  path: "/unternehmensmeldungen",
  keywords: [
    "unternehmensmeldungen frisia immobilien",
    "frisia immobilien aurich news",
    "immobilienunternehmen ostfriesland",
  ],
});

export default function UnternehmensmeldungenPage() {
  return (
    <EditorialPageTemplate
      slug="unternehmensmeldungen"
      eyebrow="Unternehmensmeldungen"
      h1="Unternehmensmeldungen von Frisia Immobilien"
      intro="Auf dieser Seite bündelt Frisia Immobilien offizielle Hinweise zur eigenen Entwicklung, zu Marktaktivitäten und zu relevanten Themen rund um die Positionierung im regionalen Immobilienmarkt."
      imageAlt="Unternehmensmeldungen von Frisia Immobilien"
      sections={[
        {
          title: "Wofür diese Seite gedacht ist",
          body: [
            "Unternehmensmeldungen schaffen Klarheit über Entwicklungen, neue Schwerpunkte und relevante Informationen rund um Frisia Immobilien.",
            "Sie ergänzen die eigentliche Leistungsdarstellung, ohne die Kernseiten für Eigentümer und Suchintentionen zu verwässern.",
          ],
        },
        {
          title: "Relevanz für den regionalen Markt",
          body: [
            "Für Aurich und Ostfriesland ist eine klare Unternehmenskommunikation ein zusätzliches Vertrauenssignal. Sie stärkt die Einordnung von Frisia als regionale Entität mit eigener Marktrolle.",
            "Für konkrete Verkaufs- oder Bewertungsanliegen führen die Service-Seiten jedoch direkter zum nächsten sinnvollen Schritt.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/presseberichte", label: "Presseberichte" },
        { href: "/maklerhaus", label: "Das Maklerhaus" },
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
      ]}
    />
  );
}
