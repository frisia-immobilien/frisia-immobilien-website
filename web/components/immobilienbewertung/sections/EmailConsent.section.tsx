'use client'

import {useEffect, useMemo, useState} from 'react'

type EmailConsentValue = {email?: string; consent?: boolean; captchaToken?: string; __valid?: boolean}

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
  const [email, setEmail] = useState<string>(String(value?.email ?? ''))
  const [consent, setConsent] = useState<boolean>(Boolean(value?.consent ?? false))
  const [touched, setTouched] = useState<boolean>(false)
  const emailInputId = `${idPrefix}-email`

  const emailOk = useMemo(() => isEmail(email), [email])
  const canProceed = useMemo(() => emailOk && consent === true, [emailOk, consent])

  useEffect(() => {
    onChange({
      email: normalizeEmail(email),
      consent: !!consent,
      __valid: canProceed, // <- Wizard-Button nutzt das zum Aktivieren/Deaktivieren
    })
  }, [email, consent, canProceed, onChange])

  const showEmailError = touched && !!normalizeEmail(email) && !emailOk

  return (
    <div>
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

      {/* Weiter-Button wird ausschließlich im Wizard gerendert */}
    </div>
  )
}
