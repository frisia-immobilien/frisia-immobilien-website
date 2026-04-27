import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { createArticleJsonLd } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Presseberichte über Frisia Immobilien",
  description:
    "Presseberichte über Frisia Immobilien in Aurich: Einordnung, Wahrnehmung und regionale Marktpräsenz in Ostfriesland.",
  path: "/presse",
  keywords: [
    "presse frisia immobilien",
    "immobilienmakler aurich presse",
    "frisia immobilien ostfriesland",
  ],
});

export default function PressePage() {
  return (
    <>
      <JsonLd
        data={createArticleJsonLd({
          path: "/presse",
          headline: "Presseberichte über Frisia Immobilien",
          description:
            "Presseberichte über Frisia Immobilien in Aurich: Einordnung, Wahrnehmung und regionale Marktpräsenz in Ostfriesland.",
        })}
      />
      <EditorialPageTemplate
        slug="presse"
        eyebrow="Presse"
        h1="Presseberichte über Frisia Immobilien"
        intro="Diese Seite bündelt die Pressepräsenz von Frisia Immobilien. Im Vordergrund stehen regionale Sichtbarkeit, Marktkompetenz und eine klare Einordnung der Leistungen im Immobilienmarkt von Aurich und Ostfriesland."
        imageAlt="Presseberichte über Frisia Immobilien"
        sections={[
          {
            title: "Zur Zeit liegen keine Pressemitteilungen vor.",
            body: [],
          },
        ]}
        internalLinks={[
          { href: "/unternehmensmeldungen", label: "Unternehmensmeldungen" },
          { href: "/immobilienmakler-aurich", label: "Immobilienmakler Aurich" },
          { href: "/kontakt", label: "Presse- und Kontaktanfrage" },
        ]}
      />
    </>
  );
}
