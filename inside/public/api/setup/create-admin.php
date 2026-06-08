<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');

$config = inside_config();
$expectedToken = (string) ($config['app']['setup_token'] ?? '');
$body = read_json_body();
$providedToken = (string) ($body['setup_token'] ?? ($_SERVER['HTTP_X_SETUP_TOKEN'] ?? ''));

if ($expectedToken === '' || !hash_equals($expectedToken, $providedToken)) {
    json_response(['ok' => false, 'error' => 'Setup-Token ungueltig.'], 403);
}

$pdo = require_db();
$count = (int) $pdo->query('SELECT COUNT(*) FROM inside_users')->fetchColumn();
if ($count > 0) {
    json_response(['ok' => false, 'error' => 'Admin wurde bereits angelegt.'], 409);
}

$email = strtolower(trim((string) ($body['email'] ?? '')));
$name = trim((string) ($body['name'] ?? 'Sebastian'));
$password = (string) ($body['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 14) {
    json_response(['ok' => false, 'error' => 'Gueltige E-Mail und Passwort mit mindestens 14 Zeichen erforderlich.'], 422);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare(
    'INSERT INTO inside_users (email, name, role, password_hash, active, created_at, updated_at)
     VALUES (:email, :name, "owner", :password_hash, 1, NOW(), NOW())'
);
$stmt->execute([
    ':email' => $email,
    ':name' => $name,
    ':password_hash' => $hash,
]);

audit_log('setup.create_admin', ['email' => $email], (int) $pdo->lastInsertId());

json_response(['ok' => true, 'data' => ['email' => $email, 'name' => $name, 'role' => 'owner']]);
