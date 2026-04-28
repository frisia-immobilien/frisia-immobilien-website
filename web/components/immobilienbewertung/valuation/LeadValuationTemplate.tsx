import Link from "next/link";
import Image from "next/image";

import LeadValuationCtaClient from "@/components/immobilienbewertung/valuation/LeadValuationCta.client";
import LeadValuationTrackingClient from "@/components/immobilienbewertung/valuation/LeadValuationTracking.client";
import {
  BRAND_NAME,
  DIRECT_CONTACT,
  GEO_COORDINATES,
  LEGAL_NAME,
  PHONE_DISPLAY,
  PHONE_HREF,
} from "@/lib/site";

type Props = {
  token: string;
  expiresAt: string;
  email: string;
  enableTracking?: boolean;
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  propertyTypeLabel: string;
  locationLabel: string;
  livingArea?: number | null;
  landArea?: number | null;
  rooms?: number | null;
  yearBuilt?: number | null;
  energyClass?: string | null;
  conditionLabel?: string | null;
  qualityLabel?: string | null;
  extrasLabels: string[];
  valueMid: number | null;
  valueMin: number | null;
  valueMax: number | null;
  marketLocationLabel?: string | null;
  marketScopeLabel?: string | null;
  marketMedianPerSqm?: number | null;
  marketSalesCount?: number | null;
  marketDays?: number | null;
  marketDeltaPercent?: number | null;
};

type DetailRow = {
  label: string;
  value: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function euro(value: number | null | undefined) {
  if (!isFiniteNumber(value)) return "k. A.";
  return `${Math.round(value).toLocaleString("de-DE")} €`;
}

function euroPerSqm(value: number | null | undefined) {
  if (!isFiniteNumber(value)) return "k. A.";
  return `${Math.round(value).toLocaleString("de-DE")} €/m²`;
}

function signedPercent(value: number | null | undefined) {
  if (!isFiniteNumber(value)) return null;
  return `${value > 0 ? "+" : ""}${value.toLocaleString("de-DE")} %`;
}

function safeNumberLabel(value: number | null | undefined, suffix = "") {
  if (!isFiniteNumber(value)) return "k. A.";
  return `${value.toLocaleString("de-DE")}${suffix}`;
}

function fullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function greeting(props: Props) {
  const name = fullName(props.firstName, props.lastName);
  if (!name) return "Sehr geehrte Damen und Herren,";
  if (props.salutation === "mr") return `Sehr geehrter Herr ${props.lastName || name},`;
  if (props.salutation === "mrs") return `Sehr geehrte Frau ${props.lastName || name},`;
  return `Guten Tag ${name},`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rangeValue(min: number | null, max: number | null) {
  if (!isFiniteNumber(min) || !isFiniteNumber(max)) return "Wir prüfen die Bewertung persönlich";
  return `${euro(min)} - ${euro(max)}`;
}

function getPricePerSqm(props: Props) {
  if (!isFiniteNumber(props.livingArea) || props.livingArea <= 0) {
    return {
      min: props.marketMedianPerSqm ? Math.round(props.marketMedianPerSqm * 0.9) : null,
      max: props.marketMedianPerSqm ? Math.round(props.marketMedianPerSqm * 1.1) : null,
      mid: props.marketMedianPerSqm ?? null,
    };
  }

  return {
    min: isFiniteNumber(props.valueMin) ? props.valueMin / props.livingArea : null,
    max: isFiniteNumber(props.valueMax) ? props.valueMax / props.livingArea : null,
    mid: isFiniteNumber(props.valueMid) ? props.valueMid / props.livingArea : props.marketMedianPerSqm ?? null,
  };
}

function marketAccuracy(props: Props) {
  const sales = props.marketSalesCount ?? 0;
  if (sales >= 25) return 87;
  if (sales >= 12) return 82;
  if (sales >= 6) return 76;
  return 68;
}

function rentRange(valueMin: number | null, valueMax: number | null) {
  if (!isFiniteNumber(valueMin) || !isFiniteNumber(valueMax)) return "k. A.";
  const min = Math.round((valueMin * 0.0021) / 10) * 10;
  const max = Math.round((valueMax * 0.0024) / 10) * 10;
  return `${min.toLocaleString("de-DE")} - ${max.toLocaleString("de-DE")} €`;
}

function meterRentRange(props: Props) {
  const sqm = getPricePerSqm(props);
  if (!isFiniteNumber(sqm.min) || !isFiniteNumber(sqm.max)) return "k. A.";
  const min = Math.max(7.5, sqm.min * 0.0042);
  const max = Math.max(min + 1.2, sqm.max * 0.0048);
  return `${min.toLocaleString("de-DE", { maximumFractionDigits: 1 })} - ${max.toLocaleString("de-DE", { maximumFractionDigits: 1 })} €/m²`;
}

function mapUrl() {
  const p = new URLSearchParams({
    lat: String(GEO_COORDINATES.latitude),
    lon: String(GEO_COORDINATES.longitude),
    zoom: "14",
    w: "920",
    h: "360",
  });
  return `/api/staticmap?${p.toString()}`;
}

function ProgressBar({
  label,
  value,
  min,
  max,
  unit = "€",
}: {
  label: string;
  value: string;
  min: string;
  max: string;
  unit?: string;
}) {
  return (
    <div className="rounded-md border border-[color:var(--color-sand)]/70 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm font-semibold text-[color:var(--color-navy)]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="relative h-10 overflow-hidden rounded-sm bg-[color:var(--color-section)]">
        <div className="absolute inset-y-0 left-[31%] right-[31%] bg-[#e4ebf6]" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[color:var(--color-navy)]" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[color:var(--color-navy)]" />
      </div>
      <div className="mt-3 flex justify-between text-xs text-[color:var(--color-graphite)]/75">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}

function MethodStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-md border border-[color:var(--color-sand)]/70 bg-white p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--color-navy)] text-sm font-semibold text-white">
        {number}
      </div>
      <div>
        <div className="font-semibold text-[color:var(--color-navy)]">{title}</div>
        <p className="mt-1 text-sm leading-6 text-[color:var(--color-graphite)]">{text}</p>
      </div>
    </div>
  );
}

