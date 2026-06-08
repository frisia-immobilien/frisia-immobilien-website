<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';

require_auth();
$pdo = require_db();
imv_ensure_tables($pdo);

$limit = (int) ($_GET['limit'] ?? 5000);
$limit = max(1, min(10000, $limit));

$stmt = $pdo->prepare(
    'SELECT
        id,
        location_slug,
        location_label,
        location_type,
        landkreis,
        stadt_gemeinde,
        ortsteil,
        plz,
        website_live,
        leadgen_live,
        landingpage_geeignet,
        sitemap_indexable,
        route_count,
        page_types_json,
        url_paths_json,
        source_files_json,
        record_count,
        imported_at
     FROM imv_website_locations
     ORDER BY landkreis ASC, stadt_gemeinde ASC, location_type ASC, location_label ASC
     LIMIT :limit_value'
);
$stmt->bindValue(':limit_value', $limit, PDO::PARAM_INT);
$stmt->execute();

$items = [];
foreach ($stmt->fetchAll() as $row) {
    $row['website_live'] = (bool) $row['website_live'];
    $row['leadgen_live'] = (bool) $row['leadgen_live'];
    $row['landingpage_geeignet'] = (bool) $row['landingpage_geeignet'];
    $row['sitemap_indexable'] = (bool) $row['sitemap_indexable'];
    $row['route_count'] = (int) $row['route_count'];
    $row['record_count'] = (int) $row['record_count'];
    $row['page_types'] = json_decode((string) ($row['page_types_json'] ?? '[]'), true) ?: [];
    $row['url_paths'] = json_decode((string) ($row['url_paths_json'] ?? '[]'), true) ?: [];
    $row['source_files'] = json_decode((string) ($row['source_files_json'] ?? '[]'), true) ?: [];
    unset($row['page_types_json'], $row['url_paths_json'], $row['source_files_json']);
    $items[] = $row;
}

json_response(['ok' => true, 'data' => $items]);
