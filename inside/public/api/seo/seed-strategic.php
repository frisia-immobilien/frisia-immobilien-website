<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();

$locations = [
    ['slug' => 'aurich', 'name' => 'Aurich', 'cluster' => true],
    ['slug' => 'norden', 'name' => 'Norden', 'cluster' => true],
    ['slug' => 'norddeich', 'name' => 'Norddeich', 'cluster' => true],
    ['slug' => 'emden', 'name' => 'Emden', 'cluster' => true],
    ['slug' => 'leer', 'name' => 'Leer', 'cluster' => true],
    ['slug' => 'wiesmoor', 'name' => 'Wiesmoor', 'cluster' => true],
    ['slug' => 'moordorf', 'name' => 'Moordorf', 'cluster' => true],
    ['slug' => 'grossefehn', 'name' => 'Großefehn', 'cluster' => true],
    ['slug' => 'suedbrookmerland', 'name' => 'Südbrookmerland', 'cluster' => true],
    ['slug' => 'ihlow', 'name' => 'Ihlow', 'cluster' => true],
    ['slug' => 'greetsiel', 'name' => 'Greetsiel', 'cluster' => true],
    ['slug' => 'norderney', 'name' => 'Norderney', 'cluster' => true],
    ['slug' => 'juist', 'name' => 'Juist', 'cluster' => true],
    ['slug' => 'dornum', 'name' => 'Dornum', 'cluster' => true],
    ['slug' => 'hage', 'name' => 'Hage', 'cluster' => true],
];

$pageTypes = [
    ['type' => 'immobilienmakler', 'prefix' => 'immobilienmakler', 'priority' => 'high'],
    ['type' => 'immobilienbewertung', 'prefix' => 'immobilienbewertung', 'priority' => 'high'],
    ['type' => 'haus-verkaufen', 'prefix' => 'haus-verkaufen', 'priority' => 'high'],
    ['type' => 'immobilienpreise', 'prefix' => 'immobilienpreise', 'priority' => 'medium'],
    ['type' => 'immobilien', 'prefix' => 'immobilien', 'priority' => 'medium'],
    ['type' => 'haus-kaufen', 'prefix' => 'haus-kaufen', 'priority' => 'strict'],
];

$selectLocation = $pdo->prepare(
    'SELECT id
     FROM seo_locations
     WHERE location_slug = :location_slug
       AND page_type = :page_type
     LIMIT 1'
);
$insertLocation = $pdo->prepare(
    'INSERT INTO seo_locations
       (location_slug, location_name, page_type, url_path, strategic_location, cluster_relevant, created_at, updated_at)
     VALUES
       (:location_slug, :location_name, :page_type, :url_path, 1, :cluster_relevant, NOW(), NOW())'
);
$updateLocation = $pdo->prepare(
    'UPDATE seo_locations
     SET location_name = :location_name,
         url_path = :url_path,
         strategic_location = 1,
         cluster_relevant = :cluster_relevant,
         updated_at = NOW()
     WHERE id = :id'
);
$selectQuality = $pdo->prepare(
    'SELECT id
     FROM seo_location_quality
     WHERE seo_location_id = :seo_location_id
     LIMIT 1'
);
$insertQuality = $pdo->prepare(
    'INSERT INTO seo_location_quality
       (
         seo_location_id,
         quality_score,
         source_confidence,
         local_uniqueness_score,
         entity_depth_score,
         duplicate_risk,
         data_freshness,
         has_external_validation,
         indexing_state,
         performance_state,
         indexing_reason,
         review_status,
         updated_at
       )
     VALUES
       (
         :seo_location_id,
         :quality_score,
         20.00,
         :local_uniqueness_score,
         :entity_depth_score,
         40.00,
         "unknown",
         0,
         "pending_review",
         "observing",
         :indexing_reason,
         "pending",
         NOW()
       )'
);
$selectSource = $pdo->prepare(
    'SELECT id
     FROM seo_location_sources
     WHERE seo_location_id = :seo_location_id
       AND source_name = "Frisia strategische Ortsliste"
     LIMIT 1'
);
$insertSource = $pdo->prepare(
    'INSERT INTO seo_location_sources
       (
         seo_location_id,
         source_name,
         source_url,
         source_type,
         usage_scope,
         source_confidence,
         notes,
         created_at
       )
     VALUES
       (
         :seo_location_id,
         "Frisia strategische Ortsliste",
         NULL,
         "manual_review",
         "context_only",
         20.00,
         :notes,
         NOW()
       )'
);
$insertHistory = $pdo->prepare(
    'INSERT INTO seo_quality_history
       (seo_location_id, quality_snapshot_json, reason, changed_by, created_at)
     VALUES
       (:seo_location_id, :quality_snapshot_json, :reason, :changed_by, NOW())'
);

