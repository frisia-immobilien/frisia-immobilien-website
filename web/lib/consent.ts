export type ConsentChoice = "necessary" | "all" | "custom";

export type ConsentState = {
  choice: ConsentChoice;
  analytics: boolean;
  necessary: true;
  consentVersion: string;
  savedAt: string;
  expiresAt: string;
};

export const CONSENT_STORAGE_KEY = "frisia_cookie_consent_v1";
export const CONSENT_VERSION = "2026-03-08";
export const CONSENT_UPDATED_EVENT = "frisia:consent-updated";
const CONSENT_TTL_DAYS = 183;

type LegacyConsentState = {
  choice?: ConsentChoice;
  analytics?: boolean;
};

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function normalizeConsent(parsed: LegacyConsentState | ConsentState): ConsentState | null {
  if (!parsed?.choice) return null;
  const now = new Date();
  const savedAt = "savedAt" in parsed && typeof parsed.savedAt === "string" ? parsed.savedAt : now.toISOString();
  const expiresAt =
    "expiresAt" in parsed && typeof parsed.expiresAt === "string"
      ? parsed.expiresAt
      : addDays(now, CONSENT_TTL_DAYS).toISOString();

  return {
    choice: parsed.choice,
    analytics: Boolean(parsed.analytics),
    necessary: true,
    consentVersion:
      "consentVersion" in parsed && typeof parsed.consentVersion === "string"
        ? parsed.consentVersion
        : CONSENT_VERSION,
    savedAt,
    expiresAt,
  };
}

export function readConsentFromStorage(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LegacyConsentState | ConsentState;
    const normalized = normalizeConsent(parsed);
    if (!normalized) return null;
    if (Number.isNaN(Date.parse(normalized.expiresAt))) return null;
    if (new Date(normalized.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export function writeConsentToStorage(consent: Pick<ConsentState, "choice" | "analytics">): boolean {
  if (typeof window === "undefined") return false;
  const now = new Date();
  const payload: ConsentState = {
    choice: consent.choice,
    analytics: Boolean(consent.analytics),
    necessary: true,
    consentVersion: CONSENT_VERSION,
    savedAt: now.toISOString(),
    expiresAt: addDays(now, CONSENT_TTL_DAYS).toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function hasAnalyticsConsent(): boolean {
  const consent = readConsentFromStorage();
  return Boolean(consent?.analytics);
}

export function dispatchConsentUpdated(analytics: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: { analytics } }));
}

type GtagConsent = "granted" | "denied";

type WindowWithGtag = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
};

export function applyGoogleConsentMode(analytics: boolean) {
  if (typeof window === "undefined") return;
  const w = window as WindowWithGtag;
  const analyticsStorage: GtagConsent = analytics ? "granted" : "denied";

  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      analytics_storage: analyticsStorage,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
      personalization_storage: "denied",
      security_storage: "granted",
    });
    return;
  }

  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({
    event: "consent_update",
    analytics_storage: analyticsStorage,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    personalization_storage: "denied",
    security_storage: "granted",
  });
}
