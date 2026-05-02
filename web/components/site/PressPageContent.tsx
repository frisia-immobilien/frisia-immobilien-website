import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import {
  PHONE_DISPLAY,
  PHONE_HREF,
  SITE_URL,
  absoluteUrl,
  createArticleJsonLd,
  createBreadcrumbListJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

export const PRESS_HERO_IMAGE = "/images/presse/presse-hero-frisia.webp";
export const PRESS_PAGE_TITLE = "Pressebereich von Frisia Immobilien";
export const PRESS_PAGE_DESCRIPTION =
  "Presseinformationen, Ansprechpartner und aktuelle Hinweise von Frisia Immobilien in Aurich und Ostfriesland.";

type PressPageContentProps = {
  path: "/presse";
};

const pressCards = [
  {
    title: "Presseanfragen",
    copy: "Anfragen zu Frisia Immobilien, regionalen Immobilienthemen oder Einschätzungen zum Markt in Aurich und Ostfriesland.",
  },
  {
    title: "Regionale Einordnung",
    copy: "Fachliche Perspektiven zu Immobilienbewertung, Vermarktung und Verkaufsprozessen im ostfriesischen Markt.",
  },
  {
    title: "Presseberichte",
    copy: "Veröffentlichungen, Medienhinweise und redaktionelle Beiträge über Frisia Immobilien werden hier gebündelt.",
  },
] as const;

const relatedLinks = [
  { href: "/maklerhaus", label: "Das Maklerhaus" },
  { href: "/immobilienmakler-aurich", label: "Immobilienmakler Aurich" },
  { href: "/kontakt", label: "Presse- und Kontaktanfrage" },
] as const;

export default function PressPageContent({ path }: PressPageContentProps) {
  const breadcrumbJsonLd = createBreadcrumbListJsonLd(path, [
    { name: "Startseite", item: SITE_URL },
    { name: "Presse", item: absoluteUrl(path) },
  ]);
  const webPageJsonLd = createWebPageJsonLd({
    path,
    name: PRESS_PAGE_TITLE,
    description: PRESS_PAGE_DESCRIPTION,
    imagePath: PRESS_HERO_IMAGE,
  });
  const articleJsonLd = createArticleJsonLd({
    path,
    headline: PRESS_PAGE_TITLE,
    description: PRESS_PAGE_DESCRIPTION,
    imagePath: PRESS_HERO_IMAGE,
  });

  return (
    <main id="main-content" className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={articleJsonLd} />

      <MobileHeroSection
        eyebrow="Presse & Medien"
        title="Pressebereich von Frisia Immobilien"
        description={
          <>
            <span className="block">Informationen, Ansprechpartner und aktuelle</span>
            <span className="block">Hinweise von Frisia Immobilien in Aurich und Ostfriesland.</span>
          </>
        }
        imageSrc={PRESS_HERO_IMAGE}
        imageAlt="Pressebereich von Frisia Immobilien in Aurich"
        imagePosition="58% center"
        primaryCta={{ href: "/kontakt", label: "Presseanfrage stellen" }}
        secondaryCta={{ href: "#presseberichte", label: "Presseberichte" }}
        trustItems={["Aurich", "Ostfriesland", "Immobilienmarkt"]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image
          src={PRESS_HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.76)_28%,rgba(255,255,255,0.42)_50%,rgba(255,255,255,0.08)_72%,rgba(255,255,255,0)_92%)]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-[58rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Presse & Medien
            </p>
            <h1 className="mt-5 max-w-[13ch] break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.35rem,5vw,5rem)] leading-[1.02] text-[color:var(--color-navy)]">
              Pressebereich von Frisia Immobilien
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-[38rem] text-[1.12rem] leading-[1.75] text-[color:var(--color-navy)] md:text-[1.35rem]">
              <span className="block">Informationen, Ansprechpartner und aktuelle</span>
              <span className="block">Hinweise rund um Frisia Immobilien, den Immobilienmarkt in Aurich und die regionale Arbeit in Ostfriesland.</span>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/kontakt" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Presseanfrage stellen
              </Link>
              <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/82 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] transition hover:border-[color:var(--color-brass)]">
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
            Überblick
          </p>
          <h2 className="mt-3 max-w-5xl font-[family-name:var(--font-playfair)] text-[2.35rem] leading-tight text-[color:var(--color-navy)] md:text-[3.3rem]">
            Informationen für Presse, Medien und regionale Partner
          </h2>
          <p className="mt-5 max-w-[76ch] text-base leading-[1.8] text-[color:var(--color-graphite)] md:text-lg">
            Frisia Immobilien steht für strukturierte Immobilienbewertung, klare Verkaufsprozesse und regionale Marktkenntnis in Aurich und ganz Ostfriesland. Für Presseanfragen stellen wir Informationen und Einordnungen gebündelt bereit.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {pressCards.map((card) => (
              <article key={card.title} className="rounded-lg border border-[color:var(--color-brass)]/35 bg-[color:var(--color-section)] px-5 py-5">
                <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">{card.title}</h3>
                <p className="mt-2 text-base leading-7 text-[color:var(--color-graphite)]">{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="presseberichte" className="scroll-mt-24 bg-[color:var(--color-section)] py-14 md:py-20">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div>
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Presseberichte
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[2.35rem] leading-tight text-[color:var(--color-navy)] md:text-[3.3rem]">
              Aktuelle Presseberichte
            </h2>
          </div>
          <div className="rounded-xl border border-[color:var(--color-brass)]/35 bg-white p-6 shadow-[0_18px_46px_-38px_rgba(27,48,64,0.5)]">
            <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">
              Zurzeit liegen keine öffentlichen Presseberichte vor.
            </h3>
            <p className="mt-3 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Neue Presseberichte, Medienhinweise und Veröffentlichungen werden hier ergänzt. Für direkte Presseanfragen erreichst du Frisia Immobilien über das Kontaktformular oder telefonisch.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/kontakt" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <aside className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-6">
            <h2 className="text-lg font-semibold text-[color:var(--color-navy)]">Weiterführende Seiten</h2>
            <ul className="mt-4 grid gap-3 text-sm text-[color:var(--color-graphite)] md:grid-cols-2">
              {relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="underline underline-offset-4">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
