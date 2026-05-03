export const SITE_URL = "https://frisia-immobilien.de";

export const BRAND_NAME = "Frisia Immobilien";
export const LEGAL_NAME = "Frisia Immobilien GmbH";
export const LOGO_PATH = "/logo.svg";
export const DEFAULT_SOCIAL_IMAGE_PATH = "/images/hero/haus-verkaufen-aurich.webp";

export const EMAIL = "info@frisia-immobilien.de";
export const PHONE_E164 = "+4949419867700";
export const PHONE_HREF = `tel:${PHONE_E164}`;
export const PHONE_DISPLAY = "04941 986770-0";

export const DIRECT_CONTACT = {
  name: "Sebastian Munzig",
  role: "Frisia Immobilien GmbH",
  title:
    "Immobilienmakler (IHK) · DEKRA-zertifizierter Sachverständiger für Immobilienbewertung – D1 · Geprüfter Wirtschaftsfachwirt (IHK) · Geschäftsführender Gesellschafter",
  email: "sebastian.munzig@frisia-immobilien.de",
  phoneDisplay: PHONE_DISPLAY,
  phoneHref: PHONE_HREF,
  mobileDisplay: "0152 22100100",
  mobileHref: "tel:+4915222100100",
  imagePath: "/images/team/sebastian-munzig-profilbild.webp",
} as const;

export const ADDRESS = {
  streetAddress: "Oldersumer Straße 150",
  postalCode: "26605",
  addressLocality: "Aurich",
  addressRegion: "Niedersachsen",
  addressCountry: "DE",
} as const;

export const REGION_TEXT = "Aurich, Ostfriesland, Niedersachsen, Deutschland";

export const GEO_COORDINATES = {
  latitude: 53.4697,
  longitude: 7.4825,
} as const;

export const AREA_SERVED = [
  "Aurich",
  "Ostfriesland",
  "Emden",
  "Leer",
  "Wittmund",
  "Norden",
] as const;

export const OPENING_HOURS_SPECIFICATION = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
] as const;

export const DEFAULT_SITE_DESCRIPTION =
  "Frisia Immobilien in Aurich: strukturierte Immobilienbewertung und rechtssichere Verkaufsbegleitung im regionalen Markt in Aurich und Ostfriesland.";

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizeUrl(value: string): string {
  return /^https?:\/\//.test(value) ? value : absoluteUrl(value);
}

export function createPostalAddressJsonLd() {
  return {
    "@type": "PostalAddress",
    ...ADDRESS,
  };
}

export function createGeoJsonLd() {
  return {
    "@type": "GeoCoordinates",
    latitude: GEO_COORDINATES.latitude,
    longitude: GEO_COORDINATES.longitude,
  };
}

export function createImageObjectJsonLd(path = DEFAULT_SOCIAL_IMAGE_PATH, caption = BRAND_NAME) {
  return {
    "@type": "ImageObject",
    url: normalizeUrl(path),
    caption,
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: BRAND_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    description: DEFAULT_SITE_DESCRIPTION,
    email: EMAIL,
    telephone: PHONE_E164,
    logo: createImageObjectJsonLd(LOGO_PATH, BRAND_NAME),
    image: createImageObjectJsonLd(),
    address: createPostalAddressJsonLd(),
    areaServed: [...AREA_SERVED],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: PHONE_E164,
        email: EMAIL,
        availableLanguage: ["de"],
        areaServed: "DE",
      },
    ],
  };
}

export function createWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: SITE_URL,
    name: BRAND_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    inLanguage: "de-DE",
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}

export function createPlaceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": absoluteUrl("/#place"),
    name: LEGAL_NAME,
    url: SITE_URL,
    address: createPostalAddressJsonLd(),
    geo: createGeoJsonLd(),
  };
}

export function createLocalBusinessJsonLd(overrides: Record<string, unknown> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": absoluteUrl("/#local-business"),
    name: BRAND_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    description: DEFAULT_SITE_DESCRIPTION,
    email: EMAIL,
    telephone: PHONE_E164,
    logo: createImageObjectJsonLd(LOGO_PATH, BRAND_NAME),
    image: createImageObjectJsonLd(),
    address: createPostalAddressJsonLd(),
    geo: createGeoJsonLd(),
    location: {
      "@id": absoluteUrl("/#place"),
    },
    areaServed: [...AREA_SERVED],
    openingHoursSpecification: [...OPENING_HOURS_SPECIFICATION],
    parentOrganization: {
      "@id": absoluteUrl("/#organization"),
    },
    ...overrides,
  };
}

