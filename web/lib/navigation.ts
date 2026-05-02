export const MAIN_NAV_ITEMS = [
  { label: "Startseite", href: "/" },
  { label: "Immobilienbewertung", href: "/immobilienbewertung-aurich" },
  { label: "Haus verkaufen", href: "/haus-verkaufen-aurich" },
  { label: "Immobilien", href: "/immobilien-aurich" },
  { label: "Makler Aurich", href: "/immobilienmakler-aurich" },
  { label: "Regionen Ostfriesland", href: "/regionen-ostfriesland" },
  { label: "Das Maklerhaus", href: "/maklerhaus" },
  { label: "Kontakt", href: "/kontakt" },
] as const;

export const FOOTER_NAV_ITEMS = [
  ...MAIN_NAV_ITEMS,
  { label: "Impressum", href: "/recht/impressum" },
  { label: "Datenschutz", href: "/recht/datenschutz" },
] as const;
