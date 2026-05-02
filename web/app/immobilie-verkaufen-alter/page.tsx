import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("alter");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Immobilie im Alter verkaufen | Frisia Immobilien",
  description: situation?.subline ?? "Immobilie im Alter verkaufen: ruhige Einordnung und klare nächste Schritte.",
  path: situation?.path ?? "/immobilie-verkaufen-alter",
  keywords: ["immobilie verkaufen alter", "haus verkaufen im alter", "immobilienbewertung aurich"],
});

export default function ImmobilieVerkaufenAlterPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
