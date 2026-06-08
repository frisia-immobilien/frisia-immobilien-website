<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();

$file = $_FILES['image'] ?? null;
if (!is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    json_response(['ok' => false, 'error' => 'Bilddatei fehlt oder konnte nicht hochgeladen werden.'], 422);
}

$maxBytes = 12 * 1024 * 1024;
if ((int) $file['size'] > $maxBytes) {
    json_response(['ok' => false, 'error' => 'Bild ist groesser als 12 MB.'], 422);
}

$tmpName = (string) $file['tmp_name'];
$mime = mime_content_type($tmpName) ?: '';
$extensions = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];
if (!isset($extensions[$mime])) {
    json_response(['ok' => false, 'error' => 'Erlaubt sind JPG, PNG und WEBP.'], 422);
}

$publicRoot = dirname(__DIR__, 2);
$relativeDir = '/uploads/schaufenster';
$targetDir = $publicRoot . $relativeDir;
if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
    json_response(['ok' => false, 'error' => 'Upload-Verzeichnis konnte nicht angelegt werden.'], 500);
}

$fileName = 'schaufenster-' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $extensions[$mime];
$target = $targetDir . '/' . $fileName;
if (!move_uploaded_file($tmpName, $target)) {
    json_response(['ok' => false, 'error' => 'Bild konnte nicht gespeichert werden.'], 500);
}
chmod($target, 0644);

$title = trim((string) ($_POST['title'] ?? 'Frisia Immobilien'));
$linkUrl = trim((string) ($_POST['link_url'] ?? ''));

$stmt = $pdo->prepare(
    'INSERT INTO schaufenster_tv_slides (title, image_url, link_url, sort_order, active, uploaded_by, created_at, updated_at)
     VALUES (:title, :image_url, :link_url, 0, 1, :uploaded_by, NOW(), NOW())'
);
$stmt->execute([
    ':title' => $title !== '' ? $title : 'Frisia Immobilien',
    ':image_url' => $relativeDir . '/' . $fileName,
    ':link_url' => $linkUrl !== '' ? $linkUrl : null,
    ':uploaded_by' => (int) $user['id'],
]);

audit_log('schaufenster.upload_slide', ['image_url' => $relativeDir . '/' . $fileName], (int) $user['id']);

json_response(['ok' => true, 'data' => ['id' => (int) $pdo->lastInsertId(), 'image_url' => $relativeDir . '/' . $fileName]]);
