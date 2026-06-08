<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

$tables = [];
$tableStatus = 'missing_config';

if (config_loaded() && setup_authorized()) {
    $config = inside_config();
    $dbConfig = $config['db'] ?? [];
    if (empty($dbConfig['dsn']) || empty($dbConfig['user'])) {
        json_response([
            'ok' => true,
            'data' => [
                'config_loaded' => true,
                'authorized' => true,
                'table_status' => 'missing_config',
                'tables' => [],
                'required_tables' => [],
            ],
        ]);
    }

    $pdo = db();
    if ($pdo instanceof PDO) {
        $tableStatus = 'ok';
        $stmt = $pdo->query(
            "SELECT table_name
             FROM information_schema.tables
             WHERE table_schema = DATABASE()
               AND table_name IN (
                 'inside_users',
                 'inside_audit_log',
                 'ai_scheduled_tasks',
                 'ai_task_runs',
                 'operator_conversations',
                 'operator_messages',
                 'seo_locations',
                 'seo_location_quality',
                 'seo_quality_history',
                 'seo_search_console_daily'
               )
             ORDER BY table_name"
        );
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    } else {
        $tableStatus = 'database_error';
    }
}

json_response([
    'ok' => $tableStatus === 'ok' || $tableStatus === 'missing_config',
    'data' => [
        'config_loaded' => config_loaded(),
        'authorized' => setup_authorized(),
        'table_status' => $tableStatus,
        'database_error' => $tableStatus === 'database_error' ? db_last_error() : null,
        'tables' => $tables,
        'required_tables' => [
            'inside_users',
            'inside_audit_log',
            'ai_scheduled_tasks',
            'ai_task_runs',
            'operator_conversations',
            'operator_messages',
            'seo_locations',
            'seo_location_quality',
            'seo_quality_history',
            'seo_search_console_daily',
        ],
    ],
]);
