# Frisia Immobilien Projektwissen

Stand: 2026-05-12

Diese Datei ist der zentrale Codex-/Operator-Kontext fuer das Projekt. Sie enthaelt bewusst keine Passwoerter, API-Keys oder privaten Tokens.

## Grundsatz

- Keine Secrets ins Repository schreiben.
- Lokale und serverseitige Konfigurationen bleiben in ignorierten Dateien.
- Live-Aenderungen an SEO, Indexierung, Datenbank oder Website-Inhalten brauchen Freigabe.
- KI-Funktionen duerfen analysieren, priorisieren und Vorschlaege vorbereiten, aber nicht unkontrolliert live veroeffentlichen.

## Repository-Struktur

- `web/`: Hauptwebsite `frisia-immobilien.de`, Next.js 16.1.4, Vercel-Deployment.
- `inside/`: neues Frisia-Inside-Intranet fuer TecSpace.
- `inside/app/`: statische Next.js/React-Oberflaeche fuer Frisia Inside.
- `inside/public/api/`: PHP-Backend fuer TecSpace.
- `inside/database/`: MySQL-Schema und Seed-Aufgaben fuer Frisia Inside.
- `inside/docs/`: Betriebsmodell fuer Frisia Inside.
- `web/docs/leadgenerator-seo-system.md`: SEO/GEO-, Leadgenerator- und Marktdaten-Governance.
- `scripts/`: Import-, Build- und Deployment-Helfer.
- `data/market/`: Marktdaten-/Import-Kontext fuer Landingpages und Leadgenerator.

## Hauptwebsite

Die Hauptwebsite liegt unter `web/` und wird weiter als Next.js-App betrieben.

Wichtige Befehle:

```bash
npm run dev
npm run build
```

Wichtige bekannte Punkte:

- Vercel erkennt und baut die Hauptwebsite aus `web/`.
- Build-Themen, die bereits aufgetreten sind: falsche Output Directory, Next.js-Erkennung, lazy Database Client, fehlende `DATABASE_URL`.
- Stale-GSC-404s wurden technisch per Redirect behandelt:
  - `/location-type/ortsteil` -> `/regionen-ostfriesland`
  - `/location-type/stadt_gemeinde` -> `/regionen-ostfriesland`
  - `/&` -> `/`
- Die SEO/GEO-Qualitaetslogik soll zentral bleiben und nicht in einzelne Templates zerfasern.

## SEO/GEO Governance

Die Masterdatei bleibt Import-, Seed- und Referenzbasis, aber nicht operative Wahrheit. Operative Wahrheit soll langfristig in der Datenbank liegen.

Zentrale Zieltabellen und Felder sind in `web/docs/leadgenerator-seo-system.md` dokumentiert.

Wichtige Prinzipien:

- Keine pauschale Indexierung schwacher Ortsseiten.
- Keine generischen KI-/SEO-Fuelltexte.
- Externe Daten muessen lokal relevant und nachvollziehbar sein.
- Quellen, Freshness, Scores und Reviewstatus werden versioniert.
- `indexing_state` ersetzt reine Boolean-Logik.
- Search-Console-Signale fliessen zeitlich entkoppelt in die Qualitaetsbewertung ein.
- Noindex-Seiten duerfen nicht prominent verlinkt und nicht in Sitemaps aufgenommen werden.

Wichtige Felder:

- `quality_score`
- `source_confidence`
- `has_external_validation`
- `indexing_reason`
- `indexing_state`
- `performance_state`
- `data_freshness`
- `local_uniqueness_score`
- `entity_depth_score`
- `duplicate_risk`
- `source_urls`
- `review_status`
- `reviewed_by`
- `last_verified_at`
- `last_search_console_check_at`
- `impression_trend`
- `indexation_stability`
- `crawl_efficiency`
- `valid_from`
- `valid_to`
- `source_timestamp`

Wichtige Quellen fuer regionale Daten:

- BORIS Niedersachsen
- LGLN OpenGeoData
- Gutachterausschuesse / Grundstuecksmarktberichte Niedersachsen
- Landesamt fuer Statistik Niedersachsen
- Destatis
- Kommunale und Landkreisquellen
- Frisia-eigene Leadgen-/CRM-/Propstack-Daten

