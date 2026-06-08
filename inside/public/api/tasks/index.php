<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

$user = require_auth();
$pdo = require_db();
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $stmt = $pdo->query(
        'SELECT id, title, instruction, status, recurrence, next_run_at, last_run_at, risk_level
         FROM ai_scheduled_tasks
         ORDER BY FIELD(status, "active", "paused", "archived"), COALESCE(next_run_at, created_at) ASC
         LIMIT 100'
    );
    json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
}

if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Methode nicht erlaubt.'], 405);
}

$body = read_json_body();
$title = trim((string) ($body['title'] ?? ''));
$instruction = trim((string) ($body['instruction'] ?? ''));
$recurrence = (string) ($body['recurrence'] ?? 'weekly');
$allowedRecurrences = ['once', 'weekly', 'every_4_weeks', 'monthly', 'quarterly'];

if ($title === '' || $instruction === '' || !in_array($recurrence, $allowedRecurrences, true)) {
    json_response(['ok' => false, 'error' => 'Titel, Anweisung und gueltiger Rhythmus sind erforderlich.'], 422);
}

$nextRunAt = next_run_at($recurrence, new DateTimeImmutable('now'));
if ($recurrence === 'once') {
    $nextRunAt = (new DateTimeImmutable('now'))->modify('+5 minutes')->format('Y-m-d H:i:s');
}

$stmt = $pdo->prepare(
    'INSERT INTO ai_scheduled_tasks
       (title, instruction, recurrence, status, risk_level, next_run_at, created_by, created_at, updated_at)
     VALUES
       (:title, :instruction, :recurrence, "active", "review_required", :next_run_at, :created_by, NOW(), NOW())'
);
$stmt->execute([
    ':title' => $title,
    ':instruction' => $instruction,
    ':recurrence' => $recurrence,
    ':next_run_at' => $nextRunAt,
    ':created_by' => (int) $user['id'],
]);

$id = (int) $pdo->lastInsertId();
audit_log('task.create', ['task_id' => $id, 'recurrence' => $recurrence], (int) $user['id']);

$stmt = $pdo->prepare(
    'SELECT id, title, instruction, status, recurrence, next_run_at, last_run_at, risk_level
     FROM ai_scheduled_tasks
     WHERE id = :id'
);
$stmt->execute([':id' => $id]);

json_response(['ok' => true, 'data' => $stmt->fetch()], 201);
