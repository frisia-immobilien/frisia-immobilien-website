# Versionierung der öffentlichen Website

Diese Regeln gelten für Änderungen an `frisia-immobilien.de` in diesem `web/`-Projekt. Übergeordnete Projektvorgaben und die Trennung von Frisia Inside bleiben maßgeblich.

Vor jeder Veröffentlichung einer zusammengehörigen Websiteänderung:

1. Den aktuellen Stand von `package.json` und `CHANGELOG.md` lesen. Noch nicht veröffentlichte Änderungen nicht als veröffentlicht dokumentieren.
2. Die Websiteversion nach den Versionsregeln in `CHANGELOG.md` erhöhen: Patch für Texte/Fehlerbehebungen, Minor für neue Funktionen, Major für inkompatible Änderungen. Einen begonnenen Release nicht pro Einzeldatei erneut erhöhen.
3. Die Version in `package.json`, im Wurzelfeld `version` von `package-lock.json` und unter `packages[""].version` gleich halten. Abhängigkeitsversionen dabei nicht ändern.
4. Einen Eintrag in `CHANGELOG.md` mit Version, Datum in Europe/Berlin, konkreten Änderungen und gegebenenfalls Einschränkungen ergänzen. Vorhandene Historie erhalten.
5. Die Footeranzeige in `components/site/SiteFooter.tsx` weiterhin aus `package.json` lesen. Keine zweite fest eingetragene Versionsnummer einführen.
6. Betroffene Dateien prüfen und alle zusammengehörigen Änderungen gemeinsam veröffentlichen. Anschließend erfolgreiche Veröffentlichung und sichtbare Footerversion auf der Live-Website kontrollieren.

Geschäftsdaten, Kundendaten, Geheimnisse und Frisia-Inside-Versionen gehören nicht in diese öffentliche Websitehistorie.
