import type { Metadata } from "next";
import Link from "next/link";

import LeadValuationTemplate from "@/components/immobilienbewertung/valuation/LeadValuationTemplate";
import HeroDivider from "@/components/site/HeroDivider";
import { getLeadByToken } from "@/lib/immobilienbewertung/lead-records";
import { resolveLandValue } from "@/lib/land/resolveLandValue";
import { getLeadReportByToken, markReportOpened } from "@/lib/leadgen/repository";
import {
  formatLeadLocationLabel,
  getLeadgenConditionLabel,
  getLeadgenExtraLabel,
  getLeadgenMarketScopeLabel,
  getLeadgenPropertyTypeLabel,
  getLeadgenQualityLabel,
} from "@/lib/immobilienbewertung/presentation";
import { absoluteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageParams = {
  token: string;
};

export function buildLeadResultMetadata(path: string): Metadata {
  return {
    title: "Ihre Marktpreiseinschätzung",
    description: "Persönliche Marktpreiseinschätzung Ihrer Immobilie.",
    alternates: {
      canonical: absoluteUrl(path),
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
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { token } = await params;
  return buildLeadResultMetadata(`/bewertung/${token}`);
}

type ReportResult = NonNullable<Awaited<ReturnType<typeof getLeadReportByToken>>>;
type LegacyLeadResult = NonNullable<Awaited<ReturnType<typeof getLeadByToken>>>;
type ShellState = {
  type: "shell";
  title: string;
  text: string;
  ctaHref: string;
  ctaLabel: string;
};
type ReportState = {
  type: "report";
  token: string;
  report: ReportResult;
};
type LegacyLeadState = {
  type: "legacyLead";
  token: string;
  lead: LegacyLeadResult;
  locationLabel: string;
};
type PageState = ShellState | ReportState | LegacyLeadState;

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

function reportAddressLabel(report: ReportResult) {
  const lead = report.lead_request;
  return [
    [lead.street, lead.house_number].filter(Boolean).join(" "),
    [lead.postal_code, lead.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function reportObjectTypeLabel(value: string | null | undefined) {
  if (value === "haus") return "Haus";
  if (value === "wohnung") return "Wohnung";
  if (value === "grundstueck") return "Grundstück";
  if (value === "gewerbe") return "Gewerbe";
  return value || "Immobilie";
}

function reportValueMid(report: ReportResult) {
  if (typeof report.adjusted_value === "number") return report.adjusted_value;
  if (typeof report.range_min === "number" && typeof report.range_max === "number") {
    return Math.round((report.range_min + report.range_max) / 2);
  }
  return null;
}

function toFiniteNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function reportMarketPricePerSqm(report: ReportResult) {
  const market = report.market_data;
  return toFiniteNumber(market?.median_preis_eur_m2) ?? toFiniteNumber(market?.durchschnitt_preis_eur_m2);
}

function reportMarketPriceBasisLabel(report: ReportResult) {
  const market = report.market_data;
  if (toFiniteNumber(market?.median_preis_eur_m2) !== null) return "Medianwert";
  if (toFiniteNumber(market?.durchschnitt_preis_eur_m2) !== null) return "Durchschnittswert";
  return null;
}

function landValueSourceLabel(source: string | null | undefined) {
  const normalized = String(source ?? "").toLowerCase();
  if (normalized.includes("niedersachsen")) return "Quelle: BORIS Niedersachsen (LGLN)";
  if (normalized.includes("boris")) return "Quelle: BORIS Bodenrichtwert";
  if (normalized.includes("cache")) return "Quelle: BORIS Bodenrichtwert";
  return "Quelle: BORIS Bodenrichtwert";
}

function estimatedBodenrichtwertFromReport(report: ReportResult) {
  const landArea = toFiniteNumber(report.lead_request.plot_area);
  const baseValue = toFiniteNumber(report.base_value);
  if (!landArea || landArea <= 0 || !baseValue) return null;
  return baseValue / landArea;
}

async function reportLandBodenrichtwert(report: ReportResult) {
  const lead = report.lead_request;
  if (lead.object_type !== "grundstueck") return { value: null, sourceLabel: null };

  const plotArea = toFiniteNumber(lead.plot_area);
  if (!plotArea || plotArea <= 0) return { value: null, sourceLabel: null };

  try {
    const resolved = await resolveLandValue({
      street: lead.street,
      house_number: lead.house_number,
      postal_code: lead.postal_code,
      city: lead.city,
      district: lead.district,
      landkreis: lead.landkreis,
      lat: lead.lat,
      lng: lead.lng,
      plot_area: plotArea,
      nutzungsart: lead.sub_type,
      erschliessung: lead.condition,
    });

    if (resolved?.bodenrichtwert_eur_m2) {
      return {
        value: resolved.bodenrichtwert_eur_m2,
        sourceLabel: landValueSourceLabel(resolved.source),
      };
    }
  } catch {
    // Die Ergebnisseite soll auch dann laden, wenn BORIS kurzfristig nicht erreichbar ist.
  }

  const estimated = estimatedBodenrichtwertFromReport(report);
  return {
    value: estimated,
    sourceLabel: estimated ? "Quelle: BORIS Bodenrichtwert, aus Bewertungsbasis abgeleitet" : null,
  };
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
          <HeroDivider />
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
  let state: PageState;

  try {
    const { token } = await params;

    if (!token) {
      state = {
        type: "shell",
        title: "Ungültiger Link",
        text: "Der Bewertungslink ist unvollständig oder nicht mehr gültig.",
        ctaHref: "/immobilienbewertung",
        ctaLabel: "Neue Bewertung starten",
      };
    } else {
      const report = await getLeadReportByToken(token);

      if (report) {
        const expiresAt = new Date(report.expires_at);
        if (new Date() > expiresAt || report.report_status !== "active") {
          state = {
            type: "shell",
            title: "Diese Einschätzung ist nicht mehr abrufbar",
            text:
              "Diese Einschätzung ist nicht mehr abrufbar. Fordere bitte eine neue Marktpreiseinschätzung an.",
            ctaHref: "/immobilienbewertung",
            ctaLabel: "Neue Bewertung starten",
          };
        } else {
          await markReportOpened(report.id, report.lead_request_id);
          state = { type: "report", token, report };
        }
      } else {
        const lead = await getLeadByToken(token);

        if (!lead) {
          state = {
            type: "shell",
            title: "Dieser Bewertungslink ist nicht mehr verfügbar",
            text: "Bitte starten Sie eine neue Bewertung oder melden Sie sich direkt bei uns. Wir ordnen Ihre Immobilie gern persönlich ein.",
            ctaHref: "/immobilienbewertung",
            ctaLabel: "Neue Bewertung starten",
          };
        } else {
          const expiresAt = new Date(lead.expires_at);
          if (new Date() > expiresAt) {
            state = {
              type: "shell",
              title: "Ihre Bewertung ist abgelaufen",
              text: "Der Link war aus Sicherheitsgründen zeitlich begrenzt. Starten Sie die Bewertung einfach neu oder fordern Sie direkt eine persönliche Einordnung an.",
              ctaHref: "/immobilienbewertung",
              ctaLabel: "Neue Bewertung starten",
            };
          } else {
            const locationLabel =
              lead.location_text ||
              formatLeadLocationLabel({
                street: lead.street,
                houseNumber: lead.house_number,
                postalCode: lead.plz,
                city: lead.city,
                district: lead.district,
              });

            state = {
              type: "legacyLead",
              token,
              lead,
              locationLabel,
            };
          }
        }
      }
    }
  } catch (error) {
    state = {
      type: "shell",
      title: "Die Bewertung konnte gerade nicht geladen werden",
      text:
        error instanceof Error
          ? error.message
          : "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
      ctaHref: "/kontakt",
      ctaLabel: "Kontakt aufnehmen",
    };
  }

  if (state.type === "shell") {
    return renderShell(state);
  }

  if (state.type === "report") {
    const lead = state.report.lead_request;
    const market = state.report.market_data;
    const landBodenrichtwert = await reportLandBodenrichtwert(state.report);
    return (
      <LeadValuationTemplate
        token={state.token}
        expiresAt={state.report.expires_at}
        email={lead.email ?? ""}
        phone={lead.phone}
        enableTracking={false}
        resultTrackingEnabled
        firstName={lead.firstname}
        lastName={lead.lastname}
        propertyTypeLabel={reportObjectTypeLabel(lead.object_type)}
        locationLabel={reportAddressLabel(state.report) || lead.city || "Adresse nicht angegeben"}
        livingArea={lead.living_area}
        landArea={lead.plot_area}
        rooms={lead.rooms}
        yearBuilt={lead.construction_year}
        energyClass={lead.energy_class}
        conditionLabel={lead.condition}
        qualityLabel={lead.equipment}
        landSubTypeLabel={lead.sub_type}
        landBodenrichtwertPerSqm={landBodenrichtwert.value}
        landBodenrichtwertSourceLabel={landBodenrichtwert.sourceLabel}
        extrasLabels={[]}
        otherExtrasValueEur={lead.other_extras_value_eur}
        valueMid={reportValueMid(state.report)}
        valueMin={state.report.range_min}
        valueMax={state.report.range_max}
        marketLocationLabel={market?.location_label ?? lead.city}
        marketScopeLabel={state.report.market_level_used}
        marketMedianPerSqm={reportMarketPricePerSqm(state.report)}
        marketPriceBasisLabel={reportMarketPriceBasisLabel(state.report)}
        marketSalesCount={market?.verkaeufe_anzahl ?? null}
        marketDays={market?.tage_am_markt ?? null}
        marketDeltaPercent={market?.delta_vorjahr_median_prozent ?? null}
        latitude={lead.lat}
        longitude={lead.lng}
      />
    );
  }

  return (
    <LeadValuationTemplate
      token={state.token}
      expiresAt={state.lead.expires_at}
      email={state.lead.email}
      phone={state.lead.phone}
      salutation={state.lead.salutation}
      firstName={state.lead.first_name}
      lastName={state.lead.last_name}
      propertyTypeLabel={getLeadgenPropertyTypeLabel(state.lead.type, state.lead.house_type)}
      locationLabel={state.locationLabel}
      livingArea={state.lead.living_area}
      landArea={state.lead.land_area}
      rooms={state.lead.rooms}
      yearBuilt={state.lead.year_built}
      energyClass={state.lead.energy_class}
      conditionLabel={getLeadgenConditionLabel(state.lead.condition)}
      qualityLabel={getLeadgenQualityLabel(state.lead.quality)}
      extrasLabels={parseExtras(state.lead.extras).map(getLeadgenExtraLabel)}
      otherExtrasValueEur={state.lead.other_extras_value_eur}
      valueMid={state.lead.value_mid}
      valueMin={state.lead.value_min}
      valueMax={state.lead.value_max}
      marketLocationLabel={state.lead.market_location_label}
      marketScopeLabel={getLeadgenMarketScopeLabel(state.lead.market_scope)}
      marketMedianPerSqm={state.lead.market_median_preis_eur_m2}
      marketSalesCount={state.lead.market_verkaeufe_anzahl}
      marketDays={state.lead.market_tage_am_markt}
      marketDeltaPercent={state.lead.market_delta_vorjahr_median_prozent}
    />
  );
}
