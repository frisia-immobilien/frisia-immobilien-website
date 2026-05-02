import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("diskret");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Immobilie diskret verkaufen | Frisia Immobilien",
  description: situation?.subline ?? "Immobilie diskret verkaufen: vertrauliche Einordnung und klare Verkaufsstrategie.",
  path: situation?.path ?? "/immobilie-verkaufen-diskret",
  keywords: ["immobilie diskret verkaufen", "diskreter immobilienverkauf", "immobilienmakler aurich"],
});

export default function ImmobilieVerkaufenDiskretPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
