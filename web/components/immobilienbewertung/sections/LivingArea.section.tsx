'use client'

import Image from 'next/image'
import {useEffect, useMemo, useRef, useState} from 'react'

type LivingAreaValue = {livingArea?: number; rooms?: number}
type LivingAreaContext = {
  lead?: {
    step02HouseType?: {houseType?: string} | string
    step02_house_type?: {houseType?: string}
    houseType?: string
  }
}

type Props = {
  value?: LivingAreaValue
  onChange: (v: LivingAreaValue) => void
  onNext?: () => void
  context?: LivingAreaContext
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function Step03LivingAreaSection({value, onChange, context}: Props) {
  const MIN_AREA = 10
  const SLIDER_MAX = 400 // Slider-Ende
  const INPUT_MAX = 2000 // Freie Eingabe für MFH

  /* Mehrfamilienhaus-Erkennung */
  const isMultiFamily = useMemo(() => {
    const step02HouseType =
      typeof context?.lead?.step02HouseType === "string"
        ? context.lead.step02HouseType
        : context?.lead?.step02HouseType?.houseType

    const ht =
      step02HouseType ??
      context?.lead?.step02_house_type?.houseType ??
      context?.lead?.houseType
    return ht === 'multi_family'
  }, [context])

  const initialArea =
    typeof value?.livingArea === 'number' && value.livingArea > 0
      ? clamp(value.livingArea, MIN_AREA, INPUT_MAX)
      : 80

  const initialRooms = typeof value?.rooms === 'number' && value.rooms > 0 ? value.rooms : 1

  /* Wohnfläche: getrenntes State-Modell (Zahl + Text) */
  const [livingArea, setLivingArea] = useState<number>(initialArea)
  const [livingAreaInput, setLivingAreaInput] = useState<string>(String(initialArea))

  const [rooms, setRooms] = useState<number>(initialRooms)

  /* onChange stabilisieren */
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  /* nur echte Änderungen nach außen geben */
  const lastSentRef = useRef<{livingArea: number; rooms: number} | null>(null)
  useEffect(() => {
    const next = {livingArea, rooms}
    const last = lastSentRef.current
    if (last && last.livingArea === next.livingArea && last.rooms === next.rooms) return

    lastSentRef.current = next
    onChangeRef.current(next)
  }, [livingArea, rooms])

  const roomsLabel = isMultiFamily ? 'Anzahl Wohneinheiten' : 'Anzahl Zimmer'
  const areaLabel = isMultiFamily ? 'Wohnfläche (gesamt) in m²' : 'Wohnfläche in m²'

  const imageAlt = 'Angabe der Wohnfläche'

  return (
    <div itemScope itemType="https://schema.org/Service">
      <meta itemProp="serviceType" content="Immobilienbewertung" />
      <meta itemProp="areaServed" content="Aurich und Ostfriesland" />
      <meta itemProp="provider" content="Frisia Immobilien" />

      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Wohnfläche
      </h2>

      <div className="grid items-start gap-6 md:grid-cols-[1fr_256px]">
        {/* LEFT */}
        <div>
          <label className="block text-sm font-medium text-slate-700">{areaLabel}</label>

          <div className="mt-4">
            {/* Slider (max. 400 m²) */}
            <input
              type="range"
              min={MIN_AREA}
              max={SLIDER_MAX}
              step={1}
              value={Math.min(livingArea, SLIDER_MAX)}
              onChange={(e) => {
                const v = Number(e.target.value)
                setLivingArea(v)
                setLivingAreaInput(String(v))
              }}
              aria-label="Wohnfläche Regler"
              className="w-full accent-brand-navy"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{MIN_AREA} m²</span>
              <span>&lt; 400 m²</span>
            </div>

            {/* Freies Textfeld */}
            <div className="mt-3">
              <div className="relative w-full">
                <input
                  type="text"
                  inputMode="numeric"
                  value={livingAreaInput}
                  onChange={(e) => setLivingAreaInput(e.target.value)}
                  onBlur={() => {
                    const v = Number(livingAreaInput)
                    if (!Number.isFinite(v)) {
                      setLivingAreaInput(String(livingArea))
                      return
                    }
                    const clamped = clamp(v, MIN_AREA, INPUT_MAX)
                    setLivingArea(clamped)
                    setLivingAreaInput(String(clamped))
                  }}
                  aria-label="Wohnfläche in Quadratmetern"
                  className="
                    w-full rounded-xl
                    border border-slate-300
                    px-4 py-3 pr-16
                    text-lg text-slate-900
                    focus:border-slate-900
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-900/20
                  "
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  m²
                </span>
              </div>
            </div>
          </div>

          {/* Zimmer / Wohneinheiten */}
          <div className="mt-7">
            <label className="block text-sm font-medium text-slate-700">{roomsLabel}</label>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRooms((r) => Math.max(1, r - 1))}
                className="flex h-12 w-12 shrink-0 items-center justify-center !rounded-full border border-slate-200 bg-slate-100 p-0 text-xl text-slate-700"
              >
                <span className="block text-center leading-none">−</span>
              </button>

              <input
                type="number"
                min={1}
                value={rooms}
                onChange={(e) => setRooms(Math.max(1, Number(e.target.value || 1)))}
                className="
                  w-full rounded-xl
                  border border-slate-300
                  px-4 py-3
                  text-lg text-slate-900
                  focus:border-slate-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-slate-900/20
                "
              />

              <button
                type="button"
                onClick={() => setRooms((r) => r + 1)}
                className="flex h-12 w-12 shrink-0 items-center justify-center !rounded-full border border-slate-200 bg-slate-100 p-0 text-xl text-slate-700"
              >
                <span className="block text-center leading-none">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="mx-auto">
          <div className="relative h-[256px] w-[256px]">
            <Image
              src="/immobilienbewertung/icons/wohnflaeche.webp"
              alt={imageAlt}
              fill
              sizes="256px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
