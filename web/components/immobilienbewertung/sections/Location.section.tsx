'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useEffect, useMemo, useRef, useState} from 'react'

type Props = {
  value?: LocationValue
  onChange: (v: LocationValue) => void
  onNext?: () => void
  context?: LocationContext
}

type LocationValue = {
  postalCode?: string
  city?: string
  district?: string
  street?: string
  houseNumber?: string
  regionHint?: 'aurich' | 'ostfriesland' | 'other'
  lat?: number
  lon?: number
  canProceed?: boolean
}

type LocationContext = {
  selectedType?: string
  setCanProceed?: (value: boolean) => void
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
]

// Zentrale Ausgangsposition für die Regionskarte (ohne Objektmarkierung)
const REGION_MAP_CENTER = {
  lat: 53.47,
  lon: 7.48,
  zoom: 4,
}

function normalize(v: unknown) {
  return String(v ?? '').trim()
}

function isGermanPlz(plz: string) {
  return /^\d{5}$/.test(normalize(plz))
}

function isLikelyAurichCity(city: string) {
  return normalize(city).toLowerCase() === 'aurich'
}

function isLikelyEastFrisia(city: string) {
  const c = normalize(city)
  if (!c) return false
  const low = c.toLowerCase()
  return EAST_FRISIA_CITIES.some((x) => x.toLowerCase() === low)
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

// Detailkarte: Adresse bekannt, Markierung aktiv
function makeProxyMapUrl(lat: number, lon: number, zoom: number) {
  const p = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    zoom: String(zoom),
    w: '620',
    h: '350',
  })
  return `/api/staticmap?${p.toString()}`
}

// Erstansicht: regionale Übersicht ohne Markierung
function makeProxyRegionMapUrl(lat: number, lon: number, zoom: number) {
  const p = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    zoom: String(zoom),
    w: '620',
    h: '350',
    nomarker: '1', // Markierung bewusst deaktiviert
  })
  return `/api/staticmap?${p.toString()}`
}

