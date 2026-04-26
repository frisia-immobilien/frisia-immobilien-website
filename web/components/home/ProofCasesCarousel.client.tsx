"use client";

import { useMemo, useRef, useState } from "react";

type ProofCaseItem = {
  title: string;
  setup: string;
  approach: string;
  outcome: string;
};

type Props = {
  items: readonly ProofCaseItem[];
};

export default function ProofCasesCarousel({ items }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const snapPoints = useMemo(() => items.map((_, idx) => idx), [items]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const child = container.children[index] as HTMLElement | undefined;
    if (!child) return;
    container.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    const container = containerRef.current;
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

    if (closest !== activeIndex) {
      setActiveIndex(closest);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="mt-8 -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 md:hidden"
      >
        {items.map((item) => (
          <article
            key={item.title}
            className="w-[85%] shrink-0 snap-start rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5"
          >
            <h3 className="text-[1rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">{item.title}</h3>
            <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.setup}</p>
            <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.approach}</p>
            <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.outcome}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 md:hidden" aria-label="Fallbeispiele Navigation">
        {snapPoints.map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={`Zu Fall ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className="flex h-12 w-12 items-center justify-center rounded-full"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                activeIndex === index
                  ? "bg-[color:var(--color-navy)]"
                  : "bg-[color:var(--color-brass)]/35 hover:bg-[color:var(--color-brass)]/55"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mt-8 hidden gap-4 md:grid md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-5">
            <h3 className="text-[1rem] font-semibold leading-[1.5] text-[color:var(--color-navy)]">{item.title}</h3>
            <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.setup}</p>
            <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.approach}</p>
            <p className="mt-3 text-[0.94rem] leading-[1.65] text-[color:var(--color-graphite)]">{item.outcome}</p>
          </article>
        ))}
      </div>
    </>
  );
}
