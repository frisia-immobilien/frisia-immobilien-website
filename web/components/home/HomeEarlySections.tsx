import Image from "next/image";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  SELLING_SITUATION_HUB,
  SELLING_SITUATIONS,
  type SellingSituation,
} from "@/lib/selling-situations/data";

function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

const SECTION_Y = "py-20 md:py-28";
const HEADING_CLASS =
  "font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-[2.45rem]";
const META_CLASS = "text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]";
const LAZY_SECTION_CLASS = "[content-visibility:auto] [contain-intrinsic-size:980px]";

const HOME_SELLING_SITUATION_KEYS = ["alter", "erbschaft", "diskret"] as const;
const HOME_SELLING_SITUATIONS = HOME_SELLING_SITUATION_KEYS.map((key) =>
  SELLING_SITUATIONS.find((situation) => situation.key === key),
).filter((situation): situation is SellingSituation => Boolean(situation));

const EIGENTUEMER_VERKAUF_ITEMS = [
  {
    title: "Marktgerechte Preisstrategie",
    icon: "/images/prozess/schritt_02.webp",
    paragraphs: [
      "Eine Immobilie, die zu hoch angeboten wird, verliert oft schnell an Marktattraktivität.",
      "Wir analysieren Vergleichsdaten aus Aurich und ganz Ostfriesland und definieren einen realistischen Preisrahmen – damit du dich nicht nach drei Monaten fragen musst, warum es noch keine Besichtigungen gibt.",
    ],
    outcome: "Qualifizierte Nachfrage und ein stabiler Verkaufsprozess.",
  },
  {
    title: "Unterlagen und Vorbereitung",
    icon: "/images/prozess/schritt_03.webp",
    paragraphs: [
      "Viele Verkäufe verzögern sich, weil wichtige Unterlagen fehlen.",
      "Frisia Immobilien kümmert sich um die Beschaffung der üblichen Verkaufsunterlagen – etwa Energieausweis, Grundbuch oder Bauunterlagen – und übernimmt die anfallenden Kosten.",
    ],
    outcome: "Ein reibungsloser Ablauf bis zum Notartermin.",
  },
  {
    title: "Strukturierter Verkauf",
    icon: "/images/prozess/schritt_01.webp",
    paragraphs: [
      "Ein Immobilienverkauf folgt bei Frisia Immobilien einer klaren Struktur.",
      "Von der Bewertung bis zum Notartermin erfolgt jeder Schritt nachvollziehbar und geordnet.",
    ],
    outcome: "Ein ruhiger Verkaufsprozess – ohne unnötige Marktturbulenzen.",
  },
  {
    title: "Persönliche Begleitung",
    icon: "/images/why/persoenliche_begleitung2.webp",
    paragraphs: [
      "Während des gesamten Verkaufsprozesses hast du einen festen Ansprechpartner.",
      "Von der ersten Einschätzung bis zur Schlüsselübergabe begleiten wir alle Schritte persönlich.",
    ],
    outcome: "Klare Verantwortung und verlässliche Betreuung bis zum Abschluss.",
  },
] as const;