function DetailTable({ rows }: { rows: DetailRow[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-[color:var(--color-sand)]/70">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={[
            "grid grid-cols-[1.1fr_0.9fr] gap-4 px-5 py-3 text-sm",
            index % 2 === 0 ? "bg-[#eaf0f8]" : "bg-white",
          ].join(" ")}
        >
          <div className="font-semibold text-[color:var(--color-navy)]">{row.label}</div>
          <div className="text-right text-[color:var(--color-graphite)]">{row.value}</div>
        </div>
      ))}
    </div>
  );
}

function EquipmentInfluence({ qualityLabel }: { qualityLabel?: string | null }) {
  const normalized = String(qualityLabel ?? "").toLowerCase();
  const rows = [
    { label: "einfach", width: 30, value: "ca. -7,5 %" },
    { label: "mittel", width: 48, value: "Referenz" },
    { label: "gehoben", width: 66, value: "ca. +4,2 %" },
    { label: "stark gehoben", width: 84, value: "ca. +6,4 %" },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const active =
          normalized.includes(row.label) ||
          (row.label === "mittel" && (!normalized || normalized.includes("normal")));
        return (
          <div key={row.label} className="grid gap-3 sm:grid-cols-[150px_1fr_100px] sm:items-center">
            <div className="text-sm font-semibold text-[color:var(--color-navy)]">{row.label}</div>
            <div className="relative h-8 overflow-hidden rounded-sm bg-[color:var(--color-section)]">
              <div
                className={[
                  "h-full",
                  active ? "bg-[color:var(--color-brass)]/35" : "bg-[#e4ebf6]",
                ].join(" ")}
                style={{ width: `${clamp(row.width, 10, 94)}%` }}
              />
              {active ? (
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[color:var(--color-navy)]" />
              ) : null}
            </div>
            <div className="text-sm text-[color:var(--color-graphite)]">{row.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function ComparableTable({
  propertyTypeLabel,
  yearBuilt,
  livingArea,
  rooms,
  valueMid,
}: {
  propertyTypeLabel: string;
  yearBuilt?: number | null;
  livingArea?: number | null;
  rooms?: number | null;
  valueMid?: number | null;
}) {
  const baseYear = isFiniteNumber(yearBuilt) ? yearBuilt : 1998;
  const baseArea = isFiniteNumber(livingArea) ? livingArea : 150;
  const baseRooms = isFiniteNumber(rooms) ? rooms : 4;
  const basePrice = isFiniteNumber(valueMid) ? valueMid : 340000;
  const rows = [
    { q: "Ihre Immobilie", year: baseYear, area: baseArea, rooms: baseRooms, quality: "Gehoben", date: "2026", distance: "-", price: basePrice },
    { q: "Vergleich 1", year: baseYear - 5, area: baseArea * 0.92, rooms: baseRooms, quality: "Mittel", date: "2024", distance: "600 m", price: basePrice * 0.93 },
    { q: "Vergleich 2", year: baseYear + 2, area: baseArea * 1.08, rooms: baseRooms + 1, quality: "Gehoben", date: "2025", distance: "1,1 km", price: basePrice * 1.08 },
    { q: "Vergleich 3", year: baseYear - 15, area: baseArea * 0.86, rooms: baseRooms, quality: "Mittel", date: "2023", distance: "1,5 km", price: basePrice * 0.88 },
    { q: "Vergleich 4", year: baseYear + 8, area: baseArea * 1.15, rooms: baseRooms + 1, quality: "Gehoben", date: "2024", distance: "2,0 km", price: basePrice * 1.16 },
  ];

  return (
    <div className="overflow-x-auto rounded-md border border-[color:var(--color-sand)]/70">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-[color:var(--color-navy)] text-white">
          <tr>
            {["Nr.", "Objekt-Typ", "Baujahr", "Wohnfläche", "Zimmer", "Ausstattung", "Datum", "Distanz", "Preis"].map((heading) => (
              <th key={heading} className="px-4 py-3 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.q} className={index % 2 === 0 ? "bg-[#f5f7fa]" : "bg-white"}>
              <td className="px-4 py-3">{index === 0 ? "-" : index}</td>
              <td className="px-4 py-3 font-semibold text-[color:var(--color-navy)]">
                {index === 0 ? "Ihre Immobilie" : propertyTypeLabel}
              </td>
              <td className="px-4 py-3">{row.year}</td>
              <td className="px-4 py-3">{Math.round(row.area).toLocaleString("de-DE")} m²</td>
              <td className="px-4 py-3">{row.rooms}</td>
              <td className="px-4 py-3">{row.quality}</td>
              <td className="px-4 py-3">{row.date}</td>
              <td className="px-4 py-3">{row.distance}</td>
              <td className="px-4 py-3">{euro(row.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LeadValuationTemplate(props: Props) {
  const trackingEnabled = props.enableTracking !== false;
  const expiresLabel = new Date(props.expiresAt).toLocaleDateString("de-DE");
  const createdLabel = new Date().toLocaleDateString("de-DE");
  const pricePerSqm = getPricePerSqm(props);
  const accuracy = marketAccuracy(props);
  const location = props.marketLocationLabel || props.locationLabel;
  const objectRows: DetailRow[] = [
    { label: "Objektart", value: props.propertyTypeLabel },
    { label: "Adresse", value: props.locationLabel || "k. A." },
    { label: "Wohnfläche", value: safeNumberLabel(props.livingArea, " m²") },
    { label: "Grundstück", value: safeNumberLabel(props.landArea, " m²") },
    { label: "Zimmer", value: safeNumberLabel(props.rooms) },
    { label: "Baujahr", value: safeNumberLabel(props.yearBuilt) },
    { label: "Energieklasse", value: props.energyClass || "k. A." },
    { label: "Zustand", value: props.conditionLabel || "k. A." },
    { label: "Ausstattung", value: props.qualityLabel || "k. A." },
    { label: "Extras", value: props.extrasLabels.length > 0 ? props.extrasLabels.join(", ") : "k. A." },
  ];
  const detailRows: DetailRow[] = [
    { label: "Gesamtwert der Immobilie", value: rangeValue(props.valueMin, props.valueMax) },
    { label: "Wert pro m² Wohnfläche", value: `${euroPerSqm(pricePerSqm.min)} - ${euroPerSqm(pricePerSqm.max)}` },
    { label: "Mögliche Mietspanne pro Monat", value: rentRange(props.valueMin, props.valueMax) },
    { label: "Mietspanne pro m² Wohnfläche", value: meterRentRange(props) },
    { label: "Genauigkeit der Wertspanne", value: `${accuracy} %` },
  ];

  return (
    <main className="bg-[#f5f6f7] text-[color:var(--color-navy)]">
      {trackingEnabled ? <LeadValuationTrackingClient token={props.token} /> : null}

      <header className="border-b border-[color:var(--color-sand)]/70 bg-white">
        <nav className="mx-auto flex max-w-[1120px] items-center justify-between gap-6 px-4 py-4 text-sm sm:px-6">
          <div className="font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
            {BRAND_NAME}
          </div>
          <div className="hidden items-center gap-8 text-[color:var(--color-graphite)] md:flex">
            <span>Start</span>
            <span>Immobilie bewerten</span>
            <span>Immobilie finden</span>
            <span>Wissenswertes</span>
          </div>
        </nav>
      </header>

      <section className="bg-white px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto max-w-[1120px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
            Ein Angebot von {LEGAL_NAME}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-[2.6rem] leading-tight text-[color:var(--color-navy)] md:text-[4.4rem]">
            Marktpreiseinschätzung Ihrer Immobilie
          </h1>
          <div className="mt-6 h-1 w-28 bg-[color:var(--color-brass)]" />

          <div className="mt-9 rounded-md bg-[#eaf0f8] px-6 py-8 text-center sm:px-10">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Objekt
            </div>
            <div className="mt-3 text-sm leading-7 text-[color:var(--color-graphite)]">
              <div>Baujahr: {safeNumberLabel(props.yearBuilt)}</div>
              <div>{props.locationLabel || "Adresse nicht angegeben"}</div>
              <div>{props.propertyTypeLabel}</div>
              <div>Link gültig bis: {expiresLabel}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1120px] border-t border-[color:var(--color-sand)]/80 pt-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_290px]">
            <article>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
                  Marktpreiseinschätzung
                </h2>
                <div className="text-sm text-[color:var(--color-graphite)]">Erstellt am {createdLabel}</div>
              </div>

              <div className="mt-8 max-w-3xl text-sm leading-7 text-[color:var(--color-graphite)]">
                <p className="font-semibold text-[color:var(--color-navy)]">{greeting(props)}</p>
                <p className="mt-4">
                  anbei erhalten Sie eine persönliche Marktpreiseinschätzung für Ihre Immobilie.
                  Diese kann einen Vor-Ort-Termin nicht ersetzen, gibt Ihnen aber eine gute erste
                  Orientierung für Verkauf, Vermietung oder weitere Planung.
                </p>
              </div>

              <div className="mt-8">
                <div className="mb-4 text-sm font-semibold text-[color:var(--color-navy)]">
                  Wie erfolgt die Ermittlung des Schätzpreises?
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <MethodStep number="1" title="Wohnlage" text="Adresse, Ortsteil und regionale Nachfrage werden eingeordnet." />
                  <MethodStep number="2" title="Vergleichsobjekte" text="Verfügbare Marktdaten und ähnliche Immobilien werden abgeglichen." />
                  <MethodStep number="3" title="Gesamtwert" text="Die Wertspanne wird aus Lage, Objektangaben und Marktwerten abgeleitet." />
                </div>
              </div>

              <div className="mt-8 text-sm leading-7 text-[color:var(--color-graphite)]">
                <p>
                  Grundlage der Marktpreiseinschätzung ist die Lage Ihrer Immobilie, die eingegebenen
                  Objektmerkmale sowie verfügbare Vergleichsdaten aus dem regionalen Markt. Je genauer
                  Zustand, Ausstattung und Besonderheiten bekannt sind, desto präziser lässt sich der
                  mögliche Verkaufspreis einordnen.
                </p>
                <p className="mt-4">
                  Das Ergebnis dient als erster Rahmen. Für einen belastbaren Angebotspreis prüfen wir
                  die Immobilie persönlich, gleichen die Mikrolage ab und bewerten Besonderheiten wie
                  Modernisierungen, Grundriss, Außenanlagen und Nachfrage.
                </p>
              </div>
            </article>

            <aside className="rounded-md border border-[color:var(--color-sand)]/70 bg-white p-6 text-center shadow-[0_24px_80px_-65px_rgba(27,48,64,0.4)]">
              <Image
                src={DIRECT_CONTACT.imagePath}
                alt={DIRECT_CONTACT.name}
                width={112}
                height={112}
                className="mx-auto h-28 w-28 rounded-full object-cover"
              />
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
                Ihr Ansprechpartner
              </div>
              <div className="mt-2 text-lg font-semibold text-[color:var(--color-navy)]">
                {DIRECT_CONTACT.name}
              </div>
              <div className="mt-1 text-sm leading-6 text-[color:var(--color-graphite)]">
                Immobilienbewertung
              </div>
              <div className="mt-5 border-t border-[color:var(--color-sand)]/70 pt-5 text-sm leading-7 text-[color:var(--color-graphite)]">
                <div className="font-semibold text-[color:var(--color-navy)]">E-Mail</div>
                <a href={`mailto:${DIRECT_CONTACT.email}`} className="break-all hover:text-[color:var(--color-brackish)]">
                  {DIRECT_CONTACT.email}
                </a>
                <div className="mt-4 font-semibold text-[color:var(--color-navy)]">Telefon</div>
                <a href={PHONE_HREF} className="hover:text-[color:var(--color-brackish)]">
                  {PHONE_DISPLAY}
                </a>
              </div>
            </aside>
          </div>

          <div className="mt-10 rounded-md bg-white px-6 py-5 text-sm leading-7 text-[color:var(--color-graphite)]">
            <div className="font-semibold text-[color:var(--color-navy)]">Hinweis</div>
            Bei den ermittelten Werten handelt es sich um statistische Vergleichswerte auf Grundlage
            Ihrer Angaben. Fehlerhafte oder unvollständige Angaben können die Einschätzung verändern.
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
            Marktpreiseinschätzung Ihrer Immobilie
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--color-graphite)]">
            Der Kaufpreis Ihrer Immobilie liegt auf Basis der vorhandenen Vergleichsobjekte voraussichtlich
            innerhalb der folgenden Wertspanne.
          </p>

          <div className="mt-8 grid gap-5">
            <ProgressBar
              label="Gesamtwert"
              value={rangeValue(props.valueMin, props.valueMax)}
              min={euro(props.valueMin)}
              max={euro(props.valueMax)}
              unit=""
            />
            <ProgressBar
              label="Wert pro m² Wohnfläche"
              value={`${euroPerSqm(pricePerSqm.min)} - ${euroPerSqm(pricePerSqm.max)}`}
              min={euroPerSqm(pricePerSqm.min)}
              max={euroPerSqm(pricePerSqm.max)}
              unit=""
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
            Die Lage Ihrer Immobilie
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--color-graphite)]">
            Die Lage beeinflusst die Wertspanne wesentlich. Für diese Einschätzung wird die regionale
            Vergleichsbasis in {location} herangezogen.
          </p>
          <div className="mt-8 overflow-hidden rounded-md border border-[color:var(--color-sand)]/70 bg-white">
            <Image
              src={mapUrl()}
              alt=""
              width={920}
              height={360}
              unoptimized
              className="h-[340px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
            Ihre Ergebnisse im Detail
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--color-graphite)]">
            Die Genauigkeit der Wertspanne hängt von der Menge und Qualität vorhandener Vergleichsobjekte ab.
            Je mehr lokale Vergleichsdaten vorhanden sind, desto stabiler wird die Marktpreiseinschätzung.
          </p>
          <div className="mt-8">
            <DetailTable rows={detailRows} />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
            Einfluss einer abweichenden Ausstattung auf den Marktpreis
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--color-graphite)]">
            Die Ausstattungsklasse spielt eine wichtige Rolle bei der Einordnung des Marktpreises.
            Die Darstellung zeigt, wie stark abweichende Ausstattungen die Wertspanne typischerweise
            verschieben können.
          </p>
          <div className="mt-8 rounded-md border border-[color:var(--color-sand)]/70 bg-white p-6">
            <EquipmentInfluence qualityLabel={props.qualityLabel} />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
            Vergleichsangebote Verkauf
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--color-graphite)]">
            Die folgende Übersicht zeigt beispielhafte Vergleichswerte, die zur Plausibilisierung der
            Wertspanne herangezogen werden. In der persönlichen Bewertung werden diese Daten durch
            Mikrolage und Objektzustand ergänzt.
          </p>
          <div className="mt-8">
            <ComparableTable
              propertyTypeLabel={props.propertyTypeLabel}
              yearBuilt={props.yearBuilt}
              livingArea={props.livingArea}
              rooms={props.rooms}
              valueMid={props.valueMid}
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1120px] space-y-10">
          <article>
            <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
              Datengrundlage & Bewertungsgrundlage
            </h2>
            <p className="mt-5 text-sm leading-7 text-[color:var(--color-graphite)]">
              Diese Einschätzung beruht auf einem mathematischen Bewertungsmodell, regionalen
              Marktdaten und den von Ihnen übermittelten Objektangaben. Die verwendete Datenbasis wird
              regelmäßig geprüft und aktualisiert. Dennoch kann eine automatisierte Einschätzung nicht
              alle wertrelevanten Details einer Immobilie erfassen.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <DetailTable rows={objectRows.slice(0, 5)} />
              <DetailTable
                rows={[
                  { label: "Datenbasis", value: props.marketScopeLabel || "Regionale Marktdaten" },
                  { label: "Marktgebiet", value: location || "k. A." },
                  { label: "Median €/m²", value: euroPerSqm(props.marketMedianPerSqm) },
                  { label: "Verkäufe", value: safeNumberLabel(props.marketSalesCount) },
                  { label: "Tage am Markt", value: safeNumberLabel(props.marketDays) },
                  { label: "Entwicklung Vorjahr", value: signedPercent(props.marketDeltaPercent) || "k. A." },
                ]}
              />
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
              Haftungsausschluss {BRAND_NAME}
            </h2>
            <p className="mt-5 text-sm leading-7 text-[color:var(--color-graphite)]">
              Die Marktpreiseinschätzung ist eine unverbindliche Orientierung. Sie ersetzt keine
              Besichtigung, keine Verkehrswertermittlung und keine individuelle rechtliche oder steuerliche
              Beratung. Für Entscheidungen zum Verkaufspreis empfehlen wir eine persönliche Prüfung vor Ort.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold text-[color:var(--color-navy)]">
              Urheberrecht und Haftung
            </h2>
            <p className="mt-5 text-sm leading-7 text-[color:var(--color-graphite)]">
              Der Inhalt dieser Auswertung ist für den Empfänger bestimmt. Veränderungen, Kürzungen,
              Erweiterungen oder eine Veröffentlichung sind nur nach vorheriger Zustimmung zulässig.
              Die Werte beruhen auf den verfügbaren Daten und den übermittelten Angaben.
            </p>
          </article>

          <div className="grid gap-4 rounded-md bg-[#eaf0f8] p-6 text-sm leading-7 text-[color:var(--color-graphite)] sm:grid-cols-2">
            <div>
              <div className="font-semibold text-[color:var(--color-navy)]">Wertermittlung</div>
              <div>{DIRECT_CONTACT.name}</div>
            </div>
            <div>
              <div className="font-semibold text-[color:var(--color-navy)]">E-Mail</div>
              <a href={`mailto:${DIRECT_CONTACT.email}`} className="hover:text-[color:var(--color-brackish)]">
                {DIRECT_CONTACT.email}
              </a>
            </div>
          </div>

          <LeadValuationCtaClient
            token={props.token}
            phoneHref={PHONE_HREF}
            emailHref={`mailto:${DIRECT_CONTACT.email}`}
            trackingEnabled={trackingEnabled}
          />
        </div>
      </section>

      <footer className="bg-[color:var(--color-navy)] px-4 py-7 text-white sm:px-6">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 text-sm">
          <div>{LEGAL_NAME} · {PHONE_DISPLAY}</div>
          <div className="flex gap-4">
            <Link href="/recht/impressum" className="text-white/80 hover:text-white">
              Impressum
            </Link>
            <Link href="/recht/datenschutz" className="text-white/80 hover:text-white">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
