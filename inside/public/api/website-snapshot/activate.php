<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/website-snapshot.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();
$body = read_json_body();
$version = trim((string) ($body['version'] ?? ''));

if ($version === '') {
    json_response(['ok' => false, 'error' => 'Snapshot-Version fehlt.'], 422);
}

try {
    $result = website_snapshot_activate($pdo, $version, (int) $user['id'], 'rollback');
    audit_log(
        'website_snapshot.activate',
        [
            'version' => $version,
            'checksum_sha256' => (string) ($result['marker']['checksum_sha256'] ?? ''),
            'counts' => $result['marker']['counts'] ?? [],
        ],
        (int) $user['id']
    );

    json_response([
        'ok' => true,
        'data' => [
            'version' => $version,
            'active' => $result['marker'],
        ],
    ]);
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 422);
}
