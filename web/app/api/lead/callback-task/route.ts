import { NextResponse } from "next/server";

import { getLeadReportByToken, insertLeadEvent, updateLeadPropstackIds } from "@/lib/leadgen/repository";
import {
  createOrUpdateContact,
  createOrUpdateDeal,
  createOrUpdateProperty,
  createTask,
  findPropstackContactByEmail,
  formatLeadOtherExtrasLines,
} from "@/lib/propstack/client";
import { assertRateLimit, getClientIp } from "@/lib/security/rateLimit";
import type { LeadRequestRow } from "@/lib/types/leadgen";

export const runtime = "nodejs";

const CALLBACK_BROKER_ID = 395772;
const CALLBACK_NOTE_TYPE_ID = 616845;
const ALLOWED_BROKERS = {
  sebastian: {
    id: 395771,
    name: "Sebastian Munzig",
    email: "sebastian.munzig@frisia-immobilien.de",
  },
  uwe: {
    id: 414750,
    name: "Uwe G. Sandomeer",
    email: "uwe.sandomeer@frisia-immobilien.de",
  },
  tonnie: {
    id: 414751,
    name: "Tonnie Olthof",
    email: "tonnie.olthof@frisia-immobilien.de",
  },
} as const;

type CallbackIntent = "price_check" | "callback" | "broker_appointment";
type BrokerKey = keyof typeof ALLOWED_BROKERS;

function formText(value: unknown, maxLength: number) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text.slice(0, maxLength) : null;
}

function multilineFormText(value: unknown, maxLength: number) {
  const text = String(value ?? "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text.length > 0 ? text.slice(0, maxLength) : null;
}

function parseIntent(value: unknown): CallbackIntent {
  if (value === "broker_appointment") return "broker_appointment";
  return value === "price_check" ? "price_check" : "callback";
}

function intentLabel(intent: CallbackIntent) {
  if (intent === "broker_appointment") return "Persönliche Prüfung";
  return intent === "price_check"
    ? "Realistischen Verkaufspreis klären"
    : "Rückruf anfordern";
}

function parseBroker(value: unknown) {
  const key = String(value ?? "").trim().toLowerCase();
  if (key === "sebastian" || key === "uwe" || key === "tonnie") {
    return { key: key as BrokerKey, ...ALLOWED_BROKERS[key as BrokerKey] };
  }

  return null;
}

function fullName(lead: LeadRequestRow) {
  return [lead.firstname, lead.lastname].filter(Boolean).join(" ").trim();
}

function splitName(name: string | null) {
  if (!name) return { firstname: null, lastname: null };

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstname: parts[0] ?? null, lastname: null };
  }

  return {
    firstname: parts.slice(0, -1).join(" "),
    lastname: parts.at(-1) ?? null,
  };
}

