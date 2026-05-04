import Image from "next/image";
import Link from "next/link";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import RegionalCrossLinks from "@/components/seo/RegionalCrossLinks";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { formatLocationPhrase } from "@/lib/seo/locationDisplay";
import { daysOnMarket, medianPricePerM2, totalSalesCount } from "@/lib/seo/valuationLanding";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

function numeric(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatEuro(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} €` : "individuell";
}

function formatEuroPerM2(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} €/m²` : "individuell";
}

function formatDays(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} Tage` : "individuell";
}

function demandLabel(salesCount: number | null) {
  if (!salesCount) return "individuell";
  if (salesCount >= 80) return "hoch";
  if (salesCount >= 25) return "mittel";
  return "gering";
}

function Section({
  title,
  children,
  muted = false,
  id,
}: {
  title: string;
  children: React.ReactNode;
  muted?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={muted ? "bg-[color:var(--color-section)] py-12 md:py-16" : "bg-white py-12 md:py-16"}>
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
        <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
          {title}
        </h2>
        <div className="mt-6 space-y-5 text-base leading-[1.78] text-[color:var(--color-graphite)] md:text-lg">
          {children}
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white px-5 py-5 shadow-[0_18px_44px_-38px_rgba(27,48,64,0.48)]">
      <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">{title}</h3>
      <p className="mt-2 text-base leading-7 text-[color:var(--color-graphite)]">{text}</p>
    </article>
  );
}

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-brass)]/35 bg-white p-5">
      <dt className="text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brackish)]">{label}</dt>
      <dd className="mt-3 text-2xl font-semibold leading-tight text-[color:var(--color-navy)]">{value}</dd>
    </div>
  );
}

function StepCard({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <article className="rounded-lg border border-[color:var(--color-brass)]/30 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-sm font-semibold text-white">
          {index}
        </span>
        <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">{title}</h3>
      </div>
      <p className="mt-3 text-base leading-7 text-[color:var(--color-graphite)]">{text}</p>
    </article>
  );
}

function FaqItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  return (
    <details className="group border-t border-[color:var(--color-brass)]/20 first:border-t-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 marker:hidden sm:px-6">
        <h3 className="text-base font-semibold leading-snug text-[color:var(--color-navy)] sm:text-lg">{question}</h3>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-xl leading-none text-[color:var(--color-navy)] transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-5 pb-6 pr-14 sm:px-6 sm:pr-20">
        <p className="text-base leading-[1.75] text-[color:var(--color-graphite)]">{answer}</p>
      </div>
    </details>
  );
}

export default function HouseSellingLocationTemplate({ data }: { data: LocationPageData }) {
  const locationPhrase = formatLocationPhrase(data.location);
  const housePriceM2 = medianPricePerM2(data.houseMarket);
  const offerPrice = numeric(data.houseMarket?.median_preis_eur);
  const marketDays = daysOnMarket(data.houseMarket, data.apartmentMarket);
  const salesCount = totalSalesCount(data.houseMarket, data.apartmentMarket);
  const heroImage = "/images/immobilienbewertung/hero-background.webp";

  const steps = [
    ["+1", "Du nimmst Kontakt auf", "Wir klären, ob ein Verkauf für dich sinnvoll ist und welche nächsten Schritte passen."],
    ["1", "Erstgespräch", "Wir besprechen deine Situation, dein Haus und dein Ziel."],
    ["2", "Unterlagenprüfung", "Wir prüfen die wichtigsten Objektunterlagen und erkennen mögliche Risiken frühzeitig."],
    ["3", "Bewertung", `Wir ermitteln einen realistischen Preisrahmen für dein Haus ${locationPhrase}.`],
    ["4", "Verkaufsstrategie", "Wir legen fest, wie dein Haus positioniert wird und welche Käufer angesprochen werden."],
    ["5", "Vorbereitung", "Fotos, Grundriss, Exposé, Energieangaben und Vermarktungsunterlagen werden sauber vorbereitet."],
    ["6", "Vermarktung", "Dein Haus wird strukturiert sichtbar gemacht - passend zur Zielgruppe und zur Nachfrage."],
    ["7", "Käuferprüfung", "Interessenten werden nicht nur gesammelt, sondern eingeordnet und vorqualifiziert."],
    ["8", "Besichtigungen", "Besichtigungen erfolgen geführt, vorbereitet und mit klarem Blick auf Abschlussfähigkeit."],
    ["9", "Abschluss", "Wir begleiten Verhandlung, Notarvorbereitung und Übergabe bis zum klaren Abschluss."],
  ] as const;

  const faqs = [
    {
      question: `Wie starte ich den Hausverkauf ${locationPhrase} richtig?`,
      answer: `Der Hausverkauf startet mit einer realistischen Einordnung des Hauses. Dazu gehören Lage, Zustand, Grundstück, Wohnfläche, Modernisierung, Energie, Nachfrage und vergleichbare Angebote ${locationPhrase}. Erst danach sollte entschieden werden, mit welchem Preis und welcher Strategie das Haus angeboten wird.`,
    },
    {
      question: "Warum ist der Angebotspreis beim Hausverkauf so wichtig?",
      answer: "Der Angebotspreis bestimmt die erste Reaktion des Marktes. Ist er zu hoch, bleibt das Haus oft länger sichtbar und verliert an Wirkung. Ist er zu niedrig, kann Verkaufserlös verloren gehen. Ziel ist ein Preisrahmen, der Nachfrage erzeugt und gleichzeitig eine starke Verhandlungsposition ermöglicht.",
    },
    {
      question: "Wie prüft Frisia Immobilien Käufer?",
      answer: "Wir achten darauf, ob die Kaufabsicht ernsthaft ist, ob die Finanzierung plausibel wirkt und ob der Interessent wirklich zum Haus passt. Dadurch werden unnötige Besichtigungen reduziert und der Verkaufsprozess bleibt ruhiger und verbindlicher.",
    },
    {
      question: `Wie lange dauert ein Hausverkauf ${locationPhrase}?`,
      answer: "Die Dauer hängt von Lage, Zustand, Preis, Nachfrage und Käuferzielgruppe ab. Ein gut vorbereiteter Verkauf mit realistischer Einpreisung kann deutlich strukturierter verlaufen als ein Verkauf, der ohne klare Strategie startet.",
    },
    {
      question: `Warum sollte ich mein Haus ${locationPhrase} mit Frisia Immobilien verkaufen?`,
      answer: "Weil Frisia Immobilien den Verkauf nicht dem Zufall überlässt. Wir verbinden regionale Marktkenntnis, fundierte Bewertung, strukturierte Vermarktung, Käuferprüfung und persönliche Begleitung - vom ersten Gespräch bis zum klaren Abschluss.",
    },
  ];

  return (
    <>
      <MobileHeroSection
        eyebrow={`Haus verkaufen ${locationPhrase}`}
        title={<>Haus verkaufen {locationPhrase}</>}
        description="Mit klarem Preisansatz, geprüften Käufern und einer strukturierten Vorgehensweise vom ersten Gespräch bis zum Notartermin."
        imageSrc={heroImage}
        imageAlt=""
        imagePosition="right center"
        primaryCta={{ href: "#verkauf-planen", label: "Verkauf planen" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Klare Bewertung", "Strukturierter Verkauf", "Geprüfte Käufer"]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-right opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.50)_34%,rgba(255,255,255,0.18)_58%,rgba(255,255,255,0.04)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-12">
          <div className="max-w-[47rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Haus verkaufen {locationPhrase}
            </p>
            <h1 className="mt-5 max-w-full break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              Haus verkaufen {locationPhrase}
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-3xl text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:text-[1.35rem]">
              Mit klarem Preisansatz, geprüften Käufern und einer strukturierten Vorgehensweise vom ersten Gespräch bis zum Notartermin.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#verkauf-planen" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Verkauf planen
              </Link>
              <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/75 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
                {PHONE_DISPLAY}
              </a>
            </div>
            <ul className="mt-6 flex max-w-3xl flex-col gap-3 text-sm font-semibold leading-6 text-[color:var(--color-navy)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
              {["Klare Bewertung", "Strukturierter Verkauf", "Geprüfte Käufer"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-navy)] text-[color:var(--color-navy)]">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-2 w-2" fill="none">
                      <path d="m4 8.2 2.4 2.4L12 5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[color:var(--color-brass)]/25 bg-white/92 p-6 shadow-[0_28px_90px_-58px_rgba(27,48,64,0.65)] backdrop-blur md:p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
              Ein Hausverkauf beginnt nicht mit einem Inserat.
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Er beginnt mit einer belastbaren Einschätzung: Was ist realistisch erzielbar, welche Käufer kommen infrage und wie wird der Verkauf sicher geführt?
            </p>
          </div>
        </div>
      </section>

      <AurichHeroLinks />
      <RegionalCrossLinks data={data} placement="hero" />

      <Section title={`Warum viele Hausverkäufe ${locationPhrase} unnötig schwer werden`}>
        <p>Viele Eigentümer starten mit einer groben Preisvorstellung. Genau hier entstehen die größten Risiken.</p>
        <p>Ist der Angebotspreis zu hoch, bleibt das Haus zu lange am Markt. Interessenten werden vorsichtig, Besichtigungen nehmen ab und spätere Preisreduzierungen wirken wie ein Warnsignal.</p>
        <p>Ist der Preis zu niedrig, entsteht zwar schnell Nachfrage - aber ein Teil des möglichen Verkaufserlöses bleibt liegen.</p>
        <p>Für dich zählt deshalb nicht irgendein Wunschpreis, sondern ein Preisrahmen, der zum Haus, zur Lage {locationPhrase}, zur Nachfrage und zur aktuellen Marktsituation passt.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard title="Zu hoch angesetzt" text="Das Haus bleibt länger sichtbar. Nachfrage und Verhandlungsposition werden schwächer." />
          <InfoCard title="Zu niedrig angesetzt" text="Der Verkauf wirkt schnell - aber du verschenkst mögliches Kapital." />
          <InfoCard title="Richtig eingeordnet" text="Der Verkauf startet mit Klarheit, Struktur und einer realistischen Preisstrategie." />
        </div>
      </Section>

      <Section title={`Der Hausmarkt ${locationPhrase} entscheidet über Tempo und Preis`} muted>
        <p>Ein guter Verkaufspreis entsteht nicht allein aus Wohnfläche, Baujahr oder Grundstücksgröße. Entscheidend ist, wie der Markt {locationPhrase} aktuell reagiert: Wie viele vergleichbare Häuser angeboten werden, wie schnell Käufer reagieren und welche Preisspannen tatsächlich akzeptiert werden.</p>
        <dl className="grid gap-4 md:grid-cols-4">
          <DataCard label="Ø Angebotspreis" value={formatEuro(offerPrice)} />
          <DataCard label="Ø Preis pro m²" value={formatEuroPerM2(housePriceM2)} />
          <DataCard label="Ø Vermarktungsdauer" value={formatDays(marketDays)} />
          <DataCard label="Nachfrage" value={demandLabel(salesCount)} />
        </dl>
        <p>Diese Werte geben dir eine erste Orientierung. Für deinen konkreten Verkauf zählt jedoch die individuelle Einordnung deines Hauses: Zustand, Lage, Grundstück, Energie, Modernisierung, Grundriss und Käuferzielgruppe.</p>
      </Section>

      <Section title={`Haus verkaufen ${locationPhrase} - mit dem 9+1 System`}>
        <p>Der erste Schritt ist dein Anruf. Danach übernehmen wir alle weiteren Schritte und führen den Verkauf klar, ruhig und strukturiert.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {steps.map(([index, title, text]) => (
            <StepCard key={`${index}-${title}`} index={index} title={title} text={text} />
          ))}
        </div>
      </Section>

      <Section title="Warum die richtige Einpreisung über den Verkaufserfolg entscheidet" muted>
        <p>Der erste Angebotspreis prägt die Wahrnehmung deines Hauses. Er entscheidet, ob Käufer aufmerksam werden, ob Besichtigungen entstehen und ob du in einer starken Verhandlungsposition bleibst.</p>
        <p>Ein zu hoher Preis wirkt zunächst attraktiv, führt aber häufig zu Stillstand. Ein zu niedriger Preis erzeugt Tempo, aber nicht automatisch den besten Verkaufserlös.</p>
        <p>Die richtige Preisstrategie verbindet Marktkenntnis, Bewertung, Nachfrageeinschätzung und Verkaufsziel. Genau darum geht es bei Frisia Immobilien: nicht irgendeinen Preis nennen, sondern den Verkauf von Anfang an sauber führen.</p>
        <div className="rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white p-5 text-lg font-semibold leading-8 text-[color:var(--color-navy)]">
          Nicht der höchste Startpreis ist entscheidend. Entscheidend ist der Preis, mit dem dein Haus ernsthaft nachgefragt und stark verhandelt wird.
        </div>
      </Section>

      <Section title="Nicht jeder Interessent ist ein Käufer">
        <p>Viele Anfragen bedeuten noch keinen sicheren Verkauf. Entscheidend ist, ob ein Interessent wirklich kaufen kann, ob die Finanzierung passt und ob die Kaufabsicht belastbar ist.</p>
        <p>Wir prüfen Interessenten deshalb strukturiert, bevor aus einer Anfrage ein ernsthafter Verkaufsschritt wird. Das schützt dich vor unnötigen Besichtigungen, Zeitverlust und unsicheren Verhandlungen.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard title="Finanzierung einschätzen" text="Wir achten darauf, ob die wirtschaftliche Grundlage plausibel ist." />
          <InfoCard title="Kaufabsicht erkennen" text="Wir unterscheiden zwischen Neugier, Vergleich und ernsthaftem Kaufinteresse." />
          <InfoCard title="Verhandlung vorbereiten" text="Wir führen Gespräche so, dass am Ende nicht nur Interesse entsteht, sondern ein belastbarer Abschluss." />
        </div>
      </Section>

      <Section title="Das Ergebnis: ein ruhiger Verkauf mit klarem Abschluss" muted>
        <p>Ein guter Hausverkauf fühlt sich nicht hektisch an. Er ist vorbereitet, nachvollziehbar und geführt.</p>
        <p>Du weißt, wo dein Haus preislich steht. Du weißt, welche Schritte folgen. Und du musst dich nicht mit jedem Detail allein beschäftigen.</p>
        <p>Frisia Immobilien übernimmt Bewertung, Strategie, Vermarktung, Käuferprüfung, Verhandlung und Abschlussbegleitung - mit regionaler Marktkenntnis {locationPhrase}, Aurich und ganz Ostfriesland.</p>
        <div className="grid gap-4 md:grid-cols-4">
          <InfoCard title="Klarer Preisrahmen" text="Du startest nicht mit Vermutungen, sondern mit Orientierung." />
          <InfoCard title="Strukturierter Ablauf" text="Jeder Schritt ist vorbereitet und nachvollziehbar." />
          <InfoCard title="Geprüfte Käufer" text="Nicht Masse zählt, sondern Abschlussfähigkeit." />
          <InfoCard title="Sicherer Abschluss" text="Vom ersten Gespräch bis zum Notartermin bleibt der Verkauf geführt." />
        </div>
      </Section>

      <section id="verkauf-planen" className="bg-[color:var(--color-navy)] py-12 text-white md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight md:text-[2.85rem]">
            Hausverkauf {locationPhrase} strukturiert starten
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Wenn du dein Haus {locationPhrase} verkaufen möchtest, beginnen wir mit einer klaren Einschätzung: realistische Preisspanne, passende Verkaufsstrategie und nächster sinnvoller Schritt.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/kontakt" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
              Verkauf planen
            </Link>
            <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 py-4 text-base font-semibold text-white">
              {PHONE_DISPLAY}
            </a>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/78">Ein kurzes Gespräch reicht für den Anfang. Danach weißt du, woran du bist.</p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Häufige Fragen zum Hausverkauf {locationPhrase}
          </h2>
          <div className="mt-6 divide-y divide-[color:var(--color-brass)]/20 rounded-xl border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_70px_-64px_rgba(27,48,64,0.45)]">
            {faqs.map((item, index) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
