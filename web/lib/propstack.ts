import { getGermanPropertyTypeLabel } from "@/lib/property-labels";
import { readActiveSnapshotJson } from "@/lib/website-snapshot";

const DEFAULT_PROPSTACK_BASE_URL = "https://api.propstack.de/v2";
const DEFAULT_PROPSTACK_V1_BASE_URL = "https://api.propstack.de/v1";
const PROPSTACK_PUBLIC_REVALIDATE_SECONDS = 120;

const PRIMARY_CITY = "aurich";
const SURROUNDING_CITIES = [
  "großheide",
  "grossheide",
  "südbrookmerland",
  "suedbrookmerland",
  "ihlow",
  "wiesmoor",
  "friedeburg",
  "wittmund",
  "norden",
  "hage",
  "leer",
  "emden",
  "krummhörn",
  "krummhoern",
  "marienhafe",
] as const;
const PUBLIC_WEBSITE_PROPERTY_STATUS_NAMES = new Set([
  "vermarktung",
  "reserviert (käufer zugesagt)",
]);

type PropstackImage = {
  title?: string | null;
  url: string;
  tags?: string[] | null;
  is_floorplan?: boolean | null;
  is_private?: boolean | null;
  position?: number | null;
};

type PropstackTranslation = {
  locale?: string | null;
  title?: string | null;
  description_note?: string | null;
  furnishing_note?: string | null;
  location_note?: string | null;
  other_note?: string | null;
};

type PropstackOptionalField = {
  key?: string | null;
  name?: string | null;
  value?: unknown;
};

