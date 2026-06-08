<?php

declare(strict_types=1);

function st_normalize_text(mixed $value): string
{
    if (is_string($value) || is_numeric($value)) {
        return trim((string) $value);
    }
    return '';
}

function st_normalize_key(string $value): string
{
    $value = mb_strtolower($value, 'UTF-8');
    $value = str_replace(['ä', 'ö', 'ü', 'ß'], ['ae', 'oe', 'ue', 'ss'], $value);
    return preg_replace('/[^a-z0-9]+/', '', $value) ?? '';
}

function st_number(mixed $value): ?float
{
    if (is_int($value) || is_float($value)) {
        return is_finite((float) $value) ? (float) $value : null;
    }
    if (!is_string($value)) {
        return null;
    }
    $normalized = str_replace('.', '', trim($value));
    $normalized = str_replace(',', '.', $normalized);
    $normalized = preg_replace('/[^\d.-]/', '', $normalized) ?? '';
    if ($normalized === '') {
        return null;
    }
    $number = (float) $normalized;
    return is_finite($number) ? $number : null;
}

function st_first(array $data, array $keys): mixed
{
    foreach ($keys as $key) {
        if (array_key_exists($key, $data) && $data[$key] !== null && $data[$key] !== '') {
            return $data[$key];
        }
    }
    return null;
}

function st_find_custom_flag(mixed $data, string $target = 'schaufenster_tv'): mixed
{
    if (!is_array($data)) {
        return null;
    }

    $targetKey = st_normalize_key($target);
    foreach ($data as $key => $value) {
        if (is_string($key) && st_normalize_key($key) === $targetKey) {
            return is_array($value) ? st_first($value, ['pretty_value', 'value', 'name']) : $value;
        }
    }

    $fieldKey = st_first($data, ['key', 'name', 'identifier', 'label', 'field_name']);
    if (is_string($fieldKey) && st_normalize_key($fieldKey) === $targetKey) {
        return st_first($data, ['pretty_value', 'value', 'content', 'text']);
    }

    foreach ($data as $value) {
        $found = st_find_custom_flag($value, $target);
        if ($found !== null && $found !== '') {
            return $found;
        }
    }

    return null;
}

function st_flag_is_yes(mixed $value): bool
{
    if (is_bool($value)) {
        return $value;
    }
    if (is_numeric($value)) {
        return (float) $value !== 0.0;
    }

    $normalized = mb_strtolower(st_normalize_text($value), 'UTF-8');
    return in_array($normalized, ['ja', 'yes', 'true', '1', 'aktiv', 'anzeigen'], true);
}

function st_title(array $property): string
{
    $tvTitle = st_normalize_text(st_find_custom_flag($property, 'schaufenster_tv_titel'));
    if ($tvTitle !== '') {
        return preg_replace('/\s+/', ' ', $tvTitle) ?? $tvTitle;
    }

    $title = st_normalize_text(st_first($property, ['title', 'name']));
    if ($title !== '') {
        return preg_replace('/\s+/', ' ', $title) ?? $title;
    }

    $propertyType = st_property_type($property);
    $city = st_normalize_text($property['city'] ?? '');
    if ($propertyType !== '' && $city !== '') {
        return $propertyType . ' in ' . $city;
    }
    if ($city !== '') {
        return 'Immobilie in ' . $city;
    }
    return $propertyType !== '' ? $propertyType . ' von Frisia Immobilien' : 'Immobilie von Frisia Immobilien';
}

function st_image_url(array $property): ?string
{
    $images = $property['images'] ?? [];
    if (!is_array($images)) {
        return null;
    }

    $gallery = st_select_schaufenster_gallery($images);
    if ($gallery !== []) {
        return $gallery[0];
    }

    return null;
}

function st_schaufenster_tv_slot(array $image): ?int
{
    $key = st_normalize_key(st_image_search_text($image));
    if ($key === '') {
        return null;
    }

    if (preg_match('/schaud?fenstertv0?([123])(?![0-9])/', $key, $matches) === 1) {
        return (int) $matches[1];
    }

    return null;
}

