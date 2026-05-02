import type { Metadata } from "next";
import PressPageContent, {
  PRESS_HERO_IMAGE,
  PRESS_PAGE_DESCRIPTION,
  PRESS_PAGE_TITLE,
} from "@/components/site/PressPageContent";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: PRESS_PAGE_TITLE,
  description: PRESS_PAGE_DESCRIPTION,
  path: "/presse",
  imagePath: PRESS_HERO_IMAGE,
  keywords: [
    "presse frisia immobilien",
    "presse immobilienmakler aurich",
    "frisia immobilien ostfriesland",
    "immobilienmarkt aurich presse",
  ],
});

export default function PressePage() {
  return <PressPageContent path="/presse" />;
}
