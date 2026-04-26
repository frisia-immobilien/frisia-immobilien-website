import type { Metadata } from "next";
import {
  BRAND_NAME,
  DEFAULT_SOCIAL_IMAGE_PATH,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site";

type MetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  openGraphType?: "website" | "article";
  robots?: Metadata["robots"];
  imagePath?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  openGraphType = "website",
  robots,
  imagePath = DEFAULT_SOCIAL_IMAGE_PATH,
}: MetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const socialImageUrl = absoluteUrl(imagePath);
  const openGraphTitle = title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? [...new Set(keywords)] : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: openGraphTitle,
      description,
      url,
      type: openGraphType,
      siteName: BRAND_NAME,
      locale: "de_DE",
      images: [
        {
          url: socialImageUrl,
          alt: openGraphTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description,
      images: [socialImageUrl],
    },
    robots,
    metadataBase: new URL(SITE_URL),
  };
}
