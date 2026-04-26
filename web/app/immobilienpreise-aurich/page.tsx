import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Immobilienpreise Aurich",
  description:
    "Immobilienpreise in Aurich und Ostfriesland: regionale Vergleichsdaten als Grundlage für sichere Verkaufsentscheidungen.",
  path: "/immobilienpreise-aurich",
  keywords: ["immobilienpreise aurich", "hauspreise aurich", "immobilienbewertung aurich", "immobilie verkaufen aurich"],
});

export default function ImmobilienpreiseAurichPage() {
  return (
    <ServicePageTemplate
      slug="immobilienpreise-aurich"
      eyebrow="Immobilienpreise Aurich"
      h1="Immobilienpreise in Aurich richtig einordnen"
      intro="Frisia Immobilien analysiert regionale Vergleichsdaten und Marktbewegungen, damit Eigentümer sichere Preisentscheidungen treffen können."
      imageAlt="Immobilienpreise in Aurich"
      h2A="Wie Preise regional entstehen"
      h2B="FAQ zu Immobilienpreisen in Aurich"
      h3A="Lage und Nachfrage"
      h3B="Objektqualität und Zustand"
      paragraphA="Zentrale und gewachsene Wohnlagen entwickeln sich häufig anders als periphere oder ländliche Bereiche."
      paragraphB="Baujahr, energetischer Zustand und Modernisierungsgrad beeinflussen die tatsächliche Marktgängigkeit erheblich."
      internalLinks={[
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
        { href: "/immobilie-verkaufen-aurich", label: "Immobilie verkaufen Aurich" },
        { href: "/regionen-ostfriesland", label: "Regionen Ostfriesland" },
      ]}
      faq={[
        {
          question: "Warum unterscheiden sich Preise innerhalb von Aurich?",
          answer: "Weil Lage, Mikromarkt, Zustand und Nachfragestruktur lokal stark variieren.",
        },
        {
          question: "Wie bekomme ich einen belastbaren Preisrahmen?",
          answer: "Mit aktueller Vergleichsdatenanalyse und strukturierter Immobilienbewertung durch Frisia Immobilien.",
        },
      ]}
    />
  );
}
