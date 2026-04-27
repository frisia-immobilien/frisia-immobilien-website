# Leadgenerator, Marktdaten und SEO-Landingpages

## Marktdaten aktualisieren

1. Neue Excel-Dateien in `data/market/import/` legen.
2. Alte Dateien dort entfernen oder ersetzen.
3. Tabellenmigration in Supabase ausführen: `web/supabase/migrations/20260426000000_leadgen_seo_schema.sql`.
4. Validieren: `cd web && npm run validate:market-data`.
5. Importieren: `cd web && npm run import:market-data`.

Der Import ist idempotent. Datensätze werden über `object_type`, `location_join_key` und `datensatz_typ` aktualisiert, nicht dupliziert.

Fehlerhafte Zeilen werden in `data/market/import_errors.json` protokolliert.

## Grundstückswerte / BORIS.NI

Grundstückswerte werden serverseitig über den LGLN-WFS für Niedersachsen abgefragt:

`https://opendata.lgln.niedersachsen.de/doorman/noauth/boris_wfs`

Verwendeter FeatureType: `boris:BR_BodenrichtwertZonal`.

Der Adapter liegt in `web/lib/land/resolveLandValue.ts`. Er nutzt Koordinaten aus dem Lead, fragt eine kleine Bounding Box beim WFS ab, wählt die passende Bodenrichtwertzone und cached den Wert in `land_value_cache`.

Wenn kein Wert gefunden wird oder der Dienst nicht erreichbar ist, wird keine automatische Grundstücksbewertung ausgegeben. Stattdessen bleibt der Lead erhalten und Propstack bekommt eine manuelle Prüfaufgabe.

## Bilder ergänzen

Regionale Bilder liegen unter:

`web/public/images/regions/[location_slug]/`

Die Zuordnung erfolgt nicht über Dateinamen, sondern über `seo_location_images`.

Beispiel:

```sql
INSERT INTO seo_location_images (
  location_slug,
  page_type,
  image_type,
  file_path,
  alt_text,
  title,
  sort_order
) VALUES (
  'aurich',
  'immobilienmakler',
  'hero',
  '/images/regions/aurich/immobilienmakler-aurich-frisia-immobilien.jpg',
  'Immobilienmarkt in Aurich - Frisia Immobilien',
  'Immobilienmakler Aurich',
  10
);
```

Wenn kein Bild gepflegt ist, greift das Fallback-Bild aus `web/public/images/regions/fallback/`.

## Individualtexte ergänzen

Die Master-Templates für dynamische Landingpages liegen als einzelne Dateien in:

`web/lib/seo/landingpage-templates/`

Wenn dort ein Template geändert wird, ändern sich alle dynamischen Seiten dieses Landingpage-Typs im Regionen-Hub. Aurich ist ausgenommen, weil Aurich eigene statische Seiten unter `web/app/*-aurich/page.tsx` hat.

Individuelle Texte liegen in `seo_location_content` und überschreiben die Master-Templates nur für genau diese Kombination aus `location_slug` und `page_type`.

Beispiel:

```sql
INSERT INTO seo_location_content (
  location_slug,
  page_type,
  custom_h1,
  custom_intro,
  custom_text_1,
  meta_title,
  meta_description
) VALUES (
  'haxtum',
  'immobilienbewertung',
  'Immobilienbewertung Haxtum',
  'Lokale Einordnung für Eigentümer in Haxtum bei Aurich.',
  'Individueller Markttext...',
  'Immobilienbewertung Haxtum | Frisia Immobilien',
  'Erste Marktpreiseinschätzung für Immobilien in Haxtum.'
)
ON CONFLICT (location_slug, page_type)
DO UPDATE SET
  custom_h1 = EXCLUDED.custom_h1,
  custom_intro = EXCLUDED.custom_intro,
  custom_text_1 = EXCLUDED.custom_text_1,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;
```

## Indexierung

Eine dynamische Landingpage ist indexierbar, wenn `seo_locations.indexable = true` ist und mindestens eines gilt:

- belastbare Marktdaten vorhanden
- individueller Text vorhanden
- strategisch wichtige Hauptseite

Andernfalls wird die Seite mit `noindex, follow` ausgespielt.

## Ergebnislinks

Bewertungslinks enthalten nur einen zufälligen Token. In der Datenbank wird ausschließlich `token_hash` gespeichert. Die Gültigkeit beträgt standardmäßig 30 Tage über `TOKEN_TTL_DAYS`.
