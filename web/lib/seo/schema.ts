import {
  BRAND_NAME,
  SITE_URL,
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createFAQPageJsonLd,
  createImageObjectJsonLd,
  createLocalBusinessJsonLd,
  createPlaceJsonLd,
  createRealEstateAgentJsonLd,
  createServiceJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { formatLocationLabel } from "@/lib/seo/locationDisplay";
import type { MarketDataRow } from "@/lib/types/leadgen";

function marketDatasetDescription(locationName: string) {
  return `Dieser Datensatz enthält regionale Marktdaten zu Immobilienpreisen in ${locationName} und der Umgebung. Er umfasst Auswertungen zu Kaufpreisen, Quadratmeterpreisen, Preisentwicklung und regionaler Markteinordnung für Häuser, Wohnungen und Grundstücke. Die Daten dienen der transparenten Einschätzung des Immobilienmarktes und unterstützen Eigentümer bei einer fundierten ersten Orientierung vor dem Verkauf.`;
}

function datasetOrganization() {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: BRAND_NAME,
    url: SITE_URL,
  };
}

function marketDataset(data: LocationPageData, market: MarketDataRow, name: string) {
  const locationName = formatLocationLabel(data.location.location_label);
  const pageUrl = absoluteUrl(data.publicPath);

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset-${market.object_type}`,
    name,
    description: marketDatasetDescription(locationName),
    url: pageUrl,
    license: absoluteUrl("/datenschutz"),
    creator: datasetOrganization(),
    publisher: datasetOrganization(),
    spatialCoverage: {
      "@type": "Place",
      name: locationName,
      geo:
        data.location.lat && data.location.lng
          ? {
              "@type": "GeoCoordinates",
              latitude: data.location.lat,
              longitude: data.location.lng,
            }
          : undefined,
    },
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Medianpreis pro Quadratmeter",
        value: market.median_preis_eur_m2,
        unitText: "EUR/m²",
      },
      {
        "@type": "PropertyValue",
        name: "Verkäufe",
        value: market.verkaeufe_anzahl,
      },
    ],
  };
}

export function buildLocationSchemas(data: LocationPageData) {
  const breadcrumb = createBreadcrumbListJsonLd(data.publicPath, [
    { name: "Startseite", item: SITE_URL },
    { name: "Regionen Ostfriesland", item: `${SITE_URL}/regionen-ostfriesland` },
    { name: data.content.h1, item: absoluteUrl(data.publicPath) },
  ]);

  const webPage = createWebPageJsonLd({
    path: data.publicPath,
    name: data.content.h1,
    description: data.content.metaDescription,
    imagePath: data.image.src,
  });

  const place = {
    ...createPlaceJsonLd(),
    "@id": `${absoluteUrl(data.publicPath)}#place`,
    name: data.location.location_label,
    geo:
      data.location.lat && data.location.lng
        ? {
            "@type": "GeoCoordinates",
            latitude: data.location.lat,
            longitude: data.location.lng,
          }
        : undefined,
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(data.publicPath)}#service`,
    name: data.content.h1,
    serviceType: data.template.label,
    provider: { "@id": absoluteUrl("/#real-estate-agent") },
    areaServed: {
      "@type": "Place",
      name: data.location.location_label,
    },
  };

  return [
    breadcrumb,
    webPage,
    place,
    service,
    createImageObjectJsonLd(data.image.src, data.image.alt),
    data.content.faq.length > 0 ? createFAQPageJsonLd(data.publicPath, data.content.faq) : null,
    data.houseMarket ? marketDataset(data, data.houseMarket, `Hauspreise ${data.location.location_label}`) : null,
    data.apartmentMarket
      ? marketDataset(data, data.apartmentMarket, `Wohnungspreise ${data.location.location_label}`)
      : null,
  ].filter(Boolean);
}

type RegionHubSchemaItem = {
  name: string;
  url: string;
  locationType?: string | null;
  landkreis?: string | null;
  lat?: number | null;
  lng?: number | null;
};

