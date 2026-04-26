"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/lib/navigation";
import { ADDRESS, BRAND_NAME, PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export default function HomeHeader() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const hiddenRef = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMobileNavOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;

        if (mobileNavOpen || currentScrollY < 96) {
          setIsHidden(false);
          lastScrollY = currentScrollY;
          ticking = false;
          return;
        }

        if (Math.abs(delta) < 10) {
          ticking = false;
          return;
        }

        if (delta > 0) {
          if (!hiddenRef.current) {
            hiddenRef.current = true;
            setIsHidden(true);
          }
        } else {
          if (hiddenRef.current) {
            hiddenRef.current = false;
            setIsHidden(false);
          }
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileNavOpen]);

  const isHomePage = pathname === "/";

  const scrollToTopIfCurrentPage = (href: string) => {
    if (href !== pathname) return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  return (
    <>
      <div aria-hidden="true" className={isHomePage ? "h-16" : "h-4"} />
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-[color:var(--color-brass)]/20 bg-white/97 transition-transform duration-300 motion-reduce:transition-none ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center rounded-md py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]">
            {/* SVG logo as a plain image keeps the header chunk lighter than next/image here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Frisia Immobilien" width={176} height={44} className="h-11 w-auto" loading="eager" decoding="async" />
          </Link>

          <nav className="hidden items-center 2xl:flex" aria-label="Hauptnavigation">
            <ul className="flex items-center gap-3 text-[0.84rem] font-medium text-[color:var(--color-graphite)] xl:gap-4 xl:text-[0.9rem]">
              {MAIN_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    scroll
                    onClick={() => scrollToTopIfCurrentPage(item.href)}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`relative whitespace-nowrap rounded-md px-1 py-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)] after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-[calc(100%-0.5rem)] after:-translate-x-1/2 after:origin-center after:bg-[color:var(--color-navy)] after:transition-transform after:duration-300 ${
                      pathname === item.href
                        ? "text-[color:var(--color-navy)] after:scale-x-100"
                        : "text-[color:var(--color-graphite)] hover:text-[color:var(--color-navy)] after:scale-x-0 hover:after:scale-x-100"
                    }`}
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

            <button
              type="button"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-main-navigation"
              aria-label={mobileNavOpen ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setMobileNavOpen((open) => !open)}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-[color:var(--color-brass)]/35 text-[color:var(--color-navy)] transition-colors hover:border-[color:var(--color-brackish)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brass)]"
            >
              <span aria-hidden="true">{mobileNavOpen ? "✕" : "☰"}</span>
            </button>

            {mobileNavOpen ? (
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
                          scroll
                          onClick={() => {
                            setMobileNavOpen(false);
                            scrollToTopIfCurrentPage(item.href);
                          }}
                          aria-current={pathname === item.href ? "page" : undefined}
                          className={`block rounded-xl px-3 py-3 text-[1.85rem] font-semibold leading-[1.3] text-[color:var(--color-navy)] active:bg-[color:var(--color-brass)]/20 ${
                            pathname === item.href ? "bg-[color:var(--color-brass)]/15" : ""
                          }`}
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
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
