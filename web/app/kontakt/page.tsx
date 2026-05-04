import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import KontaktForm from "@/components/contact/KontaktForm.client";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import { buildPageMetadata } from "@/lib/metadata";
import {
  ADDRESS,
  EMAIL,
  PHONE_DISPLAY,
  PHONE_HREF,
  SITE_URL,
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Kontakt Immobilienmakler Aurich",
  description:
    "Kontakt zu Frisia Immobilien in Aurich: telefonisch anrufen, Termin vereinbaren und die strukturierte Immobilienbewertung starten.",
  keywords: ["kontakt immobilienmakler aurich", "immobilienbewertung aurich", "immobilie verkaufen aurich"],
  path: "/kontakt",
  openGraphType: "website",
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/kontakt", [
  { name: "Startseite", item: SITE_URL },
  { name: "Kontakt", item: `${SITE_URL}/kontakt` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/kontakt",
  name: "Kontakt Immobilienmakler Aurich",
  description:
    "Kontaktseite von Frisia Immobilien in Aurich für Eigentümer, die eine Bewertung, Beratung oder Verkaufsbegleitung anfragen möchten.",
  type: "ContactPage",
});

const heroFacts = [
  { label: "Telefon", value: PHONE_DISPLAY, href: PHONE_HREF },
  { label: "E-Mail", value: EMAIL, href: `mailto:${EMAIL}` },
  {
    label: "Adresse",
    value: `${ADDRESS.streetAddress}, ${ADDRESS.postalCode} ${ADDRESS.addressLocality}`,
    href: "https://maps.google.com/?q=Frisia%20Immobilien%20Oldersumer%20Stra%C3%9Fe%20150%2026605%20Aurich",
  },
];

const regionalPageLinks = [
  { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
  { href: "/haus-verkaufen-aurich", label: "Haus verkaufen Aurich" },
  { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
  { href: "/immobilienmakler-aurich", label: "Immobilienmakler Aurich" },
  { href: "/regionen-ostfriesland", label: "Regionen Ostfriesland" },
  { href: "/haus-kaufen-aurich", label: "Haus kaufen" },
  { href: "/immobilien-aurich", label: "Immobilien Aurich" },
] as const;

const nearbyRegionalLinks = [
  { href: "/immobilienmakler-aurich", label: "Aurich" },
  { href: "/immobilienmakler-emden", label: "Emden" },
  { href: "/immobilienmakler-leer", label: "Leer" },
  { href: "/immobilienmakler-norden", label: "Norden" },
  { href: "/immobilienmakler-wittmund", label: "Wittmund" },
  { href: "/immobilienmakler-wiesmoor", label: "Wiesmoor" },
  { href: "/immobilienmakler-suedbrookmerland", label: "Südbrookmerland" },
  { href: "/immobilienmakler-krummhoern", label: "Krummhörn" },
  { href: "/immobilienmakler-grossheide", label: "Großheide" },
] as const;

const relatedLinksJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${SITE_URL}/kontakt#related-links`,
  itemListElement: [...regionalPageLinks, ...nearbyRegionalLinks].map((link, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: link.label,
    url: absoluteUrl(link.href),
  })),
};

