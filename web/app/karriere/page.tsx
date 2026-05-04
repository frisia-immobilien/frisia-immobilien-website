import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import KontaktForm from "@/components/contact/KontaktForm.client";
import JsonLd from "@/components/seo/JsonLd";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createFAQPageJsonLd, createJobPostingJsonLd, createWebPageJsonLd } from "@/lib/site";

const heroImage = "/images/karriere/karriere-hero-frisia.webp";
const brokerCareerImage = "/images/karriere/immobilienmakler-beratung-unterlagen.png";
const traineeCareerImage = "/images/karriere/ausbildung-begleitung-unterlagen.png";

export const metadata: Metadata = buildPageMetadata({
  title: "Karriere bei Frisia Immobilien",
  description:
    "Immobilienmakler werden oder Ausbildung starten bei Frisia Immobilien in Aurich und Ostfriesland: klare Prozesse, Verantwortung und strukturierte Arbeit.",
  path: "/karriere",
  imagePath: heroImage,
  keywords: [
    "karriere frisia immobilien",
    "immobilienmakler werden aurich",
    "ausbildung immobilienkaufmann aurich",
    "immobilien jobs ostfriesland",
  ],
});

const faq = [
  {
    question: "Kann ich als Quereinsteiger Makler werden?",
    answer:
      "Ja, wenn du bereit bist, strukturiert zu arbeiten und den Markt wirklich zu verstehen. Wichtig ist weniger der Lebenslauf als die Arbeitsweise.",
  },
  {
    question: "Wie läuft die Ausbildung ab?",
    answer:
      "Du lernst Schritt für Schritt alle Bereiche kennen - von der Bewertung über die Vermarktung bis zum Abschluss. Dabei bist du nah an echten Prozessen.",
  },
  {
    question: "Arbeite ich als Makler selbstständig?",
    answer:
      "Du arbeitest eigenverantwortlich, aber innerhalb klarer Strukturen und Prozesse.",
  },
  {
    question: "Was unterscheidet Frisia Immobilien von anderen Maklerbüros?",
    answer:
      "Die klare Struktur. Jeder Prozess ist nachvollziehbar aufgebaut. Entscheidungen basieren auf Daten und Erfahrung, nicht auf Zufall.",
  },
  {
    question: "Wie starte ich am besten?",
    answer:
      "Mit einer kurzen Bewerbung oder einem ersten Gespräch. Danach lässt sich klären, ob der Einstieg als Immobilienmakler, Ausbildung oder ein anderer Weg sinnvoll ist.",
  },
];

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/karriere", [
  { name: "Startseite", item: SITE_URL },
  { name: "Karriere", item: `${SITE_URL}/karriere` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/karriere",
  name: "Karriere bei Frisia Immobilien",
  description:
    "Zentrale Employer-Branding- und Bewerbungsseite fuer Immobilienmakler und Auszubildende bei Frisia Immobilien.",
  imagePath: heroImage,
});

const faqJsonLd = createFAQPageJsonLd("/karriere", faq);
const brokerJobJsonLd = createJobPostingJsonLd({
  path: "/karriere",
  title: "Immobilienmakler bei Frisia Immobilien",
  employmentType: ["FULL_TIME", "CONTRACTOR"],
  description:
    "Frisia Immobilien sucht strukturierte Immobilienmakler für Aurich und Ostfriesland. Im Mittelpunkt stehen klare Prozesse, fundierte Bewertung, regionale Marktkenntnis und Verantwortung im Verkaufsprozess.",
});
const traineeJobJsonLd = createJobPostingJsonLd({
  path: "/karriere",
  title: "Ausbildung Immobilienkaufmann oder Immobilienkauffrau",
  employmentType: "FULL_TIME",
  description:
    "Frisia Immobilien bietet eine Ausbildung im Immobilienbereich in Aurich. Du lernst Bewertung, Vermarktung, strukturierte Abläufe und die praktische Begleitung von Immobilienverkäufen.",
});

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-5xl">
      {eyebrow ? (
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.35rem] leading-tight text-[color:var(--color-navy)] md:text-[3.3rem]">
        {title}
      </h2>
      {children ? <div className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">{children}</div> : null}
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-lg border border-[color:var(--color-brass)]/40 border-l-4 border-l-[color:var(--color-brass)] bg-white px-5 py-5 shadow-[0_18px_46px_-38px_rgba(27,48,64,0.5)]">
      <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">{title}</h3>
      <p className="mt-2 text-base leading-7 text-[color:var(--color-graphite)]">{text}</p>
    </article>
  );
}

