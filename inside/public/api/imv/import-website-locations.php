<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();
imv_ensure_tables($pdo);

$path = imv_website_locations_import_path();
if (!is_file($path)) {
    json_response(['ok' => false, 'error' => 'Website-Orte wurden auf dem Server nicht gefunden.'], 404);
}

$payload = json_decode((string) file_get_contents($path), true);
$locations = is_array($payload['locations'] ?? null) ? $payload['locations'] : [];

$stmt = $pdo->prepare(
    'INSERT INTO imv_website_locations
       (
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
         raw_json,
         imported_at
       )
     VALUES
       (
         :location_slug,
         :location_label,
         :location_type,
         :landkreis,
         :stadt_gemeinde,
         :ortsteil,
         :plz,
         :website_live,
         :leadgen_live,
         :landingpage_geeignet,
         :sitemap_indexable,
         :route_count,
         :page_types_json,
         :url_paths_json,
         :source_files_json,
         :record_count,
         :raw_json,
         NOW()
       )
     ON DUPLICATE KEY UPDATE
       location_label = VALUES(location_label),
       location_type = VALUES(location_type),
       landkreis = VALUES(landkreis),
       stadt_gemeinde = VALUES(stadt_gemeinde),
       ortsteil = VALUES(ortsteil),
       plz = VALUES(plz),
       website_live = VALUES(website_live),
       leadgen_live = VALUES(leadgen_live),
       landingpage_geeignet = VALUES(landingpage_geeignet),
       sitemap_indexable = VALUES(sitemap_indexable),
       route_count = VALUES(route_count),
       page_types_json = VALUES(page_types_json),
       url_paths_json = VALUES(url_paths_json),
       source_files_json = VALUES(source_files_json),
       record_count = VALUES(record_count),
       raw_json = VALUES(raw_json),
       imported_at = NOW()'
);

$imported = 0;
$pdo->beginTransaction();
try {
    foreach ($locations as $location) {
        if (!is_array($location)) {
            continue;
        }

        $slug = imv_string($location, 'location_slug');
        $label = imv_string($location, 'location_label');
        if (!$slug || !$label) {
            continue;
        }

        $stmt->execute([
            ':location_slug' => $slug,
            ':location_label' => $label,
            ':location_type' => imv_string($location, 'location_type'),
            ':landkreis' => imv_string($location, 'landkreis'),
            ':stadt_gemeinde' => imv_string($location, 'stadt_gemeinde'),
            ':ortsteil' => imv_string($location, 'ortsteil'),
            ':plz' => imv_string($location, 'plz'),
            ':website_live' => imv_bool($location, 'website_live'),
            ':leadgen_live' => imv_bool($location, 'leadgen_live'),
            ':landingpage_geeignet' => imv_bool($location, 'landingpage_geeignet'),
            ':sitemap_indexable' => imv_bool($location, 'sitemap_indexable'),
            ':route_count' => (int) imv_number($location, 'route_count'),
            ':page_types_json' => json_encode($location['page_types'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':url_paths_json' => json_encode($location['url_paths'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':source_files_json' => json_encode($location['source_files'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':record_count' => (int) imv_number($location, 'record_count'),
            ':raw_json' => json_encode($location, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
        $imported++;
    }
    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}

audit_log('imv.import_website_locations', [
    'imported_locations' => $imported,
    'source_file' => $payload['sourceFile'] ?? null,
    'generated_at' => $payload['generatedAt'] ?? null,
], (int) $user['id']);

json_response([
    'ok' => true,
    'data' => [
        'imported_locations' => $imported,
        'source_file' => $payload['sourceFile'] ?? null,
        'generated_at' => $payload['generatedAt'] ?? null,
    ],
]);
