import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("energieausweis");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Immobilie mit Energieausweis | Frisia Immobilien",
  description: situation?.subline ?? "Immobilie verkaufen und Energieausweis richtig einordnen.",
  path: situation?.path ?? "/immobilie-verkaufen-energieausweis",
  keywords: ["energieausweis immobilie verkaufen", "haus verkaufen energieausweis", "immobilienbewertung aurich"],
});

export default function ImmobilieVerkaufenEnergieausweisPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
