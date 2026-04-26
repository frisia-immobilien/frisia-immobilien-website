import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/components/seo/JsonLd";
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
    image: "/images/team/sebastian-munzig.jpg",
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
    image: "/images/team/uwe-sandomeer.png",
    role: "Experte für Wohn- und Gewerbeimmobilien",
    focus: "Fokus auf Gewerbeimmobilien",
    experience: "20 Jahre Erfahrung in Aurich und Umgebung.",
    phoneLabel: "04941 986 770-0",
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
    image: "/images/team/tonnie-olthoff.jpg",
    role: "Experte für Wohn- und Ferienimmobilien",
    focus: "Fokus auf Ferienimmobilien",
    experience: "28 Jahre Erfahrung, besonders mit Kunden aus den Niederlanden bis hin zu den Kap Verden.",
    phoneLabel: "04941 986 770-0",
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
    itemListElement: [
      { href: "/immobilienmakler-aurich", label: "Immobilienmakler Aurich" },
      { href: "/immobilie-verkaufen-aurich", label: "Immobilie verkaufen Aurich" },
      { href: "/kontakt", label: "Persönliche Beratung" },
    ].map((link, index) => ({
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

      <section className="relative isolate overflow-hidden bg-white">
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
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_30%,rgba(255,255,255,0.68)_50%,rgba(255,255,255,0.08)_82%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/92 to-transparent md:hidden" />
        </div>

        <div className="mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-[1440px] flex-col justify-center px-5 pb-14 pt-20 sm:px-8 md:min-h-[calc(100svh-4rem)] md:pb-40 lg:px-12">
          <div className="max-w-[42rem]">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              MAKLERHAUS · AURICH & OSTFRIESLAND
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-[3.2rem] leading-[1.02] tracking-[-0.018em] text-[color:var(--color-navy)] sm:text-[4.1rem] lg:text-[5rem]">
              Frisia Immobilien:
              <br />
              Das Maklerhaus
            </h1>
            <div className="mt-8 h-1 w-28 bg-[color:var(--color-brass)]" />
            <p className="mt-8 max-w-[36rem] text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:text-[1.28rem]">
              Persönlich. Regional. Verlässlich.
              <br />
              Wir stehen für klare Kommunikation, kompetente Beratung und partnerschaftliche Zusammenarbeit – mit mehr als 50 Jahren gemeinsamer Berufserfahrung.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="#team"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                Mehr über unser Maklerhaus
              </Link>
              <a
                href={PHONE_HREF}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[color:var(--color-brass)]/65 bg-white/88 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
              >
                <span aria-hidden="true">☎</span>
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white/94 shadow-[0_-18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:absolute md:inset-x-0 md:bottom-0">
          <div className="mx-auto grid max-w-[1240px] gap-4 px-5 py-6 sm:px-8 md:grid-cols-4 md:gap-0 lg:px-12">
            {[
              { icon: "F", text: "Regional verwurzelt in Aurich & Ostfriesland" },
              { icon: "◎", text: "Persönliche Ansprechpartner statt anonymer Abläufe" },
              { icon: "☆", text: "Über 25 Jahre Erfahrung auf dem Immobilienmarkt" },
              { icon: "✓", text: "Seriös. Diskret. Vertrauensvoll." },
            ].map((item, index) => (
              <div key={item.text} className={`flex items-center gap-4 ${index > 0 ? "md:border-l md:border-[color:var(--color-brass)]/25 md:pl-8" : ""}`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-navy)]/20 text-xl font-semibold text-[color:var(--color-navy)]">
                  {item.icon}
                </span>
                <p className="text-sm font-medium leading-[1.45] text-[color:var(--color-navy)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 md:py-18">
        <div className="mx-auto grid w-full max-w-[1240px] gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">Standort und Prinzip</p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">
              Dort arbeiten, wo der Markt entsteht
            </h2>
            <div className="mt-5 space-y-4 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              <p>
                Frisia Immobilien ist ein inhabergeführtes Maklerhaus mit Sitz in Aurich - direkt an der Haxtumer Mühle, zwischen den gewachsenen Wohnlagen in Extum und den Neubaugebieten im Timp und in Haxtum.
              </p>
              <p>
                Diese Lage ist bewusst gewählt: Aurich bildet als wirtschaftliches und geografisches Zentrum den Mittelpunkt des Immobilienmarktes in Ostfriesland. Von hier aus lassen sich Marktbewegungen früh erkennen, Entwicklungen einordnen und Entscheidungen fundiert treffen.
              </p>
              <p>
                Frisia Immobilien arbeitet genau dort, wo sich Angebot, Nachfrage und Preisentwicklung konzentrieren - nah am Markt, nah an den Menschen und mit einem klaren Verständnis für die Region.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <article className="rounded-[1.8rem] border border-[color:var(--color-navy)]/10 bg-[color:var(--color-section)]/70 p-6 md:p-7">
              <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Gewachsene Strukturen. Neue Entwicklung.</h3>
              <div className="mt-4 space-y-4 text-base leading-[1.8] text-[color:var(--color-graphite)]">
                <p>
                  Diese Lage ist kein Zufall. Sie verbindet zwei entscheidende Faktoren: gewachsene Strukturen und neue Entwicklung. Genau dort, wo sich der Markt bewegt, ist Frisia Immobilien positioniert.
                </p>
                <p>
                  Der Standort bietet kurze Wege, eigene Parkplätze und eine direkte Erreichbarkeit - bewusst gewählt für eine unkomplizierte Zusammenarbeit vor Ort.
                </p>
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-[color:var(--color-navy)]/10 bg-white p-6 shadow-[0_18px_50px_-42px_rgba(27,48,64,0.28)] md:p-7">
              <h3 className="text-xl font-semibold text-[color:var(--color-navy)]">Das Frisia Prinzip</h3>
              <div className="mt-4 space-y-4 text-base leading-[1.8] text-[color:var(--color-graphite)]">
                <p>
                  Das Frisia Prinzip steht für eine klare Haltung: Moderne Vermarktung auf dem neuesten Stand der Technik - kombiniert mit klassischen Werten wie Verlässlichkeit, persönlicher Verantwortung und strukturierter Arbeitsweise.
                </p>
                <p>
                  Eigentümer haben einen festen Ansprechpartner. Entscheidungen werden nicht delegiert, sondern begleitet. Jeder Schritt im Verkaufsprozess folgt einer klaren Struktur - von der fundierten Bewertung bis zum rechtssicheren Abschluss.
                </p>
              </div>
            </article>

            <div className="rounded-[1.8rem] bg-[color:var(--color-navy)] p-6 text-white md:p-7">
              <p className="text-base leading-[1.8] text-white/88">
                Frisia Immobilien arbeitet dort, wo der Markt entsteht: in den gefragten Wohnlagen von Aurich und im gesamten ostfriesischen Raum.
              </p>
              <p className="mt-4 text-xl font-semibold leading-[1.45]">
                Neueste Technik. Klare Prozesse. Und ein Verständnis für Immobilien, das auf Erfahrung und Verantwortung basiert.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16">
        <div className="rounded-[2rem] border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-6 md:p-8">
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

      <section className="bg-[color:var(--color-section)] py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">Werte und Arbeitsweise</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-2xl font-semibold text-[color:var(--color-navy)]">Persönliche Verantwortung</h3>
              <p className="mt-3 text-base leading-[1.75] text-[color:var(--color-graphite)]">
                Eigentümer haben feste Ansprechpartner und klare Zuständigkeiten im gesamten Ablauf bis zum Notartermin.
              </p>
            </article>
            <article className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-2xl font-semibold text-[color:var(--color-navy)]">Klare Struktur statt Reizüberflutung</h3>
              <p className="mt-3 text-base leading-[1.75] text-[color:var(--color-graphite)]">
                Jeder Prozessschritt ist nachvollziehbar aufgebaut: Bewertung, Unterlagen, Vermarktung, Verhandlung und Abschluss.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)] md:text-4xl">FAQ zum Maklerhaus Frisia Immobilien</h2>
        <div className="mt-6 space-y-4">
          {faq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-[color:var(--color-brass)]/25 bg-white p-6">
              <h3 className="text-xl font-semibold leading-[1.4] text-[color:var(--color-navy)]">{item.question}</h3>
              <p className="mt-2 text-base leading-[1.75] text-[color:var(--color-graphite)]">{item.answer}</p>
            </article>
          ))}
        </div>

        <aside className="mt-8 rounded-2xl border border-[color:var(--color-brass)]/25 bg-[color:var(--color-section)] p-6">
          <h4 className="text-lg font-semibold text-[color:var(--color-navy)]">Interne Verlinkung</h4>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-graphite)]">
            <li>
              <Link href="/immobilienmakler-aurich" className="underline underline-offset-4">
                Immobilienmakler Aurich
              </Link>
            </li>
            <li>
              <Link href="/immobilie-verkaufen-aurich" className="underline underline-offset-4">
                Immobilie verkaufen Aurich
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="underline underline-offset-4">
                Persönliche Beratung
              </Link>
            </li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
