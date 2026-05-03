import "server-only";

import { env } from "@/lib/env";
import { formatLeadgenEquipmentLabel } from "@/lib/leadgen/display";
import type { LeadRequestRow } from "@/lib/types/leadgen";

type PropstackResponse = Record<string, unknown> | null;

type PropstackContact = {
  id: number;
  email?: string | null;
  email1?: string | null;
};

type PropstackBroker = {
  id: number;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
};

type PropstackKeyValue = {
  id: number;
  name?: string | null;
  title?: string | null;
  label?: string | null;
  key?: string | null;
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

type PropstackClientProperty = {
  id: number;
  client_id?: number | null;
  property_id?: number | null;
};

type PropstackContactInput = {
  contactId?: number | null;
  email: string;
  firstname?: string | null;
  lastname?: string | null;
  phone?: string | null;
  consent?: boolean | null;
  sourceNote?: string | null;
};

type PropstackPropertyInput = {
  propertyId?: number | null;
  lead: LeadRequestRow;
};

type PropstackDealInput = {
  dealId?: number | null;
  contactId: number;
  propertyId: number;
  lead: LeadRequestRow;
};

type PropstackTaskInput = {
  title: string;
  body: string;
  contactId?: number | null;
  propertyId?: number | null;
  dueDate?: string | null;
  noteTypeId?: number | null;
  assignedBrokerId?: number | null;
  assignedBrokerEmail?: string | null;
  assignedBrokerName?: string | null;
};

type PropstackMessageInput = {
  to: string;
  subject: string;
  html: string;
  contactId?: number | null;
  propertyId?: number | null;
  assignedBrokerEmail?: string | null;
  assignedBrokerName?: string | null;
};

const DEFAULT_LEAD_BROKER_ID = 395771;
const DEFAULT_LEAD_BROKER_EMAIL = "sebastian.munzig@frisia-immobilien.de";

type LeadMeta = {
  brokerId: number | null;
  contactSourceId: number | null;
  propertyStatusId: number | null;
  activityTypeId: number | null;
  dealPipelineId: number | null;
  dealStageId: number | null;
};

let leadMetaPromise: Promise<LeadMeta> | null = null;

function requireApiKey() {
  if (!env.PROPSTACK_API_KEY) {
    throw new Error("PROPSTACK_API_KEY ist nicht gesetzt.");
  }
  return env.PROPSTACK_API_KEY;
}

function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === null || entry === undefined) return false;
      if (typeof entry === "string" && entry.trim().length === 0) return false;
      if (Array.isArray(entry) && entry.length === 0) return false;
      return true;
    }),
  ) as T;
}

function normalizeText(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function euro(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  return `${Math.round(number).toLocaleString("de-DE")} EUR`;
}

export function formatLeadOtherExtrasLines(lead: LeadRequestRow) {
  const otherExtras = normalizeText(lead.other_extras);
  const otherExtrasValue = euro(lead.other_extras_value_eur);
  if (!otherExtras && !otherExtrasValue) return [] as string[];

  return [
    "Zusatzangaben",
    `Andere Extras: ${otherExtras ?? "k. A."}`,
    `Wert der anderen Extras: ${otherExtrasValue ?? "k. A."}`,
  ];
}

function formatLeadOtherExtrasRemark(lead: LeadRequestRow) {
  const lines = formatLeadOtherExtrasLines(lead);
  if (lines.length === 0) return null;
  return ["Website Leadgenerator", "", ...lines].join("\n");
}

function normalizeSlug(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9@.]+/g, " ")
    .trim();
}

