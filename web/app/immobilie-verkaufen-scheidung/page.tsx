import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("scheidung");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Immobilie bei Scheidung verkaufen | Frisia Immobilien",
  description: situation?.subline ?? "Immobilie bei Scheidung verkaufen: sachliche Grundlage und strukturierter Ablauf.",
  path: situation?.path ?? "/immobilie-verkaufen-scheidung",
  keywords: ["immobilie scheidung verkaufen", "haus verkaufen scheidung", "immobilienbewertung aurich"],
});

export default function ImmobilieVerkaufenScheidungPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
