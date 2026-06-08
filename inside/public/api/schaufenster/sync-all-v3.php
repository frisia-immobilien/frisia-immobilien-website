<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require dirname(__DIR__) . '/lib/schaufenster.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();

function stv3_propstack_api_key(): string
{
    $config = inside_config();
    return trim((string) (($config['integrations'] ?? [])['propstack_api_key'] ?? ''));
}

function stv3_propstack_request(string $path, array $query = [], string $version = 'v2'): array
{
    $apiKey = stv3_propstack_api_key();
    if ($apiKey === '') {
        throw new RuntimeException('Propstack API-Key ist nicht konfiguriert.');
    }

    $baseUrl = $version === 'v1' ? 'https://api.propstack.de/v1' : 'https://api.propstack.de/v2';
    $url = rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
    $query = array_filter($query, static fn (mixed $value): bool => $value !== null && $value !== '');
    if ($query) {
        $url .= '?' . http_build_query($query);
    }

    $handle = curl_init($url);
    if (!$handle) {
        throw new RuntimeException('Propstack-Verbindung konnte nicht vorbereitet werden.');
    }

    $authHeader = $version === 'v1' ? 'X-API-KEY: ' . $apiKey : 'X-Api-Key: ' . $apiKey;
    curl_setopt_array($handle, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 45,
        CURLOPT_HTTPHEADER => ['Accept: application/json', $authHeader],
    ]);

    $body = curl_exec($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
    $error = curl_error($handle);
    curl_close($handle);

    if ($body === false || $error !== '') {
        throw new RuntimeException('Propstack-Verbindung fehlgeschlagen: ' . $error);
    }
    if ($status < 200 || $status >= 300) {
        throw new RuntimeException('Propstack API HTTP ' . $status . ' fuer ' . $path);
    }

    $decoded = json_decode((string) $body, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('Propstack API lieferte kein gueltiges JSON.');
    }

    return $decoded;
}

function stv3_propstack_items(array $response): array
{
    if (array_is_list($response)) {
        return $response;
    }
    if (isset($response['data']) && is_array($response['data'])) {
        return $response['data'];
    }
    if (isset($response['items']) && is_array($response['items'])) {
        return $response['items'];
    }
    return [];
}

function stv3_fetch_properties(int $maxPages = 12, int $perPage = 50): array
{
    $properties = [];
    for ($page = 1; $page <= $maxPages; $page++) {
        $response = stv3_propstack_request('/properties', [
            'per' => $perPage,
            'page' => $page,
            'sort_by' => 'updated_at',
            'order' => 'desc',
        ]);
        $items = stv3_propstack_items($response);
        foreach ($items as $item) {
            if (is_array($item)) {
                $properties[] = $item;
            }
        }
        if (count($items) < $perPage) {
            break;
        }
    }
    return $properties;
}

function stv3_fetch_unit_supplement(int $id): array
{
    try {
        return stv3_propstack_request('/units/' . $id, [], 'v1');
    } catch (Throwable) {
        return [];
    }
}

function stv3_fetch_brokers(): array
{
    try {
        $brokers = stv3_propstack_items(stv3_propstack_request('/brokers', [], 'v1'));
    } catch (Throwable) {
        return [];
    }

    $byId = [];
    foreach ($brokers as $broker) {
        if (!is_array($broker)) {
            continue;
        }
        $id = (int) ($broker['id'] ?? 0);
        if ($id > 0) {
            $byId[$id] = $broker;
        }
    }

    return $byId;
}

function stv3_label_key(string $value): string
{
    $key = preg_replace('/[\s\/-]+/', '_', trim($value)) ?? $value;
    $key = preg_replace('/__+/', '_', $key) ?? $key;
    return mb_strtoupper($key, 'UTF-8');
}

