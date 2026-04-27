"use client";

import dynamic from "next/dynamic";
import { useDeferredHydration } from "@/components/home/useDeferredHydration";

const LeadGenEntryClient = dynamic(() => import("@/components/immobilienbewertung/LeadGenEntry.client"), {
  ssr: false,
  loading: () => <LeadGenPlaceholder />,
});

export default function DeferredLeadGenEntry() {
  const { mountRef, shouldHydrate: shouldLoad } = useDeferredHydration({
    rootMargin: "0px 0px",
    fallbackDelayMs: 20000,
    hashTargets: ["#immobilienbewertung", "#bewertung"],
  });

  return <div ref={mountRef}>{shouldLoad ? <LeadGenEntryClient /> : <LeadGenPlaceholder />}</div>;
}

function LeadGenPlaceholder() {
  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-2" aria-hidden="true">
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm lg:block">
        <div className="h-full min-h-[680px] animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200" />
      </div>

      <div className="flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded-full bg-slate-100" />
          <div className="h-4 w-10 rounded-full bg-slate-100" />
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[7%] rounded-full bg-slate-200" />
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-3">
            <div className="h-3 w-52 rounded-full bg-slate-100" />
            <div className="h-8 w-72 rounded-2xl bg-slate-100" />
            <div className="h-4 w-full max-w-xl rounded-full bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-[210px] rounded-2xl border border-slate-200 bg-slate-50" />
            <div className="h-[210px] rounded-2xl border border-slate-200 bg-slate-50" />
            <div className="h-[210px] rounded-2xl border border-slate-200 bg-slate-50" />
            <div className="h-[210px] rounded-2xl border border-slate-200 bg-slate-50" />
          </div>
        </div>

        <div className="mt-6 h-3 w-32 rounded-full bg-slate-100" />
        <div className="mt-2 h-3 w-72 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}
