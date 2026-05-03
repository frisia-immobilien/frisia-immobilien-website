# Project Map

## Überblick

Dieses Repository ist praktisch zweigeteilt:

- Root: Sanity Studio
- `web/`: aktive Next.js-App

Die produktive Website läuft aktuell aus `web/`. Das Sanity Studio ist vorhanden, wird im Frontend derzeit aber nicht aktiv verwendet.

## Hauptstruktur

### Root

- `package.json`: Sanity-Skripte
- `sanity.config.ts`: Studio-Konfiguration
- `sanity.cli.ts`: Sanity-CLI-Konfiguration
- `schemaTypes/`: Sanity-Schemas für `post`, `author`, `category`, `blockContent`

### Web

- `web/app/`: App-Router-Seiten und API-Routen
- `web/components/`: UI-Komponenten
- `web/lib/`: Hilfsfunktionen, Navigation, Regionen, DB, Tokens
- `web/public/`: Assets und Bilder
- `web/docs/`: interne Projektdokumentation

## Globale Shell

- `web/app/layout.tsx`: globale App-Hülle
- `web/components/home/HomeHeader.tsx`: globaler Header
- `web/components/site/SiteFooter.tsx`: globaler Footer
- `web/app/globals.css`: globale Styles

Wichtig: Der tatsächlich gerenderte Footer kommt aus `web/components/site/SiteFooter.tsx`, nicht aus `web/components/home/HomeSections.tsx`.

## Startseite

- `web/app/page.tsx`: aktive Startseite
- `web/components/home/HomeHero.tsx`: Hero mit `#top`
- `web/components/home/HomeLeadBlock.tsx`: Immobilienbewertungs-Block mit `#immobilienbewertung`
- `web/components/home/HomeSections.tsx`: große Sammlung der Home-Sections

Die Startseite setzt sich aus gezielt importierten Exports aus `HomeSections.tsx` zusammen. Nicht jeder Export daraus wird automatisch global verwendet.

## Service- und SEO-Seiten

Viele inhaltliche Seiten verwenden ein gemeinsames Template:

- `web/components/site/ServicePageTemplate.tsx`

Darüber laufen unter anderem:

- `web/app/immobilienbewertung-aurich/page.tsx`
- `web/app/immobilie-verkaufen-aurich/page.tsx`
- `web/app/haus-verkaufen-aurich/page.tsx`
- `web/app/haus-kaufen-aurich/page.tsx`
- `web/app/immobilien-aurich/page.tsx`
- `web/app/immobilienpreise-aurich/page.tsx`
- `web/app/immobilienmakler-aurich/page.tsx`

Diese Seiten sind stark template-basiert und unterscheiden sich hauptsächlich über Props, Texte, FAQ und interne Links.

## Regionen-Struktur

- `web/app/regionen-ostfriesland/page.tsx`: Hub-Seite
- `web/app/regionen-ostfriesland/[slug]/page.tsx`: dynamische regionale Landingpages
- `web/lib/regions.ts`: Slug-Parsing, Labels, Core-Regionen, Beispiel-Slugs

Die regionale Struktur ist auf skalierbare Landingpages ausgelegt.

## Lead-Flow

### Einstieg

- `web/components/immobilienbewertung/LeadGenEntry.client.tsx`

Der Entry lädt initial nur die Auswahloberfläche. Der eigentliche Wizard wird erst bei Interaktion lazy nachgeladen.

### Wizard

- `web/components/immobilienbewertung/LeadGenWizard.client.tsx`
- `web/components/immobilienbewertung/sections/`: einzelne Wizard-Schritte
- `web/components/immobilienbewertung/ui/`: UI-Bausteine
- `web/components/immobilienbewertung/data/`: statische Daten

### API-Fluss

- `web/app/api/lead/create/route.ts`: Lead speichern, Wert berechnen, E-Mails senden
- `web/app/api/lead/by-token/route.ts`: Bewertungsdaten per Token abrufen
- `web/app/bewertung/[token]/page.tsx`: Ergebnis-/Token-Seite

