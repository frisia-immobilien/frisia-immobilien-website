import { getGermanPropertyTypeLabel } from "@/lib/property-labels";
import type { LeadProgressRecord } from "@/lib/lead-progress";
import type {
  LeadSyncCondition,
  LeadSyncPayload,
  LeadSyncQuality,
  LeadSyncReason,
  LeadSyncSalutation,
  LeadSyncUsage,
} from "@/lib/lead-sync";

const DEFAULT_PROPSTACK_V1_BASE_URL = "https://api.propstack.de/v1";

type PropstackKeyValue = {
  id: number;
  name?: string | null;
  title?: string | null;
  label?: string | null;
  key?: string | null;
};

type PropstackBroker = {
  id: number;
  name?: string | null;
  email?: string | null;
};

type PropstackDealStage = {
  id: number;
  name?: string | null;
  position?: number | null;
};

type PropstackDealPipeline = {
  id: number;
  name?: string | null;
  broker_ids?: number[] | null;
  deal_stages?: PropstackDealStage[] | null;
};

type LeadMeta = {
  brokerId: number | null;
  contactStatusId: number | null;
  contactSourceId: number | null;
  propertyStatusId: number | null;
  activityTypeId: number | null;
  dealPipelineId: number | null;
  dealStageId: number | null;
};

type PropstackSyncResult = {
  contactId: number | null;
  propertyId: number | null;
  dealId: number | null;
  taskId: number | null;
  ownerLinked: boolean;
};

let leadMetaPromise: Promise<LeadMeta> | null = null;

const SYSTEM_BROKER_MARKERS = [
  "admin",
  "propstack",
  "anrufprotokoll",
  "bewerbung",
  "buchhaltung",
  "datenschutz",
  "einkauf",
  "info",
  "innendienst",
  "leads",
  "marketing",
  "portal",
  "socialmedia",
];

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeSlug(value: unknown) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) return false;
      if (typeof entry === "string" && entry.trim().length === 0) return false;
      if (Array.isArray(entry) && entry.length === 0) return false;
      return true;
    }),
  ) as T;
}

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (Array.isArray((value as { data?: unknown[] } | null)?.data)) {
    return ((value as { data?: unknown[] }).data ?? []) as T[];
  }
  return [];
}

function extractId(value: unknown): number | null {
  if (typeof (value as { id?: unknown } | null)?.id === "number") {
    return (value as { id: number }).id;
  }

  const data = (value as { data?: unknown } | null)?.data;
  if (typeof (data as { id?: unknown } | null)?.id === "number") {
    return (data as { id: number }).id;
  }

  const client = (value as { client?: unknown } | null)?.client;
  if (typeof (client as { id?: unknown } | null)?.id === "number") {
    return (client as { id: number }).id;
  }

  const property = (value as { property?: unknown } | null)?.property;
  if (typeof (property as { id?: unknown } | null)?.id === "number") {
    return (property as { id: number }).id;
  }

  const clientProperty = (value as { client_property?: unknown } | null)?.client_property;
  if (typeof (clientProperty as { id?: unknown } | null)?.id === "number") {
    return (clientProperty as { id: number }).id;
  }

  const task = (value as { task?: unknown } | null)?.task;
  if (typeof (task as { id?: unknown } | null)?.id === "number") {
    return (task as { id: number }).id;
  }

  return null;
}

function getPropstackV1Config() {
  const apiKey = process.env.PROPSTACK_API_KEY;
  const configuredBaseUrl = process.env.PROPSTACK_V1_BASE_URL;
  const fallbackBaseUrl = process.env.PROPSTACK_BASE_URL?.replace(/\/v2\/?$/i, "/v1");
  const baseUrl = configuredBaseUrl ?? fallbackBaseUrl ?? DEFAULT_PROPSTACK_V1_BASE_URL;

  if (!apiKey) {
    throw new Error("PROPSTACK_API_KEY ist nicht gesetzt.");
  }

  return { apiKey, baseUrl };
}

async function propstackV1Fetch<T>(
  path: string,
  init?: {
    method?: "GET" | "POST" | "PUT";
    body?: unknown;
  },
) {
  const { apiKey, baseUrl } = getPropstackV1Config();
  const url = `${baseUrl}${path}`;
  const method = init?.method ?? "GET";

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    cache: "no-store",
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const raw = await response.text();
  if (!response.ok) {
    const excerpt = raw.slice(0, 400);
    throw new Error(`Propstack ${method} ${path} fehlgeschlagen (${response.status}): ${excerpt}`);
  }

  if (!raw) {
    return null as T;
  }

  return JSON.parse(raw) as T;
}

