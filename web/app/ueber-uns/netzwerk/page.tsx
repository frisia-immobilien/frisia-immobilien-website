import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Netzwerk",
  description:
    "Das Netzwerk von Frisia Immobilien in Aurich: strukturierte Zusammenarbeit mit relevanten Partnern rund um Bewertung, Verkauf und Abschluss.",
  path: "/ueber-uns/netzwerk",
  keywords: [
    "netzwerk frisia immobilien",
    "partner immobilien aurich",
    "immobilienverkauf netzwerk ostfriesland",
  ],
});

export default function NetzwerkPage() {
  return (
    <EditorialPageTemplate
      slug="ueber-uns/netzwerk"
      eyebrow="Netzwerk"
      h1="Netzwerk und Zusammenarbeit bei Frisia Immobilien"
      intro="Ein sauberer Immobilienverkauf braucht oft mehr als nur Vermarktung. Frisia Immobilien arbeitet deshalb mit relevanten Schnittstellen strukturiert zusammen, damit Eigentümer entlastet und Prozesse stabil gehalten werden."
      imageAlt="Netzwerk und Zusammenarbeit bei Frisia Immobilien"
      sections={[
        {
          title: "Warum ein gutes Netzwerk wichtig ist",
          body: [
            "Notar, Finanzierung, Unterlagenbeschaffung und praktische Umsetzung greifen im Verkaufsprozess ineinander. Reibung an diesen Stellen kostet Zeit und Sicherheit.",
            "Ein eingespieltes Netzwerk verbessert Abstimmung, Geschwindigkeit und Verlässlichkeit.",
          ],
        },
        {
          title: "Was für Eigentümer zählt",
          body: [
            "Entscheidend ist nicht die Anzahl der Kontakte, sondern die Qualität der Zusammenarbeit. Eigentümer profitieren dann, wenn Abläufe ruhiger und Entscheidungen besser vorbereitet werden.",
            "Das Netzwerk dient deshalb immer dem Ziel, den Verkaufsprozess in Aurich und Ostfriesland sauber zu steuern.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/ueber-uns", label: "Über Frisia Immobilien" },
        { href: "/ueber-uns/arbeitsweise", label: "Arbeitsweise und Werte" },
        { href: "/kontakt", label: "Kontakt aufnehmen" },
      ]}
    />
  );
}
