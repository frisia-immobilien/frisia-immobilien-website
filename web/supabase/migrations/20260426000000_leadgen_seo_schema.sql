CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type TEXT NOT NULL,
  region_code TEXT,
  landkreis TEXT,
  stadt_gemeinde TEXT,
  ortsteil TEXT,
  datensatz_typ TEXT NOT NULL,
  location_id TEXT,
  parent_location_id TEXT,
  location_label TEXT,
  parent_label TEXT,
  location_join_key TEXT NOT NULL,
  parent_join_key TEXT,
  region_slug TEXT,
  landkreis_slug TEXT,
  stadt_gemeinde_slug TEXT,
  ortsteil_slug TEXT,
  location_slug TEXT,
  objektart TEXT,
  plz TEXT,
  plz_bereiche TEXT,
  leadgen_geeignet BOOLEAN NOT NULL DEFAULT FALSE,
  leadgen_scope TEXT,
  landingpage_geeignet BOOLEAN NOT NULL DEFAULT FALSE,
  landingpage_scope TEXT,
  verkaeufe_anzahl INTEGER,
  min_preis_eur_m2 NUMERIC(12,2),
  quantil_01_preis_eur_m2 NUMERIC(12,2),
  median_preis_eur_m2 NUMERIC(12,2),
  durchschnitt_preis_eur_m2 NUMERIC(12,2),
  quantil_09_preis_eur_m2 NUMERIC(12,2),
  max_preis_eur_m2 NUMERIC(12,2),
  delta_vorjahr_median_prozent NUMERIC(8,2),
  median_preis_eur NUMERIC(14,2),
  tage_am_markt INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.market_data
    ADD CONSTRAINT market_data_object_type_check CHECK (object_type IN ('haus', 'wohnung'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS market_data_object_location_type_uidx
  ON public.market_data (object_type, location_join_key, datensatz_typ);
CREATE INDEX IF NOT EXISTS market_data_object_type_idx ON public.market_data (object_type);
CREATE INDEX IF NOT EXISTS market_data_location_join_key_idx ON public.market_data (location_join_key);
CREATE INDEX IF NOT EXISTS market_data_parent_join_key_idx ON public.market_data (parent_join_key);
CREATE INDEX IF NOT EXISTS market_data_location_slug_idx ON public.market_data (location_slug);
CREATE INDEX IF NOT EXISTS market_data_stadt_gemeinde_slug_idx ON public.market_data (stadt_gemeinde_slug);
CREATE INDEX IF NOT EXISTS market_data_ortsteil_slug_idx ON public.market_data (ortsteil_slug);
CREATE INDEX IF NOT EXISTS market_data_datensatz_typ_idx ON public.market_data (datensatz_typ);
CREATE INDEX IF NOT EXISTS market_data_leadgen_geeignet_idx ON public.market_data (leadgen_geeignet);
CREATE INDEX IF NOT EXISTS market_data_landingpage_geeignet_idx ON public.market_data (landingpage_geeignet);

CREATE TABLE IF NOT EXISTS public.lead_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  firstname TEXT,
  lastname TEXT,
  phone TEXT,
  object_type TEXT,
  sub_type TEXT,
  reason TEXT,
  selling_intent TEXT,
  timeline TEXT,
  street TEXT,
  house_number TEXT,
  postal_code TEXT,
  city TEXT,
  district TEXT,
  landkreis TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  living_area NUMERIC(12,2),
  plot_area NUMERIC(12,2),
  rooms NUMERIC(8,2),
  construction_year INTEGER,
  condition TEXT,
  equipment TEXT,
  energy_class TEXT,
  floor INTEGER,
  elevator BOOLEAN,
  balcony BOOLEAN,
  garden BOOLEAN,
  garage BOOLEAN,
  basement BOOLEAN,
  renovation_status TEXT,
  heating_type TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_timestamp TIMESTAMPTZ,
  privacy_version TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  propstack_contact_id BIGINT,
  propstack_property_id BIGINT,
  status TEXT NOT NULL DEFAULT 'started',
  ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.lead_requests
    ADD CONSTRAINT lead_requests_status_check
    CHECK (status IN ('started', 'email_captured', 'address_captured', 'valuation_calculated', 'report_sent', 'opened', 'expired', 'failed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  ALTER TABLE public.lead_requests
    ADD CONSTRAINT lead_requests_object_type_check
    CHECK (object_type IS NULL OR object_type IN ('haus', 'wohnung', 'grundstueck', 'gewerbe'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS lead_requests_email_idx ON public.lead_requests (email);
CREATE INDEX IF NOT EXISTS lead_requests_status_idx ON public.lead_requests (status);
CREATE INDEX IF NOT EXISTS lead_requests_created_at_idx ON public.lead_requests (created_at);
CREATE INDEX IF NOT EXISTS lead_requests_propstack_contact_id_idx ON public.lead_requests (propstack_contact_id);
CREATE INDEX IF NOT EXISTS lead_requests_propstack_property_id_idx ON public.lead_requests (propstack_property_id);

CREATE TABLE IF NOT EXISTS public.lead_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_request_id UUID NOT NULL REFERENCES public.lead_requests(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  base_value NUMERIC(14,2),
  adjusted_value NUMERIC(14,2),
  range_min INTEGER,
  range_max INTEGER,
  price_per_m2_min NUMERIC(12,2),
  price_per_m2_max NUMERIC(12,2),
  data_source TEXT NOT NULL DEFAULT 'not_available',
  market_level_used TEXT NOT NULL DEFAULT 'none',
  market_data_id UUID REFERENCES public.market_data(id) ON DELETE SET NULL,
  accuracy_score INTEGER,
  confidence_label TEXT,
  calculation_notes TEXT,
  report_status TEXT NOT NULL DEFAULT 'active',
  opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.lead_reports
    ADD CONSTRAINT lead_reports_data_source_check
    CHECK (data_source IN ('frisia_market_db', 'boris', 'manual', 'not_available'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  ALTER TABLE public.lead_reports
    ADD CONSTRAINT lead_reports_market_level_check
    CHECK (market_level_used IN ('ortsteil', 'stadt_gemeinde', 'landkreis', 'region', 'boris_zone', 'none'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  ALTER TABLE public.lead_reports
    ADD CONSTRAINT lead_reports_status_check
    CHECK (report_status IN ('active', 'expired', 'revoked', 'failed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS lead_reports_token_hash_idx ON public.lead_reports (token_hash);
CREATE INDEX IF NOT EXISTS lead_reports_lead_request_id_idx ON public.lead_reports (lead_request_id);
CREATE INDEX IF NOT EXISTS lead_reports_expires_at_idx ON public.lead_reports (expires_at);
CREATE INDEX IF NOT EXISTS lead_reports_report_status_idx ON public.lead_reports (report_status);

CREATE TABLE IF NOT EXISTS public.land_value_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  street TEXT,
  house_number TEXT,
  postal_code TEXT,
  city TEXT,
  district TEXT,
  landkreis TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  boris_zone_id TEXT,
  bodenrichtwert_eur_m2 NUMERIC(12,2),
  stichtag DATE,
  nutzungsart TEXT,
  entwicklungszustand TEXT,
  erschliessung TEXT,
  plot_area NUMERIC(12,2),
  calculated_land_value NUMERIC(14,2),
  source TEXT,
  raw_response_json JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS land_value_cache_lat_idx ON public.land_value_cache (lat);
CREATE INDEX IF NOT EXISTS land_value_cache_lng_idx ON public.land_value_cache (lng);
CREATE INDEX IF NOT EXISTS land_value_cache_postal_code_idx ON public.land_value_cache (postal_code);
CREATE INDEX IF NOT EXISTS land_value_cache_city_idx ON public.land_value_cache (city);
CREATE INDEX IF NOT EXISTS land_value_cache_boris_zone_id_idx ON public.land_value_cache (boris_zone_id);
CREATE INDEX IF NOT EXISTS land_value_cache_expires_at_idx ON public.land_value_cache (expires_at);

CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_request_id UUID NOT NULL REFERENCES public.lead_requests(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_payload_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lead_events
  ADD COLUMN IF NOT EXISTS lead_request_id UUID REFERENCES public.lead_requests(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS event_name TEXT,
  ADD COLUMN IF NOT EXISTS event_payload_json JSONB;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lead_events'
      AND column_name = 'lead_id'
  ) THEN
    ALTER TABLE public.lead_events ALTER COLUMN lead_id DROP NOT NULL;
  END IF;
END;
$$;

DO $$
BEGIN
  ALTER TABLE public.lead_events
    ADD CONSTRAINT lead_events_name_check
    CHECK (event_name IN (
      'form_started',
      'object_type_selected',
      'email_entered',
      'address_entered',
      'valuation_started',
      'valuation_completed',
      'valuation_failed',
      'propstack_contact_created',
      'propstack_contact_updated',
      'propstack_property_created',
      'propstack_note_created',
      'propstack_task_created',
      'email_sent',
      'report_opened',
      'cta_clicked',
      'phone_clicked'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS lead_events_lead_request_id_idx ON public.lead_events (lead_request_id);
CREATE INDEX IF NOT EXISTS lead_events_event_name_idx ON public.lead_events (event_name);
CREATE INDEX IF NOT EXISTS lead_events_created_at_idx ON public.lead_events (created_at);

CREATE TABLE IF NOT EXISTS public.seo_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_slug TEXT NOT NULL UNIQUE,
  location_label TEXT NOT NULL,
  location_type TEXT NOT NULL,
  stadt_gemeinde TEXT,
  ortsteil TEXT,
  landkreis TEXT,
  region TEXT,
  plz TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  parent_location_slug TEXT,
  landingpage_geeignet BOOLEAN NOT NULL DEFAULT FALSE,
  leadgen_geeignet BOOLEAN NOT NULL DEFAULT FALSE,
  priority INTEGER NOT NULL DEFAULT 50,
  indexable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.seo_locations
    ADD CONSTRAINT seo_locations_type_check
    CHECK (location_type IN ('region', 'landkreis', 'stadt_gemeinde', 'ortsteil'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS seo_locations_location_slug_idx ON public.seo_locations (location_slug);
CREATE INDEX IF NOT EXISTS seo_locations_parent_location_slug_idx ON public.seo_locations (parent_location_slug);
CREATE INDEX IF NOT EXISTS seo_locations_location_type_idx ON public.seo_locations (location_type);
CREATE INDEX IF NOT EXISTS seo_locations_landkreis_idx ON public.seo_locations (landkreis);
CREATE INDEX IF NOT EXISTS seo_locations_stadt_gemeinde_idx ON public.seo_locations (stadt_gemeinde);
CREATE INDEX IF NOT EXISTS seo_locations_landingpage_geeignet_idx ON public.seo_locations (landingpage_geeignet);
CREATE INDEX IF NOT EXISTS seo_locations_indexable_idx ON public.seo_locations (indexable);

CREATE TABLE IF NOT EXISTS public.seo_location_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_slug TEXT NOT NULL REFERENCES public.seo_locations(location_slug) ON DELETE CASCADE,
  page_type TEXT NOT NULL,
  custom_h1 TEXT,
  custom_intro TEXT,
  custom_text_1 TEXT,
  custom_text_2 TEXT,
  custom_text_3 TEXT,
  custom_faq_json JSONB,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  seo_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (location_slug, page_type)
);

DO $$
BEGIN
  ALTER TABLE public.seo_location_content
    ADD CONSTRAINT seo_location_content_page_type_check
    CHECK (page_type IN (
      'region_hub',
      'immobilienpreise',
      'immobilienmakler',
      'immobilienbewertung',
      'haus_verkaufen',
      'immobilie_verkaufen',
      'haus_kaufen',
      'immobilien'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS seo_location_content_location_slug_idx ON public.seo_location_content (location_slug);
CREATE INDEX IF NOT EXISTS seo_location_content_page_type_idx ON public.seo_location_content (page_type);

CREATE TABLE IF NOT EXISTS public.seo_location_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_slug TEXT NOT NULL REFERENCES public.seo_locations(location_slug) ON DELETE CASCADE,
  page_type TEXT NOT NULL,
  image_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  alt_text TEXT,
  title TEXT,
  caption TEXT,
  geo_lat DOUBLE PRECISION,
  geo_lng DOUBLE PRECISION,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.seo_location_images
    ADD CONSTRAINT seo_location_images_type_check
    CHECK (image_type IN ('hero', 'market', 'district', 'fallback', 'map', 'cta'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS seo_location_images_location_slug_idx ON public.seo_location_images (location_slug);
CREATE INDEX IF NOT EXISTS seo_location_images_page_type_idx ON public.seo_location_images (page_type);
CREATE INDEX IF NOT EXISTS seo_location_images_image_type_idx ON public.seo_location_images (image_type);
CREATE INDEX IF NOT EXISTS seo_location_images_sort_order_idx ON public.seo_location_images (sort_order);

CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type TEXT NOT NULL,
  location_slug TEXT NOT NULL,
  year INTEGER NOT NULL,
  median_preis_eur_m2 NUMERIC(12,2),
  durchschnitt_preis_eur_m2 NUMERIC(12,2),
  verkaeufe_anzahl INTEGER,
  data_quality TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (object_type, location_slug, year)
);

DO $$
BEGIN
  ALTER TABLE public.price_history
    ADD CONSTRAINT price_history_object_type_check
    CHECK (object_type IN ('haus', 'wohnung', 'grundstueck'));
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS price_history_object_type_idx ON public.price_history (object_type);
CREATE INDEX IF NOT EXISTS price_history_location_slug_idx ON public.price_history (location_slug);
CREATE INDEX IF NOT EXISTS price_history_year_idx ON public.price_history (year);

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'market_data',
    'lead_requests',
    'lead_reports',
    'land_value_cache',
    'seo_locations',
    'seo_location_content',
    'seo_location_images',
    'price_history'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_set_updated_at ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      table_name,
      table_name
    );
  END LOOP;
END;
$$;
