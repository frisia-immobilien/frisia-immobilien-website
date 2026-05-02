import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import JsonLd from "@/components/seo/JsonLd";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import {
  SELLING_SITUATION_HUB,
  SITUATION_CTA,
  type SellingSituation,
  getRelatedSituations,
} from "@/lib/selling-situations/data";
import {
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold underline decoration-[color:var(--color-brass)]/60 underline-offset-4 hover:text-[color:var(--color-brackish)]"
    >
      {children}
    </Link>
  );
}

function AttentionIcon() {
  return (
    <span
      aria-hidden="true"
      className="mt-[0.58rem] inline-flex h-2.5 w-2.5 shrink-0 rounded-full border border-[color:var(--color-navy)]/30 bg-[color:var(--color-navy)]/25"
    />
  );
}

export default function SellingSituationDetail({ situation }: { situation: SellingSituation }) {
  const related = getRelatedSituations(situation);
  const canonical = absoluteUrl(situation.path);
  const breadcrumbJsonLd = createBreadcrumbListJsonLd(situation.path, [
    { name: "Startseite", item: "/" },
    { name: "Verkaufssituationen", item: SELLING_SITUATION_HUB.path },
    { name: situation.headline, item: canonical },
  ]);
  const webPageJsonLd = createWebPageJsonLd({
    path: situation.path,
    name: situation.headline,
    description: situation.subline,
  });

  return (
    <main id="main-content" className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />

      <MobileHeroSection
        eyebrow={situation.eyebrow}
        title={situation.headline}
        description={situation.subline}
        imageSrc={situation.image}
        imageAlt={situation.imageAlt}
        imagePosition="center"
        primaryCta={{ href: "/immobilienbewertung-aurich", label: "Situation einordnen" }}
        secondaryCta={{ href: "/haus-verkaufen-aurich", label: "Hausverkauf planen" }}
        ariaLabel={situation.eyebrow}
        imageHeightClassName="h-[clamp(350px,calc(100svh-22rem),430px)]"
        titleClassName="max-w-[12.5ch] text-[clamp(1.72rem,8vw,2.12rem)]"
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image
          src={situation.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-88"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.76)_34%,rgba(255,255,255,0.24)_64%,rgba(255,255,255,0.08)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-12">
          <div className="max-w-[58rem]">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.17em] text-[color:var(--color-brackish)]">
              {situation.eyebrow}
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-[clamp(2.55rem,5vw,5rem)] leading-[1.02] text-[color:var(--color-navy)]">
              {situation.headline}
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-3xl text-[1.18rem] leading-[1.68] text-[color:var(--color-navy)] md:text-[1.38rem]">
              {situation.subline}
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
                Hausverkauf planen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(19rem,0.28fr)] lg:px-12">
          <article className="space-y-5 text-base leading-[1.82] text-[color:var(--color-graphite)] md:text-lg">
            {situation.intro.map((paragraph, index) =>
              index < 3 ? (
                <p key={paragraph} className="flex gap-3.5">
                  <AttentionIcon />
                  <span>{paragraph}</span>
                </p>
              ) : (
                <p key={paragraph}>{paragraph}</p>
              ),
            )}
            <p>
              Eine belastbare <InlineLink href="/immobilienbewertung-aurich">Immobilienbewertung</InlineLink>{" "}
              schafft zuerst Klarheit über Wert, Zustand und Spielraum. Danach lässt sich der{" "}
              <InlineLink href="/haus-verkaufen-aurich">Hausverkauf</InlineLink> so vorbereiten, dass Preis,
              Unterlagen und Vermarktung zusammenpassen.
            </p>
            <p>
              Frisia Immobilien verbindet diese Einordnung mit der Erfahrung als{" "}
              <InlineLink href="/immobilienmakler-aurich">Immobilienmakler in Aurich</InlineLink>. Weitere
              Lebenslagen findest du im Bereich für{" "}
              <InlineLink href={SELLING_SITUATION_HUB.path}>Verkaufssituationen</InlineLink>.
            </p>
          </article>

          <aside className="h-fit rounded-xl border border-[color:var(--color-brass)]/30 bg-[color:var(--color-section)] p-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
              Nächster Schritt
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-2xl leading-tight text-[color:var(--color-navy)]">
              Erst einordnen, dann entscheiden
            </h2>
            <p className="mt-4 text-base leading-7 text-[color:var(--color-graphite)]">
              Der richtige Verkauf beginnt mit einer realistischen Einschätzung, nicht mit einer Anzeige.
            </p>
            <Link
              href="/immobilienbewertung-aurich"
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white"
            >
              Bewertung starten
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-tight text-[color:var(--color-navy)] md:text-[2.55rem]">
            Weitere Situationen:
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-6 py-5 transition hover:border-[color:var(--color-brass)]"
              >
                <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                  {item.eyebrow}
                </span>
                <span className="mt-2 block text-lg font-semibold leading-snug text-[color:var(--color-navy)]">
                  {item.headline}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-navy)] py-14 text-white md:py-16">
        <div className="mx-auto grid w-full max-w-[1240px] gap-7 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-center lg:px-12">
          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-white/70">
              Fundierte Einschätzung
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2rem] leading-tight md:text-[2.7rem]">
              {SITUATION_CTA}
            </h2>
          </div>
          <Link
            href="/immobilienbewertung-aurich"
            className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]"
          >
            Immobilienbewertung starten
          </Link>
        </div>
      </section>
    </main>
  );
}
