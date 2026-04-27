import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createFAQPageJsonLd, createWebPageJsonLd } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Immobilienpreise in Ostfriesland",
  description:
    "Immobilienpreise in Ostfriesland: aktuelle Quadratmeterpreise, Preisentwicklungen und lokale Marktberichte für Städte, Gemeinden und Ortsteile.",
  path: "/immobilienpreise",
  keywords: [
    "immobilienpreise ostfriesland",
    "immobilienpreise aurich",
    "immobilienpreise emden",
    "immobilienpreise leer",
    "immobilienpreise norden",
    "immobilienpreise wittmund",
  ],
});

type RegionLink = readonly [string, string];

const regions: readonly { title: string; links: readonly RegionLink[] }[] = [
  {
    title: "Region Aurich",
    links: [
      ["Immobilienpreise Aurich", "/immobilienpreise-aurich"],
      ["Immobilienpreise Extum", "/immobilienpreise-extum"],
      ["Immobilienpreise Walle", "/immobilienpreise-walle"],
      ["Immobilienpreise Sandhorst", "/immobilienpreise-sandhorst"],
      ["Immobilienpreise Egels", "/immobilienpreise-egels"],
      ["Immobilienpreise Wallinghausen", "/immobilienpreise-wallinghausen"],
    ],
  },
  {
    title: "Region Emden",
    links: [
      ["Immobilienpreise Emden", "/immobilienpreise-emden"],
      ["Immobilienpreise Wolthusen", "/immobilienpreise-wolthusen"],
      ["Immobilienpreise Borssum", "/immobilienpreise-borssum"],
      ["Immobilienpreise Barenburg", "/immobilienpreise-barenburg"],
      ["Immobilienpreise Larrelt", "/immobilienpreise-larrelt"],
    ],
  },
  {
    title: "Region Norden",
    links: [
      ["Immobilienpreise Norden", "/immobilienpreise-norden"],
      ["Immobilienpreise Norddeich", "/immobilienpreise-nordeich"],
      ["Immobilienpreise Süderneuland", "/immobilienpreise-suederneuland"],
      ["Immobilienpreise Leybuchtpolder", "/immobilienpreise-leybuchtpolder"],
    ],
  },
  {
    title: "Region Leer",
    links: [
      ["Immobilienpreise Leer", "/immobilienpreise-leer"],
      ["Immobilienpreise Loga", "/immobilienpreise-loga"],
      ["Immobilienpreise Bingum", "/immobilienpreise-bingum"],
      ["Immobilienpreise Heisfelde", "/immobilienpreise-heisfelde"],
    ],
  },
  {
    title: "Region Wittmund",
    links: [
      ["Immobilienpreise Wittmund", "/immobilienpreise-wittmund"],
      ["Immobilienpreise Esens", "/immobilienpreise-esens"],
      ["Immobilienpreise Carolinensiel", "/immobilienpreise-carolinensiel"],
      ["Immobilienpreise Friedeburg", "/immobilienpreise-friedeburg"],
    ],
  },
  {
    title: "Region Gesamt",
    links: [
      ["Immobilienpreise Ostfriesland", "/immobilienpreise-ostfriesland"],
      ["Immobilienpreise Aurich", "/immobilienpreise-aurich"],
      ["Immobilienpreise Emden", "/immobilienpreise-emden"],
      ["Immobilienpreise Leer", "/immobilienpreise-leer"],
      ["Immobilienpreise Norden", "/immobilienpreise-norden"],
      ["Immobilienpreise Wittmund", "/immobilienpreise-wittmund"],
    ],
  },
] as const;