async function fetchKeyValueCatalog(paths: string[]) {
  for (const path of paths) {
    try {
      const response = await propstackV1Fetch<unknown>(path);
      const items = toArray<PropstackKeyValue>(response);
      if (items.length > 0) return items;
    } catch {
      // Nächstes Endpoint-Fallback versuchen.
    }
  }

  return [] as PropstackKeyValue[];
}

function keyValueName(item: PropstackKeyValue) {
  return item.name ?? item.title ?? item.label ?? item.key ?? "";
}

function matchKeyValueByNames(items: PropstackKeyValue[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeSlug).filter(Boolean);

  return (
    normalizedCandidates
      .map((candidate) =>
        items.find((item) => normalizeSlug(keyValueName(item)) === candidate),
      )
      .find(Boolean) ??
    normalizedCandidates
      .map((candidate) =>
        items.find((item) => normalizeSlug(keyValueName(item)).includes(candidate)),
      )
      .find(Boolean) ??
    null
  );
}

function matchBrokerByNames(items: PropstackBroker[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeSlug).filter(Boolean);

  return (
    items.find((item) =>
      normalizedCandidates.some((candidate) => normalizeSlug(item.name) === candidate),
    ) ??
    items.find((item) =>
      normalizedCandidates.some((candidate) => normalizeSlug(item.email) === candidate),
    ) ??
    items.find((item) =>
      normalizedCandidates.some((candidate) => normalizeSlug(item.name).includes(candidate)),
    ) ??
    items.find((item) =>
      normalizedCandidates.some((candidate) => normalizeSlug(item.email).includes(candidate)),
    ) ??
    null
  );
}

function looksLikeSystemBroker(item: PropstackBroker) {
  const haystack = [item.name, item.email].map(normalizeSlug).join(" ");
  return SYSTEM_BROKER_MARKERS.some((candidate) => haystack.includes(candidate));
}

function resolveHouseCategory(payload: LeadSyncPayload) {
  switch (payload.houseType) {
    case "multi_family":
      return "MULTI_FAMILY_HOUSE";
    case "semi_detached":
      return "SEMI_DETACHED_HOUSE";
    case "row_mid":
      return "MID_TERRACE_HOUSE";
    case "row_end":
      return "TERRACED_END_HOUSE";
    case "single_family":
    default:
      return "SINGLE_FAMILY_HOUSE";
  }
}

function resolveMarketingType(payload: LeadSyncPayload) {
  return payload.facts?.reason === "rent_out" ? "RENT" : "BUY";
}

function resolvePropstackPropertyType(payload: LeadSyncPayload) {
  if (payload.propertyType === "apartment") {
    return {
      objectType: "LIVING",
      rsType: "APARTMENT",
      rsCategory: "APARTMENT",
    };
  }

  if (payload.propertyType === "land") {
    return {
      objectType: "INVESTMENT",
      rsType: "INVESTMENT",
      rsCategory: "INVEST_PLOT",
    };
  }

  return {
    objectType: "LIVING",
    rsType: "HOUSE",
    rsCategory: resolveHouseCategory(payload),
  };
}

function resolveSalutation(value: LeadSyncSalutation | undefined) {
  if (value === "mrs") return "Frau";
  if (value === "mr") return "Herr";
  return undefined;
}

function formatLocationLabel(payload: LeadSyncPayload) {
  const location = payload.location;
  const streetLine = [location?.street, location?.houseNumber].filter(Boolean).join(" ");
  const cityLine = [location?.postalCode, location?.city].filter(Boolean).join(" ");
  return [streetLine, cityLine].filter(Boolean).join(", ");
}

function buildLeadTitle(payload: LeadSyncPayload) {
  const propertyTypeLabel = getGermanPropertyTypeLabel(
    payload.propertyType === "house" || payload.propertyType === "apartment"
      ? resolvePropstackPropertyType(payload).rsType
      : "INVESTMENT",
    resolvePropstackPropertyType(payload).rsCategory,
  );

  const locationLabel = formatLocationLabel(payload);

  return ["Eigentümerlead", propertyTypeLabel, locationLabel].filter(Boolean).join(" · ");
}

function formatArea(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `${value} m²` : "k. A.";
}

