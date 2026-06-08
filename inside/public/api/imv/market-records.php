<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';

require_auth();
$pdo = require_db();
imv_ensure_tables($pdo);

$limit = (int) ($_GET['limit'] ?? 500);
$limit = max(1, min(5000, $limit));

$stmt = $pdo->prepare(
    'SELECT
        m.id,
        m.source_record_key,
        m.region_code,
        m.location_slug,
        m.location_label,
        m.location_type,
        m.landkreis,
        m.stadt_gemeinde,
        m.ortsteil,
        m.object_type,
        m.plz,
        m.leadgen_geeignet,
        m.landingpage_geeignet,
        COALESCE(w.website_live, m.landingpage_geeignet) AS website_live,
        COALESCE(w.leadgen_live, m.leadgen_geeignet) AS leadgen_live,
        COALESCE(w.sitemap_indexable, 0) AS sitemap_indexable,
        COALESCE(w.route_count, 0) AS route_count,
        w.url_paths_json,
        m.verkaeufe_anzahl,
        m.median_preis_eur_m2,
        m.durchschnitt_preis_eur_m2,
        m.efh_median_preis_eur,
        m.tage_am_markt,
        m.auswertung_vom,
        m.quelle_pdf,
        m.raw_json,
        m.imported_at
     FROM imv_market_records m
     LEFT JOIN imv_website_locations w
       ON w.location_slug = m.location_slug
     ORDER BY m.location_label ASC, m.object_type ASC, m.id ASC
     LIMIT :limit_value'
);
$stmt->bindValue(':limit_value', $limit, PDO::PARAM_INT);
$stmt->execute();

$items = [];
foreach ($stmt->fetchAll() as $row) {
    $raw = json_decode((string) ($row['raw_json'] ?? '{}'), true);
    $row['raw'] = is_array($raw) ? $raw : null;
    unset($row['raw_json']);
    $row['leadgen_geeignet'] = (bool) $row['leadgen_geeignet'];
    $row['landingpage_geeignet'] = (bool) $row['landingpage_geeignet'];
    $row['website_live'] = (bool) $row['website_live'];
    $row['leadgen_live'] = (bool) $row['leadgen_live'];
    $row['sitemap_indexable'] = (bool) $row['sitemap_indexable'];
    $row['route_count'] = (int) $row['route_count'];
    $row['url_paths'] = json_decode((string) ($row['url_paths_json'] ?? '[]'), true) ?: [];
    unset($row['url_paths_json']);
    $items[] = $row;
}

json_response(['ok' => true, 'data' => $items]);