const faq = [
  {
    question: "Wo finde ich die Immobilienpreise für meinen Ort?",
    answer:
      "Über die oben aufgeführten Regionen gelangst du direkt zu deiner lokalen Seite. Dort findest du aktuelle Preise, Marktdaten und eine Einordnung für Eigentümer.",
  },
  {
    question: "Sind die Immobilienpreise überall gleich?",
    answer:
      "Nein. Die Preise unterscheiden sich je nach Stadt, Ortsteil und Lage teilweise deutlich. Deshalb ist die lokale Betrachtung entscheidend.",
  },
  {
    question: "Reichen Durchschnittswerte für die Bewertung aus?",
    answer:
      "Nein. Durchschnittswerte geben eine Orientierung, ersetzen aber keine individuelle Bewertung deiner Immobilie.",
  },
  {
    question: "Was zeigt mir die Preisentwicklung?",
    answer:
      "Die Preisentwicklung zeigt, wie sich der Markt in den letzten Jahren verändert hat. Für deinen Verkauf ist jedoch der aktuelle Markt entscheidend.",
  },
  {
    question: "Wie kann ich den Wert meiner Immobilie genau bestimmen?",
    answer:
      "Über eine individuelle Bewertung. Dabei werden Lage, Zustand, Grundstück, Nachfrage und aktuelle Vergleichsobjekte berücksichtigt.",
  },
];

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/immobilienpreise", [
  { name: "Startseite", item: SITE_URL },
  { name: "Immobilienpreise", item: `${SITE_URL}/immobilienpreise` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/immobilienpreise",
  name: "Immobilienpreise in Ostfriesland",
  description:
    "Zentraler Hub für lokale Immobilienpreise, Preisentwicklungen und Marktberichte in Ostfriesland.",
  type: "CollectionPage",
});

