import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import LeadGenWizard from "@/components/immobilienbewertung/LeadGenWizard.client";
import HeroAppointmentForm from "@/components/seo/HeroAppointmentForm.client";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import {
  averageDeltaPercent,
  daysOnMarket,
  medianPricePerM2,
  totalSalesCount,
  valuationMarketSentence,
} from "@/lib/seo/valuationLanding";
import type { SeoLocationRow } from "@/lib/types/leadgen";

function formatEuroPerM2(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} €/m²` : "nicht verfügbar";
}

function formatDays(value: number | null) {
  return value ? `ca. ${value.toLocaleString("de-DE")} Tage` : "nicht verfügbar";
}

function formatSales(value: number | null) {
  return value ? `${value.toLocaleString("de-DE")} Verkäufe` : "nicht verfügbar";
}

function formatLocationLabel(label: string) {
  const parts = label
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return label;
  return `${parts[0]}, ${parts.slice(1).join(", ")}`;
}

function formatLocationForTemplate(location: SeoLocationRow) {
  const label = location.location_label.trim();
  const city = location.stadt_gemeinde?.trim();
  const district = location.ortsteil?.trim() || label;

  if (location.location_type === "ortsteil" && city && district && district !== city) {
    return `${district}, ${city}`;
  }

  return formatLocationLabel(label);
}

function formatLocationForProse(location: SeoLocationRow) {
  const label = location.location_label.trim();
  const city = location.stadt_gemeinde?.trim();
  const district = location.ortsteil?.trim() || label;

  if (location.location_type === "ortsteil" && city && district && district !== city) {
    return `${district} in ${city}`;
  }

  const parts = label
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return label;
  return `${parts[0]} in ${parts.slice(1).join(", ")}`;
}

function Section({
  eyebrow,
  title,
  children,
  muted = false,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={muted ? "bg-[color:var(--color-section)] py-10 md:py-12" : "py-10 md:py-12"}>
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-tight text-[color:var(--color-navy)] md:text-[2.45rem]">
          {title}
        </h2>
        <div className="mt-4 space-y-4 text-base leading-[1.78] text-[color:var(--color-graphite)]">{children}</div>
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  const icons: Array<"pin" | "home" | "target" | "search" | "chart" | "shield"> = [
    "pin",
    "home",
    "target",
    "search",
    "chart",
    "shield",
  ];

  return (
    <ul className="grid gap-4 text-base leading-7 sm:grid-cols-2">
      {items.map((item, index) => (
        <li
          key={item}
          className="flex items-center gap-4 rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)] shadow-[0_16px_42px_-36px_rgba(27,48,64,0.45)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-[color:var(--color-navy)]">
            <HeroIcon type={icons[index % icons.length]} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MarketCard({ label, value, note }: { label: string; value: string; note?: string }) {
  const isUnavailable = value === "nicht verfügbar";

  return (
    <div className="rounded-lg border border-[color:var(--color-brass)]/25 bg-white p-5">
      <dt className="text-sm leading-6 text-[color:var(--color-graphite)]">{label}</dt>
      <dd
        className={`mt-2 font-semibold leading-tight ${
          isUnavailable
            ? "text-xl text-[color:var(--color-graphite)]"
            : "text-2xl text-[color:var(--color-navy)]"
        }`}
      >
        {value}
      </dd>
      {note ? (
        <p className="mt-2 text-sm text-[color:var(--color-graphite)]">
          {isUnavailable ? "Für diese Kategorie liegen nicht genug Verkaufsdaten vor." : note}
        </p>
      ) : null}
    </div>
  );
}

function HeroIcon({ type }: { type: "home" | "building" | "calendar" | "chart" | "shield" | "pin" | "lock" | "target" | "search" | "check" | "handshake" | "arrow" | "user" | "mail" | "phone" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6">
      {type === "home" ? (
        <>
          <path {...common} d="M5 15 16 6l11 9" />
          <path {...common} d="M8 14v12h16V14" />
          <path {...common} d="M13 26v-7h6v7" />
        </>
      ) : null}
      {type === "building" ? (
        <>
          <path {...common} d="M8 27V7h12v20M20 13h5v14" />
          <path {...common} d="M12 11h4M12 16h4M12 21h4" />
        </>
      ) : null}
      {type === "calendar" ? (
        <>
          <path {...common} d="M8 8h16v18H8zM11 5v6M21 5v6M8 14h16" />
          <path {...common} d="M12 18h2M18 18h2M12 22h2M18 22h2" />
        </>
      ) : null}
      {type === "chart" ? (
        <>
          <path {...common} d="M6 26h20M10 23V13M16 23V7M22 23v-6" />
        </>
      ) : null}
      {type === "shield" ? (
        <>
          <path {...common} d="M16 4 26 8v7c0 7-4.5 11-10 13C10.5 26 6 22 6 15V8z" />
          <path {...common} d="m11 16 3 3 7-7" />
        </>
      ) : null}
      {type === "pin" ? (
        <>
          <path {...common} d="M16 28s8-7.5 8-15A8 8 0 1 0 8 13c0 7.5 8 15 8 15z" />
          <circle {...common} cx="16" cy="13" r="3" />
        </>
      ) : null}
      {type === "lock" ? (
        <>
          <path {...common} d="M9 14h14v12H9zM12 14v-3a4 4 0 0 1 8 0v3" />
        </>
      ) : null}
      {type === "target" ? (
        <>
          <circle {...common} cx="16" cy="16" r="11" />
          <circle {...common} cx="16" cy="16" r="6" />
          <path {...common} d="M16 16 24 8" />
        </>
      ) : null}
      {type === "search" ? (
        <>
          <circle {...common} cx="14" cy="14" r="8" />
          <path {...common} d="m20 20 6 6" />
        </>
      ) : null}
      {type === "check" ? <path {...common} d="M6 17 13 24 26 8" /> : null}
      {type === "handshake" ? (
        <>
          <path {...common} d="M11 18 7 14l5-5 4 4" />
          <path {...common} d="M21 18l4-4-5-5-7 7 2 2 3-3 5 5-4 4-3-3" />
        </>
      ) : null}
      {type === "arrow" ? <path {...common} d="M7 16h18M18 9l7 7-7 7" /> : null}
      {type === "user" ? (
        <>
          <circle {...common} cx="16" cy="11" r="5" />
          <path {...common} d="M7 27c2-6 6-9 9-9s7 3 9 9" />
        </>
      ) : null}
      {type === "mail" ? (
        <>
          <path {...common} d="M6 9h20v14H6z" />
          <path {...common} d="m6 10 10 8 10-8" />
        </>
      ) : null}
      {type === "phone" ? (
        <path {...common} d="M10 6h4l2 6-3 2c1.6 3.2 3.8 5.4 7 7l2-3 6 2v4c0 2-1.5 3-3 3C14 27 5 18 5 7c0-1.5 1-3 3-3" />
      ) : null}
    </svg>
  );
}

function HeroMetric({ icon, label, value, note }: { icon: "home" | "building" | "calendar" | "chart"; label: string; value: string; note: string }) {
  const isUnavailable = value === "nicht verfügbar";

  return (
    <div className="grid min-w-0 grid-cols-[3.25rem_1fr] items-center gap-3 border-[color:var(--color-brass)]/20 px-4 py-5 sm:grid-cols-[4rem_1fr] md:border-r last:md:border-r-0">
      <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-[color:var(--color-navy)] shadow-[0_12px_32px_-24px_rgba(27,48,64,0.45)] sm:h-16 sm:w-16">
        <HeroIcon type={icon} />
      </span>
      <div className="min-w-0">
        <dt className="text-sm font-semibold text-[color:var(--color-navy)]">{label}</dt>
        <dd
          className={`mt-1 font-semibold leading-tight ${
            isUnavailable
              ? "text-[1.35rem] text-[color:var(--color-graphite)] sm:text-2xl"
              : "text-[1.55rem] text-[color:var(--color-navy)] sm:text-2xl"
          }`}
        >
          {value}
        </dd>
        <p className="mt-1 text-sm text-[color:var(--color-graphite)]">
          {isUnavailable ? "zu wenige Verkäufe" : note}
        </p>
      </div>
    </div>
  );
}

function HeroTrustItem({ icon, title, text }: { icon: "target" | "search" | "check" | "handshake"; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 px-4 py-4">
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-[color:var(--color-navy)] [&_svg]:h-6 [&_svg]:w-6">
        {icon === "target" ? (
          <Image
            src="/images/immobilienmakler-aurich/zielscheibe.webp"
            alt=""
            width={24}
            height={24}
            sizes="24px"
            className="h-6 w-6 object-contain"
          />
        ) : icon === "handshake" ? (
          <Image
            src="/images/immobilienmakler-aurich/person.webp"
            alt=""
            width={24}
            height={24}
            sizes="24px"
            className="h-6 w-6 object-contain"
          />
        ) : (
          <HeroIcon type={icon} />
        )}
      </span>
      <div>
        <p className="font-semibold text-[color:var(--color-navy)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[color:var(--color-graphite)]">{text}</p>
      </div>
    </div>
  );
}

function RecommendedLinks({ data }: { data: LocationPageData }) {
  const location = formatLocationForTemplate(data.location);
  const slug = data.location.location_slug;
  const links = [
    { href: `/haus-verkaufen-${slug}`, label: `Haus verkaufen ${location}` },
    { href: `/immobilienpreise-${slug}`, label: `Immobilienpreise ${location}` },
    { href: `/immobilienmakler-${slug}`, label: `Immobilienmakler ${location}` },
  ];

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-lg border border-[color:var(--color-brass)]/25 bg-white px-4 py-3 text-sm font-semibold text-[color:var(--color-navy)] hover:border-[color:var(--color-brackish)]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function LeadGeneratorBlock({
  id,
  location,
  headlineLocation = location,
  secondary = false,
}: {
  id?: string;
  location: string;
  headlineLocation?: string;
  secondary?: boolean;
}) {
  const idPrefix = secondary ? "valuation-secondary-leadgen" : "valuation-primary-leadgen";

  return (
    <section
      id={id}
      className={secondary ? "bg-[color:var(--color-section)] py-12 md:py-16" : "bg-white py-10 md:py-14"}
      aria-label={`Immobilienbewertung in ${headlineLocation} starten`}
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
            Immobilienbewertung {headlineLocation} starten
          </h2>
          <p className="mt-4 text-base leading-[1.75] text-[color:var(--color-graphite)]">
            Erhalte eine realistische Einschätzung für deine Immobilie in {location}.
          </p>
          <p className="mt-3 text-sm font-medium text-[color:var(--color-graphite)]">
            Unverbindlich · Persönlich eingeordnet · Ohne Verkaufsdruck
          </p>
        </div>
        <LeadGenWizard layout="embedded" idPrefix={idPrefix} />
      </div>
    </section>
  );
}

export default function ValuationLocationTemplate({ data }: { data: LocationPageData }) {
  const rawLocation = data.location.location_label;
  const location = formatLocationForTemplate(data.location);
  const proseLocation = formatLocationForProse(data.location);
  const houseMedianPrice = medianPricePerM2(data.houseMarket);
  const apartmentMedianPrice = medianPricePerM2(data.apartmentMarket);
  const marketDays = daysOnMarket(data.houseMarket, data.apartmentMarket);
  const salesCount = totalSalesCount(data.houseMarket, data.apartmentMarket);
  const deltaPercent = averageDeltaPercent(data.houseMarket, data.apartmentMarket);
  const marketSentence = valuationMarketSentence({
    location: { ...data.location, location_label: proseLocation },
    salesCount,
    deltaPercent,
  });
  const heroImage = "/images/immobilienbewertung/hero-background.png";

  return (
    <>
      <section className="relative isolate overflow-x-hidden bg-white">
        <div className="relative w-full overflow-hidden bg-[color:var(--color-section)] lg:min-h-[calc(100svh-4rem)]">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="origin-right scale-[1.08] object-cover"
            style={{ objectPosition: "right center" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.56)_26%,rgba(255,255,255,0.24)_42%,rgba(255,255,255,0.07)_58%,rgba(255,255,255,0)_78%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(0deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_100%)]" />

          <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-8 px-5 pb-10 pt-14 sm:px-8 md:pb-12 md:pt-16 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1fr)_366px] lg:items-center lg:px-12 lg:pb-44 lg:pt-20">
            <div className="min-w-0 max-w-[64rem]">
              <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)] sm:mb-5 sm:text-sm sm:tracking-[0.16em]">
                Immobilienbewertung {location}
              </p>
              <h1 className="max-w-full break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.55rem,4.8vw,4.8rem)] leading-[1.01] tracking-normal text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
                Immobilienbewertung
                <span className="block">{location}</span>
              </h1>
              <div className="mt-6 h-1 w-24 bg-[color:var(--color-brass)] sm:mt-8 sm:w-28" />
              <p className="mt-6 max-w-[36rem] text-[1.02rem] leading-[1.6] text-[color:var(--color-navy)] sm:text-[1.15rem] md:text-[1.28rem]">
                Was ist deine Immobilie in {proseLocation} aktuell wirklich wert?
              </p>
              <p className="mt-5 max-w-[36rem] text-[0.98rem] leading-[1.7] text-[color:var(--color-graphite)] sm:text-base md:text-lg">
                Erhalte eine realistische Preisspanne – basierend auf echten Verkaufsdaten aus {proseLocation}.
              </p>
              <div className="mt-8">
                <Link
                  href="#bewertung-starten"
                  className="inline-flex min-h-14 w-full max-w-full items-center justify-center gap-3 rounded-xl bg-[color:var(--color-navy)] px-5 py-4 text-center text-sm font-semibold text-white shadow-[0_16px_40px_-28px_rgba(27,48,64,0.65)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] sm:w-auto sm:gap-5 sm:px-7 sm:text-base"
                >
                  Jetzt realistische Bewertung erhalten
                  <HeroIcon type="arrow" />
                </Link>
              </div>
              <div className="mt-8 grid gap-3 text-sm font-semibold text-[color:var(--color-navy)] sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
                <span className="inline-flex items-center gap-2"><HeroIcon type="shield" /> Unverbindlich</span>
                <span className="inline-flex items-center gap-2"><HeroIcon type="pin" /> Regional eingeordnet</span>
                <span className="inline-flex items-center gap-2"><HeroIcon type="lock" /> Kein Verkaufsdruck</span>
              </div>
            </div>

            <HeroAppointmentForm
              locationLabel={rawLocation}
              displayLocationLabel={proseLocation}
              locationSlug={data.location.location_slug}
            />
          </div>

          <div className="relative z-10 mx-5 mb-6 rounded-[1.25rem] border border-[color:var(--color-brass)]/20 bg-white/96 shadow-[0_22px_70px_-60px_rgba(27,48,64,0.55)] backdrop-blur sm:mx-8 lg:absolute lg:inset-x-12 lg:bottom-0 lg:mx-auto lg:mb-8 lg:max-w-[1328px]">
            <dl className="grid md:grid-cols-4">
              <HeroMetric icon="home" label="Ø Hauspreis" value={formatEuroPerM2(houseMedianPrice)} note="Medianpreis" />
              <HeroMetric icon="building" label="Ø Wohnungspreis" value={formatEuroPerM2(apartmentMedianPrice)} note="Medianpreis" />
              <HeroMetric icon="calendar" label="Ø Vermarktungsdauer" value={formatDays(marketDays)} note="durchschnittlich" />
              <HeroMetric icon="chart" label="Datenbasis" value={formatSales(salesCount)} note="ausgewertete Verkäufe" />
            </dl>
          </div>
        </div>

        <div className="bg-white/94 shadow-[0_-18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="mx-auto grid w-full max-w-[1240px] gap-4 px-5 py-6 sm:px-8 md:grid-cols-4 md:gap-0 lg:px-12">
          <HeroTrustItem icon="target" title="Realistische Bewertung" text="keine geschönten Werte, sondern echte Marktdaten" />
          <HeroTrustItem icon="search" title="Regionale Expertise" text="Marktverständnis für Aurich und Ostfriesland" />
          <HeroTrustItem icon="check" title="Fundierte Analyse" text="bewertet nach Lage, Zustand, Ausstattung und Nachfrage" />
          <HeroTrustItem icon="handshake" title="Persönliche Beratung" text="auf Wunsch persönliche Einordnung und Empfehlung" />
          </div>
        </div>
      </section>

      <LeadGeneratorBlock id="bewertung-starten" location={proseLocation} headlineLocation={location} secondary />

      <Section title="Warum viele Immobilien falsch eingeschätzt werden">
        <p className="max-w-4xl text-[color:var(--color-navy)]">
          Viele Eigentümer orientieren sich an Angebotspreisen oder fehlerhaften Online-Rechnern.
        </p>
        <p className="max-w-4xl">
          Das Problem: Diese Werte haben oft wenig mit dem tatsächlichen Verkaufspreis zu tun.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <p className="rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)] shadow-[0_16px_42px_-36px_rgba(27,48,64,0.45)]">
            Zu hoch angesetzt <span aria-hidden="true">→</span> lange Vermarktungsdauer
          </p>
          <p className="rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)] shadow-[0_16px_42px_-36px_rgba(27,48,64,0.45)]">
            Zu niedrig angesetzt <span aria-hidden="true">→</span> finanzieller Verlust
          </p>
        </div>
        <p className="max-w-4xl text-[color:var(--color-navy)]">
          Eine fundierte Immobilienbewertung in {proseLocation} schafft Klarheit, bevor eine Entscheidung getroffen wird.
        </p>
      </Section>

      <Section title={`Immobilienmarkt in ${proseLocation}`} muted>
        <p>Der Immobilienmarkt in {proseLocation} zeigt aktuell ein differenziertes Bild.</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <MarketCard label="Ø Hauspreis" value={formatEuroPerM2(houseMedianPrice)} note="Medianpreis" />
          <MarketCard label="Ø Wohnungspreis" value={formatEuroPerM2(apartmentMedianPrice)} note="Medianpreis" />
          <MarketCard label="Vermarktungsdauer" value={formatDays(marketDays)} />
          <MarketCard label="Datenbasis" value={formatSales(salesCount)} />
        </dl>
        <p>{marketSentence}</p>
        <div className="rounded-xl border border-[color:var(--color-brass)]/25 bg-white p-5 text-base leading-[1.8] text-[color:var(--color-graphite)] md:p-6">
          <h3 className="text-xl font-semibold leading-snug text-[color:var(--color-navy)]">
            Was ist der Unterschied zwischen Medianpreis und Durchschnittspreis in {proseLocation}?
          </h3>
          <p className="mt-4">
            Viele Eigentümer orientieren sich am Durchschnittspreis – und verlieren dadurch oft Geld, ohne es zu
            merken.
          </p>
          <p>
            Der Durchschnittspreis ist ein rechnerischer Mittelwert. Er entsteht, indem alle Verkaufspreise addiert
            und durch die Anzahl der Verkäufe geteilt werden. Einzelne besonders teure oder besonders günstige
            Immobilien können diesen Wert deutlich verzerren.
          </p>
          <p>
            Der Medianpreis zeigt dagegen den typischen Preis am Immobilienmarkt in {proseLocation}. Er liegt genau
            in der Mitte aller Verkäufe – die eine Hälfte wurde zu einem höheren Preis verkauft, die andere zu einem
            niedrigeren.
          </p>
          <p className="pt-3">
            <span className="font-semibold text-[color:var(--color-navy)]">Wichtig:</span> Für eine realistische
            Einschätzung ist der Medianpreis in der Regel die verlässlichere Orientierung, weil er weniger anfällig
            für Ausreißer ist.
          </p>
          <h3 className="pt-3 text-xl font-semibold leading-snug text-[color:var(--color-navy)]">
            Warum der Medianpreis in {proseLocation} für dich entscheidend ist
          </h3>
          <p>
            Für deinen Verkauf zählt nicht der rechnerische Durchschnitt – sondern der Preis, der am Markt tatsächlich
            erzielt wird.
          </p>
          <p>
            Genau hier liegt der Unterschied: Während der Durchschnitt oft ein verzerrtes Bild zeigt, bildet der
            Medianpreis die reale Marktsituation deutlich genauer ab.
          </p>
          <p>
            Wenn du wissen möchtest, welchen Preis deine Immobilie in {proseLocation} aktuell wirklich erreichen
            kann, brauchst du keinen allgemeinen Durchschnittswert – sondern eine klare, realistische Einordnung auf
            Basis echter Verkäufe.
          </p>
          <p>
            Genau diese Einschätzung bekommst du bei uns.
          </p>
        </div>
      </Section>

      <Section title="Wie der Wert wirklich entsteht">
        <p>Diese Faktoren bestimmen den tatsächlichen Marktwert:</p>
        <BulletList
          items={[
            `Lage innerhalb von ${proseLocation}`,
            "Zustand und Ausstattung",
            "Grundstück und Zuschnitt",
            "vergleichbare Verkäufe",
            "aktuelle Nachfrage",
            "Energiezustand und Modernisierungen",
          ]}
        />
        <p>Keine pauschale Bewertung – sondern individuelle Einordnung.</p>
      </Section>

      <Section title="Was du konkret erhältst" muted>
        <p>Du weißt danach: Was deine Immobilie wirklich wert ist – und wie du sinnvoll vorgehst.</p>
        <BulletList
          items={[
            "eine realistische Preisspanne",
            "eine klare Einordnung",
            "eine Nachfrageeinschätzung",
            "eine Verkaufsstrategie",
            "eine fundierte Entscheidungsgrundlage",
          ]}
        />
      </Section>

      <Section title={`Frisia Immobilien in ${proseLocation}`}>
        <p>
          Frisia Immobilien arbeitet nicht mit pauschalen Schätzungen, sondern mit realen Verkaufsdaten aus {proseLocation}{" "}
          und der Region.
        </p>
        <p>Die Bewertung verbindet Marktdaten, Erfahrung und die konkrete Situation deiner Immobilie.</p>
        <p>Ziel ist ein Preis, der am Markt tatsächlich durchsetzbar ist.</p>
      </Section>

      <section className="bg-[color:var(--color-section)] py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
            Häufige Fragen zur Immobilienbewertung in {proseLocation}
          </h2>
          <div className="mt-6 divide-y divide-[color:var(--color-brass)]/20 rounded-xl border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_70px_-64px_rgba(27,48,64,0.45)]">
            {data.template.faq(proseLocation).map((item, index) => (
              <details key={item.question} className="group" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 marker:hidden sm:px-6">
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

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
            Weiterführende Seiten für {proseLocation}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.75] text-[color:var(--color-graphite)]">
            Je nach Entscheidung helfen diese regionalen Seiten beim nächsten Schritt.
          </p>
          <RecommendedLinks data={data} />
        </div>
      </section>
    </>
  );
}
