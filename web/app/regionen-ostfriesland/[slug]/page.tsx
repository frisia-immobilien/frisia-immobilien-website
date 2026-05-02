import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import { buildPageMetadata } from "@/lib/metadata";
import { formatLocationPhraseFromName, isIslandLocationName } from "@/lib/seo/locationDisplay";
import {
  INTENT_LABELS,
  parseLandingSlug,
  REGION_LANDING_EXAMPLES,
  SITE_URL,
  toTitleCase,
} from "@/lib/regions";
import {
  PHONE_DISPLAY,
  PHONE_HREF,
  createBreadcrumbListJsonLd,
  createFAQPageJsonLd,
  createServiceJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return REGION_LANDING_EXAMPLES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const parsed = parseLandingSlug(resolvedParams.slug);
  if (!parsed) return {};

  const location = toTitleCase(parsed.location);
  const locationPhrase = formatLocationPhraseFromName(location);
  const intent = INTENT_LABELS[parsed.intent];
  const title = `${intent} ${isIslandLocationName(location) ? locationPhrase : location}`;
  const description =
    parsed.intent === "immobilienmakler"
      ? `Immobilienmakler ${locationPhrase}: Frisia Immobilien begleitet Bewertung, Preisstrategie, Käuferprüfung und Verkauf mit regionaler Marktkenntnis.`
      : parsed.intent === "immobilienpreise"
        ? `Immobilienpreise ${locationPhrase}: aktuelle Markteinordnung, Preisentwicklung und Orientierung für Eigentümer mit Frisia Immobilien.`
        : parsed.intent === "haus-verkaufen"
          ? `Haus verkaufen ${locationPhrase}: strukturierte Bewertung, klare Preisstrategie und verlässliche Begleitung bis zum Notartermin.`
          : parsed.intent === "immobilienbewertung"
            ? `Immobilienbewertung ${locationPhrase}: realistische Preisspanne, regionale Vergleichsdaten und persönliche Einordnung durch Frisia Immobilien.`
            : `Immobilien ${locationPhrase}: Marktüberblick, regionale Angebote und Suchauftrag für passende Häuser und Wohnungen.`;

  return buildPageMetadata({
    title,
    description,
    path: `/regionen-ostfriesland/${resolvedParams.slug}`,
    keywords: [
      `${intent.toLowerCase()} ${location.toLowerCase()}`,
      `immobilienmakler ${location.toLowerCase()}`,
      `immobilienbewertung ${location.toLowerCase()}`,
      `immobilie verkaufen ${location.toLowerCase()}`,
    ],
  });
}

