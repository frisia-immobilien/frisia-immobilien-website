'use client'

import {useEffect, useState} from 'react'

type ReasonValue = {reason?: 'sale' | 'buy' | 'rent_out' | 'unknown'}
type ReasonType = ReasonValue["reason"]

type Props = {
  value?: ReasonValue
  onChange: (v: ReasonValue) => void
  onNext?: () => void
  context?: unknown
}

const OPTIONS: Array<{id: Exclude<ReasonType, 'unknown' | undefined>; label: string}> = [
  {id: 'sale', label: 'Verkauf'},
  {id: 'buy', label: 'Kauf'},
  {id: 'rent_out', label: 'Vermietung'},
]

export default function Step10ReasonSection({value, onChange}: Props) {
  const [reason, setReason] = useState<ReasonType>(value?.reason ?? 'unknown')

  useEffect(() => {
    onChange({reason})
  }, [reason, onChange])

  function select(id: Exclude<ReasonType, 'unknown' | undefined>) {
    setReason(id)
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Grund der Anfrage
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Wofür benötigst du den Immobilienwert?
      </p>

      {/* Optik/Pattern 1:1 wie Step09Extras (Boxen, Check, Subline) */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {OPTIONS.map((o) => {
          const active = reason === o.id

          return (
            <button
              key={o.id}
              type="button"
              onClick={() => select(o.id)}
              aria-pressed={active}
              className={[
                'group relative w-full text-left rounded-2xl border bg-white p-4 transition',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-navy)]/25',
                active
                  ? 'border-[color:var(--color-navy)] ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300',
              ].join(' ')}
            >
              {/* Check-Indicator exakt wie Step09 */}
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

              <div
                className={[
                  'text-sm font-semibold tracking-tight',
                  active ? 'text-brand-navy' : 'text-slate-900',
                ].join(' ')}
              >
                {o.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* KEIN Weiter-Button – Wizard steuert Navigation */}
    </div>
  )
}
