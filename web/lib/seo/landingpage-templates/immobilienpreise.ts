import type { LandingTemplate } from "./types";

export const immobilienpreiseTemplate: LandingTemplate = {
  pageType: "immobilienpreise",
  prefix: "immobilienpreise",
  label: "Immobilienpreise",
  h1: (location) => `Immobilienpreise in ${location}`,
  title: (location) => `Immobilienpreise in ${location} | Frisia Immobilien`,
  description: (location) =>
    `Immobilienpreise in ${location}: aktuelle Preise, Preisentwicklung, Marktdaten und klare Einordnung für Eigentümer.`,
  intro: (location) =>
    `Aktuelle Preise, Entwicklung und klare Einordnung für Eigentümer in ${location}.`,
  text1: () =>
    "Die Immobilienpreise zeigen dir, wie sich der Markt entwickelt. Entscheidend ist jedoch, wo deine Immobilie heute konkret darin steht.",
  text2: () =>
    "Der Markt gibt eine Richtung vor - aber nicht den genauen Wert deiner Immobilie.",
  faq: (location) => [
    {
      question: `Wie entwickeln sich die Immobilienpreise in ${location} aktuell?`,
      answer:
        "Die Immobilienpreise hängen von Angebot, Nachfrage, Zinsen, Lagequalität und Objektzustand ab. Die dargestellten Werte zeigen eine Orientierung, ersetzen aber keine individuelle Bewertung deiner Immobilie.",
    },
    {
      question: "Sind Angebotspreise gleich Verkaufspreise?",
      answer:
        "Nein. Angebotspreise sind die Preise, mit denen Immobilien am Markt angeboten werden. Der tatsächliche Verkaufspreis entsteht erst durch Nachfrage, Verhandlung, Käuferprüfung und Abschluss. Deshalb kann der erzielte Preis vom Angebotspreis abweichen.",
    },
    {
      question: `Was beeinflusst den Preis meiner Immobilie in ${location}?`,
      answer:
        "Entscheidend sind Lage, Zustand, Grundstück, Wohnfläche, Grundriss, Energieeffizienz, Modernisierung, Ausstattung und aktuelle Nachfrage. Auch die richtige Preisstrategie beeinflusst, wie stark Käufer reagieren.",
    },
    {
      question: "Warum reicht der Quadratmeterpreis nicht aus?",
      answer:
        "Der Quadratmeterpreis ist ein Durchschnittswert. Er berücksichtigt nicht, ob deine Immobilie modernisiert ist, welches Grundstück dazugehört, wie die Mikrolage ist oder welche Käufer aktuell danach suchen.",
    },
    {
      question: "Was bedeutet die Preisentwicklung für meinen Verkauf?",
      answer:
        "Die Preisentwicklung zeigt, wie sich der Markt in den letzten Jahren verändert hat. Für deinen Verkauf zählt jedoch der aktuelle Markt: Welche Nachfrage gibt es heute, welcher Preis ist realistisch und wie sollte deine Immobilie positioniert werden?",
    },
    {
      question: "Was bringt mir eine Bewertung durch Frisia Immobilien?",
      answer:
        "Du erhältst eine realistische Einschätzung auf Basis aktueller Marktdaten, Vergleichsobjekten und regionaler Erfahrung. So weißt du, welcher Preisrahmen sinnvoll ist und wie der Verkauf strukturiert vorbereitet werden kann.",
    },
  ],
};
