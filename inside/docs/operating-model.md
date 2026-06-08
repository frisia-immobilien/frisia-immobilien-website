# Frisia Inside Operating Model

## Ziel

Frisia Inside ist das interne Steuerungszentrum fuer Website, SEO/GEO, Marktdaten, Leadgen, Propstack und KI-gestuetzte Arbeitsauftraege.

Die Anwendung laeuft vollstaendig auf TecSpace:

- statische Next.js/React-Oberflaeche
- PHP 8.4 Backend
- TecSpace MySQL
- keine Weiterleitung zu Vercel, VPS oder externem App-Hosting
- KI nur per serverseitiger API-Anbindung, keine API-Keys im Browser

## Arbeitsrollen

Jeder Operator-/KI-Prozess wird gegen diese Rollen geprueft:

- Abschluss-Stratege Immobilien
- Google SEO/GEO Experte
- Datenarchitekt fuer skalierte Content-Systeme
- Risiko- und Rechtssicherheits-Architekt
- Next.js/PHP/TecSpace Betreiber
- UX- und visuelle Nutzerfuehrungs-Instanz
- Sebastian als finale Freigabeinstanz

## Grundprinzip

Die KI darf analysieren, priorisieren und Vorschlaege erzeugen. Sie darf nicht unkontrolliert live veraendern.

Freigabekette:

1. Auftrag erfassen
2. Kontext sammeln
3. Risiko bewerten
4. Vorschlag erstellen
5. Freigabe anfordern
6. Umsetzung ausfuehren
7. Live-Pruefung dokumentieren

## Module

### Website Operator

Der Operator nimmt natuerliche Anweisungen entgegen, zum Beispiel:

- "Pruefe /immobilienmakler-aurich auf SEO/GEO-Risiken"
- "Plane alle 4 Wochen ein FAQ-Review fuer Immobilienmakler Aurich"
- "Warum ist diese Ortsseite noindex?"
- "Bereite eine Aenderung vor, aber veroeffentliche sie erst nach Freigabe"

Jeder Auftrag erzeugt ein nachvollziehbares Protokoll in `operator_conversations` und `operator_messages`.

### AI Scheduler

Wiederkehrende Aufgaben werden in `ai_scheduled_tasks` gespeichert. Jeder Lauf erzeugt einen Eintrag in `ai_task_runs`.

Unterstuetzte Rhythmen:

- einmalig
- woechentlich
- alle 4 Wochen
- monatlich
- quartalsweise

Geplante Aufgaben starten nicht automatisch Live-Aenderungen. Standardstatus fuer Ergebnisse ist `needs_review`.

Aktueller Betriebsstand:

- `POST /api/tasks/run-due.php` startet faellige Aufgaben.
- Eingeloggte Nutzer koennen mit `{"force": true}` einen manuellen Review-Testlauf starten.
- Eingeloggte Nutzer koennen mit `{"task_id": ID, "force": true}` eine einzelne Aufgabe pruefen.
- `GET /api/tasks/runs.php` liefert die letzten Review-Laeufe fuer die UI.
- `POST /api/tasks/update.php` pausiert, reaktiviert oder archiviert Aufgaben.
- `POST /api/tasks/ensure-defaults.php` stellt die Standardaufgaben ohne Duplikate sicher.
- `POST /api/operations/run.php` erzeugt einen protokollierten Betriebscheck.
- `POST /api/seo/seed-strategic.php` legt strategische Orts-/Seitentyp-Kandidaten als interne Review-Basis an.
- `GET /api/seo/audit-summary.php` liefert IMV-/SEO-Kennzahlen fuer die UI.
- `POST /api/imv/import-runtime.php` importiert Haus- und Wohnungsmarktdaten aus der privaten Runtime-Datei.
- `POST /api/imv/import-website-locations.php` importiert alle Website-Orte aus der privaten Website-Runtime-Datei.
- `GET /api/imv/summary.php` liefert IMV-Marktdaten- und Clipping-Kennzahlen.
- `GET /api/imv/market-records.php` liefert Marktdaten mit Quellen und Raw-Variablen.
- `GET /api/imv/website-locations.php` liefert Website-Orte mit Status fuer Live-Sichtbarkeit, Leadgenerator und Sitemap-Indexierung.
- `POST /api/imv/ensure-clipping-sources.php` legt regelkonforme Clipping-Quellen an.
- `GET /api/imv/clippings.php` liefert Clipping-Quellen und spaetere Clipping-Eintraege.
- Cron darf nur faellige Aufgaben starten und braucht den serverseitigen Cron-Token.
- Jede Task-Aenderung wird in `inside_audit_log` protokolliert.

Standardaufgaben:

- SEO/GEO Wochenpruefung
- FAQ-Review Immobilienmakler Aurich
- Frisia Inside Betriebscheck
- IMV Datenqualitaets-Review

### SEO/GEO Governance

Die Qualitaetslogik folgt dem dokumentierten Leadgenerator-/SEO-System:

- keine pauschale Indexierung schwacher Seiten
- Quellenqualitaet vor Skalierung
- echte lokale Daten statt generischer Fuelltexte
- `indexing_state` statt reinem Boolean
- Search-Console-Feedback nur zeitlich entkoppelt auswerten
- Reviewpflicht bei niedrigem Quellenvertrauen, Duplicate-Risiko oder schwacher lokaler Einzigartigkeit

