import type { Metadata } from "next";
import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import RegionalCrossLinks, { RegionalInlineLinks, RegionalLocalFAQ } from "@/components/seo/RegionalCrossLinks";
import LeadGenWizard from "@/components/immobilienbewertung/LeadGenWizard.client";
import AurichMarketTeaser from "@/components/sections/AurichMarketTeaser";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
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

const PATH = "/immobilienbewertung-aurich";
const HERO_IMAGE = "/images/immobilienbewertung/immobilienbewertung-aurich-hero-bewertung.webp";
const HERO_MOBILE_IMAGE = "/images/immobilienbewertung/immobilienbewertung-aurich-hero-bewertung.webp";

const faqItems = [
  {
    question: "Wo kann ich kostenlos den Wert meiner Immobilie schätzen lassen?",
    answer:
      "Eine erste Einschätzung erhältst du über eine kostenlose Online-Bewertung. Dabei werden aktuelle Marktdaten und Vergleichsobjekte aus Aurich und ganz Ostfriesland berücksichtigt. Für eine exakte Einordnung empfiehlt sich zusätzlich eine persönliche Bewertung vor Ort.",
  },
  {
    question: "Ersetzt eine Online-Bewertung den Besuch eines Maklers?",
    answer:
      "Nein. Die Online-Bewertung ist der erste Schritt zur Orientierung. Für eine exakte und marktgerechte Bewertung ist die persönliche Besichtigung entscheidend, da viele wertrelevante Faktoren nur vor Ort beurteilt werden können.",
  },
  {
    question: "Was kostet eine seriöse Immobilienbewertung?",
    answer:
      "Eine erste Online-Bewertung ist in der Regel kostenlos und unverbindlich. Eine fundierte, persönliche Bewertung vor Ort wird häufig im Rahmen eines möglichen Verkaufs ebenfalls kostenfrei angeboten. Umfangreiche Gutachten, etwa für Banken oder Gerichte, sind kostenpflichtig.",
  },
  {
    question: "Wie genau ist eine Online-Immobilienbewertung?",
    answer:
      "Die Bewertung basiert auf aktuellen Marktdaten, Vergleichsobjekten sowie Erfahrungswerten aus Aurich und ganz Ostfriesland. Sie gibt dir eine realistische Preisspanne. Die genaue Einordnung erfolgt anschließend durch eine persönliche Einschätzung.",
  },
  {
    question: "Wie kann ich selbst den Wert meiner Immobilie ermitteln?",
    answer:
      "Du kannst dich an vergleichbaren Immobilien in deiner Region orientieren und Online-Tools nutzen. Diese liefern eine erste Preisspanne. Faktoren wie Zustand, Mikro-Lage und Nachfrage lassen sich jedoch nur individuell bewerten.",
  },
  {
    question: "Wer kann mir sagen, was mein Haus wirklich wert ist?",
    answer:
      "Eine verlässliche Einschätzung erhältst du durch einen erfahrenen Immobilienmakler oder Sachverständigen mit regionaler Marktkenntnis. Gerade in Ostfriesland spielen Lage, Nachfrage und Zustand eine entscheidende Rolle.",
  },
  {
    question: "Was ist der häufigste Fehler bei der Immobilienbewertung?",
    answer:
      "Der größte Fehler ist ein falscher Angebotspreis. Ist der Preis zu hoch, bleibt die Immobilie lange am Markt. Ist er zu niedrig, wird sie unter Wert verkauft. Beides kostet Eigentümer bares Geld.",
  },
] as const;

