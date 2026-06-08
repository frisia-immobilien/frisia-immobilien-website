<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

require_method('POST');
$user = require_auth();
$pdo = require_db();

$defaults = [
    [
        'title' => 'SEO/GEO Wochenpruefung',
        'instruction' => 'Pruefe Search-Console-Daten, Indexierung, Canonicals, Sitemap, Schema, interne Links und Seitenqualitaet. Erstelle priorisierte Massnahmen. Keine Live-Aenderungen ohne Freigabe.',
        'recurrence' => 'weekly',
    ],
    [
        'title' => 'FAQ-Review Immobilienmakler Aurich',
        'instruction' => 'Pruefe alle 4 Wochen Suchintentionen und FAQ-Signale zu Immobilienmakler Aurich. Vergleiche mit /immobilienmakler-aurich und erstelle konkrete FAQ-Aktualisierungsvorschlaege mit Quellenhinweis.',
        'recurrence' => 'every_4_weeks',
    ],
    [
        'title' => 'Frisia Inside Betriebscheck',
        'instruction' => 'Pruefe Healthcheck, Datenbank, Cron, OpenAI, Propstack, Search Console, Audit-Log und letzte Scheduler-Fehler. Erstelle eine knappe Betriebsbewertung mit naechsten Massnahmen. Keine Live-Aenderungen ohne Freigabe.',
        'recurrence' => 'weekly',
    ],
    [
        'title' => 'IMV Datenqualitaets-Review',
        'instruction' => 'Pruefe IMV-/SEO-Ortsdaten, Quellen, Freshness, Quality-Scores, Duplicate-Risk, lokale Einzigartigkeit und pending Reviews. Priorisiere Orte mit hohem Lead- und SEO-Potenzial. Keine Indexierungsfreigabe ohne ausreichende Datenqualitaet.',
        'recurrence' => 'weekly',
    ],
];

$selectStmt = $pdo->prepare(
    'SELECT id, title, status, recurrence, next_run_at
     FROM ai_scheduled_tasks
     WHERE title = :title
     ORDER BY id ASC
     LIMIT 1'
);
$insertStmt = $pdo->prepare(
    'INSERT INTO ai_scheduled_tasks
       (title, instruction, recurrence, status, risk_level, next_run_at, created_by, created_at, updated_at)
     VALUES
       (:title, :instruction, :recurrence, "active", "review_required", :next_run_at, :created_by, NOW(), NOW())'
);

$items = [];
$created = 0;
foreach ($defaults as $default) {
    $selectStmt->execute([':title' => $default['title']]);
    $existing = $selectStmt->fetch();

    if ($existing) {
        $items[] = [
            'id' => (int) $existing['id'],
            'title' => $existing['title'],
            'status' => $existing['status'],
            'recurrence' => $existing['recurrence'],
            'next_run_at' => $existing['next_run_at'],
            'created' => false,
        ];
        continue;
    }

    $insertStmt->execute([
        ':title' => $default['title'],
        ':instruction' => $default['instruction'],
        ':recurrence' => $default['recurrence'],
        ':next_run_at' => next_run_at($default['recurrence']),
        ':created_by' => (int) $user['id'],
    ]);
    $created++;

    $items[] = [
        'id' => (int) $pdo->lastInsertId(),
        'title' => $default['title'],
        'status' => 'active',
        'recurrence' => $default['recurrence'],
        'next_run_at' => next_run_at($default['recurrence']),
        'created' => true,
    ];
}

audit_log('task.ensure_defaults', [
    'created' => $created,
    'checked' => count($defaults),
], (int) $user['id']);

json_response(['ok' => true, 'data' => ['created' => $created, 'tasks' => $items]]);
