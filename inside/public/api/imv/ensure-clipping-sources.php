<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();
imv_ensure_tables($pdo);

$stmt = $pdo->prepare(
    'INSERT INTO imv_clipping_sources
       (
         platform_key,
         platform_name,
         source_type,
         base_url,
         status,
         access_mode,
         clipping_policy,
         notes,
         created_at,
         updated_at
       )
     VALUES
       (
         :platform_key,
         :platform_name,
         :source_type,
         :base_url,
         "planned",
         :access_mode,
         :clipping_policy,
         :notes,
         NOW(),
         NOW()
       )
     ON DUPLICATE KEY UPDATE
       platform_name = VALUES(platform_name),
       source_type = VALUES(source_type),
       base_url = VALUES(base_url),
       access_mode = VALUES(access_mode),
       clipping_policy = VALUES(clipping_policy),
       notes = VALUES(notes),
       updated_at = NOW()'
);

$createdOrUpdated = 0;
foreach (imv_default_clipping_sources() as $source) {
    $stmt->execute([
        ':platform_key' => $source['platform_key'],
        ':platform_name' => $source['platform_name'],
        ':source_type' => $source['source_type'],
        ':base_url' => $source['base_url'],
        ':access_mode' => $source['access_mode'],
        ':clipping_policy' => $source['clipping_policy'],
        ':notes' => $source['notes'],
    ]);
    $createdOrUpdated++;
}

audit_log('imv.ensure_clipping_sources', [
    'sources' => $createdOrUpdated,
], (int) $user['id']);

json_response(['ok' => true, 'data' => ['sources' => $createdOrUpdated]]);
