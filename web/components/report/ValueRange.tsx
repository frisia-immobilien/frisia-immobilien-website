export default function ValueRange({
  rangeMin,
  rangeMax,
  pricePerM2Min,
  pricePerM2Max,
}: {
  rangeMin: number | null;
  rangeMax: number | null;
  pricePerM2Min: number | null;
  pricePerM2Max: number | null;
}) {
  const range =
    rangeMin && rangeMax
      ? `${rangeMin.toLocaleString("de-DE")} € - ${rangeMax.toLocaleString("de-DE")} €`
      : "Keine automatische Bewertung verfügbar";
  const sqm =
    pricePerM2Min && pricePerM2Max
      ? `${Math.round(pricePerM2Min).toLocaleString("de-DE")} - ${Math.round(pricePerM2Max).toLocaleString("de-DE")} €/m²`
      : "k. A.";

  return (
    <section className="bg-[color:var(--color-section)] py-10">
      <div className="mx-auto max-w-[980px] px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
          Wertspanne
        </p>
        <h2 className="mt-2 text-4xl font-semibold leading-tight text-[color:var(--color-navy)] md:text-5xl">
          {range}
        </h2>
        <p className="mt-4 text-base leading-7 text-[color:var(--color-graphite)]">
          Wert pro Quadratmeter: <strong>{sqm}</strong>
        </p>
      </div>
    </section>
  );
}