function stv3_property_type(array $property): string
{
    $value = st_normalize_text(st_first($property, ['rs_category', 'rs_type', 'object_type']));
    if ($value === '') {
        return 'Immobilie';
    }

    $labels = [
        'APARTMENT' => 'Wohnung',
        'HOUSE' => 'Haus',
        'SINGLE_FAMILY_HOUSE' => 'Einfamilienhaus',
        'MULTI_FAMILY_HOUSE' => 'Mehrfamilienhaus',
        'TWO_FAMILY_HOUSE' => 'Zweifamilienhaus',
        'TERRACE_HOUSE' => 'Reihenhaus',
        'SEMI_DETACHED_HOUSE' => 'Doppelhaushälfte',
        'BUNGALOW' => 'Bungalow',
        'VILLA' => 'Villa',
        'OFFICE' => 'Büro',
        'OFFICE_FLOOR' => 'Büroetage',
        'OFFICE_BUILDING' => 'Bürohaus',
        'OFFICE_CENTRE' => 'Bürozentrum',
        'OFFICE_STORAGE_BUILDING' => 'Büro- / Lagergebäude',
        'OFFICE_PRACTICE' => 'Büro / Praxis',
        'OFFICE_OR_PRACTICE' => 'Büro / Praxis',
        'PRACTICE' => 'Praxis',
        'SURGERY' => 'Praxis',
        'SURGERY_FLOOR' => 'Praxisetage',
        'SURGERY_BUILDING' => 'Praxishaus',
        'COMMERCIAL' => 'Gewerbe',
        'COMMERCIAL_PROPERTY' => 'Gewerbeimmobilie',
        'COMMERCIAL_BUILDING' => 'Geschäftshaus',
        'COMMERCIAL_CENTRE' => 'Gewerbezentrum',
        'LIVING_AND_COMMERCIAL_BUILDING' => 'Wohn- und Geschäftsgebäude',
        'OFFICE_AND_COMMERCIAL_BUILDING' => 'Büro- und Geschäftsgebäude',
        'RETAIL' => 'Einzelhandel',
        'SHOP' => 'Laden',
        'STORE' => 'Ladenlokal',
        'SALES_AREA' => 'Verkaufsfläche',
        'SHOP_SALES_FLOOR' => 'Laden / Verkaufsfläche',
        'SHOWROOM_SPACE' => 'Ausstellungsfläche',
        'GASTRONOMY' => 'Gastronomie',
        'HOTEL' => 'Hotel',
        'RESTAURANT' => 'Restaurant',
        'INDUSTRY' => 'Industrie',
        'HALL' => 'Halle',
        'HALL_STORAGE' => 'Halle / Logistik',
        'STORAGE' => 'Lager',
        'PRODUCTION' => 'Produktion',
        'INDUSTRIAL_PROPERTY' => 'Produktion / Fertigung',
        'INVESTMENT' => 'Kapitalanlage',
        'SPECIAL_PURPOSE' => 'Sonderimmobilie',
        'SITE' => 'Grundstück',
        'PLOT' => 'Grundstück',
        'RESIDENTIAL_PLOT' => 'Wohngrundstück',
        'COMMERCIAL_PLOT' => 'Gewerbegrundstück',
        'AGRICULTURAL_PLOT' => 'Landwirtschaftsfläche',
        'PARKING_SPACE' => 'Stellplatz',
        'GARAGE' => 'Garage',
        'NO_INFORMATION' => 'Keine Angabe',
        'OTHER' => 'Sonstige Immobilie',
    ];

    $key = stv3_label_key($value);
    if (isset($labels[$key])) {
        return $labels[$key];
    }

    return implode(' ', array_map(
        static fn (string $part): string => mb_convert_case($part, MB_CASE_TITLE, 'UTF-8'),
        array_filter(explode(' ', str_replace(['_', '-'], ' ', mb_strtolower($value, 'UTF-8'))))
    ));
}

function stv3_boolish(mixed $value): ?bool
{
    if (is_bool($value)) {
        return $value;
    }
    if (is_numeric($value)) {
        return (float) $value !== 0.0;
    }
    if (!is_string($value)) {
        return null;
    }

    $normalized = mb_strtolower(trim($value), 'UTF-8');
    if (in_array($normalized, ['1', 'true', 'yes', 'ja', 'aktiv', 'active', 'online'], true)) {
        return true;
    }
    if (in_array($normalized, ['0', 'false', 'no', 'nein', 'inaktiv', 'inactive', 'offline'], true)) {
        return false;
    }

    return null;
}

function stv3_property_status_names(): array
{
    try {
        $statuses = stv3_propstack_items(stv3_propstack_request('/property_statuses'));
    } catch (Throwable) {
        return [];
    }

    $names = [];
    foreach ($statuses as $status) {
        if (!is_array($status)) {
            continue;
        }
        $id = (int) ($status['id'] ?? 0);
        $name = st_normalize_text(st_first($status, ['name', 'title', 'label']));
        if ($id > 0 && $name !== '') {
            $names[$id] = $name;
        }
    }

    return $names;
}

