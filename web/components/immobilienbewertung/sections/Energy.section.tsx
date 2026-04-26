'use client'

import Image from 'next/image'
import {useEffect, useMemo, useRef, useState} from 'react'

type Energy = 'unknown' | 'a_b' | 'c_d' | 'e_h' | 'no_data'
type Known = 'unknown' | 'yes' | 'no'
type EnergyValue = {energy?: Energy; energyClass?: string | null; energyKnown?: Known}

type Props = {
  value?: EnergyValue
  onChange: (v: EnergyValue) => void
  onNext?: () => void
}

const CLASS_OPTIONS = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const
type EnergyClass = (typeof CLASS_OPTIONS)[number]

function mapClassToBucket(c: EnergyClass): Exclude<Energy, 'unknown'> {
  if (c === 'A+' || c === 'A' || c === 'B') return 'a_b'
  if (c === 'C' || c === 'D') return 'c_d'
  return 'e_h' // E–H
}

export default function Step08EnergySection({value, onChange}: Props) {
  const initialKnown: Known =
    value?.energyKnown ??
    (value?.energy === 'no_data'
      ? 'no'
      : value?.energy && value.energy !== 'unknown'
        ? 'yes'
        : 'unknown')

  const initialClass = ((): EnergyClass | null => {
    const c = String(value?.energyClass ?? '')
      .toUpperCase()
      .trim()
    return (CLASS_OPTIONS as readonly string[]).includes(c) ? (c as EnergyClass) : null
  })()

  const [known, setKnown] = useState<Known>(initialKnown)
  const [energyClass, setEnergyClass] = useState<EnergyClass | null>(initialClass)

  const energyBucket: Energy = useMemo(() => {
    if (known === 'no') return 'no_data'
    if (known === 'yes') return energyClass ? mapClassToBucket(energyClass) : 'unknown'
    return 'unknown'
  }, [known, energyClass])

  // ✅ onChange stabil halten
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // ✅ nur senden, wenn sich Werte wirklich geändert haben
  const lastSentRef = useRef<{
    energyKnown: Known
    energyClass: string | null
    energy: Energy
  } | null>(null)
  useEffect(() => {
    const next = {energyKnown: known, energyClass: energyClass ?? null, energy: energyBucket}
    const last = lastSentRef.current
    if (
      last &&
      last.energyKnown === next.energyKnown &&
      last.energyClass === next.energyClass &&
      last.energy === next.energy
    )
      return

    lastSentRef.current = next
    onChangeRef.current(next)
  }, [known, energyClass, energyBucket])

  return (
    <div itemScope itemType="https://schema.org/Service">
      {/* Schema / SEO / GEO */}
      <meta itemProp="serviceType" content="Immobilienbewertung" />
      <meta itemProp="areaServed" content="Aurich und Ostfriesland" />
      <meta itemProp="provider" content="Frisia Immobilien" />

      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Energieklasse
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Wenn du es nicht weißt: „Nein“ wählen.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid items-start gap-6 md:grid-cols-[1fr_256px]">
          {/* LEFT */}
          <div>
            {/* Frage 1: Kennst du die Klasse? */}
            <div className="text-sm font-semibold text-slate-700">
              <span className="mr-2 text-slate-500">*</span>
              Kennst du die Energieklasse deiner Immobilie?
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <Pill
                active={known === 'yes'}
                onClick={() => setKnown('yes')}
                label="Ja"
                ariaLabel="Ja, Energieklasse ist bekannt"
              />
              <Pill
                active={known === 'no'}
                onClick={() => {
                  setKnown('no')
                  setEnergyClass(null)
                }}
                label="Nein"
                ariaLabel="Nein, Energieklasse ist nicht bekannt"
              />
            </div>

            {/* Frage 2: Welche Klasse? */}
            <div className="mt-8 text-sm font-semibold text-slate-700">
              <span className="mr-2 text-slate-500">*</span>
              Welche Energieklasse hat die Immobilie?
            </div>

            <div
              className={[
                'mt-3 flex flex-wrap gap-3',
                known === 'yes' ? '' : 'opacity-50 pointer-events-none',
              ].join(' ')}
              aria-disabled={known !== 'yes'}
            >
              {CLASS_OPTIONS.map((c) => (
                <Pill
                  key={c}
                  active={energyClass === c}
                  onClick={() => setEnergyClass(c)}
                  label={c}
                  ariaLabel={`Energieklasse ${c} wählen`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Bild fix 256x256 */}
          <div className="flex w-[256px] items-start justify-end">
            <Image
              src="/immobilienbewertung/icons/energieeffizienzklasse.webp"
              alt="Energieeffizienzklasse der Immobilie"
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
