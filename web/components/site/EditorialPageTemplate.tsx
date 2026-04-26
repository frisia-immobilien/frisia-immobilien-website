import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import {
  PHONE_DISPLAY,
  PHONE_HREF,
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

type Section = {
  title: string;
  body: string[];
};

type InternalLink = {
  href: string;
  label: string;
};

type Props = {
  slug: string;
  eyebrow: string;
  h1: string;
  intro: string;
  imageAlt: string;
  sections: Section[];
  internalLinks: InternalLink[];
};

export default function EditorialPageTemplate({
  slug,
  eyebrow,
  h1,
  intro,
  imageAlt,
  sections,
  internalLinks,
}: Props) {
  const path = `/${slug}`;
  const canonical = absoluteUrl(path);

  const breadcrumbJsonLd = createBreadcrumbListJsonLd(path, [
    { name: "Startseite", item: "/" },
    { name: h1, item: canonical },
  ]);

  const webPageJsonLd = createWebPageJsonLd({
    path,
    name: h1,
    description: intro,
    type: slug.startsWith("ueber-uns") ? "AboutPage" : "WebPage",
  });

  const relatedLinksJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${canonical}#related-links`,
    itemListElement: internalLinks.map((link, index) => ({
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
      <JsonLd data={relatedLinksJsonLd} />

      <section className="relative w-full py-16 md:py-20">
        <div className="grid w-screen md:grid-cols-12 md:items-center">
          <div className="col-start-1 px-4 sm:px-6 md:col-span-6">
            <div className="mx-auto max-w-[620px]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">{eyebrow}</p>
              <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-[1.14] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
                {h1}
              </h1>
              <p className="mt-6 max-w-4xl text-lg leading-[1.7] text-[color:var(--color-graphite)]">{intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/immobilienbewertung-aurich" className="rounded-xl bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white">
                  Immobilie kostenlos bewerten
                </Link>
                <a href={PHONE_HREF} className="rounded-xl border border-[color:var(--color-brass)]/35 px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)]">
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>

          <div className="col-start-7 col-end-13 md:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)]">
              <Image
                src="/images/hero/haus-verkaufen-aurich.webp"
                alt={imageAlt}
                width={1200}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-16">
        <div className="mx-auto grid w-full max-w-[1240px] gap-6 px-4 sm:px-6 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-base leading-[1.75] text-[color:var(--color-graphite)]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16">
        <aside className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-6">
          <h2 className="text-lg font-semibold text-[color:var(--color-navy)]">Weiterführende Seiten</h2>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-graphite)]">
            {internalLinks.map((link) => (
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
