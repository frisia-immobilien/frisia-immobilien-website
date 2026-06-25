# Frisia Tagescockpit und Operator Board

Stand: 2026-06-25

Diese Datei ist die Startakte fuer die spaetere Umsetzung. Sie enthaelt keine
Secrets, API-Keys oder Zugangsdaten.

## Ziel

Ein internes Arbeitscockpit auf `frisia-inside.de`, das ein einfaches
Trello-aehnliches Aufgabenboard mit Propstack-Terminen, Propstack-Aufgaben,
Propstack-Aktivitaeten, E-Mail-Signalen und KI-Empfehlungen verbindet.

Das wichtigste Ziel ist nicht nur Aufgaben zu speichern, sondern den Tag
operativ vorzubereiten:

- Was muss heute passieren?
- Was liegt zu lange?
- Welche Rueckrufe, Termine und E-Mails sind kritisch?
- Welche Aufgaben koennen Mitarbeiter uebernehmen?
- Welche Todo-Karte ist eigentlich ein Projekt?
- Welche Akquise ist heute sinnvoll?

## Kernidee

```text
Frisia Aufgabenboard
+ Propstack Aufgaben
+ Propstack Kalender / Termine
+ Propstack E-Mail- und Aktivitaetsverlauf
+ MarktwertReport-Leads
+ spaeter Call-Cockpit-Rueckrufe
-> Frisia Inside Sync
-> lokale MySQL-Arbeitsdaten
-> KI bewertet Dringlichkeit, Kontext und naechste Schritte
-> Tagescockpit, Projektvorschlaege und Mitarbeiter-Empfehlungen
```

## Technische Grundlage

- Server: `frisia-inside.de`
- Backend: vorhandene PHP-API unter `inside/public/api/...`
- Datenbank: vorhandene MySQL-Struktur auf Frisia Inside
- Frontend: vorhandene statische Next.js/React-Oberflaeche unter
  `inside/app/...`
- Bestehende Basis:
  - Login/Auth ist vorhanden.
  - Scheduler ist vorhanden.
  - Operator-Chat ist vorhanden.
  - OpenAI-Anbindung ist vorbereitet.
  - Propstack-Helfer existiert unter `inside/public/api/lib/propstack.php`.
  - Website nutzt Propstack v1 bereits fuer Kontakte, Aufgaben und Nachrichten.
- Aktualisierung:
  - Board-Aktionen direkt per API.
  - Tagescockpit per Polling oder manueller Aktualisierung.
  - Propstack-Sync per Button und spaeter per Cron.
- Propstack API:
  - `https://api.propstack.de/docs/index.html`
  - `https://api.propstack.de/v2/swagger_doc`

## Wichtigste Produktivitaetsfunktion

Die Kombination aus Aufgabenboard und Propstack-Kontext ist Phase 1.

Das System soll Aufgaben nicht isoliert anzeigen, sondern mit echten
CRM-Signalen verbinden:

- Aufgabe liegt im Board.
- Propstack zeigt dazu Termin, E-Mail, Aktivitaet oder Deal.
- KI erkennt Dringlichkeit und naechsten sinnvollen Schritt.
- Tagescockpit macht daraus eine konkrete Empfehlung.

Beispiel:

```text
Todo: Eigentuemer Mueller zurueckrufen
Propstack: E-Mail vor 2 Tagen, Termin morgen, kein Rueckruf dokumentiert
KI: Heute Vormittag anrufen, weil Terminvorbereitung sonst riskiert ist.
```

## MVP-Funktionen

### 1. Aufgabenboard

- Spalten anlegen
- Spalten umbenennen
- Spalten sortieren
- Todo-Karten anlegen
- Todo-Karten bearbeiten
- Todo-Karten loeschen oder archivieren
- Karten innerhalb einer Spalte verschieben
- Karten zwischen Spalten verschieben
- Verantwortlichen setzen
- Faelligkeit setzen
- Wichtigkeit setzen
- Kontakt/Propstack-ID optional verknuepfen

Empfohlene Startspalten:

