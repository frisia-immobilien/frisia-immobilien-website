import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Arbeitsweise und Werte",
  description:
    "Arbeitsweise und Werte von Frisia Immobilien: strukturierte Prozesse, klare Kommunikation und ruhige Führung für Eigentümer in Aurich und Ostfriesland.",
  path: "/ueber-uns/arbeitsweise",
  keywords: [
    "arbeitsweise immobilienmakler aurich",
    "frisia immobilien werte",
    "immobilienverkauf struktur aurich",
  ],
});

export default function ArbeitsweisePage() {
  return (
    <EditorialPageTemplate
      slug="ueber-uns/arbeitsweise"
      eyebrow="Arbeitsweise"
      h1="Arbeitsweise und Werte von Frisia Immobilien"
      intro="Frisia Immobilien setzt auf geordnete Abläufe, datenbasierte Bewertung und persönliche Verantwortung. Die Arbeitsweise ist darauf ausgerichtet, Eigentümer zu entlasten und Entscheidungen sauber vorzubereiten."
      imageAlt="Arbeitsweise und Werte von Frisia Immobilien"
      sections={[
        {
          title: "Struktur vor Aktionismus",
          body: [
            "Vor jeder Vermarktung steht eine belastbare Einordnung: Ausgangslage, Preisrahmen, Unterlagen und Zielbild müssen zusammenpassen.",
            "Das schützt Eigentümer vor Preisfehlern, unnötiger Unruhe im Markt und schlecht vorbereiteten Entscheidungen.",
          ],
        },
        {
          title: "Verantwortung bis zum Abschluss",
          body: [
            "Die Begleitung endet nicht mit einer Anzeige. Sie umfasst auch Interessentenqualifizierung, Verhandlungsführung und die formale Absicherung bis zum Notartermin.",
            "So entsteht ein Verkaufsprozess, der sich kontrolliert und verlässlich anfühlt.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/ueber-uns", label: "Über Frisia Immobilien" },
        { href: "/maklerhaus", label: "Das Maklerhaus" },
        { href: "/immobilie-verkaufen-aurich", label: "Immobilie verkaufen Aurich" },
      ]}
    />
  );
}
