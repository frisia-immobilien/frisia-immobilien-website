function normalizeLabelKey(value: string | null) {
  if (!value) return "";
  return value
    .trim()
    .replace(/[\s/-]+/g, "_")
    .replace(/__+/g, "_")
    .toLocaleUpperCase("de-DE");
}

function humanizeLabel(value: string | null) {
  if (!value) return null;
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .toLocaleLowerCase("de-DE")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Wohnung",
  FLAT_SHARE_ROOM: "WG-Zimmer",
  ASSISTED_LIVING: "Betreutes Wohnen",
  SENIOR_CARE: "Seniorenpflege",
  PENTHOUSE: "Penthouse",
  MAISONETTE: "Maisonette",
  ATTIC_FLAT: "Dachgeschosswohnung",
  ROOF_STOREY: "Dachgeschosswohnung",
  LOFT: "Loft",
  GROUND_FLOOR: "Erdgeschosswohnung",
  RAISED_GROUND_FLOOR: "Hochparterre",
  HALF_BASEMENT: "Souterrain",
  TERRACED_FLAT: "Terrassenwohnung",
  HOUSE: "Haus",
  SINGLE_FAMILY_HOUSE: "Einfamilienhaus",
  MULTI_FAMILY_HOUSE: "Mehrfamilienhaus",
  TWO_FAMILY_HOUSE: "Zweifamilienhaus",
  TERRACE_HOUSE: "Reihenhaus",
  SEMI_DETACHED_HOUSE: "Doppelhaushälfte",
  TERRACED_HOUSE: "Reihenhaus",
  TERRACE_END_HOUSE: "Reihenendhaus",
  END_TERRACE_HOUSE: "Reiheneckhaus",
  TERRACED_END_HOUSE: "Reihenendhaus",
  MID_TERRACE_HOUSE: "Reihenmittelhaus",
  BUNGALOW: "Bungalow",
  VILLA: "Villa",
  FINCA: "Finca",
  FARMHOUSE: "Bauernhaus",
  COUNTRY_HOUSE: "Landhaus",
  TOWNHOUSE: "Stadthaus",
  CASTLE_MANOR_HOUSE: "Burg / Schloss",
  SPECIAL_REAL_ESTATE: "Besondere Immobilie",
  TWIN_SINGLE_FAMILY_HOUSE: "Doppeleinfamilienhaus",
  TRADE_SITE: "Grundstück",
  OFFICE: "Büro",
  OFFICE_FLOOR: "Büroetage",
  OFFICE_BUILDING: "Bürohaus",
  OFFICE_CENTRE: "Bürozentrum",
  OFFICE_STORAGE_BUILDING: "Büro- / Lagergebäude",
  PRACTICE: "Praxis",
  SURGERY: "Praxis",
  SURGERY_FLOOR: "Praxisetage",
  SURGERY_BUILDING: "Praxishaus",
  OFFICE_PRACTICE: "Büro / Praxis",
  OFFICE_OR_PRACTICE: "Büro / Praxis",
  COMMERCIAL_CENTRE: "Gewerbezentrum",
  LIVING_AND_COMMERCIAL_BUILDING: "Wohn- und Geschäftsgebäude",
  OFFICE_AND_COMMERCIAL_BUILDING: "Büro- und Geschäftsgebäude",
  RETAIL: "Einzelhandel",
  SHOP: "Laden",
  STORE: "Ladenlokal",
  SALES_AREA: "Verkaufsfläche",
  SHOP_SALES_FLOOR: "Laden / Verkaufsfläche",
  SALES_HALL: "Verkaufshalle",
  SHOWROOM_SPACE: "Ausstellungsfläche",
  SHOPPING_CENTRE: "Einkaufszentrum",
  FACTORY_OUTLET: "Factory Outlet",
  DEPARTMENT_STORE: "Kaufhaus",
  KIOSK: "Kiosk",
  SELF_SERVICE_MARKET: "SB-Markt",
  SUPERMARKET: "Supermarkt",
  RETAIL_PARK: "Fachmarktzentrum",
  GASTRONOMY: "Gastronomie",
  BAR_LOUNGE: "Bar / Lounge",
  CAFE: "Café",
  CLUB_DISCO: "Club / Diskothek",
  GUESTS_HOUSE: "Gästehaus",
  TAVERN: "Gaststätte",
  HOTEL: "Hotel",
  HOTEL_RESIDENCE: "Hotelanwesen",
  HOTEL_GARNI: "Hotel garni",
  PENSION: "Pension",
  RESTAURANT: "Restaurant",
  SHORT_TERM_ACCOMODATION: "Ferienimmobilie",
  SHORT_TERM_ACCOMMODATION: "Ferienimmobilie",
  INDUSTRY: "Industrie",
  HALL: "Halle",
  HALL_STORAGE: "Halle / Logistik",
  STORAGE: "Lager",
  PRODUCTION: "Produktion",
  INDUSTRIAL_PROPERTY: "Produktion / Fertigung",
  INDUSTRIAL_AREA: "Gewerbefläche",
  REPAIR_SHOP: "Werkstatt",
  HALL_STORAGE_PRODUCTION: "Halle / Lager / Produktion",
  COMMERCIAL: "Gewerbe",
  COMMERCIAL_PROPERTY: "Gewerbeimmobilie",
  COMMERCIAL_BUILDING: "Geschäftshaus",
  SPECIAL_PURPOSE: "Sonderimmobilie",
  SPECIAL_PROPERTY: "Sonderimmobilie",
  SPECIAL_ESTATE: "Spezialobjekt",
  INVESTMENT: "Kapitalanlage",
  INVEST_PLOT: "Grundstück",
  RESIDENCE: "Anwesen",
  FARM: "Bauernhof",
  HORSE_FARM: "Reiterhof",
  VINEYARD: "Weingut",
  LEISURE_FACILITY: "Freizeitanlage",
  LIVING_BUSINESS_HOUSE: "Wohn- und Geschäftshaus",
  HOUSING_ESTATE: "Wohnanlage",
  MICRO_APARTMENTS: "Micro-Apartments",
  BOARDING_HOUSE: "Boarding House",
  CLINIC: "Klinik",
  SITE: "Grundstück",
  PLOT: "Grundstück",
  RESIDENTIAL_PLOT: "Wohngrundstück",
  COMMERCIAL_PLOT: "Gewerbegrundstück",
  AGRICULTURAL_PLOT: "Landwirtschaftsfläche",
  FORESTRY: "Forstwirtschaft",
  LAND_AND_FORESTRY: "Land- und Forstwirtschaft",
  PARKING_SPACE: "Stellplatz",
  PARKING: "Stellplatz",
  STREET_PARKING: "Außenstellplatz",
  CARPORT: "Carport",
  DUPLEX: "Duplex",
  CAR_PARK: "Parkhaus",
  UNDERGROUND_GARAGE: "Tiefgarage",
  DOUBLE_GARAGE: "Doppelgarage",
  GARAGE: "Garage",
  NO_INFORMATION: "Keine Angabe",
  OTHER: "Sonstige Immobilie",
  STUDIO: "Atelier",
};

