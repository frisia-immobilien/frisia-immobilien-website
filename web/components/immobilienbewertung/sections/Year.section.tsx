'use client'

import Image from 'next/image'
import {useEffect, useRef, useState} from 'react'

type Props = {
  value?: {yearBuilt?: number}
  onChange: (v: {yearBuilt?: number}) => void
  onNext?: () => void
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function Step05YearSection({value, onChange}: Props) {
  const ABS_MIN_YEAR = 1600 // technische Untergrenze (Altbau möglich)
  const SLIDER_MIN_YEAR = 1900 // Slider startet bei 1900 (wie gewünscht)
  const MAX_YEAR = new Date().getFullYear()

  const initial =
    typeof value?.yearBuilt === 'number' && value.yearBuilt > 0
      ? clamp(value.yearBuilt, ABS_MIN_YEAR, MAX_YEAR)
      : 1998

  // ✅ frei tippbar (String), Validierung erst onBlur
  const [yearInput, setYearInput] = useState<string>(String(initial))
  const [yearBuilt, setYearBuilt] = useState<number>(initial)

  // ✅ Slider zeigt immer mindestens 1900 – auch wenn Eingabe < 1900 ist
  const sliderValue = Math.max(yearBuilt, SLIDER_MIN_YEAR)

  // ✅ onChange stabilisieren
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // ✅ nur senden, wenn sich Wert wirklich geändert hat
  const lastSentRef = useRef<{yearBuilt: number} | null>(null)
  useEffect(() => {
    const next = {yearBuilt}
    const last = lastSentRef.current
    if (last && last.yearBuilt === next.yearBuilt) return
    lastSentRef.current = next
    onChangeRef.current(next)
  }, [yearBuilt])

  return (
    <div itemScope itemType="https://schema.org/Service">
      {/* Schema / SEO / GEO */}
      <meta itemProp="serviceType" content="Immobilienbewertung" />
      <meta itemProp="areaServed" content="Aurich und Ostfriesland" />
      <meta itemProp="provider" content="Frisia Immobilien" />

      {/* Standard-Überschriftenblock */}
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Baujahr
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Wann wurde die Immobilie gebaut?
      </p>

      {/* Card – links Slider+Eingabe, rechts Bild */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid items-start gap-8 md:grid-cols-[1fr_256px]">
          {/* LEFT */}
          <div>
            <label className="block text-sm text-slate-700">* Baujahr</label>

            <div className="mt-4">
              <input
                type="range"
                min={SLIDER_MIN_YEAR}
                max={MAX_YEAR}
                step={1}
                value={sliderValue}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setYearBuilt(v)
                  setYearInput(String(v))
                }}
                aria-label="Baujahr Regler"
                className="w-full accent-brand-navy"
              />

              {/* Skala wie Vorlage: links "< 1900", rechts aktuelles Jahr */}
              <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                <span>&lt; {SLIDER_MIN_YEAR}</span>
                <span>{MAX_YEAR}</span>
              </div>

              {/* Eingabe (frei), keine Rundung, clamp nur onBlur */}
              <div className="mt-3">
                <div className="relative w-full">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={ABS_MIN_YEAR}
                    max={MAX_YEAR}
                    step={1}
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    onBlur={() => {
                      const v = Number(yearInput)
                      if (!Number.isFinite(v)) {
                        setYearInput(String(yearBuilt))
                        return
                      }
                      const clamped = clamp(v, ABS_MIN_YEAR, MAX_YEAR)
                      setYearBuilt(clamped)
                      setYearInput(String(clamped))
                    }}
                    aria-label="Baujahr Eingabefeld"
                    className="
                      w-full rounded-xl
                      border border-slate-300
                      px-4 py-3
                      text-lg text-slate-900
                      placeholder:text-slate-400
                      focus:border-slate-900
                      focus:outline-none
                      focus:ring-2
                      focus:ring-slate-900/20
                    "
                    placeholder="z. B. 1998"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Bild (256x256 wie bisher) */}
          <div className="flex w-[256px] items-start justify-end">
            <Image
              src="/immobilienbewertung/icons/baujahr.webp"
              alt="Baujahr der Immobilie"
              width={256}
              height={256}
              sizes="256px"
              className="h-auto w-[256px] object-contain"
              priority={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
