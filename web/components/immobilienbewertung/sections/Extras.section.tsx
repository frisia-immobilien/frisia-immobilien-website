'use client'

import Image from 'next/image'
import {useEffect, useState} from 'react'

type ExtrasValue = {extras?: string[]; otherExtras?: string; otherExtrasValueEur?: number}

type Props = {
  value?: ExtrasValue
  onChange: (v: ExtrasValue) => void
  onNext?: () => void
}

const OPTIONS = [
  {
    id: 'parking',
    label: 'Stellplatz',
    icon: '/immobilienbewertung/icons/stellplatz.webp',
    alt: 'Stellplatz vorhanden',
  },
  {
    id: 'balcony',
    label: 'Balkon/Terrasse',
    icon: '/immobilienbewertung/icons/balkon-terrasse.webp',
    alt: 'Balkon oder Terrasse vorhanden',
  },
  {
    id: 'elevator',
    label: 'Aufzug',
    icon: '/immobilienbewertung/icons/aufzug.webp',
    alt: 'Aufzug im Gebäude',
  },
  {
    id: 'basement',
    label: 'Keller',
    icon: '/immobilienbewertung/icons/keller.webp',
    alt: 'Keller vorhanden',
  },
  {
    id: 'garage',
    label: 'Garage',
    icon: '/immobilienbewertung/icons/garage.webp',
    alt: 'Garage vorhanden',
  },
  {
    id: 'guest_wc',
    label: 'Gäste-WC',
    icon: '/immobilienbewertung/icons/gaeste-wc.webp',
    alt: 'Gäste-WC vorhanden',
  },
]

export default function Step09ExtrasSection({value, onChange}: Props) {
  const [extras, setExtras] = useState<string[]>(Array.isArray(value?.extras) ? value!.extras : [])
  const [otherExtras, setOtherExtras] = useState<string>(String(value?.otherExtras ?? ''))
  const [otherExtrasValueEur, setOtherExtrasValueEur] = useState<number>(
    Number(value?.otherExtrasValueEur ?? 0),
  )

  useEffect(() => {
    onChange({
      extras,
      otherExtras: otherExtras.trim(),
      otherExtrasValueEur: otherExtrasValueEur > 0 ? otherExtrasValueEur : 0,
    })
  }, [extras, otherExtras, otherExtrasValueEur, onChange])

  function toggle(id: string) {
    setExtras((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Extras
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Welche Extras hat die Immobilie?
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const active = extras.includes(o.id)

          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              aria-pressed={active}
              className={[
                'group relative w-full text-left rounded-2xl border bg-white p-4 transition',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-navy)]/25',
                active
                  ? 'border-[color:var(--color-navy)] ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300',
              ].join(' ')}
            >
              {/* Check-Indicator (wie Step01-„aktiv“ Gefühl: klar, ruhig, eindeutig) */}
              <span
                aria-hidden
                className={[
                  'absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border transition',
                  active
                    ? 'border-[color:var(--color-navy)] bg-white'
                    : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <span
                  className={[
                    'h-2.5 w-2.5 rounded-full transition',
                    active ? 'bg-[color:var(--color-navy)]' : 'bg-transparent',
                  ].join(' ')}
                />
              </span>

              <div className="flex flex-col items-center gap-3 text-center">
                <Image
                  src={o.icon}
                  alt={o.alt}
                  width={96}
                  height={96}
                  sizes="96px"
                  className="h-24 w-24 object-contain"
                />
                <div
                  className={[
                    'text-sm font-semibold tracking-tight',
                    active ? 'text-brand-navy' : 'text-slate-900',
                  ].join(' ')}
                >
                  {o.label}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-graphite mb-2">
            Andere Extras
          </label>
          <textarea
            value={otherExtras}
            onChange={(e) => setOtherExtras(e.target.value)}
            className="w-full min-h-[96px] rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-navy"
            placeholder="Weitere Extras, die Sie uns mitteilen möchten."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-graphite mb-2">
            Wert der anderen Extras (€)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={otherExtrasValueEur || ''}
            onChange={(e) => setOtherExtrasValueEur(Number(e.target.value))}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand-navy"
            placeholder="€"
          />
        </div>
      </div>
    </div>
  )
}
