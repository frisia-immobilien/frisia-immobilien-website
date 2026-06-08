<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';

require_auth();
$pdo = require_db();
imv_ensure_tables($pdo);

function imv_scalar(PDO $pdo, string $sql): int|string|null
{
    try {
        $value = $pdo->query($sql)->fetchColumn();
        if ($value === false || $value === null) {
            return null;
        }
        return is_numeric($value) ? (int) $value : (string) $value;
    } catch (Throwable) {
        return null;
    }
}

$marketRecords = (int) imv_scalar($pdo, 'SELECT COUNT(*) FROM imv_market_records');
$marketLocations = (int) imv_scalar($pdo, 'SELECT COUNT(DISTINCT COALESCE(location_slug, location_label)) FROM imv_market_records');
$landingpageRecords = (int) imv_scalar($pdo, 'SELECT COUNT(*) FROM imv_market_records WHERE landingpage_geeignet = 1');
$leadgenRecords = (int) imv_scalar($pdo, 'SELECT COUNT(*) FROM imv_market_records WHERE leadgen_geeignet = 1');
$websiteLocations = (int) imv_scalar($pdo, 'SELECT COUNT(*) FROM imv_website_locations');
$websiteLiveLocations = (int) imv_scalar($pdo, 'SELECT COUNT(*) FROM imv_website_locations WHERE website_live = 1');
$leadgenLiveLocations = (int) imv_scalar($pdo, 'SELECT COUNT(*) FROM imv_website_locations WHERE leadgen_live = 1');
$clippingSources = (int) imv_scalar($pdo, 'SELECT COUNT(*) FROM imv_clipping_sources');
$clippings = (int) imv_scalar($pdo, 'SELECT COUNT(*) FROM imv_clippings');

$objectStmt = $pdo->query(
    'SELECT object_type, COUNT(*) AS count_value
     FROM imv_market_records
     GROUP BY object_type
     ORDER BY count_value DESC, object_type ASC'
);
$objectTypes = array_map(
    fn (array $row): array => [
        'object_type' => $row['object_type'] ?? 'unbekannt',
        'count' => (int) $row['count_value'],
    ],
    $objectStmt->fetchAll()
);

json_response([
    'ok' => true,
    'data' => [
        'market_records' => $marketRecords,
        'market_locations' => $marketLocations,
        'landingpage_records' => $landingpageRecords,
        'leadgen_records' => $leadgenRecords,
        'website_locations' => $websiteLocations,
        'website_live_locations' => $websiteLiveLocations,
        'leadgen_live_locations' => $leadgenLiveLocations,
        'clipping_sources' => $clippingSources,
        'clippings' => $clippings,
        'runtime_file_present' => is_file(imv_runtime_import_path()),
        'website_locations_file_present' => is_file(imv_website_locations_import_path()),
        'object_types' => $objectTypes,
    ],
]);
