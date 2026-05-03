export const FORM_SUBMIT_SUCCESS_EVENT = "frisia:form-submit-success";

export type AnalyticsEventPayload = Record<string, string | number | boolean | null | undefined>;

export function dispatchFormSubmitSuccess(detail: AnalyticsEventPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FORM_SUBMIT_SUCCESS_EVENT, { detail }));
}
