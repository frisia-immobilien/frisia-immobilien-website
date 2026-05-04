import Image from "next/image";
import Link from "next/link";
import PropertyListingDirectory from "@/components/site/PropertyListingDirectory.client";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import RegionalCrossLinks from "@/components/seo/RegionalCrossLinks";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { formatLocationPhrase, formatLocationProseName } from "@/lib/seo/locationDisplay";
import { getImmobilienAurichListingResult, type PropertyListItem } from "@/lib/propstack";
import type { SeoLocationRow } from "@/lib/types/leadgen";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .trim();
}

function filterListingsForLocation(items: PropertyListItem[], location: SeoLocationRow) {
  const candidates = [
    location.location_label,
    location.stadt_gemeinde,
    location.ortsteil,
    location.plz,
  ].map(normalize).filter(Boolean);

  const exactMatches = items.filter((item) => {
    const values = [item.city, item.zipCode, item.shortAddress].map(normalize);
    return values.some((value) => candidates.some((candidate) => value === candidate || value.includes(candidate)));
  });

  return exactMatches.length > 0 ? exactMatches : items;
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <li key={item} className="rounded-lg border border-[color:var(--color-brass)]/35 bg-[#FFFFFF] px-5 py-4 font-semibold text-[color:var(--color-navy)]">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function RealEstateListingsLocationTemplate({ data }: { data: LocationPageData }) {
  const proseLocation = formatLocationProseName(data.location);
  const locationPhrase = formatLocationPhrase(data.location);
  const heroImage = "/images/immobilienbewertung/hero-background-sharp.webp";
  const listing = await getImmobilienAurichListingResult();
  const items = filterListingsForLocation(listing.items, data.location);
  const showsFallbackInventory = items.length > 0 && items.length === listing.items.length && data.location.location_type === "ortsteil";

  return (
    <>
      <MobileHeroSection
        eyebrow={`Immobilien ${locationPhrase}`}
        title={<>Immobilien {locationPhrase}</>}
        description={
          <>
            Aktuelle Immobilienangebote {locationPhrase} - Häuser, Wohnungen und ausgewählte Objekte im Überblick.
          </>
        }
        imageSrc={heroImage}
        imageAlt=""
        imagePosition="right center"
        imageQuality={88}
        primaryCta={{ href: "/suchauftrag", label: "Suchauftrag starten" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Angebote", "Suchauftrag", "Regional"]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image src={heroImage} alt="" fill priority sizes="100vw" quality={88} className="object-cover object-right opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.42)_34%,rgba(255,255,255,0.16)_58%,rgba(255,255,255,0.06)_100%)]" />
        <div className="absolute inset-0 bg-white/10" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-8 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:px-12">
          <div className="min-w-0 max-w-[72rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Immobilien {locationPhrase}
            </p>
            <h1 className="mt-5 max-w-[18ch] break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              Immobilien {locationPhrase}
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-3xl text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:text-[1.35rem]">
              Aktuelle Immobilienangebote {locationPhrase}
              <span className="block">- Häuser, Wohnungen und ausgewählte Objekte im Überblick.</span>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/suchauftrag" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Suchauftrag starten
              </Link>
              <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/75 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
                {PHONE_DISPLAY}
              </a>
            </div>
            <ul className="mt-6 flex max-w-3xl flex-col gap-3 text-sm font-semibold leading-6 text-[color:var(--color-navy)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
              {["Klare Bewertung", "Strukturierter Verkauf", "Geprüfte Käufer"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-navy)] text-[color:var(--color-navy)]">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-2 w-2" fill="none">
                      <path d="m4 8.2 2.4 2.4L12 5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[color:var(--color-brass)]/25 bg-white/92 p-6 shadow-[0_28px_90px_-58px_rgba(27,48,64,0.65)] backdrop-blur md:p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
              Nicht jede Immobilie ist dauerhaft sichtbar.
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Entscheidend ist, passende Angebote rechtzeitig zu erkennen - und richtig einzuordnen.
            </p>
          </div>
        </div>
      </section>

      <AurichHeroLinks />
      <RegionalCrossLinks data={data} placement="hero" />

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Aktuelle Immobilienangebote {locationPhrase}
          </h2>
          <p className="mt-6 max-w-4xl text-base leading-[1.78] text-[color:var(--color-graphite)] md:text-lg">
            Hier findest du alle Immobilien, die sich aktuell in der Vermarktung befinden.
          </p>
          {showsFallbackInventory ? (
            <p className="mt-4 max-w-4xl rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-5 py-4 text-base leading-7 text-[color:var(--color-graphite)]">
              Für {proseLocation} liegt aktuell kein exakt zugeordnetes Objekt vor. Deshalb zeigen wir den aktuellen regionalen Vermarktungsbestand und empfehlen den Suchauftrag für passende Treffer.
            </p>
          ) : null}

          {items.length > 0 ? (
            <PropertyListingDirectory items={items} />
          ) : (
            <div className="mt-10 rounded-lg border border-[color:var(--color-brass)]/35 bg-white p-7 shadow-[0_18px_54px_-44px_rgba(27,48,64,0.48)]">
              <h3 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
                Aktuell keine sichtbaren Immobilienangebote
              </h3>
              <p className="mt-4 max-w-3xl text-base leading-[1.8] text-[color:var(--color-graphite)]">
                Gute Objekte werden häufig schnell entschieden. Mit einem Suchauftrag wirst du gezielt informiert, sobald passende Immobilien verfügbar sind.
              </p>
              <Link href="/suchauftrag" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Suchauftrag starten
              </Link>
            </div>
          )}

          <p className="mt-7 text-base leading-[1.75] text-[color:var(--color-graphite)]">
            Die dargestellten Immobilien sind aktuell verfügbar. Gute Objekte werden häufig schnell entschieden.
          </p>
          <p className="mt-3 font-semibold text-[color:var(--color-navy)]">
            Die Auswahl zeigt den aktuellen Markt - aber nicht alle verfügbaren Möglichkeiten.
          </p>
        </div>
      </section>

      <Section title={`Immobilienmarkt ${locationPhrase} - kurze Einordnung`} muted>
        <p>Der Immobilienmarkt {locationPhrase} ist geprägt durch Angebot, Nachfrage und Lageunterschiede innerhalb des Ortes.</p>
        <BulletList
          items={[
            "Gefragte Immobilien werden oft schnell entschieden",
            "Preisniveau hängt stark von Lage, Zustand und Grundstück ab",
            "Nicht alle Immobilien bleiben lange öffentlich sichtbar",
          ]}
        />
        <p className="font-semibold text-[color:var(--color-navy)]">Die größte Herausforderung ist nicht das Finden von Immobilien - sondern das rechtzeitige Erkennen passender Angebote.</p>
        <p>Wenn du ernsthaft suchst, solltest du nicht nur auf sichtbare Angebote reagieren.</p>
      </Section>

      <section id="suchauftrag-starten" className="bg-[color:var(--color-navy)] py-12 text-white md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight md:text-[2.85rem]">
            Passende Immobilien {locationPhrase} frühzeitig erhalten
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Mit einem Suchauftrag wirst du über passende Immobilien informiert, bevor sie vollständig am Markt sichtbar sind.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-4">
            <InfoCard title="Früher Zugang" text="Du erhältst Angebote, bevor sie breit veröffentlicht werden." />
            <InfoCard title="Gezielte Auswahl" text="Nur Immobilien, die zu deinen Kriterien passen." />
            <InfoCard title="Zeitersparnis" text="Keine tägliche Suche auf mehreren Plattformen." />
            <InfoCard title="Bessere Chancen" text="Du reagierst schneller als andere Interessenten." />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/suchauftrag" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
              Suchauftrag starten
            </Link>
            <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 py-4 text-base font-semibold text-white">
              {PHONE_DISPLAY}
            </a>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/78">Ein kurzer Einstieg reicht. Danach wirst du automatisch über passende Immobilien informiert.</p>
        </div>
      </section>
    </>
  );
}