function addressLabel(lead: LeadRequestRow) {
  return [
    [lead.street, lead.house_number].filter(Boolean).join(" "),
    [lead.postal_code, lead.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function euro(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "k. A.";
  return `${Math.round(value).toLocaleString("de-DE")} EUR`;
}

function buildTaskBody(input: {
  lead: LeadRequestRow;
  reportId: string;
  token: string;
  rangeMin: number | null;
  rangeMax: number | null;
  referer: string | null;
  formName: string | null;
  formEmail: string | null;
  formPhone: string | null;
  formMessage: string | null;
  intent: CallbackIntent;
  broker: ReturnType<typeof parseBroker>;
}) {
  const { lead } = input;
  const name = fullName(lead) || "k. A.";
  const otherExtrasLines = formatLeadOtherExtrasLines(lead);

  return [
    input.broker
      ? `${intentLabel(input.intent)} mit ${input.broker.name} aus der Immobilienbewertung-Ergebnisseite`
      : `${intentLabel(input.intent)} aus der Immobilienbewertung-Ergebnisseite`,
    "",
    "Kontaktdaten aus Formular:",
    `Name: ${input.formName || name}`,
    `E-Mail: ${input.formEmail || lead.email || "k. A."}`,
    `Telefon: ${input.formPhone || lead.phone || "k. A."}`,
    input.formMessage ? `Nachricht: ${input.formMessage}` : "",
    "",
    "Lead-Daten:",
    `Name: ${name}`,
    `E-Mail: ${lead.email || "k. A."}`,
    `Telefon: ${lead.phone || "k. A."}`,
    "",
    `Immobilie: ${lead.object_type || "k. A."}`,
    `Adresse: ${addressLabel(lead) || "k. A."}`,
    `Wohnfläche: ${lead.living_area ? `${lead.living_area.toLocaleString("de-DE")} m²` : "k. A."}`,
    `Grundstück: ${lead.plot_area ? `${lead.plot_area.toLocaleString("de-DE")} m²` : "k. A."}`,
    `Baujahr: ${lead.construction_year || "k. A."}`,
    ...(otherExtrasLines.length > 0 ? ["", ...otherExtrasLines] : []),
    "",
    `Wertspanne: ${euro(input.rangeMin)} - ${euro(input.rangeMax)}`,
    `Report-ID: ${input.reportId}`,
    input.referer ? `Ausgelöst auf: ${input.referer}` : "",
    "",
    "Gewünschter nächster Schritt:",
    input.intent === "price_check"
      ? "Eigentümer zeitnah kontaktieren und realistischen Verkaufspreis persönlich einordnen."
      : input.intent === "broker_appointment" && input.broker
        ? `${input.broker.name} soll den Eigentümer zeitnah kontaktieren und die persönliche Prüfung abstimmen.`
      : "Eigentümer zeitnah zurückrufen und persönliche Prüfung der Marktwerteinschätzung abstimmen.",
  ]
    .filter(Boolean)
    .join("\n");
}

function getClientIpSafe(request: Request) {
  try {
    return getClientIp(request);
  } catch {
    return "unknown";
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(`lead:callback-task:${getClientIpSafe(request)}`, 30);

    const body = (await request.json()) as {
      token?: unknown;
      name?: unknown;
      email?: unknown;
      phone?: unknown;
      message?: unknown;
      intent?: unknown;
      brokerKey?: unknown;
    };
    const token = String(body.token ?? "").trim();
    const formName = formText(body.name, 160);
    const formEmail = formText(body.email, 180)?.toLowerCase() ?? null;
    const formPhone = formText(body.phone, 80);
    const formMessage = multilineFormText(body.message, 800);
    const intent = parseIntent(body.intent);
    const requestedBroker = parseBroker(body.brokerKey);
    const assignedBrokerId = requestedBroker?.id ?? CALLBACK_BROKER_ID;

    if (!token) {
      return NextResponse.json({ success: false, error: "Token fehlt." }, { status: 400 });
    }

    if (!formEmail) {
      return NextResponse.json({ success: false, error: "Bitte eine E-Mail-Adresse angeben." }, { status: 400 });
    }

    if (intent === "broker_appointment" && !requestedBroker) {
      return NextResponse.json({ success: false, error: "Ausgewählter Makler ist ungültig." }, { status: 400 });
    }

    if (token === "preview-only") {
      return NextResponse.json({
        success: true,
        preview: true,
        message: "Interne Preview: Es wurde keine Anfrage übermittelt.",
      });
    }

    const report = await getLeadReportByToken(token);
    if (!report) {
      return NextResponse.json({ success: false, error: "Bewertungsreport nicht gefunden." }, { status: 404 });
    }

    if (report.report_status !== "active" || new Date(report.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "Der Bewertungslink ist nicht mehr aktiv." }, { status: 410 });
    }

    let lead = report.lead_request;
    let contactId = lead.propstack_contact_id;
    const submittedName = splitName(formName);
    const contactEmail = formEmail || lead.email;
    const contactPhone = formPhone || lead.phone;

    if (contactEmail) {
      const existingContact = contactId ? null : await findPropstackContactByEmail(contactEmail);
      const hadPropstackContact = Boolean(contactId || existingContact?.id);
      const syncedContactId = await createOrUpdateContact({
        contactId: contactId ?? existingContact?.id ?? null,
        email: contactEmail,
        firstname: submittedName.firstname ?? lead.firstname,
        lastname: submittedName.lastname ?? lead.lastname,
        phone: contactPhone,
        consent: lead.consent_given,
        sourceNote: `Website Immobilienbewertung\nStatus: ${intentLabel(intent)} aus Ergebnisseite`,
      });

      if (syncedContactId) {
        contactId = syncedContactId;
        lead = (await updateLeadPropstackIds({ leadId: lead.id, contactId })) ?? lead;
        await insertLeadEvent({
          leadRequestId: lead.id,
          eventName: hadPropstackContact ? "propstack_contact_updated" : "propstack_contact_created",
          payload: { contactId, source: "callback_task" },
        });
      }
    }

    let propertyId = lead.propstack_property_id;
    const syncedPropertyId = await createOrUpdateProperty({
      propertyId,
      lead,
    });

    if (syncedPropertyId) {
      propertyId = syncedPropertyId;
      lead = (await updateLeadPropstackIds({ leadId: lead.id, propertyId })) ?? lead;
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "propstack_property_created",
        payload: { propertyId, source: "callback_task" },
      });
    }

    if (contactId && propertyId) {
      const previousDealId = lead.propstack_deal_id;
      const dealId = await createOrUpdateDeal({
        dealId: lead.propstack_deal_id,
        contactId,
        propertyId,
        lead,
      });
      if (dealId) {
        lead = (await updateLeadPropstackIds({ leadId: lead.id, dealId })) ?? lead;
        await insertLeadEvent({
          leadRequestId: lead.id,
          eventName: previousDealId ? "propstack_deal_updated" : "propstack_deal_created",
          payload: { dealId, source: "callback_task" },
        });
      }
    }

    const name = fullName(lead) || lead.email || "Website-Lead";
    const title =
      intent === "broker_appointment" && requestedBroker
        ? `Termin mit ${requestedBroker.name} anfragen: ${name}`
        : `${intentLabel(intent)}: ${name}`;
    const taskId = await createTask({
      title,
      body: buildTaskBody({
        lead,
        reportId: report.id,
        token,
        rangeMin: report.range_min,
        rangeMax: report.range_max,
        referer: request.headers.get("referer"),
        formName,
        formEmail,
        formPhone,
        formMessage,
        intent,
        broker: requestedBroker,
      }),
      contactId,
      propertyId,
      assignedBrokerId,
      noteTypeId: CALLBACK_NOTE_TYPE_ID,
    });

    if (!taskId) {
      throw new Error("Anfrage konnte nicht übermittelt werden.");
    }

    await insertLeadEvent({
      leadRequestId: lead.id,
      eventName: "propstack_task_created",
      payload: {
        taskId,
        assignedBrokerId,
        noteTypeId: CALLBACK_NOTE_TYPE_ID,
        source:
          intent === "broker_appointment"
            ? "broker_appointment_button"
            : intent === "price_check"
              ? "abschluss_price_check_button"
              : "abschluss_callback_button",
        intent,
        brokerKey: requestedBroker?.key ?? null,
        brokerName: requestedBroker?.name ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      taskId,
      contactId,
      propertyId,
      assignedBrokerId,
    });
  } catch (error) {
    const retryAfter = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    const message = error instanceof Error ? error.message : "Anfrage konnte nicht übermittelt werden.";
    const publicMessage =
      message.toLowerCase().includes("propstack") || message.toLowerCase().includes("angelegt")
        ? "Anfrage konnte nicht übermittelt werden."
        : message;
    return NextResponse.json(
      {
        success: false,
        error: publicMessage,
      },
      { status: retryAfter ? 429 : 500, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
    );
  }
}
