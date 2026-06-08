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
  LIVING: "Wohnimmobilie",
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
  ATTIKA: "Attikawohnung",
  TERRACED_FLAT: "Terrassenwohnung",
  HOUSE: "Haus",
  SINGLE_FAMILY_HOUSE: "Einfamilienhaus",
  MULTI_FAMILY_HOUSE: "Mehrfamilienhaus",
  TWO_FAMILY_HOUSE: "Zweifamilienhaus",
  TERRACE_HOUSE: "Reihenhaus",
  SEMI_DETACHED_HOUSE: "Doppelhaushälfte",
  SEMIDETACHED_HOUSE: "Doppelhaushälfte",
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
  OFFICE_LOFT: "Büroloft",
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
  SUMMER_RESIDENCE: "Ferienwohnung",
  SHORT_TERM_ACCOMODATION: "Ferienimmobilie",
  SHORT_TERM_ACCOMMODATION: "Ferienimmobilie",
  SHORT_TERM_APARTMENT: "Ferienwohnung",
  SHORT_TERM_ROOM: "Ferienzimmer",
  SHORT_TERM_HOUSE: "Ferienhaus",
  SHORT_TERM_FLAT: "Ferienwohnung",
  INDUSTRY: "Industrie",
  HALL: "Halle",
  HIGH_LACK_STORAGE: "Hochregallager",
  INDUSTRY_HALL: "Industriehalle",
  INDUSTRY_HALL_WITH_OPEN_AREA: "Industriehalle mit Freifläche",
  COLD_STORAGE: "Kühlhaus",
  MULTIDECK_CABINET_STORAGE: "Mehrgeschosslager",
  HALL_STORAGE: "Halle / Logistik",
  STORAGE: "Lager",
  STORAGE_WITH_OPEN_AREA: "Lager mit Freifläche",
  STORAGE_AREA: "Lagerfläche",
  STORAGE_HALL: "Lagerhalle",
  SERVICE_AREA: "Servicefläche",
  SHIPPING_STORAGE: "Versandlager",
  PRODUCTION: "Produktion",
  INDUSTRIAL_PROPERTY: "Produktion / Fertigung",
  INDUSTRIAL_AREA: "Gewerbefläche",
  REPAIR_SHOP: "Werkstatt",
  HALL_STORAGE_PRODUCTION: "Halle / Lager / Produktion",
  COMMERCIAL: "Gewerbe",
  COMMERCIAL_UNIT: "Gewerbeeinheit",
  COMMERCIAL_PROPERTY: "Gewerbeimmobilie",
  COMMERCIAL_BUILDING: "Geschäftshaus",
  SPECIAL_PURPOSE: "Sonderimmobilie",
  SPECIAL_PROPERTY: "Sonderimmobilie",
  SPECIAL_ESTATE: "Spezialobjekt",
  INVESTMENT: "Kapitalanlage",
  INVEST_FREEHOLD_FLAT: "Eigentumswohnung als Kapitalanlage",
  INVEST_SINGLE_FAMILY_HOUSE: "Einfamilienhaus als Kapitalanlage",
  INVEST_MULTI_FAMILY_HOUSE: "Mehrfamilienhaus als Kapitalanlage",
  INVEST_LIVING_BUSINESS_HOUSE: "Wohn- und Geschäftshaus als Kapitalanlage",
  INVEST_HOUSING_ESTATE: "Wohnanlage als Kapitalanlage",
  INVEST_MICRO_APARTMENTS: "Micro-Apartments als Kapitalanlage",
  INVEST_OFFICE_BUILDING: "Bürohaus als Kapitalanlage",
  INVEST_COMMERCIAL_BUILDING: "Geschäftshaus als Kapitalanlage",
  INVEST_OFFICE_AND_COMMERCIAL_BUILDING: "Büro- und Geschäftshaus als Kapitalanlage",
  INVEST_SHOP_SALES_FLOOR: "Laden / Verkaufsfläche als Kapitalanlage",
  INVEST_SUPERMARKET: "Supermarkt als Kapitalanlage",
  INVEST_SHOPPING_CENTRE: "Einkaufszentrum als Kapitalanlage",
  INVEST_RETAIL_PARK: "Fachmarktzentrum als Kapitalanlage",
  INVEST_HOTEL: "Hotel als Kapitalanlage",
  INVEST_BOARDING_HOUSE: "Boarding House als Kapitalanlage",
  INVEST_SURGERY_BUILDING: "Praxishaus als Kapitalanlage",
  INVEST_CLINIC: "Klinik als Kapitalanlage",
  INVEST_REHAB_CLINIC: "Reha-Klinik als Kapitalanlage",
  INVEST_MEDICAL_SERVICE_CENTER: "Medizinisches Versorgungszentrum als Kapitalanlage",
  INVEST_INTEGRATION_ASSISTANCE: "Einrichtung für Eingliederungshilfe als Kapitalanlage",
  INVEST_DAY_NURSERY: "Kita als Kapitalanlage",
  INVEST_DAY_CARE: "Tagespflege als Kapitalanlage",
  INVEST_NURSING_HOME: "Pflegeheim als Kapitalanlage",
  INVEST_ASSISTED_LIVING: "Betreutes Wohnen als Kapitalanlage",
  INVEST_COMMERCIAL_CENTRE: "Gewerbezentrum als Kapitalanlage",
  INVEST_HALL_STORAGE: "Halle / Lager als Kapitalanlage",
  INVEST_INDUSTRIAL_PROPERTY: "Industrieimmobilie als Kapitalanlage",
  INVEST_CAR_PARK: "Parkhaus als Kapitalanlage",
  INVEST_PLOT: "Grundstück",
  INVEST_COMMERCIAL_UNIT: "Gewerbeeinheit als Kapitalanlage",
  INVEST_OTHER: "Sonstige Kapitalanlage",
  RESIDENCE: "Anwesen",
  FARM: "Bauernhof",
  NURSING_HOME: "Pflegeheim",
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

export function getGermanPropertyTypeLabel(rsCategory: string | null, rsType: string | null, objectType?: string | null) {
  return (
    translateLabel(rsCategory, PROPERTY_CATEGORY_LABELS) ??
    translateLabel(rsType, PROPERTY_TYPE_LABELS) ??
    translateLabel(objectType ?? null, PROPERTY_TYPE_LABELS) ??
    "Immobilie"
  );
}

export function getGermanConditionLabel(condition: string | null) {
  return translateLabel(condition, CONDITION_LABELS);
}