function st_select_schaufenster_gallery(array $images, string $fallbackMainImage = ''): array
{
    usort($images, static function (mixed $a, mixed $b): int {
        $aPos = is_array($a) ? (int) ($a['position'] ?? 9999) : 9999;
        $bPos = is_array($b) ? (int) ($b['position'] ?? 9999) : 9999;
        return $aPos <=> $bPos;
    });

    $candidates = [];
    $tagged = [];
    foreach ($images as $image) {
        if (!is_array($image)) {
            continue;
        }
        if (!st_image_is_usable($image)) {
            continue;
        }
        $url = st_normalize_text($image['url'] ?? '');
        if ($url === '' || array_key_exists($url, $candidates)) {
            continue;
        }

        $slot = st_schaufenster_tv_slot($image);
        $candidates[$url] = [
            'url' => $url,
            'position' => (int) ($image['position'] ?? 9999),
            'slot' => $slot,
        ];
        if ($slot !== null && !isset($tagged[$slot])) {
            $tagged[$slot] = $url;
        }
    }

    $fallbackMainImage = st_normalize_text($fallbackMainImage);
    if ($fallbackMainImage !== '' && !array_key_exists($fallbackMainImage, $candidates)) {
        $candidates[$fallbackMainImage] = [
            'url' => $fallbackMainImage,
            'position' => 0,
            'slot' => null,
        ];
    }

    if ($candidates === []) {
        return [];
    }

    $ordered = array_values($candidates);
    usort($ordered, static fn (array $a, array $b): int => $a['position'] <=> $b['position']);

    if (isset($tagged[1])) {
        return [$tagged[1]];
    }

    $firstImage = $fallbackMainImage !== '' ? $fallbackMainImage : (string) ($ordered[0]['url'] ?? '');
    return $firstImage !== '' ? [$firstImage] : [];
}

function st_resolve_price(array $property): array
{
    $marketing = mb_strtoupper(st_normalize_text($property['marketing_type'] ?? ''), 'UTF-8');
    if ($marketing === 'RENT') {
        $baseRent = st_number($property['base_rent'] ?? null);
        $totalRent = st_number($property['total_rent'] ?? null);
        $fallback = st_number($property['price'] ?? null);
        if ($baseRent !== null) {
            return ['amount' => $baseRent, 'label' => 'Kaltmiete', 'period' => 'month'];
        }
        if ($totalRent !== null) {
            return ['amount' => $totalRent, 'label' => 'Warmmiete', 'period' => 'month'];
        }
        return ['amount' => $fallback, 'label' => 'Miete', 'period' => 'month'];
    }

    return ['amount' => st_number($property['price'] ?? null), 'label' => 'Kaufpreis', 'period' => null];
}