```text
Eingang
Heute
Warten
Delegiert
Projekt
Erledigt
```

### 2. Tagescockpit

Die Startansicht soll nicht das Board duplizieren, sondern entscheiden helfen:

- Heute wichtig
- Zeitkritisch
- Liegt zu lange
- Propstack Rueckrufe / Aufgaben
- Termine heute und morgen
- E-Mail-/Aktivitaetssignale
- Akquise-Vorschlaege
- Mitarbeiter-Aufgaben
- Projektvorschlaege

### 3. Propstack Sync

Zuerst als manueller Test-Button, spaeter per Cron:

- Kontakte / Clients
- Aufgaben / Tasks
- Termine / Kalenderdaten, falls per API verfuegbar
- Aktivitaeten
- Nachrichten oder E-Mail-Signale
- Message-Trackings
- Deals / Client Properties
- Immobilien / Properties als Kontext
- Makler / Brokers fuer Mitarbeiter-Zuordnung

Wichtig: Vor der echten Implementierung muss mit dem konkreten Propstack-Key
geprueft werden, welche Endpunkte im Frisia-Account welche Daten liefern.
Insbesondere vollstaendige E-Mail-Inhalte und Kalendertermine sind zu
verifizieren. Falls Propstack keine vollstaendigen E-Mail-Texte liefert, nutzt
das MVP Aktivitaeten, Nachrichten-Metadaten und Message-Tracking-Signale.

### 4. KI-Briefing

Die KI erzeugt keine unkontrollierten Live-Aktionen, sondern Vorschlaege:

- Morgenbriefing
- Tagesplan
- Liegengeblieben-Hinweise
- Frist-/Terminwarnungen
- Projektvorschlaege
- Akquise-Empfehlungen
- Mitarbeiter-Vorschlaege
- naechste konkrete Aktion je wichtigem Vorgang

### 5. Projekt-Erkennung

Wenn eine Aufgabe zu gross wird, schlaegt die KI ein Projekt vor:

```text
Das ist kein einzelnes Todo mehr. Daraus sollte ein Projekt mit 5 Schritten
werden.
```

Der Nutzer entscheidet per Button:

- `Als Projekt anlegen`
- `Nur Hinweis behalten`
- `Ignorieren`

## Vorgeschlagene Dateien

Frontend:

```text
inside/app/tagescockpit/page.tsx
inside/app/tasks/page.tsx
inside/app/InsideApp.tsx
inside/app/globals.css

inside/app/components/tasks/TaskBoard.tsx
inside/app/components/tasks/TaskCard.tsx
inside/app/components/tasks/TaskColumn.tsx
inside/app/components/operator/DailyCockpit.tsx
inside/app/components/operator/RecommendationList.tsx
inside/app/components/operator/ProjectSuggestionModal.tsx
```

Wenn die bestehende `InsideApp.tsx` nicht weiter wachsen soll, neue Komponenten
unter `inside/app/components/...` auslagern und die Seiten nur als Wrapper
nutzen.

Backend:

```text
inside/public/api/tasks/boards.php
inside/public/api/tasks/columns.php
inside/public/api/tasks/cards.php
inside/public/api/tasks/reorder.php
inside/public/api/tasks/project-suggestions.php

inside/public/api/operator/daily-briefing.php
inside/public/api/operator/recommendations.php
inside/public/api/operator/stale-alerts.php
inside/public/api/operator/create-project.php

inside/public/api/propstack/probe.php
inside/public/api/propstack/sync-work-context.php
inside/public/api/propstack/work-items.php

inside/public/api/lib/propstack.php
inside/public/api/lib/operator.php
inside/public/api/lib/work-context.php
```

Optional spaeter:

```text
inside/public/api/operator/send-daily-mail.php
inside/public/api/operator/mark-recommendation-done.php
inside/public/api/operator/delegate-task.php
```

## Datenbank

### Aufgabenboard

