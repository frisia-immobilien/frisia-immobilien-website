import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Über Frisia Immobilien in Aurich",
  description:
    "Über Frisia Immobilien in Aurich: Haltung, Arbeitsweise und regionale Verantwortung im Immobilienmarkt von Aurich und Ostfriesland.",
  path: "/ueber-uns",
  keywords: [
    "frisia immobilien aurich",
    "ueber frisia immobilien",
    "immobilienmakler aurich unternehmen",
  ],
});

export default function UeberUnsPage() {
  return (
    <EditorialPageTemplate
      slug="ueber-uns"
      eyebrow="Über Frisia Immobilien"
      h1="Frisia Immobilien in Aurich"
      intro="Frisia Immobilien ist auf den regionalen Markt in Aurich und Ostfriesland ausgerichtet. Im Zentrum stehen strukturierte Bewertung, ruhige Führung und eine verlässliche Begleitung von Eigentümern im Verkaufsprozess."
      imageAlt="Über Frisia Immobilien in Aurich"
      sections={[
        {
          title: "Haltung und Anspruch",
          body: [
            "Frisia Immobilien will nicht durch Lautstärke, sondern durch Klarheit überzeugen. Eigentümer sollen den Eindruck haben: Hier kümmert sich jemand vollständig.",
            "Dafür braucht es belastbare Markteinordnung, klare Kommunikation und eine geordnete Führung vom ersten Gespräch bis zum Abschluss.",
          ],
        },
        {
          title: "Regionale Verantwortung",
          body: [
            "Der Fokus liegt auf Aurich und Ostfriesland. Regionale Marktkenntnis ist kein Nebenaspekt, sondern Grundlage für Preisstrategie, Positionierung und Verhandlungssicherheit.",
            "Gleichzeitig werden angrenzende Städte und Gemeinden mitgedacht, wenn sie für Vergleichsdaten und Käuferdynamik relevant sind.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/ueber-uns/sebastian-munzig", label: "Ihr Ansprechpartner: Sebastian Munzig" },
        { href: "/ueber-uns/arbeitsweise", label: "Arbeitsweise und Werte" },
        { href: "/ueber-uns/netzwerk", label: "Netzwerk und Zusammenarbeit" },
      ]}
    />
  );
}
