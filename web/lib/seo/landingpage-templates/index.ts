import { hausKaufenTemplate } from "./haus-kaufen";
import { hausVerkaufenTemplate } from "./haus-verkaufen";
import { immobilieVerkaufenTemplate, immobilienVerkaufenTemplate } from "./immobilie-verkaufen";
import { immobilienTemplate } from "./immobilien";
import { immobilienbewertungTemplate } from "./immobilienbewertung";
import { immobilienmaklerTemplate } from "./immobilienmakler";
import { immobilienpreiseTemplate } from "./immobilienpreise";
import type { LandingTemplate } from "./types";

export type { LandingTemplate } from "./types";

export const LANDING_TEMPLATES: LandingTemplate[] = [
  immobilienmaklerTemplate,
  immobilienbewertungTemplate,
  hausVerkaufenTemplate,
  immobilieVerkaufenTemplate,
  immobilienVerkaufenTemplate,
  hausKaufenTemplate,
  immobilienTemplate,
  immobilienpreiseTemplate,
];
