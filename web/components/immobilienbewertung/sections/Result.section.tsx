'use client'

import {useEffect, useRef} from 'react'

type ResultValue = {
  status?: 'idle' | 'pending' | 'ready' | 'error'
  animationComplete?: boolean
  emailDispatchStatus?: 'idle' | 'pending' | 'sent' | 'error'
  manualReview?: boolean
  manualReviewReason?: string
  leadId?: string
  reportId?: string
  valueMid?: number
  rangeMin?: number
  rangeMax?: number
  currency?: 'EUR'
  landingUrl?: string
  email?: string
  emailProvider?: string
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

export default function Step15ResultSection({value, onChange, onRetry}: Props) {
  const latestValueRef = useRef<ResultValue | undefined>(value)
  const hasError = value?.status === 'error'
  const animationComplete = value?.animationComplete === true
  const showLoadingState = !hasError && !animationComplete
  const showReadyState = value?.status === 'ready' && animationComplete

  useEffect(() => {
    latestValueRef.current = value
  }, [value])

  useEffect(() => {
    onChange({
      status: value?.status ?? 'idle',
      animationComplete: value?.animationComplete ?? false,
      emailDispatchStatus: value?.emailDispatchStatus,
      manualReview: value?.manualReview,
      manualReviewReason: value?.manualReviewReason,
      leadId: value?.leadId,
      reportId: value?.reportId,
      valueMid: value?.valueMid,
      rangeMin: value?.rangeMin,
      rangeMax: value?.rangeMax,
      currency: 'EUR',
      landingUrl: value?.landingUrl,
      email: value?.email,
      emailProvider: value?.emailProvider,
      emailSentAt: value?.emailSentAt,
      expiresAt: value?.expiresAt,
      error: value?.error,
    })
  }, [
    value?.status,
    value?.animationComplete,
    value?.emailDispatchStatus,
    value?.manualReview,
    value?.manualReviewReason,
    value?.leadId,
    value?.reportId,
    value?.valueMid,
    value?.rangeMin,
    value?.rangeMax,
    value?.landingUrl,
    value?.email,
    value?.emailProvider,
    value?.emailSentAt,
    value?.expiresAt,
    value?.error,
    onChange,
  ])

  useEffect(() => {
    if (hasError || animationComplete) {
      return
    }

    const timer = window.setTimeout(() => {
      const latestValue = latestValueRef.current ?? {}
      if (latestValue.status === 'error') return

      onChange({
        ...latestValue,
        status: 'ready',
        animationComplete: true,
        currency: 'EUR',
      })
    }, 5000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [animationComplete, hasError, onChange])

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Ihre Immobilienbewertung liegt bereit
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Wir bereiten jetzt deine persönliche Bewertungsseite vor und versenden den Link direkt per
        E-Mail.
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
        {showLoadingState ? (
          <div className="rounded-2xl bg-[#EEF3F8] p-6">
            <div className="text-sm text-neutral-600">Bewertung wird erstellt</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-brand-navy"
                style={{
                  transform: 'scaleX(0)',
                  transformOrigin: 'left center',
                  animation: 'leadgen-result-progress 5000ms linear forwards',
                }}
              />
            </div>
            <style>
              {`@keyframes leadgen-result-progress {
                from { transform: scaleX(0); }
                to { transform: scaleX(1); }
              }`}
            </style>
            <p className="mt-5 text-sm leading-relaxed text-neutral-600">
              Lage, Marktumfeld und Objektdetails werden gerade zusammengeführt. Anschließend
              erhältst du deine persönliche Bewertungsseite per E-Mail.
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

        {showReadyState ? (
          <div className="rounded-2xl bg-[#EEF3F8] p-6">
            <div className="text-sm text-neutral-600">Bewertung fertig</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/80">
              <div className="h-full w-full rounded-full bg-brand-navy" />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-neutral-600">
              Deine Werteinschätzung ist fertig vorbereitet. Klicke auf Fertig, um abzuschließen.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
