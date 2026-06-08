'use client'

import {FormEvent, useEffect, useMemo, useState} from 'react'

const PARTNER_TEXT_MAX_LENGTH = 175

function limitPartnerText(text: string) {
  return Array.from(text).slice(0, PARTNER_TEXT_MAX_LENGTH).join('')
}

function partnerTextLength(text: string) {
  return Array.from(text).length
}

type Health = {
  ok: boolean
  app: string
  php_version?: string
  config_loaded?: boolean
  database?: 'ok' | 'missing_config' | 'error'
  database_error?: string
  openai_configured?: boolean
  propstack_configured?: boolean
}

type User = {
  id: number
  email: string
  name: string
  role: string
}

type Task = {
  id: number
  title: string
  instruction: string
  status: string
  recurrence: string
  next_run_at: string | null
  last_run_at: string | null
  risk_level: string
}

type TaskRun = {
  id: number
  task_id: number
  task_title: string | null
  status: string
  started_at: string | null
  finished_at: string | null
  created_at: string
  error_text: string | null
  result: {
    mode?: string
    summary?: string
    answer?: string
    recommendations?: string[]
    checks?: string[]
  } | null
}

type AuditItem = {
  id: number
  action: string
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  user_email: string | null
  user_name: string | null
}

type OperatorConversation = {
  id: number
  title: string
  status: string
  created_at: string
  updated_at: string
  last_message_at: string | null
  message_count: number
  user_email: string | null
  preview: string
}

type SystemStatus = {
  readiness: Array<{
    key: string
    label: string
    state: 'ready' | 'prepared' | 'attention'
    detail: string
  }>
  metrics: {
    active_tasks: number
    due_tasks: number
    review_runs: number
    failed_runs: number
    seo_locations: number
    seo_quality_rows: number
    search_console_rows: number
    audit_log_rows: number
  }
  timeline: {
    next_run_at: string | null
    last_run_at: string | null
  }
}

type OperationReport = {
  overall: 'ready' | 'prepared' | 'attention'
  generated_at: string
  checks: Array<{
    key: string
    label: string
    state: 'ready' | 'prepared' | 'attention'
    detail: string
  }>
  metrics: Record<string, number | string | null>
  recommended_actions: string[]
}

type SeoSummary = {
  locations: number
  strategic_locations: number
  quality_rows: number
  pending_review: number
  indexable_verified: number
  revalidation_required: number
  sources: number
  datapoints: number
  page_types: Array<{
    page_type: string
    count: number
  }>
}

type SeoEnrichmentPage = {
  id: number
  page_type: string
  url_path: string
  strategic_location: boolean
  cluster_relevant: boolean
  quality_score: number | null
  source_confidence: number | null
  local_uniqueness_score: number | null
  entity_depth_score: number | null
  duplicate_risk: number | null
  data_freshness: string | null
  has_external_validation: boolean
  indexing_state: string | null
  performance_state: string | null
  indexing_reason: string | null
  review_status: string | null
  last_verified_at: string | null
  source_count: number
  datapoint_count: number
}

type SeoEnrichmentSource = {
  id: number
  source_name: string
  source_url: string | null
  source_type: string
  usage_scope: string
  source_confidence: number
  source_timestamp: string | null
  valid_from: string | null
  valid_to: string | null
  notes: string | null
}

type SeoEnrichmentDatapoint = {
  id: number
  source_id: number | null
  source_name: string | null
  metric_key: string
  metric_label: string
  value_text: string
  value_number: number | null
  unit: string | null
  usage_scope: string
  valid_from: string | null
  valid_to: string | null
  source_timestamp: string | null
}

type SeoEnrichment = {
  location_slug: string
  location_name: string
  pages: SeoEnrichmentPage[]
  sources: SeoEnrichmentSource[]
  datapoints: SeoEnrichmentDatapoint[]
}

type SeoKeyMetric = {
  label: string
  value: string
  detail: string
  sourceName: string | null
  tone: 'good' | 'warn' | 'missing'
}

type ImvSummary = {
  market_records: number
  market_locations: number
  landingpage_records: number
  leadgen_records: number
  website_locations: number
  website_live_locations: number
  leadgen_live_locations: number
  clipping_sources: number
  clippings: number
  runtime_file_present: boolean
  website_locations_file_present: boolean
  object_types: Array<{
    object_type: string
    count: number
  }>
}

type ImvMarketRecord = {
  id: number
  location_slug: string | null
  location_label: string | null
  location_type: string | null
  landkreis: string | null
  stadt_gemeinde: string | null
  ortsteil: string | null
  object_type: string | null
  plz: string | null
  leadgen_geeignet: boolean
  landingpage_geeignet: boolean
  website_live: boolean
  leadgen_live: boolean
  sitemap_indexable: boolean
  route_count: number
  url_paths: string[]
  verkaeufe_anzahl: number | null
  median_preis_eur_m2: string | number | null
  durchschnitt_preis_eur_m2: string | number | null
  efh_median_preis_eur: string | number | null
  tage_am_markt: string | number | null
  auswertung_vom: string | null
  quelle_pdf: string | null
  imported_at: string
  raw: Record<string, unknown> | null
}

type ImvWebsiteLocation = {
  id: number
  location_slug: string
  location_label: string
  location_type: string | null
  landkreis: string | null
  stadt_gemeinde: string | null
  ortsteil: string | null
  plz: string | null
  website_live: boolean
  leadgen_live: boolean
  landingpage_geeignet: boolean
  sitemap_indexable: boolean
  route_count: number
  page_types: string[]
  url_paths: string[]
  source_files: string[]
  record_count: number
  imported_at: string
}

type ImvClippingSource = {
  id: number
  platform_key: string
  platform_name: string
  source_type: string
  base_url: string | null
  status: string
  access_mode: string
  clipping_policy: string | null
  notes: string | null
}

type ImvClippingData = {
  sources: ImvClippingSource[]
  clippings: Array<Record<string, unknown>>
}

type SchaufensterMetric = {
  label: string
  value: string
}

type SchaufensterPropertyItem = {
  type: 'property'
  id: number
  propstack_id: number
  title: string
  subtitle: string | null
  image_url: string | null
  location: string
  city: string | null
  property_type: string
  marketing_type: string | null
  price_label: string
  price_text: string
  metrics: SchaufensterMetric[]
  expose_url: string | null
  active?: boolean
  custom_flag_value?: string | null
  synced_at?: string | null
}

type SchaufensterSlideItem = {
  type: 'custom_slide'
  id: number
  title: string
  subtitle: string | null
  image_url: string
  link_url: string | null
  active?: boolean
  sort_order?: number
  created_at?: string
}

type SchaufensterSummary = {
  properties: SchaufensterPropertyItem[]
  slides: SchaufensterSlideItem[]
  active_properties: number
  active_slides: number
  last_sync_at: string | null
  display_url: string
}

type WebsitePartner = {
  id: number
  key: string
  partner_key: string
  name: string
  text: string
  image_url: string
  website_url: string
  sort_order: number
  active: boolean
  updated_at: string
}

type PartnerSyncResult = {
  generated_at: string
  partner_count: number
  public_partner_count: number
  public_url: string
  partners: WebsitePartner[]
}

type WebsiteSnapshotResult = {
  version: string
  generated_at: string
  source_type: string
  counts: {
    market_records: number
    website_locations: number
    house_price_records: number
    apartment_price_records: number
  }
  checksum_sha256: string
  manifest_url: string
  active_url: string
  market_url: string
  locations_url: string
  warnings: string[]
}

type WebsiteSnapshotHistoryItem = {
  version: string
  source_type: string
  status: 'created' | 'rejected'
  active: boolean
  created_at: string
  published_at: string | null
  counts: {
    market_records: number
    website_locations: number
    house_price_records: number
    apartment_price_records: number
  }
  checksum_sha256: string
  validation: {
    ok: boolean
    errors: string[]
    warnings: string[]
  }
}

type WebsiteSnapshotHistory = {
  active: {
    active_snapshot?: string
    activated_at?: string
    checksum_sha256?: string
    counts?: Record<string, number>
  }
  snapshots: WebsiteSnapshotHistoryItem[]
}

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: string
}

type ImvLocationHub = {
  locationKey: string
  label: string
  locationType: string
  landkreis: string
  city: string
  place: string
  plz: string
  records: ImvMarketRecord[]
  objectTypes: string[]
  sourceCount: number
  websiteLive: boolean
  leadgenLive: boolean
  sitemapIndexable: boolean
  routeCount: number
  urlPaths: string[]
  hasWebsiteLocation: boolean
  totalSales: number | null
  medianMin: number | null
  medianMax: number | null
  daysMin: number | null
  daysMax: number | null
  landingpageRecords: number
  leadgenRecords: number
}

type ImvRegionHub = {
  region: string
  locations: ImvLocationHub[]
  recordCount: number
  sourceCount: number
}

type ImvSortKey =
  | 'name'
  | 'live'
  | 'notLive'
  | 'leadgen'
  | 'haus'
  | 'wohnung'
  | 'ds1'
  | 'ds2'
  | 'ds3plus'

type InsidePage =
  | 'overview'
  | 'website'
  | 'seo'
  | 'marktdaten'
  | 'clipping'
  | 'partner'
  | 'schaufenster'
  | 'operator'
  | 'scheduler'
  | 'audit'

const INSIDE_NAV_ITEMS: Array<{
  key: InsidePage
  href: string
  label: string
  eyebrow: string
  title: string
  description: string
}> = [
  {
    key: 'overview',
    href: '/',
    label: 'Uebersicht',
    eyebrow: 'Internes Steuerungszentrum',
    title: 'Website, SEO/GEO, Daten und KI-Auftraege kontrolliert fuehren.',
    description:
      'Frisia Inside laeuft auf TecSpace. Die KI erstellt Analysen, Aufgaben und Aenderungsvorschlaege. Live-Aenderungen bleiben freigabepflichtig.',
  },
  {
    key: 'website',
    href: '/website',
    label: 'Website',
    eyebrow: 'Snapshot Steuerung',
    title: 'Website synchronisieren, pruefen und bei Bedarf zurueckrollen.',
    description:
      'Freigegebene Snapshots sind die stabile Datenquelle fuer oeffentliche Inhalte. Fehlerhafte Daten gehen nicht live.',
  },
  {
    key: 'seo',
    href: '/seo',
    label: 'SEO/GEO',
    eyebrow: 'IMV / SEO Datenbasis',
    title: 'Orte, Quality-Governance und Noindex-Review.',
    description:
      'Zentrale Pruefung fuer indexierbare Ortsseiten, Quellen, Datenpunkte und manuelle Freigaben.',
  },
  {
    key: 'marktdaten',
    href: '/marktdaten',
    label: 'Marktdaten',
    eyebrow: 'IMV Datenverlauf',
    title: 'Marktdaten, Quellen und Attribute nach Regionen.',
    description:
      'Alle Website- und Leadgen-Orte mit Datensaetzen, Live-Status, Objektarten und internen Variablen.',
  },
  {
    key: 'clipping',
    href: '/clipping',
    label: 'Clipping',
    eyebrow: 'IMV Clipping',
    title: 'Plattformen und regionale Marktsignale.',
    description:
      'Quellensteuerung fuer IS24, Kleinanzeigen, Immowelt, regionale Presse und lokale Signale.',
  },
  {
    key: 'partner',
    href: '/partner',
    label: 'Partner',
    eyebrow: 'Website Partner',
    title: 'Partnerseite, Texte und Bilder fuer frisia-immobilien.de pflegen.',
    description:
      'Bilder, Beschreibungstexte, Links und Sichtbarkeit der Partnerseite zentral steuern. Die Website nutzt den veroeffentlichten Partner-Feed mit Fallbackbild.',
  },
  {
    key: 'schaufenster',
    href: '/schaufenster-tv',
    label: 'Schaufenster TV',
    eyebrow: 'Schaufenster TV',
    title: 'Full-HD-Ausspielung fuer das Schaufenster.',
    description:
      'Propstack-Immobilien mit custom.schaufenster_tv = Ja und eigene Bildslides fuer den TV-Wechsel steuern.',
  },
  {
    key: 'operator',
    href: '/operator',
    label: 'Operator',
    eyebrow: 'Frisia Website Operator',
    title: 'Anweisungen an die Website sauber vorbereiten.',
    description:
      'Interne KI-Arbeitsflaeche fuer Analysen, Vorschlaege und freigabepflichtige Website-Aenderungen.',
  },
  {
    key: 'scheduler',
    href: '/scheduler',
    label: 'Scheduler',
    eyebrow: 'AI Scheduler',
    title: 'Wiederkehrende SEO-, GEO- und Datenaufgaben planen.',
    description:
      'Geplante Pruefungen, Testlaeufe, Standardaufgaben und Review-Ergebnisse in einem Bereich.',
  },
  {
    key: 'audit',
    href: '/audit',
    label: 'Audit',
    eyebrow: 'Historie & Protokoll',
    title: 'Gespraeche und Systemaktionen nachvollziehen.',
    description:
      'Operator-Historie, Audit-Log und interne Nachvollziehbarkeit fuer Governance und Freigaben.',
  },
]

