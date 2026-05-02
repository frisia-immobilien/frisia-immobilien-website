"use client";

/**
 * LeadGenEntryClient
 * ------------------------------------------------------------
 * Ziel:
 * - Startseite lädt initial nur Step01 (Kachel) + linken „Online-Bewertung“-Bildblock (UI wie vorher).
 * - Nach Klick auf Haus/Wohnung/Grundstück wird der große Wizard lazy geladen.
 * - Ab Step02 wird der linke Bildblock ausgeblendet (keine Doppel-Layouts, kein „stehenbleiben“).
 *
 * Neu (B: Auswahl merken):
 * - Wenn der Nutzer im Wizard auf „Zurück“ (Exit-to-Entry) geht, springen wir zurück zur Kachel,
 *   aber die Auswahl (Haus/Wohnung/Grundstück) bleibt markiert.
 *
 * Neu (Prefetch nach Hover/Focus/Touch):
 * - Sobald der Nutzer in die Step01-Auswahl „rein-hovered“ (oder Focus/Touch), wird der Wizard-Chunk vorgezogen.
 * - Kein Initial-Ballast: Prefetch passiert erst bei Interaktion.
 *
 * Tracking-Hooks:
 * - optional vorhanden, auf der Startseite aber NICHT belegt.
 *
 * WICHTIG:
 * - Wir verwenden die bestehende PropertyTypeSection-API (value/onChange/onNext).
 * - Kein zusätzlicher JS-Ballast: Hooks sind optional, keine GA4-Config.
 */

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";

import PropertyTypeSection from "./sections/PropertyType.section";
import type { LeadGenWizardPropertyType } from "./LeadGenWizard.client";

/* ============================================================
   TYPES
============================================================ */

type PropertyTypeCore = "apartment" | "house" | "land" | "commercial" | "unknown";

export type LeadGenEntryType = Exclude<PropertyTypeCore, "unknown">;

export type LeadGenEntryProps = {
  /**
   * Hook-Punkt: sobald der Nutzer auf eine Kachel klickt (inkl. Gewerbe).
   */
  onStart?: (type: LeadGenEntryType) => void;

  /**
   * Hook-Punkt: sobald der Wizard tatsächlich gerendert ist (nach dynamic import).
   * (ohne GA4 – nur Callback)
   */
  onWizardLoaded?: (type: Exclude<LeadGenEntryType, "commercial">) => void;
};

type Step01Value = { type?: PropertyTypeCore };

function emitLeadEvent(detail: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("frisia:lead", { detail }));
}

/* ============================================================
   LAZY WIZARD
============================================================ */

const LeadGenWizard = dynamic(() => import("./LeadGenWizard.client"), {
  ssr: false,
  loading: () => <WizardLoadingShell />,
});

/* ============================================================
   COMPONENT
============================================================ */

