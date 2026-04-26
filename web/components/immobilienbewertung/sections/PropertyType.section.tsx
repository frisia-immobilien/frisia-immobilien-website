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
 * UX-Anforderung (Mobile):
 * - Wenn "Gewerbe" ausgewählt wird, muss die Info-Box zuverlässig ins Sichtfeld gescrollt werden,
 *   sonst "poppt" sie unterhalb des Viewports auf und wird nicht wahrgenommen.
 *
 * Hinweis:
 * - Icons sind als optimierte WebP-Bilder eingebunden (schnell & konsistent).
 */

import {useEffect, useMemo, useRef} from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
  const showGewerbeHint = selected === 'commercial'

  /**
   * Ref auf den Gewerbe-Hinweis-Container:
   * - wird genutzt, um nach Auswahl von "Gewerbe" zuverlässig ins Sichtfeld zu scrollen (Mobile).
   */
  const gewerbeHintRef = useRef<HTMLDivElement | null>(null)

  /**
   * Mobile-Wahrnehmung sicherstellen:
   * - Wenn "Gewerbe" aktiv wird, scrollen wir die Info-Box smooth ins Sichtfeld.
   * - requestAnimationFrame stellt sicher, dass der DOM-Node bereits gerendert ist.
   */
  useEffect(() => {
    if (!showGewerbeHint) return

    requestAnimationFrame(() => {
      gewerbeHintRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
    })
  }, [showGewerbeHint])

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
    // Entry-Mode (Startseite): ONLY callback
    if (typeof props.onSelect === 'function') {
      props.onSelect(type)
      return
    }

    // Wizard-Mode (legacy)
    if (typeof props.onChange === 'function') {
      props.onChange({type})
    }

    // Auto-Sprung: Haus/Wohnung/Grundstück — Gewerbe bleibt stehen (Box soll gelesen werden)
    if (type !== 'commercial' && typeof props.onNext === 'function') {
      props.onNext()
    }
  }

  return (
    <div itemScope itemType="https://schema.org/Service" className="flex flex-col pb-12">
      {/* SEO/GEO microdata (leicht, ohne JS, ohne Risiko) */}
      <meta itemProp="serviceType" content="Immobilienbewertung" />
      <meta itemProp="areaServed" content="Aurich und Ostfriesland" />
      <meta itemProp="image" content="/immobilienbewertung/icons/haus-bewerten-aurich.webp" />
      <meta itemProp="image" content="/immobilienbewertung/icons/wohnung-bewerten-aurich.webp" />
      <meta itemProp="image" content="/immobilienbewertung/icons/grundstueck-bewerten-aurich.webp" />
      <meta itemProp="image" content="/immobilienbewertung/icons/gewerbeimmobilie-bewerten-aurich.webp" />

      {/* Standard-Überschriftenblock */}
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">
        Wie viel ist meine Immobilie wert?
      </div>

      <h2 className="mt-5 text-2xl tracking-tight text-brand-navy" itemProp="name">
        Welche Immobilie möchtest du bewerten?
      </h2>

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

      {/* Gewerbe-Hinweis:
          - Design/Layout der Box bleiben unverändert.
          - Ref sitzt auf dem äußeren Wrapper, damit scrollIntoView zuverlässig funktioniert.
          - pb-6 gibt "Luft" unten, damit die Box nicht an der Browser-UI klebt (Mobile). */}
      {showGewerbeHint ? (
        <div ref={gewerbeHintRef} className="mt-5">
          <div
            className="mb-[5px] rounded-2xl border border-brand-navy/15 bg-brand-navy/5 p-4"
            aria-live="polite"
          >
            <div className="text-sm font-semibold text-brand-navy">Gewerbeimmobilie?</div>

            <div className="mt-1 text-sm leading-relaxed text-brand-graphite">
              Frisia Immobilien konzentriert sich auf Wohnimmobilien und Grundstücke in Aurich &
              Ostfriesland. Wenn es um eine Gewerbeimmobilie geht, ist eine Bewertung meist sehr
              komplex: melde dich bitte persönlich – wir sagen dir sofort, wie wir helfen können.
            </div>

            <Link
              href="/kontakt"
              className="mt-3 inline-flex items-center rounded-xl border border-brand-navy/25 bg-white px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-navy/05"
            >
              Persönlich klären
            </Link>
          </div>
          <br />
        </div>
      ) : null}
    </div>
  )
}
