import type { LandingTemplate } from "./types";

export const hausKaufenTemplate: LandingTemplate = {
  pageType: "haus_kaufen",
  prefix: "haus-kaufen",
  label: "Haus kaufen",
  h1: (location) => `Haus kaufen in ${location}`,
  title: (location) => `Haus kaufen in ${location} | Frisia Immobilien`,
  description: (location) =>
    `Haus kaufen in ${location}: Orientierung im aktuellen Markt, Preisniveau und Suchauftrag für passende Immobilien.`,
  intro: (location) =>
    `Orientierung im aktuellen Markt und klare Schritte, um passende Immobilien in ${location} zu finden.`,
  text1: () =>
    "Ein Hauskauf beginnt nicht mit der ersten Besichtigung, sondern mit einer klaren Einordnung: Markt, Preisniveau und die richtige Suchstrategie.",
  text2: () =>
    "Ein Suchauftrag erhöht die Wahrscheinlichkeit, die passende Immobilie zur richtigen Zeit zu finden.",
  faq: (location) => [
    {
      question: `Wie schwierig ist es, ein Haus in ${location} zu kaufen?`,
      answer:
        "Das hängt stark von Lage, Budget und Nachfrage ab. In gefragten Bereichen ist die Auswahl oft begrenzt, weshalb eine klare Suchstrategie wichtig ist.",
    },
    {
      question: `Wie hoch sind die Preise für Häuser in ${location}?`,
      answer:
        "Die Preise orientieren sich am Quadratmeterpreis, der Lage und dem Zustand der Immobilie. Durchschnittswerte geben eine Orientierung, ersetzen aber keine individuelle Betrachtung.",
    },
    {
      question: "Wie lange dauert es, ein passendes Haus zu finden?",
      answer:
        "Das kann stark variieren. Mit einer klaren Suchstrategie und einem Suchauftrag verkürzt sich die Zeit in der Regel deutlich.",
    },
    {
      question: "Warum sollte ich einen Suchauftrag nutzen?",
      answer:
        "Weil du schneller über passende Immobilien informiert wirst und auch Angebote erhältst, die nicht sofort öffentlich sichtbar sind.",
    },
    {
      question: "Wie unterstützt mich Frisia Immobilien beim Hauskauf?",
      answer:
        "Frisia Immobilien unterstützt dich bei der Einordnung des Marktes, der Auswahl passender Immobilien und begleitet dich durch den gesamten Kaufprozess - von der Suche bis zum Notartermin.",
    },
  ],
};
