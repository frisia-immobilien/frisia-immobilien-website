-- Frisia Inside baseline schema for TecSpace MySQL 8.4.
-- Run this once before creating the first admin user.

CREATE TABLE IF NOT EXISTS inside_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  name VARCHAR(190) NOT NULL,
  role ENUM('owner', 'admin', 'editor', 'viewer') NOT NULL DEFAULT 'viewer',
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inside_audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  details_json JSON NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_audit_created_at (created_at),
  INDEX idx_audit_action (action),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES inside_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_scheduled_tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  instruction TEXT NOT NULL,
  recurrence ENUM('once', 'weekly', 'every_4_weeks', 'monthly', 'quarterly') NOT NULL DEFAULT 'weekly',
  status ENUM('active', 'paused', 'archived') NOT NULL DEFAULT 'active',
  risk_level ENUM('low', 'review_required', 'high') NOT NULL DEFAULT 'review_required',
  next_run_at DATETIME NULL,
  last_run_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_tasks_due (status, next_run_at),
  CONSTRAINT fk_tasks_user FOREIGN KEY (created_by) REFERENCES inside_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_task_runs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT UNSIGNED NOT NULL,
  status ENUM('queued', 'running', 'needs_review', 'approved', 'failed', 'skipped') NOT NULL DEFAULT 'queued',
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  result_json JSON NULL,
  error_text TEXT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_task_runs_task (task_id, created_at),
  CONSTRAINT fk_task_runs_task FOREIGN KEY (task_id) REFERENCES ai_scheduled_tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS operator_conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_by BIGINT UNSIGNED NULL,
  title VARCHAR(190) NOT NULL,
  status ENUM('open', 'needs_review', 'approved', 'closed') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_operator_status (status, updated_at),
  CONSTRAINT fk_operator_user FOREIGN KEY (created_by) REFERENCES inside_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS operator_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  role ENUM('user', 'assistant', 'tool', 'system') NOT NULL,
  content MEDIUMTEXT NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_messages_conversation (conversation_id, created_at),
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES operator_conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_locations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  location_slug VARCHAR(160) NOT NULL,
  location_name VARCHAR(190) NOT NULL,
  page_type VARCHAR(80) NOT NULL,
  url_path VARCHAR(255) NOT NULL,
  strategic_location TINYINT(1) NOT NULL DEFAULT 0,
  cluster_relevant TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uniq_seo_location_page (location_slug, page_type),
  UNIQUE KEY uniq_seo_url_path (url_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_location_sources (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  seo_location_id BIGINT UNSIGNED NOT NULL,
  source_name VARCHAR(190) NOT NULL,
  source_url VARCHAR(500) NULL,
  source_type ENUM('official', 'frisia_internal', 'market_report', 'search_console', 'manual_review', 'other') NOT NULL DEFAULT 'other',
  usage_scope ENUM('seo', 'leadgen', 'both', 'context_only') NOT NULL DEFAULT 'seo',
  source_confidence DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  source_timestamp DATETIME NULL,
  valid_from DATE NULL,
  valid_to DATE NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_sources_location (seo_location_id),
  CONSTRAINT fk_sources_location FOREIGN KEY (seo_location_id) REFERENCES seo_locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_location_datapoints (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  seo_location_id BIGINT UNSIGNED NOT NULL,
  source_id BIGINT UNSIGNED NULL,
  metric_key VARCHAR(120) NOT NULL,
  metric_label VARCHAR(190) NOT NULL,
  value_text VARCHAR(255) NULL,
  value_number DECIMAL(14,4) NULL,
  unit VARCHAR(40) NULL,
  usage_scope ENUM('seo', 'leadgen', 'both', 'context_only') NOT NULL DEFAULT 'seo',
  valid_from DATE NULL,
  valid_to DATE NULL,
  source_timestamp DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_datapoints_location (seo_location_id, metric_key),
  CONSTRAINT fk_datapoints_location FOREIGN KEY (seo_location_id) REFERENCES seo_locations(id) ON DELETE CASCADE,
  CONSTRAINT fk_datapoints_source FOREIGN KEY (source_id) REFERENCES seo_location_sources(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_location_quality (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  seo_location_id BIGINT UNSIGNED NOT NULL UNIQUE,
  quality_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  source_confidence DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  local_uniqueness_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  entity_depth_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  duplicate_risk DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  data_freshness ENUM('fresh', 'aging', 'stale', 'unknown') NOT NULL DEFAULT 'unknown',
  has_external_validation TINYINT(1) NOT NULL DEFAULT 0,
  indexing_state ENUM(
    'noindex_insufficient_data',
    'noindex_duplicate_risk',
    'noindex_low_uniqueness',
    'pending_review',
    'indexable_verified',
    'indexable_high_confidence'
  ) NOT NULL DEFAULT 'pending_review',
  performance_state ENUM(
    'observing',
    'stable',
    'improving',
    'declining',
    'low_visibility',
    'revalidation_required'
  ) NOT NULL DEFAULT 'observing',
  indexing_reason TEXT NULL,
  review_status ENUM('not_reviewed', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'not_reviewed',
  reviewed_by VARCHAR(190) NULL,
  last_verified_at DATETIME NULL,
  last_search_console_check_at DATETIME NULL,
  impression_trend VARCHAR(80) NULL,
  indexation_stability VARCHAR(80) NULL,
  crawl_efficiency VARCHAR(80) NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_quality_location FOREIGN KEY (seo_location_id) REFERENCES seo_locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_quality_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  seo_location_id BIGINT UNSIGNED NOT NULL,
  quality_snapshot_json JSON NOT NULL,
  reason TEXT NULL,
  changed_by VARCHAR(190) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_quality_history_location (seo_location_id, created_at),
  CONSTRAINT fk_quality_history_location FOREIGN KEY (seo_location_id) REFERENCES seo_locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_search_console_daily (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  url_path VARCHAR(255) NOT NULL,
  query_text VARCHAR(500) NULL,
  date_day DATE NOT NULL,
  clicks INT NOT NULL DEFAULT 0,
  impressions INT NOT NULL DEFAULT 0,
  ctr DECIMAL(8,6) NOT NULL DEFAULT 0.000000,
  position DECIMAL(8,3) NULL,
  imported_at DATETIME NOT NULL,
  UNIQUE KEY uniq_gsc_daily (url_path, query_text, date_day),
  INDEX idx_gsc_url_date (url_path, date_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS imv_market_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source_record_key VARCHAR(190) NOT NULL UNIQUE,
  region_code VARCHAR(80) NULL,
  location_slug VARCHAR(190) NULL,
  location_label VARCHAR(190) NULL,
  location_type VARCHAR(80) NULL,
  landkreis VARCHAR(190) NULL,
  stadt_gemeinde VARCHAR(190) NULL,
  ortsteil VARCHAR(190) NULL,
  object_type VARCHAR(80) NULL,
  plz VARCHAR(80) NULL,
  leadgen_geeignet TINYINT(1) NOT NULL DEFAULT 0,
  landingpage_geeignet TINYINT(1) NOT NULL DEFAULT 0,
  verkaeufe_anzahl INT NULL,
  median_preis_eur_m2 DECIMAL(14,4) NULL,
  durchschnitt_preis_eur_m2 DECIMAL(14,4) NULL,
  efh_median_preis_eur DECIMAL(14,4) NULL,
  tage_am_markt DECIMAL(10,2) NULL,
  auswertung_vom VARCHAR(80) NULL,
  quelle_pdf VARCHAR(500) NULL,
  raw_json JSON NOT NULL,
  imported_at DATETIME NOT NULL,
  INDEX idx_imv_location (location_slug),
  INDEX idx_imv_location_label (location_label),
  INDEX idx_imv_object_type (object_type),
  INDEX idx_imv_landingpage (landingpage_geeignet),
  INDEX idx_imv_leadgen (leadgen_geeignet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS imv_website_locations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  location_slug VARCHAR(190) NOT NULL UNIQUE,
  location_label VARCHAR(190) NOT NULL,
  location_type VARCHAR(80) NULL,
  landkreis VARCHAR(190) NULL,
  stadt_gemeinde VARCHAR(190) NULL,
  ortsteil VARCHAR(190) NULL,
  plz VARCHAR(80) NULL,
  website_live TINYINT(1) NOT NULL DEFAULT 0,
  leadgen_live TINYINT(1) NOT NULL DEFAULT 0,
  landingpage_geeignet TINYINT(1) NOT NULL DEFAULT 0,
  sitemap_indexable TINYINT(1) NOT NULL DEFAULT 0,
  route_count INT NOT NULL DEFAULT 0,
  page_types_json JSON NULL,
  url_paths_json JSON NULL,
  source_files_json JSON NULL,
  record_count INT NOT NULL DEFAULT 0,
  raw_json JSON NOT NULL,
  imported_at DATETIME NOT NULL,
  INDEX idx_website_locations_live (website_live),
  INDEX idx_website_locations_leadgen (leadgen_live),
  INDEX idx_website_locations_landkreis (landkreis),
  INDEX idx_website_locations_city (stadt_gemeinde)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS website_snapshots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  version_key VARCHAR(80) NOT NULL UNIQUE,
  source_type VARCHAR(80) NOT NULL,
  market_record_count INT NOT NULL DEFAULT 0,
  website_location_count INT NOT NULL DEFAULT 0,
  house_price_count INT NOT NULL DEFAULT 0,
  apartment_price_count INT NOT NULL DEFAULT 0,
  checksum_sha256 VARCHAR(64) NOT NULL,
  manifest_json JSON NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('created', 'rejected') NOT NULL DEFAULT 'created',
  created_by BIGINT UNSIGNED NULL,
  activated_by BIGINT UNSIGNED NULL,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_website_snapshots_created (created_at),
  INDEX idx_website_snapshots_status (status),
  INDEX idx_website_snapshots_active (active, created_at),
  CONSTRAINT fk_website_snapshot_user FOREIGN KEY (created_by) REFERENCES inside_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS imv_clipping_sources (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  platform_key VARCHAR(120) NOT NULL UNIQUE,
  platform_name VARCHAR(190) NOT NULL,
  source_type ENUM('portal', 'newspaper', 'forum', 'social', 'official', 'other') NOT NULL DEFAULT 'other',
  base_url VARCHAR(500) NULL,
  status ENUM('planned', 'active', 'paused', 'blocked') NOT NULL DEFAULT 'planned',
  access_mode VARCHAR(120) NOT NULL DEFAULT 'manual_or_allowed_feed',
  clipping_policy TEXT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_clipping_source_status (status),
  INDEX idx_clipping_source_type (source_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS imv_clippings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(500) NOT NULL,
  url VARCHAR(700) NULL,
  published_at DATETIME NULL,
  location_slug VARCHAR(190) NULL,
  location_label VARCHAR(190) NULL,
  topic VARCHAR(190) NULL,
  excerpt TEXT NULL,
  summary TEXT NULL,
  raw_metadata_json JSON NULL,
  review_status ENUM('new', 'reviewed', 'used', 'ignored') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_clippings_source (source_id),
  INDEX idx_clippings_location (location_slug),
  INDEX idx_clippings_review (review_status),
  CONSTRAINT fk_clippings_source FOREIGN KEY (source_id) REFERENCES imv_clipping_sources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS schaufenster_tv_properties (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  propstack_id BIGINT UNSIGNED NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500) NULL,
  city VARCHAR(190) NULL,
  zip_code VARCHAR(40) NULL,
  address VARCHAR(500) NULL,
  marketing_type VARCHAR(80) NULL,
  property_type VARCHAR(190) NULL,
  price_amount DECIMAL(14,2) NULL,
  price_label VARCHAR(120) NULL,
  price_period VARCHAR(40) NULL,
  price_on_inquiry TINYINT(1) NOT NULL DEFAULT 0,
  living_space DECIMAL(12,2) NULL,
  usable_floor_space DECIMAL(12,2) NULL,
  plot_area DECIMAL(12,2) NULL,
  number_of_rooms DECIMAL(8,2) NULL,
  construction_year INT NULL,
  image_url VARCHAR(900) NULL,
  expose_url VARCHAR(900) NULL,
  custom_flag_value VARCHAR(190) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  raw_json JSON NOT NULL,
  synced_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_schaufenster_active (active, synced_at),
  INDEX idx_schaufenster_city (city),
  INDEX idx_schaufenster_marketing (marketing_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS schaufenster_tv_slides (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(900) NOT NULL,
  link_url VARCHAR(900) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  uploaded_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_schaufenster_slides_active (active, sort_order, created_at),
  CONSTRAINT fk_schaufenster_slide_user FOREIGN KEY (uploaded_by) REFERENCES inside_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS website_partners (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  partner_key VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(190) NOT NULL,
  text TEXT NOT NULL,
  image_url VARCHAR(900) NULL,
  website_url VARCHAR(900) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_website_partners_active (active, sort_order),
  CONSTRAINT fk_website_partner_user FOREIGN KEY (updated_by) REFERENCES inside_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
