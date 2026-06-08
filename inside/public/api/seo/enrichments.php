<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_auth();
$pdo = require_db();

$limit = (int) ($_GET['limit'] ?? 25);
$limit = max(1, min(100, $limit));

try {
    $locationStmt = $pdo->prepare(
        'SELECT
            l.id,
            l.location_slug,
            l.location_name,
            l.page_type,
            l.url_path,
            l.strategic_location,
            l.cluster_relevant,
            q.quality_score,
            q.source_confidence,
            q.local_uniqueness_score,
            q.entity_depth_score,
            q.duplicate_risk,
            q.data_freshness,
            q.has_external_validation,
            q.indexing_state,
            q.performance_state,
            q.indexing_reason,
            q.review_status,
            q.last_verified_at,
            (
                SELECT COUNT(*)
                FROM seo_location_sources s
                WHERE s.seo_location_id = l.id
            ) AS source_count,
            (
                SELECT COUNT(*)
                FROM seo_location_datapoints d
                WHERE d.seo_location_id = l.id
            ) AS datapoint_count
         FROM seo_locations l
         LEFT JOIN seo_location_quality q
           ON q.seo_location_id = l.id
         WHERE EXISTS (
            SELECT 1
            FROM seo_location_datapoints d
            WHERE d.seo_location_id = l.id
         )
         ORDER BY l.location_name ASC, l.page_type ASC
         LIMIT :limit_value'
    );
    $locationStmt->bindValue(':limit_value', $limit * 8, PDO::PARAM_INT);
    $locationStmt->execute();
    $locationRows = $locationStmt->fetchAll();

    $locationIds = array_map(fn (array $row): int => (int) $row['id'], $locationRows);
    if (!$locationIds) {
        json_response(['ok' => true, 'data' => []]);
    }

    $placeholders = implode(',', array_fill(0, count($locationIds), '?'));

    $sourceStmt = $pdo->prepare(
        'SELECT
            id,
            seo_location_id,
            source_name,
            source_url,
            source_type,
            usage_scope,
            source_confidence,
            source_timestamp,
            valid_from,
            valid_to,
            notes
         FROM seo_location_sources
         WHERE seo_location_id IN (' . $placeholders . ')
         ORDER BY source_confidence DESC, source_name ASC'
    );
    $sourceStmt->execute($locationIds);
    $sourceRows = $sourceStmt->fetchAll();

    $datapointStmt = $pdo->prepare(
        'SELECT
            d.id,
            d.seo_location_id,
            d.source_id,
            d.metric_key,
            d.metric_label,
            d.value_text,
            d.value_number,
            d.unit,
            d.usage_scope,
            d.valid_from,
            d.valid_to,
            d.source_timestamp,
            s.source_name
         FROM seo_location_datapoints d
         LEFT JOIN seo_location_sources s
           ON s.id = d.source_id
         WHERE d.seo_location_id IN (' . $placeholders . ')
         ORDER BY d.metric_key ASC, d.id ASC'
    );
    $datapointStmt->execute($locationIds);
    $datapointRows = $datapointStmt->fetchAll();
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}

$sourcesByLocation = [];
foreach ($sourceRows as $source) {
    $locationId = (int) $source['seo_location_id'];
    $sourcesByLocation[$locationId][] = [
        'id' => (int) $source['id'],
        'source_name' => $source['source_name'],
        'source_url' => $source['source_url'],
        'source_type' => $source['source_type'],
        'usage_scope' => $source['usage_scope'],
        'source_confidence' => (float) $source['source_confidence'],
        'source_timestamp' => $source['source_timestamp'],
        'valid_from' => $source['valid_from'],
        'valid_to' => $source['valid_to'],
        'notes' => $source['notes'],
    ];
}

$datapointsByLocation = [];
foreach ($datapointRows as $datapoint) {
    $locationId = (int) $datapoint['seo_location_id'];
    $datapointsByLocation[$locationId][] = [
        'id' => (int) $datapoint['id'],
        'source_id' => $datapoint['source_id'] !== null ? (int) $datapoint['source_id'] : null,
        'source_name' => $datapoint['source_name'],
        'metric_key' => $datapoint['metric_key'],
        'metric_label' => $datapoint['metric_label'],
        'value_text' => $datapoint['value_text'],
        'value_number' => $datapoint['value_number'] !== null ? (float) $datapoint['value_number'] : null,
        'unit' => $datapoint['unit'],
        'usage_scope' => $datapoint['usage_scope'],
        'valid_from' => $datapoint['valid_from'],
        'valid_to' => $datapoint['valid_to'],
        'source_timestamp' => $datapoint['source_timestamp'],
    ];
}

$groups = [];
foreach ($locationRows as $row) {
    $locationSlug = (string) $row['location_slug'];
    $locationId = (int) $row['id'];
    if (!isset($groups[$locationSlug])) {
        $groups[$locationSlug] = [
            'location_slug' => $locationSlug,
            'location_name' => $row['location_name'],
            'pages' => [],
            'sources' => [],
            'datapoints' => [],
        ];
    }

    $groups[$locationSlug]['pages'][] = [
        'id' => $locationId,
        'page_type' => $row['page_type'],
        'url_path' => $row['url_path'],
        'strategic_location' => (bool) $row['strategic_location'],
        'cluster_relevant' => (bool) $row['cluster_relevant'],
        'quality_score' => $row['quality_score'] !== null ? (float) $row['quality_score'] : null,
        'source_confidence' => $row['source_confidence'] !== null ? (float) $row['source_confidence'] : null,
        'local_uniqueness_score' => $row['local_uniqueness_score'] !== null ? (float) $row['local_uniqueness_score'] : null,
        'entity_depth_score' => $row['entity_depth_score'] !== null ? (float) $row['entity_depth_score'] : null,
        'duplicate_risk' => $row['duplicate_risk'] !== null ? (float) $row['duplicate_risk'] : null,
        'data_freshness' => $row['data_freshness'],
        'has_external_validation' => (bool) $row['has_external_validation'],
        'indexing_state' => $row['indexing_state'],
        'performance_state' => $row['performance_state'],
        'indexing_reason' => $row['indexing_reason'],
        'review_status' => $row['review_status'],
        'last_verified_at' => $row['last_verified_at'],
        'source_count' => (int) $row['source_count'],
        'datapoint_count' => (int) $row['datapoint_count'],
    ];

    foreach ($sourcesByLocation[$locationId] ?? [] as $source) {
        $key = (string) $source['source_name'];
        $groups[$locationSlug]['sources'][$key] = $source;
    }

    foreach ($datapointsByLocation[$locationId] ?? [] as $datapoint) {
        $key = (string) $datapoint['metric_key'];
        $groups[$locationSlug]['datapoints'][$key] = $datapoint;
    }
}

$items = array_values(array_map(
    fn (array $group): array => [
        'location_slug' => $group['location_slug'],
        'location_name' => $group['location_name'],
        'pages' => $group['pages'],
        'sources' => array_values($group['sources']),
        'datapoints' => array_values($group['datapoints']),
    ],
    array_slice($groups, 0, $limit, true)
));

json_response(['ok' => true, 'data' => $items]);
