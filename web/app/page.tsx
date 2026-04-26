import HomeHero from "@/components/home/HomeHero";
import HomeLeadBlock from "@/components/home/HomeLeadBlock";
import HomeClientBoot from "@/components/home/HomeClientBoot.client";
import {
  ClosingCta,
  FaqBlock,
  FAQ_ITEMS,
  ProofCasesBlock,
  RegionalMarktBlock,
  Section9plus1,
  StandortAurichBlock,
  TestimonialsBlock,
  WhyFrisiaBlock,
  WarumEigentuemerBeauftragenBlock,
  WarumEigentuemerVerkaufenBlock,
} from "@/components/home/HomeSections";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import {
  SITE_URL,
  createBreadcrumbListJsonLd,
  createFAQPageJsonLd,
  createServiceJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

const HOME_TITLE = "Immobilienmakler Aurich für Bewertung und Verkauf";
const HOME_DESCRIPTION =
  "Frisia Immobilien ist Ihr Immobilienmakler in Aurich für strukturierte Immobilienbewertung, klare Preisstrategie und rechtssicheren Verkauf in Aurich und Ostfriesland.";

export const metadata = buildPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: [
    "Immobilienmakler Aurich",
    "Immobilienbewertung Aurich",
    "Haus verkaufen Aurich",
    "Immobilie verkaufen Aurich",
    "Immobilien Ostfriesland",
  ],
});

const siteNavigationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SiteNavigationElement", name: "Startseite", url: `${SITE_URL}/` },
    { "@type": "SiteNavigationElement", name: "Immobilie verkaufen", url: `${SITE_URL}/immobilie-verkaufen-aurich` },
    { "@type": "SiteNavigationElement", name: "Immobilienbewertung", url: `${SITE_URL}/immobilienbewertung-aurich` },
    { "@type": "SiteNavigationElement", name: "Immobilien", url: `${SITE_URL}/immobilien-aurich` },
    { "@type": "SiteNavigationElement", name: "Makler Aurich", url: `${SITE_URL}/immobilienmakler-aurich` },
    { "@type": "SiteNavigationElement", name: "Das Maklerhaus", url: `${SITE_URL}/maklerhaus` },
    { "@type": "SiteNavigationElement", name: "Regionen Ostfriesland", url: `${SITE_URL}/regionen-ostfriesland` },
    { "@type": "SiteNavigationElement", name: "Kontakt", url: `${SITE_URL}/kontakt` },
  ],
};

const serviceJsonLd = [
  createServiceJsonLd({
    path: "/immobilienbewertung-aurich",
    name: "Immobilienbewertung Aurich",
    serviceType: "Immobilienbewertung",
    description:
      "Strukturierte Immobilienbewertung in Aurich und Ostfriesland mit klarer Preisstrategie für Eigentümer.",
  }),
  createServiceJsonLd({
    path: "/immobilie-verkaufen-aurich",
    name: "Immobilie verkaufen Aurich",
    serviceType: "Immobilienverkauf",
    description:
      "Strukturierter Immobilienverkauf in Aurich mit rechtssicherer Begleitung und diskreter Vermarktung.",
  }),
  createServiceJsonLd({
    path: "/immobilienpreise-aurich",
    name: "Immobilienpreise Aurich",
    serviceType: "Marktanalyse",
    description:
      "Regionale Marktanalyse und Preisorientierung für Wohnimmobilien in Aurich und Ostfriesland.",
  }),
];

const webPageJsonLd = createWebPageJsonLd({
  path: "/",
  name: HOME_TITLE,
  description: HOME_DESCRIPTION,
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/", [
  {
    name: "Startseite",
    item: "/",
  },
]);

const faqJsonLd = createFAQPageJsonLd("/", FAQ_ITEMS);

export default function HomePage() {
  return (
    <main id="main-content" className="bg-white text-[color:var(--color-graphite)]">
      <JsonLd data={siteNavigationJsonLd} />
      {serviceJsonLd.map((schema) => (
        <JsonLd key={schema["@id"]} data={schema} />
      ))}
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <HomeHero />
      <HomeLeadBlock />
      <WarumEigentuemerVerkaufenBlock />
      <RegionalMarktBlock />
      <Section9plus1 />
      <ProofCasesBlock />
      <WarumEigentuemerBeauftragenBlock />
      <WhyFrisiaBlock />
      <TestimonialsBlock />
      <StandortAurichBlock />
      <FaqBlock />
      <ClosingCta />
      <HomeClientBoot />
    </main>
  );
}
