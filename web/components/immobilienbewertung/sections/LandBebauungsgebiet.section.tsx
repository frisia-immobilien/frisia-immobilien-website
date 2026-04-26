'use client'

import Image from 'next/image'
import {useEffect, useState} from 'react'

type LandBebauungsgebietValue = {status?: 'wohn' | 'gewerbe' | 'misch'}
type LandBebauungsgebietStatus = LandBebauungsgebietValue["status"]

type Props = {
  value?: LandBebauungsgebietValue
  onChange: (v: LandBebauungsgebietValue) => void
}

const OPTIONS = [
  {
    id: 'wohn',
    label: 'Wohngebiet',
    desc: 'Überwiegend Wohnen',
    icon: '/immobilienbewertung/icons/bebauungsgebiet-wohngebiet.webp',
    alt: 'Grundstück im Wohngebiet',
  },
  {
    id: 'gewerbe',
    label: 'Gewerbegebiet',
    desc: 'Überwiegend Gewerbe',
    icon: '/immobilienbewertung/icons/bebauungsgebiet-gewerbegebiet.webp',
    alt: 'Grundstück im Gewerbegebiet',
  },
  {
    id: 'misch',
    label: 'Mischgebiet',
    desc: 'Wohnen & Gewerbe gemischt',
    icon: '/immobilienbewertung/icons/bebauungsgebiet-mischgebiet.webp',
    alt: 'Grundstück im Mischgebiet',
  },
] as const

export default function StepLand03BebauungsgebietSection({value, onChange}: Props) {
  const [status, setStatus] = useState<LandBebauungsgebietStatus>(value?.status)

  useEffect(() => {
    onChange({status})
  }, [status, onChange])

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-brand-navy">Bebauungsgebiet</h2>
      <p className="mt-2 text-neutral-600">In welcher Art Bebauungsgebiet liegt das Grundstück?</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
