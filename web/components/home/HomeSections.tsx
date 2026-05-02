import Image from "next/image";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import DeferredRegionalMarktInteractive from "@/components/home/DeferredRegionalMarktInteractive.client";
import DeferredWhyFrisiaInteractive from "@/components/home/DeferredWhyFrisiaInteractive.client";
import DeferredTestimonialsCarousel from "@/components/home/DeferredTestimonialsCarousel.client";
import DeferredProofCasesCarousel from "@/components/home/DeferredProofCasesCarousel.client";
import Process9plus1MobileCarousel from "@/components/home/Process9plus1MobileCarousel.client";
import { FAQ_ITEMS } from "@/components/home/homeFaqItems";
import {
  SELLING_SITUATION_HUB,
  SELLING_SITUATIONS,
  type SellingSituation,
} from "@/lib/selling-situations/data";

const PHONE_HREF = "tel:+4949419867700";
const MAIL = "info@frisia-immobilien.de";
const GOOGLE_MAPS_AURICH =
  "https://www.google.com/maps/search/?api=1&query=Oldersumer+Stra%C3%9Fe+150%2C+26605+Aurich";

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

const PROCESS_ITEMS = [
  "Markteinordnung und Ausgangslage klären",
  "Zielpreisrahmen auf Basis belastbarer Vergleichsdaten festlegen",
  "Unterlagenbestand prüfen und fehlende Dokumente strukturiert ergänzen",
  "Objektaufbereitung mit präziser Positionierung für den regionalen Markt",
  "Diskrete oder öffentliche Vermarktungsstrategie sauber entscheiden",
  "Anfragen führen, Interessenten qualifizieren und Finanzierung vorprüfen",
  "Besichtigungen strukturiert steuern und Rückmeldungen systematisch auswerten",
  "Verhandlung, Einigung und Käuferauswahl mit klarer Entscheidungsvorlage",
  "Notartermin, Übergabe und Abschluss formal abgesichert begleiten",
] as const;
const GEO_QA_ITEMS = [
  {
    question: "Was ist der erste Schritt beim Immobilienverkauf in Aurich?",
    answer: "Eine fundierte Ersteinschätzung mit regionalen Vergleichsdaten und klarer Preisstrategie.",
  },
  {
    question: "Wie schnell erhalte ich eine erste Einordnung?",
    answer: "Nach deiner Anfrage erhältst du kurzfristig eine strukturierte Rückmeldung als Entscheidungsgrundlage.",
  },
  {
    question: "Ist die Ersteinschätzung kostenfrei?",
    answer: "Ja. Die Erstbewertung im Rahmen eines geplanten Verkaufs ist kostenfrei und unverbindlich.",
  },
  {
    question: "Begleitet Frisia auch außerhalb von Aurich?",
    answer: "Ja, im regionalen Markt in Aurich und ganz Ostfriesland, inklusive umliegender Städte und Gemeinden.",
  },
] as const;

const PROOF_CASES = [
  {
    title: "Fall 1 – Einfamilienhaus vor dem Ruhestand",
    setup: "Ausgangslage: Unsicherheit beim Einstiegspreis.",
    approach: "Vorgehen: Vergleichsdaten, klare Preisbandbreite und strukturierte Interessentenprüfung.",
    outcome: "Ergebnis: Ruhiger Verkaufsprozess und rechtssicherer Abschluss.",
  },
  {
    title: "Fall 2 – Geerbtes Objekt mit Abstimmungsbedarf",
    setup: "Ausgangslage: Unterschiedliche Erwartungen innerhalb der Eigentümergemeinschaft.",
    approach: "Vorgehen: Gemeinsame Entscheidungsgrundlage auf Basis regionaler Marktdaten und klare Struktur vor Vermarktungsstart.",
    outcome: "Ergebnis: Belastbare Einigung der Eigentümer vor Beginn der Vermarktung.",
  },
  {
    title: "Fall 3 – Diskreter Verkauf",
    setup: "Ausgangslage: Hoher Wunsch nach Vertraulichkeit.",
    approach: "Vorgehen: Diskrete Ansprache vorqualifizierter Interessenten aus dem bestehenden Netzwerk.",
    outcome: "Ergebnis: Kontrollierter Verkaufsprozess mit klarer Verhandlungssicherheit.",
  },
] as const;
const HOME_SELLING_SITUATION_KEYS = ["alter", "erbschaft", "diskret"] as const;
const HOME_SELLING_SITUATIONS = HOME_SELLING_SITUATION_KEYS.map((key) =>
  SELLING_SITUATIONS.find((situation) => situation.key === key),
).filter((situation): situation is SellingSituation => Boolean(situation));
const OBJECTION_ITEMS = [
  {
    concern: "Ich will keinen Preisfehler machen.",
    response:
      "Du erhältst einen nachvollziehbaren Preisrahmen auf Basis regionaler Vergleichsdaten.",
  },
  {
    concern: "Ich will keine unseriösen Interessenten",
    response:
      "Interessenten werden vorqualifiziert, inklusive Finanzierungsprüfung.",
  },
  {
    concern: "Ich will keine rechtlichen Fehler",
    response:
      "Unterlagen, Prozessschritte und Notarvorbereitung werden formal abgesichert begleitet.",
  },
  {
    concern: "Ich will keinen Streit in der Familie",
    response:
      "Klare Entscheidungsgrundlagen schaffen Orientierung und reduzieren Konflikte.",
  },
  {
    concern: "Ich will keinen Kontrollverlust",
    response:
      "Du behältst in jedem Schritt die Entscheidungshoheit.",
  },
] as const;
const FIT_CRITERIA = {
  good: [
    "Eigentümer mit klarem Verkaufsanlass in den nächsten 18 Monaten",
    "Wunsch nach strukturierter, diskreter und rechtssicherer Begleitung",
    "Bereitschaft für klare Zuständigkeit statt paralleler Anbieter",
  ],
  notGood: [
    "Reine Testanfragen ohne konkrete Verkaufsabsicht",
    "Fixe Wunschpreise ohne Marktbezug",
    "Mehrfachbeauftragungen mit konkurrierenden Verkaufswegen",
  ],
} as const;

const SECTION_Y = "py-20 md:py-28";
const HEADING_CLASS =
  "font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-[2.45rem]";
const BODY_CLASS = "max-w-[72ch] text-[1.02rem] leading-[1.78] text-[color:var(--color-graphite)]";
const BODY_COMPACT_CLASS = "text-[1.01rem] leading-[1.72] text-[color:var(--color-graphite)]";
const META_CLASS = "text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]";
const CARD_CLASS = "rounded-3xl border border-[color:var(--color-brass)]/25 bg-white p-7";
const STEP3_ITEMS = [
  {
    title: "1. Ausgangslage senden",
    copy: "Du übermittelst die wichtigsten Eckdaten in etwa 60 Sekunden.",
  },
  {
    title: "2. Strukturierte Einordnung",
    copy: "Du erhältst eine belastbare Marktanalyse mit klarem Preisrahmen.",
  },
  {
    title: "3. In Ruhe entscheiden",
    copy: "Du entscheidest ohne Druck, ob und wie es weitergeht.",
  },
] as const;
const LAZY_SECTION_CLASS = "[content-visibility:auto] [contain-intrinsic-size:980px]";

function SocialIcon({ platform }: { platform: "instagram" | "facebook" | "linkedin" }) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path
          d="M13.2 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.3-1.4 1.5-1.4h1.4V5.5c-.2 0-.9-.1-1.8-.1-2.5 0-4 1.3-4 3.9v1.9H8v2.8h2.4v7h2.8z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (platform === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <rect x="4" y="9.5" width="3.2" height="10.5" fill="currentColor" />
        <circle cx="5.6" cy="6.4" r="1.8" fill="currentColor" />
        <path d="M10.1 9.5h3v1.5h.1c.5-.9 1.6-1.8 3.5-1.8 3.1 0 3.7 2.1 3.7 4.8V20h-3.1v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20h-3.1V9.5z" fill="currentColor" />
      </svg>
    );
  }
  return null;
}

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
type RegionalMarktLink = {
  title: string;
  copy: string;
  imageSrc: string;
  imageAlt: string;
  imageContain?: boolean;
  href: string;
  cta: string;
};

