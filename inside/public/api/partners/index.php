<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require dirname(__DIR__) . '/lib/partners.php';

$user = require_auth();
$pdo = require_db();

try {
    partners_ensure_schema($pdo);
    partners_seed_defaults($pdo);

    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        json_response(['ok' => true, 'data' => partners_rows($pdo, false)]);
    }

    require_method('POST');

    $partnerKey = trim((string) ($_POST['partner_key'] ?? ''));
    if ($partnerKey === '') {
        json_response(['ok' => false, 'error' => 'Partner fehlt.'], 422);
    }

    $name = trim((string) ($_POST['name'] ?? ''));
    $text = trim((string) ($_POST['text'] ?? ''));
    $websiteUrl = trim((string) ($_POST['website_url'] ?? ''));
    $sortOrder = (int) ($_POST['sort_order'] ?? 0);
    $active = (int) ($_POST['active'] ?? 1) === 1 ? 1 : 0;

    if ($name === '') {
        json_response(['ok' => false, 'error' => 'Name fehlt.'], 422);
    }
    if ($text === '') {
        json_response(['ok' => false, 'error' => 'Text fehlt.'], 422);
    }
    if (partners_text_length($text) > PARTNER_TEXT_MAX_LENGTH) {
        json_response(['ok' => false, 'error' => 'Beschreibungstext darf maximal 175 Zeichen lang sein.'], 422);
    }
    $text = partners_limit_text($text);

    $imageUrl = '';
    $file = $_FILES['image'] ?? null;
    if (is_array($file)) {
        $imageUrl = partners_store_uploaded_image($file);
    }

    $existingStmt = $pdo->prepare('SELECT image_url FROM website_partners WHERE partner_key = :partner_key LIMIT 1');
    $existingStmt->execute([':partner_key' => $partnerKey]);
    $existingImage = (string) ($existingStmt->fetchColumn() ?: '');

    $stmt = $pdo->prepare(
        'INSERT INTO website_partners
            (partner_key, name, text, image_url, website_url, sort_order, active, updated_by, created_at, updated_at)
         VALUES
            (:partner_key, :name, :text, :image_url, :website_url, :sort_order, :active, :updated_by, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            text = VALUES(text),
            image_url = VALUES(image_url),
            website_url = VALUES(website_url),
            sort_order = VALUES(sort_order),
            active = VALUES(active),
            updated_by = VALUES(updated_by),
            updated_at = NOW()'
    );
    $stmt->execute([
        ':partner_key' => $partnerKey,
        ':name' => $name,
        ':text' => $text,
        ':image_url' => $imageUrl !== '' ? $imageUrl : ($existingImage !== '' ? $existingImage : null),
        ':website_url' => $websiteUrl !== '' ? $websiteUrl : null,
        ':sort_order' => $sortOrder,
        ':active' => $active,
        ':updated_by' => (int) $user['id'],
    ]);

    partners_export_public($pdo);
    audit_log('partners.update', ['partner_key' => $partnerKey, 'image_uploaded' => $imageUrl !== ''], (int) $user['id']);

    json_response(['ok' => true, 'data' => partners_rows($pdo, false)]);
} catch (Throwable $error) {
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}
