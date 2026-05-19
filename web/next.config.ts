import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: configDir,
  htmlLimitedBots:
    /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|anthropic-ai|PerplexityBot|Perplexity-User|CCBot|cohere-ai|Bytespider|Applebot-Extended/i,
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
        statusCode: 301,
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
        source: "/&",
        destination: "/",
        permanent: true,
      },
      {
        source: "/datenschutz",
        destination: "/recht/datenschutz",
        permanent: true,
      },
      {
        source: "/location-type/ortsteil",
        destination: "/regionen-ostfriesland",
        permanent: true,
      },
      {
        source: "/location-type/stadt_gemeinde",
        destination: "/regionen-ostfriesland",
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
