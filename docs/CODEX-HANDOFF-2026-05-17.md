# Codex Handoff - Frisia Immobilien / Frisia Inside

Stand: 2026-05-17, Europe/Berlin

Diese Datei ist fuer den Wechsel auf einen anderen Rechner gedacht. Sie enthaelt keine Secrets.

## So weiterarbeiten

1. Den kompletten Projektordner `frisia-immobilien` auf den anderen Rechner uebertragen oder dort den aktuellen Stand aus Git holen und die lokalen Aenderungen mitnehmen.
2. In VS Code die Datei `frisia-inside.code-workspace` oeffnen.
3. Dem neuen Codex zuerst sagen: `Lade docs/PROJECT-KNOWLEDGE.md und docs/CODEX-HANDOFF-2026-05-17.md. Wir arbeiten an frisia-inside.de.`
4. Falls `node_modules` nicht mitkopiert wurde: im Projektroot `npm install` ausfuehren.
5. Lokale Secrets manuell auf dem zweiten Rechner bereitstellen. Relevante lokale Dateien sind ignoriert und nicht Teil dieser Uebergabe:
   - `web/.env.local`
   - `.vercel/.env.production.local`
   - `inside/deploy/*.env`
   - `inside/public/private/config.php`

## Wichtige Befehle

```bash
npm run dev
npm run dev:inside
npm run build
npm run build:inside
npm run package:inside
npm run deploy:inside
npm run upload-config:inside
```

Live-Aenderungen an SEO, Indexierung, Datenbank oder Website-Inhalten brauchen weiterhin ausdrueckliche Freigabe.

## Repo-Stand

- Projektpfad aktuell: `/Users/frisia01/Desktop/frisia-immobilien.de/frisia-immobilien`
- Branch: `main`, Tracking: `origin/main`
- Letzter Commit: `b185a1e Redirect stale GSC 404 URLs`
- Node: `v24.13.0`
- npm: `11.6.2`

Tracked Aenderungen:

```text
M .gitignore
M README.md
M data/market/runtime/leadgen_market_data.json
M data/market/scripts/build_runtime_from_master.py
M package.json
M web/docs/leadgenerator-seo-system.md
```

Wichtige untracked Dateien/Ordner:

```text
docs/PROJECT-KNOWLEDGE.md
inside/
scripts/bootstrap-frisia-inside.py
scripts/deploy-frisia-inside-ftps.py
scripts/package-frisia-inside.mjs
scripts/upload-frisia-inside-config.py
data/market/runtime/seo_location_enrichments.json
data/market/runtime/website_locations.json
frisia-inside.code-workspace
docs/CODEX-HANDOFF-2026-05-17.md
```

Hinweis: Der aktuelle Arbeitsstand ist nicht vollstaendig durch Git gesichert, weil viele wichtige Dateien noch untracked sind. Fuer einen exakt gleichen Stand den ganzen Projektordner kopieren oder vor dem Wechsel sauber committen.

## Projektueberblick

- `web/`: Hauptwebsite `frisia-immobilien.de`, Next.js.
- `inside/`: Frisia Inside fuer `https://frisia-inside.de`, statisches Next.js-Frontend plus PHP-Backend.
- `inside/public/api/`: Live-PHP-API fuer TecSpace.
- `inside/database/`: MySQL-Schema und Seeds fuer Frisia Inside.
- `data/market/`: Marktdaten, Excel-Importe, Runtime-Dateien fuer Leadgen, SEO/GEO und Landingpages.
- `docs/PROJECT-KNOWLEDGE.md`: zentrale Projektwissens-Datei fuer Codex.

## Aktiver Kontext: frisia-inside.de / SEO

Aktuell geht es um `https://frisia-inside.de/seo/`. Ziel: Die Datenbasis fuer spaetere Landingpages aufbauen.

Problem im UI:

- `Haus Median EUR/m2`: kein valider Wert
- `Wohnung Median EUR/m2`: kein valider Wert
- `Grundstueck Median EUR/m2`: kein valider Wert
- `Vermarktungsdauer`: kein valider Wert
- `Verkaeufe letztes Jahr`: kein valider Wert

Relevante Dateien:

```text
inside/app/seo/page.tsx
inside/app/InsideApp.tsx
inside/public/api/seo/enrichments.php
inside/public/api/seo/import-enrichments.php
inside/public/api/seo/audit-summary.php
data/market/runtime/leadgen_market_data.json
data/market/runtime/seo_location_enrichments.json
scripts/package-frisia-inside.mjs
```

Bekannte Analyse:

