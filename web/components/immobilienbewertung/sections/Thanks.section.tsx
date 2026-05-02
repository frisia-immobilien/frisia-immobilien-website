'use client'

import Image from 'next/image'
import {useEffect, useMemo, useState} from 'react'

type ThanksValue = {closed?: boolean}

type Props = {
  value?: ThanksValue
  onChange: (v: ThanksValue) => void
  onNext?: () => void
  onRetry?: () => void
  context?: {
    lead?: {
      step13EmailConsent?: {
        email?: string
      }
      step15Result?: {
        emailDispatchStatus?: 'idle' | 'pending' | 'sent' | 'error'
        leadId?: string
        email?: string
        error?: string
      }
    }
  }
}

export default function Step16ThanksSection({value, onChange, onRetry, context}: Props) {
  const [resendState, setResendState] = useState<'idle' | 'pending' | 'sent' | 'error'>('idle')
  const [resendError, setResendError] = useState('')
  const dispatchStatus = context?.lead?.step15Result?.emailDispatchStatus ?? 'pending'
  const dispatchError = context?.lead?.step15Result?.error
  const leadId = context?.lead?.step15Result?.leadId
  const email = context?.lead?.step15Result?.email || context?.lead?.step13EmailConsent?.email
  const isSending = dispatchStatus === 'idle' || dispatchStatus === 'pending'
  const hasDispatchError = dispatchStatus === 'error'
  const resendLabel = useMemo(() => {
    if (resendState === 'pending') return 'E-Mail wird erneut gesendet ...'
    if (resendState === 'sent') return 'E-Mail erneut gesendet'
    return 'E-Mail erneut senden'
  }, [resendState])

  useEffect(() => {
    onChange({closed: !!value?.closed})
  }, [onChange, value?.closed])

  async function resendEmail() {
    if (!leadId || resendState === 'pending') return
    setResendState('pending')
    setResendError('')

    try {
      const response = await fetch('/api/lead/resend-report', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({leadId}),
      })
      const result = (await response.json()) as {success?: boolean; error?: string}
      if (!response.ok || result.success !== true) {
        throw new Error(result.error || 'Die E-Mail konnte nicht erneut gesendet werden.')
      }
      setResendState('sent')
    } catch (error) {
      setResendState('error')
      setResendError(error instanceof Error ? error.message : 'Die E-Mail konnte nicht erneut gesendet werden.')
    }
  }

  return (
    <div className="text-center">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        {isSending ? 'E-Mail Versand' : hasDispatchError ? 'Hinweis' : 'Erfolg'}
      </div>
      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy">
        {isSending
          ? 'Deine Werteinschätzung wird versendet.'
          : hasDispatchError
            ? 'Die E-Mail konnte nicht versendet werden.'
            : 'Deine Werteinschätzung ist fertig vorbereitet.'}
      </h2>

      {isSending ? (
        <div className="mx-auto mt-5 max-w-2xl rounded-2xl bg-[#EEF3F8] p-6 text-left">
          <p className="text-base leading-relaxed text-neutral-600">
            Wir stellen nun die gesamte Bewertung zusammen und senden den persönlichen Bewertungslink
            {email ? (
              <>
                {' '}an <span className="font-semibold text-brand-navy">{email}</span>
              </>
            ) : null}
            . Dieser Vorgang kann bis zu 30 Sekunden dauern.
          </p>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/80">
            <div className="h-full w-1/2 rounded-full bg-brand-navy leadgen-email-progress" />
          </div>
          <style>
            {`@keyframes leadgen-email-progress {
              0% { transform: translateX(-110%); }
              100% { transform: translateX(220%); }
            }

            .leadgen-email-progress {
              animation: leadgen-email-progress 1.5s ease-in-out infinite;
            }`}
          </style>
        </div>
      ) : null}

      {hasDispatchError ? (
        <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-base leading-relaxed text-red-700">
            {dispatchError || 'Bitte versuche den Versand erneut. Deine Angaben wurden gespeichert.'}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white transition hover:bg-brand-brackish"
          >
            E-Mail erneut auslösen
          </button>
        </div>
      ) : null}

      {!isSending && !hasDispatchError ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
          Wir haben dir soeben eine E-Mail{email ? ' an ' : ' '}
          {email ? <span className="font-semibold text-brand-navy">{email}</span> : null}
          {email ? ' ' : ''}
          gesendet. Das Ergebnis ist ausschließlich über den persönlichen Link in dieser E-Mail abrufbar.
        </p>
      ) : null}

      <div className="mt-10 mx-auto flex h-60 w-60 items-center justify-center">
        <Image
          src="/immobilienbewertung/icons/immobilienbewertung-danke-aurich.webp"
          alt="Abschluss der Immobilienbewertung"
          width={240}
          height={240}
          sizes="240px"
          className="h-60 w-60 object-contain"
        />
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {!isSending && !hasDispatchError ? (
          <button
            type="button"
            onClick={resendEmail}
            disabled={!leadId || resendState === 'pending' || resendState === 'sent'}
            className={[
              'inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold transition',
              leadId && resendState !== 'sent'
                ? 'bg-brand-navy text-white hover:bg-brand-brackish'
                : 'bg-slate-200 text-slate-500',
            ].join(' ')}
          >
            {resendLabel}
          </button>
        ) : null}

        {resendState === 'error' ? (
          <p className="max-w-xl text-sm text-red-700">{resendError}</p>
        ) : null}
      </div>
    </div>
  )
}
