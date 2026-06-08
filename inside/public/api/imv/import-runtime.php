<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/imv.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();
imv_ensure_tables($pdo);

$path = imv_runtime_import_path();
if (!is_file($path)) {
    json_response(['ok' => false, 'error' => 'Runtime-Marktdaten wurden auf dem Server nicht gefunden.'], 404);
}

$payload = json_decode((string) file_get_contents($path), true);
$records = is_array($payload['records'] ?? null) ? $payload['records'] : [];

$stmt = $pdo->prepare(
    'INSERT INTO imv_market_records
       (
         source_record_key,
         region_code,
         location_slug,
         location_label,
         location_type,
         landkreis,
         stadt_gemeinde,
         ortsteil,
         object_type,
         plz,
         leadgen_geeignet,
         landingpage_geeignet,
         verkaeufe_anzahl,
         median_preis_eur_m2,
         durchschnitt_preis_eur_m2,
         efh_median_preis_eur,
         tage_am_markt,
         auswertung_vom,
         quelle_pdf,
         raw_json,
         imported_at
       )
     VALUES
       (
         :source_record_key,
         :region_code,
         :location_slug,
         :location_label,
         :location_type,
         :landkreis,
         :stadt_gemeinde,
         :ortsteil,
         :object_type,
         :plz,
         :leadgen_geeignet,
         :landingpage_geeignet,
         :verkaeufe_anzahl,
         :median_preis_eur_m2,
         :durchschnitt_preis_eur_m2,
         :efh_median_preis_eur,
         :tage_am_markt,
         :auswertung_vom,
         :quelle_pdf,
         :raw_json,
         NOW()
       )
     ON DUPLICATE KEY UPDATE
       region_code = VALUES(region_code),
       location_slug = VALUES(location_slug),
       location_label = VALUES(location_label),
       location_type = VALUES(location_type),
       landkreis = VALUES(landkreis),
       stadt_gemeinde = VALUES(stadt_gemeinde),
       ortsteil = VALUES(ortsteil),
       object_type = VALUES(object_type),
       plz = VALUES(plz),
       leadgen_geeignet = VALUES(leadgen_geeignet),
       landingpage_geeignet = VALUES(landingpage_geeignet),
       verkaeufe_anzahl = VALUES(verkaeufe_anzahl),
       median_preis_eur_m2 = VALUES(median_preis_eur_m2),
       durchschnitt_preis_eur_m2 = VALUES(durchschnitt_preis_eur_m2),
       efh_median_preis_eur = VALUES(efh_median_preis_eur),
       tage_am_markt = VALUES(tage_am_markt),
       auswertung_vom = VALUES(auswertung_vom),
       quelle_pdf = VALUES(quelle_pdf),
       raw_json = VALUES(raw_json),
       imported_at = NOW()'
);

$imported = 0;
$pdo->beginTransaction();
try {
    foreach ($records as $record) {
        if (!is_array($record)) {
            continue;
        }
        $stmt->execute([
            ':source_record_key' => imv_record_key($record),
            ':region_code' => imv_string($record, 'region_code'),
            ':location_slug' => imv_location_slug($record),
            ':location_label' => imv_string($record, 'location_label'),
            ':location_type' => imv_string($record, 'datensatz_typ'),
            ':landkreis' => imv_string($record, 'landkreis'),
            ':stadt_gemeinde' => imv_string($record, 'stadt_gemeinde'),
            ':ortsteil' => imv_string($record, 'ortsteil'),
            ':object_type' => imv_object_type($record),
            ':plz' => imv_string($record, 'plz'),
            ':leadgen_geeignet' => imv_bool($record, 'leadgen_geeignet'),
            ':landingpage_geeignet' => imv_bool($record, 'landingpage_geeignet'),
            ':verkaeufe_anzahl' => imv_number($record, 'verkaeufe_anzahl'),
            ':median_preis_eur_m2' => imv_number($record, 'median_preis_eur_m2'),
            ':durchschnitt_preis_eur_m2' => imv_number($record, 'durchschnitt_preis_eur_m2'),
            ':efh_median_preis_eur' => imv_number($record, 'efh_median_preis_eur'),
            ':tage_am_markt' => imv_number($record, 'tage_am_markt'),
            ':auswertung_vom' => imv_string($record, 'auswertung_vom'),
            ':quelle_pdf' => imv_string($record, 'quelle_pdf'),
            ':raw_json' => json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
        $imported++;
    }
    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}

audit_log('imv.import_runtime', [
    'imported_records' => $imported,
    'source_file' => $payload['sourceFile'] ?? null,
    'generated_at' => $payload['generatedAt'] ?? null,
], (int) $user['id']);

json_response([
    'ok' => true,
    'data' => [
        'imported_records' => $imported,
        'source_file' => $payload['sourceFile'] ?? null,
        'generated_at' => $payload['generatedAt'] ?? null,
    ],
]);
