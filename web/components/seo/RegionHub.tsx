import Link from "next/link";
import { LANDING_TEMPLATES } from "@/lib/seo/templates";
import type { getRegionHubData } from "@/lib/seo/getRegionHubData";
import { formatLocationLabel, formatLocationPhraseFromName, isIslandLocationName } from "@/lib/seo/locationDisplay";
import type { SeoLocationRow, SeoPageType } from "@/lib/types/leadgen";

type RegionHubData = Awaited<ReturnType<typeof getRegionHubData>>;
type HubCity = RegionHubData["grouped"][number]["cities"][number];

const HUB_LINK_ORDER: SeoPageType[] = [
  "immobilienbewertung",
  "haus_verkaufen",
  "immobilienmakler",
  "immobilienpreise",
  "haus_kaufen",
  "immobilien",
];

const REGION_GROUP_ORDER = [
  "Landkreis Aurich",
  "Stadt Emden",
  "Landkreis Leer",
  "Landkreis Wittmund",
  "Stadt Wilhelmshaven",
  "Landkreis Friesland",
];

function regionGroupLabel(label: string) {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("aurich")) return "Landkreis Aurich";
  if (normalized.includes("emden")) return "Stadt Emden";
  if (normalized.includes("leer")) return "Landkreis Leer";
  if (normalized.includes("wittmund")) return "Landkreis Wittmund";
  if (normalized.includes("wilhelmshaven")) return "Stadt Wilhelmshaven";
  if (normalized === "friesland" || normalized.includes("landkreis friesland")) return "Landkreis Friesland";
  return label || "Weitere Orte";
}

function regionGroupRank(label: string) {
  const index = REGION_GROUP_ORDER.indexOf(regionGroupLabel(label));
  return index === -1 ? REGION_GROUP_ORDER.length : index;
}

function regionGroupId(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function sortCityName(a: string, b: string) {
  if (a.toLowerCase().startsWith("aurich")) return -1;
  if (b.toLowerCase().startsWith("aurich")) return 1;
  return a.localeCompare(b, "de");
}

function cityKey(city: string) {
  return city.trim().toLowerCase();
}

function cityLocationScore(location: SeoLocationRow | null) {
  if (!location) return -1;
  return (location.indexable ? 1000 : 0) + (location.priority ?? 0);
}

function mergeCities(cities: HubCity[]) {
  const byCity = new Map<string, HubCity>();

  for (const city of cities) {
    const key = cityKey(city.city);
    const existing = byCity.get(key);
    if (!existing) {
      byCity.set(key, {
        ...city,
        places: [...city.places],
      });
      continue;
    }

    const placesBySlug = new Map(existing.places.map((place) => [place.location_slug, place]));
    for (const place of city.places) {
      placesBySlug.set(place.location_slug, place);
    }

    const cityLocation =
      cityLocationScore(city.cityLocation) > cityLocationScore(existing.cityLocation)
        ? city.cityLocation
        : existing.cityLocation;
    const places = Array.from(placesBySlug.values()).sort((a, b) => {
      if (a.indexable !== b.indexable) return a.indexable ? -1 : 1;
      return a.location_label.localeCompare(b.location_label, "de");
    });

    byCity.set(key, {
      ...existing,
      cityLocation,
      places,
      totalLocations: places.length + (cityLocation ? 1 : 0),
      indexableLocations: places.filter((place) => place.indexable).length + (cityLocation?.indexable ? 1 : 0),
    });
  }

  return Array.from(byCity.values());
}

function hubLinkLabel(pageType: SeoPageType, location: string) {
  const label = formatLocationLabel(location);
  const locationPhrase = formatLocationPhraseFromName(label);
  const locationSuffix = isIslandLocationName(label) ? locationPhrase : label;
  if (pageType === "immobilienbewertung") return `Immobilienbewertung ${locationSuffix}`;
  if (pageType === "haus_verkaufen") return `Haus verkaufen ${locationSuffix}`;
  if (pageType === "immobilie_verkaufen") return `Immobilie verkaufen ${locationSuffix}`;
  if (pageType === "immobilienmakler") return `Immobilienmakler ${locationSuffix}`;
  if (pageType === "immobilienpreise") return `Immobilienpreise ${locationSuffix}`;
  if (pageType === "haus_kaufen") return `Haus kaufen ${locationSuffix}`;
  return `Immobilien ${locationPhrase}`;
}

function LocationTypeIcon({ type }: { type: "city" | "place" }) {
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-section)] text-[color:var(--color-navy)]"
    >
      <svg viewBox="0 0 48 48" className="h-6 w-6 fill-none stroke-current stroke-[1.9]">
        <use href={type === "city" ? "#hub-icon-location-city" : "#hub-icon-location-place"} />
      </svg>
    </span>
  );
}

