import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Karriere bei Frisia Immobilien in Aurich",
  description:
    "Karriere bei Frisia Immobilien in Aurich: Verantwortung, klare Prozesse und persönliches Arbeiten im regionalen Immobilienmarkt.",
  path: "/karriere",
  keywords: [
    "karriere immobilien aurich",
    "immobilienmakler werden aurich",
    "jobs immobilien ostfriesland",
  ],
});

export default function KarrierePage() {
  return (
    <EditorialPageTemplate
      slug="karriere"
      eyebrow="Karriere"
      h1="Karriere bei Frisia Immobilien in Aurich"
      intro="Frisia Immobilien steht für klare Zuständigkeit, ruhige Führung und regionale Marktkenntnis. Wer strukturiert arbeiten und Eigentümer professionell begleiten will, findet hier ein Umfeld mit klarer Haltung."
      imageAlt="Karriere bei Frisia Immobilien in Aurich"
      sections={[
        {
          title: "Wofür Frisia Immobilien steht",
          body: [
            "Im Mittelpunkt stehen Eigentümer, die Sicherheit, klare Prozesse und verlässliche Ansprechpartner erwarten. Genau daran ist auch die interne Arbeitsweise ausgerichtet.",
            "Gesucht werden Menschen, die Verantwortung übernehmen, sauber kommunizieren und im Immobilienverkauf nicht auf Druck, sondern auf Struktur setzen.",
          ],
        },
        {
          title: "Wie eine Zusammenarbeit aussieht",
          body: [
            "Ob Einstieg, Weiterentwicklung oder neue Verantwortung im regionalen Markt: Entscheidend ist die Fähigkeit, Eigentümer ruhig und kompetent durch Entscheidungsprozesse zu führen.",
            "Wenn Frisia Immobilien als Arbeitsumfeld interessant ist, ist ein persönliches Gespräch der sinnvollste nächste Schritt.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/kontakt", label: "Kontakt für ein persönliches Gespräch" },
        { href: "/maklerhaus", label: "Das Maklerhaus Frisia Immobilien" },
        { href: "/ueber-uns/arbeitsweise", label: "Arbeitsweise und Werte" },
      ]}
    />
  );
}
