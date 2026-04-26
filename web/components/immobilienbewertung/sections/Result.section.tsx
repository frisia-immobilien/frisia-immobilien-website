'use client'

import Link from 'next/link'
import {useEffect} from 'react'

type ResultValue = {
  status?: 'idle' | 'pending' | 'ready' | 'error'
  valueMid?: number
  rangeMin?: number
  rangeMax?: number
  currency?: 'EUR'
  landingUrl?: string
  email?: string
  emailSentAt?: string
  expiresAt?: string
  error?: string
}

type Props = {
  value?: ResultValue
  onChange: (v: ResultValue) => void
  onNext?: () => void
  onRetry?: () => void
  context?: unknown
}

function euro(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `${value.toLocaleString('de-DE')} €`
}

export default function Step15ResultSection({value, onChange, onRetry}: Props) {
  useEffect(() => {
    onChange({
      status: value?.status ?? 'idle',
      valueMid: value?.valueMid,
      rangeMin: value?.rangeMin,
      rangeMax: value?.rangeMax,
      currency: 'EUR',
      landingUrl: value?.landingUrl,
      email: value?.email,
      emailSentAt: value?.emailSentAt,
      expiresAt: value?.expiresAt,
      error: value?.error,
    })
  }, [
    value?.status,
    value?.valueMid,
    value?.rangeMin,
    value?.rangeMax,
    value?.landingUrl,
    value?.email,
    value?.emailSentAt,
    value?.expiresAt,
    value?.error,
    onChange,
  ])

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Ihre Immobilienbewertung liegt bereit
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Wir bereiten jetzt Ihre persönliche Bewertungsseite vor und versenden den Link direkt per
        E-Mail.
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        {value?.status === 'pending' || value?.status === 'idle' ? (
          <div className="rounded-2xl bg-[#EEF3F8] p-6">
            <div className="text-sm text-neutral-600">Bewertung wird erstellt</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/80">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-brand-navy" />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-neutral-600">
              Lage, Marktumfeld und Objektdetails werden gerade zusammengeführt. Anschließend
              erhalten Sie Ihre persönliche Bewertungsseite per E-Mail.
            </p>
          </div>
        ) : null}

        {value?.status === 'error' ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-red-700">
              Bewertung konnte nicht fertiggestellt werden
            </div>
            <p className="mt-3 text-sm leading-relaxed text-red-700">
              {value.error || 'Bitte prüfen Sie Ihre Angaben oder versuchen Sie es erneut.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-brackish"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        ) : null}

        {value?.status === 'ready' ? (
          <>
            <div className="text-sm text-neutral-600">Marktbasierte Einordnung</div>
            <div className="mt-4 rounded-2xl bg-[#EEF3F8] p-6 text-center">
              <div className="text-4xl font-semibold tracking-tight text-brand-navy sm:text-5xl">
                {euro(value.valueMid)}
              </div>
              <div className="mt-4 text-sm font-medium text-neutral-700">
                Realistische Verkaufsspanne:
              </div>
              <div className="mt-1 text-xl font-medium text-brand-graphite sm:text-2xl">
                {euro(value.rangeMin)} – {euro(value.rangeMax)}
              </div>
              <div className="mt-3 text-xs text-neutral-600">
                Erste marktbasierte Einordnung auf Basis regionaler Vergleichsdaten.
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[color:var(--color-sand)]/70 bg-[color:var(--color-cream)]/55 p-5 text-sm leading-relaxed text-brand-graphite">
              Den genauen Verkaufspreis legen wir gemeinsam strukturiert fest.
            </div>

            <div className="mt-5 space-y-2 text-sm text-neutral-600">
              {value.email ? (
                <p>
                  Ihre Bewertungsseite wurde an <span className="font-semibold text-brand-navy">{value.email}</span>{' '}
                  gesendet.
                </p>
              ) : null}

              {value.landingUrl ? (
                <Link href={value.landingUrl} className="inline-flex items-center font-semibold text-brand-navy underline underline-offset-4">
                  Bewertungsseite im Browser öffnen
                </Link>
              ) : null}

              {value.expiresAt ? (
                <p>Link gültig bis {new Date(value.expiresAt).toLocaleDateString('de-DE')}.</p>
              ) : null}
            </div>

            <p className="mt-5 text-sm text-neutral-600">
              Diese Einwertung stellt eine erste automatisierte Orientierung dar. Der tatsächliche
              Marktpreis hängt unter anderem von Zustand, Mikrolage und aktueller Nachfrage ab und
              wird im Rahmen einer persönlichen Bewertung präzise ermittelt.
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
