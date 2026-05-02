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
      : "Wir prüfen die Bewertung persönlich";
  const sqm =
    pricePerM2Min && pricePerM2Max
      ? `${Math.round(pricePerM2Min).toLocaleString("de-DE")} - ${Math.round(pricePerM2Max).toLocaleString("de-DE")} €/m²`
      : "k. A.";

  return (
    <section className="bg-[#f3f5f7] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-[1040px]">
        <div className="rounded-md border border-[color:var(--color-sand)]/70 bg-white px-6 py-8 shadow-[0_35px_90px_-70px_rgba(27,48,64,0.45)] sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[color:var(--color-sand)]/65 pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
                Ergebnis
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.5rem] leading-tight text-[color:var(--color-navy)] md:text-[4rem]">
                Marktpreiseinschätzung
              </h2>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--color-navy)] text-sm font-semibold text-white">
              02
            </div>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Deine aktuelle Marktwert-Spanne
            </div>
            <div className="mt-4 max-w-4xl text-[2.2rem] font-semibold leading-tight text-[color:var(--color-navy)] md:text-[4.5rem]">
              {range}
            </div>
            <div className="mt-6 h-1 w-28 bg-[color:var(--color-brass)]" />
            <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--color-graphite)] md:text-lg">
              Die Spanne liegt im aktuellen Markt und dient als realistische Orientierung. Wert pro
              Quadratmeter: <strong className="text-[color:var(--color-navy)]">{sqm}</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
