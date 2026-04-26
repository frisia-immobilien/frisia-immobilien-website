import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL, createBreadcrumbListJsonLd, createWebPageJsonLd } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Rechtliche Hinweise",
  description:
    "Impressum, Datenschutzerklärung und Cookie-Hinweise der Frisia Immobilien GmbH in Aurich.",
  path: "/recht",
  keywords: ["impressum frisia immobilien", "datenschutz frisia immobilien", "cookie hinweise frisia immobilien"],
});

const breadcrumbJsonLd = createBreadcrumbListJsonLd("/recht", [
  { name: "Startseite", item: SITE_URL },
  { name: "Rechtliche Hinweise", item: `${SITE_URL}/recht` },
]);

const webPageJsonLd = createWebPageJsonLd({
  path: "/recht",
  name: "Rechtliche Hinweise",
  description:
    "Übersicht der rechtlichen Angaben, Datenschutz- und Cookie-Hinweise der Frisia Immobilien GmbH.",
});

export default function RechtIndexPage() {
  return (
    <main className="bg-white text-[color:var(--color-graphite)]">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <section className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl leading-[1.15] tracking-[-0.015em] text-[color:var(--color-navy)] md:text-5xl">
            Rechtliche Hinweise
          </h1>
          <p className="mt-5 text-[1.02rem] leading-[1.75]">
            Hier findest du alle rechtlichen Pflichtangaben zu Frisia Immobilien.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link href="/recht/impressum" className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-5">
              <p className="font-semibold text-[color:var(--color-navy)]">Impressum</p>
            </Link>
            <Link href="/recht/datenschutz" className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-5">
              <p className="font-semibold text-[color:var(--color-navy)]">Datenschutz</p>
            </Link>
            <Link href="/recht/cookies" className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-5">
              <p className="font-semibold text-[color:var(--color-navy)]">Cookies</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