## Frisia Inside

Ziel: internes Intranet unter `https://frisia-inside.de`, vollstaendig auf TecSpace, ohne Vercel/VPS/externe Hosting-Weiterleitung.

Architektur:

- Frontend: statischer Next.js/React-Export.
- Backend: PHP 8.4 auf TecSpace.
- Datenbank: TecSpace MySQL.
- KI: OpenAI/ChatGPT API nur serverseitig ueber PHP.
- Scheduler: TecSpace Cronjob, falls verfuegbar; sonst interner faelliger Task-Runner.

Live-Stand am 2026-05-11:

- `https://frisia-inside.de/` liefert HTTP 200.
- `https://frisia-inside.de/api/health.php` liefert PHP 8.4.12.
- `config_loaded` ist `true`.
- `database` ist `ok`.
- `openai_configured=false` und `propstack_configured=false`; die Integrationen sind vorbereitet, aber noch nicht mit Keys aktiviert.
- `/private/config.example.php` liefert HTTP 403, private Dateien sind live gesperrt.
- `/private/config.php` liefert HTTP 403, serverseitige Konfiguration ist live gesperrt.
- `/private/database/schema.sql` liefert HTTP 403, private SQL-Dateien sind live gesperrt.
- `api/setup/status.php` ist mit Setup-Token erreichbar und meldet `table_status=ok`.
- MySQL-Verbindung funktioniert mit Datenbankserver `10.101.2.151`, Port `51584`, Datenbank `106402_frisia_inside`, Benutzer `106402-frisia`.
- Erster Admin ist angelegt: `admin@frisia-immobilien.de`, Rolle `owner`. Das Passwort liegt nur lokal in `inside/deploy/bootstrap.env`.
- Live-Login gegen `/api/auth/login.php` wurde erfolgreich getestet.
- `/api/tasks/run-due.php` ist live getestet:
  - faellige Aufgaben ohne Force: `processed=0`
  - manueller Review-Testlauf mit Login: `processed=2`
- `/api/tasks/runs.php` liefert die letzten Scheduler-Laeufe fuer eingeloggte Nutzer.
- `/api/tasks/update.php` ist live getestet und unterstuetzt Pausieren, Fortsetzen und Archivieren geplanter Aufgaben.
- `/api/tasks/ensure-defaults.php` ist live getestet und stellt Standardaufgaben ohne Duplikate sicher.
- `/api/operations/run.php` ist live getestet und erstellt einen protokollierten Operations-Check fuer Datenbank, Cron, Scheduler, OpenAI, Propstack, Search Console, SEO-Daten und Fehlerlaeufe.
- `/api/seo/seed-strategic.php` ist live getestet und legt strategische IMV-/SEO-Ortsseiten als interne Review-Kandidaten an.
- `/api/seo/audit-summary.php` liefert nach Login Kennzahlen zu SEO-URLs, Quality-Rows, Pending Reviews, Quellen, Datenpunkten und Seitentypen.
- `/api/imv/import-runtime.php` importiert die privaten Runtime-Marktdaten in die Inside-Datenbank.
- `/api/imv/import-website-locations.php` importiert alle Website-Orte aus `private/import/website_locations.json` in `imv_website_locations`.
- `/api/imv/summary.php` liefert Marktdaten-, Orts-, Landingpage-, Leadgen- und Clipping-Kennzahlen.
- `/api/imv/market-records.php` liefert alle importierten Marktdatensaetze inklusive Quellen und Raw-Variablen.
- `/api/imv/website-locations.php` liefert importierte Website-Orte mit Status fuer Website/Live, Leadgenerator und Sitemap-Indexierung.
- `/api/imv/ensure-clipping-sources.php` legt regelkonforme IMV-Clipping-Quellen an.
- `/api/imv/clippings.php` liefert Clipping-Quellen und spaetere Clipping-Eintraege.
- `/api/audit/index.php` liefert nach Login die letzten Audit-Log-Eintraege fuer die UI.
- `/api/operator/conversations.php` liefert nach Login die letzten Operator-Gespraeche mit Vorschau.
- `/api/system/status.php` liefert nach Login eine Betriebs- und Integrationsuebersicht:
  - Readiness fuer Datenbank, Login, Scheduler, Cron, OpenAI, Propstack, Search Console und IMV/SEO-Daten
  - Kennzahlen fuer aktive/faellige Aufgaben, Review-Laeufe, SEO-Orte, GSC-Zeilen und Audit-Logs
  - naechster und letzter Scheduler-Lauf
