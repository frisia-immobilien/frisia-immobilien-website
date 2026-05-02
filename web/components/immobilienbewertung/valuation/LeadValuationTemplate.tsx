import Link from "next/link";

import LeadCallbackTaskButton from "@/components/immobilienbewertung/valuation/LeadCallbackTaskButton.client";
import LeadContactChoiceClient from "@/components/immobilienbewertung/valuation/LeadContactChoice.client";
import LeadResultTrackingClient from "@/components/immobilienbewertung/valuation/LeadResultTracking.client";
import LeadValuationTrackingClient from "@/components/immobilienbewertung/valuation/LeadValuationTracking.client";
import {
  BRAND_NAME,
  DIRECT_CONTACT,
  LEGAL_NAME,
  PHONE_DISPLAY,
  PHONE_HREF,
} from "@/lib/site";

type Props = {
  token: string;
  expiresAt: string;
  email: string;
  phone?: string | null;
  enableTracking?: boolean;
  resultTrackingEnabled?: boolean;
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
  landSubTypeLabel?: string | null;
  landBodenrichtwertPerSqm?: number | null;
  landBodenrichtwertSourceLabel?: string | null;
  extrasLabels: string[];
  otherExtrasValueEur?: number | null;
  valueMid: number | null;
  valueMin: number | null;
  valueMax: number | null;
  marketLocationLabel?: string | null;
  marketScopeLabel?: string | null;
  marketMedianPerSqm?: number | null;
  marketPriceBasisLabel?: string | null;
  marketSalesCount?: number | null;
  marketDays?: number | null;
  marketDeltaPercent?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

type CtaVariant = "primary" | "secondary" | "quiet";

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

function safeNumberLabel(value: number | null | undefined, suffix = "") {
  if (!isFiniteNumber(value)) return "k. A.";
  return `${value.toLocaleString("de-DE")}${suffix}`;
}

function yearLabel(value: number | null | undefined) {
  if (!isFiniteNumber(value)) return "k. A.";
  return String(value);
}

function rangeValue(min: number | null, max: number | null) {
  if (!isFiniteNumber(min) || !isFiniteNumber(max)) {
    return "Persönliche Prüfung erforderlich";
  }

  return `${euro(min)} - ${euro(max)}`;
}

function evaluatedAddressLabel(value: string) {
  const label = value.trim();
  if (!label) return null;

  const parts = label.split(" · ").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;

  return label;
}

function signedEuro(value: number | null | undefined) {
  if (!isFiniteNumber(value)) return "k. A.";
  const rounded = Math.round(value / 1000) * 1000;
  if (rounded === 0) return "Referenz";
  return `${rounded > 0 ? "+" : "-"}${Math.abs(rounded).toLocaleString("de-DE")} €`;
}

function percentLabel(value: number) {
  if (value === 0) return "Referenz";
  return `ca. ${value > 0 ? "+" : "-"}${Math.abs(value * 100).toLocaleString("de-DE", {
    maximumFractionDigits: 1,
  })} %`;
}

function normalizedLabel(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function qualityStage(value: string | null | undefined) {
  const normalized = normalizedLabel(value);
  if (normalized.includes("einfach") || normalized.includes("basic")) return "einfach";
  if (normalized.includes("stark") || normalized.includes("luxus") || normalized.includes("premium")) {
    return "stark gehoben";
  }
  if (normalized.includes("gehoben") || normalized.includes("hoch") || normalized.includes("high")) {
    return "gehoben";
  }
  if (normalized.includes("mittel") || normalized.includes("normal") || normalized.includes("standard")) return "mittel";
  return null;
}

function hasAutomaticValue(props: Props) {
  return isFiniteNumber(props.valueMin) && isFiniteNumber(props.valueMax) && isFiniteNumber(props.valueMid);
}

function isLandValuation(props: Props) {
  return normalizedLabel(props.propertyTypeLabel).includes("grundstueck");
}

function pricePerSqmRange(props: Props) {
  if (isFiniteNumber(props.livingArea) && props.livingArea > 0) {
    return {
      min: isFiniteNumber(props.valueMin) ? props.valueMin / props.livingArea : null,
      max: isFiniteNumber(props.valueMax) ? props.valueMax / props.livingArea : null,
    };
  }

  return {
    min: isFiniteNumber(props.marketMedianPerSqm) ? props.marketMedianPerSqm * 0.9 : null,
    max: isFiniteNumber(props.marketMedianPerSqm) ? props.marketMedianPerSqm * 1.1 : null,
  };
}

function landPricePerSqmRange(props: Props) {
  if (!isFiniteNumber(props.landArea) || props.landArea <= 0) return { min: null, max: null };
  return {
    min: isFiniteNumber(props.valueMin) ? props.valueMin / props.landArea : null,
    max: isFiniteNumber(props.valueMax) ? props.valueMax / props.landArea : null,
  };
}

function rentPerSqmRange(props: Props) {
  const sqm = pricePerSqmRange(props);
  if (!isFiniteNumber(sqm.min) || !isFiniteNumber(sqm.max)) return { min: null, max: null };

  const min = Math.max(7.5, sqm.min * 0.00208);
  const max = Math.max(min + 1.2, sqm.max * 0.00219);
  return { min, max };
}

function formatDecimalEuro(value: number | null | undefined) {
  if (!isFiniteNumber(value)) return "k. A.";
  return `${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function monthlyRentRange(props: Props) {
  const rent = rentPerSqmRange(props);
  if (!isFiniteNumber(rent.min) || !isFiniteNumber(rent.max) || !isFiniteNumber(props.livingArea)) {
    return "k. A.";
  }

  return `${euro(rent.min * props.livingArea)} - ${euro(rent.max * props.livingArea)}`;
}

function landErschliessungLabel(value: string | null | undefined) {
  const normalized = normalizedLabel(value);
  if (!normalized) return null;
  if (normalized.includes("teilerschlossen")) return "Teilerschlossen";
  if (normalized.includes("nicht") || normalized.includes("unerschlossen")) return "Unerschlossen";
  if (normalized.includes("erschlossen")) return "Erschlossen";
  return value;
}

function landBebaubarkeitLabel(value: string | null | undefined) {
  const normalized = normalizedLabel(value);
  if (!normalized) return null;
  if (normalized.includes("kurzfristig")) return "Kurzfristig bebaubar";
  if (normalized.includes("eingeschraenkt")) return "Eingeschränkt bebaubar";
  if (normalized.includes("nicht_bebaubar") || normalized.includes("nicht bebaubar")) return "Nicht bebaubar";
  if (normalized.includes("unbekannt")) return "Unbekannt";
  return null;
}

function landBebauungsgebietLabel(value: string | null | undefined) {
  const normalized = normalizedLabel(value);
  if (!normalized) return null;
  if (normalized.includes("wohn")) return "Wohngebiet";
  if (normalized.includes("misch")) return "Mischgebiet";
  if (normalized.includes("gewerbe")) return "Gewerbegebiet";
  return null;
}

function personName(props: Pick<Props, "firstName" | "lastName">) {
  return [props.firstName, props.lastName].filter(Boolean).join(" ").trim();
}

function ctaClasses(variant: CtaVariant) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-center text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-brackish)]";

  if (variant === "secondary") {
    return `${base} border border-[color:var(--color-sand)] bg-white text-[color:var(--color-navy)] hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)]`;
  }

  if (variant === "quiet") {
    return `${base} bg-white/12 text-white ring-1 ring-white/22 hover:bg-white/18`;
  }

  return `${base} bg-[color:var(--color-navy)] text-white shadow-[0_18px_42px_-28px_rgba(27,48,64,0.7)] hover:bg-[color:var(--color-brackish)]`;
}

function PrimaryCta({
  children,
  href = "#kontakt-optionen",
  variant = "primary",
  event = "primary_cta_clicked",
}: {
  children: string;
  href?: string;
  variant?: CtaVariant;
  event?: "primary_cta_clicked" | "callback_cta_clicked";
}) {
  return (
    <a href={href} data-lead-event={event} className={ctaClasses(variant)}>
      {children}
    </a>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.1rem] leading-[1.08] text-[color:var(--color-navy)] sm:text-[2.75rem]">
        {title}
      </h2>
      {text ? (
        <p className="mt-5 text-[1rem] leading-[1.75] text-[color:var(--color-graphite)] sm:text-[1.08rem]">
          {text}
        </p>
      ) : null}
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-md border border-[color:var(--color-sand)]/70 bg-white p-5 shadow-[0_22px_80px_-70px_rgba(27,48,64,0.35)] sm:p-6">
      <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-graphite)]">{text}</p>
    </article>
  );
}

function StepItem({ number, text }: { number: string; text: string }) {
  return (
    <li className="flex gap-4 rounded-md bg-white p-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--color-navy)] text-sm font-semibold text-white">
        {number}
      </span>
      <span className="pt-1 text-sm leading-7 text-[color:var(--color-graphite)]">{text}</span>
    </li>
  );
}

function DetailPill({ label, value, note }: { label: string; value: string; note?: string | null }) {
  return (
    <div className="rounded-md bg-white/72 px-4 py-3">
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[color:var(--color-navy)]">{value}</div>
      {note ? <div className="mt-1 text-xs leading-5 text-[color:var(--color-graphite)]">{note}</div> : null}
    </div>
  );
}

function TrustPoint({ children }: { children: string }) {
  return (
    <li className="flex gap-3 text-sm leading-7 text-[color:var(--color-graphite)]">
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-brass)]" />
      <span>{children}</span>
    </li>
  );
}

function PriceBox({ props }: { props: Props }) {
  return (
    <aside
      id="preisbox"
      className="rounded-md border border-[color:var(--color-sand)]/80 bg-white p-5 shadow-[0_35px_90px_-65px_rgba(27,48,64,0.42)] sm:p-7"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
        Deine aktuelle Marktwert-Spanne
      </p>
      <div
        id="price-range-section"
        className="mt-4 font-[family-name:var(--font-playfair)] text-[2.45rem] leading-[1.02] text-[color:var(--color-navy)] sm:text-[3.3rem]"
      >
        {rangeValue(props.valueMin, props.valueMax)}
      </div>
      <p className="mt-4 text-sm font-semibold text-[color:var(--color-navy)]">
        Mittelwert der Einschätzung: {euro(props.valueMid)}
      </p>
      <p className="mt-5 text-sm leading-7 text-[color:var(--color-graphite)]">
        Diese Spanne zeigt den Bereich, in dem deine Immobilie nach aktueller Datenlage realistisch liegen kann.
      </p>
      <p className="mt-4 border-l-4 border-[color:var(--color-brass)] pl-4 text-sm font-semibold leading-7 text-[color:var(--color-navy)]">
        Entscheidend ist jetzt, ob der obere Bereich der Spanne erreichbar ist oder ob durch falsche Einpreisung Geld verschenkt wird.
      </p>
    </aside>
  );
}

function ManualReviewBox() {
  return (
    <aside
      id="preisbox"
      className="rounded-md border border-[color:var(--color-sand)]/80 bg-white p-5 shadow-[0_35px_90px_-65px_rgba(27,48,64,0.42)] sm:p-7"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
        Persönliche Prüfung
      </p>
      <div
        id="price-range-section"
        className="mt-4 font-[family-name:var(--font-playfair)] text-[2.35rem] leading-[1.04] text-[color:var(--color-navy)] sm:text-[3rem]"
      >
        Keine pauschale Online-Schätzung
      </div>
      <p className="mt-5 text-sm leading-7 text-[color:var(--color-graphite)]">
        Die Datenlage reicht für eine belastbare automatische Einschätzung nicht aus. Deshalb prüfen wir deine Immobilie persönlich.
      </p>
      <p className="mt-4 border-l-4 border-[color:var(--color-brass)] pl-4 text-sm font-semibold leading-7 text-[color:var(--color-navy)]">
        Das ist kein Nachteil. Bei besonderen Immobilien ist eine persönliche Prüfung deutlich sinnvoller als ein ungenauer Rechnerwert.
      </p>
      <div className="mt-6">
        <PrimaryCta>Persönliche Einschätzung anfragen</PrimaryCta>
      </div>
    </aside>
  );
}

function ObjectSummary({ props }: { props: Props }) {
  const expiresLabel = new Date(props.expiresAt).toLocaleDateString("de-DE");
  const location = props.marketLocationLabel || props.locationLabel || "Region Ostfriesland";
  const automaticValue = hasAutomaticValue(props);
  const isLand = isLandValuation(props);
  const sqm = pricePerSqmRange(props);
  const landSqm = landPricePerSqmRange(props);
  const rent = rentPerSqmRange(props);
  const evaluatedAddress = evaluatedAddressLabel(props.locationLabel);
  const additionalValueLabel = isFiniteNumber(props.otherExtrasValueEur) && props.otherExtrasValueEur > 0
    ? `Angegebener Zusatzwert: ${euro(props.otherExtrasValueEur)}`
    : null;
  const landErschliessung = landErschliessungLabel(props.conditionLabel);
  const landBebaubarkeit = landBebaubarkeitLabel(props.landSubTypeLabel);
  const landBebauungsgebiet = landBebauungsgebietLabel(props.landSubTypeLabel);
  const landBodenrichtwertSource = isFiniteNumber(props.landBodenrichtwertPerSqm)
    ? props.landBodenrichtwertSourceLabel || "Quelle: BORIS Bodenrichtwert"
    : null;

  return (
    <div className="space-y-4">
      {evaluatedAddress || additionalValueLabel ? (
        <p className="text-sm leading-7 text-[color:var(--color-navy)] sm:text-base">
          {evaluatedAddress ? `Deine Angaben. Bewertet wurde: ${evaluatedAddress}` : "Deine Angaben."}
          {additionalValueLabel ? ` · ${additionalValueLabel}` : null}
        </p>
      ) : null}
      <div className="grid gap-3 rounded-md bg-[#eaf0f8] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailPill label="Immobilie" value={props.propertyTypeLabel} />
        <DetailPill label="Ort" value={location} />
        {isLand ? (
          <>
            <DetailPill label="Grundstück" value={safeNumberLabel(props.landArea, " m²")} />
            <DetailPill
              label="Bodenrichtwert (BORIS)"
              value={euroPerSqm(props.landBodenrichtwertPerSqm)}
              note={landBodenrichtwertSource}
            />
            {landErschliessung ? <DetailPill label="Erschließung" value={landErschliessung} /> : null}
            {landBebaubarkeit ? <DetailPill label="Bebaubarkeit" value={landBebaubarkeit} /> : null}
            {landBebauungsgebiet ? <DetailPill label="Bebauungsgebiet" value={landBebauungsgebiet} /> : null}
          </>
        ) : (
          <>
            <DetailPill label="Wohnfläche" value={safeNumberLabel(props.livingArea, " m²")} />
            <DetailPill label="Grundstück" value={safeNumberLabel(props.landArea, " m²")} />
            <DetailPill label="Baujahr" value={yearLabel(props.yearBuilt)} />
            <DetailPill label="Zustand" value={props.conditionLabel || "k. A."} />
            <DetailPill label="Ausstattung" value={props.qualityLabel || "k. A."} />
          </>
        )}
        <DetailPill label="Bewertungslink gültig bis" value={expiresLabel} />
      </div>
      {automaticValue ? (
        <div className="grid gap-3 rounded-md bg-[#eaf0f8] p-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLand ? (
            <>
              <DetailPill label="Wertspanne Grundstück" value={rangeValue(props.valueMin, props.valueMax)} />
              <DetailPill label="Wert pro m² Grundstück" value={`${euroPerSqm(landSqm.min)} - ${euroPerSqm(landSqm.max)}`} />
              <DetailPill
                label="Bewertungsbasis"
                value="Bodenrichtwert + Grundstücksangaben"
                note="Erschließung, Bebaubarkeit und Gebietstyp werden als Zu- oder Abschläge berücksichtigt."
              />
            </>
          ) : (
            <>
              <DetailPill label="Gesamtwert der Immobilie" value={rangeValue(props.valueMin, props.valueMax)} />
              <DetailPill label="Wert pro m² Wohnfläche" value={`${euroPerSqm(sqm.min)} - ${euroPerSqm(sqm.max)}`} />
              <DetailPill label="Mögliche Mietspanne pro Monat" value={monthlyRentRange(props)} />
              <DetailPill label="Mietspanne pro m² Wohnfläche" value={`${formatDecimalEuro(rent.min)} - ${formatDecimalEuro(rent.max)}`} />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ContactOptions() {
  const emailSubject = "Rückruf zur Einschätzung meiner Immobilie";
  const emailBody = [
    "Guten Tag,",
    "",
    "ich habe online eine erste Einschätzung meiner Immobilie erhalten und würde diese gerne persönlich mit Ihnen besprechen.",
    "",
    "Bitte rufen Sie mich dazu kurz zurück.",
    "",
    "Vielen Dank und freundliche Grüße",
  ].join("\n");
  const emailHref = `mailto:${DIRECT_CONTACT.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div
      id="kontakt-optionen"
      className="grid gap-4 rounded-md bg-[color:var(--color-cream)]/72 p-4 sm:grid-cols-2 sm:p-5"
    >
      <a
        href={PHONE_HREF}
        data-lead-event="callback_cta_clicked"
        className="rounded-md border border-[color:var(--color-sand)]/80 bg-white px-5 py-5 text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brackish)]"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
          Telefon
        </div>
        <div className="mt-3 text-2xl font-semibold">{PHONE_DISPLAY}</div>
        <div className="mt-3 text-sm leading-7 text-[color:var(--color-graphite)]">
          Direkt anrufen und Einschätzung persönlich einordnen.
        </div>
      </a>
      <a
        href={emailHref}
        data-lead-event="callback_cta_clicked"
        className="rounded-md border border-[color:var(--color-sand)]/80 bg-white px-5 py-5 text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brackish)]"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
          E-Mail
        </div>
        <div className="mt-3 text-2xl font-semibold">Rückruf abstimmen</div>
        <div className="mt-3 text-sm leading-7 text-[color:var(--color-graphite)]">
          Kurze E-Mail senden, wir melden uns persönlich.
        </div>
      </a>
    </div>
  );
}

