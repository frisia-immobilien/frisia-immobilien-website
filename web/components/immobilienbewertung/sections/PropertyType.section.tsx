'use client'

/**
 * PropertyTypeSection (Step01 / Entry Tile Selection)
 * ------------------------------------------------------------
 * Zweck:
 * - Zeigt die 4 Kacheln (Haus/Wohnung/Grundstück/Gewerbe) als Einstieg in die Immobilienbewertung.
 *
 * Modi:
 * 1) Entry-Mode (Startseite):
 *    - Nutzt `onSelect(type)` und lädt danach den Wizard lazy nach.
 *    - Kein Wizard-State, kein onNext hier.
 *
 * 2) Wizard-Mode (legacy/kompatibel):
 *    - Nutzt `value + onChange + onNext` wie bisher.
 *
 * Performance-Regel:
 * - Diese Datei darf keine Wizard/Step-Imports ziehen, damit die Startseite schlank bleibt.
 *
 * UX-Anforderung Gewerbe:
 * - Wenn "Gewerbe" ausgewählt wird, öffnen wir ein abgedunkeltes Kontaktformular-Overlay.
 * - Gewerbeimmobilien werden nicht durch den Standard-Wizard geführt.
 *
 * Hinweis:
 * - Icons sind als optimierte WebP-Bilder eingebunden (schnell & konsistent).
 */

import {useEffect, useMemo, useState} from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {createPortal} from 'react-dom'

const KontaktForm = dynamic(() => import('@/components/contact/KontaktForm.client'), {
  ssr: false,
  loading: () => (
    <div className="rounded-[1.75rem] border border-white/70 bg-white p-8 text-sm font-semibold text-brand-navy shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
      Kontaktformular wird geladen ...
    </div>
  ),
})

/* =========================
   TYPES
========================= */
export type PropertyTypeCore = 'apartment' | 'house' | 'land' | 'commercial' | 'unknown'

export type Step01Value = {
  type?: PropertyTypeCore
}

export type Props = {
  /**
   * Wizard-Mode: current value
   * Entry-Mode: optional (kann leer bleiben)
   */
  value?: Step01Value

  /**
   * Wizard-Mode: required in the wizard (legacy)
   * Entry-Mode: can be omitted
   */
  onChange?: (v: Step01Value) => void

  /**
   * Wizard-Mode: optional next callback
   * Entry-Mode: unused
   */
  onNext?: () => void

  /**
   * Entry-Mode (Startseite): Quelle der Wahrheit.
   * Wenn gesetzt, wird onChange/onNext NICHT verwendet.
   */
  onSelect?: (type: Exclude<PropertyTypeCore, 'unknown'>) => void
}

/* =========================
   ICON SYSTEM
========================= */
/**
 * IconBase:
 * - Bewusst OHNE Rahmen/Box um das Icon.
 * - Höhe bleibt responsiv, damit die Kacheln visuell stabil bleiben.
 */
function IconBase({
  src,
  alt,
  title,
  active,
}: {
  src: string
  alt: string
  title?: string
  active: boolean
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
        title={title}
        width={128}
        height={128}
        sizes="128px"
        className="h-32 w-32"
      />
    </div>
  )
}

