<?php

declare(strict_types=1);

const PARTNER_DEFAULT_TEXT = 'Partner im erweiterten Netzwerk von Frisia Immobilien. Details, Bild und Beschreibung koennen in Frisia Inside gepflegt werden.';
const PARTNER_TEXT_MAX_LENGTH = 175;

function partners_text_length(string $text): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($text, 'UTF-8');
    }

    return strlen($text);
}

function partners_limit_text(string $text): string
{
    $text = trim($text);
    if (partners_text_length($text) <= PARTNER_TEXT_MAX_LENGTH) {
        return $text;
    }

    if (function_exists('mb_substr')) {
        $excerpt = rtrim(mb_substr($text, 0, PARTNER_TEXT_MAX_LENGTH - 3, 'UTF-8'));
        $lastSpace = mb_strrpos($excerpt, ' ', 0, 'UTF-8');
        if ($lastSpace !== false && $lastSpace > 90) {
            $excerpt = rtrim(mb_substr($excerpt, 0, $lastSpace, 'UTF-8'));
        }
        return $excerpt . '...';
    }

    $excerpt = rtrim(substr($text, 0, PARTNER_TEXT_MAX_LENGTH - 3));
    $lastSpace = strrpos($excerpt, ' ');
    if ($lastSpace !== false && $lastSpace > 90) {
        $excerpt = rtrim(substr($excerpt, 0, $lastSpace));
    }
    return $excerpt . '...';
}

function partners_defaults(): array
{
    $partners = [
        [
            'partner_key' => 'immobilienscout24',
            'name' => 'ImmobilienScout24',
            'text' => 'ImmobilienScout24 zaehlt zu den reichweitenstarken Immobilienportalen und unterstuetzt die Sichtbarkeit ausgewaehlter Angebote.',
            'website_url' => '',
            'sort_order' => 10,
        ],
        [
            'partner_key' => 'kleinanzeigen',
            'name' => 'Kleinanzeigen',
            'text' => 'Kleinanzeigen ergaenzt die regionale Reichweite fuer Immobilien, Gesuche und relevante Kontakte im lokalen Markt.',
            'website_url' => '',
            'sort_order' => 20,
        ],
        [
            'partner_key' => 'garten-reuter',
            'name' => 'Garten Reuter',
            'text' => 'Garten Reuter steht fuer gepflegte Aussenbereiche und praktische Umsetzung rund um Garten, Grundstueck und Erscheinungsbild.',
            'website_url' => '',
            'sort_order' => 30,
        ],
        [
            'partner_key' => '1a-immobilien',
            'name' => '1A Immobilien',
            'text' => '1A Immobilien ist ein weiterer Vermarktungskanal im Netzwerk fuer Sichtbarkeit und Immobilieninteresse.',
            'website_url' => '',
            'sort_order' => 40,
        ],
        [
            'partner_key' => 'ruempelmeister',
            'name' => 'Ruempelmeister',
            'text' => 'Ruempelmeister unterstuetzt, wenn Immobilien vor Verkauf, Uebergabe oder Neuordnung vorbereitet werden muessen.',
            'website_url' => '',
            'sort_order' => 50,
        ],
        [
            'partner_key' => '11880',
            'name' => '11880',
            'text' => '11880 unterstuetzt die Auffindbarkeit von Unternehmen und Dienstleistungen im regionalen Umfeld.',
            'website_url' => '',
            'sort_order' => 60,
        ],
        [
            'partner_key' => 'gelbe-seiten',
            'name' => 'Gelbe Seiten',
            'text' => 'Gelbe Seiten ist ein etablierter Verzeichnisdienst fuer regionale Sichtbarkeit und Kontaktsuche.',
            'website_url' => '',
            'sort_order' => 70,
        ],
        [
            'partner_key' => 'decker-bau',
            'name' => 'Decker Bau',
            'text' => 'Decker Bau steht im Netzwerk fuer bauliche Expertise und praktische Einordnung rund um Immobilien und Projekte.',
            'website_url' => '',
            'sort_order' => 80,
        ],
        [
            'partner_key' => 'eilers-gutachten',
            'name' => 'Eilers Gutachten',
            'text' => 'Eilers Gutachten ergaenzt das Netzwerk mit fachlicher Bewertungskompetenz und sachverstaendiger Einordnung.',
            'website_url' => 'https://eilers-gutachten.de/',
            'sort_order' => 90,
        ],
        [
            'partner_key' => 'winterhoff-buss-notariat',
            'name' => 'Winterhoff Buss Notariat',
            'text' => 'Winterhoff Buss Notariat begleitet notarielle Vorgaenge, wenn ein Immobilienverkauf rechtlich sauber abgeschlossen wird.',
            'website_url' => '',
            'sort_order' => 100,
        ],
    ];

    for ($index = 11; $index <= 25; $index++) {
        $partners[] = [
            'partner_key' => 'partner-' . $index,
            'name' => 'Partner ' . $index,
            'text' => PARTNER_DEFAULT_TEXT,
            'website_url' => '',
            'sort_order' => $index * 10,
            'active' => false,
        ];
    }

    return $partners;
}

