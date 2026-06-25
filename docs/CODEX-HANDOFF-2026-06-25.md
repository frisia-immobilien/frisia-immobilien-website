# Codex Handoff 2026-06-25

Stand: 2026-06-25

Diese Datei haelt den aktuellen Arbeitsstand fest, damit auf einem anderen
Rechner direkt weitergearbeitet werden kann. Sie enthaelt keine Secrets,
API-Keys oder Passwoerter.

## Git

- Repository: `frisia-immobilien`
- Branch: `sync/laptop-2026-06-08`
- Remote: `origin`
- Remote-URL: `https://github.com/frisia-immobilien/frisia-immobilien-website.git`

Auf dem Laptop weiterarbeiten:

```bash
git fetch origin
git checkout sync/laptop-2026-06-08
git pull origin sync/laptop-2026-06-08
```

## Website-Aenderung Maklerhaus

Live umgesetzt und vom Nutzer bestaetigt:

- Seite: `https://frisia-immobilien.de/maklerhaus#team`
- Datei: `web/app/maklerhaus/page.tsx`
- Bei Tonnie Olthof wurde unter den Qualifikationen ergaenzt:

```text
Versteigerer nach § 34b
```

Aktuelle Qualifikationsliste:

```text
Immobilienmakler nach §34c
WEG-Verwalter nach §34c
Versteigerer nach § 34b
DGuSV-gepruefter Sachverstaendiger mit Spezialisierung Ferienimmobilien
```

Build war erfolgreich:

```bash
cd web
npm run build
```

Wichtig fuer spaetere Live-Deploys der Hauptwebsite:

```bash
npx --yes vercel deploy . --prod --yes --project frisia-immobilien-website
```

Der richtige Deploy wurde aus dem Repo-Root
`/Users/frisia01/Desktop/frisia-immobilien.de/frisia-immobilien` gestartet,
nicht aus `web/`.

## Backup

Lokales Vollbackup des aeusseren Projektordners wurde erstellt.

Archiv:

```text
/Users/frisia01/Desktop/frisia-immobilien.de/backups/frisia-immobilien.de-full-20260625-181940.tar.gz
```

Groesse:

```text
2.5G
```

SHA256:

```text
1f16cf5cde2b5c722945510bb37dd9b6ced1714d919ef7a77fa344ae7c16fb89
```

Das Backup-Verzeichnis selbst wurde beim Archivieren ausgeschlossen, damit kein
rekursives Archiv entsteht.

## Neue Projektakten

Folgende Projektakten wurden angelegt und in `docs/PROJECT-KNOWLEDGE.md`
verlinkt:

- `docs/FRISIA-CALL-COCKPIT.md`
- `docs/FRISIA-MARKTWERTREPORT.md`
- `docs/FRISIA-TAGESCOCKPIT-OPERATOR-BOARD.md`

## Frisia Call Cockpit

Projektziel:

Ein internes Browserfenster auf `frisia-inside.de`, das bei eingehenden
Placetel-Anrufen automatisch den passenden Propstack-Kontakt, letzte
Aktivitaeten und optional einen KI-Gespraechshinweis anzeigt.

Kernfluss:

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

Wichtigste Startdatei:

```text
docs/FRISIA-CALL-COCKPIT.md
```

## MarktwertReport

Projektakte gespeichert:

```text
docs/FRISIA-MARKTWERTREPORT.md
```

Technischer Stand:

- Der MarktwertReport ist bereits als bestehendes System im Code vorhanden.
- Kernroute:
  - `/bewertung/[token]`
  - `/bewertung-ergebnis/[token]`
- Berechnung:
  `web/lib/leadgen/calculateLeadReport.ts`
- Template:
  `web/components/immobilienbewertung/valuation/LeadValuationTemplate.tsx`

Lokaler Check am 2026-06-25:

```bash
cd web
npm run build
```

Ergebnis:

```text
Build erfolgreich.
/bewertung/[token] und /bewertung-ergebnis/[token] werden als dynamische
Routen gebaut.
```

Live-Check am 2026-06-25:

```text
https://frisia-immobilien.de/bewertung-ergebnis/test-token-codex-check-20260625
```

Ergebnis:

- Route liefert HTTP 200.
- `robots.txt` sperrt `/bewertung/` und `/bewertung-ergebnis/`.
- Meta-Robots stehen auf `noindex, nofollow, nocache`.
- Aber: Live-Abruf zeigt aktuell einen Datenbank-/Providerfehler.

Fehlertext:

```text
Your account or project has exceeded the compute time quota.
```

Bewertung:

Der Code baut sauber, aber der MarktwertReport laeuft live aktuell nicht
sauber, solange die Datenbank/Neon-Quota blockiert.

Naechste Schritte:

1. Neon/Datenbank-Quota pruefen oder Compute wieder aktivieren.
2. Fehleranzeige haerten, damit technische Providerfehler nicht auf der
   Kundenseite erscheinen.
3. Danach echten Testlead durchlaufen lassen:
   - Lead speichern
   - Report berechnen
   - Propstack-Mail senden
   - Report-Link oeffnen
   - `lead_events` pruefen

## Tagescockpit und Operator Board

Projektakte gespeichert:

```text
docs/FRISIA-TAGESCOCKPIT-OPERATOR-BOARD.md
```

Ziel:

Ein internes Arbeitscockpit auf `frisia-inside.de`, das ein einfaches
Trello-aehnliches Aufgabenboard mit Propstack-Aufgaben, Kalender-/Termin-Daten,
E-Mail-/Aktivitaetssignalen und KI-Empfehlungen verbindet.

Kernidee:

```text
Frisia Aufgabenboard
+ Propstack Aufgaben
+ Propstack Kalender / Termine
+ Propstack E-Mail- und Aktivitaetsverlauf
+ MarktwertReport-Leads
+ spaeter Call-Cockpit-Rueckrufe
-> Frisia Inside Sync
-> MySQL-Arbeitsdaten
-> KI bewertet Dringlichkeit und Kontext
-> Tagescockpit + Projektvorschlaege + Mitarbeiter-Empfehlungen
```

Wichtigste Umsetzungsschritte spaeter:

1. Propstack-Probe bauen.
2. Aufgabenboard-Tabellen anlegen.
3. Board-UI bauen.
4. Projektvorschlaege ergaenzen.
5. Propstack-Aufgaben, Aktivitaeten, E-Mail-Signale und Termine testen.
6. Tagescockpit bauen.
7. KI-Morgenbriefing und Empfehlungen ergaenzen.

## Offene Punkte

- MarktwertReport live: Datenbank/Neon-Quota beheben.
- MarktwertReport: technische Fehlerausgabe fuer Kunden neutralisieren.
- MarktwertReport: echten End-to-End-Test mit Testlead durchfuehren.
- Tagescockpit: Propstack-Endpunkte fuer Termine/E-Mail-Inhalte mit echtem
  API-Key pruefen.
- Call Cockpit: Placetel-Webhooks mit echtem Testanruf pruefen.
- Neue Dokumentationsdateien und Maklerhaus-Aenderung committen und nach
  GitHub pushen, damit der Laptop denselben Stand ziehen kann.
