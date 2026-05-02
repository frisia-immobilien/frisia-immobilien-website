import Image from "next/image";
import Link from "next/link";
import SearchRequestForm from "@/components/site/SearchRequestForm.client";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
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

const HERO_TRUST_ITEMS = ["Kostenfrei", "Vorsortiert", "Regional geprüft"] as const;

export default function SuchauftragPage() {
  return (
    <main className="bg-[color:var(--color-section)]">
      <MobileHeroSection
        eyebrow="Suchauftrag"
        title="Neue Immobilien vor der Veröffentlichung erhalten."
        description="Du bekommst ausgewählte Immobilienangebote, wenn sie wirklich zu deiner Suche in Aurich und Ostfriesland passen."
        imageSrc="/images/immobilien-aurich-hero-drohne.webp"
        imageAlt="Helle Drohnenaufnahme einer ruhigen Wohnlage in Aurich und Ostfriesland"
        imagePosition="64% center"
        imageQuality={45}
        primaryCta={{ href: "#suchauftrag-form", label: "Suchauftrag anlegen" }}
        secondaryCta={{ href: "/immobilien-aurich#immobilien-filter", label: "Immobilien ansehen" }}
        trustItems={[...HERO_TRUST_ITEMS]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block md:min-h-[34rem] lg:min-h-[42rem]">
        <Image
          src="/images/immobilien-aurich-hero-drohne.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "64% center" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,247,248,0.96)_0%,rgba(246,247,248,0.9)_42%,rgba(246,247,248,0.58)_68%,rgba(246,247,248,0.22)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(0deg,rgba(246,247,248,1)_0%,rgba(246,247,248,0)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[34rem] w-full max-w-[1440px] items-center px-8 py-14 lg:min-h-[42rem] lg:px-12">
          <div className="max-w-[62rem]">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
              Suchauftrag
            </p>
            <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-playfair)] text-[clamp(3.15rem,5.4vw,5.75rem)] leading-[1.02] text-[color:var(--color-navy)]">
              Neue Immobilien vor der Veröffentlichung erhalten.
            </h1>
            <HeroDivider />
            <p className="mt-6 max-w-[56rem] text-[1.12rem] leading-[1.8] text-[color:var(--color-graphite)] lg:text-[1.25rem]">
              Als Suchkunde bei Frisia Immobilien erhältst du ausgewählte Immobilienangebote häufig bereits vor der offiziellen Veröffentlichung.
              Wir prüfen neue Angebote vorab und informieren dich nur dann, wenn sie wirklich zu deiner Suche passen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#suchauftrag-form"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_48px_-32px_rgba(27,48,64,0.65)] transition-colors hover:bg-[color:var(--color-brackish)]"
              >
                Suchauftrag anlegen
              </Link>
              <Link
                href="/immobilien-aurich#immobilien-filter"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-navy)]/18 bg-white/82 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] shadow-[0_18px_48px_-40px_rgba(27,48,64,0.45)] transition-colors hover:bg-white"
              >
                Immobilien ansehen
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[color:var(--color-navy)]">
              {HERO_TRUST_ITEMS.map((item) => (
                <span key={item} className="inline-flex items-center gap-2.5">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-[color:var(--color-navy)] text-[color:var(--color-navy)]">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none">
                      <path d="m4 8 2.4 2.4L12 5.4" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 md:pb-12 md:pt-8 lg:pb-16 lg:pt-10">
        <div id="suchauftrag-form" className="mt-0 scroll-mt-20">
          <SearchRequestForm />
        </div>
      </section>
    </main>
  );
}