export default function LeadGenEntryClient(props: LeadGenEntryProps) {
  /**
   * selectedType:
   * - null                   => Entry-Mode (Step01): 2-spaltig inkl. linkem Bildblock
   * - house/apartment/land    => Wizard-Mode (Step02+): 1-spaltig, Bildblock weg
   * - commercial              => bleibt Entry-Mode, aber Kachel zeigt Hinweis/CTA (kein Wizard)
   */
  const [selectedType, setSelectedType] = useState<LeadGenEntryType | null>(null);

  /**
   * showEntry:
   * - true  => wir zeigen die Kachel (Step01) inkl. linkem Bildblock
   * - false => wir zeigen den Wizard (Step02+)
   *
   * Wichtig: Bei "Auswahl merken" setzen wir beim Exit aus dem Wizard showEntry=true,
   * aber lassen selectedType stehen, damit die Auswahl markiert bleibt.
   */
  const [showEntry, setShowEntry] = useState(true);

  const isWizardType = useMemo(
    () => selectedType === "house" || selectedType === "apartment" || selectedType === "land",
    [selectedType]
  );

  /**
   * Entry-Mode:
   * - initial (selectedType null) immer Entry
   * - bei Gewerbe immer Entry
   * - sonst steuert showEntry, ob wir zurück zur Kachel sind (Auswahl bleibt gemerkt)
   */
  const isEntryMode = !selectedType || selectedType === "commercial" || showEntry;

  /* ============================================================
     PREFETCH (Hover/Focus/Touch) — 0 Delay on click, no initial ballast
  ============================================================ */

  const didPrefetchWizardRef = useRef(false);

  const prefetchWizard = useCallback(() => {
    if (didPrefetchWizardRef.current) return;
    didPrefetchWizardRef.current = true;

    // Prefetch nur den Wizard-Chunk (keine Route, kein SSR)
    void import("./LeadGenWizard.client");
  }, []);

  /**
   * Step01: wir bleiben auf der Startseite und switchen nur lokal in Wizard-Mode.
   * - Für Gewerbe: kein Wizard-Lazy-Load (Kachel zeigt Hinweis + Kontakt-CTA).
   * - Für Haus/Wohnung/Grundstück: Wizard lazy load + initialPropertyType setzen.
   */
  const handleStep01Change = useCallback(
    (v: Step01Value) => {
      const type = (v?.type ?? "unknown") as PropertyTypeCore;
      if (type === "unknown") return;

      props.onStart?.(type as LeadGenEntryType);
      setSelectedType(type as LeadGenEntryType);
      emitLeadEvent({
        event: "lead_start",
        property_type: type,
        source: "entry_step01",
      });

      // Haus/Wohnung/Grundstück -> Wizard zeigen (Bildblock ausblenden)
      if (type === "house" || type === "apartment" || type === "land") {
        // Prefetch nochmal "hart" antriggern, falls Nutzer direkt klickt ohne Hover
        prefetchWizard();
        setShowEntry(false);
        return;
      }

      // Gewerbe -> Entry bleibt stehen
      setShowEntry(true);
    },
    [props, prefetchWizard]
  );

  /**
   * Wenn bereits gewählt, geben wir es zurück in die Kachel (Auswahl markiert).
   */
  const step01Value: Step01Value | undefined = selectedType ? { type: selectedType } : undefined;

  return (
    <section className="w-full" aria-label="Kostenlose Ersteinschätzung starten">
      <div className="w-full">
        <div className={["grid items-stretch gap-6", isEntryMode ? "lg:grid-cols-2" : "lg:grid-cols-1"].join(" ")}>
          {/* Linker Bildblock: NUR im Entry-Mode sichtbar (Step01 / Gewerbe / Rücksprung zur Kachel) */}
          {isEntryMode ? (
            <aside className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-[420px] sm:h-[520px] lg:h-full lg:min-h-[680px]">
                <Image
                  src="/images/immobilienbewertung/immobilienbewertung-aurich-ostfriesland.webp"
                  alt="Digitale Immobilienbewertung in Aurich und Ostfriesland"
                  title="Immobilienbewertung Aurich"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
                  className="object-cover object-[70%_center]"
                  quality={72}
                />
                <div className="absolute inset-x-0 bottom-0">
                  <div
                    className="mx-4 mb-4 rounded-2xl p-6 shadow-lg sm:mx-6 sm:mb-6"
                    style={{ backgroundColor: "rgba(27, 48, 64, 0.95)" }}
                  >
                    <div className="text-sm font-semibold tracking-wide text-white/80">PREIS- UND MARKTEINORDNUNG</div>

                    <div className="mt-2 text-3xl tracking-tight text-white">
                      Online-Bewertung: Was ist meine Immobilie wert?
                    </div>

                    <p className="mt-4 text-base leading-relaxed text-white/85">
                      Frisia Immobilien ordnet deine Immobilie realistisch ein – auf Basis des regionalen Marktes in Aurich und
                      ganz Ostfriesland. Die Bewertung ist kostenfrei, unverbindlich und{" "}
                      <span className="font-semibold text-white">dauert keine 2 Minuten</span>.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}

          {/* Rechter Block: Entry (Step01) ODER Wizard (Step02+) */}
          <div className={isEntryMode ? "flex" : "w-full"}>
            {isEntryMode ? (
              <div className="flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Fortschritt (optisch wie Step01) */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-600">Schritt 1 / 15</div>
                  <div className="text-sm font-medium text-slate-600">7%</div>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: "7%" }} />
                </div>

                <div
                  className="mt-6 flex-1"
                  // ✅ Prefetch passiert erst bei Interaktion (Hover/Focus/Touch)
                  onPointerEnter={prefetchWizard}
                  onFocusCapture={prefetchWizard}
                  onTouchStartCapture={prefetchWizard}
                >
                  {/* Auswahl bleibt gemerkt über step01Value */}
                  <PropertyTypeSection value={step01Value} onChange={handleStep01Change} />
                </div>

                <div className="mt-3 text-xs leading-relaxed text-slate-500">Dauer: ca. 1–2 Minuten.</div>
                <div className="mt-2 text-xs leading-relaxed text-slate-500">
                  Hinweis: Du kannst später jederzeit zurückgehen. Exakte Details klären wir – wenn du möchtest – persönlich.
                </div>
              </div>
            ) : isWizardType ? (




<LeadGenWizard
  layout="embedded"
  initialPropertyType={selectedType as LeadGenWizardPropertyType}
  onReady={() => {
    props.onWizardLoaded?.(selectedType as Exclude<LeadGenEntryType, "commercial">);
    emitLeadEvent({
      event: "lead_wizard_loaded",
      property_type: selectedType,
    });
  }}
  // ✅ Back/Exit: zurück zur Kachel, Auswahl bleibt markiert
  onExitToEntry={() => setShowEntry(true)}
  // ✅ Close: zurück zur Kachel, Auswahl wird zurückgesetzt (keine Markierung)
  onCloseToEntry={() => {
    setSelectedType(null);
    setShowEntry(true);
    requestAnimationFrame(() => {
      document.getElementById("bewertung")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }}
/>






            ) : (
              // Fallback (robust)
              <div className="flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <PropertyTypeSection value={step01Value} onChange={handleStep01Change} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   UI HELPERS
============================================================ */

function WizardLoadingShell() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      style={{ minHeight: 520 }}
    >
      {/* Kopf: Fortschritt (Skeleton) */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded-full bg-slate-100" />
        <div className="h-4 w-10 rounded-full bg-slate-100" />
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[18%] rounded-full bg-slate-200" />
      </div>

      {/* Inhalt: ruhige Skeleton-Flächen */}
      <div className="mt-8 space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-56 rounded-full bg-slate-100" />
          <div className="h-8 w-80 rounded-2xl bg-slate-100" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-4 w-48 rounded-full bg-slate-100" />
          <div className="mt-4 h-10 w-full rounded-xl bg-slate-100" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="h-12 rounded-2xl bg-slate-100" />
            <div className="h-12 rounded-2xl bg-slate-100" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="h-4 w-40 rounded-full bg-slate-200" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-200" />
            <div className="h-3 w-11/12 rounded-full bg-slate-200" />
            <div className="h-3 w-9/12 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Footer: Actions (Skeleton) */}
      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between gap-3">
          <div className="h-11 w-11 rounded-xl bg-slate-100" />
          <div className="h-11 w-44 rounded-xl bg-slate-200" />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="h-3 w-20 rounded-full bg-slate-100" />
          <span className="h-3 w-24 rounded-full bg-slate-100" />
          <span className="h-3 w-64 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
