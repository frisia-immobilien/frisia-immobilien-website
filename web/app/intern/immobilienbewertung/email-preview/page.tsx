import type { Metadata } from "next";
import Link from "next/link";

import type { LeadValuationRow } from "@/lib/immobilienbewertung/lead-records";
import { renderLeadValuationEmail } from "@/lib/immobilienbewertung/templates/valuation-email";
import { getBrokerAvatarUrlByEmail } from "@/lib/propstack/client";
import { absoluteUrl, DIRECT_CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Interne Preview: Bewertungs-E-Mail",
  description:
    "Interne, nicht indexierbare Vorschau der Immobilienbewertungs-E-Mail mit festen Beispieldaten.",
  alternates: {
    canonical: absoluteUrl("/intern/immobilienbewertung/email-preview"),
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const previewLead: LeadValuationRow = {
  id: "preview-lead",
  created_at: "2026-04-05T08:30:00.000Z",
  updated_at: "2026-04-05T08:36:00.000Z",
  expires_at: "2026-05-15T12:00:00.000Z",
  lead_progress_id: "preview-progress",
  fingerprint: "preview-fingerprint",
  token_hash: "preview-token-hash",
  type: "house",
  house_type: "bungalow",
  plz: "26605",
  city: "Aurich",
  district: "Haxtum",
  street: "Musterstraße",
  house_number: "12",
  location_text: "Musterstraße 12, 26605 Aurich-Haxtum",
  living_area: 148,
  land_area: 720,
  rooms: 5,
  year_built: 1998,
  energy_class: "C",
  condition: "very_good",
  quality: "high",
  extras: JSON.stringify(["garden", "terrace", "guest_wc"]),
  other_extras: null,
  other_extras_value_eur: null,
  reason: "sale",
  usage: "owner_occupied",
  email: "max.mustermann@example.com",
  salutation: "mrs",
  first_name: "Max",
  last_name: "Mustermann",
  name: "Max Mustermann",
  phone: "04941 123456",
  consent: true,
  privacy_accepted_at: "2026-04-05T08:32:00.000Z",
  market_location_id: "aur-26605-haxtum",
  market_location_label: "Aurich-Haxtum",
  market_scope: "district",
  market_plz_bereiche: "26605",
  market_median_preis_eur_m2: 2310,
  market_verkaeufe_anzahl: 19,
  market_tage_am_markt: 92,
  market_delta_vorjahr_median_prozent: 4.2,
  value_min: 310000,
  value_mid: 342000,
  value_max: 375000,
  valuation_payload: null,
  valuation_breakdown: null,
  email_sent_at: null,
  email_provider: null,
  email_message_id: null,
  opened_at: null,
  open_count: 0,
  last_opened_at: null,
  cta_clicked_at: null,
  cta_click_count: 0,
  callback_requested_at: null,
};

export default async function Page() {
  const landingUrl = absoluteUrl("/intern/immobilienbewertung/bewertung-preview");
  const contactImageUrl =
    (await getBrokerAvatarUrlByEmail(DIRECT_CONTACT.email).catch(() => null)) || DIRECT_CONTACT.imagePath;
  const preview = renderLeadValuationEmail({
    lead: previewLead,
    landingUrl,
    contactImageUrl,
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3f6f8_0%,#ffffff_24%)]">
      <section className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="rounded-[1.9rem] border border-[color:var(--color-sand)]/70 bg-white p-6 shadow-[0_35px_100px_-70px_rgba(27,48,64,0.38)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[color:var(--color-sand)]/55 pb-5">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
                Interne Preview
              </div>
              <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.2rem] leading-[1.02] tracking-[-0.03em] text-[color:var(--color-navy)] sm:text-[3rem]">
                Bewertungs-E-Mail
              </h1>
              <p className="mt-4 max-w-3xl text-[1rem] leading-[1.8] text-[color:var(--color-graphite)]">
                Diese Vorschau zeigt exakt das HTML-Template für die Kundenmail mit festen Beispieldaten. Es wird nichts versendet.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/intern/immobilienbewertung/bewertung-preview"
                className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--color-sand)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)]"
              >
                Landingpage-Preview
              </Link>
              <Link
                href="/immobilienbewertung-aurich"
                className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)]"
              >
                Immobilienbewertung öffnen
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.5rem] bg-[color:var(--color-cream)]/62 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">Betreff</div>
              <div className="mt-2 text-[1.05rem] font-semibold text-[color:var(--color-navy)]">{preview.subject}</div>

              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">Preheader</div>
              <div className="mt-2 text-sm leading-[1.8] text-[color:var(--color-graphite)]">{preview.preheader}</div>

              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">Linkziel</div>
              <div className="mt-2 break-all text-sm leading-[1.8] text-[color:var(--color-graphite)]">{landingUrl}</div>
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--color-sand)]/70 bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">Text-Fallback</div>
              <pre className="mt-3 whitespace-pre-wrap break-words font-[family-name:var(--font-geist-sans)] text-sm leading-[1.8] text-[color:var(--color-graphite)]">
                {preview.text}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-10 sm:px-8 lg:px-10 lg:pb-14">
        <div className="rounded-[2rem] border border-[color:var(--color-sand)]/70 bg-white p-3 shadow-[0_35px_100px_-70px_rgba(27,48,64,0.38)] sm:p-5">
          <div className="rounded-[1.6rem] bg-[#f4f6f9] p-2 sm:p-4">
            <div dangerouslySetInnerHTML={{ __html: preview.html }} />
          </div>
        </div>
      </section>
    </main>
  );
}
