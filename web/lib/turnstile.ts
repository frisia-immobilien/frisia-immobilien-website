const TURNSTILE_TEST_KEY_PREFIXES = [
  "1x00000000000000000000",
  "2x00000000000000000000",
  "3x00000000000000000000",
];

export function isTurnstileTestKey(value?: string | null) {
  const key = String(value ?? "").trim();
  return TURNSTILE_TEST_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function shouldBypassTurnstileForLocalDev(value?: string | null) {
  return process.env.NODE_ENV !== "production" && isTurnstileTestKey(value);
}