const REGION_HUB_DESCRIPTION =
  "Regionen-Hub für Immobilienpreise, Immobilienbewertung, Immobilienverkauf und Immobilienmakler in Ostfriesland.";

export function buildRegionHubSchemas(items: RegionHubSchemaItem[]) {
  const canonical = `${SITE_URL}/regionen-ostfriesland`;
  const itemList = items.slice(0, 200).map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: item.url,
    item: {
      "@type": "Place",
      "@id": `${item.url}#place`,
      name: item.name,
      url: item.url,
      containedInPlace: item.landkreis
        ? {
            "@type": "AdministrativeArea",
            name: item.landkreis,
          }
        : {
            "@type": "AdministrativeArea",
            name: "Ostfriesland",
          },
      geo:
        item.lat && item.lng
          ? {
              "@type": "GeoCoordinates",
              latitude: item.lat,
              longitude: item.lng,
            }
          : undefined,
      additionalType: item.locationType ? `${SITE_URL}/location-type/${item.locationType}` : undefined,
    },
  }));

  return [
    createRealEstateAgentJsonLd({
      "@id": `${SITE_URL}/regionen-ostfriesland#real-estate-agent`,
      areaServed: [
        {
          "@type": "AdministrativeArea",
          name: "Ostfriesland",
        },
        {
          "@type": "City",
          name: "Aurich",
        },
        {
          "@type": "City",
          name: "Emden",
        },
        {
          "@type": "AdministrativeArea",
          name: "Landkreis Leer",
        },
        {
          "@type": "AdministrativeArea",
          name: "Landkreis Wittmund",
        },
        {
          "@type": "City",
          name: "Wilhelmshaven",
        },
        {
          "@type": "AdministrativeArea",
          name: "Landkreis Friesland",
        },
      ],
      knowsAbout: [
        "Immobilienpreise Ostfriesland",
        "Immobilienbewertung Ostfriesland",
        "Immobilienmakler Ostfriesland",
        "Haus verkaufen Ostfriesland",
        "Regionale Immobilienmärkte",
      ],
    }),
    createLocalBusinessJsonLd({
      "@id": `${SITE_URL}/regionen-ostfriesland#local-business`,
      areaServed: [
        "Ostfriesland",
        "Landkreis Aurich",
        "Stadt Emden",
        "Landkreis Leer",
        "Landkreis Wittmund",
        "Stadt Wilhelmshaven",
        "Landkreis Friesland",
      ],
    }),
    createBreadcrumbListJsonLd("/regionen-ostfriesland", [
      { name: "Startseite", item: SITE_URL },
      { name: "Regionen Ostfriesland", item: canonical },
    ]),
    createWebPageJsonLd({
      path: "/regionen-ostfriesland",
      name: "Immobilienpreise und Immobilienmakler in Ostfriesland",
      description: REGION_HUB_DESCRIPTION,
      type: "CollectionPage",
      aboutId: `${SITE_URL}/regionen-ostfriesland#real-estate-agent`,
    }),
    createServiceJsonLd({
      path: "/regionen-ostfriesland",
      name: "Regionale Immobilienbewertung und Verkaufseinordnung in Ostfriesland",
      serviceType: "Immobilienbewertung und Immobilienverkauf",
      description: REGION_HUB_DESCRIPTION,
      areaServed: [
        "Ostfriesland",
        "Aurich",
        "Emden",
        "Leer",
        "Wittmund",
        "Wilhelmshaven",
        "Friesland",
      ],
      providerId: `${SITE_URL}/regionen-ostfriesland#real-estate-agent`,
    }),
    {
      "@context": "https://schema.org",
      "@type": "Place",
      "@id": `${canonical}#ostfriesland`,
      name: "Ostfriesland",
      url: canonical,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Niedersachsen",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${canonical}#itemlist`,
      name: "Regionen, Städte und Ortsteile in Ostfriesland",
      description: "Interne Einstiege zu lokalen Immobilienseiten von Frisia Immobilien in Ostfriesland.",
      numberOfItems: itemList.length,
      itemListElement: itemList,
    },
  ];
}
