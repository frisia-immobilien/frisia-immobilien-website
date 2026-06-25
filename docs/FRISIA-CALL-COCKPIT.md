# Frisia Call Cockpit

Stand: 2026-06-25

Diese Datei ist die Startakte fuer die spaetere Umsetzung. Sie enthaelt keine
Secrets, API-Keys oder Zugangsdaten.

## Ziel

Ein internes Browserfenster auf `frisia-inside.de`, das bei eingehenden
Placetel-Anrufen automatisch den passenden Propstack-Kontakt, letzte
Aktivitaeten und optional einen KI-Gespraechshinweis anzeigt.

## Grundidee

```text
Placetel Anruf
-> Placetel Notify/Webhook
-> frisia-inside.de API
-> Telefonnummer normalisieren
-> Propstack Kontakt suchen
-> letzte Aktivitaeten laden
-> optional KI-Briefing erstellen
-> Call Cockpit im Browser aktualisiert sich
```

## Technische Grundlage

- Server: `frisia-inside.de`
- Backend: vorhandene PHP-API unter `inside/public/api/...`
- Datenbank: vorhandene MySQL-Struktur auf Frisia Inside
- Frontend: internes Browserfenster in der Inside-Oberflaeche
- Aktualisierung: Polling alle 2-3 Sekunden, kein WebSocket noetig
- Placetel Call-Control/Notify API:
  `https://www.placetel.de/hilfe/telefonanlage/call-control-notify-api`
- Placetel REST API:
  `https://www.placetel.de/hilfe/telefonanlage/rest-api`
- Propstack API:
  `https://api.propstack.de/docs/index.html`

## MVP-Funktionen

1. Placetel sendet eingehenden Anruf an:

   ```text
   https://frisia-inside.de/api/calls/placetel-webhook.php
   ```

2. Server speichert Call-Event:

   - Anrufernummer
   - angerufene Nummer/Nebenstelle
   - Richtung: `inbound` oder `outbound`
   - Status: `ringing`, `answered`, `missed`, `ended`
   - Zeitpunkt
   - Rohdaten von Placetel zur Diagnose

3. Server sucht Kontakt in Propstack:

   - Telefonnummer normalisieren, z. B. `04941...`, `+494941...`,
     Leerzeichen und Trennzeichen entfernen
   - Propstack `/clients` mit Telefonnummer durchsuchen
   - bei Treffer Kontakt-ID, Name, E-Mail, Status und Link speichern

4. Browser-Cockpit zeigt:

   - aktueller Anruf
   - Name
   - Telefonnummer
   - Kontaktstatus
   - letzte Aktivitaeten
   - Button `In Propstack oeffnen`
   - Button `als erledigt markieren`

5. KI optional:

   - letzte Aktivitaeten zusammenfassen
   - Rueckruf-/Akquise-Kontext erkennen
   - Gespraechseinstieg vorschlagen
   - nach dem Telefonat eine Notiz vorformulieren

## Vorgeschlagene Dateien

```text
inside/public/api/calls/placetel-webhook.php
inside/public/api/calls/latest.php
inside/public/api/calls/mark-seen.php
inside/public/api/calls/propstack-contact.php
inside/public/api/calls/ai-briefing.php

inside/app/calls/page.tsx
inside/app/calls/CallCockpit.tsx
```

## Datenbank

Neue Tabelle:

```sql
CREATE TABLE call_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(32) NOT NULL DEFAULT 'placetel',
  external_call_id VARCHAR(191) NULL,
  direction VARCHAR(32) NULL,
  status VARCHAR(32) NULL,
  caller_number_raw VARCHAR(80) NULL,
  caller_number_normalized VARCHAR(80) NULL,
  target_number_raw VARCHAR(80) NULL,
  target_extension VARCHAR(32) NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  propstack_client_id VARCHAR(64) NULL,
  propstack_client_name VARCHAR(191) NULL,
  propstack_client_url TEXT NULL,
  ai_summary MEDIUMTEXT NULL,
  raw_payload_json JSON NULL,
  seen_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_call_events_created_at (created_at),
  INDEX idx_call_events_seen_at (seen_at),
  INDEX idx_call_events_caller (caller_number_normalized),
  INDEX idx_call_events_external (external_call_id)
);
```

Optionale spaetere Tabelle:

```sql
CREATE TABLE call_extension_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  extension VARCHAR(32) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  display_name VARCHAR(191) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_call_extension_users_extension (extension),
  INDEX idx_call_extension_users_active (active)
);
```

## Konfiguration

Serverseitig, nicht im Browser und nicht im Repository:

```text
PLACETEL_API_KEY=...
PLACETEL_WEBHOOK_SECRET=...
PROPSTACK_API_KEY=...
OPENAI_API_KEY=...
PROPSTACK_BASE_URL=https://crm.propstack.de/...
```

Fuer Frisia Inside gehoeren diese Werte in die vorhandene private
Server-Konfiguration, nicht in committete Dateien.

## Sicherheit

- Placetel-Webhook mit Secret absichern, z. B. `?secret=...` oder Header.
- API-Keys nur serverseitig speichern.
- Call-Cockpit nur nach Inside-Login nutzbar.
- Mitarbeiter sehen idealerweise nur Anrufe ihrer Nebenstelle.
- Raw-Payloads nur intern speichern, spaeter bereinigen oder begrenzen.
- KI darf Hinweise und Entwuerfe erzeugen, aber keine Aktionen automatisch
  in Propstack ausfuehren, solange das nicht explizit freigegeben ist.

## Umsetzungsplan

1. Placetel-Testwebhook einrichten und Rohdaten empfangen.
2. Payload analysieren: Welche Felder kommen fuer Nummer, Nebenstelle,
   Call-ID und Status?
3. `call_events` Tabelle anlegen.
4. Webhook speichert Anrufe.
5. Browser-Cockpit mit Polling bauen.
6. Propstack-Kontaktsuche anbinden.
7. Aktivitaeten laden und anzeigen.
8. KI-Briefing ergaenzen.
9. Nebenstellen-/Mitarbeiter-Zuordnung ergaenzen.
10. Live-Test mit echtem Anruf.

## Startanweisung fuer spaetere Umsetzung

Wenn dieses Projekt spaeter gestartet wird:

1. Zuerst `docs/PROJECT-KNOWLEDGE.md` und diese Datei lesen.
2. Bestehende Inside-Struktur pruefen:

   ```bash
   rg -n "operator|propstack|openai|auth|tasks|database" inside/public/api inside/app inside/database
   ```

3. Vor Datenbankaenderungen aktuelles Schema aus `inside/database/schema.sql`
   lesen.
4. Zuerst nur den Placetel-Webhook und eine Rohdatenansicht bauen.
5. Mit echtem Testanruf die Placetel-Payload sichern.
6. Danach erst Propstack-Suche, Aktivitaeten und KI-Briefing anbinden.

## Zeitbedarf

- Rohes MVP ohne KI: ca. 1 Tag
- Mit KI-Briefing: ca. 1,5 bis 2 Tage
- Alltagstauglich mit Nebenstellen, Status, Fehlerfaellen und sauberem UI:
  ca. 3 bis 5 Tage

## Offene Punkte vor Implementierung

- Placetel-Webhook-Format mit echtem Testanruf bestaetigen.
- Klaeren, welche Nebenstellen welchen Personen zugeordnet sind.
- Propstack-Kontakt-URL-Format verifizieren.
- Propstack-Aktivitaeten-Endpunkt und Felder mit echtem API-Key testen.
- Entscheiden, ob KI-Briefing direkt im MVP oder als zweiter Schritt kommt.
