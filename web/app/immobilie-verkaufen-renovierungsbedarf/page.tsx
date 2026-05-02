import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("renovierungsbedarf");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Immobilie mit Renovierungsbedarf | Frisia Immobilien",
  description: situation?.subline ?? "Immobilie mit Renovierungsbedarf verkaufen: erst einordnen, dann investieren.",
  path: situation?.path ?? "/immobilie-verkaufen-renovierungsbedarf",
  keywords: ["immobilie renovierungsbedarf verkaufen", "haus sanierungsbeduerftig verkaufen", "immobilienbewertung aurich"],
});

export default function ImmobilieVerkaufenRenovierungsbedarfPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