function formatReasonLabel(value: LeadSyncReason | undefined) {
  switch (value) {
    case "sale":
      return "Verkauf";
    case "buy":
      return "Kauf";
    case "rent_out":
      return "Vermietung";
    default:
      return "k. A.";
  }
}

function formatUsageLabel(value: LeadSyncUsage | undefined) {
  switch (value) {
    case "owner_occupied":
      return "Eigennutzung";
    case "rented":
      return "Vermietet";
    case "vacant":
      return "Leerstehend";
    default:
      return "k. A.";
  }
}

function formatConditionLabel(value: LeadSyncCondition | undefined) {
  switch (value) {
    case "good":
      return "Gut";
    case "normal":
      return "Normal";
    case "needs_work":
      return "Renovierungsbedürftig";
    default:
      return "k. A.";
  }
}

function formatQualityLabel(value: LeadSyncQuality | undefined) {
  switch (value) {
    case "simple":
      return "Einfach";
    case "medium":
      return "Mittel";
    case "high":
      return "Gehoben";
    case "very_high":
      return "Sehr gehoben";
    default:
      return "k. A.";
  }
}

function formatExtraLabel(value: string) {
  switch (normalizeSlug(value)) {
    case "garden":
      return "Garten";
    case "terrace":
      return "Terrasse";
    case "balcony":
      return "Balkon";
    case "guest wc":
    case "guest toilet":
      return "Gäste-WC";
    case "parking":
      return "Stellplatz";
    default:
      return value;
  }
}

function buildDealNote(payload: LeadSyncPayload) {
  const lines = [
    "Immobilienbewertung",
    "",
    `Objekt: ${buildLeadTitle(payload)}`,
    `Grund: ${payload.facts?.reason ?? "k. A."}`,
    `Nutzung: ${payload.facts?.usage ?? "k. A."}`,
    `Wohnfläche: ${formatArea(payload.facts?.livingArea)}`,
    `Grundstück: ${formatArea(payload.facts?.landSize)}`,
    `Zimmer: ${
      typeof payload.facts?.rooms === "number" && Number.isFinite(payload.facts.rooms)
        ? payload.facts.rooms
        : "k. A."
    }`,
  ];

  return lines.join("\n");
}

function buildTaskBody(payload: LeadSyncPayload) {
  const person = payload.person;
  const extras =
    payload.facts?.extras?.filter(Boolean).map(formatExtraLabel).join(", ") || "k. A.";
  const notes = normalizeText(person?.notes) || "Keine";
  const name = [person?.firstName, person?.lastName].filter(Boolean).join(" ") || "k. A.";
  const rooms =
    typeof payload.facts?.rooms === "number" && Number.isFinite(payload.facts.rooms)
      ? payload.facts.rooms
      : "k. A.";

  return [
    "Immobilienbewertung prüfen / Eigentümer zurückrufen",
    "",
    "Objekt",
    `Objekt: ${buildLeadTitle(payload)}`,
    "",
    "Kontakt",
    `Name: ${name}`,
    `E-Mail: ${normalizeText(payload.email) || "k. A."}`,
    `Telefon: ${normalizeText(person?.phone) || "k. A."}`,
    "",
    "Objektdaten",
    `Grund: ${formatReasonLabel(payload.facts?.reason)}`,
    `Nutzung: ${formatUsageLabel(payload.facts?.usage)}`,
    `Baujahr: ${payload.facts?.yearBuilt ?? "k. A."}`,
    `Wohnfläche: ${formatArea(payload.facts?.livingArea)}`,
    `Grundstück: ${formatArea(payload.facts?.landSize)}`,
    `Zimmer: ${rooms}`,
    `Energieklasse: ${normalizeText(payload.facts?.energyClass) || "k. A."}`,
    `Zustand: ${formatConditionLabel(payload.facts?.condition)}`,
    `Ausstattung: ${formatQualityLabel(payload.facts?.qualityId)}`,
    `Extras: ${extras}`,
    "",
    "Hinweise",
    `Hinweise: ${notes}`,
  ].join("\n");
}

function formatImmobilienbewertungRemark(createdAt: string) {
  const date = new Date(createdAt);
  const dateLabel = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Berlin",
  }).format(date);

  return `Datensatz aus Immobilienbewertung vom ${dateLabel} / ${timeLabel} Uhr`;
}

