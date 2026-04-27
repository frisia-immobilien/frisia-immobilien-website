import type { LandingTemplate } from "./types";

export const hausVerkaufenTemplate: LandingTemplate = {
  pageType: "haus_verkaufen",
  prefix: "haus-verkaufen",
  label: "Haus verkaufen",
  h1: (location) => `Haus verkaufen in ${location}`,
  title: (location) => `Haus verkaufen in ${location} | Frisia Immobilien`,
  description: (location) =>
    `Hausverkauf in ${location}: klare Preisstrategie, geprüfte Käufer und strukturierte Begleitung bis zum Notartermin.`,
  intro: () =>
    `Mit klarem Preisansatz, geprüften Käufern und einer strukturierten Vorgehensweise vom ersten Gespräch bis zum Notartermin.`,
  text1: () =>
    `Frisia Immobilien bereitet den Verkauf strukturiert vor. Das Ziel ist nicht der lauteste Startpreis, sondern ein Preisrahmen, der Nachfrage erzeugt und den Wert des Hauses schützt.`,
  text2: () =>
    `Gerade bei Einfamilienhäusern beeinflussen Grundstück, energetischer Zustand, Baujahr und Modernisierungen den erzielbaren Preis deutlich.`,
  faq: (location) => [
    {
      question: `Wie starte ich den Hausverkauf in ${location} richtig?`,
      answer:
        `Der Hausverkauf startet mit einer realistischen Einordnung des Hauses. Dazu gehören Lage, Zustand, Grundstück, Wohnfläche, Modernisierung, Energie, Nachfrage und vergleichbare Angebote in ${location}. Erst danach sollte entschieden werden, mit welchem Preis und welcher Strategie das Haus angeboten wird.`,
    },
    {
      question: "Warum ist der Angebotspreis beim Hausverkauf so wichtig?",
      answer:
        "Der Angebotspreis bestimmt die erste Reaktion des Marktes. Ist er zu hoch, bleibt das Haus oft länger sichtbar und verliert an Wirkung. Ist er zu niedrig, kann Verkaufserlös verloren gehen. Ziel ist ein Preisrahmen, der Nachfrage erzeugt und gleichzeitig eine starke Verhandlungsposition ermöglicht.",
    },
    {
      question: "Wie prüft Frisia Immobilien Käufer?",
      answer:
        "Wir achten darauf, ob die Kaufabsicht ernsthaft ist, ob die Finanzierung plausibel wirkt und ob der Interessent wirklich zum Haus passt. Dadurch werden unnötige Besichtigungen reduziert und der Verkaufsprozess bleibt ruhiger und verbindlicher.",
    },
    {
      question: `Wie lange dauert ein Hausverkauf in ${location}?`,
      answer:
        "Die Dauer hängt von Lage, Zustand, Preis, Nachfrage und Käuferzielgruppe ab. Ein gut vorbereiteter Verkauf mit realistischer Einpreisung kann deutlich strukturierter verlaufen als ein Verkauf, der ohne klare Strategie startet.",
    },
    {
      question: `Warum sollte ich mein Haus in ${location} mit Frisia Immobilien verkaufen?`,
      answer:
        "Weil Frisia Immobilien den Verkauf nicht dem Zufall überlässt. Wir verbinden regionale Marktkenntnis, fundierte Bewertung, strukturierte Vermarktung, Käuferprüfung und persönliche Begleitung - vom ersten Gespräch bis zum klaren Abschluss.",
    },
  ],
};
