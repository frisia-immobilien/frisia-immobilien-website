<?php

declare(strict_types=1);

const FRISIA_INSIDE_VERSION = '0.1.0';

function inside_config(): array
{
    static $config = null;
    if (is_array($config)) {
        return $config;
    }

    $path = dirname(__DIR__) . '/private/config.php';
    if (!is_file($path)) {
        $config = [
            'app' => [
                'name' => 'Frisia Inside',
                'session_name' => 'FRISIA_INSIDE',
                'base_url' => '',
                'setup_token' => '',
                'cron_token' => '',
            ],
            'db' => [
                'dsn' => '',
                'user' => '',
                'password' => '',
            ],
            'openai' => [
                'api_key' => '',
                'model' => 'gpt-5.4-mini',
            ],
            'integrations' => [],
        ];
        return $config;
    }

    $loaded = require $path;
    $config = is_array($loaded) ? $loaded : [];
    return $config;
}

function config_loaded(): bool
{
    return is_file(dirname(__DIR__) . '/private/config.php');
}

function start_inside_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $config = inside_config();
    $name = $config['app']['session_name'] ?? 'FRISIA_INSIDE';
    session_name($name);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function db(): ?PDO
{
    static $pdo = null;
    static $failed = false;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    if ($failed) {
        return null;
    }

    $config = inside_config();
    $db = $config['db'] ?? [];
    if (empty($db['dsn']) || empty($db['user'])) {
        $failed = true;
        return null;
    }

    try {
        $pdo = new PDO((string) $db['dsn'], (string) $db['user'], (string) ($db['password'] ?? ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (Throwable $error) {
        $GLOBALS['inside_db_last_error'] = $error->getMessage();
        $failed = true;
        return null;
    }
}

function db_last_error(): ?string
{
    return isset($GLOBALS['inside_db_last_error']) ? (string) $GLOBALS['inside_db_last_error'] : null;
}

function require_db(): PDO
{
    $pdo = db();
    if (!$pdo) {
        json_response(['ok' => false, 'error' => 'Datenbank ist nicht konfiguriert oder nicht erreichbar.'], 503);
    }
    return $pdo;
}

function current_user(): ?array
{
    start_inside_session();
    if (empty($_SESSION['inside_user']) || !is_array($_SESSION['inside_user'])) {
        return null;
    }
    return $_SESSION['inside_user'];
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        json_response(['ok' => false, 'error' => 'Nicht angemeldet.'], 401);
    }
    return $user;
}

function require_method(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== strtoupper($method)) {
        json_response(['ok' => false, 'error' => 'Methode nicht erlaubt.'], 405);
    }
}

function audit_log(string $action, array $details = [], ?int $userId = null): void
{
    $pdo = db();
    if (!$pdo) {
        return;
    }
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO inside_audit_log (user_id, action, details_json, ip_address, user_agent, created_at)
             VALUES (:user_id, :action, :details_json, :ip_address, :user_agent, NOW())'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':action' => $action,
            ':details_json' => json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            ':user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
        ]);
    } catch (Throwable) {
        return;
    }
}

function next_run_at(string $recurrence, ?DateTimeImmutable $from = null): ?string
{
    $from = $from ?: new DateTimeImmutable('now');
    $next = match ($recurrence) {
        'once' => null,
        'weekly' => $from->modify('+1 week'),
        'every_4_weeks' => $from->modify('+4 weeks'),
        'monthly' => $from->modify('+1 month'),
        'quarterly' => $from->modify('+3 months'),
        default => $from->modify('+1 week'),
    };
    return $next ? $next->format('Y-m-d H:i:s') : null;
}

function cron_authorized(): bool
{
    $config = inside_config();
    $expected = (string) ($config['app']['cron_token'] ?? '');
    $provided = (string) ($_GET['token'] ?? ($_SERVER['HTTP_X_CRON_TOKEN'] ?? ''));
    return $expected !== '' && hash_equals($expected, $provided);
}

function setup_authorized(): bool
{
    $config = inside_config();
    $expected = (string) ($config['app']['setup_token'] ?? '');
    $provided = (string) ($_GET['token'] ?? ($_SERVER['HTTP_X_SETUP_TOKEN'] ?? ''));
    return $expected !== '' && hash_equals($expected, $provided);
}

function split_sql_statements(string $sql): array
{
    $statements = [];
    $buffer = '';
    $inString = null;
    $length = strlen($sql);

    for ($i = 0; $i < $length; $i++) {
        $char = $sql[$i];
        $next = $i + 1 < $length ? $sql[$i + 1] : '';

        if ($inString === null && $char === '-' && $next === '-') {
            while ($i < $length && $sql[$i] !== "\n") {
                $i++;
            }
            continue;
        }

        if ($inString === null && $char === '/' && $next === '*') {
            $i += 2;
            while ($i < $length - 1 && !($sql[$i] === '*' && $sql[$i + 1] === '/')) {
                $i++;
            }
            $i++;
            continue;
        }

        if (($char === "'" || $char === '"') && ($i === 0 || $sql[$i - 1] !== '\\')) {
            if ($inString === null) {
                $inString = $char;
            } elseif ($inString === $char) {
                $inString = null;
            }
        }

        if ($char === ';' && $inString === null) {
            $statement = trim($buffer);
            if ($statement !== '') {
                $statements[] = $statement;
            }
            $buffer = '';
            continue;
        }

        $buffer .= $char;
    }

    $statement = trim($buffer);
    if ($statement !== '') {
        $statements[] = $statement;
    }

    return $statements;
}
