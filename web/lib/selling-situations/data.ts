export type SellingSituation = {
  key: string;
  path: string;
  seoTitle: string;
  eyebrow: string;
  headline: string;
  subline: string;
  intro: string[];
  image: string;
  imageAlt: string;
  related: string[];
};

export const SELLING_SITUATION_HUB = {
  path: "/verkaufssituationen",
  seoTitle: "Verkaufssituationen Aurich | Frisia Immobilien",
  eyebrow: "VERKAUFSSITUATIONEN IN AURICH & OSTFRIESLAND",
  headline: "Immobilie verkaufen – jede Situation verlangt eine eigene Entscheidung",
  subline:
    "Ob Erbschaft, Scheidung oder Zeitdruck: Ein Verkauf lässt sich nicht pauschal lösen. Entscheidend ist, die Ausgangslage richtig einzuordnen.",
  text: [
    "Wer eine Immobilie verkauft, trifft selten eine rein sachliche Entscheidung. Häufig stehen Veränderungen dahinter, die Zeit, Abstimmung oder Klarheit erfordern. Genau hier entstehen die meisten Fehler – nicht im Verkauf selbst, sondern davor. Wenn die Situation falsch eingeschätzt wird, passt später weder der Preis noch der Ablauf.",
    "Im regionalen Markt in Aurich und ganz Ostfriesland zeigt sich, dass eine saubere Einordnung die Grundlage für einen ruhigen und erfolgreichen Verkauf ist.",
    "Wähle die Situation, die deiner am nächsten kommt. Danach bekommst du eine klare Einordnung und den nächsten sinnvollen Schritt.",
  ],
  image: "/images/hero/home-verkauf-eigentuemer-ostfriesland.webp",
  imageAlt: "Gepflegtes Einfamilienhaus in Ostfriesland mit ruhigem Garten und warmem Licht",
} as const;

export const SITUATION_PROOF_SENTENCE =
  "Wir begleiten regelmäßig Eigentümer in genau solchen Situationen im Raum Aurich und ganz Ostfriesland.";

export const SITUATION_PRICE_REALITY =
  "Die tatsächlichen Verkaufspreise unterscheiden sich je nach Lage und Zustand deutlich – oft stärker, als es Eigentümer erwarten.";

export const SITUATION_CTA =
  "Wenn du deine Situation einordnen willst, bekommst du hier eine fundierte Einschätzung für deine Immobilie in Aurich.";

