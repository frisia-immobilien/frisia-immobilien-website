import { EMAIL } from "@/lib/site";

const DEFAULT_PROPSTACK_V1_BASE_URL = "https://api.propstack.de/v1";
const SEARCH_REQUEST_BROKER_ID = 395772;
const SEARCH_REQUEST_BROKER_CANDIDATES = [
  "info@",
  EMAIL,
] as const;

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

type SearchRequestMeta = {
  brokerId: number | null;
  contactStatusId: number | null;
  contactSourceId: number | null;
};

export type SearchRequestInput = {
  marketingType: "BUY" | "RENT" | "BOTH";
  propertyTypes: string[];
  locations: string;
  searchRadiusKm: number | null;
  budgetMax: number | null;
  livingSpaceMin: number | null;
  roomsMin: number | null;
  moveInTiming: string;
  financingStatus: string;
  saleIfBuyer: "YES" | "NO";
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

type PropstackSearchRequestResult = {
  contactId: number | null;
  savedQueryId: number | null;
  taskId: number | null;
  messageId: number | null;
};

let searchRequestMetaPromise: Promise<SearchRequestMeta> | null = null;

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
  if (typeof (value as { id?: unknown } | null)?.id === "number") return (value as { id: number }).id;

  const data = (value as { data?: unknown } | null)?.data;
  if (typeof (data as { id?: unknown } | null)?.id === "number") return (data as { id: number }).id;

  const client = (value as { client?: unknown } | null)?.client;
  if (typeof (client as { id?: unknown } | null)?.id === "number") return (client as { id: number }).id;

  const task = (value as { task?: unknown } | null)?.task;
  if (typeof (task as { id?: unknown } | null)?.id === "number") return (task as { id: number }).id;

  const message = (value as { message?: unknown } | null)?.message;
  if (typeof (message as { id?: unknown } | null)?.id === "number") return (message as { id: number }).id;

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

  return raw ? (JSON.parse(raw) as T) : (null as T);
}

