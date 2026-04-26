import Image from "next/image";
import Link from "next/link";

const HERO_BULLETS = [
  "Geprüfte Immobilienbewertung",
  "Regionaler Immobilienmarkt in Aurich und Ostfriesland",
  "Strukturierter Immobilienverkauf",
  "Persönliche Betreuung bis zum Notartermin",
] as const;

export default function HomeHero() {
  return (
    <section
      id="top"
      className="relative min-h-[74vh] overflow-hidden bg-[linear-gradient(180deg,#d9dee2_0%,#bcc6cd_36%,#8a939b_100%)] md:min-h-[88vh] md:bg-transparent"
      aria-label="Startbereich"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/hero/haus-verkaufen-aurich.webp"
          alt="Hausverkauf in Aurich mit regionaler Immobilienberatung"
          title="Haus verkaufen in Aurich"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 92vw, 1440px"
          quality={45}
          className="object-cover object-[60%_50%] md:object-[35%_50%]"
        />

        <div className="absolute inset-0 bg-black/12 md:bg-black/0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/10 to-black/22 md:from-black/58 md:via-black/0 md:to-black/8" />
      </div>

      <div className="relative z-10 mt-5">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex min-h-[74vh] items-end pb-24 md:min-h-[88vh] md:pb-60">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-0 rounded-3xl bg-black/18 md:bg-black/40" aria-hidden="true" />
              <div className="relative px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">
                <div className="space-y-1 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white/70">
                  <p>IMMOBILIENMAKLER AURICH</p>
                  <p className="text-white/65">Regionaler Immobilienmarkt Aurich & Ostfriesland</p>
                </div>
                <h1 className="mt-3 text-4xl leading-[1.12] tracking-[-0.015em] text-white md:text-5xl">
                  Immobilie verkaufen in
                  <span className="block">Aurich und ganz Ostfriesland.</span>
                </h1>

                <p className="mt-4 max-w-[58ch] text-[1rem] leading-[1.72] text-white/95">
                  Frisia Immobilien begleitet Eigentümer beim Verkauf –
                  <br />
                  mit Immobilienbewertung, klarer Preisstrategie
                  <br />
                  und strukturiertem Immobilienverkauf.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src="/images/hero/dekra-zertifizierter-sachverstaendiger-fuer-immobilenbewertung-d1-sebastian_munzig.webp"
                    alt="DEKRA zertifizierter Sachverständiger für Immobilienbewertung D1"
                    width={77}
                    height={120}
                    sizes="77px"
                    quality={60}
                    className="h-[120px] w-[77px] shrink-0 object-contain opacity-90"
                  />
                  <p className="text-[1.1rem] font-semibold leading-[1.6] text-white/95">
                    DEKRA zertifizierter Sachverständiger
                    <br />
                    für Immobilienbewertung – D1
                  </p>
                </div>

                <ul className="mt-6 space-y-2 text-[0.95rem] leading-[1.65] text-white/95">
                  {HERO_BULLETS.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/70 text-[0.72rem] font-semibold leading-none text-white"
                      >
                        ✓
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-15 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link
                    href="#immobilienbewertung"
                    className="inline-flex rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/55"
                    style={{ background: "#1B3040" }}
                    data-track="hero_primary_cta_click"
                    data-track-label="ersteinschaetzung_starten"
                    data-track-location="hero"
                  >
                    Kostenlose Immobilienbewertung
                  </Link>
                  <Link
                    href="#prozess-test"
                    className="inline-flex rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white/95 transition-colors hover:border-white/55"
                    data-track="hero_secondary_cta_click"
                    data-track-label="ablauf_immobilienbewertung"
                    data-track-location="hero"
                  >
                    Persönliche Beratung
                  </Link>
                </div>

                <p className="mt-4 text-[0.9rem] leading-[1.65] text-white/90">
                  Kostenlose Ersteinschätzung deiner Immobilie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link
        href="#immobilienbewertung"
        aria-label="Zur Immobilienbewertung scrollen"
        className="absolute bottom-25 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:inline-flex"
      >
        <span className="flex h-[42px] w-[24px] items-start justify-center rounded-full border-[2px] border-white/55 p-1">
          <span className="mt-0.5 h-[9px] w-[4px] rounded-full bg-white/50" />
        </span>
        <span
          aria-hidden="true"
          className="h-[8px] w-[8px] rotate-45 border-b-[2px] border-r-[2px] border-white/50"
        />
      </Link>
    </section>
  );
}
