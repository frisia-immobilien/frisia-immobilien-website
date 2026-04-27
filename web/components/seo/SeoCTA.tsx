import Link from "next/link";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export default function SeoCTA() {
  return (
    <section className="mx-auto w-full max-w-[980px] px-4 py-12 sm:px-6 md:py-14">
      <div className="rounded-lg bg-[color:var(--color-navy)] p-6 text-white md:p-8">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight">
          Lass uns die Einschätzung persönlich einordnen.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-[1.75] text-white/85">
          Die Online-Bewertung liefert eine erste Spanne. Für die Preisstrategie zählen Lage, Zustand und Besonderheiten
          des Objekts.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/immobilie-bewerten" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)]">
            Bewertung starten
          </Link>
          <a href={PHONE_HREF} className="rounded-lg border border-white/35 px-5 py-3 text-sm font-semibold text-white">
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}
