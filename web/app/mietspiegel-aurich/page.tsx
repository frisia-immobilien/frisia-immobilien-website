import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Mietspiegel Aurich",
  description:
    "Mietspiegel in Aurich einordnen: Welche Rolle Mietdaten für Marktverständnis, Renditebetrachtung und Immobilienentscheidung spielen.",
  path: "/mietspiegel-aurich",
  keywords: [
    "mietspiegel aurich",
    "mieten aurich",
    "wohnungsmarkt aurich",
    "immobilienmarkt aurich",
  ],
});

export default function MietspiegelAurichPage() {
  return (
    <EditorialPageTemplate
      slug="mietspiegel-aurich"
      eyebrow="Mietspiegel Aurich"
      h1="Mietspiegel und Mietniveau in Aurich"
      intro="Das Mietniveau in Aurich ist ein wichtiger Teil des lokalen Marktverständnisses. Für Eigentümer, Käufer und Investoren liefert es Hinweise auf Nachfrage, Rendite und Zielgruppen."
      imageAlt="Mietspiegel in Aurich"
      sections={[
        {
          title: "Warum Mietdaten relevant sind",
          body: [
            "Mietdaten helfen, den Wohnungsmarkt in Aurich besser zu verstehen. Sie zeigen, wie stark bestimmte Lagen und Objektarten nachgefragt werden.",
            "Für Investitionsentscheidungen und Marktbeobachtung sind sie deshalb ein wertvoller Orientierungsrahmen.",
          ],
        },
        {
          title: "Was ein Mietspiegel nicht allein beantwortet",
          body: [
            "Auch wenn Mietdaten wichtig sind, sagen sie nicht automatisch alles über Verkaufswert, Vermarktungsdauer oder Käuferdynamik aus.",
            "Für Eigentümer bleibt daher die Verbindung aus Mietniveau, Kaufpreisdaten und konkreter Objektanalyse entscheidend.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/immobilienmarkt-aurich", label: "Immobilienmarkt Aurich" },
        { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
        { href: "/immobilien-aurich", label: "Immobilien Aurich" },
      ]}
    />
  );
}
