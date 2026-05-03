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

type PropstackContact = {
  id: number;
  email?: string | null;
  email1?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

type ContactFormMeta = {
  brokerId: number | null;
  contactSourceId: number | null;
  activityTypeId: number | null;
};

export type PropstackContactFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  originUrl: string;
  context?: string;
};

export type PropstackContactFormResult = {
  contactId: number;
  noteId: number | null;
  taskId: number | null;
};

let contactFormMetaPromise: Promise<ContactFormMeta> | null = null;

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
  if (Array.isArray((value as { contacts?: unknown[] } | null)?.contacts)) {
    return ((value as { contacts?: unknown[] }).contacts ?? []) as T[];
  }
  if (Array.isArray((value as { clients?: unknown[] } | null)?.clients)) {
    return ((value as { clients?: unknown[] }).clients ?? []) as T[];
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

  const note = (value as { note?: unknown } | null)?.note;
  if (typeof (note as { id?: unknown } | null)?.id === "number") return (note as { id: number }).id;

  const activity = (value as { activity?: unknown } | null)?.activity;
  if (typeof (activity as { id?: unknown } | null)?.id === "number") return (activity as { id: number }).id;

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
  const method = init?.method ?? "GET";
  const response = await fetch(`${baseUrl}${path}`, {
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
    throw new Error(`Propstack ${method} ${path} fehlgeschlagen (${response.status}): ${raw.slice(0, 400)}`);
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
      // Fallback-Endpunkt versuchen.
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
    items.find((item) =>
      normalizedCandidates.some((candidate) => normalizeSlug(item.name) === candidate || normalizeSlug(item.email) === candidate),
    ) ??
    items.find((item) =>
      normalizedCandidates.some((candidate) => normalizeSlug(item.name).includes(candidate) || normalizeSlug(item.email).includes(candidate)),
    ) ??
    null
  );
}

async function resolveContactFormMetaInternal(): Promise<ContactFormMeta> {
  const [brokers, contactSources, activityTypes] = await Promise.all([
    propstackV1Fetch<unknown>("/brokers")
      .then(toArray<PropstackBroker>)
      .catch(() => []),
    fetchKeyValueCatalog(["/contact_sources", "/datadump/contact_sources"]),
    fetchKeyValueCatalog(["/activity_types", "/note_types"]),
  ]);

  const brokerId =
    (process.env.PROPSTACK_CONTACT_BROKER_ID ? Number(process.env.PROPSTACK_CONTACT_BROKER_ID) : null) ||
    (process.env.PROPSTACK_LEAD_BROKER_ID ? Number(process.env.PROPSTACK_LEAD_BROKER_ID) : null) ||
    matchBrokerByNames(brokers, [
      process.env.PROPSTACK_CONTACT_BROKER_NAME || "",
      process.env.PROPSTACK_CONTACT_BROKER_EMAIL || "",
      process.env.PROPSTACK_LEAD_BROKER_NAME || "",
      process.env.PROPSTACK_LEAD_BROKER_EMAIL || "",
      "info@frisia-immobilien.de",
      "leads@frisia-immobilien.de",
    ])?.id ||
    brokers[0]?.id ||
    null;

  const contactSourceId =
    (process.env.PROPSTACK_CONTACT_SOURCE_ID ? Number(process.env.PROPSTACK_CONTACT_SOURCE_ID) : null) ||
    matchKeyValueByNames(contactSources, [
      process.env.PROPSTACK_CONTACT_SOURCE_NAME || "",
      "website kontaktformular",
      "homepage kontaktformular",
      "kontaktformular",
      "website kontakt",
      "homepage kontakt",
      "website",
      "webseite",
      "homepage",
      "web",
      "online",
    ])?.id ||
    null;

  const activityTypeId =
    (process.env.PROPSTACK_CONTACT_ACTIVITY_TYPE_ID ? Number(process.env.PROPSTACK_CONTACT_ACTIVITY_TYPE_ID) : null) ||
    matchKeyValueByNames(activityTypes, [
      process.env.PROPSTACK_CONTACT_ACTIVITY_TYPE_NAME || "",
      "003 rueckrufbitte",
      "003 rückrufbitte",
      "rueckrufbitte",
      "rückrufbitte",
      "kontaktanfrage",
      "anfrage",
      "rueckruf",
      "rückruf",
      "aufgabe",
    ])?.id ||
    activityTypes[0]?.id ||
    null;

  return { brokerId, contactSourceId, activityTypeId };
}

async function resolveContactFormMeta() {
  if (!contactFormMetaPromise) {
    contactFormMetaPromise = resolveContactFormMetaInternal().catch((error) => {
      contactFormMetaPromise = null;
      throw error;
    });
  }

  return contactFormMetaPromise;
}

function contactEmail(contact: PropstackContact) {
  return normalizeText(contact.email || contact.email1).toLowerCase();
}

async function findExistingContact(email: string) {
  const normalizedEmail = email.toLowerCase();
  const paths = [
    `/contacts?email=${encodeURIComponent(normalizedEmail)}`,
    `/contacts?q=${encodeURIComponent(normalizedEmail)}`,
    `/contacts?query=${encodeURIComponent(normalizedEmail)}`,
  ];

  for (const path of paths) {
    try {
      const response = await propstackV1Fetch<unknown>(path);
      const contacts = toArray<PropstackContact>(response);
      const exact = contacts.find((contact) => contact.id && contactEmail(contact) === normalizedEmail);
      if (exact) return exact;
    } catch {
      // Nächste Suchvariante versuchen.
    }
  }

  return null;
}

function formatCreatedAt() {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(new Date());
}

function htmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildContactDescription(input: PropstackContactFormInput) {
  const context = input.context || "Website Kontaktformular";

  return [
    `${context} vom ${formatCreatedAt()} Uhr`,
    "",
    `Name: ${input.firstName} ${input.lastName}`,
    `E-Mail: ${input.email}`,
    input.phone ? `Telefon: ${input.phone}` : "Telefon: nicht angegeben",
    `Quelle: ${context}`,
    input.originUrl ? `Herkunfts-URL: ${input.originUrl}` : "",
    "",
    "Nachricht:",
    input.message,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildContactTaskBody(input: PropstackContactFormInput) {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const phone = input.phone || "nicht angegeben";
  const originUrl = input.originUrl || "nicht angegeben";
  const context = input.context || "Website Kontaktformular";

  return `
    <h2>${htmlEscape(context)}</h2>
    <p><strong>Eingang:</strong> ${htmlEscape(formatCreatedAt())} Uhr</p>

    <h3>Kontakt</h3>
    <p>
      <strong>Name:</strong> ${htmlEscape(fullName)}<br>
      <strong>E-Mail:</strong> ${htmlEscape(input.email)}<br>
      <strong>Telefon:</strong> ${htmlEscape(phone)}
    </p>

    <h3>Zuordnung</h3>
    <p>
      <strong>Quelle:</strong> ${htmlEscape(context)}<br>
      <strong>Herkunfts-URL:</strong> ${htmlEscape(originUrl)}
    </p>

    <h3>Nachricht</h3>
    <p>${htmlEscape(input.message).replaceAll("\n", "<br>")}</p>

    <hr>
    <p><strong>Nächster Schritt:</strong> Anfrage prüfen und persönlich zurückmelden.</p>
  `.trim();
}

function buildContactBody(input: PropstackContactFormInput, meta: ContactFormMeta) {
  return {
    client: compactObject({
      email: input.email.toLowerCase(),
      first_name: input.firstName,
      last_name: input.lastName,
      mobile_phone: input.phone || undefined,
      client_source_id: meta.contactSourceId ?? undefined,
      broker_id: meta.brokerId ?? undefined,
      accept_contact: true,
      gdpr_status: 2,
      description: buildContactDescription(input),
    }),
  };
}

async function createOrUpdateContact(input: PropstackContactFormInput, meta: ContactFormMeta) {
  const existingContact = await findExistingContact(input.email);
  const body = buildContactBody(input, meta);

  if (existingContact?.id) {
    const updated = await propstackV1Fetch<unknown>(`/contacts/${existingContact.id}`, {
      method: "PUT",
      body,
    });
    return extractId(updated) ?? existingContact.id;
  }

  const created = await propstackV1Fetch<unknown>("/contacts", {
    method: "POST",
    body,
  });

  return extractId(created);
}

async function createContactNote(contactId: number, input: PropstackContactFormInput, meta: ContactFormMeta) {
  const bodyText = buildContactDescription(input);
  const title = input.context || "Kontaktanfrage Website";
  const noteBodies = [
    {
      note: compactObject({
        client_id: contactId,
        client_ids: [contactId],
        broker_id: meta.brokerId ?? undefined,
        note_type_id: meta.activityTypeId ?? undefined,
        title,
        body: bodyText,
      }),
    },
    {
      activity: compactObject({
        client_id: contactId,
        client_ids: [contactId],
        broker_id: meta.brokerId ?? undefined,
        note_type_id: meta.activityTypeId ?? undefined,
        title,
        body: bodyText,
      }),
    },
  ];

  const attempts = [
    { path: "/notes", body: noteBodies[0] },
    { path: "/activities", body: noteBodies[1] },
  ];

  for (const attempt of attempts) {
    try {
      const created = await propstackV1Fetch<unknown>(attempt.path, {
        method: "POST",
        body: attempt.body,
      });
      return extractId(created);
    } catch {
      // Die Nachricht steht zusätzlich in der Kontaktbeschreibung; der Task bleibt der Bearbeitungshinweis.
    }
  }

  return null;
}

function buildNextBusinessDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  if (date.getDay() === 6) date.setDate(date.getDate() + 2);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 10);
}

async function createContactTask(contactId: number, input: PropstackContactFormInput, meta: ContactFormMeta) {
  const title = input.context ? `${input.context} prüfen` : "Kontaktanfrage Website prüfen";

  const created = await propstackV1Fetch<unknown>("/tasks", {
    method: "POST",
    body: {
      task: compactObject({
        is_reminder: true,
        title,
        note_type_id: meta.activityTypeId ?? undefined,
        client_ids: [contactId],
        broker_id: meta.brokerId ?? undefined,
        task_creator_id: meta.brokerId ?? undefined,
        task_updater_id: meta.brokerId ?? undefined,
        due_date: buildNextBusinessDate(),
        body: buildContactTaskBody(input),
      }),
    },
  });

  return extractId(created);
}

export async function syncContactFormToPropstack(
  input: PropstackContactFormInput,
): Promise<PropstackContactFormResult> {
  const meta = await resolveContactFormMeta();
  const contactId = await createOrUpdateContact(input, meta);

  if (!contactId) {
    throw new Error("Propstack-Kontakt konnte nicht angelegt oder aktualisiert werden.");
  }

  const [noteId, taskId] = await Promise.all([
    createContactNote(contactId, input, meta),
    createContactTask(contactId, input, meta),
  ]);

  return { contactId, noteId, taskId };
}
