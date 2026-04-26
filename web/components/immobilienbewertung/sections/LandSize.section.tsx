'use client'

import Image from 'next/image'
import {useEffect, useMemo, useRef, useState} from 'react'

type Props = {
  value?: {landSize?: number}
  onChange: (v: {landSize?: number}) => void
  propertyType?: 'apartment' | 'house' | 'land' | 'commercial' | 'unknown' // ✅ neu
}

const SLIDER_MIN = 0
const SLIDER_MAX = 5000

function toInt(v: unknown) {
  const n = Number(String(v ?? '').replace(/[^\d]/g, ''))
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

export default function Step03LandSizeSection({value, onChange, propertyType}: Props) {
  const isApartment = propertyType === 'apartment'
  const initial = useMemo(() => {
    const v = toInt(value?.landSize)
    if (v > 0) return v
    return isApartment ? 0 : 500
  }, [isApartment, value?.landSize])

  const [inputValue, setInputValue] = useState<string>(String(initial))
  const landSize = useMemo(() => toInt(inputValue), [inputValue])

  const sliderValue = useMemo(() => Math.min(SLIDER_MAX, landSize), [landSize])

  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onChangeRef.current({landSize})
  }, [landSize])

  // ✅ Text-Logik: Wohnung = Gartenfrage, sonst Grundstück
  type GardenKnown = 'yes' | 'no'
  const initialGardenKnown: GardenKnown = isApartment
    ? toInt(value?.landSize) > 0
      ? 'yes'
      : 'no'
    : 'yes'
  const [gardenKnown, setGardenKnown] = useState<GardenKnown>(initialGardenKnown)

  const gardenDisabled = isApartment && gardenKnown === 'no'

  const headline = isApartment ? 'Gartenfläche' : 'Grundstücksfläche'

  const subline = isApartment ? (
    <>Falls deine Wohnung einen Garten hat: Wie groß ist dieser?</>
  ) : (
    <>Wie viel m² hat das Grundstück?</>
  )

  const label = isApartment ? '* Gartenfläche in m²' : '* Grundstücksfläche in m²'

  const placeholder = isApartment ? 'z.B. 80' : 'z.B. 600'

  const sliderAria = isApartment ? 'Gartenfläche Slider' : 'Grundstücksfläche Slider'

  const inputAria = isApartment ? 'Gartenfläche Eingabe' : 'Grundstücksfläche Eingabe'

  return (
    <div>
      {/* Standard-Überschriftenblock */}
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        {headline}
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        {subline}
      </p>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid items-start gap-8 md:grid-cols-[1fr_256px]">
          {/* LEFT: Slider + Input */}
          <div className="text-left">
            {isApartment ? (
              <div className="mb-5">
                <div className="text-sm font-semibold text-slate-700">
                  <span className="mr-2 text-slate-500"></span>
                  Hat die Wohnung einen Garten?
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Pill
                    active={gardenKnown === 'yes'}
                    onClick={() => setGardenKnown('yes')}
                    label="Ja"
                    ariaLabel="Ja, es gibt eine Gartenfläche"
                  />
                  <Pill
                    active={gardenKnown === 'no'}
                    onClick={() => {
                      setGardenKnown('no')
                      setInputValue('0')
                    }}
                    label="Nein"
                    ariaLabel="Nein, keine Gartenfläche vorhanden"
                  />
                </div>
              </div>
            ) : null}

            <label className="block text-sm text-slate-700">{label}</label>

            <div className={['mt-4', gardenDisabled ? 'opacity-50' : ''].join(' ')}>
              <input
                type="range"
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                value={gardenDisabled ? 0 : sliderValue}
                disabled={gardenDisabled}
                onChange={(e) => {
                  if (gardenDisabled) return
                  const v = toInt(e.target.value)
                  setInputValue(String(v))
                }}
                className="w-full accent-brand-navy"
                aria-label={sliderAria}
              />

              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span>{SLIDER_MIN}</span>
                <span>&gt; {SLIDER_MAX}</span>
              </div>
            </div>

            <div
              className={['mt-4 flex items-center gap-3', gardenDisabled ? 'opacity-50' : ''].join(
                ' ',
              )}
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  disabled={gardenDisabled}
                  onChange={(e) => setInputValue(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder={placeholder}
                  aria-label={inputAria}
                />
              </div>

            <div className="shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-brand-graphite">
              m²
            </div>
          </div>
        </div>
        {/* RIGHT: Icon */}
        <div className="flex w-[256px] items-start justify-end">
          <Image
            src="/immobilienbewertung/icons/grundstuecksflaeche.webp"
            alt="Angabe der Grundstücksfläche"
            width={256}
            height={256}
            sizes="256px"
            className="h-auto w-[256px] object-contain"
          />
        </div>
        </div>
      </div>
    </div>
  )
}

function Pill({
  active,
  onClick,
  label,
  ariaLabel,
}: {
  active: boolean
  onClick: () => void
  label: string
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={[
        'inline-flex min-w-[88px] items-center justify-center rounded-full px-6 py-3 text-base font-medium transition',
        active
          ? 'border border-[color:var(--color-navy)] bg-white text-slate-900 ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
          : 'border border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
