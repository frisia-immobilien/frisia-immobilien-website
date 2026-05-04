import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import RegionalCrossLinks, { RegionalInlineLinks, RegionalLocalFAQ } from "@/components/seo/RegionalCrossLinks";
import AurichMarketTeaser from "@/components/sections/AurichMarketTeaser";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import {
  ADDRESS,
  AREA_SERVED,
  BRAND_NAME,
  EMAIL,
  PHONE_DISPLAY,
  PHONE_E164,
  PHONE_HREF,
  SITE_URL,
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createFAQPageJsonLd,
  createRealEstateAgentJsonLd,
  createServiceJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

const PAGE_PATH = "/immobilienmakler-aurich";
const PAGE_TITLE = "Immobilienmakler Aurich – Frisia Immobilien";
const PAGE_DESCRIPTION =
  "Haus in Aurich verkaufen? Frisia Immobilien begleitet dich mit klarer Preisstrategie und Struktur bis zum Notartermin.";
const HERO_IMAGE = "/images/hero/haus-verkaufen-aurich.webp";

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESCRIPTION,
  keywords: [
    "Immobilienmakler Aurich",
    "Makler Aurich",
    "Immobilienmakler Ostfriesland",
    "Haus verkaufen Aurich",
    "Immobilienbewertung Aurich",
    "Immobilienmarkt Aurich",
  ],
  alternates: {
    canonical: absoluteUrl(PAGE_PATH),
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl(PAGE_PATH),
    type: "website",
    siteName: BRAND_NAME,
    locale: "de_DE",
    images: [
      {
        url: absoluteUrl(HERO_IMAGE),
        alt: "Immobilienmakler Aurich - Frisia Immobilien",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [absoluteUrl(HERO_IMAGE)],
  },
  metadataBase: new URL(SITE_URL),
};

const whyFrisiaItems = [
  {
    icon: "/images/immobilienmakler-aurich/zielscheibe.webp",
    title: "Realistische Preisstrategie statt unrealistischer Lockpreise",
  },
  {
    icon: "/images/immobilienmakler-aurich/people.webp",
    title: "Geprüfte Käufer statt unnötiger Besichtigungen",
  },
  {
    icon: "/images/immobilienmakler-aurich/klemmbrett.webp",
    title: "Klare Abläufe statt Unsicherheit",
  },
  {
    icon: "/images/immobilienmakler-aurich/person.webp",
    title: "Persönliche Begleitung bis zum Notartermin",
  },
  {
    icon: "/images/immobilienmakler-aurich/haus.webp",
    title: "Du musst dich um nichts kümmern",
  },
] as const;

const processSteps = [
  {
    number: "+1",
    title: "Dein erster Schritt",
    text: "Du meldest dich bei uns - telefonisch oder digital. Wir klären kurz deine Situation und geben dir eine erste Einschätzung. Alles Weitere übernehmen wir.",
  },
  {
    number: "1",
    title: "Einordnung deiner Immobilie",
    text: "Wir analysieren deine Immobilie im aktuellen Markt in Aurich und ganz Ostfriesland. Lage, Zustand und Nachfrage werden realistisch eingeordnet - als Grundlage für alle weiteren Schritte.",
  },
  {
    number: "2",
    title: "Entwicklung einer realistischen Preisstrategie",
    text: "Du erhältst keinen Schätzwert, sondern eine fundierte Preisspanne. Ziel ist ein Preis, der Nachfrage erzeugt und gleichzeitig das volle Potenzial deiner Immobilie ausschöpft.",
  },
  {
    number: "3",
    title: "Vorbereitung der Vermarktung",
    text: "Alle relevanten Unterlagen werden strukturiert aufbereitet. Zusätzlich sorgen wir für eine klare und hochwertige Präsentation deiner Immobilie.",
  },
  {
    number: "4",
    title: "Gezielte Vermarktung in Aurich und Ostfriesland",
    text: "Deine Immobilie wird nicht einfach online gestellt, sondern gezielt positioniert - auf den passenden Plattformen und innerhalb unseres Netzwerks aus vorgemerkten Käufern.",
  },
  {
    number: "5",
    title: "Qualifizierung der Interessenten",
    text: "Wir prüfen alle Anfragen vorab. Nur ernsthafte und finanzierte Interessenten werden berücksichtigt - das spart dir Zeit und vermeidet unnötige Besichtigungen.",
  },
  {
    number: "6",
    title: "Strukturierte Besichtigungen",
    text: "Besichtigungen erfolgen geplant und mit passenden Interessenten. Deine Immobilie wird dabei klar und nachvollziehbar präsentiert.",
  },
  {
    number: "7",
    title: "Verhandlung mit klarer Strategie",
    text: "Wir führen die Gespräche mit dem Ziel, für dich den bestmöglichen Preis und sichere Bedingungen zu erreichen.",
  },
  {
    number: "8",
    title: "Vorbereitung des Kaufvertrags",
    text: "Alle Details werden mit dem Notar abgestimmt. Du erhältst volle Transparenz über den Ablauf und die Inhalte des Kaufvertrags.",
  },
  {
    number: "9",
    title: "Begleitung bis zum Notartermin und darüber hinaus",
    text: "Wir begleiten dich bis zum Abschluss und stehen auch danach als Ansprechpartner zur Verfügung - damit der gesamte Verkauf für dich klar und sicher abläuft.",
  },
] as const;

const regionItems = [
  { label: "Aurich", href: "/immobilienmakler-aurich" },
  { label: "Emden", href: "/immobilienmakler-emden" },
  { label: "Leer", href: "/immobilienmakler-leer" },
  { label: "Wittmund", href: "/immobilienmakler-wittmund" },
  { label: "Norden", href: "/immobilienmakler-norden" },
] as const;

const trustItems = [
  {
    value: "200+",
    label: "Erfolgreich vermittelte Immobilien in der Region.*",
  },
  {
    value: "50+",
    label: "Jahre kombinierte Markterfahrung im Team.*",
  },
  {
    icon: "/images/immobilienbewertung/locator_pin.webp",
    label: "Regional verwurzelt in Aurich und ganz Ostfriesland.",
  },
] as const;

const faqItems = [
  {
    question: "Wie finde ich den richtigen Immobilienmakler in Aurich?",
    answer:
      "Ein guter Immobilienmakler kennt den regionalen Markt in Aurich und ganz Ostfriesland genau und kann eine realistische Preiseinschätzung geben. Entscheidend sind Erfahrung, eine klare Vermarktungsstrategie und die Fähigkeit, Käufer gezielt zu prüfen. Wichtig ist auch, dass du einen festen Ansprechpartner hast, der dich zuverlässig durch den gesamten Verkaufsprozess begleitet.",
  },
  {
    question: "Ist ein Immobilienmakler beim Verkauf wirklich sinnvoll?",
    answer:
      "In den meisten Fällen ja. Ohne fundierte Marktkenntnis werden Immobilien häufig entweder zu günstig verkauft oder zu lange am Markt angeboten. Beides kostet Eigentümer Geld. Ein strukturierter Verkaufsprozess, eine realistische Preisstrategie und geprüfte Käufer sorgen dafür, dass ein Verkauf planbar und sicher abläuft.",
  },
  {
    question: "Was kostet ein Immobilienmakler in Aurich?",
    answer:
      "Die Provision beträgt in der Regel insgesamt 6 % zzgl. MwSt. und wird zwischen Käufer und Verkäufer aufgeteilt. Die genaue Regelung wird im Vorfeld transparent vereinbart. Entscheidend ist jedoch nicht die Provision, sondern das Ergebnis: Ein besser erzielter Verkaufspreis übersteigt die Kosten in vielen Fällen deutlich.",
  },
  {
    question: "Wie hoch ist der Quadratmeterpreis in Aurich?",
    answer:
      "Die Preise in Aurich variieren je nach Lage, Zustand und Objektart deutlich. Durchschnittswerte geben nur eine grobe Orientierung. Für eine fundierte Einschätzung ist immer eine individuelle Bewertung notwendig, da Faktoren wie Mikrolage, Grundstück und Ausstattung eine große Rolle spielen.",
  },
  {
    question: "Warum unterscheiden sich Immobilienpreise in Ostfriesland so stark?",
    answer:
      "Die Preisunterschiede entstehen durch Lage, Infrastruktur, Nachfrage und Zustand der Immobilie. Küstennahe Regionen oder Ferienlagen unterscheiden sich stark von ländlicheren Bereichen. Auch innerhalb von Aurich gibt es deutliche Unterschiede zwischen einzelnen Wohnlagen.",
  },
  {
    question: "Wie läuft der Verkauf mit einem Immobilienmakler ab?",
    answer:
      "Der Ablauf beginnt mit einer fundierten Bewertung und einer klaren Preisstrategie. Anschließend folgt die professionelle Vermarktung mit hochwertigen Fotos, Exposé und gezielter Ansprache von Interessenten. Besichtigungen werden organisiert, Käufer geprüft und der gesamte Prozess bis zum Notartermin begleitet.",
  },
  {
    question: "Wie lange dauert es, eine Immobilie in Aurich zu verkaufen?",
    answer:
      "Die Dauer hängt stark von Preisstrategie, Nachfrage und Objekt ab. Realistisch sind wenige Wochen bis mehrere Monate. Eine korrekte Preisfindung ist der wichtigste Faktor, um unnötige Verzögerungen zu vermeiden.",
  },
  {
    question: "Sollte ich meine Immobilie mit oder ohne Makler verkaufen?",
    answer:
      "Ein Privatverkauf kann funktionieren, birgt jedoch Risiken bei Preisfindung, Verhandlung und rechtlicher Abwicklung. Fehler führen oft zu finanziellen Nachteilen. Ein Makler sorgt für Struktur, Sicherheit und eine bessere Marktpositionierung.",
  },
  {
    question: "Wie funktioniert eine Immobilienbewertung?",
    answer:
      "Eine seriöse Bewertung basiert auf Vergleichsdaten, Lageanalyse und objektspezifischen Faktoren. Online-Rechner liefern nur erste Richtwerte. Für eine realistische Preisspanne ist eine individuelle Analyse notwendig.",
  },
  {
    question: "Kann ich meine Immobilie verkaufen, während ich noch darin wohne?",
    answer:
      "Ja, das ist möglich und häufig der Fall. Wichtig ist eine abgestimmte Vermarktung, die deine Privatsphäre berücksichtigt und Besichtigungen sinnvoll organisiert.",
  },
  {
    question: "Was ist besser: hoher Angebotspreis oder realistischer Marktpreis?",
    answer:
      "Ein zu hoher Einstiegspreis führt oft zu langen Vermarktungszeiten und späteren Preisreduzierungen. Ein realistischer Preis erzeugt Nachfrage, Wettbewerb und bessere Ergebnisse.",
  },
  {
    question: "Wann ist der beste Zeitpunkt, um eine Immobilie zu verkaufen?",
    answer:
      "Es gibt keinen perfekten Zeitpunkt. Entscheidender ist die aktuelle Nachfrage und eine saubere Vorbereitung des Verkaufs. Mit der richtigen Strategie lässt sich zu jeder Zeit ein guter Verkauf erzielen.",
  },
  {
    question: "Warum werden manche Immobilien zu günstig verkauft?",
    answer:
      "Oft fehlt eine fundierte Bewertung oder es wird emotional entschieden. Auch fehlende Marktkenntnis führt dazu, dass Potenziale nicht ausgeschöpft werden.",
  },
  {
    question: "Wie werden Käufer geprüft?",
    answer:
      "Seriöse Käufer werden auf Bonität und Finanzierungsfähigkeit geprüft, bevor es zu verbindlichen Schritten kommt. Das reduziert Risiken und sorgt für einen sicheren Ablauf.",
  },
  {
    question: "Was passiert nach dem Notartermin?",
    answer:
      "Nach dem Notartermin folgt die Kaufpreiszahlung und anschließend die Übergabe der Immobilie. Der gesamte Prozess wird strukturiert begleitet, damit alles reibungslos abläuft.",
  },
] as const;

function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex min-w-0 gap-3">
      <span
        aria-hidden="true"
        className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-[0.78rem] font-semibold text-white"
      >
        ✓
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

export default function ImmobilienmaklerAurichPage() {
  const realEstateAgentJsonLd = createRealEstateAgentJsonLd({
    "@id": absoluteUrl(`${PAGE_PATH}#real-estate-agent`),
    url: absoluteUrl(PAGE_PATH),
    name: BRAND_NAME,
    telephone: PHONE_E164,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.streetAddress,
      postalCode: ADDRESS.postalCode,
      addressLocality: ADDRESS.addressLocality,
      addressRegion: ADDRESS.addressRegion,
      addressCountry: "Deutschland",
    },
    areaServed: [...AREA_SERVED],
  });

  const webpageJsonLd = createWebPageJsonLd({
    path: PAGE_PATH,
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    imagePath: HERO_IMAGE,
    aboutId: absoluteUrl(`${PAGE_PATH}#real-estate-agent`),
  });

  const serviceJsonLd = createServiceJsonLd({
    path: PAGE_PATH,
    name: "Immobilienmakler Aurich",
    serviceType: "Immobilienmakler",
    description: PAGE_DESCRIPTION,
    providerId: absoluteUrl(`${PAGE_PATH}#real-estate-agent`),
  });

  const breadcrumbJsonLd = createBreadcrumbListJsonLd(PAGE_PATH, [
    { name: "Startseite", item: "/" },
    { name: "Immobilienmakler Aurich", item: PAGE_PATH },
  ]);

  const faqJsonLd = createFAQPageJsonLd(PAGE_PATH, faqItems);

  return (
    <main id="main-content" className="bg-white text-[color:var(--color-graphite)]">
      <JsonLd data={realEstateAgentJsonLd} />
      <JsonLd data={webpageJsonLd} />
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <MobileHeroSection
        eyebrow="Immobilienmakler in Aurich & Ostfriesland"
        title="Immobilienmakler Aurich"
        titleClassName="max-w-[18rem] text-[clamp(2.05rem,9.2vw,2.55rem)]"
        description={
          <div className="space-y-2.5">
            <p>Beim Verkauf entscheidet die richtige Einordnung.</p>
            <ul className="space-y-1.5 font-medium text-[color:var(--color-navy)]">
              <li className="flex gap-2">
                <span aria-hidden="true" className="shrink-0">✔</span>
                <span>Zu hoch → bleibt liegen</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="shrink-0">✔</span>
                <span>Zu niedrig → Geldverlust</span>
              </li>
            </ul>
            <p>
              Frisia Immobilien bewertet realistisch und begleitet dich bis zum Abschluss.
            </p>
          </div>
        }
        imageSrc={HERO_IMAGE}
        imageAlt="Ruhiges Wohnhaus in Aurich mit gepflegtem Garten"
        imagePosition="58% center"
        imageHeightClassName="h-[clamp(330px,calc(100svh-21rem),380px)]"
        imageQuality={55}
        primaryCta={{ href: "/immobilienbewertung-aurich", label: "Immobilie bewerten lassen" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Kostenfrei", "Regional", "Persönlich"]}
      />

      <section id="top" className="relative isolate hidden overflow-hidden border-b border-[color:var(--color-brass)]/15 bg-white md:block">
        <div className="absolute inset-0 -z-10">
          <Image
            src={HERO_IMAGE}
            alt="Ruhiges Wohnhaus in Aurich mit gepflegtem Garten"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={55}
            className="object-cover object-[58%_50%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,rgba(255,255,255,0.9)_24%,rgba(255,255,255,0.46)_43%,rgba(255,255,255,0.08)_62%,rgba(255,255,255,0)_82%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/90 to-transparent md:hidden" />
        </div>

        <div className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-[1440px] min-w-0 items-center px-5 pb-12 pt-16 sm:px-8 md:min-h-[calc(100svh-4rem)] md:grid-cols-[minmax(0,0.92fr)_minmax(18rem,0.8fr)] md:pb-16 md:pt-18 lg:px-12">
          <div className="w-full max-w-[43rem] min-w-0">
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Immobilienmakler Aurich
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-[3.2rem] leading-[0.98] tracking-[-0.018em] text-[color:var(--color-navy)] sm:text-[4.1rem] lg:text-[5.1rem]">
              Immobilienmakler Aurich
            </h1>
            <HeroDivider />
            <h2 className="mt-5 max-w-[18ch] font-[family-name:var(--font-playfair)] text-[2.35rem] leading-[1.06] tracking-[-0.014em] text-[color:var(--color-navy)] sm:text-[3.1rem] lg:text-[3.65rem]">
              Dein Immobilienmakler in Aurich und ganz Ostfriesland
            </h2>

            <div className="mt-7 w-full max-w-[43rem] min-w-0 space-y-4 text-[1.02rem] leading-[1.82] text-[color:var(--color-navy)] md:text-[1.08rem]">
              <p>
                Wenn du deine Immobilie in Aurich verkaufen möchtest, entscheidet vor allem die richtige Einordnung.
              </p>
              <ul className="space-y-3">
                <CheckLine>Wird der Preis zu hoch angesetzt, bleibt die Immobilie zu lange am Markt.</CheckLine>
                <CheckLine>Wird er zu niedrig gewählt, verlierst du bares Geld.</CheckLine>
              </ul>
            </div>

            <div className="mt-7 w-full min-w-0 rounded-[1.35rem] border border-[color:var(--color-brass)]/35 bg-white/86 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-[0.98rem] leading-[1.75] text-[color:var(--color-navy)]">
                Frisia Immobilien sorgt dafür, dass deine Immobilie realistisch bewertet, strukturiert vermarktet und mit dem passenden Käufer abgeschlossen wird - ruhig, klar und bis zum Notartermin begleitet.
              </p>
            </div>

            <div className="mt-7 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/immobilienbewertung-aurich"
                className="inline-flex min-h-14 w-full min-w-0 items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-7 py-4 text-center text-[0.98rem] font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] sm:w-auto"
              >
                Immobilie kostenlos bewerten
              </Link>
              <a
                href={PHONE_HREF}
                className="inline-flex min-h-14 w-full min-w-0 items-center justify-center gap-3 rounded-2xl border border-[color:var(--color-navy)]/28 bg-white/90 px-7 py-4 text-center text-[0.98rem] font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] sm:w-auto"
              >
                <Image
                  src="/images/icons/phone.webp"
                  alt=""
                  width={14}
                  height={14}
                  aria-hidden="true"
                  className="h-[13.5px] w-[13.5px] shrink-0 object-contain"
                />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="hidden md:block" />
        </div>
      </section>

      <AurichHeroLinks />

      <RegionalCrossLinks locationSlug="aurich" locationLabel="Aurich" templatePrefix="immobilienmakler" placement="hero" />

      <section className="bg-[color:var(--color-section)] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
              Vertrauen
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.15rem] leading-[1.12] text-[color:var(--color-navy)] md:text-[3rem]">
              Vertrauen durch Erfahrung
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex min-h-44 flex-col items-center justify-center rounded-[1.25rem] border border-[color:var(--color-brass)]/18 bg-white p-7 text-center shadow-[0_14px_40px_rgba(15,23,42,0.045)]"
              >
                {"value" in item ? (
                  <p className="font-[family-name:var(--font-playfair)] text-[2.45rem] leading-none text-[color:var(--color-navy)] md:text-[2.8rem]">
                    {item.value}
                  </p>
                ) : (
                  <Image
                    src={item.icon}
                    alt=""
                    width={64}
                    height={64}
                    sizes="64px"
                    className="h-16 w-16 object-contain"
                    aria-hidden="true"
                  />
                )}
                <p className="mt-4 text-[1.05rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AurichMarketTeaser tone="white" />

      <section className="bg-[color:var(--color-section)] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <div>
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
              Warum Makler?
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.15rem] leading-[1.12] text-[color:var(--color-navy)] md:text-[3rem]">
              Warum ein Immobilienmakler in Aurich den Unterschied macht
            </h2>
          </div>
          <div className="grid gap-4 text-[1rem] leading-[1.8] text-[color:var(--color-graphite)] md:text-[1.05rem]">
            <p>
              Der Immobilienmarkt in Aurich und Ostfriesland ist regional geprägt. Lage, Nachfrage und Preisniveau unterscheiden sich oft bereits innerhalb weniger Kilometer deutlich.
            </p>
            <p>
              Ohne fundierte Marktkenntnis entstehen häufig Unsicherheiten im Verkaufsprozess - oder Entscheidungen, die sich im Nachhinein als teuer herausstellen.
            </p>
            <p className="border-l-2 border-[color:var(--color-brass)] pl-5 font-semibold text-[color:var(--color-navy)]">
              Ein erfahrener Immobilienmakler übernimmt die Einordnung, strukturiert den Ablauf und sorgt für eine sichere Abwicklung.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
              Warum Frisia Immobilien?
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.15rem] leading-[1.12] text-[color:var(--color-navy)] md:text-[3rem]">
              Warum du mit Frisia Immobilien arbeitest
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {whyFrisiaItems.map((item) => (
              <article key={item.title} className="rounded-[1.25rem] border border-[color:var(--color-brass)]/18 bg-white p-7 text-center shadow-[0_16px_44px_rgba(15,23,42,0.045)]">
                <Image
                  src={item.icon}
                  alt=""
                  width={52}
                  height={52}
                  sizes="52px"
                  className="mx-auto h-13 w-13 object-contain"
                  aria-hidden="true"
                />
                <h3 className="mt-6 font-[family-name:var(--font-inter)] text-[1.02rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">
                  {item.title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
              Ablauf
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.15rem] leading-[1.12] text-[color:var(--color-navy)] md:text-[3rem]">
              So läuft der Verkauf mit Frisia Immobilien
            </h2>
            <p className="mt-5 max-w-3xl text-[1.02rem] leading-[1.75] text-[color:var(--color-graphite)]">
              Ein klar strukturierter Ablauf nach dem Frisia 9+1 Verkaufsprozess - speziell für dich als Eigentümer in Aurich, Ostfriesland und den umliegenden Teilmärkten.
            </p>
          </div>

          <ol className="mt-12 grid gap-5 md:grid-cols-2">
            {processSteps.map((step) => (
              <li key={step.number} className="rounded-[1.25rem] border border-[color:var(--color-brass)]/14 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.035)]">
                <div className="flex gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-sm font-semibold text-white">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-[1.05rem] font-semibold leading-[1.45] text-[color:var(--color-navy)]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[0.97rem] leading-[1.72] text-[color:var(--color-graphite)]">
                      {step.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[1.6rem] border border-[color:var(--color-brass)]/18 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <Image
              src="/images/regions/immobilienmakler-aurich-karte-hell.webp"
              alt="Regionale Einordnung für Aurich und Ostfriesland"
              width={780}
              height={520}
              sizes="(max-width: 1024px) 92vw, 560px"
              className="h-auto w-full rounded-[1.1rem] object-contain"
            />
          </div>

          <div>
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
              Regionale Einordnung
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.15rem] leading-[1.12] text-[color:var(--color-navy)] md:text-[3rem]">
              Der Immobilienmarkt in Aurich und Ostfriesland
            </h2>
            <div className="mt-6 space-y-4 text-[1rem] leading-[1.8] text-[color:var(--color-graphite)]">
              <p>
                Aurich, Emden, Leer, Wittmund und Norden unterscheiden sich deutlich in Nachfrage und Preisentwicklung.
              </p>
              <p>
                Wir ordnen deine Immobilie exakt im aktuellen Markt ein und entwickeln daraus eine tragfähige Preisstrategie - als Grundlage für einen erfolgreichen Verkauf.
              </p>
            </div>
            <div className="mt-6 rounded-[1.2rem] border border-[color:var(--color-brass)]/18 bg-white p-5">
              <p className="text-[0.98rem] font-semibold leading-[1.55] text-[color:var(--color-navy)]">
                Das bedeutet konkret:
              </p>
              <ul className="mt-4 space-y-2 text-[0.98rem] leading-[1.65] text-[color:var(--color-graphite)]">
                <CheckLine>Unterschiedliche Preisniveaus je nach Lage</CheckLine>
                <CheckLine>Unterschiedliche Käufergruppen</CheckLine>
                <CheckLine>Unterschiedliche Vermarktungsdauer</CheckLine>
              </ul>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {regionItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-[color:var(--color-brass)]/22 bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-section)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
              FAQ
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.15rem] leading-[1.12] text-[color:var(--color-navy)] md:text-[3rem]">
              Häufige Fragen zum Immobilienmakler in Aurich
            </h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <details key={item.question} open={index === 0} className="group rounded-[1rem] border border-[color:var(--color-brass)]/18 bg-white px-5 py-4 shadow-[0_12px_34px_rgba(15,23,42,0.035)]">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold leading-[1.5] text-[color:var(--color-navy)]">
                  <span>{item.question}</span>
                  <span className="mt-0.5 text-xl leading-none text-[color:var(--color-brackish)] group-open:hidden" aria-hidden="true">
                    +
                  </span>
                  <span className="mt-0.5 hidden text-xl leading-none text-[color:var(--color-brackish)] group-open:inline" aria-hidden="true">
                    -
                  </span>
                </summary>
                <p className="mt-3 text-[0.98rem] leading-[1.75] text-[color:var(--color-graphite)]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-[1.8rem] border border-[color:var(--color-brass)]/18 bg-[color:var(--color-section)] px-6 py-8 shadow-[0_18px_52px_rgba(15,23,42,0.055)] md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-10">
          <div>
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
              Nächster Schritt
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.1rem] leading-[1.12] text-[color:var(--color-navy)] md:text-[2.8rem]">
              Was ist deine Immobilie aktuell wert?
            </h2>
            <p className="mt-4 max-w-2xl text-[1.02rem] leading-[1.75] text-[color:var(--color-graphite)]">
              Dann starte einfach mit einer ersten Einschätzung - und wir zeigen dir, in welchem Preisrahmen ein Verkauf realistisch möglich ist.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link
              href="/immobilienbewertung-aurich"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-7 py-4 text-[0.98rem] font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              Immobilie jetzt bewerten
            </Link>
            <a
              href={PHONE_HREF}
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-[color:var(--color-navy)]/25 bg-white px-7 py-4 text-[0.98rem] font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              Anrufen
            </a>
          </div>
        </div>
      </section>

      <RegionalInlineLinks locationSlug="aurich" locationLabel="Aurich" templatePrefix="immobilienmakler" pageType="immobilienmakler" />
      <RegionalLocalFAQ locationSlug="aurich" locationLabel="Aurich" templatePrefix="immobilienmakler" pageType="immobilienmakler" />
      <RegionalCrossLinks locationSlug="aurich" locationLabel="Aurich" templatePrefix="immobilienmakler" placement="bottom" />

      <section className="bg-[color:var(--color-section)] px-5 pb-6 sm:px-8 lg:px-12" aria-label="Hinweis zu Erfahrungswerten">
        <div className="mx-auto max-w-6xl">
          <p className="text-right text-[0.78rem] leading-relaxed text-[color:var(--color-graphite)]/55">
            *Die Angaben beziehen sich auf die gemeinsame Berufserfahrung und die vermittelten Immobilien des Teams von Frisia Immobilien.
          </p>
        </div>
      </section>
    </main>
  );
}