function st_property_type(array $property): string
{
    $value = st_normalize_text(st_first($property, ['rs_category', 'rs_type', 'object_type']));
    if ($value === '') {
        return 'Immobilie';
    }

    $key = preg_replace('/[\s\/-]+/', '_', trim($value)) ?? $value;
    $key = preg_replace('/__+/', '_', $key) ?? $key;
    $key = mb_strtoupper($key, 'UTF-8');

    $labels = [
        'APARTMENT' => 'Wohnung',
        'FLAT_SHARE_ROOM' => 'WG-Zimmer',
        'ASSISTED_LIVING' => 'Betreutes Wohnen',
        'SENIOR_CARE' => 'Seniorenpflege',
        'PENTHOUSE' => 'Penthouse',
        'MAISONETTE' => 'Maisonette',
        'ATTIC_FLAT' => 'Dachgeschosswohnung',
        'ROOF_STOREY' => 'Dachgeschosswohnung',
        'LOFT' => 'Loft',
        'GROUND_FLOOR' => 'Erdgeschosswohnung',
        'RAISED_GROUND_FLOOR' => 'Hochparterre',
        'HALF_BASEMENT' => 'Souterrain',
        'TERRACED_FLAT' => 'Terrassenwohnung',
        'HOUSE' => 'Haus',
        'SINGLE_FAMILY_HOUSE' => 'Einfamilienhaus',
        'MULTI_FAMILY_HOUSE' => 'Mehrfamilienhaus',
        'TWO_FAMILY_HOUSE' => 'Zweifamilienhaus',
        'TERRACE_HOUSE' => 'Reihenhaus',
        'SEMI_DETACHED_HOUSE' => 'Doppelhaushälfte',
        'TERRACED_HOUSE' => 'Reihenhaus',
        'TERRACE_END_HOUSE' => 'Reihenendhaus',
        'END_TERRACE_HOUSE' => 'Reiheneckhaus',
        'TERRACED_END_HOUSE' => 'Reihenendhaus',
        'MID_TERRACE_HOUSE' => 'Reihenmittelhaus',
        'BUNGALOW' => 'Bungalow',
        'VILLA' => 'Villa',
        'FINCA' => 'Finca',
        'FARMHOUSE' => 'Bauernhaus',
        'COUNTRY_HOUSE' => 'Landhaus',
        'TOWNHOUSE' => 'Stadthaus',
        'CASTLE_MANOR_HOUSE' => 'Burg / Schloss',
        'SPECIAL_REAL_ESTATE' => 'Besondere Immobilie',
        'TWIN_SINGLE_FAMILY_HOUSE' => 'Doppeleinfamilienhaus',
        'TRADE_SITE' => 'Grundstück',
        'OFFICE' => 'Büro',
        'OFFICE_FLOOR' => 'Büroetage',
        'OFFICE_BUILDING' => 'Bürohaus',
        'OFFICE_CENTRE' => 'Bürozentrum',
        'OFFICE_STORAGE_BUILDING' => 'Büro- / Lagergebäude',
        'PRACTICE' => 'Praxis',
        'SURGERY' => 'Praxis',
        'SURGERY_FLOOR' => 'Praxisetage',
        'SURGERY_BUILDING' => 'Praxishaus',
        'OFFICE_PRACTICE' => 'Büro / Praxis',
        'OFFICE_OR_PRACTICE' => 'Büro / Praxis',
        'COMMERCIAL_CENTRE' => 'Gewerbezentrum',
        'LIVING_AND_COMMERCIAL_BUILDING' => 'Wohn- und Geschäftsgebäude',
        'OFFICE_AND_COMMERCIAL_BUILDING' => 'Büro- und Geschäftsgebäude',
        'RETAIL' => 'Einzelhandel',
        'SHOP' => 'Laden',
        'STORE' => 'Ladenlokal',
        'SALES_AREA' => 'Verkaufsfläche',
        'SHOP_SALES_FLOOR' => 'Laden / Verkaufsfläche',
        'SALES_HALL' => 'Verkaufshalle',
        'SHOWROOM_SPACE' => 'Ausstellungsfläche',
        'SHOPPING_CENTRE' => 'Einkaufszentrum',
        'FACTORY_OUTLET' => 'Factory Outlet',
        'DEPARTMENT_STORE' => 'Kaufhaus',
        'KIOSK' => 'Kiosk',
        'SELF_SERVICE_MARKET' => 'SB-Markt',
        'SUPERMARKET' => 'Supermarkt',
        'RETAIL_PARK' => 'Fachmarktzentrum',
        'GASTRONOMY' => 'Gastronomie',
        'BAR_LOUNGE' => 'Bar / Lounge',
        'CAFE' => 'Café',
        'CLUB_DISCO' => 'Club / Diskothek',
        'GUESTS_HOUSE' => 'Gästehaus',
        'TAVERN' => 'Gaststätte',
        'HOTEL' => 'Hotel',
        'HOTEL_RESIDENCE' => 'Hotelanwesen',
        'HOTEL_GARNI' => 'Hotel garni',
        'PENSION' => 'Pension',
        'RESTAURANT' => 'Restaurant',
        'SHORT_TERM_ACCOMODATION' => 'Ferienimmobilie',
        'SHORT_TERM_ACCOMMODATION' => 'Ferienimmobilie',
        'INDUSTRY' => 'Industrie',
        'HALL' => 'Halle',
        'HALL_STORAGE' => 'Halle / Logistik',
        'STORAGE' => 'Lager',
        'PRODUCTION' => 'Produktion',
        'INDUSTRIAL_PROPERTY' => 'Produktion / Fertigung',
        'INDUSTRIAL_AREA' => 'Gewerbefläche',
        'REPAIR_SHOP' => 'Werkstatt',
        'HALL_STORAGE_PRODUCTION' => 'Halle / Lager / Produktion',
        'COMMERCIAL' => 'Gewerbe',
        'COMMERCIAL_PROPERTY' => 'Gewerbeimmobilie',
        'COMMERCIAL_BUILDING' => 'Geschäftshaus',
        'SPECIAL_PURPOSE' => 'Sonderimmobilie',
        'SPECIAL_PROPERTY' => 'Sonderimmobilie',
        'SPECIAL_ESTATE' => 'Spezialobjekt',
        'INVESTMENT' => 'Kapitalanlage',
        'INVEST_PLOT' => 'Grundstück',
        'RESIDENCE' => 'Anwesen',
        'FARM' => 'Bauernhof',
        'HORSE_FARM' => 'Reiterhof',
        'VINEYARD' => 'Weingut',
        'LEISURE_FACILITY' => 'Freizeitanlage',
        'LIVING_BUSINESS_HOUSE' => 'Wohn- und Geschäftshaus',
        'HOUSING_ESTATE' => 'Wohnanlage',
        'MICRO_APARTMENTS' => 'Micro-Apartments',
        'BOARDING_HOUSE' => 'Boarding House',
        'CLINIC' => 'Klinik',
        'SITE' => 'Grundstück',
        'PLOT' => 'Grundstück',
        'RESIDENTIAL_PLOT' => 'Wohngrundstück',
        'COMMERCIAL_PLOT' => 'Gewerbegrundstück',
        'AGRICULTURAL_PLOT' => 'Landwirtschaftsfläche',
        'FORESTRY' => 'Forstwirtschaft',
        'LAND_AND_FORESTRY' => 'Land- und Forstwirtschaft',
        'PARKING_SPACE' => 'Stellplatz',
        'PARKING' => 'Stellplatz',
        'STREET_PARKING' => 'Außenstellplatz',
        'CARPORT' => 'Carport',
        'DUPLEX' => 'Duplex',
        'CAR_PARK' => 'Parkhaus',
        'UNDERGROUND_GARAGE' => 'Tiefgarage',
        'DOUBLE_GARAGE' => 'Doppelgarage',
        'GARAGE' => 'Garage',
        'NO_INFORMATION' => 'Keine Angabe',
        'OTHER' => 'Sonstige Immobilie',
        'STUDIO' => 'Atelier',
    ];

    if (isset($labels[$key])) {
        return $labels[$key];
    }

    return implode(' ', array_map(
        static fn (string $part): string => mb_convert_case($part, MB_CASE_TITLE, 'UTF-8'),
        array_filter(explode(' ', str_replace(['_', '-'], ' ', mb_strtolower($value, 'UTF-8'))))
    ));
}

