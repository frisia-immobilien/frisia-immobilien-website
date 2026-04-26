import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Haus verkaufen Aurich",
  description:
    "Haus verkaufen in Aurich mit fundierter Bewertung, klarer Preisstrategie und persönlicher Begleitung durch Frisia Immobilien.",
  path: "/haus-verkaufen-aurich",
  keywords: ["haus verkaufen aurich", "immobilie verkaufen aurich", "immobilienbewertung aurich", "immobilienmakler aurich"],
});

export default function HausVerkaufenAurichPage() {
  return (
    <ServicePageTemplate
      slug="haus-verkaufen-aurich"
      eyebrow="Haus verkaufen Aurich"
      h1="Hausverkauf in Aurich und Ostfriesland"
      intro="Frisia Immobilien begleitet Eigentümer beim Hausverkauf mit klarer Führung, belastbaren Vergleichsdaten und rechtssicherem Abschluss."
      imageAlt="Hausverkauf in Aurich"
      h2A="Geordneter Hausverkauf"
      h2B="FAQ zum Hausverkauf in Aurich"
      h3A="Preisrahmen und Strategie"
      h3B="Interessenten und Verhandlung"
      paragraphA="Ein marktgerechter Einstiegspreis schützt vor Leerlauf und schafft eine stabile Verhandlungsbasis."
      paragraphB="Vorgeprüfte Interessenten und klare Prozesse reduzieren Risiko bis zum Notartermin deutlich."
      internalLinks={[
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
        { href: "/immobilie-verkaufen-aurich", label: "Immobilie verkaufen Aurich" },
        { href: "/kontakt", label: "Termin vereinbaren" },
      ]}
      faq={[
        {
          question: "Wann ist ein guter Verkaufszeitpunkt?",
          answer: "Entscheidend sind Lage, Zustand, Nachfrage und eine realistische Preisstrategie.",
        },
        {
          question: "Wie vermeide ich Preisfehler?",
          answer: "Durch eine strukturierte Einordnung auf Basis aktueller Vergleichsdaten aus der Region.",
        },
      ]}
    />
  );
}
