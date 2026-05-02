import type { LandingTemplate } from "./types";
import { formatLocationPhraseFromName } from "@/lib/seo/locationDisplay";

export const immobilienTemplate: LandingTemplate = {
  pageType: "immobilien",
  prefix: "immobilien",
  label: "Immobilien",
  h1: (location) => `Immobilien ${formatLocationPhraseFromName(location)}`,
  title: (location) => `Immobilien ${formatLocationPhraseFromName(location)} | Frisia Immobilien`,
  description: (location) =>
    `Immobilien ${formatLocationPhraseFromName(location)}: aktuelle Immobilienangebote, Marktüberblick und Suchauftrag für passende Objekte.`,
  intro: (location) =>
    `Aktuelle Immobilienangebote ${formatLocationPhraseFromName(location)} - Häuser, Wohnungen und ausgewählte Objekte im Überblick.`,
  text1: () =>
    "Nicht jede Immobilie ist dauerhaft sichtbar. Entscheidend ist, passende Angebote rechtzeitig zu sehen - und richtig einzuordnen.",
  text2: () =>
    "Mit einem Suchauftrag wirst du über passende Immobilien informiert, bevor sie vollständig am Markt sichtbar sind.",
  faq: (location) => [
    {
      question: `Welche Immobilienangebote gibt es aktuell ${formatLocationPhraseFromName(location)}?`,
      answer:
        "Die Verfügbarkeit ändert sich laufend. Sichtbar sind Immobilien, die sich aktuell in der Vermarktung befinden. Passende Objekte können aber auch frühzeitig über einen Suchauftrag angeboten werden.",
    },
    {
      question: "Warum sehe ich nicht immer alle passenden Immobilien online?",
      answer:
        "Gute Objekte werden häufig schnell entschieden oder zunächst gezielt an vorgemerkte Interessenten gegeben. Deshalb ist ein Suchauftrag sinnvoll.",
    },
    {
      question: "Was bringt mir ein Suchauftrag?",
      answer:
        "Du erhältst passende Immobilien schneller, gezielter und ohne täglich mehrere Plattformen beobachten zu müssen.",
    },
  ],
};
