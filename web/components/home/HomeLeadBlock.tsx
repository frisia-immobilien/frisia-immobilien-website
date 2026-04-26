import DeferredLeadGenEntry from "@/components/home/DeferredLeadGenEntry.client";

export default function HomeLeadBlock() {
  return (
    <section
      id="immobilienbewertung"
      tabIndex={-1}
      className="scroll-mt-16 py-14 md:py-20 [content-visibility:auto] [contain-intrinsic-size:920px]"
      aria-label="Kostenlose Ersteinschätzung starten"
    >
      <span id="bewertung" className="block scroll-mt-16" aria-hidden="true" />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <DeferredLeadGenEntry />
      </div>
    </section>
  );
}