function iconAssetForCareerItem(item: string) {
  const text = item.toLowerCase();
  if (text.includes("freier makler")) return "/images/immobilienmakler-aurich/person.webp";
  if (text.includes("eigenverantwortlich")) return "/images/prozess/zustaendigkeit.webp";
  if (text.includes("regeln") || text.includes("zuständigkeiten")) return "/images/prozess/geordneter_ablauf.webp";
  if (text.includes("immobilien")) return "/images/immobilienmakler-aurich/haus.webp";
  if (text.includes("zuverlässige") || text.includes("saubere")) return "/images/maklerhaus/icons/serioes.webp";
  if (text.includes("lernen")) return "/images/prozess/schritt_03.webp";
  if (text.includes("kommunikation")) return "/images/maklerhaus/icons/persoenliche-ansprechpartner.webp";
  if (text.includes("zu tun")) return "/images/prozess/geordneter_ablauf.webp";
  if (text.includes("warum")) return "/images/immobilienmakler-aurich/zielscheibe.webp";
  if (text.includes("nächste")) return "/images/prozess/schritt_07.webp";
  return "/images/prozess/checkbox.webp";
}

function CareerListIcon({ item }: { item: string }) {
  const iconSrc = iconAssetForCareerItem(item);

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)]/85 ring-1 ring-[color:var(--color-brass)]/12">
      <Image
        src={iconSrc}
        alt=""
        width={34}
        height={34}
        sizes="34px"
        aria-hidden="true"
        className="h-8 w-8 object-contain"
      />
    </span>
  );
}

