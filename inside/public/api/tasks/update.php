<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();
$body = read_json_body();

$taskId = (int) ($body['task_id'] ?? 0);
$action = trim((string) ($body['action'] ?? ''));
$allowedActions = ['pause', 'resume', 'archive'];

if ($taskId <= 0 || !in_array($action, $allowedActions, true)) {
    json_response(['ok' => false, 'error' => 'Gueltige Aufgabe und Aktion sind erforderlich.'], 422);
}

$stmt = $pdo->prepare(
    'SELECT id, title, status, recurrence
     FROM ai_scheduled_tasks
     WHERE id = :id
     LIMIT 1'
);
$stmt->execute([':id' => $taskId]);
$task = $stmt->fetch();

if (!$task) {
    json_response(['ok' => false, 'error' => 'Aufgabe nicht gefunden.'], 404);
}

$nextStatus = match ($action) {
    'pause' => 'paused',
    'resume' => 'active',
    'archive' => 'archived',
};

$nextRunAt = null;
if ($action === 'resume') {
    $nextRunAt = next_run_at((string) $task['recurrence']);
    if ((string) $task['recurrence'] === 'once') {
        $nextRunAt = (new DateTimeImmutable('now'))->modify('+5 minutes')->format('Y-m-d H:i:s');
    }
}

$updateStmt = $pdo->prepare(
    'UPDATE ai_scheduled_tasks
     SET status = :status,
         next_run_at = :next_run_at,
         updated_at = NOW()
     WHERE id = :id'
);
$updateStmt->execute([
    ':status' => $nextStatus,
    ':next_run_at' => $nextRunAt,
    ':id' => $taskId,
]);

audit_log('task.' . $action, [
    'task_id' => $taskId,
    'previous_status' => $task['status'],
    'next_status' => $nextStatus,
], (int) $user['id']);

$stmt = $pdo->prepare(
    'SELECT id, title, instruction, status, recurrence, next_run_at, last_run_at, risk_level
     FROM ai_scheduled_tasks
     WHERE id = :id'
);
$stmt->execute([':id' => $taskId]);

json_response(['ok' => true, 'data' => $stmt->fetch()]);
