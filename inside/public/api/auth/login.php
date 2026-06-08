<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');
start_inside_session();

$body = read_json_body();
$email = strtolower(trim((string) ($body['email'] ?? '')));
$password = (string) ($body['password'] ?? '');

if ($email === '' || $password === '') {
    json_response(['ok' => false, 'error' => 'E-Mail und Passwort sind erforderlich.'], 422);
}

$pdo = require_db();
$stmt = $pdo->prepare(
    'SELECT id, email, name, role, password_hash, active
     FROM inside_users
     WHERE email = :email
     LIMIT 1'
);
$stmt->execute([':email' => $email]);
$record = $stmt->fetch();

if (!$record || !(int) $record['active'] || !password_verify($password, (string) $record['password_hash'])) {
    audit_log('auth.login_failed', ['email' => $email]);
    json_response(['ok' => false, 'error' => 'Login fehlgeschlagen.'], 401);
}

$user = [
    'id' => (int) $record['id'],
    'email' => (string) $record['email'],
    'name' => (string) $record['name'],
    'role' => (string) $record['role'],
];

session_regenerate_id(true);
$_SESSION['inside_user'] = $user;

$pdo->prepare('UPDATE inside_users SET last_login_at = NOW() WHERE id = :id')->execute([':id' => $user['id']]);
audit_log('auth.login', [], $user['id']);

json_response(['ok' => true, 'data' => $user]);
