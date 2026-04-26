'use client'

import Image from 'next/image'
import {useEffect, useState} from 'react'

type LandBebaubarkeitValue = {status?: 'short_term' | 'limited' | 'not_buildable' | 'unknown'}
type LandBebaubarkeitStatus = LandBebaubarkeitValue["status"]

type Props = {
  value?: LandBebaubarkeitValue
  onChange: (v: LandBebaubarkeitValue) => void
}

const OPTIONS = [
  {
    id: 'short_term',
    label: 'Kurzfr. bebaubar',
    desc: 'Bau grundsätzlich zeitnah möglich',
    icon: '/immobilienbewertung/icons/grundstueck-kurzfristig-bebaubar.webp',
    alt: 'Grundstück kurzfristig bebaubar',
  },
  {
    id: 'limited',
    label: 'Eingeschränkt bebaubar',
    desc: 'Auflagen / Begrenzungen möglich',
    icon: '/immobilienbewertung/icons/grundstueck-eingeschraenkt-bebaubar.webp',
    alt: 'Grundstück eingeschränkt bebaubar',
  },
  {
    id: 'not_buildable',
    label: 'Nicht bebaubar',
    desc: 'Derzeit nicht zulässig',
    icon: '/immobilienbewertung/icons/grundstueck-nicht-bebaubar.webp',
    alt: 'Grundstück nicht bebaubar',
  },
  {
    id: 'unknown',
    label: 'Unbekannt',
    desc: 'Noch nicht geklärt',
    icon: '/immobilienbewertung/icons/grundstueck-bebaubarkeit-unbekannt.webp',
    alt: 'Bebaubarkeit unbekannt',
  },
] as const

export default function StepLand02BebaubarkeitSection({value, onChange}: Props) {
  const [status, setStatus] = useState<LandBebaubarkeitStatus>(value?.status)

  useEffect(() => {
    onChange({status})
  }, [status, onChange])

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-brand-navy">Bebaubarkeit</h2>
      <p className="mt-2 text-neutral-600">Wie ist die Bebauungsmöglichkeit des Grundstücks?</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {OPTIONS.map((o) => {
          const active = status === o.id

          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setStatus(o.id)}
              aria-pressed={active}
              className={[
                'group relative w-full text-left rounded-2xl border bg-white p-5 transition',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-navy)]/25',
                active
                  ? 'border-[color:var(--color-navy)] ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300',
              ].join(' ')}
            >
              <span
                aria-hidden
                className={[
                  'absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border transition',
                  active
                    ? 'border-[color:var(--color-navy)] bg-[color:var(--color-navy)] shadow-sm'
                    : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <span
                  className={
                    active
                      ? 'text-white text-sm leading-none'
                      : 'text-transparent text-sm leading-none'
                  }
                >
                  ✓
                </span>
              </span>

              <div className="flex items-center justify-center">
                <Image
                  src={o.icon}
                  alt={o.alt}
                  width={144}
                  height={144}
                  sizes="144px"
                  className="h-[144px] w-[144px] object-contain"
                />
              </div>

              <div
                className={[
                  'mt-4 text-sm font-semibold tracking-tight',
                  active ? 'text-brand-navy' : 'text-slate-900',
                ].join(' ')}
              >
                {o.label}
              </div>
              <div
                className={['mt-1 text-xs', active ? 'text-slate-600' : 'text-slate-500'].join(' ')}
              >
                {o.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
