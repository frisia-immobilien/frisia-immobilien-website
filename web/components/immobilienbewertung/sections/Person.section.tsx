'use client'

import {useEffect, useState} from 'react'

type Props = {
  value?: PersonValue
  onChange: (v: PersonValue) => void
  onNext?: () => void
  context?: unknown
}

type PersonValue = {
  salutation?: 'mrs' | 'mr' | 'none'
  firstName?: string
  lastName?: string
  phone?: string
  notes?: string
  __valid?: boolean
}
type Salutation = PersonValue["salutation"]

function t(v: unknown) {
  return String(v ?? '').trim()
}

// ✅ Erlaubt: +, Zahlen, Leerzeichen, /, -, (), Punkte
// ❌ Keine Buchstaben
// ✅ Mindestens 7 Ziffern (realistische Telefonnummer)
function isPhone(v: string) {
  const s = t(v).trim()
  if (!s) return false

  if (!/^[0-9+()\-/.\s]+$/.test(s)) return false

  const digits = s.replace(/\D/g, '')
  return digits.length >= 7
}

export default function Step14PersonSection({value, onChange}: Props) {
  const [salutation, setSalutation] = useState<Salutation>(
    value?.salutation ?? 'none',
  )
  const [firstName, setFirstName] = useState<string>(String(value?.firstName ?? ''))
  const [lastName, setLastName] = useState<string>(String(value?.lastName ?? ''))
  const [phone, setPhone] = useState<string>(String(value?.phone ?? ''))
  const [notes, setNotes] = useState<string>(String(value?.notes ?? ''))
  const [touched, setTouched] = useState<{firstName: boolean; lastName: boolean; phone: boolean}>({
    firstName: false,
    lastName: false,
    phone: false,
  })

  const firstNameValid = t(firstName).length >= 2
  const lastNameValid = t(lastName).length >= 2
  const phoneValid = isPhone(phone)
  const canProceed = firstNameValid && lastNameValid && phoneValid

  useEffect(() => {
    onChange({
      salutation,
      firstName: t(firstName),
      lastName: t(lastName),
      phone: t(phone),
      notes: t(notes),
      __valid: canProceed,
    })
  }, [salutation, firstName, lastName, phone, notes, canProceed, onChange])

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Deine Immobilienbewertung liegt bereit
      </h2>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Für wen sollen wir die Wertermittlung erstellen?
      </p>

      <div className="mt-6">
        <div className="text-sm font-medium text-brand-graphite mb-2">Anrede</div>
        <div className="flex flex-wrap gap-4">
          <Radio label="Frau" active={salutation === 'mrs'} onClick={() => setSalutation('mrs')} />
          <Radio label="Herr" active={salutation === 'mr'} onClick={() => setSalutation('mr')} />
          <Radio
            label="Keine Anrede"
            active={salutation === 'none'}
            onClick={() => setSalutation('none')}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-graphite mb-2">
            * Vorname
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setTouched((prev) => ({...prev, firstName: true}))}
            className={[
              'w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-navy',
              touched.firstName && !firstNameValid ? 'border-red-300' : 'border-neutral-300',
            ].join(' ')}
            placeholder="z.B. Max"
          />
          {touched.firstName && !firstNameValid ? (
            <div className="mt-2 text-sm text-neutral-600">Bitte Vornamen eingeben.</div>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-graphite mb-2">
            * Nachname
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => setTouched((prev) => ({...prev, lastName: true}))}
            className={[
              'w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-navy',
              touched.lastName && !lastNameValid ? 'border-red-300' : 'border-neutral-300',
            ].join(' ')}
            placeholder="z.B. Mustermann"
          />
          {touched.lastName && !lastNameValid ? (
            <div className="mt-2 text-sm text-neutral-600">Bitte Nachnamen eingeben.</div>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-brand-graphite mb-2">
            * Deine Telefon-Nr.
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9+()\-/.\s]/g, ''))} // ✅ Buchstaben automatisch rausfiltern
            onBlur={() => setTouched((prev) => ({...prev, phone: true}))}
            className={[
              'w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-navy',
              touched.phone && !phoneValid ? 'border-red-300' : 'border-neutral-300',
            ].join(' ')}
            placeholder="z.B. 0171/1234567"
          />
          {!touched.phone || phoneValid ? null : (
            <div className="mt-2 text-sm text-neutral-600">
              Bitte eine gültige Telefonnummer eingeben (z. B. 04941/12345).
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-brand-graphite mb-2">Sonstige Hinweise</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[120px] rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-navy"
            placeholder="Optional – z.B. geplantes Verkaufsdatum, Besonderheiten der Immobilie oder Rückrufwunsch"
          />
        </div>
      </div>
    </div>
  )
}

function Radio({label, active, onClick}: {label: string; active: boolean; onClick: () => void}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
        active
          ? 'border-brand-navy bg-white text-brand-navy'
          : 'border-neutral-200 bg-neutral-50 text-brand-graphite hover:border-neutral-300',
      ].join(' ')}
    >
      <span
        className={
          active
            ? 'h-3 w-3 rounded-full bg-brand-navy'
            : 'h-3 w-3 rounded-full border border-neutral-300'
        }
      />
      {label}
    </button>
  )
}
