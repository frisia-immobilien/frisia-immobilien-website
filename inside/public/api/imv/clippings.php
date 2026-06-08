<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';

require_auth();
$pdo = require_db();
imv_ensure_tables($pdo);

$sourcesStmt = $pdo->query(
    'SELECT id, platform_key, platform_name, source_type, base_url, status, access_mode, clipping_policy, notes, created_at, updated_at
     FROM imv_clipping_sources
     ORDER BY source_type ASC, platform_name ASC'
);

$clippingsStmt = $pdo->query(
    'SELECT
        c.id,
        c.title,
        c.url,
        c.published_at,
        c.location_slug,
        c.location_label,
        c.topic,
        c.excerpt,
        c.summary,
        c.review_status,
        c.created_at,
        s.platform_name,
        s.platform_key
     FROM imv_clippings c
     JOIN imv_clipping_sources s ON s.id = c.source_id
     ORDER BY COALESCE(c.published_at, c.created_at) DESC
     LIMIT 100'
);

json_response([
    'ok' => true,
    'data' => [
        'sources' => $sourcesStmt->fetchAll(),
        'clippings' => $clippingsStmt->fetchAll(),
    ],
]);
