<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_auth();
$pdo = require_db();

$summary = [
    'locations' => 0,
    'strategic_locations' => 0,
    'quality_rows' => 0,
    'pending_review' => 0,
    'indexable_verified' => 0,
    'revalidation_required' => 0,
    'sources' => 0,
    'datapoints' => 0,
    'page_types' => [],
];

try {
    $summary['locations'] = (int) $pdo->query('SELECT COUNT(*) FROM seo_locations')->fetchColumn();
    $summary['strategic_locations'] = (int) $pdo->query('SELECT COUNT(*) FROM seo_locations WHERE strategic_location = 1')->fetchColumn();
    $summary['quality_rows'] = (int) $pdo->query('SELECT COUNT(*) FROM seo_location_quality')->fetchColumn();
    $summary['pending_review'] = (int) $pdo->query('SELECT COUNT(*) FROM seo_location_quality WHERE indexing_state = "pending_review"')->fetchColumn();
    $summary['indexable_verified'] = (int) $pdo->query('SELECT COUNT(*) FROM seo_location_quality WHERE indexing_state IN ("indexable_verified", "indexable_high_confidence")')->fetchColumn();
    $summary['revalidation_required'] = (int) $pdo->query('SELECT COUNT(*) FROM seo_location_quality WHERE performance_state = "revalidation_required"')->fetchColumn();
    $summary['sources'] = (int) $pdo->query('SELECT COUNT(*) FROM seo_location_sources')->fetchColumn();
    $summary['datapoints'] = (int) $pdo->query('SELECT COUNT(*) FROM seo_location_datapoints')->fetchColumn();

    $pageTypeStmt = $pdo->query(
        'SELECT page_type, COUNT(*) AS count_value
         FROM seo_locations
         GROUP BY page_type
         ORDER BY count_value DESC, page_type ASC'
    );
    $summary['page_types'] = array_map(
        fn (array $row): array => [
            'page_type' => $row['page_type'],
            'count' => (int) $row['count_value'],
        ],
        $pageTypeStmt->fetchAll()
    );
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}

json_response(['ok' => true, 'data' => $summary]);