function st_public_location(array $row): string
{
    return trim(implode(' ', array_filter([
        st_normalize_text($row['zip_code'] ?? ''),
        st_normalize_text($row['city'] ?? ''),
    ])));
}

function st_format_price(?float $amount, bool $onInquiry, ?string $period): string
{
    if ($onInquiry || $amount === null || $amount <= 0) {
        return 'Preis auf Anfrage';
    }
    $formatted = number_format($amount, 0, ',', '.') . ' €';
    return $period === 'month' ? $formatted . ' / Monat' : $formatted;
}

function st_format_metric(?float $value, string $unit): string
{
    if ($value === null || $value <= 0) {
        return 'k. A.';
    }
    $decimals = floor($value) === $value ? 0 : 1;
    $formatted = number_format($value, $decimals, ',', '.');
    return $unit !== '' ? $formatted . ' ' . $unit : $formatted;
}

function st_gallery_images(array $row): array
{
    $raw = json_decode((string) ($row['raw_json'] ?? ''), true);
    if (!is_array($raw)) {
        return array_values(array_filter([st_tv_asset_url(st_normalize_text($row['image_url'] ?? ''))]));
    }

    $property = $raw['property'] ?? [];
    $images = is_array($property) && isset($property['images']) && is_array($property['images'])
        ? $property['images']
        : [];

    return array_values(array_filter(array_map(
        'st_tv_asset_url',
        st_select_schaufenster_gallery($images, st_normalize_text($row['image_url'] ?? ''))
    )));
}

function st_tv_asset_url(?string $url): string
{
    $url = st_normalize_text($url);
    if ($url === '') {
        return '';
    }

    $parts = parse_url($url);
    $host = is_array($parts) ? mb_strtolower((string) ($parts['host'] ?? ''), 'UTF-8') : '';
    if ($host === 'images.propstack.de') {
        return '/api/schaufenster/image.php?url=' . rawurlencode($url);
    }

    return $url;
}

