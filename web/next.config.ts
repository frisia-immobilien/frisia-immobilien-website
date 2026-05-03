import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: configDir,
  images: {
    qualities: [35, 40, 45, 50, 55, 60, 68, 70, 72, 75, 80],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.propstack.de",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.frisia-immobilien.de",
          },
        ],
        destination: "https://frisia-immobilien.de/:path*",
        permanent: true,
      },
      {
        source: "/agb",
        destination: "/recht",
        permanent: false,
      },
      {
        source: "/bewertung",
        destination: "/immobilienbewertung-aurich",
        permanent: true,
      },
      {
        source: "/cookies",
        destination: "/recht/cookies",
        permanent: true,
      },
      {
        source: "/datenschutz",
        destination: "/recht/datenschutz",
        permanent: true,
      },
      {
        source: "/impressum",
        destination: "/recht/impressum",
        permanent: true,
      },
      {
        source: "/immobilienmarkt-aurich",
        destination: "/immobilienpreise-aurich",
        permanent: true,
      },
      {
        source: "/immobilienpreise-ostfriesland",
        destination: "/immobilienpreise",
        permanent: true,
      },
      {
        source: "/immobilienpreise/aurich",
        destination: "/immobilienpreise-aurich",
        permanent: true,
      },
      {
        source: "/immobilie-verkaufen-situationen",
        destination: "/verkaufssituationen",
        permanent: true,
      },
      {
        source: "/suchauftrag-anlegen",
        destination: "/suchauftrag",
        permanent: true,
      },
      {
        source: "/region/aurich",
        destination: "/immobilienmakler-aurich",
        permanent: true,
      },
      {
        source: "/region/ostfriesland",
        destination: "/regionen-ostfriesland",
        permanent: true,
      },
      {
        source: "/presseberichte",
        destination: "/presse",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
