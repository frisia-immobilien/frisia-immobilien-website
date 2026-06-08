<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_auth();
$pdo = require_db();

$limit = (int) ($_GET['limit'] ?? 20);
$limit = max(1, min(60, $limit));

$stmt = $pdo->prepare(
    'SELECT
        c.id,
        c.title,
        c.status,
        c.created_at,
        c.updated_at,
        u.email AS user_email,
        COUNT(m.id) AS message_count,
        MAX(m.created_at) AS last_message_at
     FROM operator_conversations c
     LEFT JOIN inside_users u ON u.id = c.created_by
     LEFT JOIN operator_messages m ON m.conversation_id = c.id
     GROUP BY c.id, c.title, c.status, c.created_at, c.updated_at, u.email
     ORDER BY c.updated_at DESC
     LIMIT :limit_value'
);
$stmt->bindValue(':limit_value', $limit, PDO::PARAM_INT);
$stmt->execute();

$conversations = [];
foreach ($stmt->fetchAll() as $row) {
    $previewStmt = $pdo->prepare(
        'SELECT content
         FROM operator_messages
         WHERE conversation_id = :conversation_id
         ORDER BY created_at DESC
         LIMIT 1'
    );
    $previewStmt->execute([':conversation_id' => (int) $row['id']]);
    $preview = (string) ($previewStmt->fetchColumn() ?: '');

    $previewShort = function_exists('mb_substr') ? mb_substr($preview, 0, 260) : substr($preview, 0, 260);

    $conversations[] = [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'status' => $row['status'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
        'last_message_at' => $row['last_message_at'],
        'message_count' => (int) $row['message_count'],
        'user_email' => $row['user_email'],
        'preview' => $previewShort,
    ];
}

json_response(['ok' => true, 'data' => $conversations]);