/* =========================
   COMPONENT
========================= */
export default function PropertyTypeSection(props: Props) {
  const selected = (props.value?.type ?? 'unknown') as PropertyTypeCore
  const [showCommercialContact, setShowCommercialContact] = useState(false)
  const commercialContactOverlay =
    showCommercialContact && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-[rgba(13,31,45,0.76)] px-4 py-6 backdrop-blur-[3px] sm:px-6 sm:py-8"
            role="dialog"
            aria-modal="true"
            aria-label="Kontaktformular für Gewerbeimmobilien"
            onClick={() => setShowCommercialContact(false)}
          >
            <div className="flex min-h-full items-center justify-center">
              <div
                className="relative mx-auto w-full max-w-[66rem] max-h-[calc(100dvh-3rem)] overflow-y-auto sm:max-h-[calc(100dvh-4rem)]"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowCommercialContact(false)}
                  className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-navy)]/15 bg-white text-xl font-semibold leading-none text-[color:var(--color-navy)] shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition hover:bg-slate-50"
                  aria-label="Kontaktformular schließen"
                >
                  ×
                </button>
                <KontaktForm
                  id="gewerbe-kontaktformular"
                  heading="Gewerbeimmobilie persönlich besprechen"
                  intro={`Gewerbeimmobilien sind komplexer als klassische Wohnimmobilien und lassen sich selten pauschal bewerten. Nutzung, Ertrag, Lage und Entwicklungspotenzial müssen individuell eingeordnet werden.

Lass uns deine Situation kurz persönlich durchgehen. Du bekommst eine klare, realistische Einschätzung – strukturiert, nachvollziehbar und ohne unnötigen Aufwand.`}
                  messageLabel="Angaben zur Gewerbeimmobilie *"
                  messagePlaceholder="z.B.: Bürofläche, Halle, Laden oder Praxis, Lage/Adresse, Fläche, aktuelle Nutzung und ob Verkauf oder Vermietung geplant ist."
                  submitLabel="Anfrage zu Gewerbeimmobilie senden"
                  successTitle="Anfrage eingegangen"
                  successMessage="Vielen Dank. Deine Anfrage zur Gewerbeimmobilie ist bei uns eingegangen. Wir melden uns persönlich bei dir."
                  trustItems={['Persönliche Einordnung', 'Diskret', 'Unverbindlich']}
                  context="LeadGen Gewerbeimmobilie"
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null

  useEffect(() => {
    if (!showCommercialContact) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowCommercialContact(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [showCommercialContact])

  const cards = useMemo(
    () => [
      {
        id: 'house' as const,
        label: 'Haus',
        desc: 'Einfamilienhaus, Doppelhaushälfte, Reihenhaus, Mehrfamilienhaus',
        icon: {
          src: '/immobilienbewertung/icons/einfamilienhaus-bewerten-aurich.webp',
          alt: 'Einfamilienhaus bewerten in Aurich',
          title: 'Einfamilienhaus bewerten',
        },
      },
      {
        id: 'apartment' as const,
        label: 'Wohnung',
        desc: 'Etagen-, Erdgeschoss- oder Dachgeschosswohnung',
        icon: {
          src: '/immobilienbewertung/icons/wohnung-bewerten-aurich.webp',
          alt: 'Wohnung bewerten in Aurich',
          title: 'Wohnung bewerten',
        },
      },
      {
        id: 'land' as const,
        label: 'Grundstück',
        desc: 'Baugrundstück, unbebaut',
        icon: {
          src: '/immobilienbewertung/icons/grundstueck-bewerten-aurich.webp',
          alt: 'Grundstück bewerten in Aurich',
          title: 'Grundstück bewerten',
        },
      },
      {
        id: 'commercial' as const,
        label: 'Gewerbe',
        desc: 'Büro, Halle, Laden, Praxis',
        icon: {
          src: '/immobilienbewertung/icons/gewerbeimmobilie-bewerten-aurich.webp',
          alt: 'Gewerbeimmobilie bewerten in Aurich',
          title: 'Gewerbe bewerten',
        },
      },
    ],
    [],
  )

  /**
   * Ein einziger Selection-Pfad:
   * - Entry-Mode: onSelect(type) (Quelle der Wahrheit)
   * - Wizard-Mode: onChange({type}) + optionaler Auto-Fortschritt (nicht für Gewerbe)
   */
  function handleSelect(type: Exclude<PropertyTypeCore, 'unknown'>) {
    if (type === 'commercial') {
      setShowCommercialContact(true)
    }

    // Entry-Mode (Startseite): ONLY callback
    if (typeof props.onSelect === 'function') {
      props.onSelect(type)
      return
    }

    // Wizard-Mode (legacy)
    if (typeof props.onChange === 'function') {
      props.onChange({type})
    }

    // Auto-Sprung: Haus/Wohnung/Grundstück — Gewerbe öffnet das Kontaktformular-Overlay.
    if (type !== 'commercial' && typeof props.onNext === 'function') {
      props.onNext()
    }
  }

  return (
    <div itemScope itemType="https://schema.org/Service" className="flex flex-col pb-12">
      {/* SEO/GEO microdata (leicht, ohne JS, ohne Risiko) */}
      <meta itemProp="serviceType" content="Immobilienbewertung" />
      <meta itemProp="areaServed" content="Aurich und Ostfriesland" />
      <meta itemProp="image" content="/immobilienbewertung/icons/einfamilienhaus-bewerten-aurich.webp" />
      <meta itemProp="image" content="/immobilienbewertung/icons/wohnung-bewerten-aurich.webp" />
      <meta itemProp="image" content="/immobilienbewertung/icons/grundstueck-bewerten-aurich.webp" />
      <meta itemProp="image" content="/immobilienbewertung/icons/gewerbeimmobilie-bewerten-aurich.webp" />

      {/* Standard-Überschriftenblock */}
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h3 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Welche Immobilie möchtest du bewerten?
      </h3>

      <p className="mt-2 mb-5 text-base leading-relaxed text-brand-graphite" itemProp="description">
        Wähle zuerst die passende Kategorie. Danach führen wir dich Schritt für Schritt durch die
        wichtigsten Angaben – für eine marktgerechte Einschätzung in Aurich und ganz Ostfriesland.
      </p>

      {/* 2 pro Zeile ab sm (mobil: 1), wie gewünscht */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((item) => {
          const active = selected === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={[
                // Step-08 Standard-Kachel (Border + Ring + Checkmark)
                'group relative flex h-[210px] w-full flex-col items-center justify-center rounded-2xl bg-white transition',
                active
                  ? 'border border-[color:var(--color-navy)] ring-2 ring-[color:var(--color-navy)]/15 shadow-sm'
                  : 'border border-slate-200 hover:border-slate-300',
              ].join(' ')}
              aria-pressed={active}
              aria-label={`${item.label} auswählen`}
            >
              <div className="flex items-center justify-center">
                <IconBase
                  src={item.icon.src}
                  alt={item.icon.alt}
                  title={item.icon.title}
                  active={active}
                />
              </div>

              <div className="mt-6 text-sm font-semibold text-slate-900">{item.label}</div>

              {active ? (
                <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-xs font-bold text-white">
                  ✓
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {commercialContactOverlay}
    </div>
  )
}
