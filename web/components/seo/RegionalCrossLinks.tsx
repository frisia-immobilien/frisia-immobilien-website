import Link from "next/link";
import type { ReactNode } from "react";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { formatLocationLabel } from "@/lib/seo/locationDisplay";
import type { SeoPageType } from "@/lib/types/leadgen";

type LinkItem = {
  href: string;
  label: string;
  description?: string;
};

type RegionalSource = {
  data?: LocationPageData;
  locationSlug?: string;
  locationLabel?: string;
  templatePrefix?: string;
  pageType?: SeoPageType;
  nearbyLocations?: Array<{ location_slug: string; location_label: string }>;
};

function locationName(source: RegionalSource) {
  return formatLocationLabel(source.data?.location.location_label ?? source.locationLabel ?? "Aurich");
}

function slug(source: RegionalSource) {
  return source.data?.location.location_slug ?? source.locationSlug ?? "aurich";
}

function templatePrefix(source: RegionalSource) {
  return source.data?.template.prefix ?? source.templatePrefix ?? "immobilienmakler";
}

function currentPageHref(source: RegionalSource) {
  return `/${templatePrefix(source)}-${slug(source)}`;
}

function pageType(source: RegionalSource): SeoPageType {
  if (source.data?.template.pageType) return source.data.template.pageType;
  if (source.pageType) return source.pageType;
  if (source.templatePrefix === "immobilienbewertung") return "immobilienbewertung";
  if (source.templatePrefix === "haus-verkaufen") return "haus_verkaufen";
  if (source.templatePrefix === "immobilienpreise") return "immobilienpreise";
  if (source.templatePrefix === "haus-kaufen") return "haus_kaufen";
  if (source.templatePrefix === "immobilien") return "immobilien";
  if (source.templatePrefix === "immobilie-verkaufen" || source.templatePrefix === "immobilien-verkaufen") {
    return "immobilie_verkaufen";
  }
  return "immobilienmakler";
}

function nearbyLocations(source: RegionalSource) {
  return source.data?.nearbyLocations ?? source.nearbyLocations ?? [];
}

function heroLinks(source: RegionalSource): LinkItem[] {
  const name = locationName(source);
  const locationSlug = slug(source);

  return [
    {
      href: `/immobilienbewertung-${locationSlug}`,
      label: `Immobilie bewerten ${name}`,
      description: "Wert realistisch einordnen",
    },
    {
      href: `/haus-verkaufen-${locationSlug}`,
      label: `Haus verkaufen ${name}`,
      description: "Verkauf strukturiert planen",
    },
    {
      href: `/immobilienpreise-${locationSlug}`,
      label: `Immobilienpreise ${name}`,
      description: "Marktdaten ansehen",
    },
    {
      href: `/immobilienmakler-${locationSlug}`,
      label: `Immobilienmakler ${name}`,
      description: "Maklerleistung verstehen",
    },
  ];
}

function bottomLinks(source: RegionalSource): LinkItem[] {
  const name = locationName(source);
  const locationSlug = slug(source);

  return [
    { href: `/immobilienbewertung-${locationSlug}`, label: `Immobilienbewertung ${name}` },
    { href: `/haus-verkaufen-${locationSlug}`, label: `Haus verkaufen ${name}` },
    { href: `/immobilienpreise-${locationSlug}`, label: `Immobilienpreise ${name}` },
    { href: `/immobilienmakler-${locationSlug}`, label: `Immobilienmakler ${name}` },
    { href: `/haus-kaufen-${locationSlug}`, label: `Haus kaufen ${name}` },
    { href: `/immobilien-${locationSlug}`, label: `Immobilien ${name}` },
  ];
}

function authorityText() {
  return (
    <Link
      href="/immobilienmakler-aurich"
      className="font-semibold underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]"
    >
      im regionalen Markt in Aurich und ganz Ostfriesland
    </Link>
  );
}

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]"
    >
      {children}
    </Link>
  );
}