export const SELLING_SITUATIONS: SellingSituation[] = [
  {
    key: "alter",
    path: "/immobilie-verkaufen-alter",
    seoTitle: "Immobilie im Alter verkaufen | Frisia Immobilien",
    eyebrow: "VERKAUF IM ALTER",
    headline: "Wenn das Haus nicht mehr passt, braucht die Entscheidung Ruhe",
    subline: "Ein Verkauf im Alter ist keine Frage der Geschwindigkeit, sondern der richtigen Einordnung.",
    image: "/images/selling-situations/immobilie-verkaufen-alter-hero-v2.jpg",
    imageAlt: "Älteres Paar vor gepflegtem Haus in Ostfriesland bei warmem Licht",
    intro: [
      "Viele Eigentümer merken irgendwann, dass sich das eigene Zuhause verändert hat. Räume werden weniger genutzt, Wege werden beschwerlicher und der Alltag passt nicht mehr zur Immobilie. Gleichzeitig hängen Erinnerungen daran.",
      "Genau diese Mischung führt oft dazu, dass Entscheidungen aufgeschoben werden. In der Praxis entsteht daraus Unsicherheit - und irgendwann auch Zeitdruck.",
      "Im regionalen Markt in Aurich und ganz Ostfriesland zeigt sich, dass genau dieser Moment entscheidend ist. Wer frühzeitig Klarheit schafft, kann ruhig entscheiden. Wer zu lange wartet, verliert Optionen.",
      SITUATION_PROOF_SENTENCE,
      SITUATION_PRICE_REALITY,
    ],
    related: ["erbschaft", "zeitdruck", "leerstand"],
  },
  {
    key: "erbschaft",
    path: "/immobilie-verkaufen-erbschaft",
    seoTitle: "Geerbte Immobilie verkaufen | Frisia Immobilien",
    eyebrow: "VERKAUF NACH ERBSCHAFT",
    headline: "Eine geerbte Immobilie braucht zuerst eine gemeinsame Grundlage",
    subline: "Bei einer Erbschaft entscheidet nicht nur der Marktwert, sondern auch die Abstimmung zwischen allen Beteiligten.",
    image: "/images/selling-situations/immobilie-verkaufen-erbschaft-hero.webp",
    imageAlt: "Unterlagen und Schlüssel zu einer geerbten Immobilie",
    intro: [
      "Eine geerbte Immobilie bringt selten nur eine Entscheidung mit sich. Oft sind mehrere Personen beteiligt, unterschiedliche Vorstellungen treffen aufeinander und die Situation ist emotional geprägt.",
      "Typisch ist, dass Preisvorstellungen auseinandergehen oder der Zustand unterschiedlich bewertet wird. Ohne klare Basis entsteht Diskussion statt Entscheidung.",
      "Im Markt in Aurich und ganz Ostfriesland zeigt sich, dass genau diese Phase über den späteren Verkauf entscheidet.",
      SITUATION_PROOF_SENTENCE,
      SITUATION_PRICE_REALITY,
    ],
    related: ["alter", "leerstand", "diskret"],
  },
  {
    key: "diskret",
    path: "/immobilie-verkaufen-diskret",
    seoTitle: "Immobilie diskret verkaufen | Frisia Immobilien",
    eyebrow: "DISKRETER VERKAUF",
    headline: "Wenn der Verkauf nicht sichtbar werden soll, braucht er klare Führung",
    subline: "Ein diskreter Verkauf funktioniert nur, wenn Preis, Zielgruppe und Ansprache vorher sauber eingeordnet sind.",
    image: "/images/selling-situations/immobilie-verkaufen-diskret-hero.jpg",
    imageAlt: "Ruhiges Wohnhaus ohne öffentliche Verkaufsinszenierung",
    intro: [
      "Nicht jeder Verkauf soll offen sichtbar sein. Manchmal geht es um Nachbarn, Familie, Mitarbeiter, Mieter oder eine persönliche Situation, die nicht öffentlich werden soll.",
      "Gerade dann ist es wichtig, nicht einfach weniger zu vermarkten, sondern gezielter zu arbeiten. Diskretion braucht eine klare Preisbasis, ausgewählte Interessenten und eine saubere Kommunikation.",
      "Im Markt in Aurich und ganz Ostfriesland zeigt sich, dass vertrauliche Verkäufe vor allem dann funktionieren, wenn sie nicht improvisiert werden.",
      SITUATION_PROOF_SENTENCE,
      SITUATION_PRICE_REALITY,
    ],
    related: ["scheidung", "erbschaft", "zeitdruck"],
  },
  {
    key: "scheidung",
    path: "/immobilie-verkaufen-scheidung",
    seoTitle: "Immobilie bei Scheidung verkaufen | Frisia Immobilien",
    eyebrow: "VERKAUF BEI SCHEIDUNG",
    headline: "Bei Trennung braucht die Immobilie eine sachliche Grundlage",
    subline: "Wenn Emotionen hoch sind, helfen klare Bewertung, Zuständigkeiten und ein strukturierter Ablauf.",
    image: "/images/selling-situations/immobilie-verkaufen-scheidung-hero.jpg",
    imageAlt: "Neutrales Haus als sachliche Grundlage bei Scheidung",
    intro: [
      "Bei einer Trennung steht die gemeinsame Immobilie oft im Mittelpunkt. Unterschiedliche Interessen und emotionale Belastung erschweren klare Entscheidungen.",
      "Häufig wird der Verkauf ohne klare Struktur umgesetzt. Das führt zu unnötigen Verlusten.",
      "Im regionalen Markt zeigt sich, dass ein strukturierter Ablauf entscheidend ist.",
      SITUATION_PROOF_SENTENCE,
      "Die tatsächlichen Verkaufspreise unterscheiden sich je nach Lage und Zustand deutlich.",
    ],
    related: ["diskret", "zeitdruck", "erbschaft"],
  },
  {
    key: "zeitdruck",
    path: "/immobilie-verkaufen-zeitdruck",
    seoTitle: "Immobilie unter Zeitdruck verkaufen | Frisia Immobilien",
    eyebrow: "VERKAUF UNTER ZEITDRUCK",
    headline: "Wenn es schnell gehen muss, darf der Verkauf nicht hektisch werden",
    subline: "Zeitdruck verlangt klare Prioritäten: Preisrahmen, Unterlagen, Käuferprüfung und Abschlussfähigkeit.",
    image: "/images/selling-situations/immobilie-verkaufen-zeitdruck-hero.jpg",
    imageAlt: "Haus mit leichter Dynamik als Motiv für Verkauf unter Zeitdruck",
    intro: [
      "Ein kurzfristiger Verkauf entsteht selten freiwillig. Entscheidungen müssen schnell getroffen werden.",
      "Oft wird versucht, den Prozess zu verkürzen - auf Kosten des Ergebnisses.",
      "Im Markt in Aurich und ganz Ostfriesland ist auch unter Zeitdruck ein sauberer Verkauf möglich.",
      SITUATION_PROOF_SENTENCE,
      "Die tatsächlichen Verkaufspreise unterscheiden sich je nach Lage und Zustand deutlich.",
    ],
    related: ["alter", "scheidung", "auswanderung"],
  },
  {
    key: "auswanderung",
    path: "/immobilie-verkaufen-auswanderung",
    seoTitle: "Immobilie bei Auswanderung | Frisia Immobilien",
    eyebrow: "VERKAUF BEI AUSWANDERUNG",
    headline: "Vor dem Neustart sollte die Immobilie sauber geregelt sein",
    subline: "Wer wegzieht, braucht Planungssicherheit, realistische Fristen und einen geführten Verkaufsprozess.",
    image: "/images/selling-situations/immobilie-verkaufen-auswanderung-hero.jpg",
    imageAlt: "Haus vor einem neuen Lebensabschnitt mit subtiler Aufbruchsstimmung",
    intro: [
      "Wer auswandert, möchte Klarheit. Die Immobilie soll geregelt sein, bevor ein neuer Lebensabschnitt beginnt.",
      "Fehler entstehen durch falsche Zeitplanung und Preisansätze.",
      "Im Markt zeigt sich, dass Planung entscheidend ist.",
      SITUATION_PROOF_SENTENCE,
      "Die tatsächlichen Verkaufspreise unterscheiden sich je nach Lage und Zustand deutlich.",
    ],
    related: ["zeitdruck", "leerstand", "diskret"],
  },
  {
    key: "renovierungsbedarf",
    path: "/immobilie-verkaufen-renovierungsbedarf",
    seoTitle: "Immobilie mit Renovierungsbedarf | Frisia Immobilien",
    eyebrow: "VERKAUF MIT RENOVIERUNGSBEDARF",
    headline: "Nicht jede Renovierung erhöht den Verkaufspreis",
    subline: "Vor Investitionen sollte klar sein, welche Maßnahmen der Markt wirklich bezahlt.",
    image: "/images/selling-situations/immobilie-verkaufen-renovierungsbedarf-hero.jpg",
    imageAlt: "Haus mit Renovierungsbedarf in ruhiger Umgebung",
    intro: [
      "Viele Eigentümer investieren vor dem Verkauf - oft ohne Mehrwert.",
      "Zustand wird falsch eingeschätzt.",
      "Im Markt zeigt sich: Einordnung schlägt Investition.",
      SITUATION_PROOF_SENTENCE,
      "Die tatsächlichen Verkaufspreise unterscheiden sich je nach Lage und Zustand deutlich.",
    ],
    related: ["leerstand", "energieausweis", "erbschaft"],
  },
  {
    key: "leerstand",
    path: "/immobilie-verkaufen-leerstand",
    seoTitle: "Leerstehende Immobilie verkaufen | Frisia Immobilien",
    eyebrow: "VERKAUF BEI LEERSTAND",
    headline: "Leerstand braucht eine schnelle, aber saubere Entscheidung",
    subline: "Wenn ein Haus leer steht, verändern sich Eindruck, Substanz und Vermarktung oft schneller als erwartet.",
    image: "/images/selling-situations/immobilie-verkaufen-leerstand-hero.jpg",
    imageAlt: "Leeres Haus in ruhiger neutraler Perspektive",
    intro: [
      "Leerstand verändert den Wert schneller als erwartet.",
      "Substanz und Eindruck leiden.",
      "Im Markt wirkt sich das direkt aus.",
      SITUATION_PROOF_SENTENCE,
      "Die tatsächlichen Verkaufspreise unterscheiden sich je nach Lage und Zustand deutlich.",
    ],
    related: ["erbschaft", "renovierungsbedarf", "zeitdruck"],
  },
  {
    key: "energieausweis",
    path: "/immobilie-verkaufen-energieausweis",
    seoTitle: "Immobilie mit Energieausweis | Frisia Immobilien",
    eyebrow: "VERKAUF UND ENERGIEAUSWEIS",
    headline: "Der Energieausweis ist Pflicht - aber nicht die ganze Entscheidung",
    subline: "Energetische Angaben wirken immer zusammen mit Zustand, Lage, Nachfrage und Preisstrategie.",
    image: "/images/selling-situations/immobilie-verkaufen-energieausweis-hero.jpg",
    imageAlt: "Haus und Unterlagen als Motiv für Energieausweis beim Immobilienverkauf",
    intro: [
      "Der Energieausweis ist Pflicht, aber nicht allein entscheidend.",
      "Er wirkt immer im Zusammenspiel mit Markt und Zustand.",
      "Im Markt in Aurich und ganz Ostfriesland ist die Einordnung entscheidend.",
      SITUATION_PROOF_SENTENCE,
      "Die tatsächlichen Verkaufspreise unterscheiden sich je nach Lage und Zustand deutlich.",
    ],
    related: ["renovierungsbedarf", "leerstand", "zeitdruck"],
  },
];

export function getSellingSituation(key: string) {
  return SELLING_SITUATIONS.find((situation) => situation.key === key) ?? null;
}

export function getSellingSituationByPath(path: string) {
  return SELLING_SITUATIONS.find((situation) => situation.path === path) ?? null;
}

export function getRelatedSituations(situation: SellingSituation) {
  return situation.related
    .map((key) => getSellingSituation(key))
    .filter((item): item is SellingSituation => Boolean(item));
}
