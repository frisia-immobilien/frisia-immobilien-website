import "server-only";

import { env } from "@/lib/env";
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
};

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
  const task = (value as { task?: unknown } | null)?.task;
  if (typeof (task as { id?: unknown } | null)?.id === "number") return (task as { id: number }).id;
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
      "leads@frisia-immobilien.de",
  ]);

  if (matchedBroker?.id) return matchedBroker.id;
  if (hasSpecificAssignee) return null;

  return Number(env.PROPSTACK_BROKER_ID || 0) || null;
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

function nextBusinessDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  if (date.getDay() === 6) date.setDate(date.getDate() + 2);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function createOrUpdateContact(input: PropstackContactInput) {
  const client = compact({
    email: input.email.toLowerCase(),
    first_name: normalizeText(input.firstname),
    last_name: normalizeText(input.lastname),
    mobile_phone: normalizeText(input.phone),
    accept_contact: input.consent === true,
    gdpr_status: input.consent === true ? 2 : undefined,
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
  });

  const body = { property };
  if (input.propertyId) {
    const response = await propstackV1Fetch(`/units/${input.propertyId}`, { method: "PUT", body });
    return extractId(response) ?? input.propertyId;
  }

  const response = await propstackV1Fetch("/units", { method: "POST", body });
  return extractId(response);
}

export async function createNote(input: PropstackTaskInput) {
  const body = {
    task: compact({
      title: input.title,
      body: input.body.replace(/\n/g, "<br>"),
      client_ids: input.contactId ? [input.contactId] : undefined,
      property_ids: input.propertyId ? [input.propertyId] : undefined,
      broker_id: env.PROPSTACK_BROKER_ID ? Number(env.PROPSTACK_BROKER_ID) : undefined,
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
  const message = compact({
    broker_id: env.PROPSTACK_BROKER_ID ? Number(env.PROPSTACK_BROKER_ID) : undefined,
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