function EquipmentImpactTool({ props }: { props: Props }) {
  const activeStage = qualityStage(props.qualityLabel);
  const rows = [
    {
      label: "einfach",
      adjustment: -0.075,
      fillStart: "10%",
      fillWidth: "34%",
      hint: "einfache Ausstattung",
    },
    {
      label: "mittel",
      adjustment: 0,
      fillStart: "31%",
      fillWidth: "34%",
      hint: "Referenz",
    },
    {
      label: "gehoben",
      adjustment: 0.042,
      fillStart: "46%",
      fillWidth: "34%",
      hint: "gehobene Ausstattung",
    },
    {
      label: "stark gehoben",
      adjustment: 0.064,
      fillStart: "58%",
      fillWidth: "34%",
      hint: "sehr hochwertige Ausstattung",
    },
  ];

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px] rounded-md border border-[color:var(--color-sand)]/80 bg-white p-5 shadow-[0_28px_90px_-76px_rgba(27,48,64,0.45)] sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Preisverhandlung"
              title="Ausstattung als Preishebel"
              text="Die Ausstattung ist einer der Punkte, die Käufer in Verhandlungen besonders schnell bewerten. Deshalb prüfen wir, ob die angegebene Ausstattung den oberen Bereich der Spanne stützt."
            />
            <p className="mt-5 border-l-4 border-[color:var(--color-brass)] pl-4 text-sm font-semibold leading-7 text-[color:var(--color-navy)]">
              Genau hier entsteht oft Verhandlungsspielraum: gute Nachweise, klare Modernisierungen und eine passende Präsentation können den Preisbereich stärken.
            </p>
            <div className="mt-6">
              <PrimaryCta>Ausstattung und Preishebel prüfen lassen</PrimaryCta>
            </div>
          </div>

          <div className="grid gap-4">
            {rows.map((row) => {
              const isActive = activeStage === row.label;
              const impact = isFiniteNumber(props.valueMid) ? props.valueMid * row.adjustment : null;
              const label =
                row.adjustment === 0
                  ? rangeValue(props.valueMin, props.valueMax)
                  : `${percentLabel(row.adjustment)} · ${signedEuro(impact)}`;

              return (
                <div
                  key={row.label}
                  className={[
                    "grid gap-3 rounded-md border p-4 sm:grid-cols-[150px_1fr] sm:items-center",
                    isActive
                      ? "border-[color:var(--color-brass)] bg-[#fbf8f0]"
                      : "border-[color:var(--color-sand)]/70 bg-[#f7f9fb]",
                  ].join(" ")}
                >
                  <div>
                    <div className="text-base font-semibold text-[color:var(--color-navy)]">{row.label}</div>
                    <div className="mt-1 text-xs leading-5 text-[color:var(--color-graphite)]">{row.hint}</div>
                    {isActive ? (
                      <div className="mt-2 inline-flex rounded-full bg-[color:var(--color-navy)] px-3 py-1 text-xs font-semibold text-white">
                        deine Angabe
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <div className="relative h-14 overflow-hidden rounded-sm bg-white">
                      <div
                        className="absolute inset-y-0 bg-[#e6eefb]"
                        style={{ left: row.fillStart, width: row.fillWidth }}
                      />
                      {isActive ? (
                        <>
                          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[color:var(--color-navy)]" />
                          <div className="absolute left-1/2 top-0 h-3 w-6 -translate-x-1/2 bg-[color:var(--color-navy)] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                          <div className="absolute bottom-0 left-1/2 h-3 w-6 -translate-x-1/2 bg-[color:var(--color-navy)] [clip-path:polygon(50%_0,0_100%,100%_100%)]" />
                        </>
                      ) : null}
                      <div className="absolute inset-0 grid place-items-center px-3 text-center text-sm font-semibold text-[color:var(--color-navy)] sm:text-base">
                        {label}
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[color:var(--color-graphite)]">
                      Orientierung gegenüber mittlerer Ausstattung. Die konkrete Wirkung prüfen wir anhand von Zustand, Nachweisen und Käuferzielgruppe.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function DataBasisSection({ props }: { props: Props }) {
  const isLand = isLandValuation(props);
  const marketLocation = props.marketLocationLabel || props.locationLabel || "Aurich und Ostfriesland";
  const marketScope = props.marketScopeLabel || "regionale Marktdaten";
  const marketPriceBasisLabel = props.marketPriceBasisLabel || "Medianwert";
  const landErschliessung = landErschliessungLabel(props.conditionLabel);
  const landBebaubarkeit = landBebaubarkeitLabel(props.landSubTypeLabel);
  const landBebauungsgebiet = landBebauungsgebietLabel(props.landSubTypeLabel);
  const marketFacts = [
    !isLand && isFiniteNumber(props.marketMedianPerSqm)
      ? `${marketPriceBasisLabel}: ${euroPerSqm(props.marketMedianPerSqm)}`
      : null,
    !isLand && isFiniteNumber(props.marketSalesCount)
      ? `berücksichtigte Marktbewegungen: ${props.marketSalesCount.toLocaleString("de-DE")}`
      : null,
    !isLand && isFiniteNumber(props.marketDays)
      ? `typische Vermarktungsdauer: ${props.marketDays.toLocaleString("de-DE")} Tage`
      : null,
    isLand && isFiniteNumber(props.landBodenrichtwertPerSqm)
      ? `Bodenrichtwert nach BORIS: ${euroPerSqm(props.landBodenrichtwertPerSqm)}`
      : null,
    isLand && isFiniteNumber(props.landArea) ? `Grundstücksfläche: ${safeNumberLabel(props.landArea, " m²")}` : null,
    isLand && landErschliessung ? `Erschließung: ${landErschliessung}` : null,
    isLand && landBebaubarkeit ? `Bebaubarkeit: ${landBebaubarkeit}` : null,
    isLand && landBebauungsgebiet ? `Bebauungsgebiet: ${landBebauungsgebiet}` : null,
  ].filter(Boolean);

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px] rounded-md border border-[color:var(--color-sand)]/80 bg-white p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <SectionHeader
            eyebrow="Grundlage"
            title="Datengrundlage & Bewertungsgrundlage"
            text={
              isLand
                ? "Diese Einschätzung beruht auf dem für die Lage ermittelten BORIS-Bodenrichtwert und deinen übermittelten Grundstücksangaben."
                : "Diese Einschätzung beruht auf einem mathematischen Bewertungsmodell, regionalen Marktdaten und deinen übermittelten Angaben."
            }
          />
          <div className="space-y-7 text-sm leading-7 text-[color:var(--color-graphite)]">
            <article>
              <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">Bewertungsgrundlage</h3>
              <p className="mt-3">
                {isLand ? (
                  <>
                    Das Modell nutzt den für {marketLocation} ermittelten Bodenrichtwert aus BORIS als Ausgangswert.
                    Dazu kommen Grundstücksfläche, Erschließung, Bebaubarkeit und Gebietstyp. Daraus entsteht eine erste
                    rechnerische Wertspanne.
                  </>
                ) : (
                  <>
                    Das Modell nutzt die vorhandenen Frisia-Marktdaten für {marketLocation}, die gewählte Datenebene
                    {" "}{marketScope} sowie Angaben zu Objektart, Wohnfläche, Grundstück, Baujahr, Zustand und Ausstattung.
                    Daraus entsteht eine erste rechnerische Wertspanne.
                  </>
                )}
              </p>
              {marketFacts.length > 0 ? (
                <p className="mt-3 font-semibold text-[color:var(--color-navy)]">
                  {marketFacts.join(" · ")}
                </p>
              ) : null}
            </article>

            <article className="border-t border-[color:var(--color-sand)]/70 pt-7">
              <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">
                Haftungsausschluss {BRAND_NAME}
              </h3>
              <p className="mt-3">
                {LEGAL_NAME} übernimmt keine Haftung für unzutreffende oder unvollständige Angaben durch den Nutzer
                und daraus entstehende Abweichungen. Die berechneten Ergebnisse ersetzen keine Vor-Ort-Ermittlung,
                keine Verkehrswertermittlung und keine rechtliche oder steuerliche Beratung.
              </p>
            </article>

            <article className="border-t border-[color:var(--color-sand)]/70 pt-7">
              <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">Urheberrecht und Haftung</h3>
              <p className="mt-3">
                Der Inhalt dieser Ergebnisseite unterliegt dem Urheberrecht. Veränderungen, Kürzungen, Erweiterungen
                oder eine Veröffentlichung bedürfen der vorherigen Einwilligung von {LEGAL_NAME}.
              </p>
              <p className="mt-3">
                Es handelt sich um das Ergebnis einer automatisierten Ersteinschätzung. Eine entsprechende Überprüfung
                der Angaben, zum Beispiel durch einen Termin vor Ort, ist noch nicht erfolgt. Eine Gewähr für die
                Richtigkeit der dargestellten Daten kann deshalb nicht übernommen werden.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LeadValuationTemplate(props: Props) {
  const trackingEnabled = props.enableTracking !== false;
  const automaticValue = hasAutomaticValue(props);
  const isLand = isLandValuation(props);
  const heroEyebrow = automaticValue ? "Deine Marktwerteinschätzung" : "Persönliche Prüfung erforderlich";
  const heroHeadline = automaticValue
    ? "Deine erste Wertspanne ist vorbereitet."
    : "Deine Angaben sind eingegangen.";
  const heroSubline = automaticValue
    ? isLand
      ? "Auf Grundlage des BORIS-Bodenrichtwerts und deiner Grundstücksangaben ergibt sich eine erste realistische Einschätzung. Den genauen Verkaufspreis klären wir im nächsten Schritt persönlich."
      : "Auf Grundlage deiner Angaben und der verfügbaren Marktdaten ergibt sich eine erste realistische Einschätzung. Den genauen Verkaufspreis klären wir im nächsten Schritt persönlich."
    : "Für diese Immobilie erstellen wir keine pauschale Online-Schätzung. Die Datenlage reicht für eine belastbare automatische Einschätzung nicht aus. Deshalb prüfen wir deine Immobilie persönlich.";

  return (
    <main className="bg-[#f6f8fa] text-[color:var(--color-navy)]">
      <style>{'[data-site-main-nav="true"],[data-site-mobile-menu="true"]{display:none!important;}'}</style>
      {trackingEnabled ? <LeadValuationTrackingClient token={props.token} /> : null}
      {props.resultTrackingEnabled ? (
        <LeadResultTrackingClient token={props.token} manualReview={!automaticValue} />
      ) : null}

      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#edf3f8_100%)] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto grid max-w-[1180px] gap-7 lg:grid-cols-[1fr_450px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              {heroEyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-playfair)] text-[2.85rem] leading-[0.96] text-[color:var(--color-navy)] sm:text-[4rem] lg:text-[4.9rem]">
              {heroHeadline}
            </h1>
            <div className="mt-6 h-1 w-28 bg-[color:var(--color-brass)]" />
            <p className="mt-6 max-w-2xl text-[1.05rem] leading-[1.75] text-[color:var(--color-graphite)] sm:text-[1.18rem]">
              {heroSubline}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryCta>
                {automaticValue ? "Jetzt realistischen Verkaufspreis klären" : "Persönliche Einschätzung anfragen"}
              </PrimaryCta>
              <PrimaryCta href="#kontakt-optionen" variant="secondary" event="callback_cta_clicked">
                Rückruf vereinbaren
              </PrimaryCta>
            </div>
          </div>

          {automaticValue ? <PriceBox props={props} /> : <ManualReviewBox />}
        </div>
      </section>

      <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <ObjectSummary props={props} />
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeader
            title={automaticValue ? "Was bedeutet diese Spanne für dich?" : "Warum wir persönlich prüfen"}
            text={
              automaticValue
                ? isLand
                  ? "Die angezeigte Spanne ist eine erste Orientierung. Sie ersetzt keine persönliche Bewertung, weil Zuschnitt, Baurecht, Erschließung, Mikrolage und Käufernachfrage den tatsächlichen Verkaufspreis deutlich verändern können."
                  : "Die angezeigte Spanne ist eine erste Orientierung. Sie ersetzt keine persönliche Bewertung, weil Zustand, Ausstattung, Unterlagen, Mikrolage und Käufernachfrage den tatsächlichen Verkaufspreis deutlich verändern können."
                : "Gerade bei besonderen Immobilien, fehlenden Marktdaten, abweichendem Zustand oder spezieller Lage ist eine persönliche Prüfung deutlich sinnvoller als ein ungenauer Rechnerwert."
            }
          />
          <p className="mt-5 max-w-3xl border-l-4 border-[color:var(--color-brass)] pl-4 text-base font-semibold leading-8 text-[color:var(--color-navy)]">
            Du musst dich nicht durch Zahlen arbeiten. Wir ordnen das für dich ein und sagen dir klar, welcher Preis sinnvoll ist.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Marktwert"
              text="Die Spanne zeigt, wo deine Immobilie aktuell wahrscheinlich einzuordnen ist."
            />
            <InfoCard
              title="Preisstrategie"
              text="Der Angebotspreis entscheidet darüber, ob Nachfrage entsteht oder der Verkauf ins Stocken gerät."
            />
            <InfoCard
              title="Sicherheit"
              text="Vor einer Preisentscheidung prüfen wir die Details, damit du weder zu niedrig noch zu hoch startest."
            />
          </div>
        </div>
      </section>

      {automaticValue ? (
        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[980px] rounded-md border border-[color:var(--color-sand)]/80 bg-[#f6f8fa] p-6 text-center sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Die entscheidende Frage ist jetzt:
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-[2.1rem] leading-[1.08] text-[color:var(--color-navy)] sm:text-[3.1rem]">
              Soll deine Immobilie im oberen Bereich der Spanne verkauft werden oder wird Potenzial verschenkt?
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[color:var(--color-graphite)]">
              {isLand
                ? "Das lässt sich nicht seriös durch einen Rechner entscheiden. Dafür braucht es die persönliche Prüfung von Baurecht, Lage, Zuschnitt, Unterlagen, Zielgruppe und aktueller Nachfrage."
                : "Das lässt sich nicht seriös durch einen Rechner entscheiden. Dafür braucht es die persönliche Prüfung von Zustand, Lage, Unterlagen, Zielgruppe und aktueller Nachfrage."}
            </p>
            <div className="mt-7">
              <PrimaryCta>Oberen Preisbereich prüfen lassen</PrimaryCta>
            </div>
            <p className="mt-4 text-sm text-[color:var(--color-graphite)]">
              Ein kurzes Gespräch reicht oft, um die Einschätzung deutlich besser einzuordnen.
            </p>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeader
            title="Warum der genaue Wert persönlich geprüft werden sollte"
            text={
              isLand
                ? "Schon kleine Unterschiede können den erzielbaren Preis verändern. Baurecht, Zuschnitt, Erschließung, Mikrolage und vollständige Unterlagen können die Einschätzung deutlich verändern."
                : "Schon kleine Unterschiede können den erzielbaren Preis verändern. Eine modernisierte Heizung, ein guter Grundriss, eine ruhige Mikrolage oder vollständige Unterlagen können die Einschätzung verbessern."
            }
          />
          <div>
            <div className="rounded-md border border-[color:var(--color-sand)]/80 bg-white p-5 sm:p-7">
              <p className="border-l-4 border-[color:var(--color-brass)] pl-4 text-base font-semibold leading-8 text-[color:var(--color-navy)]">
                Ein zu hoher Einstiegspreis verlängert häufig die Vermarktung. Ein zu niedriger Preis kostet Eigentümer bares Geld.
              </p>
              <p className="mt-4 text-sm leading-7 text-[color:var(--color-graphite)]">
                Die richtige Preisstrategie entscheidet deshalb nicht nur über den Preis, sondern auch über Ruhe, Sicherheit und Verhandlungsspielraum.
              </p>
            </div>
            <div className="mt-6">
              <PrimaryCta>Preisstrategie persönlich prüfen lassen</PrimaryCta>
            </div>
          </div>
        </div>
      </section>

      {automaticValue && !isLand ? <EquipmentImpactTool props={props} /> : null}

      <section id="persoenliche-pruefung" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <SectionHeader
                eyebrow="Nächster sinnvoller Schritt"
                title="Persönliche Prüfung"
                text="Wir prüfen deine Angaben, gleichen die Immobilie mit dem regionalen Markt in Aurich und ganz Ostfriesland ab und sagen dir klar, welcher Verkaufspreis realistisch ist."
              />
              <p className="mt-5 max-w-3xl border-l-4 border-[color:var(--color-brass)] pl-4 text-base font-semibold leading-8 text-[color:var(--color-navy)]">
                Du bekommst keine pauschale Online-Schätzung, sondern eine klare Grundlage für deine Entscheidung.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <PrimaryCta href="#kontakt-optionen">Jetzt realistischen Verkaufspreis klären</PrimaryCta>
                <PrimaryCta href="#kontakt-optionen" variant="secondary" event="callback_cta_clicked">
                  Rückruf vereinbaren
                </PrimaryCta>
              </div>
            </div>
            <ol className="grid gap-3">
              <StepItem number="1" text="Deine Angaben werden geprüft." />
              <StepItem number="2" text="Die Immobilie wird regional eingeordnet." />
              <StepItem number="3" text="Auffälligkeiten werden geklärt." />
              <StepItem number="4" text="Die realistische Preisstrategie wird besprochen." />
              <StepItem number="5" text="Du entscheidest in Ruhe, ob und wann du verkaufen möchtest." />
            </ol>
          </div>
          <div className="mt-8">
            <LeadContactChoiceClient
              token={props.token}
              defaultName={personName(props)}
              defaultEmail={props.email}
              defaultPhone={props.phone ?? ""}
            />
          </div>
        </div>
      </section>

      <section id="vertrauen" className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeader
            title="Warum Frisia Immobilien?"
            text="Frisia Immobilien verbindet regionale Marktkenntnis mit strukturierter Immobilienbewertung und klarer Verkaufsführung. Du bekommst eine ruhige, verständliche Einschätzung ohne Schönrechnen, ohne Druck und ohne Fachchinesisch."
          />
          <div className="rounded-md border border-[color:var(--color-sand)]/80 bg-[#f6f8fa] p-5 sm:p-7">
            <ul className="grid gap-2">
              <TrustPoint>Immobilienmakler IHK</TrustPoint>
              <TrustPoint>DEKRA zertifizierte Immobilienbewertung D1</TrustPoint>
              <TrustPoint>Regionaler Markt in Aurich und ganz Ostfriesland</TrustPoint>
              <TrustPoint>Strukturierter Verkaufsprozess</TrustPoint>
              <TrustPoint>Persönliche Verantwortung statt anonymer Rechner</TrustPoint>
            </ul>
            <p className="mt-6 border-l-4 border-[color:var(--color-brass)] pl-4 text-base font-semibold leading-8 text-[color:var(--color-navy)]">
              Du musst dich nicht kümmern. Wir ordnen das für dich.
            </p>
          </div>
        </div>
      </section>

      <DataBasisSection props={props} />

      <section className="bg-[color:var(--color-navy)] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Abschluss
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-[2.4rem] leading-[1.04] sm:text-[3.3rem]">
              Lass deine Einschätzung jetzt persönlich prüfen.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">
              Dann weißt du, welcher Preis realistisch ist und wie du ohne Unsicherheit weiter vorgehst.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <LeadCallbackTaskButton
                token={props.token}
                className={ctaClasses("quiet")}
                defaultName={personName(props)}
                defaultEmail={props.email}
                defaultPhone={props.phone ?? ""}
                label="Jetzt realistischen Verkaufspreis klären"
                doneLabel="Anfrage ist angelegt"
                formEyebrow="Verkaufspreis klären"
                formTitle="Kontaktdaten senden"
                messagePlaceholder="Optional: Gibt es Fragen zur Einschätzung oder einen passenden Rückrufzeitraum?"
                submitLabel="Verkaufspreis klären"
                intent="price_check"
                eventType="primary_cta_clicked"
              />
              <LeadCallbackTaskButton
                token={props.token}
                className={ctaClasses("quiet")}
                defaultName={personName(props)}
                defaultEmail={props.email}
                defaultPhone={props.phone ?? ""}
              />
            </div>
            <p className="mt-4 text-sm text-white/70">
              Unverbindlich. Persönlich. Regional eingeordnet.
            </p>
          </div>
          <ContactOptions />
        </div>
      </section>

      <footer className="bg-white px-4 py-7 text-[color:var(--color-navy)] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 text-sm">
          <div>{LEGAL_NAME}</div>
          <div className="flex gap-4">
            <Link
              href="/recht/impressum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-graphite)] hover:text-[color:var(--color-navy)]"
            >
              Impressum
            </Link>
            <Link
              href="/recht/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-graphite)] hover:text-[color:var(--color-navy)]"
            >
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
