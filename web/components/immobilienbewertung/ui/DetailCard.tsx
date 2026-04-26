"use client";

import Image from "next/image";

export function DetailCard(props: {
  label: string;
  desc: string;
  iconSrc: string;
  iconAlt: string;
  active: boolean;
  onClick: () => void;
  iconBoxHeightClass: string;
  iconPaddingClass: string;
}) {
  const {
    label,
    desc,
    iconSrc,
    iconAlt,
    active,
    onClick,
    iconBoxHeightClass,
    iconPaddingClass,
  } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex min-h-[168px] w-full flex-col items-start justify-between rounded-2xl border p-4 text-left transition",
        active
          ? "border-slate-900 bg-slate-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50/50",
      ].join(" ")}
      aria-pressed={active}
    >
      <div
        className={[
          "relative w-full overflow-hidden rounded-xl border",
          iconBoxHeightClass,
          active ? "border-slate-900/20 bg-slate-900/5" : "border-slate-200 bg-slate-50",
        ].join(" ")}
      >
        <Image
          src={iconSrc}
          alt={iconAlt}
          fill
          sizes="(max-width: 640px) 50vw, 320px"
          className={["object-contain", iconPaddingClass].join(" ")}
          priority={false}
        />
      </div>

      <div className="mt-3 w-full">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900">{label}</div>
          <div
            className={[
              "text-xs font-semibold",
              active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700",
            ].join(" ")}
          >
            Auswählen
          </div>
        </div>
        <div className="mt-1 text-sm text-slate-600">{desc}</div>
      </div>

      <div
        className={[
          "absolute right-4 top-4 h-3 w-3 rounded-full border transition",
          active ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white",
        ].join(" ")}
        aria-hidden="true"
      />
    </button>
  );
}
