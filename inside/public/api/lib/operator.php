<?php

declare(strict_types=1);

function operator_role_prompt(): string
{
    return implode("\n", [
        'Du bist der interne Frisia Inside Operator.',
        'Arbeitsrollen: Abschluss-Stratege Immobilien, Google SEO/GEO Experte, Datenarchitekt, Risiko- und Rechtssicherheits-Architekt, TecSpace Betreiber, UX-Pruefer, Sebastian als finale Freigabeinstanz.',
        'Regeln:',
        '- Keine Live-Aenderung ohne explizite Freigabe.',
        '- Keine erfundenen Markt- oder Google-Daten.',
        '- Keine Secrets ausgeben.',
        '- Schwache Seiten nicht pauschal indexierbar machen.',
        '- Quellen, Risiken und naechste Pruefschritte klar nennen.',
        '- Ergebnis als knappe, operative Review-Vorlage formulieren.',
    ]);
}

function operator_keyword_hits(string $instruction): array
{
    $checks = [
        'seo_geo' => ['seo', 'geo', 'ranking', 'google', 'search console', 'index'],
        'schema' => ['schema', 'json-ld', 'structured', 'rich result', 'license'],
        'content' => ['faq', 'content', 'text', 'landingpage', 'thin'],
        'market_data' => ['marktdaten', 'boris', 'gutachterausschuss', 'preise', 'daten'],
        'leadgen' => ['lead', 'leadgen', 'propstack', 'crm', 'kontakt'],
        'operations' => ['deployment', 'backup', 'cron', 'tecspace', 'server'],
    ];

    $lower = strtolower($instruction);
    $hits = [];
    foreach ($checks as $key => $needles) {
        foreach ($needles as $needle) {
            if (str_contains($lower, $needle)) {
                $hits[] = $key;
                break;
            }
        }
    }

    return array_values(array_unique($hits));
}

function operator_fallback_response(string $instruction, array $context = []): array
{
    $hits = operator_keyword_hits($instruction);
    $taskTitle = trim((string) ($context['task_title'] ?? ''));
    $source = trim((string) ($context['source'] ?? 'operator'));

    $recommendations = [
        'Kontext sichern: betroffene URL, Seitentyp, Datenquellen, letzte Aenderung und aktueller Robots-/Canonical-Status.',
        'Risiko pruefen: SEO/GEO-Auswirkung, Datenqualitaet, Duplicate-Risk, rechtliche Aussage und Nutzermehrwert.',
        'Vorschlag nur als Review-Entwurf behandeln; Live-Aenderung erst nach Freigabe ausfuehren.',
    ];

    if (in_array('seo_geo', $hits, true)) {
        $recommendations[] = 'SEO/GEO: Search-Console-Signale, Sitemap-Zustand, interne Links und Indexierungsentscheidung getrennt bewerten.';
    }
    if (in_array('schema', $hits, true)) {
        $recommendations[] = 'Schema: JSON-LD serverseitig pruefen, Pflichtfelder konsistent halten und keine unpassenden Lizenz-/Gehaltswerte setzen.';
    }
    if (in_array('content', $hits, true)) {
        $recommendations[] = 'Content: lokale Einzigartigkeit, konkrete Entitaeten und echte hilfreiche Informationen vor Keyword-Erweiterungen stellen.';
    }
    if (in_array('market_data', $hits, true)) {
        $recommendations[] = 'Marktdaten: nur nachvollziehbare Quellen nutzen, Scheingenauigkeit vermeiden und Datenquelle klein sichtbar nennen.';
    }
    if (in_array('leadgen', $hits, true)) {
        $recommendations[] = 'Leadgen/Propstack: Sync nur mit klarer Feldzuordnung, Audit-Log und Fehlerstatus ausfuehren.';
    }
    if (in_array('operations', $hits, true)) {
        $recommendations[] = 'Betrieb: Healthcheck, Backup, Deploy-Stand und Cron-Ausfuehrung getrennt protokollieren.';
    }

    $checks = [
        'Quelle und Datenstand dokumentiert?',
        'Reviewpflicht klar?',
        'Keine Live-Aenderung ohne Freigabe?',
        'Keine erfundenen Daten oder automatischen Rankingversprechen?',
    ];

    $summary = $taskTitle !== ''
        ? 'Review-Lauf vorbereitet fuer: ' . $taskTitle
        : 'Operator-Auswertung vorbereitet.';

    $answerLines = [
        $summary,
        '',
        'Modus: Regelbasierter Sicherheitsmodus. OpenAI ist auf dem Server noch nicht aktiv oder nicht erreichbar.',
        'Quelle: ' . $source,
        '',
        'Einschaetzung:',
        'Der Auftrag ist ausfuehrbar, aber freigabepflichtig. Ich wuerde zuerst Kontext und Datenlage pruefen und danach eine konkrete Aenderungsvorlage erstellen.',
        '',
        'Empfohlene naechste Schritte:',
    ];

    foreach ($recommendations as $index => $recommendation) {
        $answerLines[] = ($index + 1) . '. ' . $recommendation;
    }

    $answerLines[] = '';
    $answerLines[] = 'Review-Checkliste:';
    foreach ($checks as $check) {
        $answerLines[] = '- ' . $check;
    }

    return [
        'mode' => 'fallback',
        'summary' => $summary,
        'answer' => implode("\n", $answerLines),
        'required_review' => true,
        'risk_level' => 'review_required',
        'detected_topics' => $hits,
        'recommendations' => $recommendations,
        'checks' => $checks,
    ];
}

