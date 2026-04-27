import Image from "next/image";
import Link from "next/link";
import PriceHistoryChart from "@/components/charts/PriceHistoryChart";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { daysOnMarket, medianPricePerM2, totalSalesCount } from "@/lib/seo/valuationLanding";
import type { PriceHistoryRow, SeoLocationRow } from "@/lib/types/leadgen";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

function numeric(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
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

function formatLocationLabel(label: string) {
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return label;
  return `${parts[0]}, ${parts.slice(1).join(", ")}`;
}

function formatLocationForTemplate(location: SeoLocationRow) {
  const label = location.location_label.trim();
  const city = location.stadt_gemeinde?.trim();
  const district = location.ortsteil?.trim() || label;
  if (location.location_type === "ortsteil" && city && district && district !== city) return `${district}, ${city}`;
  return formatLocationLabel(label);
}

function formatLocationForProse(location: SeoLocationRow) {
  const label = location.location_label.trim();
  const city = location.stadt_gemeinde?.trim();
  const district = location.ortsteil?.trim() || label;
  if (location.location_type === "ortsteil" && city && district && district !== city) return `${district} in ${city}`;
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return label;
  return `${parts[0]} in ${parts.slice(1).join(", ")}`;
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-t border-[color:var(--color-brass)]/20 first:border-t-0">
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

function PriceDevelopmentTable({
  rows,
  title,
  currentPrice,
}: {
  rows: PriceHistoryRow[];
  title: string;
  currentPrice: number | null;
}) {
  const tableYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];
  const tableValue = (year: number) => (year === 2026 ? currentPrice : priceForYear(rows, year));

  return (
    <div>
      <h3 className="font-[family-name:var(--font-playfair)] text-[1.9rem] leading-tight text-[color:var(--color-navy)] md:text-[2.35rem]">
        {title}
      </h3>
      <div className="mt-5 overflow-x-auto rounded-lg border border-[color:var(--color-brass)]/30 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="bg-[color:var(--color-section)] text-sm uppercase tracking-[0.08em] text-[color:var(--color-brackish)]">
            <tr>
              <th className="px-5 py-4 font-semibold">Jahr</th>
              <th className="px-5 py-4 font-semibold">Preis</th>
              <th className="px-5 py-4 font-semibold">Veränderung zum Vorjahr</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-brass)]/20">
            {tableYears.map((year) => {
              const current = tableValue(year);
              const previous = year === 2019 ? null : tableValue(year - 1);
              const direction = changeDirection(current, previous);
              return (
                <tr key={year}>
                  <td className="px-5 py-4 font-semibold text-[color:var(--color-navy)]">{year}</td>
                  <td className="px-5 py-4 text-[color:var(--color-graphite)]">{formatTablePrice(current)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-3 ${
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
                          className={`h-8 w-8 shrink-0 ${direction === "down" ? "rotate-90" : ""}`}
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

export default function PriceLocationTemplate({ data }: { data: LocationPageData }) {
  const location = formatLocationForTemplate(data.location);
  const proseLocation = formatLocationForProse(data.location);
  const housePriceM2 = medianPricePerM2(data.houseMarket);
  const apartmentPriceM2 = medianPricePerM2(data.apartmentMarket);
  const housePrice = numeric(data.houseMarket?.median_preis_eur);
  const apartmentPrice = numeric(data.apartmentMarket?.median_preis_eur);
  const salesCount = totalSalesCount(data.houseMarket, data.apartmentMarket);
  const marketDays = daysOnMarket(data.houseMarket, data.apartmentMarket);
  const heroImage = "/images/immobilienbewertung/hero-background.png";
  const valuationHref = `/immobilienbewertung-${data.location.location_slug}`;
  const faqs = [
    {
      question: `Wie entwickeln sich die Immobilienpreise in ${proseLocation} aktuell?`,
      answer: `Die Immobilienpreise in ${proseLocation} hängen von Angebot, Nachfrage, Zinsen, Lagequalität und Objektzustand ab. Die dargestellten Werte zeigen eine Orientierung, ersetzen aber keine individuelle Bewertung deiner Immobilie.`,
    },
    {
      question: "Sind Angebotspreise gleich Verkaufspreise?",
      answer: "Nein. Angebotspreise sind die Preise, mit denen Immobilien am Markt angeboten werden. Der tatsächliche Verkaufspreis entsteht erst durch Nachfrage, Verhandlung, Käuferprüfung und Abschluss. Deshalb kann der erzielte Preis vom Angebotspreis abweichen.",
    },
    {
      question: `Was beeinflusst den Preis meiner Immobilie in ${proseLocation}?`,
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
      <section className="relative isolate overflow-hidden bg-[color:var(--color-section)]">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-right opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.50)_34%,rgba(255,255,255,0.18)_58%,rgba(255,255,255,0.04)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-8 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[1.42fr_0.58fr] lg:items-center lg:px-12">
          <div className="max-w-[62rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Immobilienpreise in {location}
            </p>
            <h1 className="mt-5 max-w-[22ch] break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              Immobilienpreise in {location}
            </h1>
            <p className="mt-7 max-w-[32rem] text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:max-w-[34rem] md:text-[1.35rem]">
              Aktuelle Preise, Entwicklung und klare Einordnung für Eigentümer in {proseLocation}.
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
              Die Immobilienpreise in {proseLocation} zeigen dir, wie sich der Markt entwickelt. Entscheidend ist jedoch, wo deine Immobilie heute konkret darin steht.
            </p>
          </div>
        </div>
      </section>

      <Section title={`Aktuelle Immobilienpreise in ${proseLocation}`}>
        <p>Die folgenden Werte geben dir eine erste Orientierung für den Immobilienmarkt in {proseLocation}.</p>
        <dl className="grid gap-4 md:grid-cols-4">
          <DataCard label="Hauspreis pro m²" value={formatEuroPerM2(housePriceM2)} />
          <DataCard label="Wohnungspreis pro m²" value={formatEuroPerM2(apartmentPriceM2)} />
          <DataCard label="Ø Angebotspreis Häuser" value={formatEuro(housePrice)} />
          <DataCard label="Ø Angebotspreis Wohnungen" value={formatEuro(apartmentPrice)} />
        </dl>
        <p>Die Werte basieren auf aktuellen Angebots- und Marktdaten. Der tatsächlich erzielbare Verkaufspreis kann davon abweichen und hängt immer von Lage, Zustand, Grundstück, Energie, Modernisierung und Nachfrage ab.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Der Markt gibt eine Richtung vor - aber nicht den genauen Wert deiner Immobilie.</p>
      </Section>

      <Section title={`Marktdaten für ${proseLocation}`} muted>
        <p>Neben dem Preis sind zwei Faktoren besonders wichtig: Wie aktiv ist der Markt - und wie schnell reagieren Käufer?</p>
        <dl className="grid gap-4 md:grid-cols-3">
          <DataCard label="Anzahl Verkäufe" value={formatSales(salesCount)} />
          <DataCard label="Ø Vermarktungsdauer" value={formatDays(marketDays)} />
          <DataCard label="Nachfrage" value={demandLabel(salesCount)} />
        </dl>
        <p>Viele Verkäufe und kurze Vermarktungszeiten sprechen für eine aktive Nachfrage. Längere Vermarktungszeiten zeigen, dass Preis, Präsentation und Verkaufsstrategie besonders sauber aufeinander abgestimmt sein müssen.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Der Preis allein entscheidet nicht. Entscheidend ist, wie der Markt auf diesen Preis reagiert.</p>
      </Section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
              Preisentwicklung in {proseLocation}
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
              So haben sich die Quadratmeterpreise für Häuser und Wohnungen in {proseLocation} in den letzten Jahren entwickelt.
            </p>
          </div>
          <div className="mt-10 grid gap-8">
            <article className="rounded-lg border border-[color:var(--color-brass)]/30 bg-white p-5 shadow-[0_18px_54px_-44px_rgba(27,48,64,0.48)] md:p-8">
              <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Hauspreise in {proseLocation}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-graphite)]">
                Medianpreis in Euro pro Quadratmeter. Reale Jahreswerte - keine bloßen Angebotspreise.
              </p>
              <div className="mt-5">
                <PriceHistoryChart title={`Hauspreise in ${proseLocation}`} rows={data.houseHistory} />
              </div>
            </article>
            <article className="rounded-lg border border-[color:var(--color-brass)]/30 bg-white p-5 shadow-[0_18px_54px_-44px_rgba(27,48,64,0.48)] md:p-8">
              <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Wohnungspreise in {proseLocation}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-graphite)]">
                Medianpreis in Euro pro Quadratmeter. Reale Jahreswerte - keine bloßen Angebotspreise.
              </p>
              <div className="mt-5">
                <PriceHistoryChart title={`Wohnungspreise in ${proseLocation}`} rows={data.apartmentHistory} />
              </div>
            </article>
          </div>
          <p className="mx-auto mt-9 max-w-4xl text-center text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
            Die Preisentwicklung zeigt, wie sich der Markt in {proseLocation} verändert hat. Für deinen Verkauf ist jedoch nicht der höchste Wert der letzten Jahre entscheidend, sondern der Preis, der heute realistisch erzielt werden kann.
          </p>
        </div>
      </section>

      <Section title={`Entwicklung der Quadratmeterpreise für Häuser in ${proseLocation}`} muted>
        <p>Die Tabelle zeigt die jährliche Entwicklung der Hauspreise in {proseLocation} und macht sichtbar, wie stark sich der Markt von Jahr zu Jahr verändern kann.</p>
        <PriceDevelopmentTable
          title={`Entwicklung der Quadratmeterpreise für Häuser in ${proseLocation}`}
          rows={data.houseHistory}
          currentPrice={housePriceM2}
        />
        <div className="mt-10">
          <PriceDevelopmentTable
            title={`Entwicklung der Quadratmeterpreise für Wohnungen in ${proseLocation}`}
            rows={data.apartmentHistory}
            currentPrice={apartmentPriceM2}
          />
        </div>
        <p className="text-sm leading-6">Quelle: Angebots- und Marktdaten. Stand: April 2026. Der tatsächlich erzielte Verkaufspreis kann vom Angebotspreis abweichen.</p>
        <p>Die Entwicklung zeigt eine klare Richtung. Für deinen Verkauf zählt jedoch nicht allein die Vergangenheit, sondern die aktuelle Nachfrage nach genau deiner Immobilie in {proseLocation}.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Preisdaten erklären den Markt. Die Bewertung erklärt deine Immobilie.</p>
      </Section>

      <Section title="Was bedeuten diese Immobilienpreise für dich als Eigentümer?">
        <p>Die dargestellten Immobilienpreise sind eine wichtige Orientierung. Sie beantworten aber nicht die entscheidende Frage: Welchen Preis kann deine Immobilie in {proseLocation} aktuell wirklich erzielen?</p>
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
            Deine Immobilie in {proseLocation} realistisch einordnen
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Wenn du wissen möchtest, wo deine Immobilie im aktuellen Markt in {proseLocation} steht, erstellen wir für dich eine klare Einschätzung: Preisrahmen, Nachfrage und sinnvolle Vorgehensweise.
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

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Häufige Fragen zu Immobilienpreisen in {proseLocation}
          </h2>
          <div className="mt-6 divide-y divide-[color:var(--color-brass)]/20 rounded-xl border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_70px_-64px_rgba(27,48,64,0.45)]">
            {faqs.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
