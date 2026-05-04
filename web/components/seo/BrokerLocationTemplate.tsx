import Image from "next/image";
import Link from "next/link";
import AurichHeroLinks from "@/components/site/AurichHeroLinks";
import HeroDivider from "@/components/site/HeroDivider";
import MobileHeroSection from "@/components/site/MobileHeroSection";
import RegionalCrossLinks from "@/components/seo/RegionalCrossLinks";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { formatLocationPhrase, formatLocationProseName } from "@/lib/seo/locationDisplay";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

function Section({
  title,
  children,
  muted = false,
  id,
}: {
  title: string;
  children: React.ReactNode;
  muted?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={muted ? "bg-[color:var(--color-section)] py-12 md:py-16" : "bg-white py-12 md:py-16"}>
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
        <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
          {title}
        </h2>
        <div className="mt-6 space-y-5 text-base leading-[1.78] text-[color:var(--color-graphite)] md:text-lg">
          {children}
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-lg border border-[color:var(--color-brass)]/45 border-l-4 border-l-[color:var(--color-brass)] bg-white px-5 py-5 shadow-[0_18px_44px_-38px_rgba(27,48,64,0.48)]">
      <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">{title}</h3>
      <p className="mt-2 text-base leading-7 text-[color:var(--color-graphite)]">{text}</p>
    </article>
  );
}

function iconAssetForBullet(text: string) {
  const item = text.toLowerCase();
  if (item.includes("verkauf aktuell") || item.includes("aktuell steht")) {
    return "/images/prozess/schritt_01.webp";
  }
  if (item.includes("nächsten schritte")) {
    return "/images/prozess/geordneter_ablauf.webp";
  }
  if (item.includes("entscheidungen sinnvoll") || item.includes("entscheidung")) {
    return "/images/immobilienmakler-aurich/zielscheibe.webp";
  }
  if (item.includes("reale verkaufspreise") || item.includes("verkaufspreise")) {
    return "/images/prozess/schritt_01.webp";
  }
  if (item.includes("nachfrageentwicklung") || item.includes("nachfrage")) {
    return "/images/prozess/schritt_05.webp";
  }
  if (item.includes("typische käufergruppen") || item.includes("käufergruppen")) {
    return "/images/prozess/schritt_06.webp";
  }
  if (item.includes("mikrolagen") || item.includes("lage")) {
    return "/images/prozess/schritt_04.webp";
  }
  if (item.includes("rechtssichere angaben") || item.includes("exposé")) {
    return "/images/immobilienmakler-aurich/klemmbrett.webp";
  }
  if (item.includes("objektunterlagen") || item.includes("unterlagen")) {
    return "/images/prozess/schritt_03.webp";
  }
  if (item.includes("notar")) {
    return "/images/prozess/schritt_09.webp";
  }
  if (item.includes("übergabe") || item.includes("zahlungsfluss")) {
    return "/images/prozess/schritt_02.webp";
  }
  if (item.includes("bonität") || item.includes("kaufabsicht")) {
    return "/images/prozess/schritt_06.webp";
  }
  if (item.includes("verhandlung") || item.includes("abschluss")) {
    return "/images/prozess/schritt_08.webp";
  }
  if (item.includes("preis") || item.includes("einpreisung") || item.includes("verkaufspreise")) {
    return "/images/prozess/schritt_01.webp";
  }
  if (item.includes("käufer") || item.includes("zielgruppen")) {
    return "/images/prozess/schritt_06.webp";
  }
  if (item.includes("aktuell")) return "/images/prozess/geordneter_ablauf.webp";
  return "/images/prozess/checkbox.webp";
}

function BulletIcon({ item }: { item: string }) {
  const iconSrc = iconAssetForBullet(item);

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)]/85 ring-1 ring-[color:var(--color-brass)]/12">
      <Image
        src={iconSrc}
        alt=""
        width={34}
        height={34}
        sizes="34px"
        aria-hidden="true"
        className="h-8 w-8 object-contain"
      />
    </span>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-4 rounded-lg border border-[color:var(--color-brass)]/35 bg-white px-5 py-4 font-semibold text-[color:var(--color-navy)]">
          <BulletIcon item={item} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FaqItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  return (
    <details className="group border-t border-[color:var(--color-brass)]/20 first:border-t-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 marker:hidden sm:px-6">
        <h3 className="text-base font-semibold leading-snug text-[color:var(--color-navy)] sm:text-lg">{question}</h3>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-xl leading-none text-[color:var(--color-navy)] transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-5 pb-6 pr-14 sm:px-6 sm:pr-20">
        <p className="text-base leading-[1.75] text-[color:var(--color-graphite)]">{answer}</p>
      </div>
    </details>
  );
}

