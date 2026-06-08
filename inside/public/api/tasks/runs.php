<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_auth();
$pdo = require_db();

$limit = (int) ($_GET['limit'] ?? 30);
$limit = max(1, min(100, $limit));

$stmt = $pdo->prepare(
    'SELECT
        r.id,
        r.task_id,
        t.title AS task_title,
        r.status,
        r.started_at,
        r.finished_at,
        r.result_json,
        r.error_text,
        r.created_at
     FROM ai_task_runs r
     LEFT JOIN ai_scheduled_tasks t ON t.id = r.task_id
     ORDER BY r.created_at DESC
     LIMIT :limit_value'
);
$stmt->bindValue(':limit_value', $limit, PDO::PARAM_INT);
$stmt->execute();

$runs = [];
foreach ($stmt->fetchAll() as $row) {
    $result = null;
    if (!empty($row['result_json'])) {
        $decoded = json_decode((string) $row['result_json'], true);
        $result = is_array($decoded) ? $decoded : null;
    }

    $runs[] = [
        'id' => (int) $row['id'],
        'task_id' => (int) $row['task_id'],
        'task_title' => $row['task_title'],
        'status' => $row['status'],
        'started_at' => $row['started_at'],
        'finished_at' => $row['finished_at'],
        'created_at' => $row['created_at'],
        'error_text' => $row['error_text'],
        'result' => $result,
    ];
}

json_response(['ok' => true, 'data' => $runs]);