- Operator und Scheduler nutzen eine zentrale serverseitige Auswertung in `inside/public/api/lib/operator.php`.
- OpenAI ist vorbereitet, aber noch nicht aktiv konfiguriert. Bis ein API-Key serverseitig gesetzt ist, arbeitet das System im regelbasierten Sicherheitsmodus `fallback`.
- Look & Feel ist an die Frisia-Immobilien-CI angepasst:
  - Logo aus `inside/public/logo.svg`
  - Navy, Sand, Graphite, Brackish und Brass aus der Hauptwebsite
  - Serif-Headlines nach Website-Vorbild
  - dezente Brass-Borders, helle Section-Flaechen und ruhige Premium-Karten
- Seed-Aufgaben sind angelegt:
  - `SEO/GEO Wochenpruefung`, weekly
  - `FAQ-Review Immobilienmakler Aurich`, every_4_weeks
  - `Frisia Inside Betriebscheck`, weekly
  - `IMV Datenqualitaets-Review`, weekly
- Live-Deploy am 2026-05-11 nach UI-Erweiterung geprueft:
  - Startseite HTTP 200
  - Healthcheck `database=ok`
  - geschuetzter Login erfolgreich
  - Audit-Endpunkt liefert Daten
  - Operator-Historie liefert Gespraeche
  - Task-Lifecycle Pause/Fortsetzen erfolgreich
- Live-Deploy am 2026-05-12 nach Operations-Erweiterung geprueft:
  - Startseite HTTP 200
  - Healthcheck `database=ok`
  - Standardaufgaben sichergestellt, 2 neue Aufgaben angelegt
  - Operations-Check erzeugt und protokolliert
  - faellige Aufgaben geprueft: `processed=0`
  - manueller Review-Basislauf erzeugt 4 Runs im Fallback-Modus
- Live-Deploy am 2026-05-12 nach IMV-/SEO-Seed geprueft:
  - Startseite HTTP 200
  - Healthcheck `database=ok`
  - 90 strategische URL-Kandidaten angelegt
  - 90 Quality-Rows angelegt
  - 90 interne Quellen angelegt
  - alle 90 Kandidaten bleiben `pending_review`
  - `indexable_verified=0`, also keine automatische Indexierungsfreigabe
- Live-Deploy am 2026-05-12 nach IMV-Datenverlauf geprueft:
  - Runtime-Marktdaten werden nach `private/import/leadgen_market_data.json` deployed
  - Runtime-Builder fuehrt Haus- und Wohnungs-XLSX zusammen
  - Import gelesen: 1.444 Zeilen
  - Datenbank eindeutig: 1.436 Marktdatensaetze
  - Objektarten: 1.197 Wohnung, 239 Haus
  - 977 unterschiedliche Marktorte
  - 1.000 Landingpage-Datensaetze
  - 1.436 Leadgen-Datensaetze
  - 6 IMV-Clipping-Quellen angelegt
  - Clippings selbst: 0, weil noch kein regelkonformer Quellenimport/RSS/API angebunden ist
- IMV-Datenverlauf-UI:
  - organisiert Marktdaten wie den oeffentlichen Regionen-Hub
  - Gruppierung: Landkreis/Region -> Ort -> einzelne Markt-Datensaetze
  - Ortskarten zeigen Datensatzanzahl, Objektarten, Verkaeufe, Median-Spanne, Vermarktungstage, Landing-/Leadgen-Flags und Quellenanzahl
  - Status links neben jedem Ort: gruen/rot fuer Website/Live und Leadgenerator
  - Details zeigen pro Datensatz Quelle, Importzeitpunkt, Attribute und Raw-Variablen
  - Website-Orte werden aus der Runtime-Datei importiert, damit auch Orte ohne separaten IMV-Datensatz sichtbar bleiben
