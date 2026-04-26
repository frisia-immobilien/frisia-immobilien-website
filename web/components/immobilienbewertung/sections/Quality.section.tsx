'use client'

import Image from 'next/image'
import {useCallback} from 'react'

type QualityId = 'simple' | 'medium' | 'high' | 'very_high' | 'unknown'

type ValueShape = {
  qualityId?: QualityId
  qualityLabel?: string
}

type Props = {
  value?: ValueShape
  onChange: (v: ValueShape) => void
}

const OPTIONS: Array<{id: QualityId; label: string; Icon: React.FC<{active?: boolean}>}> = [
  {
    id: 'simple',
    label: 'Einfach',
    Icon: () => (
      <Image
        src="/immobilienbewertung/icons/ausstattung-einfach.webp"
        alt="Einfache Ausstattungsqualität"
        width={128}
        height={128}
        sizes="128px"
        className="h-32 w-32 object-contain"
      />
    ),
  },
  {
    id: 'medium',
    label: 'Mittel',
    Icon: () => (
      <Image
        src="/immobilienbewertung/icons/ausstattung-mittel.webp"
        alt="Mittlere Ausstattungsqualität"
        width={128}
        height={128}
        sizes="128px"
        className="h-32 w-32 object-contain"
      />
    ),
  },
  {
    id: 'high',
    label: 'Gehoben',
    Icon: () => (
      <Image
        src="/immobilienbewertung/icons/ausstattung-gehoben.webp"
        alt="Gehobene Ausstattungsqualität"
        width={128}
        height={128}
        sizes="128px"
        className="h-32 w-32 object-contain"
      />
    ),
  },
  {
    id: 'very_high',
    label: 'Stark gehoben',
    Icon: () => (
      <Image
        src="/immobilienbewertung/icons/ausstattung-sehr-gehoben.webp"
        alt="Sehr hochwertige Ausstattung"
        width={128}
        height={128}
        sizes="128px"
        className="h-32 w-32 object-contain"
      />
    ),
  },
  {
    id: 'unknown',
    label: 'Unbekannt',
    Icon: () => (
      <Image
        src="/immobilienbewertung/icons/ausstattung-unbekannt.webp"
        alt="Ausstattungsqualität unbekannt"
        width={128}
        height={128}
        sizes="128px"
        className="h-32 w-32 object-contain"
      />
    ),
  },
]

export default function Step08QualitySection({value, onChange}: Props) {
  const selectedId = (value?.qualityId ?? undefined) as QualityId | undefined

  const select = useCallback(
    (id: QualityId, label: string) => {
      onChange({qualityId: id, qualityLabel: label})
    },
    [onChange],
  )

  return (
    <div className="w-full">
      {/* Standard-Überschriftenblock */}
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Qualität der Ausstattung
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Welche Qualität hat die Ausstattung der Immobilie?
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {OPTIONS.map(({id, label, Icon}) => {
          const active = id === selectedId

          return (
            <button
              key={id}
              type="button"
              onClick={() => select(id, label)}
              className={[
                'group relative flex h-[210px] w-full flex-col items-center justify-center rounded-2xl border bg-white transition',
                active
                  ? 'border-[color:var(--color-navy)] ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300',
              ].join(' ')}
              aria-pressed={active}
            >
              <div className="flex items-center justify-center">
                <Icon active={active} />
              </div>

              <div className="mt-6 text-sm font-semibold text-slate-900">{label}</div>

              {active ? (
                <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-xs font-bold text-white">
                  ✓
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
