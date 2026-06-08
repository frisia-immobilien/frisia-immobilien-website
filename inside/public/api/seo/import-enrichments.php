<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();

$path = dirname(__DIR__, 2) . '/private/import/seo_location_enrichments.json';
if (!is_file($path)) {
    json_response(['ok' => false, 'error' => 'seo_location_enrichments.json fehlt.'], 404);
}

$payload = json_decode((string) file_get_contents($path), true);
if (!is_array($payload) || !isset($payload['enrichments']) || !is_array($payload['enrichments'])) {
    json_response(['ok' => false, 'error' => 'seo_location_enrichments.json ist ungueltig.'], 422);
}

function seo_enrich_text(?array $record, string $key, ?string $fallback = null): ?string
{
    $value = $record[$key] ?? $fallback;
    if ($value === null) {
        return null;
    }
    $text = trim((string) $value);
    return $text === '' ? null : $text;
}

function seo_enrich_number(?array $record, string $key, ?float $fallback = null): ?float
{
    $value = $record[$key] ?? $fallback;
    if ($value === null || $value === '') {
        return null;
    }
    return is_numeric($value) ? (float) $value : null;
}

function seo_enrich_date(?string $value): ?string
{
    if (!$value) {
        return null;
    }
    try {
        return (new DateTimeImmutable($value))->format('Y-m-d');
    } catch (Throwable) {
        return null;
    }
}

function seo_enrich_datetime(?string $value): ?string
{
    if (!$value) {
        return null;
    }
    try {
        return (new DateTimeImmutable($value))->format('Y-m-d H:i:s');
    } catch (Throwable) {
        return null;
    }
}

function seo_enrich_bind_nullable_number(PDOStatement $stmt, string $name, ?float $value): void
{
    if ($value === null) {
        $stmt->bindValue($name, null, PDO::PARAM_NULL);
        return;
    }
    $stmt->bindValue($name, $value);
}

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
       (:location_slug, :location_name, :page_type, :url_path, :strategic_location, :cluster_relevant, NOW(), NOW())'
);
$updateLocation = $pdo->prepare(
    'UPDATE seo_locations
     SET location_name = :location_name,
         url_path = :url_path,
         strategic_location = :strategic_location,
         cluster_relevant = :cluster_relevant,
         updated_at = NOW()
     WHERE id = :id'
);

$selectSource = $pdo->prepare(
    'SELECT id
     FROM seo_location_sources
     WHERE seo_location_id = :seo_location_id
       AND source_name = :source_name
     LIMIT 1'
);
$insertSource = $pdo->prepare(
    'INSERT INTO seo_location_sources
       (seo_location_id, source_name, source_url, source_type, usage_scope, source_confidence, source_timestamp, valid_from, valid_to, notes, created_at)
     VALUES
       (:seo_location_id, :source_name, :source_url, :source_type, :usage_scope, :source_confidence, :source_timestamp, :valid_from, :valid_to, :notes, NOW())'
);
$updateSource = $pdo->prepare(
    'UPDATE seo_location_sources
     SET source_url = :source_url,
         source_type = :source_type,
         usage_scope = :usage_scope,
         source_confidence = :source_confidence,
         source_timestamp = :source_timestamp,
         valid_from = :valid_from,
         valid_to = :valid_to,
         notes = :notes
     WHERE id = :id'
);

