import type { LandingTemplate } from "./types";

export const immobilienbewertungTemplate: LandingTemplate = {
  pageType: "immobilienbewertung",
  prefix: "immobilienbewertung",
  label: "Immobilienbewertung",
  h1: (location) => `Immobilienbewertung ${location}`,
  title: (location) => `Immobilienbewertung ${location} – realistische Preiseinschätzung`,
  description: (location) =>
    `Was ist deine Immobilie in ${location} wert? Jetzt fundierte Bewertung erhalten.`,
  intro: (location) =>
    `Was ist deine Immobilie in ${location} aktuell wirklich wert? Erhalte eine realistische Preisspanne – basierend auf echten Verkaufsdaten aus ${location}.`,
  text1: () =>
    `Viele Eigentümer orientieren sich bei der Preisfindung an Online-Rechnern, Angebotspreisen aus Immobilienportalen oder Aussagen aus dem Umfeld. Angebotspreise zeigen jedoch nicht automatisch, welcher Verkaufspreis tatsächlich erzielt wird.`,
  text2: () =>
    `Eine belastbare Immobilienbewertung entsteht nicht aus einem einzelnen Durchschnittswert. Lage, Zustand, Ausstattung, Nachfrage und reale Verkaufsdaten müssen zusammen betrachtet werden.`,
  faq: (location) => [
    {
      question: `Was kostet eine Immobilienbewertung in ${location}?`,
      answer:
        `Die erste Einschätzung deiner Immobilie in ${location} ist unverbindlich. Ziel ist eine realistische Orientierung, bevor du über weitere Schritte entscheidest.`,
    },
    {
      question: "Wie genau ist eine Immobilienbewertung online?",
      answer:
        "Eine Online-Bewertung kann eine erste Richtung zeigen. Für eine belastbare Einschätzung müssen Lage, Zustand, Ausstattung, Modernisierungen und Nachfrage vor Ort berücksichtigt werden.",
    },
    {
      question: "Warum reicht der durchschnittliche Quadratmeterpreis nicht aus?",
      answer:
        `Der durchschnittliche Quadratmeterpreis ist nur ein Orientierungswert. Zwei Immobilien in ${location} können trotz ähnlicher Größe deutlich unterschiedliche Marktwerte haben.`,
    },
    {
      question: "Wann ist der beste Zeitpunkt für eine Bewertung?",
      answer:
        "Sinnvoll ist eine Bewertung immer dann, wenn ein Verkauf geplant wird, eine Erbschaft geklärt werden muss oder du wissen möchtest, welchen Wert deine Immobilie aktuell hat.",
    },
    {
      question: "Welche Unterlagen sind sinnvoll?",
      answer:
        "Hilfreich sind Grundbuchauszug, Energieausweis, Wohnflächenangaben, Grundrisse und Informationen zu Modernisierungen. Für eine erste Einschätzung reichen zunächst die wichtigsten Objektdaten.",
    },
  ],
};