// Fallback (Einbettung) nur für den Fall, dass das Bild nicht geladen werden kann
function makeOsmEmbedUrl(lat: number, lon: number, zoom = 16, withMarker = true) {
  // Bounding-Box abhängig vom Zoom – gleichmäßig abgestuft
  // Bounding-Box abhängig vom Zoom – fein abgestuft, damit jede Stufe sichtbar anders wirkt
  // Bounding-Box abhängig vom Zoom
  // Oben fein (Detail), unten bewusst grob (Orientierung)
  const d =
    zoom >= 18
      ? 0.0025
      : zoom >= 17
        ? 0.0035
        : zoom >= 16
          ? 0.005
          : zoom >= 15
            ? 0.0075
            : zoom >= 14
              ? 0.011
              : zoom >= 13
                ? 0.015
                : zoom >= 12
                  ? 0.02
                  : zoom >= 11
                    ? 0.026
                    : zoom >= 10
                      ? 0.033
                      : zoom >= 9
                        ? 0.042
                        : zoom >= 8
                          ? 0.055
                          : zoom >= 7
                            ? 0.075
                            : zoom >= 6
                              ? 0.105
                              : zoom >= 5
                                ? 0.15
                                : zoom >= 4
                                  ? 0.21
                                  : zoom >= 3
                                    ? 0.3
                                    : zoom >= 2
                                      ? 0.42
                                      : 0.55

  const left = lon - d
  const right = lon + d
  const top = lat + d
  const bottom = lat - d

  const u = new URL('https://www.openstreetmap.org/export/embed.html')
  u.searchParams.set('bbox', `${left},${bottom},${right},${top}`)
  u.searchParams.set('layer', 'mapnik')

  // Marker nur dann setzen, wenn eine konkrete Adresse vorliegt
  if (withMarker) {
    u.searchParams.set('marker', `${lat},${lon}`)
  }

  return u.toString()
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
  const [mapImgError, setMapImgError] = useState(false)

  // Steuert den visuellen Übergang zwischen Regions- und Detailkarte
  const [mapVisible, setMapVisible] = useState(true)

  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const nrInputRef = useRef<HTMLInputElement | null>(null)
  const focusNrAfterSelectRef = useRef(false)

  // verhindert, dass das Dropdown direkt nach einer programmgesteuerten Auswahl erneut öffnet
  const suppressNextOpenRef = useRef(false)

  const addrAbortRef = useRef<AbortController | null>(null)
  const addrDebounceRef = useRef<number | null>(null)

  const lastGeocodedKeyRef = useRef<string>('')

  const regionHint = useMemo<'aurich' | 'ostfriesland' | 'other'>(() => {
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

  // Weiter nur innerhalb der Kernregion
  const canProceed = hasCapturedAddress && regionHint !== 'other'

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
  // - Initial: regionale Übersicht ohne Marker (solange keine Koordinaten vorhanden sind)
  // - Nach Adressauflösung: Detailansicht mit Marker
  // - Hausnummer vorhanden: stärkerer Detail-Zoom
  const mapUrl = useMemo(() => {
    // Regionsansicht: keine Koordinaten → Übersicht ohne Marker
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return makeProxyRegionMapUrl(
        REGION_MAP_CENTER.lat,
        REGION_MAP_CENTER.lon,
        REGION_MAP_CENTER.zoom,
      )
    }

    // Detailansicht: Koordinaten vorhanden → Zoom abhängig von Hausnummer
    const zoom = normalize(houseNumber) ? 20 : 15
    return makeProxyMapUrl(lat, lon, zoom)
  }, [lat, lon, houseNumber])

  // Fallback (Einbettung), falls das Bild nicht geladen werden kann:
  // - Regionsansicht ohne Marker
  // - Detailansicht mit Marker + gleichem Zoom-Verhalten wie beim Bild
  const mapEmbedUrl = useMemo(() => {
    // Regionsansicht: keine Koordinaten → ohne Markierung
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return makeOsmEmbedUrl(
        REGION_MAP_CENTER.lat,
        REGION_MAP_CENTER.lon,
        REGION_MAP_CENTER.zoom,
        false,
      )
    }

    // Detailansicht: Koordinaten vorhanden → Zoom abhängig von Hausnummer
    const zoom = normalize(houseNumber) ? 17 : 15
    return makeOsmEmbedUrl(lat, lon, zoom, true)
  }, [lat, lon, houseNumber])

  useEffect(() => {
    if (mapUrl) setMapImgError(false)
  }, [mapUrl])

  // Weicher Übergang bei Kartenwechsel (Region → Objekt)
  useEffect(() => {
    setMapVisible(false)
    const t = window.setTimeout(() => setMapVisible(true), 120)
    return () => window.clearTimeout(t)
  }, [mapUrl])

  const showPlzError = touched.plz && !!normalize(postalCode) && !plzOk
  const showCityError = touched.city && !!normalize(city) && !cityOk
  const showStreetError = touched.street && !!normalize(street) && !streetOk
  const showNrError = touched.nr && !!normalize(houseNumber) && !nrOk

  const isLand = context?.selectedType === 'land'
  const headline = isLand ? 'Die Lage des Grundstücks' : 'Die Lage der Immobilie'
  const subline = isLand ? 'Wo befindet sich das Grundstück?' : 'Wo befindet sich die Immobilie?'

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
            <RegionHintBadge regionHint={regionHint} district={district} />
          ) : null}
        </div>

        {/* RIGHT – Karte */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {mapUrl ? (
              mapImgError ? (
                <div className="h-[320px] w-full">
                  {mapEmbedUrl ? (
                    <iframe
                      title="Kartenvorschau"
                      src={mapEmbedUrl}
                      className="h-[320px] w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center bg-slate-50 px-6 text-center">
                      <div className="text-sm text-slate-500">
                        Kartenvorschau konnte nicht geladen werden.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Image
                  key={mapUrl}
                  src={mapUrl}
                  alt="Kartenvorschau"
                  width={620}
                  height={350}
                  unoptimized
                  className={[
                    'h-[320px] w-full object-cover transition-opacity duration-300',
                    mapVisible ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                  onError={() => setMapImgError(true)}
                />
              )
            ) : (
              <div className="flex h-[320px] items-center justify-center bg-slate-50 px-6 text-center">
                <div className="text-sm text-slate-500">
                  {mapLoading ? 'Karte wird geladen…' : 'Adresse eingeben, um die Karte zu sehen.'}
                </div>
              </div>
            )}
          </div>

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

function RegionHintBadge({
  regionHint,
  district,
}: {
  regionHint: 'aurich' | 'ostfriesland' | 'other'
  district?: string
}) {
  const d = normalize(district)

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
        <Link
          href="/kontakt#kontaktformular"
          className="ml-1 underline text-slate-600 hover:text-slate-900"
        >
          Ortsteil stimmt nicht?
        </Link>
      </div>
    )
  }

  if (regionHint === 'ostfriesland') {
    return (
      <div className="mt-8 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-brand-graphite">
        Erfasst als Ostfriesland (Region).
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

        <Link
          href="/kontakt#kontaktformular"
          className="inline-flex items-center justify-right rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-brackish transition"
        >
          Kontakt aufnehmen
        </Link>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Es folgt eine klare Einschätzung – ohne Umwege.
      </div>
    </div>
  )
}
