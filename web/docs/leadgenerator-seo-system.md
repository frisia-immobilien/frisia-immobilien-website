# Leadgenerator, Marktdaten und SEO-Landingpages

## Marktdaten aktualisieren

1. Neue Excel-Dateien in `data/market/import/` legen.
2. Alte Dateien dort entfernen oder ersetzen.
3. Tabellenmigration in Supabase ausführen: `web/supabase/migrations/20260426000000_leadgen_seo_schema.sql`.
4. Validieren: `cd web && npm run validate:market-data`.
5. Importieren: `cd web && npm run import:market-data`.

Der Import ist idempotent. Datensätze werden über `object_type`, `location_join_key` und `datensatz_typ` aktualisiert, nicht dupliziert.

Fehlerhafte Zeilen werden in `data/market/import_errors.json` protokolliert.

Die Masterdatei bleibt Import-, Seed- und Referenzbasis, ist aber nicht die operative Wahrheit für das skalierte SEO/GEO-System. Die operative Source of Truth liegt in der Datenbank, weil Scores, States, Historisierung, Quellen, Refreshes, Search-Console-Daten und Reviewprozesse dort versionierbar und auditierbar geführt werden müssen.

Zielarchitektur:

- Masterdatei: Seed, Import, manuelle Referenzdaten
- Datenbank: operative Source of Truth
- `seo_location_quality`: aktueller Qualitäts- und Indexierungszustand pro Seite/Ort/Seitentyp
- `seo_quality_history`: Historie jeder Qualitätsbewertung und Zustandsänderung
- `seo_location_sources`: Quellen, Lizenzen, Stichtage, Abrufzeitpunkte und Vertrauensniveau
- `seo_location_datapoints`: strukturierte Datenpunkte mit fachlicher Nutzung
- `seo_search_console_daily`: Search-Console-Zeitreihe pro URL/Seite

Jeder externe oder interne Datenpunkt braucht einen fachlichen `usage_scope`, damit Kontextdaten nicht versehentlich in Leadgenerator-Bewertungen einfließen:

- `seo`
- `leadgen`
- `both`
- `context_only`

Beispiele: Einwohnerzahl ist Kontext, aber kein Immobilienwert. Tourismusdaten erklären Nachfragefaktoren, sind aber keine Verkaufspreise. Bodenrichtwerte sind Grundstückswerte, keine tatsächlichen Haus- oder Wohnungskaufpreise. Angebotsdaten sind keine notariellen Verkaufspreise.

Refreshes sollen zeitbasiert und ereignisbasiert ausgelöst werden. Geeignete `refresh_trigger`:

- `scheduled`
- `source_changed`
- `manual_review`
- `search_console_signal`
- `stale_data`
- `leadgen_delta`
- `deployment_change`
- `schema_change`
- `external_source_error`

Der saisonale Standardrhythmus für Frisia Immobilien ist:

- `01.01` Jahresbasis / Stichtagslogik
- `01.04` Hauptrefresh nach neuen Jahresdaten
- `01.08` Saison- und Sommermarkt-Review
- `01.10` Jahresend- und Q4-Review

Ereignisbasierte Trigger dürfen diesen Rhythmus jederzeit vorziehen, wenn Quellen sich ändern, Search-Console-Signale auffällig sind, Leadgenerator-Daten deutlich abweichen oder technische Änderungen an Templates, Schema, Sitemap oder Robots erfolgen.

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

### Noindex-Ortsseiten mit externer Datenrecherche aufwerten

Noindex-Ortsseiten dürfen nicht pauschal auf `index` gesetzt werden. Wenn eine dynamische Ortsseite wegen schwacher Datenbasis indexierbar gemacht werden soll, müssen die fehlenden Informationen gezielt mit validen externen Quellen recherchiert und fachlich eingeordnet werden.

Zulässige Quellen sind insbesondere:

- GAG / Gutachterausschüsse Niedersachsen
- BORIS.NI / amtliche Bodenrichtwerte
- Grundstücksmarktinformationen Niedersachsen
- Landesamt für Statistik Niedersachsen
- offizielle Gemeinde-, Landkreis- und Landesquellen
- belastbare Frisia-eigene Markt- und CRM-Daten

Jede recherchierte Information muss echten lokalen Mehrwert liefern und darf nicht nur als Fülltext dienen. Geeignet sind zum Beispiel reale Bodenrichtwert-Spannen, tatsächliche Infrastrukturmerkmale, nachvollziehbare Marktbesonderheiten, regionale Nachfragefaktoren, demografische oder strukturelle Besonderheiten und eine konkrete Lageeinordnung innerhalb Ostfrieslands.

Nicht ausreichend sind generische Ortsbeschreibungen, austauschbare SEO-Texte, KI-Fülltexte ohne Informationswert oder ungeprüfte Portal-Schätzwerte. Bodenrichtwerte sind als Bodenrichtwerte zu bezeichnen und dürfen nicht als tatsächliche Haus- oder Wohnungskaufpreise ausgegeben werden. Rückschlüsse auf Vermarktungsdauer, Nachfrage oder Transaktionshäufigkeit dürfen nur als qualitative Einordnung formuliert werden, sofern keine belastbare Quelle für exakte Werte vorliegt.

