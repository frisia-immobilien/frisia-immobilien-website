'use client'

import Script from 'next/script'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

type EmailConsentValue = {email?: string; consent?: boolean; captchaToken?: string; __valid?: boolean}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact' | 'flexible' | 'invisible'
          appearance?: 'always' | 'execute' | 'interaction-only'
        },
      ) => string
      reset: (widgetId: string) => void
    }
  }
}

type Props = {
  value?: EmailConsentValue
  onChange: (v: EmailConsentValue) => void
  onNext?: () => void
  context?: unknown
  idPrefix?: string
}

function t(v: unknown) {
  return String(v ?? '').trim()
}

function normalizeEmail(v: string) {
  return t(v).toLowerCase()
}

function isEmail(v: string) {
  const s = normalizeEmail(v)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export default function Step13EmailConsentSection({value, onChange, idPrefix = 'leadgen'}: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''
  const captchaEnabled = Boolean(siteKey)
  const [email, setEmail] = useState<string>(String(value?.email ?? ''))
  const [consent, setConsent] = useState<boolean>(Boolean(value?.consent ?? false))
  const [captchaToken, setCaptchaToken] = useState<string>(String(value?.captchaToken ?? ''))
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [captchaError, setCaptchaError] = useState('')
  const [touched, setTouched] = useState<boolean>(false)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const emailInputId = `${idPrefix}-email`
  const turnstileWidgetId = `${idPrefix}-turnstile-widget`

  const emailOk = useMemo(() => isEmail(email), [email])
  const captchaOk = !captchaEnabled || Boolean(captchaToken)
  const canProceed = useMemo(() => emailOk && consent === true && captchaOk, [emailOk, consent, captchaOk])

  const initTurnstile = useCallback(() => {
    if (!captchaEnabled || widgetId || !widgetRef.current) return
    if (!window.turnstile) return

    try {
      const id = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        theme: 'light',
        size: 'invisible',
        appearance: 'interaction-only',
        callback: (token: string) => {
          setCaptchaToken(token)
          setCaptchaError('')
        },
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => {
          setCaptchaToken('')
          setCaptchaError('Sicherheitsprüfung konnte nicht geladen werden. Bitte Seite neu laden.')
        },
      })
      setWidgetId(id)
      setCaptchaError('')
    } catch {
      setCaptchaError('Sicherheitsprüfung konnte nicht initialisiert werden. Bitte Seite neu laden.')
    }
  }, [captchaEnabled, siteKey, widgetId])

  useEffect(() => {
    if (!captchaEnabled || widgetId || !scriptLoaded) return

    let tries = 0
    const timer = window.setInterval(() => {
      tries += 1
      if (window.turnstile && widgetRef.current && !widgetId) {
        initTurnstile()
        window.clearInterval(timer)
      }
      if (tries >= 20) {
        window.clearInterval(timer)
        if (!window.turnstile) {
          setCaptchaError('Sicherheitsprüfung wurde blockiert. Bitte Content-Blocker prüfen.')
        }
      }
    }, 200)

    return () => window.clearInterval(timer)
  }, [captchaEnabled, initTurnstile, scriptLoaded, widgetId])

  useEffect(() => {
    onChange({
      email: normalizeEmail(email),
      consent: !!consent,
      captchaToken,
      __valid: canProceed, // <- Wizard-Button nutzt das zum Aktivieren/Deaktivieren
    })
  }, [email, consent, captchaToken, canProceed, onChange])

  const showEmailError = touched && !!normalizeEmail(email) && !emailOk

  return (
    <div>
      {captchaEnabled ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          onLoad={() => setScriptLoaded(true)}
          onError={() => setCaptchaError('Sicherheitsprüfung konnte nicht geladen werden.')}
        />
      ) : null}

      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Ihre Immobilienbewertung liegt bereit
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        An welche E-Mail-Adresse soll die Bewertung gesendet werden?
      </p>

      <div className="mt-6">
        <label
          className="block text-sm font-medium text-brand-graphite mb-2"
          htmlFor={emailInputId}
        >
          * E-Mail Adresse
        </label>
        <input
          id={emailInputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          required
          pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          className={[
            'w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-navy',
            showEmailError ? 'border-red-300' : 'border-neutral-300',
          ].join(' ')}
          aria-invalid={showEmailError ? 'true' : 'false'}
        />

        {showEmailError ? (
          <div className="mt-2 text-sm text-neutral-600">Bitte gültige E-Mail eingeben.</div>
        ) : null}
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-brand-navy"
        />
        <span className="text-sm text-neutral-700">
          Ich möchte die Bewertung per E-Mail erhalten. Frisia Immobilien darf mich dazu
          kontaktieren (z. B. für Rückfragen zur Wertermittlung).
          <br />
          Widerruf jederzeit möglich.{' '}
          <a
            href="/recht/datenschutz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-brand-navy hover:text-brand-brackish"
          >
            Mehr in der Datenschutzerklärung.
          </a>
        </span>
      </label>

      {captchaEnabled ? (
        <div className="sr-only" aria-hidden="true">
          <div ref={widgetRef} id={turnstileWidgetId} />
        </div>
      ) : null}

      {captchaError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          {captchaError ? <p className="mt-2 text-xs text-red-700">{captchaError}</p> : null}
        </div>
      ) : null}

      {/* Weiter-Button wird ausschließlich im Wizard gerendert */}
    </div>
  )
}