function extractId(value: unknown): number | null {
  if (typeof (value as { id?: unknown } | null)?.id === "number") return (value as { id: number }).id;
  const data = (value as { data?: unknown } | null)?.data;
  if (typeof (data as { id?: unknown } | null)?.id === "number") return (data as { id: number }).id;
  const client = (value as { client?: unknown } | null)?.client;
  if (typeof (client as { id?: unknown } | null)?.id === "number") return (client as { id: number }).id;
  const property = (value as { property?: unknown } | null)?.property;
  if (typeof (property as { id?: unknown } | null)?.id === "number") return (property as { id: number }).id;
  const clientProperty = (value as { client_property?: unknown } | null)?.client_property;
  if (typeof (clientProperty as { id?: unknown } | null)?.id === "number") {
    return (clientProperty as { id: number }).id;
  }
  const task = (value as { task?: unknown } | null)?.task;
  if (typeof (task as { id?: unknown } | null)?.id === "number") return (task as { id: number }).id;
  const message = (value as { message?: unknown } | null)?.message;
  if (typeof (message as { id?: unknown } | null)?.id === "number") return (message as { id: number }).id;
  return null;
}

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (Array.isArray((value as { data?: unknown[] } | null)?.data)) {
    return ((value as { data?: unknown[] }).data ?? []) as T[];
  }
  if (Array.isArray((value as { contacts?: unknown[] } | null)?.contacts)) {
    return ((value as { contacts?: unknown[] }).contacts ?? []) as T[];
  }
  if (Array.isArray((value as { clients?: unknown[] } | null)?.clients)) {
    return ((value as { clients?: unknown[] }).clients ?? []) as T[];
  }
  return [];
}

function contactEmail(contact: PropstackContact) {
  return normalizeText(contact.email || contact.email1)?.toLowerCase() ?? "";
}

let brokerCachePromise: Promise<PropstackBroker[]> | null = null;

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

async function fetchKeyValueCatalog(paths: string[]) {
  for (const path of paths) {
    try {
      const response = await propstackV1Fetch(path);
      const items = toArray<PropstackKeyValue>(response);
      if (items.length > 0) return items;
    } catch {
      // Je nach Propstack-Version liegen Kataloge unter unterschiedlichen Endpunkten.
    }
  }

  return [] as PropstackKeyValue[];
}

function looksLikeSystemBroker(item: PropstackBroker) {
  const haystack = [item.name, item.email].map(normalizeSlug).join(" ");
  return [
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
  ].some((candidate) => haystack.includes(candidate));
}

async function fetchBrokers() {
  if (!brokerCachePromise) {
    brokerCachePromise = propstackV1Fetch("/brokers")
      .then(toArray<PropstackBroker>)
      .catch((error) => {
        brokerCachePromise = null;
        throw error;
      });
  }

  return brokerCachePromise;
}

export async function getBrokerAvatarUrlByEmail(email: string) {
  const normalizedEmail = normalizeText(email)?.toLowerCase();
  if (!normalizedEmail) return null;

  const response = await propstackV1Fetch("/brokers");
  const broker = matchBrokerByNames(toArray<PropstackBroker>(response), [normalizedEmail]);

  return normalizeText(broker?.avatar) ?? normalizeText(broker?.avatar_url);
}

function matchBrokerByNames(items: PropstackBroker[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeSlug).filter(Boolean);

  return (
    items.find((item) =>
      normalizedCandidates.some(
        (candidate) =>
          normalizeSlug(item.email) === candidate ||
          normalizeSlug(item.name) === candidate,
      ),
    ) ??
    items.find((item) =>
      normalizedCandidates.some(
        (candidate) =>
          normalizeSlug(item.email).includes(candidate) ||
          normalizeSlug(item.name).includes(candidate),
      ),
    ) ??
    null
  );
}

async function resolveTaskBrokerId(input: Pick<PropstackTaskInput, "assignedBrokerEmail" | "assignedBrokerName">) {
  const configuredLeadBrokerId = Number(env.PROPSTACK_LEAD_BROKER_ID || 0) || null;
  if (configuredLeadBrokerId) return configuredLeadBrokerId;

  const hasSpecificAssignee = Boolean(
    input.assignedBrokerEmail ||
      input.assignedBrokerName ||
      env.PROPSTACK_LEAD_BROKER_EMAIL ||
      env.PROPSTACK_LEAD_BROKER_NAME,
  );

  const brokers = await fetchBrokers();
  const matchedBroker = matchBrokerByNames(brokers, [
      input.assignedBrokerEmail || "",
      input.assignedBrokerName || "",
      env.PROPSTACK_LEAD_BROKER_EMAIL,
      env.PROPSTACK_LEAD_BROKER_NAME,
  ]);

  if (matchedBroker?.id) return matchedBroker.id;
  if (hasSpecificAssignee) return null;

  return (
    Number(env.PROPSTACK_BROKER_ID || 0) ||
    matchBrokerByNames(brokers, [DEFAULT_LEAD_BROKER_EMAIL])?.id ||
    DEFAULT_LEAD_BROKER_ID
  );
}

