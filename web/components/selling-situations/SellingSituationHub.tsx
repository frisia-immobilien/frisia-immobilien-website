import Image from "next/image";
import Link from "next/link";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import {
  SELLING_SITUATION_HUB,
  SELLING_SITUATIONS,
} from "@/lib/selling-situations/data";

const featuredKeys = ["alter", "erbschaft", "diskret"] as const;
const featuredSituations = SELLING_SITUATIONS.filter((situation) =>
  featuredKeys.includes(situation.key as (typeof featuredKeys)[number]),
);
const otherSituations = SELLING_SITUATIONS.filter(
  (situation) => !featuredKeys.includes(situation.key as (typeof featuredKeys)[number]),
);

export default function SellingSituationHub() {
  return (
    <main id="main-content" className="bg-white">
      <MobileHeroSection
        eyebrow={SELLING_SITUATION_HUB.eyebrow}
        title={SELLING_SITUATION_HUB.headline}
        description={SELLING_SITUATION_HUB.subline}
        imageSrc={SELLING_SITUATION_HUB.image}
        imageAlt={SELLING_SITUATION_HUB.imageAlt}
        imagePosition="center"
        primaryCta={{ href: "/immobilienbewertung-aurich", label: "Situation einordnen" }}
        secondaryCta={{ href: "/haus-verkaufen-aurich", label: "Hausverkauf verstehen" }}
        ariaLabel={SELLING_SITUATION_HUB.eyebrow}
        imageHeightClassName="h-[clamp(350px,calc(100svh-22rem),430px)]"
        titleClassName="max-w-[13.5ch] text-[clamp(1.7rem,7.6vw,2.08rem)]"
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image
          src={SELLING_SITUATION_HUB.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-88"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.8)_34%,rgba(255,255,255,0.3)_64%,rgba(255,255,255,0.1)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-12">
          <div className="max-w-[58rem]">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.17em] text-[color:var(--color-brackish)]">
              {SELLING_SITUATION_HUB.eyebrow}
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-[clamp(2.55rem,5vw,5.1rem)] leading-[1.02] text-[color:var(--color-navy)]">
              {SELLING_SITUATION_HUB.headline}
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-3xl text-[1.18rem] leading-[1.68] text-[color:var(--color-navy)] md:text-[1.38rem]">
              {SELLING_SITUATION_HUB.subline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/immobilienbewertung-aurich"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]"
              >
                Situation einordnen
              </Link>
              <Link
                href="/haus-verkaufen-aurich"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/86 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]"
              >
                Hausverkauf verstehen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8">
          <div className="space-y-5 text-base leading-[1.82] text-[color:var(--color-graphite)] md:text-lg">
            {SELLING_SITUATION_HUB.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              Eine fundierte{" "}
              <Link
                href="/immobilienbewertung-aurich"
                className="font-semibold underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]"
              >
                Immobilienbewertung in Aurich
              </Link>{" "}
              schafft die Grundlage für den nächsten Schritt. Danach lässt sich der{" "}
              <Link
                href="/haus-verkaufen-aurich"
                className="font-semibold underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]"
              >
                Hausverkauf in Aurich
              </Link>{" "}
              mit einem erfahrenen{" "}
              <Link
                href="/immobilienmakler-aurich"
                className="font-semibold underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]"
              >
                Immobilienmakler in Aurich
              </Link>{" "}
              sauber vorbereiten.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Erste Entscheidung
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
              Häufige Verkaufssituationen
            </h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredSituations.map((situation) => (
              <Link
                key={situation.path}
                href={situation.path}
                className="group overflow-hidden rounded-xl border border-[color:var(--color-brass)]/30 bg-white shadow-[0_18px_54px_-48px_rgba(27,48,64,0.5)] transition hover:-translate-y-1 hover:border-[color:var(--color-brass)]"
              >
                <span className="relative block aspect-[4/3] overflow-hidden">
                  <Image
                    src={situation.image}
                    alt={situation.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.46)_34%,rgba(255,255,255,0.12)_62%,rgba(255,255,255,0)_100%)]"
                  />
                </span>
                <span className="block px-6 py-5">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                    {situation.eyebrow}
                  </span>
                  <span className="mt-3 block text-xl font-semibold leading-tight text-[color:var(--color-navy)]">
                    {situation.headline}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-tight text-[color:var(--color-navy)] md:text-[2.55rem]">
            Weitere Situationen
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {otherSituations.map((situation) => (
              <Link
                key={situation.path}
                href={situation.path}
                className="rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-6 py-5 transition hover:border-[color:var(--color-brass)] hover:bg-[color:var(--color-section)]"
              >
                <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                  {situation.eyebrow}
                </span>
                <span className="mt-2 block text-lg font-semibold leading-snug text-[color:var(--color-navy)]">
                  {situation.headline}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
