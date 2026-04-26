import Link from "next/link";

import LeadValuationCtaClient from "@/components/immobilienbewertung/valuation/LeadValuationCta.client";
import LeadValuationTrackingClient from "@/components/immobilienbewertung/valuation/LeadValuationTracking.client";
import { BRAND_NAME, DIRECT_CONTACT, PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

type Props = {
  token: string;
  expiresAt: string;
  email: string;
  enableTracking?: boolean;
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  propertyTypeLabel: string;
  locationLabel: string;
  livingArea?: number | null;
  landArea?: number | null;
  rooms?: number | null;
  yearBuilt?: number | null;
  energyClass?: string | null;
  conditionLabel?: string | null;
  qualityLabel?: string | null;
  extrasLabels: string[];
  valueMid: number;
  valueMin: number;
  valueMax: number;
  marketLocationLabel?: string | null;
  marketScopeLabel?: string | null;
  marketMedianPerSqm?: number | null;
  marketSalesCount?: number | null;
  marketDays?: number | null;
  marketDeltaPercent?: number | null;
};

function euro(value: number) {
  return `${value.toLocaleString("de-DE")} €`;
}

function signedPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return `${value > 0 ? "+" : ""}${value.toLocaleString("de-DE")} %`;
}

function safeNumberLabel(value: number | null | undefined, suffix = "") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "k. A.";
  return `${value.toLocaleString("de-DE")}${suffix}`;
}

function greetingName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Ihre Immobilie";
}

