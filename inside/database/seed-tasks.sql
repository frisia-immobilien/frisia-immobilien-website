INSERT INTO ai_scheduled_tasks
  (title, instruction, recurrence, status, risk_level, next_run_at, created_by, created_at, updated_at)
SELECT
  'SEO/GEO Wochenpruefung',
  'Pruefe Search-Console-Daten, Indexierung, Canonicals, Sitemap, Schema, interne Links und Seitenqualitaet. Erstelle priorisierte Massnahmen. Keine Live-Aenderungen ohne Freigabe.',
  'weekly',
  'active',
  'review_required',
  DATE_ADD(NOW(), INTERVAL 1 WEEK),
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM ai_scheduled_tasks WHERE title = 'SEO/GEO Wochenpruefung'
);

INSERT INTO ai_scheduled_tasks
  (title, instruction, recurrence, status, risk_level, next_run_at, created_by, created_at, updated_at)
SELECT
  'FAQ-Review Immobilienmakler Aurich',
  'Pruefe alle 4 Wochen Suchintentionen und FAQ-Signale zu Immobilienmakler Aurich. Vergleiche mit /immobilienmakler-aurich und erstelle konkrete FAQ-Aktualisierungsvorschlaege mit Quellenhinweis.',
  'every_4_weeks',
  'active',
  'review_required',
  DATE_ADD(NOW(), INTERVAL 4 WEEK),
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM ai_scheduled_tasks WHERE title = 'FAQ-Review Immobilienmakler Aurich'
);

INSERT INTO ai_scheduled_tasks
  (title, instruction, recurrence, status, risk_level, next_run_at, created_by, created_at, updated_at)
SELECT
  'Frisia Inside Betriebscheck',
  'Pruefe Healthcheck, Datenbank, Cron, OpenAI, Propstack, Search Console, Audit-Log und letzte Scheduler-Fehler. Erstelle eine knappe Betriebsbewertung mit naechsten Massnahmen. Keine Live-Aenderungen ohne Freigabe.',
  'weekly',
  'active',
  'review_required',
  DATE_ADD(NOW(), INTERVAL 1 WEEK),
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM ai_scheduled_tasks WHERE title = 'Frisia Inside Betriebscheck'
);

INSERT INTO ai_scheduled_tasks
  (title, instruction, recurrence, status, risk_level, next_run_at, created_by, created_at, updated_at)
SELECT
  'IMV Datenqualitaets-Review',
  'Pruefe IMV-/SEO-Ortsdaten, Quellen, Freshness, Quality-Scores, Duplicate-Risk, lokale Einzigartigkeit und pending Reviews. Priorisiere Orte mit hohem Lead- und SEO-Potenzial. Keine Indexierungsfreigabe ohne ausreichende Datenqualitaet.',
  'weekly',
  'active',
  'review_required',
  DATE_ADD(NOW(), INTERVAL 1 WEEK),
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM ai_scheduled_tasks WHERE title = 'IMV Datenqualitaets-Review'
);