function buildContactAttributes(
  payload: LeadSyncPayload,
  meta: LeadMeta,
  createdAt: string,
) {
  const person = payload.person;
  const location = payload.location;
  const description = [formatImmobilienbewertungRemark(createdAt), normalizeText(person?.notes)]
    .filter(Boolean)
    .join("\n\n");

  return compactObject({
    email: normalizeText(payload.email).toLowerCase(),
    accept_contact: payload.consent === true,
    gdpr_status: payload.consent === true ? 2 : undefined,
    client_status_id: meta.contactStatusId ?? undefined,
    client_source_id: meta.contactSourceId ?? undefined,
    broker_id: meta.brokerId ?? undefined,
    salutation: resolveSalutation(person?.salutation),
    first_name: normalizeText(person?.firstName) || undefined,
    last_name: normalizeText(person?.lastName) || undefined,
    mobile_phone: normalizeText(person?.phone) || undefined,
    home_street: normalizeText(location?.street) || undefined,
    home_house_number: normalizeText(location?.houseNumber) || undefined,
    home_zip_code: normalizeText(location?.postalCode) || undefined,
    home_city: normalizeText(location?.city) || undefined,
    home_country: "DE",
    description: description || undefined,
  });
}

function buildPropertyAttributes(payload: LeadSyncPayload, meta: LeadMeta) {
  const location = payload.location;
  const propertyType = resolvePropstackPropertyType(payload);

  return compactObject({
    title: buildLeadTitle(payload),
    marketing_type: resolveMarketingType(payload),
    object_type: propertyType.objectType,
    rs_type: propertyType.rsType,
    rs_category: propertyType.rsCategory,
    property_status_id: meta.propertyStatusId ?? undefined,
    broker_id: meta.brokerId ?? undefined,
    street: normalizeText(location?.street) || undefined,
    house_number: normalizeText(location?.houseNumber) || undefined,
    zip_code: normalizeText(location?.postalCode) || undefined,
    city: normalizeText(location?.city) || undefined,
    country: "DE",
    lat:
      typeof location?.lat === "number" && Number.isFinite(location.lat) ? location.lat : undefined,
    lng:
      typeof location?.lon === "number" && Number.isFinite(location.lon) ? location.lon : undefined,
    living_space:
      typeof payload.facts?.livingArea === "number" && Number.isFinite(payload.facts.livingArea)
        ? payload.facts.livingArea
        : undefined,
    plot_area:
      typeof payload.facts?.landSize === "number" && Number.isFinite(payload.facts.landSize)
        ? payload.facts.landSize
        : undefined,
    number_of_rooms:
      typeof payload.facts?.rooms === "number" && Number.isFinite(payload.facts.rooms)
        ? payload.facts.rooms
        : undefined,
    construction_year:
      typeof payload.facts?.yearBuilt === "number" && Number.isFinite(payload.facts.yearBuilt)
        ? payload.facts.yearBuilt
        : undefined,
    energy_efficiency_class: normalizeText(payload.facts?.energyClass) || undefined,
  });
}

async function createOrUpdateContact(
  contactId: number | null,
  progress: LeadProgressRecord,
  payload: LeadSyncPayload,
  meta: LeadMeta,
) {
  const body = { client: buildContactAttributes(payload, meta, progress.createdAt) };

  if (contactId) {
    const updated = await propstackV1Fetch<unknown>(`/contacts/${contactId}`, {
      method: "PUT",
      body,
    });
    return extractId(updated) ?? contactId;
  }

  const created = await propstackV1Fetch<unknown>("/contacts", {
    method: "POST",
    body,
  });

  return extractId(created);
}

async function createOrUpdateProperty(
  propertyId: number | null,
  payload: LeadSyncPayload,
  meta: LeadMeta,
) {
  const body = { property: buildPropertyAttributes(payload, meta) };

  if (propertyId) {
    const updated = await propstackV1Fetch<unknown>(`/units/${propertyId}`, {
      method: "PUT",
      body,
    });
    return extractId(updated) ?? propertyId;
  }

  const created = await propstackV1Fetch<unknown>("/units", {
    method: "POST",
    body,
  });

  return extractId(created);
}

async function createOwnership(contactId: number, propertyId: number) {
  await propstackV1Fetch<unknown>("/ownerships", {
    method: "POST",
    body: {
      client_id: contactId,
      property_id: propertyId,
    },
  });
}