type ImvLocationAccumulator = Omit<
  ImvLocationHub,
  | 'objectTypes'
  | 'sourceCount'
  | 'totalSales'
  | 'medianMin'
  | 'medianMax'
  | 'daysMin'
  | 'daysMax'
  | 'landingpageRecords'
  | 'leadgenRecords'
> & {
  objectTypeSet: Set<string>
  sourceSet: Set<string>
  urlPathSet: Set<string>
  salesValues: number[]
  medianValues: number[]
  dayValues: number[]
  websiteLive: boolean
  leadgenLive: boolean
  sitemapIndexable: boolean
  routeCount: number
  hasWebsiteLocation: boolean
  landingpageRecords: number
  leadgenRecords: number
}

const REGION_ORDER = [
  'Landkreis Aurich',
  'Stadt Emden',
  'Landkreis Leer',
  'Landkreis Wittmund',
  'Landkreis Friesland',
  'Stadt Wilhelmshaven',
  'Ostfriesland',
  'Weitere Orte',
]

const IMV_SORT_OPTIONS: Array<{key: ImvSortKey; label: string; description: string}> = [
  {key: 'name', label: 'A-Z', description: 'Alphabetische Grundsortierung nach Ort.'},
  {key: 'live', label: 'Live', description: 'Orte, die auf der Website sichtbar sind, zuerst.'},
  {key: 'notLive', label: 'Nicht Live', description: 'Orte, die aktuell nicht live sichtbar sind, zuerst.'},
  {key: 'leadgen', label: 'Leadgen', description: 'Orte, die im Leadgenerator aktiv sind, zuerst.'},
  {key: 'haus', label: 'Haus', description: 'Orte mit Haus-Datensaetzen zuerst.'},
  {key: 'wohnung', label: 'Wohnung', description: 'Orte mit Wohnungs-Datensaetzen zuerst.'},
  {key: 'ds1', label: '1 DS', description: 'Orte mit genau einem Marktdatensatz zuerst.'},
  {key: 'ds2', label: '2 DS', description: 'Orte mit genau zwei Marktdatensaetzen zuerst.'},
  {key: 'ds3plus', label: '3+ DS', description: 'Orte mit drei oder mehr Marktdatensaetzen zuerst.'},
]

function textValue(value: string | null | undefined, fallback = '') {
  const normalized = String(value || '').trim()
  return normalized || fallback
}

function numericValue(value: string | number | null | undefined) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const parsed = Number.parseFloat(value.replace(',', '.').replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-'
  return new Intl.NumberFormat('de-DE', {maximumFractionDigits: 0}).format(value)
}

function formatRange(min: number | null, max: number | null, suffix = '') {
  if (min === null || max === null) return '-'
  if (Math.round(min) === Math.round(max)) return `${formatNumber(min)}${suffix}`
  return `${formatNumber(min)}-${formatNumber(max)}${suffix}`
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-'
  return new Intl.NumberFormat('de-DE', {maximumFractionDigits: value < 1 ? 2 : 1}).format(value)
}

function indexingStatusClass(value: string | null | undefined) {
  return value?.startsWith('indexable') ? 'good' : 'warn'
}

function findSeoDatapoint(
  enrichment: SeoEnrichment,
  match: (datapoint: SeoEnrichmentDatapoint) => boolean
) {
  return enrichment.datapoints.find(match)
}

function findSeoDatapointByKeys(enrichment: SeoEnrichment, keys: string[]) {
  const keySet = new Set(keys)
  return findSeoDatapoint(enrichment, (datapoint) => keySet.has(datapoint.metric_key))
}

function displayDatapoint(datapoint: SeoEnrichmentDatapoint | undefined, fallback = 'Kein valider Wert') {
  if (!datapoint) return fallback
  if (datapoint.value_text) return datapoint.value_text
  if (datapoint.value_number !== null && datapoint.value_number !== undefined) {
    return `${formatNumber(datapoint.value_number)}${datapoint.unit ? ` ${datapoint.unit}` : ''}`
  }
  return fallback
}

function buildSeoKeyMetrics(enrichment: SeoEnrichment): SeoKeyMetric[] {
  const houseMedian = findSeoDatapointByKeys(enrichment, [
    'house_median_sale_price_eur_m2',
    'haus_median_sale_price_eur_m2',
    'haus_median_preis_eur_m2',
    'haus_median_verkaufspreis_eur_m2',
  ])
  const apartmentMedian = findSeoDatapointByKeys(enrichment, [
    'apartment_median_sale_price_eur_m2',
    'wohnung_median_sale_price_eur_m2',
    'wohnung_median_preis_eur_m2',
    'wohnung_median_verkaufspreis_eur_m2',
  ])
  const plotMedian = findSeoDatapointByKeys(enrichment, [
    'plot_median_sale_price_eur_m2',
    'grundstueck_median_sale_price_eur_m2',
    'grundstueck_median_preis_eur_m2',
    'grundstueck_median_verkaufspreis_eur_m2',
  ])
  const marketingDays = findSeoDatapointByKeys(enrichment, [
    'average_marketing_duration_days',
    'durchschnittliche_vermarktungsdauer_tage',
    'tage_am_markt',
    'marketing_duration_days',
  ])
  const soldLastYear = findSeoDatapointByKeys(enrichment, [
    'sold_properties_last_year',
    'verkaufte_immobilien_letztes_jahr',
    'verkaeufe_anzahl',
    'sales_count_last_year',
  ])
  const borisMin = findSeoDatapointByKeys(enrichment, ['boris_residential_bodenrichtwert_min'])
  const borisMax = findSeoDatapointByKeys(enrichment, ['boris_residential_bodenrichtwert_max'])
  const borisRange =
    borisMin?.value_number !== null &&
    borisMin?.value_number !== undefined &&
    borisMax?.value_number !== null &&
    borisMax?.value_number !== undefined
      ? `${formatNumber(borisMin.value_number)}-${formatNumber(borisMax.value_number)} EUR/m2`
      : [displayDatapoint(borisMin, ''), displayDatapoint(borisMax, '')].filter(Boolean).join(' bis ')

  return [
    {
      label: 'Haus Median EUR/m2',
      value: displayDatapoint(houseMedian),
      detail: houseMedian ? 'Valider Hauswert vorhanden.' : 'Kein valider Haus-Verkaufspreis importiert.',
      sourceName: houseMedian?.source_name || null,
      tone: houseMedian ? 'good' : 'missing',
    },
    {
      label: 'Wohnung Median EUR/m2',
      value: displayDatapoint(apartmentMedian),
      detail: apartmentMedian
        ? 'Valider Wohnungswert vorhanden.'
        : 'Kein valider Wohnungs-Verkaufspreis importiert.',
      sourceName: apartmentMedian?.source_name || null,
      tone: apartmentMedian ? 'good' : 'missing',
    },
    {
      label: 'Grundstueck Median EUR/m2',
      value: displayDatapoint(plotMedian),
      detail: plotMedian
        ? 'Valider Grundstuecks-Verkaufspreis vorhanden.'
        : 'Kein valider Grundstuecks-Verkaufspreis importiert.',
      sourceName: plotMedian?.source_name || null,
      tone: plotMedian ? 'good' : 'missing',
    },
    {
      label: 'Vermarktungsdauer',
      value: displayDatapoint(marketingDays),
      detail: marketingDays ? 'Durchschnittliche Dauer vorhanden.' : 'Keine valide Vermarktungsdauer importiert.',
      sourceName: marketingDays?.source_name || null,
      tone: marketingDays ? 'good' : 'missing',
    },
    {
      label: 'Verkaeufe letztes Jahr',
      value: displayDatapoint(soldLastYear),
      detail: soldLastYear ? 'Verkaufsanzahl vorhanden.' : 'Keine valide Verkaufsanzahl importiert.',
      sourceName: soldLastYear?.source_name || null,
      tone: soldLastYear ? 'good' : 'missing',
    },
    {
      label: 'Bodenrichtwert Kontext',
      value: borisRange || 'Kein BORIS-Wert',
      detail: 'Bodenrichtwert, kein Verkaufspreis. Nur getrennt als Kontext nutzen.',
      sourceName: borisMin?.source_name || borisMax?.source_name || null,
      tone: borisRange ? 'warn' : 'missing',
    },
  ]
}

function objectTypeLabel(value: string | null | undefined) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'haus') return 'Haus'
  if (normalized === 'wohnung') return 'Wohnung'
  return textValue(value, 'Objekt')
}

function locationTypeLabel(value: string | null | undefined) {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'stadt_gemeinde') return 'Stadt/Gemeinde'
  if (normalized === 'ortsteil') return 'Ortsteil'
  if (normalized === 'insel') return 'Insel'
  return textValue(value, 'Ort')
}

function regionRank(region: string) {
  const index = REGION_ORDER.indexOf(region)
  return index === -1 ? REGION_ORDER.length : index
}

function minValue(values: number[]) {
  return values.length ? Math.min(...values) : null
}

function maxValue(values: number[]) {
  return values.length ? Math.max(...values) : null
}

function locationHasObjectType(location: ImvLocationHub, objectType: 'Haus' | 'Wohnung') {
  return location.objectTypes.some((value) => value.toLowerCase() === objectType.toLowerCase())
}

function locationMatchesSort(location: ImvLocationHub, sortKey: ImvSortKey) {
  switch (sortKey) {
    case 'live':
      return location.websiteLive
    case 'notLive':
      return !location.websiteLive
    case 'leadgen':
      return location.leadgenLive
    case 'haus':
      return locationHasObjectType(location, 'Haus')
    case 'wohnung':
      return locationHasObjectType(location, 'Wohnung')
    case 'ds1':
      return location.records.length === 1
    case 'ds2':
      return location.records.length === 2
    case 'ds3plus':
      return location.records.length >= 3
    case 'name':
    default:
      return true
  }
}

function compareImvLocations(a: ImvLocationHub, b: ImvLocationHub, sortKey: ImvSortKey) {
  if (sortKey !== 'name') {
    const matchDiff = Number(locationMatchesSort(b, sortKey)) - Number(locationMatchesSort(a, sortKey))
    if (matchDiff !== 0) return matchDiff
  }

  return a.label.localeCompare(b.label, 'de')
}

