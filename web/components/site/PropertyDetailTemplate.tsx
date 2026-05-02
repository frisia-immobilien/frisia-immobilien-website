import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import ExpandableTextBlock from "@/components/site/ExpandableTextBlock.client";
import HeroDivider from "@/components/site/HeroDivider";
import MapLocationOverlay from "@/components/site/MapLocationOverlay.client";
import OsmTileMap from "@/components/site/OsmTileMap.client";
import PropertyGallery from "@/components/site/PropertyGallery.client";
import { getGermanConditionLabel, getGermanPropertyTypeLabel } from "@/lib/property-labels";
import type { PropertyDetail } from "@/lib/propstack";
import { ADDRESS, DIRECT_CONTACT } from "@/lib/site";

type PropertyDetailTemplateProps = {
  property: PropertyDetail;
  contactHref: string;
  phoneHref: string;
  phoneDisplay: string;
};

type RichBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; heading?: string; items: string[] };

function formatCurrency(value: number | null, priceOnInquiry = false, maximumFractionDigits = 0) {
  if (priceOnInquiry || value === null) return "Preis auf Anfrage";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);
}

function formatPropertyPrice(property: PropertyDetail) {
  const value = formatCurrency(property.price, property.priceOnInquiry);
  if (value === "Preis auf Anfrage" || property.pricePeriod !== "month") return value;
  return `${value} / Monat`;
}

function formatOptionalCurrency(value: number | null, suffix = "") {
  if (value === null) return null;
  const formatted = formatCurrency(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function formatSquareMeterPrice(value: number | null) {
  if (value === null) return null;
  const decimals = value % 1 === 0 ? 0 : 2;
  return `${formatCurrency(value, false, decimals)} / m²`;
}

function formatNumber(value: number | null, suffix: string) {
  if (value === null) return null;
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: value % 1 === 0 ? 0 : 1 }).format(value)} ${suffix}`;
}

function resolvePropertyTypeLabel(property: PropertyDetail) {
  return getGermanPropertyTypeLabel(property.rsCategory, property.rsType);
}

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, "").trim();
}

function parseRichText(value: string | null): RichBlock[] {
  if (!value) return [];

  return normalizeWhitespace(value)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .reduce<RichBlock[]>((blocks, block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return blocks;

      if (lines.length === 1 && /^[A-ZÄÖÜ0-9 /&(),.%:-]+$/.test(lines[0]) && lines[0].length <= 42) {
        blocks.push({ type: "heading", text: lines[0] });
        return blocks;
      }

      if (lines[0].endsWith(":") && lines.slice(1).every((line) => line.startsWith("- "))) {
        blocks.push({
          type: "list",
          heading: lines[0].replace(/:$/, ""),
          items: lines.slice(1).map((line) => line.replace(/^- /, "")),
        });
        return blocks;
      }

      if (lines.every((line) => line.startsWith("- "))) {
        blocks.push({
          type: "list",
          items: lines.map((line) => line.replace(/^- /, "")),
        });
        return blocks;
      }

      blocks.push({ type: "paragraph", text: lines.join(" ") });
      return blocks;
    }, []);
}

function RichTextSection({ value }: { value: string | null }) {
  const blocks = parseRichText(value);
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-5 text-[1rem] leading-[1.8] text-[color:var(--color-graphite)]">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={`${block.type}-${index}`} className="text-lg font-semibold text-[color:var(--color-navy)]">
              {block.text}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <div key={`${block.type}-${index}`} className="space-y-3">
              {block.heading ? (
                <h3 className="text-lg font-semibold text-[color:var(--color-navy)]">{block.heading}</h3>
              ) : null}
              <ul className="space-y-2">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[0.72rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-brackish)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return <p key={`${block.type}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">{children}</p>;
}

function DetailSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[2rem] border border-[color:var(--color-brass)]/18 bg-white px-6 py-7 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:px-8"
    >
      <h2 className="font-[family-name:var(--font-playfair)] text-[2rem] leading-tight text-[color:var(--color-navy)]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(8rem,0.9fr)] gap-6 border-b border-[color:var(--color-brass)]/12 py-3 last:border-b-0">
      <dt className="text-sm text-[color:var(--color-graphite)]">{label}</dt>
      <dd className="text-left text-sm font-medium text-[color:var(--color-navy)]">{value}</dd>
    </div>
  );
}

function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.35 6-11a6 6 0 1 0-12 0c0 5.65 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function EmailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 7 7 6 7-6" />
    </svg>
  );
}

function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4.5c0-.28.22-.5.5-.5h2.75c.24 0 .44.16.49.4l.72 3.56a.5.5 0 0 1-.14.46L7.9 9.86a15.55 15.55 0 0 0 6.25 6.24l1.44-1.42a.5.5 0 0 1 .46-.14l3.56.72c.24.05.4.25.4.49v2.75a.5.5 0 0 1-.5.5h-1.5C10.39 19 5 13.61 5 7.5z"
      />
    </svg>
  );
}

function MobileIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2.3" />
      <path strokeLinecap="round" d="M11 18.5h2" />
    </svg>
  );
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function offsetCoordinates(latitude: number, longitude: number, seedValue: string, meters = 500) {
  const seed = hashSeed(seedValue);
  const angle = ((seed % 3600) / 3600) * Math.PI * 2;
  const distance = meters / 6378137;
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;

  const shiftedLat = Math.asin(
    Math.sin(latRad) * Math.cos(distance) +
      Math.cos(latRad) * Math.sin(distance) * Math.cos(angle),
  );
  const shiftedLon =
    lonRad +
    Math.atan2(
      Math.sin(angle) * Math.sin(distance) * Math.cos(latRad),
      Math.cos(distance) - Math.sin(latRad) * Math.sin(shiftedLat),
    );

  return {
    latitude: (shiftedLat * 180) / Math.PI,
    longitude: (shiftedLon * 180) / Math.PI,
  };
}

function formatPublicLocation(zipCode: string | null, city: string) {
  return [zipCode, city].filter(Boolean).join(" ");
}

