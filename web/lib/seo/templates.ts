import type { SeoPageType } from "@/lib/types/leadgen";
import { LANDING_TEMPLATES } from "@/lib/seo/landingpage-templates";

export { LANDING_TEMPLATES };
export type { LandingTemplate } from "@/lib/seo/landingpage-templates";

export function findTemplateBySlug(slug: string) {
  for (const template of LANDING_TEMPLATES) {
    const prefix = `${template.prefix}-`;
    if (slug.startsWith(prefix)) {
      const locationSlug = slug.slice(prefix.length);
      return locationSlug ? { template, locationSlug } : null;
    }
  }

  return null;
}

export function getTemplateByPageType(pageType: SeoPageType) {
  return LANDING_TEMPLATES.find((template) => template.pageType === pageType) ?? LANDING_TEMPLATES[0];
}
