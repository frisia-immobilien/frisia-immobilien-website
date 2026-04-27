import type { Metadata } from "next";

import JsonLd from "@/components/seo/JsonLd";
import LeadGenWizard from "@/components/immobilienbewertung/LeadGenWizard.client";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createWebPageJsonLd } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Immobilie bewerten",
  description:
    "Kostenfreie erste Marktpreiseinschätzung für Haus, Wohnung oder Grundstück in Aurich und Ostfriesland.",
  path: "/immobilie-bewerten",
  keywords: ["immobilie bewerten", "immobilienbewertung aurich", "haus bewerten", "wohnung bewerten"],
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/immobilie-bewerten", [
  { name: "Startseite", item: SITE_URL },
  { name: "Immobilie bewerten", item: `${SITE_URL}/immobilie-bewerten` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/immobilie-bewerten",
  name: "Immobilie bewerten",
  description: "Leadgenerator für eine erste Marktpreiseinschätzung von Frisia Immobilien.",
});

export default function ImmobilieBewertenPage() {
  return (
    <main id="main-content">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <h1 className="sr-only">Immobilie bewerten</h1>
      <LeadGenWizard layout="page" />
    </main>
  );
}
