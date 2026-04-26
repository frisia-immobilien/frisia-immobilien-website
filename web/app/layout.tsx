import type { Metadata, Viewport } from "next";
import "./globals.css";
import HomeHeader from "@/components/home/HomeHeader";
import SiteFooter from "@/components/site/SiteFooter";
import CookieBarShell from "@/components/CookieBarShell.client";
import JsonLd from "@/components/seo/JsonLd";
import {
  BRAND_NAME,
  DEFAULT_SOCIAL_IMAGE_PATH,
  DEFAULT_SITE_DESCRIPTION,
  SITE_URL,
  createLocalBusinessJsonLd,
  createPlaceJsonLd,
  createOrganizationJsonLd,
  createRealEstateAgentJsonLd,
  createWebSiteJsonLd,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: BRAND_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    siteName: BRAND_NAME,
    locale: "de_DE",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE_PATH,
        alt: BRAND_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [DEFAULT_SOCIAL_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-white font-[family-name:var(--font-inter)] text-[color:var(--color-graphite)] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-xl focus:bg-[color:var(--color-navy)] focus:px-4 focus:py-3 focus:text-white"
        >
          Zum Inhalt springen
        </a>
        <JsonLd data={createOrganizationJsonLd()} />
        <JsonLd data={createWebSiteJsonLd()} />
        <JsonLd data={createPlaceJsonLd()} />
        <JsonLd data={createLocalBusinessJsonLd()} />
        <JsonLd data={createRealEstateAgentJsonLd()} />
        <HomeHeader />
        {children}
        <SiteFooter />
        <CookieBarShell />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.addEventListener('click',function(e){var t=e.target instanceof Element?e.target.closest('[data-cookie-settings-trigger]'):null;if(!t)return;window.dispatchEvent(new Event('frisia:open-cookie-settings'));});",
          }}
        />
      </body>
    </html>
  );
}
