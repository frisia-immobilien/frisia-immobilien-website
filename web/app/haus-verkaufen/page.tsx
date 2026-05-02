import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Haus verkaufen",
  description:
    "Haus verkaufen mit fundierter Bewertung, klarer Preisstrategie und strukturierter Begleitung durch Frisia Immobilien in Aurich und Ostfriesland.",
  path: "/haus-verkaufen",
  keywords: ["haus verkaufen", "haus verkaufen aurich", "immobilie verkaufen", "immobilienbewertung"],
});

export default function HausVerkaufenPage() {
  return (
    <ServicePageTemplate
      slug="haus-verkaufen"
      eyebrow="Haus verkaufen"
      h1="Haus verkaufen mit klarer Preisstrategie"
      intro="Frisia Immobilien begleitet Eigentümer beim Hausverkauf mit fundierter Bewertung, sauberer Vorbereitung und klarer Führung bis zum Notartermin."
      imageAlt="Haus verkaufen mit Frisia Immobilien"
      h2A="Strukturierter Hausverkauf"
      h2B="FAQ zum Hausverkauf"
      h3A="Preisrahmen realistisch bestimmen"
      h3B="Verkauf sicher vorbereiten"
      paragraphA="Ein belastbarer Einstiegspreis schafft Nachfrage, reduziert Leerlauf und gibt Eigentümern eine klare Entscheidungsgrundlage."
      paragraphB="Unterlagen, Vermarktung, Besichtigungen und Verhandlung werden geordnet vorbereitet, damit der Verkauf ruhig und nachvollziehbar bleibt."
      internalLinks={[
        { href: "/immobilienbewertung", label: "Immobilienbewertung" },
        { href: "/haus-verkaufen-aurich", label: "Haus verkaufen Aurich" },
        { href: "/kontakt", label: "Erstgespräch vereinbaren" },
      ]}
      faq={[
        {
          question: "Was ist vor dem Hausverkauf wichtig?",
          answer: "Entscheidend sind ein realistischer Preisrahmen, vollständige Unterlagen und eine klare Vermarktungsstrategie.",
        },
        {
          question: "Wie wird der passende Verkaufspreis ermittelt?",
          answer: "Über Lage, Zustand, Ausstattung, Grundstück, Nachfrage und aktuelle Vergleichsdaten aus dem regionalen Markt.",
        },
      ]}
    />
  );
}