type PropstackProperty = {
  id: number;
  name?: string | null;
  title?: string | null;
  unit_id?: string | null;
  broker_id?: number | null;
  city?: string | null;
  district?: string | null;
  location_name?: string | null;
  short_address?: string | null;
  zip_code?: string | null;
  street?: string | null;
  house_number?: string | null;
  marketing_type?: string | null;
  object_type?: string | null;
  rs_type?: string | null;
  rs_category?: string | null;
  property_status_id?: number | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  price?: number | string | null;
  base_rent?: number | string | null;
  total_rent?: number | string | null;
  service_charge?: number | string | null;
  heating_costs?: number | string | null;
  rent_subsidy?: number | string | null;
  price_per_sqm?: number | string | null;
  price_on_inquiry?: boolean | null;
  property_space_value?: number | string | null;
  living_space?: number | string | null;
  plot_area?: number | string | null;
  number_of_rooms?: number | string | null;
  number_of_bed_rooms?: number | null;
  number_of_bath_rooms?: number | null;
  construction_year?: number | null;
  usable_floor_space?: number | string | null;
  number_of_floors?: number | null;
  condition?: string | null;
  energy_efficiency_class?: string | null;
  energy_efficiency_value?: number | null;
  thermal_characteristic?: string | null;
  firing_types?: string | string[] | null;
  monument?: string | number | boolean | null;
  fields?: Record<string, unknown> | null;
  optional_fields?: PropstackOptionalField[] | null;
  custom_fields?: Record<string, unknown> | null;
  cellar?: boolean | null;
  balcony?: boolean | null;
  garden?: boolean | null;
  guest_toilet?: boolean | null;
  kitchen_complete?: boolean | null;
  description_note?: string | null;
  location_note?: string | null;
  furnishing_note?: string | null;
  other_note?: string | null;
  courtage?: string | null;
  courtage_note?: string | null;
  public_expose_url?: string | null;
  images?: PropstackImage[] | null;
  translations?: PropstackTranslation[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PropstackCustomField = string | { value?: string | null; pretty_value?: string | null } | null;

type PropstackBroker = {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  public_email?: string | null;
  public_phone?: string | null;
  public_cell?: string | null;
  phone?: string | null;
  cell?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  position?: string | null;
  custom?: {
    titel?: PropstackCustomField;
    qualifikation?: PropstackCustomField;
  } | null;
  custom_fields?: {
    titel?: PropstackCustomField;
    Titel?: PropstackCustomField;
    qualifikation?: PropstackCustomField;
    Qualifikation?: PropstackCustomField;
  } | null;
};

type PropstackPropertyStatus = {
  id: number;
  name: string;
  nonpublic?: boolean | null;
  remove_from_portal?: boolean | null;
  disable_expose_landing_page?: boolean | null;
};

type PropstackListResponse<T> = {
  data?: T[];
  properties?: T[];
  property_statuses?: T[];
};

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toPropstackList<T>(response: PropstackListResponse<T> | T[] | null | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (!response) return [];

  const data = toArray<T>(response.data);
  if (data.length > 0) return data;

  const properties = toArray<T>(response.properties);
  if (properties.length > 0) return properties;

  return toArray<T>(response.property_statuses);
}

const ENERGY_CARRIER_LABELS: Record<string, string> = {
  GAS: "Gas",
  OIL: "Öl",
  OEL: "Öl",
  ELECTRICITY: "Strom",
  DISTRICT_HEATING: "Fernwärme",
  GEOTHERMAL: "Erdwärme",
  SOLAR: "Solar",
  WOOD: "Holz",
  PELLET: "Pellets",
  LIQUID_GAS: "Flüssiggas",
  COAL: "Kohle",
};

function normalizeEnergyCarrier(value: string | string[] | null | undefined) {
  const values = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(/[,;]/)
        .map((item) => item.trim());

  const labels = values
    .filter(Boolean)
    .map((item) => {
      const key = item.replace(/[\s/-]+/g, "_").toUpperCase();
      return (
        ENERGY_CARRIER_LABELS[key] ??
        item
          .replace(/[_-]+/g, " ")
          .toLocaleLowerCase("de-DE")
          .replace(/(^|\s)\S/g, (match) => match.toLocaleUpperCase("de-DE"))
      );
    });

  return labels.length > 0 ? labels.join(", ") : null;
}

export type PropertyListItem = {
  id: number;
  slug: string;
  title: string;
  city: string;
  displayLocation: string;
  marketingType: string | null;
  zipCode: string | null;
  shortAddress: string;
  price: number | null;
  priceLabel: string;
  pricePeriod: "month" | null;
  priceOnInquiry: boolean;
  isCommercial: boolean;
  baseRent: number | null;
  totalRent: number | null;
  serviceCharge: number | null;
  heatingCosts: number | null;
  rentSubsidy: number | null;
  pricePerSqm: number | null;
  livingSpace: number | null;
  usableFloorSpace: number | null;
  plotArea: number | null;
  numberOfRooms: number | null;
  excerpt: string;
  imageUrl: string | null;
  publicExposeUrl: string | null;
  propertyTypeLabel: string;
  constructionYear: number | null;
  courtage: string | null;
  courtageNote: string | null;
  locationNote: string | null;
  furnishingNote: string | null;
  otherNote: string | null;
  scope: "aurich" | "umgebung";
};

export type PropertyListingResult = {
  items: PropertyListItem[];
  coverage: "aurich" | "aurich-und-umgebung";
};

export type PropertyDetailImage = {
  url: string;
  title: string;
  position: number;
  isFloorplan: boolean;
  tags: string[];
};

export type PropertyDetail = PropertyListItem & {
  unitId: string | null;
  schemaType: "House" | "Apartment";
  street: string | null;
  houseNumber: string | null;
  zipCode: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  numberOfBedrooms: number | null;
  numberOfBathrooms: number | null;
  numberOfFloors: number | null;
  condition: string | null;
  energyEfficiencyClass: string | null;
  energyEfficiencyValue: number | null;
  thermalCharacteristic: string | null;
  energyCarrier: string | null;
  monumentProtection: boolean;
  cellar: boolean;
  balcony: boolean;
  garden: boolean;
  guestToilet: boolean;
  kitchenComplete: boolean;
  descriptionNote: string | null;
  locationNote: string | null;
  furnishingNote: string | null;
  otherNote: string | null;
  galleryImages: PropertyDetailImage[];
  floorplanImages: PropertyDetailImage[];
  contactName: string | null;
  contactTitle: string | null;
  contactEmail: string | null;
  contactPhoneDisplay: string | null;
  contactPhoneHref: string | null;
  contactMobileDisplay: string | null;
  contactMobileHref: string | null;
  contactImagePath: string | null;
};

type PublicPropertySnapshot = {
  properties?: PropstackProperty[];
  brokers?: Record<string, PropstackBroker>;
};

let publicPropertySnapshotCache: PublicPropertySnapshot | null | undefined;

function loadPublicPropertySnapshot() {
  if (publicPropertySnapshotCache !== undefined) return publicPropertySnapshotCache;
  const snapshot = readActiveSnapshotJson<PublicPropertySnapshot>("properties");
  publicPropertySnapshotCache =
    snapshot && Array.isArray(snapshot.properties)
      ? {
          properties: snapshot.properties,
          brokers: snapshot.brokers && typeof snapshot.brokers === "object" ? snapshot.brokers : {},
        }
      : null;
  return publicPropertySnapshotCache;
}

function getSnapshotProperties() {
  const snapshot = loadPublicPropertySnapshot();
  return snapshot?.properties ?? null;
}

function getSnapshotPropertyById(id: number) {
  return getSnapshotProperties()?.find((property) => Number(property.id) === id) ?? null;
}

function getSnapshotBrokerById(id: number | null | undefined) {
  if (!id) return null;
  const snapshot = loadPublicPropertySnapshot();
  return snapshot?.brokers?.[String(id)] ?? null;
}

function getPropstackConfig() {
  const apiKey = process.env.PROPSTACK_API_KEY;
  const baseUrl = process.env.PROPSTACK_BASE_URL ?? DEFAULT_PROPSTACK_BASE_URL;

  if (!apiKey) {
    throw new Error("PROPSTACK_API_KEY is not configured");
  }

  return { apiKey, baseUrl };
}

function getPropstackV1Config() {
  const { apiKey, baseUrl } = getPropstackConfig();
  const configuredBaseUrl = process.env.PROPSTACK_V1_BASE_URL?.trim();
  const derivedBaseUrl = baseUrl.replace(/\/v2\/?$/i, "/v1");
  return {
    apiKey,
    baseUrl: configuredBaseUrl || (derivedBaseUrl !== baseUrl ? derivedBaseUrl : DEFAULT_PROPSTACK_V1_BASE_URL),
  };
}

async function propstackFetch<T>(path: string, searchParams?: Record<string, string | number | boolean | undefined>) {
  const { apiKey, baseUrl } = getPropstackConfig();
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, `${baseUrl.replace(/\/$/, "")}/`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      "X-Api-Key": apiKey,
      Accept: "application/json",
    },
    next: { revalidate: PROPSTACK_PUBLIC_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Propstack request failed (${response.status}) for ${path}`);
  }

  return (await response.json()) as T;
}

async function propstackV1Fetch<T>(path: string) {
  const { apiKey, baseUrl } = getPropstackV1Config();
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, `${baseUrl.replace(/\/$/, "")}/`);

  const response = await fetch(url.toString(), {
    headers: {
      "X-API-KEY": apiKey,
      Accept: "application/json",
    },
    next: { revalidate: PROPSTACK_PUBLIC_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Propstack v1 request failed (${response.status}) for ${path}`);
  }

  return (await response.json()) as T;
}

