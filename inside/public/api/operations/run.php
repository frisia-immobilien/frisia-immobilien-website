<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';

$user = current_user();
if (!$user && !cron_authorized()) {
    json_response(['ok' => false, 'error' => 'Nicht autorisiert.'], 401);
}

$pdo = require_db();
imv_ensure_tables($pdo);
$config = inside_config();

function operation_scalar(PDO $pdo, string $sql): int|string|null
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

function operation_check(string $key, string $label, string $state, string $detail): array
{
    return [
        'key' => $key,
        'label' => $label,
        'state' => $state,
        'detail' => $detail,
    ];
}

$openaiConfigured = trim((string) (($config['openai'] ?? [])['api_key'] ?? '')) !== '';
$propstackConfigured = trim((string) (($config['integrations'] ?? [])['propstack_api_key'] ?? '')) !== '';
$gscProperty = trim((string) (($config['integrations'] ?? [])['google_search_console_property'] ?? ''));
$cronTokenConfigured = trim((string) (($config['app'] ?? [])['cron_token'] ?? '')) !== '';

$activeTasks = (int) operation_scalar($pdo, 'SELECT COUNT(*) FROM ai_scheduled_tasks WHERE status = "active"');
$dueTasks = (int) operation_scalar(
    $pdo,
    'SELECT COUNT(*) FROM ai_scheduled_tasks
     WHERE status = "active"
       AND next_run_at IS NOT NULL
       AND next_run_at <= NOW()'
);
$reviewRuns = (int) operation_scalar($pdo, 'SELECT COUNT(*) FROM ai_task_runs WHERE status = "needs_review"');
$failedRuns24h = (int) operation_scalar(
    $pdo,
    'SELECT COUNT(*) FROM ai_task_runs
     WHERE status = "failed"
       AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
);
$lastRunAt = operation_scalar($pdo, 'SELECT MAX(created_at) FROM ai_task_runs');
$auditRows24h = (int) operation_scalar(
    $pdo,
    'SELECT COUNT(*) FROM inside_audit_log
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
);
$seoLocations = (int) operation_scalar($pdo, 'SELECT COUNT(*) FROM seo_locations');
$seoQualityRows = (int) operation_scalar($pdo, 'SELECT COUNT(*) FROM seo_location_quality');
$pendingReview = (int) operation_scalar(
    $pdo,
    'SELECT COUNT(*) FROM seo_location_quality
     WHERE review_status IN ("not_reviewed", "pending")
        OR indexing_state = "pending_review"'
);
$revalidationRequired = (int) operation_scalar(
    $pdo,
    'SELECT COUNT(*) FROM seo_location_quality
     WHERE performance_state = "revalidation_required"
        OR data_freshness = "stale"'
);
$gscRows = (int) operation_scalar($pdo, 'SELECT COUNT(*) FROM seo_search_console_daily');
$imvMarketRecords = (int) operation_scalar($pdo, 'SELECT COUNT(*) FROM imv_market_records');
$imvClippingSources = (int) operation_scalar($pdo, 'SELECT COUNT(*) FROM imv_clipping_sources');
$imvClippings = (int) operation_scalar($pdo, 'SELECT COUNT(*) FROM imv_clippings');

