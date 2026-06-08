import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  BRAND_NAME,
  EMAIL,
  LEGAL_NAME,
  PHONE_DISPLAY,
  PHONE_HREF,
} from "@/lib/site";

function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

type NavigationLink = {
  href: string;
  label: string;
  className?: string;
};

type NavigationColumn = {
  title: string;
  links: readonly NavigationLink[];
};

const navigationColumns: readonly NavigationColumn[] = [
  {
    title: "Verkaufen & Bewerten",
    links: [
      { href: "/haus-verkaufen-aurich", label: "Haus verkaufen in Aurich" },
      { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
      { href: "/immobilienpreise-aurich", label: "Immobilienpreise Aurich" },
      { href: "/verkaufssituationen", label: "Verkaufssituationen" },
      { href: "/immobilie-verkaufen-alter", label: "Verkauf im Alter" },
      { href: "/immobilie-verkaufen-erbschaft", label: "Verkauf nach Erbschaft" },
      { href: "/immobilie-verkaufen-scheidung", label: "Verkauf bei Scheidung" },
      { href: "/immobilie-verkaufen-zeitdruck", label: "Verkauf unter Zeitdruck" },
    ],
  },
  {
    title: "Über Frisia Immobilien",
    links: [
      { href: "/maklerhaus", label: "Das Maklerhaus" },
      { href: "/partner", label: "Partner" },
      { href: "/#standort-aurich", label: "Standort Aurich" },
      { href: "/#kundenstimmen", label: "Kundenstimmen" },
      { href: "/kontakt", label: "Kontaktformular", className: "underline underline-offset-4 decoration-white/70" },
    ],
  },
  {
    title: "Karriere",
    links: [
      { href: "/karriere#immobilienmakler-werden", label: "Immobilienmakler werden" },
      { href: "/karriere#ausbildung", label: "Ausbildung bei Frisia Immobilien" },
    ],
  },
  {
    title: "Presse",
    links: [
      { href: "/presse", label: "Presseberichte" },
    ],
  },
] as const;

const seoGroups = [
  {
    title: "Region",
    links: [
      { href: "/immobilienmakler-aurich", label: "Immobilienmakler Aurich" },
      { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
      { href: "/immobilienmakler-ostfriesland", label: "Immobilienmakler Ostfriesland" },
    ],
  },
  {
    title: "Städte",
    links: [
      { href: "/immobilienmakler-emden", label: "Immobilienmakler Emden" },
      { href: "/immobilienmakler-norden", label: "Immobilienmakler Norden" },
      { href: "/immobilienmakler-wiesmoor", label: "Immobilienmakler Wiesmoor" },
      { href: "/immobilienmakler-wittmund", label: "Immobilienmakler Wittmund" },
      { href: "/immobilienmakler-leer", label: "Immobilienmakler Leer" },
    ],
  },
  {
    title: "Gemeinden",
    links: [
      { href: "/immobilienmakler-grossheide", label: "Immobilienmakler Großheide" },
      { href: "/immobilienmakler-suedbrookmerland", label: "Immobilienmakler Südbrookmerland" },
      { href: "/immobilienmakler-krummhoern", label: "Immobilienmakler Krummhörn" },
      { href: "/immobilienmakler-friedeburg", label: "Immobilienmakler Friedeburg" },
      { href: "/immobilienmakler-hage", label: "Immobilienmakler Hage" },
    ],
  },
  {
    title: "Nordseeinseln",
    links: [
      { href: "/immobilienmakler-norderney", label: "Immobilienmakler Norderney" },
      { href: "/immobilienmakler-juist", label: "Immobilienmakler Juist" },
      { href: "/immobilienmakler-langeoog", label: "Immobilienmakler Langeoog" },
      { href: "/immobilienmakler-spiekeroog", label: "Immobilienmakler Spiekeroog" },
      { href: "/immobilienmakler-baltrum", label: "Immobilienmakler Baltrum" },
    ],
  },
] as const;

const legalLinks = [
  { href: "/recht/impressum", label: "Impressum" },
  { href: "/recht/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/recht/cookies", label: "Cookie-Hinweise" },
] as const;

const socialLinks = [
  { href: "https://www.instagram.com", label: "Instagram", platform: "instagram" as const },
  { href: "https://www.facebook.com", label: "Facebook", platform: "facebook" as const },
  { href: "https://www.linkedin.com", label: "LinkedIn", platform: "linkedin" as const },
] as const;

const footerDividerClass =
  "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.075)_20%,rgba(255,255,255,0.075)_80%,transparent_100%)] after:content-['']";

const footerTopDividerClass =
  "relative before:absolute before:left-0 before:right-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.075)_20%,rgba(255,255,255,0.075)_80%,transparent_100%)] before:content-['']";

const footerSoftTopDividerClass =
  "relative before:absolute before:left-0 before:right-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.05)_20%,rgba(255,255,255,0.05)_80%,transparent_100%)] before:content-['']";

const footerHoverLinkClass =
  "relative w-fit text-white transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-full after:-translate-x-1/2 after:origin-center after:bg-white after:scale-x-0 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100";

const footerInlineHoverLinkClass =
  "relative inline-flex w-fit items-center text-white transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-full after:-translate-x-1/2 after:origin-center after:bg-white after:scale-x-0 after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100";

function SocialIcon({
  platform,
  className = "",
}: {
  platform: "instagram" | "facebook" | "linkedin";
  className?: string;
}) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-5 w-5 ${className}`}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-5 w-5 ${className}`}>
        <path
          d="M13.2 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.3-1.4 1.5-1.4h1.4V5.5c-.2 0-.9-.1-1.8-.1-2.5 0-4 1.3-4 3.9v1.9H8v2.8h2.4v7h2.8z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (platform === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-5 w-5 ${className}`}>
        <rect x="4" y="9.5" width="3.2" height="10.5" fill="currentColor" />
        <circle cx="5.6" cy="6.4" r="1.8" fill="currentColor" />
        <path d="M10.1 9.5h3v1.5h.1c.5-.9 1.6-1.8 3.5-1.8 3.1 0 3.7 2.1 3.7 4.8V20h-3.1v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20h-3.1V9.5z" fill="currentColor" />
      </svg>
    );
  }

  return null;
}

