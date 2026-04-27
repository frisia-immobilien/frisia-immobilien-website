import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createFAQPageJsonLd, createJobPostingJsonLd, createWebPageJsonLd } from "@/lib/site";

const heroImage = "/images/karriere/karriere-hero-frisia.png";

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
      "Mit einem Gespräch. Danach lässt sich klären, ob Makler, Ausbildung oder ein anderer Einstieg für dich sinnvoll ist.",
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

function iconTypeForCareerItem(item: string) {
  const text = item.toLowerCase();
  if (text.includes("freier makler")) return "briefcase";
  if (text.includes("eigenverantwortlich")) return "compass";
  if (text.includes("regeln") || text.includes("zuständigkeiten")) return "checklist";
  if (text.includes("immobilien")) return "home";
  if (text.includes("zuverlässige") || text.includes("saubere")) return "shield";
  if (text.includes("lernen")) return "book";
  if (text.includes("kommunikation")) return "message";
  if (text.includes("zu tun")) return "clipboard";
  if (text.includes("warum")) return "target";
  if (text.includes("nächste")) return "arrow";
  return "check";
}

function CareerListIcon({ item }: { item: string }) {
  const iconType = iconTypeForCareerItem(item);
  const icon =
    iconType === "briefcase" ? (
      <>
        <path d="M9 8V6.8A1.8 1.8 0 0 1 10.8 5h2.4A1.8 1.8 0 0 1 15 6.8V8" />
        <path d="M5 9.5h14v8.2A1.3 1.3 0 0 1 17.7 19H6.3A1.3 1.3 0 0 1 5 17.7V9.5Z" />
        <path d="M5 12.2h14M11 12.2v1.4h2v-1.4" />
      </>
    ) : iconType === "compass" ? (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4 4-1.6Z" />
      </>
    ) : iconType === "checklist" ? (
      <>
        <path d="M8 6h9M8 12h9M8 18h9" />
        <path d="m4.5 6 1 1 1.8-2M4.5 12l1 1 1.8-2M4.5 18l1 1 1.8-2" />
      </>
    ) : iconType === "home" ? (
      <>
        <path d="m4.5 11 7.5-6 7.5 6" />
        <path d="M6.5 10.2V19h11v-8.8" />
        <path d="M10 19v-5h4v5" />
      </>
    ) : iconType === "shield" ? (
      <>
        <path d="M12 4.5 18 7v4.3c0 3.8-2.2 6.3-6 8.2-3.8-1.9-6-4.4-6-8.2V7l6-2.5Z" />
        <path d="m9.2 12.2 1.8 1.8 3.8-4" />
      </>
    ) : iconType === "book" ? (
      <>
        <path d="M6 5.5h5a2 2 0 0 1 2 2V19a2 2 0 0 0-2-2H6V5.5Z" />
        <path d="M13 7.5a2 2 0 0 1 2-2h3V17h-3a2 2 0 0 0-2 2" />
      </>
    ) : iconType === "message" ? (
      <>
        <path d="M5 6.5h14v9H9l-4 3v-12Z" />
        <path d="M8.5 10h7M8.5 13h4.5" />
      </>
    ) : iconType === "clipboard" ? (
      <>
        <path d="M9 5.5h6l.7 2H18v11H6v-11h2.3l.7-2Z" />
        <path d="M9 11h6M9 14.5h5" />
      </>
    ) : iconType === "target" ? (
      <>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 12h8" />
      </>
    ) : iconType === "arrow" ? (
      <>
        <path d="M5 12h13" />
        <path d="m13 7 5 5-5 5" />
      </>
    ) : (
      <path d="m6 12 4 4 8-8" />
    );

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-[color:var(--color-navy)]">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.9] [stroke-linecap:round] [stroke-linejoin:round]">
        {icon}
      </svg>
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

      <section className="relative isolate overflow-hidden bg-[color:var(--color-section)]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_33%,rgba(255,255,255,0.68)_57%,rgba(255,255,255,0.18)_100%)]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-[56rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Karriere bei Frisia Immobilien
            </p>
            <h1 className="mt-5 max-w-[14ch] break-words font-[family-name:var(--font-playfair)] text-[clamp(2.55rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)]">
              Immobilienmakler werden oder Ausbildung starten bei Frisia Immobilien
            </h1>
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
          <SectionHeading eyebrow="Für Immobilienmakler" title="Immobilienmakler werden bei Frisia Immobilien">
            <p>
              Du arbeitest bereits als Makler oder möchtest in den Vertrieb einsteigen - und suchst eine Struktur, die dich wirklich weiterbringt.
            </p>
          </SectionHeading>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <FeatureCard title="Strukturierter Vertrieb" text="Du arbeitest mit klaren Abläufen, nicht mit Zufalls-Leads." />
            <FeatureCard title="Klare Positionierung" text="Frisia Immobilien steht für Bewertung, Struktur und sichere Verkäufe - nicht für schnelle Abschlüsse." />
            <FeatureCard title="Unterstützung im Hintergrund" text="Systeme, Prozesse und Vermarktung sind vorbereitet, damit du dich auf das Wesentliche konzentrieren kannst." />
            <FeatureCard title="Regionale Marktkenntnis" text="Fokus auf Aurich und ganz Ostfriesland - kein beliebiger Markt." />
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
            Wenn du strukturiert arbeiten willst und nicht jeden Tag bei null anfangen möchtest, passt das zu dir.
          </p>
          <Link href="#initiativbewerbung" className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
            Gespräch als Makler führen
          </Link>
        </div>
      </section>

      <section id="ausbildung" className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <SectionHeading eyebrow="Ausbildung" title="Ausbildung bei Frisia Immobilien">
            <p>
              Du suchst eine Ausbildung im Immobilienbereich und möchtest von Anfang an verstehen, wie Immobilien wirklich funktionieren.
            </p>
          </SectionHeading>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <FeatureCard title="Grundlagen Immobilien" text="Bewertung, Markt, Verkauf - von Anfang an verständlich erklärt." />
            <FeatureCard title="Strukturierter Ablauf" text="Du lernst nicht nur Aufgaben, sondern den gesamten Prozess." />
            <FeatureCard title="Praxis statt Theorie" text="Du bist nah am echten Geschäft - nicht nur im Hintergrund." />
            <FeatureCard title="Verantwortung Schritt für Schritt" text="Du wirst langsam in echte Aufgaben geführt." />
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
            Die Ausbildung ist kein &quot;Durchlaufen&quot;, sondern ein echter Einstieg in die Immobilienpraxis.
          </p>
          <Link href="#initiativbewerbung" className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
            Ausbildung starten
          </Link>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-12 md:py-16">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
          <SectionHeading title="So arbeiten wir im Alltag">
            <p>
              Der Arbeitsalltag bei Frisia Immobilien ist bewusst ruhig, klar und strukturiert.
            </p>
          </SectionHeading>
          <div className="space-y-5">
            <PlainList items={["was zu tun ist", "warum du es tust", "wie der nächste Schritt aussieht"]} />
            <p className="text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
              Keine unnötigen Meetings. Keine unklaren Zuständigkeiten.
            </p>
            <p className="text-lg font-semibold leading-8 text-[color:var(--color-navy)]">
              Wir reduzieren Komplexität - für Kunden und im Team.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <SectionHeading title="Was du bei uns nicht findest" />
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {[
              'kein "schnell reich werden"-Vertrieb',
              "keine leeren Versprechen",
              "kein Chaos im Tagesgeschäft",
              "kein Arbeiten ohne klare Struktur",
            ].map((item) => (
              <div key={item} className="rounded-lg border border-[color:var(--color-brass)]/35 bg-[color:var(--color-section)] px-5 py-4 font-semibold text-[color:var(--color-navy)]">
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
              Du bist dir noch nicht sicher, ob Makler oder Ausbildung - möchtest aber grundsätzlich bei Frisia Immobilien arbeiten?
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
          <Link href="/kontakt" className="mt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
            Initiativ bewerben
          </Link>
          <p className="mt-4 text-sm leading-7 text-white/78">Ein kurzes Gespräch reicht. Danach weißt du, ob es passt.</p>
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
