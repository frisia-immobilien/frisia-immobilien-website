'use client'

import {type FormEvent, useEffect, useMemo, useRef, useState} from 'react'

import {PHONE_DISPLAY, PHONE_HREF} from '@/lib/site'

type Props = {
  value?: LocationValue
  onChange: (v: LocationValue) => void
  onNext?: () => void
  context?: LocationContext
}

type RegionHint = 'aurich' | 'ostfriesland' | 'other'

type LocationValue = {
  postalCode?: string
  city?: string
  district?: string
  street?: string
  houseNumber?: string
  regionHint?: RegionHint
  lat?: number
  lon?: number
  canProceed?: boolean
}

type LocationContext = {
  selectedType?: string
  setCanProceed?: (value: boolean) => void
}

type MarketCoverageState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  key?: string
  covered?: boolean
  regionHint?: RegionHint
  locationLabel?: string | null
}

const EAST_FRISIA_CITIES = [
  'Aurich',
  'Emden',
  'Leer',
  'Norden',
  'Wittmund',
  'Esens',
  'Jever',
  'Weener',
  'Papenburg',
  'Ihlow',
  'Südbrookmerland',
  'Wiesmoor',
  'Großefehn',
  'Großheide',
  'Krummhörn',
  'Hinte',
  'Dornum',
  'Hage',
  'Brookmerland',
  'Marienhafe',
  'Moormerland',
  'Uplengen',
  'Hesel',
  'Bunde',
  'Jemgum',
  'Rhauderfehn',
  'Ostrhauderfehn',
  'Westoverledingen',
  'Friedeburg',
]

// Zentrale Ausgangsposition für die Regionskarte (ohne Objektmarkierung)
const REGION_MAP_CENTER = {
  lat: 53.47,
  lon: 7.48,
  zoom: 4,
}
const MAP_TILE_SIZE = 256
const MAP_VIEW_WIDTH = 620
const MAP_VIEW_HEIGHT = 320

function normalize(v: unknown) {
  return String(v ?? '').trim()
}

function isGermanPlz(plz: string) {
  return /^\d{5}$/.test(normalize(plz))
}

function isLikelyAurichCity(city: string) {
  return normalizeCityKey(city) === 'aurich'
}

function isLikelyEastFrisia(city: string) {
  const c = normalize(city)
  if (!c) return false
  const low = normalizeCityKey(c)
  return EAST_FRISIA_CITIES.some((x) => normalizeCityKey(x) === low)
}

function normalizeCityKey(value: string) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

