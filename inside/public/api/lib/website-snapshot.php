<?php

declare(strict_types=1);

const WEBSITE_SNAPSHOT_MIN_MARKET_RECORDS = 1000;
const WEBSITE_SNAPSHOT_MIN_LOCATION_RECORDS = 500;

function website_snapshot_ensure_schema(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS website_snapshots (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          version_key VARCHAR(80) NOT NULL UNIQUE,
          source_type VARCHAR(80) NOT NULL,
          market_record_count INT NOT NULL DEFAULT 0,
          website_location_count INT NOT NULL DEFAULT 0,
          house_price_count INT NOT NULL DEFAULT 0,
          apartment_price_count INT NOT NULL DEFAULT 0,
          checksum_sha256 VARCHAR(64) NOT NULL,
          manifest_json JSON NOT NULL,
          active TINYINT(1) NOT NULL DEFAULT 0,
          status ENUM("created", "rejected") NOT NULL DEFAULT "created",
          created_by BIGINT UNSIGNED NULL,
          activated_by BIGINT UNSIGNED NULL,
          published_at DATETIME NULL,
          created_at DATETIME NOT NULL,
          INDEX idx_website_snapshots_created (created_at),
          INDEX idx_website_snapshots_status (status),
          INDEX idx_website_snapshots_active (active, created_at),
          CONSTRAINT fk_website_snapshot_user FOREIGN KEY (created_by) REFERENCES inside_users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    website_snapshot_ensure_column($pdo, 'active', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER manifest_json');
    website_snapshot_ensure_column($pdo, 'activated_by', 'BIGINT UNSIGNED NULL AFTER created_by');
    website_snapshot_ensure_column($pdo, 'published_at', 'DATETIME NULL AFTER activated_by');
    website_snapshot_ensure_index($pdo, 'idx_website_snapshots_active', 'CREATE INDEX idx_website_snapshots_active ON website_snapshots (active, created_at)');
}

function website_snapshot_storage_root(): string
{
    return dirname(__DIR__, 2) . '/storage/website-snapshot';
}

function website_snapshot_ensure_column(PDO $pdo, string $column, string $definition): void
{
    $stmt = $pdo->prepare('SHOW COLUMNS FROM website_snapshots LIKE :column_name');
    $stmt->execute([':column_name' => $column]);
    if ($stmt->fetch()) {
        return;
    }

    $pdo->exec('ALTER TABLE website_snapshots ADD COLUMN ' . $column . ' ' . $definition);
}

function website_snapshot_ensure_index(PDO $pdo, string $indexName, string $createSql): void
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table_name
           AND INDEX_NAME = :index_name'
    );
    $stmt->execute([
        ':table_name' => 'website_snapshots',
        ':index_name' => $indexName,
    ]);
    if ((int) $stmt->fetchColumn() > 0) {
        return;
    }

    $pdo->exec($createSql);
}

function website_snapshot_version_dir(string $version): string
{
    return website_snapshot_storage_root() . '/versions/' . basename($version);
}

function website_snapshot_active_marker_path(): string
{
    return website_snapshot_storage_root() . '/active-snapshot.json';
}

function website_snapshot_active_marker(): array
{
    return website_snapshot_decode_json_file(website_snapshot_active_marker_path());
}

function website_snapshot_decode_json_file(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $payload = json_decode((string) file_get_contents($path), true);
    return is_array($payload) ? $payload : [];
}

