import DeferredLeadGenEntry from "@/components/home/DeferredLeadGenEntry.client";

export default function HomeLeadBlock() {
  return (
    <section
      className="bg-white py-14 md:py-20 [content-visibility:auto] [contain-intrinsic-size:920px]"
      aria-label="Kostenlose Ersteinschätzung starten"
    >
      <span id="bewertung" className="block scroll-mt-24" aria-hidden="true" />
      <div id="immobilienbewertung" tabIndex={-1} className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
            IMMOBILIENBEWERTUNG AURICH
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-[2.45rem]">
            Immobilienbewertung in Aurich – fundiert und nachvollziehbar
          </h2>
        </div>
        <DeferredLeadGenEntry />
      </div>
    </section>
  );
}
