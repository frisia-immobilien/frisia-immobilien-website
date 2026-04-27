import type { MarketDataRow } from "@/lib/types/leadgen";

function euroPerM2(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value).toLocaleString("de-DE")} €/m²` : "Keine belastbaren Daten";
}

function delta(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Keine Jahresveränderung";
  return `${value > 0 ? "+" : ""}${value.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

function StatCard({ title, market }: { title: string; market: MarketDataRow | null }) {
  return (
    <article className="rounded-lg border border-[color:var(--color-brass)]/25 bg-white p-5">
      <h3 className="text-base font-semibold text-[color:var(--color-navy)]">{title}</h3>
      <p className="mt-3 text-3xl font-semibold text-[color:var(--color-navy)]">{euroPerM2(market?.median_preis_eur_m2)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-[color:var(--color-graphite)]">
        <div>
          <dt>Entwicklung</dt>
          <dd className="font-semibold text-[color:var(--color-navy)]">{delta(market?.delta_vorjahr_median_prozent)}</dd>
        </div>
        <div>
          <dt>Verkäufe</dt>
          <dd className="font-semibold text-[color:var(--color-navy)]">{market?.verkaeufe_anzahl ?? "k. A."}</dd>
        </div>
        <div>
          <dt>Tage am Markt</dt>
          <dd className="font-semibold text-[color:var(--color-navy)]">{market?.tage_am_markt ?? "k. A."}</dd>
        </div>
        <div>
          <dt>Datenebene</dt>
          <dd className="font-semibold text-[color:var(--color-navy)]">{market?.datensatz_typ ?? "Fallback"}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function MarketStats({
  houseMarket,
  apartmentMarket,
}: {
  houseMarket: MarketDataRow | null;
  apartmentMarket: MarketDataRow | null;
}) {
  return (
    <section className="bg-[color:var(--color-section)] py-12 md:py-14">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
          Marktkennzahlen
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <StatCard title="Hauspreise" market={houseMarket} />
          <StatCard title="Wohnungspreise" market={apartmentMarket} />
        </div>
      </div>
    </section>
  );
}
