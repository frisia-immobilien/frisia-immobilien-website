import type { Metadata } from "next";
import Link from "next/link";

import LeadValuationTemplate from "@/components/immobilienbewertung/valuation/LeadValuationTemplate";
import LegalNotice from "@/components/report/LegalNotice";
import MarketDetails from "@/components/report/MarketDetails";
import ReportCTA from "@/components/report/ReportCTA";
import ReportHero from "@/components/report/ReportHero";
import ValueRange from "@/components/report/ValueRange";
import { getLeadByToken } from "@/lib/immobilienbewertung/lead-records";
import { getLeadReportByToken, markReportOpened } from "@/lib/leadgen/repository";
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
  title: "Ihre Marktpreiseinschätzung",
  description: "Persönliche Marktpreiseinschätzung Ihrer Immobilie.",
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
  let state: PageState;

  try {
    const { token } = await params;

    if (!token) {
      state = {
        type: "shell",
        title: "Ungültiger Link",
        text: "Der Bewertungslink ist unvollständig oder nicht mehr gültig.",
        ctaHref: "/immobilie-bewerten",
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
            ctaHref: "/immobilie-bewerten",
            ctaLabel: "Neue Bewertung starten",
          };
        } else {
          await markReportOpened(report.id, report.lead_request_id);
          state = { type: "report", report };
        }
      } else {
        const lead = await getLeadByToken(token);

        if (!lead) {
          state = {
            type: "shell",
            title: "Dieser Bewertungslink ist nicht mehr verfügbar",
            text: "Bitte starten Sie eine neue Bewertung oder melden Sie sich direkt bei uns. Wir ordnen Ihre Immobilie gern persönlich ein.",
            ctaHref: "/immobilie-bewerten",
            ctaLabel: "Neue Bewertung starten",
          };
        } else {
          const expiresAt = new Date(lead.expires_at);
          if (new Date() > expiresAt) {
            state = {
              type: "shell",
              title: "Ihre Bewertung ist abgelaufen",
              text: "Der Link war aus Sicherheitsgründen zeitlich begrenzt. Starten Sie die Bewertung einfach neu oder fordern Sie direkt eine persönliche Einordnung an.",
              ctaHref: "/immobilie-bewerten",
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
    return (
      <main id="main-content" className="bg-white">
        <ReportHero report={state.report} />
        <ValueRange
          rangeMin={state.report.range_min}
          rangeMax={state.report.range_max}
          pricePerM2Min={state.report.price_per_m2_min}
          pricePerM2Max={state.report.price_per_m2_max}
        />
        <MarketDetails report={state.report} />
        <LegalNotice />
        <ReportCTA />
      </main>
    );
  }

  return (
    <LeadValuationTemplate
      token={state.token}
      expiresAt={state.lead.expires_at}
      email={state.lead.email}
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
