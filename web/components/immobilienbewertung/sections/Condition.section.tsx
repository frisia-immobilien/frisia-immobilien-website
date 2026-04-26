'use client'

import Image from 'next/image'
import {useEffect, useRef, useState} from 'react'

type Condition = 'unknown' | 'good' | 'normal' | 'needs_work'
type ConditionValue = {condition?: Condition}

type Props = {
  value?: ConditionValue
  onChange: (v: ConditionValue) => void
  onNext?: () => void
}

export default function Step06ConditionSection({value, onChange}: Props) {
  const [condition, setCondition] = useState<Condition>(value?.condition ?? 'unknown')

  // ✅ onChange stabil halten
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // ✅ nur senden, wenn sich Wert wirklich ändert
  const lastSentRef = useRef<{condition: Condition} | null>(null)
  useEffect(() => {
    const next = {condition}
    const last = lastSentRef.current
    if (last && last.condition === next.condition) return
    lastSentRef.current = next
    onChangeRef.current(next)
  }, [condition])

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
        Renovierungsstand
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Wie ist der Zustand der Immobilie?
      </p>

      {/* Frisia-Grid: 2 pro Zeile ab sm, Box-Style wie Step08 (Border + Ring + Check) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          title="Renovierungsbedürftig"
          desc="Deutlicher Renovierungsaufwand"
          imgSrc="/immobilienbewertung/icons/zustand-renovierungsbeduerftig.webp"
          imgAlt="Zustand der Immobilie renovierungsbedürftig"
          active={condition === 'needs_work'}
          onClick={() => setCondition('needs_work')}
        />
        <Card
          title="Durchschnitt"
          desc="Solider, altersüblicher Zustand"
          imgSrc="/immobilienbewertung/icons/zustand-durchschnitt.webp"
          imgAlt="Zustand der Immobilie durchschnittlich"
          active={condition === 'normal'}
          onClick={() => setCondition('normal')}
        />
        <Card
          title="Neuwertig"
          desc="Modernisiert oder sehr gepflegt"
          imgSrc="/immobilienbewertung/icons/zustand-neuwertig.webp"
          imgAlt="Zustand der Immobilie neuwertig"
          active={condition === 'good'}
          onClick={() => setCondition('good')}
        />
        <Card
          title="Unbekannt"
          desc="Zustand kann nicht sicher eingeschätzt werden"
          imgSrc="/immobilienbewertung/icons/zustand-unbekannt.webp"
          imgAlt="Zustand der Immobilie unbekannt"
          active={condition === 'unknown'}
          onClick={() => setCondition('unknown')}
        />
      </div>
    </div>
  )
}

function Card({
  title,
  desc,
  imgSrc,
  imgAlt,
  active,
  onClick,
}: {
  title: string
  desc: string
  imgSrc: string
  imgAlt: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        // Frisia / Step08 Kachelstil
        'group relative flex h-[210px] w-full flex-col items-center justify-center rounded-2xl bg-white transition',
        active
          ? 'border border-[color:var(--color-navy)] ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
          : 'border border-slate-200 hover:border-slate-300',
      ].join(' ')}
    >
      {/* Bild: ohne Rahmen (Frisia Immobilienbewertungs-Stil: clean) */}
      <div className="flex items-center justify-center">
        <Image
          src={imgSrc}
          alt={imgAlt}
          width={160}
          height={120}
          sizes="160px"
          className="h-[120px] w-[160px] object-contain"
        />
      </div>

      {/* Titel + Subline: ruhig, ordnend */}
      <div className="mt-6 px-6 text-center">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-xs leading-relaxed text-slate-600">{desc}</div>
      </div>

      {/* Checkmark wie Step08 */}
      {active ? (
        <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-xs font-bold text-white">
          ✓
        </span>
      ) : null}
    </button>
  )
}
