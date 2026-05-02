import SellingSituationHub from "@/components/selling-situations/SellingSituationHub";
import { buildPageMetadata } from "@/lib/metadata";
import { SELLING_SITUATION_HUB } from "@/lib/selling-situations/data";

export const metadata = buildPageMetadata({
  title: SELLING_SITUATION_HUB.seoTitle,
  description: SELLING_SITUATION_HUB.subline,
  path: SELLING_SITUATION_HUB.path,
  keywords: [
    "immobilie verkaufen situationen",
    "immobilie verkaufen aurich",
    "haus verkaufen aurich",
    "immobilienbewertung aurich",
  ],
});

export default function VerkaufssituationenPage() {
  return <SellingSituationHub />;
}