- Live-Deploy am 2026-05-12 nach Website-Orte-Status geprueft:
  - `private/import/website_locations.json` deployed
  - `imv_website_locations` importiert: 977 Orte
  - Website/Live gruen: 793 Orte
  - Leadgenerator gruen: 977 Orte
  - Sitemap-/Indexlogik gruen: 625 Orte
  - Startseite HTTP 200, Healthcheck `database=ok`
- Noindex-/Nicht-Live-Testfall Westersander, Ihlow:
  - Ist-Zustand: Ortsteil Westersander, Ihlow, ein interner Wohnungs-Datensatz ohne Preis-/Verkaufs-/Vermarktungswerte, Website/Live false, Leadgen true.
  - Runtime-Anreicherung liegt in `data/market/runtime/seo_location_enrichments.json`.
  - Import-Endpunkt: `/api/seo/import-enrichments.php`.
  - Kandidaten: `/immobilienmakler-westersander`, `/immobilienbewertung-westersander`, `/haus-verkaufen-westersander`, `/immobilienpreise-westersander`.
  - Status bleibt `pending_review`; keine automatische Indexfreigabe.
  - Verwendete Quellen: Frisia Runtime, BORIS/LGLN WFS, Gemeinde Ihlow Ortschaft Ihlowerhoern, Gemeindeprofil, Bauleitplanung Ihlowerhoern, Bekanntmachung/Aussenbereichssatzung Westersander Strasse.
  - Qualitaetslogik: externe Validierung ja, `quality_score=66`, `source_confidence=82`, `local_uniqueness_score=74`, `entity_depth_score=79`, `duplicate_risk=34`, `data_freshness=fresh`.
  - Hinweis: PLZ-Angabe aus Runtime (`26605`) vor oeffentlicher Ausgabe manuell validieren; verwendete Gemeindequellen nennen die allgemeine Gemeindeadresse `26632 Ihlow`, nicht zwingend die konkrete Westersander-PLZ.

Wichtige Befehle:

```bash
npm run build:inside
npm run package:inside
npm run deploy:inside
npm run upload-config:inside
npm run bootstrap:inside
```

Wichtige lokale Dateien:

- `inside/deploy/ftps.env`: lokale Deploy-Konfiguration, ignoriert, enthaelt FTP-Passwort.
- `inside/deploy/server-config.php`: lokale Server-Konfiguration mit Setup-/Cron-Token, ignoriert.
- `inside/deploy/bootstrap.env`: lokale MySQL-/Admin-Bootstrap-Daten, ignoriert.
- `inside/public/private/config.php`: echte Server-Konfiguration, darf nicht committet werden.
- `inside/public/private/config.example.php`: Vorlage ohne Secrets.

Frisia-Inside-Module Phase 1:

- Login/Auth
- Setup-Endpunkt fuer ersten Admin
- PHP Healthcheck
- AI Scheduler Grundlogik
- Operator-Chat Grundlogik
- SEO-Audit-Summary Stub
- MySQL-Schema
- Seed-Aufgaben fuer SEO/GEO-Wochenpruefung und FAQ-Review

Frisia-Inside-Module Phase 2 live:

- zentrale Operator-Auswertung mit Sicherheitsrollen und Reviewpflicht
- regelbasierter Fallback, falls OpenAI nicht konfiguriert oder nicht erreichbar ist
- Scheduler-Run-Erzeugung mit `ai_task_runs`
- manueller Review-Testlauf aus der UI
- letzte Review-Laeufe in der UI sichtbar
- Detailansicht fuer Review-Laeufe in der UI
- Einzelausfuehrung geplanter Aufgaben aus der Scheduler-Tabelle
- Pausieren, Fortsetzen und Archivieren geplanter Aufgaben aus der UI
- Standardaufgaben aus der UI sicherstellen
- Operations-Check aus der UI starten
- strategische IMV-/SEO-Basis aus der UI anlegen
- IMV-/SEO-Kennzahlen in der UI anzeigen
- IMV-Marktdaten mit Quellen und Raw-Variablen in der UI anzeigen
- IMV-Clipping-Quellen in der UI anzeigen
- Runtime-Marktdaten aus Haus- und Wohnungs-XLSX importieren
- Systemuebersicht in der UI fuer Betriebsstatus, Integrationen und Datenbestand
- Operator-Historie in der UI sichtbar
- Audit-Protokoll in der UI sichtbar

