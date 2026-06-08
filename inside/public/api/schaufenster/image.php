<?php

declare(strict_types=1);

$url = trim((string) ($_GET['url'] ?? ''));
$parts = parse_url($url);
$host = is_array($parts) ? mb_strtolower((string) ($parts['host'] ?? ''), 'UTF-8') : '';
$scheme = is_array($parts) ? mb_strtolower((string) ($parts['scheme'] ?? ''), 'UTF-8') : '';

if ($url === '' || $scheme !== 'https' || $host !== 'images.propstack.de') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Forbidden';
    exit;
}

$path = is_array($parts) ? (string) ($parts['path'] ?? '') : '';
$extension = mb_strtolower(pathinfo($path, PATHINFO_EXTENSION), 'UTF-8');
$extension = in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true) ? $extension : 'jpg';
$cacheDir = dirname(__DIR__, 2) . '/storage/schaufenster-image-cache';
$cacheFile = $cacheDir . '/' . hash('sha256', $url) . '.' . $extension;
$maxAge = 60 * 60 * 24 * 7;

if (is_file($cacheFile) && filemtime($cacheFile) !== false && (time() - (int) filemtime($cacheFile)) < $maxAge) {
    serve_image($cacheFile, $maxAge);
}

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0775, true);
}

[$body, $contentType] = fetch_remote_image($url);
if ($body === '' || !str_starts_with($contentType, 'image/')) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Image unavailable';
    exit;
}

if (is_dir($cacheDir) && is_writable($cacheDir)) {
    @file_put_contents($cacheFile, $body, LOCK_EX);
}

header('Content-Type: ' . $contentType);
header('Cache-Control: public, max-age=' . $maxAge . ', immutable');
header('Content-Length: ' . strlen($body));
echo $body;

function fetch_remote_image(string $url): array
{
    if (function_exists('curl_init')) {
        $handle = curl_init($url);
        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_USERAGENT => 'FrisiaInsideSchaufensterTV/1.0',
        ]);
        $body = curl_exec($handle);
        $contentType = (string) curl_getinfo($handle, CURLINFO_CONTENT_TYPE);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        curl_close($handle);

        return $status >= 200 && $status < 300 && is_string($body)
            ? [$body, normalize_image_content_type($contentType)]
            : ['', ''];
    }

    $context = stream_context_create([
        'http' => [
            'timeout' => 20,
            'user_agent' => 'FrisiaInsideSchaufensterTV/1.0',
        ],
    ]);
    $body = @file_get_contents($url, false, $context);
    $contentType = '';
    foreach ($http_response_header ?? [] as $header) {
        if (stripos($header, 'Content-Type:') === 0) {
            $contentType = trim(substr($header, 13));
            break;
        }
    }

    return is_string($body) ? [$body, normalize_image_content_type($contentType)] : ['', ''];
}

function normalize_image_content_type(string $contentType): string
{
    $contentType = mb_strtolower(trim(explode(';', $contentType)[0] ?? ''), 'UTF-8');
    return in_array($contentType, ['image/jpeg', 'image/png', 'image/webp'], true) ? $contentType : 'image/jpeg';
}

function serve_image(string $path, int $maxAge): never
{
    $extension = mb_strtolower(pathinfo($path, PATHINFO_EXTENSION), 'UTF-8');
    $contentType = match ($extension) {
        'png' => 'image/png',
        'webp' => 'image/webp',
        default => 'image/jpeg',
    };

    header('Content-Type: ' . $contentType);
    header('Cache-Control: public, max-age=' . $maxAge . ', immutable');
    header('Content-Length: ' . (string) filesize($path));
    readfile($path);
    exit;
}
