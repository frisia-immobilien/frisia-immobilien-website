<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';
require_once dirname(__DIR__) . '/lib/website-snapshot.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();
imv_ensure_tables($pdo);

try {
    $manifest = website_snapshot_create($pdo, (int) $user['id']);
    audit_log(
        'website_snapshot.create',
        [
            'version' => (string) ($manifest['version'] ?? ''),
            'source_type' => (string) ($manifest['source_type'] ?? ''),
            'counts' => $manifest['counts'] ?? [],
            'checksum_sha256' => (string) ($manifest['checksum_sha256'] ?? ''),
        ],
        (int) $user['id']
    );

    json_response([
        'ok' => true,
        'data' => [
            'version' => (string) ($manifest['version'] ?? ''),
            'generated_at' => (string) ($manifest['generated_at'] ?? ''),
            'source_type' => (string) ($manifest['source_type'] ?? ''),
            'counts' => $manifest['counts'] ?? [],
            'checksum_sha256' => (string) ($manifest['checksum_sha256'] ?? ''),
            'manifest_url' => '/api/website-snapshot/file.php?file=manifest',
            'active_url' => '/api/website-snapshot/file.php?file=active',
            'market_url' => '/api/website-snapshot/file.php?file=market',
            'locations_url' => '/api/website-snapshot/file.php?file=locations',
            'warnings' => $manifest['validation']['warnings'] ?? [],
        ],
    ]);
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 422);
}
