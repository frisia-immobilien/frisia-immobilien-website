import Image from "next/image";
import Link from "next/link";
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

export default function PropertySellingLocationTemplate({ data }: { data: LocationPageData }) {
  const locationPhrase = formatLocationPhrase(data.location);
  const housePriceM2 = medianPricePerM2(data.houseMarket);
  const apartmentPriceM2 = medianPricePerM2(data.apartmentMarket);
  const priceM2 = housePriceM2 ?? apartmentPriceM2;
  const offerPrice = numeric(data.houseMarket?.median_preis_eur) ?? numeric(data.apartmentMarket?.median_preis_eur);
  const marketDays = daysOnMarket(data.houseMarket, data.apartmentMarket);
  const salesCount = totalSalesCount(data.houseMarket, data.apartmentMarket);
  const heroImage = "/images/immobilienbewertung/hero-background.webp";
  const headline = data.content.h1;
  const intro = data.content.intro;

  const faqs = [
    {
      question: `Wann sollte ich meine Immobilie ${locationPhrase} verkaufen?`,
      answer: "Ein Verkauf ist sinnvoll, wenn deine persönliche Situation und der Markt zusammenpassen. Dabei spielen Lebensphase, Zielsetzung und aktuelle Nachfrage eine wichtige Rolle.",
    },
    {
      question: "Sollte ich meine Immobilie selbst verkaufen?",
      answer: "Das ist möglich, bedeutet aber, dass du alle Schritte selbst übernimmst. Viele Eigentümer unterschätzen den Aufwand und die Komplexität, insbesondere bei Preisfindung, Käuferprüfung und Verhandlung.",
    },
    {
      question: "Wie finde ich den richtigen Angebotspreis?",
      answer: "Der richtige Preis entsteht aus Marktanalyse, Vergleichsobjekten und individueller Bewertung. Er sollte so gewählt sein, dass Nachfrage entsteht und gleichzeitig Verhandlungsspielraum bleibt.",
    },
    {
      question: `Wie lange dauert ein Immobilienverkauf ${locationPhrase}?`,
      answer: "Das hängt von Lage, Zustand, Preisstrategie und Nachfrage ab. Ein strukturierter Verkauf mit realistischer Einpreisung verläuft in der Regel deutlich klarer und planbarer.",
    },
    {
      question: "Was bringt mir ein erstes Gespräch mit Frisia Immobilien?",
      answer: `Du erhältst eine klare Einschätzung deiner Situation, eine Einordnung des Marktes ${locationPhrase} und eine Orientierung, wie ein sinnvoller nächster Schritt aussehen kann - ohne Verpflichtung.`,
    },
  ];

  return (
    <>
      <MobileHeroSection
        eyebrow={headline}
        title={headline}
        description={intro}
        imageSrc={heroImage}
        imageAlt=""
        imagePosition="right center"
        primaryCta={{ href: "#orientierung-starten", label: "Orientierung starten" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Klare Bewertung", "Strukturierter Verkauf", "Geprüfte Käufer"]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-right opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.50)_34%,rgba(255,255,255,0.18)_58%,rgba(255,255,255,0.04)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-12">
          <div className="max-w-[47rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              {headline}
            </p>
            <h1 className="mt-5 max-w-full break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              {headline}
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-3xl text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:text-[1.35rem]">
              {intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#orientierung-starten" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Orientierung starten
              </Link>
              <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/75 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
                {PHONE_DISPLAY}
              </a>
            </div>
            <ul className="mt-6 flex max-w-4xl flex-wrap gap-x-8 gap-y-3 text-[1.02rem] font-semibold leading-7 text-[color:var(--color-navy)] md:text-[1.18rem]">
              {["Klare Bewertung", "Strukturierter Verkauf", "Geprüfte Käufer"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[color:var(--color-navy)] text-[color:var(--color-navy)]">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                      <path d="m4 8.2 2.4 2.4L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[color:var(--color-brass)]/25 bg-white/92 p-6 shadow-[0_28px_90px_-58px_rgba(27,48,64,0.65)] backdrop-blur md:p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
              Ein Immobilienverkauf beginnt mit der richtigen Entscheidung.
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Ist jetzt der richtige Zeitpunkt? Welcher Preis ist realistisch? Und welcher Weg passt zu dir?
            </p>
          </div>
        </div>
      </section>

      <RegionalCrossLinks data={data} placement="hero" />

      <Section title={`Wann ist ein Immobilienverkauf ${locationPhrase} sinnvoll?`}>
        <p>Ob ein Verkauf sinnvoll ist, hängt nicht nur vom Markt ab, sondern vor allem von deiner persönlichen Situation.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title="Veränderte Wohnsituation" text="Zu groß, zu klein oder eine neue Lebensphase: Die Immobilie passt nicht mehr zur aktuellen Situation." />
          <InfoCard title="Erbe oder Übergang" text="Familiäre Veränderungen, Erbengemeinschaften oder neue Verantwortlichkeiten brauchen eine klare Einordnung." />
          <InfoCard title="Kapital freisetzen" text="Ein Verkauf kann neue Investitionspläne, Entlastung oder finanzielle Spielräume ermöglichen." />
          <InfoCard title="Standortwechsel" text="Berufliche oder private Veränderungen können den Verkauf sinnvoll machen." />
        </div>
        <p>Der Markt {locationPhrase} beeinflusst vor allem Preis und Vermarktungsdauer. Eine hohe Nachfrage kann den Verkauf erleichtern, eine schwächere Nachfrage erfordert mehr Struktur und eine präzisere Einpreisung.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Es gibt keinen perfekten Zeitpunkt. Es gibt nur eine Entscheidung, die zu deiner Situation und zum aktuellen Markt passt.</p>
      </Section>

      <Section title="Immobilie selbst verkaufen oder mit Makler?" muted>
        <p>Grundsätzlich hast du zwei Wege: den Verkauf in Eigenregie oder den Verkauf mit einem Makler.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title="Selbst verkaufen" text="Du behältst die volle Kontrolle, übernimmst aber auch Preisfindung, Unterlagen, Vermarktung, Besichtigungen, Verhandlungen und Abschluss." />
          <InfoCard title="Mit Makler verkaufen" text="Du gibst den Prozess in strukturierte Hände. Bewertung, Strategie, Vermarktung, Käuferprüfung und Abschluss werden geführt." />
        </div>
        <p>Der Unterschied liegt nicht nur im Aufwand, sondern in der Qualität der Entscheidung, der Preisstrategie und der Sicherheit im Ablauf.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Die Frage ist nicht nur, wer verkauft - sondern wie strukturiert und sicher der Verkauf abläuft.</p>
      </Section>

      <Section title="Zeit oder Preis - was ist dir wichtiger?">
        <p>Jeder Immobilienverkauf bewegt sich zwischen zwei Polen: Geschwindigkeit und maximaler Verkaufserlös.</p>
        <p>Ein schneller Verkauf entsteht oft durch einen attraktiven Preis. Ein möglichst hoher Preis erfordert dagegen mehr Geduld, Struktur und eine präzise Strategie.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title="Schneller Verkauf" text="Kürzere Vermarktungsdauer, höhere Nachfrage und oft geringerer Verhandlungsspielraum." />
          <InfoCard title="Maximaler Preis" text="Längere Vermarktungszeit möglich, gezielte Käuferansprache und stärkere Verhandlungsführung." />
        </div>
        <p className="font-semibold text-[color:var(--color-navy)]">Die richtige Strategie hängt davon ab, welches Ziel du verfolgst - und wie der Markt {locationPhrase} aktuell reagiert.</p>
      </Section>

      <Section title={`Der Immobilienmarkt ${locationPhrase} im Überblick`} muted>
        <p>Der Markt {locationPhrase} gibt den Rahmen vor, in dem dein Verkauf stattfindet.</p>
        <dl className="grid gap-4 md:grid-cols-4">
          <DataCard label="Ø Preis pro m²" value={formatEuroPerM2(priceM2)} />
          <DataCard label="Ø Angebotspreise" value={formatEuro(offerPrice)} />
          <DataCard label="Ø Vermarktungsdauer" value={formatDays(marketDays)} />
          <DataCard label="Nachfrage" value={demandLabel(salesCount)} />
        </dl>
        <p>Diese Werte geben eine erste Orientierung. Entscheidend ist jedoch, wie deine Immobilie konkret in diesen Markt einzuordnen ist. Lage, Zustand, Grundstück, Energie und Zielgruppe beeinflussen den tatsächlich erzielbaren Preis deutlich.</p>
      </Section>

      <Section title="Was ist in deiner Situation sinnvoll?">
        <p>Ein Immobilienverkauf ist keine Standardentscheidung. Es geht nicht nur um den Markt, sondern um deine Ausgangslage, dein Ziel und deine Erwartungen.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title="Ist jetzt der richtige Zeitpunkt?" text="Wir ordnen persönliche Situation und Marktlage zusammen ein." />
          <InfoCard title="Welcher Preis ist realistisch erreichbar?" text="Du bekommst eine klare Orientierung statt eines pauschalen Durchschnittswerts." />
          <InfoCard title="Wie viel Zeit möchtest du investieren?" text="Wir zeigen, welcher Weg zu deinem zeitlichen Rahmen passt." />
          <InfoCard title="Wie sicher soll der Ablauf sein?" text="Du erkennst, welche Struktur dein Verkauf braucht." />
        </div>
        <p>Bevor du verkaufst, solltest du deine Situation klar einordnen. Genau dabei unterstützen wir dich - mit einer ruhigen, strukturierten Einschätzung ohne Druck.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Du musst dich nicht sofort festlegen. Es reicht, den nächsten sinnvollen Schritt zu kennen.</p>
      </Section>

      <section id="orientierung-starten" className="bg-[color:var(--color-navy)] py-12 text-white md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight md:text-[2.85rem]">
            Deine Immobilie {locationPhrase} richtig einordnen
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Wenn du darüber nachdenkst, deine Immobilie {locationPhrase} zu verkaufen, beginnen wir mit einer klaren Orientierung: Markt, Preisrahmen und passende Vorgehensweise.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/kontakt" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
              Orientierung starten
            </Link>
            <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 py-4 text-base font-semibold text-white">
              {PHONE_DISPLAY}
            </a>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/78">Ein kurzes Gespräch reicht. Danach weißt du, wie deine Situation einzuordnen ist.</p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Häufige Fragen zum Immobilienverkauf {locationPhrase}
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
