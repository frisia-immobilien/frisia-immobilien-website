import fs from "node:fs/promises";
import path from "node:path";

import { readActiveSnapshotJson } from "@/lib/website-snapshot";

export type WebsitePartner = {
  key: string;
  name: string;
  text: string;
  imageUrl: string;
  websiteUrl: string | null;
  active: boolean;
  sortOrder: number;
};

type PartnerFeedItem = Partial<{
  key: unknown;
  partner_key: unknown;
  name: unknown;
  title: unknown;
  text: unknown;
  description: unknown;
  image_url: unknown;
  imageUrl: unknown;
  website_url: unknown;
  websiteUrl: unknown;
  active: unknown;
  sort_order: unknown;
  sortOrder: unknown;
}>;

type PartnerFeedPayload =
  | PartnerFeedItem[]
  | {
      partners?: PartnerFeedItem[];
      data?: PartnerFeedItem[] | { partners?: PartnerFeedItem[] };
    };

export const PARTNER_FALLBACK_IMAGE = "/images/maklerhaus/buero1.webp";
const DEFAULT_PARTNERS_FEED_URL = "https://frisia-inside.de/api/partners/public.php";
const PARTNER_TEXT_MAX_LENGTH = 175;

const DEFAULT_PARTNER_TEXT =
  "Partner im erweiterten Netzwerk von Frisia Immobilien. Details, Bild und Beschreibung koennen in Frisia Inside gepflegt werden.";

export const DEFAULT_WEBSITE_PARTNERS: WebsitePartner[] = [
  {
    key: "immobilienscout24",
    name: "ImmobilienScout24",
    text:
      "ImmobilienScout24 zaehlt zu den reichweitenstarken Immobilienportalen und unterstuetzt die Sichtbarkeit ausgewaehlter Angebote.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 10,
  },
  {
    key: "kleinanzeigen",
    name: "Kleinanzeigen",
    text:
      "Kleinanzeigen ergaenzt die regionale Reichweite fuer Immobilien, Gesuche und relevante Kontakte im lokalen Markt.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 20,
  },
  {
    key: "garten-reuter",
    name: "Garten Reuter",
    text:
      "Garten Reuter steht fuer gepflegte Aussenbereiche und praktische Umsetzung rund um Garten, Grundstueck und Erscheinungsbild.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 30,
  },
  {
    key: "1a-immobilien",
    name: "1A Immobilien",
    text:
      "1A Immobilien ist ein weiterer Vermarktungskanal im Netzwerk fuer Sichtbarkeit und Immobilieninteresse.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 40,
  },
  {
    key: "ruempelmeister",
    name: "Ruempelmeister",
    text:
      "Ruempelmeister unterstuetzt, wenn Immobilien vor Verkauf, Uebergabe oder Neuordnung vorbereitet werden muessen.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 50,
  },
  {
    key: "11880",
    name: "11880",
    text:
      "11880 unterstuetzt die Auffindbarkeit von Unternehmen und Dienstleistungen im regionalen Umfeld.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 60,
  },
  {
    key: "gelbe-seiten",
    name: "Gelbe Seiten",
    text:
      "Gelbe Seiten ist ein etablierter Verzeichnisdienst fuer regionale Sichtbarkeit und Kontaktsuche.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 70,
  },
  {
    key: "decker-bau",
    name: "Decker Bau",
    text:
      "Decker Bau steht im Netzwerk fuer bauliche Expertise und praktische Einordnung rund um Immobilien und Projekte.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 80,
  },
  {
    key: "eilers-gutachten",
    name: "Eilers Gutachten",
    text:
      "Eilers Gutachten ergaenzt das Netzwerk mit fachlicher Bewertungskompetenz und sachverstaendiger Einordnung.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: "https://eilers-gutachten.de/",
    active: true,
    sortOrder: 90,
  },
  {
    key: "winterhoff-buss-notariat",
    name: "Winterhoff Buss Notariat",
    text:
      "Winterhoff Buss Notariat begleitet notarielle Vorgange, wenn ein Immobilienverkauf rechtlich sauber abgeschlossen wird.",
    imageUrl: PARTNER_FALLBACK_IMAGE,
    websiteUrl: null,
    active: true,
    sortOrder: 100,
  },
];

const DEFAULT_PARTNER_BY_KEY = new Map(DEFAULT_WEBSITE_PARTNERS.map((partner) => [partner.key, partner]));

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function limitPartnerText(text: string) {
  const normalized = text.trim();
  const characters = Array.from(normalized);
  if (characters.length <= PARTNER_TEXT_MAX_LENGTH) return normalized;

  const excerpt = characters.slice(0, PARTNER_TEXT_MAX_LENGTH - 3).join("").trimEnd();
  const lastSpace = excerpt.lastIndexOf(" ");
  const cleanExcerpt = lastSpace > 90 ? excerpt.slice(0, lastSpace) : excerpt;
  return `${cleanExcerpt}...`;
}

function asBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLocaleLowerCase("de-DE");
    if (["1", "true", "ja", "yes", "active"].includes(normalized)) return true;
    if (["0", "false", "nein", "no", "inactive"].includes(normalized)) return false;
  }
  return fallback;
}

function asNumber(value: unknown, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function localInsidePartnerExportPath() {
  return path.join(process.cwd(), "..", "inside", "public", "storage", "partners", "public.json");
}

function resolveLocalInsideImage(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/partners/")) return imageUrl;
  return `/api/partners/image?path=${encodeURIComponent(imageUrl)}`;
}

function normalizePartner(item: PartnerFeedItem, index: number, source: "local" | "remote" | "default", feedUrl?: string) {
  const key = asString(item.key) || asString(item.partner_key);
  if (!key) return null;

  const fallback = DEFAULT_PARTNER_BY_KEY.get(key);
  const name = asString(item.name) || asString(item.title) || fallback?.name || key;
  const text = limitPartnerText(
    asString(item.text) || asString(item.description) || fallback?.text || DEFAULT_PARTNER_TEXT,
  );
  const rawImageUrl = asString(item.imageUrl) || asString(item.image_url) || fallback?.imageUrl || PARTNER_FALLBACK_IMAGE;
  const websiteUrl = asString(item.websiteUrl) || asString(item.website_url) || fallback?.websiteUrl || "";
  const sortOrder = asNumber(item.sortOrder ?? item.sort_order, fallback?.sortOrder ?? (index + 1) * 10);

  let imageUrl = rawImageUrl || PARTNER_FALLBACK_IMAGE;
  if (source === "remote" && feedUrl && imageUrl.startsWith("/")) {
    imageUrl = new URL(imageUrl, feedUrl).toString();
  }
  if (source === "local") {
    imageUrl = resolveLocalInsideImage(imageUrl);
  }

  return {
    key,
    name,
    text,
    imageUrl,
    websiteUrl: websiteUrl || null,
    active: asBoolean(item.active, fallback?.active ?? true),
    sortOrder,
  } satisfies WebsitePartner;
}

function extractPartnerItems(payload: PartnerFeedPayload): PartnerFeedItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.partners)) return payload.partners;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && !Array.isArray(payload.data) && Array.isArray(payload.data.partners)) {
    return payload.data.partners;
  }
  return [];
}

function finalizePartners(partners: WebsitePartner[]) {
  return partners
    .map((partner) => ({
      ...partner,
      imageUrl: partner.imageUrl || PARTNER_FALLBACK_IMAGE,
      text: limitPartnerText(partner.text || DEFAULT_PARTNER_TEXT),
    }))
    .filter((partner) => partner.active)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "de"));
}

async function loadPartnersFromFeed(feedUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);

  try {
    const response = await fetch(feedUrl, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as PartnerFeedPayload;
    return extractPartnerItems(payload)
      .map((item, index) => normalizePartner(item, index, "remote", feedUrl))
      .filter((partner): partner is WebsitePartner => Boolean(partner));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function loadPartnersFromSnapshot() {
  const payload = readActiveSnapshotJson<PartnerFeedPayload>("partners");
  return extractPartnerItems(payload ?? [])
    .map((item, index) => normalizePartner(item, index, "remote"))
    .filter((partner): partner is WebsitePartner => Boolean(partner));
}

async function loadPartnersFromLocalInsideExport() {
  try {
    const raw = await fs.readFile(localInsidePartnerExportPath(), "utf8");
    const payload = JSON.parse(raw) as PartnerFeedPayload;
    return extractPartnerItems(payload)
      .map((item, index) => normalizePartner(item, index, "local"))
      .filter((partner): partner is WebsitePartner => Boolean(partner));
  } catch {
    return [];
  }
}

function preferLocalInsideExport() {
  return process.env.NODE_ENV === "development" && !process.env.FRISIA_PARTNERS_FEED_URL?.trim();
}

export async function getWebsitePartners() {
  const snapshotPartners = loadPartnersFromSnapshot();
  if (snapshotPartners.length > 0) return finalizePartners(snapshotPartners);

  if (preferLocalInsideExport()) {
    const localPartners = await loadPartnersFromLocalInsideExport();
    if (localPartners.length > 0) return finalizePartners(localPartners);
  }

  const feedUrl = process.env.FRISIA_PARTNERS_FEED_URL?.trim();
  const remotePartners = feedUrl ? await loadPartnersFromFeed(feedUrl) : [];
  if (remotePartners.length > 0) return finalizePartners(remotePartners);

  const localPartners = await loadPartnersFromLocalInsideExport();
  if (localPartners.length > 0) return finalizePartners(localPartners);

  return DEFAULT_WEBSITE_PARTNERS;
}