function operator_extract_openai_text(array $payload): string
{
    if (isset($payload['output_text']) && is_string($payload['output_text'])) {
        return trim($payload['output_text']);
    }

    $parts = [];
    foreach (($payload['output'] ?? []) as $outputItem) {
        if (!is_array($outputItem)) {
            continue;
        }
        foreach (($outputItem['content'] ?? []) as $contentItem) {
            if (!is_array($contentItem)) {
                continue;
            }
            if (isset($contentItem['text']) && is_string($contentItem['text'])) {
                $parts[] = $contentItem['text'];
            }
        }
    }

    return trim(implode("\n", $parts));
}

function operator_openai_response(string $instruction, array $context = []): ?array
{
    $config = inside_config();
    $openai = $config['openai'] ?? [];
    $apiKey = trim((string) ($openai['api_key'] ?? ''));
    $model = trim((string) ($openai['model'] ?? 'gpt-5.4-mini'));

    if ($apiKey === '' || !function_exists('curl_init')) {
        return null;
    }

    $contextText = json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $input = operator_role_prompt()
        . "\n\nKontext:\n" . ($contextText ?: '{}')
        . "\n\nAuftrag:\n" . $instruction;

    $body = [
        'model' => $model,
        'input' => $input,
        'max_output_tokens' => 900,
    ];

    $ch = curl_init('https://api.openai.com/v1/responses');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_TIMEOUT => 45,
    ]);

    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if (!is_string($response) || $response === '' || $status < 200 || $status >= 300) {
        return [
            'mode' => 'fallback',
            'summary' => 'OpenAI-Anfrage fehlgeschlagen; regelbasierter Sicherheitsmodus aktiv.',
            'answer' => '',
            'required_review' => true,
            'risk_level' => 'review_required',
            'error' => $curlError !== '' ? $curlError : 'HTTP ' . $status,
        ];
    }

    $decoded = json_decode($response, true);
    if (!is_array($decoded)) {
        return null;
    }

    $answer = operator_extract_openai_text($decoded);
    if ($answer === '') {
        return null;
    }

    return [
        'mode' => 'openai',
        'summary' => 'OpenAI-Auswertung erzeugt. Review bleibt erforderlich.',
        'answer' => $answer,
        'required_review' => true,
        'risk_level' => 'review_required',
        'detected_topics' => operator_keyword_hits($instruction),
        'recommendations' => [],
        'checks' => [
            'Ausgabe fachlich pruefen.',
            'Quellen und Datenstand pruefen.',
            'Live-Aenderung erst nach Freigabe ausfuehren.',
        ],
    ];
}

function operator_generate_response(string $instruction, array $context = []): array
{
    $openaiResult = operator_openai_response($instruction, $context);
    if ($openaiResult && ($openaiResult['mode'] ?? '') === 'openai') {
        return $openaiResult;
    }

    $fallback = operator_fallback_response($instruction, $context);
    if ($openaiResult && !empty($openaiResult['error'])) {
        $fallback['openai_error'] = $openaiResult['error'];
    }
    return $fallback;
}
