<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_auth();
$pdo = require_db();
$config = inside_config();

function scalar_query(PDO $pdo, string $sql): int|string|null
{
    try {
        $value = $pdo->query($sql)->fetchColumn();
        if ($value === false || $value === null) {
            return null;
        }
        return is_numeric($value) ? (int) $value : (string) $value;
    } catch (Throwable) {
        return null;
    }
}

$openaiConfigured = trim((string) (($config['openai'] ?? [])['api_key'] ?? '')) !== '';
$propstackConfigured = trim((string) (($config['integrations'] ?? [])['propstack_api_key'] ?? '')) !== '';
$gscProperty = trim((string) (($config['integrations'] ?? [])['google_search_console_property'] ?? ''));
$cronTokenConfigured = trim((string) (($config['app'] ?? [])['cron_token'] ?? '')) !== '';

$activeTasks = scalar_query($pdo, 'SELECT COUNT(*) FROM ai_scheduled_tasks WHERE status = "active"');
$dueTasks = scalar_query(
    $pdo,
    'SELECT COUNT(*) FROM ai_scheduled_tasks
     WHERE status = "active"
       AND next_run_at IS NOT NULL
       AND next_run_at <= NOW()'
);
$nextRunAt = scalar_query(
    $pdo,
    'SELECT MIN(next_run_at) FROM ai_scheduled_tasks
     WHERE status = "active"
       AND next_run_at IS NOT NULL'
);
$lastRunAt = scalar_query($pdo, 'SELECT MAX(created_at) FROM ai_task_runs');
$reviewRuns = scalar_query($pdo, 'SELECT COUNT(*) FROM ai_task_runs WHERE status = "needs_review"');
$failedRuns = scalar_query($pdo, 'SELECT COUNT(*) FROM ai_task_runs WHERE status = "failed"');
$seoLocations = scalar_query($pdo, 'SELECT COUNT(*) FROM seo_locations');
$seoQualityRows = scalar_query($pdo, 'SELECT COUNT(*) FROM seo_location_quality');
$gscRows = scalar_query($pdo, 'SELECT COUNT(*) FROM seo_search_console_daily');
$auditRows = scalar_query($pdo, 'SELECT COUNT(*) FROM inside_audit_log');

$readiness = [
    [
        'key' => 'database',
        'label' => 'Datenbank',
        'state' => 'ready',
        'detail' => 'TecSpace MySQL erreichbar.',
    ],
    [
        'key' => 'auth',
        'label' => 'Login',
        'state' => 'ready',
        'detail' => 'Session-Login ist aktiv.',
    ],
    [
        'key' => 'scheduler',
        'label' => 'Scheduler',
        'state' => ((int) $activeTasks > 0) ? 'ready' : 'attention',
        'detail' => ((int) $activeTasks > 0)
            ? (string) $activeTasks . ' aktive Aufgabe(n).'
            : 'Noch keine aktive Aufgabe.',
    ],
    [
        'key' => 'cron',
        'label' => 'Cron',
        'state' => $cronTokenConfigured ? 'prepared' : 'attention',
        'detail' => $cronTokenConfigured
            ? 'Cron-Endpunkt ist vorbereitet. TecSpace-Zeitplan separat setzen.'
            : 'Cron-Token fehlt in der Serverkonfiguration.',
    ],
    [
        'key' => 'openai',
        'label' => 'OpenAI',
        'state' => $openaiConfigured ? 'ready' : 'prepared',
        'detail' => $openaiConfigured
            ? 'Serverseitiger API-Key ist aktiv.'
            : 'Fallback-Modus aktiv, bis ein API-Key gesetzt ist.',
    ],
    [
        'key' => 'propstack',
        'label' => 'Propstack',
        'state' => $propstackConfigured ? 'ready' : 'prepared',
        'detail' => $propstackConfigured
            ? 'API-Key ist serverseitig gesetzt.'
            : 'Anbindung vorbereitet, API-Key fehlt noch.',
    ],
    [
        'key' => 'gsc',
        'label' => 'Search Console',
        'state' => $gscProperty !== '' ? 'prepared' : 'attention',
        'detail' => $gscProperty !== ''
            ? 'Property hinterlegt: ' . $gscProperty
            : 'Property fehlt in der Serverkonfiguration.',
    ],
    [
        'key' => 'seo_data',
        'label' => 'IMV/SEO Daten',
        'state' => ((int) $seoLocations > 0 || (int) $seoQualityRows > 0) ? 'ready' : 'prepared',
        'detail' => ((int) $seoLocations > 0 || (int) $seoQualityRows > 0)
            ? (string) $seoLocations . ' Ort(e), ' . (string) $seoQualityRows . ' Quality-Row(s).'
            : 'Tabellen sind bereit, Import steht noch aus.',
    ],
];

json_response([
    'ok' => true,
    'data' => [
        'readiness' => $readiness,
        'metrics' => [
            'active_tasks' => (int) $activeTasks,
            'due_tasks' => (int) $dueTasks,
            'review_runs' => (int) $reviewRuns,
            'failed_runs' => (int) $failedRuns,
            'seo_locations' => (int) $seoLocations,
            'seo_quality_rows' => (int) $seoQualityRows,
            'search_console_rows' => (int) $gscRows,
            'audit_log_rows' => (int) $auditRows,
        ],
        'timeline' => [
            'next_run_at' => $nextRunAt,
            'last_run_at' => $lastRunAt,
        ],
    ],
]);