function HubIconSprite() {
  return (
    <svg aria-hidden="true" className="hidden">
      <symbol id="hub-icon-location-city" viewBox="0 0 48 48">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 40h28" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 40V15l10-5 10 5v25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 20h2M26 20h2M20 26h2M26 26h2M22 40v-7h4v7" />
      </symbol>
      <symbol id="hub-icon-location-place" viewBox="0 0 48 48">
        <path strokeLinecap="round" strokeLinejoin="round" d="M24 42s12-10.5 12-22a12 12 0 0 0-24 0c0 11.5 12 22 12 22Z" />
        <circle cx="24" cy="20" r="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </symbol>
    </svg>
  );
}

function locationLinks(slug: string, label: string) {
  return HUB_LINK_ORDER.map((pageType) => {
    const template = LANDING_TEMPLATES.find((item) => item.pageType === pageType);
    if (!template) return null;
    return {
      href: `/${template.prefix}-${slug}`,
      label: hubLinkLabel(pageType, label),
    };
  }).filter((link): link is { href: string; label: string } => Boolean(link));
}

function LocationLinkGrid({ location }: { location: SeoLocationRow }) {
  return (
    <nav aria-label={`Weiterführende Seiten für ${location.location_label}`} className="mt-4 flex flex-wrap gap-2">
      {locationLinks(location.location_slug, location.location_label).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-10 items-center rounded-full border border-[color:var(--color-brass)]/28 bg-white px-4 py-2 text-sm font-semibold leading-tight text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-section)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brackish)]/35"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function cleanLocationName(value: string | null | undefined) {
  return formatLocationLabel(String(value ?? "").trim());
}

function locationIntroText(location: SeoLocationRow) {
  const label = cleanLocationName(location.location_label);
  const city = cleanLocationName(location.stadt_gemeinde);
  const landkreis = cleanLocationName(location.landkreis);

  if (location.location_type === "ortsteil" && city) {
    return `${label} ist ein Ortsteil der Stadt ${city} in Ostfriesland.`;
  }

  if (location.location_type === "stadt_gemeinde") {
    return `${label} liegt in Ostfriesland und ist ein wichtiger lokaler Immobilienmarkt.`;
  }

  if (landkreis) {
    return `${label} gehört zu ${landkreis} in Ostfriesland.`;
  }

  return `${label} liegt in Ostfriesland.`;
}

function LocationDetails({
  location,
  kicker,
  indented = false,
}: {
  location: SeoLocationRow;
  kicker: string;
  indented?: boolean;
}) {
  return (
    <details
      suppressHydrationWarning
      className={`group/location border-t border-[color:var(--color-brass)]/15 py-3 first:border-t-0 ${
        indented ? "ml-4 sm:ml-6" : ""
      }`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md px-1 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brackish)]/35">
        <span className="flex min-w-0 items-start gap-3">
          <LocationTypeIcon type={indented ? "place" : "city"} />
          <span className="min-w-0">
            <span className="block font-semibold text-[color:var(--color-navy)]">{location.location_label}</span>
            <span className="mt-1 block text-xs text-[color:var(--color-graphite)]">
              {kicker}
              {location.plz ? ` - PLZ ${location.plz}` : ""}
            </span>
          </span>
        </span>
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-lg text-[color:var(--color-navy)] transition group-open/location:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pb-2 pl-1 pr-1">
        <p className="mt-1 text-sm leading-6 text-[color:var(--color-graphite)]">
          {locationIntroText(location)}
        </p>
        <LocationLinkGrid location={location} />
      </div>
    </details>
  );
}