Naechster Frisia-Inside-Schritt:

1. In `https://frisia-inside.de/` mit `admin@frisia-immobilien.de` und lokalem Admin-Passwort aus `inside/deploy/bootstrap.env` einloggen.
2. TecSpace-Cron fuer `/api/tasks/run-due.php?token=CRON_TOKEN` einrichten.
3. OpenAI API serverseitig in `private/config.php` konfigurieren.
4. Tool-Grenzen fuer KI-Operator definieren.
5. Search Console und Propstack anbinden.
6. Nach dem Setup die im sichtbaren Einrichtungsprozess genutzten Passwoerter vorsorglich rotieren.

## TecSpace

Bekannte Serverdaten:

- Server Name: `s00000000000009`
- Server IP: `45.67.68.53`
- Webspace-Root: `/home/www/106402`
- FTP/FTPS Host: `ftp.securehost.name`
- SSL-Option: explizites FTP ueber TLS
- Domain `frisia-inside.de`: Webspace, Ziel `frisia-inside`, SSL aktiviert

Bekannte FTP-Benutzer:

- `u106402-frisia_backup`
  - Typ: Webspace
  - DocumentRoot: `frisia-backups`
  - Zweck: Repository-Backups
- `u106402-frisia_inside`
  - Typ: Webspace
  - DocumentRoot: `frisia-inside`
  - Zweck: Deployment fuer Frisia Inside

## Backups

Backup-Ziel: TecSpace-Webspace-FTP-Benutzer `u106402-frisia_backup` mit DocumentRoot `frisia-backups`.

Remote-Dateien:

- `frisia-immobilien-backup-1-current.tar.gz`
- `frisia-immobilien-backup-1-current.tar.gz.sha256`
- `latest-manifest.txt`

Zuletzt verifizierter Remote-Stand:

- Groesse: `659817421` Bytes, ca. `641M`
- SHA256: `94f9f167953e7e35658e7cc0ec57cd910228e66cf42c2e41338ca8b1d7a37ce0`
- Archiv wurde vor Upload lokal mit `tar -tzf` geprueft.

Lokale Backup-Scripts liegen ausserhalb des Git-Repositories:

- `/Users/frisia01/Desktop/frisia-immobilien.de/backups/weekly_frisia_backup.sh`
- `/Users/frisia01/Desktop/frisia-immobilien.de/backups/weekly_remote.env`

Aktueller Zeitplan:

- macOS launchd Job
- Sonntag 03:00 Uhr
- Rotation: Slot 1 aktuell, Slot 2 aelter, Slot 3 aeltest

Wichtiger Betriebs-Hinweis:

- Der aktuelle Wochenjob wird vom lokalen Mac aus gestartet und laedt nach TecSpace hoch.
- Wenn das Backup rein serverseitig laufen soll, muss ein TecSpace-Cronjob oder ein anderer serverseitiger Runner eingerichtet werden.

## KI-/Operator-Zielbild

Der geplante interne Operator soll auf `frisia-inside.de` nutzbar sein:

- Chat mit Website-Kontext
- SEO/GEO-Audits
- geplante Aufgaben mit Datum und Wiederholung
- FAQ-Reviews
- GSC- und Schema-Pruefungen
- Vorschlaege fuer Content, interne Links und technische Massnahmen
- Freigabe-Workflow vor Live-Aenderung
- Audit-Log fuer alle Aktionen

Beispielaufgaben:

- woechentlich schwache SEO/GEO-Seiten pruefen
- alle 4 Wochen FAQ zu "Immobilienmakler Aurich" pruefen
- Search-Console-Verluste analysieren
- noindex/index-Konflikte melden
- Schema.org-Warnungen priorisieren

Aktueller Operator-Status:

- Der Operator beantwortet Chat-Auftraege serverseitig und protokolliert sie in `operator_conversations` und `operator_messages`.
- Scheduler-Laeufe speichern Ergebnis, Modus, Empfehlungen, Checkliste und Reviewpflicht als JSON in `ai_task_runs`.
- Ohne OpenAI-Key werden keine externen KI-Anfragen gesendet; stattdessen entsteht eine konservative Review-Vorlage.
- Jede Auswertung bleibt `needs_review`; automatische Live-Aenderungen sind technisch nicht aktiv.

