import Image from "next/image";
import type { ReactNode } from "react";

type MobileHeroCta = {
  href: string;
  label: string;
  sublabel?: string;
};

type MobileHeroSectionProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  imageQuality?: number;
  primaryCta?: MobileHeroCta;
  secondaryCta?: MobileHeroCta;
  trustItems?: readonly string[];
  ariaLabel?: string;
  imageHeightClassName?: string;
  titleClassName?: string;
};

export default function MobileHeroSection({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  imagePosition = "center",
  imageQuality,
  primaryCta,
  secondaryCta,
  trustItems = [],
  ariaLabel,
  imageHeightClassName = "h-[clamp(410px,calc(100svh-17rem),470px)]",
  titleClassName = "max-w-[11.5ch] text-[clamp(1.8rem,8.6vw,2.25rem)]",
}: MobileHeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#F4F2EC] md:hidden" aria-label={ariaLabel ?? eyebrow}>
      <div className={`relative overflow-hidden ${imageHeightClassName}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={imageQuality}
          className="object-cover"
          style={{ objectPosition: imagePosition }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.18)_38%,rgba(255,255,255,0)_74%)]" />

        <div className="relative z-10 px-[1.65rem] pt-9">
          <div className="relative isolate max-w-[20rem]">
            <div className="pointer-events-none absolute -inset-x-3 -inset-y-4 -z-10 bg-[linear-gradient(105deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0)_75%,rgba(255,255,255,0)_100%)] blur-[1px]" />
            <p className="max-w-[16rem] text-[0.66rem] font-semibold uppercase leading-[1.65] tracking-[0.22em] text-[color:var(--color-navy)]/78">
              {eyebrow}
            </p>
            <div className={`mt-6 font-[family-name:var(--font-playfair)] leading-[0.98] tracking-normal text-[color:var(--color-navy)] ${titleClassName}`}>
              {title}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white px-[1.65rem] pb-4 pt-5">
        <div className="max-w-[22rem] border-l-[5px] border-[color:var(--color-brass)] pl-5 text-[0.76rem] leading-[1.42] text-[color:var(--color-graphite)]">
          {description}
        </div>

        {primaryCta ? (
          <div className={`mt-5 grid gap-2.5 ${secondaryCta ? "grid-cols-[1.25fr_1fr]" : "grid-cols-1"}`}>
            <a
              href={primaryCta.href}
              className="inline-flex min-h-[3.75rem] items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-4 py-3 text-center text-[1rem] font-semibold leading-tight text-white shadow-[0_18px_40px_-28px_rgba(27,48,64,0.78)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              {primaryCta.label}
            </a>
            {secondaryCta ? (
              <a
                href={secondaryCta.href}
                className="inline-flex min-h-[3.75rem] flex-col items-center justify-center whitespace-nowrap rounded-xl border border-[color:var(--color-brass)]/55 bg-white px-[0.55rem] py-2.5 text-center font-semibold leading-tight text-[color:var(--color-navy)] shadow-[0_16px_46px_-36px_rgba(27,48,64,0.55)] transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                {secondaryCta.sublabel ? (
                  <>
                    <span className="text-[clamp(0.65rem,2.84vw,0.78rem)]">{secondaryCta.label}</span>
                    <span className="mt-1 text-[clamp(0.8rem,3.55vw,0.93rem)]">{secondaryCta.sublabel}</span>
                  </>
                ) : (
                  <span className="text-[clamp(0.8rem,3.55vw,0.93rem)]">{secondaryCta.label}</span>
                )}
              </a>
            ) : null}
          </div>
        ) : null}

        {trustItems.length > 0 ? (
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-1 text-[0.6rem] font-semibold leading-none text-[color:var(--color-navy)]">
            {trustItems.map((item) => (
              <li key={item} className="flex items-center gap-1 whitespace-nowrap">
                <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border border-[color:var(--color-navy)]/70 text-[color:var(--color-navy)]">
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-2 w-2" fill="none">
                    <path d="m4 8 2.4 2.4L12 5.4" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
