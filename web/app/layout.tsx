import type { Metadata, Viewport } from "next";
import "./globals.css";
import HomeHeader from "@/components/home/HomeHeader";
import HeaderScrollBehavior from "@/components/home/HeaderScrollBehavior.client";
import DeferredSiteFooter from "@/components/site/DeferredSiteFooter.client";
import CookieBarShell from "@/components/CookieBarShell.client";
import SiteAnalyticsBoot from "@/components/analytics/SiteAnalyticsBoot.client";
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

const FAVICON_BASE_PATH = "/favicons";
const APPLE_TOUCH_ICON_SIZES = [
  "57x57",
  "60x60",
  "72x72",
  "76x76",
  "114x114",
  "120x120",
  "144x144",
  "152x152",
  "180x180",
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  applicationName: BRAND_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
  manifest: `${FAVICON_BASE_PATH}/site.webmanifest`,
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: `${FAVICON_BASE_PATH}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
      { url: `${FAVICON_BASE_PATH}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      { url: `${FAVICON_BASE_PATH}/favicon-96x96.png`, sizes: "96x96", type: "image/png" },
      { url: `${FAVICON_BASE_PATH}/android-icon-192x192.png`, sizes: "192x192", type: "image/png" },
      { url: `${FAVICON_BASE_PATH}/favicon-256x256.png`, sizes: "256x256", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: APPLE_TOUCH_ICON_SIZES.map((size) => ({
      url: `${FAVICON_BASE_PATH}/apple-icon-${size}.png`,
      sizes: size,
      type: "image/png",
    })),
  },
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
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": `${FAVICON_BASE_PATH}/ms-icon-144x144.png`,
    "msapplication-config": `${FAVICON_BASE_PATH}/browserconfig.xml`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1b3040",
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
        <HeaderScrollBehavior />
        {children}
        <DeferredSiteFooter />
        <CookieBarShell />
        <SiteAnalyticsBoot />
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
