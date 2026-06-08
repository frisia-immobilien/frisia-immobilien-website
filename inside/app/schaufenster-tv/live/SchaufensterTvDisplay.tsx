'use client'

import {useEffect, useMemo, useRef, useState} from 'react'

type TvMetric = {
  label: string
  value: string
}

type TvBroker = {
  name: string
  position?: string | null
  image_url?: string | null
  phone?: string | null
}

type TvItem = {
  type: 'property' | 'custom_slide'
  id: number
  propstack_id?: number
  title: string
  subtitle?: string | null
  image_url: string
  gallery_images?: string[]
  location?: string | null
  city?: string | null
  property_type?: string | null
  price_label?: string | null
  price_text?: string | null
  metrics?: TvMetric[]
  energy_metrics?: TvMetric[]
  broker?: TvBroker | null
}

type TvResponse = {
  ok: boolean
  data?: {
    items: TvItem[]
    count: number
    generated_at: string
  }
  error?: string
}

const SLIDE_DURATION_MS = 10000
const FALLBACK_BRAND_SLIDE: TvItem = {
  type: 'custom_slide',
  id: 0,
  title: 'Frisia Immobilien',
  subtitle: 'Immobilienverkauf in Aurich und Ostfriesland',
  image_url: '',
}

function shuffleItems(items: TvItem[]) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
  }
  return copy
}

function itemKey(item: TvItem) {
  return `${item.type}-${item.id}`
}

function buildRotation(items: TvItem[]) {
  const properties = shuffleItems(items.filter((item) => item.type === 'property'))
  const slides = shuffleItems(items.filter((item) => item.type === 'custom_slide'))

  if (!properties.length) {
    return slides
  }
  if (!slides.length) {
    return properties
  }

  const maxSlides = Math.min(slides.length, Math.max(1, Math.ceil(properties.length / 4)))
  const selectedSlides = slides.slice(0, maxSlides)
  const rotation: TvItem[] = []
  let slideIndex = 0

  properties.forEach((property, propertyIndex) => {
    rotation.push(property)
    if ((propertyIndex + 1) % 4 === 0 && slideIndex < selectedSlides.length) {
      rotation.push(selectedSlides[slideIndex])
      slideIndex += 1
    }
  })

  while (slideIndex < selectedSlides.length) {
    rotation.push(selectedSlides[slideIndex])
    slideIndex += 1
  }

  return rotation
}

function shortenTitle(title: string) {
  return title.replace(/\s+/g, ' ').trim()
}

function titleSizeClass(title: string) {
  const length = title.length
  if (length > 118) {
    return 'tv-title tv-title-long'
  }
  if (length > 78) {
    return 'tv-title tv-title-medium'
  }
  return 'tv-title'
}

function itemImages(item: TvItem) {
  return item.gallery_images?.length ? item.gallery_images : item.image_url ? [item.image_url] : []
}

function isMissingMetric(value: string) {
  const normalized = value.trim().toLowerCase()
  return normalized === '' || normalized === 'k. a.' || normalized === 'k.a.' || normalized === 'undefined'
}

function energySummary(metrics: TvMetric[]) {
  const energyClass = metrics.find((metric) => metric.label.toLowerCase() === 'klasse')
  if (!energyClass || isMissingMetric(energyClass.value)) {
    return null
  }

  const energyValue = metrics.find((metric) => metric.label.toLowerCase() === 'kennwert')
  return {
    classValue: energyClass.value,
    value: energyValue && !isMissingMetric(energyValue.value) ? energyValue.value : null,
  }
}

