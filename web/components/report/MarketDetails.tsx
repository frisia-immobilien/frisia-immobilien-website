import type { LeadReportWithRequest } from "@/lib/types/leadgen";

function value(value: unknown, suffix = "") {
  if (value === null || value === undefined || value === "") return "k. A.";
  return `${value}${suffix}`;
}

export default function MarketDetails({ report }: { report: LeadReportWithRequest }) {
  const lead = report.lead_request;
  const market = report.market_data;
  return (
    <section className="mx-auto max-w-[980px] px-4 py-12 sm:px-6 md:py-14">
      <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
        Datengrundlage und Einordnung
      </h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <article className="rounded-lg border border-[color:var(--color-brass)]/25 bg-white p-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">Objektdaten</h3>
          <dl className="mt-4 space-y-2 text-sm text-[color:var(--color-graphite)]">
            <div className="flex justify-between gap-4"><dt>Wohnfläche</dt><dd>{value(lead.living_area, " m²")}</dd></div>
            <div className="flex justify-between gap-4"><dt>Grundstück</dt><dd>{value(lead.plot_area, " m²")}</dd></div>
            <div className="flex justify-between gap-4"><dt>Zimmer</dt><dd>{value(lead.rooms)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Zustand</dt><dd>{value(lead.condition)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Ausstattung</dt><dd>{value(lead.equipment)}</dd></div>
            <div className="flex justify-between gap-4"><dt>Energieklasse</dt><dd>{value(lead.energy_class)}</dd></div>
          </dl>
        </article>
        <article className="rounded-lg border border-[color:var(--color-brass)]/25 bg-white p-5">
          <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">Marktdaten</h3>
          <dl className="mt-4 space-y-2 text-sm text-[color:var(--color-graphite)]">
            <div className="flex justify-between gap-4"><dt>Datenquelle</dt><dd>{report.data_source}</dd></div>
            <div className="flex justify-between gap-4"><dt>Datenebene</dt><dd>{report.market_level_used}</dd></div>
            <div className="flex justify-between gap-4"><dt>Marktgebiet</dt><dd>{market?.location_label ?? lead.city ?? "k. A."}</dd></div>
            <div className="flex justify-between gap-4"><dt>Median €/m²</dt><dd>{market?.median_preis_eur_m2 ? `${Math.round(market.median_preis_eur_m2).toLocaleString("de-DE")} €/m²` : "k. A."}</dd></div>
            <div className="flex justify-between gap-4"><dt>Verkäufe</dt><dd>{market?.verkaeufe_anzahl ?? "k. A."}</dd></div>
            <div className="flex justify-between gap-4"><dt>Tage am Markt</dt><dd>{market?.tage_am_markt ?? "k. A."}</dd></div>
          </dl>
        </article>
      </div>
      <p className="mt-6 text-base leading-[1.8] text-[color:var(--color-graphite)]">
        Zustand und Ausstattung können den Preis verändern. Die Berechnung arbeitet bewusst mit moderaten Faktoren und
        vermeidet Scheingenauigkeit.
      </p>
    </section>
  );
}
