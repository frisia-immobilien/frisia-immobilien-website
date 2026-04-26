"use client";

import type { StepId, PropertyType } from "./types";

export const steps = [
  {
    id: "propertyType" as const,
    overline: "Immobilienbewertung in Aurich & Ostfriesland",
    title: "Welche Immobilie möchtest du bewerten?",
    subtitle:
      "Wähle zuerst die passende Kategorie. Danach führen wir dich Schritt für Schritt durch die wichtigsten Angaben.",
  },
  {
    id: "detail" as const,
    overline: "Immobilienbewertung – Details",
    title: "Details",
    subtitle: "Bitte wähle die passende Option.",
  },
  {
    id: "size" as const,
    overline: "Immobilienbewertung – Größe",
    title: "Wie groß ist die Immobilie?",
    subtitle: "Ein grober Wert reicht. Wir präzisieren später gemeinsam.",
  },
] satisfies Array<{
  id: StepId;
  overline: string;
  title: string;
  subtitle: string;
}>;

export function getDetailCopy(propertyType: PropertyType) {
  if (propertyType === "haus") {
    return {
      overline: "Haus bewerten – Aurich & Ostfriesland",
      title: "Um welchen Haustyp handelt es sich?",
      subtitle: "Wähle die Option, die am ehesten passt.",
    };
  }
  if (propertyType === "wohnung") {
    return {
      overline: "Wohnung bewerten – Aurich & Ostfriesland",
      title: "Um welchen Wohnungstyp handelt es sich?",
      subtitle: "Wähle die Option, die am ehesten passt.",
    };
  }
  if (propertyType === "grundstueck") {
    return {
      overline: "Grundstück bewerten – Aurich & Ostfriesland",
      title: "Grundstücksfläche",
      subtitle: "Wie viel m² hat das Grundstück?",
    };
  }
  return {
    overline: "Details",
    title: "Details",
    subtitle: "Bitte wähle die passende Option.",
  };
}
