import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: configDir,
  images: {
    qualities: [35, 40, 45, 50, 60, 68, 70, 72, 75],
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
        source: "/presseberichte",
        destination: "/presse",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
