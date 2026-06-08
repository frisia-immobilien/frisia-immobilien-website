import type { AnchorHTMLAttributes, ReactNode } from "react";

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

const AURICH_HERO_LINKS = [
  { href: "/immobilienmakler-aurich", label: "Immobilienmakler Aurich" },
  { href: "/immobilienbewertung-aurich", label: "Immobilienbewertung Aurich" },
  { href: "/haus-verkaufen-aurich", label: "Haus verkaufen Aurich" },
] as const;

export default function AurichHeroLinks() {
  return (
    <nav
      aria-label="Für deine Situation relevant"
      className="border-y border-[color:var(--color-brass)]/18 bg-white"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-center gap-2 px-5 py-3 text-center sm:px-8 lg:px-12">
        <span className="mr-1 text-[0.82rem] font-semibold leading-6 text-[color:var(--color-navy)]">
          Für deine Situation relevant:
        </span>
        {AURICH_HERO_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-8 items-center rounded-full border border-[color:var(--color-brass)]/35 bg-[color:var(--color-section)]/45 px-3 py-1 text-[0.82rem] font-semibold leading-5 text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brass)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
