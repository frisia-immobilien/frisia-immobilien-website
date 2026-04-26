import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Sebastian Munzig",
  description:
    "Sebastian Munzig bei Frisia Immobilien in Aurich: klare Führung, strukturierte Bewertung und persönliche Verantwortung im regionalen Immobilienmarkt.",
  path: "/ueber-uns/sebastian-munzig",
  keywords: [
    "sebastian munzig",
    "frisia immobilien sebastian munzig",
    "immobilienmakler aurich sebastian munzig",
  ],
});

export default function SebastianMunzigPage() {
  return (
    <EditorialPageTemplate
      slug="ueber-uns/sebastian-munzig"
      eyebrow="Ansprechpartner"
      h1="Sebastian Munzig bei Frisia Immobilien"
      intro="Sebastian Munzig steht bei Frisia Immobilien für klare Führung, strukturierte Entscheidungsgrundlagen und persönliche Verantwortung im Kontakt mit Eigentümern."
      imageAlt="Sebastian Munzig bei Frisia Immobilien"
      sections={[
        {
          title: "Rolle im Verkaufsprozess",
          body: [
            "Im Mittelpunkt steht nicht reine Vermarktung, sondern die geordnete Führung eines oft sensiblen Entscheidungsprozesses. Das gilt besonders bei Preisfindung, Unterlagenlage und Käuferauswahl.",
            "Eigentümer profitieren davon, wenn Zuständigkeiten klar, Rückmeldungen belastbar und nächste Schritte nachvollziehbar sind.",
          ],
        },
        {
          title: "Was Eigentümer davon haben",
          body: [
            "Ein persönlicher Ansprechpartner schafft Ruhe, wenn viele Details gleichzeitig zu klären sind. Das reduziert Unsicherheit und verbessert die Entscheidungsqualität.",
            "Gerade im regionalen Markt von Aurich und Ostfriesland zählt diese Verbindung aus Marktkenntnis und verlässlicher Begleitung.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/ueber-uns", label: "Über Frisia Immobilien" },
        { href: "/ueber-uns/arbeitsweise", label: "Arbeitsweise und Werte" },
        { href: "/kontakt", label: "Direkter Kontakt" },
      ]}
    />
  );
}
