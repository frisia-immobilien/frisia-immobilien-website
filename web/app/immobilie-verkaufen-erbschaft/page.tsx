import { notFound } from "next/navigation";
import SellingSituationDetail from "@/components/selling-situations/SellingSituationDetail";
import { buildPageMetadata } from "@/lib/metadata";
import { getSellingSituation } from "@/lib/selling-situations/data";

const situation = getSellingSituation("erbschaft");

export const metadata = buildPageMetadata({
  title: situation?.seoTitle ?? "Geerbte Immobilie verkaufen | Frisia Immobilien",
  description: situation?.subline ?? "Geerbte Immobilie verkaufen: klare Einordnung für Erbengemeinschaften.",
  path: situation?.path ?? "/immobilie-verkaufen-erbschaft",
  keywords: ["geerbte immobilie verkaufen", "haus geerbt verkaufen", "immobilienbewertung aurich"],
});

export default function ImmobilieVerkaufenErbschaftPage() {
  if (!situation) notFound();
  return <SellingSituationDetail situation={situation} />;
}
