<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';
require dirname(__DIR__) . '/lib/propstack-tv.php';
require dirname(__DIR__) . '/lib/schaufenster.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();

try {
    $properties = stv_propstack_fetch_properties(12, 50);
    $pdo->beginTransaction();
    $pdo->exec('UPDATE schaufenster_tv_properties SET active = 0, updated_at = NOW()');

    $selected = 0;
    $withoutImage = 0;
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
        $unit = stv_propstack_fetch_unit_supplement($id);
        $flag = st_find_custom_flag(['property' => $property, 'unit' => $unit], 'schaufenster_tv');
        if (!st_flag_is_yes($flag)) {
            continue;
        }

        $selected++;
        $merged = $property;
        foreach (['custom', 'custom_fields', 'fields', 'optional_fields', 'monument'] as $key) {
            if (array_key_exists($key, $unit)) {
                $merged[$key] = $unit[$key];
            }
        }
        $merged['property'] = $property;
        $merged['unit'] = $unit;

        $price = st_resolve_price($merged);
        $imageUrl = st_image_url($merged);
        if (!$imageUrl) {
            $withoutImage++;
        }

        $title = st_title($merged);
        $city = st_normalize_text($merged['city'] ?? '');
        $zip = st_normalize_text($merged['zip_code'] ?? '');
        $address = st_normalize_text(st_first($merged, ['short_address', 'address']));
        $subtitle = trim(implode(' · ', array_filter([
            st_property_type($merged),
            trim(implode(' ', array_filter([$zip, $city]))),
        ])));

        $upsert->execute([
            ':propstack_id' => $id,
            ':title' => $title,
            ':subtitle' => $subtitle ?: null,
            ':city' => $city ?: null,
            ':zip_code' => $zip ?: null,
            ':address' => $address ?: null,
            ':marketing_type' => st_normalize_text($merged['marketing_type'] ?? '') ?: null,
            ':property_type' => st_property_type($merged),
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
            ':raw_json' => json_encode(['property' => $property, 'unit' => $unit], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    $pdo->commit();
    audit_log('schaufenster.sync_propstack', [
        'fetched' => count($properties),
        'selected' => $selected,
        'without_image' => $withoutImage,
    ], (int) $user['id']);

    json_response([
        'ok' => true,
        'data' => [
            'fetched' => count($properties),
            'selected' => $selected,
            'without_image' => $withoutImage,
        ],
    ]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(['ok' => false, 'error' => $error->getMessage()], 500);
}
