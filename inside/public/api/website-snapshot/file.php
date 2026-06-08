<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/website-snapshot.php';

$config = inside_config();
$expectedToken = trim((string) (
    $config['integrations']['website_snapshot_token']
    ?? $config['app']['website_snapshot_token']
    ?? ''
));

if ($expectedToken !== '') {
    $providedToken = trim((string) ($_GET['token'] ?? ($_SERVER['HTTP_X_WEBSITE_SNAPSHOT_TOKEN'] ?? '')));
    if ($providedToken === '' || !hash_equals($expectedToken, $providedToken)) {
        json_response(['ok' => false, 'error' => 'Snapshot-Zugriff nicht autorisiert.'], 401);
    }
}

$requested = strtolower(trim((string) ($_GET['file'] ?? 'manifest')));
$files = [
    'manifest' => 'manifest.json',
    'manifest.json' => 'manifest.json',
    'active' => 'active-snapshot.json',
    'active-snapshot' => 'active-snapshot.json',
    'active-snapshot.json' => 'active-snapshot.json',
    'market' => 'leadgen_market_data.json',
    'leadgen_market_data' => 'leadgen_market_data.json',
    'leadgen_market_data.json' => 'leadgen_market_data.json',
    'locations' => 'website_locations.json',
    'website_locations' => 'website_locations.json',
    'website_locations.json' => 'website_locations.json',
];

$fileName = $files[$requested] ?? null;
if ($fileName === null) {
    json_response(['ok' => false, 'error' => 'Unbekannte Snapshot-Datei.'], 400);
}

$path = website_snapshot_storage_root() . '/' . $fileName;
if (!is_file($path)) {
    json_response(['ok' => false, 'error' => 'Snapshot-Datei wurde noch nicht erzeugt.'], 404);
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
readfile($path);
