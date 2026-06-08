import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PropertyDetailTemplate from "@/components/site/PropertyDetailTemplate";
import PropertyRecommendationRail from "@/components/site/PropertyRecommendationRail";
import { buildPageMetadata } from "@/lib/metadata";
import {
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";
import {
  getPropertyIdFromSlug,
  getImmobilienAurichListingResult,
  getPropstackBrokerById,
  getPropstackPropertyById,
  mapPropertyDetail,
  propertyHasMarketingStatus,
} from "@/lib/propstack";

export const revalidate = 120;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function loadProperty(slug: string) {
  const id = getPropertyIdFromSlug(slug);
  if (!id) return null;

  const property = await getPropstackPropertyById(id);
  if (!property || !(await propertyHasMarketingStatus(property))) {
    return null;
  }

  return property;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await loadProperty(slug);

  if (!property) {
    return buildPageMetadata({
      title: "Immobilie",
      description: "Immobiliendetailseite von Frisia Immobilien.",
      path: "/immobilien-aurich",
      robots: { index: false, follow: false },
    });
  }

  const mapped = mapPropertyDetail(property);

  return buildPageMetadata({
    title: `${mapped.title} in ${mapped.city}`,
    description:
      mapped.excerpt ||
      `Immobilie in ${mapped.city}: ${mapped.title} mit Frisia Immobilien auf einen Blick.`,
    path: `/immobilien-aurich/${mapped.slug}`,
    keywords: [
      mapped.title,
      `Immobilie ${mapped.city}`,
      `Haus kaufen ${mapped.city}`,
      `Wohnung kaufen ${mapped.city}`,
      "Frisia Immobilien",
    ],
    imagePath: mapped.imageUrl ?? undefined,
  });
}

export default async function ImmobilienAurichDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await loadProperty(slug);
  if (!property) notFound();

  const broker = await getPropstackBrokerById(property.broker_id);
  const mapped = mapPropertyDetail(property, broker);
  const relatedListing = await getImmobilienAurichListingResult();
  const relatedItems = relatedListing.items.filter((item) => item.id !== mapped.id).slice(0, 8);
  const path = `/immobilien-aurich/${mapped.slug}`;
  const canonical = absoluteUrl(path);
  const breadcrumbJsonLd = createBreadcrumbListJsonLd(path, [
    { name: "Startseite", item: "/" },
    { name: "Immobilien Aurich", item: "/immobilien-aurich" },
    { name: mapped.title, item: path },
  ]);
  const webPageJsonLd = createWebPageJsonLd({
    path,
    name: `${mapped.title} | Frisia Immobilien`,
    description: mapped.excerpt || `Immobiliendetails zu ${mapped.title} in ${mapped.city}.`,
    type: "WebPage",
    imagePath: mapped.galleryImages[0]?.url ?? mapped.imageUrl ?? undefined,
  });

  const offerJsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${canonical}#offer`,
    url: canonical,
    name: mapped.title,
    price: mapped.price ?? undefined,
    priceCurrency: mapped.price !== null ? "EUR" : undefined,
    availability: "https://schema.org/InStock",
    seller: {
      "@id": absoluteUrl("/#real-estate-agent"),
    },
    itemOffered: {
      "@type": mapped.schemaType,
      "@id": `${canonical}#property`,
      name: mapped.title,
      description: mapped.descriptionNote || mapped.excerpt || undefined,
      address:
        mapped.zipCode || mapped.city
          ? {
              "@type": "PostalAddress",
              postalCode: mapped.zipCode ?? undefined,
              addressLocality: mapped.city,
              addressRegion: "Niedersachsen",
              addressCountry: "DE",
            }
          : mapped.city || undefined,
      image: mapped.galleryImages.slice(0, 8).map((image) => image.url),
      floorSize: mapped.livingSpace
        ? {
            "@type": "QuantitativeValue",
            value: mapped.livingSpace,
            unitCode: "MTK",
          }
        : undefined,
      numberOfRooms: mapped.numberOfRooms ?? undefined,
      yearBuilt: mapped.constructionYear ?? undefined,
    },
  };

  const contactHref = `/kontakt?anliegen=immobilie&objekt=${encodeURIComponent(mapped.title)}&referenz=${mapped.id}`;

  return (
    <main className="bg-[color:var(--color-section)]">
      <Script id="immobilien-aurich-detail-schema" type="application/ld+json">
        {JSON.stringify([breadcrumbJsonLd, webPageJsonLd, offerJsonLd])}
      </Script>
      <PropertyDetailTemplate
        property={mapped}
        contactHref={contactHref}
      />
      <PropertyRecommendationRail items={relatedItems} />
    </main>
  );
}