export function SchaufensterTvDisplay() {
  const [items, setItems] = useState<TvItem[]>([])
  const [index, setIndex] = useState(0)
  const currentItemKey = useRef('')

  useEffect(() => {
    let cancelled = false

    async function loadItems() {
      try {
        const response = await fetch(`/api/schaufenster/items.php?t=${Date.now()}`, {cache: 'no-store'})
        const payload = (await response.json()) as TvResponse
        if (!response.ok || !payload.ok || !payload.data) {
          throw new Error(payload.error || 'Schaufenster-Daten konnten nicht geladen werden.')
        }
        if (!cancelled) {
          const rotation = buildRotation(payload.data.items)
          if (rotation.length > 1 && itemKey(rotation[0]) === currentItemKey.current) {
            const firstItem = rotation.shift()
            if (firstItem) {
              rotation.push(firstItem)
            }
          }
          setItems(rotation)
          setIndex(0)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error(loadError)
        }
      }
    }

    void loadItems()
    const refresh = window.setInterval(() => void loadItems(), 1000 * 60 * 10)
    return () => {
      cancelled = true
      window.clearInterval(refresh)
    }
  }, [])

  useEffect(() => {
    if (items.length <= 1) return
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, SLIDE_DURATION_MS)
    return () => window.clearInterval(interval)
  }, [items.length])

  useEffect(() => {
    if (!items.length) return
    const nextItem = items[(index + 1) % items.length]
    itemImages(nextItem).slice(0, 3).forEach((imageUrl) => {
      const image = new Image()
      image.src = imageUrl
    })
  }, [index, items])

  const item = items[index] ?? FALLBACK_BRAND_SLIDE
  const metrics = useMemo(
    () => item?.metrics?.filter((metric) => !isMissingMetric(metric.value)).slice(0, 4) ?? [],
    [item],
  )
  const energy = useMemo(() => energySummary(item?.energy_metrics ?? []), [item])

  const isProperty = item.type === 'property'
  const galleryImages = itemImages(item)
  const mainImage = galleryImages[0] || item.image_url
  const displayTitle = shortenTitle(item.title)
  const contactPhone = item.broker?.phone || '04941 986770-0'

  useEffect(() => {
    currentItemKey.current = itemKey(item)
  }, [item])

  if (!mainImage && !isProperty) {
    return (
      <main className="tv-screen">
        <section className="tv-brand-slide">
          <div className="tv-brand-mark">
            <img src="/logo.svg" alt="Frisia Immobilien" />
          </div>
          <p>Immobilienverkauf in Aurich und Ostfriesland</p>
          <h1>Frisia Immobilien</h1>
          <strong>Fundierte Bewertung. Klare Preisstrategie. Strukturierter Verkaufsprozess.</strong>
          <span>04941 986770-0 · frisia-immobilien.de</span>
        </section>
      </main>
    )
  }

  return (
    <main className="tv-screen">
      <style
        dangerouslySetInnerHTML={{
          __html:
            '.tv-board-header{background:#1b3040!important;border:0!important;display:block!important;height:8px!important;padding:0!important}.tv-board-header>*{display:none!important}',
        }}
      />
      <section className="tv-slide" key={`${itemKey(item)}-${index}`}>
        <div className="tv-board">
          <header className="tv-board-header" aria-hidden="true" />

          <div className="tv-board-content">
            <div className="tv-image-pane">
              <div className="tv-photo-grid">
                <div className="tv-image-frame tv-main-frame">
                  <img className="tv-main-image" src={mainImage} alt="" decoding="async" />
                </div>
              </div>
              <div className="tv-image-vignette" />
            </div>

            <aside className="tv-info-pane">
              <div className="tv-info-main">
                <p className="tv-location">{item.location || item.city || 'Frisia Immobilien'}</p>
                <h1 className={titleSizeClass(displayTitle)}>{displayTitle}</h1>
                {item.subtitle ? <p className="tv-subtitle">{item.subtitle}</p> : null}

                {isProperty ? (
                  <>
                    <div className="tv-divider" />
                    <div className="tv-price">
                      <span>{item.price_label || 'Preis'}</span>
                      <strong>{item.price_text || 'Preis auf Anfrage'}</strong>
                    </div>
                    <div className="tv-metrics">
                      {metrics.map((metric) => (
                        <div key={metric.label}>
                          <span>{metric.label}</span>
                          <strong>{metric.value}</strong>
                        </div>
                      ))}
                    </div>
                    {energy ? (
                      <div className="tv-energy-block">
                        <strong>Energieklasse {energy.classValue}</strong>
                        {energy.value ? <span>{energy.value}</span> : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="tv-custom-copy">Regional. Persönlich. Frisia Immobilien.</p>
                )}
              </div>

              <div className="tv-info-corner">
                <img className="tv-contact-logo" src="/logo.svg" alt="Frisia Immobilien" />
                <div className="tv-contact-details">
                  {isProperty && item.broker ? (
                    <div className="tv-broker-card">
                      {item.broker.image_url ? <img src={item.broker.image_url} alt="" /> : null}
                      <div>
                        <span>Ihr Ansprechpartner</span>
                        <strong>{item.broker.name}</strong>
                        {item.broker.position ? <small>{item.broker.position}</small> : null}
                      </div>
                    </div>
                  ) : (
                    <div className="tv-broker-card tv-broker-card-fallback">
                      <div>
                        <span>Ihr Ansprechpartner</span>
                        <strong>Frisia Immobilien</strong>
                      </div>
                    </div>
                  )}
                  <p className="tv-contact-phone">{contactPhone}</p>
                  <p className="tv-contact-website">frisia-immobilien.de</p>
                </div>
              </div>
            </aside>
          </div>

          <footer className="tv-board-footer">
            <span>Frisia Immobilien</span>
            <span>Aurich · Ostfriesland</span>
          </footer>
        </div>
      </section>
    </main>
  )
}