### Technische Abhängigkeiten

- DB: Neon über `web/lib/db.ts`
- Token: `web/lib/tokens.ts`
- E-Mail: Propstack Messages

## Kontakt-Flow

- `web/app/kontakt/page.tsx`: Kontaktseite
- `web/components/contact/KontaktForm.client.tsx`: Formular
- `web/app/api/contact/send/route.ts`: Mailversand

Das Kontaktformular nutzt:

- Honeypot-Feld
- Cloudflare Turnstile
- Propstack für Kontaktanlage, Aufgaben und internen Versand

## API-Routen

### Produktiv relevant

- `web/app/api/contact/send/route.ts`
- `web/app/api/lead/create/route.ts`
- `web/app/api/lead/by-token/route.ts`
- `web/app/api/geocode/route.ts`
- `web/app/api/staticmap/route.ts`

### Setup/Test/Debug

- `web/app/api/db-init/route.ts`
- `web/app/api/db-init-leads/route.ts`
- `web/app/api/db-seed/route.ts`
- `web/app/api/db-test/route.ts`
- `web/app/api/plz-test/route.ts`
- `web/app/api/hash-test/route.ts`
- `web/app/api/leads-last/route.ts`

## Wichtige Lib-Dateien

- `web/lib/db.ts`: Neon-Datenbankzugriff
- `web/lib/tokens.ts`: Token-Erzeugung, Hashing, Ablaufdatum
- `web/lib/regions.ts`: Regionen-/Slug-Logik
- `web/lib/navigation.ts`: Header-Navigation
- `web/lib/consent.ts`: Consent-Helfer

## Assets

- `web/public/images/hero/`: Hero-Bilder
- `web/public/images/immobilienbewertung/`: Immobilienbewertungs-Bilder
- `web/public/images/prozess/`: Prozessgrafiken
- `web/public/images/regions/`: Regionen-Assets
- `web/public/images/standort/`: Standortbilder
- `web/public/images/why/`: Why-Frisia-Assets

## SEO und strukturierte Daten

- `web/components/seo/JsonLd.tsx`: JSON-LD-Ausgabe
- `web/app/page.tsx`: umfangreiche strukturierte Daten für die Startseite
- Service- und Regionsseiten erzeugen jeweils eigene strukturierte Daten im Seitenmodul oder Template

## Rechtliche Seiten

Aktive rechtliche Inhalte liegen unter:

- `web/app/recht/page.tsx`
- `web/app/recht/impressum/page.tsx`
- `web/app/recht/datenschutz/page.tsx`
- `web/app/recht/cookies/page.tsx`

Alias-Routen leiten weiter:

- `web/app/impressum/page.tsx`
- `web/app/datenschutz/page.tsx`
- `web/app/cookies/page.tsx`

## Sanity-Status

Sanity ist im Root eingerichtet:

- `sanity.config.ts`
- `schemaTypes/`

Aktuell gibt es im Frontend aber keine aktive Sanity-Anbindung:

- kein `createClient`
- keine GROQ-Abfragen
- keine Content-Abhängigkeit aus `web/`

Das Studio ist daher derzeit ein paralleler Bestandteil des Repos, aber keine aktive Datenquelle der Website.

## Altbestand und Vorsichtspunkte

- `web/app/_page.tsx` wirkt wie ältere oder alternative Startseitenversion
- `web/components/home/HomeSections.tsx` enthält auch `HomeFooter`, der nicht global eingebunden ist
- Im Repo gibt es mehrere ähnliche Stellen mit inhaltlicher Überschneidung; vor Änderungen immer prüfen, welche Datei tatsächlich gerendert wird

## Praktische Arbeitsregel

Vor Änderungen zuerst diese drei Ebenen prüfen:

1. Welche Route rendert die Seite?
2. Welche Komponente ist dort tatsächlich importiert?
3. Ist die Datei aktiv eingebunden oder nur Alt-/Parallelbestand?
