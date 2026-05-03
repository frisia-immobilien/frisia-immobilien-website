import { NextResponse } from "next/server";
import { z } from "zod";

import { insertLeadEvent, updateLeadPropstackIds, upsertLeadRequest } from "@/lib/leadgen/repository";
import { leadCreateSchema } from "@/lib/leadgen/validation";
import {
  createNote,
  createOrUpdateContact,
  createOrUpdateDeal,
  createOrUpdateProperty,
  createTask,
  findPropstackContactByEmail,
} from "@/lib/propstack/client";
import { hashPrivacyValue } from "@/lib/security/hashToken";
import { assertRateLimit, getClientIp } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const appointmentSchema = z.object({
  address: z.string().trim().min(5, "Bitte die Adresse der Immobilie angeben.").max(300),
  name: z.string().trim().min(2, "Bitte deinen Namen angeben.").max(160),
  email: z.string().trim().toLowerCase().email("Bitte eine gültige E-Mail-Adresse angeben.").max(180),
  phone: z.string().trim().min(4, "Bitte eine Telefonnummer angeben.").max(80),
  locationLabel: z.string().trim().min(2).max(180),
  locationSlug: z.string().trim().min(2).max(180).optional().nullable(),
  originUrl: z.string().trim().max(500).optional().nullable(),
  requestType: z.enum(["appointment", "valuation_check"]).optional().default("appointment"),
  website: z.string().trim().max(200).optional().nullable(),
});

type AppointmentInput = z.infer<typeof appointmentSchema>;

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstname: parts[0] ?? fullName.trim(), lastname: null };
  }

  return {
    firstname: parts.slice(0, -1).join(" "),
    lastname: parts.at(-1) ?? null,
  };
}

function locationCity(locationLabel: string) {
  return (
    locationLabel
      .split(",")
      .at(-1)
      ?.replace(/\s*\([^)]*\)\s*/g, "")
      .trim() || locationLabel.trim()
  );
}

function locationDistrict(locationLabel: string) {
  if (!locationLabel.includes(",")) return null;
  return locationLabel.split(",")[0]?.trim() || null;
}

function parseAddress(address: string, fallbackLocation: string) {
  const normalized = address.replace(/\s+/g, " ").trim();
  const zipMatch = normalized.match(/\b(\d{5})\b/);
  const postalCode = zipMatch?.[1] ?? null;
  const beforeZip = postalCode
    ? normalized.slice(0, zipMatch?.index ?? 0).replace(/[,\s]+$/g, "").trim()
    : normalized;
  const afterZip = postalCode
    ? normalized.slice((zipMatch?.index ?? 0) + postalCode.length).replace(/^[,\s]+/g, "").trim()
    : "";
  const streetHouseMatch = beforeZip.match(/^(.+?)\s+(\d+\s?[a-zA-Z]?(?:[-/]\d+\s?[a-zA-Z]?)?)$/);

  return {
    street: streetHouseMatch?.[1]?.trim() || beforeZip || normalized,
    house_number: streetHouseMatch?.[2]?.trim() || null,
    postal_code: postalCode,
    city: afterZip || locationCity(fallbackLocation),
    district: locationDistrict(fallbackLocation),
  };
}

function isValuationCheck(input: AppointmentInput) {
  return input.requestType === "valuation_check";
}

