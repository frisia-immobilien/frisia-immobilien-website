<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_auth();
$pdo = require_db();

$limit = (int) ($_GET['limit'] ?? 40);
$limit = max(1, min(100, $limit));

$stmt = $pdo->prepare(
    'SELECT
        a.id,
        a.action,
        a.details_json,
        a.ip_address,
        a.created_at,
        u.email AS user_email,
        u.name AS user_name
     FROM inside_audit_log a
     LEFT JOIN inside_users u ON u.id = a.user_id
     ORDER BY a.created_at DESC
     LIMIT :limit_value'
);
$stmt->bindValue(':limit_value', $limit, PDO::PARAM_INT);
$stmt->execute();

$items = [];
foreach ($stmt->fetchAll() as $row) {
    $details = null;
    if (!empty($row['details_json'])) {
        $decoded = json_decode((string) $row['details_json'], true);
        $details = is_array($decoded) ? $decoded : null;
    }

    if (is_array($details) && array_key_exists('password', $details)) {
        unset($details['password']);
    }

    $items[] = [
        'id' => (int) $row['id'],
        'action' => $row['action'],
        'details' => $details,
        'ip_address' => $row['ip_address'],
        'created_at' => $row['created_at'],
        'user_email' => $row['user_email'],
        'user_name' => $row['user_name'],
    ];
}

json_response(['ok' => true, 'data' => $items]);
