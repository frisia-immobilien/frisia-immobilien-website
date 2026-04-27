import type { LandingTemplate } from "./types";

export const immobilienmaklerTemplate: LandingTemplate = {
  pageType: "immobilienmakler",
  prefix: "immobilienmakler",
  label: "Immobilienmakler",
  h1: (location) => `Immobilienmakler in ${location}`,
  title: (location) => `Immobilienmakler in ${location} | Frisia Immobilien`,
  description: (location) =>
    `Immobilienmakler in ${location}: strukturierter Verkauf, datenbasierte Bewertung, Käuferprüfung und sichere Abschlussbegleitung mit Frisia Immobilien.`,
  intro: () =>
    "Was ein Makler heute wirklich leisten muss - und worauf es beim Verkauf deiner Immobilie ankommt.",
  text1: () =>
    "Ein Makler ist nicht einfach ein Vermittler. Er entscheidet darüber, wie dein Verkauf vorbereitet wird, wie Käufer reagieren und wie sicher der Abschluss erfolgt.",
  text2: () =>
    "Frisia Immobilien verbindet klassische Werte mit strukturierter, datenbasierter Arbeit und klarer persönlicher Verantwortung.",
  faq: (location) => [
    {
      question: `Warum sollte ich einen Immobilienmakler in ${location} beauftragen?`,
      answer:
        "Ein Makler übernimmt nicht nur die Vermarktung, sondern strukturiert den gesamten Verkaufsprozess. Das betrifft Bewertung, Strategie, Käuferauswahl, Verhandlung und Abschluss.",
    },
    {
      question: "Woran erkenne ich einen guten Makler?",
      answer:
        "An klarer Struktur, nachvollziehbarer Bewertung, transparenter Arbeitsweise und daran, wie sauber der Verkaufsprozess geführt wird - nicht an Versprechen.",
    },
    {
      question: `Unterscheidet sich der Markt in ${location} stark von anderen Regionen?`,
      answer:
        "Ja. Auch innerhalb von Ostfriesland gibt es deutliche Unterschiede in Nachfrage, Preisniveau und Käuferstruktur. Lokale Marktkenntnis ist daher entscheidend.",
    },
    {
      question: "Wie läuft die Zusammenarbeit mit Frisia Immobilien ab?",
      answer:
        "Die Zusammenarbeit beginnt mit einer klaren Einschätzung deiner Situation und führt über Bewertung, Strategie, Vermarktung und Käuferprüfung bis zum Abschluss - strukturiert und nachvollziehbar.",
    },
    {
      question: "Ist ein erstes Gespräch verpflichtend?",
      answer:
        "Nein. Es dient ausschließlich der Einordnung deiner Situation und der Klärung, ob und wie eine Zusammenarbeit sinnvoll ist.",
    },
  ],
};
