import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import { buildPageMetadata } from "@/lib/metadata";
import {
  ADDRESS,
  AREA_SERVED,
  DIRECT_CONTACT,
  EMAIL,
  PHONE_DISPLAY,
  PHONE_E164,
  PHONE_HREF,
  absoluteUrl,
  createBreadcrumbListJsonLd,
  createFAQPageJsonLd,
  createImageObjectJsonLd,
  createServiceJsonLd,
  createWebPageJsonLd,
} from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Das Maklerhaus Aurich",
  description:
    "Das Maklerhaus Frisia Immobilien in Aurich: persönliche Verantwortung, klare Abläufe, Experten aus der Region und strukturierter Immobilienverkauf.",
  path: "/maklerhaus",
  keywords: ["maklerhaus aurich", "immobilienmakler aurich", "immobilie verkaufen aurich", "frisia immobilien", "team frisia immobilien"],
});

const faq = [
  {
    question: "Wer steht hinter Frisia Immobilien?",
    answer: "Das Team von Frisia Immobilien bündelt Expertise für Wohnimmobilien, Gewerbeimmobilien und Ferienimmobilien in Aurich und Ostfriesland.",
  },
  {
    question: "Was unterscheidet Frisia Immobilien?",
    answer: "Die Kombination aus regionaler Marktkenntnis, strukturierter Führung und persönlicher Verantwortung.",
  },
  {
    question: "Ist Frisia nur für Verkäufer relevant?",
    answer: "Der Schwerpunkt liegt auf Eigentümer-Conversion, Käufer werden jedoch ebenfalls strukturiert begleitet.",
  },
] as const;

const teamMembers = [
  {
    name: "Sebastian Munzig",
    image: "/images/team/sebastian-munzig-profilbild.webp",
    role: "Geschäftsführender Gesellschafter",
    focus: "Experte für Wohnimmobilien",
    experience: "Seit 2019 aktiv in der Immobilienvermittlung.",
    phoneLabel: DIRECT_CONTACT.phoneDisplay,
    phoneHref: DIRECT_CONTACT.phoneHref,
    mobileLabel: DIRECT_CONTACT.mobileDisplay,
    mobileHref: DIRECT_CONTACT.mobileHref,
    email: DIRECT_CONTACT.email,
    addressLines: [ADDRESS.streetAddress, `${ADDRESS.postalCode} ${ADDRESS.addressLocality}`],
    languages: ["Deutsch", "Englisch"],
    qualifications: [
      "DEKRA-zertifizierter Sachverständiger für Immobilienbewertung – D1",
      "Immobilienmakler (IHK)",
      "Geprüfter Wirtschaftsfachwirt (IHK)",
    ],
    text:
      "Sebastian Munzig führt Frisia Immobilien mit klarem Fokus auf Wohnimmobilien. Im Mittelpunkt stehen strukturierte Entscheidungen, belastbare Einordnungen und ein ruhiger Verkaufsprozess für Eigentümer.",
  },
  {
    name: "Uwe G. Sandomeer",
    image: "/images/team/uwe-sandomeer-profilbild.webp",
    role: "Experte für Wohn- und Gewerbeimmobilien",
    focus: "Fokus auf Gewerbeimmobilien",
    experience: "25 Jahre Erfahrung in Aurich und Umgebung.",
    phoneLabel: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    mobileLabel: "0172 4163711",
    mobileHref: "tel:+491724163711",
    email: "uwe.sandomeer@frisia-immobilien.de",
    addressLines: [ADDRESS.streetAddress, `${ADDRESS.postalCode} ${ADDRESS.addressLocality}`],
    languages: ["Deutsch", "Englisch", "Plattdeutsch"],
    qualifications: [
      "Kaufmann in der Grundstücks- und Wohnungswirtschaft",
      "Sachverständiger für bebaute und unbebaute Grundstücke",
    ],
    text:
      "Uwe Sandomeer verbindet regionale Erfahrung mit einem klaren Blick für Gewerbestandorte, Nutzungslogik und Vermarktungswege. Gerade bei Gewerbeimmobilien zählt seine lange Marktkenntnis in Aurich und Umgebung.",
  },
  {
    name: "Tonnie Olthof",
    image: "/images/team/tonnie-olthof-profilbild2.webp",
    role: "Experte für Wohn- und Ferienimmobilien",
    focus: "Fokus auf Ferienimmobilien",
    experience: "28 Jahre Erfahrung, besonders mit Kunden aus den Niederlanden bis hin zu den Kap Verden.",
    phoneLabel: PHONE_DISPLAY,
    phoneHref: PHONE_HREF,
    mobileLabel: "0171 3690573",
    mobileHref: "tel:+491713690573",
    email: "tonnie.olthof@frisia-immobilien.de",
    addressLines: [ADDRESS.streetAddress, `${ADDRESS.postalCode} ${ADDRESS.addressLocality}`],
    languages: ["Deutsch", "Englisch", "Niederländisch"],
    qualifications: [
      "Immobilienmakler nach §34c",
      "WEG-Verwalter nach §34c",
      "DGuSV-geprüfter Sachverständiger mit Spezialisierung Ferienimmobilien",
    ],
    text:
      "Tonnie Olthof begleitet Eigentümer und Interessenten mit besonderer Stärke im Segment Ferienimmobilien. Seine internationale Erfahrung schafft Sicherheit in der Ansprache, Einordnung und Vermarktung grenzüberschreitender Zielgruppen.",
  },
] as const;

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

