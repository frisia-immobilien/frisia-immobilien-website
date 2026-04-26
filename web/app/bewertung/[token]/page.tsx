import type { Metadata } from "next";
import Link from "next/link";

import LeadValuationTemplate from "@/components/immobilienbewertung/valuation/LeadValuationTemplate";
import { getLeadByToken } from "@/lib/immobilienbewertung/lead-records";
import {
  formatLeadLocationLabel,
  getLeadgenConditionLabel,
  getLeadgenExtraLabel,
  getLeadgenMarketScopeLabel,
  getLeadgenPropertyTypeLabel,
  getLeadgenQualityLabel,
} from "@/lib/immobilienbewertung/presentation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ihre marktbasierte Einordnung",
  description: "Persönliche marktbasierte Einordnung Ihrer Immobilie.",
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

type PageParams = {
  token: string;
};

function parseExtras(value: string | null | undefined) {
  if (!value) return [] as string[];

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function renderShell(input: {
  title: string;
  text: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f7f4ed_100%)]">
      <section className="mx-auto max-w-[920px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="rounded-[2.3rem] border border-[color:var(--color-sand)]/70 bg-white p-8 shadow-[0_35px_100px_-70px_rgba(27,48,64,0.38)] sm:p-10">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
            Immobilienbewertung
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-[2.4rem] leading-[0.98] tracking-[-0.035em] text-[color:var(--color-navy)] sm:text-[3.3rem]">
            {input.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[1.02rem] leading-[1.85] text-[color:var(--color-graphite)]">
            {input.text}
          </p>

          <div className="mt-8">
            <Link
              href={input.ctaHref}
              className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)]"
            >
              {input.ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  try {
    const { token } = await params;

    if (!token) {
      return renderShell({
        title: "Ungültiger Link",
        text: "Der Bewertungslink ist unvollständig oder nicht mehr gültig.",
        ctaHref: "/immobilienbewertung-aurich",
        ctaLabel: "Neue Bewertung starten",
      });
    }

    const lead = await getLeadByToken(token);

    if (!lead) {
      return renderShell({
        title: "Dieser Bewertungslink ist nicht mehr verfügbar",
        text: "Bitte starten Sie eine neue Bewertung oder melden Sie sich direkt bei uns. Wir ordnen Ihre Immobilie gern persönlich ein.",
        ctaHref: "/immobilienbewertung-aurich",
        ctaLabel: "Neue Bewertung starten",
      });
    }

    const expiresAt = new Date(lead.expires_at);
    if (new Date() > expiresAt) {
      return renderShell({
        title: "Ihre Bewertung ist abgelaufen",
        text: "Der Link war aus Sicherheitsgründen zeitlich begrenzt. Starten Sie die Bewertung einfach neu oder fordern Sie direkt eine persönliche Einordnung an.",
        ctaHref: "/immobilienbewertung-aurich",
        ctaLabel: "Neue Bewertung starten",
      });
    }

    const locationLabel =
      lead.location_text ||
      formatLeadLocationLabel({
        street: lead.street,
        houseNumber: lead.house_number,
        postalCode: lead.plz,
        city: lead.city,
        district: lead.district,
      });

    return (
      <LeadValuationTemplate
        token={token}
        expiresAt={lead.expires_at}
        email={lead.email}
        salutation={lead.salutation}
        firstName={lead.first_name}
        lastName={lead.last_name}
        propertyTypeLabel={getLeadgenPropertyTypeLabel(lead.type, lead.house_type)}
        locationLabel={locationLabel}
        livingArea={lead.living_area}
        landArea={lead.land_area}
        rooms={lead.rooms}
        yearBuilt={lead.year_built}
        energyClass={lead.energy_class}
        conditionLabel={getLeadgenConditionLabel(lead.condition)}
        qualityLabel={getLeadgenQualityLabel(lead.quality)}
        extrasLabels={parseExtras(lead.extras).map(getLeadgenExtraLabel)}
        valueMid={lead.value_mid}
        valueMin={lead.value_min}
        valueMax={lead.value_max}
        marketLocationLabel={lead.market_location_label}
        marketScopeLabel={getLeadgenMarketScopeLabel(lead.market_scope)}
        marketMedianPerSqm={lead.market_median_preis_eur_m2}
        marketSalesCount={lead.market_verkaeufe_anzahl}
        marketDays={lead.market_tage_am_markt}
        marketDeltaPercent={lead.market_delta_vorjahr_median_prozent}
      />
    );
  } catch (error) {
    return renderShell({
      title: "Die Bewertung konnte gerade nicht geladen werden",
      text:
        error instanceof Error
          ? error.message
          : "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
      ctaHref: "/kontakt",
      ctaLabel: "Kontakt aufnehmen",
    });
  }
}
