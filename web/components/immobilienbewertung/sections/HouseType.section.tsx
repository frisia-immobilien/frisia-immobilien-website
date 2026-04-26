'use client'

import Image from 'next/image'
import {useMemo} from 'react'

type HouseType = 'single_family' | 'semi_detached' | 'row_mid' | 'row_end' | 'multi_family'

type Value = {
  houseType?: HouseType
}

type Props = {
  value?: Value
  onChange: (v: Value) => void
}

const OPTIONS: {
  key: HouseType
  label: string
  icon: {src: string; alt: string; className?: string; size?: number}
}[] = [
  {
    key: 'single_family',
    label: 'Einfamilienhaus',
    icon: {
      src: '/immobilienbewertung/icons/einfamilienhaus-bewerten-aurich.webp',
      alt: 'Einfamilienhaus bewerten in Aurich',
    },
  },
  {
    key: 'semi_detached',
    label: 'Doppelhaushälfte',
    icon: {
      src: '/immobilienbewertung/icons/doppelhaushaelfte-bewerten-aurich.webp',
      alt: 'Auswahl Doppelhaushälfte',
    },
  },
  {
    key: 'row_mid',
    label: 'Reihenmittelhaus',
    icon: {
      src: '/immobilienbewertung/icons/reihenmittelhaus-bewerten-aurich.webp',
      alt: 'Auswahl Reihenmittelhaus',
    },
  },
  {
    key: 'row_end',
    label: 'Reihenendhaus',
    icon: {
      src: '/immobilienbewertung/icons/reihenendhaus-bewerten-aurich.webp',
      alt: 'Auswahl Reihenendhaus',
      className: 'h-[165px] w-[165px]',
    },
  },
  {
    key: 'multi_family',
    label: 'Mehrfamilienhaus',
    icon: {
      src: '/immobilienbewertung/icons/mehrfamilienhaus-bewerten-aurich.webp',
      alt: 'Auswahl Mehrfamilienhaus',
    },
  },
]

export default function HouseTypeSection({value, onChange}: Props) {
  const selected = (value?.houseType ?? undefined) as HouseType | undefined

  const eyebrow = useMemo(() => 'Wie viel ist meine Immobilie wert?', [])
  const title = useMemo(() => 'Welche Immobilie möchtest du bewerten?', [])
  const subtitle = useMemo(
    () => 'Wähle zuerst die passende Kategorie. Den Rest klären wir Schritt für Schritt.',
    [],
  )

  return (
    <div className="w-full">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        {eyebrow}
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy">{title}</h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite">{subtitle}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {OPTIONS.map(({key, label, icon}) => {
          const active = selected === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange({houseType: key})}
              className={[
                'group relative flex h-[210px] w-full flex-col items-center justify-center rounded-2xl border bg-white transition',
                active
                  ? 'border-[color:var(--color-navy)] ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300',
              ].join(' ')}
              aria-pressed={active}
            >
              <div className="flex items-center justify-center">
                <IconBase
                  src={icon.src}
                  alt={icon.alt}
                  active={active}
                  className={icon.className}
                  size={icon.size}
                />
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

function IconBase({
  src,
  alt,
  active,
  className,
  size = 128,
}: {
  src: string
  alt: string
  active: boolean
  className?: string
  size?: number
}) {
  return (
    <div
      className={[
        'flex w-full items-center justify-center transition',
        'h-[72px] sm:h-[84px] lg:h-[128px]',
        active ? 'opacity-100' : 'opacity-90',
      ].join(' ')}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={['h-32 w-32', className].filter(Boolean).join(' ')}
      />
    </div>
  )
}