function st_broker_profile(array $row): ?array
{
    $raw = json_decode((string) ($row['raw_json'] ?? ''), true);
    if (!is_array($raw) || !isset($raw['broker']) || !is_array($raw['broker'])) {
        return null;
    }

    $broker = $raw['broker'];
    $name = st_normalize_text(st_first($broker, ['name', 'full_name']));
    if ($name === '') {
        $name = trim(implode(' ', array_filter([
            st_normalize_text($broker['first_name'] ?? ''),
            st_normalize_text($broker['last_name'] ?? ''),
        ])));
    }
    if ($name === '') {
        return null;
    }

    $imageUrl = st_normalize_text(st_first($broker, ['avatar_url', 'avatar', 'image_url', 'photo_url']));
    $phone = st_normalize_text(st_first($broker, ['public_phone', 'phone', 'mobile']));

    return [
        'name' => $name,
        'position' => st_normalize_text(st_first($broker, ['position', 'role', 'title'])) ?: null,
        'image_url' => $imageUrl !== '' ? st_tv_asset_url($imageUrl) : null,
        'phone' => $phone ?: '04941 986770-0',
    ];
}

function st_label_value(mixed $value, array $labels): string
{
    $text = st_normalize_text($value);
    if ($text === '') {
        return '';
    }

    $key = preg_replace('/[\s\/-]+/', '_', trim($text)) ?? $text;
    $key = preg_replace('/__+/', '_', $key) ?? $key;
    $key = mb_strtoupper($key, 'UTF-8');

    return $labels[$key] ?? implode(' ', array_map(
        static fn (string $part): string => mb_convert_case($part, MB_CASE_TITLE, 'UTF-8'),
        array_filter(explode(' ', str_replace(['_', '-'], ' ', mb_strtolower($text, 'UTF-8'))))
    ));
}

function st_energy_metrics(array $row): array
{
    $raw = json_decode((string) ($row['raw_json'] ?? ''), true);
    if (!is_array($raw)) {
        return [];
    }

    $property = is_array($raw['property'] ?? null) ? $raw['property'] : [];
    $unit = is_array($raw['unit'] ?? null) ? $raw['unit'] : [];
    $data = array_replace($unit, $property);

    $availabilityLabels = [
        'AVAILABLE' => 'vorhanden',
        'NOT_REQUIRED' => 'nicht erforderlich',
        'IN_PROGRESS' => 'in Vorbereitung',
        'NOT_AVAILABLE' => 'nicht vorhanden',
    ];
    $typeLabels = [
        'ENERGY_CONSUMPTION' => 'Verbrauchsausweis',
        'ENERGY_DEMAND' => 'Bedarfsausweis',
        'ENERGY_REQUIREMENT' => 'Bedarfsausweis',
        'DEMAND' => 'Bedarfsausweis',
        'CONSUMPTION' => 'Verbrauchsausweis',
    ];
    $fuelLabels = [
        'GAS' => 'Gas',
        'OIL' => 'Öl',
        'ELECTRICITY' => 'Strom',
        'DISTRICT_HEATING' => 'Fernwärme',
        'GEOTHERMAL' => 'Erdwärme',
        'PELLET' => 'Pellets',
        'WOOD' => 'Holz',
        'SOLAR' => 'Solar',
        'AIR_SOURCE_HEAT_PUMP' => 'Luft-Wärmepumpe',
        'GROUND_SOURCE_HEAT_PUMP' => 'Erdwärmepumpe',
    ];

    $availability = st_label_value($data['energy_certificate_availability'] ?? null, $availabilityLabels);
    if ($availability === 'nicht erforderlich') {
        return [['label' => 'Energieausweis', 'value' => 'nicht erforderlich']];
    }

    $metrics = [];
    $ratingType = st_label_value($data['building_energy_rating_type'] ?? null, $typeLabels);
    if ($ratingType !== '') {
        $metrics[] = ['label' => 'Ausweis', 'value' => $ratingType];
    } elseif ($availability !== '') {
        $metrics[] = ['label' => 'Energieausweis', 'value' => $availability];
    }

    $energyValue = st_number($data['energy_efficiency_value'] ?? ($data['thermal_characteristic'] ?? null));
    if ($energyValue !== null && $energyValue > 0) {
        $metrics[] = [
            'label' => 'Kennwert',
            'value' => number_format($energyValue, 1, ',', '.') . ' kWh/(m²·a)',
        ];
    }

    $fuelValue = $data['firing_types'] ?? null;
    if (is_array($fuelValue)) {
        $fuelValue = st_first($fuelValue, ['0', 'name', 'value']);
    }
    $fuel = st_label_value($fuelValue, $fuelLabels);
    if ($fuel !== '') {
        $metrics[] = ['label' => 'Energieträger', 'value' => $fuel];
    }

    $class = st_normalize_text($data['energy_efficiency_class'] ?? '');
    if ($class !== '') {
        $metrics[] = ['label' => 'Klasse', 'value' => mb_strtoupper($class, 'UTF-8')];
    }

    return $metrics;
}