function imvSourceCount(locations: ImvLocationHub[]) {
  const sources = new Set<string>()
  for (const location of locations) {
    for (const record of location.records) {
      if (record.quelle_pdf) sources.add(record.quelle_pdf)
    }
  }
  return sources.size
}

function buildImvViewGroups(groups: ImvRegionHub[], sortKey: ImvSortKey) {
  return groups
    .map((group) => {
      const viewLocations =
        sortKey === 'name'
          ? group.locations
          : group.locations.filter((location) => locationMatchesSort(location, sortKey))
      const locations = [...viewLocations].sort((a, b) => compareImvLocations(a, b, sortKey))

      return {
        ...group,
        locations,
        recordCount: locations.reduce((sum, location) => sum + location.records.length, 0),
        sourceCount: imvSourceCount(locations),
      }
    })
    .filter((group) => group.locations.length > 0)
}

function countImvView(groups: ImvRegionHub[]) {
  return groups.reduce(
    (stats, group) => ({
      locations: stats.locations + group.locations.length,
      records: stats.records + group.recordCount,
    }),
    {locations: 0, records: 0}
  )
}

function buildImvHub(records: ImvMarketRecord[], websiteLocations: ImvWebsiteLocation[]): ImvRegionHub[] {
  const regions = new Map<string, Map<string, ImvLocationAccumulator>>()
  const byKey = new Map<string, ImvLocationAccumulator>()

  function ensureLocation(input: {
    key: string
    label: string
    locationType: string | null | undefined
    landkreis: string | null | undefined
    city: string | null | undefined
    place: string | null | undefined
    plz: string | null | undefined
  }) {
    const region = textValue(input.landkreis, 'Weitere Orte')
    const key = input.key || [region, input.city, input.place, input.label].filter(Boolean).join('|')
    const existing = byKey.get(key)
    if (existing) return existing
    if (!regions.has(region)) regions.set(region, new Map())
    const regionLocations = regions.get(region)!
    const location: ImvLocationAccumulator = {
      locationKey: key,
      label: input.label,
      locationType: locationTypeLabel(input.locationType),
      landkreis: region,
      city: textValue(input.city),
      place: textValue(input.place),
      plz: textValue(input.plz),
      records: [],
      objectTypeSet: new Set(),
      sourceSet: new Set(),
      urlPathSet: new Set(),
      salesValues: [],
      medianValues: [],
      dayValues: [],
      websiteLive: false,
      leadgenLive: false,
      sitemapIndexable: false,
      routeCount: 0,
      urlPaths: [],
      hasWebsiteLocation: false,
      landingpageRecords: 0,
      leadgenRecords: 0,
    }
    regionLocations.set(key, location)
    byKey.set(key, location)
    return location
  }

  for (const websiteLocation of websiteLocations) {
    const location = ensureLocation({
      key: websiteLocation.location_slug,
      label: textValue(websiteLocation.location_label, websiteLocation.location_slug),
      locationType: websiteLocation.location_type,
      landkreis: websiteLocation.landkreis,
      city: websiteLocation.stadt_gemeinde,
      place: websiteLocation.ortsteil,
      plz: websiteLocation.plz,
    })
    location.websiteLive = location.websiteLive || websiteLocation.website_live
    location.leadgenLive = location.leadgenLive || websiteLocation.leadgen_live
    location.sitemapIndexable = location.sitemapIndexable || websiteLocation.sitemap_indexable
    location.routeCount = Math.max(location.routeCount, websiteLocation.route_count)
    location.hasWebsiteLocation = true
    for (const path of websiteLocation.url_paths || []) {
      location.urlPathSet.add(path)
    }
  }

  for (const record of records) {
    const region = textValue(record.landkreis, 'Weitere Orte')
    const city = textValue(record.stadt_gemeinde)
    const place = textValue(record.ortsteil)
    const label = textValue(record.location_label, place || city || record.location_slug || 'Unbekannter Ort')
    const key = textValue(
      record.location_slug,
      [region, city, place, label].filter(Boolean).join('|') || String(record.id)
    )
    const location = ensureLocation({
      key,
      label,
      locationType: record.location_type,
      landkreis: record.landkreis,
      city,
      place,
      plz: record.plz,
    })

    location.records.push(record)
    location.objectTypeSet.add(objectTypeLabel(record.object_type))
    if (record.quelle_pdf) location.sourceSet.add(record.quelle_pdf)
    location.websiteLive = location.websiteLive || record.website_live || record.landingpage_geeignet
    location.leadgenLive = location.leadgenLive || record.leadgen_live || record.leadgen_geeignet
    location.sitemapIndexable = location.sitemapIndexable || record.sitemap_indexable
    location.routeCount = Math.max(location.routeCount, record.route_count || 0)
    for (const path of record.url_paths || []) {
      location.urlPathSet.add(path)
    }
    if (record.landingpage_geeignet) location.landingpageRecords += 1
    if (record.leadgen_geeignet) location.leadgenRecords += 1

    const sales = numericValue(record.verkaeufe_anzahl)
    const median = numericValue(record.median_preis_eur_m2)
    const days = numericValue(record.tage_am_markt)
    if (sales !== null) location.salesValues.push(sales)
    if (median !== null) location.medianValues.push(median)
    if (days !== null) location.dayValues.push(days)
  }

  return Array.from(regions.entries())
    .map(([region, locations]) => {
      const locationList = Array.from(locations.values())
        .map((location) => ({
          locationKey: location.locationKey,
          label: location.label,
          locationType: location.locationType,
          landkreis: location.landkreis,
          city: location.city,
          place: location.place,
          plz: location.plz,
          records: location.records.sort((a, b) =>
            objectTypeLabel(a.object_type).localeCompare(objectTypeLabel(b.object_type), 'de')
          ),
          objectTypes: Array.from(location.objectTypeSet).sort((a, b) => a.localeCompare(b, 'de')),
          sourceCount: location.sourceSet.size,
          websiteLive: location.websiteLive,
          leadgenLive: location.leadgenLive,
          sitemapIndexable: location.sitemapIndexable,
          routeCount: location.routeCount,
          urlPaths: Array.from(location.urlPathSet).sort((a, b) => a.localeCompare(b, 'de')),
          hasWebsiteLocation: location.hasWebsiteLocation,
          totalSales: location.salesValues.length
            ? location.salesValues.reduce((sum, value) => sum + value, 0)
            : null,
          medianMin: minValue(location.medianValues),
          medianMax: maxValue(location.medianValues),
          daysMin: minValue(location.dayValues),
          daysMax: maxValue(location.dayValues),
          landingpageRecords: location.landingpageRecords,
          leadgenRecords: location.leadgenRecords,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'de'))

      const sources = new Set<string>()
      for (const location of locationList) {
        for (const record of location.records) {
          if (record.quelle_pdf) sources.add(record.quelle_pdf)
        }
      }

      return {
        region,
        locations: locationList,
        recordCount: locationList.reduce((sum, location) => sum + location.records.length, 0),
        sourceCount: sources.size,
      }
    })
    .sort((a, b) => {
      const rankA = regionRank(a.region)
      const rankB = regionRank(b.region)
      if (rankA !== rankB) return rankA - rankB
      return a.region.localeCompare(b.region, 'de')
    })
}

const modules = [
  {
    label: 'Website Operator',
    description: 'Anweisungen pruefen, Aenderungen vorbereiten und Freigaben steuern.',
    status: 'Phase 2',
  },
  {
    label: 'AI Scheduler',
    description: 'SEO-, GEO- und Content-Aufgaben mit Datum oder Wiederholung planen.',
    status: 'Phase 2',
  },
  {
    label: 'SEO/GEO Audit',
    description: 'Indexierung, GSC-Signale, Schema, interne Links und Qualitaetsrisiken pruefen.',
    status: 'Design',
  },
  {
    label: 'IMV Datenbank',
    description: 'Orte, Quellen, Scores, Freshness, Reviews und Leadgen-Daten zusammenfuehren.',
    status: 'Design',
  },
]

async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    })
    const payload = (await response.json()) as ApiResult<T>
    if (!response.ok && payload.ok !== false) {
      return {ok: false, error: `HTTP ${response.status}`}
    }
    return payload
  } catch (error) {
    return {ok: false, error: error instanceof Error ? error.message : 'Unbekannter Fehler'}
  }
}

