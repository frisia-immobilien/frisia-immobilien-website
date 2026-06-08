<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');

if (!setup_authorized()) {
    json_response(['ok' => false, 'error' => 'Setup-Token ungueltig.'], 403);
}

$pdo = require_db();
$schemaPath = dirname(__DIR__, 2) . '/private/database/schema.sql';
$seedPath = dirname(__DIR__, 2) . '/private/database/seed-tasks.sql';

if (!is_file($schemaPath)) {
    json_response(['ok' => false, 'error' => 'schema.sql wurde auf dem Server nicht gefunden.'], 500);
}

$executed = 0;
foreach (split_sql_statements((string) file_get_contents($schemaPath)) as $statement) {
    $pdo->exec($statement);
    $executed++;
}

$body = read_json_body();
$seed = (bool) ($body['seed'] ?? true);
$seedExecuted = 0;
if ($seed && is_file($seedPath)) {
    foreach (split_sql_statements((string) file_get_contents($seedPath)) as $statement) {
        $pdo->exec($statement);
        $seedExecuted++;
    }
}

audit_log('setup.install_schema', ['statements' => $executed, 'seed_statements' => $seedExecuted]);

json_response([
    'ok' => true,
    'data' => [
        'schema_statements' => $executed,
        'seed_statements' => $seedExecuted,
    ],
]);
