<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/operator.php';

$user = current_user();
if (!$user && !cron_authorized()) {
    json_response(['ok' => false, 'error' => 'Nicht autorisiert.'], 401);
}

$pdo = require_db();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$body = $method === 'POST' ? read_json_body() : [];
$force = (bool) ($body['force'] ?? false);
$taskId = (int) ($body['task_id'] ?? ($_GET['task_id'] ?? 0));

if ($force && !$user) {
    json_response(['ok' => false, 'error' => 'Manuelle Testlaeufe erfordern Login.'], 401);
}

if ($taskId > 0) {
    if (!$user) {
        json_response(['ok' => false, 'error' => 'Einzelne Aufgabenlaeufe erfordern Login.'], 401);
    }
    $stmt = $pdo->prepare(
        'SELECT id, title, instruction, recurrence, next_run_at
         FROM ai_scheduled_tasks
         WHERE status = "active"
           AND id = :id
         LIMIT 1'
    );
    $stmt->execute([':id' => $taskId]);
} elseif ($force) {
    $stmt = $pdo->prepare(
        'SELECT id, title, instruction, recurrence, next_run_at
         FROM ai_scheduled_tasks
         WHERE status = "active"
         ORDER BY COALESCE(next_run_at, created_at) ASC
         LIMIT 5'
    );
    $stmt->execute();
} else {
    $stmt = $pdo->prepare(
        'SELECT id, title, instruction, recurrence, next_run_at
         FROM ai_scheduled_tasks
         WHERE status = "active"
           AND next_run_at IS NOT NULL
           AND next_run_at <= NOW()
         ORDER BY next_run_at ASC
         LIMIT 20'
    );
    $stmt->execute();
}

$tasks = $stmt->fetchAll();
$runs = [];

foreach ($tasks as $task) {
    $runStmt = $pdo->prepare(
        'INSERT INTO ai_task_runs
           (task_id, status, started_at, created_at)
         VALUES
           (:task_id, "running", NOW(), NOW())'
    );
    $runStmt->execute([
        ':task_id' => (int) $task['id'],
    ]);
    $runId = (int) $pdo->lastInsertId();

    try {
        $result = operator_generate_response((string) $task['instruction'], [
            'source' => $force ? 'manual_scheduler_run' : 'scheduled_due_run',
            'task_id' => (int) $task['id'],
            'task_title' => (string) $task['title'],
            'recurrence' => (string) $task['recurrence'],
            'next_run_at_before_run' => $task['next_run_at'],
        ]);
        $result['run_id'] = $runId;
        $result['task_id'] = (int) $task['id'];
        $result['task_title'] = (string) $task['title'];
        $result['generated_at'] = (new DateTimeImmutable('now'))->format(DateTimeInterface::ATOM);

        $finishStmt = $pdo->prepare(
            'UPDATE ai_task_runs
             SET status = "needs_review", finished_at = NOW(), result_json = :result_json
             WHERE id = :id'
        );
        $finishStmt->execute([
            ':id' => $runId,
            ':result_json' => json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    } catch (Throwable $error) {
        $result = [
            'mode' => 'failed',
            'summary' => 'Aufgabe konnte nicht ausgefuehrt werden.',
            'answer' => '',
            'required_review' => true,
            'error' => $error->getMessage(),
        ];
        $failStmt = $pdo->prepare(
            'UPDATE ai_task_runs
             SET status = "failed", finished_at = NOW(), error_text = :error_text, result_json = :result_json
             WHERE id = :id'
        );
        $failStmt->execute([
            ':id' => $runId,
            ':error_text' => $error->getMessage(),
            ':result_json' => json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    $nextRunAt = next_run_at((string) $task['recurrence']);
    if ((string) $task['recurrence'] === 'once') {
        $updateStmt = $pdo->prepare(
            'UPDATE ai_scheduled_tasks
             SET status = "archived", last_run_at = NOW(), next_run_at = NULL, updated_at = NOW()
             WHERE id = :id'
        );
        $updateStmt->execute([':id' => (int) $task['id']]);
    } else {
        $updateStmt = $pdo->prepare(
            'UPDATE ai_scheduled_tasks
             SET last_run_at = NOW(), next_run_at = :next_run_at, updated_at = NOW()
             WHERE id = :id'
        );
        $updateStmt->execute([
            ':next_run_at' => $nextRunAt,
            ':id' => (int) $task['id'],
        ]);
    }

    $runs[] = [
        'run_id' => $runId,
        'task_id' => (int) $task['id'],
        'title' => (string) $task['title'],
        'status' => ($result['mode'] ?? '') === 'failed' ? 'failed' : 'needs_review',
        'mode' => $result['mode'] ?? 'unknown',
        'summary' => $result['summary'] ?? '',
        'next_run_at' => $nextRunAt,
    ];
}

audit_log('task.run_due', [
    'count' => count($runs),
    'force' => $force,
    'task_id' => $taskId ?: null,
], $user ? (int) $user['id'] : null);

json_response(['ok' => true, 'data' => ['processed' => count($runs), 'runs' => $runs]]);