function st_image_search_text(array $image): string
{
    $parts = [];
    foreach (['title', 'name', 'filename', 'original_filename', 'alt', 'caption', 'description', 'category', 'type'] as $key) {
        if (isset($image[$key])) {
            $parts[] = st_normalize_text($image[$key]);
        }
    }
    foreach (['tags', 'tag_list', 'labels'] as $key) {
        if (!isset($image[$key])) {
            continue;
        }
        $value = $image[$key];
        if (is_array($value)) {
            foreach ($value as $entry) {
                if (is_array($entry)) {
                    $parts[] = st_normalize_text(st_first($entry, ['name', 'title', 'label', 'key', 'value']));
                } else {
                    $parts[] = st_normalize_text($entry);
                }
            }
        } else {
            $parts[] = st_normalize_text($value);
        }
    }

    $text = mb_strtolower(implode(' ', array_filter($parts)), 'UTF-8');
    return str_replace(['ä', 'ö', 'ü', 'ß'], ['ae', 'oe', 'ue', 'ss'], $text);
}

function st_image_is_usable(array $image): bool
{
    if (!empty($image['is_private']) || !empty($image['is_floorplan'])) {
        return false;
    }

    $text = st_image_search_text($image);
    $blockedKeywords = [
        'grundriss',
        'floorplan',
        'lageplan',
        'energieausweis',
        'ausweis',
        'karte',
        'map',
        'logo',
        'placeholder',
        'platzhalter',
        'noimage',
        'no image',
        'kontakt',
        'qr',
    ];

    foreach ($blockedKeywords as $keyword) {
        if (str_contains($text, $keyword)) {
            return false;
        }
    }

    return true;
}

function st_image_keyword_score(string $text, array $keywords): int
{
    $score = 0;
    foreach ($keywords as $keyword => $weight) {
        if (str_contains($text, (string) $keyword)) {
            $score += (int) $weight;
        }
    }
    return $score;
}

function st_gallery_score(array $image, string $mode): int
{
    $text = (string) ($image['text'] ?? '');
    $position = (int) ($image['position'] ?? 9999);
    $positionScore = max(0, 30 - min($position, 30));

    $outsideKeywords = [
        'titel' => 38,
        'title' => 34,
        'haupt' => 34,
        'front' => 32,
        'aussen' => 34,
        'ansicht' => 30,
        'fassade' => 30,
        'haus' => 18,
        'gebaeude' => 18,
        'eingang' => 18,
        'zufahrt' => 18,
        'garten' => 26,
        'terrasse' => 26,
        'balkon' => 18,
        'lage' => 16,
        'strasse' => 10,
        'hof' => 12,
        'grundstueck' => 16,
    ];
    $insideKeywords = [
        'innen' => 32,
        'interior' => 32,
        'wohnen' => 38,
        'wohnzimmer' => 42,
        'wohnbereich' => 42,
        'kueche' => 40,
        'bad' => 38,
        'badezimmer' => 40,
        'schlafzimmer' => 36,
        'flur' => 28,
        'diele' => 26,
        'zimmer' => 22,
        'esszimmer' => 28,
        'treppe' => 20,
        'kamin' => 20,
        'detail' => 16,
        'buero' => 24,
        'praxis' => 22,
        'wc' => 20,
    ];

    return match ($mode) {
        'main' => $positionScore + st_image_keyword_score($text, $outsideKeywords),
        'outside' => st_image_keyword_score($text, $outsideKeywords) + max(0, 16 - min($position, 16)),
        'inside' => st_image_keyword_score($text, $insideKeywords) + max(0, 10 - min($position, 10)),
        default => max(0, 20 - min($position, 20)),
    };
}