$selectDatapoint = $pdo->prepare(
    'SELECT id
     FROM seo_location_datapoints
     WHERE seo_location_id = :seo_location_id
       AND source_id <=> :source_id
       AND metric_key = :metric_key
     LIMIT 1'
);
$insertDatapoint = $pdo->prepare(
    'INSERT INTO seo_location_datapoints
       (seo_location_id, source_id, metric_key, metric_label, value_text, value_number, unit, usage_scope, valid_from, valid_to, source_timestamp, created_at)
     VALUES
       (:seo_location_id, :source_id, :metric_key, :metric_label, :value_text, :value_number, :unit, :usage_scope, :valid_from, :valid_to, :source_timestamp, NOW())'
);
$updateDatapoint = $pdo->prepare(
    'UPDATE seo_location_datapoints
     SET metric_label = :metric_label,
         value_text = :value_text,
         value_number = :value_number,
         unit = :unit,
         usage_scope = :usage_scope,
         valid_from = :valid_from,
         valid_to = :valid_to,
         source_timestamp = :source_timestamp
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
         last_verified_at,
         updated_at
       )
     VALUES
       (
         :seo_location_id,
         :quality_score,
         :source_confidence,
         :local_uniqueness_score,
         :entity_depth_score,
         :duplicate_risk,
         :data_freshness,
         :has_external_validation,
         :indexing_state,
         :performance_state,
         :indexing_reason,
         :review_status,
         :last_verified_at,
         NOW()
       )'
);
$updateQuality = $pdo->prepare(
    'UPDATE seo_location_quality
     SET quality_score = :quality_score,
         source_confidence = :source_confidence,
         local_uniqueness_score = :local_uniqueness_score,
         entity_depth_score = :entity_depth_score,
         duplicate_risk = :duplicate_risk,
         data_freshness = :data_freshness,
         has_external_validation = :has_external_validation,
         indexing_state = :indexing_state,
         performance_state = :performance_state,
         indexing_reason = :indexing_reason,
         review_status = :review_status,
         last_verified_at = :last_verified_at,
         updated_at = NOW()
     WHERE id = :id'
);

$insertHistory = $pdo->prepare(
    'INSERT INTO seo_quality_history
       (seo_location_id, quality_snapshot_json, reason, changed_by, created_at)
     VALUES
       (:seo_location_id, :quality_snapshot_json, :reason, :changed_by, NOW())'
);

$createdLocations = 0;
$updatedLocations = 0;
$createdSources = 0;
$updatedSources = 0;
$createdDatapoints = 0;
$updatedDatapoints = 0;
$createdQualityRows = 0;
$updatedQualityRows = 0;
$createdHistoryRows = 0;
$importedLocations = 0;
$importedCandidatePages = 0;

