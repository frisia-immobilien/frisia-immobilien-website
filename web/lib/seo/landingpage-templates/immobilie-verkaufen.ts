import type { LandingTemplate } from "./types";
import { formatLocationPhraseFromName } from "@/lib/seo/locationDisplay";

export const immobilieVerkaufenTemplate: LandingTemplate = {
  pageType: "immobilie_verkaufen",
  prefix: "immobilie-verkaufen",
  label: "Immobilie verkaufen",
  h1: (location) => `Immobilie verkaufen ${formatLocationPhraseFromName(location)}`,
  title: (location) => `Immobilie verkaufen ${formatLocationPhraseFromName(location)} | Frisia Immobilien`,
  description: (location) =>
    `Immobilie ${formatLocationPhraseFromName(location)} verkaufen: klare Orientierung zu Markt, Preisrahmen und passender Vorgehensweise mit Frisia Immobilien.`,
  intro: () =>
    "Der richtige Einstieg, um deine Situation klar einzuordnen und eine fundierte Entscheidung zu treffen.",
  text1: () =>
    "Ein Immobilienverkauf beginnt nicht mit einem Inserat, sondern mit der richtigen Entscheidung: Zeitpunkt, realistischer Preis und passender Weg.",
  text2: () =>
    "Frisia Immobilien ordnet deine Situation, den Markt und die sinnvolle Vorgehensweise ruhig und strukturiert ein.",
  faq: (location) => [
    {
      question: `Wann sollte ich meine Immobilie ${formatLocationPhraseFromName(location)} verkaufen?`,
      answer:
        "Ein Verkauf ist sinnvoll, wenn deine persönliche Situation und der Markt zusammenpassen. Dabei spielen Lebensphase, Zielsetzung und aktuelle Nachfrage eine wichtige Rolle.",
    },
    {
      question: "Sollte ich meine Immobilie selbst verkaufen?",
      answer:
        "Das ist möglich, bedeutet aber, dass du alle Schritte selbst übernimmst. Viele Eigentümer unterschätzen den Aufwand und die Komplexität, insbesondere bei Preisfindung, Käuferprüfung und Verhandlung.",
    },
    {
      question: "Wie finde ich den richtigen Angebotspreis?",
      answer:
        "Der richtige Preis entsteht aus Marktanalyse, Vergleichsobjekten und individueller Bewertung. Er sollte so gewählt sein, dass Nachfrage entsteht und gleichzeitig Verhandlungsspielraum bleibt.",
    },
    {
      question: `Wie lange dauert ein Immobilienverkauf ${formatLocationPhraseFromName(location)}?`,
      answer:
        "Das hängt von Lage, Zustand, Preisstrategie und Nachfrage ab. Ein strukturierter Verkauf mit realistischer Einpreisung verläuft in der Regel deutlich klarer und planbarer.",
    },
    {
      question: "Was bringt mir ein erstes Gespräch mit Frisia Immobilien?",
      answer:
        `Du erhältst eine klare Einschätzung deiner Situation, eine Einordnung des Marktes ${formatLocationPhraseFromName(location)} und eine Orientierung, wie ein sinnvoller nächster Schritt aussehen kann - ohne Verpflichtung.`,
    },
  ],
};

export const immobilienVerkaufenTemplate: LandingTemplate = {
  ...immobilieVerkaufenTemplate,
  prefix: "immobilien-verkaufen",
  label: "Immobilien verkaufen",
  h1: (location) => `Immobilien verkaufen ${formatLocationPhraseFromName(location)}`,
  title: (location) => `Immobilien verkaufen ${formatLocationPhraseFromName(location)} | Frisia Immobilien`,
  description: (location) =>
    `Immobilien ${formatLocationPhraseFromName(location)} verkaufen: unterstützende Orientierung zu Markt, Bewertung und Hausverkauf mit Frisia Immobilien.`,
};