### IMV Datenbank

Die Datenbank fuehrt zusammen:

- Orte und Seitentypen
- Marktdaten
- Quellen
- Freshness
- Scores
- Search-Console-Zeitreihen
- Leadgen-/Propstack-Daten
- Review- und Freigabestatus

Excel-Dateien bleiben Import-/Seed-Quellen, nicht operative Wahrheit.

Aktueller Seed:

- 15 strategische Orte
- 6 Seitentypen pro Ort
- 90 interne URL-Kandidaten
- alle Kandidaten mit Quality-Row, interner Quelle und `pending_review`
- keine automatische Indexierungsfreigabe

Aktueller Marktdatenimport:

- 1.436 eindeutige Marktdatensaetze
- 977 unterschiedliche Marktorte
- 1.197 Wohnungsdatensaetze
- 239 Hausdatensaetze
- 1.000 Landingpage-Datensaetze
- 1.436 Leadgen-Datensaetze
- alle Raw-Variablen bleiben in `imv_market_records.raw_json` nachvollziehbar
- die UI zeigt den Datenverlauf nicht mehr als flache Tabelle, sondern als Regionen-Hub:
  Landkreis/Region -> Ort -> Datensaetze mit Quellen, Attributen und Raw-Variablen
- jede Ortskarte zeigt links neben dem Ortsnamen zwei Statuslichter:
  Website/Live und Leadgenerator
- `imv_website_locations` enthaelt alle aus der Website-Runtime importierten Orte, auch wenn fuer einen Ort noch kein separater IMV-Marktdatensatz vorhanden ist
- aktueller Website-Orte-Import: 977 Orte, davon 793 Website/Live, 977 Leadgenerator, 625 nach Sitemap-/Indexlogik indexierbar

Aktueller Clipping-Stand:

- 6 Quellen angelegt: ImmobilienScout24, Kleinanzeigen, Immowelt, ON/OZ, Emder Zeitung, regionale Foren/Gruppen
- Status `planned`, weil kein automatisches nicht genehmigtes Massenscraping umgesetzt wird
- Workflow speichert Quellenlink, Titel, kurze eigene Zusammenfassung, Ort, Thema, kurze zulaessige Auszuege und Reviewstatus

## Sicherheitsregeln

- API-Keys liegen nur in `private/config.php`.
- `private/` und `storage/` sind per `.htaccess` gesperrt.
- Jeder schreibende Prozess erfordert Login oder Cron-Token.
- Alle Aktionen werden in `inside_audit_log` protokolliert.
- Live-Aenderungen an Website, Datenbank, SEO-Status oder Indexierung brauchen Freigabe.
- KI-Ausgaben gelten als Vorschlaege, nicht als Quelle.

## Deployment-Prozess

1. Lokal bauen: `npm run build:inside`
2. Inhalt aus `inside/out/` nach TecSpace DocumentRoot `frisia-inside` hochladen
3. Auf TecSpace `private/config.php` aus `private/config.example.php` erstellen
4. MySQL-Schema aus `inside/database/schema.sql` ausfuehren
5. Admin per `/api/setup/create-admin.php` mit Setup-Token erzeugen
6. Healthcheck pruefen: `/api/health.php`
7. Login testen
8. Scheduler-Smoke-Test ausfuehren

## Startfaehige Ausbaustufen

### Phase 1

- statische UI
- PHP Healthcheck
- MySQL-Verbindung
- Login
- Scheduler-Grundlogik
- Operator-Protokollierung

### Phase 2

- zentrale Operator-Auswertung serverseitig nutzen
- Scheduler-Laeufe mit Ergebnis-JSON und Reviewstatus speichern
- manuelle Review-Testlaeufe aus der UI starten
- Betriebs- und Integrationsuebersicht bereitstellen
- Task-Lifecycle in der UI steuern: pausieren, fortsetzen, archivieren
- Review-Details in der UI aufklappen
- Operator-Historie in der UI anzeigen
- Audit-Protokoll in der UI anzeigen
- Standardaufgaben in der UI sicherstellen
- Operations-Check in der UI starten und protokollieren
- strategische IMV-/SEO-Basis in der UI anlegen
- IMV-/SEO-Kennzahlen in der UI anzeigen
- IMV-Marktdaten mit Quellen und Raw-Variablen in der UI anzeigen
- IMV-Clipping-Quellen in der UI anzeigen
- OpenAI API serverseitig anbinden
- Tool-Grenzen definieren
- SEO/GEO Audit-Reports erzeugen
- Search Console Import vorbereiten

Status: Die Operator-/Scheduler-Basis, die Systemuebersicht, der Task-Lifecycle, die Operator-Historie, das Audit-Protokoll, Standardaufgaben und der Operations-Check sind live. OpenAI ist vorbereitet, aber ohne API-Key laeuft der konservative Fallback-Modus.

### Phase 3

- Propstack-/Leadgen-Sync
- IMV-Datenbankansichten
- Review- und Freigabe-Workflows
- sichere Umsetzungsvorschlaege fuer Website-Aenderungen

### Phase 4

- automatische Revalidierung
- Quellen-Freshness
- Quality-Score-Historie
- Report-Export
- kontrollierte Deploy-/Patch-Vorschlaege