const trustItems = [
  {
    text: "Basiert auf echten Verkaufsdaten aus Aurich und ganz Ostfriesland.",
    icon: "/images/immobilienbewertung/locator_pin.webp",
  },
  {
    text: "Zeigt dir eine realistische Preisspanne statt unrealistischer Lockwerte.",
    icon: "/images/immobilienbewertung/euro_small.webp",
  },
  {
    text: "Gibt dir die Möglichkeit, den Wert anschließend persönlich einordnen zu lassen",
    icon: "/images/immobilienbewertung/persoenlich.webp",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: "Immobilienbewertung Aurich: realistischer Wert",
  description:
    "Ermitteln Sie den realistischen Wert Ihrer Immobilie in Aurich. Fundierte Bewertung auf Basis aktueller Marktdaten. Jetzt unverbindlich starten.",
  path: PATH,
  keywords: [
    "immobilienbewertung",
    "immobilienbewertung aurich",
    "immobilienbewertung ostfriesland",
    "haus bewerten",
    "wohnung bewerten",
    "immobilienwert",
    "kostenlose bewertung",
  ],
  imagePath: HERO_IMAGE,
});

export default function ImmobilienbewertungAurichPage() {
  const canonical = absoluteUrl(PATH);

  const breadcrumbJsonLd = createBreadcrumbListJsonLd(PATH, [
    { name: "Startseite", item: SITE_URL },
    { name: "Immobilienbewertung", item: canonical },
  ]);

  const webPageJsonLd = {
    ...createWebPageJsonLd({
    path: PATH,
    name: "Kostenlose Immobilienbewertung Ostfriesland",
    description:
      "Marktgerechte Immobilienbewertung für Aurich, Norden, Emden & ganz Ostfriesland. Kostenlos, unverbindlich, in 2 Minuten.",
    imagePath: HERO_IMAGE,
    }),
    mainEntity: {
      "@id": `${canonical}#service`,
    },
    hasPart: [
      { "@id": `${canonical}#bewertungstool` },
      { "@id": `${canonical}#vertrauen` },
      { "@id": `${canonical}#faq` },
    ],
    potentialAction: {
      "@type": "RegisterAction",
      name: "Immobilienbewertung starten",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${canonical}#bewertung`,
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      object: {
        "@id": `${canonical}#service`,
      },
    },
  };

  const serviceJsonLd = createServiceJsonLd({
    path: PATH,
    name: "Kostenlose Immobilienbewertung",
    serviceType: "Immobilienbewertung",
    description:
      "Marktgerechte Immobilienbewertung für Immobilien in Aurich, Norden, Emden, Leer, Wittmund und ganz Ostfriesland.",
    areaServed: [...AREA_SERVED, "Ihlow", "Südbrookmerland", "Wiesmoor"],
  });

  const faqJsonLd = createFAQPageJsonLd(PATH, faqItems);

  const localBusinessJsonLd = createLocalBusinessJsonLd({
    "@id": `${canonical}#local-business`,
    url: canonical,
    areaServed: [...AREA_SERVED, "Ihlow", "Südbrookmerland", "Wiesmoor"],
  });

  const realEstateAgentJsonLd = createRealEstateAgentJsonLd({
    "@id": `${canonical}#real-estate-agent`,
    url: canonical,
    areaServed: [...AREA_SERVED, "Ihlow", "Südbrookmerland", "Wiesmoor"],
  });

  const serviceOfferJsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${canonical}#angebot`,
    name: "Kostenlose Online-Immobilienbewertung",
    url: `${canonical}#bewertung`,
    price: "0",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    areaServed: [...AREA_SERVED, "Ihlow", "Südbrookmerland", "Wiesmoor"],
    seller: {
      "@id": absoluteUrl("/#real-estate-agent"),
    },
    itemOffered: {
      "@id": `${canonical}#service`,
    },
  };

  const valuationToolJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${canonical}#bewertungstool`,
    name: "Online-Immobilienbewertung Aurich und Ostfriesland",
    url: `${canonical}#bewertung`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Moderner Webbrowser mit JavaScript",
    inLanguage: "de-DE",
    isAccessibleForFree: true,
    provider: {
      "@id": absoluteUrl("/#real-estate-agent"),
    },
    offers: {
      "@id": `${canonical}#angebot`,
    },
    featureList: trustItems.map((item) => item.text),
  };

  const trustItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${canonical}#vertrauen`,
    name: "Warum diese Immobilienbewertung funktioniert",
    itemListElement: trustItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.text,
    })),
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${canonical}#ablauf`,
    name: "Immobilienbewertung in Aurich starten",
    description: "Kostenlose Markteinschätzung für deine Immobilie in 2 Minuten.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Adresse eingeben",
        text: "Gib die Adresse deiner Immobilie ein.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Angaben ergänzen",
        text: "Ergänze Größe, Baujahr und Zustand.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Preisrahmen erhalten",
        text: "Du erhältst sofort eine fundierte Markteinschätzung.",
      },
    ],
  };

  return (
    <main id="main-content" className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={localBusinessJsonLd} />
      <JsonLd data={realEstateAgentJsonLd} />
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={serviceOfferJsonLd} />
      <JsonLd data={valuationToolJsonLd} />
      <JsonLd data={trustItemListJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={howToJsonLd} />

      <MobileHeroSection
        eyebrow="Immobilienbewertung Aurich & Ostfriesland"
        title="Dein Immobilienwert fundiert und nachvollziehbar ermittelt."
        description="Kostenlos, unverbindlich und regional eingeordnet. In zwei Minuten starten und danach persönlich besprechen."
        imageSrc={HERO_MOBILE_IMAGE}
        imageAlt="Laptop mit Immobilienbewertung auf Terrasse vor einem Wohnhaus"
        imagePosition="68% center"
        primaryCta={{ href: "#bewertung", label: "Immobilienwert ermitteln" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Kostenfrei", "Unverbindlich", "Marktdaten"]}
      />

      <section className="relative hidden min-h-[calc(100svh-4rem)] overflow-hidden bg-[#f4f6f8] md:block">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-[68%_center] md:block"
        />
        <Image
          src={HERO_MOBILE_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] md:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.95)_24%,rgba(255,255,255,0.78)_46%,rgba(255,255,255,0.24)_70%,rgba(255,255,255,0.04)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.10)_62%,rgba(255,255,255,0.52)_100%)]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1440px] flex-col justify-start px-5 pb-14 pt-18 sm:px-8 md:pb-18 md:pt-20 lg:px-12">
          <div className="max-w-[40rem] min-w-0">
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.19em] text-[color:var(--color-navy)]">
                Immobilienbewertung Aurich & Ostfriesland
              </p>
            </div>

            <h1 className="mt-7 max-w-[13ch] break-words font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)]">
              Dein Immobilienwert – fundiert und nachvollziehbar ermittelt.
            </h1>
            <HeroDivider />

            <p className="mt-7 text-[1.2rem] leading-[1.6] text-[color:var(--color-graphite)] md:text-[1.35rem]">
              Kostenlos. Unverbindlich. <span className="font-semibold text-[color:var(--color-brackish)]">In 2 Minuten.</span>
            </p>

            <a
              href="#bewertung"
              className="mt-8 inline-flex min-h-16 items-center justify-center gap-8 rounded-xl bg-[color:var(--color-navy)] px-9 py-4 text-[1rem] font-semibold text-white shadow-[0_18px_42px_-30px_rgba(27,48,64,0.75)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              <span>Immobilienwert jetzt ermitteln</span>
              <span className="text-[1.7rem] leading-none" aria-hidden="true">→</span>
            </a>

            <div className="mt-9 grid max-w-[44rem] gap-4 text-[1.02rem] leading-[1.45] text-[color:var(--color-navy)] sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Image src="/immobilienbewertung/icons/hero/check.webp" alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
                <span>Kostenfrei</span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/immobilienbewertung/icons/hero/schild_trust.webp" alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
                <span>Unverbindlich</span>
              </div>
              <div className="flex items-start gap-3 sm:col-span-1">
                <Image src="/immobilienbewertung/icons/hero/statistik.webp" alt="" width={28} height={28} className="mt-0.5 h-7 w-7 shrink-0 object-contain" />
                <span>Basierend auf echten Verkaufsdaten</span>
              </div>
            </div>
          </div>

          <aside className="mt-12 max-w-[34rem] rounded-2xl border border-[color:var(--color-brass)]/18 bg-white/94 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-navy)]">
                <Image src="/immobilienbewertung/icons/hero/trust.webp" alt="" width={42} height={42} className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="text-[1.08rem] font-semibold leading-[1.35] text-[color:var(--color-navy)]">
                  Sichere Daten. Ohne Verpflichtung.
                </p>
                <p className="mt-2 text-[0.98rem] leading-[1.65] text-[color:var(--color-graphite)]">
                  Deine Angaben werden vertraulich behandelt und nicht ohne deine Zustimmung weitergegeben.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <RegionalCrossLinks locationSlug="aurich" locationLabel="Aurich" templatePrefix="immobilienbewertung" placement="hero" />

      <section id="bewertung" className="scroll-mt-16 bg-white pt-12 pb-8 md:pt-16 md:pb-10" aria-label="Immobilienbewertung starten">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-8 max-w-3xl">
            <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-[1.15] text-[color:var(--color-navy)] md:text-[2.6rem]">
              Immobilienwert ermitteln
            </h2>
          </div>
          <LeadGenWizard layout="embedded" />
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-12 md:py-16" aria-label="Warum diese Bewertung funktioniert">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="rounded-[1.75rem] border border-[color:var(--color-brass)]/24 bg-white p-7 shadow-[0_18px_50px_-45px_rgba(27,48,64,0.45)] md:p-9">
            <h2 className="font-[family-name:var(--font-playfair)] text-[1.95rem] leading-[1.16] text-[color:var(--color-navy)] md:text-[2.35rem]">
              Warum diese Bewertung funktioniert
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {trustItems.map((item) => (
                <article
                  key={item.text}
                  className="flex items-start gap-4 rounded-2xl border border-[color:var(--color-brass)]/22 bg-[color:var(--color-section)] px-5 py-5 text-[1.03rem] font-semibold leading-[1.62] text-[color:var(--color-graphite)] shadow-[0_14px_34px_-32px_rgba(27,48,64,0.35)]"
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={52}
                    height={52}
                    sizes="52px"
                    className="mt-1 h-12 w-12 shrink-0 object-contain"
                  />
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <div className="mt-7 border-l-2 border-[color:var(--color-brass)]/60 pl-5 text-[1.08rem] leading-[1.72] text-[color:var(--color-navy)]">
              <p>Eine erste Einschätzung ist schnell gemacht.</p>
              <p className="font-semibold">Entscheidend ist, wo deine Immobilie aktuell wirklich im Markt steht.</p>
            </div>
          </div>
        </div>
      </section>

      <AurichMarketTeaser tone="white" />

      <section className="bg-[color:var(--color-section)] pt-14 pb-16 md:pt-20 md:pb-22">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
              Häufige Fragen
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.25rem] leading-[1.13] text-[color:var(--color-navy)] md:text-[2.85rem]">
              Häufige Fragen zur Immobilienbewertung
            </h2>
          </div>
          <div className="mt-10 space-y-4 border-t border-[color:var(--color-brass)]/30 pt-5">
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group rounded-2xl border border-[color:var(--color-brass)]/35 bg-white p-5 open:shadow-sm md:p-6"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[1.12rem] font-semibold leading-[1.45] text-[color:var(--color-navy)] md:text-[1.2rem]">
                  <span>{item.question}</span>
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

      <RegionalInlineLinks locationSlug="aurich" locationLabel="Aurich" templatePrefix="immobilienbewertung" pageType="immobilienbewertung" />
      <RegionalLocalFAQ locationSlug="aurich" locationLabel="Aurich" templatePrefix="immobilienbewertung" pageType="immobilienbewertung" />
      <RegionalCrossLinks locationSlug="aurich" locationLabel="Aurich" templatePrefix="immobilienbewertung" placement="bottom" />
    </main>
  );
}