```sql
CREATE TABLE task_boards (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  owner_user_id BIGINT UNSIGNED NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_boards_active (active)
);

CREATE TABLE task_columns (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  board_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(190) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  system_key VARCHAR(80) NULL,
  stale_after_days INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_columns_board (board_id, position),
  CONSTRAINT fk_task_columns_board FOREIGN KEY (board_id)
    REFERENCES task_boards(id) ON DELETE CASCADE
);

CREATE TABLE task_cards (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  board_id BIGINT UNSIGNED NOT NULL,
  column_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(220) NOT NULL,
  body MEDIUMTEXT NULL,
  position INT NOT NULL DEFAULT 0,
  priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
  status ENUM('open', 'waiting', 'delegated', 'done', 'archived') NOT NULL DEFAULT 'open',
  due_at DATETIME NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  propstack_client_id BIGINT UNSIGNED NULL,
  propstack_property_id BIGINT UNSIGNED NULL,
  propstack_deal_id BIGINT UNSIGNED NULL,
  source_type VARCHAR(60) NULL,
  source_id VARCHAR(120) NULL,
  last_activity_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_cards_board (board_id, column_id, position),
  INDEX idx_task_cards_due (due_at),
  INDEX idx_task_cards_assignee (assigned_user_id, status),
  INDEX idx_task_cards_propstack_client (propstack_client_id),
  CONSTRAINT fk_task_cards_board FOREIGN KEY (board_id)
    REFERENCES task_boards(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_cards_column FOREIGN KEY (column_id)
    REFERENCES task_columns(id) ON DELETE CASCADE
);
```

### Projekte

```sql
CREATE TABLE task_projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source_card_id BIGINT UNSIGNED NULL,
  title VARCHAR(220) NOT NULL,
  goal TEXT NULL,
  status ENUM('open', 'active', 'waiting', 'done', 'archived') NOT NULL DEFAULT 'open',
  owner_user_id BIGINT UNSIGNED NULL,
  propstack_client_id BIGINT UNSIGNED NULL,
  propstack_property_id BIGINT UNSIGNED NULL,
  due_at DATETIME NULL,
  ai_reason MEDIUMTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_projects_status (status, due_at),
  INDEX idx_task_projects_source_card (source_card_id)
);

CREATE TABLE task_project_steps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(220) NOT NULL,
  body TEXT NULL,
  position INT NOT NULL DEFAULT 0,
  status ENUM('open', 'waiting', 'done') NOT NULL DEFAULT 'open',
  assigned_user_id BIGINT UNSIGNED NULL,
  due_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_steps_project (project_id, position),
  CONSTRAINT fk_project_steps_project FOREIGN KEY (project_id)
    REFERENCES task_projects(id) ON DELETE CASCADE
);
```

### Propstack-Arbeitskontext

```sql
CREATE TABLE propstack_sync_runs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(80) NOT NULL,
  status ENUM('running', 'ok', 'partial', 'failed') NOT NULL DEFAULT 'running',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,
  items_seen INT NOT NULL DEFAULT 0,
  items_changed INT NOT NULL DEFAULT 0,
  error_text TEXT NULL,
  details_json JSON NULL,
  INDEX idx_propstack_sync_runs_started (started_at)
);

CREATE TABLE propstack_work_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  source_type ENUM(
    'task',
    'calendar_event',
    'activity',
    'message',
    'message_tracking',
    'deal',
    'client',
    'property',
    'lead'
  ) NOT NULL,
  external_id VARCHAR(120) NOT NULL,
  broker_id BIGINT UNSIGNED NULL,
  client_id BIGINT UNSIGNED NULL,
  property_id BIGINT UNSIGNED NULL,
  deal_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NULL,
  body_excerpt TEXT NULL,
  event_at DATETIME NULL,
  due_at DATETIME NULL,
  direction VARCHAR(40) NULL,
  status VARCHAR(80) NULL,
  importance_score DECIMAL(6,2) NULL,
  raw_payload_json JSON NULL,
  synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_propstack_work_item (source_type, external_id),
  INDEX idx_propstack_work_items_due (due_at),
  INDEX idx_propstack_work_items_event (event_at),
  INDEX idx_propstack_work_items_client (client_id),
  INDEX idx_propstack_work_items_broker (broker_id)
);
```

