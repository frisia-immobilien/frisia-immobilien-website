import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("auswanderung");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Immobilie bei Auswanderung | Frisia Immobilien",
  description: situation?.subline ?? "Immobilie bei Auswanderung verkaufen: Planungssicherheit vor dem Neustart.",
  path: situation?.path ?? "/immobilie-verkaufen-auswanderung",
  keywords: ["immobilie auswanderung verkaufen", "haus verkaufen auswandern", "immobilienbewertung aurich"],
});

export default function ImmobilieVerkaufenAuswanderungPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
