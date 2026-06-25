# Frisia MarktwertReport

Stand: 2026-06-25

Diese Datei ist die Start- und Wartungsakte fuer den MarktwertReport. Sie
enthaelt keine Secrets, API-Keys oder Zugangsdaten.

## Ziel

Der MarktwertReport ist die persoenliche Ergebnisseite nach dem
Immobilienbewertungs-Leadgenerator. Er soll Eigentuemern nach der Dateneingabe
eine nachvollziehbare Marktwert-Spanne zeigen, den naechsten persoenlichen
Kontakt vorbereiten und intern alle relevanten Informationen in Propstack
synchronisieren.

## Grundidee

```text
Leadgenerator
-> Lead Request speichern
-> Propstack Kontakt/Immobilie/Deal anlegen oder aktualisieren
-> Marktdaten oder BORIS-Bodenrichtwert aufloesen
-> Marktwert-Spanne berechnen oder manuelle Pruefung ausloesen
-> Report mit Token speichern
-> Ergebnislink per Propstack-Nachricht versenden
-> Report-Aufruf tracken
-> Rueckruf-/Bewertungsaufgabe in Propstack vorbereiten
```

## Aktuelle technische Grundlage

- App: `web/`, Next.js 16.1.4
- Ergebnis-URLs:
  - `/bewertung/[token]`
  - `/bewertung-ergebnis/[token]` als alternative, nicht indexierbare
    Ergebnisroute
- Ergebnis-Template:
  `web/components/immobilienbewertung/valuation/LeadValuationTemplate.tsx`
- Berechnungslogik:
  `web/lib/leadgen/calculateLeadReport.ts`
- Bewertungsformeln:
  `web/lib/valuation/calculateValuation.ts`
- Marktdaten-Aufloesung:
  `web/lib/market/resolveMarketData.ts`
- Bodenrichtwert-Aufloesung:
  `web/lib/land/resolveLandValue.ts`
- Persistenz:
  `web/lib/leadgen/repository.ts`
- E-Mail/Propstack-Nachricht:
  `web/lib/email/sendReportLink.ts`
- API-Endpunkte:
  - `web/app/api/lead/finalize/route.ts`
  - `web/app/api/lead/calculate/route.ts`
  - `web/app/api/lead/resend-report/route.ts`
  - `web/app/api/lead/result-event/route.ts`
  - `web/app/api/lead/callback-task/route.ts`
- Datenbankschema:
  `web/supabase/migrations/20260426000000_leadgen_seo_schema.sql`

## Datenmodell

Zentrale Tabellen:

- `lead_requests`
- `lead_reports`
- `lead_events`
- `market_data`
- `land_value_cache`

Wichtige Felder in `lead_reports`:

- `token_hash`
- `expires_at`
- `base_value`
- `adjusted_value`
- `range_min`
- `range_max`
- `price_per_m2_min`
- `price_per_m2_max`
- `data_source`
- `market_level_used`
- `market_data_id`
- `accuracy_score`
- `confidence_label`
- `calculation_notes`
- `report_status`
- `opened_at`
- `last_opened_at`

## Report-Ablauf

1. Leadgenerator sammelt Objekt-, Kontakt- und Motivationsdaten.
2. `/api/lead/finalize` speichert den Lead und stoesst die Berechnung an.
3. `calculateLeadReportForLead` prueft, ob bereits ein Report versendet wurde.
4. Je nach Objektart:
   - `haus` und `wohnung`: Marktdaten aus `market_data` ueber
     `resolveMarketData`
   - `grundstueck`: Bodenrichtwert ueber `resolveLandValue`
   - `gewerbe`: keine automatische Berechnung, manuelle Pruefung
5. `calculateValuation` berechnet Basiswert, Anpassungen, Spanne,
   Quadratmeterwerte und Konfidenz.
6. Falls Daten fehlen oder Abschlaege ungewoehnlich hoch sind, wird ein
   manueller Report mit Pruefhinweis erzeugt.
7. Report wird mit Token gespeichert.
8. Link wird per Propstack-Nachricht an den Lead versendet.
9. Propstack-Aufgabe `Rueckruf / Bewertung pruefen` wird angelegt.
10. Beim Oeffnen des Links wird `markReportOpened` ausgefuehrt.

## Automatische Bewertung

Automatisch bewertet werden aktuell:

- Haus
- Wohnung
- Grundstueck, wenn ein belastbarer Bodenrichtwert ermittelt werden kann

Manuelle Pruefung statt automatischer Spanne:

- Gewerbeimmobilien
- fehlende Wohnflaeche oder fehlendes Baujahr bei Wohnimmobilien
- keine belastbaren Marktdaten
- kein belastbarer Bodenrichtwert bei Grundstuecken
- Abrissobjekte
- ungewoehnlich hoher rechnerischer Gesamtabschlag

## Bewertungstreiber

Fuer Wohnimmobilien beruecksichtigt die Logik unter anderem:

- Lage-/Marktdatenebene: Ortsteil, Stadt/Gemeinde, Landkreis, Region
- Verkaufsanzahl und Quantile der Marktdaten
- Wohnflaeche
- Grundstuecksgroesse bei Haeusern
- Zimmer-/Flaechenverhaeltnis
- Baujahr
- Zustand
- Ausstattung
- Energieklasse
- Unterart, z. B. Penthouse, Maisonette, Doppelhaushaelfte, Reihenhaus
- Extras wie Garage, Garten, Balkon, Keller, Aufzug
- Nutzung, z. B. vermietet oder leerstehend