export default async function RegionLandingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const parsed = parseLandingSlug(resolvedParams.slug);
  if (!parsed) {
    notFound();
  }

  const location = toTitleCase(parsed.location);
  const locationPhrase = formatLocationPhraseFromName(location);
  const intentLabel = INTENT_LABELS[parsed.intent];
  const h1 = `${intentLabel} ${isIslandLocationName(location) ? locationPhrase : location}`;

  const path = `/regionen-ostfriesland/${resolvedParams.slug}`;

  const breadcrumbJsonLd = createBreadcrumbListJsonLd(path, [
    { name: "Startseite", item: SITE_URL },
    { name: "Regionen Ostfriesland", item: `${SITE_URL}/regionen-ostfriesland` },
    { name: h1, item: `${SITE_URL}${path}` },
  ]);

  const faqItems = [
    {
      question: `Wie unterstützt Frisia Immobilien Eigentümer ${locationPhrase}?`,
      answer: `Mit strukturierter Bewertung, klarer Preisstrategie und persönlicher Begleitung bis zum Notartermin im regionalen Markt von ${location}.`,
    },
    {
      question: `Ist die Erstberatung ${locationPhrase} unverbindlich?`,
      answer: "Ja, die erste Einschätzung ist unverbindlich und dient als klare Entscheidungsgrundlage für Eigentümer.",
    },
    {
      question: `Welche regionalen Faktoren sind ${locationPhrase} wichtig?`,
      answer: "Lage, Zustand, Baujahr, energetischer Standard und aktuelle Vergleichsobjekte aus der Region sind entscheidend.",
    },
  ];

  const webPageJsonLd = createWebPageJsonLd({
    path,
    name: h1,
    description: `Regionale Landingpage für Eigentümer ${locationPhrase} mit Fokus auf Bewertung, Preisstrategie und Immobilienverkauf.`,
  });

  const serviceJsonLd = createServiceJsonLd({
    path,
    name: h1,
    serviceType: intentLabel,
    description: `Frisia Immobilien begleitet Eigentümer ${locationPhrase} mit strukturierter Markteinordnung, Vermarktung und persönlicher Begleitung.`,
    areaServed: [location, "Aurich", "Ostfriesland", "Emden", "Leer", "Wittmund", "Norden"],
  });

  const faqJsonLd = createFAQPageJsonLd(path, faqItems);

  return (
    <main className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={faqJsonLd} />

      <MobileHeroSection
        eyebrow="Regionale Landingpage"
        title={h1}
        description={`Frisia Immobilien begleitet Eigentümer ${locationPhrase} mit marktgerechter Einordnung, strukturierter Vermarktung und persönlicher Verantwortung.`}
        imageSrc="/images/hero/haus-verkaufen-aurich.webp"
        imageAlt={`Immobilienmarkt ${location} - Frisia Immobilien`}
        imagePosition="58% center"
        primaryCta={{ href: "/immobilienbewertung-aurich", label: "Immobilie bewerten lassen" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Kostenfrei", "Regional", "Persönlich"]}
      />

      <section className="mx-auto hidden w-full max-w-[1240px] gap-10 px-4 py-16 sm:px-6 md:grid md:grid-cols-12 md:items-center md:py-20">
        <div className="md:col-span-7">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
            Regionale Landingpage
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
            {h1}
          </h1>
          <HeroDivider />
          <p className="mt-6 max-w-3xl text-lg leading-[1.7] text-[color:var(--color-graphite)]">
            Frisia Immobilien begleitet Eigentümer {locationPhrase} mit marktgerechter Einordnung, strukturierter
            Vermarktung und persönlicher Verantwortung. So entsteht ein ruhiger und verlässlicher Immobilienverkauf.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/immobilienbewertung-aurich" className="rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white">
              Immobilie kostenlos bewerten
            </Link>
            <a href="tel:+4949419867700" className="rounded-xl border border-[color:var(--color-brass)]/35 px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)]">
              04941 986770-0
            </a>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="overflow-hidden rounded-3xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)]">
            <Image
              src="/images/hero/haus-verkaufen-aurich.webp"
              alt={`Immobilienmarkt ${location} – Frisia Immobilien`}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
            Markt- und Preislage {locationPhrase}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-2xl font-semibold text-[color:var(--color-navy)]">Relevante Marktfaktoren</h3>
              <p className="mt-3 text-base leading-[1.75] text-[color:var(--color-graphite)]">
                Baujahr, Zustand, Lagequalität und Grundstücksgröße wirken sich {locationPhrase} unmittelbar auf Nachfrage
                und Verkaufsgeschwindigkeit aus.
              </p>
            </article>
            <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-2xl font-semibold text-[color:var(--color-navy)]">Regionale Vergleichsdaten</h3>
              <p className="mt-3 text-base leading-[1.75] text-[color:var(--color-graphite)]">
                Frisia Immobilien nutzt aktuelle Vergleichsobjekte aus Aurich, Emden, Leer, Wittmund und Norden für
                eine belastbare Preisstrategie.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
          FAQ zu {h1}
        </h2>
        <div className="mt-6 space-y-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-xl font-semibold leading-[1.4] text-[color:var(--color-navy)]">{item.question}</h3>
              <p className="mt-2 text-base leading-[1.75] text-[color:var(--color-graphite)]">{item.answer}</p>
            </article>
          ))}
        </div>

        <aside className="mt-8 rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-6">
          <h4 className="text-lg font-semibold text-[color:var(--color-navy)]">Interne Verlinkung</h4>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-graphite)]">
            <li><Link href="/immobilienbewertung-aurich" className="underline underline-offset-4">Immobilienbewertung Aurich</Link></li>
            <li><Link href="/haus-verkaufen-aurich" className="underline underline-offset-4">Haus verkaufen Aurich</Link></li>
            <li><Link href="/immobilienmakler-aurich" className="underline underline-offset-4">Immobilienmakler Aurich</Link></li>
            <li><Link href="/regionen-ostfriesland" className="underline underline-offset-4">Regionen Ostfriesland</Link></li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