### KI-Ergebnisse

```sql
CREATE TABLE operator_daily_briefings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  briefing_date DATE NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  status ENUM('draft', 'shown', 'archived') NOT NULL DEFAULT 'draft',
  summary MEDIUMTEXT NOT NULL,
  result_json JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_operator_daily_briefing (briefing_date, user_id),
  INDEX idx_operator_daily_briefings_date (briefing_date)
);

CREATE TABLE operator_recommendations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  recommendation_type ENUM(
    'today',
    'stale',
    'deadline',
    'project',
    'akquise',
    'delegate',
    'prep'
  ) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body MEDIUMTEXT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
  assigned_user_id BIGINT UNSIGNED NULL,
  task_card_id BIGINT UNSIGNED NULL,
  propstack_work_item_id BIGINT UNSIGNED NULL,
  propstack_client_id BIGINT UNSIGNED NULL,
  due_at DATETIME NULL,
  status ENUM('open', 'accepted', 'done', 'ignored', 'archived') NOT NULL DEFAULT 'open',
  ai_reason MEDIUMTEXT NULL,
  raw_context_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operator_recommendations_status (status, priority, due_at),
  INDEX idx_operator_recommendations_type (recommendation_type, created_at)
);
```

## Konfiguration

Serverseitig, nicht im Browser und nicht im Repository:

```text
PROPSTACK_API_KEY=...
PROPSTACK_BASE_URL=https://api.propstack.de/v2
PROPSTACK_V1_BASE_URL=https://api.propstack.de/v1
OPENAI_API_KEY=...
OPENAI_MODEL=...
CRON_TOKEN=...
```

Diese Werte gehoeren in die private Frisia-Inside-Konfiguration, nicht in Git.

## Propstack-Endpunkte zuerst testen

Bestehende Website-Logik nutzt v1 bereits fuer:

```text
GET/POST/PUT /contacts
GET/POST/PUT /tasks
POST /messages
GET /brokers
GET /deal_pipelines
GET /property_statuses
GET /contact_sources
GET /activity_types oder /note_types
GET/POST/PUT /client_properties
```

Die offizielle v2-Dokumentation nennt u. a.:

```text
/clients
/activities
/client_properties
/properties
/brokers
/message_trackings
/history
```

Testreihenfolge:

1. `inside/public/api/propstack/probe.php` bauen.
2. Mit serverseitigem API-Key nur kleine `per=2` Requests testen.
3. Rueckgabeformen dokumentieren:
   - Welche Felder enthalten Datum/Faelligkeit?
   - Welche Felder enthalten Broker/Mitarbeiter?
   - Wie wird E-Mail-Kommunikation dargestellt?
   - Gibt es echte Kalender-/Termin-Endpunkte?
   - Welche IDs verbinden Kontakte, Aufgaben, Termine und Deals?
4. Erst danach die Sync-Mapper finalisieren.

## KI-Logik

Die KI soll strukturiertes JSON erzeugen, damit das UI stabil bleibt.

Empfohlenes Ergebnisformat:

```json
{
  "summary": "Kurzes Morgenbriefing",
  "must_do": [],
  "should_do": [],
  "delegate": [],
  "akquise": [],
  "stale_alerts": [],
  "deadline_alerts": [],
  "project_suggestions": [],
  "suggested_day_plan": []
}
```

Die KI bekommt nur vorbereiteten Kontext, keine kompletten Datenbankdumps:

- offene Board-Aufgaben
- ueberfaellige Board-Aufgaben
- Aufgaben ohne Bewegung
- Propstack-Items der letzten 14 bis 30 Tage
- Termine heute/morgen/naechste Woche
- E-Mail-/Aktivitaetssignale
- MarktwertReport-Leads mit Status
- optional spaeter Call-Cockpit-Daten

## Bewertungsregeln

Vor der KI sollte eine regelbasierte Vorauswahl laufen.