function normalizeText(value?: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : typeof entry === "number" ? String(entry) : ""))
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

function getCustomFieldText(field?: PropstackCustomField) {
  if (!field) return null;
  if (typeof field === "string") return field;
  return field.pretty_value ?? field.value ?? null;
}

function normalizeBrokerTitle(value?: string | null) {
  return normalizeText(value) || null;
}

function normalizeBrokerName(broker?: PropstackBroker | null) {
  if (!broker) return null;
  return (
    normalizeText(broker.name) ||
    [normalizeText(broker.first_name), normalizeText(broker.last_name)].filter(Boolean).join(" ") ||
    null
  );
}

function normalizePhoneHref(value?: string | null) {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  let digits = normalized.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) {
    digits = `+${digits.slice(2)}`;
  } else if (digits.startsWith("0")) {
    digits = `+49${digits.slice(1)}`;
  } else if (!digits.startsWith("+")) {
    digits = `+${digits}`;
  }

  return digits.length > 1 ? `tel:${digits}` : null;
}

function getPropstackBrokerFromResponse(
  response: PropstackBroker | { data?: PropstackBroker } | null,
): PropstackBroker | null {
  if (!response) return null;
  const data = (response as { data?: PropstackBroker }).data;
  const broker = data && typeof data === "object" ? data : (response as PropstackBroker);
  return Object.keys(broker).length > 0 ? broker : null;
}

function isTruthyPropstackFlag(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = normalizeText(value).toLocaleLowerCase("de-DE");
  if (!normalized) return false;

  return !["0", "false", "falsch", "nein", "no", "keine", "nicht vorhanden", "no_information"].includes(
    normalized,
  );
}