Eine Seite wird erst indexierbar, wenn sie eine definierte Mindestqualität erreicht. Die Prüfung erfolgt anhand von ausreichender Datenmenge, Quellenqualität, lokaler Einzigartigkeit, semantischer Tiefe, interner Verlinkung, tatsächlichem Nutzermehrwert und ausreichender textlicher Differenzierung zu anderen Ortsseiten.

Die Mindestqualität darf nicht mechanisch über eine feste Wortanzahl definiert werden. Entscheidend ist ein Mindestumfang mit Informationswert: belastbare lokale Daten, klare Quellenherkunft, konkrete Einordnung für Eigentümer, lokale Entitäten, nachvollziehbare interne Verlinkung und erkennbare Differenzierung gegenüber anderen Ortsseiten.

Die spätere technische Indexierungslogik soll als Assistenzsystem operationalisiert werden. Ein Qualitäts-Score darf die Entscheidung vorbereiten, aber nicht blind allein entscheiden. Relevante Prüffelder:

- `quality_score`
- `source_confidence`
- `has_external_validation`
- `indexing_reason`
- `last_verified_at`
- `data_freshness`
- `local_uniqueness_score`
- `entity_depth_score`
- `duplicate_risk`
- `source_urls`
- `review_status`
- `reviewed_by`

Die finale Indexierungsentscheidung soll nicht nur als Boolean gespeichert werden. Zusätzlich soll ein nachvollziehbarer `indexing_state` gepflegt werden, zum Beispiel:

- `noindex_insufficient_data`
- `noindex_duplicate_risk`
- `noindex_low_uniqueness`
- `pending_review`
- `indexable_verified`
- `indexable_high_confidence`

`entity_depth_score` bewertet, ob eine Seite echte lokale Kenntnis zeigt, zum Beispiel durch Ortsteile, Infrastruktur, Schulen, Lagefaktoren, regionale Nachfragebesonderheiten, geografische Einordnung und andere überprüfbare lokale Entitäten. Das reduziert Near-Duplicate-Risiken und stärkt Search-, Local-, Entity- und AI-Indexing-Signale.

Qualität ist kein dauerhafter Zustand. Indexierbare Ortsseiten müssen regelmäßig revalidiert werden, weil Marktdaten, Quellen und lokale Rahmenbedingungen altern. Die spätere technische Umsetzung soll `stale`-Zustände, `last_verified_at` und automatische Revalidierungsintervalle unterstützen. Veraltete, nicht mehr belegbare oder widersprüchliche Daten sollen eine erneute Qualitätsprüfung auslösen und können zur Herabstufung von `indexable_high_confidence` auf `pending_review` oder `noindex_insufficient_data` führen.

Bestimmte Fälle dürfen nicht automatisch indexierbar werden, sondern brauchen einen manuellen Review. Dazu gehören niedrige Quellenanzahl, hoher `duplicate_risk`, niedriger `local_uniqueness_score`, niedriger `entity_depth_score`, widersprüchliche Datenquellen, fehlende externe Validierung oder inhaltliche Nähe zu bestehenden stärkeren Seiten. In diesen Fällen ist `pending_review` zu setzen, bis die Seite fachlich geprüft wurde.

Search-Console- und Performance-Signale sollen in die Qualitätslogik zurückfließen. Wiederkehrende Muster wie dauerhaft keine Impressionen, Crawling ohne Indexierung, Soft-404-Signale, auffällige Snippet-/Ranking-Probleme oder andere Hinweise auf geringe Relevanz sollen automatisch eine erneute Qualitätsprüfung anstoßen. Ziel ist ein lernendes Qualitätssystem statt statischer Einmalfreigaben.

Der Search-Console-Feedback-Loop darf nicht zu aggressiv wirken. Google testet und bewertet Seiten oft zeitversetzt über Wochen oder Monate. Deshalb sollen Performance-Signale zunächst zeitlich entkoppelt beobachtet werden, bevor eine Seite herabgestuft oder auf `noindex` gesetzt wird. Geeignete Zustände sind:

- `observing`
- `stable`
- `improving`
- `declining`
- `low_visibility`
- `revalidation_required`

Zusätzliche Prüffelder für spätere Audits:

- `last_search_console_check_at`
- `impression_trend`
- `indexation_stability`
- `crawl_efficiency`

Quellen sollen, wo sinnvoll, transparent genannt werden. Beispiel:

> Die Einordnung basiert auf Frisia-Marktdaten sowie öffentlich zugänglichen Informationen, unter anderem aus BORIS.NI, Gutachterausschussdaten und regionalen Strukturquellen.

Ziel ist nicht, möglichst viele Ortsseiten zu indexieren. Ziel ist, nur solche Seiten freizugeben, die fachlich belastbar sind, lokalen Mehrwert liefern und Eigentümer-Leads sowie regionale SEO-Autorität für Frisia Immobilien stärken.

## Ergebnislinks

Bewertungslinks enthalten nur einen zufälligen Token. In der Datenbank wird ausschließlich `token_hash` gespeichert. Die Gültigkeit beträgt standardmäßig 30 Tage über `TOKEN_TTL_DAYS`.