- `inside/app/seo/page.tsx` rendert nur `<InsideApp activePage="seo" />`.
- Die SEO-UI und `buildSeoKeyMetrics` liegen in `inside/app/InsideApp.tsx`.
- Die fehlenden Kennzahlen sind in `data/market/runtime/leadgen_market_data.json` aus den Excel-Importen vorhanden.
- `leadgen_market_data.json` enthaelt 1.444 Datensaetze aus HAUS- und WOHNUNG-XLSX.
- Aktuell sind keine belastbaren Grundstuecks-Daten in dieser Runtime-Datei bestaetigt.
- `scripts/package-frisia-inside.mjs` kopiert Runtime-Dateien beim Deploy nach `inside/private/import/`.
- `inside/public/api/seo/import-enrichments.php` importiert `private/import/seo_location_enrichments.json` in die SEO-Tabellen.

Beispieldaten aus der Runtime:

```text
Aurich (Ostfriesland) | Haus | Median 1993 EUR/m2 | 97 Tage | 500 Verkaeufe
Haxtum, Aurich | Haus | Median 2249 EUR/m2 | 74 Tage | 60 Verkaeufe
Aurich, Aurich | Wohnung | Median 3060 EUR/m2 | 57 Tage | 23 Verkaeufe
Haxtum, Aurich | Wohnung | Median 3060 EUR/m2 | 57 Tage | 23 Verkaeufe
Wallinghausen, Aurich | Wohnung | Median 2397 EUR/m2 | 133 Tage | 11 Verkaeufe
Westersander, Ihlow | Wohnung | Werte leer/null, Quelle: location_master
```

Naechster sinnvoller Schritt:

- Kompakt pruefen, welche Objektarten und Felder in `leadgen_market_data.json` valide gefuellt sind.
- Danach `seo_location_enrichments.json` oder den Import/API-Pfad so erweitern, dass diese Marktdaten als SEO-Datapoints geliefert werden.
- Keys muessen zur UI passen, z. B. `haus_median_preis_eur_m2`, `wohnung_median_preis_eur_m2`, `grundstueck_median_preis_eur_m2`, `tage_am_markt`, `verkaeufe_anzahl`.
- Bei fehlendem Grundstuecks-Import keinen erfundenen Wert erzeugen.

## Aktiver Kontext: Schaufenster-TV

Es wurde zuletzt intensiv an `frisia-inside.de/schaufenster-tv/live/` gearbeitet.

Relevante Dateien:

```text
inside/app/schaufenster-tv/live/page.tsx
inside/app/schaufenster-tv/live/SchaufensterTvDisplay.tsx
inside/public/schaufenster-tv/live.php
inside/public/schaufenster-tv-live-standalone.css
inside/public/schaufenster-tv-live-rescue.js
inside/public/api/schaufenster/items.php
inside/public/api/schaufenster/sync-live.php
inside/public/api/lib/propstack-tv.php
inside/public/api/lib/schaufenster.php
```

Kontext:

- Zielgeraet: Philips Signage Solutions Q-Line-Monitor `65BDL3000Q/00`.
- Nominelle Display-Aufloesung: `1920 x 1080p`, praktisch sah die Darstellung aber nach anderem Browser-/Viewport-Verhalten aus.
- Letzter Versuch: HD-Ready `1280x720` bei 100 Prozent statt Full-HD-Skalierung.
- Aktualisierungsrhythmus wurde zum Test auf 30 Sekunden gesetzt.
- CSS/Viewport war zuletzt das Hauptproblem: rechter Textbereich, Preis, Telefon und Maklerbereich duerfen nicht verrutschen oder ueberlappen.
- User-Wunsch zuletzt: Maklerbereich unten wieder wie vorher anzeigen.

Titel-Logik fuer Schaufenster-TV:

```text
Wenn objekt.schaufenster_tv_titel.trim() vorhanden ist:
  TV-Titel verwenden
Sonst:
  normalen Propstack-Titel verwenden
Falls auch der fehlt:
  Objektart + Ort anzeigen
```

Darstellung:

- maximal 4 Zeilen
- keine Worttrennung
- sauberer Zeilenumbruch
- kurze TV-Titel duerfen groesser wirken
- Preis und Telefonnummer duerfen nie verrutschen

## Deployment-Hinweise Frisia Inside

Typischer Ablauf:

```bash
npm run build:inside
npm run package:inside
npm run deploy:inside
```

Config nur bei Bedarf:

```bash
npm run upload-config:inside
```

Nach Deploy pruefen:

```text
https://frisia-inside.de/
https://frisia-inside.de/api/health.php
https://frisia-inside.de/seo/
https://frisia-inside.de/schaufenster-tv/live/
```

API-Endpunkte unter `/api/seo/*`, `/api/imv/*`, `/api/tasks/*` sind in der Regel geschuetzt und liefern ohne Login erwartbar `401`.
