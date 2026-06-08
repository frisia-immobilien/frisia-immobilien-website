<?php

declare(strict_types=1);

function propstack_api_key(): string
{
    $config = inside_config();
    return trim((string) (($config['integrations'] ?? [])['propstack_api_key'] ?? ''));
}

function propstack_base_url(string $version = 'v2'): string
{
    return $version === 'v1' ? 'https://api.propstack.de/v1' : 'https://api.propstack.de/v2';
}

function propstack_request(string $path, array $query = [], string $version = 'v2'): array
{
    $apiKey = propstack_api_key();
    if ($apiKey === '') {
        throw new RuntimeException('Propstack API-Key ist nicht konfiguriert.');
    }

    $url = rtrim(propstack_base_url($version), '/') . '/' . ltrim($path, '/');
    $query = array_filter($query, static fn ($value): bool => $value !== null && $value !== '');
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
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            $authHeader,
        ],
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

function propstack_items(array $response): array
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

function propstack_fetch_properties(int $maxPages = 12, int $perPage = 50): array
{
    $properties = [];
    for ($page = 1; $page <= $maxPages; $page++) {
        $response = propstack_request('/properties', [
            'per' => $perPage,
            'page' => $page,
            'sort_by' => 'updated_at',
            'order' => 'desc',
        ]);
        $items = propstack_items($response);
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

function propstack_fetch_property_statuses(): array
{
    return propstack_items(propstack_request('/property_statuses'));
}

function propstack_marketing_status_ids(): array
{
    $statusIds = [];
    foreach (propstack_fetch_property_statuses() as $status) {
        if (!is_array($status)) {
            continue;
        }
        $name = mb_strtolower(trim((string) ($status['name'] ?? '')), 'UTF-8');
        if ($name === 'vermarktung' && isset($status['id'])) {
            $statusIds[] = (int) $status['id'];
        }
    }

    return array_values(array_filter($statusIds, static fn (int $id): bool => $id > 0));
}

function propstack_fetch_marketing_properties(int $maxPages = 12, int $perPage = 50): array
{
    $statusIds = propstack_marketing_status_ids();
    if ($statusIds === []) {
        return propstack_fetch_properties($maxPages, $perPage);
    }

    $properties = [];
    for ($page = 1; $page <= $maxPages; $page++) {
        $response = propstack_request('/properties', [
            'status' => implode(',', $statusIds),
            'per' => $perPage,
            'page' => $page,
            'sort_by' => 'updated_at',
            'order' => 'desc',
        ]);
        $items = propstack_items($response);
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

function propstack_fetch_unit_supplement(int $id): array
{
    try {
        return propstack_request('/units/' . $id, [], 'v1');
    } catch (Throwable) {
        return [];
    }
}