function website_snapshot_decode_raw(mixed $raw): array
{
    if (is_array($raw)) {
        return $raw;
    }

    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function website_snapshot_bool(mixed $value): bool
{
    if (is_bool($value)) {
        return $value;
    }
    if (is_numeric($value)) {
        return (int) $value === 1;
    }
    if (is_string($value)) {
        return in_array(strtolower(trim($value)), ['1', 'true', 'ja', 'yes'], true);
    }
    return false;
}

function website_snapshot_number(mixed $value): ?float
{
    if (is_int($value) || is_float($value)) {
        return is_finite((float) $value) ? (float) $value : null;
    }
    if (!is_string($value)) {
        return null;
    }

    $normalized = str_replace(',', '.', trim($value));
    if ($normalized === '' || !is_numeric($normalized)) {
        return null;
    }

    return (float) $normalized;
}

function website_snapshot_object_type(array $record): string
{
    $objectType = strtolower(trim((string) ($record['object_type'] ?? '')));
    if ($objectType === 'haus' || $objectType === 'wohnung') {
        return $objectType;
    }

    $label = strtolower((string) ($record['objektart'] ?? ''));
    if (str_contains($label, 'wohnung')) {
        return 'wohnung';
    }
    if (str_contains($label, 'haus')) {
        return 'haus';
    }

    return $objectType;
}

function website_snapshot_market_records_from_db(PDO $pdo): array
{
    $stmt = $pdo->query(
        'SELECT raw_json
         FROM imv_market_records
         ORDER BY COALESCE(location_slug, ""), COALESCE(object_type, ""), id'
    );

    $records = [];
    foreach ($stmt->fetchAll() as $row) {
        $record = website_snapshot_decode_raw($row['raw_json'] ?? null);
        if ($record !== []) {
            $records[] = $record;
        }
    }

    return $records;
}

function website_snapshot_locations_from_db(PDO $pdo): array
{
    $stmt = $pdo->query(
        'SELECT raw_json
         FROM imv_website_locations
         ORDER BY location_slug'
    );

    $locations = [];
    foreach ($stmt->fetchAll() as $row) {
        $location = website_snapshot_decode_raw($row['raw_json'] ?? null);
        if ($location !== []) {
            $locations[] = $location;
        }
    }

    return $locations;
}

function website_snapshot_market_records_from_import(): array
{
    $payload = website_snapshot_decode_json_file(imv_runtime_import_path());
    return is_array($payload['records'] ?? null) ? $payload['records'] : [];
}

function website_snapshot_locations_from_import(): array
{
    $payload = website_snapshot_decode_json_file(imv_website_locations_import_path());
    return is_array($payload['locations'] ?? null) ? $payload['locations'] : [];
}

function website_snapshot_validation(array $marketRecords, array $locations): array
{
    $errors = [];
    $warnings = [];
    $housePriceCount = 0;
    $apartmentPriceCount = 0;
    $slugErrors = 0;

    foreach ($marketRecords as $record) {
        if (!is_array($record)) {
            continue;
        }

        $hasSlug = trim((string) ($record['ortsteil_slug'] ?? '')) !== ''
            || trim((string) ($record['stadt_gemeinde_slug'] ?? '')) !== ''
            || trim((string) ($record['landkreis_slug'] ?? '')) !== ''
            || trim((string) ($record['region_slug'] ?? '')) !== ''
            || trim((string) ($record['location_slug'] ?? '')) !== '';
        if (!$hasSlug) {
            $slugErrors++;
        }

        $price = website_snapshot_number($record['median_preis_eur_m2'] ?? null)
            ?? website_snapshot_number($record['durchschnitt_preis_eur_m2'] ?? null);
        if ($price === null || $price <= 0) {
            continue;
        }

        if (website_snapshot_object_type($record) === 'haus') {
            $housePriceCount++;
        }
        if (website_snapshot_object_type($record) === 'wohnung') {
            $apartmentPriceCount++;
        }
    }

    if (count($marketRecords) < WEBSITE_SNAPSHOT_MIN_MARKET_RECORDS) {
        $errors[] = 'Zu wenige Marktdatensaetze fuer einen Website-Snapshot.';
    }
    if (count($locations) < WEBSITE_SNAPSHOT_MIN_LOCATION_RECORDS) {
        $errors[] = 'Zu wenige Website-Orte fuer einen Website-Snapshot.';
    }
    if ($housePriceCount === 0) {
        $errors[] = 'Keine Hauspreis-Datensaetze mit Preis vorhanden.';
    }
    if ($apartmentPriceCount === 0) {
        $errors[] = 'Keine Wohnungspreis-Datensaetze mit Preis vorhanden.';
    }
    if ($slugErrors > 0) {
        $warnings[] = $slugErrors . ' Marktdatensatz/Marktdatensaetze ohne oeffentlichen Slug.';
    }

    return [
        'ok' => count($errors) === 0,
        'errors' => $errors,
        'warnings' => $warnings,
        'market_record_count' => count($marketRecords),
        'website_location_count' => count($locations),
        'house_price_count' => $housePriceCount,
        'apartment_price_count' => $apartmentPriceCount,
    ];
}

function website_snapshot_atomic_write(string $path, string $contents): void
{
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Snapshot-Verzeichnis konnte nicht angelegt werden: ' . $dir);
    }

    $tmp = $path . '.tmp';
    if (file_put_contents($tmp, $contents, LOCK_EX) === false) {
        throw new RuntimeException('Snapshot-Datei konnte nicht geschrieben werden: ' . $path);
    }
    chmod($tmp, 0644);
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        throw new RuntimeException('Snapshot-Datei konnte nicht aktiviert werden: ' . $path);
    }
}

function website_snapshot_json(array $payload): string
{
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if (!is_string($json)) {
        throw new RuntimeException('Snapshot-JSON konnte nicht erzeugt werden.');
    }

    return $json . "\n";
}

