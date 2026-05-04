import Image from "next/image";
import Link from "next/link";
import AurichMarketTeaser from "@/components/sections/AurichMarketTeaser";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import RegionalCrossLinks from "@/components/seo/RegionalCrossLinks";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { formatLocationPhrase } from "@/lib/seo/locationDisplay";
import { medianPricePerM2 } from "@/lib/seo/valuationLanding";
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
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} €` : "nicht verfügbar";
}

function formatEuroPerM2(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} €/m²` : "nicht verfügbar";
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
    <div className="rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white p-5 shadow-[0_18px_44px_-38px_rgba(27,48,64,0.48)]">
      <dt className="text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brackish)]">{label}</dt>
      <dd className="mt-3 text-2xl font-semibold leading-tight text-[color:var(--color-navy)]">{value}</dd>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)]">
          {item}
        </li>
      ))}
    </ul>
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

export default function HouseBuyingLocationTemplate({ data }: { data: LocationPageData }) {
  const locationPhrase = formatLocationPhrase(data.location);
  const housePriceM2 = medianPricePerM2(data.houseMarket);
  const housePrice = numeric(data.houseMarket?.median_preis_eur);
  const heroImage = "/images/immobilienbewertung/hero-background.webp";
  const showAurichMarketTeaser = data.location.location_slug === "aurich";

  const steps = [
    ["1", "Suche", "Du sichtest Angebote und vergleichst passende Immobilien."],
    ["2", "Besichtigung", "Du prüfst Lage, Zustand, Grundriss und Gesamtbild."],
    ["3", "Unterlagenprüfung", "Du prüfst Exposé, Energieausweis, Grundriss und relevante Objektunterlagen."],
    ["4", "Finanzierung", "Budget, Eigenkapital und Finanzierungszusage werden belastbar geklärt."],
    ["5", "Entscheidung", "Du triffst eine Kaufentscheidung auf Basis von Objekt, Preis und Rahmenbedingungen."],
    ["6", "Verhandlung", "Preis, Termine und weitere Rahmenbedingungen werden abgestimmt."],
    ["7", "Notartermin", "Der Kaufvertrag wird vorbereitet und notariell beurkundet."],
    ["8", "Kaufpreiszahlung", "Nach Fälligkeit wird der Kaufpreis gezahlt und der Eigentumswechsel vorbereitet."],
    ["9", "Übergabe", "Die Immobilie wird übergeben und der Abschluss sauber dokumentiert."],
  ] as const;

  const faqs = [
    {
      question: `Wie schwierig ist es, ein Haus ${locationPhrase} zu kaufen?`,
      answer: "Das hängt stark von Lage, Budget und Nachfrage ab. In gefragten Bereichen ist die Auswahl oft begrenzt, weshalb eine klare Suchstrategie wichtig ist.",
    },
    {
      question: `Wie hoch sind die Preise für Häuser ${locationPhrase}?`,
      answer: "Die Preise orientieren sich am Quadratmeterpreis, der Lage und dem Zustand der Immobilie. Durchschnittswerte geben eine Orientierung, ersetzen aber keine individuelle Betrachtung.",
    },
    {
      question: "Wie lange dauert es, ein passendes Haus zu finden?",
      answer: "Das kann stark variieren. Mit einer klaren Suchstrategie und einem Suchauftrag verkürzt sich die Zeit in der Regel deutlich.",
    },
    {
      question: "Warum sollte ich einen Suchauftrag nutzen?",
      answer: "Weil du schneller über passende Immobilien informiert wirst und auch Angebote erhältst, die nicht sofort öffentlich sichtbar sind.",
    },
    {
      question: "Wie unterstützt mich Frisia Immobilien beim Hauskauf?",
      answer: "Frisia Immobilien unterstützt dich bei der Einordnung des Marktes, der Auswahl passender Immobilien und begleitet dich durch den gesamten Kaufprozess - von der Suche bis zum Notartermin.",
    },
  ];

  return (
    <>
      <MobileHeroSection
        eyebrow={`Haus kaufen ${locationPhrase}`}
        title={<>Haus kaufen {locationPhrase}</>}
        description={`Orientierung im aktuellen Markt und klare Schritte, um passende Immobilien ${locationPhrase} zu finden.`}
        imageSrc={heroImage}
        imageAlt=""
        imagePosition="right center"
        primaryCta={{ href: "/suchauftrag", label: "Suchauftrag starten" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Persönlich", "Sicher", "Regional"]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-right opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.50)_34%,rgba(255,255,255,0.18)_58%,rgba(255,255,255,0.04)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-12">
          <div className="max-w-[47rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Haus kaufen {locationPhrase}
            </p>
            <h1 className="mt-5 max-w-full break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              Haus kaufen {locationPhrase}
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-3xl text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:text-[1.35rem]">
              Orientierung im aktuellen Markt und klare Schritte, um passende Immobilien {locationPhrase} zu finden.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/suchauftrag" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Suchauftrag starten
              </Link>
              <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/75 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
                {PHONE_DISPLAY}
              </a>
            </div>
            <ul className="mt-6 flex max-w-4xl flex-wrap gap-x-8 gap-y-3 text-[1.02rem] font-semibold leading-7 text-[color:var(--color-navy)] md:text-[1.18rem]">
              {["Persönlich & lokal", "Sicher & transparent", "Bestpreis für deine Immobilie"].map((item) => (
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
              Ein Hauskauf beginnt nicht mit der ersten Besichtigung.
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Er beginnt mit einer klaren Einordnung: Markt, Preisniveau und die richtige Suchstrategie.
            </p>
          </div>
        </div>
      </section>

      <AurichHeroLinks />
      <RegionalCrossLinks data={data} placement="hero" />

      <Section title={`Der Markt für Häuser ${locationPhrase}`}>
        <p>Wer ein Haus {locationPhrase} kaufen möchte, trifft auf einen Markt, der sich stetig verändert. Entscheidend ist, wie Angebot und Nachfrage aktuell zusammenwirken.</p>
        <BulletList
          items={[
            "In gefragten Lagen ist das Angebot begrenzt, während die Nachfrage stabil bleibt",
            "Gute Immobilien werden oft schnell entschieden",
            "Nicht jedes Objekt erreicht den offenen Markt",
          ]}
        />
        <p className="font-semibold text-[color:var(--color-navy)]">Die größte Herausforderung ist nicht das Finden - sondern das rechtzeitige Finden der passenden Immobilie.</p>
      </Section>

      <Section title={`Preisniveau für Häuser ${locationPhrase}`} muted>
        <p>Das Preisniveau gibt dir eine erste Orientierung, in welchem Bereich sich Immobilien {locationPhrase} bewegen.</p>
        <dl className="grid gap-4 md:grid-cols-2">
          <DataCard label="Ø Preis pro m²" value={formatEuroPerM2(housePriceM2)} />
          <DataCard label="Ø Kaufpreise Häuser" value={formatEuro(housePrice)} />
        </dl>
        <p>Der tatsächliche Kaufpreis hängt immer von Lage, Zustand, Grundstück, Energieeffizienz und Nachfrage ab.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Der Quadratmeterpreis zeigt den Markt - die konkrete Immobilie entscheidet über den finalen Preis.</p>
      </Section>

      {showAurichMarketTeaser ? <AurichMarketTeaser tone="white" /> : null}

      <Section title={`Wie der Kauf eines Hauses ${locationPhrase} abläuft`} muted={showAurichMarketTeaser}>
        <p>Ein Hauskauf folgt in der Regel einem klaren Ablauf - unabhängig von Lage oder Objekt.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(([index, title, text]) => (
            <StepCard key={`${index}-${title}`} index={index} title={title} text={text} />
          ))}
        </div>
        <p className="font-semibold text-[color:var(--color-navy)]">Ein strukturierter Ablauf reduziert Unsicherheit und sorgt dafür, dass Entscheidungen klar getroffen werden können.</p>
      </Section>

      <Section title={`Wie du schneller passende Häuser ${locationPhrase} findest`} muted={!showAurichMarketTeaser}>
        <p>Viele Kaufinteressenten sehen nur die Immobilien, die bereits online sind. Ein Teil der passenden Objekte wird jedoch frühzeitig vergeben oder gezielt an vorgemerkte Interessenten weitergegeben.</p>
        <BulletList
          items={[
            "klare Definition deiner Suchkriterien",
            "schnelle Reaktion auf neue Angebote",
            "Zugang zu Immobilien vor der breiten Veröffentlichung",
            "realistische Preisvorstellung",
          ]}
        />
        <p className="font-semibold text-[color:var(--color-navy)]">Eine gute Suchstrategie entscheidet darüber, ob du passende Immobilien rechtzeitig erreichst.</p>
      </Section>

      <Section title={`Suchauftrag für Häuser ${locationPhrase}`} muted={showAurichMarketTeaser}>
        <p>Mit einem Suchauftrag wirst du nicht nur informiert, sondern gezielt berücksichtigt.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title="Früher Zugang" text="Du erhältst passende Immobilien, bevor sie vollständig am Markt sichtbar sind." />
          <InfoCard title="Gezielte Auswahl" text="Du bekommst nur Angebote, die wirklich zu deinen Kriterien passen." />
          <InfoCard title="Zeitersparnis" text="Du musst nicht ständig selbst suchen und vergleichen." />
          <InfoCard title="Struktur im Prozess" text="Du bleibst im Markt präsent, ohne aktiv jede Plattform beobachten zu müssen." />
        </div>
        <p className="font-semibold text-[color:var(--color-navy)]">Ein Suchauftrag erhöht die Wahrscheinlichkeit, die passende Immobilie zur richtigen Zeit zu finden.</p>
      </Section>

      <section id="suchauftrag-anlegen" className="bg-[color:var(--color-navy)] py-12 text-white md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight md:text-[2.85rem]">
            Suchauftrag für Häuser {locationPhrase} anlegen
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Wenn du ein Haus {locationPhrase} suchst, beginnen wir mit einer klaren Struktur: Deine Kriterien, dein Budget und deine Zielvorstellung.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/suchauftrag" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
              Suchauftrag anlegen
            </Link>
            <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 py-4 text-base font-semibold text-white">
              {PHONE_DISPLAY}
            </a>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/78">Ein kurzer Einstieg reicht. Danach wirst du automatisch über passende Immobilien informiert.</p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Häufige Fragen zum Hauskauf {locationPhrase}
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
