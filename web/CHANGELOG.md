# Änderungshistorie – Frisia Immobilien

Diese Historie dokumentiert die veröffentlichten Versionen von **frisia-immobilien.de**. Neueste Version zuerst. Die zentrale Versionsnummer steht in `package.json`; der Footer liest diese Nummer direkt aus derselben Datei.

## [1.0.4] – 2026-11-13

### Korrigiert

- Ausschließlich den Immobilienfilter auf den Stand 1.0.0 zurückgesetzt: dreispaltige Anordnung und „Filter zurücksetzen“ wieder unter „Kauf / Miete“.

## [1.0.3] – 2026-11-13

### Korrigiert

- Immobilien auf `/immobilien-aurich` nach Anlagedatum absteigend sortiert: Das zuletzt hochgeladene Objekt steht zuerst, unabhängig vom Ort und späteren Bearbeitungen.
- Filter und Angebotsdarstellung entsprechen dem bestätigten Stand 1.0.0.

## [1.0.2] – 2026-11-13

### Korrigiert

- Vollständigen Beschreibungstext im Hero von `/immobilien-aurich` auf Desktop und Handy wiederhergestellt. Die gewünschte Wortwahl „Ausgewählte Angebote“ bleibt im ursprünglichen Absatz erhalten.

## [1.0.1] – 2026-11-13

### Geändert

- Auf `/immobilien-aurich` lautet der Beschreibungstext unter der Hauptüberschrift auf Desktop und Handy nur noch „Ausgewählte Angebote“. Überschrift und Buttons bleiben erhalten.
- Sichtbare Websiteversion und Paketversion auf **1.0.1** zusammengeführt; die zugehörigen Metadaten in `package-lock.json` sind angeglichen.

### Hinzugefügt

- Dezente, zentral gespeiste Versionsanzeige neben „Alle Rechte vorbehalten.“ im globalen Footer.
- Diese datierte Änderungshistorie und verbindliche Veröffentlichungsregeln in `AGENTS.md`.

Die Textänderung ist in [Commit 45ed1fc](https://github.com/frisia-immobilien/frisia-immobilien-website/commit/45ed1fcc8f13a36e3371d43fc196767e94747652) dokumentiert.

## [1.0.0] – bisheriger Ausgangsstand

- Vom Nutzer als Screenshot dokumentierter Stand der sichtbaren Websiteversion vor dieser Versionspflege.
- Die technischen Paketmetadaten standen zuvor auf `0.1.0`. Ab Version 1.0.1 werden Paketversion und Footeranzeige gemeinsam gepflegt.
- Die frühere Entwicklung bleibt über die [Git-Historie](https://github.com/frisia-immobilien/frisia-immobilien-website/commits/main/) nachvollziehbar.

## Versionsregeln

- **Patch**, zum Beispiel `1.0.1 → 1.0.2`: Textkorrekturen, Fehlerbehebungen und kleine Darstellungsanpassungen.
- **Minor**, zum Beispiel `1.0.2 → 1.1.0`: neue Funktionen oder größere, kompatible Erweiterungen.
- **Major**, zum Beispiel `1.1.0 → 2.0.0`: grundlegende Änderungen mit inkompatiblem Verhalten.
- Zusammengehörige Änderungen erhalten eine gemeinsame Version. Bestehende Einträge bleiben erhalten; neue Einträge stehen oben und enthalten das Datum in Europe/Berlin sowie die konkreten Änderungen.
