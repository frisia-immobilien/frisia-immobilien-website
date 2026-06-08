<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$database = 'missing_config';
$databaseError = null;
$openaiConfigured = false;
$propstackConfigured = false;

if (config_loaded()) {
    try {
        $config = inside_config();
        $openaiConfigured = trim((string) (($config['openai'] ?? [])['api_key'] ?? '')) !== '';
        $propstackConfigured = trim((string) (($config['integrations'] ?? [])['propstack_api_key'] ?? '')) !== '';
        $dbConfig = $config['db'] ?? [];
        if (empty($dbConfig['dsn']) || empty($dbConfig['user'])) {
            json_response([
                'ok' => true,
                'app' => 'Frisia Inside',
                'version' => FRISIA_INSIDE_VERSION,
                'php_version' => PHP_VERSION,
                'config_loaded' => true,
                'database' => 'missing_config',
                'database_error' => null,
                'openai_configured' => $openaiConfigured,
                'propstack_configured' => $propstackConfigured,
            ]);
        }

        $pdo = db();
        if ($pdo instanceof PDO) {
            $pdo->query('SELECT 1');
            $database = 'ok';
        } else {
            $database = 'error';
            $databaseError = 'PDO-Verbindung konnte nicht aufgebaut werden.';
        }
    } catch (Throwable $error) {
        $database = 'error';
        $databaseError = $error->getMessage();
    }
}

json_response([
    'ok' => $database !== 'error',
    'app' => 'Frisia Inside',
    'version' => FRISIA_INSIDE_VERSION,
    'php_version' => PHP_VERSION,
    'config_loaded' => config_loaded(),
    'database' => $database,
    'database_error' => $databaseError,
    'openai_configured' => $openaiConfigured,
    'propstack_configured' => $propstackConfigured,
]);
