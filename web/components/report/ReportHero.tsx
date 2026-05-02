import type { LeadReportWithRequest } from "@/lib/types/leadgen";
import { BRAND_NAME } from "@/lib/site";

function addressLabel(report: LeadReportWithRequest) {
  const lead = report.lead_request;
  return [
    [lead.street, lead.house_number].filter(Boolean).join(" "),
    [lead.postal_code, lead.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function objectTypeLabel(value: string | null | undefined) {
  if (value === "haus") return "Haus";
  if (value === "wohnung") return "Wohnung";
  if (value === "grundstueck") return "Grundstück";
  if (value === "gewerbe") return "Gewerbe";
  return value || "k. A.";
}

function areaLabel(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toLocaleString("de-DE")} m²`
    : "k. A.";
}

export default function ReportHero({ report }: { report: LeadReportWithRequest }) {
  const lead = report.lead_request;
  const address = addressLabel(report) || "k. A.";
  const createdAt = new Date(report.created_at).toLocaleDateString("de-DE");

  return (
    <section className="bg-[#050505] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-[1040px]">
        <div className="flex min-h-16 items-center justify-between gap-6 rounded-sm bg-white px-5 text-[color:var(--color-navy)] shadow-[0_18px_45px_-35px_rgba(255,255,255,0.65)] sm:px-8">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
            {BRAND_NAME}
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-[color:var(--color-graphite)] sm:flex">
            <span>Bewertung</span>
            <span>Marktdaten</span>
            <span>Kontakt</span>
          </div>
        </div>

        <div className="grid min-h-[520px] place-items-center py-16 sm:py-20">
          <article className="w-full max-w-[760px] rounded-md bg-white px-6 py-8 text-center text-[color:var(--color-navy)] shadow-[0_35px_90px_-55px_rgba(255,255,255,0.35)] sm:px-10 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Persönliche Marktpreiseinschätzung
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-tight md:text-5xl">
              Objekt
            </h1>
            <dl className="mx-auto mt-6 grid max-w-[620px] gap-4 text-left text-sm leading-7 text-[color:var(--color-graphite)] sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-[color:var(--color-navy)]">Objektart</dt>
                <dd>{objectTypeLabel(lead.object_type)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[color:var(--color-navy)]">Baujahr</dt>
                <dd>{lead.construction_year ?? "k. A."}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-[color:var(--color-navy)]">Adresse</dt>
                <dd>{address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[color:var(--color-navy)]">Wohnfläche</dt>
                <dd>{areaLabel(lead.living_area)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[color:var(--color-navy)]">Erstellt am</dt>
                <dd>{createdAt}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="flex items-center gap-5 pb-6">
          <div className="h-px flex-1 bg-white/80" />
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-semibold text-white">
            01
          </div>
        </div>
      </div>
    </section>
  );
}
