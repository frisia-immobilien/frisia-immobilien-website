export type ObjectType = "haus" | "wohnung" | "grundstueck" | "gewerbe";
export type MarketObjectType = "haus" | "wohnung";
export type PriceHistoryObjectType = MarketObjectType | "grundstueck";

export type LeadStatus =
  | "started"
  | "email_captured"
  | "address_captured"
  | "valuation_calculated"
  | "report_sent"
  | "opened"
  | "expired"
  | "failed";

export type MarketLevelUsed =
  | "ortsteil"
  | "stadt_gemeinde"
  | "landkreis"
  | "region"
  | "boris_zone"
  | "none";

export type DataSource = "frisia_market_db" | "boris" | "manual" | "not_available";
export type ReportStatus = "active" | "expired" | "revoked" | "failed";

export type LeadEventName =
  | "form_started"
  | "object_type_selected"
  | "email_entered"
  | "address_entered"
  | "valuation_started"
  | "valuation_completed"
  | "valuation_failed"
  | "propstack_contact_created"
  | "propstack_contact_updated"
  | "propstack_property_created"
  | "propstack_note_created"
  | "propstack_task_created"
  | "email_sent"
  | "report_opened"
  | "cta_clicked"
  | "phone_clicked";

export type SeoPageType =
  | "region_hub"
  | "immobilienpreise"
  | "immobilienmakler"
  | "immobilienbewertung"
  | "haus_verkaufen"
  | "immobilie_verkaufen"
  | "haus_kaufen"
  | "immobilien";

export type MarketDataRow = {
  id: string;
  object_type: MarketObjectType;
  region_code: string | null;
  landkreis: string | null;
  stadt_gemeinde: string | null;
  ortsteil: string | null;
  datensatz_typ: string;
  location_id: string | null;
  parent_location_id: string | null;
  location_label: string | null;
  parent_label: string | null;
  location_join_key: string;
  parent_join_key: string | null;
  region_slug: string | null;
  landkreis_slug: string | null;
  stadt_gemeinde_slug: string | null;
  ortsteil_slug: string | null;
  location_slug: string | null;
  objektart: string | null;
  plz: string | null;
  plz_bereiche: string | null;
  leadgen_geeignet: boolean;
  leadgen_scope: string | null;
  landingpage_geeignet: boolean;
  landingpage_scope: string | null;
  verkaeufe_anzahl: number | null;
  min_preis_eur_m2: number | null;
  quantil_01_preis_eur_m2: number | null;
  median_preis_eur_m2: number | null;
  durchschnitt_preis_eur_m2: number | null;
  quantil_09_preis_eur_m2: number | null;
  max_preis_eur_m2: number | null;
  delta_vorjahr_median_prozent: number | null;
  median_preis_eur: number | null;
  tage_am_markt: number | null;
  created_at: string;
  updated_at: string;
};

export type LeadRequestRow = {
  id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  object_type: ObjectType | null;
  sub_type: string | null;
  reason: string | null;
  selling_intent: string | null;
  timeline: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  district: string | null;
  landkreis: string | null;
  lat: number | null;
  lng: number | null;
  living_area: number | null;
  plot_area: number | null;
  rooms: number | null;
  construction_year: number | null;
  condition: string | null;
  equipment: string | null;
  energy_class: string | null;
  floor: number | null;
  elevator: boolean | null;
  balcony: boolean | null;
  garden: boolean | null;
  garage: boolean | null;
  basement: boolean | null;
  other_extras: string | null;
  other_extras_value_eur: number | null;
  renovation_status: string | null;
  heating_type: string | null;
  consent_given: boolean;
  consent_timestamp: string | null;
  privacy_version: string | null;
  marketing_consent: boolean;
  propstack_contact_id: number | null;
  propstack_property_id: number | null;
  status: LeadStatus;
  ip_hash: string | null;
  user_agent_hash: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadReportRow = {
  id: string;
  lead_request_id: string;
  token_hash: string;
  expires_at: string;
  base_value: number | null;
  adjusted_value: number | null;
  range_min: number | null;
  range_max: number | null;
  price_per_m2_min: number | null;
  price_per_m2_max: number | null;
  data_source: DataSource;
  market_level_used: MarketLevelUsed;
  market_data_id: string | null;
  accuracy_score: number | null;
  confidence_label: string | null;
  calculation_notes: string | null;
  report_status: ReportStatus;
  opened_at: string | null;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadReportWithRequest = LeadReportRow & {
  lead_request: LeadRequestRow;
  market_data: MarketDataRow | null;
};

export type SeoLocationRow = {
  id: string;
  location_slug: string;
  location_label: string;
  location_type: "region" | "landkreis" | "stadt_gemeinde" | "ortsteil";
  stadt_gemeinde: string | null;
  ortsteil: string | null;
  landkreis: string | null;
  region: string | null;
  plz: string | null;
  lat: number | null;
  lng: number | null;
  parent_location_slug: string | null;
  landingpage_geeignet: boolean;
  leadgen_geeignet: boolean;
  priority: number;
  indexable: boolean;
  created_at: string;
  updated_at: string;
};

export type SeoLocationContentRow = {
  id: string;
  location_slug: string;
  page_type: SeoPageType;
  custom_h1: string | null;
  custom_intro: string | null;
  custom_text_1: string | null;
  custom_text_2: string | null;
  custom_text_3: string | null;
  custom_faq_json: unknown;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  seo_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PriceHistoryRow = {
  id: string;
  object_type: PriceHistoryObjectType;
  location_slug: string;
  year: number;
  median_preis_eur_m2: number | null;
  durchschnitt_preis_eur_m2: number | null;
  verkaeufe_anzahl: number | null;
  data_quality: string | null;
  created_at: string;
  updated_at: string;
};
