"use client";

import { useRef, useState } from "react";

type Testimonial = {
  name: string;
  context: string;
  text: string;
  stars: 5;
};

const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: "S. und M.K., Aurich",
    context: "Verkauf Einfamilienhaus",
    stars: 5,
    text: "Wir wollten vor allem Sicherheit und einen ruhigen Ablauf. Genau das haben wir bekommen: klare Bewertung, klare Schritte und ein rechtssicherer Abschluss ohne unnötige Unruhe.",
  },
  {
    name: "H.T., Wiesmoor",
    context: "Erbfall mit Abstimmungsbedarf",
    stars: 5,
    text: "Die strukturierte Vorgehensweise hat uns als Familie sehr geholfen. Es gab eine nachvollziehbare Entscheidungsgrundlage und am Ende eine Lösung, die alle mittragen konnten.",
  },
  {
    name: "B.R., Norden",
    context: "Diskreter Verkauf",
    stars: 5,
    text: "Uns war Vertraulichkeit besonders wichtig. Frisia hat genau passende Interessenten angesprochen und den gesamten Prozess sehr kontrolliert geführt.",
  },
  {
    name: "E.P., Südbrookmerland",
    context: "Kaufbegleitung",
    stars: 5,
    text: "Als Käufer haben wir eine ehrliche Einordnung von Lage und Preis bekommen. Die Kommunikation war klar und zuverlässig, ohne Druck und ohne leere Versprechen.",
  },
  {
    name: "J.W., Ihlow",
    context: "Verkauf vor Ruhestand",
    stars: 5,
    text: "Die Kombination aus moderner Vermarktung und persönlicher Verlässlichkeit hat uns überzeugt. Wir hatten jederzeit einen festen Ansprechpartner und volle Transparenz.",
  },
];

export default function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  const handleMobileScroll = () => {
    const container = mobileScrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    let closest = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    Array.from(container.children).forEach((node, idx) => {
      const el = node as HTMLElement;
      const distance = Math.abs(el.offsetLeft - scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closest = idx;
      }
    });

    if (closest !== active) {
      setActive(closest);
    }
  };

  const goTo = (index: number) => {
    setActive(index);
    const container = mobileScrollRef.current;
    if (!container) return;
    const target = container.children[index] as HTMLElement | undefined;
    if (!target) return;
    container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  const onPrev = () => setActive((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const onNext = () => setActive((i) => (i + 1) % TESTIMONIALS.length);
  const visible = [0, 1, 2].map((offset) => TESTIMONIALS[(active + offset) % TESTIMONIALS.length]);

  return (
    <div className="relative rounded-3xl border border-[color:var(--color-brass)]/25 bg-white p-6 md:p-8">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Vorherige Bewertung"
        className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-brass)]/30 bg-white text-[color:var(--color-navy)] shadow-sm md:flex"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Nächste Bewertung"
        className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-brass)]/30 bg-white text-[color:var(--color-navy)] shadow-sm md:flex"
      >
        ›
      </button>

      <div
        ref={mobileScrollRef}
        onScroll={handleMobileScroll}
        className="md:hidden -mx-1 mt-0 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {TESTIMONIALS.map((item) => (
          <article
            key={`${item.name}-${item.context}`}
            className="w-[85%] shrink-0 snap-start rounded-2xl border border-white/15 bg-[#1b3040] p-8"
          >
            <p
              className="text-[0.95rem] tracking-[0.08em] text-[color:var(--color-brass)]/35"
              style={{ textShadow: "0 0 0.7px rgba(255,255,255,0.95), 0 0 1.2px rgba(255,255,255,0.85)" }}
              aria-label="5 von 5 Sternen"
            >
              {"★★★★★"}
            </p>
            <p className="mt-3 text-[0.96rem] leading-[1.7] text-white/95">{item.text}</p>
            <p className="mt-4 text-[0.93rem] font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-[0.84rem] text-white/80">{item.context}</p>
          </article>
        ))}
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-3">
        {visible.map((item) => (
          <article
            key={`${item.name}-${item.context}`}
            className="rounded-2xl border border-white/15 bg-[#1b3040] p-10"
          >
            <p
              className="text-[0.95rem] tracking-[0.08em] text-[color:var(--color-brass)]/35"
              style={{ textShadow: "0 0 0.7px rgba(255,255,255,0.95), 0 0 1.2px rgba(255,255,255,0.85)" }}
              aria-label="5 von 5 Sternen"
            >
              {"★★★★★"}
            </p>
            <p className="mt-3 text-[0.96rem] leading-[1.7] text-white/95">{item.text}</p>
            <p className="mt-4 text-[0.93rem] font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-[0.84rem] text-white/80">{item.context}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {TESTIMONIALS.map((entry, idx) => (
          <button
            key={entry.name}
            type="button"
            onClick={() => goTo(idx)}
            aria-label={`Bewertung ${idx + 1} anzeigen`}
            aria-current={idx === active ? "true" : undefined}
            className="flex h-12 w-12 items-center justify-center rounded-full"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                idx === active ? "bg-[color:var(--color-navy)]" : "bg-[color:var(--color-brass)]/35"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
