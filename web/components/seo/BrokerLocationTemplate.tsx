import Image from "next/image";
import Link from "next/link";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import type { SeoLocationRow } from "@/lib/types/leadgen";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

function formatLocationLabel(label: string) {
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return label;
  return `${parts[0]}, ${parts.slice(1).join(", ")}`;
}

function formatLocationForTemplate(location: SeoLocationRow) {
  const label = location.location_label.trim();
  const city = location.stadt_gemeinde?.trim();
  const district = location.ortsteil?.trim() || label;
  if (location.location_type === "ortsteil" && city && district && district !== city) return `${district}, ${city}`;
  return formatLocationLabel(label);
}

function formatLocationForProse(location: SeoLocationRow) {
  const label = location.location_label.trim();
  const city = location.stadt_gemeinde?.trim();
  const district = location.ortsteil?.trim() || label;
  if (location.location_type === "ortsteil" && city && district && district !== city) return `${district} in ${city}`;
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return label;
  return `${parts[0]} in ${parts.slice(1).join(", ")}`;
}

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

function iconTypeForBullet(text: string) {
  const item = text.toLowerCase();
  if (item.includes("preis") || item.includes("einpreisung") || item.includes("verkaufspreise")) return "price";
  if (item.includes("unterlagen") || item.includes("exposé") || item.includes("objektunterlagen")) return "document";
  if (item.includes("käufer") || item.includes("zielgruppen")) return "buyers";
  if (item.includes("bonität") || item.includes("kaufabsicht")) return "check";
  if (item.includes("verhandlung") || item.includes("abschluss")) return "handshake";
  if (item.includes("aktuell") || item.includes("nächsten schritte")) return "process";
  if (item.includes("entscheidung")) return "target";
  if (item.includes("nachfrage")) return "chart";
  if (item.includes("mikrolagen") || item.includes("lage")) return "pin";
  if (item.includes("notar")) return "signature";
  if (item.includes("übergabe") || item.includes("zahlungsfluss")) return "key";
  return "check";
}

