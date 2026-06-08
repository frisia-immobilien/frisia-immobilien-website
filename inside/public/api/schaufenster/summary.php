<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require dirname(__DIR__) . '/lib/schaufenster.php';

require_auth();
$pdo = require_db();

try {
    $propertyRows = $pdo->query(
        'SELECT *
         FROM schaufenster_tv_properties
         ORDER BY active DESC, synced_at DESC, title ASC
         LIMIT 100'
    )->fetchAll();

    $slideRows = $pdo->query(
        'SELECT *
         FROM schaufenster_tv_slides
         ORDER BY active DESC, sort_order ASC, created_at DESC
         LIMIT 100'
    )->fetchAll();

    $lastSync = $pdo->query('SELECT MAX(synced_at) FROM schaufenster_tv_properties')->fetchColumn();
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}

$properties = array_map(static fn (array $row): array => [
    ...st_map_property_row($row),
    'active' => (bool) $row['active'],
    'custom_flag_value' => $row['custom_flag_value'],
    'synced_at' => $row['synced_at'],
], $propertyRows);

$slides = array_map(static fn (array $row): array => [
    ...st_map_slide_row($row),
    'active' => (bool) $row['active'],
    'sort_order' => (int) $row['sort_order'],
    'created_at' => $row['created_at'],
], $slideRows);

json_response([
    'ok' => true,
    'data' => [
        'properties' => $properties,
        'slides' => $slides,
        'active_properties' => count(array_filter($properties, static fn (array $item): bool => (bool) $item['active'])),
        'active_slides' => count(array_filter($slides, static fn (array $item): bool => (bool) $item['active'])),
        'last_sync_at' => $lastSync ?: null,
        'display_url' => '/schaufenster-tv/live',
    ],
]);