export default function RegionHub({ data }: { data: RegionHubData }) {
  const mergedGroups = new Map<
    string,
    {
      landkreis: string;
      displayLabel: string;
      cities: RegionHubData["grouped"][number]["cities"];
    }
  >();

  for (const group of data.grouped) {
    const displayLabel = regionGroupLabel(group.landkreis);
    const existing = mergedGroups.get(displayLabel);
    if (existing) {
      existing.cities.push(...group.cities);
    } else {
      mergedGroups.set(displayLabel, {
        landkreis: group.landkreis,
        displayLabel,
        cities: [...group.cities],
      });
    }
  }

  const regionGroups = Array.from(mergedGroups.values())
    .map((group) => ({
      ...group,
      cities: mergeCities(group.cities).sort((a, b) => sortCityName(a.city, b.city)),
    }))
    .sort((a, b) => {
      const rankA = regionGroupRank(a.landkreis);
      const rankB = regionGroupRank(b.landkreis);
      if (rankA !== rankB) return rankA - rankB;
      return a.displayLabel.localeCompare(b.displayLabel, "de");
    });

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 pb-14 sm:px-6 md:pb-18">
      <HubIconSprite />
      <div className="space-y-8">
        {regionGroups.map((group) => (
          <section key={group.displayLabel}>
            <details
              suppressHydrationWarning
              className="group/region rounded-xl border border-[color:var(--color-brass)]/20 bg-white px-3 py-1 shadow-[0_8px_24px_rgba(17,24,39,0.03)]"
            >
              <summary
                aria-labelledby={`region-${regionGroupId(group.displayLabel)}`}
                className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-1 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brackish)]/35"
              >
                <h2
                  id={`region-${regionGroupId(group.displayLabel)}`}
                  className="font-[family-name:var(--font-playfair)] text-2xl leading-tight text-[color:var(--color-navy)] sm:text-3xl"
                >
                  {group.displayLabel}
                </h2>
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-xl text-[color:var(--color-navy)] transition group-open/region:rotate-45"
                >
                  +
                </span>
              </summary>

              <div className="divide-y divide-[color:var(--color-brass)]/20 border-t border-[color:var(--color-brass)]/20">
                {group.cities.map((city) => (
                  <details
                    key={`${group.displayLabel}-${cityKey(city.city)}`}
                    suppressHydrationWarning
                    className="group/city"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-1 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brackish)]/35">
                    <span className="text-xl font-semibold leading-tight text-[color:var(--color-navy)] sm:text-2xl">
                      {city.city}
                    </span>
                    <span
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-xl text-[color:var(--color-navy)] transition group-open/city:rotate-45"
                    >
                      +
                    </span>
                  </summary>

                  <div className="pb-6">
                    <div className="mb-3 flex flex-wrap gap-2 text-xs font-medium text-[color:var(--color-graphite)]">
                      <span className="rounded-full bg-[color:var(--color-section)] px-3 py-1">{group.displayLabel}</span>
                      {city.places.length > 0 ? (
                        <span className="rounded-full bg-[color:var(--color-section)] px-3 py-1">
                          {city.places.length} Orte und Ortsteile
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mb-4 font-[family-name:var(--font-playfair)] text-2xl leading-tight text-[color:var(--color-navy)]">
                      Der Immobilienmarkt {formatLocationPhraseFromName(city.city)} – dein Einstieg
                    </h3>

                    <p className="mb-6 max-w-3xl text-[15px] leading-7 text-[color:var(--color-graphite)] sm:text-base">
                      Der Immobilienmarkt {formatLocationPhraseFromName(city.city)} ist in vielen Bereichen stabil, gleichzeitig aber schwer realistisch einzuschätzen.
                      Viele Eigentümer stehen vor der Frage, welcher Preis tatsächlich erzielbar ist und wie ein Verkauf sinnvoll strukturiert werden sollte.
                      Hier findest du den passenden Einstieg – je nachdem, wo du gerade stehst.
                    </p>

                    <div className="rounded-lg border border-[color:var(--color-brass)]/20 bg-white px-3">
                      {city.cityLocation ? (
                        <LocationDetails location={city.cityLocation} kicker="Stadt-/Gemeindeseiten" />
                      ) : null}

                      {city.places.map((place) => (
                        <LocationDetails key={place.location_slug} location={place} kicker="Ort / Ortsteil" indented />
                      ))}

                      {!city.cityLocation && city.places.length === 0 ? (
                        <p className="py-4 text-sm leading-6 text-[color:var(--color-graphite)]">
                          Für diese Stadt sind noch keine separaten Orte oder Ortsteile gepflegt.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </details>
              ))}
              </div>
            </details>
          </section>
        ))}
      </div>
    </div>
  );
}