export default function MaklerhausPage() {
  const path = "/maklerhaus";
  const canonical = absoluteUrl(path);

  const breadcrumbJsonLd = createBreadcrumbListJsonLd(path, [
    { name: "Startseite", item: "/" },
    { name: "Das Maklerhaus", item: canonical },
  ]);

  const webPageJsonLd = createWebPageJsonLd({
    path,
    name: "Frisia Immobilien: Das Maklerhaus in Aurich",
    description:
      "Das Maklerhaus Frisia Immobilien in Aurich mit klarer Arbeitsweise, festen Ansprechpartnern und regionaler Expertise.",
  });

  const serviceJsonLd = createServiceJsonLd({
    path,
    name: "Frisia Immobilien: Das Maklerhaus in Aurich",
    serviceType: "Das Maklerhaus",
    description:
      "Persönliche Verantwortung, klare Abläufe und strukturierter Immobilienverkauf mit Experten für Wohn-, Gewerbe- und Ferienimmobilien.",
  });

  const faqJsonLd = createFAQPageJsonLd(path, faq);

  const relatedLinksJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${canonical}#related-links`,
    itemListElement: [...regionalPageLinks, ...nearbyRegionalLinks].map((link, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: link.label,
      url: absoluteUrl(link.href),
    })),
  };

  const teamJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${canonical}#team-organization`,
    name: "Team Frisia Immobilien",
    url: canonical,
    email: EMAIL,
    telephone: PHONE_E164,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.streetAddress,
      postalCode: ADDRESS.postalCode,
      addressLocality: ADDRESS.addressLocality,
      addressRegion: ADDRESS.addressRegion,
      addressCountry: ADDRESS.addressCountry,
    },
    areaServed: [...AREA_SERVED],
    member: teamMembers.map((member, index) => ({
      "@type": "Person",
      "@id": `${canonical}#person-${index + 1}`,
      name: member.name,
      jobTitle: member.role,
      description: `${member.focus}. ${member.experience}`,
      email: member.email,
      telephone: member.mobileHref.replace("tel:", ""),
      worksFor: {
        "@type": "Organization",
        name: "Frisia Immobilien",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: ADDRESS.streetAddress,
        postalCode: ADDRESS.postalCode,
        addressLocality: ADDRESS.addressLocality,
        addressRegion: ADDRESS.addressRegion,
        addressCountry: ADDRESS.addressCountry,
      },
      knowsLanguage: member.languages,
      knowsAbout: [member.focus, ...member.qualifications],
      image: createImageObjectJsonLd(member.image, member.name),
    })),
  };

  return (
    <main className="bg-white">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={relatedLinksJsonLd} />
      <JsonLd data={teamJsonLd} />

      <section className="relative isolate overflow-hidden bg-[#F4F2EC]">
        <div className="md:hidden">
          <div className="relative h-[clamp(410px,calc(100svh-17rem),470px)] overflow-hidden">
            <Image
              src="/images/maklerhaus/buero1.webp"
              alt="Büro von Frisia Immobilien in Aurich"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-[58%_50%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.18)_38%,rgba(255,255,255,0)_74%)]" />

            <div className="relative z-10 px-[1.65rem] pt-9">
              <div className="relative isolate max-w-[20rem]">
                <div className="pointer-events-none absolute -inset-x-3 -inset-y-4 -z-10 bg-[linear-gradient(105deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.28)_58%,rgba(255,255,255,0)_75%,rgba(255,255,255,0)_100%)] blur-[1px]" />
                <p className="max-w-[16rem] text-[0.66rem] font-semibold uppercase leading-[1.65] tracking-[0.22em] text-[color:var(--color-navy)]/78">
                  Maklerhaus · Aurich & Ostfriesland
                </p>
                <div className="mt-6 max-w-[10.5ch] font-[family-name:var(--font-playfair)] text-[clamp(2.05rem,9.45vw,2.5rem)] leading-[0.98] tracking-normal text-[color:var(--color-navy)]">
                  Frisia Immobilien:
                  <br />
                  Das Maklerhaus
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white px-[1.65rem] pb-4 pt-5">
            <p className="max-w-[22rem] border-l-[5px] border-[color:var(--color-brass)] pl-5 text-[0.76rem] leading-[1.42] text-[color:var(--color-graphite)]">
              Persönlich. Regional. Verlässlich. Wir stehen für klare Kommunikation, kompetente Beratung und partnerschaftliche Zusammenarbeit.
            </p>

            <div className="mt-5 grid grid-cols-[1.25fr_1fr] gap-2.5">
              <Link
                href="#team"
                className="inline-flex min-h-[3.75rem] items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-4 py-3 text-center text-[1rem] font-semibold leading-tight text-white shadow-[0_18px_40px_-28px_rgba(27,48,64,0.78)] transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Mehr zu unserem Team
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
              {["Regional", "Persönlich", "50+ Jahre Erfahrung"].map((item) => (
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
        </div>

        <div className="relative isolate hidden overflow-hidden bg-white md:block">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/maklerhaus/buero1.webp"
              alt="Büro von Frisia Immobilien in Aurich"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-[58%_50%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.72)_26%,rgba(255,255,255,0.34)_46%,rgba(255,255,255,0.06)_66%,rgba(255,255,255,0)_88%)]" />
          </div>

          <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1440px] flex-col justify-center px-8 pb-40 pt-20 lg:px-12">
            <div className="max-w-[42rem] min-w-0">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
                MAKLERHAUS · AURICH & OSTFRIESLAND
              </p>
              <h1 className="max-w-[13ch] break-words font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] tracking-normal text-[color:var(--color-navy)]">
                Frisia Immobilien:
                <br />
                Das Maklerhaus
              </h1>
              <HeroDivider />
              <p className="mt-8 max-w-[36rem] text-[1.28rem] leading-[1.65] text-[color:var(--color-navy)]">
                Persönlich. Regional. Verlässlich.
                <br />
                Wir stehen für klare Kommunikation, kompetente Beratung und partnerschaftliche Zusammenarbeit – mit mehr als 50 Jahren gemeinsamer Berufserfahrung.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="#team"
                  className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                >
                  Mehr zu unserem Team
                </Link>
                <a
                  href={PHONE_HREF}
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[color:var(--color-brass)]/65 bg-white/88 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                >
                  <Image
                    src="/images/icons/phone.webp"
                    alt=""
                    width={14}
                    height={14}
                    aria-hidden="true"
                    className="h-[13.5px] w-[13.5px] shrink-0 object-contain"
                  />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-white/94 shadow-[0_-18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="mx-auto grid max-w-[1240px] gap-0 px-8 py-6 md:grid-cols-4 lg:px-12">
              {[
                {
                  iconSrc: "/images/maklerhaus/icons/regional-verwurzelt.webp",
                  text: "Regional verwurzelt in Aurich & Ostfriesland",
                },
                {
                  iconSrc: "/images/maklerhaus/icons/persoenliche-ansprechpartner.webp",
                  text: "Persönliche Ansprechpartner statt anonymer Abläufe",
                },
                {
                  iconSrc: "/images/maklerhaus/icons/25-jahre-erfahrung.webp",
                  text: "Über 25 Jahre Erfahrung auf dem Immobilienmarkt",
                },
                {
                  iconSrc: "/images/maklerhaus/icons/serioes.webp",
                  text: "Seriös. Diskret. Vertrauensvoll.",
                },
              ].map((item, index) => (
                <div key={item.text} className={`flex items-center gap-4 ${index > 0 ? "border-l border-[color:var(--color-brass)]/25 pl-8" : ""}`}>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center">
                    <Image
                      src={item.iconSrc}
                      alt=""
                      width={52}
                      height={52}
                      aria-hidden="true"
                      className="h-[52px] w-[52px] object-contain mix-blend-multiply"
                    />
                  </span>
                  <p className="text-sm font-medium leading-[1.45] text-[color:var(--color-navy)]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AurichHeroLinks />

      <section className="bg-white px-4 py-14 sm:px-6 md:py-18">
        <div className="mx-auto grid w-full max-w-[1240px] gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Standort und Prinzip</p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
              Dort arbeiten, wo der Markt entsteht
            </h2>
            <div className="mt-5 space-y-4 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              <p>
                Frisia Immobilien ist ein inhabergeführtes Maklerhaus mit Sitz in Aurich – direkt an der Haxtumer Mühle, zwischen den gewachsenen Wohnlagen in Extum und den Neubaugebieten in Timp und Haxtum.
              </p>
              <p>
                Aurich bildet den Mittelpunkt des Immobilienmarktes in Ostfriesland. Von hier aus lassen sich Preisentwicklungen früh erkennen und realistisch einordnen.
              </p>
              <p>
                Frisia Immobilien arbeitet nah am Markt – dort, wo Angebot, Nachfrage und tatsächliche Verkaufspreise entstehen.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <article className="rounded-[1.8rem] border border-[color:var(--color-navy)]/10 bg-[color:var(--color-section)]/70 p-6 md:p-7">
              <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Gewachsene Strukturen. Neue Entwicklung.</h3>
              <div className="mt-4 space-y-4 text-base leading-[1.8] text-[color:var(--color-graphite)]">
                <p>
                  Die Lage verbindet bestehende Wohngebiete mit neuen Entwicklungen.
                </p>
                <div>
                  <p className="font-semibold text-[color:var(--color-navy)]">Für Eigentümer bedeutet das:</p>
                  <ul className="mt-2 space-y-1">
                    <li>→ realistische Bewertung auf Basis echter Nachfrage</li>
                    <li>→ klare Einordnung der Lage innerhalb des Marktes</li>
                  </ul>
                </div>
                <p>
                  Kurze Wege und direkte Erreichbarkeit sorgen für eine einfache und verbindliche Abstimmung vor Ort.
                </p>
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-[color:var(--color-navy)]/10 bg-white p-6 shadow-[0_18px_50px_-42px_rgba(27,48,64,0.28)] md:p-7">
              <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Das Frisia Prinzip</h3>
              <div className="mt-4 space-y-4 text-base leading-[1.8] text-[color:var(--color-graphite)]">
                <p>
                  Jeder Verkauf folgt einer klaren Struktur.
                </p>
                <p>
                  Du hast einen festen Ansprechpartner. Alle Schritte werden nachvollziehbar eingeordnet – von der Bewertung bis zum Abschluss.
                </p>
                <p>
                  Es geht nicht um schnelle Entscheidungen, sondern um eine fundierte Grundlage.
                </p>
              </div>
            </article>

            <div className="rounded-[1.8rem] bg-[color:var(--color-navy)] p-6 text-white md:p-7">
              <p className="text-base leading-[1.8] text-white/88">
                Frisia Immobilien arbeitet im regionalen Markt in Aurich und ganz Ostfriesland – dort, wo Käufer tatsächlich suchen und Entscheidungen treffen.
              </p>
              <p className="mt-4 text-xl font-semibold leading-[1.45]">
                Klare Bewertung. Strukturierter Verkauf. Verlässliche Begleitung.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="bg-[color:var(--color-section)] px-4 py-14 sm:px-6 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] rounded-[2rem] border border-[color:var(--color-brass)]/25 bg-white p-6 md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Experten für Wohn-, Gewerbe- und Ferienimmobilien</p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
              Team Frisia Immobilien
            </h2>
            <p className="mt-4 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Hinter Frisia Immobilien steht ein Team mit klaren Zuständigkeiten, regionaler Marktkenntnis und unterschiedlichen fachlichen Schwerpunkten. So bleibt die
              Beratung persönlich, belastbar und auf die jeweilige Immobilie zugeschnitten.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <article key={member.name} className="overflow-hidden rounded-[2rem] border border-[color:var(--color-navy)]/10 bg-white shadow-[0_24px_70px_-55px_rgba(27,48,64,0.32)]">
                <div className="border-b border-[color:var(--color-navy)]/10 bg-white p-6">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-[color:var(--color-section)]/70">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 1024px) 92vw, 360px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">{member.role}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
                    {member.name}
                  </h3>
                  <div className="mt-4 space-y-2 text-sm leading-[1.75] text-[color:var(--color-graphite)]">
                    <p>
                      <span className="font-semibold text-[color:var(--color-navy)]">Schwerpunkt:</span> {member.focus}
                    </p>
                    <p>
                      <span className="font-semibold text-[color:var(--color-navy)]">Erfahrung:</span> {member.experience}
                    </p>
                    <p>
                      <span className="font-semibold text-[color:var(--color-navy)]">Sprachen:</span> {member.languages.join(", ")}
                    </p>
                  </div>
                  <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">{member.text}</p>

                  <div className="mt-6 rounded-[1.4rem] bg-[color:var(--color-section)]/72 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">Qualifikationen</div>
                    <ul className="mt-3 space-y-2 text-sm leading-[1.75] text-[color:var(--color-graphite)]">
                      {member.qualifications.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 border-t border-[color:var(--color-brass)]/18 pt-5 text-sm leading-[1.8] text-[color:var(--color-graphite)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">Kontakt</div>
                    <div className="mt-3 space-y-1">
                      <p>
                        <span className="font-semibold text-[color:var(--color-navy)]">Büro-Adresse:</span>{" "}
                        {member.addressLines.map((line, index) => (
                          <span key={line}>
                            {index > 0 ? " · " : ""}
                            {line}
                          </span>
                        ))}
                      </p>
                      <p>
                        <span className="font-semibold text-[color:var(--color-navy)]">Telefon:</span>{" "}
                        <a href={member.phoneHref} className="underline underline-offset-4">
                          {member.phoneLabel}
                        </a>
                      </p>
                      <p>
                        <span className="font-semibold text-[color:var(--color-navy)]">Mobil:</span>{" "}
                        <a href={member.mobileHref} className="underline underline-offset-4">
                          {member.mobileLabel}
                        </a>
                      </p>
                      <p>
                        <span className="font-semibold text-[color:var(--color-navy)]">E-Mail:</span>{" "}
                        <a href={`mailto:${member.email}`} className="underline underline-offset-4">
                          {member.email}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">Werte und Arbeitsweise</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[color:var(--color-navy)] bg-[color:var(--color-navy)] p-6 shadow-[0_18px_45px_-34px_rgba(27,48,64,0.75)]">
              <h3 className="text-2xl font-semibold text-white">Persönliche Verantwortung</h3>
              <p className="mt-3 text-base leading-[1.75] text-white/86">
                Eigentümer haben feste Ansprechpartner und klare Zuständigkeiten im gesamten Ablauf bis zum Notartermin.
              </p>
            </article>
            <article className="rounded-2xl border border-[color:var(--color-navy)] bg-[color:var(--color-navy)] p-6 shadow-[0_18px_45px_-34px_rgba(27,48,64,0.75)]">
              <h3 className="text-2xl font-semibold text-white">Klare Struktur statt Reizüberflutung</h3>
              <p className="mt-3 text-base leading-[1.75] text-white/86">
                Jeder Prozessschritt ist nachvollziehbar aufgebaut: Bewertung, Unterlagen, Vermarktung, Verhandlung und Abschluss.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-section)] py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">FAQ zum Maklerhaus Frisia Immobilien</h2>
          <div className="mt-6 space-y-4">
            {faq.map((item) => (
              <article key={item.question} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
                <h3 className="text-xl font-semibold leading-[1.4] text-[color:var(--color-navy)]">{item.question}</h3>
                <p className="mt-2 text-base leading-[1.75] text-[color:var(--color-graphite)]">{item.answer}</p>
              </article>
            ))}
          </div>

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
        </div>
      </section>
    </main>
  );
}
