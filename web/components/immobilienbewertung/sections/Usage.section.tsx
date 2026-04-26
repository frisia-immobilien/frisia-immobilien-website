'use client'

import {useEffect, useState} from 'react'

type UsageValue = {usage?: 'rented' | 'owner_occupied' | 'vacant' | 'unknown'}
type UsageType = UsageValue["usage"]

type Props = {
  value?: UsageValue
  onChange: (v: UsageValue) => void
  onNext?: () => void
  context?: unknown
}

export default function Step11UsageSection({value, onChange}: Props) {
  const [usage, setUsage] = useState<UsageType>(value?.usage ?? 'unknown')

  useEffect(() => {
    onChange({usage})
  }, [usage, onChange])

  return (
    <div>
      {/* Standard-Überschriftenblock */}
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Aktuelle Nutzung
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Wie wird die Immobilie aktuell genutzt?
      </p>

      {/* Grid – identisch zu Reason.section.tsx */}
      <div className="mt-6 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
        <Card
          title="Selbst bewohnt"
          active={usage === 'owner_occupied'}
          onClick={() => setUsage('owner_occupied')}
        />
        <Card title="Vermietet" active={usage === 'rented'} onClick={() => setUsage('rented')} />
        <Card title="Leerstehend" active={usage === 'vacant'} onClick={() => setUsage('vacant')} />
      </div>

      {/* KEIN Weiter-Button – Wizard steuert Navigation */}
    </div>
  )
}

function Card({title, active, onClick}: {title: string; active: boolean; onClick: () => void}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        // Frisia-Standard: feste Höhe, Border-only, ruhig
        'group relative flex h-[60px] w-full items-center justify-left rounded-2xl border bg-white p-5 transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-navy)]/25',
        active
          ? 'border-[color:var(--color-navy)] ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
          : 'border-slate-200 hover:border-slate-300',
      ].join(' ')}
    >
      {/* Kreis-Indikator oben rechts – immer sichtbar */}
      <span
        aria-hidden
        className={[
          'absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border',
          active
            ? 'border-[color:var(--color-navy)] bg-[color:var(--color-navy)]'
            : 'border-slate-200 bg-white',
        ].join(' ')}
      >
        <span
          className={[
            'text-xs font-bold leading-none',
            active ? 'text-white' : 'text-transparent',
          ].join(' ')}
        >
          ✓
        </span>
      </span>

      {/* Titel */}
      <div className="text-sm font-semibold tracking-tight text-slate-900">{title}</div>
    </button>
  )
}