export default function LeadValuationTemplate(props: Props) {
  const deltaLabel = signedPercent(props.marketDeltaPercent);
  const trackingEnabled = props.enableTracking !== false;

  return (
    <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f7f4ed_100%)]">
      {trackingEnabled ? <LeadValuationTrackingClient token={props.token} /> : null}

      <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="rounded-[2.3rem] border border-[color:var(--color-sand)]/70 bg-white p-6 shadow-[0_35px_100px_-70px_rgba(27,48,64,0.38)] sm:p-9 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--color-sand)]/55 pb-6">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
                Marktbasierte Einordnung
              </div>
              <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-playfair)] text-[2.4rem] leading-[0.98] tracking-[-0.035em] text-[color:var(--color-navy)] sm:text-[3.6rem]">
                Ihre Bewertung für {greetingName(props.firstName, props.lastName)}
              </h1>
              <p className="mt-5 max-w-3xl text-[1rem] leading-[1.85] text-[color:var(--color-graphite)] sm:text-[1.06rem]">
                Erste marktbasierte Einordnung auf Basis regionaler Vergleichsdaten, Ihrer Lageangaben und der wichtigsten Objektdetails.
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-[color:var(--color-sand)]/60 bg-[color:var(--color-cream)]/68 px-5 py-4 text-sm leading-[1.7] text-[color:var(--color-graphite)]">
              <div>Link gültig bis</div>
              <div className="mt-1 font-semibold text-[color:var(--color-navy)]">
                {new Date(props.expiresAt).toLocaleDateString("de-DE")}
              </div>
            </div>
          </div>

          <div className="mt-9 grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
            <div className="rounded-[2rem] bg-[color:var(--color-cream)]/62 p-7 sm:p-9">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
                Marktpreis
              </div>
              <div className="mt-6 font-[family-name:var(--font-playfair)] text-[3.5rem] leading-[0.92] tracking-[-0.045em] text-[color:var(--color-navy)] sm:text-[5.2rem]">
                {euro(props.valueMid)}
              </div>
              <div className="mt-6 text-[1.05rem] leading-[1.7] text-[color:var(--color-graphite)]">
                <div className="font-semibold text-[color:var(--color-navy)]">Realistische Verkaufsspanne:</div>
                <div className="mt-2 text-[1.15rem] text-[color:var(--color-graphite)]">
                  {euro(props.valueMin)} – {euro(props.valueMax)}
                </div>
              </div>
              <div className="mt-4 text-sm leading-[1.8] text-[color:var(--color-graphite)]">
                Erste marktbasierte Einordnung auf Basis regionaler Vergleichsdaten.
              </div>
            </div>

            <div className="rounded-[2rem] border border-[color:var(--color-sand)]/70 bg-white p-7 sm:p-9">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
                Bewertungsgrundlage
              </div>
              <dl className="mt-6 grid gap-y-4 text-sm leading-[1.7] text-[color:var(--color-graphite)] sm:grid-cols-2 sm:gap-x-8">
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Objektart</dt>
                  <dd>{props.propertyTypeLabel}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Lage</dt>
                  <dd>{props.locationLabel}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Wohnfläche</dt>
                  <dd>{safeNumberLabel(props.livingArea, " m²")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Grundstück</dt>
                  <dd>{safeNumberLabel(props.landArea, " m²")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Zimmer</dt>
                  <dd>{safeNumberLabel(props.rooms)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Baujahr</dt>
                  <dd>{safeNumberLabel(props.yearBuilt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Energieklasse</dt>
                  <dd>{props.energyClass || "k. A."}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Zustand</dt>
                  <dd>{props.conditionLabel || "k. A."}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Ausstattung</dt>
                  <dd>{props.qualityLabel || "k. A."}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-navy)]">Extras</dt>
                  <dd>{props.extrasLabels.length > 0 ? props.extrasLabels.join(", ") : "k. A."}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-[color:var(--color-sand)]/70 bg-white p-7 sm:p-9">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
                Regionaler Markt
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.04] tracking-[-0.025em] text-[color:var(--color-navy)]">
                Einordnung für {props.marketLocationLabel || props.locationLabel}
              </h2>
              <p className="mt-4 text-[0.98rem] leading-[1.8] text-[color:var(--color-graphite)]">
                Ihre Bewertung nutzt genau die regionale Vergleichsbasis, die für diese Lage verfügbar ist. Dadurch bleibt die Einordnung enger und nachvollziehbarer als bei pauschalen Durchschnittswerten.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] bg-[color:var(--color-cream)]/66 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">Median €/m²</div>
                  <div className="mt-3 font-[family-name:var(--font-playfair)] text-[2rem] leading-none text-[color:var(--color-navy)]">
                    {props.marketMedianPerSqm ? `${props.marketMedianPerSqm.toLocaleString("de-DE")} €` : "k. A."}
                  </div>
                </div>
                <div className="rounded-[1.4rem] bg-[color:var(--color-cream)]/66 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">Verkäufe</div>
                  <div className="mt-3 font-[family-name:var(--font-playfair)] text-[2rem] leading-none text-[color:var(--color-navy)]">
                    {safeNumberLabel(props.marketSalesCount)}
                  </div>
                </div>
                <div className="rounded-[1.4rem] bg-[color:var(--color-cream)]/66 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">Tage am Markt</div>
                  <div className="mt-3 font-[family-name:var(--font-playfair)] text-[2rem] leading-none text-[color:var(--color-navy)]">
                    {safeNumberLabel(props.marketDays)}
                  </div>
                </div>
                <div className="rounded-[1.4rem] bg-[color:var(--color-cream)]/66 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">Median ggü. Vorjahr</div>
                  <div className="mt-3 font-[family-name:var(--font-playfair)] text-[2rem] leading-none text-[color:var(--color-navy)]">
                    {deltaLabel || "k. A."}
                  </div>
                </div>
              </div>
              {props.marketScopeLabel ? (
                <p className="mt-5 text-sm leading-[1.8] text-[color:var(--color-graphite)]">
                  Datenbasis: {props.marketScopeLabel}
                </p>
              ) : null}
            </div>

            <LeadValuationCtaClient
              token={props.token}
              phoneHref={PHONE_HREF}
              emailHref={`mailto:${DIRECT_CONTACT.email}`}
              trackingEnabled={trackingEnabled}
            />
          </div>

          <div className="mt-10 rounded-[2rem] border border-[color:var(--color-sand)]/70 bg-[color:var(--color-cream)]/62 p-7 sm:p-9">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
                  Persönliche Einordnung
                </div>
                <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.04] tracking-[-0.025em] text-[color:var(--color-navy)]">
                  Wir prüfen den Marktpreis gemeinsam präzise.
                </h2>
              </div>

              <div className="text-[0.98rem] leading-[1.8] text-[color:var(--color-graphite)]">
                <p>
                  Diese Einwertung stellt eine erste automatisierte Orientierung dar. Der tatsächliche Marktpreis hängt unter anderem von Zustand, Mikrolage und aktueller Nachfrage ab und wird im Rahmen einer persönlichen Bewertung präzise ermittelt.
                </p>
                <p className="mt-4">
                  Wenn Sie möchten, nehmen wir Ihre Unterlagen durch, prüfen Vergleichsobjekte in der Mikrolage und legen eine tragfähige Preisstrategie fest.
                </p>
              </div>
            </div>
          </div>

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-sand)]/55 pt-6 text-sm leading-[1.7] text-[color:var(--color-graphite)]">
            <div>
              {BRAND_NAME} · {PHONE_DISPLAY}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/recht/datenschutz" className="transition hover:text-[color:var(--color-brackish)]">
                Datenschutz
              </Link>
              <Link href="/recht/impressum" className="transition hover:text-[color:var(--color-brackish)]">
                Impressum
              </Link>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
