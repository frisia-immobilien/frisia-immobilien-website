<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();
$body = read_json_body();

$slideId = (int) ($body['slide_id'] ?? 0);
$action = (string) ($body['action'] ?? '');
if ($slideId <= 0 || !in_array($action, ['activate', 'deactivate', 'delete'], true)) {
    json_response(['ok' => false, 'error' => 'Ungueltige Slide-Aktion.'], 422);
}

try {
    if ($action === 'delete') {
        $stmt = $pdo->prepare('UPDATE schaufenster_tv_slides SET active = 0, updated_at = NOW() WHERE id = :id');
        $stmt->execute([':id' => $slideId]);
    } else {
        $stmt = $pdo->prepare('UPDATE schaufenster_tv_slides SET active = :active, updated_at = NOW() WHERE id = :id');
        $stmt->execute([':active' => $action === 'activate' ? 1 : 0, ':id' => $slideId]);
    }
    audit_log('schaufenster.update_slide', ['slide_id' => $slideId, 'action' => $action], (int) $user['id']);
    json_response(['ok' => true, 'data' => ['slide_id' => $slideId, 'action' => $action]]);
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}