function EnergyScale({ energyClass }: { energyClass: string | null }) {
  const classes = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"];
  const normalized = energyClass?.toUpperCase() ?? null;
  const activeIndex = normalized ? classes.indexOf(normalized) : -1;

  return (
    <div className="space-y-3">
      <div className="flex overflow-hidden rounded-full bg-[linear-gradient(90deg,#3bb54a_0%,#9bd23c_18%,#d6e63a_34%,#ffd21a_50%,#ffb20f_66%,#f57c00_82%,#e31818_100%)]">
        {classes.map((label, index) => (
          <div key={label} className="relative h-4 flex-1 border-r border-white/55 last:border-r-0">
            {index === activeIndex ? (
              <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[color:var(--color-navy)] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
                {label}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brackish)]">
        {classes.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export default function PropertyDetailTemplate({
  property,
  contactHref,
  phoneHref,
  phoneDisplay,
}: PropertyDetailTemplateProps) {
  const contactPerson = {
    name: DIRECT_CONTACT.name,
    title: property.contactTitle,
    email: DIRECT_CONTACT.email,
    phoneDisplay: DIRECT_CONTACT.phoneDisplay,
    phoneHref: DIRECT_CONTACT.phoneHref,
    mobileDisplay: DIRECT_CONTACT.mobileDisplay,
    mobileHref: DIRECT_CONTACT.mobileHref,
    imagePath: DIRECT_CONTACT.imagePath,
  };
  const propertyTypeLabel = resolvePropertyTypeLabel(property);
  const galleryImages = property.galleryImages;
  const floorplanImages = property.floorplanImages;
  const primaryArea = property.isCommercial
    ? { label: "Nutzfläche", value: property.usableFloorSpace }
    : { label: "Wohnfläche", value: property.livingSpace };
  const galleryCountLabel =
    galleryImages.length > 0 ? `${String(galleryImages.length).padStart(2, "0")} Bilder` : null;
  const publicLocation = formatPublicLocation(property.zipCode, property.city);
  const isRental = property.marketingType === "RENT";
  const mapCoordinates =
    property.latitude !== null && property.longitude !== null
      ? offsetCoordinates(property.latitude, property.longitude, String(property.id))
      : null;
  const sectionLinks = [
    { id: "objektbeschreibung", label: "Beschreibung" },
    property.furnishingNote ? { id: "ausstattung", label: "Ausstattung" } : null,
    property.locationNote ? { id: "lage", label: "Lage" } : null,
    property.otherNote ? { id: "hinweise", label: "Hinweise" } : null,
    floorplanImages.length > 0 ? { id: "grundrisse", label: "Grundrisse" } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  const headlineFacts = [
    { label: property.priceLabel, value: formatPropertyPrice(property) },
    { label: primaryArea.label, value: formatNumber(primaryArea.value, "m²") ?? "auf Anfrage" },
    { label: "Grundstück", value: formatNumber(property.plotArea, "m²") ?? "auf Anfrage" },
    {
      label: "Zimmer",
      value:
        property.numberOfRooms !== null
          ? new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(property.numberOfRooms)
          : "auf Anfrage",
    },
  ];

  const rentRows: { label: string; value: string | null }[] = isRental
    ? [
        property.priceLabel !== "Kaltmiete"
          ? { label: "Kaltmiete", value: formatOptionalCurrency(property.baseRent, "/ Monat") }
          : null,
        property.priceLabel !== "Warmmiete"
          ? { label: "Warmmiete", value: formatOptionalCurrency(property.totalRent, "/ Monat") }
          : null,
        { label: "Nebenkosten", value: formatOptionalCurrency(property.serviceCharge, "/ Monat") },
        { label: "Heizkosten", value: formatOptionalCurrency(property.heatingCosts, "/ Monat") },
        { label: "Miete pro m²", value: formatSquareMeterPrice(property.pricePerSqm) },
      ].filter((row): row is { label: string; value: string | null } => Boolean(row))
    : [];

  const detailRows = [
    { label: "Objektart", value: propertyTypeLabel ?? null },
    { label: "Vermarktungsart", value: isRental ? "Miete" : "Kauf" },
    { label: "Objektnummer", value: property.unitId },
    { label: "Ort", value: property.city },
    ...rentRows,
    { label: "Baujahr", value: property.constructionYear ? String(property.constructionYear) : null },
    { label: "Denkmalschutz", value: property.monumentProtection ? "Ja" : null },
    { label: "Schlafzimmer", value: property.numberOfBedrooms ? String(property.numberOfBedrooms) : null },
    { label: "Bäder", value: property.numberOfBathrooms ? String(property.numberOfBathrooms) : null },
    { label: "Nutzfläche", value: formatNumber(property.usableFloorSpace, "m²") },
    { label: "Etagen", value: property.numberOfFloors ? String(property.numberOfFloors) : null },
    { label: "Zustand", value: getGermanConditionLabel(property.condition) },
    { label: "Energieklasse", value: property.monumentProtection ? null : property.energyEfficiencyClass },
    {
      label: "Energiekennwert",
      value:
        !property.monumentProtection && property.energyEfficiencyValue !== null
          ? formatNumber(property.energyEfficiencyValue, "kWh/(m²*a)")
          : null,
    },
    { label: "Wesentliche Energieträger", value: property.monumentProtection ? null : property.energyCarrier },
    { label: "Provision", value: property.courtage },
  ];

  const featureTags = [
    property.balcony ? "Balkon / Terrasse" : null,
    property.garden ? "Garten" : null,
    property.cellar ? "Keller" : null,
    property.guestToilet ? "Gäste-WC" : null,
    property.kitchenComplete ? "Einbauküche" : null,
  ].filter(Boolean) as string[];
  const hasEnergySection =
    (!property.monumentProtection && property.energyEfficiencyClass !== null) ||
    (!property.monumentProtection && property.energyEfficiencyValue !== null) ||
    (!property.monumentProtection && property.energyCarrier !== null) ||
    property.monumentProtection ||
    property.constructionYear !== null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="min-w-0">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
          {isRental ? "Mietobjekt" : "Kaufobjekt"} in {property.city}
        </p>
        <h1 className="mt-2 max-w-5xl font-[family-name:var(--font-playfair)] text-[2.5rem] leading-[1.06] tracking-[-0.02em] text-[color:var(--color-navy)] sm:text-[3.45rem]">
          {property.title}
        </h1>
        <HeroDivider />
        <div className="mt-5 flex flex-wrap items-center gap-3 text-[0.98rem] text-[color:var(--color-graphite)]">
          <span className="inline-flex items-center gap-2">
            <PinIcon className="h-4 w-4 text-[color:var(--color-brackish)]" />
            <span>{publicLocation}</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-brass)]/70" />
          <span>{propertyTypeLabel}</span>
          {property.unitId ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-brass)]/70" />
              <span>Objektnummer: {property.unitId}</span>
            </>
          ) : null}
        </div>

        {galleryImages.length > 0 ? (
          <PropertyGallery
            images={galleryImages}
            propertyTitle={property.title}
            publicLocation={publicLocation}
            galleryCountLabel={galleryCountLabel}
            propertyTypeLabel={propertyTypeLabel}
          />
        ) : null}

      </div>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="order-2 min-w-0 xl:order-1">
          <div className="grid gap-8">
            {sectionLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {sectionLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="inline-flex items-center rounded-full border border-[color:var(--color-brass)]/24 bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-section)]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}

            <DetailSection id="objektbeschreibung" title="Objektbeschreibung">
              <ExpandableTextBlock>
                <RichTextSection value={property.descriptionNote || property.excerpt} />
              </ExpandableTextBlock>
            </DetailSection>

            {property.furnishingNote ? (
              <DetailSection id="ausstattung" title="Ausstattung">
                <ExpandableTextBlock>
                  <RichTextSection value={property.furnishingNote} />
                </ExpandableTextBlock>
              </DetailSection>
            ) : null}

            {property.locationNote ? (
              <DetailSection id="lage" title="Lage">
                <ExpandableTextBlock>
                  <RichTextSection value={property.locationNote} />
                </ExpandableTextBlock>
              </DetailSection>
            ) : null}

            {hasEnergySection ? (
              <DetailSection title="Energieinformationen">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="space-y-4 lg:col-span-3">
                    {property.monumentProtection ? (
                      <div className="max-w-4xl space-y-2 border-l-2 border-[color:var(--color-brass)]/45 pl-4 text-[0.98rem] leading-[1.7] text-[color:var(--color-graphite)]">
                        <p className="font-semibold text-[color:var(--color-navy)]">
                          Diese Immobilie steht unter Denkmalschutz.
                        </p>
                        <p>
                          Gemäß den gesetzlichen Regelungen des Gebäudeenergiegesetzes (GEG) besteht für
                          denkmalgeschützte Gebäude keine Verpflichtung zur Erstellung und Vorlage eines Energieausweises.
                        </p>
                      </div>
                    ) : null}
                    {!property.monumentProtection ? (
                      <>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                          Skala
                        </p>
                        <EnergyScale energyClass={property.energyEfficiencyClass} />
                      </>
                    ) : null}
                  </div>

                  {!property.monumentProtection ? (
                    <>
                      <div className="border-t border-[color:var(--color-brass)]/16 pt-4">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                          Energieeffizienzklasse
                        </p>
                        <p className="mt-2 text-[1.2rem] font-semibold text-[color:var(--color-navy)]">
                          {property.energyEfficiencyClass ?? "k. A."}
                        </p>
                      </div>

                      <div className="border-t border-[color:var(--color-brass)]/16 pt-4">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                          Endenergiebedarf
                        </p>
                        <p className="mt-2 text-[1.2rem] font-semibold text-[color:var(--color-navy)]">
                          {property.energyEfficiencyValue !== null ? formatNumber(property.energyEfficiencyValue, "kWh/m²a") : "k. A."}
                        </p>
                      </div>
                    </>
                  ) : null}

                  {!property.monumentProtection ? (
                    <div className="border-t border-[color:var(--color-brass)]/16 pt-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                        Energieträger
                      </p>
                      <p className="mt-2 text-[1.2rem] font-semibold text-[color:var(--color-navy)]">
                        {property.energyCarrier ?? "k. A."}
                      </p>
                    </div>
                  ) : null}

                  <div className="border-t border-[color:var(--color-brass)]/16 pt-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                      Baujahr
                    </p>
                    <p className="mt-2 text-[1.2rem] font-semibold text-[color:var(--color-navy)]">
                      {property.constructionYear ? String(property.constructionYear) : "k. A."}
                    </p>
                  </div>

                  {property.monumentProtection ? (
                    <div className="border-t border-[color:var(--color-brass)]/16 pt-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                        Denkmalschutz
                      </p>
                      <p className="mt-2 text-[1.2rem] font-semibold text-[color:var(--color-navy)]">
                        Ja
                      </p>
                    </div>
                  ) : null}
                </div>
              </DetailSection>
            ) : null}

            {property.otherNote ? (
              <DetailSection id="hinweise" title="Weitere Hinweise">
                <ExpandableTextBlock>
                  <RichTextSection value={property.otherNote} />
                </ExpandableTextBlock>
              </DetailSection>
            ) : null}

            {floorplanImages.length > 0 ? (
              <DetailSection id="grundrisse" title="Grundrisse & Lagepläne">
                <div className="grid gap-4 sm:grid-cols-2">
                  {floorplanImages.map((image) => (
                    <figure
                      key={image.url}
                      className="overflow-hidden rounded-[1.5rem] border border-[color:var(--color-brass)]/18 bg-[color:var(--color-section)]/45"
                    >
                      <div className="relative aspect-[4/3]">
                        <Image src={image.url} alt={image.title || "Grundriss"} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-4" />
                      </div>
                      <figcaption className="border-t border-[color:var(--color-brass)]/12 px-4 py-3 text-sm text-[color:var(--color-graphite)]">
                        {image.title}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </DetailSection>
            ) : null}

            {mapCoordinates ? (
              <DetailSection title="Lage im Umfeld">
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-[1.65rem] border border-[color:var(--color-brass)]/16 bg-[color:var(--color-section)]/45">
                    <div className="relative aspect-[16/8]">
                      <OsmTileMap
                        latitude={mapCoordinates.latitude}
                        longitude={mapCoordinates.longitude}
                        zoom={15}
                        minZoom={12}
                        maxZoom={18}
                        showControls
                        ariaLabel={`Lagekarte im Umfeld von ${publicLocation}`}
                        className="absolute inset-0 h-full w-full border-0"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(10,23,37,0.18)] to-transparent" />
                      <MapLocationOverlay publicLocation={publicLocation} />
                    </div>
                  </div>
                </div>
              </DetailSection>
            ) : null}

            <DetailSection title="Persönlicher Kontakt">
              <div className="flex gap-4 sm:gap-5">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.5rem] bg-[color:var(--color-section)]/45 sm:h-32 sm:w-32">
                  <Image
                    src={contactPerson.imagePath}
                    alt={contactPerson.name}
                    fill
                    sizes="128px"
                    className="object-cover object-[50%_24%]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-playfair)] text-[1.8rem] leading-[1.1] text-[color:var(--color-navy)]">
                    {contactPerson.name}
                  </p>
                  {contactPerson.title ? (
                    <p className="mt-4 max-w-[42rem] whitespace-pre-line text-[0.92rem] leading-[1.75] text-[color:var(--color-graphite)] md:whitespace-pre">
                      {contactPerson.title}
                    </p>
                  ) : null}

                  <div className="mt-5 space-y-3 text-[0.98rem] text-[color:var(--color-navy)]">
                    <a href={`mailto:${contactPerson.email}`} className="flex items-center gap-3 transition-colors hover:text-[color:var(--color-brackish)]">
                      <EmailIcon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{contactPerson.email}</span>
                    </a>
                    <a href={contactPerson.phoneHref} className="flex items-center gap-3 transition-colors hover:text-[color:var(--color-brackish)]">
                      <PhoneIcon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{contactPerson.phoneDisplay}</span>
                    </a>
                    <a href={contactPerson.mobileHref} className="flex items-center gap-3 transition-colors hover:text-[color:var(--color-brackish)]">
                      <MobileIcon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{contactPerson.mobileDisplay}</span>
                    </a>
                  </div>
                </div>
              </div>
            </DetailSection>
          </div>
        </div>

        <aside className="order-1 xl:order-2 xl:sticky xl:self-end xl:bottom-6">
          <div className="space-y-5 rounded-[2rem] border border-[color:var(--color-brass)]/20 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-7">
            <div className="rounded-[1.5rem] border border-[color:var(--color-brass)]/16 bg-[color:var(--color-section)]/38 px-5 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                Ihr Ansprechpartner:
              </p>
              <p className="mt-1 font-[family-name:var(--font-playfair)] text-[1.28rem] leading-[1.08] text-[color:var(--color-navy)]">
                {contactPerson.name}
              </p>
              <div className="mt-4 space-y-2.5 text-[0.92rem] text-[color:var(--color-navy)]">
                <a href={contactPerson.phoneHref} className="flex items-center gap-3 transition-colors hover:text-[color:var(--color-brackish)]">
                  <PhoneIcon className="h-[0.95rem] w-[0.95rem] shrink-0" />
                  <span className="font-bold">{contactPerson.phoneDisplay}</span>
                </a>
                <a href={contactPerson.mobileHref} className="flex items-center gap-3 transition-colors hover:text-[color:var(--color-brackish)]">
                  <MobileIcon className="h-[0.95rem] w-[0.95rem] shrink-0" />
                  <span className="font-medium">{contactPerson.mobileDisplay}</span>
                </a>
                <a href={`mailto:${contactPerson.email}`} className="flex items-center gap-3 transition-colors hover:text-[color:var(--color-brackish)]">
                  <EmailIcon className="h-[0.95rem] w-[0.95rem] shrink-0" />
                  <span className="font-medium">{contactPerson.email}</span>
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {headlineFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-[1.35rem] border border-[color:var(--color-brass)]/18 bg-[color:var(--color-section)]/6 px-4 py-4"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-[1.2rem] font-semibold text-[color:var(--color-navy)]">{fact.value}</p>
                </div>
              ))}
            </div>

            {featureTags.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {featureTags.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center rounded-full border border-[color:var(--color-brass)]/24 bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-navy)]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            ) : null}

            {property.courtageNote ? (
              <p className="text-sm leading-[1.7] text-[color:var(--color-graphite)]">{property.courtageNote}</p>
            ) : null}

            <div className="rounded-[1.5rem] bg-[color:var(--color-section)]/6 px-5 py-4">
              <dl>
                {detailRows.map((row) => (
                  <InfoRow key={row.label} label={row.label} value={row.value} />
                ))}
              </dl>
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--color-brass)]/16 bg-white px-5 py-5">
              <SectionEyebrow>Frisia Immobilien</SectionEyebrow>
              <p className="mt-2 font-[family-name:var(--font-playfair)] text-[1.4rem] leading-[1.28] text-[color:var(--color-navy)]">
                Persönliche Rückmeldung und klare Einordnung zu diesem Objekt.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-medium text-[color:var(--color-navy)] shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
                <PinIcon className="h-4 w-4 text-[color:var(--color-brackish)]" />
                {formatPublicLocation(ADDRESS.postalCode, ADDRESS.addressLocality)}
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href={contactHref}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--color-navy)] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--color-brackish)]"
                >
                  Exposé und Besichtigung anfragen
                </Link>
                <a
                  href={phoneHref}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[color:var(--color-brass)]/35 px-5 py-3.5 text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:bg-[color:var(--color-section)]"
                >
                  Anrufen: {phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