$createdLocations = 0;
$updatedLocations = 0;
$createdQuality = 0;
$createdSources = 0;
$createdHistory = 0;

$pdo->beginTransaction();
try {
    foreach ($locations as $location) {
        foreach ($pageTypes as $pageType) {
            $urlPath = '/' . $pageType['prefix'] . '-' . $location['slug'];
            $selectLocation->execute([
                ':location_slug' => $location['slug'],
                ':page_type' => $pageType['type'],
            ]);
            $existingId = $selectLocation->fetchColumn();

            if ($existingId) {
                $locationId = (int) $existingId;
                $updateLocation->execute([
                    ':id' => $locationId,
                    ':location_name' => $location['name'],
                    ':url_path' => $urlPath,
                    ':cluster_relevant' => $location['cluster'] ? 1 : 0,
                ]);
                $updatedLocations++;
            } else {
                $insertLocation->execute([
                    ':location_slug' => $location['slug'],
                    ':location_name' => $location['name'],
                    ':page_type' => $pageType['type'],
                    ':url_path' => $urlPath,
                    ':cluster_relevant' => $location['cluster'] ? 1 : 0,
                ]);
                $locationId = (int) $pdo->lastInsertId();
                $createdLocations++;
            }

            $selectQuality->execute([':seo_location_id' => $locationId]);
            if (!$selectQuality->fetchColumn()) {
                $qualityScore = $pageType['priority'] === 'high' ? 35.00 : ($pageType['priority'] === 'medium' ? 28.00 : 22.00);
                $localUniqueness = $pageType['priority'] === 'high' ? 30.00 : 24.00;
                $entityDepth = $pageType['priority'] === 'high' ? 28.00 : 22.00;
                $reason = 'Strategischer interner Seed fuer Frisia Inside. Keine Indexierungsfreigabe: externe Quellen, lokale Entitaeten, Datenpunkte und menschlicher Review fehlen noch.';

                $insertQuality->execute([
                    ':seo_location_id' => $locationId,
                    ':quality_score' => $qualityScore,
                    ':local_uniqueness_score' => $localUniqueness,
                    ':entity_depth_score' => $entityDepth,
                    ':indexing_reason' => $reason,
                ]);
                $createdQuality++;

                $insertHistory->execute([
                    ':seo_location_id' => $locationId,
                    ':quality_snapshot_json' => json_encode([
                        'quality_score' => $qualityScore,
                        'source_confidence' => 20.00,
                        'local_uniqueness_score' => $localUniqueness,
                        'entity_depth_score' => $entityDepth,
                        'duplicate_risk' => 40.00,
                        'indexing_state' => 'pending_review',
                        'review_status' => 'pending',
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ':reason' => 'Strategic seed created',
                    ':changed_by' => (string) ($user['email'] ?? 'inside'),
                ]);
                $createdHistory++;
            }

            $selectSource->execute([':seo_location_id' => $locationId]);
            if (!$selectSource->fetchColumn()) {
                $insertSource->execute([
                    ':seo_location_id' => $locationId,
                    ':notes' => 'Interne Priorisierung. Diese Quelle ist keine externe Marktvalidierung und darf nicht allein fuer Indexierungsfreigaben genutzt werden.',
                ]);
                $createdSources++;
            }
        }
    }

    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}

audit_log('seo.seed_strategic', [
    'created_locations' => $createdLocations,
    'updated_locations' => $updatedLocations,
    'created_quality_rows' => $createdQuality,
    'created_sources' => $createdSources,
    'created_history_rows' => $createdHistory,
], (int) $user['id']);

json_response([
    'ok' => true,
    'data' => [
        'created_locations' => $createdLocations,
        'updated_locations' => $updatedLocations,
        'created_quality_rows' => $createdQuality,
        'created_sources' => $createdSources,
        'created_history_rows' => $createdHistory,
        'locations' => count($locations),
        'page_types' => count($pageTypes),
    ],
]);