async function createOrUpdateDeal(
  dealId: number | null,
  contactId: number,
  propertyId: number,
  payload: LeadSyncPayload,
  meta: LeadMeta,
) {
  if (!meta.dealStageId) {
    throw new Error("Keine passende Deal-Stage für Akquise-Leads gefunden.");
  }

  const body = {
    client_property: compactObject({
      client_id: contactId,
      property_id: propertyId,
      deal_stage_id: meta.dealStageId,
      broker_id: meta.brokerId ?? undefined,
      client_source_id: meta.contactSourceId ?? undefined,
      note: buildDealNote(payload),
    }),
  };

  if (dealId) {
    const updated = await propstackV1Fetch<unknown>(`/client_properties/${dealId}`, {
      method: "PUT",
      body,
    });
    return extractId(updated) ?? dealId;
  }

  const created = await propstackV1Fetch<unknown>("/client_properties", {
    method: "POST",
    body,
  });

  return extractId(created);
}

function buildNextBusinessDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  if (date.getDay() === 6) date.setDate(date.getDate() + 2);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 10);
}

async function createOrUpdateTask(
  taskId: number | null,
  contactId: number,
  propertyId: number,
  payload: LeadSyncPayload,
  meta: LeadMeta,
) {
  const body = {
    task: compactObject({
      is_reminder: true,
      title: "Immobilienbewertung prüfen / Eigentümer zurückrufen",
      note_type_id: meta.activityTypeId ?? undefined,
      client_ids: [contactId],
      property_ids: [propertyId],
      broker_id: meta.brokerId ?? undefined,
      task_creator_id: meta.brokerId ?? undefined,
      task_updater_id: meta.brokerId ?? undefined,
      due_date: buildNextBusinessDate(),
      body: buildTaskBody(payload),
    }),
  };

  if (taskId) {
    const updated = await propstackV1Fetch<unknown>(`/tasks/${taskId}`, {
      method: "PUT",
      body,
    });
    return extractId(updated) ?? taskId;
  }

  const created = await propstackV1Fetch<unknown>("/tasks", {
    method: "POST",
    body,
  });

  return extractId(created);
}

