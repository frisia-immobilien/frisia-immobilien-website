import Link from "next/link";
import SearchRequestForm from "@/components/site/SearchRequestForm.client";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Suchauftrag | Frisia Immobilien",
  description:
    "Suchauftrag für Immobilien in Aurich und Ostfriesland anlegen und passende Angebote von Frisia Immobilien erhalten.",
  path: "/suchauftrag",
  keywords: [
    "Suchauftrag Immobilien Aurich",
    "Immobilien Aurich suchen",
    "Haus kaufen Aurich",
    "Wohnung mieten Aurich",
    "Frisia Immobilien",
  ],
});

export default function SuchauftragPage() {
  return (
    <main className="bg-[color:var(--color-section)]">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
              Suchauftrag
            </p>
            <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-playfair)] text-[2.45rem] leading-[1.06] tracking-[-0.02em] text-[color:var(--color-navy)] sm:text-[3.35rem]">
              Neue Immobilien vor der Veröffentlichung erhalten.
            </h1>
            <p className="mt-6 max-w-[66ch] text-[1.05rem] leading-[1.85] text-[color:var(--color-graphite)]">
              Als Suchkunde bei Frisia Immobilien erhältst du ausgewählte Immobilienangebote häufig bereits vor der offiziellen Veröffentlichung.
              Wir prüfen neue Angebote vorab und informieren dich nur dann, wenn sie wirklich zu deiner Suche passen.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-[color:var(--color-brass)]/18 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
              Unsere aktuellen Immobilien entdecken?
            </p>
            <p className="mt-3 text-sm leading-[1.75] text-[color:var(--color-graphite)]">
              Alle aktuell verfügbaren Immobilien findest du weiterhin in der Immobiliensuche.
            </p>
            <Link
              href="/immobilien-aurich#immobilien-filter"
              className="mt-5 inline-flex w-full min-h-12 items-center justify-center rounded-2xl border border-[color:var(--color-navy)]/20 bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-section)]"
            >
              Immobilien ansehen
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <SearchRequestForm />
        </div>
      </section>
    </main>
  );
}
