import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/metadata";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";

export function buildLocationMetadata(data: LocationPageData): Metadata {
  return buildPageMetadata({
    title: data.content.metaTitle,
    description: data.content.metaDescription,
    path: data.publicPath,
    imagePath: data.image.src,
    robots: data.indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
            noimageindex: true,
          },
        },
  });
}