async function resolveLeadMetaInternal(): Promise<LeadMeta> {
  const [brokers, pipelines, propertyStatuses, contactStatuses, contactSources, activityTypes] =
    await Promise.all([
      propstackV1Fetch<unknown>("/brokers").then(toArray<PropstackBroker>).catch(() => []),
      propstackV1Fetch<unknown>("/deal_pipelines")
        .then(toArray<PropstackDealPipeline>)
        .catch(() => []),
      propstackV1Fetch<unknown>("/property_statuses")
        .then(toArray<PropstackKeyValue>)
        .catch(() => []),
      fetchKeyValueCatalog(["/contact_statuses", "/datadump/contact_statuses"]),
      fetchKeyValueCatalog(["/contact_sources", "/datadump/contact_sources"]),
      fetchKeyValueCatalog(["/activity_types", "/note_types"]),
    ]);

  const brokerId =
    (process.env.PROPSTACK_LEAD_BROKER_ID
      ? Number(process.env.PROPSTACK_LEAD_BROKER_ID)
      : null) ||
    matchBrokerByNames(brokers, [
      process.env.PROPSTACK_LEAD_BROKER_NAME || "",
      process.env.PROPSTACK_LEAD_BROKER_EMAIL || "",
    ])?.id ||
    brokers.find((item) => !looksLikeSystemBroker(item) && !normalizeSlug(item.name).includes("@"))
      ?.id ||
    brokers[0]?.id ||
    null;

  const contactStatusId =
    (process.env.PROPSTACK_LEAD_STATUS_ID ? Number(process.env.PROPSTACK_LEAD_STATUS_ID) : null) ||
    matchKeyValueByNames(contactStatuses, [
      process.env.PROPSTACK_LEAD_STATUS_NAME || "",
      "akquise",
      "eigentuemer",
      "kunde",
      "lead",
      "neuer lead",
      "immobilienbewertung",
    ])?.id ||
    null;

  const contactSourceId =
    (process.env.PROPSTACK_LEAD_SOURCE_ID ? Number(process.env.PROPSTACK_LEAD_SOURCE_ID) : null) ||
    matchKeyValueByNames(contactSources, [
      process.env.PROPSTACK_LEAD_SOURCE_NAME || "",
      "homepage immobilienbewertung",
      "online immobilienbewertung",
      "immobilienbewertung",
      "homepage",
      "webseite",
      "immobilienbewertung",
      "website",
      "web",
      "online",
    ])?.id ||
    null;

  const propertyStatusId =
    (process.env.PROPSTACK_LEAD_PROPERTY_STATUS_ID
      ? Number(process.env.PROPSTACK_LEAD_PROPERTY_STATUS_ID)
      : null) ||
    matchKeyValueByNames(propertyStatuses, [
      process.env.PROPSTACK_LEAD_PROPERTY_STATUS_NAME || "",
      "lead",
      "akquise",
      "in vorbereitung",
      "neu",
    ])?.id ||
    propertyStatuses[0]?.id ||
    null;

  const activityTypeId =
    (process.env.PROPSTACK_LEAD_ACTIVITY_TYPE_ID
      ? Number(process.env.PROPSTACK_LEAD_ACTIVITY_TYPE_ID)
      : null) ||
    matchKeyValueByNames(activityTypes, [
      process.env.PROPSTACK_LEAD_ACTIVITY_TYPE_NAME || "",
      "112 bewertungstermin vereinbaren",
      "bewertungstermin vereinbaren",
      "bewertungstermin",
      "rueckruf",
      "rückruf",
      "anruf",
      "telefonat",
      "aufgabe",
      "todo",
    ])?.id ||
    activityTypes[0]?.id ||
    null;

  const pipeline =
    (process.env.PROPSTACK_LEAD_PIPELINE_NAME
      ? pipelines.find(
          (item) => normalizeSlug(item.name) === normalizeSlug(process.env.PROPSTACK_LEAD_PIPELINE_NAME),
        )
      : null) ||
    pipelines.find((item) =>
      ["eigentuemer", "akquise", "einkauf", "bewertung", "owner"].some((candidate) =>
        normalizeSlug(item.name).includes(candidate),
      ),
    ) ||
    pipelines[0] ||
    null;

  const stage =
    (process.env.PROPSTACK_LEAD_STAGE_NAME
      ? pipeline?.deal_stages?.find(
          (item) =>
            normalizeSlug(item.name) === normalizeSlug(process.env.PROPSTACK_LEAD_STAGE_NAME),
        )
      : null) ||
    pipeline?.deal_stages?.find((item) =>
      ["lead", "neu", "anfrage", "bewertung", "kontakt"].some((candidate) =>
        normalizeSlug(item.name).includes(candidate),
      ),
    ) ||
    [...(pipeline?.deal_stages ?? [])].sort(
      (left, right) => Number(left.position ?? 0) - Number(right.position ?? 0),
    )[0] ||
    null;

  return {
    brokerId: brokerId ?? pipeline?.broker_ids?.[0] ?? null,
    contactStatusId,
    contactSourceId,
    propertyStatusId,
    activityTypeId,
    dealPipelineId: pipeline?.id ?? null,
    dealStageId: stage?.id ?? null,
  };
}

async function resolveLeadMeta() {
  if (!leadMetaPromise) {
    leadMetaPromise = resolveLeadMetaInternal().catch((error) => {
      leadMetaPromise = null;
      throw error;
    });
  }

  return leadMetaPromise;
}

export async function syncLeadProgressToPropstack(progress: LeadProgressRecord): Promise<PropstackSyncResult> {
  const payload = progress.payload;
  const meta = await resolveLeadMeta();

  const contactId = await createOrUpdateContact(progress.propstackContactId, progress, payload, meta);
  if (!contactId) {
    throw new Error("Propstack-Kontakt konnte nicht angelegt oder aktualisiert werden.");
  }

  const propertyId = await createOrUpdateProperty(progress.propstackPropertyId, payload, meta);
  if (!propertyId) {
    throw new Error("Propstack-Objekt konnte nicht angelegt oder aktualisiert werden.");
  }

  let ownerLinked = Boolean(progress.propstackOwnerLinkedAt);
  if (!ownerLinked) {
    await createOwnership(contactId, propertyId);
    ownerLinked = true;
  }

  const dealId = await createOrUpdateDeal(
    progress.propstackDealId,
    contactId,
    propertyId,
    payload,
    meta,
  );
  if (!dealId) {
    throw new Error("Propstack-Deal konnte nicht angelegt oder aktualisiert werden.");
  }

  const taskId = await createOrUpdateTask(
    progress.propstackTaskId,
    contactId,
    propertyId,
    payload,
    meta,
  );
  if (!taskId) {
    throw new Error("Propstack-Aufgabe konnte nicht angelegt oder aktualisiert werden.");
  }

  return {
    contactId,
    propertyId,
    dealId,
    taskId,
    ownerLinked,
  };
}
