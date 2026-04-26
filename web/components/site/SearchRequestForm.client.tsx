"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";

const MARKETING_OPTIONS = [
  { value: "BUY", label: "Kaufen" },
  { value: "RENT", label: "Mieten" },
  { value: "BOTH", label: "Beides" },
] as const;

const PROPERTY_TYPE_OPTIONS = ["Haus", "Wohnung", "Grundstück", "Büro / Praxis", "Gewerbe", "Anlageobjekt"];

const TIMING_OPTIONS = ["Sofort", "In den nächsten 3 Monaten", "In 3-6 Monaten", "Später / noch offen"];

const FINANCING_OPTIONS = ["In Prüfung", "Finanzierung geklärt", "Eigenkapital vorhanden"];

const SEARCH_RADIUS_OPTIONS = [
  { value: "", label: "Flexibel" },
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "20", label: "20 km" },
  { value: "30", label: "30 km" },
  { value: "50", label: "50 km" },
] as const;

type FormState = {
  marketingType: "BUY" | "RENT" | "BOTH";
  propertyTypes: string[];
  locations: string;
  searchRadiusKm: string;
  budgetMax: string;
  livingSpaceMin: string;
  roomsMin: string;
  moveInTiming: string;
  financingStatus: string;
  saleIfBuyer: "" | "YES" | "NO";
  notes: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressHouseNumber: string;
  addressPostalCode: string;
  addressCity: string;
  consent: boolean;
};

const initialState: FormState = {
  marketingType: "BUY",
  propertyTypes: ["Haus"],
  locations: "Aurich, Ostfriesland",
  searchRadiusKm: "",
  budgetMax: "",
  livingSpaceMin: "",
  roomsMin: "",
  moveInTiming: "",
  financingStatus: "",
  saleIfBuyer: "",
  notes: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressStreet: "",
  addressHouseNumber: "",
  addressPostalCode: "",
  addressCity: "",
  consent: false,
};

function fieldId(name: string) {
  return `suchauftrag-${name}`;
}

