<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require dirname(__DIR__) . '/lib/partners.php';

$user = require_auth();
$pdo = require_db();

try {
    require_method('POST');

    partners_ensure_schema($pdo);
    partners_seed_defaults($pdo);

    $export = partners_export_public($pdo);
    $partners = partners_rows($pdo, false);
    $publicPartners = $export['partners'] ?? [];

    audit_log(
        'partners.sync',
        [
            'partner_count' => count($partners),
            'public_partner_count' => is_array($publicPartners) ? count($publicPartners) : 0,
            'generated_at' => (string) ($export['generated_at'] ?? ''),
        ],
        (int) $user['id']
    );

    json_response([
        'ok' => true,
        'data' => [
            'generated_at' => (string) ($export['generated_at'] ?? ''),
            'partner_count' => count($partners),
            'public_partner_count' => is_array($publicPartners) ? count($publicPartners) : 0,
            'public_url' => '/api/partners/public.php',
            'partners' => $partners,
        ],
    ]);
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}