function website_snapshot_activate(PDO $pdo, string $version, int $userId, string $reason = 'publish'): array
{
    website_snapshot_ensure_schema($pdo);

    $stmt = $pdo->prepare(
        'SELECT version_key, status, manifest_json
         FROM website_snapshots
         WHERE version_key = :version_key
         LIMIT 1'
    );
    $stmt->execute([':version_key' => $version]);
    $row = $stmt->fetch();
    if (!$row) {
        throw new RuntimeException('Snapshot-Version wurde nicht gefunden.');
    }
    if ((string) ($row['status'] ?? '') === 'rejected') {
        throw new RuntimeException('Abgelehnte Snapshots koennen nicht aktiviert werden.');
    }

    $versionDir = website_snapshot_version_dir($version);
    $files = ['leadgen_market_data.json', 'website_locations.json', 'manifest.json'];
    foreach ($files as $fileName) {
        if (!is_file($versionDir . '/' . $fileName)) {
            throw new RuntimeException('Snapshot-Datei fehlt: ' . $fileName);
        }
    }

    $manifest = website_snapshot_decode_raw($row['manifest_json'] ?? null);
    $root = website_snapshot_storage_root();
    foreach ($files as $fileName) {
        $contents = (string) file_get_contents($versionDir . '/' . $fileName);
        website_snapshot_atomic_write($root . '/' . $fileName, $contents);
    }

    $pdo->beginTransaction();
    try {
        $pdo->exec('UPDATE website_snapshots SET active = 0');
        $activateStmt = $pdo->prepare(
            'UPDATE website_snapshots
             SET active = 1, activated_by = :activated_by, published_at = NOW()
             WHERE version_key = :version_key'
        );
        $activateStmt->execute([
            ':activated_by' => $userId,
            ':version_key' => $version,
        ]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }

    $marker = [
        'active_snapshot' => $version,
        'activated_at' => date('c'),
        'activated_by' => $userId,
        'reason' => $reason,
        'checksum_sha256' => (string) ($manifest['checksum_sha256'] ?? ''),
        'counts' => $manifest['counts'] ?? [],
    ];
    website_snapshot_atomic_write(website_snapshot_active_marker_path(), website_snapshot_json($marker));

    return [
        'marker' => $marker,
        'manifest' => $manifest,
    ];
}

function website_snapshot_history(PDO $pdo, int $limit = 30): array
{
    website_snapshot_ensure_schema($pdo);
    $limit = max(1, min(100, $limit));
    $stmt = $pdo->query(
        'SELECT version_key, source_type, market_record_count, website_location_count,
                house_price_count, apartment_price_count, checksum_sha256, manifest_json,
                status, active, created_at, published_at
         FROM website_snapshots
         ORDER BY created_at DESC
         LIMIT ' . $limit
    );

    $items = [];
    foreach ($stmt->fetchAll() as $row) {
        $manifest = website_snapshot_decode_raw($row['manifest_json'] ?? null);
        $validation = is_array($manifest['validation'] ?? null) ? $manifest['validation'] : [];
        $items[] = [
            'version' => (string) ($row['version_key'] ?? ''),
            'source_type' => (string) ($row['source_type'] ?? ''),
            'status' => (string) ($row['status'] ?? ''),
            'active' => (int) ($row['active'] ?? 0) === 1,
            'created_at' => (string) ($row['created_at'] ?? ''),
            'published_at' => $row['published_at'] ? (string) $row['published_at'] : null,
            'counts' => [
                'market_records' => (int) ($row['market_record_count'] ?? 0),
                'website_locations' => (int) ($row['website_location_count'] ?? 0),
                'house_price_records' => (int) ($row['house_price_count'] ?? 0),
                'apartment_price_records' => (int) ($row['apartment_price_count'] ?? 0),
            ],
            'checksum_sha256' => (string) ($row['checksum_sha256'] ?? ''),
            'validation' => [
                'ok' => (bool) ($validation['ok'] ?? ((string) ($row['status'] ?? '') !== 'rejected')),
                'errors' => array_values(is_array($validation['errors'] ?? null) ? $validation['errors'] : []),
                'warnings' => array_values(is_array($validation['warnings'] ?? null) ? $validation['warnings'] : []),
            ],
        ];
    }

    return [
        'active' => website_snapshot_active_marker(),
        'snapshots' => $items,
    ];
}

function website_snapshot_create(PDO $pdo, int $userId): array
{
    website_snapshot_ensure_schema($pdo);

    $sourceType = 'inside_database';
    $warnings = [];
    $marketRecords = website_snapshot_market_records_from_db($pdo);
    $locations = website_snapshot_locations_from_db($pdo);
    $validation = website_snapshot_validation($marketRecords, $locations);

    if (!$validation['ok']) {
        $fallbackMarketRecords = website_snapshot_market_records_from_import();
        $fallbackLocations = website_snapshot_locations_from_import();
        $fallbackValidation = website_snapshot_validation($fallbackMarketRecords, $fallbackLocations);
        if ($fallbackValidation['ok']) {
            $sourceType = 'packaged_runtime_fallback';
            $warnings[] = 'Inside-Datenbank war nicht vollstaendig genug. Snapshot wurde aus der zuletzt paketierten Runtime-Datei erzeugt.';
            $marketRecords = $fallbackMarketRecords;
            $locations = $fallbackLocations;
            $validation = $fallbackValidation;
        }
    }

    if (!$validation['ok']) {
        $manifest = [
            'ok' => false,
            'generated_at' => date('c'),
            'source_type' => $sourceType,
            'validation' => $validation,
        ];
        $stmt = $pdo->prepare(
            'INSERT INTO website_snapshots
              (version_key, source_type, market_record_count, website_location_count, house_price_count, apartment_price_count, checksum_sha256, manifest_json, status, active, created_by, created_at)
             VALUES
              (:version_key, :source_type, :market_record_count, :website_location_count, :house_price_count, :apartment_price_count, :checksum_sha256, :manifest_json, "rejected", 0, :created_by, NOW())'
        );
        $manifestJson = website_snapshot_json($manifest);
        $stmt->execute([
            ':version_key' => 'rejected-' . date('Ymd-His'),
            ':source_type' => $sourceType,
            ':market_record_count' => (int) $validation['market_record_count'],
            ':website_location_count' => (int) $validation['website_location_count'],
            ':house_price_count' => (int) $validation['house_price_count'],
            ':apartment_price_count' => (int) $validation['apartment_price_count'],
            ':checksum_sha256' => hash('sha256', $manifestJson),
            ':manifest_json' => $manifestJson,
            ':created_by' => $userId,
        ]);

        throw new RuntimeException(implode(' ', $validation['errors']));
    }

    $version = date('Ymd-His');
    $generatedAt = date('c');
    $marketPayload = [
        'generatedAt' => $generatedAt,
        'sourceFile' => 'frisia-inside-snapshot/' . $version . '/leadgen_market_data.json',
        'recordCount' => count($marketRecords),
        'records' => array_values($marketRecords),
    ];
    $locationsPayload = [
        'generatedAt' => $generatedAt,
        'sourceFile' => 'frisia-inside-snapshot/' . $version . '/website_locations.json',
        'locationCount' => count($locations),
        'locations' => array_values($locations),
    ];

    $marketJson = website_snapshot_json($marketPayload);
    $locationsJson = website_snapshot_json($locationsPayload);
    $checksum = hash('sha256', $marketJson . $locationsJson);
    $manifest = [
        'ok' => true,
        'version' => $version,
        'generated_at' => $generatedAt,
        'source_type' => $sourceType,
        'files' => [
            'leadgen_market_data' => 'leadgen_market_data.json',
            'website_locations' => 'website_locations.json',
        ],
        'counts' => [
            'market_records' => (int) $validation['market_record_count'],
            'website_locations' => (int) $validation['website_location_count'],
            'house_price_records' => (int) $validation['house_price_count'],
            'apartment_price_records' => (int) $validation['apartment_price_count'],
        ],
        'checksum_sha256' => $checksum,
        'validation' => [
            'ok' => true,
            'warnings' => array_values(array_merge($warnings, $validation['warnings'])),
        ],
    ];
    $manifestJson = website_snapshot_json($manifest);

    $root = website_snapshot_storage_root();
    $versionDir = $root . '/versions/' . $version;
    website_snapshot_atomic_write($versionDir . '/leadgen_market_data.json', $marketJson);
    website_snapshot_atomic_write($versionDir . '/website_locations.json', $locationsJson);
    website_snapshot_atomic_write($versionDir . '/manifest.json', $manifestJson);

    $stmt = $pdo->prepare(
        'INSERT INTO website_snapshots
          (version_key, source_type, market_record_count, website_location_count, house_price_count, apartment_price_count, checksum_sha256, manifest_json, status, active, created_by, created_at)
         VALUES
          (:version_key, :source_type, :market_record_count, :website_location_count, :house_price_count, :apartment_price_count, :checksum_sha256, :manifest_json, "created", 0, :created_by, NOW())'
    );
    $stmt->execute([
        ':version_key' => $version,
        ':source_type' => $sourceType,
        ':market_record_count' => (int) $validation['market_record_count'],
        ':website_location_count' => (int) $validation['website_location_count'],
        ':house_price_count' => (int) $validation['house_price_count'],
        ':apartment_price_count' => (int) $validation['apartment_price_count'],
        ':checksum_sha256' => $checksum,
        ':manifest_json' => $manifestJson,
        ':created_by' => $userId,
    ]);

    website_snapshot_activate($pdo, $version, $userId, 'publish');

    return $manifest;
}
