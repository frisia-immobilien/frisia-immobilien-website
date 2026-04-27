import type { AnchorHTMLAttributes, ReactNode } from "react";
import { MAIN_NAV_ITEMS } from "@/lib/navigation";
import { ADDRESS, BRAND_NAME, PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

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

export default function HomeHeader() {
  return (
    <>
      <div aria-hidden="true" className="h-16" />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--color-brass)]/20 bg-white/97">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center rounded-md py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
          >
            {/* SVG logo as a plain image keeps the header chunk lighter than next/image here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Frisia Immobilien"
              width={176}
              height={44}
              className="h-11 w-auto"
              loading="eager"
              decoding="async"
            />
          </Link>

          <nav className="hidden items-center 2xl:flex" aria-label="Hauptnavigation">
            <ul className="flex items-center gap-3 text-[0.84rem] font-medium text-[color:var(--color-graphite)] xl:gap-4 xl:text-[0.9rem]">
              {MAIN_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="relative whitespace-nowrap rounded-md px-1 py-1 text-[color:var(--color-graphite)] transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-[calc(100%-0.5rem)] after:-translate-x-1/2 after:origin-center after:scale-x-0 after:bg-[color:var(--color-navy)] after:transition-transform after:duration-300 hover:text-[color:var(--color-navy)] hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 2xl:flex">
            <a
              href={PHONE_HREF}
              className="inline-flex min-h-12 items-center whitespace-nowrap rounded-xl border border-[color:var(--color-brass)]/35 px-3 py-2 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              {`☎ ${PHONE_DISPLAY}`}
            </a>
          </div>

          <div className="flex items-center gap-2 2xl:hidden">
            <a
              href={PHONE_HREF}
              className="inline-flex min-h-12 items-center whitespace-nowrap rounded-xl border border-[color:var(--color-brass)]/35 px-3 py-2 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] hover:text-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              {`☎ ${PHONE_DISPLAY}`}
            </a>

            <details className="group">
              <summary
                aria-label="Menü öffnen"
                className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-xl border border-[color:var(--color-brass)]/35 text-[color:var(--color-navy)] transition-colors marker:hidden hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] [&::-webkit-details-marker]:hidden"
              >
                <span aria-hidden="true" className="group-open:hidden">☰</span>
                <span aria-hidden="true" className="hidden group-open:inline">✕</span>
              </summary>

              <div
                id="mobile-main-navigation"
                className="fixed inset-x-0 top-16 z-50 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[color:var(--color-brass)]/20 bg-white px-6 pb-10 pt-8"
              >
                <nav aria-label="Mobile Hauptnavigation">
                  <ul className="space-y-1">
                    {MAIN_NAV_ITEMS.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block rounded-xl px-3 py-3 text-[1.85rem] font-semibold leading-[1.3] text-[color:var(--color-navy)] active:bg-[color:var(--color-brass)]/20"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-8 border-t border-[color:var(--color-brass)]/20 pt-6">
                  <p className="text-[0.88rem] uppercase tracking-[0.1em] text-[color:var(--color-brackish)]">Direkt Kontakt</p>
                  <a href={PHONE_HREF} className="mt-2 block text-[1.35rem] font-semibold text-[color:var(--color-navy)]">
                    {PHONE_DISPLAY}
                  </a>
                  <p className="mt-1 text-sm text-[color:var(--color-graphite)]">
                    {`${BRAND_NAME} · ${ADDRESS.streetAddress} · ${ADDRESS.postalCode} ${ADDRESS.addressLocality}`}
                  </p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
