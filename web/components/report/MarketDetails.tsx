import type { LeadReportWithRequest } from "@/lib/types/leadgen";

function value(value: unknown, suffix = "") {
  if (value === null || value === undefined || value === "") return "k. A.";
  return `${value}${suffix}`;
}

export default function MarketDetails({ report }: { report: LeadReportWithRequest }) {
  const lead = report.lead_request;
  const market = report.market_data;
  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-[1040px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Datengrundlage
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.35rem] leading-tight text-[color:var(--color-navy)] md:text-[3.6rem]">
              Einordnung der Bewertung
            </h2>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--color-navy)] text-sm font-semibold text-white">
            03
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-md border border-[color:var(--color-sand)]/70 bg-white p-6 shadow-[0_30px_80px_-72px_rgba(27,48,64,0.48)] sm:p-7">
            <h3 className="border-b border-[color:var(--color-sand)]/70 pb-4 text-lg font-semibold text-[color:var(--color-navy)]">
              Objektdaten
            </h3>
            <dl className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--color-graphite)]">
              <div className="flex justify-between gap-4"><dt>Wohnfläche</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{value(lead.living_area, " m²")}</dd></div>
              <div className="flex justify-between gap-4"><dt>Grundstück</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{value(lead.plot_area, " m²")}</dd></div>
              <div className="flex justify-between gap-4"><dt>Zimmer</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{value(lead.rooms)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Zustand</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{value(lead.condition)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Ausstattung</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{value(lead.equipment)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Energieklasse</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{value(lead.energy_class)}</dd></div>
            </dl>
          </article>

          <article className="rounded-md border border-[color:var(--color-sand)]/70 bg-white p-6 shadow-[0_30px_80px_-72px_rgba(27,48,64,0.48)] sm:p-7">
            <h3 className="border-b border-[color:var(--color-sand)]/70 pb-4 text-lg font-semibold text-[color:var(--color-navy)]">
              Marktdaten
            </h3>
            <dl className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--color-graphite)]">
              <div className="flex justify-between gap-4"><dt>Datenquelle</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{report.data_source}</dd></div>
              <div className="flex justify-between gap-4"><dt>Datenebene</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{report.market_level_used}</dd></div>
              <div className="flex justify-between gap-4"><dt>Marktgebiet</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{market?.location_label ?? lead.city ?? "k. A."}</dd></div>
              <div className="flex justify-between gap-4"><dt>Median €/m²</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{market?.median_preis_eur_m2 ? `${Math.round(market.median_preis_eur_m2).toLocaleString("de-DE")} €/m²` : "k. A."}</dd></div>
              <div className="flex justify-between gap-4"><dt>Verkäufe</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{market?.verkaeufe_anzahl ?? "k. A."}</dd></div>
              <div className="flex justify-between gap-4"><dt>Tage am Markt</dt><dd className="text-right font-semibold text-[color:var(--color-navy)]">{market?.tage_am_markt ?? "k. A."}</dd></div>
            </dl>
          </article>
        </div>

        <div className="mt-6 rounded-md border-l-4 border-[color:var(--color-brass)] bg-[color:var(--color-section)] px-6 py-5">
          <p className="text-base leading-[1.8] text-[color:var(--color-graphite)]">
            Der exakte Wert hängt von Details wie Mikrolage, Zustand, Grundriss, Modernisierungen und
            aktueller Nachfrage ab. Die Berechnung arbeitet bewusst mit moderaten Faktoren und vermeidet
            Scheingenauigkeit.
          </p>
        </div>
      </div>
    </section>
  );
}
