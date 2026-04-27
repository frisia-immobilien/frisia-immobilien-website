import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JsonLd from "@/components/seo/JsonLd";
import InternalLinks from "@/components/seo/InternalLinks";
import LocationFAQ from "@/components/seo/LocationFAQ";
import LocationHero from "@/components/seo/LocationHero";
import LocationText from "@/components/seo/LocationText";
import MarketStats from "@/components/seo/MarketStats";
import SeoCTA from "@/components/seo/SeoCTA";
import BrokerLocationTemplate from "@/components/seo/BrokerLocationTemplate";
import HouseBuyingLocationTemplate from "@/components/seo/HouseBuyingLocationTemplate";
import HouseSellingLocationTemplate from "@/components/seo/HouseSellingLocationTemplate";
import PriceLocationTemplate from "@/components/seo/PriceLocationTemplate";
import PropertySellingLocationTemplate from "@/components/seo/PropertySellingLocationTemplate";
import RealEstateListingsLocationTemplate from "@/components/seo/RealEstateListingsLocationTemplate";
import ValuationLocationTemplate from "@/components/seo/ValuationLocationTemplate";
import PriceHistoryChart from "@/components/charts/PriceHistoryChart";
import { getLocationPageData } from "@/lib/seo/getLocationPageData";
import { buildLocationMetadata } from "@/lib/seo/metadata";
import { buildLocationSchemas } from "@/lib/seo/schema";
import { findTemplateBySlug } from "@/lib/seo/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!findTemplateBySlug(slug)) return {};
  const data = await getLocationPageData(slug);
  return buildLocationMetadata(data);
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  if (!findTemplateBySlug(slug)) notFound();

  const data = await getLocationPageData(slug);
  const schemas = buildLocationSchemas(data);

  return (
    <main id="main-content" className="bg-white">
      {schemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
      {data.template.pageType === "immobilienbewertung" ? (
        <>
          <ValuationLocationTemplate data={data} />
          {!data.indexable ? (
            <p className="sr-only">Diese Seite ist auf noindex gesetzt: {data.noindexReason}</p>
          ) : null}
        </>
      ) : data.template.pageType === "haus_verkaufen" ? (
        <>
          <HouseSellingLocationTemplate data={data} />
          {!data.indexable ? (
            <p className="sr-only">Diese Seite ist auf noindex gesetzt: {data.noindexReason}</p>
          ) : null}
        </>
      ) : data.template.pageType === "immobilie_verkaufen" ? (
        <>
          <PropertySellingLocationTemplate data={data} />
          {!data.indexable ? (
            <p className="sr-only">Diese Seite ist auf noindex gesetzt: {data.noindexReason}</p>
          ) : null}
        </>
      ) : data.template.pageType === "immobilienmakler" ? (
        <>
          <BrokerLocationTemplate data={data} />
          {!data.indexable ? (
            <p className="sr-only">Diese Seite ist auf noindex gesetzt: {data.noindexReason}</p>
          ) : null}
        </>
      ) : data.template.pageType === "immobilienpreise" ? (
        <>
          <PriceLocationTemplate data={data} />
          {!data.indexable ? (
            <p className="sr-only">Diese Seite ist auf noindex gesetzt: {data.noindexReason}</p>
          ) : null}
        </>
      ) : data.template.pageType === "haus_kaufen" ? (
        <>
          <HouseBuyingLocationTemplate data={data} />
          {!data.indexable ? (
            <p className="sr-only">Diese Seite ist auf noindex gesetzt: {data.noindexReason}</p>
          ) : null}
        </>
      ) : data.template.pageType === "immobilien" ? (
        <>
          <RealEstateListingsLocationTemplate data={data} />
          {!data.indexable ? (
            <p className="sr-only">Diese Seite ist auf noindex gesetzt: {data.noindexReason}</p>
          ) : null}
        </>
      ) : (
        <>
      <LocationHero data={data} />
      <MarketStats houseMarket={data.houseMarket} apartmentMarket={data.apartmentMarket} />
      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 md:py-14">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
          Preisentwicklung
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-[color:var(--color-brass)]/25 bg-white p-5">
            <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">Hauspreise</h3>
            <div className="mt-4">
              <PriceHistoryChart title={`Hauspreise ${data.location.location_label}`} rows={data.houseHistory} />
            </div>
          </article>
          <article className="rounded-lg border border-[color:var(--color-brass)]/25 bg-white p-5">
            <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">Wohnungspreise</h3>
            <div className="mt-4">
              <PriceHistoryChart title={`Wohnungspreise ${data.location.location_label}`} rows={data.apartmentHistory} />
            </div>
          </article>
        </div>
      </section>
      <LocationText data={data} />
      <SeoCTA />
      <LocationFAQ items={data.content.faq} />
      {!data.indexable ? (
        <p className="sr-only">Diese Seite ist auf noindex gesetzt: {data.noindexReason}</p>
      ) : null}
        </>
      )}
      <InternalLinks data={data} />
    </main>
  );
}