function st_pick_gallery_image(array $images, array $used, string $mode): string
{
    $bestUrl = '';
    $bestScore = PHP_INT_MIN;
    foreach ($images as $image) {
        $url = (string) ($image['url'] ?? '');
        if ($url === '' || in_array($url, $used, true)) {
            continue;
        }
        $score = st_gallery_score($image, $mode);
        if ($mode === 'inside' && $score < 18) {
            continue;
        }
        if ($mode === 'outside' && $score < 14) {
            continue;
        }
        if ($score > $bestScore) {
            $bestScore = $score;
            $bestUrl = $url;
        }
    }
    return $bestUrl;
}

function st_property_row_title(array $row): string
{
    $storedTitle = st_normalize_text($row['title'] ?? '');
    $storedCity = st_normalize_text($row['city'] ?? '');
    $storedType = st_normalize_text($row['property_type'] ?? '') ?: 'Immobilie';
    $rawJson = is_string($row['raw_json'] ?? null) ? (string) $row['raw_json'] : '';

    if ($rawJson !== '') {
        $decoded = json_decode($rawJson, true);
        if (is_array($decoded)) {
            $property = is_array($decoded['property'] ?? null) ? $decoded['property'] : [];
            $unit = is_array($decoded['unit'] ?? null) ? $decoded['unit'] : [];
            $titleData = $property;
            foreach (['custom', 'custom_fields', 'fields', 'optional_fields', 'monument'] as $key) {
                if (array_key_exists($key, $unit)) {
                    $titleData[$key] = $unit[$key];
                }
            }
            $titleData['property'] = $property;
            $titleData['unit'] = $unit;

            if (st_normalize_text(st_first($titleData, ['title', 'name'])) === '' && $storedTitle !== '') {
                $titleData['title'] = $storedTitle;
            }
            if (st_normalize_text($titleData['city'] ?? '') === '' && $storedCity !== '') {
                $titleData['city'] = $storedCity;
            }
            if (st_normalize_text(st_first($titleData, ['rs_category', 'rs_type', 'object_type'])) === '' && $storedType !== '') {
                $titleData['rs_type'] = $storedType;
            }

            $displayTitle = st_title($titleData);
            if ($displayTitle !== '') {
                return $displayTitle;
            }
        }
    }

    if ($storedTitle !== '') {
        return preg_replace('/\s+/', ' ', $storedTitle) ?? $storedTitle;
    }
    if ($storedCity !== '') {
        return $storedType . ' in ' . $storedCity;
    }
    return $storedType . ' von Frisia Immobilien';
}

function st_map_property_row(array $row): array
{
    $area = $row['living_space'] !== null && (float) $row['living_space'] > 0
        ? (float) $row['living_space']
        : ($row['usable_floor_space'] !== null ? (float) $row['usable_floor_space'] : null);

    return [
        'type' => 'property',
        'id' => (int) $row['id'],
        'propstack_id' => (int) $row['propstack_id'],
        'title' => st_property_row_title($row),
        'subtitle' => $row['subtitle'],
        'image_url' => st_tv_asset_url($row['image_url']),
        'gallery_images' => st_gallery_images($row),
        'location' => st_public_location($row),
        'city' => $row['city'],
        'property_type' => $row['property_type'] ?: 'Immobilie',
        'marketing_type' => $row['marketing_type'],
        'price_label' => $row['price_label'] ?: 'Preis',
        'price_text' => st_format_price(
            $row['price_amount'] !== null ? (float) $row['price_amount'] : null,
            (bool) $row['price_on_inquiry'],
            $row['price_period']
        ),
        'metrics' => [
            ['label' => $row['usable_floor_space'] !== null && !$row['living_space'] ? 'Nutzfläche' : 'Wohnfläche', 'value' => st_format_metric($area, 'm²')],
            ['label' => 'Grundstück', 'value' => st_format_metric($row['plot_area'] !== null ? (float) $row['plot_area'] : null, 'm²')],
            ['label' => 'Zimmer', 'value' => st_format_metric($row['number_of_rooms'] !== null ? (float) $row['number_of_rooms'] : null, '')],
            ['label' => 'Baujahr', 'value' => $row['construction_year'] ? (string) $row['construction_year'] : 'k. A.'],
        ],
        'energy_metrics' => st_energy_metrics($row),
        'broker' => st_broker_profile($row),
        'expose_url' => $row['expose_url'],
    ];
}

function st_map_slide_row(array $row): array
{
    return [
        'type' => 'custom_slide',
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'subtitle' => 'Frisia Immobilien',
        'image_url' => $row['image_url'],
        'link_url' => $row['link_url'],
    ];
}
