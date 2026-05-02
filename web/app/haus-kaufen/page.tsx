import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Haus kaufen",
  description:
    "Haus kaufen mit regionaler Markteinordnung, strukturierter Auswahl und persönlicher Begleitung durch Frisia Immobilien.",
  path: "/haus-kaufen",
  keywords: ["haus kaufen", "haus kaufen aurich", "immobilien kaufen", "immobilien aurich"],
});

export default function HausKaufenPage() {
  return (
    <ServicePageTemplate
      slug="haus-kaufen"
      eyebrow="Haus kaufen"
      h1="Haus kaufen mit ruhiger Entscheidungsgrundlage"
      intro="Frisia Immobilien unterstützt Käufer bei Auswahl, Einordnung und Prüfung passender Immobilien in Aurich und Ostfriesland."
      imageAlt="Haus kaufen mit Frisia Immobilien"
      h2A="Sicher entscheiden beim Hauskauf"
      h2B="FAQ zum Hauskauf"
      h3A="Lage und Preis einordnen"
      h3B="Objekte strukturiert prüfen"
      paragraphA="Regionale Vergleichsdaten helfen, Kaufpreise realistisch einzuschätzen und tragfähige Entscheidungen zu treffen."
      paragraphB="Besichtigung, Dokumentenprüfung und nächste Schritte werden geordnet begleitet, damit der Kaufprozess übersichtlich bleibt."
      internalLinks={[
        { href: "/immobilien-aurich", label: "Immobilien Aurich" },
        { href: "/immobilienpreise", label: "Immobilienpreise" },
        { href: "/suchauftrag", label: "Suchauftrag anlegen" },
      ]}
      faq={[
        {
          question: "Wie finde ich passende Häuser?",
          answer: "Mit klarer Bedarfserfassung, regionaler Marktkenntnis und strukturierter Objektprüfung.",
        },
        {
          question: "Worauf sollte ich beim Kaufpreis achten?",
          answer: "Wichtig sind Lage, Zustand, Energieeffizienz, Modernisierungsbedarf und vergleichbare Angebote im Markt.",
        },
      ]}
    />
  );
}