function stv3_status_name(array $property, array $statusNames): string
{
    $statusName = st_normalize_text(st_first($property, [
        'property_status_name',
        'status_name',
        'status',
        'marketing_status',
        'state',
        'availability',
    ]));
    if ($statusName !== '') {
        return $statusName;
    }

    $statusId = (int) (st_first($property, ['property_status_id', 'status_id']) ?? 0);
    return $statusId > 0 ? st_normalize_text($statusNames[$statusId] ?? '') : '';
}

function stv3_is_publicly_marketable(array $property, array $statusNames): bool
{
    foreach ([
        'deleted_at',
        'archived_at',
        'deactivated_at',
        'hidden_at',
        'blocked_at',
    ] as $key) {
        if (st_normalize_text($property[$key] ?? '') !== '') {
            return false;
        }
    }

    foreach ([
        'is_deleted',
        'deleted',
        'is_archived',
        'archived',
        'is_internal',
        'internal',
        'is_locked',
        'locked',
        'is_blocked',
        'blocked',
        'is_hidden',
        'hidden',
        'is_offline',
        'offline',
    ] as $key) {
        if (array_key_exists($key, $property) && stv3_boolish($property[$key]) === true) {
            return false;
        }
    }

    foreach ([
        'is_public',
        'public',
        'is_published',
        'published',
        'is_visible',
        'visible',
        'is_online',
        'online',
        'is_exportable',
        'exportable',
    ] as $key) {
        if (array_key_exists($key, $property) && stv3_boolish($property[$key]) === false) {
            return false;
        }
    }

    $statusName = mb_strtolower(str_replace(['ä', 'ö', 'ü', 'ß'], ['ae', 'oe', 'ue', 'ss'], stv3_status_name($property, $statusNames)), 'UTF-8');
    foreach ([
        'archiv',
        'geloescht',
        'deleted',
        'inaktiv',
        'offline',
        'intern',
        'gesperrt',
        'entwurf',
        'draft',
        'verkauft',
        'vermietet',
        'reserviert',
        'reserved',
        'abgeschlossen',
        'storniert',
    ] as $blockedStatus) {
        if ($statusName !== '' && str_contains($statusName, $blockedStatus)) {
            return false;
        }
    }

    return true;
}

function stv3_has_display_price(array $price, array $property): bool
{
    if (array_key_exists('price_on_inquiry', $property) && stv3_boolish($property['price_on_inquiry']) === true) {
        return false;
    }
    return isset($price['amount']) && is_numeric($price['amount']) && (float) $price['amount'] > 0;
}

