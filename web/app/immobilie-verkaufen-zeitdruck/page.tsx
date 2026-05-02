import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("zeitdruck");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Immobilie unter Zeitdruck verkaufen | Frisia Immobilien",
  description: situation?.subline ?? "Immobilie unter Zeitdruck verkaufen: schnelle Einordnung ohne hektische Fehler.",
  path: situation?.path ?? "/immobilie-verkaufen-zeitdruck",
  keywords: ["immobilie schnell verkaufen", "haus verkaufen zeitdruck", "immobilienbewertung aurich"],
});

export default function ImmobilieVerkaufenZeitdruckPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
