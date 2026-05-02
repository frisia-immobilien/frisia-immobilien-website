import Image from "next/image";
import Link from "next/link";
import PriceHistoryChart from "@/components/charts/PriceHistoryChart";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import RegionalCrossLinks from "@/components/seo/RegionalCrossLinks";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { formatLocationPhrase, formatLocationProseName } from "@/lib/seo/locationDisplay";
import { daysOnMarket, medianPricePerM2, totalSalesCount } from "@/lib/seo/valuationLanding";
import type { PriceHistoryRow } from "@/lib/types/leadgen";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

function numeric(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function hasPositiveValue(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function formatEuro(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} €` : "nicht verfügbar";
}

function formatEuroPerM2(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} €/m²` : "nicht verfügbar";
}

function formatTablePrice(value: number | null) {
  return value ? `${Math.round(value).toLocaleString("de-DE")} €/m²` : "nicht verfügbar";
}

function formatDays(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} Tage` : "nicht verfügbar";
}

function formatSales(value: number | null) {
  return value ? `ca. ${Math.round(value).toLocaleString("de-DE")} pro Jahr` : "nicht verfügbar";
}

function demandLabel(salesCount: number | null) {
  if (!salesCount) return "nicht verfügbar";
  if (salesCount >= 80) return "hoch";
  if (salesCount >= 25) return "mittel";
  return "gering";
}

const PRICE_TABLE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019] as const;

function formatChange(current: number | null, previous: number | null) {
  if (!current || !previous) return "—";
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

function changeDirection(current: number | null, previous: number | null) {
  if (!current || !previous) return "neutral";
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
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

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white p-5 shadow-[0_18px_44px_-38px_rgba(27,48,64,0.48)]">
      <dt className="text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brackish)]">{label}</dt>
      <dd className="mt-3 text-2xl font-semibold leading-tight text-[color:var(--color-navy)]">{value}</dd>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)]">
          {item}
        </li>
      ))}
    </ul>
  );
}

function FaqItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  return (
    <details className="group border-t border-[color:var(--color-brass)]/20 first:border-t-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 marker:hidden sm:px-6">
        <h3 className="text-base font-semibold leading-snug text-[color:var(--color-navy)] sm:text-lg">{question}</h3>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-xl leading-none text-[color:var(--color-navy)] transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-5 pb-6 pr-14 sm:px-6 sm:pr-20">
        <p className="text-base leading-[1.75] text-[color:var(--color-graphite)]">{answer}</p>
      </div>
    </details>
  );
}

function priceForYear(rows: PriceHistoryRow[], year: number) {
  return numeric(rows.find((row) => row.year === year)?.median_preis_eur_m2);
}

function priceHistoryRowsWithValues(rows: PriceHistoryRow[]) {
  return rows.filter((row) => hasPositiveValue(numeric(row.median_preis_eur_m2)));
}

function hasDevelopmentTableValues(rows: PriceHistoryRow[], currentPrice: number | null) {
  return hasPositiveValue(currentPrice) || PRICE_TABLE_YEARS.some((year) => hasPositiveValue(priceForYear(rows, year)));
}

function PriceDevelopmentTable({
  rows,
  title,
  currentPrice,
}: {
  rows: PriceHistoryRow[];
  title: string;
  currentPrice: number | null;
}) {
  const tableValue = (year: number) => (year === 2026 ? currentPrice : priceForYear(rows, year));
  const availableRows = PRICE_TABLE_YEARS.map((year) => ({ year, current: tableValue(year) })).filter(({ current }) =>
    hasPositiveValue(current),
  );

  if (availableRows.length === 0) return null;

  return (
    <div>
      <h3 className="font-[family-name:var(--font-playfair)] text-[1.55rem] leading-tight text-[color:var(--color-navy)] sm:text-[1.9rem] md:text-[2.35rem]">
        {title}
      </h3>
      <div className="mt-5 overflow-hidden rounded-lg border border-[color:var(--color-brass)]/30 bg-white">
        <table className="w-full table-fixed border-collapse text-left text-[0.86rem] sm:table-auto sm:text-base">
          <colgroup>
            <col className="w-[28%] sm:w-auto" />
            <col className="w-[36%] sm:w-auto" />
            <col className="w-[36%] sm:w-auto" />
          </colgroup>
          <thead className="bg-[color:var(--color-section)] text-[0.68rem] uppercase tracking-[0.07em] text-[color:var(--color-brackish)] sm:text-sm sm:tracking-[0.08em]">
            <tr>
              <th className="px-3 py-3 font-semibold sm:px-5 sm:py-4">Jahr</th>
              <th className="px-3 py-3 font-semibold sm:px-5 sm:py-4">Preis</th>
              <th className="px-3 py-3 font-semibold sm:px-5 sm:py-4">
                <span className="sm:hidden">Änderung</span>
                <span className="hidden sm:inline">Veränderung zum Vorjahr</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-brass)]/20">
            {availableRows.map(({ year, current }) => {
              const previous = year === 2019 ? null : tableValue(year - 1);
              const direction = changeDirection(current, previous);
              return (
                <tr key={year}>
                  <td className="px-3 py-4 font-semibold text-[color:var(--color-navy)] sm:px-5 sm:py-4">{year}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-[color:var(--color-graphite)] sm:px-5 sm:py-4">{formatTablePrice(current)}</td>
                  <td className="whitespace-nowrap px-3 py-4 sm:px-5 sm:py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 sm:gap-3 ${
                        direction === "up"
                          ? "font-semibold text-[#123A05]"
                          : direction === "down"
                            ? "font-semibold text-[#760000]"
                            : "text-[color:var(--color-graphite)]"
                      }`}
                    >
                      {formatChange(current, previous)}
                      {direction !== "neutral" ? (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className={`h-5 w-5 shrink-0 sm:h-8 sm:w-8 ${direction === "down" ? "rotate-90" : ""}`}
                          fill="none"
                        >
                          <path
                            d="M5 19 19 5"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10 5h9v9"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const aurichDecisionLinks = [
  {
    href: "/immobilienbewertung-aurich",
    label: "Immobilie in Aurich bewerten lassen",
  },
  {
    href: "/haus-verkaufen-aurich",
    label: "Haus in Aurich verkaufen",
  },
  {
    href: "/immobilienmakler-aurich",
    label: "Immobilienmakler für Aurich kennenlernen",
  },
] as const;

function AurichDecisionCta() {
  return (
    <section className="bg-[color:var(--color-section)] py-12 md:py-16" aria-labelledby="aurich-decision-title">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
        <div className="rounded-[1.5rem] border border-[color:var(--color-brass)]/22 bg-white p-6 shadow-[0_18px_54px_-46px_rgba(27,48,64,0.5)] md:p-9">
          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-[0.74rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brackish)]">
                Nächster Schritt
              </p>
              <h2
                id="aurich-decision-title"
                className="mt-3 font-[family-name:var(--font-playfair)] text-[2.05rem] leading-[1.13] text-[color:var(--color-navy)] md:text-[2.85rem]"
              >
                Von Marktdaten zur richtigen Entscheidung
              </h2>
              <p className="mt-5 max-w-3xl text-[1rem] leading-[1.75] text-[color:var(--color-graphite)] md:text-[1.08rem]">
                Marktdaten zeigen dir die Richtung. Für eine sichere Verkaufsentscheidung zählt danach die konkrete
                Bewertung deiner Immobilie und eine klare Strategie für den Verkauf.
              </p>
            </div>
            <div className="grid gap-3">
              {aurichDecisionLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-[color:var(--color-brass)]/28 bg-[color:var(--color-section)] px-5 py-4 text-[1rem] font-semibold leading-[1.45] text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brass)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PriceLocationTemplate({ data }: { data: LocationPageData }) {
  const proseLocation = formatLocationProseName(data.location);
  const locationPhrase = formatLocationPhrase(data.location);
  const housePriceM2 = medianPricePerM2(data.houseMarket);
  const apartmentPriceM2 = medianPricePerM2(data.apartmentMarket);
  const housePrice = numeric(data.houseMarket?.median_preis_eur);
  const apartmentPrice = numeric(data.apartmentMarket?.median_preis_eur);
  const salesCount = totalSalesCount(data.houseMarket, data.apartmentMarket);
  const marketDays = daysOnMarket(data.houseMarket, data.apartmentMarket);
  const heroImage = "/images/immobilienbewertung/hero-background.webp";
  const valuationHref = `/immobilienbewertung-${data.location.location_slug}`;
  const showAurichDecisionCta = data.location.location_slug === "aurich";
  const priceCards = [
    { label: "Hauspreis pro m²", value: formatEuroPerM2(housePriceM2), visible: hasPositiveValue(housePriceM2) },
    { label: "Wohnungspreis pro m²", value: formatEuroPerM2(apartmentPriceM2), visible: hasPositiveValue(apartmentPriceM2) },
    { label: "Ø Angebotspreis Häuser", value: formatEuro(housePrice), visible: hasPositiveValue(housePrice) },
    { label: "Ø Angebotspreis Wohnungen", value: formatEuro(apartmentPrice), visible: hasPositiveValue(apartmentPrice) },
  ].filter((card) => card.visible);
  const marketCards = [
    { label: "Anzahl Verkäufe in der Region", value: formatSales(salesCount), visible: hasPositiveValue(salesCount) },
    { label: "Ø Vermarktungsdauer", value: formatDays(marketDays), visible: hasPositiveValue(marketDays) },
    { label: "Nachfrage", value: demandLabel(salesCount), visible: hasPositiveValue(salesCount) },
  ].filter((card) => card.visible);
  const houseChartRows = priceHistoryRowsWithValues(data.houseHistory);
  const apartmentChartRows = priceHistoryRowsWithValues(data.apartmentHistory);
  const showHouseChart = houseChartRows.length >= 3;
  const showApartmentChart = apartmentChartRows.length >= 3;
  const showHouseDevelopmentTable = hasDevelopmentTableValues(data.houseHistory, housePriceM2);
  const showApartmentDevelopmentTable = hasDevelopmentTableValues(data.apartmentHistory, apartmentPriceM2);
  const hasPriceSection = priceCards.length > 0;
  const hasMarketSection = marketCards.length > 0;
  const hasChartSection = showHouseChart || showApartmentChart;
  const hasDevelopmentSection = showHouseDevelopmentTable || showApartmentDevelopmentTable;
  const isMutedByPosition = (visibleBefore: boolean[]) => visibleBefore.filter(Boolean).length % 2 === 1;
  const marketSectionMuted = isMutedByPosition([hasPriceSection]);
  const chartSectionMuted = isMutedByPosition([hasPriceSection, hasMarketSection]);
  const developmentSectionMuted = isMutedByPosition([hasPriceSection, hasMarketSection, hasChartSection]);
  const meaningSectionMuted = isMutedByPosition([
    hasPriceSection,
    hasMarketSection,
    hasChartSection,
    hasDevelopmentSection,
  ]);
  const faqs = [
    {
      question: `Wie entwickeln sich die Immobilienpreise ${locationPhrase} aktuell?`,
      answer: `Die Immobilienpreise ${locationPhrase} hängen von Angebot, Nachfrage, Zinsen, Lagequalität und Objektzustand ab. Die dargestellten Werte zeigen eine Orientierung, ersetzen aber keine individuelle Bewertung deiner Immobilie.`,
    },
    {
      question: "Sind Angebotspreise gleich Verkaufspreise?",
      answer: "Nein. Angebotspreise sind die Preise, mit denen Immobilien am Markt angeboten werden. Der tatsächliche Verkaufspreis entsteht erst durch Nachfrage, Verhandlung, Käuferprüfung und Abschluss. Deshalb kann der erzielte Preis vom Angebotspreis abweichen.",
    },
    {
      question: `Was beeinflusst den Preis meiner Immobilie ${locationPhrase}?`,
      answer: "Entscheidend sind Lage, Zustand, Grundstück, Wohnfläche, Grundriss, Energieeffizienz, Modernisierung, Ausstattung und aktuelle Nachfrage. Auch die richtige Preisstrategie beeinflusst, wie stark Käufer reagieren.",
    },
    {
      question: "Warum reicht der Quadratmeterpreis nicht aus?",
      answer: "Der Quadratmeterpreis ist ein Durchschnittswert. Er berücksichtigt nicht, ob deine Immobilie modernisiert ist, welches Grundstück dazugehört, wie die Mikrolage ist oder welche Käufer aktuell danach suchen.",
    },
    {
      question: "Was bedeutet die Preisentwicklung für meinen Verkauf?",
      answer: "Die Preisentwicklung zeigt, wie sich der Markt in den letzten Jahren verändert hat. Für deinen Verkauf zählt jedoch der aktuelle Markt: Welche Nachfrage gibt es heute, welcher Preis ist realistisch und wie sollte deine Immobilie positioniert werden?",
    },
    {
      question: "Was bringt mir eine Bewertung durch Frisia Immobilien?",
      answer: "Du erhältst eine realistische Einschätzung auf Basis aktueller Marktdaten, Vergleichsobjekten und regionaler Erfahrung. So weißt du, welcher Preisrahmen sinnvoll ist und wie der Verkauf strukturiert vorbereitet werden kann.",
    },
  ];

  return (
    <>
      <MobileHeroSection
        eyebrow={`Immobilienpreise ${locationPhrase}`}
        title={<>Immobilienpreise {locationPhrase}</>}
        description={`Aktuelle Preise, Entwicklung und klare Einordnung für Eigentümer ${locationPhrase}.`}
        imageSrc={heroImage}
        imageAlt=""
        imagePosition="right center"
        primaryCta={{ href: valuationHref, label: "Immobilie einordnen" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Marktdaten", "Bewertung", "Verkauf"]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-right opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.50)_34%,rgba(255,255,255,0.18)_58%,rgba(255,255,255,0.04)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-8 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[1.42fr_0.58fr] lg:items-center lg:px-12">
          <div className="max-w-[62rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Immobilienpreise {locationPhrase}
            </p>
            <h1 className="mt-5 max-w-full break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              Immobilienpreise {locationPhrase}
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-[32rem] text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:max-w-[34rem] md:text-[1.35rem]">
              Aktuelle Preise, Entwicklung und klare Einordnung für Eigentümer {locationPhrase}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={valuationHref} className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Immobilie einordnen
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
              Der Markt zeigt die Richtung.
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Die Immobilienpreise {locationPhrase} zeigen dir, wie sich der Markt entwickelt. Entscheidend ist jedoch, wo deine Immobilie heute konkret darin steht.
            </p>
          </div>
        </div>
      </section>

      <RegionalCrossLinks data={data} placement="hero" />

      {hasPriceSection ? (
        <Section title={`Aktuelle Immobilienpreise ${locationPhrase}`}>
          <p>Die folgenden Werte geben dir eine erste Orientierung für den Immobilienmarkt {locationPhrase}.</p>
          <dl className="grid gap-4 md:grid-cols-4">
            {priceCards.map((card) => (
              <DataCard key={card.label} label={card.label} value={card.value} />
            ))}
          </dl>
          <p>Die Werte basieren auf aktuellen Angebots- und Marktdaten. Der tatsächlich erzielbare Verkaufspreis kann davon abweichen und hängt immer von Lage, Zustand, Grundstück, Energie, Modernisierung und Nachfrage ab.</p>
          <p className="font-semibold text-[color:var(--color-navy)]">Der Markt gibt eine Richtung vor - aber nicht den genauen Wert deiner Immobilie.</p>
        </Section>
      ) : null}

      {hasMarketSection ? (
        <Section title={`Marktdaten für ${proseLocation}`} muted={marketSectionMuted}>
          <p>Neben dem Preis sind zwei Faktoren besonders wichtig: Wie aktiv ist der Markt - und wie schnell reagieren Käufer?</p>
          <dl className="grid gap-4 md:grid-cols-3">
            {marketCards.map((card) => (
              <DataCard key={card.label} label={card.label} value={card.value} />
            ))}
          </dl>
          <p>Viele Verkäufe und kurze Vermarktungszeiten sprechen für eine aktive Nachfrage. Längere Vermarktungszeiten zeigen, dass Preis, Präsentation und Verkaufsstrategie besonders sauber aufeinander abgestimmt sein müssen.</p>
          <p className="font-semibold text-[color:var(--color-navy)]">Der Preis allein entscheidet nicht. Entscheidend ist, wie der Markt auf diesen Preis reagiert.</p>
        </Section>
      ) : null}

      {hasChartSection ? (
        <section className={`${chartSectionMuted ? "bg-[color:var(--color-section)]" : "bg-white"} py-14 md:py-20`}>
          <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
                Preisentwicklung {locationPhrase}
              </h2>
              <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
                So haben sich die Quadratmeterpreise für Häuser und Wohnungen {locationPhrase} in den letzten Jahren entwickelt.
              </p>
            </div>
            <div className="mt-10 grid gap-8">
              {showHouseChart ? (
                <article className="rounded-lg border border-[color:var(--color-brass)]/30 bg-white p-5 shadow-[0_18px_54px_-44px_rgba(27,48,64,0.48)] md:p-8">
                  <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Hauspreise {locationPhrase}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-graphite)]">
                    Medianpreis in Euro pro Quadratmeter. Reale Jahreswerte - keine bloßen Angebotspreise.
                  </p>
                  <div className="mt-5">
                    <PriceHistoryChart title={`Hauspreise ${locationPhrase}`} rows={houseChartRows} />
                  </div>
                </article>
              ) : null}
              {showApartmentChart ? (
                <article className="rounded-lg border border-[color:var(--color-brass)]/30 bg-white p-5 shadow-[0_18px_54px_-44px_rgba(27,48,64,0.48)] md:p-8">
                  <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Wohnungspreise {locationPhrase}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-graphite)]">
                    Medianpreis in Euro pro Quadratmeter. Reale Jahreswerte - keine bloßen Angebotspreise.
                  </p>
                  <div className="mt-5">
                    <PriceHistoryChart title={`Wohnungspreise ${locationPhrase}`} rows={apartmentChartRows} />
                  </div>
                </article>
              ) : null}
            </div>
            <p className="mx-auto mt-9 max-w-4xl text-center text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
              Die Preisentwicklung zeigt, wie sich der Markt {locationPhrase} verändert hat. Für deinen Verkauf ist jedoch nicht der höchste Wert der letzten Jahre entscheidend, sondern der Preis, der heute realistisch erzielt werden kann.
            </p>
          </div>
        </section>
      ) : null}

      {hasDevelopmentSection ? (
        <Section title={`Entwicklung der Quadratmeterpreise ${locationPhrase}`} muted={developmentSectionMuted}>
          <p>Die Tabelle zeigt vorhandene Jahreswerte und macht sichtbar, wie stark sich der Markt von Jahr zu Jahr verändern kann.</p>
          {showHouseDevelopmentTable ? (
            <PriceDevelopmentTable
              title={`Entwicklung der Quadratmeterpreise für Häuser ${locationPhrase}`}
              rows={data.houseHistory}
              currentPrice={housePriceM2}
            />
          ) : null}
          {showApartmentDevelopmentTable ? (
            <div className={showHouseDevelopmentTable ? "mt-10" : undefined}>
              <PriceDevelopmentTable
                title={`Entwicklung der Quadratmeterpreise für Wohnungen ${locationPhrase}`}
                rows={data.apartmentHistory}
                currentPrice={apartmentPriceM2}
              />
            </div>
          ) : null}
          <p className="text-sm leading-6">Quelle: Angebots- und Marktdaten. Stand: April 2026. Der tatsächlich erzielte Verkaufspreis kann vom Angebotspreis abweichen.</p>
          <p>Die Entwicklung zeigt eine klare Richtung. Für deinen Verkauf zählt jedoch nicht allein die Vergangenheit, sondern die aktuelle Nachfrage nach genau deiner Immobilie {locationPhrase}.</p>
          <p className="font-semibold text-[color:var(--color-navy)]">Preisdaten erklären den Markt. Die Bewertung erklärt deine Immobilie.</p>
        </Section>
      ) : null}

      <Section title="Was bedeuten diese Immobilienpreise für dich als Eigentümer?" muted={meaningSectionMuted}>
        <p>Die dargestellten Immobilienpreise sind eine wichtige Orientierung. Sie beantworten aber nicht die entscheidende Frage: Welchen Preis kann deine Immobilie {locationPhrase} aktuell wirklich erzielen?</p>
        <p>Jede Immobilie ist anders:</p>
        <BulletList
          items={[
            `Lage innerhalb von ${proseLocation}`,
            "Zustand und Modernisierung",
            "Grundstück und Ausrichtung",
            "Energieeffizienz",
            "Wohnfläche und Grundriss",
            "Käuferzielgruppe",
            "aktuelle Nachfrage",
          ]}
        />
        <p>Der Quadratmeterpreis zeigt den Markt. Er ersetzt aber keine individuelle Einordnung.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Der Markt zeigt den Rahmen. Die Bewertung zeigt deinen realistischen Preis.</p>
        <p>Genau diese Einordnung entscheidet darüber, ob dein Verkauf ruhig, strukturiert und erfolgreich verläuft.</p>
      </Section>

      <section id="immobilie-bewerten" className="bg-[color:var(--color-navy)] py-12 text-white md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight md:text-[2.85rem]">
            Deine Immobilie {locationPhrase} realistisch einordnen
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Wenn du wissen möchtest, wo deine Immobilie im aktuellen Markt {locationPhrase} steht, erstellen wir für dich eine klare Einschätzung: Preisrahmen, Nachfrage und sinnvolle Vorgehensweise.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={valuationHref} className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
              Immobilie bewerten
            </Link>
            <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 py-4 text-base font-semibold text-white">
              {PHONE_DISPLAY}
            </a>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/78">Ein kurzer Einstieg reicht. Danach weißt du, was realistisch möglich ist.</p>
        </div>
      </section>

      {showAurichDecisionCta ? <AurichDecisionCta /> : null}

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Häufige Fragen zu Immobilienpreisen {locationPhrase}
          </h2>
          <div className="mt-6 divide-y divide-[color:var(--color-brass)]/20 rounded-xl border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_70px_-64px_rgba(27,48,64,0.45)]">
            {faqs.map((item, index) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