function toNumberOrNull(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function SearchRequestForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const selectedSummary = useMemo(() => {
    const type = MARKETING_OPTIONS.find((option) => option.value === form.marketingType)?.label ?? "Kaufen";
    const propertyTypes = form.propertyTypes.length > 0 ? form.propertyTypes.join(", ") : "Objektart offen";
    const location = form.locations || "Suchort offen";
    const radius = form.searchRadiusKm ? `${form.searchRadiusKm} km Umkreis` : "Umkreis flexibel";
    return `${type} · ${propertyTypes} · ${location} · ${radius}`;
  }, [form.locations, form.marketingType, form.propertyTypes, form.searchRadiusKm]);

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePropertyType = (value: string) => {
    setForm((current) => {
      const exists = current.propertyTypes.includes(value);
      return {
        ...current,
        propertyTypes: exists
          ? current.propertyTypes.filter((entry) => entry !== value)
          : [...current.propertyTypes, value],
      };
    });
  };

  useEffect(() => {
    if (status !== "success" || !message) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMessage(null);
        setStatus("idle");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [message, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setStatus("idle");

    try {
      if (!form.saleIfBuyer) {
        throw new Error("Bitte beantworte die Frage zur eigenen Immobilie.");
      }

      const response = await fetch("/api/search-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budgetMax: toNumberOrNull(form.budgetMax),
          searchRadiusKm: toNumberOrNull(form.searchRadiusKm),
          livingSpaceMin: toNumberOrNull(form.livingSpaceMin),
          roomsMin: toNumberOrNull(form.roomsMin),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Der Suchauftrag konnte nicht übertragen werden.");
      }

      setStatus("success");
      setMessage("Dein Suchauftrag ist angelegt. Frisia Immobilien meldet sich, sobald passende Immobilien verfügbar sind.");
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Der Suchauftrag konnte nicht übertragen werden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {status === "success" && message ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(13,31,45,0.68)] px-5 py-8 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="suchauftrag-success-title"
        >
          <div className="w-full max-w-[38rem] rounded-[2rem] border border-white/70 bg-white px-6 py-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-10 sm:py-9">
            <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl font-semibold text-emerald-800">
              ✓
            </p>
            <h2
              id="suchauftrag-success-title"
              className="mt-5 font-[family-name:var(--font-playfair)] text-[1.9rem] leading-tight text-[color:var(--color-navy)] sm:text-[2.3rem]"
            >
              Suchauftrag angelegt
            </h2>
            <p className="mt-4 text-[1.02rem] leading-[1.65] text-[color:var(--color-graphite)]">
              {message}
            </p>
            <Link
              href="/immobilien-aurich"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
            >
              Schließen und zu unseren Immobilien
            </Link>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[2.2rem] border border-[color:var(--color-brass)]/22 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]"
      >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
              Suchprofil
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-[2rem] leading-tight text-[color:var(--color-navy)] sm:text-[2.55rem]">
              Was suchst du?
            </h2>
          </div>

          <div className="mt-8 grid gap-7">
            <fieldset>
              <legend className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                Kauf oder Miete
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {MARKETING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("marketingType", option.value)}
                    className={`min-h-11 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                      form.marketingType === option.value
                        ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                        : "border-[color:var(--color-brass)]/28 bg-white text-[color:var(--color-navy)] hover:bg-[color:var(--color-section)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                Objektart
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROPERTY_TYPE_OPTIONS.map((option) => {
                  const selected = form.propertyTypes.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => togglePropertyType(option)}
                      className={`min-h-11 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                        selected
                          ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                          : "border-[color:var(--color-brass)]/28 bg-white text-[color:var(--color-navy)] hover:bg-[color:var(--color-section)]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2 grid gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
                <div>
                  <label htmlFor={fieldId("locations")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                    Suchort
                  </label>
                  <input
                    id={fieldId("locations")}
                    value={form.locations}
                    onChange={(event) => updateField("locations", event.target.value)}
                    required
                    placeholder="z. B. Aurich, Ihlow, Südbrookmerland"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/60 focus:border-[color:var(--color-brackish)]"
                  />
                </div>
                <div>
                  <label htmlFor={fieldId("searchRadiusKm")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                    Umkreis
                  </label>
                  <select
                    id={fieldId("searchRadiusKm")}
                    value={form.searchRadiusKm}
                    onChange={(event) => updateField("searchRadiusKm", event.target.value)}
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                  >
                    {SEARCH_RADIUS_OPTIONS.map((option) => (
                      <option key={option.value || "flexible"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={fieldId("budgetMax")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Budget bis
                </label>
                <input
                  id={fieldId("budgetMax")}
                  inputMode="numeric"
                  value={form.budgetMax}
                  onChange={(event) => updateField("budgetMax", event.target.value)}
                  placeholder="z. B. 450000"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/60 focus:border-[color:var(--color-brackish)]"
                />
              </div>

              <div>
                <label htmlFor={fieldId("livingSpaceMin")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Fläche ab
                </label>
                <input
                  id={fieldId("livingSpaceMin")}
                  inputMode="decimal"
                  value={form.livingSpaceMin}
                  onChange={(event) => updateField("livingSpaceMin", event.target.value)}
                  placeholder="z. B. 90"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/60 focus:border-[color:var(--color-brackish)]"
                />
              </div>

              <div>
                <label htmlFor={fieldId("roomsMin")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Zimmer ab
                </label>
                <input
                  id={fieldId("roomsMin")}
                  inputMode="decimal"
                  value={form.roomsMin}
                  onChange={(event) => updateField("roomsMin", event.target.value)}
                  placeholder="z. B. 3"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/60 focus:border-[color:var(--color-brackish)]"
                />
              </div>

              <div>
                <label htmlFor={fieldId("moveInTiming")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Zeitpunkt
                </label>
                <select
                  id={fieldId("moveInTiming")}
                  value={form.moveInTiming}
                  onChange={(event) => updateField("moveInTiming", event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                >
                  <option value="">Noch offen</option>
                  {TIMING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={fieldId("financingStatus")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Finanzierung
                </label>
                <select
                  id={fieldId("financingStatus")}
                  value={form.financingStatus}
                  onChange={(event) => updateField("financingStatus", event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                >
                  <option value="">Noch offen</option>
                  {FINANCING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="sm:col-span-2 rounded-2xl border border-[color:var(--color-brass)]/18 bg-white p-4">
                <legend className="px-1 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Eigene Immobilie
                </legend>
                <p className="mt-1 text-[0.98rem] font-normal leading-[1.55] text-[color:var(--color-navy)]">
                  Möchtest du deine Immobilie verkaufen, wenn wir für dich eine passende neue Immobilie finden?
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { value: "YES", label: "Ja" },
                    { value: "NO", label: "Nein" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("saleIfBuyer", option.value as FormState["saleIfBuyer"])}
                      className={`min-h-11 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                        form.saleIfBuyer === option.value
                          ? "border-[color:var(--color-navy)] bg-[color:var(--color-navy)] text-white"
                          : "border-[color:var(--color-brass)]/28 bg-white text-[color:var(--color-navy)] hover:bg-[color:var(--color-section)]"
                      }`}
                      aria-pressed={form.saleIfBuyer === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <label htmlFor={fieldId("notes")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Wünsche und Hinweise
                </label>
                <textarea
                  id={fieldId("notes")}
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  rows={5}
                  placeholder="z. B. ruhige Lage, Garten, ebenerdig, Innenstadt, Stellplatz"
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-[color:var(--color-section)]/45 px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors placeholder:text-[color:var(--color-graphite)]/60 focus:border-[color:var(--color-brackish)]"
                />
              </div>
            </div>

            <div className="grid gap-5 border-t border-[color:var(--color-brass)]/14 pt-7 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                  Persönliche Angaben
                </p>
              </div>
              <div>
                <label htmlFor={fieldId("firstName")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Vorname
                </label>
                <input
                  id={fieldId("firstName")}
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  required
                  autoComplete="given-name"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                />
              </div>
              <div>
                <label htmlFor={fieldId("lastName")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Nachname
                </label>
                <input
                  id={fieldId("lastName")}
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  required
                  autoComplete="family-name"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                />
              </div>
              <div>
                <label htmlFor={fieldId("email")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  E-Mail
                </label>
                <input
                  id={fieldId("email")}
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                  autoComplete="email"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                />
              </div>
              <div>
                <label htmlFor={fieldId("phone")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Telefon
                </label>
                <input
                  id={fieldId("phone")}
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  autoComplete="tel"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                />
              </div>
              <div className="sm:col-span-2 border-t border-[color:var(--color-brass)]/12 pt-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                  Adresse
                </p>
              </div>
              <div>
                <label htmlFor={fieldId("addressStreet")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Straße
                </label>
                <input
                  id={fieldId("addressStreet")}
                  value={form.addressStreet}
                  onChange={(event) => updateField("addressStreet", event.target.value)}
                  required
                  autoComplete="address-line1"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                />
              </div>
              <div>
                <label htmlFor={fieldId("addressHouseNumber")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Hausnummer
                </label>
                <input
                  id={fieldId("addressHouseNumber")}
                  value={form.addressHouseNumber}
                  onChange={(event) => updateField("addressHouseNumber", event.target.value)}
                  required
                  autoComplete="address-line2"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                />
              </div>
              <div>
                <label htmlFor={fieldId("addressPostalCode")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  PLZ
                </label>
                <input
                  id={fieldId("addressPostalCode")}
                  value={form.addressPostalCode}
                  onChange={(event) => updateField("addressPostalCode", event.target.value)}
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                />
              </div>
              <div>
                <label htmlFor={fieldId("addressCity")} className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                  Ort
                </label>
                <input
                  id={fieldId("addressCity")}
                  value={form.addressCity}
                  onChange={(event) => updateField("addressCity", event.target.value)}
                  required
                  autoComplete="address-level2"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[color:var(--color-brass)]/24 bg-white px-4 py-3 text-[color:var(--color-navy)] outline-none transition-colors focus:border-[color:var(--color-brackish)]"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--color-brass)]/18 bg-[color:var(--color-section)]/35 p-4 text-sm leading-[1.65] text-[color:var(--color-graphite)]">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => updateField("consent", event.target.checked)}
                required
                className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-navy)]"
              />
              <span>
                Ich stimme zu, dass Frisia Immobilien meine Angaben verarbeitet und mich zu passenden Immobilien sowie zu meinem Suchauftrag kontaktieren darf. Hinweise dazu findest du in der{" "}
                <Link
                  href="/datenschutz"
                  className="font-semibold text-[color:var(--color-navy)] underline decoration-[color:var(--color-brass)] underline-offset-4 transition-colors hover:text-[color:var(--color-brackish)]"
                >
                  Datenschutzerklärung
                </Link>
                .
              </span>
            </label>

            {message && status === "error" ? (
              <p
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
                role="alert"
              >
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Suchauftrag wird angelegt ..." : "Suchauftrag anlegen"}
            </button>
          </div>
        </div>

        <aside className="border-t border-[color:var(--color-brass)]/16 bg-[linear-gradient(180deg,#ffffff_0%,#f6f7f8_100%)] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-8">
          <div className="lg:sticky lg:top-24">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
              Zusammenfassung
            </p>
            <p className="mt-3 font-[family-name:var(--font-playfair)] text-[1.65rem] leading-tight text-[color:var(--color-navy)]">
              {selectedSummary}
            </p>
            <div className="mt-7 space-y-4 text-sm leading-[1.7] text-[color:var(--color-graphite)]">
              <p>Dein Suchauftrag wird direkt bei Frisia Immobilien hinterlegt.</p>
              <p>Neue Immobilien werden für dich vorgeprüft und dir nur dann persönlich weitergegeben, wenn sie wirklich zu deiner Suche passen.</p>
            </div>
            <div className="mt-8 grid gap-3">
              {["Aktuelle Suche hinterlegen", "Passende Objekte vormerken", "Persönliche Rückmeldung erhalten"].map((item) => (
                <div key={item} className="rounded-2xl border border-[color:var(--color-brass)]/18 bg-white px-4 py-3 text-sm font-semibold text-[color:var(--color-navy)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      </form>
    </>
  );
}