export default function RegionalCrossLinks({
  data,
  locationSlug,
  locationLabel,
  templatePrefix: currentTemplatePrefix,
  nearbyLocations: providedNearbyLocations,
  placement,
}: {
  data?: LocationPageData;
  locationSlug?: string;
  locationLabel?: string;
  templatePrefix?: string;
  nearbyLocations?: Array<{ location_slug: string; location_label: string }>;
  placement: "hero" | "bottom";
}) {
  const source = {
    data,
    locationSlug,
    locationLabel,
    templatePrefix: currentTemplatePrefix,
    nearbyLocations: providedNearbyLocations,
  };
  const links = (placement === "hero" ? heroLinks(source) : bottomLinks(source)).filter(
    (link) => link.href !== currentPageHref(source),
  );
  const heroGridColumns = links.length <= 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const name = locationName(source);
  const nearby = nearbyLocations(source).slice(0, 8);
  const nearbyPrefix = templatePrefix(source);

  if (placement === "hero") {
    return (
      <section className="bg-white py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <div className={`grid gap-3 sm:grid-cols-2 ${heroGridColumns}`}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-[color:var(--color-brass)]/35 bg-[color:var(--color-section)] px-5 py-4 text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brass)] hover:bg-white"
              >
                <span className="block text-base font-semibold leading-snug">{link.label}</span>
                {link.description ? (
                  <span className="mt-1 block text-sm leading-6 text-[color:var(--color-graphite)]">
                    {link.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[color:var(--color-section)] py-14 md:py-16">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
        <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
          Weiterführende Seiten für {name}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-[color:var(--color-brass)]/45 bg-white px-6 py-5 text-lg font-semibold text-[color:var(--color-navy)] shadow-[0_18px_44px_-40px_rgba(27,48,64,0.45)] transition hover:border-[color:var(--color-brass)] hover:bg-white/80"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {nearby.length > 0 ? (
          <>
            <h3 className="mt-14 font-[family-name:var(--font-playfair)] text-[1.75rem] leading-tight text-[color:var(--color-navy)] md:text-[2.15rem]">
              Nachbarorte und Ortsteile
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {nearby.map((location) => (
                <Link
                  key={location.location_slug}
                  href={`/${nearbyPrefix}-${location.location_slug}`}
                  className="rounded-full border border-[color:var(--color-brass)]/45 bg-white px-5 py-2.5 text-base text-[color:var(--color-graphite)] transition hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-navy)] md:text-lg"
                >
                  {formatLocationLabel(location.location_label)}
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export function RegionalInlineLinks({
  data,
  locationSlug,
  locationLabel,
  templatePrefix: currentTemplatePrefix,
  pageType: currentPageType,
}: {
  data?: LocationPageData;
  locationSlug?: string;
  locationLabel?: string;
  templatePrefix?: string;
  pageType?: SeoPageType;
}) {
  const source = {
    data,
    locationSlug,
    locationLabel,
    templatePrefix: currentTemplatePrefix,
    pageType: currentPageType,
  };
  const name = locationName(source);
  const currentSlug = slug(source);
  const currentPage = pageType(source);

  return (
    <section className="bg-white py-12 md:py-14">
      <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
        <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-tight text-[color:var(--color-navy)] md:text-[2.45rem]">
          Einordnung für {name}
        </h2>
        <div className="mt-5 space-y-5 text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
          <p>
            Entscheidend ist nicht nur die einzelne Seite, sondern der Zusammenhang aus{" "}
            <InlineLink href={`/immobilienbewertung-${currentSlug}`}>Bewertung</InlineLink>,{" "}
            <InlineLink href={`/haus-verkaufen-${currentSlug}`}>Hausverkauf</InlineLink>,{" "}
            <InlineLink href={`/immobilienpreise-${currentSlug}`}>Preisen</InlineLink> und{" "}
            <InlineLink href={`/immobilienmakler-${currentSlug}`}>Maklerleistung</InlineLink>.
          </p>
          <p>
            Frisia Immobilien ordnet deine Immobilie {authorityText()} ein und verbindet lokale Marktdaten mit
            einem klar geführten Verkaufsprozess. Für den regionalen Überblick findest du zusätzlich den Bereich{" "}
            <InlineLink href="/immobilienpreise">Immobilienpreise Ostfriesland</InlineLink>.
          </p>
          {currentPage === "immobilie_verkaufen" ? (
            <p>
              Wenn es konkret um ein Haus geht, ist die Seite{" "}
              <InlineLink href={`/haus-verkaufen-${currentSlug}`}>Haus verkaufen {name}</InlineLink> der
              wichtigere nächste Schritt. Der Schwerpunkt{" "}
              <InlineLink href={`/haus-verkaufen-${currentSlug}`}>Hausverkauf {name}</InlineLink> geht stärker
              auf Preisstrategie, Käuferprüfung und Abschluss ein.
            </p>
          ) : (
            <p>
              Als untergeordnete Orientierung bleibt die Seite{" "}
              <InlineLink href={`/immobilien-verkaufen-${currentSlug}`}>Immobilien verkaufen {name}</InlineLink>{" "}
              verfügbar; für die konkrete Verkaufsentscheidung führt der Weg zurück zu Bewertung, Preisrahmen und
              Hausverkauf.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function RegionalLocalFAQ({
  data,
  locationSlug,
  locationLabel,
  templatePrefix: currentTemplatePrefix,
  pageType: currentPageType,
}: {
  data?: LocationPageData;
  locationSlug?: string;
  locationLabel?: string;
  templatePrefix?: string;
  pageType?: SeoPageType;
}) {
  const source = {
    data,
    locationSlug,
    locationLabel,
    templatePrefix: currentTemplatePrefix,
    pageType: currentPageType,
  };
  const name = locationName(source);
  const currentSlug = slug(source);
  const items = [
    {
      question: `Welche Seite ist für Eigentümer in ${name} der beste Einstieg?`,
      answer: (
        <>
          Wenn du noch keine klare Entscheidung getroffen hast, ist die{" "}
          <InlineLink href={`/immobilienbewertung-${currentSlug}`}>Immobilienbewertung {name}</InlineLink> ein
          sinnvoller Einstieg. Dort entsteht zuerst ein realistischer Preisrahmen. Danach lässt sich entscheiden,
          ob der Verkauf vorbereitet werden soll.
        </>
      ),
    },
    {
      question: `Warum sind Immobilienpreise in ${name} allein nicht genug?`,
      answer: (
        <>
          Die <InlineLink href={`/immobilienpreise-${currentSlug}`}>Immobilienpreise {name}</InlineLink> zeigen
          den Markt, aber nicht den exakten Wert einer einzelnen Immobilie. Lage, Zustand, Grundstück,
          Modernisierung und Nachfrage verändern den erzielbaren Preis deutlich. Darum braucht es immer eine
          individuelle Einordnung.
        </>
      ),
    },
    {
      question: `Wie hängt ${name} mit dem Markt in Aurich und Ostfriesland zusammen?`,
      answer: (
        <>
          Jeder Ort hat eigene Mikrolagen, Käufergruppen und Preisniveaus. Trotzdem hängen Nachfrage,
          Vergleichsdaten und Käuferbewegungen regional zusammen. Einen Überblick über Orte und Teilmärkte findest
          du unter{" "}
          <InlineLink href="/regionen-ostfriesland">Regionen Ostfriesland</InlineLink>.
        </>
      ),
    },
  ];

  return (
    <section className="bg-white py-12 md:py-14">
      <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
        <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-tight text-[color:var(--color-navy)] md:text-[2.45rem]">
          Lokale Fragen zu {name}
        </h2>
        <div className="mt-6 divide-y divide-[color:var(--color-brass)]/20 rounded-xl border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_70px_-64px_rgba(27,48,64,0.45)]">
          {items.map((item, index) => (
            <details key={item.question} className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 marker:hidden sm:px-6">
                <h3 className="text-base font-semibold leading-snug text-[color:var(--color-navy)] sm:text-lg">
                  {item.question}
                </h3>
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
  );
}
