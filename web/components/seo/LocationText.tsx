import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { formatLocationLabel } from "@/lib/seo/locationDisplay";

export default function LocationText({ data }: { data: LocationPageData }) {
  const locationLabel = formatLocationLabel(data.location.location_label);

  return (
    <section className="mx-auto w-full max-w-[980px] px-4 py-12 sm:px-6 md:py-14">
      <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
        Lokale Einordnung für {locationLabel}
      </h2>
      <div className="mt-5 space-y-5 text-base leading-[1.8] text-[color:var(--color-graphite)]">
        <p>{data.content.text1}</p>
        <p>{data.content.text2}</p>
        {data.content.text3 ? <p>{data.content.text3}</p> : null}
        {!data.houseMarket && !data.apartmentMarket ? (
          <p>
            Für {locationLabel} liegen derzeit keine ausreichend belastbaren lokalen Preisdaten vor.
            Für eine erste Orientierung nutzen wir die nächsthöhere verfügbare Marktebene. Eine genauere Einschätzung
            ist über die persönliche Immobilienbewertung möglich.
          </p>
        ) : null}
      </div>
    </section>
  );
}
