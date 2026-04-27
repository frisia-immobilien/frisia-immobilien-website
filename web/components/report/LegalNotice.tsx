export default function LegalNotice() {
  return (
    <section className="mx-auto max-w-[980px] px-4 py-10 sm:px-6">
      <div className="rounded-lg border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-5">
        <h2 className="text-lg font-semibold text-[color:var(--color-navy)]">Transparenzhinweis</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-graphite)]">
          Diese Auswertung ist eine automatisierte Ersteinschätzung auf Grundlage der Nutzereingaben und der verfügbaren
          Datenbankwerte. Sie ersetzt keine Besichtigung, keine Verkehrswertermittlung und keine individuelle Prüfung.
          Für fehlerhafte oder unvollständige Eingaben kann keine Gewähr übernommen werden.
        </p>
      </div>
    </section>
  );
}
