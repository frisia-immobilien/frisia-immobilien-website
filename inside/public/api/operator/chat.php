<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/operator.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();
$body = read_json_body();
$message = trim((string) ($body['message'] ?? ''));

if ($message === '') {
    json_response(['ok' => false, 'error' => 'Nachricht ist erforderlich.'], 422);
}

$conversationStmt = $pdo->prepare(
    'INSERT INTO operator_conversations (created_by, title, status, created_at, updated_at)
     VALUES (:created_by, :title, "open", NOW(), NOW())'
);
$conversationStmt->execute([
    ':created_by' => (int) $user['id'],
    ':title' => substr($message, 0, 120),
]);
$conversationId = (int) $pdo->lastInsertId();

$messageStmt = $pdo->prepare(
    'INSERT INTO operator_messages (conversation_id, role, content, created_at)
     VALUES (:conversation_id, :role, :content, NOW())'
);
$messageStmt->execute([
    ':conversation_id' => $conversationId,
    ':role' => 'user',
    ':content' => $message,
]);

$operatorResult = operator_generate_response($message, [
    'source' => 'operator_chat',
    'user_role' => (string) $user['role'],
]);
$answer = (string) ($operatorResult['answer'] ?? '');

$messageStmt->execute([
    ':conversation_id' => $conversationId,
    ':role' => 'assistant',
    ':content' => $answer,
]);

$statusStmt = $pdo->prepare(
    'UPDATE operator_conversations
     SET status = "needs_review", updated_at = NOW()
     WHERE id = :id'
);
$statusStmt->execute([':id' => $conversationId]);

audit_log('operator.chat', [
    'conversation_id' => $conversationId,
    'mode' => $operatorResult['mode'] ?? 'unknown',
], (int) $user['id']);

json_response([
    'ok' => true,
    'data' => [
        'conversation_id' => $conversationId,
        'answer' => $answer,
        'mode' => $operatorResult['mode'] ?? 'unknown',
        'recommendations' => $operatorResult['recommendations'] ?? [],
        'checks' => $operatorResult['checks'] ?? [],
    ],
]);