const REGIONAL_MARKT_LINKS: readonly RegionalMarktLink[] = [
  {
    title: "Immobilienbewertung Aurich",
    copy: "Marktwert realistisch einordnen lassen.",
    imageSrc: "/images/why/verkaufen.webp",
    imageAlt: "Immobilienbewertung Aurich mit regionaler Wohnimmobilie und Marktumfeld",
    href: "/immobilienbewertung-aurich",
    cta: "Immobilienbewertung Aurich",
  },
  {
    title: "Immobilienpreise Aurich",
    copy: "Durchschnittliche Kaufpreise und Preisentwicklung der letzten Jahre.",
    imageSrc: "/images/why/marktgerechte_preisstrategie.webp",
    imageAlt: "Immobilienpreise Aurich mit fundierter Preisstrategie und Marktanalyse",
    href: "/immobilienpreise-aurich",
    cta: "Immobilienpreise Aurich",
  },
  {
    title: "Regionale Preisunterschiede",
    copy: "Preisunterschiede zwischen Städten, Gemeinden und ländlichen Lagen.",
    imageSrc: "/images/regions/ostfriesland-karte.webp",
    imageAlt: "Regionale Preisunterschiede zwischen Aurich und Ostfriesland auf einer Übersichtskarte",
    imageContain: true,
    href: "/regionen-ostfriesland",
    cta: "Regionen Ostfriesland",
  },
  {
    title: "Immobilienpreise Ostfriesland",
    copy: "Lokale Preisberichte für Aurich, Emden, Norden, Leer und Wittmund.",
    imageSrc: "/images/why/reichweite.webp",
    imageAlt: "Vergleichsdaten aus der Region mit digitaler Marktübersicht und Reichweite",
    href: "/immobilienpreise",
    cta: "Immobilienpreise ansehen",
  },
] as const;
type TestStep = {
  number: string;
  shortTitle: string;
  detail: string;
};

const TEST_SECTION_STEPS: TestStep[] = [
  {
    number: "1",
    shortTitle: "Marktsituation klären",
    detail: "Wir klären die reale Marktsituation – persönlich vor Ort. Du weißt sofort, was deine Immobilie heute wert ist.",
  },
  {
    number: "2",
    shortTitle: "Zielpreis festlegen",
    detail: "Belastbaren Preisrahmen auf Basis echter Vergleichsdaten festlegen.",
  },
  {
    number: "3",
    shortTitle: "Unterlagen ordnen",
    detail: "Unterlagen prüfen und fehlende Dokumente vollständig ergänzen.",
  },
  {
    number: "4",
    shortTitle: "Immobilie positionieren",
    detail: "Immobilie präzise im regionalen Markt positionieren.",
  },
  {
    number: "5",
    shortTitle: "Vermarktung festlegen",
    detail: "Passende Vermarktungsstrategie festlegen – diskret oder öffentlich.",
  },
  {
    number: "6",
    shortTitle: "Interessenten prüfen",
    detail: "Anfragen steuern, Interessenten prüfen und Finanzierung sichern.",
  },
  {
    number: "7",
    shortTitle: "Besichtigungen steuern",
    detail: "Besichtigungen organisieren und Rückmeldungen auswerten.",
  },
  {
    number: "8",
    shortTitle: "Verhandlung führen",
    detail: "Verhandlungen führen und Käuferauswahl fundiert vorbereiten.",
  },
  {
    number: "9",
    shortTitle: "Abschluss begleiten",
    detail: "Notartermin, Übergabe und Abschluss rechtssicher begleiten.",
  },
];

const PROCESS_MOBILE_SLIDES = [
  {
    key: "plus-1",
    kind: "intro" as const,
    badge: "+1",
    eyebrow: "Dein Schritt",
    title: "Dein Anruf",
    copy:
      "Du schilderst uns deine Situation. Wir hören zu, ordnen die Ausgangslage ein und übernehmen danach die weiteren neun Schritte.",
    phoneHref: PHONE_HREF,
    phoneLabel: "Telefon 04941 986770-0",
    phoneIconSrc: "/images/prozess/telefon.webp",
    phoneIconAlt: "Telefonischer Erstkontakt mit Frisia Immobilien",
  },
  ...TEST_SECTION_STEPS.map((step) => ({
    key: `step-${step.number}`,
    kind: "step" as const,
    badge: `Unser Schritt ${step.number}`,
    title: step.shortTitle,
    copy: step.detail,
    iconSrc: `/images/prozess/schritt_${step.number.padStart(2, "0")}.webp`,
    iconAlt: `Icon Schritt ${step.number}`,
  })),
] as const;

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>;
}

function Block({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`${SECTION_Y} ${className}`}>
      <Wrap>
        <div className="max-w-4xl">
          <h2 className={HEADING_CLASS}>{title}</h2>
          <div className={`mt-7 space-y-5 ${BODY_CLASS}`}>{children}</div>
        </div>
      </Wrap>
    </section>
  );
}

export function AuthorityBlock() {
  return (
    <Block
      id="autoritaet"
      title="Strukturierte Verkaufsführung für Eigentümer im regionalen Markt in Aurich und ganz Ostfriesland"
      className="pt-24 md:pt-32"
    >
      <p>
        Ein Immobilienverkauf ist für viele Eigentümer die größte private Finanzentscheidung seit Jahren.
      </p>
      <p>
        Frisia Immobilien führt dich geordnet durch diesen Prozess: von der fundierten{" "}
        <Link href="/immobilienbewertung" className="underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]">
          Marktanalyse
        </Link>{" "}
        bis zum rechtssicheren Abschluss.
      </p>
      <p>
        Der Fokus liegt nicht auf Lautstärke, sondern auf Klarheit, Zuständigkeit und einer nachvollziehbaren Entscheidung.
      </p>
      <p className="font-semibold text-[color:var(--color-navy)]">Du behältst die Entscheidung. Wir sichern die Struktur.</p>
    </Block>
  );
}

export function BewertungsDominanzBlock() {
  return (
    <section id="bewertungsdominanz" className={`bg-[color:var(--color-section)] ${SECTION_Y}`}>
      <Wrap>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className={HEADING_CLASS}>Immobilienbewertung in Aurich als Sicherheitsgrundlage für den Verkauf</h2>
            <div className={`mt-7 space-y-5 ${BODY_CLASS}`}>
              <p>Ein Verkauf beginnt nicht mit Vermarktung. Er beginnt mit einer belastbaren Bewertung.</p>
              <p>Online-Rechner liefern Richtwerte. Eine tragfähige Verkaufsentscheidung braucht mehr:</p>
              <ul className="space-y-1">
                <li>– aktuelle Angebots- und Marktdaten</li>
                <li>– Mikrostandort und Lagequalität</li>
                <li>– Nachfrage im regionalen Markt</li>
                <li>– realistische Preisbandbreiten</li>
                <li>– klare Vorgehens- und Vermarktungsstrategie</li>
              </ul>
              <p>
                Das Frisia Bewertungsdossier schafft Klarheit, bevor ein Preis kommuniziert wird. Mehr dazu auf der Seite{" "}
                <Link href="/immobilienbewertung" className="underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]">
                  Immobilienbewertung in Aurich
                </Link>
                .
              </p>
              <p className="font-semibold text-[color:var(--color-navy)]">Ein falscher Einstiegspreis kostet Vermögen. Eine klare Bewertung schützt davor.</p>
            </div>
          </div>
          <aside className={`${CARD_CLASS} md:col-span-4`}>
            <p className={META_CLASS}>Worauf Eigentümer achten</p>
            <p className={`mt-4 ${BODY_COMPACT_CLASS}`}>
              Kein Druck, keine Inszenierung, keine überzogenen Preisversprechen.
            </p>
            <p className={`mt-3 ${BODY_COMPACT_CLASS}`}>
              Stattdessen: <strong>klare Daten</strong>, <strong>klare Zuständigkeit</strong>, <strong>klare Entscheidungen</strong>.
            </p>
          </aside>
        </div>
      </Wrap>
    </section>
  );
}