try {
    $statusNames = stv3_property_status_names();
    $brokers = stv3_fetch_brokers();
    $properties = stv3_fetch_properties(12, 50);
    $pdo->beginTransaction();
    $pdo->exec('UPDATE schaufenster_tv_properties SET active = 0, updated_at = NOW()');

    $flagged = 0;
    $selected = 0;
    $withoutImage = 0;
    $withoutLocation = 0;
    $withoutPrice = 0;
    $notPublic = 0;
    $upsert = $pdo->prepare(
        'INSERT INTO schaufenster_tv_properties (
            propstack_id, title, subtitle, city, zip_code, address, marketing_type, property_type,
            price_amount, price_label, price_period, price_on_inquiry, living_space, usable_floor_space,
            plot_area, number_of_rooms, construction_year, image_url, expose_url, custom_flag_value,
            active, raw_json, synced_at, updated_at
         ) VALUES (
            :propstack_id, :title, :subtitle, :city, :zip_code, :address, :marketing_type, :property_type,
            :price_amount, :price_label, :price_period, :price_on_inquiry, :living_space, :usable_floor_space,
            :plot_area, :number_of_rooms, :construction_year, :image_url, :expose_url, :custom_flag_value,
            1, :raw_json, NOW(), NOW()
         )
         ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            subtitle = VALUES(subtitle),
            city = VALUES(city),
            zip_code = VALUES(zip_code),
            address = VALUES(address),
            marketing_type = VALUES(marketing_type),
            property_type = VALUES(property_type),
            price_amount = VALUES(price_amount),
            price_label = VALUES(price_label),
            price_period = VALUES(price_period),
            price_on_inquiry = VALUES(price_on_inquiry),
            living_space = VALUES(living_space),
            usable_floor_space = VALUES(usable_floor_space),
            plot_area = VALUES(plot_area),
            number_of_rooms = VALUES(number_of_rooms),
            construction_year = VALUES(construction_year),
            image_url = VALUES(image_url),
            expose_url = VALUES(expose_url),
            custom_flag_value = VALUES(custom_flag_value),
            active = 1,
            raw_json = VALUES(raw_json),
            synced_at = NOW(),
            updated_at = NOW()'
    );

    foreach ($properties as $property) {
        $id = (int) ($property['id'] ?? 0);
        if ($id <= 0) {
            continue;
        }

        $unit = stv3_fetch_unit_supplement($id);
        $flag = st_find_custom_flag(['property' => $property, 'unit' => $unit], 'schaufenster_tv');
        if (!st_flag_is_yes($flag)) {
            continue;
        }

        $flagged++;
        $merged = $property;
        foreach (['custom', 'custom_fields', 'fields', 'optional_fields', 'monument'] as $key) {
            if (array_key_exists($key, $unit)) {
                $merged[$key] = $unit[$key];
            }
        }
        $merged['property'] = $property;
        $merged['unit'] = $unit;

        if (!stv3_is_publicly_marketable($merged, $statusNames)) {
            $notPublic++;
            continue;
        }

        $price = st_resolve_price($merged);
        if (!stv3_has_display_price($price, $merged)) {
            $withoutPrice++;
            continue;
        }

        $propertyType = stv3_property_type($merged);
        $imageUrl = st_image_url($merged);
        if (!$imageUrl) {
            $withoutImage++;
            continue;
        }

        $title = st_title($merged);
        $city = st_normalize_text($merged['city'] ?? '');
        $zip = st_normalize_text($merged['zip_code'] ?? '');
        if ($city === '' && $zip === '') {
            $withoutLocation++;
            continue;
        }
        $address = st_normalize_text(st_first($merged, ['short_address', 'address']));
        $subtitle = trim(implode(' · ', array_filter([
            $propertyType,
            trim(implode(' ', array_filter([$zip, $city]))),
        ])));

        $brokerId = (int) (st_first($merged, ['broker_id', 'user_id', 'responsible_user_id']) ?? 0);
        $broker = $brokerId > 0 && isset($brokers[$brokerId]) ? $brokers[$brokerId] : null;

        $selected++;
        $upsert->execute([
            ':propstack_id' => $id,
            ':title' => $title,
            ':subtitle' => $subtitle ?: null,
            ':city' => $city ?: null,
            ':zip_code' => $zip ?: null,
            ':address' => $address ?: null,
            ':marketing_type' => st_normalize_text($merged['marketing_type'] ?? '') ?: null,
            ':property_type' => $propertyType,
            ':price_amount' => $price['amount'],
            ':price_label' => $price['label'],
            ':price_period' => $price['period'],
            ':price_on_inquiry' => !empty($merged['price_on_inquiry']) ? 1 : 0,
            ':living_space' => st_number($merged['living_space'] ?? null),
            ':usable_floor_space' => st_number($merged['usable_floor_space'] ?? ($merged['property_space_value'] ?? null)),
            ':plot_area' => st_number($merged['plot_area'] ?? null),
            ':number_of_rooms' => st_number($merged['number_of_rooms'] ?? null),
            ':construction_year' => st_number($merged['construction_year'] ?? null),
            ':image_url' => $imageUrl,
            ':expose_url' => st_normalize_text($merged['public_expose_url'] ?? '') ?: null,
            ':custom_flag_value' => st_normalize_text($flag),
            ':raw_json' => json_encode(['property' => $property, 'unit' => $unit, 'broker' => $broker], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    $pdo->commit();
    audit_log('schaufenster.sync_propstack', [
        'fetched' => count($properties),
        'flagged' => $flagged,
        'selected' => $selected,
        'without_image' => $withoutImage,
        'without_location' => $withoutLocation,
        'without_price' => $withoutPrice,
        'not_public' => $notPublic,
        'label_version' => 'website-v4-schaufenster-media-tags',
    ], (int) $user['id']);

    json_response([
        'ok' => true,
        'data' => [
            'fetched' => count($properties),
            'flagged' => $flagged,
            'selected' => $selected,
            'without_image' => $withoutImage,
            'without_location' => $withoutLocation,
            'without_price' => $withoutPrice,
            'not_public' => $notPublic,
        ],
    ]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}
