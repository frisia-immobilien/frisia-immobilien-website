<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require dirname(__DIR__) . '/lib/partners.php';

$pdo = db();
if (!$pdo) {
    $defaults = array_values(array_filter(
        partners_defaults(),
        static fn (array $partner): bool => !array_key_exists('active', $partner) || (bool) $partner['active']
    ));

    json_response([
        'ok' => true,
        'generated_at' => date('c'),
        'partners' => partners_for_public($defaults, true),
    ]);
}

try {
    $rows = partners_rows($pdo, true);
    json_response([
        'ok' => true,
        'generated_at' => date('c'),
        'partners' => partners_for_public($rows, true),
    ]);
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}
