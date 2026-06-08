import {createHash} from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const snapshotRoots = [
  path.join(repoRoot, 'data', 'website-snapshots'),
  path.join(repoRoot, 'web', 'data', 'website-snapshots'),
]
const runtimeRoot = path.join(repoRoot, 'data', 'market', 'runtime')
const localInsidePartnersPath = path.join(repoRoot, 'inside', 'public', 'storage', 'partners', 'public.json')
const allowedStatusNames = new Set(['vermarktung', 'reserviert (käufer zugesagt)'])
const minMarketRecords = 1000
const minLocationRecords = 500

function argValue(name) {
  const prefix = `--${name}=`
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix))
  return arg ? arg.slice(prefix.length) : ''
}

function hasArg(name) {
  return process.argv.includes(`--${name}`)
}

function timestampId() {
  const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  return `snapshot_${stamp.replace(/[-:]/g, '').replace('T', '_').replace('Z', '')}`
}

function nowIso() {
  return new Date().toISOString()
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  const raw = readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index < 1) continue
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

function readJson(filePath, fallback = {}) {
  const raw = readFileSync(filePath, 'utf8')
  return JSON.parse(raw || JSON.stringify(fallback))
}

function safeReadJson(filePath, fallback = {}) {
  try {
    return readJson(filePath, fallback)
  } catch {
    return fallback
  }
}