function BulletIcon({ item }: { item: string }) {
  const iconType = iconTypeForBullet(item);
  const icon =
    iconType === "price" ? (
      <path d="M7 7.5h8.5M7 12h7M7 16.5h8.5M18 5l-3 14" />
    ) : iconType === "document" ? (
      <path d="M7 3.8h7l3 3V20H7V3.8zM14 3.8V7h3M9.5 11h5M9.5 14.5h5M9.5 18h3" />
    ) : iconType === "buyers" ? (
      <path d="M9 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 19.5c.7-3.2 2.5-5 5-5 1.8 0 3.2.9 4 2.5M16.5 11a2.4 2.4 0 1 0 0-4.8M15.5 14.5c2.1.2 3.7 1.8 4.3 5" />
    ) : iconType === "handshake" ? (
      <path d="M7 12.5l3.2 3.2c.7.7 1.8.7 2.5 0l4.8-4.8M3.5 12l3-3 3 3M20.5 12l-3-3-3 3" />
    ) : iconType === "process" ? (
      <path d="M7 7h10M7 12h7M7 17h10M18 12l2 2 3-4" />
    ) : iconType === "target" ? (
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    ) : iconType === "chart" ? (
      <path d="M5 18h14M7 15v-4M12 15V6M17 15v-7M6 9l4 3 4-5 4 2" />
    ) : iconType === "pin" ? (
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11zM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z" />
    ) : iconType === "signature" ? (
      <path d="M6 19h12M7 14c2.5-4.2 4.8-6.8 6.8-7.7.8-.4 1.6.4 1.2 1.2-.8 2-3.4 4.3-7.6 6.8L6 18l3.7-1.4z" />
    ) : iconType === "key" ? (
      <path d="M9.5 14a4.5 4.5 0 1 1 4-2.5L21 19l-2 2-2-2-2 2-2.5-2.5M9.5 14a4.5 4.5 0 0 1-4.5-4.5" />
    ) : (
      <path d="M5 12.5l4.3 4.3L19 7.2" />
    );

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-section)] text-[color:var(--color-brackish)]">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </g>
      </svg>
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-t border-[color:var(--color-brass)]/20 first:border-t-0">
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
  const location = formatLocationForTemplate(data.location);
  const proseLocation = formatLocationForProse(data.location);
  const heroImage = "/images/immobilienbewertung/hero-background.png";

  const faqs = [
    {
      question: `Warum sollte ich einen Immobilienmakler in ${proseLocation} beauftragen?`,
      answer: "Ein Makler übernimmt nicht nur die Vermarktung, sondern strukturiert den gesamten Verkaufsprozess. Das betrifft Bewertung, Strategie, Käuferauswahl, Verhandlung und Abschluss.",
    },
    {
      question: "Woran erkenne ich einen guten Makler?",
      answer: "An klarer Struktur, nachvollziehbarer Bewertung, transparenter Arbeitsweise und daran, wie sauber der Verkaufsprozess geführt wird - nicht an Versprechen.",
    },
    {
      question: `Unterscheidet sich der Markt in ${proseLocation} stark von anderen Regionen?`,
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
      <section className="relative isolate overflow-hidden bg-[color:var(--color-section)]">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-right opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.50)_34%,rgba(255,255,255,0.18)_58%,rgba(255,255,255,0.04)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-[1440px] gap-8 px-5 py-14 sm:px-8 md:py-16 lg:grid-cols-[1.28fr_0.72fr] lg:items-center lg:px-12">
          <div className="max-w-[58rem]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-brackish)]">
              Immobilienmakler in {location}
            </p>
            <h1 className="mt-5 max-w-full break-normal font-[family-name:var(--font-playfair)] text-[clamp(2.65rem,4.8vw,4.8rem)] leading-[1.01] text-[color:var(--color-navy)] [hyphens:none] [overflow-wrap:normal]">
              Immobilienmakler
              <span className="block">in {location}</span>
            </h1>
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

      <Section title={`Warum ein Immobilienverkauf in ${proseLocation} ohne Struktur riskant wird`}>
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

      <Section title={`Wie wir den Verkauf deiner Immobilie in ${proseLocation} führen`}>
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

      <Section title={`Marktkenntnis in ${proseLocation} - entscheidend für den richtigen Verkauf`} muted>
        <p>Jeder Ort hat seine eigene Dynamik. Auch innerhalb von {proseLocation} unterscheiden sich Lagen, Nachfrage und Preisniveaus teilweise deutlich.</p>
        <BulletList
          items={[
            "reale Verkaufspreise, nicht nur Angebote",
            "aktuelle Nachfrageentwicklung",
            `typische Käufergruppen in ${proseLocation}`,
            "Unterschiede zwischen Mikrolagen",
          ]}
        />
        <p>Diese Marktkenntnis fließt direkt in Bewertung, Preisstrategie und Vermarktung ein.</p>
        <p className="font-semibold text-[color:var(--color-navy)]">Ein Verkauf funktioniert dann gut, wenn deine Immobilie korrekt in den lokalen Markt eingeordnet wird.</p>
      </Section>

      <Section title={`Sicherheit beim Immobilienverkauf in ${proseLocation}`}>
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
            Zusammenarbeit mit einem Immobilienmakler in {proseLocation} einordnen
          </h2>
          <p className="mt-5 max-w-4xl text-base leading-[1.8] text-white/86 md:text-lg">
            Wenn du überlegst, deine Immobilie in {proseLocation} mit einem Makler zu verkaufen, klären wir gemeinsam, ob und wie eine Zusammenarbeit für dich sinnvoll ist.
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
            Häufige Fragen zum Immobilienmakler in {proseLocation}
          </h2>
          <div className="mt-6 divide-y divide-[color:var(--color-brass)]/20 rounded-xl border border-[color:var(--color-brass)]/25 bg-white shadow-[0_18px_70px_-64px_rgba(27,48,64,0.45)]">
            {faqs.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