const faqJsonLd = createFAQPageJsonLd("/immobilienpreise", faq);

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${SITE_URL}/immobilienpreise#local-price-pages`,
  itemListElement: regions.flatMap((region) => region.links).map(([name, href], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    url: `${SITE_URL}${href}`,
  })),
};

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white px-5 py-5 shadow-[0_18px_44px_-38px_rgba(27,48,64,0.48)]">
      <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">{title}</h3>
      <p className="mt-2 text-base leading-7 text-[color:var(--color-graphite)]">{text}</p>
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  const icons = [
    <path key="tag" d="M5 11V5h6l8 8-6 6-8-8zM8.5 8.5h.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
    <path key="chart" d="M5 19h14M7 16V9M12 16V5M17 16v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
    <path key="pin" d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11zM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  ];

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item, index) => (
        <li key={item} className="flex items-center gap-4 rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-[color:var(--color-brackish)]">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              {icons[index % icons.length]}
            </svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ImmobilienpreiseHubPage() {
  return (
    <main id="main-content" className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={itemListJsonLd} />

      <section className="relative isolate overflow-hidden bg-[color:var(--color-section)]">
        <Image
          src="/images/immobilienbewertung/hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right opacity-75"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_34%,rgba(255,255,255,0.58)_58%,rgba(255,255,255,0.12)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-12">
          <div className="max-w-[50rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Immobilienpreise Ostfriesland
            </p>
            <h1 className="mt-5 max-w-[13ch] break-words font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)]">
              Immobilienpreise in Ostfriesland
            </h1>
            <p className="mt-7 max-w-3xl text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:text-[1.35rem]">
              Aktuelle Quadratmeterpreise, Preisentwicklungen und klare Einordnung für Städte, Gemeinden und Ortsteile.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#orte-auswaehlen" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Ort auswählen
              </Link>
              <Link href="/immobilienbewertung-aurich" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/75 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
                Immobilie einordnen
              </Link>
            </div>
            <p className="mt-6 max-w-3xl text-sm font-semibold leading-7 text-[color:var(--color-navy)]">
              Regionale Marktdaten · Immobilienbewertung · Frisia Immobilien in Aurich und ganz Ostfriesland
            </p>
          </div>
          <div className="rounded-xl border border-[color:var(--color-brass)]/25 bg-white/92 p-6 shadow-[0_28px_90px_-58px_rgba(27,48,64,0.65)] backdrop-blur md:p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
              Preise unterscheiden sich je nach Ort deutlich.
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Entscheidend ist, wie sich dein konkreter Standort aktuell entwickelt.
            </p>
          </div>
        </div>
      </section>

      <section id="orte-auswaehlen" className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Immobilienpreise nach Regionen
          </h2>
          <p className="mt-6 max-w-4xl text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
            Wähle deinen Ort und erhalte eine klare Einordnung: aktuelle Preise, Marktdaten, Preisentwicklung und eine realistische Einschätzung für Eigentümer.
          </p>
          <p className="mt-4 font-semibold text-[color:var(--color-navy)]">
            Jede Seite zeigt dir den lokalen Markt - und führt dich zur Bewertung deiner Immobilie.
          </p>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {regions.map((region) => (
              <article key={region.title} className="rounded-lg border border-[color:var(--color-brass)]/35 bg-[color:var(--color-section)] p-5">
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl leading-tight text-[color:var(--color-navy)]">
                  {region.title}
                </h3>
                <div className="mt-5 grid gap-3">
                  {region.links.map(([label, href]) => (
                    <Link
                      key={`${region.title}-${href}`}
                      href={href}
                      className="rounded-lg border border-[color:var(--color-brass)]/45 bg-white px-5 py-4 text-base font-semibold text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brass)]"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-5xl text-base leading-[1.8] text-[color:var(--color-graphite)]">
            Jeder Link führt auf eine lokale Seite mit Preisübersicht, Marktdaten, Preisentwicklung mit Charts und Tabelle sowie Bewertung.
          </p>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Immobilienpreise in Ostfriesland richtig einordnen
          </h2>
          <div className="mt-6 space-y-5 text-base leading-[1.78] text-[color:var(--color-graphite)] md:text-lg">
            <p>
              Die Immobilienpreise in Ostfriesland unterscheiden sich je nach Lage, Ortsteil und Nachfrage teilweise deutlich. Während zentrale Bereiche in Aurich, Emden oder Leer oft stabil nachgefragt werden, reagieren kleinere Orte sensibler auf Angebot und Preisstrategie.
            </p>
            <BulletList
              items={[
                "Angebotspreise sind nicht gleich Verkaufspreise",
                "Quadratmeterpreise sind Durchschnittswerte",
                "Lage, Zustand und Nachfrage bestimmen den tatsächlichen Wert",
              ]}
            />
            <p className="font-semibold text-[color:var(--color-navy)]">
              Die lokalen Seiten geben dir Orientierung. Die Bewertung zeigt deinen realistischen Preis.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-navy)] py-12 text-white md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight md:text-[2.85rem]">
            Deine Immobilie im aktuellen Markt einordnen
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Wenn du wissen möchtest, welchen Preis deine Immobilie aktuell erzielen kann, erstellen wir für dich eine klare Einschätzung - basierend auf lokalen Marktdaten und realen Verkäufen.
          </p>
          <Link href="/immobilienbewertung-aurich" className="mt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
            Immobilie einordnen
          </Link>
          <p className="mt-4 text-sm leading-7 text-white/78">Ein kurzer Einstieg reicht. Danach weißt du, was realistisch möglich ist.</p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Marktberichte und Immobilienpreise für Ostfriesland
          </h2>
          <div className="mt-6 space-y-5 text-base leading-[1.78] text-[color:var(--color-graphite)] md:text-lg">
            <p>
              Die Marktberichte von Frisia Immobilien zeigen aktuelle Entwicklungen für Städte, Gemeinden und Ortsteile in Ostfriesland. Grundlage sind Angebotsdaten, Marktdaten und regionale Erfahrung.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard title="Quadratmeterpreise" text="Haus- und Wohnungspreise werden lokal aufbereitet und verständlich eingeordnet." />
              <InfoCard title="Marktdaten" text="Vermarktungsdauer, Nachfrage und Datenbasis zeigen, wie aktiv ein Markt ist." />
              <InfoCard title="Preisentwicklung" text="Charts und Tabellen machen sichtbar, wie sich Preise über mehrere Jahre verändert haben." />
              <InfoCard title="Einordnung für Eigentümer" text="Die lokalen Daten führen zum nächsten Schritt: einer realistischen Bewertung." />
            </div>
            <p>
              Für eine fundierte Entscheidung reicht ein Durchschnittswert nicht aus. Entscheidend ist immer die individuelle Bewertung deiner Immobilie im aktuellen Marktumfeld.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Häufige Fragen zu Immobilienpreisen in Ostfriesland
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
