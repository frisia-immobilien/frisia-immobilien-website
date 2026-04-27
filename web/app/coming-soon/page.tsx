import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frisia Immobilien",
  description: "Unsere Website wird derzeit vorbereitet. In Kürze sind wir für dich da.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ComingSoonPage() {
  return (
    <main
      id="main-content"
      className="fixed inset-0 z-[200] flex min-h-dvh items-center justify-center overflow-auto bg-[color:var(--color-section)] px-5 py-12 text-[color:var(--color-navy)]"
    >
      <section className="w-full max-w-[42rem] rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-6 py-10 text-center shadow-[0_26px_80px_-66px_rgba(27,48,64,0.62)] sm:px-10 sm:py-12">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
          Frisia Immobilien
        </p>
        <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-[2.45rem] leading-tight text-[color:var(--color-navy)] sm:text-[3.2rem]">
          Unsere Website wird derzeit vorbereitet.
        </h1>
        <p className="mx-auto mt-5 max-w-[28rem] text-lg leading-[1.75] text-[color:var(--color-graphite)]">
          In Kürze sind wir für dich da.
        </p>

        <div className="mx-auto mt-8 h-px max-w-[18rem] bg-[color:var(--color-brass)]/35" />

        <div className="mt-8 space-y-3 text-base leading-7 text-[color:var(--color-graphite)]">
          <p className="font-semibold text-[color:var(--color-navy)]">Kontakt</p>
          <p>
            Telefon:{" "}
            <Link href="tel:+4949419867700" className="font-semibold text-[color:var(--color-navy)] underline-offset-4 hover:underline">
              04941 986770-0
            </Link>
          </p>
          <p>
            E-Mail:{" "}
            <Link href="mailto:info@frisia-immobilien.de" className="font-semibold text-[color:var(--color-navy)] underline-offset-4 hover:underline">
              info@frisia-immobilien.de
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