function resolveMonumentProtection(property: PropstackProperty) {
  const optionalMonumentField = property.optional_fields?.find((field) => {
    const key = normalizeText(field.key).toLocaleLowerCase("de-DE");
    const name = normalizeText(field.name).toLocaleLowerCase("de-DE");
    return key === "monument" || name.includes("denkmalschutz") || name.includes("denkmal");
  });
  const customMonumentValue = Object.entries(property.custom_fields ?? {}).find(([key]) =>
    key.toLocaleLowerCase("de-DE").includes("denkmal"),
  )?.[1];

  return (
    isTruthyPropstackFlag(property.monument) ||
    isTruthyPropstackFlag(property.fields?.monument) ||
    isTruthyPropstackFlag(optionalMonumentField?.value) ||
    isTruthyPropstackFlag(customMonumentValue)
  );
}

function toNumberOrNull(value?: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = toNumberOrNull(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function normalizeCity(value?: string | null) {
  return normalizeText(value).toLocaleLowerCase("de-DE");
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

function findGermanTranslation(property: PropstackProperty) {
  return property.translations?.find((translation) => translation.locale === "de") ?? property.translations?.[0];
}

function resolveTitle(property: PropstackProperty) {
  const translation = findGermanTranslation(property);
  const title =
    normalizeText(property.title) ||
    normalizeText(translation?.title) ||
    normalizeText(property.name) ||
    `Immobilie in ${normalizeText(property.city) || "Ostfriesland"}`;

  return title;
}

function getCustomRecordText(record: Record<string, unknown> | null | undefined, key: string) {
  const value = record?.[key];
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return normalizeText(value) || null;
  if (typeof value === "object") {
    const field = value as { value?: unknown; pretty_value?: unknown };
    return normalizeText(field.pretty_value) || normalizeText(field.value) || null;
  }
  return null;
}

function extractLocationFromTitle(value?: string | null) {
  const title = normalizeText(value);
  if (!title) return null;

  const match = title.match(/\bin\s+([^|,;:–—-]{2,60})/i);
  const candidate = normalizeText(match?.[1]).replace(/\s+/g, " ");
  if (!candidate) return null;

  const firstLetter = candidate.match(/\p{L}/u)?.[0];
  if (!firstLetter || firstLetter !== firstLetter.toLocaleUpperCase("de-DE")) {
    return null;
  }

  return candidate.replace(/\s+(?:und|mit|inklusive)\s+.*$/i, "").trim() || null;
}

function resolveDisplayLocation(property: PropstackProperty, title: string, city: string) {
  return (
    normalizeText(property.location_name) ||
    normalizeText(property.district) ||
    extractLocationFromTitle(getCustomRecordText(property.custom_fields, "schaufenster_tv_titel")) ||
    extractLocationFromTitle(title) ||
    city
  );
}

function resolveDescription(property: PropstackProperty) {
  const translation = findGermanTranslation(property);
  const value =
    normalizeText(property.description_note) ||
    normalizeText(translation?.description_note) ||
    normalizeText(property.location_note) ||
    normalizeText(translation?.location_note) ||
    normalizeText(property.furnishing_note) ||
    normalizeText(translation?.furnishing_note) ||
    normalizeText(property.other_note) ||
    normalizeText(translation?.other_note);

  return truncate(value, 220);
}

function resolveImage(property: PropstackProperty) {
  const ordered = orderPropstackImages(property.images);
  const preferred =
    ordered.find((image) => !image.is_private && !image.is_floorplan && image.url) ??
    ordered.find((image) => !image.is_floorplan && image.url) ??
    ordered.find((image) => image.url);

  return preferred?.url ?? null;
}

function orderPropstackImages(images?: PropstackImage[] | null) {
  return [...(images ?? [])]
    .map((image, index) => ({ image, index }))
    .sort((a, b) => {
      const positionDelta = (a.image.position ?? Number.MAX_SAFE_INTEGER) - (b.image.position ?? Number.MAX_SAFE_INTEGER);
      if (positionDelta !== 0) return positionDelta;
      return a.index - b.index;
    })
    .map(({ image }) => image);
}

function mapImages(images?: PropstackImage[] | null): PropertyDetailImage[] {
  const visibleImages = orderPropstackImages(images).filter((image) => image.url && !image.is_private);
  if (visibleImages.length === 0) return [];

  return visibleImages.map((image) => ({
    url: image.url,
    title: normalizeText(image.title) || "Objektbild",
    position: image.position ?? 9999,
    isFloorplan: Boolean(image.is_floorplan),
    tags: toArray<string>(image.tags).filter(Boolean),
  }));
}

function buildAddress(property: PropstackProperty) {
  const shortAddress = normalizeText(property.short_address);
  if (shortAddress) return shortAddress;

  const street = [normalizeText(property.street), normalizeText(property.house_number)].filter(Boolean).join(" ");
  const locality = [normalizeText(property.zip_code), normalizeText(property.city)].filter(Boolean).join(" ");
  return [street, locality].filter(Boolean).join(", ");
}

function resolvePrice(property: PropstackProperty) {
  const marketingType = normalizeText(property.marketing_type).toUpperCase();

  if (marketingType === "RENT") {
    const baseRent = toNumberOrNull(property.base_rent);
    const totalRent = toNumberOrNull(property.total_rent);
    const fallbackRent = toNumberOrNull(property.price);

    if (baseRent !== null) {
      return { amount: baseRent, label: "Kaltmiete", period: "month" as const };
    }

    if (totalRent !== null) {
      return { amount: totalRent, label: "Warmmiete", period: "month" as const };
    }

    return { amount: fallbackRent, label: "Miete", period: "month" as const };
  }

  return {
    amount: firstNumber(property.price),
    label: "Kaufpreis",
    period: null,
  };
}

function isCommercialProperty(property: Pick<PropstackProperty, "object_type" | "rs_type" | "rs_category">) {
  const values = [property.object_type, property.rs_type, property.rs_category]
    .map((value) => normalizeText(value).toUpperCase())
    .filter(Boolean);

  return values.some((value) =>
    [
      "COMMERCIAL",
      "OFFICE",
      "OFFICE_FLOOR",
      "OFFICE_BUILDING",
      "OFFICE_CENTRE",
      "OFFICE_STORAGE_BUILDING",
      "STORE",
      "GASTRONOMY",
      "INDUSTRY",
      "SPECIAL_PURPOSE",
      "INVESTMENT",
    ].includes(value),
  );
}

function isAurichPrimaryCity(city: string) {
  return normalizeCity(city) === PRIMARY_CITY;
}

function isAurichSurroundingCity(city: string) {
  const normalized = normalizeCity(city);
  return normalized === PRIMARY_CITY || SURROUNDING_CITIES.includes(normalized as (typeof SURROUNDING_CITIES)[number]);
}

function toListItem(property: PropstackProperty): PropertyListItem {
  const title = resolveTitle(property);
  const city = normalizeText(property.city) || "Ostfriesland";
  const scope = isAurichPrimaryCity(city) ? "aurich" : "umgebung";
  const displayLocation = resolveDisplayLocation(property, title, city);
  const resolvedPrice = resolvePrice(property);

  return {
    id: property.id,
    slug: `${slugify(title)}-${property.id}`,
    title,
    city,
    displayLocation,
    marketingType: property.marketing_type ?? null,
    zipCode: normalizeText(property.zip_code) || null,
    shortAddress: buildAddress(property),
    price: resolvedPrice.amount,
    priceLabel: resolvedPrice.label,
    pricePeriod: resolvedPrice.period,
    priceOnInquiry: Boolean(property.price_on_inquiry),
    isCommercial: isCommercialProperty(property),
    baseRent: toNumberOrNull(property.base_rent),
    totalRent: toNumberOrNull(property.total_rent),
    serviceCharge: toNumberOrNull(property.service_charge),
    heatingCosts: toNumberOrNull(property.heating_costs),
    rentSubsidy: toNumberOrNull(property.rent_subsidy),
    pricePerSqm: toNumberOrNull(property.price_per_sqm),
    livingSpace: toNumberOrNull(property.living_space),
    usableFloorSpace: firstNumber(property.usable_floor_space, property.property_space_value),
    plotArea: toNumberOrNull(property.plot_area),
    numberOfRooms: toNumberOrNull(property.number_of_rooms),
    excerpt: resolveDescription(property),
    imageUrl: resolveImage(property),
    publicExposeUrl: property.public_expose_url ?? null,
    propertyTypeLabel: getGermanPropertyTypeLabel(property.rs_category ?? null, property.rs_type ?? null, property.object_type ?? null),
    constructionYear: property.construction_year ?? null,
    courtage: property.courtage ?? null,
    courtageNote: property.courtage_note ?? null,
    locationNote: property.location_note ?? findGermanTranslation(property)?.location_note ?? null,
    furnishingNote: property.furnishing_note ?? findGermanTranslation(property)?.furnishing_note ?? null,
    otherNote: property.other_note ?? findGermanTranslation(property)?.other_note ?? null,
    scope,
  };
}

async function getPropertyStatuses() {
  const response = await propstackFetch<PropstackListResponse<PropstackPropertyStatus> | PropstackPropertyStatus[]>(
    "/property_statuses",
  );

  if (Array.isArray(response)) {
    return response;
  }

  return toArray<PropstackPropertyStatus>(response?.data);
}

function normalizePropertyStatusName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("de-DE");
}

async function getPublicWebsiteStatusIds() {
  const statuses = await getPropertyStatuses();
  return statuses
    .filter((status) => PUBLIC_WEBSITE_PROPERTY_STATUS_NAMES.has(normalizePropertyStatusName(status.name)))
    .map((status) => status.id);
}

async function getRawMarketingProperties() {
  const statusIds = await getPublicWebsiteStatusIds();
  if (statusIds.length === 0) return [] as PropstackProperty[];
  const allowedStatusIds = new Set(statusIds.map(Number));

  const properties: PropstackProperty[] = [];
  const perPage = 100;
  for (let page = 1; page <= 10; page += 1) {
    const response = await propstackFetch<PropstackListResponse<PropstackProperty> | PropstackProperty[]>("/properties", {
      per: perPage,
      page,
      sort_by: "updated_at",
      order: "desc",
    });
    const pageItems = toPropstackList(response);
    properties.push(...pageItems);
    if (pageItems.length < perPage) break;
  }

  return properties.filter(
    (property) => property.property_status_id != null && allowedStatusIds.has(Number(property.property_status_id)),
  );
}

export async function getImmobilienAurichListingResult(): Promise<PropertyListingResult> {
  try {
    const rawProperties = await getRawMarketingProperties();
    const mapped = rawProperties.map(toListItem);
    const aurichFirst = mapped.sort((a, b) => {
      if (a.scope === b.scope) return 0;
      return a.scope === "aurich" ? -1 : 1;
    });

    return {
      items: aurichFirst,
      coverage: "aurich-und-umgebung",
    };
  } catch (error) {
    console.error("Propstack listings konnten nicht live geladen werden. Verwende Snapshot-Fallback.", error);
    const snapshotProperties = getSnapshotProperties();
    if (!snapshotProperties) {
      return {
        items: [],
        coverage: "aurich-und-umgebung",
      };
    }

    const mapped = snapshotProperties.map(toListItem);
    const aurichFirst = mapped.sort((a, b) => {
      if (a.scope === b.scope) return 0;
      return a.scope === "aurich" ? -1 : 1;
    });

    return {
      items: aurichFirst,
      coverage: "aurich-und-umgebung",
    };
  }
}

export async function getPropstackPropertyById(id: number) {
  try {
    const [property, v1Supplement] = await Promise.all([
      propstackFetch<PropstackProperty>(`/properties/${id}`),
      propstackV1Fetch<Pick<PropstackProperty, "custom_fields" | "fields" | "monument" | "optional_fields">>(
        `/units/${id}`,
      ).catch(() => null),
    ]);

    if (!v1Supplement) return property;

    return {
      ...property,
      custom_fields: v1Supplement.custom_fields ?? property.custom_fields,
      fields: v1Supplement.fields ?? property.fields,
      monument: v1Supplement.monument ?? property.monument,
      optional_fields: v1Supplement.optional_fields ?? property.optional_fields,
    };
  } catch (error) {
    console.error(`Propstack Immobilie ${id} konnte nicht live geladen werden. Verwende Snapshot-Fallback.`, error);
    return getSnapshotPropertyById(id);
  }
}

export async function getPropstackBrokerById(id: number | null | undefined) {
  if (!id) return null;
  const snapshotBroker = getSnapshotBrokerById(id);

  const v1Response = await propstackV1Fetch<PropstackBroker | { data?: PropstackBroker }>(`/brokers/${id}`).catch(
    () => null,
  );
  const v1Broker = getPropstackBrokerFromResponse(v1Response);
  if (v1Broker) return v1Broker;

  const response = await propstackFetch<PropstackBroker | { data?: PropstackBroker }>(`/brokers/${id}`).catch(
    () => null,
  );
  return getPropstackBrokerFromResponse(response) ?? snapshotBroker;
}

export function getPropertyIdFromSlug(slug: string) {
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function propertyBelongsToAurichArea(property: PropstackProperty) {
  return isAurichSurroundingCity(property.city ?? "");
}

export async function propertyHasMarketingStatus(property: PropstackProperty) {
  try {
    const statusIds = new Set((await getPublicWebsiteStatusIds()).map(Number));
    return property.property_status_id != null && statusIds.has(Number(property.property_status_id));
  } catch (error) {
    console.error("Propstack Status konnte nicht live geprüft werden. Verwende Snapshot-Fallback.", error);
    const snapshotProperties = getSnapshotProperties();
    return snapshotProperties?.some((item) => Number(item.id) === Number(property.id)) ?? false;
  }
}

export function mapPropertyDetail(property: PropstackProperty, broker?: PropstackBroker | null): PropertyDetail {
  const base = toListItem(property);
  const images = mapImages(property.images);
  const contactPhoneDisplay = normalizeText(broker?.public_phone) || null;
  const contactMobileDisplay =
    normalizeText(broker?.public_cell) ||
    [normalizeText(broker?.phone), normalizeText(broker?.cell)].filter(Boolean).join(" ") ||
    null;

  return {
    ...base,
    unitId: normalizeText(property.unit_id) || null,
    schemaType: property.rs_type === "HOUSE" ? "House" : "Apartment",
    street: normalizeText(property.street) || null,
    houseNumber: normalizeText(property.house_number) || null,
    zipCode: normalizeText(property.zip_code) || null,
    address: normalizeText(property.address) || null,
    latitude: property.lat ?? null,
    longitude: property.lng ?? null,
    numberOfBedrooms: property.number_of_bed_rooms ?? null,
    numberOfBathrooms: property.number_of_bath_rooms ?? null,
    usableFloorSpace: base.usableFloorSpace,
    numberOfFloors: property.number_of_floors ?? null,
    condition: normalizeText(property.condition) || null,
    energyEfficiencyClass: normalizeText(property.energy_efficiency_class) || null,
    energyEfficiencyValue: property.energy_efficiency_value ?? null,
    thermalCharacteristic: normalizeText(property.thermal_characteristic) || null,
    energyCarrier: normalizeEnergyCarrier(property.firing_types),
    monumentProtection: resolveMonumentProtection(property),
    cellar: Boolean(property.cellar),
    balcony: Boolean(property.balcony),
    garden: Boolean(property.garden),
    guestToilet: Boolean(property.guest_toilet),
    kitchenComplete: Boolean(property.kitchen_complete),
    descriptionNote: normalizeText(property.description_note) || normalizeText(findGermanTranslation(property)?.description_note) || null,
    locationNote: normalizeText(property.location_note) || normalizeText(findGermanTranslation(property)?.location_note) || null,
    furnishingNote: normalizeText(property.furnishing_note) || normalizeText(findGermanTranslation(property)?.furnishing_note) || null,
    otherNote: normalizeText(property.other_note) || normalizeText(findGermanTranslation(property)?.other_note) || null,
    galleryImages: images.filter((image) => !image.isFloorplan),
    floorplanImages: images.filter((image) => image.isFloorplan),
    contactName: normalizeBrokerName(broker),
    contactTitle: normalizeBrokerTitle(
      getCustomFieldText(broker?.custom?.titel) ??
        getCustomFieldText(broker?.custom_fields?.titel) ??
        getCustomFieldText(broker?.custom_fields?.Titel),
    ),
    contactEmail: normalizeText(broker?.public_email) || normalizeText(broker?.email) || null,
    contactPhoneDisplay,
    contactPhoneHref: normalizePhoneHref(contactPhoneDisplay),
    contactMobileDisplay,
    contactMobileHref: normalizePhoneHref(contactMobileDisplay),
    contactImagePath: normalizeText(broker?.avatar_url) || normalizeText(broker?.avatar) || null,
  } satisfies PropertyDetail;
}
