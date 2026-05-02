import Link from "next/link";

const marketTopics = [
  "Hauspreise in Aurich",
  "Wohnungspreise in Aurich",
  "Preisentwicklung",
  "Nachfrage & Vermarktungsdauer",
] as const;

type AurichMarketTeaserProps = {
  tone?: "muted" | "white";
};

export default function AurichMarketTeaser({ tone = "muted" }: AurichMarketTeaserProps) {
  const sectionClassName = tone === "white" ? "bg-white" : "bg-[color:var(--color-section)]";

  return (
    <section className={`${sectionClassName} py-14 md:py-20`} aria-labelledby="aurich-market-teaser-title">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-12">
        <div className="rounded-[1.5rem] border border-[color:var(--color-brass)]/20 bg-white p-6 shadow-[0_18px_54px_-46px_rgba(27,48,64,0.5)] md:p-9">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="flex h-full flex-col">
              <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
                Marktdaten Aurich
              </p>
              <h2
                id="aurich-market-teaser-title"
                className="mt-3 font-[family-name:var(--font-playfair)] text-[2.05rem] leading-[1.13] text-[color:var(--color-navy)] md:text-[2.85rem]"
              >
                Immobilienpreise in Aurich richtig einordnen
              </h2>
              <p className="mt-5 max-w-3xl text-[1rem] leading-[1.75] text-[color:var(--color-graphite)] md:text-[1.08rem]">
                Die Immobilienpreise in Aurich unterscheiden sich je nach Lage, Objektart und Zustand deutlich. Für
                eine belastbare Einschätzung reicht deshalb kein pauschaler Durchschnittswert. Entscheidend ist die
                konkrete Einordnung von Hauspreisen, Wohnungspreisen, Nachfrage und Vermarktungsdauer.
              </p>
            </div>

            <div className="flex h-full flex-col">
              <div className="grid gap-3 sm:grid-cols-2">
                {marketTopics.map((topic) => (
                  <div
                    key={topic}
                    className="flex min-h-[5.25rem] items-center gap-3 rounded-xl border border-[color:var(--color-brass)]/22 bg-[color:var(--color-section)] px-5 py-4 text-[1rem] font-semibold leading-[1.45] text-[color:var(--color-navy)]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 28 28"
                      className="h-7 w-7 shrink-0 text-[color:var(--color-navy)]"
                      fill="none"
                    >
                      <path d="M5 23V14h4v9H5Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
                      <path d="M12 23V9h4v14h-4Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
                      <path d="M19 23V4h4v19h-4Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
                    </svg>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
              <p className="mt-[29px] text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">
                Die vollständige Auswertung mit Preisentwicklung, Marktverlauf und regionaler Einordnung findest du auf
                unserer Marktdatenseite für Aurich.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Link
                  href="/immobilienpreise-aurich"
                  className="inline-flex min-h-18 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-6 py-3 text-[0.98rem] font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                >
                  Alle Immobilienpreise in Aurich ansehen
                </Link>
                <Link
                  href="/immobilienbewertung-aurich"
                  className="inline-flex min-h-18 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/35 bg-white px-6 py-3 text-[0.98rem] font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                >
                  Immobilie bewerten lassen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