function PlainList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex min-h-20 items-center gap-4 rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)]">
          <CareerListIcon item={item} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function KarrierePage() {
  return (
    <main id="main-content" className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={brokerJobJsonLd} />
      <JsonLd data={traineeJobJsonLd} />

      <MobileHeroSection
        eyebrow="Karriere bei Frisia Immobilien"
        title="Immobilienmakler werden oder Ausbildung starten"
        description="Struktur, klare Abläufe und ein Markt, den du wirklich verstehst - für Makler und Auszubildende in Aurich."
        imageSrc={heroImage}
        imageAlt="Frisia Immobilien Team und Arbeitsumfeld in Aurich"
        imagePosition="58% center"
        primaryCta={{ href: "#initiativbewerbung", label: "Gespräch starten" }}
        secondaryCta={{ href: "#ausbildung", label: "Ausbildung ansehen" }}
        trustItems={["Aurich", "Ausbildung", "Struktur"]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.74)_26%,rgba(255,255,255,0.34)_46%,rgba(255,255,255,0.06)_68%,rgba(255,255,255,0)_90%)]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-[56rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Karriere bei Frisia Immobilien
            </p>
            <h1 className="mt-5 max-w-[18ch] break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.2rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              Immobilienmakler werden oder Ausbildung starten bei Frisia Immobilien
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-4xl text-[1.12rem] leading-[1.7] text-[color:var(--color-navy)] md:text-[1.35rem]">
              Struktur, klare Abläufe und ein Markt, den du wirklich verstehst - für Makler und Auszubildende in Aurich und ganz Ostfriesland.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#initiativbewerbung" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Gespräch starten
              </Link>
              <Link href="#ausbildung" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/82 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brass)]">
                Ausbildung ansehen
              </Link>
            </div>
            <p className="mt-6 max-w-3xl text-sm font-semibold leading-7 text-[color:var(--color-navy)]">
              Frisia Immobilien · Aurich · Ostfriesland · Struktur statt Zufall
            </p>
            <p className="mt-6 max-w-4xl border-l-4 border-[color:var(--color-brass)] bg-white/78 px-5 py-4 text-base font-semibold leading-[1.75] text-[color:var(--color-navy)]">
              Wir suchen keine &quot;Mitarbeiter&quot;. Wir suchen Menschen, die Immobilien strukturiert verstehen, sauber arbeiten und Verantwortung übernehmen.
            </p>
          </div>
        </div>
      </section>

      <AurichHeroLinks />

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <SectionHeading title="Wie wir arbeiten - und warum das entscheidend ist">
            <p>
              Frisia Immobilien ist kein klassisches Maklerbüro mit Zufallsprinzip. Jeder Verkauf folgt einer klaren Struktur - von der Bewertung bis zum Abschluss.
            </p>
          </SectionHeading>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureCard title="Klare Prozesse" text="Wir arbeiten mit nachvollziehbaren Abläufen statt Tagesgeschäft im Chaos." />
            <FeatureCard title="Nachvollziehbare Entscheidungen" text="Entscheidungen entstehen aus Daten, Erfahrung und sauberer Einordnung - nicht aus Bauchgefühl." />
            <FeatureCard title="Ruhige Führung" text="Kunden und Team brauchen Klarheit. Druck ersetzt keine gute Vorbereitung." />
          </div>
          <p className="mt-7 text-lg font-semibold leading-8 text-[color:var(--color-navy)]">
            Wer bei uns arbeitet, arbeitet nicht &quot;irgendwie&quot; - sondern mit System.
          </p>
        </div>
      </section>

      <section id="immobilienmakler-werden" className="bg-[color:var(--color-section)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
            <figure className="overflow-hidden rounded-xl border border-[color:var(--color-brass)]/35 bg-white shadow-[0_22px_70px_-52px_rgba(27,48,64,0.55)]">
              <div className="relative aspect-[4/5] min-h-[420px] sm:aspect-[3/4] lg:h-full lg:min-h-[820px] lg:aspect-auto">
                <Image
                  src={brokerCareerImage}
                  alt="Erfahrener Immobilienmakler berät mit Exposé und Grundrissunterlagen"
                  fill
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="object-cover"
                  style={{ objectPosition: "center center" }}
                />
              </div>
            </figure>

            <div className="flex flex-col">
              <SectionHeading eyebrow="Für Immobilienmakler" title="Immobilienmakler werden bei Frisia Immobilien">
                <p>
                  Du möchtest Immobilien professionell vermitteln und suchst ein Umfeld mit klarer Marke, regionaler Nachfrage und sauberer Struktur.
                </p>
              </SectionHeading>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <FeatureCard title="Planbarer Vertrieb" text="Du arbeitest nicht mit Zufall, sondern mit klaren Abläufen, sauberer Vorbereitung und echter regionaler Nachfrage." />
                <FeatureCard title="Eigenständig arbeiten" text="Du bleibst unternehmerisch frei, arbeitest aber nicht ohne System, Marke und Rückhalt." />
                <FeatureCard title="Fokus auf Abschlüsse" text="Wir konzentrieren uns auf Eigentümer, Bewertung, Vermarktung und sauber geführte Verkaufsprozesse." />
                <FeatureCard title="Klare Zuständigkeiten" text="Du weißt, was zu tun ist, wer wofür verantwortlich ist und wie ein Verkauf strukturiert geführt wird." />
              </div>
              <div className="mt-8 rounded-xl border border-[color:var(--color-brass)]/35 bg-white p-6">
                <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Arbeitsmodell</h3>
                <PlainList
                  items={[
                    "möglich als freier Makler",
                    "eigenverantwortlich, aber nicht allein",
                    "klare Regeln und klare Zuständigkeiten",
                  ]}
                />
              </div>
              <p className="mt-7 text-lg font-semibold leading-8 text-[color:var(--color-navy)]">
                Wenn du Immobilien nicht nur vermitteln, sondern Eigentümer strukturiert beraten und Verkäufe sauber führen willst, passt das zu dir.
              </p>
              <Link href="#initiativbewerbung" className="mt-7 inline-flex min-h-14 w-fit items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Jetzt als Immobilienmakler bewerben
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="ausbildung" className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
            <div className="flex flex-col">
              <SectionHeading eyebrow="Ausbildung" title="Ausbildung bei Frisia Immobilien">
                <p>
                  Du suchst einen Ausbildungsplatz im Immobilienbereich und möchtest von Anfang an praktisch lernen, wie Bewertung, Vermarktung, Kundenkontakt und Verkaufsprozesse wirklich funktionieren.
                </p>
              </SectionHeading>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <FeatureCard title="Grundlagen verstehen" text="Du lernst Immobilien, Märkte, Bewertung und Verkauf Schritt für Schritt kennen." />
                <FeatureCard title="Praktisch mitarbeiten" text="Du bist nah am echten Geschäft und lernst nicht nur aus der Theorie." />
                <FeatureCard title="Klare Begleitung" text="Du bekommst Orientierung, feste Ansprechpartner und einen verständlichen Einstieg." />
                <FeatureCard title="Verantwortung lernen" text="Du wächst langsam in echte Aufgaben hinein - ohne allein gelassen zu werden." />
              </div>
              <div className="mt-8 rounded-xl border border-[color:var(--color-brass)]/35 bg-[color:var(--color-section)] p-6">
                <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Voraussetzungen</h3>
                <PlainList
                  items={[
                    "Interesse an Immobilien",
                    "saubere, zuverlässige Arbeitsweise",
                    "Bereitschaft zu lernen",
                    "klare Kommunikation",
                  ]}
                />
              </div>
              <p className="mt-7 text-lg font-semibold leading-8 text-[color:var(--color-navy)]">
                Die Ausbildung ist kein &quot;Durchlaufen&quot;, sondern ein echter Einstieg in die Immobilienpraxis mit klarer Begleitung.
              </p>
              <Link href="#initiativbewerbung" className="mt-7 inline-flex min-h-14 w-fit items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Jetzt auf Ausbildungsplatz bewerben
              </Link>
            </div>

            <figure className="overflow-hidden rounded-xl border border-[color:var(--color-brass)]/35 bg-white shadow-[0_22px_70px_-52px_rgba(27,48,64,0.55)]">
              <div className="relative aspect-[4/5] min-h-[420px] sm:aspect-[3/4] lg:h-full lg:min-h-[820px] lg:aspect-auto">
                <Image
                  src={traineeCareerImage}
                  alt="Auszubildende lernt mit Begleitung anhand von Immobilienunterlagen"
                  fill
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="object-cover"
                  style={{ objectPosition: "center center" }}
                />
              </div>
            </figure>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <SectionHeading title="Was du bei uns nicht findest" />
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {[
              'kein "schnell reich werden"-Vertrieb',
              "keine leeren Versprechen",
              "kein Chaos im Tagesgeschäft",
              "kein Arbeiten ohne klare Struktur",
            ].map((item) => (
              <div key={item} className="rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)]">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-7 text-lg font-semibold leading-8 text-[color:var(--color-navy)]">
            Wir suchen keine Blender - sondern saubere Arbeit.
          </p>
        </div>
      </section>

      <section id="initiativbewerbung" className="bg-[color:var(--color-navy)] py-12 text-white md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.35rem] leading-tight md:text-[3.3rem]">
            Initiativbewerbung bei Frisia Immobilien
          </h2>
          <div className="mt-6 max-w-4xl space-y-5 text-base leading-[1.8] text-white/86 md:text-lg">
            <p>
              Du bist dir noch nicht sicher, ob der Einstieg als Immobilienmakler oder als Auszubildender besser passt - möchtest dich aber grundsätzlich bei Frisia Immobilien bewerben?
            </p>
            <p>Dann sprich mit uns.</p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {["welche Rolle zu dir passt", "wie ein Einstieg aussehen kann", "ob eine Zusammenarbeit sinnvoll ist"].map((item) => (
              <div key={item} className="rounded-lg border border-white/18 bg-white/8 px-5 py-4 font-semibold text-white">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <KontaktForm
              id="initiativbewerbung-formular"
              heading="Kontaktformular Initiativbewerbung"
              intro="Sende uns kurz, ob dich der Einstieg als Immobilienmakler, eine Ausbildung oder beides interessiert. Ein Lebenslauf ist für den ersten Kontakt nicht zwingend nötig."
              messageLabel="Wofür möchtest du dich bewerben? *"
              messagePlaceholder="z.B.: Ich interessiere mich für eine Ausbildung bei Frisia Immobilien. Mich interessiert besonders der Kontakt mit Kunden und die Bewertung von Immobilien."
              submitLabel="Initiativbewerbung senden"
              successTitle="Initiativbewerbung eingegangen"
              successMessage="Vielen Dank. Deine Initiativbewerbung ist bei uns eingegangen. Wir melden uns persönlich bei dir."
              trustItems={["Persönliche Rückmeldung", "Vertrauliche Prüfung", "Direkt bei Frisia Immobilien"]}
              context="Initiativbewerbung Website"
            />
          </div>
          <p className="mt-5 text-sm leading-7 text-white/78">Ein kurzes Gespräch reicht. Danach weißt du, ob es passt.</p>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 text-center sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.35rem] leading-tight text-[color:var(--color-navy)] md:text-[3.3rem]">
            Arbeiten bei Frisia Immobilien
          </h2>
          <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
            Wenn du strukturiert arbeiten möchtest und Immobilien nicht nur &quot;vermitteln&quot;, sondern wirklich verstehen willst, ist Frisia Immobilien der richtige Rahmen.
          </p>
          <Link href="#initiativbewerbung" className="mt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
            Gespräch starten
          </Link>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.35rem] leading-tight text-[color:var(--color-navy)] md:text-[3.3rem]">
            Häufige Fragen zur Karriere bei Frisia Immobilien
          </h2>
          <div className="mt-6 divide-y divide-[color:var(--color-brass)]/20 rounded-xl border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_70px_-64px_rgba(27,48,64,0.45)]">
            {faq.map((item) => (
              <details key={item.question} className="group border-t border-[color:var(--color-brass)]/20 first:border-t-0">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 marker:hidden sm:px-6">
                  <h3 className="text-base font-semibold leading-snug text-[color:var(--color-navy)] sm:text-lg">{item.question}</h3>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-xl leading-none text-[color:var(--color-navy)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-6 pr-14 sm:px-6 sm:pr-20">
                  <p className="text-base leading-[1.75] text-[color:var(--color-graphite)]">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
