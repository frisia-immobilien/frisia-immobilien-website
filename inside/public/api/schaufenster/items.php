<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require dirname(__DIR__) . '/lib/schaufenster.php';

$pdo = require_db();

try {
    $propertyStmt = $pdo->query(
        'SELECT *
         FROM schaufenster_tv_properties
         WHERE active = 1
           AND image_url IS NOT NULL
           AND image_url <> ""
           AND city IS NOT NULL
           AND city <> ""
           AND price_amount IS NOT NULL
           AND price_amount > 0
           AND price_on_inquiry = 0
         ORDER BY synced_at DESC, title ASC
         LIMIT 80'
    );
    $properties = array_map('st_map_property_row', $propertyStmt->fetchAll());

    $slideStmt = $pdo->query(
        'SELECT *
         FROM schaufenster_tv_slides
         WHERE active = 1
         ORDER BY sort_order ASC, created_at DESC
         LIMIT 80'
    );
    $slides = array_map('st_map_slide_row', $slideStmt->fetchAll());
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}

$items = array_values(array_filter([...$properties, ...$slides], static fn (array $item): bool => !empty($item['image_url'])));
shuffle($items);

json_response([
    'ok' => true,
    'data' => [
        'items' => $items,
        'count' => count($items),
        'generated_at' => date('c'),
    ],
]);