$pdo->beginTransaction();
try {
    foreach ($payload['enrichments'] as $enrichment) {
        if (!is_array($enrichment)) {
            continue;
        }
        $locationSlug = seo_enrich_text($enrichment, 'location_slug');
        $locationName = seo_enrich_text($enrichment, 'location_name');
        $candidatePages = $enrichment['candidate_pages'] ?? [];
        if (!$locationSlug || !$locationName || !is_array($candidatePages)) {
            continue;
        }

        $quality = is_array($enrichment['quality'] ?? null) ? $enrichment['quality'] : [];
        $sources = is_array($enrichment['sources'] ?? null) ? $enrichment['sources'] : [];
        $datapoints = is_array($enrichment['datapoints'] ?? null) ? $enrichment['datapoints'] : [];
        $importedLocations++;

        foreach ($candidatePages as $candidatePage) {
            if (!is_array($candidatePage)) {
                continue;
            }
            $pageType = seo_enrich_text($candidatePage, 'page_type');
            $urlPath = seo_enrich_text($candidatePage, 'url_path');
            if (!$pageType || !$urlPath) {
                continue;
            }

            $selectLocation->execute([
                ':location_slug' => $locationSlug,
                ':page_type' => $pageType,
            ]);
            $existingLocationId = $selectLocation->fetchColumn();
            $locationParams = [
                ':location_name' => $locationName,
                ':url_path' => $urlPath,
                ':strategic_location' => !empty($candidatePage['strategic_location']) ? 1 : 0,
                ':cluster_relevant' => !empty($candidatePage['cluster_relevant']) ? 1 : 0,
            ];

            if ($existingLocationId) {
                $locationId = (int) $existingLocationId;
                $updateLocation->execute($locationParams + [':id' => $locationId]);
                $updatedLocations++;
            } else {
                $insertLocation->execute($locationParams + [
                    ':location_slug' => $locationSlug,
                    ':page_type' => $pageType,
                ]);
                $locationId = (int) $pdo->lastInsertId();
                $createdLocations++;
            }
            $importedCandidatePages++;

            $sourceIdsByKey = [];
            foreach ($sources as $source) {
                if (!is_array($source)) {
                    continue;
                }
                $sourceKey = seo_enrich_text($source, 'source_key') ?? seo_enrich_text($source, 'source_name');
                $sourceName = seo_enrich_text($source, 'source_name');
                if (!$sourceKey || !$sourceName) {
                    continue;
                }

                $sourceParams = [
                    ':source_url' => seo_enrich_text($source, 'source_url'),
                    ':source_type' => seo_enrich_text($source, 'source_type', 'other'),
                    ':usage_scope' => seo_enrich_text($source, 'usage_scope', 'seo'),
                    ':source_confidence' => seo_enrich_number($source, 'source_confidence', 0.0),
                    ':source_timestamp' => seo_enrich_datetime(seo_enrich_text($source, 'source_timestamp')),
                    ':valid_from' => seo_enrich_date(seo_enrich_text($source, 'valid_from')),
                    ':valid_to' => seo_enrich_date(seo_enrich_text($source, 'valid_to')),
                    ':notes' => seo_enrich_text($source, 'notes'),
                ];

                $selectSource->execute([
                    ':seo_location_id' => $locationId,
                    ':source_name' => $sourceName,
                ]);
                $existingSourceId = $selectSource->fetchColumn();
                if ($existingSourceId) {
                    $sourceId = (int) $existingSourceId;
                    $updateSource->execute($sourceParams + [':id' => $sourceId]);
                    $updatedSources++;
                } else {
                    $insertSource->execute($sourceParams + [
                        ':seo_location_id' => $locationId,
                        ':source_name' => $sourceName,
                    ]);
                    $sourceId = (int) $pdo->lastInsertId();
                    $createdSources++;
                }
                $sourceIdsByKey[$sourceKey] = $sourceId;
            }

            foreach ($datapoints as $datapoint) {
                if (!is_array($datapoint)) {
                    continue;
                }
                $metricKey = seo_enrich_text($datapoint, 'metric_key');
                $metricLabel = seo_enrich_text($datapoint, 'metric_label');
                if (!$metricKey || !$metricLabel) {
                    continue;
                }
                $sourceKey = seo_enrich_text($datapoint, 'source_key');
                $sourceId = $sourceKey && isset($sourceIdsByKey[$sourceKey]) ? $sourceIdsByKey[$sourceKey] : null;

                $selectDatapoint->execute([
                    ':seo_location_id' => $locationId,
                    ':source_id' => $sourceId,
                    ':metric_key' => $metricKey,
                ]);
                $existingDatapointId = $selectDatapoint->fetchColumn();

                $datapointParams = [
                    ':metric_label' => $metricLabel,
                    ':value_text' => seo_enrich_text($datapoint, 'value_text'),
                    ':unit' => seo_enrich_text($datapoint, 'unit'),
                    ':usage_scope' => seo_enrich_text($datapoint, 'usage_scope', 'seo'),
                    ':valid_from' => seo_enrich_date(seo_enrich_text($datapoint, 'valid_from')),
                    ':valid_to' => seo_enrich_date(seo_enrich_text($datapoint, 'valid_to')),
                    ':source_timestamp' => seo_enrich_datetime(seo_enrich_text($datapoint, 'source_timestamp')),
                ];

                if ($existingDatapointId) {
                    $updateDatapoint->bindValue(':id', (int) $existingDatapointId, PDO::PARAM_INT);
                    $updateDatapoint->bindValue(':metric_label', $datapointParams[':metric_label']);
                    $updateDatapoint->bindValue(':value_text', $datapointParams[':value_text']);
                    seo_enrich_bind_nullable_number($updateDatapoint, ':value_number', seo_enrich_number($datapoint, 'value_number'));
                    $updateDatapoint->bindValue(':unit', $datapointParams[':unit']);
                    $updateDatapoint->bindValue(':usage_scope', $datapointParams[':usage_scope']);
                    $updateDatapoint->bindValue(':valid_from', $datapointParams[':valid_from']);
                    $updateDatapoint->bindValue(':valid_to', $datapointParams[':valid_to']);
                    $updateDatapoint->bindValue(':source_timestamp', $datapointParams[':source_timestamp']);
                    $updateDatapoint->execute();
                    $updatedDatapoints++;
                } else {
                    $insertDatapoint->bindValue(':seo_location_id', $locationId, PDO::PARAM_INT);
                    if ($sourceId === null) {
                        $insertDatapoint->bindValue(':source_id', null, PDO::PARAM_NULL);
                    } else {
                        $insertDatapoint->bindValue(':source_id', $sourceId, PDO::PARAM_INT);
                    }
                    $insertDatapoint->bindValue(':metric_key', $metricKey);
                    $insertDatapoint->bindValue(':metric_label', $datapointParams[':metric_label']);
                    $insertDatapoint->bindValue(':value_text', $datapointParams[':value_text']);
                    seo_enrich_bind_nullable_number($insertDatapoint, ':value_number', seo_enrich_number($datapoint, 'value_number'));
                    $insertDatapoint->bindValue(':unit', $datapointParams[':unit']);
                    $insertDatapoint->bindValue(':usage_scope', $datapointParams[':usage_scope']);
                    $insertDatapoint->bindValue(':valid_from', $datapointParams[':valid_from']);
                    $insertDatapoint->bindValue(':valid_to', $datapointParams[':valid_to']);
                    $insertDatapoint->bindValue(':source_timestamp', $datapointParams[':source_timestamp']);
                    $insertDatapoint->execute();
                    $createdDatapoints++;
                }
            }

            $qualityParams = [
                ':quality_score' => seo_enrich_number($quality, 'quality_score', 0.0),
                ':source_confidence' => seo_enrich_number($quality, 'source_confidence', 0.0),
                ':local_uniqueness_score' => seo_enrich_number($quality, 'local_uniqueness_score', 0.0),
                ':entity_depth_score' => seo_enrich_number($quality, 'entity_depth_score', 0.0),
                ':duplicate_risk' => seo_enrich_number($quality, 'duplicate_risk', 100.0),
                ':data_freshness' => seo_enrich_text($quality, 'data_freshness', 'unknown'),
                ':has_external_validation' => !empty($quality['has_external_validation']) ? 1 : 0,
                ':indexing_state' => seo_enrich_text($quality, 'indexing_state', 'pending_review'),
                ':performance_state' => seo_enrich_text($quality, 'performance_state', 'observing'),
                ':indexing_reason' => seo_enrich_text($quality, 'indexing_reason'),
                ':review_status' => seo_enrich_text($quality, 'review_status', 'pending'),
                ':last_verified_at' => date('Y-m-d H:i:s'),
            ];

            $selectQuality->execute([':seo_location_id' => $locationId]);
            $existingQualityId = $selectQuality->fetchColumn();
            if ($existingQualityId) {
                $updateQuality->execute($qualityParams + [':id' => (int) $existingQualityId]);
                $updatedQualityRows++;
            } else {
                $insertQuality->execute($qualityParams + [':seo_location_id' => $locationId]);
                $createdQualityRows++;
            }

            $insertHistory->execute([
                ':seo_location_id' => $locationId,
                ':quality_snapshot_json' => json_encode($quality + [
                    'location_slug' => $locationSlug,
                    'location_name' => $locationName,
                    'page_type' => $pageType,
                    'url_path' => $urlPath,
                    'source_count' => count($sources),
                    'datapoint_count' => count($datapoints),
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ':reason' => 'Noindex enrichment imported',
                ':changed_by' => (string) ($user['email'] ?? 'inside'),
            ]);
            $createdHistoryRows++;
        }
    }

    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}

audit_log('seo.import_enrichments', [
    'imported_locations' => $importedLocations,
    'candidate_pages' => $importedCandidatePages,
    'created_locations' => $createdLocations,
    'updated_locations' => $updatedLocations,
    'created_sources' => $createdSources,
    'updated_sources' => $updatedSources,
    'created_datapoints' => $createdDatapoints,
    'updated_datapoints' => $updatedDatapoints,
    'created_quality_rows' => $createdQualityRows,
    'updated_quality_rows' => $updatedQualityRows,
], (int) $user['id']);

json_response([
    'ok' => true,
    'data' => [
        'imported_locations' => $importedLocations,
        'candidate_pages' => $importedCandidatePages,
        'created_locations' => $createdLocations,
        'updated_locations' => $updatedLocations,
        'created_sources' => $createdSources,
        'updated_sources' => $updatedSources,
        'created_datapoints' => $createdDatapoints,
        'updated_datapoints' => $updatedDatapoints,
        'created_quality_rows' => $createdQualityRows,
        'updated_quality_rows' => $updatedQualityRows,
        'created_history_rows' => $createdHistoryRows,
    ],
]);