export function createRealEstateAgentJsonLd(overrides: Record<string, unknown> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": absoluteUrl("/#real-estate-agent"),
    name: BRAND_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    description: DEFAULT_SITE_DESCRIPTION,
    email: EMAIL,
    telephone: PHONE_E164,
    logo: createImageObjectJsonLd(LOGO_PATH, BRAND_NAME),
    image: createImageObjectJsonLd(),
    address: createPostalAddressJsonLd(),
    geo: createGeoJsonLd(),
    location: {
      "@id": absoluteUrl("/#place"),
    },
    areaServed: [...AREA_SERVED],
    openingHoursSpecification: [...OPENING_HOURS_SPECIFICATION],
    parentOrganization: {
      "@id": absoluteUrl("/#organization"),
    },
    slogan: "Ja. So machen wir das.",
    founder: {
      "@type": "Person",
      name: "Sebastian Munzig",
    },
    knowsAbout: [
      "Immobilienbewertung Aurich",
      "Immobilienmakler Aurich",
      "Haus verkaufen Aurich",
      "Preisstrategie",
      "Diskreter Immobilienverkauf",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: PHONE_E164,
        email: EMAIL,
        areaServed: "DE",
        availableLanguage: ["de"],
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dienstleistungen",
      itemListElement: [
        {
          "@type": "Offer",
          url: absoluteUrl("/immobilienbewertung-aurich"),
          itemOffered: { "@type": "Service", name: "Immobilienbewertung" },
        },
        {
          "@type": "Offer",
          url: absoluteUrl("/haus-verkaufen-aurich"),
          itemOffered: { "@type": "Service", name: "Hausverkauf" },
        },
        {
          "@type": "Offer",
          url: absoluteUrl("/immobilienpreise-aurich"),
          itemOffered: { "@type": "Service", name: "Marktanalyse" },
        },
      ],
    },
    ...overrides,
  };
}

type BreadcrumbItem = {
  name: string;
  item: string;
};

export function createBreadcrumbListJsonLd(path: string, items: BreadcrumbItem[]) {
  const canonical = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: normalizeUrl(item.item),
    })),
  };
}

type WebPageJsonLdOptions = {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "CollectionPage" | "ContactPage" | "AboutPage";
  aboutId?: string;
  imagePath?: string;
};

export function createWebPageJsonLd({
  path,
  name,
  description,
  type = "WebPage",
  aboutId = absoluteUrl("/#real-estate-agent"),
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
}: WebPageJsonLdOptions) {
  const canonical = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${canonical}#webpage`,
    url: canonical,
    name,
    description,
    inLanguage: "de-DE",
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
    about: {
      "@id": aboutId,
    },
    breadcrumb: {
      "@id": `${canonical}#breadcrumb`,
    },
    primaryImageOfPage: createImageObjectJsonLd(imagePath, name),
  };
}

type ArticleJsonLdOptions = {
  path: string;
  headline: string;
  description: string;
  imagePath?: string;
  datePublished?: string;
  dateModified?: string;
};

export function createArticleJsonLd({
  path,
  headline,
  description,
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
  datePublished = "2026-04-27",
  dateModified = "2026-04-27",
}: ArticleJsonLdOptions) {
  const canonical = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    mainEntityOfPage: {
      "@id": `${canonical}#webpage`,
    },
    headline,
    description,
    image: createImageObjectJsonLd(imagePath, headline),
    datePublished,
    dateModified,
    inLanguage: "de-DE",
    author: {
      "@id": absoluteUrl("/#organization"),
    },
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}

type JobPostingJsonLdOptions = {
  path: string;
  title: string;
  description: string;
  employmentType: string | string[];
  datePosted?: string;
};

export function createJobPostingJsonLd({
  path,
  title,
  description,
  employmentType,
  datePosted = "2026-04-27",
}: JobPostingJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "@id": `${absoluteUrl(path)}#job-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title,
    description,
    datePosted,
    employmentType,
    hiringOrganization: {
      "@id": absoluteUrl("/#organization"),
    },
    jobLocation: {
      "@type": "Place",
      address: createPostalAddressJsonLd(),
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Deutschland",
    },
    directApply: true,
    industry: "Immobilien",
  };
}

type FaqItem = {
  question: string;
  answer: string;
};

export function createFAQPageJsonLd(path: string, items: readonly FaqItem[]) {
  const canonical = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

type ServiceJsonLdOptions = {
  path: string;
  name: string;
  serviceType: string;
  description: string;
  areaServed?: readonly string[] | string[];
  providerId?: string;
};

export function createServiceJsonLd({
  path,
  name,
  serviceType,
  description,
  areaServed = [...AREA_SERVED],
  providerId = absoluteUrl("/#real-estate-agent"),
}: ServiceJsonLdOptions) {
  const canonical = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    name,
    serviceType,
    description,
    url: canonical,
    areaServed: [...areaServed],
    provider: {
      "@id": providerId,
    },
  };
}
