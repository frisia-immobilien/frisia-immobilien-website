"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

type IntroSlide = {
  key: string;
  kind: "intro";
  badge: string;
  eyebrow: string;
  title: string;
  copy: string;
  phoneHref: string;
  phoneLabel: string;
  phoneIconSrc: string;
  phoneIconAlt: string;
};

type StepSlide = {
  key: string;
  kind: "step";
  badge: string;
  title: string;
  copy: string;
  iconSrc: string;
  iconAlt: string;
};

type ProcessSlide = IntroSlide | StepSlide;

export default function Process9plus1MobileCarousel({
  slides,
}: {
  slides: readonly ProcessSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const scrollLockRef = useRef<number | null>(null);

  const isAtStart = activeIndex === 0;
  const isAtEnd = activeIndex === slides.length - 1;

  useLayoutEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    container.scrollTo({ left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    return () => {
      if (scrollLockRef.current !== null) {
        window.clearTimeout(scrollLockRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const onResize = () => {
      const target = container.children[activeIndex] as HTMLElement | undefined;
      if (!target) return;
      container.scrollTo({ left: target.offsetLeft, behavior: "auto" });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  const scrollToIndex = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;

    const target = container.children[index] as HTMLElement | undefined;
    if (!target) return;

    if (scrollLockRef.current !== null) {
      window.clearTimeout(scrollLockRef.current);
    }

    scrollLockRef.current = window.setTimeout(() => {
      scrollLockRef.current = null;
    }, 420);

    container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  const goToIndex = (index: number) => {
    setActiveIndex(index);
    scrollToIndex(index);
  };

  const onPrev = () => {
    if (isAtStart) return;
    goToIndex(activeIndex - 1);
  };

  const onNext = () => {
    if (isAtEnd) return;
    goToIndex(activeIndex + 1);
  };

  const onScroll = () => {
    if (scrollLockRef.current !== null) return;

    const container = carouselRef.current;
    if (!container) return;

    const slideWidth = container.clientWidth;
    if (!slideWidth) return;

    const nextIndex = Math.max(0, Math.min(slides.length - 1, Math.round(container.scrollLeft / slideWidth)));

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <div className="mt-8 max-w-full overflow-hidden md:hidden">
      <div className="relative overflow-hidden rounded-[30px] border border-[color:var(--color-brass)]/26 bg-white shadow-[0_18px_40px_rgba(27,48,64,0.07)]">
        <div
          ref={carouselRef}
          onScroll={onScroll}
          className="flex max-w-full items-stretch snap-x snap-mandatory overflow-x-auto scroll-smooth [overscroll-behavior-x:contain] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="9 plus 1 Schritte Carousel mobil"
        >
          {slides.map((slide) => (
            <article key={slide.key} className="flex w-full min-w-0 shrink-0 snap-start [scroll-snap-stop:always] p-4">
              {slide.kind === "intro" ? (
                <div className="flex h-full min-h-[320px] w-full min-w-0 flex-col rounded-[24px] bg-white p-5">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-navy)] text-[1.15rem] font-semibold text-white shadow-sm">
                      {slide.badge}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brackish)]/88">
                        {slide.eyebrow}
                      </p>
                      <h3 className="mt-1 text-[1.26rem] font-semibold leading-[1.28] text-[color:var(--color-navy)]">
                        {slide.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-5 text-[0.97rem] leading-[1.72] text-[color:var(--color-graphite)]">
                    {slide.copy}
                  </p>

                  <div className="mt-auto flex min-w-0 items-start gap-3 rounded-[20px] bg-[color:var(--color-section)]/45 p-4">
                    <Image
                      src={slide.phoneIconSrc}
                      alt={slide.phoneIconAlt}
                      width={56}
                      height={56}
                      className="h-12 w-12 shrink-0 object-contain"
                    />
                    <a href={slide.phoneHref} className="min-w-0 text-[1rem] font-semibold leading-[1.55] text-[color:var(--color-navy)] underline-offset-4">
                      {slide.phoneLabel}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[320px] w-full min-w-0 flex-col rounded-[24px] bg-white p-5">
                  <div className="inline-flex self-start rounded-full bg-[color:var(--color-section)] px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-navy)] shadow-sm ring-1 ring-[color:var(--color-brass)]/20">
                    {slide.badge}
                  </div>
                  <div className="mt-5 flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[color:var(--color-section)]/72 ring-1 ring-[color:var(--color-brass)]/16">
                      <Image
                        src={slide.iconSrc}
                        alt={slide.iconAlt}
                        width={60}
                        height={60}
                        className="h-[52px] w-[52px] shrink-0 object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[1.18rem] font-semibold leading-[1.3] text-[color:var(--color-navy)]">
                        {slide.title}
                      </h3>
                      <p className="mt-2.5 text-[0.97rem] leading-[1.72] text-[color:var(--color-graphite)]">
                        {slide.copy}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Vorheriger Schritt"
            disabled={isAtStart}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-brass)]/22 bg-white text-[1.55rem] font-light text-[color:var(--color-navy)] shadow-[0_8px_18px_rgba(27,48,64,0.12)] transition-opacity ${
              isAtStart ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div className="flex-1" />

          <button
            type="button"
            onClick={onNext}
            aria-label="Nächster Schritt"
            disabled={isAtEnd}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-brass)]/22 bg-white text-[1.55rem] font-light text-[color:var(--color-navy)] shadow-[0_8px_18px_rgba(27,48,64,0.12)] transition-opacity ${
              isAtEnd ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <div className="mt-2" aria-label="9 plus 1 Fortschritt mobil">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => goToIndex(index)}
              aria-label={`${slide.title} anzeigen`}
              aria-current={index === activeIndex ? "true" : undefined}
              className="flex h-6 w-6 items-center justify-center rounded-full"
            >
              <span
                aria-hidden="true"
                className={`rounded-full transition-all ${
                  index === activeIndex
                    ? "h-2.5 w-5 bg-[color:var(--color-navy)]"
                    : "h-2 w-2 bg-[color:var(--color-brass)]/35"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]/92">
          {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