$checks = [
    operation_check('database', 'Datenbank', 'ready', 'TecSpace MySQL ist erreichbar.'),
    operation_check(
        'cron',
        'Cron',
        $cronTokenConfigured ? 'prepared' : 'attention',
        $cronTokenConfigured
            ? 'Cron-Token ist gesetzt. TecSpace-Zeitplan muss serverseitig ausloesen.'
            : 'Cron-Token fehlt in private/config.php.'
    ),
    operation_check(
        'scheduler',
        'Scheduler',
        $activeTasks > 0 ? ($dueTasks > 0 ? 'attention' : 'ready') : 'attention',
        $activeTasks > 0
            ? $activeTasks . ' aktive Aufgabe(n), ' . $dueTasks . ' faellig.'
            : 'Keine aktive Aufgabe vorhanden.'
    ),
    operation_check(
        'openai',
        'OpenAI',
        $openaiConfigured ? 'ready' : 'prepared',
        $openaiConfigured
            ? 'OpenAI-Key ist serverseitig gesetzt.'
            : 'Fallback-Modus aktiv, bis ein API-Key gesetzt ist.'
    ),
    operation_check(
        'propstack',
        'Propstack',
        $propstackConfigured ? 'ready' : 'prepared',
        $propstackConfigured
            ? 'Propstack-Key ist serverseitig gesetzt.'
            : 'Anbindung vorbereitet, API-Key fehlt noch.'
    ),
    operation_check(
        'search_console',
        'Search Console',
        $gscProperty !== '' ? ($gscRows > 0 ? 'ready' : 'prepared') : 'attention',
        $gscProperty !== ''
            ? 'Property: ' . $gscProperty . '. Importzeilen: ' . $gscRows . '.'
            : 'Search-Console-Property fehlt.'
    ),
    operation_check(
        'seo_quality',
        'IMV/SEO Daten',
        $seoQualityRows > 0 ? ($pendingReview > 0 || $revalidationRequired > 0 ? 'attention' : 'ready') : 'prepared',
        $seoLocations . ' Ort(e), ' . $seoQualityRows . ' Quality-Row(s), ' . $pendingReview . ' Review-Fall/Faelle.'
    ),
    operation_check(
        'imv_market',
        'IMV Marktdaten',
        $imvMarketRecords > 0 ? 'ready' : 'prepared',
        $imvMarketRecords > 0
            ? $imvMarketRecords . ' Marktdatensatz/Marktdatensaetze importiert.'
            : 'Runtime-Marktdaten sind noch nicht importiert.'
    ),
    operation_check(
        'imv_clipping',
        'IMV Clipping',
        $imvClippingSources > 0 ? ($imvClippings > 0 ? 'ready' : 'prepared') : 'prepared',
        $imvClippingSources . ' Quelle(n), ' . $imvClippings . ' Clipping(s).'
    ),
    operation_check(
        'run_errors',
        'Fehlerlaeufe',
        $failedRuns24h > 0 ? 'attention' : 'ready',
        $failedRuns24h . ' fehlgeschlagene KI-/Scheduler-Laeufe in den letzten 24 Stunden.'
    ),
];

$attentionCount = count(array_filter($checks, fn (array $item): bool => $item['state'] === 'attention'));
$preparedCount = count(array_filter($checks, fn (array $item): bool => $item['state'] === 'prepared'));
$overall = $attentionCount > 0 ? 'attention' : ($preparedCount > 0 ? 'prepared' : 'ready');

$actions = [];
if ($dueTasks > 0) {
    $actions[] = 'Faellige Scheduler-Aufgaben ueber /api/tasks/run-due.php ausfuehren.';
}
if (!$openaiConfigured) {
    $actions[] = 'OpenAI-Key serverseitig setzen, wenn echte KI-Auswertungen statt Fallback gewuenscht sind.';
}
if (!$propstackConfigured) {
    $actions[] = 'Propstack-Key serverseitig setzen, bevor Leadgen-/CRM-Syncs aktiviert werden.';
}
if ($gscRows === 0) {
    $actions[] = 'Search-Console-Import anbinden, damit reale Google-Signale in die Qualitaetslogik einfliessen.';
}
if ($seoQualityRows === 0) {
    $actions[] = 'IMV-/SEO-Ortsdaten importieren und Quality-Scores initial berechnen.';
} elseif ($pendingReview > 0) {
    $actions[] = 'Pending IMV-/SEO-Ortsseiten fachlich pruefen: externe Quellen, lokale Entitaeten und Reviewstatus ergaenzen.';
}
if ($imvMarketRecords === 0) {
    $actions[] = 'Runtime-Marktdaten importieren, damit Orte, Variablen und Landingpage-Attribute im Intranet sichtbar sind.';
}
if ($imvClippingSources === 0) {
    $actions[] = 'IMV-Clipping-Quellen anlegen und regelkonformen Quellenprozess starten.';
}

$report = [
    'overall' => $overall,
    'generated_at' => (new DateTimeImmutable('now'))->format(DateTimeInterface::ATOM),
    'checks' => $checks,
    'metrics' => [
        'active_tasks' => $activeTasks,
        'due_tasks' => $dueTasks,
        'review_runs' => $reviewRuns,
        'failed_runs_24h' => $failedRuns24h,
        'last_run_at' => $lastRunAt,
        'audit_rows_24h' => $auditRows24h,
        'seo_locations' => $seoLocations,
        'seo_quality_rows' => $seoQualityRows,
        'pending_review' => $pendingReview,
        'revalidation_required' => $revalidationRequired,
        'search_console_rows' => $gscRows,
        'imv_market_records' => $imvMarketRecords,
        'imv_clipping_sources' => $imvClippingSources,
        'imv_clippings' => $imvClippings,
    ],
    'recommended_actions' => $actions,
];

audit_log('operations.run', [
    'overall' => $overall,
    'attention_count' => $attentionCount,
    'prepared_count' => $preparedCount,
    'metrics' => $report['metrics'],
], $user ? (int) $user['id'] : null);

json_response(['ok' => true, 'data' => $report]);
