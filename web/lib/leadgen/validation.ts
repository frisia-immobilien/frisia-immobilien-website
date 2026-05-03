import { z } from "zod";

const objectType = z.enum(["haus", "wohnung", "grundstueck", "gewerbe"]);

const optionalText = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((value) => {
    const text = String(value ?? "").trim();
    return text.length > 0 ? text : null;
  });

const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  });

const optionalBoolean = z
  .union([z.boolean(), z.string(), z.number()])
  .optional()
  .nullable()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "boolean") return value;
    const text = String(value).trim().toLowerCase();
    if (["true", "1", "ja", "yes"].includes(text)) return true;
    if (["false", "0", "nein", "no"].includes(text)) return false;
    return null;
  });

export const leadPayloadSchema = z.object({
  id: optionalText,
  email: optionalText,
  firstname: optionalText,
  lastname: optionalText,
  phone: optionalText,
  object_type: objectType.optional().nullable(),
  sub_type: optionalText,
  reason: optionalText,
  selling_intent: optionalText,
  timeline: optionalText,
  street: optionalText,
  house_number: optionalText,
  postal_code: optionalText,
  city: optionalText,
  district: optionalText,
  landkreis: optionalText,
  lat: optionalNumber,
  lng: optionalNumber,
  living_area: optionalNumber,
  plot_area: optionalNumber,
  rooms: optionalNumber,
  construction_year: optionalNumber,
  condition: optionalText,
  equipment: optionalText,
  energy_class: optionalText,
  floor: optionalNumber,
  elevator: optionalBoolean,
  balcony: optionalBoolean,
  garden: optionalBoolean,
  garage: optionalBoolean,
  basement: optionalBoolean,
  other_extras: optionalText,
  other_extras_value_eur: optionalNumber,
  renovation_status: optionalText,
  heating_type: optionalText,
  consent_given: z.boolean().optional().default(false),
  privacy_version: optionalText,
  marketing_consent: z.boolean().optional().default(false),
});

export const leadCreateSchema = leadPayloadSchema.superRefine((value, context) => {
  const hasPersonalData = Boolean(
    value.email ||
      value.firstname ||
      value.lastname ||
      value.phone ||
      value.street ||
      value.house_number ||
      value.postal_code ||
      value.city,
  );

  if (hasPersonalData && value.consent_given !== true) {
    context.addIssue({
      code: "custom",
      path: ["consent_given"],
      message: "Vor Speicherung personenbezogener Daten ist eine Einwilligung erforderlich.",
    });
  }

  if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
    context.addIssue({ code: "custom", path: ["email"], message: "E-Mail ungültig." });
  }
});

export const leadEventSchema = z.object({
  lead_request_id: z.string().uuid(),
  event_name: z.enum([
    "form_started",
    "object_type_selected",
    "email_entered",
    "address_entered",
    "valuation_started",
    "valuation_completed",
    "valuation_failed",
    "propstack_contact_created",
    "propstack_contact_updated",
    "propstack_property_created",
    "propstack_deal_created",
    "propstack_deal_updated",
    "propstack_note_created",
    "propstack_task_created",
    "email_sent",
    "report_opened",
    "cta_clicked",
    "phone_clicked",
  ]),
  event_payload_json: z.unknown().optional().nullable(),
});

export type LeadPayload = z.infer<typeof leadPayloadSchema>;