Hohe Prioritaet:

- Faellig heute oder ueberfaellig
- Termin heute oder morgen
- Kunde hat geschrieben, aber keine Folgeaktivitaet
- MarktwertReport-Lead wurde erstellt/geoeffnet, aber kein Rueckruf
- Aufgabe liegt laenger als Spalten-Grenzwert
- Deal oder Eigentuemerkontakt in aktiver Akquise
- Mitarbeiter wartet auf Freigabe

Projektvorschlag:

- Todo enthaelt mehrere echte Schritte
- mehrere Personen oder Abhaengigkeiten beteiligt
- Dauer vermutlich laenger als 2 Stunden
- braucht Vorbereitung, Unterlagen, Termin, Rueckfrage oder Freigabe
- Aufgabe blockiert mehrere andere Aufgaben

Akquise-Vorschlag:

- alter Kontakt mit aktueller Aktivitaet
- MarktwertReport-Lead ohne persoenliche Nachfassung
- Eigentuemer-Kontakt mit positiver Reaktion
- Kontakt mit Termin-/E-Mail-Signal, aber ohne klaren naechsten Schritt

## API-Verhalten

Alle APIs:

- nur nach Inside-Login
- JSON-Antworten mit `ok`, `data`, `error`
- Audit-Log fuer Schreibaktionen
- keine Secrets in Antworten
- keine automatischen Propstack-Schreibaktionen ohne expliziten Button

Beispiel-Endpunkte:

```text
GET  /api/tasks/boards.php
POST /api/tasks/boards.php
POST /api/tasks/columns.php
POST /api/tasks/cards.php
POST /api/tasks/reorder.php

POST /api/propstack/probe.php
POST /api/propstack/sync-work-context.php
GET  /api/propstack/work-items.php

GET  /api/operator/daily-briefing.php
POST /api/operator/daily-briefing.php
GET  /api/operator/recommendations.php
POST /api/operator/create-project.php
```

## UI-Aufbau

### Tagescockpit

Oberer Bereich:

- Datum
- `Heute wichtig`
- `Zeitkritisch`
- `Liegengeblieben`
- `Akquise`
- `Delegieren`

Mittlerer Bereich:

- Tagesplan in Reihenfolge
- Termine und Vorbereitung
- Propstack-Kontext zu ausgewaehltem Punkt

Unterer Bereich:

- Projektvorschlaege
- Mitarbeiter-Aufgaben
- letzte KI-Briefings

### Aufgabenboard

- Spalten nebeneinander
- Karten drag-and-drop
- kompakte Karte mit Titel, Faelligkeit, Prioritaet, Verantwortlichem
- Detailpanel rechts oder Modal
- Button `Projekt daraus machen`
- Button `Propstack oeffnen`, wenn verknuepft
- Button `Erledigt`

## Sicherheit und Datenschutz

- Propstack-Key nur serverseitig.
- OpenAI-Key nur serverseitig.
- Keine vollstaendigen E-Mail-Archive unnoetig lokal duplizieren.
- Wenn E-Mail-Inhalte synchronisiert werden, nur relevante Auszuege speichern.
- Raw-Payloads zeitlich begrenzen oder spaeter bereinigen.
- Mitarbeiter sehen idealerweise nur eigene Aufgaben und freigegebene Bereiche.
- KI darf priorisieren, zusammenfassen und Vorschlaege vorbereiten.
- KI darf ohne Freigabe keine E-Mails senden, Aufgaben in Propstack aendern oder
  Mitarbeiter verbindlich beauftragen.

## Umsetzungsplan

1. Bestehende Frisia-Inside-Struktur lesen.
2. Datenbanktabellen fuer Board, Projekte, Propstack-Kontext und Empfehlungen
   anlegen.
3. Aufgabenboard bauen:
   - Spalten
   - Karten
   - Umbenennen
   - Verschieben
   - Faelligkeit
   - Verantwortlicher
