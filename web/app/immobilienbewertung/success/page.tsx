import type { Metadata } from "next";

import SendReportButton from "./SendReportButton.client";

export const metadata: Metadata = {
  title: "Werteinschätzung vorbereitet",
  description: "Die Werteinschätzung wurde vorbereitet und per E-Mail versendet.",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams?: Promise<{
    leadId?: string;
  }>;
};

export default async function ImmobilienbewertungSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const leadId = typeof params?.leadId === "string" ? params.leadId : undefined;

  return (
    <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_46%,#f7f4ed_100%)]">
      <section className="mx-auto max-w-[920px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="rounded-[2rem] border border-[color:var(--color-sand)]/70 bg-white p-8 shadow-[0_35px_100px_-70px_rgba(27,48,64,0.38)] sm:p-10">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
            Immobilienbewertung
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-[2.4rem] leading-[1.02] tracking-[-0.035em] text-[color:var(--color-navy)] sm:text-[3.3rem]">
            Deine Werteinschätzung ist fertig vorbereitet.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-[1.85] text-[color:var(--color-graphite)]">
            Wir haben dir soeben eine E-Mail gesendet. Das Ergebnis ist ausschließlich über den
            persönlichen Link in dieser E-Mail abrufbar.
          </p>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-[1.85] text-[color:var(--color-graphite)]">
            Öffne die E-Mail und klicke auf „Wertspanne jetzt ansehen“, um deine Ergebnisseite
            aufzurufen.
          </p>

          <SendReportButton leadId={leadId} />
        </div>
      </section>
    </main>
  );
}