function buildAppointmentBody(input: AppointmentInput) {
  if (isValuationCheck(input)) {
    return [
      "Neue Anfrage zur persönlichen Prüfung der Online-Bewertung",
      "",
      `Adresse der Immobilie: ${input.address}`,
      `Ort/Ortsteil: ${input.locationLabel}`,
      "",
      `Name: ${input.name}`,
      `E-Mail: ${input.email}`,
      `Telefon: ${input.phone}`,
      input.originUrl ? `Herkunfts-URL: ${input.originUrl}` : "",
      "",
      "Gewünschter nächster Schritt:",
      "Online-Bewertung persönlich prüfen, abweichende Angaben klären und Eigentümer zeitnah zurückrufen.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "Neue Terminanfrage aus der Immobilienbewertung-Landingpage",
    "",
    `Ort/Landingpage: ${input.locationLabel}`,
    `Adresse der Immobilie: ${input.address}`,
    "",
    `Name: ${input.name}`,
    `E-Mail: ${input.email}`,
    `Telefon: ${input.phone}`,
    input.originUrl ? `Herkunfts-URL: ${input.originUrl}` : "",
    "",
    "Gewünschter nächster Schritt:",
    "Bewertungstermin abstimmen und Eigentümer persönlich qualifizieren.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  let leadId: string | null = null;

  try {
    const clientIp = getClientIp(request);
    assertRateLimit(`lead:appointment:${clientIp}`);

    const parsed = appointmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingaben." },
        { status: 400 },
      );
    }

    const input = parsed.data;
    if (input.website) {
      return NextResponse.json({ success: true });
    }

    const name = splitName(input.name);
    const address = parseAddress(input.address, input.locationLabel);
    const leadPayload = leadCreateSchema.safeParse({
      email: input.email,
      firstname: name.firstname,
      lastname: name.lastname,
      phone: input.phone,
      sub_type: isValuationCheck(input) ? "Persönliche Bewertungsprüfung" : "Bewertungstermin",
      reason: isValuationCheck(input) ? "bewertung_pruefen" : "bewertungstermin",
      selling_intent: isValuationCheck(input) ? "bewertung_pruefen" : "termin_anfragen",
      timeline: "kurzfristig",
      street: address.street,
      house_number: address.house_number,
      postal_code: address.postal_code,
      city: address.city,
      district: address.district,
      consent_given: true,
      privacy_version: "2026-04-26",
      marketing_consent: false,
    });

    if (!leadPayload.success) {
      return NextResponse.json(
        { success: false, error: leadPayload.error.issues[0]?.message ?? "Ungültige Eingaben." },
        { status: 400 },
      );
    }

    let lead = await upsertLeadRequest({
      payload: leadPayload.data,
      status: "address_captured",
      ipHash: hashPrivacyValue(clientIp),
      userAgentHash: hashPrivacyValue(request.headers.get("user-agent")),
    });
    leadId = lead.id;

    await Promise.all([
      insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "form_started",
        payload: {
          source: isValuationCheck(input) ? "valuation_location_correction" : "valuation_hero_appointment",
          location: input.locationLabel,
        },
      }),
      insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "email_entered",
        payload: {
          source: isValuationCheck(input) ? "valuation_location_correction" : "valuation_hero_appointment",
        },
      }),
      insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "address_entered",
        payload: {
          source: isValuationCheck(input) ? "valuation_location_correction" : "valuation_hero_appointment",
          rawAddress: input.address,
        },
      }),
    ]);

    let propstackSynced = false;
    try {
      const existingContact = lead.propstack_contact_id ? null : await findPropstackContactByEmail(input.email);
      const hadPropstackContact = Boolean(lead.propstack_contact_id || existingContact?.id);
      const contactId = await createOrUpdateContact({
        contactId: lead.propstack_contact_id ?? existingContact?.id ?? null,
        email: input.email,
        firstname: name.firstname,
        lastname: name.lastname,
        phone: input.phone,
        consent: true,
        sourceNote: isValuationCheck(input)
          ? `Website Immobilienbewertung\nStatus: Persönliche Prüfung der Online-Bewertung angefragt\nOrt: ${input.locationLabel}`
          : `Website Immobilienbewertung\nStatus: Bewertungstermin angefragt\nOrt: ${input.locationLabel}`,
      });

      if (contactId) {
        lead = (await updateLeadPropstackIds({ leadId: lead.id, contactId })) ?? lead;
        await insertLeadEvent({
          leadRequestId: lead.id,
          eventName: hadPropstackContact ? "propstack_contact_updated" : "propstack_contact_created",
          payload: { contactId, matchedByEmail: Boolean(existingContact?.id) },
        });
      }

      const propertyId = await createOrUpdateProperty({
        propertyId: lead.propstack_property_id,
        lead,
      });

      if (propertyId) {
        lead = (await updateLeadPropstackIds({ leadId: lead.id, propertyId })) ?? lead;
        await insertLeadEvent({
          leadRequestId: lead.id,
          eventName: "propstack_property_created",
          payload: { propertyId },
        });
      }

      if (lead.propstack_contact_id && lead.propstack_property_id) {
        const previousDealId = lead.propstack_deal_id;
        const dealId = await createOrUpdateDeal({
          dealId: lead.propstack_deal_id,
          contactId: lead.propstack_contact_id,
          propertyId: lead.propstack_property_id,
          lead,
        });
        if (dealId) {
          lead = (await updateLeadPropstackIds({ leadId: lead.id, dealId })) ?? lead;
          await insertLeadEvent({
            leadRequestId: lead.id,
            eventName: previousDealId ? "propstack_deal_updated" : "propstack_deal_created",
            payload: { dealId },
          });
        }
      }

      const body = buildAppointmentBody(input);
      const [noteId, taskId] = await Promise.all([
        createNote({
          title: isValuationCheck(input)
            ? `Online-Bewertung prüfen: ${input.locationLabel}`
            : `Bewertungstermin angefragt: ${input.locationLabel}`,
          body,
          contactId: lead.propstack_contact_id,
          propertyId: lead.propstack_property_id,
        }),
        createTask({
          title: isValuationCheck(input)
            ? `Online-Bewertung persönlich prüfen: ${input.name}`
            : `Bewertungstermin vereinbaren: ${input.name}`,
          body,
          contactId: lead.propstack_contact_id,
          propertyId: lead.propstack_property_id,
          assignedBrokerId: 395772,
          noteTypeId: 616845,
        }),
      ]);

      if (noteId) {
        await insertLeadEvent({
          leadRequestId: lead.id,
          eventName: "propstack_note_created",
          payload: { noteId },
        });
      }

      if (taskId) {
        await insertLeadEvent({
          leadRequestId: lead.id,
          eventName: "propstack_task_created",
          payload: { taskId },
        });
      }

      propstackSynced = Boolean(contactId);
    } catch (error) {
      await insertLeadEvent({
        leadRequestId: lead.id,
        eventName: "valuation_failed",
        payload: {
          stage: "propstack_appointment",
          message: error instanceof Error ? error.message : String(error),
        },
      });
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      propstackSynced,
      message:
        isValuationCheck(input)
          ? "Wir haben deine Anfrage erhalten und melden uns zeitnah bei dir, um die Bewertung gemeinsam durchzugehen."
          : "Wir haben deine Anfrage erhalten und melden uns zeitnah bei dir, um einen passenden Termin zu vereinbaren.",
    });
  } catch (error: unknown) {
    const retryAfter = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      {
        success: false,
        leadId,
        error: error instanceof Error ? error.message : "Die Terminanfrage konnte gerade nicht verarbeitet werden.",
      },
      { status: retryAfter ? 429 : 500, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined },
    );
  }
}