export function ProcessBlock() {
  return (
    <section id="prozess" className={`${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 className={HEADING_CLASS}>
          9+1: Der strukturierte Weg zum Verkauf
        </h2>
        <div className="mt-7 grid gap-6 md:grid-cols-12 md:items-stretch">
          <div className="space-y-5 md:col-span-7">
            <p className={BODY_CLASS}>
              Du musst keinen Verkauf organisieren.
              <br />
              Der erste Schritt ist dein Anruf.
              <br />
              Die weiteren Schritte führen wir klar, strukturiert und rechtssicher durch.
            </p>
            <ol className="grid gap-3 text-[0.98rem] leading-[1.6] text-[color:var(--color-graphite)] md:grid-cols-2">
              {PROCESS_ITEMS.map((item, idx) => (
                <li
                  key={item}
                  className={`rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] px-4 py-3 ${
                    idx === 0 ? "md:col-span-2 bg-[color:var(--color-brackish)]/6" : ""
                  }`}
                >
                  <span className="mr-2 rounded-md bg-white px-2 py-0.5 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-navy)]">
                    Schritt {idx + 1}
                  </span>
                  <span className="mt-2 block">{item}</span>
                </li>
              ))}
            </ol>
            <p className="font-semibold text-[color:var(--color-navy)]">
              Ein Ansprechpartner. Ein Ablauf. Keine unnötige Unruhe.</p>
          </div>
          <aside className="md:col-span-5">
            <div className="relative h-full min-h-[560px] overflow-hidden rounded-2xl border border-[color:var(--color-brass)]/22 bg-white/70 md:min-h-[760px]">
              <Image
                src="/images/prozess/paar-vor-immobilie-in-ostfriesland2.webp"
                alt="Immobilienbewertung in Aurich und Ostfriesland als strukturierter erster Schritt im Verkaufsprozess"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                quality={68}
                className="h-full w-full object-cover object-[50%_50%]"
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function Section9plus1() {
  return (
    <section id="prozess-test" className={`overflow-x-clip bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start xl:grid-cols-[minmax(0,1fr)_500px]">
          <div className="order-2 min-w-0 overflow-hidden lg:order-1">
            <div>
              <p className={META_CLASS}>VERKAUFSPROZESS IMMOBILIE</p>
              <h2 className={`${HEADING_CLASS} max-w-full text-[1.72rem] leading-[1.08] sm:text-[1.9rem] md:text-[2.45rem]`}>
                Der strukturierte Weg zum Verkauf (9+1 Prinzip)
              </h2>

              <div className="mt-8 max-w-[72ch] space-y-4 text-[1.02rem] leading-[1.78] text-[color:var(--color-graphite)]">
                <p>Ein Immobilienverkauf folgt bei Frisia Immobilien einer klaren Struktur.
                  Der Ablauf umfasst zehn definierte Schritte – vom ersten Gespräch bis zum Notartermin.</p>
                <p className="md:hidden">
                  Starte mit <span className="font-semibold text-[color:var(--color-navy)]">+1: Dein Anruf</span>.
                  Danach übernehmen wir die weiteren neun Schritte strukturiert, ruhig und rechtssicher.
                </p>
                <p className="mt-10 mb-10 ml-5 hidden md:block">
                  Der erste Schritt (+1) ist einfach:{" "}
                  <br />
                  <Image
                    src="/images/prozess/telefon.webp"
                    alt=""
                    aria-hidden="true"
                    width={60}
                    height={60}
                    className="mr-3 mt-1.5 float-left h-[60px] w-[60px] object-contain"
                  />
                  <a
                    href={PHONE_HREF}
                    className="font-semibold text-[color:var(--color-navy)]"
                  >
                    Du rufst uns an.<br />
                    Telefon 04941 986770-0
                  </a>
                </p>
                <p className="clear-both hidden md:block">
                  Damit ist dein Teil erledigt. Du musst keinen Verkauf organisieren und dich selber um alles kümmern. Die weiteren neun Schritte übernehmen wir. Strukturiert, ruhig und
                  rechtssicher:
                </p>
              </div>
            </div>
            <div className="mt-10 hidden rounded-[28px] border border-[color:var(--color-brass)]/34 bg-white p-6 shadow-[0_16px_36px_rgba(27,48,64,0.06)] md:block md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brass)] text-2xl font-semibold text-white shadow-[0_10px_24px_rgba(139,111,61,0.22)]">
                    +1
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brackish)]">Dein Schritt</p>
                    <h3 className="mt-1 text-[1.2rem] font-semibold leading-[1.35] text-[color:var(--color-navy)] md:text-[1.3rem]">
                      Dein Anruf
                    </h3>
                    <p className="mt-2 max-w-2xl text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">
                      Du schilderst uns deine Situation. Wir hören zu, ordnen die Ausgangslage ein und übernehmen danach die weiteren neun Schritte.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <Process9plus1MobileCarousel slides={PROCESS_MOBILE_SLIDES} />

            <div className="mt-8 hidden md:block">
              <div className="flex items-center gap-4 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-white shadow-[0_10px_24px_rgba(27,48,64,0.18)]">
                  Start
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-[color:var(--color-navy)]/28 via-[color:var(--color-brass)]/30 to-[color:var(--color-navy)]/28" />
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--color-brass)]/32 bg-white text-[color:var(--color-navy)] shadow-[0_8px_20px_rgba(27,48,64,0.07)]">
                  Weg
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-[color:var(--color-navy)]/20 via-[color:var(--color-brass)]/30 to-[color:var(--color-navy)]/34" />
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-white shadow-[0_10px_24px_rgba(27,48,64,0.18)]">
                  Ziel
                </span>
              </div>
            </div>

            <div className="mt-5 hidden gap-5 md:grid md:grid-cols-2">
              {TEST_SECTION_STEPS.map((step) => {
                const isEndpoint = step.number === "1" || step.number === "9";

                return (
                  <article
                    key={step.number}
                    className={`relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-[26px] border p-6 md:p-7 ${
                      isEndpoint
                        ? "border-[color:var(--color-brass)]/34 bg-white shadow-[0_16px_34px_rgba(27,48,64,0.08)]"
                        : "border-[color:var(--color-brass)]/18 bg-white"
                    } ${step.number === "1" ? "md:col-span-2 md:min-h-[180px]" : ""}`}
                  >
                    {isEndpoint ? (
                      <span className="absolute right-5 top-5 rounded-full border border-[color:var(--color-brass)]/28 bg-white/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
                        {step.number === "1" ? "Start" : "Ziel"}
                      </span>
                    ) : null}
                    <div
                      className={`inline-flex self-start rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] shadow-sm ring-1 ${
                        isEndpoint
                          ? "bg-[color:var(--color-navy)] text-white ring-[color:var(--color-navy)]/15"
                          : "bg-white text-[color:var(--color-navy)] ring-[color:var(--color-brass)]/22"
                      }`}
                    >
                      Unser Schritt {step.number}
                    </div>
                    <div className="mt-4 flex h-full items-start gap-3">
                      <Image
                        src={`/images/prozess/schritt_${step.number.padStart(2, "0")}.webp`}
                        alt={`Icon Schritt ${step.number}`}
                        width={60}
                        height={60}
                        className="h-[60px] w-[60px] shrink-0 object-contain"
                      />
                      <p className="text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">
                        {step.detail}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-12 border-l-[3px] border-[color:var(--color-brass)]/55 pl-5 text-[1rem] font-semibold leading-[1.55] text-[color:var(--color-navy)] md:mt-20 md:ml-10 md:pl-6">
              <p>Ein Ansprechpartner.</p>
              <p>Ein Ablauf.</p>
              <p>Keine unnötige Unruhe.</p>
            </div>
          </div>

          <div className="order-1 hidden lg:block lg:order-2 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-[30px] border border-[color:var(--color-brass)]/28 bg-white shadow-[0_12px_40px_rgba(27,48,64,0.08)]">
              <Image
                src="/images/prozess/paar-vor-immobilie-in-ostfriesland2.webp"
                alt="Immobilienbewertung in Aurich und Ostfriesland als strukturierter erster Schritt im Verkaufsprozess"
                width={1100}
                height={1500}
                sizes="(max-width: 1024px) 100vw, 500px"
                quality={68}
                className="h-full w-full object-cover object-[50%_50%] saturate-[0.92] contrast-[1.03] brightness-[0.98]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(27,48,64,0.12) 0%, rgba(139,111,61,0.06) 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyFrisiaBlock() {
  return (
    <section id="warum-frisia" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <DeferredWhyFrisiaInteractive fallback={<WhyFrisiaStaticFallback />} />
      </Wrap>
    </section>
  );
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
                    {item.outcome.replace(/^Ergebnis:\s*/, "")}
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
                    sizes="(max-width: 768px) 100vw, 33vw"
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

export function RegionalMarktBlock() {
  return (
    <section id="regionaler-immobilienmarkt" className={`overflow-x-clip bg-white ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <DeferredRegionalMarktInteractive fallback={<RegionalMarktStaticFallback />} />
      </Wrap>
    </section>
  );
}

export function MarketOrderBlock() {
  return (
    <section id="marktordnung" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="border-l-[3px] pl-6 md:pl-8" style={{ borderColor: "rgba(139, 111, 61, 0.6)" }}>
              <h2 className={HEADING_CLASS}>Warum Struktur beim Verkauf entscheidend ist</h2>
              <div className={`mt-7 space-y-5 ${BODY_CLASS}`}>
                <p>Ein Immobilienverkauf gehört zu den größten privaten Vermögensentscheidungen.</p>
                <p>
                  Unklare Abläufe und parallele Vermarktung führen häufig zu Preisverzerrung und unnötiger Marktunruhe.
                </p>
                <p>Deshalb folgt jeder Verkauf bei Frisia Immobilien einer klar definierten Struktur.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {[
                { text: "Ein klarer Preisrahmen statt Marktirritation", icon: "/images/why/why-preisrahmen.svg" },
                { text: "Eine klare Zuständigkeit statt paralleler Vermarktung", icon: "/images/why/why-zustaendigkeit.svg" },
                { text: "Ein geordneter Ablauf statt Unsicherheit", icon: "/images/why/why-ablauf.svg" },
              ].map((item) => {
                return (
                  <div
                    key={item.text}
                    className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      {item.icon ? (
                        <Image
                          src={item.icon}
                          alt={`Icon ${item.text}`}
                          width={30}
                          height={30}
                          className="mt-0.5 h-8 w-8 shrink-0 object-contain"
                        />
                      ) : null}
                      <p className="text-[0.95rem] leading-[1.6] text-[color:var(--color-graphite)]">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="md:col-span-4">
            <div className={`${CARD_CLASS} h-full`}>
              <p className={META_CLASS}>Was diese Struktur verhindert</p>
              <ul className="mt-4 space-y-3 text-[0.96rem] leading-[1.62] text-[color:var(--color-graphite)]">
                <li className="flex items-start gap-3">
                  <Image
                    src="/images/prozess/checkbox.webp"
                    alt=""
                    aria-hidden="true"
                    width={30}
                    height={30}
                    className="mt-[0.12rem] h-[30px] w-[30px] shrink-0 object-contain"
                  />
                  <span>unnötige <strong>Preisnachlässe</strong> durch falsche Startpositionierung</span>
                </li>
                <li className="flex items-start gap-3">
                  <Image
                    src="/images/prozess/checkbox.webp"
                    alt=""
                    aria-hidden="true"
                    width={30}
                    height={30}
                    className="mt-[0.12rem] h-[30px] w-[30px] shrink-0 object-contain"
                  />
                  <span><strong>Marktunruhe</strong> durch mehrere Anbieter mit unterschiedlichen Botschaften</span>
                </li>
                <li className="flex items-start gap-3">
                  <Image
                    src="/images/prozess/checkbox.webp"
                    alt=""
                    aria-hidden="true"
                    width={30}
                    height={30}
                    className="mt-[0.12rem] h-[30px] w-[30px] shrink-0 object-contain"
                  />
                  <span><strong>Verzögerungen</strong> durch fehlende Unterlagen kurz vor dem Abschluss</span>
                </li>
              </ul>
              <p className="mt-5 text-[0.92rem] font-semibold text-[color:var(--color-navy)]">
                Struktur schützt Vermögen, Zeit und Verhandlungssicherheit.
              </p>
            </div>
          </aside>
        </div>
      </Wrap>
    </section>
  );
}

export function ThreeStepsBlock() {
  return (
    <section id="drei-schritte" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="max-w-5xl">
          <h2 className={HEADING_CLASS}>Ablauf in 3 klaren Schritten</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEP3_ITEMS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
                <h3 className="text-[1rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">{item.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.copy}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-[0.97rem] leading-[1.65] text-[color:var(--color-graphite)]">
            Wenn du zuerst sprechen möchtest:{" "}
            <a href={PHONE_HREF} className="underline underline-offset-4">
              04941 986770-0
            </a>
          </p>
        </div>
      </Wrap>
    </section>
  );
}

export function GeoAnswerBlock() {
  return (
    <section id="kurzantworten" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="max-w-5xl">
          <h2 className={HEADING_CLASS}>Kurzantworten für Eigentümer in Aurich und Ostfriesland</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {GEO_QA_ITEMS.map((item) => (
              <article key={item.question} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
                <h3 className="text-[1.02rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">{item.question}</h3>
                <p className="mt-2 text-[0.96rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function ProofCasesBlock() {
  return (
    <section id="falllogik" className={`bg-white ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="w-full">
          <p className={META_CLASS}>VERKAUFSSITUATIONEN AURICH</p>
          <h2 className={HEADING_CLASS}>Drei typische Verkaufssituationen aus der Praxis</h2>
          <DeferredProofCasesCarousel items={PROOF_CASES} fallback={<ProofCasesStaticFallback />} />
        </div>
      </Wrap>
    </section>
  );
}

export function WarumEigentuemerBeauftragenBlock() {
  return (
    <section id="warum-beauftragen" className={`bg-white ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
          <div>
            <p className={META_CLASS}>WARUM EIGENTÜMER FRISIA BEAUFTRAGEN</p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[1.95rem] leading-[1.17] tracking-[-0.012em] text-[color:var(--color-navy)] md:text-[2.3rem]">
              Wir kümmern uns persönlich um deinen Verkauf
            </h2>

            <div className="mt-6 max-w-[78ch] space-y-4 text-[1rem] leading-[1.75] text-[color:var(--color-graphite)]">
              <p>
                Ein Immobilienverkauf bringt viele organisatorische und praktische Aufgaben mit sich. Frisia Immobilien
                übernimmt diese Schritte für Eigentümer vollständig - von der ersten Bewertung bis zur Schlüsselübergabe.
              </p>
              <p>
                Dazu gehören unter anderem die Einwertung der Immobilie, die Beschaffung und Prüfung der Verkaufsunterlagen sowie
                die professionelle Aufbereitung der Immobilie mit Immobilienfotografie, Vermessung und Energieausweis.
              </p>
              <p>
                Auch die gesamte Vermarktung, die Kommunikation mit Interessenten, die Prüfung der Kaufinteressenten, die
                Kaufpreisverhandlung sowie die Vorbereitung der notariellen Beurkundung begleiten wir persönlich.
              </p>
              <p>
                Wenn es erforderlich ist, organisieren wir zusätzlich Entrümpelungen oder Haushaltsauflösungen und kümmern uns um
                kleinere Arbeiten am Haus oder im Garten, damit eine Immobilie für den Verkauf optimal vorbereitet ist.
              </p>
              <p>
                Die dafür notwendigen Leistungen organisieren wir und übernehmen in vielen Fällen auch die entstehenden Kosten.
              </p>
              <p>
                Unser Ziel ist ein ruhiger Verkaufsprozess, bei dem sich Eigentümer um möglichst wenig selbst kümmern müssen.
              </p>
            </div>

            <ul className="mt-6 grid gap-2 text-[0.98rem] font-semibold leading-[1.55] text-[color:var(--color-navy)] md:grid-cols-2">
              <li className="inline-flex items-start gap-2">
                <span aria-hidden="true">✓</span>
                <span>ruhiger Verkaufsprozess</span>
              </li>
              <li className="inline-flex items-start gap-2">
                <span aria-hidden="true">✓</span>
                <span>klare Struktur im gesamten Ablauf</span>
              </li>
              <li className="inline-flex items-start gap-2">
                <span aria-hidden="true">✓</span>
                <span>geprüfte Kaufinteressenten</span>
              </li>
              <li className="inline-flex items-start gap-2">
                <span aria-hidden="true">✓</span>
                <span>persönliche Verantwortung des Maklers</span>
              </li>
            </ul>
          </div>

          <aside className="order-first lg:order-none lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] shadow-[0_8px_24px_rgba(27,48,64,0.06)]">
              <Image
                src="/images/why/frisia-prinzip-klassische_werte.webp"
                alt="Frisia Prinzip: persönliche Verantwortung, Verlässlichkeit und strukturierter Immobilienverkauf"
                width={1200}
                height={1500}
                sizes="(max-width: 1024px) 100vw, 420px"
                quality={70}
                className="h-auto w-full object-cover"
              />
            </div>
          </aside>
        </div>
      </Wrap>
    </section>
  );
}

export function ObjectionFrameworkBlock() {
  return (
    <section id="einwaende" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="max-w-5xl">
          <h2 className={HEADING_CLASS}>Typische Bedenken – strukturiert geklärt</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {OBJECTION_ITEMS.map((item) => (
              <article key={item.concern} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
                <h3 className="text-[1rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">{item.concern}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.67] text-[color:var(--color-graphite)]">{item.response}</p>
              </article>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function FitBlock() {
  return (
    <section id="passung" className={`${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="max-w-5xl">
          <h2 className={HEADING_CLASS}>Für wen unsere Arbeitsweise passt und für wen nicht</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-[1rem] font-semibold text-[color:var(--color-navy)]">Gute Passung</h3>
              <ul className="mt-3 space-y-2 text-[0.95rem] leading-[1.65] text-[color:var(--color-graphite)]">
                {FIT_CRITERIA.good.map((item) => (
                  <li key={item}>– {item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-[1rem] font-semibold text-[color:var(--color-navy)]">Keine gute Passung</h3>
              <ul className="mt-3 space-y-2 text-[0.95rem] leading-[1.65] text-[color:var(--color-graphite)]">
                {FIT_CRITERIA.notGood.map((item) => (
                  <li key={item}>– {item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function DigitalRatingDetailBlock() {
  return (
    <section id="digitale-bewertung" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="max-w-4xl">
          <h2 className={HEADING_CLASS}>Digitale Immobilienbewertung</h2>
          <div className={`mt-7 space-y-5 ${BODY_CLASS}`}>
            <p>
              Online-Bewertung für Haus, Wohnung, Grundstück oder Gewerbeimmobilie im regionalen Markt in Aurich und
              ganz Ostfriesland.
            </p>
            <p>
              Dauer ca. 60 Sekunden.
              <br />
              Kostenfrei und unverbindlich.
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function MarketBlock() {
  return (
    <section id="marktlage" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="max-w-4xl">
          <h2 className={HEADING_CLASS}>Marktlage im regionalen Markt in Aurich und ganz Ostfriesland</h2>
          <div className={`mt-7 space-y-5 ${BODY_CLASS}`}>
            <p>Der Markt entwickelt sich je nach Lage, Objektart und Zustand deutlich unterschiedlich.</p>
            <p>
              In Aurich sowie in Haxtum, Egels, Extum, Wiesens, Sandhorst oder Walle verändern bereits kurze Distanzen
              Nachfrage, Zielgruppe und Zahlungsbereitschaft.
            </p>
            <p>
              Ein belastbarer Marktpreis entsteht nicht durch Schätzung, sondern durch regionale Vergleichsdaten in{" "}
              <Link href="/immobilienmakler-aurich" className="underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]">
                Aurich
              </Link>{" "}
              und{" "}
              <Link href="/regionen-ostfriesland" className="underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]">
                Ostfriesland
              </Link>
              .
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function RiskBlock() {
  return (
    <Block id="risiko" title="Risiken früh klären, bevor sie Vermögen oder Zeit kosten">
      <p>Ein zu hoher Einstiegspreis verlängert die Vermarktungsdauer. Ein zu niedriger Preis verschenkt Vermögen.</p>
      <p>Unvollständige Unterlagen und ungeprüfte Interessenten führen häufig zu Verzögerungen kurz vor dem Abschluss.</p>
      <p>Klare Zuständigkeit, strukturierte Prüfung und rechtssichere Vorbereitung reduzieren dieses Risiko deutlich.</p>
    </Block>
  );
}

export function RegionNapBlock() {
  return (
    <section id="region" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className={HEADING_CLASS}>Immobilienbewertung und Immobilienverkauf in Aurich und Ostfriesland</h2>
            <p className={`mt-7 ${BODY_CLASS}`}>
              Wir begleiten Eigentümer in typischen Entscheidungsphasen wie Ruhestand, Erbschaft, Trennung oder geplanter
              Verkleinerung. Der Fokus liegt auf planbaren Schritten im regionalen Markt in Aurich und ganz Ostfriesland.
            </p>
            <p className={`mt-5 ${BODY_CLASS}`}>
              Regionaler Markt in Aurich und ganz Ostfriesland: Aurich, Haxtum, Egels, Extum, Wiesens, Sandhorst, Walle,
              Ihlow, Südbrookmerland, Norden, Emden und Wittmund.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Link
                href="/immobilienbewertung-aurich"
                className="rounded-xl border border-[color:var(--color-brass)]/30 px-4 py-2 text-[color:var(--color-navy)] transition-colors hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                data-track="region_link_click"
                data-track-label="immobilienbewertung_aurich"
                data-track-location="region_block"
              >
                Immobilienbewertung in Aurich
              </Link>
              <Link
                href="/haus-verkaufen-aurich"
                className="rounded-xl border border-[color:var(--color-brass)]/30 px-4 py-2 text-[color:var(--color-navy)] transition-colors hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                data-track="region_link_click"
                data-track-label="haus_verkaufen"
                data-track-location="region_block"
              >
                Haus verkaufen
              </Link>
              <Link
                href="/immobilienmakler-aurich"
                className="rounded-xl border border-[color:var(--color-brass)]/30 px-4 py-2 text-[color:var(--color-navy)] transition-colors hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Region Aurich
              </Link>
              <Link
                href="/regionen-ostfriesland"
                className="rounded-xl border border-[color:var(--color-brass)]/30 px-4 py-2 text-[color:var(--color-navy)] transition-colors hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Region Ostfriesland
              </Link>
            </div>
          </div>

          <address className="not-italic md:col-span-5">
            <div className={`${CARD_CLASS} ${BODY_COMPACT_CLASS}`}>
              <h3 className="font-semibold text-[color:var(--color-navy)]">Frisia Immobilien</h3>
              <p className="mt-3">Oldersumer Straße 150</p>
              <p>26605 Aurich</p>
              <p>Telefon 04941 986770-0</p>
              <p>
                <a href={`mailto:${MAIL}`} className="underline underline-offset-4">
                  {MAIL}
                </a>
              </p>
              <p className="mt-4">Regionaler Markt in Aurich und ganz Ostfriesland.</p>
            </div>
          </address>
        </div>
      </Wrap>
    </section>
  );
}

export function FaqBlock() {
  return (
    <section id="faq" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS} pb-28 md:pb-36`}>
      <Wrap>
        <p className={META_CLASS}>HAEUFIGE FRAGEN ZUM IMMOBILIENVERKAUF</p>
        <h2 className={HEADING_CLASS}>Häufige Fragen zum Hausverkauf in Aurich</h2>
        <div className="mt-7 overflow-hidden divide-y divide-[rgba(139,111,61,0.16)] rounded-[36px] border border-[rgba(139,111,61,0.18)] bg-white">
          {FAQ_ITEMS.map((item, idx) => (
            <details key={item.question} className="group bg-white p-6" open={idx === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-[1.1rem] font-semibold leading-[1.55] text-[color:var(--color-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]">
                <span>{item.question}</span>
                <span className="mt-0.5 text-[1.15rem] leading-none text-[color:var(--color-brackish)] group-open:hidden" aria-hidden="true">+</span>
                <span className="mt-0.5 hidden text-[1.15rem] leading-none text-[color:var(--color-brackish)] group-open:inline" aria-hidden="true">−</span>
              </summary>
              <p className={`mt-3 ${BODY_COMPACT_CLASS}`}>{item.answer}</p>
            </details>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

export function TestimonialsBlock() {
  return (
    <section id="kundenstimmen" className={`bg-[color:var(--color-section)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="w-full">
          <p className={META_CLASS}>ERFAHRUNGEN VON EIGENTUEMERN</p>
          <h2 className={HEADING_CLASS}>Kundenstimmen</h2>
          <p className={`mt-6 ${BODY_CLASS}`}>
            Rückmeldungen von Eigentümern und Käufern aus Aurich und ganz Ostfriesland, die ihren Immobilienverkauf
            oder Immobilienkauf mit Frisia Immobilien umgesetzt haben.
          </p>
          <div className="mt-8">
            <DeferredTestimonialsCarousel fallback={<TestimonialsStaticFallback />} />
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function StandortAurichBlock() {
  return (
    <section id="standort-aurich" className={`bg-white ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <Wrap>
        <div className="grid gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7">
            <p className={META_CLASS}>IMMOBILIENMAKLER AURICH</p>
            <h2 className={HEADING_CLASS}>Unser Standort in Aurich</h2>
            <div className={`mt-7 space-y-5 ${BODY_CLASS}`}>
              <p>
                Frisia Immobilien begleitet Eigentümer beim Immobilienverkauf und bei der Immobilienbewertung im
                regionalen Markt in Aurich sowie im gesamten ostfriesischen Raum. Als{" "}
                <Link
                  href="/immobilienmakler-aurich"
                  className="underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]"
                >
                  Immobilienmakler in Aurich
                </Link>{" "}
                unterstützen wir Eigentümer mit Marktkenntnis, klaren Abläufen und persönlicher Begleitung im gesamten
                Verkaufsprozess.
              </p>
              <p>
                Unser Büro befindet sich im Auricher Stadtteil Haxtum in der Oldersumer Straße – direkt neben dem
                Haxtumer Speicher, dem Spielort des Niederdeutschen Theaters Aurich. Gegenüber liegt die historische
                Haxtumer Mühle an der Niedersächsischen Mühlenstraße.
              </p>
              <p>
                Die Bushaltestelle „Im Timp“ (Linie L1) befindet sich auf der gegenüberliegenden Straßenseite. Auch die
                Grundschule Upstalsboom liegt nur rund 500m entfernt.
              </p>
              <p>
                Die Lage zwischen dem Neubaugebiet „Im Timp“ in Extum und dem Baugebiet „Rahester Postweg“ gehört zu
                den gewachsenen Wohnlagen im Auricher Stadtgebiet. Auch das Auricher Schloss und die Sparkassen-Arena
                Aurich sind in wenigen Minuten erreichbar.
              </p>
              <p>
                Ein Immobilienverkauf erfordert Marktkenntnis, klare Abläufe und persönliche Begleitung. Frisia
                Immobilien arbeitet mit einem strukturierten Verkaufsprozess vom ersten Gespräch bis zum Notartermin.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
                <h3 className="text-[1rem] font-semibold text-[color:var(--color-navy)]">Standort</h3>
                <p className="mt-3 text-[0.95rem] leading-[1.65] text-[color:var(--color-graphite)]">
                  Frisia Immobilien
                  <br />
                  Oldersumer Straße 150
                  <br />
                  26605 Aurich
                </p>
                <p className="mt-4 text-[0.95rem] font-semibold text-[color:var(--color-navy)]">Region</p>
                <p className="mt-1 text-[0.95rem] leading-[1.65] text-[color:var(--color-graphite)]">Aurich und Ostfriesland</p>
                <p className="mt-4 text-[0.95rem] font-semibold text-[color:var(--color-navy)]">Telefon</p>
                <p className="mt-1 text-[0.95rem] leading-[1.65] text-[color:var(--color-graphite)]">
                  <a href={PHONE_HREF} className="inline-flex min-h-6 items-center underline underline-offset-4">
                    04941 986770-0
                  </a>
                </p>
                <a
                  href="#immobilienbewertung"
                  className="mt-3 inline-flex items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Termin zur Immobilienbewertung
                </a>
              </article>

              <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
                <h3 className="text-[1rem] font-semibold text-[color:var(--color-navy)]">Öffnungszeiten</h3>
                <p className="mt-3 text-[0.95rem] leading-[1.65] text-[color:var(--color-graphite)]">
                  Montag bis Freitag
                  <br />
                  09:00 Uhr bis 18:00 Uhr
                </p>
                <p className="mt-4 text-[0.95rem] font-semibold text-[color:var(--color-navy)]">
                  Besonderer Service für Berufstätige
                </p>
                <p className="mt-1 text-[0.95rem] leading-[1.65] text-[color:var(--color-graphite)]">
                  Donnerstags nach Terminvereinbarung
                  <br />
                  18:00 Uhr bis 20:00 Uhr
                </p>
                <p className="mt-4 text-[0.9rem] font-semibold text-[color:var(--color-navy)]">
                  Immobilienmakler in Aurich – Standort Haxtum
                </p>
              </article>
            </div>
          </div>

          <aside className="md:col-span-5 md:sticky md:top-24">
            <a
              href={GOOGLE_MAPS_AURICH}
              target="_blank"
              rel="noopener"
              className="group block rounded-3xl border border-[color:var(--color-brass)]/25 bg-white p-3 shadow-[0_10px_30px_rgba(27,48,64,0.06)]"
              aria-describedby="standort-aurich-map-note"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-brass)]/20 bg-[color:var(--color-section)]/40">
                <Image
                  src="/images/standort/aurich_standortkarte_maps.webp"
                  alt="Karte Standort Frisia Immobilien Oldersumer Straße 150 Aurich Haxtum"
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  quality={72}
                  className="h-auto w-full object-cover"
                />
                <div className="absolute left-3 top-3 rounded-lg border border-[color:var(--color-brass)]/25 bg-white/92 px-3 py-2 text-[0.78rem] leading-[1.45] text-[color:var(--color-navy)] shadow-sm backdrop-blur">
                  <p className="font-semibold">Frisia Immobilien</p>
                  <p>Oldersumer Straße 150</p>
                  <p>26605 Aurich</p>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(27,48,64,0.78)] to-transparent p-4">
                  <span className="inline-flex rounded-lg bg-white/92 px-3 py-1.5 text-[0.82rem] font-semibold text-[color:var(--color-navy)]">
                    In Google Maps öffnen
                  </span>
                </div>
              </div>
              <span id="standort-aurich-map-note" className="sr-only">
                Öffnet Google Maps in einem neuen Fenster.
              </span>
            </a>
          </aside>
        </div>
      </Wrap>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className={`relative overflow-hidden bg-[color:var(--color-navy)] ${SECTION_Y} ${LAZY_SECTION_CLASS}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-10 right-[12%] hidden w-[100%] md:block"
      >
        <Image
          src="/images/footer/frisia_wappen.webp"
          alt=""
          fill
          className="object-contain object-right opacity-[0.05]"
          sizes="(min-width: 768px) 48vw, 0vw"
        />
      </div>
      <Wrap>
        <div className="relative z-10 max-w-3xl">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white/75">IMMOBILIENBEWERTUNG AURICH</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.15] tracking-[-0.015em] text-white md:text-[2.45rem]">
            Jetzt deine Immobilie fundiert bewerten lassen
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#bewertung"
              className="rounded-2xl bg-white px-7 py-3.5 text-center text-base font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              data-track="closing_primary_cta_click"
              data-track-label="ersteinschaetzung_starten"
              data-track-location="closing_cta"
            >
              Bewertung starten
            </a>
            <a
              href={PHONE_HREF}
              className="rounded-2xl border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white/95 transition-colors hover:border-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              data-track="closing_phone_cta_click"
              data-track-label="persoenlich_sprechen"
              data-track-location="closing_cta"
            >
              Direkt persönlich: 04941 986770-0
            </a>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

export function HomeFooter() {
  return (
    <footer
      className="border-t border-[rgba(0,0,0,0.06)] py-14"
      style={{ background: "linear-gradient(180deg, #F7F8F8 0%, #F2F3F4 100%)" }}
    >
      <Wrap>
        <div className="grid gap-6 border-b border-[rgba(0,0,0,0.06)] pb-8 text-[0.9rem] leading-[1.62] text-[color:var(--color-graphite)] md:grid-cols-2 lg:grid-cols-4 md:items-start">
          <div>
            <div className="font-[family-name:var(--font-playfair)] text-[1.7rem] leading-[1.1] text-[color:var(--color-navy)]">
              Kontaktiere uns
            </div>
            <p className="mt-3 max-w-[26ch] text-[0.86rem] leading-[1.6] text-[color:var(--color-graphite)]/90">
              Persönliche Begleitung für Verkauf, Kauf und Bewertung im regionalen Markt in Aurich und ganz Ostfriesland.
            </p>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Kontakt</p>
            <p className="mt-2">
              Frisia Immobilien
              <br />
              Oldersumer Straße 150
              <br />
              26605 Aurich
              <br />
              Deutschland
            </p>
            <p className="mt-3">
              <a href={PHONE_HREF} className="hover:text-[color:var(--color-brackish)]">
                Telefon 04941 986770-0
              </a>
              <br />
              <a href={`mailto:${MAIL}`} className="underline underline-offset-4 hover:text-[color:var(--color-brackish)]">
                {MAIL}
              </a>
            </p>
            <p className="mt-3">Regionaler Markt in Aurich und ganz Ostfriesland</p>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Social Media</p>
            <div className="mt-2 grid grid-cols-2 gap-x-0 gap-y-2">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-0 py-1 text-[0.86rem] transition-colors hover:text-[color:var(--color-brackish)]"
              >
                <SocialIcon platform="instagram" />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-0 py-1 text-[0.86rem] transition-colors hover:text-[color:var(--color-brackish)]"
              >
                <SocialIcon platform="facebook" />
                <span>Facebook</span>
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-0 py-1 text-[0.86rem] transition-colors hover:text-[color:var(--color-brackish)]"
              >
                <SocialIcon platform="linkedin" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Schnellzugriff</p>
            <div className="mt-4 flex h-full flex-col">
              <div className="flex flex-col items-start gap-3">
                <a
                  href="#immobilienbewertung"
                  className="inline-flex min-h-14 items-center justify-center rounded-[20px] bg-[color:var(--color-navy)] px-7 py-3 text-center text-[0.92rem] font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
                >
                  Immobilie kostenlos bewerten
                </a>
                <a
                  href={PHONE_HREF}
                  className="inline-flex min-h-14 items-center justify-center rounded-[20px] border border-[color:var(--color-brass)]/50 bg-white px-7 py-3 text-center text-[0.92rem] font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brackish)]"
                >
                  Anrufen
                </a>
              </div>
              <a
                href="#top"
                className="mt-5 inline-flex items-center gap-2 font-semibold text-[color:var(--color-navy)] transition-colors hover:text-[color:var(--color-brackish)]"
              >
                <span aria-hidden="true" className="text-[1.05rem] leading-none">↑</span>
                <span>Nach oben</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 border-b border-[rgba(0,0,0,0.06)] pb-8 text-[0.78rem] leading-[1.65] text-[color:var(--color-graphite)] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Leistungen</p>
            <div className="mt-2 space-y-1">
              <Link href="/haus-verkaufen-aurich" className="block hover:text-[color:var(--color-brackish)]">Haus verkaufen in Aurich</Link>
              <Link href="/immobilienbewertung" className="block hover:text-[color:var(--color-brackish)]">Immobilienbewertung</Link>
              <Link href="/immobilien-aurich" className="block hover:text-[color:var(--color-brackish)]">Immobilie kaufen</Link>
              <Link href="/immobilienpreise" className="block hover:text-[color:var(--color-brackish)]">Marktberichte</Link>
              <Link href="/haus-verkaufen-aurich" className="block hover:text-[color:var(--color-brackish)]">Ratgeber Hausverkauf</Link>
            </div>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Unternehmen</p>
            <div className="mt-2 space-y-1">
              <Link href="/ueber-uns" className="block hover:text-[color:var(--color-brackish)]">Über Frisia Immobilien</Link>
              <Link href="/#warum-frisia" className="block hover:text-[color:var(--color-brackish)]">Das Frisia Prinzip</Link>
              <Link href="/#standort-aurich" className="block hover:text-[color:var(--color-brackish)]">Unser Standort in Aurich</Link>
              <Link href="/#kundenstimmen" className="block hover:text-[color:var(--color-brackish)]">Kundenstimmen</Link>
              <Link href="/ueber-uns/netzwerk" className="block hover:text-[color:var(--color-brackish)]">Unsere Partner</Link>
              <Link href="/kontakt" className="block hover:text-[color:var(--color-brackish)]">Tippgeber</Link>
              <Link href="/kontakt" className="block hover:text-[color:var(--color-brackish)]">Kontakt</Link>
            </div>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Karriere</p>
            <div className="mt-2 space-y-1">
              <Link href="/karriere" className="block hover:text-[color:var(--color-brackish)]">Karriere bei Frisia Immobilien</Link>
              <Link href="/karriere#immobilienmakler-werden" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler werden</Link>
              <Link href="/karriere#ausbildung" className="block hover:text-[color:var(--color-brackish)]">Ausbildung bei Frisia Immobilien</Link>
            </div>
            <p className="mt-5 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Presse</p>
            <div className="mt-2 space-y-1">
              <Link href="/presse" className="block hover:text-[color:var(--color-brackish)]">Presseberichte</Link>
            </div>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Rechtliches</p>
            <div className="mt-2 space-y-1">
              <Link href="/recht/impressum" className="block hover:text-[color:var(--color-brackish)]">Impressum</Link>
              <Link href="/recht/datenschutz" className="block hover:text-[color:var(--color-brackish)]">Datenschutz</Link>
              <Link href="/recht" className="block hover:text-[color:var(--color-brackish)]">AGB</Link>
              <Link href="/recht/cookies" className="block hover:text-[color:var(--color-brackish)]">Cookie-Hinweise</Link>
              <button type="button" data-cookie-settings-trigger className="cursor-pointer text-left text-xs underline underline-offset-4 hover:text-[color:var(--color-brackish)]">
                Cookie-Einstellungen ändern
              </button>
            </div>
          </div>
          <div className="col-span-full h-px bg-[rgba(0,0,0,0.06)]" aria-hidden="true" />
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Region</p>
            <div className="mt-2 space-y-1">
              <Link href="/immobilienmakler-aurich" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Aurich</Link>
              <Link href="/immobilienbewertung-aurich" className="block hover:text-[color:var(--color-brackish)]">Immobilienbewertung Aurich</Link>
              <Link href="/immobilienmakler-ostfriesland" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Ostfriesland</Link>
            </div>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Städte</p>
            <div className="mt-2 space-y-1">
              <Link href="/immobilienmakler-emden" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Emden</Link>
              <Link href="/immobilienmakler-norden" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Norden</Link>
              <Link href="/immobilienmakler-wiesmoor" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Wiesmoor</Link>
              <Link href="/immobilienmakler-wittmund" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Wittmund</Link>
              <Link href="/immobilienmakler-leer" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Leer</Link>
            </div>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Gemeinden</p>
            <div className="mt-2 space-y-1">
              <Link href="/immobilienmakler-grossheide" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Großheide</Link>
              <Link href="/immobilienmakler-suedbrookmerland" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Südbrookmerland</Link>
              <Link href="/immobilienmakler-krummhoern" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Krummhörn</Link>
              <Link href="/immobilienmakler-friedeburg" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Friedeburg</Link>
              <Link href="/immobilienmakler-hage" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Hage</Link>
            </div>
          </div>
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Nordseeinseln</p>
            <div className="mt-2 space-y-1">
              <Link href="/immobilienmakler-norderney" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Norderney</Link>
              <Link href="/immobilienmakler-juist" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Juist</Link>
              <Link href="/immobilienmakler-langeoog" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Langeoog</Link>
              <Link href="/immobilienmakler-spiekeroog" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Spiekeroog</Link>
              <Link href="/immobilienmakler-baltrum" className="block hover:text-[color:var(--color-brackish)]">Immobilienmakler Baltrum</Link>
            </div>
          </div>
        </div>

        <p className="mt-8  pt-4 text-[0.78rem] text-[color:var(--color-graphite)]">
          „Frisia Immobilien“ ist eine angemeldete Marke beim Deutschen Patent- und Markenamt (DPMA).
        </p>

        <p className="mt-6 text-xs text-[color:var(--color-graphite)]">
          © 2026 Frisia Immobilien
          <br />
          Regionaler Immobilienmakler für Aurich und Ostfriesland
        </p>
      </Wrap>
    </footer>
  );
}

function WhyFrisiaStaticFallback() {
  return (
    <div className="max-w-6xl">
      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
        IMMOBILIENMAKLER OSTFRIESLAND
      </p>
      <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-[2.45rem]">
        Warum Frisia Immobilien?
      </h2>
      <p className="mt-6 max-w-[74ch] text-[1.02rem] leading-[1.78] text-[color:var(--color-graphite)]">
        Immobilienverkauf und Immobilienkauf im regionalen Markt von Aurich und ganz Ostfriesland – mit Erfahrung,
        moderner Technik und klaren Prinzipien.
      </p>
      <div className="mt-8 rounded-3xl border border-[color:var(--color-brass)]/25 bg-white p-5 md:p-7">
        <div className="hidden gap-3 md:grid md:grid-cols-5" aria-hidden="true">
          {["Das Frisia Prinzip", "Reichweite", "Vermarktung", "Verkaufen", "Kaufen"].map((item, idx) => (
            <div
              key={item}
              className={`rounded-2xl border px-4 py-4 ${
                idx === 0
                  ? "border-[color:var(--color-navy)] bg-white ring-2 ring-[color:var(--color-navy)]/15 shadow-sm"
                  : "border-slate-200 bg-white/80"
              }`}
            >
              <p className="text-[1rem] font-semibold leading-[1.4] text-[color:var(--color-navy)]">{item}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 md:hidden" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className="flex h-12 w-12 items-center justify-center rounded-full">
              <span className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? "bg-[color:var(--color-navy)]" : "bg-[color:var(--color-brass)]/35"}`} />
            </span>
          ))}
        </div>
        <div className="mt-8 gap-7 md:grid md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[color:var(--color-section)]/45">
              <Image
                src="/images/why/frisia_alte-werte.webp"
                alt="Das Frisia Prinzip mit klassischen Werten und persönlicher Verantwortung"
                width={900}
                height={1200}
                sizes="(max-width: 768px) 100vw, 40vw"
                quality={70}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="mt-5 md:col-span-7 md:mt-0">
            <h3 className="text-[1.42rem] font-semibold leading-[1.35] text-[color:var(--color-navy)] md:text-[1.58rem]">
              Das Frisia Prinzip
            </h3>
            <p className="mt-4 text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">
              Neben moderner Technik zählen für uns ebenfalls klassische Werte.
            </p>
            <p className="mt-3 text-[0.98rem] leading-[1.72] text-[color:var(--color-graphite)]">
              Ein Immobilienverkauf ist Vertrauenssache. Deshalb arbeiten wir mit klaren Abläufen, verlässlicher
              Kommunikation und persönlicher Verantwortung.
            </p>
            <ul className="mt-5 space-y-3 text-[0.96rem] leading-[1.62] text-[color:var(--color-graphite)]">
              {[
                "Pünktlichkeit und Verlässlichkeit im gesamten Verkaufsprozess",
                "Klare Absprachen und transparente Entscheidungen",
                "Persönliche Begleitung statt anonymem Maklerprozess",
                "Verantwortung gegenüber Eigentümern und Käufern",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <Image
                    src="/images/prozess/checkbox.webp"
                    alt=""
                    aria-hidden="true"
                    width={26}
                    height={26}
                    className="mt-0.5 h-6 w-6 shrink-0 object-contain"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.98rem] font-medium leading-[1.66] text-[color:var(--color-navy)]">
              Bei Frisia Immobilien zählt noch das Wort – genauso wie der Handschlag.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegionalMarktStaticFallback() {
  const cityLinks = [
    { label: "Aurich", href: "/immobilienmakler-aurich" },
    { label: "Emden", href: "/immobilienmakler-emden" },
    { label: "Norden", href: "/immobilienmakler-norden" },
    { label: "Leer", href: "/immobilienmakler-leer" },
    { label: "Wittmund", href: "/immobilienmakler-wittmund" },
    { label: "Friedeburg", href: "/immobilienmakler-friedeburg" },
  ] as const;

  return (
    <div className="relative max-w-6xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-11rem] top-[-4.25rem] z-0 hidden h-[24rem] w-[38rem] max-w-none bg-[url('/images/regions/ostfriesland-karte.webp')] bg-contain bg-left-top bg-no-repeat opacity-[0.09] md:block"
      />

      <div className="relative z-10">
      <p className={META_CLASS}>REGIONALER IMMOBILIENMARKT</p>
      <h2 className={HEADING_CLASS}>Der Immobilienmarkt in Aurich & Ostfriesland</h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(28rem,0.9fr)] lg:items-stretch">
        <div className="flex flex-col">
          <div className="max-w-[74ch] space-y-4 text-[1.02rem] leading-[1.78] text-[color:var(--color-graphite)]">
            <p>Der Immobilienmarkt in Aurich und ganz Ostfriesland entwickelt sich je nach Lage deutlich unterschiedlich.</p>
            <p>
              Während Immobilien in zentralen Lagen von Aurich häufig eine stabile Nachfrage verzeichnen, können Preise
              und Vermarktungszeiten in anderen Regionen deutlich variieren.
            </p>
            <p>
              Auch Faktoren wie Baujahr, Zustand, Grundstücksgröße und energetischer Standard beeinflussen den
              tatsächlichen Marktwert erheblich.
            </p>
            <p>
              Frisia Immobilien analysiert regelmäßig aktuelle Verkaufsdaten, Vergleichsobjekte und Preisentwicklungen
              im regionalen Immobilienmarkt sowie aktuelle Immobilienpreise in Aurich und Ostfriesland.
            </p>
            <p>Diese Daten bilden die Grundlage für eine realistische Immobilienbewertung und eine fundierte Verkaufsstrategie.</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-[0.82rem] font-medium text-[color:var(--color-graphite)]">
            {cityLinks.map((city) => (
              <Link
                key={city.label}
                href={city.href}
                className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1"
              >
                {city.label}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <p className="mb-5 text-[0.98rem] leading-[1.6] text-[color:var(--color-graphite)]">
              Wie liegt deine Immobilie aktuell im Markt?
            </p>
            <a
              href="#immobilienbewertung"
              className="inline-flex items-center rounded-xl bg-[color:var(--color-navy)] px-5 py-2.5 text-[0.9rem] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              Marktwert jetzt einordnen
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:h-full">
          {REGIONAL_MARKT_LINKS.map((item, idx) => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex min-h-[10rem] flex-col justify-between rounded-2xl border bg-[color:var(--color-navy)] p-5 text-white ${
                idx === 0
                  ? "border-[color:var(--color-brass)] ring-2 ring-[color:var(--color-brass)]/35 shadow-sm"
                  : "border-white/10"
              }`}
            >
              <span>
                <span className="block text-[1.02rem] font-semibold leading-[1.35]">{item.title}</span>
                <span className="mt-2 block text-[0.92rem] leading-[1.58] text-white/78">{item.copy}</span>
              </span>
              <span className="mt-4 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white/88">
                {item.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

function ProofCasesStaticFallback() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {PROOF_CASES.map((item) => (
        <article key={item.title} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
          <h3 className="text-[1rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">{item.title}</h3>
          <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.setup}</p>
          <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.approach}</p>
          <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.outcome}</p>
        </article>
      ))}
    </div>
  );
}

function TestimonialsStaticFallback() {
  const items = [
    {
      name: "S. und M.K., Aurich",
      context: "Verkauf Einfamilienhaus",
      text: "Wir wollten vor allem Sicherheit und einen ruhigen Ablauf. Genau das haben wir bekommen: klare Bewertung, klare Schritte und ein rechtssicherer Abschluss ohne unnötige Unruhe.",
    },
    {
      name: "H.T., Wiesmoor",
      context: "Erbfall mit Abstimmungsbedarf",
      text: "Die strukturierte Vorgehensweise hat uns als Familie sehr geholfen. Es gab eine nachvollziehbare Entscheidungsgrundlage und am Ende eine Lösung, die alle mittragen konnten.",
    },
    {
      name: "B.R., Norden",
      context: "Diskreter Verkauf",
      text: "Uns war Vertraulichkeit besonders wichtig. Frisia hat genau passende Interessenten angesprochen und den gesamten Prozess sehr kontrolliert geführt.",
    },
  ] as const;

  return (
    <div className="rounded-3xl border border-[color:var(--color-brass)]/25 bg-white p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={`${item.name}-${item.context}`}
            className="rounded-2xl border border-white/15 bg-[#1b3040] p-8 md:p-10"
          >
            <p className="text-[0.95rem] tracking-[0.08em] text-white" aria-label="5 von 5 Sternen">
              {"★★★★★"}
            </p>
            <p className="mt-3 text-[0.96rem] leading-[1.7] text-white/95">{item.text}</p>
            <p className="mt-4 text-[0.93rem] font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-[0.84rem] text-white/80">{item.context}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
