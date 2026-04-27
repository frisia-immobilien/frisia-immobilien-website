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
          title: "Zur Zeit liegen noch keine Untenrehmensmeldungen vor.",
          body: [],
        },
      ]}
      internalLinks={[
        { href: "/presse", label: "Presseberichte" },
        { href: "/maklerhaus", label: "Das Maklerhaus" },
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
      ]}
    />
  );
}
