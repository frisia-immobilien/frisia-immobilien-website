import "server-only";

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

export function requireEnv(name: string) {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`${name} ist nicht gesetzt.`);
  }
  return value;
}

export const env = {
  get DATABASE_URL() {
    return requireEnv("DATABASE_URL");
  },
  get TOKEN_SECRET() {
    return requireEnv("TOKEN_SECRET");
  },
  get TOKEN_TTL_DAYS() {
    return Number(readEnv("TOKEN_TTL_DAYS") || 30);
  },
  get PUBLIC_BASE_URL() {
    return readEnv("PUBLIC_BASE_URL");
  },
  get PROPSTACK_API_KEY() {
    return readEnv("PROPSTACK_API_KEY");
  },
  get PROPSTACK_BASE_URL() {
    return readEnv("PROPSTACK_BASE_URL") || "https://api.propstack.de/v2";
  },
  get PROPSTACK_V1_BASE_URL() {
    const baseUrl = readEnv("PROPSTACK_BASE_URL");
    return (
      readEnv("PROPSTACK_V1_BASE_URL") ||
      baseUrl.replace(/\/v2\/?$/i, "/v1") ||
      "https://api.propstack.de/v1"
    );
  },
  get PROPSTACK_BROKER_ID() {
    return readEnv("PROPSTACK_BROKER_ID");
  },
  get PROPSTACK_LEAD_BROKER_ID() {
    return readEnv("PROPSTACK_LEAD_BROKER_ID");
  },
  get PROPSTACK_LEAD_BROKER_EMAIL() {
    return readEnv("PROPSTACK_LEAD_BROKER_EMAIL");
  },
  get PROPSTACK_LEAD_BROKER_NAME() {
    return readEnv("PROPSTACK_LEAD_BROKER_NAME");
  },
  get PROPSTACK_REPORT_SNIPPET_ID() {
    return readEnv("PROPSTACK_REPORT_SNIPPET_ID");
  },
  get GOOGLE_MAPS_API_KEY() {
    return readEnv("GOOGLE_MAPS_API_KEY");
  },
  get OPENCAGE_API_KEY() {
    return readEnv("OPENCAGE_API_KEY");
  },
  get BORIS_API_URL() {
    return readEnv("BORIS_API_URL");
  },
};
