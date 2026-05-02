import Link from "next/link";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export default function NotFound() {
  return (
    <main id="main-content" className="bg-[color:var(--color-section)] px-4 py-20 text-[color:var(--color-graphite)] sm:px-6 md:py-28">
      <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-[color:var(--color-brass)]/26 bg-white p-7 shadow-[0_24px_70px_-54px_rgba(27,48,64,0.34)] sm:p-10 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
          Das tut uns leid.
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.1] text-[color:var(--color-navy)] md:text-[3.1rem]">
          Diese Seite wurde nicht gefunden.
        </h1>
        <p className="mt-6 max-w-2xl text-[1.08rem] leading-[1.75] text-[color:var(--color-graphite)] md:text-[1.18rem]">
          Der Inhalt ist nicht mehr verfügbar oder wurde verschoben.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/"
            className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
          >
            Zur Startseite
          </Link>
          <Link
            href="/immobilienbewertung-aurich"
            className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/60 bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
          >
            Immobilie bewerten lassen
          </Link>
          <a
            href={PHONE_HREF}
            className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-navy)]/12 bg-[color:var(--color-section)] px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
          >
            Einfach kurz sprechen · {PHONE_DISPLAY}
          </a>
        </div>
      </section>
    </main>
  );
}
