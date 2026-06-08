import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import PartnerSlider from "@/components/site/PartnerSlider.client";
import { buildPageMetadata } from "@/lib/metadata";
import { getWebsitePartners, type WebsitePartner } from "@/lib/partners";
import { absoluteUrl, createBreadcrumbListJsonLd, createWebPageJsonLd } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Partner",
  description:
    "Partner von Frisia Immobilien: ausgewählte Kontakte, Plattformen und Dienstleister rund um Immobilienverkauf, Bewertung, Vorbereitung und Abschluss.",
  path: "/partner",
  keywords: ["partner frisia immobilien", "immobilien partner aurich", "netzwerk frisia immobilien"],
});

function shufflePartners(partners: WebsitePartner[]) {
  const shuffled = [...partners];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export default async function PartnerPage() {
  const partners = shufflePartners(await getWebsitePartners());
  const path = "/partner";
  const canonical = absoluteUrl(path);

  const breadcrumbJsonLd = createBreadcrumbListJsonLd(path, [
    { name: "Startseite", item: "/" },
    { name: "Partner", item: canonical },
  ]);

  const webPageJsonLd = createWebPageJsonLd({
    path,
    name: "Partner von Frisia Immobilien",
    description:
      "Ausgewählte Partner und Dienstleister im Netzwerk von Frisia Immobilien in Aurich und Ostfriesland.",
  });

  const partnerItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${canonical}#partner`,
    itemListElement: partners.map((partner, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: partner.name,
      url: partner.websiteUrl || canonical,
    })),
  };

  return (
    <main id="main-content" className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={partnerItemListJsonLd} />

      <section className="relative isolate min-h-[min(680px,calc(100svh-10rem))] overflow-hidden bg-[color:var(--color-navy)]">
        <Image
          src="/images/why/reichweite-scout24.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,48,64,0.90)_0%,rgba(27,48,64,0.72)_42%,rgba(27,48,64,0.28)_100%)]" />
        <div className="relative z-10 mx-auto flex min-h-[min(680px,calc(100svh-10rem))] w-full max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:py-24">
          <p className="max-w-[44rem] text-xs font-semibold uppercase leading-6 tracking-[0.16em] text-white/74">
            Partner von Frisia Immobilien
          </p>
          <h1 className="mt-5 max-w-[11ch] font-[family-name:var(--font-playfair)] text-[clamp(3.2rem,9vw,8rem)] font-normal leading-[0.95] text-white">
            Unser Netzwerk.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/84 sm:text-xl sm:leading-9">
            Gute Immobilienarbeit entsteht nicht isoliert. Für Reichweite, Vorbereitung,
            Bewertung, Baufragen und notarielle Abwicklung arbeiten wir mit ausgewählten
            Partnern zusammen.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#partner-slider"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[color:var(--color-navy)] transition hover:bg-[color:var(--color-sand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              Partner ansehen
            </a>
            <Link
              href="/kontakt"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase leading-6 tracking-[0.16em] text-[color:var(--color-brackish)]">
              Zusammenarbeit
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-[clamp(2.2rem,5vw,4.6rem)] font-normal leading-none text-[color:var(--color-navy)]">
              Ausgewählt statt beliebig.
            </h2>
          </div>
          <div className="max-w-2xl text-base leading-8 text-[color:var(--color-graphite)] sm:text-lg">
            <p>
              Unsere Partner werden nicht zufällig ausgewählt, sondern gezielt nach
              Kompetenz, Zuverlässigkeit und regionaler Erfahrung. Jeder Partner übernimmt
              eine klar definierte Rolle im Umfeld eines Immobilienverkaufs - von der
              professionellen Vorbereitung und Präsentation der Immobilie über die
              Beantwortung fachlicher Fragen bis hin zur rechtssicheren und reibungslosen
              Abwicklung. So entstehen feste Abläufe, kurze Wege und eine Zusammenarbeit,
              die den Verkaufsprozess für Eigentümer spürbar vereinfacht und absichert.
            </p>
          </div>
        </div>
      </section>

      <div id="partner-slider">
        <PartnerSlider partners={partners} />
      </div>
    </main>
  );
}
