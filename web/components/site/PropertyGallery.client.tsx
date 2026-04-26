"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PropertyDetailImage } from "@/lib/propstack";

type PropertyGalleryProps = {
  images: PropertyDetailImage[];
  propertyTitle: string;
  publicLocation: string;
  galleryCountLabel: string | null;
  propertyTypeLabel: string | null;
};

function hasOverflowingCaption(text: string | null | undefined) {
  return (text ?? "").trim().length > 48;
}

function GalleryCaption({
  text,
}: {
  text: string;
}) {
  const showMoreHint = hasOverflowingCaption(text);

  return (
    <div className="max-w-[75%]">
      <p
        className="overflow-hidden text-sm text-white/92 sm:text-[0.95rem]"
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
        }}
      >
        {text}
      </p>
      {showMoreHint ? (
        <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white/78 sm:text-[0.7rem]">
          + Weiterlesen
        </p>
      ) : null}
    </div>
  );
}

function Chevron({
  direction,
  className,
}: {
  direction: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"}
      />
    </svg>
  );
}

function GalleryTile({
  image,
  propertyTitle,
  layout,
  sizes,
  onOpen,
}: {
  image: PropertyDetailImage;
  propertyTitle: string;
  layout: { wrapper: string; aspect?: string };
  sizes: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${layout.wrapper} group relative block h-full overflow-hidden rounded-[1.25rem] bg-[color:var(--color-section)]/55 text-left`}
    >
      <div className={`relative h-full ${layout.aspect ?? ""}`}>
        <Image
          src={image.url}
          alt={image.title || propertyTitle}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(10,23,37,0.48)] to-transparent" />
        <div className="absolute inset-x-4 bottom-4">
          <div className="max-w-full">
            <p
              className="overflow-hidden text-sm text-white/92 sm:text-base"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {image.title || propertyTitle}
            </p>
            {hasOverflowingCaption(image.title || propertyTitle) ? (
              <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-white/78 sm:text-[0.7rem]">
                + Weiterlesen
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function PropertyGallery({
  images,
  propertyTitle,
  publicLocation,
  galleryCountLabel,
  propertyTypeLabel,
}: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null) return current;
          return (current - 1 + images.length) % images.length;
        });
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null) return current;
          return (current + 1) % images.length;
        });
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length]);

  if (images.length === 0) return null;

  const mainImage = images[0];
  const supportingImages = images.slice(1, 5);
  const hasSupportingImages = supportingImages.length > 0;
  const desktopGalleryHeightClass = "lg:h-[31rem]";

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <>
      <div className="mt-8 w-full">
        <div className={`grid gap-3 ${hasSupportingImages ? "lg:grid-cols-[1.7fr_0.92fr] lg:items-stretch" : ""}`}>
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className={`group relative block overflow-hidden rounded-[1.6rem] bg-[color:var(--color-section)]/55 text-left ${hasSupportingImages ? `${desktopGalleryHeightClass}` : ""}`}
          >
            <div className="relative aspect-[16/11] h-full lg:aspect-auto">
              <Image
                src={mainImage.url}
                alt={mainImage.title || propertyTitle}
                fill
                priority
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-3">
                {galleryCountLabel ? (
                  <span className="inline-flex items-center rounded-full border border-[color:var(--color-brass)]/24 bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-navy)] shadow-[0_12px_24px_rgba(15,23,42,0.10)]">
                    {galleryCountLabel}
                  </span>
                ) : null}
                {propertyTypeLabel ? (
                  <span className="inline-flex items-center rounded-full border border-[color:var(--color-brass)]/24 bg-[color:var(--color-navy)] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
                    {propertyTypeLabel}
                  </span>
                ) : null}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgba(10,23,37,0.58)] to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-white">
                <GalleryCaption text={mainImage.title || propertyTitle} />
                <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  {publicLocation}
                </span>
              </div>
            </div>
          </button>

          {hasSupportingImages ? (
            <div className={`relative grid grid-cols-2 gap-3 lg:grid-cols-2 lg:grid-rows-2 ${desktopGalleryHeightClass}`}>
              {supportingImages.map((image, index) => (
                <GalleryTile
                  key={image.url}
                  image={image}
                  propertyTitle={propertyTitle}
                  layout={{ wrapper: "h-full", aspect: "aspect-[4/3] lg:aspect-auto" }}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 24vw"
                  onOpen={() => setActiveIndex(index + 1)}
                />
              ))}
              <button
                type="button"
                onClick={() => setActiveIndex(0)}
                className="absolute bottom-5 right-5 z-[2] hidden items-center gap-2 rounded-2xl bg-white/92 px-4 py-3 text-sm font-semibold text-[color:var(--color-navy)] shadow-[0_12px_24px_rgba(15,23,42,0.14)] transition-colors hover:bg-white lg:inline-flex"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" />
                </svg>
                Alle Fotos anzeigen
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(7,16,27,0.86)] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Bildergalerie"
          onClick={() => setActiveIndex(null)}
        >
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-0 top-[-3rem] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/16"
              aria-label="Galerie schließen"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                <path strokeLinecap="round" d="M6 6 18 18" />
                <path strokeLinecap="round" d="M18 6 6 18" />
              </svg>
            </button>

            <div className="mb-5 flex flex-col items-center text-center text-white">
              <p className="max-w-3xl text-lg font-medium text-white/96 sm:text-[1.15rem]">
                {activeImage.title || propertyTitle}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[2rem]">
              <div className="relative aspect-[16/10] max-h-[82vh]">
                <Image
                  src={activeImage.url}
                  alt={activeImage.title || propertyTitle}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current === null ? current : (current - 1 + images.length) % images.length))}
                className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/16"
                aria-label="Vorheriges Bild"
              >
                <Chevron direction="left" className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveIndex((current) => (current === null ? current : (current + 1) % images.length))}
                className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/16"
                aria-label="Nächstes Bild"
              >
                <Chevron direction="right" className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {images.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/36 hover:bg-white/55"}`}
                  aria-label={`Bild ${index + 1} anzeigen`}
                  aria-pressed={index === activeIndex}
                />
              ))}
            </div>

            <div className="mt-4 flex justify-center">
              <p className="text-sm font-semibold text-white/78">
                {String((activeIndex ?? 0) + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
