import Image from "next/image";
import Link from "next/link";
import type { LocationPageData } from "@/lib/seo/getLocationPageData";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export default function LocationHero({ data }: { data: LocationPageData }) {
  return (
    <section className="mx-auto grid w-full max-w-[1240px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-12 md:items-center md:py-16">
      <div className="md:col-span-7">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brackish)]">
          {data.template.label} in Ostfriesland
        </p>
        <h1 className="mt-3 max-w-[13ch] break-words font-[family-name:var(--font-playfair)] text-[clamp(2.35rem,4.6vw,4.4rem)] leading-[1.04] text-[color:var(--color-navy)]">
          {data.content.h1}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-[1.7] text-[color:var(--color-graphite)]">
          {data.content.intro}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/immobilie-bewerten" className="rounded-lg bg-[color:var(--color-navy)] px-5 py-3 text-sm font-semibold text-white">
            Bewertung starten
          </Link>
          <a href={PHONE_HREF} className="rounded-lg border border-[color:var(--color-brass)]/45 px-5 py-3 text-sm font-semibold text-[color:var(--color-navy)]">
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
      <div className="md:col-span-5">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[color:var(--color-section)]">
          <Image
            src={data.image.src}
            alt={data.image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
