import type { LeadReportWithRequest } from "@/lib/types/leadgen";

function addressLabel(report: LeadReportWithRequest) {
  const lead = report.lead_request;
  return [
    [lead.street, lead.house_number].filter(Boolean).join(" "),
    [lead.postal_code, lead.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

export default function ReportHero({ report }: { report: LeadReportWithRequest }) {
  const lead = report.lead_request;
  return (
    <section className="mx-auto max-w-[980px] px-4 py-12 sm:px-6 md:py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
        Persönliche Marktpreiseinschätzung
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-[1.12] text-[color:var(--color-navy)] md:text-5xl">
        Marktpreiseinschätzung deiner Immobilie
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-[1.75] text-[color:var(--color-graphite)]">
        Diese Einschätzung ersetzt keinen Vor-Ort-Termin, gibt dir aber eine realistische erste Orientierung.
      </p>
      <dl className="mt-8 grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-[color:var(--color-graphite)]">Objektart</dt>
          <dd className="font-semibold text-[color:var(--color-navy)]">{lead.object_type ?? "k. A."}</dd>
        </div>
        <div>
          <dt className="text-[color:var(--color-graphite)]">Adresse</dt>
          <dd className="font-semibold text-[color:var(--color-navy)]">{addressLabel(report) || "k. A."}</dd>
        </div>
        <div>
          <dt className="text-[color:var(--color-graphite)]">Baujahr</dt>
          <dd className="font-semibold text-[color:var(--color-navy)]">{lead.construction_year ?? "k. A."}</dd>
        </div>
        <div>
          <dt className="text-[color:var(--color-graphite)]">Erstellt am</dt>
          <dd className="font-semibold text-[color:var(--color-navy)]">
            {new Date(report.created_at).toLocaleDateString("de-DE")}
          </dd>
        </div>
      </dl>
    </section>
  );
}
