import type { MarketDataRow, SeoLocationRow } from "@/lib/types/leadgen";
import { formatLocationPhrase, formatLocationPhraseStart } from "@/lib/seo/locationDisplay";

function numeric(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function marketPricePerM2(market: MarketDataRow | null) {
  const value = numeric(market?.durchschnitt_preis_eur_m2) ?? numeric(market?.median_preis_eur_m2);
  return value && value > 0 ? value : null;
}

export function medianPricePerM2(market: MarketDataRow | null) {
  const value = numeric(market?.median_preis_eur_m2);
  return value && value > 0 ? value : null;
}

export function averagePricePerM2(market: MarketDataRow | null) {
  const value = numeric(market?.durchschnitt_preis_eur_m2);
  return value && value > 0 ? value : null;
}

export function daysOnMarket(houseMarket: MarketDataRow | null, apartmentMarket: MarketDataRow | null) {
  const values = [numeric(houseMarket?.tage_am_markt), numeric(apartmentMarket?.tage_am_markt)].filter(
    (value): value is number => Boolean(value && value > 0),
  );
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function totalSalesCount(houseMarket: MarketDataRow | null, apartmentMarket: MarketDataRow | null) {
  const values = [numeric(houseMarket?.verkaeufe_anzahl), numeric(apartmentMarket?.verkaeufe_anzahl)].filter(
    (value): value is number => Boolean(value && value > 0),
  );
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

export function averageDeltaPercent(houseMarket: MarketDataRow | null, apartmentMarket: MarketDataRow | null) {
  const values = [
    numeric(houseMarket?.delta_vorjahr_median_prozent),
    numeric(apartmentMarket?.delta_vorjahr_median_prozent),
  ].filter((value): value is number => value !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function valuationMarketSentence(input: {
  location: SeoLocationRow;
  salesCount: number | null;
  deltaPercent: number | null;
}) {
  const { location, salesCount, deltaPercent } = input;
  const locationPhrase = formatLocationPhrase(location);
  const locationPhraseStart = formatLocationPhraseStart(location);

  if (!salesCount || salesCount < 20) {
    return `Die Datenbasis ${locationPhrase} ist begrenzt – eine individuelle Bewertung ist besonders wichtig.`;
  }

  if (typeof deltaPercent === "number" && deltaPercent > 5) {
    return `Die Preise ${locationPhrase} zeigen aktuell eine steigende Tendenz.`;
  }

  if (typeof deltaPercent === "number" && deltaPercent < -5) {
    return `Der Markt ${locationPhrase} hat sich zuletzt leicht nach unten angepasst.`;
  }

  return `${locationPhraseStart} unterscheiden sich Preise je nach Lage und Zustand teilweise deutlich.`;
}

export function hasValuationIndexInputs(input: {
  location: SeoLocationRow;
  houseMarket: MarketDataRow | null;
  apartmentMarket: MarketDataRow | null;
}) {
  return Boolean(
    input.location.indexable &&
      medianPricePerM2(input.houseMarket) &&
      daysOnMarket(input.houseMarket, input.apartmentMarket) &&
      totalSalesCount(input.houseMarket, input.apartmentMarket) &&
      Number(totalSalesCount(input.houseMarket, input.apartmentMarket)) > 5 &&
      valuationMarketSentence({
        location: input.location,
        salesCount: totalSalesCount(input.houseMarket, input.apartmentMarket),
        deltaPercent: averageDeltaPercent(input.houseMarket, input.apartmentMarket),
      }),
  );
}
