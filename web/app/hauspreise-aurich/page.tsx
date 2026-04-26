import EditorialPageTemplate from "@/components/site/EditorialPageTemplate";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Hauspreise Aurich",
  description:
    "Hauspreise in Aurich realistisch einordnen: Lage, Zustand, Grundstück und Nachfrage sauber bewerten, bevor der Verkauf startet.",
  path: "/hauspreise-aurich",
  keywords: [
    "hauspreise aurich",
    "hauswert aurich",
    "haus verkaufen aurich",
    "immobilienpreise aurich",
  ],
});

export default function HauspreiseAurichPage() {
  return (
    <EditorialPageTemplate
      slug="hauspreise-aurich"
      eyebrow="Hauspreise Aurich"
      h1="Hauspreise in Aurich"
      intro="Hauspreise in Aurich hängen stark von Mikrolage, Baujahr, Grundstück, energetischem Zustand und Zielgruppe ab. Für Eigentümer ist deshalb die konkrete Einordnung wichtiger als jeder pauschale Durchschnittswert."
      imageAlt="Hauspreise in Aurich"
      sections={[
        {
          title: "Wodurch Hauspreise beeinflusst werden",
          body: [
            "Bei Einfamilienhäusern, Doppelhaushälften und Reihenhäusern wirken Lagequalität, Grundstücksgröße, Modernisierungsstand und Energieeffizienz besonders stark auf die Zahlungsbereitschaft.",
            "Auch innerhalb von Aurich können sich Hauspreise zwischen Stadtteilen und Randlagen deutlich unterscheiden.",
          ],
        },
        {
          title: "Warum ein belastbarer Preisrahmen wichtig ist",
          body: [
            "Ein realistischer Hauspreis schafft die Grundlage für einen ruhigen Verkaufsprozess. Zu hoch angesetzte Preise bremsen Nachfrage, zu niedrig angesetzte Preise verschenken Vermögen.",
            "Deshalb sollte der Einstiegspreis immer aus regionalen Vergleichsdaten und der individuellen Objektsituation entwickelt werden.",
          ],
        },
      ]}
      internalLinks={[
        { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
        { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
        { href: "/haus-verkaufen-aurich", label: "Haus verkaufen Aurich" },
      ]}
    />
  );
}