const PROPERTY_CATEGORY_LABELS: Record<string, string> = {
  ...PROPERTY_TYPE_LABELS,
  APARTMENT: "Etagenwohnung",
};

const CONDITION_LABELS: Record<string, string> = {
  FIRST_TIME_USE: "Erstbezug",
  FIRST_TIME_USE_AFTER_REFURBISHMENT: "Erstbezug nach Sanierung",
  FIRST_TIME_USE_AFTER_RENOVATION: "Erstbezug nach Sanierung",
  FULLY_RENOVATED: "Vollständig saniert",
  PARTLY_RENOVATED: "Teilweise saniert",
  PARTIALLY_RENOVATED: "Teilweise saniert",
  REFURBISHED: "Saniert",
  MODERNIZED: "Modernisiert",
  WELL_KEPT: "Gepflegt",
  MINT_CONDITION: "Neuwertig",
  NEEDS_RENOVATION: "Renovierungsbedürftig",
  NEED_OF_RENOVATION: "Renovierungsbedürftig",
  NEED_OF_REHABILITATION: "Sanierungsbedürftig",
  NEED_OF_RENOVATION_REHABILITATION: "Renovierungs- / sanierungsbedürftig",
  BY_RENOVATION: "Renoviert",
  RENOVATED: "Renoviert",
  NEEDS_REFURBISHMENT: "Sanierungsbedürftig",
  NEED_OF_REFURBISHMENT: "Sanierungsbedürftig",
  DEMOLITION_OBJECT: "Abrissobjekt",
  DILAPIDATED: "Baufällig",
  NEGOTIABLE: "Nach Vereinbarung",
  BY_AGREEMENT: "Nach Vereinbarung",
};

function translateLabel(value: string | null, dictionary: Record<string, string>) {
  if (!value) return null;
  const normalized = normalizeLabelKey(value);
  return dictionary[normalized] ?? humanizeLabel(value);
}

export function getGermanPropertyTypeLabel(rsCategory: string | null, rsType: string | null) {
  return translateLabel(rsCategory, PROPERTY_CATEGORY_LABELS) ?? translateLabel(rsType, PROPERTY_TYPE_LABELS) ?? "Immobilie";
}

export function getGermanConditionLabel(condition: string | null) {
  return translateLabel(condition, CONDITION_LABELS);
}
