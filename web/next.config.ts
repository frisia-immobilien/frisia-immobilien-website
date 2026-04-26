import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: configDir,
  images: {
    qualities: [45, 50, 60, 68, 70, 72, 75],
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
        source: "/agb",
        destination: "/recht",
        permanent: false,
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
        source: "/immobilienmakler-ostfriesland",
        destination: "/regionen-ostfriesland/immobilienmakler-ostfriesland",
        permanent: true,
      },
      {
        source: "/immobilienmakler-emden",
        destination: "/regionen-ostfriesland/immobilienmakler-emden",
        permanent: true,
      },
      {
        source: "/immobilienmakler-norden",
        destination: "/regionen-ostfriesland/immobilienmakler-norden",
        permanent: true,
      },
      {
        source: "/immobilienmakler-wiesmoor",
        destination: "/regionen-ostfriesland/immobilienmakler-wiesmoor",
        permanent: true,
      },
      {
        source: "/immobilienmakler-wittmund",
        destination: "/regionen-ostfriesland/immobilienmakler-wittmund",
        permanent: true,
      },
      {
        source: "/immobilienmakler-leer",
        destination: "/regionen-ostfriesland/immobilienmakler-leer",
        permanent: true,
      },
      {
        source: "/immobilienmakler-grossheide",
        destination: "/regionen-ostfriesland/immobilienmakler-grossheide",
        permanent: true,
      },
      {
        source: "/immobilienmakler-suedbrookmerland",
        destination: "/regionen-ostfriesland/immobilienmakler-suedbrookmerland",
        permanent: true,
      },
      {
        source: "/immobilienmakler-krummhoern",
        destination: "/regionen-ostfriesland/immobilienmakler-krummhoern",
        permanent: true,
      },
      {
        source: "/immobilienmakler-friedeburg",
        destination: "/regionen-ostfriesland/immobilienmakler-friedeburg",
        permanent: true,
      },
      {
        source: "/immobilienmakler-hage",
        destination: "/regionen-ostfriesland/immobilienmakler-hage",
        permanent: true,
      },
      {
        source: "/immobilienmakler-norderney",
        destination: "/regionen-ostfriesland/immobilienmakler-norderney",
        permanent: true,
      },
      {
        source: "/immobilienmakler-juist",
        destination: "/regionen-ostfriesland/immobilienmakler-juist",
        permanent: true,
      },
      {
        source: "/immobilienmakler-langeoog",
        destination: "/regionen-ostfriesland/immobilienmakler-langeoog",
        permanent: true,
      },
      {
        source: "/immobilienmakler-spiekeroog",
        destination: "/regionen-ostfriesland/immobilienmakler-spiekeroog",
        permanent: true,
      },
      {
        source: "/immobilienmakler-baltrum",
        destination: "/regionen-ostfriesland/immobilienmakler-baltrum",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
