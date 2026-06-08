<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/website-snapshot.php';

require_auth();
$pdo = require_db();

try {
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 30;
    json_response([
        'ok' => true,
        'data' => website_snapshot_history($pdo, $limit),
    ]);
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 422);
}