function SeoGroupsGrid({ className }: { className: string }) {
  return (
    <div className={className}>
      {seoGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <p className="font-[family-name:var(--font-playfair)] text-xs font-semibold uppercase tracking-[0.14em] text-white/78">{group.title}</p>
          <div className="space-y-1.5 text-sm leading-6 text-white/58">
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${footerHoverLinkClass} block`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer
      data-site-footer="true"
      className={`${footerTopDividerClass} relative isolate overflow-hidden bg-[linear-gradient(180deg,var(--color-navy)_0%,color-mix(in_srgb,var(--color-navy)_95%,black)_100%)] text-white/82 [content-visibility:auto] [contain-intrinsic-size:1800px] md:[contain-intrinsic-size:1450px]`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0.7px, transparent 0.8px), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12) 0.6px, transparent 0.75px), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.14) 0.65px, transparent 0.8px)",
          backgroundSize: "15px 15px, 19px 19px, 17px 17px",
          backgroundPosition: "0 0, 7px 11px, 13px 5px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-[url('/images/frisia/frisia_f.webp')] bg-no-repeat opacity-[0.7] [background-position:-50px_30px] [background-size:min(102vw,_1260px)_auto] md:block"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section className={`${footerDividerClass} py-12 sm:py-14 lg:py-16`}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] xl:gap-14">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="font-[family-name:var(--font-playfair)] text-4xl leading-none text-white sm:text-5xl">
                  {BRAND_NAME}
                </p>
                <address className="not-italic text-base leading-8 text-white/78">
                  {LEGAL_NAME}
                  <br />
                  Oldersumer Straße 150
                  <br />
                  26605 Aurich
                </address>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-[0.14em] text-white/82">Direkter Kontakt</p>
                  <div className="mt-4 space-y-2 text-base leading-8">
                    <a
                      href={PHONE_HREF}
                      className={`${footerHoverLinkClass} block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-navy)]`}
                    >
                      {`Telefon ${PHONE_DISPLAY}`}
                    </a>
                    <a
                      href={`mailto:${EMAIL}`}
                      className={`${footerHoverLinkClass} block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-navy)]`}
                    >
                      {EMAIL}
                    </a>
                    <p>Aurich und Ostfriesland</p>
                  </div>
                </div>

                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-[0.14em] text-white/82">Öffnungszeiten</p>
                  <div className="mt-4 space-y-2 text-base leading-8">
                    <p>Montag bis Freitag</p>
                    <p>09:00 bis 18:00 Uhr</p>
                    <p>Donnerstag nach Termin</p>
                    <p>18:00 bis 20:00 Uhr</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:var(--color-brass)]/20 bg-white p-6 shadow-[0_12px_40px_rgba(21,39,53,0.06)] sm:p-7 lg:col-span-2 lg:self-start">
              <p className="font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brackish)]">Schnellzugriff</p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/immobilienbewertung-aurich"
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#28465d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-navy)]"
                >
                  Meine Immobilie kostenlos bewerten
                </Link>
                <a
                  href={PHONE_HREF}
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-[color:var(--color-brass)]/45 bg-white px-6 py-3 text-base font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-sand)]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-navy)]"
                >
                  Anrufen
                </a>
              </div>
              <div className="mt-6 flex justify-center md:justify-start">
                <a
                  href="#top"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:text-[color:var(--color-brackish)]"
                >
                  <span aria-hidden="true" className="flex h-5 w-5 -translate-y-[1px] items-center justify-center">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5-5 5 5" />
                      <path d="M5 17l5-5 5 5" />
                    </svg>
                  </span>
                  <span>Nach oben</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={`${footerDividerClass} py-12 sm:py-14`}>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {navigationColumns.map((column) => (
              <nav key={column.title} aria-label={column.title} className="space-y-4">
                <p className="font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-[0.14em] text-white/82">{column.title}</p>
                <div className="space-y-3">
                  {column.links.map((link) => (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className={`${footerHoverLinkClass} block text-base leading-7 ${link.className ?? ""}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}
          </div>
        </section>

        <section className={`${footerDividerClass} py-10 sm:py-12`}>
          <SeoGroupsGrid className="hidden gap-8 md:grid md:grid-cols-2 lg:grid-cols-4" />

          <details className="group md:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/78 [&::-webkit-details-marker]:hidden">
              <span>Immobilienmakler in der Region</span>
              <span
                aria-hidden="true"
                className="text-base leading-none transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <SeoGroupsGrid className="mt-5 grid gap-6 sm:grid-cols-2" />
          </details>
        </section>

        <section className="py-10 sm:py-12">
          <div className="flex flex-col gap-8">
            <div className="grid gap-5 lg:grid-cols-4 lg:gap-8">
              <div className="space-y-4 lg:col-span-2">
                <p className="font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-[0.14em] text-white/82">Rechtliches & Vertrauen</p>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs leading-6">
                  {legalLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={footerInlineHoverLinkClass}>
                      {link.label}
                    </Link>
                  ))}
                  <button type="button" data-cookie-settings-trigger className={`${footerInlineHoverLinkClass} cursor-pointer text-left text-xs`}>
                    Cookie-Einstellungen ändern
                  </button>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-5 lg:col-span-2 lg:col-start-3 lg:border-t-0 lg:pt-0">
                <p className="font-[family-name:var(--font-playfair)] text-sm font-semibold uppercase tracking-[0.14em] text-white/82">Social Media</p>
                <div className="flex flex-wrap gap-x-5 gap-y-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${footerInlineHoverLinkClass} group gap-2 text-sm`}
                    >
                      <SocialIcon platform={link.platform} className="text-white/88 transition-colors group-hover:text-white" />
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${footerSoftTopDividerClass} space-y-2 pt-6 text-xs leading-6 text-white/62`}>
              <p>„Frisia Immobilien“ ist als Marke beim DPMA (Deutsches Patent- und Markenamt) angemeldet.</p>
              <p>{`© 2026 ${BRAND_NAME} · Regionaler Immobilienmakler in Aurich, Emden, Leer, Wittmund und Norden.`}</p>
              <p>Alle Rechte vorbehalten.</p>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}
