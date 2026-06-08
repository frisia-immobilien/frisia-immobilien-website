<?php

declare(strict_types=1);

function imv_ensure_tables(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS imv_market_records (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS imv_website_locations (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS imv_clipping_sources (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          platform_key VARCHAR(120) NOT NULL UNIQUE,
          platform_name VARCHAR(190) NOT NULL,
          source_type ENUM("portal", "newspaper", "forum", "social", "official", "other") NOT NULL DEFAULT "other",
          base_url VARCHAR(500) NULL,
          status ENUM("planned", "active", "paused", "blocked") NOT NULL DEFAULT "planned",
          access_mode VARCHAR(120) NOT NULL DEFAULT "manual_or_allowed_feed",
          clipping_policy TEXT NULL,
          notes TEXT NULL,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          INDEX idx_clipping_source_status (status),
          INDEX idx_clipping_source_type (source_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS imv_clippings (
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
          review_status ENUM("new", "reviewed", "used", "ignored") NOT NULL DEFAULT "new",
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          INDEX idx_clippings_source (source_id),
          INDEX idx_clippings_location (location_slug),
          INDEX idx_clippings_review (review_status),
          CONSTRAINT fk_clippings_source FOREIGN KEY (source_id) REFERENCES imv_clipping_sources(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function imv_runtime_import_path(): string
{
    return dirname(__DIR__, 2) . '/private/import/leadgen_market_data.json';
}

function imv_website_locations_import_path(): string
{
    return dirname(__DIR__, 2) . '/private/import/website_locations.json';
}

function imv_default_clipping_sources(): array
{
    $policy = 'Nur rechtssicheres Clipping: keine Volltextkopien, keine Umgehung von Schutzmechanismen, keine Massenkopie. Speichern: URL, Titel, kurze eigene Zusammenfassung, kurze zulaessige Textauszuege, Quelle, Datum, Ort und Reviewstatus.';

    return [
        [
            'platform_key' => 'is24',
            'platform_name' => 'ImmobilienScout24',
            'source_type' => 'portal',
            'base_url' => 'https://www.immobilienscout24.de',
            'access_mode' => 'manual_or_allowed_feed',
            'clipping_policy' => $policy,
            'notes' => 'Portal-Signale nur ueber erlaubte Wege/API/Manuell erfassen. Keine automatisierte Umgehung von Plattformregeln.',
        ],
        [
            'platform_key' => 'kleinanzeigen',
            'platform_name' => 'Kleinanzeigen',
            'source_type' => 'portal',
            'base_url' => 'https://www.kleinanzeigen.de',
            'access_mode' => 'manual_or_allowed_feed',
            'clipping_policy' => $policy,
            'notes' => 'Angebots- und Nachfragebeobachtung nur regelkonform und mit Quellenlink.',
        ],
        [
            'platform_key' => 'immowelt',
            'platform_name' => 'Immowelt',
            'source_type' => 'portal',
            'base_url' => 'https://www.immowelt.de',
            'access_mode' => 'manual_or_allowed_feed',
            'clipping_policy' => $policy,
            'notes' => 'Portal-Signale fuer regionale Angebotslage, nicht als notarielle Marktdaten ausgeben.',
        ],
        [
            'platform_key' => 'on_oz',
            'platform_name' => 'ON / Ostfriesen-Zeitung',
            'source_type' => 'newspaper',
            'base_url' => 'https://www.oz-online.de',
            'access_mode' => 'manual_or_allowed_feed',
            'clipping_policy' => $policy,
            'notes' => 'Regionale Nachrichten als Kontextsignal fuer Infrastruktur, Bauprojekte und lokale Nachfragefaktoren.',
        ],
        [
            'platform_key' => 'emder_zeitung',
            'platform_name' => 'Emder Zeitung',
            'source_type' => 'newspaper',
            'base_url' => 'https://www.emderzeitung.de',
            'access_mode' => 'manual_or_allowed_feed',
            'clipping_policy' => $policy,
            'notes' => 'Regionale Nachrichten als Kontextsignal, keine Volltextuebernahme.',
        ],
        [
            'platform_key' => 'regionale_foren',
            'platform_name' => 'Regionale Foren und lokale Gruppen',
            'source_type' => 'forum',
            'base_url' => null,
            'access_mode' => 'manual_review',
            'clipping_policy' => $policy,
            'notes' => 'Nur oeffentliche, zitierfaehige Hinweise mit Quellenkontext. Keine privaten Gruppeninhalte uebernehmen.',
        ],
    ];
}

function imv_string(?array $record, string $key): ?string
{
    $value = $record[$key] ?? null;
    if ($value === null) {
        return null;
    }
    $text = trim((string) $value);
    return $text === '' ? null : $text;
}

function imv_number(?array $record, string $key): ?float
{
    $value = $record[$key] ?? null;
    if ($value === null || $value === '') {
        return null;
    }
    return is_numeric($value) ? (float) $value : null;
}

function imv_bool(?array $record, string $key): int
{
    return !empty($record[$key]) ? 1 : 0;
}

function imv_location_slug(array $record): ?string
{
    return imv_string($record, 'ortsteil_slug')
        ?? imv_string($record, 'stadt_gemeinde_slug')
        ?? imv_string($record, 'landkreis_slug')
        ?? imv_string($record, 'region_slug')
        ?? imv_string($record, 'location_slug');
}

function imv_object_type(array $record): string
{
    $object = strtolower((string) ($record['objektart'] ?? ''));
    if (str_contains($object, 'wohnung')) {
        return 'wohnung';
    }
    if (str_contains($object, 'haus')) {
        return 'haus';
    }
    return $object !== '' ? $object : 'unbekannt';
}

function imv_record_key(array $record): string
{
    $parts = [
        imv_string($record, 'region_code'),
        imv_location_slug($record),
        imv_string($record, 'datensatz_typ'),
        imv_string($record, 'objektart'),
        imv_string($record, 'quelle_pdf'),
        imv_string($record, 'auswertung_vom'),
    ];

    return substr(hash('sha256', implode('|', array_map(fn ($part): string => (string) $part, $parts))), 0, 48);
}