export default function KontaktPage() {
  return (
    <main className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={relatedLinksJsonLd} />

      <section className="relative isolate overflow-hidden bg-[#F4F2EC] md:hidden">
        <div className="relative h-[clamp(410px,calc(100svh-17rem),470px)] overflow-hidden">
          <Image
            src="/images/kontakt-beratung.webp"
            alt="Persönliches Beratungsgespräch mit Frisia Immobilien"
            fill
            priority={true}
            sizes="100vw"
            className="object-cover object-[58%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.18)_38%,rgba(255,255,255,0)_74%)]" />

          <div className="relative z-10 px-[1.65rem] pt-9">
            <div className="relative isolate max-w-[20rem]">
              <div className="pointer-events-none absolute -inset-x-3 -inset-y-4 -z-10 bg-[linear-gradient(105deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0)_75%,rgba(255,255,255,0)_100%)] blur-[1px]" />
              <p className="max-w-[16rem] text-[0.66rem] font-semibold uppercase leading-[1.65] tracking-[0.22em] text-[color:var(--color-navy)]/78">
                Kontakt zu Frisia Immobilien
              </p>
              <div className="mt-6 max-w-[10.5ch] font-[family-name:var(--font-playfair)] text-[clamp(2.05rem,9.45vw,2.5rem)] leading-[0.98] tracking-normal text-[color:var(--color-navy)]">
                Lass uns kurz über deine Immobilie sprechen.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-[1.65rem] pb-4 pt-5">
          <p className="max-w-[22rem] border-l-[5px] border-[color:var(--color-brass)] pl-5 text-[0.76rem] leading-[1.42] text-[color:var(--color-graphite)]">
            Beschreib kurz dein Anliegen. Zwei Sätze reichen - wir melden uns persönlich bei dir.
          </p>

          <div className="mt-5 grid grid-cols-[1.25fr_1fr] gap-2.5">
            <Link
              href="#kontaktformular"
              className="inline-flex min-h-[3.75rem] items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-4 py-3 text-center text-[1rem] font-semibold leading-tight text-white shadow-[0_18px_40px_-28px_rgba(27,48,64,0.78)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              Nachricht schreiben
            </Link>
            <a
              href={PHONE_HREF}
              className="inline-flex min-h-[3.75rem] flex-col items-center justify-center whitespace-nowrap rounded-xl border border-[color:var(--color-brass)]/55 bg-white px-[0.55rem] py-2.5 text-center font-semibold leading-tight text-[color:var(--color-navy)] shadow-[0_16px_46px_-36px_rgba(27,48,64,0.55)] transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              <span className="text-[clamp(0.65rem,2.84vw,0.78rem)]">Einfach kurz sprechen</span>
              <span className="mt-1 text-[clamp(0.8rem,3.55vw,0.93rem)]">{PHONE_DISPLAY}</span>
            </a>
          </div>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-1 text-[0.6rem] font-semibold leading-none text-[color:var(--color-navy)]">
            {["Persönlich", "Regional", "Direkt erreichbar"].map((item) => (
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
        </div>
      </section>

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image
          src="/images/kontakt-beratung.webp"
          alt="Persönliches Beratungsgespräch mit Frisia Immobilien"
          fill
          priority={true}
          sizes="100vw"
          className="object-cover object-[30%_center] sm:object-[42%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.72)_28%,rgba(255,255,255,0.3)_48%,rgba(255,255,255,0.04)_70%,rgba(255,255,255,0)_92%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.48)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:px-12">
          <div className="w-full max-w-[820px]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-brackish)]">
              Kontakt zu Frisia Immobilien
            </p>
            <h1 className="mt-5 max-w-[12ch] font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,6.5vw,5.25rem)] leading-[1.01] text-[color:var(--color-navy)]">
              Lass uns kurz über deine Immobilie sprechen.
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-[43rem] text-[1.15rem] leading-[1.72] text-[color:var(--color-navy)] md:text-[1.35rem]">
              Beschreib kurz dein Anliegen. Zwei Sätze reichen - wir melden uns persönlich bei dir.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="#kontaktformular"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Nachricht schreiben
              </Link>
              <a
                href={PHONE_HREF}
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-navy)]/30 bg-white/86 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] shadow-[0_16px_46px_-36px_rgba(27,48,64,0.55)] backdrop-blur transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                {PHONE_DISPLAY}
              </a>
            </div>

            <dl className="mt-10 grid gap-4 text-[0.95rem] leading-6 text-[color:var(--color-navy)] sm:grid-cols-3">
              {heroFacts.map((item) => (
                <div key={item.label} className="border-l-2 border-[color:var(--color-brass)] pl-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-semibold">
                    <a href={item.href} className="underline-offset-4 hover:underline">
                      {item.value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <AurichHeroLinks />

      <section className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 md:py-16">
        <KontaktForm />

        <div className="mt-14">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
            Weiterführende regionale Seiten
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {regionalPageLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-[color:var(--color-brass)]/45 bg-white px-7 py-5 text-lg font-semibold text-[color:var(--color-navy)] shadow-[0_18px_44px_-40px_rgba(27,48,64,0.45)] transition hover:border-[color:var(--color-brass)] hover:bg-white/80"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <h3 className="mt-14 font-[family-name:var(--font-playfair)] text-[1.75rem] leading-tight text-[color:var(--color-navy)] md:text-[2.15rem]">
            Nachbarorte und Ortsteile
          </h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {nearbyRegionalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[color:var(--color-brass)]/45 bg-white px-5 py-2.5 text-base text-[color:var(--color-graphite)] transition hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-navy)] md:text-lg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