async function resolveSpecificBrokerId(input: Pick<PropstackMessageInput, "assignedBrokerEmail" | "assignedBrokerName">) {
  if (!input.assignedBrokerEmail && !input.assignedBrokerName) return null;

  const brokers = await fetchBrokers();
  const matchedBroker = matchBrokerByNames(brokers, [
    input.assignedBrokerEmail || "",
    input.assignedBrokerName || "",
  ]);

  return matchedBroker?.id ?? null;
}

async function propstackV1Fetch(path: string, init?: { method?: "GET" | "POST" | "PUT"; body?: unknown }) {
  const apiKey = requireApiKey();
  const url = `${env.PROPSTACK_V1_BASE_URL.replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    method: init?.method ?? "GET",
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
    throw new Error(`Propstack ${init?.method ?? "GET"} ${path} fehlgeschlagen (${response.status}): ${raw.slice(0, 300)}`);
  }

  return raw ? (JSON.parse(raw) as PropstackResponse) : null;
}

async function resolveLeadMetaInternal(): Promise<LeadMeta> {
  const [brokers, pipelines, propertyStatuses, contactSources, activityTypes] = await Promise.all([
    fetchBrokers().catch(() => []),
    propstackV1Fetch("/deal_pipelines")
      .then(toArray<PropstackDealPipeline>)
      .catch(() => []),
    propstackV1Fetch("/property_statuses")
      .then(toArray<PropstackKeyValue>)
      .catch(() => []),
    fetchKeyValueCatalog(["/contact_sources", "/datadump/contact_sources"]),
    fetchKeyValueCatalog(["/activity_types", "/note_types"]),
  ]);

  const brokerId =
    (env.PROPSTACK_LEAD_BROKER_ID ? Number(env.PROPSTACK_LEAD_BROKER_ID) : null) ||
    matchBrokerByNames(brokers, [
      env.PROPSTACK_LEAD_BROKER_EMAIL,
      env.PROPSTACK_LEAD_BROKER_NAME,
      DEFAULT_LEAD_BROKER_EMAIL,
      "Sebastian Munzig",
    ])?.id ||
    (brokers.some((item) => item.id === DEFAULT_LEAD_BROKER_ID) ? DEFAULT_LEAD_BROKER_ID : null) ||
    brokers.find((item) => !looksLikeSystemBroker(item))?.id ||
    null;

  const contactSourceId =
    (env.PROPSTACK_LEAD_SOURCE_ID ? Number(env.PROPSTACK_LEAD_SOURCE_ID) : null) ||
    matchKeyValueByNames(contactSources, [
      env.PROPSTACK_LEAD_SOURCE_NAME,
      "Homepage (LeadGen)",
      "Homepage LeadGen",
      "Online Immobilienbewertung",
      "Immobilienbewertung",
      "Homepage",
    ])?.id ||
    null;

  const propertyStatusId =
    (env.PROPSTACK_LEAD_PROPERTY_STATUS_ID ? Number(env.PROPSTACK_LEAD_PROPERTY_STATUS_ID) : null) ||
    matchKeyValueByNames(propertyStatuses, [
      env.PROPSTACK_LEAD_PROPERTY_STATUS_NAME,
      "Akquise",
      "Lead",
      "Vorbereitung",
      "Neu",
    ])?.id ||
    null;

  const activityTypeId =
    (env.PROPSTACK_LEAD_ACTIVITY_TYPE_ID ? Number(env.PROPSTACK_LEAD_ACTIVITY_TYPE_ID) : null) ||
    matchKeyValueByNames(activityTypes, [
      env.PROPSTACK_LEAD_ACTIVITY_TYPE_NAME,
      "112 Bewertungstermin vereinbaren",
      "Bewertungstermin vereinbaren",
      "Rückruf",
      "Anruf",
      "Todo",
    ])?.id ||
    null;

  const pipeline =
    (env.PROPSTACK_LEAD_PIPELINE_NAME
      ? pipelines.find((item) => normalizeSlug(item.name) === normalizeSlug(env.PROPSTACK_LEAD_PIPELINE_NAME))
      : null) ||
    pipelines.find((item) =>
      ["100 eigentuemer", "eigentuemer", "akquise", "bewertung"].some((candidate) =>
        normalizeSlug(item.name).includes(candidate),
      ),
    ) ||
    pipelines[0] ||
    null;

  const stage =
    (env.PROPSTACK_LEAD_STAGE_NAME
      ? pipeline?.deal_stages?.find((item) => normalizeSlug(item.name) === normalizeSlug(env.PROPSTACK_LEAD_STAGE_NAME))
      : null) ||
    pipeline?.deal_stages?.find((item) =>
      ["neuer eigentuemer lead", "neuer lead", "lead", "anfrage", "bewertung"].some((candidate) =>
        normalizeSlug(item.name).includes(candidate),
      ),
    ) ||
    [...(pipeline?.deal_stages ?? [])].sort(
      (left, right) => Number(left.position ?? 0) - Number(right.position ?? 0),
    )[0] ||
    null;

  return {
    brokerId,
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

export async function findPropstackContactByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const paths = [
    `/contacts?email=${encodeURIComponent(normalizedEmail)}`,
    `/contacts?q=${encodeURIComponent(normalizedEmail)}`,
    `/contacts?query=${encodeURIComponent(normalizedEmail)}`,
  ];

  for (const path of paths) {
    try {
      const response = await propstackV1Fetch(path);
      const contacts = toArray<PropstackContact>(response);
      const exact = contacts.find((contact) => contact.id && contactEmail(contact) === normalizedEmail);
      if (exact) return exact;
    } catch {
      // Propstack unterstützt je nach Account unterschiedliche Suchparameter.
    }
  }

  return null;
}

function mapObjectType(lead: LeadRequestRow) {
  if (lead.object_type === "wohnung") {
    return { object_type: "LIVING", rs_type: "APARTMENT", rs_category: "APARTMENT" };
  }
  if (lead.object_type === "grundstueck") {
    return { object_type: "INVESTMENT", rs_type: "INVESTMENT", rs_category: "INVEST_PLOT" };
  }
  if (lead.object_type === "gewerbe") {
    return { object_type: "COMMERCIAL", rs_type: "COMMERCIAL", rs_category: "COMMERCIAL" };
  }
  return { object_type: "LIVING", rs_type: "HOUSE", rs_category: "SINGLE_FAMILY_HOUSE" };
}

function formatArea(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "k. A.";
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? `${number.toLocaleString("de-DE")} m²` : "k. A.";
}

function formatLeadName(lead: LeadRequestRow) {
  return [lead.firstname, lead.lastname].map(normalizeText).filter(Boolean).join(" ") || "k. A.";
}

function formatLeadAddress(lead: LeadRequestRow) {
  return [
    [lead.street, lead.house_number].map(normalizeText).filter(Boolean).join(" "),
    [lead.postal_code, lead.city].map(normalizeText).filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function buildDealNote(lead: LeadRequestRow) {
  const otherExtrasLines = formatLeadOtherExtrasLines(lead);

  return [
    "Leadgenerator Immobilienbewertung",
    "",
    "Kontakt",
    `Name: ${formatLeadName(lead)}`,
    `E-Mail: ${lead.email ?? "k. A."}`,
    `Telefon: ${lead.phone ?? "k. A."}`,
    "",
    "Objekt",
    `Adresse: ${formatLeadAddress(lead) || "k. A."}`,
    `Immobilienart: ${lead.object_type ?? "k. A."}`,
    `Wohnfläche: ${formatArea(lead.living_area)}`,
    `Grundstück: ${formatArea(lead.plot_area)}`,
    `Zimmer: ${lead.rooms ?? "k. A."}`,
    `Baujahr: ${lead.construction_year ?? "k. A."}`,
    `Zustand: ${lead.condition ?? "k. A."}`,
    `Ausstattung: ${formatLeadgenEquipmentLabel(lead.equipment) ?? "k. A."}`,
    `Energieklasse: ${lead.energy_class ?? "k. A."}`,
    ...(otherExtrasLines.length > 0 ? ["", ...otherExtrasLines] : []),
    "",
    "Nächster Schritt: Bewertung prüfen und persönlich zurückmelden.",
  ].join("\n");
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function nextBusinessDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  if (date.getDay() === 6) date.setDate(date.getDate() + 2);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function createOrUpdateContact(input: PropstackContactInput) {
  const meta = await resolveLeadMeta();
  const client = compact({
    email: input.email.toLowerCase(),
    first_name: normalizeText(input.firstname),
    last_name: normalizeText(input.lastname),
    mobile_phone: normalizeText(input.phone),
    accept_contact: input.consent === true,
    gdpr_status: input.consent === true ? 2 : undefined,
    client_source_id: meta.contactSourceId ?? undefined,
    broker_id: meta.brokerId ?? undefined,
    description: input.sourceNote || "Website Leadgenerator\nStatus: Bewertung gestartet",
  });

  const body = { client };
  if (input.contactId) {
    const response = await propstackV1Fetch(`/contacts/${input.contactId}`, { method: "PUT", body });
    return extractId(response) ?? input.contactId;
  }

  const existingContact = await findPropstackContactByEmail(input.email);
  if (existingContact?.id) {
    const response = await propstackV1Fetch(`/contacts/${existingContact.id}`, { method: "PUT", body });
    return extractId(response) ?? existingContact.id;
  }

  const response = await propstackV1Fetch("/contacts", { method: "POST", body });
  return extractId(response);
}

export async function createOrUpdateProperty(input: PropstackPropertyInput) {
  const meta = await resolveLeadMeta();
  const lead = input.lead;
  const propertyType = mapObjectType(lead);
  const title = [
    "Eigentümerlead",
    lead.object_type,
    [lead.street, lead.house_number].filter(Boolean).join(" "),
    [lead.postal_code, lead.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(" · ");

  const property = compact({
    title,
    marketing_type: "BUY",
    ...propertyType,
    property_status_id: meta.propertyStatusId ?? undefined,
    broker_id: meta.brokerId ?? undefined,
    street: normalizeText(lead.street),
    house_number: normalizeText(lead.house_number),
    zip_code: normalizeText(lead.postal_code),
    city: normalizeText(lead.city),
    country: "DE",
    lat: lead.lat ?? undefined,
    lng: lead.lng ?? undefined,
    living_space: lead.living_area ?? undefined,
    plot_area: lead.plot_area ?? undefined,
    number_of_rooms: lead.rooms ?? undefined,
    construction_year: lead.construction_year ?? undefined,
    energy_efficiency_class: normalizeText(lead.energy_class),
    description_note: input.propertyId ? undefined : formatLeadOtherExtrasRemark(lead),
  });

  const body = { property };
  if (input.propertyId) {
    const response = await propstackV1Fetch(`/units/${input.propertyId}`, { method: "PUT", body });
    return extractId(response) ?? input.propertyId;
  }

  const response = await propstackV1Fetch("/units", { method: "POST", body });
  return extractId(response);
}

async function findClientPropertyId(input: Pick<PropstackDealInput, "contactId" | "propertyId">) {
  const response = await propstackV1Fetch(
    `/client_properties?property_id=${input.propertyId}&client_id=${input.contactId}`,
  );
  const items = toArray<PropstackClientProperty>(response);
  const exact = items.find((item) => item.client_id === input.contactId && item.property_id === input.propertyId);
  return exact?.id ?? items[0]?.id ?? null;
}

async function createOwnership(contactId: number, propertyId: number) {
  try {
    await propstackV1Fetch("/ownerships", {
      method: "POST",
      body: {
        client_id: contactId,
        property_id: propertyId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("422") && !/exist|bereits|duplicate/i.test(message)) {
      throw error;
    }
  }
}

export async function createOrUpdateDeal(input: PropstackDealInput) {
  const meta = await resolveLeadMeta();
  if (!meta.dealStageId) {
    throw new Error("Keine passende Deal-Phase für LeadGen-Eigentümer gefunden.");
  }

  await createOwnership(input.contactId, input.propertyId);

  const dealId = input.dealId ?? (await findClientPropertyId(input));
  const body = {
    client_property: compact({
      client_id: input.contactId,
      property_id: input.propertyId,
      deal_pipeline_id: meta.dealPipelineId ?? undefined,
      deal_stage_id: meta.dealStageId,
      broker_id: meta.brokerId ?? undefined,
      client_source_id: meta.contactSourceId ?? undefined,
      start_date: todayDate(),
      note: buildDealNote(input.lead),
    }),
  };

  if (dealId) {
    const response = await propstackV1Fetch(`/client_properties/${dealId}`, { method: "PUT", body });
    return extractId(response) ?? dealId;
  }

  const response = await propstackV1Fetch("/client_properties", { method: "POST", body });
  return extractId(response);
}

export async function createNote(input: PropstackTaskInput) {
  const brokerId = await resolveTaskBrokerId({});
  const body = {
    task: compact({
      title: input.title,
      body: input.body.replace(/\n/g, "<br>"),
      client_ids: input.contactId ? [input.contactId] : undefined,
      property_ids: input.propertyId ? [input.propertyId] : undefined,
      broker_id: brokerId ?? undefined,
    }),
  };

  const response = await propstackV1Fetch("/tasks", { method: "POST", body });
  return extractId(response);
}

export async function createTask(input: PropstackTaskInput) {
  const brokerId = input.assignedBrokerId ?? (await resolveTaskBrokerId(input));
  const body = {
    task: compact({
      is_reminder: true,
      title: input.title,
      note_type_id: input.noteTypeId ?? undefined,
      body: input.body.replace(/\n/g, "<br>"),
      client_ids: input.contactId ? [input.contactId] : undefined,
      property_ids: input.propertyId ? [input.propertyId] : undefined,
      broker_id: brokerId ?? undefined,
      task_creator_id: brokerId ?? undefined,
      task_updater_id: brokerId ?? undefined,
      due_date: input.dueDate ?? nextBusinessDate(),
    }),
  };

  const response = await propstackV1Fetch("/tasks", { method: "POST", body });
  return extractId(response);
}

export async function updatePropertyRemark(propertyId: number, remark: string) {
  const response = await propstackV1Fetch(`/units/${propertyId}`, {
    method: "PUT",
    body: {
      property: {
        description_note: remark,
      },
    },
  });

  return extractId(response) ?? propertyId;
}

export async function sendPropstackMessage(input: PropstackMessageInput) {
  const brokerId = input.assignedBrokerEmail || input.assignedBrokerName
    ? await resolveSpecificBrokerId(input)
    : Number(env.PROPSTACK_BROKER_ID || 0) ||
      (await resolveTaskBrokerId({
        assignedBrokerEmail: env.PROPSTACK_LEAD_BROKER_EMAIL,
        assignedBrokerName: env.PROPSTACK_LEAD_BROKER_NAME,
      })) ||
      DEFAULT_LEAD_BROKER_ID;

  if (!brokerId) {
    throw new Error("Propstack-Absender konnte nicht bestätigt werden.");
  }

  const message = compact({
    broker_id: brokerId,
    snippet_id: env.PROPSTACK_REPORT_SNIPPET_ID ? Number(env.PROPSTACK_REPORT_SNIPPET_ID) : undefined,
    to: [input.to],
    subject: input.subject,
    body: input.html,
    client_ids: input.contactId ? [input.contactId] : undefined,
    property_ids: input.propertyId ? [input.propertyId] : undefined,
  });

  const response = await propstackV1Fetch("/messages", {
    method: "POST",
    body: { message },
  });

  return extractId(response);
}
