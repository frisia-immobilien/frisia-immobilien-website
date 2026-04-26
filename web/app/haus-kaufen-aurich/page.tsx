import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Haus kaufen Aurich",
  description:
    "Haus kaufen in Aurich mit regionaler Markteinordnung und strukturierter Begleitung durch Frisia Immobilien.",
  path: "/haus-kaufen-aurich",
  keywords: ["haus kaufen aurich", "immobilien aurich", "immobilienmakler aurich", "hauskauf ostfriesland"],
});

export default function HausKaufenAurichPage() {
  return (
    <ServicePageTemplate
      slug="haus-kaufen-aurich"
      eyebrow="Haus kaufen Aurich"
      h1="Haus kaufen in Aurich und Ostfriesland"
      intro="Käufer erhalten strukturierte Begleitung bei Auswahl, Einordnung und Entscheidung für passende Immobilien im regionalen Markt."
      imageAlt="Haus kaufen in Aurich mit Frisia Immobilien"
      h2A="Sicher entscheiden beim Hauskauf"
      h2B="FAQ zum Hauskauf in Aurich"
      h3A="Lage und Preis einordnen"
      h3B="Objekte strukturiert prüfen"
      paragraphA="Regionale Vergleichsdaten helfen, realistische Kaufpreise und nachhaltige Werte frühzeitig zu erkennen."
      paragraphB="Frisia Immobilien begleitet bei Besichtigung, Dokumentenprüfung und Entscheidungsstruktur bis zum Abschluss."
      internalLinks={[
        { href: "/immobilien-aurich", label: "Immobilien Aurich" },
        { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
        { href: "/kontakt", label: "Kontakt" },
      ]}
      faq={[
        {
          question: "Wie finde ich passende Häuser in Aurich?",
          answer: "Mit strukturierter Bedarfserfassung, regionaler Marktkenntnis und klarer Objektprüfung.",
        },
        {
          question: "Worauf sollte ich beim Kaufpreis achten?",
          answer: "Auf Lagequalität, Zustand, Energieeffizienz und belastbare Vergleichsdaten aus der Region.",
        },
      ]}
    />
  );
}