export default function BrokerLocationTemplate({ data }: { data: LocationPageData }) {
  const proseLocation = formatLocationProseName(data.location);
  const locationPhrase = formatLocationPhrase(data.location);
  const heroImage = "/images/immobilienbewertung/hero-background.webp";

  const faqs = [
    {
      question: `Warum sollte ich einen Immobilienmakler ${locationPhrase} beauftragen?`,
      answer: "Ein Makler übernimmt nicht nur die Vermarktung, sondern strukturiert den gesamten Verkaufsprozess. Das betrifft Bewertung, Strategie, Käuferauswahl, Verhandlung und Abschluss.",
    },
    {
      question: "Woran erkenne ich einen guten Makler?",
      answer: "An klarer Struktur, nachvollziehbarer Bewertung, transparenter Arbeitsweise und daran, wie sauber der Verkaufsprozess geführt wird - nicht an Versprechen.",
    },
    {
      question: `Unterscheidet sich der Markt ${locationPhrase} stark von anderen Regionen?`,
      answer: "Ja. Auch innerhalb von Ostfriesland gibt es deutliche Unterschiede in Nachfrage, Preisniveau und Käuferstruktur. Lokale Marktkenntnis ist daher entscheidend.",
    },
    {
      question: "Wie läuft die Zusammenarbeit mit Frisia Immobilien ab?",
      answer: "Die Zusammenarbeit beginnt mit einer klaren Einschätzung deiner Situation und führt über Bewertung, Strategie, Vermarktung und Käuferprüfung bis zum Abschluss - strukturiert und nachvollziehbar.",
    },
    {
      question: "Ist ein erstes Gespräch verpflichtend?",
      answer: "Nein. Es dient ausschließlich der Einordnung deiner Situation und der Klärung, ob und wie eine Zusammenarbeit sinnvoll ist.",
    },
  ];

  return (
    <>
      <MobileHeroSection
        eyebrow={`Immobilienmakler ${locationPhrase}`}
        title={<>Immobilienmakler {locationPhrase}</>}
        description={
          <>
            Was ein Makler heute wirklich leisten muss - und worauf es beim Verkauf deiner Immobilie ankommt.
          </>
        }
        imageSrc={heroImage}
        imageAlt=""
        imagePosition="76% center"
        primaryCta={{ href: "#zusammenarbeit-verstehen", label: "Zusammenarbeit verstehen" }}
        secondaryCta={{ href: PHONE_HREF, label: "Einfach kurz sprechen", sublabel: PHONE_DISPLAY }}
        trustItems={["Klare Bewertung", "Strukturierter Verkauf", "Geprüfte Käufer"]}
      />

      <section className="relative isolate hidden overflow-hidden bg-[color:var(--color-section)] md:block">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-right opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.50)_34%,rgba(255,255,255,0.18)_58%,rgba(255,255,255,0.04)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-8 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[1.28fr_0.72fr] lg:items-center lg:px-12">
          <div className="max-w-[58rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Immobilienmakler {locationPhrase}
            </p>
            <h1 className="mt-5 max-w-full break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              Immobilienmakler
              <span className="block">{locationPhrase}</span>
            </h1>
            <HeroDivider />
            <p className="mt-7 max-w-3xl text-[1.15rem] leading-[1.65] text-[color:var(--color-navy)] md:text-[1.35rem]">
              Was ein Makler heute wirklich leisten muss - und worauf
              <span className="block">es beim Verkauf deiner Immobilie ankommt.</span>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#zusammenarbeit-verstehen" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--color-navy)] px-7 py-4 text-base font-semibold text-white transition hover:bg-[color:var(--color-brackish)]">
                Zusammenarbeit verstehen
              </Link>
              <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[color:var(--color-brass)]/45 bg-white/75 px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
                {PHONE_DISPLAY}
              </a>
            </div>
            <ul className="mt-6 flex max-w-3xl flex-col gap-3 text-sm font-semibold leading-6 text-[color:var(--color-navy)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
              {["Klare Bewertung", "Strukturierter Verkauf", "Geprüfte Käufer"].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-navy)] text-[color:var(--color-navy)]">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-2 w-2" fill="none">
                      <path d="m4 8.2 2.4 2.4L12 5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[color:var(--color-brass)]/25 bg-white/92 p-6 shadow-[0_28px_90px_-58px_rgba(27,48,64,0.65)] backdrop-blur md:p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
              Ein Makler ist nicht einfach ein Vermittler.
            </h2>
            <p className="mt-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">
              Er entscheidet darüber, wie dein Verkauf vorbereitet wird, wie Käufer reagieren und wie sicher der Abschluss erfolgt.
            </p>
          </div>
        </div>
      </section>

      <AurichHeroLinks />
      <RegionalCrossLinks data={data} placement="hero" />

      <Section title={`Warum ein Immobilienverkauf ${locationPhrase} ohne Struktur riskant wird`}>
        <p>Ein Immobilienverkauf wirkt auf den ersten Blick überschaubar: Objekt einstellen, Anfragen beantworten, Besichtigungen durchführen.</p>
        <p>In der Praxis entscheidet jedoch die Struktur dahinter über den Erfolg.</p>
        <BulletList
          items={[
            "realistische Einpreisung statt Wunschpreis",
            "vollständige und korrekte Unterlagen",
            "gezielte Ansprache der richtigen Käufer",
            "Einschätzung von Bonität und Kaufabsicht",
            "sichere Verhandlung und Abschlussvorbereitung",
          ]}
        />
        <p>Ohne klare Struktur entstehen schnell Fehler: falsche Preisansätze, unnötige Besichtigungen, unsichere Käufer oder Verzögerungen im Abschluss.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Ein Makler ist nicht dafür da, dein Haus online zu stellen, sondern den gesamten Verkaufsprozess sicher zu führen.</p>
      </Section>

      <Section title="Was Frisia Immobilien anders macht" muted>
        <p>Nicht jeder Makler arbeitet gleich. Der Unterschied liegt in der Vorgehensweise.</p>
        <p>Frisia Immobilien verbindet klassische Werte mit strukturierter, datenbasierter Arbeit.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title="Struktur statt Zufall" text="Jeder Verkauf folgt einem klaren Ablauf - von der ersten Einschätzung bis zum Abschluss." />
          <InfoCard title="Datenbasierte Bewertung" text={`Preisentscheidungen basieren nicht auf Gefühl, sondern auf realen Marktdaten aus ${proseLocation} und Umgebung.`} />
          <InfoCard title="Gezielte Vermarktung" text="Nicht möglichst viele Anfragen, sondern die richtigen Interessenten." />
          <InfoCard title="Klare Käuferprüfung" text="Wir unterscheiden zwischen Interesse und tatsächlicher Kaufbereitschaft." />
          <InfoCard title="Persönliche Verantwortung" text="Ein Ansprechpartner, der den gesamten Prozess begleitet." />
        </div>
      </Section>

      <Section title={`Wie wir den Verkauf deiner Immobilie ${locationPhrase} führen`}>
        <p>Unsere Arbeitsweise ist bewusst ruhig, strukturiert und nachvollziehbar.</p>
        <BulletList
          items={[
            "wo dein Verkauf aktuell steht",
            "welche nächsten Schritte folgen",
            "welche Entscheidungen sinnvoll sind",
          ]}
        />
        <p>Wir reduzieren Komplexität, statt sie zu erhöhen.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Du musst dich nicht in Details einarbeiten. Du bekommst eine klare Führung durch den gesamten Prozess.</p>
      </Section>

      <Section title={`Marktkenntnis ${locationPhrase} - entscheidend für den richtigen Verkauf`} muted>
        <p>Jeder Ort hat seine eigene Dynamik. Auch innerhalb von {proseLocation} unterscheiden sich Lagen, Nachfrage und Preisniveaus teilweise deutlich.</p>
        <BulletList
          items={[
            "reale Verkaufspreise, nicht nur Angebote",
            "aktuelle Nachfrageentwicklung",
            `typische Käufergruppen ${locationPhrase}`,
            "Unterschiede zwischen Mikrolagen",
          ]}
        />
        <p>Diese Marktkenntnis fließt direkt in Bewertung, Preisstrategie und Vermarktung ein.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Ein Verkauf funktioniert dann gut, wenn deine Immobilie korrekt in den lokalen Markt eingeordnet wird.</p>
      </Section>

      <Section title={`Sicherheit beim Immobilienverkauf ${locationPhrase}`}>
        <p>Ein Immobilienverkauf ist nicht nur eine wirtschaftliche Entscheidung, sondern auch eine rechtliche und organisatorische.</p>
        <BulletList
          items={[
            "vollständige und korrekte Objektunterlagen",
            "rechtssichere Angaben im Exposé",
            "saubere Abstimmung mit dem Notar",
            "klare Regelung von Übergabe und Zahlungsfluss",
          ]}
        />
        <p>Wir begleiten diese Schritte strukturiert und achten darauf, dass keine Lücken entstehen.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Sicherheit entsteht nicht am Ende - sondern durch einen sauberen Prozess von Anfang an.</p>
      </Section>

      <section id="zusammenarbeit-verstehen" className="bg-[color:var(--color-navy)] py-12 text-white md:py-16">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight md:text-[2.85rem]">
            Zusammenarbeit mit einem Immobilienmakler {locationPhrase} einordnen
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Wenn du überlegst, deine Immobilie {locationPhrase} mit einem Makler zu verkaufen, klären wir gemeinsam, ob und wie eine Zusammenarbeit für dich sinnvoll ist.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/kontakt" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-[color:var(--color-navy)]">
              Gespräch starten
            </Link>
            <a href={PHONE_HREF} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/35 px-7 py-4 text-base font-semibold text-white">
              {PHONE_DISPLAY}
            </a>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/78">
            Ein erstes Gespräch reicht, um den Ablauf, die Möglichkeiten und den nächsten Schritt klar zu verstehen.
          </p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-[2.15rem] leading-tight text-[color:var(--color-navy)] md:text-[2.85rem]">
            Häufige Fragen zum Immobilienmakler {locationPhrase}
          </h2>
          <div className="mt-6 divide-y divide-[color:var(--color-brass)]/20 rounded-xl border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_70px_-64px_rgba(27,48,64,0.45)]">
            {faqs.map((item, index) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