function json(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`
}

function atomicWrite(filePath, contents) {
  mkdirSync(path.dirname(filePath), {recursive: true})
  const tmp = `${filePath}.tmp`
  writeFileSync(tmp, contents)
  renameSync(tmp, filePath)
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const numeric = Number(value.trim().replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(numeric) ? numeric : null
}

function normalizeText(value) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return ''
}

function normalizeStatusName(value) {
  return normalizeText(value).replace(/\s+/g, ' ').toLocaleLowerCase('de-DE')
}

function objectType(record) {
  const direct = normalizeText(record.object_type).toLowerCase()
  if (direct === 'haus' || direct === 'wohnung') return direct
  const label = normalizeText(record.objektart).toLowerCase()
  if (label.includes('wohnung')) return 'wohnung'
  if (label.includes('haus')) return 'haus'
  return direct
}

function publicSlug(record) {
  return (
    normalizeText(record.ortsteil_slug) ||
    normalizeText(record.stadt_gemeinde_slug) ||
    normalizeText(record.landkreis_slug) ||
    normalizeText(record.region_slug) ||
    normalizeText(record.location_slug)
  )
}

function isValidSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizeText(value))
}

function isValidUrl(value) {
  const text = normalizeText(value)
  if (!text) return true
  if (text.startsWith('/')) return true
  try {
    const url = new URL(text)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function slugify(value) {
  return normalizeText(value)
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function loadRuntimePayloads() {
  const marketPath = path.join(runtimeRoot, 'leadgen_market_data.json')
  const locationsPath = path.join(runtimeRoot, 'website_locations.json')
  const market = readJson(marketPath, {records: []})
  const locations = readJson(locationsPath, {locations: []})

  return {
    market: {
      ...market,
      records: Array.isArray(market.records) ? market.records : [],
    },
    locations: {
      ...locations,
      locations: Array.isArray(locations.locations) ? locations.locations : [],
    },
  }
}

async function loadDatabasePublicData(warnings) {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    return {contentRows: [], imageRows: [], priceHistoryRows: []}
  }

  try {
    const {neon} = await import('@neondatabase/serverless')
    const sql = neon(databaseUrl)
    const [contentRows, imageRows, priceHistoryRows] = await Promise.all([
      sql`
        SELECT *
        FROM seo_location_content
        WHERE COALESCE(custom_intro, custom_text_1, custom_text_2, custom_text_3, meta_title, meta_description) IS NOT NULL
      `,
      sql`
        SELECT location_slug, page_type, image_type, file_path, alt_text, title, caption, sort_order
        FROM seo_location_images
        WHERE image_type = 'hero'
      `,
      sql`
        SELECT *
        FROM price_history
        WHERE median_preis_eur_m2 IS NOT NULL
        ORDER BY location_slug ASC, object_type ASC, year ASC
      `,
    ])

    return {
      contentRows: Array.isArray(contentRows) ? contentRows : [],
      imageRows: Array.isArray(imageRows) ? imageRows : [],
      priceHistoryRows: Array.isArray(priceHistoryRows) ? priceHistoryRows : [],
    }
  } catch (error) {
    warnings.push(`Neon-Snapshotdaten konnten nicht gelesen werden: ${error.message}`)
    return {contentRows: [], imageRows: [], priceHistoryRows: []}
  }
}

function normalizePartner(item, index) {
  const key = normalizeText(item.key ?? item.partner_key)
  if (!key) return null
  return {
    key,
    name: normalizeText(item.name ?? item.title) || key,
    text: normalizeText(item.text ?? item.description),
    image_url: normalizeText(item.image_url ?? item.imageUrl),
    website_url: normalizeText(item.website_url ?? item.websiteUrl),
    sort_order: toNumber(item.sort_order ?? item.sortOrder) ?? (index + 1) * 10,
    active: item.active !== false && item.active !== 0 && item.active !== '0',
  }
}

async function loadPartners(warnings) {
  const localPayload = safeReadJson(localInsidePartnersPath, null)
  const localItems = Array.isArray(localPayload?.partners) ? localPayload.partners : []
  if (localItems.length > 0) {
    return localItems.map(normalizePartner).filter(Boolean)
  }

  const feedUrl = argValue('partners-url') || process.env.FRISIA_PARTNERS_FEED_URL?.trim()
  if (!feedUrl) return []

  try {
    const response = await fetch(feedUrl, {cache: 'no-store'})
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    const items = Array.isArray(payload) ? payload : Array.isArray(payload.partners) ? payload.partners : []
    return items.map(normalizePartner).filter(Boolean)
  } catch (error) {
    warnings.push(`Partner-Feed konnte nicht gelesen werden: ${error.message}`)
    return []
  }
}

async function propstackFetch(baseUrl, apiKey, apiVersion, requestPath, searchParams) {
  const url = new URL(requestPath.replace(/^\/+/, ''), `${baseUrl.replace(/\/$/, '')}/`)
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }

  const response = await fetch(url.toString(), {
    headers: {
      [apiVersion === 'v1' ? 'X-API-KEY' : 'X-Api-Key']: apiKey,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`${requestPath} HTTP ${response.status}`)
  return response.json()
}

function arrayFromResponse(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

async function loadPropertiesFromPropstack(warnings) {
  const apiKey = process.env.PROPSTACK_API_KEY?.trim()
  if (!apiKey) {
    warnings.push('Propstack API-Key fehlt; Immobilien-Snapshot wurde nicht erzeugt.')
    return {properties: [], brokers: {}, fetched: false}
  }

  const baseV2 = process.env.PROPSTACK_BASE_URL?.trim() || 'https://api.propstack.de/v2'
  const baseV1 =
    process.env.PROPSTACK_V1_BASE_URL?.trim() ||
    baseV2.replace(/\/v2\/?$/i, '/v1') ||
    'https://api.propstack.de/v1'

  const statusesPayload = await propstackFetch(baseV2, apiKey, 'v2', '/property_statuses')
  const statuses = arrayFromResponse(statusesPayload)
  const statusIds = statuses
    .filter((status) => allowedStatusNames.has(normalizeStatusName(status.name)))
    .map((status) => status.id)
    .filter((id) => Number.isFinite(Number(id)))

  if (statusIds.length === 0) {
    throw new Error('Propstack-Status fuer Website-Vermarktung nicht gefunden.')
  }

  const listPayload = await propstackFetch(baseV2, apiKey, 'v2', '/properties', {
    status: statusIds.join(','),
    per: 200,
    sort_by: 'updated_at',
    order: 'desc',
  })
  const listed = arrayFromResponse(listPayload).filter((property) => statusIds.includes(property.property_status_id))
  const properties = []
  const brokerIds = new Set()

  for (const property of listed) {
    const id = Number(property.id)
    if (!Number.isFinite(id)) continue
    const [detail, v1Supplement] = await Promise.all([
      propstackFetch(baseV2, apiKey, 'v2', `/properties/${id}`).catch(() => property),
      propstackFetch(baseV1, apiKey, 'v1', `/units/${id}`).catch(() => null),
    ])
    const merged = {
      ...property,
      ...detail,
      custom_fields: v1Supplement?.custom_fields ?? detail?.custom_fields ?? property.custom_fields,
      fields: v1Supplement?.fields ?? detail?.fields ?? property.fields,
      monument: v1Supplement?.monument ?? detail?.monument ?? property.monument,
      optional_fields: v1Supplement?.optional_fields ?? detail?.optional_fields ?? property.optional_fields,
    }
    properties.push(merged)
    if (merged.broker_id) brokerIds.add(Number(merged.broker_id))
  }

  const brokers = {}
  for (const id of brokerIds) {
    const v1Broker = await propstackFetch(baseV1, apiKey, 'v1', `/brokers/${id}`).catch(() => null)
    const v2Broker = v1Broker ? null : await propstackFetch(baseV2, apiKey, 'v2', `/brokers/${id}`).catch(() => null)
    const broker = v1Broker?.data ?? v1Broker ?? v2Broker?.data ?? v2Broker
    if (broker && typeof broker === 'object') brokers[String(id)] = broker
  }

  return {properties, brokers, fetched: true}
}

function previousActiveSnapshot(root) {
  const activePath = path.join(root, 'active-snapshot.json')
  const active = safeReadJson(activePath, null)
  return active?.activeSnapshotId || null
}

function validateSnapshot(input) {
  const errors = []
  const warnings = [...input.warnings]
  let housePriceRecords = 0
  let apartmentPriceRecords = 0
  const locationSlugs = new Set()
  const duplicateLocationSlugs = new Set()

  if (!Array.isArray(input.market.records)) errors.push('Marktdaten-JSON hat kein records-Array.')
  if (!Array.isArray(input.locations.locations)) errors.push('Website-Orte-JSON hat kein locations-Array.')

  for (const record of input.market.records) {
    if (!record || typeof record !== 'object') continue
    const price = toNumber(record.median_preis_eur_m2) ?? toNumber(record.durchschnitt_preis_eur_m2)
    if (!publicSlug(record)) errors.push('Marktdatensatz ohne oeffentlichen Slug gefunden.')
    if (!price || price <= 0) continue
    if (objectType(record) === 'haus') housePriceRecords += 1
    if (objectType(record) === 'wohnung') apartmentPriceRecords += 1
  }

  for (const location of input.locations.locations) {
    const slug = normalizeText(location.location_slug)
    if (!slug || !isValidSlug(slug)) {
      errors.push(`Ungueltiger Orts-Slug: ${slug || 'leer'}`)
      continue
    }
    if (locationSlugs.has(slug)) duplicateLocationSlugs.add(slug)
    locationSlugs.add(slug)
    if (!normalizeText(location.location_label)) errors.push(`Ort ohne Label: ${slug}`)
  }

  for (const partner of input.partners) {
    if (!normalizeText(partner.key)) errors.push('Partner ohne Key gefunden.')
    if (!normalizeText(partner.name)) errors.push(`Partner ohne Name: ${partner.key || 'unbekannt'}`)
    if (!normalizeText(partner.text)) errors.push(`Partner ohne Text: ${partner.key || partner.name || 'unbekannt'}`)
    if (!isValidUrl(partner.website_url)) errors.push(`Partner mit ungueltiger Website: ${partner.name}`)
    if (!isValidUrl(partner.image_url)) errors.push(`Partner mit ungueltigem Bildpfad: ${partner.name}`)
  }

  for (const property of input.properties) {
    const id = Number(property.id)
    const title = normalizeText(property.title) || normalizeText(property.name)
    if (!Number.isFinite(id)) errors.push('Immobilie ohne numerische ID gefunden.')
    if (!title) errors.push(`Immobilie ohne Titel: ${id || 'unbekannt'}`)
    if (!normalizeText(property.city)) warnings.push(`Immobilie ohne Ort: ${title || id}`)
    if (!property.property_status_id) errors.push(`Immobilie ohne Status: ${title || id}`)
    for (const image of Array.isArray(property.images) ? property.images : []) {
      if (image?.url && !isValidUrl(image.url)) errors.push(`Immobilie mit ungueltigem Bildpfad: ${title || id}`)
    }
  }

  if (input.market.records.length < minMarketRecords) {
    errors.push(`Zu wenige Marktdatensaetze (${input.market.records.length}).`)
  }
  if (input.locations.locations.length < minLocationRecords) {
    errors.push(`Zu wenige Website-Orte (${input.locations.locations.length}).`)
  }
  if (housePriceRecords === 0) errors.push('Keine Hauspreis-Datensaetze mit Preis vorhanden.')
  if (apartmentPriceRecords === 0) errors.push('Keine Wohnungspreis-Datensaetze mit Preis vorhanden.')
  if (duplicateLocationSlugs.size > 0) {
    errors.push(`Doppelte Orts-Slugs: ${Array.from(duplicateLocationSlugs).slice(0, 20).join(', ')}`)
  }
  if (!input.propertyFetchSucceeded && input.properties.length === 0) {
    errors.push('Propstack-Immobilien konnten nicht in den Snapshot uebernommen werden.')
  }

  return {
    ok: errors.length === 0,
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
    counts: {
      market_records: input.market.records.length,
      website_locations: input.locations.locations.length,
      seo_content_records: input.contentRows.length,
      seo_image_records: input.imageRows.length,
      price_history_records: input.priceHistoryRows.length,
      partners: input.partners.length,
      properties: input.properties.length,
      brokers: Object.keys(input.brokers).length,
      text_snippets: 0,
      house_price_records: housePriceRecords,
      apartment_price_records: apartmentPriceRecords,
    },
  }
}

function writeSnapshot({snapshotId, payloads, manifest, active}) {
  const manifestJson = json(manifest)

  for (const root of snapshotRoots) {
    const snapshotDir = path.join(root, 'snapshots', snapshotId)
    atomicWrite(path.join(snapshotDir, 'manifest.json'), manifestJson)
    atomicWrite(path.join(snapshotDir, 'leadgen_market_data.json'), payloads.marketJson)
    atomicWrite(path.join(snapshotDir, 'website_locations.json'), payloads.locationsJson)
    atomicWrite(path.join(snapshotDir, 'seo_location_content.json'), payloads.contentJson)
    atomicWrite(path.join(snapshotDir, 'seo_location_images.json'), payloads.imagesJson)
    atomicWrite(path.join(snapshotDir, 'price_history.json'), payloads.priceHistoryJson)
    atomicWrite(path.join(snapshotDir, 'partners.json'), payloads.partnersJson)
    atomicWrite(path.join(snapshotDir, 'properties.json'), payloads.propertiesJson)
    atomicWrite(path.join(snapshotDir, 'text_snippets.json'), payloads.textSnippetsJson)
    atomicWrite(path.join(root, 'active-snapshot.json'), json(active))
  }
}

function rollback() {
  for (const root of snapshotRoots) {
    const activePath = path.join(root, 'active-snapshot.json')
    const active = safeReadJson(activePath, null)
    const fallbackId = active?.fallbackSnapshotId
    if (!fallbackId) throw new Error('Kein Fallback-Snapshot fuer Rollback hinterlegt.')
    const manifestPath = path.join(root, 'snapshots', fallbackId, 'manifest.json')
    const manifest = safeReadJson(manifestPath, null)
    if (!manifest || manifest.validationStatus !== 'valid') {
      throw new Error(`Fallback-Snapshot ist nicht gueltig: ${fallbackId}`)
    }
    atomicWrite(activePath, json({
      activeSnapshotId: fallbackId,
      fallbackSnapshotId: active.activeSnapshotId || null,
      publishedAt: nowIso(),
      checksum: manifest.checksum,
      rollback: true,
    }))
  }
  console.log('Rollback auf letzten gueltigen Website-Snapshot ausgefuehrt.')
}

loadEnvFile(path.join(repoRoot, 'web', '.env.local'))

if (hasArg('rollback')) {
  rollback()
  process.exit(0)
}

const warnings = []
const snapshotId = argValue('id') || timestampId()
const generatedAt = nowIso()
const runtime = loadRuntimePayloads()
const databaseData = await loadDatabasePublicData(warnings)
let propertyData = {properties: [], brokers: {}, fetched: false}
try {
  propertyData = await loadPropertiesFromPropstack(warnings)
} catch (error) {
  warnings.push(`Propstack-Immobilien konnten nicht gelesen werden: ${error.message}`)
}
const partners = await loadPartners(warnings)

const validation = validateSnapshot({
  market: runtime.market,
  locations: runtime.locations,
  contentRows: databaseData.contentRows,
  imageRows: databaseData.imageRows,
  priceHistoryRows: databaseData.priceHistoryRows,
  partners,
  properties: propertyData.properties,
  brokers: propertyData.brokers,
  propertyFetchSucceeded: propertyData.fetched,
  warnings,
})

const payloads = {
  marketJson: json({
    generatedAt,
    sourceFile: `website-snapshots/${snapshotId}/leadgen_market_data.json`,
    recordCount: runtime.market.records.length,
    records: runtime.market.records,
  }),
  locationsJson: json({
    generatedAt,
    sourceFile: `website-snapshots/${snapshotId}/website_locations.json`,
    locationCount: runtime.locations.locations.length,
    locations: runtime.locations.locations,
  }),
  contentJson: json({
    generatedAt,
    recordCount: databaseData.contentRows.length,
    content: databaseData.contentRows,
  }),
  imagesJson: json({
    generatedAt,
    recordCount: databaseData.imageRows.length,
    images: databaseData.imageRows,
  }),
  priceHistoryJson: json({
    generatedAt,
    recordCount: databaseData.priceHistoryRows.length,
    rows: databaseData.priceHistoryRows,
  }),
  partnersJson: json({
    generatedAt,
    partnerCount: partners.length,
    partners,
  }),
  propertiesJson: json({
    generatedAt,
    propertyCount: propertyData.properties.length,
    allowedStatusNames: Array.from(allowedStatusNames),
    properties: propertyData.properties,
    brokers: propertyData.brokers,
  }),
  textSnippetsJson: json({
    generatedAt,
    snippets: [],
  }),
}

const combinedJson = Object.values(payloads).join('')
const checksum = sha256(combinedJson)
const previousActive = previousActiveSnapshot(snapshotRoots[0])
const manifest = {
  id: snapshotId,
  version: snapshotId,
  createdAt: generatedAt,
  publishedAt: validation.ok ? generatedAt : null,
  checksum,
  validationStatus: validation.ok ? 'valid' : 'invalid',
  validation: {
    ok: validation.ok,
    errors: validation.errors,
    warnings: validation.warnings,
  },
  sources: {
    market: 'data/market/runtime/leadgen_market_data.json',
    locations: 'data/market/runtime/website_locations.json',
    seo_content: process.env.DATABASE_URL ? 'neon_snapshot_at_sync_time' : 'none',
    partners: existsSync(localInsidePartnersPath) ? 'inside/public/storage/partners/public.json' : 'feed_or_empty',
    properties: propertyData.fetched ? 'propstack_snapshot_at_sync_time' : 'unavailable',
  },
  files: {
    leadgen_market_data: 'leadgen_market_data.json',
    website_locations: 'website_locations.json',
    seo_location_content: 'seo_location_content.json',
    seo_location_images: 'seo_location_images.json',
    price_history: 'price_history.json',
    partners: 'partners.json',
    properties: 'properties.json',
    text_snippets: 'text_snippets.json',
  },
  counts: validation.counts,
  published: validation.ok,
  fallbackSnapshotId: previousActive,
}
const active = {
  activeSnapshotId: snapshotId,
  fallbackSnapshotId: previousActive,
  publishedAt: generatedAt,
  checksum,
}

if (!validation.ok) {
  const rejectedRoot = path.join(snapshotRoots[0], 'rejected', snapshotId)
  atomicWrite(path.join(rejectedRoot, 'manifest.json'), json(manifest))
  console.error(`Website-Snapshot abgelehnt: ${validation.errors.join(' ')}`)
  process.exit(1)
}

if (hasArg('dry-run')) {
  console.log('Website-Snapshot geprueft. Es wurden keine Dateien geschrieben.')
  console.log(`Version: ${snapshotId}`)
  console.log(`Checksumme: ${checksum}`)
  console.log(JSON.stringify(validation.counts, null, 2))
  process.exit(0)
}

writeSnapshot({snapshotId, payloads, manifest, active})

console.log('Website-Snapshot synchronisiert.')
console.log(`Version: ${snapshotId}`)
console.log(`Checksumme: ${checksum}`)
console.log(`Fallback: ${previousActive || 'keiner'}`)
console.log(`Marktdatensaetze: ${validation.counts.market_records}`)
console.log(`Website-Orte: ${validation.counts.website_locations}`)
console.log(`Partner: ${validation.counts.partners}`)
console.log(`Immobilien: ${validation.counts.properties}`)
