import type { SeoLocationContentRow } from "@/lib/types/leadgen";
import type { LandingTemplate } from "@/lib/seo/templates";

export function buildFallbackContent(input: {
  template: LandingTemplate;
  locationLabel: string;
  content?: SeoLocationContentRow | null;
}) {
  const { template, locationLabel } = input;
  const content = input.template.pageType === "immobilienbewertung" ? null : input.content;
  const fallbackFaq = template.faq(locationLabel);
  const customFaq = Array.isArray(content?.custom_faq_json)
    ? (content.custom_faq_json as Array<{ question?: string; answer?: string }>)
        .map((item) => ({
          question: String(item.question ?? "").trim(),
          answer: String(item.answer ?? "").trim(),
        }))
        .filter((item) => item.question && item.answer)
    : [];

  return {
    h1: content?.custom_h1 || template.h1(locationLabel),
    intro: content?.custom_intro || template.intro(locationLabel),
    text1: content?.custom_text_1 || template.text1(locationLabel),
    text2: content?.custom_text_2 || template.text2(locationLabel),
    text3: content?.custom_text_3 || "",
    faq: customFaq.length > 0 ? customFaq : fallbackFaq,
    metaTitle: content?.meta_title || template.title(locationLabel),
    metaDescription: content?.meta_description || template.description(locationLabel),
    canonicalUrl: content?.canonical_url || null,
  };
}
