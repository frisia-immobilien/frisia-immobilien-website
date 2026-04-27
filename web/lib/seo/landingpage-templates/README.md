# Landingpage Master-Templates

Hier liegen die zentralen Master-Templates für die dynamischen SEO-/GEO-Landingpages aus dem Regionen-Hub.

Eine Datei entspricht einem Landingpage-Typ:

- `immobilienmakler.ts`
- `immobilienbewertung.ts`
- `haus-verkaufen.ts`
- `immobilie-verkaufen.ts`
- `haus-kaufen.ts`
- `immobilien.ts`
- `immobilienpreise.ts`

Wenn ein Template hier geändert wird, ändern sich alle dynamischen Seiten dieses Typs, zum Beispiel:

- `/immobilienpreise-haxtum`
- `/immobilienpreise-norden`
- `/immobilienmakler-leer`
- `/haus-verkaufen-wiesmoor`

Aurich ist bewusst ausgenommen, weil Aurich eigene statische Seiten unter `web/app/*-aurich/page.tsx` hat.

Die Reihenfolge und zentrale Exportliste liegt in `index.ts`. Die Kompatibilitätsdatei `web/lib/seo/templates.ts` sollte bestehen bleiben, weil andere Module sie importieren.
