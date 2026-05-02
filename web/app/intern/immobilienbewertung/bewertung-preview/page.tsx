import type { Metadata } from "next";
import Link from "next/link";

import LeadValuationTemplate from "@/components/immobilienbewertung/valuation/LeadValuationTemplate";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Interne Preview: Bewertung",
  description:
    "Interne, nicht indexierbare Vorschau der Immobilienbewertungs-Landingpage mit festen Beispieldaten.",
  alternates: {
    canonical: absoluteUrl("/intern/immobilienbewertung/bewertung-preview"),
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const preview = {
  token: "preview-only",
  expiresAt: "2026-05-15T12:00:00.000Z",
  email: "max.mustermann@example.com",
  salutation: "mrs",
  firstName: "Max",
  lastName: "Mustermann",
  propertyTypeLabel: "Bungalow",
  locationLabel: "Musterstraße 12, 26605 Aurich",
  livingArea: 148,
  landArea: 720,
  rooms: 5,
  yearBuilt: 1998,
  energyClass: "C",
  conditionLabel: "Sehr gepflegt",
  qualityLabel: "Gehoben",
  extrasLabels: ["Garten", "Terrasse", "Gäste-WC"],
  valueMid: 342000,
  valueMin: 310000,
  valueMax: 375000,
  marketLocationLabel: "Aurich-Haxtum",
  marketScopeLabel: "Ortsteil Haxtum",
  marketMedianPerSqm: 2310,
  marketSalesCount: 19,
  marketDays: 92,
  marketDeltaPercent: 4.2,
  latitude: 53.4626,
  longitude: 7.5004,
} as const;

export default function Page() {
  return (
    <div className="bg-[linear-gradient(180deg,#f3f6f8_0%,#ffffff_20%)]">
      <style>{'footer[data-site-footer="true"]{display:none!important;}'}</style>
      <section className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-8 lg:px-10">
        <div className="rounded-[1.7rem] border border-dashed border-[color:var(--color-brackish)]/28 bg-white/90 px-5 py-4 text-sm leading-[1.8] text-[color:var(--color-graphite)] shadow-[0_20px_60px_-50px_rgba(27,48,64,0.35)] sm:px-6">
          <div className="font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
            Interne Preview
          </div>
          <p className="mt-2">
            Diese Seite rendert das Bewertungstemplate mit festen Beispieldaten. Es gibt hier keinen Mailversand, kein Token-Tracking und keinen
            Propstack-Writeback.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/immobilienbewertung-aurich" className="font-semibold text-[color:var(--color-navy)] transition hover:text-[color:var(--color-brackish)]">
              Immobilienbewertung öffnen
            </Link>
            <Link href="/intern/immobilienbewertung/email-preview" className="font-semibold text-[color:var(--color-navy)] transition hover:text-[color:var(--color-brackish)]">
              E-Mail-Preview öffnen
            </Link>
            <span className="text-[color:var(--color-graphite)]/70">
              Route: <code>/intern/immobilienbewertung/bewertung-preview</code>
            </span>
          </div>
        </div>
      </section>

      <LeadValuationTemplate
        token={preview.token}
        expiresAt={preview.expiresAt}
        email={preview.email}
        phone="04941 123456"
        enableTracking={false}
        salutation={preview.salutation}
        firstName={preview.firstName}
        lastName={preview.lastName}
        propertyTypeLabel={preview.propertyTypeLabel}
        locationLabel={preview.locationLabel}
        livingArea={preview.livingArea}
        landArea={preview.landArea}
        rooms={preview.rooms}
        yearBuilt={preview.yearBuilt}
        energyClass={preview.energyClass}
        conditionLabel={preview.conditionLabel}
        qualityLabel={preview.qualityLabel}
        extrasLabels={[...preview.extrasLabels]}
        otherExtrasValueEur={15000}
        valueMid={preview.valueMid}
        valueMin={preview.valueMin}
        valueMax={preview.valueMax}
        marketLocationLabel={preview.marketLocationLabel}
        marketScopeLabel={preview.marketScopeLabel}
        marketMedianPerSqm={preview.marketMedianPerSqm}
        marketSalesCount={preview.marketSalesCount}
        marketDays={preview.marketDays}
        marketDeltaPercent={preview.marketDeltaPercent}
        latitude={preview.latitude}
        longitude={preview.longitude}
      />
    </div>
  );
}