export function InsideApp({activePage = 'overview'}: {activePage?: InsidePage}) {
  const [health, setHealth] = useState<Health | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [runs, setRuns] = useState<TaskRun[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [auditItems, setAuditItems] = useState<AuditItem[]>([])
  const [conversations, setConversations] = useState<OperatorConversation[]>([])
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  const [operationReport, setOperationReport] = useState<OperationReport | null>(null)
  const [seoSummary, setSeoSummary] = useState<SeoSummary | null>(null)
  const [seoEnrichments, setSeoEnrichments] = useState<SeoEnrichment[]>([])
  const [websiteSnapshotHistory, setWebsiteSnapshotHistory] = useState<WebsiteSnapshotHistory | null>(null)
  const [websiteSnapshotMessage, setWebsiteSnapshotMessage] = useState('')
  const [imvSummary, setImvSummary] = useState<ImvSummary | null>(null)
  const [marketRecords, setMarketRecords] = useState<ImvMarketRecord[]>([])
  const [websiteLocations, setWebsiteLocations] = useState<ImvWebsiteLocation[]>([])
  const [clippingData, setClippingData] = useState<ImvClippingData | null>(null)
  const [schaufensterSummary, setSchaufensterSummary] = useState<SchaufensterSummary | null>(null)
  const [schaufensterTitle, setSchaufensterTitle] = useState('Frisia Immobilien')
  const [schaufensterFile, setSchaufensterFile] = useState<File | null>(null)
  const [schaufensterMessage, setSchaufensterMessage] = useState('')
  const [partners, setPartners] = useState<WebsitePartner[]>([])
  const [partnerFiles, setPartnerFiles] = useState<Record<string, File | null>>({})
  const [partnerMessage, setPartnerMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [operatorInput, setOperatorInput] = useState(
    'Pruefe woechentlich schwache SEO/GEO-Seiten und erstelle priorisierte Massnahmen.'
  )
  const [operatorResult, setOperatorResult] = useState('')
  const [taskTitle, setTaskTitle] = useState('SEO/GEO Wochenpruefung')
  const [taskInstruction, setTaskInstruction] = useState(
    'Pruefe Search-Console-Daten, Indexierungsstatus, Schema, interne Links und Seitenqualitaet. Erstelle nur Vorschlaege, keine Live-Aenderungen.'
  )
  const [taskRecurrence, setTaskRecurrence] = useState('weekly')
  const [imvSortKey, setImvSortKey] = useState<ImvSortKey>('name')
  const [schedulerMessage, setSchedulerMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void refresh()
  }, [])

  const systemState = useMemo(() => {
    if (!health) return 'Pruefung laeuft'
    if (health.database === 'ok') return 'Betriebsbereit'
    if (!health.config_loaded) return 'Konfiguration fehlt'
    return 'Datenbank pruefen'
  }, [health])

  const imvHubGroups = useMemo(
    () => buildImvHub(marketRecords, websiteLocations),
    [marketRecords, websiteLocations]
  )
  const visibleImvHubGroups = useMemo(
    () => buildImvViewGroups(imvHubGroups, imvSortKey),
    [imvHubGroups, imvSortKey]
  )
  const imvViewStats = useMemo(() => countImvView(visibleImvHubGroups), [visibleImvHubGroups])
  const activeImvSortOption = IMV_SORT_OPTIONS.find((option) => option.key === imvSortKey)
  const activeNavItem =
    INSIDE_NAV_ITEMS.find((item) => item.key === activePage) || INSIDE_NAV_ITEMS[0]

  async function refresh() {
    const meResult = await api<User>('/api/auth/me.php')
    if (!meResult.ok || !meResult.data) {
      setUser(null)
      return
    }

    setUser(meResult.data)
    const [
      healthResult,
      taskResult,
      runsResult,
      systemResult,
      auditResult,
      conversationResult,
      seoResult,
      seoEnrichmentResult,
      websiteSnapshotResult,
      imvResult,
      marketResult,
      websiteLocationResult,
      clippingResult,
      schaufensterResult,
      partnersResult,
    ] = await Promise.all([
      api<Health>('/api/health.php'),
      api<Task[]>('/api/tasks/index.php'),
      api<TaskRun[]>('/api/tasks/runs.php'),
      api<SystemStatus>('/api/system/status.php'),
      api<AuditItem[]>('/api/audit/index.php'),
      api<OperatorConversation[]>('/api/operator/conversations.php'),
      api<SeoSummary>('/api/seo/audit-summary.php'),
      api<SeoEnrichment[]>('/api/seo/enrichments.php?limit=25'),
      api<WebsiteSnapshotHistory>('/api/website-snapshot/index.php?limit=30'),
      api<ImvSummary>('/api/imv/summary.php'),
      api<ImvMarketRecord[]>('/api/imv/market-records.php?limit=2000'),
      api<ImvWebsiteLocation[]>('/api/imv/website-locations.php?limit=10000'),
      api<ImvClippingData>('/api/imv/clippings.php'),
      api<SchaufensterSummary>('/api/schaufenster/summary.php'),
      api<WebsitePartner[]>('/api/partners/index.php'),
    ])
    if (healthResult.ok && healthResult.data) setHealth(healthResult.data)
    if (taskResult.ok && taskResult.data) setTasks(taskResult.data)
    if (runsResult.ok && runsResult.data) setRuns(runsResult.data)
    if (systemResult.ok && systemResult.data) setSystemStatus(systemResult.data)
    if (auditResult.ok && auditResult.data) setAuditItems(auditResult.data)
    if (conversationResult.ok && conversationResult.data) {
      setConversations(conversationResult.data)
    }
    if (seoResult.ok && seoResult.data) setSeoSummary(seoResult.data)
    if (seoEnrichmentResult.ok && seoEnrichmentResult.data) {
      setSeoEnrichments(seoEnrichmentResult.data)
    }
    if (websiteSnapshotResult.ok && websiteSnapshotResult.data) {
      setWebsiteSnapshotHistory(websiteSnapshotResult.data)
    }
    if (imvResult.ok && imvResult.data) setImvSummary(imvResult.data)
    if (marketResult.ok && marketResult.data) setMarketRecords(marketResult.data)
    if (websiteLocationResult.ok && websiteLocationResult.data) {
      setWebsiteLocations(websiteLocationResult.data)
    }
    if (clippingResult.ok && clippingResult.data) setClippingData(clippingResult.data)
    if (schaufensterResult.ok && schaufensterResult.data) {
      setSchaufensterSummary(schaufensterResult.data)
    }
    if (partnersResult.ok && partnersResult.data) {
      setPartners(partnersResult.data)
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setLoginError('')
    const result = await api<User>('/api/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({email, password}),
    })
    setBusy(false)
    if (!result.ok || !result.data) {
      setLoginError(result.error || 'Login fehlgeschlagen')
      return
    }
    setUser(result.data)
    await refresh()
  }

  async function logout() {
    await api('/api/auth/logout.php', {method: 'POST'})
    setUser(null)
    setHealth(null)
    setTasks([])
    setRuns([])
    setSystemStatus(null)
    setAuditItems([])
    setConversations([])
    setSelectedRunId(null)
    setOperationReport(null)
    setSeoSummary(null)
    setSeoEnrichments([])
    setWebsiteSnapshotHistory(null)
    setWebsiteSnapshotMessage('')
    setImvSummary(null)
    setMarketRecords([])
    setWebsiteLocations([])
    setClippingData(null)
    setSchaufensterSummary(null)
    setSchaufensterMessage('')
    setPartners([])
    setPartnerFiles({})
    setPartnerMessage('')
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    const result = await api<Task>('/api/tasks/index.php', {
      method: 'POST',
      body: JSON.stringify({
        title: taskTitle,
        instruction: taskInstruction,
        recurrence: taskRecurrence,
      }),
    })
    setBusy(false)
    if (result.ok) await refresh()
  }

  async function runOperator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    const result = await api<{answer: string; mode?: string}>('/api/operator/chat.php', {
      method: 'POST',
      body: JSON.stringify({message: operatorInput}),
    })
    setBusy(false)
    setOperatorResult(result.data?.answer || result.error || 'Keine Antwort')
  }

  async function runScheduler(force = false, taskId?: number) {
    setBusy(true)
    setSchedulerMessage('')
    const result = await api<{processed: number; runs: Array<{title: string; summary?: string}>}>(
      '/api/tasks/run-due.php',
      {
        method: 'POST',
        body: JSON.stringify({force, ...(taskId ? {task_id: taskId} : {})}),
      }
    )
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchedulerMessage(result.error || 'Scheduler-Lauf fehlgeschlagen')
      return
    }
    const label = force ? 'Review-Testlauf' : 'Faellige Aufgaben'
    setSchedulerMessage(`${label}: ${result.data.processed} Lauf/Laeufe erzeugt.`)
    await refresh()
  }

  async function importRuntimeMarketData() {
    setBusy(true)
    setSchedulerMessage('')
    const result = await api<{imported_records: number; source_file?: string; generated_at?: string}>(
      '/api/imv/import-runtime.php',
      {method: 'POST'}
    )
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchedulerMessage(result.error || 'Marktdaten konnten nicht importiert werden.')
      return
    }
    setSchedulerMessage(
      `Marktdaten importiert: ${result.data.imported_records} Datensaetze aus ${result.data.source_file || 'Runtime-Datei'}.`
    )
    await refresh()
  }

  async function ensureClippingSources() {
    setBusy(true)
    setSchedulerMessage('')
    const result = await api<{sources: number}>('/api/imv/ensure-clipping-sources.php', {
      method: 'POST',
    })
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchedulerMessage(result.error || 'Clipping-Quellen konnten nicht angelegt werden.')
      return
    }
    setSchedulerMessage(`Clipping-Quellen geprueft: ${result.data.sources} Plattformen.`)
    await refresh()
  }

  async function importWebsiteLocations() {
    setBusy(true)
    setSchedulerMessage('')
    const result = await api<{imported_locations: number; source_file?: string; generated_at?: string}>(
      '/api/imv/import-website-locations.php',
      {method: 'POST'}
    )
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchedulerMessage(result.error || 'Website-Orte konnten nicht importiert werden.')
      return
    }
    setSchedulerMessage(
      `Website-Orte importiert: ${result.data.imported_locations} Orte aus ${result.data.source_file || 'Website-Runtime'}.`
    )
    await refresh()
  }

  async function createWebsiteSnapshot() {
    setBusy(true)
    setSchedulerMessage('')
    setWebsiteSnapshotMessage('')
    const result = await api<WebsiteSnapshotResult>('/api/website-snapshot/create.php', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchedulerMessage(result.error || 'Website-Snapshot konnte nicht erstellt werden.')
      setWebsiteSnapshotMessage(result.error || 'Website-Snapshot konnte nicht erstellt werden.')
      return
    }

    const warnings = result.data.warnings.length ? ` Hinweis: ${result.data.warnings.join(' ')}` : ''
    const message = `Website synchronisiert: ${formatNumber(result.data.counts.market_records)} Marktdatensaetze, ${formatNumber(result.data.counts.website_locations)} Orte, Version ${result.data.version}.${warnings}`
    setSchedulerMessage(message)
    setWebsiteSnapshotMessage(message)
    await refresh()
  }

  async function activateWebsiteSnapshot(version: string) {
    setBusy(true)
    setWebsiteSnapshotMessage('')
    const result = await api<{version: string}>('/api/website-snapshot/activate.php', {
      method: 'POST',
      body: JSON.stringify({version}),
    })
    setBusy(false)
    if (!result.ok || !result.data) {
      setWebsiteSnapshotMessage(result.error || 'Snapshot konnte nicht aktiviert werden.')
      return
    }
    setWebsiteSnapshotMessage(`Rollback ausgefuehrt: Version ${result.data.version} ist aktiv.`)
    await refresh()
  }

  async function syncSchaufensterProperties() {
    setBusy(true)
    setSchaufensterMessage('')
    const result = await api<{
      fetched: number
      flagged: number
      selected: number
      without_image: number
      without_location: number
      without_price: number
      not_public: number
    }>(
      '/api/schaufenster/sync-all-v3.php',
      {method: 'POST'}
    )
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchaufensterMessage(result.error || 'Propstack-Sync konnte nicht ausgefuehrt werden.')
      return
    }
    setSchaufensterMessage(
      `Propstack-Sync: ${result.data.selected} Immobilien aktiv aus ${result.data.flagged} freigegebenen und ${result.data.fetched} geprueften Einheiten.`
    )
    await refresh()
  }

  async function uploadSchaufensterSlide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSchaufensterMessage('')
    if (!schaufensterFile) {
      setSchaufensterMessage('Bitte zuerst ein Bild auswaehlen.')
      return
    }

    const formData = new FormData()
    formData.append('title', schaufensterTitle)
    formData.append('image', schaufensterFile)

    setBusy(true)
    try {
      const response = await fetch('/api/schaufenster/upload-slide.php', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const payload = (await response.json()) as ApiResult<{id: number; image_url: string}>
      if (!response.ok || !payload.ok) {
        setSchaufensterMessage(payload.error || 'Upload fehlgeschlagen.')
      } else {
        setSchaufensterMessage('Bildslide hochgeladen und fuer die TV-Anzeige aktiviert.')
        setSchaufensterFile(null)
        setSchaufensterTitle('Frisia Immobilien')
        await refresh()
      }
    } catch (error) {
      setSchaufensterMessage(error instanceof Error ? error.message : 'Upload fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  function updatePartnerDraft(partnerKey: string, patch: Partial<WebsitePartner>) {
    const limitedPatch =
      typeof patch.text === 'string' ? {...patch, text: limitPartnerText(patch.text)} : patch

    setPartners((current) =>
      current.map((partner) =>
        partner.partner_key === partnerKey || partner.key === partnerKey
          ? {...partner, ...limitedPatch}
          : partner
      )
    )
  }

  async function savePartner(event: FormEvent<HTMLFormElement>, partner: WebsitePartner) {
    event.preventDefault()
    setPartnerMessage('')

    const partnerKey = partner.partner_key || partner.key
    const formData = new FormData()
    formData.append('partner_key', partnerKey)
    formData.append('name', partner.name)
    formData.append('text', limitPartnerText(partner.text))
    formData.append('website_url', partner.website_url || '')
    formData.append('sort_order', String(partner.sort_order || 0))
    formData.append('active', partner.active ? '1' : '0')
    const file = partnerFiles[partnerKey]
    if (file) {
      formData.append('image', file)
    }

    setBusy(true)
    try {
      const response = await fetch('/api/partners/index.php', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const payload = (await response.json()) as ApiResult<WebsitePartner[]>
      if (!response.ok || !payload.ok || !payload.data) {
        setPartnerMessage(payload.error || 'Partner konnte nicht gespeichert werden.')
        return
      }
      setPartners(payload.data)
      setPartnerFiles((current) => ({...current, [partnerKey]: null}))
      setPartnerMessage(`Partner gespeichert: ${partner.name}`)
    } catch (error) {
      setPartnerMessage(error instanceof Error ? error.message : 'Partner konnte nicht gespeichert werden.')
    } finally {
      setBusy(false)
    }
  }

  async function syncPartners() {
    setBusy(true)
    setPartnerMessage('')
    const result = await api<PartnerSyncResult>('/api/partners/sync.php', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    if (!result.ok || !result.data) {
      setPartnerMessage(result.error || 'Partner-Abgleich konnte nicht gestartet werden.')
      setBusy(false)
      return
    }

    setPartners(result.data.partners)
    setPartnerMessage(
      `Abgleich abgeschlossen: ${result.data.public_partner_count} aktive Partner im Website-Feed.`
    )
    setBusy(false)
  }

  async function updateSchaufensterSlide(slideId: number, action: 'activate' | 'deactivate' | 'delete') {
    setBusy(true)
    setSchaufensterMessage('')
    const result = await api<{slide_id: number; action: string}>('/api/schaufenster/update-slide.php', {
      method: 'POST',
      body: JSON.stringify({slide_id: slideId, action}),
    })
    setBusy(false)
    if (!result.ok) {
      setSchaufensterMessage(result.error || 'Slide konnte nicht aktualisiert werden.')
      return
    }
    setSchaufensterMessage('Slide aktualisiert.')
    await refresh()
  }

  async function updateTask(taskId: number, action: 'pause' | 'resume' | 'archive') {
    setBusy(true)
    setSchedulerMessage('')
    const result = await api<Task>('/api/tasks/update.php', {
      method: 'POST',
      body: JSON.stringify({task_id: taskId, action}),
    })
    setBusy(false)
    if (!result.ok) {
      setSchedulerMessage(result.error || 'Aufgabe konnte nicht aktualisiert werden.')
      return
    }
    setSchedulerMessage('Aufgabe aktualisiert.')
    await refresh()
  }

  async function runOperationsCheck() {
    setBusy(true)
    setSchedulerMessage('')
    const result = await api<OperationReport>('/api/operations/run.php', {method: 'POST'})
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchedulerMessage(result.error || 'Operations-Check fehlgeschlagen.')
      return
    }
    setOperationReport(result.data)
    setSchedulerMessage(`Operations-Check: ${result.data.overall}.`)
    await refresh()
  }

  async function ensureDefaultTasks() {
    setBusy(true)
    setSchedulerMessage('')
    const result = await api<{created: number}>('/api/tasks/ensure-defaults.php', {method: 'POST'})
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchedulerMessage(result.error || 'Standardaufgaben konnten nicht geprueft werden.')
      return
    }
    setSchedulerMessage(`Standardaufgaben geprueft: ${result.data.created} neu angelegt.`)
    await refresh()
  }

  async function seedStrategicSeoBase() {
    setBusy(true)
    setSchedulerMessage('')
    const result = await api<{
      created_locations: number
      updated_locations: number
      created_quality_rows: number
      created_sources: number
    }>('/api/seo/seed-strategic.php', {method: 'POST'})
    setBusy(false)
    if (!result.ok || !result.data) {
      setSchedulerMessage(result.error || 'IMV-Basis konnte nicht angelegt werden.')
      return
    }
    setSchedulerMessage(
      `IMV-Basis: ${result.data.created_locations} URLs neu, ${result.data.updated_locations} aktualisiert, ${result.data.created_quality_rows} Quality-Rows.`
    )
    await refresh()
  }

  if (!user) {
    return (
      <main className="login-shell">
        <form className="login-box login-box-compact" onSubmit={login}>
          <div className="login-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="login-logo"
              src="/logo.svg"
              alt="Frisia Immobilien"
              width={176}
              height={44}
            />
            <div>
              <h1>Frisia Inside</h1>
              <p>Hier einloggen.</p>
            </div>
          </div>
          <label>
            E-Mail
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Passwort
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {loginError ? <p className="form-error">{loginError}</p> : null}
          <button className="button primary" disabled={busy}>
            {busy ? 'Pruefe...' : 'Einloggen'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/logo.svg" alt="Frisia Immobilien" width={176} height={44} />
          <span>
            <strong>Frisia Inside</strong>
            <small>Operator, Scheduler, Marktsteuerung</small>
          </span>
        </a>
        <nav className="inside-nav" aria-label="Frisia Inside Navigation">
          {INSIDE_NAV_ITEMS.map((item) => (
            <a
              className={`inside-nav-link ${activePage === item.key ? 'is-active' : ''}`}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="top-actions">
          <span className={`status ${health?.database === 'ok' ? 'good' : 'warn'}`}>
            {systemState}
          </span>
          {user ? (
            <button className="button secondary" onClick={logout}>
              Abmelden
            </button>
          ) : null}
        </div>
      </header>

      {activePage === 'overview' ? (
      <section className="hero">
        <div>
          <p className="eyebrow">{activeNavItem.eyebrow}</p>
          <h1>{activeNavItem.title}</h1>
          <p className="lead">{activeNavItem.description}</p>
        </div>
        <div className="hero-panel" aria-label="Systemstatus">
          <p className="hero-panel-title">Systemstatus</p>
          <dl>
            <div>
              <dt>Runtime</dt>
              <dd>PHP {health?.php_version || 'wird geprueft'}</dd>
            </div>
            <div>
              <dt>Datenbank</dt>
              <dd>{health?.database || 'wird geprueft'}</dd>
            </div>
            <div>
              <dt>KI-Modus</dt>
              <dd>{health?.openai_configured ? 'OpenAI aktiv' : 'Sicherer Fallback'}</dd>
            </div>
          </dl>
        </div>
      </section>
      ) : (
        <section className="page-intro">
          <p className="eyebrow">{activeNavItem.eyebrow}</p>
          <h1>{activeNavItem.title}</h1>
          <p>{activeNavItem.description}</p>
        </section>
      )}

      <>
          {activePage === 'overview' ? (
            <>
          <section className="module-grid">
            {modules.map((module) => (
              <article className="module-card" key={module.label}>
                <span className="module-status">{module.status}</span>
                <h2>{module.label}</h2>
                <p>{module.description}</p>
              </article>
            ))}
          </section>

          {systemStatus ? (
            <section className="system-section">
              <div className="panel-heading split-heading">
                <div>
                  <p className="eyebrow">Betrieb & Integrationen</p>
                  <h2>Systemuebersicht</h2>
                </div>
                <button className="button secondary" onClick={() => void refresh()} type="button">
                  Aktualisieren
                </button>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => void runOperationsCheck()}
                  type="button"
                >
                  Operations-Check
                </button>
              </div>
              <div className="readiness-grid">
                {systemStatus.readiness.map((item) => (
                  <article className={`readiness-card ${item.state}`} key={item.key}>
                    <span>{item.state}</span>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
              <div className="metric-strip">
                <div>
                  <dt>Aktive Aufgaben</dt>
                  <dd>{systemStatus.metrics.active_tasks}</dd>
                </div>
                <div>
                  <dt>Faellig</dt>
                  <dd>{systemStatus.metrics.due_tasks}</dd>
                </div>
                <div>
                  <dt>Review-Laeufe</dt>
                  <dd>{systemStatus.metrics.review_runs}</dd>
                </div>
                <div>
                  <dt>SEO-Orte</dt>
                  <dd>{systemStatus.metrics.seo_locations}</dd>
                </div>
                <div>
                  <dt>GSC-Zeilen</dt>
                  <dd>{systemStatus.metrics.search_console_rows}</dd>
                </div>
              </div>
              <p className="system-note">
                Naechster Lauf: {systemStatus.timeline.next_run_at || 'nicht geplant'} · Letzter
                Lauf: {systemStatus.timeline.last_run_at || 'noch keiner'}
              </p>
              {operationReport ? (
                <div className="operation-report">
                  <div className="run-card-head">
                    <div>
                      <strong>Letzter Operations-Check: {operationReport.overall}</strong>
                      <small>{operationReport.generated_at}</small>
                    </div>
                    <span className={`status ${operationReport.overall === 'attention' ? 'warn' : 'good'}`}>
                      {operationReport.overall}
                    </span>
                  </div>
                  <div className="compact-list operation-checks">
                    {operationReport.checks.map((check) => (
                      <div className={`compact-item operation-check ${check.state}`} key={check.key}>
                        <strong>{check.label}</strong>
                        <small>{check.state}</small>
                        <p>{check.detail}</p>
                      </div>
                    ))}
                  </div>
                  {operationReport.recommended_actions.length ? (
                    <ul className="operation-actions">
                      {operationReport.recommended_actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
            </>
          ) : null}

          {activePage === 'website' ? (
          <section className="table-section snapshot-section">
            <div className="panel-heading split-heading">
              <div>
                <p className="eyebrow">Freigabe & Rollback</p>
                <h2>Website-Snapshots</h2>
                <p className="view-count-line">
                  Die Website nutzt nur den aktiv freigegebenen Snapshot. Fehlerhafte Snapshots
                  bleiben automatisch gesperrt.
                </p>
              </div>
              <div className="scheduler-actions">
                <button className="button secondary" disabled={busy} onClick={() => void refresh()} type="button">
                  Aktualisieren
                </button>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => void createWebsiteSnapshot()}
                  type="button"
                >
                  Website synchronisieren
                </button>
              </div>
            </div>

            <div className="snapshot-explainer" aria-label="Snapshot-Erklaerung">
              <article>
                <span>Was ist ein Snapshot?</span>
                <p>
                  Ein Snapshot ist eine gepruefte Momentaufnahme der oeffentlichen Website-Daten:
                  Orte, Marktdaten, Partner, Immobilieninformationen und Textbausteine werden als
                  feste Version gespeichert.
                </p>
              </article>
              <article>
                <span>Was bewirkt er?</span>
                <p>
                  frisia-immobilien.de liest fuer oeffentliche Inhalte nur den aktiv freigegebenen
                  Snapshot. Die Website bleibt dadurch schnell und erreichbar, auch wenn Frisia
                  Inside, Propstack oder eine Datenbank gerade nicht verfuegbar sind.
                </p>
              </article>
              <article>
                <span>Was passiert bei Fehlern?</span>
                <p>
                  Neue Daten gehen erst nach erfolgreicher Validierung live. Wenn ein Snapshot
                  fehlerhaft ist, bleibt automatisch die letzte gueltige Version aktiv; bei Bedarf
                  kann hier ein Rollback ausgefuehrt werden.
                </p>
              </article>
            </div>

            {websiteSnapshotMessage ? <p className="inline-notice">{websiteSnapshotMessage}</p> : null}

            {websiteSnapshotHistory ? (
              <>
                <div className="metric-strip snapshot-metrics">
                  <div>
                    <dt>Aktiv</dt>
                    <dd>{websiteSnapshotHistory.active.active_snapshot || '-'}</dd>
                  </div>
                  <div>
                    <dt>Aktiviert</dt>
                    <dd>{websiteSnapshotHistory.active.activated_at || '-'}</dd>
                  </div>
                  <div>
                    <dt>Historie</dt>
                    <dd>{websiteSnapshotHistory.snapshots.length}</dd>
                  </div>
                  <div>
                    <dt>Gueltig</dt>
                    <dd>
                      {
                        websiteSnapshotHistory.snapshots.filter(
                          (snapshot) => snapshot.status !== 'rejected' && snapshot.validation.ok
                        ).length
                      }
                    </dd>
                  </div>
                  <div>
                    <dt>Fehlerhaft</dt>
                    <dd>
                      {
                        websiteSnapshotHistory.snapshots.filter(
                          (snapshot) => snapshot.status === 'rejected' || !snapshot.validation.ok
                        ).length
                      }
                    </dd>
                  </div>
                </div>

                <div className="table-wrap snapshot-table-wrap">
                  <table className="snapshot-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Version</th>
                        <th>Quelle</th>
                        <th>Datensaetze</th>
                        <th>Validierung</th>
                        <th>Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {websiteSnapshotHistory.snapshots.map((snapshot) => {
                        const valid = snapshot.status !== 'rejected' && snapshot.validation.ok
                        return (
                          <tr key={snapshot.version}>
                            <td>
                              <span
                                className={`snapshot-badge ${
                                  snapshot.active ? 'is-active' : valid ? 'is-valid' : 'is-rejected'
                                }`}
                              >
                                {snapshot.active ? 'Aktiv' : valid ? 'Gueltig' : 'Gesperrt'}
                              </span>
                            </td>
                            <td>
                              <strong>{snapshot.version}</strong>
                              <small>{snapshot.created_at}</small>
                              {snapshot.published_at ? <small>Live: {snapshot.published_at}</small> : null}
                            </td>
                            <td>{snapshot.source_type}</td>
                            <td>
                              <span>{formatNumber(snapshot.counts.market_records)} Markt</span>
                              <small>{formatNumber(snapshot.counts.website_locations)} Orte</small>
                            </td>
                            <td>
                              {snapshot.validation.errors.length ? (
                                <ul className="snapshot-message-list is-error">
                                  {snapshot.validation.errors.map((error) => (
                                    <li key={error}>{error}</li>
                                  ))}
                                </ul>
                              ) : snapshot.validation.warnings.length ? (
                                <ul className="snapshot-message-list">
                                  {snapshot.validation.warnings.map((warning) => (
                                    <li key={warning}>{warning}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>Ok</span>
                              )}
                            </td>
                            <td>
                              {snapshot.active ? (
                                <span className="muted-text">Aktiver Snapshot</span>
                              ) : valid ? (
                                <button
                                  className="button secondary table-button"
                                  disabled={busy}
                                  onClick={() => void activateWebsiteSnapshot(snapshot.version)}
                                  type="button"
                                >
                                  Rollback aktivieren
                                </button>
                              ) : (
                                <span className="muted-text">Nicht aktivierbar</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="muted-text">Snapshot-Historie wird geladen.</p>
            )}
          </section>
          ) : null}

          {activePage === 'seo' ? (
          <section className="table-section seo-section">
            <div className="panel-heading split-heading">
              <div>
                <p className="eyebrow">IMV / SEO Datenbasis</p>
                <h2>Orte & Quality-Governance</h2>
              </div>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => void seedStrategicSeoBase()}
                type="button"
              >
                Strategische Basis anlegen
              </button>
            </div>
            {seoSummary ? (
              <>
                <div className="metric-strip seo-metrics">
                  <div>
                    <dt>URLs</dt>
                    <dd>{seoSummary.locations}</dd>
                  </div>
                  <div>
                    <dt>Quality</dt>
                    <dd>{seoSummary.quality_rows}</dd>
                  </div>
                  <div>
                    <dt>Pending</dt>
                    <dd>{seoSummary.pending_review}</dd>
                  </div>
                  <div>
                    <dt>Indexierbar</dt>
                    <dd>{seoSummary.indexable_verified}</dd>
                  </div>
                  <div>
                    <dt>Quellen</dt>
                    <dd>{seoSummary.sources}</dd>
                  </div>
                </div>
                <div className="compact-list page-type-list">
                  {seoSummary.page_types.length ? (
                    seoSummary.page_types.map((item) => (
                      <div className="compact-item page-type-item" key={item.page_type}>
                        <strong>{item.page_type}</strong>
                        <small>{item.count} URL(s)</small>
                      </div>
                    ))
                  ) : (
                    <p className="muted-text">
                      Noch keine IMV-/SEO-Ortsdaten vorhanden. Der Seed legt nur interne
                      Review-Kandidaten an, keine automatische Indexierungsfreigabe.
                    </p>
                  )}
                </div>
                <div className="seo-enrichment-block">
                  <div className="panel-heading">
                    <p className="eyebrow">Noindex Review</p>
                    <h3>Angereicherte Orte</h3>
                    <p className="view-count-line">
                      Orte mit recherchierten Quellen, Datenpunkten und Review-Status. Freigabe
                      bleibt bewusst manuell.
                    </p>
                  </div>
                  {seoEnrichments.length ? (
                    <div className="seo-enrichment-list">
                      {seoEnrichments.map((enrichment) => {
                        const firstPage = enrichment.pages[0]
                        const status = firstPage?.indexing_state || 'pending_review'
                        const keyMetrics = buildSeoKeyMetrics(enrichment)

                        return (
                          <article className="seo-enrichment-card" key={enrichment.location_slug}>
                            <div className="seo-enrichment-head">
                              <div>
                                <p className="eyebrow">Ort / Datenbasis</p>
                                <h4>{enrichment.location_name}</h4>
                                <p className="view-count-line">
                                  {enrichment.pages.length} Kandidatenseiten ·{' '}
                                  {enrichment.sources.length} Quellen ·{' '}
                                  {enrichment.datapoints.length} Datenpunkte
                                </p>
                              </div>
                              <span className={`status ${indexingStatusClass(status)}`}>
                                {status}
                              </span>
                            </div>

                            <div className="seo-key-metric-grid">
                              {keyMetrics.map((metric) => (
                                <div className={`seo-key-metric ${metric.tone}`} key={metric.label}>
                                  <dt>{metric.label}</dt>
                                  <dd>{metric.value}</dd>
                                  <p>{metric.detail}</p>
                                  {metric.sourceName ? <small>{metric.sourceName}</small> : null}
                                </div>
                              ))}
                            </div>

                            <div className="seo-page-grid">
                              {enrichment.pages.map((page) => (
                                <div className="seo-page-card" key={page.id}>
                                  <strong>{page.page_type}</strong>
                                  <small>{page.url_path}</small>
                                  <div className="seo-score-grid">
                                    <div>
                                      <dt>Quality</dt>
                                      <dd>{formatScore(page.quality_score)}</dd>
                                    </div>
                                    <div>
                                      <dt>Quelle</dt>
                                      <dd>{formatScore(page.source_confidence)}</dd>
                                    </div>
                                    <div>
                                      <dt>Entity</dt>
                                      <dd>{formatScore(page.entity_depth_score)}</dd>
                                    </div>
                                    <div>
                                      <dt>Duplikat</dt>
                                      <dd>{formatScore(page.duplicate_risk)}</dd>
                                    </div>
                                  </div>
                                  <p>
                                    Review: {page.review_status || 'pending'} · Freshness:{' '}
                                    {page.data_freshness || 'offen'}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {firstPage?.indexing_reason ? (
                              <p className="seo-indexing-reason">{firstPage.indexing_reason}</p>
                            ) : null}

                            <details className="imv-location-details seo-enrichment-details" open>
                              <summary>Quellen und Datenpunkte anzeigen</summary>
                              <div className="seo-source-list">
                                {enrichment.sources.map((source) => (
                                  <div className="seo-source-item" key={source.id}>
                                    <strong>{source.source_name}</strong>
                                    <small>
                                      {source.source_type} · {source.usage_scope} · Confidence{' '}
                                      {formatScore(source.source_confidence)}
                                    </small>
                                    {source.source_url ? (
                                      <a href={source.source_url} rel="noreferrer" target="_blank">
                                        {source.source_url}
                                      </a>
                                    ) : null}
                                    {source.notes ? <p>{source.notes}</p> : null}
                                  </div>
                                ))}
                              </div>
                              <div className="seo-datapoint-list">
                                {enrichment.datapoints.map((datapoint) => (
                                  <div className="seo-datapoint-item" key={datapoint.id}>
                                    <strong>{datapoint.metric_label}</strong>
                                    <span>{datapoint.value_text}</span>
                                    <small>
                                      {datapoint.source_name || 'Quelle offen'} ·{' '}
                                      {datapoint.usage_scope}
                                    </small>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </article>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="muted-text seo-enrichment-empty">
                      Noch keine angereicherten Review-Orte importiert.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="muted-text">SEO-/IMV-Status wird geladen.</p>
            )}
          </section>
          ) : null}

          {activePage === 'marktdaten' ? (
          <section className="table-section imv-section">
            <div className="panel-heading split-heading">
              <div>
                <p className="eyebrow">IMV Datenverlauf</p>
                <h2>Marktdaten, Quellen & Attribute</h2>
                {imvHubGroups.length ? (
                  <p className="view-count-line">
                    Aktuelle Ansicht: {formatNumber(imvViewStats.locations)} Orte ·{' '}
                    {formatNumber(imvViewStats.records)} Datensaetze
                  </p>
                ) : null}
              </div>
              <div className="scheduler-actions">
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => void importRuntimeMarketData()}
                  type="button"
                >
                  Marktdaten importieren
                </button>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => void ensureClippingSources()}
                  type="button"
                >
                  Clipping-Quellen
                </button>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => void importWebsiteLocations()}
                  type="button"
                >
                  Website-Orte
                </button>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => void createWebsiteSnapshot()}
                  type="button"
                >
                  Website synchronisieren
                </button>
              </div>
            </div>

            {schedulerMessage ? <p className="inline-notice">{schedulerMessage}</p> : null}

            {imvSummary ? (
              <>
                <div className="metric-strip imv-metrics">
                  <div>
                    <dt>Datensaetze</dt>
                    <dd>{imvSummary.market_records}</dd>
                  </div>
                  <div>
                    <dt>Website-Orte</dt>
                    <dd>{imvSummary.website_locations || imvSummary.market_locations}</dd>
                  </div>
                  <div>
                    <dt>Live</dt>
                    <dd>{imvSummary.website_live_locations || imvSummary.landingpage_records}</dd>
                  </div>
                  <div>
                    <dt>Leadgen</dt>
                    <dd>{imvSummary.leadgen_live_locations || imvSummary.leadgen_records}</dd>
                  </div>
                  <div>
                    <dt>Clipping</dt>
                    <dd>{imvSummary.clipping_sources}</dd>
                  </div>
                </div>

                <div className="compact-list page-type-list">
                  {imvSummary.object_types.map((item) => (
                    <div className="compact-item page-type-item" key={item.object_type}>
                      <strong>{item.object_type}</strong>
                      <small>{item.count} Datensatz/Datensaetze</small>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="muted-text">IMV-Marktdaten werden geladen.</p>
            )}

            {imvHubGroups.length ? (
              <div className="imv-sort-panel" aria-label="IMV-Orte sortieren">
                <div>
                  <span className="imv-sort-kicker">Sortieren nach</span>
                  <small>{activeImvSortOption?.description}</small>
                </div>
                <div className="imv-sort-controls">
                  {IMV_SORT_OPTIONS.map((option) => (
                    <button
                      aria-pressed={imvSortKey === option.key}
                      className={`imv-sort-button ${imvSortKey === option.key ? 'is-active' : ''}`}
                      key={option.key}
                      onClick={() => setImvSortKey(option.key)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {visibleImvHubGroups.length ? (
              <div className="imv-hub" aria-label="IMV Datensatz-Hub nach Regionen">
                {visibleImvHubGroups.map((group, groupIndex) => (
                  <details
                    className="imv-region-group"
                    key={group.region}
                    open={groupIndex < 2}
                    suppressHydrationWarning
                  >
                    <summary className="imv-region-summary">
                      <span>
                        <span className="eyebrow">Region</span>
                        <strong>{group.region}</strong>
                        <small>
                          {group.locations.length} Orte · {group.recordCount} Datensaetze ·{' '}
                          {group.sourceCount} Quellen
                        </small>
                      </span>
                      <span aria-hidden className="imv-toggle">
                        +
                      </span>
                    </summary>

                    <div className="imv-location-grid">
                      {group.locations.map((location) => (
                        <article className="imv-location-card" key={location.locationKey}>
                          <div className="imv-location-card-head">
                            <div className="imv-location-title-row">
                              <span className="imv-status-stack" aria-label="Live- und Leadgenerator-Status">
                                <span
                                  className={`imv-status-light ${location.websiteLive ? 'is-live' : 'is-off'}`}
                                  title={location.websiteLive ? 'Website/Live: sichtbar' : 'Website/Live: nicht sichtbar'}
                                >
                                  <span aria-hidden />
                                  Live
                                </span>
                                <span
                                  className={`imv-status-light ${location.leadgenLive ? 'is-live' : 'is-off'}`}
                                  title={location.leadgenLive ? 'Leadgenerator: aktiv' : 'Leadgenerator: nicht aktiv'}
                                >
                                  <span aria-hidden />
                                  Leadgen
                                </span>
                              </span>
                              <div>
                                <strong>{location.label}</strong>
                                <small>
                                  {[location.locationType, location.city, location.plz ? `PLZ ${location.plz}` : '']
                                    .filter(Boolean)
                                    .join(' · ')}
                                </small>
                              </div>
                            </div>
                            <span className="module-status">{location.records.length} DS</span>
                          </div>

                          <dl className="imv-location-metrics">
                            <div>
                              <dt>Verkaeufe</dt>
                              <dd>{formatNumber(location.totalSales)}</dd>
                            </div>
                            <div>
                              <dt>Median</dt>
                              <dd>{formatRange(location.medianMin, location.medianMax, ' EUR/m2')}</dd>
                            </div>
                            <div>
                              <dt>Tage</dt>
                              <dd>{formatRange(location.daysMin, location.daysMax)}</dd>
                            </div>
                          </dl>

                          <div className="imv-chip-row" aria-label="Datensatz-Attribute">
                            {location.objectTypes.map((objectType) => (
                              <span key={objectType}>{objectType}</span>
                            ))}
                            {location.hasWebsiteLocation ? <span>Website-Ort</span> : null}
                            {location.sitemapIndexable ? <span>Indexierbar</span> : null}
                            {location.landingpageRecords ? <span>Landing</span> : null}
                            {location.leadgenRecords ? <span>Leadgen</span> : null}
                            {location.routeCount ? <span>{location.routeCount} Route(n)</span> : null}
                            <span>{location.sourceCount} Quelle(n)</span>
                          </div>

                          <details className="imv-location-details">
                            <summary>Quellen, Attribute & Variablen anzeigen</summary>
                            <div className="imv-record-list">
                              {location.records.length ? (
                                location.records.map((record) => (
                                <div className="imv-record-item" key={record.id}>
                                  <div className="imv-record-head">
                                    <div>
                                      <strong>{objectTypeLabel(record.object_type)}-Datensatz</strong>
                                      <small>
                                        {[record.auswertung_vom, record.location_type, record.plz ? `PLZ ${record.plz}` : '']
                                          .filter(Boolean)
                                          .join(' · ') || 'ohne Zeitstempel'}
                                      </small>
                                    </div>
                                    <span className="module-status">
                                      {record.landingpage_geeignet ? 'Landing' : 'Review'}
                                    </span>
                                  </div>
                                  <dl className="imv-record-metrics">
                                    <div>
                                      <dt>Verkaeufe</dt>
                                      <dd>{record.verkaeufe_anzahl ?? '-'}</dd>
                                    </div>
                                    <div>
                                      <dt>Median</dt>
                                      <dd>
                                        {record.median_preis_eur_m2
                                          ? `${record.median_preis_eur_m2} EUR/m2`
                                          : '-'}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>Durchschnitt</dt>
                                      <dd>
                                        {record.durchschnitt_preis_eur_m2
                                          ? `${record.durchschnitt_preis_eur_m2} EUR/m2`
                                          : '-'}
                                      </dd>
                                    </div>
                                    <div>
                                      <dt>Tage</dt>
                                      <dd>{record.tage_am_markt ?? '-'}</dd>
                                    </div>
                                  </dl>
                                  <p className="imv-source-line">
                                    Quelle: {record.quelle_pdf || 'interne Runtime-Marktdaten'} · Import:{' '}
                                    {record.imported_at}
                                  </p>
                                  <pre>{JSON.stringify(record.raw || record, null, 2)}</pre>
                                </div>
                                ))
                              ) : (
                                <p className="muted-text">
                                  Dieser Ort ist aus der Website-Datenbasis importiert, hat aber aktuell
                                  keinen separaten IMV-Marktdatensatz in der Inside-Datenbank.
                                </p>
                              )}
                              {location.urlPaths.length ? (
                                <div className="imv-url-list">
                                  <strong>Website-Routen</strong>
                                  {location.urlPaths.slice(0, 10).map((path) => (
                                    <small key={path}>{path}</small>
                                  ))}
                                  {location.urlPaths.length > 10 ? (
                                    <small>+ {location.urlPaths.length - 10} weitere Routen</small>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </details>
                        </article>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : imvHubGroups.length ? (
              <p className="muted-text imv-empty">
                In dieser Ansicht werden aktuell keine Orte oder Datensaetze angezeigt.
              </p>
            ) : (
              <p className="muted-text imv-empty">
                Noch keine Runtime-Marktdaten importiert. Nach dem Import werden hier alle
                Datensaetze mit Quellen und internen Variablen als Regionen-Hub angezeigt.
              </p>
            )}
          </section>
          ) : null}

          {activePage === 'clipping' ? (
          <section className="table-section clipping-section">
            <div className="panel-heading">
              <p className="eyebrow">IMV Clipping</p>
              <h2>Plattformen & regionale Signale</h2>
            </div>
            <div className="compact-list clipping-source-list">
              {clippingData?.sources.length ? (
                clippingData.sources.map((source) => (
                  <div className="compact-item" key={source.platform_key}>
                    <strong>{source.platform_name}</strong>
                    <small>
                      {source.source_type} · {source.status} · {source.access_mode}
                    </small>
                    <p>{source.notes}</p>
                    {source.base_url ? <p>{source.base_url}</p> : null}
                  </div>
                ))
              ) : (
                <p className="muted-text">
                  Noch keine Clipping-Quellen angelegt. Der Workflow speichert Quellenlink,
                  Kurz-Zusammenfassung, Ort, Thema und Reviewstatus. Keine Volltextkopien und
                  kein nicht genehmigtes Massenscraping.
                </p>
              )}
            </div>
          </section>
          ) : null}

          {activePage === 'partner' ? (
          <section className="table-section partner-section">
            <div className="panel-heading split-heading">
              <div>
                <p className="eyebrow">Website Partner</p>
                <h2>Partnerseite pflegen</h2>
                <p className="view-count-line">
                  Bis zu 25 Partner koennen mit Bild, Beschreibungstext und optionaler
                  Website-URL gepflegt werden. Ohne Bild nutzt frisia-immobilien.de
                  automatisch das Fallbackbild.
                </p>
              </div>
              <div className="scheduler-actions">
                <button className="button primary" disabled={busy} onClick={() => void syncPartners()} type="button">
                  Abgleich starten
                </button>
                <a className="button secondary" href="/api/partners/public.php" target="_blank" rel="noreferrer">
                  Feed pruefen
                </a>
              </div>
            </div>

            <div className="metric-strip partner-metrics">
              <div>
                <dt>Partner</dt>
                <dd>{partners.length}</dd>
              </div>
              <div>
                <dt>Aktiv</dt>
                <dd>{partners.filter((partner) => partner.active).length}</dd>
              </div>
              <div>
                <dt>Mit Bild</dt>
                <dd>{partners.filter((partner) => Boolean(partner.image_url)).length}</dd>
              </div>
              <div>
                <dt>Export</dt>
                <dd>JSON</dd>
              </div>
            </div>

            {partnerMessage ? <p className="inline-notice">{partnerMessage}</p> : null}

            <div className="partner-editor-grid">
              {partners.length ? (
                partners.map((partner) => {
                  const partnerKey = partner.partner_key || partner.key
                  return (
                    <form className="partner-card" key={partnerKey} onSubmit={(event) => void savePartner(event, partner)}>
                      <div className="partner-image-preview">
                        {partner.image_url ? (
                          <img src={partner.image_url} alt="" />
                        ) : (
                          <div>
                            <strong>{partner.name.slice(0, 2).toLocaleUpperCase('de-DE')}</strong>
                            <small>Fallbackbild aktiv</small>
                          </div>
                        )}
                      </div>

                      <div className="partner-card-body">
                        <div className="partner-title-row">
                          <label>
                            Name
                            <input
                              value={partner.name}
                              onChange={(event) => updatePartnerDraft(partnerKey, {name: event.target.value})}
                            />
                          </label>
                          <label>
                            Reihenfolge
                            <input
                              min="0"
                              type="number"
                              value={partner.sort_order}
                              onChange={(event) =>
                                updatePartnerDraft(partnerKey, {sort_order: Number(event.target.value)})
                              }
                            />
                          </label>
                        </div>

                        <label>
                          Beschreibungstext
                          <textarea
                            maxLength={PARTNER_TEXT_MAX_LENGTH}
                            rows={5}
                            value={partner.text}
                            onChange={(event) => updatePartnerDraft(partnerKey, {text: event.target.value})}
                          />
                          <span className="field-meta">
                            {partnerTextLength(partner.text)} / {PARTNER_TEXT_MAX_LENGTH} Zeichen
                          </span>
                        </label>

                        <label>
                          Website-URL optional
                          <input
                            value={partner.website_url || ''}
                            onChange={(event) =>
                              updatePartnerDraft(partnerKey, {website_url: event.target.value})
                            }
                            placeholder="https://..."
                          />
                        </label>

                        <label>
                          Bild hochladen
                          <input
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) =>
                              setPartnerFiles((current) => ({
                                ...current,
                                [partnerKey]: event.target.files?.[0] ?? null,
                              }))
                            }
                            type="file"
                          />
                        </label>
                        {partnerFiles[partnerKey]?.name ? (
                          <p className="view-count-line">Ausgewaehlt: {partnerFiles[partnerKey]?.name}</p>
                        ) : null}

                        <div className="partner-card-actions">
                          <label className="checkline">
                            <input
                              checked={partner.active}
                              onChange={(event) => updatePartnerDraft(partnerKey, {active: event.target.checked})}
                              type="checkbox"
                            />
                            Auf Website anzeigen
                          </label>
                          <button className="button primary" disabled={busy} type="submit">
                            Speichern
                          </button>
                        </div>
                      </div>
                    </form>
                  )
                })
              ) : (
                <p className="muted-text">
                  Partnerdaten werden geladen. Falls die Tabelle noch fehlt, legt der API-Endpunkt
                  sie beim ersten erfolgreichen Aufruf automatisch an.
                </p>
              )}
            </div>
          </section>
          ) : null}

          {activePage === 'schaufenster' ? (
          <section className="table-section schaufenster-section">
            <div className="panel-heading split-heading">
              <div>
                <p className="eyebrow">Schaufenster TV</p>
                <h2>TV-Ausspielung steuern</h2>
                <p className="view-count-line">
                  Propstack-Filter: <strong>einheit.custom.schaufenster_tv = Ja</strong>. Die
                  Anzeige-URL ist noindex und fuer Full HD optimiert. Medien-Tags:
                  <strong> Schaufenster-TV 1</strong> = Titelbild,
                  <strong> Schaufenster-TV 2</strong> = oben rechts,
                  <strong> Schaufenster-TV 3</strong> = unten rechts. Ohne Tags werden die ersten
                  drei Bilder genutzt.
                </p>
              </div>
              <div className="scheduler-actions">
                <a className="button secondary" href="/schaufenster-tv/live" target="_blank" rel="noreferrer">
                  TV-URL oeffnen
                </a>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => void syncSchaufensterProperties()}
                  type="button"
                >
                  Propstack synchronisieren
                </button>
              </div>
            </div>

            {schaufensterMessage ? <p className="inline-notice">{schaufensterMessage}</p> : null}

            <div className="metric-strip schaufenster-metrics">
              <div>
                <dt>Immobilien</dt>
                <dd>{schaufensterSummary?.active_properties ?? 0}</dd>
              </div>
              <div>
                <dt>Eigene Slides</dt>
                <dd>{schaufensterSummary?.active_slides ?? 0}</dd>
              </div>
              <div>
                <dt>Letzter Sync</dt>
                <dd>{schaufensterSummary?.last_sync_at ? 'aktiv' : '-'}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>1080p</dd>
              </div>
            </div>

            <div className="schaufenster-admin-grid">
              <form className="workspace-panel schaufenster-upload" onSubmit={uploadSchaufensterSlide}>
                <div className="panel-heading">
                  <p className="eyebrow">Eigener Bildslide</p>
                  <h2>Werbung / Suche / Hinweis hochladen</h2>
                </div>
                <label>
                  Titel
                  <input
                    value={schaufensterTitle}
                    onChange={(event) => setSchaufensterTitle(event.target.value)}
                  />
                </label>
                <label>
                  Bild fuer Full-HD
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setSchaufensterFile(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                </label>
                <button className="button primary" disabled={busy || !schaufensterFile}>
                  Bildslide aktivieren
                </button>
                <p className="view-count-line">
                  Empfehlung: 1920 x 1080 px, JPG oder WEBP. Hochgeladene Bilder laufen im Wechsel
                  mit den Propstack-Immobilien.
                </p>
              </form>

              <div className="workspace-panel">
                <div className="panel-heading">
                  <p className="eyebrow">Aktive TV-Quelle</p>
                  <h2>{schaufensterSummary?.display_url || '/schaufenster-tv/live'}</h2>
                </div>
                <p>
                  Diese URL auf dem Schaufenster-TV oeffnen. Die Anzeige wechselt automatisch und
                  blendet Immobilien sowie eigene Slides elegant per Fade ein.
                </p>
                <a className="button primary" href="/schaufenster-tv/live" target="_blank" rel="noreferrer">
                  Schaufenster-TV anzeigen
                </a>
              </div>
            </div>

            <div className="schaufenster-lists">
              <article className="table-section schaufenster-list-card">
                <div className="panel-heading">
                  <p className="eyebrow">Propstack</p>
                  <h2>Aktive Immobilien</h2>
                </div>
                <div className="compact-list">
                  {schaufensterSummary?.properties.length ? (
                    schaufensterSummary.properties.map((item) => (
                      <div className="compact-item schaufenster-item" key={item.propstack_id}>
                        {item.image_url ? <img src={item.image_url} alt="" /> : null}
                        <div>
                          <strong>{item.title}</strong>
                          <small>
                            {item.property_type} · {item.location || 'Ort offen'} · {item.price_text}
                          </small>
                          <p>
                            Propstack #{item.propstack_id} · Flag: {item.custom_flag_value || 'Ja'} ·{' '}
                            {item.active ? 'aktiv' : 'inaktiv'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted-text">
                      Noch keine Immobilie synchronisiert. Voraussetzung ist in Propstack:
                      custom.schaufenster_tv = Ja.
                    </p>
                  )}
                </div>
              </article>

              <article className="table-section schaufenster-list-card">
                <div className="panel-heading">
                  <p className="eyebrow">Eigene Slides</p>
                  <h2>Uploads</h2>
                </div>
                <div className="compact-list">
                  {schaufensterSummary?.slides.length ? (
                    schaufensterSummary.slides.map((slide) => (
                      <div className="compact-item schaufenster-item" key={slide.id}>
                        <img src={slide.image_url} alt="" />
                        <div>
                          <strong>{slide.title}</strong>
                          <small>{slide.active ? 'aktiv' : 'inaktiv'} · {slide.created_at || ''}</small>
                          <div className="table-actions">
                            <button
                              className="button table-button"
                              disabled={busy}
                              onClick={() =>
                                void updateSchaufensterSlide(slide.id, slide.active ? 'deactivate' : 'activate')
                              }
                              type="button"
                            >
                              {slide.active ? 'Deaktivieren' : 'Aktivieren'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="muted-text">Noch keine eigenen Bildslides hochgeladen.</p>
                  )}
                </div>
              </article>
            </div>
          </section>
          ) : null}

          {activePage === 'operator' ? (
          <section className="workspace-grid">
            <form className="workspace-panel" onSubmit={runOperator}>
              <div className="panel-heading">
                <p className="eyebrow">Frisia Website Operator</p>
                <h2>Anweisung vorbereiten</h2>
              </div>
              <textarea
                value={operatorInput}
                onChange={(event) => setOperatorInput(event.target.value)}
                rows={6}
              />
              <button className="button primary" disabled={busy}>
                Vorschlag erzeugen
              </button>
              {operatorResult ? <pre className="operator-result">{operatorResult}</pre> : null}
            </form>
          </section>
          ) : null}

          {activePage === 'scheduler' ? (
          <>
          <section className="workspace-grid">
            <form className="workspace-panel" onSubmit={createTask}>
              <div className="panel-heading">
                <p className="eyebrow">AI Scheduler</p>
                <h2>Aufgabe planen</h2>
              </div>
              <label>
                Titel
                <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
              </label>
              <label>
                Wiederholung
                <select
                  value={taskRecurrence}
                  onChange={(event) => setTaskRecurrence(event.target.value)}
                >
                  <option value="once">Einmalig</option>
                  <option value="weekly">Woechentlich</option>
                  <option value="every_4_weeks">Alle 4 Wochen</option>
                  <option value="monthly">Monatlich</option>
                  <option value="quarterly">Quartalsweise</option>
                </select>
              </label>
              <label>
                Anweisung
                <textarea
                  value={taskInstruction}
                  onChange={(event) => setTaskInstruction(event.target.value)}
                  rows={5}
                />
              </label>
              <button className="button primary" disabled={busy}>
                Aufgabe speichern
              </button>
            </form>
          </section>

          <section className="table-section">
            <div className="panel-heading split-heading">
              <div>
                <p className="eyebrow">Geplante KI-Auftraege</p>
                <h2>Scheduler</h2>
              </div>
              <div className="scheduler-actions">
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => void runScheduler(false)}
                  type="button"
                >
                  Faellige ausfuehren
                </button>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => void runScheduler(true)}
                  type="button"
                >
                  Review-Testlauf
                </button>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() => void ensureDefaultTasks()}
                  type="button"
                >
                  Standardaufgaben
                </button>
              </div>
            </div>
            {schedulerMessage ? <p className="inline-notice">{schedulerMessage}</p> : null}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Aufgabe</th>
                    <th>Status</th>
                    <th>Rhythmus</th>
                    <th>Naechster Lauf</th>
                    <th>Risiko</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length ? (
                    tasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{task.status}</td>
                        <td>{task.recurrence}</td>
                        <td>{task.next_run_at || 'offen'}</td>
                        <td>{task.risk_level}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="button table-button"
                              disabled={busy || task.status !== 'active'}
                              onClick={() => void runScheduler(true, task.id)}
                              type="button"
                            >
                              Jetzt pruefen
                            </button>
                            {task.status === 'active' ? (
                              <button
                                className="button table-button"
                                disabled={busy}
                                onClick={() => void updateTask(task.id, 'pause')}
                                type="button"
                              >
                                Pausieren
                              </button>
                            ) : (
                              <button
                                className="button table-button"
                                disabled={busy}
                                onClick={() => void updateTask(task.id, 'resume')}
                                type="button"
                              >
                                Fortsetzen
                              </button>
                            )}
                            {task.status !== 'archived' ? (
                              <button
                                className="button table-button"
                                disabled={busy}
                                onClick={() => void updateTask(task.id, 'archive')}
                                type="button"
                              >
                                Archivieren
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>Noch keine Aufgaben angelegt.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="table-section run-section">
            <div className="panel-heading">
              <p className="eyebrow">Letzte Auswertungen</p>
              <h2>Review-Laeufe</h2>
            </div>
            <div className="run-list">
              {runs.length ? (
                runs.map((run) => (
                  <article className="run-card" key={run.id}>
                    <div className="run-card-head">
                      <div>
                        <strong>{run.task_title || `Aufgabe #${run.task_id}`}</strong>
                        <small>{run.created_at}</small>
                      </div>
                      <span className="module-status">{run.result?.mode || run.status}</span>
                    </div>
                    <p>{run.result?.summary || run.error_text || 'Kein Ergebnistext vorhanden.'}</p>
                    {run.result?.recommendations?.length ? (
                      <ul>
                        {run.result.recommendations.slice(0, 4).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {run.result?.answer ? (
                      <button
                        className="button secondary detail-toggle"
                        onClick={() => setSelectedRunId(selectedRunId === run.id ? null : run.id)}
                        type="button"
                      >
                        {selectedRunId === run.id ? 'Details ausblenden' : 'Details anzeigen'}
                      </button>
                    ) : null}
                    {selectedRunId === run.id && run.result?.answer ? (
                      <pre className="operator-result run-detail">{run.result.answer}</pre>
                    ) : null}
                  </article>
                ))
              ) : (
              <p className="muted-text">Noch keine Scheduler-Laeufe vorhanden.</p>
              )}
            </div>
          </section>
          </>
          ) : null}

          {activePage === 'audit' ? (
          <section className="ops-grid">
            <article className="table-section ops-card">
              <div className="panel-heading">
                <p className="eyebrow">Operator-Historie</p>
                <h2>Gespraeche</h2>
              </div>
              <div className="compact-list">
                {conversations.length ? (
                  conversations.map((conversation) => (
                    <div className="compact-item" key={conversation.id}>
                      <strong>{conversation.title}</strong>
                      <small>
                        {conversation.message_count} Nachrichten ·{' '}
                        {conversation.last_message_at || conversation.created_at}
                      </small>
                      {conversation.preview ? <p>{conversation.preview}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="muted-text">Noch keine Operator-Gespraeche vorhanden.</p>
                )}
              </div>
            </article>

            <article className="table-section ops-card">
              <div className="panel-heading">
                <p className="eyebrow">Audit</p>
                <h2>Protokoll</h2>
              </div>
              <div className="compact-list">
                {auditItems.length ? (
                  auditItems.slice(0, 12).map((item) => (
                    <div className="compact-item" key={item.id}>
                      <strong>{item.action}</strong>
                      <small>
                        {item.created_at}
                        {item.user_email ? ` · ${item.user_email}` : ''}
                      </small>
                      {item.details ? <p>{JSON.stringify(item.details)}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="muted-text">Noch keine Audit-Eintraege vorhanden.</p>
                )}
              </div>
            </article>
          </section>
          ) : null}
        </>
    </main>
  )
}
