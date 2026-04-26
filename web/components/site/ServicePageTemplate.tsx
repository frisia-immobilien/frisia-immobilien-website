import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import {
  PHONE_DISPLAY,
  PHONE_HREF,
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createFAQPageJsonLd,
  createServiceJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

type FaqItem = { question: string; answer: string };
type InternalLink = { href: string; label: string };

type Props = {
  slug: string;
  eyebrow: string;
  h1: string;
  intro: string;
  imageAlt: string;
  h2A: string;
  h2B: string;
  h3A: string;
  h3B: string;
  paragraphA: string;
  paragraphB: string;
  internalLinks: InternalLink[];
  faq: FaqItem[];
};

export default function ServicePageTemplate(props: Props) {
  const path = `/${props.slug}`;
  const canonical = absoluteUrl(path);

  const breadcrumbJsonLd = createBreadcrumbListJsonLd(path, [
    { name: "Startseite", item: "/" },
    { name: props.h1, item: canonical },
  ]);

  const webPageJsonLd = createWebPageJsonLd({
    path,
    name: props.h1,
    description: props.intro,
  });

  const serviceJsonLd = createServiceJsonLd({
    path,
    name: props.h1,
    serviceType: props.eyebrow,
    description: props.intro,
  });

  const faqJsonLd = createFAQPageJsonLd(path, props.faq);

  const relatedLinksJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${canonical}#related-links`,
    itemListElement: props.internalLinks.map((link, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: link.label,
      url: absoluteUrl(link.href),
    })),
  };

  return (
    <main className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={relatedLinksJsonLd} />

      <section className="mx-auto grid w-full max-w-[1240px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-12 md:items-center md:py-20">
        <div className="md:col-span-7">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">{props.eyebrow}</p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-[1.14] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
            {props.h1}
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-[1.7] text-[color:var(--color-graphite)]">{props.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/immobilienbewertung-aurich" className="rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white">
              Immobilie kostenlos bewerten
            </Link>
            <a href={PHONE_HREF} className="rounded-xl border border-[color:var(--color-brass)]/35 px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)]">
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="overflow-hidden rounded-3xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)]">
            <Image
              src="/images/hero/haus-verkaufen-aurich.webp"
              alt={props.imageAlt}
              width={1200}
              height={800}
              priority
              sizes="(max-width: 768px) 100vw, 42vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">{props.h2A}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-2xl font-semibold text-[color:var(--color-navy)]">{props.h3A}</h3>
              <p className="mt-3 text-base leading-[1.75] text-[color:var(--color-graphite)]">{props.paragraphA}</p>
            </article>
            <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-2xl font-semibold text-[color:var(--color-navy)]">{props.h3B}</h3>
              <p className="mt-3 text-base leading-[1.75] text-[color:var(--color-graphite)]">{props.paragraphB}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">{props.h2B}</h2>
        <div className="mt-6 space-y-4">
          {props.faq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-xl font-semibold leading-[1.4] text-[color:var(--color-navy)]">{item.question}</h3>
              <p className="mt-2 text-base leading-[1.75] text-[color:var(--color-graphite)]">{item.answer}</p>
            </article>
          ))}
        </div>

        <aside className="mt-8 rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-6">
          <h4 className="text-lg font-semibold text-[color:var(--color-navy)]">Interne Verlinkung</h4>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-graphite)]">
            {props.internalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="underline underline-offset-4">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
