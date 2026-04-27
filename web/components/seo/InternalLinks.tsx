import Link from "next/link";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { LANDING_TEMPLATES } from "@/lib/seo/templates";

const ORDERED_PAGE_TYPES = [
  "immobilienbewertung",
  "haus_verkaufen",
  "immobilie_verkaufen",
  "immobilienmakler",
  "immobilienpreise",
  "haus_kaufen",
  "immobilien",
];

export default function InternalLinks({ data }: { data: LocationPageData }) {
  const sortedTemplates = [...LANDING_TEMPLATES].sort(
    (a, b) => ORDERED_PAGE_TYPES.indexOf(a.pageType) - ORDERED_PAGE_TYPES.indexOf(b.pageType),
  );
  const primaryLinks = sortedTemplates.map((template) => ({
    href: `/${template.prefix}-${data.location.location_slug}`,
    label: `${template.label} ${data.location.location_label}`,
  }));

  return (
    <section className="bg-[color:var(--color-section)] py-14 md:py-16">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <h2 className="font-[family-name:var(--font-playfair)] text-[2.25rem] leading-tight text-[color:var(--color-navy)] md:text-[3.1rem]">
          Weiterführende regionale Seiten
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-[color:var(--color-brass)]/45 bg-white px-7 py-5 text-lg font-semibold text-[color:var(--color-navy)] shadow-[0_18px_44px_-40px_rgba(27,48,64,0.45)] transition hover:border-[color:var(--color-brass)] hover:bg-white/80"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {data.nearbyLocations.length > 0 ? (
          <>
            <h3 className="mt-14 font-[family-name:var(--font-playfair)] text-[1.75rem] leading-tight text-[color:var(--color-navy)] md:text-[2.15rem]">
              Nachbarorte und Ortsteile
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {data.nearbyLocations.map((location) => (
                <Link
                  key={location.location_slug}
                  href={`/${data.template.prefix}-${location.location_slug}`}
                  className="rounded-full border border-[color:var(--color-brass)]/45 bg-white px-5 py-2.5 text-base text-[color:var(--color-graphite)] transition hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-navy)] md:text-lg"
                >
                  {location.location_label}
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