async function fetchKeyValueCatalog(paths: string[]) {
  for (const path of paths) {
    try {
      const response = await propstackV1Fetch<unknown>(path);
      const items = toArray<PropstackKeyValue>(response);
      if (items.length > 0) return items;
    } catch {
      // Der nächste bekannte Endpoint-Fallback wird versucht.
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
      .map((candidate) => items.find((item) => normalizeSlug(keyValueName(item)) === candidate))
      .find(Boolean) ??
    normalizedCandidates
      .map((candidate) => items.find((item) => normalizeSlug(keyValueName(item)).includes(candidate)))
      .find(Boolean) ??
    null
  );
}

function matchBrokerByNames(items: PropstackBroker[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeSlug).filter(Boolean);

  return (
    normalizedCandidates
      .map((candidate) =>
        items.find((item) => normalizeSlug(item.name).includes(candidate) || normalizeSlug(item.email).includes(candidate)),
      )
      .find(Boolean) ?? null
  );
}

async function resolveSearchRequestMetaInternal(): Promise<SearchRequestMeta> {
  const [brokers, contactStatuses, contactSources] = await Promise.all([
    propstackV1Fetch<unknown>("/brokers")
      .then(toArray<PropstackBroker>)
      .catch(() => []),
    fetchKeyValueCatalog(["/contact_statuses", "/datadump/contact_statuses"]),
    fetchKeyValueCatalog(["/contact_sources", "/datadump/contact_sources"]),
  ]);

  const searchRequestBroker =
    brokers.find((item) => item.id === SEARCH_REQUEST_BROKER_ID) ||
    matchBrokerByNames(brokers, [...SEARCH_REQUEST_BROKER_CANDIDATES]);

  const brokerId =
    (process.env.PROPSTACK_SEARCH_BROKER_ID ? Number(process.env.PROPSTACK_SEARCH_BROKER_ID) : null) ||
    matchBrokerByNames(brokers, [
      process.env.PROPSTACK_SEARCH_BROKER_NAME || "",
      process.env.PROPSTACK_SEARCH_BROKER_EMAIL || "",
      process.env.PROPSTACK_LEAD_BROKER_NAME || "",
      process.env.PROPSTACK_LEAD_BROKER_EMAIL || "",
    ])?.id ||
    searchRequestBroker?.id ||
    brokers[0]?.id ||
    null;

  const contactStatusId =
    (process.env.PROPSTACK_SEARCH_STATUS_ID ? Number(process.env.PROPSTACK_SEARCH_STATUS_ID) : null) ||
    matchKeyValueByNames(contactStatuses, [
      process.env.PROPSTACK_SEARCH_STATUS_NAME || "",
      "suchauftrag",
      "suchkunde",
      "interessent",
      "lead",
      "neuer lead",
      "kunde",
    ])?.id ||
    null;

  const contactSourceId =
    (process.env.PROPSTACK_SEARCH_SOURCE_ID ? Number(process.env.PROPSTACK_SEARCH_SOURCE_ID) : null) ||
    matchKeyValueByNames(contactSources, [
      process.env.PROPSTACK_SEARCH_SOURCE_NAME || "",
      "homepage suchauftrag",
      "suchauftrag",
      "immobiliensuche",
      "homepage",
      "webseite",
      "website",
      "web",
      "online",
    ])?.id ||
    null;

  return { brokerId, contactStatusId, contactSourceId };
}

async function resolveSearchRequestMeta() {
  if (!searchRequestMetaPromise) {
    searchRequestMetaPromise = resolveSearchRequestMetaInternal().catch((error) => {
      searchRequestMetaPromise = null;
      throw error;
    });
  }

  return searchRequestMetaPromise;
}

function formatMarketingType(value: SearchRequestInput["marketingType"]) {
  if (value === "BUY") return "Kauf";
  if (value === "RENT") return "Miete";
  return "Kauf oder Miete";
}

function toSavedQueryMarketingType(value: SearchRequestInput["marketingType"]) {
  return value === "BOTH" ? undefined : value;
}

function toSavedQueryRsTypes(propertyTypes: string[]) {
  const values = new Set<string>();

  for (const propertyType of propertyTypes.map(normalizeSlug)) {
    if (propertyType.includes("haus")) values.add("HOUSE");
    if (propertyType.includes("wohnung")) values.add("APARTMENT");
    if (propertyType.includes("grundstueck")) values.add("TRADE_SITE");
    if (propertyType.includes("buero") || propertyType.includes("praxis")) values.add("OFFICE");
    if (propertyType.includes("gewerbe")) values.add("STORE");
    if (propertyType.includes("anlage")) values.add("INVESTMENT");
  }

  return [...values];
}

function splitSearchLocations(value: string) {
  return value
    .split(/[,;\n]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildSavedQueryNote(input: SearchRequestInput) {
  return [
    "Suchauftrag über frisia-immobilien.de",
    input.searchRadiusKm !== null ? `Umkreis: ${formatSearchRadius(input.searchRadiusKm)}` : "",
    input.moveInTiming ? `Zeitpunkt: ${input.moveInTiming}` : "",
    input.financingStatus ? `Finanzierung: ${input.financingStatus}` : "",
    `Eigene Immobilie verkaufen, wenn Frisia Immobilien eine passende neue Immobilie findet: ${formatSaleIfBuyer(input.saleIfBuyer)}`,
    input.notes ? `Hinweise: ${input.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatCurrency(value: number | null) {
  if (value === null) return "";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number | null, suffix: string) {
  if (value === null) return "";
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: value % 1 === 0 ? 0 : 1 }).format(value)} ${suffix}`;
}

function formatSearchRadius(value: number | null) {
  return value === null ? "flexibel" : formatNumber(value, "km");
}

function formatSaleIfBuyer(value: SearchRequestInput["saleIfBuyer"]) {
  return value === "YES" ? "Ja" : "Nein";
}

function formatContactName(input: SearchRequestInput) {
  return [input.firstName, input.lastName].filter(Boolean).join(" ");
}

function formatAddress(input: SearchRequestInput) {
  return [
    [input.addressStreet, input.addressHouseNumber].filter(Boolean).join(" "),
    [input.addressPostalCode, input.addressCity].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function formatCreatedAt() {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(new Date());
}

function buildPlainSearchDescription(input: SearchRequestInput) {
  const createdAt = formatCreatedAt();

  const rows = [
    `Suchauftrag über frisia-immobilien.de vom ${createdAt} Uhr`,
    "",
    `Kontakt: ${formatContactName(input)}`,
    `E-Mail: ${input.email}`,
    input.phone ? `Telefon: ${input.phone}` : "",
    `Adresse: ${formatAddress(input)}`,
    "",
    `Vermarktungsart: ${formatMarketingType(input.marketingType)}`,
    input.propertyTypes.length > 0 ? `Objektarten: ${input.propertyTypes.join(", ")}` : "",
    input.locations ? `Suchorte: ${input.locations}` : "",
    `Umkreis: ${formatSearchRadius(input.searchRadiusKm)}`,
    input.budgetMax !== null ? `Maximales Budget: ${formatCurrency(input.budgetMax)}` : "",
    input.livingSpaceMin !== null ? `Wohn-/Nutzfläche ab: ${formatNumber(input.livingSpaceMin, "m²")}` : "",
    input.roomsMin !== null ? `Zimmer ab: ${formatNumber(input.roomsMin, "Zimmer")}` : "",
    input.moveInTiming ? `Zeitpunkt: ${input.moveInTiming}` : "",
    input.financingStatus ? `Finanzierung: ${input.financingStatus}` : "",
    `Eigene Immobilie bei passendem Käufer verkaufen: ${formatSaleIfBuyer(input.saleIfBuyer)}`,
    input.notes ? `Weitere Hinweise: ${input.notes}` : "",
    "",
    "Einwilligung zur Kontaktaufnahme und Verarbeitung wurde auf der Website bestätigt.",
  ];

  return rows.filter((row, index, array) => row || array[index - 1]).join("\n").trim();
}

function htmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildSearchHtml(input: SearchRequestInput) {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.6;color:#1f2937;">
      <h2 style="margin:0 0 12px 0;color:#1B3040;">Suchauftrag Website</h2>
      <p><strong>Kontakt:</strong> ${htmlEscape(formatContactName(input))}</p>
      <p><strong>E-Mail:</strong> ${htmlEscape(input.email)}</p>
      <p><strong>Telefon:</strong> ${htmlEscape(input.phone || "nicht angegeben")}</p>
      <p><strong>Adresse:</strong> ${htmlEscape(formatAddress(input))}</p>
      <p><strong>Vermarktungsart:</strong> ${htmlEscape(formatMarketingType(input.marketingType))}</p>
      <p><strong>Objektarten:</strong> ${htmlEscape(input.propertyTypes.join(", ") || "offen")}</p>
      <p><strong>Suchorte:</strong> ${htmlEscape(input.locations)}</p>
      <p><strong>Umkreis:</strong> ${htmlEscape(formatSearchRadius(input.searchRadiusKm))}</p>
      <p><strong>Budget:</strong> ${htmlEscape(formatCurrency(input.budgetMax) || "offen")}</p>
      <p><strong>Fläche:</strong> ${htmlEscape(formatNumber(input.livingSpaceMin, "m²") || "offen")}</p>
      <p><strong>Zimmer:</strong> ${htmlEscape(formatNumber(input.roomsMin, "Zimmer") || "offen")}</p>
      <p><strong>Eigene Immobilie:</strong> ${htmlEscape(formatSaleIfBuyer(input.saleIfBuyer))}</p>
      ${input.notes ? `<p><strong>Hinweise:</strong><br>${htmlEscape(input.notes).replaceAll("\n", "<br>")}</p>` : ""}
    </div>
  `;
}

function buildContactBody(input: SearchRequestInput, meta: SearchRequestMeta) {
  return {
    client: compactObject({
      email: input.email.toLowerCase(),
      accept_contact: input.consent,
      gdpr_status: input.consent ? 2 : undefined,
      property_mailing_wanted: true,
      newsletter: false,
      client_status_id: meta.contactStatusId ?? undefined,
      client_source_id: meta.contactSourceId ?? undefined,
      broker_id: meta.brokerId ?? undefined,
      first_name: input.firstName,
      last_name: input.lastName,
      mobile_phone: input.phone || undefined,
      home_street: input.addressStreet,
      home_house_number: input.addressHouseNumber,
      home_zip_code: input.addressPostalCode,
      home_city: input.addressCity,
      home_country: "DE",
      description: buildPlainSearchDescription(input),
    }),
  };
}

async function createSavedQuery(contactId: number, input: SearchRequestInput, meta: SearchRequestMeta) {
  const locations = splitSearchLocations(input.locations);
  const rsTypes = toSavedQueryRsTypes(input.propertyTypes);
  const radius = input.searchRadiusKm === null ? undefined : input.searchRadiusKm * 1000;

  const body = {
    saved_query: compactObject({
      client_id: contactId,
      active: true,
      broker_id: meta.brokerId ?? undefined,
      cities: locations,
      radius,
      marketing_type: toSavedQueryMarketingType(input.marketingType),
      rs_types: rsTypes,
      note: buildSavedQueryNote(input),
      price_to:
        input.budgetMax !== null && input.marketingType !== "RENT"
          ? input.budgetMax
          : undefined,
      base_rent_to:
        input.budgetMax !== null && input.marketingType !== "BUY"
          ? input.budgetMax
          : undefined,
      living_space: input.livingSpaceMin ?? undefined,
      number_of_rooms: input.roomsMin ?? undefined,
    }),
  };

  const created = await propstackV1Fetch<unknown>("/saved_queries", {
    method: "POST",
    body,
  });

  return extractId(created);
}

async function createSearchTask(contactId: number, input: SearchRequestInput, meta: SearchRequestMeta) {
  const created = await propstackV1Fetch<unknown>("/tasks", {
    method: "POST",
    body: {
      task: compactObject({
        is_reminder: true,
        title: `Suchauftrag prüfen: ${formatContactName(input)}`,
        client_ids: [contactId],
        broker_id: meta.brokerId ?? undefined,
        task_creator_id: meta.brokerId ?? undefined,
        task_updater_id: meta.brokerId ?? undefined,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        body: buildPlainSearchDescription(input).replace(/\n/g, "<br>"),
      }),
    },
  });

  return extractId(created);
}

async function sendSearchNotification(contactId: number, input: SearchRequestInput, meta: SearchRequestMeta) {
  const created = await propstackV1Fetch<unknown>("/messages", {
    method: "POST",
    body: {
      message: compactObject({
        broker_id: meta.brokerId ?? SEARCH_REQUEST_BROKER_ID,
        to: [EMAIL],
        subject: `Suchauftrag Website – ${formatContactName(input)}`,
        body: buildSearchHtml(input),
        client_ids: [contactId],
      }),
    },
  });

  return extractId(created);
}

export async function createSearchRequestInPropstack(input: SearchRequestInput): Promise<PropstackSearchRequestResult> {
  const meta = await resolveSearchRequestMeta();
  const createdContact = await propstackV1Fetch<unknown>("/contacts", {
    method: "POST",
    body: buildContactBody(input, meta),
  });
  const contactId = extractId(createdContact);

  if (!contactId) {
    throw new Error("Propstack-Kontakt konnte nicht angelegt werden.");
  }

  let savedQueryId: number | null = null;
  try {
    savedQueryId = await createSavedQuery(contactId, input, meta);
  } catch (error) {
    console.error("Propstack-Suchprofil konnte nicht automatisch angelegt werden", error);
  }

  let taskId: number | null = null;
  try {
    taskId = await createSearchTask(contactId, input, meta);
  } catch (error) {
    console.error("Propstack-Suchauftrag-Aufgabe konnte nicht automatisch angelegt werden", error);
  }

  let messageId: number | null = null;
  try {
    messageId = await sendSearchNotification(contactId, input, meta);
  } catch (error) {
    console.error("Propstack-Suchauftrag-Benachrichtigung konnte nicht automatisch gesendet werden", error);
  }

  return { contactId, savedQueryId, taskId, messageId };
}