Fuer Grundstuecke:

- Grundstuecksflaeche
- Bodenrichtwert pro Quadratmeter
- Erschliessung
- Bebaubarkeit/Bebauungsgebiet

## Ergebnisdarstellung

Das Ergebnis soll nicht als mathematisch exakter Verkehrswert verstanden werden,
sondern als realistische Marktpreiseinschaetzung mit klarer Anschlusslogik.

Der Report zeigt:

- persoenliche Ansprache
- Objekt- und Adressdaten
- aktuelle Marktwert-Spanne
- Orientierungswert
- Quadratmeterwerte
- Marktdatenbasis
- Konfidenz/Einordnung
- wichtige Objektdetails
- Kontaktoptionen und Rueckruf-CTA

Die Route bleibt `noindex`, `nofollow`, `nocache`, weil es sich um
personen-/objektbezogene Ergebnislinks handelt.

## Propstack-Synchronisierung

Nach der Berechnung wird Propstack aktualisiert:

- Kontakt/Objekt/Deal wurden im Leadprozess vorbereitet.
- Bewertungszusammenfassung wird in Propstack abgelegt.
- Aufgabe `Rueckruf / Bewertung pruefen` wird angelegt.
- E-Mail wird als Propstack Message versendet.
- Ereignisse werden in `lead_events` protokolliert.

Relevante Datei:

```text
web/lib/leadgen/calculateLeadReport.ts
```

## E-Mail-Versand

Die Report-Mail wird ueber Propstack versendet.

Relevante Datei:

```text
web/lib/email/sendReportLink.ts
```

Betreff aktuell:

```text
Deine Werteinschätzung ist fertig
```

Kampagnenparameter am Report-Link:

```text
utm_source=email
utm_medium=leadgenerator
utm_campaign=marktwerteinschaetzung
```

## Sicherheit und Datenschutz

- Token werden gehasht gespeichert.
- Ergebnislinks laufen ueber `expires_at` ab.
- Reportseiten sind nicht indexierbar.
- Tracking erfolgt ueber `lead_events`.
- Keine Secrets in Repo-Dateien.
- Propstack-/Datenbank-/Mail-Zugriffe nur serverseitig.
- Bei unklaren oder riskanten Bewertungen lieber manuelle Pruefung statt
  Scheingenauigkeit.

## Wartungsregeln

- Keine Aenderung der Bewertungsformel ohne Build/Test und fachliche Kontrolle.
- Bei neuen Objektarten zuerst manuelle Pruefung als Fallback einplanen.
- Marktdatenqualitaet ist wichtiger als aggressive Automatisierung.
- Ergebnisdarstellung muss klar zwischen Orientierung und persoenlicher
  Einordnung unterscheiden.
- Bestehende Token-/Noindex-Logik nicht entfernen.
- E-Mail-Texte muessen auf Kundenton, Datenschutz und Propstack-Versand
  geprueft werden.

## Vorgeschlagene Weiterentwicklung

1. Internen Adminbereich fuer Reports in Frisia Inside oder im geschuetzten
   Website-Internbereich bauen.
2. Reports nachbearbeitbar machen: Spanne, Hinweistext, Pruefstatus.
3. PDF-/Druckversion fuer Beratungsgespraeche.
4. KI-gestuetzte interne Pruefnotiz:
   - fehlende Angaben
   - moegliche Risiken
   - Rueckrufleitfaden
   - naechste sinnvolle Fragen
5. Bessere Nachfasslogik:
   - Report geoeffnet
   - CTA geklickt
   - Rueckrufaufgabe erzeugt
   - automatisches Wiedervorlagefenster
6. MarktwertReport im Frisia Call Cockpit anzeigen, wenn ein Anrufer aus einem
   Bewertungslead zurueckruft.

## Startanweisung fuer spaetere Umsetzung

Wenn der MarktwertReport spaeter weitergebaut wird:

1. Zuerst diese Datei und `docs/PROJECT-KNOWLEDGE.md` lesen.
2. Danach die konkreten Kernpfade lesen:

   ```bash
   sed -n '1,420p' web/lib/leadgen/calculateLeadReport.ts
   sed -n '1,320p' web/lib/valuation/calculateValuation.ts
   sed -n '1,340p' 'web/app/bewertung/[token]/page.tsx'
   sed -n '1,260p' web/components/immobilienbewertung/valuation/LeadValuationTemplate.tsx
   ```

3. Vor Datenbank-/Schemaaenderungen Migrationen und Repository-Funktionen
   pruefen:

   ```bash
   rg -n "lead_reports|lead_requests|lead_events|createLeadReport|markReportOpened" web
   ```

4. Vor Live-Aenderungen:

   ```bash
   npm run build
   ```

5. Bei Propstack-/Mail-/API-Aenderungen immer mit einem Testlead pruefen.

## Offene Punkte

- Welche Report-Elemente sollen langfristig fuer Kunden sichtbar bleiben und
  welche nur intern?
- Soll der Report als PDF exportierbar sein?
- Soll es einen manuellen Review-Workflow mit Freigabe vor Versand geben?
- Wie lange sollen Ergebnislinks gueltig sein?
- Welche KI-Hinweise duerfen Kunden sehen, welche nur Mitarbeitende?
- Soll der MarktwertReport direkt mit dem geplanten Call Cockpit verbunden
  werden?