## Schaufenster TV

Frisia Inside hat einen eigenen Bereich `Schaufenster TV`:

- Admin: `https://frisia-inside.de/schaufenster-tv/`
- TV-Anzeige: `https://frisia-inside.de/schaufenster-tv/live/`
- TV-Seite ist `noindex, nofollow` und fuer 1920 x 1080 / Full HD gestaltet.
- Die Anzeige rotiert zufaellig durch aktive Propstack-Immobilien und eigene Bildslides.
- Uebergaenge laufen als dezenter Fade.
- Propstack-Sync nutzt serverseitig den API-Key aus der privaten Konfiguration.
- Auswahlregel: Propstack-Einheit muss im Custom-Feld `schaufenster_tv` den Wert `Ja` oder einen gleichwertigen positiven Wert haben.
- Eigene Slides werden im Adminbereich hochgeladen und unter `/uploads/schaufenster/` gespeichert.
- PHP-Ausfuehrung im Upload-Verzeichnis ist per `.htaccess` deaktiviert.

Technischer Hinweis:

- TecSpace/PHP kann einzelne PHP-Dateien stark cachen. Fuer den aktuellen stabilen Sync wird deshalb der eigenstaendige Endpunkt `/api/schaufenster/sync-all-v2.php` genutzt.
- Bei Aenderungen an der Sync-Logik ggf. neue versionierte Endpoint-Datei anlegen oder Servercache explizit beruecksichtigen.
- Der letzte Live-Test am 13.05.2026 hat 86 Propstack-Objekte geprueft und 2 aktive Schaufenster-TV-Immobilien gefunden.
- Live-Fix am 15.05.2026: TV-Seite blieb auf statischem Brand-Fallback, obwohl `/api/schaufenster/items.php` 2 aktive Immobilien lieferte. Ursache wahrscheinlich fehlende/haengende Next-Hydration im TV-Browser. Fix: Cache-Buster im React-Fetch und zusaetzliches ES5-Rescue-Skript `/schaufenster-tv-live-rescue.js`, das nach 4,5 Sekunden ohne Next-Hydration direkt den oeffentlichen JSON-Endpunkt laedt und die Immobilien im TV-Layout rendert. Deploy geprueft: Live-HTML referenziert Rescue-Skript, Skript HTTP 200, Datenendpunkt 2 Items, Bildproxy HTTP 200.
- Zweiter Live-Fix am 15.05.2026: Da der TV weiter den statischen Fallback zeigte, wird `/schaufenster-tv/live/` jetzt per `.htaccess` intern auf `schaufenster-tv/live.php` geroutet. Diese PHP-Seite rendert die erste aktive Immobilie serverseitig direkt aus MySQL und nutzt `/schaufenster-tv-live-standalone.css`; JavaScript ist fuer die Erstansicht nicht mehr erforderlich. Verifiziert: `https://frisia-inside.de/schaufenster-tv/live/` und `http://frisia-inside.de/schaufenster-tv/live/` liefern HTTP 200 mit Immobilien-HTML, `Cache-Control: no-store`, Bildproxy HTTP 200. Die URL ohne Slash leitet auf `/schaufenster-tv/live/` weiter.
- CSS-Fix am 15.05.2026: TV-Browser stellte die PHP-Seite sichtbar dar, verstand aber moderne CSS-Regeln nicht korrekt. `schaufenster-tv-live-standalone.css` wurde auf altes, fest positioniertes Full-HD-CSS ohne CSS Grid, CSS-Variablen, `clamp()`, `min()` oder `max()` umgestellt. Die CSS wird in `live.php` inline ausgegeben, damit kein externer CSS-Cache auf dem TV stoert. Das Immobilienbild wird zusaetzlich als `background-image` gerendert, damit kein `object-fit` noetig ist.
- Auto-Refresh am 15.05.2026: `schaufenster-tv/live.php` sendet fuer den Q-Line-Monitor aktuell testweise alle 30 Sekunden einen HTTP-Refresh, einen Meta-Refresh und einen einfachen ES5-JavaScript-Refresh auf `/schaufenster-tv/live/?refresh=TIMESTAMP`. Dadurch aktualisiert sich der Inhalt ohne Tastendruck und umgeht Browser- oder Proxy-Caches.
- Full-HD-Layout-Fix am 15.05.2026: Die Standalone-TV-Ansicht nutzt eine feste 1920x1080-Buehne, passt diese aber per einfachem ES5-JavaScript an die tatsaechliche CSS-Viewport-Groesse des Philips-Q-Line-Browsers an. Hintergrund: Das Panel ist 1920x1080, der eingebaute Browser kann aber eine kleinere CSS-Viewport-Breite melden. Der rechte Textbereich hat feste Zonen fuer Titel/Preis/Metriken und Kontakt, damit Ansprechpartner, Preis und Logo nicht mehr ineinanderlaufen.
- Titel-Logik am 15.05.2026: `st_title()` priorisiert fuer Schaufenster-TV jetzt das Propstack-Custom-Feld `schaufenster_tv_titel` bzw. `einheit.custom.schaufenster_tv_titel`. Ist dieses leer oder nicht vorhanden, folgt der normale Propstack-Titel. Sind beide leer, wird `Objektart in Ort` als stabiler Fallback gebildet. Die Sync-Endpunkte reichen Property- und Unit-Daten gemeinsam an die Titel-Logik weiter; `st_map_property_row()` wertet zusaetzlich `raw_json.property/unit` aus, damit bereits synchronisierte Objekte den TV-Titel ohne erneuten DB-Schemawechsel nutzen koennen. Die TV-CSS begrenzt Headlines auf vier Zeilen ohne Worttrennung; kurze TV-Titel erhalten eine groessere Schriftklasse.
- Live-Layout-Haertung am 15.05.2026: Die rechte Kontaktzone der PHP-TV-Ansicht wurde fuer den Live-Betrieb entschlackt. Das grosse Logo wird in Immobilien-Slides nicht mehr im Kontaktblock angezeigt, weil es auf dem Philips-Browser mit Telefon/Maklerdaten kollidieren konnte. Branding bleibt im Footer; Maklerbild, Name, Telefon und Website liegen in festen Slots.
- HD-Ready-Test am 15.05.2026: Nach Hinweis, dass der Philips-Browser vermutlich HD-Ready statt Full-HD als CSS-Viewport nutzt, wurde die PHP-TV-Ansicht auf native `1280x720` bei 100 Prozent umgestellt. Kein CSS-Transform, keine JS-Skalierung; alle Koordinaten und Schriftgroessen sind proportional fuer HD-Ready gesetzt.
- Maklerbereich am 15.05.2026: Der untere Kontaktbereich der HD-Ready-TV-Ansicht wurde wieder sichtbarer wie zuvor gesetzt: rechts ausgerichteter Maklerblock mit groesserem Foto, Name, Position, Telefon und Website. Das grosse Frisia-Logo bleibt aus dem Kontaktblock entfernt, damit keine Ueberlagerung entsteht.

## Sicherheitsregeln fuer kuenftige Arbeit

- Keine API-Keys im Browser.
- Keine Passwoerter in Git.
- Keine KI-Autopublikation ohne Freigabe.
- Keine Marktdaten erfinden.
- Keine rechtlich/fachlich riskanten Aussagen ohne Review.
- Keine noindex-Seiten prominent verlinken.
- Keine noindex-Seiten in Sitemaps.
- Keine Scheingenauigkeit bei Immobilienpreisen, Vermarktungsdauer oder Transaktionszahlen.

## Aktuell offene Punkte

- OpenAI API serverseitig konfigurieren.
- TecSpace-Cron fuer faellige Scheduler-Aufgaben einrichten.
- Tool-Grenzen fuer KI-Operator definieren.
- Search Console API anbinden.
- Propstack-/Leadgen-Sync anbinden.
- Backup-Job bei Bedarf von lokalem launchd auf echten Server-Cron umstellen.
- Passwoerter, die waehrend der Einrichtung sichtbar waren, nach Abschluss rotieren.
