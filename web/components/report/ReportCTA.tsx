import Link from "next/link";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export default function ReportCTA() {
  return (
    <section className="bg-[#f3f5f7] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-[1040px] rounded-md bg-[#050505] p-6 text-white shadow-[0_38px_95px_-70px_rgba(0,0,0,0.8)] md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brass)]">
              Nächster Schritt
            </p>
            <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-playfair)] text-[2.3rem] leading-tight md:text-[3.7rem]">
              Lass uns die Einschätzung persönlich einordnen.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-[1.8] text-white/82">
              Ein kurzer Abgleich klärt, welche Besonderheiten den tatsächlichen Verkaufspreis beeinflussen.
            </p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-sm font-semibold text-white">
            04
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/kontakt" className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition hover:bg-white/88">
            Rückruf anfragen
          </Link>
          <a href={PHONE_HREF} className="rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}