function partners_ensure_schema(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS website_partners (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            partner_key VARCHAR(120) NOT NULL UNIQUE,
            name VARCHAR(190) NOT NULL,
            text TEXT NOT NULL,
            image_url VARCHAR(900) NULL,
            website_url VARCHAR(900) NULL,
            sort_order INT NOT NULL DEFAULT 0,
            active TINYINT(1) NOT NULL DEFAULT 1,
            updated_by BIGINT UNSIGNED NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            INDEX idx_website_partners_active (active, sort_order),
            CONSTRAINT fk_website_partner_user FOREIGN KEY (updated_by) REFERENCES inside_users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function partners_seed_defaults(PDO $pdo): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO website_partners
            (partner_key, name, text, website_url, sort_order, active, created_at, updated_at)
         VALUES
            (:partner_key, :name, :text, :website_url, :sort_order, :active, NOW(), NOW())
         ON DUPLICATE KEY UPDATE partner_key = partner_key'
    );

    foreach (partners_defaults() as $partner) {
        $stmt->execute([
            ':partner_key' => $partner['partner_key'],
            ':name' => $partner['name'],
            ':text' => $partner['text'],
            ':website_url' => $partner['website_url'] !== '' ? $partner['website_url'] : null,
            ':sort_order' => $partner['sort_order'],
            ':active' => !empty($partner['active']) || !array_key_exists('active', $partner) ? 1 : 0,
        ]);
    }
}

function partners_rows(PDO $pdo, bool $publicOnly = false): array
{
    partners_ensure_schema($pdo);
    partners_seed_defaults($pdo);

    $where = $publicOnly ? 'WHERE active = 1' : '';
    $stmt = $pdo->query(
        "SELECT *
         FROM website_partners
         {$where}
         ORDER BY sort_order ASC, name ASC"
    );

    return array_map('partners_map_row', $stmt->fetchAll());
}

function partners_map_row(array $row): array
{
    return [
        'id' => (int) ($row['id'] ?? 0),
        'key' => (string) ($row['partner_key'] ?? ''),
        'partner_key' => (string) ($row['partner_key'] ?? ''),
        'name' => (string) ($row['name'] ?? ''),
        'text' => partners_limit_text((string) ($row['text'] ?? PARTNER_DEFAULT_TEXT)),
        'image_url' => (string) ($row['image_url'] ?? ''),
        'website_url' => (string) ($row['website_url'] ?? ''),
        'sort_order' => (int) ($row['sort_order'] ?? 0),
        'active' => (bool) ((int) ($row['active'] ?? 1)),
        'updated_at' => (string) ($row['updated_at'] ?? ''),
    ];
}

function partners_public_base_url(): string
{
    $config = inside_config();
    $configured = trim((string) ($config['app']['base_url'] ?? ''));
    if ($configured !== '') {
        return rtrim($configured, '/');
    }

    $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
    if ($host === '') {
        return '';
    }
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    return $scheme . '://' . $host;
}

function partners_for_public(array $rows, bool $absoluteImages = false): array
{
    $baseUrl = $absoluteImages ? partners_public_base_url() : '';

    return array_map(static function (array $row) use ($baseUrl): array {
        $imageUrl = (string) ($row['image_url'] ?? '');
        if ($baseUrl !== '' && str_starts_with($imageUrl, '/')) {
            $imageUrl = $baseUrl . $imageUrl;
        }

        return [
            'key' => (string) ($row['partner_key'] ?? $row['key'] ?? ''),
            'name' => (string) ($row['name'] ?? ''),
            'text' => partners_limit_text((string) ($row['text'] ?? PARTNER_DEFAULT_TEXT)),
            'image_url' => $imageUrl,
            'website_url' => (string) ($row['website_url'] ?? ''),
            'sort_order' => (int) ($row['sort_order'] ?? 0),
            'active' => (bool) ($row['active'] ?? true),
        ];
    }, $rows);
}

function partners_export_public(PDO $pdo): array
{
    $rows = partners_rows($pdo, true);
    $payload = [
        'ok' => true,
        'generated_at' => date('c'),
        'partners' => partners_for_public($rows, false),
    ];

    $publicRoot = dirname(__DIR__, 2);
    $targetDir = $publicRoot . '/storage/partners';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    file_put_contents(
        $targetDir . '/public.json',
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
    );

    return $payload;
}

function partners_mirror_upload_to_web(string $sourcePath, string $relativeDir, string $fileName): void
{
    $repoRoot = dirname(__DIR__, 4);
    $webPublic = $repoRoot . '/web/public';
    if (!is_dir($webPublic)) {
        return;
    }

    $targetDir = $webPublic . $relativeDir;
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
        return;
    }

    @copy($sourcePath, $targetDir . '/' . $fileName);
}

function partners_store_uploaded_image(array $file): string
{
    if ((int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return '';
    }

    if ((int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        json_response(['ok' => false, 'error' => 'Bilddatei konnte nicht hochgeladen werden.'], 422);
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
    $relativeDir = '/uploads/partners';
    $targetDir = $publicRoot . $relativeDir;
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
        json_response(['ok' => false, 'error' => 'Upload-Verzeichnis konnte nicht angelegt werden.'], 500);
    }

    $fileName = 'partner-' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $extensions[$mime];
    $target = $targetDir . '/' . $fileName;
    if (!move_uploaded_file($tmpName, $target)) {
        json_response(['ok' => false, 'error' => 'Bild konnte nicht gespeichert werden.'], 500);
    }
    chmod($target, 0644);
    partners_mirror_upload_to_web($target, $relativeDir, $fileName);

    return $relativeDir . '/' . $fileName;
}