function normalizePlaceName(v: string) {
  return String(v ?? '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isSamePlace(inputCity: string, geoCity?: string) {
  if (!geoCity) return false
  const a = normalizePlaceName(inputCity)
  const b = normalizePlaceName(geoCity)
  return a === b || a.includes(b) || b.includes(a)
}

function clampLatitude(lat: number) {
  return Math.max(-85.05112878, Math.min(85.05112878, lat))
}

function makeOsmTiles(lat: number, lon: number, zoom: number) {
  const z = Math.max(1, Math.min(18, Math.round(zoom)))
  const scale = 2 ** z
  const safeLat = clampLatitude(lat)
  const xFloat = ((lon + 180) / 360) * scale
  const latRad = (safeLat * Math.PI) / 180
  const yFloat =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale
  const centerPxX = xFloat * MAP_TILE_SIZE
  const centerPxY = yFloat * MAP_TILE_SIZE
  const leftPx = centerPxX - MAP_VIEW_WIDTH / 2
  const topPx = centerPxY - MAP_VIEW_HEIGHT / 2
  const startX = Math.floor(leftPx / MAP_TILE_SIZE)
  const endX = Math.floor((leftPx + MAP_VIEW_WIDTH) / MAP_TILE_SIZE)
  const startY = Math.floor(topPx / MAP_TILE_SIZE)
  const endY = Math.floor((topPx + MAP_VIEW_HEIGHT) / MAP_TILE_SIZE)
  const tiles: Array<{
    key: string
    src: string
    left: number
    top: number
  }> = []

  for (let x = startX; x <= endX; x += 1) {
    const wrappedX = ((x % scale) + scale) % scale
    for (let y = startY; y <= endY; y += 1) {
      if (y < 0 || y >= scale) continue
      tiles.push({
        key: `${z}-${wrappedX}-${y}`,
        src: `https://tile.openstreetmap.org/${z}/${wrappedX}/${y}.png`,
        left: Math.round(x * MAP_TILE_SIZE - leftPx),
        top: Math.round(y * MAP_TILE_SIZE - topPx),
      })
    }
  }

  return tiles
}

// Fallback: Ortsteil aus Label ableiten, falls API keinen district liefert
function inferDistrictFromLabel(
  label?: string,
  city?: string,
  postalCode?: string,
  street?: string,
) {
  const l = normalize(label)
  if (!l) return ''

  const parts = l
    .split(',')
    .map((p) => normalize(p))
    .filter(Boolean)

  const c = normalize(city).toLowerCase()
  const pc = normalize(postalCode)
  const st = normalize(street).toLowerCase()

  const candidates = parts.filter((p) => {
    const low = p.toLowerCase()
    if (pc && low.includes(pc)) return false
    if (c && low.includes(c)) return false
    if (st && low.includes(st)) return false
    if (low === 'deutschland' || low === 'germany' || low.includes('niedersachsen')) return false
    return true
  })

  return candidates[0] || ''
}

type Suggestion = {
  label: string
  street: string
  houseNumber?: string
  postalCode?: string
  city?: string
  district?: string
  lat: number
  lon: number
}

export default function Step09LocationSection({value, onChange, context}: Props) {
  const [postalCode, setPostalCode] = useState<string>(String(value?.postalCode ?? ''))
  const [city, setCity] = useState<string>(String(value?.city ?? 'Aurich'))
  const [district, setDistrict] = useState<string>(String(value?.district ?? ''))
  const [street, setStreet] = useState<string>(String(value?.street ?? ''))
  const [houseNumber, setHouseNumber] = useState<string>(String(value?.houseNumber ?? ''))
  const [lat, setLat] = useState<number | undefined>(
    typeof value?.lat === 'number' ? value!.lat : undefined,
  )
  const [lon, setLon] = useState<number | undefined>(
    typeof value?.lon === 'number' ? value!.lon : undefined,
  )

  const [touched, setTouched] = useState<{
    plz?: boolean
    city?: boolean
    street?: boolean
    nr?: boolean
  }>({})

  // Dropdown / Fetch State
  const [streetFocused, setStreetFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string>('')
  const [items, setItems] = useState<Suggestion[]>([])

  // Karte / Feedback
  const [mapLoading, setMapLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const nrInputRef = useRef<HTMLInputElement | null>(null)
  const focusNrAfterSelectRef = useRef(false)

  // verhindert, dass das Dropdown direkt nach einer programmgesteuerten Auswahl erneut öffnet
  const suppressNextOpenRef = useRef(false)

  const addrAbortRef = useRef<AbortController | null>(null)
  const addrDebounceRef = useRef<number | null>(null)
  const coverageAbortRef = useRef<AbortController | null>(null)

  const lastGeocodedKeyRef = useRef<string>('')
  const [marketCoverage, setMarketCoverage] = useState<MarketCoverageState>({status: 'idle'})

  const localRegionHint = useMemo<RegionHint>(() => {
    const c = normalize(city)
    if (isLikelyAurichCity(c)) return 'aurich'
    if (isLikelyEastFrisia(c)) return 'ostfriesland'
    return c ? 'other' : 'aurich'
  }, [city])

  const plzOk = isGermanPlz(postalCode)
  const cityOk = normalize(city).length >= 2
  const streetOk = normalize(street).length >= 2
  const nrOk = normalize(houseNumber).length >= 1

  // Adresse vollständig erfasst: erst dann Ortsteilhinweis und Detailkarte nutzen
  const hasCapturedAddress = plzOk && cityOk && streetOk && nrOk

  const coverageKey = useMemo(() => {
    if (!hasCapturedAddress) return ''
    return [
      normalize(postalCode),
      normalize(city).toLowerCase(),
      normalize(district).toLowerCase(),
      normalize(street).toLowerCase(),
      normalize(houseNumber).toLowerCase(),
      normalize(context?.selectedType).toLowerCase(),
    ].join('|')
  }, [city, context?.selectedType, district, hasCapturedAddress, houseNumber, postalCode, street])

  const coverageMatches = marketCoverage.key === coverageKey
  const coverageStatus = hasCapturedAddress
    ? coverageMatches
      ? marketCoverage.status
      : 'loading'
    : 'idle'
  const regionHint =
    coverageMatches && marketCoverage.status === 'ready' && marketCoverage.regionHint
      ? marketCoverage.regionHint
      : localRegionHint

  // Weiter nur, wenn die Adresse in der Marktdatenbank abgedeckt ist.
  const canProceed =
    hasCapturedAddress &&
    coverageMatches &&
    marketCoverage.status === 'ready' &&
    marketCoverage.covered === true

  // Wizard-Integration: wenn eine API angeboten wird, den Status "Weiter" darüber steuern
  useEffect(() => {
    if (context && typeof context.setCanProceed === 'function') {
      context.setCanProceed(canProceed)
    }
  }, [context, canProceed])

  useEffect(() => {
    onChange({
      postalCode: normalize(postalCode),
      city: normalize(city),
      district: normalize(district),
      street: normalize(street),
      houseNumber: normalize(houseNumber),
      regionHint,
      lat,
      lon,
      canProceed,
    })
  }, [postalCode, city, district, street, houseNumber, regionHint, lat, lon, canProceed, onChange])

  useEffect(() => {
    if (!hasCapturedAddress || !coverageKey) {
      if (coverageAbortRef.current) coverageAbortRef.current.abort()
      setMarketCoverage({status: 'idle'})
      return
    }

    if (coverageAbortRef.current) coverageAbortRef.current.abort()
    const ac = new AbortController()
    coverageAbortRef.current = ac

    setMarketCoverage((current) =>
      current.key === coverageKey && current.status === 'ready'
        ? current
        : {status: 'loading', key: coverageKey},
    )

    async function runCoverageCheck() {
      try {
        const params = new URLSearchParams({
          city: normalize(city),
          district: normalize(district),
          postalCode: normalize(postalCode),
          propertyType: normalize(context?.selectedType),
        })
        const response = await fetch(`/api/market/coverage?${params.toString()}`, {
          signal: ac.signal,
        })
        const data = (await response.json().catch(() => ({}))) as {
          success?: boolean
          covered?: boolean
          regionHint?: RegionHint
          locationLabel?: string | null
        }

        if (!response.ok || data.success !== true) {
          throw new Error('Kerngebiet konnte nicht geprüft werden.')
        }

        setMarketCoverage({
          status: 'ready',
          key: coverageKey,
          covered: data.covered === true,
          regionHint: data.regionHint ?? 'other',
          locationLabel: data.locationLabel ?? null,
        })
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        setMarketCoverage({
          status: 'error',
          key: coverageKey,
          covered: false,
          regionHint: 'other',
          locationLabel: null,
        })
      }
    }

    void runCoverageCheck()

    return () => {
      ac.abort()
    }
  }, [city, context?.selectedType, coverageKey, district, hasCapturedAddress, postalCode])

  function selectItem(it: Suggestion) {
    suppressNextOpenRef.current = true
    focusNrAfterSelectRef.current = true
    setStreet(it.street || street)
    setHouseNumber(it.houseNumber || houseNumber)
    if (it.postalCode) setPostalCode(it.postalCode)
    if (it.city) setCity(it.city)

    const d =
      normalize(it.district) ||
      inferDistrictFromLabel(
        it.label,
        it.city ?? city,
        it.postalCode ?? postalCode,
        it.street ?? street,
      )
    if (d) setDistrict(d)

    setLat(it.lat)
    setLon(it.lon)

    setItems([])
    setErr('')
    setOpen(false)
    setStreetFocused(false)
    // Nach erfolgreicher Übernahme direkt zur Hausnummer springen
    window.setTimeout(() => {
      nrInputRef.current?.focus()
    }, 0)

    const key = `${normalize(it.postalCode ?? postalCode)}|${normalize(it.city ?? city)}|${normalize(it.street ?? street)}|${normalize(
      it.houseNumber ?? houseNumber,
    )}`
    lastGeocodedKeyRef.current = key
    window.setTimeout(() => {
      suppressNextOpenRef.current = false
    }, 250)
  }

  // Sobald sich die Adresse ändert, Koordinaten und Ortsteil ggf. zurücksetzen
  useEffect(() => {
    const key = `${normalize(postalCode)}|${normalize(city)}|${normalize(street)}|${normalize(houseNumber)}`
    if (!key.trim()) return

    if (
      lastGeocodedKeyRef.current &&
      key !== lastGeocodedKeyRef.current &&
      (lat !== undefined || lon !== undefined)
    ) {
      setLat(undefined)
      setLon(undefined)
    }

    if (lastGeocodedKeyRef.current && key !== lastGeocodedKeyRef.current && normalize(district)) {
      setDistrict('')
    }
  }, [postalCode, city, street, houseNumber, lat, lon, district])

  useEffect(() => {
    if (!focusNrAfterSelectRef.current) return

    // Fokus erst setzen, wenn React alle State-Updates gerendert hat
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        nrInputRef.current?.focus()
        focusNrAfterSelectRef.current = false
      })
      cancelAnimationFrame(raf2)
    })

    return () => cancelAnimationFrame(raf1)
  }, [street, city, postalCode])

  // Autocomplete (debounced)
  useEffect(() => {
    const q = normalize(street)

    if (q.length < 3) {
      setItems([])
      setErr('')
      setLoading(false)
      if (streetFocused && !suppressNextOpenRef.current) setOpen(true)

      setOpen(false)
      if (abortRef.current) abortRef.current.abort()
      return
    }

    if (streetFocused && !suppressNextOpenRef.current) setOpen(true)

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      try {
        setErr('')
        setLoading(true)
        if (streetFocused && !suppressNextOpenRef.current) setOpen(true)

        if (abortRef.current) abortRef.current.abort()
        const ac = new AbortController()
        abortRef.current = ac

        const params = new URLSearchParams({
          q,
          postalCode: normalize(postalCode),
          city: normalize(city),
          limit: '6',
        })

        const r = await fetch(`/api/geocode?${params.toString()}`, {signal: ac.signal})
        const data = await r.json()

        const res: Suggestion[] = Array.isArray(data?.results) ? data.results : []
        setItems(res)

        if (streetFocused) setOpen(true)
      } catch {
        setItems([])
        setErr('Suche fehlgeschlagen.')
        if (streetFocused) setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 320)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [street, postalCode, city, streetFocused])

  // Geocode für Kartenvorschau + Ortsteil automatisch setzen
  useEffect(() => {
    if (!hasCapturedAddress) {
      setMapLoading(false)
      if (addrAbortRef.current) addrAbortRef.current.abort()
      return
    }

    if (typeof lat === 'number' && typeof lon === 'number') {
      setMapLoading(false)
      return
    }

    const key = `${normalize(postalCode)}|${normalize(city)}|${normalize(street)}|${normalize(houseNumber)}`
    if (key === lastGeocodedKeyRef.current) return

    if (addrDebounceRef.current) window.clearTimeout(addrDebounceRef.current)
    addrDebounceRef.current = window.setTimeout(async () => {
      try {
        setMapLoading(true)

        if (addrAbortRef.current) addrAbortRef.current.abort()
        const ac = new AbortController()
        addrAbortRef.current = ac

        const q = `${normalize(street)} ${normalize(houseNumber)}`.trim()

        const params = new URLSearchParams({
          q,
          street: normalize(street),
          houseNumber: normalize(houseNumber),
          postalCode: normalize(postalCode),
          city: normalize(city),
          limit: '1',
        })

        const r = await fetch(`/api/geocode?${params.toString()}`, {signal: ac.signal})
        const data = await r.json()
        const res: Suggestion[] = Array.isArray(data?.results) ? data.results : []

        const first = res[0]

        if (
          first &&
          Number.isFinite(first.lat) &&
          Number.isFinite(first.lon) &&
          isSamePlace(city, first.city)
        ) {
          setLat(first.lat)
          setLon(first.lon)
          lastGeocodedKeyRef.current = key

          const d =
            normalize(first.district) ||
            inferDistrictFromLabel(first.label, first.city ?? city, postalCode, street)
          if (d) setDistrict(d)
        }
      } catch {
      } finally {
        setMapLoading(false)
      }
    }, 500)

    return () => {
      if (addrDebounceRef.current) window.clearTimeout(addrDebounceRef.current)
    }
  }, [hasCapturedAddress, postalCode, city, street, houseNumber, lat, lon])

  // Kartendarstellung:
  // - Regionsansicht ohne Marker
  // - Detailansicht mit Marker + gleichem Zoom-Verhalten wie beim Bild
  const mapPreview = useMemo(() => {
    // Regionsansicht: keine Koordinaten → ohne Markierung
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return {
        lat: REGION_MAP_CENTER.lat,
        lon: REGION_MAP_CENTER.lon,
        zoom: REGION_MAP_CENTER.zoom,
        marker: false,
      }
    }

    // Detailansicht: Koordinaten vorhanden → Zoom abhängig von Hausnummer
    const zoom = normalize(houseNumber) ? 17 : 15
    return {lat, lon, zoom, marker: true}
  }, [lat, lon, houseNumber])

  const showPlzError = touched.plz && !!normalize(postalCode) && !plzOk
  const showCityError = touched.city && !!normalize(city) && !cityOk
  const showStreetError = touched.street && !!normalize(street) && !streetOk
  const showNrError = touched.nr && !!normalize(houseNumber) && !nrOk

  const isLand = context?.selectedType === 'land'
  const headline = isLand ? 'Die Lage des Grundstücks' : 'Die Lage der Immobilie'
  const subline = isLand ? 'Wo befindet sich das Grundstück?' : 'Wo befindet sich die Immobilie?'
  const addressLabel = [
    [normalize(street), normalize(houseNumber)].filter(Boolean).join(' '),
    [normalize(postalCode), normalize(city)].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div>
      <div className="text-left">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
          Wie viel ist meine Immobilie wert?
        </div>
        <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
          {headline}
        </h2>
        <p
          className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite"
          itemProp="description"
        >
          {subline}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 p-6 sm:p-8">
        {/* LEFT */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-5">
            {/* Straße + Dropdown */}
            <div className="sm:col-span-4">
              <label className="block text-sm font-semibold text-slate-600">
                <span className="text-slate-500">*</span> Straße
              </label>

              {/* Input + Dropdown als Einheit (Dropdown sitzt direkt am Feld) */}
              <div className="relative">
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (items.length > 0) {
                        e.preventDefault()
                        selectItem(items[0])
                        return
                      }
                      if (loading) {
                        e.preventDefault()
                        return
                      }
                      if (normalize(street).length >= 3) {
                        e.preventDefault()
                        setOpen(true)
                      }
                    }
                  }}
                  onBlur={() => {
                    setTouched((p) => ({...p, street: true}))
                    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
                    closeTimerRef.current = window.setTimeout(() => {
                      setStreetFocused(false)
                      setOpen(false)
                    }, 140)
                  }}
                  onFocus={() => {
                    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
                    setStreetFocused(true)
                    if (normalize(street).length >= 3) setOpen(true)
                  }}
                  className={[
                    'mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base sm:text-lg',
                    'focus:outline-none focus:ring-2 focus:ring-brand-navy/25',
                    showStreetError ? 'border-red-300' : 'border-slate-200',
                  ].join(' ')}
                  placeholder="z.B. Oldersumer Straße"
                  autoComplete="off"
                />

                {open && normalize(street).length >= 3 ? (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                    {loading ? (
                      <div className="px-4 py-3 text-sm text-slate-500">Suche…</div>
                    ) : err ? (
                      <div className="px-4 py-3 text-sm text-slate-500">{err}</div>
                    ) : items.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-500">Keine Vorschläge.</div>
                    ) : (
                      <ul className="max-h-64 overflow-auto">
                        {items.map((it, idx) => (
                          <li key={`${it.label}-${idx}`}>
                            <button
                              type="button"
                              onPointerDown={(e) => e.preventDefault()}
                              onClick={() => selectItem(it)}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
                            >
                              <div className="font-medium text-slate-900">{it.label}</div>
                              {normalize(it.district) ? (
                                <div className="mt-0.5 text-xs text-slate-500">
                                  Ortsteil: {it.district}
                                </div>
                              ) : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Kurzer Hinweis zur Auswahlqualität */}
              <div className="mt-1 text-xs text-slate-500 sm:mb-5">
                Straßenvorschläge werden automatisch mit PLZ und Ort abgeglichen.
              </div>

              {showStreetError ? (
                <div className="mt-2 text-sm text-slate-500">Bitte Straße eingeben.</div>
              ) : null}
            </div>

            {/* Nr. */}
            <div className="sm:col-span-2 mb-5">
              <label className="block text-sm font-semibold text-slate-600">
                <span className="text-slate-500">*</span> Nr.
              </label>
              <input
                ref={nrInputRef}
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                onBlur={() => setTouched((p) => ({...p, nr: true}))}
                className={[
                  'mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base sm:text-lg',
                  'focus:outline-none focus:ring-2 focus:ring-brand-navy/25',
                  showNrError ? 'border-red-300' : 'border-slate-200',
                ].join(' ')}
                placeholder="z.B. 150"
              />
              {showNrError ? (
                <div className="mt-2 text-sm text-slate-500">Bitte Hausnummer eingeben.</div>
              ) : null}
            </div>
          </div>

          {/* PLZ + Ort (eine Zeile ab sm, PLZ fixe Breite) */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-5">
            {/* PLZ */}
            <div>
              <label className="block text-sm font-semibold text-slate-600">
                <span className="text-slate-500">*</span> PLZ
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                onBlur={() => setTouched((p) => ({...p, plz: true}))}
                className={[
                  'mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base sm:text-lg',
                  'focus:outline-none focus:ring-2 focus:ring-brand-navy/25',
                  showPlzError ? 'border-red-300' : 'border-slate-200',
                ].join(' ')}
                placeholder="26605"
              />
              {showPlzError ? (
                <div className="mt-2 text-sm text-slate-500">Bitte 5-stellige PLZ eingeben.</div>
              ) : null}
            </div>

            {/* Ort */}
            <div>
              <label className="block text-sm font-semibold text-slate-600">
                <span className="text-slate-500">*</span> Ort
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onBlur={() => setTouched((p) => ({...p, city: true}))}
                className={[
                  'mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base sm:text-lg',
                  'focus:outline-none focus:ring-2 focus:ring-brand-navy/25',
                  showCityError ? 'border-red-300' : 'border-slate-200',
                ].join(' ')}
                placeholder="Aurich"
              />
            </div>
          </div>

          <div className="mt-10 max-w-xl text-sm text-slate-600">
            <div className="font-semibold text-slate-700">
              Die vollständige Adresse ist entscheidend.
            </div>
            <div className="mt-1">
              Selbst innerhalb einer Straße können die Quadratmeterpreise stark voneinander
              abweichen.
            </div>
          </div>

          {/* Badge erst nach erfasster Adresse */}
          {hasCapturedAddress ? (
            <RegionHintBadge
              regionHint={regionHint}
              coverageStatus={coverageStatus}
              district={district}
              address={addressLabel}
              city={city}
              marketLocationLabel={
                coverageMatches && marketCoverage.status === 'ready'
                  ? marketCoverage.locationLabel
                  : null
              }
            />
          ) : null}
        </div>

        {/* RIGHT – Karte */}
        <div className="flex flex-col gap-4">
          <OsmTilePreview
            lat={mapPreview.lat}
            lon={mapPreview.lon}
            zoom={mapPreview.zoom}
            marker={mapPreview.marker}
            loading={mapLoading}
          />

          {/* Hinweis nur, solange noch keine vollständige Adresse erfasst wurde */}
          {!hasCapturedAddress ? (
            <div className="text-xs text-slate-500">
              Übersichtskarte – Markierung erscheint nach Eingabe der vollständigen Adresse.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function OsmTilePreview({
  lat,
  lon,
  zoom,
  marker,
  loading,
}: {
  lat: number
  lon: number
  zoom: number
  marker: boolean
  loading: boolean
}) {
  const tiles = useMemo(() => makeOsmTiles(lat, lon, zoom), [lat, lon, zoom])

  return (
    <div className="relative h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="absolute left-1/2 top-1/2 h-[320px] w-[620px] -translate-x-1/2 -translate-y-1/2 bg-[#dce7ef]"
        aria-label="Kartenvorschau"
        role="img"
      >
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            className="absolute h-[256px] w-[256px] select-none"
            style={{left: tile.left, top: tile.top}}
          />
        ))}
      </div>

      {marker ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-full"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-1 h-8 w-8 -translate-x-1/2 rotate-45 rounded-full rounded-br-sm border border-[#5c8e2f] bg-[#76b943] shadow-[0_3px_10px_rgba(15,23,42,0.35)]" />
          <div className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full border border-[#5c8e2f] bg-white" />
        </div>
      ) : null}

      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[11px] leading-none text-slate-700 shadow-sm hover:text-slate-950"
      >
        © OpenStreetMap
      </a>

      {loading ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/65 backdrop-blur-[1px]">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            Karte wird geladen…
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RegionHintBadge({
  regionHint,
  coverageStatus,
  district,
  address,
  city,
  marketLocationLabel,
}: {
  regionHint: RegionHint
  coverageStatus: MarketCoverageState['status']
  district?: string
  address: string
  city?: string
  marketLocationLabel?: string | null
}) {
  const d = normalize(district)
  const locationLabel =
    normalize(marketLocationLabel) ||
    [d, normalize(city)].filter(Boolean).join(', ') ||
    'Immobilienbewertung'

  if (coverageStatus === 'loading') {
    return (
      <div className="mt-8 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-brand-graphite">
        Marktgebiet wird anhand der Marktdaten geprüft…
      </div>
    )
  }

  if (coverageStatus === 'error') {
    return (
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Das Marktgebiet konnte nicht automatisch geprüft werden.
            </div>
            <div className="mt-1 max-w-xl text-sm text-slate-600">
              Wir prüfen die Lage persönlich und melden uns mit einer klaren Einschätzung.
            </div>
          </div>

          <LocationCorrectionContactButton
            address={address}
            locationLabel={locationLabel}
            label="Kontakt aufnehmen"
            className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-brackish"
          />
        </div>
      </div>
    )
  }

  if (regionHint === 'aurich') {
    return (
      <div className="mt-8 inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-brand-graphite">
        <span>Erfasst als Aurich (Kernregion).</span>
        {d ? (
          <span className="text-slate-600">
            Ortsteil: <span className="font-semibold text-slate-800">{d}</span>
          </span>
        ) : (
          <span className="text-slate-500">Ortsteil wird automatisch ermittelt.</span>
        )}
        <LocationCorrectionContactButton address={address} locationLabel={locationLabel} />
      </div>
    )
  }

  if (regionHint === 'ostfriesland') {
    return (
      <div className="mt-8 inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-brand-graphite">
        <span>Erfasst als Ostfriesland (Kerngebiet).</span>
        {normalize(marketLocationLabel) ? (
          <span className="text-slate-600">
            Marktdaten: <span className="font-semibold text-slate-800">{marketLocationLabel}</span>
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Deine Immobilie befindet sich außerhalb unserer Kernregion:
          </div>
          <div className="mt-1 max-w-xl text-sm text-slate-600">
            Hier geht es nicht automatisch weiter. Es wird kurz persönlich geklärt, ob und wie eine
            Begleitung möglich ist – verbindlich und transparent.
          </div>
        </div>

        <LocationCorrectionContactButton
          address={address}
          locationLabel={locationLabel}
          label="Kontakt aufnehmen"
          className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-brackish"
        />
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Es folgt eine klare Einschätzung – ohne Umwege.
      </div>
    </div>
  )
}

function LocationCorrectionContactButton({
  address,
  locationLabel,
  label = 'Ortsteil stimmt nicht?',
  className = 'ml-1 underline text-slate-600 hover:text-slate-900',
}: {
  address: string
  locationLabel: string
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const response = await fetch('/api/lead/appointment', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          requestType: 'valuation_check',
          address,
          locationLabel,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone,
          email,
          originUrl: window.location.href,
        }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
      }

      if (!response.ok || result.success !== true) {
        throw new Error(result.error || 'Die Anfrage konnte gerade nicht gesendet werden.')
      }

      setStatus('done')
    } catch (requestError) {
      setStatus('error')
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Die Anfrage konnte gerade nicht gesendet werden.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[140] grid place-items-center bg-[color:var(--color-navy)]/70 px-4 py-6">
          <div className="w-full max-w-[620px] rounded-md bg-white p-5 text-[color:var(--color-navy)] shadow-[0_35px_110px_-50px_rgba(0,0,0,0.55)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Stimmen die Angaben nicht ganz?</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-graphite)]">
                  Wenn bei der Online-Bewertung etwas nicht passt, klären wir das persönlich – ruhig,
                  nachvollziehbar und verbindlich.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-2xl leading-none text-[color:var(--color-graphite)] hover:bg-[#f1f4f7]"
                aria-label="Formular schließen"
              >
                ×
              </button>
            </div>

            {status === 'done' ? (
              <div className="mt-6 rounded-md bg-[#eef3f8] p-5">
                <div className="text-base font-semibold text-[color:var(--color-navy)]">
                  Danke, deine Anfrage ist eingegangen.
                </div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-graphite)]">
                  Wir melden uns zeitnah bei dir und gehen die Bewertung gemeinsam durch.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 rounded-md bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)]"
                >
                  Schließen
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
                <p className="text-sm leading-7 text-[color:var(--color-graphite)]">
                  Gib einfach deine Kontaktdaten an. Wir melden uns zeitnah bei dir und gehen die
                  Bewertung gemeinsam durch.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold">
                    Vorname*
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="rounded-md border border-[color:var(--color-sand)] px-4 py-3 font-normal text-[color:var(--color-navy)] outline-none focus:border-[color:var(--color-brackish)]"
                      autoComplete="given-name"
                      required
                      maxLength={80}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Nachname*
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="rounded-md border border-[color:var(--color-sand)] px-4 py-3 font-normal text-[color:var(--color-navy)] outline-none focus:border-[color:var(--color-brackish)]"
                      autoComplete="family-name"
                      required
                      maxLength={80}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Telefonnummer*
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="rounded-md border border-[color:var(--color-sand)] px-4 py-3 font-normal text-[color:var(--color-navy)] outline-none focus:border-[color:var(--color-brackish)]"
                      autoComplete="tel"
                      required
                      maxLength={80}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    E-Mail-Adresse*
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="rounded-md border border-[color:var(--color-sand)] px-4 py-3 font-normal text-[color:var(--color-navy)] outline-none focus:border-[color:var(--color-brackish)]"
                      autoComplete="email"
                      type="email"
                      required
                      maxLength={180}
                    />
                  </label>
                </div>

                {error ? <p className="text-sm text-red-700">{error}</p> : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-[color:var(--color-navy)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)] disabled:opacity-70"
                >
                  {pending ? 'Wird gesendet ...' : 'Bewertung persönlich prüfen lassen'}
                </button>

                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[color:var(--color-graphite)]">
                  <span>✓ Unverbindlich</span>
                  <span>✓ Keine Verpflichtung</span>
                  <span>✓ Direkter Kontakt zu uns</span>
                </div>

                <div className="text-xs text-[color:var(--color-graphite)]">
                  Oder direkt anrufen:{' '}
                  <a href={PHONE_HREF} className="font-semibold text-[color:var(--color-navy)] underline">
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