function Wrap({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>;
}

export function WarumEigentuemerVerkaufenBlock() {
  return (
    <section id="warum-eigentuemer-verkaufen" className={`bg-white ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="w-full">
          <p className={META_CLASS}>IMMOBILIE VERKAUFEN AURICH</p>
          <h2 className={HEADING_CLASS}>Warum viele Entscheidungen beim Hausverkauf schwerfallen</h2>
          <p className="mt-5 max-w-[80ch] text-[1rem] leading-[1.72] text-[color:var(--color-graphite)]">
            Frisia Immobilien begleitet Eigentümer im regionalen Immobilienmarkt in Aurich und ganz Ostfriesland – mit
            klarer Struktur, belastbarer Bewertung und persönlicher Verantwortung.
          </p>
          <div className="relative mt-7 grid gap-[18px] md:grid-cols-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-[5] hidden h-full bg-[length:555px_auto] bg-[position:-110px_-15px] bg-no-repeat opacity-[0.3] md:block md:w-[calc(50%-9px)]"
              style={{
                backgroundImage: "url('/images/frisia/frisia_f.webp')",
              }}
            />
            {EIGENTUEMER_VERKAUF_ITEMS.map((item, idx) => (
              <article
                key={item.title}
                className="relative h-full overflow-hidden rounded-2xl border border-[color:var(--color-brass)]/22 bg-white/90 p-[44px] shadow-[0_8px_26px_rgba(27,48,64,0.05)]"
              >
                <div className={`relative ${idx === 0 || idx === 2 ? "z-20" : "z-10"}`}>
                  <div className="mx-auto mb-6 inline-flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[color:var(--color-brass)]/25 bg-[#F3F6F8]">
                    <Image
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      width={42}
                      height={42}
                      className="h-[42px] w-[42px] object-contain [filter:brightness(0)_saturate(100%)_invert(16%)_sepia(26%)_saturate(1458%)_hue-rotate(169deg)_brightness(92%)_contrast(95%)]"
                    />
                  </div>
                  <h3 className="text-[1.18rem] font-semibold leading-[1.35] tracking-[0.005em] text-[color:var(--color-navy)]">
                    {item.title}
                  </h3>
                  <div className="mt-3 max-w-[60ch] space-y-3 text-[0.98rem] leading-[1.74] text-[color:var(--color-graphite)]">
                    {item.paragraphs.map((text) => (
                      <p key={text}>{text}</p>
                    ))}
                    <p className="pt-1 font-semibold text-[color:var(--color-navy)]">
                      <span className="mr-2 text-[color:var(--color-brackish)]">✓</span>
                      {item.outcome}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function VerkaufssituationenBlock() {
  return (
    <section id="verkaufssituationen" className={`overflow-x-clip bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="w-full">
          <p className={META_CLASS}>VERKAUFSSITUATIONEN AURICH</p>
          <h2 className={`${HEADING_CLASS} mt-3 max-w-none`}>
            Wenn das Haus nicht mehr passt, braucht die Entscheidung Ruhe
          </h2>
          <div className="mt-7 w-full space-y-4 text-[1.02rem] leading-[1.78] text-[color:var(--color-graphite)]">
            <p>
              Manche Verkäufe beginnen nicht mit einer Anzeige, sondern mit einer Lebenslage:
              Alter, Erbschaft oder der Wunsch nach Diskretion.
            </p>
            <p>
              Frisia Immobilien ordnet zuerst die Situation ein und führt danach in eine fundierte{" "}
              <Link href="/immobilienbewertung-aurich" className="underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]">
                Immobilienbewertung
              </Link>{" "}
              und einen strukturierten{" "}
              <Link href="/haus-verkaufen-aurich" className="underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]">
                Hausverkauf
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {HOME_SELLING_SITUATIONS.map((situation) => (
              <Link
                key={situation.path}
                href={situation.path}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_52px_rgba(21,39,53,0.06)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-brass)]"
              >
                <span className="relative block aspect-[16/9] min-h-[13rem] overflow-hidden">
                  <Image
                    src={situation.image}
                    alt={situation.imageAlt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.46)_34%,rgba(255,255,255,0.12)_62%,rgba(255,255,255,0)_100%)]"
                  />
                </span>
                <span className="flex flex-1 flex-col p-6 md:p-7">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                    {situation.eyebrow}
                  </span>
                  <span className="mt-3 block text-[1.18rem] font-semibold leading-tight text-[color:var(--color-navy)] md:text-[1.25rem] xl:text-[1.32rem]">
                    {situation.headline}
                  </span>
                  <span className="mt-4 block text-[0.98rem] leading-[1.68] text-[color:var(--color-graphite)]">
                    {situation.subline}
                  </span>
                  <span className="mt-5 inline-flex items-center text-sm font-semibold text-[color:var(--color-navy)] underline decoration-[color:var(--color-brass)]/60 underline-offset-4 group-hover:text-[color:var(--color-brackish)]">
                    Zur Situation
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <Link
            href={SELLING_SITUATION_HUB.path}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-[1.75rem] border border-[color:var(--color-brass)]/45 bg-white px-6 py-4 text-base font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-section)]"
          >
            Alle Verkaufssituationen ansehen
          </Link>
        </div>
      </Wrap>
    </section>
  );
}

export function DecisionFirstBlock() {
  return (
    <section id="erst-einordnen" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.72fr)_minmax(18rem,0.28fr)] md:items-start">
          <div>
            <p className={META_CLASS}>ERSTE EINORDNUNG</p>
            <h2 className={HEADING_CLASS}>Erst einordnen. Dann entscheiden.</h2>
            <div className="mt-7 max-w-[78ch] space-y-4 text-[1.02rem] leading-[1.78] text-[color:var(--color-graphite)]">
              <p>
                Ein guter Hausverkauf beginnt nicht mit einer Anzeige, sondern mit Klarheit: Was ist realistisch,
                welche Optionen bestehen und welcher Ablauf passt zur Situation?
              </p>
              <p>
                Frisia Immobilien ordnet zuerst Wert, Lage, Zustand und Verkaufsanlass ein. Danach lässt sich ruhig
                entscheiden, ob Bewertung, Vorbereitung oder Vermarktung der nächste sinnvolle Schritt ist.
              </p>
            </div>
          </div>
          <aside className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6 shadow-[0_18px_52px_rgba(21,39,53,0.05)]">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
              Nächster Schritt
            </p>
            <p className="mt-3 text-[1.18rem] font-semibold leading-[1.45] text-[color:var(--color-navy)]">
              Fundierte Bewertung statt Bauchgefühl.
            </p>
            <a
              href="#immobilienbewertung"
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white"
            >
              Bewertung starten
            </a>
          </aside>
        </div>
      </Wrap>
    </section>
  );
}
