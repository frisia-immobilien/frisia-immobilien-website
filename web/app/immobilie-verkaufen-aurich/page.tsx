import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import LeadGenWizard from "@/components/immobilienbewertung/LeadGenWizard.client";
import { buildPageMetadata } from "@/lib/metadata";
import {
  AREA_SERVED,
  PHONE_DISPLAY,
  PHONE_HREF,
  SITE_URL,
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createFAQPageJsonLd,
  createLocalBusinessJsonLd,
  createRealEstateAgentJsonLd,
  createServiceJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

const PATH = "/immobilie-verkaufen-aurich";
const META_TITLE = "Immobilie verkaufen Aurich | Bewertung & Verkauf mit Frisia Immobilien";
const META_DESCRIPTION =
  "Immobilie in Aurich verkaufen? Frisia Immobilien begleitet dich mit fundierter Bewertung, klarer Verkaufsstrategie und persönlicher Betreuung in Aurich und Ostfriesland.";
const HERO_IMAGE = "/images/hero/immobilie-verkaufen-aurich-hero-galgen.png";
const HERO_REFERENCES_IMAGE = "/images/hero/referenzen_eigentuemer_isolated_browser.png";
const HERO_LOCK_IMAGE = "/images/hero/schloss.png";
const SEBASTIAN_IMAGE =
  "/images/hero/dekra-zertifizierter-sachverstaendiger-fuer-immobilenbewertung-d1-sebastian_munzig.webp";

const trustItems = [
  "Regionaler Markt in Aurich und ganz Ostfriesland",
  "Bewertung und Verkauf aus einer Hand",
  "Persönliche Begleitung bis zum Notartermin",
] as const;

const heroTrustItems = [
  "Persönlich & lokal",
  "Sicher & transparent",
  "Bestpreis für deine Immobilie",
] as const;

const heroStats = [
  { value: "200+", label: "Verkaufte Immobilien*" },
  { value: "4,8★", label: "Kundenbewertung" },
  { value: "50+", label: "Jahre Erfahrung*" },
  { value: "100%", label: "Persönlich für dich da" },
] as const;

const problemCards = [
  {
    title: "Zu niedrig angesetzt",
    text: "Du verlierst sofort Geld, oft ohne es im ersten Moment zu bemerken.",
  },
  {
    title: "Zu hoch gestartet",
    text: "Die Immobilie bleibt zu lange am Markt und verliert an wahrgenommener Attraktivität.",
  },
  {
    title: "Unklare Unterlagen",
    text: "Käufer und Banken werden unsicher, Rückfragen verzögern den Verkauf.",
  },
  {
    title: "Ungeprüfte Interessenten",
    text: "Besichtigungen kosten Zeit, ohne dass daraus ein belastbarer Abschluss entsteht.",
  },
  {
    title: "Schwache Verhandlung",
    text: "Am Ende entscheidet nicht nur der Preis, sondern die ruhige Führung im Prozess.",
  },
] as const;

const avoidMistakes = [
  "Ohne fundierte Bewertung starten",
  "Den Angebotspreis nach Gefühl festlegen",
  "Zu früh mit ungeprüften Interessenten sprechen",
  "Unterlagen erst beschaffen, wenn Käufer schon nachfragen",
  "Besichtigungen ohne klare Verkaufsstrategie durchführen",
  "Zu lange warten, bis der Markt korrigiert",
] as const;

const solutionItems = [
  "Fundierte Marktwerteinschätzung",
  "Klare Preisstrategie",
  "Prüfung der Verkaufsunterlagen",
  "Professionelle Präsentation",
  "Gezielte Vermarktung",
  "Qualifizierte Käuferauswahl",
  "Ruhige Verhandlungsführung",
  "Begleitung bis zum Notartermin",
] as const;

const principleSteps = [
  { label: "+1", title: "Dein Anruf / deine Anfrage" },
  { label: "1", title: "Bewertung" },
  { label: "2", title: "Unterlagen" },
  { label: "3", title: "Strategie" },
  { label: "4", title: "Präsentation" },
  { label: "5", title: "Vermarktung" },
  { label: "6", title: "Käuferprüfung" },
  { label: "7", title: "Besichtigung" },
  { label: "8", title: "Verhandlung" },
  { label: "9", title: "Notartermin & Übergabe" },
] as const;

const processPhases = [
  {
    title: "Klarheit schaffen",
    text: "Bewertung, Situation, Ziel und Unterlagen werden sauber eingeordnet.",
  },
  {
    title: "Verkauf vorbereiten",
    text: "Preisstrategie, Präsentation, Exposé und Vermarktungsweg werden festgelegt.",
  },
  {
    title: "Käufer finden",
    text: "Reichweite, Vorauswahl und geprüfte Interessenten bringen Ordnung in die Nachfrage.",
  },
  {
    title: "Sicher verhandeln",
    text: "Kommunikation, Preisführung und Abschlussvorbereitung bleiben in einer Hand.",
  },
  {
    title: "Notar & Übergabe",
    text: "Frisia Immobilien begleitet den Verkauf bis zur rechtssicheren Übergabe.",
  },
] as const;

const whyItems = [
  "Regionaler Markt in Aurich und ganz Ostfriesland",
  "Persönliche Verantwortung statt anonymer Abwicklung",
  "Bewertung und Verkauf aus einer Hand",
  "Klassische Werte: Verlässlichkeit, Pünktlichkeit, klare Absprachen",
  "Moderne Vermarktung ohne laute Selbstdarstellung",
  "Strukturierter Prozess statt Zufall",
] as const;

const districts = [
  "Innenstadt",
  "Extum",
  "Haxtum",
  "Walle",
  "Sandhorst",
  "Tannenhausen",
  "Egels",
  "Kirchdorf",
  "Wallinghausen",
  "Popens",
] as const;

const internalLinks = [
  { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
  { href: "/immobilienmakler-aurich", label: "Immobilienmakler Aurich" },
  { href: "/haus-verkaufen-aurich", label: "Haus verkaufen Aurich" },
  { href: "/kontakt", label: "Kontakt aufnehmen" },
] as const;

const faqItems = [
  {
    question: "Was ist meine Immobilie in Aurich wert?",
    answer:
      "Der Wert hängt von Lage, Zustand, Größe, Ausstattung, Nachfrage und Vergleichsangeboten ab. Eine fundierte Bewertung schafft die Grundlage für den passenden Angebotspreis.",
  },
  {
    question: "Wie lange dauert ein Immobilienverkauf in Aurich?",
    answer:
      "Das hängt von Immobilie, Preisstrategie, Nachfrage und Unterlagenlage ab. Ein strukturierter Verkaufsprozess verkürzt unnötige Verzögerungen.",
  },
  {
    question: "Welche Unterlagen brauche ich für den Verkauf?",
    answer:
      "Typisch sind Grundbuchauszug, Grundriss, Wohnflächenangaben, Energieausweis, Bauunterlagen, Modernisierungsnachweise und weitere objektbezogene Dokumente.",
  },
  {
    question: "Warum ist der Angebotspreis so wichtig?",
    answer:
      "Ein falscher Startpreis kann dazu führen, dass eine Immobilie zu lange sichtbar bleibt oder unter Wert verkauft wird. Der richtige Preis steuert Nachfrage, Verhandlung und Ergebnis.",
  },
  {
    question: "Kann ich erst nur eine Bewertung anfragen?",
    answer:
      "Ja. Eine Bewertung ist der sinnvolle erste Schritt. Danach entscheidest du in Ruhe, ob und wann du verkaufen möchtest.",
  },
  {
    question: "Was kostet ein Immobilienmakler beim Verkauf?",
    answer:
      "Die Kosten hängen vom konkreten Auftrag und der gesetzlichen Provisionsregelung ab. Frisia Immobilien bespricht die Konditionen transparent vor Beginn der Zusammenarbeit.",
  },
  {
    question: "Muss ich mich selbst um Besichtigungen kümmern?",
    answer:
      "Nein. Frisia Immobilien übernimmt die Koordination, Vorbereitung und Durchführung nach klarer Abstimmung.",
  },
] as const;

function PrimaryCta({
  label = "Jetzt Marktwert ermitteln",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <a
      href="#bewertung"
      aria-label={`${label} für deine Immobilie in Aurich`}
      className={`inline-flex min-h-13 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-6 py-3 text-[0.98rem] font-semibold text-white shadow-[0_16px_34px_-28px_rgba(27,48,64,0.7)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] ${className}`}
    >
      {label}
    </a>
  );
}

function PhoneCta({ label = "Kurz anrufen", className = "" }: { label?: string; className?: string }) {
  return (
    <a
      href={PHONE_HREF}
      aria-label={`Frisia Immobilien unter ${PHONE_DISPLAY} anrufen`}
      className={`inline-flex min-h-13 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/40 bg-white px-6 py-3 text-[0.98rem] font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] ${className}`}
    >
      {label}
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.16] text-[color:var(--color-navy)] md:text-[2.7rem]">
        {title}
      </h2>
      {text ? <p className="mt-5 text-[1.06rem] leading-[1.75] text-[color:var(--color-graphite)]">{text}</p> : null}
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    ...buildPageMetadata({
      title: META_TITLE,
      description: META_DESCRIPTION,
      path: PATH,
      keywords: [
        "immobilie verkaufen aurich",
        "haus verkaufen aurich",
        "wohnung verkaufen aurich",
        "immobilienverkauf aurich",
        "immobilienmakler aurich",
        "immobilienbewertung aurich",
        "makler aurich",
        "immobilie verkaufen ostfriesland",
        "haus verkaufen ostfriesland",
        "immobilienpreise aurich",
      ],
      imagePath: HERO_IMAGE,
    }),
    title: { absolute: META_TITLE },
  };
}

export default function ImmobilieVerkaufenAurichPage() {
  const canonical = absoluteUrl(PATH);
  const breadcrumbJsonLd = createBreadcrumbListJsonLd(PATH, [
    { name: "Startseite", item: SITE_URL },
    { name: "Immobilie verkaufen Aurich", item: canonical },
  ]);
  const webPageJsonLd = {
    ...createWebPageJsonLd({
      path: PATH,
      name: META_TITLE,
      description: META_DESCRIPTION,
      imagePath: HERO_IMAGE,
    }),
    mainEntity: { "@id": `${canonical}#service` },
    hasPart: [
      { "@id": `${canonical}#bewertung` },
      { "@id": `${canonical}#prozess` },
      { "@id": `${canonical}#faq` },
    ],
    potentialAction: [
      {
        "@type": "RegisterAction",
        name: "Marktwert ermitteln",
        target: `${canonical}#bewertung`,
      },
      {
        "@type": "CommunicateAction",
        name: "Frisia Immobilien anrufen",
        target: PHONE_HREF,
      },
    ],
  };
  const serviceJsonLd = createServiceJsonLd({
    path: PATH,
    name: "Immobilie verkaufen Aurich",
    serviceType: "Immobilienverkauf",
    description: META_DESCRIPTION,
    areaServed: [...AREA_SERVED, "Ihlow", "Südbrookmerland", "Wiesmoor"],
  });
  const faqJsonLd = createFAQPageJsonLd(PATH, faqItems);
  const realEstateAgentJsonLd = createRealEstateAgentJsonLd({
    "@id": `${canonical}#real-estate-agent`,
    url: canonical,
    areaServed: [...AREA_SERVED, ...districts],
  });
  const localBusinessJsonLd = createLocalBusinessJsonLd({
    "@id": `${canonical}#local-business`,
    url: canonical,
    areaServed: [...AREA_SERVED, ...districts],
  });

  return (
    <main id="main-content" className="bg-white pb-20 md:pb-0">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={realEstateAgentJsonLd} />
      <JsonLd data={localBusinessJsonLd} />

      <section className="relative overflow-hidden bg-[#f4f6f8]">
        <Image
          src={HERO_IMAGE}
          alt="Gepflegte Immobilie am Wasser in Aurich als Symbol für einen strukturierten Immobilienverkauf"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_center] md:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_31%,rgba(255,255,255,0.70)_48%,rgba(255,255,255,0.22)_68%,rgba(255,255,255,0.04)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_52%,rgba(255,255,255,0.74)_100%)]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1440px] flex-col justify-between px-5 pb-8 pt-18 sm:px-8 md:pt-20 lg:px-12">
          <div className="max-w-[47rem] pt-0">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-navy)]">
              Immobilie verkaufen in Aurich & Ostfriesland
            </p>
            <div className="mt-4 h-px w-16 bg-[color:var(--color-brass)]" aria-hidden="true" />
            <h1 className="mt-7 max-w-4xl font-[family-name:var(--font-playfair)] text-[2.75rem] leading-[1.05] text-[color:var(--color-navy)] sm:text-[3.15rem] md:text-[4.7rem] lg:text-[5.25rem]">
              Deine Immobilie
              <span className="block">in Aurich erfolgreich</span>
              <span className="block">verkaufen.</span>
            </h1>
            <p className="mt-6 max-w-[38rem] text-[1.08rem] leading-[1.72] text-[color:var(--color-navy)] md:text-[1.22rem]">
              Wir begleiten dich persönlich, bewerten realistisch und finden den richtigen Käufer –{" "}
              <span className="font-semibold">zum besten Preis.</span>
            </p>

            <ul className="mt-7 flex flex-col gap-3 text-[0.96rem] font-semibold leading-[1.35] text-[color:var(--color-navy)] sm:flex-row sm:flex-wrap sm:gap-5">
              {heroTrustItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-navy)] text-[0.72rem] leading-none"
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/kontakt"
                aria-label="Jetzt unverbindlich von Frisia Immobilien beraten lassen"
                className="inline-flex min-h-14 items-center justify-center gap-5 rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-[0.98rem] font-semibold text-white shadow-[0_18px_40px_-28px_rgba(27,48,64,0.78)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                <span>Jetzt unverbindlich beraten lassen</span>
                <span aria-hidden="true" className="text-[1.35rem] leading-none">
                  →
                </span>
              </Link>
              <a
                href="#bewertung"
                aria-label="Kostenlose Immobilienbewertung für Aurich starten"
                className="inline-flex min-h-14 items-center justify-center gap-4 rounded-xl border border-[color:var(--color-brass)]/24 bg-white/94 px-7 py-4 text-[0.98rem] font-semibold text-[color:var(--color-navy)] shadow-[0_16px_36px_-32px_rgba(27,48,64,0.65)] transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                <span>Kostenlose Bewertung</span>
                <Image
                  src="/immobilienbewertung/icons/hero/statistik.png"
                  alt=""
                  width={24}
                  height={24}
                  sizes="24px"
                  className="h-6 w-6 shrink-0 object-contain"
                />
              </a>
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image
                src={HERO_REFERENCES_IMAGE}
                alt=""
                width={1687}
                height={364}
                sizes="(max-width: 640px) 220px, 270px"
                className="h-12 w-auto max-w-[14rem] object-contain sm:h-14 sm:max-w-[17rem]"
              />
              <p className="max-w-[31rem] text-[0.98rem] font-semibold leading-[1.6] text-[color:var(--color-navy)]">
                Über 200 Eigentümer in Aurich & Ostfriesland vertrauen bereits auf unsere Erfahrung als Immobilienmakler.*
              </p>
            </div>
          </div>

          <aside className="mt-10 rounded-2xl border border-[color:var(--color-brass)]/18 bg-white/94 p-5 shadow-[0_22px_60px_-42px_rgba(27,48,64,0.7)] backdrop-blur-sm md:mt-14 md:p-6">
            <div className="grid gap-5 md:grid-cols-[1.35fr_repeat(4,1fr)] md:items-center">
              <div className="flex items-center gap-4">
                <Image
                  src={HERO_LOCK_IMAGE}
                  alt=""
                  width={72}
                  height={72}
                  sizes="72px"
                  className="h-16 w-16 shrink-0 object-contain md:h-[4.5rem] md:w-[4.5rem]"
                />
                <div>
                  <p className="text-[1.02rem] font-semibold leading-[1.45] text-[color:var(--color-navy)]">
                    Sichere Daten. Keine Verpflichtung.
                  </p>
                  <p className="mt-1 text-[0.9rem] leading-[1.65] text-[color:var(--color-graphite)]">
                    Deine Angaben werden vertraulich behandelt und nicht ohne deine Zustimmung weitergegeben.
                  </p>
                </div>
              </div>

              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="border-t border-[color:var(--color-brass)]/20 pt-4 text-left md:border-l md:border-t-0 md:pl-5 md:pt-0 md:text-center"
                >
                  <p className="font-[family-name:var(--font-playfair)] text-[2rem] leading-none text-[color:var(--color-navy)]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-[1.45] text-[color:var(--color-graphite)]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="bewertung" className="scroll-mt-20 bg-white py-12 md:py-16" aria-label="Immobilienbewertung starten">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-7 max-w-3xl">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.16] text-[color:var(--color-navy)] md:text-[2.7rem]">
                Der erste sinnvolle Schritt ist Klarheit.
              </h2>
              <p className="mt-5 max-w-3xl text-[1.06rem] leading-[1.75] text-[color:var(--color-graphite)]">
                Bevor ein Verkauf beginnt, muss der realistische Marktwert sauber eingeordnet werden. Genau hier setzt
                Frisia Immobilien an: mit einer fundierten Bewertung, einer klaren Verkaufsempfehlung und einem
                strukturierten nächsten Schritt.
              </p>
              <p className="mt-4 max-w-3xl text-[1.02rem] font-semibold leading-[1.7] text-[color:var(--color-navy)]">
                Entscheidend ist nicht, was eine Immobilie wert sein könnte – sondern was Käufer aktuell bereit sind zu zahlen.
              </p>
            </div>
          </div>
          <LeadGenWizard layout="embedded" />
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <SectionHeading
            title="Ein guter Verkauf beginnt nicht mit einem Inserat. Sondern mit der richtigen Entscheidung."
            text="Viele starten mit Preisgefühl, Gesprächen und Portalen. Für einen sicheren Immobilienverkauf in Aurich brauchst du vorher eine geordnete Einordnung."
          />
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {problemCards.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[color:var(--color-brass)]/20 bg-white p-6 shadow-[0_14px_38px_-34px_rgba(27,48,64,0.45)]">
                <h3 className="text-[1.25rem] font-semibold leading-[1.35] text-[color:var(--color-navy)]">{item.title}</h3>
                <p className="mt-3 text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading title="Die häufigsten Fehler beim Immobilienverkauf in Aurich" />
          </div>
          <div className="lg:col-span-7">
            <ul className="grid gap-3 sm:grid-cols-2">
              {avoidMistakes.map((item) => (
                <li key={item} className="rounded-xl border border-[color:var(--color-brass)]/22 bg-[color:var(--color-section)] px-5 py-4 text-[0.98rem] leading-[1.6] text-[color:var(--color-navy)]">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 border-l-2 border-[color:var(--color-brass)]/60 pl-5 text-[1.08rem] leading-[1.75] text-[color:var(--color-graphite)]">
              Die meisten Fehler entstehen nicht aus Nachlässigkeit, sondern aus fehlender Struktur. Genau deshalb führt
              Frisia Immobilien den Verkauf Schritt für Schritt.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <SectionHeading
            title="Frisia Immobilien bringt Ordnung in den Verkauf."
            text="Nicht lauter, sondern klarer: Bewertung, Vorbereitung, Vermarktung und Abschluss werden in einem nachvollziehbaren Ablauf zusammengeführt."
          />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {solutionItems.map((item) => (
              <div key={item} className="rounded-2xl border border-[color:var(--color-brass)]/22 bg-white p-5 text-[1rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="prozess" className="bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                9+1 Verkaufsprinzip
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.05rem] leading-[1.14] text-[color:var(--color-navy)] md:text-[3.1rem]">
                Ein Anruf von dir. Danach übernehmen wir die nächsten Schritte.
              </h2>
            </div>
            <p className="max-w-[48rem] border-l-2 border-[color:var(--color-brass)]/55 pl-5 text-[1.05rem] leading-[1.75] text-[color:var(--color-graphite)]">
              Der erste Schritt ist dein kurzer Anruf oder deine Bewertungsanfrage. Danach führt Frisia Immobilien dich
              strukturiert durch Bewertung, Vorbereitung, Vermarktung, Käuferprüfung, Verhandlung und Abschluss.
            </p>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-[color:var(--color-brass)]/20 bg-[color:var(--color-section)] p-4 shadow-[0_18px_54px_-48px_rgba(27,48,64,0.55)] md:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {principleSteps.map((step, index) => (
                <article
                  key={`${step.label}-${step.title}`}
                  className={`relative min-h-[9.5rem] overflow-hidden rounded-2xl border p-5 shadow-[0_14px_34px_-32px_rgba(27,48,64,0.45)] ${
                    index === 0
                      ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                      : "border-[color:var(--color-brass)]/22 bg-white text-[color:var(--color-navy)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[0.95rem] font-semibold ${
                        index === 0
                          ? "bg-white text-[color:var(--color-navy)]"
                          : "bg-[color:var(--color-navy)] text-white"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index < principleSteps.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className={`hidden h-px flex-1 lg:block ${
                          index === 0 ? "bg-white/28" : "bg-[color:var(--color-brass)]/25"
                        }`}
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-5 text-[1.16rem] font-semibold leading-[1.35]">{step.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <SectionHeading title="So läuft der Immobilienverkauf mit Frisia Immobilien ab." />
          <div className="mt-9 grid gap-4 lg:grid-cols-5">
            {processPhases.map((phase, index) => (
              <article key={phase.title} className="rounded-2xl border border-[color:var(--color-brass)]/22 bg-white p-6">
                <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                  Phase {index + 1}
                </p>
                <h3 className="mt-3 text-[1.25rem] font-semibold leading-[1.35] text-[color:var(--color-navy)]">{phase.title}</h3>
                <p className="mt-3 text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">{phase.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-[1240px] gap-9 px-4 sm:px-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <SectionHeading title="Warum du in Aurich mit Frisia Immobilien verkaufst." />
          </div>
          <div className="grid gap-3 lg:col-span-7">
            {whyItems.map((item) => (
              <div key={item} className="flex gap-4 rounded-xl border border-[color:var(--color-brass)]/22 bg-white px-5 py-4 shadow-[0_10px_30px_-28px_rgba(27,48,64,0.45)]">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-brass)]" aria-hidden="true" />
                <p className="text-[1rem] leading-[1.65] text-[color:var(--color-navy)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-20">
        <div className="mx-auto w-full max-w-[980px] px-4 sm:px-6">
          <article className="rounded-2xl border border-[color:var(--color-brass)]/24 bg-white p-6 shadow-[0_18px_50px_-42px_rgba(27,48,64,0.45)] md:p-9">
            <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.16] text-[color:var(--color-navy)] md:text-[2.65rem]">
              Aus der Praxis: Warum der richtige Startpreis entscheidend ist.
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {[
                ["Ausgangssituation", "Eine Immobilie wird zu optimistisch angeboten."],
                ["Problem", "Gute Käufer reagieren zurückhaltend, die Immobilie bleibt sichtbar zu lange am Markt."],
                ["Lösung", "Frisia Immobilien ordnet den Marktwert realistisch ein, schärft die Präsentation und führt den Verkauf neu."],
                ["Ergebnis", "Mehr Klarheit, bessere Käuferansprache und ein geordneter Verkaufsprozess."],
              ].map(([title, text]) => (
                <section key={title} aria-label={title} className="border-l-2 border-[color:var(--color-brass)]/55 pl-5">
                  <h3 className="text-[1.12rem] font-semibold text-[color:var(--color-navy)]">{title}</h3>
                  <p className="mt-2 text-[0.98rem] leading-[1.75] text-[color:var(--color-graphite)]">{text}</p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <div className="grid gap-9 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <SectionHeading
                title="Immobilienverkauf in Aurich braucht regionale Marktkenntnis."
                text="Aurich ist kein anonymer Immobilienmarkt. Lage, Zustand, Zielgruppe, Ortsteil und Nachfrage unterscheiden sich deutlich – ob Innenstadt, Extum, Haxtum, Walle, Sandhorst, Tannenhausen, Egels, Kirchdorf, Wallinghausen oder Popens. Frisia Immobilien kennt den regionalen Markt in Aurich und ganz Ostfriesland und ordnet deine Immobilie entsprechend ein."
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:col-span-5">
              {districts.map((district) => (
                <span key={district} className="rounded-xl border border-[color:var(--color-brass)]/22 bg-[color:var(--color-section)] px-4 py-3 text-[0.95rem] font-medium text-[color:var(--color-navy)]">
                  {district}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[color:var(--color-brass)]/22 bg-white">
              <Image
                src={SEBASTIAN_IMAGE}
                alt="Sebastian Munzig von Frisia Immobilien"
                width={900}
                height={720}
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeading
              title="Persönlich, regional, verantwortlich."
              text="Frisia Immobilien steht für persönliche Begleitung, klare Kommunikation und einen strukturierten Verkaufsprozess. Du erhältst keine anonyme Standardabwicklung, sondern einen Ansprechpartner, der Bewertung, Vorbereitung, Vermarktung und Abschluss zusammenführt."
            />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PhoneCta label="Persönlich sprechen" />
              <Link
                href="/immobilienmakler-aurich"
                className="inline-flex min-h-13 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/40 bg-white px-6 py-3 text-[0.98rem] font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Frisia Immobilien kennenlernen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-[980px] px-4 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Häufige Fragen zum Immobilienverkauf in Aurich" />
          <div className="mt-9 space-y-4 border-t border-[color:var(--color-brass)]/25 pt-5">
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group rounded-2xl border border-[color:var(--color-brass)]/30 bg-white p-5 open:shadow-sm md:p-6"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[1.1rem] font-semibold leading-[1.45] text-[color:var(--color-navy)]">
                  <h3 className="font-[family-name:var(--font-inter)] text-[1.1rem] font-semibold leading-[1.45]">{item.question}</h3>
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-brass)]/35 text-[color:var(--color-brackish)] transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-[82ch] text-[1rem] leading-[1.75] text-[color:var(--color-graphite)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-20">
        <div className="mx-auto w-full max-w-[980px] px-4 text-center sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.2rem] leading-[1.14] text-[color:var(--color-navy)] md:text-[3rem]">
            Du möchtest deine Immobilie in Aurich verkaufen?
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[1.08rem] leading-[1.75] text-[color:var(--color-graphite)]">
            Beginne mit dem wichtigsten Schritt: einer klaren Einschätzung. Frisia Immobilien prüft deine Immobilie,
            ordnet den Markt ein und zeigt dir den nächsten sinnvollen Schritt.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryCta />
            <PhoneCta label="Direkt sprechen – wir klären das für dich" />
          </div>
          <p className="mt-8 text-[1.15rem] font-semibold text-[color:var(--color-navy)]">
            Du musst dich nicht allein darum kümmern.
          </p>
          <nav aria-label="Weiterführende Seiten" className="mt-10 border-t border-[color:var(--color-brass)]/25 pt-6">
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-[0.95rem] text-[color:var(--color-graphite)]">
              {internalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="underline underline-offset-4 hover:text-[color:var(--color-navy)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div className="bg-white px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-[1240px] text-right text-[0.72rem] leading-[1.5] text-[color:var(--color-graphite)]/65">
          *Die Angaben beziehen sich auf die gemeinsame Berufserfahrung und die vermittelten Immobilien des Teams von Frisia Immobilien.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-brass)]/25 bg-white/96 p-3 shadow-[0_-16px_35px_-30px_rgba(27,48,64,0.7)] backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <PrimaryCta label="Jetzt Marktwert ermitteln" className="min-h-12 px-3 text-[0.9rem]" />
          <PhoneCta label="Direkt sprechen – wir klären das für dich" className="min-h-12 px-2 text-[0.78rem] leading-tight" />
        </div>
      </div>
    </main>
  );
}
