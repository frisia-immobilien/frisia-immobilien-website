import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("leerstand");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Leerstehende Immobilie verkaufen | Frisia Immobilien",
  description: situation?.subline ?? "Leerstehende Immobilie verkaufen: Wert, Eindruck und Ablauf rechtzeitig einordnen.",
  path: situation?.path ?? "/immobilie-verkaufen-leerstand",
  keywords: ["leerstehende immobilie verkaufen", "haus leerstand verkaufen", "immobilienbewertung aurich"],
});

export default function ImmobilieVerkaufenLeerstandPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