4. Propstack-Probe bauen und Endpunkte mit echtem API-Key testen.
5. Propstack-Sync fuer Aufgaben/Aktivitaeten/E-Mail-Signale/Termine bauen,
   soweit die API sie liefert.
6. Tagescockpit als erste Arbeitsansicht bauen.
7. Regelbasierte Priorisierung implementieren.
8. KI-Briefing mit strukturiertem JSON ergaenzen.
9. Projektvorschlaege mit Button `Als Projekt anlegen` bauen.
10. Mitarbeiter- und Akquise-Empfehlungen ergaenzen.
11. Cron fuer Sync und Morgenbriefing aktivieren.
12. Live-Test mit echten Propstack-Daten und manuell gepruefter Ausgabe.

## Startanweisung fuer spaetere Umsetzung

Wenn dieses Projekt spaeter gestartet wird:

1. Zuerst `docs/PROJECT-KNOWLEDGE.md` und diese Datei lesen.
2. Bestehende Inside-Struktur pruefen:

   ```bash
   rg -n "operator|propstack|openai|auth|tasks|database" inside/public/api inside/app inside/database
   ```

3. Aktuelles Schema lesen:

   ```bash
   sed -n '1,260p' inside/database/schema.sql
   ```

4. Bestehende Propstack-Clients lesen:

   ```bash
   sed -n '1,220p' inside/public/api/lib/propstack.php
   rg -n "propstackV1Fetch|/tasks|/messages|/contacts|activity" web/lib
   ```

5. Zuerst nicht das ganze System bauen, sondern:
   - `propstack/probe.php`
   - kleine API-Tests
   - Aufgabenboard-Tabellen
   - Board-UI
6. Danach Tagescockpit und KI-Briefing ergaenzen.
7. Vor Live-Deploy:

   ```bash
   npm run build:inside
   ```

8. Live-Deploy nur nach expliziter Freigabe:

   ```bash
   npm run deploy:inside
   ```

## Zeitbedarf

- Einfaches Aufgabenboard: ca. 1 Tag
- Board plus Projektvorschlaege: ca. 2 Tage
- Propstack-Probe und erster Sync: ca. 1 bis 2 Tage
- Tagescockpit mit regelbasierter Priorisierung: ca. 1 Tag
- KI-Morgenbriefing und Empfehlungen: ca. 1 Tag
- Alltagstauglich mit Kalender/E-Mail-Signalen, Mitarbeiter-Zuordnung,
  Fehlerfaellen und sauberem UI: ca. 5 bis 8 Arbeitstage

Der genaue Aufwand haengt davon ab, welche Termin- und E-Mail-Daten Propstack
im Frisia-Account per API vollstaendig bereitstellt.

## Offene Punkte vor Implementierung

- Propstack-Key serverseitig in Frisia Inside aktivieren.
- Propstack-Endpunkte fuer Termine/Kalender verifizieren.
- Propstack-Endpunkte fuer E-Mail-Inhalte oder E-Mail-Signale verifizieren.
- Mitarbeiter-/Broker-Zuordnung definieren.
- Startspalten des Boards final festlegen.
- Regeln fuer `liegt zu lange` pro Spalte festlegen.
- Entscheiden, ob KI-Briefing nur fuer Sebastian oder pro Mitarbeiter erzeugt
  wird.
- Entscheiden, ob Empfehlungen automatisch als Todo-Karten vorgeschlagen oder
  nur angezeigt werden.

## Erfolgskriterien

Das Projekt ist erfolgreich, wenn morgens in Frisia Inside ohne Suche sichtbar
ist:

- die wichtigsten Aufgaben fuer heute
- alle kritischen Termine und Rueckrufe
- liegengebliebene Vorgaenge
- konkrete Akquise-Vorschlaege
- delegierbare Mitarbeiter-Aufgaben
- Projektvorschlaege fuer zu grosse Todos
- direkter Propstack-Kontext mit Link zum Kontakt/Deal/Objekt

Das System soll nicht mehr Arbeit erzeugen, sondern aus verteilten Informationen
eine klare Arbeitsreihenfolge machen.
